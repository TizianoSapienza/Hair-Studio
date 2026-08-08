import rateLimit, { ipKeyGenerator } from "express-rate-limit";
import { tooManyRequests } from "../utils/AppError.js";

//keyGenerator di default = req.ip (richiede "trust proxy", già impostato in app.js).
//Aggiungiamo l'email/telefono nel body come componente extra della chiave sugli endpoint
//di autenticazione: limita anche il credential stuffing distribuito su più IP contro lo
//stesso account, non solo il brute force da un singolo IP. ipKeyGenerator normalizza
//gli indirizzi IPv6 (altrimenti ogni indirizzo di uno /64 aggirerebbe il limite).
function withIdentifierKey(req) {
  const identifier = req.body?.email || req.body?.phone || "";
  return `${ipKeyGenerator(req.ip)}:${identifier}`;
}

const handler = (_req, _res, next) => next(tooManyRequests());

//Endpoint sensibili (login, registrazione, reset password): max 5 tentativi ogni 15 minuti.
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: withIdentifierKey,
  handler,
});

//Limite generale su tutta l'API, per assorbire scraping/abusi non mirati all'auth.
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  handler,
});
