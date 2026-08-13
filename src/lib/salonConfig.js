//logo_url è vuoto finché non viene introdotto il caricamento immagini per l'admin
//(business_info non ha ancora un campo logo dedicato): Logo.jsx mostra un fallback locale.
export const SALON = {
  name: "Hair Studio",
  tagline: "Il tuo barbershop di fiducia",
  address: "Via Ignota, 90000 Comune (ZZ)",
  phone: "+39 340 000 0000",
  email: "info@hairstudio.it",
  logo_url: "",
};

export const DAY_LABELS_LONG = [
  "Domenica",
  "Lunedì",
  "Martedì",
  "Mercoledì",
  "Giovedì",
  "Venerdì",
  "Sabato",
];

//Fallback usato sia da AdminSettings (form di modifica) sia da ContactSection (vista pubblica)
//finché business_info.openingHoursDisplay non è ancora stato configurato da admin.
export const DEFAULT_ORARI = [
  { giorno: "Lunedì", orario: "", chiuso: true },
  { giorno: "Martedì", orario: "8:30 – 19:30", chiuso: false },
  { giorno: "Mercoledì", orario: "8:30 – 19:30", chiuso: false },
  { giorno: "Giovedì", orario: "8:30 – 19:30", chiuso: false },
  { giorno: "Venerdì", orario: "8:30 – 19:30", chiuso: false },
  { giorno: "Sabato", orario: "8:30 – 19:30", chiuso: false },
  { giorno: "Domenica", orario: "", chiuso: true },
];

export function timeToMinutes(t) {
  if (!t || typeof t !== "string") return 0;
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

export function minutesToTime(min) {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

export function formatDateIT(dateStr) {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("it-IT", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}