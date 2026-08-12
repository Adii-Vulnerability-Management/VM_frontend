import React, { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  FiCheckCircle,
  FiClock,
  FiExternalLink,
  FiGlobe,
  FiHash,
  FiRefreshCw,
  FiShield,
  FiTrendingUp,
  FiUsers,
  FiXCircle,
} from "react-icons/fi";
import CustomAxios from "@/config/CustomAxios";
import { baseurl, initURL } from "@/config/config";
import ResponsiveLine from "@/components/Charts/ResponsiveLineNoSSR";
import ResponsivePie from "@/components/Charts/ResponsivePieNoSSR";

const ESSENTIAL_KEYS = new Set([
  "necessary",
  "essential",
  "strictly_necessary",
  "firstparty",
  "first_party",
  "core",
]);

const CATEGORY_COLORS = {
  analytics: {
    chart: "#a6cee3",
    bar: "bg-[#a6cee3]",
    dot: "bg-[#a6cee3]",
    icon: "bg-sky-50 text-sky-700 border-sky-100",
    soft: "bg-sky-50 text-sky-700",
    border: "border-sky-100",
    shell: "from-sky-50/80 to-white",
  },
  essential: {
    chart: "#2b83ba",
    bar: "bg-[#2b83ba]",
    dot: "bg-[#2b83ba]",
    icon: "bg-blue-50 text-blue-700 border-blue-100",
    soft: "bg-blue-50 text-blue-700",
    border: "border-blue-100",
    shell: "from-blue-50/80 to-white",
  },
  functional: {
    chart: "#b2df8a",
    bar: "bg-[#b2df8a]",
    dot: "bg-[#b2df8a]",
    icon: "bg-lime-50 text-lime-700 border-lime-100",
    soft: "bg-lime-50 text-lime-700",
    border: "border-lime-100",
    shell: "from-lime-50/80 to-white",
  },
  marketing: {
    chart: "#33a02c",
    bar: "bg-[#33a02c]",
    dot: "bg-[#33a02c]",
    icon: "bg-green-50 text-green-700 border-green-100",
    soft: "bg-green-50 text-green-700",
    border: "border-green-100",
    shell: "from-green-50/80 to-white",
  },
  default: {
    chart: "#2B245C",
    bar: "bg-[#2B245C]",
    dot: "bg-[#2B245C]",
    icon: "bg-slate-50 text-slate-700 border-slate-200",
    soft: "bg-slate-100 text-slate-700",
    border: "border-slate-200",
    shell: "from-slate-50 to-white",
  },
};

// Temporary empty fallback only. Real values are derived from the CMP APIs below.
const EMPTY_DASHBOARD_FALLBACK = {
  totalConsents: 0,
  acceptedCount: 0,
  rejectedCount: 0,
  consentCoveragePercent: 0,
  websitesCount: 0,
  lastUpdated: null,
  categories: [],
  trends: [],
  recentUpdates: [],
};

function safeArr(value) {
  return Array.isArray(value) ? value : [];
}

function getDomainCandidates(value) {
  if (!value) return [];
  const domain = String(value);
  const alternate = domain.endsWith("/") ? domain.slice(0, -1) : `${domain}/`;
  return [...new Set([domain, alternate].filter(Boolean))];
}

function getEnabledKeys(choices) {
  if (!choices || typeof choices !== "object") return [];
  return Object.entries(choices)
    .filter(([, accepted]) => accepted === true)
    .map(([key]) => key);
}

function isAcceptedConsent(consent) {
  return getEnabledKeys(consent?.choices).some(
    (key) => !ESSENTIAL_KEYS.has(String(key).toLowerCase()),
  );
}

function hasConsentPayload(consents, yearlyStats) {
  return (
    safeArr(consents).length > 0 ||
    Number(yearlyStats?.count || 0) > 0 ||
    safeArr(yearlyStats?.monthlyAcceptedRejected).length > 0 ||
    safeArr(yearlyStats?.categoryStats).length > 0
  );
}

