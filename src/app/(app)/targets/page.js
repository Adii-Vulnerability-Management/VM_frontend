"use client";

import { useEffect, useMemo, useState } from "react";
import { Plus, RefreshCw, Archive, ArchiveRestore, Search } from "lucide-react";
import Topbar from "@/components/Topbar";
import { Badge, Button, Card, EmptyState, ErrorBanner, Input, Label, Modal, Select, Spinner } from "@/components/ui";
import {
  ASSET_TYPES,
  ASSET_TYPE_REQUIRED_FIELDS,
  CRITICALITY_LEVELS,
  ENVIRONMENTS,
  archiveAsset,
  createAsset,
  listAssets,
  restoreAsset,
} from "@/lib/vm";
import { apiErrorMessage } from "@/lib/api";

const CRITICALITY_BADGE = {
  low: "bg-slate-100 text-slate-600 border-slate-200",
  medium: "bg-amber-100 text-amber-700 border-amber-200",
  high: "bg-orange-100 text-orange-700 border-orange-200",
  critical: "bg-red-100 text-red-700 border-red-200",
};

function emptyForm() {
  return {
    name: "",
    assetType: "git_repository",
    environment: "production",
    criticality: "medium",
    ownerTeam: "",
    gitToken: "",
    extra: {},
  };
}

