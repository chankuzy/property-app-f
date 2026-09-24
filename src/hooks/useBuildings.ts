// src/hooks/useBuildings.ts
import { api } from '../lib/api'
import { useApiResource } from './useApiResource'
import type { Paginated, Building } from '../types'

export function useBuildings(params: { property_id?: number; per_page?: number; page?: number } = {}) {
  return useApiResource<Paginated<Building>>(
    () =>
      api.get<Paginated<Building>>('/buildings', {
        per_page: params.per_page ?? 10,
        page: params.page,
        property_id: params.property_id,
      }),
    [params.property_id, params.per_page, params.page],
  )
}

export function useBuildingDetail(id: number) {
  return useApiResource<Building>(
    () => api.get<{ data: Building }>(`/buildings/${id}`).then((r) => r.data),
    [id],
  )
}
