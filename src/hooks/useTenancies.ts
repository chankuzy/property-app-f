// src/hooks/useTenancies.ts
import { api } from '../lib/api'
import { useApiResource } from './useApiResource'
import type { Paginated, TenancySummary } from '../types'

export function useTenancies(
  params: {
    tenant_id?: number
    unit_id?: number
    property_id?: number
    lifecycle?: string
    status?: string
    per_page?: number
    page?: number
  } = {},
) {
  return useApiResource<Paginated<TenancySummary>>(
    () =>
      api.get<Paginated<TenancySummary>>('/tenancies', {
        per_page: params.per_page ?? 10,
        page: params.page,
        tenant_id: params.tenant_id,
        unit_id: params.unit_id,
        property_id: params.property_id,
        lifecycle: params.lifecycle,
        status: params.status,
      }),
    [params.tenant_id, params.unit_id, params.property_id, params.lifecycle, params.status, params.per_page, params.page],
  )
}

export function useTenancy(id: number | undefined) {
  return useApiResource<TenancySummary | null>(
    () => (id ? api.get<{ data: TenancySummary }>(`/tenancies/${id}`).then((r) => r.data) : Promise.resolve(null)),
    [id],
  )
}

/** Unpaginated-ish fetch for <select> pickers, matching useAllProperties/useAllUnits/useAllTenants. */
export function useAllTenancies(params: { status?: string; property_id?: number } = {}) {
  return useApiResource<Paginated<TenancySummary>>(
    () => api.get<Paginated<TenancySummary>>('/tenancies', { per_page: 100, status: params.status, property_id: params.property_id }),
    [params.status, params.property_id],
  )
}

export function useTenancyDetail(id: number) {
  return useApiResource<TenancySummary>(
    () => api.get<{ data: TenancySummary }>(`/tenancies/${id}`).then((r) => r.data),
    [id],
  )
}

export function useTenantHistory(tenantId: number) {
  return useApiResource<Paginated<TenancySummary>>(
    () => api.get<Paginated<TenancySummary>>(`/tenants/${tenantId}/history`),
    [tenantId],
  )
}