function pct(part, total) {
  if (!total) return 0;
  return Math.round((part / total) * 100);
}

function formatDateTime(value) {
  if (!value) return "No consent updates yet";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "No consent updates yet";
  return date.toLocaleString();
}

function formatMonth(value) {
  if (!value) return "";
  const date = new Date(`${value}-01T00:00:00Z`);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("default", { month: "short", year: "numeric" });
}

function MetricCard({ title, value, sub, icon, tone = "indigo", meta }) {
  const tones = {
    indigo: {
      shell: "from-indigo-50 via-white to-white",
      icon: "bg-indigo-50 text-indigo-700 border-indigo-100",
      chip: "bg-indigo-50 text-indigo-700",
    },
    emerald: {
      shell: "from-emerald-50 via-white to-white",
      icon: "bg-emerald-50 text-emerald-700 border-emerald-100",
      chip: "bg-emerald-50 text-emerald-700",
    },
    rose: {
      shell: "from-rose-50 via-white to-white",
      icon: "bg-rose-50 text-rose-700 border-rose-100",
      chip: "bg-rose-50 text-rose-700",
    },
    amber: {
      shell: "from-amber-50 via-white to-white",
      icon: "bg-amber-50 text-amber-700 border-amber-100",
      chip: "bg-amber-50 text-amber-700",
    },
    blue: {
      shell: "from-blue-50 via-white to-white",
      icon: "bg-blue-50 text-blue-700 border-blue-100",
      chip: "bg-blue-50 text-blue-700",
    },
    violet: {
      shell: "from-violet-50 via-white to-white",
      icon: "bg-violet-50 text-violet-700 border-violet-100",
      chip: "bg-violet-50 text-violet-700",
    },
  };
  const theme = tones[tone] || tones.indigo;

  return (
    <div
      className={`group overflow-hidden rounded-2xl border border-[#2B245C]/15 bg-gradient-to-br ${theme.shell} p-5 shadow-md transition duration-300 hover:-translate-y-0.5 hover:border-[#2B245C]/30 hover:shadow-xl`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold uppercase tracking-wide text-slate-500">
            {title}
          </p>
          <p className="mt-2 text-3xl font-bold leading-none text-slate-950">
            {value}
          </p>
        </div>
        <div
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border shadow-sm transition group-hover:scale-105 ${theme.icon}`}
        >
          {icon}
        </div>
      </div>
      <div className="mt-5 flex items-center justify-between gap-3">
        <p className="min-w-0 truncate text-xs text-slate-500">{sub}</p>
        {meta ? (
          <span
            className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-bold ${theme.chip}`}
          >
            {meta}
          </span>
        ) : null}
      </div>
    </div>
  );
}

function getCategoryTheme(name = "") {
  const key = String(name).toLowerCase();
  if (key.includes("analytics")) {
    return CATEGORY_COLORS.analytics;
  }
  if (key.includes("essential") || key.includes("necessary")) {
    return CATEGORY_COLORS.essential;
  }
  if (key.includes("functional")) {
    return CATEGORY_COLORS.functional;
  }
  if (key.includes("marketing")) {
    return CATEGORY_COLORS.marketing;
  }
  return CATEGORY_COLORS.default;
}

