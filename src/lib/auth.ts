const TOKEN_KEY = 'pms:token'
const USER_KEY = 'pms:user'

export interface StoredUser {
  id: number
  name: string
  email: string
  role: { id: number; name: string; label: string } | null
  permissions: string[]
}

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

export function setSession(token: string, user: StoredUser) {
  localStorage.setItem(TOKEN_KEY, token)
  localStorage.setItem(USER_KEY, JSON.stringify(user))
}

/** Refreshes the cached user without touching the token — used after /auth/me. */
export function updateStoredUser(user: StoredUser) {
  localStorage.setItem(USER_KEY, JSON.stringify(user))
}

export function clearSession() {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
}

export function getStoredUser(): StoredUser | null {
  const raw = localStorage.getItem(USER_KEY)
  return raw ? (JSON.parse(raw) as StoredUser) : null
}

export function hasPermission(user: StoredUser | null, permission: string): boolean {
  return !!user && (user.role?.name === 'super_admin' || user.permissions.includes(permission))
}
