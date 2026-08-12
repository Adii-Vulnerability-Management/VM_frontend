import { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import {
  checkS3DeletedFiles,
  cleanupOrphanedChunks,
  deleteAuditReport,
  getAuditEvidenceStatus,
  getAuditReportDownloadUrl,
  getAuditReports,
  ingestAuditEvidence,
  syncThirdPartyEvidence,
} from "../../../services/tprm/third-party/auditReportApi";
import ThirdPartyAuditReportUploadModal from "./ThirdPartyAuditReportUploadModal";

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
  return `${size.toFixed(size >= 10 ? 0 : 1)} ${units[unitIndex]}`;
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

export default function ThirdPartyAuditReportUpload({ thirdPartyId }) {
  const normalizedThirdPartyId =
    typeof thirdPartyId === "string"
      ? thirdPartyId.trim()
      : thirdPartyId
        ? String(thirdPartyId)
        : "";
  const safeThirdPartyId =
    normalizedThirdPartyId &&
    normalizedThirdPartyId.toLowerCase() !== "null" &&
    normalizedThirdPartyId.toLowerCase() !== "undefined"
      ? normalizedThirdPartyId
      : "";

  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [confirmModal, setConfirmModal] = useState({
    open: false,
    docId: null,
    hardDelete: false,
  });
  const missingIdToastShown = useRef(false);

  const loadDocs = async () => {
    if (!safeThirdPartyId) return;

    setLoading(true);
    try {
      const data = await getAuditReports(safeThirdPartyId);
      setDocs(Array.isArray(data) ? data : []);
    } catch (err) {
      toast.error(
        err?.response?.data?.message ||
          "Could not load audit reports. Please refresh and try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (safeThirdPartyId) loadDocs();
  }, [safeThirdPartyId]);

  useEffect(() => {
    if (safeThirdPartyId || missingIdToastShown.current) return;
    missingIdToastShown.current = true;
    toast.error("Third-party information is missing.");
  }, [safeThirdPartyId]);

  // const handleDelete = async (docId, hardDelete) => {
  //   const ok = window.confirm(
  //     hardDelete
  //       ? "Delete metadata and remove the file permanently?"
  //       : "Hide this document (soft delete)?",
  //   );
  //   if (!ok) return;

  //   try {
  //     await deleteAuditReport(safeThirdPartyId, docId, hardDelete);
  //     toast.success("Report removed.");
  //     await loadDocs();

  //     if (hardDelete) {
  //       (async () => {
  //         try {
  //           await checkS3DeletedFiles(safeThirdPartyId);
  //           await syncThirdPartyEvidence(safeThirdPartyId);
  //           await cleanupOrphanedChunks(safeThirdPartyId);
  //         } catch (syncErr) {
  //           console.error(
  //             "Background evidence processing failed:",
  //             syncErr,
  //           );
  //         }
  //       })();
  //     }
  //   } catch (err) {
  //     toast.error(err?.response?.data?.message || "Delete failed. Try again.");
  //   }
  // };

  const handleDelete = (docId, hardDelete) => {
    setConfirmModal({
      open: true,
      docId,
      hardDelete,
    });
  };

  const performDelete = async () => {
    try {
      await deleteAuditReport(
        safeThirdPartyId,
        confirmModal.docId,
        confirmModal.hardDelete,
      );

      toast.success("Report removed.");

      setConfirmModal({
        open: false,
        docId: null,
        hardDelete: false,
      });

      await loadDocs();

      if (confirmModal.hardDelete) {
        (async () => {
          try {
            await checkS3DeletedFiles(safeThirdPartyId);
            await syncThirdPartyEvidence(safeThirdPartyId);
            await ingestAuditEvidence(safeThirdPartyId);
            await getAuditEvidenceStatus(safeThirdPartyId);
            await cleanupOrphanedChunks(safeThirdPartyId);
          } catch (syncErr) {
            console.error("Background evidence processing failed:", syncErr);
          }
        })();
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || "Delete failed. Try again.");
    }
  };

  const expiryStatus = (expiresAtValue) => {
    if (!expiresAtValue) return { label: "No expiry", tone: badgeTone.muted };

    const ms = new Date(expiresAtValue).getTime();
    if (Number.isNaN(ms)) return { label: "No expiry", tone: badgeTone.muted };

    const days = Math.round((ms - Date.now()) / MS_IN_DAY);
    if (days < 0) return { label: "Expired", tone: badgeTone.danger };
    if (days <= 30) {
      return { label: `Expires in ${days}d`, tone: badgeTone.warning };
    }

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

  if (!safeThirdPartyId) {
    return null;
  }

  return (
    <div className="space-y-6">
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
                  <th className="px-4 py-2 font-medium text-center">Actions</th>
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
                            type="button"
                            title="Download"
                            className="px-2 py-1 rounded-lg border border-blue-200 bg-blue-50 text-[#2B245C] hover:bg-blue-100 shadow-sm transition"
                            onClick={() =>
                              getAuditReportDownloadUrl(
                                safeThirdPartyId,
                                doc._id,
                                doc.originalName,
                              )
                            }
                          >
                            Download
                          </button>
                          <button
                            type="button"
                            title="Soft delete"
                            onClick={() => handleDelete(doc._id, false)}
                            className="px-2 py-1 rounded-lg border border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100 shadow-sm transition"
                          >
                            Soft delete
                          </button>
                          <button
                            type="button"
                            title="Hard delete"
                            onClick={() => handleDelete(doc._id, true)}
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

      {confirmModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <h2 className="text-xl font-bold text-[#2B245C] mb-4">
              {confirmModal.hardDelete
                ? "Permanently Delete Report"
                : "Hide Report"}
            </h2>

            <p className="text-slate-600 mb-6">
              {confirmModal.hardDelete
                ? "This action permanently deletes the file and metadata. This cannot be undone."
                : "This report will be hidden from the list. Do you want to continue?"}
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={() =>
                  setConfirmModal({
                    open: false,
                    docId: null,
                    hardDelete: false,
                  })
                }
                className="rounded-lg border border-gray-300 px-4 py-2 hover:bg-gray-100"
              >
                Cancel
              </button>

              <button
                onClick={performDelete}
                className={`rounded-lg px-4 py-2 text-white ${
                  confirmModal.hardDelete
                    ? "bg-rose-600 hover:bg-rose-700"
                    : "bg-[#2B245C] hover:bg-[#3b3378]"
                }`}
              >
                {confirmModal.hardDelete ? "Delete Permanently" : "Hide Report"}
              </button>
            </div>
          </div>
        </div>
      )}

      <ThirdPartyAuditReportUploadModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        thirdPartyId={safeThirdPartyId}
        onSuccess={(msg) => {
          toast.success(msg);
          loadDocs();
        }}
      />
    </div>
  );
}
