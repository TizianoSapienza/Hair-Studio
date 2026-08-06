import React from "react";
import { usePublicStaff } from "@/hooks/useServices";
import { Image } from "@/components/ui/image";
import { Loader2 } from "lucide-react";
import Reveal from "./Reveal";

export default function EmployeesSection() {
  const { data: team = [], isLoading: loading } = usePublicStaff();

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
                      src={m.photoUrl}
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
