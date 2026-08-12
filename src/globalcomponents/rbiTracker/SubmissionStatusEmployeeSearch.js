import React, { useState, useRef, useEffect } from "react";
import { baseurl, initURL } from "../../../BaseUrl";
import { toast } from "react-toastify";
import axios from "axios";
import useDebounce from "../hooks/useDebounce";
import { FaTrashAlt } from "react-icons/fa";
import CustomAxios from "../CustomAxios";
import Loader from "../loader/Loader";

const SubmissionStatusEmployeeSearch = ({
  RbiTrackerNotifierId,
  reminders,
  setSelectedReturn,
  setSearchData,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const employeeSearchRef = useRef(null);
  const [employees, setEmployees] = useState([]);
  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  const [loader, setLoader] = useState(false);

  // reviewer state
  const [reviewerQuery, setReviewerQuery] = useState("");
  const [reviewerSuggestions, setReviewerSuggestions] = useState(false);
  const [reviewers, setReviewers] = useState([]);
  const [selectedReviewers, setSelectedReviewers] = useState([]);
  const debouncedReviewerQuery = useDebounce(reviewerQuery, 300);
  const reviewerSearchRef = useRef(null);

  const fetchDeptBankEmployee = async (query) => {
    try {
      const response = await CustomAxios.get(
        `${baseurl}/${initURL}/rbi-tracking/fetch-dept-bank-employee`,
        {
          params: {
            searchQuery: query,
            role: "Employee",
          },
        }
      );
      setEmployees(response?.data?.data || []);
    } catch (error) {
      toast.error(error.response?.data?.message || "An error occurred.");
    }
  };

  // Fetch reviewers based on query
  const fetchReviewers = async (query) => {
    try {
      const response = await CustomAxios.get(
        `${baseurl}/${initURL}/rbi-tracking/fetch-dept-bank-employee`,
        {
          params: { searchQuery: query, role: "Reviewer" },
        }
      );
      setReviewers(response?.data?.data || []);
    } catch (error) {
      toast.error(error.response?.data?.message || "An error occurred.");
    }
  };

  useEffect(() => {
    if (debouncedSearchQuery) {
      fetchDeptBankEmployee(debouncedSearchQuery);
    } else {
      setEmployees([]);
    }
  }, [debouncedSearchQuery]);

  const handleEmployeeSelect = (employee) => {
    setSelectedEmployees((prev) => {
      const isAlreadySelected = prev.some((e) => e._id === employee._id);
      if (isAlreadySelected) {
        return prev.filter((e) => e._id !== employee._id);
      } else {
        return [...prev, employee]; // Allow multiple selections
      }
    });
  };

  const handleEmployeeRemove = (employeeId) => {
    setSelectedEmployees((prev) => prev.filter((e) => e._id !== employeeId));
  };

  // reviewer function
  // Debounced effect for fetching reviewers
  useEffect(() => {
    if (debouncedReviewerQuery) {
      fetchReviewers(debouncedReviewerQuery);
    } else {
      setReviewers([]);
    }
  }, [debouncedReviewerQuery]);

  const handleReviewerSelect = (reviewer) => {
    if (selectedReviewers.some((r) => r._id === reviewer._id)) {
      setSelectedReviewers((prev) =>
        prev.filter((r) => r._id !== reviewer._id)
      );
    } else {
      setSelectedReviewers((prev) => [reviewer]);
    }
  };

  const handleReviewerRemove = (reviewerId) => {
    setSelectedReviewers((prev) => prev.filter((r) => r._id !== reviewerId));
  };

  const handleAssignReturn = () => {
    if (selectedEmployees.length === 0) {
      toast.error("No employees selected for assignment.");
      return;
    }
    if (!RbiTrackerNotifierId) {
      toast.error("No return selected for assignment.");
      return;
    }

    if (selectedReviewers.length === 0) {
      toast.error("No employees selected for Review.");
      return;
    }

    // API Call or Logic to assign the return
    // toast.success("Return assigned to selected employees successfully.");
    createEmployeeReturns(selectedEmployees);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        employeeSearchRef.current &&
        !employeeSearchRef.current.contains(event.target)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        reviewerSearchRef.current &&
        !reviewerSearchRef.current.contains(event.target)
      ) {
        setReviewerSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const createEmployeeReturns = async (employeeReturns) => {
    let scheduleDates = reminders.map((reminder) => ({
      submissionDate: reminder.submissionDate,
      reminderDate: reminder.reminderDate,
      employeeSubmissions: employeeReturns.map((emp) => ({
        employeeId: emp._id, // Store employee ID for tracking
        submissionStatus: "Pending", // Default status
      })),
    }));

    let body = {
      employeeIds: employeeReturns.map((emp) => emp._id), // Send an array of employee IDs
      RbiTrackerNotifierId: RbiTrackerNotifierId,
      emails: employeeReturns.map((emp) => emp.email), // Optional: If API requires emails
      reviewerId:
        selectedReviewers.length > 0 ? selectedReviewers[0]._id : null, // Assuming single reviewer
      scheduleDates: scheduleDates,
    };
    setLoader(true);

    try {
      const response = await CustomAxios.post(
        `${baseurl}/${initURL}/rbi-tracking/create-employee-return`,
        body
      );

      // Success message
      toast.success(
        response.data.message || "Employee returns created successfully."
      );

      // Reset state after submission
      setSelectedEmployees([]);
      setSelectedReviewers([]);
      setSearchQuery("");
      setReviewerQuery("");
      setSelectedReturn({});
      setSearchData({
        initialsSearch: "",
        selectedInitials: [],
        entitySearch: "",
        selectedEntities: [],
        returnName: "",
        reportCodeSearch: "",
        selectedReportCodes: [],
      });
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
        "An error occurred while creating employee returns."
      );
    } finally {
      setLoader(false);
    }
  };


  return (
    <div>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="space-y-6 p-6">
          {/* Heading Section */}
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              Select Initiator to Assign Return
            </h1>
          </div>

          {/* Search Section */}
          <div ref={employeeSearchRef} className="space-y-2">
            <div className="relative">
              <div className="min-h-[42px] w-[50%] px-3 py-2 border border-gray-300 rounded-lg focus-within:ring-1 focus-within:ring-blue-500 focus-within:border-blue-500 bg-white">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setShowSuggestions(true);
                  }}
                  onFocus={() => setShowSuggestions(true)}
                  className="outline-none w-full text-sm disabled:bg-gray-50 disabled:text-gray-500"
                  placeholder="Search by Name or Employee ID..."
                />
              </div>
              {showSuggestions && searchQuery.length > 0 && (
                <div className="absolute z-10 w-[50%] top-full mt-1 bg-white border rounded-lg shadow-lg max-h-60 overflow-auto">
                  {employees.length > 0 ? (
                    employees.map((employee) => (
                      <label
                        key={employee._id}
                        className="flex flex-col px-4 py-2.5 hover:bg-gray-50 cursor-pointer"
                      >
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            checked={selectedEmployees.some(
                              (e) => e._id === employee._id
                            )}
                            onChange={() => handleEmployeeSelect(employee)}
                            className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                          />

                          <span className="ml-2 text-sm">
                            {employee?.firstName} {employee?.lastName} (
                            {employee.employeeId})
                          </span>
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {employee.branchId?.ifscCode && (
                            <span>
                              Branch IFSC: {employee.branchId.ifscCode}
                            </span>
                          )}
                          {employee.departmentId?.departmentCode && (
                            <span>
                              {" "}
                              Dept Code: {employee.departmentId.departmentCode}
                            </span>
                          )}
                        </div>
                      </label>
                    ))
                  ) : (
                    <div className="px-4 py-2 text-gray-500 text-sm">
                      No results found.
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      {/* Selected Employees Table */}
      <div className="overflow-hidden bg-white rounded-xl shadow-lg border border-gray-100 mt-4">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-[#1e284e]">
              <tr className="text-center">
                {[
                  "Name",
                  "Employee ID",
                  "Email",
                  "Contact Number",
                  "Designation",
                  "IFSC Code",
                  "Dept Code",
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
              {selectedEmployees.length > 0 ? (
                selectedEmployees.map((employee) => (
                  <tr
                    key={employee._id}
                    className="hover:bg-blue-50 transition-colors duration-200 text-center"
                  >
                    <td className="px-6 py-5 text-sm text-gray-700">
                      {employee.firstName} {employee.lastName}
                    </td>
                    <td className="px-6 py-5 text-sm text-gray-700">
                      {employee.employeeId}
                    </td>
                    <td className="px-6 py-5 text-sm text-gray-700">
                      {employee.email}
                    </td>
                    <td className="px-6 py-5 text-sm text-gray-700">
                      {employee.contactNumber}
                    </td>
                    <td className="px-6 py-5 text-sm text-gray-700">
                      {employee.designation || "N/A"}
                    </td>
                    <td className="px-6 py-5 text-sm text-gray-700">
                      {employee.branchId?.ifscCode || "N/A"}
                    </td>
                    <td className="px-6 py-5 text-sm text-gray-700">
                      {employee.departmentId?.departmentCode || "N/A"}
                    </td>
                    <td className="px-6 py-5 text-sm text-gray-700">
                      <button
                        onClick={() => handleEmployeeRemove(employee._id)}
                        className="text-red-600 hover:text-red-800"
                        title="Remove Employee"
                      >
                        <FaTrashAlt fontSize={20} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={8}
                    className="px-6 py-5 text-sm text-gray-500 text-center"
                  >
                    No employees selected
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Reviewers Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mt-8 ">
        <div className="space-y-6 p-6">
          <h1 className="text-2xl font-bold text-gray-800">
            Select Reviewer to Review Return
          </h1>
          <div ref={reviewerSearchRef} className="relative">
            <input
              type="text"
              value={reviewerQuery}
              onChange={(e) => {
                setReviewerQuery(e.target.value);
                setReviewerSuggestions(true);
              }}
              onFocus={() => setReviewerSuggestions(true)}
              className="w-[50%] px-3 py-2 border rounded-lg"
              placeholder="Search Reviewer by Name or ID..."
            />
            {reviewerSuggestions && reviewerQuery.length > 0 && (
              <div className="absolute z-10 w-[50%] mt-1 bg-white border rounded-lg shadow-lg max-h-60 overflow-auto">
                {reviewers.length > 0 ? (
                  reviewers.map((reviewer) => (
                    <label
                      key={reviewer._id}
                      className="flex flex-col px-4 py-2.5 hover:bg-gray-50 cursor-pointer"
                    >
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={selectedReviewers.some(
                            (r) => r._id === reviewer._id
                          )}
                          onChange={() => handleReviewerSelect(reviewer)}
                          className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm">
                          {reviewer.firstName} {reviewer.lastName} (
                          {reviewer.employeeId || "N/A"})
                        </span>
                      </div>
                    </label>
                  ))
                ) : (
                  <div className="px-4 py-2 text-gray-500">No results</div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      {/* Selected Reviewers Table */}
      <div className="overflow-x-auto mt-4 rounded-xl shadow-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-[#1e284e]">
            <tr className="text-center">
              {[
                "Name",
                "Employee ID",
                "Email",
                "Contact Number",
                "Designation",
                "IFSC Code",
                "Dept Code",
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
            {selectedReviewers.length > 0 ? (
              selectedReviewers.map((reviewer) => (
                <tr
                  key={reviewer._id}
                  className="hover:bg-blue-50 transition-colors duration-200 text-center"
                >
                  <td className="px-6 py-5 text-sm text-gray-700">
                    {reviewer.firstName} {reviewer.lastName}
                  </td>
                  <td className="px-6 py-5 text-sm text-gray-700">
                    {reviewer.employeeId || "N/A"}
                  </td>
                  <td className="px-6 py-5 text-sm text-gray-700">
                    {reviewer.email}
                  </td>
                  <td className="px-6 py-5 text-sm text-gray-700">
                    {reviewer.contactNumber || "N/A"}
                  </td>
                  <td className="px-6 py-5 text-sm text-gray-700">
                    {reviewer.designation || "N/A"}
                  </td>
                  <td className="px-6 py-5 text-sm text-gray-700">
                    {reviewer.branchId?.ifscCode || "N/A"}
                  </td>
                  <td className="px-6 py-5 text-sm text-gray-700">
                    {reviewer.departmentId?.departmentCode || "N/A"}
                  </td>
                  <td className="px-6 py-5 text-sm text-gray-700">
                    <button
                      onClick={() => handleReviewerRemove(reviewer._id)}
                      className="text-red-600 hover:text-red-800"
                      title="Remove Reviewer"
                    >
                      <FaTrashAlt fontSize={20} />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={8}
                  className="px-6 py-5 text-sm text-gray-500 text-center"
                >
                  No reviewers selected
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Assign Return Button */}
      <div className="flex justify-end mt-4">
        <button
          onClick={handleAssignReturn}
          className="px-6 py-3 min-w-20 flex justify-center items-center bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition"
        >
          {loader ? <Loader /> : "Assign Return"}
        </button>
      </div>
    </div>
  );
};

export default SubmissionStatusEmployeeSearch;
