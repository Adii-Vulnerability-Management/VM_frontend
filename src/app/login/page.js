"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { Button, ErrorBanner, Input, Label } from "@/components/ui";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!email.trim() || !password) {
      setError("Enter your email and password.");
      return;
    }
    setLoading(true);
    const result = await login(email.trim(), password);
    setLoading(false);
    if (result.ok) {
      router.replace("/dashboard");
    } else {
      setError(result.error);
    }
  };

  return (
    <div className="flex min-h-screen w-full bg-slate-50">
      <div className="hidden lg:flex lg:w-1/2 relative flex-col justify-between overflow-hidden bg-gradient-to-br from-ink-950 via-ink-900 to-brand-700 p-12">
        <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-brand-500/20 blur-3xl" />
        <div className="absolute bottom-0 -left-16 h-72 w-72 rounded-full bg-cyan-400/10 blur-3xl" />

        <div className="relative z-10 flex items-center gap-2 text-white">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-brand-400 to-cyan-400">
            <ShieldCheck size={18} className="text-white" />
          </div>
          <span className="font-semibold tracking-wide">VM Console</span>
        </div>

        <div className="relative z-10 max-w-md">
          <h1 className="mb-4 text-4xl font-bold leading-tight text-white">
            Vulnerability Management
          </h1>
          <p className="text-base leading-relaxed text-slate-300">
            Register scan targets, run scanners, triage findings, and track
            remediation — all in one place.
          </p>
        </div>

        <p className="relative z-10 text-xs text-slate-400">
          © {new Date().getFullYear()} VM Console.
        </p>
      </div>

      <div className="flex flex-1 items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          <div className="mb-8 flex items-center justify-center gap-2 lg:hidden">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-brand-500 to-cyan-400">
              <ShieldCheck size={18} className="text-white" />
            </div>
            <span className="font-semibold tracking-wide text-slate-900">VM Console</span>
          </div>

          <h2 className="mb-1 text-2xl font-semibold text-slate-900">Welcome back</h2>
          <p className="mb-8 text-sm text-slate-500">Sign in to your Vulnerability Management dashboard.</p>

          <ErrorBanner message={error} />

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div>
              <Label>Email</Label>
              <Input className="w-full"
                type="email"
                autoComplete="username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
              />
            </div>

            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <Label>Password</Label>
              </div>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pr-16"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-slate-500 hover:text-slate-700"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            <Button type="submit" disabled={loading} className="mt-2 w-full">
              {loading ? "Signing in…" : "Sign in"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
