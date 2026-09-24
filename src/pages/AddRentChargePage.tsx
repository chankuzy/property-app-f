// src/pages/AddRentChargePage.tsx
import { useState, type FormEvent, type ReactNode } from "react";
import {
  ArrowLeft,
  CalendarDays,
  Check,
  ChevronDown,
  CircleDollarSign,
  Receipt,
  ShieldCheck,
} from "lucide-react";
import { api, ApiError } from "../lib/api";
import { showToast } from "../lib/toast";
import { useRoute } from "../lib/router";
import { useAllTenancies } from "../hooks/useTenancies";

interface FormState {
  tenancy_id: string;
  period_start: string;
  period_end: string;
  due_date: string;
  amount_due: string;
}

const initialState: FormState = {
  tenancy_id: "",
  period_start: "",
  period_end: "",
  due_date: "",
  amount_due: "",
};

export default function AddRentChargePage() {
  const { navigate } = useRoute();
  const { data: tenanciesData, loading: tenanciesLoading } = useAllTenancies({
    status: "active",
  });

  const tenancies = tenanciesData?.data ?? [];

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

  function onTenancyChange(id: string) {
    update("tenancy_id", id);

    const tenancy = tenancies.find((item) => String(item.id) === id);

    if (tenancy && !form.amount_due) {
      update("amount_due", tenancy.rent_amount);
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setErrors({});
    setFormError(null);

    const payload: Record<string, unknown> = {
      tenancy_id: Number(form.tenancy_id),
      period_start: form.period_start,
      period_end: form.period_end,
      due_date: form.due_date,
      amount_due: Number(form.amount_due),
    };

    try {
      await api.post("/rent-charges", payload);
      showToast("Rent charge was created.", "success");
      navigate("/rent-charges");
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

  const selectedTenancy = tenancies.find(
    (tenancy) => String(tenancy.id) === form.tenancy_id,
  );

  return (
    <div className="animate-fade-up">
      <Header
        onBack={() => navigate("/rent-charges")}
        title="Add rent charge"
        description="Create a rent charge against an active tenancy."
      />

      <form onSubmit={handleSubmit} className="mt-6">
        <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_310px]">
          <div className="space-y-5">
            <section className={cardClass}>
              <SectionHeader
                icon={<Receipt size={17} />}
                eyebrow="Charge details"
                title="Tenancy & amount"
                description="Choose the active tenancy and define the amount to be billed."
              />

              <div className="grid grid-cols-1 gap-5 p-5 sm:grid-cols-2 sm:p-6">
                <div className="sm:col-span-2">
                  <Field
                    label="Active tenancy"
                    required
                    error={errors.tenancy_id}
                    icon={<Receipt size={15} />}
                  >
                    <div className="relative">
                      <select
                        required
                        value={form.tenancy_id}
                        onChange={(e) => onTenancyChange(e.target.value)}
                        className={`${inputClass(errors.tenancy_id)} appearance-none pr-10`}
                        disabled={tenanciesLoading}
                      >
                        <option value="" disabled>
                          {tenanciesLoading
                            ? "Loading active tenancies…"
                            : "Select a tenancy"}
                        </option>

                        {tenancies.map((tenancy) => (
                          <option key={tenancy.id} value={tenancy.id}>
                            {tenancy.tenant?.full_name ??
                              `Tenant #${tenancy.tenant_id}`}
                            {" — "}
                            {tenancy.unit?.code ?? `Unit #${tenancy.unit_id}`}
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
                  label="Amount due (₦)"
                  required
                  error={errors.amount_due}
                  icon={<CircleDollarSign size={15} />}
                >
                  <input
                    type="number"
                    min={0}
                    required
                    value={form.amount_due}
                    onChange={(e) => update("amount_due", e.target.value)}
                    className={inputClass(errors.amount_due)}
                    placeholder="500000"
                  />
                </Field>
              </div>
            </section>

            <section className={cardClass}>
              <SectionHeader
                icon={<CalendarDays size={17} />}
                eyebrow="Billing period"
                title="Period & due date"
                description="Define the period this charge covers and when payment is due."
              />

              <div className="grid grid-cols-1 gap-5 p-5 sm:grid-cols-2 sm:p-6">
                <Field
                  label="Period start"
                  required
                  error={errors.period_start}
                  icon={<CalendarDays size={15} />}
                >
                  <input
                    type="date"
                    required
                    value={form.period_start}
                    onChange={(e) => update("period_start", e.target.value)}
                    className={inputClass(errors.period_start)}
                  />
                </Field>

                <Field
                  label="Period end"
                  required
                  error={errors.period_end}
                  icon={<CalendarDays size={15} />}
                >
                  <input
                    type="date"
                    required
                    value={form.period_end}
                    onChange={(e) => update("period_end", e.target.value)}
                    className={inputClass(errors.period_end)}
                  />
                </Field>

                <Field
                  label="Due date"
                  required
                  error={errors.due_date}
                  icon={<CalendarDays size={15} />}
                >
                  <input
                    type="date"
                    required
                    value={form.due_date}
                    onChange={(e) => update("due_date", e.target.value)}
                    className={inputClass(errors.due_date)}
                  />
                </Field>
              </div>
            </section>
          </div>

          <aside className="space-y-5 xl:sticky xl:top-5 xl:self-start">
            <section className="rounded-3xl bg-ink p-5 text-white shadow-[0_18px_45px_rgba(22,22,29,0.14)]">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10">
                <CircleDollarSign size={18} />
              </div>

              <p className="mt-5 text-[10px] font-bold uppercase tracking-[0.15em] text-white/40">
                New charge
              </p>

              <h2 className="mt-1.5 text-[25px] font-bold tracking-[-0.03em]">
                {form.amount_due
                  ? `₦${Number(form.amount_due).toLocaleString()}`
                  : "₦0"}
              </h2>

              <p className="mt-1 text-[12px] text-white/50">Amount due</p>

              <div className="mt-5 space-y-2">
                <Summary
                  label="Tenant"
                  value={selectedTenancy?.tenant?.full_name ?? "Not selected"}
                />

                <Summary
                  label="Unit"
                  value={selectedTenancy?.unit?.code ?? "Not selected"}
                />

                <Summary label="Due" value={form.due_date || "Date pending"} />
              </div>
            </section>

            <section className="rounded-3xl border border-line bg-panel p-5">
              <div className="flex items-center gap-2">
                <ShieldCheck size={16} className="text-violet" />
                <span className="text-[12.5px] font-semibold">
                  Collection record
                </span>
              </div>

              <p className="mt-2 text-[11.5px] leading-5 text-muted">
                The charge will be created against an active tenancy and will
                appear in the rent ledger.
              </p>
            </section>
          </aside>
        </div>

        {!tenanciesLoading && tenancies.length === 0 && (
          <div className="mt-4 rounded-2xl border border-warn-bg bg-warn-bg/50 px-4 py-3 text-[12.5px] text-warn-text">
            No active tenancies yet. Create a tenancy before adding a rent
            charge.
          </div>
        )}

        {formError && (
          <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-[12.5px] text-rose-700">
            {formError}
          </div>
        )}

        <FormFooter
          cancel={() => navigate("/rent-charges")}
          submitting={submitting}
          disabled={tenancies.length === 0}
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
          Finance
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
}: {
  cancel: () => void;
  submitting: boolean;
  disabled: boolean;
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
            <Check size={15} /> Add charge
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
