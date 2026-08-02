import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import SiteHeader from "@/components/layout/SiteHeader";
import SiteFooter from "@/components/layout/SiteFooter";
import useHomepageContent from "@/hooks/useHomepageContent";

export default function About() {
  const { data: content } = useHomepageContent();
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader minimal />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-16 sm:px-6">
        <h1 className="font-heading text-4xl font-semibold tracking-tight">Chi siamo — Hair Studio Mascalucia</h1>
        <div className="mt-6 space-y-4 leading-relaxed text-foreground/90">
          <p>
            {content?.about_chi_siamo || "Hair Studio è il barbershop di riferimento a Mascalucia, in provincia di Catania. Nato dalla passione per il mestiere e per la cura del dettaglio, il salone unisce la tradizione della barberia italiana con uno stile moderno e accogliente. Qui ogni cliente trova un ambiente informale ma professionale, dove prendersi il tempo necessario per ascoltare le esigenze e costruire il look su misura."}
          </p>
          <p>
            {content?.about_come_funziona || "L'app di prenotazione online di Hair Studio è pensata per i clienti del salone e per chi desidera scoprirne i servizi: permette di scegliere il trattamento — taglio, barba, piega, colore o riflessi — selezionare l'operatore preferito e prenotare un appuntamento in pochi secondi, direttamente dal telefono o dal computer. Il calendario mostra in tempo reale la disponibilità di ciascun professionista, calcolando gli slot necessari in base alla durata del servizio, così da evitare sovrapposizioni e attese."}
          </p>
          <p>
            {content?.about_team || "Il team è composto da tre barbieri esperti — Antonio, Andrea e Santo — che lavorano in parallelo per garantire tempi brevi e qualità alta. Per qualsiasi domanda sull'app o per prenotare un appuntamento, visita la pagina Contatti: siamo felici di accoglierti e aiutarti a trovare il tuo nuovo look."}
          </p>
        </div>
        <div className="mt-8">
          <Button asChild>
            <Link to="/contact">Vai ai Contatti <ArrowRight className="ml-2 h-4 w-4" /></Link>
          </Button>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}