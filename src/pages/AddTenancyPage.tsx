// src/pages/AddTenancyPage.tsx
import { useState, type FormEvent, type ReactNode } from "react";
import {
  ArrowLeft,
  CalendarDays,
  Check,
  ChevronDown,
  Handshake,
  Home,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { api, ApiError } from "../lib/api";
import { showToast } from "../lib/toast";
import { useRoute } from "../lib/router";
import { useAllTenants } from "../hooks/useTenants";
import { useAllUnits } from "../hooks/useUnits";
import type { BillingCycle } from "../types";

interface FormState {
  tenant_id: string;
  unit_id: string;
  start_date: string;
  end_date: string;
  billing_cycle: BillingCycle;
  rent_amount: string;
  deposit_amount: string;
}

const initialState: FormState = {
  tenant_id: "",
  unit_id: "",
  start_date: "",
  end_date: "",
  billing_cycle: "monthly",
  rent_amount: "",
  deposit_amount: "",
};

export default function AddTenancyPage() {
  const { navigate } = useRoute();
  const { data: tenantsData, loading: tenantsLoading } = useAllTenants();
  const { data: unitsData, loading: unitsLoading } = useAllUnits();

  const tenants = tenantsData?.data ?? [];
  const units = unitsData?.data ?? [];

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
      tenant_id: Number(form.tenant_id),
      unit_id: Number(form.unit_id),
      start_date: form.start_date,
      end_date: form.end_date,
      billing_cycle: form.billing_cycle,
      rent_amount: Number(form.rent_amount),
    };

    if (form.deposit_amount) {
      payload.deposit_amount = Number(form.deposit_amount);
    }

    try {
      await api.post("/tenancies", payload);
      showToast("Tenancy was created.", "success");
      navigate("/tenancies");
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

  const selectedTenant = tenants.find(
    (tenant) => String(tenant.id) === form.tenant_id,
  );

  const selectedUnit = units.find((unit) => String(unit.id) === form.unit_id);

  const loadingPickers = tenantsLoading || unitsLoading;

  return (
    <div className="animate-fade-up">
      <Header
        onBack={() => navigate("/tenancies")}
        title="Create tenancy"
        description="Link a tenant to a unit for a defined lease term."
      />

      <form onSubmit={handleSubmit} className="mt-6">
        <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_310px]">
          <div className="space-y-5">
            <section className={cardClass}>
              <SectionHeader
                icon={<Handshake size={17} />}
                eyebrow="Lease parties"
                title="Tenant & unit"
                description="Choose the people and property involved in this tenancy."
              />

              <div className="grid grid-cols-1 gap-5 p-5 sm:grid-cols-2 sm:p-6">
                <Field
                  label="Tenant"
                  required
                  error={errors.tenant_id}
                  icon={<UserRound size={15} />}
                >
                  <Select
                    value={form.tenant_id}
                    onChange={(value) => update("tenant_id", value)}
                    disabled={loadingPickers}
                  >
                    <option value="" disabled>
                      {tenantsLoading ? "Loading tenants…" : "Select a tenant"}
                    </option>
                    {tenants.map((tenant) => (
                      <option key={tenant.id} value={tenant.id}>
                        {tenant.full_name} — {tenant.phone}
                      </option>
                    ))}
                  </Select>
                </Field>

                <Field
                  label="Unit"
                  required
                  error={errors.unit_id}
                  icon={<Home size={15} />}
                >
                  <Select
                    value={form.unit_id}
                    onChange={(value) => update("unit_id", value)}
                    disabled={loadingPickers}
                  >
                    <option value="" disabled>
                      {unitsLoading ? "Loading units…" : "Select a unit"}
                    </option>
                    {units.map((unit) => (
                      <option key={unit.id} value={unit.id}>
                        {unit.code} —{" "}
                        {unit.property?.name ?? `Property #${unit.property_id}`}
                      </option>
                    ))}
                  </Select>
                </Field>
              </div>
            </section>

            <section className={cardClass}>
              <SectionHeader
                icon={<CalendarDays size={17} />}
                eyebrow="Lease term"
                title="Dates & billing"
                description="Define when the tenancy starts, ends and how rent is billed."
              />

              <div className="grid grid-cols-1 gap-5 p-5 sm:grid-cols-2 sm:p-6">
                <Field
                  label="Start date"
                  required
                  error={errors.start_date}
                  icon={<CalendarDays size={15} />}
                >
                  <input
                    type="date"
                    required
                    value={form.start_date}
                    onChange={(e) => update("start_date", e.target.value)}
                    className={inputClass(errors.start_date)}
                  />
                </Field>

                <Field
                  label="End date"
                  required
                  error={errors.end_date}
                  icon={<CalendarDays size={15} />}
                >
                  <input
                    type="date"
                    required
                    value={form.end_date}
                    onChange={(e) => update("end_date", e.target.value)}
                    className={inputClass(errors.end_date)}
                  />
                </Field>

                <Field
                  label="Billing cycle"
                  required
                  error={errors.billing_cycle}
                >
                  <Select
                    value={form.billing_cycle}
                    onChange={(value) =>
                      update("billing_cycle", value as BillingCycle)
                    }
                  >
                    <option value="monthly">Monthly</option>
                    <option value="quarterly">Quarterly</option>
                    <option value="biannual">Biannual</option>
                    <option value="annual">Annual</option>
                  </Select>
                </Field>

                <Field
                  label="Rent amount (₦)"
                  required
                  error={errors.rent_amount}
                >
                  <input
                    type="number"
                    min={0}
                    required
                    value={form.rent_amount}
                    onChange={(e) => update("rent_amount", e.target.value)}
                    className={inputClass(errors.rent_amount)}
                    placeholder="500000"
                  />
                </Field>

                <Field label="Deposit amount (₦)" error={errors.deposit_amount}>
                  <input
                    type="number"
                    min={0}
                    value={form.deposit_amount}
                    onChange={(e) => update("deposit_amount", e.target.value)}
                    className={inputClass(errors.deposit_amount)}
                    placeholder="100000"
                  />
                </Field>
              </div>
            </section>
          </div>

          <aside className="space-y-5 xl:sticky xl:top-5 xl:self-start">
            <section className="rounded-3xl bg-ink p-5 text-white shadow-[0_18px_45px_rgba(22,22,29,0.14)]">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10">
                <Handshake size={18} />
              </div>

              <p className="mt-5 text-[10px] font-bold uppercase tracking-[0.15em] text-white/40">
                New tenancy
              </p>

              <h2 className="mt-1.5 text-[17px] font-bold">
                {selectedTenant?.full_name || "Tenant not selected"}
              </h2>

              <p className="mt-1 text-[12px] text-white/50">
                {selectedUnit?.code || "Unit not selected"}
              </p>

              <div className="mt-5 space-y-2">
                <Summary label="Billing" value={form.billing_cycle} />
                <Summary
                  label="Rent"
                  value={
                    form.rent_amount
                      ? `₦${Number(form.rent_amount).toLocaleString()}`
                      : "—"
                  }
                />
                <Summary
                  label="Term"
                  value={
                    form.start_date && form.end_date
                      ? `${form.start_date} → ${form.end_date}`
                      : "Dates pending"
                  }
                />
              </div>
            </section>

            <section className="rounded-3xl border border-line bg-panel p-5">
              <div className="flex items-center gap-2">
                <ShieldCheck size={16} className="text-violet" />
                <span className="text-[12.5px] font-semibold">
                  Lease record
                </span>
              </div>
              <p className="mt-2 text-[11.5px] leading-5 text-muted">
                Creating the tenancy establishes the relationship between the
                tenant and unit.
              </p>
            </section>
          </aside>
        </div>

        {formError && <ErrorBox message={formError} />}

        <FormFooter
          cancel={() => navigate("/tenancies")}
          submitting={submitting}
          label="Create tenancy"
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
          Leasing
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
        className={`${inputClass()} appearance-none pr-10 disabled:bg-page/60`}
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
      <p className="mt-1 truncate text-[12px] font-semibold capitalize text-white/90">
        {value}
      </p>
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
