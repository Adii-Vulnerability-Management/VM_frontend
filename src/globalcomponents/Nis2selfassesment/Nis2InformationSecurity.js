import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import CustomAxios from "../CustomAxios";
import { initURL, baseurl } from "../../../BaseUrl";
import { useRouter } from "next/router";

// Dynamically import the CustomEditor component
const CustomEditor = dynamic(() => import("@/globalcomponents/CustomEditor"), {
  ssr: false,
});

// --- REQUIREMENT SECTION COMPONENT ---
const RequirementSection = ({
  sectionTitle,
  rawText, // This is now an array of objects
  storageKey,
  selectedSubItem,
  answers,
  setAnswers,
}) => {
  const questions = rawText;
  if (!questions || questions.length === 0) return null;

  return (
    <div className="bg-white p-4 rounded shadow mb-5">
      <h3 className="text-2xl font-extrabold text-[#2B245C] mb-3 tracking-wide">
        {sectionTitle}
      </h3>
      {questions.map((req, index) => {
        // Use req.question directly instead of splitting a string.
        const questionText = req.question;
        // Use the answer from state if available, otherwise use req.answer from the API.
        const initialAnswer =
          answers[selectedSubItem["ISA New"]]?.[storageKey]?.[index]?.answer ||
          req.answer ||
          "";
        return (
          <div key={`${storageKey}-${index}`} className="mb-5">
            <div className="font-semibold">Question {index + 1}:</div>
            <div>{questionText}</div>
            <CustomEditor
              initialData={initialAnswer}
              onChange={(content) => {
                // Clean the content (remove HTML tags)
                const cleanedContent = content.replace(/<\/?[^>]+(>|$)/g, "");
                setAnswers((prev) => {
                  const current =
                    prev[selectedSubItem["ISA New"]]?.[storageKey] || [];
                  current[index] = {
                    question: questionText,
                    answer: cleanedContent,
                  };
                  return {
                    ...prev,
                    [selectedSubItem["ISA New"]]: {
                      ...prev[selectedSubItem["ISA New"]],
                      [storageKey]: current,
                    },
                  };
                });
              }}
            />
          </div>
        );
      })}
    </div>
  );
};

const SECTION_NAMES = {
  1: "Organization of Information Security",
  2: "Human Resource",
  3: "Physical Security",
  4: "Identity and Access Management",
  5: "IT security/cybersecurity",
  6: "Supplier relations",
  7: "Compliance",
};

