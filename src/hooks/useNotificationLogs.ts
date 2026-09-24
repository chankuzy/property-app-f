// src/hooks/useNotificationLogs.ts
import { api } from '../lib/api'
import { useApiResource } from './useApiResource'
import type { NotificationLogEntry, Paginated } from '../types'

export function useNotificationLogs(
  params: { audience?: 'staff' | 'tenant'; per_page?: number; page?: number } = {},
) {
  return useApiResource<Paginated<NotificationLogEntry>>(
    () =>
      api.get<Paginated<NotificationLogEntry>>('/notification-logs', {
        per_page: params.per_page ?? 15,
        page: params.page,
        audience: params.audience,
      }),
    [params.audience, params.per_page, params.page],
  )
}

export function sendTenantReminder(payload: { tenant_id: number; rent_charge_id?: number; message?: string }) {
  return api.post('/tenant-reminders', payload)
}
