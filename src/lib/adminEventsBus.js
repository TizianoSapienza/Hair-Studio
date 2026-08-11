import { API_BASE_URL } from "@/lib/apiClient";

//Singleton condiviso: una sola connessione, condivisa da tutti i
//listener via ref-count, e chiusa quando l'ultimo si disiscrive.
const listeners = new Set();
let eventSource = null;

function ensureConnection() {
  if (eventSource) return;
  eventSource = new EventSource(`${API_BASE_URL}/admin/events`, { withCredentials: true });
  eventSource.onmessage = (e) => { for (const fn of listeners) fn(e); };
}

function teardownIfIdle() {
  if (listeners.size === 0 && eventSource) {
    eventSource.close();
    eventSource = null;
  }
}

export function subscribeAdminEvents(listener) {
  listeners.add(listener);
  ensureConnection();
  return () => {
    listeners.delete(listener);
    teardownIfIdle();
  };
}
