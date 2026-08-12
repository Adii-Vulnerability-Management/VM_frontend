import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Activity,
  AlertTriangle,
  Building2,
  CheckCircle2,
  Clock3,
  FileText,
  GitBranch,
  RefreshCw,
  UserCheck,
  Users,
} from "lucide-react";
import CustomAxios from "@/config/CustomAxios";
import { baseurl, initURL } from "@/config/config";
const safeArray = (value) => {
  if (Array.isArray(value)) return value;
  if (Array.isArray(value?.items)) return value.items;
  return [];
};

// Shared by the active ROPA/BPA joins for activities, flows, and vendors.
const getRelationId = (item, keys) => {
  for (const key of keys) {
    const value = item?.[key];
    if (!value) continue;
    if (typeof value === "object") return value._id || value.id || "";
    return value;
  }
  return "";
};

const normalizeRole = (role = "") => {
  const value = String(role || "").toLowerCase();
  if (value.includes("joint")) return "joint-controller";
  if (value.includes("sub")) return "sub-processor";
  if (value.includes("processor")) return "processor";
  return "controller";
};

const roleLabel = {
  controller: "Controller",
  "joint-controller": "Joint Controller",
  processor: "Processor",
  "sub-processor": "Sub-Processor",
};

const RopaMetricCard = ({ label, value, note, icon: Icon, tone }) => (
  <div
    className="
      group
      relative
      overflow-hidden
      rounded-2xl
      border border-slate-200/70
      bg-gradient-to-br
      from-white
      via-slate-50
      to-cyan-50/40
      p-5
      shadow-md
      transition-all
      duration-300
      hover:-translate-y-1
      hover:shadow-2xl
      hover:border-cyan-200
    "
  >
    {/* Accent line */}
    <div className="absolute left-0 top-0 h-1 w-full bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-700" />

    <div className="flex items-start justify-between">
      <div className="flex-1">
        <p className="text-sm font-semibold tracking-wide text-slate-500 uppercase">
          {label}
        </p>

        <h2 className="mt-3 text-3xl font-bold text-slate-900 tracking-tight">
          {value}
        </h2>

        <p className="mt-2 text-sm text-slate-500">{note}</p>
      </div>

      <div
        className={`
          ${tone}
          rounded-2xl
          p-3
          shadow-lg
          transition-transform
          duration-300
          group-hover:scale-110
          group-hover:rotate-6
        `}
      >
        <Icon size={22} />
      </div>
    </div>
  </div>
);

const MiniProgress = ({ label, value, total, color = "bg-[#2B245C]" }) => {
  const percent = total ? Math.round((value / total) * 100) : 0;
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3 text-sm">
        <span className="font-semibold text-slate-700">{label}</span>
        <span className="text-xs font-medium text-slate-500">
          {value} ROPAs - {percent}%
        </span>
      </div>
      <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
        <div
          className={`h-full rounded-full ${color}`}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
};

