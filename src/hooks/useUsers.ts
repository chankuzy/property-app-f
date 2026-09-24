// src/hooks/useUsers.ts
import { api } from '../lib/api'
import { useApiResource } from './useApiResource'
import type { Paginated, StaffUser } from '../types'

export function useUsers(
  params: { search?: string; per_page?: number; page?: number; is_active?: boolean; role_id?: number } = {},
) {
  return useApiResource<Paginated<StaffUser>>(
    () =>
      api.get<Paginated<StaffUser>>('/users', {
        per_page: params.per_page ?? 10,
        page: params.page,
        search: params.search,
        is_active: params.is_active,
        role_id: params.role_id,
      }),
    [params.search, params.per_page, params.page, params.is_active, params.role_id],
  )
}
