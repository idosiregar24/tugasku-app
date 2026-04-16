import { supabase } from './client'

/** Ambil semua pembayaran PENDING (admin only - perlu RLS policy) */
export async function getAllPendingPayments() {
  const { data, error } = await supabase
    .from('payment_records')
    .select('*')
    .eq('status', 'pending')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data ?? []
}

/** Ambil semua riwayat pembayaran (admin only) */
export async function getAllPaymentRecords() {
  const { data, error } = await supabase
    .from('payment_records')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(100)
  if (error) throw error
  return data ?? []
}

/** Ambil semua profil user (admin only) */
export async function getAllProfiles() {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data ?? []
}

/** Admin: konfirmasi pembayaran → aktifkan Pro */
export async function adminConfirmPayment(recordId, userId, billingCycle) {
  const months = billingCycle === 'annual' ? 12 : 1
  const expiresAt = new Date()
  expiresAt.setMonth(expiresAt.getMonth() + months)

  // Tandai pembayaran confirmed
  const { error: payError } = await supabase
    .from('payment_records')
    .update({ status: 'confirmed', confirmed_at: new Date().toISOString() })
    .eq('id', recordId)
  if (payError) throw payError

  // Aktifkan Pro plan
  const { error: profileError } = await supabase
    .from('profiles')
    .update({
      plan: 'pro',
      billing_cycle: billingCycle,
      plan_started_at: new Date().toISOString(),
      plan_expires_at: expiresAt.toISOString(),
    })
    .eq('id', userId)
  if (profileError) throw profileError

  return true
}

/** Admin: tolak pembayaran */
export async function adminRejectPayment(recordId) {
  const { error } = await supabase
    .from('payment_records')
    .update({ status: 'rejected' })
    .eq('id', recordId)
  if (error) throw error
  return true
}

/** Admin: batalkan Pro user */
export async function adminCancelUserPro(userId) {
  const { error } = await supabase
    .from('profiles')
    .update({ plan: 'free', billing_cycle: null, plan_expires_at: null })
    .eq('id', userId)
  if (error) throw error
  return true
}

/** Statistik admin */
export async function getAdminStats() {
  const [profilesRes, paymentsRes] = await Promise.all([
    supabase.from('profiles').select('plan'),
    supabase.from('payment_records').select('amount, status'),
  ])

  const profiles  = profilesRes.data ?? []
  const payments  = paymentsRes.data ?? []

  return {
    totalUsers:      profiles.length,
    proUsers:        profiles.filter((p) => p.plan === 'pro').length,
    pendingPayments: payments.filter((p) => p.status === 'pending').length,
    totalRevenue:    payments
      .filter((p) => p.status === 'confirmed')
      .reduce((sum, p) => sum + (p.amount ?? 0), 0),
  }
}
