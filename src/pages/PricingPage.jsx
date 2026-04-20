import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Crown,
  CheckCircle2,
  Zap,
  Infinity as InfinityIcon,
  Users,
  BarChart3,
  Bell,
  Download,
  Shield,
  ArrowRight,
  LayoutDashboard,
  X,
  Mail,
  Code2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PRO_PRICE_MONTHLY, PRO_PRICE_ANNUAL } from '@/hooks/useProfile'
import { cn } from '@/lib/utils'

function formatRupiah(amount) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount)
}

const FREE_FEATURES = [
  { text: '15 tugas aktif', available: true },
  { text: 'Kanban board', available: true },
  { text: 'Prioritas tugas', available: true },
  { text: 'Tracking deadline', available: true },
  { text: 'Tugas tak terbatas', available: false },
  { text: 'Laporan produktivitas', available: false },
  { text: 'Ekspor data CSV', available: false },
  { text: 'Kolaborasi tim', available: false },
]

const PRO_FEATURES = [
  { icon: InfinityIcon, text: 'Tugas aktif tak terbatas', highlight: true },
  { icon: BarChart3, text: 'Laporan & analitik produktivitas' },
  { icon: Bell, text: 'Reminder & notifikasi otomatis' },
  { icon: Download, text: 'Ekspor data ke CSV / PDF' },
  { icon: Users, text: 'Kolaborasi tim (segera hadir)' },
  { icon: Shield, text: 'Dukungan prioritas 24/7' },
]

const FAQ = [
  {
    q: 'Apakah data saya aman jika tidak upgrade?',
    a: 'Ya! Data tugas kamu tetap aman di akun Free selamanya. Hanya penambahan tugas baru yang dibatasi.',
  },
  {
    q: 'Bagaimana cara membatalkan langganan?',
    a: 'Kamu bisa batalkan kapan saja dari halaman Pengaturan Akun. Tidak ada biaya penalti.',
  },
  {
    q: 'Apakah ada uji coba gratis untuk Pro?',
    a: 'Saat ini belum tersedia trial, tapi plan Free sudah cukup lengkap untuk penggunaan personal.',
  },
  {
    q: 'Metode pembayaran apa yang diterima?',
    a: 'Transfer Bank BCA dan DANA. Detail rekening/nomor akan muncul setelah kamu memilih metode pembayaran.',
  },
]

