import { useEffect, useRef } from "react";
import { API_BASE_URL } from "@/lib/apiClient";

//Sottoscrizione SSE generica per endpoint a singolo consumatore (es. /notifications/stream,
//specifico per utente). Per endpoint condivisi da più componenti vedi useAdminEvents, che
//riusa un'unica connessione tramite adminEventsBus.
export function useSse(path, onMessage, enabled = true) {
  const cbRef = useRef(onMessage);
  useEffect(() => { cbRef.current = onMessage; }, [onMessage]);

  useEffect(() => {
    if (!enabled || !path) return undefined;
    const es = new EventSource(`${API_BASE_URL}${path}`, { withCredentials: true });
    es.onmessage = (e) => cbRef.current(e);
    return () => es.close();
  }, [path, enabled]);
}
