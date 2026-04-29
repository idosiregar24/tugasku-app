import { useDraggable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import { motion } from 'framer-motion'
import { format, differenceInDays, parseISO } from 'date-fns'
import { id as localeId } from 'date-fns/locale'
import { Trash2, GripVertical, Clock, AlertTriangle, CalendarCheck } from 'lucide-react'
import { priorityConfig } from '@/lib/constants'
import { useState } from 'react'
import { cn } from '@/lib/utils'

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
 * Draggable task card with priority border, deadline label, and delete button (with confirm)
 * @param {{ task: import('@/types').Task, onDelete: (id: string) => void, onOpenDetail?: (task: import('@/types').Task) => void, isOverlay?: boolean }} props
 */
export function TaskCard({ task, onDelete, onOpenDetail, isOverlay = false }) {
  const [confirmDelete, setConfirmDelete] = useState(false)

  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: task.id,
    data: { task, status: task.status },
    disabled: isOverlay,
  })

  const config = priorityConfig[task.priority] ?? priorityConfig.Medium

  const style = isOverlay
    ? {}
    : { transform: CSS.Translate.toString(transform) }

  const handleDeleteClick = (e) => {
    e.stopPropagation()
    if (!confirmDelete) {
      setConfirmDelete(true)
      // Auto-reset after 3 seconds
      setTimeout(() => setConfirmDelete(false), 3000)
      return
    }
    onDelete(task.id)
  }

  return (
    <motion.div
      ref={isOverlay ? undefined : setNodeRef}
      style={style}
      onClick={() => !isOverlay && onOpenDetail && onOpenDetail(task)}
      whileHover={!isOverlay ? { y: -2, scale: 1.01 } : {}}
      className={cn(
        'group relative rounded-[24px] p-5 border interactive-card',
        'bg-card/80 shadow-sm border-border/50 hover:border-primary/50 hover:shadow-lg',
        config.border,
        'transition-all duration-300 backdrop-blur-xl',
        isDragging && !isOverlay ? 'opacity-30 scale-[0.97]' : '',
        isOverlay ? 'shadow-2xl shadow-black/60 scale-[1.05] cursor-grabbing border-primary/50' : 'cursor-pointer'
      )}
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
            className={`text-sm font-semibold leading-snug tracking-tight ${task.status === 'done'
                ? 'line-through text-muted-foreground'
                : 'text-foreground'
              }`}
          >
            {task.title}
          </p>
          <div className="mt-3 flex items-center gap-2 flex-wrap">
            {/* Status badge if finished */}
            {task.status === 'finished' && (
              <span className="inline-flex items-center gap-1 text-[9px] px-1.5 py-0.5 rounded-md bg-amber-400/15 text-amber-400 border border-amber-400/20 font-black uppercase tracking-widest">
                <Clock className="w-2.5 h-2.5" />
                Belum Submit
              </span>
            )}
            {/* Priority badge */}
            <span
              className={`inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full border font-bold uppercase tracking-wider ${config.badge}`}
            >
              <span className={`w-1 h-1 rounded-full ${config.dot}`} />
              {task.priority}
            </span>
            {/* Deadline */}
            <DeadlineLabel deadline={task.deadline} />
          </div>
        </div>

        {/* Delete button with confirm */}
        {!isOverlay && (
          <button
            id={`delete-task-${task.id}`}
            onClick={handleDeleteClick}
            className={[
              'shrink-0 transition-all duration-150 p-1.5 rounded-lg text-xs font-semibold',
              confirmDelete
                ? 'opacity-100 bg-destructive/20 text-destructive border border-destructive/30 px-2 scale-110'
                : 'opacity-0 group-hover:opacity-100 hover:bg-destructive/15 hover:text-destructive text-muted-foreground/40',
            ].join(' ')}
            aria-label={confirmDelete ? 'Konfirmasi hapus' : `Hapus tugas: ${task.title}`}
          >
            {confirmDelete ? (
              <span className="flex items-center gap-1">
                <Trash2 className="w-3 h-3" />
                Hapus?
              </span>
            ) : (
              <Trash2 className="w-3.5 h-3.5" />
            )}
          </button>
        )}
      </div>
    </motion.div>
  )
}
