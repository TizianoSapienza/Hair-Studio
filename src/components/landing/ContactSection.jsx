import React from "react";
import { MapPin, Phone, Mail, Clock } from "lucide-react";
import { SALON } from "@/lib/salonConfig";
import useBusinessInfo from "@/hooks/useBusinessInfo";
import Reveal from "./Reveal";

const DEFAULT_ORARI = [
  { giorno: "Lunedì", orario: "", chiuso: true },
  { giorno: "Martedì", orario: "8:30 – 19:30", chiuso: false },
  { giorno: "Mercoledì", orario: "8:30 – 19:30", chiuso: false },
  { giorno: "Giovedì", orario: "8:30 – 19:30", chiuso: false },
  { giorno: "Venerdì", orario: "8:30 – 19:30", chiuso: false },
  { giorno: "Sabato", orario: "8:30 – 19:30", chiuso: false },
  { giorno: "Domenica", orario: "", chiuso: true },
];

export default function ContactSection() {
  const { data: info } = useBusinessInfo();
  const address = info?.address || SALON.address;
  const phone = info?.phone || SALON.phone;
  const email = info?.email || SALON.email;
  const orari = info?.openingHoursDisplay?.length ? info.openingHoursDisplay : DEFAULT_ORARI;
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
  const mapsEmbed = `https://www.google.com/maps?q=${encodeURIComponent(address)}&output=embed`;

  return (
    <section id="contatti" className="py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-primary-ink">Contatti</p>
          <h2 className="mt-2 font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
            Vieni a trovarci
          </h2>
        </div>

        <div className="mt-10 grid gap-8 md:grid-cols-2">
          <Reveal className="space-y-5">
            <div className="rounded-2xl border border-border bg-card p-5">
              <div className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-5 w-5 text-foreground/60" />
                <div>
                  <h3 className="font-semibold">Indirizzo</h3>
                  <p className="text-sm text-muted-foreground">{address}</p>
                  <a href={mapsUrl} target="_blank" rel="noreferrer" className="mt-1 inline-block text-sm font-medium text-brand hover:underline">
                    Apri in Google Maps →
                  </a>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-2xl border border-border bg-card p-5">
                <Phone className="h-5 w-5 text-foreground/60" />
                <h3 className="mt-2 font-semibold">Telefono</h3>
                <p className="text-sm text-muted-foreground">{phone}</p>
              </div>
              <div className="rounded-2xl border border-border bg-card p-5">
                <Mail className="h-5 w-5 text-foreground/60" />
                <h3 className="mt-2 font-semibold">Email</h3>
                <p className="break-all text-sm text-muted-foreground">{email}</p>
              </div>
            </div>
            <div className="rounded-2xl border border-border bg-card p-5">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-foreground/60" />
                <h3 className="font-semibold">Orari di apertura</h3>
              </div>
              <ul className="mt-3 space-y-1.5">
                {orari.map((row) => (
                  <li key={row.giorno} className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{row.giorno}</span>
                    <span className={row.chiuso ? "text-destructive" : "font-medium text-foreground"}>
                      {row.chiuso ? "Chiuso" : row.orario}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>

          <Reveal className="overflow-hidden rounded-2xl border border-border">
            <iframe
              title="Mappa Hair Studio"
              src={mapsEmbed}
              className="h-full min-h-[320px] w-full"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </Reveal>
        </div>
      </div>
    </section>
  );
}