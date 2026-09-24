// src/hooks/usePayments.ts
import { api } from '../lib/api'
import { useApiResource } from './useApiResource'
import type { Paginated, Payment } from '../types'

export function usePayments(params: { rent_charge_id?: number; per_page?: number; page?: number } = {}) {
  return useApiResource<Paginated<Payment>>(
    () =>
      api.get<Paginated<Payment>>('/payments', {
        per_page: params.per_page ?? 10,
        page: params.page,
        rent_charge_id: params.rent_charge_id,
      }),
    [params.rent_charge_id, params.per_page, params.page],
  )
}
