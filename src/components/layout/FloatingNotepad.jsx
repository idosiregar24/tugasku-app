import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { FileText, Save, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { motion, AnimatePresence } from 'framer-motion'

export function FloatingNotepad() {
  const [open, setOpen] = useState(false)
  const [note, setNote] = useState('')
  const [saved, setSaved] = useState(false)
  const [showTooltip, setShowTooltip] = useState(true)

  useEffect(() => {
    const savedNote = localStorage.getItem('tugasku-quick-note')
    if (savedNote) setNote(savedNote)
  }, [])

  const handleSave = () => {
    localStorage.setItem('tugasku-quick-note', note)
    setSaved(true)
    // Langsung tutup modal sesuai permintaan
    setOpen(false)
    setTimeout(() => setSaved(false), 2000)
  }

  // Auto save when modal is closed
  useEffect(() => {
    if (!open) {
      localStorage.setItem('tugasku-quick-note', note)
    }
  }, [open, note])

  // Hide tooltip on outside click or after 15 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowTooltip(false)
    }, 15000) // 15 detik otomatis tertutup

    const handleGlobalClick = () => {
      setShowTooltip(false)
    }

    // Hanya tambahkan listener jika tooltip sedang tampil
    if (showTooltip) {
      window.addEventListener('click', handleGlobalClick)
    }

    return () => {
      clearTimeout(timer)
      window.removeEventListener('click', handleGlobalClick)
    }
  }, [showTooltip])

  return (
    <>
      <div className="fixed bottom-8 right-8 z-50 flex items-center justify-end">
        <AnimatePresence>
          {showTooltip && (
            <motion.div
              initial={{ opacity: 0, x: 20, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8, x: 10 }}
              className="absolute right-full mr-4 whitespace-nowrap bg-card/90 backdrop-blur-md border border-white/10 text-foreground text-xs font-bold px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-2 pointer-events-none"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              Psst.. Ada notepad di sini!
              <div className="absolute top-1/2 -right-1.5 -translate-y-1/2 border-4 border-transparent border-l-white/10" />
            </motion.div>
          )}
        </AnimatePresence>

        <button
          onClick={(e) => {
            e.stopPropagation() // Mencegah global click menutup tooltip jika belum ingin, tapi di sini kita tutup manual
            setOpen(true)
            setShowTooltip(false)
          }}
          className="p-4 bg-primary text-primary-foreground rounded-full shadow-[0_8px_30px_rgba(var(--primary-rgb),0.4)] hover:scale-110 hover:shadow-[0_8px_40px_rgba(var(--primary-rgb),0.6)] transition-all duration-300 group flex items-center justify-center border-2 border-white/20 relative"
          title="Quick Notepad"
        >
          <FileText className="w-6 h-6 group-hover:rotate-12 transition-transform" />
        </button>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md bg-card/95 backdrop-blur-3xl border-primary/20 rounded-[32px] shadow-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl font-black uppercase tracking-tight">
              <div className="p-2 rounded-xl bg-primary/20 text-primary">
                <FileText className="w-5 h-5" />
              </div>
              Quick Note
            </DialogTitle>
          </DialogHeader>
          <div className="mt-4 flex flex-col gap-4">
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Tulis pengingat, detail kecil, atau ide dadakan di sini..."
              className="min-h-[250px] w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm font-medium text-foreground outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all resize-none placeholder:text-muted-foreground/50"
              spellCheck="false"
            />
            <div className="flex justify-end">
              <Button 
                onClick={handleSave}
                className="rounded-xl px-6 h-11 font-bold bg-primary hover:bg-primary/90 text-white shadow-lg flex items-center gap-2"
              >
                {saved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                {saved ? 'Tersimpan' : 'Simpan'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
