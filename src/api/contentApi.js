import { api } from "@/lib/apiClient";

export const siteDataApi = {
  get: () => api.get("/public/site-data"),
};

export const businessInfoApi = {
  adminGet: () => api.get("/admin/business-info"),
  adminUpdate: (data) => api.patch("/admin/business-info", data),
};

export const homepageContentApi = {
  adminGet: () => api.get("/admin/homepage-content"),
  adminUpdate: (data) => api.patch("/admin/homepage-content", data),
};

export const clientsApi = {
  adminList: () => api.get("/admin/clients"),
};
