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
import { TaskColumn } from './TaskColumn'
import { TaskCard } from './TaskCard'

/**
 * Kanban board with DnD between Todo, Finished (unsubmitted), and Done columns
 * @param {{ todoTasks: Task[], finishedTasks: Task[], doneTasks: Task[], onUpdateTask: Function, onDeleteTask: Function, onOpenDetail: Function }} props
 */
export function KanbanBoard({ todoTasks, finishedTasks, doneTasks, onUpdateTask, onDeleteTask, onOpenDetail }) {
  const [activeTask, setActiveTask] = useState(null)

  // Require 8px movement before drag starts (prevents accidental drags)
  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 8 } })
  )

  const handleDragStart = ({ active }) => {
    setActiveTask(active.data.current?.task ?? null)
  }

  const handleDragEnd = ({ active, over }) => {
    setActiveTask(null)
    if (!over) return

    const task = active.data.current?.task
    const newStatus = over.id // 'todo', 'finished', or 'done'

    // Only update if dropped in a DIFFERENT column
    if (task && task.status !== newStatus) {
      onUpdateTask(task.id, { status: newStatus })
    }
  }

  const handleDragCancel = () => {
    setActiveTask(null)
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={pointerWithin}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-[700px] lg:h-[800px]">
        {/* LEFT COLUMN: TODO (Full Height) */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="h-full"
        >
          <TaskColumn
            id="todo"
            title="Perlu Dikerjakan"
            tasks={todoTasks}
            onDelete={onDeleteTask}
            onOpenDetail={onOpenDetail}
            emptyMessage="Belum ada tugas. Klik tombol + untuk menambah!"
            className="h-full min-h-[600px] lg:min-h-0"
          />
        </motion.div>

        {/* RIGHT COLUMNS: Finished (Top) and Done (Bottom) */}
        <div className="flex flex-col gap-6 h-full">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="flex-1 min-h-[300px] lg:min-h-0"
          >
            <TaskColumn
              id="finished"
              title="Belum Submit"
              tasks={finishedTasks}
              onDelete={onDeleteTask}
              onOpenDetail={onOpenDetail}
              emptyMessage="Belum ada tugas."
              className="h-full"
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="flex-1 min-h-[300px] lg:min-h-0"
          >
            <TaskColumn
              id="done"
              title="Selesai"
              tasks={doneTasks}
              onDelete={onDeleteTask}
              onOpenDetail={onOpenDetail}
              emptyMessage="Tarik tugas ke sini!"
              className="h-full"
            />
          </motion.div>
        </div>
      </div>

      {/* Floating drag preview */}
      <DragOverlay dropAnimation={{ duration: 150, easing: 'cubic-bezier(0.18, 0.67, 0.6, 1.22)' }}>
        {activeTask ? (
          <TaskCard task={activeTask} onDelete={() => {}} isOverlay />
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}
