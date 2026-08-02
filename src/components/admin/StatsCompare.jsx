import React from "react";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { DAY_LABELS_LONG } from "@/lib/salonConfig";

const METRICS = [
  { key: "total", label: "Prenotazioni totali", numeric: true, fmt: (d) => String(d?.total ?? 0) },
  { key: "topService", label: "Servizio più richiesto", numeric: false, fmt: (d) => (d?.topService ? `${d.topService[0]} (${d.topService[1]})` : "—") },
  { key: "revenue", label: "Fatturato stimato", numeric: true, fmt: (d) => `€ ${(d?.revenue ?? 0).toFixed(0)}` },
  { key: "topWd", label: "Giorno più richiesto", numeric: false, fmt: (d) => (d?.topWd ? DAY_LABELS_LONG[Number(d.topWd[0])] : "—") },
  { key: "topTm", label: "Fascia oraria più richiesta", numeric: false, fmt: (d) => (d?.topTm ? d.topTm[0] : "—") },
];

function numValue(key, d) {
  if (key === "total") return d?.total ?? 0;
  if (key === "revenue") return d?.revenue ?? 0;
  return 0;
}

export default function StatsCompare({ labelA, labelB, dataA, dataB }) {
  return (
    <div className="space-y-2">
      {METRICS.map((m) => {
        const va = m.fmt(dataA);
        const vb = m.fmt(dataB);
        let delta = null;
        if (m.numeric) {
          const diff = numValue(m.key, dataB) - numValue(m.key, dataA);
          const sign = m.key === "revenue" ? "€" : "";
          if (diff > 0) delta = { text: `+${sign}${m.key === "revenue" ? diff.toFixed(0) : diff}`, up: true };
          else if (diff < 0) delta = { text: `−${sign}${m.key === "revenue" ? Math.abs(diff).toFixed(0) : Math.abs(diff)}`, up: false };
          else delta = { text: "—", neutral: true };
        }
        return (
          <div key={m.key} className="rounded-xl border border-border bg-card p-3">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{m.label}</p>
            <div className="mt-2 grid grid-cols-2 gap-2">
              <div className="rounded-lg bg-primary/5 p-3">
                <p className="truncate text-[11px] font-medium text-primary/80">{labelA}</p>
                <p className="mt-1 font-heading text-base font-semibold leading-tight">{va}</p>
              </div>
              <div className="rounded-lg bg-brand/5 p-3">
                <p className="truncate text-[11px] font-medium text-brand/80">{labelB}</p>
                <p className="mt-1 font-heading text-base font-semibold leading-tight">{vb}</p>
                {delta && (
                  <p className={`mt-1 inline-flex items-center gap-0.5 text-[11px] font-medium ${delta.neutral ? "text-muted-foreground" : delta.up ? "text-emerald-600" : "text-red-600"}`}>
                    {delta.neutral ? <Minus className="h-3 w-3" /> : delta.up ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                    {delta.text}
                  </p>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}