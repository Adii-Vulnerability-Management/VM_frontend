import React, { useEffect, useState } from "react";
import axios from "axios";
import * as XLSX from "xlsx";
import { baseurl, initURL } from "../../../BaseUrl";
import { toast } from "react-toastify";
import { FaEdit, FaUserPlus } from "react-icons/fa";
import { useRouter } from "next/router";
import CustomAxios from "../CustomAxios";
import Loader from "../loader/Loader";
import Tooltip from "./Tooltip";
const DepartmentDetails = () => {
  const [departmentDetails, setDepartmentDetails] = useState([]);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isEmployeeModalOpen, setIsEmployeeModalOpen] = useState(false);
  const [editData, setEditData] = useState(null);
  const [selectedDepartmentId, setSelectedDepartmentId] = useState(null);
  const [importedData, setImportedData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);
  const [submitemployeeloading, setSubmitemployeeloading] = useState(false);
  const [editDeptLoading, seteditDeptLoading] = useState(false);
  const router = useRouter();

  const handlePageChange = (page) => {
    if (page > 0 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const fetchDepartmentDetails = async () => {
    setLoading(true);
    try {
      const response = await CustomAxios.get(
        `${baseurl}/${initURL}/rbi-tracking/fetchall-department-details`,
        {
          params: {
            limit: 5,
            page: currentPage,
          },
        }
      );

      setDepartmentDetails(response.data.data);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      toast.error("Failed to load department details.");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchDepartmentDetails();
  }, [router.asPath]);

  const openEditModal = (department) => {
    setEditData(department);
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = async () => {
    seteditDeptLoading(true);
    try {
      const response = await CustomAxios.patch(
        `${baseurl}/${initURL}/rbi-tracking/update-department-details/${editData._id}`,
        editData,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 200 || response.status === 201) {
        fetchDepartmentDetails();
        setIsEditModalOpen(false);
        toast.success("Department details updated successfully!");
      } else {
        toast.error("Failed to update department details.");
      }
    } catch (error) {
      toast.error("Error updating department details.");
    } finally {
      seteditDeptLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditData((prev) => ({ ...prev, [name]: value }));
  };

  const openEmployeeModal = (departmentId) => {
    setSelectedDepartmentId(departmentId);
    setIsEmployeeModalOpen(true);
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

        setImportedData(jsonData);
      };
      reader.readAsArrayBuffer(file);
    }
  };

  const handleEmployeeSubmit = async (event) => {
    event.preventDefault();

    if (importedData.length === 0) {
      toast.error("Please upload a valid sheet with employee details.");
      return;
    }
    const requiredAttributes = [
      "First Name",
      "Last Name",
      "Employee ID",
      "Designation",
      "Email",
      "Contact Number",
    ];

    // Validate data
    for (let index = 0; index < importedData.length; index++) {
      const employee = importedData[index];
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
    }

    setSubmitemployeeloading(true);
    try {
      const response = await CustomAxios.post(
        `${baseurl}/${initURL}/rbi-tracking/upload-department-employee-details`,
        {
          departmentId: selectedDepartmentId,
          employees: importedData,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 200 || response.status === 201) {
        toast.success("Employee details uploaded successfully!");
        setIsEmployeeModalOpen(false);
      } else {
        toast.error("Failed to upload employee details.");
      }
    } catch (error) {
      // Check if the error has a specific message from the backend
      const errorMessage =
        error.response?.data?.message ||
        "Error uploading employee details. Please try again.";
      // Display the appropriate error message
      toast.error(errorMessage);
    } finally {
      setSubmitemployeeloading(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center text-blue-600 flex justify-center items-center">
        <Loader />
      </div>
    );
  }
  return (
    <div className="min-h-[70vh]">
      <div className="overflow-hidden bg-white rounded-xl shadow-lg border border-gray-100">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-[#1e284e]">
              <tr>
                {[
                  "Department Type",
                  "Head",
                  "Location",
                  "Functions",
                  "Employees",
                  "Email",
                  "Contact",
                  "Code",
                  "Actions",
                ].map((header, index) => (
                  <th
                    key={index}
                    className="px-6 py-5 text-center text-sm font-semibold text-white tracking-wider border-b border-blue-700"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {Array.isArray(departmentDetails) &&
                departmentDetails.map((department) => (
                  <tr
                    key={department._id}
                    className="hover:bg-blue-50 transition-colors duration-200"
                  >
                    <td className="px-6 py-7 text-center text-[#2B245C] text-sm font-medium">
                      {department.departmentType}
                    </td>
                    <td className="px-6 py-7 text-center text-[#2B245C] text-sm font-medium">
                      {department.departmentHead}
                    </td>
                    <td className="px-6 py-7 text-center text-[#2B245C] text-sm font-medium">
                      {department.departmentLocation}
                    </td>
                    <td className="px-6 py-7 text-center text-[#2B245C] text-sm font-medium">
                      {department.departmentFunctions}
                    </td>
                    <td className="px-6 py-7 text-center text-[#2B245C] text-sm font-medium">
                      {department.departmentEmployees}
                    </td>
                    <td className="px-6 py-7 text-center text-[#2B245C] text-sm font-medium">
                      {department.departmentEmail}
                    </td>
                    <td className="px-6 py-7 text-center text-[#2B245C] text-sm font-medium">
                      {department.departmentContact}
                    </td>
                    <td className="px-6 py-7 text-center text-[#2B245C] text-sm font-medium">
                      {department.departmentCode}
                    </td>
                    <td className="px-6 py-7 text-center">
                      <div className="flex justify-center space-x-4">
                        <Tooltip
                          content={"Edit Department Details"}
                          position="top"
                        >
                          <button
                            onClick={() => openEditModal(department)}
                            className="group p-1.5 rounded-md hover:bg-blue-50 transition duration-150"
                          >
                            <FaEdit className="text-blue-500 text-lg cursor-pointer group-hover:text-blue-700 transition duration-150" />
                          </button>
                        </Tooltip>
                        <Tooltip
                          content={"Add Department Employees"}
                          position="top"
                        >
                          <button
                            onClick={() => openEmployeeModal(department._id)}
                            className="group p-1.5 rounded-md hover:bg-green-50 transition duration-150"
                          >
                            <FaUserPlus className="text-green-500 text-lg cursor-pointer group-hover:text-green-700 transition duration-150" />
                          </button>
                        </Tooltip>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>

          <div className="flex justify-between items-center mt-4">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
            >
              Previous
            </button>
            <span>
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {isEditModalOpen && (
        <div className="fixed inset-0 flex justify-center items-center bg-gray-800 bg-opacity-50 z-50">
          <div className="bg-white rounded-lg shadow-lg w-11/12 max-w-2xl p-6 relative transform -translate-y-1/2 top-1/2">
            <h2 className="text-xl font-bold mb-4 text-[#2B245C]">
              Edit Department
            </h2>
            <div className="grid grid-cols-2 gap-4 max-h-[70vh] overflow-y-auto">
              {Object.keys(editData)
                .filter(
                  (key) =>
                    ![
                      "_id",
                      "user",
                      "user_email",
                      "createdAt",
                      "is_deleted",
                      "updatedAt",
                      "__v",
                      "details",
                    ].includes(key)
                )
                .map((key) => (
                  <div key={key}>
                    <label className="block font-medium mb-1 text-[#2B245C]">
                      {key
                        .replace(/([A-Z])/g, " $1")
                        .replace(/^./, (str) => str.toUpperCase())}
                    </label>
                    {key === "departmentType" ? (
                      <select
                        name="departmentType"
                        value={editData[key]}
                        onChange={handleInputChange}
                        required
                        className="p-2 border border-gray-200 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                      >
                        <option value="" disabled>
                          Select a Department
                        </option>
                        <option value="Finance">Finance</option>
                        <option value="Human Resources">Human Resources</option>
                        <option value="Operations">Operations</option>
                        <option value="IT">IT</option>
                        <option value="Marketing">Marketing</option>
                        <option value="Customer Service">
                          Customer Service
                        </option>
                        <option value="Risk Management">Risk Management</option>
                        <option value="Audit">Audit</option>
                        <option value="Compliance">Compliance</option>
                        <option value="Treasury">Treasury</option>
                        <option value="Legal">Legal</option>
                        <option value="Retail Banking">Retail Banking</option>
                        <option value="Corporate Banking">
                          Corporate Banking
                        </option>
                        <option value="Wealth Management">
                          Wealth Management
                        </option>
                        <option value="Investment Banking">
                          Investment Banking
                        </option>
                        <option value="Credit and Loan Processing">
                          Credit and Loan Processing
                        </option>
                        <option value="Branch Operations">
                          Branch Operations
                        </option>
                        <option value="Security and Fraud Management">
                          Security and Fraud Management
                        </option>
                        <option value="Payments and Settlements">
                          Payments and Settlements
                        </option>
                        <option value="Training and Development">
                          Training and Development
                        </option>
                        <option value="Procurement">Procurement</option>
                        <option value="Administration">Administration</option>
                        <option value="Digital Banking">Digital Banking</option>
                        <option value="Public Relations">
                          Public Relations
                        </option>
                        <option value="Customer Analytics">
                          Customer Analytics
                        </option>
                        <option value="Insurance Services">
                          Insurance Services
                        </option>
                        <option value="Credit Card Services">
                          Credit Card Services
                        </option>
                        <option value="Microfinance and Rural Banking">
                          Microfinance and Rural Banking
                        </option>
                        <option value="Infrastructure Financing">
                          Infrastructure Financing
                        </option>
                        <option value="NRI Banking">NRI Banking</option>
                      </select>
                    ) : (
                      <input
                        type="text"
                        name={key}
                        value={editData[key]}
                        onChange={handleInputChange}
                        className="border p-2 w-full rounded bg-gray-100 text-[#2B245C] placeholder-gray-500 focus:ring focus:ring-blue-300 focus:outline-none"
                        placeholder={`Enter ${key}`}
                      />
                    )}
                  </div>
                ))}
            </div>

            <div className="mt-4 flex justify-end space-x-4">
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="flex items-center px-4 py-2 bg-gray-200 text-[#2B245C] rounded-md hover:bg-gray-300 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleEditSubmit}
                className="flex items-center justify-center min-w-20 px-4 py-2 bg-[#2B245C] text-white rounded-md hover:bg-[#1e1b4b] transition"
              >
                {editDeptLoading ? <Loader /> : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}

      {isEmployeeModalOpen && (
        <div className="fixed inset-0 flex justify-center items-center bg-gray-800 bg-opacity-50 z-50 overflow-y-auto">
          <div className="bg-white rounded-lg shadow-lg w-11/12 max-w-2xl p-6 mt-10 mb-10">
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
                  {submitemployeeloading ? <Loader /> : "Submit"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DepartmentDetails;
