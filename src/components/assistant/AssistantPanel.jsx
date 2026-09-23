import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Sparkles,
  X,
  ChevronDown,
  ArrowUp,
  Square,
  SquarePen,
  CheckCircle2,
  PencilLine,
  AlertTriangle,
  RotateCcw,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useMediaQuery } from '@/hooks/useMediaQuery'

const SUGGESTIONS = [
  'Apa yang harus kukerjakan duluan hari ini?',
  'Ringkas tugas yang deadline-nya minggu ini',
  'Tambah tugas: laporan praktikum, deadline Jumat, prioritas tinggi',
  'Buatkan jadwal belajar besok jam 19.00–21.00',
]

function renderInline(text, keyPrefix) {
  return text.split(/(\*\*[^*]+\*\*)/g).map((part, i) =>
    part.startsWith('**') && part.endsWith('**') && part.length > 4 ? (
      <strong key={`${keyPrefix}-${i}`} className="font-bold text-foreground">{part.slice(2, -2)}</strong>
    ) : (
      part
    )
  )
}

// Minimal markdown: paragraphs, "- " / "1. " lists and **bold**. Built as React
// nodes (never innerHTML) because the text comes from the model.
function RichText({ text }) {
  const blocks = []
  let list = null
  let paragraph = []

  const flushParagraph = () => {
    if (paragraph.length) blocks.push({ type: 'p', lines: paragraph })
    paragraph = []
  }
  const flushList = () => {
    if (list) blocks.push(list)
    list = null
  }

  for (const raw of text.split('\n')) {
    const line = raw.trimEnd()
    const bullet = line.match(/^\s*[-*•]\s+(.*)$/)
    const numbered = line.match(/^\s*(\d+)[.)]\s+(.*)$/)
    if (bullet || numbered) {
      flushParagraph()
      const type = bullet ? 'ul' : 'ol'
      if (!list || list.type !== type) {
        flushList()
        list = { type, items: [] }
      }
      list.items.push(bullet ? bullet[1] : numbered[2])
    } else if (!line.trim()) {
      flushParagraph()
      flushList()
    } else {
      flushList()
      paragraph.push(line.replace(/^#{1,6}\s+/, ''))
    }
  }
  flushParagraph()
  flushList()

  return (
    <div className="space-y-2.5">
      {blocks.map((block, i) => {
        if (block.type === 'p') {
          return (
            <p key={i}>
              {block.lines.map((l, j) => (
                <span key={j}>
                  {j > 0 && <br />}
                  {renderInline(l, `${i}-${j}`)}
                </span>
              ))}
            </p>
          )
        }
        const ListTag = block.type
        return (
          <ListTag key={i} className={cn('space-y-1 pl-5', block.type === 'ul' ? 'list-disc' : 'list-decimal')}>
            {block.items.map((item, j) => (
              <li key={j} className="pl-0.5 marker:text-primary/70">{renderInline(item, `${i}-${j}`)}</li>
            ))}
          </ListTag>
        )
      })}
    </div>
  )
}

function ActionChip({ action, onOpenTask }) {
  const isError = action.kind === 'error'
  const Icon = isError ? AlertTriangle : action.kind === 'update' ? PencilLine : CheckCircle2
  const clickable = !isError && action.taskId
  return (
    <button
      type="button"
      disabled={!clickable}
      onClick={() => clickable && onOpenTask(action.taskId)}
      className={cn(
        'w-full block rounded-xl border bg-card/90 px-3.5 py-3 text-left transition-colors',
        isError ? 'border-destructive/25' : 'border-hairline/10 hover:border-primary/40'
      )}
    >
      <span className={cn('eyebrow flex items-center gap-1.5 mb-1', isError ? 'text-destructive' : 'text-success')}>
        <Icon className="h-3.5 w-3.5" /> {action.label}
      </span>
      {action.title && <span className="block text-sm font-semibold text-foreground truncate">{action.title}</span>}
      {action.meta && <span className="block text-xs text-muted-foreground mt-0.5">{action.meta}</span>}
    </button>
  )
}

function TypingDots({ label }) {
  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground">
      <span className="flex gap-1">
        {[0, 1, 2].map((i) => (
          <span key={i} className="h-1.5 w-1.5 rounded-full bg-primary/70 animate-bounce" style={{ animationDelay: `${i * 120}ms` }} />
        ))}
      </span>
      {label}
    </div>
  )
}

