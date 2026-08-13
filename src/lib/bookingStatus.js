export const CANCELLABLE_BOOKING_STATUSES = ["in_attesa", "confermata"];

export function isCancellableBooking(status) {
  return CANCELLABLE_BOOKING_STATUSES.includes(status);
}
