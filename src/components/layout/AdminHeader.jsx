import React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Home, LayoutDashboard, LogOut, UserCircle, Settings, ArrowLeft } from "lucide-react";
import { useAuth } from "@/lib/AuthContext";
import Logo from "@/components/Logo";
import ThemeToggle from "@/components/ThemeToggle";
import NotificationBell from "@/components/NotificationBell";

export default function AdminHeader() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const handleLogout = () => {
    logout(false);
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/70 bg-background/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <div className="flex shrink-0 items-center gap-1">
          {pathname !== "/admin" && (
            <Button variant="ghost" size="icon" className="md:hidden -ml-2 h-11 w-11" onClick={() => navigate("/admin")} aria-label="Indietro">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          )}
          <Link to="/">
            <Logo />
          </Link>
        </div>

        {/* Desktop: full nav */}
        <div className="hidden items-center gap-0.5 sm:gap-1 md:flex">
          <ThemeToggle />
          <NotificationBell />
          <Button variant="ghost" size="sm" asChild>
            <Link to="/" aria-label="Home"><Home className="h-4 w-4" /><span className="hidden lg:inline ml-2">Home</span></Link>
          </Button>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/admin" aria-label="Dashboard"><LayoutDashboard className="h-4 w-4" /><span className="hidden lg:inline ml-2">Dashboard</span></Link>
          </Button>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/admin/impostazioni" aria-label="Impostazioni"><Settings className="h-4 w-4" /><span className="hidden lg:inline ml-2">Impostazioni</span></Link>
          </Button>
          <Button variant="ghost" size="icon" asChild>
            <Link to="/profilo" aria-label="Profilo"><UserCircle className="h-5 w-5" /></Link>
          </Button>
          <Button variant="ghost" size="sm" onClick={handleLogout} aria-label="Logout">
            <LogOut className="h-4 w-4" /><span className="hidden lg:inline ml-2">Logout</span>
          </Button>
        </div>

        {/* Mobile: solo logout (navigazione gestita dalla bottom nav) */}
        <div className="md:hidden flex items-center gap-1">
          <ThemeToggle />
          <NotificationBell />
          <Button variant="ghost" size="sm" onClick={handleLogout} aria-label="Logout">
            <LogOut className="mr-2 h-4 w-4" />Logout
          </Button>
        </div>
      </div>
    </header>
  );
}