import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import CustomAxios from "@/config/CustomAxios";
import { baseurl, initURL } from "@/config/config";
import CookieConsentDashboardV2 from "@/components/privacy/cookie-consent/CookieConsentDashboardV2";
import {
  FiRefreshCw,
  FiTrendingUp,
  FiGlobe,
  FiUsers,
  FiClock,
  FiCheckCircle,
  FiXCircle,
} from "react-icons/fi";

const USE_COOKIE_CONSENT_DASHBOARD_V2 = true;

/* ---------------- helpers ---------------- */
function safeArr(x) {
  return Array.isArray(x) ? x : [];
}

function formatDateTime(ts) {
  try {
    return new Date(ts).toLocaleString();
  } catch {
    return "-";
  }
}

function getEnabledKeys(choices) {
  if (!choices || typeof choices !== "object") return [];
  return Object.entries(choices)
    .filter(([, v]) => !!v)
    .map(([k]) => k);
}

function pct(part, total) {
  if (!total) return 0;
  return Math.round((part / total) * 100);
}

/* ---------- Elegant ProgressBar (brand + soft) ---------- */
/* ---------- Elegant ProgressBar (category color-coded) ---------- */
function getBarTheme(label = "") {
  const key = String(label).toLowerCase().trim();

  // IMPORTANT: keep classes static (Tailwind friendly)
  if (key.includes("essential"))
    return {
      track: "bg-indigo-50 border-indigo-100",
      fill: "bg-indigo-600",
      dot: "bg-indigo-600",
      label: "text-indigo-800",
    };

  if (key.includes("functional"))
    return {
      track: "bg-blue-50 border-blue-100",
      fill: "bg-blue-600",
      dot: "bg-blue-600",
      label: "text-blue-800",
    };

  if (key.includes("analytics"))
    return {
      track: "bg-cyan-50 border-cyan-100",
      fill: "bg-cyan-600",
      dot: "bg-cyan-600",
      label: "text-cyan-800",
    };

  if (key.includes("marketing"))
    return {
      track: "bg-rose-50 border-rose-100",
      fill: "bg-rose-600",
      dot: "bg-rose-600",
      label: "text-rose-800",
    };

  if (key.includes("advertising"))
    return {
      track: "bg-orange-50 border-orange-100",
      fill: "bg-orange-600",
      dot: "bg-orange-600",
      label: "text-orange-800",
    };

  if (key.includes("social"))
    return {
      track: "bg-violet-50 border-violet-100",
      fill: "bg-violet-600",
      dot: "bg-violet-600",
      label: "text-violet-800",
    };

  // Uncategorized / Other / fallback
  return {
    track: "bg-slate-50 border-slate-200",
    fill: "bg-slate-600",
    dot: "bg-slate-600",
    label: "text-slate-800",
  };
}

