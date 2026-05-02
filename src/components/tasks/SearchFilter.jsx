import { useState, useCallback } from 'react'
import { X, SlidersHorizontal } from 'lucide-react'
import { cn } from '@/lib/utils'

const PRIORITIES = ['High', 'Medium', 'Low']
const SORT_OPTIONS = [
  { value: 'deadline_asc',  label: 'Deadline ↑' },
  { value: 'deadline_desc', label: 'Deadline ↓' },
  { value: 'priority',      label: 'Prioritas' },
  { value: 'created',       label: 'Terbaru' },
]

const priorityColor = {
  High:   'bg-red-500/5 text-red-400 border-red-500/20 hover:bg-red-500/10',
  Medium: 'bg-amber-400/5 text-amber-400 border-amber-400/20 hover:bg-amber-400/10',
  Low:    'bg-blue-400/5 text-blue-400 border-blue-400/20 hover:bg-blue-400/10',
}
const priorityActiveColor = {
  High:   'bg-red-500/20 text-red-300 border-red-500/40 ring-1 ring-red-500/20',
  Medium: 'bg-amber-400/20 text-amber-300 border-amber-400/40 ring-1 ring-amber-400/20',
  Low:    'bg-blue-400/20 text-blue-300 border-blue-400/40 ring-1 ring-blue-400/20',
}

/**
 * Search + filter bar for the dashboard Kanban board
 * @param {{ onSearch: (q: string) => void, onFilter: (p: string[]) => void, onSort: (s: string) => void }} props
 */
export function SearchFilter({ onSearch, onFilter, onSort }) {
  const [query, setQuery] = useState('')
  const [activePriorities, setActivePriorities] = useState([])
  const [activeSort, setActiveSort] = useState('created')
  const [showSort, setShowSort] = useState(false)

  const handleSearch = useCallback((value) => {
    setQuery(value)
    onSearch(value)
  }, [onSearch])

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
    setQuery('')
    setActivePriorities([])
    setActiveSort('created')
    onSearch('')
    onFilter([])
    onSort('created')
  }

  const hasFilters = query.trim() !== '' || activePriorities.length > 0 || activeSort !== 'created'

  return (
    <div className="flex flex-col gap-4">
      {/* Priority filter chips + Sort button row */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2.5 flex-wrap px-1">
          <span className="text-[10px] text-muted-foreground font-black uppercase tracking-widest opacity-60 shrink-0">Filter Prioritas:</span>
          {PRIORITIES.map(p => {
            const active = activePriorities.includes(p)
            return (
              <button
                key={p}
                id={`filter-priority-${p.toLowerCase()}`}
                onClick={() => togglePriority(p)}
                className={cn(
                  'text-[10px] px-4 py-1.5 rounded-full border font-black uppercase tracking-widest transition-all duration-200',
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
              className="text-[10px] px-3 py-1 rounded-full border border-border/40 text-muted-foreground/60 hover:text-foreground hover:border-primary/40 transition-all duration-200 flex items-center gap-1 font-black uppercase tracking-widest"
            >
              <X className="h-3 w-3" /> Reset
            </button>
          )}
        </div>

        {/* Sort button */}
        <div className="relative shrink-0">
          <button
            id="task-sort-btn"
            onClick={() => setShowSort(s => !s)}
            className={cn(
              'h-11 px-5 rounded-2xl border text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all duration-300',
              activeSort !== 'created'
                ? 'border-primary/50 bg-primary/10 text-primary shadow-lg shadow-primary/10'
                : 'border-white/10 bg-white/5 text-muted-foreground hover:text-foreground hover:border-primary/30 shadow-sm'
            )}
          >
            <SlidersHorizontal className="h-3.5 w-3.5" />
            {SORT_OPTIONS.find(s => s.value === activeSort)?.label ?? 'Urut'}
          </button>

          {showSort && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowSort(false)} />
              <div className="absolute right-0 top-13 z-20 w-48 bg-card/95 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-[0_15px_40px_rgba(0,0,0,0.4)] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                {SORT_OPTIONS.map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => handleSort(opt.value)}
                    className={cn(
                      'w-full text-left px-5 py-3 text-[10px] font-black uppercase tracking-widest transition-colors',
                      activeSort === opt.value
                        ? 'bg-primary text-white'
                        : 'text-foreground/70 hover:bg-white/5'
                    )}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
