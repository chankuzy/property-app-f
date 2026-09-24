import { useState } from "react";
import {
  Bell,
  ChevronDown,
  Command,
  KeyRound,
  LogOut,
  Menu,
  Search,
} from "lucide-react";
import { avatarUrl } from "../../lib/avatar";
import type { StoredUser } from "../../lib/auth";
import { useRoute } from "../../lib/router";
import { useDashboard } from "../../hooks/useDashboard";
import ChangePasswordModal from "../auth/ChangePasswordModal";

export default function Topbar({
  user,
  onLogout,
  onOpenMenu,
}: {
  user: StoredUser;
  onLogout: () => void;
  onOpenMenu: () => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [passwordOpen, setPasswordOpen] = useState(false);

  const { navigate } = useRoute();
  const { data: summary } = useDashboard();
  const unread = summary?.unread_alerts ?? 0;

  return (
    <>
      <header className="sticky top-0 z-30 flex h-[72px] shrink-0 items-center gap-3 border-b border-line bg-panel/95 px-4 backdrop-blur-md sm:px-6 lg:px-7">
        {/* Mobile menu */}
        <button
          type="button"
          onClick={onOpenMenu}
          aria-label="Open navigation"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-line bg-white text-ink/65 transition-colors hover:bg-page hover:text-ink active:scale-95 lg:hidden"
        >
          <Menu size={17} strokeWidth={1.8} />
        </button>

        {/* Search */}
        <div className="group flex h-10 min-w-0 flex-1 items-center gap-2.5 rounded-xl border border-line bg-page/45 px-3.5 transition-colors focus-within:border-violet/40 focus-within:bg-white sm:max-w-[430px]">
          <Search size={15} strokeWidth={1.9} className="shrink-0 text-muted" />

          <input
            type="text"
            placeholder="Search anything…"
            className="min-w-0 flex-1 bg-transparent text-[12.5px] text-ink outline-none placeholder:text-muted/70"
          />

          <div className="hidden items-center gap-1 sm:flex">
            <span className="flex h-6 items-center gap-0.5 rounded-md border border-line bg-white px-1.5 text-[9.5px] font-medium text-muted shadow-sm">
              <Command size={10} strokeWidth={1.8} />K
            </span>
          </div>
        </div>

        <div className="ml-auto flex items-center gap-2">
          {/* Notifications */}
          <button
            type="button"
            onClick={() => navigate("/notifications")}
            aria-label={
              unread > 0 ? `${unread} unread notifications` : "Notifications"
            }
            className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-line bg-white text-ink/60 transition-all hover:bg-page hover:text-ink active:scale-95"
          >
            <Bell size={17} strokeWidth={1.8} />

            {unread > 0 && (
              <span className="absolute right-1.5 top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full border-2 border-white bg-violet px-1 text-[8px] font-bold text-white">
                {unread > 9 ? "9+" : unread}
              </span>
            )}
          </button>

          {/* User */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setMenuOpen((value) => !value)}
              className="flex items-center gap-2 rounded-xl p-1.5 transition-colors hover:bg-page"
            >
              <img
                src={avatarUrl(user.email, 72)}
                alt={user.name}
                className="h-8 w-8 rounded-lg object-cover"
              />

              <div className="hidden min-w-0 text-left xl:block">
                <p className="max-w-[130px] truncate text-[11.5px] font-semibold text-ink">
                  {user.name}
                </p>

                <p className="max-w-[130px] truncate text-[9.5px] text-muted">
                  {user.role?.label ?? "No role"}
                </p>
              </div>

              <ChevronDown
                size={14}
                strokeWidth={1.8}
                className={[
                  "hidden text-muted transition-transform xl:block",
                  menuOpen ? "rotate-180" : "",
                ].join(" ")}
              />
            </button>

            {menuOpen && (
              <>
                <button
                  type="button"
                  aria-label="Close account menu"
                  className="fixed inset-0 z-10 cursor-default"
                  onClick={() => setMenuOpen(false)}
                />

                <div className="animate-scale-in absolute right-0 top-[52px] z-20 w-[230px] origin-top-right overflow-hidden rounded-2xl border border-line bg-white shadow-[0_18px_45px_rgba(20,18,45,0.14)]">
                  <div className="border-b border-line bg-page/40 px-4 py-3.5">
                    <div className="flex items-center gap-3">
                      <img
                        src={avatarUrl(user.email, 72)}
                        alt=""
                        className="h-9 w-9 rounded-xl object-cover"
                      />

                      <div className="min-w-0">
                        <p className="truncate text-[12.5px] font-semibold text-ink">
                          {user.name}
                        </p>

                        <p className="truncate text-[10.5px] text-muted">
                          {user.email}
                        </p>
                      </div>
                    </div>

                    <div className="mt-3 flex items-center gap-1.5">
                      <span className="rounded-full bg-violet-pale px-2 py-1 text-[9.5px] font-semibold text-violet">
                        {user.role?.label ?? "No role"}
                      </span>

                      <span className="rounded-full bg-good-bg px-2 py-1 text-[9.5px] font-semibold text-good-text">
                        Active
                      </span>
                    </div>
                  </div>

                  <div className="p-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        setMenuOpen(false);
                        setPasswordOpen(true);
                      }}
                      className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-[12px] font-medium text-ink/75 transition-colors hover:bg-page hover:text-ink"
                    >
                      <KeyRound size={14} strokeWidth={1.8} />
                      Change password
                    </button>

                    <button
                      type="button"
                      onClick={onLogout}
                      className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-[12px] font-medium text-rose-600 transition-colors hover:bg-rose-50"
                    >
                      <LogOut size={14} strokeWidth={1.8} />
                      Sign out
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      <ChangePasswordModal
        open={passwordOpen}
        onClose={() => setPasswordOpen(false)}
      />
    </>
  );
}
