import { api } from "@/lib/apiClient";

export const servicesApi = {
  listPublic: () => api.get("/services"),
  adminList: () => api.get("/admin/services"),
  adminCreate: (data) => api.post("/admin/services", data),
  adminUpdate: (id, data) => api.patch(`/admin/services/${id}`, data),
  adminReorder: (orderedIds) => api.patch("/admin/services/reorder", { orderedIds }),
  adminDelete: (id) => api.delete(`/admin/services/${id}`),
  adminPriceHistory: (id) => api.get(`/admin/services/${id}/price-history`),
};

export const staffApi = {
  listPublic: () => api.get("/staff"),
  adminList: () => api.get("/admin/staff"),
  adminUpdate: (id, data) => api.patch(`/admin/staff/${id}`, data),
  adminReorder: (orderedIds) => api.patch("/admin/staff/reorder", { orderedIds }),
};
