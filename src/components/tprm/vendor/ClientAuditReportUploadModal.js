import { useState } from "react";
import {
  uploadClientAuditReport,
  checkS3NewClientFiles,
  syncClientEvidence,
  cleanupOrphanedClientChunks,
} from "../../../services/tprm/vendor/clientAuditReportApi";
import { toast } from "react-toastify";

const DOC_TYPES = [
  { value: "TYPE_I", label: "SOC 1 Type I" },
  { value: "TYPE_II", label: "SOC 1 Type II" },
  { value: "BRIDGE_LETTER", label: "Bridge Letter" },
  { value: "OTHER", label: "Other" },
];

const ACCEPTED_EXTENSIONS = [".pdf", ".doc", ".docx"];
const ACCEPTED_MIME_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

const MAX_UPLOAD_GB = 1;
const MAX_UPLOAD_BYTES = MAX_UPLOAD_GB * 1024 * 1024 * 1024;

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

const isAllowedFile = (f) => {
  if (!f) return false;
  const nameOk = ACCEPTED_EXTENSIONS.some((ext) =>
    f.name?.toLowerCase().endsWith(ext)
  );
  const mimeOk = ACCEPTED_MIME_TYPES.includes(f.type);
  return nameOk || mimeOk;
};

export default function ClientAuditReportUploadModal({
  isOpen,
  onClose,
  clientId,
  onSuccess,
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const [file, setFile] = useState(null);
  const [docType, setDocType] = useState("OTHER");
  const [issuedAt, setIssuedAt] = useState("");
  const [reportPeriodStart, setReportPeriodStart] = useState("");
  const [reportPeriodEnd, setReportPeriodEnd] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [notes, setNotes] = useState("");

  if (!isOpen) return null;

  const resetForm = () => {
    setFile(null);
    setDocType("OTHER");
    setIssuedAt("");
    setReportPeriodStart("");
    setReportPeriodEnd("");
    setExpiresAt("");
    setNotes("");
    setError("");
  };

  const handleUpload = async (e) => {
    e.preventDefault();

    if (!clientId) {
      setError("Client ID missing.");
      return;
    }

    if (!file) {
      setError("Attach a report file before uploading.");
      return;
    }

    setUploading(true);
    setError("");

    try {
      // ✅ Vendor-style log
      console.log(
        `[Client Modal] Triggering uploadClientAuditReport for client: ${clientId}`
      );

      await uploadClientAuditReport(clientId, {
        file,
        docType,
        reportPeriodStart: reportPeriodStart || undefined,
        reportPeriodEnd: reportPeriodEnd || undefined,
        issuedAt: issuedAt || undefined,
        expiresAt: expiresAt || undefined,
        notes: notes || undefined,
      });

      onSuccess && onSuccess("Report uploaded successfully.");
      resetForm();
      onClose();

      // ✅ EXACT vendor usage: background evidence processing (do not await)
      (async () => {
        try {
          console.log(`[Client Modal] Background sync starting for ${clientId}`);
          await checkS3NewClientFiles(clientId);
          await syncClientEvidence(clientId);
          await cleanupOrphanedClientChunks(clientId);
          console.log(
            `[Client Modal] Background sync completed for ${clientId}`
          );
        } catch (syncErr) {
          console.error(
            "[Client Modal] Background evidence processing failed:",
            syncErr
          );
        }
      })();
    } catch (err) {
      const statusCode = err?.response?.status;
      if (statusCode === 413) {
        setError("Server rejected the upload (413: Payload Too Large).");
      } else {
        setError(err?.response?.data?.message || "Upload failed.");
      }
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-900/60 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-2xl rounded-[1.5rem] bg-white shadow-2xl transition-all">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-8 pt-8 pb-4">
          <h3 className="text-2xl font-bold text-slate-900">
            Upload New Report
          </h3>
          <button
            onClick={() => {
              resetForm();
              onClose();
            }}
            className="rounded-lg border border-slate-200 bg-white px-4 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-50 transition"
          >
            Close
          </button>
        </div>

        {error && (
          <div className="mx-8 mb-4 rounded-xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-800">
            {error}
          </div>
        )}

        <form className="px-8 pb-8 space-y-6" onSubmit={handleUpload}>
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-slate-700">
              Report file *
            </label>

            <label className="flex cursor-pointer items-center justify-between rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-3.5 text-sm text-slate-700 transition hover:border-slate-400">
              <div className="flex flex-col">
                <span className="font-bold text-slate-900">
                  {file ? file.name : "Drop a file or browse"}
                </span>
                <span className="text-xs text-slate-500 mt-0.5">
                  {ACCEPTED_EXTENSIONS.join(", ").toUpperCase()}
                  {file ? ` • Size: ${formatBytes(file.size)}` : ""}
                </span>
              </div>

              <span className="rounded-lg bg-[#2B245C] px-3 py-1.5 text-xs font-bold text-white shadow-sm">
                Choose file
              </span>

              <input
                type="file"
                accept={ACCEPTED_EXTENSIONS.join(",")}
                className="hidden"
                onChange={(e) => {
                  const selected = e.target.files?.[0] || null;
                  if (
                    selected &&
                    isAllowedFile(selected) &&
                    selected.size <= MAX_UPLOAD_BYTES
                  ) {
                    setFile(selected);
                    setError("");
                  } else if (selected) {
                    setError("Invalid file or file too large.");
                  }
                }}
              />
            </label>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-700">
                Document type *
              </label>
              <select
                value={docType}
                onChange={(e) => setDocType(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 focus:border-slate-400 focus:outline-none transition-colors"
              >
                {DOC_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-700">
                Issued on
              </label>
              <input
                type="date"
                value={issuedAt}
                onChange={(e) => setIssuedAt(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 focus:border-slate-400 focus:outline-none transition-colors"
              />
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-700">
                Period start
              </label>
              <input
                type="date"
                value={reportPeriodStart}
                onChange={(e) => setReportPeriodStart(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 focus:border-slate-400 focus:outline-none transition-colors"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-700">
                Period end
              </label>
              <input
                type="date"
                value={reportPeriodEnd}
                onChange={(e) => setReportPeriodEnd(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 focus:border-slate-400 focus:outline-none transition-colors"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-slate-700">
              Expires on (optional)
            </label>
            <input
              type="date"
              value={expiresAt}
              onChange={(e) => setExpiresAt(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 focus:border-slate-400 focus:outline-none transition-colors"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-slate-700">
              Notes / Context
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="Provide a human-readable description or context..."
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 focus:border-slate-400 focus:outline-none transition-colors resize-none shadow-sm"
            />
          </div>

          {/* Modal Footer */}
          <div className="flex items-center gap-3 pt-4">
            <button
              type="submit"
              disabled={uploading}
              className="inline-flex items-center justify-center rounded-xl bg-[#2B245C] px-8 py-2.5 text-sm font-bold text-white shadow-lg transition hover:bg-[#1F1A48] disabled:opacity-60"
            >
              {uploading ? "Uploading..." : "Upload Report"}
            </button>

            <button
              type="button"
              onClick={() => {
                resetForm();
                onClose();
              }}
              className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-8 py-2.5 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}