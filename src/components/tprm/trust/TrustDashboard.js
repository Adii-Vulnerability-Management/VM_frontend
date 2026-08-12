import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  FiAlertTriangle,
  FiBarChart2,
  FiBriefcase,
  FiCalendar,
  FiCheckCircle,
  FiClock,
  FiFileText,
  FiRefreshCw,
  FiShield,
  FiTarget,
  FiUsers,
} from "react-icons/fi";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import CustomAxios from "@/globalcomponents/CustomAxios";
import Loader from "@/globalcomponents/NewUi/Loader";
import { getContracts } from "@/services/tprm/vendor/contracts";
import { getEngagements } from "@/services/tprm/vendor/engagements";
import { getActionItems, getFindings } from "@/services/tprm/vendor/findings";
import { getIssues } from "@/services/tprm/vendor/issues";

const CURRENT_YEAR = new Date().getFullYear();

const asArray = (data) => {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.docs)) return data.docs;
  if (Array.isArray(data?.body?.docs)) return data.body.docs;
  if (Array.isArray(data?.data?.docs)) return data.data.docs;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.questionnaires)) return data.questionnaires;
  return [];
};

const normalize = (value) =>
  String(value || "")
    .trim()
    .toLowerCase();

const isOpenStatus = (value) =>
  !["closed", "complete", "completed", "approved", "resolved", "done"].includes(
    normalize(value),
  );

const isActiveStatus = (value) =>
  !["inactive", "closed", "terminated", "expired", "deleted"].includes(
    normalize(value),
  );

const formatDate = (value) => {
  if (!value) return "-";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "-";
  return parsed.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const getDisplayName = (item, mode, fallback) =>
  mode === "vendor"
    ? item?.vendorName ||
      item?.companyName ||
      item?.name ||
      item?.legalName ||
      fallback
    : item?.clientName ||
      item?.customerName ||
      item?.companyName ||
      item?.name ||
      fallback;

const getRecordId = (item, mode) =>
  mode === "vendor"
    ? item?.vendorId || item?.thirdPartyId || item?._id
    : item?.clientId || item?._id;

const getOwner = (item, mode) =>
  mode === "vendor"
    ? item?.vendorAccountManagerName ||
      item?.vendorTPRMLeadName ||
      item?.accountManagerName ||
      item?.user_email ||
      "-"
    : item?.customerTPRMLeadName ||
      item?.clientAccountManagerName ||
      item?.responderManagerName ||
      item?.user_email ||
      "-";

const getAssessmentTypes = (item) =>
  Array.isArray(item?.assessmentTypes) ? item.assessmentTypes : [];

const getQuestionCount = (item) =>
  Number(
    item?.questionnairesLength ||
      item?.questionsLength ||
      item?.questionnaires?.length ||
      item?.questions?.length ||
      0,
  );

const countBy = (items, getter) => {
  const counts = new Map();

  items.forEach((item) => {
    const rawValue = getter(item);
    const value = rawValue || "Not specified";
    counts.set(value, (counts.get(value) || 0) + 1);
  });

  return Array.from(counts.entries())
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value);
};

function StatCard({ label, value, detail, icon: Icon, tone = "indigo" }) {
  const toneClass = {
    indigo: {
      bg: "from-indigo-500 to-violet-500",
      light: "bg-indigo-50",
      text: "text-indigo-600",
      border: "border-indigo-100",
      glow: "shadow-indigo-100",
    },
    cyan: {
      bg: "from-cyan-500 to-sky-500",
      light: "bg-cyan-50",
      text: "text-cyan-600",
      border: "border-cyan-100",
      glow: "shadow-cyan-100",
    },
    emerald: {
      bg: "from-emerald-500 to-green-500",
      light: "bg-emerald-50",
      text: "text-emerald-600",
      border: "border-emerald-100",
      glow: "shadow-emerald-100",
    },
    amber: {
      bg: "from-amber-500 to-orange-500",
      light: "bg-amber-50",
      text: "text-amber-600",
      border: "border-amber-100",
      glow: "shadow-amber-100",
    },
    rose: {
      bg: "from-rose-500 to-red-500",
      light: "bg-rose-50",
      text: "text-rose-600",
      border: "border-rose-100",
      glow: "shadow-rose-100",
    },
  }[tone];

  return (
    <div
      className={`
      relative overflow-hidden rounded-2xl
      border ${toneClass.border}
      bg-white
      p-6
      shadow-sm
      transition-all
      duration-300
      hover:-translate-y-1
      hover:shadow-xl
      ${toneClass.glow}
    `}
    >
      {/* Accent Line */}
      <div
        className={`absolute left-0 top-0 h-1 w-full bg-gradient-to-r ${toneClass.bg}`}
      />

      <div className="flex justify-between items-start">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] font-semibold text-slate-400">
            {label}
          </p>

          <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900">
            {value}
          </h2>

          <p className="mt-2 text-sm text-slate-500">{detail}</p>
        </div>

        <div
          className={`
          flex h-14 w-14 items-center justify-center
          rounded-2xl
          ${toneClass.light}
          backdrop-blur-sm
        `}
        >
          <Icon size={24} className={toneClass.text} />
        </div>
      </div>
    </div>
  );
}

