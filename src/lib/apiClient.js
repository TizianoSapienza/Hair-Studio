const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000/api";

export class ApiError extends Error {
  constructor(status, message, details) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

//Richieste concorrenti che ricevono 401 nello stesso istante devono condividere un solo
//refresh: il backend ruota il refresh token ad ogni uso, quindi refresh paralleli farebbero
//fallire tutte le richieste tranne la prima (reuse detection).
let refreshPromise = null;
function refreshAccessToken() {
  if (!refreshPromise) {
    refreshPromise = fetch(`${API_BASE_URL}/auth/refresh`, { method: "POST", credentials: "include" })
      .then((res) => res.ok)
      .finally(() => { refreshPromise = null; });
  }
  return refreshPromise;
}

async function request(path, { method = "GET", body, allowRefresh = true } = {}) {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method,
    credentials: "include",
    headers: body !== undefined ? { "Content-Type": "application/json" } : undefined,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  //Access token scaduto: si tenta un refresh silenzioso e si ripete la richiesta una sola volta.
  if (res.status === 401 && allowRefresh && path !== "/auth/refresh" && path !== "/auth/login") {
    const refreshed = await refreshAccessToken();
    if (refreshed) {
      return request(path, { method, body, allowRefresh: false });
    }
  }

  if (res.status === 204) return null;

  let data = null;
  const text = await res.text();
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = null;
    }
  }

  if (!res.ok) {
    throw new ApiError(res.status, data?.error || res.statusText, data?.details);
  }

  return data;
}

function toQueryString(params) {
  if (!params) return "";
  const entries = Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== "");
  if (entries.length === 0) return "";
  return `?${new URLSearchParams(entries).toString()}`;
}

export const api = {
  get: (path, params) => request(`${path}${toQueryString(params)}`),
  post: (path, body) => request(path, { method: "POST", body }),
  patch: (path, body) => request(path, { method: "PATCH", body }),
  delete: (path) => request(path, { method: "DELETE" }),
};

export { API_BASE_URL };
