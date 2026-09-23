import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  LayoutDashboard,
  Crown,
  LogOut,
  Zap,
  User,
  ChevronLeft,
  ChevronRight,
  Sun,
  Moon,
  ShieldCheck,
  CalendarClock,
  Code2,
  Sparkles,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useTheme } from '@/hooks/useTheme'
import { useNavigate } from 'react-router-dom'
import { BrandMark } from '@/components/layout/BrandMark'

function SideLabel({ children, className }) {
  return (
    <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={cn('text-sm font-medium whitespace-nowrap', className)}>
      {children}
    </motion.span>
  )
}

function SideButton({ icon: Icon, label, collapsed, onClick, className }) {
  return (
    <button
      onClick={onClick}
      title={collapsed ? label : undefined}
      className={cn('flex items-center gap-3 px-3 h-10 rounded-xl text-muted-foreground hover:bg-hairline/[0.06] hover:text-foreground transition-colors', className)}
    >
      <Icon className="w-[18px] h-[18px] shrink-0" />
      {!collapsed && <SideLabel>{label}</SideLabel>}
    </button>
  )
}

export function Sidebar({ activeTab, onTabChange, isPro, isAdmin, user, profile, onOpenProfile, onSignOut, onOpenDeveloper, onOpenAssistant, onUpgrade }) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const { isDark, toggleTheme } = useTheme()
  const navigate = useNavigate()

  const menuItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Workspace' },
    { id: 'schedule', icon: CalendarClock, label: 'Jadwal' },
    { id: 'analytics', icon: Zap, label: 'Insights', pro: true },
    { id: 'assistant', icon: Sparkles, label: 'Asisten AI', action: onOpenAssistant },
    { id: 'settings', icon: User, label: 'Profil' },
  ]
  if (isAdmin) {
    menuItems.push({ id: 'admin', icon: ShieldCheck, label: 'Admin Panel', path: '/admin' })
  }

  const displayName = profile?.full_name || user?.email?.split('@')[0]

  return (
    <motion.aside
      initial={false}
      animate={{ width: isCollapsed ? 76 : 248 }}
      className="hidden md:flex flex-col my-3 ml-3 h-[calc(100dvh-1.5rem)] surface rounded-[26px] p-3 z-50 shrink-0"
    >
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        aria-label={isCollapsed ? 'Perluas sidebar' : 'Ciutkan sidebar'}
        className="lg-ink !absolute -right-3 top-9 w-6 h-6 rounded-full flex items-center justify-center z-[60]"
      >
        {isCollapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
      </button>

      <div className="flex items-center gap-2.5 px-2 pt-1 mb-7 overflow-hidden">
        <BrandMark className="w-9 h-9 shrink-0" />
        {!isCollapsed && <SideLabel className="text-xl font-semibold tracking-[-0.03em] text-foreground">Tugasku</SideLabel>}
      </div>

      {!isCollapsed && <p className="eyebrow px-3 mb-2">Menu</p>}
      <nav className="flex-1 space-y-0.5 overflow-hidden">
        {menuItems.map((item) => {
          const active = activeTab === item.id
          return (
            <button
              key={item.id}
              title={isCollapsed ? item.label : undefined}
              onClick={() => {
                if (item.path) navigate(item.path)
                else if (item.action) item.action()
                else onTabChange(item.id)
              }}
              className={cn(
                'w-full flex items-center gap-3 px-3 h-10 rounded-xl transition-colors duration-200 relative',
                active ? 'text-foreground' : 'text-muted-foreground hover:bg-hairline/[0.06] hover:text-foreground'
              )}
            >
              {active && (
                <motion.span
                  layoutId="active-nav"
                  className="lg-rim !absolute inset-0 rounded-xl bg-primary/15"
                  transition={{ type: 'spring', stiffness: 500, damping: 40 }}
                />
              )}
              <item.icon className={cn('relative w-[18px] h-[18px] shrink-0', (active || item.id === 'assistant') && 'text-primary')} />
              {!isCollapsed && <SideLabel className="relative">{item.label}</SideLabel>}
              {!isCollapsed && item.pro && !isPro && <Crown className="w-3.5 h-3.5 text-amber-500 absolute right-3" />}
            </button>
          )
        })}
      </nav>

      <div className="mt-auto space-y-3">
        {!isPro && !isCollapsed && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg-rim p-3.5 rounded-[18px] bg-card/55"
          >
            <p className="eyebrow text-primary mb-1.5">Tugasku Pro</p>
            <p className="text-xs text-muted-foreground mb-3 leading-relaxed">Tugas tanpa batas & insight lengkap.</p>
            <button
              onClick={onUpgrade}
              className="lg-ink w-full h-9 text-xs font-semibold rounded-full"
            >
              Upgrade
            </button>
          </motion.div>
        )}

        <div className="flex flex-col gap-0.5">
          <button
            onClick={onOpenProfile}
            className="flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-hairline/[0.06] transition-colors overflow-hidden"
          >
            <div className="w-8 h-8 rounded-full bg-primary/15 flex items-center justify-center overflow-hidden border border-primary/20 shrink-0 text-primary text-xs font-bold">
              {profile?.avatar_url ? (
                <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
              ) : (
                (displayName?.[0] ?? '?').toUpperCase()
              )}
            </div>
            {!isCollapsed && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-left min-w-0">
                <p className="text-sm font-semibold text-foreground truncate">{displayName}</p>
                <p className="text-xs text-muted-foreground">{isPro ? 'Pro' : 'Paket Gratis'}</p>
              </motion.div>
            )}
          </button>
          <SideButton icon={isDark ? Sun : Moon} label={isDark ? 'Mode Siang' : 'Mode Malam'} collapsed={isCollapsed} onClick={toggleTheme} />
          <SideButton icon={Code2} label="Developer" collapsed={isCollapsed} onClick={onOpenDeveloper} />
          <SideButton
            icon={LogOut}
            label="Keluar"
            collapsed={isCollapsed}
            onClick={onSignOut}
            className="hover:bg-destructive/10 hover:text-destructive"
          />
        </div>
      </div>
    </motion.aside>
  )
}
