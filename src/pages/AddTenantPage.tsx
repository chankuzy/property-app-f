// src/pages/AddTenantPage.tsx
import { useState, type FormEvent, type ReactNode } from "react";
import {
  ArrowLeft,
  Check,
  ChevronDown,
  FileText,
  IdCard,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  UserRound,
  UsersRound,
} from "lucide-react";
import { api, ApiError } from "../lib/api";
import { showToast } from "../lib/toast";
import { useRoute } from "../lib/router";

interface FormState {
  full_name: string;
  phone: string;
  alt_phone: string;
  email: string;
  address: string;
  id_type: string;
  id_number: string;
  emergency_contact_name: string;
  emergency_contact_phone: string;
  emergency_contact_relationship: string;
  status: "active" | "inactive";
  sms_opt_in: boolean;
}

const initialState: FormState = {
  full_name: "",
  phone: "",
  alt_phone: "",
  email: "",
  address: "",
  id_type: "",
  id_number: "",
  emergency_contact_name: "",
  emergency_contact_phone: "",
  emergency_contact_relationship: "",
  status: "active",
  sms_opt_in: true,
};

const OPTIONAL_KEYS = [
  "alt_phone",
  "email",
  "address",
  "id_type",
  "id_number",
  "emergency_contact_name",
  "emergency_contact_phone",
  "emergency_contact_relationship",
] as const;

