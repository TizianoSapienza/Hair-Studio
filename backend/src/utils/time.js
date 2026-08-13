//Utility per orari in formato "HH:MM" (o "HH:MM:SS" restituito da Postgres per le colonne time),
//usate per generare la griglia di slot senza dover passare da oggetti Date/timezone.

export function timeToMinutes(time) {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

export function minutesToTime(minutes) {
  const h = Math.floor(minutes / 60)
    .toString()
    .padStart(2, "0");
  const m = (minutes % 60).toString().padStart(2, "0");
  return `${h}:${m}`;
}

export function rangesOverlap(startA, endA, startB, endB) {
  return startA < endB && startB < endA;
}

const MONTHS_IT = ["gennaio", "febbraio", "marzo", "aprile", "maggio", "giugno", "luglio", "agosto", "settembre", "ottobre", "novembre", "dicembre"];

export function formatDateIT(dateStr) {
  const [y, m, d] = String(dateStr).split("-").map(Number);
  return `${d} ${MONTHS_IT[m - 1]} ${y}`;
}

export function formatTimeShort(timeStr) {
  return String(timeStr).slice(0, 5);
}
