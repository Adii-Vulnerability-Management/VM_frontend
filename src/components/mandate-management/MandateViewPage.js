"use client";

import CustomAxios from "@/config/CustomAxios";
import { getCurrentUserEmail } from "@/auth/currentUser";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";
import {
  Badge,
  StatusBadge,
} from "@/components/mandate-management/StatusBadge";
import DocumentPreview from "@/components/mandate-management/DocumentPreview";
import { API, BASE_URL } from "@/services/api/API_CONSTANT";

const API_BASE_URL = BASE_URL;
const DASHBOARD_BY_MODE = {
  admin: "/mandates/mandates-dashboard",
  sma: "/approve-mandates/sme-dashboard",
  legal: "/approve-mandates/legal-dashboard",
};

const formatDate = (d) =>
  d
    ? new Date(d).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "-";

const formatDDMMYYYY = (d) => {
  if (!d) return "-";
  const dt = new Date(d);
  if (Number.isNaN(dt.getTime())) return "-";
  const dd = String(dt.getDate()).padStart(2, "0");
  const mm = String(dt.getMonth() + 1).padStart(2, "0");
  const yyyy = dt.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
};

const startOfToday = () => {
  const t = new Date();
  t.setHours(0, 0, 0, 0);
  return t;
};

const dayDiff = (toDate) => {
  if (!toDate) return null;
  const d = new Date(toDate);
  if (Number.isNaN(d.getTime())) return null;
  const ms = d.getTime() - startOfToday().getTime();
  return Math.ceil(ms / (1000 * 60 * 60 * 24));
};

const pluralDays = (n) => (Math.abs(n) === 1 ? "Day" : "Days");

const isBlank = (v) =>
  v === undefined ||
  v === null ||
  (typeof v === "string" && v.trim() === "") ||
  (Array.isArray(v) && v.length === 0);

const parseLegalDueDate = (m) => {
  const raw =
    m?.legalDueDate ||
    m?.dueDateLegal ||
    m?.legal_due_date ||
    m?.legal_dueDate ||
    m?.legalDeadline ||
    m?.deadlineLegal ||
    m?.targetDateLegal ||
    "";

  if (!raw) return null;
  const d = new Date(raw);
  return Number.isNaN(d.getTime()) ? null : d;
};

const normalizeAssignedSmas = (m) => {
  if (Array.isArray(m?.assignedSmas)) {
    return m.assignedSmas
      .filter((x) => x && x.email)
      .map((x) => ({
        _id: x?._id,
        email: String(x.email).trim().toLowerCase(),
        status: x?.status || "Pending",
        smaDueDate: x?.smaDueDate || x?.smeDueDate || x?.dueDate || null,
        smaComment: x?.smaComment || "",
        updatedAt: x?.updatedAt,
        name: x?.name,
      }));
  }

  const old = m?.assignedSme;
  const emails = Array.isArray(old)
    ? old
    : String(old || "")
        .split(",")
        .map((s) => s.trim().toLowerCase())
        .filter(Boolean);

  const shared = m?.smaApprovalStatus || "Pending";
  return emails.map((email) => ({
    email,
    status: shared,
    smaDueDate: null,
    smaComment: "",
  }));
};

const normalizeAssignedLegals = (m) => {
  if (Array.isArray(m?.assignedLegals)) {
    return m.assignedLegals
      .filter((x) => x && x.email)
      .map((x) => ({
        _id: x?._id,
        email: String(x.email).trim().toLowerCase(),
        status: x?.status || "Pending",
      }));
  }

  const raw =
    m?.assignedLegal ||
    m?.assignedLegalReviewer ||
    m?.assignedLegalName ||
    m?.assignedLegalUser ||
    m?.legalReviewer;

  const emails = Array.isArray(raw)
    ? raw
        .map((x) =>
          typeof x === "string"
            ? x.trim().toLowerCase()
            : x?.email
              ? String(x.email).trim().toLowerCase()
              : "",
        )
        .filter(Boolean)
    : typeof raw === "string"
      ? raw
          .split(",")
          .map((s) => s.trim().toLowerCase())
          .filter(Boolean)
      : raw && typeof raw === "object" && raw.email
        ? [String(raw.email).trim().toLowerCase()]
        : [];

  const shared = m?.legalApprovalStatus || "Pending";
  return emails.map((email) => ({ email, status: shared }));
};

