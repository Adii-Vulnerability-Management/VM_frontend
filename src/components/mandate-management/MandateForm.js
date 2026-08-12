"use client";

import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ExternalLink,
  Eye,
  FileSearch,
  LayoutDashboard,
  Save,
  Upload,
  X,
} from "lucide-react";
import axios from "axios";
import CustomAxios from "@/config/CustomAxios";
import { API, BASE_URL } from "@/services/api/API_CONSTANT";
import { useToast } from "@/services/message/toast";
import Loader from "@/components/mandate-management/Loader.jsx";
import { normalizeDocumentUrl } from "@/components/mandate-management/DocumentPreview";

const BASE_DEPARTMENTS = [
  "DoR",
  "DPSS",
  "FMRD",
  "DOR.AUT.REC",
  "DSIM",
  "FIDIM",
  "DMM",
  "Department of Supervision",
  "Department of Economic Affairs",
];

const isMandateAiEndpoint = (url) =>
  typeof url === "string" &&
  (url.includes("/mandate-ai/") ||
    url.includes("/api/metadata/") ||
    url.includes("/api/controls/"));

const publicAxios = axios.create({ withCredentials: false });

const postFormData = (endpoint, formData) => {
  if (isMandateAiEndpoint(endpoint)) {
    return publicAxios.post(endpoint, formData);
  }

  return CustomAxios.post(endpoint, formData);
};

const CATEGORY_TYPES = [
  "Circular",
  "Master Direction",
  "Master Circular",
  "FAQ",
  "Notification",
  "Directions",
  "Amendment Directions",
];

const AUDIENCE_OPTIONS = [
  "All Commercial Banks",
  "NBFCs",
  "Payment System Operators",
  "Co-operative Banks",
  "Regional Rural Banks",
  "Payment Banks",
  "All Regulated Entities",
];

const LEGAL_REVIEWERS = [
  "RamChand Sharma",
  "Anita Desai",
  "Vikram Singh",
  "Sunita Sharma",
  "Rohit Verma",
  "Rajesh Tandon Rao",
];

// Mandate status is locked to Pending Review
const STATUS_OPTIONS = ["Pending Review"];

const MATCH_OPTIONS = ["New Mandate", "Update Existing", "Duplicate"];

const PRIORITY_OPTIONS = ["Critical", "High", "Medium", "Low"];

const PRIORITY_BADGE = {
  Critical: "bg-red-100 text-red-700 border-red-200",
  High: "bg-orange-100 text-orange-700 border-orange-200",
  Medium: "bg-yellow-100 text-yellow-700 border-yellow-200",
  Low: "bg-green-100 text-green-700 border-green-200",
};

function cx(...c) {
  return c.filter(Boolean).join(" ");
}

function formatAxiosError(err) {
  const status = err?.response?.status ?? err?.status ?? null;
  const message =
    err?.response?.data?.message ||
    err?.response?.data?.error ||
    err?.message ||
    "Unknown error";
  return { status, message };
}

const toIsoOrNull = (value) => {
  if (!value) return null;
  const d = new Date(value);
  return isNaN(d) ? null : d.toISOString();
};

// Only accept ISO-like yyyy-mm-dd strings for date inputs
const pickValidDateString = (value) => {
  if (!value) return "";
  const str = String(value).trim();
  return /^\d{4}-\d{2}-\d{2}$/.test(str) ? str : "";
};

function Section({ title, defaultOpen = true, children }) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="mt-5">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between rounded-xl border border-[#2B245C] bg-blue-50 px-4 py-3 shadow-sm hover:bg-white"
      >
        <div className="flex items-center gap-2">
          <span className="text-lg font-extrabold text-[#2B245C]">{title}</span>
        </div>

        <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 bg-white font-black text-[#050038]">
          {open ? "▾" : "▸"}
        </span>
      </button>

      {open && (
        <div className="mt-1 rounded-xl border border-slate-300 bg-white p-5 shadow-sm">
          {children}
        </div>
      )}
    </div>
  );
}

function Field({ label, required, hint, children }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-[12px] font-semibold text-slate-600">
        {label} {required ? <span className="text-red-600">*</span> : null}
      </label>
      {children}
      {hint ? <p className="text-[11px] text-slate-500">{hint}</p> : null}
    </div>
  );
}

function Input(props) {
  return (
    <input
      {...props}
      className={cx(
        "w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-[13px] outline-none",
        "focus:ring-2 focus:ring-[#050038]/20",
        props.className,
      )}
    />
  );
}

function Select(props) {
  return (
    <select
      {...props}
      className={cx(
        "w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-[13px] outline-none",
        "focus:ring-2 focus:ring-[#050038]/20",
        props.className,
      )}
    />
  );
}

function Textarea(props) {
  return (
    <textarea
      {...props}
      className={cx(
        "w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-[13px] outline-none",
        "focus:ring-2 focus:ring-[#050038]/20",
        props.className,
      )}
    />
  );
}