export default function AddTenantPage() {
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
      full_name: form.full_name,
      phone: form.phone,
      status: form.status,
      sms_opt_in: form.sms_opt_in,
    };

    for (const key of OPTIONAL_KEYS) {
      if (form[key]) payload[key] = form[key];
    }

    try {
      await api.post("/tenants", payload);

      showToast(`${form.full_name} was added.`, "success");
      navigate("/tenants");
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
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3.5">
          <button
            type="button"
            onClick={() => navigate("/tenants")}
            aria-label="Back to tenants"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-line bg-panel text-ink/65 shadow-sm transition-all hover:-translate-x-0.5 hover:bg-page/60 hover:text-ink"
          >
            <ArrowLeft size={17} strokeWidth={1.8} />
          </button>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-violet">
                People
              </span>
              <span className="text-muted/40">/</span>
              <span className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted">
                New tenant
              </span>
            </div>

            <h1 className="mt-1 text-[22px] font-bold tracking-[-0.025em] text-ink sm:text-[25px]">
              Add tenant
            </h1>

            <p className="mt-0.5 text-[13px] text-muted">
              Create a complete tenant record for your property portfolio.
            </p>
          </div>
        </div>

        <div className="hidden items-center gap-2 rounded-full border border-line bg-panel px-3.5 py-2 text-[11.5px] font-medium text-muted shadow-sm sm:flex">
          <ShieldCheck size={14} className="text-good-text" />
          Secure staff record
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mt-6">
        <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_310px]">
          {/* Main form */}
          <div className="space-y-5">
            {/* Identity */}
            <section className="overflow-hidden rounded-3xl border border-line bg-panel shadow-[0_12px_35px_rgba(22,22,29,0.035)]">
              <SectionHeader
                icon={<UserRound size={17} strokeWidth={1.8} />}
                eyebrow="Tenant profile"
                title="Identity & contact"
                description="The core information used across the tenant record."
              />

              <div className="grid grid-cols-1 gap-x-5 gap-y-5 p-5 sm:grid-cols-2 sm:p-6">
                <Field
                  label="Full name"
                  required
                  error={errors.full_name}
                  icon={<UserRound size={15} />}
                >
                  <input
                    required
                    value={form.full_name}
                    onChange={(e) => update("full_name", e.target.value)}
                    className={inputClass(errors.full_name)}
                    placeholder="e.g. Aisha Mohammed"
                    autoComplete="name"
                  />
                </Field>

                <Field
                  label="Phone"
                  required
                  error={errors.phone}
                  icon={<Phone size={15} />}
                >
                  <input
                    required
                    value={form.phone}
                    onChange={(e) => update("phone", e.target.value)}
                    className={inputClass(errors.phone)}
                    placeholder="+234..."
                    autoComplete="tel"
                  />
                </Field>

                <Field
                  label="Alternative phone"
                  error={errors.alt_phone}
                  icon={<Phone size={15} />}
                >
                  <input
                    value={form.alt_phone}
                    onChange={(e) => update("alt_phone", e.target.value)}
                    className={inputClass(errors.alt_phone)}
                    placeholder="+234..."
                    autoComplete="tel"
                  />
                </Field>

                <Field
                  label="Email address"
                  error={errors.email}
                  icon={<Mail size={15} />}
                >
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => update("email", e.target.value)}
                    className={inputClass(errors.email)}
                    placeholder="tenant@example.com"
                    autoComplete="email"
                  />
                </Field>

                <div className="sm:col-span-2">
                  <Field
                    label="Residential address"
                    error={errors.address}
                    icon={<MapPin size={15} />}
                  >
                    <input
                      value={form.address}
                      onChange={(e) => update("address", e.target.value)}
                      className={inputClass(errors.address)}
                      placeholder="Current residential address"
                      autoComplete="street-address"
                    />
                  </Field>
                </div>
              </div>
            </section>

            {/* Identification */}
            <section className="overflow-hidden rounded-3xl border border-line bg-panel shadow-[0_12px_35px_rgba(22,22,29,0.035)]">
              <SectionHeader
                icon={<IdCard size={17} strokeWidth={1.8} />}
                eyebrow="Verification"
                title="Identification"
                description="Optional identity details for the tenant record."
              />

              <div className="grid grid-cols-1 gap-x-5 gap-y-5 p-5 sm:grid-cols-2 sm:p-6">
                <Field
                  label="ID type"
                  error={errors.id_type}
                  icon={<FileText size={15} />}
                >
                  <input
                    value={form.id_type}
                    onChange={(e) => update("id_type", e.target.value)}
                    className={inputClass(errors.id_type)}
                    placeholder="National ID, passport, driver's licence..."
                  />
                </Field>

                <Field
                  label="ID number"
                  error={errors.id_number}
                  icon={<IdCard size={15} />}
                >
                  <input
                    value={form.id_number}
                    onChange={(e) => update("id_number", e.target.value)}
                    className={inputClass(errors.id_number)}
                    placeholder="Identification number"
                  />
                </Field>
              </div>
            </section>

            {/* Emergency */}
            <section className="overflow-hidden rounded-3xl border border-line bg-panel shadow-[0_12px_35px_rgba(22,22,29,0.035)]">
              <SectionHeader
                icon={<UsersRound size={17} strokeWidth={1.8} />}
                eyebrow="Emergency"
                title="Emergency contact"
                description="A secondary contact to reach when needed."
              />

              <div className="grid grid-cols-1 gap-x-5 gap-y-5 p-5 sm:grid-cols-2 lg:grid-cols-3 sm:p-6">
                <Field
                  label="Contact name"
                  error={errors.emergency_contact_name}
                  icon={<UserRound size={15} />}
                >
                  <input
                    value={form.emergency_contact_name}
                    onChange={(e) =>
                      update("emergency_contact_name", e.target.value)
                    }
                    className={inputClass(errors.emergency_contact_name)}
                    placeholder="Full name"
                  />
                </Field>

                <Field
                  label="Phone"
                  error={errors.emergency_contact_phone}
                  icon={<Phone size={15} />}
                >
                  <input
                    value={form.emergency_contact_phone}
                    onChange={(e) =>
                      update("emergency_contact_phone", e.target.value)
                    }
                    className={inputClass(errors.emergency_contact_phone)}
                    placeholder="+234..."
                  />
                </Field>

                <Field
                  label="Relationship"
                  error={errors.emergency_contact_relationship}
                  icon={<UsersRound size={15} />}
                >
                  <input
                    value={form.emergency_contact_relationship}
                    onChange={(e) =>
                      update("emergency_contact_relationship", e.target.value)
                    }
                    className={inputClass(
                      errors.emergency_contact_relationship,
                    )}
                    placeholder="Sister, brother, spouse..."
                  />
                </Field>
              </div>
            </section>
          </div>

          {/* Side panel */}
          <aside className="space-y-5 xl:sticky xl:top-5 xl:self-start">
            {/* Record settings */}
            <section className="overflow-hidden rounded-3xl border border-line bg-panel shadow-[0_12px_35px_rgba(22,22,29,0.035)]">
              <div className="border-b border-line p-5">
                <p className="text-[10.5px] font-bold uppercase tracking-[0.15em] text-violet">
                  Record settings
                </p>
                <h2 className="mt-1.5 text-[15px] font-bold text-ink">
                  Tenant status
                </h2>
                <p className="mt-1 text-[12px] leading-5 text-muted">
                  Choose how this tenant should appear in the directory.
                </p>
              </div>

              <div className="p-5">
                <Field
                  label="Status"
                  error={errors.status}
                  icon={<Check size={15} />}
                >
                  <div className="relative">
                    <select
                      value={form.status}
                      onChange={(e) =>
                        update(
                          "status",
                          e.target.value as "active" | "inactive",
                        )
                      }
                      className={`${inputClass(errors.status)} appearance-none pr-10`}
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>

                    <ChevronDown
                      size={15}
                      className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-muted"
                    />
                  </div>
                </Field>

                <div className="mt-5 rounded-2xl border border-line bg-page/45 p-4">
                  <label className="flex cursor-pointer items-start gap-3">
                    <input
                      type="checkbox"
                      checked={form.sms_opt_in}
                      onChange={(e) => update("sms_opt_in", e.target.checked)}
                      className="mt-0.5 h-4 w-4 rounded border-line accent-violet"
                    />

                    <span>
                      <span className="block text-[12.5px] font-semibold text-ink">
                        SMS notifications
                      </span>
                      <span className="mt-0.5 block text-[11.5px] leading-5 text-muted">
                        Allow rent and account reminders to be sent by SMS.
                      </span>
                    </span>
                  </label>
                </div>
              </div>
            </section>

            {/* Record summary */}
            <section className="overflow-hidden rounded-3xl bg-ink p-5 text-white shadow-[0_18px_45px_rgba(22,22,29,0.14)]">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10">
                <UserRound size={17} strokeWidth={1.8} />
              </div>

              <p className="mt-5 text-[10.5px] font-bold uppercase tracking-[0.15em] text-white/45">
                New record
              </p>

              <h2 className="mt-1.5 text-[17px] font-bold tracking-[-0.02em]">
                {form.full_name.trim() || "Tenant profile"}
              </h2>

              <p className="mt-1 text-[12px] leading-5 text-white/55">
                {form.phone.trim() || "Phone number will appear here"}
              </p>

              <div className="mt-5 grid grid-cols-2 gap-2">
                <SummaryItem
                  label="Status"
                  value={form.status === "active" ? "Active" : "Inactive"}
                />
                <SummaryItem
                  label="SMS"
                  value={form.sms_opt_in ? "Enabled" : "Off"}
                />
              </div>
            </section>

            {/* Help card */}
            <section className="rounded-3xl border border-line bg-panel p-5">
              <div className="flex items-center gap-2">
                <ShieldCheck size={16} className="text-violet" />
                <p className="text-[12.5px] font-semibold text-ink">
                  Record quality
                </p>
              </div>

              <p className="mt-2 text-[11.5px] leading-5 text-muted">
                Full name and phone are required. Identification and emergency
                contact details can be completed later.
              </p>
            </section>
          </aside>
        </div>

        {/* Error */}
        {formError && (
          <div className="mt-5 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-[12.5px] text-rose-700">
            {formError}
          </div>
        )}

        {/* Footer actions */}
        <div className="mt-5 flex flex-col-reverse gap-3 border-t border-line pt-5 sm:flex-row sm:items-center sm:justify-between">
          <button
            type="button"
            onClick={() => navigate("/tenants")}
            className="rounded-2xl px-4 py-2.5 text-[13px] font-medium text-ink/65 transition-colors hover:bg-panel hover:text-ink"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-ink px-6 py-3 text-[13px] font-semibold text-white shadow-[0_8px_20px_rgba(22,22,29,0.12)] transition-all hover:-translate-y-0.5 hover:bg-ink/90 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
          >
            {submitting ? (
              <>
                <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                Saving tenant…
              </>
            ) : (
              <>
                <Check size={15} strokeWidth={2.2} />
                Add tenant
              </>
            )}
          </button>
        </div>
      </form>
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
        <p className="text-[10.5px] font-bold uppercase tracking-[0.14em] text-violet">
          {eyebrow}
        </p>
        <h2 className="mt-1 text-[15px] font-bold tracking-[-0.01em] text-ink">
          {title}
        </h2>
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
        <p className="mt-1.5 text-[11.5px] font-medium text-rose-600">
          {error[0]}
        </p>
      )}
    </label>
  );
}

function SummaryItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-white/7 px-3 py-2.5">
      <p className="text-[9.5px] font-semibold uppercase tracking-[0.12em] text-white/40">
        {label}
      </p>
      <p className="mt-1 text-[12px] font-semibold text-white/90">{value}</p>
    </div>
  );
}

function inputClass(error?: string[]) {
  return [
    "mt-2 w-full rounded-2xl border bg-white px-3.5 py-3 text-[13px] font-normal text-ink outline-none transition-all placeholder:text-muted/55",
    "focus:border-violet/50 focus:ring-4 focus:ring-violet-pale/70",
    error?.length
      ? "border-rose-300 bg-rose-50/20 focus:border-rose-400 focus:ring-rose-100"
      : "border-line hover:border-ink/15",
  ].join(" ");
}
