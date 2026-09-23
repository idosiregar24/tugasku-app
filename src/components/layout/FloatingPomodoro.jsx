import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Timer, Play, Pause, RotateCcw, Coffee, Brain, Volume2, VolumeX, X, Settings, ChevronLeft, Music } from 'lucide-react'
import { cn } from '@/lib/utils'

const SOUNDS = [
  { id: 'rain', label: 'Rintik Hujan', url: 'https://actions.google.com/sounds/v1/water/rain_on_roof.ogg' },
  { id: 'ocean', label: 'Ombak Pantai', url: 'https://actions.google.com/sounds/v1/water/ocean_waves_rhythmic.ogg' },
  { id: 'cafe', label: 'Suasana Kafe', url: 'https://actions.google.com/sounds/v1/crowds/restaurant_ambient.ogg' },
  { id: 'forest', label: 'Malam di Hutan', url: 'https://actions.google.com/sounds/v1/nature/jungle_night_with_insects.ogg' }
]

const formatTime = (seconds) => {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
}

/**
 * Focus timer panel. The countdown is anchored to an end timestamp so it stays
 * correct after iOS suspends the page in the background.
 * @param {{ open: boolean, onOpenChange: (open: boolean) => void, onRunningChange?: (running: boolean) => void }} props
 */
