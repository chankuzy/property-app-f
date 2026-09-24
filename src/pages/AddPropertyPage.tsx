// src/pages/AddPropertyPage.tsx
import { useState, type FormEvent, type ReactNode } from "react";
import {
  ArrowLeft,
  Building2,
  Check,
  ChevronDown,
  FileText,
  MapPin,
  Phone,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { api, ApiError } from "../lib/api";
import { showToast } from "../lib/toast";
import { useRoute } from "../lib/router";

interface FormState {
  name: string;
  code: string;
  type: string;
  address: string;
  city: string;
  state: string;
  country: string;
  owner_name: string;
  owner_phone: string;
  is_active: boolean;
}

const initialState: FormState = {
  name: "",
  code: "",
  type: "",
  address: "",
  city: "",
  state: "",
  country: "Nigeria",
  owner_name: "",
  owner_phone: "",
  is_active: true,
};

const OPTIONAL_KEYS = [
  "code",
  "type",
  "address",
  "city",
  "state",
  "country",
  "owner_name",
  "owner_phone",
] as const;

export default function AddPropertyPage() {
  const { navigate } = useRoute();
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
      name: form.name,
      is_active: form.is_active,
    };

    for (const key of OPTIONAL_KEYS) {
      if (form[key]) payload[key] = form[key];
    }

    try {
      await api.post("/properties", payload);
      showToast(`${form.name} was added.`, "success");
      navigate("/properties");
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

  return (
    <div className="animate-fade-up">
      <Header
        onBack={() => navigate("/properties")}
        eyebrow="Portfolio"
        title="Add property"
        description="Create the root record for a property, its buildings and units."
      />

      <form onSubmit={handleSubmit} className="mt-6">
        <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_310px]">
          <div className="space-y-5">
            <section className={cardClass}>
              <SectionHeader
                icon={<Building2 size={17} />}
                eyebrow="Property profile"
                title="Basic information"
                description="The primary identity of this property."
              />

              <div className="grid grid-cols-1 gap-5 p-5 sm:grid-cols-2 sm:p-6">
                <Field
                  label="Property name"
                  required
                  error={errors.name}
                  icon={<Building2 size={15} />}
                >
                  <input
                    required
                    value={form.name}
                    onChange={(e) => update("name", e.target.value)}
                    className={inputClass(errors.name)}
                    placeholder="Sunrise Estate"
                  />
                </Field>

                <Field
                  label="Property code"
                  error={errors.code}
                  icon={<FileText size={15} />}
                >
                  <input
                    value={form.code}
                    onChange={(e) => update("code", e.target.value)}
                    className={inputClass(errors.code)}
                    placeholder="SUN-01"
                  />
                </Field>

                <Field
                  label="Property type"
                  error={errors.type}
                  icon={<Building2 size={15} />}
                >
                  <input
                    value={form.type}
                    onChange={(e) => update("type", e.target.value)}
                    className={inputClass(errors.type)}
                    placeholder="Residential"
                  />
                </Field>

                <Field label="Status" icon={<Check size={15} />}>
                  <div className="relative">
                    <select
                      value={form.is_active ? "active" : "inactive"}
                      onChange={(e) =>
                        update("is_active", e.target.value === "active")
                      }
                      className={`${inputClass()} appearance-none pr-10`}
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                    <ChevronDown
                      className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-muted"
                      size={15}
                    />
                  </div>
                </Field>
              </div>
            </section>

            <section className={cardClass}>
              <SectionHeader
                icon={<MapPin size={17} />}
                eyebrow="Location"
                title="Property address"
                description="Where the property is located."
              />

              <div className="grid grid-cols-1 gap-5 p-5 sm:grid-cols-2 sm:p-6">
                <div className="sm:col-span-2">
                  <Field
                    label="Address"
                    error={errors.address}
                    icon={<MapPin size={15} />}
                  >
                    <input
                      value={form.address}
                      onChange={(e) => update("address", e.target.value)}
                      className={inputClass(errors.address)}
                      placeholder="12 Ahmadu Bello Way"
                    />
                  </Field>
                </div>

                <Field label="City" error={errors.city}>
                  <input
                    value={form.city}
                    onChange={(e) => update("city", e.target.value)}
                    className={inputClass(errors.city)}
                    placeholder="Abuja"
                  />
                </Field>

                <Field label="State" error={errors.state}>
                  <input
                    value={form.state}
                    onChange={(e) => update("state", e.target.value)}
                    className={inputClass(errors.state)}
                    placeholder="FCT"
                  />
                </Field>

                <Field label="Country" error={errors.country}>
                  <input
                    value={form.country}
                    onChange={(e) => update("country", e.target.value)}
                    className={inputClass(errors.country)}
                  />
                </Field>
              </div>
            </section>

            <section className={cardClass}>
              <SectionHeader
                icon={<UserRound size={17} />}
                eyebrow="Ownership"
                title="Owner details"
                description="Optional contact information for the property owner."
              />

              <div className="grid grid-cols-1 gap-5 p-5 sm:grid-cols-2 sm:p-6">
                <Field
                  label="Owner name"
                  error={errors.owner_name}
                  icon={<UserRound size={15} />}
                >
                  <input
                    value={form.owner_name}
                    onChange={(e) => update("owner_name", e.target.value)}
                    className={inputClass(errors.owner_name)}
                    placeholder="Alhaji Musa Bello"
                  />
                </Field>

                <Field
                  label="Owner phone"
                  error={errors.owner_phone}
                  icon={<Phone size={15} />}
                >
                  <input
                    value={form.owner_phone}
                    onChange={(e) => update("owner_phone", e.target.value)}
                    className={inputClass(errors.owner_phone)}
                    placeholder="+234..."
                  />
                </Field>
              </div>
            </section>
          </div>

          <aside className="space-y-5 xl:sticky xl:top-5 xl:self-start">
            <section className="rounded-3xl bg-ink p-5 text-white shadow-[0_18px_45px_rgba(22,22,29,0.14)]">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10">
                <Building2 size={18} />
              </div>

              <p className="mt-5 text-[10px] font-bold uppercase tracking-[0.15em] text-white/40">
                New property
              </p>

              <h2 className="mt-1.5 text-[18px] font-bold">
                {form.name.trim() || "Property profile"}
              </h2>

              <p className="mt-1 text-[12px] text-white/50">
                {form.city || form.state
                  ? [form.city, form.state].filter(Boolean).join(", ")
                  : "Location will appear here"}
              </p>

              <div className="mt-5 grid grid-cols-2 gap-2">
                <Summary
                  label="Status"
                  value={form.is_active ? "Active" : "Inactive"}
                />
                <Summary label="Country" value={form.country || "—"} />
              </div>
            </section>

            <section className="rounded-3xl border border-line bg-panel p-5">
              <div className="flex items-center gap-2">
                <ShieldCheck size={16} className="text-violet" />
                <span className="text-[12.5px] font-semibold">
                  Portfolio foundation
                </span>
              </div>
              <p className="mt-2 text-[11.5px] leading-5 text-muted">
                Buildings and units can be attached to this property after it is
                created.
              </p>
            </section>
          </aside>
        </div>

        <FormFooter
          cancel={() => navigate("/properties")}
          submitting={submitting}
          label="Add property"
        />

        {formError && <ErrorBox message={formError} />}
      </form>
    </div>
  );
}

const cardClass =
  "overflow-hidden rounded-3xl border border-line bg-panel shadow-[0_12px_35px_rgba(22,22,29,0.035)]";

function Header({
  onBack,
  eyebrow,
  title,
  description,
}: {
  onBack: () => void;
  eyebrow: string;
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
          {eyebrow}
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
      <p className="mt-1 text-[12px] font-semibold text-white/90">{value}</p>
    </div>
  );
}

function FormFooter({
  cancel,
  submitting,
  label,
}: {
  cancel: () => void;
  submitting: boolean;
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
        disabled={submitting}
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

const inputClass = (error?: string[]) =>
  [
    "mt-2 w-full rounded-2xl border bg-white px-3.5 py-3 text-[13px] text-ink outline-none transition-all placeholder:text-muted/50",
    "focus:border-violet/50 focus:ring-4 focus:ring-violet-pale/70",
    error?.length ? "border-rose-300" : "border-line hover:border-ink/15",
  ].join(" ");
