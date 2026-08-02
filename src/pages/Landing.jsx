import React from "react";
import SiteHeader from "@/components/layout/SiteHeader";
import SiteFooter from "@/components/layout/SiteFooter";
import Hero from "@/components/landing/Hero";
import ServicesSection from "@/components/landing/ServicesSection";
import AboutSection from "@/components/landing/AboutSection";
import GallerySection from "@/components/landing/GallerySection";
import EmployeesSection from "@/components/landing/EmployeesSection";
import ContactSection from "@/components/landing/ContactSection";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CalendarDays } from "lucide-react";
import { useAuth } from "@/lib/AuthContext";
import SeoJsonLd from "@/components/SeoJsonLd";

export default function Landing() {
  const { isAuthenticated, user } = useAuth();
  const isAdmin = isAuthenticated && user?.role === "admin";

  return (
    <div className="flex min-h-screen flex-col">
      <SeoJsonLd title="Hair Studio | Barbershop Mascalucia" description="Barbershop moderno a Mascalucia: tagli, barba e colore curati da tre professionisti. Prenota online il tuo appuntamento." />
      <SiteHeader />
      <main className="flex-1">
        <Hero />
        <ServicesSection />
        <AboutSection />
        <GallerySection />
        <EmployeesSection />

        {!isAdmin && (
          <section className="bg-brand text-white">
            <div className="mx-auto flex max-w-6xl flex-col items-center gap-5 px-4 py-16 text-center sm:px-6">
              <h2 className="font-heading text-3xl font-semibold tracking-tight sm:text-4xl">
                Pronto per il tuo nuovo look?
              </h2>
              <p className="max-w-xl text-white/80">
                Scegli giorno e servizio, prenota online in pochi secondi. Tre barbieri pronti ad accoglierti.
              </p>
              <Button asChild size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90">
                <Link to="/prenota"><CalendarDays className="mr-2 h-5 w-5" /> Prenota ora</Link>
              </Button>
            </div>
          </section>
        )}

        <ContactSection />
      </main>
      <SiteFooter />
    </div>
  );
}