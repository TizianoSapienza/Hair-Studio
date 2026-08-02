import React from "react";
import { Link } from "react-router-dom";
import { Image } from "@/components/ui/image";
import { Button } from "@/components/ui/button";
import { Users, Award, Sparkles, ArrowRight } from "lucide-react";
import Reveal from "./Reveal";
import useHomepageContent from "@/hooks/useHomepageContent";

export default function AboutSection() {
  const { data: content } = useHomepageContent();
  const STATS = [
    { icon: Users, label: content?.card1_numero || "3 barbieri", desc: content?.card1_testo || "Sempre al tuo servizio" },
    { icon: Award, label: content?.card2_numero || "10+ anni", desc: content?.card2_testo || "Di esperienza" },
    { icon: Sparkles, label: content?.card3_numero || "Taglio su misura", desc: content?.card3_testo || "Per ogni stile" },
  ];
  return (
    <section id="chi-siamo" className="bg-secondary py-20">
      <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 sm:px-6 md:grid-cols-2">
        <Reveal className="relative">
          <Image
            src="https://images.unsplash.com/photo-1599351431202-1e0f0137899a?auto=format&fit=crop&w=900&q=80"
            alt="Barbiere al lavoro"
            fittingType="fill"
            className="aspect-[4/5] w-full rounded-3xl"
          />
          <div className="absolute -bottom-5 -right-3 hidden rounded-2xl border border-border bg-background p-4 shadow-lg sm:block">
            <p className="font-heading text-3xl font-semibold text-primary">100%</p>
            <p className="text-xs text-muted-foreground">clienti soddisfatti</p>
          </div>
        </Reveal>
        <Reveal>
          <p className="text-sm font-semibold uppercase tracking-wider text-primary">Chi siamo</p>
          <h2 className="mt-2 font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
            {content?.chi_siamo_titolo || "Un barbershop pensato per te"}
          </h2>
          <p className="mt-4 text-muted-foreground">
            {content?.chi_siamo_testo || "Da Hair Studio uniamo tradizione e modernità in un ambiente curato e informale. Tre professionisti lavorano in parallelo per offrirti tempi brevi e qualità alta, senza mai rinunciare alla cura del dettaglio."}
          </p>
          <div className="mt-6">
            <Button asChild variant="outline" size="sm">
              <Link to="/about">Scopri di più <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
          </div>
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {STATS.map((s) => (
              <div key={s.label} className="rounded-2xl border border-border bg-card p-4">
                <s.icon className="h-6 w-6 text-primary" />
                <p className="mt-3 font-heading text-base font-semibold">{s.label}</p>
                <p className="text-sm text-muted-foreground">{s.desc}</p>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}