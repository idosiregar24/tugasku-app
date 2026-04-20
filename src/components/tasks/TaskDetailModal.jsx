import { useState, useEffect } from 'react'
import { format, differenceInDays, parseISO } from 'date-fns'
import { id as localeId } from 'date-fns/locale'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import {
  Loader2,
  Trash2,
  Save,
  CheckCircle2,
  Circle,
  AlertTriangle,
  Clock,
  CalendarCheck,
  Flag,
  Calendar,
  Info,
  Pencil,
} from 'lucide-react'
import { PRIORITIES } from '@/types'

const priorityConfig = {
  High: {
    border: 'border-l-red-500',
    badge: 'bg-red-500/15 text-red-400 border-red-500/30',
    dot: 'bg-red-500',
    glow: 'shadow-red-500/10',
    label: 'High – Sangat mendesak',
    emoji: '🔴',
  },
  Medium: {
    border: 'border-l-amber-400',
    badge: 'bg-amber-400/15 text-amber-400 border-amber-400/30',
    dot: 'bg-amber-400',
    glow: 'shadow-amber-400/10',
    label: 'Medium – Perlu diperhatikan',
    emoji: '🟡',
  },
  Low: {
    border: 'border-l-blue-400',
    badge: 'bg-blue-400/15 text-blue-400 border-blue-400/30',
    dot: 'bg-blue-400',
    glow: 'shadow-blue-400/10',
    label: 'Low – Tidak mendesak',
    emoji: '🔵',
  },
}

