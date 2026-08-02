import React from "react";
import { Scissors, Euro, CalendarDays, Clock } from "lucide-react";
import { DAY_LABELS_LONG } from "@/lib/salonConfig";

const TINTS = {
  primary: "bg-primary/10 text-primary",
  emerald: "bg-emerald-50 text-emerald-600",
  brand: "bg-brand/10 text-brand",
  amber: "bg-amber-50 text-amber-600",
};

function Card({ icon, tint, label, children }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className={`inline-flex h-9 w-9 items-center justify-center rounded-full ${TINTS[tint]}`}>{icon}</div>
      <p className="mt-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
      {children}
    </div>
  );
}

export default function StatsPanel({ label, data }) {
  return (
    <div className="flex-1">
      <h2 className="mb-3 font-heading text-sm font-semibold uppercase tracking-wide text-muted-foreground">{label}</h2>
      <div className="grid gap-3 sm:grid-cols-2">
        <Card tint="primary" label="Servizio più richiesto" icon={<Scissors className="h-4 w-4" />}>
          {data?.topService ? (
            <>
              <p className="mt-1 font-heading text-lg font-semibold">{data.topService[0]}</p>
              <p className="text-sm text-muted-foreground">{data.topService[1]} prenot.</p>
            </>
          ) : <p className="mt-1 text-sm text-muted-foreground">Nessun dato.</p>}
        </Card>
        <Card tint="emerald" label="Fatturato stimato" icon={<Euro className="h-4 w-4" />}>
          <p className="mt-1 font-heading text-lg font-semibold">€ {(data?.revenue ?? 0).toFixed(0)}</p>
          <p className="text-sm text-muted-foreground">Solo completate</p>
        </Card>
        <Card tint="brand" label="Giorno più richiesto" icon={<CalendarDays className="h-4 w-4" />}>
          {data?.topWd ? (
            <p className="mt-1 font-heading text-lg font-semibold capitalize">{DAY_LABELS_LONG[Number(data.topWd[0])]}</p>
          ) : <p className="mt-1 text-sm text-muted-foreground">Nessun dato.</p>}
        </Card>
        <Card tint="amber" label="Fascia oraria più richiesta" icon={<Clock className="h-4 w-4" />}>
          {data?.topTm ? (
            <p className="mt-1 font-heading text-lg font-semibold font-mono">{data.topTm[0]}</p>
          ) : <p className="mt-1 text-sm text-muted-foreground">Nessun dato.</p>}
          <p className="text-sm text-muted-foreground">{data?.total ?? 0} prenot.</p>
        </Card>
      </div>
    </div>
  );
}