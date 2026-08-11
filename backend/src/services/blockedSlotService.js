import { pool, withTransaction } from "../db/pool.js";
import { assertBlockDoesNotOverlapBookings } from "./scheduleService.js";
import { publishAdminEvent } from "./realtimeService.js";
import { rangesOverlap, timeToMinutes } from "../utils/time.js";
import { conflict, notFound } from "../utils/AppError.js";

export async function listBlockedSlots({ date, staffId }) {
  const conditions = [];
  const params = [];
  if (date) {
    params.push(date);
    conditions.push(`blocked_date = $${params.length}`);
  }
  if (staffId) {
    params.push(staffId);
    conditions.push(`staff_id = $${params.length}`);
  }
  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
  const { rows } = await pool.query(
    `SELECT * FROM blocked_slots ${where} ORDER BY blocked_date, start_time`,
    params
  );
  return rows;
}

export async function createBlockedSlot({ staffId, date, startTime, endTime, note, createdBy }) {
  const blocked = await withTransaction(async (client) => {
    const availability = await assertBlockDoesNotOverlapBookings(client, {
      date,
      staffId,
      startTime,
      endTime,
    });
    if (!availability.available) {
      throw conflict("Esiste già una prenotazione in questo intervallo");
    }

    const { rows } = await client.query(
      `INSERT INTO blocked_slots (staff_id, blocked_date, start_time, end_time, note, created_by)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [staffId, date, startTime, endTime, note ?? null, createdBy]
    );
    return rows[0];
  });

  publishAdminEvent({ type: "blocked_slot_created", blockedSlot: blocked });
  return blocked;
}

//Blocca più slot per più operatori in una sola transazione (2 query di lettura + 1 insert
//multi-riga) invece di una richiesta HTTP separata per ogni combinazione slot×operatore.
//Restituisce sia i blocchi creati sia quelli saltati perché già occupati
export async function createBlockedSlotsBulk({ staffIds, date, slots, note, createdBy }) {
  const { inserted, skipped } = await withTransaction(async (client) => {
    await client.query("SELECT pg_advisory_xact_lock(hashtext($1))", [`booking:${date}`]);

    const { rows: bookingRows } = await client.query(
      `SELECT staff_id, start_time, duration_minutes
       FROM bookings
       WHERE booking_date = $1 AND staff_id = ANY($2::uuid[]) AND status = ANY($3::booking_status[])`,
      [date, staffIds, ["in_attesa", "confermata"]]
    );
    const { rows: blockedRows } = await client.query(
      `SELECT staff_id, start_time, end_time
       FROM blocked_slots
       WHERE blocked_date = $1 AND staff_id = ANY($2::uuid[])`,
      [date, staffIds]
    );

    const occupiedByStaff = new Map(staffIds.map((id) => [id, []]));
    for (const b of bookingRows) {
      occupiedByStaff.get(b.staff_id)?.push({
        start: timeToMinutes(b.start_time),
        end: timeToMinutes(b.start_time) + b.duration_minutes,
      });
    }
    for (const b of blockedRows) {
      occupiedByStaff.get(b.staff_id)?.push({ start: timeToMinutes(b.start_time), end: timeToMinutes(b.end_time) });
    }

    const toInsert = [];
    const skipped = [];
    for (const staffId of staffIds) {
      const occupied = occupiedByStaff.get(staffId) || [];
      for (const slot of slots) {
        const start = timeToMinutes(slot.startTime);
        const end = timeToMinutes(slot.endTime);
        if (occupied.some((o) => rangesOverlap(start, end, o.start, o.end))) {
          skipped.push({ staffId, ...slot });
        } else {
          toInsert.push({ staffId, ...slot });
          occupied.push({ start, end }); //evita di reinserire lo stesso overlap due volte nel batch
        }
      }
    }

    let inserted = [];
    if (toInsert.length > 0) {
      const { rows } = await client.query(
        `INSERT INTO blocked_slots (staff_id, blocked_date, start_time, end_time, note, created_by)
         SELECT * FROM unnest($1::uuid[], $2::date[], $3::time[], $4::time[], $5::text[], $6::uuid[])
         RETURNING *`,
        [
          toInsert.map((s) => s.staffId),
          toInsert.map(() => date),
          toInsert.map((s) => s.startTime),
          toInsert.map((s) => s.endTime),
          toInsert.map(() => note ?? null),
          toInsert.map(() => createdBy),
        ]
      );
      inserted = rows;
    }

    return { inserted, skipped };
  });

  if (inserted.length > 0) {
    publishAdminEvent({ type: "blocked_slots_created", blockedSlots: inserted });
  }
  return { inserted, skipped };
}

export async function deleteBlockedSlot(id) {
  const { rows } = await pool.query("DELETE FROM blocked_slots WHERE id = $1 RETURNING id", [id]);
  if (!rows[0]) throw notFound("Blocco non trovato");
  publishAdminEvent({ type: "blocked_slot_deleted", blockedSlotId: id });
}

//Un blocco manuale può rappresentare un cliente arrivato per telefono/di persona (non
//tramite l'app): completata/no_show permettono allo staff di registrarne l'esito come
//per una prenotazione normale. FOR UPDATE evita una doppia transizione concorrente.
async function transitionBlockedSlot(id, to) {
  const blockedSlot = await withTransaction(async (client) => {
    const { rows } = await client.query("SELECT * FROM blocked_slots WHERE id = $1 FOR UPDATE", [id]);
    const current = rows[0];
    if (!current) throw notFound("Blocco non trovato");
    if (current.status !== "blocked") {
      throw conflict(`Impossibile passare dallo stato "${current.status}" a "${to}"`);
    }
    const { rows: updatedRows } = await client.query(
      `UPDATE blocked_slots SET status = $2, updated_at = now() WHERE id = $1 RETURNING *`,
      [id, to]
    );
    return updatedRows[0];
  });
  publishAdminEvent({ type: "blocked_slot_updated", blockedSlot });
  return blockedSlot;
}

export const completeBlockedSlot = (id) => transitionBlockedSlot(id, "completata");
export const markBlockedSlotNoShow = (id) => transitionBlockedSlot(id, "no_show");
