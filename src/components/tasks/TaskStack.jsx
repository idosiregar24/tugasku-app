import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { TaskCard } from './TaskCard'
import { ChevronDown, ChevronUp, Layers } from 'lucide-react'

export function TaskStack({ tasks, onDelete, onOpenDetail, onStatusChange }) {
  const [isExpanded, setIsExpanded] = useState(false)
  const count = tasks.length

  if (count === 0) return null

  if (count === 1) {
    return (
      <div className="p-1">
        <TaskCard task={tasks[0]} onDelete={onDelete} onOpenDetail={onOpenDetail} onStatusChange={onStatusChange} />
      </div>
    )
  }

  return (
    <div className="space-y-2.5 p-1">
      <div className="relative">
        {!isExpanded && (
          <>
            <div className="absolute top-2 left-2 right-2 -bottom-2 bg-card/60 border border-hairline/[0.06] rounded-xl -z-10" />
            <div className="absolute top-4 left-4 right-4 -bottom-4 bg-card/35 border border-hairline/[0.04] rounded-xl -z-20" />
          </>
        )}
        <TaskCard task={tasks[0]} onDelete={onDelete} onOpenDetail={onOpenDetail} onStatusChange={onStatusChange} />
      </div>

      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-center gap-1.5 pt-3 pb-1 text-xs font-bold text-primary hover:underline"
      >
        {isExpanded ? (
          <>Sembunyikan <ChevronUp className="w-3.5 h-3.5" /></>
        ) : (
          <><Layers className="w-3.5 h-3.5" /> Lihat {count - 1} lainnya <ChevronDown className="w-3.5 h-3.5" /></>
        )}
      </button>

      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-2.5 overflow-hidden"
          >
            {tasks.slice(1).map((task) => (
              <TaskCard key={task.id} task={task} onDelete={onDelete} onOpenDetail={onOpenDetail} onStatusChange={onStatusChange} />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
