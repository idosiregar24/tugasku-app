import { useState, useEffect } from 'react'

/**
 * Hook untuk mengelola tema dark/light
 * Preferensi disimpan di localStorage dan diterapkan ke <html> element
 */
export function useTheme() {
  // Default is the day (light) scene; dark is opt-in via the toggle
  const [theme, setTheme] = useState(() => localStorage.getItem('tugasku-theme') || 'light')

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
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute('content', theme === 'light' ? '#f6f9fc' : '#070b1c')

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
