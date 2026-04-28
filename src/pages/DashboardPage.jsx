import { useState, useMemo } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useTasks } from '@/hooks/useTasks'
import { useProfile } from '@/hooks/useProfile'
import { Navbar } from '@/components/layout/Navbar'
import { KanbanBoard } from '@/components/tasks/KanbanBoard'
import { TaskForm } from '@/components/tasks/TaskForm'
import { TaskDetailModal } from '@/components/tasks/TaskDetailModal'
import { SearchFilter } from '@/components/tasks/SearchFilter'
import { UpgradeModal } from '@/components/subscription/UpgradeModal'
import { ProfileModal } from '@/components/profile/ProfileModal'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Plus,
  Loader2,
  AlertCircle,
  TrendingUp,
  LayoutDashboard,
  ListTodo,
  CheckCircle2,
  Crown,
  Sparkles,
  Clock,
  Code2,
} from 'lucide-react'
import { format } from 'date-fns'
import { id as localeId } from 'date-fns/locale'
import { cn } from '@/lib/utils'
import { differenceInDays, parseISO } from 'date-fns'

function StatCard({ label, value, icon, colorClass = '' }) {
  const Icon = icon
  const classes = colorClass || ''
  // Separate color classes for specific slots
  const textClass = classes.split(' ').find(c => c.startsWith('text-')) || 'text-primary'
  const bgClass = classes.split(' ').find(c => c.startsWith('bg-')) || 'bg-primary/10'
  const borderClass = classes.split(' ').find(c => c.startsWith('border-')) || 'border-primary/20'

  return (
    <div className="relative group overflow-hidden bg-card border border-border rounded-2xl p-5 flex items-center gap-4 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:shadow-primary/5 active:scale-[0.98]">
      <div className={cn(
        "w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:rotate-6",
        bgClass,
        borderClass,
        "border shadow-sm"
      )}>
        <Icon className={cn("h-6 w-6", textClass)} />
      </div>
      <div>
        <p className="text-xs font-semibold text-muted-foreground/60 uppercase tracking-widest mb-0.5">{label}</p>
        <p className="text-2xl font-extrabold text-foreground tracking-tight">{value}</p>
      </div>
      {/* Subtle interactive accent */}
      <div className={cn(
        "absolute -right-2 -bottom-2 w-12 h-12 rounded-full blur-2xl opacity-0 group-hover:opacity-20 transition-opacity duration-500",
        textClass.replace('text-', 'bg-')
      )} />
    </div>
  )
}

