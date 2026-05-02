import { useState, useMemo, useEffect, useCallback, useRef } from 'react'
import { updateProfile } from '@/lib/supabase/profiles'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@/hooks/useAuth'
import { useTasks } from '@/hooks/useTasks'
import { useProfile } from '@/hooks/useProfile'
import { Sidebar } from '@/components/layout/Sidebar'
import { KanbanBoard } from '@/components/tasks/KanbanBoard'
import { TaskForm } from '@/components/tasks/TaskForm'
import { Spotlight } from '@/components/ui/spotlight'
import { BackgroundBeams } from '@/components/ui/background-beams'
import { TaskDetailModal } from '@/components/tasks/TaskDetailModal'
import { SearchFilter } from '@/components/tasks/SearchFilter'
import { UpgradeModal } from '@/components/subscription/UpgradeModal'
import { ProfileModal } from '@/components/profile/ProfileModal'
import { NotificationPanel } from '@/components/layout/NotificationPanel'
import { ScheduleView } from '@/components/tasks/ScheduleView'
import { DeveloperModal } from '@/components/layout/DeveloperModal'
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
  Sparkles,
  Edit2,
  Check,
  X,
  ChevronDown,
  ChevronUp,
  Search,
  Bell,
  LayoutDashboard,
  Crown,
  TrendingUp,
  BarChart3,
  Calendar,
  MousePointer2,
  Clock,
  AlertTriangle,
  CheckCircle2
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
    tasks = [],
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
  } = useTasks(user, isPro)

  const [dialogOpen, setDialogOpen] = useState(false)
  const [taskType, setTaskType] = useState('task') // 'task' | 'schedule'
  const [selectedTask, setSelectedTask] = useState(null)
  const [upgradeOpen, setUpgradeOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterPriorities, setFilterPriorities] = useState([])
  const [sortKey, setSortKey] = useState('created')
  const [bgImage, setBgImage] = useState(() => localStorage.getItem('tugasku-bg') || 'bg-slate-900')
  const [showStats, setShowStats] = useState(true)
  const [activeTab, setActiveTab] = useState('dashboard')
  const [developerOpen, setDeveloperOpen] = useState(false)

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

  // Real data for Insights
  const stats = useMemo(() => {
    const allTasks = [...(todoTasks || []), ...(finishedTasks || []), ...(doneTasks || [])]
    const high = allTasks.filter(t => t.priority === 'High').length
    const medium = allTasks.filter(t => t.priority === 'Medium').length
    const low = allTasks.filter(t => t.priority === 'Low').length
    
    return {
      high, medium, low,
      todo: todoTasks?.length || 0,
      finished: finishedTasks?.length || 0,
      done: doneTasks?.length || 0,
      total: totalTasks
    }
  }, [todoTasks, finishedTasks, doneTasks, totalTasks])

  const initials = useMemo(() => {
    if (profile?.full_name) {
      return profile.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    }
    return user?.email?.charAt(0).toUpperCase() || '?'
  }, [profile, user])

  const applyFilters = useCallback((tasks) => {
    if (!tasks) return []
    // Filter by task_type first (Workspace only shows 'task')
    let result = tasks.filter(t => t.task_type === 'task' || !t.task_type)
    
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
    <div className={cn("min-h-screen flex bg-background transition-all duration-500 relative overflow-hidden", bgImage)}>
      <div className="noise z-0" />
      
      {/* Sidebar */}
      <Sidebar 
        activeTab={activeTab} 
        onTabChange={(tab) => {
          if (tab === 'settings') setProfileOpen(true)
          else setActiveTab(tab)
        }}
        isPro={isPro}
        isAdmin={profile?.is_admin}
        user={user}
        onOpenProfile={() => setProfileOpen(true)}
        onOpenDeveloper={() => setDeveloperOpen(true)}
        onSignOut={signOut}
      />

      <div className="flex-1 flex flex-col h-screen overflow-hidden relative z-10">
        {/* Top Bar */}
        <header className="h-20 flex items-center justify-between px-8 bg-background/30 backdrop-blur-xl border-b border-white/10 shrink-0 sticky top-0 z-40">
          <div className="flex items-center gap-4">
             <h1 className="text-xl font-black text-foreground tracking-tight">
               {activeTab === 'dashboard' ? 'Workspace' : activeTab === 'schedule' ? 'Daily Schedule' : 'Analytics'}
             </h1>
             <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-[10px] font-bold text-primary uppercase tracking-widest">
               <Sparkles className="w-3 h-3" />
               Live Sync Active
             </div>
          </div>

          <div className="flex items-center gap-4">
             <div className="hidden lg:flex items-center gap-2 px-4 py-2 rounded-2xl bg-white/5 border border-white/5">
                <Search className="w-4 h-4 text-muted-foreground" />
                <input 
                  type="text" 
                  placeholder="Quick search..." 
                  className="bg-transparent border-none outline-none text-xs text-foreground placeholder:text-muted-foreground w-40"
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
             </div>
             <NotificationPanel 
                notifications={notifications} 
                onOpenDetail={handleOpenDetail} 
             />
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-8 relative">
           {/* Interactive Background Elements */}
           <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
              <Spotlight className="-top-40 left-0" fill="hsl(var(--primary))" />
              <BackgroundBeams />
           </div>

           <div className="relative z-10 max-w-7xl mx-auto space-y-10">
             {/* Welcome Header */}
             <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                     <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em] bg-primary/10 px-3 py-1 rounded-full border border-primary/20">Active Session</span>
                     <span className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</span>
                  </div>
                  <h2 className="text-3xl md:text-4xl font-black text-foreground tracking-tight">
                    Welcome back, <span className="text-primary">{profile?.full_name?.split(' ')[0] || user?.email?.split('@')[0]}</span>.
                  </h2>
                  
                  {/* Editable Quote */}
                  <div className="mt-4 group/quote relative inline-block max-w-xl">
                    {isEditingQuote ? (
                      <div className="flex items-center gap-2 animate-fade-in">
                        <input 
                          type="text" 
                          value={tempQuote}
                          onChange={(e) => setTempQuote(e.target.value)}
                          className="bg-white/5 border-b-2 border-primary outline-none text-sm font-bold py-1 px-2 text-foreground w-full min-w-[300px]"
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSaveQuote()
                            if (e.key === 'Escape') setIsEditingQuote(false)
                          }}
                        />
                        <button onClick={handleSaveQuote} className="p-1.5 text-primary hover:bg-primary/10 rounded-lg transition-colors"><Check className="h-4 w-4" /></button>
                      </div>
                    ) : (
                      <p 
                        onClick={() => { setTempQuote(userQuote); setIsEditingQuote(true); }}
                        className="text-sm font-bold text-muted-foreground italic cursor-pointer hover:text-foreground transition-colors flex items-center gap-2"
                      >
                        "{userQuote}"
                        <Edit2 className="h-3 w-3 opacity-0 group-hover/quote:opacity-100 transition-opacity" />
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                   <div className="text-right hidden sm:block">
                      <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Workspace Health</p>
                      <p className="text-sm font-black text-foreground">{completionRate}% Completed</p>
                   </div>
                   <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center">
                      <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center text-primary font-black text-xs">
                        {initials}
                      </div>
                   </div>
                </div>
             </div>

             {activeTab === 'dashboard' ? (
               <>
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
                            { label: 'Total Tasks', value: totalTasks, color: 'text-primary' },
                            { label: 'To Do', value: todoTasks.length, color: 'text-violet-500' },
                            { label: 'Pending', value: finishedTasks.length, color: 'text-amber-500' },
                            { label: 'Completed', value: doneTasks.length, color: 'text-emerald-500' },
                          ].map((s) => (
                            <div key={s.label} className="bg-card/40 backdrop-blur-xl border border-white/10 dark:border-white/5 p-4 rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.1)] hover:border-primary/30 transition-all duration-300">
                              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">{s.label}</p>
                              <p className={cn("text-2xl font-black drop-shadow-sm", s.color)}>{s.value}</p>
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
                            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Global Progress</span>
                            <span className="text-[10px] font-bold text-primary">{completionRate}%</span>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* SEARCH & FILTERS BAR */}
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col md:flex-row items-center gap-4 bg-card/30 backdrop-blur-2xl p-2 rounded-[28px] border border-white/10 dark:border-white/5 shadow-lg shadow-black/5">
                    <div className="flex-1 w-full">
                      <SearchFilter onSearch={setSearchQuery} onFilter={setFilterPriorities} onSort={setSortKey} />
                    </div>
                    
                    <div className="flex items-center gap-2 p-1.5 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10">
                      {[
                        { id: 'bg-background', class: 'bg-slate-900', label: 'Default' },
                        { id: 'bg-[#0a0a0c]',  class: 'bg-[#0a0a0c]', label: 'Midnight' },
                        { id: 'bg-[#0f172a]',  class: 'bg-[#0f172a]', label: 'Deep Ink' },
                        { id: 'bg-[#13111c]',  class: 'bg-[#13111c]', label: 'Aura Dark' },
                        { id: 'bg-slate-50 dark:bg-slate-950', class: 'bg-slate-200', label: 'Adaptive' },
                      ].map(bg => (
                        <button 
                          key={bg.id}
                          title={bg.label}
                          onClick={() => setBgImage(bg.id)}
                          className={cn(
                            "w-7 h-7 rounded-lg border-2 transition-all hover:scale-110",
                            bgImage === bg.id ? "border-primary shadow-[0_0_10px_hsl(var(--primary)/0.5)]" : "border-transparent opacity-60 hover:opacity-100"
                          )}
                        >
                          <div className={cn("w-full h-full rounded-[4px]", bg.class)} />
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* NEW TASK BUTTON BELOW SEARCH */}
                  <div className="px-2">
                    <Button 
                      onClick={() => { setTaskType('task'); setDialogOpen(true); }}
                      className="w-full md:w-auto h-12 px-8 rounded-2xl bg-primary hover:bg-primary/90 text-white font-black shadow-lg shadow-primary/20 transition-all flex items-center gap-2 group"
                    >
                      <Plus className="h-5 w-5 group-hover:rotate-90 transition-transform" /> 
                      <span className="uppercase tracking-widest text-xs">Buat Task Baru</span>
                    </Button>
                  </div>
                </div>

                {/* THE BOARD */}
                <div className="relative w-full min-h-[900px]">
                   <KanbanBoard
                      todoTasks={filteredTodo}
                      finishedTasks={filteredFinished}
                      doneTasks={filteredDone}
                      onUpdateTask={updateTask}
                      onDeleteTask={deleteTask}
                      onOpenDetail={handleOpenDetail}
                    />
                </div>
               </>
             ) : activeTab === 'schedule' ? (
                <ScheduleView 
                  tasks={tasks.filter(t => t.task_type === 'schedule')} 
                  onAddTask={() => { setTaskType('schedule'); setDialogOpen(true); }}
                  onEditTask={handleOpenDetail}
                />
             ) : (
               /* Analytics Tab Content */
               <div className="space-y-10 animate-fade-in">
                  {/* Top Level Real Stats */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                     {[
                       { label: 'Total Tasks', value: stats.total, icon: LayoutDashboard, color: 'text-primary' },
                       { label: 'In Progress', value: stats.todo, icon: Clock, color: 'text-amber-400' },
                       { label: 'Completed', value: stats.finished + stats.done, icon: CheckCircle2, color: 'text-emerald-400' },
                       { label: 'Avg. Completion', value: `${completionRate}%`, icon: TrendingUp, color: 'text-violet-400' },
                     ].map((s) => (
                       <div key={s.label} className="p-5 rounded-3xl bg-card/40 backdrop-blur-3xl border border-white/10 shadow-xl group hover:border-primary/30 transition-all">
                          <div className="flex items-center gap-3 mb-3">
                            <div className={cn("p-2 rounded-xl bg-white/5", s.color)}>
                              <s.icon className="w-4 h-4" />
                            </div>
                            <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{s.label}</span>
                          </div>
                          <p className="text-2xl font-black text-foreground">{s.value}</p>
                       </div>
                     ))}
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Priority Breakdown (Real Data) */}
                    <div className="lg:col-span-1 p-8 rounded-[40px] bg-card/40 backdrop-blur-3xl border border-white/10 shadow-2xl space-y-6">
                        <h3 className="text-sm font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4" /> Priority Breakdown
                        </h3>
                        <div className="space-y-6 pt-4">
                           {[
                             { label: 'High Priority', count: stats.high, color: 'bg-red-500', pct: stats.total > 0 ? (stats.high / stats.total) * 100 : 0 },
                             { label: 'Medium Priority', count: stats.medium, color: 'bg-amber-400', pct: stats.total > 0 ? (stats.medium / stats.total) * 100 : 0 },
                             { label: 'Low Priority', count: stats.low, color: 'bg-blue-400', pct: stats.total > 0 ? (stats.low / stats.total) * 100 : 0 },
                           ].map((p) => (
                             <div key={p.label} className="space-y-2">
                               <div className="flex justify-between text-[11px] font-bold">
                                 <span className="text-foreground/70">{p.label}</span>
                                 <span className="text-foreground">{p.count} tasks</span>
                               </div>
                               <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                                 <motion.div 
                                   initial={{ width: 0 }}
                                   animate={{ width: `${p.pct}%` }}
                                   className={cn("h-full rounded-full", p.color)}
                                 />
                               </div>
                             </div>
                           ))}
                        </div>
                    </div>

                    {/* Productivity Trend (Enhanced Mockup) */}
                    <div className="lg:col-span-2 p-8 rounded-[40px] bg-card/40 backdrop-blur-3xl border border-white/10 shadow-2xl space-y-8">
                        <div className="flex items-center justify-between">
                          <h3 className="text-sm font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                            <TrendingUp className="w-4 h-4" /> Weekly Performance
                          </h3>
                          <div className="flex gap-2">
                            <span className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-400">
                              <div className="w-2 h-2 rounded-full bg-emerald-400" /> Tasks Done
                            </span>
                            <span className="flex items-center gap-1.5 text-[10px] font-bold text-white/20">
                              <div className="w-2 h-2 rounded-full bg-white/20" /> Planned
                            </span>
                          </div>
                        </div>
                        <div className="flex items-end justify-between h-48 gap-4 px-2">
                           {[45, 30, 85, 60, 95, 40, 75].map((h, i) => (
                             <div key={i} className="flex-1 group relative">
                               <div className="absolute inset-0 flex items-end justify-center">
                                  <div className="w-full h-full bg-white/5 rounded-t-2xl group-hover:bg-white/10 transition-colors" />
                               </div>
                               <motion.div 
                                 initial={{ height: 0 }}
                                 animate={{ height: `${h}%` }}
                                 className="relative w-full rounded-t-2xl bg-gradient-to-t from-primary/80 to-primary shadow-[0_0_20px_rgba(var(--primary-rgb),0.3)]"
                               >
                                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-primary text-white text-[9px] font-black px-2 py-1 rounded-md">
                                    {Math.round(h / 10)}
                                  </div>
                               </motion.div>
                               <div className="mt-4 text-center text-[10px] font-black text-muted-foreground uppercase opacity-40">
                                 {['Sen','Sel','Rab','Kam','Jum','Sab','Min'][i]}
                               </div>
                             </div>
                           ))}
                        </div>
                    </div>
                  </div>

                  {/* Pro Insight CTA */}
                  <div className="p-10 rounded-[48px] bg-gradient-to-br from-primary/10 via-violet-500/5 to-transparent border border-primary/20 relative overflow-hidden group">
                     <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
                        <Crown className="w-32 h-32 text-primary" />
                     </div>
                     <div className="relative z-10 max-w-2xl">
                        <span className="inline-block px-3 py-1 rounded-full bg-primary/20 text-primary text-[10px] font-black uppercase tracking-widest mb-4">Pro Feature Insight</span>
                        <h2 className="text-3xl font-black text-foreground tracking-tighter mb-4 leading-none">Unlock Deep Workflow Analytics</h2>
                        <p className="text-muted-foreground text-sm leading-relaxed mb-8">
                           Dapatkan laporan mendalam tentang efisiensi kerja Anda, waktu rata-rata penyelesaian tugas, dan identifikasi "bottle-neck" dalam produktivitas mingguan Anda.
                        </p>
                        {!isPro && (
                          <Button className="h-12 px-8 rounded-2xl bg-primary hover:bg-primary/90 text-white font-black shadow-xl shadow-primary/30 uppercase tracking-widest text-xs">
                             Aktifkan Analytics Pro
                          </Button>
                        )}
                     </div>
                  </div>
               </div>
             )}
           </div>
      </main>

      <TaskDetailModal task={selectedTask} open={!!selectedTask} onClose={handleCloseDetail} onUpdate={updateTask} onDelete={deleteTask} />
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
        <DialogContent className="sm:max-w-md bg-card/90 backdrop-blur-2xl border-primary/20 rounded-[40px]">
          <DialogHeader><DialogTitle className="text-2xl font-black text-center pt-4 uppercase">New Task</DialogTitle></DialogHeader>
          <div className="p-2">
            <TaskForm
              onAdd={addTask}
              isLimitReached={isLimitReached}
              todoCount={todoTasks.length}
              freeLimit={taskLimit}
              defaultType={taskType}
              onClose={() => setDialogOpen(false)}
              onUpgrade={() => { setDialogOpen(false); setUpgradeOpen(true) }}
            />
          </div>
        </DialogContent>
      </Dialog>
      </div>
    </div>
  )
}
