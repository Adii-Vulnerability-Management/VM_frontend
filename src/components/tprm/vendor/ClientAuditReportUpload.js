import { useEffect, useState } from "react";
import {
  deleteClientAuditReport,
  getClientAuditReportDownloadUrl,
  getClientAuditReports,
  checkS3DeletedClientFiles,
  syncClientEvidence,
  cleanupOrphanedClientChunks,
} from "../../../services/tprm/vendor/clientAuditReportApi";
import ClientAuditReportUploadModal from "./ClientAuditReportUploadModal";
import ConfirmDeleteModal from "@/components/ConfirmDeleteModal";
import { toast } from "react-toastify";

const badgeTone = {
  success: "bg-emerald-50 text-emerald-700 border border-emerald-100",
  warning: "bg-amber-50 text-amber-700 border border-amber-100",
  danger: "bg-rose-50 text-rose-700 border border-rose-100",
  muted: "bg-blue-50 text-slate-700 border border-blue-100",
};

const MS_IN_DAY = 1000 * 60 * 60 * 24;

const formatBytes = (bytes) => {
  if (bytes === undefined || bytes === null) return "-";
  if (bytes < 1024) return `${bytes} B`;
  const units = ["KB", "MB", "GB", "TB"];
  let size = bytes / 1024;
  let unitIndex = 0;
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex += 1;
  }
  const precision = size >= 10 ? 0 : 1;
  return `${size.toFixed(precision)} ${units[unitIndex]}`;
};

