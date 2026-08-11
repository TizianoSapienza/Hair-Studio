import { verifyAccessToken, cookieNames } from "../services/tokenService.js";
import { getUserTokenVersion } from "../services/userService.js";
import { unauthorized, forbidden } from "../utils/AppError.js";

export async function attachUser(req, _res, next) {
  const token = req.cookies?.[cookieNames.ACCESS_COOKIE];
  if (!token) return next();
  try {
    const payload = verifyAccessToken(token);
    //Confronto con la versione corrente in DB: un cambio/reset password incrementa
    //token_version e invalida così ogni access token emesso prima, anche se non ancora scaduto.
    const currentVersion = await getUserTokenVersion(payload.id);
    if (currentVersion === payload.tokenVersion) {
      req.user = { id: payload.id, role: payload.role };
    }
  } catch {
    //token assente/scaduto/non valido: si prosegue senza utente, requireAuth farà fallire le route protette
  }
  next();
}

export function requireAuth(req, _res, next) {
  if (!req.user) return next(unauthorized());
  next();
}

export function requireRole(role) {
  return (req, _res, next) => {
    if (!req.user) return next(unauthorized());
    if (req.user.role !== role) return next(forbidden());
    next();
  };
}
