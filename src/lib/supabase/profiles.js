import { supabase } from './client'

/**
 * Get user profile (plan info). Creates one if not exists.
 * Pass email to store it in profiles for admin visibility.
 */
export async function getProfile(userId, email = null) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()

  if (error && error.code === 'PGRST116') {
    return createProfile(userId, email)
  }
  if (error) throw error

  // Store email if not saved yet
  if (email && !data.email) {
    const { data: updated } = await supabase
      .from('profiles')
      .update({ email })
      .eq('id', userId)
      .select()
      .single()
    return updated ?? data
  }
  return data
}

async function createProfile(userId, email = null) {
  const { data, error } = await supabase
    .from('profiles')
    .insert({ id: userId, plan: 'free', ...(email ? { email } : {}) })
    .select()
    .single()

  if (error) throw error
  return data
}

/**
 * Upgrade user to Pro plan
 * @param {string} userId
 * @param {string} expiresAt - ISO timestamp
 * @param {'monthly' | 'annual'} billingCycle
 */
export async function upgradeToPro(userId, expiresAt, billingCycle) {
  const { data, error } = await supabase
    .from('profiles')
    .update({
      plan: 'pro',
      billing_cycle: billingCycle,
      plan_started_at: new Date().toISOString(),
      plan_expires_at: expiresAt,
    })
    .eq('id', userId)
    .select()
    .single()

  if (error) throw error
  return data
}

/**
 * Cancel Pro — revert to free plan
 * @param {string} userId
 */
export async function cancelPro(userId) {
  const { data, error } = await supabase
    .from('profiles')
    .update({
      plan: 'free',
      billing_cycle: null,
      plan_expires_at: null,
    })
    .eq('id', userId)
    .select()
    .single()

  if (error) throw error
  return data
}

/**
 * Update user profile
 * @param {string} userId
 * @param {object} updates
 */
export async function updateProfile(userId, updates) {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single()

  if (error) throw error
  return data
}
