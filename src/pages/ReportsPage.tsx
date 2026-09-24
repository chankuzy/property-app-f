import { useState } from "react";
import {
  BarChart3,
  CalendarRange,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Download,
  FileBarChart,
  Home,
  ReceiptText,
  Users,
} from "lucide-react";
import {
  useOccupancyReport,
  useRentCollectionReport,
  useOutstandingRentReport,
  useOverdueRentReport,
  useExpiringTenanciesReport,
  useTenantsReport,
  usePropertySummaryReport,
} from "../hooks/useReports";
import { apiDownload, ApiError } from "../lib/api";
import { showToast } from "../lib/toast";
import ReportView from "../components/reports/ReportView";

type Tab =
  | "occupancy"
  | "rent-collection"
  | "outstanding-rent"
  | "overdue-rent"
  | "expiring-tenancies"
  | "tenants"
  | "property-summary";

type ReportDefinition = {
  key: Tab;
  label: string;
  description: string;
  icon: React.ReactNode;
};

const reports: ReportDefinition[] = [
  {
    key: "occupancy",
    label: "Occupancy",
    description: "Unit occupancy and availability",
    icon: <Home size={16} strokeWidth={1.8} />,
  },
  {
    key: "rent-collection",
    label: "Rent collection",
    description: "Collections across a date range",
    icon: <ReceiptText size={16} strokeWidth={1.8} />,
  },
  {
    key: "outstanding-rent",
    label: "Outstanding rent",
    description: "Open rent balances",
    icon: <BarChart3 size={16} strokeWidth={1.8} />,
  },
  {
    key: "overdue-rent",
    label: "Overdue rent",
    description: "Past-due rent obligations",
    icon: <FileBarChart size={16} strokeWidth={1.8} />,
  },
  {
    key: "expiring-tenancies",
    label: "Expiring tenancies",
    description: "Leases approaching expiry",
    icon: <CalendarRange size={16} strokeWidth={1.8} />,
  },
  {
    key: "tenants",
    label: "Tenants",
    description: "Tenant portfolio overview",
    icon: <Users size={16} strokeWidth={1.8} />,
  },
  {
    key: "property-summary",
    label: "Property summary",
    description: "Portfolio-level property data",
    icon: <ClipboardList size={16} strokeWidth={1.8} />,
  },
];

export default function ReportsPage() {
  const [tab, setTab] = useState<Tab>("occupancy");

  const activeReport =
    reports.find((report) => report.key === tab) ?? reports[0];

  return (
    <div className="animate-fade-up">
      {/* Header */}
      <div className="mb-6">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">
          Intelligence
        </p>

        <h1 className="mt-1 text-[22px] font-bold tracking-[-0.02em] text-ink sm:text-[25px]">
          Reports
        </h1>

        <p className="mt-1 max-w-[600px] text-[13px] leading-5 text-muted">
          Understand occupancy, collections, lease health and your overall
          property portfolio from one place.
        </p>
      </div>

      {/* Report navigation */}
      <div className="mb-5 grid gap-2 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
        {reports.map((report) => {
          const active = report.key === tab;

          return (
            <button
              key={report.key}
              type="button"
              onClick={() => setTab(report.key)}
              className={[
                "group rounded-2xl border p-3 text-left transition-all",
                active
                  ? "border-ink bg-ink text-white shadow-[0_8px_24px_rgba(20,18,45,0.10)]"
                  : "border-line bg-panel text-ink hover:border-violet-soft hover:bg-violet-pale/40",
              ].join(" ")}
            >
              <div
                className={[
                  "flex h-8 w-8 items-center justify-center rounded-xl transition-colors",
                  active
                    ? "bg-white/10 text-white"
                    : "bg-page text-muted group-hover:text-violet",
                ].join(" ")}
              >
                {report.icon}
              </div>

              <p
                className={[
                  "mt-3 text-[12.5px] font-semibold",
                  active ? "text-white" : "text-ink",
                ].join(" ")}
              >
                {report.label}
              </p>

              <p
                className={[
                  "mt-0.5 text-[10.5px] leading-4",
                  active ? "text-white/45" : "text-muted",
                ].join(" ")}
              >
                {report.description}
              </p>
            </button>
          );
        })}
      </div>

      {/* Active report */}
      <section className="overflow-hidden rounded-3xl border border-line bg-panel">
        <div className="border-b border-line px-5 py-5 sm:px-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-violet-pale text-violet">
                {activeReport.icon}
              </div>

              <div>
                <h2 className="text-[16px] font-semibold text-ink">
                  {activeReport.label}
                </h2>

                <p className="mt-0.5 text-[12px] text-muted">
                  {activeReport.description}
                </p>
              </div>
            </div>

            <div className="hidden rounded-full border border-line bg-page/60 px-3 py-1.5 text-[11px] font-medium text-muted sm:block">
              Live report
            </div>
          </div>
        </div>

        <div className="p-4 sm:p-6">
          {tab === "occupancy" && <OccupancyTab />}
          {tab === "rent-collection" && <RentCollectionTab />}
          {tab === "outstanding-rent" && <OutstandingRentTab />}
          {tab === "overdue-rent" && <OverdueRentTab />}
          {tab === "expiring-tenancies" && <ExpiringTenanciesTab />}
          {tab === "tenants" && <TenantsTab />}
          {tab === "property-summary" && <PropertySummaryTab />}
        </div>
      </section>
    </div>
  );
}

function Loading() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="h-24 animate-pulse rounded-2xl bg-page" />
        ))}
      </div>

      <div className="h-48 animate-pulse rounded-2xl bg-page" />
    </div>
  );
}

function ErrorMsg({ message }: { message: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-line bg-page/30 px-5 py-12 text-center">
      <p className="text-[13px] text-muted">{message}</p>
    </div>
  );
}

