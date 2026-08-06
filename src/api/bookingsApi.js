import { api } from "@/lib/apiClient";

export const bookingsApi = {
  create: (data) => api.post("/bookings", data),
  listMine: () => api.get("/bookings/me"),
  cancelMine: (id) => api.post(`/bookings/${id}/cancel`),

  adminCalendar: (params) => api.get("/admin/calendar", params),
  adminList: (params) => api.get("/admin/bookings", params),
  adminGet: (id) => api.get(`/admin/bookings/${id}`),
  adminConfirm: (id) => api.post(`/admin/bookings/${id}/confirm`),
  adminComplete: (id) => api.post(`/admin/bookings/${id}/complete`),
  adminNoShow: (id) => api.post(`/admin/bookings/${id}/no-show`),
  adminCancel: (id) => api.post(`/admin/bookings/${id}/cancel`),
  adminStats: (params) => api.get("/admin/stats", params),
};

export const blockedSlotsApi = {
  adminList: (params) => api.get("/admin/blocked-slots", params),
  adminCreate: (data) => api.post("/admin/blocked-slots", data),
  adminCreateBulk: (data) => api.post("/admin/blocked-slots/bulk", data),
  adminDelete: (id) => api.delete(`/admin/blocked-slots/${id}`),
};
