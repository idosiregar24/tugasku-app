import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import {
  Crown,
  User,
  CheckCircle2,
  Clock,
  LogOut,
  Trash2,
  Loader2,
  Banknote,
  AlertTriangle,
  CalendarCheck,
  Zap,
  LayoutDashboard,
  ShieldCheck,
  ExternalLink,
  X,
} from 'lucide-react'
import { format } from 'date-fns'
import { id as localeId } from 'date-fns/locale'
import { getMyPaymentHistory } from '@/lib/supabase/payments'
import { cancelPro as apiCancelPro } from '@/lib/supabase/profiles'
import { useNavigate } from 'react-router-dom'
import { PRO_PRICE_MONTHLY, PRO_PRICE_ANNUAL } from '@/hooks/useProfile'

function formatRp(amount) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency', currency: 'IDR', minimumFractionDigits: 0,
  }).format(amount ?? 0)
}

function fmtDate(iso, short = false) {
  if (!iso) return '—'
  return format(new Date(iso), short ? 'dd MMM yyyy' : 'dd MMM yyyy · HH:mm', { locale: localeId })
}

const STATUS_CFG = {
  pending:   { label: 'Menunggu',     cls: 'bg-amber-400/15 text-amber-400 border-amber-400/30', icon: Clock },
  confirmed: { label: 'Berhasil',     cls: 'bg-green-400/15 text-green-400 border-green-400/30', icon: CheckCircle2 },
  rejected:  { label: 'Ditolak',      cls: 'bg-red-400/15 text-red-400 border-red-400/30', icon: X },
}

