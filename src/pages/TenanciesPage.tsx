import { useEffect, useState } from "react";
import {
  Plus,
  ChevronLeft,
  ChevronRight,
  Check,
  ChevronDown,
  FileText,
  Clock3,
  AlertTriangle,
  CircleCheck,
  ArrowUpRight,
} from "lucide-react";
import { useTenancies } from "../hooks/useTenancies";
import { useRoute } from "../lib/router";
import LifecyclePill from "../components/contacts/LifecyclePill";
import TenancyRowActions from "../components/tenancies/TenancyRowActions";
import type { TenancyLifecycle } from "../types";

const PER_PAGE = 10;

type StatusFilter = "all" | TenancyLifecycle;

const lifecycleOptions: StatusFilter[] = [
  "all",
  "upcoming",
  "active",
  "expiring",
  "expired",
  "renewed",
  "transferred",
  "terminated",
];

export default function TenanciesPage() {
  const { navigate } = useRoute();
  const [status, setStatus] = useState<StatusFilter>("all");
  const [page, setPage] = useState(1);
  const [filterOpen, setFilterOpen] = useState(false);

  useEffect(() => {
    setPage(1);
  }, [status]);

  const { data, loading, error, refetch } = useTenancies({
    per_page: PER_PAGE,
    page,
    status: status === "all" ? undefined : status,
  });

  const tenancies = data?.data ?? [];
  const lastPage = data?.meta.last_page ?? 1;

  const activeCount = tenancies.filter((t) => t.lifecycle === "active").length;
  const expiringCount = tenancies.filter(
    (t) => t.lifecycle === "expiring",
  ).length;
  const expiredCount = tenancies.filter(
    (t) => t.lifecycle === "expired",
  ).length;

  const currentRent = tenancies.reduce(
    (sum, tenancy) => sum + Number(tenancy.rent_amount || 0),
    0,
  );

  return (
    <div className="animate-fade-up">
      {/* Header */}
      <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-violet">
            Leasing
          </p>

          <h1 className="text-[28px] font-semibold tracking-[-0.035em] text-ink sm:text-[32px]">
            Tenancies
          </h1>

          <p className="mt-1.5 max-w-xl text-[13.5px] leading-6 text-muted">
            Keep track of active leases, upcoming move-ins, expirations and
            tenancy changes across your portfolio.
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate("/tenancies/new")}
          className="flex h-10 items-center justify-center gap-2 self-start rounded-full bg-ink px-5 text-[13px] font-medium text-white shadow-[0_8px_20px_rgba(22,22,29,0.12)] transition-all hover:-translate-y-0.5 hover:bg-ink/90 active:translate-y-0 lg:self-auto"
        >
          <Plus size={15} strokeWidth={2.2} />
          New tenancy
        </button>
      </div>

      {/* Summary */}
      <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          icon={<FileText size={16} strokeWidth={1.8} />}
          label="Total tenancies"
          value={data?.meta.total ?? "—"}
        />

        <StatCard
          icon={<CircleCheck size={16} strokeWidth={1.8} />}
          label="Active"
          value={loading ? "—" : activeCount}
          note="Current page"
          tone="good"
        />

        <StatCard
          icon={<Clock3 size={16} strokeWidth={1.8} />}
          label="Expiring"
          value={loading ? "—" : expiringCount}
          note="Current page"
          tone="violet"
        />

        <StatCard
          icon={<AlertTriangle size={16} strokeWidth={1.8} />}
          label="Expired"
          value={loading ? "—" : expiredCount}
          note="Current page"
          tone={expiredCount > 0 ? "warn" : "muted"}
        />
      </div>

      {/* Rent snapshot */}
      {!loading && tenancies.length > 0 && (
        <div className="mt-3 flex flex-col justify-between gap-3 rounded-[22px] border border-line bg-ink px-5 py-4 text-white shadow-[0_8px_25px_rgba(22,22,29,0.08)] sm:flex-row sm:items-center">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/45">
              Rent represented on this page
            </p>
            <p className="mt-1 text-[21px] font-semibold tracking-[-0.025em]">
              ₦{currentRent.toLocaleString()}
            </p>
          </div>

          <p className="text-[11px] text-white/45">
            Based on the currently loaded tenancies
          </p>
        </div>
      )}

      {/* Table */}
      <section className="mt-5 overflow-hidden rounded-[26px] border border-line bg-panel shadow-[0_8px_30px_rgba(30,25,55,0.035)]">
        {/* Toolbar */}
        <div className="flex flex-col gap-3 border-b border-line px-4 py-4 sm:px-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-[15px] font-semibold text-ink">
              Lease directory
              {data && (
                <span className="ml-1.5 font-normal text-muted">
                  {data.meta.total}
                </span>
              )}
            </h2>

            <p className="mt-0.5 text-[12px] text-muted">
              Every tenancy, its current lifecycle and financial terms.
            </p>
          </div>

          <div className="relative">
            <button
              type="button"
              onClick={() => setFilterOpen((v) => !v)}
              className={[
                "flex h-9 items-center gap-2 rounded-full border px-3.5 text-[12.5px] font-medium capitalize transition-colors",
                status === "all"
                  ? "border-line bg-white text-ink/80 hover:bg-page/60"
                  : "border-violet-soft bg-violet-pale text-violet",
              ].join(" ")}
            >
              <span>{status === "all" ? "Any lifecycle" : status}</span>

              <ChevronDown size={13} strokeWidth={2} />
            </button>

            {filterOpen && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setFilterOpen(false)}
                />

                <div className="animate-scale-in absolute right-0 top-11 z-20 w-44 origin-top-right rounded-2xl border border-line bg-white p-1.5 shadow-[0_14px_35px_rgba(20,18,45,0.14)]">
                  {lifecycleOptions.map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => {
                        setStatus(option);
                        setFilterOpen(false);
                      }}
                      className="flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-[12.5px] capitalize text-ink/80 transition-colors hover:bg-page/70"
                    >
                      <span>{option === "all" ? "Any lifecycle" : option}</span>

                      {status === option && (
                        <Check
                          size={13}
                          strokeWidth={2.2}
                          className="text-violet"
                        />
                      )}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {loading && <TableSkeleton />}

        {error && !loading && (
          <div className="px-5 py-14 text-center">
            <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-warn-bg text-warn-text">
              <FileText size={17} />
            </div>

            <p className="mt-3 text-[13px] font-medium text-ink">
              Couldn't load tenancies
            </p>

            <p className="mx-auto mt-1 max-w-sm text-[12px] leading-5 text-muted">
              {error}
            </p>

            <button
              type="button"
              onClick={refetch}
              className="mt-4 rounded-full bg-ink px-4 py-2 text-[12px] font-medium text-white hover:bg-ink/90"
            >
              Try again
            </button>
          </div>
        )}

        {!loading && !error && (
          <>
            <div className="no-scrollbar overflow-x-auto">
              <table className="w-full min-w-[900px] border-collapse text-left">
                <thead>
                  <tr className="border-b border-line bg-page/25 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted">
                    <th className="pb-3.5 pl-5 pr-5 font-semibold">Tenant</th>
                    <th className="pb-3.5 pr-5 font-semibold">Unit</th>
                    <th className="pb-3.5 pr-5 font-semibold">Term</th>
                    <th className="pb-3.5 pr-5 font-semibold">Billing</th>
                    <th className="pb-3.5 pr-5 font-semibold">Rent</th>
                    <th className="pb-3.5 pr-5 font-semibold">Lifecycle</th>
                    <th className="w-12 pb-3.5 pr-5" />
                  </tr>
                </thead>

                <tbody>
                  {tenancies.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-5 py-16 text-center">
                        <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-violet-pale text-violet">
                          <FileText size={18} strokeWidth={1.8} />
                        </div>

                        <p className="mt-3 text-[13px] font-medium text-ink">
                          {status !== "all"
                            ? "No tenancies match this lifecycle"
                            : "No tenancies yet"}
                        </p>

                        <p className="mt-1 text-[12px] text-muted">
                          {status !== "all"
                            ? "Try selecting another lifecycle filter."
                            : "Create your first tenancy to start tracking leases."}
                        </p>

                        {status === "all" && (
                          <button
                            type="button"
                            onClick={() => navigate("/tenancies/new")}
                            className="mt-4 rounded-full bg-ink px-4 py-2 text-[12px] font-medium text-white hover:bg-ink/90"
                          >
                            New tenancy
                          </button>
                        )}
                      </td>
                    </tr>
                  )}

                  {tenancies.map((tenancy) => (
                    <tr
                      key={tenancy.id}
                      onClick={() => navigate(`/tenancies/${tenancy.id}`)}
                      className="group cursor-pointer border-b border-line/70 text-[13px] transition-colors last:border-b-0 hover:bg-page/35"
                    >
                      {/* Tenant */}
                      <td className="py-4 pl-5 pr-5">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-violet-pale text-[12px] font-semibold text-violet">
                            {getInitials(
                              tenancy.tenant?.full_name ??
                                `Tenant ${tenancy.tenant_id}`,
                            )}
                          </div>

                          <div className="min-w-0">
                            <p className="truncate font-semibold text-ink">
                              {tenancy.tenant?.full_name ??
                                `Tenant #${tenancy.tenant_id}`}
                            </p>

                            <p className="mt-0.5 truncate text-[11.5px] text-muted">
                              {tenancy.tenant?.phone || "No phone number"}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Unit */}
                      <td className="py-4 pr-5">
                        <div className="flex items-center gap-1.5">
                          <span className="rounded-lg bg-page px-2.5 py-1 text-[12px] font-medium text-ink">
                            {tenancy.unit?.code ?? `#${tenancy.unit_id}`}
                          </span>

                          <ArrowUpRight
                            size={12}
                            className="text-muted opacity-0 transition-opacity group-hover:opacity-100"
                          />
                        </div>
                      </td>

                      {/* Term */}
                      <td className="py-4 pr-5">
                        <div>
                          <p className="font-medium text-ink/80">
                            {tenancy.start_date}
                          </p>
                          <p className="mt-0.5 text-[11.5px] text-muted">
                            to {tenancy.end_date}
                          </p>
                        </div>
                      </td>

                      {/* Billing */}
                      <td className="py-4 pr-5">
                        <span className="capitalize text-ink/75">
                          {tenancy.billing_cycle}
                        </span>
                      </td>

                      {/* Rent */}
                      <td className="py-4 pr-5">
                        <p className="font-semibold text-ink">
                          ₦{Number(tenancy.rent_amount).toLocaleString()}
                        </p>

                        <p className="mt-0.5 text-[11px] text-muted">
                          per {billingLabel(tenancy.billing_cycle)}
                        </p>
                      </td>

                      {/* Lifecycle */}
                      <td className="py-4 pr-5">
                        <LifecyclePill lifecycle={tenancy.lifecycle} />
                      </td>

                      {/* Actions */}
                      <td
                        className="py-4 pr-5 text-right"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <TenancyRowActions
                          tenancy={tenancy}
                          onChanged={refetch}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

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
  tone?: "default" | "good" | "violet" | "warn" | "muted";
}) {
  const iconClass =
    tone === "good"
      ? "bg-good-bg text-good-text"
      : tone === "violet"
        ? "bg-violet-pale text-violet"
        : tone === "warn"
          ? "bg-warn-bg text-warn-text"
          : tone === "muted"
            ? "bg-page text-muted"
            : "bg-ink text-white";

  return (
    <div className="rounded-[22px] border border-line bg-panel p-4 shadow-[0_5px_20px_rgba(30,25,55,0.025)]">
      <div className="flex items-start justify-between gap-3">
        <div
          className={[
            "flex h-8 w-8 items-center justify-center rounded-xl",
            iconClass,
          ].join(" ")}
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
      {Array.from({ length: 7 }).map((_, index) => (
        <div key={index} className="flex h-[70px] items-center gap-4 px-5">
          <div className="h-9 w-9 animate-pulse rounded-full bg-page" />
          <div className="h-8 w-32 animate-pulse rounded-lg bg-page" />
          <div className="h-7 w-20 animate-pulse rounded-lg bg-page" />
          <div className="h-7 w-28 animate-pulse rounded-lg bg-page" />
          <div className="h-7 w-20 animate-pulse rounded-lg bg-page" />
          <div className="h-7 w-16 animate-pulse rounded-full bg-page" />
        </div>
      ))}
    </div>
  );
}

function getInitials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

function billingLabel(cycle: string) {
  if (cycle === "monthly") return "month";
  if (cycle === "quarterly") return "quarter";
  if (cycle === "biannual") return "6 months";
  if (cycle === "annual") return "year";
  return cycle;
}
