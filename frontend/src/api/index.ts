import { apiGet, apiPost, apiPut, apiPatch, apiDelete, api } from "@/lib/api";

export * from "./auth";

// Generic thin wrappers per backend resource. Extend as pages need them.

export const patientsApi = {
  list: async () => {
    const res = await apiGet<any>("/patients");
    if (Array.isArray(res)) return res as any[];
    if (res && Array.isArray((res as any).data)) return (res as any).data as any[];
    return [] as any[];
  },
  get: (id: string) => apiGet<any>(`/patients/${id}`),
  create: (data: unknown) => apiPost<any>("/patients", data),
  update: (id: string, data: unknown) => apiPut<any>(`/patients/${id}`, data),
  remove: (id: string) => apiDelete<any>(`/patients/${id}`),
};

export const caregiversApi = {
  list: async (params?: Record<string, unknown>) => {
    const res = await apiGet<any>("/caregivers", params);
    // Backend may return paginated { data: [...] } or a plain array
    if (Array.isArray(res)) return res as any[];
    if (res && Array.isArray((res as any).data)) return (res as any).data as any[];
    return [] as any[];
  },
  get: (id: string) => apiGet<any>(`/caregivers/${id}`),
  recommend: (patientId: string) => apiGet<any[]>(`/caregivers/recommend/${patientId}`),
  createProfile: (data: unknown) => apiPost<any>("/caregivers", data),
  update: (id: string, data: unknown) => apiPut<any>(`/caregivers/${id}`, data),
};

export const servicesApi = {
  list: async () => {
    const res = await apiGet<any>("/services");
    if (Array.isArray(res)) return res as any[];
    if (res && Array.isArray((res as any).data)) return (res as any).data as any[];
    return [] as any[];
  },
  get: (id: string) => apiGet<any>(`/services/${id}`),
};

export const bookingsApi = {
  list: async () => {
    const res = await apiGet<any>("/bookings");
    if (Array.isArray(res)) return res as any[];
    if (res && Array.isArray((res as any).data)) return (res as any).data as any[];
    return [] as any[];
  },
  get: (id: string) => apiGet<any>(`/bookings/${id}`),
  create: (data: unknown) => apiPost<any>("/bookings", data),
  updateStatus: (data: unknown) => apiPatch<any>("/bookings/status", data),
};

export const careNotesApi = {
  list: (params?: Record<string, unknown>) => apiGet<any[]>("/care-notes", params),
  get: (id: string) => apiGet<any>(`/care-notes/${id}`),
  create: (data: unknown) => apiPost<any>("/care-notes", data),
  update: (id: string, data: unknown) => apiPut<any>(`/care-notes/${id}`, data),
};

export const medicationsApi = {
  list: async (params?: Record<string, unknown>) => {
    const res = await apiGet<any>("/medications", params);
    if (Array.isArray(res)) return res as any[];
    if (res && Array.isArray((res as any).data)) return (res as any).data as any[];
    return [] as any[];
  },
  add: (data: unknown) => apiPost<any>("/medications", data),
  update: (id: string, data: unknown) => apiPut<any>(`/medications/${id}`, data),
  remove: (id: string) => apiDelete<any>(`/medications/${id}`),
};

export const notificationsApi = {
  list: () => apiGet<any[]>("/notifications"),
  markAsRead: (ids?: string[]) => apiPatch<any>("/notifications/read", { ids }),
  remove: (id: string) => apiDelete<any>(`/notifications/${id}`),
};

export const documentsApi = {
  list: (params?: Record<string, unknown>) => apiGet<any[]>("/documents", params),
  upload: (formData: FormData) =>
    api
      .post("/documents", formData, { headers: { "Content-Type": "multipart/form-data" } })
      .then((r) => r.data?.data ?? r.data),
  remove: (id: string) => apiDelete<any>(`/documents/${id}`),
};

export const reviewsApi = {
  forCaregiver: (caregiverId: string) => apiGet<any[]>(`/reviews/caregiver/${caregiverId}`),
  create: (data: unknown) => apiPost<any>("/reviews", data),
};

export const sosApi = {
  list: () => apiGet<any[]>("/sos"),
  trigger: (data: unknown) => apiPost<any>("/sos", data),
  resolve: (id: string) => apiPatch<any>(`/sos/${id}/resolve`),
};

export const complaintsApi = {
  list: () => apiGet<any[]>("/complaints"),
  create: (data: unknown) => apiPost<any>("/complaints", data),
  update: (id: string, data: unknown) => apiPut<any>(`/complaints/${id}`, data),
};

export const adminApi = {
  dashboard: () => apiGet<any>("/admin/dashboard"),
  reports: () => apiGet<any>("/admin/reports"),
  healthRisk: (params?: Record<string, unknown>) => apiGet<any>("/admin/health-risk", params),
  setUserStatus: (id: string, data: unknown) => apiPatch<any>(`/admin/users/${id}/status`, data),
  verifyCaregiver: (id: string) => apiPatch<any>(`/admin/caregivers/${id}/verify`),
};

export const usersApi = {
  getProfile: () => apiGet<any>("/users/profile"),
  updateProfile: (formData: FormData) =>
    api
      .put("/users/profile", formData, { headers: { "Content-Type": "multipart/form-data" } })
      .then((r) => r.data?.data ?? r.data),
};
