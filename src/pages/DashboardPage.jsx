import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useTasks } from '@/hooks/useTasks'
import { useProfile } from '@/hooks/useProfile'
import { Navbar } from '@/components/layout/Navbar'
import { KanbanBoard } from '@/components/tasks/KanbanBoard'
import { TaskForm } from '@/components/tasks/TaskForm'
import { TaskDetailModal } from '@/components/tasks/TaskDetailModal'
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
  ListTodo,
  CheckCircle2,
  Crown,
  Sparkles,
  Clock,
  Code2,
} from 'lucide-react'
import { format } from 'date-fns'
import { id as localeId } from 'date-fns/locale'

function StatCard({ label, value, icon: Icon, colorClass }) {
  return (
    <div className="bg-card border border-border rounded-xl p-4 flex items-center gap-4">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${colorClass}`}>
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-2xl font-bold text-foreground leading-none mt-0.5">{value}</p>
      </div>
    </div>
  )
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
  } = useTasks(user, isPro)

  const [dialogOpen,   setDialogOpen]   = useState(false)
  const [selectedTask, setSelectedTask] = useState(null)
  const [upgradeOpen,  setUpgradeOpen]  = useState(false)
  const [profileOpen,  setProfileOpen]  = useState(false)

  const handleOpenDetail  = (task) => setSelectedTask(task)
  const handleCloseDetail = ()     => setSelectedTask(null)

  const totalTasks      = todoTasks.length + doneTasks.length
  const completionRate  = totalTasks > 0 ? Math.round((doneTasks.length / totalTasks) * 100) : 0

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
        todoCount={todoTasks.length}
        freeLimit={FREE_TASK_LIMIT}
        isPro={isPro}
        onUpgrade={() => setUpgradeOpen(true)}
        onOpenProfile={() => setProfileOpen(true)}
        notifications={notifications}
      />

      <main className="relative flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">

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
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground flex items-center gap-2">
              Papan Tugasku
              <span aria-hidden>📋</span>
            </h1>
            <p className="text-muted-foreground mt-1 text-sm">
              Kelola semua tugasmu dalam satu papan visual.
            </p>
          </div>

          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button
                id="open-add-task-dialog"
                size="lg"
                className="flex items-center gap-2 shrink-0"
              >
                <Plus className="h-5 w-5" />
                Tambah Tugas
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>
                  {isLimitReached ? '⚡ Upgrade ke Pro' : '➕ Tugas Baru'}
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

        {/* Error banner */}
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-destructive/10 border border-destructive/20 flex items-center gap-3 text-destructive animate-fade-in">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <p className="text-sm">{error}</p>
          </div>
        )}

        {/* Stats cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <StatCard label="Total Tugas"       value={totalTasks}        icon={TrendingUp}  colorClass="bg-primary/15 text-primary" />
          <StatCard label="Perlu Dikerjakan"  value={todoTasks.length}  icon={ListTodo}    colorClass="bg-violet-400/15 text-violet-400" />
          <StatCard label="Selesai"           value={doneTasks.length}  icon={CheckCircle2} colorClass="bg-green-400/15 text-green-400" />
        </div>

        {/* Completion progress */}
        {totalTasks > 0 && (
          <div className="mb-8 p-4 bg-card border border-border rounded-xl flex items-center gap-4">
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

        {/* Kanban Board */}
        <KanbanBoard
          todoTasks={todoTasks}
          doneTasks={doneTasks}
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
