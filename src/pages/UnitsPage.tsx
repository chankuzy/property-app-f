import { useEffect, useMemo, useState } from "react";
import {
  Plus,
  DoorOpen,
  ChevronLeft,
  ChevronRight,
  Check,
  ChevronDown,
  Building2,
  Users,
  Wrench,
} from "lucide-react";
import { useUnits } from "../hooks/useUnits";
import { useAllProperties } from "../hooks/useProperties";
import { useRoute } from "../lib/router";
import UnitRowActions from "../components/units/UnitRowActions";
import type { OccupancyStatus } from "../types";

const PER_PAGE = 10;

type StatusFilter = "all" | OccupancyStatus;

const statusStyles: Record<OccupancyStatus, string> = {
  vacant: "bg-violet-pale text-violet",
  occupied: "bg-good-bg text-good-text",
  reserved: "bg-warn-bg text-warn-text",
  maintenance: "bg-rose-50 text-rose-600",
};

const statusLabels: Record<OccupancyStatus, string> = {
  vacant: "Vacant",
  occupied: "Occupied",
  reserved: "Reserved",
  maintenance: "Maintenance",
};

export default function UnitsPage() {
  const { navigate } = useRoute();

  const [propertyId, setPropertyId] = useState<number | undefined>(undefined);
  const [status, setStatus] = useState<StatusFilter>("all");
  const [page, setPage] = useState(1);
  const [propFilterOpen, setPropFilterOpen] = useState(false);
  const [statusFilterOpen, setStatusFilterOpen] = useState(false);

  const { data: propertiesData } = useAllProperties();
  const properties = propertiesData?.data ?? [];

  useEffect(() => {
    setPage(1);
  }, [propertyId, status]);

  const { data, loading, error, refetch } = useUnits({
    per_page: PER_PAGE,
    page,
    property_id: propertyId,
    status: status === "all" ? undefined : status,
  });

  const units = data?.data ?? [];
  const lastPage = data?.meta.last_page ?? 1;
  const activePropertyName = properties.find((p) => p.id === propertyId)?.name;

  const stats = useMemo(() => {
    const occupied = units.filter((unit) => unit.status === "occupied").length;
    const vacant = units.filter((unit) => unit.status === "vacant").length;
    const reserved = units.filter((unit) => unit.status === "reserved").length;
    const maintenance = units.filter(
      (unit) => unit.status === "maintenance",
    ).length;

    const rent = units.reduce(
      (sum, unit) => sum + (unit.default_rent ? Number(unit.default_rent) : 0),
      0,
    );

    return {
      total: data?.meta.total ?? 0,
      occupied,
      vacant,
      reserved,
      maintenance,
      rent,
    };
  }, [units, data]);

  return (
    <div className="animate-fade-up">
      {/* Header */}
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-violet">
            Portfolio
          </p>

          <h1 className="text-[24px] font-bold tracking-[-0.03em] text-ink sm:text-[28px]">
            Units
          </h1>

          <p className="mt-1.5 max-w-xl text-[13px] leading-5 text-muted">
            Keep track of every unit, its occupancy, rent, and place within your
            portfolio.
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate("/units/new")}
          className="flex items-center gap-2 rounded-full bg-ink px-4.5 py-2.5 text-[13px] font-medium text-white shadow-sm transition-all hover:-translate-y-0.5 hover:bg-ink/90 active:translate-y-0"
        >
          <Plus size={15} strokeWidth={2.2} />
          Add unit
        </button>
      </div>

      {/* Overview */}
      <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <SummaryCard
          icon={DoorOpen}
          label={propertyId ? "Units in property" : "Total units"}
          value={loading ? "—" : stats.total.toLocaleString()}
          detail={activePropertyName ?? "Across your portfolio"}
        />

        <SummaryCard
          icon={Users}
          label="Occupied"
          value={loading ? "—" : stats.occupied.toLocaleString()}
          detail="Current page"
          tone="green"
        />

        <SummaryCard
          icon={Building2}
          label="Vacant"
          value={loading ? "—" : stats.vacant.toLocaleString()}
          detail="Current page"
          tone="violet"
        />

        <SummaryCard
          icon={Wrench}
          label="Maintenance"
          value={loading ? "—" : stats.maintenance.toLocaleString()}
          detail="Current page"
          tone="rose"
        />
      </div>

      {/* Main panel */}
      <section className="overflow-hidden rounded-[26px] border border-line bg-panel">
        {/* Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-4 py-3.5 sm:px-5">
          <div>
            <p className="text-[13px] font-semibold text-ink">Unit directory</p>

            <p className="mt-0.5 text-[11.5px] text-muted">
              {data
                ? `${data.meta.total.toLocaleString()} unit${data.meta.total === 1 ? "" : "s"}`
                : "Loading units…"}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Property filter */}
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setPropFilterOpen((v) => !v);
                  setStatusFilterOpen(false);
                }}
                className={[
                  "flex items-center gap-2 rounded-full border px-3.5 py-2 text-[12.5px] font-medium transition-all",
                  propertyId
                    ? "border-violet-soft bg-violet-pale text-violet"
                    : "border-line bg-white text-ink/75 hover:bg-page/60",
                ].join(" ")}
              >
                <span className="max-w-[150px] truncate">
                  {activePropertyName ?? "All properties"}
                </span>

                <ChevronDown
                  size={13}
                  strokeWidth={2}
                  className={
                    propFilterOpen
                      ? "rotate-180 transition-transform"
                      : "transition-transform"
                  }
                />
              </button>

              {propFilterOpen && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setPropFilterOpen(false)}
                  />

                  <div className="animate-scale-in no-scrollbar absolute right-0 top-11 z-20 max-h-72 w-60 origin-top-right overflow-y-auto rounded-2xl border border-line bg-white p-1.5 shadow-[0_16px_40px_rgba(20,18,45,0.14)]">
                    <FilterOption
                      label="All properties"
                      active={propertyId === undefined}
                      onClick={() => {
                        setPropertyId(undefined);
                        setPropFilterOpen(false);
                      }}
                    />

                    {properties.map((property) => (
                      <FilterOption
                        key={property.id}
                        label={property.name}
                        active={propertyId === property.id}
                        onClick={() => {
                          setPropertyId(property.id);
                          setPropFilterOpen(false);
                        }}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Status filter */}
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setStatusFilterOpen((v) => !v);
                  setPropFilterOpen(false);
                }}
                className={[
                  "flex items-center gap-2 rounded-full border px-3.5 py-2 text-[12.5px] font-medium transition-all",
                  status !== "all"
                    ? "border-violet-soft bg-violet-pale text-violet"
                    : "border-line bg-white text-ink/75 hover:bg-page/60",
                ].join(" ")}
              >
                {status === "all" ? "Any status" : statusLabels[status]}

                <ChevronDown
                  size={13}
                  strokeWidth={2}
                  className={
                    statusFilterOpen
                      ? "rotate-180 transition-transform"
                      : "transition-transform"
                  }
                />
              </button>

              {statusFilterOpen && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setStatusFilterOpen(false)}
                  />

                  <div className="animate-scale-in absolute right-0 top-11 z-20 w-44 origin-top-right rounded-2xl border border-line bg-white p-1.5 shadow-[0_16px_40px_rgba(20,18,45,0.14)]">
                    {(
                      [
                        "all",
                        "vacant",
                        "occupied",
                        "reserved",
                        "maintenance",
                      ] as StatusFilter[]
                    ).map((option) => (
                      <button
                        key={option}
                        type="button"
                        onClick={() => {
                          setStatus(option);
                          setStatusFilterOpen(false);
                        }}
                        className={[
                          "flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-[12.5px] transition-colors",
                          status === option
                            ? "bg-violet-pale font-medium text-violet"
                            : "text-ink/80 hover:bg-page/70",
                        ].join(" ")}
                      >
                        {option === "all" ? "Any status" : statusLabels[option]}

                        {status === option && (
                          <Check size={13} strokeWidth={2.2} />
                        )}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {loading && (
          <div className="p-4 sm:p-5">
            <div className="space-y-2">
              {Array.from({ length: 6 }).map((_, index) => (
                <div
                  key={index}
                  className="h-[68px] animate-pulse rounded-2xl bg-page"
                />
              ))}
            </div>
          </div>
        )}

        {error && !loading && (
          <div className="px-5 py-14 text-center">
            <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-2xl bg-rose-50 text-rose-500">
              <DoorOpen size={19} strokeWidth={1.8} />
            </div>

            <p className="mt-3 text-[13px] font-medium text-ink">
              Couldn't load units
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
            {units.length === 0 ? (
              <div className="px-5 py-16 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-[18px] bg-violet-pale text-violet">
                  <DoorOpen size={22} strokeWidth={1.6} />
                </div>

                <h2 className="mt-4 text-[14px] font-semibold text-ink">
                  {propertyId || status !== "all"
                    ? "No units match"
                    : "No units yet"}
                </h2>

                <p className="mx-auto mt-1.5 max-w-sm text-[12.5px] leading-5 text-muted">
                  {propertyId || status !== "all"
                    ? "Try changing your filters to see more units."
                    : "Add your first unit to start managing occupancy and rent."}
                </p>

                {!propertyId && status === "all" && (
                  <button
                    type="button"
                    onClick={() => navigate("/units/new")}
                    className="mt-5 inline-flex items-center gap-1.5 rounded-full bg-ink px-4 py-2.5 text-[12.5px] font-medium text-white hover:bg-ink/90"
                  >
                    <Plus size={14} strokeWidth={2.2} />
                    Add unit
                  </button>
                )}
              </div>
            ) : (
              <>
                <div className="no-scrollbar overflow-x-auto">
                  <table className="w-full min-w-[850px] border-collapse text-left">
                    <thead>
                      <tr className="border-b border-line bg-page/30 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted">
                        <th className="px-5 py-3.5 font-semibold">Unit</th>
                        <th className="px-4 py-3.5 font-semibold">Property</th>
                        <th className="px-4 py-3.5 font-semibold">Building</th>
                        <th className="px-4 py-3.5 font-semibold">Layout</th>
                        <th className="px-4 py-3.5 font-semibold">Rent</th>
                        <th className="px-4 py-3.5 font-semibold">Status</th>
                        <th className="w-14 px-4 py-3.5" />
                      </tr>
                    </thead>

                    <tbody>
                      {units.map((unit) => (
                        <tr
                          key={unit.id}
                          onClick={() => navigate(`/units/${unit.id}`)}
                          className="group cursor-pointer border-b border-line/70 text-[13px] transition-colors last:border-b-0 hover:bg-page/35"
                        >
                          {/* Unit */}
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[13px] bg-violet-pale text-violet transition-transform duration-200 group-hover:scale-105">
                                <DoorOpen size={17} strokeWidth={1.7} />
                              </div>

                              <div className="min-w-0">
                                <p className="truncate font-semibold text-ink">
                                  {unit.name ?? unit.code}
                                </p>

                                <p className="mt-0.5 text-[11.5px] text-muted">
                                  {unit.name ? unit.code : "Unit"}
                                </p>
                              </div>
                            </div>
                          </td>

                          {/* Property */}
                          <td className="px-4 py-4">
                            <div className="flex items-center gap-2">
                              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-page text-muted">
                                <Building2 size={13} strokeWidth={1.7} />
                              </div>

                              <span className="max-w-[170px] truncate font-medium text-ink/80">
                                {unit.property?.name ?? "—"}
                              </span>
                            </div>
                          </td>

                          {/* Building */}
                          <td className="px-4 py-4 text-ink/75">
                            <span className="max-w-[150px] truncate">
                              {unit.building?.name ?? "—"}
                            </span>
                          </td>

                          {/* Layout */}
                          <td className="px-4 py-4">
                            <div className="flex items-center gap-1.5 text-[12px] text-ink/75">
                              <span className="rounded-lg bg-page px-2 py-1">
                                {unit.bedrooms ?? "—"} bd
                              </span>

                              <span className="rounded-lg bg-page px-2 py-1">
                                {unit.bathrooms ?? "—"} ba
                              </span>
                            </div>
                          </td>

                          {/* Rent */}
                          <td className="px-4 py-4">
                            {unit.default_rent ? (
                              <div>
                                <p className="font-semibold text-ink">
                                  ₦{Number(unit.default_rent).toLocaleString()}
                                </p>
                                <p className="mt-0.5 text-[10.5px] text-muted">
                                  default rent
                                </p>
                              </div>
                            ) : (
                              <span className="text-ink/40">—</span>
                            )}
                          </td>

                          {/* Status */}
                          <td className="px-4 py-4">
                            <span
                              className={[
                                "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11.5px] font-semibold",
                                statusStyles[unit.status] ??
                                  "bg-page text-ink/60",
                              ].join(" ")}
                            >
                              <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
                              {statusLabels[unit.status] ?? unit.status}
                            </span>
                          </td>

                          {/* Actions */}
                          <td
                            className="px-4 py-4 text-right"
                            onClick={(event) => event.stopPropagation()}
                          >
                            <UnitRowActions unit={unit} onChanged={refetch} />
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
                        onClick={() =>
                          setPage((current) => Math.max(1, current - 1))
                        }
                        className="flex h-8 w-8 items-center justify-center rounded-full border border-line text-ink/70 transition-colors hover:bg-page/60 disabled:pointer-events-none disabled:opacity-35"
                      >
                        <ChevronLeft size={15} strokeWidth={2} />
                      </button>

                      <button
                        type="button"
                        disabled={page >= lastPage}
                        onClick={() =>
                          setPage((current) => Math.min(lastPage, current + 1))
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

function FilterOption({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-[12.5px] transition-colors",
        active
          ? "bg-violet-pale font-medium text-violet"
          : "text-ink/80 hover:bg-page/70",
      ].join(" ")}
    >
      <span className="truncate">{label}</span>
      {active && <Check size={13} strokeWidth={2.2} />}
    </button>
  );
}

function SummaryCard({
  icon: Icon,
  label,
  value,
  detail,
  tone = "violet",
}: {
  icon: typeof DoorOpen;
  label: string;
  value: string;
  detail: string;
  tone?: "violet" | "green" | "rose";
}) {
  const iconClasses = {
    violet: "bg-violet-pale text-violet",
    green: "bg-good-bg text-good-text",
    rose: "bg-rose-50 text-rose-600",
  };

  return (
    <div className="rounded-[22px] border border-line bg-panel p-4">
      <div className="flex items-start justify-between gap-3">
        <div
          className={[
            "flex h-9 w-9 items-center justify-center rounded-xl",
            iconClasses[tone],
          ].join(" ")}
        >
          <Icon size={16} strokeWidth={1.8} />
        </div>

        <span className="mt-1 h-1.5 w-1.5 rounded-full bg-current opacity-20" />
      </div>

      <p className="mt-4 text-[11.5px] font-medium text-muted">{label}</p>

      <p className="mt-0.5 text-[21px] font-bold tracking-[-0.025em] text-ink">
        {value}
      </p>

      <p className="mt-0.5 truncate text-[11px] text-muted">{detail}</p>
    </div>
  );
}