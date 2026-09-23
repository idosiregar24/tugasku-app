import { Link } from 'react-router-dom'
import { BrandMark } from '@/components/layout/BrandMark'

/**
 * Shared layout for login / register / forgot-password: brand + one liquid-glass card over the scene.
 * @param {{ eyebrow: string, title: import('react').ReactNode, description?: import('react').ReactNode, children: import('react').ReactNode, footer?: import('react').ReactNode }} props
 */
export function AuthShell({ eyebrow, title, description, children, footer }) {
  return (
    <div className="min-h-app flex items-center justify-center px-4 pt-[calc(2.5rem+env(safe-area-inset-top))] pb-[calc(2.5rem+env(safe-area-inset-bottom))]">
      <div className="w-full max-w-md animate-fade-up">
        <Link to="/" className="flex items-center justify-center gap-2.5 mb-8">
          <BrandMark className="w-10 h-10" />
          <span className="text-2xl font-semibold tracking-[-0.03em] text-foreground">Tugasku</span>
        </Link>

        <div className="surface rounded-[30px] p-6 sm:p-8">
          <p className="eyebrow flex items-center gap-2 mb-3">
            <span className="w-1.5 h-1.5 rounded-full bg-primary" /> {eyebrow}
          </p>
          <h1 className="text-[28px] leading-tight font-semibold tracking-[-0.03em] text-foreground">{title}</h1>
          {description && <p className="text-sm text-muted-foreground mt-2 mb-6">{description}</p>}
          {!description && <div className="h-6" />}
          {children}
        </div>

        {footer && (
          <div className="flex justify-center mt-6">
            <p className="glass-chrome rounded-2xl px-4 py-2.5 text-center text-xs text-foreground/80 max-w-sm">{footer}</p>
          </div>
        )}
      </div>
    </div>
  )
}
