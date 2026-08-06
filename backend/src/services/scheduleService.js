import { pool, withTransaction } from "../db/pool.js";
import { minutesToTime, rangesOverlap, timeToMinutes } from "../utils/time.js";

const OCCUPYING_STATUSES = ["in_attesa", "confermata"];

export async function getSlotMinutes() {
  const { rows } = await pool.query("SELECT slot_minutes FROM app_settings WHERE id = 1");
  return rows[0]?.slot_minutes ?? 30;
}

export async function getOpeningHoursList() {
  const { rows } = await pool.query(
    "SELECT day_of_week, is_open, start_time, end_time FROM opening_hours ORDER BY day_of_week"
  );
  return rows;
}

export async function getClosuresInRange(fromDate, toDate) {
  const { rows } = await pool.query(
    `SELECT id, start_date, end_date, closure_type, open_time, close_time, note
     FROM closures
     WHERE start_date <= $2 AND (end_date IS NULL OR end_date >= $1)
     ORDER BY start_date`,
    [fromDate, toDate]
  );
  return rows;
}

async function getClosureForDate(date) {
  const { rows } = await pool.query(
    `SELECT closure_type, open_time, close_time
     FROM closures
     WHERE start_date <= $1 AND (end_date IS NULL OR end_date >= $1)
     ORDER BY start_date DESC
     LIMIT 1`,
    [date]
  );
  return rows[0] || null;
}

//Chiusure straordinarie (closures) sovrascrivono gli orari standard (opening_hours) per una data specifica.
export async function getEffectiveHoursForDate(date) {
  const closure = await getClosureForDate(date);
  if (closure) {
    if (closure.closure_type === "closed") {
      return { isOpen: false };
    }
    return { isOpen: true, startTime: closure.open_time, endTime: closure.close_time };
  }

  const dayOfWeek = new Date(`${date}T00:00:00`).getDay();
  const { rows } = await pool.query(
    "SELECT is_open, start_time, end_time FROM opening_hours WHERE day_of_week = $1",
    [dayOfWeek]
  );
  const row = rows[0];
  if (!row || !row.is_open) return { isOpen: false };
  return { isOpen: true, startTime: row.start_time, endTime: row.end_time };
}

//Vista giornaliera su uno staff specifico o, se staffId è omesso, aggregata su tutti gli
//operatori (usata per "primo disponibile" lato cliente e filtro "Tutti" lato admin).
//`includeDetails`=true aggiunge l'elenco prenotazioni/blocchi con i dati del cliente — MAI
//da esporre sull'endpoint pubblico (privacy calendario, vedi CLAUDE.md).
export async function getDayOverview(date, staffId, { includeDetails } = { includeDetails: false }) {
  const [effectiveHours, slotMinutes, operators] = await Promise.all([
    getEffectiveHoursForDate(date),
    getSlotMinutes(),
    pool.query("SELECT id, name FROM staff ORDER BY display_order, name").then((r) => r.rows),
  ]);

  if (!effectiveHours.isOpen) {
    return { open: false, reason: "Il salone è chiuso in questa data", slotMinutes, slots: [], bookings: [], operators };
  }

  const staffIds = staffId ? [staffId] : operators.map((o) => o.id);

  const { rows: bookingRows } = await pool.query(
    `SELECT id, staff_id, staff_name, start_time, duration_minutes, status,
            client_name, client_email, client_phone, service_name
     FROM bookings
     WHERE booking_date = $1 AND staff_id = ANY($2::uuid[])
     ORDER BY start_time`,
    [date, staffIds]
  );

  const { rows: blockedRows } = await pool.query(
    `SELECT id, staff_id, start_time, end_time, note
     FROM blocked_slots
     WHERE blocked_date = $1 AND staff_id = ANY($2::uuid[])
     ORDER BY start_time`,
    [date, staffIds]
  );

  const occupyingByStaff = new Map(staffIds.map((id) => [id, []]));
  for (const b of bookingRows) {
    if (!OCCUPYING_STATUSES.includes(b.status)) continue;
    occupyingByStaff.get(b.staff_id)?.push({
      start: timeToMinutes(b.start_time),
      end: timeToMinutes(b.start_time) + b.duration_minutes,
    });
  }
  for (const b of blockedRows) {
    occupyingByStaff.get(b.staff_id)?.push({
      start: timeToMinutes(b.start_time),
      end: timeToMinutes(b.end_time),
    });
  }

  const startMinutes = timeToMinutes(effectiveHours.startTime);
  const endMinutes = timeToMinutes(effectiveHours.endTime);
  const total = staffIds.length;
  const slots = [];

  for (let s = startMinutes; s + slotMinutes <= endMinutes; s += slotMinutes) {
    const slotEnd = s + slotMinutes;
    let freeCount = 0;
    for (const id of staffIds) {
      const busy = (occupyingByStaff.get(id) || []).some((r) => rangesOverlap(s, slotEnd, r.start, r.end));
      if (!busy) freeCount++;
    }
    slots.push({
      time: minutesToTime(s),
      available: freeCount > 0,
      freeCount,
      status: freeCount === 0 ? "full" : freeCount === total ? "free" : "partial",
    });
  }

  if (!includeDetails) {
    return { open: true, slotMinutes, slots };
  }

  const staffNameById = new Map(operators.map((o) => [o.id, o.name]));
  const bookings = [
    ...bookingRows.map((b) => ({
      id: b.id,
      status: b.status,
      start_time: b.start_time,
      staff_id: b.staff_id,
      staff_name: b.staff_name,
      client_name: b.client_name,
      client_email: b.client_email,
      client_phone: b.client_phone,
      service_name: b.service_name,
      slots_count: Math.round(b.duration_minutes / slotMinutes),
    })),
    ...blockedRows.map((b) => ({
      id: b.id,
      status: "blocked",
      start_time: b.start_time,
      staff_id: b.staff_id,
      staff_name: staffNameById.get(b.staff_id) || "",
      client_name: b.note || "Bloccato (manuale)",
      client_email: null,
      client_phone: null,
      service_name: null,
      slots_count: Math.round((timeToMinutes(b.end_time) - timeToMinutes(b.start_time)) / slotMinutes),
    })),
  ];

  return { open: true, slotMinutes, slots, bookings, operators };
}

