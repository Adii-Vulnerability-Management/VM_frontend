import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import CustomAxios from "@/globalcomponents/CustomAxios";
import Loader from "@/globalcomponents/loader/Loader";
import { baseurl, initURL } from "../../../../../BaseUrl";

// Modal for editing team details
const EditTeamModal = ({ team, onClose, onUpdate }) => {
  const [formData, setFormData] = useState({ ...team });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // Only required fields will be validated.
  const requiredFields = [
    "teamName",
    "teamLeader",
    "teamEmail",
    "teamMembersCount",
    "teamDepartment",
    "teamDescription",
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};
    requiredFields.forEach((key) => {
      if (!formData[key]) newErrors[key] = "This field is required.";
    });
    if (formData.teamEmail && !validateEmail(formData.teamEmail)) {
      newErrors.teamEmail = "Invalid email format.";
    }
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setLoading(true);
    try {
      const response = await CustomAxios.put(
        `${baseurl}/${initURL}/team-management/update-team/${formData.id}`,
        formData,
        { headers: { "Content-Type": "application/json" } }
      );
      if (response.status === 200 || response.status === 201) {
        toast.success("Team updated successfully!");
        onUpdate(formData);
        onClose();
      } else {
        toast.error("Failed to update team.");
      }
    } catch (error) {
      let errorMessage = "An error occurred while updating the team.";
      if (error.response?.data?.message) {
        if (
          Array.isArray(error.response.data.message) &&
          error.response.data.message.length > 0
        ) {
          errorMessage = error.response.data.message[0];
        } else if (typeof error.response.data.message === "string") {
          errorMessage = error.response.data.message;
        }
      }
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-md w-11/12 md:w-2/3 p-6 relative overflow-auto max-h-screen">
        <h2 className="text-xl font-bold mb-4">Edit Team</h2>
        <form onSubmit={handleSubmit} method="POST">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Team Name */}
            <div className="flex flex-col">
              <label className="text-sm mb-1">
                Team Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="teamName"
                value={formData.teamName}
                onChange={handleInputChange}
                placeholder="Enter team name"
                className="p-2 border border-gray-300 rounded-md focus:outline-none"
              />
              {errors.teamName && (
                <span className="text-xs text-red-500 mt-1">
                  {errors.teamName}
                </span>
              )}
            </div>
            {/* Team Leader */}
            <div className="flex flex-col">
              <label className="text-sm mb-1">
                Team Leader <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="teamLeader"
                value={formData.teamLeader}
                onChange={handleInputChange}
                placeholder="Enter team leader"
                className="p-2 border border-gray-300 rounded-md focus:outline-none"
              />
              {errors.teamLeader && (
                <span className="text-xs text-red-500 mt-1">
                  {errors.teamLeader}
                </span>
              )}
            </div>
            {/* Team Email */}
            <div className="flex flex-col">
              <label className="text-sm mb-1">
                Team Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                name="teamEmail"
                value={formData.teamEmail}
                onChange={handleInputChange}
                placeholder="Enter team email"
                className="p-2 border border-gray-300 rounded-md focus:outline-none"
              />
              {errors.teamEmail && (
                <span className="text-xs text-red-500 mt-1">
                  {errors.teamEmail}
                </span>
              )}
            </div>
            {/* Team Members Count */}
            <div className="flex flex-col">
              <label className="text-sm mb-1">
                Number of Members <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="teamMembersCount"
                value={formData.teamMembersCount}
                onChange={handleInputChange}
                placeholder="Enter members count"
                className="p-2 border border-gray-300 rounded-md focus:outline-none"
              />
              {errors.teamMembersCount && (
                <span className="text-xs text-red-500 mt-1">
                  {errors.teamMembersCount}
                </span>
              )}
            </div>
            {/* Team Department */}
            <div className="flex flex-col">
              <label className="text-sm mb-1">
                Department <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="teamDepartment"
                value={formData.teamDepartment}
                onChange={handleInputChange}
                placeholder="Enter department"
                className="p-2 border border-gray-300 rounded-md focus:outline-none"
              />
              {errors.teamDepartment && (
                <span className="text-xs text-red-500 mt-1">
                  {errors.teamDepartment}
                </span>
              )}
            </div>
            {/* Team Description */}
            <div className="flex flex-col col-span-2">
              <label className="text-sm mb-1">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                name="teamDescription"
                value={formData.teamDescription}
                onChange={handleInputChange}
                placeholder="Enter team description"
                className="p-2 border border-gray-300 rounded-md focus:outline-none"
                rows="3"
              ></textarea>
              {errors.teamDescription && (
                <span className="text-xs text-red-500 mt-1">
                  {errors.teamDescription}
                </span>
              )}
            </div>
          </div>
          {/* Optional Fields Toggle */}
          <div className="mt-6">
            <button
              type="button"
              onClick={() => setShowOptional(!showOptional)}
              className="mb-4 text-blue-600 hover:underline"
            >
              {showOptional ? "Hide Optional Fields" : "Show Optional Fields"}
            </button>
            {showOptional && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4 border border-dashed border-gray-300 rounded-md bg-white">
                {/* Team Risk Level */}
                <div className="flex flex-col">
                  <label className="text-sm mb-1">Team Risk Level</label>
                  <select
                    name="teamRiskLevel"
                    value={formData.teamRiskLevel}
                    onChange={handleInputChange}
                    className="p-2 border border-gray-300 rounded-md focus:outline-none"
                  >
                    <option value="">Select Risk Level</option>
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>
                {/* Team Functions */}
                <div className="flex flex-col lg:col-span-3">
                  <label className="text-sm mb-1">Team Functions</label>
                  <textarea
                    name="teamFunctions"
                    value={formData.teamFunctions}
                    onChange={handleInputChange}
                    placeholder="Describe team functions"
                    className="p-2 border border-gray-300 rounded-md focus:outline-none"
                    rows="3"
                  ></textarea>
                </div>
                {/* Audit Frequency */}
                <div className="flex flex-col">
                  <label className="text-sm mb-1">Audit Frequency</label>
                  <select
                    name="auditFrequency"
                    value={formData.auditFrequency}
                    onChange={handleInputChange}
                    className="p-2 border border-gray-300 rounded-md focus:outline-none"
                  >
                    <option value="">Select Frequency</option>
                    <option value="Monthly">Monthly</option>
                    <option value="Quarterly">Quarterly</option>
                    <option value="Annually">Annually</option>
                  </select>
                </div>
                {/* Compliance Certifications */}
                <div className="flex flex-col lg:col-span-3">
                  <label className="text-sm mb-1">
                    Compliance Certifications
                  </label>
                  <textarea
                    name="complianceCertifications"
                    value={formData.complianceCertifications}
                    onChange={handleInputChange}
                    placeholder="List relevant certifications"
                    className="p-2 border border-gray-300 rounded-md focus:outline-none"
                    rows="3"
                  ></textarea>
                </div>
                {/* Team Status */}
                <div className="flex flex-col">
                  <label className="text-sm mb-1">Team Status</label>
                  <select
                    name="teamStatus"
                    value={formData.teamStatus}
                    onChange={handleInputChange}
                    className="p-2 border border-gray-300 rounded-md focus:outline-none"
                  >
                    <option value="">Select Status</option>
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                    <option value="Transitional">Transitional</option>
                  </select>
                </div>
                {/* Team Established Date */}
                <div className="flex flex-col">
                  <label className="text-sm mb-1">Established Date</label>
                  <input
                    type="date"
                    name="teamEstablishedDate"
                    value={formData.teamEstablishedDate}
                    onChange={handleInputChange}
                    className="p-2 border border-gray-300 rounded-md focus:outline-none"
                  />
                </div>
                {/* Team Achievements */}
                <div className="flex flex-col lg:col-span-3">
                  <label className="text-sm mb-1">Team Achievements</label>
                  <textarea
                    name="teamAchievements"
                    value={formData.teamAchievements}
                    onChange={handleInputChange}
                    placeholder="List team achievements or KPIs"
                    className="p-2 border border-gray-300 rounded-md focus:outline-none"
                    rows="3"
                  ></textarea>
                </div>
              </div>
            )}
          </div>
          <div className="mt-6 flex justify-end gap-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded-md"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md flex items-center"
            >
              {loading ? <Loader /> : "Update Team"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Modal for managing employees within a team
const ManageEmployeesModal = ({ team, onClose, onUpdateEmployees }) => {
  // Assuming team.employees is an array of employee objects (each with id and name)
  const [employees, setEmployees] = useState(team.employees || []);
  const [newEmployee, setNewEmployee] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAddEmployee = () => {
    if (newEmployee.trim() !== "") {
      const updatedEmployees = [
        ...employees,
        { id: Date.now(), name: newEmployee.trim() },
      ];
      setEmployees(updatedEmployees);
      setNewEmployee("");
    }
  };

  const handleRemoveEmployee = (empId) => {
    setEmployees(employees.filter((emp) => emp.id !== empId));
  };

  const handleUpdateEmployees = async () => {
    setLoading(true);
    try {
      const response = await CustomAxios.put(
        `${baseurl}/${initURL}/team-management/update-team-employees/${team.id}`,
        { employees },
        { headers: { "Content-Type": "application/json" } }
      );
      if (response.status === 200 || response.status === 201) {
        toast.success("Team employees updated successfully!");
        onUpdateEmployees(employees);
        onClose();
      } else {
        toast.error("Failed to update team employees.");
      }
    } catch (error) {
      toast.error("An error occurred while updating team employees.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-md w-11/12 md:w-1/2 p-6 relative">
        <h2 className="text-xl font-bold mb-4">
          Manage Employees for {team.teamName}
        </h2>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">
            Add New Employee
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={newEmployee}
              onChange={(e) => setNewEmployee(e.target.value)}
              placeholder="Employee Name"
              className="flex-1 p-2 border border-gray-300 rounded-md"
            />
            <button
              onClick={handleAddEmployee}
              className="px-4 py-2 bg-green-600 text-white rounded-md"
            >
              Add
            </button>
          </div>
        </div>
        <div className="mb-4">
          <h3 className="font-semibold mb-2">Current Employees:</h3>
          {employees.length === 0 ? (
            <p>No employees added yet.</p>
          ) : (
            <ul>
              {employees.map((emp) => (
                <li
                  key={emp.id}
                  className="flex justify-between items-center mb-1 p-2 border rounded-md"
                >
                  <span>{emp.name}</span>
                  <button
                    onClick={() => handleRemoveEmployee(emp.id)}
                    className="text-red-600 hover:underline"
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="flex justify-end gap-4">
          <button onClick={onClose} className="px-4 py-2 border rounded-md">
            Cancel
          </button>
          <button
            onClick={handleUpdateEmployees}
            className="px-4 py-2 bg-blue-600 text-white rounded-md flex items-center"
          >
            {loading ? <Loader /> : "Update Employees"}
          </button>
        </div>
      </div>
    </div>
  );
};

const ManageTeams = () => {
  const [teams, setTeams] = useState([]);
  const [loadingTeams, setLoadingTeams] = useState(false);
  const [editingTeam, setEditingTeam] = useState(null);
  const [employeesTeam, setEmployeesTeam] = useState(null);

  // Fetch teams on mount
  const fetchTeams = async () => {
    setLoadingTeams(true);
    try {
      const response = await CustomAxios.get(
        `${baseurl}/${initURL}/team-management/get-teams`
      );
      if (response.status === 200) {
        setTeams(response.data); // Assumes response.data is an array of team objects
      } else {
        toast.error("Failed to fetch teams.");
      }
    } catch (error) {
      toast.error("An error occurred while fetching teams.");
    } finally {
      setLoadingTeams(false);
    }
  };

  useEffect(() => {
    fetchTeams();
  }, []);

  // Delete team handler (with confirmation)
  const handleDeleteTeam = async (teamId) => {
    if (window.confirm("Are you sure you want to delete this team?")) {
      try {
        const response = await CustomAxios.delete(
          `${baseurl}/${initURL}/team-management/delete-team/${teamId}`
        );
        if (response.status === 200 || response.status === 204) {
          toast.success("Team deleted successfully!");
          fetchTeams();
        } else {
          toast.error("Failed to delete team.");
        }
      } catch (error) {
        toast.error("An error occurred while deleting the team.");
      }
    }
  };

  // Update the team in the list after editing
  const handleUpdateTeam = (updatedTeam) => {
    setTeams((prev) =>
      prev.map((team) => (team.id === updatedTeam.id ? updatedTeam : team))
    );
  };

  // Update employees of a team after editing
  const handleUpdateTeamEmployees = (teamId, updatedEmployees) => {
    setTeams((prev) =>
      prev.map((team) =>
        team.id === teamId ? { ...team, employees: updatedEmployees } : team
      )
    );
  };

  return (
    <div className="p-4">
      <h1 className="text-4xl font-extrabold text-center text-[#2B245C] mb-6">
        Manage Teams
      </h1>
      {loadingTeams ? (
        <Loader />
      ) : (
        <div className="overflow-auto">
          <table className="min-w-full bg-white border">
            <thead>
              <tr className="bg-gray-200">
                <th className="px-4 py-2 border">Team Name</th>
                <th className="px-4 py-2 border">Leader</th>
                <th className="px-4 py-2 border">Email</th>
                <th className="px-4 py-2 border">Members Count</th>
                <th className="px-4 py-2 border">Department</th>
                <th className="px-4 py-2 border">Actions</th>
              </tr>
            </thead>
            <tbody>
              {teams.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center p-4">
                    No teams found.
                  </td>
                </tr>
              ) : (
                teams.map((team) => (
                  <tr key={team.id} className="border-t">
                    <td className="px-4 py-2 border">{team.teamName}</td>
                    <td className="px-4 py-2 border">{team.teamLeader}</td>
                    <td className="px-4 py-2 border">{team.teamEmail}</td>
                    <td className="px-4 py-2 border">
                      {team.teamMembersCount}
                    </td>
                    <td className="px-4 py-2 border">{team.teamDepartment}</td>
                    <td className="px-4 py-2 border space-x-2">
                      <button
                        onClick={() => setEditingTeam(team)}
                        className="px-3 py-1 bg-blue-500 text-white rounded-md text-sm"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => setEmployeesTeam(team)}
                        className="px-3 py-1 bg-green-500 text-white rounded-md text-sm"
                      >
                        Manage Employees
                      </button>
                      <button
                        onClick={() => handleDeleteTeam(team.id)}
                        className="px-3 py-1 bg-red-500 text-white rounded-md text-sm"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
      {/* Edit Team Modal */}
      {editingTeam && (
        <EditTeamModal
          team={editingTeam}
          onClose={() => setEditingTeam(null)}
          onUpdate={handleUpdateTeam}
        />
      )}
      {/* Manage Employees Modal */}
      {employeesTeam && (
        <ManageEmployeesModal
          team={employeesTeam}
          onClose={() => setEmployeesTeam(null)}
          onUpdateEmployees={(updatedEmployees) => {
            handleUpdateTeamEmployees(employeesTeam.id, updatedEmployees);
          }}
        />
      )}
    </div>
  );
};

export default ManageTeams;
