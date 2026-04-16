import { useState, useEffect, useCallback } from 'react'
import { getProfile, upgradeToPro as apiUpgrade, cancelPro as apiCancel } from '@/lib/supabase/profiles'
import { getPendingPayment } from '@/lib/supabase/payments'

export const PRO_PRICE_MONTHLY = 49000
export const PRO_PRICE_ANNUAL = 390000
export const PRO_TASK_LIMIT = 999999

/**
 * Hook untuk mengelola profil dan plan (free/pro) user
 * @param {import('@supabase/supabase-js').User | null} user
 */
export function useProfile(user) {
  const [profile, setProfile] = useState(null)
  const [pendingPayment, setPendingPayment] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchProfile = useCallback(async () => {
    if (!user) { setLoading(false); return }
    try {
      setLoading(true)
      setError(null)
      const [profileData, pendingData] = await Promise.all([
        getProfile(user.id, user.email),
        getPendingPayment(user.id),
      ])
      setProfile(profileData)
      setPendingPayment(pendingData)
    } catch (err) {
      console.warn('Profile fetch failed, defaulting to free plan:', err.message)
      setProfile({ plan: 'free' })
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    fetchProfile()
  }, [fetchProfile])

  // Check if pro plan is active and not expired
  const isPro =
    profile?.plan === 'pro' &&
    (!profile.plan_expires_at || new Date(profile.plan_expires_at) > new Date())

  const planExpiresAt = profile?.plan_expires_at
    ? new Date(profile.plan_expires_at)
    : null

  const cancelPro = async () => {
    const updated = await apiCancel(user.id)
    setProfile(updated)
    return updated
  }

  return {
    profile,
    pendingPayment,
    loading,
    error,
    isPro,
    planExpiresAt,
    billingCycle: profile?.billing_cycle ?? 'monthly',
    cancelPro,
    refetch: fetchProfile,
  }
}
