import { useState, useRef, useEffect } from 'react'
import { Bell, AlertTriangle, Clock, CheckCircle2, X, CalendarClock } from 'lucide-react'
import { differenceInDays, parseISO, format } from 'date-fns'
import { id as localeId } from 'date-fns/locale'
import { cn } from '@/lib/utils'

function NotifItem({ task, onOpen, onClose }) {
  const deadline = parseISO(task.deadline)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const diffDays = differenceInDays(deadline, today)
  const formatted = format(deadline, 'dd MMM yyyy', { locale: localeId })

  const getUrgency = () => {
    if (diffDays < 0)    return { icon: AlertTriangle, color: 'text-red-600 dark:text-red-400',    bg: 'bg-red-500/10 border-red-500/20',    label: `Terlambat ${Math.abs(diffDays)} hari` }
    if (diffDays === 0)  return { icon: Clock,         color: 'text-amber-700 dark:text-amber-400',  bg: 'bg-amber-400/10 border-amber-400/20', label: 'Deadline hari ini!' }
    return               { icon: CalendarClock,         color: 'text-orange-600 dark:text-orange-400', bg: 'bg-orange-400/10 border-orange-400/20', label: `${diffDays} hari lagi` }
  }

  const { icon: Icon, color, bg, label } = getUrgency()

  return (
    <button
      onClick={() => { onOpen(task); onClose() }}
      className={cn(
        'w-full text-left flex items-start gap-3 p-3 rounded-xl border transition-all duration-150 hover:scale-[1.01]',
        bg
      )}
    >
      <Icon className={cn('h-4 w-4 shrink-0 mt-0.5', color)} />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground truncate">{task.title}</p>
        <div className="flex items-center gap-1.5 mt-0.5">
          <span className={cn('text-xs font-semibold', color)}>{label}</span>
          <span className="text-xs text-muted-foreground">· {formatted}</span>
        </div>
      </div>
    </button>
  )
}

/**
 * Notification bell button + dropdown panel
 * @param {{ notifications: import('@/types').Task[], onOpenDetail: (task: import('@/types').Task) => void }} props
 */
export function NotificationPanel({ notifications = [], onOpenDetail }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  // iOS Safari only exposes Notification once the app is added to the home screen
  const [perm, setPerm] = useState('Notification' in window ? Notification.permission : 'unsupported')

  const askPermission = () => {
    if ('Notification' in window) {
      Notification.requestPermission().then(p => setPerm(p))
    }
  }

  // Close on outside click
  useEffect(() => {
    if (!open) return
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  const count = notifications.length

  return (
    <div ref={ref} className="relative">
      {/* Bell button */}
      <button
        id="notification-bell-btn"
        onClick={() => setOpen(o => !o)}
        aria-label={count > 0 ? `${count} notifikasi` : 'Tidak ada notifikasi'}
        className={cn(
          'glass-chrome w-10 h-10 rounded-full flex items-center justify-center transition active:scale-95',
          open ? 'text-primary' : 'text-foreground/80 hover:text-foreground'
        )}
      >
        <Bell className={cn('h-[18px] w-[18px]', count > 0 && !open && 'text-red-500')} />
      </button>

      {/* Badge */}
      {count > 0 && (
        <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-background pointer-events-none">
          {count > 9 ? '9+' : count}
        </span>
      )}

      {/* Dropdown panel */}
      {open && (
        <div className="lg-rim !fixed inset-x-3 top-[calc(4rem+env(safe-area-inset-top))] sm:!absolute sm:inset-auto sm:right-0 sm:top-14 z-[100] sm:w-96 max-w-sm mx-auto sm:mx-0 bg-card/90 backdrop-blur-2xl backdrop-saturate-150 rounded-[26px] overflow-hidden animate-fade-in">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <div className="flex items-center gap-2">
              <Bell className="h-4 w-4 text-primary" />
              <span className="text-sm font-semibold text-foreground">Notifikasi</span>
              {count > 0 && (
                <span className="text-xs font-bold px-1.5 py-0.5 rounded-full bg-red-500/15 text-red-600 dark:text-red-400 border border-red-500/25">
                  {count}
                </span>
              )}
            </div>
            <button
              onClick={() => setOpen(false)}
              className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Body */}
          <div className="p-3 max-h-80 overflow-y-auto space-y-2">
            {count === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 gap-2">
                <CheckCircle2 className="h-10 w-10 text-green-600/50 dark:text-green-400/50" />
                <p className="text-sm font-medium text-muted-foreground">Semua tugas on-track! 🎉</p>
                <p className="text-xs text-muted-foreground/60">Tidak ada deadline yang mendesak.</p>
              </div>
            ) : (
              <>
                <p className="text-xs text-muted-foreground px-1 pb-1">
                  Klik tugas untuk membuka detail dan mengubah status.
                </p>
                {notifications.map(task => (
                  <NotifItem
                    key={task.id}
                    task={task}
                    onOpen={onOpenDetail}
                    onClose={() => setOpen(false)}
                  />
                ))}
              </>
            )}
          </div>

          {/* Footer */}
          <div className="px-4 py-2.5 border-t border-border bg-secondary/20 flex flex-col gap-2">
            <p className="text-[10px] text-muted-foreground/60 text-center">
              Tugas dengan deadline ≤ 2 hari atau sudah terlambat ditampilkan di sini.
            </p>
            {perm === 'default' && (
              <button
                onClick={askPermission}
                className="text-xs bg-primary/20 hover:bg-primary/30 text-primary py-2 rounded-lg font-bold transition-colors w-full border border-primary/20"
              >
                Aktifkan Notifikasi Sistem (HP / Laptop)
              </button>
            )}
            {perm === 'unsupported' && /iPhone|iPad|iPod/.test(navigator.userAgent) && (
              <p className="text-[11px] text-muted-foreground text-center leading-relaxed">
                Di iPhone: ketuk <span className="font-bold text-foreground">Bagikan → Tambah ke Layar Utama</span>, lalu buka Tugasku dari ikonnya untuk mengaktifkan notifikasi.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
