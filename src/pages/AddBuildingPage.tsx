// src/pages/AddBuildingPage.tsx
import { useState, type FormEvent, type ReactNode } from "react";
import {
  ArrowLeft,
  Building2,
  Check,
  ChevronDown,
  Layers3,
  ShieldCheck,
} from "lucide-react";
import { api, ApiError } from "../lib/api";
import { showToast } from "../lib/toast";
import { useRoute } from "../lib/router";
import { useAllProperties } from "../hooks/useProperties";

interface FormState {
  property_id: string;
  name: string;
  code: string;
  floors_count: string;
}

const initialState: FormState = {
  property_id: "",
  name: "",
  code: "",
  floors_count: "",
};

export default function AddBuildingPage() {
  const { navigate } = useRoute();
  const { data: propertiesData, loading: propertiesLoading } =
    useAllProperties();
  const properties = propertiesData?.data ?? [];

  const [form, setForm] = useState<FormState>(initialState);
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

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
      name: form.name,
    };

    if (form.code) payload.code = form.code;
    if (form.floors_count) payload.floors_count = Number(form.floors_count);

    try {
      await api.post("/buildings", payload);
      showToast(`${form.name} was added.`, "success");
      navigate("/buildings");
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

  return (
    <div className="animate-fade-up">
      <Header
        onBack={() => navigate("/buildings")}
        title="Add building"
        description="Add a building to an existing property."
      />

      <form onSubmit={handleSubmit} className="mt-6">
        <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_310px]">
          <section className={cardClass}>
            <SectionHeader
              icon={<Layers3 size={17} />}
              eyebrow="Property structure"
              title="Building details"
              description="Define where this building belongs and how it is identified."
            />

            <div className="grid grid-cols-1 gap-5 p-5 sm:grid-cols-2 sm:p-6">
              <div className="sm:col-span-2">
                <Field
                  label="Property"
                  required
                  error={errors.property_id}
                  icon={<Building2 size={15} />}
                >
                  <div className="relative">
                    <select
                      required
                      value={form.property_id}
                      onChange={(e) => update("property_id", e.target.value)}
                      className={`${inputClass(errors.property_id)} appearance-none pr-10`}
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
                    </select>
                    <ChevronDown
                      size={15}
                      className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-muted"
                    />
                  </div>
                </Field>
              </div>

              <Field
                label="Building name"
                required
                error={errors.name}
                icon={<Layers3 size={15} />}
              >
                <input
                  required
                  value={form.name}
                  onChange={(e) => update("name", e.target.value)}
                  className={inputClass(errors.name)}
                  placeholder="Block A"
                />
              </Field>

              <Field label="Building code" error={errors.code}>
                <input
                  value={form.code}
                  onChange={(e) => update("code", e.target.value)}
                  className={inputClass(errors.code)}
                  placeholder="BLK-A"
                />
              </Field>

              <Field label="Number of floors" error={errors.floors_count}>
                <input
                  type="number"
                  min={1}
                  max={500}
                  value={form.floors_count}
                  onChange={(e) => update("floors_count", e.target.value)}
                  className={inputClass(errors.floors_count)}
                  placeholder="4"
                />
              </Field>
            </div>

            {properties.length === 0 && !propertiesLoading && (
              <div className="mx-5 mb-5 rounded-2xl border border-warn-bg bg-warn-bg/50 px-4 py-3 text-[12px] text-warn-text sm:mx-6">
                No properties exist yet. Add a property before creating a
                building.
              </div>
            )}
          </section>

          <aside className="space-y-5 xl:sticky xl:top-5 xl:self-start">
            <section className="rounded-3xl bg-ink p-5 text-white shadow-[0_18px_45px_rgba(22,22,29,0.14)]">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10">
                <Layers3 size={18} />
              </div>

              <p className="mt-5 text-[10px] font-bold uppercase tracking-[0.15em] text-white/40">
                New building
              </p>

              <h2 className="mt-1.5 text-[18px] font-bold">
                {form.name.trim() || "Building profile"}
              </h2>

              <p className="mt-1 text-[12px] text-white/50">
                {selectedProperty?.name || "Select a property"}
              </p>

              <div className="mt-5 grid grid-cols-2 gap-2">
                <Summary label="Code" value={form.code || "—"} />
                <Summary label="Floors" value={form.floors_count || "—"} />
              </div>
            </section>

            <section className="rounded-3xl border border-line bg-panel p-5">
              <div className="flex items-center gap-2">
                <ShieldCheck size={16} className="text-violet" />
                <span className="text-[12.5px] font-semibold">Structure</span>
              </div>
              <p className="mt-2 text-[11.5px] leading-5 text-muted">
                Units can be attached to this building after it has been
                created.
              </p>
            </section>
          </aside>
        </div>

        {formError && <ErrorBox message={formError} />}

        <FormFooter
          cancel={() => navigate("/buildings")}
          submitting={submitting}
          disabled={properties.length === 0}
          label="Add building"
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
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-line bg-panel text-ink/65 shadow-sm transition-all hover:-translate-x-0.5 hover:text-ink"
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
        className="inline-flex items-center justify-center gap-2 rounded-2xl bg-ink px-6 py-3 text-[13px] font-semibold text-white shadow-[0_8px_20px_rgba(22,22,29,0.12)] transition-all hover:-translate-y-0.5 disabled:opacity-60"
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

function ErrorBox({ message }: { message: string }) {
  return (
    <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-[12.5px] text-rose-700">
      {message}
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
