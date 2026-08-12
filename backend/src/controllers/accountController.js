import { pool } from "../db/pool.js";
import { deleteUser, findUserByEmail, toPublicUser, updateUserProfile } from "../services/userService.js";
import { clearAuthCookies } from "../services/tokenService.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { conflict, forbidden } from "../utils/AppError.js";

export const updateProfile = asyncHandler(async (req, res) => {
  const { firstName, lastName, email, phone } = req.body;

  const existing = await findUserByEmail(email);
  if (existing && existing.id !== req.user.id) {
    throw conflict("Un account con questa email esiste già");
  }

  const user = await updateUserProfile(req.user.id, { firstName, lastName, email, phone });

  //Le prenotazioni mantengono uno snapshot di nome/email/telefono: si aggiornano insieme al
  //profilo, ma solo per le prenotazioni ancora attive — quelle concluse (completata,
  //cancellata, no_show) restano uno storico immutato con i dati validi al momento del fatto.
  await pool.query(
    `UPDATE bookings
     SET client_name = $2, client_email = $3, client_phone = $4
     WHERE user_id = $1 AND status IN ('in_attesa', 'confermata')`,
    [req.user.id, `${firstName} ${lastName}`, email, phone]
  );

  res.json({ user: toPublicUser(user) });
});

export const deleteAccount = asyncHandler(async (req, res) => {
  if (req.user.role === "admin") {
    throw forbidden("L'account amministratore non può essere eliminato da qui");
  }
  //Le prenotazioni collegate restano (user_id -> NULL via FK ON DELETE SET NULL),
  //così da non perdere lo storico/statistiche admin, come deciso in fase di design.
  await deleteUser(req.user.id);
  clearAuthCookies(res);
  res.status(204).end();
});
