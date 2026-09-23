import { cn } from '@/lib/utils'

/** Tugasku logo mark: ink tile with a leaf-green check (matches the app icon) */
export function BrandMark({ className }) {
  return (
    <span className={cn('inline-flex items-center justify-center rounded-[10px] bg-[#17181d] ring-1 ring-white/10 shadow-[0_6px_16px_-8px_hsl(222_45%_12%/0.6)]', className)}>
      <svg viewBox="0 0 24 24" className="w-[55%] h-[55%]" aria-hidden="true">
        <path d="M5.5 12.5l4.2 4.2L18.5 7.5" fill="none" stroke="#a9d666" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  )
}
