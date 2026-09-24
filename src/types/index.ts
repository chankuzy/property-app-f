/** Mirrors the JSON shapes returned by property-management-system's API Resources. */

export type TenancyLifecycle = 'upcoming' | 'active' | 'expiring' | 'expired' | 'renewed' | 'transferred' | 'terminated'
export type ChargeTiming = 'settled' | 'overdue' | 'grace' | 'due_today' | 'upcoming' | 'scheduled'
export type ChargeStatus = 'unpaid' | 'partial' | 'paid' | 'waived'
export type TenantStatus = 'active' | 'inactive'
export type OccupancyStatus = 'vacant' | 'occupied' | 'reserved' | 'maintenance'
export type PaymentMethod = 'cash' | 'bank_transfer' | 'pos' | 'cheque' | 'other'
export type NotableType = 'property' | 'building' | 'unit' | 'tenant' | 'tenancy'
export type BillingCycle = 'monthly' | 'quarterly' | 'biannual' | 'annual'
export type Permission = {
  name: string
  label: string
}

export interface Role {
  id: number
  name: string
  label: string
}

export interface RoleWithPermissions extends Role {
  permissions?: string[]
}

export interface AuthUser {
  id: number
  name: string
  email: string
  phone: string | null
  is_active: boolean
  role: Role | null
  permissions: string[]
}

export interface StaffUser {
  id: number
  name: string
  email: string
  phone: string | null
  is_active: boolean
  role: Role | null
  created_at?: string
  updated_at?: string
}

export interface UnitRef {
  id: number
  code: string
  property_id?: number
  property?: string | null
}

export interface TenancySummary {
  id: number
  tenant_id: number
  unit_id: number
  status: string
  lifecycle: TenancyLifecycle
  origin: string
  start_date: string
  end_date: string
  days_until_expiry: number | null
  billing_cycle: string
  rent_amount: string
  unit?: UnitRef
  tenant?: { id: number; full_name: string; phone: string }
}

export interface Tenant {
  id: number
  full_name: string
  phone: string
  alt_phone: string | null
  email: string | null
  address: string | null
  status: TenantStatus
  sms_opt_in: boolean
  emergency_contact_name: string | null
  emergency_contact_phone: string | null
  emergency_contact_relationship: string | null
  active_tenancies: TenancySummary[]
  created_at: string
  updated_at: string
}

export interface Property {
  id: number
  name: string
  code: string | null
  type: string | null
  address: string | null
  city: string | null
  state: string | null
  country: string | null
  owner_name: string | null
  owner_phone: string | null
  is_active: boolean
  units_count?: number
  occupied_units_count?: number
  buildings_count?: number
  created_at: string
  updated_at: string
}

export interface Building {
  id: number
  property_id: number
  property?: { id: number; name: string }
  name: string
  code: string | null
  floors_count: number | null
  units_count?: number
  created_at: string
  updated_at: string
}

export interface Unit {
  id: number
  property_id: number
  building_id: number | null
  property?: { id: number; name: string }
  building?: { id: number; name: string } | null
  code: string
  name: string | null
  type: string | null
  floor: number | null
  bedrooms: number | null
  bathrooms: number | null
  default_rent: string | null
  status: OccupancyStatus
  created_at: string
  updated_at: string
}

export interface RentCharge {
  id: number
  tenancy_id: number
  tenant_id: number
  unit_id: number
  property_id: number
  tenant?: { id: number; full_name: string; phone: string }
  unit?: { id: number; code: string }
  property?: { id: number; name: string }
  period_start: string
  period_end: string
  due_date: string
  amount_due: string
  amount_paid: string
  balance: string
  status: ChargeStatus
  timing: ChargeTiming
  days_overdue: number
}

export interface Payment {
  id: number
  rent_charge_id: number
  amount: string
  paid_at: string
  method: PaymentMethod
  reference: string | null
  notes: string | null
  created_at: string
}

export interface Note {
  id: number
  notable_type: NotableType
  notable_id: number
  body: string
  user?: { id: number; name: string } | null
  created_at: string
}

export interface NotificationItem {
  id: string
  type: string
  data: Record<string, unknown>
  message?: string | null
  read_at: string | null
  created_at: string
}

export interface ActivityLogEntry {
  id: number
  action: string
  description: string
  user: { id: number; name: string } | null
  subject: { type: string | null; id: number | null }
  created_at: string
}

export interface NotificationLogEntry {
  id: number
  audience: 'staff' | 'tenant'
  type: string
  channel: string
  status: string
  message: string | null
  tenant: { id: number; full_name: string } | null
  created_at: string
}

export interface DashboardSummary {
  totals: {
    properties: number
    units: number
    occupied_units: number
    vacant_units: number
    reserved_units: number
    maintenance_units: number
    active_tenants: number
  }
  rent: {
    due_soon: { count: number; balance: string }
    due_today: { count: number; balance: string }
    overdue: { count: number; balance: string }
    collected_this_month: string
  }
  tenancies: {
    expiring_count: number
    expired_open_count: number
    expiring: TenancySummary[]
  }
  unread_alerts: number
  recent_activity?: ActivityLogEntry[]
  recent_tenant_reminders?: NotificationLogEntry[]
}

export interface Paginated<T> {
  data: T[]
  meta: { current_page: number; last_page: number; total: number; per_page?: number }
}
