import { useDroppable } from '@dnd-kit/core'
import { TaskCard } from './TaskCard'
import { TaskStack } from './TaskStack'
import { Inbox, ListTodo, Hourglass, CheckCircle2 } from 'lucide-react'
import { cn } from '@/lib/utils'

const COLUMN_STYLE = {
  todo: { accent: 'bg-primary', badge: 'bg-primary/10 text-primary border-primary/20', over: 'ring-primary/40 bg-primary/[0.04]', Icon: ListTodo },
  finished: { accent: 'bg-warning', badge: 'bg-warning/10 text-warning border-warning/20', over: 'ring-warning/40 bg-warning/[0.04]', Icon: Hourglass },
  done: { accent: 'bg-success', badge: 'bg-success/10 text-success border-success/20', over: 'ring-success/40 bg-success/[0.04]', Icon: CheckCircle2 },
}

/**
 * A droppable Kanban column with its own scroll area
 * @param {{ id: 'todo' | 'finished' | 'done', title: string, tasks: import('@/types').Task[], onDelete: Function, onOpenDetail: Function, onStatusChange?: Function, emptyMessage: string, className?: string }} props
 */
export function TaskColumn({ id, title, tasks, onDelete, onOpenDetail, onStatusChange, emptyMessage, className }) {
  const { setNodeRef, isOver } = useDroppable({ id })
  const style = COLUMN_STYLE[id]

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'surface flex flex-col rounded-[26px] relative overflow-hidden transition-[box-shadow,background-color] duration-300',
        isOver && `ring-2 ${style.over}`,
        className
      )}
    >
      <div className="flex items-center justify-between px-5 pt-4 pb-3 shrink-0">
        <div className="flex items-center gap-2.5">
          <span className={cn('w-2 h-2 rounded-full', style.accent)} />
          <h2 className="eyebrow text-foreground/80">{title}</h2>
        </div>
        <span className={cn('text-xs font-semibold tabular-nums px-2 py-0.5 rounded-md border', style.badge)}>
          {tasks.length}
        </span>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto px-3 pb-4">
        {tasks.length === 0 ? (
          <div className={cn('flex flex-col items-center justify-center h-full min-h-[160px] gap-3 transition-opacity duration-300', isOver ? 'opacity-100' : 'opacity-50')}>
            {isOver ? <Inbox className="w-10 h-10 text-primary" /> : <style.Icon className="w-10 h-10 text-muted-foreground/50" />}
            <p className="text-xs text-muted-foreground text-center max-w-[200px] leading-relaxed">{emptyMessage}</p>
          </div>
        ) : id === 'done' ? (
          <TaskStack tasks={tasks} onDelete={onDelete} onOpenDetail={onOpenDetail} onStatusChange={onStatusChange} />
        ) : (
          <div className="space-y-2.5 p-1">
            {tasks.map((task) => (
              <div key={task.id} className="animate-fade-in">
                <TaskCard task={task} onDelete={onDelete} onOpenDetail={onOpenDetail} onStatusChange={onStatusChange} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
