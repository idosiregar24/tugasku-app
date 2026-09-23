import { useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { AuthShell } from '@/components/auth/AuthShell'
import { Loader2, Mail, ArrowLeft, CheckCircle2 } from 'lucide-react'

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/login`,
    })

    if (resetError) {
      setError(resetError.message)
      setLoading(false)
    } else {
      setSuccess(true)
      setLoading(false)
    }
  }

  return (
    <AuthShell
      eyebrow="Pemulihan akun"
      title={<>Lupa <span className="text-leaf">password?</span></>}
      description={success
        ? 'Instruksi pemulihan telah dikirim ke email kamu.'
        : 'Masukkan email kamu untuk mengatur ulang password.'}
    >
            {success ? (
              <div className="space-y-6 text-center animate-fade-in">
                <div className="flex justify-center">
                  <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                    <CheckCircle2 className="h-8 w-8 text-emerald-500" />
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  Silakan periksa kotak masuk (dan folder spam) email kamu untuk melanjutkan proses pengaturan ulang password.
                </p>
                <Link to="/login">
                  <Button className="w-full h-11 rounded-xl">
                    Kembali ke Login
                  </Button>
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="reset-email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                    <Input
                      id="reset-email"
                      type="email"
                      placeholder="kamu@contoh.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-9 h-11 rounded-xl"
                      required
                    />
                  </div>
                </div>

                {error && (
                  <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                    {error}
                  </div>
                )}

                <Button type="submit" className="w-full h-11 rounded-xl font-bold" disabled={loading}>
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <ArrowLeft className="h-4 w-4 mr-2 rotate-180" />
                  )}
                  {loading ? 'Mengirim...' : 'Kirim Link Pemulihan'}
                </Button>

                <div className="text-center">
                  <Link to="/login" className="text-xs text-muted-foreground hover:text-primary transition-colors flex items-center justify-center gap-2">
                    <ArrowLeft className="h-3 w-3" /> Kembali ke halaman login
                  </Link>
                </div>
              </form>
            )}
    </AuthShell>
  )
}
