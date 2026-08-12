/*
Backup (old implementation kept for reference)
-----------------------------------------------
import axios from "axios";
import { baseurl, initURL } from "./config";

// Always send cookies for cross-site auth
axios.defaults.withCredentials = true;

// Create an Axios instance
const CustomAxios = axios.create({
  baseURL: baseurl, // Use configured API base URL
  withCredentials: true,
  // timeout: 5000, // Optional timeout
});

// Request interceptor to include tokens in headers
CustomAxios.interceptors.request.use(
  (config) => {
    if (typeof config.url === "string" && config.url.startsWith("/api/")) {
      config.baseURL = "";
    }

    const accessToken = sessionStorage.getItem("access_token");
    const refreshToken = sessionStorage.getItem("refresh_token");

    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }

    if (refreshToken) {
      config.headers["x-refresh-token"] = refreshToken;
    }

    const tid = resolveTenantId();
    if (tid && !config.headers["x-tenant-id"]) {
      config.headers["x-tenant-id"] = tid;
    }

    return config;
  },
  (error) => Promise.reject(error),
);

// Function to refresh the access token
async function refreshAccessToken(refreshToken) {
  try {
    const response = await axios.get(
      `${baseurl}/${initURL}/apiv1/token/refresh`,
      {
        headers: {
          "x-refresh-token": refreshToken,
        },
      },
    );
    const { access_token } = response.data;

    // Save the new access token in sessionStorage
    sessionStorage.setItem("access_token", access_token);

    return access_token;
  } catch (error) {
    console.error("Token refresh failed:", error);
    throw error;
  }
}

// Response interceptor to handle token expiry
CustomAxios.interceptors.response.use(
  async (response) => response, // Pass through successful responses
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response &&
      error.response.status === 401 &&
      !originalRequest._retry
    ) {
      const refreshToken = sessionStorage.getItem("refresh_token");
      if (refreshToken) {
        try {
          originalRequest._retry = true; // Mark the request as retried
          const newAccessToken = await refreshAccessToken(refreshToken);

          // Update the original request with the new token
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return CustomAxios(originalRequest); // Retry the original request
        } catch (refreshError) {
          console.error("Refresh token error:", refreshError);
          sessionStorage.clear();
          window.location.href = "/"; // Redirect to login on refresh failure
        }
      }
    }

    return Promise.reject(error);
  },
);
export default CustomAxios;
*/

import CustomAxios from "../globalcomponents/CustomAxios";

export default CustomAxios;