//Validazioni indipendenti dallo staff (data/ora valide e non passate, salone aperto,
//orario dentro l'apertura effettiva, allineamento alla griglia). Condivise da
//assertSlotAvailable (uno staff) e findAvailableStaff ("primo disponibile") per non
//duplicare la stessa logica due volte.
async function validateBookingWindow(date, startTime, durationMinutes) {
  //startTime può arrivare come "HH:MM" o "HH:MM:SS" : normalizzato a 
  // "HH:MM" prima di costruire la Date, altrimenti un formato con i
  //secondi produce "...T10:30:00:00", una data non valida.
  const startTimeHHMM = startTime.slice(0, 5);
  const requestedStart = new Date(`${date}T${startTimeHHMM}:00`);
  if (Number.isNaN(requestedStart.getTime()) || requestedStart.getTime() < Date.now()) {
    return { ok: false, reason: "Non è possibile prenotare una data/ora passata o non valida" };
  }

  const effectiveHours = await getEffectiveHoursForDate(date);
  if (!effectiveHours.isOpen) {
    return { ok: false, reason: "Il salone è chiuso in questa data" };
  }

  const slotMinutes = await getSlotMinutes();
  const startMinutes = timeToMinutes(startTimeHHMM);
  const endMinutes = startMinutes + durationMinutes;
  const openStart = timeToMinutes(effectiveHours.startTime);
  const openEnd = timeToMinutes(effectiveHours.endTime);

  if (startMinutes < openStart || endMinutes > openEnd) {
    return { ok: false, reason: "Orario fuori dagli orari di apertura" };
  }

  //L'allineamento alla griglia è relativo all'orario di apertura effettivo (che può non
  //essere un multiplo di slotMinutes, es. un'apertura ridotta alle 08:45), non a mezzanotte.
  if ((startMinutes - openStart) % slotMinutes !== 0) {
    return { ok: false, reason: "Orario non allineato alla griglia degli slot" };
  }

  return { ok: true, startMinutes, endMinutes };
}

//Prenotazioni/blocchi occupati per uno o più staff nella data indicata, in un'unica query
//per tabella (indipendentemente dal numero di staff richiesti).
async function getOccupiedRangesBatch(client, date, staffIds) {
  const { rows: bookingRows } = await client.query(
    `SELECT staff_id, start_time, duration_minutes
     FROM bookings
     WHERE booking_date = $1 AND staff_id = ANY($2::uuid[]) AND status = ANY($3::booking_status[])`,
    [date, staffIds, OCCUPYING_STATUSES]
  );
  const { rows: blockedRows } = await client.query(
    `SELECT staff_id, start_time, end_time
     FROM blocked_slots
     WHERE blocked_date = $1 AND staff_id = ANY($2::uuid[])`,
    [date, staffIds]
  );

  const byStaff = new Map(staffIds.map((id) => [id, []]));
  for (const b of bookingRows) {
    byStaff.get(b.staff_id)?.push({
      start: timeToMinutes(b.start_time),
      end: timeToMinutes(b.start_time) + b.duration_minutes,
    });
  }
  for (const b of blockedRows) {
    byStaff.get(b.staff_id)?.push({ start: timeToMinutes(b.start_time), end: timeToMinutes(b.end_time) });
  }
  return byStaff;
}

