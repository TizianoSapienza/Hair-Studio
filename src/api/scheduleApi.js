import { api } from "@/lib/apiClient";

export const scheduleApi = {
  openingHours: () => api.get("/opening-hours"),
  closures: (params) => api.get("/closures", params),
  publicCalendar: (params) => api.get("/public/calendar", params),

  adminUpdateOpeningHours: (data) => api.patch("/admin/opening-hours", data),
  adminClosures: () => api.get("/admin/closures"),
  adminCreateClosure: (data) => api.post("/admin/closures", data),
  adminUpdateClosure: (id, data) => api.patch(`/admin/closures/${id}`, data),
  adminDeleteClosure: (id) => api.delete(`/admin/closures/${id}`),
};
