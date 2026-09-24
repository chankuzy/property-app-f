// src/hooks/useReports.ts
// Scribe strips report response shapes (FormRequest gap — see api.ts notes),
// so these are best-guess shapes named after their query params/purpose.
// Each interface carries an index signature so it structurally satisfies
// ReportView's `Record<string, unknown> | null` prop. Adjust field names
// once you see a live response; ReportView renders defensively either way.
import { api } from '../lib/api'
import { useApiResource } from './useApiResource'

export interface OccupancyReport {
  total_units: number
  occupied_units: number
  vacant_units: number
  reserved_units: number
  maintenance_units: number
  occupancy_rate: number
  [key: string]: unknown
}

export interface RentCollectionReport {
  period: { from: string | null; to: string | null }
  total_due: string
  total_collected: string
  collection_rate: number
  [key: string]: unknown
}

export interface OutstandingRentReport {
  total_outstanding: string
  charges_count: number
  [key: string]: unknown
}

export interface OverdueAgingBucket {
  label: string
  count: number
  balance: string
}

export interface OverdueRentReport {
  data: unknown[]
  meta?: { current_page: number; last_page: number; total: number }
  aging: OverdueAgingBucket[]
  [key: string]: unknown
}

export interface ExpiringTenanciesReport {
  count: number
  tenancies: unknown[]
  [key: string]: unknown
}

export interface TenantsReport {
  total: number
  active: number
  inactive: number
  [key: string]: unknown
}

export interface PropertySummaryReport {
  properties: unknown[]
  [key: string]: unknown
}

export function useOccupancyReport() {
  return useApiResource<OccupancyReport>(() => api.get<{ data: OccupancyReport }>('/reports/occupancy').then((r) => r.data), [])
}

export function useRentCollectionReport(params: { from?: string; to?: string } = {}) {
  return useApiResource<RentCollectionReport>(
    () => api.get<{ data: RentCollectionReport }>('/reports/rent-collection', params).then((r) => r.data),
    [params.from, params.to],
  )
}

export function useOutstandingRentReport() {
  return useApiResource<OutstandingRentReport>(
    () => api.get<{ data: OutstandingRentReport }>('/reports/outstanding-rent').then((r) => r.data),
    [],
  )
}

export function useOverdueRentReport(params: { page?: number; per_page?: number } = {}) {
  return useApiResource<OverdueRentReport>(
    () => api.get<OverdueRentReport>('/reports/overdue-rent', { page: params.page, per_page: params.per_page }),
    [params.page, params.per_page],
  )
}

export function useExpiringTenanciesReport() {
  return useApiResource<ExpiringTenanciesReport>(
    () => api.get<{ data: ExpiringTenanciesReport }>('/reports/expiring-tenancies').then((r) => r.data),
    [],
  )
}

export function useTenantsReport() {
  return useApiResource<TenantsReport>(() => api.get<{ data: TenantsReport }>('/reports/tenants').then((r) => r.data), [])
}

export function usePropertySummaryReport() {
  return useApiResource<PropertySummaryReport>(
    () => api.get<{ data: PropertySummaryReport }>('/reports/property-summary').then((r) => r.data),
    [],
  )
}
