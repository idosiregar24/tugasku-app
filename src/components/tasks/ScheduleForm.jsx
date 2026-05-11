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
import { Textarea } from '@/components/ui/textarea'
import { 
  Loader2, 
  Plus, 
  Crown, 
  Sparkles, 
  Repeat, 
  Calendar as CalendarIcon,
  Clock,
  AlertCircle
} from 'lucide-react'
import { Switch } from '@/components/ui/switch'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

const priorityColor = { Low: 'bg-blue-400', Medium: 'bg-yellow-400', High: 'bg-red-400' }

/**
 * Form khusus untuk menambah Jadwal/Schedule baru
 * Terpisah dari TaskForm, fokus pada waktu mulai & selesai
 */
export function ScheduleForm({ onAdd, isLimitReached, todoCount, freeLimit, onClose }) {
  const today = new Date().toISOString().split('T')[0]
  const [form, setForm] = useState({ 
    title: '', 
    deadline: today, 
    priority: 'Medium', 
    notes: '',
    start_time: '',
    end_time: '',
    task_type: 'schedule',
    is_recurring: false,
    recurrence_period: 'daily',
    recurring_days: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [timeError, setTimeError] = useState('')

  const validateTime = () => {
    if (!form.start_time) {
      setTimeError('Waktu mulai wajib diisi untuk jadwal')
      return false
    }
    if (!form.end_time) {
      setTimeError('Waktu selesai wajib diisi untuk jadwal')
      return false
    }
    if (form.start_time >= form.end_time) {
      setTimeError('Waktu selesai harus setelah waktu mulai')
      return false
    }
    setTimeError('')
    return true
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (isLimitReached) return
    if (!form.title.trim()) return
    if (!validateTime()) return

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

        <div className="rounded-xl bg-gradient-to-br from-amber-400/8 via-orange-400/8 to-rose-400/8 border border-amber-400/20 p-4 space-y-3">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-amber-400" />
            <span className="text-sm font-semibold text-foreground">Tugasku Pro</span>
          </div>
          <ul className="space-y-1.5">
            {[
              '✅ Jadwal tak terbatas',
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

  // === Single-page form for schedule ===
  return (
    <div className="space-y-3 py-1">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Header badge */}
        <div className="flex items-center gap-2 justify-center">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/20">
            <CalendarIcon className="w-3.5 h-3.5 text-violet-400" />
            <span className="text-[10px] font-black text-violet-400 uppercase tracking-widest">Mode Jadwal</span>
          </div>
        </div>

        {/* Nama Kegiatan */}
        <div className="space-y-2">
          <Label htmlFor="schedule-title">Nama Kegiatan <span className="text-destructive">*</span></Label>
          <Input
            id="schedule-title"
            placeholder="Misal: Meeting Tim, Gym, Kuliah..."
            value={form.title}
            onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
            required
            maxLength={120}
            autoFocus
          />
          <p className="text-[10px] text-muted-foreground text-right uppercase tracking-wider font-medium">
            {form.title.length}/120
          </p>
        </div>

        {/* Tanggal */}
        <div className="space-y-2">
          <Label htmlFor="schedule-date">Tanggal <span className="text-destructive">*</span></Label>
          <Input
            id="schedule-date"
            type="date"
            value={form.deadline}
            onChange={(e) => setForm((p) => ({ ...p, deadline: e.target.value }))}
            required
          />
        </div>

        {/* Waktu Mulai & Selesai — WAJIB */}
        <div className="p-4 rounded-2xl bg-violet-500/5 border border-violet-500/15 space-y-3">
          <div className="flex items-center gap-2 mb-1">
            <Clock className="w-4 h-4 text-violet-400" />
            <span className="text-xs font-bold text-violet-400 uppercase tracking-wider">Waktu Kegiatan</span>
            <span className="text-[10px] text-destructive font-bold ml-auto">* Wajib</span>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="schedule-start-time" className="text-xs">Mulai</Label>
              <Input
                id="schedule-start-time"
                type="time"
                value={form.start_time}
                onChange={(e) => { setForm((p) => ({ ...p, start_time: e.target.value })); setTimeError('') }}
                required
                className={cn(timeError && !form.start_time && "border-destructive")}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="schedule-end-time" className="text-xs">Selesai</Label>
              <Input
                id="schedule-end-time"
                type="time"
                value={form.end_time}
                onChange={(e) => { setForm((p) => ({ ...p, end_time: e.target.value })); setTimeError('') }}
                required
                className={cn(timeError && !form.end_time && "border-destructive")}
              />
            </div>
          </div>
          {timeError && (
            <div className="flex items-center gap-1.5 text-destructive text-[11px] font-medium">
              <AlertCircle className="w-3 h-3" />
              {timeError}
            </div>
          )}
        </div>

        {/* Prioritas */}
        <div className="space-y-2">
          <Label htmlFor="schedule-priority">Prioritas</Label>
          <Select
            value={form.priority}
            onValueChange={(val) => setForm((p) => ({ ...p, priority: val }))}
          >
            <SelectTrigger id="schedule-priority">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {['Low', 'Medium', 'High'].map((p) => (
                <SelectItem key={p} value={p}>
                  <span className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${priorityColor[p]}`} />
                    <span>{p}</span>
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Recurring Toggle */}
        <div className="space-y-2 pt-2 border-t border-border/50">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-sm font-bold flex items-center gap-2">
                <Repeat className="w-3.5 h-3.5 text-violet-400" /> Jadwal Berulang
              </Label>
              <p className="text-[10px] text-muted-foreground">Aktifkan untuk kegiatan rutin</p>
            </div>
            <Switch 
              checked={form.is_recurring}
              onCheckedChange={(val) => setForm(p => ({ ...p, is_recurring: val }))}
            />
          </div>

          {form.is_recurring && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="space-y-2 overflow-hidden"
            >
              <Label htmlFor="schedule-recurrence" className="text-xs text-muted-foreground">Ulangi Setiap</Label>
              <Select
                value={form.recurrence_period}
                onValueChange={(val) => setForm(p => ({ ...p, recurrence_period: val }))}
              >
                <SelectTrigger id="schedule-recurrence" className="h-9 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Harian (Setiap Hari)</SelectItem>
                  <SelectItem value="weekly">Mingguan (Pilih Hari)</SelectItem>
                  <SelectItem value="monthly">Bulanan (Setiap Bulan)</SelectItem>
                </SelectContent>
              </Select>

              {form.recurrence_period === 'weekly' && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-2 mt-3"
                >
                  <Label className="text-[10px] text-muted-foreground uppercase font-bold">Pilih Hari</Label>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { l: 'M', v: 0 }, { l: 'S', v: 1 }, { l: 'S', v: 2 }, 
                      { l: 'R', v: 3 }, { l: 'K', v: 4 }, { l: 'J', v: 5 }, { l: 'S', v: 6 }
                    ].map(day => {
                      const daysArr = form.recurring_days ? form.recurring_days.split(',') : []
                      const isActive = daysArr.includes(day.v.toString())
                      
                      return (
                        <button
                          key={day.v}
                          type="button"
                          onClick={() => {
                            let newDays = isActive 
                              ? daysArr.filter(d => d !== day.v.toString())
                              : [...daysArr, day.v.toString()]
                            setForm(p => ({ ...p, recurring_days: newDays.sort().join(',') }))
                          }}
                          className={cn(
                            "w-8 h-8 rounded-full text-[10px] font-bold border transition-all",
                            isActive 
                              ? "bg-violet-500 border-violet-500 text-white shadow-lg shadow-violet-500/20" 
                              : "bg-white/5 border-white/10 text-muted-foreground hover:border-violet-500/50"
                          )}
                        >
                          {day.l}
                        </button>
                      )
                    })}
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}
        </div>

        {/* Catatan */}
        <div className="space-y-2">
          <Label htmlFor="schedule-notes">Catatan (Opsional)</Label>
          <Textarea
            id="schedule-notes"
            placeholder="Detail kegiatan, lokasi, dll..."
            value={form.notes}
            onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
            maxLength={500}
            className="resize-none min-h-[60px]"
          />
          <p className="text-[10px] text-muted-foreground text-right uppercase tracking-wider font-medium">
            {form.notes.length}/500
          </p>
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
            {error}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 pt-2">
          <Button
            type="button"
            variant="ghost"
            className="flex-1 h-11 text-muted-foreground"
            onClick={onClose}
            disabled={loading}
          >
            Batal
          </Button>

          <Button
            id="schedule-submit-btn"
            type="submit"
            className="flex-1 h-11 bg-violet-600 hover:bg-violet-700 text-white"
            disabled={loading || !form.title.trim()}
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <CalendarIcon className="h-4 w-4 mr-2" />
            )}
            {loading ? 'Menyimpan...' : 'Tambah Jadwal'}
          </Button>
        </div>

        {/* Footer info */}
        <div className="flex items-center justify-between text-[10px] text-muted-foreground pt-1 border-t border-border/50">
          <span>Sisa slot aktif:</span>
          <span className={`font-semibold ${todoCount >= freeLimit - 3 ? 'text-amber-400' : 'text-foreground'}`}>
            {freeLimit - todoCount} dari {freeLimit}
          </span>
        </div>
      </form>
    </div>
  )
}
