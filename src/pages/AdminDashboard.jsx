import React, { useState, useEffect, useCallback, useRef } from "react";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { Link } from "react-router-dom";
import { bookingsApi } from "@/api/bookingsApi";
import { Button } from "@/components/ui/button";
import { CalendarDays, LayoutDashboard, Scissors, Users, CheckCircle2, Ban, TrendingUp, Settings, UserCircle2, CalendarClock, FileText } from "lucide-react";
import AdminHeader from "@/components/layout/AdminHeader";
import { Skeleton } from "@/components/ui/skeleton";
import CalendarView from "@/components/booking/CalendarView";
import { useAdminEvents } from "@/hooks/useAdminEvents";
import { toDateString } from "@/lib/dateUtils";

export default function AdminDashboard() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const [date, setDate] = useState(today);
  const [refreshKey, setRefreshKey] = useState(0);
  const [stats, setStats] = useState({ today: 0, completedMonth: 0, noShowMonth: 0 });
  const [loadingStats, setLoadingStats] = useState(true);
  const [hasLoaded, setHasLoaded] = useState(false);
  const debouncedDate = useDebouncedValue(date, 250);
  const statsIdRef = useRef(0);

  const loadStats = useCallback(async () => {
    const myId = ++statsIdRef.current;
    setLoadingStats(true);
    try {
      const selDateStr = toDateString(debouncedDate);
      const year = debouncedDate.getFullYear();
      const month = debouncedDate.getMonth();
      const monthStart = `${year}-${String(month + 1).padStart(2, "0")}-01`;
      const lastDay = new Date(year, month + 1, 0).getDate();
      const monthEnd = `${year}-${String(month + 1).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;

      const [dayBookings, monthStats] = await Promise.all([
        bookingsApi.adminList({ date: selDateStr }),
        bookingsApi.adminStats({ from: monthStart, to: monthEnd }),
      ]);

      const countByStatus = (status) => (monthStats.byStatus || []).find((s) => s.status === status)?.count || 0;
      const todayCount = (dayBookings.bookings || []).filter((b) => ["in_attesa", "confermata", "completata", "no_show"].includes(b.status)).length;
      const completedMonth = countByStatus("completata") + countByStatus("no_show");
      const noShowMonth = countByStatus("no_show");

      if (myId === statsIdRef.current) setStats({ today: todayCount, completedMonth, noShowMonth });
    } catch {
      if (myId === statsIdRef.current) setStats({ today: 0, completedMonth: 0, noShowMonth: 0 });
    } finally {
      if (myId === statsIdRef.current) { setLoadingStats(false); setHasLoaded(true); }
    }
  }, [debouncedDate]);

  useEffect(() => { loadStats(); }, [loadStats, refreshKey]);

  //Aggiornamento real-time delle statistiche
  useAdminEvents(() => setRefreshKey((k) => k + 1));

  const STATS = [
    { label: "Oggi", value: stats.today, icon: CalendarDays, color: "text-primary", bg: "bg-primary/10" },
    { label: "Completati (mese sel.)", value: stats.completedMonth, icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50" },
    { label: "No-show (mese sel.)", value: stats.noShowMonth, icon: Ban, color: "text-red-600", bg: "bg-red-50" },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-secondary/30">
      <AdminHeader />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-10 sm:px-6">
        <div className="mb-6 space-y-4">
          <div>
            <p className="inline-flex items-center gap-1.5 text-sm font-semibold uppercase tracking-wider text-primary">
              <LayoutDashboard className="h-4 w-4" /> Dashboard
            </p>
            <h1 className="mt-1 font-heading text-3xl font-semibold tracking-tight">Gestione salone</h1>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="outline" size="sm"><Link to="/admin/staff"><UserCircle2 className="mr-2 h-4 w-4" /> Staff</Link></Button>
            <Button asChild variant="outline" size="sm"><Link to="/admin/orari"><CalendarClock className="mr-2 h-4 w-4" /> Orari</Link></Button>
            <Button asChild variant="outline" size="sm"><Link to="/admin/servizi"><Scissors className="mr-2 h-4 w-4" /> Servizi</Link></Button>
            <Button asChild variant="outline" size="sm"><Link to="/admin/clienti"><Users className="mr-2 h-4 w-4" /> Clienti</Link></Button>
            <Button asChild variant="outline" size="sm"><Link to="/admin/statistiche"><TrendingUp className="mr-2 h-4 w-4" /> Statistiche</Link></Button>
            <Button asChild variant="outline" size="sm"><Link to="/admin/impostazioni"><Settings className="mr-2 h-4 w-4" /> Impostazioni</Link></Button>
            <Button asChild variant="outline" size="sm"><Link to="/admin/contenuti"><FileText className="mr-2 h-4 w-4" /> Contenuti</Link></Button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {STATS.map((s) => (
            <div key={s.label} className="rounded-2xl border border-border bg-card p-4">
              <div className="flex items-center gap-2.5">
                <div className={`inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${s.bg} ${s.color}`}>
                  <s.icon className="h-4 w-4" />
                </div>
                <p className="text-xs font-medium text-muted-foreground">{s.label}</p>
              </div>
              {loadingStats && !hasLoaded ? <Skeleton className="mt-3 h-8 w-12" /> : <p className={`mt-3 font-heading text-2xl font-semibold ${loadingStats ? "opacity-60" : ""}`}>{s.value}</p>}
            </div>
          ))}
        </div>

        <div className="mt-6 flex items-center gap-2 text-sm text-muted-foreground">
          <TrendingUp className="h-4 w-4 text-brand" /> Clicca su uno slot per vedere le prenotazioni e gestirle. Usa il filtro orari e la multiselezione.
        </div>

        <div className="mt-3">
          <CalendarView
            mode="admin"
            date={date}
            onDateChange={setDate}
            refreshKey={refreshKey}
            onAfterAction={() => setRefreshKey((k) => k + 1)}
          />
        </div>
      </main>
    </div>
  );
}