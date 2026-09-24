// src/pages/BuildingDetailPage.tsx
import {
  ArrowLeft,
  Building2,
  ChevronRight,
  DoorOpen,
  Layers,
} from "lucide-react";
import { useRoute } from "../lib/router";
import { useBuildingDetail } from "../hooks/useBuildings";
import { useUnits } from "../hooks/useUnits";
import NotesPanel from "../components/notes/NotesPanel";
import BuildingRowActions from "../components/buildings/BuildingRowActions";

export default function BuildingDetailPage({ id }: { id: number }) {
  const { navigate } = useRoute();
  const { data: building, loading, error, refetch } = useBuildingDetail(id);

  const { data: unitsData, loading: unitsLoading } = useUnits({
    building_id: id,
    per_page: 50,
  });

  const units = unitsData?.data ?? [];

  const totalUnits = building?.units_count ?? 0;
  const displayedUnits = units.length;

  const occupiedUnits = units.filter(
    (unit) => unit.status?.toLowerCase() === "occupied",
  ).length;

  const vacantUnits = units.filter((unit) => {
    const status = unit.status?.toLowerCase();
    return status === "vacant" || status === "available";
  }).length;

  return (
    <div className="animate-fade-up">
      {/* Navigation */}
      <div className="mb-5 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => navigate("/buildings")}
          className="group flex items-center gap-2 rounded-full px-1.5 py-1.5 text-[12.5px] font-medium text-muted transition-colors hover:text-ink"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-full border border-line bg-white transition-colors group-hover:bg-page/70">
            <ArrowLeft size={15} strokeWidth={1.8} />
          </span>

          <span className="hidden sm:inline">Back to buildings</span>
        </button>

        {building && (
          <BuildingRowActions
            building={building}
            onChanged={refetch}
            onDeleted={() => navigate("/buildings")}
          />
        )}
      </div>

      {loading && <BuildingSkeleton />}

      {error && (
        <div className="rounded-3xl border border-dashed border-line bg-panel px-5 py-12 text-center">
          <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-2xl bg-page text-muted">
            <Building2 size={20} strokeWidth={1.7} />
          </div>

          <p className="mt-3 text-[13px] font-semibold text-ink">
            Couldn’t load this building
          </p>

          <p className="mt-1 text-[12px] text-muted">{error}</p>
        </div>
      )}

      {!loading && !error && building && (
        <>
          {/* Hero */}
          <section className="overflow-hidden rounded-[28px] bg-ink text-white shadow-[0_16px_40px_rgba(22,22,29,0.12)]">
            <div className="relative px-5 py-6 sm:px-7 sm:py-7">
              <div className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-violet/20 blur-3xl" />

              <div className="relative">
                <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                  <div className="min-w-0">
                    <div className="mb-3 flex items-center gap-2">
                      <span className="rounded-full bg-white/10 px-2.5 py-1 text-[10.5px] font-semibold uppercase tracking-[0.1em] text-white/65">
                        Building
                      </span>

                      {building.code && (
                        <span className="rounded-full bg-white/10 px-2.5 py-1 text-[10.5px] font-medium text-white/60">
                          {building.code}
                        </span>
                      )}
                    </div>

                    <h1 className="text-[25px] font-bold tracking-[-0.03em] sm:text-[30px]">
                      {building.name}
                    </h1>

                    {building.property?.name && (
                      <button
                        type="button"
                        onClick={() =>
                          building.property_id &&
                          navigate(`/properties/${building.property_id}`)
                        }
                        className="mt-2 flex items-center gap-1.5 text-[12.5px] text-white/55 transition-colors hover:text-white"
                      >
                        <Building2 size={13} strokeWidth={1.8} />
                        {building.property.name}
                        <ChevronRight size={12} strokeWidth={1.8} />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-3 gap-2 sm:min-w-[330px]">
                    <HeroMetric
                      label="Floors"
                      value={building.floors_count ?? 0}
                    />

                    <HeroMetric label="Units" value={totalUnits} />

                    <HeroMetric label="Occupied" value={occupiedUnits} />
                  </div>
                </div>
              </div>
            </div>
          </section>

          <div className="mt-5 grid min-w-0 gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
            <div className="min-w-0 space-y-5">
              {/* Building overview */}
              <section className="rounded-3xl border border-line bg-panel p-4 sm:p-5">
                <SectionHeading eyebrow="Overview" title="Building details" />

                <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <DetailField
                    icon={Building2}
                    label="Property"
                    value={building.property?.name}
                    onClick={
                      building.property_id
                        ? () => navigate(`/properties/${building.property_id}`)
                        : undefined
                    }
                  />

                  <DetailField
                    icon={Layers}
                    label="Floors"
                    value={building.floors_count?.toString()}
                  />

                  <DetailField
                    icon={DoorOpen}
                    label="Total units"
                    value={building.units_count?.toString()}
                  />

                  <DetailField
                    label="Units shown"
                    value={
                      unitsData
                        ? `${displayedUnits} of ${unitsData.meta.total}`
                        : undefined
                    }
                  />
                </div>
              </section>

              {/* Unit summary */}
              {!unitsLoading && units.length > 0 && (
                <section className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  <MiniMetric
                    label="Units"
                    value={unitsData?.meta.total ?? units.length}
                    icon={DoorOpen}
                  />

                  <MiniMetric
                    label="Occupied"
                    value={occupiedUnits}
                    icon={Building2}
                  />

                  <MiniMetric
                    label="Vacant"
                    value={vacantUnits}
                    icon={DoorOpen}
                  />
                </section>
              )}

              {/* Units */}
              <section className="rounded-3xl border border-line bg-panel p-4 sm:p-5">
                <div className="flex items-end justify-between gap-3">
                  <SectionHeading eyebrow="Inventory" title="Units" />

                  <span className="rounded-full bg-page px-2.5 py-1 text-[11px] font-semibold text-muted">
                    {unitsData?.meta.total ?? 0}
                  </span>
                </div>

                {unitsLoading && (
                  <div className="mt-5 space-y-2">
                    {Array.from({ length: 5 }).map((_, index) => (
                      <div
                        key={index}
                        className="h-[70px] animate-pulse rounded-2xl bg-page"
                      />
                    ))}
                  </div>
                )}

                {!unitsLoading && units.length === 0 && (
                  <div className="mt-5 rounded-2xl border border-dashed border-line bg-page/30 px-4 py-10 text-center">
                    <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-page text-muted">
                      <DoorOpen size={17} strokeWidth={1.8} />
                    </div>

                    <p className="mt-3 text-[12.5px] font-semibold text-ink">
                      No units yet
                    </p>

                    <p className="mt-1 text-[11.5px] text-muted">
                      Units assigned to this building will appear here.
                    </p>
                  </div>
                )}

                {!unitsLoading && units.length > 0 && (
                  <div className="mt-5 overflow-hidden rounded-2xl border border-line">
                    <div className="hidden grid-cols-[minmax(0,1fr)_120px_28px] gap-3 border-b border-line bg-page/40 px-4 py-2.5 text-[10.5px] font-semibold uppercase tracking-[0.08em] text-muted sm:grid">
                      <span>Unit</span>
                      <span>Status</span>
                      <span />
                    </div>

                    <div className="divide-y divide-line">
                      {units.map((unit) => (
                        <button
                          key={unit.id}
                          type="button"
                          onClick={() => navigate(`/units/${unit.id}`)}
                          className="group grid w-full grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-4 py-3.5 text-left transition-colors hover:bg-page/40 sm:grid-cols-[minmax(0,1fr)_120px_28px]"
                        >
                          <div className="flex min-w-0 items-center gap-3">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-violet-pale text-violet">
                              <DoorOpen size={15} strokeWidth={1.8} />
                            </div>

                            <div className="min-w-0">
                              <p className="truncate text-[12.5px] font-semibold text-ink">
                                {unit.name ?? unit.code}
                              </p>

                              <p className="mt-0.5 truncate text-[11px] text-muted">
                                {unit.code}
                              </p>
                            </div>
                          </div>

                          <StatusPill status={unit.status} />

                          <ChevronRight
                            size={14}
                            strokeWidth={1.8}
                            className="hidden text-muted transition-transform group-hover:translate-x-0.5 group-hover:text-ink sm:block"
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </section>
            </div>

            {/* Notes */}
            <aside className="min-w-0">
              <NotesPanel notableType="building" notableId={id} />
            </aside>
          </div>
        </>
      )}
    </div>
  );
}

function HeroMetric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.06] px-3 py-3">
      <p className="text-[10px] font-medium uppercase tracking-[0.08em] text-white/40">
        {label}
      </p>

      <p className="mt-1 text-[19px] font-bold tracking-[-0.02em] text-white">
        {value}
      </p>
    </div>
  );
}

function MiniMetric({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: number;
  icon: typeof DoorOpen;
}) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-line bg-panel px-4 py-3.5">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-violet-pale text-violet">
        <Icon size={15} strokeWidth={1.8} />
      </div>

      <div>
        <p className="text-[10.5px] font-medium uppercase tracking-[0.08em] text-muted">
          {label}
        </p>

        <p className="mt-0.5 text-[16px] font-bold text-ink">{value}</p>
      </div>
    </div>
  );
}

function SectionHeading({
  eyebrow,
  title,
}: {
  eyebrow: string;
  title: string;
}) {
  return (
    <div>
      <p className="text-[10.5px] font-semibold uppercase tracking-[0.1em] text-muted">
        {eyebrow}
      </p>

      <h2 className="mt-0.5 text-[15px] font-bold tracking-[-0.01em] text-ink">
        {title}
      </h2>
    </div>
  );
}

function DetailField({
  icon: Icon,
  label,
  value,
  onClick,
}: {
  icon?: typeof Building2;
  label: string;
  value?: string | null;
  onClick?: () => void;
}) {
  const content = (
    <>
      <div className="flex items-center gap-1.5 text-[10.5px] font-medium text-muted">
        {Icon && <Icon size={12} strokeWidth={1.8} />}
        {label}
      </div>

      <p className="mt-1.5 truncate text-[12.5px] font-semibold text-ink">
        {value || "—"}
      </p>
    </>
  );

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className="rounded-2xl bg-page/55 px-3.5 py-3 text-left transition-colors hover:bg-violet-pale/50"
      >
        {content}
      </button>
    );
  }

  return <div className="rounded-2xl bg-page/55 px-3.5 py-3">{content}</div>;
}

function StatusPill({ status }: { status?: string | null }) {
  const normalized = (status ?? "").toLowerCase();

  const tone =
    normalized === "occupied"
      ? "bg-good-bg text-good-text"
      : normalized === "maintenance"
        ? "bg-warn-bg text-warn-text"
        : normalized === "vacant" || normalized === "available"
          ? "bg-violet-pale text-violet"
          : "bg-page text-muted";

  return (
    <span
      className={[
        "inline-flex w-fit shrink-0 rounded-full px-2.5 py-1 text-[10.5px] font-semibold capitalize",
        tone,
      ].join(" ")}
    >
      {status || "Unknown"}
    </span>
  );
}

function BuildingSkeleton() {
  return (
    <div className="space-y-5">
      <div className="h-[190px] animate-pulse rounded-[28px] bg-ink/10" />

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="space-y-5">
          <div className="h-[190px] animate-pulse rounded-3xl bg-page" />
          <div className="h-[90px] animate-pulse rounded-3xl bg-page" />
          <div className="h-[390px] animate-pulse rounded-3xl bg-page" />
        </div>

        <div className="h-[300px] animate-pulse rounded-3xl bg-page" />
      </div>
    </div>
  );
}
