// src/pages/UnitDetailPage.tsx
import {
  ArrowLeft,
  Bath,
  BedDouble,
  Building2,
  ChevronRight,
  DoorOpen,
  Home,
  Layers3,
  Ruler,
  Wallet,
} from "lucide-react";
import { useRoute } from "../lib/router";
import { useUnitDetail } from "../hooks/useUnits";
import NotesPanel from "../components/notes/NotesPanel";
import UnitRowActions from "../components/units/UnitRowActions";
import type { OccupancyStatus } from "../types";

const statusStyles: Record<OccupancyStatus, string> = {
  vacant: "bg-violet-pale text-violet",
  occupied: "bg-good-bg text-good-text",
  reserved: "bg-warn-bg text-warn-text",
  maintenance: "bg-rose-50 text-rose-600",
};

export default function UnitDetailPage({ id }: { id: number }) {
  const { navigate } = useRoute();
  const { data: unit, loading, error, refetch } = useUnitDetail(id);

  return (
    <div className="animate-fade-up">
      {/* Navigation */}
      <div className="mb-5 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => navigate("/units")}
          className="group flex items-center gap-2 rounded-full px-1.5 py-1.5 text-[12.5px] font-medium text-muted transition-colors hover:text-ink"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-full border border-line bg-white transition-colors group-hover:bg-page/70">
            <ArrowLeft size={15} strokeWidth={1.8} />
          </span>

          <span className="hidden sm:inline">Back to units</span>
        </button>

        {unit && (
          <UnitRowActions
            unit={unit}
            onChanged={refetch}
            onDeleted={() => navigate("/units")}
          />
        )}
      </div>

      {loading && <UnitSkeleton />}

      {error && (
        <div className="rounded-3xl border border-dashed border-line bg-panel px-5 py-12 text-center">
          <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-2xl bg-page text-muted">
            <DoorOpen size={20} strokeWidth={1.7} />
          </div>

          <p className="mt-3 text-[13px] font-semibold text-ink">
            Couldn’t load this unit
          </p>

          <p className="mt-1 text-[12px] text-muted">{error}</p>
        </div>
      )}

      {!loading && !error && unit && (
        <>
          {/* Hero */}
          <section className="overflow-hidden rounded-[28px] bg-ink text-white shadow-[0_16px_40px_rgba(22,22,29,0.12)]">
            <div className="relative px-5 py-6 sm:px-7 sm:py-7">
              <div className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-violet/20 blur-3xl" />

              <div className="relative">
                <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                  <div className="min-w-0">
                    <div className="mb-3 flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-white/10 px-2.5 py-1 text-[10.5px] font-semibold uppercase tracking-[0.1em] text-white/65">
                        Unit
                      </span>

                      <span className="rounded-full bg-white/10 px-2.5 py-1 text-[10.5px] font-medium text-white/60">
                        {unit.code}
                      </span>

                      <span className="rounded-full bg-white/10 px-2.5 py-1 text-[10.5px] font-medium capitalize text-white/65">
                        {unit.status}
                      </span>
                    </div>

                    <h1 className="truncate text-[25px] font-bold tracking-[-0.03em] sm:text-[30px]">
                      {unit.name ?? unit.code}
                    </h1>

                    <p className="mt-2 text-[12.5px] text-white/45">
                      {unit.type ? capitalize(unit.type) : "Residential unit"}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-2 sm:min-w-[330px] sm:grid-cols-3">
                    <HeroMetric
                      label="Floor"
                      value={unit.floor != null ? String(unit.floor) : "—"}
                    />

                    <HeroMetric
                      label="Bedrooms"
                      value={
                        unit.bedrooms != null ? String(unit.bedrooms) : "—"
                      }
                    />

                    <HeroMetric
                      label="Bathrooms"
                      value={
                        unit.bathrooms != null ? String(unit.bathrooms) : "—"
                      }
                    />
                  </div>
                </div>
              </div>
            </div>
          </section>

          <div className="mt-5 grid min-w-0 gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
            <div className="min-w-0 space-y-5">
              {/* Location */}
              <section className="rounded-3xl border border-line bg-panel p-4 sm:p-5">
                <SectionHeading eyebrow="Location" title="Property hierarchy" />

                <div className="mt-5 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                  <HierarchyCard
                    icon={Home}
                    label="Property"
                    value={unit.property?.name}
                    onClick={
                      unit.property_id
                        ? () => navigate(`/properties/${unit.property_id}`)
                        : undefined
                    }
                  />

                  <HierarchyCard
                    icon={Building2}
                    label="Building"
                    value={unit.building?.name}
                    onClick={
                      unit.building_id
                        ? () => navigate(`/buildings/${unit.building_id}`)
                        : undefined
                    }
                  />
                </div>
              </section>

              {/* Status + financial snapshot */}
              <section className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="rounded-3xl border border-line bg-panel p-4 sm:p-5">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-[10.5px] font-semibold uppercase tracking-[0.1em] text-muted">
                        Occupancy
                      </p>

                      <p className="mt-1 text-[17px] font-bold capitalize tracking-[-0.02em] text-ink">
                        {unit.status}
                      </p>
                    </div>

                    <span
                      className={[
                        "inline-flex rounded-full px-3 py-1.5 text-[11px] font-semibold capitalize",
                        statusStyles[unit.status] ?? "bg-page text-muted",
                      ].join(" ")}
                    >
                      {unit.status}
                    </span>
                  </div>

                  <p className="mt-3 text-[11.5px] leading-5 text-muted">
                    Current occupancy state recorded for this unit.
                  </p>
                </div>

                <div className="rounded-3xl border border-line bg-panel p-4 sm:p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-[10.5px] font-semibold uppercase tracking-[0.1em] text-muted">
                        Default rent
                      </p>

                      <p className="mt-1 text-[20px] font-bold tracking-[-0.03em] text-ink">
                        {formatCurrency(unit.default_rent)}
                      </p>
                    </div>

                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-pale text-violet">
                      <Wallet size={15} strokeWidth={1.8} />
                    </div>
                  </div>

                  <p className="mt-3 text-[11.5px] leading-5 text-muted">
                    Default rent configured for this unit.
                  </p>
                </div>
              </section>

              {/* Unit specifications */}
              <section className="rounded-3xl border border-line bg-panel p-4 sm:p-5">
                <SectionHeading eyebrow="Specifications" title="Unit details" />

                <div className="mt-5 grid grid-cols-2 gap-2.5 sm:grid-cols-3">
                  <SpecCard
                    icon={DoorOpen}
                    label="Unit code"
                    value={unit.code}
                  />

                  <SpecCard
                    icon={Layers3}
                    label="Floor"
                    value={unit.floor != null ? String(unit.floor) : "—"}
                  />

                  <SpecCard
                    icon={Home}
                    label="Type"
                    value={unit.type ? capitalize(unit.type) : "—"}
                  />

                  <SpecCard
                    icon={BedDouble}
                    label="Bedrooms"
                    value={unit.bedrooms != null ? String(unit.bedrooms) : "—"}
                  />

                  <SpecCard
                    icon={Bath}
                    label="Bathrooms"
                    value={
                      unit.bathrooms != null ? String(unit.bathrooms) : "—"
                    }
                  />

                  <SpecCard
                    icon={Ruler}
                    label="Unit ID"
                    value={String(unit.id)}
                  />
                </div>
              </section>
            </div>

            {/* Notes */}
            <aside className="min-w-0">
              <NotesPanel notableType="unit" notableId={id} />
            </aside>
          </div>
        </>
      )}
    </div>
  );
}

function HeroMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.06] px-3 py-3">
      <p className="text-[10px] font-medium uppercase tracking-[0.08em] text-white/40">
        {label}
      </p>

      <p className="mt-1 text-[17px] font-bold tracking-[-0.02em] text-white">
        {value}
      </p>
    </div>
  );
}

function HierarchyCard({
  icon: Icon,
  label,
  value,
  onClick,
}: {
  icon: typeof Home;
  label: string;
  value?: string | null;
  onClick?: () => void;
}) {
  const content = (
    <>
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-violet-pale text-violet">
        <Icon size={15} strokeWidth={1.8} />
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-[10.5px] font-medium uppercase tracking-[0.08em] text-muted">
          {label}
        </p>

        <p className="mt-1 truncate text-[12.5px] font-semibold text-ink">
          {value || "—"}
        </p>
      </div>

      {onClick && (
        <ChevronRight
          size={14}
          strokeWidth={1.8}
          className="shrink-0 text-muted"
        />
      )}
    </>
  );

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className="flex min-w-0 items-center gap-3 rounded-2xl bg-page/55 px-3.5 py-3.5 text-left transition-colors hover:bg-violet-pale/50"
      >
        {content}
      </button>
    );
  }

  return (
    <div className="flex min-w-0 items-center gap-3 rounded-2xl bg-page/55 px-3.5 py-3.5">
      {content}
    </div>
  );
}

function SpecCard({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Home;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl bg-page/55 px-3.5 py-3.5">
      <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-white text-ink/65 shadow-sm">
        <Icon size={14} strokeWidth={1.8} />
      </div>

      <p className="mt-3 text-[10.5px] font-medium uppercase tracking-[0.08em] text-muted">
        {label}
      </p>

      <p className="mt-1 truncate text-[12.5px] font-semibold text-ink">
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

function formatCurrency(value?: string | number | null) {
  if (value === null || value === undefined || value === "") {
    return "—";
  }

  const amount = Number(value);

  if (!Number.isFinite(amount)) {
    return `₦${value}`;
  }

  return `₦${amount.toLocaleString()}`;
}

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function UnitSkeleton() {
  return (
    <div className="space-y-5">
      <div className="h-[190px] animate-pulse rounded-[28px] bg-ink/10" />

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="space-y-5">
          <div className="h-[180px] animate-pulse rounded-3xl bg-page" />
          <div className="h-[150px] animate-pulse rounded-3xl bg-page" />
          <div className="h-[280px] animate-pulse rounded-3xl bg-page" />
        </div>

        <div className="h-[300px] animate-pulse rounded-3xl bg-page" />
      </div>
    </div>
  );
}
