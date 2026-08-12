import CustomAxios from "@/globalcomponents/CustomAxios";
import Loader from "@/globalcomponents/loader/Loader";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useRouter } from "next/router";
import { can, guard } from "@/auth/auth-permissions";
import { baseurl, initURL } from "../../../../../BaseUrl";

const getUserLabel = (user) => {
  const fullName = [user?.first_name, user?.last_name]
    .filter(Boolean)
    .join(" ")
    .trim();
  if (fullName) return fullName;
  if (user?.user_name) return user.user_name;
  if (user?.email) return user.email;
  return "Unnamed user";
};

// Modal for editing department details
const EditDepartmentModal = ({
  department,
  onClose,
  onUpdate,
  users,
  router,
  canUpdateDepartment,
}) => {
  const [formData, setFormData] = useState({
    ...department,
    businessArea: department?.businessAreas?.[0] || "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [businessAreas, setBusinessAreas] = useState([]);

  useEffect(() => {
    const fetchBusinessAreas = async () => {
      try {
        const response = await CustomAxios.get(
          `${baseurl}/${initURL}/ghub-business-area`,
        );
        setBusinessAreas(response.data);
      } catch (error) {
        console.error("Failed to fetch business areas", error);
      }
    };

    fetchBusinessAreas();
  }, []);

  // Only required fields are validated.
  const requiredFields = [];

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
    const cleanedData = { ...formData };

    if (
      cleanedData.businessArea &&
      typeof cleanedData.businessArea === "string"
    ) {
      cleanedData.businessAreas = [cleanedData.businessArea];
    }
    // Remove sensitive/readonly properties before PATCH
    delete cleanedData.user;
    delete cleanedData.businessArea;
    delete cleanedData.user_email;
    delete cleanedData.is_deleted;
    delete cleanedData.createdAt;
    delete cleanedData.updatedAt;
    delete cleanedData.__v;
    delete cleanedData._id;
    try {
      const response = await CustomAxios.patch(
        `${baseurl}/${initURL}/ghub-department/${formData._id}`,
        cleanedData,
        { headers: { "Content-Type": "application/json" } },
      );

      if (response.status === 200 || response.status === 201) {
        toast.success("Department updated successfully!");
        onUpdate({
          ...formData,
          businessAreas: formData.businessArea ? [formData.businessArea] : [],
        });
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
        <h2 className="text-2xl font-bold text-[#2B245C] mb-4">
          Edit Department
        </h2>

        <form
          onSubmit={(e) =>
            guard(canUpdateDepartment, router, () => handleSubmit(e))
          }
          method="POST"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4">
            {/* Re-use fields from AddDepartment with updated names */}
            <div className="flex flex-col lg:col-span-3">
              <label className="block text-xs font-semibold text-gray-700 mb-2">
                Department Name<span className="text-red-600 mr-1"> *</span>
              </label>
              <input
                type="text"
                name="departmentName"
                value={formData.departmentName}
                onChange={handleInputChange}
                placeholder="Enter Department Name"
                required
                className="w-full border border-gray-300 rounded-lg px-4 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-[#2B245C]"
              />
              {errors.departmentName && (
                <span className="text-xs text-red-600 mt-1">
                  {errors.departmentName}
                </span>
              )}
            </div>

            <div className="flex flex-col">
              <label className="block text-xs font-semibold text-gray-700 mb-2">
                Business Area
              </label>
              <select
                name="businessArea"
                value={formData.businessArea || ""}
                onChange={handleInputChange}
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 focus:border-indigo-500 focus:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-indigo-200 transition-all"
              >
                <option value="">Select Business Area</option>
                {businessAreas.map((ba) => (
                  <option key={ba._id} value={ba._id}>
                    {ba.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col">
              <label className="block text-xs font-semibold text-gray-700 mb-2">
                Department Head<span className="text-red-600 mr-1"> *</span>
              </label>
              <select
                name="departmentHead"
                value={formData.departmentHead || ""}
                onChange={handleInputChange}
                required
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 focus:border-indigo-500 focus:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-indigo-200 transition-all"
              >
                <option value="">Select Department Head</option>
                {users.map((user) => (
                  <option key={user._id} value={user._id}>
                    {getUserLabel(user)}
                    {user.email ? ` (${user.email})` : ""}
                  </option>
                ))}
              </select>
              {errors.departmentHead && (
                <span className="text-xs text-red-600 mt-1">
                  {errors.departmentHead}
                </span>
              )}
            </div>

            <div className="flex flex-col">
              <label className="block text-xs font-semibold text-gray-700 mb-2">
                Department Contact<span className="text-red-600 mr-1"> *</span>
              </label>
              <input
                type="tel"
                name="departmentContact"
                value={formData.departmentContact}
                onChange={handleInputChange}
                placeholder="Enter phone number"
                required
                className="w-full border border-gray-300 rounded-lg px-4 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-[#2B245C]"
              />
              {errors.departmentContact && (
                <span className="text-xs text-red-600 mt-1">
                  {errors.departmentContact}
                </span>
              )}
            </div>

            <div className="flex flex-col">
              <label className="block text-xs font-semibold text-gray-700 mb-2">
                Department Email<span className="text-red-600 mr-1"> *</span>
              </label>
              <input
                type="email"
                name="departmentEmail"
                value={formData.departmentEmail}
                onChange={handleInputChange}
                placeholder="example@example.com"
                required
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-indigo-200 transition-all"
              />
              {errors.departmentEmail && (
                <span className="text-xs text-red-600 mt-1">
                  {errors.departmentEmail}
                </span>
              )}
            </div>

            <div className="flex flex-col">
              <label className="block text-xs font-semibold text-gray-700 mb-2">
                Number of Employees<span className="text-red-600 mr-1"> *</span>
              </label>
              <input
                type="number"
                name="departmentEmployees"
                value={formData.departmentEmployees}
                onChange={handleInputChange}
                placeholder="Enter number of employees"
                required
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-indigo-200 transition-all"
              />
              {errors.departmentEmployees && (
                <span className="text-xs text-red-600 mt-1">
                  {errors.departmentEmployees}
                </span>
              )}
            </div>

            <div className="flex flex-col">
              <label className="block text-xs font-semibold text-gray-700 mb-2">
                Department Location<span className="text-red-600 mr-1"> *</span>
              </label>
              <input
                type="text"
                name="departmentLocation"
                value={formData.departmentLocation}
                onChange={handleInputChange}
                placeholder="Enter department location"
                required
                className="w-full border border-gray-300 rounded-lg px-4 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-[#2B245C]"
              />
              {errors.departmentLocation && (
                <span className="text-xs text-red-600 mt-1">
                  {errors.departmentLocation}
                </span>
              )}
            </div>

            <div className="flex flex-col">
              <label className="block text-xs font-semibold text-gray-700 mb-2">
                Department Code<span className="text-red-600 mr-1"> *</span>
              </label>
              <input
                type="text"
                name="departmentCode"
                value={formData.departmentCode}
                onChange={handleInputChange}
                placeholder="Enter department code"
                required
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-indigo-200 transition-all"
              />
              {errors.departmentCode && (
                <span className="text-xs text-red-600 mt-1">
                  {errors.departmentCode}
                </span>
              )}
            </div>

            <div className="flex flex-col lg:col-span-3">
              <label className="block text-xs font-semibold text-gray-700 mb-2">
                Department Functions
                <span className="text-red-600 mr-1"> *</span>
              </label>
              <textarea
                name="departmentFunctions"
                value={formData.departmentFunctions}
                onChange={handleInputChange}
                placeholder="Describe the department functions"
                required
                className="w-full border border-gray-300 rounded-lg px-4 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-[#2B245C]"
              />
              {errors.departmentFunctions && (
                <span className="text-xs text-red-600 mt-1">
                  {errors.departmentFunctions}
                </span>
              )}
            </div>

            {/* Optional Fields can be included here as needed */}
            <div className="flex flex-col">
              <label className="block text-xs font-semibold text-gray-700 mb-2">
                Department Risk Level
              </label>
              <select
                name="departmentRiskLevel"
                value={formData.departmentRiskLevel}
                onChange={handleInputChange}
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 focus:border-indigo-500 focus:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-indigo-200 transition-all"
              >
                <option value="">Select Risk Level</option>
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>

            <div className="flex flex-col lg:col-span-3">
              <label className="block text-xs font-semibold text-gray-700 mb-2">
                Department Description / Overview
              </label>
              <textarea
                name="departmentDescription"
                value={formData.departmentDescription}
                onChange={handleInputChange}
                placeholder="Brief description"
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-indigo-200 transition-all"
              />
            </div>

            <div className="flex flex-col">
              <label className="block text-xs font-semibold text-gray-700 mb-2">
                Audit Frequency
              </label>
              <select
                name="auditFrequency"
                value={formData.auditFrequency}
                onChange={handleInputChange}
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 focus:border-indigo-500 focus:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-indigo-200 transition-all"
              >
                <option value="">Select Frequency</option>
                <option value="Monthly">Monthly</option>
                <option value="Quarterly">Quarterly</option>
                <option value="Annually">Annually</option>
              </select>
            </div>

            <div className="flex flex-col lg:col-span-3">
              <label className="block text-xs font-semibold text-gray-700 mb-2">
                Compliance Requirements
              </label>
              <textarea
                name="complianceRequirements"
                value={formData.complianceRequirements}
                onChange={handleInputChange}
                placeholder="Regulatory standards etc."
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-indigo-200 transition-all"
              />
            </div>

            <div className="flex flex-col">
              <label className="block text-xs font-semibold text-gray-700 mb-2">
                Department Status
              </label>
              <select
                name="departmentStatus"
                value={formData.departmentStatus}
                onChange={handleInputChange}
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 focus:border-indigo-500 focus:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-indigo-200 transition-all"
              >
                <option value="">Select Status</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
                <option value="Transitional">Transitional</option>
              </select>
            </div>

            <div className="flex flex-col">
              <label className="block text-xs font-semibold text-gray-700 mb-2">
                Parent Department
              </label>
              <input
                type="text"
                name="parentDepartment"
                value={formData.parentDepartment}
                onChange={handleInputChange}
                placeholder="Enter parent department if any"
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-indigo-200 transition-all"
              />
            </div>

            <div className="flex flex-col lg:col-span-3">
              <label className="block text-xs font-semibold text-gray-700 mb-2">
                Risk Mitigation Measures
              </label>
              <textarea
                name="riskMitigationMeasures"
                value={formData.riskMitigationMeasures}
                onChange={handleInputChange}
                placeholder="Risk mitigation details"
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-indigo-200 transition-all"
              />
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-4">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center gap-2 rounded-lg border border-[#2B245C] bg-white px-6 py-2.5 text-sm font-medium text-[#2B245C] hover:bg-indigo-50 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-lg bg-[#2B245C] px-6 py-2.5 text-sm font-semibold text-white shadow-md hover:shadow-lg hover:bg-opacity-90 disabled:opacity-60 transition-all"
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
const ManageTeamsModal = ({
  department,
  onClose,
  onUpdateTeams,
  router,
  canUpdateDepartment,
}) => {
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
        `${baseurl}/${initURL}/ghub-department/${department._id}`,
        { teams },
        { headers: { "Content-Type": "application/json" } },
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
        <h2 className="text-2xl text-[#2B245C] font-bold mb-4">
          Manage Teams for {department.departmentName}
        </h2>
        <div className="mb-4">
          <label className="block text-xs font-semibold text-gray-700 mb-2">
            Add New Team
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={newTeam}
              onChange={(e) => setNewTeam(e.target.value)}
              placeholder="Team Name"
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-indigo-200 transition-all"
            />
            <button
              onClick={() => guard(canUpdateDepartment, router, handleAddTeam)}
              className="px-4 py-2 bg-white border border-[#2B245C] rounded-lg text-[#2B245C] font-semibold"
            >
              Add
            </button>
          </div>
        </div>
        <div className="mb-4">
          <h3 className="font-semibold text-[#2B245C] mb-2">Current Teams:</h3>
          {teams.length === 0 ? (
            <p>No teams added yet.</p>
          ) : (
            <ul>
              {teams.map((team, index) => (
                <li
                  key={index}
                  className="flex justify-between items-center mb-1 p-2 border rounded-lg"
                >
                  <span>{team}</span>
                  <button
                    onClick={() =>
                      guard(canUpdateDepartment, router, () =>
                        handleRemoveTeam(team),
                      )
                    }
                    className="text-red-600 text-sm border border-red-600 rounded-lg p-1 hover:underline"
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="flex justify-end gap-4">
          <button
            onClick={onClose}
            className="rounded-lg border border-[#2B245C] bg-white px-6 py-2.5 text-sm font-medium text-[#2B245C] hover:bg-indigo-50 transition-all"
          >
            Cancel
          </button>
          <button
            onClick={() =>
              guard(canUpdateDepartment, router, handleUpdateTeams)
            }
            className="inline-flex items-center gap-2 rounded-lg bg-[#2B245C] px-6 py-2.5 text-sm font-semibold text-white shadow-md hover:shadow-lg hover:bg-opacity-90 disabled:opacity-60 transition-all"
          >
            {loading ? <Loader /> : "Update Teams"}
          </button>
        </div>
      </div>
    </div>
  );
};

const ManageDepartment = () => {
  const router = useRouter();

  const [departments, setDepartments] = useState([]);
  const [loadingDepartments, setLoadingDepartments] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState(null);
  const [teamsDepartment, setTeamsDepartment] = useState(null);
  const [users, setUsers] = useState([]);
  const [businessAreas, setBusinessAreas] = useState([]);

  // Permissions
  const canViewDepartment = can("management_hub.read") || can("management_hub.manage");
  const canUpdateDepartment = can("management_hub.update") || can("management_hub.manage");
  const canDeleteDepartment = can("management_hub.delete") || can("management_hub.manage");
  const canManageDepartment = can("management_hub.manage");

  const getHeadNameById = (headId) => {
    const user = users.find((u) => u._id === headId);
    return user ? getUserLabel(user) : headId || "N/A";
  };

  const getBusinessAreaNameById = (id) => {
    const ba = businessAreas.find((item) => item._id === id);
    return ba?.name || id;
  };

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await CustomAxios.get(
          `/${initURL}/apiv1/users/db?page=1&limit=1000`,
        );
        setUsers(Array.isArray(res.data?.data) ? res.data.data : []);
      } catch (error) {
        toast.error("Failed to fetch users.");
      }
    };

    const fetchBusinessAreas = async () => {
      try {
        const res = await CustomAxios.get(
          `${baseurl}/${initURL}/ghub-business-area`,
        );
        setBusinessAreas(Array.isArray(res.data) ? res.data : []);
      } catch (error) {
        toast.error("Failed to fetch business areas.");
      }
    };

    fetchUsers();
    fetchBusinessAreas();
  }, []);

  // Fetch list of departments on mount
  const fetchDepartments = async () => {
    setLoadingDepartments(true);
    try {
      const response = await CustomAxios.get(
        `${baseurl}/${initURL}/ghub-department`,
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
          `${baseurl}/${initURL}/ghub-department/${deptId}`,
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

  // Archive department
  const handleArchiveDepartment = async (deptId) => {
    if (
      window.confirm(
        "Are you sure you want to archive this department? This will archive related entities.",
      )
    ) {
      try {
        const response = await CustomAxios.patch(
          `${baseurl}/${initURL}/ghub-department/${deptId}/archive`,
        );
        if (response.status === 200) {
          toast.success("Department archived successfully!");
          fetchDepartments();
        } else {
          toast.error("Failed to archive department.");
        }
      } catch (error) {
        toast.error("An error occurred while archiving the department.");
      }
    }
  };

  // Unarchive department
  const handleUnarchiveDepartment = async (deptId) => {
    if (
      window.confirm(
        "Are you sure you want to unarchive this department? This will unarchive related entities.",
      )
    ) {
      try {
        const response = await CustomAxios.patch(
          `${baseurl}/${initURL}/ghub-department/${deptId}/unarchive`,
        );
        if (response.status === 200) {
          toast.success("Department unarchived successfully!");
          fetchDepartments();
        } else {
          toast.error("Failed to unarchive department.");
        }
      } catch (error) {
        toast.error("An error occurred while unarchiving the department.");
      }
    }
  };

  // Update the department in the list after editing
  const handleUpdateDepartment = (updatedDept) => {
    setDepartments((prev) =>
      prev.map((dept) => (dept._id === updatedDept._id ? updatedDept : dept)),
    );
  };

  // Update teams of a department locally after editing teams
  const handleUpdateDepartmentTeams = (deptId, updatedTeams) => {
    setDepartments((prev) =>
      prev.map((dept) =>
        dept._id === deptId ? { ...dept, teams: updatedTeams } : dept,
      ),
    );
  };

  return (
    <div data-tour="dept-manage-table">
      <h2 className="text-2xl font-semibold text-[#2B245C] mb-3">
        Manage Departments
      </h2>
      {loadingDepartments ? (
        <Loader />
      ) : (
        <div className="overflow-x-auto rounded-lg border border-gray-800">
          <table className="min-w-full text-sm">
            <thead className="bg-[#2B245C] text-left text-white border-b border-gray-800">
              <tr>
                <th className="px-5 py-2 font-medium whitespace-nowrap">
                  Department Name
                </th>
                <th className="px-5 py-2 font-medium">Head</th>
                <th className="px-5 py-2 font-medium">Contact</th>
                <th className="px-5 py-2 font-medium">Email</th>
                <th className="px-5 py-2 font-medium">Employees</th>
                <th className="px-5 py-2 font-medium">Location</th>
                <th className="px-5 py-2 font-medium whitespace-nowrap">
                  Business Areas
                </th>{" "}
                {/* New column */}
                <th className="px-5 py-2 font-medium text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {!canViewDepartment ? (
                <tr>
                  <td
                    colSpan="8"
                    className="text-center py-8 text-red-600 font-medium"
                  >
                    You don’t have permission to view departments.
                  </td>
                </tr>
              ) : departments.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center text-gray-500 p-4">
                    No departments found.
                  </td>
                </tr>
              ) : (
                departments.map((dept) => (
                  <tr key={dept._id} className="border-t">
                    <td className="px-5 py-2">{dept.departmentName}</td>
                    <td className="px-5 py-2">
                      {getHeadNameById(dept.departmentHead)}
                    </td>
                    <td className="px-5 py-2">{dept.departmentContact}</td>
                    <td className="px-5 py-2">{dept.departmentEmail}</td>
                    <td className="px-5 py-2">{dept.departmentEmployees}</td>
                    <td className="px-5 py-2">{dept.departmentLocation}</td>
                    <td className="px-5 py-2">
                      {Array.isArray(dept.businessAreas) &&
                      dept.businessAreas.length > 0 ? (
                        <ul className="list-disc pl-4 space-y-1">
                          {dept.businessAreas.map((ba, index) => (
                            <li
                              key={
                                typeof ba === "string"
                                  ? `${ba}-${index}`
                                  : ba?._id || index
                              }
                            >
                              {typeof ba === "string"
                                ? getBusinessAreaNameById(ba)
                                : ba?.name || "Unnamed BA"}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <span className="text-gray-400">N/A</span>
                      )}
                    </td>
                    <td className="px-5 py-2 flex items-center justify-center space-x-2">
                      <button
                        onClick={() =>
                          guard(canUpdateDepartment, router, () =>
                            setEditingDepartment(dept),
                          )
                        }
                        className="px-3 py-1 bg-white border border-blue-500 text-blue-500 rounded-lg text-sm hover:bg-blue-50"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() =>
                          guard(canUpdateDepartment, router, () =>
                            setTeamsDepartment(dept),
                          )
                        }
                        className="px-3 py-1 bg-white border border-green-500 text-green-500 rounded-lg text-sm hover:bg-green-50 whitespace-nowrap"
                      >
                        Manage Teams
                      </button>
                      {dept.is_archived ? (
                        <button
                          onClick={() =>
                            guard(canUpdateDepartment, router, () =>
                              handleUnarchiveDepartment(dept._id),
                            )
                          }
                          className="px-3 py-1 bg-white border border-yellow-500 text-yellow-500 rounded-lg text-sm hover:bg-yellow-50"
                        >
                          Unarchive
                        </button>
                      ) : (
                        <button
                          onClick={() =>
                            guard(canUpdateDepartment, router, () =>
                              handleArchiveDepartment(dept._id),
                            )
                          }
                          className="px-3 py-1 bg-white border border-orange-500 text-orange-500 rounded-lg text-sm hover:bg-orange-50"
                        >
                          Archive
                        </button>
                      )}
                      <button
                        onClick={() =>
                          guard(canDeleteDepartment, router, () =>
                            handleDeleteDepartment(dept._id),
                          )
                        }
                        className="px-3 py-1 bg-white border border-red-500 text-red-500 rounded-lg text-sm hover:bg-red-50"
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
          users={users}
          router={router}
          canUpdateDepartment={canUpdateDepartment}
        />
      )}

      {/* Manage Teams Modal */}
      {teamsDepartment && (
        <ManageTeamsModal
          department={teamsDepartment}
          onClose={() => setTeamsDepartment(null)}
          onUpdateTeams={(updatedTeams) => {
            handleUpdateDepartmentTeams(teamsDepartment._id, updatedTeams);
          }}
          router={router}
          canUpdateDepartment={canUpdateDepartment}
        />
      )}
    </div>
  );
};

export default ManageDepartment;
