import { useDroppable } from '@dnd-kit/core'
import { TaskCard } from './TaskCard'

/**
 * A droppable Kanban column
 * @param {{ id: 'todo' | 'done', title: string, tasks: import('@/types').Task[], onDelete: Function, onOpenDetail: Function, emptyMessage: string }} props
 */
export function TaskColumn({ id, title, tasks, onDelete, onOpenDetail, emptyMessage }) {
  const { setNodeRef, isOver } = useDroppable({ id })

  const isTodo = id === 'todo'

  return (
    <div className="flex flex-col min-h-0">
      {/* Column header */}
      <div className="flex items-center gap-2.5 mb-4 px-1">
        <div
          className={`w-2.5 h-2.5 rounded-full ${
            isTodo ? 'bg-primary shadow-[0_0_8px_hsl(var(--primary)/0.6)]' : 'bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.5)]'
          }`}
        />
        <h2 className="font-semibold text-foreground">{title}</h2>
        <span
          className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${
            isTodo
              ? 'bg-primary/10 text-primary border-primary/20'
              : 'bg-green-400/10 text-green-400 border-green-400/20'
          }`}
        >
          {tasks.length}
        </span>
      </div>

      {/* Droppable zone */}
      <div
        ref={setNodeRef}
        className={[
          'flex-1 min-h-[420px] rounded-2xl border-2 border-dashed p-3 transition-all duration-200',
          isOver
            ? isTodo
              ? 'border-primary/70 bg-primary/5 shadow-inner shadow-primary/5'
              : 'border-green-400/70 bg-green-400/5 shadow-inner shadow-green-400/5'
            : 'border-border/40 bg-secondary/10',
        ].join(' ')}
      >
        {tasks.length === 0 ? (
          <div
            className={`flex flex-col items-center justify-center h-36 gap-2 transition-opacity duration-200 ${
              isOver ? 'opacity-100' : 'opacity-30'
            }`}
          >
            <span className="text-4xl">{isOver ? '📥' : isTodo ? '📋' : '✅'}</span>
            <p className="text-xs text-muted-foreground text-center max-w-[160px]">
              {emptyMessage}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {tasks.map((task) => (
              <div key={task.id} className="animate-fade-in">
                <TaskCard task={task} onDelete={onDelete} onOpenDetail={onOpenDetail} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
