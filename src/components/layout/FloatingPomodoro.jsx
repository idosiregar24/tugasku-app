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

export function FloatingPomodoro() {
  const [isOpen, setIsOpen] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  
  const [workMinutes, setWorkMinutes] = useState(25)
  const [breakMinutes, setBreakMinutes] = useState(5)
  const [selectedSound, setSelectedSound] = useState(SOUNDS[0])

  const workTimeSec = workMinutes * 60
  const breakTimeSec = breakMinutes * 60

  const [mode, setMode] = useState('work') // 'work' | 'break'
  const [timeLeft, setTimeLeft] = useState(workTimeSec)
  const [isRunning, setIsRunning] = useState(false)
  const [isMuted, setIsMuted] = useState(true)
  
  const audioRef = useRef(null)

  // Timer Logic
  useEffect(() => {
    let interval = null
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1)
      }, 1000)
    } else if (timeLeft === 0) {
      // Auto switch mode when timer ends
      if (mode === 'work') {
        setMode('break')
        setTimeLeft(breakTimeSec)
      } else {
        setMode('work')
        setTimeLeft(workTimeSec)
      }
      setIsRunning(false)
      // Play a ding sound here if possible
    }
    return () => clearInterval(interval)
  }, [isRunning, timeLeft, mode])

  // Ambient Sound Logic
  useEffect(() => {
    if (audioRef.current) {
      if (isRunning && !isMuted) {
        audioRef.current.play().catch(() => setIsMuted(true)) // Handle autoplay policy
      } else {
        audioRef.current.pause()
      }
    }
  }, [isRunning, isMuted])

  const toggleTimer = () => setIsRunning(!isRunning)
  
  const resetTimer = () => {
    setIsRunning(false)
    setTimeLeft(mode === 'work' ? workTimeSec : breakTimeSec)
  }

  const switchMode = (newMode) => {
    setMode(newMode)
    setIsRunning(false)
    setTimeLeft(newMode === 'work' ? workTimeSec : breakTimeSec)
  }

  const toggleMute = () => setIsMuted(!isMuted)

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }

  const progress = mode === 'work' 
    ? ((workTimeSec - timeLeft) / workTimeSec) * 100 
    : ((breakTimeSec - timeLeft) / breakTimeSec) * 100

  // Calculate SVG Circle Dasharray
  const radius = 45
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (progress / 100) * circumference

  return (
    <>
      <audio ref={audioRef} src={selectedSound.url} loop />

      {/* Floating Button (Bottom Left) */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-[104px] right-8 z-[100] p-4 bg-primary text-primary-foreground rounded-full shadow-[0_8px_30px_rgba(var(--primary-rgb),0.4)] hover:scale-110 hover:shadow-[0_8px_40px_rgba(var(--primary-rgb),0.6)] transition-all duration-300 group flex items-center justify-center border-2 border-white/20"
            title="Focus Timer"
          >
            <Timer className="w-6 h-6 group-hover:-rotate-12 transition-transform" />
            {isRunning && (
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
              </span>
            )}
          </motion.button>
        )}
      </AnimatePresence>

      {/* Pomodoro Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            className="fixed bottom-[104px] right-[104px] z-[100] w-72 bg-card/90 backdrop-blur-2xl border border-white/10 shadow-[0_30px_60px_rgba(0,0,0,0.4)] rounded-[32px] overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-border/50">
              <div className="flex items-center gap-2">
                {showSettings ? (
                  <button onClick={() => setShowSettings(false)} className="p-1 -ml-1 text-muted-foreground hover:text-foreground transition-colors">
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                ) : (
                  <Timer className="h-4 w-4 text-primary" />
                )}
                <span className="text-sm font-black tracking-widest uppercase">
                  {showSettings ? 'Pengaturan' : 'Focus Timer'}
                </span>
              </div>
              <div className="flex items-center gap-1">
                {!showSettings && (
                  <button onClick={() => setShowSettings(true)} className="p-1 text-muted-foreground hover:text-foreground transition-colors mr-1">
                    <Settings className="h-4 w-4" />
                  </button>
                )}
                <button onClick={() => setIsOpen(false)} className="p-1 text-muted-foreground hover:text-foreground transition-colors">
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {showSettings ? (
              <div className="p-6 flex flex-col gap-6 animate-fade-in">
                <div className="space-y-3">
                  <label className="text-xs font-bold text-muted-foreground flex items-center gap-2">
                    <Brain className="h-3.5 w-3.5 text-primary" /> Durasi Fokus (Menit)
                  </label>
                  <input 
                    type="number" 
                    min="1" max="120"
                    value={workMinutes}
                    onChange={(e) => {
                      const val = parseInt(e.target.value) || 1
                      setWorkMinutes(val)
                      if (mode === 'work') setTimeLeft(val * 60)
                    }}
                    className="w-full bg-secondary/50 border border-border rounded-xl px-4 py-2 text-sm font-bold text-foreground outline-none focus:border-primary/50"
                  />
                </div>

                <div className="space-y-3">
                  <label className="text-xs font-bold text-muted-foreground flex items-center gap-2">
                    <Coffee className="h-3.5 w-3.5 text-emerald-500" /> Durasi Rehat (Menit)
                  </label>
                  <input 
                    type="number" 
                    min="1" max="60"
                    value={breakMinutes}
                    onChange={(e) => {
                      const val = parseInt(e.target.value) || 1
                      setBreakMinutes(val)
                      if (mode === 'break') setTimeLeft(val * 60)
                    }}
                    className="w-full bg-secondary/50 border border-border rounded-xl px-4 py-2 text-sm font-bold text-foreground outline-none focus:border-emerald-500/50"
                  />
                </div>

                <div className="space-y-3">
                  <label className="text-xs font-bold text-muted-foreground flex items-center gap-2">
                    <Music className="h-3.5 w-3.5 text-blue-400" /> Suara Latar
                  </label>
                  <select 
                    value={selectedSound.id}
                    onChange={(e) => {
                      const sound = SOUNDS.find(s => s.id === e.target.value)
                      if (sound) setSelectedSound(sound)
                    }}
                    className="w-full bg-secondary/50 border border-border rounded-xl px-4 py-2 text-sm font-bold text-foreground outline-none focus:border-blue-500/50"
                  >
                    {SOUNDS.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
                  </select>
                </div>
              </div>
            ) : (
              <div className="p-6 flex flex-col items-center animate-fade-in">
              {/* Mode Switcher */}
              <div className="flex items-center gap-1 bg-secondary/50 p-1 rounded-full mb-6 border border-border/50">
                <button
                  onClick={() => switchMode('work')}
                  className={cn(
                    "flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold transition-all",
                    mode === 'work' ? "bg-primary text-white shadow-md" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <Brain className="h-3.5 w-3.5" /> Fokus
                </button>
                <button
                  onClick={() => switchMode('break')}
                  className={cn(
                    "flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold transition-all",
                    mode === 'break' ? "bg-emerald-500 text-white shadow-md" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <Coffee className="h-3.5 w-3.5" /> Rehat
                </button>
              </div>

              {/* Circular Timer Display */}
              <div className="relative w-32 h-32 flex items-center justify-center mb-6">
                <svg className="absolute inset-0 w-full h-full transform -rotate-90">
                  {/* Background Circle */}
                  <circle
                    cx="64"
                    cy="64"
                    r={radius}
                    className="stroke-muted/20"
                    strokeWidth="8"
                    fill="none"
                  />
                  {/* Progress Circle */}
                  <circle
                    cx="64"
                    cy="64"
                    r={radius}
                    className={cn(
                      "transition-all duration-1000 ease-linear",
                      mode === 'work' ? "stroke-primary" : "stroke-emerald-500"
                    )}
                    strokeWidth="8"
                    fill="none"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="text-3xl font-black tabular-nums tracking-tighter">
                  {formatTime(timeLeft)}
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center gap-4 w-full justify-center">
                <button
                  onClick={toggleMute}
                  title="Toggle Ambient Noise (Rain)"
                  className={cn(
                    "h-10 w-10 flex items-center justify-center rounded-2xl transition-all border",
                    !isMuted ? "bg-blue-500/10 text-blue-400 border-blue-500/20" : "bg-secondary text-muted-foreground border-border hover:bg-secondary/80"
                  )}
                >
                  {!isMuted ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                </button>

                <button
                  onClick={toggleTimer}
                  className={cn(
                    "h-14 w-14 flex items-center justify-center rounded-full text-white shadow-lg transition-transform hover:scale-105 active:scale-95",
                    mode === 'work' ? "bg-primary shadow-primary/30" : "bg-emerald-500 shadow-emerald-500/30"
                  )}
                >
                  {isRunning ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6 ml-1" />}
                </button>

                <button
                  onClick={resetTimer}
                  className="h-10 w-10 flex items-center justify-center rounded-2xl bg-secondary text-muted-foreground border border-border hover:bg-secondary/80 transition-all"
                >
                  <RotateCcw className="h-4 w-4" />
                </button>
              </div>
            </div>
            
            )}
            
            {/* Status Footer */}
            {isRunning && mode === 'work' && !showSettings && (
              <div className="bg-primary/10 border-t border-primary/20 py-2 text-center">
                <p className="text-[10px] font-bold text-primary uppercase tracking-widest animate-pulse">Do Not Disturb Active</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
