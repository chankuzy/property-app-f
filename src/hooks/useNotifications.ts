// src/hooks/useNotifications.ts
import { api } from '../lib/api'
import { useApiResource } from './useApiResource'
import type { NotificationItem, Paginated } from '../types'

export function useNotifications(params: { per_page?: number; page?: number } = {}) {
  return useApiResource<Paginated<NotificationItem>>(
    () => api.get<Paginated<NotificationItem>>('/notifications', { per_page: params.per_page ?? 15, page: params.page }),
    [params.per_page, params.page],
  )
}

export function markNotificationRead(id: string) {
  return api.post(`/notifications/${id}/read`)
}

export function markAllNotificationsRead() {
  return api.post('/notifications/read-all')
}
