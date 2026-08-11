export class AppError extends Error {
  constructor(statusCode, message, details) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
  }
}

export const badRequest = (message, details) => new AppError(400, message, details);
export const unauthorized = (message = "Non autenticato") => new AppError(401, message);
export const forbidden = (message = "Non autorizzato", details) => new AppError(403, message, details);
export const notFound = (message = "Risorsa non trovata") => new AppError(404, message);
export const conflict = (message) => new AppError(409, message);
export const tooManyRequests = (message = "Troppi tentativi, riprova più tardi") => new AppError(429, message);
