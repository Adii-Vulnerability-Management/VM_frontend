import CustomAxios from "@/globalcomponents/CustomAxios";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { FaEdit, FaUserPlus } from "react-icons/fa";
import { toast } from "react-toastify";
import * as XLSX from "xlsx";
import { baseurl, initURL } from "../../../BaseUrl";
import Loader from "../loader/Loader";
import Dialog from "./Dialog";
import Tooltip from "./Tooltip";

const BranchDetails = () => {
  const [branchDetails, setBranchDetails] = useState([]);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isEmployeeModalOpen, setIsEmployeeModalOpen] = useState(false);
  const [editData, setEditData] = useState(null);
  const [selectedBranchId, setSelectedBranchId] = useState(null);
  const [importedData, setImportedData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);
  const [submitemployeeloading, setSubmitemployeeloading] = useState(false);
  const [editEmployeeLoading, seteditEmployeeLoading] = useState(false);
  const router = useRouter();

  const handlePageChange = (page) => {
    if (page > 0 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const fetchBranchDetails = async () => {
    setLoading(true);
    try {
      const response = await CustomAxios.get(
        `${baseurl}/${initURL}/rbi-tracking/fetchall-bank-details`,
        {
          params: {
            limit: 5,
            page: currentPage,
          },
        }
      );
      setBranchDetails(response.data.data);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      console.error("Error fetching branch details:", error);
      toast.error("Failed to load branch details.");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchBranchDetails();
  }, [currentPage, router.asPath]);

  const openEditModal = (branch) => {
    setEditData(branch);
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = async () => {
    seteditEmployeeLoading(true);
    try {
      const response = await CustomAxios.patch(
        `${baseurl}/${initURL}/rbi-tracking/update-bank-details/${editData._id}`,
        editData,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      if (response.status === 200 || response.status === 201) {
        fetchBranchDetails();
        setIsEditModalOpen(false);
        toast.success("Branch details updated successfully!");
      } else {
        toast.error("Failed to update branch details.");
      }
    } catch (error) {
      console.error("Error updating branch details:", error);
      toast.error("Error updating branch details.");
    } finally {
      seteditEmployeeLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditData((prev) => ({ ...prev, [name]: value }));
  };

  const openEmployeeModal = (branchId) => {
    setSelectedBranchId(branchId);
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
        `${baseurl}/${initURL}/rbi-tracking/upload-employee-details`,
        {
          branchId: selectedBranchId,
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
            <thead className="bg-gradient-to-r from-blue-900 to-indigo-900">
              <tr>
                {[
                  "Branch",
                  "Address",
                  "Branch Contact",
                  "Branch Manager",
                  "IFSC Code",
                  "Actions",
                ].map((header) => (
                  <th
                    key={header}
                    className="px-6 py-5 text-center text-sm font-semibold text-white tracking-wider border-b border-blue-700"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="bg-white divide-y divide-gray-100">
              {branchDetails?.map((bank) => (
                <tr
                  key={bank._id}
                  className="hover:bg-blue-50 transition-colors duration-200 text-center"
                >
                  <td className="px-6 py-5">
                    <div className="text-sm font-bold text-blue-900">
                      {bank.bankName}
                    </div>
                    <div className="text-xs text-gray-600 mt-1">
                      {bank.divisionBranch}
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="space-y-1">
                      <div className="text-sm text-gray-900">
                        {bank.address1}
                      </div>
                      <div className="text-xs text-gray-600">
                        {bank.address2}
                      </div>
                      <div className="text-xs text-gray-600">
                        {bank.address3}
                      </div>
                      <div className="text-sm text-gray-900 font-medium">
                        {`${bank.cityState} - ${bank.zipCode}`}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="text-sm font-medium text-gray-900">
                      {`+91 ${bank.bankContact}`}
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="space-y-1">
                      <div className="text-sm font-semibold text-blue-900">
                        {`${bank.branchManagerFirstName} ${bank.branchManagerLastName}`}
                      </div>
                      <div className="text-xs text-gray-600">
                        {bank.branchManagerEmailId}
                      </div>
                      <div className="text-xs text-gray-600">
                        {bank.branchManagerContact}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="text-sm font-mono font-bold text-blue-900">
                      {bank.ifscCode}
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center justify-center space-x-3">
                      <Tooltip content={"Edit Branch Details"} position="top">
                        <button
                          onClick={() => openEditModal(bank)}
                          className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded-full transition-colors duration-200"
                        >
                          <FaEdit className="w-5 h-5" />
                        </button>
                      </Tooltip>
                      <Tooltip content={"Add Branch Employee"} position="top">
                        <button
                          onClick={() => openEmployeeModal(bank._id)}
                          className="p-2 text-green-600 hover:text-green-800 hover:bg-green-100 rounded-full transition-colors duration-200"
                        >
                          <FaUserPlus className="w-5 h-5" />
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
              Edit Branch
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
                    <input
                      type="text"
                      name={key}
                      value={editData[key]}
                      onChange={handleInputChange}
                      className="border p-2 w-full rounded bg-gray-100 text-[#2B245C] placeholder-gray-500 focus:ring focus:ring-blue-300 focus:outline-none"
                      placeholder={`Enter ${key}`}
                    />
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
                className="flex items-center px-4 py-2 bg-[#2B245C] text-white rounded-md hover:bg-[#1e1b4b] transition justify-center min-w-20"
              >
                {editEmployeeLoading ? <Loader /> : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* {isEmployeeModalOpen && (
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
                  <i className="fas fa-times mr-2"></i>
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center px-4 py-2 bg-[#2B245C] text-white rounded-md hover:bg-[#1e1b4b] transition"
                >
                  <i className="fas fa-upload mr-2"></i>
                  Submit
                </button>
              </div>
            </form>
          </div>
        </div>
      )} */}

      <Dialog
        isOpen={isEmployeeModalOpen}
        onClose={() => setIsEmployeeModalOpen(false)}
      >
        <div className="bg-white rounded-lg min-w-[600px] p-6">
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
                className="flex items-center justify-center px-4 py-2 bg-[#2B245C] text-white rounded-md hover:bg-[#1e1b4b] transition min-w-20"
              >
                {submitemployeeloading ? <Loader /> : "Submit"}
              </button>
            </div>
          </form>
        </div>
      </Dialog>
    </div>
  );
};

export default BranchDetails;
