import { useState } from 'react'
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
        <TaskColumn
          id="todo"
          title="Perlu Dikerjakan"
          tasks={todoTasks}
          onDelete={onDeleteTask}
          onOpenDetail={onOpenDetail}
          emptyMessage="Belum ada tugas. Klik tombol + untuk menambah!"
        />
        <TaskColumn
          id="finished"
          title="Belum Submit"
          tasks={finishedTasks}
          onDelete={onDeleteTask}
          onOpenDetail={onOpenDetail}
          emptyMessage="Tugas yang sudah selesai tapi belum dikumpulkan."
        />
        <TaskColumn
          id="done"
          title="Selesai"
          tasks={doneTasks}
          onDelete={onDeleteTask}
          onOpenDetail={onOpenDetail}
          emptyMessage="Drag tugas ke sini jika sudah benar-benar selesai!"
        />
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
