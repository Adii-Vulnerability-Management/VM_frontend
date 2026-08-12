// pages/admin/dataClassifications/index.js
import { useEffect, useMemo, useState, useRef } from "react";
import CustomAxios from "@/globalcomponents/CustomAxios";
import { baseurl, initURL } from "@/config/config";
import DataFlowNav from "../Nav";
import { useRouter } from "next/router";
import { can, guard } from "@/auth/auth-permissions";
import { toast } from "react-toastify";
import GuideButton from "@/components/Tour/GuideButton";
import Tour from "@/components/Tour/Tour";

const API = `${baseurl}/${initURL}/dataflow/classifications`;

const FormField = ({ label, required = false, children, className = "" }) => (
  <div className={`flex flex-col ${className}`}>
    <label className="text-xs font-semibold text-gray-700 mb-2">
      {label}
      {required && <span className="text-red-500 ml-1">*</span>}
    </label>
    {children}
  </div>
);

export default function DataClassificationsPage() {
  const router = useRouter();

  const [items, setItems] = useState([]);
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [tourOpen, setTourOpen] = useState(false);

  // form state (create/edit) — aligned with DataCategories page
  const emptyForm = useMemo(
    () => ({
      name: "",
      description: "",
      archived: "false",
    }),
    [],
  );

  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  // modal
  const [modalOpen, setModalOpen] = useState(false);
  const [archiveModalOpen, setArchiveModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  const canView = can("privacy.read");
  const canCreate = can("privacy.create");
  const canUpdate = can("privacy.update");
  const canDelete = can("privacy.delete");

  const fetchItems = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await CustomAxios.get(API);
      const data = Array.isArray(res.data) ? res.data : [];
      setItems(data);
      setCurrentPage(1);
    } catch (e) {
      setError(e?.response?.data?.message || e.message || "Failed to load.");
    } finally {
      setLoading(false);
    }
  };

  const fetchOne = async (id) => {
    try {
      setError("");
      const res = await CustomAxios.get(`${API}/${id}`);
      setForm({
        name: res.data.name || "",
        description: res.data.description || "",
        archived:
          res.data.archived === undefined ? "false" : String(res.data.archived), // backend expects string
      });
    } catch (e) {
      setError(
        e?.response?.data?.message || e.message || "Failed to load item.",
      );
    }
  };

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
  };

  const openCreate = () => {
    resetForm();
    setModalOpen(true);
  };

  const createItem = async () => {
    try {
      setSaving(true);
      await CustomAxios.post(API, {
        name: form.name.trim(),
        description: form.description.trim(), // required in your UI
        archived: String(form.archived ?? "false"),
      });
      resetForm();
      setModalOpen(false);
      fetchItems();
      toast.success("Data Classification Created Successfully!");
    } catch (e) {
      setError(e?.response?.data?.message || e.message || "Create failed.");
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (it) => {
    setEditingId(it._id || it.id);
    setForm({
      name: it.name || "",
      description: it.description || "",
      archived: String(it.archived ?? "false"),
    });
    setModalOpen(true);
  };

  const updateItem = async () => {
    if (!editingId) return;
    try {
      setSaving(true);
      // Keeping same pattern as DataCategories page (PUT)
      await CustomAxios.patch(`${API}/${editingId}`, {
        name: form.name.trim(),
        description: form.description.trim(),
        archived: String(form.archived ?? "false"),
      });
      resetForm();
      setModalOpen(false);
      fetchItems();
      toast.success("Data Classification Updated Successfully!");
    } catch (e) {
      setError(e?.response?.data?.message || e.message || "Update failed.");
      toast.error("Failed to update Data Classification.");
      6;
    } finally {
      setSaving(false);
    }
  };

  // Archive/unarchive (DELETE in your pattern)
  const patchArchived = async (id) => {
    try {
      await CustomAxios.delete(`${API}/${id}`);
      toast.success(`"${selectedItem?.name}" has been archived successfully!`);
      setArchiveModalOpen(false);
      setSelectedItem(null);
      fetchItems();
    } catch (e) {
      const msg = e?.response?.data?.message || e.message || "Archive failed.";
      setError(msg);
      toast.error(msg);
    }
  };

  useEffect(() => {
    fetchItems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const steps = [
    {
      target: '[data-tour="dcf-header"]',
      title: "Data Classifications",
      content:
        "This page allows you to define and manage data classification levels such as Public, Internal, Confidential, and Restricted.",
      placement: "bottom",
    },
    {
      target: '[data-tour="dcf-create"]',
      title: "Create Classification",
      content:
        "Use this button to create a new data classification level that can be applied to data for access control and policy enforcement.",
      placement: "bottom",
    },
    {
      target: '[data-tour="dcf-toolbar"]',
      title: "Toolbar",
      content:
        "Use this section to refresh the data and view the total number of classifications available.",
      placement: "bottom",
    },
    {
      target: '[data-tour="dcf-table"]',
      title: "Classifications Table",
      content:
        "This table displays all classifications along with their description and current status (Active or Archived). Use Edit to update classification details. Use Archive to deactivate a classification when it is no longer required.",
      placement: "top",
    },
  ];

  // Pagination calculations
  const totalPages = Math.ceil(items.length / rowsPerPage);

  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;

  const currentItems = items.slice(indexOfFirstRow, indexOfLastRow);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <DataFlowNav />

      <div className="mx-5 min-h-screen bg-white rounded-lg p-5 my-3">
        {/* Header */}
        <div
          className="px-6 py-8 bg-[#2B245C] rounded-2xl shadow-lg hover:shadow-2xl transition-shadow duration-300"
          data-tour="dcf-header"
        >
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-cyan-50">
                Data Classifications
              </h1>
              <p className="mt-1 text-sm text-white">
                Create policy labels (Public / Internal / Confidential /
                Restricted) used for handling and access controls.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <GuideButton
                onClick={() => setTourOpen(true)}
                variant="primary"
                size="md"
                className="!from-blue-500 !to-blue-600 hover:!from-blue-400 hover:!to-blue-500 !text-white !border-blue-400/70 !shadow-blue-600/30"
              >
                Help
              </GuideButton>

              <button
                data-tour="dcf-create"
                onClick={() => guard(canCreate, router, openCreate)}
                className="rounded-lg bg-white text-[#2B245C] px-6 py-2.5 text-sm font-semibold shadow-md hover:shadow-lg hover:bg-gray-50 transition-all"
              >
                + New Classification
              </button>
            </div>
          </div>
        </div>

        <div className="py-5 space-y-5">
          {/* Toolbar */}
          <section
            className="rounded-2xl border border-[#2B245C] bg-white p-5 shadow-lg hover:shadow-2xl transition-shadow duration-300"
            data-tour="dcf-toolbar"
          >
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={fetchItems}
                className="rounded-lg border border-[#2B245C] bg-white px-3 py-1.5 text-sm font-medium text-[#2B245C] hover:bg-indigo-50 transition-all"
              >
                {loading ? "Refreshing…" : "Refresh"}
              </button>

              {canView && (
                <div className="text-xs text-gray-500">
                  {items.length} item{items.length === 1 ? "" : "s"}
                </div>
              )}

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
            data-tour="dcf-table"
          >
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-2xl font-semibold text-[#2B245C]">
                Classifications
              </h2>
              {canView && (
                <span className="text-sm text-gray-600">
                  Showing {items.length === 0 ? 0 : indexOfFirstRow + 1}–
                  {Math.min(indexOfLastRow, items.length)} of {items.length}
                </span>
              )}
            </div>

            <div className="overflow-auto rounded-lg border border-gray-800">
              <table className="min-w-full text-sm">
                <thead className="bg-[#2B245C] text-left text-white border-b border-gray-800">
                  <tr>
                    <th className="px-4 py-2 font-medium">Name</th>
                    <th className="px-4 py-2 font-medium">Description</th>
                    <th className="px-4 py-2 font-medium">Archived</th>
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
                        You don’t have permission to view classifications.
                      </td>
                    </tr>
                  ) : loading ? (
                    [...Array(4)].map((_, i) => (
                      <tr key={i}>
                        {Array.from({ length: 4 }).map((__, j) => (
                          <td key={j} className="px-4 py-3">
                            <div className="h-4 w-28 animate-pulse rounded bg-gray-100" />
                          </td>
                        ))}
                      </tr>
                    ))
                  ) : items.length === 0 ? (
                    <tr>
                      <td
                        className="px-4 py-6 text-center text-gray-600"
                        colSpan={4}
                      >
                        No classifications yet.
                      </td>
                    </tr>
                  ) : (
                    currentItems.map((it) => (
                      <tr key={it._id || it.id} className="hover:bg-gray-50">
                        <td className="px-4 py-2">{it.name}</td>
                        <td className="px-4 py-2">
                          {it.description || (
                            <span className="text-gray-400">—</span>
                          )}
                        </td>
                        <td className="px-4 py-2">
                          {it.archived ? (
                            <span className="inline-flex items-center rounded-full border border-gray-200 bg-gray-50 px-2 py-0.5 text-xs text-gray-700">
                              Archived
                            </span>
                          ) : (
                            <span className="inline-flex items-center rounded-full border border-green-200 bg-green-50 px-2 py-0.5 text-xs text-green-700">
                              Active
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-2">
                          <div className="flex flex-wrap gap-2">
                            <button
                              onClick={() =>
                                guard(canUpdate, router, () => startEdit(it))
                              }
                              className="rounded-lg border border-[#2B245C] bg-white px-2.5 py-1 text-xs font-medium text-[#2B245C] hover:bg-indigo-50 transition-all"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() =>
                                guard(canDelete, router, () => {
                                  setSelectedItem(it);
                                  setArchiveModalOpen(true);
                                })
                              }
                              className="rounded-lg border border-red-200 bg-white px-2.5 py-1 text-xs font-medium text-red-700 hover:bg-red-50 transition-all"
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
            onSubmit={(e) => {
              e.preventDefault();
              editingId ? updateItem() : createItem();
            }}
            className="space-y-5"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold text-[#2B245C]">
                {editingId
                  ? "Edit Data Classification"
                  : "Create New Data Classification"}
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

            <div className="grid grid-cols-1 gap-4">
              <FormField label="Name" required>
                <input
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Enter a classification name (e.g., Confidential)"
                  required
                  maxLength={200}
                />
              </FormField>

              <FormField label="Description" required>
                <textarea
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                  rows={3}
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                  placeholder="Describe how this classification should be handled and who is authorized to access it."
                  required
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
            setSelectedItem(null);
          }}
        >
          <div className="space-y-5">
            <h3 className="text-xl font-semibold text-[#2B245C]">
              Archive Data Classification
            </h3>

            <p className="text-sm text-gray-700">
              Are you sure you want to archive{" "}
              <span className="font-semibold">
                &ldquo;{selectedItem?.name}&rdquo;
              </span>
              ?
            </p>

            <p className="text-sm text-red-600">
              This action cannot be undone.
            </p>

            <div className="flex justify-end gap-2">
              <button
                className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm hover:bg-gray-50"
                onClick={() => {
                  setArchiveModalOpen(false);
                  setSelectedItem(null);
                }}
              >
                Cancel
              </button>

              <button
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
                onClick={() =>
                  patchArchived(selectedItem._id || selectedItem.id)
                }
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

/** Modal Component (same as your Data Categories page) */
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
