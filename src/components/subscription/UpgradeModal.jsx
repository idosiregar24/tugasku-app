import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import {
  Loader2,
  Crown,
  CheckCircle2,
  Sparkles,
  Landmark,
  Smartphone,
  ArrowLeft,
  Copy,
  Check,
  Zap,
  Infinity as InfinityIcon,
  Clock,
  MessageCircle,
  RefreshCw,
  AlertCircle,
} from 'lucide-react'
import { PRO_PRICE_MONTHLY, PRO_PRICE_ANNUAL } from '@/hooks/useProfile'
import { createPaymentRecord } from '@/lib/supabase/payments'
import { cn } from '@/lib/utils'

// ─── Kontak admin untuk verifikasi ───────────────────────────────────────────
const ADMIN_WHATSAPP = '6281363554262' // 0813-6355-4262

// ─── Fitur Plan Pro ───────────────────────────────────────────────────────────
const FEATURES_PRO = [
  'Tugas aktif tak terbatas',
  'Akses prioritas support',
  'Laporan & analitik produktivitas',
  'Kolaborasi tim (segera hadir)',
  'Reminder & notifikasi',
  'Ekspor data CSV',
]

// ─── Metode Pembayaran ────────────────────────────────────────────────────────
const PAYMENT_METHODS = [
  {
    id: 'BRI',
    label: 'Transfer Bank BRI',
    icon: Landmark,
    detail: 'No. Rek: 539401028712532 · a/n Ido Refael Siregar',
  },
  {
    id: 'dana',
    label: 'DANA',
    icon: Smartphone,
    detail: 'No. HP: 0813-6355-4262 · a/n Ido Refael Siregar',
  },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatRupiah(amount) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount)
}

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false)
  const handleCopy = () => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <button
      onClick={handleCopy}
      title="Salin"
      className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
    >
      {copied ? (
        <Check className="h-3.5 w-3.5 text-green-400" />
      ) : (
        <Copy className="h-3.5 w-3.5" />
      )}
    </button>
  )
}

/**
 * Multi-step upgrade modal — REAL payment flow:
 * Plan → Metode Bayar → Instruksi Transfer → Menunggu Verifikasi Admin
 */
