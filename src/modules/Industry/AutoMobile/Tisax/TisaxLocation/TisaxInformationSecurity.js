import React, { useEffect, useState } from "react";
import { baseurl, initURL } from "@/config/config";
import { useRouter } from "next/router";
import { toast } from "react-toastify";
import _ from "lodash";
import { ReferenceDocumentList, CommentsList, FindingsList } from "./Lists";
import CustomAxios from "@/config/CustomAxios";
import Loader from "@/components/ui/Loader";
import Accordion from "@/components/ui/Accordion";
import RequirementRenderer from "./RequirementRenderer";
import {
  AL2ObservationForm,
  AL3ObservationForm,
} from "../../TisaxAudit/Location/ObservationForm";
import { createTask } from "@/modules/ManagementHub/TaskManagementHub/TaskCreation";
import TaskAssignmentModal from "@/modules/ManagementHub/TaskManagementHub/TaskAssignmentModal";
import sendNotification from "@/utils/Notifications/Notification";
import Cookies from "js-cookie";
import CreateAndAssignTask from "../../CreateAndAssignTask";
function TisaxInformationSecurity(props) {
  const router = useRouter();
  const { id, vda_type, assessment_level } = router.query;
  const [InformationSecuritydata, setInformationSecurityData] = useState([]);
  const [isOpen, setIsOpen] = useState({});
  const [saveButtonVisibility, setSaveButtonVisibility] = useState({});
  const [isHydrated, setIsHydrated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [observationData, setObservationData] = useState([]);
  const [fieldErrors, setFieldErrors] = useState({});
  const [formData, setFormData] = useState([]);

  // Detect Audit Mode
  const isAuditMode = router.pathname.includes("/automobile/tisax-audit/");

  const [employees, setEmployees] = useState([]);

  const stored = Cookies.get("user_data");

  const rootId = router.query.rootId; // make sure you pass `rootId` in the URL
  const role = (() => {
    const stored = Cookies.get("user_data");
    return stored ? JSON.parse(stored).user_designation : "Admin";
  })();
  // fetch the people we can assign to
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
      } catch (err) {
        toast.error("Failed to load assignment list");
      }
    };
    fetchEmployees();
  }, []);

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
      setIsHydrated(true);
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);

        let rawControls = [];

        if (isAuditMode) {
          // ↪ exactly your existing audit URL
          const resp = await CustomAxios.get(
            `${baseurl}/${initURL}/tisax-audit/informationSecurity/${id}?vda_type=${vda_type}`
          );
          rawControls = resp.data;
        } else {
          // non-audit: pick the endpoint based on role
          if (role === "Admin") {
            const resp = await CustomAxios.get(
              `${baseurl}/${initURL}/tisax/informationSecurity/${id}`
            );
            rawControls = resp.data;
          } else if (role === "Assigner") {
            const resp = await CustomAxios.get(
              `${baseurl}/${initURL}/tisax/employee/informationSecurity/${id}`
            );
            rawControls = resp.data;
          } else if (role === "Reviewer") {
            const resp = await CustomAxios.get(
              `${baseurl}/${initURL}/assign-tisax-task/reviewer-assigned-tasks/${rootId}`
            );
            rawControls = resp.data.informationSecurityControls || [];
          } else {
            // Employee
            const list = (
              await CustomAxios.get(
                `${baseurl}/${initURL}/assign-tisax-task/employee-assigned-tasks`
              )
            ).data;
            const found = list.find((l) => l._id === rootId) || {};
            rawControls = found.informationSecurityControls || [];
          }
        }
        rawControls = rawControls.map((item) => {
          const refs = Array.isArray(item["Reference Documentation"])
            ? item["Reference Documentation"]
            : [];
          return {
            ...item,
            "Reference Documentation": refs.map((doc) =>
              typeof doc === "string"
                ? { name: doc, link: "" }
                : { name: doc.name, link: doc.link || "" }
            ),
          };
        });
        // group and sort exactly as you already do:
        const grouped = {};
        rawControls
          .sort((a, b) => {
            if (a["Root ISA New"] !== b["Root ISA New"]) {
              return a["Root ISA New"].localeCompare(b["Root ISA New"]);
            }
            if (a["Parent ISA New"] !== b["Parent ISA New"]) {
              return a["Parent ISA New"].localeCompare(b["Parent ISA New"]);
            }
            return a["ISA New"].localeCompare(b["ISA New"]);
          })
          .forEach((item) => {
            const key =
              item["Root ISA New"] + "_" + item["Root Control question"];
            if (!grouped[key]) {
              grouped[key] = {
                "Root ISA New": item["Root ISA New"],
                "Root Control question": item["Root Control question"],
                Items: [],
              };
            }
            grouped[key].Items.push({
              ...item,
              readyState: item.isReady || false,
            });
          });

        const finalResult = Object.values(grouped);
        setInformationSecurityData(finalResult);

        // if audit mode, re-initialize your observationData exactly as before
        if (isAuditMode) {
          const initialObs = finalResult.map((group) =>
            group.Items.map((item) => {
              const deviationType = item.deviationType || "";
              const deviationFound = item.deviationFound ?? false;
              const al2Plausible =
                assessment_level === "AL2" ? !deviationFound : undefined;
              return {
                deviationFound,
                noDeviation: !deviationFound,
                majorNonConformity: deviationType === "Major non-conformity",
                minorNonConformity: deviationType === "Minor non-conformity",
                observation: deviationType === "Observation",
                roomForImprovement: deviationType === "Room for improvement",
                description: item.deviationDescription || "",
                deviationType,
                ...(assessment_level === "AL2" && { al2Plausible }),
              };
            })
          );
          setObservationData(initialObs);
        }
      } catch (err) {
        console.error(err);
        toast.error("Failed to load Information Security data");
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchData();
  }, [isHydrated, id, rootId, role, isAuditMode]);

  const disableData = (groupIndex, itemIndex, value) => {
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
    disableData(groupIndex, itemIndex, true);
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
      disableData(groupIndex, itemIndex, true);
    }
    newData[groupIndex].Items[itemIndex][`${level} Requirements`][
      reqIndex
    ].answer = value;
    setInformationSecurityData(newData);
  };


    const handleRequirementChangeShould = (
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
        disableData(groupIndex, itemIndex, true);
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
      disableData(groupIndex, itemIndex, true);
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
      disableData(groupIndex, itemIndex, true);
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
      disableData(groupIndex, itemIndex, true);
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
    disableData(groupIndex, itemIndex, true);
  };

  // const handleSave = async (groupIndex, itemIndex) => {
  //   try {
  //     const updatedData = [...InformationSecuritydata];
  //     const editedGroup = updatedData[groupIndex];
  //     const editedItem = editedGroup.Items[itemIndex];

  //     // Common: Map Requirements (for non-audit flow)
  //     function mapRequirements(requirements) {
  //       return requirements.map(({ _id, ...rest }) => {
  //         const tempElement = document.createElement("div");
  //         tempElement.innerHTML = rest.answer;
  //         const text = tempElement.textContent || tempElement.innerText || "";
  //         return {
  //           question: rest.question,
  //           answer: text.trim() === "" ? null : text.trim(),
  //         };
  //       });
  //     }

  //     const requestBody = {
  //       "ISA New": editedItem["ISA New"] || "",
  //       "Maturity Level": editedItem["Maturity Level"] || 0,
  //     };

  //     if (isAuditMode) {
  //       // 🎯 AUDIT MODE LOGIC
  //       const observation = observationData?.[groupIndex]?.[itemIndex];

  //       const filteredInputFieldsReference =
  //         editedItem["Reference Documentation"]?.filter(
  //           (doc) => doc.name.trim() !== "" || doc.link.trim() !== ""
  //         ) ?? [];

  //       const filteredInputFieldsFindings = editedItem["findings"]?.filter(
  //         (item) => item !== ""
  //       );
  //       const filteredInputFieldsComments = editedItem["comments"]?.filter(
  //         (item) => item !== ""
  //       );

  //       if (!observation) {
  //         toast.error("Please add description and deviation type");
  //         return;
  //       }

  //       if (observation.deviationFound && !observation.deviationType) {
  //         toast.error("Deviation type is required when a deviation is found.");
  //         return;
  //       }

  //       if (
  //         observation.deviationFound &&
  //         (!observation.description || !observation.description.trim())
  //       ) {
  //         toast.error("Description is required when a deviation is found.");
  //         return;
  //       }

  //       requestBody["Reference Documentation"] =
  //         filteredInputFieldsReference?.length > 0
  //           ? filteredInputFieldsReference
  //           : null;
  //       requestBody.findings =
  //         filteredInputFieldsFindings?.length > 0
  //           ? filteredInputFieldsFindings
  //           : null;
  //       requestBody.comments =
  //         filteredInputFieldsComments?.length > 0
  //           ? filteredInputFieldsComments
  //           : null;

  //       requestBody.deviationFound = observation.deviationFound;
  //       requestBody.deviationType = observation.noDeviation
  //         ? null
  //         : observation.deviationType;
  //       requestBody.deviationDescription = observation.noDeviation
  //         ? null
  //         : observation.description;

  //       if (
  //         assessment_level === "AL2" &&
  //         observation.al2Plausible !== undefined
  //       ) {
  //         requestBody.plausible = observation.al2Plausible;
  //       }

  //       const response = await CustomAxios.patch(
  //         `${baseurl}/${initURL}/tisax-audit/informationSecurityQnAImport/${id}?vda_type=${vda_type}`,
  //         requestBody
  //       );

  //       if (response.status === 200) {
  //         disableData(groupIndex, itemIndex, false);
  //         toast.success("Audit data submitted successfully!");
  //       } else {
  //         toast.error("Audit Data Not saved. Please check again");
  //       }
  //     } else {
  //       // 🎯 NORMAL MODE LOGIC
  //       requestBody["Must Requirements"] = mapRequirements(
  //         editedItem["Must Requirements"] || []
  //       );
  //       requestBody["Should Requirements"] = mapRequirements(
  //         editedItem["Should Requirements"] || []
  //       );
  //       requestBody["Additional requirements for high protection needs"] =
  //         mapRequirements(
  //           editedItem["Additional requirements for high protection needs"] ||
  //             []
  //         );
  //       requestBody["Additional requirements for very high protection needs"] =
  //         mapRequirements(
  //           editedItem[
  //             "Additional requirements for very high protection needs"
  //           ] || []
  //         );
  //       requestBody[
  //         "Additional requirements for Simplified Group Assessments"
  //       ] = mapRequirements(
  //         editedItem[
  //           "Additional requirements for Simplified Group Assessments"
  //         ] || []
  //       );

  //       requestBody["Reference Documentation"] = editedItem[
  //         "Reference Documentation"
  //       ]?.length
  //         ? editedItem["Reference Documentation"]
  //         : null;

  //       requestBody.isReady = editedItem.readyState;

  //       // const response = await CustomAxios.patch(
  //       //   `${baseurl}/${initURL}/tisax/informationSecurity/${id}`,
  //       //   requestBody
  //       // );

  //       // if (response.status === 200) {
  //       //   disableData(groupIndex, itemIndex, false);
  //       //   toast.success("Data submitted successfully!");
  //       // } else {
  //       //   toast.error("Data Not saved. Please check again");
  //       // }

  //       // … inside your handleSave → else { /* NORMAL MODE LOGIC */ } block, after you’ve built requestBody …

  //       // pick the right endpoint by role:
  //       // decide the URL segment once
  //       const segment =
  //         role === "Admin"
  //           ? "informationSecurity"
  //           : "employee/informationSecurity";

  //       // build your full patch URL
  //       const patchUrl = `${baseurl}/${initURL}/tisax/${segment}/${id}`;

  //       const response = await CustomAxios.patch(patchUrl, requestBody);

  //       if (response.status === 200) {
  //         disableData(groupIndex, itemIndex, false);
  //         toast.success("Data submitted successfully!");
  //       } else {
  //         toast.error("Data not saved. Please check again");
  //       }
  //     }
  //   } catch (error) {
  //     console.error("Error saving data:", error);
  //     toast.error("An error occurred while saving.");
  //   }
  // };