export function FloatingPomodoro({ open, onOpenChange, onRunningChange }) {
  const [showSettings, setShowSettings] = useState(false)
  const [durations, setDurations] = useState({ work: 25, break: 5 })
  const [selectedSound, setSelectedSound] = useState(SOUNDS[0])
  const [mode, setMode] = useState('work')
  const [remaining, setRemaining] = useState(25 * 60)
  const [endAt, setEndAt] = useState(null)
  const [now, setNow] = useState(() => Date.now())
  const [isMuted, setIsMuted] = useState(true)

  const audioRef = useRef(null)
  const audioCtxRef = useRef(null)

  const isRunning = endAt !== null
  const timeLeft = isRunning ? Math.max(0, Math.ceil((endAt - now) / 1000)) : remaining
  const totalSec = durations[mode] * 60

  useEffect(() => {
    onRunningChange?.(isRunning)
  }, [isRunning, onRunningChange])

  useEffect(() => {
    if (endAt === null) return
    const tick = () => {
      const t = Date.now()
      if (t < endAt) {
        setNow(t)
        return
      }
      const next = mode === 'work' ? 'break' : 'work'
      setEndAt(null)
      setMode(next)
      setRemaining(durations[next] * 60)
      audioRef.current?.pause()
      playChime(audioCtxRef.current)
      navigator.vibrate?.([200, 100, 200])
    }
    const id = setInterval(tick, 250)
    return () => clearInterval(id)
  }, [endAt, mode, durations])

  // iOS only allows audio that starts inside a tap handler, so these run synchronously there
  const syncAmbient = (shouldPlay) => {
    const el = audioRef.current
    if (!el) return
    if (shouldPlay) el.play().catch(() => setIsMuted(true))
    else el.pause()
  }

  const unlockChime = () => {
    const Ctx = window.AudioContext || window.webkitAudioContext
    if (!Ctx) return
    if (!audioCtxRef.current) audioCtxRef.current = new Ctx()
    audioCtxRef.current.resume?.()
  }

  const toggleTimer = () => {
    if (isRunning) {
      setRemaining(timeLeft)
      setEndAt(null)
      syncAmbient(false)
    } else {
      unlockChime()
      const t = Date.now()
      setNow(t)
      setEndAt(t + remaining * 1000)
      syncAmbient(!isMuted)
    }
  }

  const resetTimer = () => {
    setEndAt(null)
    setRemaining(durations[mode] * 60)
    syncAmbient(false)
  }

  const switchMode = (newMode) => {
    setMode(newMode)
    setEndAt(null)
    setRemaining(durations[newMode] * 60)
    syncAmbient(false)
  }

  const toggleMute = () => {
    const nextMuted = !isMuted
    setIsMuted(nextMuted)
    syncAmbient(isRunning && !nextMuted)
  }

  const changeDuration = (key, value, max) => {
    const minutes = Math.min(max, Math.max(1, parseInt(value) || 1))
    setDurations((d) => ({ ...d, [key]: minutes }))
    if (mode === key && !isRunning) setRemaining(minutes * 60)
  }

  const changeSound = (id) => {
    const sound = SOUNDS.find((s) => s.id === id)
    if (!sound) return
    setSelectedSound(sound)
    if (audioRef.current) {
      audioRef.current.src = sound.url
      syncAmbient(isRunning && !isMuted)
    }
  }

  const progress = ((totalSec - timeLeft) / totalSec) * 100
  const radius = 45
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (progress / 100) * circumference

  return (
    <>
      <audio ref={audioRef} src={selectedSound.url} loop preload="none" />

      {/* Mobile: compact running indicator above the bottom nav */}
      <div className="md:hidden fixed inset-x-0 bottom-nav-offset z-[60] flex justify-center pointer-events-none">
        <AnimatePresence>
          {!open && isRunning && (
            <motion.button
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 12 }}
              onClick={() => onOpenChange(true)}
              className={cn(
                'pointer-events-auto flex items-center gap-2 rounded-full px-4 h-10 text-sm font-semibold tabular-nums',
                mode === 'work' ? 'lg-ink' : 'lg-ink !bg-emerald-600 !text-white'
              )}
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
              </span>
              {mode === 'work' ? 'Fokus' : 'Rehat'} · {formatTime(timeLeft)}
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.96 }}
            transition={{ type: 'spring', stiffness: 380, damping: 32 }}
            className="fixed z-[70] inset-x-3 bottom-nav-offset md:inset-x-auto md:right-24 md:bottom-6 md:w-80 surface rounded-[28px] overflow-hidden"
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-hairline/10">
              <div className="flex items-center gap-2">
                {showSettings ? (
                  <button onClick={() => setShowSettings(false)} className="p-1 -ml-1 text-muted-foreground hover:text-foreground transition-colors" aria-label="Kembali">
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                ) : (
                  <Timer className="h-4 w-4 text-primary" />
                )}
                <span className="text-sm font-bold tracking-tight">
                  {showSettings ? 'Pengaturan Timer' : 'Focus Timer'}
                </span>
              </div>
              <div className="flex items-center gap-1">
                {!showSettings && (
                  <button onClick={() => setShowSettings(true)} className="p-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-hairline/10 transition-colors" aria-label="Pengaturan">
                    <Settings className="h-4 w-4" />
                  </button>
                )}
                <button onClick={() => onOpenChange(false)} className="p-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-hairline/10 transition-colors" aria-label="Tutup timer">
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {showSettings ? (
              <div className="p-5 flex flex-col gap-5 animate-fade-in">
                <label className="space-y-2">
                  <span className="text-xs font-semibold text-muted-foreground flex items-center gap-2">
                    <Brain className="h-3.5 w-3.5 text-primary" /> Durasi Fokus (menit)
                  </span>
                  <input
                    type="number"
                    inputMode="numeric"
                    min="1" max="120"
                    value={durations.work}
                    onChange={(e) => changeDuration('work', e.target.value, 120)}
                    className="w-full bg-secondary/60 border border-border rounded-xl px-4 py-2.5 text-sm font-semibold text-foreground outline-none focus:border-primary/50"
                  />
                </label>

                <label className="space-y-2">
                  <span className="text-xs font-semibold text-muted-foreground flex items-center gap-2">
                    <Coffee className="h-3.5 w-3.5 text-emerald-500" /> Durasi Rehat (menit)
                  </span>
                  <input
                    type="number"
                    inputMode="numeric"
                    min="1" max="60"
                    value={durations.break}
                    onChange={(e) => changeDuration('break', e.target.value, 60)}
                    className="w-full bg-secondary/60 border border-border rounded-xl px-4 py-2.5 text-sm font-semibold text-foreground outline-none focus:border-emerald-500/50"
                  />
                </label>

                <label className="space-y-2">
                  <span className="text-xs font-semibold text-muted-foreground flex items-center gap-2">
                    <Music className="h-3.5 w-3.5 text-blue-400" /> Suara Latar
                  </span>
                  <select
                    value={selectedSound.id}
                    onChange={(e) => changeSound(e.target.value)}
                    className="w-full bg-secondary/60 border border-border rounded-xl px-4 py-2.5 text-sm font-semibold text-foreground outline-none focus:border-blue-500/50"
                  >
                    {SOUNDS.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
                  </select>
                </label>
              </div>
            ) : (
              <div className="p-5 flex flex-col items-center animate-fade-in">
                <div className="flex items-center gap-1 bg-card/70 p-1 rounded-full mb-5 border border-hairline/10">
                  <button
                    onClick={() => switchMode('work')}
                    className={cn(
                      "flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold transition-all",
                      mode === 'work' ? "lg-ink" : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <Brain className="h-3.5 w-3.5" /> Fokus
                  </button>
                  <button
                    onClick={() => switchMode('break')}
                    className={cn(
                      "flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold transition-all",
                      mode === 'break' ? "bg-emerald-600 text-white shadow-md" : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <Coffee className="h-3.5 w-3.5" /> Rehat
                  </button>
                </div>

                <div className="relative w-36 h-36 flex items-center justify-center mb-5">
                  <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 128 128">
                    <circle cx="64" cy="64" r={radius} className="stroke-hairline/10" strokeWidth="8" fill="none" />
                    <circle
                      cx="64"
                      cy="64"
                      r={radius}
                      className={cn("transition-[stroke-dashoffset] duration-300 ease-linear", mode === 'work' ? "stroke-primary" : "stroke-emerald-500")}
                      strokeWidth="8"
                      fill="none"
                      strokeDasharray={circumference}
                      strokeDashoffset={strokeDashoffset}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="text-center">
                    <div className="text-3xl font-black tabular-nums tracking-tighter">{formatTime(timeLeft)}</div>
                    <div className="text-[11px] font-semibold text-muted-foreground mt-0.5">{mode === 'work' ? 'Waktu fokus' : 'Waktu rehat'}</div>
                  </div>
                </div>

                <div className="flex items-center gap-4 w-full justify-center">
                  <button
                    onClick={toggleMute}
                    title="Suara latar"
                    aria-label={isMuted ? 'Nyalakan suara latar' : 'Matikan suara latar'}
                    className={cn(
                      "h-11 w-11 flex items-center justify-center rounded-2xl transition-all border",
                      !isMuted ? "bg-blue-500/10 text-blue-400 border-blue-500/20" : "bg-secondary text-muted-foreground border-border hover:bg-secondary/80"
                    )}
                  >
                    {!isMuted ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                  </button>

                  <button
                    onClick={toggleTimer}
                    aria-label={isRunning ? 'Jeda' : 'Mulai'}
                    className={cn(
                      "lg-ink h-16 w-16 flex items-center justify-center rounded-full",
                      mode === 'break' && "!bg-emerald-600 !text-white"
                    )}
                  >
                    {isRunning ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6 ml-1" />}
                  </button>

                  <button
                    onClick={resetTimer}
                    aria-label="Ulangi"
                    className="h-11 w-11 flex items-center justify-center rounded-2xl bg-secondary text-muted-foreground border border-border hover:bg-secondary/80 transition-all"
                  >
                    <RotateCcw className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}

            {isRunning && mode === 'work' && !showSettings && (
              <div className="bg-primary/10 border-t border-primary/20 py-2 text-center">
                <p className="text-[11px] font-bold text-primary tracking-wide animate-pulse">Mode fokus aktif</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

function playChime(ctx) {
  if (!ctx) return
  ;[0, 0.28].forEach((offset, i) => {
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    const start = ctx.currentTime + offset
    osc.frequency.value = i === 0 ? 880 : 1174.66
    gain.gain.setValueAtTime(0.0001, start)
    gain.gain.exponentialRampToValueAtTime(0.3, start + 0.02)
    gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.45)
    osc.connect(gain).connect(ctx.destination)
    osc.start(start)
    osc.stop(start + 0.5)
  })
}
