export const SALON = {
  name: "Hair Studio",
  tagline: "Barbieria moderna a Mascalucia",
  address: "Corso S. Vito, 186, 95030 Mascalucia (CT)",
  phone: "+39 376 205 3632",
  email: "info@hairstudio.it",
  logo_url:
    "https://media.base44.com/images/public/6a677a9b2297537e4f1d8e9f/871188b26_hairstudio.jpg",
  instagram: "https://www.instagram.com/hairstudio_mascalucia/",
  mapsUrl: "https://www.google.com/maps/search/?api=1&query=Corso+S.+Vito+186+Mascalucia+CT",
  mapsEmbed:
    "https://www.google.com/maps?q=Corso%20S.%20Vito%20186%20Mascalucia%20CT&output=embed",
};

export const OPENING = {
  start: "08:30",
  end: "19:30",
  openDays: [2, 3, 4, 5, 6],
  slotMinutes: 30,
  capacity: 3,
};

export const DAY_LABELS = ["Dom", "Lun", "Mar", "Mer", "Gio", "Ven", "Sab"];
export const DAY_LABELS_LONG = [
  "Domenica",
  "Lunedì",
  "Martedì",
  "Mercoledì",
  "Giovedì",
  "Venerdì",
  "Sabato",
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

export function isOpenDay(dateStr) {
  const d = new Date(dateStr + "T00:00:00");
  return OPENING.openDays.includes(d.getDay());
}

export function generateSlots() {
  const slots = [];
  let cur = timeToMinutes(OPENING.start);
  const end = timeToMinutes(OPENING.end);
  while (cur < end) {
    slots.push(minutesToTime(cur));
    cur += OPENING.slotMinutes;
  }
  return slots;
}

export function slotsForDuration(durationMinutes) {
  return Math.max(1, Math.ceil(durationMinutes / OPENING.slotMinutes));
}

export function formatDateIT(dateStr) {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("it-IT", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}