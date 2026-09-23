import { useMemo, useState } from 'react'
import { addDays, format, parseISO, isValid } from 'date-fns'
import { id as localeId } from 'date-fns/locale'
import { AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'

const DAYS = 7
const PLOT_HEIGHT = 160

/**
 * Open tasks due on each of the next 7 days. Tap or hover a day to see which tasks.
 * @param {{ tasks: import('@/types').Task[], onOpenTask?: (task: import('@/types').Task) => void }} props
 */
export function WorkloadChart({ tasks, onOpenTask }) {
  const [selected, setSelected] = useState(0)

  const { days, overdue, max } = useMemo(() => {
    const today = format(new Date(), 'yyyy-MM-dd')
    const open = tasks.filter((t) => t.status !== 'done' && t.deadline && isValid(parseISO(t.deadline)))
    const start = parseISO(today)
    const days = Array.from({ length: DAYS }, (_, i) => {
      const date = addDays(start, i)
      const key = format(date, 'yyyy-MM-dd')
      const items = open.filter((t) => t.deadline === key)
      return {
        key,
        short: i === 0 ? 'Hari ini' : format(date, 'EEE', { locale: localeId }),
        long: format(date, 'EEEE, d MMM', { locale: localeId }),
        items,
      }
    })
    return {
      days,
      overdue: open.filter((t) => t.deadline < today).length,
      max: Math.max(1, ...days.map((d) => d.items.length)),
    }
  }, [tasks])

  const active = days[selected]
  const total = days.reduce((sum, d) => sum + d.items.length, 0)

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-muted-foreground">{active.long}</p>
          <p className="text-2xl font-black text-foreground tabular-nums">
            {active.items.length} <span className="text-base font-bold text-muted-foreground">tugas jatuh tempo</span>
          </p>
        </div>
        {overdue > 0 && (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-destructive/25 bg-destructive/10 px-3 py-1 text-xs font-bold text-destructive">
            <AlertTriangle className="h-3.5 w-3.5" /> {overdue} terlambat
          </span>
        )}
      </div>

      <div className="relative">
        <div className="flex items-end justify-between gap-1" style={{ height: PLOT_HEIGHT }}>
          {days.map((d, i) => {
            const count = d.items.length
            const isActive = i === selected
            return (
              <button
                key={d.key}
                type="button"
                onMouseEnter={() => setSelected(i)}
                onFocus={() => setSelected(i)}
                onClick={() => setSelected(i)}
                aria-label={`${d.long}: ${count} tugas`}
                aria-pressed={isActive}
                className={cn('group relative flex-1 h-full flex flex-col items-center justify-end rounded-xl transition-colors', isActive && 'bg-hairline/[0.05]')}
              >
                {isActive && count > 0 && (
                  <span className="mb-1.5 text-xs font-bold text-foreground tabular-nums">{count}</span>
                )}
                <span
                  className={cn(
                    'w-full max-w-[24px] rounded-t-[4px] transition-[height,opacity] duration-500',
                    count > 0 ? 'bg-primary' : 'bg-hairline/15',
                    !isActive && count > 0 && 'opacity-60 group-hover:opacity-90'
                  )}
                  style={{ height: count > 0 ? Math.max(6, (count / max) * (PLOT_HEIGHT - 28)) : 2 }}
                />
              </button>
            )
          })}
        </div>
        <div className="h-px bg-hairline/10" />
        <div className="mt-2 flex justify-between gap-1">
          {days.map((d, i) => (
            <span
              key={d.key}
              className={cn('flex-1 text-center text-[11px] capitalize truncate', i === selected ? 'font-bold text-foreground' : 'text-muted-foreground')}
            >
              {d.short}
            </span>
          ))}
        </div>
      </div>

      <div className="space-y-1.5 min-h-[72px]">
        {active.items.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            {total === 0 ? 'Tidak ada deadline dalam 7 hari ke depan. 🎉' : 'Tidak ada tugas yang jatuh tempo di hari ini.'}
          </p>
        ) : (
          active.items.slice(0, 4).map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => onOpenTask?.(t)}
              className="w-full flex items-center justify-between gap-3 rounded-xl px-3 py-2 text-left text-sm hover:bg-hairline/5 transition-colors"
            >
              <span className="truncate font-medium text-foreground">{t.title}</span>
              <span className="shrink-0 text-xs text-muted-foreground">{t.priority}</span>
            </button>
          ))
        )}
        {active.items.length > 4 && <p className="px-3 text-xs text-muted-foreground">+{active.items.length - 4} lainnya</p>}
      </div>

      <table className="sr-only">
        <caption>Tugas terbuka yang jatuh tempo 7 hari ke depan</caption>
        <tbody>
          {days.map((d) => (
            <tr key={d.key}>
              <th scope="row">{d.long}</th>
              <td>{d.items.length}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
