"use client";

import { usePathname } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { Bell, X, RefreshCcw } from "lucide-react";
import { Caveat } from "next/font/google";
import { useSettings } from "@/hooks/useSettings";
import { useNotifications } from "@/hooks/useNotifications";
import Avatar from "@/components/shared/Avatar";
import type { Notification } from "@/types";

// Caveat loaded via next/font — never import fonts any other way in Next.js
const caveat = Caveat({
  subsets: ["latin"],
  weight: ["700"],
});

// ─── Page title map ────────────────────────────────────────────────────────
const PAGE_TITLES: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/transactions": "Transactions",
  "/accounts": "Accounts",
  "/budgets": "Budgets",
  "/recurring": "Recurring Charges",
  "/goals": "Goals",
  "/ai-advisor": "AI Advisor",
  "/settings": "Settings",
};

// ─── Time-based greeting ───────────────────────────────────────────────────
function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good Morning";
  if (hour < 17) return "Good Afternoon";
  return "Good Evening";
}

// Extracts first name — "John Doe" → "John"
function getFirstName(fullName: string): string {
  return fullName.trim().split(/\s+/)[0] ?? "";
}

// ─── Brush Highlight SVG — painted highlight under the first name ──────────
function BrushHighlight({ children }: { children: React.ReactNode }) {
  return (
    <span className="relative inline-block">
      {/* Painted background — slightly taller than the text, tilted naturally */}
      <svg
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        aria-hidden="true"
        style={{ transform: "rotate(-1.5deg) scaleY(1.15)", zIndex: 0 }}
      >
        <path
          d="M2,20 C10,14 30,10 50,12 C70,14 90,10 98,16 L97,80 C88,86 68,90 50,88 C30,86 10,88 3,82 Z"
          fill="#3B82F6"
          opacity="0.18"
        />
        {/* Slightly offset second layer for roughness */}
        <path
          d="M4,25 C15,18 35,15 55,17 C72,19 88,15 96,21 L94,75 C84,82 64,85 48,83 C28,81 12,84 5,78 Z"
          fill="#3B82F6"
          opacity="0.10"
        />
      </svg>
      {/* Text sits above the highlight */}
      <span className="relative" style={{ zIndex: 1, color: "#1D4ED8" }}>
        {children}
      </span>
    </span>
  );
}

// ─── Dashboard greeting ────────────────────────────────────────────────────
function DashboardGreeting({ name }: { name: string }) {
  const greeting = getGreeting();
  const firstName = getFirstName(name);

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span
        className={caveat.className}
        style={{ fontSize: "2.2rem", color: "#0F172A", lineHeight: 1.2 }}
      >
        {greeting},
      </span>
      <BrushHighlight>
        <span
          className={caveat.className}
          style={{ fontSize: "2.2rem", lineHeight: 1.2, paddingInline: "6px" }}
        >
          {firstName || "there"}
        </span>
      </BrushHighlight>
    </div>
  );
}

