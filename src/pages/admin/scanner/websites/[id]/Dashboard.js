// components/WebsiteDashboard.jsx

import { useRouter } from "next/router";
import dynamic from "next/dynamic";
import { useEffect, useMemo, useState, useCallback, useRef } from "react";
import {
  FiPieChart,
  FiBarChart2,
  FiActivity,
  FiCheckCircle,
  FiBox,
  FiRefreshCcw,
  FiDownload,
  FiMaximize,
  FiMinimize,
} from "react-icons/fi";
import { BiArrowBack } from "react-icons/bi";
import { baseurl, initURL } from "@/config/config";
import CustomAxios from "@/config/CustomAxios";

// ✅ Dynamically import Nivo to avoid SSR issues
const ResponsivePie = dynamic(
  () => import("@nivo/pie").then((m) => m.ResponsivePie),
  { ssr: false },
);
const ResponsiveBar = dynamic(
  () => import("@nivo/bar").then((m) => m.ResponsiveBar),
  { ssr: false },
);
const ResponsiveLine = dynamic(
  () => import("@nivo/line").then((m) => m.ResponsiveLine),
  { ssr: false },
);

// ---- optional dummy data (dev/demo fallback) ----
const DUMMY_DATA = {
  consent: { accepted: 320, rejected: 110, undecided: 20 },
  dsar: { access: 12, delete: 7, update: 5 },
  cookieCategories: { necessary: 6, analytics: 9, marketing: 5 },
  scriptStatus: [
    { name: "Google Analytics", category: "analytics", status: "blocked" },
    { name: "Meta Pixel", category: "marketing", status: "allowed" },
  ],
  consentOverTime: [
    {
      id: "Consents",
      data: [
        { x: "2025-07-20", y: 20 },
        { x: "2025-07-21", y: 35 },
        { x: "2025-07-22", y: 50 },
        { x: "2025-07-23", y: 60 },
        { x: "2025-07-24", y: 90 },
        { x: "2025-07-25", y: 120 },
      ],
    },
  ],
  // optional demo timeseries
  cookieCategoriesOverTime: [
    { bucket: "2025-07-20T00:00:00.000Z", category: "analytics", count: 2 },
    { bucket: "2025-07-20T00:00:00.000Z", category: "marketing", count: 1 },
    { bucket: "2025-07-21T00:00:00.000Z", category: "analytics", count: 3 },
  ],
};

