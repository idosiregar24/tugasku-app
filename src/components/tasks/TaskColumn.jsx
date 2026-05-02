import { useDroppable } from '@dnd-kit/core'
import { TaskCard } from './TaskCard'
import { TaskStack } from './TaskStack'
import { Inbox, ListTodo, Hourglass, CheckCircle2 } from 'lucide-react'
import { cn } from '@/lib/utils'

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
        'flex flex-col rounded-[28px] border transition-all duration-700 relative overflow-hidden',
        'bg-card/20 backdrop-blur-3xl border-white/10 dark:border-white/5 shadow-2xl shadow-black/5',
        isOver ? 'ring-2 ring-primary/20 bg-primary/5' : '',
        className
      ].join(' ')}
    >
      {/* Column header */}
      <div className="flex items-center justify-between px-6 pt-6 pb-4 relative shrink-0">
        <div className="flex items-center gap-3">
          <div className={cn("w-2 h-6 rounded-full shadow-lg", getStatusColor())} />
          <h2 className="text-sm font-black text-foreground tracking-[0.15em] uppercase opacity-90">{title}</h2>
        </div>
        <span className={cn("text-[11px] font-black px-2.5 py-0.5 rounded-lg border backdrop-blur-md shadow-sm", getBadgeStyle())}>
          {tasks.length}
        </span>
      </div>

      {/* Droppable area content */}
      <div className="flex-1 flex flex-col min-h-[400px] px-4 pb-6">
        {tasks.length === 0 ? (
          <div
            className={`flex flex-col items-center justify-center h-64 gap-4 transition-opacity duration-500 ${isOver ? 'opacity-100' : 'opacity-20'
              }`}
          >
            <div className="p-6 rounded-[32px] bg-white/5 border border-white/5">
              {isOver ? <Inbox className="w-12 h-12 text-primary" /> : isTodo ? <ListTodo className="w-12 h-12" /> : isFinished ? <Hourglass className="w-12 h-12" /> : <CheckCircle2 className="w-12 h-12" />}
            </div>
            <p className="text-[11px] font-black text-muted-foreground/40 text-center max-w-[180px] leading-relaxed uppercase tracking-[0.2em]">
              {emptyMessage}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {isDone ? (
              <TaskStack tasks={tasks} onDelete={onDelete} onOpenDetail={onOpenDetail} />
            ) : (
              tasks.map((task) => (
                <div key={task.id} className="animate-fade-in">
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
