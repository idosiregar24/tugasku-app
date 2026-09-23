import { RegisterForm } from '@/components/auth/RegisterForm'
import { AuthShell } from '@/components/auth/AuthShell'

export function RegisterPage() {
  return (
    <AuthShell
      eyebrow="Daftar gratis"
      title={<>Mulai dengan <span className="text-leaf">tenang.</span></>}
      description="Buat akun dalam 30 detik · Tidak perlu kartu kredit"
      footer={
        <>
          Dengan mendaftar, kamu setuju dengan{' '}
          <span className="text-foreground font-medium cursor-pointer hover:underline">Syarat &amp; Ketentuan</span> Tugasku.
        </>
      }
    >
      <RegisterForm />
    </AuthShell>
  )
}
