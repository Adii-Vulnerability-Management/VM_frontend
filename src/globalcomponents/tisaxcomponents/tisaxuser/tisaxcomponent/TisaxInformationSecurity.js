import React, { useEffect, useState } from "react";
import { baseurl, initURL } from "../../../../../BaseUrl";
import { useRouter } from "next/router";
import { toast } from "react-toastify";
import dynamic from "next/dynamic";
import ShouldRequirement from "./ShouldRequirement";
import _ from "lodash";
import High from "./High";
import VeryHigh from "./VeryHigh";
import MustRequirments from "./MustRequirments";
import SgaAdditionalRequirement from "./SgaAdditionalRequirement.js";
import { ReferanceDocumentList } from "../../tisax-audit/audit-tisaxcomponent/text-list";
import { AiOutlineDown, AiOutlineUp } from "react-icons/ai"; // Import dropdown icons
import CustomAxios from "@/globalcomponents/CustomAxios";
import Loader from "@/globalcomponents/loader/Loader";
import useGlobalLoading from "@/globalcomponents/loader/useGlobalLoading";
function TisaxInformationSecurity(props) {
  const { eventKey } = props;
  const router = useRouter();
  const { id, rootId } = router.query;
  const [InformationSecuritydata, setInformationSecurityData] = useState([]);
  const [isOpen, setIsOpen] = useState({});
  const [saveButtonVisibility, setSaveButtonVisibility] = useState({});
  const [isHydrated, setIsHydrated] = useState(false);
  const { loading, showLoader, hideLoader } = useGlobalLoading(); // Destructure loading, showLoader, and hideLoader
  const [saveLoading, setsaveLoading] = useState(false)
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

  useEffect(() => {
    if (!isHydrated) {
      setIsHydrated(true); // Set flag to true once component is hydrated
      return; // Skip execution during hydration
    }
    const fetchData = async (id) => {

      try {
        showLoader(); // Show the loader before fetching data
        const Response = await CustomAxios.get(
          `${baseurl}/${initURL}/assign-tisax-task/employee-assigned-tasks`
        );

        let filterData = Response.data.find((loc) => loc._id == rootId) || {}
        Response.data = filterData?.informationSecurityControls || []

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
        const finalResult = Object.values(groupedData).map((group) => ({
          ...group,
          Items: group.Items.map((item) => ({
            ...item,
            readyState: item.isReady || false, // Initialize readyState for each item
          })),
        }));
        console.log("🚀 ~ fetchData ~ finalResult:", finalResult)
        setInformationSecurityData(finalResult);
      } catch (error) {

      } finally {
        hideLoader(); // Hide the loader once data is fetched
      }
    };
    if (id) {
      fetchData(id);
    }
  }, [isHydrated, id]);

  const diableData = (groupIndex, itemIndex, value) => {
    setSaveButtonVisibility((prevVisibility) => {
      const newVisibility = { ...prevVisibility };
      const accordionId = `${groupIndex}-${itemIndex}`;
      newVisibility[accordionId] = value;
      return newVisibility;
    });
  };

  const handleMaturityChange = (groupIndex, itemIndex, value) => {
    const sanitizedValue = value.replace(/[^0-5]/g, "").charAt(0);
    setInformationSecurityData((prevData) => {
      const newData = [...prevData];
      newData[groupIndex].Items[itemIndex]["Maturity Level"] = sanitizedValue;
      return newData;
    });
    diableData(groupIndex, itemIndex, true);
  };

  const values = "<p><br></p>";
  const handleRequirementChange = (
    groupIndex,
    itemIndex,
    level,
    reqIndex,
    value
  ) => {
    const newData = [...InformationSecuritydata];
    const myItem =
      newData[groupIndex].Items[itemIndex][`${level} Requirements`][reqIndex]
        .answer;

    if (
      value !== values &&
      (myItem !== value || (myItem === null && value.length > 0))
    ) {
      diableData(groupIndex, itemIndex, true);
    }
    newData[groupIndex].Items[itemIndex][`${level} Requirements`][
      reqIndex
    ].answer = value;
    setInformationSecurityData(newData);
  };

  const handleRequirementChangehigh = (
    groupIndex,
    itemIndex,
    level,
    reqIndex,
    value
  ) => {
    const newData = [...InformationSecuritydata];
    let myItem = newData[groupIndex].Items[itemIndex];
    let requirement =
      myItem[`Additional requirements for high protection needs`][reqIndex];
    const myData = requirement.answer;

    if (
      value !== values &&
      (myData !== value || (myData === null && value.length > 0))
    ) {
      diableData(groupIndex, itemIndex, true);
    }

    requirement.answer = value;
    setInformationSecurityData(newData);
  };

  const handleRequirementChangeveryhigh = (
    groupIndex,
    itemIndex,
    level,
    reqIndex,
    value
  ) => {
    const newData = [...InformationSecuritydata];
    let myItem = newData[groupIndex].Items[itemIndex];
    let requirement =
      myItem[`Additional requirements for very high protection needs`][
      reqIndex
      ];
    const myData = requirement.answer;
    if (
      value !== values &&
      (myData !== value || (myData === null && value.length > 0))
    ) {
      diableData(groupIndex, itemIndex, true);
    }
    requirement.answer = value;
    setInformationSecurityData(newData);
  };

  const handleSGA = (groupIndex, itemIndex, level, reqIndex, value) => {
    const newData = [...InformationSecuritydata];
    let myItem = newData[groupIndex].Items[itemIndex];
    let requirement =
      myItem["Additional requirements for Simplified Group Assessments"][
      reqIndex
      ];
    const myData = requirement.answer;
    if (
      value !== values &&
      (myData !== value || (myData === null && value.length > 0))
    ) {
      diableData(groupIndex, itemIndex, true);
    }
    requirement.answer = value;
    setInformationSecurityData(newData);
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

      function mapRequirements(requirements) {
        return requirements.map(({ _id, ...rest }) => {
          const tempElement = document.createElement("div");
          tempElement.innerHTML = rest.answer;
          const text = tempElement.textContent || tempElement.innerText || "";
          return {
            question: rest.question,
            answer: text.trim() === "" ? null : text.trim(),
          };
        });
      }

      const mustRequirements = mapRequirements(
        editedItem["Must Requirements"] || []
      );

      const shouldRequirements = mapRequirements(
        editedItem["Should Requirements"] || []
      );
      const additionalRequirementsHigh = mapRequirements(
        editedItem["Additional requirements for high protection needs"] || []
      );
      const additionalRequirementsVeryHigh = mapRequirements(
        editedItem["Additional requirements for very high protection needs"] ||
        []
      );
      const SgaAdditionalRequirement = mapRequirements(
        editedItem[
        "Additional requirements for Simplified Group Assessments"
        ] || []
      );

      editedItem["Reference Documentation"] =
        Array.isArray(editedItem["Reference Documentation"]) &&
          editedItem["Reference Documentation"].length > 0
          ? editedItem["Reference Documentation"]
          : null;
      const requestBody = {
        "ISA New": editedItem["ISA New"],
        "Maturity Level": editedItem["Maturity Level"] || 0,
        "Must Requirements": mustRequirements,
        "Should Requirements": shouldRequirements,
        "Additional requirements for high protection needs":
          additionalRequirementsHigh,
        "Additional requirements for very high protection needs":
          additionalRequirementsVeryHigh,
        "Additional requirements for Simplified Group Assessments":
          SgaAdditionalRequirement,
        "Reference Documentation": editedItem["Reference Documentation"],
        isReady: editedItem.readyState, // Include readyState in request
      };

      setsaveLoading(true)
      const response = await CustomAxios.patch(
        `${baseurl}/${initURL}/tisax/employee/informationSecurity/${id}`,
        requestBody
      );
      if (response.status === 200) {
        diableData(groupIndex, itemIndex, false);
        toast.success("data submitted successfully!");
      }
    } catch (error) {
      console.error("Error saving data:", error);
    } finally {
      setsaveLoading(false)
    }
  };
  const [selectedTab, setSelectedTab] = useState("tab-0");

  const handleTabClick = (eventKey) => {
    setSelectedTab(eventKey);
  };

  if (loading) {
    return <Loader />
  }

  return (
    <div className="pb-1 p-1">
      <div className="container mx-auto p-4">
        <div className="space-y-4">
          {InformationSecuritydata.length > 0 ? InformationSecuritydata?.map((group, groupIndex) => (
            <div key={groupIndex} className="border border-gray-300 rounded-lg">
              <div
                className="bg-[#F8F9FA] border border-[#E0E0E0] font-semibold rounded-lg text-[#333333] p-4 cursor-pointer flex items-center justify-between"
                onClick={() => handleToggleAccordion(groupIndex)}
              >
                <span>
                  {group["Root ISA New"]} - {group["Root Control question"]}
                </span>
                {isOpen[groupIndex] ? <AiOutlineUp /> : <AiOutlineDown />}

              </div>

              <div className={`${isOpen[groupIndex] ? "block" : "hidden"}`}>
                <div className="flex overflow-x-auto whitespace-nowrap p-4 space-x-4 scrollbar-thin scrollbar-thumb-gray-500 scrollbar-track-[#e4e4e4]">
                  {group.Items?.map((item, itemIndex) => (
                    <button
                      key={itemIndex}
                      className={`flex justify-between items-center w-full px-4 py-2 rounded ${isOpen[groupIndex + "-" + itemIndex]
                        ? "bg-[#050038] text-white font-semibold"
                        : "bg-gray-200"
                        } ${item.readyState ? "border-green-500 border-2" : "border-red-500 border-2"
                        }`}
                      onClick={() => handleToggleAccordion(groupIndex, itemIndex)}
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
                        <label className="block text-gray-700 font-semibold ">
                          Maturity:
                        </label>{" "}
                        {/* Dropdown with values from 0 to 5 */}
                        <select
                          className="p-2 border border-gray-300 rounded " // Adjusted width for better proportion
                          value={item["Maturity Level"] || 0} // Set the current value
                          onChange={(e) =>
                            handleMaturityChange(
                              groupIndex,
                              itemIndex,
                              e.target.value // Handle the selected value change
                            )
                          }
                        >
                          {/* Provide options from 0 to 5 */}
                          {[...Array(6).keys()].map((val) => (
                            <option key={val} value={val}>
                              {val}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="p-2 bg-white rounded-lg shadow-lg">
                        {/* Horizontal Navigation Menu */}
                        <div className="flex overflow-x-auto whitespace-nowrap p-3 space-x-4 scrollbar-thin scrollbar-thumb-gray-500 scrollbar-track-[#1E335A]">
                          {[
                            {
                              level: "Must",
                              eventKey: "tab-0",
                              requirements: item["Must Requirements"],
                            },
                            {
                              level: "Should",
                              eventKey: "tab-1",
                              requirements: item["Should Requirements"],
                            },
                            {
                              level: "High",
                              eventKey: "tab-2",
                              requirements:
                                item[
                                "Additional requirements for high protection needs"
                                ],
                            },
                            {
                              level: "Very High",
                              eventKey: "tab-3",
                              requirements:
                                item[
                                "Additional requirements for very high protection needs"
                                ],
                            },
                            {
                              level: "SGA",
                              eventKey: "tab-4",
                              requirements:
                                item[
                                "Additional requirements for Simplified Group Assessments"
                                ],
                            },
                          ].map(
                            ({ level, eventKey, requirements }, index) =>
                              requirements &&
                              requirements.length > 0 && (
                                <button
                                  key={index}
                                  className={`px-6 py-3 rounded-lg transition duration-200 ${selectedTab === eventKey
                                    ? "bg-blue-600 text-white shadow-md"
                                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                                    }`}
                                  onClick={() => handleTabClick(eventKey)}
                                >
                                  {level}
                                </button>
                              )
                          )}
                        </div>

                        {/* Tab Content */}
                        <div className="mt-4 p-6 bg-gray-100 rounded-lg shadow-inner">
                          {selectedTab === "tab-0" &&
                            item["Must Requirements"]?.length > 0 && (
                              <div>
                                <h3 className="text-xl font-semibold mb-2 text-gray-700">
                                  Must Requirements
                                </h3>
                                <MustRequirments
                                  item={item}
                                  groupIndex={groupIndex}
                                  itemIndex={itemIndex}
                                  handleRequirementChange={
                                    handleRequirementChange
                                  }
                                />
                              </div>
                            )}

                          {selectedTab === "tab-1" &&
                            item["Should Requirements"]?.length > 0 && (
                              <div>
                                <h3 className="text-xl font-semibold mb-2 text-gray-700">
                                  Should Requirements
                                </h3>
                                <ShouldRequirement
                                  item={item}
                                  groupIndex={groupIndex}
                                  itemIndex={itemIndex}
                                  handleRequirementChange={
                                    handleRequirementChange
                                  }
                                />
                              </div>
                            )}

                          {selectedTab === "tab-2" &&
                            item[
                              "Additional requirements for high protection needs"
                            ]?.length > 0 && (
                              <div>
                                <h3 className="text-xl font-semibold mb-2 text-gray-700">
                                  High Protection Needs
                                </h3>
                                <High
                                  item={item}
                                  groupIndex={groupIndex}
                                  itemIndex={itemIndex}
                                  handleRequirementChangehigh={
                                    handleRequirementChangehigh
                                  }
                                />
                              </div>
                            )}

                          {selectedTab === "tab-3" &&
                            item[
                              "Additional requirements for very high protection needs"
                            ]?.length > 0 && (
                              <div>
                                <h3 className="text-xl font-semibold mb-2 text-gray-700">
                                  Very High Protection Needs
                                </h3>
                                <VeryHigh
                                  item={item}
                                  groupIndex={groupIndex}
                                  itemIndex={itemIndex}
                                  handleRequirementChangeveryhigh={
                                    handleRequirementChangeveryhigh
                                  }
                                />
                              </div>
                            )}

                          {selectedTab === "tab-4" &&
                            item[
                              "Additional requirements for Simplified Group Assessments"
                            ]?.length > 0 && (
                              <div>
                                <h3 className="text-xl font-semibold mb-2 text-gray-700">
                                  Simplified Group Assessments
                                </h3>
                                <SgaAdditionalRequirement
                                  item={item}
                                  groupIndex={groupIndex}
                                  itemIndex={itemIndex}
                                  handleSGA={handleSGA}
                                />
                              </div>
                            )}
                        </div>
                      </div>
                    </div>

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
                    <div className="flex items-center space-x-4 my-4">
                      <label className="block text-gray-700 font-semibold">
                        Ready State:
                      </label>
                      <select
                        className="p-2 border border-gray-300 rounded"
                        value={item.readyState ? "Ready" : "Not Ready"}
                        onChange={(e) => {
                          const isReady = e.target.value === "Ready";
                          setInformationSecurityData((prevData) => {
                            const newData = [...prevData];
                            newData[groupIndex].Items[itemIndex].readyState =
                              isReady;
                            return newData;
                          });
                          diableData(groupIndex, itemIndex, true);
                        }}
                      >
                        <option value="Ready">Ready</option>
                        <option value="Not Ready">Not Ready</option>
                      </select>
                    </div>

                    <div className="flex justify-end">
                      {" "}
                      <button
                        onClick={() => handleSave(groupIndex, itemIndex)}
                        className="px-4 py-2 bg-[#007ACC] hover:bg-[#005A99] active:bg-[#004F8A] text-white rounded "
                      >
                        {saveLoading ? <Loader /> : "Save"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )) : <div className="p-6 text-center text-gray-600 text-lg font-semibold">
            🚫 No controls available in this category.
          </div>}
        </div>
      </div>
    </div>
  );
}

export default TisaxInformationSecurity;
