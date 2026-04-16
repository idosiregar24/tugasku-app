import { supabase } from './client'

/**
 * Simpan record pembayaran dengan status 'pending'
 */
export async function createPaymentRecord({ userId, userEmail, plan, billingCycle, amount, paymentMethod }) {
  const { data, error } = await supabase
    .from('payment_records')
    .insert({
      user_id: userId,
      user_email: userEmail ?? null,
      plan,
      billing_cycle: billingCycle,
      amount,
      payment_method: paymentMethod,
      status: 'pending',
    })
    .select()
    .single()

  if (error) throw error
  return data
}

/**
 * Cek pembayaran user yang sedang pending
 */
export async function getPendingPayment(userId) {
  const { data, error } = await supabase
    .from('payment_records')
    .select('*')
    .eq('user_id', userId)
    .eq('status', 'pending')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error) {
    if (error.code === '42P01') return null // table doesn't exist yet
    console.warn('getPendingPayment:', error.message)
    return null
  }
  return data
}

/**
 * Riwayat pembayaran milik user sendiri
 */
export async function getMyPaymentHistory(userId) {
  const { data, error } = await supabase
    .from('payment_records')
    .select('id, plan, billing_cycle, amount, payment_method, status, created_at, confirmed_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(10)

  if (error) {
    if (error.code === '42P01') return []
    console.warn('getMyPaymentHistory:', error.message)
    return []
  }
  return data ?? []
}
