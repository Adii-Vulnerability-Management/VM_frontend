import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import CustomAxios from "@/config/CustomAxios";
import Loader from "@/components/ui/Loader";
import { baseurl , initURL } from "@/config/config";

// Modal for editing department details
const EditDepartmentModal = ({ department, onClose, onUpdate }) => {
  const [formData, setFormData] = useState({ ...department });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // Only required fields are validated.
  const requiredFields = [
    "departmentName",
    "departmentHead",
    "departmentContact",
    "departmentEmail",
    "departmentEmployees",
    "departmentLocation",
    "departmentCode",
    "departmentFunctions",
  ];

  // Update state on input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  // Global phone number validation
  const validateDepartmentContact = (contact) =>
    /^\+?[0-9]{7,15}$/.test(contact);
  const validateDepartmentEmail = (email) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};

    requiredFields.forEach((key) => {
      if (!formData[key]) newErrors[key] = "This field is required.";
    });

    if (
      formData.departmentContact &&
      !validateDepartmentContact(formData.departmentContact)
    ) {
      newErrors.departmentContact =
        "Contact must be a valid phone number (7-15 digits, optionally starting with '+').";
    }
    if (
      formData.departmentEmail &&
      !validateDepartmentEmail(formData.departmentEmail)
    ) {
      newErrors.departmentEmail = "Invalid email format.";
    }

    if (Object.keys(newErrors).length) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      const response = await CustomAxios.patch(
        `${baseurl}/${initURL}/ghub-department/${formData.id}`,
        formData,
        { headers: { "Content-Type": "application/json" } }
      );

      if (response.status === 200 || response.status === 201) {
        toast.success("Department updated successfully!");
        onUpdate(formData);
        onClose();
      } else {
        toast.error("Failed to update department.");
      }
    } catch (error) {
      let errorMessage = "An error occurred while updating the department.";
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
        <h2 className="text-xl font-bold mb-4">Edit Department</h2>
        <form onSubmit={handleSubmit} method="POST">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4">
            {/* Re-use fields from AddDepartment with updated names */}
            <div className="flex flex-col lg:col-span-3">
              <label className="text-sm mb-1 text-gray-700">
                <span className="text-red-600 mr-1">*</span>Department Name
              </label>
              <input
                type="text"
                name="departmentName"
                value={formData.departmentName}
                onChange={handleInputChange}
                placeholder="Enter Department Name"
                required
                className="p-2 border border-gray-200 rounded-md"
              />
              {errors.departmentName && (
                <span className="text-xs text-red-600 mt-1">
                  {errors.departmentName}
                </span>
              )}
            </div>
            <div className="flex flex-col">
              <label className="text-sm mb-1 text-[#2B245C]">
                <span className="text-red-600 mr-1">*</span>Department Head
              </label>
              <input
                type="text"
                name="departmentHead"
                value={formData.departmentHead}
                onChange={handleInputChange}
                placeholder="Enter Department Head Name"
                required
                className="p-2 border border-gray-200 rounded-md"
              />
              {errors.departmentHead && (
                <span className="text-xs text-red-600 mt-1">
                  {errors.departmentHead}
                </span>
              )}
            </div>
            <div className="flex flex-col">
              <label className="text-sm mb-1 text-[#2B245C]">
                <span className="text-red-600 mr-1">*</span>Department Contact
              </label>
              <input
                type="tel"
                name="departmentContact"
                value={formData.departmentContact}
                onChange={handleInputChange}
                placeholder="Enter phone number"
                required
                className="p-2 border border-gray-200 rounded-md"
              />
              {errors.departmentContact && (
                <span className="text-xs text-red-600 mt-1">
                  {errors.departmentContact}
                </span>
              )}
            </div>
            <div className="flex flex-col">
              <label className="text-sm mb-1 text-[#2B245C]">
                <span className="text-red-600 mr-1">*</span>Department Email
              </label>
              <input
                type="email"
                name="departmentEmail"
                value={formData.departmentEmail}
                onChange={handleInputChange}
                placeholder="example@example.com"
                required
                className="p-2 border border-gray-200 rounded-md"
              />
              {errors.departmentEmail && (
                <span className="text-xs text-red-600 mt-1">
                  {errors.departmentEmail}
                </span>
              )}
            </div>
            <div className="flex flex-col">
              <label className="text-sm mb-1 text-[#2B245C]">
                <span className="text-red-600 mr-1">*</span>Number of Employees
              </label>
              <input
                type="number"
                name="departmentEmployees"
                value={formData.departmentEmployees}
                onChange={handleInputChange}
                placeholder="Enter number of employees"
                required
                className="p-2 border border-gray-200 rounded-md"
              />
              {errors.departmentEmployees && (
                <span className="text-xs text-red-600 mt-1">
                  {errors.departmentEmployees}
                </span>
              )}
            </div>
            <div className="flex flex-col">
              <label className="text-sm mb-1 text-[#2B245C]">
                <span className="text-red-600 mr-1">*</span>Department Location
              </label>
              <input
                type="text"
                name="departmentLocation"
                value={formData.departmentLocation}
                onChange={handleInputChange}
                placeholder="Enter department location"
                required
                className="p-2 border border-gray-200 rounded-md"
              />
              {errors.departmentLocation && (
                <span className="text-xs text-red-600 mt-1">
                  {errors.departmentLocation}
                </span>
              )}
            </div>
            <div className="flex flex-col">
              <label className="text-sm mb-1 text-[#2B245C]">
                <span className="text-red-600 mr-1">*</span>Department Code
              </label>
              <input
                type="text"
                name="departmentCode"
                value={formData.departmentCode}
                onChange={handleInputChange}
                placeholder="Enter department code"
                required
                className="p-2 border border-gray-200 rounded-md"
              />
              {errors.departmentCode && (
                <span className="text-xs text-red-600 mt-1">
                  {errors.departmentCode}
                </span>
              )}
            </div>
            <div className="flex flex-col lg:col-span-3">
              <label className="text-sm mb-1 text-[#2B245C]">
                <span className="text-red-600 mr-1">*</span>Department Functions
              </label>
              <textarea
                name="departmentFunctions"
                value={formData.departmentFunctions}
                onChange={handleInputChange}
                placeholder="Describe the department functions"
                required
                className="p-2 border border-gray-200 rounded-md min-h-[100px]"
              />
              {errors.departmentFunctions && (
                <span className="text-xs text-red-600 mt-1">
                  {errors.departmentFunctions}
                </span>
              )}
            </div>

            {/* Optional Fields can be included here as needed */}
            <div className="flex flex-col">
              <label className="text-sm mb-1 text-[#2B245C]">
                Department Risk Level
              </label>
              <select
                name="departmentRiskLevel"
                value={formData.departmentRiskLevel}
                onChange={handleInputChange}
                className="p-2 border border-gray-200 rounded-md"
              >
                <option value="">Select Risk Level</option>
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>
            <div className="flex flex-col lg:col-span-3">
              <label className="text-sm mb-1 text-[#2B245C]">
                Department Description / Overview
              </label>
              <textarea
                name="departmentDescription"
                value={formData.departmentDescription}
                onChange={handleInputChange}
                placeholder="Brief description"
                className="p-2 border border-gray-200 rounded-md min-h-[80px]"
              />
            </div>
            <div className="flex flex-col">
              <label className="text-sm mb-1 text-[#2B245C]">
                Audit Frequency
              </label>
              <select
                name="auditFrequency"
                value={formData.auditFrequency}
                onChange={handleInputChange}
                className="p-2 border border-gray-200 rounded-md"
              >
                <option value="">Select Frequency</option>
                <option value="Monthly">Monthly</option>
                <option value="Quarterly">Quarterly</option>
                <option value="Annually">Annually</option>
              </select>
            </div>
            <div className="flex flex-col lg:col-span-3">
              <label className="text-sm mb-1 text-[#2B245C]">
                Compliance Requirements
              </label>
              <textarea
                name="complianceRequirements"
                value={formData.complianceRequirements}
                onChange={handleInputChange}
                placeholder="Regulatory standards etc."
                className="p-2 border border-gray-200 rounded-md min-h-[80px]"
              />
            </div>
            <div className="flex flex-col">
              <label className="text-sm mb-1 text-[#2B245C]">
                Department Status
              </label>
              <select
                name="departmentStatus"
                value={formData.departmentStatus}
                onChange={handleInputChange}
                className="p-2 border border-gray-200 rounded-md"
              >
                <option value="">Select Status</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
                <option value="Transitional">Transitional</option>
              </select>
            </div>
            <div className="flex flex-col">
              <label className="text-sm mb-1 text-[#2B245C]">
                Parent Department
              </label>
              <input
                type="text"
                name="parentDepartment"
                value={formData.parentDepartment}
                onChange={handleInputChange}
                placeholder="Enter parent department if any"
                className="p-2 border border-gray-200 rounded-md"
              />
            </div>
            <div className="flex flex-col lg:col-span-3">
              <label className="text-sm mb-1 text-[#2B245C]">
                Risk Mitigation Measures
              </label>
              <textarea
                name="riskMitigationMeasures"
                value={formData.riskMitigationMeasures}
                onChange={handleInputChange}
                placeholder="Risk mitigation details"
                className="p-2 border border-gray-200 rounded-md min-h-[80px]"
              />
            </div>
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
              className="px-4 py-2 bg-[#1e284e] text-white rounded-md flex items-center"
            >
              {loading ? <Loader /> : "Update Department"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Modal for managing teams within a department
const ManageTeamsModal = ({ department, onClose, onUpdateTeams }) => {
  // Assume department.teams is an array of strings
  const [teams, setTeams] = useState(department.teams || []);
  const [newTeam, setNewTeam] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAddTeam = () => {
    if (newTeam.trim() !== "") {
      const updatedTeams = [...teams, newTeam.trim()];
      setTeams(updatedTeams);
      setNewTeam("");
    }
  };

  const handleRemoveTeam = (teamToRemove) => {
    setTeams(teams.filter((team) => team !== teamToRemove));
  };

  const handleUpdateTeams = async () => {
    setLoading(true);
    try {
      const response = await CustomAxios.patch(
        `${baseurl}/${initURL}/ghub-department/${department.id}`,
        { teams },
        { headers: { "Content-Type": "application/json" } }
      );
      if (response.status === 200 || response.status === 201) {
        toast.success("Teams updated successfully!");
        onUpdateTeams(teams);
        onClose();
      } else {
        toast.error("Failed to update teams.");
      }
    } catch (error) {
      toast.error("An error occurred while updating teams.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-md w-11/12 md:w-1/2 p-6 relative">
        <h2 className="text-xl font-bold mb-4">
          Manage Teams for {department.departmentName}
        </h2>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Add New Team</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={newTeam}
              onChange={(e) => setNewTeam(e.target.value)}
              placeholder="Team Name"
              className="flex-1 p-2 border border-gray-200 rounded-md"
            />
            <button
              onClick={handleAddTeam}
              className="px-4 py-2 bg-blue-600 text-white rounded-md"
            >
              Add
            </button>
          </div>
        </div>
        <div className="mb-4">
          <h3 className="font-semibold mb-2">Current Teams:</h3>
          {teams.length === 0 ? (
            <p>No teams added yet.</p>
          ) : (
            <ul>
              {teams.map((team, index) => (
                <li
                  key={index}
                  className="flex justify-between items-center mb-1 p-2 border rounded-md"
                >
                  <span>{team}</span>
                  <button
                    onClick={() => handleRemoveTeam(team)}
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
            onClick={handleUpdateTeams}
            className="px-4 py-2 bg-[#1e284e] text-white rounded-md flex items-center"
          >
            {loading ? <Loader /> : "Update Teams"}
          </button>
        </div>
      </div>
    </div>
  );
};

const ManageDepartment = () => {
  const [departments, setDepartments] = useState([]);
  const [loadingDepartments, setLoadingDepartments] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState(null);
  const [teamsDepartment, setTeamsDepartment] = useState(null);

  // Fetch list of departments on mount
  const fetchDepartments = async () => {
    setLoadingDepartments(true);
    try {
      const response = await CustomAxios.get(
        `${baseurl}/${initURL}/ghub-department`
      );
      if (response.status === 200) {
        setDepartments(response.data); // Assumes response.data is an array of department objects
      } else {
        toast.error("Failed to fetch departments.");
      }
    } catch (error) {
      toast.error("An error occurred while fetching departments.");
    } finally {
      setLoadingDepartments(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  // Remove department (with confirmation)
  const handleDeleteDepartment = async (deptId) => {
    if (window.confirm("Are you sure you want to delete this department?")) {
      try {
        const response = await CustomAxios.delete(
          `${baseurl}/${initURL}/ghub-department/${deptId}`
        );
        if (response.status === 200 || response.status === 204) {
          toast.success("Department deleted successfully!");
          // Refresh list
          fetchDepartments();
        } else {
          toast.error("Failed to delete department.");
        }
      } catch (error) {
        toast.error("An error occurred while deleting the department.");
      }
    }
  };

  // Update the department in the list after editing
  const handleUpdateDepartment = (updatedDept) => {
    setDepartments((prev) =>
      prev.map((dept) => (dept.id === updatedDept.id ? updatedDept : dept))
    );
  };

  // Update teams of a department locally after editing teams
  const handleUpdateDepartmentTeams = (deptId, updatedTeams) => {
    setDepartments((prev) =>
      prev.map((dept) =>
        dept.id === deptId ? { ...dept, teams: updatedTeams } : dept
      )
    );
  };

  return (
    <div className="p-4">
      <h1 className="text-4xl font-extrabold text-center text-[#2B245C] mb-6">
        Manage Departments
      </h1>
      {loadingDepartments ? (
        <Loader />
      ) : (
        <div className="overflow-auto">
          <table className="min-w-full border border-[#2B245C]">
            <thead className="bg-[#2B245C] text-white font-semibold">
              <tr className="border-[#2B245C]">
                <th className="px-4 py-2 border">Department Name</th>
                <th className="px-4 py-2 border">Head</th>
                <th className="px-4 py-2 border">Contact</th>
                <th className="px-4 py-2 border">Email</th>
                <th className="px-4 py-2 border">Employees</th>
                <th className="px-4 py-2 border">Location</th>
                <th className="px-4 py-2 border">Actions</th>
              </tr>
            </thead>
            <tbody>
              {departments.length === 0 ? (
                <tr className="border border-[#2B245C]">
                  <td colSpan="7" className="text-center p-4">
                    No departments found.
                  </td>
                </tr>
              ) : (
                departments.map((dept) => (
                  <tr key={dept.id} className="border-t">
                    <td className="px-4 py-2 border">{dept.departmentName}</td>
                    <td className="px-4 py-2 border">{dept.departmentHead}</td>
                    <td className="px-4 py-2 border">
                      {dept.departmentContact}
                    </td>
                    <td className="px-4 py-2 border">{dept.departmentEmail}</td>
                    <td className="px-4 py-2 border">
                      {dept.departmentEmployees}
                    </td>
                    <td className="px-4 py-2 border">
                      {dept.departmentLocation}
                    </td>
                    <td className="px-4 py-2 border space-x-2">
                      <button
                        onClick={() => setEditingDepartment(dept)}
                        className="px-3 py-1 bg-blue-500 text-white rounded-md text-sm"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => setTeamsDepartment(dept)}
                        className="px-3 py-1 bg-green-500 text-white rounded-md text-sm"
                      >
                        Manage Teams
                      </button>
                      <button
                        onClick={() => handleDeleteDepartment(dept.id)}
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

      {/* Edit Department Modal */}
      {editingDepartment && (
        <EditDepartmentModal
          department={editingDepartment}
          onClose={() => setEditingDepartment(null)}
          onUpdate={handleUpdateDepartment}
        />
      )}

      {/* Manage Teams Modal */}
      {teamsDepartment && (
        <ManageTeamsModal
          department={teamsDepartment}
          onClose={() => setTeamsDepartment(null)}
          onUpdateTeams={(updatedTeams) => {
            handleUpdateDepartmentTeams(teamsDepartment.id, updatedTeams);
          }}
        />
      )}
    </div>
  );
};

export default ManageDepartment;