const parseSmeDueDate = (m, myEmail = "") => {
  const list = normalizeAssignedSmas(m);
  const me = myEmail ? list.find((x) => x.email === myEmail) : null;
  const raw = me?.smaDueDate ?? list?.[0]?.smaDueDate ?? null;

  if (raw) {
    const d = new Date(raw);
    return Number.isNaN(d.getTime()) ? null : d;
  }

  const fallback =
    m?.smeDueDate ||
    m?.dueDate ||
    m?.sme_due_date ||
    m?.sme_dueDate ||
    m?.deadline ||
    m?.targetDate ||
    "";
  if (!fallback) return null;
  const d = new Date(fallback);
  return Number.isNaN(d.getTime()) ? null : d;
};

const toDueLabel = (dueDate, status) => {
  const st = String(status || "Pending").trim();
  if (st === "Approved") return "Completed";
  if (st === "Rejected") return "Rejected";
  if (!dueDate) return "No Due Date";

  const diff = dayDiff(dueDate);
  if (diff === null) return "No Due Date";
  if (diff < 0) {
    const n = Math.abs(diff);
    return `${n} ${pluralDays(n)} Overdue`;
  }
  if (diff === 0) return "Due Today";
  return `${diff} ${pluralDays(diff)} Remaining`;
};

const getMySmeStatus = (m, myEmail) => {
  const me = normalizeAssignedSmas(m).find((x) => x.email === myEmail);
  return me?.status || "Pending";
};

const getMyLegalStatus = (m, myEmail) => {
  const me = normalizeAssignedLegals(m).find((x) => x.email === myEmail);
  return me?.status || m?.legalApprovalStatus || "Pending";
};

const buildAssignedSmasPayload = (m, myEmail, newStatus, smaComment) => {
  const current = Array.isArray(m?.assignedSmas) ? m.assignedSmas : [];
  let found = false;

  const next = current.map((x) => {
    if (x?.email?.toLowerCase() !== myEmail?.toLowerCase()) {
      return {
        email: x.email,
        status: x.status,
        smaComment: x.smaComment || "",
      };
    }

    found = true;
    return {
      email: x.email,
      status: newStatus,
      smaComment: smaComment || "",
    };
  });

  if (!found) {
    next.push({ email: myEmail, status: newStatus, smaComment: smaComment || "" });
  }

  return next;
};

