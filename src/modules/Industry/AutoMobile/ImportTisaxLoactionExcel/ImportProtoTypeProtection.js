import { baseurl, initURL } from "@/config/config";
import { setImportPrototypeProtectionData } from "@/store/SliceComponent/ImportSaveSlice";
import CustomAxios from "@/config/CustomAxios";
import _ from "lodash";
import { useRouter } from "next/router";
import React, { useEffect, useRef, useState } from "react";
import { AiOutlineDown, AiOutlineUp } from "react-icons/ai"; // Import dropdown icons
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import {
  FindingsList,
  ReferenceDocumentList,
} from "../Tisax/TisaxLocation/Lists";
import { AL3ObservationForm } from "../TisaxAudit/Location/ObservationForm";
import Accordion from "@/components/ui/Accordion";

const ImportProtoTypeProtection = React.forwardRef(({ eventKey }, ref) => {
  // const { eventKey } = props;
  const router = useRouter();
  const { id, vda_type, assessment_level } = router.query;
  const dispatch = useDispatch();
  const [isHydrated, setIsHydrated] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [observationData, setObservationData] = useState(null); // State to hold observation data
  const [activeTabs, setActiveTabs] = useState({});
  const [PrototypeProtectiondata, setPrototypeProtectionData] = useState([]);
  const defaultValuesResponse = useSelector(
    (state) => state.data.prototypeProtection
  );
console.log(defaultValuesResponse, "defaultValuesResponse");
  useEffect(() => {
    if (vda_type && Array.isArray(defaultValuesResponse[0]?.Items)) {
      setPrototypeProtectionData(defaultValuesResponse[0].Items);
    }     
    //  setPrototypeProtectionData(defaultValuesResponse[0].Items);

  }, [router.isReady, defaultValuesResponse, vda_type]);

  useEffect(() => {
    if (!isHydrated) {
      setIsHydrated(true); // Set flag to true once component is hydrated
      return; // Skip execution during hydration
    }

    // const fetchData = async (id) => {
    //   try {
    //     // Fetch default values for your form
    //     const response = await CustomAxios.get(
    //       `${baseurl}/${initURL}/tisax-audit/prototypeProtection/${id}?vda_type=${vda_type}`
    //     );

    //     if (Array.isArray(response.data)) {
    //       response.data.sort((a, b) => {
    //         if (a["Parent ISA New"] !== b["Parent ISA New"]) {
    //           return a["Parent ISA New"].localeCompare(b["Parent ISA New"]);
    //         } else {
    //           return a["ISA New"].localeCompare(b["ISA New"]);
    //         }
    //       });

    //       setPrototypeProtectionData(response.data);
    //       setEditedData(response.data);
    //       handleSavemain();

    //       const initialObservationData = response.data.map((item) => ({
    //         deviationFound: item.deviationFound || false,
    //         noDeviation: !item.deviationFound,
    //         majorNonConformity:
    //           item.deviationType === "Major non-conformity" || false,
    //         minorNonConformity:
    //           item.deviationType === "Minor non-conformity" || false,
    //         observation: item.deviationType === "Observation" || false,
    //         roomForImprovement:
    //           item.deviationType === "Room for improvement" || false,
    //         description: item.deviationDescription || "",
    //         deviationType: item.deviationType || "",
    //         al2Plausible: item.plausible || false,
    //       }));
    //       setObservationData(initialObservationData);
    //     } else {
    //       console.error("Expected an array but got:", typeof response.data);
    //     }
    //   } catch (error) {
    //     console.log(error);
    //   }
    // };

    // if (router.query.id) {
    //   console.log("router.query.id", router.query.id);
    //   fetchData(router.query.id);
    // }
  }, [isHydrated, router.query.id, assessment_level]);

  const handleMaturityChange = (index, value) => {
    // parseInt and clamp to [0,5]
    let sanitizedValue = parseInt(value, 10);
    if (isNaN(sanitizedValue) || sanitizedValue < 0) sanitizedValue = 0;
    if (sanitizedValue > 5) sanitizedValue = 5;

    setPrototypeProtectionData((prevData) => {
      const newData = [...prevData];
      newData[index] = {
        ...newData[index],
        "Maturity Level": sanitizedValue,
      };
      return newData;
    });
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

  const handleInputAction = (index, field, referenceData) => {
    setPrototypeProtectionData((prevData) => {
      const newData = _.cloneDeep(prevData);
      newData[index][field] = referenceData;
      return newData;
    });
  };

  const handleSave = async (index) => {
    try {
      const updatedData = [...PrototypeProtectiondata];
      const editedItem = updatedData[index];

      const observation = observationData[index];

      const requestBody = {
        "ISA New": editedItem["ISA New"],
        "Maturity Level": editedItem["Maturity Level"],
        "Additional requirements for vehicles classified as requiring protection":
          editedItem[
            "Additional requirements for vehicles classified as requiring protection"
          ] || "",

        "Reference Documentation":
          Array.isArray(editedItem["Reference Documentation"]) &&
          editedItem["Reference Documentation"].length > 0
            ? editedItem["Reference Documentation"]
            : null,
        findings:
          Array.isArray(editedItem["findings"]) &&
          editedItem["findings"].length > 0
            ? editedItem["findings"]
            : null,
        comments:
          Array.isArray(editedItem["comments"]) &&
          editedItem["comments"].length > 0
            ? editedItem["comments"]
            : null,
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
        `${baseurl}/${initURL}/tisax-audit/prototypeprotectionQnAImport/${id}?vda_type=${vda_type}`,
        requestBody
      );
      if (response.status === 200) {
        toast.success("data submitted successfully!", {
          position: toast.POSITION.TOP_RIGHT,
        });
        // Clear the field errors
        const newFieldErrors = { ...fieldErrors };
        delete newFieldErrors[`${index}`];
        setFieldErrors(newFieldErrors);
      } else if (response.status === 400) {
        console.log("response.data.errors", response.data.errors);
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
        console.log("fieldErrors", newFieldErrors);
      }
    } catch (error) {
      console.error("Error saving data:", error);
    }
  };
  // useEffect(() => {
  //   handleSavemain();
  //   console.log("Blast");
  // }, [PrototypeProtectiondata]);

  const handleSavemain = () => {
    if (PrototypeProtectiondata && PrototypeProtectiondata.length > 0) {
      const updatedData = [...PrototypeProtectiondata];
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

      dispatch(setImportPrototypeProtectionData(newDataItems));
    }
  };
  const handleObservationDataUpdate = (data, index) => {
    const updatedObservationData = [...observationData];
    updatedObservationData[index] = data;
    setObservationData(updatedObservationData);
  };

  const handleTabChange = (parentISA, tabValue) => {
    setActiveTabs((prevTabs) => ({
      ...prevTabs,
      [parentISA]: tabValue,
    }));
  };
  const groupedData = _.groupBy(PrototypeProtectiondata, "Parent ISA New");

  return (
    <div className="container mx-auto p-4">
      <div className="space-y-4">
        {/* Group the data by Parent ISA New */}
        {Object.keys(groupedData).map((parentISA, groupIndex) => {
          const groupedItems = groupedData[parentISA];
          const currentActiveTab =
            activeTabs[parentISA] || groupedItems[0]["ISA New"]; // Default to the first ISA New in each group

          return (
            <div
              key={groupIndex}
              className="border border-gray-300 rounded-lg mb-4"
            >
              <Accordion
                key={groupIndex}
                title={`${parentISA} – ${
                  groupedItems[0]["Parent Control question"] ??
                  "No Control Question"
                }`}
              >
                {/* Tabs */}
                <div className="flex space-x-4 mt-4 mb-4 border-b">
                  {groupedItems.map((item, itemIndex) => (
                    <button
                      key={itemIndex}
                      className={`px-4 py-2 font-semibold ${
                        currentActiveTab === item["ISA New"]
                          ? "text-blue-600 border-b-2 border-blue-600"
                          : "text-gray-600"
                      }`}
                      onClick={() =>
                        handleTabChange(parentISA, item["ISA New"])
                      }
                    >
                      {item["ISA New"]}
                    </button>
                  ))}
                </div>

                {/* Tab Content */}
                {groupedItems.map((item, itemIndex) =>
                  currentActiveTab === item["ISA New"] ? (
                    <div key={itemIndex} className="p-4">
                      <button
                        className="bg-blue-500 text-white px-4 py-2 rounded mt-4"
                        onClick={() => handleSave(item)}
                      >
                        {" "}
                        Save
                      </button>
                      {/* Control Question */}
                      <div className="mb-2">
                        <h3 className="text-lg font-semibold text-gray-700">
                          Control Question:{" "}
                          <span className="text-gray-600 font-normal">
                            {item["Control question"] || "N/A"}
                          </span>
                        </h3>
                      </div>

                      {/* Objective */}
                      <div className="mb-2">
                        <h3 className="text-lg font-semibold text-gray-700">
                          Objective:{" "}
                          <span className="text-gray-600 font-normal">
                            {item["Objective"] || "N/A"}
                          </span>
                        </h3>
                      </div>

                      {/* Maturity Level Selector */}
                      <div className="flex items-center space-x-4 my-4">
                        <label className="block text-gray-700 font-semibold">
                          Maturity:
                        </label>
                        <select
                          className="p-2 border border-gray-300 rounded"
                          value={item["Maturity Level"] || 0}
                          onChange={(e) =>
                            handleMaturityChange(itemIndex, e.target.value)
                          }
                        >
                          {[...Array(6).keys()].map((val) => (
                            <option key={val} value={val}>
                              {val}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Must, Should, and Requirements */}
                      {["Must", "Should"].map((level, levelIndex) =>
                        item[`${level} Requirements`] &&
                        Array.isArray(item[`${level} Requirements`]) ? (
                          <div key={levelIndex} className="mb-4">
                            <h3 className="text-lg font-semibold">
                              {level} Requirements
                            </h3>
                            {item[`${level} Requirements`].map(
                              (requirement, reqIndex) => (
                                <div key={reqIndex} className="mb-2">
                                  {/* Display Question */}
                                  <span>
                                    <b>Q{reqIndex + 1}:</b>{" "}
                                    {requirement || "No question provided"}
                                  </span>
                                </div>
                              )
                            )}
                          </div>
                        ) : null
                      )}
                      {/* Additional Requirements (standalone) */}
                      <div className="mb-4">
                        <h3 className="text-lg font-semibold">
                          Additional Requirements
                        </h3>
                        <textarea
                          className="w-full p-2 border rounded"
                          rows={3}
                          value={
                            item[
                              "Additional requirements for vehicles classified as requiring protection"
                            ] || ""
                          }
                          onChange={(e) =>
                            handleInputAction(
                              itemIndex,
                              "Additional requirements for vehicles classified as requiring protection",
                              e.target.value
                            )
                          }
                        />
                        {fieldErrors[itemIndex]?.[
                          "Additional requirements for vehicles classified as requiring protection"
                        ] && (
                          <span className="text-red-500 text-xs">
                            {
                              fieldErrors[itemIndex][
                                "Additional requirements for vehicles classified as requiring protection"
                              ]
                            }
                          </span>
                        )}
                      </div>

                      <div className="my-2">
                        <label className="font-semibold">
                          Description of Implementation
                        </label>
                        {/* Display First Element of Combine Answer */}
                        {item["combine answer"] && item["combine answer"][0] ? (
                          <div
                            className="p-2 bg-gray-100 rounded-lg border"
                            dangerouslySetInnerHTML={{
                              __html: item["combine answer"][0],
                            }}
                          />
                        ) : (
                          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 my-2">
                            <span className="text-red-700">
                              Warning: There is no data for auditing.
                            </span>
                          </div>
                        )}
                      </div>
                      {/* Reference Documentation */}
                      <ReferenceDocumentList
                        onChange={(referenceData) =>
                          handleInputAction(
                            itemIndex,
                            "Reference Documentation",
                            referenceData
                          )
                        }
                        data={item["Reference Documentation"]}
                      />

                      {/* Findings List */}
                      <FindingsList
                        onChange={(findingsData) =>
                          handleInputAction(itemIndex, "findings", findingsData)
                        }
                        data={item["findings"]}
                      />

                      {/* Observation Form for AL3 level */}
                      {assessment_level === "AL3" && (
                        <AL3ObservationForm
                          key={itemIndex}
                          onUpdateObservationData={(data) =>
                            handleObservationDataUpdate(data, itemIndex)
                          }
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
                        />
                      )}
                    </div>
                  ) : null
                )}
              </Accordion>
            </div>
          );
        })}
      </div>
    </div>
  );
});

ImportProtoTypeProtection.displayName = "ImportProtoTypeProtection";
export default ImportProtoTypeProtection;
