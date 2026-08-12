import { useEffect, useMemo, useState } from "react";
import CustomAxios from "@/globalcomponents/CustomAxios";
import { baseurl, initURL } from "@/config/config";
import DataFlowNav from "../Nav";
import Link from "next/link";
import Cookies from "js-cookie";
import {
  FiLayers,
  FiTag,
  FiUsers,
  FiGrid,
  FiTarget,
  FiCheckCircle,
  FiAlertTriangle,
  FiRefreshCw,
} from "react-icons/fi";

/** ✅ Charts */
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

/**
 * APIs
 */
const API_CATEGORIES = `${baseurl}/${initURL}/dataflow/categories`;
const API_CLASSIFICATIONS = `${baseurl}/${initURL}/dataflow/classifications`;
const API_SUBJECT_TYPES = `${baseurl}/${initURL}/dataflow/subject-types`;
const API_ELEMENTS = `${baseurl}/${initURL}/dataflow/elements`;
const API_PURPOSES = `${baseurl}/${initURL}/dataflow/purposes`;

/**
 * Tenant id helper (subject-types requires x-tenant-id)
 */
function getTenantId() {
  const envTenant = process.env.NEXT_PUBLIC_TENANT_ID;
  if (envTenant) return envTenant;

  const stored = Cookies.get("user_data");
  if (!stored) return "";
  try {
    const u = JSON.parse(stored);
    return u?.tenant_id || u?.tenantId || u?.company_id || "";
  } catch {
    return "";
  }
}

function safeArr(x) {
  return Array.isArray(x) ? x : [];
}

function isArchivedRow(x) {
  return !!x?.archived || x?.status === "archived";
}

function countBy(arr, getKey) {
  const map = new Map();
  for (const it of safeArr(arr)) {
    const k = getKey(it);
    if (!k) continue;
    map.set(k, (map.get(k) || 0) + 1);
  }
  return map;
}

function topNFromCountMap(map, n = 8) {
  return Array.from(map.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, n)
    .map(([key, value]) => ({ key, value }));
}

function pct(part, total) {
  if (!total) return 0;
  return Math.round((part / total) * 100);
}

/**
 * Elegant small UI primitives
 */