// const handleSave = async (groupIndex, itemIndex) => {
//   try {
//     const editedItem = InformationSecuritydata[groupIndex].Items[itemIndex];

//     // Build JSON payload
//     const payload = {
//       "ISA New": editedItem["ISA New"] || "",
//       "Maturity Level": editedItem["Maturity Level"] || 0,
//       isReady: editedItem.readyState,

//       // only link-based docs in JSON
//       "Reference Documentation": (editedItem["Reference Documentation"] || [])
//         .filter((d) => d.link) // drop any d.file
//         .map((d) => ({ name: d.name, link: d.link })),
//     };

//     if (isAuditMode) {
//       const obs = observationData[groupIndex]?.[itemIndex] || {};
//       if (obs.deviationFound) {
//         if (!obs.deviationType) {
//           return toast.error("Deviation type is required");
//         }
//         if (!obs.description?.trim()) {
//           return toast.error("Description is required");
//         }
//       }

//       payload.findings = editedItem.findings?.filter((f) => f.trim()) || [];
//       payload.comments = editedItem.comments?.filter((c) => c.trim()) || [];
//       payload.deviationFound = obs.deviationFound || false;
//       if (obs.deviationFound) {
//         payload.deviationType = obs.deviationType;
//         payload.deviationDescription = obs.description;
//         if (assessment_level === "AL2" && obs.al2Plausible !== undefined) {
//           payload.plausible = obs.al2Plausible;
//         }
//       }

