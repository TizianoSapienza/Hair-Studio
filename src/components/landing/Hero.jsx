import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CalendarDays } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import useHomepageContent from "@/hooks/useHomepageContent";
import { useAuth } from "@/lib/AuthContext";

export default function Hero() {
  const { isAuthenticated, user } = useAuth();
  const isAdmin = isAuthenticated && user?.role === "admin";
  const { data: content } = useHomepageContent();
  const shouldReduceMotion = useReducedMotion();

  return (
    <section className="relative overflow-hidden min-h-[90vh] sm:min-h-screen flex items-center justify-center">
      {/* Immagine di Sfondo con object-cover per evitare deformazioni su mobile */}
      <motion.div
        className="absolute inset-0 h-full w-full"
        initial={shouldReduceMotion ? false : { scale: 1.12 }}
        animate={{ scale: 1 }}
        transition={shouldReduceMotion ? { duration: 0 } : { duration: 1.6, ease: [0.22, 1, 0.36, 1] }}
      >
        <img
          src={content?.heroImageUrl || "/img/hero.png"}
          alt="Interno del salone"
          className="h-full w-full object-cover object-center"
        />
        {/* Overlay gradient scuro per garantire leggibilità del testo */}
        <div className="absolute inset-0 bg-gradient-to-br from-black/85 via-black/60 to-brand/75" />
      </motion.div>

      {/* Contenuto Hero con padding ottimizzati per mobile */}
      <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-col items-start justify-center px-4 pt-28 pb-16 sm:px-6 sm:py-32 md:py-40">
        <motion.h1
          className="mt-4 max-w-2xl font-heading text-3xl font-semibold leading-tight tracking-tight text-white sm:text-5xl md:text-6xl"
          initial={shouldReduceMotion ? false : { opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.7, delay: 0.2 }}
        >
          {content?.heroTitle || "Stile che si taglia su misura, a Mascalucia."}
        </motion.h1>
        <motion.p
          className="mt-4 max-w-xl text-sm text-white/85 sm:text-lg"
          initial={shouldReduceMotion ? false : { opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.7, delay: 0.32 }}
        >
          {content?.heroSubtitle || "Barbershop moderno: tagli, barba e colore curati da tre professionisti. Prenota online il tuo turno in pochi secondi."}
        </motion.p>
        {!isAdmin && (
          <motion.div
            className="mt-6 flex w-full flex-col gap-3 sm:w-auto sm:flex-row"
            initial={shouldReduceMotion ? false : { opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.7, delay: 0.44 }}
          >
            <Button asChild size="lg" className="h-12 w-full px-7 text-base sm:w-auto">
              <Link to="/prenota"><CalendarDays className="mr-2 h-5 w-5" /> Prenota ora</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="h-12 w-full border-white/40 bg-white/10 px-7 text-base text-white hover:bg-white/20 hover:text-white sm:w-auto">
              <a href="#servizi">Scopri i servizi</a>
            </Button>
          </motion.div>
        )}
      </div>
    </section>
  );
}