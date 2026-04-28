import { Link } from 'react-router-dom'
import {
  LayoutDashboard, Crown, CheckCircle2, Zap, Bell, BarChart3,
  ArrowRight, Sparkles, Code2, Mail, Star, Users, Shield
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useTheme } from '@/hooks/useTheme'
import { Sun, Moon } from 'lucide-react'

const FEATURES = [
  { icon: LayoutDashboard, title: 'Kanban Board Interaktif', desc: 'Drag & drop tugas antar kolom. Visual, intuitif, dan cepat.', color: 'text-primary', bg: 'bg-primary/10 border-primary/20' },
  { icon: Bell,            title: 'Notifikasi Deadline',     desc: 'Dapatkan pengingat otomatis saat deadline mendekat.', color: 'text-red-400',   bg: 'bg-red-500/10 border-red-500/20' },
  { icon: BarChart3,       title: 'Tracking Prioritas',      desc: 'Tandai tugas High/Medium/Low dan fokus pada yang penting.', color: 'text-amber-400', bg: 'bg-amber-400/10 border-amber-400/20' },
  { icon: Zap,             title: 'Real-time Sync',          desc: 'Perubahan tersimpan instan ke cloud. Aman dan selalu up-to-date.', color: 'text-violet-400', bg: 'bg-violet-400/10 border-violet-400/20' },
  { icon: Shield,          title: 'Data Aman',               desc: 'Didukung Supabase dengan enkripsi dan autentikasi yang handal.', color: 'text-green-400', bg: 'bg-green-400/10 border-green-400/20' },
  { icon: Star,            title: 'Gratis Selamanya',        desc: 'Plan gratis dengan 15 tugas aktif — tanpa kartu kredit.', color: 'text-orange-400', bg: 'bg-orange-400/10 border-orange-400/20' },
]

const TESTIMONIALS = [
  { name: 'Reza A.',       role: 'Mahasiswa Teknik',  text: 'Tugasku bantu aku manage tugas kuliah yang bejibun. Kanban board-nya simpel tapi powerful!' },
  { name: 'Siti M.',       role: 'Freelance Designer', text: 'Akhirnya ada task manager yang enak dipakai. Notifikasi deadline-nya penting banget buat aku.' },
  { name: 'Bimo P.',       role: 'Product Manager',   text: 'Upgrade ke Pro itu worth it. Tugas tak terbatas + laporan produktivitas bikin kerja makin terarah.' },
]

const STATS = [
  { value: '10K+', label: 'Tugas Dibuat' },
  { value: '500+', label: 'Pengguna Aktif' },
  { value: '99%',  label: 'Uptime' },
  { value: '4.9★', label: 'Rating' },
]

