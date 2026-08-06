import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CalendarDays } from "lucide-react";
import { motion } from "framer-motion";
import { Image } from "@/components/ui/image";
import useHomepageContent from "@/hooks/useHomepageContent";
import { useAuth } from "@/lib/AuthContext";

export default function Hero() {
  const { isAuthenticated, user } = useAuth();
  const isAdmin = isAuthenticated && user?.role === "admin";
  const { data: content } = useHomepageContent();

  return (
    <section className="relative overflow-hidden min-h-[78vh]">
      <motion.div
        className="absolute inset-0"
        initial={{ scale: 1.12 }}
        animate={{ scale: 1 }}
        transition={{ duration: 1.6, ease: [0.22, 1, 0.36, 1] }}
      >
        <Image
          src="https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=1920&q=80"
          alt="Interno del salone"
          fittingType="fill"
          className="h-full w-full"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-black/80 via-black/55 to-brand/75" />
      </motion.div>
      <div className="relative mx-auto flex min-h-[78vh] max-w-6xl flex-col items-start justify-center px-4 py-24 sm:px-6 sm:py-32 md:py-40">
        <motion.h1
          className="mt-6 max-w-2xl font-heading text-4xl font-semibold leading-tight tracking-tight text-white sm:text-5xl md:text-6xl"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
        >
          {content?.heroTitle || "Stile che si taglia su misura, a Mascalucia."}
        </motion.h1>
        <motion.p
          className="mt-5 max-w-xl text-base text-white/80 sm:text-lg"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.32 }}
        >
          {content?.heroSubtitle || "Barbershop moderno: tagli, barba e colore curati da tre professionisti. Prenota online il tuo turno in pochi secondi."}
        </motion.p>
        {!isAdmin && (
          <motion.div
            className="mt-8 flex flex-col gap-3 sm:flex-row"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.44 }}
          >
            <Button asChild size="lg" className="h-12 px-7 text-base">
              <Link to="/prenota"><CalendarDays className="mr-2 h-5 w-5" /> Prenota ora</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="h-12 border-white/40 bg-white/10 px-7 text-base text-white hover:bg-white/20 hover:text-white">
              <a href="#servizi">Scopri i servizi</a>
            </Button>
          </motion.div>
        )}
      </div>
    </section>
  );
}