"use client";

import axios from "axios";
import Cookies from "js-cookie";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000";
const API_PREFIX = process.env.NEXT_PUBLIC_API_PREFIX || "priv";

export const apiRoot = `${API_BASE.replace(/\/+$/, "")}/${API_PREFIX}`;

const api = axios.create({
  baseURL: apiRoot,
  withCredentials: true,
});

function getAccessToken() {
  if (typeof window === "undefined") return null;
  return (
    window.sessionStorage.getItem("access_token") ||
    Cookies.get("access_token") ||
    null
  );
}

function getRefreshToken() {
  if (typeof window === "undefined") return null;
  return (
    window.sessionStorage.getItem("refresh_token") ||
    Cookies.get("refresh_token") ||
    null
  );
}

export function storeSession({ access_token, refresh_token, user_data }) {
  if (typeof window === "undefined") return;
  if (access_token) {
    window.sessionStorage.setItem("access_token", access_token);
    Cookies.set("access_token", access_token, { expires: 1, sameSite: "Lax" });
  }
  if (refresh_token) {
    window.sessionStorage.setItem("refresh_token", refresh_token);
    Cookies.set("refresh_token", refresh_token, { expires: 7, sameSite: "Lax" });
  }
  if (user_data) {
    window.sessionStorage.setItem("user_data", JSON.stringify(user_data));
  }
}

export function clearSession() {
  if (typeof window === "undefined") return;
  window.sessionStorage.removeItem("access_token");
  window.sessionStorage.removeItem("refresh_token");
  window.sessionStorage.removeItem("user_data");
  Cookies.remove("access_token");
  Cookies.remove("refresh_token");
}

export function getStoredUser() {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem("user_data");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

api.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let refreshPromise = null;

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      try {
        if (!refreshPromise) {
          refreshPromise = axios
            .get(`${apiRoot}/apiv1/token/refresh`, {
              withCredentials: true,
              headers: getRefreshToken()
                ? { Authorization: `Bearer ${getRefreshToken()}` }
                : {},
            })
            .finally(() => {
              refreshPromise = null;
            });
        }
        const refreshRes = await refreshPromise;
        const newAccess =
          refreshRes.data?.access_token || refreshRes.data?.access;
        if (newAccess) {
          window.sessionStorage.setItem("access_token", newAccess);
          Cookies.set("access_token", newAccess, { expires: 1, sameSite: "Lax" });
          original.headers.Authorization = `Bearer ${newAccess}`;
          return api(original);
        }
      } catch {
        clearSession();
        if (typeof window !== "undefined") {
          window.location.href = "/login";
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;

export function apiErrorMessage(err, fallback = "Something went wrong.") {
  const body = err?.response?.data;
  if (typeof body === "string") return body;
  if (Array.isArray(body?.message)) return body.message.join(", ");
  return body?.message || body?.detail || fallback;
}
