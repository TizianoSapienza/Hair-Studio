import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Image } from "@/components/ui/image";
import { Loader2 } from "lucide-react";
import Reveal from "./Reveal";

const FALLBACK_PHOTOS = [
  "https://images.unsplash.com/photo-1507003211169-0a7802279c92?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1494796508271-885835f27965?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1573496773877-9c5739276b0f?auto=format&fit=crop&w=600&q=80",
];

export default function EmployeesSection() {
  const [team, setTeam] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.functions.invoke("GetPublicSiteData")
      .then((res) => setTeam(res.data?.staff || []))
      .catch(() => setTeam([]))
      .finally(() => setLoading(false));
  }, []);

  if (!loading && team.length === 0) return null;

  return (
    <section id="team" className="bg-secondary py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <Reveal>
          <div className="text-center">
            <p className="text-sm font-semibold uppercase tracking-wider text-primary">Il nostro team</p>
            <h2 className="mt-2 font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
              I nostri professionisti al tuo servizio
            </h2>
          </div>
        </Reveal>
        {loading ? (
          <div className="mt-10 flex justify-center"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
        ) : (
          <div className="mt-10 grid gap-6 sm:grid-cols-3">
            {team.map((m, i) => (
              <Reveal key={m.id} delay={i * 0.1}>
                <div className="group rounded-3xl border border-border bg-card p-3 text-center">
                  <div className="overflow-hidden rounded-2xl">
                    <Image
                      src={m.photo_url || FALLBACK_PHOTOS[i % FALLBACK_PHOTOS.length]}
                      alt={m.name}
                      fittingType="fill"
                      className="aspect-[4/5] w-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  <div className="px-3 pb-2 pt-4">
                    <h3 className="font-heading text-lg font-semibold">{m.name}</h3>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}