import { useDraggable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import { format, differenceInDays, parseISO } from 'date-fns'
import { id as localeId } from 'date-fns/locale'
import { Trash2, GripVertical, Clock, AlertTriangle, CalendarCheck } from 'lucide-react'

/** Priority visual config */
const priorityConfig = {
  High: {
    border: 'border-l-red-500',
    badge: 'bg-red-500/15 text-red-400 border-red-500/30',
    dot: 'bg-red-500',
  },
  Medium: {
    border: 'border-l-amber-400',
    badge: 'bg-amber-400/15 text-amber-400 border-amber-400/30',
    dot: 'bg-amber-400',
  },
  Low: {
    border: 'border-l-blue-400',
    badge: 'bg-blue-400/15 text-blue-400 border-blue-400/30',
    dot: 'bg-blue-400',
  },
}

function DeadlineLabel({ deadline }) {
  // Parse YYYY-MM-DD from Supabase date column
  const deadlineDate = parseISO(deadline)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const diffDays = differenceInDays(deadlineDate, today)
  const formatted = format(deadlineDate, 'dd MMM yyyy', { locale: localeId })

  if (diffDays < 0) {
    return (
      <div className="flex items-center gap-1 text-red-400">
        <AlertTriangle className="w-3 h-3 shrink-0" />
        <span className="text-xs font-semibold">Terlambat {Math.abs(diffDays)} hari</span>
        <span className="text-xs text-red-400/60">· {formatted}</span>
      </div>
    )
  }

  if (diffDays === 0) {
    return (
      <div className="flex items-center gap-1 text-amber-400">
        <Clock className="w-3 h-3 shrink-0" />
        <span className="text-xs font-semibold">Hari ini!</span>
        <span className="text-xs text-amber-400/60">· {formatted}</span>
      </div>
    )
  }

  if (diffDays <= 3) {
    return (
      <div className="flex items-center gap-1 text-orange-400">
        <Clock className="w-3 h-3 shrink-0" />
        <span className="text-xs font-medium">{diffDays} hari lagi</span>
        <span className="text-xs text-orange-400/60">· {formatted}</span>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-1 text-muted-foreground">
      <CalendarCheck className="w-3 h-3 shrink-0" />
      <span className="text-xs">{diffDays} hari lagi · {formatted}</span>
    </div>
  )
}

/**
 * Draggable task card with priority border, deadline label, and delete button
 * @param {{ task: import('@/types').Task, onDelete: (id: string) => void, onOpenDetail?: (task: import('@/types').Task) => void, isOverlay?: boolean }} props
 */
export function TaskCard({ task, onDelete, onOpenDetail, isOverlay = false }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: task.id,
    data: { task, status: task.status },
    disabled: isOverlay,
  })

  const config = priorityConfig[task.priority] ?? priorityConfig.Medium

  const style = isOverlay
    ? {}
    : { transform: CSS.Translate.toString(transform) }

  return (
    <div
      ref={isOverlay ? undefined : setNodeRef}
      style={style}
      onClick={() => !isOverlay && onOpenDetail && onOpenDetail(task)}
      className={[
        'group relative bg-card rounded-xl p-4 border border-border border-l-4',
        config.border,
        'transition-all duration-200',
        isDragging && !isOverlay
          ? 'opacity-30 scale-[0.97] shadow-none'
          : 'hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5',
        isOverlay
          ? 'shadow-2xl shadow-black/60 rotate-[1.5deg] scale-[1.04] ring-2 ring-primary/40 cursor-grabbing'
          : 'cursor-pointer',
      ].join(' ')}
    >
      <div className="flex items-start gap-2.5">
        {/* Drag handle — stopPropagation so card click (open modal) isn't triggered */}
        {!isOverlay && (
          <button
            {...attributes}
            {...listeners}
            onClick={(e) => e.stopPropagation()}
            className="mt-0.5 shrink-0 touch-none p-0.5 rounded text-muted-foreground/40 hover:text-muted-foreground transition-colors"
            aria-label="Drag task"
          >
            <GripVertical className="w-4 h-4" />
          </button>
        )}

        {/* Card content */}
        <div className="flex-1 min-w-0">
          <p
            className={`text-sm font-medium leading-snug ${
              task.status === 'done'
                ? 'line-through text-muted-foreground'
                : 'text-foreground'
            }`}
          >
            {task.title}
          </p>
          <div className="mt-2.5 flex items-center gap-2 flex-wrap">
            {/* Status badge if finished */}
            {task.status === 'finished' && (
              <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-md bg-amber-400/15 text-amber-400 border border-amber-400/20 font-bold uppercase tracking-wider">
                <Clock className="w-2.5 h-2.5" />
                Belum Submit
              </span>
            )}
            {/* Priority badge */}
            <span
              className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border font-medium ${config.badge}`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
              {task.priority}
            </span>
            {/* Deadline */}
            <DeadlineLabel deadline={task.deadline} />
          </div>
        </div>

        {/* Delete button */}
        {!isOverlay && (
          <button
            id={`delete-task-${task.id}`}
            onClick={(e) => {
              e.stopPropagation()
              onDelete(task.id)
            }}
            className="shrink-0 opacity-0 group-hover:opacity-100 transition-all duration-150 p-1.5 rounded-lg hover:bg-destructive/15 hover:text-destructive text-muted-foreground/40"
            aria-label={`Hapus tugas: ${task.title}`}
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  )
}
