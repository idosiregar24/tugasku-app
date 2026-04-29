import { useDroppable } from '@dnd-kit/core'
import { TaskCard } from './TaskCard'
import { TaskStack } from './TaskStack'
import { Inbox, ListTodo, Hourglass, CheckCircle2 } from 'lucide-react'

/**
 * A droppable Kanban column
 * @param {{ id: 'todo' | 'finished' | 'done', title: string, tasks: import('@/types').Task[], onDelete: Function, onOpenDetail: Function, emptyMessage: string, className?: string }} props
 */
export function TaskColumn({ id, title, tasks, onDelete, onOpenDetail, emptyMessage, className }) {
  const { setNodeRef, isOver } = useDroppable({ id })

  const isTodo = id === 'todo'
  const isFinished = id === 'finished'
  const isDone = id === 'done'

  const getStatusColor = () => {
    if (isTodo) return 'bg-primary'
    if (isFinished) return 'bg-amber-400'
    return 'bg-emerald-500'
  }

  const getBadgeStyle = () => {
    if (isTodo) return 'bg-primary/10 text-primary border-primary/20'
    if (isFinished) return 'bg-amber-400/10 text-amber-400 border-amber-400/20'
    return 'bg-green-400/10 text-green-400 border-green-400/20'
  }

  const getOverStyle = () => {
    if (!isOver) return 'bg-card/40 backdrop-blur-2xl border-border/40 shadow-sm'
    if (isTodo) return 'border-primary/50 bg-primary/5 backdrop-blur-xl'
    if (isFinished) return 'border-amber-400/50 bg-amber-400/5 backdrop-blur-xl'
    return 'border-emerald-500/50 bg-emerald-500/5 backdrop-blur-xl'
  }

  return (
    <div
      ref={setNodeRef}
      className={[
        'flex flex-col rounded-xl border shadow-sm p-4 sm:p-6 transition-all duration-300 relative overflow-hidden',
        getOverStyle(),
        className
      ].join(' ')}
    >
      {/* Column header */}
      <div className="flex items-center gap-2.5 mb-6 relative shrink-0">
        <div className={`w-3 h-3 rounded-full ${getStatusColor()}`} />
        <h2 className="text-lg font-black text-foreground tracking-tight uppercase opacity-80">{title}</h2>
        <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${getBadgeStyle()}`}>
          {tasks.length}
        </span>
      </div>

      {/* Droppable area content */}
      <div className="flex-1 flex flex-col min-h-[300px]">
        {tasks.length === 0 ? (
          <div
            className={`flex flex-col items-center justify-center h-48 gap-3 transition-opacity duration-300 ${isOver ? 'opacity-100' : 'opacity-40'
              }`}
          >
            <div className="text-muted-foreground/50">
              {isOver ? <Inbox className="w-10 h-10" /> : isTodo ? <ListTodo className="w-10 h-10" /> : isFinished ? <Hourglass className="w-10 h-10" /> : <CheckCircle2 className="w-10 h-10" />}
            </div>
            <p className="text-[10px] font-bold text-muted-foreground/60 text-center max-w-[160px] leading-relaxed uppercase tracking-wider">
              {emptyMessage}
            </p>
          </div>
        ) : (
          <div className="space-y-3.5">
            {isDone ? (
              <TaskStack tasks={tasks} onDelete={onDelete} onOpenDetail={onOpenDetail} />
            ) : (
              tasks.map((task) => (
                <div key={task.id}>
                  <TaskCard task={task} onDelete={onDelete} onOpenDetail={onOpenDetail} />
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  )
}
