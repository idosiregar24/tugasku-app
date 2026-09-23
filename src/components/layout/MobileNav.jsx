import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  LayoutDashboard,
  CalendarClock,
  Plus,
  Sparkles,
  LayoutGrid,
  Zap,
  User,
  FileText,
  Timer,
  Sun,
  Moon,
  Code2,
  ShieldCheck,
  Crown,
  LogOut,
} from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { useTheme } from '@/hooks/useTheme'
import { cn } from '@/lib/utils'

function NavButton({ icon: Icon, label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      aria-current={active ? 'page' : undefined}
      className={cn(
        'relative flex flex-col items-center justify-center gap-0.5 h-full min-w-0 rounded-full transition-colors active:scale-95',
        active ? 'text-foreground' : 'text-foreground/70'
      )}
    >
      {active && (
        // The selection pill slides between tabs, like iOS 26's liquid tab bar
        <motion.span
          layoutId="tabbar-pill"
          className="lg-rim absolute inset-y-1 inset-x-0.5 rounded-full bg-card/75"
          transition={{ type: 'spring', stiffness: 520, damping: 38 }}
        />
      )}
      <Icon className={cn('relative h-[22px] w-[22px]', active && 'text-primary')} strokeWidth={active ? 2.3 : 1.9} />
      <span className="relative text-[10.5px] font-semibold leading-none truncate">{label}</span>
    </button>
  )
}

function SheetItem({ icon: Icon, label, hint, onClick, tone = 'default' }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex flex-col items-start gap-3 rounded-2xl p-4 text-left transition-transform active:scale-[0.97]',
        tone === 'danger'
          ? 'border border-destructive/20 bg-destructive/[0.06] text-destructive'
          : tone === 'pro'
          ? 'lg-rim bg-amber-400/[0.14]'
          : 'lg-rim bg-card/60'
      )}
    >
      <Icon className={cn('h-5 w-5', tone === 'pro' ? 'text-amber-500' : tone === 'danger' ? '' : 'text-primary')} />
      <span>
        <span className="block text-sm font-bold text-foreground">{label}</span>
        {hint && <span className="block text-xs text-muted-foreground mt-0.5">{hint}</span>}
      </span>
    </button>
  )
}

/**
 * Bottom tab bar for phones (hidden from md up, where the sidebar takes over)
 */
export function MobileNav({
  activeTab,
  onTabChange,
  onNewTask,
  onOpenAssistant,
  onOpenProfile,
  onOpenNotes,
  onOpenTimer,
  onOpenDeveloper,
  onUpgrade,
  onSignOut,
  isPro,
  isAdmin,
}) {
  const [moreOpen, setMoreOpen] = useState(false)
  const { isDark, toggleTheme } = useTheme()
  const navigate = useNavigate()

  const runAndClose = (fn) => () => {
    setMoreOpen(false)
    fn()
  }

  return (
    <>
      {/* Floating liquid-glass tab bar + separate action button (iOS 26 layout) */}
      <nav
        aria-label="Navigasi utama"
        className="md:hidden fixed inset-x-0 bottom-0 z-40 px-3 pb-[calc(10px+env(safe-area-inset-bottom))] pointer-events-none"
      >
        <div className="flex items-center gap-2.5">
          <div className="glass-chrome pointer-events-auto flex-1 grid grid-cols-4 h-[62px] p-1 rounded-full">
            <NavButton icon={LayoutDashboard} label="Workspace" active={activeTab === 'dashboard'} onClick={() => onTabChange('dashboard')} />
            <NavButton icon={CalendarClock} label="Jadwal" active={activeTab === 'schedule'} onClick={() => onTabChange('schedule')} />
            <NavButton icon={Sparkles} label="Asisten" onClick={onOpenAssistant} />
            <NavButton icon={LayoutGrid} label="Lainnya" active={activeTab === 'analytics'} onClick={() => setMoreOpen(true)} />
          </div>
          <button
            onClick={onNewTask}
            aria-label={activeTab === 'schedule' ? 'Tambah jadwal' : 'Tambah tugas'}
            className="lg-ink pointer-events-auto h-[62px] w-[62px] shrink-0 rounded-full flex items-center justify-center"
          >
            <Plus className="h-7 w-7" strokeWidth={2.25} />
          </button>
        </div>
      </nav>

      <Dialog open={moreOpen} onOpenChange={setMoreOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader className="text-left">
            <DialogTitle className="text-lg font-semibold tracking-[-0.02em]">Lainnya</DialogTitle>
            <DialogDescription>Alat, pengaturan, dan akun.</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-2.5">
            <SheetItem icon={Zap} label="Insights" hint="Statistik tugasmu" onClick={runAndClose(() => onTabChange('analytics'))} />
            <SheetItem icon={User} label="Profil" hint={isPro ? 'Pro' : 'Paket gratis'} onClick={runAndClose(onOpenProfile)} />
            <SheetItem icon={FileText} label="Catatan Cepat" hint="Ide & pengingat" onClick={runAndClose(onOpenNotes)} />
            <SheetItem icon={Timer} label="Focus Timer" hint="Pomodoro" onClick={runAndClose(onOpenTimer)} />
            <SheetItem icon={isDark ? Sun : Moon} label={isDark ? 'Mode Siang' : 'Mode Malam'} hint="Ganti suasana" onClick={toggleTheme} />
            <SheetItem icon={Code2} label="Developer" hint="Tentang pembuat" onClick={runAndClose(onOpenDeveloper)} />
            {isAdmin && <SheetItem icon={ShieldCheck} label="Admin Panel" onClick={runAndClose(() => navigate('/admin'))} />}
            {!isPro && <SheetItem icon={Crown} label="Upgrade Pro" hint="Tugas tanpa batas" tone="pro" onClick={runAndClose(onUpgrade)} />}
          </div>
          <SheetItem icon={LogOut} label="Keluar" tone="danger" onClick={runAndClose(onSignOut)} />
        </DialogContent>
      </Dialog>
    </>
  )
}
