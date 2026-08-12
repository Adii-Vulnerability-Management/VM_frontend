/*
Backup (old implementation kept for reference)
-----------------------------------------------
import axios from "axios";
import Cookies from "js-cookie";
import { resolveTenantId } from "../utils/tenant";

const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL || "";
const refreshPath = "/${initURL}/apiv1/token/refresh";
const DEFAULT_TENANT_ID = "acme-tenant"; // hardcoded tenant id

// Always send cookies for cross-site auth
axios.defaults.withCredentials = true;

const CustomAxios = axios.create({
  baseURL,
  withCredentials: true,
});

CustomAxios.interceptors.request.use(
  (config) => {
    if (typeof config.url === "string" && config.url.startsWith("/api/")) {
      config.baseURL = "";
    }
    const accessToken =
      sessionStorage.getItem("access_token") ||
      Cookies.get("access_token") ||
      Cookies.get("access");
    const refreshToken =
      sessionStorage.getItem("refresh_token") || Cookies.get("refresh_token");
    if (accessToken) config.headers.Authorization = `Bearer ${accessToken}`;
    if (refreshToken) config.headers["x-refresh-token"] = refreshToken;
    const tenantId = resolveTenantId();
    if (tenantId && !config.headers["x-tenant-id"]) {
      config.headers["x-tenant-id"] = tenantId;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Refresh helper
async function refreshAccessToken(refreshToken) {
  const refreshUrl = `${baseURL}${refreshPath}`;
  const response = await axios.get(refreshUrl, {
    headers: {
      "x-refresh-token": refreshToken,
    },
    withCredentials: true,
  });

  const { access_token } = response.data || {};
  if (access_token) {
    sessionStorage.setItem("access_token", access_token);
    Cookies.set("access", access_token, { expires: 1 });
    Cookies.set("access_token", access_token, { expires: 1 });
  }

  return access_token;
}

// Response interceptor with auto refresh
CustomAxios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response &&
      error.response.status === 401 &&
      !originalRequest?._retry
    ) {
      const refreshToken =
        sessionStorage.getItem("refresh_token") || Cookies.get("refresh_token");

      if (refreshToken) {
        try {
          originalRequest._retry = true;
          const newAccessToken = await refreshAccessToken(refreshToken);
          if (newAccessToken) {
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          }
          return CustomAxios(originalRequest);
        } catch (refreshError) {
          sessionStorage.clear();
          Cookies.remove("access");
          Cookies.remove("access_token");
          Cookies.remove("refresh");
          Cookies.remove("refresh_token");
          window.location.href = "/login";
          return Promise.reject(refreshError);
        }
      }
    }

    return Promise.reject(error);
  },
);

export default CustomAxios;
*/

import axios from "axios";
import Cookies from "js-cookie";
import { resolveTenantId } from "../utils/tenant";
import {
  clearUserData,
  installUserDataCookieBridge,
} from "../utils/userDataStorage";

if (typeof window !== "undefined") {
  installUserDataCookieBridge();
}

const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL || "";
const refreshPath = "/priv/apiv1/token/refresh";

function isBrowser() {
  return typeof window !== "undefined";
}

function getAccessToken() {
  if (!isBrowser()) return Cookies.get("access_token") || Cookies.get("access");
  return (
    window.sessionStorage.getItem("access_token") ||
    Cookies.get("access_token") ||
    Cookies.get("access")
  );
}

function getRefreshToken() {
  if (!isBrowser())
    return Cookies.get("refresh_token") || Cookies.get("refresh");
  return (
    window.sessionStorage.getItem("refresh_token") ||
    Cookies.get("refresh_token") ||
    Cookies.get("refresh")
  );
}

async function refreshAccessToken(refreshToken) {
  const refreshUrl = `${baseURL}${refreshPath}`;
  const response = await axios.get(refreshUrl, {
    headers: { "x-refresh-token": refreshToken },
    withCredentials: true,
  });
  const { access_token } = response.data || {};
  if (access_token && isBrowser()) {
    window.sessionStorage.setItem("access_token", access_token);
    Cookies.set("access", access_token, { expires: 1 });
    Cookies.set("access_token", access_token, { expires: 1 });
  }
  return access_token;
}

function setupInterceptorsOnce() {
  if (axios.__GRC_CUSTOM_AXIOS_SETUP__) return;
  axios.__GRC_CUSTOM_AXIOS_SETUP__ = true;
  axios.defaults.withCredentials = true;
  axios.defaults.baseURL = baseURL;

  axios.interceptors.request.use(
    (config) => {
      if (typeof config.url === "string" && config.url.startsWith("/api/")) {
        config.baseURL = "";
      }
      const accessToken = getAccessToken();
      const refreshToken = getRefreshToken();
      const tenantId = resolveTenantId();
      config.headers = config.headers || {};
      if (accessToken) config.headers.Authorization = `Bearer ${accessToken}`;
      if (refreshToken) config.headers["x-refresh-token"] = refreshToken;
      if (tenantId) config.headers["x-tenant-id"] = tenantId;
      return config;
    },
    (error) => Promise.reject(error),
  );

  axios.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error?.config;
      if (
        error?.response?.status === 401 &&
        originalRequest &&
        !originalRequest._retry
      ) {
        const refreshToken = getRefreshToken();
        if (refreshToken) {
          try {
            originalRequest._retry = true;
            const newAccessToken = await refreshAccessToken(refreshToken);
            if (newAccessToken) {
              originalRequest.headers = originalRequest.headers || {};
              originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
            }
            return axios(originalRequest);
          } catch (refreshError) {
            if (isBrowser()) {
              window.sessionStorage.clear();
              Cookies.remove("access");
              Cookies.remove("access_token");
              Cookies.remove("refresh");
              Cookies.remove("refresh_token");
              clearUserData();
              window.location.href = "/login";
            }
            return Promise.reject(refreshError);
          }
        }
      }
      return Promise.reject(error);
    },
  );
}

setupInterceptorsOnce();
const CustomAxios = axios;
export default CustomAxios;
