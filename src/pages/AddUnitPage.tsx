// src/pages/AddUnitPage.tsx
import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import {
  ArrowLeft,
  BedDouble,
  Building2,
  Check,
  ChevronDown,
  DoorOpen,
  Home,
  Layers3,
  ShieldCheck,
} from "lucide-react";
import { api, ApiError } from "../lib/api";
import { showToast } from "../lib/toast";
import { useRoute } from "../lib/router";
import { useAllProperties } from "../hooks/useProperties";
import { useBuildings } from "../hooks/useBuildings";

interface FormState {
  property_id: string;
  building_id: string;
  code: string;
  name: string;
  type: string;
  floor: string;
  bedrooms: string;
  bathrooms: string;
  default_rent: string;
  status: "" | "available" | "maintenance";
}

const initialState: FormState = {
  property_id: "",
  building_id: "",
  code: "",
  name: "",
  type: "",
  floor: "",
  bedrooms: "",
  bathrooms: "",
  default_rent: "",
  status: "",
};

export default function AddUnitPage() {
  const { navigate } = useRoute();
  const { data: propertiesData, loading: propertiesLoading } =
    useAllProperties();
  const properties = propertiesData?.data ?? [];

  const [form, setForm] = useState<FormState>(initialState);
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const selectedPropertyId = form.property_id
    ? Number(form.property_id)
    : undefined;

  const { data: buildingsData, loading: buildingsLoading } = useBuildings({
    property_id: selectedPropertyId,
    per_page: 100,
  });

  const buildings = buildingsData?.data ?? [];

  useEffect(() => {
    setForm((current) => ({
      ...current,
      building_id: "",
    }));
  }, [form.property_id]);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));

    if (errors[key]) {
      setErrors((current) => {
        const next = { ...current };
        delete next[key];
        return next;
      });
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setErrors({});
    setFormError(null);

    const payload: Record<string, unknown> = {
      property_id: Number(form.property_id),
      code: form.code,
    };

    if (form.building_id) payload.building_id = Number(form.building_id);
    if (form.name) payload.name = form.name;
    if (form.type) payload.type = form.type;
    if (form.floor) payload.floor = Number(form.floor);
    if (form.bedrooms) payload.bedrooms = Number(form.bedrooms);
    if (form.bathrooms) payload.bathrooms = Number(form.bathrooms);
    if (form.default_rent) payload.default_rent = Number(form.default_rent);
    if (form.status) payload.status = form.status;

    try {
      await api.post("/units", payload);
      showToast(`Unit ${form.code} was added.`, "success");
      navigate("/units");
    } catch (err) {
      if (err instanceof ApiError && err.errors) {
        setErrors(err.errors);
      } else {
        const message =
          err instanceof ApiError ? err.message : "Could not reach the server.";
        setFormError(message);
        showToast(message, "error");
      }
    } finally {
      setSubmitting(false);
    }
  }

  const selectedProperty = properties.find(
    (property) => String(property.id) === form.property_id,
  );

  const selectedBuilding = buildings.find(
    (building) => String(building.id) === form.building_id,
  );

  return (
    <div className="animate-fade-up">
      <Header
        onBack={() => navigate("/units")}
        title="Add unit"
        description="Create a unit inside your property portfolio."
      />

      <form onSubmit={handleSubmit} className="mt-6">
        <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_310px]">
          <div className="space-y-5">
            <section className={cardClass}>
              <SectionHeader
                icon={<DoorOpen size={17} />}
                eyebrow="Unit identity"
                title="Location & identity"
                description="Choose the property hierarchy and identify the unit."
              />

              <div className="grid grid-cols-1 gap-5 p-5 sm:grid-cols-2 sm:p-6">
                <Field
                  label="Property"
                  required
                  error={errors.property_id}
                  icon={<Building2 size={15} />}
                >
                  <Select
                    value={form.property_id}
                    onChange={(value) => update("property_id", value)}
                    disabled={propertiesLoading}
                  >
                    <option value="" disabled>
                      {propertiesLoading
                        ? "Loading properties…"
                        : "Select a property"}
                    </option>
                    {properties.map((property) => (
                      <option key={property.id} value={property.id}>
                        {property.name}
                      </option>
                    ))}
                  </Select>
                </Field>

                <Field
                  label="Building"
                  error={errors.building_id}
                  icon={<Layers3 size={15} />}
                >
                  <Select
                    value={form.building_id}
                    onChange={(value) => update("building_id", value)}
                    disabled={!form.property_id || buildingsLoading}
                  >
                    <option value="">
                      {!form.property_id
                        ? "Select property first"
                        : buildingsLoading
                          ? "Loading buildings…"
                          : "No building (optional)"}
                    </option>
                    {buildings.map((building) => (
                      <option key={building.id} value={building.id}>
                        {building.name}
                      </option>
                    ))}
                  </Select>
                </Field>

                <Field
                  label="Unit code"
                  required
                  error={errors.code}
                  icon={<DoorOpen size={15} />}
                >
                  <input
                    required
                    value={form.code}
                    onChange={(e) => update("code", e.target.value)}
                    className={inputClass(errors.code)}
                    placeholder="A-101"
                  />
                </Field>

                <Field
                  label="Display name"
                  error={errors.name}
                  icon={<Home size={15} />}
                >
                  <input
                    value={form.name}
                    onChange={(e) => update("name", e.target.value)}
                    className={inputClass(errors.name)}
                    placeholder="Unit 101"
                  />
                </Field>

                <Field label="Unit type" error={errors.type}>
                  <input
                    value={form.type}
                    onChange={(e) => update("type", e.target.value)}
                    className={inputClass(errors.type)}
                    placeholder="Apartment"
                  />
                </Field>

                <Field label="Floor" error={errors.floor}>
                  <input
                    type="number"
                    min={-10}
                    max={500}
                    value={form.floor}
                    onChange={(e) => update("floor", e.target.value)}
                    className={inputClass(errors.floor)}
                    placeholder="1"
                  />
                </Field>
              </div>
            </section>

            <section className={cardClass}>
              <SectionHeader
                icon={<BedDouble size={17} />}
                eyebrow="Unit specifications"
                title="Layout & pricing"
                description="Capture the unit's physical layout and default rent."
              />

              <div className="grid grid-cols-1 gap-5 p-5 sm:grid-cols-2 sm:p-6">
                <Field
                  label="Bedrooms"
                  error={errors.bedrooms}
                  icon={<BedDouble size={15} />}
                >
                  <input
                    type="number"
                    min={0}
                    max={50}
                    value={form.bedrooms}
                    onChange={(e) => update("bedrooms", e.target.value)}
                    className={inputClass(errors.bedrooms)}
                    placeholder="2"
                  />
                </Field>

                <Field label="Bathrooms" error={errors.bathrooms}>
                  <input
                    type="number"
                    min={0}
                    max={50}
                    value={form.bathrooms}
                    onChange={(e) => update("bathrooms", e.target.value)}
                    className={inputClass(errors.bathrooms)}
                    placeholder="2"
                  />
                </Field>

                <Field label="Default rent (₦)" error={errors.default_rent}>
                  <input
                    type="number"
                    min={0}
                    value={form.default_rent}
                    onChange={(e) => update("default_rent", e.target.value)}
                    className={inputClass(errors.default_rent)}
                    placeholder="500000"
                  />
                </Field>

                <Field
                  label="Initial status"
                  error={errors.status}
                  icon={<Check size={15} />}
                >
                  <Select
                    value={form.status}
                    onChange={(value) =>
                      update("status", value as FormState["status"])
                    }
                  >
                    <option value="">Backend default</option>
                    <option value="available">Available</option>
                    <option value="maintenance">Maintenance</option>
                  </Select>
                </Field>
              </div>
            </section>
          </div>

          <aside className="space-y-5 xl:sticky xl:top-5 xl:self-start">
            <section className="rounded-3xl bg-ink p-5 text-white shadow-[0_18px_45px_rgba(22,22,29,0.14)]">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10">
                <DoorOpen size={18} />
              </div>

              <p className="mt-5 text-[10px] font-bold uppercase tracking-[0.15em] text-white/40">
                New unit
              </p>

              <h2 className="mt-1.5 text-[18px] font-bold">
                {form.code.trim() || "Unit profile"}
              </h2>

              <p className="mt-1 text-[12px] text-white/50">
                {selectedProperty?.name || "Select a property"}
              </p>

              <div className="mt-5 space-y-2">
                <Summary
                  label="Building"
                  value={selectedBuilding?.name || "Standalone"}
                />
                <Summary label="Type" value={form.type || "—"} />
                <Summary
                  label="Rent"
                  value={
                    form.default_rent
                      ? `₦${Number(form.default_rent).toLocaleString()}`
                      : "—"
                  }
                />
              </div>
            </section>

            <section className="rounded-3xl border border-line bg-panel p-5">
              <div className="flex items-center gap-2">
                <ShieldCheck size={16} className="text-violet" />
                <span className="text-[12.5px] font-semibold">
                  Inventory record
                </span>
              </div>
              <p className="mt-2 text-[11.5px] leading-5 text-muted">
                A unit can exist directly under a property or inside one of its
                buildings.
              </p>
            </section>
          </aside>
        </div>

        {properties.length === 0 && !propertiesLoading && (
          <ErrorBox
            message="No properties exist yet. Add a property before creating a unit."
            warning
          />
        )}

        {formError && <ErrorBox message={formError} />}

        <FormFooter
          cancel={() => navigate("/units")}
          submitting={submitting}
          disabled={properties.length === 0}
          label="Add unit"
        />
      </form>
    </div>
  );
}

