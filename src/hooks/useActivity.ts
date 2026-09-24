import { api } from '../lib/api'
import { useApiResource } from './useApiResource'
import type { ActivityLogEntry, NotificationLogEntry, Paginated } from '../types'

export function useRecentActivity() {
  return useApiResource<ActivityLogEntry[]>(
    () => api.get<Paginated<ActivityLogEntry>>('/activity-logs', { per_page: 8 }).then((r) => r.data),
    [],
  )
}

export function useRecentTenantReminders() {
  return useApiResource<NotificationLogEntry[]>(
    () =>
      api
        .get<Paginated<NotificationLogEntry>>('/notification-logs', { per_page: 8, audience: 'tenant' })
        .then((r) => r.data),
    [],
  )
}
