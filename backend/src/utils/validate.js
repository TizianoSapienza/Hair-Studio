import { badRequest } from "./AppError.js";

export function validateBody(schema) {
  return (req, _res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      return next(badRequest("Dati non validi", result.error.flatten()));
    }
    req.body = result.data;
    next();
  };
}

export function validateQuery(schema) {
  return (req, _res, next) => {
    const result = schema.safeParse(req.query);
    if (!result.success) {
      return next(badRequest("Parametri non validi", result.error.flatten()));
    }
    req.query = result.data;
    next();
  };
}
