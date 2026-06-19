"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { logout } from "@/app/logout/actions";
import {
  LayoutDashboard,
  ArrowLeftRight,
  Wallet,
  PieChart,
  Target,
  Bot,
  Settings,
  Menu,
  X,
  LogOut,
  RefreshCcw,
} from "lucide-react";

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Transactions", href: "/transactions", icon: ArrowLeftRight },
  { label: "Accounts", href: "/accounts", icon: Wallet },
  { label: "Budgets", href: "/budgets", icon: PieChart },
  { label: "Recurring", href: "/recurring", icon: RefreshCcw },
  { label: "Goals", href: "/goals", icon: Target },
  { label: "AI Advisor", href: "/ai-advisor", icon: Bot },
  { label: "Settings", href: "/settings", icon: Settings },
];

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-0.5 px-3 py-4">
      {navItems.map(({ label, href, icon: Icon }) => {
        const isActive = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            onClick={onNavigate}
            style={
              isActive
                ? { backgroundColor: "#3B82F6", color: "#FFFFFF" }
                : { color: "#64748B" }
            }
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors duration-150"
            onMouseEnter={(e) => {
              if (!isActive) {
                e.currentTarget.style.backgroundColor = "#F1F5F9";
                e.currentTarget.style.color = "#0F172A";
              }
            }}
            onMouseLeave={(e) => {
              if (!isActive) {
                e.currentTarget.style.backgroundColor = "transparent";
                e.currentTarget.style.color = "#64748B";
              }
            }}
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
      <aside
        className="hidden lg:flex flex-col w-60 h-screen fixed top-0 left-0 shrink-0 border-r overflow-y-auto z-20"
        style={{ backgroundColor: "#FFFFFF", borderColor: "#E2E8F0" }}
      >
        {/* Logo */}
        <div className="px-6 py-5 border-b" style={{ borderColor: "#E2E8F0" }}>
          <h1
            className="text-xl font-bold tracking-tight"
            style={{ color: "#0F172A" }}
          >
            Fintrak
          </h1>
          <p className="text-xs mt-0.5" style={{ color: "#94A3B8" }}>
            Personal Finance
          </p>
        </div>

        <NavLinks />

        {/* Sign out */}
        <div
          className="mt-auto px-3 py-4 border-t"
          style={{ borderColor: "#E2E8F0" }}
        >
          <form action={logout}>
            <button
              type="submit"
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium w-full transition-colors duration-150"
              style={{ color: "#64748B" }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#F1F5F9";
                e.currentTarget.style.color = "#0F172A";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "transparent";
                e.currentTarget.style.color = "#64748B";
              }}
            >
              <LogOut size={18} strokeWidth={1.8} />
              Sign out
            </button>
          </form>
        </div>
      </aside>

      {/* ── Mobile header bar ── */}
      <header
        className="lg:hidden fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-4 py-3 border-b"
        style={{ backgroundColor: "#FFFFFF", borderColor: "#E2E8F0" }}
      >
        <h1
          className="text-lg font-bold tracking-tight"
          style={{ color: "#0F172A" }}
        >
          Fintrak
        </h1>
        <button
          onClick={() => setMobileOpen(true)}
          className="transition-colors"
          style={{ color: "#64748B" }}
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
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setMobileOpen(false)}
          />
          <aside
            className="relative z-10 flex flex-col w-64 min-h-screen border-r"
            style={{ backgroundColor: "#FFFFFF", borderColor: "#E2E8F0" }}
          >
            <div
              className="px-6 py-5 border-b flex items-center justify-between"
              style={{ borderColor: "#E2E8F0" }}
            >
              <div>
                <h1
                  className="text-xl font-bold tracking-tight"
                  style={{ color: "#0F172A" }}
                >
                  Fintrak
                </h1>
                <p className="text-xs mt-0.5" style={{ color: "#94A3B8" }}>
                  Personal Finance
                </p>
              </div>
              <button
                onClick={() => setMobileOpen(false)}
                className="transition-colors"
                style={{ color: "#64748B" }}
                aria-label="Close menu"
              >
                <X size={20} />
              </button>
            </div>

            <NavLinks onNavigate={() => setMobileOpen(false)} />

            {/* Sign out */}
            <div
              className="mt-auto px-3 py-4 border-t"
              style={{ borderColor: "#E2E8F0" }}
            >
              <form action={logout}>
                <button
                  type="submit"
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium w-full transition-colors duration-150"
                  style={{ color: "#64748B" }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "#F1F5F9";
                    e.currentTarget.style.color = "#0F172A";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "transparent";
                    e.currentTarget.style.color = "#64748B";
                  }}
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