// ─── Single notification row ───────────────────────────────────────────────
function NotificationRow({
  notification,
  onRead,
  onRemove,
}: {
  notification: Notification;
  onRead: (id: string) => void;
  onRemove: (id: string) => void;
}) {
  return (
    <div
      className="flex items-start gap-3 px-4 py-3 border-b transition-colors duration-150"
      style={{
        borderColor: "#E2E8F0",
        backgroundColor: notification.read ? "#FFFFFF" : "#EFF6FF",
      }}
    >
      <div
        className="mt-0.5 w-7 h-7 rounded-full flex items-center justify-center shrink-0"
        style={{ backgroundColor: "#DBEAFE" }}
      >
        <RefreshCcw size={13} style={{ color: "#3B82F6" }} />
      </div>

      <div
        className="flex-1 min-w-0 cursor-pointer"
        onClick={() => !notification.read && onRead(notification.id)}
      >
        <p className="text-xs font-semibold" style={{ color: "#0F172A" }}>
          {notification.title}
        </p>
        <p
          className="text-xs mt-0.5 leading-relaxed"
          style={{ color: "#64748B" }}
        >
          {notification.body}
        </p>
        <p className="text-xs mt-1" style={{ color: "#94A3B8" }}>
          {new Date(notification.createdAt).toLocaleDateString("en-CA", {
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
      </div>

      <button
        onClick={() => onRemove(notification.id)}
        className="shrink-0 p-1 rounded-full transition-colors duration-150"
        style={{ color: "#94A3B8" }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = "#F1F5F9";
          e.currentTarget.style.color = "#EF4444";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = "transparent";
          e.currentTarget.style.color = "#94A3B8";
        }}
        aria-label="Dismiss notification"
      >
        <X size={13} />
      </button>
    </div>
  );
}

// ─── Main header ───────────────────────────────────────────────────────────
export default function AppHeader() {
  const pathname = usePathname();
  const { settings } = useSettings();
  const { notifications, unreadCount, readAll, readOne, removeNotification } =
    useNotifications();

  const [panelOpen, setPanelOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  const isDashboard = pathname === "/dashboard";
  const pageTitle = PAGE_TITLES[pathname] ?? "Fintrak";

  // Close panel on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setPanelOpen(false);
      }
    }
    if (panelOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [panelOpen]);

  function handleBellClick() {
    setPanelOpen((prev) => !prev);
    if (!panelOpen && unreadCount > 0) readAll();
  }

  return (
    <header
      className="hidden lg:flex items-center justify-between px-8 py-3 border-b shrink-0 sticky top-0 z-30"
      style={{ backgroundColor: "#FFFFFF", borderColor: "#E2E8F0" }}
    >
      {/* ── Left: greeting or page title ── */}
      {isDashboard ? (
        <DashboardGreeting name={settings.userName} />
      ) : (
        <h2
          className="text-xl font-bold tracking-tight"
          style={{ color: "#0F172A" }}
        >
          {pageTitle}
        </h2>
      )}

      {/* ── Right: bell + profile ── */}
      <div className="flex items-center gap-4">
        {/* Notification bell */}
        <div className="relative" ref={panelRef}>
          <button
            onClick={handleBellClick}
            className="relative w-9 h-9 rounded-full flex items-center justify-center transition-colors duration-150 cursor-pointer"
            style={{ color: "#64748B" }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#F1F5F9";
              e.currentTarget.style.color = "#0F172A";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "transparent";
              e.currentTarget.style.color = "#64748B";
            }}
            aria-label="Notifications"
          >
            <Bell size={20} strokeWidth={1.8} />
            {unreadCount > 0 && (
              <span
                className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] rounded-full flex items-center justify-center text-white"
                style={{
                  backgroundColor: "#EF4444",
                  fontSize: "10px",
                  fontWeight: 700,
                }}
              >
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </button>

          {/* Notification panel */}
          {panelOpen && (
            <div
              className="absolute right-0 top-11 w-90 rounded-xl overflow-hidden z-50"
              style={{
                backgroundColor: "#FFFFFF",
                border: "1px solid #E2E8F0",
                boxShadow:
                  "0 8px 24px rgba(0,0,0,0.08), 0 2px 8px rgba(0,0,0,0.04)",
              }}
            >
              <div
                className="flex items-center justify-between px-4 py-3 border-b"
                style={{ borderColor: "#E2E8F0" }}
              >
                <span
                  className="text-sm font-semibold"
                  style={{ color: "#0F172A" }}
                >
                  Notifications
                </span>
                {notifications.length > 0 && (
                  <button
                    onClick={() => readAll()}
                    className="text-xs transition-colors duration-150"
                    style={{ color: "#3B82F6" }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.color = "#2563EB")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.color = "#3B82F6")
                    }
                  >
                    Mark all read
                  </button>
                )}
              </div>

              <div className="max-h-96 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-10 gap-2">
                    <Bell size={24} style={{ color: "#CBD5E1" }} />
                    <p className="text-sm" style={{ color: "#94A3B8" }}>
                      No notifications yet
                    </p>
                  </div>
                ) : (
                  notifications.map((n) => (
                    <NotificationRow
                      key={n.id}
                      notification={n}
                      onRead={readOne}
                      onRemove={removeNotification}
                    />
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="w-px h-6" style={{ backgroundColor: "#E2E8F0" }} />

        {/* Avatar + name */}
        <div className="flex items-center gap-3">
          <Avatar
            name={settings.userName}
            avatarUrl={settings.avatarUrl}
            size={34}
          />
          <div className="flex flex-col">
            <span
              className="text-sm font-semibold leading-tight"
              style={{ color: "#0F172A" }}
            >
              {settings.userName || "User"}
            </span>
            <span
              className="text-xs leading-tight"
              style={{ color: "#94A3B8" }}
            >
              Personal account
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
