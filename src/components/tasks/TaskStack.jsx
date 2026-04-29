import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { TaskCard } from './TaskCard'
import { ChevronDown, ChevronUp, Layers } from 'lucide-react'

export function TaskStack({ tasks, onDelete, onOpenDetail }) {
  const [isExpanded, setIsExpanded] = useState(false)
  const count = tasks.length
  
  if (count === 0) return null

  // If only 1 task, just show it normally
  if (count === 1) {
    return <TaskCard task={tasks[0]} onDelete={onDelete} onOpenDetail={onOpenDetail} />
  }

  return (
    <div className="space-y-3">
      <div 
        onClick={() => setIsExpanded(!isExpanded)}
        className="relative group cursor-pointer"
      >
        {/* Visual Stack effect (2 back cards) */}
        {!isExpanded && count > 1 && (
          <>
            <div className="absolute top-2 left-2 right-2 -bottom-2 bg-card/40 border border-border/40 rounded-xl -z-10 translate-y-1 scale-[0.96] blur-[1px]" />
            <div className="absolute top-4 left-4 right-4 -bottom-4 bg-card/20 border border-border/20 rounded-xl -z-20 translate-y-2 scale-[0.92] blur-[2px]" />
          </>
        )}

        <div className="relative">
          <TaskCard 
            task={tasks[0]} 
            onDelete={onDelete} 
            onOpenDetail={onOpenDetail} 
          />
          
          {/* Stack Indicator Overlay */}
          {!isExpanded && (
            <div className="absolute bottom-2 right-2 flex items-center gap-1.5 px-2 py-1 rounded-lg bg-primary/90 text-white text-[10px] font-black shadow-lg backdrop-blur-sm animate-pulse">
              <Layers className="w-3 h-3" />
              <span>+{count - 1} LAINNYA</span>
              <ChevronDown className="w-3 h-3 ml-0.5" />
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-3.5 pt-1 overflow-hidden"
          >
            <div className="flex items-center justify-between px-2 py-1">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Daftar Selesai</span>
              <button 
                onClick={() => setIsExpanded(false)}
                className="text-[10px] font-bold text-primary hover:underline flex items-center gap-1"
              >
                Sembunyikan <ChevronUp className="w-3 h-3" />
              </button>
            </div>
            {tasks.slice(1).map((task) => (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <TaskCard task={task} onDelete={onDelete} onOpenDetail={onOpenDetail} />
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
