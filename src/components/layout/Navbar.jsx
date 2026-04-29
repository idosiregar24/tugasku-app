import { Link } from 'react-router-dom'
import { LogOut, LayoutDashboard, Zap, Crown, Sun, Moon } from 'lucide-react'
import { useTheme } from '@/hooks/useTheme'
import { cn } from '@/lib/utils'
import { NotificationPanel } from '@/components/layout/NotificationPanel'

export function Navbar({ user, onSignOut, todoCount, freeLimit, isPro, onUpgrade, onOpenProfile, notifications = [], onOpenDetail }) {
  const { isDark, toggleTheme } = useTheme()
  const pct   = Math.min((todoCount / freeLimit) * 100, 100)
  const isNear = pct >= 80
  const initials = user?.email?.[0]?.toUpperCase() ?? '?'

  return (
    <header className="sticky top-0 z-40 w-full glass-nav border-b border-border/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">

          {/* Brand */}
          <div className="flex items-center gap-2.5 shrink-0">
            <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/30">
              <LayoutDashboard className="h-4 w-4 text-white" />
            </div>
            <span className="hidden sm:block text-[15px] font-black tracking-[-0.03em] text-gradient-purple uppercase">Tugasku</span>
          </div>

          {/* Center */}
          <div className="hidden sm:flex items-center gap-3">
            {isPro ? (
              <div className="flex items-center gap-1.5 glass rounded-full px-3.5 py-1.5 border-yellow-400/20 shadow-sm">
                <Crown className="h-3 w-3 text-yellow-400" />
                <span className="text-[10px] font-black text-yellow-400 uppercase tracking-widest">Pro Plan</span>
              </div>
            ) : (
              <div className="flex items-center gap-2.5 glass rounded-full px-3.5 py-1.5 border-border/40">
                <Zap className={cn('h-3.5 w-3.5', isNear ? 'text-orange-400' : 'text-primary')} />
                <span className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">
                  <span className={cn(isNear ? 'text-orange-400' : 'text-foreground')}>{todoCount}</span>/{freeLimit}
                </span>
                <div className="w-16 h-1.5 rounded-full bg-secondary/50 overflow-hidden">
                  <div className={cn('h-full rounded-full transition-all duration-700', isNear ? 'bg-orange-400' : 'bg-primary')} style={{ width: `${pct}%` }} />
                </div>
              </div>
            )}
            {!isPro && (
              <button onClick={onUpgrade} className="text-[10px] font-black text-primary hover:opacity-70 transition-opacity uppercase tracking-widest px-2">
                Upgrade Pro
              </button>
            )}
          </div>

          {/* Right */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <NotificationPanel notifications={notifications} onOpenDetail={onOpenDetail ?? (() => {})} />
            <button onClick={toggleTheme}
              className="w-10 h-10 rounded-2xl glass flex items-center justify-center text-muted-foreground/60 hover:text-foreground hover:border-primary/30 transition-all">
              {isDark ? <Sun className="h-4.5 w-4.5 text-yellow-400" /> : <Moon className="h-4.5 w-4.5 text-primary" />}
            </button>
            <button onClick={onOpenProfile}
              className="w-10 h-10 rounded-2xl bg-primary flex items-center justify-center font-black text-sm text-white shadow-lg shadow-primary/30 hover:opacity-90 active:scale-95 transition-all relative">
              {initials}
              {isPro && (
                <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-yellow-400 border-2 border-background flex items-center justify-center">
                  <Crown className="h-2 w-2 text-black" />
                </span>
              )}
            </button>
            <button onClick={onSignOut}
              className="flex items-center gap-2 h-10 px-4 rounded-2xl glass text-[11px] font-black uppercase tracking-widest text-muted-foreground/60 hover:text-foreground hover:border-red-400/40 transition-all">
              <LogOut className="h-3.5 w-3.5" />
              <span className="hidden md:inline">Keluar</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}