// ---- small UI helpers ----
const Card = ({ title, icon, iconClass = "", children, right }) => (
  <div className="rounded-2xl border border-[#2B245C] bg-white p-5 shadow-lg hover:shadow-2xl transition-shadow duration-300">
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-xl text-[#2B245C] font-semibold flex items-center">
        {icon} <span className={`ml-2 ${iconClass}`}>{title}</span>
      </h2>
      {right}
    </div>
    {children}
  </div>
);

const Skeleton = ({ className = "" }) => (
  <div className={`animate-pulse bg-gray-200 rounded ${className}`} />
);

const Empty = ({ children }) => (
  <div className="border border-dashed rounded p-6 text-center text-gray-500">
    {children}
  </div>
);

// cross-browser fullscreen helper
function useFullscreen() {
  const ref = useRef(null);
  const [isFs, setIsFs] = useState(false);

  const getFsEl = () =>
    document.fullscreenElement ||
    document.webkitFullscreenElement ||
    document.mozFullScreenElement ||
    document.msFullscreenElement;

  const toggle = useCallback(async () => {
    const el = ref.current;
    if (!el) return;
    const req =
      el.requestFullscreen ||
      el.webkitRequestFullscreen ||
      el.mozRequestFullScreen ||
      el.msRequestFullscreen;
    const exit =
      document.exitFullscreen ||
      document.webkitExitFullscreen ||
      document.mozCancelFullScreen ||
      document.msExitFullscreen;

    if (!getFsEl()) await req?.call(el);
    else await exit?.call(document);
  }, []);

  useEffect(() => {
    const onChange = () => {
      setIsFs(getFsEl() === ref.current);
      // nudge charts to recalc size
      setTimeout(() => window.dispatchEvent(new Event("resize")), 50);
    };
    document.addEventListener("fullscreenchange", onChange);
    document.addEventListener("webkitfullscreenchange", onChange);
    document.addEventListener("mozfullscreenchange", onChange);
    document.addEventListener("MSFullscreenChange", onChange);
    return () => {
      document.removeEventListener("fullscreenchange", onChange);
      document.removeEventListener("webkitfullscreenchange", onChange);
      document.removeEventListener("mozfullscreenchange", onChange);
      document.removeEventListener("MSFullscreenChange", onChange);
    };
  }, []);

  return { ref, isFs, toggle };
}

export default function WebsiteDashboard() {
  const router = useRouter();
  const { id, demo } = router.query;

  const pieFs = useFullscreen();
  const cookiesFs = useFullscreen();
  const consentFs = useFullscreen();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [range, setRange] = useState("30d"); // 7d | 30d | 90d | all
  const isMounted = useRef(true);
  const [lastUpdated, setLastUpdated] = useState(null);

  // timezone (browser)
  const [timezone, setTimezone] = useState("UTC");
  useEffect(() => {
    try {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
      setTimezone(tz);
    } catch {
      setTimezone("UTC");
    }
  }, []);

  // Cookies controls
  // (Keep the old state for backward-compat, but we’ll use the new cookieTab below)
  const [cookieMode, setCookieMode] = useState("snapshot"); // 'snapshot' | 'timeseries'
  const [cookieGranularity, setCookieGranularity] = useState("day"); // 'hour' | 'day' | 'week'
  const [cookieStrategy, setCookieStrategy] = useState("latestJob"); // 'latestJob' | 'latestKnown'
  const [cookieSeriesMode, setCookieSeriesMode] = useState("aggregated"); // 'aggregated' | 'raw'

  // NEW: cookie card tab (snapshot | delta | activity)
  const [cookieTab, setCookieTab] = useState("snapshot");

  // NEW: data + loading for cookie-insights endpoint
  const [cookieInsights, setCookieInsights] = useState({
    snapshots: [],
    deltas: [],
    activity: [],
  });
  const [cookieInsightsLoading, setCookieInsightsLoading] = useState(false);

  const buildURL = useCallback(() => {
    const params = new URLSearchParams();
    if (id) params.set("websiteId", id);
    // consent toggles
    params.set("overall", "true");
    params.set("perCategory", "true");
    // date window (use range as "from" unless all)
    if (range !== "all") params.set("from", range);
    params.set("timezone", timezone);

    // cookie toggles
    // Keep existing behavior for /dashboard call (snapshot is default path)
    if (cookieMode === "timeseries") {
      params.set("cookieTimeseries", "true");
      params.set("cookieGranularity", cookieGranularity);
      params.set("cookieStrategy", cookieStrategy);
    } else {
      // snapshot path still accepts strategy
      params.set("cookieStrategy", cookieStrategy);
    }

    return `${baseurl}/${initURL}/cmp/websites/dashboard?${params.toString()}`;
  }, [id, range, timezone, cookieMode, cookieGranularity, cookieStrategy]);

  // NEW: Build cookie-insights URL based on tab
  const buildCookieInsightsURL = useCallback(() => {
    const params = new URLSearchParams();
    if (id) params.set("websiteId", id);
    // date window (reuse your range control)
    if (range !== "all") params.set("from", range);

    // include only what we need for the active tab
    if (cookieTab === "delta") {
      params.set("includeDeltas", "true");
    } else if (cookieTab === "activity") {
      params.set("includeActivity", "true");
      params.set("bucket", cookieGranularity === "week" ? "week" : "day"); // hour not supported here
      params.set("timezone", timezone);
    } else {
      // snapshot via cookie-insights is optional; you already get snapshot from /dashboard
      params.set("includeSnapshots", "true");
    }
    return `${baseurl}/${initURL}/cmp/websites/cookie-insights?${params.toString()}`;
  }, [id, range, cookieTab, cookieGranularity, timezone]);

  const fetchData = useCallback(async () => {
    if (!id && !demo) return;
    setLoading(true);
    setError(null);

    const useDummy = !!demo || process.env.NODE_ENV === "development";

    if (useDummy && !id) {
      setData(DUMMY_DATA);
      setLoading(false);
      setLastUpdated(new Date());
      return;
    }

    const url = buildURL();
    try {
      const res = await CustomAxios.get(url, { timeout: 15000 });
      const payload = res?.data ?? {};
      if (!isMounted.current) return;

      // defensive shape
      const safe = {
        consent: {
          accepted: Number(payload?.consent?.accepted ?? 0),
          rejected: Number(payload?.consent?.rejected ?? 0),
          undecided: Number(payload?.consent?.undecided ?? 0),
        },
        dsar: payload?.dsar ?? { access: 0, delete: 0, update: 0 },
        cookieCategories: payload?.cookieCategories ?? {},
        cookieCategoriesOverTime: Array.isArray(
          payload?.cookieCategoriesOverTime,
        )
          ? payload.cookieCategoriesOverTime
          : null,
        scriptStatus: Array.isArray(payload?.scriptStatus)
          ? payload.scriptStatus
          : [],
        consentOverTime: Array.isArray(payload?.consentOverTime)
          ? payload.consentOverTime
          : [],
      };

      setData(safe);
      setLastUpdated(new Date());
    } catch (err) {
      console.error("Failed to fetch dashboard:", err);
      // fall back to dummy so UI remains useful
      setData(DUMMY_DATA);
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Something went wrong while loading the dashboard.",
      );
    } finally {
      if (isMounted.current) setLoading(false);
    }
  }, [id, demo, buildURL]);

  // NEW: fetch cookie-insights on demand (tab/granularity changes)
  const fetchCookieInsights = useCallback(async () => {
    if (!id || cookieTab === "snapshot") {
      // snapshot already covered by /dashboard call
      setCookieInsights({ snapshots: [], deltas: [], activity: [] });
      return;
    }
    setCookieInsightsLoading(true);
    try {
      const res = await CustomAxios.get(buildCookieInsightsURL(), {
        timeout: 15000,
      });
      setCookieInsights(
        res?.data ?? { snapshots: [], deltas: [], activity: [] },
      );
    } catch (e) {
      console.error("cookie-insights failed", e);
      setCookieInsights({ snapshots: [], deltas: [], activity: [] });
    } finally {
      setCookieInsightsLoading(false);
    }
  }, [id, cookieTab, buildCookieInsightsURL]);

  // initial + when router ready / id changes / toggles change
  useEffect(() => {
    isMounted.current = true;
    if (router.isReady && (id || demo)) fetchData();
    return () => {
      isMounted.current = false;
    };
  }, [router.isReady, id, demo, fetchData]);

  useEffect(() => {
    if (!router.isReady || (!id && !demo)) return;
    // when switching in/out of legacy timeseries, refetch dashboard data
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cookieMode, cookieGranularity, cookieStrategy]);

  // optional gentle auto-refresh every 5 minutes (not when using demo)
  useEffect(() => {
    if (!id || demo) return;
    const t = setInterval(fetchData, 5 * 60 * 1000);
    return () => clearInterval(t);
  }, [id, demo, fetchData]);

  // NEW: refetch cookie insights when tab changes or relevant controls change
  useEffect(() => {
    if (router.isReady) fetchCookieInsights();
  }, [router.isReady, fetchCookieInsights]);

  // Also refetch when granularity changes for the Activity tab
  useEffect(() => {
    if (cookieTab === "activity") fetchCookieInsights();
  }, [cookieTab, cookieGranularity]); // eslint-disable-line react-hooks/exhaustive-deps

  // ----------------- transforms -----------------
  const totals = useMemo(() => {
    const c = data?.consent || { accepted: 0, rejected: 0, undecided: 0 };
    const total = c.accepted + c.rejected + c.undecided;
    const pct = (n) => (total ? Math.round((n / total) * 100) : 0);
    return {
      total,
      pctAccepted: pct(c.accepted),
      pctRejected: pct(c.rejected),
      pctUndecided: pct(c.undecided),
    };
  }, [data]);

  const consentPieData = useMemo(() => {
    const c = data?.consent || { accepted: 0, rejected: 0, undecided: 0 };
    return [
      { id: "Accepted", label: "Accepted", value: c.accepted },
      { id: "Rejected", label: "Rejected", value: c.rejected },
      { id: "Undecided", label: "Undecided", value: c.undecided },
    ];
  }, [data]);

  // Cookies snapshot bar data
  const cookieBarData = useMemo(() => {
    const cc = data?.cookieCategories || {};
    return Object.entries(cc).map(([category, count]) => ({ category, count }));
  }, [data]);

  // const formatBucket = useCallback((iso) => {
  //   //   if (!iso) return '';
  //   //   if (cookieGranularity === 'hour') return iso.slice(0, 13).replace('T', ' ');
  //   //   if (cookieGranularity === 'week') {
  //   //     // label week by its Monday start (string)
  //   //     const d = new Date(iso);
  //   //     const monday = startOfUtcWeek(d, 1).toISOString().slice(0, 10);
  //   //     return monday; // "YYYY-MM-DD" (week start)
  //   //   }
  //   //   return iso.slice(0, 10); // day
  //   // }, [cookieGranularity]);

  //   // const cookieSeries = useMemo(() => {
  //   //   if (cookieMode !== 'timeseries') return [];
  //   //   const rows = data?.cookieCategoriesOverTime || [];
  //   //   const byCat = new Map();
  //   //   for (const r of rows) {
  //   //     const id = r.category || 'uncategorized';
  //   //     const x = formatBucket(r.bucket); // string
  //   //     if (!byCat.has(id)) byCat.set(id, []);
  //   //     byCat.get(id).push({ x, y: r.count });
  //   //   }
  //   //   return Array.from(byCat.entries()).map(([id, points]) => ({
  //   //     id,
  //   //     data: points.sort((a, b) => (a.x < b.x ? -1 : a.x > b.x ? 1 : 0)),
  //   //   }));
  //   // }, [data, cookieMode, formatBucket]);

  //   // Cookies timeseries line data
  //   // --- time helpers (UTC) ---
  const startOfUtcDay = (d) => {
    const x = new Date(d);
    x.setUTCHours(0, 0, 0, 0);
    return x;
  };

  const startOfUtcWeek = (d, weekStartsOn = 1) => {
    // 1 = Monday
    const x = startOfUtcDay(d);
    const diff = (x.getUTCDay() - weekStartsOn + 7) % 7;
    x.setUTCDate(x.getUTCDate() - diff);
    return x;
  };

  // label normalization (handles "Uncategorized" vs "uncategorized")
  const normalizeLabel = (s) => {
    const t = (s || "uncategorized").trim();
    return t.charAt(0).toUpperCase() + t.slice(1).toLowerCase();
  };

  // --- build series (aggregate per category per aligned bucket) ---
  const cookieSeries = useMemo(() => {
    if (cookieMode !== "timeseries") return [];
    const rows = data?.cookieCategoriesOverTime || [];

    // --- RAW: plot exactly what backend sent (no label normalization, no extra alignment/aggregation)
    if (cookieSeriesMode === "raw") {
      const byCat = new Map();
      for (const r of rows) {
        const id = r.category ?? "uncategorized";
        const x = new Date(r.bucket);
        if (!byCat.has(id)) byCat.set(id, []);
        byCat.get(id).push({ x, y: Number(r.count || 0) });
      }
      return Array.from(byCat.entries()).map(([id, pts]) => ({
        id,
        data: pts.sort((a, b) => a.x - b.x),
      }));
    }

    // --- AGGREGATED: normalize labels, align by granularity, and sum duplicates
    const agg = new Map(); // key = `${label}__${alignedTs}`
    for (const r of rows) {
      const label = normalizeLabel(r.category);
      let x = new Date(r.bucket);
      if (cookieGranularity === "hour") x.setUTCMinutes(0, 0, 0);
      else if (cookieGranularity === "day") x = startOfUtcDay(x);
      else if (cookieGranularity === "week") x = startOfUtcWeek(x, 1);
      const key = `${label}__${x.getTime()}`;
      agg.set(key, (agg.get(key) || 0) + Number(r.count || 0));
    }
    const byCat = new Map();
    for (const [key, y] of agg.entries()) {
      const [id, ts] = key.split("__");
      const x = new Date(Number(ts));
      if (!byCat.has(id)) byCat.set(id, []);
      byCat.get(id).push({ x, y });
    }
    return Array.from(byCat.entries()).map(([id, pts]) => ({
      id,
      data: pts.sort((a, b) => a.x - b.x),
    }));
  }, [data, cookieMode, cookieGranularity, cookieSeriesMode]);

  //   // --- chart (map 'week' -> 'day' for Nivo precision; keep weekly ticks) ---
  const timePrecision = cookieGranularity === "hour" ? "hour" : "day";

  const scriptStatus = data?.scriptStatus || [];

  // filter consent line series by selected range (client-side)
  const consentSeries = useMemo(() => {
    const series = Array.isArray(data?.consentOverTime)
      ? data.consentOverTime
      : [];
    if (!series.length) return [];

    const days = range === "all" ? Infinity : Number(range.replace("d", ""));
    const cutOff =
      days === Infinity
        ? null
        : new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const fmt = (v) => {
      const d = new Date(v);
      return isNaN(d) ? v : d.toISOString().slice(0, 10);
    };

    return series.map((s) => ({
      ...s,
      data: s.data
        .filter((pt) => !cutOff || new Date(pt.x) >= cutOff)
        .map((pt) => ({ x: fmt(pt.x), y: pt.y })),
    }));
  }, [data, range]);

  // CSV export (current consentSeries only)
  const handleExportCSV = useCallback(() => {
    const s = consentSeries[0];
    if (!s || !s.data?.length) return;
    const rows = [["date", "consents"], ...s.data.map((pt) => [pt.x, pt.y])];
    const csv = rows.map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `consent_over_time_${range}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [consentSeries, range]);

  // ----------------- loading state -----------------
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg p-4 shadow">
            <Skeleton className="h-6 w-48 mb-4" />
            <Skeleton className="h-40 w-full" />
          </div>
        ))}
      </div>
    );
  }

  // ----------------- main -----------------
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="mx-5 bg-white rounded-lg p-5 my-3">
        {/* Header */}
        <div className="px-6 py-8 bg-[#2B245C] rounded-2xl shadow-lg hover:shadow-2xl transition-shadow duration-300 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-cyan-50">Dashboard</h1>
          {/* <p className="mt-1 text-sm text-white">
            Review and classify cookies detected for this website.
          </p> */}

          <button
            type="button"
            title="Back to Website list"
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 rounded-lg border border-white/20 bg-white text-[#2B245C] px-4 py-2 text-sm font-semibold shadow-md hover:shadow-lg hover:bg-blue-50 transition-all"
          >
            <BiArrowBack size={18} />
            Back
          </button>
        </div>

        <div className="pt-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Error banner (still shows UI using fallback data) */}
          {error && (
            <div
              role="alert"
              aria-live="polite"
              className="md:col-span-2 lg:col-span-3 bg-red-50 border-l-4 border-red-500 text-red-800 p-4 rounded"
            >
              <div className="flex items-center justify-between">
                <p>
                  ⚠️ We had trouble loading live data. Showing fallback data
                  instead.
                </p>
                <button
                  onClick={fetchData}
                  className="inline-flex items-center px-3 py-1.5 bg-red-600 text-white rounded hover:bg-red-700"
                  title="Retry fetching data"
                >
                  <FiRefreshCcw className="mr-2" /> Retry
                </button>
              </div>
            </div>
          )}

          {/* Consent Overview */}
          <Card
            title="Consent Overview"
            icon={<FiPieChart className="text-blue-500" />}
            right={
              <div className="text-sm text-gray-500">
                {totals.total > 0 ? (
                  <span>
                    Total: <span className="font-semibold">{totals.total}</span>{" "}
                    · Accepted:{" "}
                    <span className="font-semibold">{totals.pctAccepted}%</span>{" "}
                    · Rejected:{" "}
                    <span className="font-semibold">{totals.pctRejected}%</span>{" "}
                    · Undecided:{" "}
                    <span className="font-semibold">
                      {totals.pctUndecided}%
                    </span>
                  </span>
                ) : null}
                <button
                  onClick={pieFs.toggle}
                  className="inline-flex items-center px-2 py-1 text-sm border rounded hover:bg-gray-50 ml-2"
                  title={pieFs.isFs ? "Exit fullscreen" : "Fullscreen"}
                  aria-pressed={pieFs.isFs}
                >
                  {pieFs.isFs ? <FiMinimize /> : <FiMaximize />}
                </button>
              </div>
            }
          >
            <div
              ref={pieFs.ref}
              className="h-64"
              style={{ height: pieFs.isFs ? "85vh" : undefined }}
            >
              {totals.total === 0 ? (
                <Empty>No consent data yet.</Empty>
              ) : (
                <ResponsivePie
                  data={consentPieData}
                  margin={{ top: 20, right: 60, bottom: 60, left: 60 }}
                  innerRadius={0.55}
                  padAngle={0.5}
                  activeOuterRadiusOffset={8}
                  colors={{ scheme: "nivo" }}
                  arcLinkLabelsSkipAngle={10}
                  arcLabelsSkipAngle={10}
                  arcLinkLabel={(d) => `${d.id}: ${d.value}`}
                  arcLinkLabelsTextColor="#374151"
                  arcLabelsTextColor={{
                    from: "color",
                    modifiers: [["darker", 2]],
                  }}
                  tooltip={({ datum }) => (
                    <div className="bg-white rounded shadow px-2 py-1 text-sm">
                      <strong>{datum.id}</strong>: {datum.value} (
                      {totals.total
                        ? Math.round((datum.value / totals.total) * 100)
                        : 0}
                      %)
                    </div>
                  )}
                />
              )}
            </div>
          </Card>

          {/* DSAR Requests */}
          <Card
            title="DSAR Requests"
            icon={<FiCheckCircle className="text-green-500" />}
          >
            {data?.dsar && Object.keys(data.dsar).length ? (
              <div className="grid grid-cols-3 gap-4 text-center">
                {Object.entries(data.dsar).map(([type, count]) => (
                  <div key={type} className="bg-gray-50 rounded p-3 shadow-sm">
                    <p className="text-xs uppercase tracking-wide text-gray-500">
                      {type}
                    </p>
                    <p className="text-2xl font-bold">{count}</p>
                  </div>
                ))}
              </div>
            ) : (
              <Empty>No DSAR activity for the selected period.</Empty>
            )}
          </Card>

          {/* Script Execution Status */}
          <Card
            title="Script Execution Status"
            icon={<FiBox className="text-yellow-500" />}
          >
            {scriptStatus.length === 0 ? (
              <Empty>No scripts scanned yet.</Empty>
            ) : (
              <div className="overflow-auto max-h-72">
                <table className="w-full text-sm border-collapse border">
                  <thead className="bg-gray-100 sticky top-0">
                    <tr>
                      <th className="text-left p-2">Script</th>
                      <th className="text-left p-2">Category</th>
                      <th className="text-left p-2">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {scriptStatus.map((s, idx) => (
                      <tr key={`${s.name}-${idx}`} className="border-t">
                        <td className="p-2 max-">{s.name}</td>
                        <td className="p-2 capitalize">{s.category}</td>
                        <td className="p-2 font-medium">
                          <span
                            className={`px-2 py-1 rounded text-xs ${
                              s.status === "allowed"
                                ? "bg-green-500 text-white"
                                : "bg-red-500 text-white"
                            }`}
                          >
                            {s.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>

          {/* Cookies by Category / Change / Activity */}
          <div className="lg:col-span-3 md:col-span-2 col-span-1">
            <Card
              title="Cookies by Category"
              icon={<FiBarChart2 className="text-purple-500" />}
              right={
                <div className="flex items-center gap-2">
                  <button
                    onClick={cookiesFs.toggle}
                    className="inline-flex items-center gap-2 rounded-lg border border-[#2B245C] bg-white px-3 py-1.5 font-medium text-[#2B245C] hover:bg-indigo-50 transition-all"
                    title={cookiesFs.isFs ? "Exit fullscreen" : "Fullscreen"}
                    aria-pressed={cookiesFs.isFs}
                  >
                    {cookiesFs.isFs ? <FiMinimize /> : <FiMaximize />}
                  </button>

                  {/* NEW: cookie card tabs */}
                  <select
                    value={cookieTab}
                    onChange={(e) => {
                      const v = e.target.value;
                      setCookieTab(v);
                      // keep legacy timeseries wired to /dashboard
                      if (v === "legacy") setCookieMode("timeseries");
                      else setCookieMode("snapshot");
                    }}
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-indigo-500 focus:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-indigo-200 transition-all"
                    aria-label="Cookie view"
                    title="Choose cookie view"
                  >
                    <option value="snapshot">Snapshot</option>
                    <option value="delta">Change (Δ)</option>
                    <option value="activity">Activity</option>
                    <option value="legacy">Timeseries</option>
                  </select>

                  {cookieTab === "legacy" && (
                    <>
                      <select
                        value={cookieGranularity}
                        onChange={(e) => setCookieGranularity(e.target.value)}
                        className="border rounded px-2 py-1 text-sm"
                        aria-label="Cookie granularity"
                      >
                        <option value="hour">Hour</option>
                        <option value="day">Day</option>
                        <option value="week">Week</option>
                      </select>

                      <select
                        value={cookieStrategy}
                        onChange={(e) => {
                          // you kept strategy state; if you want to wire it back to /dashboard add it to buildURL (it already is)
                          // @ts-ignore
                          setCookieStrategy?.(e.target.value);
                        }}
                        className="border rounded px-2 py-1 text-sm"
                        aria-label="Cookie data strategy"
                      >
                        <option value="latestJob">Latest job</option>
                        <option value="latestKnown">Latest known</option>
                      </select>

                      <select
                        value={cookieSeriesMode}
                        onChange={(e) => {
                          // @ts-ignore
                          setCookieSeriesMode?.(e.target.value);
                        }}
                        className="border rounded px-2 py-1 text-sm"
                        aria-label="Series mode"
                        title="How to plot series"
                      >
                        <option value="aggregated">Aggregated</option>
                        <option value="raw">Raw</option>
                      </select>
                    </>
                  )}

                  {/* Existing per-series controls remain useful for your original timeseries;
                  re-use granularity when viewing Activity */}
                  {cookieTab === "activity" && (
                    <select
                      value={cookieGranularity}
                      onChange={(e) => setCookieGranularity(e.target.value)}
                      className="border rounded px-2 py-1 text-sm"
                      aria-label="Cookie granularity"
                    >
                      {/* Note: hour not supported by activity facet */}
                      <option value="day">Day</option>
                      <option value="week">Week</option>
                    </select>
                  )}
                </div>
              }
            >
              <div
                ref={cookiesFs.ref}
                className="h-72"
                style={{ height: cookiesFs.isFs ? "85vh" : undefined }}
              >
                {/* SNAPSHOT (existing) */}
                {cookieTab === "snapshot" &&
                  (cookieBarData.length === 0 ? (
                    <Empty>No cookies detected yet.</Empty>
                  ) : (
                    <ResponsiveBar
                      data={cookieBarData}
                      keys={["count"]}
                      indexBy="category"
                      margin={{ top: 20, right: 20, bottom: 50, left: 60 }}
                      padding={0.3}
                      colors={{ scheme: "pastel1" }}
                      axisBottom={{ tickRotation: -35 }}
                      axisLeft={{
                        tickSize: 5,
                        tickPadding: 5,
                        legend: "count",
                        legendOffset: -45,
                        legendPosition: "middle",
                      }}
                      animate
                      tooltip={({ indexValue, value }) => (
                        <div className="bg-white rounded shadow px-2 py-1 text-sm">
                          <strong>{indexValue}</strong>: {value}
                        </div>
                      )}
                      role="application"
                      ariaLabel="Cookies by category bar chart"
                    />
                  ))}

                {/* CHANGE (Δ) — show latest job deltas by category as diverging bars */}
                {cookieTab === "delta" &&
                  (cookieInsightsLoading ? (
                    <Empty>Loading change data…</Empty>
                  ) : (
                    (() => {
                      const deltas = Array.isArray(cookieInsights?.deltas)
                        ? cookieInsights.deltas
                        : [];
                      if (!deltas.length)
                        return <Empty>No delta data available.</Empty>;

                      // pick the MOST RECENT job’s deltas
                      const lastJobAt = deltas.reduce(
                        (max, r) =>
                          Math.max(max, new Date(r.finishedAt).getTime()),
                        0,
                      );
                      const lastRows = deltas.filter(
                        (r) => new Date(r.finishedAt).getTime() === lastJobAt,
                      );

                      // build a single row with positive/negative values per category
                      const row = lastRows.reduce(
                        (acc, r) => {
                          const cat = r.category || "uncategorized";
                          acc[cat] = r.delta; // can be negative
                          return acc;
                        },
                        { id: "Δ vs previous scan" },
                      );

                      const categories = Object.keys(row).filter(
                        (k) => k !== "id",
                      );
                      if (!categories.length)
                        return <Empty>No changes in the latest scan.</Empty>;

                      return (
                        <ResponsiveBar
                          data={[row]}
                          keys={categories}
                          indexBy="id"
                          margin={{ top: 20, right: 20, bottom: 50, left: 60 }}
                          padding={0.3}
                          colors={{ scheme: "set2" }}
                          axisBottom={{ tickRotation: 0 }}
                          axisLeft={{
                            tickSize: 5,
                            tickPadding: 5,
                            legend: "Δ count (added + / removed −)",
                            legendOffset: -45,
                            legendPosition: "middle",
                          }}
                          enableGridY
                          labelSkipWidth={12}
                          labelSkipHeight={12}
                          labelTextColor={{
                            from: "color",
                            modifiers: [["darker", 2]],
                          }}
                          tooltip={({ id, value }) => (
                            <div className="bg-white rounded shadow px-2 py-1 text-sm">
                              <strong>{id}</strong>:{" "}
                              {value > 0 ? `+${value}` : value}
                            </div>
                          )}
                          role="application"
                          ariaLabel="Cookie category change since previous scan"
                        />
                      );
                    })()
                  ))}

                {/* ACTIVITY — line chart over time by category */}
                {cookieTab === "activity" &&
                  (cookieInsightsLoading ? (
                    <Empty>Loading activity…</Empty>
                  ) : (
                    (() => {
                      const rows = Array.isArray(cookieInsights?.activity)
                        ? cookieInsights.activity
                        : [];
                      if (!rows.length)
                        return <Empty>No activity data for this window.</Empty>;

                      // Build Nivo line series from { bucketStart, category, count }
                      const byCat = new Map();
                      for (const r of rows) {
                        const id = r.category || "uncategorized";
                        const x = new Date(r.bucketStart);
                        if (!byCat.has(id)) byCat.set(id, []);
                        byCat.get(id).push({ x, y: Number(r.count || 0) });
                      }
                      const series = Array.from(byCat.entries()).map(
                        ([id, pts]) => ({
                          id,
                          data: pts.sort((a, b) => a.x - b.x),
                        }),
                      );

                      return (
                        <ResponsiveLine
                          data={series}
                          xScale={{
                            type: "time",
                            format: "native",
                            precision: "day",
                          }}
                          xFormat="time:%b %d, %Y"
                          axisBottom={{
                            format:
                              cookieGranularity === "week" ? "%b %d" : "%b %d",
                            tickRotation: -60,
                            tickValues:
                              cookieGranularity === "week"
                                ? "every 1 week"
                                : "every 2 days",
                          }}
                          axisLeft={{
                            tickSize: 5,
                            tickPadding: 5,
                            legend: "count",
                            legendOffset: -45,
                            legendPosition: "middle",
                          }}
                          margin={{ top: 20, right: 140, bottom: 60, left: 60 }}
                          colors={{ scheme: "set2" }}
                          curve="monotoneX"
                          lineWidth={2}
                          pointSize={5}
                          pointBorderWidth={1}
                          enableArea
                          areaOpacity={0.08}
                          enableGridX={false}
                          enableGridY
                          useMesh
                          yScale={{ type: "linear", min: 0, stacked: false }}
                          role="application"
                          ariaLabel="Cookie scan activity over time"
                          legends={[
                            {
                              anchor: "bottom-right",
                              direction: "column",
                              translateX: 120,
                              itemWidth: 100,
                              itemHeight: 20,
                              symbolSize: 12,
                              symbolShape: "circle",
                            },
                          ]}
                        />
                      );
                    })()
                  ))}

                {/* LEGACY TIMESERIES — uses /dashboard cookieCategoriesOverTime */}
                {cookieTab === "legacy" &&
                  (!cookieSeries.length ? (
                    <Empty>No cookie timeseries in the selected window.</Empty>
                  ) : (
                    <ResponsiveLine
                      data={cookieSeries}
                      // --- time scale + formats ---
                      xScale={{
                        type: "time",
                        format: "native",
                        precision: timePrecision,
                      }}
                      xFormat={
                        cookieGranularity === "hour"
                          ? "time:%b %d, %Y %H:%M"
                          : "time:%b %d, %Y"
                      }
                      // --- axes ---
                      axisBottom={{
                        format:
                          cookieGranularity === "hour"
                            ? "%b %d %Hh"
                            : "%b %d, %Y",
                        tickRotation: -70,
                        tickValues:
                          cookieGranularity === "hour"
                            ? "every 6 hours"
                            : cookieGranularity === "week"
                              ? "every 1 week"
                              : "every 2 days",
                      }}
                      axisLeft={{
                        tickSize: 5,
                        tickPadding: 5,
                        legend: "count",
                        legendOffset: -45,
                        legendPosition: "middle",
                      }}
                      margin={{ top: 20, right: 140, bottom: 60, left: 60 }}
                      colors={{ scheme: "set2" }}
                      curve="monotoneX"
                      lineWidth={2}
                      pointSize={5}
                      pointBorderWidth={1}
                      enableArea
                      areaOpacity={0.08}
                      enableGridX={false}
                      enableGridY
                      useMesh
                      yScale={{ type: "linear", min: 0, stacked: false }}
                      role="application"
                      ariaLabel="Cookie categories over time (legacy)"
                      legends={[
                        {
                          anchor: "bottom-right",
                          direction: "column",
                          translateX: 120,
                          itemWidth: 100,
                          itemHeight: 20,
                          symbolSize: 12,
                          symbolShape: "circle",
                        },
                      ]}
                    />
                  ))}
              </div>
            </Card>
          </div>

          {/* Consent Activity Over Time */}
          <div className="lg:col-span-3 md:col-span-2 col-span-1">
            <Card
              title="Consent Activity Over Time"
              icon={<FiActivity className="text-indigo-500" />}
              right={
                <div className="flex items-center gap-2">
                  <button
                    onClick={consentFs.toggle}
                    className="inline-flex items-center gap-2 rounded-lg border border-[#2B245C] bg-white px-3 py-1.5 font-medium text-[#2B245C] hover:bg-indigo-50 transition-all"
                    title={consentFs.isFs ? "Exit fullscreen" : "Fullscreen"}
                    aria-pressed={consentFs.isFs}
                  >
                    {consentFs.isFs ? <FiMinimize /> : <FiMaximize />}
                  </button>
                  <select
                    value={range}
                    onChange={(e) => setRange(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-indigo-500 focus:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-indigo-200 transition-all"
                    aria-label="Select date range"
                  >
                    <option value="7d">Last 7d</option>
                    <option value="30d">Last 30d</option>
                    <option value="90d">Last 90d</option>
                    <option value="all">All time</option>
                  </select>
                  <button
                    onClick={handleExportCSV}
                    className="inline-flex items-center gap-2 rounded-lg border border-[#2B245C] bg-white px-3 py-1.5 text-sm font-medium text-[#2B245C] hover:bg-indigo-50 transition-all"
                    title="Download CSV"
                  >
                    <FiDownload /> CSV
                  </button>
                  <button
                    onClick={fetchData}
                    className="inline-flex items-center gap-2 rounded-lg border border-[#2B245C] bg-white px-3 py-1.5 text-sm font-medium text-[#2B245C] hover:bg-indigo-50 transition-all"
                    title="Refresh data"
                  >
                    <FiRefreshCcw /> Refresh
                  </button>
                </div>
              }
            >
              <div
                ref={consentFs.ref}
                className="h-72"
                style={{ height: consentFs.isFs ? "85vh" : undefined }}
              >
                {!consentSeries.length || !consentSeries[0]?.data?.length ? (
                  <Empty>No consent trend available.</Empty>
                ) : (
                  <ResponsiveLine
                    data={consentSeries}
                    xScale={{ type: "point" }}
                    yScale={{ type: "linear", min: 0, stacked: false }}
                    margin={{ top: 20, right: 20, bottom: 60, left: 60 }}
                    axisBottom={{ tickRotation: -35 }}
                    colors={{ scheme: "set2" }}
                    pointSize={7}
                    pointBorderWidth={1}
                    pointLabelYOffset={-12}
                    useMesh
                    tooltip={({ point }) => (
                      <div className="bg-white rounded shadow px-2 py-1 text-sm">
                        <strong>{point.data.xFormatted}</strong>:{" "}
                        {point.data.yFormatted}
                      </div>
                    )}
                    role="application"
                    ariaLabel="Consent activity over time"
                  />
                )}
              </div>
              <p className="mt-3 text-xs text-gray-500">
                {lastUpdated
                  ? `Last updated: ${lastUpdated.toLocaleString()}`
                  : null}
              </p>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

// import { useRouter } from 'next/router';
// import dynamic from 'next/dynamic';
// import { useEffect, useMemo, useState, useCallback, useRef } from 'react';
// import {
//   FiPieChart,
//   FiBarChart2,
//   FiActivity,
//   FiCheckCircle,
//   FiBox,
//   FiRefreshCcw,
//   FiDownload,
//   FiMaximize,
//   FiMinimize,
// } from 'react-icons/fi';
// import { baseurl, initURL } from '@/config/config';
// import CustomAxios from '@/config/CustomAxios';

// // ✅ Dynamically import Nivo to avoid SSR issues
// const ResponsivePie = dynamic(() => import('@nivo/pie').then(m => m.ResponsivePie), { ssr: false });
// const ResponsiveBar = dynamic(() => import('@nivo/bar').then(m => m.ResponsiveBar), { ssr: false });
// const ResponsiveLine = dynamic(() => import('@nivo/line').then(m => m.ResponsiveLine), { ssr: false });

// // ---- optional dummy data (dev/demo fallback) ----
// const DUMMY_DATA = {
//   consent: { accepted: 320, rejected: 110, undecided: 20 },
//   dsar: { access: 12, delete: 7, update: 5 },
//   cookieCategories: { necessary: 6, analytics: 9, marketing: 5 },
//   scriptStatus: [
//     { name: 'Google Analytics', category: 'analytics', status: 'blocked' },
//     { name: 'Meta Pixel', category: 'marketing', status: 'allowed' },
//   ],
//   consentOverTime: [
//     {
//       id: 'Consents', data: [
//         { x: '2025-07-20', y: 20 },
//         { x: '2025-07-21', y: 35 },
//         { x: '2025-07-22', y: 50 },
//         { x: '2025-07-23', y: 60 },
//         { x: '2025-07-24', y: 90 },
//         { x: '2025-07-25', y: 120 },
//       ]
//     },
//   ],
//   // optional demo timeseries
//   cookieCategoriesOverTime: [
//     { bucket: '2025-07-20T00:00:00.000Z', category: 'analytics', count: 2 },
//     { bucket: '2025-07-20T00:00:00.000Z', category: 'marketing', count: 1 },
//     { bucket: '2025-07-21T00:00:00.000Z', category: 'analytics', count: 3 },
//   ],
// };

// // ---- small UI helpers ----
// const Card = ({ title, icon, iconClass = '', children, right }) => (
//   <div className="bg-white rounded-lg p-4 shadow">
//     <div className="flex items-center justify-between mb-4">
//       <h2 className="text-lg font-semibold flex items-center">
//         {icon} <span className={`ml-2 ${iconClass}`}>{title}</span>
//       </h2>
//       {right}
//     </div>
//     {children}
//   </div>
// );

// const Skeleton = ({ className = '' }) => (
//   <div className={`animate-pulse bg-gray-200 rounded ${className}`} />
// );

// const Empty = ({ children }) => (
//   <div className="border border-dashed rounded p-6 text-center text-gray-500">{children}</div>
// );

// // cross-browser fullscreen helper
// function useFullscreen() {
//   const ref = useRef(null);
//   const [isFs, setIsFs] = useState(false);

//   const getFsEl = () =>
//     document.fullscreenElement ||
//     document.webkitFullscreenElement ||
//     document.mozFullScreenElement ||
//     document.msFullscreenElement;

//   const toggle = useCallback(async () => {
//     const el = ref.current;
//     if (!el) return;
//     const req =
//       el.requestFullscreen ||
//       el.webkitRequestFullscreen ||
//       el.mozRequestFullScreen ||
//       el.msRequestFullscreen;
//     const exit =
//       document.exitFullscreen ||
//       document.webkitExitFullscreen ||
//       document.mozCancelFullScreen ||
//       document.msExitFullscreen;

//     if (!getFsEl()) await req?.call(el);
//     else await exit?.call(document);
//   }, []);

//   useEffect(() => {
//     const onChange = () => {
//       setIsFs(getFsEl() === ref.current);
//       // nudge charts to recalc size
//       setTimeout(() => window.dispatchEvent(new Event('resize')), 50);
//     };
//     document.addEventListener('fullscreenchange', onChange);
//     document.addEventListener('webkitfullscreenchange', onChange);
//     document.addEventListener('mozfullscreenchange', onChange);
//     document.addEventListener('MSFullscreenChange', onChange);
//     return () => {
//       document.removeEventListener('fullscreenchange', onChange);
//       document.removeEventListener('webkitfullscreenchange', onChange);
//       document.removeEventListener('mozfullscreenchange', onChange);
//       document.removeEventListener('MSFullscreenChange', onChange);
//     };
//   }, []);

//   return { ref, isFs, toggle };
// }

// export default function WebsiteDashboard() {
//   const router = useRouter();
//   const { id, demo } = router.query;

//   const pieFs = useFullscreen();
//   const cookiesFs = useFullscreen();
//   const consentFs = useFullscreen();

//   const [data, setData] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [range, setRange] = useState('30d'); // 7d | 30d | 90d | all
//   const isMounted = useRef(true);
//   const [lastUpdated, setLastUpdated] = useState(null);

//   // timezone (browser)
//   const [timezone, setTimezone] = useState('UTC');
//   useEffect(() => {
//     try {
//       const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
//       setTimezone(tz);
//     } catch {
//       setTimezone('UTC');
//     }
//   }, []);

//   // Cookies controls
//   const [cookieMode, setCookieMode] = useState('snapshot'); // 'snapshot' | 'timeseries'
//   const [cookieGranularity, setCookieGranularity] = useState('day'); // 'hour' | 'day' | 'week'
//   const [cookieStrategy, setCookieStrategy] = useState('latestJob'); // 'latestJob' | 'latestKnown'
//   const [cookieSeriesMode, setCookieSeriesMode] = useState('aggregated'); // 'aggregated' | 'raw'

//   const buildURL = useCallback(() => {
//     const params = new URLSearchParams();
//     if (id) params.set('websiteId', id);
//     // consent toggles
//     params.set('overall', 'true');
//     params.set('perCategory', 'true');
//     // date window (use range as "from" unless all)
//     if (range !== 'all') params.set('from', range);
//     params.set('timezone', timezone);

//     // cookie toggles
//     if (cookieMode === 'timeseries') {
//       params.set('cookieTimeseries', 'true');
//       params.set('cookieGranularity', cookieGranularity);
//       params.set('cookieStrategy', cookieStrategy);
//     } else {
//       // snapshot path still accepts strategy
//       params.set('cookieStrategy', cookieStrategy);
//     }

//     return `${baseurl}/${initURL}/cmp/websites/dashboard?${params.toString()}`;
//   }, [id, range, timezone, cookieMode, cookieGranularity, cookieStrategy]);

//   const fetchData = useCallback(async () => {
//     if (!id && !demo) return;
//     setLoading(true);
//     setError(null);

//     const useDummy = !!demo || process.env.NODE_ENV === 'development';

//     if (useDummy && !id) {
//       setData(DUMMY_DATA);
//       setLoading(false);
//       setLastUpdated(new Date());
//       return;
//     }

//     const url = buildURL();
//     try {
//       const res = await CustomAxios.get(url, { timeout: 15000 });
//       const payload = res?.data ?? {};
//       if (!isMounted.current) return;

//       // defensive shape
//       const safe = {
//         consent: {
//           accepted: Number(payload?.consent?.accepted ?? 0),
//           rejected: Number(payload?.consent?.rejected ?? 0),
//           undecided: Number(payload?.consent?.undecided ?? 0),
//         },
//         dsar: payload?.dsar ?? { access: 0, delete: 0, update: 0 },
//         cookieCategories: payload?.cookieCategories ?? {},
//         cookieCategoriesOverTime: Array.isArray(payload?.cookieCategoriesOverTime)
//           ? payload.cookieCategoriesOverTime
//           : null,
//         scriptStatus: Array.isArray(payload?.scriptStatus) ? payload.scriptStatus : [],
//         consentOverTime: Array.isArray(payload?.consentOverTime) ? payload.consentOverTime : [],
//       };

//       setData(safe);
//       setLastUpdated(new Date());
//     } catch (err) {
//       console.error('Failed to fetch dashboard:', err);
//       // fall back to dummy so UI remains useful
//       setData(DUMMY_DATA);
//       setError(
//         err?.response?.data?.message ||
//         err?.message ||
//         'Something went wrong while loading the dashboard.'
//       );
//     } finally {
//       if (isMounted.current) setLoading(false);
//     }
//   }, [id, demo, buildURL]);

//   // initial + when router ready / id changes / toggles change
//   useEffect(() => {
//     isMounted.current = true;
//     if (router.isReady && (id || demo)) fetchData();
//     return () => { isMounted.current = false; };
//   }, [router.isReady, id, demo, fetchData]);

//   // optional gentle auto-refresh every 5 minutes (not when using demo)
//   useEffect(() => {
//     if (!id || demo) return;
//     const t = setInterval(fetchData, 5 * 60 * 1000);
//     return () => clearInterval(t);
//   }, [id, demo, fetchData]);

//   // ----------------- transforms -----------------
//   const totals = useMemo(() => {
//     const c = data?.consent || { accepted: 0, rejected: 0, undecided: 0 };
//     const total = c.accepted + c.rejected + c.undecided;
//     const pct = (n) => (total ? Math.round((n / total) * 100) : 0);
//     return { total, pctAccepted: pct(c.accepted), pctRejected: pct(c.rejected), pctUndecided: pct(c.undecided) };
//   }, [data]);

//   const consentPieData = useMemo(() => {
//     const c = data?.consent || { accepted: 0, rejected: 0, undecided: 0 };
//     return [
//       { id: 'Accepted', label: 'Accepted', value: c.accepted },
//       { id: 'Rejected', label: 'Rejected', value: c.rejected },
//       { id: 'Undecided', label: 'Undecided', value: c.undecided },
//     ];
//   }, [data]);

//   // Cookies snapshot bar data
//   const cookieBarData = useMemo(() => {
//     const cc = data?.cookieCategories || {};
//     return Object.entries(cc).map(([category, count]) => ({ category, count }));
//   }, [data]);
//   // const formatBucket = useCallback((iso) => {
//   //   if (!iso) return '';
//   //   if (cookieGranularity === 'hour') return iso.slice(0, 13).replace('T', ' ');
//   //   if (cookieGranularity === 'week') {
//   //     // label week by its Monday start (string)
//   //     const d = new Date(iso);
//   //     const monday = startOfUtcWeek(d, 1).toISOString().slice(0, 10);
//   //     return monday; // "YYYY-MM-DD" (week start)
//   //   }
//   //   return iso.slice(0, 10); // day
//   // }, [cookieGranularity]);

//   // const cookieSeries = useMemo(() => {
//   //   if (cookieMode !== 'timeseries') return [];
//   //   const rows = data?.cookieCategoriesOverTime || [];
//   //   const byCat = new Map();
//   //   for (const r of rows) {
//   //     const id = r.category || 'uncategorized';
//   //     const x = formatBucket(r.bucket); // string
//   //     if (!byCat.has(id)) byCat.set(id, []);
//   //     byCat.get(id).push({ x, y: r.count });
//   //   }
//   //   return Array.from(byCat.entries()).map(([id, points]) => ({
//   //     id,
//   //     data: points.sort((a, b) => (a.x < b.x ? -1 : a.x > b.x ? 1 : 0)),
//   //   }));
//   // }, [data, cookieMode, formatBucket]);

//   // Cookies timeseries line data
//   // --- time helpers (UTC) ---
//   const startOfUtcDay = (d) => {
//     const x = new Date(d);
//     x.setUTCHours(0, 0, 0, 0);
//     return x;
//   };

//   const startOfUtcWeek = (d, weekStartsOn = 1) => { // 1 = Monday
//     const x = startOfUtcDay(d);
//     const diff = (x.getUTCDay() - weekStartsOn + 7) % 7;
//     x.setUTCDate(x.getUTCDate() - diff);
//     return x;
//   };

//   // label normalization (handles "Uncategorized" vs "uncategorized")
//   const normalizeLabel = (s) => {
//     const t = (s || 'uncategorized').trim();
//     return t.charAt(0).toUpperCase() + t.slice(1).toLowerCase();
//   };

//   // --- build series (aggregate per category per aligned bucket) ---
//   const cookieSeries = useMemo(() => {
//     if (cookieMode !== 'timeseries') return [];
//     const rows = data?.cookieCategoriesOverTime || [];

//     // --- RAW: plot exactly what backend sent (no label normalization, no extra alignment/aggregation)
//     if (cookieSeriesMode === 'raw') {
//       const byCat = new Map();
//       for (const r of rows) {
//         const id = r.category ?? 'uncategorized';
//         const x = new Date(r.bucket);
//         if (!byCat.has(id)) byCat.set(id, []);
//         byCat.get(id).push({ x, y: Number(r.count || 0) });
//       }
//       return Array.from(byCat.entries()).map(([id, pts]) => ({
//         id,
//         data: pts.sort((a, b) => a.x - b.x),
//       }));
//     }

//     // --- AGGREGATED: normalize labels, align by granularity, and sum duplicates
//     const agg = new Map(); // key = `${label}__${alignedTs}`
//     for (const r of rows) {
//       const label = normalizeLabel(r.category);
//       let x = new Date(r.bucket);
//       if (cookieGranularity === 'hour') x.setUTCMinutes(0, 0, 0);
//       else if (cookieGranularity === 'day') x = startOfUtcDay(x);
//       else if (cookieGranularity === 'week') x = startOfUtcWeek(x, 1);
//       const key = `${label}__${x.getTime()}`;
//       agg.set(key, (agg.get(key) || 0) + Number(r.count || 0));
//     }
//     const byCat = new Map();
//     for (const [key, y] of agg.entries()) {
//       const [id, ts] = key.split('__');
//       const x = new Date(Number(ts));
//       if (!byCat.has(id)) byCat.set(id, []);
//       byCat.get(id).push({ x, y });
//     }
//     return Array.from(byCat.entries()).map(([id, pts]) => ({
//       id,
//       data: pts.sort((a, b) => a.x - b.x),
//     }));
//   }, [data, cookieMode, cookieGranularity, cookieSeriesMode]);

//   // --- chart (map 'week' -> 'day' for Nivo precision; keep weekly ticks) ---
//   const timePrecision = cookieGranularity === 'hour' ? 'hour' : 'day';

//   const scriptStatus = data?.scriptStatus || [];

//   // filter consent line series by selected range (client-side)
//   const consentSeries = useMemo(() => {
//     const series = Array.isArray(data?.consentOverTime) ? data.consentOverTime : [];
//     if (!series.length) return [];

//     const days = range === 'all' ? Infinity : Number(range.replace('d', ''));
//     const cutOff = days === Infinity ? null : new Date(Date.now() - days * 24 * 60 * 60 * 1000);

//     const fmt = (v) => {
//       const d = new Date(v);
//       return isNaN(d) ? v : d.toISOString().slice(0, 10);
//     };

//     return series.map(s => ({
//       ...s,
//       data: s.data
//         .filter(pt => !cutOff || new Date(pt.x) >= cutOff)
//         .map(pt => ({ x: fmt(pt.x), y: pt.y })),
//     }));
//   }, [data, range]);

//   // CSV export (current consentSeries only)
//   const handleExportCSV = useCallback(() => {
//     const s = consentSeries[0];
//     if (!s || !s.data?.length) return;
//     const rows = [['date', 'consents'], ...s.data.map(pt => [pt.x, pt.y])];
//     const csv = rows.map(r => r.join(',')).join('\n');
//     const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
//     const url = URL.createObjectURL(blob);
//     const a = document.createElement('a');
//     a.href = url;
//     a.download = `consent_over_time_${range}.csv`;
//     a.click();
//     URL.revokeObjectURL(url);
//   }, [consentSeries, range]);

//   // ----------------- loading state -----------------
//   if (loading) {
//     return (
//       <div className="min-h-screen bg-gray-100 p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//         {[...Array(5)].map((_, i) => (
//           <div key={i} className="bg-white rounded-lg p-4 shadow">
//             <Skeleton className="h-6 w-48 mb-4" />
//             <Skeleton className="h-40 w-full" />
//           </div>
//         ))}
//       </div>
//     );
//   }

//   // ----------------- main -----------------
//   return (
//     <div className="min-h-screen bg-gray-100 p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//       {/* Error banner (still shows UI using fallback data) */}
//       {error && (
//         <div
//           role="alert"
//           aria-live="polite"
//           className="md:col-span-2 lg:col-span-3 bg-red-50 border-l-4 border-red-500 text-red-800 p-4 rounded"
//         >
//           <div className="flex items-center justify-between">
//             <p>⚠️ We had trouble loading live data. Showing fallback data instead.</p>
//             <button
//               onClick={fetchData}
//               className="inline-flex items-center px-3 py-1.5 bg-red-600 text-white rounded hover:bg-red-700"
//               title="Retry fetching data"
//             >
//               <FiRefreshCcw className="mr-2" /> Retry
//             </button>
//           </div>
//         </div>
//       )}

//       {/* Consent Overview */}
//       <Card
//         title="Consent Overview"
//         icon={<FiPieChart className="text-blue-500" />}
//         right={
//           <div className="text-sm text-gray-500">
//             {totals.total > 0 ? (
//               <span>
//                 Total: <span className="font-semibold">{totals.total}</span> ·
//                 Accepted: <span className="font-semibold">{totals.pctAccepted}%</span> ·
//                 Rejected: <span className="font-semibold">{totals.pctRejected}%</span> ·
//                 Undecided: <span className="font-semibold">{totals.pctUndecided}%</span>
//               </span>
//             ) : null}
//             <button
//               onClick={pieFs.toggle}
//               className="inline-flex items-center px-2 py-1 text-sm border rounded hover:bg-gray-50"
//               title={pieFs.isFs ? 'Exit fullscreen' : 'Fullscreen'}
//               aria-pressed={pieFs.isFs}
//             >
//               {pieFs.isFs ? <FiMinimize /> : <FiMaximize />}
//             </button>
//           </div>
//         }
//       >
//         <div ref={pieFs.ref} className="h-64" style={{ height: pieFs.isFs ? '85vh' : undefined }}>
//           {totals.total === 0 ? (
//             <Empty>No consent data yet.</Empty>
//           ) : (
//             <ResponsivePie
//               data={consentPieData}
//               margin={{ top: 20, right: 60, bottom: 60, left: 60 }}
//               innerRadius={0.55}
//               padAngle={0.5}
//               activeOuterRadiusOffset={8}
//               colors={{ scheme: 'nivo' }}
//               arcLinkLabelsSkipAngle={10}
//               arcLabelsSkipAngle={10}
//               arcLinkLabel={(d) => `${d.id}: ${d.value}`}
//               arcLinkLabelsTextColor="#374151"
//               arcLabelsTextColor={{ from: 'color', modifiers: [['darker', 2]] }}
//               tooltip={({ datum }) => (
//                 <div className="bg-white rounded shadow px-2 py-1 text-sm">
//                   <strong>{datum.id}</strong>: {datum.value} (
//                   {totals.total ? Math.round((datum.value / totals.total) * 100) : 0}%)
//                 </div>
//               )}
//             />
//           )}
//         </div>
//       </Card>

//       {/* DSAR Requests */}
//       <Card title="DSAR Requests" icon={<FiCheckCircle className="text-green-500" />}>
//         {data?.dsar && Object.keys(data.dsar).length ? (
//           <div className="grid grid-cols-3 gap-4 text-center">
//             {Object.entries(data.dsar).map(([type, count]) => (
//               <div key={type} className="bg-gray-50 rounded p-3 shadow-sm">
//                 <p className="text-xs uppercase tracking-wide text-gray-500">{type}</p>
//                 <p className="text-2xl font-bold">{count}</p>
//               </div>
//             ))}
//           </div>
//         ) : (
//           <Empty>No DSAR activity for the selected period.</Empty>
//         )}
//       </Card>

//       {/* Script Execution Status */}
//       <Card title="Script Execution Status" icon={<FiBox className="text-yellow-500" />}>
//         {scriptStatus.length === 0 ? (
//           <Empty>No scripts scanned yet.</Empty>
//         ) : (
//           <div className="overflow-auto max-h-72">
//             <table className="w-full text-sm border-collapse border">
//               <thead className="bg-gray-100 sticky top-0">
//                 <tr>
//                   <th className="text-left p-2">Script</th>
//                   <th className="text-left p-2">Category</th>
//                   <th className="text-left p-2">Status</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {scriptStatus.map((s, idx) => (
//                   <tr key={`${s.name}-${idx}`} className="border-t">
//                     <td className="p-2 max-">{s.name}</td>
//                     <td className="p-2 capitalize">{s.category}</td>
//                     <td className="p-2 font-medium">
//                       <span
//                         className={`px-2 py-1 rounded text-xs ${s.status === 'allowed'
//                           ? 'bg-green-500 text-white'
//                           : 'bg-red-500 text-white'
//                           }`}
//                       >
//                         {s.status}
//                       </span>
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         )}
//       </Card>

//       {/* Cookies by Category / Over Time */}
//       <div className="lg:col-span-3 md:col-span-2 col-span-1">
//       <Card
//         title="Cookies by Category"
//         icon={<FiBarChart2 className="text-purple-500" />}
//         right={
//           <div className="flex items-center gap-2">
//             <button
//               onClick={cookiesFs.toggle}
//               className="inline-flex items-center px-2 py-1 text-sm border rounded hover:bg-gray-50"
//               title={cookiesFs.isFs ? 'Exit fullscreen' : 'Fullscreen'}
//               aria-pressed={cookiesFs.isFs}
//             >
//               {cookiesFs.isFs ? <FiMinimize /> : <FiMaximize />}
//             </button>
//             <select
//               value={cookieMode}
//               onChange={(e) => setCookieMode(e.target.value)}
//               className="border rounded px-2 py-1 text-sm"
//               aria-label="Cookie view mode"
//             >
//               <option value="snapshot">Snapshot</option>
//               <option value="timeseries">Timeseries</option>
//             </select>

//             {cookieMode === 'timeseries' && (
//               <>
//                 <select
//                   value={cookieGranularity}
//                   onChange={(e) => setCookieGranularity(e.target.value)}
//                   className="border rounded px-2 py-1 text-sm"
//                   aria-label="Cookie granularity"
//                 >
//                   <option value="hour">Hour</option>
//                   <option value="day">Day</option>
//                   <option value="week">Week</option>
//                 </select>

//                 <select
//                   value={cookieStrategy}
//                   onChange={(e) => setCookieStrategy(e.target.value)}
//                   className="border rounded px-2 py-1 text-sm"
//                   aria-label="Cookie data strategy"
//                 >
//                   <option value="latestJob">Latest job</option>
//                   <option value="latestKnown">Latest known</option>
//                 </select>
//                 <select
//                   value={cookieSeriesMode}
//                   onChange={(e) => setCookieSeriesMode(e.target.value)}
//                   className="border rounded px-2 py-1 text-sm"
//                   aria-label="Series mode"
//                   title="How to plot series"
//                 >
//                   <option value="aggregated">Aggregated</option>
//                   <option value="raw">Raw</option>
//                 </select>
//               </>
//             )}
//           </div>
//         }
//       >
//         <div ref={cookiesFs.ref} className="h-72" style={{ height: cookiesFs.isFs ? '85vh' : undefined }}>
//           {cookieMode === 'timeseries' ? (
//             !cookieSeries.length ? (
//               <Empty>No cookie timeseries in the selected window.</Empty>
//             ) : (

//              <ResponsiveLine
//   data={cookieSeries}
//   // --- time scale + formats ---
//   xScale={{ type: 'time', format: 'native', precision: timePrecision }}
//   xFormat={cookieGranularity === 'hour' ? 'time:%b %d, %Y %H:%M' : 'time:%b %d, %Y'}
//   // --- axes ---
//   axisBottom={{
//     format: cookieGranularity === 'hour' ? '%b %d %Hh' : '%b %d, %Y',
//     tickRotation: -70,
//     tickValues:
//       cookieGranularity === 'hour' ? 'every 6 hours'
//         : cookieGranularity === 'week' ? 'every 1 week'
//         : 'every 2 days',
//   }}
//   axisLeft={{
//     tickSize: 5,
//     tickPadding: 5,
//     legend: 'count',
//     legendOffset: -45,
//     legendPosition: 'middle',
//   }}
//   // --- visuals to match the last chart vibe ---
//   margin={{ top: 20, right: 140, bottom: 60, left: 60 }}
//   colors={{ scheme: 'set2' }}
//   // curve="monotoneX"
//   lineWidth={2}
//   pointSize={5}
//   pointBorderWidth={1}
//   enableArea
//   areaOpacity={0.08}
//   enableGridX={false}
//   enableGridY
//   useMesh
//   // --- y scale ---
//   yScale={{ type: 'linear', min: 0, stacked: false }}
//   // --- a11y ---
//   role="application"
//   ariaLabel="Cookie categories over time"
//   // --- nicer tooltip (local tz) ---
//   tooltip={({ point }) => {
//     const d = point.data.x; // Date object from our series
//     const when = point.data.xFormatted;
//     return (
//       <div className="bg-white rounded shadow px-2 py-1 text-sm">
//         <div className="font-semibold">{point.seriesId}</div>
//         <div>{when}: {point.data.yFormatted}</div>
//       </div>
//     );
//   }}
//   legends={[{
//     anchor: 'bottom-right',
//     direction: 'column',
//     translateX: 120,
//     itemWidth: 100,
//     itemHeight: 20,
//     symbolSize: 12,
//     symbolShape: 'circle',
//   }]}
// />

//             )
//           ) : (
//             // snapshot (bar)
//             <>
//               {cookieBarData.length === 0 ? (
//                 <Empty>No cookies detected yet.</Empty>
//               ) : (
//                 <ResponsiveBar
//                   data={cookieBarData}
//                   keys={['count']}
//                   indexBy="category"
//                   margin={{ top: 20, right: 20, bottom: 50, left: 60 }}
//                   padding={0.3}
//                   colors={{ scheme: 'pastel1' }}
//                   axisBottom={{ tickRotation: -35 }}
//                   axisLeft={{
//                     tickSize: 5,
//                     tickPadding: 5,
//                     legend: 'count',
//                     legendOffset: -45,
//                     legendPosition: 'middle',
//                   }}
//                   animate
//                   tooltip={({ indexValue, value }) => (
//                     <div className="bg-white rounded shadow px-2 py-1 text-sm">
//                       <strong>{indexValue}</strong>: {value}
//                     </div>
//                   )}
//                   role="application"
//                   ariaLabel="Cookies by category bar chart"
//                 />
//               )}
//             </>
//           )}
//         </div>
//       </Card>
//           </div>

//       {/* Consent Activity Over Time */}
//       <div className="lg:col-span-3 md:col-span-2 col-span-1">
//         <Card
//           title="Consent Activity Over Time"
//           icon={<FiActivity className="text-indigo-500" />}
//           right={
//             <div className="flex items-center gap-2">
//               <button
//                 onClick={consentFs.toggle}
//                 className="inline-flex items-center px-2 py-1 text-sm border rounded hover:bg-gray-50"
//                 title={consentFs.isFs ? 'Exit fullscreen' : 'Fullscreen'}
//                 aria-pressed={consentFs.isFs}
//               >
//                 {consentFs.isFs ? <FiMinimize /> : <FiMaximize />}
//               </button>
//               <select
//                 value={range}
//                 onChange={(e) => setRange(e.target.value)}
//                 className="border rounded px-2 py-1 text-sm"
//                 aria-label="Select date range"
//               >
//                 <option value="7d">Last 7d</option>
//                 <option value="30d">Last 30d</option>
//                 <option value="90d">Last 90d</option>
//                 <option value="all">All time</option>
//               </select>
//               <button
//                 onClick={handleExportCSV}
//                 className="inline-flex items-center px-2.5 py-1.5 text-sm border rounded hover:bg-gray-50"
//                 title="Download CSV"
//               >
//                 <FiDownload className="mr-1" /> CSV
//               </button>
//               <button
//                 onClick={fetchData}
//                 className="inline-flex items-center px-2.5 py-1.5 text-sm border rounded hover:bg-gray-50"
//                 title="Refresh data"
//               >
//                 <FiRefreshCcw className="mr-1" /> Refresh
//               </button>
//             </div>
//           }
//         >
//           <div ref={consentFs.ref} className="h-72" style={{ height: consentFs.isFs ? '85vh' : undefined }}>
//             {!consentSeries.length || !consentSeries[0]?.data?.length ? (
//               <Empty>No consent trend available.</Empty>
//             ) : (
//               <ResponsiveLine
//                 data={consentSeries}
//                 xScale={{ type: 'point' }}
//                 yScale={{ type: 'linear', min: 0, stacked: false }}
//                 margin={{ top: 20, right: 20, bottom: 60, left: 60 }}
//                 axisBottom={{ tickRotation: -35 }}
//                 colors={{ scheme: 'set2' }}
//                 pointSize={7}
//                 pointBorderWidth={1}
//                 pointLabelYOffset={-12}
//                 useMesh
//                 tooltip={({ point }) => (
//                   <div className="bg-white rounded shadow px-2 py-1 text-sm">
//                     <strong>{point.data.xFormatted}</strong>: {point.data.yFormatted}
//                   </div>
//                 )}
//                 role="application"
//                 ariaLabel="Consent activity over time"
//               />
//             )}
//           </div>
//           <p className="mt-3 text-xs text-gray-500">
//             {lastUpdated ? `Last updated: ${lastUpdated.toLocaleString()}` : null}
//           </p>
//         </Card>
//       </div>
//     </div>
//   );
// }
