import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { baseurl, initURL } from "../../../../../BaseUrl";
import { toast } from "react-toastify";
import CustomAxios from "@/globalcomponents/CustomAxios";
import { AiOutlineDown, AiOutlineUp } from "react-icons/ai";
import _ from "lodash";
import { ReferanceDocumentList, CommentsList, FindingsList } from "./text-list";
import { AL2ObservationForm, AL3ObservationForm } from "../ObservationForm";
import useGlobalLoading from "@/globalcomponents/loader/useGlobalLoading";
import Loader from "@/globalcomponents/loader/Loader";

function AuditTisaxProtoTypeProtection(props) {
  const { eventKey, activeKey } = props;
  const router = useRouter();
  const { id, vda_type, assessment_level, rootId } = router.query;
  const [PrototypeProtectiondata, setPrototypeProtectionData] = useState([]);
  const [isOpen, setIsOpen] = useState({});
  const [saveButtonVisibility, setSaveButtonVisibility] = useState({});
  const [isHydrated, setIsHydrated] = useState(false);
  const [selectedTab, setSelectedTab] = useState("tab-0");
  const [fieldErrors, setFieldErrors] = useState({});
  const [openAccordion, setOpenAccordion] = useState(null); // null means nothing is open
  const [observationData, setObservationData] = useState(null); // State to hold observation data
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

        response.data = response?.data?.prototypeProtectionControls || []

        const groupedData = {};
        response?.data?.sort((a, b) => {
          if (a["Parent ISA New"] !== b["Parent ISA New"]) {
            return a["Parent ISA New"].localeCompare(b["Parent ISA New"]);
          } else {
            return a["ISA New"].localeCompare(b["ISA New"]);
          }
        });

        response?.data?.forEach((item) => {
          const groupKey = `${item["Parent ISA New"]}_${item["Parent Control question"]}`;
          if (!groupedData[groupKey]) {
            groupedData[groupKey] = {
              parentISA: item["Parent ISA New"],
              parentControlQuestion: item["Parent Control question"],
              Items: [],
            };
          }
          groupedData[groupKey].Items.push(item);
        });

        const finalResult = Object.values(groupedData);

        setPrototypeProtectionData(finalResult);
        const initialObservationData = response.data.map((item) => ({
          deviationFound: item.deviationFound || false,
          noDeviation: !item.deviationFound,
          majorNonConformity:
            item.deviationType === "Major non-conformity" || false,
          minorNonConformity:
            item.deviationType === "Minor non-conformity" || false,
          observation: item.deviationType === "Observation" || false,
          roomForImprovement:
            item.deviationType === "Room for improvement" || false,
          description: item.deviationDescription || "",
          deviationType: item.deviationType || "",
          al2Plausible: item.plausible || false,
        }));
        setObservationData(initialObservationData);
      } catch (error) {
        toast.error("Failed to fetch data!")
      } finally {
        hideLoader()
      }
    };

    if (id && rootId) {
      fetchData(rootId);
    }
  }, [isHydrated, id, rootId]);
  const handleInputAction = (groupIndex, itemIndex, field, referenceData) => {
    setPrototypeProtectionData((prevData) => {
      const newData = _.cloneDeep(prevData);
      if (newData[groupIndex] && newData[groupIndex].Items[itemIndex]) {
        newData[groupIndex].Items[itemIndex][field] = referenceData;
      }
      return newData;
    });
    diableData(groupIndex, itemIndex, true);
  };
  const handleToggleAccordion = (groupIndex, itemIndex = null) => {
    setIsOpen((prevState) => {
      const newState = {};
      if (itemIndex === null) {
        // Close all other groups and open the clicked one
        Object.keys(prevState).forEach((key) => {
          newState[key] = false;
        });
        newState[groupIndex] = !prevState[groupIndex];
      } else {
        // Close all other items and open the clicked one in the group
        Object.keys(prevState).forEach((key) => {
          newState[key] = false;
        });
        newState[`${groupIndex}-${itemIndex}`] =
          !prevState[`${groupIndex}-${itemIndex}`];
        newState[groupIndex] = true;
      }
      return newState;
    });
  };
  const handleFieldChange = (index, name, value) => {
    const newFormData = [...PrototypeProtectiondata];

    // Check if the group item exists at the provided index
    if (!newFormData[index]) {
      newFormData[index] = {};
    }

    // Update the field in the specific item
    newFormData[index][name] = value;

    // Clear the error for the current field if it exists
    const newFieldErrors = { ...fieldErrors };
    if (newFieldErrors[`${index}`]) {
      delete newFieldErrors[`${index}`][name];
    }

    setPrototypeProtectionData(newFormData);
    setFieldErrors(newFieldErrors);
  };

  const handleFieldBlur = (index, name, value) => {
    const newFieldErrors = { ...fieldErrors };
    const key = `${index}`;

    // Check if the description or deviation type fields are empty
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

  const handleMaturityChange = (groupIndex, itemIndex, value) => {
    const sanitizedValue = value.replace(/[^0-5]/g, "").charAt(0);
    setPrototypeProtectionData((prevData) => {
      const newData = [...prevData];
      newData[groupIndex].Items[itemIndex]["Maturity Level"] = sanitizedValue;
      return newData;
    });
    diableData(groupIndex, itemIndex, true);
  };

  const diableData = (groupIndex, itemIndex, value) => {
    setSaveButtonVisibility((prevVisibility) => {
      const newVisibility = { ...prevVisibility };
      const accordionId = `${groupIndex}-${itemIndex}`;
      newVisibility[accordionId] = value;
      return newVisibility;
    });
  };

  const handleTabClick = (eventKey) => {
    setSelectedTab(eventKey);
  };

  const handleObservationDataUpdate = (data, groupIndex, itemIndex) => {
    // Check if groupIndex and itemIndex exist in PrototypeProtectiondata
    // if (
    //   PrototypeProtectiondata[groupIndex] &&
    //   PrototypeProtectiondata[groupIndex].Items[itemIndex]
    // ) {
    // Update deviation-related fields
    setPrototypeProtectionData((prevData) => {
      const newData = _.cloneDeep(prevData);
      if (newData[groupIndex] && newData[groupIndex].Items[itemIndex]) {
        newData[groupIndex].Items[itemIndex].deviationFound =
          data.deviationFound;
        newData[groupIndex].Items[itemIndex].deviationType = data.deviationType;
        newData[groupIndex].Items[itemIndex].deviationDescription =
          data.description;
      } else {
        console.error("Group or Item not found");
      }

      return newData;
    });

    diableData(groupIndex, itemIndex, true);
    // } else {
    //   console.error(
    //     "Error: Group or Item not found in PrototypeProtectiondata"
    //   );
    // }
  };
  // useEffect(() => {
  //   
  // }, [PrototypeProtectiondata]);
  const handleSave = async (groupIndex, itemIndex) => {
    try {
      const updatedData = [...PrototypeProtectiondata];
      const editedGroup = updatedData[groupIndex];
      const editedItem = editedGroup.Items[itemIndex];

      // Ensure arrays are not null
      const requestBody = {
        "ISA New": editedItem["ISA New"],
        "Maturity Level": editedItem["Maturity Level"] || 0,
        "Reference Documentation": Array.isArray(
          editedItem["Reference Documentation"]
        )
          ? editedItem["Reference Documentation"]
          : [],
        comments: Array.isArray(editedItem["comments"])
          ? editedItem["comments"]
          : [],
        findings: Array.isArray(editedItem["findings"])
          ? editedItem["findings"]
          : [],
        deviationFound: Boolean(editedItem.deviationFound),
        deviationType: editedItem.deviationFound
          ? editedItem.deviationType
          : null,
        deviationDescription: editedItem.deviationFound
          ? editedItem.deviationDescription
          : null,
      };

      // Add AL2-specific property if needed
      if (assessment_level === "AL2" && editedItem.al2Plausible !== undefined) {
        requestBody.plausible = editedItem.al2Plausible;
      }

      setsaveLoading(true)

      const response = await CustomAxios.patch(
        `${baseurl}/${initURL}/tisax-audit/prototypeprotectionQnAImport/${id}?vda_type=${vda_type}`,
        requestBody
      );

      if (response.status === 200) {
        diableData(groupIndex, itemIndex, false);
        toast.success("Data submitted successfully!");
      }
    } catch (error) {
      console.error("Error saving data:", error);
    } finally {
      setsaveLoading(false)
    }
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center w-full">
        <Loader />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="space-y-4">
        {PrototypeProtectiondata.length > 0 ? (
          PrototypeProtectiondata?.map((group, groupIndex) => (
            <div key={groupIndex} className="border border-gray-300 rounded-lg">
              <div
                className="bg-[#F8F9FA] border border-[#E0E0E0] font-semibold rounded-lg text-[#333333] p-4 cursor-pointer flex items-center justify-between"
                onClick={() => handleToggleAccordion(groupIndex)}
              >
                <span>
                  {group.parentISA} - {group.parentControlQuestion}
                </span>
                {isOpen[groupIndex] ? <AiOutlineUp /> : <AiOutlineDown />}
              </div>

              <div className={`${isOpen[groupIndex] ? "block" : "hidden"}`}>
                <div className="flex overflow-x-auto whitespace-nowrap p-4 space-x-4">
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
                    className={`p-4 ${isOpen[groupIndex + "-" + itemIndex] ? "block" : "hidden"
                      }`}
                  >
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
                      {["Must", "Should", "Additional Requirements"].map(
                        (level, levelIndex) => (
                          <div key={levelIndex} className="mb-4">
                            <h3 className="text-lg font-semibold">{level}</h3>
                            {item[`${level} Requirements`] &&
                              item[`${level} Requirements`].map(
                                (requirement, reqIndex) => (
                                  <div key={reqIndex} className="mb-2">
                                    <span>
                                      <b>Q{reqIndex + 1}:</b>{" "}
                                      {requirement.question}
                                    </span>
                                    <div className="my-2">
                                      <label className="font-semibold">
                                        Answer:
                                      </label>
                                      <div
                                        className="p-2 bg-gray-100 rounded-lg"
                                        dangerouslySetInnerHTML={{
                                          __html:
                                            requirement.answer ||
                                            "<div class='text-red-500'>Warning: There is no data for auditing.</div>",
                                        }}
                                      />
                                    </div>
                                  </div>
                                )
                              )}
                          </div>
                        )
                      )}

                      <ReferanceDocumentList
                        onChange={(referenceData) =>
                          handleInputAction(
                            groupIndex,
                            itemIndex,
                            "Reference Documentation",
                            referenceData
                          )
                        }
                        data={item["Reference Documentation"] || []} // Ensure data is passed as an array
                      />

                      <CommentsList
                        onChange={(commentsData) =>
                          handleInputAction(
                            groupIndex,
                            itemIndex,
                            "comments",
                            commentsData
                          )
                        }
                        data={item["comments"] || []}
                      />

                      <FindingsList
                        onChange={(findingsData) =>
                          handleInputAction(
                            groupIndex,
                            itemIndex,
                            "findings",
                            findingsData
                          )
                        }
                        data={item["findings"] || []}
                      />
                      {assessment_level === "AL3" && vda_type && id ? (
                        <AL3ObservationForm
                          key={itemIndex}
                          observationData={item}
                          deviationFound={item.deviationFound}
                          majorNonConformity={
                            item.deviationType === "Major non-conformity"
                          }
                          minorNonConformity={
                            item.deviationType === "Minor non-conformity"
                          }
                          observation={item.deviationType === "Observation"}
                          roomForImprovement={
                            item.deviationType === "Room for improvement"
                          }
                          description={item.deviationDescription || ""}
                          fieldErrors={fieldErrors[`${itemIndex}`] || {}}
                          handleFieldChange={(name, value) =>
                            handleFieldChange(itemIndex, name, value)
                          }
                          handleFieldBlur={(name, value) =>
                            handleFieldBlur(itemIndex, name, value)
                          }
                          onUpdateObservationData={(data) =>
                            handleObservationDataUpdate(
                              data,
                              groupIndex,
                              itemIndex
                            )
                          }
                        />
                      ) : null}
                    </div>

                    <div className="flex justify-end">
                      <button
                        onClick={() => handleSave(groupIndex, itemIndex)}
                        className="px-4 py-2 bg-[#007ACC] hover:bg-[#005A99] text-white rounded"
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
  );
}

export default AuditTisaxProtoTypeProtection;
