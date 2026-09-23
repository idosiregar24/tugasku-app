import { useState, useMemo, useEffect, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@/hooks/useAuth'
import { useTasks } from '@/hooks/useTasks'
import { useProfile } from '@/hooks/useProfile'
import { useAssistant } from '@/hooks/useAssistant'
import { Sidebar } from '@/components/layout/Sidebar'
import { MobileNav } from '@/components/layout/MobileNav'
import { ToolDock } from '@/components/layout/ToolDock'
import { KanbanBoard } from '@/components/tasks/KanbanBoard'
import { TaskForm } from '@/components/tasks/TaskForm'
import { ScheduleForm } from '@/components/tasks/ScheduleForm'
import { BrandMark } from '@/components/layout/BrandMark'
import { TaskDetailModal } from '@/components/tasks/TaskDetailModal'
import { SearchFilter } from '@/components/tasks/SearchFilter'
import { UpgradeModal } from '@/components/subscription/UpgradeModal'
import { ProfileModal } from '@/components/profile/ProfileModal'
import { NotificationPanel } from '@/components/layout/NotificationPanel'
import { ScheduleView } from '@/components/tasks/ScheduleView'
import { DeveloperModal } from '@/components/layout/DeveloperModal'
import { FloatingNotepad } from '@/components/layout/FloatingNotepad'
import { FloatingPomodoro } from '@/components/layout/FloatingPomodoro'
import { AssistantPanel } from '@/components/assistant/AssistantPanel'
import { WorkloadChart } from '@/components/insights/WorkloadChart'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Plus,
  Loader2,
  Edit2,
  Check,
  X,
  ChevronDown,
  ChevronUp,
  Search,
  LayoutDashboard,
  Crown,
  TrendingUp,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Monitor,
  CalendarRange,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const TABS = ['dashboard', 'schedule', 'analytics']
const TAB_TITLE = { dashboard: 'Workspace', schedule: 'Jadwal Harian', analytics: 'Insights' }

export function DashboardPage() {
  const { user, signOut } = useAuth()
  const {
    profile,
    isPro,
    planExpiresAt,
    pendingPayment,
    loading: profileLoading,
    refetch: refetchProfile,
  } = useProfile(user)

  const {
    tasks = [],
    todoTasks = [],
    finishedTasks = [],
    doneTasks = [],
    loading,
    isLimitReached,
    taskLimit,
    addTask,
    updateTask,
    deleteTask,
    notifications,
  } = useTasks(user, isPro)

  // Home-screen shortcuts (manifest.webmanifest) open /dashboard?action=… or ?tab=…
  const [searchParams, setSearchParams] = useSearchParams()
  const initialAction = searchParams.get('action')
  const initialTab = searchParams.get('tab')

  const [dialogOpen, setDialogOpen] = useState(initialAction === 'new-task')
  const [taskType, setTaskType] = useState('task')
  const [selectedTask, setSelectedTask] = useState(null)
  const [upgradeOpen, setUpgradeOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterPriorities, setFilterPriorities] = useState([])
  const [sortKey, setSortKey] = useState('created')
  const [showStats, setShowStats] = useState(true)
  const [activeTab, setActiveTab] = useState(TABS.includes(initialTab) ? initialTab : 'dashboard')
  const [developerOpen, setDeveloperOpen] = useState(false)
  const [isTVMode, setIsTVMode] = useState(false)
  const [assistantOpen, setAssistantOpen] = useState(initialAction === 'assistant')
  const [notesOpen, setNotesOpen] = useState(false)
  const [timerOpen, setTimerOpen] = useState(false)
  const [timerRunning, setTimerRunning] = useState(false)

  useEffect(() => {
    if (initialAction || initialTab || searchParams.get('source')) {
      setSearchParams({}, { replace: true })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const firstName = profile?.full_name?.split(' ')[0] || user?.email?.split('@')[0]

  const assistant = useAssistant({
    tasks,
    addTask,
    updateTask,
    userName: profile?.full_name || firstName,
    isPro,
    taskLimit,
  })

  useEffect(() => {
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) setIsTVMode(false)
    }
    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange)
  }, [])

  // iPhone Safari has no element fullscreen API; focus mode still works without it
  const toggleTVMode = () => {
    const root = document.documentElement
    if (isTVMode) {
      if (document.fullscreenElement) document.exitFullscreen?.()
      setIsTVMode(false)
      return
    }
    setIsTVMode(true)
    root.requestFullscreen?.().catch(() => {})
  }

  const [isEditingQuote, setIsEditingQuote] = useState(false)
  const [userQuote, setUserQuote] = useState(() =>
    localStorage.getItem('tugasku-quote') || 'Fokus pada proses, hasil akan mengikuti. ✨'
  )
  const [tempQuote, setTempQuote] = useState(userQuote)

  const handleSaveQuote = () => {
    const trimmed = tempQuote.trim()
    if (trimmed) {
      setUserQuote(trimmed)
      localStorage.setItem('tugasku-quote', trimmed)
    }
    setIsEditingQuote(false)
  }

  const handleOpenDetail = (task) => setSelectedTask(task)
  const handleCloseDetail = () => setSelectedTask(null)
  const handleOpenTaskById = useCallback(
    (taskId) => {
      const task = tasks.find((t) => t.id === taskId)
      if (task) setSelectedTask(task)
    },
    [tasks]
  )

  const openNewItem = (type) => {
    setTaskType(type)
    setDialogOpen(true)
  }

  const handleTabChange = (tab) => {
    if (tab === 'settings') setProfileOpen(true)
    else setActiveTab(tab)
  }

  const totalTasks = todoTasks.length + finishedTasks.length + doneTasks.length
  const finishedTotal = finishedTasks.length + doneTasks.length
  const completionRate = totalTasks > 0 ? Math.round((finishedTotal / totalTasks) * 100) : 0

  const stats = useMemo(() => {
    const allTasks = [...todoTasks, ...finishedTasks, ...doneTasks]
    return {
      high: allTasks.filter(t => t.priority === 'High').length,
      medium: allTasks.filter(t => t.priority === 'Medium').length,
      low: allTasks.filter(t => t.priority === 'Low').length,
      todo: todoTasks.length,
      finished: finishedTasks.length,
      done: doneTasks.length,
      total: allTasks.length,
    }
  }, [todoTasks, finishedTasks, doneTasks])

  const initials = useMemo(() => {
    if (profile?.full_name) {
      return profile.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    }
    return user?.email?.charAt(0).toUpperCase() || '?'
  }, [profile, user])

  const applyFilters = useCallback((list) => {
    if (!list) return []
    // Workspace only shows 'task' items; schedules live in the Jadwal tab
    let result = list.filter(t => t.task_type === 'task' || !t.task_type)

    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase()
      result = result.filter(t => (t.title || '').toLowerCase().includes(q) || (t.notes || '').toLowerCase().includes(q))
    }
    if (filterPriorities.length > 0) {
      result = result.filter(t => filterPriorities.includes(t.priority))
    }
    if (sortKey === 'deadline_asc') result.sort((a, b) => (a.deadline || '').localeCompare(b.deadline || ''))
    else if (sortKey === 'deadline_desc') result.sort((a, b) => (b.deadline || '').localeCompare(a.deadline || ''))
    else if (sortKey === 'priority') {
      const order = { High: 0, Medium: 1, Low: 2 }
      result.sort((a, b) => (order[a.priority] ?? 1) - (order[b.priority] ?? 1))
    } else result.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0))
    return result
  }, [searchQuery, filterPriorities, sortKey])

  const filteredTodo = useMemo(() => applyFilters(todoTasks), [todoTasks, applyFilters])
  const filteredFinished = useMemo(() => applyFilters(finishedTasks), [finishedTasks, applyFilters])
  const filteredDone = useMemo(() => applyFilters(doneTasks), [doneTasks, applyFilters])

  if (loading || profileLoading) {
    return (
      <div className="min-h-app flex items-center justify-center">
        <div className="surface rounded-[22px] p-4">
          <Loader2 className="h-7 w-7 animate-spin text-primary" />
        </div>
      </div>
    )
  }

  const taskDetailModal = (
    <TaskDetailModal task={selectedTask} open={!!selectedTask} onClose={handleCloseDetail} onUpdate={updateTask} onDelete={deleteTask} />
  )

  if (isTVMode) {
    return (
      <div className="h-app flex relative overflow-hidden">
        <div className="flex-1 flex flex-col overflow-y-auto relative z-10 p-4 pt-[calc(1rem+env(safe-area-inset-top))] md:p-8">
          <div className="flex justify-between items-center gap-4 mb-6 shrink-0">
            <div>
              <p className="eyebrow flex items-center gap-2 mb-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" /> Live focus mode
              </p>
              <h1 className="text-2xl md:text-4xl font-semibold text-foreground tracking-[-0.03em] flex items-center gap-3">
                <Monitor className="w-7 h-7 text-primary" />
                Tugasku Board
              </h1>
            </div>
            <Button variant="outline" onClick={toggleTVMode} className="h-10 px-4">
              <X className="w-4 h-4 mr-2" /> Keluar
            </Button>
          </div>

          <KanbanBoard
            todoTasks={filteredTodo}
            finishedTasks={filteredFinished}
            doneTasks={filteredDone}
            onUpdateTask={updateTask}
            onDeleteTask={deleteTask}
            onOpenDetail={handleOpenDetail}
          />
        </div>
        {taskDetailModal}
      </div>
    )
  }

  return (
    <div className="h-app flex relative overflow-hidden">
      <Sidebar
        activeTab={activeTab}
        onTabChange={handleTabChange}
        isPro={isPro}
        isAdmin={profile?.is_admin}
        user={user}
        profile={profile}
        onOpenProfile={() => setProfileOpen(true)}
        onOpenDeveloper={() => setDeveloperOpen(true)}
        onOpenAssistant={() => setAssistantOpen(true)}
        onUpgrade={() => setUpgradeOpen(true)}
        onSignOut={signOut}
      />

      <div className="flex-1 min-w-0 flex flex-col relative z-10">
        {/* Top Bar */}
        {/* Top Bar: glass on phones, open over the sky on larger screens */}
        <header className="shrink-0 z-30 pt-safe max-md:glass-nav">
          <div className="h-14 md:h-20 flex items-center justify-between gap-3 px-4 md:px-8">
            <div className="flex items-center gap-3 min-w-0">
              <BrandMark className="md:hidden w-9 h-9 shrink-0" />
              <h1 className="text-lg md:text-2xl font-semibold text-foreground tracking-[-0.02em] truncate">{TAB_TITLE[activeTab]}</h1>
              <span className="hidden xl:flex eyebrow items-center gap-2 ml-1">
                <span className="w-1.5 h-1.5 rounded-full bg-primary" /> Live sync
              </span>
            </div>

            <div className="flex items-center gap-2 md:gap-2.5">
              {activeTab === 'dashboard' && (
                <button
                  onClick={toggleTVMode}
                  className="hidden lg:flex glass-chrome items-center gap-2 px-4 h-10 rounded-full text-sm font-medium text-foreground hover:brightness-105 active:scale-[0.97] transition"
                  title="Focus Mode (Fullscreen)"
                >
                  <Monitor className="h-4 w-4" />
                  Focus Mode
                </button>
              )}
              <label className="hidden lg:flex glass-chrome items-center gap-2 px-4 h-10 rounded-full focus-within:ring-2 focus-within:ring-primary/30">
                <Search className="w-4 h-4 text-muted-foreground" />
                <input
                  type="search"
                  value={searchQuery}
                  placeholder="Cari tugas..."
                  className="bg-transparent border-none outline-none text-sm text-foreground placeholder:text-muted-foreground w-44"
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </label>
              <NotificationPanel notifications={notifications} onOpenDetail={handleOpenDetail} />
              <button
                onClick={() => setProfileOpen(true)}
                className="md:hidden w-10 h-10 rounded-full bg-primary/15 border border-primary/25 text-primary text-xs font-bold flex items-center justify-center"
                aria-label="Profil"
              >
                {initials}
              </button>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto overscroll-contain relative pb-nav md:pb-10">
          <div className="relative z-10 max-w-7xl mx-auto px-4 pt-5 md:px-8 md:pt-4 space-y-6 md:space-y-8">
            {/* Welcome (phones only show it on the Workspace tab to save space) */}
            <div className={cn('flex-col md:flex-row md:items-end justify-between gap-4 md:gap-6', activeTab === 'dashboard' ? 'flex' : 'hidden md:flex')}>
              <div className="min-w-0">
                <p className="eyebrow flex items-center gap-2 mb-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                  {new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' })}
                  {todoTasks.length > 0 && <span className="hidden sm:inline">· {todoTasks.length} tugas aktif</span>}
                </p>
                <h2 className="text-[34px] leading-[1.05] md:text-6xl font-semibold text-foreground tracking-[-0.04em]">
                  Halo, <span className="text-leaf">{firstName}.</span>
                </h2>

                <div className="mt-2 md:mt-3 group/quote relative max-w-xl">
                  {isEditingQuote ? (
                    <div className="flex items-center gap-2 animate-fade-in">
                      <input
                        type="text"
                        value={tempQuote}
                        onChange={(e) => setTempQuote(e.target.value)}
                        className="bg-card/80 border-b-2 border-primary outline-none font-serif italic text-lg py-1.5 px-2 text-foreground w-full min-w-0 sm:min-w-[340px] rounded-t-md"
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleSaveQuote()
                          if (e.key === 'Escape') setIsEditingQuote(false)
                        }}
                      />
                      <button onClick={handleSaveQuote} className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors" aria-label="Simpan kutipan">
                        <Check className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => { setTempQuote(userQuote); setIsEditingQuote(true) }}
                      className="text-left font-serif italic text-lg md:text-xl text-foreground/70 hover:text-foreground transition-colors inline-flex items-center gap-2"
                    >
                      “{userQuote}”
                      <Edit2 className="h-3 w-3 shrink-0 opacity-60 [@media(hover:hover)]:opacity-0 group-hover/quote:opacity-100 transition-opacity" />
                    </button>
                  )}
                </div>
              </div>

              <div className="hidden sm:flex items-center gap-3 surface rounded-full pl-4 pr-2 py-2">
                <div className="text-right">
                  <p className="eyebrow">Progres</p>
                  <p className="text-sm font-semibold text-foreground">{completionRate}% selesai</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center text-primary font-bold text-xs">
                  {initials}
                </div>
              </div>
            </div>

            {activeTab === 'dashboard' ? (
              <>
                <div>
                  <button
                    onClick={() => setShowStats(!showStats)}
                    className="eyebrow flex items-center gap-1.5 hover:text-foreground transition-colors mb-3"
                  >
                    {showStats ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                    {showStats ? 'Sembunyikan ringkasan' : 'Tampilkan ringkasan'}
                  </button>

                  <AnimatePresence initial={false}>
                    {showStats && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                          {[
                            { label: 'Total Tugas', value: totalTasks, color: 'text-foreground' },
                            { label: 'Dikerjakan', value: todoTasks.length, color: 'text-primary' },
                            { label: 'Belum Submit', value: finishedTasks.length, color: 'text-warning' },
                            { label: 'Selesai', value: doneTasks.length, color: 'text-success' },
                          ].map((s) => (
                            <div key={s.label} className="surface p-4 md:p-5 rounded-[22px]">
                              <p className="eyebrow mb-2">{s.label}</p>
                              <p className={cn('text-3xl md:text-4xl font-semibold tracking-[-0.03em] tabular-nums', s.color)}>{s.value}</p>
                            </div>
                          ))}
                        </div>

                        <div className="surface rounded-[22px] mt-3 md:mt-4 px-4 py-3.5">
                          <div className="flex justify-between mb-2.5">
                            <span className="eyebrow">Progres keseluruhan</span>
                            <span className="text-sm font-semibold text-foreground tabular-nums">{completionRate}%</span>
                          </div>
                          <div className="h-1.5 w-full bg-hairline/10 rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${completionRate}%` }}
                              className="h-full bg-primary rounded-full"
                            />
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Search & filters */}
                <div className="surface relative z-20 rounded-[22px] p-3 md:p-3.5 space-y-3">
                  <label className="lg:hidden lg-rim flex items-center gap-2 h-11 px-4 rounded-full bg-card/70 focus-within:ring-2 focus-within:ring-primary/30">
                    <Search className="w-4 h-4 text-muted-foreground shrink-0" />
                    <input
                      type="search"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Cari tugas atau catatan..."
                      className="flex-1 min-w-0 bg-transparent outline-none text-sm text-foreground placeholder:text-muted-foreground"
                    />
                  </label>
                  <div className="flex flex-col md:flex-row md:items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <SearchFilter onSearch={setSearchQuery} onFilter={setFilterPriorities} onSort={setSortKey} />
                    </div>
                    <Button
                      onClick={() => openNewItem('task')}
                      className="hidden md:flex h-11 px-5 rounded-full font-semibold items-center gap-2 group"
                    >
                      <Plus className="h-5 w-5 group-hover:rotate-90 transition-transform" />
                      Tugas Baru
                    </Button>
                  </div>
                </div>

                <KanbanBoard
                  todoTasks={filteredTodo}
                  finishedTasks={filteredFinished}
                  doneTasks={filteredDone}
                  onUpdateTask={updateTask}
                  onDeleteTask={deleteTask}
                  onOpenDetail={handleOpenDetail}
                />
              </>
            ) : activeTab === 'schedule' ? (
              <ScheduleView
                tasks={tasks.filter(t => t.task_type === 'schedule')}
                onAddTask={() => openNewItem('schedule')}
                onEditTask={handleOpenDetail}
              />
            ) : (
              <div className="space-y-6 md:space-y-8 animate-fade-in">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                  {[
                    { label: 'Total Tugas', value: stats.total, icon: LayoutDashboard, color: 'text-primary' },
                    { label: 'Dikerjakan', value: stats.todo, icon: Clock, color: 'text-warning' },
                    { label: 'Sudah Selesai', value: stats.finished + stats.done, icon: CheckCircle2, color: 'text-success' },
                    { label: 'Tingkat Selesai', value: `${completionRate}%`, icon: TrendingUp, color: 'text-leaf' },
                  ].map((s) => (
                    <div key={s.label} className="surface p-4 md:p-5 rounded-[22px]">
                      <div className="flex items-center gap-2 mb-3">
                        <s.icon className={cn('w-4 h-4', s.color)} />
                        <span className="eyebrow truncate">{s.label}</span>
                      </div>
                      <p className="text-3xl font-semibold tracking-[-0.03em] text-foreground tabular-nums">{s.value}</p>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
                  <div className="surface lg:col-span-1 p-5 md:p-6 rounded-[26px] space-y-5">
                    <h3 className="eyebrow flex items-center gap-2">
                      <AlertTriangle className="w-3.5 h-3.5" /> Sebaran prioritas
                    </h3>
                    <div className="space-y-5">
                      {[
                        { label: 'High', count: stats.high, color: 'bg-red-500' },
                        { label: 'Medium', count: stats.medium, color: 'bg-amber-400' },
                        { label: 'Low', count: stats.low, color: 'bg-blue-400' },
                      ].map((p) => (
                        <div key={p.label} className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="flex items-center gap-2 font-medium text-foreground">
                              <span className={cn('w-2 h-2 rounded-full', p.color)} />
                              {p.label}
                            </span>
                            <span className="font-bold text-foreground tabular-nums">{p.count}</span>
                          </div>
                          <div className="h-2 w-full bg-hairline/10 rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${stats.total > 0 ? (p.count / stats.total) * 100 : 0}%` }}
                              className={cn('h-full rounded-full', p.color)}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="surface lg:col-span-2 p-5 md:p-6 rounded-[26px] space-y-5">
                    <h3 className="eyebrow flex items-center gap-2">
                      <CalendarRange className="w-3.5 h-3.5" /> Beban 7 hari ke depan
                    </h3>
                    <WorkloadChart tasks={tasks} onOpenTask={handleOpenDetail} />
                  </div>
                </div>

                {!isPro && (
                  <div className="surface p-6 md:p-10 rounded-[26px] relative overflow-hidden">
                    <Crown className="absolute top-6 right-6 w-24 h-24 text-primary opacity-[0.08]" />
                    <div className="relative z-10 max-w-2xl">
                      <p className="eyebrow flex items-center gap-2 mb-3">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary" /> Tugasku Pro
                      </p>
                      <h2 className="text-2xl md:text-4xl font-semibold text-foreground tracking-[-0.03em] mb-3 leading-tight">
                        Tugas tanpa batas, <span className="text-leaf">insight lebih dalam.</span>
                      </h2>
                      <p className="text-muted-foreground text-sm md:text-base leading-relaxed mb-6">
                        Tambah tugas sebanyak yang kamu butuhkan dan pantau pola produktivitas mingguanmu.
                      </p>
                      <Button onClick={() => setUpgradeOpen(true)} className="h-12 px-7 rounded-full font-semibold">
                        Upgrade ke Pro
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </main>
      </div>

      <MobileNav
        activeTab={activeTab}
        onTabChange={handleTabChange}
        onNewTask={() => openNewItem(activeTab === 'schedule' ? 'schedule' : 'task')}
        onOpenAssistant={() => setAssistantOpen(true)}
        onOpenProfile={() => setProfileOpen(true)}
        onOpenNotes={() => setNotesOpen(true)}
        onOpenTimer={() => setTimerOpen(true)}
        onOpenDeveloper={() => setDeveloperOpen(true)}
        onUpgrade={() => setUpgradeOpen(true)}
        onSignOut={signOut}
        isPro={isPro}
        isAdmin={profile?.is_admin}
      />

      <ToolDock
        hidden={assistantOpen}
        onOpenAssistant={() => setAssistantOpen(true)}
        onOpenTimer={() => setTimerOpen((o) => !o)}
        onOpenNotes={() => setNotesOpen(true)}
        timerRunning={timerRunning}
      />

      <AssistantPanel
        open={assistantOpen}
        onOpenChange={setAssistantOpen}
        assistant={assistant}
        onOpenTask={handleOpenTaskById}
        userName={firstName}
      />

      {taskDetailModal}
      <UpgradeModal open={upgradeOpen} onClose={() => setUpgradeOpen(false)} user={user} />
      <DeveloperModal open={developerOpen} onClose={() => setDeveloperOpen(false)} />
      <ProfileModal
        open={profileOpen}
        onClose={() => setProfileOpen(false)}
        user={user}
        profile={profile}
        pendingPayment={pendingPayment}
        isPro={isPro}
        planExpiresAt={planExpiresAt}
        onRefresh={refetchProfile}
        onSignOut={signOut}
        onUpgrade={() => { setProfileOpen(false); setUpgradeOpen(true) }}
      />

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold tracking-[-0.02em] text-center pt-2">
              {taskType === 'schedule' ? 'Tambah Jadwal' : 'Tambah Tugas'}
            </DialogTitle>
          </DialogHeader>
          <div className="px-1">
            {taskType === 'schedule' ? (
              <ScheduleForm
                onAdd={addTask}
                isLimitReached={isLimitReached}
                todoCount={todoTasks.length}
                freeLimit={taskLimit}
                onClose={() => setDialogOpen(false)}
              />
            ) : (
              <TaskForm
                onAdd={addTask}
                isLimitReached={isLimitReached}
                todoCount={todoTasks.length}
                freeLimit={taskLimit}
                onClose={() => setDialogOpen(false)}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>

      <FloatingNotepad open={notesOpen} onOpenChange={setNotesOpen} />
      <FloatingPomodoro open={timerOpen} onOpenChange={setTimerOpen} onRunningChange={setTimerRunning} />
    </div>
  )
}