const formatDate = (value) => {
  if (!value) return "-";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "-";
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const formatDateTime = (value) => {
  if (!value) return "-";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "-";
  return d.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
};

export default function ClientAuditReportUpload({ clientId }) {
  const normalizedClientId =
    typeof clientId === "string"
      ? clientId.trim()
      : clientId
        ? String(clientId)
        : "";

  const safeClientId =
    normalizedClientId &&
    normalizedClientId.toLowerCase() !== "null" &&
    normalizedClientId.toLowerCase() !== "undefined"
      ? normalizedClientId
      : "";

  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [pendingDelete, setPendingDelete] = useState({
    docId: null,
    hardDelete: false,
  });
  const loadDocs = async () => {
    if (!safeClientId) return;

    setLoading(true);
    setError("");
    try {
      const data = await getClientAuditReports(safeClientId);
      setDocs(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          "Could not load audit reports. Please refresh and try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (safeClientId) loadDocs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [safeClientId]);

  // 1) open modal
  const openDeleteConfirm = (docId, hardDelete) => {
    setPendingDelete({ docId, hardDelete });
    setConfirmOpen(true);
  };

  // 2) actually delete when user confirms

const confirmDelete = async () => {
  const { docId, hardDelete } = pendingDelete;
  if (!docId) return;

  setDeleteLoading(true);

  try {
    // ✅ correct function + correct id
    await deleteClientAuditReport(safeClientId, docId, hardDelete);

    toast.success(
      hardDelete
        ? "Report deleted permanently."
        : "Report removed (soft delete)."
    );

    await loadDocs();

    if (hardDelete) {
      // ✅ correct client background sync
      (async () => {
        try {
          await checkS3DeletedClientFiles(safeClientId);
          await syncClientEvidence(safeClientId);
          await cleanupOrphanedClientChunks(safeClientId);
        } catch (e) {
          console.error("Client background sync failed:", e);
        }
      })();
    }
  } catch (err) {
    toast.error(err?.response?.data?.message || "Delete failed. Try again.");
  } finally {
    setDeleteLoading(false);
    setConfirmOpen(false);
    setPendingDelete({ docId: null, hardDelete: false });
  }
};
  const expiryStatus = (expiresAtValue) => {
    if (!expiresAtValue) return { label: "No expiry", tone: badgeTone.muted };

    const ms = new Date(expiresAtValue).getTime();
    if (Number.isNaN(ms)) return { label: "No expiry", tone: badgeTone.muted };

    const days = Math.round((ms - Date.now()) / MS_IN_DAY);
    if (days < 0) return { label: "Expired", tone: badgeTone.danger };
    if (days <= 30)
      return { label: `Expires in ${days}d`, tone: badgeTone.warning };

    return {
      label: `Active until ${formatDate(expiresAtValue)}`,
      tone: badgeTone.success,
    };
  };

  const docTypeLabel = (value) => {
    const labels = {
      TYPE_I: "SOC 1 Type I",
      TYPE_II: "SOC 1 Type II",
      BRIDGE_LETTER: "Bridge Letter",
      OTHER: "Other",
    };
    return labels[value] || value || "Unspecified";
  };

  const periodLabel = (start, end) => {
    if (!start && !end) return "Period not provided";
    if (start && end) return `${formatDate(start)} to ${formatDate(end)}`;
    if (start && !end) return `${formatDate(start)} to -`;
    return `- to ${formatDate(end)}`;
  };

  if (!safeClientId) {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
        Client information is missing.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="rounded-xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-800">
          {error}
        </div>
      )}

      {success && (
        <div className="rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          {success}
        </div>
      )}

      <div className="flex flex-col gap-6">
        <section className="rounded-2xl border border-[#2B245C] bg-white p-6 shadow-lg hover:shadow-2xl transition-shadow duration-300">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-7">
            <div>
              <h2 className="text-xl font-bold text-[#2B245C]">
                Uploaded reports
              </h2>
              <p className="text-xs text-slate-600">
                Track documents, expiry, and metadata.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={loadDocs}
                disabled={loading}
                className="rounded-lg border border-[#2B245C] bg-white px-5 py-2 text-sm font-medium text-[#2B245C] hover:bg-indigo-50 transition-all"
              >
                {loading ? "Refreshing..." : "Refresh"}
              </button>

              <button
                type="button"
                onClick={() => setIsModalOpen(true)}
                className="rounded-lg bg-[#2B245C] border border-[#2B245C] px-5 py-2 text-sm font-semibold text-white shadow-md hover:shadow-lg hover:bg-opacity-90 disabled:opacity-60 transition-all"
              >
                + New Report
              </button>
            </div>
          </div>

          <div className="overflow-x-auto rounded-lg border border-gray-800">
            {loading && (
              <div className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-12 text-center text-sm text-slate-600">
                Loading reports...
              </div>
            )}

            {!loading && docs.length === 0 && (
              <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-12 text-center text-sm text-slate-600">
                No reports uploaded yet.
              </div>
            )}

            {!loading && docs.length > 0 && (
              <table className="min-w-full text-sm">
                <thead className="bg-[#2B245C] text-left text-white border-b border-gray-800">
                  <tr>
                    <th className="px-4 py-2 font-medium">File</th>
                    <th className="px-4 py-2 font-medium">Type</th>
                    <th className="px-4 py-2 font-medium">Period</th>
                    <th className="px-4 py-2 font-medium">Status</th>
                    <th className="px-4 py-2 font-medium">Size</th>
                    <th className="px-4 py-2 font-medium text-center">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">
                  {docs.map((doc) => {
                    const status = expiryStatus(doc.expiresAt);
                    return (
                      <tr
                        key={doc._id}
                        className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50 transition-colors"
                      >
                        <td className="px-4 py-3">
                          <div className="font-semibold text-slate-900 group cursor-pointer hover:text-blue-600">
                            {doc.originalName || "Audit report"}
                          </div>
                          <div className="text-xs text-slate-500 mt-0.5">
                            Uploaded {formatDateTime(doc.createdAt)}
                          </div>
                        </td>

                        <td className="px-4 py-3">
                          <span className="inline-flex items-center justify-center rounded-full bg-blue-50 px-4 py-1.5 text-[11px] font-bold text-slate-700 leading-tight text-center min-w-[90px] border border-blue-100 shadow-sm uppercase">
                            {docTypeLabel(doc.docType)
                              .split(" ")
                              .map((word, i) => (
                                <span key={i} className="block">
                                  {word}
                                </span>
                              ))}
                          </span>
                        </td>

                        <td className="px-4 py-3 text-xs text-slate-700">
                          <div className="font-medium">
                            {periodLabel(
                              doc.reportPeriodStart,
                              doc.reportPeriodEnd,
                            )}
                          </div>
                          <div className="text-slate-400 mt-0.5">
                            {doc.issuedAt
                              ? `Issued ${formatDate(doc.issuedAt)}`
                              : "No issue date"}
                          </div>
                        </td>

                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex items-center rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wider ${status.tone}`}
                          >
                            {status.label}
                          </span>
                        </td>

                        <td className="px-4 py-3 text-xs font-medium text-slate-500">
                          {formatBytes(doc.size)}
                        </td>

                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              title="Download"
                              className="px-2 py-1 rounded-lg border border-blue-200 bg-blue-50 text-[#2B245C] hover:bg-blue-100 shadow-sm transition"
                              onClick={() =>
                                getClientAuditReportDownloadUrl(
                                  safeClientId,
                                  doc._id,
                                  doc.originalName,
                                )
                              }
                            >
                              Download
                            </button>

                            <button
                              title="Soft delete"
                              onClick={() => openDeleteConfirm(doc._id, false)}
                              className="px-2 py-1 rounded-lg border border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100 shadow-sm transition"
                            >
                              Soft delete
                            </button>

                            <button
                              title="Hard delete"
                              onClick={() => openDeleteConfirm(doc._id, true)}
                              className="px-2 py-1 rounded-lg border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 shadow-sm transition"
                            >
                              Hard delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </section>
      </div>

      <ConfirmDeleteModal
        open={confirmOpen}
        loading={deleteLoading}
        title={
          pendingDelete.hardDelete
            ? "Hard delete report?"
            : "Soft delete report?"
        }
        message={
          pendingDelete.hardDelete
            ? "This will permanently delete the file from S3 and remove metadata. You cannot undo."
            : "This will hide the report (soft delete). You can undo only if backend supports restore."
        }
        confirmText={pendingDelete.hardDelete ? "Hard delete" : "Soft delete"}
        danger={true}
        onClose={() => {
          if (deleteLoading) return;
          setConfirmOpen(false);
          setPendingDelete({ docId: null, hardDelete: false });
        }}
        onConfirm={confirmDelete}
      />
      <ClientAuditReportUploadModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        clientId={safeClientId}
        onSuccess={(msg) => {
          setSuccess(msg);
          loadDocs();
          setTimeout(() => setSuccess(""), 5000);
        }}
      />
    </div>
  );
}
