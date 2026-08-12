// pages/admin/dataFlow/framework-map/index.js
import React, { useEffect, useState, useCallback, useRef } from "react";
import CustomAxios from "@/globalcomponents/CustomAxios";
import { baseurl, initURL } from "@/config/config";
import DataFlowNav from "../Nav";
import { toast } from "react-toastify";
import GuideButton from "@/components/Tour/GuideButton";
import Tour from "@/components/Tour/Tour";
import { useRouter } from "next/router";
import { can, guard } from "@/auth/auth-permissions";

// NOTE: csvToArray kept as in original to preserve comments / helpers
const csvToArray = (s = "") =>
  s
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean);

const FormField = ({ label, required = false, children, className = "" }) => (
  <div className={`flex flex-col ${className}`}>
    <label className="text-xs font-semibold text-gray-700 mb-2">
      {label}
      {required && <span className="text-red-500 ml-1">*</span>}
    </label>
    {children}
  </div>
);

export default function FrameworkMapPage() {
  const router = useRouter();

  // ---- state (unchanged logic) ----
  const [rows, setRows] = useState([]);
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [topics, setTopics] = useState([]);
  const [topicsLoading, setTopicsLoading] = useState(false);
  const [editingId, setEditingId] = useState(null); // if set, modal is in edit mode
  const [q, setQ] = useState({ framework: "", topicName: "", active: "true" });
  const [form, setForm] = useState({
    framework: "GDPR",
    version: "",
    citation: "",
    topicName: "",
    since: "",
    until: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  // Modal open/close
  const [modalOpen, setModalOpen] = useState(false);
  const [archiveModalOpen, setArchiveModalOpen] = useState(false);
  const [selectedMapping, setSelectedMapping] = useState(null);
  const [tourOpen, setTourOpen] = useState(false);

  // Permissions
  const canView = can("privacy.read");
  const canCreate = can("privacy.create");
  const canUpdate = can("privacy.update");
  const canDelete = can("privacy.delete");

  const closeOnEsc = useCallback((e) => {
    if (e.key === "Escape") setModalOpen(false);
  }, []);

  useEffect(() => {
    if (!modalOpen) return;
    document.addEventListener("keydown", closeOnEsc);
    return () => document.removeEventListener("keydown", closeOnEsc);
  }, [modalOpen, closeOnEsc]);

  // centralize API base (consistent with fetch path)
  const apiBase = `${baseurl}/${initURL}/dataflow/framework-map`;
  const topicsApiBase = `${baseurl}/${initURL}/dataflow/framework-topics`;

  // ---- data fetch (same logic) ----
  const fetchRows = async () => {
    setError("");
    const params = new URLSearchParams();
    if (q.framework) params.set("framework", q.framework);
    if (q.topicName) params.set("topicName", q.topicName);
    if (q.active) params.set("active", q.active);

    try {
      setLoading(true);
      console.log("FETCH URL:", `${apiBase}?${params.toString()}`);
      const { data } = await CustomAxios.get(`${apiBase}?${params.toString()}`);
      console.log("FETCH data:", data);
      setRows(data || []);
      setCurrentPage(1);
    } catch (e) {
      console.log("FETCH error:", e);
      setError(
        e?.response?.data?.message || e.message || "Failed to load mappings",
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchTopics = async () => {
    try {
      setTopicsLoading(true);
      const { data } = await CustomAxios.get(topicsApiBase);
      const list = Array.isArray(data?.items)
        ? data.items
        : Array.isArray(data?.data)
          ? data.data
          : Array.isArray(data)
            ? data
            : [];

      setTopics(
        list
          .map((topic) => ({
            value: topic.name || topic.topicName || topic.label || topic.key,
            label: topic.name || topic.topicName || topic.label || topic.key,
          }))
          .filter((topic) => topic.value && topic.label),
      );
    } catch (e) {
      setError(
        e?.response?.data?.message || e.message || "Failed to load topics",
      );
    } finally {
      setTopicsLoading(false);
    }
  };

  useEffect(() => {
    fetchRows();
  }, [q.framework, q.topicName, q.active]);

  useEffect(() => {
    fetchTopics();
  }, []);

  const topicOptions =
    form.topicName && !topics.some((topic) => topic.value === form.topicName)
      ? [{ value: form.topicName, label: form.topicName }, ...topics]
      : topics;

  const resetForm = () => {
    setEditingId(null);
    setForm({
      framework: "GDPR",
      version: "",
      citation: "",
      topicName: "",
      since: "",
      until: "",
    });
    setError("");
  };

  const openCreate = () => {
    resetForm();
    setModalOpen(true);
  };

  const submit = async (e) => {
    e.preventDefault();
    if (saving) return;

    setError("");
    setSaving(true);
    try {
      const payload = {
        framework: form.framework,
        version: form.version.trim(),
        citation: form.citation.trim(),
        topicName: form.topicName.trim(),
        since: form.since || undefined,
        until: form.until || undefined,
      };
      if (editingId) {
        await CustomAxios.patch(`${apiBase}/${editingId}`, payload);
      } else {
        await CustomAxios.post(apiBase, payload);
      }
      await fetchRows();
      setModalOpen(false);
      resetForm();
    } catch (e) {
      setError(e?.response?.data?.message || e.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const edit = (r) => {
    setEditingId(r._id);
    setForm({
      framework: r.framework,
      version: r.version || "",
      citation: r.citation || "",
      topicName: r.topicName || "",
      since: r.since ? String(r.since).slice(0, 10) : "",
      until: r.until ? String(r.until).slice(0, 10) : "",
    });
    setModalOpen(true);
  };

  const confirmArchive = (mapping) => {
    setSelectedMapping(mapping);
    setArchiveModalOpen(true);
  };

  const archive = async () => {
    if (!selectedMapping) return;

    try {
      await CustomAxios.delete(`${apiBase}/${selectedMapping._id}`);

      toast.success("Mapping archived successfully");

      setArchiveModalOpen(false);
      setSelectedMapping(null);

      await fetchRows();
    } catch (e) {
      setError(e?.response?.data?.message || e.message || "Archive failed");
      toast.error(e?.response?.data?.message || e.message || "Archive failed");
    }
  };

  // little badge for date range
  const rangeText = (r) =>
    `${r.since ? String(r.since).slice(0, 10) : "—"} → ${
      r.until ? String(r.until).slice(0, 10) : "—"
    }`;

  const steps = [
    {
      target: '[data-tour="fmap-header"]',
      title: "Framework Mapping",
      content:
        "This page helps you manage mappings between compliance frameworks and topics.",
      placement: "bottom",
    },
    {
      target: '[data-tour="fmap-new-button"]',
      title: "Create Mapping",
      content:
        "Use this option to add a new mapping by linking a framework citation to a topic.",
      placement: "left",
    },
    {
      target: '[data-tour="fmap-filters"]',
      title: "Filter Mappings",
      content:
        "Filter mappings by framework, topic name, or active status to quickly find relevant records.",
      placement: "top",
    },
    {
      target: '[data-tour="fmap-refresh"]',
      title: "Refresh Data",
      content: "Reload the latest mappings from the system.",
      placement: "left",
    },
    {
      target: '[data-tour="fmap-table"]',
      title: "Mappings Overview",
      content:
        "View all mappings with framework details, citations, topics, and validity period. Edit existing mappings or archive records that are no longer required.",
      placement: "top",
    },
  ];

  // Pagination calculations
  const totalPages = Math.ceil(rows.length / rowsPerPage);

  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;

  const currentRows = rows.slice(indexOfFirstRow, indexOfLastRow);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <DataFlowNav />

      <div className="mx-5 min-h-screen bg-white rounded-lg p-5 my-3">
        {/* Header */}
        <div
          className="px-6 py-8 bg-[#2B245C] rounded-2xl shadow-lg hover:shadow-2xl transition-shadow duration-300"
          data-tour="fmap-header"
        >
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-cyan-50">
                Framework Map (Citations)
              </h1>
              <p className="mt-1 text-sm text-white">
                Create and maintain mappings between compliance frameworks and
                topics.
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
                data-tour="fmap-new-button"
                onClick={() => guard(canCreate, router, openCreate)}
                className="rounded-lg bg-white text-[#2B245C] px-6 py-2.5 text-sm font-semibold shadow-md hover:shadow-lg hover:bg-gray-50 transition-all"
              >
                + New Mapping
              </button>
            </div>
          </div>
        </div>
        <div className="py-5 space-y-5">
          {/* Filters */}
          <section
            className="rounded-2xl border border-[#2B245C] bg-white p-6 shadow-lg hover:shadow-2xl transition-shadow duration-300"
            data-tour="fmap-filters"
          >
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-xl font-semibold text-[#2B245C]">Filters</h2>
              <div className="text-xs text-gray-500">
                {rows.length} result{rows.length === 1 ? "" : "s"}
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-4">
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-600">
                  Framework
                </label>
                <input
                  className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm"
                  placeholder="GDPR / HIPAA / PCI_DSS / DPDPA"
                  value={q.framework}
                  onChange={(e) => setQ({ ...q, framework: e.target.value })}
                />
              </div>
              <div className="md:col-span-2">
                <label className="mb-1 block text-xs font-medium text-gray-600">
                  Topic Name
                </label>
                <input
                  className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm"
                  placeholder="Security Controls / Retention / Transfers"
                  value={q.topicName}
                  onChange={(e) => setQ({ ...q, topicName: e.target.value })}
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-600">
                  Active Now
                </label>
                <select
                  className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm"
                  value={q.active}
                  onChange={(e) => setQ({ ...q, active: e.target.value })}
                >
                  <option value="true">true</option>
                  <option value="">(ignore)</option>
                </select>
              </div>
            </div>

            <div className="mt-3 flex items-center gap-3">
              <button
                data-tour="fmap-refresh"
                className="rounded-lg border border-[#2B245C] bg-white px-4 py-2 text-sm font-medium text-[#2B245C] hover:bg-gray-50"
                onClick={fetchRows}
              >
                {loading ? "Refreshing…" : "Refresh"}
              </button>
              {error && (
                <div className="ml-auto rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                  {error}
                </div>
              )}
            </div>
          </section>

          {/* Table */}
          <section
            className="rounded-2xl border border-[#2B245C] bg-white p-6 shadow-lg hover:shadow-2xl transition-shadow duration-300"
            data-tour="fmap-table"
          >
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-2xl font-semibold text-[#2B245C]">
                Mappings
              </h2>
              {canView && (
                <span className="text-sm text-gray-600">
                  Showing {rows.length === 0 ? 0 : indexOfFirstRow + 1}–
                  {Math.min(indexOfLastRow, rows.length)} of {rows.length}
                </span>
              )}
            </div>

            <div className="overflow-auto rounded-lg border border-gray-800">
              <table className="min-w-full text-sm">
                <thead className="bg-[#2B245C] text-left text-white border-b border-gray-800">
                  <tr>
                    <th className="px-4 py-2 font-medium">Framework</th>
                    <th className="px-4 py-2 font-medium">Version</th>
                    <th className="px-4 py-2 font-medium">Citation</th>
                    <th className="px-4 py-2 font-medium">Topic</th>
                    <th className="px-4 py-2 font-medium whitespace-nowrap">
                      Since → Until
                    </th>
                    <th className="px-4 py-2 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {!canView ? (
                    <tr>
                      <td
                        colSpan={6}
                        className="px-4 py-4 text-center text-red-600 font-medium"
                      >
                        You don’t have permission to view mappings.
                      </td>
                    </tr>
                  ) : loading ? (
                    [...Array(4)].map((_, i) => (
                      <tr key={i}>
                        <td className="px-4 py-3">
                          <div className="h-4 w-28 animate-nonerounded bg-gray-100" />
                        </td>
                        <td className="px-4 py-3">
                          <div className="h-4 w-20 animate-nonerounded bg-gray-100" />
                        </td>
                        <td className="px-4 py-3">
                          <div className="h-4 w-36 animate-nonerounded bg-gray-100" />
                        </td>
                        <td className="px-4 py-3">
                          <div className="h-4 w-40 animate-nonerounded bg-gray-100" />
                        </td>
                        <td className="px-4 py-3">
                          <div className="h-4 w-32 animate-nonerounded bg-gray-100" />
                        </td>
                        <td className="px-4 py-3">
                          <div className="h-8 w-24 animate-nonerounded bg-gray-100" />
                        </td>
                      </tr>
                    ))
                  ) : rows.length === 0 ? (
                    <tr>
                      <td
                        className="px-4 py-6 text-center text-gray-600"
                        colSpan={6}
                      >
                        No mappings yet.
                      </td>
                    </tr>
                  ) : (
                    currentRows.map((r) => (
                      <tr key={r._id} className="hover:bg-gray-50">
                        <td className="px-4 py-2">{r.framework}</td>
                        <td className="px-4 py-2">{r.version}</td>
                        <td className="px-4 py-2">{r.citation}</td>
                        <td className="px-4 py-2">{r.topicName}</td>
                        <td className="px-4 py-2">
                          <span className="inline-flex items-center rounded-full border border-gray-200 bg-gray-50 px-2 py-0.5 text-xs text-gray-700">
                            {rangeText(r)}
                          </span>
                        </td>
                        <td className="px-4 py-2">
                          <div className="flex gap-2">
                            <button
                              className="rounded-lg border border-[#2B245C] bg-white px-2.5 py-1 text-xs font-medium text-[#2B245C] hover:bg-indigo-50 transition-all"
                              onClick={() =>
                                guard(canUpdate, router, () => edit(r))
                              }
                            >
                              Edit
                            </button>
                            <button
                              className="rounded-lg border border-red-300 bg-white px-2.5 py-1 text-xs font-medium text-red-700 hover:bg-red-50 transition-all"
                              onClick={() =>
                                guard(canDelete, router, () =>
                                  confirmArchive(r),
                                )
                              }
                            >
                              Archive
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {canView && rows.length > 0 && (
              <div className="mt-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                {/* Rows per page */}
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">Rows per page:</span>

                  <select
                    className="rounded-md border border-gray-300 px-2 py-1 text-sm"
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

                {/* Navigation */}
                <div className="flex items-center gap-2">
                  <button
                    className="rounded-lg bg-[#2B245C] text-white px-4 py-2 text-sm font-semibold shadow-md hover:shadow-lg hover:bg-opacity-90 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-200 ease-in-out"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((page) => page - 1)}
                  >
                    Prev
                  </button>

                  <span className="text-sm">
                    Page {currentPage} of {totalPages || 1}
                  </span>

                  <button
                    className="rounded-lg bg-[#2B245C] text-white px-4 py-2 text-sm font-semibold shadow-md hover:shadow-lg hover:bg-opacity-90 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-200 ease-in-out"
                    disabled={currentPage === totalPages || totalPages === 0}
                    onClick={() => setCurrentPage((page) => page + 1)}
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </section>
        </div>
      </div>

      {/* Modal (Create / Edit) */}
      {modalOpen && (
        <Modal
          onClose={() => {
            setModalOpen(false);
            resetForm();
          }}
        >
          <form
            onSubmit={(e) =>
              guard(editingId ? canUpdate : canCreate, router, () => submit(e))
            }
            className="space-y-5"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold text-[#2B245C]">
                {editingId ? "Edit Mapping" : "Create New Mapping"}
              </h3>
              <button
                type="button"
                onClick={() => {
                  setModalOpen(false);
                  resetForm();
                }}
                className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm hover:bg-gray-50"
              >
                Close
              </button>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <FormField label="Framework" required>
                <input
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                  value={form.framework}
                  onChange={(e) =>
                    setForm({ ...form, framework: e.target.value })
                  }
                  placeholder="e.g., GDPR, HIPAA, ISO 27001"
                  required
                />
              </FormField>

              <FormField label="Version" required>
                <input
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                  value={form.version}
                  onChange={(e) =>
                    setForm({ ...form, version: e.target.value })
                  }
                  placeholder="e.g., 2016/679, 4.0.1, 2022"
                  required
                />
              </FormField>

              <FormField label="Citation" required>
                <input
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                  value={form.citation}
                  onChange={(e) =>
                    setForm({ ...form, citation: e.target.value })
                  }
                  placeholder="e.g., Article 30(1), Section 164.312, Requirement 10.2"
                  required
                />
              </FormField>

              <FormField label="Topic Name" required>
                <select
                  className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm"
                  value={form.topicName}
                  onChange={(e) =>
                    setForm({ ...form, topicName: e.target.value })
                  }
                  required
                  disabled={topicsLoading}
                >
                  <option value="">
                    {topicsLoading ? "Loading topics..." : "Select a framework topic"}
                  </option>
                  {topicOptions.map((topic) => (
                    <option key={topic.value} value={topic.value}>
                      {topic.label}
                    </option>
                  ))}
                </select>
              </FormField>

              <FormField label="Since">
                {/* Since (YYYY-MM-DD) */}
                <input
                  type="date"
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                  value={form.since}
                  onChange={(e) => setForm({ ...form, since: e.target.value })}
                  placeholder="e.g., 2024-01-01"
                />
              </FormField>

              <FormField label="Until">
                {/* Until (YYYY-MM-DD) */}
                <input
                  type="date"
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                  value={form.until}
                  onChange={(e) => setForm({ ...form, until: e.target.value })}
                  placeholder="e.g., 2025-12-31"
                />
              </FormField>
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                disabled={saving}
                className="rounded-lg bg-[#2B245C] px-4 py-2 text-sm font-semibold text-white shadow-md hover:shadow-lg hover:bg-indigo-600 disabled:opacity-60 transition-all"
              >
                {saving
                  ? editingId
                    ? "Updating…"
                    : "Creating…"
                  : editingId
                    ? "Update"
                    : "Create"}
              </button>
              <button
                type="button"
                className="rounded-lg border border-[#2B245C] bg-white px-4 py-2 text-sm font-medium text-[#2B245C] hover:bg-indigo-50 transition-all"
                onClick={() => {
                  setModalOpen(false);
                  resetForm();
                }}
              >
                Cancel
              </button>
              {error && (
                <p className="ml-auto self-center text-red-600 text-sm">
                  {error}
                </p>
              )}
            </div>
          </form>
        </Modal>
      )}

      {/* Archive Modal */}
      {archiveModalOpen && (
        <Modal
          onClose={() => {
            setArchiveModalOpen(false);
            setSelectedMappingId(null);
          }}
        >
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold text-[#2B245C]">
                Archive Mapping
              </h3>
            </div>

            <p className="text-sm text-gray-600">
              Are you sure you want to archive{" "}
              <span className="font-semibold">
                {selectedMapping?.framework} - {selectedMapping?.topicName}
              </span>
              ?
            </p>

            <p className="text-sm text-red-600">
              This action cannot be undone.
            </p>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setArchiveModalOpen(false);
                  setSelectedMapping(null);
                }}
                className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={archive}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white shadow-md hover:bg-red-700"
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

/** Simple Tailwind modal with focus trap-ish behavior */
function Modal({ children, onClose }) {
  const panelRef = useRef(null);
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    panelRef.current?.focus();
    return () => {
      document.body.style.overflow = prev;
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
          className="w-full max-w-3xl rounded-2xl border border-gray-200 bg-white p-5 shadow-xl outline-none"
          onClick={(e) => e.stopPropagation()}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