function Header({
  onBack,
  title,
  description,
}: {
  onBack: () => void;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-center gap-3.5">
      <button
        type="button"
        onClick={onBack}
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-line bg-panel text-ink/65 shadow-sm hover:-translate-x-0.5 hover:text-ink"
      >
        <ArrowLeft size={17} />
      </button>
      <div>
        <p className="text-[10.5px] font-bold uppercase tracking-[0.14em] text-violet">
          Portfolio
        </p>
        <h1 className="mt-1 text-[23px] font-bold tracking-[-0.025em] text-ink">
          {title}
        </h1>
        <p className="mt-0.5 text-[13px] text-muted">{description}</p>
      </div>
    </div>
  );
}

function SectionHeader({
  icon,
  eyebrow,
  title,
  description,
}: {
  icon: ReactNode;
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-start gap-3.5 border-b border-line px-5 py-5 sm:px-6">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-violet-pale text-violet">
        {icon}
      </div>
      <div>
        <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-violet">
          {eyebrow}
        </p>
        <h2 className="mt-1 text-[15px] font-bold text-ink">{title}</h2>
        <p className="mt-1 text-[12px] leading-5 text-muted">{description}</p>
      </div>
    </div>
  );
}

function Field({
  label,
  required,
  error,
  icon,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string[];
  icon?: ReactNode;
  children: ReactNode;
}) {
  return (
    <label className="block text-[12px] font-semibold text-ink/75">
      <span className="flex items-center gap-1.5">
        {icon && <span className="text-muted">{icon}</span>}
        {label}
        {required && <span className="text-rose-500">*</span>}
      </span>
      {children}
      {error?.[0] && (
        <p className="mt-1.5 text-[11.5px] text-rose-600">{error[0]}</p>
      )}
    </label>
  );
}

