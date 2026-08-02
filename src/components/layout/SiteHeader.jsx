import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, LogOut, User as UserIcon, UserCircle, Home, ArrowLeft, CalendarDays } from "lucide-react";
import { useAuth } from "@/lib/AuthContext";
import Logo from "@/components/Logo";
import ThemeToggle from "@/components/ThemeToggle";
import NotificationBell from "@/components/NotificationBell";

const NAV_LINKS = [
  { href: "#servizi", label: "Servizi" },
  { href: "#chi-siamo", label: "Chi siamo" },
  { href: "#galleria", label: "Galleria" },
  { href: "#contatti", label: "Contatti" },
];

export default function SiteHeader({ minimal = false }) {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const isAdmin = isAuthenticated && user?.role === "admin";

  const handleLogout = () => {
    logout(false);
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/70 bg-background/60 backdrop-blur-md md:bg-background/85">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <div className="flex shrink-0 items-center gap-1">
          {minimal && (
            <Button variant="ghost" size="icon" className="md:hidden -ml-2 h-11 w-11" onClick={() => navigate("/")} aria-label="Indietro">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          )}
          <Link to="/">
            <Logo />
          </Link>
        </div>

        {/* Desktop nav */}
        <div className="hidden items-center gap-1 md:flex">
          <ThemeToggle />
          {isAuthenticated && <NotificationBell />}
          {!minimal && (
            <nav className="flex items-center gap-0.5 mr-1">
              {NAV_LINKS.map((l) => (
                <a key={l.href} href={l.href} className="rounded-md px-1.5 py-1.5 text-[13px] font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground">
                  {l.label}
                </a>
              ))}
            </nav>
          )}
          {minimal && (
            <Button variant="ghost" size="sm" asChild>
              <Link to="/"><Home className="mr-2 h-4 w-4" />Home</Link>
            </Button>
          )}
          {isAuthenticated ? (
            <>
              {!minimal && !isAdmin && (
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/le-mie-prenotazioni" aria-label="Le mie prenotazioni"><CalendarDays className="h-4 w-4" /><span className="hidden lg:inline ml-2">Le mie prenotazioni</span></Link>
                </Button>
              )}
              {!minimal && isAdmin && (
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/admin" aria-label="Dashboard"><LayoutDashboard className="h-4 w-4" /><span className="hidden lg:inline ml-2">Dashboard</span></Link>
                </Button>
              )}
              <Button variant="ghost" size="sm" asChild>
                <Link to="/profilo" aria-label="Profilo"><UserCircle className="h-4 w-4" /></Link>
              </Button>
              <Button variant="ghost" size="sm" onClick={handleLogout} aria-label="Esci">
                <LogOut className="h-4 w-4" />
              </Button>
            </>
          ) : (
            !minimal && (
              <>
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/login"><UserIcon className="mr-2 h-4 w-4" />Accedi</Link>
                </Button>
                <Button variant="outline" size="sm" asChild>
                  <Link to="/register">Registrati</Link>
                </Button>
                <Button size="sm" className="hidden lg:inline-flex" asChild>
                  <Link to="/prenota">Prenota ora</Link>
                </Button>
              </>
            )
          )}
        </div>

        {/* Mobile: solo logout (o login/register se non autenticato) */}
        <div className="flex items-center gap-1 md:hidden">
          <ThemeToggle />
          {isAuthenticated && <NotificationBell />}
          {isAuthenticated ? (
            <Button variant="ghost" size="sm" onClick={handleLogout} aria-label="Logout">
              <LogOut className="mr-2 h-4 w-4" />Logout
            </Button>
          ) : (
            !minimal && (
              <>
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/login">Accedi</Link>
                </Button>
                <Button variant="outline" size="sm" asChild>
                  <Link to="/register">Registrati</Link>
                </Button>
              </>
            )
          )}
        </div>
      </div>
    </header>
  );
}