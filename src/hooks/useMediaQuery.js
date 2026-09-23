import { useSyncExternalStore } from 'react'

/**
 * Subscribe to a CSS media query, e.g. useMediaQuery('(min-width: 1024px)')
 * @param {string} query
 */
export function useMediaQuery(query) {
  return useSyncExternalStore(
    (onChange) => {
      const mql = window.matchMedia(query)
      mql.addEventListener('change', onChange)
      return () => mql.removeEventListener('change', onChange)
    },
    () => window.matchMedia(query).matches,
    () => false
  )
}
