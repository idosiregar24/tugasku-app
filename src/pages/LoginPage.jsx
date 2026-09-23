import { LoginForm } from '@/components/auth/LoginForm'
import { AuthShell } from '@/components/auth/AuthShell'

export function LoginPage() {
  return (
    <AuthShell
      eyebrow="Masuk"
      title={<>Selamat datang <span className="text-leaf">kembali.</span></>}
      description="Masuk untuk melanjutkan tugas dan jadwalmu."
      footer={
        <>
          Dengan masuk, kamu setuju dengan{' '}
          <span className="text-foreground font-medium cursor-pointer hover:underline">Syarat &amp; Ketentuan</span> Tugasku.
        </>
      }
    >
      <LoginForm />
    </AuthShell>
  )
}
