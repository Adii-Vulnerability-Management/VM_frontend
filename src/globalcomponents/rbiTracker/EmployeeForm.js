import Dialog from "@/globalcomponents/rbiTracker/Dialog";
import axios from "axios";
import { useEffect, useState } from "react";
import {
  FaDownload,
  FaEdit,
  FaSave,
  FaTimes,
  FaTrashAlt,
} from "react-icons/fa";
import { toast } from "react-toastify";
import * as XLSX from "xlsx";
import CustomAxios from "@/globalcomponents/CustomAxios";
import Loader from "@/globalcomponents/loader/Loader";
import { baseurl, initURL } from "../../../BaseUrl";
const excelFilePath = "/Files/Employee_Details.xlsx"; // Adjust the file extension if necessary
const EmployeeForm = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [multimpleEmployeeLoading, setmultimpleEmployeeLoading] =
    useState(false);
  const [employeeFormData, setEmployeeFormData] = useState({
    firstName: "",
    lastName: "",
    employeeId: "",
    designation: "",
    email: "",
    contactNumber: "",
    importedData: [],
    role: "",
  });

  const [errors, setErrors] = useState({});
  const [editerrors, setEditerrors] = useState({});
  const [isEmployeeModalOpen, setIsEmployeeModalOpen] = useState(false);

  // table pagination start
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  // Paginated data
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  // table pagination end

  // edit code start
  const [editRowIndex, setEditRowIndex] = useState(null);
  const [editedRowData, setEditedRowData] = useState({});

  const handleEditClick = (index, rowData) => {
    setEditRowIndex(index);
    setEditedRowData(rowData);
  };

  const handleCancelEdit = () => {
    setEditRowIndex(null);
    setEditedRowData({});
    setEditerrors({});
  };

  const handleSaveEdit = (Id) => {
    if (!validateForm(editedRowData, setEditerrors)) return;
    editEmployee(Id, editedRowData);
  };

  const handleFieldChange = (fieldName, value) => {
    setEditedRowData({ ...editedRowData, [fieldName]: value });
  };
  // edit code end

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEmployeeFormData({ ...employeeFormData, [name]: value });
  };

  const validateForm = (data, setErrors) => {
    const newErrors = {};
    if (!data.firstName.trim()) {
      newErrors.firstName = "First Name is required";
    }

    if (!data.lastName.trim()) {
      newErrors.lastName = "Last Name is required";
    }

    if (!data.employeeId.trim()) {
      newErrors.employeeId = "Employee ID is required";
    }

    if (!data.role.trim()) {
      newErrors.role = "Role is required";
    }

    if (!data.designation.trim()) {
      newErrors.designation = "Designation is required";
    }

    if (!data.email.trim() || !/\S+@\S+\.\S+/.test(data.email)) {
      newErrors.email = "Valid Email is required";
    }

    if (!data.contactNumber.trim() || !/^\d{10}$/.test(data.contactNumber)) {
      newErrors.contactNumber = "Contact Number must be 10 digits";
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

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const data = new Uint8Array(event.target.result);
        const workbook = XLSX.read(data, { type: "array" });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        setEmployeeFormData({ ...employeeFormData, importedData: jsonData });
      };
      reader.readAsArrayBuffer(file);
    }
  };

  let handleEmployeeSubmit = (e) => {
    e.preventDefault();
    if (employeeFormData.importedData.length === 0) {
      toast.error("Please select a file");
      return;
    }
    createMultipleEmployees();
  };

  const deleteEmployee = async (employeeId) => {
    try {
      const response = await CustomAxios.delete(
        `${baseurl}/${initURL}/rbi-tracking/delete-employee/${employeeId}`
      );
      toast.success("Employee deleted successfully"); // Success message
      fetchEmployees();
    } catch (error) {
      toast.error(error.response.data.message || "Failed to delete employee");
    }
  };

  const fetchEmployees = async () => {
    try {
      const response = await CustomAxios.get(
        `${baseurl}/${initURL}/rbi-tracking/fetch-employee`,
        {
          params: { page: currentPage, limit: 10 }, // Add page and limit as query parameters
        }
      );

      // Assuming the API returns an object with data, total, page, and totalPages
      const { data, total, totalPages } = response.data;

      setEmployees(data);
      setTotalPages(totalPages);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to fetch employees");
    }
  };

  const createEmployee = async () => {
    let body = {
      firstName: employeeFormData.firstName,
      lastName: employeeFormData.lastName,
      employeeId: employeeFormData.employeeId,
      designation: employeeFormData.designation,
      email: employeeFormData.email,
      contactNumber: employeeFormData.contactNumber,
      role: employeeFormData.role,
    };
    setLoading(true);
    try {
      const response = await CustomAxios.post(
        `${baseurl}/${initURL}/rbi-tracking/create-employee`,
        body
      );
      toast.success(response.data.message || "Employee created successfully");
      fetchEmployees();
      setEmployeeFormData({
        firstName: "",
        lastName: "",
        employeeId: "",
        designation: "",
        email: "",
        contactNumber: "",
        role: "",
      });
    } catch (error) {
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

  const createMultipleEmployees = async () => {
    const requiredAttributes = [
      "First Name",
      "Last Name",
      "Employee ID",
      "Designation",
      "Email",
      "Contact Number",
    ];

    // Validate data
    for (let index = 0; index < employeeFormData.importedData.length; index++) {
      const employee = employeeFormData.importedData[index];
      const keys = Object.keys(employee);

      // Check for missing attributes
      const missingAttribute = requiredAttributes.find(
        (attr) => !keys.includes(attr)
      );
      if (missingAttribute) {
        toast.error(
          `missing the attribute: ${missingAttribute}. Please correct the data and try again. Download a sample for reference.`
        );
        return; // Stop further execution if validation fails
      }
      // Validate Role
      const validRoles = ["Employee", "Reviewer"];
      if (!validRoles.includes(employee.Role)) {
        toast.error(
          `Invalid Role: ${employee.Role}. Allowed roles are "Employee" or "Reviewer". Please correct the data and try again.`
        );
        return; // Stop further execution if validation fails
      }
    }

    // Transform data
    let data = employeeFormData.importedData.map((employee) => ({
      firstName: employee["First Name"],
      lastName: employee["Last Name"],
      employeeId: employee["Employee ID"],
      designation: employee.Designation,
      email: employee.Email,
      contactNumber: employee["Contact Number"],
      role: employee.Role,
    }));

    setmultimpleEmployeeLoading(true);

    try {
      const response = await CustomAxios.post(
        `${baseurl}/${initURL}/rbi-tracking/create-multiple`,
        data
      );
      setIsEmployeeModalOpen(false);
      fetchEmployees();
      toast.success(response.data.message || "Employees created successfully");
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Failed to create employees"
      );
    } finally {
      setmultimpleEmployeeLoading(false);
    }
  };

  const editEmployee = async (employeeId, updatedData) => {
    delete updatedData.user;
    try {
      const response = await CustomAxios.put(
        `${baseurl}/${initURL}/rbi-tracking/edit-employee/${employeeId}`,
        updatedData
      );
      setEditRowIndex(null);
      setEditedRowData({});
      fetchEmployees();
      toast.success(response.data.message || "Employee updated successfully");
      return response.data;
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update employee");
      throw error;
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, [currentPage]);
  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = excelFilePath;
    link.download = "updated rbi employee sheet.xlsx"; // Set default download file name
    link.click();
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center pb-4 pt-2">
        <h2 className="font-bold text-[#2B245C]">Employee Details</h2>
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setIsEmployeeModalOpen(true)}
            className="bg-[#1e284e] text-white px-4 py-2 rounded-full"
          >
            Add Employees via Excel
          </button>
          <a href="/Files/updated rbi employee sheet.xlsx">
            <button
              className="flex items-center justify-center bg-blue-600 text-white px-3 py-2 rounded-full hover:bg-blue-700 transition"
              title="Download Excel Template"
            >
              <FaDownload />
            </button>
          </a>
        </div>
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
              name="firstName"
              value={employeeFormData.firstName}
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
              name="lastName"
              value={employeeFormData.lastName}
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
              name="role"
              required
              value={employeeFormData.role}
              onChange={handleInputChange}
              className={`p-2 border ${
                errors.role ? "border-red-600" : "border-gray-300"
              } rounded-md focus:ring focus:ring-blue-200`}
            >
              <option value="" disabled>
                Select Role
              </option>
              <option value="Employee">Initiator</option>
              <option value="Reviewer">Reviewer</option>
            </select>
            {errors.role && (
              <span className="text-xs text-red-600">{errors.role}</span>
            )}
          </div>

          {/* Designation */}
          <div className="flex flex-col">
            <label className="text-sm mb-1 text-[#2B245C]">
              <span className="text-red-600">*</span> Designation
            </label>
            <input
              type="text"
              required
              name="designation"
              value={employeeFormData.designation}
              onChange={handleInputChange}
              placeholder="Enter Designation"
              className={`p-2 border ${
                errors.designation ? "border-red-600" : "border-gray-300"
              } rounded-md focus:ring focus:ring-blue-200`}
            />
            {errors.designation && (
              <span className="text-xs text-red-600">{errors.designation}</span>
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
              name="contactNumber"
              value={employeeFormData.contactNumber}
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

      <Dialog
        isOpen={isEmployeeModalOpen}
        onClose={() => setIsEmployeeModalOpen(false)}
      >
        <div className="min-w-[600px] p-4">
          <h2 className="text-xl font-bold mb-4 text-[#2B245C]">
            Add Employees
          </h2>
          <form onSubmit={handleEmployeeSubmit}>
            <div className="mb-4">
              <label
                htmlFor="employeeFile"
                className="block text-sm font-medium text-[#2B245C] mb-2"
              >
                Upload Employee File
              </label>
              <input
                type="file"
                id="employeeFile"
                accept=".xlsx, .xls"
                onChange={handleFileUpload}
                className="block w-full border border-gray-300 rounded-md p-2 text-[#2B245C] focus:ring focus:ring-blue-300 focus:outline-none"
              />
            </div>
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => setIsEmployeeModalOpen(false)}
                className="flex items-center px-4 py-2 bg-gray-200 text-[#2B245C] rounded-md hover:bg-gray-300 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex items-center justify-center min-w-20 px-4 py-2 bg-[#2B245C] text-white rounded-md hover:bg-[#1e1b4b] transition"
              >
                {multimpleEmployeeLoading ? <Loader /> : "Submit"}
              </button>
            </div>
          </form>
        </div>
      </Dialog>

      {/* Display Imported Data in Table */}
      {employees.length > 0 && (
        <div>
          <h2 className="font-bold text-[#2B245C] my-4 mt-9">Employees</h2>
          <div className="overflow-hidden bg-white rounded-xl shadow-lg border border-gray-100 mt-4">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-[#1e284e]">
                  <tr className="text-center">
                    {[
                      "First Name",
                      "Last Name",
                      "Employee ID",
                      "Designation",
                      "Email",
                      "Contact Number",
                      "Role",
                      "Action",
                    ].map((header) => (
                      <th
                        key={header}
                        className="px-6 py-5 text-sm font-semibold text-white tracking-wider border-b border-blue-700"
                      >
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody className="bg-white divide-y divide-gray-100">
                  {employees.map((employee, index) => (
                    <tr
                      key={index}
                      className="hover:bg-blue-50 transition-colors duration-200 text-center"
                    >
                      <td className="px-6 py-5 text-sm text-gray-700">
                        {editRowIndex === index ? (
                          <div>
                            <input
                              type="text"
                              value={editedRowData.firstName}
                              onChange={(e) =>
                                handleFieldChange("firstName", e.target.value)
                              }
                              className="border border-gray-300 rounded px-2 py-1 w-full"
                            />
                            {editerrors.firstName && (
                              <span className="text-xs text-red-600">
                                {editerrors.firstName}
                              </span>
                            )}
                          </div>
                        ) : (
                          employee.firstName
                        )}
                      </td>
                      <td className="px-6 py-5 text-sm text-gray-700">
                        {editRowIndex === index ? (
                          <div>
                            <input
                              type="text"
                              value={editedRowData.lastName}
                              onChange={(e) =>
                                handleFieldChange("lastName", e.target.value)
                              }
                              className="border border-gray-300 rounded px-2 py-1 w-full"
                            />
                            {editerrors.lastName && (
                              <span className="text-xs text-red-600">
                                {editerrors.lastName}
                              </span>
                            )}
                          </div>
                        ) : (
                          employee.lastName
                        )}
                      </td>
                      <td className="px-6 py-5 text-sm text-gray-700">
                        {editRowIndex === index ? (
                          <div>
                            <input
                              type="text"
                              value={editedRowData.employeeId}
                              onChange={(e) =>
                                handleFieldChange("employeeId", e.target.value)
                              }
                              className="border border-gray-300 rounded px-2 py-1 w-full"
                            />
                            {editerrors.employeeId && (
                              <span className="text-xs text-red-600">
                                {editerrors.employeeId}
                              </span>
                            )}
                          </div>
                        ) : (
                          employee.employeeId
                        )}
                      </td>
                      <td className="px-6 py-5 text-sm text-gray-700">
                        {editRowIndex === index ? (
                          <div>
                            <input
                              type="text"
                              value={editedRowData.designation}
                              onChange={(e) =>
                                handleFieldChange("designation", e.target.value)
                              }
                              className="border border-gray-300 rounded px-2 py-1 w-full"
                            />
                            {editerrors.designation && (
                              <span className="text-xs text-red-600">
                                {editerrors.designation}
                              </span>
                            )}
                          </div>
                        ) : (
                          employee.designation
                        )}
                      </td>
                      <td className="px-6 py-5 text-sm text-gray-700">
                        {editRowIndex === index ? (
                          <div>
                            <input
                              type="email"
                              value={editedRowData.email}
                              onChange={(e) =>
                                handleFieldChange("email", e.target.value)
                              }
                              className="border border-gray-300 rounded px-2 py-1 w-full"
                            />
                            {editerrors.email && (
                              <span className="text-xs text-red-600">
                                {editerrors.email}
                              </span>
                            )}
                          </div>
                        ) : (
                          employee.email
                        )}
                      </td>
                      <td className="px-6 py-5 text-sm text-gray-700">
                        {editRowIndex === index ? (
                          <div>
                            <input
                              type="text"
                              value={editedRowData.contactNumber}
                              onChange={(e) =>
                                handleFieldChange(
                                  "contactNumber",
                                  e.target.value
                                )
                              }
                              className="border border-gray-300 rounded px-2 py-1 w-full"
                            />
                            {editerrors.contactNumber && (
                              <span className="text-xs text-red-600">
                                {editerrors.contactNumber}
                              </span>
                            )}
                          </div>
                        ) : (
                          employee.contactNumber
                        )}
                      </td>
                      <td className="px-6 py-5 text-sm text-gray-700">
                        {employee?.role == "Employee"
                          ? "Initiator"
                          : employee?.role}
                      </td>
                      <td className="px-6 py-5 text-sm text-gray-700">
                        <div className="flex justify-center space-x-3">
                          {editRowIndex === index ? (
                            <>
                              <button
                                onClick={() => handleSaveEdit(employee._id)}
                                className="text-green-600 hover:text-green-800"
                                title="Save"
                              >
                                <FaSave fontSize={20} />
                              </button>
                              <button
                                onClick={handleCancelEdit}
                                className="text-red-600 hover:text-red-800"
                                title="Cancel"
                              >
                                <FaTimes fontSize={20} />
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                onClick={() => handleEditClick(index, employee)}
                                className="text-blue-600 hover:text-blue-800"
                                title="Edit"
                              >
                                <FaEdit fontSize={20} />
                              </button>
                              <button
                                onClick={() => deleteEmployee(employee._id)}
                                className="text-red-600 hover:text-red-800"
                                title="Delete"
                              >
                                <FaTrashAlt fontSize={18} />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Pagination */}
              <div className="flex justify-between items-center mt-4">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 disabled:opacity-50"
                >
                  Previous
                </button>
                <span className="text-sm text-gray-600">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeForm;
