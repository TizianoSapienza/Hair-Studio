import { api } from "@/lib/apiClient";

export const notificationsApi = {
  list: (params) => api.get("/notifications", params),
  markRead: (id) => api.patch(`/notifications/${id}/read`),
  markAllRead: () => api.patch("/notifications/read-all"),
};

export const pushTokensApi = {
  register: (data) => api.post("/push-tokens", data),
  remove: (token) => api.delete(`/push-tokens/${encodeURIComponent(token)}`),
};
