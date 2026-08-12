import { useEffect, useRef, useState } from "react";
import { FaTrashAlt } from "react-icons/fa";
import { toast } from "react-toastify";
import { baseurl, initURL } from "../../../BaseUrl";
import CustomAxios from "../CustomAxios";
import { can, guard } from "@/auth/auth-permissions";
import useDebounce from "../hooks/useDebounce";
import Loader from "../loader/Loader";

const ComplianceAssignmentSubmissionStatusEmployeeSearch = ({
  router,
  setSelectedReturn,
  setSearchData,
  setAssignDate,
  setEndDate,
  setSelectedData,
  searchData,
  assignDate,
  endDate,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const employeeSearchRef = useRef(null);
  const [employees, setEmployees] = useState([]);
  const [loader, setLoader] = useState(false);

  // reviewer state
  const [reviewerQuery, setReviewerQuery] = useState("");
  const [reviewerSuggestions, setReviewerSuggestions] = useState(false);
  const [reviewers, setReviewers] = useState([]);
  const [selectedReviewers, setSelectedReviewers] = useState([]);
  const reviewerSearchRef = useRef(null);

  const canView = can(["security.read", "security.manage", "security.delete"], {
    mode: "all",
  });
  const canAssign = can(["security.assign", "security.manage"]);

  const fetchDeptBankEmployee = async (query) => {
    try {
      const response = await CustomAxios.get(
        `${baseurl}/${initURL}/framework-control-employee/employee/Employee`,
      );
      setEmployees(response?.data || []);
    } catch (error) {
      toast.error(error.response?.data?.message || "An error occurred.");
    }
  };

  // Fetch reviewers based on query
  const fetchReviewers = async (query) => {
    try {
      const response = await CustomAxios.get(
        `${baseurl}/${initURL}/framework-control-employee/employee/Reviewer`,
      );
      setReviewers(response?.data || []);
    } catch (error) {
      toast.error(error.response?.data?.message || "An error occurred.");
    }
  };

  useEffect(() => {
    fetchDeptBankEmployee();
    fetchReviewers();
  }, []);

  const handleEmployeeSelect = (employee) => {
    if (
      selectedEmployees.length === 1 &&
      selectedEmployees[0]._id === employee._id
    ) {
      // If the user clicks the already selected employee, deselect it
      setSelectedEmployees([]);
    } else {
      // Replace with the new selected employee
      setSelectedEmployees([employee]);
    }
  };

  const handleEmployeeRemove = (employeeId) => {
    setSelectedEmployees((prev) => prev.filter((e) => e._id !== employeeId));
  };

  const handleReviewerSelect = (reviewer) => {
    if (selectedReviewers.some((r) => r._id === reviewer._id)) {
      setSelectedReviewers((prev) =>
        prev.filter((r) => r._id !== reviewer._id),
      );
    } else {
      setSelectedReviewers((prev) => [reviewer]);
    }
  };

  const handleReviewerRemove = (reviewerId) => {
    setSelectedReviewers((prev) => prev.filter((r) => r._id !== reviewerId));
  };

  const handleAssignReturn = async () => {
    if (selectedEmployees.length === 0) {
      toast.error("No employees selected for assignment.");
      return;
    }
    if (selectedReviewers.length === 0) {
      toast.error("No Reviewers selected for assignment.");
      return;
    }
    try {
      // Extract required data from state
      let { selectedCategories, selectedControls, framework } = searchData;
      let assignDateFinal = assignDate;
      let deadlineFinal = endDate;
      selectedCategories = [
        ...new Set(
          selectedControls?.map((element) => {
            return element.controlcategory;
          }),
        ),
      ];

      let controlNames = selectedControls.map((c) => c.controlname);
      const payload1 = {
        framework: framework[0]?._id,
        categories: selectedCategories,
        controls: selectedControls.map((con) => con._id),
        assignDate: assignDateFinal,
        deadline: deadlineFinal,
        user_uuid: selectedEmployees[0]?._id, // First API uses user_uuid
        user_email: selectedEmployees[0]?.email, // First API uses user_email
        reviewer: selectedReviewers[0]?._id,
        controlNames: controlNames,
      };

      // Make both API calls at the same time
      const [response1] = await Promise.all([
        CustomAxios.post(
          `${baseurl}/${initURL}/framework-control-employee/assign-controls`,
          payload1,
        ),
      ]);

      if (response1.status === 200 || response1.status === 201) {
        toast.success("Framework assigned to selected employees successfully.");
        // Reset state after successful assignment
        setSelectedEmployees([]);
        setSelectedReviewers([]);
        setSearchQuery("");
        setReviewerQuery("");
        setAssignDate("");
        setEndDate("");
        setSelectedData("");
        setSearchData({
          initialsSearch: "",
          framework: [],
          entitySearch: "",
          selectedCategories: [],
          returnName: "",
          controlSearch: "",
          selectedControls: [],
        });
        setSelectedReturn(false);
      } else {
        toast.error(
          response1.data?.message ||
            response2.data?.message ||
            "Failed to assign framework.",
        );
      }
    } catch (error) {
      if (error.response?.status === 409) {
        toast.error(
          "Framework already assigned to this employee! You can add controls to this employee from the dashboard.",
        );
      } else {
        toast.error(
          error.response?.data?.message || "An error occurred while assigning.",
        );
      }
    }
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

  const getFilteredEmployees = () => {
    let data = employees.filter((employee) =>
      `${employee.first_name} ${employee.last_name} ${employee.employeeId}`
        .toLowerCase()
        .includes(searchQuery.toLowerCase()),
    );
    return data;
  };

  const filteredReviewers = () => {
    let data = reviewers.filter((reviewer) =>
      `${reviewer.first_name} ${reviewer.last_name} ${reviewer.employeeId}`
        .toLowerCase()
        .includes(reviewerQuery.toLowerCase()),
    );
    return data;
  };

  return (
    <div>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="space-y-6 p-6">
          {/* Heading Section */}
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              Select Employee to Assign Framework
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
                    // block typing if no permission, redirect
                    if (!canAssign) {
                      guard(false, router);
                      return;
                    }
                    setSearchQuery(e.target.value);
                    setShowSuggestions(true);
                  }}
                  onFocus={() => {
                    if (!canAssign) {
                      guard(false, router);
                      return;
                    }
                    setShowSuggestions(true);
                  }}
                  className="outline-none w-full text-sm"
                  placeholder="Search by Name or Employee ID..."
                />
              </div>
              {showSuggestions && searchQuery.length > 0 && (
                <div className="absolute z-10 w-[50%] top-full mt-1 bg-white border rounded-lg shadow-lg max-h-60 overflow-auto">
                  {getFilteredEmployees().map((employee) => (
                    <label
                      key={employee._id}
                      className="flex flex-col px-4 py-2.5 hover:bg-gray-50 cursor-pointer"
                    >
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={selectedEmployees.some(
                            (e) => e._id === employee._id,
                          )}
                          onChange={() =>
                            guard(canAssign, router, () =>
                              handleEmployeeSelect(employee),
                            )
                          }
                          className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm">
                          {employee?.first_name} {employee?.last_name} (
                          {employee.employeeId || "NA"})
                        </span>
                      </div>
                    </label>
                  ))}
                  {getFilteredEmployees().length === 0 && (
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
            <thead className="bg-[#2B245C]">
              <tr className="text-center">
                {[
                  "Name",
                  "Employee ID",
                  "Email",
                  "Contact Number",
                  "Action",
                ].map((header) => (
                  <th
                    key={header}
                    className="px-6 py-3 text-sm font-semibold text-white tracking-wider border-b border-blue-700"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {!canView ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-10 text-center text-red-600 font-medium"
                  >
                    You don’t have permission to view/manage employees.
                  </td>
                </tr>
              ) : selectedEmployees.length > 0 ? (
                selectedEmployees.map((employee) => (
                  <tr
                    key={employee._id}
                    className="hover:bg-blue-50 transition-colors duration-200 text-center"
                  >
                    <td className="px-6 py-5 text-sm text-gray-700">
                      {employee.first_name} {employee.last_name}
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

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mt-8">
        <div className="space-y-6 p-6">
          <h1 className="text-2xl font-bold text-gray-800">Select Reviewer</h1>
          <div ref={reviewerSearchRef} className="relative">
            <input
              type="text"
              value={reviewerQuery}
              onChange={(e) => {
                if (!canAssign) {
                  guard(false, router);
                  return;
                }
                setReviewerQuery(e.target.value);
                setReviewerSuggestions(true);
              }}
              onFocus={() => {
                if (!canAssign) {
                  guard(false, router);
                  return;
                }
                setReviewerSuggestions(true);
              }}
              className="w-[50%] px-3 py-2 border text-sm rounded-lg"
              placeholder="Search Reviewer by Name or ID..."
            />
            {reviewerSuggestions && reviewerQuery.length > 0 && (
              <div className="absolute z-10 w-[50%] mt-1 bg-white border rounded-lg shadow-lg max-h-60 overflow-auto">
                {filteredReviewers().map((reviewer) => (
                  <label
                    key={reviewer._id}
                    className="flex flex-col px-4 py-2.5 hover:bg-gray-50 cursor-pointer"
                  >
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={selectedReviewers.some(
                          (r) => r._id === reviewer._id,
                        )}
                        onChange={() =>
                          guard(canAssign, router, () =>
                            handleReviewerSelect(reviewer),
                          )
                        }
                        className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm">
                        {reviewer.first_name} {reviewer.last_name} (
                        {reviewer.employeeId || "N/A"})
                      </span>
                    </div>
                  </label>
                ))}
                {filteredReviewers().length === 0 && (
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
          <thead className="bg-[#2B245C]">
            <tr className="text-center">
              {["Name", "Employee ID", "Email", "Contact Number", "Action"].map(
                (header) => (
                  <th
                    key={header}
                    className="px-6 py-3 text-sm font-semibold text-white tracking-wider border-b border-blue-700"
                  >
                    {header}
                  </th>
                ),
              )}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {!canView ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-6 py-10 text-center text-red-600 font-medium"
                >
                  You don’t have permission to view/manage reviewers.
                </td>
              </tr>
            ) : selectedReviewers.length > 0 ? (
              selectedReviewers.map((reviewer) => (
                <tr
                  key={reviewer._id}
                  className="hover:bg-blue-50 transition-colors duration-200 text-center"
                >
                  <td className="px-6 py-5 text-sm text-gray-700">
                    {reviewer.first_name} {reviewer.last_name}
                  </td>
                  <td className="px-6 py-5 text-sm text-gray-700">
                    {reviewer.employeeId || "N/A"}
                  </td>
                  <td className="px-6 py-5 text-sm text-gray-700">
                    {reviewer.email}
                  </td>
                  <td className="px-6 py-5 text-sm text-gray-700">
                    {reviewer.contact_number || "N/A"}
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
          type="button"
          title="Assign Task"
          onClick={() => guard(canAssign, router, handleAssignReturn)}
          className="px-6 py-3 min-w-20 flex justify-center items-center text-sm font-medium rounded-lg transition bg-[#2B245C] text-white hover:bg-opacity-90"
        >
          {loader ? <Loader /> : "Assign Task"}
        </button>
      </div>
    </div>
  );
};

export default ComplianceAssignmentSubmissionStatusEmployeeSearch;
