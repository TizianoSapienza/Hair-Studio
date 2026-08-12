import { pool, withTransaction } from "../db/pool.js";
import { assertSlotAvailable, findAvailableStaff } from "./scheduleService.js";
import { createNotification, notifyAllAdmins, publishNotifications } from "./notificationService.js";
import { publishAdminEvent } from "./realtimeService.js";
import { getServiceById } from "./serviceService.js";
import { getStaffById } from "./staffService.js";
import { sendEmail } from "./emailService.js";
import { renderEmailLayout } from "../utils/emailTemplate.js";
import { escapeHtml } from "../utils/escapeHtml.js";
import { badRequest, conflict, forbidden, notFound } from "../utils/AppError.js";

const ACTIVE_STATUSES = ["in_attesa", "confermata"];

export async function createBooking({ user, serviceId, staffId, date, startTime, notes }) {
  const service = await getServiceById(serviceId);
  if (!service || !service.active) throw badRequest("Servizio non disponibile");

  let candidates;
  if (staffId === "any") {
    const { rows } = await pool.query("SELECT id, name FROM staff ORDER BY display_order, name");
    if (rows.length === 0) throw badRequest("Nessun operatore disponibile");
    candidates = rows;
  } else {
    const staff = await getStaffById(staffId);
    if (!staff) throw badRequest("Operatore non valido");
    candidates = [staff];
  }

  let createdNotifications = [];
  const booking = await withTransaction(async (client) => {
    //Una sola validazione/query di occupazione per tutti i candidatie un solo advisory lock sulla data.
    const { chosen, reason } = await findAvailableStaff(client, {
      date,
      startTime,
      durationMinutes: service.duration_minutes,
      candidates,
    });
    if (!chosen) {
      throw conflict(reason || "Nessuno slot disponibile per l'orario scelto");
    }

    const { rows } = await client.query(
      `INSERT INTO bookings (
         user_id, client_name, client_email, client_phone,
         service_id, service_name, staff_id, staff_name,
         booking_date, start_time, duration_minutes, notes
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
       RETURNING *`,
      [
        user.id,
        `${user.first_name} ${user.last_name}`,
        user.email,
        user.phone,
        service.id,
        service.name,
        chosen.id,
        chosen.name,
        date,
        startTime,
        service.duration_minutes,
        notes ?? null,
      ]
    );
    const created = rows[0];

    createdNotifications = await notifyAllAdmins(client, {
      type: "nuova_prenotazione",
      message: `Nuova prenotazione di ${created.client_name} per ${service.name} il ${date} alle ${startTime}`,
      bookingId: created.id,
    });

    return created;
  });

  //Pubblicati solo dopo il commit: se la transazione fallisce dopo l'insert, nessun evento
  //realtime deve raggiungere il client per una prenotazione/notifica che non esiste nel DB.
  publishAdminEvent({ type: "booking_created", booking });
  publishNotifications(createdNotifications);
  return booking;
}

export async function listUserBookings(userId) {
  const { rows } = await pool.query(
    `SELECT * FROM bookings WHERE user_id = $1 ORDER BY booking_date DESC, start_time DESC`,
    [userId]
  );
  return rows;
}

export async function cancelUserBooking(userId, bookingId) {
  const { rows } = await pool.query("SELECT * FROM bookings WHERE id = $1", [bookingId]);
  const booking = rows[0];
  if (!booking) throw notFound("Prenotazione non trovata");
  if (booking.user_id !== userId) throw forbidden();
  if (!ACTIVE_STATUSES.includes(booking.status)) {
    throw conflict("La prenotazione non può più essere cancellata");
  }

  let createdNotifications = [];
  const updated = await withTransaction(async (client) => {
    const { rows: updatedRows } = await client.query(
      `UPDATE bookings SET status = 'cancellata', updated_at = now() WHERE id = $1 RETURNING *`,
      [bookingId]
    );
    const updatedBooking = updatedRows[0];
    createdNotifications = await notifyAllAdmins(client, {
      type: "prenotazione_cancellata",
      message: `${updatedBooking.client_name} ha cancellato la prenotazione per ${updatedBooking.service_name} il ${updatedBooking.booking_date} alle ${updatedBooking.start_time}`,
      bookingId: updatedBooking.id,
    });
    return updatedBooking;
  });

  publishAdminEvent({ type: "booking_updated", booking: updated });
  publishNotifications(createdNotifications);
  return updated;
}

export async function adminListBookings({ date, from, to, staffId, status, q }) {
  const conditions = [];
  const params = [];

  if (date) {
    params.push(date);
    conditions.push(`booking_date = $${params.length}`);
  }
  if (from) {
    params.push(from);
    conditions.push(`booking_date >= $${params.length}`);
  }
  if (to) {
    params.push(to);
    conditions.push(`booking_date <= $${params.length}`);
  }
  if (staffId) {
    params.push(staffId);
    conditions.push(`staff_id = $${params.length}`);
  }
  if (status) {
    params.push(status);
    conditions.push(`status = $${params.length}`);
  }
  if (q) {
    params.push(`%${q}%`);
    conditions.push(`(client_name ILIKE $${params.length} OR client_phone ILIKE $${params.length} OR client_email ILIKE $${params.length})`);
  }

  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
  const { rows } = await pool.query(
    `SELECT * FROM bookings ${where} ORDER BY booking_date DESC, start_time DESC LIMIT 5000`,
    params
  );
  return rows;
}

export async function adminGetBooking(id) {
  const { rows } = await pool.query("SELECT * FROM bookings WHERE id = $1", [id]);
  return rows[0] || null;
}