export default function TargetsPage() {
  const [targets, setTargets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [stateFilter, setStateFilter] = useState("active");

  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(emptyForm());
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const params = {};
      if (typeFilter) params.assetType = typeFilter;
      if (stateFilter !== "all") params.isActive = stateFilter === "active";
      if (search.trim()) params.search = search.trim();
      const data = await listAssets(params);
      setTargets(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(apiErrorMessage(err, "Failed to load scan targets."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [typeFilter, stateFilter]);

  const openCreate = () => {
    setForm(emptyForm());
    setFormError("");
    setModalOpen(true);
  };

  const requiredFields = ASSET_TYPE_REQUIRED_FIELDS[form.assetType] || [];

  const handleSave = async (e) => {
    e.preventDefault();
    setFormError("");
    if (!form.name.trim()) {
      setFormError("Name is required.");
      return;
    }
    for (const f of requiredFields) {
      if (!form.extra[f.name]?.trim()) {
        setFormError(`${f.label} is required for this target type.`);
        return;
      }
    }
    setSaving(true);
    try {
      await createAsset({
        name: form.name.trim(),
        assetType: form.assetType,
        environment: form.environment,
        criticality: form.criticality,
        ownerTeam: form.ownerTeam || undefined,
        gitToken: form.gitToken.trim() || undefined,
        ...form.extra,
      });
      setModalOpen(false);
      load();
    } catch (err) {
      setFormError(apiErrorMessage(err, "Could not create scan target."));
    } finally {
      setSaving(false);
    }
  };

  const toggleArchive = async (target) => {
    try {
      if (target.isActive) await archiveAsset(target._id);
      else await restoreAsset(target._id);
      load();
    } catch (err) {
      setError(apiErrorMessage(err, "Could not update scan target status."));
    }
  };

  const filtered = useMemo(() => targets, [targets]);

  return (
    <>
      <Topbar
        title="Scan Targets"
        subtitle="Register Git, Docker, Kubernetes, web, API, host, and cloud targets to scan."
        actions={
          <div className="flex items-center gap-2">
            <Button variant="secondary" onClick={load} disabled={loading}>
              <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
              Refresh
            </Button>
            <Button onClick={openCreate}>
              <Plus size={16} />
              Add target
            </Button>
          </div>
        }
      />

      <div className="p-8">
        <ErrorBanner message={error} />

        <Card className="p-5">
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <div className="relative min-w-[220px] flex-1">
              <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <Input
                placeholder="Search targets…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && load()}
                className="pl-9"
              />
            </div>
            <Select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="w-48">
              <option value="">All types</option>
              {ASSET_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </Select>
            <Select value={stateFilter} onChange={(e) => setStateFilter(e.target.value)} className="w-40">
              <option value="active">Active</option>
              <option value="archived">Archived</option>
              <option value="all">All states</option>
            </Select>
          </div>

          {loading ? (
            <div className="flex justify-center py-16">
              <Spinner className="h-6 w-6 text-slate-400" />
            </div>
          ) : filtered.length === 0 ? (
            <EmptyState title="No scan targets yet" subtitle="Add a target to start scanning." />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500">
                    <th className="py-2 pr-4">Name</th>
                    <th className="py-2 pr-4">Type</th>
                    <th className="py-2 pr-4">Environment</th>
                    <th className="py-2 pr-4">Criticality</th>
                    <th className="py-2 pr-4">State</th>
                    <th className="py-2 pr-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((t) => (
                    <tr key={t._id} className="border-b border-slate-100 last:border-0">
                      <td className="py-3 pr-4">
                        <p className="font-medium text-slate-900">{t.name}</p>
                        <p className="text-xs text-slate-500">{t.provider || t.sourceType || ""}</p>
                      </td>
                      <td className="py-3 pr-4 capitalize text-slate-700">{(t.assetType || "").replace(/_/g, " ")}</td>
                      <td className="py-3 pr-4 capitalize text-slate-700">{t.environment || "—"}</td>
                      <td className="py-3 pr-4">
                        <Badge className={CRITICALITY_BADGE[t.criticality] || CRITICALITY_BADGE.medium}>
                          {t.criticality || "medium"}
                        </Badge>
                      </td>
                      <td className="py-3 pr-4">
                        <Badge
                          className={
                            t.isActive
                              ? "border-emerald-200 bg-emerald-100 text-emerald-700"
                              : "border-slate-200 bg-slate-100 text-slate-600"
                          }
                        >
                          {t.isActive ? "Active" : "Archived"}
                        </Badge>
                      </td>
                      <td className="py-3 pr-4">
                        <button
                          onClick={() => toggleArchive(t)}
                          className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-800"
                        >
                          {t.isActive ? <Archive size={13} /> : <ArchiveRestore size={13} />}
                          {t.isActive ? "Archive" : "Restore"}
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

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Add scan target" width="max-w-xl">
        <form onSubmit={handleSave} className="space-y-4">
          <ErrorBanner message={formError} />

          <div>
            <Label>Name</Label>
            <Input className="w-full"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="payments-api-prod"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Target type</Label>
              <Select className="w-full"
                value={form.assetType}
                onChange={(e) => setForm((f) => ({ ...f, assetType: e.target.value, extra: {} }))}
              >
                {ASSET_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Label>Environment</Label>
              <Select className="w-full" value={form.environment} onChange={(e) => setForm((f) => ({ ...f, environment: e.target.value }))}>
                {ENVIRONMENTS.map((e) => (
                  <option key={e} value={e}>
                    {e}
                  </option>
                ))}
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Criticality</Label>
              <Select className="w-full" value={form.criticality} onChange={(e) => setForm((f) => ({ ...f, criticality: e.target.value }))}>
                {CRITICALITY_LEVELS.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Label>Owner team (optional)</Label>
              <Input className="w-full"
                value={form.ownerTeam}
                onChange={(e) => setForm((f) => ({ ...f, ownerTeam: e.target.value }))}
                placeholder="platform-security"
              />
            </div>
          </div>

          {requiredFields.length > 0 && (
            <div className="space-y-4 rounded-lg border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Required for {ASSET_TYPES.find((t) => t.value === form.assetType)?.label}
              </p>
              {requiredFields.map((f) => (
                <div key={f.name}>
                  <Label>{f.label}</Label>
                  <Input className="w-full"
                    value={form.extra[f.name] || ""}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, extra: { ...prev.extra, [f.name]: e.target.value } }))
                    }
                    placeholder={f.placeholder}
                  />
                </div>
              ))}
            </div>
          )}

          {form.assetType === "git_repository" && (
            <div>
              <Label>Git token (optional, for private repos)</Label>
              <Input
                className="w-full"
                type="password"
                value={form.gitToken}
                onChange={(e) => setForm((f) => ({ ...f, gitToken: e.target.value }))}
                placeholder="github_pat_..."
              />
            </div>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? "Saving…" : "Add target"}
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
