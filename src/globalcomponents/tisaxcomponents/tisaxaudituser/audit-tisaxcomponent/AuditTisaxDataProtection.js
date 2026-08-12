import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { baseurl, initURL } from "../../../../../BaseUrl";
import { toast } from "react-toastify";
import _ from "lodash";
import { ReferanceDocumentList, CommentsList, FindingsList } from "./text-list";
import { FaSave } from "react-icons/fa"; // Importing save icon from React Icons
import CustomAxios from "@/globalcomponents/CustomAxios";
import { AiOutlineDown, AiOutlineUp } from "react-icons/ai"; // Import dropdown icons
import { DataProtectionJson } from "@/routes/tisaxjsonfolder/DataProtectionJson";
import Select from "react-select";
import { AL2ObservationForm, AL3ObservationForm } from "../ObservationForm";
import Loader from "@/globalcomponents/loader/Loader";
import useGlobalLoading from "@/globalcomponents/loader/useGlobalLoading";

function AuditTisaxDataProtection(props) {
  const { eventKey } = props;
  const router = useRouter();
  const { id, vda_type, assessment_level, rootId } = router.query;
  const [Protectiondata, setProtectionData] = useState([]);
  const [saveButtonVisibility, setSaveButtonVisibility] = useState({});
  const [isHydrated, setIsHydrated] = useState(false);
  const [observationData, setObservationData] = useState(null); // State to hold observation data
  const [fieldErrors, setFieldErrors] = useState({});
  const [openSections, setOpenSections] = useState({});
  const [selectedTab, setSelectedTab] = useState(null);
  const [selectedOptions, setSelectedOptions] = useState({});
  const [openDropdowns, setOpenDropdowns] = useState({});
  const [forceUpdate, setForceUpdate] = useState(0); // Extra state for forcing re-renders
  const [saveLoading, setsaveLoading] = useState(false)
  const { loading, showLoader, hideLoader } = useGlobalLoading(); // Use loader hook


  useEffect(() => {
    if (!isHydrated) {
      setIsHydrated(true);
      return;
    }
    const fetchData = async (id) => {
      showLoader()
      try {
        let response = await CustomAxios.get(
          `${baseurl}/${initURL}/assign-tisax-task/reviewer-assigned-tasks/${id}`
        );

        response.data = response?.data?.dataProtectionControls || [];

        const sortedData = response?.data?.sort(
          (a, b) => parseFloat(a["ISA New"]) - parseFloat(b["ISA New"])
        );

        const dataWithDefaults = sortedData.map((item) => ({
          ...item,
          Assessment: item.Assessment || "NA",
        }));

        const groupedData = _.groupBy(dataWithDefaults, "Parent ISA New");

        setProtectionData(groupedData);

        const initialObservationData = dataWithDefaults.map((item) => {
          const deviationType = item.deviationType || "";
          const deviationFound = item.deviationFound || false;
          return {
            deviationFound,
            noDeviation: !deviationFound,
            majorNonConformity:
              deviationType === "Major non-conformity" || false,
            minorNonConformity:
              deviationType === "Minor non-conformity" || false,
            observation: deviationType === "Observation" || false,
            roomForImprovement:
              deviationType === "Room for improvement" || false,
            description: item.deviationDescription || "",
            deviationType,
            ...(assessment_level === "AL2" && {
              al2Plausible: item.plausible || false,
            }),
          };
        });
        setObservationData(initialObservationData);
      } catch (error) {
        toast.error("Failed to fetch data!")
      }
      finally {
        hideLoader()
      }
    };

    if (rootId) {
      fetchData(rootId);
    }
  }, [isHydrated, id, rootId]);

  const handleInputAction = (groupIndex, field, referenceData) => {
    setProtectionData((prevData) => {
      const newData = _.cloneDeep(prevData);

      // Ensure the group structure exists
      const groupKey = Object.keys(newData)[groupIndex];
      if (groupKey && newData[groupKey][selectedTab]) {
        // Initialize the field if it doesn't exist
        newData[groupKey][selectedTab][field] = referenceData;
      } else {
        console.warn(
          "Group or item structure is not defined:",
          groupIndex,
          field
        );
      }

      return newData;
    });
    diableData(groupIndex, true);
  };

  const handleAssessmentChange = (groupIndex, selectedValue) => {
    setProtectionData((prevData) => {
      const newData = _.cloneDeep(prevData);

      const groupKey = Object.keys(newData)[groupIndex];
      if (groupKey && newData[groupKey][selectedTab]) {
        newData[groupKey][selectedTab]["Assessment"] = selectedValue;
      } else {
        console.warn("Unable to update, check data structure:", newData);
      }

      return newData;
    });
  };

  const handleFieldChange = (groupIndex, name, value) => {
    const newFormData = [...Protectiondata];

    if (!newFormData[groupIndex]) {
      newFormData[groupIndex] = {};
    }
    newFormData[groupIndex][name] = value;

    // Clear the error for the current field
    const newFieldErrors = { ...fieldErrors };
    if (newFieldErrors[`${groupIndex}`]) {
      delete newFieldErrors[`${groupIndex}`][name];
    }

    setProtectionData(newFormData);
    setFieldErrors(newFieldErrors);
  };

  const handleFieldBlur = (groupIndex, name, value) => {
    const newFieldErrors = { ...fieldErrors };
    const key = `${groupIndex}`;

    if (name === "description" && !value.trim()) {
      if (!newFieldErrors[key]) {
        newFieldErrors[key] = {};
      }
      newFieldErrors[key].deviationDescription =
        "Description should not be empty";

      // Show toast error message for empty description
      toast.error("Description should not be empty");
    } else if (
      name !== "description" &&
      !Protectiondata[Object.keys(Protectiondata)[groupIndex]]?.deviationType
    ) {
      if (!newFieldErrors[key]) {
        newFieldErrors[key] = {};
      }
      newFieldErrors[key].deviationType = "Deviation type should not be empty";

      // Show toast error message for empty deviation type
      toast.error("Deviation type should not be empty");
    } else {
      if (newFieldErrors[key]) {
        delete newFieldErrors[key].deviationDescription;
        delete newFieldErrors[key].deviationType;
      }
    }

    setFieldErrors(newFieldErrors);
  };

  const handleSave = async (index) => {
    try {
      // Retrieve the data item to be saved
      const updatedData = Object.values(Protectiondata).flat();
      const editedItem = updatedData[index];

      if (!editedItem) {
        console.error("No item found at the specified index.");
        return;
      }

      // Filter out empty fields
      const documentation =
        editedItem["Reference Documentation"]?.filter((item) => item !== "") ||
        null;
      const findings =
        editedItem["findings"]?.filter((item) => item !== "") || null;
      const comments =
        editedItem["comments"]?.filter((item) => item !== "") || null;

      const observation = observationData[index];

      // Validate required fields based on selected options
      const errors = {};
      if (observation.deviationFound && !observation.deviationType) {
        errors.deviationType =
          "Deviation type is required when a deviation is found.";
        toast.error("Deviation type is required when a deviation is found.");
      }

      if (
        observation.deviationFound &&
        (!observation.description || !observation.description.trim())
      ) {
        errors.deviationDescription =
          "Description is required when a deviation is found.";
        toast.error("Description is required when a deviation is found.");
      }

      // If there are errors, update fieldErrors state and stop the save process
      if (Object.keys(errors).length > 0) {
        const newFieldErrors = { ...fieldErrors, [`${index}`]: errors };
        setFieldErrors(newFieldErrors);
        return;
      }

      // Build the request body
      const requestBody = {
        "ISA New": editedItem["ISA New"] || "",
        Assessment: editedItem["Assessment"] || "NA",
        "Reference Documentation": documentation,
        findings,
        comments,
        deviationFound: observation.deviationFound,
        deviationType: observation.noDeviation
          ? null
          : observation.deviationType,
        deviationDescription: observation.noDeviation
          ? null
          : observation.description,
      };

      // Add AL2-specific property if required
      if (
        assessment_level === "AL2" &&
        observation.al2Plausible !== undefined
      ) {
        requestBody.plausible = observation.al2Plausible;
      }
      setsaveLoading(true)

      // Define request URL and make the patch request
      const requestUrl = `${baseurl}/${initURL}/tisax-audit/dataprotectionQnAImport/${id}?vda_type=${vda_type}`;
      const response = await CustomAxios.patch(requestUrl, requestBody);

      // Handle the API response
      if (response.status === 200) {
        diableData(index, false);
        toast.success("Data submitted successfully!");
        // Clear errors for this index
        setFieldErrors((prevErrors) => {
          const newErrors = { ...prevErrors };
          delete newErrors[`${index}`];
          return newErrors;
        });
      } else if (response.status === 400) {
        console.error("Response data errors:", response.data.errors);
        toast.error("Data not saved. Please check again.");

        // Update fieldErrors based on the API response
        const newFieldErrors = { ...fieldErrors };
        response.data.errors.message.forEach((error) => {
          const fieldName = Object.keys(error)[0];
          const errorMessage = error[fieldName];
          const key = `${index}`;
          if (!newFieldErrors[key]) {
            newFieldErrors[key] = {};
          }
          newFieldErrors[key][fieldName] = errorMessage;
        });

        setFieldErrors(newFieldErrors);
      }
    } catch (error) {
      console.error("Error saving data:", error.message);
      toast.error("An error occurred while saving the data.");
    } finally {
      setsaveLoading(false)
    }
  };

  const handleObservationDataUpdate = (data, index) => {
    const updatedObservationData = [...observationData];
    updatedObservationData[index] = data;
    setObservationData(updatedObservationData);
    diableData(index, true);
  };

  const diableData = (index, value) => {
    setSaveButtonVisibility((prevVisibility) => {
      const newVisibility = { ...prevVisibility };
      const accordionId = `${index}`;
      newVisibility[accordionId] = value;
      return newVisibility;
    });
  };
  const toggleItemSection = (groupIndex) => {
    setOpenSections((prev) => {
      const isOpen = prev[groupIndex]; // Check if the section is currently open
      return {
        ...prev,
        [groupIndex]: !isOpen, // Toggle the state to open/close
      };
    });
  };
  const handleDropdownSelect = (groupIndex, option) => {
    // Update selectedOptions for immediate visual feedback
    setSelectedOptions((prev) => ({
      ...prev,
      [groupIndex]: option.value,
    }));

    // Update Protectiondata to ensure selected Assessment is saved
    setProtectionData((prevData) => {
      const newData = _.cloneDeep(prevData); // Clone to avoid state mutation issues
      if (newData[groupIndex] && newData[groupIndex][0]) {
        newData[groupIndex][0]["Assessment"] = option.value; // Update the Assessment
      }
      return newData; // Return the updated Protectiondata
    });

    // Close the dropdown for the selected item
    setOpenDropdowns((prev) => ({
      ...prev,
      [groupIndex]: false,
    }));

    diableData(groupIndex, true); // Optionally disable data
  };

  const handleFormChangeRequirement = (
    groupIndex,
    itemIndex,
    reqIndex,
    field,
    value
  ) => {
    const newData = [...Protectiondata];
    const myItem =
      newData[groupIndex].Items[itemIndex].Requirements[reqIndex][field];
    if (
      value !== "<p><br></p>" &&
      (myItem !== value || (myItem === null && value.length > 0))
    ) {
      diableData(groupIndex, itemIndex, true);
    }
    newData[groupIndex].Items[itemIndex].Requirements[reqIndex][field] = value;
    setProtectionData(newData);
  };

  const handleTabClick = (eventKey) => {
    setSelectedTab(eventKey);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center w-full">
        <Loader />
      </div>
    );
  }

  return (
    <div className="pb-1 p-1">
      <div className="container mx-auto p-4">
        <div className="space-y-4">
          {Object.entries(Protectiondata).length > 0 ? (
            Object.entries(Protectiondata).map(
              ([parentISA, items], groupIndex) => (
                <div
                  key={groupIndex}
                  className="border border-gray-300 rounded-lg"
                >
                  <div
                    className="flex justify-between items-center bg-[#F8F9FA] border border-[#E0E0E0] font-semibold rounded-lg text-[#333333] p-4 cursor-pointer"
                    onClick={() => toggleItemSection(groupIndex)}
                  >
                    <span>
                      {parentISA && items[0]?.["Parent Control question"]
                        ? `${parentISA} - ${items[0]["Parent Control question"]}`
                        : "Data Protection"}
                    </span>

                    <span>
                      {openSections[groupIndex] ? (
                        <AiOutlineUp />
                      ) : (
                        <AiOutlineDown />
                      )}
                    </span>
                  </div>

                  {openSections[groupIndex] && (
                    <div className="bg-gray-50 p-4 rounded-lg shadow-sm mb-4">
                      <div className="flex space-x-4 mb-4">
                        {items.map((item, itemIndex) => (
                          <button
                            key={itemIndex}
                            className={`text-center w-full px-4 py-2 rounded-md transition-colors 
  ${selectedTab === itemIndex ? "bg-[#1e3a8a] text-white" : "bg-gray-200 text-black hover:bg-gray-300"} 
  ${item.isReady ? "border-green-500 border-2" : "border-red-500 border-2"}`}
                            onClick={() => setSelectedTab(itemIndex)}
                          >
                            {item["ISA New"]}
                          </button>
                        ))}
                      </div>

                      {selectedTab !== null && items[selectedTab] && (
                        <div className="mt-2 bg-white p-6 rounded-md shadow-md">
                          <h3 className="text-lg font-semibold text-gray-700 mb-1">
                            Control Question:{" "}
                            <span className="text-gray-600 font-normal">
                              {items[selectedTab]["Control question"]}
                            </span>
                          </h3>
                          <h3 className="text-lg font-semibold text-gray-700 mb-4">
                            Objective:{" "}
                            <span className="text-gray-600 font-normal">
                              {items[selectedTab]["Objective"]}
                            </span>
                          </h3>
                          <div className="my-4">
                            <label className="block font-bold mb-2">
                              Assessment
                            </label>
                            <select
                              key={`${forceUpdate}-${groupIndex}-${selectedTab}`}
                              className="w-full bg-white border border-gray-300 px-4 py-2 rounded-md focus:outline-none"
                              value={
                                selectedOptions[
                                `${groupIndex}-${selectedTab}`
                                ] ||
                                items[selectedTab]?.Assessment ||
                                "NA"
                              }
                              onChange={(e) =>
                                handleAssessmentChange(
                                  groupIndex,
                                  e.target.value
                                )
                              }
                            >
                              <option value="na">NA</option>
                              <option value="OK">OK</option>
                              <option value="Not OK">NOT OK</option>
                            </select>
                          </div>

                          <div className="my-4">
                            <div className="font-bold mb-2">Requirement</div>
                            {items[selectedTab].Requirements?.map(
                              (req, reqIndex) => (
                                <div key={reqIndex} className="mb-4">
                                  <p className="text-gray-700">
                                    <strong>Q{reqIndex + 1}:</strong>{" "}
                                    {req.question}
                                  </p>
                                  {req.answer === null ? (
                                    <p className="text-red-600">
                                      Warning: No data available for audit.
                                    </p>
                                  ) : (
                                    <textarea
                                      rows={5}
                                      className="w-full border rounded-md p-2 mt-2"
                                      placeholder="Start typing here..."
                                      value={req.answer || ""}
                                      disabled
                                      onChange={(e) =>
                                        handleFormChangeRequirement(
                                          groupIndex,
                                          selectedTab,
                                          reqIndex,
                                          "answer",
                                          e.target.value
                                        )
                                      }
                                    />
                                  )}
                                </div>
                              )
                            )}
                          </div>

                          <div>
                            <ReferanceDocumentList
                              onChange={(referenceData) =>
                                handleInputAction(
                                  groupIndex,
                                  "Reference Documentation",
                                  referenceData
                                )
                              }
                              data={
                                items[selectedTab]["Reference Documentation"]
                              }
                            />
                          </div>

                          <div>
                            <CommentsList
                              onChange={(commentsData) =>
                                handleInputAction(
                                  groupIndex,
                                  "comments",
                                  commentsData
                                )
                              }
                              data={items[selectedTab]["comments"]}
                            />
                          </div>

                          <div>
                            <FindingsList
                              onChange={(findingsData) =>
                                handleInputAction(
                                  groupIndex,
                                  "findings",
                                  findingsData
                                )
                              }
                              data={items[selectedTab]["findings"]}
                            />
                          </div>

                          {assessment_level === "AL3" && vda_type && id ? (
                            <div>
                              <AL3ObservationForm
                                key={selectedTab}
                                onUpdateObservationData={(data) =>
                                  handleObservationDataUpdate(data, selectedTab)
                                }
                                observationData={items[selectedTab]}
                                deviationFound={
                                  items[selectedTab].deviationFound
                                }
                                majorNonConformity={
                                  items[selectedTab].deviationType
                                }
                                minorNonConformity={
                                  items[selectedTab].deviationType
                                }
                                observation={items[selectedTab].deviationType}
                                roomForImprovement={
                                  items[selectedTab].deviationType
                                }
                                description={items[selectedTab].deviationType}
                                fieldErrors={
                                  fieldErrors[`${selectedTab}`] || {}
                                }
                                handleFieldChange={(name, value) =>
                                  handleFieldChange(selectedTab, name, value)
                                }
                                handleFieldBlur={(name, value) =>
                                  handleFieldBlur(selectedTab, name, value)
                                }
                              />
                            </div>
                          ) : assessment_level === "AL2" && vda_type && id ? (
                            <div>
                              <AL2ObservationForm
                                key={selectedTab}
                                onUpdateObservationData={(data) =>
                                  handleObservationDataUpdate(data, selectedTab)
                                }
                                observationData={items[selectedTab]}
                                deviationFound={
                                  items[selectedTab].deviationFound
                                }
                                al2Plausible={items[selectedTab].deviationFound}
                                majorNonConformity={
                                  items[selectedTab].deviationType
                                }
                                minorNonConformity={
                                  items[selectedTab].deviationType
                                }
                                observation={items[selectedTab].deviationType}
                                roomForImprovement={
                                  items[selectedTab].deviationType
                                }
                                description={items[selectedTab].deviationType}
                                fieldErrors={
                                  fieldErrors[`${selectedTab}`] || {}
                                }
                                handleFieldChange={(name, value) =>
                                  handleFieldChange(selectedTab, name, value)
                                }
                                handleFieldBlur={(name, value) =>
                                  handleFieldBlur(selectedTab, name, value)
                                }
                              />
                            </div>
                          ) : null}

                          <div className="flex justify-end">
                            <button
                              onClick={() => handleSave(selectedTab)}
                              className="flex items-center px-4 py-2 text-white rounded-md bg-blue-500 hover:bg-blue-600"
                            >
                              {saveLoading ? <Loader /> : "Save"}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            )
          ) : (
            <div className="p-6 text-center text-gray-600 text-lg font-semibold">
              🚫 No controls available in this category.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AuditTisaxDataProtection;
