import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  LayoutDashboard, 
  Settings, 
  Crown, 
  LogOut, 
  Zap, 
  User,
  ChevronLeft,
  ChevronRight,
  Plus,
  Sun,
  Moon,
  ShieldCheck,
  Clock
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useTheme } from '@/hooks/useTheme'
import { useNavigate } from 'react-router-dom'

export function Sidebar({ activeTab, onTabChange, isPro, isAdmin, user, onOpenProfile, onSignOut }) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const { isDark, toggleTheme } = useTheme()
  const navigate = useNavigate()

  const menuItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Workspace' },
    { id: 'analytics', icon: Zap, label: 'Insights', pro: true },
    { id: 'schedule', icon: Clock, label: 'Schedule' },
    { id: 'settings', icon: User, label: 'Profile' },
  ]

  if (isAdmin) {
    menuItems.push({ id: 'admin', icon: ShieldCheck, label: 'Admin Panel', path: '/admin' })
  }

  return (
    <motion.aside 
      initial={false}
      animate={{ width: isCollapsed ? 80 : 260 }}
      className="hidden md:flex flex-col h-screen bg-card/30 backdrop-blur-3xl border-r border-white/10 p-4 relative z-50 group"
    >
      {/* Collapse Toggle */}
      <button 
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-10 w-7 h-7 rounded-full bg-primary border-2 border-background flex items-center justify-center text-white shadow-[0_4px_12px_rgba(0,0,0,0.3)] hover:scale-110 transition-all z-[60]"
      >
        {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
      </button>

      <div className="flex items-center gap-3 px-2 mb-10 overflow-hidden">
        <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20 shrink-0">
          <LayoutDashboard className="w-6 h-6 text-white" />
        </div>
        {!isCollapsed && (
          <motion.span 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-lg font-black tracking-tighter text-foreground whitespace-nowrap"
          >
            Tugasku.
          </motion.span>
        )}
      </div>

      <nav className="flex-1 space-y-2 overflow-hidden">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => {
              if (item.path) navigate(item.path)
              else onTabChange(item.id)
            }}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-3 rounded-2xl transition-all duration-300 group relative",
              activeTab === item.id 
                ? "bg-primary/10 text-primary shadow-sm border border-primary/20" 
                : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
            )}
          >
            <item.icon className={cn("w-5 h-5 shrink-0", activeTab === item.id ? "text-primary" : "text-muted-foreground group-hover:text-foreground")} />
            {!isCollapsed && (
              <motion.span 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-sm font-bold whitespace-nowrap"
              >
                {item.label}
              </motion.span>
            )}
            {!isCollapsed && item.pro && !isPro && (
              <Crown className="w-3 h-3 text-amber-400 absolute right-3" />
            )}
            {activeTab === item.id && (
              <motion.div 
                layoutId="active-nav"
                className="absolute left-0 w-1 h-6 bg-primary rounded-r-full"
              />
            )}
          </button>
        ))}
      </nav>

      <div className="mt-auto space-y-4">
        {!isPro && !isCollapsed && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-4 rounded-2xl bg-gradient-to-br from-amber-400/10 to-orange-400/5 border border-amber-400/20 mb-4"
          >
            <p className="text-[10px] font-black text-amber-400 uppercase tracking-widest mb-1">Upgrade</p>
            <p className="text-[10px] text-muted-foreground mb-3 leading-relaxed">Unlimited tasks & insights.</p>
            <button className="w-full py-2 bg-amber-400 hover:bg-amber-500 text-black text-[9px] font-black uppercase tracking-widest rounded-lg transition-colors">
              Get Pro
            </button>
          </motion.div>
        )}

        <div className="flex flex-col gap-2">
          <button 
            onClick={onOpenProfile}
            className="flex items-center gap-3 px-3 py-3 rounded-2xl hover:bg-white/5 transition-all group overflow-hidden"
          >
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center overflow-hidden border border-primary/30 shrink-0">
              <User className="w-4 h-4 text-primary" />
            </div>
            {!isCollapsed && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-left min-w-0"
              >
                <p className="text-[11px] font-black text-foreground truncate">{user?.email?.split('@')[0]}</p>
                <p className="text-[9px] font-bold text-muted-foreground uppercase">{isPro ? 'Pro User' : 'Free Plan'}</p>
              </motion.div>
            )}
          </button>

          <button 
            onClick={onSignOut}
            className="flex items-center gap-3 px-3 py-3 rounded-2xl text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-all group"
          >
            <LogOut className="w-5 h-5 shrink-0" />
            {!isCollapsed && (
              <motion.span 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-sm font-bold whitespace-nowrap"
              >
                Log Out
              </motion.span>
            )}
          </button>

          {/* Theme Toggle */}
          <button 
            onClick={toggleTheme}
            className="flex items-center gap-3 px-3 py-3 rounded-2xl text-muted-foreground hover:bg-primary/10 hover:text-primary transition-all group"
          >
            {isDark ? <Sun className="w-5 h-5 shrink-0" /> : <Moon className="w-5 h-5 shrink-0" />}
            {!isCollapsed && (
              <motion.span 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-sm font-bold whitespace-nowrap"
              >
                {isDark ? 'Light Mode' : 'Dark Mode'}
              </motion.span>
            )}
          </button>
        </div>
      </div>
    </motion.aside>
  )
}

