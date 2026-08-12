import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  FiAlertTriangle,
  FiCalendar,
  FiClipboard,
  FiFileText,
  FiUsers,
} from "react-icons/fi";
import CustomAxios from "../CustomAxios";
import Loader from "../loader/Loader";
import { baseurl, initURL } from "../../../BaseUrl";

const badgeClassMap = {
  Low: "bg-sky-100 text-sky-800",
  Moderate: "bg-sky-100 text-sky-800",
  High: "bg-amber-100 text-amber-800",
  Extreme: "bg-rose-100 text-rose-800",
  default: "bg-slate-100 text-slate-600",
};

const formatDate = (value) => {
  if (!value) return "TBD";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const StatusBadge = ({ label }) => {
  const safeLabel = label || "Unassigned";
  const className = badgeClassMap[safeLabel] ?? badgeClassMap.default;
  return (
    <span
      className={`px-2 py-0.5 text-[11px] font-semibold uppercase rounded-full ${className}`}
    >
      {safeLabel}
    </span>
  );
};

const MetricCard = ({
  icon: Icon,
  label,
  value,
  description,
  source,
  accentClass = "bg-blue-600",
  cardClass = "bg-blue-50 border border-blue-100",
}) => (
  <div className={`rounded-2xl border shadow-sm p-5 space-y-2 ${cardClass}`}>
    <div className="flex items-center justify-between">
      <Icon className="text-slate-500" size={20} />
      <span className="text-[11px] uppercase tracking-wide text-slate-400">
        {source}
      </span>
    </div>
    <div className={`h-1 w-16 rounded-full ${accentClass}`} />
    <p className="text-sm uppercase tracking-wide text-slate-500">{label}</p>
    <p className="text-3xl font-semibold text-slate-900">{value ?? 0}</p>
    <p className="text-sm text-slate-500">{description}</p>
  </div>
);

const ProgressBar = ({ value, max }) => {
  const percentage = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0;
  return (
    <div className="space-y-1">
      <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full bg-gradient-to-r from-teal-500 to-cyan-500"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <p className="text-[11px] text-slate-500">{percentage}% of total</p>
    </div>
  );
};

export default function AuditDashboard() {
  const [programs, setPrograms] = useState([]);
  const [selectedProgramId, setSelectedProgramId] = useState("");
  const [charter, setCharter] = useState(null);
  const [universeRows, setUniverseRows] = useState([]);
  const [strategyData, setStrategyData] = useState([]);
  const [schedulingEntries, setSchedulingEntries] = useState([]);
  const [divisions, setDivisions] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [businessAreas, setBusinessAreas] = useState([]);
  const [teams, setTeams] = useState([]);
  const [teamMembersByTeam, setTeamMembersByTeam] = useState({});
  const [loadingPrograms, setLoadingPrograms] = useState(false);
  const [loadingData, setLoadingData] = useState(false);
  const [programsError, setProgramsError] = useState("");
  const [dashboardError, setDashboardError] = useState("");

  const programOptions = useMemo(
    () =>
      programs
        .filter((p) => p && p._id)
        .map((p) => ({
          id: p._id,
          name: p.auditProgramName || p.name || "Audit Program",
        })),
    [programs]
  );

  const fetchPrograms = useCallback(async () => {
    setLoadingPrograms(true);
    setProgramsError("");
    try {
      const response = await CustomAxios.get(`${baseurl}/${initURL}/audit-charter`);
      if (Array.isArray(response.data)) {
        setPrograms(response.data);
      } else {
        setPrograms([]);
      }
    } catch (error) {
      console.error("Failed to load programs:", error);
      setProgramsError(
        error?.response?.data?.message || error?.message || "Unable to load programs."
      );
    } finally {
      setLoadingPrograms(false);
    }
  }, []);

  const fetchDashboardData = useCallback(
    async (programId) => {
      setLoadingData(true);
      setDashboardError("");
      try {
        const [charterRes, universeRes, strategyRes] = await Promise.all([
          CustomAxios.get(`${baseurl}/${initURL}/audit-charter/${programId}`),
          CustomAxios.get(`${baseurl}/${initURL}/audit-universe/program/${programId}`),
          CustomAxios.get(`${baseurl}/${initURL}/audit-strategy/program/${programId}`, {
            params: { programID: programId },
          }),
        ]);

        setCharter(charterRes.data ?? null);

        const universeData = Array.isArray(universeRes.data) ? universeRes.data : [];
        setUniverseRows(universeData);

        setStrategyData(Array.isArray(strategyRes.data) ? strategyRes.data : []);

        const areaIds = universeData.map((area) => area._id).filter(Boolean);
        const schedulePromises = areaIds.map((id) =>
          CustomAxios.get(`${baseurl}/${initURL}/audit-area-planning/universe/${id}`).then(
            (res) => ({
              universeId: id,
              payload: res.data,
            })
          )
        );

        const scheduleResults = await Promise.allSettled(schedulePromises);
        const schedulesFromApi = scheduleResults
          .map((result) => (result.status === "fulfilled" ? result.value : null))
          .filter(Boolean);

        const fallbackEntries = universeData
          .filter(
            (area) =>
              area.auditAreaPlanning &&
              !schedulesFromApi.some((item) => item.universeId === area._id)
          )
          .map((area) => ({
            universeId: area._id,
            payload: area.auditAreaPlanning,
          }));

        const timeline = [...schedulesFromApi, ...fallbackEntries].map((item) => {
          const area = universeData.find((u) => u._id === item.universeId) ?? {};
          const plan = item.payload ?? {};
          const start = plan.auditStartDate ?? area.auditStartDate;
          const end = plan.auditEndDate ?? area.auditEndDate;
          const lead =
            plan.lead && typeof plan.lead === "object"
              ? `${plan.lead.first_name ?? ""} ${plan.lead.last_name ?? ""}`.trim()
              : plan.lead || area.lead?.name;
          const manager =
            plan.manager && typeof plan.manager === "object"
              ? `${plan.manager.first_name ?? ""} ${plan.manager.last_name ?? ""}`.trim()
              : plan.manager || area.manager?.name;

          return {
            id: plan._id ?? area._id,
            topic:
              area.auditTopic ??
              area.processArea?.name ??
              plan.auditTopic ??
              "Audit Object",
            status: plan.auditStatus ?? "Draft",
            start,
            end,
            lead: lead || "TBD",
            manager: manager || "TBD",
            auditID: plan.auditID ?? area.auditID,
            period: plan.auditPeriod ?? area.auditPeriod,
          };
        });

        setSchedulingEntries(timeline);
      } catch (error) {
        console.error("Failed to load dashboard data:", error);
        setDashboardError(
          error?.response?.data?.message || error?.message || "Unable to load dashboard data."
        );
      } finally {
        setLoadingData(false);
      }
    },
    []
  );

  useEffect(() => {
    fetchPrograms();
  }, [fetchPrograms]);

  useEffect(() => {
    if (!selectedProgramId && programOptions.length > 0) {
      setSelectedProgramId(programOptions[0].id);
    }
  }, [programOptions, selectedProgramId]);

  useEffect(() => {
    if (selectedProgramId) {
      fetchDashboardData(selectedProgramId);
    }
  }, [selectedProgramId, fetchDashboardData]);

  useEffect(() => {
    let mounted = true;
    const loadHierarchy = async () => {
      try {
        const [divRes, deptRes, baRes] = await Promise.all([
          CustomAxios.get(`${baseurl}/${initURL}/ghub-division`),
          CustomAxios.get(`${baseurl}/${initURL}/ghub-department`),
          CustomAxios.get(`${baseurl}/${initURL}/ghub-business-area`),
        ]);
        if (!mounted) return;
        setDivisions(Array.isArray(divRes.data) ? divRes.data : []);
        setDepartments(Array.isArray(deptRes.data) ? deptRes.data : []);
        setBusinessAreas(Array.isArray(baRes.data) ? baRes.data : []);
      } catch (error) {
        console.error("Failed to load corporate hierarchy:", error);
      }
    };
    loadHierarchy();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    let mounted = true;
    const loadTeams = async () => {
      try {
        const res = await CustomAxios.get(`${baseurl}/${initURL}/teams`);
        if (!mounted) return;
        const teamsData = Array.isArray(res.data) ? res.data : [];
        setTeams(teamsData);

        const headTeams = teamsData.slice(0, 3);
        const memberResults = await Promise.allSettled(
          headTeams.map((team) =>
            CustomAxios.get(`${baseurl}/${initURL}/team-members/by-team/${team._id}`)
          )
        );

        if (!mounted) return;
        const memberMap = {};
        headTeams.forEach((team, index) => {
          const result = memberResults[index];
          if (result.status === "fulfilled") {
            memberMap[team._id] = Array.isArray(result.value.data)
              ? result.value.data
              : [];
          }
        });
        setTeamMembersByTeam(memberMap);
      } catch (error) {
        console.error("Failed to load teams:", error);
      }
    };
    loadTeams();
    return () => {
      mounted = false;
    };
  }, []);

  const isLoading = loadingPrograms || loadingData;

  const totalControls = useMemo(
    () =>
      universeRows.reduce((sum, area) => sum + (area.controls?.length ?? 0), 0),
    [universeRows]
  );

  const riskCategoryStats = useMemo(() => {
    const map = {};
    universeRows.forEach((area) => {
      const category = area.riskCategory || "Unassigned";
      map[category] = (map[category] || 0) + 1;
    });
    return Object.entries(map)
      .map(([category, count]) => ({ category, count }))
      .sort((a, b) => b.count - a.count);
  }, [universeRows]);

  const residualRiskStats = useMemo(() => {
    const map = {};
    universeRows.forEach((area) => {
      const label = area.residualRisk || "Unassigned";
      map[label] = (map[label] || 0) + 1;
    });
    return Object.entries(map).map(([label, count]) => ({ label, count }));
  }, [universeRows]);

  const totalRiskRecords = riskCategoryStats.reduce((sum, stat) => sum + stat.count, 0);

  const strategyPriorityStats = useMemo(() => {
    const map = {};
    universeRows.forEach((area) => {
      const priority = area.strategyPriority || "Unassigned";
      map[priority] = (map[priority] || 0) + 1;
    });
    return Object.entries(map)
      .map(([label, count]) => ({ label, count }))
      .sort((a, b) => b.count - a.count);
  }, [universeRows]);

  const finalPriorityStats = useMemo(() => {
    const map = {};
    universeRows.forEach((area) => {
      const priority = area.finalPriority || "Unassigned";
      map[priority] = (map[priority] || 0) + 1;
    });
    return Object.entries(map)
      .map(([label, count]) => ({ label, count }))
      .sort((a, b) => b.count - a.count);
  }, [universeRows]);

  const teamRoster = useMemo(() => {
    const registry = new Map();
    universeRows.forEach((area) => {
      const roster = area.auditAreaPlanning?.auditTeamMembers ?? [];
      roster.forEach((member) => {
        const id = member.userId?._id ?? member._id;
        if (!id || registry.has(id)) return;
        const name = member.userId
          ? `${member.userId.first_name ?? ""} ${member.userId.last_name ?? ""}`.trim()
          : member.name ?? "Team Member";
        registry.set(id, {
          id,
          name,
          designation: member.userId?.user_designation ?? "Auditor",
        });
      });
    });
    return Array.from(registry.values());
  }, [universeRows]);

  const scheduleStatusStats = useMemo(() => {
    const map = {};
    schedulingEntries.forEach((entry) => {
      const status = entry.status || "Draft";
      map[status] = (map[status] || 0) + 1;
    });
    return Object.entries(map).map(([status, count]) => ({ status, count }));
  }, [schedulingEntries]);

  const insights = useMemo(() => {
    const lines = [];
    if (charter?.auditProgramName) {
      lines.push(
        `${charter.auditProgramName} charter covers ${charter.sections?.length ?? 0} sections.`
      );
    }
    if (teamRoster.length > 0) {
      lines.push(`${teamRoster.length} people appear in the Mgt & IA roster.`);
    }
    lines.push(`${totalRiskRecords} risk entries span ${riskCategoryStats.length} categories.`);
    return lines;
  }, [charter, teamRoster.length, totalRiskRecords, riskCategoryStats.length]);

  const programSectionsCount = charter?.sections?.length ?? 0;
  const charterDate = formatDate(charter?.date);
  const preparedBy = charter?.preparedBy ?? "—";
  const authorizedBy = charter?.authorizedBy ?? "—";

  const totalCorporateTeams = teams.length;
  const totalTeamMembersFromApi = Object.values(teamMembersByTeam).reduce(
    (sum, list) => sum + (Array.isArray(list) ? list.length : 0),
    0
  );

  const corporateHighlights = [
    { label: "Divisions", value: divisions.length },
    { label: "Departments", value: departments.length },
    { label: "Business Areas", value: businessAreas.length },
  ];

  const cardData = [
    {
      icon: FiFileText,
      label: "Audit Charter",
      value: programSectionsCount,
      description: "Sections completed",
      source: "Audit Charter",
      accentClass: "bg-blue-600",
      cardClass: "bg-blue-50 border border-blue-100",
    },
    {
      icon: FiUsers,
      label: "Mgt & IA Team",
      value: teamRoster.length,
      description: `${totalCorporateTeams} teams recorded`,
      source: "Mgt & IA Team",
      accentClass: "bg-sky-600",
      cardClass: "bg-sky-50 border border-sky-100",
    },
    {
      icon: FiAlertTriangle,
      label: "Risk Analysis",
      value: totalRiskRecords,
      description: `${riskCategoryStats.length} categories tracked`,
      source: "Risk Analysis",
      accentClass: "bg-indigo-600",
      cardClass: "bg-indigo-50 border border-indigo-100",
    },
    {
      icon: FiCalendar,
      label: "Audit Scheduling",
      value: schedulingEntries.length,
      description: "Schedules pulled from plans",
      source: "Audit Scheduling",
      accentClass: "bg-cyan-600",
      cardClass: "bg-cyan-50 border border-cyan-100",
    },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader />
      </div>
    );
  }

  if (programsError && programs.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-6 bg-slate-100 text-slate-600">
        <p className="text-lg font-semibold text-slate-900">Programs unavailable</p>
        <p className="max-w-xl text-center">{programsError}</p>
      </div>
    );
  }

  if (dashboardError) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-6 bg-slate-100 text-slate-600">
        <p className="text-lg font-semibold text-slate-900">Dashboard data could not load</p>
        <p className="max-w-xl text-center">{dashboardError}</p>
      </div>
    );
  }

  if (!selectedProgramId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 p-6 space-y-6">
      <div className="px-6 py-8 bg-[#2B245C] rounded-2xl shadow-lg hover:shadow-2xl transition-shadow duration-300 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-cyan-50">Audit Planning Dashboard</h1>
          <p className="mt-1 text-sm text-white">
            Live data sourced from the Internal Audit forms and related services.
          </p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <label
            className="text-[11px] uppercase tracking-wider text-white hidden sm:block"
            htmlFor="programSelect"
          >
            Program
          </label>
          <select
            id="programSelect"
            value={selectedProgramId}
            onChange={(event) => setSelectedProgramId(event.target.value)}
            className="w-full sm:w-auto border border-slate-300 rounded-lg px-3 py-2 bg-white text-sm text-slate-800 focus:ring-2 focus:ring-slate-400 focus:outline-none"
          >
            {programOptions.map((program) => (
              <option key={program.id} value={program.id}>
                {program.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="bg-sky-50 p-4 rounded-xl shadow border border-blue-100">
          <p className="text-[11px] uppercase text-slate-400">Charter date</p>
          <p className="text-lg font-semibold text-slate-900">{charterDate}</p>
          <p className="text-xs text-slate-500 mt-2">Source: Audit Charter form</p>
        </div>
        <div className="bg-sky-50 p-4 rounded-xl shadow border border-blue-100">
          <p className="text-[11px] uppercase text-slate-400">Prepared by</p>
          <p className="text-lg font-semibold text-slate-900">{preparedBy}</p>
          <p className="text-xs text-slate-500 mt-2">Editable field from charter</p>
        </div>
        <div className="bg-sky-50 p-4 rounded-xl shadow border border-blue-100">
          <p className="text-[11px] uppercase text-slate-400">Authorized by</p>
          <p className="text-lg font-semibold text-slate-900">{authorizedBy}</p>
          <p className="text-xs text-slate-500 mt-2">Charter owner</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {cardData.map((card) => (
          <MetricCard key={card.label} {...card} />
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.4fr,1fr]">
        <div className="bg-white rounded-2xl border border-slate-200 shadow p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">Risk Analysis snapshot</h2>
            <span className="text-xs uppercase tracking-wide text-slate-400">
              Risk Analysis form
            </span>
          </div>
          <div className="space-y-4">
            {riskCategoryStats.map((risk) => (
              <div key={risk.category} className="space-y-2">
                <div className="flex items-center justify-between text-sm text-slate-700">
                  <span>{risk.category}</span>
                  <span className="text-xs text-slate-500">{risk.count} entries</span>
                </div>
                <ProgressBar value={risk.count} max={totalRiskRecords || 1} />
              </div>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-3">
            {residualRiskStats.map((item) => (
              <div
                key={item.label}
                className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2"
              >
                <div>
                  <p className="text-[11px] text-slate-500">{item.label}</p>
                  <p className="text-sm font-semibold text-slate-900">{item.count}</p>
                </div>
                <StatusBadge label={item.label} />
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">Mgt & IA Team</h2>
            <span className="text-xs uppercase tracking-wide text-slate-400">Team forms</span>
          </div>
          <div className="space-y-3">
            {teamRoster.length === 0 ? (
              <p className="text-sm text-slate-500">No team members synced yet.</p>
            ) : (
              teamRoster.slice(0, 4).map((member) => (
                <div
                  key={member.id}
                  className="text-sm space-y-0.5 border-b border-slate-100 pb-2 last:border-0 last:pb-0"
                >
                  <p className="font-semibold text-slate-900">{member.name || "Anonymous"}</p>
                  <p className="text-[11px] uppercase tracking-wide text-slate-500">
                    {member.designation} / Audit Team
                  </p>
                </div>
              ))
            )}
          </div>
          {teamRoster.length > 4 && (
            <p className="text-xs text-slate-500">+{teamRoster.length - 4} more members tracked.</p>
          )}
          <div className="text-xs text-slate-500 space-y-1">
            <p>Total teams from API: {totalCorporateTeams}</p>
            <p>Members returned from teams API: {totalTeamMembersFromApi}</p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.5fr,1fr]">
        <div className="bg-white rounded-2xl border border-slate-200 shadow p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">Audit Universe coverage</h2>
            <span className="text-xs uppercase tracking-wide text-slate-400">Audit Universe form</span>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm text-left">
              <thead>
                <tr className="text-xs uppercase tracking-wide text-slate-500">
                  <th className="py-2 pr-2">Audit Topic</th>
                  <th className="py-2 pr-2">Risk Category</th>
                  <th className="py-2 pr-2">Strategy</th>
                  <th className="py-2 pr-2">Final Priority</th>
                  <th className="py-2 pr-2">Last Audit</th>
                </tr>
              </thead>
              <tbody>
                {universeRows.slice(0, 4).map((row) => (
                  <tr key={row._id} className="border-t border-slate-100">
                    <td className="py-3 pr-2 font-medium text-slate-900">
                      {row.auditTopic ?? row.processArea?.name ?? "Audit Object"}
                    </td>
                    <td className="py-3 pr-2 text-slate-600">{row.riskCategory ?? "Unassigned"}</td>
                    <td className="py-3 pr-2 text-slate-600">{row.strategyPriority ?? "Unassigned"}</td>
                    <td className="py-3 pr-2">
                      <StatusBadge label={row.finalPriority} />
                    </td>
                    <td className="py-3 pr-2 text-slate-500">{formatDate(row.processArea?.lastAuditDate)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {universeRows.length > 4 && (
            <p className="text-xs text-slate-500">Showing 4 of {universeRows.length} audit objects.</p>
          )}
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow p-6 space-y-5">
          <div>
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-lg font-semibold text-slate-900">Strategy & Prioritization</h2>
              <span className="text-xs uppercase tracking-wide text-slate-400">
                Strategy form
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Strategy priorities stay consistent with the saved strategy records.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <p className="text-[11px] uppercase tracking-wide text-slate-400 mb-2">
                Strategy priorities
              </p>
              <div className="space-y-2">
                {strategyPriorityStats.map((stat) => (
                  <div
                    key={`strategy-${stat.label}`}
                    className="flex items-center justify-between text-sm text-slate-700"
                  >
                    <div className="flex items-center gap-2">
                      <StatusBadge label={stat.label} />
                      <span className="capitalize">{stat.label}</span>
                    </div>
                    <span className="font-semibold text-slate-900">{stat.count}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <p className="text-[11px] uppercase tracking-wide text-slate-400 mb-2">Final priorities</p>
              <div className="space-y-2">
                {finalPriorityStats.map((stat) => (
                  <div
                    key={`final-${stat.label}`}
                    className="flex items-center justify-between text-sm text-slate-700"
                  >
                    <div className="flex items-center gap-2">
                      <StatusBadge label={stat.label} />
                      <span className="capitalize">{stat.label}</span>
                    </div>
                    <span className="font-semibold text-slate-900">{stat.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            {insights.map((insight, index) => (
              <div
                key={`insight-${index}`}
                className="flex items-start gap-2 text-sm text-slate-600"
              >
                <FiClipboard className="mt-0.5 text-slate-400" />
                <span>{insight}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.5fr,1fr]">
        <div className="bg-white rounded-2xl border border-slate-200 shadow p-6 space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">Audit Scheduling timeline</h2>
            <span className="text-xs uppercase tracking-wide text-slate-400">Audit Scheduling</span>
          </div>
          <div className="grid gap-4 lg:grid-cols-[2fr,1fr]">
            <div className="space-y-4">
              {schedulingEntries.length === 0 ? (
                <p className="text-sm text-slate-500">
                  There are no scheduling records for this program yet.
                </p>
              ) : (
                schedulingEntries.map((entry) => (
                  <div
                    key={entry.id}
                    className="border border-slate-200 rounded-2xl p-4 bg-slate-50 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-slate-900">{entry.topic}</p>
                      <StatusBadge label={entry.status} />
                    </div>
                    <p className="text-xs text-slate-500">
                      Plan ID: {entry.auditID ?? "—"} • Period: {entry.period ?? "—"}
                    </p>
                    <p className="text-xs text-slate-500">
                      Start: {formatDate(entry.start)} • End: {formatDate(entry.end)}
                    </p>
                    <p className="text-xs text-slate-500">
                      Lead: {entry.lead} • Manager: {entry.manager}
                    </p>
                  </div>
                ))
              )}
            </div>
            <div className="space-y-4">
              <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-4 space-y-2">
                <p className="text-xs uppercase tracking-wide text-slate-400">Status breakdown</p>
                <div className="space-y-2">
                  {scheduleStatusStats.map((status) => (
                    <div
                      key={status.status}
                      className="flex items-center justify-between text-sm text-slate-700"
                    >
                      <span>{status.status}</span>
                      <span className="font-semibold text-slate-900">{status.count}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-4 text-xs text-slate-500">
                Controls captured: {totalControls}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">Corporate coverage</h2>
            <span className="text-xs uppercase tracking-wide text-slate-400">
              GHUB + Teams
            </span>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {corporateHighlights.map((item) => (
              <div
                key={item.label}
                className="bg-slate-50 rounded-2xl border border-slate-200 p-3 text-sm"
              >
                <p className="text-xs uppercase tracking-wide text-slate-400">{item.label}</p>
                <p className="text-2xl font-semibold text-slate-900">{item.value}</p>
              </div>
            ))}
          </div>
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-wide text-slate-400 mb-1">Teams API snapshot</p>
            {teams.slice(0, 3).map((team) => (
              <div key={team._id} className="flex items-center justify-between text-sm">
                <span>{team.name}</span>
                <span className="text-slate-500">
                  {teamMembersByTeam[team._id]?.length ?? 0} members
                </span>
              </div>
            ))}
            {teams.length > 3 && (
              <p className="text-xs text-slate-500">...and {teams.length - 3} more teams available</p>
            )}
          </div>
          <div className="text-xs text-slate-500 space-y-1">
            <p>Total teams tracked: {totalCorporateTeams}</p>
            <p>Sampled members via API: {totalTeamMembersFromApi}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
