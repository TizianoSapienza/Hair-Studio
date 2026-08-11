import { api } from "@/lib/apiClient";

export const uploadsApi = {
  presign: (data) => api.post("/admin/uploads/presign", data),
  list: (folder) => api.get("/admin/uploads", { folder }),
};
