import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, CalendarDays, Clock, UserCircle, LayoutDashboard } from "lucide-react";
import { useAuth } from "@/lib/AuthContext";

const USER_TABS = [
  { to: "/", label: "Home", icon: Home, exact: true },
  { to: "/prenota", label: "Prenota", icon: CalendarDays },
  { to: "/le-mie-prenotazioni", label: "Appuntamenti", icon: Clock },
  { to: "/profilo", label: "Profilo", icon: UserCircle },
];

const ADMIN_TABS = [
  { to: "/", label: "Home", icon: Home, exact: true },
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { to: "/profilo", label: "Profilo", icon: UserCircle },
];

const HIDDEN_ROUTES = ["/login", "/register", "/forgot-password", "/reset-password"];

export default function BottomNav() {
  const { isAuthenticated, user } = useAuth();
  const { pathname } = useLocation();
  const isAdmin = isAuthenticated && user?.role === "admin";

  if (HIDDEN_ROUTES.includes(pathname) || !isAuthenticated) return null;

  const tabs = isAdmin ? ADMIN_TABS : USER_TABS;

  const handleClick = (t) => (e) => {
    if (pathname === t.to) {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <nav className="mobile-bottom-nav fixed inset-x-0 bottom-0 z-50 flex items-stretch justify-around border-t border-border bg-background/95 backdrop-blur-md md:hidden">
      {tabs.map((t) => {
        const active = t.exact ? pathname === t.to : pathname.startsWith(t.to);
        const Icon = t.icon;
        return (
          <Link
            key={t.to}
            to={t.to}
            onClick={handleClick(t)}
            className={`flex flex-1 flex-col items-center gap-0.5 py-2 text-xs font-medium transition-colors ${
              active ? "text-primary" : "text-muted-foreground"
            }`}
          >
            <Icon className="h-5 w-5" />
            <span>{t.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}