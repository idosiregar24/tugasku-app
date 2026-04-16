import { useState } from 'react'
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
import { Loader2, Plus, Crown, Sparkles } from 'lucide-react'
import { PRIORITIES } from '@/types'

const priorityEmoji = { Low: '🔵', Medium: '🟡', High: '🔴' }
const priorityDesc = { Low: 'Tidak mendesak', Medium: 'Perlu diperhatikan', High: 'Sangat mendesak' }

/**
 * Form untuk menambah tugas baru, dengan logika SaaS limit
 */
export function TaskForm({ onAdd, isLimitReached, todoCount, freeLimit, onClose }) {
  const today = new Date().toISOString().split('T')[0]
  const [form, setForm] = useState({ title: '', deadline: today, priority: 'Medium' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (isLimitReached) return
    setLoading(true)
    setError('')
    try {
      await onAdd({ ...form, status: 'todo' })
      onClose()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // === Upgrade UI when limit reached ===
  if (isLimitReached) {
    return (
      <div className="space-y-5 py-2 animate-fade-in">
        <div className="text-center space-y-3">
          <div className="w-16 h-16 rounded-2xl bg-amber-400/15 border border-amber-400/30 flex items-center justify-center mx-auto">
            <Crown className="h-8 w-8 text-amber-400" />
          </div>
          <div>
            <h3 className="font-bold text-lg text-foreground">Batas Gratis Tercapai!</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Kamu memiliki{' '}
              <span className="font-semibold text-foreground">{todoCount}</span>
              {' '}dari{' '}
              <span className="font-semibold text-foreground">{freeLimit}</span>
              {' '}tugas aktif pada rencana gratis.
            </p>
          </div>
        </div>

        {/* Upgrade card */}
        <div className="rounded-xl bg-gradient-to-br from-amber-400/8 via-orange-400/8 to-rose-400/8 border border-amber-400/20 p-4 space-y-3">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-amber-400" />
            <span className="text-sm font-semibold text-foreground">Tugasku Pro</span>
          </div>
          <ul className="space-y-1.5">
            {[
              '✅ Tugas tak terbatas',
              '✅ Prioritas & reminder otomatis',
              '✅ Laporan produktivitas',
              '✅ Kolaborasi tim',
              '✅ Dukungan prioritas',
            ].map((item) => (
              <li key={item} className="text-xs text-muted-foreground">
                {item}
              </li>
            ))}
          </ul>
        </div>

        <Button
          id="upgrade-pro-btn"
          className="w-full bg-gradient-to-r from-amber-400 to-orange-500 text-black font-semibold hover:from-amber-500 hover:to-orange-600 shadow-lg shadow-amber-500/20"
        >
          <Crown className="h-4 w-4 mr-2" />
          Upgrade ke Pro — Rp 49.000/bln
        </Button>

        <Button variant="ghost" className="w-full text-muted-foreground" onClick={onClose}>
          Nanti saja
        </Button>
      </div>
    )
  }

  // === Normal add task form ===
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="task-title">
          Nama Tugas <span className="text-destructive">*</span>
        </Label>
        <Input
          id="task-title"
          placeholder="Misal: Kerjakan laporan mingguan"
          value={form.title}
          onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
          required
          maxLength={120}
          autoFocus
        />
        <p className="text-xs text-muted-foreground text-right">
          {form.title.length}/120
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="task-deadline">
          Tanggal Deadline <span className="text-destructive">*</span>
        </Label>
        <Input
          id="task-deadline"
          type="date"
          value={form.deadline}
          onChange={(e) => setForm((p) => ({ ...p, deadline: e.target.value }))}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="task-priority">Prioritas</Label>
        <Select
          value={form.priority}
          onValueChange={(val) => setForm((p) => ({ ...p, priority: val }))}
        >
          <SelectTrigger id="task-priority">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {PRIORITIES.map((p) => (
              <SelectItem key={p} value={p}>
                <span className="flex items-center gap-2">
                  <span>{priorityEmoji[p]}</span>
                  <span>{p}</span>
                  <span className="text-muted-foreground text-xs">— {priorityDesc[p]}</span>
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
          {error}
        </div>
      )}

      {/* Free plan indicator */}
      <div className="flex items-center justify-between text-xs text-muted-foreground pt-1">
        <span>Sisa slot tugas aktif:</span>
        <span className={`font-semibold ${todoCount >= freeLimit - 3 ? 'text-amber-400' : 'text-foreground'}`}>
          {freeLimit - todoCount} dari {freeLimit}
        </span>
      </div>

      <div className="flex gap-3 pt-1">
        <Button type="button" variant="outline" className="flex-1" onClick={onClose}>
          Batal
        </Button>
        <Button id="task-submit-btn" type="submit" className="flex-1" disabled={loading}>
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <Plus className="h-4 w-4 mr-2" />
          )}
          {loading ? 'Menyimpan...' : 'Tambah Tugas'}
        </Button>
      </div>
    </form>
  )
}
