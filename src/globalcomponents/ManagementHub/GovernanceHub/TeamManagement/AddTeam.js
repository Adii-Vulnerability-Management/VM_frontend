import { useState } from "react";
import { toast } from "react-toastify";
import CustomAxios from "@/globalcomponents/CustomAxios";
import Loader from "@/globalcomponents/loader/Loader";
import { baseurl, initURL } from "../../../../../BaseUrl";

const AddTeam = () => {
  const [loading, setLoading] = useState(false);
  const [showOptional, setShowOptional] = useState(false);
  const [teamFormData, setTeamFormData] = useState({
    // Required Fields
    teamName: "",
    teamLeader: "",
    teamEmail: "",
    teamMembersCount: "",
    teamDepartment: "",
    teamDescription: "",
    // Optional Fields
    teamRiskLevel: "",
    teamFunctions: "",
    auditFrequency: "",
    complianceCertifications: "",
    teamStatus: "",
    teamEstablishedDate: "",
    teamAchievements: "",
  });
  const [errors, setErrors] = useState({});

  // Only required fields for validation
  const requiredFields = [
    "teamName",
    "teamLeader",
    "teamEmail",
    "teamMembersCount",
    "teamDepartment",
    "teamDescription",
  ];

  // Handle form field changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setTeamFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));
  };

  // Email validation helper
  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  // Submit form to create new team
  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};

    // Validate required fields
    requiredFields.forEach((key) => {
      if (!teamFormData[key]) {
        newErrors[key] = "This field is required.";
      }
    });

    if (teamFormData.teamEmail && !validateEmail(teamFormData.teamEmail)) {
      newErrors.teamEmail = "Invalid email format.";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.error("Please fix errors before submitting.");
      return;
    }

    setLoading(true);
    try {
      const response = await CustomAxios.post(
        `${baseurl}/${initURL}/team-management/create-team`,
        teamFormData,
        { headers: { "Content-Type": "application/json" } }
      );

      if (response.status === 200 || response.status === 201) {
        toast.success("Team added successfully!");
        // Reset all fields
        setTeamFormData({
          teamName: "",
          teamLeader: "",
          teamEmail: "",
          teamMembersCount: "",
          teamDepartment: "",
          teamDescription: "",
          teamRiskLevel: "",
          teamFunctions: "",
          auditFrequency: "",
          complianceCertifications: "",
          teamStatus: "",
          teamEstablishedDate: "",
          teamAchievements: "",
        });
      } else {
        toast.error("Failed to add team. Please try again.");
      }
    } catch (error) {
      let errorMessage = "An error occurred while adding the team.";
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
    <div className="mx-auto p-6">
      <div className="bg-white shadow-lg rounded-lg p-8">
        <h1 className="text-3xl font-bold text-center mb-4">🛠️ Add New Team</h1>
        <form onSubmit={handleSubmit} method="POST">
          <div className="grid grid-cols-1 gap-6">
            {/* Required Fields */}
            <div className="flex flex-col">
              <label className="text-gray-700 font-medium mb-1">
                Team Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="teamName"
                value={teamFormData.teamName}
                onChange={handleInputChange}
                placeholder="Enter team name"
                className={`p-2 border ${
                  errors.teamName ? "border-red-500" : "border-gray-300"
                } rounded-md focus:outline-none`}
              />
              {errors.teamName && (
                <span className="text-xs text-red-500 mt-1">
                  {errors.teamName}
                </span>
              )}
            </div>

            <div className="flex flex-col">
              <label className="text-gray-700 font-medium mb-1">
                Team Leader <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="teamLeader"
                value={teamFormData.teamLeader}
                onChange={handleInputChange}
                placeholder="Enter team leader"
                className={`p-2 border ${
                  errors.teamLeader ? "border-red-500" : "border-gray-300"
                } rounded-md focus:outline-none`}
              />
              {errors.teamLeader && (
                <span className="text-xs text-red-500 mt-1">
                  {errors.teamLeader}
                </span>
              )}
            </div>

            <div className="flex flex-col">
              <label className="text-gray-700 font-medium mb-1">
                Team Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                name="teamEmail"
                value={teamFormData.teamEmail}
                onChange={handleInputChange}
                placeholder="Enter team email"
                className={`p-2 border ${
                  errors.teamEmail ? "border-red-500" : "border-gray-300"
                } rounded-md focus:outline-none`}
              />
              {errors.teamEmail && (
                <span className="text-xs text-red-500 mt-1">
                  {errors.teamEmail}
                </span>
              )}
            </div>

            <div className="flex flex-col">
              <label className="text-gray-700 font-medium mb-1">
                Number of Members <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="teamMembersCount"
                value={teamFormData.teamMembersCount}
                onChange={handleInputChange}
                placeholder="Enter number of members"
                className={`p-2 border ${
                  errors.teamMembersCount ? "border-red-500" : "border-gray-300"
                } rounded-md focus:outline-none`}
              />
              {errors.teamMembersCount && (
                <span className="text-xs text-red-500 mt-1">
                  {errors.teamMembersCount}
                </span>
              )}
            </div>

            <div className="flex flex-col">
              <label className="text-gray-700 font-medium mb-1">
                Department <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="teamDepartment"
                value={teamFormData.teamDepartment}
                onChange={handleInputChange}
                placeholder="Enter department name"
                className={`p-2 border ${
                  errors.teamDepartment ? "border-red-500" : "border-gray-300"
                } rounded-md focus:outline-none`}
              />
              {errors.teamDepartment && (
                <span className="text-xs text-red-500 mt-1">
                  {errors.teamDepartment}
                </span>
              )}
            </div>

            <div className="flex flex-col">
              <label className="text-gray-700 font-medium mb-1">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                name="teamDescription"
                value={teamFormData.teamDescription}
                onChange={handleInputChange}
                placeholder="Enter team description"
                className={`p-2 border ${
                  errors.teamDescription ? "border-red-500" : "border-gray-300"
                } rounded-md focus:outline-none`}
                rows="4"
              ></textarea>
              {errors.teamDescription && (
                <span className="text-xs text-red-500 mt-1">
                  {errors.teamDescription}
                </span>
              )}
            </div>

            {/* Optional Fields Section */}
            <div className="mt-6">
              <button
                type="button"
                onClick={() => setShowOptional(!showOptional)}
                className="mb-4 text-blue-600 hover:underline"
              >
                {showOptional ? "Hide Optional Fields" : "Show Optional Fields"}
              </button>
              {showOptional && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-4 border border-dashed border-gray-300 rounded-md bg-white">
                  {/* Team Risk Level */}
                  <div className="flex flex-col">
                    <label className="text-gray-700 font-medium mb-1">
                      Team Risk Level
                    </label>
                    <select
                      name="teamRiskLevel"
                      value={teamFormData.teamRiskLevel}
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
                    <label className="text-gray-700 font-medium mb-1">
                      Team Functions
                    </label>
                    <textarea
                      name="teamFunctions"
                      value={teamFormData.teamFunctions}
                      onChange={handleInputChange}
                      placeholder="Describe the core functions of the team"
                      className="p-2 border border-gray-300 rounded-md focus:outline-none"
                      rows="3"
                    ></textarea>
                  </div>

                  {/* Audit Frequency */}
                  <div className="flex flex-col">
                    <label className="text-gray-700 font-medium mb-1">
                      Audit Frequency
                    </label>
                    <select
                      name="auditFrequency"
                      value={teamFormData.auditFrequency}
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
                    <label className="text-gray-700 font-medium mb-1">
                      Compliance Certifications
                    </label>
                    <textarea
                      name="complianceCertifications"
                      value={teamFormData.complianceCertifications}
                      onChange={handleInputChange}
                      placeholder="List relevant compliance certifications"
                      className="p-2 border border-gray-300 rounded-md focus:outline-none"
                      rows="3"
                    ></textarea>
                  </div>

                  {/* Team Status */}
                  <div className="flex flex-col">
                    <label className="text-gray-700 font-medium mb-1">
                      Team Status
                    </label>
                    <select
                      name="teamStatus"
                      value={teamFormData.teamStatus}
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
                    <label className="text-gray-700 font-medium mb-1">
                      Team Established Date
                    </label>
                    <input
                      type="date"
                      name="teamEstablishedDate"
                      value={teamFormData.teamEstablishedDate}
                      onChange={handleInputChange}
                      className="p-2 border border-gray-300 rounded-md focus:outline-none"
                    />
                  </div>

                  {/* Team Achievements */}
                  <div className="flex flex-col lg:col-span-3">
                    <label className="text-gray-700 font-medium mb-1">
                      Team Achievements
                    </label>
                    <textarea
                      name="teamAchievements"
                      value={teamFormData.teamAchievements}
                      onChange={handleInputChange}
                      placeholder="Describe any notable achievements or KPIs"
                      className="p-2 border border-gray-300 rounded-md focus:outline-none"
                      rows="3"
                    ></textarea>
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className="mt-6 flex justify-end">
            <button
              type="submit"
              className="bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-3 rounded-md flex items-center"
            >
              {loading ? <Loader /> : "Add Team"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddTeam;