const Nis2InformationSecurity = () => {
  const [controlsData, setControlsData] = useState([]);
  const [groupedData, setGroupedData] = useState({});
  const [selectedSection, setSelectedSection] = useState(null);
  const [selectedSubItem, setSelectedSubItem] = useState(null);
  const [referenceDocs, setReferenceDocs] = useState([]);
  const [newDoc, setNewDoc] = useState("");
 // const [readyState, setReadyState] = useState("Not Ready");
  const [maturityLevel, setMaturityLevel] = useState(1);
  const [itemReadyStates, setItemReadyStates] = useState({});
  const [answers, setAnswers] = useState({});
  const router = useRouter();
  const { id } = router.query; // Extract id from URL
  const locationId = id || null; // Use locationId for API calls
  // Fetch controls data from the API on component mount
const [editingIndex, setEditingIndex] = useState(null);
const [editingValue, setEditingValue] = useState("");

const fetchControlsData = async () => {
  try {
    const response = await CustomAxios.get(
      `${baseurl}/${initURL}/nis2selfassessment/location/${locationId}`
    );
    setControlsData(response.data);
  } catch (error) {
    console.error("Error fetching controls data:", error);
  }
};

  
useEffect(() => {
  if (locationId) {
    fetchControlsData();
  }
}, [locationId]);

  // Build a mapping from "ISA New" to the control record
  const itemMap = controlsData.reduce((acc, item) => {
    acc[item["ISA New"]] = item;
    return acc;
  }, {});

  // Group items by the first part of their "ISA New" (Root ISA New)
  useEffect(() => {
    const grouped = controlsData.reduce((acc, item) => {
      const [mainCat] = item["ISA New"].split(".");
      if (!acc[mainCat]) acc[mainCat] = [];
      acc[mainCat].push(item);
      return acc;
    }, {});
    // Ensure keys 1 to 7 exist
    for (let i = 1; i <= 7; i++) {
      if (!grouped[i]) grouped[i] = [];
    }
    setGroupedData(grouped);
  }, [controlsData]);
  useEffect(() => {
    if (selectedSubItem) {
      // Convert the maturity level from the API into a number
      const maturity =
        selectedSubItem["Maturity Level"]?.["$numberInt"] ||
        selectedSubItem["Maturity Level"] ||
        1;
      setMaturityLevel(Number(maturity));
    }
  }, [selectedSubItem]);

  const handleSectionToggle = (sectionKey) => {
    setSelectedSection((prev) => (prev === sectionKey ? null : sectionKey));
    setSelectedSubItem(null);
  };

  const handleReadyStateChange = (itemNo, state) => {
    setItemReadyStates((prevState) => ({
      ...prevState,
      [itemNo]: state,
    }));
  };

const addReferenceDoc = () => {
  if (newDoc.trim()) {
    const updatedRefDocs = [...referenceDocs, newDoc.trim()];
    setReferenceDocs(updatedRefDocs);

    // Also update the answers state to keep everything in sync.
    setAnswers((prev) => ({
      ...prev,
      [selectedSubItem["ISA New"]]: {
        ...prev[selectedSubItem["ISA New"]],
        "Reference Documentation": updatedRefDocs,
      },
    }));

    setNewDoc("");
  }
};


  // Helper function to patch a single control's answer
  const patchAnswer = async (controlId, answerPayload) => {
    try {
      const response = await CustomAxios.patch(
        `${baseurl}/${initURL}/nis2selfassessment/nis2answer/${controlId}`,
        answerPayload
      );
      console.log(`Updated control ${controlId}:`, response.data);
    } catch (error) {
      console.error(`Error updating control ${controlId}:`, error);
      // Optionally, add error handling feedback to the user
    }
  };
  // Helper function updated to accept base and entry as parameters
  const processRequirements = (sectionKey, base, entry) => {
    const baseRequirements = base[sectionKey] || [];
    const entryRequirements = entry[sectionKey] || [];
    return baseRequirements.map((baseReq, index) => {
      const updatedReq = entryRequirements[index];
      const question =
        (updatedReq && updatedReq.question) ||
        (baseReq && baseReq.question) ||
        null;
      const answer =
        (updatedReq && updatedReq.answer && updatedReq.answer.trim() !== ""
          ? updatedReq.answer
          : baseReq && baseReq.answer) || null;
      return { question, answer };
    });
  };
useEffect(() => {
  if (selectedSubItem) {
    // Update the ready state based on the selected sub-item
    setItemReadyStates((prev) => ({
      ...prev,
      [selectedSubItem["ISA New"]]: selectedSubItem.isReady
        ? "Ready"
        : "Not Ready",
    }));

    // Map the API data for "Reference Documentation" into your local state
    if (selectedSubItem["Reference Documentation"]) {
      // Ensure it's an array of strings; if not, default to an empty array
      setReferenceDocs(
        Array.isArray(selectedSubItem["Reference Documentation"])
          ? selectedSubItem["Reference Documentation"]
          : []
      );
    } else {
      setReferenceDocs([]);
    }
  }
}, [selectedSubItem]);

  const handleSaveChanges = async () => {
    if (!selectedSubItem) return;

    const itemNo = selectedSubItem["ISA New"];
    const base = itemMap[itemNo] || selectedSubItem;
    const entry = answers[itemNo] || {};

    const payload = {
      "ISA New": base["ISA New"],
      "Root ISA New": base["Root ISA New"],
      "Parent ISA New": base["Parent ISA New"],
      "Control question": base["Control question"],
      Objective: base["Objective"],
      "Maturity Level":
        entry["Maturity Level"] ||
        base["Maturity Level"]?.["$numberInt"] ||
        base["Maturity Level"] ||
        1,
      "Must Requirements": processRequirements(
        "Must Requirements",
        base,
        entry
      ),
      "Should Requirements": processRequirements(
        "Should Requirements",
        base,
        entry
      ),
      "Additional requirements for high protection needs": processRequirements(
        "Additional requirements for high protection needs",
        base,
        entry
      ),
      "Additional requirements for very high protection needs":
        processRequirements(
          "Additional requirements for very high protection needs",
          base,
          entry
        ),
      "Reference Documentation":
        entry["Reference Documentation"] ||
        base["Reference Documentation"] ||
        [],
      isReady:
        entry.isReady !== undefined ? entry.isReady : base.isReady || false,
      Nis2ControlQuestionID: base._id,
    };

    await patchAnswer(payload.Nis2ControlQuestionID, payload);
    // Re-fetch the updated controls data
    await fetchControlsData();
    alert("Changes saved successfully!");
  };

  return (
    <div className="container mx-auto p-4">
      {Object.entries(groupedData)
        .sort((a, b) => a[0] - b[0])
        .map(([sectionKey, items]) => (
          <div key={sectionKey} className="mb-6 border rounded-lg">
            {/* Section Header */}
            <div
              className={`p-4 flex justify-between items-center cursor-pointer 
                ${
                  selectedSection === sectionKey
                    ? "bg-[#F8F9FA] text-white hover:bg-white"
                    : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                } transition duration-300 ease-in-out rounded-md`}
              onClick={() => handleSectionToggle(sectionKey)}
            >
              <div>
                <h2 className="text-lg font-semibold tracking-wide">
                  {sectionKey}. {SECTION_NAMES[sectionKey]}
                </h2>
              </div>
              <span className="text-2xl">
                {selectedSection === sectionKey ? "⌄" : ">"}
              </span>
            </div>

            {/* Section Content */}
            {selectedSection === sectionKey && (
              <div className="p-4 bg-gray-50">
                {/* Sub-items Scrollable List */}
                <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
                  {items.map((item) => (
                    <button
                      key={item["ISA New"]}
                      className={`px-4 py-2 rounded min-w-[120px] 
                        ${
                          selectedSubItem?.["ISA New"] === item["ISA New"]
                            ? "bg-gray-600 text-white"
                            : "bg-gray-200 hover:bg-gray-300"
                        } 
                        ${
                          itemReadyStates[item["ISA New"]] === "Ready"
                            ? "border-2 border-green-500"
                            : "border-2 border-red-500"
                        }`}
                      onClick={() => setSelectedSubItem(item)}
                    >
                      {item["ISA New"]}
                    </button>
                  ))}
                </div>

                {/* Details of the selected sub-item */}
                {selectedSubItem && (
                  <div className="space-y-6">
                    {/* Common Information */}
                    <div className="grid grid-cols-1">
                      <div className="bg-white p-4 rounded shadow mb-5">
                        <h3 className="text-2xl font-extrabold text-[#2B245C] mb-3 tracking-wide">
                          Control question
                        </h3>
                        <p>
                          {selectedSubItem["Control question"] ||
                            "Not Available"}
                        </p>
                      </div>
                      <div className="bg-white p-4 rounded shadow">
                        <h3 className="text-2xl font-extrabold text-[#2B245C] mb-3 tracking-wide">
                          Objective
                        </h3>
                        <p>{selectedSubItem["Objective"] || "Not Available"}</p>
                      </div>
                    </div>

                    {/* Maturity Level */}
                    <div className="bg-white p-4 rounded shadow">
                      <h3 className="text-2xl font-extrabold text-[#2B245C] mb-3 tracking-wide">
                        Maturity Level
                      </h3>
                      <div className="flex items-center gap-4">
                        <select
                          value={maturityLevel}
                          onChange={(e) => {
                            const level = Number(e.target.value);
                            setMaturityLevel(level);
                            setAnswers((prev) => ({
                              ...prev,
                              [selectedSubItem["ISA New"]]: {
                                ...prev[selectedSubItem["ISA New"]],
                                "Maturity Level": level,
                              },
                            }));
                          }}
                          className="border p-2 rounded w-32"
                        >
                          {[1, 2, 3].map((num) => (
                            <option key={num} value={num}>
                              Level {num}
                            </option>
                          ))}
                        </select>
                        <div className="text-gray-500 text-sm">
                          Current maturity level assessment
                        </div>
                      </div>
                    </div>

                    {/* Requirement Sections */}
                    <RequirementSection
                      sectionTitle="Must Requirements"
                      rawText={selectedSubItem["Must Requirements"]}
                      storageKey="Must Requirements"
                      selectedSubItem={selectedSubItem}
                      answers={answers}
                      setAnswers={setAnswers}
                    />
                    <RequirementSection
                      sectionTitle="Should Requirements"
                      rawText={selectedSubItem["Should Requirements"]}
                      storageKey="Should Requirements"
                      selectedSubItem={selectedSubItem}
                      answers={answers}
                      setAnswers={setAnswers}
                    />
                    <RequirementSection
                      sectionTitle="Additional requirements for high protection needs"
                      rawText={
                        selectedSubItem[
                          "Additional requirements for high protection needs"
                        ]
                      }
                      storageKey="Additional requirements for high protection needs"
                      selectedSubItem={selectedSubItem}
                      answers={answers}
                      setAnswers={setAnswers}
                    />
                    <RequirementSection
                      sectionTitle="Additional requirements for very high protection needs"
                      rawText={
                        selectedSubItem[
                          "Additional requirements for very high protection needs"
                        ]
                      }
                      storageKey="Additional requirements for very high protection needs"
                      selectedSubItem={selectedSubItem}
                      answers={answers}
                      setAnswers={setAnswers}
                    />

                    {/* Reference Documentation */}
                    <div className="bg-white p-4 rounded shadow">
                      <h3 className="text-2xl font-extrabold text-[#2B245C] mb-3 tracking-wide">
                        Reference Documentation
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <div className="flex gap-2 mb-4">
                            <input
                              type="text"
                              value={newDoc}
                              onChange={(e) => setNewDoc(e.target.value)}
                              placeholder="New document name..."
                              className="border p-2 flex-1 rounded"
                            />
                            <button
                              onClick={addReferenceDoc}
                              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                            >
                              Add
                            </button>
                          </div>
                        </div>
                        <div>
                          <div className="space-y-2">
                            {referenceDocs.map((doc, index) => (
                              <div
                                key={index}
                                className="flex justify-between items-center bg-gray-50 p-2 rounded"
                              >
                                {editingIndex === index ? (
                                  <>
                                    <input
                                      type="text"
                                      value={editingValue}
                                      onChange={(e) =>
                                        setEditingValue(e.target.value)
                                      }
                                      className="border p-2 rounded flex-1"
                                    />
                                    <div className="flex gap-2 shrink-0">
                                      <button
                                        onClick={() => {
                                          const updatedDocs = [
                                            ...referenceDocs,
                                          ];
                                          updatedDocs[index] = editingValue;
                                          setReferenceDocs(updatedDocs);
                                          // Optionally update the answers state as well:
                                          setAnswers((prev) => ({
                                            ...prev,
                                            [selectedSubItem["ISA New"]]: {
                                              ...prev[
                                                selectedSubItem["ISA New"]
                                              ],
                                              "Reference Documentation":
                                                updatedDocs,
                                            },
                                          }));
                                          setEditingIndex(null);
                                          setEditingValue("");
                                        }}
                                        className="text-green-600 hover:text-green-800 px-2"
                                      >
                                        Save
                                      </button>
                                      <button
                                        onClick={() => {
                                          setEditingIndex(null);
                                          setEditingValue("");
                                        }}
                                        className="text-red-600 hover:text-red-800 px-2"
                                      >
                                        Cancel
                                      </button>
                                    </div>
                                  </>
                                ) : (
                                  <>
                                    <span className="truncate">{doc}</span>
                                    <div className="flex gap-2 shrink-0">
                                      <button
                                        onClick={() => {
                                          setEditingIndex(index);
                                          setEditingValue(doc);
                                        }}
                                        className="text-blue-600 hover:text-blue-800 px-2"
                                      >
                                        Edit
                                      </button>
                                      <button
                                        onClick={() => {
                                          const updatedDocs =
                                            referenceDocs.filter(
                                              (_, i) => i !== index
                                            );
                                          setReferenceDocs(updatedDocs);
                                          // Optionally update the answers state as well:
                                          setAnswers((prev) => ({
                                            ...prev,
                                            [selectedSubItem["ISA New"]]: {
                                              ...prev[
                                                selectedSubItem["ISA New"]
                                              ],
                                              "Reference Documentation":
                                                updatedDocs,
                                            },
                                          }));
                                        }}
                                        className="text-red-600 hover:text-red-800 px-2"
                                      >
                                        Delete
                                      </button>
                                    </div>
                                  </>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Ready State and Save Button */}
                    <div className="bg-white p-4 rounded shadow">
                      <div className="flex gap-4 items-center mb-5">
                        <div className="flex items-center gap-2">
                          <label className="text-gray-700">Ready State:</label>
                          <select
                            value={
                              itemReadyStates[selectedSubItem["ISA New"]] ||
                              "Not Ready"
                            }
                            onChange={(e) => {
                              const newState = e.target.value;
                              handleReadyStateChange(
                                selectedSubItem["ISA New"],
                                newState
                              );
                              setAnswers((prev) => ({
                                ...prev,
                                [selectedSubItem["ISA New"]]: {
                                  ...prev[selectedSubItem["ISA New"]],
                                  isReady: newState === "Ready",
                                },
                              }));
                            }}
                            className="border p-2 rounded"
                          >
                            <option value="Ready">Ready</option>
                            <option value="Not Ready">Not Ready</option>
                          </select>
                        </div>
                      </div>

                      <div className="flex justify-end gap-4 items-center">
                        <button
                          onClick={handleSaveChanges}
                          className="px-6 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                        >
                          Save Changes
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
    </div>
  );
};

export default Nis2InformationSecurity;
