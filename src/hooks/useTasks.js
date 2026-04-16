import { useState, useEffect, useCallback } from 'react'
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

  const todoTasks = tasks.filter((t) => t.status === 'todo')
  const doneTasks = tasks.filter((t) => t.status === 'done')
  const isLimitReached = todoTasks.length >= effectiveLimit

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
    // Optimistic: update locally first
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, ...updates } : t)))
    try {
      const updatedTask = await apiUpdateTask(id, updates)
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
    doneTasks,
    loading,
    error,
    isLimitReached,
    FREE_TASK_LIMIT,
    taskLimit: effectiveLimit,
    addTask: handleAddTask,
    updateTask: handleUpdateTask,
    deleteTask: handleDeleteTask,
  }
}
