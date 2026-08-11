//Difesa in profondità: il backend valida già lo schema (http/https) dei link social/maps
//modificabili da admin, ma un link con schema pericoloso (es. "javascript:") renderizzato
//in un href viene eseguito al click su ogni browser.
export function safeHref(url) {
  if (!url) return null;
  try {
    const parsed = new URL(url);
    return parsed.protocol === "http:" || parsed.protocol === "https:" ? url : null;
  } catch {
    return null;
  }
}
