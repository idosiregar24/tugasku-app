import { LayoutDashboard } from 'lucide-react'
import { RegisterForm } from '@/components/auth/RegisterForm'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'

export function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden py-12 px-4">
      {/* Background glow effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-1/4 w-[600px] h-[400px] bg-violet-600/8 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[450px] h-[350px] bg-primary/6 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md animate-fade-in">
        {/* Brand logo */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-primary/20 border border-primary/30 flex items-center justify-center shadow-lg shadow-primary/20">
              <LayoutDashboard className="h-5 w-5 text-primary" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary via-violet-400 to-purple-300 bg-clip-text text-transparent">
              Tugasku
            </h1>
          </div>
        </div>

        <Card className="border-border/50 bg-card/70 backdrop-blur-md shadow-2xl shadow-black/50">
          <CardHeader className="text-center space-y-1 pb-4">
            <CardTitle className="text-2xl">Mulai Gratis Sekarang ✨</CardTitle>
            <CardDescription>
              Buat akun dalam 30 detik · Tidak perlu kartu kredit
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RegisterForm />
          </CardContent>
        </Card>

        <p className="text-center text-xs text-muted-foreground mt-6">
          Dengan mendaftar, kamu setuju dengan{' '}
          <span className="text-primary/80 cursor-pointer hover:underline">
            Syarat &amp; Ketentuan
          </span>{' '}
          Tugasku.
        </p>
      </div>
    </div>
  )
}
