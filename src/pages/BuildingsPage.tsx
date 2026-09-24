// src/pages/BuildingsPage.tsx
import { useEffect, useMemo, useState } from "react";
import {
  Plus,
  Layers,
  ChevronLeft,
  ChevronRight,
  Check,
  ChevronDown,
  Building2,
  Home,
  BarChart3,
} from "lucide-react";
import { useBuildings } from "../hooks/useBuildings";
import { useAllProperties } from "../hooks/useProperties";
import { useRoute } from "../lib/router";
import BuildingRowActions from "../components/buildings/BuildingRowActions";

const PER_PAGE = 10;

export default function BuildingsPage() {
  const { navigate } = useRoute();
  const [propertyId, setPropertyId] = useState<number | undefined>(undefined);
  const [page, setPage] = useState(1);
  const [filterOpen, setFilterOpen] = useState(false);

  const { data: propertiesData } = useAllProperties();
  const properties = propertiesData?.data ?? [];

  useEffect(() => {
    setPage(1);
  }, [propertyId]);

  const { data, loading, error, refetch } = useBuildings({
    per_page: PER_PAGE,
    page,
    property_id: propertyId,
  });

  const buildings = data?.data ?? [];
  const lastPage = data?.meta.last_page ?? 1;
  const activePropertyName = properties.find((p) => p.id === propertyId)?.name;

  const stats = useMemo(() => {
    const units = buildings.reduce(
      (sum, building) => sum + (building.units_count ?? 0),
      0,
    );
    const floors = buildings.reduce(
      (sum, building) => sum + (building.floors_count ?? 0),
      0,
    );

    return {
      buildings: data?.meta.total ?? 0,
      units,
      floors,
    };
  }, [buildings, data]);

  return (
    <div className="animate-fade-up">
      {/* Header */}
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-violet">
            Portfolio
          </p>

          <h1 className="text-[24px] font-bold tracking-[-0.03em] text-ink sm:text-[28px]">
            Buildings
          </h1>

          <p className="mt-1.5 max-w-xl text-[13px] leading-5 text-muted">
            Manage the buildings within your property portfolio and keep their
            unit structure organized.
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate("/buildings/new")}
          className="flex items-center gap-2 rounded-full bg-ink px-4.5 py-2.5 text-[13px] font-medium text-white shadow-sm transition-all hover:-translate-y-0.5 hover:bg-ink/90 active:translate-y-0"
        >
          <Plus size={15} strokeWidth={2.2} />
          Add building
        </button>
      </div>

      {/* Summary */}
      <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <SummaryCard
          icon={Building2}
          label={propertyId ? "Buildings in property" : "Total buildings"}
          value={loading ? "—" : stats.buildings.toLocaleString()}
          detail={activePropertyName ?? "Across your portfolio"}
        />

        <SummaryCard
          icon={Home}
          label="Units represented"
          value={loading ? "—" : stats.units.toLocaleString()}
          detail="From the current page"
        />

        <SummaryCard
          icon={BarChart3}
          label="Floors represented"
          value={loading ? "—" : stats.floors.toLocaleString()}
          detail="From the current page"
        />
      </div>

      {/* Main table */}
      <section className="overflow-hidden rounded-[26px] border border-line bg-panel">
        {/* Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-4 py-3.5 sm:px-5">
          <div>
            <p className="text-[13px] font-semibold text-ink">
              Building directory
            </p>
            <p className="mt-0.5 text-[11.5px] text-muted">
              {data
                ? `${data.meta.total.toLocaleString()} building${data.meta.total === 1 ? "" : "s"}`
                : "Loading buildings…"}
            </p>
          </div>

          <div className="relative">
            <button
              type="button"
              onClick={() => setFilterOpen((v) => !v)}
              className={[
                "flex items-center gap-2 rounded-full border px-3.5 py-2 text-[12.5px] font-medium transition-all",
                propertyId
                  ? "border-violet-soft bg-violet-pale text-violet"
                  : "border-line bg-white text-ink/75 hover:bg-page/60",
              ].join(" ")}
            >
              <span className="max-w-[170px] truncate">
                {activePropertyName ?? "All properties"}
              </span>
              <ChevronDown
                size={13}
                strokeWidth={2}
                className={
                  filterOpen
                    ? "rotate-180 transition-transform"
                    : "transition-transform"
                }
              />
            </button>

            {filterOpen && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setFilterOpen(false)}
                />

                <div className="animate-scale-in no-scrollbar absolute right-0 top-11 z-20 max-h-72 w-60 origin-top-right overflow-y-auto rounded-2xl border border-line bg-white p-1.5 shadow-[0_16px_40px_rgba(20,18,45,0.14)]">
                  <button
                    type="button"
                    onClick={() => {
                      setPropertyId(undefined);
                      setFilterOpen(false);
                    }}
                    className={[
                      "flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-[12.5px] transition-colors",
                      propertyId === undefined
                        ? "bg-violet-pale font-medium text-violet"
                        : "text-ink/80 hover:bg-page/70",
                    ].join(" ")}
                  >
                    <span>All properties</span>
                    {propertyId === undefined && (
                      <Check size={13} strokeWidth={2.2} />
                    )}
                  </button>

                  {properties.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => {
                        setPropertyId(p.id);
                        setFilterOpen(false);
                      }}
                      className={[
                        "flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-[12.5px] transition-colors",
                        propertyId === p.id
                          ? "bg-violet-pale font-medium text-violet"
                          : "text-ink/80 hover:bg-page/70",
                      ].join(" ")}
                    >
                      <span className="truncate">{p.name}</span>
                      {propertyId === p.id && (
                        <Check
                          size={13}
                          strokeWidth={2.2}
                          className="shrink-0"
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
          <div className="p-4 sm:p-5">
            <div className="space-y-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="h-[66px] animate-pulse rounded-2xl bg-page"
                />
              ))}
            </div>
          </div>
        )}

        {error && !loading && (
          <div className="px-5 py-14 text-center">
            <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-2xl bg-rose-50 text-rose-500">
              <Layers size={19} strokeWidth={1.8} />
            </div>

            <p className="mt-3 text-[13px] font-medium text-ink">
              Couldn't load buildings
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

        {!loading && !error && (
          <>
            {buildings.length === 0 ? (
              <div className="px-5 py-16 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-[18px] bg-violet-pale text-violet">
                  <Building2 size={22} strokeWidth={1.6} />
                </div>

                <h2 className="mt-4 text-[14px] font-semibold text-ink">
                  {propertyId ? "No buildings here yet" : "No buildings yet"}
                </h2>

                <p className="mx-auto mt-1.5 max-w-sm text-[12.5px] leading-5 text-muted">
                  {propertyId
                    ? "This property does not have any buildings assigned to it yet."
                    : "Add your first building to start organizing properties and their units."}
                </p>

                <button
                  type="button"
                  onClick={() => navigate("/buildings/new")}
                  className="mt-5 inline-flex items-center gap-1.5 rounded-full bg-ink px-4 py-2.5 text-[12.5px] font-medium text-white transition-colors hover:bg-ink/90"
                >
                  <Plus size={14} strokeWidth={2.2} />
                  Add building
                </button>
              </div>
            ) : (
              <>
                <div className="no-scrollbar overflow-x-auto">
                  <table className="w-full min-w-[720px] border-collapse text-left">
                    <thead>
                      <tr className="border-b border-line bg-page/30 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted">
                        <th className="px-5 py-3.5 font-semibold">Building</th>
                        <th className="px-4 py-3.5 font-semibold">Property</th>
                        <th className="px-4 py-3.5 font-semibold">Floors</th>
                        <th className="px-4 py-3.5 font-semibold">Units</th>
                        <th className="w-14 px-4 py-3.5"></th>
                      </tr>
                    </thead>

                    <tbody>
                      {buildings.map((b) => (
                        <tr
                          key={b.id}
                          onClick={() => navigate(`/buildings/${b.id}`)}
                          className="group cursor-pointer border-b border-line/70 text-[13px] transition-colors last:border-b-0 hover:bg-page/35"
                        >
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[13px] bg-violet-pale text-violet transition-transform duration-200 group-hover:scale-105">
                                <Layers size={17} strokeWidth={1.7} />
                              </div>

                              <div className="min-w-0">
                                <p className="truncate font-semibold text-ink">
                                  {b.name}
                                </p>

                                {b.code ? (
                                  <p className="mt-0.5 text-[11.5px] text-muted">
                                    {b.code}
                                  </p>
                                ) : (
                                  <p className="mt-0.5 text-[11.5px] text-muted">
                                    Building
                                  </p>
                                )}
                              </div>
                            </div>
                          </td>

                          <td className="px-4 py-4">
                            <div className="flex items-center gap-2">
                              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-page text-muted">
                                <Building2 size={13} strokeWidth={1.7} />
                              </div>
                              <span className="max-w-[220px] truncate font-medium text-ink/80">
                                {b.property?.name ?? "—"}
                              </span>
                            </div>
                          </td>

                          <td className="px-4 py-4">
                            <span className="inline-flex min-w-10 items-center justify-center rounded-full bg-page px-2.5 py-1 text-[12px] font-medium text-ink/75">
                              {b.floors_count ?? "—"}
                            </span>
                          </td>

                          <td className="px-4 py-4">
                            <span className="font-medium text-ink/80">
                              {b.units_count ?? "—"}
                            </span>
                          </td>

                          <td
                            className="px-4 py-4 text-right"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <BuildingRowActions
                              building={b}
                              onChanged={refetch}
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {data && data.meta.total > 0 && (
                  <div className="flex items-center justify-between border-t border-line px-5 py-3.5">
                    <p className="text-[11.5px] text-muted">
                      Page{" "}
                      <span className="font-medium text-ink/70">
                        {data.meta.current_page}
                      </span>{" "}
                      of{" "}
                      <span className="font-medium text-ink/70">
                        {lastPage}
                      </span>
                    </p>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        disabled={page <= 1}
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        className="flex h-8 w-8 items-center justify-center rounded-full border border-line text-ink/70 transition-colors hover:bg-page/60 disabled:pointer-events-none disabled:opacity-35"
                      >
                        <ChevronLeft size={15} strokeWidth={2} />
                      </button>

                      <button
                        type="button"
                        disabled={page >= lastPage}
                        onClick={() =>
                          setPage((p) => Math.min(lastPage, p + 1))
                        }
                        className="flex h-8 w-8 items-center justify-center rounded-full border border-line text-ink/70 transition-colors hover:bg-page/60 disabled:pointer-events-none disabled:opacity-35"
                      >
                        <ChevronRight size={15} strokeWidth={2} />
                      </button>
                    </div>
                  </div>
                )}
              </>
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
}: {
  icon: typeof Building2;
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <div className="rounded-[22px] border border-line bg-panel p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-pale text-violet">
          <Icon size={16} strokeWidth={1.8} />
        </div>

        <span className="mt-1 h-1.5 w-1.5 rounded-full bg-violet/60" />
      </div>

      <p className="mt-4 text-[11.5px] font-medium text-muted">{label}</p>

      <p className="mt-0.5 text-[21px] font-bold tracking-[-0.025em] text-ink">
        {value}
      </p>

      <p className="mt-0.5 truncate text-[11px] text-muted">{detail}</p>
    </div>
  );
}
