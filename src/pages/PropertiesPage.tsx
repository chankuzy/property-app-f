import { useEffect, useMemo, useState } from "react";
import {
  Building2,
  Check,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Plus,
  Search,
  SlidersHorizontal,
  Sparkles,
  Warehouse,
} from "lucide-react";
import { useProperties } from "../hooks/useProperties";
import { useRoute } from "../lib/router";
import PropertyRowActions from "../components/properties/PropertyRowActions";

const PER_PAGE = 10;
type StatusFilter = "all" | "active" | "inactive";

export default function PropertiesPage() {
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

  const { data, loading, error, refetch } = useProperties({
    per_page: PER_PAGE,
    page,
    search: search || undefined,
    is_active: status === "all" ? undefined : status === "active",
  });

  const properties = data?.data ?? [];
  const lastPage = data?.meta.last_page ?? 1;

  const portfolioStats = useMemo(() => {
    const active = properties.filter((property) => property.is_active).length;
    const inactive = properties.length - active;
    const units = properties.reduce(
      (total, property) => total + (property.units_count ?? 0),
      0,
    );

    return {
      active,
      inactive,
      units,
    };
  }, [properties]);

  return (
    <div className="animate-fade-up space-y-5">
      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-violet">
            <span className="h-1.5 w-1.5 rounded-full bg-violet" />
            Portfolio
          </div>

          <h1 className="text-[28px] font-bold tracking-[-0.035em] text-ink sm:text-[32px]">
            Properties
          </h1>

          <p className="mt-1 max-w-xl text-[13px] leading-5 text-muted">
            Manage your property portfolio, locations, ownership and unit
            inventory.
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate("/properties/new")}
          className="group inline-flex h-11 items-center justify-center gap-2 rounded-full bg-ink px-5 text-[13px] font-semibold text-white shadow-[0_8px_24px_rgba(22,22,29,0.14)] transition-all hover:-translate-y-0.5 hover:bg-ink/90 active:translate-y-0"
        >
          <Plus size={15} strokeWidth={2.4} />
          Add property
          <span className="ml-0.5 text-white/45 transition-transform group-hover:translate-x-0.5">
            →
          </span>
        </button>
      </div>

      {/* Portfolio summary */}
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <SummaryCard
          icon={Building2}
          label="Total properties"
          value={data?.meta.total ?? "—"}
          detail="Across your portfolio"
          accent="violet"
        />

        <SummaryCard
          icon={Sparkles}
          label="Active"
          value={data ? portfolioStats.active : "—"}
          detail="Currently operational"
          accent="green"
        />

        <SummaryCard
          icon={Warehouse}
          label="Inactive"
          value={data ? portfolioStats.inactive : "—"}
          detail="Not currently active"
          accent="amber"
        />

        <SummaryCard
          icon={Building2}
          label="Units in view"
          value={data ? portfolioStats.units : "—"}
          detail={
            data
              ? `Across ${properties.length} shown properties`
              : "Loading portfolio"
          }
          accent="neutral"
        />
      </div>

      {/* Main table */}
      <section className="overflow-hidden rounded-[26px] border border-line bg-panel shadow-[0_12px_40px_rgba(30,27,55,0.035)]">
        {/* Toolbar */}
        <div className="border-b border-line px-4 py-4 sm:px-5">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-[15px] font-semibold text-ink">
                Property portfolio
              </h2>
              <p className="mt-0.5 text-[12px] text-muted">
                {data
                  ? `${data.meta.total} properties found`
                  : "Loading properties…"}
              </p>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <div className="flex h-10 min-w-0 items-center gap-2 rounded-full border border-line bg-page/45 px-3.5 transition-colors focus-within:border-violet/40 focus-within:bg-white">
                <Search
                  size={14}
                  strokeWidth={2}
                  className="shrink-0 text-muted"
                />
                <input
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Search properties..."
                  className="w-full bg-transparent text-[12.5px] text-ink placeholder:text-muted focus:outline-none sm:w-52"
                />
              </div>

              <div className="relative">
                <button
                  type="button"
                  onClick={() => setFilterOpen((v) => !v)}
                  className={[
                    "flex h-10 items-center justify-center gap-2 rounded-full border px-3.5 text-[12.5px] font-medium transition-colors",
                    status === "all"
                      ? "border-line bg-white text-ink/75 hover:bg-page/60"
                      : "border-violet/25 bg-violet-pale text-violet",
                  ].join(" ")}
                >
                  <SlidersHorizontal size={13} strokeWidth={2} />
                  {status === "all"
                    ? "All properties"
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

                    <div className="animate-scale-in absolute right-0 top-12 z-20 w-44 origin-top-right rounded-2xl border border-line bg-white p-1.5 shadow-[0_18px_45px_rgba(20,18,45,0.14)]">
                      {(["all", "active", "inactive"] as StatusFilter[]).map(
                        (option) => (
                          <button
                            key={option}
                            type="button"
                            onClick={() => {
                              setStatus(option);
                              setFilterOpen(false);
                            }}
                            className={[
                              "flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-[12.5px] capitalize transition-colors",
                              status === option
                                ? "bg-page font-medium text-ink"
                                : "text-ink/70 hover:bg-page/70",
                            ].join(" ")}
                          >
                            {option === "all" ? "All properties" : option}

                            {status === option && (
                              <Check
                                size={13}
                                strokeWidth={2.3}
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
        </div>

        {/* Loading */}
        {loading && (
          <div className="p-4 sm:p-5">
            <div className="space-y-2">
              {Array.from({ length: 7 }).map((_, index) => (
                <div
                  key={index}
                  className="h-[66px] animate-pulse rounded-2xl bg-page/70"
                />
              ))}
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="px-5 py-16 text-center">
            <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-2xl bg-warn-bg text-warn-text">
              <Building2 size={18} strokeWidth={1.8} />
            </div>

            <p className="mt-3 text-[13px] font-medium text-ink">
              We couldn't load your properties
            </p>

            <p className="mt-1 text-[12px] text-muted">{error}</p>

            <button
              type="button"
              onClick={refetch}
              className="mt-4 rounded-full bg-ink px-4 py-2 text-[12px] font-medium text-white hover:bg-ink/90"
            >
              Try again
            </button>
          </div>
        )}

        {/* Data */}
        {!loading && !error && (
          <>
            <div className="no-scrollbar overflow-x-auto">
              <table className="w-full min-w-[820px] border-collapse text-left">
                <thead>
                  <tr className="bg-page/35 text-[10.5px] font-semibold uppercase tracking-[0.08em] text-muted">
                    <th className="px-5 py-3.5 font-semibold">Property</th>
                    <th className="px-4 py-3.5 font-semibold">Location</th>
                    <th className="px-4 py-3.5 font-semibold">Type</th>
                    <th className="px-4 py-3.5 font-semibold">Owner</th>
                    <th className="px-4 py-3.5 text-center font-semibold">
                      Units
                    </th>
                    <th className="px-4 py-3.5 font-semibold">Status</th>
                    <th className="w-14 px-4 py-3.5" />
                  </tr>
                </thead>

                <tbody>
                  {properties.length === 0 && (
                    <tr>
                      <td colSpan={7}>
                        <div className="flex min-h-[280px] flex-col items-center justify-center px-6 text-center">
                          <div className="flex h-14 w-14 items-center justify-center rounded-[20px] bg-violet-pale text-violet">
                            <Building2 size={23} strokeWidth={1.7} />
                          </div>

                          <h3 className="mt-4 text-[14px] font-semibold text-ink">
                            {search || status !== "all"
                              ? "No properties match your filters"
                              : "Your portfolio is empty"}
                          </h3>

                          <p className="mt-1 max-w-sm text-[12px] leading-5 text-muted">
                            {search || status !== "all"
                              ? "Try changing your search or status filter."
                              : "Add your first property to start building your portfolio."}
                          </p>

                          {!search && status === "all" && (
                            <button
                              type="button"
                              onClick={() => navigate("/properties/new")}
                              className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-ink px-4 py-2 text-[12px] font-medium text-white hover:bg-ink/90"
                            >
                              <Plus size={13} strokeWidth={2.2} />
                              Add property
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}

                  {properties.map((property) => (
                    <tr
                      key={property.id}
                      onClick={() => navigate(`/properties/${property.id}`)}
                      className="group cursor-pointer border-t border-line/70 text-[13px] transition-colors hover:bg-violet-pale/25"
                    >
                      {/* Property */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[14px] bg-page text-ink transition-colors group-hover:bg-violet-pale group-hover:text-violet">
                            <Building2 size={17} strokeWidth={1.7} />
                          </div>

                          <div className="min-w-0">
                            <p className="truncate font-semibold text-ink">
                              {property.name}
                            </p>

                            {property.code && (
                              <p className="mt-0.5 text-[11.5px] text-muted">
                                {property.code}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Location */}
                      <td className="px-4 py-4">
                        {property.city || property.state ? (
                          <div className="flex items-center gap-1.5 text-ink/75">
                            <MapPin
                              size={13}
                              strokeWidth={1.8}
                              className="shrink-0 text-muted"
                            />
                            <span className="truncate">
                              {[property.city, property.state]
                                .filter(Boolean)
                                .join(", ")}
                            </span>
                          </div>
                        ) : (
                          <span className="text-muted">—</span>
                        )}
                      </td>

                      {/* Type */}
                      <td className="px-4 py-4">
                        <span className="capitalize text-ink/70">
                          {property.type ?? "—"}
                        </span>
                      </td>

                      {/* Owner */}
                      <td className="max-w-[180px] px-4 py-4">
                        <span className="block truncate text-ink/75">
                          {property.owner_name ?? "—"}
                        </span>
                      </td>

                      {/* Units */}
                      <td className="px-4 py-4 text-center">
                        <span className="inline-flex min-w-8 items-center justify-center rounded-lg bg-page px-2 py-1 font-semibold tabular-nums text-ink">
                          {property.units_count ?? "—"}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="px-4 py-4">
                        <span
                          className={[
                            "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-[11px] font-semibold",
                            property.is_active
                              ? "bg-good-bg text-good-text"
                              : "bg-warn-bg text-warn-text",
                          ].join(" ")}
                        >
                          <span
                            className={[
                              "h-1.5 w-1.5 rounded-full",
                              property.is_active
                                ? "bg-good-text"
                                : "bg-warn-text",
                            ].join(" ")}
                          />
                          {property.is_active ? "Active" : "Inactive"}
                        </span>
                      </td>

                      {/* Actions */}
                      <td
                        className="px-4 py-4 text-right"
                        onClick={(event) => event.stopPropagation()}
                      >
                        <PropertyRowActions
                          property={property}
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
                    onClick={() =>
                      setPage((current) => Math.max(1, current - 1))
                    }
                    className="flex h-8 w-8 items-center justify-center rounded-full border border-line bg-white text-ink/70 transition-all hover:border-violet/25 hover:bg-violet-pale hover:text-violet disabled:cursor-not-allowed disabled:opacity-35"
                    aria-label="Previous page"
                  >
                    <ChevronLeft size={14} strokeWidth={2} />
                  </button>

                  <button
                    type="button"
                    disabled={page >= lastPage}
                    onClick={() =>
                      setPage((current) => Math.min(lastPage, current + 1))
                    }
                    className="flex h-8 w-8 items-center justify-center rounded-full border border-line bg-white text-ink/70 transition-all hover:border-violet/25 hover:bg-violet-pale hover:text-violet disabled:cursor-not-allowed disabled:opacity-35"
                    aria-label="Next page"
                  >
                    <ChevronRight size={14} strokeWidth={2} />
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

function SummaryCard({
  icon: Icon,
  label,
  value,
  detail,
  accent,
}: {
  icon: typeof Building2;
  label: string;
  value: string | number;
  detail: string;
  accent: "violet" | "green" | "amber" | "neutral";
}) {
  const iconClass = {
    violet: "bg-violet-pale text-violet",
    green: "bg-good-bg text-good-text",
    amber: "bg-warn-bg text-warn-text",
    neutral: "bg-page text-ink/60",
  }[accent];

  return (
    <div className="rounded-[22px] border border-line bg-panel p-4 shadow-[0_8px_28px_rgba(30,27,55,0.025)] sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-medium text-muted">{label}</p>
          <p className="mt-2 text-[24px] font-bold tracking-[-0.04em] text-ink">
            {value}
          </p>
        </div>

        <div
          className={`flex h-9 w-9 items-center justify-center rounded-xl ${iconClass}`}
        >
          <Icon size={16} strokeWidth={1.8} />
        </div>
      </div>

      <p className="mt-2 truncate text-[11px] text-muted">{detail}</p>
    </div>
  );
}