export function LandingPage() {
  const { isDark, toggleTheme } = useTheme()

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      {/* Ambient glows */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[900px] h-[600px] bg-primary/8 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-[600px] h-[500px] bg-violet-600/6 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-0 w-[400px] h-[400px] bg-purple-500/4 rounded-full blur-3xl" />
      </div>

      {/* ── Navbar ── */}
      <header className="sticky top-0 z-40 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          {/* Brand */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary/20 border border-primary/30 flex items-center justify-center">
              <LayoutDashboard className="h-4 w-4 text-primary" />
            </div>
            <div className="flex flex-col -space-y-1">
              <span className="text-lg font-bold bg-gradient-to-r from-primary via-violet-400 to-purple-300 bg-clip-text text-transparent">Tugasku</span>
              <span className="text-[10px] font-medium text-muted-foreground/60 tracking-wider">v2.0.0</span>
            </div>
          </div>

          {/* Nav links + actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            <Link to="/pricing" className="hidden sm:block text-sm text-muted-foreground hover:text-foreground transition-colors">Harga</Link>
            <button
              onClick={toggleTheme}
              className="w-8 h-8 rounded-lg border border-border bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
              title={isDark ? 'Mode terang' : 'Mode gelap'}
            >
              {isDark ? <Sun className="h-3.5 w-3.5 text-amber-400" /> : <Moon className="h-3.5 w-3.5 text-primary" />}
            </button>
            <Link to="/login">
              <Button variant="outline" size="sm">Masuk</Button>
            </Link>
            <Link to="/register">
              <Button size="sm" className="hidden sm:flex items-center gap-1.5 bg-primary hover:bg-primary/90">
                Mulai Gratis <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="relative max-w-6xl mx-auto px-4 sm:px-6">

        {/* ── Hero ── */}
        <section className="pt-20 pb-24 text-center animate-fade-in">
          <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-1.5 mb-8">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            <span className="text-xs font-medium text-primary">Manajemen Tugas Modern · Gratis</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold text-foreground mb-6 leading-tight tracking-tight">
            Kelola Tugas Lebih{' '}
            <span className="bg-gradient-to-r from-primary via-violet-400 to-purple-300 bg-clip-text text-transparent">
              Cerdas
            </span>
            <br className="hidden sm:block" />
            {' '}dengan Kanban Board
          </h1>

          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
            Tugasku membantu kamu mengorganisir, memprioritaskan, dan menyelesaikan tugas
            setiap hari — dengan antarmuka yang indah dan intuitif.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/register">
              <Button
                id="hero-register-btn"
                size="lg"
                className="h-13 px-8 text-base bg-primary hover:bg-primary/90 shadow-xl shadow-primary/30 transition-all hover:scale-105 active:scale-95"
              >
                <Zap className="h-5 w-5 mr-2" />
                Mulai Gratis Sekarang
              </Button>
            </Link>
            <Link to="/pricing">
              <Button
                id="hero-pricing-btn"
                variant="outline"
                size="lg"
                className="h-13 px-8 text-base border-primary/30 hover:border-primary/60 hover:bg-primary/5 transition-all"
              >
                <Crown className="h-4 w-4 mr-2 text-amber-400" />
                Lihat Plan Pro
              </Button>
            </Link>
          </div>

          <p className="mt-5 text-xs text-muted-foreground/60">
            ✅ Gratis selamanya · ✅ Tidak perlu kartu kredit · ✅ Bisa upgrade kapan saja
          </p>
        </section>

        {/* ── Dashboard Preview ── */}
        <section className="mb-24">
          <div className="relative rounded-2xl border border-border/60 bg-card/50 backdrop-blur-sm p-6 shadow-2xl shadow-black/30 overflow-hidden">
            {/* Mock dashboard preview */}
            <div className="absolute top-0 left-0 right-0 h-8 bg-secondary/50 border-b border-border/40 flex items-center gap-1.5 px-3">
              <div className="w-2.5 h-2.5 rounded-full bg-red-400/60" />
              <div className="w-2.5 h-2.5 rounded-full bg-amber-400/60" />
              <div className="w-2.5 h-2.5 rounded-full bg-green-400/60" />
              <span className="ml-3 text-xs text-muted-foreground/50 font-mono">tugasku.app/dashboard</span>
            </div>
            <div className="mt-6 grid grid-cols-3 gap-4">
              {[
                { col: 'Perlu Dikerjakan', color: 'border-primary/40 bg-primary/5', tasks: ['📝 Kerjakan laporan', '🔴 Review PR urgent', '🟡 Meeting persiapan'] },
                { col: 'Belum Submit',     color: 'border-amber-400/40 bg-amber-400/5', tasks: ['✏️ Revisi desain UI', '🟡 Update dokumentasi'] },
                { col: 'Selesai',          color: 'border-green-400/40 bg-green-400/5', tasks: ['✅ Setup database', '✅ Deploy ke staging', '✅ Code review'] },
              ].map(({ col, color, tasks }) => (
                <div key={col}>
                  <p className="text-xs font-semibold text-muted-foreground mb-3 uppercase tracking-wider">{col}</p>
                  <div className={`rounded-xl border-2 border-dashed p-3 space-y-2 ${color}`}>
                    {tasks.map(t => (
                      <div key={t} className="bg-card rounded-lg px-3 py-2 text-xs text-foreground border border-border/60 shadow-sm">
                        {t}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Stats ── */}
        <section className="mb-24">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
            {STATS.map(({ value, label }) => (
              <div key={label} className="text-center p-6 bg-card border border-border rounded-2xl hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300">
                <p className="text-3xl font-extrabold bg-gradient-to-r from-primary to-violet-400 bg-clip-text text-transparent">{value}</p>
                <p className="text-xs text-muted-foreground mt-1 font-medium">{label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Features ── */}
        <section className="mb-24">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-3">
              Semua yang kamu butuhkan
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Dirancang untuk pelajar, freelancer, dan profesional yang ingin produktif setiap hari.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map(({ icon: Icon, title, desc, color, bg }) => (
              <div
                key={title}
                className="group p-6 bg-card border border-border rounded-2xl hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 hover:-translate-y-1"
              >
                <div className={cn('w-11 h-11 rounded-xl border flex items-center justify-center mb-4 transition-transform duration-300 group-hover:rotate-6', bg)}>
                  <Icon className={cn('h-5 w-5', color)} />
                </div>
                <h3 className="font-semibold text-foreground mb-2">{title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Testimonials ── */}
        <section className="mb-24">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-3">Apa kata pengguna?</h2>
            <p className="text-muted-foreground">Ribuan orang sudah percaya Tugasku untuk produktivitas mereka.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {TESTIMONIALS.map(({ name, role, text }) => (
              <div key={name} className="p-6 bg-card border border-border rounded-2xl hover:border-primary/20 transition-all duration-300">
                <div className="flex gap-0.5 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 text-amber-400 fill-amber-400" />
                  ))}
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed mb-4">"{text}"</p>
                <div>
                  <p className="text-sm font-semibold text-foreground">{name}</p>
                  <p className="text-xs text-muted-foreground">{role}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── CTA Bottom ── */}
        <section className="mb-24">
          <div className="text-center p-12 rounded-2xl bg-gradient-to-br from-primary/10 via-violet-500/8 to-purple-500/5 border border-primary/20 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 bg-primary/15 rounded-full blur-3xl pointer-events-none" />
            <div className="relative">
              <Crown className="h-10 w-10 text-amber-400 mx-auto mb-4" />
              <h2 className="text-3xl font-bold text-foreground mb-3">
                Siap meningkatkan produktivitas?
              </h2>
              <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                Daftar gratis dalam 30 detik. Tidak ada biaya tersembunyi.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link to="/register">
                  <Button
                    id="cta-register-btn"
                    size="lg"
                    className="px-10 bg-gradient-to-r from-primary to-violet-500 shadow-lg shadow-primary/25 hover:scale-105 transition-all"
                  >
                    <Zap className="h-4 w-4 mr-2" />
                    Mulai Gratis
                  </Button>
                </Link>
                <Link to="/pricing">
                  <Button variant="outline" size="lg" className="px-10 border-primary/30 hover:border-primary/60">
                    Lihat Harga
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* ── Footer ── */}
      <footer className="border-t border-border/40 bg-background/60 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary to-violet-400 flex items-center justify-center">
              <span className="text-xs font-bold text-white">T</span>
            </div>
            <span className="font-bold text-sm text-foreground">Tugasku</span>
            <span className="text-xs text-muted-foreground/50">© {new Date().getFullYear()}</span>
          </div>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <Link to="/pricing" className="hover:text-foreground transition-colors">Harga</Link>
            <Link to="/login"   className="hover:text-foreground transition-colors">Masuk</Link>
            <Link to="/register" className="hover:text-foreground transition-colors">Daftar</Link>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground/60">
            <Code2 className="h-3 w-3" />
            <span>by</span>
            <a href="mailto:Idosiregar2006@gmail.com" className="font-medium hover:text-primary transition-colors">
              Ido Refael Siregar
            </a>
          </div>
        </div>
      </footer>
    </div>
  )
}
