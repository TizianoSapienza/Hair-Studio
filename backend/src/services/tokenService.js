import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { pool } from "../db/pool.js";
import { generateOpaqueToken, hashOpaqueToken } from "../utils/randomToken.js";

const ACCESS_COOKIE = "access_token";
const REFRESH_COOKIE = "refresh_token";
//Deve coprire sia /api/auth/refresh che /api/auth/logout: un path più stretto
//(es. solo /api/auth/refresh) fa sì che il browser non invii il cookie a /logout,
//impedendo la revoca del refresh token al logout (il cookie matching è per prefisso di path).
const REFRESH_COOKIE_PATH = "/api/auth";

function accessTtlMs() {
  return env.jwt.accessTtlMinutes * 60 * 1000;
}

function refreshTtlMs() {
  return env.jwt.refreshTtlDays * 24 * 60 * 60 * 1000;
}

export function signAccessToken(user) {
  return jwt.sign(
    { sub: user.id, role: user.role, tv: user.token_version },
    env.jwt.accessSecret,
    { expiresIn: `${env.jwt.accessTtlMinutes}m` }
  );
}

export function verifyAccessToken(token) {
  const payload = jwt.verify(token, env.jwt.accessSecret);
  return { id: payload.sub, role: payload.role, tokenVersion: payload.tv };
}

export async function issueRefreshToken(userId, { userAgent, ipAddress } = {}) {
  const rawToken = generateOpaqueToken();
  const tokenHash = hashOpaqueToken(rawToken);
  const expiresAt = new Date(Date.now() + refreshTtlMs());

  const { rows } = await pool.query(
    `INSERT INTO refresh_tokens (user_id, token_hash, expires_at, user_agent, ip_address)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id`,
    [userId, tokenHash, expiresAt, userAgent || null, ipAddress || null]
  );

  return { rawToken, id: rows[0].id };
}

export async function rotateRefreshToken(rawToken, { userAgent, ipAddress } = {}) {
  const tokenHash = hashOpaqueToken(rawToken);
  const { rows } = await pool.query(
    `SELECT id, user_id, expires_at, revoked_at FROM refresh_tokens WHERE token_hash = $1`,
    [tokenHash]
  );
  const record = rows[0];

  if (!record) {
    return { status: "invalid" };
  }

  if (record.revoked_at) {
    //Un token già ruotato/revocato viene ripresentato: 
    //possibile furto, si revocano tutte le sessioni.
    await pool.query(
      `UPDATE refresh_tokens SET revoked_at = now() WHERE user_id = $1 AND revoked_at IS NULL`,
      [record.user_id]
    );
    return { status: "reused" };
  }

  if (new Date(record.expires_at).getTime() < Date.now()) {
    await pool.query(`UPDATE refresh_tokens SET revoked_at = now() WHERE id = $1`, [record.id]);
    return { status: "expired" };
  }

  const { rawToken: newRawToken, id: newId } = await issueRefreshToken(record.user_id, {
    userAgent,
    ipAddress,
  });

  await pool.query(
    `UPDATE refresh_tokens SET revoked_at = now(), replaced_by = $2 WHERE id = $1`,
    [record.id, newId]
  );

  return { status: "ok", userId: record.user_id, rawToken: newRawToken };
}

export async function revokeRefreshToken(rawToken) {
  const tokenHash = hashOpaqueToken(rawToken);
  await pool.query(
    `UPDATE refresh_tokens SET revoked_at = now() WHERE token_hash = $1 AND revoked_at IS NULL`,
    [tokenHash]
  );
}

export async function revokeAllUserSessions(userId) {
  await pool.query(
    `UPDATE refresh_tokens SET revoked_at = now() WHERE user_id = $1 AND revoked_at IS NULL`,
    [userId]
  );
}

function cookieOptions(maxAgeMs, path = "/") {
  return {
    httpOnly: true,
    secure: env.nodeEnv === "production",
    sameSite: "strict",
    path,
    maxAge: maxAgeMs,
  };
}

export function setAuthCookies(res, { accessToken, refreshToken }) {
  res.cookie(ACCESS_COOKIE, accessToken, cookieOptions(accessTtlMs(), "/"));
  res.cookie(REFRESH_COOKIE, refreshToken, cookieOptions(refreshTtlMs(), REFRESH_COOKIE_PATH));
}

export function clearAuthCookies(res) {
  res.clearCookie(ACCESS_COOKIE, { path: "/" });
  res.clearCookie(REFRESH_COOKIE, { path: REFRESH_COOKIE_PATH });
  //Il path del cookie di refresh è cambiato da "/api/auth/refresh" a "/api/auth" durante
  //lo sviluppo: un client con un cookie ancora al vecchio path non verrebbe mai ripulito
  //(res.clearCookie deve combaciare esattamente il path usato in res.cookie). Puliamo
  //esplicitamente anche il vecchio path finché può esistere un browser con quel cookie.
  res.clearCookie(REFRESH_COOKIE, { path: "/api/auth/refresh" });
}

export const cookieNames = { ACCESS_COOKIE, REFRESH_COOKIE, REFRESH_COOKIE_PATH };
