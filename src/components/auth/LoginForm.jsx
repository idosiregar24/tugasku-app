import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2, LogIn, Mail, Lock } from 'lucide-react'

export function LoginForm() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { error: authError } = await supabase.auth.signInWithPassword({
      email: form.email,
      password: form.password,
    })

    if (authError) {
      const msg =
        authError.message === 'Invalid login credentials'
          ? 'Email atau password salah.'
          : authError.message
      setError(msg)
      setLoading(false)
    } else {
      navigate('/dashboard')
    }
  }

  const handleChange = (field) => (e) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }))

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="login-email">Email</Label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            id="login-email"
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
        <Label htmlFor="login-password">Password</Label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            id="login-password"
            type="password"
            placeholder="••••••••"
            value={form.password}
            onChange={handleChange('password')}
            className="pl-9"
            required
            autoComplete="current-password"
          />
        </div>
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm animate-fade-in">
          {error}
        </div>
      )}

      <Button id="login-submit-btn" type="submit" className="w-full" disabled={loading}>
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin mr-2" />
        ) : (
          <LogIn className="h-4 w-4 mr-2" />
        )}
        {loading ? 'Memproses...' : 'Masuk'}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        Belum punya akun?{' '}
        <Link
          to="/register"
          className="text-primary hover:text-primary/80 hover:underline font-medium transition-colors"
        >
          Daftar sekarang
        </Link>
      </p>
    </form>
  )
}
