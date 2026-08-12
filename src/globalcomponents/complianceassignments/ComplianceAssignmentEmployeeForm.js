import CustomAxios from "@/globalcomponents/CustomAxios";
import { useRouter } from "next/router";
import Loader from "@/globalcomponents/loader/Loader";
import { can, guard } from "@/auth/auth-permissions";
import { useEffect, useState } from "react";
import { FaEdit, FaSave, FaTimes, FaTrashAlt } from "react-icons/fa";
import { toast } from "react-toastify";
import * as XLSX from "xlsx";
import { baseurl, initURL } from "../../../BaseUrl";

const excelFilePath = "/Files/Employee_Details.xlsx"; // Adjust the file extension if necessary
const ALLOWED_EMPLOYEE_ROLES = ["EMPLOYEE", "REVIEWER", "ASSIGNER"];

const FrameworkEmployeeForm = () => {
  const router = useRouter();

  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [multimpleEmployeeLoading, setmultimpleEmployeeLoading] =
    useState(false);
  const [employeeFormData, setEmployeeFormData] = useState({
    first_name: "",
    last_name: "",
    employeeId: "",
    roles: "",
    email: "",
    contact_number: "",
  });

  const [roles, setRoles] = useState([]);
  const [errors, setErrors] = useState({});
  const [editerrors, setEditerrors] = useState({});
  const [isEmployeeModalOpen, setIsEmployeeModalOpen] = useState(false);

  const [tableLoading, settableLoading] = useState(false);
  // table pagination start
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // table pagination end

  // edit code start
  const [editRowIndex, setEditRowIndex] = useState(null);
  const [editedRowData, setEditedRowData] = useState({});

  const canView = can("security.read");
  const canCreate = can("security.create");
  const canUpdate = can(["security.update", "security.manage"]);
  const canDelete = can(["security.delete", "security.manage"]);

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
    if (!data.first_name.trim()) {
      newErrors.first_name = "First Name is required";
    }

    if (!data.last_name.trim()) {
      newErrors.last_name = "Last Name is required";
    }

    if (!editRowIndex && !data.employeeId.trim()) {
      newErrors.employeeId = "Employee ID is required";
    }

    if (!String(data.roles || "").trim()) {
      newErrors.roles = "Role is required";
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
        `${baseurl}/${initURL}/framework-control-employee/employee/${employeeId}`,
      );
      toast.success("Employee deleted successfully"); // Success message
      fetchEmployees();
    } catch (error) {
      toast.error(error.response.data.message || "Failed to delete employee");
    }
  };

  const fetchEmployees = async () => {
    settableLoading(true);
    try {
      const response = await CustomAxios.get(
        `${baseurl}/${initURL}/framework-control-employee/employees`,
      );
      setEmployees(response.data || []);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to fetch employees");
    } finally {
      settableLoading(false);
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
      roles: [employeeFormData.roles],
    };
    setLoading(true);
    try {
      const response = await CustomAxios.post(
        `${baseurl}/${initURL}/framework-control-employee/create`,
        body,
      );
      toast.success(response.data.message || "Employee created successfully");
      fetchEmployees();
      setEmployeeFormData({
        first_name: "",
        last_name: "",
        employeeId: "",
        roles: "",
        email: "",
        contact_number: "",
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
      "Role",
      "Email",
      "Contact Number",
    ];

    // Validate data
    for (let index = 0; index < employeeFormData.importedData.length; index++) {
      const employee = employeeFormData.importedData[index];
      const keys = Object.keys(employee);

      // Check for missing attributes
      const missingAttribute = requiredAttributes.find(
        (attr) => !keys.includes(attr),
      );
      if (missingAttribute) {
        toast.error(
          `missing the attribute: ${missingAttribute}. Please correct the data and try again. Download a sample for reference.`,
        );
        return; // Stop further execution if validation fails
      }
      // Validate Role
      const normalizedRole = String(employee.Role || "")
        .trim()
        .toUpperCase();
      const allowedRoles = roles.length > 0 ? roles : ALLOWED_EMPLOYEE_ROLES;
      if (!allowedRoles.includes(normalizedRole)) {
        toast.error(
          `Invalid Role: ${employee.Role}. Allowed roles are ${allowedRoles.join(", ")}. Please correct the data and try again.`,
        );
        return; // Stop further execution if validation fails
      }
    }

    // Transform data
    let data = employeeFormData.importedData.map((employee) => ({
      firstName: employee["First Name"],
      lastName: employee["Last Name"],
      employeeId: employee["Employee ID"],
      email: employee.Email,
      contactNumber: employee["Contact Number"],
      role: String(employee.Role || "")
        .trim()
        .toUpperCase(),
    }));

    setmultimpleEmployeeLoading(true);

    try {
      const response = await CustomAxios.post(
        `${baseurl}/${initURL}/rbi-tracking/create-multiple`,
        data,
      );
      setIsEmployeeModalOpen(false);
      fetchEmployees();
      toast.success(response.data.message || "Employees created successfully");
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Failed to create employees",
      );
    } finally {
      setmultimpleEmployeeLoading(false);
    }
  };

  const editEmployee = async (employeeId, updatedData) => {
    let obj = {
      contact_number: updatedData.contact_number,
      email: updatedData.email,
      first_name: updatedData.first_name,
      last_name: updatedData.last_name,
    };
    try {
      const response = await CustomAxios.put(
        `${baseurl}/${initURL}/framework-control-employee/employee/${employeeId}`,
        obj,
      );
      setEditRowIndex(null);
      setEditedRowData({});
      fetchEmployees();
      toast.success(response.data.message || "Employee updated successfully");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update employee");
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, [currentPage]);

  useEffect(() => {
    fetchAccessCatalog();
  }, []);

  const fetchAccessCatalog = async () => {
    try {
      const { data } = await CustomAxios.get(`${initURL}/access/catalog`);
      const modules = data?.modules || data?.data?.modules || [];
      const filteredRoles = modules
        .map((module) => module?.key)
        .filter((role) =>
          ALLOWED_EMPLOYEE_ROLES.includes(
            String(role || "")
              .trim()
              .toUpperCase(),
          ),
        );

      setRoles([
        ...new Set(
          filteredRoles.map((role) =>
            String(role || "")
              .trim()
              .toUpperCase(),
          ),
        ),
      ]);
    } catch (error) {
      console.error("Failed to fetch access catalog:", error);
      toast.error("Failed to load role options");
      setRoles([]);
    }
  };

  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = excelFilePath;
    link.download = "updated rbi employee sheet.xlsx"; // Set default download file name
    link.click();
  };

  // Handle page changes
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= Math.ceil(employees.length / itemsPerPage)) {
      setCurrentPage(newPage);
    }
  };

  // Calculate total pages
  const totalPages = Math.ceil(employees.length / itemsPerPage);

  // Slice data to get paginated employees
  const paginatedEmployees = employees.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  return (
    <div className="min-h-screen p-5 space-y-5">
      <section className="rounded-2xl border border-[#2B245C] bg-white p-6 shadow-lg hover:shadow-2xl transition-shadow duration-300">
        <h2 className="text-2xl font-bold text-[#2B245C] mb-5">
          Create Employee
        </h2>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            guard(canCreate, router, () => handleSubmit(e));
          }}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* First Name */}
            <div className="flex flex-col">
              <label className="block text-xs font-semibold text-gray-700 mb-2">
                <span className="text-red-600">*</span> First Name
              </label>
              <input
                type="text"
                required
                name="first_name"
                value={employeeFormData.first_name}
                onChange={handleInputChange}
                placeholder="Enter First Name"
                className={`px-4 py-2 text-sm text-gray-900 border ${
                  errors.first_name ? "border-red-600" : "border-gray-300"
                } rounded-lg focus:ring focus:ring-blue-200`}
              />
              {errors.first_name && (
                <span className="text-xs text-red-600">
                  {errors.first_name}
                </span>
              )}
            </div>

            {/* Last Name */}
            <div className="flex flex-col">
              <label className="block text-xs font-semibold text-gray-700 mb-2">
                <span className="text-red-600">*</span> Last Name
              </label>
              <input
                type="text"
                required
                name="last_name"
                value={employeeFormData.last_name}
                onChange={handleInputChange}
                placeholder="Enter Last Name"
                className={`px-4 py-2 text-sm text-gray-900 border ${
                  errors.last_name ? "border-red-600" : "border-gray-300"
                } rounded-lg focus:ring focus:ring-blue-200`}
              />
              {errors.last_name && (
                <span className="text-xs text-red-600">{errors.last_name}</span>
              )}
            </div>

            {/* Employee ID */}
            <div className="flex flex-col">
              <label className="block text-xs font-semibold text-gray-700 mb-2">
                <span className="text-red-600">*</span> Employee ID
              </label>
              <input
                type="text"
                required
                name="employeeId"
                value={employeeFormData.employeeId}
                onChange={handleInputChange}
                placeholder="Enter Employee ID"
                className={`px-4 py-2 text-sm text-gray-900 border ${
                  errors.employeeId ? "border-red-600" : "border-gray-300"
                } rounded-lg focus:ring focus:ring-blue-200`}
              />
              {errors.employeeId && (
                <span className="text-xs text-red-600">
                  {errors.employeeId}
                </span>
              )}
            </div>

            {/* Role */}
            <div className="flex flex-col">
              <label className="block text-xs font-semibold text-gray-700 mb-2">
                <span className="text-red-600">*</span> Role
              </label>
              <select
                name="roles"
                required
                value={employeeFormData.roles}
                onChange={handleInputChange}
                className={`px-4 py-2 text-sm text-gray-900 border ${
                  errors.roles ? "border-red-600" : "border-gray-300"
                } rounded-lg focus:ring focus:ring-blue-200`}
              >
                <option value="" disabled>
                  Select Role
                </option>
                {roles.length > 0 ? (
                  roles.map((role) => (
                    <option key={role} value={role}>
                      {role}
                    </option>
                  ))
                ) : (
                  <option value="" disabled>
                    Loading roles...
                  </option>
                )}
              </select>
              {errors.roles && (
                <span className="text-xs text-red-600">{errors.roles}</span>
              )}
            </div>

            {/* Email */}
            <div className="flex flex-col">
              <label className="block text-xs font-semibold text-gray-700 mb-2">
                <span className="text-red-600">*</span> Email
              </label>
              <input
                type="email"
                required
                name="email"
                value={employeeFormData.email}
                onChange={handleInputChange}
                placeholder="Enter Email Address"
                className={`px-4 py-2 text-sm text-gray-900 border ${
                  errors.email ? "border-red-600" : "border-gray-300"
                } rounded-lg focus:ring focus:ring-blue-200`}
              />
              {errors.email && (
                <span className="text-xs text-red-600">{errors.email}</span>
              )}
            </div>

            {/* Contact Number */}
            <div className="flex flex-col">
              <label className="block text-xs font-semibold text-gray-700 mb-2">
                <span className="text-red-600">*</span> Contact Number
              </label>
              <input
                type="tel"
                required
                name="contact_number"
                value={employeeFormData.contact_number}
                onChange={handleInputChange}
                placeholder="9876543210"
                className={`px-4 py-2 text-sm text-gray-900 border ${
                  errors.contact_number ? "border-red-600" : "border-gray-300"
                } rounded-lg focus:ring focus:ring-blue-200`}
              />
              {errors.contact_number && (
                <span className="text-xs text-red-600">
                  {errors.contact_number}
                </span>
              )}
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <button
              type="submit"
              title="Create employee"
              onClick={(e) => {
                if (!canCreate) {
                  e.preventDefault();
                  guard(false, router); // redirects
                  return;
                }
              }}
              className="inline-flex items-center gap-2 rounded-lg bg-[#2B245C] px-6 py-2.5 text-sm font-semibold text-white shadow-md hover:shadow-lg hover:bg-opacity-90 disabled:opacity-60 transition-all"
            >
              {loading ? <Loader /> : "Submit"}
            </button>
          </div>
        </form>
      </section>

      {/* Display Imported Data in Table */}
      <section className="rounded-2xl border border-[#2B245C] bg-white p-6 shadow-lg hover:shadow-2xl transition-shadow duration-300">
        <h2 className="text-2xl font-semibold text-[#2B245C] mb-5">
          Employees
        </h2>
        
        {tableLoading ? (
          <div className="text-blue-600 flex justify-center items-center h-96">
            <Loader />
          </div>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-gray-800">
            <table className="min-w-full text-sm">
              <thead className="bg-[#2B245C] text-left text-white border-b border-gray-800">
                <tr>
                  {[
                    "First Name",
                    "Last Name",
                    "Employee ID",
                    "Email",
                    "Contact Number",
                    "Role",
                    "Action",
                  ].map((header) => (
                    <th key={header} className="px-4 py-2 font-medium">
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {!canView ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-6 py-5 text-center text-red-600 font-medium"
                    >
                      You don’t have permission to view employees.
                    </td>
                  </tr>
                ) : paginatedEmployees.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-6 py-5 text-center text-gray-600"
                    >
                      No records found.
                    </td>
                  </tr>
                ) : (
                  paginatedEmployees.map((employee, index) => (
                    <tr
                      key={index}
                      className="hover:bg-blue-50 transition-colors duration-200"
                    >
                      <td className="px-4 py-2">
                        {editRowIndex === index ? (
                          <div>
                            <input
                              type="text"
                              value={editedRowData.first_name}
                              onChange={(e) =>
                                handleFieldChange("first_name", e.target.value)
                              }
                              className="border border-gray-300 rounded px-2 py-1 w-full"
                            />
                            {editerrors.first_name && (
                              <span className="text-xs text-red-600">
                                {editerrors.first_name}
                              </span>
                            )}
                          </div>
                        ) : (
                          employee.first_name
                        )}
                      </td>
                      <td className="px-4 py-2">
                        {editRowIndex === index ? (
                          <div>
                            <input
                              type="text"
                              value={editedRowData.last_name}
                              onChange={(e) =>
                                handleFieldChange("last_name", e.target.value)
                              }
                              className="border border-gray-300 rounded px-2 py-1 w-full"
                            />
                            {editerrors.last_name && (
                              <span className="text-xs text-red-600">
                                {editerrors.last_name}
                              </span>
                            )}
                          </div>
                        ) : (
                          employee.last_name
                        )}
                      </td>
                      <td className="px-4 py-2">
                        {employee.employeeId || "NA"}
                      </td>
                      <td className="px-4 py-2">
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
                      <td className="px-4 py-2">
                        {editRowIndex === index ? (
                          <div>
                            <input
                              type="text"
                              value={editedRowData.contact_number}
                              onChange={(e) =>
                                handleFieldChange(
                                  "contact_number",
                                  e.target.value,
                                )
                              }
                              className="border border-gray-300 rounded px-2 py-1 w-full"
                            />
                            {editerrors.contact_number && (
                              <span className="text-xs text-red-600">
                                {editerrors.contact_number}
                              </span>
                            )}
                          </div>
                        ) : (
                          employee.contact_number
                        )}
                      </td>
                      <td className="px-4 py-2">
                        {Array.isArray(employee?.roles)
                          ? employee.roles.join(", ")
                          : employee?.role}
                      </td>
                      <td className="px-4 py-2">
                        <div className="flex space-x-3">
                          {editRowIndex === index ? (
                            <>
                              <button
                                type="button"
                                title="Save"
                                onClick={() =>
                                  guard(canUpdate, router, () =>
                                    handleSaveEdit(employee._id),
                                  )
                                }
                                className="text-green-600 hover:text-green-800"
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
                                type="button"
                                title="Edit"
                                onClick={() =>
                                  guard(canUpdate, router, () =>
                                    handleEditClick(index, employee),
                                  )
                                }
                                className="text-blue-600 hover:text-blue-800"
                              >
                                <FaEdit fontSize={20} />
                              </button>
                              <button
                                type="button"
                                title="Delete"
                                onClick={() =>
                                  guard(canDelete, router, () =>
                                    deleteEmployee(employee._id),
                                  )
                                }
                                className="text-red-600 hover:text-red-800"
                              >
                                <FaTrashAlt fontSize={18} />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>

            {/* Pagination */}
            <div className="flex justify-end gap-3 items-center m-3 mt-5">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="rounded-lg bg-[#2B245C] text-white px-4 py-2 text-sm font-semibold shadow-md hover:shadow-lg hover:bg-opacity-90 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-200 ease-in-out"
              >
                Prev
              </button>
              <span className="text-sm text-gray-600">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="rounded-lg bg-[#2B245C] text-white px-4 py-2 text-sm font-semibold shadow-md hover:shadow-lg hover:bg-opacity-90 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-200 ease-in-out"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
};

export default FrameworkEmployeeForm;