/**
 * @param {{ open: boolean, onOpenChange: (open: boolean) => void, assistant: ReturnType<typeof import('@/hooks/useAssistant').useAssistant>, onOpenTask: (taskId: string) => void, userName?: string }} props
 */
export function AssistantPanel({ open, onOpenChange, assistant, onOpenTask, userName }) {
  const { messages, busy, send, stop, reset, retry } = assistant
  const [draft, setDraft] = useState('')
  const isDesktop = useMediaQuery('(min-width: 768px)')
  const scrollRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    const el = scrollRef.current
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    if (!open) return
    // Opening the keyboard on phones would hide the suggestions
    const focusTimer = isDesktop ? setTimeout(() => inputRef.current?.focus(), 150) : null
    const onKey = (e) => e.key === 'Escape' && onOpenChange(false)
    window.addEventListener('keydown', onKey)
    return () => {
      clearTimeout(focusTimer)
      window.removeEventListener('keydown', onKey)
    }
  }, [open, isDesktop, onOpenChange])

  useEffect(() => {
    const el = inputRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${Math.min(el.scrollHeight, 140)}px`
  }, [draft])

  const submit = (text = draft) => {
    if (!text.trim() || busy) return
    send(text)
    setDraft('')
  }

  const firstName = userName?.split(' ')[0]

  return (
    <AnimatePresence>
      {open && (
        <motion.section
          role="dialog"
          aria-label="Asisten AI"
          initial={isDesktop ? { opacity: 0, x: 32 } : { y: '100%' }}
          animate={isDesktop ? { opacity: 1, x: 0 } : { y: 0 }}
          exit={isDesktop ? { opacity: 0, x: 32 } : { y: '100%' }}
          transition={{ type: 'spring', stiffness: 360, damping: 36 }}
          className={cn(
            'fixed z-[45] flex flex-col inset-0 pt-safe',
            'bg-[hsl(var(--glass)/0.82)] backdrop-blur-[28px] backdrop-saturate-150',
            'md:inset-auto md:right-4 md:top-4 md:bottom-4 md:w-[420px] md:pt-0 md:rounded-[28px] md:overflow-hidden md:lg-rim',
            'md:bg-[hsl(var(--glass)/0.72)]'
          )}
        >
          {/* Header */}
          <header className="flex items-center gap-3 px-4 h-16 border-b border-hairline/10 shrink-0">
            <div className="h-10 w-10 rounded-xl bg-primary text-primary-foreground flex items-center justify-center">
              <Sparkles className="h-5 w-5" />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-sm font-semibold tracking-tight text-foreground">Asisten Tugasku</h2>
              <p className="text-xs text-muted-foreground truncate">
                {busy ? 'Sedang mengetik…' : 'Bisa baca & kelola tugasmu'}
              </p>
            </div>
            {messages.length > 0 && (
              <button
                onClick={reset}
                className="h-10 w-10 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-hairline/10 transition-colors"
                title="Percakapan baru"
                aria-label="Percakapan baru"
              >
                <SquarePen className="h-[18px] w-[18px]" />
              </button>
            )}
            <button
              onClick={() => onOpenChange(false)}
              className="h-10 w-10 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-hairline/10 transition-colors"
              aria-label="Tutup asisten"
            >
              {isDesktop ? <X className="h-5 w-5" /> : <ChevronDown className="h-6 w-6" />}
            </button>
          </header>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto overscroll-contain px-4 py-5 space-y-5">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col justify-end gap-6 pb-2">
                <div className="space-y-2">
                  <p className="eyebrow flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary" /> Asisten · Saran
                  </p>
                  <p className="text-3xl font-semibold tracking-[-0.03em] text-foreground">
                    Halo{firstName ? `, ${firstName}` : ''}.
                  </p>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Aku bisa bantu atur prioritas, bikin rencana belajar, atau langsung menambah tugas dan jadwal buatmu.
                  </p>
                </div>
                <div className="grid gap-2">
                  {SUGGESTIONS.map((s) => (
                    <button
                      key={s}
                      onClick={() => submit(s)}
                      className="lg-rim text-left text-sm font-medium rounded-2xl bg-card/75 px-4 py-3 text-foreground/90 hover:bg-card/95 active:scale-[0.99] transition"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              messages.map((m) =>
                m.role === 'user' ? (
                  <div key={m.id} className="flex justify-end">
                    <div className="max-w-[85%] rounded-[18px] rounded-br-md bg-foreground px-4 py-2.5 text-sm text-background whitespace-pre-wrap break-words">
                      {m.text}
                    </div>
                  </div>
                ) : (
                  <div key={m.id} className="flex gap-2.5">
                    <div className="h-7 w-7 shrink-0 rounded-lg bg-primary/15 flex items-center justify-center mt-0.5">
                      <Sparkles className="h-3.5 w-3.5 text-primary" />
                    </div>
                    <div className="min-w-0 flex-1 space-y-2.5 text-sm leading-relaxed text-foreground/90 break-words">
                      {m.parts.map((part, i) =>
                        part.type === 'text' ? (
                          <RichText key={i} text={part.text} />
                        ) : (
                          <ActionChip key={i} action={part.action} onOpenTask={onOpenTask} />
                        )
                      )}
                      {m.pending && m.activity && (
                        <TypingDots label={m.activity === 'tool' ? 'Menyimpan ke papan…' : m.parts.length ? '' : 'Berpikir…'} />
                      )}
                      {m.error && (
                        <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-destructive/25 bg-destructive/10 px-3 py-2.5 text-xs text-destructive">
                          <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                          <span className="flex-1 min-w-0">{m.error}</span>
                          {m.retryText && !busy && (
                            <button
                              onClick={() => retry(m.id, m.retryText)}
                              className="inline-flex items-center gap-1 rounded-full bg-destructive/15 px-2.5 py-1 font-bold hover:bg-destructive/25"
                            >
                              <RotateCcw className="h-3 w-3" /> Coba lagi
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )
              )
            )}
          </div>

          {/* Composer */}
          <form
            onSubmit={(e) => {
              e.preventDefault()
              submit()
            }}
            className="shrink-0 border-t border-hairline/10 px-3 pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] md:pb-3"
          >
            <div className="lg-rim flex items-end gap-2 rounded-[24px] bg-card/80 p-1.5 pl-4 focus-within:ring-2 focus-within:ring-primary/30 transition">
              <textarea
                ref={inputRef}
                rows={1}
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing && isDesktop) {
                    e.preventDefault()
                    submit()
                  }
                }}
                enterKeyHint="send"
                placeholder="Tanya atau minta sesuatu…"
                className="flex-1 resize-none bg-transparent py-2 text-sm text-foreground placeholder:text-muted-foreground/70 outline-none max-h-[140px]"
              />
              {busy ? (
                <button
                  type="button"
                  onClick={stop}
                  className="lg-ink h-10 w-10 shrink-0 rounded-full flex items-center justify-center"
                  aria-label="Hentikan"
                >
                  <Square className="h-3.5 w-3.5 fill-current" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={!draft.trim()}
                  className="lg-ink h-10 w-10 shrink-0 rounded-full flex items-center justify-center disabled:opacity-30"
                  aria-label="Kirim"
                >
                  <ArrowUp className="h-[18px] w-[18px]" />
                </button>
              )}
            </div>
            <p className="mt-2 text-center text-[11px] text-muted-foreground/70">
              AI bisa keliru. Periksa lagi tugas yang dibuat.
            </p>
          </form>
        </motion.section>
      )}
    </AnimatePresence>
  )
}
