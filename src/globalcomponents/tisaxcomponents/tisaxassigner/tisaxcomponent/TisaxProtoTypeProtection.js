import CustomAxios from "@/globalcomponents/CustomAxios";
import Loader from "@/globalcomponents/loader/Loader";
import useGlobalLoading from "@/globalcomponents/loader/useGlobalLoading";
import _ from "lodash";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { AiOutlineDown, AiOutlineUp } from "react-icons/ai";
import { toast } from "react-toastify";
import { baseurl, initURL } from "../../../../../BaseUrl";
import { ReferanceDocumentList } from "../../tisax-audit/audit-tisaxcomponent/text-list";
import MustRequirments from "./MustRequirments";
import ShouldRequirement from "./ShouldRequirement";
function TisaxProtoTypeProtection(props) {
  const { eventKey } = props;
  const router = useRouter();
  const { id, rootId } = router.query;
  const [PrototypeProtectiondata, setPrototypeProtectionData] = useState([]);
  const [isOpen, setIsOpen] = useState({});
  const [saveButtonVisibility, setSaveButtonVisibility] = useState({});
  const [isHydrated, setIsHydrated] = useState(false);
  const [selectedTab, setSelectedTab] = useState("tab-0");
  const { loading, showLoader, hideLoader } = useGlobalLoading(); // Destructure loading, showLoader, and hideLoader
  const [saveLoading, setsaveLoading] = useState(false)


  useEffect(() => {
    if (!isHydrated) {
      setIsHydrated(true);
      return;
    }
    const fetchData = async (id) => {
      try {
        showLoader(); // Show the loader before fetching data

        const Response = await CustomAxios.get(
          `${baseurl}/${initURL}/tisax/employee/prototypeProtection/${id}`
        );

        const groupedData = {};
        Response?.data?.sort((a, b) => {
          if (a["Parent ISA New"] !== b["Parent ISA New"]) {
            return a["Parent ISA New"].localeCompare(b["Parent ISA New"]);
          } else {
            return a["ISA New"].localeCompare(b["ISA New"]);
          }
        });

        (Response?.data || [])?.forEach((item) => {
          const groupKey = `${item["Parent ISA New"]}_${item["Parent Control question"]}`;
          if (!groupedData[groupKey]) {
            groupedData[groupKey] = {
              parentISA: item["Parent ISA New"],
              parentControlQuestion: item["Parent Control question"],
              Items: [],
            };
          }
          groupedData[groupKey].Items.push({ ...item, readyState: item.isReady || false }); // Add readyState
        });

        const finalResult = Object.values(groupedData);
        setPrototypeProtectionData(finalResult);
      } catch (error) {

      } finally {
        hideLoader(); // Hide the loader once data is fetched
      }
    };
    if (id) {
      fetchData(id);
    }
  }, [isHydrated, id]);

  const handleToggleAccordion = (groupIndex, itemIndex = null) => {
    setIsOpen((prevState) => {
      if (itemIndex === null) {
        return {
          ...prevState,
          [groupIndex]: !prevState[groupIndex],
        };
      } else {
        const newState = { ...prevState };
        Object.keys(newState).forEach((key) => {
          if (key.startsWith(`${groupIndex}-`)) {
            delete newState[key];
          }
        });
        newState[`${groupIndex}-${itemIndex}`] =
          !prevState[`${groupIndex}-${itemIndex}`];
        newState[groupIndex] = true;
        return newState;
      }
    });
  };
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

  const handleRequirementChange = (
    groupIndex,
    itemIndex,
    level,
    reqIndex,
    value
  ) => {
    const newData = [...PrototypeProtectiondata];
    const myItem =
      newData[groupIndex].Items[itemIndex][`${level} Requirements`][reqIndex]
        .answer;
    const values = "<p><br></p>";
    if (
      value !== values &&
      (myItem !== value || (myItem === null && value.length > 0))
    ) {
      diableData(groupIndex, itemIndex, true);
    }
    newData[groupIndex].Items[itemIndex][`${level} Requirements`][
      reqIndex
    ].answer = value;
    setPrototypeProtectionData(newData);
  };

  const handleSave = async (groupIndex, itemIndex) => {
    try {
      const updatedData = [...PrototypeProtectiondata];
      const editedGroup = updatedData[groupIndex];
      const editedItem = editedGroup.Items[itemIndex];

      // Mapping and cleaning requirements to ensure they meet expected structure
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

      // Validate Reference Documentation
      const referenceDocumentation = Array.isArray(
        editedItem["Reference Documentation"]
      )
        ? editedItem["Reference Documentation"].filter(
          (doc) => doc.trim() !== ""
        )
        : null;

      const requestBody = {
        "ISA New": editedItem["ISA New"],
        "Maturity Level": editedItem["Maturity Level"] || 0,
        "Must Requirements": mustRequirements,
        "Should Requirements": shouldRequirements,
        "Reference Documentation": referenceDocumentation.length
          ? referenceDocumentation
          : null,
        "isReady": editedItem.readyState, // Include readyState

      };

      const additionalRequirements =
        editedItem[
        "Additional requirements for vehicles classified as requiring protection"
        ];
      requestBody[
        "Additional requirements for vehicles classified as requiring protection"
      ] =
        additionalRequirements && additionalRequirements.answer
          ? {
            question: additionalRequirements.question || null,
            answer: additionalRequirements.answer,
          }
          : null;

      setsaveLoading(true)
      const response = await CustomAxios.patch(
        `${baseurl}/${initURL}/tisax/employee/prototypeProtection/${id}`,
        requestBody
      );
      if (response.status === 200) {
        diableData(groupIndex, itemIndex, false);
        toast.success("Data saved successfully!");
      }
    } catch (error) {
      console.error("Error saving data:", error);
    } finally {
      setsaveLoading(false)
    }
  };

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
          {PrototypeProtectiondata.length > 0 ? PrototypeProtectiondata?.map((group, groupIndex) => (
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
                <div className="flex overflow-x-auto whitespace-nowrap p-4 space-x-4 scrollbar-thin scrollbar-thumb-gray-500 scrollbar-track-[#e4e4e4]">
                  {group.Items?.map((item, itemIndex) => (
                    <button
                      key={itemIndex}
                      className={`flex justify-between items-center w-full px-4 py-2 rounded ${isOpen[groupIndex + "-" + itemIndex]
                        ? "bg-[#050038] text-white font-semibold"
                        : "bg-gray-200"
                        } ${item.readyState ? "border-green-500 border-2" : "border-red-500 border-2"
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

                      <div className="p-2 bg-white rounded-lg shadow-lg">
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

                        <div className="mt-4 p-6 bg-gray-100 rounded-lg shadow-inner">
                          {selectedTab === "tab-0" &&
                            item["Must Requirements"]?.length > 0 && (
                              <MustRequirments
                                item={item}
                                groupIndex={groupIndex}
                                itemIndex={itemIndex}
                                handleRequirementChange={
                                  handleRequirementChange
                                }
                              />
                            )}
                          {selectedTab === "tab-1" &&
                            item["Should Requirements"]?.length > 0 && (
                              <ShouldRequirement
                                item={item}
                                groupIndex={groupIndex}
                                itemIndex={itemIndex}
                                handleRequirementChange={
                                  handleRequirementChange
                                }
                              />
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
                          setPrototypeProtectionData((prevData) => {
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
          )) : <div className="p-6 text-center text-gray-600 text-lg font-semibold">
            🚫 No controls available in this category.
          </div>}
        </div>
      </div>
    </div>
  );
}

export default TisaxProtoTypeProtection;

// src/globalcomponents/tisaxcomponents/tisax/tisaxcomponent/TisaxProtoTypeProtection.js
