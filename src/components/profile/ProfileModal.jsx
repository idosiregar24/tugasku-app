import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
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
  MessageCircle
} from 'lucide-react'
import { format } from 'date-fns'
import { id as localeId } from 'date-fns/locale'
import { getMyPaymentHistory } from '@/lib/supabase/payments'
import { cancelPro as apiCancelPro } from '@/lib/supabase/profiles'
import { useNavigate } from 'react-router-dom'
import { PRO_PRICE_MONTHLY, PRO_PRICE_ANNUAL } from '@/hooks/useProfile'
import { cn } from '@/lib/utils'

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
  const [activeTab, setActiveTab] = useState('profile') // 'profile', 'billing'

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

        {/* ── Tabs Navigation ── */}
        <div className="flex border-b border-border px-6">
          <button 
            onClick={() => setActiveTab('profile')}
            className={cn(
              "px-4 py-3 text-xs font-black uppercase tracking-[0.15em] transition-all relative",
              activeTab === 'profile' ? "text-primary" : "text-muted-foreground hover:text-foreground"
            )}
          >
            Account & Plan
            {activeTab === 'profile' && <motion.div layoutId="tab-line" className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />}
          </button>
          <button 
            onClick={() => setActiveTab('billing')}
            className={cn(
              "px-4 py-3 text-xs font-black uppercase tracking-[0.15em] transition-all relative",
              activeTab === 'billing' ? "text-primary" : "text-muted-foreground hover:text-foreground"
            )}
          >
            Billing History
            {activeTab === 'billing' && <motion.div layoutId="tab-line" className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />}
          </button>
        </div>

        <div className="max-h-[60vh] overflow-y-auto p-6">
          {activeTab === 'profile' ? (
            <div className="space-y-6">
              {/* Profile Overview */}
              <div className="flex items-center gap-4 p-4 rounded-3xl bg-secondary/30 border border-border/50">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-violet-500 flex items-center justify-center text-2xl font-black text-white shadow-xl shadow-primary/20">
                  {initials}
                </div>
                <div>
                  <h3 className="text-sm font-black text-foreground">{user?.email}</h3>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">Member since {memberSince}</p>
                </div>
              </div>

              {/* Plan Section */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Current Plan</h4>
                  {isPro ? (
                    <span className="flex items-center gap-1.5 text-[10px] font-black text-amber-400 bg-amber-400/10 px-2.5 py-1 rounded-full border border-amber-400/20 uppercase tracking-widest">
                      <Crown className="h-3 w-3" /> PRO ACCOUNT
                    </span>
                  ) : (
                    <span className="text-[10px] font-black text-muted-foreground bg-secondary px-2.5 py-1 rounded-full border border-border uppercase tracking-widest">FREE PLAN</span>
                  )}
                </div>

                {isPro ? (
                  <div className="grid grid-cols-1 gap-3">
                    <div className="p-4 bg-card/50 rounded-2xl border border-border/50 shadow-sm">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <p className="text-xs font-bold text-foreground">Pro {billingCycle}</p>
                          <p className="text-lg font-black text-primary">{formatRp(planPrice)}</p>
                        </div>
                        <div className="p-3 bg-primary/10 rounded-xl">
                          <Crown className="h-5 w-5 text-primary" />
                        </div>
                      </div>
                      <div className="flex items-center gap-2 pt-4 border-t border-border/50 text-[11px] text-muted-foreground">
                        <CalendarCheck className="h-4 w-4 text-primary" />
                        <span>Renews on <strong className="text-foreground">{nextRenewal ?? '—'}</strong></span>
                      </div>
                    </div>

                    {/* Cancel flow */}
                    {cancelStep === 0 && (
                      <button
                        onClick={() => setCancelStep(1)}
                        className="text-[10px] font-bold text-red-400/60 hover:text-red-400 uppercase tracking-widest transition-colors text-center w-full py-2"
                      >
                        Cancel Subscription
                      </button>
                    )}
                    {cancelStep === 1 && (
                      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-4 rounded-2xl bg-red-400/5 border border-red-400/20 space-y-4">
                        <div className="flex gap-3">
                          <AlertTriangle className="h-5 w-5 text-red-400 shrink-0" />
                          <div>
                            <p className="text-sm font-bold text-red-400">Cancel Pro Plan?</p>
                            <p className="text-[11px] text-red-400/70 mt-1 leading-relaxed">
                              Your account will revert to Free after the current period. You'll lose Pro features but keep all your tasks.
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="ghost" onClick={() => setCancelStep(0)} className="flex-1 text-[11px] font-black uppercase">Wait, Keep Pro</Button>
                          <Button size="sm" className="flex-1 bg-red-500 hover:bg-red-600 text-white text-[11px] font-black uppercase" onClick={handleCancelPro}>Cancel Now</Button>
                        </div>
                      </motion.div>
                    )}
                  </div>
                ) : pendingPayment ? (
                  <div className="p-6 rounded-[32px] bg-amber-400/5 border border-amber-400/20 text-center space-y-4 animate-pulse">
                    <div className="w-12 h-12 rounded-2xl bg-amber-400/20 flex items-center justify-center mx-auto border border-amber-400/30">
                      <Clock className="h-6 w-6 text-amber-400" />
                    </div>
                    <div>
                      <h5 className="text-base font-black text-amber-400 uppercase tracking-tight">Menunggu Verifikasi</h5>
                      <p className="text-[11px] text-muted-foreground mt-2 max-w-[240px] mx-auto leading-relaxed">
                        Pembayaran kamu sedang diproses oleh admin. Aktivasi manual dilakukan dalam <strong className="text-foreground">1x24 jam</strong>.
                      </p>
                    </div>
                    <Button 
                      variant="outline" 
                      className="w-full border-amber-400/30 text-amber-400 hover:bg-amber-400/10 text-[10px] font-black uppercase tracking-widest h-10"
                      onClick={() => window.open('https://wa.me/6281363554262', '_blank')}
                    >
                      <MessageCircle className="w-3 h-3 mr-2" /> Hubungi Admin
                    </Button>
                  </div>
                ) : (
                  <div className="p-6 rounded-[32px] bg-gradient-to-br from-primary/10 to-violet-500/10 border border-primary/20 text-center space-y-4">
                    <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center mx-auto shadow-lg shadow-primary/20">
                      <Zap className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h5 className="text-base font-black text-foreground">Unlock Full Power</h5>
                      <p className="text-xs text-muted-foreground mt-1 max-w-[200px] mx-auto">Get unlimited tasks, pro features, and priority support.</p>
                    </div>
                    <Button
                      className="w-full h-11 bg-primary hover:bg-primary/90 text-white font-black text-xs uppercase tracking-widest rounded-xl shadow-xl shadow-primary/20"
                      onClick={() => { handleClose(); onUpgrade?.() }}
                    >
                      Upgrade to Pro
                    </Button>
                  </div>
                )}
              </div>

              {/* Sign Out */}
              <div className="pt-4 border-t border-border/50">
                <Button
                  variant="ghost"
                  className="w-full justify-center gap-2 text-muted-foreground hover:text-destructive hover:bg-destructive/5 font-bold text-xs uppercase tracking-widest"
                  onClick={() => { handleClose(); onSignOut?.() }}
                >
                  <LogOut className="h-4 w-4" /> Sign Out
                </Button>
              </div>
            </div>
          ) : (
            /* Billing History Tab */
            <div className="space-y-6">
               <div className="flex items-center justify-between">
                  <h4 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Transaction History</h4>
                  <Banknote className="h-4 w-4 text-muted-foreground/40" />
                </div>

                {historyLoading ? (
                  <div className="flex flex-col items-center justify-center py-12 gap-3 text-muted-foreground">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Fetching data...</span>
                  </div>
                ) : history.length === 0 ? (
                  <div className="text-center py-12 bg-secondary/20 rounded-[32px] border border-dashed border-border">
                    <div className="w-12 h-12 rounded-full bg-muted/20 flex items-center justify-center mx-auto mb-4">
                       <Banknote className="h-6 w-6 text-muted-foreground/30" />
                    </div>
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">No payment history found</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {history.map((h) => (
                      <div
                        key={h.id}
                        className="group flex items-center justify-between gap-4 p-4 bg-card/40 hover:bg-card/80 rounded-2xl border border-white/5 transition-all duration-300"
                      >
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                             <p className="text-sm font-black text-foreground">{formatRp(h.amount)}</p>
                             <span className="text-[10px] font-bold text-muted-foreground bg-secondary px-1.5 py-0.5 rounded uppercase tracking-tighter">{h.payment_method}</span>
                          </div>
                          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">
                            {fmtDate(h.created_at)} · {h.billing_cycle === 'annual' ? 'ANNUAL' : 'MONTHLY'}
                          </p>
                        </div>
                        <StatusBadge status={h.status} />
                      </div>
                    ))}
                  </div>
                )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
