import { useEffect, useRef, useState } from "react";
import { FaTrashAlt } from "react-icons/fa";
import { toast } from "react-toastify";
import { baseurl, initURL } from "@/config/config";
import CustomAxios from "@/config/CustomAxios";
import Loader from "@/components/ui/Loader";
import sendNotification from "@/utils/Notifications/Notification";
import Cookies from "js-cookie";

const AssignEmployeeSearch = ({
  setAssignDate,
  setEndDate,
  assignDate,
  endDate,
  selectedLocation,
  setAddedLocations,
  setLocations,
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
  const [assigners, setAssigners] = useState([]);
  const [assignerQuery, setAssignerQuery] = useState("");
  const [selectedAssigners, setSelectedAssigners] = useState([]);
  const [assignerSuggestions, setAssignerSuggestions] = useState(false);
  const assignerSearchRef = useRef(null);
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const raw = Cookies.get("user_data");
    if (raw) {
      try {
        setUserData(JSON.parse(raw));
      } catch {
        console.warn("could not parse user_data cookie");
      }
    }
  }, []);
  const fetchDeptBankEmployee = async (query) => {
    try {
      const response = await CustomAxios.get(
        `${baseurl}/${initURL}/framework-control-employee/employee/Employee`
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
        `${baseurl}/${initURL}/framework-control-employee/employee/Reviewer`
      );
      setReviewers(response?.data || []);
    } catch (error) {
      toast.error(error.response?.data?.message || "An error occurred.");
    }
  };
  const fetchAssigners = async (query) => {
    try {
      const response = await CustomAxios.get(
        `${baseurl}/${initURL}/framework-control-employee/employee/Assigner`
      );
      setAssigners(response?.data || []);
    } catch (error) {
      toast.error(error.response?.data?.message || "An error occurred.");
    }
  };

  useEffect(() => {
    fetchDeptBankEmployee();
    fetchReviewers();
    fetchAssigners();
  }, []);

  const handleEmployeeSelect = (employee) => {
    setSelectedEmployees((prev) => {
      if (prev.some((e) => e._id === employee._id)) {
        // If already selected, remove it
        return prev.filter((e) => e._id !== employee._id);
      } else {
        // Otherwise, add to the selection
        return [...prev, employee];
      }
    });
  };

  const handleEmployeeRemove = (employeeId) => {
    setSelectedEmployees((prev) => prev.filter((e) => e._id !== employeeId));
  };

  const handleReviewerSelect = (reviewer) => {
    setSelectedReviewers((prev) => {
      if (prev.some((r) => r._id === reviewer._id)) {
        // If already selected, remove it
        return prev.filter((r) => r._id !== reviewer._id);
      } else {
        // Otherwise, add to the selection
        return [...prev, reviewer];
      }
    });

    // Close dropdown after a short delay
    setTimeout(() => setReviewerSuggestions(false), 200);
  };

  const handleReviewerRemove = (reviewerId) => {
    setSelectedReviewers((prev) => prev.filter((r) => r._id !== reviewerId));
  };

  const handleAssignerSelect = (reviewer) => {
    if (selectedAssigners.some((r) => r._id === reviewer._id)) {
      setSelectedAssigners((prev) =>
        prev.filter((r) => r._id !== reviewer._id)
      );
    } else {
      setSelectedAssigners((prev) => [reviewer]);
    }
  };

  const handleAssignerRemove = (reviewerId) => {
    setSelectedAssigners((prev) => prev.filter((r) => r._id !== reviewerId));
  };
  const handleAssignReturn = async () => {
    if (selectedEmployees.length === 0) {
      toast.error("No employees selected for task.");
      return;
    }
    if (selectedReviewers.length === 0) {
      toast.error("No reviewers selected for task.");
      return;
    }
    if (selectedAssigners.length === 0) {
      toast.error("No assigner selected for task.");
      return;
    }
    if (!assignDate || !endDate) {
      toast.error("Please select valid assign and end dates.");
      return;
    }
    // Validate date format
    const parsedAssignDate = new Date(assignDate);
    const parsedEndDate = new Date(endDate);

    if (isNaN(parsedAssignDate.getTime()) || isNaN(parsedEndDate.getTime())) {
      toast.error("Invalid date format. Please select a valid date.");
      return;
    }

    const payload = {
      assignerId: selectedAssigners[0]._id,
      assignDate: new Date(assignDate).toISOString(),
      deadline: new Date(endDate).toISOString(),
      locationId: selectedLocation?._id || "",
      empID: selectedEmployees.map((e) => e._id),
      reviewerID: selectedReviewers.map((r) => r._id),
    };
    console.log(payload);
    try {
      setLoader(true);
      const response = await CustomAxios.post(
        `${baseurl}/${initURL}/tisax-team-assignment`,
        payload
      );

      const people = [
        ...selectedEmployees,
        ...selectedReviewers,
        ...selectedAssigners,
      ];

      // 3️⃣ Extract parallel arrays of emails & names
      const recipientEmail = people.map((u) => u.email);
      const name = people.map((u) => `${u.first_name} ${u.last_name}`);

      // 4️⃣ Blast one notification to all:
      // after you collect people[], recipientEmail[], name[], etc…
      await sendNotification({
        actionType: "custom", // anything that isn’t “assign” falls to default
        payload: {
          recipientEmail, // array of emails
          name, // parallel array of names
          // your custom subject:
          subject:
            "You have been selected as a team member for this TISAX location",
          description:
            `Location: ${selectedLocation.location_id}\n` +
            `Address: ${selectedLocation.company_address}\n` +
            `Assigned On: ${assignDate}\n` +
            `Deadline: ${endDate}\n` +
            `Assigned By: ${userData.user_name}`,
          // you can still pass other fields if you like:
          // location: selectedLocation.location_id,
          // address: selectedLocation.company_address,
          // assignDate, // etc…
          // endDate,
          assignedBy: userData.user_name,
        },
      });

      toast.success("Task assigned and everyone has been notified!");

      setSelectedEmployees([]);
      setSelectedReviewers([]);
      setSelectedAssigners([]);
      setAddedLocations([]);
      setLocations([]);
      setSearchQuery("");
      setReviewerQuery("");
      setAssignerQuery("");
      setAssignDate("");
      setEndDate("");
      setLocations([]);
    } catch (error) {
      console.log(error, "error");
      toast.error(error.response?.data?.message || "Failed to assign task.");
    } finally {
      setLoader(false);
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
  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        assignerSearchRef.current &&
        !assignerSearchRef.current.contains(event.target)
      ) {
        setAssignerSuggestions(false);
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
        .includes(searchQuery.toLowerCase())
    );
    return data;
  };

  const filteredReviewers = () => {
    let data = reviewers.filter((reviewer) =>
      `${reviewer.first_name} ${reviewer.last_name} ${reviewer.employeeId}`
        .toLowerCase()
        .includes(reviewerQuery.toLowerCase())
    );

    return data;
  };
  const filteredAssigners = () => {
    let data = assigners.filter((assigner) =>
      `${assigner.first_name} ${assigner.last_name} ${assigner.employeeId}`
        .toLowerCase()
        .includes(assignerQuery.toLowerCase())
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
              Select Employee to Assign Controls
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
                  {getFilteredEmployees().map((employee) => (
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
              {selectedEmployees.length > 0 ? (
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
                setReviewerQuery(e.target.value);
                setReviewerSuggestions(true);
              }}
              onFocus={() => setReviewerSuggestions(true)}
              className="w-[50%] px-3 py-2 border rounded-lg"
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
                          (r) => r._id === reviewer._id
                        )}
                        onChange={() => handleReviewerSelect(reviewer)}
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
                )
              )}
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

      {/* assigner */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mt-8">
        <div className="space-y-6 p-6">
          <h1 className="text-2xl font-bold text-gray-800">Select Assigner</h1>
          <div ref={assignerSearchRef} className="relative">
            <input
              type="text"
              value={assignerQuery}
              onChange={(e) => {
                setAssignerQuery(e.target.value);
                setAssignerSuggestions(true);
              }}
              onFocus={() => setAssignerSuggestions(true)}
              className="w-[50%] px-3 py-2 border rounded-lg"
              placeholder="Search Assigner by Name or ID..."
            />
            {assignerSuggestions && assignerQuery.length > 0 && (
              <div className="absolute z-10 w-[50%] mt-1 bg-white border rounded-lg shadow-lg max-h-60 overflow-auto">
                {filteredAssigners().map((assigner) => (
                  <label
                    key={assigner._id}
                    className="flex flex-col px-4 py-2.5 hover:bg-gray-50 cursor-pointer"
                  >
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={selectedAssigners.some(
                          (r) => r._id === assigner._id
                        )}
                        onChange={() => handleAssignerSelect(assigner)}
                        className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm">
                        {assigner.first_name} {assigner.last_name} (
                        {assigner.employeeId || "N/A"})
                      </span>
                    </div>
                  </label>
                ))}
                {filteredAssigners().length === 0 && (
                  <div className="px-4 py-2 text-gray-500">No results</div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Selected Assigners Table */}
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
                )
              )}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {selectedAssigners.length > 0 ? (
              selectedAssigners.map((assigner) => (
                <tr
                  key={assigner._id}
                  className="hover:bg-blue-50 transition-colors duration-200 text-center"
                >
                  <td className="px-6 py-5 text-sm text-gray-700">
                    {assigner.first_name} {assigner.last_name}
                  </td>
                  <td className="px-6 py-5 text-sm text-gray-700">
                    {assigner.employeeId || "N/A"}
                  </td>
                  <td className="px-6 py-5 text-sm text-gray-700">
                    {assigner.email}
                  </td>
                  <td className="px-6 py-5 text-sm text-gray-700">
                    {assigner.contact_number || "N/A"}
                  </td>
                  <td className="px-6 py-5 text-sm text-gray-700">
                    <button
                      onClick={() => handleAssignerRemove(assigner._id)}
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
                  No Assigner selected
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
          className="px-6 py-3 min-w-20 flex justify-center items-center bg-[#2B245C] text-white text-sm font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition"
        >
          {loader ? <Loader /> : "Assign Team"}
        </button>
      </div>
    </div>
  );
};

export default AssignEmployeeSearch;
