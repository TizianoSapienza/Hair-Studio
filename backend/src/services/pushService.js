//Integrazione Firebase Cloud Messaging. Finché FCM_SERVICE_ACCOUNT_JSON non è
//configurata, l'invio viene solo loggato invece di fallire, come per Resend
//in emailService.js: le prenotazioni non devono bloccarsi per un secret assente.
import admin from "firebase-admin";
import { pool } from "../db/pool.js";

const PUSH_TITLES = {
  nuova_prenotazione: "Nuova prenotazione",
  prenotazione_confermata: "Prenotazione confermata",
  prenotazione_cancellata: "Prenotazione cancellata",
};

const STALE_TOKEN_ERRORS = new Set([
  "messaging/invalid-registration-token",
  "messaging/registration-token-not-registered",
]);

let messaging = null;
let initAttempted = false;

function getMessaging() {
  if (initAttempted) return messaging;
  initAttempted = true;
  const json = process.env.FCM_SERVICE_ACCOUNT_JSON;
  if (!json) {
    console.warn("[push] FCM_SERVICE_ACCOUNT_JSON non configurato, push non inviate");
    return null;
  }
  try {
    const serviceAccount = JSON.parse(json);
    const app = admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
    messaging = admin.messaging(app);
  } catch (e) {
    console.error("[push] FCM_SERVICE_ACCOUNT_JSON non valido, push disabilitate:", e.message);
  }
  return messaging;
}

export async function sendPushToUsers(userIds, { type, message, bookingId }) {
  const client = getMessaging();
  if (!client || userIds.length === 0) return;

  const { rows } = await pool.query(
    `SELECT token FROM push_tokens WHERE user_id = ANY($1::uuid[])`,
    [userIds]
  );
  if (rows.length === 0) return;
  const tokens = rows.map((r) => r.token);

  try {
    const result = await client.sendEachForMulticast({
      tokens,
      notification: { title: PUSH_TITLES[type] || "Hair Studio", body: message },
      data: bookingId ? { bookingId: String(bookingId) } : {},
    });
    const stale = result.responses
      .map((r, i) => (!r.success && STALE_TOKEN_ERRORS.has(r.error?.code) ? tokens[i] : null))
      .filter(Boolean);
    if (stale.length) {
      await pool.query(`DELETE FROM push_tokens WHERE token = ANY($1::text[])`, [stale]);
    }
  } catch (e) {
    console.error("[push] invio fallito:", e.message);
  }
}