function ProgressBar({ label, value, total }) {
  const percent = pct(value, total);
  const t = getBarTheme(label);

  return (
    <div className="space-y-2 rounded-xl border border-gray-100 bg-white p-3 hover:shadow-sm transition">
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <span className={`h-2.5 w-2.5 rounded-full ${t.dot}`} />
          <span className={`font-semibold ${t.label}`}>{label}</span>
        </div>

        <span className="text-gray-600">
          {value}/{total} ({percent}%)
        </span>
      </div>

      <div
        className={`h-2.5 w-full rounded-full border overflow-hidden ${t.track}`}
      >
        <div
          className={`h-2.5 ${t.fill} rounded-full transition-all duration-500`}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}

/* ---------------- Card Components ---------------- */

function StatCardPrimary({
  title,
  value,
  sub,
  icon,
  accent,
  backgroundColour,
}) {
  return (
    <div
      className={`group relative overflow-hidden rounded-3xl border border-slate-200 ${backgroundColour} shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl`}
    >
      {/* Background Glow */}
      <div
        className={`absolute -right-10 -top-10 h-36 w-36 rounded-full blur-3xl opacity-20 transition-opacity duration-300 group-hover:opacity-35 ${accent}`}
      />

      {/* Decorative Grid */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,.6),transparent_40%)]" />

      <div className="relative p-6">
        <div className="flex items-start justify-between">
          <div>
            <span className="text-sm font-semibold tracking-wide uppercase text-slate-500">
              {title}
            </span>

            <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
              {value}
            </h2>

            {sub && (
              <p className="mt-2 text-sm leading-relaxed text-slate-500">
                {sub}
              </p>
            )}
          </div>

          <div
            className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br text-white shadow-lg ${accent}`}
          >
            {icon}
          </div>
        </div>

        {/* Bottom Accent */}
        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-100">
          <div
            className={`h-full rounded-full bg-gradient-to-r ${accent}`}
            // style={{ width: "70%" }}
          />
        </div>
      </div>
    </div>
  );
}

function StatCardSecondary({ title, value, sub, icon, tone }) {
  // tone = { bg, text, border, chip }
  return (
    <div
      className={[
        "rounded-2xl p-5 shadow-md hover:shadow-xl transition-all duration-300",
        "bg-white",
        tone.border,
      ].join(" ")}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className={["text-sm font-semibold", tone.text].join(" ")}>
            {title}
          </div>
          <div className="mt-1 text-3xl font-bold text-gray-900">{value}</div>
          {sub ? <div className="mt-1 text-xs text-gray-600">{sub}</div> : null}
        </div>

        <div
          className={[
            "rounded-2xl p-3 border",
            tone.bg,
            tone.border,
            tone.text,
          ].join(" ")}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}

/* ---------------- main page -- Cookie Consent Dashboard for Admin use then uncomment this ---------------- */
// export default function CMPDashboard(props) {
//   return USE_COOKIE_CONSENT_DASHBOARD_V2 ? (
//     <CookieConsentDashboardV2 {...props} />
//   ) : (
//     <CMPDashboardLegacy {...props} />
//   );
// }

// function CMPDashboardLegacy({ embedded = false }) {

export default function CMPDashboard({ embedded = false }) {
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const [websites, setWebsites] = useState([]);
  const [domain, setDomain] = useState("");

  const [consents, setConsents] = useState([]);
  const [config, setConfig] = useState([]);

  async function loadWebsites() {
    const res = await CustomAxios.get(`${baseurl}/${initURL}/cmp/websites`);
    const list = safeArr(res.data);
    setWebsites(list);
    if (!domain && list.length) setDomain(list[0]?.domain || "");
  }

  async function loadDomainData(selectedDomain) {
    if (!selectedDomain) return;
    const [cRes, cfgRes] = await Promise.all([
      CustomAxios.get(`${baseurl}/${initURL}/cmp/consents`, {
        params: { domain: selectedDomain },
      }),
      CustomAxios.get(`${baseurl}/${initURL}/cmp/config`, {
        params: { domain: selectedDomain },
      }),
    ]);
    setConsents(safeArr(cRes.data));
    setConfig(safeArr(cfgRes.data));
  }

  async function fetchAll() {
    try {
      setLoading(true);
      setErr("");
      await loadWebsites();
    } catch (e) {
      setErr(
        e?.response?.data?.message || e?.message || "Failed to load websites.",
      );
    } finally {
      setLoading(false);
    }
  }

  async function refreshDomain() {
    try {
      setLoading(true);
      setErr("");
      await loadDomainData(domain);
    } catch (e) {
      setErr(
        e?.response?.data?.message ||
          e?.message ||
          "Failed to load dashboard data.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!domain) return;
    refreshDomain();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [domain]);

  /* ------------ derived dashboard metrics ------------ */
  const totalWebsites = websites.length;
  const totalUsers = consents.length;

  const latestUpdatedAt = useMemo(() => {
    if (!consents.length) return "";
    const sorted = [...consents].sort((a, b) => {
      const ta = new Date(a.updatedAt || 0).getTime();
      const tb = new Date(b.updatedAt || 0).getTime();
      return tb - ta;
    });
    return sorted[0]?.updatedAt || "";
  }, [consents]);

  // Coverage: at least one category enabled
  const coverage = useMemo(() => {
    const covered = consents.filter(
      (c) => getEnabledKeys(c.choices).length > 0,
    ).length;
    return { covered, percent: pct(covered, totalUsers) };
  }, [consents, totalUsers]);

  // Accepted / Rejected split (simple interpretation)
  const acceptedUsers = useMemo(() => {
    return consents.filter((c) => getEnabledKeys(c.choices).length > 0).length;
  }, [consents]);

  const rejectedUsers = useMemo(() => {
    return consents.filter((c) => getEnabledKeys(c.choices).length === 0)
      .length;
  }, [consents]);

  const acceptedPercent = pct(acceptedUsers, totalUsers);
  const rejectedPercent = pct(rejectedUsers, totalUsers);

  const configSummary = useMemo(() => {
    const categories = config.length;
    const vendors = config.reduce(
      (sum, item) => sum + safeArr(item?.vendors).length,
      0,
    );
    return { categories, vendors };
  }, [config]);

  const categoriesForBars = useMemo(() => {
    const keys = config.map((x) => x?.key).filter(Boolean);
    if (!keys.length) {
      const allKeys = new Set();
      for (const c of consents) {
        Object.keys(c?.choices || {}).forEach((k) => allKeys.add(k));
      }
      return Array.from(allKeys);
    }
    return keys;
  }, [config, consents]);

  const categoryStats = useMemo(() => {
    const total = totalUsers || 0;
    return categoriesForBars.map((key) => {
      const enabledCount = consents.filter((c) => !!c?.choices?.[key]).length;
      const label = config.find((x) => x?.key === key)?.name || key;
      return { key, label, enabledCount, total };
    });
  }, [categoriesForBars, consents, totalUsers, config]);

  const recentConsents = useMemo(() => {
    const sorted = [...consents].sort((a, b) => {
      const ta = new Date(a.updatedAt || 0).getTime();
      const tb = new Date(b.updatedAt || 0).getTime();
      return tb - ta;
    });
    return sorted.slice(0, 10);
  }, [consents]);

  const domainParam = useMemo(() => encodeURIComponent(domain || ""), [domain]);

  /* ---------------- color tones ---------------- */
  const secondaryTones = {
    amber: {
      bg: "bg-amber-50",
      text: "text-amber-700",
      border: "border border-amber-200",
    },
    blue: {
      bg: "bg-blue-50",
      text: "text-blue-700",
      border: "border border-blue-200",
    },
    purple: {
      bg: "bg-purple-50",
      text: "text-purple-700",
      border: "border border-purple-200",
    },
  };

  return (
    <div
      className={
        embedded
          ? "bg-white"
          : "min-h-screen bg-gradient-to-b from-gray-50 to-white"
      }
    >
      <div
        className={
          embedded
            ? "bg-white"
            : "mx-5 min-h-screen bg-white rounded-lg p-5 my-3"
        }
      >
        {/* Header */}
        <div
          className={`rounded-2xl shadow-lg hover:shadow-2xl transition-shadow duration-300 ${
            embedded
              ? "p-6 border border-slate-200 bg-gradient-to-br from-white via-slate-50 to-cyan-50"
              : "bg-[#2B245C] px-6 py-8"
          }`}
        >
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1
                className={`font-semibold ${
                  embedded ? "text-2xl text-[#2B245C]" : "text-3xl text-cyan-50"
                }`}
              >
                Cookie Consent Dashboard
              </h1>
              <p
                className={`mt-1 text-sm ${
                  embedded ? "text-slate-600" : "text-white"
                }`}
              >
                High-level CMP metrics + category opt-in analytics per domain.
              </p>
            </div>

            <button
              type="button"
              onClick={refreshDomain}
              className={`inline-flex items-center gap-2 rounded-lg px-6 py-2.5 text-sm font-semibold shadow-md hover:shadow-lg transition-all ${
                embedded
                  ? "bg-[#2B245C] text-white hover:bg-opacity-90"
                  : "bg-white text-[#2B245C] hover:bg-gray-50"
              }`}
            >
              <FiRefreshCw />
              Refresh
            </button>
          </div>

          {/* Domain selector */}
          {/* <div className="mt-5 grid gap-3 md:grid-cols-3">
            <div className="md:col-span-2">
              <label
                className={`block text-xs font-medium mb-1 ${
                  embedded ? "text-slate-700" : "text-white/90"
                }`}
              >
                Select Domain
              </label>
              <select
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                className={`w-full rounded-xl px-3 py-2 outline-none transition ${
                  embedded
                    ? "border border-slate-300 bg-white text-slate-900 focus:ring-2 focus:ring-cyan-500"
                    : "border border-white/20 bg-white/10 text-white"
                }`}
              >
                {websites.map((w) => (
                  <option
                    key={w._id}
                    value={w.domain}
                    className="text-gray-900"
                  >
                    {w.domain}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-end gap-2">
              <Link
                href={`/admin/scanner/cmp?domain=${domainParam}`}
                className={`w-full text-center rounded-xl px-4 py-2 text-sm font-semibold transition ${
                  embedded
                    ? "bg-[#2B245C] text-white hover:bg-opacity-90"
                    : "bg-white text-[#2B245C] hover:bg-gray-50"
                }`}
              >
                Open CMP Admin
              </Link>
            </div>
          </div> */}
        </div>

        {/* Error */}
        {err ? (
          <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {err}
          </div>
        ) : null}

        {/* Body */}
        <div className="py-6 space-y-6">
          {/* Domain selector */}
          <div className="rounded-2xl border border-[#2B245C] bg-white p-6 shadow-lg hover:shadow-2xl transition-shadow duration-300">
            <div className="grid gap-3 md:grid-cols-3">
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold mb-1 text-slate-700">
                  Select Domain
                </label>
                <select
                  value={domain}
                  onChange={(e) => setDomain(e.target.value)}
                  className="w-full rounded-lg px-3 py-2 outline-none transition border border-slate-300 bg-white text-slate-900 focus:ring-2 focus:ring-blue-500"
                >
                  {websites.map((w) => (
                    <option
                      key={w._id}
                      value={w.domain}
                      className="text-gray-900"
                    >
                      {w.domain}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-end gap-2">
                <Link
                  href={`/admin/scanner/cmp?domain=${domainParam}`}
                  className="w-full text-center rounded-lg px-4 py-2 text-sm font-semibold transition bg-[#2B245C] text-white hover:bg-opacity-90"
                >
                  Open CMP Admin
                </Link>
              </div>
            </div>
          </div>

          {/* Loading */}
          {loading ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[...Array(6)].map((_, i) => (
                  <div
                    key={i}
                    className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm animate-pulse"
                  >
                    <div className="h-4 w-28 rounded bg-gray-100" />
                    <div className="mt-3 h-10 w-20 rounded bg-gray-100" />
                    <div className="mt-3 h-3 w-40 rounded bg-gray-100" />
                  </div>
                ))}
              </div>
              <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm animate-pulse">
                <div className="h-4 w-40 rounded bg-gray-100" />
                <div className="mt-4 space-y-3">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-3 w-full rounded bg-gray-100" />
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* KPI Cards */}
              {/* TOP 3: Gradient Primary */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <StatCardPrimary
                  title="Total Consents"
                  value={totalUsers}
                  sub={`For ${domain}`}
                  icon={<FiUsers size={22} />}
                  accent="from-indigo-500 to-violet-400"
                  backgroundColour="bg-gradient-to-br from-indigo-50 to-white"
                />

                <StatCardPrimary
                  title="Accepted"
                  value={`${acceptedPercent}%`}
                  sub={`${acceptedUsers} users accepted`}
                  icon={<FiCheckCircle size={22} />}
                  accent="from-emerald-500 to-green-400"
                  backgroundColour="bg-gradient-to-br from-emerald-50 to-white"
                />

                <StatCardPrimary
                  title="Rejected"
                  value={`${rejectedPercent}%`}
                  sub={`${rejectedUsers} users rejected`}
                  icon={<FiXCircle size={22} />}
                  accent="from-rose-500 to-red-400"
                  backgroundColour="bg-gradient-to-br from-rose-50 to-white"
                />
              </div>

              {/* BELOW 3: Soft Secondary */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <StatCardSecondary
                  title="Consent Coverage"
                  value={`${coverage.percent}%`}
                  sub={`${coverage.covered} users have at least 1 enabled category`}
                  icon={<FiTrendingUp size={20} />}
                  tone={secondaryTones.amber}
                />
                <StatCardSecondary
                  title="Websites"
                  value={totalWebsites}
                  sub="Tracked CMP sites"
                  icon={<FiGlobe size={20} />}
                  tone={secondaryTones.blue}
                />
                <StatCardSecondary
                  title="Last Updated"
                  value={latestUpdatedAt ? "Live" : "—"}
                  sub={
                    latestUpdatedAt
                      ? formatDateTime(latestUpdatedAt)
                      : "No consent updates yet"
                  }
                  icon={<FiClock size={20} />}
                  tone={secondaryTones.purple}
                />
              </div>

              {/* Config summary (optional small strip) */}
              {/* <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div>
                    <div className="text-sm font-semibold text-gray-900">
                      Configuration Summary
                    </div>
                    <div className="mt-1 text-xs text-gray-600">
                      Pulled from <span className="font-mono">/cmp/config</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <span className="inline-flex items-center rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700 border border-indigo-200">
                      Categories: {configSummary.categories}
                    </span>
                    <span className="inline-flex items-center rounded-full bg-purple-50 px-3 py-1 text-xs font-medium text-purple-700 border border-purple-200">
                      Vendors: {configSummary.vendors}
                    </span>
                  </div>
                </div>
              </div> */}

              {/* Category opt-in */}
              <div className="rounded-2xl border border-[#2B245C] bg-white p-6 shadow-lg hover:shadow-2xl transition-shadow duration-300">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-[#2B245C]">
                    Category Opt-in Rates
                  </h2>
                  <span className="text-sm text-gray-600">
                    {totalUsers} users
                  </span>
                </div>

                {totalUsers === 0 ? (
                  <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 px-4 py-8 text-center text-gray-600">
                    No consents found for this domain yet.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {categoryStats.map((c) => (
                      <ProgressBar
                        key={c.key}
                        label={c.label}
                        value={c.enabledCount}
                        total={c.total}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Recent activity */}
              <div className="rounded-2xl border border-[#2B245C] bg-white p-6 shadow-lg hover:shadow-2xl transition-shadow duration-300">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-[#2B245C]">
                    Recent Consent Updates
                  </h2>
                  <span className="text-sm text-gray-600">Latest 10</span>
                </div>

                {recentConsents.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 px-4 py-8 text-center text-gray-600">
                    No recent activity to show.
                  </div>
                ) : (
                  <div className="overflow-auto rounded-lg border border-gray-200">
                    <table className="min-w-full text-sm">
                      <thead className="bg-gray-50 text-left text-gray-700">
                        <tr>
                          <th className="px-4 py-2 font-medium">User ID</th>
                          <th className="px-4 py-2 font-medium">Enabled</th>
                          <th className="px-4 py-2 font-medium whitespace-nowrap">
                            Updated
                          </th>
                          <th className="px-4 py-2 font-medium">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {recentConsents.map((c) => {
                          const enabledKeys = getEnabledKeys(c.choices);
                          return (
                            <tr key={c._id} className="hover:bg-gray-50">
                              <td className="px-4 py-2 font-medium text-gray-900">
                                {c.userId}
                              </td>
                              <td className="px-4 py-2 text-gray-800">
                                {enabledKeys.length}
                                {enabledKeys.length ? (
                                  <span className="ml-2 text-xs text-gray-500 truncate">
                                    ({enabledKeys.slice(0, 3).join(", ")}
                                    {enabledKeys.length > 3 ? "…" : ""})
                                  </span>
                                ) : (
                                  <span className="ml-2 text-xs text-gray-500">
                                    (none)
                                  </span>
                                )}
                              </td>
                              <td className="px-4 py-2 whitespace-nowrap">
                                {formatDateTime(c.updatedAt)}
                              </td>
                              <td className="px-4 py-2">
                                <Link
                                  href={`/admin/scanner/cmp?domain=${encodeURIComponent(
                                    c.domain,
                                  )}#lookup`}
                                  className="inline-flex items-center rounded-lg bg-[#2B245C] px-3 py-1.5 text-sm font-medium text-white hover:bg-opacity-90"
                                >
                                  View in CMP
                                </Link>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
