// src/components/TeamAndCompanyForm.js
import CustomAxios from "@/globalcomponents/CustomAxios";
import { useCallback, useEffect, useRef, useState } from "react";
import { FaTrash } from "react-icons/fa";
import { baseurl, initURL } from "../../../../BaseUrl";

export default function TeamAndCompanyForm({
    onParticipantsChange,
    selectedTopicObj,
    initialParticipants
}) {
    const [lead, setLead] = useState("");
    const [manager, setManager] = useState("");
    console.log(initialParticipants)
    const [teams, setTeams] = useState([]);
    const [filteredTeams, setFilteredTeams] = useState([]);
    const didHydrateRef = useRef(false)

    const [selectedAuditTeamId, setSelectedAuditTeamId] = useState("");
    const [auditTeamMembers, setAuditTeamMembers] = useState([]);

    const [selectedAuditeeTeamId, setSelectedAuditeeTeamId] = useState("");
    const [auditeeTeamMembers, setAuditeeTeamMembers] = useState([]);

    // Load all teams once
    useEffect(() => {
        CustomAxios.get(`${baseurl}/${initURL}/teams`)
            .then(({ data }) => setTeams(data))
            .catch(console.error);
    }, []);

    // Whenever the topic changes, filter teams by department
    useEffect(() => {
        if (selectedTopicObj?.department?._id) {
            const deptId = selectedTopicObj.department._id;
            setFilteredTeams(teams.filter(t => t.departmentId === deptId));
        } else {
            setFilteredTeams([]);
        }
        // Reset picks
        setSelectedAuditTeamId("");
        setSelectedAuditeeTeamId("");
        setAuditTeamMembers([]);
        setAuditeeTeamMembers([]);
    }, [teams, selectedTopicObj]);

    // Fetch and append team members helper
    const fetchAndAddMembers = async (teamId, teamName, setter, current) => {
        if (!teamId || current.some(m => m.teamId === teamId)) return;
        try {
            const { data } = await CustomAxios.get(
                `${baseurl}/${initURL}/team-members/by-team/${teamId}`
            );
            const newMembers = data.map(m => ({
                teamId,
                teamName,
                id: m._id,
                userId: m.userId._id,
                name: `${m.userId.first_name} ${m.userId.last_name}`,
                email: m.userId.email,
            }));
            setter(current.concat(newMembers));
        } catch {
            // ignore
        }
    };

    // Handlers to add audit/auditee teams
    const handleAddAuditTeam = () => {
        const team = filteredTeams.find(t => t._id === selectedAuditTeamId);
        if (team) {
            fetchAndAddMembers(
                team._id,
                team.name,
                setAuditTeamMembers,
                auditTeamMembers
            );
            setSelectedAuditTeamId("");
        }
    };
    const handleAddAuditeeTeam = () => {
        const team = filteredTeams.find(t => t._id === selectedAuditeeTeamId);
        if (team) {
            fetchAndAddMembers(
                team._id,
                team.name,
                setAuditeeTeamMembers,
                auditeeTeamMembers
            );
            setSelectedAuditeeTeamId("");
        }
    };

    // Remove a member
    const removeMember = (idx, type) => {
        if (type === "audit") {
            setAuditTeamMembers(prev => prev.filter((_, i) => i !== idx));
        } else {
            setAuditeeTeamMembers(prev => prev.filter((_, i) => i !== idx));
        }
    };
    useEffect(() => {
             if (!didHydrateRef.current && initialParticipants) {
                   setAuditTeamMembers(initialParticipants.auditTeamMembers || []);
                   setAuditeeTeamMembers(initialParticipants.auditeeTeamMembers || []);
                   setLead(initialParticipants.lead || "");
                   setManager(initialParticipants.manager || "");
                   didHydrateRef.current = true;
                 }
           }, [initialParticipants]);
    // Notify parent of changes
    useEffect(() => {
        if (!didHydrateRef.current) return;
        onParticipantsChange({
            auditTeamMembers,
            auditeeTeamMembers,
            lead,
            manager,
        });
    }, [auditTeamMembers, auditeeTeamMembers, lead, manager, onParticipantsChange]);


    const labelClass = "block text-gray-700 font-medium mb-1";
    const fieldClass = "w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-indigo-400";

    // Render function for team sections (unchanged)
    const renderSection = (
        title,
        selectedTeamId,
        setSelectedTeamId,
        onAdd,
        members,
        type
    ) => (
        <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-3">{title}</h3>
            <div className="flex space-x-2 mb-4">
                <select
                    className="flex-1 border border-gray-300 rounded-md px-4 py-2"
                    value={selectedTeamId}
                    onChange={e => setSelectedTeamId(e.target.value)}
                >
                    <option value="">Select a team</option>
                    {filteredTeams.map(t => (
                        <option key={t._id} value={t._id}>
                            {t.name} ({t.teamType})
                        </option>
                    ))}
                </select>
                <button
                    onClick={onAdd}
                    disabled={!selectedTeamId}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md disabled:opacity-50"
                >
                    Add Team
                </button>
            </div>
            {members.length > 0 && (
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 rounded-md">
                        <thead className="bg-blue-50">
                            <tr>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-600 uppercase">Team</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-600 uppercase">Name</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-600 uppercase">Email</th>
                                <th className="px-4 py-2 text-center text-xs font-medium text-gray-600 uppercase">Action</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {members.map((m, idx) => (
                                <tr key={`${m.teamId}-${m.id}`}>
                                    <td className="px-4 py-3">{m.teamName}</td>
                                    <td className="px-4 py-3">{m.name}</td>
                                    <td className="px-4 py-3">{m.email}</td>
                                    <td className="px-4 py-3 text-center">
                                        <button onClick={() => removeMember(idx, type)} className="text-red-600 hover:text-red-800">
                                            <FaTrash />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );

    return (
        <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Audit Lead */}
                <div>
                    <label className={labelClass}>Audit Lead</label>
                    <select
                        value={lead}
                        onChange={e => setLead(e.target.value)}
                        className={fieldClass}
                    >
                        <option value="" disabled>Select lead…</option>
                        {auditTeamMembers.map(u => (
                            <option key={u.id} value={u.id}>{u.name}</option>
                        ))}
                    </select>
                </div>

                {/* Audit Manager */}
                <div>
                    <label className={labelClass}>Audit Manager</label>
                    <select
                        value={manager}
                        onChange={e => setManager(e.target.value)}
                        className={fieldClass}
                    >
                        <option value="" disabled>Select manager…</option>
                        {auditTeamMembers.map(u => (
                            <option key={u.id} value={u.id}>{u.name}</option>
                        ))}
                    </select>
                </div>

                {renderSection(
                    "Audit Team",
                    selectedAuditTeamId,
                    setSelectedAuditTeamId,
                    handleAddAuditTeam,
                    auditTeamMembers,
                    "audit"
                )}
                {renderSection(
                    "Auditee Team",
                    selectedAuditeeTeamId,
                    setSelectedAuditeeTeamId,
                    handleAddAuditeeTeam,
                    auditeeTeamMembers,
                    "auditee"
                )}
            </div>
        </div>
    );
}
