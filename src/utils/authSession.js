import Cookies from "js-cookie";

const AUTH_COOKIE_KEYS = [
  "user_data",
  "access",
  "access_token",
  "refresh",
  "refresh_token",
  "sessionid",
  "permissions",
  "roles",
];

const AUTH_SESSION_STORAGE_KEYS = [
  "access_token",
  "refresh_token",
  "sessionid",
];

export function clearSharedAuthSession() {
  AUTH_COOKIE_KEYS.forEach((key) => Cookies.remove(key));

  if (typeof window === "undefined") {
    return;
  }

  AUTH_SESSION_STORAGE_KEYS.forEach((key) => sessionStorage.removeItem(key));
}
