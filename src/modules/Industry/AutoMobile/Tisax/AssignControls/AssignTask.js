import CustomAxios from "@/config/CustomAxios";
import { format } from "date-fns";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { baseurl, initURL } from "@/config/config";
import Loader from "@/components/ui/Loader";
import sendNotification from "@/utils/Notifications/Notification";
import Cookies from "js-cookie";
const AssignTask = () => {
  const [categories, setCategories] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [reviewers, setReviewers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({});
  const [categoryData, setCategoryData] = useState([]);

  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedSubcategories, setSelectedSubcategories] = useState([]);
  const [selectedControls, setSelectedControls] = useState([]);

  const [assignDate, setAssignDate] = useState(
    format(new Date(), "yyyy-MM-dd")
  );
  const [endDate, setEndDate] = useState("");
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [selectedReviewer, setSelectedReviewer] = useState("");
  const [employeeSearch, setEmployeeSearch] = useState(""); // Fix for employee search
  const [reviewerSearch, setReviewerSearch] = useState(""); // Fix for reviewer search

  const [showEmployeeDropdown, setShowEmployeeDropdown] = useState(false);
  const [showReviewerDropdown, setShowReviewerDropdown] = useState(false);
  const [assignTaskLoading, setassignTaskLoading] = useState(false);
  const [allreadyAssignedControlesIds, setallreadyAssignedControlesIds] =
    useState([]);

  const [subcategoryLoading, setSubcategoryLoading] = useState(false);

  const today = format(new Date(), "yyyy-MM-dd");

  const categoryApiMapping = {
    "Information Security PL very high": `${baseurl}/${initURL}/tisax/employee/informationSecurity`,
    "Prototype Protection PL high": `${baseurl}/${initURL}/tisax/employee/prototypeProtection`,
    "Data Protection": `${baseurl}/${initURL}/tisax/employee/dataProtection`,
  };

  const normalizeCategory = (category) =>
    category.replace(/\(AL\d\)/g, "").trim();

  const fetchAssignments = async () => {
    try {
      const response = await CustomAxios.get(
        `${baseurl}/${initURL}/assign-tisax-task/assigned-tasks`
      );
      if (response.data && Array.isArray(response.data)) {
        // Extract control IDs from all categories
        const assignedControlIds = response.data.flatMap((task) => [
          ...(task.informationSecurityControls?.map((ctrl) => ctrl._id) || []),
          ...(task.dataProtectionControls?.map((ctrl) => ctrl._id) || []),
          ...(task.prototypeProtectionControls?.map((ctrl) => ctrl._id) || []),
        ]);

        // Set state with extracted IDs
        setallreadyAssignedControlesIds(assignedControlIds);
      }
    } catch (error) {
      console.error("Error fetching assignments:", error);
    } finally {
    }
  };

  const fetchAssignmentData = async () => {
    try {
      const response = await CustomAxios.get(
        `${baseurl}/${initURL}/tisax-team-assignment/assigned-location`
      );
      const data = response?.data?.data || [];

      if (data.length > 0) {
        const firstItem = data[0];
        setData(firstItem);
        setCategories(
          firstItem.locationId.category.map(normalizeCategory) || []
        );
        setEmployees(firstItem.empID || []);
        setReviewers(firstItem.reviewerID || []);
      }
    } catch (error) {
      console.log("🚀 ~ fetchAssignmentData ~ error:", error);
      toast.error("Failed to fetch assignment data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignmentData();
    fetchAssignments();
  }, []);

  useEffect(() => {
    if (selectedCategory && data?.locationId?._id) {
      fetchCategoryData(selectedCategory, data?.locationId?._id);
    }
  }, [selectedCategory, data]);

  const fetchCategoryData = async (category, id) => {
    setSubcategoryLoading(true);
    setCategoryData([]);
    try {
      const normalizedCategory = normalizeCategory(category);
      const apiUrl = categoryApiMapping[normalizeCategory(category)];

      if (!apiUrl) {
        console.error("Invalid category selected:", category);
        return;
      }

      let response = await CustomAxios.get(`${apiUrl}/${id}`);
      const groupedData = {};
      response?.data?.sort((a, b) => {
        const parentA = a["Parent ISA New"] || "";
        const parentB = b["Parent ISA New"] || "";
        const isaA = a["ISA New"] || "";
        const isaB = b["ISA New"] || "";

        if (parentA !== parentB) {
          return parentA.localeCompare(parentB);
        }
        return isaA.localeCompare(isaB);
      });

      response?.data?.forEach((item) => {
        if (category == "Information Security PL very high") {
          const groupKey = `${item["Root ISA New"]}_${item["Root Control question"]}`;
          if (!groupedData[groupKey]) {
            groupedData[groupKey] = {
              parentISA: item["Root ISA New"],
              parentControlQuestion: item["Root Control question"],
              Items: [],
            };
          }
          groupedData[groupKey].Items.push({
            ...item,
            readyState: item.isReady || false,
          });
        } else {
          const groupKey = `${item["Parent ISA New"]}_${item["Parent Control question"]}`;
          if (!groupedData[groupKey]) {
            groupedData[groupKey] = {
              parentISA: item["Parent ISA New"],
              parentControlQuestion: item["Parent Control question"],
              Items: [],
            };
          }
          groupedData[groupKey].Items.push({
            ...item,
            readyState: item.isReady || false,
          });
        }
      });

      const finalResult = Object.values(groupedData);
      setCategoryData(finalResult || []);
    } catch (error) {
      toast.error(`Error fetching category data for ${category}`);
    } finally {
      setSubcategoryLoading(false);
    }
  };

  const validateForm = () => {
    if (!selectedCategory) {
      toast.error("Please select a category.");
      return false;
    }

    if (!selectedEmployee) {
      toast.error("Please select an employee.");
      return false;
    }

    if (!selectedReviewer) {
      toast.error("Please select a reviewer.");
      return false;
    }

    if (!assignDate) {
      toast.error("Please select an assign date.");
      return false;
    }

    if (!endDate) {
      toast.error("Please select a deadline.");
      return false;
    }

    if (new Date(endDate) <= new Date(assignDate)) {
      toast.error("Deadline must be greater than the assign date.");
      return false;
    }

    if (
      (selectedCategory.includes("Information Security PL") ||
        selectedCategory.includes("Prototype Protection") ||
        selectedCategory.includes("Data Protection")) &&
      selectedControls.length === 0
    ) {
      toast.error("Please select at least one control.");
      return false;
    }

    return true;
  };

  const handleAssignTask = async () => {
    try {
      if (!validateForm()) return;

      // Initialize control arrays as empty
      let informationSecurityControls = [];
      let prototypeProtectionControls = [];
      let dataProtectionControls = [];

      // Assign selected controls to the correct category
      if (
        selectedCategory.includes("Information Security PL") // Handles both "very high" & "high"
      ) {
        informationSecurityControls = selectedControls.length
          ? selectedControls
          : [];
      } else if (selectedCategory.includes("Prototype Protection")) {
        prototypeProtectionControls = selectedControls.length
          ? selectedControls
          : [];
      } else if (selectedCategory.includes("Data Protection")) {
        dataProtectionControls = selectedControls.length
          ? selectedControls
          : [];
      }

      const payload = {
        locationId: data?.locationId?._id || "",
        category: selectedCategory || "",
        informationSecurityControls,
        prototypeProtectionControls,
        dataProtectionControls,
        assignDate: assignDate || "",
        deadline: endDate || "",
        employeeId: selectedEmployee?._id || "",
        reviewerId: selectedReviewer?._id || "",
      };
      setassignTaskLoading(true);
      const response = await CustomAxios.post(
        `${baseurl}/${initURL}/assign-tisax-task`,
        payload
      );

      if (response.status === 200 || response.status === 201) {
        toast.success("Task assigned successfully!");

        // ─────────────────────────────────────────────────────────
        // Notify employee and reviewer by email what they’ve been assigned
        const recipients = [selectedEmployee.email, selectedReviewer.email];
        const names = [
          `${selectedEmployee.first_name} ${selectedEmployee.last_name}`,
          `${selectedReviewer.first_name} ${selectedReviewer.last_name}`,
        ];
        await sendNotification({
          actionType: "custom",
          payload: {
            recipientEmail: recipients,
            name: names,
            subject: `New TISAX Controls Assigned – ${selectedCategory}`,
            description:
              `You’ve been assigned the following ${selectedCategory} controls:\n\n` +
              selectedControls
                .map((ctrlId) => {
                  const ctrl = categoryData
                    .flatMap((group) => group.Items)
                    .find((c) => c._id === ctrlId);
                  return `• ${ctrl?.["ISA New"] || ctrlId}`;
                })
                .join("\n") +
              `\n\nAssign Date: ${assignDate}` +
              `\nDeadline:   ${endDate}` +
              `\n\nLocation:  ${data.locationId.location_id}` +
              `\nAssigned by: ${
                Cookies.get("user_data") &&
                JSON.parse(Cookies.get("user_data")).user_name
              }`,
          },
        });
        // ─────────────────────────────────────────────────────────

        setSelectedEmployee([]);
        setSelectedReviewer([]);
        setAssignDate("");
        setEndDate("");
        setSelectedCategory("");
        setSelectedSubcategories([]);
        setCategoryData([]);
      }
    } catch (error) {
      console.error("Error in handleAssignTask:", error);
      toast.error(
        error.response?.data?.message ||
          "Something went wrong. Please try again."
      );
    } finally {
      setassignTaskLoading(false);
    }
  };

  const handleSubcategorySelection = (subcategory) => {
    setSelectedSubcategories((prev) =>
      prev.includes(subcategory)
        ? prev.filter((sub) => sub !== subcategory)
        : [...prev, subcategory]
    );
  };

  const handleControlSelection = (controlId) => {
    setSelectedControls((prev) =>
      prev.includes(controlId)
        ? prev.filter((id) => id !== controlId)
        : [...prev, controlId]
    );
  };
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader />
      </div>
    );
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-[#2B245C]">Assign Task</h2>
      <div className="space-y-4 mt-4">
        <div className="grid grid-cols-2 gap-4">
          {/* Category Selection */}
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700">
              Select Category
            </label>
            {categories.length > 0 ? (
              <select
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value);
                  setSelectedSubcategories([]);
                  setSelectedControls([]);
                }}
                className="w-full p-2 border rounded-md"
              >
                <option value="">Select a category</option>
                {categories.map((category) => (
                  <option key={category} value={normalizeCategory(category)}>
                    {category}
                  </option>
                ))}
              </select>
            ) : (
              <p className="text-gray-500 text-sm py-2">No categories found.</p>
            )}
          </div>
          {/* Subcategory Selection */}
          <div className="p-0">
            <label className="block text-sm font-medium text-gray-700">
              Select Subcategories
            </label>
            {subcategoryLoading ? (
              <div className="flex justify-center items-center py-4">
                <Loader />
              </div>
            ) : categoryData.length > 0 ? (
              <div className="grid grid-cols-2 gap-2 border rounded-lg p-2 max-h-60 overflow-auto">
                {categoryData.map((sub) => (
                  <div
                    key={sub.parentControlQuestion}
                    className="flex items-center justify-between w-full bg-white p-3 rounded-lg shadow-md"
                  >
                    <label className="flex items-center text-sm font-medium text-gray-700 w-full cursor-pointer">
                      <input
                        type="checkbox"
                        value={sub.parentControlQuestion}
                        checked={selectedSubcategories.includes(
                          sub.parentControlQuestion
                        )}
                        onChange={() =>
                          handleSubcategorySelection(sub.parentControlQuestion)
                        }
                        className="mr-2 rounded"
                      />
                      {sub.parentControlQuestion}
                    </label>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm py-2">
                No subcategories found.
              </p>
            )}
          </div>
        </div>

        {selectedSubcategories.length > 0 ? (
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700">
              Select Controls
            </label>
            <div className="border p-4 rounded-lg bg-gray-50 max-h-60 overflow-y-auto grid grid-cols-3 gap-4">
              {categoryData
                .filter((item) =>
                  selectedSubcategories.includes(item.parentControlQuestion)
                )
                .flatMap((item) => item.Items)
                .filter(
                  (control) =>
                    !allreadyAssignedControlesIds.includes(control._id)
                )
                .map((control) => (
                  <div
                    key={control._id}
                    className="flex items-center bg-white p-3 rounded-lg shadow-md hover:bg-gray-100 transition-all"
                  >
                    <input
                      type="checkbox"
                      value={control._id}
                      checked={selectedControls.includes(control._id)}
                      onChange={() => handleControlSelection(control._id)}
                      className="mr-2 rounded"
                    />
                    <label className="text-sm font-medium text-gray-700">
                      {control["ISA New"]}{" "}
                      <span className="text-xs text-gray-500">
                        ({control["Root Control question"]})
                      </span>
                    </label>
                  </div>
                ))}
            </div>
          </div>
        ) : (
          <p className="text-gray-500 text-sm py-2">No controls found.</p>
        )}
        {/* Employee Selection */}
        <div className="flex space-x-4">
          <div className="flex-1 relative">
            <label className="block text-sm font-medium text-gray-700">
              Select Employee
            </label>
            <input
              type="text"
              placeholder="Search employee..."
              value={
                selectedEmployee?._id
                  ? `${selectedEmployee.first_name} ${selectedEmployee.last_name}`
                  : employeeSearch
              }
              onChange={(e) => setEmployeeSearch(e.target.value)}
              className="w-full p-2 border rounded-md mb-2"
              onFocus={() => setShowEmployeeDropdown(true)}
            />
            {showEmployeeDropdown && (
              <div className="absolute w-full bg-white border rounded-md shadow-lg max-h-48 overflow-auto z-50">
                {employees
                  .filter((emp) =>
                    `${emp.first_name} ${emp.last_name}`
                      .toLowerCase()
                      .includes(employeeSearch.toLowerCase())
                  )
                  .map((emp) => (
                    <div
                      key={emp._id}
                      className="flex items-center p-2 hover:bg-gray-100 cursor-pointer"
                      onClick={() => {
                        setSelectedEmployee(emp); // Select only one employee
                        setShowEmployeeDropdown(false); // Close dropdown
                        setEmployeeSearch(""); // Clear search field
                      }}
                    >
                      <input
                        type="checkbox"
                        className="mr-2"
                        checked={selectedEmployee?._id === emp._id}
                        onChange={() => {
                          setSelectedEmployee(emp); // Select only one employee
                          setShowEmployeeDropdown(false); // Close dropdown
                          setEmployeeSearch(""); // Clear search field
                        }}
                      />
                      <label>
                        {emp.first_name} {emp.last_name}
                      </label>
                    </div>
                  ))}
              </div>
            )}
          </div>

          {/* Reviewer Selection */}
          <div className="flex-1 relative">
            <label className="block text-sm font-medium text-gray-700">
              Select Reviewer
            </label>
            <input
              type="text"
              placeholder="Search reviewer..."
              value={
                selectedReviewer?._id
                  ? `${selectedReviewer.first_name} ${selectedReviewer.last_name}`
                  : reviewerSearch
              }
              onChange={(e) => setReviewerSearch(e.target.value)}
              className="w-full p-2 border rounded-md mb-2"
              onFocus={() => setShowReviewerDropdown(true)}
            />
            {showReviewerDropdown && (
              <div className="absolute w-full bg-white border rounded-md shadow-lg max-h-48 overflow-auto z-50">
                {reviewers
                  .filter((rev) =>
                    `${rev.first_name} ${rev.last_name}`
                      .toLowerCase()
                      .includes(reviewerSearch.toLowerCase())
                  )
                  .map((rev) => (
                    <div
                      key={rev._id}
                      className="flex items-center p-2 hover:bg-gray-100 cursor-pointer"
                      onClick={() => {
                        setSelectedReviewer(rev); // Select only one reviewer
                        setShowReviewerDropdown(false); // Close dropdown
                        setReviewerSearch(""); // Clear search field
                      }}
                    >
                      <input
                        type="checkbox"
                        className="mr-2"
                        checked={selectedReviewer?._id === rev._id}
                        onChange={() => {
                          setSelectedReviewer(rev); // Select only one reviewer
                          setShowReviewerDropdown(false); // Close dropdown
                          setReviewerSearch(""); // Clear search field
                        }}
                      />
                      <label>
                        {rev.first_name} {rev.last_name}
                      </label>
                    </div>
                  ))}
              </div>
            )}
          </div>

          {/* Assign Date */}
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700">
              Assign Date
            </label>
            <input
              type="date"
              value={assignDate}
              min={today}
              onChange={(e) => setAssignDate(e.target.value)}
              className="w-full p-2 border rounded-md"
            />
          </div>

          {/* Deadline */}
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700">
              Deadline
            </label>
            <input
              type="date"
              min={today}
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full p-2 border rounded-md"
            />
          </div>
        </div>

        <div className="flex justify-center items-center h-full mt-6">
          <button
            onClick={handleAssignTask}
            className="bg-[#2B245C] text-white px-6 py-3 rounded-lg font-semibold shadow-md transition-all duration-300 ease-in-out hover:bg-[#2a1250] hover:shadow-lg active:scale-95"
          >
            {assignTaskLoading ? <Loader /> : "Assign Task"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AssignTask;
