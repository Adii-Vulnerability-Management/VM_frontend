import CustomAxios from "@/globalcomponents/CustomAxios";
import Loader from "@/globalcomponents/loader/Loader";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { baseurl, initURL } from "../../../BaseUrl";
const Employee = () => {
  const [employees, setEmployees] = useState([]);
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

  const [tableLoading, settableLoading] = useState(false);
  // table pagination start
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // table pagination end

  // edit code start
  const [editRowIndex, setEditRowIndex] = useState(null);
  const [editedRowData, setEditedRowData] = useState({});

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


  const fetchEmployees = async () => {
    settableLoading(true);
    try {
      const response = await CustomAxios.post(
        `${baseurl}/${initURL}/tisax-team-assignment/get-employees`, { "user_designations": ["Employee", "Reviewer", "Assigner"] },
      );
      setEmployees(response?.data?.data || []);
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
      roles: [employeeFormData.user_designation],
    };
    setLoading(true);
    try {
      const response = await CustomAxios.post(
        `${baseurl}/${initURL}/framework-control-employee/create`,
        body
      );
      toast.success(response.data.message || "Employee created successfully");
      fetchEmployees();
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


  useEffect(() => {
    fetchEmployees();
  }, []);


  // Handle page changes
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  // Calculate total pages
  const totalPages = Math.ceil(employees.length / itemsPerPage);

  // Slice data for pagination
  const paginatedEmployees = employees.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
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
              className={`p-2 border ${errors.firstName ? "border-red-600" : "border-gray-300"
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
              className={`p-2 border ${errors.lastName ? "border-red-600" : "border-gray-300"
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
              className={`p-2 border ${errors.employeeId ? "border-red-600" : "border-gray-300"
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
              className={`p-2 border ${errors.role ? "border-red-600" : "border-gray-300"
                } rounded-md focus:ring focus:ring-blue-200`}
            >
              <option value="" disabled>
                Select Role
              </option>
              <option value="Employee">Employee</option>
              <option value="Reviewer">Reviewer</option>
              <option value="Assigner">Assigner</option>
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
              className={`p-2 border ${errors.email ? "border-red-600" : "border-gray-300"
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
              className={`p-2 border ${errors.contactNumber ? "border-red-600" : "border-gray-300"
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

      {/* Display Imported Data in Table */}
      {tableLoading ? (
        <div className="text-blue-600 hover:text-blue-800 flex justify-center items-center h-96">
          <Loader />
        </div>
      ) : (
        employees.length > 0 && (
          <div>
            <h2 className="font-bold text-[#2B245C] my-4 mt-9">Employees</h2>
            <div className="overflow-hidden bg-white rounded-xl shadow-lg border border-gray-100 mt-4">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gradient-to-r from-blue-900 to-indigo-900">
                    <tr className="text-center">
                      {[
                        "First Name",
                        "Last Name",
                        "Employee ID",
                        "Email",
                        "Contact Number",
                        "Role",
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
                    {paginatedEmployees.map((employee, index) => (
                      <tr
                        key={index}
                        className="hover:bg-blue-50 transition-colors duration-200 text-center"
                      >
                        <td className="px-6 py-5 text-sm text-gray-700">
                          {employee.first_name}
                        </td>
                        <td className="px-6 py-5 text-sm text-gray-700">
                          {employee.last_name}
                        </td>
                        <td className="px-6 py-5 text-sm text-gray-700">
                          {employee.employeeId || "NA"}
                        </td>
                        <td className="px-6 py-5 text-sm text-gray-700">
                          {employee.email}
                        </td>
                        <td className="px-6 py-5 text-sm text-gray-700">
                          {employee.contact_number}
                        </td>
                        <td className="px-6 py-5 text-sm text-gray-700">
                          {employee?.user_designation}
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
        )
      )}
    </div>
  );
};

export default Employee;
