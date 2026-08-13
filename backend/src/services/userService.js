import { pool } from "../db/pool.js";

//Whitelist esplicita dei campi esposti al client: la riga grezza porta anche password_hash e
//token_version, che non devono mai lasciare il backend.
export function toPublicUser(row) {
  if (!row) return null;
  return {
    id: row.id,
    firstName: row.first_name,
    lastName: row.last_name,
    email: row.email,
    phone: row.phone,
    role: row.role,
    createdAt: row.created_at,
  };
}

export async function findUserByEmail(email) {
  const { rows } = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
  return rows[0] || null;
}

export async function findUserById(id) {
  const { rows } = await pool.query("SELECT * FROM users WHERE id = $1", [id]);
  return rows[0] || null;
}

//role fissato a 'cliente': la registrazione pubblica non deve mai poter creare un admin
//(vedi CLAUDE.md — l'account admin si crea solo via seed).
export async function createUser({ firstName, lastName, email, phone, passwordHash }) {
  const { rows } = await pool.query(
    `INSERT INTO users (first_name, last_name, email, phone, password_hash, role)
     VALUES ($1, $2, $3, $4, $5, 'cliente')
     RETURNING *`,
    [firstName, lastName, email, phone, passwordHash]
  );
  return rows[0];
}

export async function updateUserProfile(id, { firstName, lastName, email, phone }) {
  const { rows } = await pool.query(
    `UPDATE users
     SET first_name = $2, last_name = $3, email = $4, phone = $5, updated_at = now()
     WHERE id = $1
     RETURNING *`,
    [id, firstName, lastName, email, phone]
  );
  return rows[0] || null;
}

export async function updateUserPassword(id, passwordHash) {
  //token_version incrementata: invalida immediatamente ogni access token JWT già emesso
  //per questo utente, non solo i refresh token (vedi middleware/auth.js).
  await pool.query(
    "UPDATE users SET password_hash = $2, token_version = token_version + 1, updated_at = now() WHERE id = $1",
    [id, passwordHash]
  );
}

export async function getUserTokenVersion(id) {
  const { rows } = await pool.query("SELECT token_version FROM users WHERE id = $1", [id]);
  return rows[0]?.token_version ?? null;
}

export async function deleteUser(id) {
  await pool.query("DELETE FROM users WHERE id = $1", [id]);
}

export async function listAllUsers() {
  const { rows } = await pool.query("SELECT * FROM users ORDER BY created_at DESC");
  return rows.map(toPublicUser);
}
