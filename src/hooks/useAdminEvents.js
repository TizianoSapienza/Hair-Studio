import { useEffect, useRef } from "react";
import { subscribeAdminEvents } from "@/lib/adminEventsBus";

//La sottoscrizione resta stabile anche se onEvent cambia identità ad ogni render (es. closure
//su stato locale): altrimenti ogni cambio farebbe un giro unsubscribe+resubscribe sul bus
//condiviso, vanificando in parte il beneficio di avere un'unica connessione SSE.
export function useAdminEvents(onEvent, enabled = true) {
  const cbRef = useRef(onEvent);
  useEffect(() => { cbRef.current = onEvent; }, [onEvent]);

  useEffect(() => {
    if (!enabled) return undefined;
    return subscribeAdminEvents((e) => cbRef.current(e));
  }, [enabled]);
}
