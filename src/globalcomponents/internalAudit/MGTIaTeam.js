// src/components/MGTIaTeam.js
import React, { useEffect, useState } from "react";
import CustomAxios from "@/globalcomponents/CustomAxios";
import { baseurl, initURL } from "../../../BaseUrl";
import { Users, Info, Calendar, ShieldCheck } from "lucide-react";
import { FaTrash } from "react-icons/fa";
import Loader from "../loader/Loader";

export default function MGTIaTeam() {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedTeamId, setSelectedTeamId] = useState("");
  const [teamMembers, setTeamMembers] = useState([]);

  // load all teams
  useEffect(() => {
    setLoading(true);
    CustomAxios.get(`${baseurl}/${initURL}/teams`)
      .then(({ data }) => {
        setTeams(data)
        if (data.length > 0 && !selectedTeamId) {
          setSelectedTeamId(data[0]._id);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // load members when selection changes
  useEffect(() => {
    if (!selectedTeamId) {
      setTeamMembers([]);
      return;
    }
    setLoading(true);
    CustomAxios.get(`${baseurl}/${initURL}/team-members/by-team/${selectedTeamId}`)
      .then(({ data }) =>
        setTeamMembers(
          data.map((m) => ({
            id: m._id,
            name: `${m.userId.first_name} ${m.userId.last_name}`,
            email: m.userId.email,
            designation: m.userId.user_designation,
          }))
        )
      )
      .catch(() => setTeamMembers([]))
      .finally(() => setLoading(false));
  }, [selectedTeamId]);

  const removeMember = (id) =>
    setTeamMembers((prev) => prev.filter((m) => m.id !== id));

  // selected team object for details
  const selectedTeam = teams.find((t) => t._id === selectedTeamId);

  if (loading) {
    return (
      <div className="h-[75vh] flex items-center justify-center">
        <Loader />
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 rounded-lg shadow-lg space-y-8">
      {/* Team selector */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex items-center mb-4 space-x-3">
          <Users size={24} className="text-indigo-600" />
          <h2 className="text-xl font-semibold">Teams</h2>
        </div>
        <select
          value={selectedTeamId}
          onChange={(e) => setSelectedTeamId(e.target.value)}
          className="block w-full bg-white border border-gray-300 rounded-lg px-3 py-2 pr-9 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"

        >
          <option value="">-- Select Team --</option>
          {teams.map((t) => (
            <option key={t._id} value={t._id}>
              {t.name} ({t.teamType})
            </option>
          ))}
        </select>

      </div>

      {/* Team details */}
      {selectedTeam && (
        <div className="bg-white p-6 rounded-lg shadow-md grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-start space-x-2">
            <Info className="text-blue-500" />
            <div>
              <p className="text-sm text-gray-500 uppercase">Description</p>
              <p className="font-medium text-gray-800">{selectedTeam.description || "—"}</p>
            </div>
          </div>
          <div className="flex items-start space-x-2">
            <Info className="text-green-500" />
            <div>
              <p className="text-sm text-gray-500 uppercase">Domains</p>
              <p className="font-medium text-gray-800">
                {selectedTeam.domains.length > 0
                  ? selectedTeam.domains.join(", ")
                  : "—"}
              </p>
            </div>
          </div>
          <div className="flex items-start space-x-2">
            <Calendar className="text-purple-500" />
            <div>
              <p className="text-sm text-gray-500 uppercase">Created</p>
              <p className="font-medium text-gray-800">
                {new Date(selectedTeam.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-2">
            <Info className="text-yellow-500" />
            <div>
              <p className="text-sm text-gray-500 uppercase">Department </p>
              <p className="font-medium text-gray-800">{selectedTeam?.department?.departmentName}</p>
            </div>
          </div>
          <div className="flex items-start space-x-2">
            <Info className="text-teal-500" />
            <div>
              <p className="text-sm text-gray-500 uppercase">Team Lead</p>
              <p className="font-medium text-gray-800">{selectedTeam?.teamLead?.user_name || selectedTeam?.teamLead?.first_name}</p>
            </div>
          </div>
        </div>
      )}

      {/* Members table */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex items-center mb-4 space-x-3">
          <ShieldCheck size={24} className="text-green-600" />
          <h2 className="text-xl font-semibold">Team Members</h2>
        </div>
        {teamMembers?.length > 0 ? (
          <div className="overflow-x-auto rounded-lg">
            <table className="w-full divide-y divide-gray-200 rounded-lg">
              <thead className="bg-[#2B245C] text-white">
                <tr>
                  {["Name", "Email", "Designation"].map((h) => (
                    <th key={h} className="px-4 py-2 text-left text-sm uppercase">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {teamMembers.map((m) => (
                  <tr key={m.id} className="hover:bg-gray-50">
                    <td className="px-4 py-2">{m.name}</td>
                    <td className="px-4 py-2">{m.email}</td>
                    <td className="px-4 py-2">{m.designation}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-center text-gray-500">No data found.</p>
        )}
      </div>

    </div>
  );
}