/** Filter + sort tasks based on query, priority filter, and sort key */
function applyFilters(tasks, query, priorities, sortKey) {
  let result = [...tasks]

  // Text search
  if (query.trim()) {
    const q = query.trim().toLowerCase()
    result = result.filter(t =>
      t.title.toLowerCase().includes(q) ||
      (t.notes || '').toLowerCase().includes(q)
    )
  }

  // Priority filter
  if (priorities.length > 0) {
    result = result.filter(t => priorities.includes(t.priority))
  }

  // Sort
  if (sortKey === 'deadline_asc') {
    result.sort((a, b) => a.deadline.localeCompare(b.deadline))
  } else if (sortKey === 'deadline_desc') {
    result.sort((a, b) => b.deadline.localeCompare(a.deadline))
  } else if (sortKey === 'priority') {
    const order = { High: 0, Medium: 1, Low: 2 }
    result.sort((a, b) => (order[a.priority] ?? 1) - (order[b.priority] ?? 1))
  } else {
    // 'created' — newest first (default order from API)
    result.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
  }

  return result
}

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
    todoTasks,
    finishedTasks,
    doneTasks,
    loading,
    error,
    isLimitReached,
    FREE_TASK_LIMIT,
    taskLimit,
    addTask,
    updateTask,
    deleteTask,
    notifications,
    requestNotificationPermission,
  } = useTasks(user, isPro)

  const [dialogOpen,   setDialogOpen]   = useState(false)
  const [selectedTask, setSelectedTask] = useState(null)
  const [upgradeOpen,  setUpgradeOpen]  = useState(false)
  const [profileOpen,  setProfileOpen]  = useState(false)
  const [showStats,    setShowStats]    = useState(false)

  // Search / filter / sort state
  const [searchQuery,      setSearchQuery]      = useState('')
  const [filterPriorities, setFilterPriorities] = useState([])
  const [sortKey,          setSortKey]          = useState('created')

  const handleOpenDetail  = (task) => setSelectedTask(task)
  const handleCloseDetail = ()     => setSelectedTask(null)

  const totalTasks      = (todoTasks?.length || 0) + (finishedTasks?.length || 0) + (doneTasks?.length || 0)
  const finishedTotal   = (finishedTasks?.length || 0) + (doneTasks?.length || 0)
  const completionRate  = totalTasks > 0 ? Math.round((finishedTotal / totalTasks) * 100) : 0

  const hasNotificationPermission = 'Notification' in window && Notification.permission === 'granted'

  const isFiltering = searchQuery.trim() !== '' || filterPriorities.length > 0 || sortKey !== 'created'

  // Apply filters to each column
  const filteredTodo     = useMemo(() => applyFilters(todoTasks,     searchQuery, filterPriorities, sortKey), [todoTasks,     searchQuery, filterPriorities, sortKey])
  const filteredFinished = useMemo(() => applyFilters(finishedTasks, searchQuery, filterPriorities, sortKey), [finishedTasks, searchQuery, filterPriorities, sortKey])
  const filteredDone     = useMemo(() => applyFilters(doneTasks,     searchQuery, filterPriorities, sortKey), [doneTasks,     searchQuery, filterPriorities, sortKey])

  const filteredTotal = filteredTodo.length + filteredFinished.length + filteredDone.length

  if (loading || profileLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-muted-foreground text-sm">Memuat tugas kamu...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Ambient glow background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-16 left-1/4 w-[500px] h-[300px] bg-primary/4 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-1/3 w-[400px] h-[250px] bg-violet-600/4 rounded-full blur-3xl" />
      </div>

      <Navbar
        user={user}
        onSignOut={signOut}
        todoCount={todoTasks?.length || 0}
        freeLimit={FREE_TASK_LIMIT}
        isPro={isPro}
        onUpgrade={() => setUpgradeOpen(true)}
        onOpenProfile={() => setProfileOpen(true)}
        notifications={notifications}
        onOpenDetail={handleOpenDetail}
      />

      <main className="relative flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">

        {/* Browser Notification Permission Prompt */}
        {!hasNotificationPermission && 'Notification' in window && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 p-4 rounded-xl bg-primary/10 border border-primary/20 animate-fade-in">
            <div className="flex items-center gap-2.5">
              <div className="h-5 w-5 text-primary shrink-0">🔔</div>
              <div>
                <p className="text-sm font-semibold text-foreground">Aktifkan Notifikasi</p>
                <p className="text-xs text-muted-foreground">Dapatkan pengingat deadline langsung di HP/Browser.</p>
              </div>
            </div>
            <Button size="sm" className="w-full sm:w-auto h-9 font-bold uppercase tracking-wider px-6" onClick={requestNotificationPermission}>
              Izinkan Notifikasi
            </Button>
          </div>
        )}

        {/* Pending payment banner */}
        {pendingPayment && !isPro && (
          <div className="flex items-start gap-3 mb-6 p-4 rounded-xl bg-amber-400/8 border border-amber-400/20 animate-fade-in">
            <Clock className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-amber-400">Pembayaran Sedang Diverifikasi</p>
              <p className="text-xs text-amber-400/70 mt-0.5">
                Pembayaran Pro kamu sedang diproses admin. Estimasi aktivasi: 1×24 jam.
              </p>
            </div>
            <button
              onClick={() => window.open('https://wa.me/6281363554262', '_blank')}
              className="text-xs text-amber-400 underline shrink-0 hover:text-amber-300"
            >
              Hubungi Admin
            </button>
          </div>
        )}

        {/* Pro active banner */}
        {isPro && planExpiresAt && (
          <div className="flex items-center gap-3 mb-6 p-3 rounded-xl bg-amber-400/8 border border-amber-400/20 animate-fade-in">
            <Crown className="h-4 w-4 text-amber-400 shrink-0" />
            <p className="text-sm text-amber-400">
              <span className="font-semibold">Pro Plan aktif</span>
              {' '}· Berlaku hingga{' '}
              <span className="font-semibold">
                {format(planExpiresAt, 'dd MMM yyyy', { locale: localeId })}
              </span>
            </p>
            <Sparkles className="h-3.5 w-3.5 text-amber-400/60 ml-auto" />
          </div>
        )}

        {/* Page header */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 mb-10">
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-foreground flex items-center gap-3">
              <span className="bg-gradient-to-br from-primary to-violet-400 bg-clip-text text-transparent">
                Dashboard
              </span>
              <span className="hidden sm:inline text-2xl" aria-hidden>🚀</span>
            </h1>
            <p className="hidden sm:block text-muted-foreground text-sm font-medium opacity-80">
              Pantau produktivitas dan kelola tugas harianmu.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
            <Button
              variant="outline"
              size="lg"
              className="sm:hidden flex items-center justify-center gap-2 h-12 bg-background/50 backdrop-blur-sm border-primary/20 hover:border-primary/40 transition-all"
              onClick={() => setShowStats(!showStats)}
            >
              <TrendingUp className="h-4 w-4 text-primary" />
              {showStats ? 'Sembunyikan Stat' : 'Lihat Statistik'}
            </Button>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  id="open-add-task-dialog"
                  size="lg"
                  className="flex items-center justify-center gap-2 h-12 sm:h-11 bg-primary hover:bg-primary/90 shadow-lg shadow-primary/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  <Plus className="h-5 w-5" />
                  Tambah Tugas Baru
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>
                    {isLimitReached ? '⚡ Upgrade ke Pro' : '➕ Buat Tugas Baru'}
                  </DialogTitle>
                </DialogHeader>
                <TaskForm
                  onAdd={addTask}
                  isLimitReached={isLimitReached}
                  todoCount={todoTasks.length}
                  freeLimit={taskLimit}
                  onClose={() => setDialogOpen(false)}
                  onUpgrade={() => { setDialogOpen(false); setUpgradeOpen(true) }}
                />
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Error banner */}
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-destructive/10 border border-destructive/20 flex items-center gap-3 text-destructive animate-fade-in">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <p className="text-sm">{error}</p>
          </div>
        )}

        {/* Stats Grid */}
        <div className={cn(
          "grid grid-cols-1 sm:grid-cols-4 gap-5 mb-10 transition-all duration-500 ease-in-out",
          showStats ? "grid opacity-100 translate-y-0" : "hidden sm:grid"
        )}>
          <StatCard label="Total Tugas"       value={totalTasks}        icon={LayoutDashboard} colorClass="bg-primary/15 text-primary border-primary/20" />
          <StatCard label="Perlu Dikerjakan"  value={todoTasks.length}  icon={ListTodo}        colorClass="bg-violet-400/15 text-violet-400 border-violet-400/20" />
          <StatCard label="Belum Submit"      value={finishedTasks.length} icon={Clock}        colorClass="bg-amber-400/15 text-amber-400 border-amber-400/20" />
          <StatCard label="Selesai"           value={doneTasks.length}  icon={CheckCircle2}    colorClass="bg-green-400/15 text-green-400 border-green-400/20" />
        </div>

        {/* Completion progress */}
        {totalTasks > 0 && (
          <div className={cn(
            "mb-8 p-4 bg-card border border-border rounded-xl flex items-center gap-4 transition-all",
            showStats ? "flex" : "hidden sm:flex"
          )}>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-foreground">Progress Keseluruhan</span>
                <span className="text-sm font-bold text-primary">{completionRate}%</span>
              </div>
              <div className="h-2 rounded-full bg-secondary overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-primary to-violet-400 transition-all duration-700"
                  style={{ width: `${completionRate}%` }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Search & Filter Bar */}
        <SearchFilter
          onSearch={setSearchQuery}
          onFilter={setFilterPriorities}
          onSort={setSortKey}
        />

        {/* Filtered result count banner */}
        {isFiltering && (
          <div className="mb-4 flex items-center gap-2 text-sm text-muted-foreground animate-fade-in">
            <span>Menampilkan</span>
            <span className="font-semibold text-foreground">{filteredTotal}</span>
            <span>dari</span>
            <span className="font-semibold text-foreground">{totalTasks}</span>
            <span>tugas</span>
          </div>
        )}

        {/* Kanban Board */}
        <KanbanBoard
          todoTasks={filteredTodo}
          finishedTasks={filteredFinished}
          doneTasks={filteredDone}
          onUpdateTask={updateTask}
          onDeleteTask={deleteTask}
          onOpenDetail={handleOpenDetail}
        />
      </main>

      {/* Task Detail Modal */}
      <TaskDetailModal
        task={selectedTask}
        open={!!selectedTask}
        onClose={handleCloseDetail}
        onUpdate={updateTask}
        onDelete={deleteTask}
      />

      {/* Upgrade / Checkout Modal */}
      <UpgradeModal
        open={upgradeOpen}
        onClose={() => setUpgradeOpen(false)}
        user={user}
      />

      {/* Profile Modal */}
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

      {/* ── Developer Footer ── */}
      <footer className="border-t border-border/40 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
          <p className="text-xs text-muted-foreground/50">
            © {new Date().getFullYear()} Tugasku
          </p>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground/50">
            <Code2 className="h-3 w-3" />
            <span>by</span>
            <a
              href="mailto:Idosiregar2006@gmail.com"
              className="font-medium hover:text-primary transition-colors"
            >
              Ido Refael Siregar
            </a>
          </div>
        </div>
      </footer>
    </div>
  )
}
