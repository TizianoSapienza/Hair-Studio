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
