import { useEffect, useState } from "react";
import {
  Search,
  SlidersHorizontal,
  Plus,
  ChevronLeft,
  ChevronRight,
  Check,
  Users,
  UserCheck,
  UserX,
  Building2,
} from "lucide-react";
import { useTenants } from "../../hooks/useTenants";
import { useRoute } from "../../lib/router";
import { avatarUrl } from "../../lib/avatar";
import StatusPill from "./StatusPill";
import LifecyclePill from "./LifecyclePill";
import TenantRowActions from "./TenantRowActions";

const PER_PAGE = 8;

type StatusFilter = "all" | "active" | "inactive";

export default function ContactsTable() {
  const { navigate } = useRoute();

  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [page, setPage] = useState(1);
  const [filterOpen, setFilterOpen] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setSearch(searchInput.trim()), 350);
    return () => clearTimeout(t);
  }, [searchInput]);

  useEffect(() => {
    setPage(1);
  }, [search, status]);

  const { data, loading, error, refetch } = useTenants({
    per_page: PER_PAGE,
    page,
    search: search || undefined,
    status: status === "all" ? undefined : status,
  });

  const tenants = data?.data ?? [];
  const lastPage = data?.meta.last_page ?? 1;

  const activeCount = tenants.filter(
    (tenant) => tenant.status === "active",
  ).length;
  const inactiveCount = tenants.filter(
    (tenant) => tenant.status === "inactive",
  ).length;
  const leasedCount = tenants.filter(
    (tenant) => tenant.active_tenancies?.length > 0,
  ).length;

  return (
    <div className="animate-fade-up">
      {/* Header */}
      <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-violet">
            People
          </p>

          <h1 className="text-[28px] font-semibold tracking-[-0.035em] text-ink sm:text-[32px]">
            Tenants
          </h1>

          <p className="mt-1.5 max-w-xl text-[13.5px] leading-6 text-muted">
            Manage your tenant relationships, leases and occupancy connections
            from one place.
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate("/tenants/new")}
          className="flex h-10 items-center justify-center gap-2 self-start rounded-full bg-ink px-5 text-[13px] font-medium text-white shadow-[0_8px_20px_rgba(22,22,29,0.12)] transition-all hover:-translate-y-0.5 hover:bg-ink/90 active:translate-y-0 lg:self-auto"
        >
          <Plus size={15} strokeWidth={2.2} />
          Add tenant
        </button>
      </div>

      {/* KPI strip */}
      <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          icon={<Users size={16} strokeWidth={1.8} />}
          label="Total tenants"
          value={data?.meta.total ?? "—"}
        />

        <StatCard
          icon={<UserCheck size={16} strokeWidth={1.8} />}
          label="Active"
          value={loading ? "—" : activeCount}
          note="Current page"
          tone="good"
        />

        <StatCard
          icon={<UserX size={16} strokeWidth={1.8} />}
          label="Inactive"
          value={loading ? "—" : inactiveCount}
          note="Current page"
          tone="muted"
        />

        <StatCard
          icon={<Building2 size={16} strokeWidth={1.8} />}
          label="With active lease"
          value={loading ? "—" : leasedCount}
          note="Current page"
          tone="violet"
        />
      </div>

      {/* Main table */}
      <section className="mt-5 overflow-hidden rounded-[26px] border border-line bg-panel shadow-[0_8px_30px_rgba(30,25,55,0.035)]">
        {/* Toolbar */}
        <div className="flex flex-col gap-3 border-b border-line px-4 py-4 sm:px-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-[15px] font-semibold text-ink">
              Tenant directory
              {data && (
                <span className="ml-1.5 font-normal text-muted">
                  {data.meta.total}
                </span>
              )}
            </h2>

            <p className="mt-0.5 text-[12px] text-muted">
              Search and manage people connected to your properties.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Search */}
            <div className="flex h-9 items-center gap-2 rounded-full border border-line bg-white px-3.5 text-muted transition-colors focus-within:border-violet/40 focus-within:ring-4 focus-within:ring-violet/5">
              <Search size={14} strokeWidth={2} />

              <input
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search tenants"
                className="w-32 bg-transparent text-[12.5px] text-ink outline-none placeholder:text-muted sm:w-44"
              />
            </div>

            {/* Filter */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setFilterOpen((v) => !v)}
                className={[
                  "flex h-9 items-center gap-1.5 rounded-full border px-3.5 text-[12.5px] font-medium transition-colors",
                  status === "all"
                    ? "border-line bg-white text-ink/80 hover:bg-page/60"
                    : "border-violet-soft bg-violet-pale text-violet",
                ].join(" ")}
              >
                <SlidersHorizontal size={13} strokeWidth={2} />

                {status === "all"
                  ? "Filter"
                  : status === "active"
                    ? "Active"
                    : "Inactive"}
              </button>

              {filterOpen && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setFilterOpen(false)}
                  />

                  <div className="animate-scale-in absolute right-0 top-11 z-20 w-40 origin-top-right rounded-2xl border border-line bg-white p-1.5 shadow-[0_14px_35px_rgba(20,18,45,0.14)]">
                    {(["all", "active", "inactive"] as StatusFilter[]).map(
                      (option) => (
                        <button
                          key={option}
                          type="button"
                          onClick={() => {
                            setStatus(option);
                            setFilterOpen(false);
                          }}
                          className="flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-[12.5px] capitalize text-ink/80 transition-colors hover:bg-page/70"
                        >
                          <span>{option}</span>

                          {status === option && (
                            <Check
                              size={13}
                              strokeWidth={2.2}
                              className="text-violet"
                            />
                          )}
                        </button>
                      ),
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Loading */}
        {loading && <TableSkeleton />}

        {/* Error */}
        {error && !loading && (
          <div className="px-5 py-14 text-center">
            <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-warn-bg text-warn-text">
              <Users size={17} />
            </div>

            <p className="mt-3 text-[13px] font-medium text-ink">
              Couldn't load tenants
            </p>

            <p className="mx-auto mt-1 max-w-sm text-[12px] leading-5 text-muted">
              {error}
            </p>

            <button
              type="button"
              onClick={refetch}
              className="mt-4 rounded-full bg-ink px-4 py-2 text-[12px] font-medium text-white transition-colors hover:bg-ink/90"
            >
              Try again
            </button>
          </div>
        )}

        {/* Table */}
        {!loading && !error && (
          <>
            <div className="no-scrollbar overflow-x-auto">
              <table className="w-full min-w-[900px] border-collapse text-left">
                <thead>
                  <tr className="border-b border-line bg-page/25 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted">
                    <th className="w-12 px-5 py-3.5">
                      <span className="sr-only">Select</span>
                    </th>

                    <th className="pb-3.5 pr-5 font-semibold">Tenant</th>

                    <th className="pb-3.5 pr-5 font-semibold">Unit</th>

                    <th className="pb-3.5 pr-5 font-semibold">Property</th>

                    <th className="pb-3.5 pr-5 font-semibold">Lease</th>

                    <th className="pb-3.5 pr-5 font-semibold">Lifecycle</th>

                    <th className="pb-3.5 pr-5 font-semibold">Status</th>

                    <th className="w-12 pb-3.5 pr-5">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {tenants.length === 0 && (
                    <tr>
                      <td colSpan={8} className="px-5 py-16 text-center">
                        <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-violet-pale text-violet">
                          <Users size={18} strokeWidth={1.8} />
                        </div>

                        <p className="mt-3 text-[13px] font-medium text-ink">
                          {search || status !== "all"
                            ? "No tenants match your filters"
                            : "No tenants yet"}
                        </p>

                        <p className="mt-1 text-[12px] text-muted">
                          {search || status !== "all"
                            ? "Try changing your search or status filter."
                            : "Add your first tenant to start building your directory."}
                        </p>

                        {!search && status === "all" && (
                          <button
                            type="button"
                            onClick={() => navigate("/tenants/new")}
                            className="mt-4 rounded-full bg-ink px-4 py-2 text-[12px] font-medium text-white hover:bg-ink/90"
                          >
                            Add tenant
                          </button>
                        )}
                      </td>
                    </tr>
                  )}

                  {tenants.map((tenant) => {
                    const tenancy = tenant.active_tenancies[0];

                    return (
                      <tr
                        key={tenant.id}
                        onClick={() => navigate(`/tenants/${tenant.id}`)}
                        className="group cursor-pointer border-b border-line/70 text-[13px] transition-colors last:border-b-0 hover:bg-page/35"
                      >
                        {/* Checkbox */}
                        <td
                          className="px-5 py-4"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <input
                            type="checkbox"
                            className="h-4 w-4 rounded border-line accent-violet"
                          />
                        </td>

                        {/* Tenant */}
                        <td className="py-4 pr-5">
                          <div className="flex items-center gap-3">
                            <div className="relative shrink-0">
                              <img
                                src={avatarUrl(String(tenant.id))}
                                alt=""
                                className="h-9 w-9 rounded-full object-cover ring-2 ring-white"
                              />

                              {tenant.status === "active" && (
                                <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-white bg-good-text" />
                              )}
                            </div>

                            <div className="min-w-0">
                              <p className="truncate font-semibold text-ink">
                                {tenant.full_name}
                              </p>

                              <p className="mt-0.5 truncate text-[11.5px] text-muted">
                                {tenant.phone || "No phone number"}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Unit */}
                        <td className="py-4 pr-5">
                          {tenancy?.unit?.code ? (
                            <span className="inline-flex rounded-lg bg-page px-2.5 py-1 text-[12px] font-medium text-ink">
                              {tenancy.unit.code}
                            </span>
                          ) : (
                            <span className="text-muted">—</span>
                          )}
                        </td>

                        {/* Property */}
                        <td className="py-4 pr-5">
                          <span className="text-ink/75">
                            {tenancy?.unit?.property ?? "—"}
                          </span>
                        </td>

                        {/* Lease */}
                        <td className="py-4 pr-5">
                          <div>
                            <p className="font-medium text-ink/80">
                              {tenancy?.end_date ?? "—"}
                            </p>

                            {tenancy && (
                              <p className="mt-0.5 text-[11px] text-muted">
                                Lease end
                              </p>
                            )}
                          </div>
                        </td>

                        {/* Lifecycle */}
                        <td className="py-4 pr-5">
                          {tenancy ? (
                            <LifecyclePill lifecycle={tenancy.lifecycle} />
                          ) : (
                            <span className="text-muted">No lease</span>
                          )}
                        </td>

                        {/* Status */}
                        <td className="py-4 pr-5">
                          <StatusPill status={tenant.status} />
                        </td>

                        {/* Actions */}
                        <td
                          className="py-4 pr-5 text-right"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <TenantRowActions
                            tenant={tenant}
                            onChanged={refetch}
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {data && data.meta.total > 0 && (
              <div className="flex items-center justify-between border-t border-line px-5 py-4">
                <p className="text-[11.5px] text-muted">
                  Showing page{" "}
                  <span className="font-medium text-ink">
                    {data.meta.current_page}
                  </span>{" "}
                  of <span className="font-medium text-ink">{lastPage}</span>
                </p>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    disabled={page <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    className="flex h-8 w-8 items-center justify-center rounded-full border border-line bg-white text-ink/70 transition-all hover:bg-page/60 disabled:pointer-events-none disabled:opacity-35"
                  >
                    <ChevronLeft size={15} strokeWidth={2} />
                  </button>

                  <button
                    type="button"
                    disabled={page >= lastPage}
                    onClick={() => setPage((p) => Math.min(lastPage, p + 1))}
                    className="flex h-8 w-8 items-center justify-center rounded-full border border-line bg-white text-ink/70 transition-all hover:bg-page/60 disabled:pointer-events-none disabled:opacity-35"
                  >
                    <ChevronRight size={15} strokeWidth={2} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  note,
  tone = "default",
}: {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  note?: string;
  tone?: "default" | "good" | "muted" | "violet";
}) {
  const iconClass =
    tone === "good"
      ? "bg-good-bg text-good-text"
      : tone === "violet"
        ? "bg-violet-pale text-violet"
        : tone === "muted"
          ? "bg-page text-muted"
          : "bg-ink text-white";

  return (
    <div className="rounded-[22px] border border-line bg-panel p-4 shadow-[0_5px_20px_rgba(30,25,55,0.025)]">
      <div className="flex items-start justify-between gap-3">
        <div
          className={`flex h-8 w-8 items-center justify-center rounded-xl ${iconClass}`}
        >
          {icon}
        </div>

        {note && (
          <span className="rounded-full bg-page px-2 py-1 text-[9.5px] font-medium text-muted">
            {note}
          </span>
        )}
      </div>

      <p className="mt-4 text-[11px] font-medium text-muted">{label}</p>

      <p className="mt-0.5 text-[24px] font-semibold tracking-[-0.035em] text-ink">
        {value}
      </p>
    </div>
  );
}

function TableSkeleton() {
  return (
    <div className="divide-y divide-line">
      {Array.from({ length: 6 }).map((_, index) => (
        <div key={index} className="flex h-[70px] items-center gap-4 px-5">
          <div className="h-4 w-4 animate-pulse rounded bg-page" />
          <div className="h-9 w-9 animate-pulse rounded-full bg-page" />
          <div className="h-8 w-36 animate-pulse rounded-lg bg-page" />
          <div className="h-8 w-20 animate-pulse rounded-lg bg-page" />
          <div className="h-5 w-28 animate-pulse rounded bg-page" />
          <div className="h-7 w-20 animate-pulse rounded-full bg-page" />
          <div className="h-7 w-16 animate-pulse rounded-full bg-page" />
        </div>
      ))}
    </div>
  );
}