function StatusBadge({ status }) {
  const cfg = STATUS_CFG[status] ?? STATUS_CFG.pending
  const Icon = cfg.icon
  return (
    <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border font-medium ${cfg.cls}`}>
      <Icon className="h-3 w-3" />
      {cfg.label}
    </span>
  )
}

/**
 * Profile modal — shows plan info, payment history, cancel subscription
 */
export function ProfileModal({ open, onClose, user, profile, pendingPayment, isPro, planExpiresAt, onRefresh, onSignOut, onUpgrade }) {
  const navigate = useNavigate()
  const [history, setHistory] = useState([])
  const [historyLoading, setHistoryLoading] = useState(false)
  const [cancelStep, setCancelStep] = useState(0) // 0: idle, 1: confirm, 2: loading, 3: done
  const [cancelError, setCancelError] = useState('')

  // Fetch payment history when modal opens
  useEffect(() => {
    if (!open || !user?.id) return
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setHistoryLoading(true)
    getMyPaymentHistory(user.id)
      .then(setHistory)
      .catch(console.warn)
      .finally(() => setHistoryLoading(false))
  }, [open, user?.id])

  const handleClose = () => {
    setCancelStep(0)
    setCancelError('')
    onClose()
  }

  const handleCancelPro = async () => {
    setCancelStep(2)
    setCancelError('')
    try {
      await apiCancelPro(user.id)
      setCancelStep(3)
      onRefresh?.()
    } catch (err) {
      setCancelError(err.message)
      setCancelStep(1)
    }
  }

  const initials = user?.email?.[0]?.toUpperCase() ?? '?'
  const memberSince = profile?.created_at
    ? format(new Date(profile.created_at), 'dd MMM yyyy', { locale: localeId })
    : '—'

  const nextRenewal = planExpiresAt ? fmtDate(planExpiresAt.toISOString(), true) : null
  const billingCycle = profile?.billing_cycle === 'annual' ? 'Tahunan' : 'Bulanan'
  const planPrice = profile?.billing_cycle === 'annual' ? PRO_PRICE_ANNUAL : PRO_PRICE_MONTHLY

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden gap-0">

        {/* ── Avatar + Header ── */}
        <div className="relative px-6 pt-6 pb-5 bg-gradient-to-br from-primary/8 to-violet-500/5 border-b border-border">
          <DialogHeader>
            <div className="flex items-start gap-4">
              {/* Avatar circle */}
              <div className="relative shrink-0">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-violet-400 flex items-center justify-center shadow-lg shadow-primary/20">
                  <span className="text-xl font-bold text-white">{initials}</span>
                </div>
                {isPro && (
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-amber-400 border-2 border-background flex items-center justify-center">
                    <Crown className="h-2.5 w-2.5 text-white" />
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0 pt-0.5">
                <DialogTitle className="text-base font-bold text-foreground truncate">
                  {user?.email}
                </DialogTitle>
                <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                  {/* Plan badge */}
                  {isPro ? (
                    <span className="inline-flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-full bg-amber-400/15 text-amber-400 border border-amber-400/30 font-semibold">
                      <Crown className="h-3 w-3" /> Pro
                    </span>
                  ) : pendingPayment ? (
                    <span className="inline-flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-full bg-orange-400/15 text-orange-400 border border-orange-400/30 font-semibold">
                      <Clock className="h-3 w-3" /> Menunggu Verifikasi
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-full bg-secondary text-muted-foreground border border-border font-medium">
                      <Zap className="h-3 w-3" /> Free
                    </span>
                  )}
                  {profile?.is_admin && (
                    <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-primary/15 text-primary border border-primary/25 font-medium">
                      <ShieldCheck className="h-3 w-3" /> Admin
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-1.5">
                  Member sejak {memberSince}
                </p>
              </div>
            </div>
          </DialogHeader>
        </div>

        <div className="max-h-[65vh] overflow-y-auto">

          {/* ── Plan Details ── */}
          <div className="px-6 py-5 border-b border-border space-y-3">
            <p className="text-xs text-muted-foreground uppercase tracking-wide font-semibold">
              Detail Langganan
            </p>

            {isPro ? (
              <>
                {/* Pro plan info cards */}
                <div className="grid grid-cols-2 gap-2.5">
                  <div className="p-3 bg-secondary rounded-xl border border-border">
                    <p className="text-xs text-muted-foreground mb-1">Plan</p>
                    <p className="text-sm font-semibold text-amber-400 flex items-center gap-1">
                      <Crown className="h-3.5 w-3.5" /> Pro · {billingCycle}
                    </p>
                  </div>
                  <div className="p-3 bg-secondary rounded-xl border border-border">
                    <p className="text-xs text-muted-foreground mb-1">Harga</p>
                    <p className="text-sm font-semibold text-foreground">{formatRp(planPrice)}</p>
                  </div>
                  <div className="col-span-2 p-3 bg-secondary rounded-xl border border-border flex items-center gap-2">
                    <CalendarCheck className="h-4 w-4 text-primary shrink-0" />
                    <div>
                      <p className="text-xs text-muted-foreground">Berlaku hingga</p>
                      <p className="text-sm font-semibold text-foreground">{nextRenewal ?? '—'}</p>
                    </div>
                  </div>
                </div>

                {/* Cancel flow */}
                {cancelStep === 0 && (
                  <button
                    onClick={() => setCancelStep(1)}
                    className="text-xs text-red-400 hover:text-red-300 transition-colors underline underline-offset-2 mt-1"
                  >
                    Batalkan langganan Pro
                  </button>
                )}

                {cancelStep === 1 && (
                  <div className="p-3.5 rounded-xl bg-red-400/8 border border-red-400/20 space-y-3">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-semibold text-red-400">Batalkan langganan Pro?</p>
                        <p className="text-xs text-red-400/70 mt-1">
                          Akun akan kembali ke plan Free setelah pembatalan. Tugas yang sudah ada tidak akan hilang.
                        </p>
                      </div>
                    </div>
                    {cancelError && (
                      <p className="text-xs text-red-400 font-medium">{cancelError}</p>
                    )}
                    <div className="flex gap-2">
                      <Button size="sm" variant="ghost" onClick={() => setCancelStep(0)} className="flex-1">
                        Tidak, Tetap Pro
                      </Button>
                      <Button
                        size="sm"
                        className="flex-1 bg-red-500 hover:bg-red-600 text-white"
                        onClick={handleCancelPro}
                      >
                        Ya, Batalkan
                      </Button>
                    </div>
                  </div>
                )}

                {cancelStep === 2 && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground py-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Membatalkan langganan...
                  </div>
                )}

                {cancelStep === 3 && (
                  <div className="p-3 rounded-xl bg-secondary border border-border flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-400 shrink-0" />
                    <p className="text-xs text-muted-foreground">
                      Langganan dibatalkan. Plan kembali ke Free.
                    </p>
                  </div>
                )}
              </>
            ) : pendingPayment ? (
              /* Pending payment info */
              <div className="p-4 rounded-xl bg-orange-400/8 border border-orange-400/20 space-y-2">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-orange-400 shrink-0" />
                  <p className="text-sm font-semibold text-orange-400">Pembayaran Menunggu Verifikasi</p>
                </div>
                <p className="text-xs text-orange-400/70">
                  Pembayaran {formatRp(pendingPayment.amount)} via{' '}
                  <span className="capitalize">{pendingPayment.payment_method}</span>{' '}
                  pada {fmtDate(pendingPayment.created_at)} sedang diverifikasi admin.
                </p>
                <p className="text-xs text-orange-400/70">
                  Estimasi aktivasi: <strong className="text-orange-400">1×24 jam</strong>
                </p>
                <a
                  href="https://wa.me/6281363554262"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1 inline-flex items-center gap-1.5 text-xs text-orange-400 hover:text-orange-300 underline"
                >
                  <ExternalLink className="h-3 w-3" /> Hubungi admin via WhatsApp
                </a>
              </div>
            ) : (
              /* Free plan — show upgrade CTA */
              <div className="space-y-3">
                <div className="p-4 rounded-xl bg-secondary border border-border">
                  <p className="text-sm font-medium text-foreground">Plan Gratis</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Maksimal 15 tugas aktif. Upgrade ke Pro untuk tugas tak terbatas.
                  </p>
                </div>
                <Button
                  className="w-full bg-gradient-to-r from-primary to-violet-500 shadow-md shadow-primary/20"
                  onClick={() => { handleClose(); onUpgrade?.() }}
                >
                  <Crown className="h-4 w-4 mr-2" />
                  Upgrade ke Pro
                </Button>
              </div>
            )}
          </div>

          {/* ── Payment History ── */}
          <div className="px-6 py-5 border-b border-border">
            <p className="text-xs text-muted-foreground uppercase tracking-wide font-semibold mb-3">
              Riwayat Pembayaran
            </p>

            {historyLoading ? (
              <div className="flex items-center gap-2 py-4 text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-xs">Memuat riwayat...</span>
              </div>
            ) : history.length === 0 ? (
              <div className="text-center py-6">
                <Banknote className="h-8 w-8 mx-auto mb-2 text-muted-foreground/30" />
                <p className="text-xs text-muted-foreground">Belum ada riwayat pembayaran</p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {history.map((h) => (
                  <div
                    key={h.id}
                    className="flex items-center justify-between gap-3 p-3 bg-secondary rounded-xl border border-border"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-xs font-semibold text-foreground">
                          {formatRp(h.amount)}
                        </p>
                        <p className="text-xs text-muted-foreground capitalize">{h.payment_method}</p>
                        <p className="text-xs text-muted-foreground">
                          · {h.billing_cycle === 'annual' ? 'Tahunan' : 'Bulanan'}
                        </p>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {fmtDate(h.created_at)}
                      </p>
                    </div>
                    <StatusBadge status={h.status} />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ── Actions ── */}
          <div className="px-6 py-5 space-y-2">
            {profile?.is_admin && (
              <Button
                variant="outline"
                className="w-full justify-start gap-2 border-primary/30 text-primary hover:bg-primary/8"
                onClick={() => { handleClose(); navigate('/admin') }}
              >
                <LayoutDashboard className="h-4 w-4" />
                Buka Admin Panel
              </Button>
            )}
            <Button
              variant="outline"
              className="w-full justify-start gap-2 text-destructive border-destructive/25 hover:bg-destructive/8"
              onClick={() => { handleClose(); onSignOut?.() }}
            >
              <LogOut className="h-4 w-4" />
              Keluar dari Akun
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
