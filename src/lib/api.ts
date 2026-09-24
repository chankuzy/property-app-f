import { getToken, clearSession } from './auth'

const BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? "http://10.236.192.108:8000/api/v1";

export class ApiError extends Error {
  status: number
  code?: string
  errors?: Record<string, string[]>

  constructor(message: string, status: number, code?: string, errors?: Record<string, string[]>) {
    super(message)
    this.status = status
    this.code = code
    this.errors = errors
  }
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  body?: unknown
  query?: Record<string, string | number | boolean | undefined>
}

/**
 * Thin fetch wrapper for the property-management-system API: attaches the bearer
 * token, builds query strings, and normalises the { message, code, errors } error
 * envelope the backend always returns. A 401 clears the session so the app falls
 * back to the login screen on the next render.
 */
export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const url = new URL(BASE_URL.replace(/\/$/, '') + path)
  if (options.query) {
    for (const [key, value] of Object.entries(options.query)) {
      if (value !== undefined && value !== '') url.searchParams.set(key, String(value))
    }
  }

  const token = getToken()
  const res = await fetch(url.toString(), {
    method: options.method ?? 'GET',
    headers: {
      Accept: 'application/json',
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  })

  if (res.status === 204) return undefined as T

  const data = await res.json().catch(() => ({}))

  if (!res.ok) {
    if (res.status === 401) clearSession()
    throw new ApiError(data.message ?? 'Something went wrong.', res.status, data.code, data.errors)
  }

  return data as T
}

/**
 * Streams a file response (e.g. ?format=csv reports) using the same auth
 * header as apiRequest, then triggers a browser download. Fetch's normal
 * <a href> download can't attach an Authorization header, so this goes
 * through fetch + blob instead.
 */
export async function apiDownload(path: string, filename: string, query?: RequestOptions['query']): Promise<void> {
  const url = new URL(BASE_URL.replace(/\/$/, '') + path)
  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined && value !== '') url.searchParams.set(key, String(value))
    }
  }

  const token = getToken()
  const res = await fetch(url.toString(), {
    headers: {
      Accept: 'text/csv, application/octet-stream, */*',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  })

  if (!res.ok) {
    if (res.status === 401) clearSession()
    const data = await res.json().catch(() => ({}))
    throw new ApiError(data.message ?? 'Could not download the file.', res.status, data.code, data.errors)
  }

  const blob = await res.blob()
  const objectUrl = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = objectUrl
  link.download = filename
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(objectUrl)
}

export const api = {
  get: <T>(path: string, query?: RequestOptions['query']) => apiRequest<T>(path, { query }),
  post: <T>(path: string, body?: unknown) => apiRequest<T>(path, { method: 'POST', body }),
  put: <T>(path: string, body?: unknown) => apiRequest<T>(path, { method: 'PUT', body }),
  del: <T>(path: string) => apiRequest<T>(path, { method: 'DELETE' }),
}