function Select({
  value,
  onChange,
  disabled,
  children,
}: {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  children: ReactNode;
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className={`${inputClass()} appearance-none pr-10 disabled:cursor-not-allowed disabled:bg-page/60`}
      >
        {children}
      </select>
      <ChevronDown
        size={15}
        className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-muted"
      />
    </div>
  );
}

function Summary({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-white/7 px-3 py-2.5">
      <p className="text-[9px] uppercase tracking-[0.12em] text-white/40">
        {label}
      </p>
      <p className="mt-1 truncate text-[12px] font-semibold text-white/90">
        {value}
      </p>
    </div>
  );
}

function ErrorBox({
  message,
  warning,
}: {
  message: string;
  warning?: boolean;
}) {
  return (
    <div
      className={`mt-4 rounded-2xl border px-4 py-3 text-[12.5px] ${
        warning
          ? "border-warn-bg bg-warn-bg/50 text-warn-text"
          : "border-rose-200 bg-rose-50 text-rose-700"
      }`}
    >
      {message}
    </div>
  );
}

function FormFooter({
  cancel,
  submitting,
  disabled,
  label,
}: {
  cancel: () => void;
  submitting: boolean;
  disabled: boolean;
  label: string;
}) {
  return (
    <div className="mt-5 flex flex-col-reverse gap-3 border-t border-line pt-5 sm:flex-row sm:items-center sm:justify-between">
      <button
        type="button"
        onClick={cancel}
        className="rounded-2xl px-4 py-2.5 text-[13px] font-medium text-ink/65 hover:bg-panel hover:text-ink"
      >
        Cancel
      </button>
      <button
        type="submit"
        disabled={submitting || disabled}
        className="inline-flex items-center justify-center gap-2 rounded-2xl bg-ink px-6 py-3 text-[13px] font-semibold text-white shadow-[0_8px_20px_rgba(22,22,29,0.12)] hover:-translate-y-0.5 disabled:opacity-60"
      >
        {submitting ? (
          "Saving…"
        ) : (
          <>
            <Check size={15} /> {label}
          </>
        )}
      </button>
    </div>
  );
}

const cardClass =
  "overflow-hidden rounded-3xl border border-line bg-panel shadow-[0_12px_35px_rgba(22,22,29,0.035)]";

const inputClass = (error?: string[]) =>
  [
    "mt-2 w-full rounded-2xl border bg-white px-3.5 py-3 text-[13px] text-ink outline-none transition-all placeholder:text-muted/50",
    "focus:border-violet/50 focus:ring-4 focus:ring-violet-pale/70",
    error?.length ? "border-rose-300" : "border-line hover:border-ink/15",
  ].join(" ");