//       const auditUrl = `${baseurl}/${initURL}/tisax-audit/informationSecurityQnAImport/${id}?vda_type=${vda_type}`;
//       const resp = await CustomAxios.patch(auditUrl, payload);
//       if (resp.status === 200) {
//         disableData(groupIndex, itemIndex, false);
//         toast.success("Audit data submitted successfully!");
//       } else {
//         toast.error("Audit data not saved. Please check again.");
//       }
//     } else {
//       // helper to strip HTML to plain text
//       const strip = (html) => {
//         const div = document.createElement("div");
//         div.innerHTML = html || "";
//         return (div.textContent || div.innerText || "").trim() || null;
//       };
//       const pack = (key) =>
//         (editedItem[key] || []).map((r) => ({
//           question: r.question,
//           answer: strip(r.answer),
//         }));

//       payload["Must Requirements"] = pack("Must Requirements");
//       payload["Should Requirements"] = pack("Should Requirements");
//       payload["Additional requirements for high protection needs"] = pack(
//         "Additional requirements for high protection needs"
//       );
//       payload["Additional requirements for very high protection needs"] = pack(
//         "Additional requirements for very high protection needs"
//       );
//       payload["Additional requirements for Simplified Group Assessments"] =
//         pack("Additional requirements for Simplified Group Assessments");