function ChartCard({ title, subtitle, right, children }) {
  return (
    <section className="rounded-2xl border border-[#2B245C] bg-white p-6 shadow-lg hover:shadow-2xl transition-shadow duration-300">
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-[#2B245C]">{title}</h2>
          {subtitle ? (
            <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
          ) : null}
        </div>
        {right}
      </div>
      {children}
    </section>
  );
}

function EmptyState({ children }) {
  return (
    <div className="flex min-h-[220px] items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
      {children}
    </div>
  );
}

export default function CookieConsentDashboardV2({ embedded = false }) {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [websites, setWebsites] = useState([]);
  const [domain, setDomain] = useState("");
  const [consents, setConsents] = useState([]);
  const [config, setConfig] = useState([]);
  const [yearlyStats, setYearlyStats] = useState(null);

  const selectedYear = String(new Date().getFullYear());

  const loadWebsites = useCallback(async () => {
    const res = await CustomAxios.get(`${baseurl}/${initURL}/cmp/websites`);
    const list = safeArr(res.data);
    setWebsites(list);
    setDomain((current) => current || list[0]?.domain || "");
    return list;
  }, []);

  const loadDomainData = useCallback(
    async (selectedDomain) => {
      if (!selectedDomain) {
        setConsents([]);
        setConfig([]);
        setYearlyStats(null);
        return;
      }

      async function fetchDomainPayload(candidateDomain) {
        const yearlyRequest = CustomAxios.get(
          `${baseurl}/${initURL}/cmp/consents/year`,
          {
            params: { domain: candidateDomain, year: selectedYear },
          },
        ).catch(() => ({ data: null }));

        const [consentRes, configRes, yearlyRes] = await Promise.all([
          CustomAxios.get(`${baseurl}/${initURL}/cmp/consents`, {
            params: { domain: candidateDomain },
          }),
          CustomAxios.get(`${baseurl}/${initURL}/cmp/config`, {
            params: { domain: candidateDomain },
          }),
          yearlyRequest,
        ]);

        return {
          consents: safeArr(consentRes.data),
          config: safeArr(configRes.data),
          yearlyStats: yearlyRes.data || null,
        };
      }

      const candidates = getDomainCandidates(selectedDomain);
      let selectedPayload = null;

      for (const candidateDomain of candidates) {
        const payload = await fetchDomainPayload(candidateDomain);
        selectedPayload = selectedPayload || payload;

        if (hasConsentPayload(payload.consents, payload.yearlyStats)) {
          selectedPayload = payload;
          break;
        }
      }

      setConsents(selectedPayload?.consents || []);
      setConfig(selectedPayload?.config || []);
      setYearlyStats(selectedPayload?.yearlyStats || null);
    },
    [selectedYear],
  );

  const refreshDashboard = useCallback(async () => {
    try {
      setRefreshing(true);
      setError("");
      const list = websites.length ? websites : await loadWebsites();
      const nextDomain = domain || list[0]?.domain || "";
      await loadDomainData(nextDomain);
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to load Cookie Consent Dashboard data.",
      );
      setConsents([]);
      setConfig([]);
      setYearlyStats(null);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [domain, loadDomainData, loadWebsites, websites]);

  useEffect(() => {
    let cancelled = false;

    async function init() {
      try {
        setLoading(true);
        setError("");
        const list = await loadWebsites();
        if (cancelled) return;
        const initialDomain = list[0]?.domain || "";
        await loadDomainData(initialDomain);
      } catch (err) {
        if (!cancelled) {
          setError(
            err?.response?.data?.message ||
              err?.message ||
              "Failed to load Cookie Consent Dashboard data.",
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    init();
    return () => {
      cancelled = true;
    };
  }, [loadDomainData, loadWebsites]);

  useEffect(() => {
    if (!domain) return;
    let cancelled = false;

    async function reloadDomain() {
      try {
        setRefreshing(true);
        setError("");
        await loadDomainData(domain);
      } catch (err) {
        if (!cancelled) {
          setError(
            err?.response?.data?.message ||
              err?.message ||
              "Failed to load selected domain data.",
          );
        }
      } finally {
        if (!cancelled) {
          setRefreshing(false);
          setLoading(false);
        }
      }
    }

    reloadDomain();
    return () => {
      cancelled = true;
    };
  }, [domain, loadDomainData]);

  const dashboard = useMemo(() => {
    const totalConsents = consents.length || Number(yearlyStats?.count || 0);
    const acceptedFromConsents = consents.filter((consent) =>
      isAcceptedConsent(consent),
    ).length;
    const acceptedCount = consents.length
      ? acceptedFromConsents
      : Number(yearlyStats?.acceptedCount || 0);
    const rejectedCount = consents.length
      ? Math.max(totalConsents - acceptedCount, 0)
      : Number(yearlyStats?.rejectedCount || 0);
    const coveredCount = consents.filter(
      (consent) => getEnabledKeys(consent?.choices).length > 0,
    ).length;
    const lastUpdated = consents
      .map((consent) => consent?.updatedAt || consent?.createdAt)
      .filter(Boolean)
      .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())[0];

    const categoryStatsByKey = new Map(
      safeArr(yearlyStats?.categoryStats).map((item) => [item?.key, item]),
    );

    const categoryKeys = config.map((item) => item?.key).filter(Boolean);
    if (!categoryKeys.length) {
      const discoveredKeys = new Set();
      consents.forEach((consent) => {
        Object.keys(consent?.choices || {}).forEach((key) =>
          discoveredKeys.add(key),
        );
      });
      categoryStatsByKey.forEach((_, key) => discoveredKeys.add(key));
      categoryKeys.push(...Array.from(discoveredKeys));
    }

    const categories = categoryKeys.map((key) => {
      const label = config.find((item) => item?.key === key)?.name || key;
      const yearlyCategory = categoryStatsByKey.get(key);
      const acceptedFromConsentChoices = consents.filter(
        (consent) => consent?.choices?.[key] === true,
      ).length;
      const accepted = consents.length
        ? acceptedFromConsentChoices
        : Number(yearlyCategory?.acceptedTrue || 0);
      const total = consents.length
        ? totalConsents
        : Number(yearlyCategory?.total || totalConsents || 0);
      const rejected = Math.max(total - accepted, 0);
      return {
        name: label,
        total,
        accepted,
        rejected,
        optInRate: pct(accepted, total),
      };
    });

    const trends = safeArr(yearlyStats?.monthlyAcceptedRejected).map(
      (item) => ({
        month: item.month,
        accepted: Number(item.accepted || 0),
        rejected: Number(item.rejected || 0),
      }),
    );

    const recentUpdates = [...consents]
      .sort((a, b) => {
        const aTime = new Date(a?.updatedAt || a?.createdAt || 0).getTime();
        const bTime = new Date(b?.updatedAt || b?.createdAt || 0).getTime();
        return bTime - aTime;
      })
      .slice(0, 10)
      .map((consent) => {
        const enabledKeys = getEnabledKeys(consent?.choices);
        return {
          userId: consent?.userId || "-",
          domain: consent?.domain || domain || "-",
          action: isAcceptedConsent(consent) ? "Accepted" : "Rejected",
          category: enabledKeys.length
            ? enabledKeys.slice(0, 3).join(", ")
            : "None",
          createdAt: consent?.updatedAt || consent?.createdAt || null,
        };
      });

    return {
      ...EMPTY_DASHBOARD_FALLBACK,
      totalConsents,
      acceptedCount,
      rejectedCount,
      consentCoveragePercent: pct(coveredCount, totalConsents),
      websitesCount: websites.length,
      lastUpdated: lastUpdated || null,
      categories,
      trends,
      recentUpdates,
    };
  }, [config, consents, domain, websites.length, yearlyStats]);

  const acceptedPercent = pct(dashboard.acceptedCount, dashboard.totalConsents);
  const rejectedPercent = pct(dashboard.rejectedCount, dashboard.totalConsents);
  const domainParam = encodeURIComponent(domain || "");

  const pieData = dashboard.categories
    .filter((item) => item.total > 0)
    .map((item) => ({
      id: item.name,
      label: item.name,
      value: item.accepted,
      color: getCategoryTheme(item.name).chart,
    }))
    .filter((item) => item.value > 0);

  const lineData = [
    {
      id: "Accepted",
      color: "#10b981",
      data: dashboard.trends.map((item) => ({
        x: formatMonth(item.month),
        y: item.accepted,
      })),
    },
    {
      id: "Rejected",
      color: "#f43f5e",
      data: dashboard.trends.map((item) => ({
        x: formatMonth(item.month),
        y: item.rejected,
      })),
    },
  ];

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
            : "mx-5 my-3 min-h-screen rounded-lg bg-white p-5"
        }
      >
        <header
          className={`rounded-2xl shadow-lg hover:shadow-2xl transition-shadow duration-300 ${
            embedded
              ? "p-6 border border-slate-200 bg-gradient-to-br from-white via-slate-50 to-cyan-50"
              : "bg-[#2B245C] px-6 py-8"
          }`}
        >
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
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
                High-level CMP metrics and category opt-in analytics per domain.
              </p>
            </div>
            <button
              type="button"
              onClick={refreshDashboard}
              className={`inline-flex items-center gap-2 rounded-lg px-6 py-2.5 text-sm font-semibold shadow-md hover:shadow-lg transition-all ${
                embedded
                  ? "bg-[#2B245C] text-white hover:bg-opacity-90"
                  : "bg-white text-[#2B245C] hover:bg-gray-50"
              }`}
              disabled={refreshing}
            >
              <FiRefreshCw className={refreshing ? "animate-spin" : ""} />
              Refresh
            </button>
          </div>
        </header>

        <div className="space-y-6 mt-5">
          <section className="rounded-2xl border border-[#2B245C] bg-white p-6 shadow-lg hover:shadow-2xl transition-shadow duration-300">
            <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase text-slate-500">
                  Domain
                </label>
                <select
                  value={domain}
                  onChange={(event) => setDomain(event.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-[#2B245C] focus:ring-2 focus:ring-[#2B245C]/20"
                >
                  {websites.length ? (
                    websites.map((website) => (
                      <option
                        key={website?._id || website?.domain}
                        value={website?.domain}
                      >
                        {website?.domain}
                      </option>
                    ))
                  ) : (
                    <option value="">No domains found</option>
                  )}
                </select>
              </div>
              <Link
                href={`/admin/scanner/cmp?domain=${domainParam}`}
                className="inline-flex h-[42px] items-center justify-center gap-2 rounded-xl bg-[#2B245C] px-5 text-sm font-semibold text-white shadow-md transition hover:bg-[#241e4d]"
              >
                <FiExternalLink />
                Open CMP Admin
              </Link>
            </div>
            {error ? (
              <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                {error}
              </div>
            ) : null}
          </section>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <MetricCard
              title="Total Consents"
              value={loading ? "..." : dashboard.totalConsents}
              sub={domain || "All domains"}
              icon={<FiUsers size={20} />}
              tone="indigo"
              meta={`${dashboard.categories.length} categories`}
            />
            <MetricCard
              title="Accepted %"
              value={loading ? "..." : `${acceptedPercent}%`}
              sub={`${dashboard.acceptedCount} accepted consents`}
              icon={<FiCheckCircle size={20} />}
              tone="emerald"
              meta={`${dashboard.acceptedCount}/${dashboard.totalConsents}`}
            />
            <MetricCard
              title="Rejected %"
              value={loading ? "..." : `${rejectedPercent}%`}
              sub={`${dashboard.rejectedCount} rejected consents`}
              icon={<FiXCircle size={20} />}
              tone="rose"
              meta={`${dashboard.rejectedCount}/${dashboard.totalConsents}`}
            />
            <MetricCard
              title="Consent Coverage"
              value={loading ? "..." : `${dashboard.consentCoveragePercent}%`}
              sub="Users with at least one enabled category"
              icon={<FiTrendingUp size={20} />}
              tone="amber"
              meta="Coverage"
            />
            <MetricCard
              title="Websites"
              value={loading ? "..." : dashboard.websitesCount}
              sub="Tracked CMP domains"
              icon={<FiGlobe size={20} />}
              tone="blue"
              meta="Domains"
            />
            <MetricCard
              title="Last Updated"
              value={dashboard.lastUpdated ? "Live" : "-"}
              sub={formatDateTime(dashboard.lastUpdated)}
              icon={<FiClock size={20} />}
              tone="violet"
              meta={dashboard.lastUpdated ? "Synced" : "No data"}
            />
          </div>

          <div className="grid gap-6 xl:grid-cols-2">
            <ChartCard
              title="Cookie / Category Distribution"
              subtitle="Accepted consent distribution across categories."
            >
              {pieData.length ? (
                <div className="h-[340px]">
                  <ResponsivePie
                    data={pieData}
                    margin={{ top: 22, right: 44, bottom: 70, left: 44 }}
                    innerRadius={0.62}
                    padAngle={1}
                    cornerRadius={3}
                    activeOuterRadiusOffset={8}
                    colors={(datum) => datum.data.color}
                    borderWidth={1}
                    borderColor={{
                      from: "color",
                      modifiers: [["darker", 0.2]],
                    }}
                    enableArcLabels={false}
                    arcLinkLabelsSkipAngle={8}
                    arcLinkLabelsTextColor="#0f172a"
                    arcLinkLabelsThickness={3}
                    arcLinkLabelsColor={{ from: "color" }}
                    arcLinkLabelsDiagonalLength={20}
                    arcLinkLabelsStraightLength={24}
                    arcLinkLabelsOffset={2}
                    theme={{
                      labels: {
                        text: {
                          fontSize: 14,
                          fontWeight: 700,
                        },
                      },
                      legends: {
                        text: {
                          fontSize: 13,
                          fontWeight: 600,
                          fill: "#334155",
                        },
                      },
                      tooltip: {
                        container: {
                          fontSize: 13,
                        },
                      },
                    }}
                    legends={[
                      {
                        anchor: "bottom",
                        direction: "row",
                        justify: false,
                        translateY: 58,
                        itemsSpacing: 18,
                        itemWidth: 112,
                        itemHeight: 20,
                        itemTextColor: "#334155",
                        symbolSize: 11,
                        symbolShape: "circle",
                      },
                    ]}
                  />
                </div>
              ) : (
                <EmptyState>No category consent data to show.</EmptyState>
              )}
            </ChartCard>

            <ChartCard
              title="Consent Interaction Trend"
              subtitle="Monthly accepted and rejected consent activity."
            >
              {dashboard.trends.length ? (
                <div className="h-[340px]">
                  <ResponsiveLine
                    data={lineData}
                    margin={{ top: 24, right: 28, bottom: 72, left: 48 }}
                    xScale={{ type: "point" }}
                    yScale={{
                      type: "linear",
                      min: 0,
                      max: "auto",
                      stacked: false,
                    }}
                    curve="monotoneX"
                    axisTop={null}
                    axisRight={null}
                    axisBottom={{
                      tickSize: 5,
                      tickPadding: 8,
                      tickRotation: -25,
                    }}
                    axisLeft={{
                      tickSize: 5,
                      tickPadding: 8,
                      tickRotation: 0,
                    }}
                    colors={(line) => line.color}
                    pointSize={8}
                    pointColor={{ theme: "background" }}
                    pointBorderWidth={2}
                    pointBorderColor={{ from: "serieColor" }}
                    enableArea
                    areaOpacity={0.08}
                    useMesh
                    legends={[
                      {
                        anchor: "bottom",
                        direction: "row",
                        translateY: 64,
                        itemWidth: 100,
                        itemHeight: 18,
                        symbolSize: 10,
                        symbolShape: "circle",
                      },
                    ]}
                  />
                </div>
              ) : (
                <EmptyState>
                  No trend data available for {selectedYear}.
                </EmptyState>
              )}
            </ChartCard>
          </div>

          <ChartCard
            title="Category Opt-in Rates"
            subtitle="Consent acceptance rate by category."
            right={
              <span className="rounded-full bg-[#2B245C]/10 px-3 py-1 text-xs font-semibold text-[#2B245C]">
                {dashboard.categories.length} categories
              </span>
            }
          >
            {dashboard.categories.length ? (
              <div className="grid gap-4 lg:grid-cols-2">
                {dashboard.categories.map((category) => {
                  const theme = getCategoryTheme(category.name);
                  return (
                    <div
                      key={category.name}
                      className="group rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition duration-300 hover:-translate-y-0.5 hover:border-[#2B245C]/25 hover:shadow-md"
                    >
                      <div className="mb-4 flex items-start justify-between gap-4">
                        <div className="flex min-w-0 items-center gap-3">
                          <span
                            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${theme.icon}`}
                          >
                            <FiShield />
                          </span>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span
                                className={`h-2.5 w-2.5 shrink-0 rounded-full ${theme.dot}`}
                              />
                              <p className="truncate text-sm font-semibold text-slate-900">
                                {category.name}
                              </p>
                            </div>
                            <p className="mt-1.5 text-xs text-slate-500">
                              {category.total} decisions tracked
                            </p>
                          </div>
                        </div>
                        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-700">
                          {category.optInRate}%
                        </span>
                      </div>
                      <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
                        <div
                          className={`h-full rounded-full ${theme.bar} transition-all duration-500`}
                          style={{ width: `${category.optInRate}%` }}
                        />
                      </div>
                      <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
                        <span className="rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1.5 font-semibold text-emerald-700">
                          {category.accepted} accepted
                        </span>
                        <span className="rounded-full border border-rose-100 bg-rose-50 px-3 py-1.5 font-semibold text-rose-700">
                          {category.rejected} rejected
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <EmptyState>No category opt-in data to show.</EmptyState>
            )}
          </ChartCard>

          <ChartCard
            title="Recent Consent Updates"
            subtitle="Latest 10 consent records."
          >
            {dashboard.recentUpdates.length ? (
              <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
                <table className="min-w-full text-sm">
                  <thead className="bg-gradient-to-r from-slate-50 to-indigo-50 text-left text-slate-600">
                    <tr>
                      <th className="px-4 py-3 font-semibold">
                        <span className="inline-flex items-center gap-2">
                          <FiUsers />
                          User ID
                        </span>
                      </th>
                      <th className="px-4 py-3 font-semibold">Domain</th>
                      <th className="px-4 py-3 font-semibold">Action</th>
                      <th className="px-4 py-3 font-semibold">Category</th>
                      <th className="px-4 py-3 font-semibold">Updated</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {dashboard.recentUpdates.map((update, index) => (
                      <tr
                        key={`${update.userId}-${update.createdAt || index}`}
                        className="transition hover:bg-indigo-50/40"
                      >
                        <td className="whitespace-nowrap px-4 py-3">
                          <div className="flex items-center gap-3">
                            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#2B245C]/10 text-[#2B245C]">
                              <FiHash />
                            </span>
                            <span className="font-semibold text-slate-900">
                              {update.userId}
                            </span>
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-slate-600">
                          {update.domain}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3">
                          <span
                            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${
                              update.action === "Accepted"
                                ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100"
                                : "bg-rose-50 text-rose-700 ring-1 ring-rose-100"
                            }`}
                          >
                            {update.action === "Accepted" ? (
                              <FiCheckCircle />
                            ) : (
                              <FiXCircle />
                            )}
                            {update.action}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-slate-600">
                          <div className="flex flex-wrap gap-1.5">
                            {String(update.category || "None")
                              .split(",")
                              .map((item) => item.trim())
                              .filter(Boolean)
                              .map((item) => (
                                <span
                                  key={item}
                                  className="rounded-full bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600"
                                >
                                  {item}
                                </span>
                              ))}
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-slate-600">
                          {formatDateTime(update.createdAt)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <EmptyState>No recent activity to show.</EmptyState>
            )}
          </ChartCard>
        </div>
      </div>
    </div>
  );
}
