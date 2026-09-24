import {
  LayoutGrid,
  Building2,
  Briefcase,
  BarChart3,
  Layers,
  Handshake,
  Receipt,
  Users as UsersIcon,
  ShieldCheck,
  PanelLeft,
  X,
} from "lucide-react";
import type { ComponentType } from "react";
import { useRoute } from "../../lib/router";

interface NavItem {
  label: string;
  icon: ComponentType<{
    size?: number;
    strokeWidth?: number;
    className?: string;
  }>;
  path: string;
}

interface NavGroup {
  title?: string;
  items: NavItem[];
}

const groups: NavGroup[] = [
  {
    title: "Workspace",
    items: [{ label: "Dashboard", icon: LayoutGrid, path: "/" }],
  },
  {
    title: "Portfolio",
    items: [
      { label: "Properties", icon: Building2, path: "/properties" },
      { label: "Buildings", icon: Layers, path: "/buildings" },
      { label: "Units", icon: Briefcase, path: "/units" },
    ],
  },
  {
    title: "Leasing",
    items: [
      { label: "Tenancies", icon: Handshake, path: "/tenancies" },
      { label: "Rent charges", icon: Receipt, path: "/rent-charges" },
      { label: "Reports", icon: BarChart3, path: "/reports" },
    ],
  },
  {
    title: "Administration",
    items: [
      { label: "Users", icon: UsersIcon, path: "/users" },
      { label: "Roles", icon: ShieldCheck, path: "/roles" },
    ],
  },
];

export default function Sidebar({
  collapsed,
  onToggleCollapsed,
  mobileOpen,
  onCloseMobile,
}: {
  collapsed: boolean;
  onToggleCollapsed: () => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}) {
  const { path, navigate } = useRoute();

  function isItemActive(item: NavItem) {
    if (item.path === "/") return path === "/";
    return path === item.path || path.startsWith(`${item.path}/`);
  }

  return (
    <>
      {mobileOpen && (
        <button
          type="button"
          aria-label="Close navigation"
          className="fixed inset-0 z-40 bg-ink/35 backdrop-blur-[2px] lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      <aside
        className={[
          "fixed inset-y-0 left-0 z-50 flex h-full shrink-0 flex-col border-r border-line bg-panel transition-transform duration-300 ease-out",
          "lg:sticky lg:top-0 lg:z-auto lg:h-screen lg:translate-x-0 lg:transition-[width] lg:duration-300",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
          collapsed ? "w-64 lg:w-[78px]" : "w-64",
        ].join(" ")}
      >
        {/* Brand */}
        <div
          className={[
            "flex h-[72px] shrink-0 items-center border-b border-line",
            collapsed ? "justify-center px-3 lg:px-0" : "justify-between px-5",
          ].join(" ")}
        >
          <button
            type="button"
            onClick={() => navigate("/")}
            className="flex items-center gap-2.5"
          >
            <BrandMark />

            <span
              className={[
                "whitespace-nowrap text-[14.5px] font-extrabold tracking-[-0.02em] text-ink transition-opacity duration-200",
                collapsed ? "lg:hidden" : "",
              ].join(" ")}
            >
              HEITKAMP
            </span>
          </button>

          <button
            type="button"
            onClick={onCloseMobile}
            className="flex h-8 w-8 items-center justify-center rounded-xl text-muted transition-colors hover:bg-page hover:text-ink lg:hidden"
          >
            <X size={16} strokeWidth={1.8} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="no-scrollbar flex-1 overflow-y-auto px-3 py-5">
          {groups.map((group, groupIndex) => (
            <div key={group.title} className={groupIndex === 0 ? "" : "mt-6"}>
              {group.title && (
                <div
                  className={[
                    "mb-2 px-2 text-[9.5px] font-bold uppercase tracking-[0.14em] text-muted",
                    collapsed ? "lg:hidden" : "",
                  ].join(" ")}
                >
                  {group.title}
                </div>
              )}

              <ul className="space-y-1">
                {group.items.map((item) => {
                  const active = isItemActive(item);

                  return (
                    <li key={item.label} className="group relative">
                      <button
                        type="button"
                        onClick={() => {
                          navigate(item.path);
                          onCloseMobile();
                        }}
                        className={[
                          "relative flex h-10 w-full items-center gap-3 rounded-xl px-3 text-left text-[12.5px] font-medium transition-all duration-150",
                          collapsed ? "lg:justify-center lg:px-0" : "",
                          active
                            ? "bg-ink text-white shadow-[0_6px_14px_rgba(22,22,29,0.10)]"
                            : "text-ink/65 hover:bg-page hover:text-ink",
                        ].join(" ")}
                      >
                        {active && (
                          <span className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-full bg-violet" />
                        )}

                        <item.icon
                          size={17}
                          strokeWidth={active ? 2 : 1.8}
                          className={
                            active
                              ? "text-violet-soft"
                              : "text-ink/50 group-hover:text-ink/70"
                          }
                        />

                        <span className={collapsed ? "lg:hidden" : ""}>
                          {item.label}
                        </span>
                      </button>

                      {collapsed && (
                        <span className="pointer-events-none absolute left-full top-1/2 z-[70] ml-3 hidden -translate-y-1/2 whitespace-nowrap rounded-lg bg-ink px-2.5 py-1.5 text-[10.5px] font-medium text-white opacity-0 shadow-[0_8px_20px_rgba(20,18,45,0.18)] transition-opacity duration-100 group-hover:opacity-100 lg:block">
                          {item.label}
                        </span>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        {/* Collapse */}
        <div
          className={[
            "shrink-0 border-t border-line p-3",
            collapsed ? "lg:px-2" : "",
          ].join(" ")}
        >
          <button
            type="button"
            onClick={onToggleCollapsed}
            className={[
              "hidden h-10 w-full items-center gap-3 rounded-xl text-[11.5px] font-medium text-muted transition-colors hover:bg-page hover:text-ink lg:flex",
              collapsed ? "justify-center" : "px-3",
            ].join(" ")}
          >
            <PanelLeft
              size={16}
              strokeWidth={1.8}
              className={[
                "transition-transform duration-300",
                collapsed ? "rotate-180" : "",
              ].join(" ")}
            />

            {!collapsed && <span>Collapse sidebar</span>}
          </button>
        </div>
      </aside>
    </>
  );
}

function BrandMark() {
  return (
    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-violet shadow-[0_6px_16px_rgba(124,108,240,0.20)]">
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
