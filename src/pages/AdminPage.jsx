import { useState, useEffect, useCallback } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { useProfile } from '@/hooks/useProfile'
import {
  getAllPendingPayments,
  getAllPaymentRecords,
  getAllProfiles,
  adminConfirmPayment,
  adminRejectPayment,
  adminCancelUserPro,
  getAdminStats,
} from '@/lib/supabase/admin'
import {
  LayoutDashboard,
  Users,
  Crown,
  Clock,
  TrendingUp,
  CheckCircle2,
  XCircle,
  Loader2,
  RefreshCw,
  AlertCircle,
  BadgeCheck,
  Banknote,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { format } from 'date-fns'
import { id as localeId } from 'date-fns/locale'
import { cn } from '@/lib/utils'

// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatRp(amount) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency', currency: 'IDR', minimumFractionDigits: 0,
  }).format(amount ?? 0)
}

function fmtDate(iso) {
  if (!iso) return '—'
  return format(new Date(iso), 'dd MMM yyyy · HH:mm', { locale: localeId })
}

// ─── Status badge ─────────────────────────────────────────────────────────────
const STATUS_CFG = {
  pending:   { label: 'Menunggu',   cls: 'bg-amber-400/15 text-amber-400 border-amber-400/30' },
  confirmed: { label: 'Dikonfirmasi', cls: 'bg-green-400/15 text-green-400 border-green-400/30' },
  rejected:  { label: 'Ditolak',    cls: 'bg-red-400/15 text-red-400 border-red-400/30' },
}

function StatusBadge({ status }) {
  const cfg = STATUS_CFG[status] ?? STATUS_CFG.pending
  return (
    <span className={`inline-flex items-center text-xs px-2 py-0.5 rounded-full border font-medium ${cfg.cls}`}>
      {cfg.label}
    </span>
  )
}