function OccupancyTab() {
  const { data, loading, error } = useOccupancyReport();

  if (loading) return <Loading />;
  if (error) return <ErrorMsg message={error} />;

  return <ReportView data={data} />;
}

function RentCollectionTab() {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const { data, loading, error } = useRentCollectionReport({
    from: from || undefined,
    to: to || undefined,
  });

  return (
    <div>
      <div className="mb-5 rounded-2xl border border-line bg-page/40 p-4">
        <div className="mb-3">
          <p className="text-[12.5px] font-semibold text-ink">
            Reporting period
          </p>
          <p className="mt-0.5 text-[11.5px] text-muted">
            Choose a date range to narrow the collection report.
          </p>
        </div>

        <div className="flex flex-wrap items-end gap-3">
          <DateField label="From" value={from} onChange={setFrom} />

          <DateField label="To" value={to} onChange={setTo} />

          {(from || to) && (
            <button
              type="button"
              onClick={() => {
                setFrom("");
                setTo("");
              }}
              className="mb-0.5 rounded-full px-3 py-2 text-[12px] font-medium text-muted transition-colors hover:bg-white hover:text-ink"
            >
              Clear dates
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <Loading />
      ) : error ? (
        <ErrorMsg message={error} />
      ) : (
        <ReportView data={data} />
      )}
    </div>
  );
}

function OutstandingRentTab() {
  const { data, loading, error } = useOutstandingRentReport();

  if (loading) return <Loading />;
  if (error) return <ErrorMsg message={error} />;

  return <ReportView data={data} />;
}

function OverdueRentTab() {
  const [page, setPage] = useState(1);
  const [downloading, setDownloading] = useState(false);

  const { data, loading, error } = useOverdueRentReport({
    page,
    per_page: 15,
  });

  const meta = data?.meta as
    | { current_page?: number; last_page?: number }
    | undefined;

  const lastPage = meta?.last_page ?? 1;

  async function downloadCsv() {
    setDownloading(true);

    try {
      await apiDownload("/reports/overdue-rent", "overdue-rent.csv", {
        format: "csv",
      });

      showToast("Overdue rent report downloaded.", "success");
    } catch (err) {
      showToast(
        err instanceof ApiError
          ? err.message
          : "Could not download the report.",
        "error",
      );
    } finally {
      setDownloading(false);
    }
  }

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-line bg-page/40 p-3.5">
        <div>
          <p className="text-[12.5px] font-semibold text-ink">
            Overdue rent ledger
          </p>

          <p className="mt-0.5 text-[11.5px] text-muted">
            Review past-due charges or export the complete report.
          </p>
        </div>

        <button
          type="button"
          disabled={downloading}
          onClick={downloadCsv}
          className="flex items-center gap-1.5 rounded-full bg-ink px-3.5 py-2 text-[12px] font-medium text-white transition-all hover:bg-ink/90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Download size={14} strokeWidth={1.8} />

          {downloading ? "Downloading…" : "Export full CSV"}
        </button>
      </div>

      {loading ? (
        <Loading />
      ) : error ? (
        <ErrorMsg message={error} />
      ) : (
        <>
          <ReportView data={data} />

          {meta?.last_page && meta.last_page > 1 && (
            <Pagination
              page={meta.current_page ?? page}
              lastPage={lastPage}
              onPrevious={() => setPage((current) => Math.max(1, current - 1))}
              onNext={() =>
                setPage((current) => Math.min(lastPage, current + 1))
              }
            />
          )}
        </>
      )}
    </div>
  );
}

function ExpiringTenanciesTab() {
  const { data, loading, error } = useExpiringTenanciesReport();

  if (loading) return <Loading />;
  if (error) return <ErrorMsg message={error} />;

  return <ReportView data={data} />;
}

function TenantsTab() {
  const { data, loading, error } = useTenantsReport();

  if (loading) return <Loading />;
  if (error) return <ErrorMsg message={error} />;

  return <ReportView data={data} />;
}

function PropertySummaryTab() {
  const { data, loading, error } = usePropertySummaryReport();

  if (loading) return <Loading />;
  if (error) return <ErrorMsg message={error} />;

  return <ReportView data={data} />;
}

function DateField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="text-[11.5px] font-semibold text-ink/75">
      {label}

      <input
        type="date"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-1.5 block rounded-xl border border-line bg-white px-3.5 py-2 text-[12.5px] font-normal text-ink transition-shadow focus:outline-none focus:ring-2 focus:ring-violet-soft"
      />
    </label>
  );
}

function Pagination({
  page,
  lastPage,
  onPrevious,
  onNext,
}: {
  page: number;
  lastPage: number;
  onPrevious: () => void;
  onNext: () => void;
}) {
  return (
    <div className="mt-5 flex items-center justify-between border-t border-line pt-4">
      <p className="text-[12px] text-muted">
        Page {page} of {lastPage}
      </p>

      <div className="flex items-center gap-2">
        <button
          type="button"
          disabled={page <= 1}
          onClick={onPrevious}
          className="flex h-8 w-8 items-center justify-center rounded-full border border-line text-ink/70 transition-colors hover:bg-page/60 disabled:cursor-not-allowed disabled:opacity-40"
          aria-label="Previous page"
        >
          <ChevronLeft size={15} strokeWidth={2} />
        </button>

        <button
          type="button"
          disabled={page >= lastPage}
          onClick={onNext}
          className="flex h-8 w-8 items-center justify-center rounded-full border border-line text-ink/70 transition-colors hover:bg-page/60 disabled:cursor-not-allowed disabled:opacity-40"
          aria-label="Next page"
        >
          <ChevronRight size={15} strokeWidth={2} />
        </button>
      </div>
    </div>
  );
}