function buildDisplayValues(data) {
  const get = (obj, ...keys) => {
    for (const k of keys) {
      const v = obj?.[k];
      if (!isBlank(v)) return v;
    }
    return "-";
  };

  const getDate = (obj, ...keys) => {
    const v = get(obj, ...keys);
    if (v === "-") return "-";
    return formatDate(v);
  };

  const toDisplay = (v) => {
    if (isBlank(v)) return "-";
    if (Array.isArray(v)) return v.filter(Boolean).map(toDisplay).join(", ") || "-";
    if (typeof v === "object") {
      return v.name || v.fullName || v.email || v.id || JSON.stringify(v);
    }
    return String(v);
  };

  const getArr = (obj, ...keys) => {
    for (const k of keys) {
      const v = obj?.[k];
      if (Array.isArray(v) && v.length) return v.join(", ");
      if (typeof v === "string" && v.trim()) return v;
    }
    return "-";
  };

  const getLink = (obj, ...keys) => {
    const url = get(obj, ...keys);
    if (url === "-") return "-";
    return (
      <a
        href={String(url)}
        target="_blank"
        rel="noreferrer"
        className="text-[#050038] underline break-all"
      >
        {String(url)}
      </a>
    );
  };

  const getAssignee = (obj, ...keys) => {
    for (const k of keys) {
      const v = obj?.[k];
      if (isBlank(v)) continue;
      if (typeof v === "string") return v.trim();
      if (Array.isArray(v)) return v.map(toDisplay).filter((x) => x !== "-").join(", ") || "-";
      if (typeof v === "object") return toDisplay(v);
    }
    return "-";
  };

  const getNumber = (obj, ...keys) => {
    const raw = get(obj, ...keys);
    if (raw === "-") return "-";
    const n = Number(raw);
    return Number.isFinite(n) ? n : "-";
  };

  return {
    rbiCircularNumber: get(data, "rbiCircularNumber"),
    referenceNumber: get(data, "referenceNumber", "referenceNo"),
    dateOfIssue: getDate(data, "dateOfIssue"),
    issuingDepartment: get(data, "issuingDepartment"),
    categoryType: get(data, "categoryType"),
    subjectTitle: get(data, "subject", "subjectTitle"),
    description: get(data, "description"),
    applicabilityAudience: getArr(data, "applicabilityAudience"),
    effectiveDate: getDate(data, "effectiveDate"),
    sunsetDate: getDate(data, "sunsetDate"),
    referLink: getLink(data, "referLink", "refLink"),
    issuedTo: get(data, "issuedTo"),
    signatoryName: get(data, "signatoryName"),
    designation: get(data, "designation"),
    legalBasis: get(data, "legalBasis"),
    additionalNotes: get(data, "additionalNotes"),
    applicabilityNarrative: get(data, "applicabilityNarrative"),
    purposeSummary: get(data, "purposeSummary"),
    scopeImpact: get(data, "scopeImpact", "scopeOfImpact"),
    mandateTester: get(data, "mandateTester"),
    riskDeliverySME: get(data, "riskDeliverySME"),
    mandateLeadTester: get(data, "mandateLeadTester"),
    testPlanOwner: get(data, "testPlanOwner"),
    mandateManager: get(data, "mandateManager"),
    testPlanOwnerName: get(data, "testPlanOwnerName"),
    mandateQAReviewer: get(data, "mandateQAReviewer"),
    enterpriseRiskOfficer: get(data, "enterpriseRiskOfficer"),
    mandateDirector: get(data, "mandateDirector"),
    mandateBusinessPartners: get(data, "mandateBusinessPartners"),
    mandateStatus: get(data, "mandateStatus"),
    matchStatus: get(data, "matchStatus"),
    priorityLevel: get(data, "priorityLevel"),
    matchingConfidence: getNumber(data, "matchingConfidence"),
    slaDate: getDate(data, "slaDate"),
    internalNotes: get(data, "internalNotes"),
    changeLog: get(data, "changeLog"),
    assignedSme: getAssignee(
      data,
      "assignedSme",
      "assignedSME",
      "assignedSmeName",
      "assignedSmeUser",
      "assignedSmeDetails",
      "assignedSmas",
    ),
    assignedSmas: getAssignee(data, "assignedSmas"),
    assignedLegal: getAssignee(
      data,
      "assignedLegal",
      "assignedLegalReviewer",
      "assignedLegalName",
      "assignedLegalUser",
      "legalReviewer",
    ),
    assignedCompliance: getAssignee(
      data,
      "assignedCompliance",
      "assignedComplianceOwner",
      "assignedComplianceName",
      "complianceOwner",
    ),
  };
}

