// src/hooks/useTenants.ts
import { api } from '../lib/api'
import { useApiResource } from './useApiResource'
import type { Paginated, Tenant } from '../types'

export function useTenants(params: { search?: string; per_page?: number; page?: number; status?: string } = {}) {
  return useApiResource<Paginated<Tenant>>(
    () =>
      api.get<Paginated<Tenant>>('/tenants', {
        per_page: params.per_page ?? 5,
        page: params.page,
        search: params.search,
        status: params.status,
      }),
    [params.search, params.per_page, params.page, params.status],
  )
}

/** Unpaginated-ish fetch for <select> pickers. */
export function useAllTenants() {
  return useApiResource<Paginated<Tenant>>(
    () => api.get<Paginated<Tenant>>('/tenants', { per_page: 100 }),
    [],
  )
}

export function useTenantDetail(id: number) {
  return useApiResource<Tenant>(
    () => api.get<{ data: Tenant }>(`/tenants/${id}`).then((r) => r.data),
    [id],
  )
}
