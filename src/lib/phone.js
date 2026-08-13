export const DEFAULT_COUNTRY_CODE = "+39";

// L'app salva sempre il numero nel formato "${code} ${number}" (es. "+39 3331234567"):
// il caso senza spazio è solo input malformato/legacy, non uno scenario da parsare.
export function splitPhone(raw) {
  if (!raw) return { code: DEFAULT_COUNTRY_CODE, number: "" };
  const str = String(raw).trim();
  const spaceIdx = str.indexOf(" ");
  if (spaceIdx === -1) return { code: DEFAULT_COUNTRY_CODE, number: str };
  return { code: str.slice(0, spaceIdx), number: str.slice(spaceIdx + 1) };
}

//Rimuove spazi e lo 0 iniziale prima di anteporre il prefisso internazionale.
//L'Italia è tra le poche eccezioni alla convenzione: lo 0 iniziale fa parte del numero (fissi)
//e va mantenuto anche con il prefisso +39 — altrove è un trunk prefix da scartare.
export function normalizePhoneDigits(raw, code) {
  const stripped = String(raw || "").replace(/\s+/g, "");
  return code === DEFAULT_COUNTRY_CODE ? stripped : stripped.replace(/^0+/, "");
}

export const PHONE_DIGITS_REGEX = /^\d{6,}$/;