export default function RopaDashboard() {
  const [bpas, setBpas] = useState([]);
  const [systemActivities, setSystemActivities] = useState([]);
  const [flows, setFlows] = useState([]);
  const [vendors, setVendors] = useState([]);
  // Previous entity filter state:
  // const [entities, setEntities] = useState([]);
  // const [selectedEntity, setSelectedEntity] = useState("all");
  const [selectedRopa, setSelectedRopa] = useState("all");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const [bpaRes, saRes, flowRes, vendorRes] = await Promise.all([
        CustomAxios.get(`${baseurl}/${initURL}/dataflow/bpas`),
        CustomAxios.get(`${baseurl}/${initURL}/dataflow/system-activities`),
        CustomAxios.get(`${baseurl}/${initURL}/dataflow/mapping/flows`),
        CustomAxios.get(`${baseurl}/${initURL}/dataflow/vendors`),
        // Previous entity filter request:
        // CustomAxios.get(`${baseurl}/${initURL}/dataflow/entities`),
      ]);

      setBpas(safeArray(bpaRes.data).filter((item) => item?.archived !== true));
      setSystemActivities(
        safeArray(saRes.data).filter((item) => item?.archived !== true),
      );
      setFlows(
        safeArray(flowRes.data).filter((item) => item?.archived !== true),
      );
      setVendors(
        safeArray(vendorRes.data).filter((item) => item?.archived !== true),
      );
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err.message ||
          "Failed to load ROPA dashboard data",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const ropaOptions = useMemo(
    () => [
      { value: "all", label: "All ROPAs" },
      ...bpas
        .map((bpa) => ({
          value: String(bpa._id || bpa.id || ""),
          label: bpa.name || "Unnamed processing activity",
        }))
        .filter((option) => option.value),
    ],
    [bpas],
  );

  const filteredBpas = useMemo(() => {
    if (selectedRopa === "all") return bpas;
    return bpas.filter(
      (bpa) => String(bpa._id || bpa.id) === String(selectedRopa),
    );
  }, [bpas, selectedRopa]);

  const bpaIds = useMemo(
    () => new Set(filteredBpas.map((bpa) => bpa._id || bpa.id).filter(Boolean)),
    [filteredBpas],
  );

  const activitiesByBpa = useMemo(() => {
    return systemActivities.reduce((acc, item) => {
      const bpaId = getRelationId(item, ["bpaId", "bpa", "activityId"]);
      if (!bpaId) return acc;
      acc[bpaId] = acc[bpaId] || [];
      acc[bpaId].push(item);
      return acc;
    }, {});
  }, [systemActivities]);

  const filteredActivities = useMemo(() => {
    return systemActivities.filter((activity) =>
      bpaIds.has(getRelationId(activity, ["bpaId", "bpa", "activityId"])),
    );
  }, [bpaIds, systemActivities]);

  const filteredActivityIds = useMemo(
    () =>
      new Set(
        filteredActivities
          .map((activity) => activity._id || activity.id)
          .filter(Boolean),
      ),
    [filteredActivities],
  );

  const filteredFlows = useMemo(() => {
    return flows.filter((flow) => {
      const bpaId = getRelationId(flow, ["bpaId", "bpa", "activityId"]);
      const sourceId = getRelationId(flow, [
        "sourceSaId",
        "sourceSa",
        "source",
      ]);
      const targetId = getRelationId(flow, [
        "targetSaId",
        "targetSa",
        "target",
      ]);
      return (
        bpaIds.has(bpaId) ||
        filteredActivityIds.has(sourceId) ||
        filteredActivityIds.has(targetId)
      );
    });
  }, [bpaIds, filteredActivityIds, flows]);

  const vendorIds = useMemo(
    () =>
      new Set(
        filteredActivities
          .map((activity) => getRelationId(activity, ["vendorId", "vendor"]))
          .filter(Boolean),
      ),
    [filteredActivities],
  );

  const linkedVendors = vendors.filter((vendor) =>
    vendorIds.has(vendor._id || vendor.id),
  );

  const ropaRows = useMemo(() => {
    return filteredBpas.map((bpa) => {
      const id = bpa._id || bpa.id;
      const activities = activitiesByBpa[id] || [];
      const activityIds = new Set(
        activities
          .map((activity) => activity._id || activity.id)
          .filter(Boolean),
      );
      const relatedFlows = filteredFlows.filter((flow) => {
        const bpaId = getRelationId(flow, ["bpaId", "bpa", "activityId"]);
        const sourceId = getRelationId(flow, [
          "sourceSaId",
          "sourceSa",
          "source",
        ]);
        const targetId = getRelationId(flow, [
          "targetSaId",
          "targetSa",
          "target",
        ]);
        return (
          bpaId === id || activityIds.has(sourceId) || activityIds.has(targetId)
        );
      });
      const hasVendor = activities.some((activity) =>
        getRelationId(activity, ["vendorId", "vendor"]),
      );
      const hasCrossBorder = relatedFlows.some((flow) => !!flow.crossBorder);

      let status = "Yet to Start";
      if (activities.length && relatedFlows.length && hasVendor)
        status = "Completed";
      else if (hasCrossBorder) status = "Change Request";
      else if (relatedFlows.length) status = "Under Review";
      else if (activities.length) status = "In Progress";

      return {
        ...bpa,
        id,
        status,
        activities: activities.length,
        flows: relatedFlows.length,
        entityName: bpa.businessUnit || bpa.department || "Unassigned",
        role: normalizeRole(bpa.role || bpa.organizationRole),
      };
    });
  }, [activitiesByBpa, filteredBpas, filteredFlows]);

  const totalRopas = ropaRows.length;
  const statusCounts = [
    {
      label: "Yet to Start",
      value: ropaRows.filter((row) => row.status === "Yet to Start").length,
      icon: AlertTriangle,
      tone: "bg-rose-50 text-rose-600",
    },
    {
      label: "In Progress",
      value: ropaRows.filter((row) => row.status === "In Progress").length,
      icon: Clock3,
      tone: "bg-amber-50 text-amber-600",
    },
    {
      label: "Under Review",
      value: ropaRows.filter((row) => row.status === "Under Review").length,
      icon: UserCheck,
      tone: "bg-blue-50 text-blue-600",
    },
    {
      label: "Change Request",
      value: ropaRows.filter((row) => row.status === "Change Request").length,
      icon: GitBranch,
      tone: "bg-violet-50 text-violet-600",
    },
    {
      label: "Completed",
      value: ropaRows.filter((row) => row.status === "Completed").length,
      icon: CheckCircle2,
      tone: "bg-emerald-50 text-emerald-600",
    },
  ];

  const roles = [
    "controller",
    "joint-controller",
    "processor",
    "sub-processor",
  ];
  const roleCounts = roles.map((role) => ({
    role,
    value: ropaRows.filter((row) => row.role === role).length,
  }));

  const departmentRows = useMemo(() => {
    const map = new Map();
    ropaRows.forEach((row) => {
      const label = row.department || row.businessUnit || row.entityName;
      if (!map.has(label)) {
        map.set(label, {
          label,
          processes: 0,
          completed: 0,
          inProgress: 0,
        });
      }
      const current = map.get(label);
      current.processes += 1;
      if (row.status === "Completed") current.completed += 1;
      if (row.status === "In Progress" || row.status === "Under Review") {
        current.inProgress += 1;
      }
    });
    return Array.from(map.values()).sort((a, b) => b.processes - a.processes);
  }, [ropaRows]);

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-white via-slate-50 to-cyan-50 p-6 shadow-lg hover:shadow-2xl transition-shadow duration-300">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            {/* <div className="inline-flex items-center gap-2 rounded-full border border-cyan-200 bg-cyan-50 px-3 py-1 text-xs font-semibold text-cyan-700">
              <Database size={14} />
              Records of Processing Activities
            </div> */}
            <h2 className="text-2xl font-bold text-[#2B245C]">
              ROPA Management Dashboard
            </h2>
            <p className="mt-1 max-w-3xl text-sm text-slate-600">
              A consolidated view of business processing activities, linked
              systems, vendors, and flows from Data Mapping.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <label className="block">
              <span className="mb-1 block text-xs font-semibold text-slate-600">
                Select ROPA
              </span>
              <select
                value={selectedRopa}
                onChange={(event) => setSelectedRopa(event.target.value)}
                className="w-full min-w-[220px] rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm outline-none focus:border-cyan-500"
              >
                {ropaOptions.map((ropa) => (
                  <option key={ropa.value} value={ropa.value}>
                    {ropa.label}
                  </option>
                ))}
              </select>
            </label>
            <button
              type="button"
              onClick={load}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#2B245C] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#211b49]"
            >
              <RefreshCw size={16} />
              Refresh
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-3 xl:grid-cols-6">
        <RopaMetricCard
          label="Total ROPAs"
          value={loading ? "..." : totalRopas}
          note="Active assessments"
          icon={FileText}
          tone="bg-cyan-50 text-cyan-700"
        />
        {statusCounts.map((metric) => (
          <RopaMetricCard
            key={metric.label}
            label={metric.label}
            value={loading ? "..." : metric.value}
            note="Active assessments"
            icon={metric.icon}
            tone={metric.tone}
          />
        ))}
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        <section className="rounded-2xl border border-[#2B245C] bg-white p-6 shadow-lg hover:shadow-2xl transition-shadow duration-300">
          <div className="mb-5 flex items-center gap-2">
            <Users className="text-[#2B245C]" size={20} />
            <div>
              <h3 className="text-xl font-bold text-[#2B245C]">
                Processing Activities by Organization Role
              </h3>
              <p className="text-xs text-slate-500">
                Total count of ROPA started: {totalRopas}
              </p>
            </div>
          </div>
          <div className="space-y-5">
            {roleCounts.map((item) => (
              <MiniProgress
                key={item.role}
                label={roleLabel[item.role]}
                value={item.value}
                total={totalRopas}
              />
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-[#2B245C] bg-white p-6 shadow-lg hover:shadow-2xl transition-shadow duration-300">
          <div className="mb-5 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Activity className="text-emerald-600" size={20} />
              <div>
                <h3 className="text-xl font-bold text-[#2B245C]">
                  Processing Activities by Department
                </h3>
                <p className="text-xs text-slate-500">
                  Total processes: {filteredActivities.length}
                </p>
              </div>
            </div>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
              {linkedVendors.length} processors
            </span>
          </div>

          {departmentRows.length ? (
            <div className="space-y-4">
              {departmentRows.slice(0, 6).map((dept) => (
                <div
                  key={dept.label}
                  className="rounded-xl border border-slate-100 bg-slate-50 p-4"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <Building2 size={16} className="text-slate-500" />
                      <span className="font-semibold text-slate-800">
                        {dept.label}
                      </span>
                    </div>
                    <span className="text-xs font-semibold text-slate-500">
                      {dept.processes} processes
                    </span>
                  </div>
                  <div className="mt-3 grid gap-2 text-xs text-slate-600 sm:grid-cols-3">
                    <span>Total: {dept.processes}</span>
                    <span>Completed: {dept.completed}</span>
                    <span>In Progress: {dept.inProgress}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-10 text-center text-sm text-slate-500">
              No ROPA data available for the selected entity.
            </div>
          )}
        </section>
      </div>

      <section className="rounded-2xl border border-[#2B245C] bg-white p-6 shadow-lg hover:shadow-2xl transition-shadow duration-300">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h3 className="text-xl font-bold text-[#2B245C]">
              Recent ROPA Records
            </h3>
            <p className="text-xs text-slate-500">
              Generated from Data Mapping activities.
            </p>
          </div>
          <Link
            href="/admin/dataFlow/mapping/ropa"
            className="rounded-xl bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-200"
          >
            Open ROPA
          </Link>
        </div>
        <div className="rounded-xl border border-slate-200 overflow-hidden">
          <div className="max-h-[400px] overflow-y-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="sticky top-0 bg-slate-50 z-10 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3 font-semibold">Activity</th>
                  <th className="px-4 py-3 font-semibold">Role</th>
                  <th className="px-4 py-3 font-semibold">Systems</th>
                  <th className="px-4 py-3 font-semibold">Flows</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {ropaRows.slice(0, 8).map((row) => (
                  <tr key={row.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/dataFlow/mapping/ropa/${row.id}`}
                        className="font-semibold text-[#2B245C] hover:underline"
                      >
                        {row.name || "Untitled activity"}
                      </Link>
                      <p className="mt-1 line-clamp-1 text-xs text-slate-500">
                        {row.description || row.entityName}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {roleLabel[row.role]}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {row.activities}
                    </td>
                    <td className="px-4 py-3 text-slate-600">{row.flows}</td>
                    <td className="px-4 py-3">
                      <span className="rounded-full bg-cyan-50 px-3 py-1 text-xs font-semibold text-cyan-700">
                        {row.status}
                      </span>
                    </td>
                  </tr>
                ))}
                {!ropaRows.length && (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-4 py-8 text-center text-sm text-slate-500"
                    >
                      No ROPA records found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
}
