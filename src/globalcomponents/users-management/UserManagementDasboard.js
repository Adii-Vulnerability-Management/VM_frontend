import React, { useEffect, useState } from "react";
import CustomAxios from "../CustomAxios";
import { baseurl, initURL } from "../../../BaseUrl";
import Loader from "../loader/Loader";
import { toast } from "react-toastify";

function UserManagementDasboard() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);

  // table pagination start
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const response = await CustomAxios.post(
        `${baseurl}/${initURL}/tisax-team-assignment/get-employees`,
        {
          user_designations: [
            "Employee",
            "Reviewer",
            "Assigner",
            "Approver",
            "Contributor",
            "Supervisor",
            "Creator",
          ],
        }
      );
      setEmployees(response?.data?.data || []);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to fetch employees");
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

  if (loading) {
    return (
      <div className="text-blue-600 hover:text-blue-800 flex justify-center items-center h-96">
        <Loader />
      </div>
    );
  }
  return (
    <div>
      {/* Page Title */}
      <div className="font-bold text-[#2B245C] text-3xl rounded-xl my-6 text-center">
        Employee List
      </div>

      {/* Table Container */}
      <div className="bg-white rounded-xl shadow-md border border-gray-100">
        <div className="overflow-x-auto rounded-xl">
          <table className="min-w-full text-sm text-left">
            {/* Table Head */}
            <thead className="bg-[#2B245C] text-white">
              <tr>
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
                    className="px-6 py-4 font-semibold text-sm uppercase tracking-wider"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>

            {/* Table Body */}
            <tbody>
              {paginatedEmployees.length > 0 ? (
                paginatedEmployees.map((employee, index) => (
                  <tr
                    key={index}
                    className="odd:bg-gray-50 even:bg-white hover:bg-gray-100 transition-colors duration-200"
                  >
                    <td className="px-6 py-4 text-gray-700">
                      {employee.first_name}
                    </td>
                    <td className="px-6 py-4 text-gray-700">
                      {employee.last_name}
                    </td>
                    <td className="px-6 py-4 text-gray-700">
                      {employee.employeeId || "NA"}
                    </td>
                    <td className="px-6 py-4 text-gray-700">
                      {employee.email}
                    </td>
                    <td className="px-6 py-4 text-gray-700">
                      {employee.contact_number}
                    </td>
                    <td className="px-6 py-4 text-gray-700">
                      {employee.user_designation}
                    </td>
                  </tr>
                ))
              ) : (
                // Fallback row if there are no employees
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-4 text-center text-gray-500"
                  >
                    No employees found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between p-4">
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
  );
}

export default UserManagementDasboard;
