import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { bookingsApi } from "@/api/bookingsApi";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { ArrowLeft, GitCompare, ChevronLeft, ChevronRight } from "lucide-react";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { EmptyState } from "@/components/ui/empty-state";
import AdminHeader from "@/components/layout/AdminHeader";
import StatsCompare from "@/components/admin/StatsCompare";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { useAdminEvents } from "@/hooks/useAdminEvents";
import { toDateString } from "@/lib/dateUtils";

const MONTH_LABELS = ["Gennaio", "Febbraio", "Marzo", "Aprile", "Maggio", "Giugno", "Luglio", "Agosto", "Settembre", "Ottobre", "Novembre", "Dicembre"];
const UNITS = [
  { id: "week", label: "Settimana" },
  { id: "month", label: "Mese" },
  { id: "year", label: "Anno" },
];

function isoWeekNumber(d) {
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const dayNum = date.getUTCDay() || 7;
  date.setUTCDate(date.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  return Math.ceil((((date - yearStart) / 86400000) + 1) / 7);
}

function isoWeekMonday(year, week) {
  const jan4 = new Date(year, 0, 4);
  const day = jan4.getDay() || 7;
  const week1Mon = new Date(jan4);
  week1Mon.setDate(jan4.getDate() - (day - 1));
  const mon = new Date(week1Mon);
  mon.setDate(week1Mon.getDate() + (week - 1) * 7);
  return mon;
}

//`vals` ha una forma diversa a seconda di `unit` (settimana/mese/anno) — vedi valsFor().
function rangeFor(unit, vals) {
  if (unit === "week") {
    const mon = isoWeekMonday(vals.year, vals.week);
    const tue = new Date(mon); tue.setDate(mon.getDate() + 1);
    const sat = new Date(mon); sat.setDate(mon.getDate() + 5);
    return { from: toDateString(tue), to: toDateString(sat) };
  }
  if (unit === "month") {
    return { from: toDateString(new Date(vals.year, vals.month - 1, 1)), to: toDateString(new Date(vals.year, vals.month, 0)) };
  }
  return { from: toDateString(new Date(vals.year, 0, 1)), to: toDateString(new Date(vals.year, 11, 31)) };
}

//Riduce {week,month,year} alla sola forma rilevante per l'unità corrente — evita di
//ripetere lo stesso ternario `unit === "week" ? ... : unit === "month" ? ... : ...` in
//quattro punti diversi (calcolo range per A/B, valori mostrati per A/B).
function valsFor(period, unit) {
  if (unit === "week") return { week: period.week, year: period.year };
  if (unit === "month") return { month: period.month, year: period.year };
  return { year: period.year };
}

const MONTH_SHORT = ["gen", "feb", "mar", "apr", "mag", "giu", "lug", "ago", "set", "ott", "nov", "dic"];
function weekRangeStr(year, week) {
  const mon = isoWeekMonday(year, week);
  const tue = new Date(mon); tue.setDate(mon.getDate() + 1);
  const sat = new Date(mon); sat.setDate(mon.getDate() + 5);
  if (tue.getMonth() === sat.getMonth()) return `${tue.getDate()}–${sat.getDate()} ${MONTH_SHORT[tue.getMonth()]} ${sat.getFullYear()}`;
  return `${tue.getDate()} ${MONTH_SHORT[tue.getMonth()]} – ${sat.getDate()} ${MONTH_SHORT[sat.getMonth()]} ${sat.getFullYear()}`;
}

function labelFor(unit, vals) {
  if (unit === "week") return `Settimana ${vals.week} · ${weekRangeStr(vals.year, vals.week)}`;
  if (unit === "month") return `${MONTH_LABELS[vals.month - 1]} ${vals.year}`;
  return `Anno ${vals.year}`;
}

//Trasforma l'aggregazione già calcolata dal backend (/admin/stats) nella forma attesa da
//StatsCompare. topService/topWd/topTm riflettono solo le prenotazioni completate, come il
//fatturato
function toStatsShape(stats) {
  const total = (stats.byStatus || [])
    .filter((s) => s.status !== "cancellata")
    .reduce((acc, s) => acc + s.count, 0);
  const topService = stats.byService?.[0] ? [stats.byService[0].serviceName, stats.byService[0].count] : null;
  const topWd = stats.byWeekday?.[0] ? [String(stats.byWeekday[0].weekday), stats.byWeekday[0].count] : null;
  const topTm = stats.byTime?.[0] ? [String(stats.byTime[0].startTime).slice(0, 5), stats.byTime[0].count] : null;
  return { total, topService, revenue: stats.revenue, topWd, topTm };
}

function Field({ label, children }) {
  return (
    <div className="flex-1 space-y-1 min-w-[6rem]">
      <span className="text-[11px] font-medium text-muted-foreground">{label}</span>
      {children}
    </div>
  );
}

export default function AdminStats() {
  const now = new Date();
  const curYear = now.getFullYear();
  const curMonth = now.getMonth() + 1;
  const curWeek = isoWeekNumber(now);

  const [unit, setUnit] = useState("month");
  const [periods, setPeriods] = useState({
    A: { week: curWeek, month: curMonth, year: curYear },
    B: { week: curWeek, month: curMonth, year: curYear - 1 },
  });
  const updatePeriod = (tag, field, value) =>
    setPeriods((p) => ({ ...p, [tag]: { ...p[tag], [field]: value } }));
  const [dataA, setDataA] = useState(null);
  const [dataB, setDataB] = useState(null);
  const [loading, setLoading] = useState(true);
  const [rtKey, setRtKey] = useState(0);

  const years = Array.from({ length: 5 }, (_, i) => curYear - 2 + i);

  const selKey = useDebouncedValue(JSON.stringify({ unit, periods, rtKey }), 250);

  useEffect(() => {
    let cancelled = false;
    const s = JSON.parse(selKey);
    (async () => {
      setLoading(true);
      try {
        const ra = rangeFor(s.unit, valsFor(s.periods.A, s.unit));
        const rb = rangeFor(s.unit, valsFor(s.periods.B, s.unit));
        const [resA, resB] = await Promise.all([
          bookingsApi.adminStats({ from: ra.from, to: ra.to }),
          bookingsApi.adminStats({ from: rb.from, to: rb.to }),
        ]);
        if (!cancelled) { setDataA(toStatsShape(resA)); setDataB(toStatsShape(resB)); }
      } catch (e) {
        console.warn("Impossibile caricare le statistiche", e);
        if (!cancelled) { setDataA(null); setDataB(null); }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [selKey]);

  //Aggiornamento real-time delle statistiche
  useAdminEvents(() => setRtKey((k) => k + 1));

  const aVals = valsFor(periods.A, unit);
  const bVals = valsFor(periods.B, unit);
  // ponytail: 52-week approximation, ignores ISO 53-week years — fine for browsing, revisit if that ever bites
  const stepWeek = (tag, delta) => {
    const p = periods[tag];
    const next = p.week + delta;
    if (next < 1) { updatePeriod(tag, "year", p.year - 1); updatePeriod(tag, "week", 52); }
    else if (next > 52) { updatePeriod(tag, "year", p.year + 1); updatePeriod(tag, "week", 1); }
    else updatePeriod(tag, "week", next);
  };

  const renderPeriod = (tag) => {
    const vals = valsFor(periods[tag], unit);
    const isA = tag === "A";
    return (
      <div className={`rounded-xl border p-3 ${isA ? "border-primary/30 bg-primary/5" : "border-brand/30 bg-brand/5"}`}>
        <div className="flex items-center justify-between gap-2">
          <span className={`inline-flex items-center gap-1.5 text-xs font-semibold ${isA ? "text-primary" : "text-brand"}`}>
            <span className={`h-2 w-2 rounded-full ${isA ? "bg-primary" : "bg-brand"}`} /> Periodo {tag}
          </span>
          {unit === "week" && <span className="text-[11px] text-muted-foreground">{weekRangeStr(vals.year, vals.week)}</span>}
        </div>
        <div className="mt-2 flex flex-wrap items-end gap-2">
          {unit === "week" && (
            <Field label="Settimana">
              <div className="flex items-center gap-1">
                <Button type="button" variant="outline" size="icon" className="h-9 w-9 shrink-0" aria-label="Settimana precedente" onClick={() => stepWeek(tag, -1)}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="flex-1 rounded-md border border-input bg-background px-2 py-1.5 text-center text-sm font-medium">Sett. {vals.week}</span>
                <Button type="button" variant="outline" size="icon" className="h-9 w-9 shrink-0" aria-label="Settimana successiva" onClick={() => stepWeek(tag, 1)}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </Field>
          )}
          {unit === "month" && (
            <Field label="Mese">
              <Select value={String(vals.month)} onValueChange={(v) => updatePeriod(tag, "month", Number(v))}>
                <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {MONTH_LABELS.map((m, i) => <SelectItem key={i + 1} value={String(i + 1)}>{m}</SelectItem>)}
                </SelectContent>
              </Select>
            </Field>
          )}
          <Field label="Anno">
            <Select value={String(vals.year)} onValueChange={(v) => updatePeriod(tag, "year", Number(v))}>
              <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
              <SelectContent>
                {years.map((y) => <SelectItem key={y} value={String(y)}>{y}</SelectItem>)}
              </SelectContent>
            </Select>
          </Field>
        </div>
      </div>
    );
  };

  return (
    <div className="flex min-h-screen flex-col bg-secondary/30">
      <AdminHeader />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-10 sm:px-6">
        <div className="mb-6">
          <Button asChild variant="ghost" size="sm" className="mb-2 -ml-2 hidden md:inline-flex"><Link to="/admin"><ArrowLeft className="mr-2 h-4 w-4" /> Dashboard</Link></Button>
          <h1 className="font-heading text-3xl font-semibold tracking-tight">Analisi performance</h1>
        </div>

        <div className="mb-4 flex flex-wrap gap-2">
          {UNITS.map((u) => (
            <Button key={u.id} size="sm" variant={unit === u.id ? "default" : "outline"} onClick={() => setUnit(u.id)}>{u.label}</Button>
          ))}
        </div>

        <div className="mb-6 rounded-2xl border border-border bg-card p-4">
          <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            <GitCompare className="h-4 w-4 text-primary" /> Confronta due periodi
          </div>
          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {renderPeriod("A")}
            {renderPeriod("B")}
          </div>
        </div>

        {loading && dataA ? (
          <div className="mb-4 h-1 w-full overflow-hidden rounded-full bg-secondary">
            <div className="h-full w-1/3 animate-pulse rounded-full bg-primary/60" />
          </div>
        ) : null}
        {loading && !dataA ? (
          <LoadingSpinner />
        ) : !dataA ? (
          <EmptyState title="Impossibile caricare le statistiche." />
        ) : (
          <div className={loading ? "opacity-70" : ""}>
            <StatsCompare labelA={labelFor(unit, aVals)} labelB={labelFor(unit, bVals)} dataA={dataA} dataB={dataB} />
          </div>
        )}
      </main>
    </div>
  );
}