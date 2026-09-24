// src/hooks/useRentCharges.ts
import { api } from '../lib/api'
import { useApiResource } from './useApiResource'
import type { Paginated, RentCharge, ChargeStatus, ChargeTiming } from '../types'

export function useRentCharges(
  params: {
    tenancy_id?: number
    tenant_id?: number
    property_id?: number
    status?: ChargeStatus
    timing?: ChargeTiming
    per_page?: number
    page?: number
  } = {},
) {
  return useApiResource<Paginated<RentCharge>>(
    () =>
      api.get<Paginated<RentCharge>>('/rent-charges', {
        per_page: params.per_page ?? 10,
        page: params.page,
        tenancy_id: params.tenancy_id,
        tenant_id: params.tenant_id,
        property_id: params.property_id,
        status: params.status,
        timing: params.timing,
      }),
    [params.tenancy_id, params.tenant_id, params.property_id, params.status, params.timing, params.per_page, params.page],
  )
}

export function useRentCharge(id: number | undefined) {
  return useApiResource<RentCharge | null>(
    () => (id ? api.get<{ data: RentCharge }>(`/rent-charges/${id}`).then((r) => r.data) : Promise.resolve(null)),
    [id],
  )
}
