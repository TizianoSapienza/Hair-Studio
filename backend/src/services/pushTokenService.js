import { pool } from "../db/pool.js";

//Se il token esiste già ma appartiene a un altro utente, la WHERE non matcha: l'upsert
//diventa un no-op (nessuna riga restituita) invece di dirottare la registrazione push
//di un altro utente sul chiamante.
export async function upsertPushToken(userId, token, deviceLabel) {
  const { rows } = await pool.query(
    `INSERT INTO push_tokens (user_id, token, device_label)
     VALUES ($1, $2, $3)
     ON CONFLICT (token) DO UPDATE SET
       device_label = EXCLUDED.device_label,
       last_used_at = now()
     WHERE push_tokens.user_id = EXCLUDED.user_id
     RETURNING *`,
    [userId, token, deviceLabel ?? null]
  );
  return rows[0] || null;
}

export async function deletePushToken(userId, token) {
  await pool.query("DELETE FROM push_tokens WHERE user_id = $1 AND token = $2", [userId, token]);
}
