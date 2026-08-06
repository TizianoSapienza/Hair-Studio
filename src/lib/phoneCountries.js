import { getCountries, getCountryCallingCode } from "libphonenumber-js/min";

// Elenco ISO curato (~80 paesi) invece dei ~250 supportati dalla libreria: tutta
// l'Europa più i principali paesi del resto del mondo. Prefisso, nome e bandiera restano
// calcolati dalla libreria/da Intl — qui si sceglie solo QUALI paesi mostrare, evitando
// un dropdown con centinaia di voci poco rilevanti per la clientela del salone.
// Nota: esclude deliberatamente paesi che condividono il prefisso di uno già in lista
// (es. Città del Vaticano/+39 con l'Italia) per evitare ambiguità nella bandiera mostrata.
const CURATED_ISO = [
  // Europa
  "IT", "AT", "BE", "BG", "HR", "CY", "CZ", "DK", "EE", "FI", "FR", "DE", "GR", "HU",
  "IE", "LV", "LT", "LU", "MT", "NL", "PL", "PT", "RO", "SK", "SI", "ES", "SE",
  "GB", "CH", "NO", "IS", "AL", "BA", "MK", "ME", "RS", "MC", "SM", "LI", "AD",
  "UA", "MD", "TR", "RU",
  // Nord e Sud America
  "US", "CA", "MX", "BR", "AR", "CL", "CO", "PE", "VE", "UY", "EC",
  // Medio Oriente e Africa
  "SA", "AE", "QA", "KW", "IL", "EG", "MA", "TN", "DZ", "LB", "JO", "ZA", "NG", "KE",
  // Asia e Oceania
  "CN", "JP", "KR", "IN", "ID", "TH", "VN", "PH", "MY", "SG", "HK", "TW", "PK", "BD",
  "AU", "NZ",
];

let cached = null;

// Elenco paesi con prefisso telefonico (sottoinsieme curato, vedi CURATED_ISO sopra),
// calcolato una sola volta a livello di modulo: dati da libphonenumber-js, nomi
// localizzati in italiano via Intl.DisplayNames (nativo). Italia sempre in cima (mercato
// principale del salone), il resto in ordine alfabetico.
export function getPhoneCountries() {
  if (cached) return cached;
  const regionNames = new Intl.DisplayNames(["it"], { type: "region" });
  const supported = new Set(getCountries());
  const list = CURATED_ISO
    .filter((iso) => supported.has(iso))
    .map((iso) => ({
      iso,
      name: regionNames.of(iso) || iso,
      callingCode: `+${getCountryCallingCode(iso)}`,
    }));
  const italy = list.find((c) => c.iso === "IT");
  const rest = list.filter((c) => c.iso !== "IT").sort((a, b) => a.name.localeCompare(b.name, "it"));
  cached = italy ? [italy, ...rest] : rest;
  return cached;
}

// Converte un codice ISO 3166-1 alpha-2 (es. "IT") nei due Regional Indicator Symbols
// Unicode corrispondenti (es. "🇮🇹"): calcolo puro, non una tabella dati.
export function flagFromIso(iso) {
  return iso
    .toUpperCase()
    .replace(/./g, (c) => String.fromCodePoint(c.charCodeAt(0) - 65 + 0x1f1e6));
}