export function PricingPage() {
  const navigate = useNavigate()
  const [billing, setBilling] = useState('monthly')
  const [openFaq, setOpenFaq] = useState(null)

  const price = billing === 'annual' ? PRO_PRICE_ANNUAL : PRO_PRICE_MONTHLY
  const pricePerMonth =
    billing === 'annual' ? Math.round(PRO_PRICE_ANNUAL / 12) : PRO_PRICE_MONTHLY
  const savingAmount = PRO_PRICE_MONTHLY * 12 - PRO_PRICE_ANNUAL
  const savingPercent = Math.round((1 - PRO_PRICE_ANNUAL / 12 / PRO_PRICE_MONTHLY) * 100)

  return (
    <div className="min-h-screen bg-background">
      {/* Ambient glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-primary/6 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[400px] bg-violet-600/5 rounded-full blur-3xl" />
      </div>

      {/* Navbar */}
      <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link to="/dashboard" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary/20 border border-primary/30 flex items-center justify-center">
              <LayoutDashboard className="h-4 w-4 text-primary" />
            </div>
            <span className="text-lg font-bold bg-gradient-to-r from-primary to-violet-400 bg-clip-text text-transparent">
              Tugasku
            </span>
          </Link>

          <div className="flex items-center gap-3">
            <Link to="/dashboard">
              <Button variant="ghost" size="sm">
                Dashboard
              </Button>
            </Link>
            <Button
              size="sm"
              onClick={() => navigate('/dashboard')}
              className="flex items-center gap-1.5"
            >
              <Crown className="h-3.5 w-3.5" />
              Upgrade Sekarang
            </Button>
          </div>
        </div>
      </header>

      <main className="relative max-w-6xl mx-auto px-4 sm:px-6 py-16">
        {/* Hero */}
        <div className="text-center mb-14 animate-fade-in">
          <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-1.5 mb-6">
            <Zap className="h-3.5 w-3.5 text-primary" />
            <span className="text-xs font-medium text-primary">Pilih Plan Yang Tepat</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-4">
            Raih Produktivitas{' '}
            <span className="bg-gradient-to-r from-primary to-violet-400 bg-clip-text text-transparent">
              Maksimal
            </span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            Mulai gratis, upgrade saat butuh lebih. Tidak ada biaya tersembunyi.
          </p>

          {/* Billing toggle */}
          <div className="inline-flex items-center gap-1 mt-8 p-1 bg-secondary rounded-xl border border-border">
            <button
              onClick={() => setBilling('monthly')}
              className={cn(
                'px-5 py-2 rounded-lg text-sm font-medium transition-all duration-200',
                billing === 'monthly'
                  ? 'bg-card text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              Bulanan
            </button>
            <button
              onClick={() => setBilling('annual')}
              className={cn(
                'px-5 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2',
                billing === 'annual'
                  ? 'bg-card text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              Tahunan
              <span className="text-xs bg-green-400/15 text-green-400 border border-green-400/25 px-2 py-0.5 rounded-full font-semibold">
                Hemat {savingPercent}%
              </span>
            </button>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16 max-w-3xl mx-auto">
          {/* Free Plan */}
          <div className="bg-card border border-border rounded-2xl p-6 flex flex-col">
            <div className="mb-6">
              <h2 className="text-lg font-bold text-foreground mb-1">Free</h2>
              <p className="text-sm text-muted-foreground">Untuk penggunaan personal dasar</p>
            </div>
            <div className="flex items-baseline gap-1 mb-6">
              <span className="text-4xl font-bold text-foreground">Rp 0</span>
              <span className="text-muted-foreground">/bulan</span>
            </div>
            <div className="space-y-3 mb-8 flex-1">
              {FREE_FEATURES.map((f) => (
                <div key={f.text} className="flex items-center gap-2.5">
                  {f.available ? (
                    <CheckCircle2 className="h-4 w-4 text-green-400 shrink-0" />
                  ) : (
                    <X className="h-4 w-4 text-muted-foreground/40 shrink-0" />
                  )}
                  <span
                    className={cn(
                      'text-sm',
                      f.available ? 'text-foreground' : 'text-muted-foreground/50 line-through'
                    )}
                  >
                    {f.text}
                  </span>
                </div>
              ))}
            </div>
            <Link to="/register">
              <Button variant="outline" className="w-full">
                Mulai Gratis
              </Button>
            </Link>
          </div>

          {/* Pro Plan */}
          <div className="relative bg-gradient-to-br from-primary/10 via-violet-500/8 to-purple-500/5 border border-primary/40 rounded-2xl p-6 flex flex-col overflow-hidden shadow-xl shadow-primary/10">
            {/* Glow */}
            <div className="absolute top-0 right-0 w-40 h-40 bg-primary/15 rounded-full blur-3xl" />

            {/* Badge */}
            <div className="absolute top-4 right-4">
              <span className="flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full bg-amber-400/20 text-amber-400 border border-amber-400/30">
                <Crown className="h-3 w-3" />
                POPULER
              </span>
            </div>

            <div className="relative mb-6">
              <h2 className="text-lg font-bold text-foreground mb-1 flex items-center gap-2">
                Pro
                <Crown className="h-4 w-4 text-amber-400" />
              </h2>
              <p className="text-sm text-muted-foreground">Untuk produktivitas tanpa batas</p>
            </div>

            <div className="relative flex items-baseline gap-1 mb-1">
              <span className="text-4xl font-bold text-foreground">
                {formatRupiah(pricePerMonth)}
              </span>
              <span className="text-muted-foreground">/bulan</span>
            </div>
            {billing === 'annual' && (
              <p className="text-sm text-green-400 mb-6">
                Hemat {formatRupiah(savingAmount)}/tahun · Ditagih {formatRupiah(PRO_PRICE_ANNUAL)}/tahun
              </p>
            )}
            {billing === 'monthly' && <div className="mb-6" />}

            <div className="relative space-y-3 mb-8 flex-1">
              {PRO_FEATURES.map((f) => {
                const Icon = f.icon
                return (
                  <div key={f.text} className="flex items-center gap-2.5">
                    <Icon
                      className={cn(
                        'h-4 w-4 shrink-0',
                        f.highlight ? 'text-primary' : 'text-green-400'
                      )}
                    />
                    <span
                      className={cn(
                        'text-sm',
                        f.highlight ? 'text-primary font-semibold' : 'text-foreground'
                      )}
                    >
                      {f.text}
                    </span>
                  </div>
                )
              })}
            </div>

            <Link to="/dashboard" className="relative">
              <Button
                className="w-full bg-gradient-to-r from-primary to-violet-500 hover:from-primary/90 hover:to-violet-500/90 shadow-lg shadow-primary/20"
                size="lg"
              >
                <Crown className="h-4 w-4 mr-2" />
                Upgrade ke Pro — {formatRupiah(price)}
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Feature comparison */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-foreground text-center mb-8">
            Perbandingan Lengkap
          </h2>
          <div className="bg-card border border-border rounded-2xl overflow-hidden max-w-3xl mx-auto">
            <div className="grid grid-cols-3 gap-0">
              <div className="p-4 border-b border-border" />
              <div className="p-4 border-b border-border text-center">
                <p className="text-sm font-semibold text-foreground">Free</p>
                <p className="text-xs text-muted-foreground">Rp 0/bln</p>
              </div>
              <div className="p-4 border-b border-border text-center bg-primary/5">
                <p className="text-sm font-semibold text-primary">Pro ✨</p>
                <p className="text-xs text-muted-foreground">{formatRupiah(PRO_PRICE_MONTHLY)}/bln</p>
              </div>
            </div>
            {[
              { feature: 'Tugas aktif', free: '15 tugas', pro: 'Tak terbatas ∞' },
              { feature: 'Kanban Board', free: '✅', pro: '✅' },
              { feature: 'Prioritas tugas', free: '✅', pro: '✅' },
              { feature: 'Tracking deadline', free: '✅', pro: '✅' },
              { feature: 'Laporan produktivitas', free: '—', pro: '✅' },
              { feature: 'Ekspor data CSV', free: '—', pro: '✅' },
              { feature: 'Reminder notifikasi', free: '—', pro: '✅' },
              { feature: 'Kolaborasi tim', free: '—', pro: '✅ (segera)' },
              { feature: 'Support', free: 'Komunitas', pro: 'Prioritas 24/7' },
            ].map((row, i) => (
              <div key={row.feature} className={cn('grid grid-cols-3', i % 2 === 0 ? 'bg-secondary/20' : '')}>
                <div className="p-3.5 border-t border-border">
                  <p className="text-sm text-foreground">{row.feature}</p>
                </div>
                <div className="p-3.5 border-t border-border text-center">
                  <p className="text-sm text-muted-foreground">{row.free}</p>
                </div>
                <div className="p-3.5 border-t border-border text-center bg-primary/3">
                  <p className={cn('text-sm', row.pro !== '—' ? 'text-primary font-medium' : 'text-muted-foreground')}>
                    {row.pro}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ */}
        <div className="mb-16 max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-foreground text-center mb-8">
            Pertanyaan Umum
          </h2>
          <div className="space-y-3">
            {FAQ.map((item, i) => (
              <div
                key={i}
                className="bg-card border border-border rounded-xl overflow-hidden"
              >
                <button
                  className="w-full flex items-center justify-between p-4 text-left"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                >
                  <span className="text-sm font-medium text-foreground">{item.q}</span>
                  <span
                    className={cn(
                      'text-muted-foreground transition-transform duration-200',
                      openFaq === i ? 'rotate-45' : ''
                    )}
                  >
                    +
                  </span>
                </button>
                {openFaq === i && (
                  <div className="px-4 pb-4 border-t border-border/50 pt-3 animate-fade-in">
                    <p className="text-sm text-muted-foreground">{item.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* CTA bottom */}
        <div className="text-center">
          <div className="inline-block p-8 rounded-2xl bg-gradient-to-br from-primary/10 to-violet-500/8 border border-primary/20">
            <h2 className="text-2xl font-bold text-foreground mb-2">
              Siap meningkatkan produktivitas?
            </h2>
            <p className="text-muted-foreground mb-6 text-sm">
              Bergabung dengan ribuan pengguna Tugasku Pro
            </p>
            <Link to="/dashboard">
              <Button
                size="lg"
                className="bg-gradient-to-r from-primary to-violet-500 shadow-lg shadow-primary/20"
              >
                <Crown className="h-4 w-4 mr-2" />
                Mulai Upgrade Sekarang
              </Button>
            </Link>
          </div>
        </div>
      </main>

      {/* ── Footer Developer ── */}
      <footer className="relative border-t border-border bg-background/60 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">

            {/* Brand */}
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-violet-400 flex items-center justify-center shadow-lg shadow-primary/20">
                <span className="text-sm font-bold text-white">T</span>
              </div>
              <div>
                <p className="text-sm font-bold text-foreground">Tugasku</p>
                <p className="text-xs text-muted-foreground">Manajemen Tugas Modern</p>
              </div>
            </div>

            {/* Developer identity */}
            <div className="flex flex-col items-center gap-1.5 text-center">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Code2 className="h-3.5 w-3.5 text-primary shrink-0" />
                <span>Dibuat dengan ❤️ oleh</span>
                <span className="font-semibold text-foreground">Ido Refael Siregar</span>
              </div>
              <a
                href="mailto:Idosiregar2006@gmail.com"
                className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors"
              >
                <Mail className="h-3 w-3" />
                Idosiregar2006@gmail.com
              </a>
            </div>

            {/* Links & copyright */}
            <div className="flex flex-col items-end gap-1.5 text-right">
              <a
                href="https://github.com/idosiregar24/tugasku-app"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.28 1.15-.28 2.35 0 3.5-.73 1.02-1.08 2.25-1 3.5 0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
                  <path d="M9 18c-4.51 2-5-2-7-2" />
                </svg>
                idosiregar24/tugasku-app
              </a>
              <p className="text-xs text-muted-foreground">
                © {new Date().getFullYear()} Tugasku. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
