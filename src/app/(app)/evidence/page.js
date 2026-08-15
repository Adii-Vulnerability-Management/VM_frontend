"use client";

import { useEffect, useState } from "react";
import { RefreshCw, Upload, FileText } from "lucide-react";
import Topbar from "@/components/Topbar";
import { Badge, Button, Card, EmptyState, ErrorBanner, Label, Select, Spinner } from "@/components/ui";
import { SEVERITY_COLORS, listEvidence, listFindings, uploadEvidence } from "@/lib/vm";
import { apiErrorMessage } from "@/lib/api";

export default function EvidencePage() {
  const [findings, setFindings] = useState([]);
  const [selectedFinding, setSelectedFinding] = useState("");
  const [evidence, setEvidence] = useState([]);
  const [loadingFindings, setLoadingFindings] = useState(true);
  const [loadingEvidence, setLoadingEvidence] = useState(false);
  const [error, setError] = useState("");

  const [file, setFile] = useState(null);
  const [note, setNote] = useState("");
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    setLoadingFindings(true);
    listFindings()
      .then((data) => setFindings(Array.isArray(data) ? data : data?.items || []))
      .catch((err) => setError(apiErrorMessage(err, "Failed to load findings.")))
      .finally(() => setLoadingFindings(false));
  }, []);

  const loadEvidence = async (findingId) => {
    if (!findingId) {
      setEvidence([]);
      return;
    }
    setLoadingEvidence(true);
    setError("");
    try {
      const data = await listEvidence(findingId);
      setEvidence(Array.isArray(data) ? data : data?.items || []);
    } catch (err) {
      setError(apiErrorMessage(err, "Failed to load evidence."));
    } finally {
      setLoadingEvidence(false);
    }
  };

  useEffect(() => {
    loadEvidence(selectedFinding);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedFinding]);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!selectedFinding || !file) {
      setError("Select a finding and a file to upload.");
      return;
    }
    setUploading(true);
    setError("");
    try {
      const fd = new FormData();
      fd.append("file", file);
      if (note) fd.append("note", note);
      await uploadEvidence(selectedFinding, fd);
      setFile(null);
      setNote("");
      loadEvidence(selectedFinding);
    } catch (err) {
      setError(apiErrorMessage(err, "Could not upload evidence."));
    } finally {
      setUploading(false);
    }
  };

  const currentFinding = findings.find((f) => f._id === selectedFinding);

  return (
    <>
      <Topbar
        title="Evidence"
        subtitle="Attach and review remediation evidence for a finding."
        actions={
          <Button variant="secondary" onClick={() => loadEvidence(selectedFinding)} disabled={loadingEvidence}>
            <RefreshCw size={15} className={loadingEvidence ? "animate-spin" : ""} />
            Refresh
          </Button>
        }
      />

      <div className="p-8">
        <ErrorBanner message={error} />

        <Card className="mb-6 p-6">
          <Label>Finding</Label>
          {loadingFindings ? (
            <Spinner className="h-4 w-4 text-slate-400" />
          ) : (
            <Select value={selectedFinding} onChange={(e) => setSelectedFinding(e.target.value)} className="w-full">
              <option value="">Select a finding</option>
              {findings.map((f) => (
                <option key={f._id} value={f._id}>
                  {f.title}
                </option>
              ))}
            </Select>
          )}
          {currentFinding && (
            <div className="mt-3">
              <Badge className={SEVERITY_COLORS[currentFinding.severity] || SEVERITY_COLORS.info}>
                {currentFinding.severity}
              </Badge>
            </div>
          )}
        </Card>

        {selectedFinding && (
          <>
            <Card className="mb-6 p-6">
              <h3 className="mb-4 text-base font-semibold text-slate-900">Upload evidence</h3>
              <form onSubmit={handleUpload} className="grid grid-cols-1 gap-4 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
                <div>
                  <Label>File</Label>
                  <input
                    type="file"
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700"
                  />
                </div>
                <div>
                  <Label>Note (optional)</Label>
                  <input
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Patch applied in PR #123"
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                  />
                </div>
                <Button type="submit" disabled={uploading}>
                  <Upload size={15} />
                  {uploading ? "Uploading…" : "Upload"}
                </Button>
              </form>
            </Card>

            <Card className="p-6">
              <h3 className="mb-4 text-base font-semibold text-slate-900">Attached evidence</h3>
              {loadingEvidence ? (
                <div className="flex justify-center py-12">
                  <Spinner className="h-6 w-6 text-slate-400" />
                </div>
              ) : evidence.length === 0 ? (
                <EmptyState title="No evidence attached yet" />
              ) : (
                <ul className="divide-y divide-slate-100">
                  {evidence.map((ev) => (
                    <li key={ev._id} className="flex items-center gap-3 py-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
                        <FileText size={16} />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-slate-900">{ev.fileName || ev.originalName || "Evidence file"}</p>
                        {ev.note ? <p className="text-xs text-slate-500">{ev.note}</p> : null}
                      </div>
                      <p className="text-xs text-slate-400">
                        {ev.createdAt ? new Date(ev.createdAt).toLocaleString() : ""}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          </>
        )}
      </div>
    </>
  );
}
