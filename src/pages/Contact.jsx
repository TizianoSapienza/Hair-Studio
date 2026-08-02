import React from "react";
import { MapPin, Phone, Mail, Instagram, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import SiteHeader from "@/components/layout/SiteHeader";
import SiteFooter from "@/components/layout/SiteFooter";
import useBusinessInfo from "@/hooks/useBusinessInfo";
import { SALON } from "@/lib/salonConfig";
import SeoJsonLd from "@/components/SeoJsonLd";

export default function Contact() {
  const { data: info } = useBusinessInfo();
  const name = info?.nome_attivita || SALON.name;
  const address = info?.indirizzo || SALON.address;
  const phone = info?.telefono || SALON.phone;
  const email = info?.email || SALON.email;
  const instagram = info?.instagram_url || SALON.instagram;
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;

  return (
    <div className="flex min-h-screen flex-col">
      <SeoJsonLd title="Contatti | Hair Studio Mascalucia" description="Contatta Hair Studio a Mascalucia: indirizzo, telefono, email e Instagram. Prenota online il tuo appuntamento." />
      <SiteHeader minimal />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-16 sm:px-6">
        <h1 className="font-heading text-4xl font-semibold tracking-tight">Contatti</h1>
        <p className="mt-3 text-muted-foreground">
          Hai domande o vuoi prenotare un appuntamento? Ecco come raggiungerci.
        </p>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <a href={mapsUrl} target="_blank" rel="noreferrer" className="rounded-2xl border border-border bg-card p-5 transition-colors hover:border-primary/50">
            <MapPin className="h-5 w-5 text-primary" />
            <h2 className="mt-2 font-semibold">Indirizzo</h2>
            <p className="mt-1 text-sm text-muted-foreground">{address}</p>
            <p className="mt-2 text-sm font-medium text-brand">Apri in Google Maps →</p>
          </a>
          <a href={`tel:${phone}`} className="rounded-2xl border border-border bg-card p-5 transition-colors hover:border-primary/50">
            <Phone className="h-5 w-5 text-primary" />
            <h2 className="mt-2 font-semibold">Telefono</h2>
            <p className="mt-1 text-sm text-muted-foreground">{phone}</p>
          </a>
          {email && (
            <a href={`mailto:${email}`} className="rounded-2xl border border-border bg-card p-5 transition-colors hover:border-primary/50">
              <Mail className="h-5 w-5 text-primary" />
              <h2 className="mt-2 font-semibold">Email</h2>
              <p className="mt-1 break-all text-sm text-muted-foreground">{email}</p>
            </a>
          )}
          {instagram && (
            <a href={instagram} target="_blank" rel="noreferrer" className="rounded-2xl border border-border bg-card p-5 transition-colors hover:border-primary/50">
              <Instagram className="h-5 w-5 text-primary" />
              <h2 className="mt-2 font-semibold">Instagram</h2>
              <p className="mt-1 text-sm text-muted-foreground">Seguici su Instagram</p>
            </a>
          )}
        </div>

        {(info?.google_maps_link || info?.google_review_link) && (
          <div className="mt-6 flex flex-wrap gap-3">
            {info?.google_maps_link && (
              <Button asChild variant="outline" size="sm">
                <a href={info.google_maps_link} target="_blank" rel="noreferrer"><MapPin className="mr-2 h-4 w-4" /> Vedi la scheda Google</a>
              </Button>
            )}
            {info?.google_review_link && (
              <Button asChild variant="outline" size="sm">
                <a href={info.google_review_link} target="_blank" rel="noreferrer"><Star className="mr-2 h-4 w-4" /> Lasciaci una recensione</a>
              </Button>
            )}
          </div>
        )}

        <p className="mt-8 text-sm text-muted-foreground">
          {name} — ti aspettiamo per il tuo prossimo taglio.
        </p>
      </main>
      <SiteFooter />
    </div>
  );
}