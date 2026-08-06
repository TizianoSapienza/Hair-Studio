import bcrypt from "bcrypt";
import { env } from "../config/env.js";
import { pool } from "../db/pool.js";
import {
  createUser,
  findUserByEmail,
  findUserById,
  toPublicUser,
  updateUserPassword,
} from "../services/userService.js";
import {
  clearAuthCookies,
  cookieNames,
  issueRefreshToken,
  revokeAllUserSessions,
  revokeRefreshToken,
  rotateRefreshToken,
  setAuthCookies,
  signAccessToken,
} from "../services/tokenService.js";
import { sendEmail } from "../services/emailService.js";
import { generateOpaqueToken, hashOpaqueToken } from "../utils/randomToken.js";
import { escapeHtml } from "../utils/escapeHtml.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { badRequest, conflict, unauthorized } from "../utils/AppError.js";

// Hash fittizio con cui confrontare la password quando l'utente non esiste, così bcrypt.compare
// gira comunque e il tempo di risposta di login non rivela se l'email è registrata.
const DUMMY_PASSWORD_HASH = bcrypt.hashSync("dummy-password-for-constant-time-compare", env.bcryptCost);

async function issueSessionAndRespond(res, user, req) {
  const accessToken = signAccessToken(user);
  const { rawToken: refreshToken } = await issueRefreshToken(user.id, {
    userAgent: req.headers["user-agent"],
    ipAddress: req.ip,
  });
  setAuthCookies(res, { accessToken, refreshToken });
}

export const register = asyncHandler(async (req, res) => {
  const { firstName, lastName, email, phone, password } = req.body;

  const existing = await findUserByEmail(email);
  if (existing) {
    // Messaggio generico: non conferma esplicitamente che l'email è già registrata
    // (coerente con la scelta già fatta in forgotPassword di non rivelare quali email esistono).
    throw conflict("Non è stato possibile completare la registrazione con questi dati");
  }

  const passwordHash = await bcrypt.hash(password, env.bcryptCost);
  const user = await createUser({ firstName, lastName, email, phone, passwordHash });

  sendEmail({
    to: email,
    subject: "Benvenuto su Hair Studio",
    html: `<p>Ciao ${escapeHtml(firstName)}, la registrazione è avvenuta con successo.</p>`,
  }).catch((err) => console.error("[auth] invio email registrazione fallito", err));

  await issueSessionAndRespond(res, user, req);
  res.status(201).json({ user: toPublicUser(user) });
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await findUserByEmail(email);
  const passwordMatches = await bcrypt.compare(password, user?.password_hash || DUMMY_PASSWORD_HASH);
  if (!user || !passwordMatches) throw unauthorized("Credenziali non valide");

  await issueSessionAndRespond(res, user, req);
  res.json({ user: toPublicUser(user) });
});

export const refresh = asyncHandler(async (req, res) => {
  const rawToken = req.cookies?.[cookieNames.REFRESH_COOKIE];
  if (!rawToken) throw unauthorized("Sessione non valida");

  const result = await rotateRefreshToken(rawToken, {
    userAgent: req.headers["user-agent"],
    ipAddress: req.ip,
  });

  if (result.status !== "ok") {
    clearAuthCookies(res);
    throw unauthorized("Sessione scaduta, effettua nuovamente il login");
  }

  const user = await findUserById(result.userId);
  if (!user) {
    clearAuthCookies(res);
    throw unauthorized("Utente non trovato");
  }

  const accessToken = signAccessToken(user);
  setAuthCookies(res, { accessToken, refreshToken: result.rawToken });
  res.json({ user: toPublicUser(user) });
});

export const logout = asyncHandler(async (req, res) => {
  const rawToken = req.cookies?.[cookieNames.REFRESH_COOKIE];
  if (rawToken) {
    await revokeRefreshToken(rawToken);
  }
  clearAuthCookies(res);
  res.status(204).end();
});

export const me = asyncHandler(async (req, res) => {
  const user = await findUserById(req.user.id);
  if (!user) throw unauthorized();
  res.json({ user: toPublicUser(user) });
});

export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  const user = await findUserById(req.user.id);
  if (!user) throw unauthorized();

  const matches = await bcrypt.compare(currentPassword, user.password_hash);
  if (!matches) throw badRequest("Password attuale non corretta");

  const passwordHash = await bcrypt.hash(newPassword, env.bcryptCost);
  await updateUserPassword(user.id, passwordHash);

  // Cambio password: si invalidano tutte le sessioni esistenti per sicurezza.
  await revokeAllUserSessions(user.id);
  clearAuthCookies(res);

  res.status(204).end();
});

const RESET_TOKEN_TTL_MS = 60 * 60 * 1000; // 1 ora

export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await findUserByEmail(email);

  // Risposta identica indipendentemente dall'esistenza dell'utente, per non rivelare quali email sono registrate.
  if (user) {
    const rawToken = generateOpaqueToken();
    const tokenHash = hashOpaqueToken(rawToken);
    const expiresAt = new Date(Date.now() + RESET_TOKEN_TTL_MS);

    // Un token precedente ancora valido non deve restare utilizzabile dopo una nuova richiesta
    // (es. l'utente richiede un nuovo reset perché sospetta che un token precedente sia compromesso).
    await pool.query(
      `UPDATE password_reset_tokens SET used_at = now() WHERE user_id = $1 AND used_at IS NULL`,
      [user.id]
    );

    await pool.query(
      `INSERT INTO password_reset_tokens (user_id, token_hash, expires_at) VALUES ($1, $2, $3)`,
      [user.id, tokenHash, expiresAt]
    );

    sendEmail({
      to: email,
      subject: "Reimposta la tua password - Hair Studio",
      html: `<p>Usa questo codice per reimpostare la password (valido 1 ora): <b>${rawToken}</b></p>`,
    }).catch((err) => console.error("[auth] invio email reset password fallito", err));
  }

  res.status(204).end();
});

export const resetPassword = asyncHandler(async (req, res) => {
  const { token, newPassword } = req.body;
  const tokenHash = hashOpaqueToken(token);

  const { rows } = await pool.query(
    `SELECT id, user_id, expires_at, used_at FROM password_reset_tokens WHERE token_hash = $1`,
    [tokenHash]
  );
  const record = rows[0];

  if (!record || record.used_at || new Date(record.expires_at).getTime() < Date.now()) {
    throw badRequest("Token di reset non valido o scaduto");
  }

  const passwordHash = await bcrypt.hash(newPassword, env.bcryptCost);
  await updateUserPassword(record.user_id, passwordHash);
  // Consuma questo token e, per sicurezza, ogni altro token di reset ancora attivo per lo stesso utente.
  await pool.query(
    "UPDATE password_reset_tokens SET used_at = now() WHERE user_id = $1 AND used_at IS NULL",
    [record.user_id]
  );
  await revokeAllUserSessions(record.user_id);

  res.status(204).end();
});
