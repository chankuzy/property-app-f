import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  CalendarClock,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircleDollarSign,
  Plus,
  ReceiptText,
} from "lucide-react";
import { useRentCharges } from "../hooks/useRentCharges";
import { useRoute } from "../lib/router";
import type { ChargeStatus, ChargeTiming } from "../types";
import RentChargeRowActions from "../components/rentcharges/RentChargeRowActions";

const PER_PAGE = 10;
type StatusFilter = "all" | ChargeStatus;

const statusStyles: Record<ChargeStatus, string> = {
  unpaid: "bg-rose-50 text-rose-600",
  partial: "bg-warn-bg text-warn-text",
  paid: "bg-good-bg text-good-text",
  waived: "bg-page text-ink/60",
};

const timingLabel: Record<ChargeTiming, string> = {
  settled: "Settled",
  overdue: "Overdue",
  grace: "Grace period",
  due_today: "Due today",
  upcoming: "Upcoming",
  scheduled: "Scheduled",
};

export default function RentChargesPage() {
  const { navigate } = useRoute();

  const [status, setStatus] = useState<StatusFilter>("all");
  const [page, setPage] = useState(1);
  const [filterOpen, setFilterOpen] = useState(false);

  useEffect(() => {
    setPage(1);
  }, [status]);

  const { data, loading, error, refetch } = useRentCharges({
    per_page: PER_PAGE,
    page,
    status: status === "all" ? undefined : status,
  });

  const charges = data?.data ?? [];
  const lastPage = data?.meta.last_page ?? 1;

  const stats = useMemo(() => {
    const totalDue = charges.reduce(
      (sum, charge) => sum + Number(charge.amount_due || 0),
      0,
    );

    const outstanding = charges.reduce(
      (sum, charge) => sum + Number(charge.balance || 0),
      0,
    );

    const overdue = charges.filter((charge) => charge.timing === "overdue");

    const dueToday = charges.filter((charge) => charge.timing === "due_today");

    const paid = charges.filter((charge) => charge.status === "paid");

    return {
      totalDue,
      outstanding,
      overdueCount: overdue.length,
      overdueBalance: overdue.reduce(
        (sum, charge) => sum + Number(charge.balance || 0),
        0,
      ),
      dueTodayCount: dueToday.length,
      paidCount: paid.length,
    };
  }, [charges]);

  const formatMoney = (value: number | string) =>
    `₦${Number(value || 0).toLocaleString()}`;

  return (
    <div className="animate-fade-up">
      {/* Header */}
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">
            Finance
          </p>

          <h1 className="mt-1 text-[22px] font-bold tracking-[-0.02em] text-ink sm:text-[25px]">
            Rent charges
          </h1>

          <p className="mt-1 max-w-[560px] text-[13px] leading-5 text-muted">
            Track rent obligations, outstanding balances and collection timing
            across active tenancies.
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate("/rent-charges/new")}
          className="flex items-center gap-1.5 rounded-full bg-ink px-4 py-2.5 text-[13px] font-medium text-white transition-all hover:bg-ink/90 active:scale-[0.97]"
        >
          <Plus size={14} strokeWidth={2.2} />
          New charge
        </button>
      </div>

      {/* KPI strip */}
      <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          icon={<ReceiptText size={16} strokeWidth={1.8} />}
          label="Total charges"
          value={data ? data.meta.total.toLocaleString() : "—"}
          hint="All matching records"
        />

        <StatCard
          icon={<CircleDollarSign size={16} strokeWidth={1.8} />}
          label="Amount due"
          value={data ? formatMoney(stats.totalDue) : "—"}
          hint="Current page"
        />

        <StatCard
          icon={<AlertCircle size={16} strokeWidth={1.8} />}
          label="Outstanding"
          value={data ? formatMoney(stats.outstanding) : "—"}
          hint={`${stats.overdueCount} overdue on page`}
          tone={stats.outstanding > 0 ? "warn" : "default"}
        />

        <StatCard
          icon={<CalendarClock size={16} strokeWidth={1.8} />}
          label="Due today"
          value={data ? stats.dueTodayCount.toLocaleString() : "—"}
          hint={
            stats.dueTodayCount > 0
              ? `${stats.dueTodayCount} charge${stats.dueTodayCount === 1 ? "" : "s"}`
              : "Nothing due today"
          }
        />
      </div>

      {/* Collection snapshot */}
      <section className="mb-5 overflow-hidden rounded-3xl bg-ink text-white">
        <div className="grid lg:grid-cols-[1.3fr_1fr_1fr_1fr]">
          <div className="border-b border-white/10 px-5 py-5 lg:border-b-0 lg:border-r sm:px-6">
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/45">
              Collection snapshot
            </p>

            <div className="mt-2 flex items-end gap-2">
              <p className="text-[25px] font-bold tracking-[-0.02em]">
                {data ? formatMoney(stats.outstanding) : "—"}
              </p>
              <span className="mb-1 text-[11px] text-white/40">
                outstanding
              </span>
            </div>

            <p className="mt-1 text-[12px] text-white/45">
              Based on charges currently in view
            </p>
          </div>

          <SnapshotMetric
            label="Overdue"
            value={stats.overdueCount.toString()}
            detail={formatMoney(stats.overdueBalance)}
            alert={stats.overdueCount > 0}
          />

          <SnapshotMetric
            label="Due today"
            value={stats.dueTodayCount.toString()}
            detail="charges"
            alert={stats.dueTodayCount > 0}
          />

          <SnapshotMetric
            label="Settled"
            value={stats.paidCount.toString()}
            detail={`of ${charges.length} shown`}
          />
        </div>
      </section>

      {/* Main table */}
      <section className="rounded-3xl border border-line bg-panel p-4 sm:p-5">
        {/* Toolbar */}
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-[15px] font-semibold text-ink">
              Charge ledger
            </h2>

            <p className="mt-0.5 text-[12px] text-muted">
              {data
                ? `${data.meta.total.toLocaleString()} charge${data.meta.total === 1 ? "" : "s"}`
                : "Loading charges…"}
            </p>
          </div>

          <div className="relative">
            <button
              type="button"
              onClick={() => setFilterOpen((value) => !value)}
              className="flex items-center gap-1.5 rounded-full border border-line bg-white px-3.5 py-2 text-[12.5px] font-medium capitalize text-ink/80 transition-colors hover:bg-page/60"
            >
              {status === "all" ? "Any status" : status}
              <ChevronDown size={13} strokeWidth={2} />
            </button>

            {filterOpen && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setFilterOpen(false)}
                />

                <div className="animate-scale-in absolute right-0 top-11 z-20 w-40 origin-top-right rounded-2xl border border-line bg-white p-1.5 shadow-[0_12px_28px_rgba(20,18,45,0.12)]">
                  {(
                    [
                      "all",
                      "unpaid",
                      "partial",
                      "paid",
                      "waived",
                    ] as StatusFilter[]
                  ).map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => {
                        setStatus(option);
                        setFilterOpen(false);
                      }}
                      className={[
                        "flex w-full items-center justify-between rounded-xl px-2.5 py-2 text-left text-[12.5px] capitalize transition-colors",
                        status === option
                          ? "bg-violet-pale text-violet"
                          : "text-ink/80 hover:bg-page/70",
                      ].join(" ")}
                    >
                      {option === "all" ? "Any status" : option}

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

        {loading && (
          <div className="space-y-2">
            {Array.from({ length: 7 }).map((_, index) => (
              <div
                key={index}
                className="h-[62px] animate-pulse rounded-2xl bg-page"
              />
            ))}
          </div>
        )}

        {error && (
          <div className="rounded-2xl border border-dashed border-line bg-page/30 px-5 py-10 text-center">
            <p className="text-[13px] text-muted">{error}</p>

            <button
              type="button"
              onClick={() => refetch()}
              className="mt-3 text-[13px] font-semibold text-violet hover:underline"
            >
              Try again
            </button>
          </div>
        )}

        {!loading && !error && (
          <>
            {charges.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-line bg-page/30 px-5 py-14 text-center">
                <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-muted shadow-sm ring-1 ring-line">
                  <ReceiptText size={18} strokeWidth={1.7} />
                </div>

                <p className="mt-3 text-[13px] font-semibold text-ink">
                  {status !== "all"
                    ? "No charges match this filter"
                    : "No rent charges yet"}
                </p>

                <p className="mx-auto mt-1 max-w-[360px] text-[12px] leading-5 text-muted">
                  {status !== "all"
                    ? "Try another status filter to see more charge records."
                    : "Create a rent charge to start tracking tenant obligations."}
                </p>
              </div>
            ) : (
              <div className="no-scrollbar overflow-x-auto">
                <table className="w-full min-w-[980px] border-collapse text-left">
                  <thead>
                    <tr className="border-b border-line text-[11px] font-semibold uppercase tracking-[0.08em] text-muted">
                      <th className="pb-3 pr-5 font-semibold">Tenant</th>
                      <th className="pb-3 pr-5 font-semibold">Unit</th>
                      <th className="pb-3 pr-5 font-semibold">Period</th>
                      <th className="pb-3 pr-5 font-semibold">Due</th>
                      <th className="pb-3 pr-5 text-right font-semibold">
                        Amount
                      </th>
                      <th className="pb-3 pr-5 text-right font-semibold">
                        Balance
                      </th>
                      <th className="pb-3 pr-5 font-semibold">Timing</th>
                      <th className="pb-3 pr-5 text-right font-semibold">
                        Status
                      </th>
                      <th className="w-10 pb-3" />
                    </tr>
                  </thead>

                  <tbody>
                    {charges.map((charge) => {
                      const isOverdue = charge.timing === "overdue";
                      const isDueToday = charge.timing === "due_today";

                      return (
                        <tr
                          key={charge.id}
                          className="border-b border-line/70 transition-colors last:border-0 hover:bg-page/35"
                        >
                          {/* Tenant */}
                          <td className="py-4 pr-5">
                            <div className="flex items-center gap-3">
                              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-violet-pale text-[11px] font-bold text-violet">
                                {getInitials(charge.tenant?.full_name)}
                              </div>

                              <div className="min-w-0">
                                <p className="truncate text-[13px] font-semibold text-ink">
                                  {charge.tenant?.full_name ??
                                    `Tenant #${charge.tenant_id}`}
                                </p>

                                {charge.tenant?.phone && (
                                  <p className="mt-0.5 text-[11px] text-muted">
                                    {charge.tenant.phone}
                                  </p>
                                )}
                              </div>
                            </div>
                          </td>

                          {/* Unit */}
                          <td className="py-4 pr-5">
                            <span className="inline-flex rounded-lg bg-page px-2.5 py-1 text-[11.5px] font-medium text-ink/75">
                              {charge.unit?.code ?? `#${charge.unit_id}`}
                            </span>
                          </td>

                          {/* Period */}
                          <td className="py-4 pr-5">
                            <p className="text-[12.5px] font-medium text-ink">
                              {charge.period_start}
                            </p>
                            <p className="mt-0.5 text-[11px] text-muted">
                              to {charge.period_end}
                            </p>
                          </td>

                          {/* Due */}
                          <td className="py-4 pr-5">
                            <p
                              className={[
                                "text-[12.5px] font-medium",
                                isOverdue
                                  ? "text-rose-600"
                                  : isDueToday
                                    ? "text-warn-text"
                                    : "text-ink/75",
                              ].join(" ")}
                            >
                              {charge.due_date}
                            </p>
                          </td>

                          {/* Amount */}
                          <td className="py-4 pr-5 text-right">
                            <span className="text-[13px] font-semibold text-ink">
                              {formatMoney(charge.amount_due)}
                            </span>
                          </td>

                          {/* Balance */}
                          <td className="py-4 pr-5 text-right">
                            <span
                              className={[
                                "text-[13px] font-semibold",
                                Number(charge.balance) > 0
                                  ? "text-ink"
                                  : "text-muted",
                              ].join(" ")}
                            >
                              {formatMoney(charge.balance)}
                            </span>
                          </td>

                          {/* Timing */}
                          <td className="py-4 pr-5">
                            <div className="flex items-center gap-1.5">
                              {isOverdue && (
                                <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
                              )}

                              {isDueToday && (
                                <span className="h-1.5 w-1.5 rounded-full bg-warn-text" />
                              )}

                              <span
                                className={[
                                  "text-[12px]",
                                  isOverdue
                                    ? "font-medium text-rose-600"
                                    : isDueToday
                                      ? "font-medium text-warn-text"
                                      : "text-ink/65",
                                ].join(" ")}
                              >
                                {timingLabel[charge.timing] ?? charge.timing}
                              </span>

                              {charge.days_overdue > 0 &&
                                charge.timing === "overdue" && (
                                  <span className="text-[10.5px] text-rose-500">
                                    {charge.days_overdue}d
                                  </span>
                                )}
                            </div>
                          </td>

                          {/* Status */}
                          <td className="py-4 pr-5 text-right">
                            <span
                              className={[
                                "inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-medium capitalize",
                                statusStyles[charge.status] ??
                                  "bg-page text-ink/60",
                              ].join(" ")}
                            >
                              {charge.status}
                            </span>
                          </td>

                          {/* Actions */}
                          <td className="py-4 text-right">
                            <RentChargeRowActions
                              charge={charge}
                              onChanged={refetch}
                            />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination */}
            {data && data.meta.total > 0 && (
              <div className="mt-4 flex items-center justify-between border-t border-line pt-4">
                <p className="text-[12px] text-muted">
                  Page {data.meta.current_page} of {lastPage}
                </p>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={page <= 1}
                    onClick={() =>
                      setPage((current) => Math.max(1, current - 1))
                    }
                    className="flex h-8 w-8 items-center justify-center rounded-full border border-line text-ink/70 transition-colors hover:bg-page/60 disabled:cursor-not-allowed disabled:opacity-40"
                    aria-label="Previous page"
                  >
                    <ChevronLeft size={15} strokeWidth={2} />
                  </button>

                  <button
                    type="button"
                    disabled={page >= lastPage}
                    onClick={() =>
                      setPage((current) => Math.min(lastPage, current + 1))
                    }
                    className="flex h-8 w-8 items-center justify-center rounded-full border border-line text-ink/70 transition-colors hover:bg-page/60 disabled:cursor-not-allowed disabled:opacity-40"
                    aria-label="Next page"
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
  hint,
  tone = "default",
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  hint: string;
  tone?: "default" | "warn";
}) {
  return (
    <div className="rounded-3xl border border-line bg-panel p-4">
      <div className="flex items-center justify-between gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-page text-muted">
          {icon}
        </div>

        {tone === "warn" && (
          <span className="h-1.5 w-1.5 rounded-full bg-warn-text" />
        )}
      </div>

      <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted">
        {label}
      </p>

      <p className="mt-1 truncate text-[18px] font-bold tracking-[-0.02em] text-ink">
        {value}
      </p>

      <p className="mt-1 truncate text-[11px] text-muted">{hint}</p>
    </div>
  );
}

function SnapshotMetric({
  label,
  value,
  detail,
  alert = false,
}: {
  label: string;
  value: string;
  detail: string;
  alert?: boolean;
}) {
  return (
    <div className="border-b border-white/10 px-5 py-5 last:border-b-0 sm:px-6 lg:border-b-0 lg:border-r">
      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">
        {label}
      </p>

      <p
        className={[
          "mt-2 text-[21px] font-bold",
          alert ? "text-white" : "text-white/90",
        ].join(" ")}
      >
        {value}
      </p>

      <p className="mt-0.5 text-[11px] text-white/40">{detail}</p>
    </div>
  );
}

function getInitials(name?: string | null) {
  if (!name) return "—";

  const parts = name.trim().split(/\s+/);

  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}
