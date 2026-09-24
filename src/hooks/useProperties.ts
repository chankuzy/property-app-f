// src/hooks/useProperties.ts
import { api } from '../lib/api'
import { useApiResource } from './useApiResource'
import type { Paginated, Property } from '../types'

export function useProperties(
  params: { search?: string; per_page?: number; page?: number; is_active?: boolean } = {},
) {
  return useApiResource<Paginated<Property>>(
    () =>
      api.get<Paginated<Property>>('/properties', {
        per_page: params.per_page ?? 10,
        page: params.page,
        search: params.search,
        is_active: params.is_active,
      }),
    [params.search, params.per_page, params.page, params.is_active],
  )
}

/** Unpaginated-ish fetch for <select> pickers — a large per_page stands in for
 * a real "all" endpoint the contract doesn't expose. Revisit if property
 * counts ever meaningfully exceed 100. */
export function useAllProperties() {
  return useApiResource<Paginated<Property>>(
    () => api.get<Paginated<Property>>('/properties', { per_page: 100 }),
    [],
  )
}

export function usePropertyDetail(id: number) {
  return useApiResource<Property>(
    () => api.get<{ data: Property }>(`/properties/${id}`).then((r) => r.data),
    [id],
  )
}