function Section({ title, description, icon: Icon, children }) {
  return (
    <section className="rounded-2xl border border-[#2B245C] bg-white p-6 shadow-lg hover:shadow-2xl transition-shadow duration-300">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#2B245C]">{title}</h2>
          {description && (
            <p className="mt-1 text-sm leading-6 text-slate-500">
              {description}
            </p>
          )}
        </div>
        {Icon && <Icon className="mt-1 shrink-0 text-slate-400" size={22} />}
      </div>
      {children}
    </section>
  );
}

function ProgressBar({ label, value, total, color = "bg-indigo-600" }) {
  const percent = total > 0 ? Math.round((value / total) * 100) : 0;

  return (
    <div>
      <div className="mb-2 flex items-center justify-between text-sm">
        <span className="font-semibold text-slate-700">{label}</span>
        <span className="text-slate-500">
          {value}/{total} ({percent}%)
        </span>
      </div>
      <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
        <div
          className={`h-full rounded-full ${color}`}
          style={{ width: `${Math.min(percent, 100)}%` }}
        />
      </div>
    </div>
  );
}

const CHART_COLORS = [
  "#4f46e5",
  "#06b6d4",
  "#10b981",
  "#f59e0b",
  "#f43f5e",
  "#8b5cf6",
];

function DistributionDonut({ data, emptyText, centerLabel = "Total" }) {
  const chartData = data.filter((item) => item.value > 0);
  const total = chartData.reduce((sum, item) => sum + item.value, 0);

  if (!chartData.length) return <EmptyState text={emptyText} />;

  return (
    <div
      className="relative h-72 w-full"
      aria-label={`${centerLabel} distribution chart`}
    >
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            dataKey="value"
            nameKey="label"
            cx="50%"
            cy="45%"
            innerRadius={58}
            outerRadius={88}
            paddingAngle={3}
          >
            {chartData.map((item, index) => (
              <Cell
                key={item.label}
                fill={CHART_COLORS[index % CHART_COLORS.length]}
              />
            ))}
          </Pie>
          <Tooltip formatter={(value) => [value, "Records"]} />
          <Legend verticalAlign="bottom" iconType="circle" />
        </PieChart>
      </ResponsiveContainer>
      <div className="pointer-events-none absolute left-1/2 top-[45%] -translate-x-1/2 -translate-y-1/2 text-center">
        <p className="text-2xl font-bold text-slate-900">{total}</p>
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
          {centerLabel}
        </p>
      </div>
    </div>
  );
}

