// src/pages/PropertyDetailPage.tsx
import {
  ArrowLeft,
  Building2,
  CheckCircle2,
  ChevronRight,
  DoorOpen,
  Layers,
  MapPin,
  Phone,
  UserRound,
  XCircle,
} from "lucide-react";
import { useRoute } from "../lib/router";
import { usePropertyDetail } from "../hooks/useProperties";
import { useBuildings } from "../hooks/useBuildings";
import { useUnits } from "../hooks/useUnits";
import NotesPanel from "../components/notes/NotesPanel";
import PropertyRowActions from "../components/properties/PropertyRowActions";

export default function PropertyDetailPage({ id }: { id: number }) {
  const { navigate } = useRoute();
  const { data: property, loading, error, refetch } = usePropertyDetail(id);

  const { data: buildingsData, loading: buildingsLoading } = useBuildings({
    property_id: id,
    per_page: 50,
  });

  const { data: unitsData, loading: unitsLoading } = useUnits({
    property_id: id,
    per_page: 50,
  });

  const buildings = buildingsData?.data ?? [];
  const units = unitsData?.data ?? [];

  const occupiedUnits = property?.occupied_units_count ?? 0;
  const totalUnits = property?.units_count ?? 0;
  const vacantUnits = Math.max(totalUnits - occupiedUnits, 0);

  return (
    <div className="animate-fade-up">
      {/* Top navigation */}
      <div className="mb-5 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => navigate("/properties")}
          className="group flex items-center gap-2 rounded-full px-1.5 py-1.5 text-[12.5px] font-medium text-muted transition-colors hover:text-ink"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-full border border-line bg-white transition-colors group-hover:bg-page/70">
            <ArrowLeft size={15} strokeWidth={1.8} />
          </span>
          <span className="hidden sm:inline">Back to properties</span>
        </button>

        {property && (
          <PropertyRowActions
            property={property}
            onChanged={refetch}
            onDeleted={() => navigate("/properties")}
          />
        )}
      </div>

      {loading && <PropertySkeleton />}

      {error && (
        <div className="rounded-3xl border border-dashed border-line bg-panel px-5 py-12 text-center">
          <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-2xl bg-page text-muted">
            <Building2 size={20} strokeWidth={1.7} />
          </div>

          <p className="mt-3 text-[13px] font-semibold text-ink">
            Couldn’t load this property
          </p>

          <p className="mt-1 text-[12px] text-muted">{error}</p>
        </div>
      )}

      {!loading && !error && property && (
        <>
          {/* Hero */}
          <section className="overflow-hidden rounded-[28px] bg-ink text-white shadow-[0_16px_40px_rgba(22,22,29,0.12)]">
            <div className="relative px-5 py-6 sm:px-7 sm:py-7">
              <div className="pointer-events-none absolute -right-16 -top-20 h-64 w-64 rounded-full bg-violet/20 blur-3xl" />

              <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                <div className="min-w-0">
                  <div className="mb-3 flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-white/10 px-2.5 py-1 text-[10.5px] font-semibold uppercase tracking-[0.1em] text-white/70">
                      Property
                    </span>

                    <span
                      className={[
                        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10.5px] font-semibold",
                        property.is_active
                          ? "bg-good-bg text-good-text"
                          : "bg-warn-bg text-warn-text",
                      ].join(" ")}
                    >
                      {property.is_active ? (
                        <CheckCircle2 size={11} strokeWidth={2} />
                      ) : (
                        <XCircle size={11} strokeWidth={2} />
                      )}
                      {property.is_active ? "Active" : "Inactive"}
                    </span>
                  </div>

                  <h1 className="max-w-3xl text-[25px] font-bold tracking-[-0.03em] sm:text-[30px]">
                    {property.name}
                  </h1>

                  <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[12.5px] text-white/55">
                    {property.code && (
                      <span className="font-medium text-white/70">
                        {property.code}
                      </span>
                    )}

                    {property.address && (
                      <span className="flex items-center gap-1.5">
                        <MapPin size={13} strokeWidth={1.8} />
                        {property.address}
                      </span>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 sm:min-w-[330px]">
                  <HeroMetric label="Units" value={totalUnits} />
                  <HeroMetric label="Occupied" value={occupiedUnits} />
                  <HeroMetric label="Vacant" value={vacantUnits} />
                </div>
              </div>
            </div>
          </section>

          {/* Main content */}
          <div className="mt-5 grid min-w-0 gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
            <div className="min-w-0 space-y-5">
              {/* Overview */}
              <section className="rounded-3xl border border-line bg-panel p-4 sm:p-5">
                <SectionHeading eyebrow="Overview" title="Property details" />

                <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
                  <DetailField
                    icon={Building2}
                    label="Property type"
                    value={property.type}
                    capitalize
                  />

                  <DetailField
                    icon={UserRound}
                    label="Owner"
                    value={property.owner_name}
                  />

                  <DetailField
                    icon={Phone}
                    label="Owner phone"
                    value={property.owner_phone}
                  />

                  <DetailField
                    icon={MapPin}
                    label="Address"
                    value={property.address}
                  />

                  <DetailField label="City" value={property.city} />

                  <DetailField label="State" value={property.state} />

                  <DetailField label="Country" value={property.country} />

                  <DetailField
                    icon={Layers}
                    label="Buildings"
                    value={property.buildings_count?.toString()}
                  />

                  <DetailField
                    icon={DoorOpen}
                    label="Total units"
                    value={property.units_count?.toString()}
                  />
                </div>
              </section>

              {/* Buildings */}
              <section className="rounded-3xl border border-line bg-panel p-4 sm:p-5">
                <div className="flex items-end justify-between gap-3">
                  <SectionHeading eyebrow="Structure" title="Buildings" />

                  <span className="rounded-full bg-page px-2.5 py-1 text-[11px] font-semibold text-muted">
                    {buildingsData?.meta.total ?? 0}
                  </span>
                </div>

                {buildingsLoading && (
                  <div className="mt-5 grid gap-2 sm:grid-cols-2">
                    {Array.from({ length: 4 }).map((_, index) => (
                      <div
                        key={index}
                        className="h-[76px] animate-pulse rounded-2xl bg-page"
                      />
                    ))}
                  </div>
                )}

                {!buildingsLoading && buildings.length === 0 && (
                  <EmptyState
                    icon={Layers}
                    title="No buildings yet"
                    description="Buildings assigned to this property will appear here."
                  />
                )}

                {!buildingsLoading && buildings.length > 0 && (
                  <div className="mt-5 grid gap-2 sm:grid-cols-2">
                    {buildings.map((building) => (
                      <button
                        key={building.id}
                        type="button"
                        onClick={() => navigate(`/buildings/${building.id}`)}
                        className="group flex items-center gap-3 rounded-2xl border border-line bg-white p-3.5 text-left transition-all hover:-translate-y-0.5 hover:border-violet-soft hover:shadow-[0_8px_24px_rgba(20,18,45,0.06)]"
                      >
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-pale text-violet">
                          <Layers size={17} strokeWidth={1.8} />
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className="truncate text-[13px] font-semibold text-ink">
                            {building.name}
                          </p>
                          <p className="mt-0.5 text-[11.5px] text-muted">
                            {building.units_count ?? 0} unit
                            {(building.units_count ?? 0) === 1 ? "" : "s"}
                          </p>
                        </div>

                        <ChevronRight
                          size={15}
                          strokeWidth={1.8}
                          className="shrink-0 text-muted transition-transform group-hover:translate-x-0.5 group-hover:text-ink"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </section>

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
                    {Array.from({ length: 4 }).map((_, index) => (
                      <div
                        key={index}
                        className="h-[68px] animate-pulse rounded-2xl bg-page"
                      />
                    ))}
                  </div>
                )}

                {!unitsLoading && units.length === 0 && (
                  <EmptyState
                    icon={DoorOpen}
                    title="No units yet"
                    description="Units assigned to this property will appear here."
                  />
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
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-page text-muted">
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

            {/* Right rail */}
            <aside className="min-w-0 space-y-5">
              <NotesPanel notableType="property" notableId={id} />
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
  capitalize = false,
}: {
  icon?: typeof Building2;
  label: string;
  value?: string | null;
  capitalize?: boolean;
}) {
  return (
    <div className="rounded-2xl bg-page/55 px-3.5 py-3">
      <div className="flex items-center gap-1.5 text-[10.5px] font-medium text-muted">
        {Icon && <Icon size={12} strokeWidth={1.8} />}
        {label}
      </div>

      <p
        className={[
          "mt-1.5 truncate text-[12.5px] font-semibold text-ink",
          capitalize ? "capitalize" : "",
        ].join(" ")}
      >
        {value || "—"}
      </p>
    </div>
  );
}

function StatusPill({ status }: { status?: string | null }) {
  const normalized = (status ?? "").toLowerCase();

  const tone =
    normalized === "occupied"
      ? "bg-good-bg text-good-text"
      : normalized === "maintenance"
        ? "bg-warn-bg text-warn-text"
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

function EmptyState({
  icon: Icon,
  title,
  description,
}: {
  icon: typeof Layers;
  title: string;
  description: string;
}) {
  return (
    <div className="mt-5 rounded-2xl border border-dashed border-line bg-page/30 px-4 py-8 text-center">
      <div className="mx-auto flex h-9 w-9 items-center justify-center rounded-xl bg-page text-muted">
        <Icon size={16} strokeWidth={1.8} />
      </div>

      <p className="mt-2.5 text-[12.5px] font-semibold text-ink">{title}</p>

      <p className="mt-1 text-[11.5px] text-muted">{description}</p>
    </div>
  );
}

function PropertySkeleton() {
  return (
    <div className="space-y-5">
      <div className="h-[190px] animate-pulse rounded-[28px] bg-ink/10" />

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="space-y-5">
          <div className="h-[260px] animate-pulse rounded-3xl bg-page" />
          <div className="h-[220px] animate-pulse rounded-3xl bg-page" />
          <div className="h-[280px] animate-pulse rounded-3xl bg-page" />
        </div>

        <div className="h-[300px] animate-pulse rounded-3xl bg-page" />
      </div>
    </div>
  );
}
