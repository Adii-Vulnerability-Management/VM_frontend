// src/components/AuditScheduling.jsx
import { useRouter } from "next/router";
import { useCallback, useEffect, useState } from "react";
import { FiInfo, FiUser } from "react-icons/fi";
import { toast } from "react-toastify";
import { baseurl, initURL } from "../../../BaseUrl";
import CustomAxios from "../CustomAxios";
import AuditInformationForm from "./auditplaning/AuditInformationForm";
import TeamAndCompanyForm from "./auditplaning/TeamAndCompanyForm";
import IndernalAuditSection from "./IndernalAuditSection";
import ProcessOverview from "./ProcessOverview";
import { FaTrash } from "react-icons/fa";
import Loader from "../loader/Loader";

const formatUserLabel = (user) => {
  if (!user) return "Unnamed user";
  const fullName = [user.first_name, user.last_name]
    .filter(Boolean)
    .join(" ")
    .trim();
  if (fullName) return fullName;
  if (user.user_name) return user.user_name;
  if (user.email) return user.email;
  return "Unnamed user";
};

const SCHEDULE_STATUSES = ["Not Started", "In-Process", "Completed"];

export default function AuditScheduling() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const { programId, auditArea, uId } = router.query;
  const [selectedProcess, setSelectedProcess] = useState(null);
  const [planningId, setPlanningId] = useState(null);

  // form state
  const [infoData, setInfoData] = useState({
    auditPeriod: "",
    auditID: "",
    auditScope: "",
    location: "",
    auditCriteria: "",
    managementStandard: "",
    auditProgram: "",
    remoteTools: "",
    reviewPlan: "",
    auditObjectives: "",
    auditCriteriaDetails: "",
  });
  const [participants, setParticipants] = useState({
    auditTeamMembers: [],
    auditeeTeamMembers: [],
    lead: "",
    manager: "",
  });

  const [teams, setTeams] = useState([]);
  const [filteredTeams, setFilteredTeams] = useState([]);
  const [selectedAuditTeamId, setSelectedAuditTeamId] = useState("");
  const [selectedAuditeeTeamId, setSelectedAuditeeTeamId] = useState("");

  // Load all teams once
  useEffect(() => {
    CustomAxios.get(`${baseurl}/${initURL}/teams`)
      .then(({ data }) => setTeams(data))
      .catch(console.error);
  }, []);
  const [scheduleStatus, setScheduleStatus] = useState("");
  const [comments, setComments] = useState("");
  const [plannedStart, setPlannedStart] = useState("");
  const [plannedEnd, setPlannedEnd] = useState("");
  // 👇 stable callback so TeamAndCompanyForm sees the same function every render
  const handleParticipantsChange = useCallback((upd) => {
    setParticipants((prev) => ({ ...prev, ...upd }));
  }, []);

  // 2️⃣ fetch existing Audit-Area-Planning record
  useEffect(() => {
    if (!uId) return;
    setLoading(true);
    const fetchExistingPlanning = async () => {
      try {
        const { data } = await CustomAxios.get(
          `${baseurl}/${initURL}/audit-area-planning/universe/${uId}`,
        );

        console.log("data inside then:", data);
        setPlanningId(data?._id ?? "");

        // hydrate your "info" section
        setInfoData({
          auditPeriod: data?.auditPeriod ?? "",
          auditID: data?.auditID ?? "",
          auditScope: data?.auditScope ?? "",
          location: data?.location ?? "",
          auditCriteria: data?.auditCriteria ?? "",
          managementStandard: data?.managementStandard ?? "",
          auditProgram: data?.auditProgram ?? "",
          remoteTools: data?.remoteTools ?? "",
          reviewPlan: data?.reviewPlan ?? "",
          auditObjectives: data?.auditObjectives ?? "",
          auditCriteriaDetails: data?.auditCriteriaDetails ?? "",
        });

        // hydrate participants & lead/manager
        setParticipants({
          auditTeamMembers:
            data?.auditTeamMembers?.map((m) => ({
              teamId: m.teamId?._id ?? "",
              teamName: m.teamId?.name ?? "",
              userId: m.userId?._id ?? "",
              name: `${m.userId?.first_name ?? ""} ${m.userId?.last_name ?? ""}`.trim(),
              email: m.userId?.email ?? "",
            })) ?? [],

          auditeeTeamMembers:
            data?.auditeeTeamMembers?.map((m) => ({
              teamId: m.teamId?._id ?? "",
              teamName: m.teamId?.name ?? "",
              userId: m.userId?._id ?? "",
              name: `${m.userId?.first_name ?? ""} ${m.userId?.last_name ?? ""}`.trim(),
              email: m.userId?.email ?? "",
            })) ?? [],

          lead: data?.lead?._id ?? "",
          manager: data?.manager?._id ?? "",
        });

        // dates (slice only if present)
        setPlannedStart(data?.auditStartDate?.slice(0, 10) ?? "");
        setPlannedEnd(data?.auditEndDate?.slice(0, 10) ?? "");

        // status & comments
        setScheduleStatus(data?.auditStatus ?? "");
        setComments(data?.comments ?? "");
      } catch (err) {
        console.log("No existing planning found", err);
      } finally {
        setLoading(false);
      }
    };

    fetchExistingPlanning();
  }, [programId, auditArea, uId]);

  const handleSave = async () => {
    if (!selectedProcess) {
      toast.error("Select an audit topic first");
      return;
    }

    const missingFields = [];

    // General Info checks
    Object.entries(infoData).forEach(([key, value]) => {
      if (!value || value.trim() === "") {
        missingFields.push(key);
      }
    });

    // Team checks
    if (participants.auditTeamMembers.length === 0) {
      missingFields.push("Audit Team Members");
    }
    if (participants.auditeeTeamMembers.length === 0) {
      missingFields.push("Auditee Team Members");
    }
    if (!participants.lead) {
      missingFields.push("Audit Lead");
    }
    if (!participants.manager) {
      missingFields.push("Audit Manager");
    }

    // Schedule info
    if (!scheduleStatus) {
      missingFields.push("Schedule Status");
    }
    if (!plannedStart || !plannedEnd) {
      missingFields.push("Planned Start/End Dates");
    }

    if (missingFields.length > 0) {
      toast.error(`Please complete: ${missingFields.join(", ")}`);
      return;
    }

    const payload = {
      programID: programId,
      auditTopic: auditArea,
      ...infoData,
      auditTeamMembers: participants.auditTeamMembers.map((m) => ({
        teamId: m.teamId,
        userId: m.userId,
      })),
      auditeeTeamMembers: participants.auditeeTeamMembers.map((m) => ({
        teamId: m.teamId,
        userId: m.userId,
      })),
      lead: participants.lead,
      manager: participants.manager,
      auditStatus: scheduleStatus,
      comments,
      universeId: uId,
    };
    setLoading(true);
    try {
      if (planningId) {
        // PATCH existing
        await CustomAxios.patch(
          `${baseurl}/${initURL}/audit-area-planning/${planningId}`,
          payload,
        );
        toast.success("Audit Area Planning updated!");
      } else {
        // POST new
        const res = await CustomAxios.post(
          `${baseurl}/${initURL}/audit-area-planning`,
          payload,
        );
        setPlanningId(res.data._id); // in case user hits Save again
        toast.success("Audit Area Planning saved!");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to save.");
    } finally {
      setLoading(false);
    }
  };

  // place this near the top of your component, before handleAddAuditTeam, etc.
  const fetchAndAddMembers = async (teamId, teamName, memberKey) => {
    const existing = participants[memberKey] || [];
    // avoid dupes
    if (!teamId || existing.some((m) => m.teamId === teamId)) return;

    try {
      const { data } = await CustomAxios.get(
        `${baseurl}/${initURL}/team-members/by-team/${teamId}`,
      );
      const newMembers = data.map((m) => ({
        teamId,
        teamName,
        userId: m.userId._id,
        name: formatUserLabel(m.userId),
        email: m.userId.email,
      }));
      // merge into participants.auditTeamMembers or participants.auditeeTeamMembers
      handleParticipantsChange({
        [memberKey]: existing.concat(newMembers),
      });
    } catch (err) {
      console.error(err);
    }
  };

  const fieldClass =
    "w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400";
  const labelClass = "block text-gray-700 font-medium mb-1";

  const handleAddAuditTeam = () => {
    const team = filteredTeams.find((t) => t._id === selectedAuditTeamId);
    if (team) {
      fetchAndAddMembers(team._id, team.name, "auditTeamMembers");
      setSelectedAuditTeamId("");
    }
  };

  const handleAddAuditeeTeam = () => {
    const team = filteredTeams.find((t) => t._id === selectedAuditeeTeamId);
    if (team) {
      fetchAndAddMembers(team._id, team.name, "auditeeTeamMembers");
      setSelectedAuditeeTeamId("");
    }
  };

  useEffect(() => {
    CustomAxios.get(`${baseurl}/${initURL}/teams`)
      .then(({ data }) => setTeams(data))
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (selectedProcess?.department?._id) {
      const deptId = selectedProcess.department._id;
      setFilteredTeams(teams.filter((t) => t.departmentId === deptId));
    } else {
      setFilteredTeams([]);
    }
    // Reset picks
    setSelectedAuditTeamId("");
    setSelectedAuditeeTeamId("");
  }, [teams, selectedProcess]);

  const removeMember = (index, memberKey) => {
    handleParticipantsChange({
      [memberKey]: participants[memberKey].filter((_, i) => i !== index),
    });
  };

  if (loading) {
    return (
      <div className="h-[75vh] flex items-center justify-center">
        <Loader />
      </div>
    );
  }

  return (
    <div className="p-6 bg-white rounded-2xl shadow-lg space-y-8">
      <ProcessOverview
        setSelectedProcess={setSelectedProcess}
        selectedProcess={selectedProcess}
      />

      <IndernalAuditSection title="Schedule Information" icon={FiInfo}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className={labelClass}>Schedule Status</label>
            <select
              value={scheduleStatus}
              onChange={(e) => setScheduleStatus(e.target.value)}
              className={`${fieldClass} text-gray-500`}
            >
              <option value="" disabled>
                Select…
              </option>
              {SCHEDULE_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={labelClass}>Planned Start</label>
            <input
              type="date"
              value={plannedStart}
              disabled
              className={fieldClass}
            />
          </div>
          <div>
            <label className={labelClass}>Planned End</label>
            <input
              type="date"
              value={plannedEnd}
              disabled
              className={fieldClass}
            />
          </div>
          <div className="md:col-span-2">
            <label className={labelClass}>Comments</label>
            <textarea
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              className={`${fieldClass} h-24`}
            />
          </div>
        </div>
      </IndernalAuditSection>

      <IndernalAuditSection title="General Information" icon={FiInfo}>
        <AuditInformationForm onChange={setInfoData} data={infoData} />
      </IndernalAuditSection>

      <IndernalAuditSection title="Audit Teams" icon={FiUser}>
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Audit Lead */}
            <div>
              <label className="block text-gray-700 font-medium mb-1">
                Audit Lead
              </label>
              <select
                value={participants.lead}
                onChange={(e) =>
                  handleParticipantsChange({ lead: e.target.value })
                }
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-indigo-400"
              >
                <option value="" disabled>
                  Select lead…
                </option>
                {participants.auditTeamMembers.map((u) => (
                  <option key={u.userId} value={u.userId}>
                    {u.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Audit Manager */}
            <div>
              <label className="block text-gray-700 font-medium mb-1">
                Audit Manager
              </label>
              <select
                value={participants.manager}
                onChange={(e) =>
                  handleParticipantsChange({ manager: e.target.value })
                }
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-indigo-400"
              >
                <option value="" disabled>
                  Select manager…
                </option>
                {participants.auditTeamMembers.map((u) => (
                  <option key={u.userId} value={u.userId}>
                    {u.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Audit Team Picker + Table */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Audit Team</h3>
              <div className="flex space-x-2 mb-4">
                <select
                  className="flex-1 border border-gray-300 rounded-md px-4 py-2"
                  value={selectedAuditTeamId}
                  onChange={(e) => setSelectedAuditTeamId(e.target.value)}
                >
                  <option value="">Select a team</option>
                  {filteredTeams.map((t) => (
                    <option key={t._id} value={t._id}>
                      {t.name} ({t.teamType})
                    </option>
                  ))}
                </select>
                <button
                  onClick={handleAddAuditTeam}
                  disabled={!selectedAuditTeamId}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md disabled:opacity-50"
                >
                  Add Team
                </button>
              </div>
              {participants.auditTeamMembers.length > 0 && (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 rounded-md">
                    <thead className="bg-blue-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-600 uppercase">
                          Team
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-600 uppercase">
                          Name
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-600 uppercase">
                          Email
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {participants.auditTeamMembers.map((m, idx) => (
                        <tr key={`${m.teamId}-${m.userId}`}>
                          <td className="px-4 py-3">{m.teamName}</td>
                          <td className="px-4 py-3">{m.name}</td>
                          <td className="px-4 py-3">{m.email}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Auditee Team Picker + Table */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Auditee Team</h3>
              <div className="flex space-x-2 mb-4">
                <select
                  className="flex-1 border border-gray-300 rounded-md px-4 py-2"
                  value={selectedAuditeeTeamId}
                  onChange={(e) => setSelectedAuditeeTeamId(e.target.value)}
                >
                  <option value="">Select a team</option>
                  {filteredTeams.map((t) => (
                    <option key={t._id} value={t._id}>
                      {t.name} ({t.teamType})
                    </option>
                  ))}
                </select>
                <button
                  onClick={handleAddAuditeeTeam}
                  disabled={!selectedAuditeeTeamId}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md disabled:opacity-50"
                >
                  Add Team
                </button>
              </div>
              {participants.auditeeTeamMembers.length > 0 && (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 rounded-md">
                    <thead className="bg-blue-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-600 uppercase">
                          Team
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-600 uppercase">
                          Name
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-600 uppercase">
                          Email
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {participants.auditeeTeamMembers.map((m, idx) => (
                        <tr key={`${m.teamId}-${m.userId}`}>
                          <td className="px-4 py-3">{m.teamName}</td>
                          <td className="px-4 py-3">{m.name}</td>
                          <td className="px-4 py-3">{m.email}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </IndernalAuditSection>

      <div className="flex justify-end">
        <button
          onClick={handleSave}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg"
        >
          Save Planning
        </button>
      </div>
    </div>
  );
}
