import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2, UserPlus, Mail, Lock, CheckCircle } from 'lucide-react'

export function RegisterForm() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (form.password !== form.confirmPassword) {
      setError('Password tidak cocok.')
      return
    }
    if (form.password.length < 6) {
      setError('Password minimal 6 karakter.')
      return
    }

    setLoading(true)

    const { error: authError } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
    })

    setLoading(false)

    if (authError) {
      setError(authError.message)
    } else {
      setSuccess(true)
      // Jika email confirmation disabled di Supabase, user langsung bisa masuk
      setTimeout(() => navigate('/dashboard'), 1500)
    }
  }

  const handleChange = (field) => (e) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }))

  if (success) {
    return (
      <div className="text-center space-y-4 py-6 animate-fade-in">
        <div className="w-14 h-14 rounded-2xl bg-green-500/15 border border-green-500/30 flex items-center justify-center mx-auto">
          <CheckCircle className="h-7 w-7 text-green-400" />
        </div>
        <div>
          <p className="text-foreground font-semibold">Pendaftaran Berhasil!</p>
          <p className="text-sm text-muted-foreground mt-1">
            Mengalihkan ke dashboard...
          </p>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="register-email">Email</Label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            id="register-email"
            type="email"
            placeholder="kamu@contoh.com"
            value={form.email}
            onChange={handleChange('email')}
            className="pl-9"
            required
            autoComplete="email"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="register-password">Password</Label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            id="register-password"
            type="password"
            placeholder="Min. 6 karakter"
            value={form.password}
            onChange={handleChange('password')}
            className="pl-9"
            required
            autoComplete="new-password"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="register-confirm">Konfirmasi Password</Label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            id="register-confirm"
            type="password"
            placeholder="Ulangi password"
            value={form.confirmPassword}
            onChange={handleChange('confirmPassword')}
            className="pl-9"
            required
            autoComplete="new-password"
          />
        </div>
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm animate-fade-in">
          {error}
        </div>
      )}

      <Button
        id="register-submit-btn"
        type="submit"
        className="w-full"
        disabled={loading}
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin mr-2" />
        ) : (
          <UserPlus className="h-4 w-4 mr-2" />
        )}
        {loading ? 'Mendaftar...' : 'Daftar Gratis'}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        Sudah punya akun?{' '}
        <Link
          to="/login"
          className="text-primary hover:text-primary/80 hover:underline font-medium transition-colors"
        >
          Masuk di sini
        </Link>
      </p>
    </form>
  )
}
