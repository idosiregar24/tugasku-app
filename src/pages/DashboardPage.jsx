import { useState, useMemo, useEffect, useCallback, useRef } from 'react'
import { updateProfile } from '@/lib/supabase/profiles'
import { motion, AnimatePresence } from 'framer-motion'
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
  Sparkles,
  Edit2,
  Check,
  X,
  ChevronDown,
  ChevronUp,
  LayoutDashboard,
  MousePointer
} from 'lucide-react'
import { cn } from '@/lib/utils'

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
    todoTasks = [],
    finishedTasks = [],
    doneTasks = [],
    loading,
    isLimitReached,
    FREE_TASK_LIMIT,
    taskLimit,
    addTask,
    updateTask,
    deleteTask,
    notifications,
    requestNotificationPermission,
  } = useTasks(user, isPro)

  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedTask, setSelectedTask] = useState(null)
  const [upgradeOpen, setUpgradeOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterPriorities, setFilterPriorities] = useState([])
  const [sortKey, setSortKey] = useState('created')
  const [bgImage, setBgImage] = useState(() => localStorage.getItem('tugasku-bg') || 'bg-board')
  const [showStats, setShowStats] = useState(true)

  // Editable Quote State
  const [isEditingQuote, setIsEditingQuote] = useState(false)
  const [userQuote, setUserQuote] = useState(() => 
    localStorage.getItem('tugasku-quote') || "Fokus pada proses, hasil akan mengikuti. ✨"
  )
  const [tempQuote, setTempQuote] = useState(userQuote)

  useEffect(() => {
    localStorage.setItem('tugasku-bg', bgImage)
  }, [bgImage])

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

  const fileInputRef = useRef(null)
  const [isUploading, setIsUploading] = useState(false)

  const handleAvatarUpload = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    const reader = new FileReader()
    reader.onload = (event) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        const MAX_SIZE = 250
        let width = img.width
        let height = img.height

        if (width > height) {
          if (width > MAX_SIZE) {
            height *= MAX_SIZE / width
            width = MAX_SIZE
          }
        } else {
          if (height > MAX_SIZE) {
            width *= MAX_SIZE / height
            height = MAX_SIZE
          }
        }

        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')
        ctx.drawImage(img, 0, 0, width, height)
        const dataUrl = canvas.toDataURL('image/webp', 0.8)
        
        updateProfile(user.id, { avatar_url: dataUrl })
          .then(() => refetchProfile())
          .catch(err => console.error("Failed to update avatar", err))
          .finally(() => setIsUploading(false))
      }
      img.src = event.target.result
    }
    reader.readAsDataURL(file)
  }

  const totalTasks = (todoTasks?.length || 0) + (finishedTasks?.length || 0) + (doneTasks?.length || 0)
  const finishedTotal = (finishedTasks?.length || 0) + (doneTasks?.length || 0)
  const completionRate = totalTasks > 0 ? Math.round((finishedTotal / totalTasks) * 100) : 0

  const initials = useMemo(() => {
    if (profile?.full_name) {
      return profile.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    }
    return user?.email?.charAt(0).toUpperCase() || '?'
  }, [profile, user])

  const applyFilters = useCallback((tasks) => {
    if (!tasks) return []
    let result = [...tasks]
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
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className={cn("min-h-screen flex flex-col transition-all duration-500 relative overflow-hidden", bgImage)}>
      <div className="noise" />
      
      {/* Background Dot Grid */}
      {bgImage === 'bg-board' && (
        <div className="fixed inset-0 pointer-events-none opacity-[0.07] z-0" 
          style={{ backgroundImage: 'radial-gradient(circle, currentColor 2px, transparent 2px)', backgroundSize: '40px 40px' }} />
      )}

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

      <main className="flex-1 overflow-y-auto px-4 py-6 sm:px-8 relative z-10 w-full">
        <div className="w-full space-y-8">
          
          {/* HIDEABLE STATS BAR */}
          <div className="space-y-2">
            <button 
              onClick={() => setShowStats(!showStats)}
              className="flex items-center gap-2 text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] hover:text-primary transition-colors mb-2 px-2"
            >
              {showStats ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
              {showStats ? 'Hide Overview' : 'Show Overview'}
            </button>
            
            <AnimatePresence>
              {showStats && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-2">
                    {[
                      { label: 'Total Tugas', value: totalTasks, color: 'text-primary' },
                      { label: 'Perlu Dikerjakan', value: todoTasks.length, color: 'text-violet-500' },
                      { label: 'Belum Submit', value: finishedTasks.length, color: 'text-amber-500' },
                      { label: 'Selesai', value: doneTasks.length, color: 'text-emerald-500' },
                    ].map((s) => (
                      <div key={s.label} className="bg-card/40 backdrop-blur-xl border border-border/40 p-4 rounded-[24px] shadow-sm">
                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">{s.label}</p>
                        <p className={cn("text-2xl font-black", s.color)}>{s.value}</p>
                      </div>
                    ))}
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="px-2 mt-4 max-w-4xl">
                    <div className="h-2 w-full bg-muted/20 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${completionRate}%` }}
                        className="h-full bg-primary"
                      />
                    </div>
                    <div className="flex justify-between mt-2 px-1">
                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Progress Keseluruhan</span>
                      <span className="text-[10px] font-bold text-primary">{completionRate}%</span>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* SEARCH & FILTERS BAR */}
          <div className="flex flex-col md:flex-row items-center gap-4 bg-card/20 backdrop-blur-md p-2 rounded-[28px] border border-border/20">
            <div className="flex-1 w-full">
              <SearchFilter onSearch={setSearchQuery} onFilter={setFilterPriorities} onSort={setSortKey} />
            </div>
            
            <div className="flex items-center gap-1.5 p-1.5 bg-background/50 rounded-2xl border border-border/40">
              {[
                { id: 'bg-background', class: 'bg-slate-200 dark:bg-slate-800' },
                { id: 'bg-slate-900',  class: 'bg-slate-950' },
                { id: 'bg-violet-950/20', class: 'bg-violet-600' },
                { id: 'bg-board',      class: 'bg-white border-2 border-dashed border-muted' },
              ].map(bg => (
                <button 
                  key={bg.id}
                  onClick={() => setBgImage(bg.id)}
                  className={cn(
                    "w-8 h-8 rounded-xl border-2 transition-all",
                    bgImage === bg.id ? "border-primary scale-110" : "border-transparent opacity-50 hover:opacity-100"
                  )}
                >
                  <div className={cn("w-full h-full rounded-[8px]", bg.class)} />
                </button>
              ))}
            </div>
            
            <Button 
              onClick={() => setDialogOpen(true)}
              className="h-12 px-6 rounded-2xl bg-primary hover:bg-primary/90 text-white font-black shadow-lg shadow-primary/20 flex items-center gap-2"
            >
              <Plus className="h-5 w-5" /> BUAT TASK BARU
            </Button>
          </div>

          {/* PROFILE & QUOTE SECTION */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-6 items-center">
            {/* PHOTO CARD */}
            <div className="md:col-span-3 lg:col-span-2 flex justify-center">
              <div className="relative group">
                <input type="file" accept="image/*" ref={fileInputRef} onChange={handleAvatarUpload} className="hidden" />
                <motion.div 
                  whileHover={{ y: -4, scale: 1.02 }}
                  className="w-24 h-24 rounded-full bg-card p-1 shadow-[0_0_30px_-5px_hsl(var(--primary)/0.4)] border-4 border-white/50 dark:border-white/10 overflow-hidden relative transition-all duration-500"
                >
                  {isUploading ? (
                    <div className="w-full h-full bg-secondary/50 flex items-center justify-center rounded-full">
                      <Loader2 className="h-5 w-5 animate-spin text-primary" />
                    </div>
                  ) : profile?.avatar_url ? (
                    <img src={profile.avatar_url} alt="Profile" className="w-full h-full object-cover rounded-full" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-primary to-violet-500 flex items-center justify-center text-3xl font-black text-white rounded-full">
                      {initials}
                    </div>
                  )}
                  <div 
                    className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all duration-300 cursor-pointer rounded-full" 
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Edit2 className="h-5 w-5 text-white drop-shadow-md" />
                  </div>
                </motion.div>
                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-primary/90 backdrop-blur-md text-white px-4 py-1 rounded-full font-black text-[10px] shadow-lg whitespace-nowrap uppercase tracking-widest z-10 ring-2 ring-background">
                  {profile?.full_name || user?.email?.split('@')[0]}
                </div>
              </div>
            </div>

            {/* QUOTE CARD */}
            <div className="md:col-span-9 lg:col-span-10 bg-card/50 backdrop-blur-2xl border border-border/50 p-5 md:p-6 rounded-[24px] shadow-sm relative min-h-[96px] flex flex-col justify-center overflow-hidden">
              <div className="absolute -top-12 -right-12 opacity-[0.03] rotate-12 scale-150 pointer-events-none">
                <Sparkles className="h-40 w-40 text-primary" />
              </div>
              <div className="relative z-10 group flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                    <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em] opacity-80">Personal Board</p>
                  </div>
                  {isEditingQuote ? (
                    <div className="flex items-center gap-3 animate-fade-in mt-1">
                      <input 
                        type="text" 
                        value={tempQuote}
                        onChange={(e) => setTempQuote(e.target.value)}
                        className="w-full bg-background/50 backdrop-blur-md border-2 border-primary/30 focus:border-primary rounded-2xl px-5 py-2.5 text-lg md:text-xl font-bold outline-none shadow-inner transition-colors"
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleSaveQuote()
                          if (e.key === 'Escape') setIsEditingQuote(false)
                        }}
                      />
                      <button onClick={handleSaveQuote} className="p-3.5 bg-primary text-white rounded-2xl shadow-lg shadow-primary/30 hover:bg-primary/90 transition-all active:scale-95"><Check className="h-5 w-5" /></button>
                    </div>
                  ) : (
                    <div 
                      onClick={() => { setTempQuote(userQuote); setIsEditingQuote(true); }}
                      className="cursor-pointer relative group/text inline-block mt-1"
                    >
                      <h2 className="text-xl md:text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-br from-foreground to-foreground/60 tracking-tight leading-tight pr-8">
                        "{userQuote}"
                      </h2>
                      <div className="absolute right-0 top-1/2 -translate-y-1/2 opacity-0 group-hover/text:opacity-100 transition-all duration-300 translate-x-2 group-hover/text:translate-x-0 bg-primary/10 dark:bg-primary/20 p-2 rounded-xl">
                        <Edit2 className="h-4 w-4 text-primary" />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* THE BOARD (FULL WIDTH) */}
          <div className="relative w-full p-2 sm:p-4 min-h-[900px]">
             <KanbanBoard
                todoTasks={filteredTodo}
                finishedTasks={filteredFinished}
                doneTasks={filteredDone}
                onUpdateTask={updateTask}
                onDeleteTask={deleteTask}
                onOpenDetail={handleOpenDetail}
              />
          </div>
        </div>
      </main>

      <TaskDetailModal task={selectedTask} open={!!selectedTask} onClose={handleCloseDetail} onUpdate={updateTask} onDelete={deleteTask} />
      <UpgradeModal open={upgradeOpen} onClose={() => setUpgradeOpen(false)} user={user} />
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
        <DialogContent className="sm:max-w-md bg-card/90 backdrop-blur-2xl border-primary/20 rounded-[40px]">
          <DialogHeader><DialogTitle className="text-2xl font-black text-center pt-4 uppercase">New Task</DialogTitle></DialogHeader>
          <div className="p-2">
            <TaskForm
              onAdd={addTask}
              isLimitReached={isLimitReached}
              todoCount={todoTasks.length}
              freeLimit={taskLimit}
              onClose={() => setDialogOpen(false)}
              onUpgrade={() => { setDialogOpen(false); setUpgradeOpen(true) }}
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
