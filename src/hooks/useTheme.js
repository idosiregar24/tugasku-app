import { useState, useEffect } from 'react'

/**
 * Hook untuk mengelola tema dark/light
 * Preferensi disimpan di localStorage dan diterapkan ke <html> element
 */
export function useTheme() {
  const [theme, setTheme] = useState(() => {
    // Ambil dari localStorage atau deteksi preferensi OS
    const stored = localStorage.getItem('tugasku-theme')
    if (stored) return stored
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  })

  useEffect(() => {
    const root = document.documentElement

    // Disable transition sebentar agar tidak flash saat pertama load
    root.classList.add('no-transition')

    if (theme === 'light') {
      root.classList.add('light')
    } else {
      root.classList.remove('light')
    }

    localStorage.setItem('tugasku-theme', theme)

    // Re-enable transisi setelah satu frame
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        root.classList.remove('no-transition')
      })
    })
  }, [theme])

  const toggleTheme = () => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))
  const isDark  = theme === 'dark'
  const isLight = theme === 'light'

  return { theme, isDark, isLight, toggleTheme, setTheme }
}
