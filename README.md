# Heitkamp Tenancy Pipeline — property management system frontend

React + TypeScript + Tailwind CSS 4 frontend for the `property-management-system`
Laravel API. Originally built to match a CRM dashboard reference design; now adapted
to the property management domain — "Contacts" is tenants, "Business Pipeline" is
the tenancy/rent pipeline.

## Run it

```bash
npm install
cp .env.example .env      # point VITE_API_BASE_URL at your Laravel API
npm run dev
```

You'll land on a sign-in screen — this calls `POST /auth/login` on the backend
(see `property-management-system-backend.zip` from earlier). Use a seeded staff
account (run `php artisan db:seed` on the backend first; `ADMIN_EMAIL` in its
`.env` is your first super admin).

## What's wired to the API vs. still a placeholder

**Live, from the backend:**
- Auth (login/logout, token stored in `localStorage`, 401 clears the session)
- Pipeline Performance Analytics chart — unit occupancy + rent timing + expiring
  leases, from `GET /dashboard`
- Tenants table — from `GET /tenants`
- Recent Activity panel — from `GET /activity-logs` and `GET /notification-logs`

**Still placeholder:**
- Avatars (`pravatar.cc`, seeded by tenant/staff id — the backend has no photo field)
- "Add Tenant", table row menus, search bar, header icons (headset/settings/bell) —
  UI only, not wired to an action yet
- Pagination on the tenants table (shows the first 5; `useTenants` accepts
  `per_page`/`search` params already, a "load more" or real pager just isn't built)

## CORS

The backend's `config/cors.php` reads `CORS_ALLOWED_ORIGINS` from its `.env`. Add
this dev server's origin there, e.g.:

```
CORS_ALLOWED_ORIGINS=http://localhost:5173
```

## Structure

```
src/
  lib/
    api.ts        fetch wrapper — attaches the bearer token, normalises errors
    auth.ts        session storage (token + user) in localStorage
    avatar.ts      placeholder avatar URLs
  hooks/
    useApiResource.ts   generic loading/error/refetch wrapper around a fetcher
    useDashboard.ts, useTenants.ts, useActivity.ts
  types/index.ts    mirrors the backend's API Resource shapes
  components/
    auth/           LoginPage
    layout/          Sidebar, Topbar (user menu + sign out), DashboardShell
    pipeline/        analytics chart, now driven by dashboard totals
    contacts/        tenants table, status + lease-lifecycle pills
    quickconnects/   Recent Activity panel (staff activity + tenant SMS log)
  pages/
    BusinessPipelinePage.tsx
```

## Next steps

- Wire the "Add Tenant" button to `POST /tenants` and a form.
- Add real pagination / infinite scroll to the tenants table.
- Surface `unread_alerts` from the dashboard on the bell icon, and build the
  notification inbox dropdown against `GET /notifications`.
- Add a route for a tenant detail view (`GET /tenants/{id}/history`) — the backend
  already returns full tenancy history for this.