function Badge({ children, tone = "neutral" }) {
  const tones = {
    neutral: "border-slate-200 bg-slate-50 text-slate-700",
    info: "border-indigo-200 bg-indigo-50 text-indigo-700",
    warn: "border-amber-200 bg-amber-50 text-amber-800",
    ok: "border-emerald-200 bg-emerald-50 text-emerald-800",
    danger: "border-rose-200 bg-rose-50 text-rose-700",
  };
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[12px] font-medium ${
        tones[tone] || tones.neutral
      }`}
    >
      {children}
    </span>
  );
}
function HeatMapGrid({ title, data, theme = "indigo", cols = 4 }) {
  const safeData = Array.isArray(data) ? data : [];
  const max = Math.max(...safeData.map((d) => (d?.value ? d.value : 0)), 1);

  // cute “soft but premium” hues
  const themeHue = {
    indigo: 232,
    rose: 345,
    sky: 200,
    emerald: 152,
    violet: 270,
  };

  const hue = themeHue[theme] ?? 232;

  // intensity -> background + border
  const tileStyle = (value) => {
    const v = Number(value) || 0;
    const p = Math.max(0, Math.min(1, v / max)); // 0..1
    const alpha = 0.12 + p * 0.55; // 0.12..0.67

    return {
      backgroundColor: `hsla(${hue}, 92%, 55%, ${alpha})`,
      borderColor: `hsla(${hue}, 92%, 40%, ${Math.min(0.25 + p * 0.45, 0.65)})`,
      color: p > 0.55 ? "white" : "rgb(15 23 42)",
    };
  };

  const gridColsClass =
    cols === 3
      ? "grid-cols-3"
      : cols === 4
        ? "grid-cols-4"
        : cols === 5
          ? "grid-cols-5"
          : cols === 6
            ? "grid-cols-6"
            : "grid-cols-4";

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_1px_0_rgba(15,23,42,0.04)]">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h3 className="text-base font-semibold text-slate-900">{title}</h3>
        <span className="text-sm text-slate-500">
          Top {safeData.length || 0}
        </span>
      </div>

      {!safeData.length ? (
        <div className="text-sm text-slate-500">No data found.</div>
      ) : (
        <div className={`grid ${gridColsClass} gap-3`}>
          {safeData.map((d, i) => (
            <div
              key={`${d?.name || "item"}-${i}`}
              className="group relative rounded-xl border px-3 py-3 transition-transform hover:-translate-y-[1px]"
              style={tileStyle(d?.value)}
              title={`${d?.name || "—"} • ${d?.value ?? 0}`}
            >
              <div className="text-xs font-semibold opacity-95 truncate">
                {d?.name || "—"}
              </div>

              <div className="mt-2 text-lg font-extrabold tabular-nums leading-none">
                {d?.value ?? 0}
              </div>

              {/* tiny tooltip on hover */}
              <div className="pointer-events-none absolute -top-2 left-1/2 hidden -translate-x-1/2 -translate-y-full rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs text-slate-700 shadow-lg group-hover:block">
                {d?.name || "—"} •{" "}
                <span className="font-semibold">{d?.value ?? 0}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* legend */}
      {safeData.length ? (
        <div className="mt-4 flex items-center gap-2 text-xs text-slate-500">
          <span className="h-2 w-10 rounded-full bg-slate-100" />
          <span>Lower</span>
          <span className="mx-1">→</span>
          <span
            className="h-2 w-10 rounded-full"
            style={{ backgroundColor: `hsla(${hue},92%,55%,0.65)` }}
          />
          <span>Higher</span>
        </div>
      ) : null}
    </div>
  );
}

function SectionCard({ title, right, children, theme = "neutral" }) {
  const themes = {
    neutral: {
      card: "bg-white border-slate-200 border-t-slate-200",
      head: "bg-white",
      title: "text-slate-900",
      right: "text-slate-600",
    },
    indigo: {
      card: "bg-indigo-50 border-indigo-100 border-t-indigo-500",
      head: "bg-indigo-50",
      title: "text-indigo-900",
      right: "text-indigo-700",
    },
    teal: {
      card: "bg-teal-50 border-teal-100 border-t-teal-500",
      head: "bg-teal-50",
      title: "text-teal-900",
      right: "text-teal-700",
    },
    amber: {
      card: "bg-amber-50 border-amber-100 border-t-amber-500",
      head: "bg-amber-50",
      title: "text-amber-900",
      right: "text-amber-800",
    },
    slate: {
      card: "bg-slate-50 border-slate-200 border-t-slate-500",
      head: "bg-slate-50",
      title: "text-slate-900",
      right: "text-slate-700",
    },
  };

  const t = themes[theme] || themes.neutral;

  return (
    <section
      className={`rounded-2xl border border-t-4 ${t.card} shadow-[0_1px_0_rgba(15,23,42,0.04)]`}
    >
      <div
        className={`flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-4 ${t.head}`}
      >
        <h2 className={`text-lg font-semibold ${t.title}`}>{title}</h2>
        {right ? <div className={`text-sm ${t.right}`}>{right}</div> : null}
      </div>
      <div className="p-5">{children}</div>
    </section>
  );
}

function StatTile({ label, value, sub, icon, theme = "indigo" }) {
  const themes = {
    indigo: {
      card: "bg-indigo-50 border-indigo-100 border-t-indigo-500",
      iconWrap: "bg-indigo-100 text-indigo-700 border-indigo-200",
      label: "text-indigo-700",
    },
    teal: {
      card: "bg-teal-50 border-teal-100 border-t-teal-500",
      iconWrap: "bg-teal-100 text-teal-700 border-teal-200",
      label: "text-teal-700",
    },
    amber: {
      card: "bg-amber-50 border-amber-100 border-t-amber-500",
      iconWrap: "bg-amber-100 text-amber-800 border-amber-200",
      label: "text-amber-800",
    },
  };

  const t = themes[theme] || themes.indigo;

  return (
    <div
      className={`rounded-2xl border border-t-4 ${t.card} p-5
      shadow-[0_1px_0_rgba(15,23,42,0.04)]
      hover:shadow-[0_10px_30px_rgba(15,23,42,0.08)]
      transition-shadow`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className={`text-sm font-semibold tracking-wide ${t.label}`}>
            {label}
          </div>

          <div className="mt-1 text-4xl font-bold text-slate-900">{value}</div>

          {sub ? (
            <div className="mt-1 text-sm text-slate-600">{sub}</div>
          ) : null}
        </div>

        <div className={`rounded-2xl border p-3 ${t.iconWrap}`}>{icon}</div>
      </div>
    </div>
  );
}

/** ---------- Chart wrappers ---------- */
function ChartCard({ title, right, children }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_1px_0_rgba(15,23,42,0.04)]">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h3 className="text-base font-semibold text-slate-900">{title}</h3>
        {right ? <div className="text-sm text-slate-600">{right}</div> : null}
      </div>
      {children}
    </div>
  );
}

function PieBlock({ data, colors, height = 240 }) {
  return (
    <div style={{ width: "100%", height }}>
      <ResponsiveContainer>
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            innerRadius={55}
            outerRadius={85}
            paddingAngle={3}
          >
            {data.map((_, i) => (
              <Cell key={i} fill={colors[i % colors.length]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

function HorizontalBarBlock({ data, height = 280 }) {
  // data: [{ name, value }]
  return (
    <div style={{ width: "100%", height }}>
      <ResponsiveContainer>
        <BarChart
          data={data}
          barSize={26}
          barCategoryGap={18}
          margin={{ top: 10, right: 16, left: 0, bottom: 0 }}
        >
          <XAxis
            dataKey="name"
            tick={{ fontSize: 12 }}
            axisLine={false}
            tickLine={false}
            height={28}
          />
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis type="number" />
          <YAxis
            type="category"
            dataKey="name"
            width={130}
            tick={{ fontSize: 12 }}
          />
          <Tooltip />
          <Bar dataKey="value" radius={[10, 10, 10, 10]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
function CoverageBarGraph({ data, height = 260 }) {
  // data: [{ name, mapped, unmapped, total, percent }]
  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;

    const mapped = payload.find((p) => p.dataKey === "mapped")?.value ?? 0;
    const unmapped = payload.find((p) => p.dataKey === "unmapped")?.value ?? 0;
    const total = mapped + unmapped;
    const percent = total ? Math.round((mapped / total) * 100) : 0;

    return (
      <div className="rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-lg">
        <div className="text-sm font-semibold text-slate-900">{label}</div>
        <div className="mt-1 space-y-1 text-xs text-slate-700">
          <div className="flex items-center justify-between gap-6">
            <span className="inline-flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              Mapped
            </span>
            <span className="font-semibold tabular-nums">{mapped}</span>
          </div>
          <div className="flex items-center justify-between gap-6">
            <span className="inline-flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-rose-400" />
              Unmapped
            </span>
            <span className="font-semibold tabular-nums">{unmapped}</span>
          </div>
          <div className="mt-1 pt-1 border-t border-slate-100 flex items-center justify-between">
            <span className="text-slate-600">Coverage</span>
            <span className="font-semibold tabular-nums">{percent}%</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div style={{ width: "100%", height }} className="rounded-2xl">
      <ResponsiveContainer>
        <BarChart
          data={data}
          barCategoryGap={22}
          margin={{ top: 18, right: 18, left: 0, bottom: 8 }}
        >
          <defs>
            {/* cute gradient for mapped */}
            <linearGradient id="gradMapped" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#34D399" />
              <stop offset="100%" stopColor="#10B981" />
            </linearGradient>

            {/* cute gradient for unmapped */}
            <linearGradient id="gradUnmapped" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#FCA5A5" />
              <stop offset="100%" stopColor="#FB7185" />
            </linearGradient>
          </defs>

          {/* soft grid only horizontal */}
          <CartesianGrid
            strokeDasharray="4 6"
            vertical={false}
            strokeOpacity={0.25}
          />

          <XAxis
            dataKey="name"
            tick={{ fontSize: 12 }}
            axisLine={false}
            tickLine={false}
          />

          <YAxis
            tickFormatter={(v) => `${v}`}
            tick={{ fontSize: 12 }}
            axisLine={false}
            tickLine={false}
            width={35}
          />

          <Tooltip content={<CustomTooltip />} />

          <Legend
            verticalAlign="top"
            height={28}
            wrapperStyle={{ fontSize: 12 }}
          />

          {/* stacked bars = mapped vs unmapped */}
          <Bar
            dataKey="mapped"
            name="Mapped"
            stackId="a"
            fill="url(#gradMapped)"
            radius={[14, 14, 0, 0]}
          />
          <Bar
            dataKey="unmapped"
            name="Unmapped"
            stackId="a"
            fill="url(#gradUnmapped)"
            radius={[0, 0, 14, 14]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function DataDictionaryDashboardContent({ embedded = false }) {
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [isClient, setIsClient] = useState(false);

  const [categories, setCategories] = useState([]);
  const [classifications, setClassifications] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [elements, setElements] = useState([]);
  const [purposes, setPurposes] = useState([]);

  const tenantId = useMemo(() => getTenantId(), []);

  useEffect(() => setIsClient(true), []);

  const fetchAll = async () => {
    try {
      setLoading(true);
      setErr("");

      const subjectHeaders =
        tenantId && tenantId.trim()
          ? { headers: { "x-tenant-id": tenantId } }
          : undefined;

      const [rCat, rCls, rSub, rEl, rPur] = await Promise.all([
        CustomAxios.get(API_CATEGORIES),
        CustomAxios.get(API_CLASSIFICATIONS),
        CustomAxios.get(API_SUBJECT_TYPES, subjectHeaders),
        CustomAxios.get(API_ELEMENTS),
        CustomAxios.get(API_PURPOSES),
      ]);

      setCategories(safeArr(rCat?.data));
      setClassifications(safeArr(rCls?.data));
      setSubjects(safeArr(rSub?.data));
      setElements(safeArr(rEl?.data));
      setPurposes(safeArr(rPur?.data));
    } catch (e) {
      setErr(e?.response?.data?.message || e?.message || "Failed to load.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /** Metrics */
  const catTotal = categories.length;
  const catArchived = categories.filter((x) => !!x?.archived).length;
  const catActive = catTotal - catArchived;

  const clsTotal = classifications.length;
  const clsArchived = classifications.filter((x) => !!x?.archived).length;
  const clsActive = clsTotal - clsArchived;

  const subTotal = subjects.length;
  const subArchived = subjects.filter((x) => isArchivedRow(x)).length;
  const subActive = subTotal - subArchived;

  const elTotal = elements.length;

  const purTotal = purposes.length;
  const purConsentYes = purposes.filter((p) => !!p?.requiresConsent).length;
  const purCoreYes = purposes.filter((p) => !!p?.isCorePurpose).length;
  const purOther = Math.max(0, purTotal - purConsentYes - purCoreYes);

  const elMissingCategories = elements.filter(
    (e) => !safeArr(e?.categories).length,
  ).length;
  const elMissingClassifications = elements.filter(
    (e) => !safeArr(e?.classifications).length,
  ).length;
  const elMissingSubjects = elements.filter(
    (e) => !safeArr(e?.subjects).length,
  ).length;

  const elMappedCategories = elTotal - elMissingCategories;
  const elMappedClassifications = elTotal - elMissingClassifications;
  const elMappedSubjects = elTotal - elMissingSubjects;

  const readinessScore = useMemo(() => {
    if (!elTotal) return 0;
    const catScore = pct(elMappedCategories, elTotal) * 0.3;
    const clsScore = pct(elMappedClassifications, elTotal) * 0.4;
    const subScore = pct(elMappedSubjects, elTotal) * 0.3;
    return Math.round(catScore + clsScore + subScore);
  }, [elTotal, elMappedCategories, elMappedClassifications, elMappedSubjects]);

  const readinessOK = readinessScore >= 80;

  /** Charts Data */
  const elementsPie = useMemo(() => {
    const mappedAny = elements.filter((e) => {
      const hasCat = safeArr(e?.categories).length > 0;
      const hasCls = safeArr(e?.classifications).length > 0;
      const hasSub = safeArr(e?.subjects).length > 0;
      return hasCat || hasCls || hasSub;
    }).length;

    const unmappedAll = Math.max(0, elTotal - mappedAny);

    return [
      { name: "Mapped (any)", value: mappedAny },
      { name: "Unmapped", value: unmappedAll },
    ];
  }, [elements, elTotal]);

  const purposesPie = useMemo(() => {
    return [
      { name: "Requires Consent", value: purConsentYes },
      { name: "Core Purpose", value: purCoreYes },
      { name: "Other", value: purOther },
    ];
  }, [purConsentYes, purCoreYes, purOther]);

  const readinessPie = useMemo(() => {
    // treat readiness as status pie (good vs needs work)
    return [
      { name: "Ready", value: readinessOK ? 1 : 0 },
      { name: "Needs Work", value: readinessOK ? 0 : 1 },
    ];
  }, [readinessOK]);

  const coverageBar = useMemo(() => {
    const safeTotal = elTotal || 0;

    const catMapped = elMappedCategories;
    const clsMapped = elMappedClassifications;
    const subMapped = elMappedSubjects;

    return [
      {
        name: "Categories",
        mapped: catMapped,
        unmapped: Math.max(0, safeTotal - catMapped),
        total: safeTotal,
        percent: pct(catMapped, safeTotal),
      },
      {
        name: "Classifications",
        mapped: clsMapped,
        unmapped: Math.max(0, safeTotal - clsMapped),
        total: safeTotal,
        percent: pct(clsMapped, safeTotal),
      },
      {
        name: "Subject Types",
        mapped: subMapped,
        unmapped: Math.max(0, safeTotal - subMapped),
        total: safeTotal,
        percent: pct(subMapped, safeTotal),
      },
    ];
  }, [elMappedCategories, elMappedClassifications, elMappedSubjects, elTotal]);

  const topCategories = useMemo(() => {
    const map = countBy(
      elements.flatMap((e) => safeArr(e?.categories)),
      (c) => c?.name || c?.label || c?.key,
    );
    return topNFromCountMap(map, 8).map((x) => ({
      name: x.key,
      value: x.value,
    }));
  }, [elements]);

  const topClassifications = useMemo(() => {
    const map = countBy(
      elements.flatMap((e) => safeArr(e?.classifications)),
      (c) => c?.name || c?.label,
    );
    return topNFromCountMap(map, 8).map((x) => ({
      name: x.key,
      value: x.value,
    }));
  }, [elements]);

  const topSubjects = useMemo(() => {
    const map = countBy(
      elements.flatMap((e) => safeArr(e?.subjects)),
      (s) => s?.name,
    );
    return topNFromCountMap(map, 8).map((x) => ({
      name: x.key,
      value: x.value,
    }));
  }, [elements]);

  const unmappedElements = useMemo(() => {
    return elements
      .map((e) => {
        const missing = [];
        if (!safeArr(e?.categories).length) missing.push("Category");
        if (!safeArr(e?.classifications).length) missing.push("Classification");
        if (!safeArr(e?.subjects).length) missing.push("Subject Type");
        return { _id: e?._id, name: e?.name, missing };
      })
      .filter((x) => x.missing.length > 0)
      .slice(0, 10);
  }, [elements]);

  const content = (
    <>
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
              className={`font-bold ${embedded ? "text-2xl text-[#2B245C]" : "text-3xl text-cyan-50"}`}
            >
              Data Dictionary
            </h1>
            <p
              className={`mt-1 text-sm ${embedded ? "text-slate-600" : "text-white"}`}
            >
              Overview of Categories, Classifications, Subject Types, Elements
              and Purposes.
            </p>
            {!tenantId ? (
              <div className="mt-3">
                <Badge tone="warn">
                  Subject Types may need x-tenant-id. Set NEXT_PUBLIC_TENANT_ID
                  or store tenant_id inside user_data cookie.
                </Badge>
              </div>
            ) : null}
          </div>

          <button
            type="button"
            onClick={fetchAll}
            className={`inline-flex items-center justify-center gap-2 rounded-lg  px-6 py-2.5 text-sm font-semibold shadow-md hover:shadow-lg transition-all ${embedded ? "bg-[#2B245C] text-white hover:bg-opacity-90" : "bg-white text-[#2B245C] hover:bg-blue-50"}`}
          >
            <FiRefreshCw />
            Refresh
          </button>
        </div>

        {err ? (
          <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {err}
          </div>
        ) : null}
      </div>

      {/* Loading */}
      {loading ? (
        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="rounded-2xl border border-slate-200 bg-white p-5"
            >
              <div className="h-3 w-28 rounded bg-slate-100 animate-pulse" />
              <div className="mt-3 h-10 w-20 rounded bg-slate-100 animate-pulse" />
              <div className="mt-3 h-3 w-40 rounded bg-slate-100 animate-pulse" />
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-6 space-y-6">
          {/* ✅ TOP 3 CARDS KEEP SAME */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <StatTile
              theme="indigo"
              label="Categories"
              value={catTotal}
              sub={`${catActive} active • ${catArchived} archived`}
              icon={<FiLayers size={18} />}
            />
            <StatTile
              theme="teal"
              label="Classifications"
              value={clsTotal}
              sub={`${clsActive} active • ${clsArchived} archived`}
              icon={<FiTag size={18} />}
            />
            <StatTile
              theme="amber"
              label="Subject Types"
              value={subTotal}
              sub={`${subActive} active • ${subArchived} archived`}
              icon={<FiUsers size={18} />}
            />
          </div>

          {/* ✅ BELOW 3 -> PIE CHARTS */}
          <SectionCard
            theme="slate"
            title="Overview Insights (Pie Charts)"
            right={<span className="font-medium">Graphical view</span>}
          >
            {!isClient ? (
              <div className="text-sm text-slate-600">Loading charts…</div>
            ) : (
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                <ChartCard title="Data Elements" right={`${elTotal} total`}>
                  <PieBlock
                    data={elementsPie}
                    colors={["#4F46E5", "#CBD5E1"]}
                  />
                  <div className="mt-2 text-sm text-slate-700">
                    <span className="font-semibold">{elTotal}</span> total
                    elements
                  </div>
                </ChartCard>

                <ChartCard title="Purposes" right={`${purTotal} total`}>
                  <PieBlock
                    data={purposesPie}
                    colors={["#0EA5E9", "#22C55E", "#94A3B8"]}
                  />
                  <div className="mt-2 text-sm text-slate-700">
                    Consent:{" "}
                    <span className="font-semibold">{purConsentYes}</span> •
                    Core: <span className="font-semibold">{purCoreYes}</span>
                  </div>
                </ChartCard>

                <ChartCard title="Readiness" right={`${readinessScore}%`}>
                  <PieBlock
                    data={readinessPie}
                    colors={["#22C55E", "#FB7185"]}
                  />
                  <div className="mt-2 flex items-center gap-2 text-sm">
                    {readinessOK ? (
                      <>
                        <FiCheckCircle className="text-emerald-600" />
                        <span className="text-slate-700">
                          Looks good (≥ 80%)
                        </span>
                      </>
                    ) : (
                      <>
                        <FiAlertTriangle className="text-rose-500" />
                        <span className="text-slate-700">
                          Improve mappings to reach 80%+
                        </span>
                      </>
                    )}
                  </div>
                </ChartCard>
              </div>
            )}
          </SectionCard>

          {/* ✅ Element Mapping Coverage -> GRAPH */}
          <SectionCard
            theme="indigo"
            title="Element Mapping Coverage (Graph)"
            right={<span className="font-medium">{elTotal} elements</span>}
          >
            {!isClient ? (
              <div className="text-sm text-slate-600">Loading chart…</div>
            ) : (
              <>
                <div className="mx-auto w-full max-w-5xl">
                  <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                    <CoverageBarGraph data={coverageBar} height={200} />
                  </div>
                </div>{" "}
                <div className="mt-3 flex flex-wrap gap-2">
                  <Badge tone="info">
                    Categories: {elMappedCategories}/{elTotal}
                  </Badge>
                  <Badge tone="info">
                    Classifications: {elMappedClassifications}/{elTotal}
                  </Badge>
                  <Badge tone="info">
                    Subject Types: {elMappedSubjects}/{elTotal}
                  </Badge>
                </div>
              </>
            )}
          </SectionCard>

          {/* ✅ Top 3 -> Graphical (Bar charts) */}
          {/* ✅ Top 3 -> HeatMap Grid */}
          <SectionCard theme="slate" title="Top Usage (HeatMap)">
            {!isClient ? (
              <div className="text-sm text-slate-600">Loading charts…</div>
            ) : (
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                <HeatMapGrid
                  title="Top Categories"
                  data={topCategories}
                  theme="indigo"
                  cols={4}
                />

                <HeatMapGrid
                  title="Top Classifications"
                  data={topClassifications}
                  theme="rose"
                  cols={4}
                />

                <HeatMapGrid
                  title="Top Subject Types"
                  data={topSubjects}
                  theme="sky"
                  cols={4}
                />
              </div>
            )}
          </SectionCard>

          {/* Needs attention (same) */}
          <SectionCard
            title="Elements needing attention"
            right={
              <span className="text-slate-500">
                showing {Math.min(10, unmappedElements.length)}
              </span>
            }
          >
            {unmappedElements.length === 0 ? (
              <div className="flex items-center gap-2">
                <Badge tone="ok">Clean</Badge>
                <span className="text-sm text-slate-700">
                  No unmapped elements found.
                </span>
              </div>
            ) : (
              <div className="overflow-auto rounded-xl border border-slate-200">
                <table className="min-w-full text-base">
                  <thead className="bg-slate-50 text-left text-slate-700 border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-3 font-semibold">Element</th>
                      <th className="px-4 py-3 font-semibold">Missing</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {unmappedElements.map((x) => (
                      <tr key={x._id || x.name} className="hover:bg-slate-50">
                        <td className="px-4 py-3">
                          {x.name || <span className="text-slate-400">—</span>}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap gap-2">
                            {x.missing.map((m) => (
                              <Badge key={m} tone="danger">
                                {m}
                              </Badge>
                            ))}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </SectionCard>

          {/* Quick links (same) */}
          <SectionCard title="Quick Actions">
            <div className="grid grid-cols-1 gap-3 md:grid-cols-5">
              <Link
                href="/admin/dataFlow/dataCategories"
                className="group rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 flex items-center justify-between 
                  text-base font-medium text-slate-800 hover:bg-white hover:shadow-sm transition-all"
              >
                <span>Data Categories</span>
                <span className="text-slate-400 group-hover:translate-x-1 transition">
                  →
                </span>
              </Link>

              <Link
                href="/admin/dataFlow/dataClassifications"
                className="group rounded-xl border border-violet-200 bg-violet-50 px-4 py-3 flex items-center justify-between 
                  text-base font-medium text-violet-900 hover:bg-white hover:shadow-sm transition-all"
              >
                <span>Data Classifications</span>
                <span className="text-violet-400 group-hover:translate-x-1 transition">
                  →
                </span>
              </Link>

              <Link
                href="/admin/dataFlow/dataSubjects"
                className="group rounded-xl border border-cyan-200 bg-cyan-50 px-4 py-3 flex items-center justify-between 
                  text-base font-medium text-cyan-900 hover:bg-white hover:shadow-sm transition-all"
              >
                <span>Data Subject Types</span>
                <span className="text-cyan-400 group-hover:translate-x-1 transition">
                  →
                </span>
              </Link>

              <Link
                href="/admin/dataFlow/dataElements"
                className="group rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 flex items-center justify-between 
                  text-base font-medium text-emerald-900 hover:bg-white hover:shadow-sm transition-all"
              >
                <span>Data Elements</span>
                <span className="text-emerald-400 group-hover:translate-x-1 transition">
                  →
                </span>
              </Link>

              <Link
                href="/admin/dataFlow/purposes/create"
                className="group rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 flex items-center justify-between 
                  text-base font-medium text-rose-900 hover:bg-white hover:shadow-sm transition-all"
              >
                <span>Purposes</span>
                <span className="text-rose-400 group-hover:translate-x-1 transition">
                  →
                </span>
              </Link>
            </div>
          </SectionCard>
        </div>
      )}
    </>
  );

  if (embedded) {
    return <div className="space-y-6">{content}</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <DataFlowNav />
      <div className="mx-5 min-h-screen bg-white rounded-lg p-5 my-3">
        {content}
      </div>
    </div>
  );
}

export default function DataDictionaryDashboard() {
  return <DataDictionaryDashboardContent />;
}
