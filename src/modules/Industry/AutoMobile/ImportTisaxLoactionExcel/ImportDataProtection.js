import CustomAxios from "@/config/CustomAxios";
import _ from "lodash";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { AiOutlineDown, AiOutlineUp } from "react-icons/ai"; // Import dropdown icons
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import {
  setImportDataProtectionData,
  setImportDataProtectionDatav603,
} from "@/store/SliceComponent/ImportSaveSlice";
import {
  CommentsList,
  FindingsList,
  ReferenceDocumentList,
} from "../Tisax/TisaxLocation/Lists";
import {
  AL2ObservationForm,
  AL3ObservationForm,
} from "../TisaxAudit/Location/ObservationForm";
import { baseurl, initURL } from "@/config/config";

const ImportDataProtection = React.forwardRef(({ eventKey, useV603 }, ref) => {
  const dispatch = useDispatch();
  const router = useRouter();
  const { id, vda_type, assessment_level, vda_version } = router.query;
  const [Protectiondata, setProtectionData] = useState([]);
  const [isHydrated, setIsHydrated] = useState(false);
  const [saveButtonVisibility, setSaveButtonVisibility] = useState({});
  const [fieldErrors, setFieldErrors] = useState({});
  const [openDropdowns, setOpenDropdowns] = useState({});

  const defaultValuesResponse = useSelector(
    (state) => state?.data?.dataProtection
  );
  const v603defaultValuesResponse = useSelector(
    (state) => state?.data?.dataProtection
  );
  const [observationData, setObservationData] = useState(null); // State to hold observation data
  const [selectedTab, setSelectedTab] = useState(null); // Initialize selectedTab
  const [selectedOptions, setSelectedOptions] = useState({});

  const [openSections, setOpenSections] = useState({});


  useEffect(() => {
    if (vda_type) {
      setProtectionData(
        defaultValuesResponse[0]?.Items ||
          v603defaultValuesResponse[0]?.Items ||
          []
      );
    }
  }, [defaultValuesResponse, vda_type]);

  const validateform = (response, componentName) => {
    toast.error(`Errors are shown in ${componentName}`);

    const errorData = response.data.errors;
    if (errorData) {
      const err = errorData.message;
      if (
        typeof err === "string" &&
        err.trim() === "Please Upload Signature File."
      ) {
        // toast.error(err);
      } else {
        // Handle other cases
        const fieldErrors = {};
        err.forEach((error) => {
          Object.entries(error).forEach(([fieldName, errorMessage]) => {
            fieldErrors[fieldName] = errorMessage;
          });
        });
        setFieldErrors(fieldErrors); // Update field errors state
      }
    }
  };

  useEffect(() => {
    if (!isHydrated) {
      setIsHydrated(true); // Set flag to true once component is hydrated
      return; // Skip execution during hydration
    }

    // const fetchData = async (id) => {
    //   try {
    //     const response = await CustomAxios.get(
    //       `${baseurl}/${initURL}/tisax-audit/dataProtection/${id}?vda_type=${vda_type}`
    //     );

    //     response?.data?.sort(
    //       (a, b) => parseFloat(a["ISA New"]) - parseFloat(b["ISA New"])
    //     );

    //     setProtectionData(response?.data);
    //     handleSavemain();

    //     const inputFieldsArray = response?.data
    //       .map((item) => item["Reference Documentation"] || [""])
    //       .flat();

    //     const initialObservationData = response.data.map((item) => {
    //       const deviationType = item.deviationType || "";
    //       const deviationFound = item.deviationFound || false;
    //       return {
    //         deviationFound,
    //         noDeviation: !deviationFound,
    //         majorNonConformity:
    //           deviationType === "Major non-conformity" || false,
    //         minorNonConformity:
    //           deviationType === "Minor non-conformity" || false,
    //         observation: deviationType === "Observation" || false,
    //         roomForImprovement:
    //           deviationType === "Room for improvement" || false,
    //         description: item.deviationDescription || "",
    //         deviationType,
    //         plausible: !deviationFound, // Ensures plausible is true if no deviation is found
    //         ...(assessment_level === "AL2" && {
    //           al2Plausible: !deviationFound,
    //         }), // Ensure plausible is set correctly for AL2
    //       };
    //     });

    //     setObservationData(initialObservationData);
    //   } catch (error) {}
    // };

    // if (router.query.id) {
    //   fetchData(router.query.id);
    // }
  }, [isHydrated, router.query.id]);

  const handleMaturityChange = (index, value) => {
    const sanitizedValue = value.replace(/[^0-5]/g, "").charAt(0);

    setProtectionData((prevData) => {
      const newData = [...prevData];
      const newItem = { ...newData[index] }; // Create a shallow copy of the item
      newItem["Maturity Level"] = value; // Modify the copy
      newData[index] = newItem; // Update the array with the modified item
      return newData; // Set the state with the updated array
    });
  };
  const handleDropdownSelect = (index, value) => {
    setSelectedOptions((prev) => ({
      ...prev,
      [index]: value,
    }));

    setProtectionData((prevData) => {
      const newData = [...prevData];
      const newItem = { ...newData[index] };
      newItem["Assessment"] = value;
      newData[index] = newItem;
      return newData;
    });

    setOpenDropdowns((prev) => ({
      ...prev,
      [index]: false,
    }));

    diableData(index, true);
  };

  const handleAssessmentChange = (index, selectedOption) => {
    setProtectionData((prevData) => {
      const newData = [...prevData];
      const newItem = { ...newData[index] }; // Create a shallow copy of the item
      newItem["Assessment"] = selectedOption.value; // Modify the copy
      newData[index] = newItem; // Update the array with the modified item
      return newData; // Set the state with the updated array
    });
    diableData(index, true);
  };

  const handleInputAction = (index, field, referenceData) => {
    setProtectionData((prevData) => {
      const newData = _.cloneDeep(prevData);
      newData[index][field] = referenceData;
      return newData;
    });
    diableData(index, true);
  };

  const handleFieldChange = (index, name, value) => {
    const newFieldErrors = { ...fieldErrors };
    if (newFieldErrors[`${index}`] && newFieldErrors[`${index}`][name]) {
      delete newFieldErrors[`${index}`][name];
    }
    setFieldErrors(newFieldErrors);
  };

  const handleFieldBlur = (index, name, value) => {
    const newFieldErrors = { ...fieldErrors };
    const key = `${index}`;

    if (name === "description" && !value.trim()) {
      if (!newFieldErrors[key]) {
        newFieldErrors[key] = {};
      }
      newFieldErrors[key].deviationDescription =
        "Description should not be empty";
    } else if (
      name !== "description" &&
      !PrototypeProtectiondata[index].deviationType
    ) {
      if (!newFieldErrors[key]) {
        newFieldErrors[key] = {};
      }
      newFieldErrors[key].deviationType = "Deviation type should not be empty";
    } else {
      if (newFieldErrors[key]) {
        delete newFieldErrors[key].deviationDescription;
        delete newFieldErrors[key].deviationType;
      }
    }

    setFieldErrors(newFieldErrors);
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
  const handleSave = async (index) => {
    try {
      const updatedData = [...Protectiondata];
      const editedItem = updatedData[index];
      const filteredInputFieldsReference = editedItem[
        "Reference Documentation"
      ]?.filter((item) => item !== "");
      const filteredInputFieldsFindings = editedItem["findings"]?.filter(
        (item) => item !== ""
      );
      const filteredInputFieldsComments = editedItem["comments"]?.filter(
        (item) => item !== ""
      );
      const documentation =
        filteredInputFieldsReference?.length > 0
          ? filteredInputFieldsReference
          : null;
      const findings =
        filteredInputFieldsFindings?.length > 0
          ? filteredInputFieldsFindings
          : null;
      const comments =
        filteredInputFieldsComments?.length > 0
          ? filteredInputFieldsComments
          : null;

      const observation = observationData[index];
      const requestBody = {
        "ISA New": editedItem["ISA New"] || "",
        "Reference Documentation": documentation,
        findings: findings,
        comments: comments,
        Assessment: editedItem["Assessment"] || "NA",
        deviationFound: observation.deviationFound,
        deviationType: observation.noDeviation
          ? null
          : observation.deviationType,
        deviationDescription: observation.noDeviation
          ? null
          : observation.description,
      };

      // Conditionally add al2Plausible to the payload if assessment level is AL2
      if (
        assessment_level === "AL2" &&
        observation.al2Plausible !== undefined
      ) {
        requestBody.plausible = observation.al2Plausible;
      }

      const response = await CustomAxios.patch(
        `${baseurl}/${initURL}/tisax-audit/dataprotectionQnAImport/${id}?vda_type=${vda_type}`,
        requestBody
      );
      if (response.status === 200) {
        diableData(index, false);
        toast.success("Data submitted successfully!");
        // Clear the field errors
        const newFieldErrors = { ...fieldErrors };
        delete newFieldErrors[`${index}`];
        setFieldErrors(newFieldErrors);
      } else if (response.status === 400) {
        // validateform(response,"Data Protection");

        toast.error("Data Not saved. Please check again");
        const newFieldErrors = { ...fieldErrors }; // Create a copy of the current field errors

        response.data.errors.message.forEach((error) => {
          const fieldName = Object.keys(error)[0]; // Get the field name from the first key of the error object
          const errorMessage = error[fieldName]; // Get the corresponding error message
          const key = `${index}`; // Create a unique key for each accordion item
          if (!newFieldErrors[key]) {
            newFieldErrors[key] = {};
          }
          newFieldErrors[key][fieldName] = errorMessage; // Assign the error message to the field name
        });

        setFieldErrors(newFieldErrors); // Update field errors state
      }
    } catch (error) {
      console.error("Error saving data:", error);
    }
  };

  const defaultimport = useSelector((state) => state.importData);

  // Function to handle updating observation data in parent component state
  const handleObservationDataUpdate = (index, data) => {
    const updatedObservationData = [...observationData];
    updatedObservationData[index] = data;
    setObservationData(updatedObservationData);
    diableData(index, true);
  };

  const handleSavemain = () => {
    if (Protectiondata && Protectiondata.length > 0) {
      const updatedData = [...Protectiondata];
      const newDataItems = updatedData?.map((item) => item);
      newDataItems?.forEach((item) => {
        if (
          Array.isArray(item["Reference Documentation"]) &&
          item["Reference Documentation"].length === 0
        ) {
          item["Reference Documentation"] = "";
        }
        if (Array.isArray(item.findings) && item.findings.length === 0) {
          item.findings = "";
        }
      });

      dispatch(setImportDataProtectionData(newDataItems));
      dispatch(setImportDataProtectionDatav603(newDataItems));
    }
  };
  const diableData = (index, value) => {
    setSaveButtonVisibility((prevVisibility) => {
      const newVisibility = { ...prevVisibility };
      const accordionId = `${index}`;
      newVisibility[accordionId] = value;
      return newVisibility;
    });
  };

  // Forward the ref to the outermost element or to the component itself
  React.useImperativeHandle(ref, () => ({
    validateform,
  }));

  return (
    <div className="pb-1 p-1">
      <div className="container mx-auto p-4">
        <div className="space-y-4">
          {/* Iterate through Protectiondata array */}
          {Protectiondata.map((entry, groupIndex) => (
            <div key={groupIndex} className="border border-gray-300 rounded-lg">
              <div
                className="flex justify-between items-center bg-[#F8F9FA] border border-[#E0E0E0] font-semibold rounded-lg text-[#333333] p-4 cursor-pointer"
                onClick={() => toggleItemSection(groupIndex)}
              >
                <span>
                  {entry["ISA New"] || "N/A"} -{" "}
                  {entry["Control question"] || "N/A"}
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
                  {/* Requirements Section */}
                  <div className="my-4">
                    <h3 className="font-bold text-gray-700 mb-2">
                      Requirements
                    </h3>
                    {Array.isArray(entry.Requirements) &&
                    entry.Requirements.length > 0 ? (
                      entry.Requirements.map((requirement, reqIndex) => (
                        <div key={reqIndex} className="mb-4">
                          <p className="text-gray-700">
                            <strong>Requirement {reqIndex + 1}:</strong>{" "}
                            {requirement}
                          </p>
                        </div>
                      ))
                    ) : (
                      <p className="text-red-500">No requirements available</p>
                    )}
                  </div>
                  {/* Render Tab Content based on selectedTab */}
                  {selectedTab !== null && entry.Requirements[selectedTab] && (
                    <div className="mt-2 bg-white p-6 rounded-md shadow-md">
                      {/* Control Question */}
                      <h3 className="text-lg font-semibold text-gray-700 mb-1">
                        Control Question:{" "}
                        <span className="text-gray-600 font-normal">
                          {entry["Control question"] || "No question available"}
                        </span>
                      </h3>
                      {/* Objective */}
                      <h3 className="text-lg font-semibold text-gray-700 mb-4">
                        Objective:{" "}
                        <span className="text-gray-600 font-normal">
                          {entry["Objective"] || "No objective available"}
                        </span>
                      </h3>

                      {/* Assessment Dropdown */}
                      <div className="my-4">
                        <label className="block font-bold mb-2">
                          Assessment
                        </label>
                        <div className="relative">
                          <button
                            onClick={() =>
                              setOpenDropdowns((prev) => ({
                                ...prev,
                                [selectedTab]: !openDropdowns[selectedTab],
                              }))
                            }
                            className="w-full bg-white border border-gray-300 text-left px-4 py-2 rounded-md focus:outline-none"
                          >
                            {selectedOptions[selectedTab] ||
                              entry["Assessment"] ||
                              "Select Assessment"}
                            <span className="float-right">
                              {openDropdowns[selectedTab] ? "▲" : "▼"}
                            </span>
                          </button>
                          {openDropdowns[selectedTab] && (
                            <ul className="absolute w-full bg-white border border-gray-300 mt-1 rounded-md shadow-lg z-50">
                              {["na", "OK", "Not OK"].map(
                                (option, optionIndex) => (
                                  <li
                                    key={optionIndex}
                                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                                    onClick={() =>
                                      handleDropdownSelect(selectedTab, option)
                                    }
                                  >
                                    {option}
                                  </li>
                                )
                              )}
                            </ul>
                          )}
                        </div>
                      </div>

                      {/* Requirements Section */}
                      {/* <div className="my-4">
                        <div className="font-bold mb-2">Requirement</div>
                        {Array.isArray(entry.Requirements[selectedTab]) ? (
                          entry.Requirements[selectedTab].map(
                            (req, reqIndex) => (
                              <div key={reqIndex} className="mb-4">
                                <p className="text-gray-700">
                                  <strong>Q{reqIndex + 1}:-</strong> {req}
                                </p>
                                <textarea
                                  rows={5}
                                  className="w-full border rounded-md p-2 mt-2"
                                  placeholder="Start typing here..."
                                  value={req.answer || ""}
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
                              </div>
                            )
                          )
                        ) : (
                          <p className="text-red-500">
                            No requirements available
                          </p>
                        )}
                      </div> */}

                      <div>
                        <ReferenceDocumentList
                          onChange={(referenceData) =>
                            handleInputAction(
                              groupIndex,
                              "Reference Documentation",
                              referenceData
                            )
                          }
                          data={entry["Reference Documentation"]}
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
                          data={entry["comments"]}
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
                          data={entry["findings"]}
                        />
                      </div>

                      {assessment_level === "AL3" && vda_type && id ? (
                        <AL3ObservationForm
                          key={selectedTab}
                          onUpdateObservationData={(data) =>
                            handleObservationDataUpdate(data, selectedTab)
                          }
                          observationData={entry}
                          deviationFound={entry.deviationFound}
                          majorNonConformity={entry.deviationType}
                          minorNonConformity={entry.deviationType}
                          observation={entry.deviationType}
                          roomForImprovement={entry.deviationType}
                          description={entry.deviationType}
                          fieldErrors={fieldErrors[`${selectedTab}`] || {}}
                          handleFieldChange={(name, value) =>
                            handleFieldChange(selectedTab, name, value)
                          }
                          handleFieldBlur={(name, value) =>
                            handleFieldBlur(selectedTab, name, value)
                          }
                        />
                      ) : assessment_level === "AL2" && vda_type && id ? (
                        <AL2ObservationForm
                          key={selectedTab}
                          onUpdateObservationData={(data) =>
                            handleObservationDataUpdate(data, selectedTab)
                          }
                          observationData={entry}
                          deviationFound={entry.deviationFound}
                          al2Plausible={entry.deviationFound}
                          majorNonConformity={entry.deviationType}
                          minorNonConformity={entry.deviationType}
                          observation={entry.deviationType}
                          roomForImprovement={entry.deviationType}
                          description={entry.deviationType}
                          fieldErrors={fieldErrors[`${selectedTab}`] || {}}
                          handleFieldChange={(name, value) =>
                            handleFieldChange(selectedTab, name, value)
                          }
                          handleFieldBlur={(name, value) =>
                            handleFieldBlur(selectedTab, name, value)
                          }
                        />
                      ) : null}

                      {/* <div className="flex justify-end">
                        <button
                          onClick={() => handleSave(selectedTab)}
                          className="flex items-center px-4 py-2 text-white rounded-md bg-blue-500 hover:bg-blue-600"
                        >
                          <FaSave className="mr-2" /> Save
                        </button>
                      </div> */}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
});

ImportDataProtection.displayName = "ImportDataProtection";

export default ImportDataProtection;
