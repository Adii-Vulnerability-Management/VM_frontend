import _ from "lodash";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { baseurl, initURL } from "../../../../../BaseUrl";

import CustomAxios from "@/globalcomponents/CustomAxios";
import Loader from "@/globalcomponents/loader/Loader";
import { AiOutlineDown, AiOutlineUp } from "react-icons/ai"; // Import dropdown icons
import {
  CommentsList,
  FindingsList,
  ReferanceDocumentList,
} from "../../tisax-audit/audit-tisaxcomponent/text-list";
import { AL2ObservationForm, AL3ObservationForm } from "../ObservationForm";
import useGlobalLoading from "@/globalcomponents/loader/useGlobalLoading";

function AuditTisaxInformationSecurity(props) {
  const [isOpen, setIsOpen] = useState({});
  const { eventKey } = props;
  const router = useRouter();
  const { id, vda_type, assessment_level, vda_version, rootId } = router.query;
  const [InformationSecuritydata, setInformationSecurityData] = useState([]);
  const [formData, setFormData] = useState([]);
  const [saveButtonVisibility, setSaveButtonVisibility] = useState({});
  const [isHydrated, setIsHydrated] = useState(false);
  const [observationData, setObservationData] = useState(null); // State to hold observation data
  const [fieldErrors, setFieldErrors] = useState({});
  const [saveLoading, setsaveLoading] = useState(false)
  const { loading, showLoader, hideLoader } = useGlobalLoading(); // Use loader hook


  const handleToggleAccordion = (groupIndex, itemIndex = null) => {
    setIsOpen((prevState) => {
      if (itemIndex === null) {
        // Toggle the main group
        return {
          ...prevState,
          [groupIndex]: !prevState[groupIndex], // Toggle the group itself
        };
      } else {
        // Toggle individual items while keeping the group open
        const newState = { ...prevState };

        // Close all items in this group
        Object.keys(newState).forEach((key) => {
          if (key.startsWith(`${groupIndex}-`)) {
            delete newState[key];
          }
        });

        // Open or close the specific item
        newState[`${groupIndex}-${itemIndex}`] =
          !prevState[`${groupIndex}-${itemIndex}`];

        // Ensure the group itself stays open
        newState[groupIndex] = true;

        return newState;
      }
    });
  };
  const fetchData = async (id) => {
    showLoader()
    try {
      // Fetch default values for your form
      let Response = await CustomAxios.get(
        `${baseurl}/${initURL}/tisax/employee/informationSecurity/${id}`
      );

      if (Response?.data && Array.isArray(Response.data)) {
        const groupedData = {};

        Response?.data?.sort((a, b) => {
          if (a["Root ISA New"] !== b["Root ISA New"]) {
            return a["Root ISA New"].localeCompare(b["Root ISA New"]);
          } else if (a["Parent ISA New"] !== b["Parent ISA New"]) {
            return a["Parent ISA New"].localeCompare(b["Parent ISA New"]);
          } else {
            return a["ISA New"].localeCompare(b["ISA New"]);
          }
        });

        Response?.data?.forEach((item) => {
          const groupKey = `${item["Root ISA New"]}_${item["Root Control question"]}`;
          if (!groupedData[groupKey]) {
            groupedData[groupKey] = {
              "Root ISA New": item["Root ISA New"],
              "Root Control question": item["Root Control question"],
              Items: [],
            };
          }

          groupedData[groupKey].Items.push(item);
        });

        const finalResult = Object.values(groupedData);
        setInformationSecurityData(finalResult);
        setFormData(finalResult);

        const initialObservationData = finalResult.map((group) => {
          return group.Items.map((item) => {
            const deviationType = item.deviationType || "";
            const deviationFound = item.deviationFound ?? false; // Use nullish coalescing to handle undefined
            const al2Plausible =
              assessment_level === "AL2" ? !deviationFound : undefined;

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
              ...(assessment_level === "AL2" && { al2Plausible }), // Set al2Plausible based on assessment level
            };
          });
        });
        setObservationData(initialObservationData);
      }
    } catch (error) {
      toast.error("Failed to fetch data!");
    } finally {
      hideLoader()
    }
  };

  useEffect(() => {
    if (!isHydrated && id && rootId) {
      fetchData(id);
      setIsHydrated(true); // Only set hydrated after fetching
    }
  }, [isHydrated, id]);

  const handleMaturityChange = (groupIndex, itemIndex, value) => {
    // Allow only single digits between 0 and 5
    const sanitizedValue = value.replace(/[^0-5]/g, "").charAt(0);
    setInformationSecurityData((prevData) => {
      const newData = [...prevData];
      newData[groupIndex].Items[itemIndex]["Maturity Level"] = sanitizedValue;
      return newData;
    });
    diableData(groupIndex, itemIndex, true);
  };

  const values = "<p><br></p>";

  const handleFieldChange = (groupIndex, itemIndex, name, value) => {
    const newFormData = { ...formData };

    // Ensure the nested structure exists
    if (!newFormData[groupIndex]) {
      newFormData[groupIndex] = [];
    }
    if (!newFormData[groupIndex][itemIndex]) {
      newFormData[groupIndex][itemIndex] = {};
    }

    newFormData[groupIndex][itemIndex][name] = value;

    // Always include the description field
    if (
      name !== "description" &&
      !newFormData[groupIndex][itemIndex].description
    ) {
      newFormData[groupIndex][itemIndex].description = "";
    }

    // Clear the error for the current field
    const fieldName =
      name === "description" ? "deviationDescription" : "deviationType";
    const newFieldErrors = { ...fieldErrors };
    if (newFieldErrors[`${groupIndex}-${itemIndex}`]) {
      delete newFieldErrors[`${groupIndex}-${itemIndex}`][fieldName];
    }

    setFormData(newFormData);
    setFieldErrors(newFieldErrors);
  };
  const handleFieldBlur = (groupIndex, itemIndex, name, value) => {
    // 
    const newFieldErrors = { ...fieldErrors };
    const key = `${groupIndex}-${itemIndex}`;

    if (name === "description" && !value.trim()) {
      if (!newFieldErrors[key]) {
        newFieldErrors[key] = {};
      }
      newFieldErrors[key].deviationDescription =
        "Description should not be empty";
      toast.error("Description should not be empty");
    } else if (
      name !== "description" &&
      !formData[groupIndex][itemIndex].deviationType
    ) {
      if (!newFieldErrors[key]) {
        newFieldErrors[key] = {};
      }
      newFieldErrors[key].deviationType = "Deviation type should not be empty";
      toast.error("Deviation type should not be empty");
    } else {
      if (newFieldErrors[key]) {
        delete newFieldErrors[key].deviationDescription;
        delete newFieldErrors[key].deviationType;
      }
    }

    setFieldErrors(newFieldErrors);
  };
  const handleObservationDataUpdate = (groupIndex, index, data) => {
    const updatedObservationData = [...observationData];
    if (!updatedObservationData[groupIndex]) {
      updatedObservationData[groupIndex] = [];
    }
    updatedObservationData[groupIndex][index] = data;
    setObservationData(updatedObservationData);
    diableData(groupIndex, index, true);
  };

  const handleInputAction = (groupIndex, itemIndex, field, referenceData) => {
    setInformationSecurityData((prevData) => {
      const newData = _.cloneDeep(prevData);
      newData[groupIndex].Items[itemIndex][field] = referenceData;
      return newData;
    });
    diableData(groupIndex, itemIndex, true);
  };

  const handleSave = async (groupIndex, itemIndex) => {
    try {
      const updatedData = [...InformationSecuritydata];
      const editedGroup = updatedData[groupIndex];
      const editedItem = editedGroup.Items[itemIndex];
      const observation = observationData?.[groupIndex]?.[itemIndex];

      const filteredInputFieldsReference = editedItem[
        "Reference Documentation"
      ]?.filter((item) => item !== "");
      const filteredInputFieldsFindings = editedItem["findings"]?.filter(
        (item) => item !== ""
      );
      const filteredInputFieldsComments = editedItem["comments"]?.filter(
        (item) => item !== ""
      );
      const errors = {};
      if (!observation) {
        console.error("Observation data is undefined for groupIndex:", groupIndex, "and itemIndex:", itemIndex);
        toast.error("Please add description and deviation type");
        return;
      }
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
      if (Object.keys(errors).length > 0) {
        const newFieldErrors = { ...fieldErrors, [`${index}`]: errors };
        setFieldErrors(newFieldErrors);
        return;
      }

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

      if (
        observationData[groupIndex] &&
        observationData[groupIndex][itemIndex]
      ) {
        const observation = observationData[groupIndex][itemIndex];

        const requestBody = {
          "ISA New": editedItem["ISA New"] || "",
          "Maturity Level": editedItem["Maturity Level"] || 0,
          "Reference Documentation": documentation,
          findings: findings,
          comments: comments,
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

        setsaveLoading(true)

        const response = await CustomAxios.patch(
          `${baseurl}/${initURL}/tisax-audit/employee/informationSecurityQnAImport/${id}?vda_type=${vda_type}`,
          requestBody
        );
        if (response.status === 200) {
          diableData(groupIndex, itemIndex, false);
          toast.success("data submitted successfully!");
          const newFieldErrors = { ...fieldErrors };
          delete newFieldErrors[`${groupIndex}-${itemIndex}`];
          setFieldErrors(newFieldErrors);
        } else if (response.status === 400) {
          toast.error("Data Not saved. Please check again");
          const newFieldErrors = { ...fieldErrors }; // Create a copy of the current field errors

          response.data.errors.message.forEach((error) => {
            const fieldName = Object.keys(error)[0]; // Get the field name from the first key of the error object
            const errorMessage = error[fieldName]; // Get the corresponding error message
            const key = `${groupIndex}-${itemIndex}`; // Create a unique key for each accordion item
            if (!newFieldErrors[key]) {
              newFieldErrors[key] = {};
            }
            newFieldErrors[key][fieldName] = errorMessage; // Assign the error message to the field name
          });

          setFieldErrors(newFieldErrors); // Update field errors state
        }
      } else {
        console.error(
          "Observation data is undefined for groupIndex:",
          groupIndex,
          "and itemIndex:",
          itemIndex
        );
        // toast.error("Observation data is undefined for groupIndex:", groupIndex, "and itemIndex:", itemIndex);
        toast.error("Please add description and deviation type");
      }
    } catch (error) {
      toast.error("Failed to save data.")
    } finally {
      setsaveLoading(false)
    }
  };

  const [selectedTab, setSelectedTab] = useState("tab-0");

  const handleTabClick = (eventKey) => {
    setSelectedTab(eventKey);
  };
  const diableData = (groupIndex, itemIndex, value) => {
    setSaveButtonVisibility((prevVisibility) => {
      const newVisibility = { ...prevVisibility };
      const accordionId = `${groupIndex}-${itemIndex}`;
      newVisibility[accordionId] = value;
      return newVisibility;
    });
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
          {/* Check if InformationSecuritydata is available and not empty */}
          {InformationSecuritydata && InformationSecuritydata.length > 0 ? (
            InformationSecuritydata.map((group, groupIndex) => (
              <div
                key={groupIndex}
                className="border border-gray-300 rounded-lg"
              >
                {/* Accordion Header */}
                <div
                  className="bg-[#F8F9FA] border border-[#E0E0E0] font-semibold rounded-lg text-[#333333] p-4 cursor-pointer flex items-center justify-between"
                  onClick={() => handleToggleAccordion(groupIndex)}
                >
                  <span>
                    {group["Root ISA New"]} - {group["Root Control question"]}
                  </span>
                  {isOpen[groupIndex] ? <AiOutlineUp /> : <AiOutlineDown />}
                </div>

                {/* Accordion Body */}
                <div className={`${isOpen[groupIndex] ? "block" : "hidden"}`}>
                  <div className="flex overflow-x-auto whitespace-nowrap p-4 space-x-4 scrollbar-thin scrollbar-thumb-gray-500 scrollbar-track-[#e4e4e4]">
                    {group.Items?.map((item, itemIndex) => (
                      <button
                        key={itemIndex}
                        className={`flex justify-between items-center w-full px-4 py-2 rounded ${isOpen[groupIndex + "-" + itemIndex]
                          ? "bg-[#050038] text-white font-semibold"
                          : "bg-gray-200"
                          } ${item.isReady
                            ? "border-green-500 border-2"
                            : "border-red-500 border-2"
                          }`}
                        onClick={() =>
                          handleToggleAccordion(groupIndex, itemIndex)
                        }
                      >
                        <span>{item["ISA New"]}</span>
                      </button>
                    ))}
                  </div>

                  {group.Items?.map((item, itemIndex) => (
                    <div
                      key={itemIndex}
                      className={`p-4 ${isOpen[groupIndex + "-" + itemIndex]
                        ? "block"
                        : "hidden"
                        }`}
                    >
                      {/* Control Question and Objective */}
                      <div className="bg-gray-50 p-4 rounded-lg shadow-sm mb-4">
                        <div className="mb-2">
                          <h3 className="text-lg font-semibold text-gray-700 mb-1">
                            Control Question:{" "}
                            <span className="text-gray-600 font-normal">
                              {item["Control question"]}
                            </span>
                          </h3>
                        </div>

                        <div className="mb-2">
                          <h3 className="text-lg font-semibold text-gray-700 mb-1">
                            Objective:{" "}
                            <span className="text-gray-600 font-normal">
                              {item["Objective"]}
                            </span>
                          </h3>
                        </div>

                        {/* Maturity Level Selection */}
                        <div className="flex items-center space-x-4 my-4">
                          <label className="block text-gray-700 font-semibold">
                            Maturity:
                          </label>
                          <select
                            className="p-2 border border-gray-300 rounded"
                            value={item["Maturity Level"] || 0}
                            onChange={(e) =>
                              handleMaturityChange(
                                groupIndex,
                                itemIndex,
                                e.target.value
                              )
                            }
                          >
                            {[...Array(6).keys()].map((val) => (
                              <option key={val} value={val}>
                                {val}
                              </option>
                            ))}
                          </select>
                        </div>
                        {["Must", "Should", "High", "Very High", "SGA"]?.map(
                          (level, levelIndex) =>
                            (level !== "High" ||
                              (item[
                                "Additional requirements for high protection needs"
                              ] &&
                                item[
                                  "Additional requirements for high protection needs"
                                ].length > 0)) &&
                            (level !== "SGA" ||
                              (item[
                                "Additional requirements for Simplified Group Assessments"
                              ] &&
                                item[
                                  "Additional requirements for Simplified Group Assessments"
                                ].length > 0)) &&
                            (level !== "Should" ||
                              item["Should Requirements"] !== null) &&
                            (level !== "Very High" ||
                              (item[
                                "Additional requirements for very high protection needs"
                              ] &&
                                item[
                                  "Additional requirements for very high protection needs"
                                ].length > 0)) && (
                              <div
                                key={levelIndex}
                                className="border border-gray-300 rounded-lg mb-4 shadow-sm"
                              >
                                <div
                                  className="bg-gray-100 p-4 rounded-lg cursor-pointer flex justify-between items-center"
                                  onClick={() =>
                                    handleToggleAccordion(levelIndex)
                                  }
                                >
                                  <span className="font-semibold text-gray-700">
                                    {level}
                                  </span>
                                  <span className="text-gray-500">
                                    {isOpen[levelIndex] ? "-" : "+"}
                                  </span>
                                </div>
                                {isOpen[levelIndex] && (
                                  <div className="p-4">
                                    {level === "Must" && (
                                      <div>
                                        {item["Must Requirements"]?.map(
                                          (requirement, reqIndex) => (
                                            <div
                                              key={reqIndex}
                                              className="mb-4"
                                            >
                                              <span className="font-bold">
                                                Q{reqIndex + 1}:-{" "}
                                              </span>
                                              {requirement.question
                                                ?.split("\n")
                                                ?.map(
                                                  (paragraph, paraIndex) => (
                                                    <span
                                                      key={paraIndex}
                                                      className="block text-gray-700"
                                                    >
                                                      {paragraph.startsWith(
                                                        " - "
                                                      ) ? (
                                                        <span className="ml-4 list-disc">
                                                          &#8226;{" "}
                                                          {paragraph.substring(
                                                            3
                                                          )}
                                                        </span>
                                                      ) : (
                                                        paragraph
                                                      )}
                                                    </span>
                                                  )
                                                )}
                                              <br />
                                              <label className="font-bold text-gray-700">
                                                Answer:
                                              </label>
                                              {!requirement.answer ||
                                                requirement.answer.trim()
                                                  .length === 0 ? (
                                                <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 my-2">
                                                  <span className="text-red-700">
                                                    Warning: There is no data
                                                    for auditing.
                                                  </span>
                                                </div>
                                              ) : (
                                                <div className="bg-gray-50 p-4 rounded-lg border">
                                                  <div
                                                    dangerouslySetInnerHTML={{
                                                      __html:
                                                        requirement.answer ||
                                                        "",
                                                    }}
                                                  />
                                                </div>
                                              )}
                                            </div>
                                          )
                                        )}
                                      </div>
                                    )}

                                    {level === "Should" && (
                                      <div>
                                        {item["Should Requirements"]?.map(
                                          (requirement, reqIndex) => (
                                            <div
                                              key={reqIndex}
                                              className="mb-4"
                                            >
                                              <span className="font-bold">
                                                Q{reqIndex + 1}:-{" "}
                                              </span>
                                              {requirement.question
                                                ?.split("\n")
                                                ?.map(
                                                  (paragraph, paraIndex) => (
                                                    <span
                                                      key={paraIndex}
                                                      className="block text-gray-700"
                                                    >
                                                      {paragraph.startsWith(
                                                        " - "
                                                      ) ? (
                                                        <span className="ml-4 list-disc">
                                                          &#8226;{" "}
                                                          {paragraph.substring(
                                                            3
                                                          )}
                                                        </span>
                                                      ) : (
                                                        paragraph
                                                      )}
                                                    </span>
                                                  )
                                                )}
                                              <br />
                                              <label className="font-bold text-gray-700">
                                                Answer:
                                              </label>
                                              {!requirement.answer ||
                                                requirement.answer.trim()
                                                  .length === 0 ? (
                                                <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 my-2">
                                                  <span className="text-red-700">
                                                    Warning: There is no data
                                                    for auditing.
                                                  </span>
                                                </div>
                                              ) : (
                                                <div className="bg-gray-50 p-4 rounded-lg border">
                                                  <div
                                                    dangerouslySetInnerHTML={{
                                                      __html:
                                                        requirement.answer ||
                                                        "",
                                                    }}
                                                  />
                                                </div>
                                              )}
                                            </div>
                                          )
                                        )}
                                      </div>
                                    )}

                                    {level === "High" &&
                                      item[
                                      "Additional requirements for high protection needs"
                                      ] &&
                                      item[
                                        "Additional requirements for high protection needs"
                                      ].length > 0 && (
                                        <div>
                                          {item[
                                            "Additional requirements for high protection needs"
                                          ]?.map((requirement, reqIndex) => (
                                            <div
                                              key={reqIndex}
                                              className="mb-4"
                                            >
                                              <span className="font-bold">
                                                Q{reqIndex + 1}:-{" "}
                                              </span>
                                              {requirement?.question
                                                ?.split("\n")
                                                ?.map(
                                                  (paragraph, paraIndex) => (
                                                    <span
                                                      key={paraIndex}
                                                      className="block text-gray-700"
                                                    >
                                                      {paragraph.startsWith(
                                                        " - "
                                                      ) ? (
                                                        <span className="ml-4 list-disc">
                                                          &#8226;{" "}
                                                          {paragraph.substring(
                                                            3
                                                          )}
                                                        </span>
                                                      ) : (
                                                        paragraph
                                                      )}
                                                    </span>
                                                  )
                                                )}
                                              <br />
                                              <label className="font-bold text-gray-700">
                                                Answer:
                                              </label>
                                              {!requirement.answer ||
                                                requirement.answer.trim()
                                                  .length === 0 ? (
                                                <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 my-2">
                                                  <span className="text-red-700">
                                                    Warning: There is no data
                                                    for auditing.
                                                  </span>
                                                </div>
                                              ) : (
                                                <div className="bg-gray-50 p-4 rounded-lg border">
                                                  <div
                                                    dangerouslySetInnerHTML={{
                                                      __html:
                                                        requirement.answer ||
                                                        "",
                                                    }}
                                                  />
                                                </div>
                                              )}
                                            </div>
                                          ))}
                                        </div>
                                      )}

                                    {level === "Very High" &&
                                      item[
                                      "Additional requirements for very high protection needs"
                                      ] &&
                                      item[
                                        "Additional requirements for very high protection needs"
                                      ].length > 0 && (
                                        <div>
                                          {item[
                                            "Additional requirements for very high protection needs"
                                          ]?.map((requirement, reqIndex) => (
                                            <div
                                              key={reqIndex}
                                              className="mb-4"
                                            >
                                              <span className="font-bold">
                                                Q{reqIndex + 1}:-{" "}
                                              </span>
                                              {requirement?.question
                                                ?.split("\n")
                                                ?.map(
                                                  (paragraph, paraIndex) => (
                                                    <span
                                                      key={paraIndex}
                                                      className="block text-gray-700"
                                                    >
                                                      {paragraph.startsWith(
                                                        " - "
                                                      ) ? (
                                                        <span className="ml-4 list-disc">
                                                          &#8226;{" "}
                                                          {paragraph.substring(
                                                            3
                                                          )}
                                                        </span>
                                                      ) : (
                                                        paragraph
                                                      )}
                                                    </span>
                                                  )
                                                )}
                                              <br />
                                              <label className="font-bold text-gray-700">
                                                Answer:
                                              </label>
                                              {!requirement.answer ||
                                                requirement.answer.trim()
                                                  .length === 0 ? (
                                                <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 my-2">
                                                  <span className="text-red-700">
                                                    Warning: There is no data
                                                    for auditing.
                                                  </span>
                                                </div>
                                              ) : (
                                                <div className="bg-gray-50 p-4 rounded-lg border">
                                                  <div
                                                    dangerouslySetInnerHTML={{
                                                      __html:
                                                        requirement.answer ||
                                                        "",
                                                    }}
                                                  />
                                                </div>
                                              )}
                                            </div>
                                          ))}
                                        </div>
                                      )}

                                    {vda_version === "6.0.3" &&
                                      level === "SGA" &&
                                      item[
                                        "Additional requirements for Simplified Group Assessments"
                                      ]?.length > 0 && (
                                        <div>
                                          {item[
                                            "Additional requirements for Simplified Group Assessments"
                                          ]?.map((requirement, reqIndex) => (
                                            <div
                                              key={reqIndex}
                                              className="mb-4"
                                            >
                                              <span className="font-bold">
                                                Q{reqIndex + 1}:-{" "}
                                              </span>
                                              {requirement?.question
                                                ?.split("\n")
                                                ?.map(
                                                  (paragraph, paraIndex) => (
                                                    <span
                                                      key={paraIndex}
                                                      className="block text-gray-700"
                                                    >
                                                      {paragraph.startsWith(
                                                        " - "
                                                      ) ? (
                                                        <span className="ml-4 list-disc">
                                                          &#8226;{" "}
                                                          {paragraph.substring(
                                                            3
                                                          )}
                                                        </span>
                                                      ) : (
                                                        paragraph
                                                      )}
                                                    </span>
                                                  )
                                                )}
                                              <br />
                                              <label className="font-bold text-gray-700">
                                                Answer:
                                              </label>
                                              {!requirement.answer ||
                                                requirement.answer.trim()
                                                  .length === 0 ? (
                                                <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 my-2">
                                                  <span className="text-red-700">
                                                    Warning: There is no data
                                                    for auditing.
                                                  </span>
                                                </div>
                                              ) : (
                                                <div className="bg-gray-50 p-4 rounded-lg border">
                                                  <div
                                                    dangerouslySetInnerHTML={{
                                                      __html:
                                                        requirement.answer ||
                                                        "",
                                                    }}
                                                  />
                                                </div>
                                              )}
                                            </div>
                                          ))}
                                        </div>
                                      )}
                                  </div>
                                )}
                              </div>
                            )
                        )}
                      </div>

                      {/* Reference Documentation */}
                      <div className="my-4">
                        <ReferanceDocumentList
                          onChange={(referenceData) =>
                            handleInputAction(
                              groupIndex,
                              itemIndex,
                              "Reference Documentation",
                              referenceData
                            )
                          }
                          data={item["Reference Documentation"]}
                        />
                      </div>

                      {/* Comments List */}
                      <CommentsList
                        onChange={(commentsData) =>
                          handleInputAction(
                            groupIndex,
                            itemIndex,
                            "comments",
                            commentsData
                          )
                        }
                        data={item["comments"]}
                      />

                      {/* Findings List */}
                      <FindingsList
                        onChange={(findingsData) =>
                          handleInputAction(
                            groupIndex,
                            itemIndex,
                            "findings",
                            findingsData
                          )
                        }
                        data={item["findings"]}
                      />

                      {/* Observation Form based on assessment level */}
                      {assessment_level === "AL3" && vda_type && id ? (
                        <AL3ObservationForm
                          key={itemIndex}
                          onUpdateObservationData={(data) =>
                            handleObservationDataUpdate(
                              groupIndex,
                              itemIndex,
                              data
                            )
                          }
                          observationData={item}
                          deviationFound={item.deviationFound}
                          majorNonConformity={item.deviationType}
                          minorNonConformity={item.deviationType}
                          observation={item.deviationType}
                          roomForImprovement={item.deviationType}
                          description={item.deviationDescription}
                          fieldErrors={
                            fieldErrors[`${groupIndex}-${itemIndex}`] || {}
                          }
                          handleFieldChange={(name, value) =>
                            handleFieldChange(
                              groupIndex,
                              itemIndex,
                              name,
                              value
                            )
                          }
                          handleFieldBlur={(name, value) =>
                            handleFieldBlur(groupIndex, itemIndex, name, value)
                          }
                        />
                      ) : assessment_level === "AL2" && vda_type && id ? (
                        <AL2ObservationForm
                          key={itemIndex}
                          onUpdateObservationData={(data) =>
                            handleObservationDataUpdate(
                              groupIndex,
                              itemIndex,
                              data
                            )
                          }
                          observationData={item}
                          deviationFound={item.deviationFound}
                          al2Plausible={item.deviationFound}
                          majorNonConformity={item.deviationType}
                          minorNonConformity={item.deviationType}
                          observation={item.deviationType}
                          roomForImprovement={item.deviationType}
                          description={item.deviationType}
                          fieldErrors={
                            fieldErrors[`${groupIndex}-${itemIndex}`] || {}
                          }
                          handleFieldChange={(name, value) =>
                            handleFieldChange(
                              groupIndex,
                              itemIndex,
                              name,
                              value
                            )
                          }
                          handleFieldBlur={(name, value) =>
                            handleFieldBlur(groupIndex, itemIndex, name, value)
                          }
                        />
                      ) : null}

                      {/* Save Button */}
                      <div className="flex justify-end">
                        <button
                          onClick={() => handleSave(groupIndex, itemIndex)}
                          className="px-4 py-2 bg-[#007ACC] hover:bg-[#005A99] active:bg-[#004F8A] text-white rounded"
                        >
                          {saveLoading ? <Loader /> : "Save"}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
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

export default AuditTisaxInformationSecurity;
