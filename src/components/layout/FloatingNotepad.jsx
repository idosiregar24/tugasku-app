import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { FileText, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'

const STORAGE_KEY = 'tugasku-quick-note'

function readNote() {
  try {
    return localStorage.getItem(STORAGE_KEY) || ''
  } catch {
    return ''
  }
}

/**
 * Quick scratchpad. Saves on every keystroke so nothing is lost if iOS
 * kills the home-screen app in the background.
 * @param {{ open: boolean, onOpenChange: (open: boolean) => void }} props
 */
export function FloatingNotepad({ open, onOpenChange }) {
  const [note, setNote] = useState(readNote)

  const handleChange = (value) => {
    setNote(value)
    try {
      localStorage.setItem(STORAGE_KEY, value)
    } catch {
      // storage full or blocked; the note still lives in memory for this session
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-card/95 backdrop-blur-3xl border-primary/20 rounded-t-[28px] sm:rounded-[28px] shadow-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg font-black tracking-tight">
            <div className="p-2 rounded-xl bg-primary/15 text-primary">
              <FileText className="w-5 h-5" />
            </div>
            Catatan Cepat
          </DialogTitle>
          <DialogDescription>Tersimpan otomatis di perangkat ini.</DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <textarea
            value={note}
            onChange={(e) => handleChange(e.target.value)}
            placeholder="Tulis pengingat, detail kecil, atau ide dadakan di sini..."
            className="min-h-[240px] w-full bg-hairline/5 border border-hairline/10 rounded-2xl p-4 text-sm font-medium text-foreground outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all resize-none placeholder:text-muted-foreground/60"
            spellCheck="false"
          />
          <div className="flex justify-end">
            <Button
              onClick={() => onOpenChange(false)}
              className="rounded-xl px-6 h-11 font-bold flex items-center gap-2"
            >
              <Check className="w-4 h-4" />
              Selesai
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
