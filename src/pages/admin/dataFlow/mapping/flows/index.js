import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import CustomAxios from "@/globalcomponents/CustomAxios";
import { baseurl, initURL } from "@/config/config";
import DataFlowNav from "../../Nav";
import GuideButton from "@/components/Tour/GuideButton";
import Tour from "@/components/Tour/Tour";
import { can, guard } from "@/auth/auth-permissions";
import SelectBpa from "@/components/dataflow/SelectBpa";
import SelectSystemActivity from "@/components/dataflow/SelectSystemActivity";
import { toast } from "react-toastify";

function parseFromSearch(search = "") {
  const sp = new URLSearchParams(search);
  return {
    bpaId: sp.get("bpaId") || "",
    sourceSaId: sp.get("sourceSaId") || "",
    targetSaId: sp.get("targetSaId") || "",
    method: sp.get("method") || "",
    crossBorder: sp.get("crossBorder") || "",
  };
}

const FormField = ({ label, required = false, children, className = "" }) => (
  <div className={`flex flex-col ${className}`}>
    <label className="text-sm font-medium text-gray-700 mb-2">
      {label}
      {required && <span className="text-red-500 ml-1">*</span>}
    </label>
    {children}
  </div>
);

export default function FlowsPage() {
  const router = useRouter();
  const apiBase = `${baseurl}/${initURL}/dataflow/mapping/flows`;

  const canView = can("privacy.read");
  const canCreate = can("privacy.create");
  const canDelete = can("privacy.delete");

  // ---- Initialize filters from the real URL (works on ctrl/cmd+click, refresh) ----
  const EMPTY = {
    bpaId: "",
    sourceSaId: "",
    targetSaId: "",
    method: "",
    crossBorder: "",
  };

  // ---- create form (unchanged) ----
  const [form, setForm] = useState({
    // New: add BPA to the modal form so SAs can be filtered
    bpaId: "",
    sourceSaId: "",
    targetSaId: "",
    status: "proposed",
    method: "api",
    frequency: "ad_hoc",
    crossBorder: false,
    countriesFrom: "",
    countriesTo: "",
    safeguards: "",
    evidenceRefs: "",
    notes: "",
  });
  const [saving, setSaving] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [tourOpen, setTourOpen] = useState(false);
  // FIX: start with EMPTY on both server *and* first client paint
  const [filters, setFilters] = useState(EMPTY);
  // FIX: track mount so we can safely read window and attach router listeners
  const [mounted, setMounted] = useState(false);
  // Debounced copy so typing doesn't spam loads
  const DEBOUNCE_MS = 700;
  const [debouncedFilters, setDebouncedFilters] = useState(() => EMPTY);
  // ---- Data loading ----
  const [items, setItems] = useState([]);
  const [loadingList, setLoadingList] = useState(false);
  const [error, setError] = useState("");
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  // archive states
  const [archiveModalOpen, setArchiveModalOpen] = useState(false);
  const [flowToArchive, setFlowToArchive] = useState(null);

  // Prevent the first URL-sync from wiping queries
  const didFirstSync = useRef(false);
  // Skip the routeChangeComplete we trigger ourselves via router.replace
  const skipNextRouteEvent = useRef(false);

  useEffect(() => {
    setMounted(true);
    // once mounted, sync from the real URL (client-only)
    const initial = parseFromSearch(window.location.search);
    setFilters(initial);
    setDebouncedFilters(initial);
  }, []);

  // Keep filters in sync with route changes (back/forward, other navigations)
  useEffect(() => {
    if (!mounted) return; // FIX: don't attach during SSR/hydration
    const onRouteChangeComplete = (url) => {
      if (skipNextRouteEvent.current) {
        skipNextRouteEvent.current = false;
        return;
      }
      const qs = url.split("?")[1] || "";
      const next = parseFromSearch(`?${qs}`);
      // avoid loops
      if (JSON.stringify(next) !== JSON.stringify(filters)) {
        setFilters(next);
        setDebouncedFilters(next);
      }
    };

    router.events.on("routeChangeComplete", onRouteChangeComplete);
    return () => {
      router.events.off("routeChangeComplete", onRouteChangeComplete);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.events, mounted, filters]);

  // Debounce filters -> debouncedFilters
  useEffect(() => {
    const t = setTimeout(() => setDebouncedFilters(filters), DEBOUNCE_MS);
    return () => clearTimeout(t);
  }, [filters]);

  // Push filters to URL (no full reload), but guard first run and avoid no-op replaces
  useEffect(() => {
    if (!mounted) return; // FIX: wait until after mount
    if (!didFirstSync.current) {
      didFirstSync.current = true;
      return;
    }
    const nextQS = new URLSearchParams();
    Object.entries(debouncedFilters).forEach(([k, v]) => {
      if (v) nextQS.set(k, v);
    });
    const next = nextQS.toString();
    const current =
      typeof window !== "undefined" ? window.location.search.slice(1) : "";
    if (next === current) return;
    skipNextRouteEvent.current = true;
    router.replace(
      { pathname: router.pathname, query: Object.fromEntries(nextQS) },
      undefined,
      { shallow: true },
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedFilters, mounted]);

  // ---- Data loading ----
  async function load(curFilters = debouncedFilters) {
    setLoadingList(true);
    setError("");
    try {
      const qs = new URLSearchParams();
      if (curFilters.bpaId) qs.set("bpaId", curFilters.bpaId);
      if (curFilters.sourceSaId) qs.set("sourceSaId", curFilters.sourceSaId);
      if (curFilters.targetSaId) qs.set("targetSaId", curFilters.targetSaId);
      if (curFilters.method) qs.set("method", curFilters.method);
      if (curFilters.crossBorder) qs.set("crossBorder", curFilters.crossBorder);

      const url = qs.toString() ? `${apiBase}?${qs}` : apiBase;
      const res = await CustomAxios.get(url);
      setItems(res.data || []);
      setCurrentPage(1);
    } catch (e) {
      setError(
        e?.response?.data?.message || e.message || "Failed to load flows",
      );
    } finally {
      setLoadingList(false);
    }
  }

  useEffect(() => {
    if (!mounted) return; // FIX: don't fire on server
    load(debouncedFilters); /* eslint-disable-next-line */
  }, [
    mounted, // FIX
    debouncedFilters.bpaId,
    debouncedFilters.sourceSaId,
    debouncedFilters.targetSaId,
    debouncedFilters.method,
    debouncedFilters.crossBorder,
  ]);

  // ---- create form (unchanged) ----
  async function create(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const body = {
        // New: include bpaId if your API expects it; safe to send along
        // bpaId: form.bpaId || undefined,
        sourceSaId: form.sourceSaId,
        targetSaId: form.targetSaId,
        status: form.status,
        method: form.method,
        frequency: form.frequency,
        crossBorder: !!form.crossBorder,
        countriesFrom: form.countriesFrom
          ? form.countriesFrom
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean)
          : undefined,
        countriesTo: form.countriesTo
          ? form.countriesTo
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean)
          : undefined,
        safeguards: form.safeguards
          ? form.safeguards
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean)
          : undefined,
        evidenceRefs: form.evidenceRefs
          ? form.evidenceRefs
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean)
          : undefined,
        notes: form.notes || undefined,
      };
      await CustomAxios.post(apiBase, body);
      setForm({
        bpaId: "",
        sourceSaId: "",
        targetSaId: "",
        status: "proposed",
        method: "api",
        frequency: "ad_hoc",
        crossBorder: false,
        countriesFrom: "",
        countriesTo: "",
        safeguards: "",
        evidenceRefs: "",
        notes: "",
      });
      setModalOpen(false);
      load(); // will use debouncedFilters by default
    } finally {
      setSaving(false);
    }
  }

  // Archive
  async function archive(id) {
    await CustomAxios.delete(`${apiBase}/${id}`);
    toast.success("Flow archived successfully");
    load();
  }

  const confirmArchive = (flow) => {
    setFlowToArchive(flow);
    setArchiveModalOpen(true);
  };

  const handleArchiveConfirm = async () => {
    if (!flowToArchive) return;

    await archive(flowToArchive._id);

    setArchiveModalOpen(false);
    setFlowToArchive(null);
  };

  const closeArchiveModal = () => {
    setArchiveModalOpen(false);
    setFlowToArchive(null);
  };

  const statusTone = (s = "") => {
    const v = String(s).toLowerCase();
    if (/approved|active|ok|success/.test(v))
      return "border-emerald-200 bg-emerald-50 text-emerald-700";
    if (/proposed|pending|review/.test(v))
      return "border-amber-200 bg-amber-50 text-amber-700";
    if (/rejected|error|fail/.test(v))
      return "border-red-200 bg-red-50 text-red-700";
    return "border-gray-200 bg-gray-50 text-gray-700";
  };

  const steps = [
    {
      target: '[data-tour="flows-header"]',
      title: "Flows",
      content:
        "This page helps you manage and search data flows between system activities.",
      placement: "bottom",
    },
    {
      target: '[data-tour="flows-new-button"]',
      title: "New Flow",
      content: "Click here to create a new flow.",
      placement: "left",
    },
    {
      target: '[data-tour="flows-filters"]',
      title: "Filters",
      content:
        "Use these filters to search flows by BPA, source, target, method, and cross-border.",
      placement: "top",
    },
    {
      target: '[data-tour="flows-results"]',
      title: "Results Table",
      content:
        "This table shows all matching flows with source, target, method, safeguards, and status. Archive removes the flow from the system.",
      placement: "top",
    },
  ];

  // Pagination calculations
  const totalPages = Math.ceil(items.length / rowsPerPage);

  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;

  const currentRows = items.slice(indexOfFirstRow, indexOfLastRow);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <DataFlowNav />
      <div className="bg-white rounded-lg p-5 my-3 mx-5">
        {/* Header */}
        <div
          className="px-6 py-8 bg-[#2B245C] rounded-2xl shadow-lg hover:shadow-2xl transition-shadow duration-300"
          data-tour="flows-header"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-cyan-50">Flows (Edges)</h1>
              <p className="mt-1 text-sm text-white">
                Search and manage data transfers between system activities.
              </p>
            </div>

            <div className="flex items-center gap-3">
              {/* Help button */}
              <GuideButton
                onClick={() => setTourOpen(true)}
                variant="primary"
                size="md"
                className="!from-blue-500 !to-blue-600 hover:!from-blue-400 hover:!to-blue-500 !text-white !border-blue-400/70 !shadow-blue-600/30"
              >
                Help
              </GuideButton>

              <button
                data-tour="flows-new-button"
                onClick={() =>
                  guard(canCreate, router, () => setModalOpen(true))
                }
                className="rounded-lg bg-white text-[#2B245C] px-6 py-2.5 text-sm font-semibold shadow-md hover:shadow-lg hover:bg-gray-100 transition-all"
              >
                + New Flow
              </button>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="py-5 space-y-5">
          {/* Filters */}
          <section
            className="rounded-2xl border border-[#2B245C] bg-white p-6 shadow-lg hover:shadow-2xl transition-shadow duration-300"
            data-tour="flows-filters"
          >
            <h2 className="text-xl font-bold text-[#2B245C] mb-3">Filters</h2>
            <div className="grid grid-cols-1 md:grid-cols-6 gap-3 items-end">
              {/* New: BPA dropdown (filters.bpaId) */}
              <SelectBpa
                value={filters.bpaId || null}
                onChange={(id) =>
                  setFilters((f) => ({
                    ...f,
                    bpaId: id || "",
                    // when BPA changes, reset SA filters to avoid mismatches
                    sourceSaId: "",
                    targetSaId: "",
                  }))
                }
                className="w-full"
              />

              {/* New: Source / Target System Activity pickers, filtered by BPA */}
              <SelectSystemActivity
                value={filters.sourceSaId || null}
                onChange={(id) =>
                  setFilters((f) => ({ ...f, sourceSaId: id || "" }))
                }
                className="w-full"
                bpaId={filters.bpaId || undefined}
              />
              <SelectSystemActivity
                value={filters.targetSaId || null}
                onChange={(id) =>
                  setFilters((f) => ({ ...f, targetSaId: id || "" }))
                }
                className="w-full"
                bpaId={filters.bpaId || undefined}
              />

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Methods
                </label>
                <input
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                  placeholder="Methods CSV (api,sftp)"
                  value={filters.method}
                  onChange={(e) =>
                    setFilters((f) => ({ ...f, method: e.target.value }))
                  }
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Cross-border
                </label>
                <select
                  className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm"
                  value={filters.crossBorder}
                  onChange={(e) =>
                    setFilters((f) => ({ ...f, crossBorder: e.target.value }))
                  }
                >
                  <option value="">Cross-border (any)</option>
                  <option value="true">true</option>
                  <option value="false">false</option>
                </select>
              </div>

              <div className="self-center text-xs text-gray-500">
                {!canView
                  ? "No permission"
                  : loadingList
                    ? "Loading…"
                    : `Showing ${indexOfFirstRow + 1}-${Math.min(indexOfLastRow, items.length)} of ${items.length} results`}
              </div>
            </div>
            {error && (
              <div className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {error}
              </div>
            )}
          </section>

          {/* Results */}
          <section
            className="rounded-2xl border border-[#2B245C] bg-white p-6 shadow-lg hover:shadow-2xl transition-shadow duration-300"
            data-tour="flows-results"
          >
            <h2 className="text-2xl font-bold text-[#2B245C] mb-3">Flows</h2>
            <div className="overflow-x-auto rounded-lg border border-gray-500">
              <table className="min-w-full text-sm">
                <thead className="bg-[#2B245C] text-left text-white border-b border-gray-500">
                  <tr>
                    <th className="px-4 py-2 font-medium">Source</th>
                    <th className="px-4 py-2 font-medium">Target</th>
                    <th className="px-4 py-2 font-medium">Method</th>
                    <th className="px-4 py-2 font-medium">Freq</th>
                    <th className="px-4 py-2 font-medium">Cross-border</th>
                    <th className="px-4 py-2 font-medium">Safeguards</th>
                    <th className="px-4 py-2 font-medium">Status</th>
                    <th className="px-4 py-2 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {!canView ? (
                    <tr>
                      <td
                        className="px-4 py-6 text-center text-red-600 font-medium"
                        colSpan={8}
                      >
                        You don’t have permission to view flows.
                      </td>
                    </tr>
                  ) : loadingList ? (
                    [...Array(4)].map((_, i) => (
                      <tr key={i}>
                        {Array.from({ length: 8 }).map((__, j) => (
                          <td key={j} className="px-4 py-3">
                            <div className="h-4 w-28 animate-nonerounded bg-gray-100" />
                          </td>
                        ))}
                      </tr>
                    ))
                  ) : (items || []).length === 0 ? (
                    <tr>
                      <td
                        className="px-4 py-6 text-center text-gray-600"
                        colSpan={8}
                      >
                        No flows found.
                      </td>
                    </tr>
                  ) : (
                    currentRows.map((it) => (
                      <tr key={it._id} className="hover:bg-gray-50">
                        <td className="px-4 py-2 font-mono">
                          {String(it.sourceSaId)}
                        </td>
                        <td className="px-4 py-2 font-mono">
                          {String(it.targetSaId)}
                        </td>
                        <td className="px-4 py-2">{it.method}</td>
                        <td className="px-4 py-2">{it.frequency}</td>
                        <td className="px-4 py-2">
                          <span
                            className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs ${
                              it.crossBorder
                                ? "border-amber-200 bg-amber-50 text-amber-700"
                                : "border-gray-200 bg-gray-50 text-gray-700"
                            }`}
                          >
                            {it.crossBorder ? "Yes" : "No"}
                          </span>
                        </td>
                        <td className="px-4 py-2">
                          {(it.safeguards || []).length ? (
                            <div className="flex flex-wrap gap-1">
                              {(it.safeguards || []).map((s, idx) => (
                                <span
                                  key={idx}
                                  className="rounded-full border border-gray-200 bg-gray-50 px-2 py-0.5 text-xs text-gray-700"
                                >
                                  {s}
                                </span>
                              ))}
                            </div>
                          ) : (
                            "—"
                          )}
                        </td>
                        <td className="px-4 py-2">
                          <span
                            className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs ${statusTone(
                              it.status,
                            )}`}
                          >
                            {it.status || "—"}
                          </span>
                        </td>
                        <td className="px-4 py-2">
                          <button
                            onClick={() =>
                              guard(canDelete, router, () => confirmArchive(it))
                            }
                            className="rounded-lg border border-red-200 bg-white px-2 py-1 text-xs font-medium text-red-700 hover:bg-red-50"
                          >
                            Archive
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            {/* Pagination */}
            {items.length > 0 && (
              <div className="mt-4 flex items-center justify-between">
                {/* Rows per page */}
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">Rows per page:</span>

                  <select
                    className="rounded border px-2 py-1 text-sm"
                    value={rowsPerPage}
                    onChange={(e) => {
                      setRowsPerPage(Number(e.target.value));
                      setCurrentPage(1);
                    }}
                  >
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                  </select>
                </div>

                {/* Showing count */}
                <span className="text-sm text-gray-600">
                  Showing {indexOfFirstRow + 1}–
                  {Math.min(indexOfLastRow, items.length)} of {items.length}
                </span>

                {/* Navigation */}
                <div className="flex items-center gap-2">
                  <button
                    className="rounded-lg bg-[#2B245C] text-white px-4 py-2 text-sm font-semibold shadow-md hover:shadow-lg hover:bg-opacity-90 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-200 ease-in-out"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((p) => p - 1)}
                  >
                    Prev
                  </button>

                  <span className="text-sm">
                    Page {currentPage} of {totalPages}
                  </span>

                  <button
                    className="rounded-lg bg-[#2B245C] text-white px-4 py-2 text-sm font-semibold shadow-md hover:shadow-lg hover:bg-opacity-90 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-200 ease-in-out"
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage((p) => p + 1)}
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </section>
        </div>
      </div>

      {/* Modal (Create) */}
      {modalOpen && (
        <Modal onClose={() => setModalOpen(false)}>
          <form onSubmit={create} className="space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold text-[#2B245C]">Add Flow</h3>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm hover:bg-gray-50"
              >
                Close
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {/* New: BPA dropdown for the modal (drives SA choices) */}
              <SelectBpa
                value={form.bpaId || null}
                onChange={(id) =>
                  setForm((f) => ({
                    ...f,
                    bpaId: id || "",
                    // reset SAs when BPA changes
                    sourceSaId: "",
                    targetSaId: "",
                  }))
                }
                className="w-full"
              />

              {/* New: Source/Target SA pickers filtered by BPA */}
              <SelectSystemActivity
                value={form.sourceSaId || null}
                onChange={(id) =>
                  setForm((f) => ({ ...f, sourceSaId: id || "" }))
                }
                className="w-full"
                bpaId={form.bpaId || undefined}
                placeholder="Select the source system activity"
              />
              <SelectSystemActivity
                value={form.targetSaId || null}
                onChange={(id) =>
                  setForm((f) => ({ ...f, targetSaId: id || "" }))
                }
                className="w-full"
                bpaId={form.bpaId || undefined}
                placeholder="Select the target system activity"
              />

              <FormField label="Status">
                <select
                  className="rounded-lg border border-gray-200 px-3 py-2 text-sm"
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                >
                  <option value="proposed">Proposed</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </FormField>

              <FormField label="Method">
                <select
                  className="rounded-lg border border-gray-200 px-3 py-2 text-sm"
                  value={form.method}
                  onChange={(e) => setForm({ ...form, method: e.target.value })}
                >
                  <option>api</option>
                  <option>event</option>
                  <option>sftp</option>
                  <option>ftp</option>
                  <option>smb</option>
                  <option>ssh</option>
                  <option>rdp</option>
                  <option>sdk</option>
                  <option>manual</option>
                  <option>other</option>
                </select>
              </FormField>

              <FormField label="Frequency">
                <select
                  className="rounded-lg border border-gray-200 px-3 py-2 text-sm"
                  value={form.frequency}
                  onChange={(e) =>
                    setForm({ ...form, frequency: e.target.value })
                  }
                >
                  <option>one_time</option>
                  <option>daily</option>
                  <option>weekly</option>
                  <option>monthly</option>
                  <option>ad_hoc</option>
                </select>
              </FormField>

              <label className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm">
                <input
                  type="checkbox"
                  checked={form.crossBorder}
                  onChange={(e) =>
                    setForm({ ...form, crossBorder: e.target.checked })
                  }
                />
                Cross-border
              </label>

              <FormField label="Countries (from)">
                <input
                  className="rounded-lg border border-gray-200 px-3 py-2 text-sm"
                  placeholder="e.g. Germany, France, India"
                  value={form.countriesFrom}
                  onChange={(e) =>
                    setForm({ ...form, countriesFrom: e.target.value })
                  }
                />
              </FormField>

              <FormField label="Countries (to)">
                <input
                  className="rounded-lg border border-gray-200 px-3 py-2 text-sm"
                  placeholder="e.g. United States, Singapore"
                  value={form.countriesTo}
                  onChange={(e) =>
                    setForm({ ...form, countriesTo: e.target.value })
                  }
                />
              </FormField>

              <FormField label="Safeguards">
                <input
                  className="rounded-lg border border-gray-200 px-3 py-2 text-sm"
                  placeholder="e.g. SCC, BCR"
                  value={form.safeguards}
                  onChange={(e) =>
                    setForm({ ...form, safeguards: e.target.value })
                  }
                />
              </FormField>

              <FormField label="Evidence Refs" className="md:col-span-2">
                <input
                  className="rounded-lg border border-gray-200 px-3 py-2 text-sm md:col-span-2"
                  placeholder="e.g. DPA-001, SCC-2021"
                  value={form.evidenceRefs}
                  onChange={(e) =>
                    setForm({ ...form, evidenceRefs: e.target.value })
                  }
                />
              </FormField>

              <FormField label="Notes" className="md:col-span-3">
                <textarea
                  className="rounded-lg border border-gray-200 px-3 py-2 text-sm md:col-span-3"
                  placeholder="Add any additional information (optional)"
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                />
              </FormField>
            </div>

            <div className="flex gap-2">
              <button
                className="rounded-lg bg-[#2B245C] text-white px-4 py-2 text-sm font-semibold shadow-md hover:shadow-lg hover:bg-opacity-90 transition-all disabled:opacity-60"
                disabled={saving || !canCreate}
              >
                {saving ? "Saving…" : "Add Flow"}
              </button>
              <button
                type="button"
                className="rounded-lg border border-[#2B245C] bg-white px-4 py-2 text-sm font-medium text-[#2B245C] hover:bg-indigo-50 transition-all"
                onClick={() => setModalOpen(false)}
              >
                Cancel
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Archive Modal */}
      {archiveModalOpen && (
        <Modal onClose={closeArchiveModal}>
          <div className="space-y-5">
            <h3 className="text-xl font-semibold text-[#2B245C]">
              Archive Flow
            </h3>

            <p className="text-gray-600">
              Are you sure you want to archive this flow?
            </p>

            <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 text-sm">
              <div>
                <strong>Source:</strong> {flowToArchive?.sourceSaId || "—"}
              </div>

              <div className="mt-1">
                <strong>Target:</strong> {flowToArchive?.targetSaId || "—"}
              </div>

              <div className="mt-1">
                <strong>Method:</strong> {flowToArchive?.method || "—"}
              </div>
            </div>

            <p className="text-sm text-red-600">
              This action cannot be undone.
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={closeArchiveModal}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium hover:bg-gray-50"
              >
                Cancel
              </button>

              <button
                onClick={handleArchiveConfirm}
                className="rounded-lg bg-red-600 px-4 py-2 text-white text-sm font-medium hover:bg-red-700"
              >
                Archive
              </button>
            </div>
          </div>
        </Modal>
      )}

      <Tour steps={steps} open={tourOpen} onClose={() => setTourOpen(false)} />
    </div>
  );
}

/** Simple Tailwind modal */
function Modal({ children, onClose }) {
  const panelRef = useRef(null);

  // keep the latest onClose in a ref so the keydown handler can be stable
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    // stable keydown handler
    const onKey = (e) => {
      if (e.key === "Escape") onCloseRef.current?.();
    };
    document.addEventListener("keydown", onKey);

    // focus the panel ONCE, when the modal mounts
    panelRef.current?.focus();

    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50">
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div
          ref={panelRef}
          tabIndex={-1}
          role="dialog"
          aria-modal="true"
          className="w-full max-w-4xl rounded-2xl border border-gray-200 bg-white p-5 shadow-xl outline-none"
          onClick={(e) => e.stopPropagation()}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
