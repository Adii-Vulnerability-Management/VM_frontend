/* pages/admin/dataFlow/framework-topics/index.js
   Admin UI: Framework Topics (CRUD - compact)
   Adjust backend routes if yours differ.
*/
import React, { useEffect, useState, useCallback, useRef } from "react";
import CustomAxios from "@/globalcomponents/CustomAxios";
import { baseurl, initURL } from "@/config/config";
import DataFlowNav from "../Nav";
import { toast } from "react-toastify";
import GuideButton from "@/components/Tour/GuideButton";
import Tour from "@/components/Tour/Tour";
import { useRouter } from "next/router";
import { can, guard } from "@/auth/auth-permissions";

const csvToArray = (s = "") =>
  s
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean);
const arrayToCsv = (arr = []) => (Array.isArray(arr) ? arr.join(", ") : "");

const FormField = ({ label, required = false, children, className = "" }) => (
  <div className={`flex flex-col ${className}`}>
    <label className="text-xs font-semibold text-gray-700 mb-2">
      {label}
      {required && <span className="text-red-500 ml-1">*</span>}
    </label>
    {children}
  </div>
);

export default function FrameworkTopicsPage() {
  const router = useRouter();

  const [items, setItems] = useState([]);
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "",
    description: "",
    tagsCsv: "",
  });

  // UI state (non-breaking)
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [archiveModalOpen, setArchiveModalOpen] = useState(false);
  const [topicToArchive, setTopicToArchive] = useState(null);
  const [tourOpen, setTourOpen] = useState(false);

  const apiBase = `${baseurl}/${initURL}/dataflow/framework-topics`;

  // Permissions
  const canView = can("privacy.read");
  const canCreate = can("privacy.create");
  const canUpdate = can("privacy.update");
  const canDelete = can("privacy.delete");

  const fetchItems = async () => {
    try {
      setLoading(true);
      const { data } = await CustomAxios.get(apiBase);
      setItems(data || []);
      setCurrentPage(1);
    } catch (e) {
      setError(
        e?.response?.data?.message || e.message || "Failed to load topics",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const reset = () => {
    setForm({ name: "", description: "", tagsCsv: "" });
    setEditingId(null);
    setError("");
  };

  const openCreate = () => {
    reset();
    setModalOpen(true);
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const payload = {
      name: form.name.trim(),
      description: form.description || undefined,
      tags: csvToArray(form.tagsCsv),
    };
    try {
      setSaving(true);
      if (editingId) {
        await CustomAxios.patch(`${apiBase}/${editingId}`, payload);
      } else {
        await CustomAxios.post(apiBase, payload);
      }
      await fetchItems();
      setModalOpen(false);
      reset();
    } catch (e) {
      setError(e?.response?.data?.message || e.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const onEdit = (it) => {
    setEditingId(it._id);
    setForm({
      name: it.name || "",
      description: it.description || "",
      tagsCsv: arrayToCsv(it.tags),
    });
    setModalOpen(true);
  };

  const onArchive = async (id) => {
    try {
      await CustomAxios.delete(`${apiBase}/${id}`);
      toast.success("Topic archived successfully");

      await fetchItems();
    } catch (e) {
      toast.error(e?.response?.data?.message || e.message || "Archive failed");
    }
  };

  const confirmArchive = (topic) => {
    setTopicToArchive(topic);
    setArchiveModalOpen(true);
  };

  const handleArchiveConfirm = async () => {
    if (!topicToArchive) return;

    await onArchive(topicToArchive._id);

    setArchiveModalOpen(false);
    setTopicToArchive(null);
  };

  const closeArchiveModal = () => {
    setArchiveModalOpen(false);
    setTopicToArchive(null);
  };

  // Close modal on Esc
  const closeOnEsc = useCallback((e) => {
    if (e.key === "Escape") setModalOpen(false);
  }, []);

  useEffect(() => {
    if (!modalOpen) return;
    document.addEventListener("keydown", closeOnEsc);
    return () => document.removeEventListener("keydown", closeOnEsc);
  }, [modalOpen, closeOnEsc]);

  const steps = [
    {
      target: '[data-tour="topics-header"]',
      title: "Framework Topics",
      content:
        "This page allows you to manage reusable topics used across your compliance frameworks.",
      placement: "bottom",
    },
    {
      target: '[data-tour="topics-new-button"]',
      title: "Add New Topic",
      content:
        "Click here to create a new topic by providing a name, description, and relevant tags.",
      placement: "left",
    },
    {
      target: '[data-tour="topics-table"]',
      title: "Topics Overview",
      content:
        "This section displays all existing topics along with their descriptions and associated tags. Use these actions to edit topic details or archive topics that are no longer required.",
      placement: "top",
    },
    {
      target: '[data-tour="topics-refresh"]',
      title: "Refresh Data",
      content:
        "Use this option to reload the latest data and ensure you are viewing the most up-to-date information.",
      placement: "left",
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

      <div className="mx-5 min-h-screen bg-white rounded-lg p-5 my-3">
        {/* Header */}
        <div
          className="px-6 py-8 bg-[#2B245C] rounded-2xl shadow-lg hover:shadow-2xl transition-shadow duration-300"
          data-tour="topics-header"
        >
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-cyan-50">
                Framework Topics
              </h1>
              <p className="mt-1 text-sm text-white">
                Define and manage reusable topics for mapping to compliance
                frameworks.
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
                data-tour="topics-new-button"
                onClick={() => guard(canCreate, router, openCreate)}
                className="rounded-lg bg-white text-[#2B245C] px-6 py-2.5 text-sm font-semibold shadow-md hover:shadow-lg hover:bg-gray-50 transition-all"
              >
                + New Topic
              </button>
            </div>
          </div>
        </div>

        <div className="py-5 space-y-5">
          {/* List */}
          <section
            className="rounded-2xl border border-[#2B245C] bg-white p-6 shadow-lg hover:shadow-2xl transition-shadow duration-300"
            data-tour="topics-table"
          >
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-2xl font-semibold text-[#2B245C]">Topics</h2>
              <div className="flex items-center gap-3">
                {canView && (
                  <span className="text-sm text-gray-600">
                    Showing {items.length === 0 ? 0 : indexOfFirstRow + 1}–
                    {Math.min(indexOfLastRow, items.length)} of {items.length}
                  </span>
                )}
                <button
                  data-tour="topics-refresh"
                  className="rounded-lg border border-[#2B245C] bg-white px-3 py-1.5 text-sm font-medium text-[#2B245C] hover:bg-indigo-50 transition-all"
                  onClick={fetchItems}
                >
                  {loading ? "Refreshing…" : "Refresh"}
                </button>
              </div>
            </div>

            <div className="overflow-auto rounded-lg border border-gray-800">
              <table className="min-w-full text-sm">
                <thead className="bg-[#2B245C] text-left text-white border-b border-gray-800">
                  <tr>
                    <th className="px-4 py-2 font-medium">Name</th>
                    <th className="px-4 py-2 font-medium">Description</th>
                    <th className="px-4 py-2 font-medium">Tags</th>
                    <th className="px-4 py-2 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {!canView ? (
                    <tr>
                      <td
                        colSpan={4}
                        className="px-4 py-4 text-center text-red-600 font-medium"
                      >
                        You don’t have permission to view framework topics.
                      </td>
                    </tr>
                  ) : loading ? (
                    [...Array(4)].map((_, i) => (
                      <tr key={i}>
                        <td className="px-4 py-3">
                          <div className="h-4 w-28 animate-nonerounded bg-gray-100" />
                        </td>
                        <td className="px-4 py-3">
                          <div className="h-4 w-40 animate-nonerounded bg-gray-100" />
                        </td>
                        <td className="px-4 py-3">
                          <div className="h-4 w-48 animate-nonerounded bg-gray-100" />
                        </td>
                        <td className="px-4 py-3">
                          <div className="h-7 w-24 animate-nonerounded bg-gray-100" />
                        </td>
                      </tr>
                    ))
                  ) : items.length === 0 ? (
                    <tr>
                      <td
                        className="px-4 py-6 text-center text-gray-600"
                        colSpan={4}
                      >
                        No topics yet.
                      </td>
                    </tr>
                  ) : (
                    currentRows.map((it) => (
                      <tr key={it._id} className="hover:bg-gray-50">
                        <td className="px-4 py-2 font-semibold">{it.name}</td>
                        <td className="px-4 py-2">{it.description || ""}</td>
                        <td className="px-4 py-2">{arrayToCsv(it.tags)}</td>
                        <td className="px-4 py-2">
                          <div className="flex gap-2">
                            <button
                              className="rounded-lg border border-[#2B245C] bg-white px-2.5 py-1 text-xs font-medium text-[#2B245C] hover:bg-indigo-50 transition-all"
                              onClick={() =>
                                guard(canUpdate, router, () => onEdit(it))
                              }
                            >
                              Edit
                            </button>
                            <button
                              className="rounded-lg border border-red-200 bg-white px-2.5 py-1 text-xs font-medium text-red-700 hover:bg-red-50 transition-all"
                              onClick={() =>
                                guard(canDelete, router, () =>
                                  confirmArchive(it),
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
            {canView && items.length > 0 && (
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

                {/* Showing count */}
                <span className="text-sm text-gray-600">
                  Showing {items.length === 0 ? 0 : indexOfFirstRow + 1}–
                  {Math.min(indexOfLastRow, items.length)} of {items.length}
                </span>

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

            {error && (
              <div className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {error}
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
            reset();
          }}
        >
          <form
            className="space-y-5"
            onSubmit={(e) =>
              guard(editingId ? canUpdate : canCreate, router, () =>
                onSubmit(e),
              )
            }
          >
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold text-[#2B245C]">
                {editingId ? "Edit Topic" : "Create New Topic"}
              </h3>
              <button
                type="button"
                onClick={() => {
                  setModalOpen(false);
                  reset();
                }}
                className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm hover:bg-gray-50"
              >
                Close
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField label="Name" required className="md:col-span-2">
                <input
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Enter framework topic name"
                  required
                />
              </FormField>

              <FormField label="Description" className="md:col-span-2">
                <textarea
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                  rows={3}
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                  placeholder="Describe the purpose and scope of this framework topic"
                />
              </FormField>

              <FormField label="Tags (CSV)" className="md:col-span-2">
                <input
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                  value={form.tagsCsv}
                  onChange={(e) =>
                    setForm({ ...form, tagsCsv: e.target.value })
                  }
                  placeholder="e.g. GDPR, HIPAA, PCI DSS"
                />
              </FormField>
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                disabled={saving}
                className="rounded-lg bg-[#2B245C] px-4 py-2 text-sm font-semibold text-white shadow-md hover:shadow-lg hover:bg-opacity-90 disabled:opacity-60 transition-all"
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
                  reset();
                }}
              >
                Cancel
              </button>
            </div>

            {error && <p className="text-red-600 text-sm">{error}</p>}
          </form>
        </Modal>
      )}

      {/* Archive Modal */}
      {archiveModalOpen && (
        <Modal onClose={closeArchiveModal}>
          <div className="space-y-5">
            <h3 className="text-xl font-semibold text-[#2B245C]">
              Archive Framework Topic
            </h3>

            <p className="text-gray-600">
              Are you sure you want to archive the topic{" "}
              <span className="font-semibold">{topicToArchive?.name}</span>?
            </p>

            {topicToArchive?.description && (
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 text-sm">
                {topicToArchive.description}
              </div>
            )}

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

/** Simple Tailwind modal used above */
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
