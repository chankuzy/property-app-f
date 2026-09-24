// src/App.tsx
import { useCallback, useEffect, useState, type ReactElement } from 'react'
import DashboardShell from './components/layout/DashboardShell'
import BusinessPipelinePage from './pages/BusinessPipelinePage'
import AddTenantPage from './pages/AddTenantPage'
import PropertiesPage from './pages/PropertiesPage'
import PropertyDetailPage from './pages/PropertyDetailPage'
import BuildingsPage from './pages/BuildingsPage'
import AddBuildingPage from './pages/AddBuildingPage'
import BuildingDetailPage from './pages/BuildingDetailPage'
import UnitsPage from './pages/UnitsPage'
import AddUnitPage from './pages/AddUnitPage'
import UnitDetailPage from './pages/UnitDetailPage'
import AddPropertyPage from './pages/AddPropertyPage'
import TenantDetailPage from './pages/TenantDetailPage'
import TenanciesPage from './pages/TenanciesPage'
import AddTenancyPage from './pages/AddTenancyPage'
import TenancyDetailPage from './pages/TenancyDetailPage'
import RentChargesPage from './pages/RentChargesPage'
import AddRentChargePage from './pages/AddRentChargePage'
import NotificationsPage from './pages/NotificationsPage'
import UsersPage from './pages/UsersPage'
import AddUserPage from './pages/AddUserPage'
import RolesPage from './pages/RolesPage'
import ReportsPage from './pages/ReportsPage'
import LoginPage from './components/auth/LoginPage'
import Toaster from './components/ui/Toaster'
import { useRoute, matchPath } from './lib/router'
import { api, ApiError } from './lib/api'
import { getToken, getStoredUser, updateStoredUser, clearSession, type StoredUser } from './lib/auth'
import type { AuthUser } from './types'

const dynamicRoutes: { pattern: string; render: (id: number) => ReactElement }[] = [
  { pattern: '/properties/:id', render: (id) => <PropertyDetailPage id={id} /> },
  { pattern: '/buildings/:id', render: (id) => <BuildingDetailPage id={id} /> },
  { pattern: '/units/:id', render: (id) => <UnitDetailPage id={id} /> },
  { pattern: '/tenants/:id', render: (id) => <TenantDetailPage id={id} /> },
  { pattern: '/tenancies/:id', render: (id) => <TenancyDetailPage id={id} /> },
]

function NotFound() {
  return (
    <div className="animate-fade-up rounded-3xl border border-dashed border-line bg-panel p-10 text-center">
      <p className="text-[15px] font-semibold text-ink">Not found</p>
      <p className="mt-1 text-[13px] text-muted">That record doesn't exist or the link is invalid.</p>
    </div>
  )
}

function renderRoute(path: string): ReactElement {
  switch (path) {
    case '/tenants/new':
      return <AddTenantPage />
    case '/properties':
      return <PropertiesPage />
    case '/properties/new':
      return <AddPropertyPage />
    case '/buildings':
      return <BuildingsPage />
    case '/buildings/new':
      return <AddBuildingPage />
    case '/units':
      return <UnitsPage />
    case '/units/new':
      return <AddUnitPage />
    case '/tenancies':
      return <TenanciesPage />
    case '/tenancies/new':
      return <AddTenancyPage />
    case '/rent-charges':
      return <RentChargesPage />
    case '/rent-charges/new':
      return <AddRentChargePage />
    case '/notifications':
      return <NotificationsPage />
    case '/users':
      return <UsersPage />
    case '/users/new':
      return <AddUserPage />
    case '/roles':
      return <RolesPage />
    case '/reports':
      return <ReportsPage />
  }

  for (const route of dynamicRoutes) {
    const params = matchPath(route.pattern, path)
    if (params) {
      const id = Number(params.id)
      return Number.isFinite(id) ? route.render(id) : <NotFound />
    }
  }

  return <BusinessPipelinePage />
}

function BootScreen() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-page">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-line border-t-ink" />
    </div>
  )
}

export default function App() {
  const [user, setUser] = useState<StoredUser | null>(() => (getToken() ? getStoredUser() : null))
  // Only block on a /auth/me check when there's a cached session to verify —
  // a fresh visitor with no token goes straight to the login screen.
  const [booting, setBooting] = useState<boolean>(() => !!getToken())
  const { path } = useRoute()

  useEffect(() => {
    if (!getToken()) return

    let cancelled = false

    api
      .get<{ data: AuthUser }>('/auth/me')
      .then((res) => {
        if (cancelled) return
        const refreshed: StoredUser = {
          id: res.data.id,
          name: res.data.name,
          email: res.data.email,
          role: res.data.role,
          permissions: res.data.permissions,
        }
        updateStoredUser(refreshed)
        setUser(refreshed)
      })
      .catch((err: unknown) => {
        if (cancelled) return
        // apiRequest already clears the session on 401 — drop the stale
        // cached user so the login screen shows. Any other error (network
        // blip, 5xx) keeps the cached session and retries next reload
        // instead of logging the person out.
        if (err instanceof ApiError && err.status === 401) {
          setUser(null)
        }
      })
      .finally(() => {
        if (!cancelled) setBooting(false)
      })

    return () => {
      cancelled = true
    }
  }, [])

  const handleLoggedIn = useCallback(() => setUser(getStoredUser()), [])

  const handleLogout = useCallback(() => {
    // Best-effort server-side token revocation — the local session clears either way.
    api.post('/auth/logout').catch(() => {})
    clearSession()
    setUser(null)
  }, [])

  if (booting) return <BootScreen />

  return (
    <>
      <Toaster />
      {user ? (
        <DashboardShell user={user} onLogout={handleLogout}>
          {renderRoute(path)}
        </DashboardShell>
      ) : (
        <LoginPage onLoggedIn={handleLoggedIn} />
      )}
    </>
  )
}