function DistributionBars({ data, emptyText }) {
  const chartData = data.filter((item) => item.value > 0).slice(0, 8);
  if (!chartData.length) return <EmptyState text={emptyText} />;

  return (
    <div className="h-72 w-full" aria-label="Distribution bar chart">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          layout="vertical"
          margin={{ left: 8, right: 18 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            horizontal={false}
            stroke="#e2e8f0"
          />
          <XAxis
            type="number"
            allowDecimals={false}
            tick={{ fill: "#64748b", fontSize: 12 }}
          />
          <YAxis
            type="category"
            dataKey="label"
            width={105}
            tick={{ fill: "#475569", fontSize: 12 }}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip
            formatter={(value) => [value, "Records"]}
            cursor={{ fill: "#f8fafc" }}
          />
          <Bar
            dataKey="value"
            fill="#06b6d4"
            radius={[0, 7, 7, 0]}
            barSize={18}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

function EmptyState({ text }) {
  return (
    <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">
      {text}
    </div>
  );
}

function Pill({ children, tone = "slate" }) {
  const toneClass = {
    slate: "bg-slate-50 text-slate-600 ring-slate-200",
    emerald: "bg-emerald-50 text-emerald-700 ring-emerald-100",
    amber: "bg-amber-50 text-amber-700 ring-amber-100",
    rose: "bg-rose-50 text-rose-700 ring-rose-100",
    indigo: "bg-indigo-50 text-indigo-700 ring-indigo-100",
    cyan: "bg-cyan-50 text-cyan-700 ring-cyan-100",
  }[tone];

  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-bold ring-1 ${toneClass}`}
    >
      {children}
    </span>
  );
}

function CompactList({ items, emptyText, renderItem }) {
  if (!items.length) return <EmptyState text={emptyText} />;
  return (
    <div className="max-h-[400px] space-y-3 overflow-y-auto pr-2">
      {items.map(renderItem)}
    </div>
  );
}

function RecordsTable({ records, mode, entityLabel, listLabel }) {
  if (!records.length) {
    return <EmptyState text={`No ${listLabel.toLowerCase()} found yet.`} />;
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="max-h-[500px] overflow-auto">
        <table className="min-w-full border-collapse text-sm">
          <thead className="sticky top-0 bg-slate-50/90 backdrop-blur-md border-b border-slate-200 text-left">
            <tr>
              <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                Name
              </th>
              {/* <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
              ID
            </th> */}
              <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                Scope
              </th>
              <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                Owner
              </th>
              <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500 text-center">
                Schedule
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {records.map((item, index) => (
              <tr
                key={item?._id || index}
                className="
              odd:bg-white
              even:bg-slate-50/40
              hover:bg-indigo-50/60
                transition-all
                duration-200
              "
              >
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100 font-bold text-indigo-700">
                      {getDisplayName(item, mode, entityLabel)
                        .charAt(0)
                        .toUpperCase()}
                    </div>

                    <div>
                      <p className="font-semibold text-slate-900">
                        {getDisplayName(
                          item,
                          mode,
                          `${entityLabel} ${index + 1}`,
                        )}
                      </p>

                      <p className="text-xs text-slate-500">
                        {getRecordId(item, mode) || "-"}
                      </p>
                    </div>
                  </div>
                </td>
                {/* <td className="px-4 py-3 text-slate-600">
                {getRecordId(item, mode) || "-"}
              </td> */}
                <td className="px-4 py-3">
                  <span
                    className="
                    inline-flex
                    rounded-full
                    bg-cyan-50
                    px-3
                    py-1
                    text-xs
                    font-semibold
                    text-cyan-700
                  "
                  >
                    {item?.scope || "Not Assigned"}
                  </span>
                </td>
                <td className="px-4 py-3 text-slate-600">
                  {getOwner(item, mode)}
                </td>
                <td className="px-6 py-4 text-center">
                  <Pill
                    tone={item?.isScheduledForCurrentYear ? "emerald" : "amber"}
                  >
                    {item?.isScheduledForCurrentYear
                      ? "Scheduled"
                      : "Not Scheduled"}
                  </Pill>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function TrustDashboard({
  mode,
  title,
  subtitle,
  listEndpoint,
  questionnaireEndpoint,
  questionnaireParams,
  listLabel,
}) {
  const [records, setRecords] = useState([]);
  const [questionnaires, setQuestionnaires] = useState([]);
  const [engagements, setEngagements] = useState([]);
  const [contracts, setContracts] = useState([]);
  const [findings, setFindings] = useState([]);
  const [actionItems, setActionItems] = useState([]);
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState([]);
  const [lastUpdated, setLastUpdated] = useState(null);

  const isVendor = mode === "vendor";
  const entityLabel = isVendor ? "Vendor" : "Customer";

  const fetchRecords = useCallback(async () => {
    const response = await CustomAxios.get(listEndpoint, {
      params: { page: 1, limit: 1000, date: CURRENT_YEAR },
    });
    return asArray(response?.data).filter((item) => !item?.is_deleted);
  }, [listEndpoint]);

  const fetchQuestionnaires = useCallback(async () => {
    if (!isVendor || !questionnaireEndpoint) return [];
    const response = await CustomAxios.get(questionnaireEndpoint, {
      params: questionnaireParams || {},
    });
    return asArray(response?.data).filter((item) => !item?.is_deleted);
  }, [isVendor, questionnaireEndpoint, questionnaireParams]);

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setErrors([]);

    const tasks = [
      ["records", fetchRecords()],
      [
        "questionnaires",
        isVendor ? fetchQuestionnaires() : Promise.resolve([]),
      ],
      ["engagements", isVendor ? getEngagements() : Promise.resolve([])],
      ["contracts", isVendor ? getContracts() : Promise.resolve([])],
      ["findings", isVendor ? getFindings() : Promise.resolve([])],
      ["actionItems", isVendor ? getActionItems() : Promise.resolve([])],
      ["issues", isVendor ? getIssues() : Promise.resolve([])],
    ];

    const results = await Promise.allSettled(tasks.map(([, task]) => task));
    const nextErrors = [];

    tasks.forEach(([key], index) => {
      const result = results[index];
      if (result.status === "rejected") {
        nextErrors.push(key);
        return;
      }

      const value = asArray(result.value).filter((item) => !item?.is_deleted);
      if (key === "records") setRecords(value);
      if (key === "questionnaires") setQuestionnaires(value);
      if (key === "engagements") setEngagements(value);
      if (key === "contracts") setContracts(value);
      if (key === "findings") setFindings(value);
      if (key === "actionItems") setActionItems(value);
      if (key === "issues") setIssues(value);
    });

    setErrors(nextErrors);
    setLastUpdated(new Date());
    setLoading(false);
  }, [fetchQuestionnaires, fetchRecords, isVendor]);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const summary = useMemo(() => {
    const scheduled = records.filter(
      (item) => item?.isScheduledForCurrentYear === true,
    );
    const unscheduled = records.filter(
      (item) => item?.isScheduledForCurrentYear !== true,
    );
    const withPlannedDates = records.filter(
      (item) => item?.plannedStartDate || item?.plannedEndDate,
    );
    const totalQuestions = questionnaires.reduce(
      (sum, item) => sum + getQuestionCount(item),
      0,
    );
    const activeEngagements = engagements.filter((item) =>
      isActiveStatus(item?.status),
    ).length;
    const highRiskEngagements = engagements.filter((item) =>
      ["high", "critical"].includes(normalize(item?.inherentRiskLevel)),
    ).length;
    const activeContracts = contracts.filter(
      (item) => normalize(item?.status) === "active",
    ).length;
    const expiringContracts = contracts.filter((item) => {
      if (!item?.expiryDate) return false;
      const expiry = new Date(item.expiryDate).getTime();
      const now = Date.now();
      const in90Days = now + 90 * 24 * 60 * 60 * 1000;
      return expiry >= now && expiry <= in90Days;
    }).length;
    const openFindings = findings.filter((item) =>
      isOpenStatus(item?.status),
    ).length;
    const openActionItems = actionItems.filter((item) =>
      isOpenStatus(item?.status),
    ).length;
    const openIssues = issues.filter((item) =>
      isOpenStatus(item?.status),
    ).length;
    const customerContacts = records.filter(
      (item) =>
        item?.customerTPRMLeadEmail ||
        item?.responderManagerEmail ||
        item?.directorEmail,
    ).length;
    const scopedRecords = records.filter(
      (item) => item?.scope || getAssessmentTypes(item).length > 0,
    ).length;

    return {
      totalRecords: records.length,
      scheduled: scheduled.length,
      unscheduled: unscheduled.length,
      withPlannedDates: withPlannedDates.length,
      questionnaireCount: questionnaires.length,
      totalQuestions,
      activeEngagements,
      highRiskEngagements,
      activeContracts,
      expiringContracts,
      openFindings,
      openActionItems,
      openIssues,
      openRemediation: openFindings + openActionItems + openIssues,
      totalEngagements: engagements.length,
      totalContracts: contracts.length,
      totalFindings: findings.length,
      totalActionItems: actionItems.length,
      totalIssues: issues.length,
      customerContacts,
      scopedRecords,
    };
  }, [
    actionItems,
    contracts,
    engagements,
    findings,
    issues,
    questionnaires,
    records,
  ]);

  const assessmentDistribution = useMemo(() => {
    const counts = new Map();

    records.forEach((item) => {
      const types = getAssessmentTypes(item);
      if (types.length === 0) {
        counts.set("Not specified", (counts.get("Not specified") || 0) + 1);
        return;
      }

      types.forEach((type) => {
        counts.set(type, (counts.get(type) || 0) + 1);
      });
    });

    return Array.from(counts.entries())
      .map(([label, value]) => ({ label, value }))
      .sort((a, b) => b.value - a.value);
  }, [records]);

  const scopeDistribution = useMemo(
    () => countBy(records, (item) => item?.scope),
    [records],
  );

  const engagementRiskDistribution = useMemo(
    () =>
      countBy(engagements, (item) =>
        item?.inherentRiskLevel
          ? String(item.inherentRiskLevel).toUpperCase()
          : "Unrated",
      ),
    [engagements],
  );

  const contractStatusDistribution = useMemo(
    () =>
      countBy(contracts, (item) =>
        item?.status ? String(item.status).toUpperCase() : "Draft",
      ),
    [contracts],
  );

  const customerContacts = useMemo(
    () =>
      records
        .filter(
          (item) =>
            item?.customerTPRMLeadName ||
            item?.clientAccountManagerName ||
            item?.responderManagerName ||
            item?.directorName,
        )
        .slice(0, 6),
    [records],
  );

  const recentRecords = useMemo(
    () =>
      [...records]
        .sort(
          (a, b) =>
            new Date(b?.updatedAt || b?.createdAt || 0) -
            new Date(a?.updatedAt || a?.createdAt || 0),
        )
        .slice(0, 6),
    [records],
  );

  const recentQuestionnaires = useMemo(
    () =>
      [...questionnaires]
        .sort(
          (a, b) =>
            new Date(b?.updatedAt || b?.createdAt || 0) -
            new Date(a?.updatedAt || a?.createdAt || 0),
        )
        .slice(0, 5),
    [questionnaires],
  );

  const scheduledRecords = useMemo(
    () =>
      records
        .filter((item) => item?.isScheduledForCurrentYear)
        .sort(
          (a, b) =>
            new Date(a?.plannedStartDate || a?.createdAt || 0) -
            new Date(b?.plannedStartDate || b?.createdAt || 0),
        )
        .slice(0, 5),
    [records],
  );

  const recentEngagements = useMemo(
    () =>
      [...engagements]
        .sort(
          (a, b) =>
            new Date(b?.updatedAt || b?.createdAt || 0) -
            new Date(a?.updatedAt || a?.createdAt || 0),
        )
        .slice(0, 4),
    [engagements],
  );

  const recentContracts = useMemo(
    () =>
      [...contracts]
        .sort(
          (a, b) =>
            new Date(a?.expiryDate || a?.updatedAt || 0) -
            new Date(b?.expiryDate || b?.updatedAt || 0),
        )
        .slice(0, 4),
    [contracts],
  );

  const openFindingsAndIssues = useMemo(
    () =>
      [
        ...findings.map((item) => ({ ...item, workType: "Finding" })),
        ...actionItems.map((item) => ({ ...item, workType: "Action Item" })),
        ...issues.map((item) => ({ ...item, workType: "Issue" })),
      ]
        .filter((item) => isOpenStatus(item?.status))
        .slice(0, 6),
    [actionItems, findings, issues],
  );

  const statCards = isVendor
    ? [
        {
          label: "Vendors",
          value: summary.totalRecords,
          detail: `${summary.scheduled} scheduled this year`,
          icon: FiUsers,
          tone: "indigo",
        },
        {
          label: "Engagements",
          value: summary.activeEngagements,
          detail: `${summary.highRiskEngagements} high or critical risk`,
          icon: FiBriefcase,
          tone: "cyan",
        },
        {
          label: "Contracts",
          value: summary.totalContracts,
          detail: `${summary.expiringContracts} expiring within 90 days`,
          icon: FiFileText,
          tone: "emerald",
        },
        {
          label: "Findings & Issues",
          value: summary.openRemediation,
          detail: "Open findings, action items, and issues",
          icon: FiAlertTriangle,
          tone: "rose",
        },
      ]
    : [
        {
          label: "Customers",
          value: summary.totalRecords,
          detail: `${summary.scheduled} scheduled this year`,
          icon: FiUsers,
          tone: "indigo",
        },
        {
          label: "Scheduled",
          value: summary.scheduled,
          detail: `${summary.unscheduled} not scheduled`,
          icon: FiCalendar,
          tone: "emerald",
        },
        {
          label: "Planned Dates",
          value: summary.withPlannedDates,
          detail: "Customers with planned schedule dates",
          icon: FiClock,
          tone: "cyan",
        },
        {
          label: "Contacts Ready",
          value: summary.customerContacts,
          detail: `${summary.scopedRecords} customers have scope or assessment areas`,
          icon: FiTarget,
          tone: "amber",
        },
      ];

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="mx-5 min-h-screen bg-white rounded-lg p-5 my-3">
        <section className="px-6 py-8 bg-[#2B245C] rounded-2xl shadow-lg hover:shadow-2xl transition-shadow duration-300">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-cyan-50">{title}</h1>
              <p className="mt-1 text-sm text-white">{subtitle}</p>
            </div>
            <button
              type="button"
              onClick={loadDashboard}
              className="inline-flex w-fit items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-bold text-[#241a58] shadow-sm hover:bg-blue-50"
            >
              <FiRefreshCw />
              Refresh
            </button>
          </div>
        </section>

        {loading ? (
          <div className="flex min-h-[420px] items-center justify-center">
            <Loader />
          </div>
        ) : (
          <div className="mt-5 space-y-5">
            {errors.length > 0 && (
              <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                Some dashboard data could not be loaded: {errors.join(", ")}.
              </div>
            )}

            <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
              {statCards.map((card) => (
                <StatCard key={card.label} {...card} />
              ))}
            </section>

            {isVendor ? (
              <>
                <section className="grid grid-cols-1 gap-5 xl:grid-cols-2">
                  <Section
                    title="Engagement Risk Mix"
                    description="A visual split of inherent risk ratings across vendor engagements."
                    icon={FiAlertTriangle}
                  >
                    <DistributionDonut
                      data={engagementRiskDistribution}
                      emptyText="No engagement risk data found yet."
                      centerLabel="Engagements"
                    />
                  </Section>
                  <Section
                    title="Contract Status Mix"
                    description="Contract volume by current status for quick coverage review."
                    icon={FiShield}
                  >
                    <DistributionBars
                      data={contractStatusDistribution}
                      emptyText="No contract status data found yet."
                    />
                  </Section>
                </section>

                {/* <section className="grid grid-cols-1 gap-5 xl:grid-cols-2">
                  <Section
                    title="Engagements"
                    description="Active vendor engagements with inherent risk and scope."
                    icon={FiBriefcase}
                  >
                    <CompactList
                      items={recentEngagements}
                      emptyText="No engagements found yet."
                      renderItem={(item, index) => (
                        <div
                          key={item?._id || index}
                          className="rounded-lg border border-slate-100 bg-slate-50 px-4 py-3"
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <p className="font-bold text-slate-900">
                                {item?.name || `Engagement ${index + 1}`}
                              </p>
                              <p className="mt-1 text-xs text-slate-500">
                                {item?.scope || "No scope"} - Score{" "}
                                {item?.inherentRiskScore ?? "-"}
                              </p>
                            </div>
                            <Pill
                              tone={
                                ["HIGH", "CRITICAL"].includes(
                                  String(
                                    item?.inherentRiskLevel || "",
                                  ).toUpperCase(),
                                )
                                  ? "rose"
                                  : "indigo"
                              }
                            >
                              {item?.inherentRiskLevel || "Unrated"}
                            </Pill>
                          </div>
                        </div>
                      )}
                    />
                  </Section>

                  <Section
                    title="Contracts"
                    description="Contract coverage and upcoming expiry attention."
                    icon={FiShield}
                  >
                    <CompactList
                      items={recentContracts}
                      emptyText="No contracts found yet."
                      renderItem={(item, index) => (
                        <div
                          key={item?._id || index}
                          className="rounded-lg border border-slate-100 bg-slate-50 px-4 py-3"
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <p className="font-bold text-slate-900">
                                {item?.name || `Contract ${index + 1}`}
                              </p>
                              <p className="mt-1 text-xs text-slate-500">
                                {item?.contractType || "Contract"} - Expires{" "}
                                {formatDate(item?.expiryDate)}
                              </p>
                            </div>
                            <Pill
                              tone={
                                normalize(item?.status) === "active"
                                  ? "emerald"
                                  : "slate"
                              }
                            >
                              {item?.status || "Draft"}
                            </Pill>
                          </div>
                        </div>
                      )}
                    />
                  </Section>
                </section> */}

                <section className="grid grid-cols-1 gap-5 xl:grid-cols-[1.1fr_0.9fr]">
                  <Section
                    title="Findings, Action Items & Issues"
                    description="Open remediation work across Vendor Trust."
                    icon={FiAlertTriangle}
                  >
                    <CompactList
                      items={openFindingsAndIssues}
                      emptyText="No open findings, action items, or issues."
                      renderItem={(item, index) => (
                        <div
                          key={`${item?.workType}-${item?._id || index}`}
                          className="rounded-lg border border-slate-100 bg-slate-50 px-4 py-3"
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <p className="font-bold text-slate-900">
                                {item?.title ||
                                  `${item?.workType} ${index + 1}`}
                              </p>
                              <p className="mt-1 text-xs text-slate-500">
                                {item?.workType} -{" "}
                                {item?.owner ||
                                  item?.ownerUserId ||
                                  "Unassigned"}
                              </p>
                            </div>
                            <Pill tone="amber">{item?.status || "OPEN"}</Pill>
                          </div>
                        </div>
                      )}
                    />
                  </Section>

                  <Section
                    title="Vendor Assessment Coverage"
                    description="Scheduling and questionnaire coverage for vendor assessments."
                    icon={FiBarChart2}
                  >
                    <div className="space-y-5">
                      <ProgressBar
                        label="Scheduled this year"
                        value={summary.scheduled}
                        total={Math.max(summary.totalRecords, 1)}
                        color="bg-emerald-500"
                      />
                      <ProgressBar
                        label="With planned dates"
                        value={summary.withPlannedDates}
                        total={Math.max(summary.totalRecords, 1)}
                        color="bg-indigo-600"
                      />
                      <ProgressBar
                        label="Questionnaire sets available"
                        value={summary.questionnaireCount}
                        total={Math.max(summary.questionnaireCount, 1)}
                        color="bg-cyan-500"
                      />
                    </div>
                    {lastUpdated && (
                      <p className="mt-4 flex items-center gap-2 text-xs text-slate-500">
                        <FiClock />
                        Last refreshed {lastUpdated.toLocaleTimeString()}
                      </p>
                    )}
                  </Section>
                </section>

                {/* <section className="grid grid-cols-1 gap-5 xl:grid-cols-3">
                <Section
                  title="Vendor Workstream Totals"
                  description="All major Vendor Trust records loaded into this dashboard."
                  icon={FiBarChart2}
                >
                  <div className="grid gap-3 sm:grid-cols-2">
                    {[
                      ["Vendors", summary.totalRecords, "indigo"],
                      ["Engagements", summary.totalEngagements, "cyan"],
                      ["Contracts", summary.totalContracts, "emerald"],
                      ["Findings", summary.totalFindings, "amber"],
                      ["Action Items", summary.totalActionItems, "rose"],
                      ["Issues", summary.totalIssues, "rose"],
                    ].map(([label, value, tone]) => (
                      <div
                        key={label}
                        className="rounded-lg border border-slate-100 bg-slate-50 px-4 py-3"
                      >
                        <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                          {label}
                        </p>
                        <div className="mt-2 flex items-center justify-between">
                          <span className="text-2xl font-bold text-slate-950">
                            {value}
                          </span>
                          <Pill tone={tone}>{label}</Pill>
                        </div>
                      </div>
                    ))}
                  </div>
                </Section>

                <Section
                  title="Engagement Risk"
                  description="Risk levels across vendor engagements."
                  icon={FiAlertTriangle}
                >
                  <div className="space-y-4">
                    {engagementRiskDistribution.length ? (
                      engagementRiskDistribution.map((item) => (
                        <ProgressBar
                          key={item.label}
                          label={item.label}
                          value={item.value}
                          total={Math.max(summary.totalEngagements, 1)}
                          color={
                            ["HIGH", "CRITICAL"].includes(item.label)
                              ? "bg-rose-500"
                              : "bg-indigo-600"
                          }
                        />
                      ))
                    ) : (
                      <EmptyState text="No engagement risk data found yet." />
                    )}
                  </div>
                </Section>

                <Section
                  title="Contract Status"
                  description="Current contract states and expiry awareness."
                  icon={FiShield}
                >
                  <div className="space-y-4">
                    {contractStatusDistribution.length ? (
                      contractStatusDistribution.map((item) => (
                        <ProgressBar
                          key={item.label}
                          label={item.label}
                          value={item.value}
                          total={Math.max(summary.totalContracts, 1)}
                          color={
                            item.label === "ACTIVE"
                              ? "bg-emerald-500"
                              : "bg-slate-500"
                          }
                        />
                      ))
                    ) : (
                      <EmptyState text="No contract status data found yet." />
                    )}
                  </div>
                </Section>
              </section> */}
              </>
            ) : (
              <>
                <section className="grid grid-cols-1 gap-5 xl:grid-cols-2">
                  <Section
                    title="Customer Scheduling Coverage"
                    description="Customer Trust scheduling readiness from client records and schedule dates."
                    icon={FiBarChart2}
                  >
                    <DistributionDonut
                      data={[
                        { label: "Scheduled", value: summary.scheduled },
                        { label: "Not Scheduled", value: summary.unscheduled },
                      ]}
                      emptyText="No customer scheduling data found yet."
                      centerLabel="Customers"
                    />
                    <div className="mt-2 space-y-5">
                      <ProgressBar
                        label="Scheduled this year"
                        value={summary.scheduled}
                        total={Math.max(summary.totalRecords, 1)}
                        color="bg-emerald-500"
                      />
                      <ProgressBar
                        label="With planned dates"
                        value={summary.withPlannedDates}
                        total={Math.max(summary.totalRecords, 1)}
                        color="bg-indigo-600"
                      />
                      <ProgressBar
                        label="With scope or assessment areas"
                        value={summary.scopedRecords}
                        total={Math.max(summary.totalRecords, 1)}
                        color="bg-cyan-500"
                      />
                    </div>
                  </Section>

                  <Section
                    title="Assessment Areas"
                    description="Assessment types selected on customer records."
                    icon={FiTarget}
                  >
                    <DistributionBars
                      data={assessmentDistribution}
                      emptyText="No assessment area data found yet."
                    />
                    {lastUpdated && (
                      <p className="mt-4 flex items-center gap-2 text-xs text-slate-500">
                        <FiClock />
                        Last refreshed {lastUpdated.toLocaleTimeString()}
                      </p>
                    )}
                  </Section>
                </section>

                <section className="grid grid-cols-1 gap-5 xl:grid-cols-2">
                  {/* <Section
                    title="Customer Contacts"
                    description="Primary customer, responder, and director ownership captured on client records."
                    icon={FiUsers}
                  >
                    <CompactList
                      items={customerContacts}
                      emptyText="No customer contact details found yet."
                      renderItem={(item, index) => (
                        <div
                          key={item?._id || index}
                          className="rounded-lg border border-slate-100 bg-slate-50 px-4 py-3"
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="min-w-0">
                              <p className="truncate font-bold text-slate-900">
                                {getDisplayName(
                                  item,
                                  mode,
                                  `Customer ${index + 1}`,
                                )}
                              </p>
                              <p className="mt-1 text-xs text-slate-500">
                                Lead: {item?.customerTPRMLeadName || "-"} /{" "}
                                Responder: {item?.responderManagerName || "-"}
                              </p>
                              <p className="mt-1 text-xs text-slate-500">
                                Director: {item?.directorName || "-"}
                              </p>
                            </div>
                            <Pill
                              tone={
                                item?.customerTPRMLeadEmail ||
                                item?.responderManagerEmail
                                  ? "emerald"
                                  : "amber"
                              }
                            >
                              {item?.customerTPRMLeadEmail ||
                              item?.responderManagerEmail
                                ? "Contacted"
                                : "Missing Email"}
                            </Pill>
                          </div>
                        </div>
                      )}
                    />
                  </Section> */}

                  {/* <Section
                    title="Customer Scope Mix"
                    description="Most common customer scopes from the client records."
                    icon={FiFileText}
                  >
                    <div className="space-y-4">
                      {scopeDistribution.length ? (
                        scopeDistribution
                          .slice(0, 8)
                          .map((item) => (
                            <ProgressBar
                              key={item.label}
                              label={item.label}
                              value={item.value}
                              total={Math.max(summary.totalRecords, 1)}
                              color="bg-cyan-500"
                            />
                          ))
                      ) : (
                        <EmptyState text="No customer scope data found yet." />
                      )}
                    </div>
                  </Section> */}
                </section>
              </>
            )}

            <section
              className={`grid grid-cols-1 gap-5 ${
                isVendor ? "xl:grid-cols-1" : "xl:grid-cols-[1.15fr_0.85fr]"
              }`}
            >
              <Section
                title={`${entityLabel} Records`}
                description={`Latest ${listLabel.toLowerCase()} with owner, scope, and schedule state.`}
                icon={FiUsers}
              >
                <RecordsTable
                  records={recentRecords}
                  mode={mode}
                  entityLabel={entityLabel}
                  listLabel={listLabel}
                />
              </Section>

              {!isVendor && (
                <Section
                  title="Customer Readiness Snapshot"
                  description="Scheduling, scope, and ownership signals from customer records."
                  icon={FiCheckCircle}
                >
                  <div className="grid gap-3 sm:grid-cols-2">
                    {[
                      ["Scheduled", summary.scheduled, "emerald"],
                      ["Not Scheduled", summary.unscheduled, "amber"],
                      ["Planned Dates", summary.withPlannedDates, "indigo"],
                      ["Contacts Ready", summary.customerContacts, "cyan"],
                      ["Scoped Records", summary.scopedRecords, "indigo"],
                      [
                        "Assessment Areas",
                        assessmentDistribution.filter(
                          (item) => item.label !== "Not specified",
                        ).length,
                        "rose",
                      ],
                    ].map(([label, value, tone]) => (
                      <div
                        key={label}
                        className="rounded-lg border border-slate-100 bg-slate-50 px-4 py-3"
                      >
                        <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                          {label}
                        </p>
                        <div className="mt-2 flex items-center justify-between">
                          <span className="text-2xl font-bold text-slate-950">
                            {value}
                          </span>
                          <Pill tone={tone}>{label}</Pill>
                        </div>
                      </div>
                    ))}
                  </div>
                </Section>
              )}
            </section>

            {/* <Section
            title="Scheduled Plan"
            description="Records scheduled for the current year with their planned and forecast dates."
            icon={FiCheckCircle}
          >
            {scheduledRecords.length === 0 ? (
              <EmptyState
                text={`No ${listLabel.toLowerCase()} scheduled for ${CURRENT_YEAR}.`}
              />
            ) : (
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {scheduledRecords.map((item, index) => (
                  <div
                    key={item?._id || index}
                    className="rounded-lg border border-slate-200 bg-slate-50 p-4"
                  >
                    <p className="font-bold text-slate-950">
                      {getDisplayName(
                        item,
                        mode,
                        `${entityLabel} ${index + 1}`,
                      )}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      {item?.scope || "No scope provided"}
                    </p>
                    <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <p className="font-semibold text-slate-500">Start</p>
                        <p className="mt-1 text-slate-800">
                          {formatDate(item?.plannedStartDate)}
                        </p>
                      </div>
                      <div>
                        <p className="font-semibold text-slate-500">End</p>
                        <p className="mt-1 text-slate-800">
                          {formatDate(item?.plannedEndDate)}
                        </p>
                      </div>
                      <div>
                        <p className="font-semibold text-slate-500">Forecast</p>
                        <p className="mt-1 text-slate-800">
                          {formatDate(item?.forecastedEndDate)}
                        </p>
                      </div>
                      <div>
                        <p className="font-semibold text-slate-500">Complete</p>
                        <p className="mt-1 text-slate-800">
                          {formatDate(item?.completionEndDate)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Section> */}
          </div>
        )}
      </div>
    </main>
  );
}
