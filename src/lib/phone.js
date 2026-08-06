// L'app salva sempre il numero nel formato "${code} ${number}" (es. "+39 3331234567"):
// il caso senza spazio è solo input malformato/legacy, non uno scenario da parsare.
export function splitPhone(raw) {
  if (!raw) return { code: "+39", number: "" };
  const str = String(raw).trim();
  const spaceIdx = str.indexOf(" ");
  if (spaceIdx === -1) return { code: "+39", number: str };
  return { code: str.slice(0, spaceIdx), number: str.slice(spaceIdx + 1) };
}