function MultiSelect({
  options = [],
  value = [],
  onChange,
  placeholder = "Select...",
}) {
  // Guard against bad inputs so we never call .map on undefined/non-arrays
  const safeOptions = Array.isArray(options) ? options : [];
  const safeValue = Array.isArray(value)
    ? value
    : value
      ? [value].filter(Boolean)
      : [];

  const toggle = (opt) => {
    const exists = safeValue.includes(opt);
    const next = exists
      ? safeValue.filter((v) => v !== opt)
      : [...safeValue, opt];
    onChange(next);
  };

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-2">
      <div className="mb-2 flex flex-wrap gap-2">
        {safeValue.length === 0 ? (
          <span className="px-1 text-[12px] text-slate-500">{placeholder}</span>
        ) : (
          safeValue.map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => toggle(v)}
              className="inline-flex items-center gap-2 rounded-full border border-[#050038]/20 bg-white px-3 py-1 text-[12px] font-bold text-[#050038]"
              title="Click to remove"
            >
              {v} <span className="text-slate-500">×</span>
            </button>
          ))
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {safeOptions.map((opt) => {
          const active = safeValue.includes(opt);
          return (
            <button
              key={opt}
              type="button"
              onClick={() => toggle(opt)}
              className={cx(
                "rounded-full px-3 py-1 text-[12px] font-bold border transition",
                active
                  ? "border-[#050038]/40 bg-[#F1F0F8] text-[#050038]"
                  : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50",
              )}
            >
              {opt}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function PriorityBadge({ level }) {
  const cls =
    PRIORITY_BADGE[level] || "bg-slate-100 text-slate-700 border-slate-200";
  return (
    <span
      className={cx(
        "inline-flex items-center rounded-full border px-3 py-1 text-[12px] font-bold",
        cls,
      )}
    >
      {level || "Set priority"}
    </span>
  );
}

const extractPayload = (extractRes) => {
  return extractRes?.data?.fields ?? extractRes?.data ?? {};
};

const isEmptyExtract = (fields) => {
  if (!fields || typeof fields !== "object") return true;

  // keys you expect for a mandate (adjust if your backend uses different names)
  const mustHaveAny = [
    "circular_no",
    "rbiCircularNumber",
    "referenceNumber",
    "document_reference_no",
    "title",
    "subject",
    "subject_title",
    "date_of_issue",
    "dateOfIssue",
  ];

  const hasAny = mustHaveAny.some((k) => {
    const v = fields[k];
    return v !== undefined && v !== null && String(v).trim() !== "";
  });

  return !hasAny;
};

export default function MandateForm({
  mode = "create",
  initialData = null,
  onSave,
}) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const fileInputRef = useRef(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const showToast = useToast();
  const [lastUploadedFile, setLastUploadedFile] = useState(null);
  const [extractingControls, setExtractingControls] = useState(false);

  const [pdfPreviewUrl, setPdfPreviewUrl] = useState(null);
  const [showPdfPreview, setShowPdfPreview] = useState(false);

  const busy = saving || uploading || extractingControls;

  const busyLabel = saving
    ? "Saving Mandate..."
    : uploading
      ? "Uploading & Extracting File..."
      : extractingControls
        ? "Extracting Controls..."
        : "";
  const EMPTY_FORM = {
    // Mandate Information
    rbiCircularNumber: "",
    referenceNo: "",
    dateOfIssue: "",
    issuingDepartment: "",
    subjectTitle: "",
    categoryType: "",
    applicabilityAudience: [],
    effectiveDate: "",
    sunsetDate: "",
    applicabilityNarrative: "",
    purposeSummary: "",
    scopeOfImpact: "",
    refLink: "",
    additionalNotes: "",
    description: "",
    signatoryName: "",
    designation: "",
    issuedTo: "",
    legalBasis: "",

    // Project Resources
    mandateTester: "",
    mandateLeadTester: "",
    mandateManager: "",
    mandateQAReviewer: "",
    mandateDirector: "",
    riskDeliverySME: "",
    testPlanOwner: "",
    testPlanOwnerName: "",
    enterpriseRiskOfficer: "",
    mandateBusinessPartners: "",

    // Compliance Status
    mandateStatus: "Pending Review",
    matchStatus: "New Mandate",
    assignedSme: "",
    assignedLegalReviewer: "",
    assignedComplianceOwner: "",
    priorityLevel: "Medium",
    slaDate: "",
    internalNotes: "",
    changeLog: "",
    matchingConfidence: null,
    matchingMandateRef: "",
    existingMandateEffectiveDate: "",
    existingSubject: "",
    controlTags: "",
    legalApprovalStatus: "Pending",
    smaApprovalStatus: "Pending",
    documentUrl: "",
  };

  const [form, setForm] = useState({
    // Mandate Information
    rbiCircularNumber: initialData?.rbiCircularNumber || "",
    referenceNo: initialData?.referenceNo || "",
    dateOfIssue: initialData?.dateOfIssue || "",
    issuingDepartment: initialData?.issuingDepartment || "",
    subjectTitle: initialData?.subjectTitle || "",
    categoryType: initialData?.categoryType || "",
    applicabilityAudience: initialData?.applicabilityAudience || [],
    effectiveDate: initialData?.effectiveDate || "",
    sunsetDate: initialData?.sunsetDate || "",
    applicabilityNarrative: initialData?.applicabilityNarrative || "",
    purposeSummary: initialData?.purposeSummary || "",
    scopeOfImpact: initialData?.scopeOfImpact || "",
    refLink: initialData?.refLink || "",
    additionalNotes: initialData?.additionalNotes || "",
    description: initialData?.description || "",
    signatoryName: initialData?.signatoryName || "",
    designation: initialData?.designation || "",
    issuedTo: initialData?.issuedTo || "",
    legalBasis: initialData?.legalBasis || "",

    // Project Resources
    mandateTester: initialData?.mandateTester || "",
    mandateLeadTester: initialData?.mandateLeadTester || "",
    mandateManager: initialData?.mandateManager || "",
    mandateQAReviewer: initialData?.mandateQAReviewer || "",
    mandateDirector: initialData?.mandateDirector || "",
    riskDeliverySME: initialData?.riskDeliverySME || "",
    testPlanOwner: initialData?.testPlanOwner || "",
    testPlanOwnerName: initialData?.testPlanOwnerName || "",
    enterpriseRiskOfficer: initialData?.enterpriseRiskOfficer || "",
    mandateBusinessPartners: initialData?.mandateBusinessPartners || "",

    // Compliance Status
    mandateStatus: "Pending Review",
    matchStatus: initialData?.matchStatus || "New Mandate",
    assignedSme: initialData?.assignedSme || "",
    assignedLegalReviewer: initialData?.assignedLegalReviewer || "",
    assignedComplianceOwner: initialData?.assignedComplianceOwner || "",
    priorityLevel: initialData?.priorityLevel || "Medium",
    slaDate: initialData?.slaDate || "",
    internalNotes: initialData?.internalNotes || "",
    changeLog: initialData?.changeLog || "",
    matchingConfidence: initialData?.matchingConfidence ?? null,
    matchingMandateRef: initialData?.matchingMandateRef || "",
    existingMandateEffectiveDate:
      initialData?.existingMandateEffectiveDate || "",
    existingSubject: initialData?.existingSubject || "",
    controlTags: initialData?.controlTags || "",
    legalApprovalStatus: initialData?.legalApprovalStatus || "Pending",
    smaApprovalStatus: initialData?.smaApprovalStatus || "Pending",
    documentUrl: initialData?.documentUrl || "",
  });

  const onChange = (key) => (e) =>
    setForm((p) => ({ ...p, [key]: e.target.value }));
  const setValue = (key, val) => setForm((p) => ({ ...p, [key]: val }));

  const resetForm = () => {
    setForm(EMPTY_FORM);
    if (typeof window !== "undefined") {
      window.localStorage.removeItem("mandateFormDraft");
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const mapToApiPayload = (f) => ({
    // Correct keys
    rbiCircularNumber: f.rbiCircularNumber?.trim() || "",
    referenceNumber: f.referenceNo?.trim() || "",
    dateOfIssue: toIsoOrNull(f.dateOfIssue),

    subject: f.subjectTitle?.trim() || "",
    description: f.description?.trim() || "",

    effectiveDate: toIsoOrNull(f.effectiveDate),
    referLink: f.refLink?.trim() || null,
    documentUrl: f.documentUrl || null,

    mandateStatus: f.mandateStatus || "Pending Review",
    issuingDepartment: f.issuingDepartment || "",
    categoryType: f.categoryType || "",

    applicabilityAudience: Array.isArray(f.applicabilityAudience)
      ? f.applicabilityAudience
      : [],
    applicabilityNarrative: f.applicabilityNarrative || "",
    purposeSummary: f.purposeSummary || "",
    scopeImpact: f.scopeOfImpact || "",

    sunsetDate: toIsoOrNull(f.sunsetDate),

    matchStatus:
      f.matchStatus === "New Mandate" ? "New" : f.matchStatus || "New",
    matchingConfidence: f.matchingConfidence ?? 60,

    // naming: backend expects assignedSME / assignedLegal / assignedCompliance
    assignedSme: f.assignedSme || "",
    assignedLegal: f.assignedLegalReviewer || "",
    assignedCompliance: f.assignedComplianceOwner || "",

    priorityLevel: f.priorityLevel || "Medium",
    internalNotes: f.internalNotes || "",
    slaDate: toIsoOrNull(f.slaDate),
    changeLog: f.changeLog || "",

    matchingMandateReference: f.matchingMandateRef || "",
    existingMandateEffectiveDate: toIsoOrNull(f.existingMandateEffectiveDate),
    existingMandateSubject: f.existingSubject || "",

    controlTags: f.controlTags || "",
    legalApprovalStatus: f.legalApprovalStatus || "Pending",
    smaApprovalStatus: f.smaApprovalStatus || "Pending",
  });

  const applyExtractedData = (data = {}) => {
    const fields = data?.fields ?? data;
    const firstUrl =
      (Array.isArray(fields?.cta_urls) && fields.cta_urls[0]) ||
      (Array.isArray(fields?.urls_in_text) && fields.urls_in_text[0]) ||
      fields?.referLink ||
      fields?.document_url;

    setForm((prev) => ({
      ...prev,
      rbiCircularNumber:
        fields?.circular_no ??
        fields?.rbiCircularNumber ??
        fields?.rbi_circular_number ??
        prev.rbiCircularNumber,
      referenceNo:
        fields?.document_reference_no ??
        fields?.referenceNumber ??
        fields?.reference_number ??
        fields?.reference_circular ??
        prev.referenceNo,
      dateOfIssue:
        pickValidDateString(
          fields?.date_of_issue ?? fields?.dateOfIssue ?? fields?.date,
        ) || prev.dateOfIssue,
      subjectTitle:
        fields?.title ??
        fields?.subject ??
        fields?.subject_title ??
        prev.subjectTitle,
      description: fields?.description ?? fields?.subject ?? prev.description,
      purposeSummary:
        fields?.purpose_summary ??
        fields?.purpose_objective_summary ??
        prev.purposeSummary,
      applicabilityNarrative:
        fields?.applicability_narrative ?? prev.applicabilityNarrative,
      effectiveDate:
        pickValidDateString(
          fields?.effective_date ??
            fields?.effectiveDate ??
            fields?.exception_effective_date,
        ) || prev.effectiveDate,
      refLink: firstUrl ?? prev.refLink,
      documentUrl:
        fields?.documentUrl ??
        fields?.document_url ??
        firstUrl ??
        prev.documentUrl,
      signatoryName:
        fields?.signatory_name ?? fields?.signatoryName ?? prev.signatoryName,
      designation:
        fields?.designation ?? fields?.designation_name ?? prev.designation,
      issuedTo: fields?.issued_to ?? fields?.issuedTo ?? prev.issuedTo,
      legalBasis: Array.isArray(fields?.legal_basis)
        ? fields.legal_basis.join("; ")
        : (fields?.legal_basis ?? prev.legalBasis),
      issuingDepartment:
        fields?.department ??
        fields?.issuing_department ??
        fields?.issuing_authority ??
        prev.issuingDepartment,
      categoryType:
        fields?.document_type ?? fields?.category_type ?? prev.categoryType,
      applicabilityAudience: Array.isArray(fields?.applicability_audience)
        ? fields.applicability_audience
        : prev.applicabilityAudience,
      scopeOfImpact:
        fields?.scope_of_impact ?? fields?.scopeImpact ?? prev.scopeOfImpact,
      sunsetDate:
        pickValidDateString(
          fields?.sunset_withdrawal_date ?? fields?.sunsetDate,
        ) || prev.sunsetDate,
      matchStatus: fields?.matchStatus ?? prev.matchStatus,
      matchingConfidence: fields?.matchingConfidence ?? prev.matchingConfidence,
      assignedSme: fields?.assignedSme ?? prev.assignedSme,
      assignedLegalReviewer:
        fields?.assignedLegal ?? prev.assignedLegalReviewer,
      assignedComplianceOwner:
        fields?.assignedCompliance ?? prev.assignedComplianceOwner,
      priorityLevel: fields?.priorityLevel ?? prev.priorityLevel,
      internalNotes:
        fields?.notes ?? fields?.internalNotes ?? prev.internalNotes,
      slaDate: fields?.slaDate ?? prev.slaDate,
      changeLog: fields?.changeLog ?? prev.changeLog,
      matchingMandateRef:
        fields?.matchingMandateReference ?? prev.matchingMandateRef,
      existingMandateEffectiveDate:
        fields?.existingMandateEffectiveDate ??
        prev.existingMandateEffectiveDate,
      existingSubject: fields?.existingMandateSubject ?? prev.existingSubject,
      controlTags: fields?.controlTags ?? prev.controlTags,
      legalApprovalStatus:
        fields?.legalApprovalStatus ?? prev.legalApprovalStatus,
      smaApprovalStatus: fields?.smaApprovalStatus ?? prev.smaApprovalStatus,
      mandateStatus: "Pending Review",
    }));
  };

  const buildMandateText = (f) => {
    // You can tune this, but this is a safe default
    return [
      `Reference No: ${f.referenceNo || ""}`,
      `Subject: ${f.subjectTitle || ""}`,
      `Description: ${f.description || ""}`,
      `Applicability Narrative: ${f.applicabilityNarrative || ""}`,
      `Purpose Summary: ${f.purposeSummary || ""}`,
      `Scope of Impact: ${f.scopeOfImpact || ""}`,
      `Issuing Department: ${f.issuingDepartment || ""}`,
      `Category Type: ${f.categoryType || ""}`,
    ]
      .filter(Boolean)
      .join("\n");
  };

  const hitControlExtract = async ({
    reference_number,
    effective_from,
    mandate_text,
    mandate_pdf,
  }) => {
    const fd = new FormData();
    if (reference_number) fd.append("reference_number", reference_number);
    if (effective_from) fd.append("effective_from", effective_from);
    if (mandate_text) fd.append("mandate_text", mandate_text);
    if (mandate_pdf) fd.append("mandate_pdf", mandate_pdf);

    const candidates = [
      API?.CONTROL_EXTRACT,
      API?.EXTRACT, // fallback direct extract
      `${BASE_URL}/api/controls/extract`,
      `${BASE_URL}/controls/extract`,
    ].filter(Boolean);

    let lastErr = null;

    for (const endpoint of [...new Set(candidates)]) {
      try {
        console.log("Trying CONTROL_EXTRACT:", endpoint);

        // Keep mandate-ai calls free of auth/tenant headers so CORS does not preflight.
        const res = await postFormData(endpoint, fd);

        console.log("CONTROL_EXTRACT success via:", endpoint);
        return res.data;
      } catch (err) {
        lastErr = err;
        const info = formatAxiosError(err);

        console.warn("CONTROL_EXTRACT failed via:", endpoint, info);

        // only try next if 404
        if (info.status !== 404) break;
      }
    }

    throw lastErr || new Error("Control extract failed");
  };

  const departmentOptions = useMemo(() => {
    const set = new Set(BASE_DEPARTMENTS);
    if (form.issuingDepartment) set.add(form.issuingDepartment);
    return Array.from(set);
  }, [form.issuingDepartment]);

  const title = useMemo(
    () => (mode === "edit" ? "Edit Mandate" : "Create Mandate (Manual Entry)"),
    [mode],
  );

  const validate = () => {
    const required = [
      ["dateOfIssue", "Date of Issue"],
      ["issuingDepartment", "Issuing Department"],
      ["subjectTitle", "Subject / Title"],
      ["categoryType", "Category / Type"],
    ];
    const missing = required.filter(([k]) => !String(form[k] || "").trim());
    if (missing.length) {
      showToast(
        "Please fill required fields:\n" +
          missing.map((m) => `- ${m[1]}`).join("\n"),
        "error",
      );
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (!validate()) return;

    console.group("Mandate Save Flow");

    let saved = null;
    let payload = null;

    try {
      //  STEP 1: SAVE
      setSaving(true);

      payload = mapToApiPayload(form);
      const res = await CustomAxios.post(API.MANDATE_FORM, payload);
      saved = res?.data;

      showToast("Mandate saved successfully.", "success");
    } catch (err) {
      const info = formatAxiosError(err);
      showToast(
        `SAVE failed${info.status ? ` (${info.status})` : ""}: ${info.message}`,
        "error",
      );
      console.groupEnd();
      setSaving(false);
      return;
    } finally {
      // always stop saving loader here
      setSaving(false);
    }

    try {
      //  STEP 2: EXTRACT CONTROLS
      setExtractingControls(true);

      const reference_number =
        saved?.referenceNumber ||
        payload?.referenceNumber ||
        form.referenceNo ||
        "";

      const effective_from =
        saved?.effectiveDate ||
        payload?.effectiveDate ||
        (form.effectiveDate ? new Date(form.effectiveDate).toISOString() : "");

      const mandate_text = buildMandateText(form);
      const mandate_pdf = lastUploadedFile || null;

      const extractRes = await hitControlExtract({
        reference_number,
        effective_from,
        mandate_text,
        mandate_pdf,
      });

      console.log("2) EXTRACT success:", extractRes);
      showToast("Controls extracted successfully.", "success");

      if (onSave) onSave(saved || payload);
      resetForm();
      setLastUploadedFile(null);
    } catch (err) {
      const info = formatAxiosError(err);
      showToast(
        `CONTROL EXTRACT failed${info.status ? ` (${info.status})` : ""}: ${info.message}`,
        "error",
      );
    } finally {
      //  THIS IS THE KEY: stop extract loader
      setExtractingControls(false);
      console.groupEnd();
    }
  };

  const handleDashboardClick = () => {
    router.push("/mandates/mandates-dashboard");
  };

  const handleUploadClick = () => {
    setShowUploadModal(true);
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0] || null;

    setSelectedFile(file);
    if (file) setLastUploadedFile(file);

    // Cleanup old preview url (if any)
    if (pdfPreviewUrl) {
      URL.revokeObjectURL(pdfPreviewUrl);
      setPdfPreviewUrl(null);
    }

    // Create preview URL only for PDFs
    if (file && file.type === "application/pdf") {
      const url = URL.createObjectURL(file);
      setPdfPreviewUrl(url);
    }
  };

  // const handleExtractClick = async () => {
  //   if (!selectedFile) {
  //     showToast("Please select a file first.", "error");
  //     return;
  //   }

  //   if (!API?.EXTRACT && !API?.EXTRACT_FORM) {
  //     showToast("Extraction endpoint not configured.", "error");
  //     return;
  //   }

  //   setShowUploadModal(false);
  //   setUploading(true);
  //   try {
  //     const uploadData = new FormData();
  //     uploadData.append("file", selectedFile);

  //     if (API?.MANDATE_UPLOAD) {
  //       try {
  //         await axios.post(API.MANDATE_UPLOAD, uploadData, {
  //           headers: { "Content-Type": "multipart/form-data" },
  //         });
  //       } catch (uploadErr) {
  //         console.warn("Upload failed, continuing to extract", uploadErr);
  //       }
  //     }

  //     const extractData = new FormData();
  //     extractData.append("file", selectedFile);
  //     const extractEndpoint = API.EXTRACT_FORM || API.EXTRACT;
  //     const extractRes = await axios.post(extractEndpoint, extractData, {
  //       headers: { "Content-Type": "multipart/form-data" },
  //     });

  //     const extractedPayload = extractRes?.data?.fields ?? extractRes?.data ?? {};
  //     applyExtractedData(extractedPayload);
  //     showToast("File extracted and mapped to the form.", "success");
  //   } catch (err) {
  //     const isNetwork = err?.message === "Network Error";
  //     console.error("Upload/extract failed", err);
  //     showToast(
  //       isNetwork
  //         ? "Upload/extract failed: API not reachable. Check server URL or network."
  //         : "Upload/extract failed. Check console.",
  //       "error"
  //     );
  //   } finally {
  //     setUploading(false);
  //     setSelectedFile(null);
  //     if (fileInputRef.current) {
  //       fileInputRef.current.value = "";
  //     }
  //   }

  const handleExtractClick = async () => {
    if (!selectedFile) {
      showToast("Please select a file first.", "error");
      return;
    }

    if (!API?.MANDATE_EXTRACT && !API?.EXTRACT_FORM && !API?.EXTRACT) {
      showToast("Extraction endpoint not configured.", "error");
      return;
    }

    setShowUploadModal(false);
    setUploading(true);

    try {
      let uploadedDocument = null;

      if (API?.MANDATE_UPLOAD) {
        const uploadData = new FormData();
        uploadData.append("file", selectedFile);

        const uploadRes = await CustomAxios.post(
          API.MANDATE_UPLOAD,
          uploadData,
          {
            headers: { "Content-Type": "multipart/form-data" },
          },
        );

        uploadedDocument = uploadRes?.data || null;
      }

      const extractData = new FormData();
      extractData.append("file", selectedFile);

      const extractEndpoint =
        API.MANDATE_EXTRACT || API.EXTRACT_FORM || API.EXTRACT;

      const extractRes = await postFormData(extractEndpoint, extractData);

      const fields = extractPayload(extractRes);
      const mergedFields = {
        ...fields,
        documentUrl:
          uploadedDocument?.documentUrl ||
          fields?.documentUrl ||
          fields?.document_url,
      };

      //  IMPORTANT: if nothing meaningful extracted => show your custom error
      if (isEmptyExtract(mergedFields)) {
        showToast(
          "Invalid document. Please upload a valid Mandate PDF.",
          "error",
        );
        return;
      }

      // only map if valid
      applyExtractedData(mergedFields);
      showToast("Mandate extracted and mapped to the form.", "success");
    } catch (err) {
      const info = formatAxiosError(err);
      console.error("Upload/extract failed", err);

      showToast(
        `Extraction failed${info.status ? ` (${info.status})` : ""}. Please upload a valid Mandate PDF.`,
        "error",
      );
    } finally {
      setUploading(false);
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="mx-5 min-h-screen bg-white rounded-lg p-5 my-3">
        <Loader show={busy} label={busyLabel} fullScreen />

        {showUploadModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
            <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl">
              <div className="flex items-start justify-between border-b border-slate-200 bg-[#f8fbff] px-4 py-3">
                <div>
                  <p className="text-lg font-semibold uppercase tracking-wide text-[#2B245C]">
                    Upload Mandate File
                  </p>
                  <p className="text-sm font-semibold text-slate-600">
                    Select a file to extract details
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100"
                  aria-label="Close modal"
                >
                  <X className="h-4 w-4" aria-hidden />
                </button>
              </div>

              <div className="space-y-3 px-4 py-4">
                <p className="text-[13px] text-slate-600">
                  Choose a PDF, DOC, or TXT file.
                </p>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept=".pdf,.doc,.docx,.txt"
                  disabled={uploading}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-[13px] outline-none focus:ring-2 focus:ring-[#050038]/20"
                />
              </div>

              <div className="flex flex-wrap items-center justify-end gap-2 border-t border-slate-200 bg-[#f8fbff] px-4 py-3">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="inline-flex h-9 min-w-[88px] items-center justify-center whitespace-nowrap rounded-lg border border-[#2B245C] px-3 text-[12px] font-semibold text-[#2B245C] transition hover:bg-blue-50"
                  disabled={uploading}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleExtractClick}
                  className="inline-flex h-9 min-w-[88px] items-center justify-center whitespace-nowrap rounded-lg bg-[#2B245C] px-3 text-[12px] font-semibold text-white shadow-sm transition hover:bg-opacity-90 disabled:opacity-60"
                  disabled={uploading}
                >
                  <FileSearch className="mr-2 h-4 w-4" aria-hidden />
                  {uploading ? "Extracting..." : "Extract"}
                </button>
              </div>
            </div>
          </div>
        )}
        {showPdfPreview && pdfPreviewUrl && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 px-4">
            <div className="w-full max-w-5xl overflow-hidden rounded-2xl bg-white shadow-2xl">
              <div className="flex items-center justify-between border-b border-slate-200 bg-[#f8fbff] px-4 py-3">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-[#050038]">
                    PDF Preview
                  </p>
                  <p className="text-[14px] font-bold text-slate-800">
                    {selectedFile?.name || "Uploaded PDF"}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setShowPdfPreview(false)}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100"
                  aria-label="Close modal"
                >
                  <X className="h-4 w-4" aria-hidden />
                </button>
              </div>

              <div className="h-[75vh] bg-slate-100">
                <iframe
                  src={pdfPreviewUrl}
                  title="PDF Preview"
                  className="h-full w-full"
                />
              </div>

              <div className="flex items-center justify-end gap-2 border-t border-slate-200 bg-[#f8fbff] px-4 py-3">
                <button
                  type="button"
                  onClick={() =>
                    window.open(pdfPreviewUrl, "_blank", "noopener,noreferrer")
                  }
                  className="inline-flex h-9 min-w-[88px] items-center justify-center whitespace-nowrap rounded-lg border border-slate-200 px-3 text-[12px] font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  <ExternalLink className="mr-2 h-4 w-4" aria-hidden />
                  Open in new tab
                </button>

                <button
                  type="button"
                  onClick={() => setShowPdfPreview(false)}
                  className="inline-flex h-9 min-w-[88px] items-center justify-center whitespace-nowrap rounded-lg bg-[#050038] px-3 text-[12px] font-semibold text-white shadow-sm transition hover:bg-[#1E335A]"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="px-6 py-8 bg-[#2B245C] rounded-2xl shadow-lg hover:shadow-2xl transition-shadow duration-300">
          <div className="flex flex-col gap-2 lg:flex-row lg:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-cyan-50">{title}</h1>
              <p className="mt-1 text-sm text-white">
                Users manually enter RBI mandate details, assign ownership and
                status, and save it for tracking and audit.
              </p>
            </div>

            <div className="flex flex-wrap gap-2 items-center lg:justify-end">
              {/* Dashboard */}
              <button
                type="button"
                onClick={handleDashboardClick}
                className="inline-flex items-center justify-center rounded-lg bg-white text-[#2B245C] px-6 py-2.5 text-sm font-semibold shadow-md hover:shadow-lg hover:bg-gray-100 transition-all"
              >
                <LayoutDashboard className="mr-2 h-4 w-4" aria-hidden />
                Mandate Dashboard
              </button>
              {/* Upload */}
              <button
                type="button"
                onClick={handleUploadClick}
                disabled={uploading}
                className={cx(
                  "inline-flex items-center justify-center rounded-lg bg-slate-100 text-[#2B245C] px-6 py-2.5 text-sm font-semibold shadow-md hover:shadow-lg hover:bg-slate-200 transition-all",
                  uploading && "cursor-not-allowed opacity-80",
                )}
              >
                <Upload className="mr-2 h-4 w-4" aria-hidden />
                {uploading ? "Uploading..." : "Upload Mandate File"}
              </button>

              {/* Save */}
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className={cx(
                  "inline-flex items-center justify-center rounded-lg px-6 py-2.5 text-sm font-semibold shadow-md hover:shadow-lg transition-all",
                  saving
                    ? "cursor-not-allowed bg-gray-200 !text-gray-500"
                    : "bg-blue-50 text-[#2B245C] hover:bg-blue-100",
                )}
              >
                <Save className="mr-2 h-4 w-4" aria-hidden />
                {saving ? "Saving..." : "Save Mandate"}
              </button>
            </div>
          </div>
        </div>

        {/* Sections */}
        <Section title="Mandate Information" defaultOpen>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <Field label="RBI Circular Number">
              <Input
                placeholder="e.g., RBI/DOR/2025-26/320"
                value={form.rbiCircularNumber ?? ""}
                onChange={onChange("rbiCircularNumber")}
              />

              {String(form.rbiCircularNumber ?? "").trim() === "" && (
                <p className="mt-1 text-[11px] text-slate-500">N/A</p>
              )}
            </Field>

            <Field label="Reference Number">
              <div className="flex items-start gap-2">
                <div className="flex-1">
                  <Input
                    placeholder="Enter reference number"
                    value={form.referenceNo}
                    onChange={onChange("referenceNo")}
                  />
                </div>

                <button
                  type="button"
                  onClick={() => {
                    // Priority 1: preview from uploaded file
                    if (pdfPreviewUrl) {
                      setShowPdfPreview(true);
                      return;
                    }

                    // Priority 2: open stored URL if you have it
                    if (
                      form.documentUrl &&
                      String(form.documentUrl).trim() !== ""
                    ) {
                      setPdfPreviewUrl(
                        normalizeDocumentUrl(form.documentUrl, BASE_URL),
                      );
                      setShowPdfPreview(true);
                      return;
                    }

                    showToast("Please upload a PDF first to view it.", "error");
                  }}
                  className={cx(
                    "mt-[2px] inline-flex items-center justify-center whitespace-nowrap rounded-xl px-3 py-2 text-[12px] font-extrabold border",
                    pdfPreviewUrl ||
                      (form.documentUrl &&
                        String(form.documentUrl).trim() !== "")
                      ? "border-[#2B245C] bg-blue-50 text-[#2B245C] hover:bg-blue-100"
                      : "border-slate-200 bg-slate-100 text-slate-400 cursor-not-allowed",
                  )}
                  disabled={
                    !pdfPreviewUrl &&
                    !(
                      form.documentUrl && String(form.documentUrl).trim() !== ""
                    )
                  }
                  title={
                    !pdfPreviewUrl &&
                    !(
                      form.documentUrl && String(form.documentUrl).trim() !== ""
                    )
                      ? "Upload a PDF to enable preview"
                      : "View PDF"
                  }
                >
                  <Eye className="mr-2 h-4 w-4" aria-hidden />
                  View PDF
                </button>
              </div>
            </Field>

            <Field label="Date of Issue">
              <Input
                type="date"
                value={form.dateOfIssue}
                onChange={onChange("dateOfIssue")}
              />
            </Field>

            <Field label="Issuing Department">
              <Select
                value={form.issuingDepartment}
                onChange={onChange("issuingDepartment")}
              >
                <option value="">Select department</option>
                {departmentOptions.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </Select>
            </Field>

            <Field label="Category / Type">
              <Select
                value={form.categoryType}
                onChange={onChange("categoryType")}
              >
                <option value="">Select category</option>
                {CATEGORY_TYPES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </Select>
            </Field>

            <Field label="Subject / Title">
              <Input
                placeholder="Enter subject/title"
                value={form.subjectTitle}
                onChange={onChange("subjectTitle")}
              />
            </Field>
            <div className="md:col-span-2">
              <Field label="Description">
                <Input
                  placeholder="Enter description"
                  value={form.description}
                  onChange={onChange("description")}
                />
              </Field>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-5 md:grid-cols-2">
            <Field label="Applicability Audience">
              <MultiSelect
                options={AUDIENCE_OPTIONS}
                value={form.applicabilityAudience}
                onChange={(v) => setValue("applicabilityAudience", v)}
                placeholder="Select audience"
              />
            </Field>

            <div className="grid grid-cols-1 gap-4">
              <Field label="Effective Date">
                <Input
                  type="date"
                  value={form.effectiveDate}
                  onChange={onChange("effectiveDate")}
                />
              </Field>

              <Field label="Sunset / Withdrawal Date">
                <Input
                  type="date"
                  value={form.sunsetDate}
                  onChange={onChange("sunsetDate")}
                />
              </Field>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-5 md:grid-cols-2">
            <Field label="RBI Reference Link">
              <Input
                placeholder="https://rbi.org.in/..."
                value={form.refLink}
                onChange={onChange("refLink")}
              />
            </Field>
            <Field label="Issued To">
              <Input
                placeholder="e.g., All India Financial Institutions"
                value={form.issuedTo}
                onChange={onChange("issuedTo")}
              />
            </Field>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-5">
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <Field label="Signatory Name">
                <Input
                  placeholder="Enter signatory name"
                  value={form.signatoryName}
                  onChange={onChange("signatoryName")}
                />
              </Field>
              <Field label="Designation">
                <Input
                  placeholder="Enter designation"
                  value={form.designation}
                  onChange={onChange("designation")}
                />
              </Field>
            </div>

            <Field label="Legal Basis">
              <Textarea
                rows={3}
                placeholder="Enter legal basis (one per line)"
                value={form.legalBasis}
                onChange={onChange("legalBasis")}
              />
            </Field>

            <Field label="Additional Notes">
              <Input
                placeholder="Any notes"
                value={form.additionalNotes}
                onChange={onChange("additionalNotes")}
              />
            </Field>

            <Field label="Applicability Narrative">
              <Textarea
                rows={3}
                placeholder="Write applicability narrative..."
                value={form.applicabilityNarrative}
                onChange={onChange("applicabilityNarrative")}
              />
            </Field>
            <Field label="Purpose / Objective Summary">
              <Textarea
                rows={3}
                placeholder="Write objective summary..."
                value={form.purposeSummary}
                onChange={onChange("purposeSummary")}
              />
            </Field>
            <Field label="Scope of Impact">
              <Textarea
                rows={3}
                placeholder="Describe impacted areas/systems/processes..."
                value={form.scopeOfImpact}
                onChange={onChange("scopeOfImpact")}
              />
            </Field>
          </div>
        </Section>

        <Section title="Project Resources" defaultOpen={false}>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <Field label="Mandate Tester">
              <Input
                placeholder="Enter name"
                value={form.mandateTester}
                onChange={onChange("mandateTester")}
              />
            </Field>
            <Field label="Risk Delivery SME">
              <Input
                placeholder="Enter name"
                value={form.riskDeliverySME}
                onChange={onChange("riskDeliverySME")}
              />
            </Field>
            <Field label="Mandate Lead Tester">
              <Input
                placeholder="Enter name"
                value={form.mandateLeadTester}
                onChange={onChange("mandateLeadTester")}
              />
            </Field>
            <Field label="Test Plan Owner">
              <Input
                placeholder="Enter name"
                value={form.testPlanOwner}
                onChange={onChange("testPlanOwner")}
              />
            </Field>
            <Field label="Mandate Manager">
              <Input
                placeholder="Enter name"
                value={form.mandateManager}
                onChange={onChange("mandateManager")}
              />
            </Field>
            <Field label="Test Plan Owner Name">
              <Input
                placeholder="Full name"
                value={form.testPlanOwnerName}
                onChange={onChange("testPlanOwnerName")}
              />
            </Field>
            <Field label="Mandate QA Reviewer">
              <Input
                placeholder="Enter name"
                value={form.mandateQAReviewer}
                onChange={onChange("mandateQAReviewer")}
              />
            </Field>
            <Field label="Enterprise Risk Officer">
              <Input
                placeholder="Enter name"
                value={form.enterpriseRiskOfficer}
                onChange={onChange("enterpriseRiskOfficer")}
              />
            </Field>
            <Field label="Mandate Director">
              <Input
                placeholder="Enter name"
                value={form.mandateDirector}
                onChange={onChange("mandateDirector")}
              />
            </Field>
            <Field label="Mandate Business Partners">
              <Input
                placeholder="Teams / partners"
                value={form.mandateBusinessPartners}
                onChange={onChange("mandateBusinessPartners")}
              />
            </Field>
          </div>
        </Section>

        <Section title="Compliance Status" defaultOpen={false}>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <Field label="Mandate Status">
              <div className="rounded-xl border border-slate-200 bg-[#f8fbff] px-3 py-2 text-[13px] font-bold text-slate-700">
                Pending Review
              </div>
            </Field>

            <Field label="Assigned SME">
              <Input
                placeholder="Select SME"
                value={form.assignedSme}
                onChange={onChange("assignedSme")}
              />
            </Field>

            <Field label="Assigned Legal Reviewer">
              <Select
                value={form.assignedLegalReviewer}
                onChange={onChange("assignedLegalReviewer")}
              >
                <option value="">Select Legal Reviewer</option>
                {LEGAL_REVIEWERS.map((l) => (
                  <option key={l} value={l}>
                    {l}
                  </option>
                ))}
              </Select>
            </Field>

            <Field label="Assigned Compliance Owner">
              <Input
                placeholder="Select Compliance owner"
                value={form.assignedComplianceOwner}
                onChange={onChange("assignedComplianceOwner")}
              />
            </Field>

            <Field label="Priority Level">
              <div className="flex items-center gap-3">
                <Select
                  className="flex-1"
                  value={form.priorityLevel}
                  onChange={onChange("priorityLevel")}
                >
                  {PRIORITY_OPTIONS.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </Select>
                <PriorityBadge level={form.priorityLevel} />
              </div>
            </Field>

            <Field label="SLA Date">
              <Input
                type="date"
                value={form.slaDate}
                onChange={onChange("slaDate")}
              />
            </Field>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-5 md:grid-cols-2">
            <Field label="Internal Notes">
              <Textarea
                rows={5}
                placeholder="Write internal notes..."
                value={form.internalNotes}
                onChange={onChange("internalNotes")}
              />
            </Field>
            <Field label="Change Log">
              <Textarea
                rows={5}
                placeholder="Write change log..."
                value={form.changeLog}
                onChange={onChange("changeLog")}
              />
            </Field>
          </div>
        </Section>

        <div className="h-10" />
      </div>
    </div>
  );
}