//Verifica che [startTime, startTime+durationMinutes) sia interamente dentro l'orario di apertura
//effettivo del giorno e non si sovrapponga a prenotazioni/blocchi esistenti per lo staff.
export async function assertSlotAvailable(client, { date, staffId, startTime, durationMinutes }) {
  const window = await validateBookingWindow(date, startTime, durationMinutes);
  if (!window.ok) return { available: false, reason: window.reason };

  //Serializza i tentativi concorrenti sullo stesso staff/giorno.
  await client.query("SELECT pg_advisory_xact_lock(hashtext($1))", [`${staffId}:${date}`]);

  const occupied = (await getOccupiedRangesBatch(client, date, [staffId])).get(staffId) || [];
  const overlap = occupied.some((o) => rangesOverlap(window.startMinutes, window.endMinutes, o.start, o.end));

  if (overlap) {
    return { available: false, reason: "Slot non più disponibile" };
  }

  return { available: true };
}

//"Primo disponibile": risolve in una volta sola — evita sia le query
//ridondanti sia N lock distinti nella stessa transazione 
//(rischio di deadlock se due prenotazioni concorrenti li acquisiscono 
//in ordine diverso).
export async function findAvailableStaff(client, { date, startTime, durationMinutes, candidates }) {
  const window = await validateBookingWindow(date, startTime, durationMinutes);
  if (!window.ok) return { chosen: null, reason: window.reason };

  await client.query("SELECT pg_advisory_xact_lock(hashtext($1))", [`booking:${date}`]);

  const occupiedByStaff = await getOccupiedRangesBatch(client, date, candidates.map((c) => c.id));
  for (const candidate of candidates) {
    const occupied = occupiedByStaff.get(candidate.id) || [];
    const overlap = occupied.some((o) => rangesOverlap(window.startMinutes, window.endMinutes, o.start, o.end));
    if (!overlap) return { chosen: candidate };
  }

  return { chosen: null, reason: "Nessuno slot disponibile per l'orario scelto" };
}

//Usata da BlockSlot: verifica solo la sovrapposizione con prenotazioni attive (bookings).
//La sovrapposizione tra blocchi è già garantita dal constraint EXCLUDE su blocked_slots.
export async function assertBlockDoesNotOverlapBookings(client, { date, staffId, startTime, endTime }) {
  await client.query("SELECT pg_advisory_xact_lock(hashtext($1))", [`${staffId}:${date}`]);

  const { rows: bookingRows } = await client.query(
    `SELECT start_time, duration_minutes
     FROM bookings
     WHERE booking_date = $1 AND staff_id = $2 AND status = ANY($3::booking_status[])`,
    [date, staffId, OCCUPYING_STATUSES]
  );

  const startMinutes = timeToMinutes(startTime);
  const endMinutes = timeToMinutes(endTime);

  const overlap = bookingRows.some((b) =>
    rangesOverlap(startMinutes, endMinutes, timeToMinutes(b.start_time), timeToMinutes(b.start_time) + b.duration_minutes)
  );

  return { available: !overlap };
}

// --- Gestione admin ---

export async function upsertOpeningHours(days, slotMinutes) {
  return withTransaction(async (client) => {
    for (const day of days) {
      await client.query(
        `UPDATE opening_hours SET is_open = $2, start_time = $3, end_time = $4
         WHERE day_of_week = $1`,
        [day.dayOfWeek, day.isOpen, day.isOpen ? day.startTime : null, day.isOpen ? day.endTime : null]
      );
    }
    if (slotMinutes) {
      await client.query(
        `INSERT INTO app_settings (id, slot_minutes) VALUES (1, $1)
         ON CONFLICT (id) DO UPDATE SET slot_minutes = EXCLUDED.slot_minutes, updated_at = now()`,
        [slotMinutes]
      );
    }
    const { rows } = await client.query(
      "SELECT day_of_week, is_open, start_time, end_time FROM opening_hours ORDER BY day_of_week"
    );
    return rows;
  });
}

export async function listAllClosures() {
  const { rows } = await pool.query("SELECT * FROM closures ORDER BY start_date DESC");
  return rows;
}

export async function createClosure(data) {
  const { rows } = await pool.query(
    `INSERT INTO closures (start_date, end_date, closure_type, open_time, close_time, note)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [
      data.startDate,
      data.endDate ?? null,
      data.closureType ?? "closed",
      data.openTime ?? null,
      data.closeTime ?? null,
      data.note ?? null,
    ]
  );
  return rows[0];
}

export async function updateClosure(id, data) {
  const { rows: currentRows } = await pool.query("SELECT * FROM closures WHERE id = $1", [id]);
  const current = currentRows[0];
  if (!current) return null;

  const { rows } = await pool.query(
    `UPDATE closures
     SET start_date = $2, end_date = $3, closure_type = $4, open_time = $5, close_time = $6, note = $7, updated_at = now()
     WHERE id = $1
     RETURNING *`,
    [
      id,
      data.startDate ?? current.start_date,
      data.endDate !== undefined ? data.endDate : current.end_date,
      data.closureType ?? current.closure_type,
      data.openTime !== undefined ? data.openTime : current.open_time,
      data.closeTime !== undefined ? data.closeTime : current.close_time,
      data.note !== undefined ? data.note : current.note,
    ]
  );
  return rows[0];
}

export async function deleteClosure(id) {
  await pool.query("DELETE FROM closures WHERE id = $1", [id]);
}
