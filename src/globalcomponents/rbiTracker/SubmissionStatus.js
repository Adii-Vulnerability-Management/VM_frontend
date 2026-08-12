import SubmissionStatusEmployeeSearch from "@/globalcomponents/rbiTracker/SubmissionStatusEmployeeSearch";
import axios from "axios";
import { X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import * as XLSX from "xlsx";
import { baseurl, initURL } from "../../../BaseUrl";
import Dialog from "@/globalcomponents/rbiTracker/Dialog";
import ReminderSystem from "./Reminder";
import CustomAxios from "@/globalcomponents/CustomAxios";
import Loader from "@/globalcomponents/loader/Loader";

const SubmissionStatus = () => {
  const [file, setFile] = useState(null);
  const [trackerData, setTrackerData] = useState([]);
  const [uploadtrackerdataloading, setuploadtrackerdataloading] =
    useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showEntitySuggestions, setShowEntitySuggestions] = useState(false);
  const [showReturnSuggestions, setShowReturnSuggestions] = useState(false);
  const searchRef = useRef(null);
  const entityRef = useRef(null);
  const reportCodeRef = useRef(null);
  const returnNameRef = useRef(null);
  const [submissionStatusDialog, setSubmissionStatusDialog] = useState(false);
  const [selectReturnDialog, setSelectReturnDialog] = useState(false);
  const [selectedReturn, setSelectedReturn] = useState({});
  const [reminders, setReminders] = useState([]);
  const [showReportCodeSuggestions, setShowReportCodeSuggestions] =
    useState(false); // Show report code suggestions

  // Employee Search States
  const [searchData, setSearchData] = useState({
    initialsSearch: "",
    selectedInitials: [],
    entitySearch: "",
    selectedEntities: [],
    returnName: "",
    reportCodeSearch: "", // For searching Report Codes
    selectedReportCodes: [],
  });

  const [selectedData, setSelectedData] = useState({
    returnDescription: "",
    detailsOfRelatedCirculars: "",
    frequency: "",
    returnName: "",
    returnId: "",
  });

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
      if (entityRef.current && !entityRef.current.contains(event.target)) {
        setShowEntitySuggestions(false);
      }
      if (
        returnNameRef.current &&
        !returnNameRef.current.contains(event.target)
      ) {
        setShowReturnSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (searchData.selectedEntities.length > 0) {
      setShowReturnSuggestions(true);
    } else {
      setShowReturnSuggestions(false);
      setSearchData((prev) => ({ ...prev, returnName: "" }));
      setSelectedData({
        returnDescription: "",
        detailsOfRelatedCirculars: "",
        frequency: "",
        returnName: "",
        returnId: "",
        departmentConcerned: "",
      });
    }
  }, [searchData.selectedEntities]);

  const getReturnNameSuggestions = () => {
    if (searchData.selectedEntities.length === 0) return [];
    const returnNames = trackerData
      .filter((item) =>
        searchData.selectedEntities.includes(item.reportingEntity)
      )
      .map((item) => ({
        returnName: item.returnName,
        returnDescription: item.returnDescription,
        detailsOfRelatedCirculars: item.detailsOfRelatedCirculars,
        frequency: item.frequency,
        departmentConcerned: item.departmentConcerned,
        _id: item._id,
      }));

    const uniqueReturns = Array.from(
      new Set(returnNames.map((item) => item.returnName))
    ).map((name) => returnNames.find((item) => item.returnName === name));

    return uniqueReturns.filter(
      (item) =>
        !searchData.returnName ||
        item.returnName
          .toLowerCase()
          .includes(searchData.returnName.toLowerCase())
    );
  };
  const handleReturnNameSelect = (returnData) => {
    setSearchData((prev) => ({
      ...prev,
      returnName: returnData.returnName,
    }));

    setSelectedData({
      returnDescription: returnData.returnDescription || "",
      detailsOfRelatedCirculars: returnData.detailsOfRelatedCirculars || "",
      frequency: returnData.frequency || "",
      returnName: returnData.returnName || "",
      returnId: returnData._id || "",
      departmentConcerned: returnData.departmentConcerned || "",
    });

    setShowReturnSuggestions(false);
  };

  useEffect(() => {
    fetchTrackerData();
  }, []);

  useEffect(() => {
    if (searchData.selectedInitials.length > 0) {
      setShowEntitySuggestions(true);
    }
    if (searchData.selectedReportCodes.length > 0) {
      setShowEntitySuggestions(true);
    }
  }, [searchData.selectedInitials, searchData.selectedReportCodes]);

  const fetchTrackerData = async () => {
    try {
      const response = await CustomAxios.get(
        `${baseurl}/${initURL}/rbi-tracking/fetch-submission-tracking`
      );
      setTrackerData(response.data);
    } catch (error) {
      toast.error("Error loading tracker data");
    }
  };

  const getInitialsSuggestions = () => {
    if (!searchData.initialsSearch) return [];

    const uniqueInitials = [
      ...new Set(trackerData.map((item) => item.reportingEntityInitials)),
    ];

    return uniqueInitials.filter(
      (initial) =>
        initial
          .toLowerCase()
          .includes(searchData.initialsSearch.toLowerCase()) &&
        !searchData.selectedInitials.includes(initial)
    );
  };

  const getEntitySuggestions = () => {
    const matchingEntities = trackerData
      .filter(
        (item) =>
          searchData.selectedInitials.includes(item.reportingEntityInitials) || // Match initials OR
          searchData.selectedReportCodes.includes(item.reportCode) // Match reportCode
      )
      .map((item) => item.reportingEntity);
    const uniqueEntities = [...new Set(matchingEntities)];

    return uniqueEntities.filter(
      (entity) =>
        !searchData.selectedEntities.includes(entity) && // Exclude already selected entities
        (!searchData.entitySearch || // Filter by search term
          entity.toLowerCase().includes(searchData.entitySearch.toLowerCase()))
    );
  };

  const handleInitialsSelect = (initial) => {
    setSearchData((prev) => ({
      ...prev,
      selectedInitials: [...prev.selectedInitials, initial],
      initialsSearch: "",
      entitySearch: "",
    }));
    setShowEntitySuggestions(true);
  };

  const handleEntitySelect = (entity) => {
    setSearchData((prev) => ({
      ...prev,
      selectedEntities: [...prev.selectedEntities, entity],
      entitySearch: "",
    }));
  };

  const handleRemoveInitial = (initialToRemove) => {
    setSearchData((prev) => {
      const entitiesToRemove = trackerData
        .filter((item) => item.reportingEntityInitials === initialToRemove)
        .map((item) => item.reportingEntity);

      return {
        ...prev,
        selectedInitials: prev.selectedInitials.filter(
          (initial) => initial !== initialToRemove
        ),
        selectedEntities: prev.selectedEntities.filter(
          (entity) => !entitiesToRemove.includes(entity)
        ),
      };
    });
  };

  const handleRemoveEntity = (entityToRemove) => {
    setSearchData((prev) => ({
      ...prev,
      selectedEntities: prev.selectedEntities.filter(
        (entity) => entity !== entityToRemove
      ),
    }));
  };

  const handleRbiTrackerFileSubmit = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
  };

  
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!file) {
      toast.error("Please select a file before submitting!");
      return;
    }

    const requiredAttributes = [
      "Department Concerned",
      "Details of Related Circulars",
      "Frequency",
      "Reporting Entity required to submit the return",
      "Reporting Entity required to submit the return -Initials",
      "Return Description",
      "Return Name",
      "Report Code",
    ];

    const validateData = (data) => {
      if (!Array.isArray(data)) {
        toast.error(
          "Data should be an array of objects. Please upload the correct format."
        );
        return false; // Return false to indicate validation failure
      }

      for (let index = 0; index < data.length; index++) {
        const item = data[index];
        const keys = Object.keys(item);

        // Check for a single missing attribute
        const missingAttribute = requiredAttributes.find(
          (attr) => !keys.includes(attr)
        );
        if (missingAttribute) {
          toast.error(
            `missing the attribute: ${missingAttribute}. Please correct the data and try again. Download a sample for reference.`
          );
          return false; // Return false to stop further validation
        }

        // Check for extra attributes
        const extraAttributes = keys.filter(
          (key) => !requiredAttributes.includes(key)
        );
        if (extraAttributes.length > 0) {
          toast.error(
            `Row ${index + 1} has an unexpected attribute: ${extraAttributes[0]
            }. Please follow the sample data format.`
          );
          return false; // Return false to stop further validation
        }
      }

      return true; // Return true if validation passes
    };

    const reader = new FileReader();
    reader.onload = async (event) => {
      const data = new Uint8Array(event.target.result);
      const workbook = XLSX.read(data, { type: "array" });
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      try {
        // Validate the data
        if (!validateData(jsonData)) return;
        setuploadtrackerdataloading(true);
        // Proceed with API call
        const response = await CustomAxios.post(
          `${baseurl}/${initURL}/rbi-tracking/submission-tracking`,
          jsonData,
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (response.status === 200 || response.status === 201) {
          toast.success("Data submitted successfully!");
          setFile(null);
          document.getElementById("rbiTrackerFile").value = "";
          setSubmissionStatusDialog(false);
          fetchTrackerData();
        } else {
          toast.error("Failed to submit data.");
        }
      } catch (error) {
        toast.error(error.message || "Error uploading data. Please try again.");
      } finally {
        setuploadtrackerdataloading(false);
      }
    };

    reader.readAsArrayBuffer(file);
  };

  let submitReturnDialog = () => {
    setSelectedReturn(selectedData);
    setSelectReturnDialog(false);
  };

  const getReportCodeSuggestions = () => {
    if (!searchData.reportCodeSearch) return [];

    const uniqueReportCodes = [
      ...new Set(trackerData.map((item) => item.reportCode)),
    ];

    return uniqueReportCodes.filter(
      (code) =>
        code
          .toLowerCase()
          .includes(searchData.reportCodeSearch.toLowerCase()) &&
        !searchData.selectedReportCodes.includes(code)
    );
  };

  const handleReportCodeSelect = (code) => {
    setSearchData((prev) => ({
      ...prev,
      selectedReportCodes: [...prev.selectedReportCodes, code],
      reportCodeSearch: "",
    }));
    setShowReportCodeSuggestions(false);
  };

  const handleRemoveReportCode = (codeToRemove) => {
    setSearchData((prev) => {
      const entitiesToRemove = trackerData
        .filter((item) => item.reportCode === codeToRemove) // Get entities associated with the reportCode
        .map((item) => item.reportingEntity);

      return {
        ...prev,
        selectedReportCodes: prev.selectedReportCodes.filter(
          (code) => code !== codeToRemove
        ),
        selectedEntities: prev.selectedEntities.filter(
          (entity) => !entitiesToRemove.includes(entity)
        ),
      };
    });
  };

  return (
    <div className="p-4">
      {/* Header Section */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#2B245C]">
            Submission Status
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Upload and manage RBI submission tracking data
          </p>
        </div>

        <div className="flex space-x-4">
          <a
            href="/Files/RBI tracker Demo Entries.xlsx"
            className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg shadow-md hover:bg-green-700 transition"
            download="Return_Format.xlsx"
          >
            Download Sample
          </a>
          <button
            className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            onClick={() => setSubmissionStatusDialog(true)}
          >
            Upload Data
          </button>
          <button
            className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
            onClick={() => setSelectReturnDialog(true)}
          >
            Select Return
          </button>
        </div>
      </div>
      {/* File Upload Section */}
      <Dialog
        isOpen={submissionStatusDialog}
        onClose={() => setSubmissionStatusDialog(false)}
      >
        <div className="rounded-lg p-6 min-w-[700px]">
          <h2 className="text-xl font-bold mb-4 text-[#2B245C]">
            Upload Tracker Data
          </h2>
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label
                htmlFor="rbiTrackerFile"
                className="block text-sm font-medium text-[#2B245C] mb-2"
              >
                Upload Tracker File
              </label>
              <input
                type="file"
                id="rbiTrackerFile"
                accept=".xlsx, .xls"
                onChange={handleRbiTrackerFileSubmit}
                required
                className="block w-full border border-gray-300 rounded-md p-2 text-[#2B245C] focus:ring focus:ring-blue-300 focus:outline-none"
              />
            </div>
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => setSubmissionStatusDialog(false)}
                className="flex items-center px-4 py-2 bg-gray-200 text-[#2B245C] rounded-md hover:bg-gray-300 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex items-center justify-center min-w-20 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
              >
                {uploadtrackerdataloading ? <Loader /> : "Upload File"}
              </button>
            </div>
          </form>
        </div>
      </Dialog>

      {/* Search Return Section */}
      <Dialog
        isOpen={selectReturnDialog}
        onClose={() => setSelectReturnDialog(false)}
      >
        <div className="space-y-6 p-6 shadow-2xl min-w-[1000px] max-w-[1000px] overflow-auto">
          <div className="">
            <div>
              <h2 className="text-xl font-semibold text-[#2B245C] mb-4">
                Select Return
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {/* Reporting Entity Initials */}
                <div ref={searchRef} className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Reporting Entity Initials
                  </label>
                  <div className="relative">
                    <div className="min-h-[42px] w-full px-3 py-2 border border-gray-300 rounded-lg focus-within:ring-1 focus-within:ring-blue-500 focus-within:border-blue-500 bg-white">
                      <div className="flex flex-wrap gap-1.5 mb-1">
                        {searchData.selectedInitials.map((initial) => (
                          <span
                            key={initial}
                            className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 px-2 py-1 rounded-md text-sm"
                          >
                            {initial}
                            <button
                              onClick={() => handleRemoveInitial(initial)}
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
                        placeholder="Type to search initials..."
                      />
                    </div>
                    {showSuggestions && (
                      <div className="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-60 overflow-auto">
                        {getInitialsSuggestions().map((initial) => (
                          <label
                            key={initial}
                            className="flex items-center px-4 py-2.5 hover:bg-gray-50 cursor-pointer"
                          >
                            <input
                              type="checkbox"
                              checked={false}
                              onChange={() => handleInitialsSelect(initial)}
                              className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                            />
                            <span className="ml-2 text-sm">{initial}</span>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                {/* Report Code Search */}
                <div ref={reportCodeRef} className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Report Code
                  </label>
                  <div className="relative">
                    <div className="min-h-[42px] w-full px-3 py-2 border border-gray-300 rounded-lg focus-within:ring-1 focus-within:ring-blue-500 focus-within:border-blue-500 bg-white">
                      <div className="flex flex-wrap gap-1.5 mb-1">
                        {searchData.selectedReportCodes.map((code) => (
                          <span
                            key={code}
                            className="inline-flex items-center gap-1 bg-yellow-50 text-yellow-700 px-2 py-1 rounded-md text-sm"
                          >
                            {code}
                            <button
                              onClick={() => handleRemoveReportCode(code)}
                              className="hover:bg-yellow-100 rounded-full p-0.5 transition-colors"
                            >
                              <X size={14} />
                            </button>
                          </span>
                        ))}
                      </div>
                      <input
                        type="text"
                        value={searchData.reportCodeSearch}
                        onChange={(e) => {
                          setSearchData((prev) => ({
                            ...prev,
                            reportCodeSearch: e.target.value,
                          }));
                          setShowReportCodeSuggestions(true);
                        }}
                        onFocus={() => setShowReportCodeSuggestions(true)}
                        className="outline-none w-full text-sm"
                        placeholder="Type to search report code..."
                      />
                    </div>
                    {showReportCodeSuggestions && (
                      <div className="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-60 overflow-auto">
                        {getReportCodeSuggestions().map((code) => (
                          <label
                            key={code}
                            className="flex items-center px-4 py-2.5 hover:bg-gray-50 cursor-pointer"
                          >
                            <input
                              type="checkbox"
                              checked={false}
                              onChange={() => handleReportCodeSelect(code)}
                              className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                            />
                            <span className="ml-2 text-sm">{code}</span>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Entity Search */}
                <div ref={entityRef} className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Reporting Entity
                  </label>
                  <div className="relative">
                    <div className="min-h-[42px] w-full px-3 py-2 border border-gray-300 rounded-lg focus-within:ring-1 focus-within:ring-blue-500 focus-within:border-blue-500 bg-white">
                      <div className="flex flex-wrap gap-1.5 mb-1">
                        {searchData.selectedEntities.map((entity) => (
                          <span
                            key={entity}
                            className="inline-flex items-center gap-1 bg-green-50 text-green-700 px-2 py-1 rounded-md text-sm"
                          >
                            {entity}
                            <button
                              onClick={() => handleRemoveEntity(entity)}
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
                          setShowEntitySuggestions(true);
                        }}
                        onFocus={() => setShowEntitySuggestions(true)}
                        className="outline-none w-full text-sm disabled:bg-gray-50 disabled:text-gray-500"
                        placeholder={
                          searchData.selectedInitials.length === 0
                            ? "Select initials first..."
                            : "Search entity..."
                        }
                        disabled={searchData.selectedInitials.length === 0}
                      />
                    </div>
                    {showEntitySuggestions &&
                      (searchData.selectedInitials.length > 0 ||
                        searchData.selectedReportCodes.length > 0) && (
                        <div className="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-60 overflow-auto">
                          {getEntitySuggestions().map((entity) => (
                            <label
                              key={entity}
                              className="flex items-center px-4 py-2.5 hover:bg-gray-50 cursor-pointer"
                            >
                              <input
                                type="checkbox"
                                checked={false}
                                onChange={() => handleEntitySelect(entity)}
                                className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                              />
                              <span className="ml-2 text-sm">{entity}</span>
                            </label>
                          ))}
                        </div>
                      )}
                  </div>
                </div>

                {/* Return Name Search */}
                <div ref={returnNameRef} className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Return Name
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={searchData.returnName}
                      onChange={(e) => {
                        setSearchData((prev) => ({
                          ...prev,
                          returnName: e.target.value,
                        }));
                        setShowReturnSuggestions(true);
                      }}
                      onFocus={() => setShowReturnSuggestions(true)}
                      className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500 text-sm"
                      placeholder={
                        searchData.selectedEntities.length === 0
                          ? "Select entities first..."
                          : "Search return name..."
                      }
                      disabled={searchData.selectedEntities.length === 0}
                    />
                    {showReturnSuggestions &&
                      searchData.selectedEntities.length > 0 && (
                        <div className="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-60 overflow-auto">
                          {getReturnNameSuggestions().map((returnData) => (
                            <div
                              key={returnData.returnName}
                              className="px-4 py-3 hover:bg-gray-50 cursor-pointer"
                              onClick={() => handleReturnNameSelect(returnData)}
                            >
                              <div className="font-medium text-sm">
                                {returnData.returnName}
                              </div>
                              <div className="text-xs text-gray-500 mt-1">
                                Frequency: {returnData.frequency}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Details Section */}
          <div className="bg-white rounded-lg shadow-">
            <div>
              <h2 className="text-lg font-semibold text-[#2B245C] mb-4">
                Return Details
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Return Description
                  </label>
                  <input
                    type="text"
                    value={selectedData.returnDescription}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-sm"
                    disabled
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Related Circulars
                  </label>
                  <input
                    type="text"
                    value={selectedData.detailsOfRelatedCirculars}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-sm"
                    disabled
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Frequency
                  </label>
                  <input
                    type="text"
                    value={selectedData.frequency}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-sm"
                    disabled
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Department Concerned
                  </label>
                  <input
                    type="text"
                    value={selectedData.departmentConcerned}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-sm"
                    disabled
                  />
                </div>
              </div>
            </div>
          </div>

          {selectedData.frequency && (
            <ReminderSystem
              propfrequency={selectedData.frequency}
              setReminders={setReminders}
              reminders={reminders}
            />
          )}

          {/* Cancel Button Section */}
          <div className="flex justify-end pt-4 gap-4">
            <button
              type="button"
              onClick={() => setSelectReturnDialog(false)}
              className="flex items-center px-4 py-2 bg-gray-200 text-[#2B245C] rounded-md hover:bg-gray-300 transition"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={submitReturnDialog}
              className="flex items-center justify-center min-w-20 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
            >
              Submit
            </button>
          </div>
        </div>
      </Dialog>

      <div className="overflow-hidden bg-white rounded-xl shadow-lg border border-gray-100 my-4">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-[#1e284e]">
              <tr className="text-center">
                {[
                  "Return Name",
                  "Return Description",
                  "Related Circulars",
                  "Frequency",
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
              {selectedReturn?.returnName ? (
                <tr className="hover:bg-blue-50 transition-colors duration-200 text-center">
                  <td className="px-6 py-5 text-sm text-gray-700">
                    {selectedReturn?.returnName}
                  </td>
                  <td className="px-6 py-5 text-sm text-gray-700">
                    {selectedReturn?.returnDescription || "N/A"}
                  </td>
                  <td className="px-6 py-5 text-sm text-gray-700">
                    {selectedReturn?.detailsOfRelatedCirculars || "N/A"}
                  </td>
                  <td className="px-6 py-5 text-sm text-gray-700">
                    {selectedReturn?.frequency || "N/A"}
                  </td>
                </tr>
              ) : (
                <tr>
                  <td
                    colSpan={4}
                    className="px-6 py-5 text-sm text-gray-500 text-center"
                  >
                    No return selected
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Employee Search Section */}
      <SubmissionStatusEmployeeSearch
        RbiTrackerNotifierId={selectedData.returnId}
        reminders={reminders}
        setSelectedReturn={setSelectedReturn}
        setSearchData={setSearchData}
      />
    </div>
  );
};

export default SubmissionStatus;
