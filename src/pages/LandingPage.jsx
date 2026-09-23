import { Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import {
  LayoutDashboard,
  Crown,
  Bell,
  BarChart3,
  ArrowRight,
  Shield,
  CheckCircle2,
  Sun,
  Moon,
  Code2,
  Star,
  Sparkles,
  CalendarClock,
  ChevronRight,
  Timer,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useTheme } from '@/hooks/useTheme'
import { BrandMark } from '@/components/layout/BrandMark'
import { DeveloperModal } from '@/components/layout/DeveloperModal'

const FEATURES = [
  { icon: LayoutDashboard, title: 'Kanban Board', desc: 'Geser tugas antar kolom, atau ketuk sekali untuk memajukan statusnya.' },
  { icon: Sparkles, title: 'Asisten AI', desc: 'Minta prioritas, rencana belajar, atau langsung buatkan tugas dengan bahasa sehari-hari.' },
  { icon: Bell, title: 'Pengingat Deadline', desc: 'Notifikasi otomatis untuk tugas yang mendekati atau lewat tenggat.' },
  { icon: CalendarClock, title: 'Jadwal Harian', desc: 'Agenda berjam yang langsung menunjukkan apa yang berlangsung sekarang.' },
  { icon: Timer, title: 'Focus Timer', desc: 'Pomodoro dengan suara latar yang tetap akurat walau HP dikunci.' },
  { icon: Shield, title: 'Sinkron & Aman', desc: 'Realtime via Supabase, bisa dipasang di layar utama iPhone.' },
]

const TESTIMONIALS = [
  { name: 'Reza A.', role: 'Mahasiswa Teknik', text: 'Kanban board-nya simpel tapi powerful. Sangat membantu tugas kuliah saya!', av: 'R' },
  { name: 'Siti M.', role: 'Freelance Designer', text: 'Notifikasi deadline penyelamat hidup. Tidak pernah lagi ketinggalan klien.', av: 'S' },
  { name: 'Bimo P.', role: 'Product Manager', text: 'Pro plan sangat worth it. Tracking progress bikin kerja lebih terarah.', av: 'B' },
]

const PREVIEW_TASKS = [
  { t: 'Revisi proposal PKL', p: 'High', d: 'Terlambat 1 hari', tone: 'text-destructive', highlight: true },
  { t: 'Kuis Basis Data (online)', p: 'Medium', d: 'Hari ini', tone: 'text-warning' },
  { t: 'Makalah Sistem Informasi', p: 'High', d: 'Besok', tone: 'text-orange-600 dark:text-orange-400' },
  { t: 'Baca jurnal untuk review', p: 'Low', d: 'Sab, 27 Sep', tone: 'text-muted-foreground' },
]

const PREVIEW_SUGGESTIONS = [
  { label: 'Prioritas', text: '"Mulai dari Revisi proposal PKL — sudah lewat 1 hari."' },
  { label: 'Jadwal', text: 'Sisihkan 19.00–21.00 malam ini untuk kuis Basis Data.' },
  { label: 'Ringkas', text: '3 tugas jatuh tempo minggu ini, 1 terlambat.' },
]

function SectionTitle({ eyebrow, title, desc }) {
  return (
    <div className="text-center mb-10">
      <p className="badge-section justify-center mb-4">
        <span className="w-1.5 h-1.5 rounded-full bg-primary" /> {eyebrow}
      </p>
      <h2 className="text-3xl sm:text-5xl font-semibold tracking-[-0.04em] text-foreground">{title}</h2>
      {desc && <p className="text-foreground/70 max-w-lg mx-auto mt-3">{desc}</p>}
    </div>
  )
}

function AppPreview() {
  return (
    <div className="surface rounded-[30px] p-2 sm:p-2.5">
      <div className="rounded-[22px] overflow-hidden bg-card/85 border border-hairline/[0.06]">
        {/* Title bar */}
        <div className="flex items-center gap-3 px-4 h-11 border-b border-hairline/[0.08]">
          <div className="flex gap-1.5">
            {[0, 1, 2].map((i) => <span key={i} className="w-3 h-3 rounded-full bg-hairline/15" />)}
          </div>
          <span className="font-mono text-[11px] text-muted-foreground truncate">
            tugasku.app · Workspace · minggu ini
          </span>
        </div>

        <div className="grid md:grid-cols-[190px_1fr_250px] text-left">
          {/* Menu */}
          <div className="hidden md:block border-r border-hairline/[0.08] p-4">
            <p className="eyebrow mb-3">Menu</p>
            {['Workspace', 'Jadwal', 'Insights', 'Asisten AI'].map((m, i) => (
              <div
                key={m}
                className={cn(
                  'flex items-center gap-2.5 px-3 h-9 rounded-xl text-sm mb-0.5',
                  i === 0 ? 'bg-primary/15 text-foreground font-medium' : 'text-muted-foreground'
                )}
              >
                <span className={cn('w-1.5 h-1.5 rounded-full', i === 0 ? 'bg-primary' : 'bg-hairline/30')} />
                {m}
              </div>
            ))}
            <p className="eyebrow mt-6 mb-2">Catatan</p>
            <p className="text-xs text-muted-foreground leading-relaxed">Bawa laptop & charger untuk presentasi Jumat.</p>
          </div>

          {/* Board */}
          <div className="p-5 sm:p-7">
            <h3 className="text-2xl font-semibold tracking-[-0.03em] text-foreground">Perlu dikerjakan</h3>
            <p className="text-muted-foreground mb-5">4 tugas aktif · 1 terlambat</p>
            <div className="space-y-2.5">
              {PREVIEW_TASKS.map((t) => (
                <div
                  key={t.t}
                  className={cn(
                    'flex items-center gap-3 rounded-xl border px-3.5 py-3',
                    t.highlight ? 'bg-amber-200/40 dark:bg-amber-300/10 border-amber-400/30' : 'bg-card border-hairline/[0.08]'
                  )}
                >
                  <span className="w-5 h-5 rounded-full border-2 border-hairline/25 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-foreground truncate">{t.t}</p>
                    <p className={cn('text-xs', t.tone)}>{t.d}</p>
                  </div>
                  <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">{t.p}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Assistant suggestions */}
          <div className="border-t md:border-t-0 md:border-l border-hairline/[0.08] p-4 sm:p-5 bg-hairline/[0.02]">
            <p className="eyebrow mb-3">Asisten · Saran</p>
            <div className="space-y-2.5">
              {PREVIEW_SUGGESTIONS.map((s) => (
                <div key={s.label} className="rounded-xl border border-hairline/[0.08] bg-card px-3.5 py-3">
                  <p className="eyebrow text-orange-700 dark:text-orange-300 mb-1.5">{s.label}</p>
                  <p className="text-sm text-foreground/85 leading-relaxed">{s.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export function LandingPage() {
  const { isDark, toggleTheme } = useTheme()
  const navigate = useNavigate()
  const [devOpen, setDevOpen] = useState(false)
  const [email, setEmail] = useState('')

  const startWithEmail = (e) => {
    e.preventDefault()
    navigate('/register', { state: { email: email.trim() } })
  }

  return (
    <div className="min-h-app text-foreground overflow-x-hidden">
      {/* Floating liquid-glass nav */}
      <header className="sticky top-0 z-40 pt-[calc(0.75rem+env(safe-area-inset-top))] px-3">
        <div className="glass-chrome max-w-6xl mx-auto h-14 rounded-full flex items-center justify-between pl-2 pr-2">
          <Link to="/" className="flex items-center gap-2.5 pl-1">
            <BrandMark className="w-9 h-9 rounded-full" />
            <span className="text-lg font-semibold tracking-[-0.03em]">Tugasku</span>
          </Link>
          <nav className="hidden md:flex items-center gap-7 text-sm text-foreground/75">
            <a href="#fitur" className="hover:text-foreground transition-colors">Fitur</a>
            <a href="#harga" className="hover:text-foreground transition-colors">Harga</a>
            <a href="#ulasan" className="hover:text-foreground transition-colors">Ulasan</a>
          </nav>
          <div className="flex items-center gap-1.5">
            <button
              onClick={toggleTheme}
              aria-label={isDark ? 'Mode siang' : 'Mode malam'}
              className="w-10 h-10 rounded-full flex items-center justify-center text-foreground/75 hover:text-foreground hover:bg-hairline/[0.06] transition-colors"
            >
              {isDark ? <Sun className="h-[18px] w-[18px]" /> : <Moon className="h-[18px] w-[18px]" />}
            </button>
            <Link to="/login" className="hidden sm:flex h-10 px-4 items-center text-sm font-medium rounded-full hover:bg-hairline/[0.06] transition-colors">
              Masuk
            </Link>
            <Link to="/register" className="lg-ink h-10 px-4 rounded-full flex items-center gap-1.5 text-sm font-semibold">
              Mulai gratis <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Hero */}
        <section className="relative isolate pt-16 sm:pt-24 pb-14 text-center animate-fade-up">
          {/* Soft wash so the hero copy stays readable over the photo */}
          <div
            aria-hidden
            className="absolute inset-x-[-20%] -top-8 bottom-4 -z-10 bg-[radial-gradient(70%_60%_at_50%_45%,hsl(var(--background)/0.82),hsl(var(--background)/0.45)_55%,transparent_78%)]"
          />
          <p className="badge-section justify-center mb-6">
            <span className="w-2 h-2 rounded-full bg-primary shadow-[0_0_0_3px_hsl(var(--primary)/0.2)]" />
            Baru · Asisten AI untuk tugasmu
          </p>
          <h1 className="text-[44px] leading-[1.02] sm:text-[84px] sm:leading-[0.98] font-semibold tracking-[-0.045em] text-foreground">
            Aplikasi tugas yang<br />
            berpikir <span className="text-leaf">bersamamu.</span>
          </h1>
          <p className="text-lg sm:text-xl text-foreground/85 max-w-2xl mx-auto mt-6 leading-relaxed">
            Tugasku adalah ruang kerja tenang untuk tugas, jadwal, dan fokus harian — dengan asisten AI yang membantu saat kamu minta.
            Untuk pelajar, mahasiswa, dan siapa pun yang ingin kerja lebih ringan.
          </p>

          <form onSubmit={startWithEmail} className="glass-chrome mt-9 mx-auto max-w-xl flex items-center gap-1.5 p-1.5 rounded-full">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@kamu.com"
              aria-label="Email"
              className="flex-1 min-w-0 bg-transparent px-4 text-base text-foreground placeholder:text-foreground/50 outline-none"
            />
            <button type="submit" className="lg-ink h-12 px-5 sm:px-6 rounded-full flex items-center gap-1.5 text-sm font-semibold shrink-0">
              Mulai gratis <ChevronRight className="h-4 w-4" />
            </button>
          </form>
          <p className="glass-chrome inline-flex mt-4 px-3.5 py-1.5 rounded-full text-xs text-foreground/80">
            Gratis selamanya · Tanpa kartu kredit · Bisa dipasang di iPhone
          </p>
        </section>

        {/* Product preview */}
        <section className="mb-24 animate-fade-up" style={{ animationDelay: '120ms' }}>
          <AppPreview />
        </section>

        {/* Stats */}
        <section className="mb-24">
          <div className="surface grid grid-cols-2 sm:grid-cols-4 rounded-[28px] overflow-hidden">
            {[['10K+', 'Tugas dibuat'], ['500+', 'Pengguna aktif'], ['99%', 'Uptime'], ['4.9★', 'Rating']].map(([v, l], i) => (
              <div key={l} className={cn('p-6 sm:p-8 text-center', i > 0 && 'sm:border-l border-hairline/[0.08]', i > 1 && 'border-t sm:border-t-0 border-hairline/[0.08]', i % 2 === 1 && 'border-l border-hairline/[0.08]')}>
                <p className="text-3xl sm:text-4xl font-semibold tracking-[-0.03em] text-foreground">{v}</p>
                <p className="eyebrow mt-2">{l}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Features */}
        <section className="mb-24 scroll-mt-24" id="fitur">
          <div className="surface rounded-[32px] p-6 sm:p-10">
            <SectionTitle eyebrow="Fitur" title={<>Semua yang kamu butuhkan, <span className="text-leaf">tanpa ribet.</span></>} />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {FEATURES.map(({ icon: Icon, title, desc }) => (
                <div key={title} className="lg-rim rounded-[22px] bg-card/70 p-6 interactive-card">
                  <div className="w-11 h-11 rounded-2xl bg-primary/15 flex items-center justify-center mb-4">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="text-base font-semibold text-foreground mb-1.5">{title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section className="mb-24 scroll-mt-24" id="harga">
          <div className="surface rounded-[32px] p-6 sm:p-10">
            <SectionTitle eyebrow="Harga" title={<>Pilih <span className="text-leaf">planmu.</span></>} />
            <div className="grid sm:grid-cols-2 gap-4 max-w-3xl mx-auto">
              <div className="lg-rim rounded-[24px] bg-card/70 p-7 flex flex-col">
                <p className="eyebrow mb-3">Free</p>
                <p className="mb-6"><span className="text-5xl font-semibold tracking-[-0.04em]">Rp 0</span><span className="text-muted-foreground">/bln</span></p>
                <ul className="space-y-3 flex-1 mb-7">
                  {['15 tugas aktif', 'Kanban board', 'Prioritas tugas', 'Notifikasi browser'].map((f) => (
                    <li key={f} className="flex items-center gap-2.5 text-sm text-foreground/80"><CheckCircle2 className="h-4 w-4 text-success shrink-0" />{f}</li>
                  ))}
                </ul>
                <Link to="/register" className="glass-chrome h-11 rounded-full flex items-center justify-center text-sm font-semibold">Mulai gratis</Link>
              </div>
              <div className="lg-rim rounded-[24px] bg-card/85 p-7 flex flex-col ring-2 ring-primary/40">
                <div className="flex items-center justify-between mb-3">
                  <p className="eyebrow text-primary">Pro</p>
                  <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-700 dark:text-amber-300 border border-amber-500/30"><Crown className="h-3 w-3" />POPULER</span>
                </div>
                <p className="mb-6"><span className="text-5xl font-semibold tracking-[-0.04em]">Rp 49K</span><span className="text-muted-foreground">/bln</span></p>
                <ul className="space-y-3 flex-1 mb-7">
                  {['Tugas tak terbatas ∞', 'Semua fitur Free', 'Laporan produktivitas', 'Ekspor CSV/PDF', 'Support prioritas'].map((f) => (
                    <li key={f} className="flex items-center gap-2.5 text-sm text-foreground"><CheckCircle2 className="h-4 w-4 text-primary shrink-0" />{f}</li>
                  ))}
                </ul>
                <Link to="/pricing" className="lg-ink h-11 rounded-full flex items-center justify-center gap-2 text-sm font-semibold">
                  <Crown className="h-4 w-4" /> Upgrade ke Pro
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="mb-24 scroll-mt-24" id="ulasan">
          <div className="surface rounded-[32px] p-6 sm:p-10">
            <SectionTitle eyebrow="Ulasan" title={<>Dipakai setiap hari, <span className="text-leaf">disukai.</span></>} />
            <div className="grid sm:grid-cols-3 gap-3">
              {TESTIMONIALS.map(({ name, role, text, av }) => (
                <div key={name} className="lg-rim rounded-[22px] bg-card/70 p-6">
                  <div className="flex gap-0.5 mb-4">{[...Array(5)].map((_, i) => <Star key={i} className="h-3.5 w-3.5 text-amber-500 fill-amber-400" />)}</div>
                  <p className="font-serif italic text-lg text-foreground/85 leading-snug mb-5">“{text}”</p>
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-full bg-foreground text-background flex items-center justify-center text-xs font-bold">{av}</div>
                    <div><p className="text-sm font-semibold">{name}</p><p className="text-xs text-muted-foreground">{role}</p></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="mb-20">
          <div className="surface rounded-[32px] p-10 sm:p-16 text-center">
            <BarChart3 className="h-8 w-8 text-primary mx-auto mb-5" />
            <h2 className="text-3xl sm:text-5xl font-semibold tracking-[-0.04em] mb-4">Mulai produktif <span className="text-leaf">hari ini.</span></h2>
            <p className="text-muted-foreground mb-8 max-w-sm mx-auto">Daftar gratis dalam 30 detik. Tidak ada kartu kredit yang diperlukan.</p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link to="/register" className="lg-ink h-12 px-8 rounded-full flex items-center gap-2 text-sm font-semibold">
                Mulai gratis <ArrowRight className="h-4 w-4" />
              </Link>
              <Link to="/pricing" className="glass-chrome h-12 px-8 rounded-full flex items-center text-sm font-semibold">
                Lihat harga
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="px-3 pb-[calc(1rem+env(safe-area-inset-bottom))]">
        <div className="glass-chrome max-w-6xl mx-auto rounded-[28px] px-5 py-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <BrandMark className="w-7 h-7" />
            <span className="font-semibold text-sm tracking-tight">Tugasku</span>
            <span className="text-xs text-foreground/60">© {new Date().getFullYear()}</span>
          </div>
          <div className="flex gap-5 text-sm text-foreground/75">
            {[['Harga', '/pricing'], ['Masuk', '/login'], ['Daftar', '/register']].map(([l, h]) => (
              <Link key={l} to={h} className="hover:text-foreground transition-colors">{l}</Link>
            ))}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-foreground/70">
            <Code2 className="h-3.5 w-3.5" />
            <span>by</span>
            <button onClick={() => setDevOpen(true)} className="hover:text-primary transition-colors font-medium text-foreground">
              Ido Refael Siregar
            </button>
          </div>
        </div>
      </footer>

      <DeveloperModal open={devOpen} onClose={() => setDevOpen(false)} />
    </div>
  )
}
