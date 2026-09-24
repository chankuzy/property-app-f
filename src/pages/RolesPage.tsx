// src/pages/RolesPage.tsx
import { useEffect, useMemo, useState } from "react";
import {
  Check,
  ChevronRight,
  LockKeyhole,
  Save,
  ShieldCheck,
  SlidersHorizontal,
  Users,
} from "lucide-react";
import {
  useRoles,
  usePermissions,
  updateRolePermissions,
} from "../hooks/useRoles";
import { showToast } from "../lib/toast";
import { ApiError } from "../lib/api";
import type { Permission, RoleWithPermissions } from "../types";

export default function RolesPage() {
  const {
    data: roles,
    loading: rolesLoading,
    error: rolesError,
    refetch,
  } = useRoles();
  const { data: permissions, loading: permissionsLoading } = usePermissions();
  const [activeRoleId, setActiveRoleId] = useState<number | null>(null);

  useEffect(() => {
    if (roles && roles.length > 0 && activeRoleId === null) {
      setActiveRoleId(roles[0].id);
    }
  }, [roles, activeRoleId]);

  const activeRole = roles?.find((role) => role.id === activeRoleId) ?? null;
  const loading = rolesLoading || permissionsLoading;

  const totalPermissions = permissions?.length ?? 0;

  return (
    <div className="animate-fade-up">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="mb-1.5 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted">
            <span>Administration</span>
            <ChevronRight size={12} />
            <span>Access control</span>
          </div>

          <h1 className="text-[21px] font-bold tracking-[-0.02em] text-ink sm:text-[24px]">
            Roles &amp; permissions
          </h1>

          <p className="mt-1 max-w-2xl text-[13px] leading-5 text-muted">
            Control what each staff role can access across the property system.
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-2 rounded-full border border-line bg-panel px-3.5 py-2 text-[12px] text-muted">
          <SlidersHorizontal size={14} strokeWidth={1.8} />
          <span>{roles?.length ?? 0} roles</span>
          <span className="h-1 w-1 rounded-full bg-line" />
          <span>{totalPermissions} permissions</span>
        </div>
      </div>

      {rolesError && (
        <div className="rounded-3xl border border-dashed border-line bg-panel px-5 py-10 text-center">
          <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-2xl bg-page text-muted">
            <ShieldCheck size={20} strokeWidth={1.7} />
          </div>

          <p className="mt-3 text-[13px] font-medium text-ink">
            Couldn’t load roles
          </p>

          <p className="mt-1 text-[12px] text-muted">{rolesError}</p>
        </div>
      )}

      {!rolesError && (
        <div className="grid min-w-0 gap-4 lg:grid-cols-[270px_minmax(0,1fr)]">
          {/* Role navigation */}
          <aside className="rounded-3xl border border-line bg-panel p-2.5">
            <div className="px-3 py-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.11em] text-muted">
                Staff roles
              </p>
              <p className="mt-1 text-[12px] text-muted">
                Select a role to manage its access.
              </p>
            </div>

            {loading && (
              <div className="space-y-2 px-1 pb-1">
                {Array.from({ length: 4 }).map((_, index) => (
                  <div
                    key={index}
                    className="h-[62px] animate-pulse rounded-2xl bg-page"
                  />
                ))}
              </div>
            )}

            {!loading && (roles ?? []).length === 0 && (
              <div className="px-3 pb-4 pt-5 text-center">
                <Users
                  size={18}
                  strokeWidth={1.7}
                  className="mx-auto text-muted"
                />
                <p className="mt-2 text-[12.5px] text-muted">
                  No roles defined.
                </p>
              </div>
            )}

            {!loading &&
              (roles ?? []).map((role) => {
                const isActive = activeRoleId === role.id;
                const isSuperAdmin = role.name === "super_admin";
                const permissionCount = isSuperAdmin
                  ? totalPermissions
                  : (role.permissions?.length ?? 0);

                return (
                  <button
                    key={role.id}
                    type="button"
                    onClick={() => setActiveRoleId(role.id)}
                    className={[
                      "group mb-1 flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left transition-all",
                      isActive
                        ? "bg-ink text-white shadow-[0_8px_22px_rgba(22,22,29,0.14)]"
                        : "text-ink hover:bg-page/70",
                    ].join(" ")}
                  >
                    <span
                      className={[
                        "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl",
                        isActive
                          ? "bg-white/10 text-white"
                          : "bg-page text-muted group-hover:text-ink",
                      ].join(" ")}
                    >
                      {isSuperAdmin ? (
                        <LockKeyhole size={16} strokeWidth={1.8} />
                      ) : (
                        <ShieldCheck size={16} strokeWidth={1.8} />
                      )}
                    </span>

                    <span className="min-w-0 flex-1">
                      <span
                        className={[
                          "block truncate text-[13px] font-semibold",
                          isActive ? "text-white" : "text-ink",
                        ].join(" ")}
                      >
                        {role.label}
                      </span>

                      <span
                        className={[
                          "mt-0.5 block text-[11px]",
                          isActive ? "text-white/55" : "text-muted",
                        ].join(" ")}
                      >
                        {isSuperAdmin
                          ? "Full system access"
                          : `${permissionCount} permission${permissionCount === 1 ? "" : "s"}`}
                      </span>
                    </span>

                    <ChevronRight
                      size={14}
                      strokeWidth={1.8}
                      className={isActive ? "text-white/60" : "text-muted/60"}
                    />
                  </button>
                );
              })}
          </aside>

          {/* Permission editor */}
          <section className="min-w-0 rounded-3xl border border-line bg-panel p-4 sm:p-5 lg:p-6">
            {!loading && activeRole && (
              <PermissionMatrix
                key={activeRole.id}
                role={activeRole}
                allPermissions={permissions ?? []}
                onSaved={refetch}
              />
            )}

            {!loading && !activeRole && (
              <div className="flex min-h-[320px] items-center justify-center text-center">
                <div>
                  <ShieldCheck
                    size={22}
                    strokeWidth={1.7}
                    className="mx-auto text-muted"
                  />
                  <p className="mt-3 text-[13px] font-medium text-ink">
                    Select a role
                  </p>
                  <p className="mt-1 text-[12px] text-muted">
                    Choose a staff role to view its permissions.
                  </p>
                </div>
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  );
}

function PermissionMatrix({
  role,
  allPermissions,
  onSaved,
}: {
  role: RoleWithPermissions;
  allPermissions: Permission[];
  onSaved: () => void;
}) {
  const [selected, setSelected] = useState<Set<string>>(
    new Set(role.permissions ?? []),
  );
  const [saving, setSaving] = useState(false);

  const isSuperAdmin = role.name === "super_admin";

  const groups = useMemo(() => {
    const grouped = new Map<string, Permission[]>();

    for (const permission of allPermissions) {
      const [group] = permission.name.split(".");

      if (!grouped.has(group)) {
        grouped.set(group, []);
      }

      grouped.get(group)!.push(permission);
    }

    return Array.from(grouped.entries());
  }, [allPermissions]);

  const original = role.permissions ?? [];

  const hasChanges = useMemo(() => {
    if (isSuperAdmin) return false;

    if (selected.size !== original.length) {
      return true;
    }

    return original.some((permission) => !selected.has(permission));
  }, [isSuperAdmin, original, selected]);

  const selectedCount = isSuperAdmin ? allPermissions.length : selected.size;

  function toggle(permission: string) {
    if (isSuperAdmin) return;

    setSelected((previous) => {
      const next = new Set(previous);

      if (next.has(permission)) {
        next.delete(permission);
      } else {
        next.add(permission);
      }

      return next;
    });
  }

  async function save() {
    if (isSuperAdmin || !hasChanges) return;

    setSaving(true);

    try {
      await updateRolePermissions(role.id, Array.from(selected));

      showToast(`${role.label} permissions saved.`, "success");
      onSaved();
    } catch (err) {
      showToast(
        err instanceof ApiError ? err.message : "Could not reach the server.",
        "error",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      {/* Role header */}
      <div className="flex flex-col gap-4 border-b border-line pb-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-violet-pale text-violet">
            {isSuperAdmin ? (
              <LockKeyhole size={19} strokeWidth={1.8} />
            ) : (
              <ShieldCheck size={19} strokeWidth={1.8} />
            )}
          </div>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="truncate text-[16px] font-bold text-ink">
                {role.label}
              </h2>

              {isSuperAdmin && (
                <span className="rounded-full bg-page px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-muted">
                  Protected
                </span>
              )}
            </div>

            <p className="mt-0.5 text-[12px] text-muted">
              {isSuperAdmin
                ? "This role has unrestricted access to the system."
                : `${selectedCount} of ${allPermissions.length} permissions enabled`}
            </p>
          </div>
        </div>

        {!isSuperAdmin && (
          <button
            type="button"
            disabled={saving || !hasChanges}
            onClick={save}
            className={[
              "flex shrink-0 items-center justify-center gap-1.5 rounded-full px-4 py-2.5 text-[12.5px] font-semibold transition-all",
              hasChanges
                ? "bg-ink text-white shadow-[0_7px_18px_rgba(22,22,29,0.14)] hover:bg-ink/90"
                : "bg-page text-muted",
              "disabled:cursor-not-allowed disabled:opacity-60",
            ].join(" ")}
          >
            <Save size={14} strokeWidth={1.8} />
            {saving ? "Saving…" : hasChanges ? "Save changes" : "Saved"}
          </button>
        )}
      </div>

      {isSuperAdmin && (
        <div className="mt-4 flex items-start gap-3 rounded-2xl border border-line bg-page/60 px-4 py-3">
          <LockKeyhole
            size={15}
            strokeWidth={1.8}
            className="mt-0.5 shrink-0 text-muted"
          />

          <div>
            <p className="text-[12.5px] font-semibold text-ink">
              Full access is always enabled
            </p>
            <p className="mt-0.5 text-[11.5px] leading-5 text-muted">
              Super admins bypass this permission matrix, so individual
              permissions cannot be changed here.
            </p>
          </div>
        </div>
      )}

      {allPermissions.length === 0 ? (
        <div className="py-14 text-center">
          <SlidersHorizontal
            size={20}
            strokeWidth={1.7}
            className="mx-auto text-muted"
          />
          <p className="mt-3 text-[13px] font-medium text-ink">
            No permissions defined
          </p>
          <p className="mt-1 text-[12px] text-muted">
            Permissions will appear here once they are available.
          </p>
        </div>
      ) : (
        <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {groups.map(([group, perms]) => {
            const enabledInGroup = isSuperAdmin
              ? perms.length
              : perms.filter((permission) => selected.has(permission.name))
                  .length;

            return (
              <div
                key={group}
                className="overflow-hidden rounded-2xl border border-line bg-white"
              >
                <div className="flex items-center justify-between border-b border-line bg-page/40 px-4 py-3">
                  <div>
                    <p className="text-[12.5px] font-bold capitalize text-ink">
                      {group.replace(/[_-]/g, " ")}
                    </p>
                    <p className="mt-0.5 text-[10.5px] text-muted">
                      {enabledInGroup}/{perms.length} enabled
                    </p>
                  </div>

                  <span className="flex h-7 min-w-7 items-center justify-center rounded-lg bg-page px-2 text-[10.5px] font-semibold text-muted">
                    {perms.length}
                  </span>
                </div>

                <div className="divide-y divide-line">
                  {perms.map((permission) => {
                    const enabled =
                      isSuperAdmin || selected.has(permission.name);

                    return (
                      <button
                        key={permission.name}
                        type="button"
                        disabled={isSuperAdmin}
                        onClick={() => toggle(permission.name)}
                        className={[
                          "flex w-full items-center gap-3 px-4 py-3 text-left transition-colors",
                          isSuperAdmin ? "cursor-default" : "hover:bg-page/45",
                        ].join(" ")}
                      >
                        <span
                          className={[
                            "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg transition-colors",
                            enabled
                              ? "bg-violet text-white"
                              : "bg-page text-muted",
                          ].join(" ")}
                        >
                          <Check
                            size={14}
                            strokeWidth={2.2}
                            className={enabled ? "opacity-100" : "opacity-0"}
                          />
                        </span>

                        <span className="min-w-0 flex-1">
                          <span className="block text-[12.5px] font-medium text-ink">
                            {permission.label}
                          </span>

                          <span className="mt-0.5 block truncate text-[10.5px] text-muted">
                            {permission.name}
                          </span>
                        </span>

                        <span
                          className={[
                            "relative h-5 w-9 shrink-0 rounded-full transition-colors",
                            enabled ? "bg-violet" : "bg-line",
                          ].join(" ")}
                        >
                          <span
                            className={[
                              "absolute top-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-transform",
                              enabled
                                ? "translate-x-[17px]"
                                : "translate-x-0.5",
                            ].join(" ")}
                          />
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {!isSuperAdmin && hasChanges && (
        <div className="sticky bottom-3 mt-4 flex items-center justify-between gap-3 rounded-2xl border border-line bg-white/95 px-4 py-3 shadow-[0_10px_30px_rgba(20,18,45,0.12)] backdrop-blur">
          <div className="min-w-0">
            <p className="text-[12px] font-semibold text-ink">
              Unsaved changes
            </p>
            <p className="text-[10.5px] text-muted">
              Save this role to apply the updated access.
            </p>
          </div>

          <button
            type="button"
            disabled={saving}
            onClick={save}
            className="flex shrink-0 items-center gap-1.5 rounded-full bg-ink px-3.5 py-2 text-[11.5px] font-semibold text-white hover:bg-ink/90 disabled:opacity-50"
          >
            <Save size={13} strokeWidth={1.8} />
            {saving ? "Saving…" : "Save"}
          </button>
        </div>
      )}
    </div>
  );
}
