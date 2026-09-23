import { useDraggable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import { format, differenceInDays, parseISO } from 'date-fns'
import { id as localeId } from 'date-fns/locale'
import { Trash2, GripVertical, Clock, AlertTriangle, CalendarCheck, Circle, CheckCircle2, Repeat } from 'lucide-react'
import { priorityConfig } from '@/lib/constants'
import { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils'

const NEXT_STATUS = { todo: 'finished', finished: 'done', done: 'todo' }
const STATUS_ACTION = { todo: 'Tandai sudah dikerjakan', finished: 'Tandai sudah submit', done: 'Buka lagi' }

function DeadlineLabel({ deadline }) {
  const deadlineDate = parseISO(deadline)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const diffDays = differenceInDays(deadlineDate, today)
  const formatted = format(deadlineDate, 'dd MMM', { locale: localeId })

  if (diffDays < 0) {
    return (
      <span className="inline-flex items-center gap-1 text-red-600 dark:text-red-400">
        <AlertTriangle className="w-3 h-3 shrink-0" />
        <span className="text-xs font-semibold">Terlambat {Math.abs(diffDays)} hari</span>
      </span>
    )
  }
  if (diffDays === 0) {
    return (
      <span className="inline-flex items-center gap-1 text-warning">
        <Clock className="w-3 h-3 shrink-0" />
        <span className="text-xs font-semibold">Hari ini</span>
      </span>
    )
  }
  if (diffDays <= 3) {
    return (
      <span className="inline-flex items-center gap-1 text-orange-600 dark:text-orange-400">
        <Clock className="w-3 h-3 shrink-0" />
        <span className="text-xs font-medium">{diffDays} hari lagi · {formatted}</span>
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1 text-muted-foreground">
      <CalendarCheck className="w-3 h-3 shrink-0" />
      <span className="text-xs">{formatted}</span>
    </span>
  )
}

function StatusIcon({ status }) {
  if (status === 'done') return <CheckCircle2 className="w-[22px] h-[22px] text-success" />
  if (status === 'finished') return <Clock className="w-[22px] h-[22px] text-warning" />
  return <Circle className="w-[22px] h-[22px]" />
}

/**
 * Draggable task card with one-tap status progression and a two-step delete.
 * @param {{ task: import('@/types').Task, onDelete: (id: string) => void, onOpenDetail?: (task: import('@/types').Task) => void, onStatusChange?: (task: import('@/types').Task, status: string) => void, isOverlay?: boolean, draggable?: boolean }} props
 */
export function TaskCard({ task, onDelete, onOpenDetail, onStatusChange, isOverlay = false, draggable = true }) {
  const [confirmDelete, setConfirmDelete] = useState(false)
  const resetTimer = useRef(null)

  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: task.id,
    data: { task, status: task.status },
    disabled: isOverlay || !draggable,
  })

  useEffect(() => () => clearTimeout(resetTimer.current), [])

  const config = priorityConfig[task.priority] ?? priorityConfig.Medium
  const style = isOverlay ? {} : { transform: CSS.Translate.toString(transform) }

  const handleDeleteClick = (e) => {
    e.stopPropagation()
    if (!confirmDelete) {
      setConfirmDelete(true)
      clearTimeout(resetTimer.current)
      resetTimer.current = setTimeout(() => setConfirmDelete(false), 3000)
      return
    }
    onDelete(task.id)
  }

  const handleStatusClick = (e) => {
    e.stopPropagation()
    onStatusChange?.(task, NEXT_STATUS[task.status] ?? 'todo')
  }

  return (
    <div
      ref={isOverlay ? undefined : setNodeRef}
      style={style}
      onClick={() => !isOverlay && onOpenDetail?.(task)}
      className={cn(
        'lg-rim group rounded-2xl p-3.5 pl-3 border border-l-[3px] transition-[transform,box-shadow,border-color,opacity] duration-200',
        'bg-card/85 border-hairline/[0.06] shadow-[0_6px_18px_-14px_hsl(222_45%_12%/0.5)]',
        'hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-[0_16px_32px_-18px_hsl(222_45%_12%/0.45)]',
        config.border,
        isDragging && !isOverlay && 'opacity-30',
        isOverlay ? 'shadow-2xl shadow-black/60 scale-[1.03] cursor-grabbing border-primary/50 bg-card' : 'cursor-pointer active:scale-[0.99]'
      )}
    >
      <div className="flex items-start gap-2.5">
        {onStatusChange && !isOverlay && (
          <button
            onClick={handleStatusClick}
            className="-m-1.5 p-1.5 shrink-0 rounded-full text-muted-foreground/70 hover:text-primary transition-colors"
            aria-label={STATUS_ACTION[task.status]}
            title={STATUS_ACTION[task.status]}
          >
            <StatusIcon status={task.status} />
          </button>
        )}

        <div className="flex-1 min-w-0">
          <p
            className={cn(
              'text-[15px] sm:text-sm font-semibold leading-snug tracking-tight break-words',
              task.status === 'done' ? 'line-through text-muted-foreground' : 'text-foreground'
            )}
          >
            {task.title}
          </p>
          <div className="mt-2 flex items-center gap-x-2.5 gap-y-1.5 flex-wrap">
            {task.status === 'finished' && (
              <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-md bg-warning/15 text-warning border border-warning/20 font-bold uppercase tracking-wide">
                Belum Submit
              </span>
            )}
            <span className={cn('inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full border font-bold uppercase tracking-wide', config.badge)}>
              <span className={cn('w-1.5 h-1.5 rounded-full', config.dot)} />
              {task.priority}
            </span>
            <DeadlineLabel deadline={task.deadline} />
            {task.is_recurring && <Repeat className="w-3 h-3 text-primary" aria-label="Berulang" />}
          </div>
        </div>

        {!isOverlay && (
          <div className="flex items-center gap-0.5 -mr-1 -mt-1">
            <button
              id={`delete-task-${task.id}`}
              onClick={handleDeleteClick}
              className={cn(
                'shrink-0 transition-all duration-150 p-2 rounded-xl text-xs font-semibold',
                confirmDelete
                  ? 'bg-destructive/15 text-destructive border border-destructive/30 px-2.5'
                  : 'text-muted-foreground/60 hover:bg-destructive/15 hover:text-destructive [@media(hover:hover)_and_(pointer:fine)]:opacity-0 group-hover:opacity-100 focus-visible:opacity-100'
              )}
              aria-label={confirmDelete ? 'Konfirmasi hapus' : `Hapus tugas: ${task.title}`}
            >
              {confirmDelete ? (
                <span className="flex items-center gap-1">
                  <Trash2 className="w-3.5 h-3.5" />
                  Hapus?
                </span>
              ) : (
                <Trash2 className="w-4 h-4" />
              )}
            </button>
            {draggable && (
              <button
                {...attributes}
                {...listeners}
                onClick={(e) => e.stopPropagation()}
                className="hidden lg:block shrink-0 touch-none p-2 rounded-xl text-muted-foreground/40 hover:text-muted-foreground cursor-grab active:cursor-grabbing transition-colors"
                aria-label="Seret tugas"
              >
                <GripVertical className="w-4 h-4" />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
