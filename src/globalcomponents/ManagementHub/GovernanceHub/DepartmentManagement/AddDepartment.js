import { useState } from "react";
import { toast } from "react-toastify";
import CustomAxios from "@/globalcomponents/CustomAxios";
import Loader from "@/globalcomponents/loader/Loader";
import { baseurl, initURL } from "../../../../../BaseUrl";

const AddDepartment = () => {
  const [loading, setLoading] = useState(false);
  const [showOptional, setShowOptional] = useState(false);
  const [departmentFormData, setDepartmentFormData] = useState({
    // Required Fields
    departmentName: "",
    departmentHead: "",
    departmentContact: "",
    departmentEmail: "",
    departmentEmployees: "",
    departmentLocation: "",
    departmentCode: "",
    departmentFunctions: "",
    // Optional Fields
    departmentRiskLevel: "",
    departmentDescription: "",
    auditFrequency: "",
    complianceRequirements: "",
    departmentStatus: "",
    parentDepartment: "",
    riskMitigationMeasures: "",
  });
  const [errors, setErrors] = useState({});

  // Only check required fields
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

  const departmentHandleInputChange = (e) => {
    const { name, value } = e.target;
    setDepartmentFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validateDepartmentContact = (contact) =>
    /^\+?[0-9]{7,15}$/.test(contact);
  const validateDepartmentEmail = (email) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleDepartmentSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};

    // Validate required fields
    requiredFields.forEach((key) => {
      if (!departmentFormData[key]) {
        newErrors[key] = "This field is required.";
      }
    });

    // Validate phone and email only if provided (they are required so they should be filled)
    if (
      departmentFormData.departmentContact &&
      !validateDepartmentContact(departmentFormData.departmentContact)
    ) {
      newErrors.departmentContact =
        "Contact must be a valid phone number (7-15 digits, optionally starting with '+').";
    }
    if (
      departmentFormData.departmentEmail &&
      !validateDepartmentEmail(departmentFormData.departmentEmail)
    ) {
      newErrors.departmentEmail = "Invalid email format.";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
    } else {
      setErrors({});
      setLoading(true);
      try {
        const response = await CustomAxios.post(
          `${baseurl}/${initURL}/ghub-department`,
          departmentFormData,
        );

        if (response.status === 200 || response.status === 201) {
          toast.success("Details submitted successfully!");
          // Reset all fields
          setDepartmentFormData({
            departmentName: "",
            departmentHead: "",
            departmentContact: "",
            departmentEmail: "",
            departmentEmployees: "",
            departmentLocation: "",
            departmentCode: "",
            departmentFunctions: "",
            departmentRiskLevel: "",
            departmentDescription: "",
            auditFrequency: "",
            complianceRequirements: "",
            departmentStatus: "",
            parentDepartment: "",
            riskMitigationMeasures: "",
          });
        } else {
          toast.error("Failed to submit form");
        }
      } catch (error) {
        let errorMessage =
          "An error occurred while submitting the form. Please try again.";

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
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-4xl font-extrabold text-center text-[#2B245C] mb-6">
        🏢 Add New Department
      </h1>
      <p className="text-center text-lg text-gray-600 mb-10">
        Please fill in the department details below to create a new record ✍️.
      </p>

      <form onSubmit={handleDepartmentSubmit} method="POST">
        <div className="p-6 bg-[#F8F9FE]">
          {/* Required Fields Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4">
            {/* Department Name */}
            <div className="flex flex-col lg:col-span-3">
              <label className="text-sm mb-1 text-gray-700">
                <span className="text-red-600 mr-1">*</span>Department Name
              </label>
              <input
                type="text"
                name="departmentName"
                value={departmentFormData.departmentName}
                onChange={departmentHandleInputChange}
                placeholder="Enter Department Name"
                required
                className="p-2 border border-gray-200 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              {errors.departmentName && (
                <span className="text-xs text-red-600 mt-1">
                  {errors.departmentName}
                </span>
              )}
            </div>

            {/* Department Head */}
            <div className="flex flex-col">
              <label className="text-sm mb-1 text-[#2B245C]">
                <span className="text-red-600 mr-1">*</span>Department Head
              </label>
              <input
                type="text"
                name="departmentHead"
                value={departmentFormData.departmentHead}
                onChange={departmentHandleInputChange}
                placeholder="Enter Department Head Name"
                required
                className="p-2 border border-gray-200 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              {errors.departmentHead && (
                <span className="text-xs text-red-600 mt-1">
                  {errors.departmentHead}
                </span>
              )}
            </div>

            {/* Department Contact */}
            <div className="flex flex-col">
              <label className="text-sm mb-1 text-[#2B245C]">
                <span className="text-red-600 mr-1">*</span>Department Contact
              </label>
              <input
                type="tel"
                name="departmentContact"
                value={departmentFormData.departmentContact}
                onChange={departmentHandleInputChange}
                placeholder="9876543210"
                required
                className="p-2 border border-gray-200 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              {errors.departmentContact && (
                <span className="text-xs text-red-600 mt-1">
                  {errors.departmentContact}
                </span>
              )}
            </div>

            {/* Department Email */}
            <div className="flex flex-col">
              <label className="text-sm mb-1 text-[#2B245C]">
                <span className="text-red-600 mr-1">*</span>Department Email
              </label>
              <input
                type="email"
                name="departmentEmail"
                value={departmentFormData.departmentEmail}
                onChange={departmentHandleInputChange}
                placeholder="example@example.com"
                required
                className="p-2 border border-gray-200 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              {errors.departmentEmail && (
                <span className="text-xs text-red-600 mt-1">
                  {errors.departmentEmail}
                </span>
              )}
            </div>

            {/* Number of Employees */}
            <div className="flex flex-col">
              <label className="text-sm mb-1 text-[#2B245C]">
                <span className="text-red-600 mr-1">*</span>Number of Employees
              </label>
              <input
                type="number"
                name="departmentEmployees"
                value={departmentFormData.departmentEmployees}
                onChange={departmentHandleInputChange}
                placeholder="Enter number of employees"
                required
                className="p-2 border border-gray-200 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              {errors.departmentEmployees && (
                <span className="text-xs text-red-600 mt-1">
                  {errors.departmentEmployees}
                </span>
              )}
            </div>

            {/* Department Location */}
            <div className="flex flex-col">
              <label className="text-sm mb-1 text-[#2B245C]">
                <span className="text-red-600 mr-1">*</span>Department Location
              </label>
              <input
                type="text"
                name="departmentLocation"
                value={departmentFormData.departmentLocation}
                onChange={departmentHandleInputChange}
                placeholder="Enter department location"
                required
                className="p-2 border border-gray-200 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              {errors.departmentLocation && (
                <span className="text-xs text-red-600 mt-1">
                  {errors.departmentLocation}
                </span>
              )}
            </div>

            {/* Department Code */}
            <div className="flex flex-col">
              <label className="text-sm mb-1 text-[#2B245C]">
                <span className="text-red-600 mr-1">*</span>Department Code
              </label>
              <input
                type="text"
                name="departmentCode"
                value={departmentFormData.departmentCode}
                onChange={departmentHandleInputChange}
                placeholder="Enter department code"
                required
                className="p-2 border border-gray-200 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              {errors.departmentCode && (
                <span className="text-xs text-red-600 mt-1">
                  {errors.departmentCode}
                </span>
              )}
            </div>

            {/* Department Functions */}
            <div className="flex flex-col lg:col-span-3">
              <label className="text-sm mb-1 text-[#2B245C]">
                <span className="text-red-600 mr-1">*</span>Department Functions
              </label>
              <textarea
                name="departmentFunctions"
                value={departmentFormData.departmentFunctions}
                onChange={departmentHandleInputChange}
                placeholder="Describe the core functions of the department"
                required
                className="p-2 border border-gray-200 rounded-md bg-white min-h-[100px] focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              {errors.departmentFunctions && (
                <span className="text-xs text-red-600 mt-1">
                  {errors.departmentFunctions}
                </span>
              )}
            </div>
          </div>

          {/* Optional Fields Section */}
          <div className="mt-8">
            <button
              type="button"
              onClick={() => setShowOptional(!showOptional)}
              className="mb-4 text-blue-600 hover:underline"
            >
              {showOptional ? "Hide Optional Fields" : "Show Optional Fields"}
            </button>
            {showOptional && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4 p-4 border border-dashed border-gray-300 rounded-md bg-white">
                {/* Department Risk Level (Optional) */}
                <div className="flex flex-col">
                  <label className="text-sm mb-1 text-[#2B245C]">
                    Department Risk Level
                  </label>
                  <select
                    name="departmentRiskLevel"
                    value={departmentFormData.departmentRiskLevel}
                    onChange={departmentHandleInputChange}
                    className="p-2 border border-gray-200 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="" disabled>
                      Select Risk Level
                    </option>
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>

                {/* Department Description / Overview */}
                <div className="flex flex-col lg:col-span-3">
                  <label className="text-sm mb-1 text-[#2B245C]">
                    Department Description / Overview
                  </label>
                  <textarea
                    name="departmentDescription"
                    value={departmentFormData.departmentDescription}
                    onChange={departmentHandleInputChange}
                    placeholder="Provide a brief description of the department"
                    className="p-2 border border-gray-200 rounded-md bg-white min-h-[80px] focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                {/* Audit Frequency */}
                <div className="flex flex-col">
                  <label className="text-sm mb-1 text-[#2B245C]">
                    Audit Frequency
                  </label>
                  <select
                    name="auditFrequency"
                    value={departmentFormData.auditFrequency}
                    onChange={departmentHandleInputChange}
                    className="p-2 border border-gray-200 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="" disabled>
                      Select Frequency
                    </option>
                    <option value="Monthly">Monthly</option>
                    <option value="Quarterly">Quarterly</option>
                    <option value="Annually">Annually</option>
                  </select>
                </div>

                {/* Compliance Requirements / Regulatory Standards */}
                <div className="flex flex-col lg:col-span-3">
                  <label className="text-sm mb-1 text-[#2B245C]">
                    Compliance Requirements / Regulatory Standards
                  </label>
                  <textarea
                    name="complianceRequirements"
                    value={departmentFormData.complianceRequirements}
                    onChange={departmentHandleInputChange}
                    placeholder="List applicable compliance requirements or regulatory standards"
                    className="p-2 border border-gray-200 rounded-md bg-white min-h-[80px] focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                {/* Department Status */}
                <div className="flex flex-col">
                  <label className="text-sm mb-1 text-[#2B245C]">
                    Department Status
                  </label>
                  <select
                    name="departmentStatus"
                    value={departmentFormData.departmentStatus}
                    onChange={departmentHandleInputChange}
                    className="p-2 border border-gray-200 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="" disabled>
                      Select Status
                    </option>
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                    <option value="Transitional">Transitional</option>
                  </select>
                </div>

                {/* Parent Department / Reporting Structure */}
                <div className="flex flex-col">
                  <label className="text-sm mb-1 text-[#2B245C]">
                    Parent Department / Reporting Structure
                  </label>
                  <input
                    type="text"
                    name="parentDepartment"
                    value={departmentFormData.parentDepartment}
                    onChange={departmentHandleInputChange}
                    placeholder="Enter parent department if any"
                    className="p-2 border border-gray-200 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                {/* Risk Mitigation Measures */}
                <div className="flex flex-col lg:col-span-3">
                  <label className="text-sm mb-1 text-[#2B245C]">
                    Risk Mitigation Measures
                  </label>
                  <textarea
                    name="riskMitigationMeasures"
                    value={departmentFormData.riskMitigationMeasures}
                    onChange={departmentHandleInputChange}
                    placeholder="Describe any risk mitigation measures in place"
                    className="p-2 border border-gray-200 rounded-md bg-white min-h-[80px] focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div className="mt-6 flex justify-end">
            <button
              type="submit"
              className="bg-[#1e284e] text-white px-8 py-2 rounded-md min-w-20 flex justify-center items-center"
            >
              {loading ? <Loader /> : "Submit"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AddDepartment;
