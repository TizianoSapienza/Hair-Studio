export function extractError(err) {
  return err?.message || "Errore sconosciuto";
}
