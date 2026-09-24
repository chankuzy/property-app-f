// src/hooks/useUnits.ts
import { api } from '../lib/api'
import { useApiResource } from './useApiResource'
import type { Paginated, Unit } from '../types'

export function useUnits(
  params: { property_id?: number; building_id?: number; status?: string; per_page?: number; page?: number } = {},
) {
  return useApiResource<Paginated<Unit>>(
    () =>
      api.get<Paginated<Unit>>('/units', {
        per_page: params.per_page ?? 10,
        page: params.page,
        property_id: params.property_id,
        building_id: params.building_id,
        status: params.status,
      }),
    [params.property_id, params.building_id, params.status, params.per_page, params.page],
  )
}

/** Unpaginated-ish fetch for <select> pickers. */
export function useAllUnits(params: { property_id?: number } = {}) {
  return useApiResource<Paginated<Unit>>(
    () => api.get<Paginated<Unit>>('/units', { per_page: 100, property_id: params.property_id }),
    [params.property_id],
  )
}

export function useUnitDetail(id: number) {
  return useApiResource<Unit>(
    () => api.get<{ data: Unit }>(`/units/${id}`).then((r) => r.data),
    [id],
  )
}
