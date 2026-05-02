import { Link } from 'react-router-dom'
import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { LayoutDashboard, Crown, Zap, Bell, BarChart3, ArrowRight, Shield, CheckCircle2, Sun, Moon, Code2, Star, Sparkles, TrendingUp } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useTheme } from '@/hooks/useTheme'
import { Spotlight } from '@/components/ui/spotlight'
import { BackgroundBeams } from '@/components/ui/background-beams'
import { Card3D } from '@/components/ui/card-3d.jsx'
import { useScroll, useTransform, useSpring } from 'framer-motion'
import { DeveloperModal } from '@/components/layout/DeveloperModal'

const FEATURES = [
  { icon: LayoutDashboard, title: 'Kanban Board', desc: 'Drag & drop tugas antar kolom secara visual dan intuitif.', color: 'text-violet-400', bg: 'bg-violet-400/10' },
  { icon: Bell, title: 'Reminder Deadline', desc: 'Notifikasi otomatis agar tidak ada tugas yang terlewat.', color: 'text-red-400', bg: 'bg-red-400/10' },
  { icon: BarChart3, title: 'Prioritas Tugas', desc: 'High / Medium / Low — fokus ke hal yang benar-benar penting.', color: 'text-orange-400', bg: 'bg-orange-400/10' },
  { icon: Shield, title: 'Cloud & Aman', desc: 'Sinkronisasi realtime via Supabase dengan enkripsi penuh.', color: 'text-green-400', bg: 'bg-green-400/10' },
  { icon: TrendingUp, title: 'Progress Tracking', desc: 'Pantau completion rate dan produktivitas harianmu.', color: 'text-blue-400', bg: 'bg-blue-400/10' },
  { icon: Crown, title: 'Plan Pro', desc: 'Tugas tak terbatas, export PDF, dan laporan lengkap.', color: 'text-yellow-400', bg: 'bg-yellow-400/10' },
]

const TESTIMONIALS = [
  { name: 'Reza A.', role: 'Mahasiswa Teknik', text: 'Kanban board-nya simpel tapi powerful. Sangat membantu tugas kuliah saya!', av: 'R', color: 'bg-violet-500' },
  { name: 'Siti M.', role: 'Freelance Designer', text: 'Notifikasi deadline penyelamat hidup. Tidak pernah lagi ketinggalan klien.', av: 'S', color: 'bg-pink-500' },
  { name: 'Bimo P.', role: 'Product Manager', text: 'Pro plan sangat worth it. Tracking progress bikin kerja lebih terarah.', av: 'B', color: 'bg-blue-500' },
]

function Badge({ children }) {
  return (
    <motion.span
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.06em] px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary"
    >
      {children}
    </motion.span>
  )
}

function MagneticButton({ children, className, id }) {
  const ref = useRef(null)
  const [position, setPosition] = useState({ x: 0, y: 0 })

  const handleMouse = (e) => {
    const { clientX, clientY } = e
    const { height, width, left, top } = ref.current.getBoundingClientRect()
    const middleX = clientX - (left + width / 2)
    const middleY = clientY - (top + height / 2)
    setPosition({ x: middleX * 0.2, y: middleY * 0.2 })
  }

  const reset = () => {
    setPosition({ x: 0, y: 0 })
  }

  const { x, y } = position

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouse}
      onMouseLeave={reset}
      animate={{ x, y }}
      transition={{ type: "spring", stiffness: 150, damping: 15, mass: 0.1 }}
      className={cn("relative z-10", className)}
    >
      {children}
    </motion.div>
  )
}

