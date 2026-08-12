import CustomAxios from "@/globalcomponents/CustomAxios";
import { useRouter } from "next/router";
import dayjs from "dayjs";
import { X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { can, guard } from "@/auth/auth-permissions";
import { toast } from "react-toastify";
import { baseurl, initURL } from "../../../BaseUrl";
import ComplianceAssignmentSubmissionStatusEmployeeSearch from "./ComplianceAssignmentSubmissionStatusEmployeeSearch";
import Dialog from "../Dialog";

const ComplianceAssignmentSubmissionStatus = () => {
  const router = useRouter();

  const [frameworkData, setFramework] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showControlSuggestions, setShowControlSuggestions] = useState(false);
  const [showCateogorySuggestions, setShowCategorySuggestions] =
    useState(false);
  const searchRef = useRef(null);
  const entityRef = useRef(null);
  const controlRef = useRef(null);
  const [selectReturnDialog, setSelectReturnDialog] = useState(false);
  const [selectedReturn, setSelectedReturn] = useState(false);
  const [assignDate, setAssignDate] = useState(dayjs().format("YYYY-MM-DD")); // Default to today's date
  const [endDate, setEndDate] = useState("");
  const [availableControls, setAvailableControls] = useState([]); // All fetched controls
  const [assignTask, setAssignTask] = useState([]);
  const [formErrors, setFormErrors] = useState({});
  const [allreadyAssignedControllers, setAllreadyAssignedControllers] =
    useState([]);

  // Employee Search States
  const [searchData, setSearchData] = useState({
    initialsSearch: "",
    framework: [],
    entitySearch: "",
    selectedCategories: [],
    returnName: "",
    controlSearch: "",
    selectedControls: [],
  });

  const [selectedData, setSelectedData] = useState({
    returnDescription: "",
    detailsOfRelatedCirculars: "",
    frequency: "",
    returnName: "",
    returnId: "",
  });

  const canView = can("security.read");
  const canAssign = can(["security.assign", "security.manage"]);

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

  const getframeworkSuggestions = () => {
    if (!searchData.initialsSearch) return [];

    const selectedFrameworkNames = searchData.framework.map((fw) =>
      fw.frameworkname.toLowerCase(),
    );

    return frameworkData
      .map((item) => item.frameworkname)
      .filter(
        (initial) =>
          initial
            .toLowerCase()
            .includes(searchData.initialsSearch.toLowerCase()) &&
          !selectedFrameworkNames.includes(initial.toLowerCase()), // Ensure selected frameworks are excluded
      );
  };

  const getCategorySuggestions = () => {
    let fwId = searchData.framework[0]?._id;
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

  const handleframeworkSelect = async (frameworkName) => {
    const selectedFramework = frameworkData.find(
      (item) => item.frameworkname === frameworkName,
    );

    if (!selectedFramework) return;

    setSearchData((prev) => ({
      ...prev,
      framework: [selectedFramework], // Store full framework object
      initialsSearch: "",
      entitySearch: "",
      controlSearch: "",
      selectedControls: [],
      selectedCategories: [], // Reset categories when framework changes
    }));

    setAvailableControls([]);

    if (selectedFramework._id) {
      await fetchControlsForFramework(selectedFramework._id);
    }
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

  const handleRemoveframework = () => {
    setSearchData((prev) => ({
      ...prev,
      framework: [], // Remove framework
      selectedCategories: [], // Clear categories
      selectedControls: [], // Clear controls
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

  let submitReturnDialog = async () => {
    const errors = validateForm();

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return; // Stop submission if errors exist
    }

    setFormErrors({});
    setSelectedReturn(true);
    setSelectReturnDialog(false);
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

  useEffect(() => {
    fetchData();
    fetchAssignTask();
  }, []);

  // Fetch Controls from API when Framework is Selected
  const fetchControlsForFramework = async (frameworkID) => {
    try {
      const response = await CustomAxios.get(
        `${baseurl}/${initURL}/frame-controls/short-details?frameworkID=${frameworkID}&page=1&limit=500&scopeType=In%20Scope`,
      );
      console.log(response?.data.docs?.length || 0, "hiii");
      setAvailableControls(response.data.docs || []);
    } catch (error) {
      console.error("Error fetching controls:", error);
      toast.error("Failed to load controls for selected framework.");
      setAvailableControls([]);
    }
  };
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

  // Remove Control from Selection
  const handleRemoveControl = (controlToRemove) => {
    setSearchData((prev) => ({
      ...prev,
      selectedControls: prev.selectedControls.filter(
        (control) => control._id !== controlToRemove._id,
      ),
    }));
  };
  // Handle Control Selection
  const handleControlSelect = (control) => {
    setSearchData((prev) => ({
      ...prev,
      selectedControls: [...prev.selectedControls, control],
      controlSearch: "",
    }));
    setShowControlSuggestions(false);
  };

  return (
    <div className="min-h-screen p-5">
      <div className="space-y-6">
        {/* Header Section */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-[#2B245C]">
              Framework Assignment
            </h2>
            <p className="mt-1 text-sm text-gray-600">
              Assign framework categories to employees for streamlined
              management.
            </p>
          </div>

          <div className="flex space-x-4">
            <button
              type="button"
              title="Select Framework"
              onClick={() =>
                guard(canAssign, router, () => setSelectReturnDialog(true))
              }
              className="px-4 py-2 text-sm font-medium rounded-lg transition-colors bg-cyan-700 text-white hover:bg-cyan-600"
            >
              Select Framework (Compliance)
            </button>
          </div>
        </div>

        {/* Search Return Section */}
        <Dialog
          isOpen={selectReturnDialog}
          onClose={() => setSelectReturnDialog(false)}
        >
          {/* <div className="fixed inset-0 bg-black bg-opacity-25 " /> */}
          <div className="fixed inset-0 overflow-y-auto ">
            <div className="flex min-h-full items-center justify-center p-4">
              <div className="bg-white rounded-lg shadow-xl min-w-[1000px] max-w-[1000px]">
                <div className="p-6">
                  <h2 className="text-xl font-semibold text-[#2B245C] mb-4">
                    Framework Selection
                  </h2>
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
                                key={fw._id}
                                className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 px-2 py-1 rounded-md text-sm"
                              >
                                {fw.frameworkname
                                  ?.replace(/demo|draft/gi, "")
                                  .replace(/\(\s*\)/g, "")
                                  .trim()}
                                <button
                                  onClick={() => handleRemoveframework(fw)}
                                  className="hover:bg-blue-100 rounded-full p-0.5 transition-colors"
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
                                  onChange={() =>
                                    handleframeworkSelect(initial)
                                  }
                                  className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                                />
                                <span className="ml-2 text-sm">
                                  {initial
                                    ?.replace(/demo|draft/gi, "")
                                    .replace(/\(\s*\)/g, "")
                                    .trim()}
                                </span>
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
                        {showCateogorySuggestions &&
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
                                    onChange={() =>
                                      handleCateogorySelect(entity)
                                    }
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
                            disabled={
                              searchData.selectedCategories.length === 0
                            }
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
                          formErrors.endDate
                            ? "border-red-500"
                            : "border-gray-300"
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

                {/* Footer Section */}
                <div className="flex justify-end items-center p-6 border-t bg-gray-50">
                  <button
                    type="button"
                    onClick={() => setSelectReturnDialog(false)}
                    className="px-4 py-2 bg-gray-200 text-[#2B245C] rounded-md hover:bg-gray-300 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    title="Submit"
                    onClick={() => guard(canAssign, router, submitReturnDialog)}
                    className="ml-4 px-4 py-2 rounded-md transition bg-blue-600 text-white hover:bg-blue-700"
                  >
                    Submit
                  </button>
                </div>
              </div>
            </div>
          </div>
        </Dialog>

        <div>
          <div className="overflow-hidden bg-white rounded-xl shadow-lg border border-gray-100 mt-4">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-[#2B245C]">
                  <tr className="text-center">
                    {[
                      "Framework Name",
                      "Category",
                      "Controls",
                      "Assign Date",
                      "Deadline",
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
                        You don’t have permission to view data.
                      </td>
                    </tr>
                  ) : selectedReturn ? (
                    <tr className="hover:bg-blue-50 transition-colors duration-200 text-center">
                      <td className="px-6 py-5 text-sm text-gray-700">
                        {searchData?.framework?.[0]?.frameworkname
                          ?.replace(/demo|draft/gi, "")
                          .replace(/\(\s*\)/g, "")
                          .trim()}{" "}
                      </td>
                      <td className="px-6 py-5 text-sm text-gray-700">
                        {searchData?.selectedCategories
                          ? searchData?.selectedCategories.join(" , ")
                          : "N/A"}
                      </td>
                      <td className="px-6 py-5 text-sm text-gray-700">
                        {searchData?.selectedControls
                          ? searchData?.selectedControls
                              .map((cr) => cr.controlname)
                              .join(" , ")
                          : "N/A"}
                      </td>
                      <td className="px-6 py-5 text-sm text-gray-700">
                        {assignDate || "N/A"}
                      </td>
                      <td className="px-6 py-5 text-sm text-gray-700">
                        {endDate || "N/A"}
                      </td>
                    </tr>
                  ) : (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-6 py-5 text-sm text-gray-500 text-center"
                      >
                        No Framework selected
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Employee Search Section */}
        <ComplianceAssignmentSubmissionStatusEmployeeSearch
          router={router}
          RbiTrackerNotifierId={selectedData?.returnId}
          setSelectedReturn={setSelectedReturn}
          setSearchData={setSearchData}
          setAssignDate={setAssignDate}
          setEndDate={setEndDate}
          setSelectedData={setSelectedData}
          searchData={searchData}
          assignDate={assignDate}
          endDate={endDate}
        />
      </div>
    </div>
  );
};

export default ComplianceAssignmentSubmissionStatus;
