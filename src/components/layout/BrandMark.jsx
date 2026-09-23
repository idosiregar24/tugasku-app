import { cn } from '@/lib/utils'

/** Tugasku logo mark: adaptive glass tile with brand checkmark */
export function BrandMark({ className }) {
  return (
    <span className={cn('inline-flex items-center justify-center rounded-xl glass-chrome text-primary shadow-sm', className)}>
      <svg viewBox="0 0 24 24" className="w-[55%] h-[55%]" aria-hidden="true">
        <path d="M5.5 12.5l4.2 4.2L18.5 7.5" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  )
}
