import { pool } from "../db/pool.js";
import { publishUserNotification } from "./realtimeService.js";
import { sendPushToUsers } from "./pushService.js";

//Non pubblica sul bus realtime: l'evento va emesso dal chiamante DOPO il commit della
//transazione (vedi publishNotifications), altrimenti un client riceve via SSE una notifica
//che poi risulta non esistere nel DB se la transazione fallisce più avanti.
export async function createNotification(client, { userId, type, message, bookingId }) {
  const { rows } = await client.query(
    `INSERT INTO notifications (user_id, type, message, booking_id)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [userId, type, message, bookingId ?? null]
  );
  return rows[0];
}

export async function notifyAllAdmins(client, { type, message, bookingId }) {
  const { rows } = await client.query(
    `INSERT INTO notifications (user_id, type, message, booking_id)
     SELECT id, $1, $2, $3 FROM users WHERE role = 'admin'
     RETURNING *`,
    [type, message, bookingId ?? null]
  );
  return rows;
}

export function publishNotifications(notifications) {
  for (const notification of notifications) {
    publishUserNotification(notification.user_id, { type: "notification", notification });
  }

  //Le notifiche con lo stesso messaggio (es. notifyAllAdmins) condividono un solo invio push
  //multicast invece di uno per destinatario.
  const groups = new Map();
  for (const n of notifications) {
    if (!groups.has(n.message)) groups.set(n.message, { type: n.type, bookingId: n.booking_id, userIds: [] });
    groups.get(n.message).userIds.push(n.user_id);
  }
  for (const [message, { type, bookingId, userIds }] of groups) {
    sendPushToUsers(userIds, { type, message, bookingId }).catch((e) =>
      console.error("[push] errore invio notifica", e)
    );
  }
}

export async function listNotifications(userId, { unreadOnly } = {}) {
  const { rows } = await pool.query(
    `SELECT * FROM notifications
     WHERE user_id = $1 ${unreadOnly ? "AND is_read = false" : ""}
     ORDER BY created_at DESC
     LIMIT 50`,
    [userId]
  );
  return rows;
}

export async function markNotificationRead(userId, id) {
  const { rows } = await pool.query(
    `UPDATE notifications SET is_read = true WHERE id = $1 AND user_id = $2 RETURNING *`,
    [id, userId]
  );
  return rows[0] || null;
}

export async function markAllNotificationsRead(userId) {
  await pool.query(`UPDATE notifications SET is_read = true WHERE user_id = $1 AND is_read = false`, [
    userId,
  ]);
}
