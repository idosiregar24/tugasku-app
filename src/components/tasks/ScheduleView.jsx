import { useMemo, useEffect, useRef } from 'react'
import { Clock, Calendar, ChevronRight, Plus, MapPin } from 'lucide-react'
import { cn } from '@/lib/utils'
import { format, parseISO, isSameDay } from 'date-fns'
import { id as localeId } from 'date-fns/locale'
import { motion } from 'framer-motion'

export function ScheduleView({ tasks = [], onAddTask, onEditTask }) {
  const today = new Date()
  const currentHour = today.getHours()
  const scrollContainerRef = useRef(null)
  const hourRefs = useRef({})

  // Auto-scroll ke jam sekarang saat mount
  useEffect(() => {
    const target = hourRefs.current[currentHour]
    if (target && scrollContainerRef.current) {
      setTimeout(() => {
        target.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }, 500)
    }
  }, [currentHour])
  
  // Filter tasks that have time and are for today (or have no date but have time)
  const dailyTasks = useMemo(() => {
    if (!Array.isArray(tasks)) return []
    return tasks
      .filter(t => {
        if (!t.start_time || typeof t.start_time !== 'string') return false
        // Jika ada deadline, pastikan hari ini
        if (t.deadline && typeof t.deadline === 'string') {
          try {
            const dDate = parseISO(t.deadline)
            return isSameDay(dDate, today)
          } catch (e) {
            return true 
          }
        }
        return true
      })
      .sort((a, b) => (a.start_time || '').localeCompare(b.start_time || ''))
  }, [tasks, today])

  const hours = Array.from({ length: 24 }, (_, i) => i)

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-foreground tracking-tight">Daily Schedule</h2>
          <p className="text-sm text-muted-foreground flex items-center gap-2 mt-1 font-medium">
            <Calendar className="w-4 h-4" /> {format(today, 'EEEE, dd MMMM yyyy', { locale: localeId })}
          </p>
        </div>
        <button 
          onClick={onAddTask}
          className="h-11 px-6 rounded-2xl bg-primary text-white font-black text-xs uppercase tracking-widest shadow-lg shadow-primary/20 hover:opacity-90 transition-all flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Tambah Jadwal
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Timeline View */}
        <div className="lg:col-span-3 space-y-4">
          <div 
            ref={scrollContainerRef}
            className="p-8 rounded-[40px] bg-card/40 backdrop-blur-3xl border border-white/10 shadow-2xl relative overflow-hidden max-h-[70vh] overflow-y-auto custom-scrollbar"
          >
            <div className="absolute top-0 left-20 bottom-0 w-px bg-white/5" />
            
            <div className="space-y-0">
              {hours.map(hour => {
                const timeStr = `${hour.toString().padStart(2, '0')}:00`
                const isNow = hour === currentHour
                const tasksInHour = dailyTasks.filter(t => t.start_time.startsWith(hour.toString().padStart(2, '0')))
                
                return (
                  <div 
                    key={hour} 
                    ref={el => hourRefs.current[hour] = el}
                    className={cn(
                      "group flex gap-8 min-h-[100px] relative transition-all duration-500",
                      isNow && "bg-primary/5 rounded-2xl -mx-4 px-4 border border-primary/10"
                    )}
                  >
                    {/* Time Label */}
                    <div className="w-12 text-right pt-4">
                      <span className={cn(
                        "text-[10px] font-black uppercase tracking-widest transition-colors",
                        isNow ? "text-primary" : "text-muted-foreground/40 group-hover:text-primary"
                      )}>
                        {timeStr}
                      </span>
                      {isNow && (
                        <motion.div 
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="flex items-center justify-end gap-1 mt-1"
                        >
                           <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                           <span className="text-[8px] font-black text-primary uppercase">Now</span>
                        </motion.div>
                      )}
                    </div>

                    {/* Task Slot */}
                    <div className="flex-1 py-4 border-t border-white/5 relative">
                      {tasksInHour.length > 0 ? (
                        <div className="flex flex-col gap-3">
                          {tasksInHour.map(task => (
                            <motion.button
                              key={task.id}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              onClick={() => onEditTask(task)}
                              className={cn(
                                "flex items-center justify-between p-4 rounded-2xl border transition-all text-left group/item",
                                task.priority === 'High' ? "bg-red-500/10 border-red-500/20 hover:border-red-500/40" :
                                task.priority === 'Medium' ? "bg-amber-400/10 border-amber-400/20 hover:border-amber-400/40" :
                                "bg-blue-400/10 border-blue-400/20 hover:border-blue-400/40"
                              )}
                            >
                              <div className="flex items-center gap-4">
                                <div className={cn(
                                  "w-2 h-10 rounded-full",
                                  task.priority === 'High' ? "bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.4)]" :
                                  task.priority === 'Medium' ? "bg-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.4)]" :
                                  "bg-blue-400 shadow-[0_0_10px_rgba(96,165,250,0.4)]"
                                )} />
                                <div>
                                  <p className="text-sm font-black text-foreground">{task.title}</p>
                                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1 flex items-center gap-1.5">
                                    <Clock className="w-3 h-3" /> {task.start_time} - {task.end_time || '??:??'}
                                  </p>
                                </div>
                              </div>
                              <ChevronRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover/item:opacity-100 transition-all translate-x-[-10px] group-hover/item:translate-x-0" />
                            </motion.button>
                          ))}
                        </div>
                      ) : (
                        <div className="h-full flex items-center">
                          <div className="w-2 h-2 rounded-full bg-white/5 group-hover:bg-primary/20 transition-all" />
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-primary/10 border border-primary/20 space-y-4">
             <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-primary text-white">
                  <Clock className="w-4 h-4" />
                </div>
                <h4 className="text-xs font-black uppercase tracking-widest text-primary">Summary</h4>
             </div>
             <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-muted-foreground">Total Jadwal</span>
                  <span className="text-sm font-black text-foreground">{dailyTasks.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-muted-foreground">Selesai</span>
                  <span className="text-sm font-black text-emerald-400">
                    {dailyTasks.filter(t => t.status === 'done').length}
                  </span>
                </div>
             </div>
          </div>

          <div className="p-6 rounded-3xl bg-card/40 border border-white/10 space-y-4">
             <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Next Activity</h4>
             {dailyTasks.filter(t => t.status !== 'done').slice(0, 1).map(task => (
               <div key={task.id} className="space-y-2">
                 <p className="text-sm font-black text-foreground">{task.title}</p>
                 <div className="flex items-center gap-2 text-[10px] font-bold text-primary bg-primary/10 w-fit px-2 py-1 rounded-lg uppercase tracking-widest">
                   <Clock className="w-3 h-3" /> {task.start_time}
                 </div>
               </div>
             ))}
             {dailyTasks.filter(t => t.status !== 'done').length === 0 && (
               <p className="text-xs text-muted-foreground italic">No upcoming tasks.</p>
             )}
          </div>
        </div>
      </div>
    </div>
  )
}
