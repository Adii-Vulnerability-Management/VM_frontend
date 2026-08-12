"use client";
import { baseurl, initURL } from "@/config/config";
import CustomAxios from "@/config/CustomAxios";
import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import Cookies from "js-cookie";

/* ---------- DnD (client-only) ---------- */
const DragDropContext = dynamic(
  () => import("@hello-pangea/dnd").then((m) => m.DragDropContext),
  { ssr: false },
);
const Droppable = dynamic(
  () => import("@hello-pangea/dnd").then((m) => m.Droppable),
  { ssr: false },
);
const Draggable = dynamic(
  () => import("@hello-pangea/dnd").then((m) => m.Draggable),
  { ssr: false },
);

/* ---------- your Tour + GuideButton ---------- */
import Tour from "@/components/Tour/Tour";
import GuideButton from "@/components/Tour/GuideButton";

/* ---------- helpers ---------- */
const slugifyId = (s) =>
  (s || "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "_")
    .replace(/[^a-z0-9_]/g, "")
    .replace(/^_+|_+$/g, "");

export default function OptInFormBuilder() {
  // ---------------- State ----------------
  const [schema, setSchema] = useState({
    showModal: false,
    domain: "",
    formId: "",
    formName: "",
    fields: [],
  });
  const [mode, setMode] = useState("build"); // 'build' | 'preview'
  const [formData, setFormData] = useState({});
  const [mounted, setMounted] = useState(false);

  // Websites (domains)
  const [websites, setWebsites] = useState([]);
  const [loadingWebsites, setLoadingWebsites] = useState(false);

  // DB configs list (below)
  const [configs, setConfigs] = useState([]);
  const [loadingConfigs, setLoadingConfigs] = useState(false);
  const [selectedConfigId, setSelectedConfigId] = useState(null);
  const [pdfUploadingFieldId, setPdfUploadingFieldId] = useState("");

  // Approval workflow
  const [employees, setEmployees] = useState([]);
  const [loadingEmployees, setLoadingEmployees] = useState(false);
  const [reviewApproverByConfig, setReviewApproverByConfig] = useState({});

  const rawUser =
    Cookies.get("user_data") || Cookies.get("user") || Cookies.get("auth_user");
  const currentUser = useMemo(() => {
    if (!rawUser) return null;
    try {
      return JSON.parse(rawUser);
    } catch {
      return null;
    }
  }, [rawUser]);

  const currentUserIdentity = useMemo(() => {
    const user = currentUser?.user || currentUser;
    if (!user) return null;
    return {
      id: String(user?._id || user?.id || user?.userId || user?.user_id || ""),
      email: String(user?.email || user?.username || "").trim().toLowerCase(),
      name: String(
        user?.name ||
          user?.fullName ||
          user?.displayName ||
          [user?.firstName, user?.lastName].filter(Boolean).join(" ") ||
          "",
      ).trim(),
    };
  }, [currentUser]);

  const myEmployee = useMemo(() => {
    if (!currentUserIdentity) return null;
    return (
      employees.find(
        (employee) =>
          currentUserIdentity.email &&
          String(employee?.email || "").trim().toLowerCase() ===
            currentUserIdentity.email,
      ) ||
      employees.find(
        (employee) =>
          currentUserIdentity.id &&
          String(employee?._id || employee?.id || "") === currentUserIdentity.id,
      ) ||
      null
    );
  }, [employees, currentUserIdentity]);

  // clone/copy mode
  const [isCloneMode, setIsCloneMode] = useState(false);
  // Field editor states
  const [editing, setEditing] = useState(null); // id or null
  const [draft, setDraft] = useState({
    id: "",
    type: "text",
    label: "",
    placeholder: "",
    required: false,
    otpEnabled: false,
    optionsRaw: "",
    labelLinkText: "",
    labelLinkUrl: "",
    labelLinkAction: "link",
    openPopupOnCheckboxClick: false,
    pdfUrl: null,
    mainOptionLabel: "",
    subOptionsRaw: "",
  });
  const [previewOtpState, setPreviewOtpState] = useState({});

  // --------- Tour (using your component) ----------
  const [tourOpen, setTourOpen] = useState(false);
  const tourSteps = [
    {
      target: '[data-tour="tab-build"]',
      content:
        "Build tab: configure your new webform here. The Guide button is next to this.",
      disableBeacon: true,
    },
    {
      target: '[data-tour="settings.formId"]',
      content:
        "Form ID: must be UNIQUE per domain. This is used to target where the form renders (inline) or which trigger opens the modal.",
      disableBeacon: true,
    },
    {
      target: '[data-tour="settings.formName"]',
      content: "Form Name: a descriptive name for your form.",
      disableBeacon: true,
    },
    {
      target: '[data-tour="settings.domain"]',
      content:
        "Domain: choose the website/domain where this form will be used. The embed script you copy later should match this domain.",
      disableBeacon: true,
    },
    {
      target: '[data-tour="settings.showModal"]',
      content:
        "Show form in a modal: if enabled, give this Form ID to any clickable element on your site; clicking it will open the form modal. If disabled, the runtime finds an element with this Form ID and renders inline.",
      disableBeacon: true,
    },
    {
      target: '[data-tour="field-editor"]',
      content:
        "Add field: create form inputs. Choose type, set label/placeholder, options for select, and mark Required if needed.",
      disableBeacon: true,
    },
    {
      target: '[data-tour="field-editor.id"]',
      content:
        "Field ID: must be unique within this form. Used as the key in submissions and preview.",
      disableBeacon: true,
    },
    {
      target: '[data-tour="current-fields"]',
      content: "Current fields: drag to reorder, edit or delete.",
      disableBeacon: true,
    },
    {
      target: '[data-tour="tab-preview"]',
      content:
        "Preview: switch to see how the form will look and interact before saving.",
      disableBeacon: true,
    },
    {
      target: '[data-tour="save-config"]',
      content:
        "Save configuration: updates the selected draft, or creates a new draft from an approved/published version without changing production.",
      disableBeacon: true,
    },
    {
      target: '[data-tour="saved-configs"]',
      content:
        "Saved configurations: copy the script for a domain and paste it into your website <head>. Then the form will render as inline or modal based on your settings.",
      disableBeacon: true,
    },
  ];

  // ---------------- Effects: initial load ----------------
  useEffect(() => {
    setMounted(true);
    setSchema((s) => ({
      showModal: false,
      domain: s.domain || "",
      path: s.path || "/",
      formId: s.formId || "",
      formName: s.formName || "",
      fields: s.fields?.length
        ? s.fields
        : [
            {
              id: "full_name",
              type: "text",
              label: "Full Name",
              required: true,
              placeholder: "Jane Doe",
            },
            {
              id: "email",
              type: "email",
              label: "Email",
              required: true,
              placeholder: "jane@example.com",
              otpEnabled: true,
            },
            {
              id: "subscribe",
              type: "checkbox",
              label: "I agree to receive updates and promotions.",
              required: false,
            },
          ],
    }));
  }, []);

  // Auto-suggest ID from label
  useEffect(() => {
    if (!draft.label) return;
    if (!draft.id) setDraft((d) => ({ ...d, id: slugifyId(draft.label) }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draft.label]);

  // ---------------- Fetch websites (domain options) ----------------
  useEffect(() => {
    async function fetchWebsites() {
      setLoadingWebsites(true);
      try {
        const res = await CustomAxios.get(`${baseurl}/${initURL}/cmp/websites`);
        const list = Array.isArray(res.data) ? res.data : [];
        setWebsites(list);
        if (!schema.domain && list.length > 0) {
          setSchema((s) => ({ ...s, domain: inferDomainValue(list[0]) }));
        }
      } catch (err) {
        console.error("Failed to load websites:", err);
        toast.warn("Failed to fetch websites.");
      } finally {
        setLoadingWebsites(false);
      }
    }
    fetchWebsites();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Load employees so a draft can be assigned to one named approver.
  useEffect(() => {
    let active = true;
    setLoadingEmployees(true);
    CustomAxios.get(`/${initURL}/apiv1/users/db`)
      .then((res) => {
        if (!active) return;
        const list = Array.isArray(res.data?.data)
          ? res.data.data
          : Array.isArray(res.data)
            ? res.data
            : [];
        setEmployees(list);
      })
      .catch((err) => {
        console.error("Failed to load approvers:", err);
        toast.warn("Could not load the approver list.");
      })
      .finally(() => {
        if (active) setLoadingEmployees(false);
      });
    return () => {
      active = false;
    };
  }, []);

  // ---------------- Fetch configs from DB ----------------
  // const loadConfigs = async () => {
  //   setLoadingConfigs(true);
  //   try {
  //     const res = await CustomAxios.get(
  //       `${baseurl}/${initURL}/internal-webforms`,
  //     );
  //     const list = Array.isArray(res.data) ? res.data : [];
  //     setConfigs(list);
  //     if (!selectedConfigId && list.length > 0) {
  //       handlePickConfig(list[0]);
  //     }
  //   } catch (err) {
  //     console.error("Failed to fetch configs:", err);
  //     toast.warn("Failed to fetch form configurations.");
  //   } finally {
  //     setLoadingConfigs(false);
  //   }
  // };
  const loadConfigs = async ({ autoPick = true } = {}) => {
    setLoadingConfigs(true);
    try {
      const res = await CustomAxios.get(
        `${baseurl}/${initURL}/internal-webforms`,
      );
      const list = Array.isArray(res.data) ? res.data : [];
      setConfigs(list);

      if (autoPick && !selectedConfigId && list.length > 0) {
        handlePickConfig(list[0]);
      }
    } catch (err) {
      console.error("Failed to fetch configs:", err);
      toast.warn("Failed to fetch form configurations.");
    } finally {
      setLoadingConfigs(false);
    }
  };
  useEffect(() => {
    loadConfigs({ autoPick: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const selectedConfig = useMemo(
    () =>
      configs.find(
        (item) => String(item?._id || item?.id || "") === String(selectedConfigId || ""),
      ) || null,
    [configs, selectedConfigId],
  );

  const isAssignedApprover = (doc) => {
    const assigned = doc?.approvalAssignee || {};
    const employeeId = String(myEmployee?._id || myEmployee?.id || "");
    const employeeEmail = String(myEmployee?.email || "").trim().toLowerCase();
    const userId = currentUserIdentity?.id || "";
    const userEmail = currentUserIdentity?.email || "";

    return !!(
      (assigned.id &&
        [employeeId, userId].filter(Boolean).includes(String(assigned.id))) ||
      (assigned.email &&
        [employeeEmail, userEmail]
          .filter(Boolean)
          .includes(String(assigned.email).trim().toLowerCase()))
    );
  };

  // ---------------- Helpers ----------------
  const inferDomainValue = (item) =>
    item?.domain || item?.hostname || item?.url || item?.name || item?.id || "";

  const optionArray = (raw) =>
    (raw || "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

  const nestedOptionArray = (mainLabel, rawSubOptions) => {
    const label = (mainLabel || "").trim();
    if (!label) return [];
    return [
      {
        label,
        value: slugifyId(label) || "main_option",
        subOptions: optionArray(rawSubOptions).map((sub, index) => ({
          label: sub,
          value: slugifyId(sub) || `sub_option_${index + 1}`,
        })),
      },
    ];
  };

  const isOtpProtectedField = (field) =>
    field?.type === "email" &&
    !!(field?.otpEnabled || field?.otpRequiredForSubmit);

  const isValidEmail = (value) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value || "");

  // Preview interactivity
  useEffect(() => {
    if (!mounted) return;
    const init = {};
    const otpInit = {};
    (schema.fields || []).forEach((f) => {
      init[f.id] =
        f.type === "checkbox"
          ? false
          : f.type === "checkbox-group"
            ? []
            : "";
      if (isOtpProtectedField(f)) {
        otpInit[f.id] = {
          code: "",
          input: "",
          sentTo: "",
          sent: false,
          verified: false,
        };
      }
    });
    setFormData(init);
    setPreviewOtpState(otpInit);
  }, [mounted, schema]);

  // ---------------- Persist to DB (UPSERT by domain) ----------------
  const persistSchema = async () => {
    try {
      if (!schema.domain || schema.domain.trim() === "") {
        toast.warn("Domain is required before saving.");
        return;
      }
      const cleanFormId = slugifyId(schema.formId);
      if (!cleanFormId) {
        toast.warn("Form ID is required in Form Settings.");
        return;
      }

      if (!schema.formName?.trim()) {
        toast.warn("Form Name is required.");
        return;
      }

      // Versioning intentionally allows the same logical formId to have many versions.
      if (!schema.fields || schema.fields.length === 0) {
        toast.warn("At least one field is required before saving.");
        return;
      }
      const normalizedFieldsForSave = (schema.fields || []).map((f) => ({
        ...f,
        id: slugifyId(f.id),
      }));
      const ids = normalizedFieldsForSave.map((f) => f.id);
      if (ids.some((id) => !id)) {
        return toast.warn("Every field must have a valid unique Field ID.");
      }
      const dup = ids.find((id, i) => ids.indexOf(id) !== i);
      if (dup) {
        return toast.warn(
          `Duplicate Field ID found: "${dup}". Field IDs must be unique.`,
        );
      }
      for (const f of normalizedFieldsForSave) {
        if (f.type === "select" && (!f.options || f.options.length === 0)) {
          toast.warn(`Field "${f.label}" (select) needs at least one option.`);
          return;
        }
        if (
          f.type === "checkbox-group" &&
          (!f.options || f.options.length === 0)
        ) {
          toast.warn(
            `Field "${f.label}" needs a main option and at least one sub option.`,
          );
          return;
        }
      }
      const payload = {
        showModal: !!schema.showModal,
        domain: schema.domain,
        path: schema.path || "/",
        formId: cleanFormId,
        // The backend uses this version as history linkage and creates a new immutable draft.
        baseVersionId: isCloneMode ? undefined : selectedConfigId || undefined,
        formName: schema.formName.trim(),
        fields: normalizedFieldsForSave.map((f) => ({
          id: f.id,
          type: f.type,
          label: f.label,
          required: !!f.required,
          placeholder: f.placeholder || "",
          otpEnabled: isOtpProtectedField(f),
          otpButtonPlacement: isOtpProtectedField(f) ? "inline" : undefined,
          otpRequiredForSubmit: isOtpProtectedField(f),
          ...(f.type === "select" ? { options: f.options || [] } : {}),
          ...(f.type === "checkbox-group" ? { options: f.options || [] } : {}),
          ...(f.type === "checkbox"
            ? {
                labelLinkText: f.labelLinkText || "",
                labelLinkUrl:
                  (f.labelLinkAction || "link") === "link"
                    ? f.labelLinkUrl || ""
                    : "",
                labelLinkAction: f.labelLinkAction || "link",
                openPopupOnCheckboxClick: !!f.openPopupOnCheckboxClick,
                pdfUrl:
                  (f.labelLinkAction || "link") === "popup"
                    ? f.pdfUrl || null
                    : null,
              }
            : {}),
        })),
      };
      const editingExistingDraft =
        !isCloneMode &&
        selectedConfig &&
        selectedConfig.versionStatus === "DRAFT";

      const requestPayload = editingExistingDraft
        ? { ...payload, baseVersionId: undefined }
        : payload;

      const res = editingExistingDraft
        ? await CustomAxios.patch(
            `${baseurl}/${initURL}/internal-webforms/${selectedConfigId}`,
            requestPayload,
          )
        : await CustomAxios.post(
            `${baseurl}/${initURL}/internal-webforms`,
            requestPayload,
          );
      // toast.success("Configuration saved to database.");
      // await loadConfigs();
      // const savedDoc =
      //   res?.data || configs.find((c) => c.domain === payload.domain) || null;
      // if (savedDoc) {
      //   setSelectedConfigId(savedDoc._id || savedDoc.id || null);
      // }
      toast.success(
        isCloneMode
          ? "Configuration cloned successfully."
          : editingExistingDraft
            ? "Draft changes saved."
            : "New draft version saved.",
      );

      await loadConfigs({ autoPick: false });

      const savedDoc = res?.data || null;

      if (savedDoc) {
        setSelectedConfigId(savedDoc._id || savedDoc.id || null);
      }

      setIsCloneMode(false);
    } catch (err) {
      console.error("Save failed:", err);
      toast.warn("Could not save configuration.");
    }
  };

  // ---------------- Field editor handlers ----------------
  const resetDraft = () =>
    setDraft({
      id: "",
      type: "text",
      label: "",
      placeholder: "",
      required: false,
      otpEnabled: false,
      optionsRaw: "",
      labelLinkText: "",
      labelLinkUrl: "",
      labelLinkAction: "link",
      openPopupOnCheckboxClick: false,
      pdfUrl: null,
      mainOptionLabel: "",
      subOptionsRaw: "",
    });

  const handleDraftPdfUpload = async (file) => {
    if (!file) return;
    if (!editing) {
      toast.warn(
        "Add this checkbox field first, then edit it to upload a PDF.",
      );
      return;
    }
    if (draft.pdfUrl?.url || draft.pdfUrl?.key) {
      toast.warn("Remove the existing PDF before uploading another one.");
      return;
    }
    if (!selectedConfigId) {
      toast.warn("Save or load this configuration before uploading a PDF.");
      return;
    }
    if (selectedConfig?.versionStatus !== "DRAFT") {
      toast.warn("Create or load a draft version before uploading a PDF.");
      return;
    }

    if (
      file.type !== "application/pdf" &&
      !file.name?.toLowerCase().endsWith(".pdf")
    ) {
      toast.warn("Only PDF files are allowed.");
      return;
    }

    try {
      setPdfUploadingFieldId(draft.id || "__draft__");
      const fd = new FormData();
      fd.append("file", file);

      const res = await CustomAxios.post(
        `${baseurl}/${initURL}/internal-webforms/${selectedConfigId}/checkbox-pdf`,
        fd,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );

      setDraft((d) => ({
        ...d,
        pdfUrl: res.data,
        labelLinkAction: "popup",
        labelLinkUrl: "",
      }));

      toast.success("PDF uploaded successfully.");
    } catch (err) {
      console.error("PDF upload failed:", err);
      toast.warn("PDF upload failed.");
    } finally {
      setPdfUploadingFieldId("");
    }
  };

  const handleRemoveDraftPdf = () => {
    setDraft((d) => ({
      ...d,
      pdfUrl: null,
    }));
    toast.success("PDF removed from this checkbox field.");
  };
  const onAddOrUpdate = () => {
    const normalizedLabel =
      draft.type === "checkbox-group"
        ? (draft.label || draft.mainOptionLabel || "").trim()
        : draft.label.trim();
    if (!normalizedLabel) return toast.warn("Label is required.");
    const cleanId = slugifyId(draft.id);
    if (!cleanId) return toast.warn("Field ID is required.");
    const fields = schema.fields || [];
    const idClash = fields.some((f) => f.id === cleanId && f.id !== editing);
    if (idClash) {
      return toast.warn(
        `Field ID "${cleanId}" is already in use. Please choose a different one.`,
      );
    }
    if (draft.type === "checkbox") {
      const hasLinkText = !!draft.labelLinkText?.trim();
      const hasLinkUrl = !!draft.labelLinkUrl?.trim();
      const hasPdfUrl = !!draft.pdfUrl?.key?.trim();
      const action = draft.labelLinkAction?.trim();
      if (hasLinkText && !hasLinkUrl && action !== "popup") {
        return toast.warn("Please enter the checkbox label link URL.");
      }

      if (!hasLinkText && hasLinkUrl && action !== "popup") {
        return toast.warn("Please enter the checkbox label link text.");
      }

      if (action === "popup" && !hasPdfUrl) {
        return toast.warn("Please upload a PDF for popup mode.");
      }

      if (draft.openPopupOnCheckboxClick && action !== "popup") {
        return toast.warn(
          "Checkbox click popup can be enabled only when Link Action is PDF popup.",
        );
      }
    }
    if (draft.type === "checkbox-group") {
      if (!draft.mainOptionLabel?.trim() && !draft.label?.trim()) {
        return toast.warn("Main option title is required.");
      }
      if (optionArray(draft.subOptionsRaw).length === 0) {
        return toast.warn("Please enter at least one sub option.");
      }
    }
    const base = {
      id: cleanId,
      type: draft.type,
      label: normalizedLabel,
      placeholder:
        draft.type === "checkbox" || draft.type === "checkbox-group"
          ? ""
          : draft.placeholder || "",
      required: !!draft.required,
      otpEnabled: draft.type === "email" ? !!draft.otpEnabled : false,
      ...(draft.type === "checkbox"
        ? {
            labelLinkText: draft.labelLinkText?.trim() || "",
            labelLinkUrl:
              draft.labelLinkAction === "link"
                ? draft.labelLinkUrl?.trim() || ""
                : "",
            labelLinkAction: draft.labelLinkAction || "link",
            openPopupOnCheckboxClick: !!draft.openPopupOnCheckboxClick,
            pdfUrl:
              draft.labelLinkAction === "popup" ? draft.pdfUrl || null : null,
          }
        : {}),
    };
    const withOptions =
      draft.type === "select"
        ? { ...base, options: optionArray(draft.optionsRaw) }
        : draft.type === "checkbox-group"
          ? {
              ...base,
              options: nestedOptionArray(
                draft.mainOptionLabel || draft.label,
                draft.subOptionsRaw,
              ),
            }
        : base;

    const nextFields = editing
      ? fields.map((f) => (f.id === editing ? withOptions : f))
      : [...fields, withOptions];

    setSchema({ ...schema, fields: nextFields });
    toast.success(editing ? "Field updated." : "Field added.");
    setEditing(null);
    resetDraft();
  };

  const onEdit = (f) => {
    setEditing(f.id);
    setDraft({
      id: f.id,
      type: f.type,
      label: f.label,
      placeholder: f.type === "checkbox" ? "" : f.placeholder || "",
      required: !!f.required,
      otpEnabled: !!f.otpEnabled,
      optionsRaw:
        f.type === "select" && Array.isArray(f.options)
          ? f.options.join(", ")
          : "",
      labelLinkText: f.labelLinkText || "",
      labelLinkUrl: f.labelLinkUrl || "",
      labelLinkAction: f.labelLinkAction || "link",
      openPopupOnCheckboxClick: !!f.openPopupOnCheckboxClick,
      pdfUrl: f.pdfUrl || null,
      mainOptionLabel:
        f.type === "checkbox-group" && Array.isArray(f.options)
          ? f.options[0]?.label || ""
          : "",
      subOptionsRaw:
        f.type === "checkbox-group" && Array.isArray(f.options)
          ? (f.options[0]?.subOptions || f.options[0]?.children || [])
              .map((opt) =>
                typeof opt === "string" ? opt : opt?.label || opt?.value || "",
              )
              .filter(Boolean)
              .join(", ")
          : "",
    });
    if (typeof window !== "undefined")
      window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const onRemove = (id) => {
    const nextFields = (schema.fields || []).filter((f) => f.id !== id);
    setSchema({ ...schema, fields: nextFields });
    toast.success("Field removed.");
    if (editing === id) {
      setEditing(null);
      resetDraft();
    }
  };

  // DND reorder handler
  const handleDragEnd = (result) => {
    const { source, destination } = result || {};
    if (!destination) return;
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    )
      return;

    const next = Array.from(schema.fields || []);
    const [moved] = next.splice(source.index, 1);
    next.splice(destination.index, 0, moved);
    setSchema({ ...schema, fields: next });
  };

  // Version lifecycle actions are explicit so saving a draft never changes production.
  const handleVersionAction = async (doc, action, body = undefined) => {
    const id = doc?._id || doc?.id;
    if (!id) return;
    try {
      await CustomAxios.post(
        `${baseurl}/${initURL}/internal-webforms/${id}/${action}`,
        body,
      );
      toast.success(`Version action completed: ${action}.`);
      await loadConfigs({ autoPick: false });
    } catch (err) {
      console.error(`Version action failed: ${action}`, err);
      toast.warn(err?.response?.data?.message || `Could not ${action} version.`);
    }
  };

  const handleSubmitReview = async (doc) => {
    const id = String(doc?._id || doc?.id || "");
    const selectedEmployeeId = reviewApproverByConfig[id];
    const employee = employees.find(
      (item) =>
        String(item?._id || item?.id || "") === String(selectedEmployeeId || ""),
    );

    if (!employee) {
      toast.warn("Select the person who must approve this version.");
      return;
    }

    await handleVersionAction(doc, "submit-review", {
      approverId: String(employee?._id || employee?.id || "") || undefined,
      approverEmail: employee?.email || undefined,
      approverName:
        employee?.name ||
        employee?.fullName ||
        [employee?.firstName, employee?.lastName].filter(Boolean).join(" ") ||
        employee?.email ||
        "Assigned approver",
    });
  };

  const handleRejectReview = async (doc) => {
    const reason = window.prompt("Reason for returning this version to draft:");
    if (!reason?.trim()) return;
    await handleVersionAction(doc, "reject-review", { reason: reason.trim() });
  };

  // ---------------- DB configs selection ----------------
  const handlePickConfig = (doc) => {
    setIsCloneMode(false);
    setSelectedConfigId(doc._id || doc.id || null);
    const normalizedFields = Array.isArray(doc.fields)
      ? doc.fields.map((f) => {
          const normalized =
            f.type === "checkbox_single" ? { ...f, type: "checkbox" } : f;
          return {
            ...normalized,
            otpEnabled: isOtpProtectedField(normalized),
            ...(normalized.type === "checkbox"
              ? {
                  labelLinkAction: normalized.labelLinkAction || "link",
                  openPopupOnCheckboxClick:
                    !!normalized.openPopupOnCheckboxClick,
                  pdfUrl: normalized.pdfUrl || null,
                }
              : {}),
          };
        })
      : [];
    setSchema({
      showModal: !!doc.showModal,
      domain: doc.domain || "",
      path: doc.path || "/",
      formId: slugifyId(doc.formId || ""),
      formName: doc.formName || "",
      fields: normalizedFields,
    });
    toast.success(
      doc.versionStatus === "DRAFT"
        ? "Draft loaded. Saving will update this draft."
        : "Version loaded. Saving will create the next draft version.",
    );
  };

  const handleDeleteConfig = async (doc) => {
    try {
      const id = doc._id || doc.id;
      if (!id) return;
      if (doc?.isActive) {
        toast.warn("Activate another published version before retiring this one.");
        return;
      }
      if (!window.confirm("Retire this version? Its history will be preserved.")) {
        return;
      }
      await CustomAxios.delete(`${baseurl}/${initURL}/internal-webforms/${id}`);
      toast.success("Version retired.");
      if (selectedConfigId === id) setSelectedConfigId(null);
      await loadConfigs();
    } catch (err) {
      console.error("Retire failed:", err);
      toast.warn(err?.response?.data?.message || "Could not retire version.");
    }
  };

  const handleCloneConfig = (doc) => {
    if (!doc) return;

    const normalizedFields = Array.isArray(doc.fields)
      ? doc.fields.map((f) => {
          const normalized =
            f.type === "checkbox_single" ? { ...f, type: "checkbox" } : f;

          return {
            ...normalized,
            options: Array.isArray(normalized.options)
              ? [...normalized.options]
              : normalized.options,
            otpEnabled: isOtpProtectedField(normalized),
          };
        })
      : [];

    setSelectedConfigId(null);
    setIsCloneMode(true);
    setMode("build");
    setEditing(null);
    resetDraft();

    setSchema({
      showModal: !!doc.showModal,

      // important: empty domain, user must select new domain
      domain: "",

      path: doc.path || "/",

      // keep the same logical Form ID; saving creates the next version
      // user can still change it if needed
      formId: slugifyId(doc.formId || ""),

      formName: `${doc.formName || "Webform"} Copy`,
      fields: normalizedFields,
    });

    toast.info("Configuration copied. Select a new domain and save.");

    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };
  // Build-time preview interactivity
  const handleFieldChange = (id, value) => {
    const f = (schema.fields || []).find((x) => x.id === id);
    if (!f) return;
    if (f.type === "checkbox-group") {
      setFormData((s) => {
        const current = Array.isArray(s[id]) ? s[id] : [];
        const next = current.includes(value)
          ? current.filter((item) => item !== value)
          : [...current, value];
        return { ...s, [id]: next };
      });
      return;
    }
    if (f.type === "checkbox") {
      setFormData((s) => ({ ...s, [id]: !s[id] }));
      return;
    }
    setFormData((s) => ({ ...s, [id]: value }));
    if (isOtpProtectedField(f)) {
      setPreviewOtpState((s) => ({
        ...s,
        [id]: {
          ...(s[id] || {}),
          input: "",
          sent: false,
          verified: false,
          sentTo: value,
        },
      }));
    }
  };

  const handlePreviewOtpInputChange = (id, value) => {
    setPreviewOtpState((s) => ({
      ...s,
      [id]: {
        ...(s[id] || {}),
        input: value,
      },
    }));
  };

  const handlePreviewSendOtp = (id) => {
    const field = (schema.fields || []).find((item) => item.id === id);
    const emailValue = String(formData[id] || "").trim();

    if (!field || !isOtpProtectedField(field)) return;
    if (!isValidEmail(emailValue)) {
      toast.warn("Enter a valid email address before sending OTP.");
      return;
    }

    const generatedCode = String(Math.floor(100000 + Math.random() * 900000));

    setPreviewOtpState((s) => ({
      ...s,
      [id]: {
        code: generatedCode,
        input: "",
        sentTo: emailValue,
        sent: true,
        verified: false,
      },
    }));

    toast.success(`Preview OTP generated for ${emailValue}: ${generatedCode}`);
  };

  const handlePreviewVerifyOtp = (id) => {
    const otpState = previewOtpState[id];
    if (!otpState?.sent) {
      toast.warn("Send the OTP before verifying it.");
      return;
    }
    if (!otpState.input?.trim()) {
      toast.warn("Enter the OTP code to verify.");
      return;
    }
    if (otpState.input.trim() !== otpState.code) {
      toast.error("Invalid OTP.");
      return;
    }

    setPreviewOtpState((s) => ({
      ...s,
      [id]: {
        ...s[id],
        verified: true,
      },
    }));
    toast.success("Email OTP verified successfully.");
  };

  const handlePreviewSubmit = () => {
    const missingRequired = (schema.fields || []).find((field) => {
      const value = formData[field.id];
      if (!field.required) return false;
      if (field.type === "checkbox") return !value;
      if (field.type === "checkbox-group") {
        return !Array.isArray(value) || value.length === 0;
      }
      return !String(value || "").trim();
    });

    if (missingRequired) {
      toast.warn(`"${missingRequired.label}" is required.`);
      return;
    }

    const unverifiedOtpField = (schema.fields || []).find((field) => {
      if (!isOtpProtectedField(field)) return false;
      return !previewOtpState[field.id]?.verified;
    });

    if (unverifiedOtpField) {
      toast.warn(`Verify OTP for "${unverifiedOtpField.label}" before submit.`);
      return;
    }

    toast.success("Preview form submitted successfully.");
  };

  const isPreviewSubmitBlocked = (schema.fields || []).some((field) => {
    if (!isOtpProtectedField(field)) return false;
    return !previewOtpState[field.id]?.verified;
  });

  const normalizeDomain = (d) => (d || "").trim();

  const copyToClipboard = async (text) => {
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
        return true;
      }
    } catch (_) {}
    try {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand("copy");
      document.body.removeChild(ta);
      return ok;
    } catch (_) {
      return false;
    }
  };

  const escapeScriptAttribute = (value) =>
    String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/"/g, "&quot;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");

  const buildRuntimeScriptTag = (config, includeVersion = false) => {
    const attributes = [
      `src="${escapeScriptAttribute(`${baseurl}/${initURL}/form-runtime.js`)}"`,
      `data-domain="${escapeScriptAttribute(normalizeDomain(config?.domain))}"`,
      `data-form-id="${escapeScriptAttribute(config?.formId)}"`,
    ];

    const deploymentPath = String(config?.path || "/").trim();
    if (deploymentPath && deploymentPath !== "/") {
      attributes.push(`data-path="${escapeScriptAttribute(deploymentPath)}"`);
    }

    // Leave data-version out for the live script so it follows future activations.
    if (includeVersion && Number(config?.versionNumber) > 0) {
      attributes.push(`data-version="${Number(config.versionNumber)}"`);
    }

    attributes.push("defer");
    return `<script ${attributes.join(" ")}></script>`;
  };

  // ---------------- UI ----------------
  if (!mounted) {
    return (
      <div className="min-h-screen bg-gray-50 text-gray-800">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-6">
          <div className="h-8 w-64 rounded bg-gray-200 animate-pulse" />
        </div>
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 pb-10">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <div className="h-6 w-48 rounded bg-gray-100 animate-pulse" />
            <div className="mt-4 h-24 w-full rounded bg-gray-50 animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      {/* Header with Guide + actions */}
      <div className=" px-2 sm:px-4 lg:px-6 py-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl text-[#2B245C] font-bold leading-tight">
              Form Builder
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Design fields and preview them.
            </p>
          </div>

          <div className="flex min-w-[720px] flex-wrap items-center gap-2">
            <GuideButton
              onClick={() => setTourOpen(true)}
              variant="primary"
              size="md"
              className="!from-blue-500 !to-blue-600 hover:!from-blue-400 hover:!to-blue-500 !text-white !border-blue-400/70 !shadow-blue-600/30"
              title="Start user guide"
            >
              Guide
            </GuideButton>

            <Tab
              active={mode === "build"}
              onClick={() => setMode("build")}
              dataAttrs={{ "data-tour": "tab-build" }}
            >
              Build
            </Tab>

            <Tab
              active={mode === "preview"}
              onClick={() => setMode("preview")}
              dataAttrs={{ "data-tour": "tab-preview" }}
            >
              Preview
            </Tab>

            <button
              type="button"
              onClick={persistSchema}
              className="rounded-lg bg-[#2B245C] px-6 py-2.5 text-sm font-medium text-white hover:bg-opacity-90"
              title="Save configuration to database"
              data-tour="save-config"
            >
              Save configuration
            </button>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="px-2 sm:px-4 lg:px-6 pb-10">
        {/* ===== BUILD ===== */}
        {mode === "build" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1 space-y-6">
              {/* Settings */}
              <section className="bg-white rounded-2xl border border-[#2B245C] p-5 shadow-lg hover:shadow-2xl transition-shadow duration-300">
                <h2 className="text-2xl font-bold text-[#2B245C] mb-1">
                  Form Settings
                </h2>
             {isCloneMode && (
  <div className="mb-4 rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-2 text-sm text-indigo-700">
    Copy mode active. Select a new domain, then click Save configuration.
  </div>
)}
                <div className="space-y-5">
                  {/* Form ID */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-2">
                      Form ID <span className="text-red-600">*</span>
                    </label>
                    <input
                      className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-indigo-200 transition-all"
                      placeholder="e.g. newsletter_optin"
                      value={schema.formId || ""}
                      onChange={(e) =>
                        setSchema((s) => ({
                          ...s,
                          formId: slugifyId(e.target.value),
                        }))
                      }
                      data-tour="settings.formId"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      This ID is the stable logical form identity across versions. Only letters,
                      numbers, and underscores are allowed.
                    </p>
                  </div>

                  {/* Form Name */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-2">
                      Form Name <span className="text-red-600">*</span>
                    </label>

                    <input
                      className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-indigo-200 transition-all"
                      placeholder="e.g. Newsletter Signup Form"
                      value={schema.formName || ""}
                      onChange={(e) =>
                        setSchema((s) => ({
                          ...s,
                          formName: e.target.value,
                        }))
                      }
                      data-tour="settings.formName"
                    />
                  </div>

                  <label
                    className="flex items-center gap-2"
                    data-tour="settings.showModal"
                  >
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                      checked={!!schema.showModal}
                      onChange={(e) =>
                        setSchema({ ...schema, showModal: e.target.checked })
                      }
                    />
                    <span className="text-sm text-gray-800">
                      Show form in a modal (instead of inline)
                    </span>
                  </label>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-2">
                      Domain
                    </label>
                    <select
                      className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 focus:border-indigo-500 focus:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-indigo-200 transition-all"
                      value={schema.domain || ""}
                      onChange={(e) =>
                        setSchema({ ...schema, domain: e.target.value })
                      }
                      data-tour="settings.domain"
                    >
                      <option value="">
                        {loadingWebsites ? "Loading…" : "Select a domain"}
                      </option>
                      {websites.map((w, i) => {
                        const val = inferDomainValue(w);
                        return (
                          <option key={`${val}-${i}`} value={val}>
                            {w?.domain || w?.hostname || w?.name || val}
                          </option>
                        );
                      })}
                    </select>
                  </div>

                  {/* Deployment path is separate from the logical form ID. */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-2">
                      Deployment Path
                    </label>
                    <input
                      className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-900"
                      placeholder="/signup"
                      value={schema.path || "/"}
                      onChange={(e) =>
                        setSchema({ ...schema, path: e.target.value || "/" })
                      }
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      The active version is resolved by domain, path, and Form ID.
                    </p>
                  </div>
                </div>
              </section>

              {/* Field editor */}
              <section
                className="bg-white rounded-2xl border border-[#2B245C] p-5 shadow-lg hover:shadow-2xl transition-shadow duration-300"
                data-tour="field-editor"
              >
                <h2 className="text-2xl font-bold text-[#2B245C] mb-1">
                  {editing ? "Edit field" : "Add field"}
                </h2>
                <p className="text-xs text-gray-500 mb-5">
                  Choose a type, set label and options (if needed), then save.
                </p>

                <div className="space-y-5">
                  {/* Field ID */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-2">
                      Field ID <span className="text-red-600">*</span>
                    </label>
                    <input
                      className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-indigo-200 transition-all"
                      placeholder="e.g. full_name"
                      value={draft.id}
                      onChange={(e) =>
                        setDraft((d) => ({
                          ...d,
                          id: slugifyId(e.target.value),
                        }))
                      }
                      data-tour="field-editor.id"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      Must be <b>unique</b> within the form.
                    </p>
                  </div>

                  {/* Type */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-2">
                      Type
                    </label>
                    <select
                      className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 focus:border-indigo-500 focus:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-indigo-200 transition-all"
                      value={draft.type}
                      onChange={(e) =>
                        setDraft((d) => ({ ...d, type: e.target.value }))
                      }
                    >
                      <option value="text">Text</option>
                      <option value="email">Email</option>
                      <option value="number">Number</option>
                      <option value="textarea">Textarea</option>
                      <option value="select">Select</option>
                      <option value="checkbox">Checkbox</option>
                      <option value="checkbox-group">
                        Main option with sub options
                      </option>
                    </select>
                  </div>

                  {/* Label */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-2">
                      Label
                    </label>
                    <input
                      className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-indigo-200 transition-all"
                      placeholder="e.g. Full Name"
                      value={draft.label}
                      onChange={(e) =>
                        setDraft((d) => ({ ...d, label: e.target.value }))
                      }
                    />
                  </div>

                  {draft.type === "checkbox" && (
                    <div className="grid grid-cols-1 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-2">
                          Link Action
                        </label>
                        <select
                          className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 focus:border-indigo-500 focus:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-indigo-200 transition-all"
                          value={draft.labelLinkAction || "link"}
                          onChange={(e) =>
                            setDraft((d) => ({
                              ...d,
                              labelLinkAction: e.target.value,
                              labelLinkUrl:
                                e.target.value === "popup"
                                  ? ""
                                  : d.labelLinkUrl,
                            }))
                          }
                          disabled={!editing}
                        >
                          <option value="link">Open as normal link</option>
                          <option value="popup">Open PDF popup</option>
                        </select>
                        {!editing && (
                          <p className="mt-1 text-xs text-gray-500">
                            PDF popup can be enabled after the checkbox field is
                            added.
                          </p>
                        )}
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-2">
                          Label Link Text
                        </label>
                        <input
                          className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-indigo-200 transition-all"
                          placeholder="e.g. Privacy Policy"
                          value={draft.labelLinkText || ""}
                          onChange={(e) =>
                            setDraft((d) => ({
                              ...d,
                              labelLinkText: e.target.value,
                            }))
                          }
                        />
                        <p className="mt-1 text-xs text-gray-500">
                          This clickable text will appear after the checkbox
                          label.
                        </p>
                      </div>

                      {draft.labelLinkAction !== "popup" && (
                        <div>
                          <label className="block text-xs font-semibold text-gray-700 mb-2">
                            Label Link URL
                          </label>
                          <input
                            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-indigo-200 transition-all"
                            placeholder="https://example.com/privacy"
                            value={draft.labelLinkUrl || ""}
                            onChange={(e) =>
                              setDraft((d) => ({
                                ...d,
                                labelLinkUrl: e.target.value,
                              }))
                            }
                          />
                        </div>
                      )}
                      {draft.labelLinkAction === "popup" && (
                        <div className="rounded-lg border border-indigo-200 bg-indigo-50 px-4 py-3">
                          <label className="block text-xs font-semibold text-gray-700 mb-2">
                            PDF for Popup
                          </label>

                          {!draft.pdfUrl?.url && (
                            <input
                              type="file"
                              accept="application/pdf,.pdf"
                              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm"
                              disabled={
                                !selectedConfigId ||
                                !editing ||
                                !!pdfUploadingFieldId
                              }
                              onChange={(e) =>
                                handleDraftPdfUpload(e.target.files?.[0])
                              }
                            />
                          )}

                          {!selectedConfigId && !draft.pdfUrl?.url && (
                            <p className="mt-2 text-xs text-amber-700">
                              Save or load this configuration before uploading a
                              PDF.
                            </p>
                          )}

                          {pdfUploadingFieldId && (
                            <p className="mt-2 text-xs text-gray-600">
                              Uploading PDF…
                            </p>
                          )}

                          {draft.pdfUrl?.key && (
                            <div className="mt-2 rounded-lg border border-green-200 bg-green-50 p-3">
                              <p className="text-xs text-green-700">
                                Uploaded: {draft.pdfUrl.originalName || "PDF"}
                              </p>

                              <div className="mt-2 flex flex-wrap items-center gap-2">
                                <a
                                  href={draft.pdfUrl.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex rounded-md border border-indigo-600 bg-white px-3 py-1.5 text-xs font-medium text-indigo-600 hover:bg-indigo-50"
                                >
                                  Preview PDF
                                </a>

                                <button
                                  type="button"
                                  onClick={handleRemoveDraftPdf}
                                  className="inline-flex rounded-md border border-red-600 bg-white px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50"
                                >
                                  Delete PDF
                                </button>
                              </div>
                            </div>
                          )}

                          <label className="mt-3 flex items-start gap-2">
                            <input
                              type="checkbox"
                              className="mt-1 h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                              checked={!!draft.openPopupOnCheckboxClick}
                              onChange={(e) =>
                                setDraft((d) => ({
                                  ...d,
                                  openPopupOnCheckboxClick: e.target.checked,
                                }))
                              }
                            />
                            <span className="text-sm text-gray-800">
                              Open PDF popup when checkbox is checked
                            </span>
                          </label>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Placeholder */}
                  {draft.type !== "checkbox" &&
                    draft.type !== "checkbox-group" && (
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-2">
                        Placeholder
                      </label>
                      <input
                        className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-indigo-200 transition-all"
                        placeholder="Optional placeholder"
                        value={draft.placeholder}
                        onChange={(e) =>
                          setDraft((d) => ({
                            ...d,
                            placeholder: e.target.value,
                          }))
                        }
                      />
                    </div>
                  )}

                  {draft.type === "email" && (
                    <label className="flex items-start gap-3 rounded-lg border border-indigo-200 bg-indigo-50 px-4 py-3">
                      <input
                        type="checkbox"
                        className="mt-1 h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                        checked={!!draft.otpEnabled}
                        onChange={(e) =>
                          setDraft((d) => ({
                            ...d,
                            otpEnabled: e.target.checked,
                          }))
                        }
                      />
                      <span className="text-sm text-gray-800">
                        Require OTP verification for this email field before
                        final submit. The runtime will place a send OTP button
                        beside the field.
                      </span>
                    </label>
                  )}

                  {/* Select options */}
                  {draft.type === "select" && (
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-2">
                        Options (comma-separated)
                      </label>
                      <input
                        className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-indigo-200 transition-all"
                        placeholder="e.g. Red, Green, Blue"
                        value={draft.optionsRaw}
                        onChange={(e) =>
                          setDraft((d) => ({
                            ...d,
                            optionsRaw: e.target.value,
                          }))
                        }
                      />
                    </div>
                  )}

                  {draft.type === "checkbox-group" && (
                    <div className="grid grid-cols-1 gap-4 rounded-lg border border-indigo-200 bg-indigo-50 px-4 py-3">
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-2">
                          Main Option
                        </label>
                        <input
                          className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-indigo-200 transition-all"
                          placeholder="e.g. Main Option"
                          value={draft.mainOptionLabel || ""}
                          onChange={(e) =>
                            setDraft((d) => ({
                              ...d,
                              mainOptionLabel: e.target.value,
                            }))
                          }
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-2">
                          Sub Options (comma-separated)
                        </label>
                        <input
                          className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-indigo-200 transition-all"
                          placeholder="e.g. Sub Option 1, Sub Option 2"
                          value={draft.subOptionsRaw || ""}
                          onChange={(e) =>
                            setDraft((d) => ({
                              ...d,
                              subOptionsRaw: e.target.value,
                            }))
                          }
                        />
                      </div>
                    </div>
                  )}

                  {/* Required */}
                  <div className="flex items-center gap-2">
                    <input
                      id="required"
                      type="checkbox"
                      className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                      checked={draft.required}
                      onChange={(e) =>
                        setDraft((d) => ({
                          ...d,
                          required: e.target.checked,
                        }))
                      }
                    />
                    <label htmlFor="required" className="text-sm text-gray-700">
                      Required
                    </label>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={onAddOrUpdate}
                      className="inline-flex items-center justify-center rounded-lg bg-[#2B245C] px-4 py-2 text-sm font-medium text-white hover:bg-opacity-90 active:scale-[0.99]"
                    >
                      {editing ? "Update Field" : "Add Field"}
                    </button>
                    {editing && (
                      <button
                        onClick={() => {
                          setEditing(null);
                          resetDraft();
                        }}
                        className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              </section>
            </div>

            {/* Field list with Drag & Drop */}
            <div className="lg:col-span-2" data-tour="current-fields">
              <section className="bg-white rounded-2xl border border-[#2B245C] p-5 shadow-lg hover:shadow-2xl transition-shadow duration-300">
                <h2 className="text-2xl font-bold text-[#2B245C] mb-1">
                  Current fields
                </h2>
                <p className="text-xs text-gray-500 mb-5">
                  Drag the handle to reorder, or edit/remove a field.
                </p>

                {(schema.fields || []).length === 0 ? (
                  <div className="rounded-lg border border-dashed border-gray-300 p-8 text-center text-gray-500">
                    No fields yet. Add your first field on the left.
                  </div>
                ) : (
                  <DragDropContext onDragEnd={handleDragEnd}>
                    <Droppable droppableId="field-list">
                      {(dropProvided) => (
                        <ul
                          ref={dropProvided.innerRef}
                          {...dropProvided.droppableProps}
                          className="space-y-3"
                        >
                          {(schema.fields || []).map((f, idx) => (
                            <Draggable
                              key={f.id}
                              draggableId={String(f.id)}
                              index={idx}
                            >
                              {(dragProvided, snapshot) => (
                                <li
                                  ref={dragProvided.innerRef}
                                  {...dragProvided.draggableProps}
                                  className={`rounded-lg border p-4 bg-white ${
                                    snapshot.isDragging
                                      ? "ring-2 ring-indigo-300"
                                      : ""
                                  }`}
                                >
                                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                                    <div className="flex items-start gap-3">
                                      {/* Drag handle */}
                                      <span
                                        {...dragProvided.dragHandleProps}
                                        className="mt-1 inline-flex h-6 w-6 items-center justify-center rounded-md border border-gray-200 text-gray-500 cursor-grab active:cursor-grabbing select-none"
                                        title="Drag to reorder"
                                      >
                                        ☰
                                      </span>

                                      <div>
                                        <div className="font-medium">
                                          {f.label}{" "}
                                          {f.required && (
                                            <span className="text-red-600">
                                              *
                                            </span>
                                          )}
                                        </div>
                                        <div className="text-xs text-gray-500 mt-0.5">
                                          ID:{" "}
                                          <code className="font-mono">
                                            {f.id}
                                          </code>
                                        </div>
                                        <div className="text-sm text-gray-600">
                                          <span className="capitalize">
                                            {typeLabel(f.type)}
                                          </span>
                                          {isOtpProtectedField(f)
                                            ? " • OTP required"
                                            : ""}
                                          {f.type === "checkbox" &&
                                            (f.labelLinkAction === "popup"
                                              ? f.labelLinkText &&
                                                f.pdfUrl?.url &&
                                                ` • PDF popup: "${f.labelLinkText}"`
                                              : f.labelLinkText &&
                                                f.labelLinkUrl &&
                                                ` • link: "${f.labelLinkText}"`)}

                                          {f.type === "checkbox" &&
                                            f.labelLinkAction === "popup" &&
                                            f.openPopupOnCheckboxClick &&
                                            f.pdfUrl?.url &&
                                            " • opens popup on check"}
                                          {f.placeholder &&
                                          f.type !== "checkbox"
                                            ? ` • placeholder: "${f.placeholder}"`
                                            : ""}
                                          {f.type === "select" &&
                                            Array.isArray(f.options) &&
                                            f.options.length > 0 && (
                                              <>
                                                {" "}
                                                • options:{" "}
                                                {f.options.join(", ")}
                                              </>
                                            )}
                                          {f.type === "checkbox-group" &&
                                            Array.isArray(f.options) &&
                                            f.options.length > 0 && (
                                              <>
                                                {" "}
                                                - main:{" "}
                                                {f.options[0]?.label ||
                                                  f.options[0]?.value}
                                                {(f.options[0]?.subOptions ||
                                                  f.options[0]?.children || [])
                                                  .length > 0
                                                  ? ` - sub: ${(
                                                      f.options[0]
                                                        ?.subOptions ||
                                                      f.options[0]?.children ||
                                                      []
                                                    )
                                                      .map((opt) =>
                                                        typeof opt === "string"
                                                          ? opt
                                                          : opt?.label ||
                                                            opt?.value,
                                                      )
                                                      .filter(Boolean)
                                                      .join(", ")}`
                                                  : ""}
                                              </>
                                            )}
                                        </div>
                                      </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                      <button
                                        onClick={() => onEdit(f)}
                                        className="rounded-lg bg-white px-3 py-1.5 text-sm text-[#2B245C] border border-[#2B245C] hover:bg-blue-50"
                                      >
                                        Edit
                                      </button>
                                      <button
                                        onClick={() => onRemove(f.id)}
                                        className="rounded-lg bg-white px-3 py-1.5 text-sm text-red-600 border border-red-600 hover:bg-red-50"
                                      >
                                        Delete
                                      </button>
                                    </div>
                                  </div>
                                </li>
                              )}
                            </Draggable>
                          ))}
                          {dropProvided.placeholder}
                        </ul>
                      )}
                    </Droppable>
                  </DragDropContext>
                )}
              </section>
            </div>
          </div>
        )}

        {/* ===== PREVIEW ===== */}
        {mode === "preview" && (
          <section className="mb-3 space-y-3 rounded-2xl border border-[#2B245C] bg-white p-6 shadow-lg hover:shadow-2xl transition-shadow duration-300">
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
              <div className="rounded-lg border p-3">
                <div className="text-xs text-gray-500">Form ID</div>
                <div className="text-sm font-medium">
                  {schema.formId || "—"}
                </div>
              </div>
              <div className="rounded-lg border p-3">
                <div className="text-xs text-gray-500">Form Name</div>
                <div className="text-sm font-medium">
                  {schema.formName || "—"}
                </div>
              </div>
              <div className="rounded-lg border p-3">
                <div className="text-xs text-gray-500">Show in modal</div>
                <div className="text-sm font-medium">
                  {schema.showModal ? "Yes" : "No"}
                </div>
              </div>
              <div className="rounded-lg border p-3">
                <div className="text-xs text-gray-500">Domain</div>
                <div className="text-sm font-medium">
                  {schema.domain || "—"}
                </div>
              </div>
            </div>

            {(schema.fields || []).length === 0 ? (
              <div className="rounded-lg border border-dashed border-gray-300 p-8 text-center text-gray-500">
                No fields to preview. Add some in the Build tab.
              </div>
            ) : (
              <div className="space-y-6">
                {(schema.fields || []).map((f) => (
                  <div key={f.id}>
                    {renderField(
                      f,
                      formData,
                      handleFieldChange,
                      previewOtpState,
                      handlePreviewOtpInputChange,
                      handlePreviewSendOtp,
                      handlePreviewVerifyOtp,
                    )}
                  </div>
                ))}
                <div className="flex justify-end">
                  <div className="text-right">
                    {isPreviewSubmitBlocked && (
                      <div className="mb-2 text-xs text-amber-700">
                        OTP verification is required before final submit.
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={handlePreviewSubmit}
                      disabled={isPreviewSubmitBlocked}
                      className="rounded-lg bg-[#2B245C] px-5 py-2.5 text-sm font-medium text-white hover:bg-opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Submit form
                    </button>
                  </div>
                </div>
              </div>
            )}
          </section>
        )}

        {/* ===== CONFIGURATIONS (from DB) ===== */}

        <section
          className="mt-6 rounded-2xl border border-[#2B245C] bg-white p-6 shadow-lg hover:shadow-2xl transition-shadow duration-300"
          data-tour="saved-configs"
        >
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-2xl font-bold text-[#2B245C]">
              Saved configurations
            </h2>
            <button
              type="button"
              onClick={loadConfigs}
              className="rounded-lg border border-[#2B245C] bg-white px-3 py-1.5 text-sm text-[#2B245C] hover:bg-blue-50"
            >
              Refresh
            </button>
          </div>

          {loadingConfigs ? (
            <div className="mt-4 text-sm text-gray-500">Loading…</div>
          ) : configs.length === 0 ? (
            <div className="mt-4 rounded-lg border border-dashed border-gray-300 p-8 text-center text-gray-500">
              No configurations in database yet.
            </div>
          ) : (
            <div>
              <div className="overflow-x-auto rounded-lg border border-gray-800">
                <table className="min-w-full text-sm">
                  <thead className="bg-[#2B245C] text-left text-white border-b border-gray-800">
                    <tr>
                      {[
                        "Domain",
                        "Form ID",
                        "Form Name",
                        "Path",
                        "Version",
                        "Status",
                        "Approver",
                        "Active",
                        "Show Modal",
                        "Fields",
                        "Updated",
                        "Actions",
                      ].map((h) => (
                        <th key={h} className="px-4 py-2 font-medium">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {configs.map((c) => {
                      const id = c._id || c.id;
                      const selected = id && selectedConfigId === id;
                      return (
                        <tr key={id} className={selected ? "bg-gray-50" : ""}>
                          <td className="px-4 py-2">{c.domain}</td>
                          <td className="px-4 py-2">{c.formId || "—"}</td>
                          <td className="px-4 py-2">{c.formName || "—"}</td>
                          <td className="px-4 py-2">{c.path || "/"}</td>
                          <td className="px-4 py-2">V{c.versionNumber || 1}</td>
                          <td className="px-4 py-2">
                            <span className="inline-flex rounded-full bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-700">
                              {c.versionStatus || "DRAFT"}
                            </span>
                          </td>
                          <td className="px-4 py-2">
                            {c.approvalAssignee?.name ||
                              c.approvalAssignee?.email ||
                              "—"}
                          </td>
                          <td className="px-4 py-2">
                            <span
                              className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                                c.isActive
                                  ? "bg-green-100 text-green-700"
                                  : "bg-gray-100 text-gray-600"
                              }`}
                            >
                              {c.isActive ? "Live" : "Inactive"}
                            </span>
                          </td>
                          <td className="px-4 py-2">
                            {c.showModal ? "Yes" : "No"}
                          </td>
                          <td className="px-4 py-2">
                            {Array.isArray(c.fields) ? c.fields.length : 0}
                          </td>
                          <td className="px-4 py-2">
                            {c.updatedAt
                              ? new Date(c.updatedAt).toLocaleString()
                              : c.createdAt
                                ? new Date(c.createdAt).toLocaleString()
                                : "—"}
                          </td>
                          <td className="px-4 py-2">
                            <div className="flex min-w-[620px] flex-wrap items-center gap-2">
                              <button
                                className="rounded-lg border border-[#2B245C] bg-white px-3 py-1 text-sm text-[#2B245C] hover:bg-gray-50"
                                onClick={() => handlePickConfig(c)}
                                title="Load to edit/preview"
                              >
                                Load
                              </button>

                              {c.versionStatus === "DRAFT" && (
                                <>
                                  <select
                                    value={reviewApproverByConfig[id] || ""}
                                    onChange={(event) =>
                                      setReviewApproverByConfig((current) => ({
                                        ...current,
                                        [id]: event.target.value,
                                      }))
                                    }
                                    disabled={loadingEmployees}
                                    className="max-w-52 rounded-lg border border-gray-300 bg-white px-2 py-1 text-sm"
                                    title="Person who alone may approve this version"
                                  >
                                    <option value="">
                                      {loadingEmployees
                                        ? "Loading approvers…"
                                        : "Select approver"}
                                    </option>
                                    {employees.map((employee) => {
                                      const employeeId = employee?._id || employee?.id;
                                      const employeeName =
                                        employee?.name ||
                                        employee?.fullName ||
                                        [employee?.firstName, employee?.lastName]
                                          .filter(Boolean)
                                          .join(" ") ||
                                        employee?.email ||
                                        employeeId;
                                      return (
                                        <option key={employeeId} value={employeeId}>
                                          {employeeName}
                                          {employee?.email
                                            ? ` (${employee.email})`
                                            : ""}
                                        </option>
                                      );
                                    })}
                                  </select>
                                  <button
                                    className="rounded-lg border border-amber-600 bg-white px-3 py-1 text-sm text-amber-700 disabled:cursor-not-allowed disabled:opacity-50"
                                    onClick={() => handleSubmitReview(c)}
                                    disabled={!reviewApproverByConfig[id]}
                                  >
                                    Assign & Submit
                                  </button>
                                </>
                              )}
                              {c.versionStatus === "IN_REVIEW" &&
                                (isAssignedApprover(c) ? (
                                  <>
                                    <button
                                      className="rounded-lg border border-blue-600 bg-white px-3 py-1 text-sm text-blue-700"
                                      onClick={() => handleVersionAction(c, "approve")}
                                    >
                                      Approve
                                    </button>
                                    <button
                                      className="rounded-lg border border-red-600 bg-white px-3 py-1 text-sm text-red-700"
                                      onClick={() => handleRejectReview(c)}
                                    >
                                      Return to Draft
                                    </button>
                                  </>
                                ) : (
                                  <span className="whitespace-nowrap text-xs text-gray-500">
                                    Awaiting assigned approver
                                  </span>
                                ))}
                              {c.versionStatus === "APPROVED" && (
                                <button
                                  className="rounded-lg border border-purple-600 bg-white px-3 py-1 text-sm text-purple-700"
                                  onClick={() => handleVersionAction(c, "publish")}
                                >
                                  Publish
                                </button>
                              )}
                              {c.versionStatus === "PUBLISHED" && !c.isActive && (
                                <button
                                  className="rounded-lg border border-green-600 bg-white px-3 py-1 text-sm text-green-700"
                                  onClick={() => handleVersionAction(c, "activate")}
                                >
                                  Activate
                                </button>
                              )}

<button
  type="button"
  className="rounded-lg bg-white px-3 py-1 text-sm text-indigo-600 border border-indigo-600 hover:bg-indigo-50"
  onClick={() => handleCloneConfig(c)}
  title="Copy this configuration to a new domain"
>
  Copy
</button>
                              {/* The live script follows whichever published version is active. */}
                              <div className="inline-flex overflow-hidden rounded-lg border border-green-600 bg-white">
                                <button
                                  className="px-3 py-1 text-sm font-medium text-green-700 hover:bg-green-50"
                                  onClick={async () => {
                                    const script = buildRuntimeScriptTag(c);
                                    const ok = await copyToClipboard(script);
                                    if (ok)
                                      toast.success(
                                        "Live script copied. It will follow the active version.",
                                      );
                                    else toast.warn("Failed to copy live script.");
                                  }}
                                  title="Copy script without a version; it always loads the active published version"
                                >
                                  Copy Live
                                </button>
                                {c.versionStatus === "PUBLISHED" && (
                                  <button
                                    className="border-l border-green-600 px-3 py-1 text-sm font-medium text-green-700 hover:bg-green-50"
                                    onClick={async () => {
                                      const script = buildRuntimeScriptTag(c, true);
                                      const ok = await copyToClipboard(script);
                                      if (ok)
                                        toast.success(
                                          `Version ${c.versionNumber || 1} script copied.`,
                                        );
                                      else
                                        toast.warn("Failed to copy version script.");
                                    }}
                                    title={`Copy script pinned to published version ${
                                      c.versionNumber || 1
                                    }`}
                                  >
                                    Copy V{c.versionNumber || 1}
                                  </button>
                                )}
                              </div>

                              <button
                                className="rounded-lg bg-white px-3 py-1 text-sm text-red-600 border border-red-600 hover:bg-red-50"
                                onClick={() => handleDeleteConfig(c)}
                                title="Retire version"
                              >
                                Retire
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                {/* <p className="mt-2 text-xs text-gray-500">
                Tip: Click <b>Load</b> on any row to edit it in the builder.
              </p> */}
              </div>
              <p className="mt-2 text-xs text-gray-500">
                Tip: Click <b>Load</b> on any row to edit it in the builder.
              </p>
            </div>
          )}
        </section>
      </div>

      {/* Your Tour instance (no auto-advance by default) */}
      <Tour
        steps={tourSteps}
        open={tourOpen}
        onClose={() => setTourOpen(false)}
      />
    </div>
  );
}

/* ---------- Small UI helpers ---------- */
function Tab({ active, onClick, children, dataAttrs = {} }) {
  return (
    <button
      onClick={onClick}
      {...dataAttrs}
      className={`rounded-lg px-6 py-2.5 text-sm font-medium transition
        ${
          active
            ? "bg-gray-900 text-white shadow"
            : "bg-white text-[#2B245C] border border-[#2B245C] hover:bg-blue-50"
        }`}
    >
      {children}
    </button>
  );
}

function typeLabel(t) {
  switch (t) {
    case "text":
      return "Text";
    case "email":
      return "Email";
    case "number":
      return "Number";
    case "textarea":
      return "Textarea";
    case "select":
      return "Select";
    case "checkbox":
      return "Checkbox";
    case "checkbox-group":
      return "Main option with sub options";
    default:
      return t;
  }
}

function renderField(
  f,
  formData,
  handleChange,
  previewOtpState = {},
  handlePreviewOtpInputChange = () => {},
  handlePreviewSendOtp = () => {},
  handlePreviewVerifyOtp = () => {},
) {
  const value = formData[f.id];
  const otpState = previewOtpState[f.id] || {};

  const labelEl =
    f.type === "checkbox" || f.type === "checkbox-group" ? null : (
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {f.label} {f.required && <span className="text-red-600">*</span>}
      </label>
    );

  if (f.type === "text") {
    return (
      <div>
        {labelEl}
        <input
          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          placeholder={f.placeholder || ""}
          value={value || ""}
          onChange={(e) => handleChange(f.id, e.target.value)}
        />
      </div>
    );
  }

  if (f.type === "email") {
    return (
      <div>
        {labelEl}
        <div className="space-y-3">
          <div className="flex flex-col gap-3 md:flex-row">
            <input
              type="email"
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder={f.placeholder || ""}
              value={value || ""}
              onChange={(e) => handleChange(f.id, e.target.value)}
            />
            {f.otpEnabled && (
              <button
                type="button"
                onClick={() => handlePreviewSendOtp(f.id)}
                className="rounded-lg border border-indigo-500 px-4 py-2 text-sm font-medium text-indigo-600 hover:bg-indigo-50"
              >
                {otpState.sent ? "Resend OTP" : "Send OTP"}
              </button>
            )}
          </div>

          {f.otpEnabled && (
            <div className="rounded-lg border border-dashed border-indigo-200 bg-indigo-50/50 p-3">
              <div className="flex flex-col gap-3 md:flex-row">
                <input
                  type="text"
                  inputMode="numeric"
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Enter OTP"
                  value={otpState.input || ""}
                  onChange={(e) =>
                    handlePreviewOtpInputChange(f.id, e.target.value)
                  }
                />
                <button
                  type="button"
                  onClick={() => handlePreviewVerifyOtp(f.id)}
                  className="rounded-lg bg-[#2B245C] px-4 py-2 text-sm font-medium text-white hover:bg-opacity-90"
                >
                  Verify OTP
                </button>
              </div>
              <div className="mt-2 text-xs text-gray-600">
                {otpState.verified
                  ? `Verified for ${otpState.sentTo || value || "this email"}.`
                  : otpState.sent
                    ? `OTP sent to ${otpState.sentTo || value || "this email"}.`
                    : "Send OTP to unlock final submit."}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (f.type === "number") {
    return (
      <div>
        {labelEl}
        <input
          type="number"
          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          placeholder={f.placeholder || ""}
          value={value || ""}
          onChange={(e) => handleChange(f.id, e.target.value)}
        />
      </div>
    );
  }

  if (f.type === "textarea") {
    return (
      <div>
        {labelEl}
        <textarea
          rows={4}
          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          placeholder={f.placeholder || ""}
          value={value || ""}
          onChange={(e) => handleChange(f.id, e.target.value)}
        />
      </div>
    );
  }

  if (f.type === "select") {
    return (
      <div>
        {labelEl}
        <select
          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          value={value || ""}
          onChange={(e) => handleChange(f.id, e.target.value)}
        >
          <option value="">Select…</option>
          {(f.options || []).map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      </div>
    );
  }

  if (f.type === "checkbox-group") {
    const selected = Array.isArray(value) ? value : [];
    const mainOptions = Array.isArray(f.options) ? f.options : [];

    return (
      <div>
        {labelEl}
        <div className="space-y-3 rounded-lg border border-gray-300 bg-white px-3 py-3">
          {mainOptions.map((main, mainIndex) => {
            const mainValue =
              typeof main === "string"
                ? main
                : main?.value || main?.label || `main_option_${mainIndex + 1}`;
            const mainLabel =
              typeof main === "string"
                ? main
                : main?.label ||
                  main?.value ||
                  f.label ||
                  `Main Option ${mainIndex + 1}`;
            const subOptions =
              typeof main === "string"
                ? []
                : main?.subOptions || main?.children || [];
            const mainId = `${f.id}_${mainIndex}`;

            return (
              <div key={mainValue} className="space-y-2">
                <label
                  htmlFor={mainId}
                  className="flex items-start gap-2 text-sm font-medium text-gray-800"
                >
                  <input
                    id={mainId}
                    type="checkbox"
                    className="mt-0.5 h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    checked={selected.includes(mainValue)}
                    onChange={() => handleChange(f.id, mainValue)}
                  />
                  <span>{mainLabel}</span>
                </label>

                {subOptions.length > 0 && (
                  <div className="ml-7 flex flex-wrap gap-x-5 gap-y-2">
                    {subOptions.map((sub, subIndex) => {
                      const subValue =
                        typeof sub === "string"
                          ? sub
                          : sub?.value ||
                            sub?.label ||
                            `${mainValue}_sub_${subIndex + 1}`;
                      const subLabel =
                        typeof sub === "string"
                          ? sub
                          : sub?.label ||
                            sub?.value ||
                            `Sub Option ${subIndex + 1}`;
                      const subId = `${mainId}_${subIndex}`;

                      return (
                        <label
                          key={subValue}
                          htmlFor={subId}
                          className="flex items-start gap-2 text-sm text-gray-700"
                        >
                          <input
                            id={subId}
                            type="checkbox"
                            className="mt-0.5 h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                            checked={selected.includes(subValue)}
                            onChange={() => handleChange(f.id, subValue)}
                          />
                          <span>{subLabel}</span>
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  if (f.type === "checkbox") {
    const checked = !!value;
    const htmlId = `${f.id}_checkbox`;
    const hasLabelLink = !!f.labelLinkText && !!f.labelLinkUrl;

    return (
      <div className="flex items-start gap-2">
        <input
          id={htmlId}
          type="checkbox"
          className="mt-1 h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
          checked={checked}
          onChange={() => handleChange(f.id, !checked)}
        />

        <div className="text-sm text-gray-700">
          <label htmlFor={htmlId} className="cursor-pointer">
            {f.label} {f.required && <span className="text-red-600">*</span>}
          </label>

          {hasLabelLink && (
            <>
              {" "}
              <a
                href={f.labelLinkUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-indigo-600 underline hover:text-indigo-800"
              >
                {f.labelLinkText}
              </a>
            </>
          )}
        </div>
      </div>
    );
  }

  return null;
}
