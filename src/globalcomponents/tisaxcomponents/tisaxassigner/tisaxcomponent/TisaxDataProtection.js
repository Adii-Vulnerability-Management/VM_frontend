import CustomAxios from "@/globalcomponents/CustomAxios";
import Loader from "@/globalcomponents/loader/Loader";
import useGlobalLoading from "@/globalcomponents/loader/useGlobalLoading";
import _ from "lodash";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { AiOutlineDown, AiOutlineUp } from "react-icons/ai"; // Import dropdown icons
import { toast } from "react-toastify";
import { baseurl, initURL } from "../../../../../BaseUrl";
import { ReferanceDocumentList } from "../../tisax-audit/audit-tisaxcomponent/text-list";
function TisaxDataProtection(props) {
  const router = useRouter();
  const { id, rootId } = router.query;
  const [Protectiondata, setProtectionData] = useState([]);
  const [isHydrated, setIsHydrated] = useState(false);
  const [saveButtonVisibility, setSaveButtonVisibility] = useState({});
  const [openSections, setOpenSections] = useState({});
  const [openDropdowns, setOpenDropdowns] = useState({});
  const [selectedOptions, setSelectedOptions] = useState({});
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

        const response = await CustomAxios.get(
          `${baseurl}/${initURL}/tisax/employee/dataProtection/${id}`
        );


        const groupedData = {};


        (response?.data || [])?.sort((a, b) => {
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
          groupedData[groupKey].Items.push({
            ...item,
            readyState: item.isReady || false, // Initialize readyState for each item
          });
        });

        const finalResult = Object.values(groupedData);
        setProtectionData(finalResult);

        // Set initial selected options for assessments
        const initialSelectedOptions = {};
        finalResult.forEach((group, groupIndex) => {
          group.Items.forEach((item, itemIndex) => {
            initialSelectedOptions[`${groupIndex}-${itemIndex}`] =
              item.Assessment || "na";
          });
        });
        setSelectedOptions(initialSelectedOptions);
      } catch (error) {

      } finally {
        hideLoader(); // Hide the loader once data is fetched
      }
    };

    if (id) {
      fetchData(id);
    }
  }, [isHydrated, id]);

  const toggleItemSection = (groupIndex, itemIndex = null) => {
    setOpenSections((prev) => ({
      ...prev,
      [groupIndex]: !prev[groupIndex],
    }));
  };

  const handleDropdownSelect = (groupIndex, itemIndex, value) => {
    setSelectedOptions((prev) => ({
      ...prev,
      [`${groupIndex}-${itemIndex}`]: value,
    }));

    setProtectionData((prevData) => {
      const newData = [...prevData];
      newData[groupIndex].Items[itemIndex].Assessment = value;
      return newData;
    });

    setOpenDropdowns((prev) => ({
      ...prev,
      [`${groupIndex}-${itemIndex}`]: false,
    }));
  };

  const handleReferenceDocumentChange = (
    groupIndex,
    itemIndex,
    updatedDocuments
  ) => {
    setProtectionData((prevData) => {
      const newData = [...prevData];
      newData[groupIndex].Items[itemIndex]["Reference Documentation"] =
        updatedDocuments;
      return newData;
    });
    diableData(groupIndex, itemIndex, true);
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

  const handleInputAction = (groupIndex, itemIndex, field, referenceData) => {
    setProtectionData((prevData) => {
      const newData = _.cloneDeep(prevData);
      newData[groupIndex].Items[itemIndex][field] = referenceData;
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

  const handleSave = async (groupIndex, itemIndex) => {
    try {
      const updatedData = [...Protectiondata];
      const editedItem = updatedData[groupIndex].Items[itemIndex];
      const dataToSave = {
        "ISA New": editedItem["ISA New"],
        Assessment: selectedOptions[`${groupIndex}-${itemIndex}`] || "na",
        Requirements: editedItem.Requirements.map((req) => {
          const tempElement = document.createElement("div");
          tempElement.innerHTML = req.answer || "";
          const text = tempElement.textContent || tempElement.innerText || "";
          return {
            question: req.question,
            answer: text.trim() === "" ? null : text.trim(),
          };
        }),
        "Reference Documentation":
          Array.isArray(editedItem["Reference Documentation"]) &&
            editedItem["Reference Documentation"].length === 0
            ? null
            : editedItem["Reference Documentation"],
        isReady: editedItem.readyState, // Include readyState in the data
      };

      setsaveLoading(true)
      const response = await CustomAxios.patch(
        `${baseurl}/${initURL}/tisax/employee/dataProtection/${id}`,
        dataToSave
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
          {Protectiondata.length > 0 ? Protectiondata?.map((group, groupIndex) => (
            <div key={groupIndex} className="border border-gray-300 rounded-lg">
              {/* Collapsible Section Header */}
              <div
                className="flex justify-between items-center bg-[#F8F9FA] border border-[#E0E0E0] font-semibold rounded-lg text-[#333333] p-4 cursor-pointer"
                onClick={() => toggleItemSection(groupIndex)}
              >
                <span>
                  {group.parentISA && group.parentControlQuestion
                    ? `${group.parentISA} - ${group.parentControlQuestion}`
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

              {/* Conditionally render the content inside the collapsible section */}
              {openSections[groupIndex] && (
                <div className="p-4">
                  <div className="flex overflow-x-auto whitespace-nowrap p-4 space-x-4 scrollbar-thin scrollbar-thumb-gray-500 scrollbar-track-[#e4e4e4]">
                    {group.Items?.map((item, itemIndex) => (
                      <button
                        key={itemIndex}
                        className={`flex justify-between items-center w-full px-4 py-2 rounded ${selectedTab === `${groupIndex}-${itemIndex}`
                          ? "bg-[#050038] text-white font-semibold"
                          : "bg-gray-200"
                          } ${item.readyState
                            ? "border-green-500 border-2"
                            : "border-red-500 border-2"
                          }`}
                        onClick={() =>
                          setSelectedTab(`${groupIndex}-${itemIndex}`)
                        }
                      >
                        <span>{item["ISA New"]}</span>
                      </button>
                    ))}
                  </div>

                  {group.Items?.map((item, itemIndex) => (
                    <div
                      key={itemIndex}
                      className={`p-4 ${selectedTab === `${groupIndex}-${itemIndex}`
                        ? "block"
                        : "hidden"
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

                        {/* Render Assessment Dropdown */}
                        <div className="my-4">
                          <label className="block font-bold mb-2">
                            Assessment
                          </label>
                          <div className="relative">
                            <button
                              onClick={() =>
                                setOpenDropdowns((prev) => ({
                                  ...prev,
                                  [`${groupIndex}-${itemIndex}`]:
                                    !prev[`${groupIndex}-${itemIndex}`],
                                }))
                              }
                              className="w-full bg-white border border-gray-300 text-left px-4 py-2 rounded-md focus:outline-none"
                            >
                              {selectedOptions[`${groupIndex}-${itemIndex}`] ||
                                "Select Assessment"}
                              <span className="float-right">
                                {openDropdowns[`${groupIndex}-${itemIndex}`]
                                  ? "▲"
                                  : "▼"}
                              </span>
                            </button>
                            {openDropdowns[`${groupIndex}-${itemIndex}`] && (
                              <ul className="absolute w-full bg-white border border-gray-300 mt-1 rounded-md shadow-lg z-50">
                                {["na", "OK", "Not OK"].map(
                                  (option, optionIndex) => (
                                    <li
                                      key={optionIndex}
                                      className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                                      onClick={() =>
                                        handleDropdownSelect(
                                          groupIndex,
                                          itemIndex,
                                          option
                                        )
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

                        {/* Render Requirements */}
                        <div className="my-4">
                          <div className="font-bold mb-2">Requirment</div>
                          {item.Requirements?.map((req, reqIndex) => (
                            <div key={reqIndex} className="mb-4">
                              <p>
                                <strong>Q{reqIndex + 1}:-</strong>{" "}
                                {req.question}
                              </p>
                              <textarea
                                rows={5}
                                className="w-full border rounded-md p-2"
                                placeholder="Start typing here..."
                                value={req.answer || ""}
                                onChange={(e) =>
                                  handleFormChangeRequirement(
                                    groupIndex,
                                    itemIndex,
                                    reqIndex,
                                    "answer",
                                    e.target.value
                                  )
                                }
                              />
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="my-4">
                        <ReferanceDocumentList
                          data={item["Reference Documentation"]}
                          onChange={(updatedDocuments) =>
                            handleReferenceDocumentChange(
                              groupIndex,
                              itemIndex,
                              updatedDocuments
                            )
                          }
                        />
                      </div>
                      <div className="my-4">
                        <label className="block font-bold mb-2">
                          Ready State
                        </label>
                        <select
                          className="p-2 border border-gray-300 rounded w-full"
                          value={item.readyState ? "Ready" : "Not Ready"}
                          onChange={(e) => {
                            const isReady = e.target.value === "Ready";
                            setProtectionData((prevData) => {
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
                          className={`flex items-center px-4 py-2 text-white rounded-md bg-blue-500 hover:bg-blue-600`}
                        >
                          {saveLoading ? <Loader /> : "Save"}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )) : <div className="p-6 text-center text-gray-600 text-lg font-semibold">
            🚫 No controls available in this category.
          </div>
          }
        </div>
      </div>
    </div>
  );
}

export default TisaxDataProtection;
