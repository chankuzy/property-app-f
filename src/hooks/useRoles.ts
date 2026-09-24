import { api } from '../lib/api'
import { useApiResource } from './useApiResource'
import type { Permission, RoleWithPermissions } from '../types'

/** Contract has no pagination on /roles or /permissions — flat lists. */
export function useRoles() {
  return useApiResource<RoleWithPermissions[]>(
    () => api.get<{ data: RoleWithPermissions[] }>('/roles').then((r) => r.data),
    [],
  )
}

export function usePermissions() {
  return useApiResource<Permission[]>(
    () => api.get<{ data: Permission[] }>('/permissions').then((r) => r.data),
    [],
  )
}

/** PUT /roles/{id} — contract's only documented body param is `permissions` (string[]). */
export function updateRolePermissions(roleId: number, permissions: string[]) {
  return api.put(`/roles/${roleId}`, { permissions })
}