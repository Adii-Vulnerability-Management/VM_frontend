import CustomAxios from "@/globalcomponents/CustomAxios";
import Loader from "@/globalcomponents/loader/Loader";
import { useState } from "react";
import { toast } from "react-toastify";
import { baseurl, initURL } from "../../../BaseUrl";
const Employee = () => {
  const [loading, setLoading] = useState(false);

  const [employeeFormData, setEmployeeFormData] = useState({
    first_name: "",
    last_name: "",
    employeeId: "",
    user_designation: "",
    email: "",
    contact_number: "",
    role: "",
  });

  const [errors, setErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEmployeeFormData({ ...employeeFormData, [name]: value });
  };

  const validateForm = (data, setErrors) => {
    const newErrors = {};
    if (!data.first_name.trim()) {
      newErrors.first_name = "First Name is required";
    }

    if (!data.last_name.trim()) {
      newErrors.last_name = "Last Name is required";
    }

    if (!data.employeeId.trim()) {
      newErrors.employeeId = "Employee ID is required";
    }

    if (!data.user_designation.trim()) {
      newErrors.user_designation = "Role is required";
    }

    if (!data.email.trim() || !/\S+@\S+\.\S+/.test(data.email)) {
      newErrors.email = "Valid Email is required";
    }

    if (!data.contact_number.trim()) {
      newErrors.contact_number = "Contact Number required";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (validateForm(employeeFormData, setErrors)) {
      createEmployee();
    }
  };

  const createEmployee = async () => {
    let body = {
      first_name: employeeFormData.first_name,
      last_name: employeeFormData.last_name,
      user_name: `${employeeFormData.first_name} ${employeeFormData.last_name}`,
      employeeId: employeeFormData.employeeId,
      email: employeeFormData.email,
      contact_number: employeeFormData.contact_number,
      user_designation: employeeFormData.user_designation,
    };
    setLoading(true);
    try {
      const response = await CustomAxios.post(
        `${baseurl}/${initURL}/apiv1/users`,
        body,
      );
      toast.success(response.data.message || "Employee created successfully");
      setEmployeeFormData({
        first_name: "",
        last_name: "",
        employeeId: "",
        user_designation: "",
        email: "",
        contact_number: "",
        role: "",
      });
    } catch (error) {
      console.log("🚀 ~ createEmployee ~ error:", error);
      setErrors({});
      // Default error message
      let errorMessage = "Failed to create employee.";

      if (error.response?.data?.message) {
        // If `message` is an array, use the first entry
        if (
          Array.isArray(error.response.data.message) &&
          error.response.data.message.length > 0
        ) {
          errorMessage = error.response.data.message[0];
        } else if (typeof error.response.data.message === "string") {
          // If `message` is a string, use it directly
          errorMessage = error.response.data.message;
        }
      }
      // Display the error message
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center pb-4 pt-2">
        <h2 className="font-bold text-[#2B245C]">Employee Details</h2>
      </div>
      <form
        onSubmit={handleSubmit}
        className="p-6 bg-[#F8F9FE] rounded-lg shadow-md"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* First Name */}
          <div className="flex flex-col">
            <label className="text-sm mb-1 text-[#2B245C]">
              <span className="text-red-600">*</span> First Name
            </label>
            <input
              type="text"
              required
              name="first_name"
              value={employeeFormData.first_name}
              onChange={handleInputChange}
              placeholder="Enter First Name"
              className={`p-2 border ${
                errors.firstName ? "border-red-600" : "border-gray-300"
              } rounded-md focus:ring focus:ring-blue-200`}
            />
            {errors.firstName && (
              <span className="text-xs text-red-600">{errors.firstName}</span>
            )}
          </div>

          {/* Last Name */}
          <div className="flex flex-col">
            <label className="text-sm mb-1 text-[#2B245C]">
              <span className="text-red-600">*</span> Last Name
            </label>
            <input
              type="text"
              required
              name="last_name"
              value={employeeFormData.last_name}
              onChange={handleInputChange}
              placeholder="Enter Last Name"
              className={`p-2 border ${
                errors.lastName ? "border-red-600" : "border-gray-300"
              } rounded-md focus:ring focus:ring-blue-200`}
            />
            {errors.lastName && (
              <span className="text-xs text-red-600">{errors.lastName}</span>
            )}
          </div>

          {/* Employee ID */}
          <div className="flex flex-col">
            <label className="text-sm mb-1 text-[#2B245C]">
              <span className="text-red-600">*</span> Employee ID
            </label>
            <input
              type="text"
              required
              name="employeeId"
              value={employeeFormData.employeeId}
              onChange={handleInputChange}
              placeholder="Enter Employee ID"
              className={`p-2 border ${
                errors.employeeId ? "border-red-600" : "border-gray-300"
              } rounded-md focus:ring focus:ring-blue-200`}
            />
            {errors.employeeId && (
              <span className="text-xs text-red-600">{errors.employeeId}</span>
            )}
          </div>

          {/* Role */}
          <div className="flex flex-col">
            <label className="text-sm mb-1 text-[#2B245C]">
              <span className="text-red-600">*</span> Role
            </label>
            <select
              name="user_designation"
              required
              value={employeeFormData.user_designation}
              onChange={handleInputChange}
              className={`p-2 border ${
                errors.role ? "border-red-600" : "border-gray-300"
              } rounded-md focus:ring focus:ring-blue-200`}
            >
              <option value="" disabled>
                Select Role
              </option>
              <option value="Employee">Employee</option>
              <option value="Reviewer">Reviewer</option>
              <option value="Assigner">Assigner</option>
              <option value="Approver">Approver</option>
              <option value="Contributor">Contributor</option>
              <option value="Supervisor">Supervisor</option>
            </select>
            {errors.role && (
              <span className="text-xs text-red-600">{errors.role}</span>
            )}
          </div>

          {/* Email */}
          <div className="flex flex-col">
            <label className="text-sm mb-1 text-[#2B245C]">
              <span className="text-red-600">*</span> Email
            </label>
            <input
              type="email"
              required
              name="email"
              value={employeeFormData.email}
              onChange={handleInputChange}
              placeholder="Enter Email Address"
              className={`p-2 border ${
                errors.email ? "border-red-600" : "border-gray-300"
              } rounded-md focus:ring focus:ring-blue-200`}
            />
            {errors.email && (
              <span className="text-xs text-red-600">{errors.email}</span>
            )}
          </div>

          {/* Contact Number */}
          <div className="flex flex-col">
            <label className="text-sm mb-1 text-[#2B245C]">
              <span className="text-red-600">*</span> Contact Number
            </label>
            <input
              type="tel"
              required
              name="contact_number"
              value={employeeFormData.contact_number}
              onChange={handleInputChange}
              placeholder="9876543210"
              className={`p-2 border ${
                errors.contactNumber ? "border-red-600" : "border-gray-300"
              } rounded-md focus:ring focus:ring-blue-200`}
            />
            {errors.contactNumber && (
              <span className="text-xs text-red-600">
                {errors.contactNumber}
              </span>
            )}
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            type="submit"
            className="bg-[#1e284e] text-white px-8 py-2 rounded-md"
          >
            {loading ? <Loader /> : "Submit"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Employee;
