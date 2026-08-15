"use client";

import { useEffect, useState } from "react";
import { Plus, RefreshCw, Archive } from "lucide-react";
import Topbar from "@/components/Topbar";
import { Badge, Button, Card, EmptyState, ErrorBanner, Input, Label, Modal, Select, Spinner } from "@/components/ui";
import {
  FINDING_SEVERITIES,
  FINDING_STATUSES,
  FINDING_TYPES,
  SEVERITY_COLORS,
  STATUS_COLORS,
  createManualFinding,
  listAssets,
  listFindings,
  requestException,
  updateFindingStatus,
} from "@/lib/vm";
import { apiErrorMessage } from "@/lib/api";

function emptyForm() {
  return {
    assetId: "",
    title: "",
    severity: "medium",
    findingType: "configuration",
    description: "",
  };
}

export default function FindingsPage() {
  const [findings, setFindings] = useState([]);
  const [targets, setTargets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [severityFilter, setSeverityFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(emptyForm());
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  const [exceptionFor, setExceptionFor] = useState(null);
  const [exceptionReason, setExceptionReason] = useState("");
  const [exceptionExpiry, setExceptionExpiry] = useState("");
  const [exceptionError, setExceptionError] = useState("");
  const [exceptionSaving, setExceptionSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const params = {};
      if (severityFilter) params.severity = severityFilter;
      if (statusFilter) params.status = statusFilter;
      const [f, t] = await Promise.all([listFindings(params), listAssets({ isActive: true })]);
      setFindings(Array.isArray(f) ? f : f?.items || []);
      setTargets(Array.isArray(t) ? t : []);
    } catch (err) {
      setError(apiErrorMessage(err, "Failed to load findings."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [severityFilter, statusFilter]);

  const openCreate = () => {
    setForm(emptyForm());
    setFormError("");
    setModalOpen(true);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setFormError("");
    if (!form.title.trim()) {
      setFormError("Title is required.");
      return;
    }
    setSaving(true);
    try {
      await createManualFinding({
        assetId: form.assetId || undefined,
        title: form.title.trim(),
        severity: form.severity,
        findingType: form.findingType,
        description: form.description || undefined,
      });
      setModalOpen(false);
      load();
    } catch (err) {
      setFormError(apiErrorMessage(err, "Could not create finding."));
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange = async (finding, status) => {
    try {
      await updateFindingStatus(finding._id, { status });
      load();
    } catch (err) {
      setError(apiErrorMessage(err, "Could not update finding status."));
    }
  };

  const openException = (finding) => {
    setExceptionFor(finding);
    setExceptionReason("");
    setExceptionExpiry("");
    setExceptionError("");
  };

  const submitException = async (e) => {
    e.preventDefault();
    setExceptionError("");
    if (!exceptionReason.trim() || !exceptionExpiry) {
      setExceptionError("Reason and expiry date are required.");
      return;
    }
    setExceptionSaving(true);
    try {
      await requestException(exceptionFor._id, {
        reason: exceptionReason.trim(),
        expiryDate: new Date(exceptionExpiry).toISOString(),
      });
      setExceptionFor(null);
      load();
    } catch (err) {
      setExceptionError(apiErrorMessage(err, "Could not request exception."));
    } finally {
      setExceptionSaving(false);
    }
  };

  return (
    <>
      <Topbar
        title="Findings"
        subtitle="Triage vulnerabilities, update status, and request exceptions."
        actions={
          <div className="flex items-center gap-2">
            <Button variant="secondary" onClick={load} disabled={loading}>
              <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
              Refresh
            </Button>
            <Button onClick={openCreate}>
              <Plus size={16} />
              Create finding
            </Button>
          </div>
        }
      />

      <div className="p-8">
        <ErrorBanner message={error} />

        <Card className="p-5">
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <Select value={severityFilter} onChange={(e) => setSeverityFilter(e.target.value)} className="w-44">
              <option value="">All severities</option>
              {FINDING_SEVERITIES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </Select>
            <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-44">
              <option value="">All statuses</option>
              {FINDING_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s.replace(/_/g, " ")}
                </option>
              ))}
            </Select>
          </div>

          {loading ? (
            <div className="flex justify-center py-16">
              <Spinner className="h-6 w-6 text-slate-400" />
            </div>
          ) : findings.length === 0 ? (
            <EmptyState title="No findings match these filters" subtitle="Run a scan or create a manual finding." />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500">
                    <th className="py-2 pr-4">Title</th>
                    <th className="py-2 pr-4">Severity</th>
                    <th className="py-2 pr-4">Type</th>
                    <th className="py-2 pr-4">Status</th>
                    <th className="py-2 pr-4">Priority</th>
                    <th className="py-2 pr-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {findings.map((f) => (
                    <tr key={f._id} className="border-b border-slate-100 last:border-0">
                      <td className="max-w-xs py-3 pr-4">
                        <p className="font-medium text-slate-900">{f.title}</p>
                        <p className="truncate text-xs text-slate-500">{f.description}</p>
                      </td>
                      <td className="py-3 pr-4">
                        <Badge className={SEVERITY_COLORS[f.severity] || SEVERITY_COLORS.info}>{f.severity}</Badge>
                      </td>
                      <td className="py-3 pr-4 capitalize text-slate-700">{(f.findingType || "").replace(/_/g, " ")}</td>
                      <td className="py-3 pr-4">
                        <select
                          value={f.status}
                          onChange={(e) => handleStatusChange(f, e.target.value)}
                          className={`rounded-md border-0 px-2 py-1 text-xs font-medium capitalize ${
                            STATUS_COLORS[f.status] || STATUS_COLORS.open
                          }`}
                        >
                          {FINDING_STATUSES.map((s) => (
                            <option key={s} value={s}>
                              {s.replace(/_/g, " ")}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="py-3 pr-4 text-slate-700">{f.priority || "—"}</td>
                      <td className="py-3 pr-4">
                        <button
                          onClick={() => openException(f)}
                          className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-800"
                        >
                          <Archive size={13} />
                          Request exception
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Create manual finding">
        <form onSubmit={handleCreate} className="space-y-4">
          <ErrorBanner message={formError} />
          <div>
            <Label>Title</Label>
            <Input className="w-full"
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              placeholder="Hardcoded credentials in config file"
            />
          </div>
          <div>
            <Label>Related target (optional)</Label>
            <Select className="w-full" value={form.assetId} onChange={(e) => setForm((f) => ({ ...f, assetId: e.target.value }))}>
              <option value="">No linked target</option>
              {targets.map((t) => (
                <option key={t._id} value={t._id}>
                  {t.name}
                </option>
              ))}
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Severity</Label>
              <Select className="w-full" value={form.severity} onChange={(e) => setForm((f) => ({ ...f, severity: e.target.value }))}>
                {FINDING_SEVERITIES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Label>Finding type</Label>
              <Select className="w-full" value={form.findingType} onChange={(e) => setForm((f) => ({ ...f, findingType: e.target.value }))}>
                {FINDING_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t.replace(/_/g, " ")}
                  </option>
                ))}
              </Select>
            </div>
          </div>
          <div>
            <Label>Description (optional)</Label>
            <textarea
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              rows={3}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? "Creating…" : "Create finding"}
            </Button>
          </div>
        </form>
      </Modal>

      <Modal open={!!exceptionFor} onClose={() => setExceptionFor(null)} title="Request exception">
        <form onSubmit={submitException} className="space-y-4">
          <ErrorBanner message={exceptionError} />
          <p className="text-sm text-slate-600">
            For: <span className="font-medium text-slate-900">{exceptionFor?.title}</span>
          </p>
          <div>
            <Label>Reason</Label>
            <textarea
              value={exceptionReason}
              onChange={(e) => setExceptionReason(e.target.value)}
              rows={3}
              placeholder="Why is this exception needed?"
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
            />
          </div>
          <div>
            <Label>Expires on</Label>
            <Input className="w-full" type="date" value={exceptionExpiry} onChange={(e) => setExceptionExpiry(e.target.value)} />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={() => setExceptionFor(null)}>
              Cancel
            </Button>
            <Button type="submit" disabled={exceptionSaving}>
              {exceptionSaving ? "Submitting…" : "Submit request"}
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
