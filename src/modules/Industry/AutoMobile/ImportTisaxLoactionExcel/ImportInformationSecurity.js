import { baseurl, initURL } from "@/config/config";
import { setImportInformationSecurityDatav603 } from "@/store/SliceComponent/ImportSaveSlice";
import CustomAxios from "@/config/CustomAxios";
import _ from "lodash";
import { useRouter } from "next/router";
import React, { useEffect, useRef, useState } from "react";
import { AiOutlineDown, AiOutlineUp } from "react-icons/ai"; // Import dropdown icons
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import {
  CommentsList,
  FindingsList,
  ReferenceDocumentList,
} from "../Tisax/TisaxLocation/Lists";
import {
  AL2ObservationForm,
  AL3ObservationForm,
} from "../TisaxAudit/Location/ObservationForm";

const ImportInformationSecurity = React.forwardRef((ref) => {
  const router = useRouter();
  const { id, vda_type, assessment_level, vda_version } = router.query;
  const [InformationSecurityData, setInformationSecurityData] = useState([]);
  const dispatch = useDispatch();
  const [isOpen, setIsOpen] = useState({});
  const prevInformationSecurityDataRef = useRef([]);
  const isFirstRun = useRef(true);

  const v603defaultValuesResponse = useSelector(
    (state) => state.data.informationSecurity
  );
  const [fieldErrors, setFieldErrors] = useState({});
  const isSyncingRef = useRef(false);
  const handleSaveMain = (data) => {
    if (!data || data.length === 0) {
      console.warn("⚠️ No data passed to handleSaveMain");
      return;
    }

    const newDataItems = data.flatMap((item) =>
      item.Items.map((item) => ({ ...item }))
    );

    newDataItems.forEach((item) => {
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

    const currentReduxData = store.getState().data.informationSecurity; // Access latest Redux directly

    if (!_.isEqual(v603defaultValuesResponse, newDataItems)) {
      console.log("🚀 Dispatching updated data");
      dispatch(setImportInformationSecurityDatav603(newDataItems));
    } else {
      console.log("🛑 No dispatch needed, data identical");
    }
  };
  useEffect(() => {
    if (
      vda_version === "6.0.3" &&
      Array.isArray(v603defaultValuesResponse) &&
      InformationSecurityData.length === 0
    ) {
      if (!_.isEqual(InformationSecurityData, v603defaultValuesResponse)) {
        setInformationSecurityData(v603defaultValuesResponse);
        console.log("✅ Initial load from Redux to local state");
      }
    }
  }, [vda_version, v603defaultValuesResponse]);

  if (!isSyncingRef.current) {
    console.log("🔄 Detected changes in InformationSecurityData");
    isSyncingRef.current = true;

    handleSaveMain(InformationSecurityData);

    prevInformationSecurityDataRef.current = _.cloneDeep(
      InformationSecurityData
    );

    setTimeout(() => {
      isSyncingRef.current = false;
    }, 100); // Allow React-Redux cycle to complete
  }

  console.log("ImportInformationSecurity", InformationSecurityData);

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

  return (
    <div className="pb-1 p-1">
      <div className="container mx-auto p-4">
        <div className="space-y-4">
          {/* Check if InformationSecuritydata is available and not empty */}
          {InformationSecurityData && InformationSecurityData.length > 0 ? (
            InformationSecurityData.map((group, groupIndex) => (
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
                        className={`flex justify-between items-center w-full px-4 py-2 rounded ${
                          isOpen[groupIndex + "-" + itemIndex]
                            ? "bg-[#050038] text-white font-semibold"
                            : "bg-gray-200"
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
                      className={`p-4 ${
                        isOpen[groupIndex + "-" + itemIndex]
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
                            value={item["Maturity Level"] || 0} // Set to 0 if undefined
                            onChange={(e) => {
                              const sanitizedValue = parseInt(
                                e.target.value,
                                10
                              );
                            }}
                          >
                            {[...Array(6).keys()].map((val) => (
                              <option key={val} value={val}>
                                {val}
                              </option>
                            ))}
                          </select>
                        </div>

                        {[
                          "Must Requirements",
                          "Should Requirements",
                          "High Requirements",
                          "Very High Requirements",
                          "SGA Requirements",
                        ].map((level, levelIndex) =>
                          item[level] && Array.isArray(item[level]) ? (
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
                                  {item[level].map((requirement, reqIndex) => (
                                    <div key={reqIndex} className="mb-4">
                                      {/* Display Question */}
                                      <span className="font-bold">
                                        Q{reqIndex + 1}:-{" "}
                                      </span>
                                      {requirement
                                        .split("\n")
                                        .map((paragraph, paraIndex) => (
                                          <span
                                            key={paraIndex}
                                            className="block text-gray-700"
                                          >
                                            {paragraph.startsWith(" - ") ? (
                                              <span className="ml-4 list-disc">
                                                &#8226; {paragraph.substring(3)}
                                              </span>
                                            ) : (
                                              paragraph
                                            )}
                                          </span>
                                        ))}
                                      <br />

                                      {/* Display Combined Answer */}
                                      <label className="font-bold text-gray-700">
                                        Answer:
                                      </label>
                                      {item["combine answer"] &&
                                      item["combine answer"][0] ? (
                                        <div className="bg-gray-50 p-4 rounded-lg border">
                                          <div
                                            dangerouslySetInnerHTML={{
                                              __html: item["combine answer"][0],
                                            }}
                                          />
                                        </div>
                                      ) : (
                                        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 my-2">
                                          <span className="text-red-700">
                                            Warning: There is no data for
                                            auditing.
                                          </span>
                                        </div>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          ) : null
                        )}
                      </div>

                      {/* Reference Documentation */}
                      <div className="my-4">
                        <ReferenceDocumentList
                          onChange={(referenceData) => {}}
                          data={item["Reference Documentation"]}
                        />
                      </div>

                      {/* Comments List */}
                      <CommentsList
                        onChange={(commentsData) => {}}
                        data={item["comments"]}
                      />

                      {/* Findings List */}
                      <FindingsList
                        onChange={(findingsData) => {}}
                        data={item["findings"]}
                      />

                      {/* Observation Form based on assessment level */}
                      {assessment_level === "AL3" && vda_type && id ? (
                        <AL3ObservationForm
                          key={itemIndex}
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
                        />
                      ) : null}
                    </div>
                  ))}
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-gray-600">No data available</p>
          )}
        </div>
      </div>
    </div>
  );
});

ImportInformationSecurity.displayName = "ImportInformationSecurity";

export default ImportInformationSecurity;
