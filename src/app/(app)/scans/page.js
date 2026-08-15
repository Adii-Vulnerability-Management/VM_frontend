"use client";

import { useEffect, useState } from "react";
import { RefreshCw, Play, Upload } from "lucide-react";
import Topbar from "@/components/Topbar";
import { Badge, Button, Card, EmptyState, ErrorBanner, Label, Modal, Select, Spinner } from "@/components/ui";
import { getAssetScanners, listAssets, listScans, runScan, uploadScanReport } from "@/lib/vm";
import { apiErrorMessage } from "@/lib/api";

const STATUS_BADGE = {
  queued: "bg-slate-100 text-slate-600 border-slate-200",
  running: "bg-blue-100 text-blue-700 border-blue-200",
  completed: "bg-emerald-100 text-emerald-700 border-emerald-200",
  failed: "bg-red-100 text-red-700 border-red-200",
  cancelled: "bg-slate-100 text-slate-500 border-slate-200",
};

export default function ScansPage() {
  const [targets, setTargets] = useState([]);
  const [scans, setScans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedTarget, setSelectedTarget] = useState("");
  const [scannerOptions, setScannerOptions] = useState([]);
  const [selectedScanner, setSelectedScanner] = useState("");
  const [running, setRunning] = useState(false);

  const [uploadOpen, setUploadOpen] = useState(false);
  const [uploadScanner, setUploadScanner] = useState("");
  const [uploadTarget, setUploadTarget] = useState("");
  const [uploadFile, setUploadFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const [t, s] = await Promise.all([listAssets({ isActive: true }), listScans()]);
      setTargets(Array.isArray(t) ? t : []);
      setScans(Array.isArray(s) ? s : []);
    } catch (err) {
      setError(apiErrorMessage(err, "Failed to load scans."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    if (!selectedTarget) {
      setScannerOptions([]);
      setSelectedScanner("");
      return;
    }
    getAssetScanners(selectedTarget)
      .then((res) => {
        setScannerOptions(res.scanners || []);
        setSelectedScanner(res.defaultScanner || res.scanners?.[0] || "");
      })
      .catch(() => {
        setScannerOptions([]);
        setSelectedScanner("");
      });
  }, [selectedTarget]);

  const handleRun = async () => {
    if (!selectedTarget || !selectedScanner) return;
    setRunning(true);
    setError("");
    try {
      await runScan({ assetId: selectedTarget, scanner: selectedScanner });
      await load();
    } catch (err) {
      setError(apiErrorMessage(err, "Could not start scan."));
    } finally {
      setRunning(false);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    setUploadError("");
    if (!uploadFile || !uploadScanner) {
      setUploadError("Choose a scanner and a report file.");
      return;
    }
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", uploadFile);
      fd.append("scanner", uploadScanner);
      if (uploadTarget) fd.append("assetId", uploadTarget);
      await uploadScanReport(fd);
      setUploadOpen(false);
      setUploadFile(null);
      load();
    } catch (err) {
      setUploadError(apiErrorMessage(err, "Could not upload report."));
    } finally {
      setUploading(false);
    }
  };

  return (
    <>
      <Topbar
        title="Vulnerability Scans"
        subtitle="Choose a registered target and a compatible scanner, or upload an existing report."
        actions={
          <div className="flex items-center gap-2">
            <Button variant="secondary" onClick={() => setUploadOpen(true)}>
              <Upload size={15} />
              Upload report
            </Button>
            <Button variant="secondary" onClick={load} disabled={loading}>
              <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
              Refresh
            </Button>
          </div>
        }
      />

      <div className="p-8">
        <ErrorBanner message={error} />

        <Card className="mb-6 p-6">
          <h3 className="mb-1 text-base font-semibold text-slate-900">Run scanner</h3>
          <p className="mb-4 text-sm text-slate-500">The scanner list updates based on the selected target.</p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-[1fr_1fr_auto]">
            <div>
              <Label>Scan target</Label>
              <Select value={selectedTarget} onChange={(e) => setSelectedTarget(e.target.value)} className="w-full">
                <option value="">Select target</option>
                {targets.map((t) => (
                  <option key={t._id} value={t._id}>
                    {t.name}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Label>Compatible scanner</Label>
              <Select
                className="w-full"
                value={selectedScanner}
                onChange={(e) => setSelectedScanner(e.target.value)}
                disabled={!selectedTarget}
              >
                <option value="">Select scanner</option>
                {scannerOptions.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </Select>
            </div>
            <div className="flex items-end">
              <Button onClick={handleRun} disabled={!selectedTarget || !selectedScanner || running} className="w-full sm:w-auto">
                <Play size={15} />
                {running ? "Starting…" : "Run scan"}
              </Button>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="mb-4 text-base font-semibold text-slate-900">Scan history</h3>
          {loading ? (
            <div className="flex justify-center py-16">
              <Spinner className="h-6 w-6 text-slate-400" />
            </div>
          ) : scans.length === 0 ? (
            <EmptyState title="No scans yet" subtitle="Run a scanner above or upload a report to get started." />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500">
                    <th className="py-2 pr-4">Scanner</th>
                    <th className="py-2 pr-4">Target</th>
                    <th className="py-2 pr-4">Status</th>
                    <th className="py-2 pr-4">Progress</th>
                    <th className="py-2 pr-4">Started</th>
                  </tr>
                </thead>
                <tbody>
                  {scans.map((s) => (
                    <tr key={s._id} className="border-b border-slate-100 last:border-0">
                      <td className="py-3 pr-4 font-medium text-slate-900">{s.scanner}</td>
                      <td className="py-3 pr-4 text-slate-700">{s.target || s.targetUrl || s.targetHost || "—"}</td>
                      <td className="py-3 pr-4">
                        <Badge className={STATUS_BADGE[s.status] || STATUS_BADGE.queued}>{s.status}</Badge>
                      </td>
                      <td className="py-3 pr-4 text-slate-700">{s.progress ?? 0}%</td>
                      <td className="py-3 pr-4 text-slate-500">
                        {s.createdAt ? new Date(s.createdAt).toLocaleString() : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>

      <Modal open={uploadOpen} onClose={() => setUploadOpen(false)} title="Upload scan report">
        <form onSubmit={handleUpload} className="space-y-4">
          <ErrorBanner message={uploadError} />
          <div>
            <Label>Target (optional)</Label>
            <Select value={uploadTarget} onChange={(e) => setUploadTarget(e.target.value)} className="w-full">
              <option value="">No linked target</option>
              {targets.map((t) => (
                <option key={t._id} value={t._id}>
                  {t.name}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label>Scanner</Label>
            <Select value={uploadScanner} onChange={(e) => setUploadScanner(e.target.value)} className="w-full">
              <option value="">Select scanner</option>
              {["npm_audit", "osv", "semgrep", "gitleaks", "trivy_fs", "trivy_iac", "trivy_image", "dependency_check", "zap_baseline", "nmap"].map(
                (s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                )
              )}
            </Select>
          </div>
          <div>
            <Label>Report file (.json or .xml)</Label>
            <input
              type="file"
              accept=".json,.xml"
              onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700"
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={() => setUploadOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={uploading}>
              {uploading ? "Uploading…" : "Upload"}
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
