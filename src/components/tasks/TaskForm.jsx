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
  RefreshCw, 
  Repeat, 
  Calendar as CalendarIcon 
} from 'lucide-react'
import { Switch } from '@/components/ui/switch'
import { motion } from 'framer-motion'
import { PRIORITIES } from '@/types'

const priorityColor = { Low: 'bg-blue-400', Medium: 'bg-yellow-400', High: 'bg-red-400' }
const priorityDesc = { Low: 'Tidak mendesak', Medium: 'Perlu diperhatikan', High: 'Sangat mendesak' }

/**
 * Form untuk menambah tugas baru, dengan logika SaaS limit dan multi-step wizard
 */
export function TaskForm({ onAdd, isLimitReached, todoCount, freeLimit, onClose, defaultType = 'task' }) {
  const today = new Date().toISOString().split('T')[0]
  const [step, setStep] = useState(1)
  const [form, setForm] = useState({ 
    title: '', 
    deadline: today, 
    priority: 'Medium', 
    notes: '',
    start_time: '',
    end_time: '',
    task_type: defaultType,
    is_recurring: false,
    recurrence_period: 'daily',
    recurring_days: '' // format: "1,3,5" (Minggu=0, Senin=1, ...)
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const nextStep = () => {
    if (step === 1 && !form.title.trim()) return
    if (step === 2 && !form.deadline) return
    setStep(step + 1)
  }

  const prevStep = () => setStep(step - 1)

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

  // === Multi-step wizard form ===
  return (
    <div className="space-y-6 py-2">
      {/* Step Indicators */}
      <div className="flex items-center justify-center gap-2 mb-2">
        {[1, 2, 3].map((s) => (
          <div
            key={s}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              step === s
                ? 'w-8 bg-primary'
                : step > s
                ? 'w-4 bg-primary/40'
                : 'w-4 bg-secondary'
            }`}
          />
        ))}
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-5"
        onKeyDown={(e) => {
          if (e.key === 'Enter' && step < 3) {
            e.preventDefault()
            nextStep()
          }
        }}
      >
        {step === 1 && (
          <div className="space-y-3 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="space-y-1">
              <h3 className="text-sm font-semibold text-foreground">
                Langkah 1: {form.task_type === 'schedule' ? 'Apa agenda jadwalmu?' : 'Apa yang ingin kamu kerjakan?'}
              </h3>
              <p className="text-xs text-muted-foreground">
                {form.task_type === 'schedule' ? 'Misal: Gym, Meeting, atau Belajar.' : 'Berikan nama yang jelas untuk tugasmu.'}
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="task-title">Nama Tugas <span className="text-destructive">*</span></Label>
              <Input
                id="task-title"
                placeholder="Misal: Kerjakan laporan mingguan"
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
          </div>
        )}

        {step === 2 && (
          <div className="space-y-3 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="space-y-1">
              <h3 className="text-sm font-semibold text-foreground">Langkah 2: Kapan deadline-nya?</h3>
              <p className="text-xs text-muted-foreground">Tentukan batas waktu penyelesaian tugas ini.</p>
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="task-deadline">Tanggal Deadline <span className="text-destructive">*</span></Label>
                <Input
                  id="task-deadline"
                  type="date"
                  value={form.deadline}
                  onChange={(e) => setForm((p) => ({ ...p, deadline: e.target.value }))}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="task-start-time">Waktu Mulai (Opsional)</Label>
                  <Input
                    id="task-start-time"
                    type="time"
                    value={form.start_time}
                    onChange={(e) => setForm((p) => ({ ...p, start_time: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="task-end-time">Waktu Selesai</Label>
                  <Input
                    id="task-end-time"
                    type="time"
                    value={form.end_time}
                    onChange={(e) => setForm((p) => ({ ...p, end_time: e.target.value }))}
                  />
                </div>
              </div>
              <p className="text-[10px] text-muted-foreground italic">
                Tips: Isi waktu jika ingin tugas ini muncul di jadwal harian (Schedule).
              </p>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="space-y-1">
              <h3 className="text-sm font-semibold text-foreground">Langkah 3: Detail Kepentingan</h3>
              <p className="text-xs text-muted-foreground">Atur prioritas dan tambahkan catatan jika ada.</p>
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
                        <span className={`w-2 h-2 rounded-full ${priorityColor[p]}`} />
                        <span>{p}</span>
                        <span className="text-muted-foreground text-xs">— {priorityDesc[p]}</span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-4 pt-2 border-t border-border/50">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-sm font-bold flex items-center gap-2">
                    <Repeat className="w-3.5 h-3.5 text-primary" /> Tugas Berulang
                  </Label>
                  <p className="text-[10px] text-muted-foreground">Aktifkan untuk agenda rutin</p>
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
                  <Label htmlFor="recurrence-period" className="text-xs text-muted-foreground">Ulangi Setiap</Label>
                  <Select
                    value={form.recurrence_period}
                    onValueChange={(val) => setForm(p => ({ ...p, recurrence_period: val }))}
                  >
                    <SelectTrigger id="recurrence-period" className="h-9 text-xs">
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
                                  ? "bg-primary border-primary text-white shadow-lg shadow-primary/20" 
                                  : "bg-white/5 border-white/10 text-muted-foreground hover:border-primary/50"
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

            <div className="space-y-2">
              <Label htmlFor="task-notes">Catatan / Deskripsi (Opsional)</Label>
              <Textarea
                id="task-notes"
                placeholder="Tambahkan detail atau instruksi tugas..."
                value={form.notes}
                onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
                maxLength={500}
                className="resize-none min-h-[100px]"
              />
              <p className="text-[10px] text-muted-foreground text-right uppercase tracking-wider font-medium">
                {form.notes.length}/500
              </p>
            </div>
          </div>
        )}

        {error && (
          <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
            {error}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 pt-2">
          {step > 1 ? (
            <Button
              key="btn-back"
              type="button"
              variant="outline"
              className="flex-1 h-11"
              onClick={prevStep}
              disabled={loading}
            >
              Kembali
            </Button>
          ) : (
            <Button
              key="btn-cancel"
              type="button"
              variant="ghost"
              className="flex-1 h-11 text-muted-foreground"
              onClick={onClose}
              disabled={loading}
            >
              Batal
            </Button>
          )}

          {step < 3 ? (
            <Button
              key="btn-next"
              type="button"
              className="flex-1 h-11"
              onClick={nextStep}
              disabled={step === 1 && !form.title.trim()}
            >
              Lanjut
            </Button>
          ) : (
            <Button
              key="btn-submit"
              id="task-submit-btn"
              type="submit"
              className="flex-1 h-11"
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Plus className="h-4 w-4 mr-2" />
              )}
              {loading ? 'Menyimpan...' : 'Tambah Tugas'}
            </Button>
          )}
        </div>

        {/* Footer info */}
        {step === 1 && (
          <div className="flex items-center justify-between text-[10px] text-muted-foreground pt-1 border-t border-border/50">
            <span>Sisa slot tugas aktif:</span>
            <span className={`font-semibold ${todoCount >= freeLimit - 3 ? 'text-amber-400' : 'text-foreground'}`}>
              {freeLimit - todoCount} dari {freeLimit}
            </span>
          </div>
        )}
      </form>
    </div>
  )
}
