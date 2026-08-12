import React, { useEffect, useState } from "react";
import Loader from "@/globalcomponents/loader/Loader";
import CustomAxios from "@/globalcomponents/CustomAxios";
import { baseurl, initURL } from "../../../../BaseUrl";
import { toast } from "react-toastify";
import { can } from "@/auth/auth-permissions";

function EmployeeList() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const canView = can(["operations.read", "operations.manage"], {
    mode: "all",
  });

  const ALLOWED_ROLES = [
    "APPROVER",
    "ASSIGNER",
    "EMPLOYEE",
    "CONTRIBUTOR",
    "REVIEWER",
  ];

  const hasAllowedRole = (roles = []) =>
    roles.some((role) => ALLOWED_ROLES.includes(role));

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const response = await CustomAxios.get(
        `${baseurl}/${initURL}/apiv1/users/db?page=1&limit=100`,
      );

      const users = response?.data?.data || [];
      const filteredUsers = users.filter((user) => hasAllowedRole(user.roles));

      setEmployees(filteredUsers);
      setCurrentPage(1);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const totalPages = Math.ceil(employees.length / itemsPerPage);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const paginatedEmployees = employees.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  if (loading) {
    return (
      <div className="text-blue-600 hover:text-blue-800 flex justify-center items-center h-screen">
        <Loader />
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="px-6 py-8 bg-[#2B245C] rounded-2xl shadow-lg hover:shadow-2xl transition-shadow duration-300">
        <div>
          <h1 className="text-3xl font-bold text-cyan-50">Employees</h1>
        </div>
      </div>

      <div className="overflow-hidden bg-white rounded-xl shadow-lg border border-gray-100 mt-6">
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
                ].map((header) => (
                  <th key={header} className="px-6 py-2 font-medium">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {!canView ? (
                <tr>
                  <td
                    colSpan="6"
                    className="px-6 py-3 text-sm text-red-600 text-center font-medium"
                  >
                    You don’t have permission to view employees.
                  </td>
                </tr>
              ) : paginatedEmployees.length === 0 ? (
                <tr>
                  <td
                    colSpan="6"
                    className="px-6 py-3 text-sm text-gray-600 text-center font-medium"
                  >
                    No employees found.
                  </td>
                </tr>
              ) : (
                paginatedEmployees.map((employee) => (
                  <tr
                    key={employee._id}
                    className="hover:bg-gray-50 transition-colors duration-200"
                  >
                    <td className="px-6 py-3">{employee.first_name || "-"}</td>
                    <td className="px-6 py-3">{employee.last_name || "-"}</td>
                    <td className="px-6 py-3">{employee.employeeId || "NA"}</td>
                    <td className="px-6 py-3">
                      {employee.email || employee.user_email || "-"}
                    </td>
                    <td className="px-6 py-3">
                      {employee.contact_number || "-"}
                    </td>
                    <td className="px-6 py-3">
                      {employee.roles?.length ? employee.roles.join(", ") : "-"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          <div className="flex justify-between items-center mt-4 p-4">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1 || totalPages === 0}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 disabled:opacity-50"
            >
              Previous
            </button>

            <span className="text-sm text-gray-600">
              Page {totalPages === 0 ? 0 : currentPage} of {totalPages}
            </span>

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages || totalPages === 0}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EmployeeList;
