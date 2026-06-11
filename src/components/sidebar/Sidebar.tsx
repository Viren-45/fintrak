"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { logout } from "@/app/logout/actions";
import {
  LayoutDashboard,
  TrendingUp,
  TrendingDown,
  PieChart,
  Target,
  Bot,
  Settings,
  Menu,
  X,
  LogOut,
} from "lucide-react";

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Income", href: "/income", icon: TrendingUp },
  { label: "Expenses", href: "/expenses", icon: TrendingDown },
  { label: "Budgets", href: "/budgets", icon: PieChart },
  { label: "Goals", href: "/goals", icon: Target },
  { label: "AI Advisor", href: "/ai-advisor", icon: Bot },
  { label: "Settings", href: "/settings", icon: Settings },
];

// Extracted outside Sidebar so it's never recreated on re-render
function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-1 px-3 py-4">
      {navItems.map(({ label, href, icon: Icon }) => {
        const isActive = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            onClick={onNavigate}
            className={`
              flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium
              transition-colors duration-150
              ${
                isActive
                  ? "bg-white/10 text-fintrak-sidebar-active"
                  : "text-fintrak-sidebar-text hover:bg-white/5 hover:text-fintrak-sidebar-active"
              }
            `}
          >
            <Icon size={18} strokeWidth={1.8} />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}

export default function Sidebar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* ── Desktop sidebar ── */}
      <aside className="hidden lg:flex flex-col w-60 min-h-screen bg-fintrak-sidebar shrink-0">
        {/* Logo */}
        <div className="px-6 py-5 border-b border-white/10">
          <h1 className="text-white text-xl font-bold tracking-tight">
            Fintrak
          </h1>
          <p className="text-fintrak-sidebar-text text-xs mt-0.5">
            Personal Finance
          </p>
        </div>

        <NavLinks />
        {/* Logout */}
        <div className="mt-auto px-3 py-4 border-t border-white/10">
          <form action={logout}>
            <button
              type="submit"
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium w-full text-fintrak-sidebar-text hover:bg-white/5 hover:text-fintrak-sidebar-active transition-colors duration-150"
            >
              <LogOut size={18} strokeWidth={1.8} />
              Sign out
            </button>
          </form>
        </div>
      </aside>

      {/* ── Mobile header bar ── */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-4 py-3 bg-fintrak-sidebar border-b border-white/10">
        <h1 className="text-white text-lg font-bold tracking-tight">Fintrak</h1>
        <button
          onClick={() => setMobileOpen(true)}
          className="text-fintrak-sidebar-text hover:text-white transition-colors"
          aria-label="Open menu"
        >
          <Menu size={22} />
        </button>
      </header>

      {/* ── Mobile drawer overlay ── */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-50 flex"
          role="dialog"
          aria-modal="true"
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setMobileOpen(false)}
          />

          {/* Drawer */}
          <aside className="relative z-10 flex flex-col w-64 min-h-screen bg-fintrak-sidebar">
            <div className="px-6 py-5 border-b border-white/10 flex items-center justify-between">
              <div>
                <h1 className="text-white text-xl font-bold tracking-tight">
                  Fintrak
                </h1>
                <p className="text-fintrak-sidebar-text text-xs mt-0.5">
                  Personal Finance
                </p>
              </div>
              <button
                onClick={() => setMobileOpen(false)}
                className="text-fintrak-sidebar-text hover:text-white transition-colors"
                aria-label="Close menu"
              >
                <X size={20} />
              </button>
            </div>

            <NavLinks onNavigate={() => setMobileOpen(false)} />
            {/* Logout */}
            <div className="mt-auto px-3 py-4 border-t border-white/10">
              <form action={logout}>
                <button
                  type="submit"
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium w-full text-fintrak-sidebar-text hover:bg-white/5 hover:text-fintrak-sidebar-active transition-colors duration-150"
                >
                  <LogOut size={18} strokeWidth={1.8} />
                  Sign out
                </button>
              </form>
            </div>
          </aside>
        </div>
      )}
    </>
  );
}
