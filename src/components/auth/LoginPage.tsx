import { useState, type FormEvent } from "react";
import {
  ArrowRight,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  ShieldCheck,
} from "lucide-react";
import { api, ApiError } from "../../lib/api";
import { setSession } from "../../lib/auth";

interface LoginResponse {
  data: {
    token: string;
    token_type: string;
    user: {
      id: number;
      name: string;
      email: string;
      phone: string | null;
      is_active: boolean;
      role: { id: number; name: string; label: string } | null;
      permissions: string[];
    };
  };
}

export default function LoginPage({ onLoggedIn }: { onLoggedIn: () => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const res = await api.post<LoginResponse>("/auth/login", {
        email,
        password,
        device_name: "web",
      });

      setSession(res.data.token, res.data.user);
      onLoggedIn();
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Could not reach the server.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-page">
      <div className="grid min-h-screen lg:grid-cols-[minmax(0,1.05fr)_minmax(420px,0.95fr)]">
        {/* Brand panel */}
        <section className="relative hidden overflow-hidden bg-ink lg:flex">
          <div className="absolute inset-0">
            <div className="absolute -left-32 -top-32 h-[520px] w-[520px] rounded-full bg-violet/20 blur-[110px]" />
            <div className="absolute -bottom-40 right-[-100px] h-[500px] w-[500px] rounded-full bg-violet/10 blur-[120px]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_35%,rgba(255,255,255,0.055)_0,transparent_32%)]" />
          </div>

          <div className="relative flex w-full flex-col justify-between p-10 xl:p-14">
            <div className="flex items-center gap-3">
              <BrandMark />
              <span className="text-[15px] font-extrabold tracking-[-0.02em] text-white">
                HEITKAMP
              </span>
            </div>

            <div className="max-w-xl">
              <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.16em] text-violet-soft">
                Property operations
              </p>

              <h1 className="max-w-lg text-[42px] font-bold leading-[1.05] tracking-[-0.045em] text-white xl:text-[52px]">
                Your properties.
                <br />
                One clear view.
              </h1>

              <p className="mt-6 max-w-md text-[14px] leading-6 text-white/45">
                Manage properties, units, tenants, leases and rent operations
                from one focused workspace.
              </p>

              <div className="mt-8 flex flex-wrap gap-2">
                <FeaturePill icon={ShieldCheck} label="Secure workspace" />
                <FeaturePill icon={LockKeyhole} label="Staff access" />
              </div>
            </div>

            <p className="text-[11px] text-white/25">
              HEITKAMP · Property Management
            </p>
          </div>
        </section>

        {/* Login panel */}
        <main className="flex min-h-screen items-center justify-center px-5 py-10 sm:px-8 lg:min-h-0 lg:px-12 xl:px-20">
          <div className="w-full max-w-[420px]">
            <div className="mb-10 flex items-center gap-2.5 lg:hidden">
              <BrandMark />
              <span className="text-[15px] font-extrabold tracking-[-0.02em] text-ink">
                HEITKAMP
              </span>
            </div>

            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.13em] text-violet">
                Staff portal
              </p>

              <h2 className="mt-2 text-[28px] font-bold tracking-[-0.035em] text-ink sm:text-[31px]">
                Welcome back
              </h2>

              <p className="mt-2 text-[13px] leading-5 text-muted">
                Sign in to continue to your property workspace.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="mt-8">
              <label className="block">
                <span className="text-[12px] font-semibold text-ink/75">
                  Email address
                </span>

                <div className="relative mt-2">
                  <Mail
                    size={16}
                    strokeWidth={1.8}
                    className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted"
                  />

                  <input
                    type="email"
                    required
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="h-12 w-full rounded-2xl border border-line bg-white pl-11 pr-4 text-[13.5px] text-ink outline-none transition-all placeholder:text-muted/60 focus:border-violet/50 focus:ring-4 focus:ring-violet-soft/50"
                  />
                </div>
              </label>

              <label className="mt-5 block">
                <div className="flex items-center justify-between">
                  <span className="text-[12px] font-semibold text-ink/75">
                    Password
                  </span>
                </div>

                <div className="relative mt-2">
                  <LockKeyhole
                    size={16}
                    strokeWidth={1.8}
                    className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted"
                  />

                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="h-12 w-full rounded-2xl border border-line bg-white pl-11 pr-12 text-[13.5px] text-ink outline-none transition-all placeholder:text-muted/60 focus:border-violet/50 focus:ring-4 focus:ring-violet-soft/50"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword((value) => !value)}
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                    className="absolute right-2.5 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-xl text-muted transition-colors hover:bg-page hover:text-ink"
                  >
                    {showPassword ? (
                      <EyeOff size={16} strokeWidth={1.8} />
                    ) : (
                      <Eye size={16} strokeWidth={1.8} />
                    )}
                  </button>
                </div>
              </label>

              {error && (
                <div className="mt-5 rounded-2xl border border-rose-200 bg-rose-50 px-3.5 py-3">
                  <p className="text-[12px] leading-5 text-rose-600">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="group mt-6 flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-ink px-4 text-[13.5px] font-semibold text-white shadow-[0_8px_20px_rgba(22,22,29,0.12)] transition-all hover:-translate-y-0.5 hover:bg-ink/90 hover:shadow-[0_12px_26px_rgba(22,22,29,0.16)] disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? (
                  "Signing in…"
                ) : (
                  <>
                    Sign in
                    <ArrowRight
                      size={16}
                      strokeWidth={1.8}
                      className="transition-transform group-hover:translate-x-0.5"
                    />
                  </>
                )}
              </button>
            </form>

            <div className="mt-8 flex items-center gap-3">
              <div className="h-px flex-1 bg-line" />
              <span className="text-[10.5px] font-medium text-muted">
                Authorized staff only
              </span>
              <div className="h-px flex-1 bg-line" />
            </div>

            <p className="mt-8 text-center text-[11px] leading-5 text-muted">
              Access to this workspace is intended for authorized property
              management staff.
            </p>
          </div>
        </main>
      </div>
    </div>
  );
}

function BrandMark() {
  return (
    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet shadow-[0_6px_18px_rgba(124,108,240,0.28)]">
      <svg
        width="17"
        height="17"
        viewBox="0 0 16 16"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M2 3.5 8 8l6-4.5M2 12.5 8 8l6 4.5"
          stroke="white"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}

function FeaturePill({
  icon: Icon,
  label,
}: {
  icon: typeof ShieldCheck;
  label: string;
}) {
  return (
    <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.055] px-3 py-2">
      <Icon size={13} strokeWidth={1.8} className="text-violet-soft" />
      <span className="text-[10.5px] font-medium text-white/55">{label}</span>
    </div>
  );
}
