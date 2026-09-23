import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  DndContext,
  DragOverlay,
  MouseSensor,
  TouchSensor,
  pointerWithin,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import { ListTodo, Hourglass, CheckCircle2 } from 'lucide-react'
import { TaskColumn } from './TaskColumn'
import { TaskCard } from './TaskCard'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import { cn } from '@/lib/utils'

const COLUMNS = [
  { id: 'todo', title: 'Perlu Dikerjakan', short: 'Dikerjakan', icon: ListTodo, empty: 'Belum ada tugas. Ketuk + untuk menambah!' },
  { id: 'finished', title: 'Belum Submit', short: 'Belum Submit', icon: Hourglass, empty: 'Tidak ada tugas yang menunggu submit.' },
  { id: 'done', title: 'Selesai', short: 'Selesai', icon: CheckCircle2, empty: 'Tugas yang sudah disubmit muncul di sini.' },
]

/**
 * Kanban board: drag-and-drop columns on desktop, status tabs on smaller screens
 * @param {{ todoTasks: Task[], finishedTasks: Task[], doneTasks: Task[], onUpdateTask: Function, onDeleteTask: Function, onOpenDetail: Function }} props
 */
export function KanbanBoard({ todoTasks, finishedTasks, doneTasks, onUpdateTask, onDeleteTask, onOpenDetail }) {
  const isDesktop = useMediaQuery('(min-width: 1024px)')
  const [activeTask, setActiveTask] = useState(null)
  const [mobileTab, setMobileTab] = useState('todo')

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 8 } })
  )

  const byStatus = { todo: todoTasks, finished: finishedTasks, done: doneTasks }
  const handleStatusChange = (task, status) => {
    onUpdateTask(task.id, { status }).catch((err) => console.error('Status update failed:', err))
  }

  if (!isDesktop) {
    const column = COLUMNS.find((c) => c.id === mobileTab)
    const tasks = byStatus[mobileTab]
    return (
      <div className="space-y-4">
        <div role="tablist" className="surface grid grid-cols-3 gap-1 p-1 rounded-full">
          {COLUMNS.map((c) => {
            const active = c.id === mobileTab
            return (
              <button
                key={c.id}
                role="tab"
                aria-selected={active}
                onClick={() => setMobileTab(c.id)}
                className={cn(
                  'relative flex items-center justify-center gap-1 h-10 px-1 rounded-full text-xs font-bold transition-colors',
                  active ? 'text-foreground' : 'text-muted-foreground'
                )}
              >
                {active && (
                  <motion.span
                    layoutId="kanban-tab"
                    className="lg-rim !absolute inset-0 rounded-full bg-card/85"
                    transition={{ type: 'spring', stiffness: 500, damping: 40 }}
                  />
                )}
                <span className="relative truncate">{c.short}</span>
                <span className={cn('relative shrink-0 text-[10px] min-w-[18px] h-[18px] px-1 rounded-full flex items-center justify-center tabular-nums', active ? 'bg-foreground text-background' : 'bg-hairline/10')}>
                  {byStatus[c.id].length}
                </span>
              </button>
            )
          })}
        </div>

        {tasks.length === 0 ? (
          <div className="surface flex flex-col items-center justify-center text-center gap-3 py-14 px-6 rounded-[22px]">
            <column.icon className="w-10 h-10 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground max-w-[240px]">{column.empty}</p>
          </div>
        ) : (
          // One glass layer behind the list (cheaper on iPhone than blurring every card)
          <div className="surface rounded-[26px] p-2 space-y-2">
            {tasks.map((task) => (
              <div key={task.id} className="animate-fade-in">
                <TaskCard
                  task={task}
                  draggable={false}
                  onDelete={onDeleteTask}
                  onOpenDetail={onOpenDetail}
                  onStatusChange={handleStatusChange}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }

  const handleDragStart = ({ active }) => {
    setActiveTask(active.data.current?.task ?? null)
  }

  const handleDragEnd = ({ active, over }) => {
    setActiveTask(null)
    if (!over) return
    const task = active.data.current?.task
    const newStatus = over.id
    if (task && task.status !== newStatus) {
      onUpdateTask(task.id, { status: newStatus })
    }
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={pointerWithin}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={() => setActiveTask(null)}
    >
      <div className="grid grid-cols-2 gap-6 h-[760px]">
        <TaskColumn
          id="todo"
          title="Perlu Dikerjakan"
          tasks={todoTasks}
          onDelete={onDeleteTask}
          onOpenDetail={onOpenDetail}
          onStatusChange={handleStatusChange}
          emptyMessage="Belum ada tugas. Klik tombol + untuk menambah!"
          className="h-full"
        />
        <div className="flex flex-col gap-6 h-full min-h-0">
          <TaskColumn
            id="finished"
            title="Belum Submit"
            tasks={finishedTasks}
            onDelete={onDeleteTask}
            onOpenDetail={onOpenDetail}
            onStatusChange={handleStatusChange}
            emptyMessage="Tarik tugas yang sudah dikerjakan ke sini."
            className="flex-1 min-h-0"
          />
          <TaskColumn
            id="done"
            title="Selesai"
            tasks={doneTasks}
            onDelete={onDeleteTask}
            onOpenDetail={onOpenDetail}
            onStatusChange={handleStatusChange}
            emptyMessage="Tarik tugas yang sudah disubmit ke sini."
            className="flex-1 min-h-0"
          />
        </div>
      </div>

      <DragOverlay dropAnimation={{ duration: 150, easing: 'cubic-bezier(0.18, 0.67, 0.6, 1.22)' }}>
        {activeTask ? <TaskCard task={activeTask} onDelete={() => {}} isOverlay /> : null}
      </DragOverlay>
    </DndContext>
  )
}