async function transitionBooking(id, { from, to, notification }) {
  let createdNotification = null;
  const booking = await withTransaction(async (client) => {
    const { rows } = await client.query("SELECT * FROM bookings WHERE id = $1 FOR UPDATE", [id]);
    const booking = rows[0];
    if (!booking) throw notFound("Prenotazione non trovata");
    if (!from.includes(booking.status)) {
      throw conflict(`Impossibile passare dallo stato "${booking.status}" a "${to}"`);
    }

    const { rows: updatedRows } = await client.query(
      `UPDATE bookings SET status = $2, updated_at = now() WHERE id = $1 RETURNING *`,
      [id, to]
    );
    const updated = updatedRows[0];

    if (notification && updated.user_id) {
      createdNotification = await createNotification(client, {
        userId: updated.user_id,
        type: notification.type,
        message: notification.message(updated),
        bookingId: updated.id,
      });
    }

    return updated;
  });

  //Pubblicato solo dopo il commit (vedi createBooking).
  if (createdNotification) publishNotifications([createdNotification]);
  return booking;
}

export async function confirmBooking(id) {
  const booking = await transitionBooking(id, {
    from: ["in_attesa"],
    to: "confermata",
    notification: {
      type: "prenotazione_confermata",
      message: (b) => `La tua prenotazione del ${b.booking_date} alle ${b.start_time} è stata confermata`,
    },
  });
  publishAdminEvent({ type: "booking_updated", booking });
  sendEmail({
    to: booking.client_email,
    subject: "Prenotazione confermata - Hair Studio",
    html: renderEmailLayout({
      title: "Prenotazione confermata",
      bodyHtml: `<p>Ciao ${escapeHtml(booking.client_name)}, la tua prenotazione per <strong>${escapeHtml(booking.service_name)}</strong> il ${booking.booking_date} alle ${booking.start_time} è stata confermata.</p>`,
    }),
  }).catch((err) => console.error("[booking] invio email conferma fallito", err));
  return booking;
}

export async function completeBooking(id) {
  const booking = await transitionBooking(id, { from: ["confermata"], to: "completata" });
  publishAdminEvent({ type: "booking_updated", booking });
  return booking;
}

export async function markBookingNoShow(id) {
  const booking = await transitionBooking(id, { from: ["confermata"], to: "no_show" });
  publishAdminEvent({ type: "booking_updated", booking });
  return booking;
}

export async function cancelBookingAdmin(id) {
  const booking = await transitionBooking(id, {
    from: ACTIVE_STATUSES,
    to: "cancellata",
    notification: {
      type: "prenotazione_cancellata",
      message: (b) => `La tua prenotazione del ${b.booking_date} alle ${b.start_time} è stata cancellata`,
    },
  });
  publishAdminEvent({ type: "booking_updated", booking });
  sendEmail({
    to: booking.client_email,
    subject: "Prenotazione cancellata - Hair Studio",
    html: renderEmailLayout({
      title: "Prenotazione cancellata",
      bodyHtml: `<p>Ciao ${escapeHtml(booking.client_name)}, la tua prenotazione per <strong>${escapeHtml(booking.service_name)}</strong> il ${booking.booking_date} alle ${booking.start_time} è stata cancellata.</p>`,
    }),
  }).catch((err) => console.error("[booking] invio email cancellazione fallito", err));
  return booking;
}

//Le statistiche di ricavo usano il prezzo attuale del servizio: 
//per servizi con prezzo storico cambiato di recente il valore 
//è quindi approssimato, non un incasso storicamente esatto.
export async function getAdminStats(fromDate, toDate) {
  const { rows: byStatus } = await pool.query(
    `SELECT status, count(*)::int AS count
     FROM bookings
     WHERE booking_date BETWEEN $1 AND $2
     GROUP BY status`,
    [fromDate, toDate]
  );

  const { rows: revenueRows } = await pool.query(
    `SELECT COALESCE(SUM(s.price), 0)::numeric AS revenue, count(*)::int AS completed_count
     FROM bookings b
     JOIN services s ON s.id = b.service_id
     WHERE b.booking_date BETWEEN $1 AND $2 AND b.status = 'completata'`,
    [fromDate, toDate]
  );

  const { rows: byService } = await pool.query(
    `SELECT service_name, count(*)::int AS count
     FROM bookings
     WHERE booking_date BETWEEN $1 AND $2 AND status = 'completata'
     GROUP BY service_name
     ORDER BY count DESC`,
    [fromDate, toDate]
  );

  const { rows: byStaff } = await pool.query(
    `SELECT staff_name, count(*)::int AS count
     FROM bookings
     WHERE booking_date BETWEEN $1 AND $2 AND status = 'completata'
     GROUP BY staff_name
     ORDER BY count DESC`,
    [fromDate, toDate]
  );

  const { rows: byWeekday } = await pool.query(
    `SELECT EXTRACT(DOW FROM booking_date)::int AS weekday, count(*)::int AS count
     FROM bookings
     WHERE booking_date BETWEEN $1 AND $2 AND status = 'completata'
     GROUP BY weekday
     ORDER BY count DESC`,
    [fromDate, toDate]
  );

  const { rows: byTime } = await pool.query(
    `SELECT start_time, count(*)::int AS count
     FROM bookings
     WHERE booking_date BETWEEN $1 AND $2 AND status = 'completata'
     GROUP BY start_time
     ORDER BY count DESC`,
    [fromDate, toDate]
  );

  return {
    byStatus,
    revenue: Number(revenueRows[0]?.revenue ?? 0),
    completedCount: revenueRows[0]?.completed_count ?? 0,
    byService,
    byStaff,
    byWeekday,
    byTime,
  };
}