export function LandingPage() {
  const { isDark, toggleTheme } = useTheme()
  const [mousePos, setMousePos] = useState({ x: -500, y: -500 })
  const [devOpen, setDevOpen] = useState(false)
  const { scrollY } = useScroll()

  const y1 = useTransform(scrollY, [0, 500], [0, 100])
  const y2 = useTransform(scrollY, [0, 500], [0, -150])
  const opacity = useTransform(scrollY, [0, 300], [1, 0])
  const scale = useTransform(scrollY, [0, 300], [1, 0.9])

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePos({ x: e.clientX, y: e.clientY })
    }
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden relative">
      <div className="noise" />
      <Spotlight className="-top-40 left-0 md:left-60 md:-top-20" fill="hsl(var(--primary))" />

      {/* Interactive Cursor Spotlight — Sharper & More Aesthetic */}
      <div
        className="fixed inset-0 pointer-events-none z-50 transition-opacity duration-500"
        style={{
          background: `
            radial-gradient(500px circle at ${mousePos.x}px ${mousePos.y}px, hsl(var(--primary) / 0.1), transparent 80%),
            radial-gradient(150px circle at ${mousePos.x}px ${mousePos.y}px, hsl(var(--primary) / 0.12), transparent 60%)
          `,
        }}
      />

      {/* Aesthetic Floating Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <motion.div
          animate={{ y: [0, -20, 0], x: [0, 10, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[15%] left-[5%] w-64 h-64 glass rounded-full opacity-20"
        />
        <motion.div
          style={{ y: y1 }}
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute top-[10%] left-[2%] w-72 h-72 glass rounded-[40px] opacity-[0.08] blur-xl"
        />
        <motion.div
          style={{ y: y2 }}
          animate={{ rotate: -360 }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute top-[40%] right-[2%] w-96 h-96 glass rounded-full opacity-[0.05] blur-2xl"
        />
        <motion.div
          animate={{
            y: [0, -30, 0],
            rotateZ: [0, 10, 0],
            scale: [1, 1.05, 1]
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-[10%] left-[10%] w-48 h-48 glass rounded-3xl opacity-[0.12] border-primary/20"
        />
      </div>

      {/* Background */}
      <div className="fixed inset-0 pointer-events-none">
        <BackgroundBeams />
      </div>

      {/* Navbar */}
      <header className="sticky top-0 z-40 glass-nav">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/40">
              <LayoutDashboard className="h-4 w-4 text-white" />
            </div>
            <span className="text-base font-extrabold tracking-tight text-gradient-purple">Tugasku.</span>
          </div>
          <nav className="hidden md:flex items-center gap-6 text-sm text-muted-foreground">
            <a href="#features" className="hover:text-foreground transition-colors">Features</a>
            <Link to="/pricing" className="hover:text-foreground transition-colors">Pricing</Link>
          </nav>
          <div className="flex items-center gap-2">
            <button onClick={toggleTheme} className="w-9 h-9 glass rounded-xl flex items-center justify-center text-muted-foreground hover:text-foreground transition-all">
              {isDark ? <Sun className="h-4 w-4 text-yellow-400" /> : <Moon className="h-4 w-4 text-primary" />}
            </button>
            <Link to="/login"><button className="h-9 px-4 glass rounded-xl text-sm font-medium hover:bg-white/5 transition-all">Masuk</button></Link>
            <Link to="/register" className="hidden sm:block">
              <button className="h-9 px-5 btn-gradient rounded-xl text-sm font-semibold flex items-center gap-1.5">Mulai Gratis <ArrowRight className="h-3.5 w-3.5" /></button>
            </Link>
          </div>
        </div>
      </header>

      <main className="relative max-w-6xl mx-auto px-4 sm:px-6">

        {/* ── HERO ── */}
        <section className="pt-24 pb-16 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <Badge><Sparkles className="h-3 w-3" /> Task Manager Modern · 100% Gratis</Badge>
          </motion.div>

          <motion.h1
            style={{ y: y1, opacity, scale }}
            className="text-[52px] sm:text-[76px] font-extrabold tracking-[-0.045em] leading-[0.92] mb-8"
          >
            <span className="text-gradient">Kelola Semua Tugas.</span><br />
            <span className="text-foreground">Raih Produktivitas</span><br />
            <span className="text-gradient-purple">Tertinggi.</span>
          </motion.h1>

          <motion.p
            style={{ y: y1, opacity, scale }}
            transition={{ delay: 0.1 }}
            className="text-lg text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            Tugasku adalah platform manajemen tugas modern dengan Kanban board interaktif, pengingat deadline cerdas, dan sinkronisasi cloud real-time.
          </motion.p>

          <motion.div
            style={{ y: y1, opacity }}
            className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-6"
          >
            <Link to="/register">
              <MagneticButton>
                <button id="hero-cta" className="h-13 px-9 btn-gradient rounded-2xl text-base font-bold flex items-center gap-2 shadow-2xl shadow-primary/30">
                  <Zap className="h-5 w-5" /> Mulai Sekarang — Gratis
                </button>
              </MagneticButton>
            </Link>
            <Link to="/pricing">
              <MagneticButton>
                <button className="h-13 px-9 glass rounded-2xl text-base font-medium flex items-center gap-2 hover:bg-white/5 transition-all">
                  <Crown className="h-4 w-4 text-yellow-400" /> Lihat Plan Pro
                </button>
              </MagneticButton>
            </Link>
          </motion.div>
          <div className="flex items-center justify-center gap-5 text-xs text-muted-foreground/70">
            {['✓ Gratis selamanya', '✓ Tanpa kartu kredit', '✓ Setup 30 detik'].map(t => <span key={t}>{t}</span>)}
          </div>
        </section>

        {/* ── PREVIEW CARD ── */}
        <motion.section
          style={{ y: y2 }}
          className="mb-24 px-4 sm:px-0"
        >
          <Card3D className="relative saas-card rounded-[24px] overflow-visible">
            {/* Glow ring */}
            <div className="absolute -inset-px rounded-[24px] pointer-events-none"
              style={{ background: 'linear-gradient(135deg, hsl(262 83% 65% / 0.35), transparent 50%, hsl(221 83% 55% / 0.2))', borderRadius: 'inherit' }} />
            {/* Browser bar */}
            <div className="relative flex items-center gap-1.5 px-4 h-10 bg-white/[0.03] border-b border-white/5 rounded-t-[24px]">
              <span className="w-3 h-3 rounded-full bg-red-400/70" /><span className="w-3 h-3 rounded-full bg-yellow-400/70" /><span className="w-3 h-3 rounded-full bg-green-400/70" />
              <span className="mx-auto text-[11px] text-muted-foreground/30 font-mono">tugasku.app/dashboard</span>
            </div>
            {/* Kanban columns */}
            <div className="relative p-5 grid grid-cols-3 gap-3">
              {[
                { col: 'PERLU DIKERJAKAN', dot: 'bg-primary', tasks: [{ t: 'Kerjakan laporan', p: 'High', c: 'bg-red-400/12 text-red-400' }, { t: 'Review PR urgent', p: 'High', c: 'bg-red-400/12 text-red-400' }, { t: 'Meeting prep', p: 'Medium', c: 'bg-orange-400/12 text-orange-400' }] },
                { col: 'BELUM SUBMIT', dot: 'bg-orange-400', tasks: [{ t: 'Revisi desain', p: 'Medium', c: 'bg-orange-400/12 text-orange-400' }, { t: 'Update docs', p: 'Low', c: 'bg-primary/12 text-primary' }] },
                { col: 'SELESAI', dot: 'bg-green-400', tasks: [{ t: 'Setup database', p: 'High', c: 'bg-red-400/12 text-red-400' }, { t: 'Deploy staging', p: 'Medium', c: 'bg-orange-400/12 text-orange-400' }, { t: 'Code review', p: 'Low', c: 'bg-primary/12 text-primary' }] },
              ].map(({ col, dot, tasks }) => (
                <div key={col}>
                  <div className="flex items-center gap-2 mb-2.5">
                    <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />
                    <span className="text-[10px] font-bold tracking-[0.08em] text-muted-foreground">{col}</span>
                    <span className="ml-auto glass px-1.5 py-0.5 rounded-full text-[9px] text-muted-foreground">{tasks.length}</span>
                  </div>
                  <div className="space-y-1.5 rounded-[12px] border border-dashed border-white/6 p-2 min-h-[100px]">
                    {tasks.map(({ t, p, c }) => (
                      <div key={t} className="saas-card rounded-[8px] px-2.5 py-2">
                        <p className="text-[11px] font-medium text-foreground/85 truncate mb-1">{t}</p>
                        <span className={cn('text-[9px] px-1.5 py-0.5 rounded-md font-bold', c)}>{p}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            {/* Floating badges */}
            <div className="absolute -bottom-5 left-10 saas-card rounded-2xl px-4 py-3 flex items-center gap-3 animate-float shadow-xl shadow-black/50">
              <div className="w-8 h-8 rounded-xl bg-green-400/15 flex items-center justify-center"><CheckCircle2 className="h-4 w-4 text-green-400" /></div>
              <div><p className="text-[10px] text-muted-foreground leading-none mb-0.5">Selesai Hari Ini</p><p className="text-base font-black">12 Tugas</p></div>
            </div>
            <div className="absolute -bottom-5 right-10 saas-card rounded-2xl px-4 py-3 flex items-center gap-3 animate-float shadow-xl shadow-black/50" style={{ animationDelay: '2.5s' }}>
              <div className="w-8 h-8 rounded-xl bg-primary/15 flex items-center justify-center"><TrendingUp className="h-4 w-4 text-primary" /></div>
              <div><p className="text-[10px] text-muted-foreground leading-none mb-0.5">Completion Rate</p><p className="text-base font-black">87%</p></div>
            </div>
          </Card3D>
        </motion.section>

        {/* ── STATS ── */}
        <section className="mb-24 pt-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 border border-white/6 rounded-2xl overflow-hidden divide-x divide-y sm:divide-y-0 divide-white/6">
            {[['10K+', 'Tugas Dibuat'], ['500+', 'Pengguna Aktif'], ['99%', 'Uptime'], ['4.9★', 'Rating']].map(([v, l]) => (
              <div key={l} className="p-7 text-center hover:bg-white/[0.02] transition-colors">
                <p className="text-[32px] font-black text-gradient-purple tracking-tight leading-none">{v}</p>
                <p className="text-xs text-muted-foreground mt-1.5 font-medium">{l}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── FEATURES ── */}
        <section className="mb-24" id="features">
          <div className="text-center mb-14">
            <div className="mb-5"><Badge>Features</Badge></div>
            <h2 className="text-4xl sm:text-5xl font-extrabold tracking-[-0.03em] mb-3 text-gradient">Fitur Powerful. Tampilan Elegan.</h2>
            <p className="text-muted-foreground max-w-lg mx-auto text-sm">Semua yang kamu butuhkan untuk produktif setiap hari.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map(({ icon: Icon, title, desc, color, bg }, i) => (
              <Card3D
                key={title}
                className={cn(
                  'saas-card rounded-2xl p-7 group hover:border-primary/40 transition-colors duration-500 interactive-card h-full',
                  i === 0 && 'border-primary/20'
                )}
              >
                <div className={cn('w-12 h-12 rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-lg', bg)}>
                  <Icon className={cn('h-6 w-6', color)} />
                </div>
                <h3 className="text-lg font-bold text-foreground mb-2.5 tracking-tight">{title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed font-medium opacity-80">{desc}</p>
              </Card3D>
            ))}
          </div>
        </section>

        {/* ── TRUST ── */}
        <section className="mb-24">
          <div className="relative rounded-[24px] overflow-hidden p-12 text-center saas-card border-primary/15">
            <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-72 h-48 rounded-full pointer-events-none"
              style={{ background: 'radial-gradient(ellipse, hsl(262 83% 65% / 0.15), transparent 70%)' }} />
            <div className="relative">
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-[-0.03em] text-foreground mb-3">Dibangun dengan Kepercayaan.</h2>
              <p className="text-muted-foreground text-sm mb-10">Fokus pada produktivitas, bukan kompleksitas.</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-left">
                {[['01', 'Kanban Visual', 'Drag-and-drop intuitif'], ['02', 'Deadline Tracker', 'Notifikasi real-time'], ['03', 'Priority System', 'High/Medium/Low'], ['04', 'Cloud Sync', 'Akses dari mana saja']].map(([n, l, d]) => (
                  <div key={n}>
                    <p className="text-[40px] font-black leading-none mb-1 text-primary/20">{n}</p>
                    <p className="text-sm font-bold text-foreground mb-0.5">{l}</p>
                    <p className="text-xs text-muted-foreground">{d}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── PRICING ── */}
        <section className="mb-24">
          <div className="text-center mb-12">
            <div className="mb-5"><Badge>Pricing</Badge></div>
            <h2 className="text-4xl font-black tracking-[-0.04em]"><span className="text-gradient">Pilih Planmu.</span></h2>
          </div>
          <div className="grid sm:grid-cols-2 gap-5 max-w-2xl mx-auto">
            <Card3D className="saas-card rounded-[22px] p-8 flex flex-col h-full">
              <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground mb-3">Free</p>
              <div className="mb-6"><span className="text-5xl font-black tracking-tight">Rp 0</span><span className="text-base text-muted-foreground">/bln</span></div>
              <ul className="space-y-3 flex-1 mb-7">
                {['15 tugas aktif', 'Kanban board', 'Prioritas tugas', 'Notifikasi browser'].map(f => (
                  <li key={f} className="flex items-center gap-2.5 text-sm text-muted-foreground"><CheckCircle2 className="h-4 w-4 text-green-400 shrink-0" />{f}</li>
                ))}
              </ul>
              <Link to="/register">
                <MagneticButton className="w-full">
                  <button className="w-full h-11 glass rounded-[12px] text-sm font-semibold hover:bg-white/6 transition-all">Mulai Gratis</button>
                </MagneticButton>
              </Link>
            </Card3D>
            <Card3D className="saas-card rounded-[22px] p-8 flex flex-col relative overflow-hidden h-full" style={{ borderColor: 'hsl(262 83% 65% / 0.3)' }}>
              <div className="absolute top-0 right-0 w-48 h-48 rounded-full animate-glow-pulse pointer-events-none"
                style={{ background: 'radial-gradient(ellipse, hsl(262 83% 65% / 0.18), transparent 70%)' }} />
              <div className="flex items-center justify-between mb-3 relative">
                <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-primary">Pro</p>
                <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-yellow-400/15 text-yellow-400 border border-yellow-400/20"><Crown className="h-2.5 w-2.5" />POPULER</span>
              </div>
              <div className="mb-6 relative"><span className="text-5xl font-black tracking-tight">Rp 49K</span><span className="text-base text-muted-foreground">/bln</span></div>
              <ul className="space-y-3 flex-1 mb-7 relative">
                {['Tugas tak terbatas ∞', 'Semua fitur Free', 'Laporan produktivitas', 'Ekspor CSV/PDF', 'Support prioritas'].map(f => (
                  <li key={f} className="flex items-center gap-2.5 text-sm text-foreground"><CheckCircle2 className="h-4 w-4 text-primary shrink-0" />{f}</li>
                ))}
              </ul>
              <Link to="/dashboard" className="relative">
                <MagneticButton className="w-full">
                  <button className="w-full h-11 btn-gradient rounded-[12px] text-sm font-bold flex items-center justify-center gap-2"><Crown className="h-4 w-4" /> Upgrade ke Pro</button>
                </MagneticButton>
              </Link>
            </Card3D>
          </div>
        </section>

        {/* ── TESTIMONIALS ── */}
        <section className="mb-24">
          <div className="text-center mb-12">
            <div className="mb-5"><Badge>Reviews</Badge></div>
            <h2 className="text-4xl font-black tracking-[-0.04em]"><span className="text-white">Trusted by </span><span className="text-gradient-purple">Innovators.</span></h2>
          </div>
          <div className="grid sm:grid-cols-3 gap-4">
            {TESTIMONIALS.map(({ name, role, text, av, color }) => (
              <Card3D key={name} className="saas-card rounded-2xl p-6 hover:border-primary/18 transition-all duration-300 h-full">
                <div className="flex gap-0.5 mb-4">{[...Array(5)].map((_, i) => <Star key={i} className="h-3.5 w-3.5 text-yellow-400 fill-yellow-400" />)}</div>
                <p className="text-sm text-muted-foreground leading-relaxed mb-5">"{text}"</p>
                <div className="flex items-center gap-2.5">
                  <div className={cn('w-9 h-9 rounded-full flex items-center justify-center text-xs font-black text-white shadow-md', color)}>{av}</div>
                  <div><p className="text-sm font-semibold">{name}</p><p className="text-xs text-muted-foreground">{role}</p></div>
                </div>
              </Card3D>
            ))}
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="mb-24">
          <div className="saas-card rounded-[28px] p-14 sm:p-20 text-center relative overflow-hidden border-primary/15">
            <div className="absolute inset-0 animate-glow-pulse pointer-events-none"
              style={{ background: 'radial-gradient(ellipse at 50% -10%, hsl(262 83% 65% / 0.16), transparent 60%)' }} />
            <div className="relative">
              <div className="w-20 h-20 rounded-3xl bg-primary flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-primary/40 animate-float">
                <Zap className="h-10 w-10 text-white" />
              </div>
              <h2 className="text-4xl sm:text-5xl font-black tracking-[-0.04em] mb-4 text-gradient">Mulai Produktif Hari Ini</h2>
              <p className="text-muted-foreground text-base mb-10 max-w-sm mx-auto">Daftar gratis dalam 30 detik. Tidak ada kartu kredit yang diperlukan.</p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <Link to="/register">
                  <MagneticButton>
                    <button id="cta-btn" className="h-13 px-12 btn-gradient rounded-2xl text-base font-bold flex items-center gap-2 shadow-2xl shadow-primary/30"><Zap className="h-5 w-5" /> Get Started Free</button>
                  </MagneticButton>
                </Link>
                <Link to="/pricing">
                  <MagneticButton>
                    <button className="h-13 px-12 glass rounded-2xl text-base font-medium hover:bg-white/5 transition-all">Lihat Harga</button>
                  </MagneticButton>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-white/5">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center shadow-md shadow-primary/30"><span className="text-xs font-black text-white">T</span></div>
            <span className="font-bold text-sm tracking-tight">Tugasku.</span>
            <span className="text-xs text-muted-foreground/30">© {new Date().getFullYear()}</span>
          </div>
          <div className="flex gap-5 text-xs text-muted-foreground">
            {[['Harga', '/pricing'], ['Masuk', '/login'], ['Daftar', '/register']].map(([l, h]) => (
              <Link key={l} to={h} className="hover:text-foreground transition-colors">{l}</Link>
            ))}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground/40">
            <Code2 className="h-3 w-3" />
            <span>by</span>
            <button 
              onClick={() => setDevOpen(true)}
              className="hover:text-primary transition-colors font-medium"
            >
              Ido Refael Siregar
            </button>
          </div>
        </div>
      </footer>

      <DeveloperModal open={devOpen} onClose={() => setDevOpen(false)} />
    </div>
  )
}