//       const segment =
//         role === "Admin"
//           ? "informationSecurity"
//           : "employee/informationSecurity";
//       const normalUrl = `${baseurl}/${initURL}/tisax/${segment}/${id}`;
//       const resp = await CustomAxios.patch(normalUrl, payload, {
//         headers: { "Content-Type": "multipart/form-data" },
//       });
//       if (resp.status === 200) {
//         disableData(groupIndex, itemIndex, false);
//         toast.success("Data submitted successfully!");
//       } else {
//         toast.error("Data not saved. Please check again.");
//       }
//     }
//   } catch (error) {
//     console.error("Error saving data:", error);
//     toast.error("An error occurred while saving.");
//   }
// };

const handleSave = async (groupIndex, itemIndex) => {
  try {
    const editedItem = InformationSecuritydata[groupIndex].Items[itemIndex];
    const formData = new FormData();

    // ─── Scalars ───────────────────────────────────────────────────────────────
    formData.append("ISA New", editedItem["ISA New"] || "");
    formData.append(
      "Maturity Level",
      String(editedItem["Maturity Level"] ?? 0)
    );
    formData.append("isReady", editedItem.readyState ? "true" : "false");

    // ─── Reference Documentation: links ────────────────────────────────────────
    (editedItem["Reference Documentation"] || [])
      .filter((d) => d.link && !d.file)
      .forEach((d, i) => {
        formData.append(`Reference Documentation[${i}][name]`, d.name);
        formData.append(`Reference Documentation[${i}][link]`, d.link);
      });

    // ─── Reference Documentation: files ───────────────────────────────────────
    (editedItem["Reference Documentation"] || [])
      .filter((d) => d.file)
      .forEach((d) => {
        formData.append("referenceDocsName", d.name);
        formData.append("referenceDocs", d.file, d.file.name);
      });

    // ─── Helper to strip HTML to plain text ───────────────────────────────────
    const strip = (html) => {
      const div = document.createElement("div");
      div.innerHTML = html || "";
      return (div.textContent || div.innerText || "").trim() || "";
    };

    // ─── Requirements arrays ─────────────────────────────────────────────────
    const sections = [
      "Must Requirements",
      "Should Requirements",
      "Additional requirements for high protection needs",
      "Additional requirements for very high protection needs",
      "Additional requirements for Simplified Group Assessments",
    ];
    sections.forEach((section) => {
      (editedItem[section] || []).forEach((r, i) => {
        formData.append(`${section}[${i}][question]`, r.question);
        formData.append(`${section}[${i}][answer]`, strip(r.answer));
      });
    });

    if (isAuditMode) {
      // ─── AUDIT MODE ──────────────────────────────────────────────────────────
      const obs = observationData?.[groupIndex]?.[itemIndex] || {};
      if (obs.deviationFound) {
        if (!obs.deviationType) {
          return toast.error(
            "Deviation type is required when a deviation is found."
          );
        }
        if (!obs.description?.trim()) {
          return toast.error(
            "Description is required when a deviation is found."
          );
        }
      }

      // findings & comments
      (editedItem.findings || []).forEach((f, i) => {
        formData.append(`findings[${i}]`, f);
      });
      (editedItem.comments || []).forEach((c, i) => {
        formData.append(`comments[${i}]`, c);
      });

      // deviation flags
      formData.append("deviationFound", obs.deviationFound ? "true" : "false");
      if (obs.deviationFound) {
        formData.append("deviationType", obs.deviationType);
        formData.append("deviationDescription", obs.description);
        if (assessment_level === "AL2" && obs.al2Plausible !== undefined) {
          formData.append("plausible", obs.al2Plausible ? "true" : "false");
        }
      }

      const auditUrl = `${baseurl}/${initURL}/tisax-audit/informationSecurityQnAImport/${id}?vda_type=${vda_type}`;
      const resp = await CustomAxios.patch(auditUrl, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (resp.status === 200) {
        disableData(groupIndex, itemIndex, false);
        toast.success("Audit data submitted successfully!");
      } else {
        toast.error("Audit Data not saved. Please check again.");
      }
    } else {
      // ─── NORMAL MODE ─────────────────────────────────────────────────────────
      const segment =
        role === "Admin"
          ? "informationSecurity"
          : "employee/informationSecurity";
      const normalUrl = `${baseurl}/${initURL}/tisax/${segment}/${id}`;
      const resp = await CustomAxios.patch(normalUrl, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (resp.status === 200) {
        disableData(groupIndex, itemIndex, false);
        toast.success("Data submitted successfully!");
      } else {
        toast.error("Data not saved. Please check again.");
      }
    }
  } catch (error) {
    console.error("Error saving data:", error);
    toast.error("An error occurred while saving.");
  }
};

  const [selectedTab, setSelectedTab] = useState("tab-0");

  const handleTabClick = (eventKey) => {
    setSelectedTab(eventKey);
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
        <div className="space-y-4">
          {InformationSecuritydata?.map((group, groupIndex) => (
            <div key={groupIndex}>
              <Accordion
                title={`${group["Root ISA New"]} - ${group["Root Control question"]}`}
              >
                <div className="flex overflow-x-auto  whitespace-nowrap p-4 space-x-4 scrollbar-thin scrollbar-thumb-gray-500 scrollbar-track-[#e4e4e4]">
                  {group.Items?.map((item, itemIndex) => (
                    <button
                      key={itemIndex}
                      className={`flex justify-between items-center w-full px-4 py-2 rounded ${
                        isOpen[groupIndex + "-" + itemIndex]
                          ? "bg-[#050038] text-white font-semibold"
                          : "bg-gray-200"
                      } ${
                        item.readyState
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
                    className={`p-4 ${
                      isOpen[groupIndex + "-" + itemIndex] ? "block" : "hidden"
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
                                  className={`px-6 py-3 rounded-lg transition duration-200 ${
                                    selectedTab === eventKey
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

                                <RequirementRenderer
                                  item={item}
                                  sectionKey="Must Requirements"
                                  groupIndex={groupIndex}
                                  itemIndex={itemIndex}
                                  levelType="Must"
                                  onChangeRequirement={handleRequirementChange}
                                />
                              </div>
                            )}

                          {selectedTab === "tab-1" &&
                            item["Should Requirements"]?.length > 0 && (
                              <div>
                                <h3 className="text-xl font-semibold mb-2 text-gray-700">
                                  Should Requirements
                                </h3>

                                <RequirementRenderer
                                  item={item}
                                  sectionKey="Should Requirements"
                                  groupIndex={groupIndex}
                                  itemIndex={itemIndex}
                                  levelType="Should"
                                  onChangeRequirement={handleRequirementChangeShould}
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

                                <RequirementRenderer
                                  item={item}
                                  sectionKey="Additional requirements for high protection needs"
                                  groupIndex={groupIndex}
                                  itemIndex={itemIndex}
                                  levelType="Must"
                                  onChangeRequirement={
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

                                <RequirementRenderer
                                  item={item}
                                  sectionKey="Additional requirements for very high protection needs"
                                  groupIndex={groupIndex}
                                  itemIndex={itemIndex}
                                  levelType="Very High"
                                  onChangeRequirement={
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

                                <RequirementRenderer
                                  item={item}
                                  sectionKey="Additional requirements for Simplified Group Assessments"
                                  groupIndex={groupIndex}
                                  itemIndex={itemIndex}
                                  levelType="SGA"
                                  onChangeRequirement={handleSGA}
                                />
                              </div>
                            )}
                        </div>
                      </div>
                    </div>
                    <div className="my-4">
                      <ReferenceDocumentList
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
                              {item.referenceDocumentation.map((doc, idx) => (
                                <tr key={idx} className="hover:bg-gray-50">
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
                                          idx
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
                                          idx
                                        )
                                      }
                                    >
                                      Delete
                                    </button>
                                  </td> */}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                    <CreateAndAssignTask
                      key={`task-${groupIndex}-${itemIndex}`}
                      item={item}
                      employees={employees}
                    />
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
                      {" "}
                      <button
                        onClick={() => handleSave(groupIndex, itemIndex)}
                        className="px-4 py-2 bg-[#007ACC] hover:bg-[#005A99] active:bg-[#004F8A] text-white rounded "
                      >
                        Save
                      </button>
                    </div>
                  </div>
                ))}
              </Accordion>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default TisaxInformationSecurity;
