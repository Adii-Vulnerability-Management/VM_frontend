import { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import { can } from "@/auth/auth-permissions";
import breachEmailNotificationService from "../../services/breachEmailNotificationService"

// ── Permission helpers ────────────────────────────────────────────────────────
const canCreateCampaign = () =>
  can("breach_email_notification.campaign.create");
const canUploadCSV = () =>
  can("breach_email_notification.recipients.upload");
const canEditTemplate = () =>
  can("breach_email_notification.template.edit");
const canEditRemedies = () =>
  can("breach_email_notification.remedies.edit");
const canPreview = () =>
  can("breach_email_notification.preview.read");
const canSend = () =>
  can("breach_email_notification.send.trigger");
const canViewDelivery = () =>
  can("breach_email_notification.delivery.read");
const canViewAudit = () =>
  can("breach_email_notification.audit_log.read");

// ── Small reusable components ─────────────────────────────────────────────────

function SectionCard({ title, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-5 py-3 bg-[#F2F1FB] text-left"
      >
        <span className="text-sm font-semibold text-[#2B245C]">{title}</span>
        <span className="text-[#2B245C] text-lg">{open ? "▲" : "▼"}</span>
      </button>
      {open && <div className="p-5">{children}</div>}
    </div>
  );
}

function DeadlineBanner({ hoursRemaining, deadlineStatus, notificationDeadline }) {
  const colorMap = {
    GREEN: {
      bar: "bg-green-500",
      bg: "bg-green-50 border-green-300",
      text: "text-green-800",
      icon: "🟢",
      label: "On Track",
    },
    YELLOW: {
      bar: "bg-yellow-400",
      bg: "bg-yellow-50 border-yellow-300",
      text: "text-yellow-800",
      icon: "🟡",
      label: "Act Soon",
    },
    RED: {
      bar: "bg-red-500",
      bg: "bg-red-50 border-red-300",
      text: "text-red-800",
      icon: "🔴",
      label: "Overdue",
    },
  };

  const c = colorMap[deadlineStatus] || colorMap.GREEN;

  // Progress bar — capped between 0 and 100
  const totalHours = 72;
  const elapsed = totalHours - hoursRemaining;
  const pct = Math.min(100, Math.max(0, (elapsed / totalHours) * 100));

  return (
    <div className={`border rounded-lg p-4 ${c.bg}`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-lg">{c.icon}</span>
          <span className={`text-sm font-semibold ${c.text}`}>
            DPDP Notification Deadline — {c.label}
          </span>
        </div>
        <span className={`text-xs font-medium ${c.text}`}>
          Deadline:{" "}
          {notificationDeadline
            ? new Date(notificationDeadline).toLocaleString("en-IN", {
                timeZone: "Asia/Kolkata",
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
                hour12: true,
                timeZoneName: "short",
              })
            : "—"}
        </span>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
        <div
          className={`h-2 rounded-full transition-all ${c.bar}`}
          style={{ width: `${pct}%` }}
        />
      </div>

      <p className={`text-xs ${c.text}`}>
        {hoursRemaining > 0
          ? `${Math.abs(hoursRemaining).toFixed(1)} hours remaining to notify affected employees`
          : `Deadline passed ${Math.abs(hoursRemaining).toFixed(1)} hours ago`}
      </p>
    </div>
  );
}

function StatCard({ label, value, color }) {
  const colorMap = {
    blue: "bg-blue-50 border-blue-200 text-blue-700",
    green: "bg-green-50 border-green-200 text-green-700",
    purple: "bg-purple-50 border-purple-200 text-purple-700",
    red: "bg-red-50 border-red-200 text-red-700",
    orange: "bg-orange-50 border-orange-200 text-orange-700",
  };
  return (
    <div className={`border rounded-lg p-4 text-center ${colorMap[color]}`}>
      <div className="text-2xl font-bold">{value ?? 0}</div>
      <div className="text-xs font-medium mt-1">{label}</div>
    </div>
  );
}

// ── Status badge map (shared) ─────────────────────────────────────────────────
const statusBadge = {
  DRAFT: "bg-gray-100 text-gray-700",
  READY: "bg-blue-100 text-blue-700",
  SENDING: "bg-yellow-100 text-yellow-700",
  SENT: "bg-green-100 text-green-700",
  FAILED: "bg-red-100 text-red-700",
};

// ── Main Component ─────────────────────────────────────────────────────────────

export default function BreachEmailNotificationTab({ breachId, tenantId, breachStatus }) {
  // ── State ───────────────────────────────────────────────────────────────────
  const [loading, setLoading] = useState(true);
  const [campaign, setCampaign] = useState(null);

  // Sub-tabs
  const [activeSubTab, setActiveSubTab] = useState("current");

  // History
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  // Recipients
  const [recipients, setRecipients] = useState([]);
  const [recipientPage, setRecipientPage] = useState(1);
  const [recipientTotal, setRecipientTotal] = useState(0);
  const [recipientSearch, setRecipientSearch] = useState("");
  const [recipientStatusFilter, setRecipientStatusFilter] = useState("");
  const [csvUploading, setCsvUploading] = useState(false);
  const fileInputRef = useRef(null);

  // Template
  const [template, setTemplate] = useState({
    emailSubject: "",
    emailBodyHtml: "",
    emailBodyText: "",
  });
  const [templateView, setTemplateView] = useState("html");
  const [savingTemplate, setSavingTemplate] = useState(false);

  // Remedies
  const [remedies, setRemedies] = useState([]);
  const [newRemedy, setNewRemedy] = useState("");
  const [editingRemedyIdx, setEditingRemedyIdx] = useState(null);
  const [editingRemedyText, setEditingRemedyText] = useState("");
  const [savingRemedies, setSavingRemedies] = useState(false);

  // Preview
  const [previewData, setPreviewData] = useState(null);
  const [previewEmail, setPreviewEmail] = useState("");
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewModalOpen, setPreviewModalOpen] = useState(false);

  // Send
  const [sendModalOpen, setSendModalOpen] = useState(false);
  const [confirmationNote, setConfirmationNote] = useState("");
  const [sending, setSending] = useState(false);

  // Audit logs
  const [auditLogs, setAuditLogs] = useState([]);
  const [auditPage, setAuditPage] = useState(1);
  const [auditTotal, setAuditTotal] = useState(0);

  // Campaign create / delete
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  // Allowed statuses to have this tab active
  const ALLOWED_STATUSES = ["Contained", "Remediated", "Notified", "Closed"];
  const tabAllowed = ALLOWED_STATUSES.includes(breachStatus);

  // ── Load campaign on mount ──────────────────────────────────────────────────
  useEffect(() => {
    if (!breachId || !tenantId || !tabAllowed) {
      setLoading(false);
      return;
    }
    fetchCampaign();
  }, [breachId, tenantId]);

  // ── Load history when history tab is opened ─────────────────────────────────
  useEffect(() => {
    if (activeSubTab === "history" && breachId && tenantId) {
      fetchHistory();
    }
  }, [activeSubTab, breachId, tenantId]);

  const fetchCampaign = async () => {
    try {
      setLoading(true);
      const { data } = await breachEmailNotificationService.getCampaign(
        breachId,
        tenantId,
      );
      if (data?.data) {
        setCampaign(data.data);
        setTemplate({
          emailSubject: data.data.emailSubject || "",
          emailBodyHtml: data.data.emailBodyHtml || "",
          emailBodyText: data.data.emailBodyText || "",
        });
        setRemedies(data.data.recommendedRemedies || []);
        fetchRecipients(1, "", "");
        if (canViewAudit()) fetchAuditLogs(1);
      }
    } catch (err) {
      if (err?.response?.status !== 404) {
        toast.error("Failed to load campaign");
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchHistory = async () => {
    try {
      setHistoryLoading(true);
      const { data } = await breachEmailNotificationService.getCampaignHistory(
        breachId,
        tenantId,
      );
      setHistory(data?.data || []);
    } catch (err) {
      toast.error("Failed to load campaign history");
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleDeleteCampaign = async () => {
    try {
      setDeleting(true);
      await breachEmailNotificationService.deleteCampaign(breachId, tenantId);
      toast.success("Campaign deleted. You can now create a new one.");
      setDeleteConfirmOpen(false);
      setCampaign(null);
      setRecipients([]);
      setRemedies([]);
      setAuditLogs([]);
      setTemplate({ emailSubject: "", emailBodyHtml: "", emailBodyText: "" });
    } catch (err) {
      toast.error(
        err?.response?.data?.message || "Failed to delete campaign",
      );
    } finally {
      setDeleting(false);
    }
  };

  // ── Recipients ──────────────────────────────────────────────────────────────
  const fetchRecipients = async (page, search, status) => {
    try {
      const { data } = await breachEmailNotificationService.getRecipients(
        breachId,
        tenantId,
        page,
        50,
        status || undefined,
        search || undefined,
      );
      setRecipients(data?.data?.recipients || []);
      setRecipientTotal(data?.data?.pagination?.total || 0);
    } catch {
      // silent
    }
  };

  const handleCSVUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith(".csv")) {
      toast.error("Only .csv files are accepted");
      return;
    }

    try {
      setCsvUploading(true);
      const { data } = await breachEmailNotificationService.uploadCSV(
        breachId,
        tenantId,
        file,
      );
      toast.success(
        `CSV uploaded — ${data.data.validRows} valid, ${data.data.skippedRows} skipped`,
      );
      await fetchCampaign();
    } catch (err) {
      toast.error(
        err?.response?.data?.message || "Failed to upload CSV",
      );
    } finally {
      setCsvUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // ── Template ────────────────────────────────────────────────────────────────
  const handleSaveTemplate = async () => {
  const payload = {
    emailSubject: String(template.emailSubject || "").trim(),
    emailBodyHtml: String(template.emailBodyHtml || "").trim(),
    emailBodyText: String(template.emailBodyText || "").trim(),
  };

  if (
    !payload.emailSubject ||
    !payload.emailBodyHtml ||
    !payload.emailBodyText
  ) {
    toast.error("Subject, HTML body and plain-text body are required");
    return;
  }

  try {
    setSavingTemplate(true);

    await breachEmailNotificationService.updateTemplate(
      breachId,
      payload,
    );

    toast.success("Template saved successfully");

    // Refresh separately so refresh failure does not show “failed to save”.
    try {
      await fetchCampaign();
    } catch (refreshError) {
      console.error("Template saved, but refresh failed:", refreshError);
    }
  } catch (error) {
    console.error("Template save failed:", error);
    toast.error(
      error?.response?.data?.message ||
        error?.message ||
        "Failed to save template",
    );
  } finally {
    setSavingTemplate(false);
  }
};

  // ── Remedies ────────────────────────────────────────────────────────────────
  const handleAddRemedy = () => {
    if (!newRemedy.trim()) return toast.error("Remedy text is required");
    setRemedies((r) => [...r, newRemedy.trim()]);
    setNewRemedy("");
  };

  const handleRemoveRemedy = (idx) => {
    setRemedies((r) => r.filter((_, i) => i !== idx));
  };

  const handleSaveRemedies = async () => {
    if (remedies.length === 0) {
      return toast.error("At least one remedy is required");
    }
    try {
      setSavingRemedies(true);
      await breachEmailNotificationService.updateRemedies(
        breachId,
        tenantId,
        remedies,
      );
      toast.success("Remedies saved");
      await fetchCampaign();
    } catch (err) {
      toast.error(
        err?.response?.data?.message || "Failed to save remedies",
      );
    } finally {
      setSavingRemedies(false);
    }
  };

  // ── Preview ─────────────────────────────────────────────────────────────────
  const handlePreview = async () => {
    try {
      setPreviewLoading(true);
      const { data } = await breachEmailNotificationService.previewEmail(
        breachId,
        tenantId,
        previewEmail || undefined,
      );
      setPreviewData(data.data);
      setPreviewModalOpen(true);
    } catch (err) {
      toast.error(
        err?.response?.data?.message || "Failed to load preview",
      );
    } finally {
      setPreviewLoading(false);
    }
  };

  // ── Send ────────────────────────────────────────────────────────────────────
  const handleSend = async () => {
    try {
      setSending(true);
      await breachEmailNotificationService.sendMassEmail(
        breachId,
        tenantId,
        confirmationNote,
      );
      toast.success("Breach email notification send initiated");
      setSendModalOpen(false);
      setConfirmationNote("");
      await fetchCampaign();
    } catch (err) {
      toast.error(
        err?.response?.data?.message || "Failed to send emails",
      );
    } finally {
      setSending(false);
    }
  };

  // ── Create Campaign ─────────────────────────────────────────────────────────
  const handleCreateCampaign = async () => {
    try {
      setCreating(true);
      await breachEmailNotificationService.createCampaign(breachId, tenantId);
      toast.success("Campaign created");
      await fetchCampaign();
    } catch (err) {
      toast.error(
        err?.response?.data?.message || "Failed to create campaign",
      );
    } finally {
      setCreating(false);
    }
  };

  // ── Audit Logs ──────────────────────────────────────────────────────────────
  const fetchAuditLogs = async (page) => {
    try {
      const { data } = await breachEmailNotificationService.getAuditLogs(
        breachId,
        tenantId,
        page,
        50,
      );
      setAuditLogs(data?.data?.logs || []);
      setAuditTotal(data?.data?.pagination?.total || 0);
      setAuditPage(page);
    } catch {
      // silent
    }
  };

  // ── Pre-send checklist ──────────────────────────────────────────────────────
  const checklist = campaign
    ? [
        {
          label: `Recipients uploaded (${campaign.totalRecipients})`,
          ok: campaign.totalRecipients > 0,
        },
        {
          label: "Template configured",
          ok: !!campaign.emailSubject && !!campaign.emailBodyHtml,
        },
        {
          label: `Remedies added (${campaign.recommendedRemedies?.length ?? 0})`,
          ok: (campaign.recommendedRemedies?.length ?? 0) > 0,
        },
        {
          label: "Email not yet sent",
          ok: campaign.status !== "SENT",
        },
      ]
    : [];

  const allChecksPassed = checklist.every((c) => c.ok);

  // ── Render: tab blocked ─────────────────────────────────────────────────────
  if (!tabAllowed) {
    return (
      <section className="space-y-4 bg-[#F4F4F9] p-6 rounded-b-lg">
        <h2 className="text-xl font-semibold text-[#2B245C]">
          📧 Breach Email Notification
        </h2>
        <div className="bg-white rounded-lg p-8 text-center shadow-sm border border-gray-200">
          <p className="text-gray-500 text-sm">
            This tab is available when the breach status is{" "}
            <strong>Contained</strong> or later.
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Current status: <strong>{breachStatus || "Unknown"}</strong>
          </p>
        </div>
      </section>
    );
  }

  // ── Render: loading ─────────────────────────────────────────────────────────
  if (loading) {
    return (
      <section className="bg-[#F4F4F9] p-6 rounded-b-lg">
        <h2 className="text-xl font-semibold text-[#2B245C] mb-4">
          📧 Breach Email Notification
        </h2>
        <div className="flex items-center justify-center py-16 text-gray-400 text-sm">
          Loading...
        </div>
      </section>
    );
  }

  // ── Render: MAIN with sub-tabs ──────────────────────────────────────────────
  return (
    <section className="space-y-5 bg-[#F4F4F9] p-1 rounded-b-lg">

      {/* ── SUB-TABS ─────────────────────────────────────────────────────── */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setActiveSubTab("current")}
          className={`px-5 py-2 text-sm font-medium transition ${
            activeSubTab === "current"
              ? "text-[#2B245C] border-b-2 border-[#2B245C]"
              : "text-gray-500 hover:text-[#2B245C]"
          }`}
        >
          📧 Current Breach Email
        </button>
        <button
          onClick={() => setActiveSubTab("history")}
          className={`px-5 py-2 text-sm font-medium transition ${
            activeSubTab === "history"
              ? "text-[#2B245C] border-b-2 border-[#2B245C]"
              : "text-gray-500 hover:text-[#2B245C]"
          }`}
        >
          📋 Breach Email Sent History
        </button>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* SUB-TAB: CURRENT                                                       */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      {activeSubTab === "current" && (
        <>
          {!campaign ? (
            /* No campaign yet */
            <div className="bg-white rounded-lg p-10 text-center shadow-sm border border-gray-200">
              <p className="text-gray-600 text-sm mb-1 font-medium">
                No campaign has been created for this breach yet.
              </p>
              <p className="text-gray-400 text-xs mb-6">
                Creating a campaign will load the DPDP-compliant email template
                and auto-calculate the 72-hour notification deadline.
              </p>
              {canCreateCampaign() ? (
                <button
                  onClick={handleCreateCampaign}
                  disabled={creating}
                  className="inline-flex items-center px-6 py-2 rounded-md text-sm font-medium bg-[#2B245C] text-[#F2F1FB] shadow hover:bg-[#050038] transition disabled:opacity-60"
                >
                  {creating
                    ? "Creating..."
                    : "+ Create Breach Email Notification Campaign"}
                </button>
              ) : (
                <p className="text-xs text-gray-400">
                  Contact your Super Admin to create this campaign.
                </p>
              )}
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-[#2B245C]">
                  📧 Breach Email Notification
                </h2>
                <div className="flex items-center gap-2">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      statusBadge[campaign.status] ||
                      "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {campaign.status}
                  </span>
                  {canCreateCampaign() && (
                    <button
                      onClick={() => setDeleteConfirmOpen(true)}
                      className="px-3 py-1 rounded-md text-xs font-medium border border-red-300 text-red-600 hover:bg-red-50 transition"
                      title="Delete this campaign and create a fresh one"
                    >
                      🗑 Delete Campaign
                    </button>
                  )}
                </div>
              </div>

              {/* Deadline Banner */}
              {/* <DeadlineBanner
                hoursRemaining={campaign.hoursRemaining ?? 72}
                deadlineStatus={campaign.deadlineStatus ?? "GREEN"}
                notificationDeadline={campaign.notificationDeadline}
              /> */}

              {/* SECTION 1: Recipients */}
              <SectionCard title="Section 1 — Recipients">
                <div className="space-y-4">
                  <p className="text-xs text-gray-500">
                    Upload a CSV of affected employees. Required columns:{" "}
                    <code className="bg-gray-100 px-1 rounded">email</code>,{" "}
                    <code className="bg-gray-100 px-1 rounded">first_name</code>
                    ,{" "}
                    <code className="bg-gray-100 px-1 rounded">last_name</code>.
                    Optional:{" "}
                    <code className="bg-gray-100 px-1 rounded">
                      employee_id
                    </code>
                  </p>

                  {canUploadCSV() && campaign.status !== "SENT" && (
                    <div className="border-2 border-dashed border-[#2B245C]/30 rounded-lg p-6 text-center bg-[#F2F1FB]/40">
                      <p className="text-sm text-gray-500 mb-3">
                        {campaign.csvUploadFilename
                          ? `✅ Last upload: ${campaign.csvUploadFilename}`
                          : "No file uploaded yet"}
                      </p>
                      <div className="flex items-center justify-center gap-3">
                        <label className="inline-flex items-center px-4 py-2 rounded-md text-sm font-medium bg-[#2B245C] text-[#F2F1FB] shadow hover:bg-[#050038] cursor-pointer transition">
                          {csvUploading ? "Uploading..." : "📁 Choose CSV File"}
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept=".csv"
                            className="hidden"
                            onChange={handleCSVUpload}
                            disabled={csvUploading}
                          />
                        </label>
                        <a
                          href="data:text/csv;charset=utf-8,email,first_name,last_name,employee_id%0Ajohn.doe@company.com,John,Doe,EMP-001"
                          download="sample_recipients.csv"
                          className="inline-flex items-center px-4 py-2 rounded-md text-sm font-medium border border-[#2B245C] text-[#2B245C] hover:bg-[#F2F1FB] transition"
                        >
                          ⬇ Sample CSV
                        </a>
                      </div>
                      {campaign.csvUploadedAt && (
                        <p className="text-xs text-gray-400 mt-2">
                          Uploaded:{" "}
                          {new Date(campaign.csvUploadedAt).toLocaleString(
                            "en-IN",
                          )}{" "}
                          · Total: {campaign.totalRecipients}
                        </p>
                      )}
                    </div>
                  )}

                  {campaign.totalRecipients > 0 && (
                    <div className="space-y-3">
                      <div className="flex flex-col sm:flex-row gap-2">
                        <input
                          type="text"
                          placeholder="Search by name or email..."
                          value={recipientSearch}
                          onChange={(e) => {
                            setRecipientSearch(e.target.value);
                            fetchRecipients(
                              1,
                              e.target.value,
                              recipientStatusFilter,
                            );
                          }}
                          className="flex-1 bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#2B245C] focus:border-[#2B245C]"
                        />
                        <select
                          value={recipientStatusFilter}
                          onChange={(e) => {
                            setRecipientStatusFilter(e.target.value);
                            fetchRecipients(1, recipientSearch, e.target.value);
                          }}
                          className="bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#2B245C]"
                        >
                          <option value="">All Status</option>
                          {[
                            "PENDING",
                            "SENT",
                            "DELIVERED",
                            "OPENED",
                            "BOUNCED",
                            "COMPLAINED",
                            "FAILED",
                          ].map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="overflow-x-auto bg-white shadow rounded-lg">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-[#2B245C]">
                            <tr>
                              {[
                                "Emp ID",
                                "Email",
                                "First Name",
                                "Last Name",
                                "Status",
                                "Delivered At",
                              ].map((h) => (
                                <th
                                  key={h}
                                  className="px-4 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider"
                                >
                                  {h}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100">
                            {recipients.length > 0 ? (
                              recipients.map((r, i) => (
                                <tr
                                  key={r._id}
                                  className={
                                    i % 2 === 0 ? "bg-white" : "bg-[#F2F1FB]"
                                  }
                                >
                                  <td className="px-4 py-3 text-xs text-gray-600">
                                    {r.employeeId || "—"}
                                  </td>
                                  <td className="px-4 py-3 text-xs text-gray-700">
                                    {r.email}
                                  </td>
                                  <td className="px-4 py-3 text-xs text-gray-700">
                                    {r.firstName}
                                  </td>
                                  <td className="px-4 py-3 text-xs text-gray-700">
                                    {r.lastName}
                                  </td>
                                  <td className="px-4 py-3 text-xs">
                                    <StatusPill status={r.status} />
                                  </td>
                                  <td className="px-4 py-3 text-xs text-gray-500">
                                    {r.deliveredAt
                                      ? new Date(r.deliveredAt).toLocaleString(
                                          "en-IN",
                                        )
                                      : "—"}
                                  </td>
                                </tr>
                              ))
                            ) : (
                              <tr>
                                <td
                                  colSpan={6}
                                  className="px-4 py-6 text-center text-sm text-gray-400"
                                >
                                  No recipients found.
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>

                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>
                          Showing {recipients.length} of {recipientTotal}
                        </span>
                        <div className="flex gap-2">
                          <button
                            disabled={recipientPage === 1}
                            onClick={() => {
                              const p = recipientPage - 1;
                              setRecipientPage(p);
                              fetchRecipients(
                                p,
                                recipientSearch,
                                recipientStatusFilter,
                              );
                            }}
                            className="px-2 py-1 border rounded disabled:opacity-40 hover:bg-gray-50"
                          >
                            ← Prev
                          </button>
                          <button
                            disabled={recipients.length < 50}
                            onClick={() => {
                              const p = recipientPage + 1;
                              setRecipientPage(p);
                              fetchRecipients(
                                p,
                                recipientSearch,
                                recipientStatusFilter,
                              );
                            }}
                            className="px-2 py-1 border rounded disabled:opacity-40 hover:bg-gray-50"
                          >
                            Next →
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </SectionCard>

              {/* SECTION 2: Template */}
              <SectionCard title="Section 2 — Email Template" defaultOpen={false}>
                <div className="space-y-4">
                  <div className="flex items-start gap-2 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                    <span className="text-yellow-600 text-sm">⚠</span>
                    <p className="text-xs text-yellow-700">
                      Mandatory blocks are marked with{" "}
                      <code className="bg-yellow-100 px-1 rounded">
                        [MANDATORY: block_name]
                      </code>
                      . You can edit content inside them but cannot remove the
                      markers.
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#2B245C] mb-1">
                      Subject
                    </label>
                    <input
                      type="text"
                      value={template.emailSubject}
                      onChange={(e) =>
                        setTemplate((t) => ({
                          ...t,
                          emailSubject: e.target.value,
                        }))
                      }
                      disabled={
                        !canEditTemplate() || campaign.status === "SENT"
                      }
                      className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#2B245C] disabled:bg-gray-50 disabled:text-gray-400"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs font-semibold text-[#2B245C]">
                        Body
                      </label>
                      <div className="flex rounded-md overflow-hidden border border-gray-300">
                        {["html", "text"].map((v) => (
                          <button
                            key={v}
                            onClick={() => setTemplateView(v)}
                            className={`px-3 py-1 text-xs font-medium transition ${
                              templateView === v
                                ? "bg-[#2B245C] text-white"
                                : "bg-white text-gray-600 hover:bg-gray-50"
                            }`}
                          >
                            {v === "html" ? "HTML" : "Plain Text"}
                          </button>
                        ))}
                      </div>
                    </div>
                    <textarea
                      rows={14}
                      value={
                        templateView === "html"
                          ? template.emailBodyHtml
                          : template.emailBodyText
                      }
                      onChange={(e) =>
                        setTemplate((t) =>
                          templateView === "html"
                            ? { ...t, emailBodyHtml: e.target.value }
                            : { ...t, emailBodyText: e.target.value },
                        )
                      }
                      disabled={
                        !canEditTemplate() || campaign.status === "SENT"
                      }
                      className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-xs font-mono focus:ring-2 focus:ring-[#2B245C] disabled:bg-gray-50 disabled:text-gray-400"
                    />
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {[
                      "{{first_name}}",
                      "{{last_name}}",
                      "{{breach_title}}",
                      "{{breach_date}}",
                      "{{remedies}}",
                      "{{grievance_contact}}",
                      "{{dpo_contact}}",
                    ].map((v) => (
                      <span
                        key={v}
                        className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs font-mono"
                      >
                        {v}
                      </span>
                    ))}
                  </div>

                  {canEditTemplate() && campaign.status !== "SENT" && (
                    <button
                      onClick={handleSaveTemplate}
                      disabled={savingTemplate}
                      className="inline-flex items-center px-5 py-2 rounded-md text-sm font-medium bg-[#2B245C] text-[#F2F1FB] shadow hover:bg-[#050038] transition disabled:opacity-60"
                    >
                      {savingTemplate ? "Saving..." : "Save Template"}
                    </button>
                  )}
                </div>
              </SectionCard>

              {/* SECTION 3: Remedies */}
              <SectionCard
                title="Section 3 — Recommended Remedies"
                defaultOpen={false}
              >
                <div className="space-y-4">
                  <p className="text-xs text-gray-500">
                    These remedies are injected into the{" "}
                    <code className="bg-gray-100 px-1 rounded">
                      {"{{remedies}}"}
                    </code>{" "}
                    block. Minimum 1 required.
                  </p>

                  <div className="space-y-2">
                    {remedies.length === 0 && (
                      <p className="text-xs text-gray-400 italic">
                        No remedies added yet.
                      </p>
                    )}
                    {remedies.map((r, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-2 bg-[#F2F1FB] rounded-lg px-3 py-2"
                      >
                        <span className="text-xs text-[#2B245C] font-semibold w-5 shrink-0">
                          {idx + 1}.
                        </span>
                        {editingRemedyIdx === idx ? (
                          <input
                            className="flex-1 text-xs bg-white border border-gray-300 rounded px-2 py-1 focus:ring-1 focus:ring-[#2B245C]"
                            value={editingRemedyText}
                            onChange={(e) =>
                              setEditingRemedyText(e.target.value)
                            }
                          />
                        ) : (
                          <span className="flex-1 text-xs text-gray-700">
                            {r}
                          </span>
                        )}

                        {canEditRemedies() && campaign.status !== "SENT" && (
                          <div className="flex gap-1">
                            {editingRemedyIdx === idx ? (
                              <>
                                <button
                                  onClick={() => {
                                    const updated = [...remedies];
                                    updated[idx] = editingRemedyText;
                                    setRemedies(updated);
                                    setEditingRemedyIdx(null);
                                  }}
                                  className="text-xs text-green-600 hover:underline px-1"
                                >
                                  ✓
                                </button>
                                <button
                                  onClick={() => setEditingRemedyIdx(null)}
                                  className="text-xs text-gray-400 hover:underline px-1"
                                >
                                  ✕
                                </button>
                              </>
                            ) : (
                              <>
                                <button
                                  onClick={() => {
                                    setEditingRemedyIdx(idx);
                                    setEditingRemedyText(r);
                                  }}
                                  className="text-xs text-[#2B245C] hover:underline px-1"
                                >
                                  ✏
                                </button>
                                <button
                                  onClick={() => handleRemoveRemedy(idx)}
                                  className="text-xs text-red-500 hover:underline px-1"
                                >
                                  🗑
                                </button>
                              </>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {canEditRemedies() && campaign.status !== "SENT" && (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Add a new remedy..."
                        value={newRemedy}
                        onChange={(e) => setNewRemedy(e.target.value)}
                        onKeyDown={(e) =>
                          e.key === "Enter" && handleAddRemedy()
                        }
                        className="flex-1 bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#2B245C]"
                      />
                      <button
                        onClick={handleAddRemedy}
                        className="px-4 py-2 rounded-lg text-sm font-medium bg-[#2B245C] text-[#F2F1FB] hover:bg-[#050038] transition"
                      >
                        + Add
                      </button>
                    </div>
                  )}

                  {canEditRemedies() && campaign.status !== "SENT" && (
                    <button
                      onClick={handleSaveRemedies}
                      disabled={savingRemedies}
                      className="inline-flex items-center px-5 py-2 rounded-md text-sm font-medium bg-[#2B245C] text-[#F2F1FB] shadow hover:bg-[#050038] transition disabled:opacity-60"
                    >
                      {savingRemedies ? "Saving..." : "Save Remedies"}
                    </button>
                  )}
                </div>
              </SectionCard>

              {/* SECTION 4: Preview */}
              {canPreview() && (
                <SectionCard title="Section 4 — Preview Email" defaultOpen={false}>
                  <div className="space-y-4">
                    <p className="text-xs text-gray-500">
                      Preview the email as it will appear to a specific
                      recipient.
                    </p>
                    <div className="flex gap-2">
                      <input
                        type="email"
                        placeholder="Enter recipient email (optional — uses first recipient if blank)"
                        value={previewEmail}
                        onChange={(e) => setPreviewEmail(e.target.value)}
                        className="flex-1 bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#2B245C]"
                      />
                      <button
                        onClick={handlePreview}
                        disabled={
                          previewLoading || campaign.totalRecipients === 0
                        }
                        className="px-4 py-2 rounded-lg text-sm font-medium bg-[#2B245C] text-[#F2F1FB] hover:bg-[#050038] transition disabled:opacity-60"
                      >
                        {previewLoading ? "Loading..." : "Load Preview"}
                      </button>
                    </div>
                    {campaign.totalRecipients === 0 && (
                      <p className="text-xs text-red-500">
                        Upload recipients CSV before previewing.
                      </p>
                    )}
                  </div>
                </SectionCard>
              )}

              {/* SECTION 5: Delivery Status */}
              {canViewDelivery() && (
                <SectionCard
                  title="Section 5 — Delivery Status"
                  defaultOpen={false}
                >
                  {campaign.status !== "SENT" &&
                  campaign.status !== "SENDING" ? (
                    <p className="text-sm text-gray-400 italic text-center py-4">
                      No emails sent yet. Send the campaign to view delivery
                      statistics.
                    </p>
                  ) : (
                    <div className="space-y-4">
                      {campaign.sentAt && (
                        <p className="text-xs text-gray-500">
                          Campaign sent on:{" "}
                          <strong>
                            {new Date(campaign.sentAt).toLocaleString("en-IN")}
                          </strong>
                        </p>
                      )}

                      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                        <StatCard
                          label="Sent"
                          value={campaign.countSent}
                          color="blue"
                        />
                        <StatCard
                          label="Delivered"
                          value={campaign.countDelivered}
                          color="green"
                        />
                        <StatCard
                          label="Opened"
                          value={campaign.countOpened}
                          color="purple"
                        />
                        <StatCard
                          label="Bounced"
                          value={campaign.countBounced}
                          color="red"
                        />
                        <StatCard
                          label="Complained"
                          value={campaign.countComplained}
                          color="orange"
                        />
                      </div>

                      {campaign.countSent > 0 && (
                        <div className="space-y-2">
                          {[
                            {
                              label: "Delivered",
                              count: campaign.countDelivered,
                              color: "bg-green-500",
                            },
                            {
                              label: "Opened",
                              count: campaign.countOpened,
                              color: "bg-purple-500",
                            },
                            {
                              label: "Bounced",
                              count: campaign.countBounced,
                              color: "bg-red-500",
                            },
                          ].map(({ label, count, color }) => (
                            <div
                              key={label}
                              className="flex items-center gap-3"
                            >
                              <span className="text-xs text-gray-500 w-16 shrink-0">
                                {label}
                              </span>
                              <div className="flex-1 bg-gray-200 rounded-full h-2">
                                <div
                                  className={`h-2 rounded-full ${color}`}
                                  style={{
                                    width: `${Math.min(
                                      100,
                                      (count / campaign.countSent) * 100,
                                    )}%`,
                                  }}
                                />
                              </div>
                              <span className="text-xs text-gray-500 w-12 text-right">
                                {campaign.countSent > 0
                                  ? `${((count / campaign.countSent) * 100).toFixed(1)}%`
                                  : "0%"}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </SectionCard>
              )}

              {/* PRE-SEND CHECKLIST + SEND BUTTON */}
              {canSend() && campaign.status !== "SENT" && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
                  <h3 className="text-sm font-semibold text-[#2B245C] mb-3">
                    Pre-send Checklist
                  </h3>
                  <div className="space-y-2 mb-4">
                    {checklist.map((item) => (
                      <div
                        key={item.label}
                        className="flex items-center gap-2"
                      >
                        <span
                          className={
                            item.ok ? "text-green-500" : "text-red-400"
                          }
                        >
                          {item.ok ? "✅" : "❌"}
                        </span>
                        <span
                          className={`text-xs ${item.ok ? "text-gray-700" : "text-red-500"}`}
                        >
                          {item.label}
                        </span>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={() => setSendModalOpen(true)}
                    disabled={
                      !allChecksPassed || campaign.status === "SENDING"
                    }
                    className="inline-flex items-center px-6 py-2 rounded-md text-sm font-semibold bg-[#2B245C] text-[#F2F1FB] shadow hover:bg-[#050038] transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {campaign.status === "SENDING"
                      ? "⏳ Sending in progress..."
                      : "📤 Send Breach Email Notification"}
                  </button>

                  {!allChecksPassed && (
                    <p className="text-xs text-gray-400 mt-2">
                      Complete all checklist items before sending.
                    </p>
                  )}
                </div>
              )}

              {/* AUDIT LOG */}
              {canViewAudit() && (
                <SectionCard title="📋 Audit Log" defaultOpen={false}>
                  <div className="space-y-3">
                    <div className="overflow-x-auto bg-white rounded-lg shadow">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-[#2B245C]">
                          <tr>
                            {[
                              "Timestamp",
                              "Action",
                              "Performed By",
                              "Role",
                              "Details",
                            ].map((h) => (
                              <th
                                key={h}
                                className="px-4 py-3 text-left text-xs font-semibold text-white uppercase"
                              >
                                {h}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {auditLogs.length > 0 ? (
                            auditLogs.map((log, i) => (
                              <tr
                                key={log._id}
                                className={
                                  i % 2 === 0 ? "bg-white" : "bg-[#F2F1FB]"
                                }
                              >
                                <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">
                                  {new Date(log.createdAt).toLocaleString(
                                    "en-IN",
                                  )}
                                </td>
                                <td className="px-4 py-3 text-xs font-medium text-[#2B245C]">
                                  {log.action}
                                </td>
                                <td className="px-4 py-3 text-xs text-gray-700">
                                  {log.performedByEmail}
                                </td>
                                <td className="px-4 py-3 text-xs text-gray-500">
                                  {log.performedByRole}
                                </td>
                                <td className="px-4 py-3 text-xs text-gray-500">
                                  {log.metadata
                                    ? Object.entries(log.metadata)
                                        .slice(0, 2)
                                        .map(([k, v]) => `${k}: ${v}`)
                                        .join(" · ")
                                    : "—"}
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td
                                colSpan={5}
                                className="px-4 py-6 text-center text-sm text-gray-400"
                              >
                                No audit logs yet.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>

                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>
                        Showing {auditLogs.length} of {auditTotal}
                      </span>
                      <div className="flex gap-2">
                        <button
                          disabled={auditPage === 1}
                          onClick={() => fetchAuditLogs(auditPage - 1)}
                          className="px-2 py-1 border rounded disabled:opacity-40 hover:bg-gray-50"
                        >
                          ← Prev
                        </button>
                        <button
                          disabled={auditLogs.length < 50}
                          onClick={() => fetchAuditLogs(auditPage + 1)}
                          className="px-2 py-1 border rounded disabled:opacity-40 hover:bg-gray-50"
                        >
                          Next →
                        </button>
                      </div>
                    </div>
                  </div>
                </SectionCard>
              )}
            </>
          )}
        </>
      )}

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* SUB-TAB: HISTORY                                                       */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      {activeSubTab === "history" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-[#2B245C]">
              📋 Breach Email Sent History
            </h2>
            <button
              onClick={fetchHistory}
              disabled={historyLoading}
              className="px-3 py-1 rounded-md text-xs font-medium border border-[#2B245C] text-[#2B245C] hover:bg-[#F2F1FB] transition disabled:opacity-60"
            >
              {historyLoading ? "Refreshing..." : "🔄 Refresh"}
            </button>
          </div>

          <p className="text-xs text-gray-500">
            Complete history of all breach email campaigns for this breach.
            Deleted campaigns are preserved for compliance (7-year retention).
          </p>

          {historyLoading ? (
            <div className="text-center py-10 text-sm text-gray-400">
              Loading history...
            </div>
          ) : history.length === 0 ? (
            <div className="text-center py-10 text-sm text-gray-400 bg-white rounded-lg shadow-sm border border-gray-200">
              No campaigns yet for this breach.
            </div>
          ) : (
            <div className="overflow-x-auto bg-white shadow rounded-lg border border-gray-200 max-h-[600px] overflow-y-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-[#2B245C] sticky top-0 z-10">
                  <tr>
                    {[
                      "#",
                      "Breach ID",
                      "Breach Name",
                      "Status",
                      "Recipients",
                      "Sent",
                      "Delivered",
                      "Bounced",
                      "Sent At",
                      "Deadline Met",
                      "Created At",
                    ].map((h) => (
                      <th
                        key={h}
                        className="px-4 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider whitespace-nowrap"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {history.map((c, i) => (
                    <tr
                      key={c._id}
                      className={`${
                        i % 2 === 0 ? "bg-white" : "bg-[#F2F1FB]"
                      } ${c.isDeleted ? "opacity-60" : ""}`}
                    >
                      <td className="px-4 py-3 text-xs text-gray-600 whitespace-nowrap">
                        {i + 1}
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-700 whitespace-nowrap font-mono">
                        {c.breachNumber || String(c.breachId).slice(-8)}
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-800 font-medium">
                        {c.breachTitle}
                        {c.isDeleted && (
                          <span className="ml-2 px-2 py-0.5 bg-red-100 text-red-600 rounded-full text-[10px] font-semibold">
                            DELETED
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-xs whitespace-nowrap">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                            statusBadge[c.status] ||
                            "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {c.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-700 text-center whitespace-nowrap">
                        {c.totalRecipients ?? 0}
                      </td>
                      <td className="px-4 py-3 text-xs text-blue-700 text-center whitespace-nowrap font-medium">
                        {c.countSent ?? 0}
                      </td>
                      <td className="px-4 py-3 text-xs text-green-700 text-center whitespace-nowrap font-medium">
                        {c.countDelivered ?? 0}
                      </td>
                      <td className="px-4 py-3 text-xs text-red-700 text-center whitespace-nowrap font-medium">
                        {c.countBounced ?? 0}
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-600 whitespace-nowrap">
                        {c.sentAt
                          ? new Date(c.sentAt).toLocaleString("en-IN", {
                              timeZone: "Asia/Kolkata",
                              day: "2-digit",
                              month: "2-digit",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                              hour12: true,
                            })
                          : "—"}
                      </td>
                      <td className="px-4 py-3 text-xs whitespace-nowrap text-center">
                        {c.sentWithinDeadline === null ? (
                          <span className="text-gray-400">—</span>
                        ) : c.sentWithinDeadline ? (
                          <span className="text-green-600 font-semibold">
                            ✅ Yes
                          </span>
                        ) : (
                          <span className="text-red-600 font-semibold">
                            ❌ No
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">
                        {c.createdAt
                          ? new Date(c.createdAt).toLocaleString("en-IN", {
                              timeZone: "Asia/Kolkata",
                              day: "2-digit",
                              month: "2-digit",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                              hour12: true,
                            })
                          : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {history.length > 0 && (
            <p className="text-xs text-gray-400 text-right">
              Showing {history.length} campaign
              {history.length !== 1 ? "s" : ""} (including deleted)
            </p>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* MODALS (shared across sub-tabs)                                        */}
      {/* ══════════════════════════════════════════════════════════════════════ */}

      {/* SEND CONFIRMATION MODAL */}
      {sendModalOpen && campaign && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => !sending && setSendModalOpen(false)}
          />
          <div className="relative w-full max-w-md bg-white rounded-lg shadow-xl p-6 z-10">
            <h3 className="text-lg font-semibold text-[#2B245C]">
              📤 Confirm: Send Breach Email Notification
            </h3>
            <p className="mt-2 text-sm text-gray-600">
              You are about to send breach notification emails to{" "}
              <strong>{campaign.totalRecipients} affected employees</strong>.
            </p>
            <p className="mt-1 text-xs text-red-500 font-medium">
              ⚠ This action cannot be undone.
            </p>

            <div className="mt-4 bg-[#F2F1FB] rounded-lg p-3 space-y-1 text-xs text-gray-700">
              <div>
                <strong>Recipients:</strong> {campaign.totalRecipients}
              </div>
              <div>
                <strong>Subject:</strong> {campaign.emailSubject}
              </div>
              <div>
                <strong>Remedies:</strong>{" "}
                {campaign.recommendedRemedies?.length} items
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-xs font-medium text-[#2B245C] mb-1">
                Confirmation note (optional)
              </label>
              <textarea
                rows={2}
                placeholder="e.g. Reviewed and approved for sending..."
                value={confirmationNote}
                 onChange={(event) => setConfirmationNote(event.target.value)}
                disabled={sending}
                className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#2B245C]"
              />
            </div>

            <div className="mt-5 flex justify-end gap-3">
              <button
                onClick={() => setSendModalOpen(false)}
                disabled={sending}
                className="px-4 py-2 rounded-md text-sm font-medium border border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSend}
                disabled={sending}
                className="px-5 py-2 rounded-md text-sm font-semibold bg-[#2B245C] text-[#F2F1FB] shadow hover:bg-[#050038] transition disabled:opacity-60"
              >
                {sending ? "Sending..." : "✅ Confirm & Send"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CAMPAIGN MODAL */}
      {deleteConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => !deleting && setDeleteConfirmOpen(false)}
          />
          <div className="relative w-full max-w-md bg-white rounded-lg shadow-xl p-6 z-10">
            <h3 className="text-lg font-semibold text-red-600">
              🗑 Delete Campaign
            </h3>
            <p className="mt-2 text-sm text-gray-700">
              This will delete this campaign and all its recipients.
            </p>
            <p className="mt-1 text-xs text-red-500 font-medium">
              ⚠ You cannot undo this from the tab.
            </p>
            <p className="mt-3 text-xs text-gray-500">
              Audit logs and history record will be preserved for compliance
              (7-year retention).
            </p>

            <div className="mt-5 flex justify-end gap-3">
              <button
                onClick={() => setDeleteConfirmOpen(false)}
                disabled={deleting}
                className="px-4 py-2 rounded-md text-sm font-medium border border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteCampaign}
                disabled={deleting}
                className="px-5 py-2 rounded-md text-sm font-semibold bg-red-600 text-white shadow hover:bg-red-700 transition disabled:opacity-60"
              >
                {deleting ? "Deleting..." : "Delete Campaign"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PREVIEW MODAL */}
      {previewModalOpen && previewData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setPreviewModalOpen(false)}
          />
          <div className="relative w-full max-w-2xl bg-white rounded-lg shadow-xl z-10 flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between px-5 py-3 bg-[#F2F1FB] rounded-t-lg border-b border-gray-200">
              <h3 className="text-sm font-semibold text-[#2B245C]">
                Email Preview — {previewData.renderedFor?.email}
              </h3>
              <button
                onClick={() => setPreviewModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 text-xl leading-none"
              >
                ✕
              </button>
            </div>

            <div className="p-4 border-b text-xs text-gray-600 space-y-1">
              <div>
                <strong>Subject:</strong> {previewData.subject}
              </div>
              <div>
                <strong>To:</strong> {previewData.renderedFor?.email}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              <div
                className="text-xs"
                dangerouslySetInnerHTML={{ __html: previewData.bodyHtml }}
              />
            </div>

            <div className="px-5 py-3 border-t flex justify-end">
              <button
                onClick={() => setPreviewModalOpen(false)}
                className="px-4 py-2 rounded-md text-sm font-medium bg-[#2B245C] text-[#F2F1FB] hover:bg-[#050038] transition"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

// ── Status pill helper ────────────────────────────────────────────────────────
function StatusPill({ status }) {
  const map = {
    PENDING: "bg-gray-100 text-gray-600",
    SENT: "bg-blue-100 text-blue-700",
    DELIVERED: "bg-green-100 text-green-700",
    OPENED: "bg-purple-100 text-purple-700",
    BOUNCED: "bg-red-100 text-red-700",
    COMPLAINED: "bg-orange-100 text-orange-700",
    FAILED: "bg-red-200 text-red-800",
  };
  return (
    <span
      className={`px-2 py-0.5 rounded-full text-xs font-medium ${
        map[status] || "bg-gray-100 text-gray-600"
      }`}
    >
      {status}
    </span>
  );
}