import { Link } from 'react-router-dom'
import { LogOut, LayoutDashboard, Zap, Crown, Sparkles, Sun, Moon, Bell } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useTheme } from '@/hooks/useTheme'
import { cn } from '@/lib/utils'

/**
 * Sticky top navigation bar dengan info user, plan indicator, dan avatar profil
 */
export function Navbar({ user, onSignOut, todoCount, freeLimit, isPro, onUpgrade, onOpenProfile, notifications = [] }) {
  const { isDark, toggleTheme } = useTheme()
  const percentage = Math.min((todoCount / freeLimit) * 100, 100)
  const isNearLimit = percentage >= 80
  const isAtLimit   = percentage >= 100
  const initials    = user?.email?.[0]?.toUpperCase() ?? '?'

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">

          {/* ── Brand ── */}
          <div className="flex items-center gap-2.5 shrink-0">
            <div className="w-8 h-8 rounded-lg bg-primary/20 border border-primary/30 flex items-center justify-center">
              <LayoutDashboard className="h-4 w-4 text-primary" />
            </div>
            <span className="text-lg font-bold bg-gradient-to-r from-primary via-violet-400 to-purple-300 bg-clip-text text-transparent">
              Tugasku
            </span>
          </div>

          {/* ── Center: Plan indicator ── */}
          <div className="hidden sm:flex items-center gap-3">
            {isPro ? (
              <div className="flex items-center gap-2 bg-amber-400/10 rounded-full px-3 py-1.5 border border-amber-400/25">
                <Crown className="h-3.5 w-3.5 text-amber-400" />
                <span className="text-xs font-semibold text-amber-400">Pro Plan Aktif</span>
                <Sparkles className="h-3 w-3 text-amber-400/70" />
              </div>
            ) : (
              <div className="flex items-center gap-2.5 bg-secondary/60 rounded-full px-3 py-1.5 border border-border">
                <Zap className={cn('h-3 w-3', isAtLimit ? 'text-red-400' : isNearLimit ? 'text-amber-400' : 'text-primary')} />
                <span className="text-xs text-muted-foreground">
                  <span className={cn('font-semibold', isAtLimit ? 'text-red-400' : isNearLimit ? 'text-amber-400' : 'text-foreground')}>
                    {todoCount}
                  </span>
                  /{freeLimit} tugas aktif
                </span>
                <div className="w-20 h-1.5 rounded-full bg-background overflow-hidden">
                  <div
                    className={cn(
                      'h-full rounded-full transition-all duration-700',
                      isAtLimit ? 'bg-red-500' : isNearLimit ? 'bg-amber-400' : 'bg-primary'
                    )}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            )}

            {/* Upgrade button for free users */}
            {!isPro && (
              <div className="flex items-center gap-2">
                <button
                  onClick={onUpgrade}
                  className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full bg-gradient-to-r from-amber-400/15 to-orange-400/15 text-amber-400 border border-amber-400/25 hover:from-amber-400/25 hover:to-orange-400/25 transition-all duration-200"
                >
                  <Crown className="h-3 w-3" />
                  Upgrade Pro
                </button>
                <Link
                  to="/pricing"
                  className="text-xs text-muted-foreground hover:text-primary transition-colors"
                >
                  Lihat Harga
                </Link>
              </div>
            )}
          </div>

          {/* ── Right: Theme toggle + Avatar + Logout ── */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Notification Bell */}
            <div className="relative">
              <button
                className={cn(
                  'w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200',
                  'border border-border hover:border-primary/40',
                  'bg-secondary hover:bg-secondary/80 active:scale-95',
                  'text-muted-foreground hover:text-foreground'
                )}
                title={notifications.length > 0 ? `${notifications.length} tugas terlambat!` : 'Tidak ada notifikasi'}
              >
                <Bell className={cn('h-4 w-4', notifications.length > 0 ? 'text-red-400 animate-pulse' : '')} />
              </button>
              {notifications.length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-background">
                  {notifications.length}
                </span>
              )}
            </div>

            {/* Theme toggle */}
            <button
              id="theme-toggle-btn"
              onClick={toggleTheme}
              title={isDark ? 'Ganti ke mode terang' : 'Ganti ke mode gelap'}
              className={cn(
                'w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200',
                'border border-border hover:border-primary/40',
                'bg-secondary hover:bg-secondary/80 active:scale-95',
                'text-muted-foreground hover:text-foreground'
              )}
            >
              {isDark
                ? <Sun className="h-4 w-4 text-amber-400" />
                : <Moon className="h-4 w-4 text-primary" />
              }
            </button>
            {/* Avatar — opens ProfileModal */}
            <button
              id="open-profile-btn"
              onClick={onOpenProfile}
              className={cn(
                'w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm transition-all duration-200',
                'bg-gradient-to-br from-primary to-violet-400 text-white shadow-md shadow-primary/20',
                'hover:scale-105 hover:shadow-lg hover:shadow-primary/30 active:scale-95',
                'relative'
              )}
              title="Lihat profil"
            >
              {initials}
              {isPro && (
                <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-amber-400 border-2 border-background flex items-center justify-center">
                  <Crown className="h-2 w-2 text-white" />
                </span>
              )}
            </button>

            <Button
              id="logout-btn"
              variant="outline"
              size="sm"
              onClick={onSignOut}
              className="flex items-center gap-1.5"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Keluar</span>
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}
