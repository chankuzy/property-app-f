import { useCallback, useSyncExternalStore } from 'react'

/**
 * Minimal path-based router — no dependency. Single module-level source of
 * truth (not per-component state) so that when one component calls
 * navigate(), every component reading useRoute() re-renders in sync.
 * pushState() alone does NOT fire 'popstate' — that only fires on browser
 * back/forward — so we notify subscribers manually on navigate().
 */
let currentPath = window.location.pathname
const listeners = new Set<() => void>()

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

function getSnapshot() {
  return currentPath
}

function setPath(path: string) {
  currentPath = path
  listeners.forEach((l) => l())
}

window.addEventListener('popstate', () => setPath(window.location.pathname))

export function useRoute() {
  const path = useSyncExternalStore(subscribe, getSnapshot)

  const navigate = useCallback((to: string) => {
    if (to === window.location.pathname) return
    window.history.pushState({}, '', to)
    setPath(to)
  }, [])

  return { path, navigate }
}

/**
 * Matches a "/tenants/:id" style pattern against a real path and returns the
 * captured params, or null if it doesn't match. No wildcards, no optional
 * segments — just enough for flat "/resource/:id" detail routes.
 */
export function matchPath(pattern: string, path: string): Record<string, string> | null {
  const patternParts = pattern.split('/').filter(Boolean)
  const pathParts = path.split('/').filter(Boolean)
  if (patternParts.length !== pathParts.length) return null

  const params: Record<string, string> = {}
  for (let i = 0; i < patternParts.length; i++) {
    const patternPart = patternParts[i]
    const pathPart = pathParts[i]
    if (patternPart.startsWith(':')) {
      params[patternPart.slice(1)] = decodeURIComponent(pathPart)
    } else if (patternPart !== pathPart) {
      return null
    }
  }
  return params
}
