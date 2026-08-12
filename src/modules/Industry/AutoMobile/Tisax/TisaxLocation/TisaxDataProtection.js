import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { baseurl, initURL } from "@/config/config";
import { toast } from "react-toastify";
import _ from "lodash";
import { ReferenceDocumentList, CommentsList, FindingsList } from "./Lists";
import { FaSave } from "react-icons/fa"; // Importing save icon from React Icons
import CustomAxios from "@/config/CustomAxios";
import Loader from "@/components/ui/Loader";
import Accordion from "@/components/ui/Accordion";
import {
  AL2ObservationForm,
  AL3ObservationForm,
} from "../../TisaxAudit/Location/ObservationForm";
import Cookies from "js-cookie";
import CreateAndAssignTask from "../../CreateAndAssignTask";
function TisaxDataProtection(props) {
  const router = useRouter();
  const { id, vda_type, assessment_level, rootId } = router.query;
  const [Protectiondata, setProtectionData] = useState([]);
  const [isHydrated, setIsHydrated] = useState(false);
  const [openSections, setOpenSections] = useState({});
  const [openDropdowns, setOpenDropdowns] = useState({});
  const [selectedOptions, setSelectedOptions] = useState({});
  const [selectedTab, setSelectedTab] = useState("tab-0");
  const [loading, setLoading] = useState(true);
  const [saveButtonVisibility, setSaveButtonVisibility] = useState({});
  const [observationData, setObservationData] = useState([]);
  const [fieldErrors, setFieldErrors] = useState({});
  const [formData, setFormData] = useState([]);
  const stored = Cookies.get("user_data");
  const role = stored ? JSON.parse(stored).user_designation : "Admin";
  const [employees, setEmployees] = useState([]);

  // Detect Audit Mode
  const isAuditMode = router.pathname.includes("/automobile/tisax-audit/");
  // …
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const { data } = await CustomAxios.post(
          `${baseurl}/${initURL}/tisax-team-assignment/get-employees`,
          {
            user_designations: [
              "Employee",
              "Reviewer",
              "Assigner",
              "Approver",
              "Contributor",
              "Supervisor",
            ],
          }
        );
        setEmployees(data.data || []);
      } catch {
        toast.error("Failed to load assignment list");
      }
    };
    fetchEmployees();
  }, []);

  useEffect(() => {
    if (!isHydrated) {
      setIsHydrated(true);
      return;
    }
    const fetchData = async () => {
      setLoading(true);
      try {
        let raw = [];

        if (isAuditMode) {
          // Audit mode always hits the audit endpoint
          const resp = await CustomAxios.get(
            `${baseurl}/${initURL}/tisax-audit/dataProtection/${id}?vda_type=${encodeURIComponent(
              vda_type
            )}`
          );
          raw = resp.data;
        } else {
          // Non‐audit: branch on role
          switch (role) {
            case "Admin": {
              const resp = await CustomAxios.get(
                `${baseurl}/${initURL}/tisax/dataProtection/${id}`
              );
              raw = resp.data;
              break;
            }
            case "Employee": {
              const list = (
                await CustomAxios.get(
                  `${baseurl}/${initURL}/assign-tisax-task/employee-assigned-tasks`
                )
              ).data;
              const rec = list.find((l) => l._id === rootId) || {};
              raw = rec.dataProtectionControls || [];
              break;
            }
            case "Reviewer": {
              const resp = await CustomAxios.get(
                `${baseurl}/${initURL}/assign-tisax-task/reviewer-assigned-tasks/${rootId}`
              );
              raw = resp.data.dataProtectionControls || [];
              break;
            }
            case "Assigner": {
              const resp = await CustomAxios.get(
                `${baseurl}/${initURL}/tisax/employee/dataProtection/${id}`
              );
              raw = resp.data;
              break;
            }
            default:
              throw new Error(`Unknown role ${role}`);
          }
        }
        // normalize “Reference Documentation” so it’s always [{name,link}]
        raw = raw.map((item) => {
          const docs = Array.isArray(item["Reference Documentation"])
            ? item["Reference Documentation"]
            : [];
          return {
            ...item,
            "Reference Documentation": docs.map((doc) =>
              typeof doc === "string"
                ? { name: doc, link: "" }
                : { name: doc.name, link: doc.link || "" }
            ),
          };
          
        });

        
        // group & sort exactly as before
        const groupedData = {};
        raw
          .sort((a, b) => {
            if (a["Parent ISA New"] !== b["Parent ISA New"]) {
              return a["Parent ISA New"].localeCompare(b["Parent ISA New"]);
            }
            return a["ISA New"].localeCompare(b["ISA New"]);
          })
          .forEach((item) => {
            const key = `${item["Parent ISA New"]}_${item["Parent Control question"]}`;
            if (!groupedData[key]) {
              groupedData[key] = {
                parentISA: item["Parent ISA New"],
                parentControlQuestion: item["Parent Control question"],
                Items: [],
              };
            }
            groupedData[key].Items.push({
              ...item,
              readyState: item.isReady || false,
            });
          });

        const finalResult = Object.values(groupedData);
        setProtectionData(finalResult);

        // initial Assessment dropdown state
        const initOpts = {};
        finalResult.forEach((grp, gi) => {
          grp.Items.forEach((it, ii) => {
            initOpts[`${gi}-${ii}`] = it.Assessment || "na";
          });
        });
        setSelectedOptions(initOpts);

        // audit‐mode only: initialize observations
        if (isAuditMode) {
          const obs = raw.map((item) => {
            const dev = item.deviationType || "";
            const found = item.deviationFound || false;
            return {
              deviationFound: found,
              noDeviation: !found,
              majorNonConformity: dev === "Major non-conformity",
              minorNonConformity: dev === "Minor non-conformity",
              observation: dev === "Observation",
              roomForImprovement: dev === "Room for improvement",
              description: item.deviationDescription || "",
              deviationType: dev,
              ...(assessment_level === "AL2" && {
                al2Plausible: item.plausible || false,
              }),
            };
          });
          setObservationData(obs);
        }
      } catch (err) {
        console.error(err);
        toast.error("Failed to load Data Protection");
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchData();
  }, [isHydrated, id, vda_type, assessment_level, role, isAuditMode]);

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
    disableData(groupIndex, itemIndex, true);
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
      disableData(groupIndex, itemIndex, true);
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
    disableData(groupIndex, itemIndex, true);
  };

  const disableData = (groupIndex, itemIndex, value) => {
    setSaveButtonVisibility((prevVisibility) => {
      const newVisibility = { ...prevVisibility };
      const accordionId = `${groupIndex}-${itemIndex}`;
      newVisibility[accordionId] = value;
      return newVisibility;
    });
  };

 const handleSave = async (groupIndex, itemIndex) => {
   try {
     const edited = Protectiondata[groupIndex].Items[itemIndex];
     const fd = new FormData();

     // ─── Scalars ───────────────────────────────────────────────────────────────
     fd.append("ISA New", edited["ISA New"] || "");
     fd.append(
       "Assessment",
       selectedOptions[`${groupIndex}-${itemIndex}`] || "na"
     );
     fd.append("isReady", edited.readyState ? "true" : "false");

     // ─── Requirements ──────────────────────────────────────────────────────────
     edited.Requirements.forEach((r, i) => {
       fd.append(`Requirements[${i}][question]`, r.question);
       const parser = new DOMParser();
       const doc = parser.parseFromString(r.answer || "", "text/html");
       const text = doc.body.textContent.trim();
       fd.append(`Requirements[${i}][answer]`, text || "");
     });

     // ─── Reference Documentation: links ────────────────────────────────────────
     (edited["Reference Documentation"] || [])
       .filter((d) => d.link && !d.file)
       .forEach((d, i) => {
         fd.append(`Reference Documentation[${i}][name]`, d.name);
         fd.append(`Reference Documentation[${i}][link]`, d.link);
       });

     // ─── Reference Documentation: files ───────────────────────────────────────
     (edited["Reference Documentation"] || [])
       .filter((d) => d.file)
       .forEach((d) => {
         fd.append("referenceDocsName", d.name);
         fd.append("referenceDocs", d.file, d.file.name);
       });

     // ─── Audit MODE EXTRAS ─────────────────────────────────────────────────────
     if (isAuditMode) {
       const obs = observationData[groupIndex][itemIndex] || {};
       if (obs.deviationFound) {
         if (!obs.deviationType)
           return toast.error(
             "Deviation type is required when a deviation is found."
           );
         if (!obs.description.trim())
           return toast.error(
             "Description is required when a deviation is found."
           );
       }
       (edited.findings || []).forEach((f, i) =>
         fd.append(`findings[${i}]`, f)
       );
       (edited.comments || []).forEach((c, i) =>
         fd.append(`comments[${i}]`, c)
       );
       fd.append("deviationFound", obs.deviationFound ? "true" : "false");
       if (obs.deviationFound) {
         fd.append("deviationType", obs.deviationType);
         fd.append("deviationDescription", obs.description);
         if (assessment_level === "AL2")
           fd.append("plausible", obs.al2Plausible ? "true" : "false");
       }
     }

     // ─── PICK YOUR ENDPOINT ────────────────────────────────────────────────────
     let url;
     if (isAuditMode) {
       url = `${baseurl}/${initURL}/tisax-audit/dataProtectionQnAImport/${id}?vda_type=${encodeURIComponent(
         vda_type
       )}`;
     } else if (role === "Admin") {
       url = `${baseurl}/${initURL}/tisax/dataProtection/${id}`;
     } else {
       url = `${baseurl}/${initURL}/tisax/employee/dataProtection/${id}`;
     }

     // ─── SEND ──────────────────────────────────────────────────────────────────
     const res = await CustomAxios.patch(url, fd, {
       headers: { "Content-Type": "multipart/form-data" },
     });

     if (res.status === 200) {
       disableData(groupIndex, itemIndex, false);
       toast.success("Data submitted successfully!");
     } else {
       toast.error("Save failed. Please try again.");
     }
   } catch (error) {
     console.error("Error in handleSave:", error);
     toast.error("An error occurred while saving. Please try again.");
   }
 };


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
    disableData(groupIndex, index, true);
  };
  return (
    <div className="pb-1 p-1">
      {loading ? (
        <div className="flex justify-center items-center h-[80vh]">
          <Loader />
        </div>
      ) : (
        <div className="container mx-auto p-4">
          <div className="space-y-4">
            {Protectiondata?.map((group, groupIndex) => (
              <Accordion
                key={groupIndex}
                title={
                  group.parentISA && group.parentControlQuestion
                    ? `${group.parentISA} - ${group.parentControlQuestion}`
                    : "Data Protection"
                }
              >
                {/* Conditionally render the content inside the collapsible section */}
                <div className="p-4">
                  <div className="flex overflow-x-auto whitespace-nowrap p-4 space-x-4 scrollbar-thin scrollbar-thumb-gray-500 scrollbar-track-[#e4e4e4]">
                    {group.Items?.map((item, itemIndex) => (
                      <button
                        key={itemIndex}
                        className={`flex justify-between items-center w-full px-4 py-2 rounded ${
                          selectedTab === `${groupIndex}-${itemIndex}`
                            ? "bg-[#050038] text-white font-semibold"
                            : "bg-gray-200"
                        } ${
                          item.readyState
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
                      className={`p-4 ${
                        selectedTab === `${groupIndex}-${itemIndex}`
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
                          <div className="font-bold mb-2">Requirement</div>
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
                        <ReferenceDocumentList
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

                      {item.referenceDocumentation?.length > 0 && (
                        <div className="my-4">
                          <h4 className="text-lg font-semibold mb-2">
                            Reference Documents
                          </h4>
                          <div className="overflow-x-auto">
                            <table className="min-w-full table-auto border-collapse">
                              <thead>
                                <tr className="bg-gray-100">
                                  <th className="border px-4 py-2 text-left">
                                    Title
                                  </th>
                                  <th className="border px-4 py-2 text-left">
                                    Filename
                                  </th>
                                  <th className="border px-4 py-2 text-left">
                                    Link
                                  </th>
                                  <th className="border px-4 py-2 text-left">
                                    Download
                                  </th>
                                  {/* <th className="border px-4 py-2 text-center">
                                  Actions
                                </th> */}
                                </tr>
                              </thead>
                              <tbody>
                                {item.referenceDocumentation.map(
                                  (doc, docIndex) => (
                                    <tr
                                      key={docIndex}
                                      className="hover:bg-gray-50"
                                    >
                                      <td className="border px-4 py-2">
                                        {doc.name}
                                      </td>
                                      <td className="border px-4 py-2">
                                        {doc.fileName || "—"}
                                      </td>
                                      <td className="border px-4 py-2">
                                        {doc.link ? (
                                          <a
                                            href={doc.link}
                                            target="_blank"
                                            rel="noopener"
                                            className="text-blue-600 hover:underline"
                                          >
                                            {doc.link}
                                          </a>
                                        ) : (
                                          "—"
                                        )}
                                      </td>
                                      <td className="border px-4 py-2">
                                        {doc.url ? (
                                          <a
                                            href={doc.url}
                                            target="_blank"
                                            rel="noopener"
                                            className="text-blue-600 hover:underline"
                                          >
                                            Download
                                          </a>
                                        ) : (
                                          "—"
                                        )}
                                      </td>
                                      {/* <td className="border px-4 py-2 text-center space-x-2">
                                      <button
                                        className="text-indigo-600 hover:underline"
                                        onClick={() =>
                                          handleEditReferenceDoc(
                                            groupIndex,
                                            itemIndex,
                                            docIndex
                                          )
                                        }
                                      >
                                        Edit
                                      </button>
                                      <button
                                        className="text-red-600 hover:underline"
                                        onClick={() =>
                                          handleDeleteReferenceDoc(
                                            groupIndex,
                                            itemIndex,
                                            docIndex
                                          )
                                        }
                                      >
                                        Delete
                                      </button>
                                    </td> */}
                                    </tr>
                                  )
                                )}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}
                      <CreateAndAssignTask
                        key={`task-${groupIndex}-${itemIndex}`}
                        // inject your one Requirements array under the “Must Requirements” key
                        item={{
                          ...item,
                          "Must Requirements": item.Requirements || [],
                        }}
                        employees={employees}
                      />
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
                            disableData(groupIndex, itemIndex, true);
                          }}
                        >
                          <option value="Ready">Ready</option>
                          <option value="Not Ready">Not Ready</option>
                        </select>
                      </div>
                      {/* Render Audit Specific */}
                      {isAuditMode && (
                        <>
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
                          {/* Observation Forms */}
                          {assessment_level === "AL3" && vda_type && id ? (
                            <AL3ObservationForm
                              key={`${groupIndex}-${itemIndex}`}
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
                                handleFieldBlur(
                                  groupIndex,
                                  itemIndex,
                                  name,
                                  value
                                )
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
                                handleFieldBlur(
                                  groupIndex,
                                  itemIndex,
                                  name,
                                  value
                                )
                              }
                            />
                          ) : null}
                        </>
                      )}
                      <div className="flex justify-end">
                        <button
                          onClick={() => handleSave(groupIndex, itemIndex)}
                          className={`flex items-center px-4 py-2 text-white rounded-md bg-blue-500 hover:bg-blue-600`}
                        >
                          <FaSave className="mr-2" /> Save
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </Accordion>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default TisaxDataProtection;