export function UpgradeModal({ open, onClose, user }) {
  const [step, setStep] = useState(1)
  const [billing, setBilling] = useState('monthly')
  const [paymentMethod, setPaymentMethod] = useState(null)
  const [processing, setProcessing] = useState(false)
  const [submitError, setSubmitError] = useState('')

  const price = billing === 'annual' ? PRO_PRICE_ANNUAL : PRO_PRICE_MONTHLY
  const pricePerMonth =
    billing === 'annual' ? Math.round(PRO_PRICE_ANNUAL / 12) : PRO_PRICE_MONTHLY
  const savingPercent = Math.round(
    (1 - PRO_PRICE_ANNUAL / 12 / PRO_PRICE_MONTHLY) * 100
  )

  const selectedMethod = PAYMENT_METHODS.find((m) => m.id === paymentMethod)

  const handleClose = () => {
    setStep(1)
    setBilling('monthly')
    setPaymentMethod(null)
    setProcessing(false)
    setSubmitError('')
    onClose()
  }

  // Buka WhatsApp dengan pesan konfirmasi terisi otomatis
  const openWhatsApp = () => {
    const planLabel = billing === 'annual' ? 'Pro Tahunan' : 'Pro Bulanan'
    const message = encodeURIComponent(
      `Halo Tugasku, saya ingin konfirmasi pembayaran:\n\n` +
      `📧 Email: ${user?.email ?? '-'}\n` +
      `💳 Plan: ${planLabel}\n` +
      `💰 Nominal: ${formatRupiah(price)}\n` +
      `🏦 Metode: ${selectedMethod?.label ?? '-'}\n` +
      `📅 Tanggal: ${new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })}\n\n` +
      `Mohon verifikasi dan aktifkan akun saya. Terima kasih! 🙏`
    )
    window.open(`https://wa.me/${ADMIN_WHATSAPP}?text=${message}`, '_blank')
  }

  // Simpan record pembayaran ke Supabase → buka WhatsApp → tampilkan step pending
  const handleConfirmTransfer = async () => {
    setProcessing(true)
    setSubmitError('')
    try {
      // Simpan ke payment_records (jika table sudah dibuat)
      if (user?.id) {
        await createPaymentRecord({
          userId: user.id,
          userEmail: user.email ?? null,
          plan: 'pro',
          billingCycle: billing,
          amount: price,
          paymentMethod,
        })
      }
    } catch (err) {
      // Tabel mungkin belum dibuat — tetap lanjut ke WhatsApp
      console.warn('Payment record save failed (table may not exist):', err.message)
    } finally {
      setProcessing(false)
    }

    // Buka WhatsApp terlepas dari hasil DB
    openWhatsApp()
    // Tampilkan layar "Menunggu Verifikasi"
    setStep(4)
  }

  const stepTitles = {
    1: '⚡ Upgrade ke Pro',
    2: 'Pilih Metode Pembayaran',
    3: 'Detail Transfer',
    4: 'Menunggu Verifikasi',
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden gap-0">
        {/* Progress bar */}
        <div className="h-1 bg-secondary">
          <div
            className="h-full bg-gradient-to-r from-primary to-violet-400 transition-all duration-500"
            style={{ width: `${(step / 4) * 100}%` }}
          />
        </div>

        {/* Header */}
        <div className="px-6 pt-5 pb-4 border-b border-border">
          <DialogHeader>
            <div className="flex items-center gap-3">
              {step > 1 && step < 4 && (
                <button
                  onClick={() => setStep((s) => s - 1)}
                  className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-all"
                >
                  <ArrowLeft className="h-4 w-4" />
                </button>
              )}
              <DialogTitle className="flex items-center gap-2">
                <Crown className="h-5 w-5 text-amber-400" />
                {stepTitles[step]}
              </DialogTitle>
            </div>
            {step < 4 && (
              <p className="text-xs text-muted-foreground mt-1 ml-1">
                Langkah {step} dari 3
              </p>
            )}
          </DialogHeader>
        </div>

        <div className="px-6 py-5 max-h-[72vh] overflow-y-auto">

          {/* ═══════════════ STEP 1: Pilih Plan ═══════════════ */}
          {step === 1 && (
            <div className="space-y-5">
              {/* Toggle bulanan/tahunan */}
              <div className="flex items-center gap-1 p-1 bg-secondary rounded-xl">
                {['monthly', 'annual'].map((b) => (
                  <button
                    key={b}
                    onClick={() => setBilling(b)}
                    className={cn(
                      'flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all duration-200 flex items-center justify-center gap-1.5',
                      billing === b
                        ? 'bg-card text-foreground shadow-sm'
                        : 'text-muted-foreground hover:text-foreground'
                    )}
                  >
                    {b === 'monthly' ? 'Bulanan' : 'Tahunan'}
                    {b === 'annual' && (
                      <span className="text-xs bg-green-400/15 text-green-400 border border-green-400/25 px-1.5 py-0.5 rounded-full font-semibold">
                        Hemat {savingPercent}%
                      </span>
                    )}
                  </button>
                ))}
              </div>

              {/* Kartu harga */}
              <div className="relative p-5 rounded-2xl bg-gradient-to-br from-primary/15 via-violet-500/10 to-purple-500/10 border border-primary/30 overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl" />
                <div className="relative">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-400/20 border border-amber-400/30 flex items-center justify-center">
                      <Crown className="h-5 w-5 text-amber-400" />
                    </div>
                    <div>
                      <p className="font-bold text-foreground">Tugasku Pro</p>
                      <p className="text-xs text-muted-foreground">Akses penuh semua fitur</p>
                    </div>
                  </div>
                  <div className="flex items-baseline gap-1 mb-1">
                    <span className="text-3xl font-bold text-foreground">
                      {formatRupiah(pricePerMonth)}
                    </span>
                    <span className="text-sm text-muted-foreground">/bulan</span>
                  </div>
                  {billing === 'annual' && (
                    <p className="text-xs text-muted-foreground mb-4">
                      Ditagih {formatRupiah(PRO_PRICE_ANNUAL)}/tahun
                    </p>
                  )}
                  {billing === 'monthly' && <div className="mb-4" />}
                  <div className="space-y-2">
                    {FEATURES_PRO.map((f) => (
                      <div key={f} className="flex items-center gap-2">
                        <CheckCircle2 className="h-3.5 w-3.5 text-green-400 shrink-0" />
                        <span className="text-sm text-foreground">{f}</span>
                      </div>
                    ))}
                    <div className="flex items-center gap-2">
                      <InfinityIcon className="h-3.5 w-3.5 text-primary shrink-0" />
                      <span className="text-sm font-semibold text-primary">
                        Tugas aktif tak terbatas
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <Button
                className="w-full bg-gradient-to-r from-primary to-violet-500 hover:opacity-90 shadow-lg shadow-primary/20"
                size="lg"
                onClick={() => setStep(2)}
              >
                <Sparkles className="h-4 w-4 mr-2" />
                Pilih Metode Bayar — {formatRupiah(price)}
              </Button>
              <p className="text-center text-xs text-muted-foreground">
                Aktivasi manual 1×24 jam setelah pembayaran dikonfirmasi
              </p>
            </div>
          )}

          {/* ═══════════════ STEP 2: Pilih Metode ═══════════════ */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="p-3 rounded-xl bg-secondary border border-border">
                <p className="text-sm text-muted-foreground">
                  Total tagihan:{' '}
                  <span className="font-bold text-foreground">{formatRupiah(price)}</span>
                  {billing === 'annual' && (
                    <span className="ml-2 text-xs text-green-400">
                      (hemat {formatRupiah(PRO_PRICE_MONTHLY * 12 - PRO_PRICE_ANNUAL)}/tahun)
                    </span>
                  )}
                </p>
              </div>

              <div className="space-y-3">
                {PAYMENT_METHODS.map((method) => {
                  const Icon = method.icon
                  const isSelected = paymentMethod === method.id
                  return (
                    <button
                      key={method.id}
                      onClick={() => setPaymentMethod(method.id)}
                      className={cn(
                        'w-full flex items-center gap-4 p-4 rounded-xl border text-left transition-all duration-200',
                        isSelected
                          ? 'border-primary bg-primary/8 ring-1 ring-primary/30'
                          : 'border-border bg-card hover:border-primary/40 hover:bg-secondary/50'
                      )}
                    >
                      <div
                        className={cn(
                          'w-10 h-10 rounded-xl flex items-center justify-center shrink-0',
                          isSelected ? 'bg-primary/20' : 'bg-secondary'
                        )}
                      >
                        <Icon
                          className={cn(
                            'h-5 w-5',
                            isSelected ? 'text-primary' : 'text-muted-foreground'
                          )}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground">{method.label}</p>
                        <p className="text-xs text-muted-foreground truncate">{method.detail}</p>
                      </div>
                      <div
                        className={cn(
                          'w-4 h-4 rounded-full border-2 shrink-0 transition-colors',
                          isSelected ? 'border-primary bg-primary' : 'border-border'
                        )}
                      />
                    </button>
                  )
                })}
              </div>

              <Button
                className="w-full"
                size="lg"
                disabled={!paymentMethod}
                onClick={() => setStep(3)}
              >
                Lihat Detail Transfer →
              </Button>
            </div>
          )}

          {/* ═══════════════ STEP 3: Detail Transfer ═══════════════ */}
          {step === 3 && selectedMethod && (
            <div className="space-y-5">
              {/* Warning */}
              <div className="flex items-start gap-2.5 p-3 rounded-xl bg-amber-400/8 border border-amber-400/20">
                <AlertCircle className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                <p className="text-xs text-amber-400">
                  Transfer <strong>nominal TEPAT</strong> agar mudah diverifikasi. Aktivasi
                  dilakukan dalam <strong>1×24 jam</strong>.
                </p>
              </div>

              {/* Jumlah */}
              <div className="space-y-1.5">
                <p className="text-xs text-muted-foreground uppercase tracking-wide font-semibold">
                  Jumlah Transfer
                </p>
                <div className="flex items-center justify-between p-4 bg-secondary rounded-xl border border-border">
                  <div>
                    <p className="text-2xl font-bold text-foreground">{formatRupiah(price)}</p>
                    {billing === 'annual' && (
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Langganan 12 bulan
                      </p>
                    )}
                  </div>
                  <CopyButton text={String(price)} />
                </div>
              </div>

              {/* Detail rekening */}
              <div className="space-y-1.5">
                <p className="text-xs text-muted-foreground uppercase tracking-wide font-semibold">
                  Tujuan Transfer — {selectedMethod.label}
                </p>

                {/* BRI */}
                {selectedMethod.id === 'BRI' && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-4 bg-secondary rounded-xl border border-border">
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">No. Rekening BRI</p>
                        <p className="text-xl font-bold text-foreground tracking-widest">
                          539401028712532
                        </p>
                      </div>
                      <CopyButton text="539401028712532" />
                    </div>
                    <div className="p-4 bg-secondary rounded-xl border border-border flex items-center justify-between">
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Atas Nama</p>
                        <p className="text-sm font-semibold text-foreground">Ido Refael Siregar</p>
                      </div>
                      <CopyButton text="Ido Refael Siregar" />
                    </div>
                  </div>
                )}

                {/* DANA */}
                {selectedMethod.id === 'dana' && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-4 bg-secondary rounded-xl border border-border">
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Nomor DANA</p>
                        <p className="text-xl font-bold text-foreground tracking-widest">
                          0813-6355-4262
                        </p>
                      </div>
                      <CopyButton text="081363554262" />
                    </div>
                    <div className="p-4 bg-secondary rounded-xl border border-border">
                      <p className="text-xs text-muted-foreground mb-1">Atas Nama</p>
                      <p className="text-sm font-semibold text-foreground">Ido Refael Siregar</p>
                    </div>
                    <div className="p-3 rounded-xl bg-blue-500/8 border border-blue-500/20">
                      <p className="text-xs text-blue-400">
                        💡 Buka app DANA → Transfer → masukkan nomor di atas
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Error */}
              {submitError && (
                <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                  {submitError}
                </div>
              )}

              {/* Tombol konfirmasi — NYATA: simpan record + buka WA */}
              <Button
                id="confirm-transfer-btn"
                className="w-full bg-green-500 hover:bg-green-600 text-white shadow-lg shadow-green-500/20"
                size="lg"
                onClick={handleConfirmTransfer}
                disabled={processing}
              >
                {processing ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Menyimpan...
                  </>
                ) : (
                  <>
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Saya Sudah Transfer — Konfirmasi via WhatsApp
                  </>
                )}
              </Button>

              <p className="text-center text-xs text-muted-foreground">
                Setelah mentransfer, klik tombol di atas untuk mengirim bukti ke admin via WhatsApp
              </p>
            </div>
          )}

          {/* ═══════════════ STEP 4: Menunggu Verifikasi ═══════════════ */}
          {step === 4 && (
            <div className="text-center space-y-5 py-4 animate-fade-in">
              {/* Ikon pending */}
              <div className="relative mx-auto w-20 h-20">
                <div className="absolute inset-0 rounded-2xl bg-amber-400/20 animate-pulse opacity-70" />
                <div className="relative w-20 h-20 rounded-2xl bg-amber-400/15 border border-amber-400/30 flex items-center justify-center">
                  <Clock className="h-10 w-10 text-amber-400" />
                </div>
              </div>

              <div>
                <h3 className="text-xl font-bold text-foreground">
                  Menunggu Verifikasi 🕐
                </h3>
                <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                  Pembayaranmu sudah dicatat. Admin akan memverifikasi dan mengaktifkan
                  plan Pro dalam <strong className="text-foreground">1×24 jam</strong>.
                </p>
              </div>

              {/* Langkah selanjutnya */}
              <div className="text-left space-y-2.5 p-4 rounded-xl bg-secondary border border-border">
                <p className="text-xs font-semibold text-foreground uppercase tracking-wide">
                  Yang perlu kamu lakukan:
                </p>
                {[
                  'Pastikan WhatsApp konfirmasi sudah terkirim ke admin',
                  'Simpan bukti transfer dari aplikasi bankmu',
                  'Tunggu balasan WhatsApp dari admin (biasanya < 1 jam)',
                  'Refresh halaman setelah menerima konfirmasi',
                ].map((step, i) => (
                  <div key={i} className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-primary/15 text-primary text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    <p className="text-xs text-muted-foreground">{step}</p>
                  </div>
                ))}
              </div>

              {/* Tombol aksi */}
              <div className="space-y-2">
                <Button
                  className="w-full bg-green-500 hover:bg-green-600 text-white"
                  size="lg"
                  onClick={openWhatsApp}
                >
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Buka WhatsApp Admin
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => { handleClose(); window.location.reload() }}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Kembali & Refresh Dashboard
                </Button>
              </div>

              <p className="text-xs text-muted-foreground">
                Hubungi admin di{' '}
                <span className="text-foreground font-medium">0813-6355-4262</span>
                {' '}jika ada pertanyaan
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
