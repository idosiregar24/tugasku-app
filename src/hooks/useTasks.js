import { useState, useEffect, useCallback } from 'react'
import { differenceInHours, differenceInDays, parseISO } from 'date-fns'
import {
  getTasks,
  addTask as apiAddTask,
  updateTask as apiUpdateTask,
  deleteTask as apiDeleteTask,
} from '@/lib/supabase/tasks'
import { supabase } from '@/lib/supabase/client'
import { FREE_TASK_LIMIT } from '@/types'
import { PRO_TASK_LIMIT } from '@/hooks/useProfile'

/**
 * Hook untuk mengelola tasks dengan optimistic updates dan real-time sync
 * @param {import('@supabase/supabase-js').User | null} user
 * @param {boolean} isPro - Jika true, limit task tidak berlaku
 */
export function useTasks(user, isPro = false) {
  const effectiveLimit = isPro ? PRO_TASK_LIMIT : FREE_TASK_LIMIT
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchTasks = useCallback(async () => {
    if (!user) return
    try {
      setLoading(true)
      setError(null)
      const data = await getTasks(user.id)
      setTasks(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    fetchTasks()
  }, [fetchTasks])

  // Real-time Supabase subscription
  useEffect(() => {
    if (!user) return

    const channel = supabase
      .channel(`tasks-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tasks',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setTasks((prev) => {
              // Avoid duplicates from optimistic update
              if (prev.find((t) => t.id === payload.new.id)) return prev
              return [payload.new, ...prev]
            })
          } else if (payload.eventType === 'UPDATE') {
            setTasks((prev) =>
              prev.map((t) => (t.id === payload.new.id ? payload.new : t))
            )
          } else if (payload.eventType === 'DELETE') {
            setTasks((prev) => prev.filter((t) => t.id !== payload.old.id))
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user])

  // Auto-delete logic: tasks marked 'done' for more than 48 hours
  useEffect(() => {
    if (loading || tasks.length === 0) return

    const now = new Date()
    const tasksToDelete = tasks.filter((task) => {
      if (task.status !== 'done' || !task.completed_at) return false
      const completedAt = parseISO(task.completed_at)
      return differenceInHours(now, completedAt) >= 48
    })

    if (tasksToDelete.length > 0) {
      console.log(`Auto-deleting ${tasksToDelete.length} old completed tasks`)
      tasksToDelete.forEach((task) => handleDeleteTask(task.id))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tasks, loading])

  const todoTasks = tasks.filter((t) => t.status === 'todo')
  const finishedTasks = tasks.filter((t) => t.status === 'finished')
  const doneTasks = tasks.filter((t) => t.status === 'done')
  const isLimitReached = todoTasks.length >= effectiveLimit

  // Notification logic: find overdue or urgent tasks (due in 2 days)
  const notifications = tasks.filter((t) => {
    if (t.status === 'done') return false
    const deadline = parseISO(t.deadline)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    const diffDays = differenceInDays(deadline, today)
    // Notifikasi jika:
    // 1. Terlambat (diffDays < 0)
    // 2. Deadline hari ini (diffDays === 0)
    // 3. Deadline 1-2 hari lagi (diffDays <= 2)
    return diffDays <= 2
  })

  // Trigger browser notification when urgent tasks found
  useEffect(() => {
    if (loading || notifications.length === 0) return
    if (Notification.permission === 'granted') {
      const urgentCount = notifications.length
      sendBrowserNotification(
        'Tugasku: Pengingat Deadline! ⚠️',
        `Ada ${urgentCount} tugas yang perlu perhatian (Deadline dekat / Belum submit).`
      )
    }
  }, [notifications.length, loading])

  // Add task with plan limit check
  const handleAddTask = async (taskData) => {
    if (isLimitReached) {
      throw new Error(`Batas ${effectiveLimit} tugas aktif tercapai. Upgrade ke Pro!`)
    }
    const newTask = await apiAddTask({ ...taskData, user_id: user.id })
    setTasks((prev) => [newTask, ...prev])
    return newTask
  }

  // Update task with optimistic UI
  const handleUpdateTask = async (id, updates) => {
    const existingTask = tasks.find(t => t.id === id)
    const finalUpdates = { ...updates }

    // Logic Tugas Berulang (Recurring)
    if (updates.status === 'done' && existingTask?.is_recurring) {
      const period = existingTask.recurrence_period || 'daily'
      const currentDeadline = parseISO(existingTask.deadline || new Date().toISOString())
      let nextDeadline

      if (period === 'daily') {
        nextDeadline = addDays(currentDeadline, 1)
      } else if (period === 'weekly') {
        const selectedDays = existingTask.recurring_days ? existingTask.recurring_days.split(',').map(Number) : []
        
        if (selectedDays.length > 0) {
          // Cari hari berikutnya dari daftar yang dipilih
          const currentDay = getDay(currentDeadline)
          // Sort selected days to find the next one
          const sortedDays = [...selectedDays].sort((a, b) => a - b)
          const nextDayIndex = sortedDays.find(d => d > currentDay)
          
          if (nextDayIndex !== undefined) {
            // Hari berikutnya masih di minggu yang sama
            const diff = nextDayIndex - currentDay
            nextDeadline = addDays(currentDeadline, diff)
          } else {
            // Hari berikutnya ada di minggu depan (hari pertama dalam daftar)
            const diff = 7 - currentDay + sortedDays[0]
            nextDeadline = addDays(currentDeadline, diff)
          }
        } else {
          nextDeadline = addWeeks(currentDeadline, 1)
        }
      } else if (period === 'monthly') {
        nextDeadline = addMonths(currentDeadline, 1)
      } else {
        nextDeadline = addDays(currentDeadline, 1)
      }

      finalUpdates.deadline = formatDate(nextDeadline, 'yyyy-MM-dd')
      finalUpdates.status = 'todo' // Reset ke todo untuk hari berikutnya
      finalUpdates.completed_at = null
      
      console.log(`Recurring task "${existingTask.title}" moved to ${finalUpdates.deadline}`)
    } else if (updates.status === 'done' || updates.status === 'finished') {
      if (!existingTask?.completed_at) {
        finalUpdates.completed_at = new Date().toISOString()
      }
    } else if (updates.status === 'todo') {
      finalUpdates.completed_at = null // Reset if re-opened
    }

    // Optimistic: update locally first
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, ...finalUpdates } : t)))
    try {
      const updatedTask = await apiUpdateTask(id, finalUpdates)
      setTasks((prev) => prev.map((t) => (t.id === id ? updatedTask : t)))
      return updatedTask
    } catch (err) {
      // Revert on failure
      fetchTasks()
      throw err
    }
  }

  // Delete task with optimistic UI
  const handleDeleteTask = async (id) => {
    setTasks((prev) => prev.filter((t) => t.id !== id))
    try {
      await apiDeleteTask(id)
    } catch (err) {
      fetchTasks()
      throw err
    }
  }

  return {
    tasks,
    todoTasks,
    finishedTasks,
    doneTasks,
    loading,
    error,
    isLimitReached,
    FREE_TASK_LIMIT,
    taskLimit: effectiveLimit,
    addTask: handleAddTask,
    updateTask: handleUpdateTask,
    deleteTask: handleDeleteTask,
    notifications,
    requestNotificationPermission: () => {
      if (!('Notification' in window)) return
      Notification.requestPermission()
    },
  }
}

/**
 * Helper to send browser notification
 * @param {string} title
 * @param {string} body
 */
function sendBrowserNotification(title, body) {
  if (!('Notification' in window) || Notification.permission !== 'granted') return

  try {
    new Notification(title, {
      body,
      icon: '/favicon.ico', // Pastikan icon tersedia
    })
  } catch (err) {
    console.error('Failed to send notification:', err)
  }
}
