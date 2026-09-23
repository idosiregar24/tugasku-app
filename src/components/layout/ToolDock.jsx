import { Sparkles, Timer, FileText } from 'lucide-react'
import { cn } from '@/lib/utils'

function DockButton({ icon: Icon, label, onClick, primary, indicator }) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      className={cn(
        'group flex items-center justify-center rounded-full transition-transform duration-200 hover:scale-105 active:scale-95',
        primary ? 'lg-ink h-14 w-14' : 'glass-chrome h-12 w-12 text-foreground hover:text-primary'
      )}
    >
      <Icon className={primary ? 'h-6 w-6' : 'h-5 w-5'} />
      {indicator && (
        <span className="absolute -top-0.5 -right-0.5 flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
          <span className="relative inline-flex rounded-full h-3 w-3 bg-primary border-2 border-background" />
        </span>
      )}
      <span className="pointer-events-none absolute right-full mr-3 whitespace-nowrap rounded-lg bg-foreground px-3 py-1.5 text-xs font-medium text-background shadow-lg opacity-0 translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all">
        {label}
      </span>
    </button>
  )
}

/**
 * Floating tool stack for tablets/desktops (md and up)
 */
export function ToolDock({ onOpenAssistant, onOpenTimer, onOpenNotes, timerRunning, hidden }) {
  if (hidden) return null
  return (
    <div className="hidden md:flex fixed bottom-6 right-6 z-50 flex-col items-center gap-3">
      <DockButton icon={FileText} label="Catatan Cepat" onClick={onOpenNotes} />
      <DockButton icon={Timer} label="Focus Timer" onClick={onOpenTimer} indicator={timerRunning} />
      <DockButton icon={Sparkles} label="Asisten AI" onClick={onOpenAssistant} primary />
    </div>
  )
}
