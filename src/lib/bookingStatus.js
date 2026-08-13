import { Clock, CheckCircle2, Check, Ban, UserX } from "lucide-react";

export const CANCELLABLE_BOOKING_STATUSES = ["in_attesa", "confermata"];

export function isCancellableBooking(status) {
  return CANCELLABLE_BOOKING_STATUSES.includes(status);
}

//Stati che occupano fisicamente uno slot (vedi backend/src/services/scheduleService.js) —
//tutto tranne "cancellata": una prenotazione completata o un no-show sono comunque accaduti
//in quello slot, non deve tornare "Libero" nel calendario (né per l'admin che rivede una
//giornata passata, né per evitare che una prenotazione futura segnata "completata" per
//errore liberi lo slot per un doppio booking). Diversa da CANCELLABLE_BOOKING_STATUSES
//("questo slot è preso?" vs "posso ancora cancellare?"), da tenere separata anche se in
//passato i due valori hanno coinciso.
export const OCCUPYING_BOOKING_STATUSES = ["in_attesa", "confermata", "completata", "no_show"];

//Stati mostrati come "prenotazioni imminenti" nell'area cliente (MyBookings) — esclude
//cancellata e no_show, che non sono più rilevanti per l'utente.
export const UPCOMING_BOOKING_STATUSES = ["in_attesa", "confermata", "completata"];

//Stati conteggiati come "prenotazione di oggi" nella dashboard admin — include no_show
//(occupava comunque uno slot della giornata), a differenza di UPCOMING_BOOKING_STATUSES.
export const TODAY_COUNTED_BOOKING_STATUSES = ["in_attesa", "confermata", "completata", "no_show"];

//Mapping stato -> aspetto del badge, condiviso da CalendarView (vista admin) e MyBookings
//(vista cliente) invece di due mapping hand-rolled paralleli.
export const BOOKING_STATUS_BADGE = {
  in_attesa: { variant: "warning", label: "In attesa", icon: Clock },
  confermata: { variant: "info", label: "Confermata", icon: CheckCircle2 },
  completata: { variant: "success", label: "Completato", icon: Check },
  cancellata: { variant: "muted", label: "Cancellata", icon: Ban },
  no_show: { variant: "destructiveSoft", label: "No-show", icon: UserX },
};
