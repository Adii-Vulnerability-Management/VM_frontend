// Client-side auth helpers
// Keep this minimal and dependency-free for the browser bundle.

const readCookie = (name) => {
  if (typeof document === "undefined") return "";
  try {
    const parts = String(document.cookie || "")
      .split(";")
      .map((p) => p.trim());
    for (const part of parts) {
      if (!part) continue;
      const eq = part.indexOf("=");
      if (eq === -1) continue;
      const key = part.slice(0, eq).trim();
      if (key === name) {
        return decodeURIComponent(part.slice(eq + 1));
      }
    }
  } catch (_) {}
  return "";
};

export const getClientAuthToken = () => {
  if (typeof window === "undefined") return "";

  try {
    const local =
      window.localStorage.getItem("token") ||
      window.localStorage.getItem("authToken") ||
      window.localStorage.getItem("access_token") ||
      window.localStorage.getItem("access") ||
      window.sessionStorage.getItem("access_token") ||
      window.sessionStorage.getItem("access");
    if (local) return local;
  } catch (_) {}

  const cookie =
    readCookie("authToken") ||
    readCookie("AUTH_COOKIE") ||
    readCookie("access_token") ||
    readCookie("access") ||
    readCookie("token");

  return cookie || "";
};
