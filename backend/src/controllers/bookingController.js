import { asyncHandler } from "../utils/asyncHandler.js";
import { findUserById } from "../services/userService.js";
import * as bookingService from "../services/bookingService.js";
import { getDayOverview } from "../services/scheduleService.js";
import { notFound, unauthorized } from "../utils/AppError.js";

export const createBooking = asyncHandler(async (req, res) => {
  const user = await findUserById(req.user.id);
  if (!user) throw unauthorized();

  const booking = await bookingService.createBooking({ user, ...req.body });
  res.status(201).json({ booking });
});

export const listMyBookings = asyncHandler(async (req, res) => {
  res.json({ bookings: await bookingService.listUserBookings(req.user.id) });
});

export const cancelMyBooking = asyncHandler(async (req, res) => {
  const booking = await bookingService.cancelUserBooking(req.user.id, req.params.id);
  res.json({ booking });
});

// --- Admin ---

export const getAdminCalendar = asyncHandler(async (req, res) => {
  const { date, staff_id: staffId, duration_minutes: durationMinutes } = req.query;
  const calendar = await getDayOverview(date, staffId, { includeDetails: true, durationMinutes });
  res.json(calendar);
});

export const adminListBookings = asyncHandler(async (req, res) => {
  const { date, from, to, staff_id: staffId, status, q } = req.query;
  res.json({ bookings: await bookingService.adminListBookings({ date, from, to, staffId, status, q }) });
});

export const adminGetBooking = asyncHandler(async (req, res) => {
  const booking = await bookingService.adminGetBooking(req.params.id);
  if (!booking) throw notFound("Prenotazione non trovata");
  res.json({ booking });
});

export const adminConfirmBooking = asyncHandler(async (req, res) => {
  res.json({ booking: await bookingService.confirmBooking(req.params.id) });
});

export const adminCompleteBooking = asyncHandler(async (req, res) => {
  res.json({ booking: await bookingService.completeBooking(req.params.id) });
});

export const adminNoShowBooking = asyncHandler(async (req, res) => {
  res.json({ booking: await bookingService.markBookingNoShow(req.params.id) });
});

export const adminCancelBooking = asyncHandler(async (req, res) => {
  res.json({ booking: await bookingService.cancelBookingAdmin(req.params.id) });
});

export const adminStats = asyncHandler(async (req, res) => {
  const { from, to } = req.query;
  res.json(await bookingService.getAdminStats(from, to));
});