// ─── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({ icon: Icon, label, value, colorClass, note }) {
  return (
    <div className="bg-card border border-border rounded-xl p-4 flex items-center gap-4">
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${colorClass}`}>
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-2xl font-bold text-foreground leading-none mt-0.5">{value}</p>
        {note && <p className="text-xs text-muted-foreground mt-0.5">{note}</p>}
      </div>
    </div>
  )
}

// ─── Confirm Action ───────────────────────────────────────────────────────────
function PaymentRow({ record, onConfirm, onReject }) {
  const [confirmingAction, setConfirmingAction] = useState(null) // 'confirm' | 'reject'
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')

  const handleAction = async (action) => {
    setLoading(true)
    setError('')
    try {
      if (action === 'confirm') {
        await onConfirm(record.id, record.user_id, record.billing_cycle)
      } else {
        await onReject(record.id)
      }
      setDone(true)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
      setConfirmingAction(null)
    }
  }

  if (done) return null // remove row after action

  return (
    <div className="p-4 bg-card border border-border rounded-xl space-y-3 animate-fade-in">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div className="space-y-1 min-w-0">
          <p className="text-sm font-semibold text-foreground truncate">
            {record.user_email ?? `User: ${record.user_id?.slice(0, 8)}...`}
          </p>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-muted-foreground">{fmtDate(record.created_at)}</span>
            <span className="text-xs text-muted-foreground">·</span>
            <span className="text-xs font-medium text-foreground capitalize">
              {record.payment_method}
            </span>
            <span className="text-xs text-muted-foreground">·</span>
            <span className="text-xs text-muted-foreground capitalize">
              {record.billing_cycle === 'annual' ? 'Tahunan' : 'Bulanan'}
            </span>
          </div>
        </div>
        <p className="text-lg font-bold text-foreground shrink-0">{formatRp(record.amount)}</p>
      </div>

      {error && (
        <p className="text-xs text-red-400 bg-red-400/10 px-3 py-2 rounded-lg">{error}</p>
      )}

      {/* Inline confirm UI */}
      {confirmingAction ? (
        <div className={cn(
          'p-3 rounded-xl border flex items-center justify-between gap-3',
          confirmingAction === 'confirm'
            ? 'bg-green-400/8 border-green-400/20'
            : 'bg-red-400/8 border-red-400/20'
        )}>
          <p className={cn('text-sm font-medium',
            confirmingAction === 'confirm' ? 'text-green-400' : 'text-red-400'
          )}>
            {confirmingAction === 'confirm'
              ? '✅ Yakin ingin konfirmasi & aktifkan Pro?'
              : '❌ Yakin ingin tolak pembayaran ini?'}
          </p>
          <div className="flex gap-2 shrink-0">
            <Button size="sm" variant="ghost" onClick={() => setConfirmingAction(null)}>
              Batal
            </Button>
            <Button
              size="sm"
              className={confirmingAction === 'confirm'
                ? 'bg-green-500 hover:bg-green-600 text-white'
                : 'bg-red-500 hover:bg-red-600 text-white'
              }
              onClick={() => handleAction(confirmingAction)}
              disabled={loading}
            >
              {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : 'Ya, Lanjutkan'}
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex gap-2">
          <Button
            size="sm"
            className="flex-1 bg-green-500 hover:bg-green-600 text-white"
            onClick={() => setConfirmingAction('confirm')}
          >
            <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" />
            Konfirmasi & Aktifkan Pro
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="border-red-500/30 text-red-400 hover:bg-red-500/10"
            onClick={() => setConfirmingAction('reject')}
          >
            <XCircle className="h-3.5 w-3.5 mr-1" />
            Tolak
          </Button>
        </div>
      )}
    </div>
  )
}

// ─── Main Admin Page ──────────────────────────────────────────────────────────
export function AdminPage() {
  const { user, signOut } = useAuth()
  const { profile, loading: profileLoading } = useProfile(user)

  const [activeTab, setActiveTab] = useState('pending')
  const [stats, setStats] = useState(null)
  const [pending, setPending] = useState([])
  const [history, setHistory] = useState([])
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [refreshing, setRefreshing] = useState(false)

  const fetchAll = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const [statsData, pendingData, historyData, usersData] = await Promise.all([
        getAdminStats(),
        getAllPendingPayments(),
        getAllPaymentRecords(),
        getAllProfiles(),
      ])
      setStats(statsData)
      setPending(pendingData)
      setHistory(historyData)
      setUsers(usersData)
    } catch (err) {
      setError('Gagal memuat data admin. Pastikan kamu sudah set is_admin = true dan RLS policy sudah dibuat.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchAll() }, [fetchAll])

  const handleRefresh = async () => {
    setRefreshing(true)
    await fetchAll()
    setRefreshing(false)
  }

  // ── Guard: wait for profile ──────────────────────────────────────────────
  if (profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  // ── Guard: must be admin ─────────────────────────────────────────────────
  if (profile && !profile.is_admin) {
    return <Navigate to="/dashboard" replace />
  }

  const TABS = [
    { id: 'pending',  label: `Pending (${pending.length})`, icon: Clock },
    { id: 'history',  label: 'Riwayat Bayar',               icon: Banknote },
    { id: 'users',    label: `Pengguna (${users.length})`,   icon: Users },
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Ambient glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 right-0 w-[600px] h-[400px] bg-violet-600/4 rounded-full blur-3xl" />
      </div>

      {/* ── Header ── */}
      <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-400/20 border border-amber-400/30 flex items-center justify-center">
              <Crown className="h-4 w-4 text-amber-400" />
            </div>
            <div>
              <p className="text-sm font-bold text-foreground leading-none">Admin Panel</p>
              <p className="text-xs text-muted-foreground leading-none mt-0.5">Tugasku</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRefresh}
              disabled={refreshing}
              className="gap-1.5"
            >
              <RefreshCw className={cn('h-3.5 w-3.5', refreshing && 'animate-spin')} />
              Refresh
            </Button>
            <Link to="/dashboard">
              <Button variant="outline" size="sm" className="gap-1.5">
                <LayoutDashboard className="h-3.5 w-3.5" />
                Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="relative max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8">

        {/* ── Error ── */}
        {error && (
          <div className="flex items-start gap-3 p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive">
            <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold">Akses Ditolak / Error</p>
              <p className="text-xs mt-1">{error}</p>
              <p className="text-xs mt-1">Jalankan SQL dari artifact <strong>supabase_admin_setup.md</strong> terlebih dahulu.</p>
            </div>
          </div>
        )}

        {/* ── Stats ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            icon={Users}
            label="Total User"
            value={stats?.totalUsers ?? '—'}
            colorClass="bg-primary/15 text-primary"
          />
          <StatCard
            icon={Crown}
            label="User Pro"
            value={stats?.proUsers ?? '—'}
            colorClass="bg-amber-400/15 text-amber-400"
          />
          <StatCard
            icon={Clock}
            label="Menunggu Konfirmasi"
            value={stats?.pendingPayments ?? '—'}
            colorClass="bg-orange-400/15 text-orange-400"
          />
          <StatCard
            icon={TrendingUp}
            label="Total Pendapatan"
            value={stats ? formatRp(stats.totalRevenue) : '—'}
            colorClass="bg-green-400/15 text-green-400"
          />
        </div>

        {/* ── Tabs ── */}
        <div>
          <div className="flex items-center gap-1 p-1 bg-secondary rounded-xl border border-border w-fit mb-6">
            {TABS.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    'flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200',
                    activeTab === tab.id
                      ? 'bg-card text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {tab.label}
                </button>
              )
            })}
          </div>

          {/* Loading */}
          {loading && (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          )}

          {/* ── TAB: Pending ── */}
          {!loading && activeTab === 'pending' && (
            <div className="space-y-3">
              {pending.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <CheckCircle2 className="h-10 w-10 mx-auto mb-3 text-green-400/50" />
                  <p className="text-sm">Tidak ada pembayaran yang menunggu</p>
                </div>
              ) : (
                pending.map((record) => (
                  <PaymentRow
                    key={record.id}
                    record={record}
                    onConfirm={adminConfirmPayment}
                    onReject={adminRejectPayment}
                  />
                ))
              )}
            </div>
          )}

          {/* ── TAB: Riwayat ── */}
          {!loading && activeTab === 'history' && (
            <div className="bg-card border border-border rounded-2xl overflow-hidden">
              {history.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Banknote className="h-10 w-10 mx-auto mb-3 opacity-30" />
                  <p className="text-sm">Belum ada riwayat pembayaran</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border bg-secondary/40">
                        {['User', 'Jumlah', 'Metode', 'Siklus', 'Status', 'Tanggal'].map((h) => (
                          <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {history.map((r, i) => (
                        <tr key={r.id} className={cn('border-b border-border/50 hover:bg-secondary/30 transition-colors', i % 2 === 0 ? '' : 'bg-secondary/10')}>
                          <td className="px-4 py-3 max-w-[160px]">
                            <p className="truncate text-xs text-foreground font-medium">
                              {r.user_email ?? r.user_id?.slice(0, 12) + '...'}
                            </p>
                          </td>
                          <td className="px-4 py-3 font-semibold text-foreground">{formatRp(r.amount)}</td>
                          <td className="px-4 py-3 text-muted-foreground capitalize">{r.payment_method}</td>
                          <td className="px-4 py-3 text-muted-foreground">
                            {r.billing_cycle === 'annual' ? 'Tahunan' : 'Bulanan'}
                          </td>
                          <td className="px-4 py-3"><StatusBadge status={r.status} /></td>
                          <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
                            {fmtDate(r.created_at)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ── TAB: Users ── */}
          {!loading && activeTab === 'users' && (
            <div className="bg-card border border-border rounded-2xl overflow-hidden">
              {users.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Users className="h-10 w-10 mx-auto mb-3 opacity-30" />
                  <p className="text-sm">Belum ada pengguna terdaftar</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border bg-secondary/40">
                        {['Email / User ID', 'Plan', 'Berlaku Hingga', 'Admin', 'Bergabung', 'Aksi'].map((h) => (
                          <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((u, i) => (
                        <UserRow key={u.id} user={u} index={i} />
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

function UserRow({ user, index }) {
  const [cancelling, setCancelling] = useState(false)
  const [cancelled, setCancelled] = useState(false)
  const [plan, setPlan] = useState(user.plan)

  const handleCancelPro = async () => {
    setCancelling(true)
    try {
      await adminCancelUserPro(user.id)
      setPlan('free')
      setCancelled(true)
    } catch (err) {
      console.error(err)
    } finally {
      setCancelling(false)
    }
  }

  return (
    <tr className={cn('border-b border-border/50 hover:bg-secondary/30 transition-colors', index % 2 === 0 ? '' : 'bg-secondary/10')}>
      <td className="px-4 py-3 max-w-[200px]">
        <p className="truncate text-xs font-medium text-foreground">
          {user.email ?? user.id?.slice(0, 16) + '...'}
        </p>
      </td>
      <td className="px-4 py-3">
        <span className={cn(
          'inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border font-medium',
          plan === 'pro'
            ? 'bg-amber-400/15 text-amber-400 border-amber-400/30'
            : 'bg-secondary text-muted-foreground border-border'
        )}>
          {plan === 'pro' && <Crown className="h-3 w-3" />}
          {plan === 'pro' ? 'Pro' : 'Free'}
        </span>
      </td>
      <td className="px-4 py-3 text-xs text-muted-foreground">
        {user.plan_expires_at ? fmtDate(user.plan_expires_at).split('·')[0] : '—'}
      </td>
      <td className="px-4 py-3">
        {user.is_admin && <BadgeCheck className="h-4 w-4 text-primary" />}
      </td>
      <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
        {user.created_at ? format(new Date(user.created_at), 'dd MMM yyyy', { locale: localeId }) : '—'}
      </td>
      <td className="px-4 py-3">
        {plan === 'pro' && !cancelled && (
          <button
            onClick={handleCancelPro}
            disabled={cancelling}
            className="text-xs text-red-400 hover:text-red-300 transition-colors"
          >
            {cancelling ? 'Membatalkan...' : 'Batalkan Pro'}
          </button>
        )}
        {cancelled && (
          <span className="text-xs text-muted-foreground">Dibatalkan</span>
        )}
      </td>
    </tr>
  )
}
