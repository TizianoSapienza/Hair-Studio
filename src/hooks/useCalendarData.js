import { useCallback, useEffect, useRef, useState } from "react";
import { scheduleApi } from "@/api/scheduleApi";
import { bookingsApi } from "@/api/bookingsApi";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { useAdminEvents } from "@/hooks/useAdminEvents";

//Fetch del calendario (pubblico o admin) per una data/operatore, con debounce sui cambi
//rapidi di selezione, scarto delle risposte obsolete (richieste concorrenti fuori ordine) e
//aggiornamento realtime via SSE per la vista admin.
export function useCalendarData({ mode, dateStr, staffId, refreshKey }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const debouncedDateStr = useDebouncedValue(dateStr, 250);
  const loadIdRef = useRef(0);

  const load = useCallback(async (silent) => {
    const myId = ++loadIdRef.current;
    if (!silent) setLoading(true);
    try {
      const params = { date: debouncedDateStr, staff_id: staffId };
      const res = mode === "admin" ? await bookingsApi.adminCalendar(params) : await scheduleApi.publicCalendar(params);
      if (myId === loadIdRef.current) setData(res);
    } catch {
      if (myId === loadIdRef.current && !silent) setData(null);
    } finally {
      if (myId === loadIdRef.current && !silent) setLoading(false);
    }
  }, [debouncedDateStr, staffId, mode]);

  useEffect(() => { load(); }, [load, refreshKey]);

  //Realtime (solo admin): un evento SSE per qualunque scrittura su prenotazioni/blocchi
  //fa ricaricare in modalità silenziosa (nessuno schermo vuoto durante il refresh).
  useAdminEvents(() => load(true), mode === "admin");

  return { data, loading, load };
}