export default function MandateViewPage({ mode = "admin" }) {
  const router = useRouter();
  const rawId = router.query?.id;
  const id = Array.isArray(rawId) ? rawId[0] : rawId;
  const isReviewerMode = mode === "sma" || mode === "legal";

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentEmail, setCurrentEmail] = useState("");
  const [reviewStatus, setReviewStatus] = useState("Pending");
  const [reviewComment, setReviewComment] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [saveSuccess, setSaveSuccess] = useState("");

  useEffect(() => {
    if (isReviewerMode) setCurrentEmail(getCurrentUserEmail());
  }, [isReviewerMode]);

  useEffect(() => {
    if (!router.isReady) return;
    if (!id || id === "undefined" || id === "null") {
      setLoading(false);
      setError("Mandate ID not found in the URL.");
      return;
    }

    const controller = new AbortController();

    const fetchMandate = async () => {
      try {
        setLoading(true);
        setError("");

        const res = await CustomAxios.get(API.MANDATE_DETAIL(id), {
          signal: controller.signal,
        });
        setData(res?.data || null);
      } catch (e) {
        if (e?.name === "AbortError") return;
        setError(e?.message || "Something went wrong while fetching mandate.");
        setData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchMandate();

    return () => controller.abort();
  }, [id, router.isReady]);

  const myEmail = useMemo(
    () => currentEmail || (isReviewerMode ? getCurrentUserEmail() : ""),
    [currentEmail, isReviewerMode],
  );

  const isAssignedToMe = useMemo(() => {
    if (!data || !myEmail) return false;
    if (mode === "sma") {
      return normalizeAssignedSmas(data).some((x) => x.email === myEmail);
    }
    if (mode === "legal") {
      return normalizeAssignedLegals(data).some((x) => x.email === myEmail);
    }
    return false;
  }, [data, mode, myEmail]);

  useEffect(() => {
    if (!data || !myEmail || !isReviewerMode) return;

    if (mode === "sma") {
      const mySme = normalizeAssignedSmas(data).find((x) => x.email === myEmail);
      setReviewStatus(mySme?.status || "Pending");
      setReviewComment(mySme?.smaComment || "");
      return;
    }

    setReviewStatus(getMyLegalStatus(data, myEmail));
    setReviewComment(data?.legalComment || "");
  }, [data, isReviewerMode, mode, myEmail]);

  const v = useMemo(() => (data ? buildDisplayValues(data) : {}), [data]);
  const smeDue = useMemo(() => (data ? parseSmeDueDate(data, myEmail) : null), [data, myEmail]);
  const legalDue = useMemo(() => (data ? parseLegalDueDate(data) : null), [data]);

  const smeStatusText = useMemo(() => {
    if (!data) return "Pending";
    if (mode === "sma") return reviewStatus;
    const uniq = Array.from(new Set(normalizeAssignedSmas(data).map((x) => x.status || "Pending")));
    return uniq.length === 1 ? uniq[0] : uniq.join(", ");
  }, [data, mode, reviewStatus]);

  const legalStatusText = useMemo(() => {
    if (!data) return "Pending";
    if (mode === "legal") return reviewStatus;
    const uniq = Array.from(new Set(normalizeAssignedLegals(data).map((x) => x.status || "Pending")));
    return uniq.length === 1 ? uniq[0] : uniq.join(", ");
  }, [data, mode, reviewStatus]);

  const saveReviewerStatus = async () => {
    const mandateId = data?.id || data?._id;
    if (!mandateId || !myEmail) {
      setSaveError("Mandate ID or user email not found.");
      return;
    }

    try {
      setSaving(true);
      setSaveError("");
      setSaveSuccess("");

      const decision =
        reviewStatus === "Approved"
          ? "accept"
          : reviewStatus === "Rejected"
            ? "reject"
            : "review";

      if (mode === "sma") {
        const nextAssignedSmas = buildAssignedSmasPayload(
          data,
          myEmail,
          reviewStatus,
          reviewComment,
        );
        const res = await CustomAxios.patch(API.SMA_DECISION(mandateId), {
          decision,
          comment: reviewComment,
        });
        const updated = res?.data ?? null;
        const mergedAssignedSmas = Array.isArray(updated?.assignedSmas)
          ? updated.assignedSmas.map((backendSme) => {
              const sentSme = nextAssignedSmas.find(
                (s) => s.email?.toLowerCase() === backendSme.email?.toLowerCase(),
              );
              return {
                ...backendSme,
                smaComment: sentSme?.smaComment || backendSme.smaComment || "",
              };
            })
          : nextAssignedSmas;

        setData((prev) => ({
          ...(prev || {}),
          ...(updated || {}),
          assignedSmas: mergedAssignedSmas,
        }));
        const updatedSme = mergedAssignedSmas.find((x) => x?.email === myEmail);
        setReviewComment(updatedSme?.smaComment || "");
        setSaveSuccess("SME status and comment updated successfully.");
        return;
      }

      const res = await CustomAxios.patch(API.LEGAL_DECISION(mandateId), {
        decision,
        comment: reviewComment || "",
      });
      const updatedData = res?.data || {};
      setData((prev) => ({
        ...(prev || {}),
        ...updatedData,
        legalApprovalStatus:
          updatedData?.legalApprovalStatus ?? reviewStatus ?? prev?.legalApprovalStatus,
        legalComment: updatedData?.legalComment ?? reviewComment ?? prev?.legalComment,
      }));
      setReviewComment(updatedData?.legalComment ?? reviewComment ?? "");
      setSaveSuccess("Legal status and comment updated successfully.");
    } catch (e) {
      setSaveError(e?.message || "Failed to save status or comment.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="m-5 rounded-2xl border bg-white p-6 shadow-sm text-sm text-gray-600">
        Loading mandate...
      </div>
    );
  }

  if (!loading && error) {
    return (
      <EmptyState
        title="Error"
        message={error}
        tone="error"
        onBack={() => router.back()}
        backLabel={`Back to ${mode === "legal" ? "Legal" : mode === "sma" ? "SME" : "Mandates"} Dashboard`}
      />
    );
  }

  if (!data) {
    return (
      <EmptyState
        title="Mandate not found"
        message={`No record exists for ID: ${id}`}
        onBack={() => router.back()}
        backLabel={`Back to ${mode === "legal" ? "Legal" : mode === "sma" ? "SME" : "Mandates"} Dashboard`}
      />
    );
  }

  const showAdminReviewDetails = mode === "admin";
  const showReviewerPanel = isReviewerMode;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="mx-5 min-h-screen bg-white rounded-lg p-5 my-3">
        <div className="px-6 py-8 bg-[#2B245C] rounded-2xl shadow-lg hover:shadow-2xl transition-shadow duration-300">
          <div className="flex flex-col gap-3 lg:flex-row lg:justify-between">
            <div>
              <p className="text-xs text-white">RBI Circular</p>
              <h1 className="text-3xl font-bold text-cyan-50 wrap-break-words">
                {v.rbiCircularNumber}
              </h1>
              <p className="text-sm text-white mt-1 wrap-break-words">
                {v.subjectTitle}
              </p>
              <p className="text-xs text-white mt-1">
                Reference:{" "}
                <span className="text-cyan-50 font-medium wrap-break-words">
                  {v.referenceNumber}
                </span>
              </p>
            </div>

            <div className="flex shrink-0 flex-wrap items-center gap-2">
              {mode === "admin" ? (
                <>
                  <Link
                    href={DASHBOARD_BY_MODE.admin}
                    className="rounded-lg bg-white text-[#2B245C] px-6 py-2.5 text-sm font-semibold shadow-md hover:shadow-lg hover:bg-gray-100 transition-all"
                  >
                    Go to Mandates
                  </Link>
                  <Link
                    href="/controls/controls-dashboard"
                    className="rounded-lg bg-white text-[#2B245C] px-6 py-2.5 text-sm font-semibold shadow-md hover:shadow-lg hover:bg-gray-100 transition-all"
                  >
                    Go to Controls
                  </Link>
                </>
              ) : (
                <button
                  onClick={() => router.back()}
                  className="rounded-lg bg-white text-[#2B245C] px-6 py-2.5 text-sm font-semibold shadow-md hover:shadow-lg hover:bg-gray-100 transition-all"
                >
                  Back
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="py-5 space-y-5">
          {showReviewerPanel ? (
            <ReviewerStatusPanel
              isAssignedToMe={isAssignedToMe}
              mode={mode}
              status={reviewStatus}
              comment={reviewComment}
              saving={saving}
              saveError={saveError}
              saveSuccess={saveSuccess}
              onStatusChange={(value) => {
                setReviewStatus(value);
                setSaveSuccess("");
                setSaveError("");
              }}
              onCommentChange={setReviewComment}
              onSave={saveReviewerStatus}
            />
          ) : null}

          <div className="flex flex-wrap gap-3">
            <Badge label="Mandate Status" value={v.mandateStatus} type="status" />
            <Badge label="Priority" value={v.priorityLevel} type="priority" />
            <Badge label="Match" value={v.matchStatus} />
            <Badge
              label="Confidence"
              value={v.matchingConfidence === "-" ? "-" : `${v.matchingConfidence}%`}
            />
          </div>

          <MandateInformationSection v={v} />
          <ProjectResourcesSection v={v} />

          {showAdminReviewDetails ? (
            <>
              <LegalReviewSection
                v={v}
                data={data}
                legalDue={legalDue}
                legalStatusText={legalStatusText}
              />
              <SmeReviewsSection data={data} />
              <ComplianceOwnerSection v={v} />
            </>
          ) : (
            <ComplianceStatusSection
              mode={mode}
              v={v}
              smeDue={smeDue}
              legalDue={legalDue}
              smeStatusText={smeStatusText}
              legalStatusText={legalStatusText}
            />
          )}

          <Section title="Document">
            <KeyValue
              label="Document URL"
              value={
                <DocumentPreview
                  mandate={data}
                  mandateId={id}
                  documentUrl={data?.documentUrl}
                  baseUrl={API_BASE_URL}
                />
              }
              full
            />
          </Section>
        </div>
      </div>
    </div>
  );
}

function EmptyState({ title, message, tone, onBack, backLabel }) {
  const isError = tone === "error";
  return (
    <div
      className={`m-5 rounded-2xl border p-6 shadow-sm ${
        isError ? "border-red-200 bg-red-50" : "bg-white"
      }`}
    >
      <h2 className={`text-lg font-semibold ${isError ? "text-red-700" : "!text-[#050038]"}`}>
        {title}
      </h2>
      <p className={`text-sm mt-1 ${isError ? "text-red-600" : "text-gray-600"}`}>
        {message}
      </p>
      <button
        onClick={onBack}
        className="mt-4 inline-flex h-10 min-w-[168px] items-center justify-center whitespace-nowrap rounded-lg bg-[#2B245C] px-4 text-sm font-semibold text-white transition hover:bg-opacity-90"
      >
        {backLabel}
      </button>
    </div>
  );
}

function ReviewerStatusPanel({
  isAssignedToMe,
  mode,
  status,
  comment,
  saving,
  saveError,
  saveSuccess,
  onStatusChange,
  onCommentChange,
  onSave,
}) {
  const roleName = mode === "legal" ? "Legal Reviewer" : "SME";

  if (!isAssignedToMe) {
    return (
      <div className="rounded-2xl border border-[#2B245C] bg-white p-6 shadow-lg hover:shadow-2xl transition-shadow duration-300">
        <p className="text-xl font-bold text-[#2B245C]">Status</p>
        <p className="text-sm text-gray-500 mt-1">
          You are not assigned to this mandate as {roleName}.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-[#2B245C] bg-white p-6 shadow-lg hover:shadow-2xl transition-shadow duration-300">
      <h2 className="text-2xl font-bold text-[#2B245C] mb-4">
        Update your Status and Comment
      </h2>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="min-w-0">
          <p className="text-sm font-semibold">Status</p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
          <select
            value={status}
            onChange={(e) => onStatusChange(e.target.value)}
            className="rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#050038]/30"
          >
            <option value="Pending">Pending</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
            <option value="Needs Changes">Needs Changes</option>
          </select>
        </div>
      </div>

      <div className="mt-4">
        <label className="block text-sm font-semibold">Add a Comment</label>
        <textarea
          value={comment}
          onChange={(e) => onCommentChange(e.target.value)}
          placeholder="Add a comment"
          rows="3"
          className="mt-2 w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#050038]/30"
        />
      </div>

      <div className="mt-4 flex justify-end">
        <button
          type="button"
          onClick={onSave}
          disabled={saving}
          className={`inline-flex h-10 min-w-[112px] items-center justify-center gap-2 whitespace-nowrap rounded-lg px-5 text-sm font-semibold shadow-sm transition focus:outline-none focus:ring-2 focus:ring-[#050038]/30 ${
            saving
              ? "cursor-not-allowed bg-gray-200 text-gray-500"
              : "bg-gradient-to-r from-[#050038] via-[#2B245C] to-[#050038] text-white hover:bg-opacity-90"
          }`}
        >
          {saving ? (
            <>
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/60 border-t-white" />
              Saving...
            </>
          ) : (
            "Save"
          )}
        </button>
      </div>

      {saveError ? (
        <div className="mt-3 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {saveError}
        </div>
      ) : null}
      {saveSuccess ? (
        <div className="mt-3 rounded-xl border border-green-200 bg-green-50 p-3 text-sm text-green-700">
          {saveSuccess}
        </div>
      ) : null}
    </div>
  );
}

function MandateInformationSection({ v }) {
  return (
    <Section title="Mandate Information">
      <KeyValue label="RBI Circular Number" value={v.rbiCircularNumber} />
      <KeyValue label="Reference Number" value={v.referenceNumber} />
      <KeyValue label="Date of Issue" value={v.dateOfIssue} />
      <KeyValue label="Issuing Department" value={v.issuingDepartment} />
      <KeyValue label="Category / Type" value={v.categoryType} />
      <KeyValue label="Subject / Title" value={v.subjectTitle} />
      <KeyValue label="Applicability Audience" value={v.applicabilityAudience} full />
      <KeyValue label="Effective Date" value={v.effectiveDate} />
      <KeyValue label="Sunset / Withdrawal Date" value={v.sunsetDate} />
      <KeyValue label="RBI Reference Link" value={v.referLink} full />
      <KeyValue label="Issued To" value={v.issuedTo} />
      <KeyValue label="Signatory Name" value={v.signatoryName} />
      <KeyValue label="Designation" value={v.designation} full />
      <Paragraph label="Description" text={v.description} />
      <Paragraph label="Legal Basis" text={v.legalBasis} />
      <Paragraph label="Additional Notes" text={v.additionalNotes} />
      <Paragraph label="Applicability Narrative" text={v.applicabilityNarrative} />
      <Paragraph label="Purpose / Objective Summary" text={v.purposeSummary} />
      <Paragraph label="Scope of Impact" text={v.scopeImpact} />
    </Section>
  );
}

function ProjectResourcesSection({ v }) {
  return (
    <Section title="Project Resources">
      <KeyValue label="Mandate Tester" value={v.mandateTester} />
      <KeyValue label="Risk Delivery SME" value={v.riskDeliverySME} />
      <KeyValue label="Mandate Lead Tester" value={v.mandateLeadTester} />
      <KeyValue label="Test Plan Owner" value={v.testPlanOwner} />
      <KeyValue label="Mandate Manager" value={v.mandateManager} />
      <KeyValue label="Test Plan Owner Name" value={v.testPlanOwnerName} />
      <KeyValue label="Mandate QA Reviewer" value={v.mandateQAReviewer} />
      <KeyValue label="Enterprise Risk Officer" value={v.enterpriseRiskOfficer} />
      <KeyValue label="Mandate Director" value={v.mandateDirector} />
      <KeyValue label="Mandate Business Partners" value={v.mandateBusinessPartners} full />
    </Section>
  );
}

function LegalReviewSection({ v, data, legalDue, legalStatusText }) {
  return (
    <Section title="Legal Reviewer Approval">
      <KeyValue label="Assigned Legal Reviewer" value={v.assignedLegal} />
      <KeyValue
        label="Legal Due Date"
        value={
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-medium text-gray-900">
              {legalDue ? formatDDMMYYYY(legalDue) : "-"}
            </span>
            <StatusBadge status={toDueLabel(legalDue, legalStatusText)} />
          </div>
        }
      />
      <KeyValue label="Legal Approval Status" value={<StatusBadge status={legalStatusText} />} />
      <Paragraph label="Legal Comment" text={data?.legalComment ? String(data.legalComment) : "-"} />
    </Section>
  );
}

function SmeReviewsSection({ data }) {
  if (!Array.isArray(data?.assignedSmas) || data.assignedSmas.length === 0) {
    return (
      <Section title="SME Reviews">
        <p className="text-sm text-gray-500">No SMEs assigned to this mandate.</p>
      </Section>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-[#050038] px-4 lg:px-6">
        SME Reviews ({data.assignedSmas.length})
      </h2>
      {data.assignedSmas.map((sme, idx) => {
        const smeDueDate = sme?.smaDueDate || sme?.smeDueDate || sme?.dueDate;
        const smeDateObj = smeDueDate ? new Date(smeDueDate) : null;
        const smeDiff =
          smeDateObj && !Number.isNaN(smeDateObj.getTime()) ? dayDiff(smeDateObj) : null;
        const smeDueLabel =
          smeDiff !== null && smeDiff !== undefined
            ? smeDiff < 0
              ? `${Math.abs(smeDiff)} ${pluralDays(Math.abs(smeDiff))} Overdue`
              : smeDiff === 0
                ? "Due Today"
                : `${smeDiff} ${pluralDays(smeDiff)} Remaining`
            : "No Due Date";

        return (
          <div key={sme?._id || sme?.email || idx} className="rounded-2xl border border-[#2B245C] bg-white p-6 shadow-lg hover:shadow-2xl transition-shadow duration-300">
            <div className="mb-4 pb-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold !text-[#050038]">
                SME {idx + 1}: {sme?.name || sme?.email || "Unknown"}
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 auto-rows-max">
              <SimpleField label="Email" value={sme?.email || "-"} />
              <div>
                <p className="text-xs text-gray-500">SME Due Date</p>
                <div className="flex flex-wrap items-center gap-2 mt-1">
                  <span className="text-sm font-medium text-gray-900">
                    {smeDateObj ? formatDDMMYYYY(smeDateObj) : "-"}
                  </span>
                  {smeDueLabel !== "No Due Date" && (
                    <span
                      className={`text-xs font-medium px-2 py-1 rounded ${
                        smeDiff !== null && smeDiff < 0
                          ? "bg-red-100 text-red-700"
                          : smeDiff === 0
                            ? "bg-orange-100 text-orange-700"
                            : "bg-blue-100 text-blue-700"
                      }`}
                    >
                      {smeDueLabel}
                    </span>
                  )}
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-500">SME Approval Status</p>
                <div className="mt-1">
                  <StatusBadge status={sme?.status || "Pending"} />
                </div>
              </div>
              <SimpleField label="Last Updated" value={sme?.updatedAt ? formatDate(sme.updatedAt) : "-"} />
              <div className="md:col-span-2">
                <p className="text-xs text-gray-500 mb-2">SME Comment</p>
                <div className="bg-gray-50 rounded-lg p-3 border border-gray-200 min-h-20">
                  <p className="text-sm text-gray-800 whitespace-pre-wrap wrap-break-words">
                    {sme?.smaComment ? String(sme.smaComment) : "No comment provided"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function ComplianceOwnerSection({ v }) {
  return (
    <Section title="Compliance Owner">
      <KeyValue label="Assigned Compliance Owner" value={v.assignedCompliance} />
      <KeyValue label="SLA Date" value={v.slaDate} />
      <Paragraph label="Internal Notes" text={v.internalNotes} />
      <Paragraph label="Change Log" text={v.changeLog} />
    </Section>
  );
}

function ComplianceStatusSection({ mode, v, smeDue, legalDue, smeStatusText, legalStatusText }) {
  const dueDate = mode === "legal" ? legalDue : smeDue;
  const dueStatus = mode === "legal" ? legalStatusText : smeStatusText;
  const dueLabel = mode === "legal" ? "Legal Due Date" : "SME Due Date";

  return (
    <Section title="Compliance Status">
      {mode === "legal" ? (
        <KeyValue label="Assigned Legal Reviewer" value={v.assignedLegal} />
      ) : (
        <KeyValue label="Assigned SME" value={v.assignedSme} />
      )}
      <KeyValue
        label={dueLabel}
        value={
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-medium text-gray-900">
              {dueDate ? formatDDMMYYYY(dueDate) : "-"}
            </span>
            <StatusBadge status={toDueLabel(dueDate, dueStatus)} />
          </div>
        }
      />
      {mode === "legal" ? (
        <KeyValue label="Assigned SME" value={v.assignedSme} />
      ) : (
        <KeyValue label="Assigned Legal Reviewer" value={v.assignedLegal} />
      )}
      <KeyValue label="Mandate Status" value={v.mandateStatus} />
      <KeyValue label="Assigned Compliance Owner" value={v.assignedCompliance} />
      <Paragraph label="Internal Notes" text={v.internalNotes} />
      <Paragraph label="Change Log" text={v.changeLog} />
    </Section>
  );
}

function Section({ title, children }) {
  return (
    <div className="rounded-2xl border border-[#2B245C] bg-white p-6 shadow-lg hover:shadow-2xl transition-shadow duration-300">
      <h2 className="text-2xl font-bold text-[#2B245C] mb-4">{title}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 auto-rows-max">
        {children}
      </div>
    </div>
  );
}

function KeyValue({ label, value, full }) {
  const empty = value === undefined || value === null || value === "";
  return (
    <div className={full ? "md:col-span-2" : ""}>
      <p className="text-xs text-gray-500">{label}</p>
      <div className="text-sm font-medium text-gray-900 mt-1 whitespace-pre-wrap wrap-break-words">
        {empty ? "-" : value}
      </div>
    </div>
  );
}

function Paragraph({ label, text }) {
  return (
    <div className="md:col-span-2">
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap wrap-break-words">
        {text || "-"}
      </p>
    </div>
  );
}

function SimpleField({ label, value }) {
  return (
    <div>
      <p className="text-xs text-gray-500">{label}</p>
      <p className="text-sm font-medium text-gray-900 mt-1">{value}</p>
    </div>
  );
}
