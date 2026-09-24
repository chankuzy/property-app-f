import { api } from '../lib/api'
import { useApiResource } from './useApiResource'
import type { DashboardSummary } from '../types'

export function useDashboard() {
  return useApiResource<DashboardSummary>(
    () => api.get<{ data: DashboardSummary }>('/dashboard').then((r) => r.data),
    [],
  )
}
