import React, { useEffect } from "react";
import { Routes, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";

const PAGE_TITLES = {
  "/": "Hair Studio | Barbershop",
  "/about": "Chi siamo | Hair Studio",
  "/contact": "Contatti | Hair Studio",
  "/login": "Accedi | Hair Studio",
  "/register": "Registrati | Hair Studio",
  "/forgot-password": "Password dimenticata | Hair Studio",
  "/reset-password": "Reimposta password | Hair Studio",
  "/verify-email": "Verifica email | Hair Studio",
  "/prenota": "Prenota | Hair Studio",
  "/le-mie-prenotazioni": "Le mie prenotazioni | Hair Studio",
  "/profilo": "Il mio profilo | Hair Studio",
  "/admin": "Dashboard | Hair Studio",
  "/admin/servizi": "Gestione servizi | Hair Studio",
  "/admin/clienti": "Gestione clienti | Hair Studio",
  "/admin/statistiche": "Statistiche | Hair Studio",
  "/admin/impostazioni": "Impostazioni | Hair Studio",
  "/admin/staff": "Gestione operatori | Hair Studio",
  "/admin/orari": "Orari e chiusure | Hair Studio",
  "/admin/contenuti": "Contenuti home | Hair Studio",
};

export default function AnimatedRoutes({ children }) {
  const location = useLocation();

  useEffect(() => {
    document.title = PAGE_TITLES[location.pathname] || "Pagina non trovata | Hair Studio";
  }, [location.pathname]);

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.25, ease: "easeInOut" }}
      >
        <Routes location={location}>{children}</Routes>
      </motion.div>
    </AnimatePresence>
  );
}