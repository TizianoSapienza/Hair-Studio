import React, { useEffect, useState } from "react";
import { Clock, Euro } from "lucide-react";
import { motion } from "framer-motion";
import { base44 } from "@/api/base44Client";
import Reveal from "./Reveal";

function formatDuration(min) {
  if (min < 60) return `${min} min`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m ? `${h}h ${m}min` : `${h}h`;
}

export default function ServicesSection() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.functions.invoke("GetPublicSiteData")
      .then((res) => setServices(res.data?.services || []))
      .catch(() => setServices([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <section id="servizi" className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
      <Reveal>
        <div className="text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-primary">I nostri servizi</p>
          <h2 className="mt-2 font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
            Cura per ogni dettaglio
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">
            Scegli il trattamento che fa per te. Ogni servizio occupa lo slot necessario, calcolato in automatico.
          </p>
        </div>
      </Reveal>

      {loading ? (
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-44 animate-pulse rounded-2xl bg-muted" />
          ))}
        </div>
      ) : (
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((s, i) => (
            <motion.div
              key={s.id}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, delay: (i % 3) * 0.08 }}
              className="group rounded-2xl border border-border bg-card p-6 transition-all hover:-translate-y-1 hover:border-primary/50 hover:shadow-lg"
            >
              <div className="flex items-start justify-between">
                <h3 className="font-heading text-lg font-semibold">{s.name}</h3>
                <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-1 text-sm font-semibold text-primary">
                  <Euro className="mr-0.5 h-3.5 w-3.5" />{Number(s.price).toFixed(0)}
                </span>
              </div>
              {s.description && <p className="mt-2 text-sm text-muted-foreground">{s.description}</p>}
              <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4 text-brand" />
                {formatDuration(s.duration_minutes)}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </section>
  );
}