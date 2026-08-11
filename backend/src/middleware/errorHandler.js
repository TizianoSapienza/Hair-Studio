import { AppError } from "../utils/AppError.js";

export function notFoundHandler(_req, _res, next) {
  next(new AppError(404, "Endpoint non trovato"));
}

export function errorHandler(err, _req, res, _next) {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({ error: err.message, details: err.details });
  }

  if (err?.code === "23505") {
    return res.status(409).json({ error: "Valore già esistente" });
  }

  if (err?.code === "23P01") {
    return res.status(409).json({ error: "Slot non più disponibile" });
  }

  console.error(err);
  res.status(500).json({ error: "Errore interno del server" });
}
