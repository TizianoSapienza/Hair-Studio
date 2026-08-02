import { useState, useEffect, useCallback } from "react";
import { base44 } from "@/api/base44Client";

// Il caching localStorage dei servizi è stato rimosso: interferiva con la
// persistenza del token di sessione. Queste funzioni rimangono come no-op
// per compatibilità con i componenti che le importano (es. ManageServices).
export function clearServicesCache() {}
export function getCachedServices() { return null; }
export function setCachedServices() {}

export default function useServices() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchServices = useCallback(async () => {
    try {
      const items = await base44.entities.Service.list("order");
      setServices((items || []).filter((s) => s.active !== false));
    } catch (e) {
      /* mantieni stato vuoto in caso di errore di rete */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchServices(); }, [fetchServices]);

  const refresh = useCallback(() => { fetchServices(); }, [fetchServices]);

  return { services, loading, refresh };
}