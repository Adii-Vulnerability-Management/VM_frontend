"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api, { storeSession, clearSession, getStoredUser, apiErrorMessage } from "./api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setUser(getStoredUser());
    setReady(true);
  }, []);

  const login = useCallback(async (email, password) => {
    try {
      const res = await api.post("/apiv1/login", { email, password });
      const { access_token, refresh_token, user_data } = res.data || {};
      storeSession({ access_token, refresh_token, user_data });
      setUser(user_data || null);
      return { ok: true };
    } catch (err) {
      const status = err?.response?.status;
      let message = apiErrorMessage(err, "Unable to sign in.");
      if (status === 404) message = "No account found with that email.";
      else if (status === 400) message = message || "Incorrect email or password.";
      return { ok: false, error: message };
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.get("/apiv1/logout");
    } catch {
      // ignore network errors on logout, clear client state regardless
    }
    clearSession();
    setUser(null);
    router.replace("/login");
  }, [router]);

  return (
    <AuthContext.Provider value={{ user, ready, login, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
