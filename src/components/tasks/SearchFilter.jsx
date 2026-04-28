import { useState, useCallback } from 'react'
import { Search, X, SlidersHorizontal } from 'lucide-react'
import { cn } from '@/lib/utils'

const PRIORITIES = ['High', 'Medium', 'Low']
const SORT_OPTIONS = [
  { value: 'deadline_asc',  label: 'Deadline ↑' },
  { value: 'deadline_desc', label: 'Deadline ↓' },
  { value: 'priority',      label: 'Prioritas' },
  { value: 'created',       label: 'Terbaru' },
]

const priorityColor = {
  High:   'bg-red-500/15 text-red-400 border-red-500/30 hover:bg-red-500/25',
  Medium: 'bg-amber-400/15 text-amber-400 border-amber-400/30 hover:bg-amber-400/25',
  Low:    'bg-blue-400/15 text-blue-400 border-blue-400/30 hover:bg-blue-400/25',
}
const priorityActiveColor = {
  High:   'bg-red-500/30 text-red-300 border-red-500/60 ring-1 ring-red-500/30',
  Medium: 'bg-amber-400/30 text-amber-300 border-amber-400/60 ring-1 ring-amber-400/30',
  Low:    'bg-blue-400/30 text-blue-300 border-blue-400/60 ring-1 ring-blue-400/30',
}
const priorityEmoji = { High: '🔴', Medium: '🟡', Low: '🔵' }

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
    <div className="flex flex-col gap-3 mb-8">
      {/* Search + Sort row */}
      <div className="flex gap-2">
        {/* Search input */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <input
            id="task-search-input"
            type="text"
            placeholder="Cari tugas..."
            value={query}
            onChange={e => handleSearch(e.target.value)}
            className={cn(
              'w-full h-10 pl-9 pr-9 rounded-xl border border-border bg-card text-sm text-foreground',
              'placeholder:text-muted-foreground/50',
              'focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50',
              'transition-all duration-200',
            )}
          />
          {query && (
            <button
              onClick={() => handleSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/50 hover:text-foreground transition-colors"
              aria-label="Hapus pencarian"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Sort button */}
        <div className="relative">
          <button
            id="task-sort-btn"
            onClick={() => setShowSort(s => !s)}
            className={cn(
              'h-10 px-3 rounded-xl border text-sm font-medium flex items-center gap-1.5 transition-all duration-200',
              activeSort !== 'created'
                ? 'border-primary/50 bg-primary/10 text-primary'
                : 'border-border bg-card text-muted-foreground hover:text-foreground hover:border-border/80'
            )}
          >
            <SlidersHorizontal className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">
              {SORT_OPTIONS.find(s => s.value === activeSort)?.label ?? 'Urut'}
            </span>
          </button>

          {showSort && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowSort(false)}
              />
              <div className="absolute right-0 top-12 z-20 w-44 bg-card border border-border rounded-xl shadow-xl shadow-black/30 overflow-hidden animate-fade-in">
                {SORT_OPTIONS.map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => handleSort(opt.value)}
                    className={cn(
                      'w-full text-left px-4 py-2.5 text-sm transition-colors',
                      activeSort === opt.value
                        ? 'bg-primary/10 text-primary font-medium'
                        : 'text-foreground hover:bg-secondary'
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

      {/* Priority filter chips + clear */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xs text-muted-foreground font-medium shrink-0">Filter:</span>
        {PRIORITIES.map(p => {
          const active = activePriorities.includes(p)
          return (
            <button
              key={p}
              id={`filter-priority-${p.toLowerCase()}`}
              onClick={() => togglePriority(p)}
              className={cn(
                'text-xs px-2.5 py-1 rounded-full border font-medium transition-all duration-150',
                active ? priorityActiveColor[p] : priorityColor[p]
              )}
            >
              {priorityEmoji[p]} {p}
            </button>
          )
        })}

        {hasFilters && (
          <button
            onClick={clearAll}
            className="text-xs px-2.5 py-1 rounded-full border border-border text-muted-foreground hover:text-foreground hover:border-border/80 transition-all duration-150 flex items-center gap-1"
          >
            <X className="h-2.5 w-2.5" /> Reset
          </button>
        )}
      </div>
    </div>
  )
}
