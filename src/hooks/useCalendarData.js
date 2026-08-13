import { useCallback, useEffect, useRef, useState } from "react";
import { scheduleApi } from "@/api/scheduleApi";
import { bookingsApi } from "@/api/bookingsApi";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";

//Fetch del calendario (pubblico o admin) per una data/operatore/servizio, con debounce sui
//cambi rapidi di selezione e scarto delle risposte obsolete (richieste concorrenti fuori
//ordine). L'aggiornamento realtime in modalità admin è guidato dal `refreshKey` del chiamante
//(AdminDashboard si sottoscrive già a useAdminEvents per le proprie statistiche — una seconda
//sottoscrizione qui duplicherebbe il reload per lo stesso evento SSE).
export function useCalendarData({ mode, dateStr, staffId, refreshKey, durationMinutes }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const debouncedDateStr = useDebouncedValue(dateStr, 250);
  const loadIdRef = useRef(0);

  const load = useCallback(async (silent) => {
    const myId = ++loadIdRef.current;
    if (!silent) setLoading(true);
    try {
      const params = { date: debouncedDateStr, staff_id: staffId, duration_minutes: durationMinutes || undefined };
      const res = mode === "admin" ? await bookingsApi.adminCalendar(params) : await scheduleApi.publicCalendar(params);
      if (myId === loadIdRef.current) setData(res);
    } catch {
      if (myId === loadIdRef.current && !silent) setData(null);
    } finally {
      if (myId === loadIdRef.current && !silent) setLoading(false);
    }
  }, [debouncedDateStr, staffId, mode, durationMinutes]);

  useEffect(() => { load(); }, [load, refreshKey]);

  return { data, loading, load };
}