function DeadlineInfo({ deadline }) {
  const deadlineDate = parseISO(deadline)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const diffDays = differenceInDays(deadlineDate, today)
  const formatted = format(deadlineDate, 'EEEE, dd MMMM yyyy', { locale: localeId })

  if (diffDays < 0) {
    return (
      <div className="flex items-start gap-3 p-3 rounded-xl bg-red-500/10 border border-red-500/20">
        <AlertTriangle className="h-4 w-4 text-red-400 mt-0.5 shrink-0" />
        <div>
          <p className="text-sm font-semibold text-red-400">
            Terlambat {Math.abs(diffDays)} hari
          </p>
          <p className="text-xs text-red-400/70 mt-0.5">{formatted}</p>
        </div>
      </div>
    )
  }

  if (diffDays === 0) {
    return (
      <div className="flex items-start gap-3 p-3 rounded-xl bg-amber-400/10 border border-amber-400/20">
        <Clock className="h-4 w-4 text-amber-400 mt-0.5 shrink-0" />
        <div>
          <p className="text-sm font-semibold text-amber-400">Deadline hari ini!</p>
          <p className="text-xs text-amber-400/70 mt-0.5">{formatted}</p>
        </div>
      </div>
    )
  }

  if (diffDays <= 3) {
    return (
      <div className="flex items-start gap-3 p-3 rounded-xl bg-orange-400/10 border border-orange-400/20">
        <Clock className="h-4 w-4 text-orange-400 mt-0.5 shrink-0" />
        <div>
          <p className="text-sm font-semibold text-orange-400">
            {diffDays} hari lagi
          </p>
          <p className="text-xs text-orange-400/70 mt-0.5">{formatted}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-start gap-3 p-3 rounded-xl bg-secondary border border-border">
      <CalendarCheck className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
      <div>
        <p className="text-sm font-medium text-foreground">{diffDays} hari lagi</p>
        <p className="text-xs text-muted-foreground mt-0.5">{formatted}</p>
      </div>
    </div>
  )
}

/**
 * Modal detail tugas — view + edit + delete + toggle status
 * @param {{ task: import('@/types').Task | null, open: boolean, onClose: () => void, onUpdate: Function, onDelete: Function }} props
 */
export function TaskDetailModal({ task, open, onClose, onUpdate, onDelete }) {
  const [form, setForm] = useState({ title: '', deadline: '', priority: 'Medium', notes: '' })
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [togglingStatus, setTogglingStatus] = useState(false)

  // Sync form when task changes
  useEffect(() => {
    if (task) {
      setForm({
        title: task.title,
        deadline: task.deadline,
        priority: task.priority,
        notes: task.notes || '',
      })
      setConfirmDelete(false)
    }
  }, [task])

  if (!task) return null

  const config = priorityConfig[task.priority] ?? priorityConfig.Medium

  const hasChanges =
    form.title !== task.title ||
    form.deadline !== task.deadline ||
    form.priority !== task.priority ||
    form.notes !== (task.notes || '')

  const createdAt = format(new Date(task.created_at), 'dd MMM yyyy, HH:mm', {
    locale: localeId,
  })

  const handleSave = async () => {
    if (!hasChanges || !form.title.trim()) return
    setSaving(true)
    try {
      await onUpdate(task.id, {
        title: form.title.trim(),
        deadline: form.deadline,
        priority: form.priority,
        notes: form.notes.trim(),
      })
      onClose()
    } finally {
      setSaving(false)
    }
  }

  const handleToggleStatus = async () => {
    setTogglingStatus(true)
    try {
      let newStatus = 'todo'
      if (task.status === 'todo') newStatus = 'finished'
      else if (task.status === 'finished') newStatus = 'done'
      else newStatus = 'todo'

      await onUpdate(task.id, { status: newStatus })
      onClose()
    } finally {
      setTogglingStatus(false)
    }
  }

  const handleDelete = async () => {
    if (!confirmDelete) {
      setConfirmDelete(true)
      return
    }
    setDeleting(true)
    try {
      await onDelete(task.id)
      onClose()
    } finally {
      setDeleting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-lg p-0 overflow-hidden gap-0">
        {/* Colored top accent bar */}
        <div className={`h-1 w-full ${config.dot.replace('bg-', 'bg-')}`} />

        {/* Header */}
        <div className="px-6 pt-5 pb-4 border-b border-border">
          <DialogHeader>
            <div className="flex items-start gap-3 pr-6">
              {/* Status icon */}
              <button
                onClick={handleToggleStatus}
                disabled={togglingStatus}
                title="Ganti status tugas"
                className="mt-0.5 shrink-0 text-muted-foreground hover:text-primary transition-colors disabled:opacity-50"
              >
                {togglingStatus ? (
                  <Loader2 className="h-5 w-5 animate-spin text-primary" />
                ) : task.status === 'done' ? (
                  <CheckCircle2 className="h-5 w-5 text-green-400" />
                ) : task.status === 'finished' ? (
                  <Clock className="h-5 w-5 text-amber-400" />
                ) : (
                  <Circle className="h-5 w-5" />
                )}
              </button>

              <div className="flex-1 min-w-0">
                <DialogTitle className="text-base font-semibold leading-snug text-foreground">
                  {task.title}
                </DialogTitle>
                <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                  {/* Status badge */}
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full border font-medium ${
                      task.status === 'done'
                        ? 'bg-green-400/15 text-green-400 border-green-400/30'
                        : task.status === 'finished'
                        ? 'bg-amber-400/15 text-amber-400 border-amber-400/30'
                        : 'bg-primary/15 text-primary border-primary/30'
                    }`}
                  >
                    {task.status === 'done'
                      ? '✅ Selesai (Submit)'
                      : task.status === 'finished'
                      ? '⏳ Selesai (Belum Submit)'
                      : '📝 Dikerjakan'}
                  </span>
                  {/* Priority badge */}
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full border font-medium ${config.badge}`}
                  >
                    <span className="mr-1">{config.emoji}</span>
                    {task.priority}
                  </span>
                </div>
              </div>
            </div>
          </DialogHeader>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-5 max-h-[60vh] overflow-y-auto">
          {/* Deadline info display */}
          <DeadlineInfo deadline={form.deadline} />

          {/* Divider */}
          <div className="border-t border-border/60" />

          {/* Edit: Title */}
          <div className="space-y-1.5">
            <Label htmlFor="detail-title" className="flex items-center gap-1.5 text-xs text-muted-foreground uppercase tracking-wide">
              <Pencil className="h-3 w-3" /> Nama Tugas
            </Label>
            <Input
              id="detail-title"
              value={form.title}
              onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
              maxLength={120}
              className="text-sm"
            />
          </div>

          {/* Edit: Deadline */}
          <div className="space-y-1.5">
            <Label htmlFor="detail-deadline" className="flex items-center gap-1.5 text-xs text-muted-foreground uppercase tracking-wide">
              <Calendar className="h-3 w-3" /> Tanggal Deadline
            </Label>
            <Input
              id="detail-deadline"
              type="date"
              value={form.deadline}
              onChange={(e) => setForm((p) => ({ ...p, deadline: e.target.value }))}
              className="text-sm"
            />
          </div>

          {/* Edit: Priority */}
          <div className="space-y-1.5">
            <Label htmlFor="detail-priority" className="flex items-center gap-1.5 text-xs text-muted-foreground uppercase tracking-wide">
              <Flag className="h-3 w-3" /> Prioritas
            </Label>
            <Select
              value={form.priority}
              onValueChange={(val) => setForm((p) => ({ ...p, priority: val }))}
            >
              <SelectTrigger id="detail-priority" className="text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PRIORITIES.map((p) => (
                  <SelectItem key={p} value={p}>
                    <span className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${priorityConfig[p].dot}`} />
                      <span>{priorityConfig[p].label}</span>
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Edit: Notes */}
          <div className="space-y-1.5">
            <Label htmlFor="detail-notes" className="flex items-center gap-1.5 text-xs text-muted-foreground uppercase tracking-wide">
              <Pencil className="h-3 w-3" /> Catatan
            </Label>
            <Textarea
              id="detail-notes"
              value={form.notes}
              onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
              maxLength={500}
              className="text-sm resize-none min-h-[100px]"
              placeholder="Tidak ada catatan..."
            />
          </div>

          {/* Meta info */}
          <div className="flex items-center gap-2 p-3 rounded-xl bg-muted/30 border border-border/40">
            <Info className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
            <p className="text-xs text-muted-foreground">
              Dibuat pada <span className="font-medium text-foreground">{createdAt}</span>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-border bg-secondary/20 flex items-center justify-between gap-3">
          {/* Delete */}
          <div>
            {confirmDelete ? (
              <div className="flex items-center gap-2">
                <span className="text-xs text-destructive font-medium">Yakin hapus?</span>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={handleDelete}
                  disabled={deleting}
                  className="h-7 text-xs px-3"
                >
                  {deleting ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Ya, Hapus'}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setConfirmDelete(false)}
                  className="h-7 text-xs px-3"
                >
                  Batal
                </Button>
              </div>
            ) : (
              <Button
                id="delete-task-detail-btn"
                size="sm"
                variant="ghost"
                onClick={handleDelete}
                className="h-8 text-xs text-muted-foreground hover:text-destructive hover:bg-destructive/10 flex items-center gap-1.5"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Hapus Tugas
              </Button>
            )}
          </div>

          {/* Toggle status + Save */}
          <div className="flex items-center gap-2">
            <Button
              id="toggle-status-btn"
              size="sm"
              variant="outline"
              onClick={handleToggleStatus}
              disabled={togglingStatus}
              className="h-8 text-xs flex items-center gap-1.5"
            >
              {togglingStatus ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : task.status === 'done' ? (
                <>
                  <Circle className="h-3.5 w-3.5" />
                  Buka Lagi (Todo)
                </>
              ) : task.status === 'finished' ? (
                <>
                  <CheckCircle2 className="h-3.5 w-3.5 text-green-400" />
                  Tandai Submit (Done)
                </>
              ) : (
                <>
                  <Clock className="h-3.5 w-3.5 text-amber-400" />
                  Selesai (Belum Submit)
                </>
              )}
            </Button>

            <Button
              id="save-task-detail-btn"
              size="sm"
              onClick={handleSave}
              disabled={!hasChanges || saving || !form.title.trim()}
              className="h-8 text-xs flex items-center gap-1.5"
            >
              {saving ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Save className="h-3.5 w-3.5" />
              )}
              Simpan
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
