import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/router";
import { toast } from "react-toastify";
import { baseurl, initURL } from "../../../BaseUrl";
import CustomAxios from "../CustomAxios";
import { can, guard } from "@/auth/auth-permissions";
import Loader from "../loader/Loader";
import { BiEdit } from "react-icons/bi";
import Dialog from "../Dialog";
import dayjs from "dayjs"; // Ensure dayjs is installed
import { X } from "lucide-react";

function DashboardTable() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [apiloading, setapiloading] = useState(false);
  const [selectReturnDialog, setSelectReturnDialog] = useState(false);
  const [frameworkData, setFramework] = useState([]);
  const [formErrors, setFormErrors] = useState({});
  const [selectedData, setselectedData] = useState();
  const searchRef = useRef(null);
  const entityRef = useRef(null);
  const controlRef = useRef(null);
  // ✅ Fixed missing useState declarations
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showControlSuggestions, setShowControlSuggestions] = useState(false);
  const [showCategorySuggestions, setShowCategorySuggestions] = useState(false);
  const [allreadyAssignedControllers, setAllreadyAssignedControllers] =
    useState([]);
  const [availableControls, setAvailableControls] = useState([]); // All fetched controls
  const [assignDate, setAssignDate] = useState(dayjs().format("YYYY-MM-DD"));
  const [endDate, setEndDate] = useState(dayjs().format("YYYY-MM-DD"));

  const [searchData, setSearchData] = useState({
    framework: [],
    initialsSearch: "",
    selectedCategories: [],
    entitySearch: "",
    selectedControls: [],
    controlSearch: "",
  });

  const canEditOrAssign = can([
    "security.update",
    "security.assign",
  ]);
  const canView = can("security.read");

  const fetchFrameworks = async () => {
    setLoading(true);
    try {
      const response = await CustomAxios.get(
        `${baseurl}/${initURL}/framework-control-employee/super-user-frameworks`,
      );
      setData(response?.data?.docs || []);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to fetch employees");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFrameworks();
  }, []);

  const handleRowClick = (row) => {
    setSelectReturnDialog(true);
  };

  // ✅ Functions to manage framework selection
  const getframeworkSuggestions = () => {
    return selectedData.framework; // Dummy data (Replace with API response)
  };

  const handleframeworkSelect = (framework) => {
    setSearchData((prev) => ({
      ...prev,
      framework: [...prev.framework, framework],
    }));
    setShowSuggestions(false);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
      if (entityRef.current && !entityRef.current.contains(event.target)) {
        setShowCategorySuggestions(false);
      }

      if (controlRef.current && !controlRef.current.contains(event.target)) {
        setShowControlSuggestions(false); // Close control suggestions when clicking outside
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (searchData.framework.length > 0) {
      setShowCategorySuggestions(true);
    }
    if (searchData.selectedCategories.length > 0) {
      setShowControlSuggestions(true);
    }
  }, [searchData.framework.length, searchData.selectedCategories.length]);

  // ✅ Functions to manage category selection
  const getCategorySuggestions = () => {
    let fwId = searchData.framework[0]?.framework;

    let matchingEntity = frameworkData.find((item) => item._id === fwId);

    matchingEntity = matchingEntity?.categories || [];
    const uniqueEntities = [...new Set(matchingEntity)];

    return uniqueEntities.filter(
      (entity) =>
        !searchData.selectedCategories.includes(entity) &&
        (!searchData.entitySearch ||
          entity.toLowerCase().includes(searchData.entitySearch.toLowerCase())),
    );
  };

  const handleCateogorySelect = (entityName) => {
    // Find the entity details from frameworkData
    const selectedEntity = frameworkData
      .flatMap((framework) => framework.categories)
      .find((category) => category === entityName);

    if (!selectedEntity) return;

    setSearchData((prev) => ({
      ...prev,
      selectedCategories: [...prev.selectedCategories, selectedEntity], // Store full category object
      entitySearch: "",
    }));
  };

  const handleRemoveCategory = (categoryToRemove) => {
    setSearchData((prev) => ({
      ...prev,
      selectedCategories: prev.selectedCategories.filter(
        (category) => category !== categoryToRemove,
      ),
      selectedControls: prev.selectedControls.filter(
        (control) => control.controlcategory !== categoryToRemove,
      ), // Only remove controls linked to this category
    }));
  };

  // ✅ Functions to manage control selection
  const getControlSuggestions = () => {
    const selectedControlIds = searchData.selectedControls.map(
      (control) => control._id,
    );

    return availableControls.filter(
      (control) =>
        searchData.selectedCategories.includes(control.controlcategory) && // Ensure category is selected
        control.controlname
          .toLowerCase()
          .includes(searchData.controlSearch.toLowerCase()) && // Match search
        !selectedControlIds.includes(control._id) &&
        !allreadyAssignedControllers.includes(control._id),
    );
  };

  const handleControlSelect = (control) => {
    setSearchData((prev) => ({
      ...prev,
      selectedControls: [...prev.selectedControls, control],
      controlSearch: "",
    }));
    setShowControlSuggestions(false);
  };

  const handleRemoveControl = (controlToRemove) => {
    setSearchData((prev) => ({
      ...prev,
      selectedControls: prev.selectedControls.filter(
        (control) => control._id !== controlToRemove._id,
      ),
    }));
  };

  const validateForm = () => {
    let errors = {};

    // Validate Assign Date
    if (!assignDate) {
      errors.assignDate = "Assign Date is required.";
    }

    // Validate Deadline
    if (!endDate) {
      errors.endDate = "Deadline is required.";
    }

    // Validate Framework Selection
    if (searchData.framework.length === 0) {
      errors.framework = "Please select a framework.";
    }

    // Validate Category Selection
    if (searchData.selectedCategories.length === 0) {
      errors.selectedCategories = "Please select at least one category.";
    }

    // Validate Control Selection
    if (searchData.selectedControls.length === 0) {
      errors.selectedControls = "Please select at least one control.";
    }

    return errors;
  };

  const submitReturnDialog = async () => {
    const errors = validateForm();

    // Validate errors
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return; // Stop submission if errors exist
    }

    setFormErrors({});

    // Extract required data from state
    let { selectedCategories, selectedControls, framework } = searchData;
    let assignDateFinal = assignDate;
    let deadlineFinal = endDate;

    selectedCategories = [
      ...new Set(selectedControls?.map((element) => element.controlcategory)),
    ];
    let controlNames = selectedControls.map((c) => c.controlname);

    const payload = {
      categories: selectedCategories,
      controls: selectedControls.map((con) => con._id),
      assignDate: assignDateFinal,
      deadline: deadlineFinal,
      controlNames: controlNames,
    };

    setapiloading(true);
    try {
      // Make API call
      const response = await CustomAxios.patch(
        `${baseurl}/${initURL}/framework-control-employee/assign-controls/${selectedData?._id}`,
        payload,
      );

      if (response.status === 200 || response.status === 201) {
        toast.success("Task updated successfully.");

        // Reset state after successful assignment
        setSearchData({
          initialsSearch: "",
          framework: [],
          entitySearch: "",
          selectedCategories: [],
          returnName: "",
          controlSearch: "",
          selectedControls: [],
        });
        fetchAssignTask();
        fetchFrameworks();
        setSelectReturnDialog(false);
      } else {
        toast.error(response.data?.message || "Failed to assign framework.");
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || "An error occurred while assigning.",
      );
    } finally {
      setapiloading(false);
    }
  };

  const fetchControlsForFramework = async (frameworkID) => {
    try {
      const response = await CustomAxios.get(
        `${baseurl}/${initURL}/frame-controls/short-details?frameworkID=${frameworkID}&page=1&limit=500&scopeType=In%20Scope`,
      );
      setAvailableControls(response.data.docs || []);
    } catch (error) {
      console.error("Error fetching controls:", error);
      toast.error("Failed to load controls for selected framework.");
      setAvailableControls([]);
    }
  };

  const fetchAssignTask = async () => {
    try {
      const response = await CustomAxios.get(
        `${baseurl}/${initURL}/framework-control-employee/employee-task`,
      );
      let data = response?.data || [];
      // Flatten all control IDs into one single array
      let allControls = data.flatMap((item) => item.controls);
      setAllreadyAssignedControllers(allControls);
    } catch (error) {
      toast.error(error.message);
    }
  };

  let handlefwClick = (row) => {
    handleRowClick(row);
    setselectedData(row);
    fetchControlsForFramework(row?.framework);
    setFormErrors({});
    setSearchData((prev) => ({
      ...prev,
      framework: [row],
      selectedCategories: row?.categories || [],
      selectedControls: row?.controls,
    }));

    // Ensure proper date format for input fields
    setEndDate(row?.deadline ? dayjs(row.deadline).format("YYYY-MM-DD") : "");
    setAssignDate(
      row?.assignDate ? dayjs(row.assignDate).format("YYYY-MM-DD") : "",
    );
  };

  const fetchData = async (page = 1, limit = 200) => {
    try {
      const response = await CustomAxios.get(
        `${baseurl}/${initURL}/frame-works?page=${page}&limit=${limit}`,
      );
      setFramework(response?.data?.docs || []);
    } catch (error) {
      toast.error(error.message);
    }
  };

  useEffect(() => {
    fetchAssignTask();
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="text-blue-600 hover:text-blue-800 flex justify-center items-center min-h-[80vh]">
        <Loader />
      </div>
    );
  }

  return (
    <div className="p-6 min-h-screen">
      <h2 className="text-2xl font-bold text-[#3F2073] mb-4">
        Assigned Framework Details
      </h2>

      <div className="overflow-x-auto bg-white rounded-lg shadow-md">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#2B245C] text-white">
              {[
                "Framework Name",
                "Framework Description",
                "Assigned Date",
                "Deadline",
                "Assigned Controls",
                "Assigned Categories",
                "Assigned Person",
                "Assigned Reviewer",
                "Ready Count",
                "Not Ready Count",
                "Actions",
              ].map((header, index) => (
                <th key={index} className="px-4 py-2">
                  {header}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {!canView ? (
              <tr>
                <td
                  colSpan={11}
                  className="px-4 py-10 text-center text-red-600 font-medium"
                >
                  You don’t have permission to view this.
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td
                  colSpan={11}
                  className="px-4 py-10 text-center text-gray-600"
                >
                  No records found.
                </td>
              </tr>
            ) : (
              data.map((row) => (
                <tr
                  key={row.id}
                  className="hover:bg-gray-100 transition-all border-b cursor-pointer"
                >
                  <td className="px-4 py-2">
                    {row.frameworkname
                      ?.replace(/demo|draft/gi, "")
                      .replace(/\(\s*\)/g, "")
                      .trim()}
                  </td>
                  <td className="px-4 py-2">
                    {row.frameworkdescription
                      ?.replace(/demo|draft/gi, "")
                      .replace(/\(\s*\)/g, "")
                      .trim()}
                  </td>
                  <td className="px-4 py-2">
                    {new Date(row.assignDate).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-2">
                    {new Date(row.deadline).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-2 text-center">
                    {row.controls.length}
                  </td>
                  <td className="px-4 py-2 text-center">
                    {row.categories.length}
                  </td>
                  <td className="px-4 py-2">{row.userDetails.user_name}</td>
                  <td className="px-4 py-2">{row.reviewerDetails.user_name}</td>
                  <td className="px-4 py-2">
                    {((row.readyCount * 100) / row.controls.length).toFixed(2)}%
                  </td>
                  <td className="px-4 py-2">
                    {(
                      (row.notReadyStatusCount * 100) /
                      row.controls.length
                    ).toFixed(2)}
                    %
                  </td>
                  <td className="px-4 py-2 text-center">
                    <button
                      type="button"
                      title="Edit"
                      onClick={(e) => {
                        e.stopPropagation(); // optional: prevents row click if you ever add one
                        guard(canEditOrAssign, router, () =>
                          handlefwClick(row),
                        );
                      }}
                      className="transition-all text-blue-600 hover:text-blue-800 cursor-pointer"
                    >
                      <BiEdit size={20} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Search Return Section - Dialog */}
      <Dialog
        isOpen={selectReturnDialog}
        onClose={() => setSelectReturnDialog(false)}
      >
        <div className="fixed inset-0 overflow-y-auto flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl min-w-[1000px] max-w-[1000px]">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-[#2B245C] mb-4">
                Framework Selection
              </h2>
              {/* Your provided form content goes here */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Framework */}
                <div ref={searchRef} className="space-y-0.5">
                  <label className="block text-sm font-medium text-gray-700">
                    Framework
                  </label>
                  <div className="relative">
                    <div className="min-h-[42px] w-full px-3 py-2 border border-gray-300 rounded-lg focus-within:ring-1 focus-within:ring-blue-500 focus-within:border-blue-500 bg-white">
                      <div className="flex flex-wrap gap-1.5 mb-1 overflow-auto max-h-40">
                        {searchData.framework.map((fw) => (
                          <span
                            key={fw?._id}
                            className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 px-2 py-1 rounded-md text-sm"
                          >
                            {fw?.frameworkname
                              ?.replace(/demo|draft/gi, "")
                              .replace(/\(\s*\)/g, "")
                              .trim()}
                            <button
                              // onClick={() => handleRemoveframework(fw)}
                              className="hover:bg-blue-100 rounded-full p-0.5 transition-colors cursor-not-allowed"
                            >
                              <X size={14} />
                            </button>
                          </span>
                        ))}
                      </div>

                      <input
                        type="text"
                        value={searchData.initialsSearch}
                        onChange={(e) => {
                          setSearchData((prev) => ({
                            ...prev,
                            initialsSearch: e.target.value,
                          }));
                          setShowSuggestions(true);
                        }}
                        disabled
                        onFocus={() => setShowSuggestions(true)}
                        className="outline-none w-full text-sm"
                        placeholder="Type to search framework..."
                      />
                    </div>
                    {showSuggestions && (
                      <div className="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-60 overflow-auto">
                        {getframeworkSuggestions().map((initial) => (
                          <label
                            key={initial}
                            className="flex items-center px-4 py-2 hover:bg-gray-50 cursor-pointer"
                          >
                            <input
                              type="checkbox"
                              checked={false}
                              onChange={() => handleframeworkSelect(initial)}
                              className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                            />
                            <span className="ml-2 text-sm">{initial}</span>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                  {formErrors.framework && (
                    <p className="text-red-500 text-xs ">
                      {formErrors.framework}
                    </p>
                  )}
                </div>

                {/* Framework Category */}
                <div ref={entityRef} className="space-y-0.5">
                  <label className="block text-sm font-medium text-gray-700">
                    Category
                  </label>
                  <div className="relative">
                    <div className="min-h-[42px] w-full px-3 py-2 border border-gray-300 rounded-lg focus-within:ring-1 focus-within:ring-blue-500 focus-within:border-blue-500 bg-white">
                      <div className="flex flex-wrap gap-1.5 mb-1 overflow-auto max-h-40">
                        {searchData.selectedCategories.map((entity) => (
                          <span
                            key={entity}
                            className="inline-flex items-center gap-1 bg-green-50 text-green-700 px-2 py-1 rounded-md text-sm"
                          >
                            {entity}
                            <button
                              onClick={() => handleRemoveCategory(entity)}
                              className="hover:bg-green-100 rounded-full p-0.5 transition-colors"
                            >
                              <X size={14} />
                            </button>
                          </span>
                        ))}
                      </div>

                      <input
                        type="text"
                        value={searchData.entitySearch}
                        onChange={(e) => {
                          setSearchData((prev) => ({
                            ...prev,
                            entitySearch: e.target.value,
                          }));
                          setShowCategorySuggestions(true);
                        }}
                        onFocus={() => setShowCategorySuggestions(true)}
                        className="outline-none w-full text-sm  disabled:bg-gray-50 disabled:text-gray-500"
                        placeholder={
                          searchData.framework.length === 0
                            ? "Select framework first..."
                            : "Search category..."
                        }
                        disabled={searchData.framework.length === 0}
                      />
                    </div>
                    {showCategorySuggestions &&
                      searchData.framework.length > 0 && (
                        <div className="absolute z-10 w-full mt-1 bg-white rounded-lg shadow-lg max-h-60 border  overflow-auto">
                          {getCategorySuggestions().map((entity) => (
                            <label
                              key={entity}
                              className="flex items-center px-4 py-2 hover:bg-gray-50 cursor-pointer"
                            >
                              <input
                                type="checkbox"
                                checked={false}
                                onChange={() => handleCateogorySelect(entity)}
                                className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                              />
                              <span className="ml-2 text-sm">{entity}</span>
                            </label>
                          ))}
                        </div>
                      )}
                  </div>{" "}
                  {formErrors.selectedCategories && (
                    <p className="text-red-500 text-xs ">
                      {formErrors.selectedCategories}
                    </p>
                  )}
                </div>

                {/* Controls Selection */}
                <div className="space-y-0.5" ref={controlRef}>
                  <label className="block text-sm font-medium text-gray-700">
                    Controls
                  </label>
                  <div className="relative">
                    <div className="min-h-[42px] w-full px-3 py-2 border border-gray-300 rounded-lg focus-within:ring-1 focus-within:ring-blue-500 focus-within:border-blue-500 bg-white">
                      <div className="flex flex-wrap gap-1.5 mb-1 overflow-auto max-h-40">
                        {searchData.selectedControls.map((control) => (
                          <span
                            key={control._id}
                            className="inline-flex items-center gap-1 bg-green-50 text-green-700 px-2 py-1 rounded-md text-sm"
                          >
                            {control.controlname}
                            <button
                              onClick={() => handleRemoveControl(control)}
                              className="hover:bg-green-100 rounded-full p-0.5 transition-colors"
                            >
                              <X size={14} />
                            </button>
                          </span>
                        ))}
                      </div>
                      <input
                        type="text"
                        value={searchData.controlSearch}
                        onChange={(e) => {
                          setSearchData((prev) => ({
                            ...prev,
                            controlSearch: e.target.value,
                          }));
                          setShowControlSuggestions(true);
                        }}
                        onFocus={() => setShowControlSuggestions(true)}
                        className="outline-none w-full text-sm"
                        placeholder="Search Controls..."
                        disabled={searchData.selectedCategories.length === 0}
                      />
                    </div>
                    {showControlSuggestions && (
                      <div className="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-60 overflow-auto">
                        {getControlSuggestions().map((control) => (
                          <label
                            key={control._id}
                            className="flex items-center px-4 py-2 hover:bg-gray-50 cursor-pointer"
                          >
                            <input
                              type="checkbox"
                              onChange={() => handleControlSelect(control)}
                              className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                            />
                            <span className="ml-2 text-base">
                              {control.controlname}
                              <div className="text-sm font-medium">
                                {control.controlcategory}
                              </div>
                            </span>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                  {formErrors.selectedControls && (
                    <p className="text-red-500 text-xs ">
                      {formErrors.selectedControls}
                    </p>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                {/* Assign Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Assign Date
                  </label>
                  <input
                    type="date"
                    value={assignDate}
                    min={dayjs().format("YYYY-MM-DD")}
                    onChange={(e) => setAssignDate(e.target.value)}
                    className={`w-full px-3 py-2 border ${
                      formErrors.assignDate
                        ? "border-red-500"
                        : "border-gray-300"
                    } rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm`}
                  />
                  {formErrors.assignDate && (
                    <p className="text-red-500 text-xs mt-1">
                      {formErrors.assignDate}
                    </p>
                  )}
                </div>

                {/* Deadline */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Deadline
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    min={dayjs().format("YYYY-MM-DD")}
                    onChange={(e) => setEndDate(e.target.value)}
                    className={`w-full px-3 py-2 border ${
                      formErrors.endDate ? "border-red-500" : "border-gray-300"
                    } rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm`}
                  />
                  {formErrors.endDate && (
                    <p className="text-red-500 text-xs mt-1">
                      {formErrors.endDate}
                    </p>
                  )}
                </div>
              </div>
            </div>
            <div className="flex justify-end items-center p-6 border-t bg-gray-50">
              <button
                onClick={() => setSelectReturnDialog(false)}
                className="px-4 py-2 bg-gray-200 text-[#2B245C] rounded-md hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() =>
                  guard(canEditOrAssign, router, submitReturnDialog)
                }
                title="Update"
                className="ml-4 flex justify-center items-center px-4 py-2 rounded-md min-w-20 bg-blue-600 text-white hover:bg-blue-700"
              >
                {apiloading ? <Loader /> : "Update"}
              </button>
            </div>
          </div>
        </div>
      </Dialog>
    </div>
  );
}

export default DashboardTable;
