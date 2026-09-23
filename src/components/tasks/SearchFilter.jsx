import { useState } from 'react'
import { X, SlidersHorizontal, Check } from 'lucide-react'
import { cn } from '@/lib/utils'

const PRIORITIES = ['High', 'Medium', 'Low']
const SORT_OPTIONS = [
  { value: 'created',       label: 'Terbaru' },
  { value: 'deadline_asc',  label: 'Deadline terdekat' },
  { value: 'deadline_desc', label: 'Deadline terjauh' },
  { value: 'priority',      label: 'Prioritas' },
]

const priorityColor = {
  High:   'bg-card/70 text-red-600 dark:text-red-400 border-red-500/25 hover:bg-red-500/10',
  Medium: 'bg-card/70 text-amber-700 dark:text-amber-400 border-amber-500/30 hover:bg-amber-400/10',
  Low:    'bg-card/70 text-blue-600 dark:text-blue-400 border-blue-500/25 hover:bg-blue-400/10',
}
const priorityActiveColor = {
  High:   'bg-red-500 text-white border-red-500',
  Medium: 'bg-amber-400 text-black border-amber-400',
  Low:    'bg-blue-500 text-white border-blue-500',
}

/**
 * Priority filter chips + sort menu for the Kanban board (search lives in the dashboard)
 * @param {{ onSearch: (q: string) => void, onFilter: (p: string[]) => void, onSort: (s: string) => void }} props
 */
export function SearchFilter({ onSearch, onFilter, onSort }) {
  const [activePriorities, setActivePriorities] = useState([])
  const [activeSort, setActiveSort] = useState('created')
  const [showSort, setShowSort] = useState(false)

  const togglePriority = (p) => {
    const next = activePriorities.includes(p)
      ? activePriorities.filter(x => x !== p)
      : [...activePriorities, p]
    setActivePriorities(next)
    onFilter(next)
  }

  const handleSort = (s) => {
    setActiveSort(s)
    onSort(s)
    setShowSort(false)
  }

  const clearAll = () => {
    setActivePriorities([])
    setActiveSort('created')
    onSearch('')
    onFilter([])
    onSort('created')
  }

  const hasFilters = activePriorities.length > 0 || activeSort !== 'created'
  const sortLabel = SORT_OPTIONS.find(s => s.value === activeSort)?.label ?? 'Urutkan'

  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 min-w-0 flex items-center gap-2 overflow-x-auto no-scrollbar -mx-1 px-1 py-0.5">
        <span className="hidden sm:inline eyebrow shrink-0 mr-1">Prioritas</span>
        {PRIORITIES.map(p => {
          const active = activePriorities.includes(p)
          return (
            <button
              key={p}
              id={`filter-priority-${p.toLowerCase()}`}
              onClick={() => togglePriority(p)}
              aria-pressed={active}
              className={cn(
                'shrink-0 h-9 text-xs px-3.5 rounded-full border font-bold transition-colors duration-200',
                active ? priorityActiveColor[p] : priorityColor[p]
              )}
            >
              {p}
            </button>
          )
        })}

        {hasFilters && (
          <button
            onClick={clearAll}
            className="shrink-0 h-9 text-xs px-3 rounded-full border border-hairline/15 text-muted-foreground hover:text-foreground hover:border-primary/40 transition-colors flex items-center gap-1 font-bold"
          >
            <X className="h-3.5 w-3.5" /> Reset
          </button>
        )}
      </div>

      <div className="relative shrink-0">
        <button
          id="task-sort-btn"
          onClick={() => setShowSort(s => !s)}
          aria-label={`Urutkan: ${sortLabel}`}
          className={cn(
            'h-9 sm:h-10 px-3 sm:px-3.5 rounded-full sm:rounded-lg border text-xs font-semibold flex items-center gap-2 transition-colors duration-200',
            activeSort !== 'created'
              ? 'border-primary/50 bg-primary/10 text-primary'
              : 'border-hairline/10 bg-card/70 text-muted-foreground hover:text-foreground hover:border-primary/30'
          )}
        >
          <SlidersHorizontal className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">{sortLabel}</span>
        </button>

        {showSort && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setShowSort(false)} />
            <div className="absolute right-0 top-full mt-2 z-20 w-52 bg-card border border-hairline/10 rounded-2xl shadow-[0_15px_40px_rgba(0,0,0,0.35)] overflow-hidden p-1 animate-in fade-in zoom-in-95 duration-150">
              {SORT_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => handleSort(opt.value)}
                  className={cn(
                    'w-full flex items-center justify-between text-left px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-colors',
                    activeSort === opt.value ? 'bg-primary/10 text-primary' : 'text-foreground/80 hover:bg-hairline/5'
                  )}
                >
                  {opt.label}
                  {activeSort === opt.value && <Check className="h-4 w-4" />}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
