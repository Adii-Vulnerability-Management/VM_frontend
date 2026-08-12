import { useEffect, useState, useRef, useMemo } from "react";
import CustomAxios from "@/globalcomponents/CustomAxios";
import { baseurl } from "@/config/config";
import DataFlowNav from "../Nav";
import { useRouter } from "next/router";
import { can, guard } from "@/auth/auth-permissions";
import { initURL } from "BaseUrl";
import { toast } from "react-toastify";
import GuideButton from "@/components/Tour/GuideButton";
import Tour from "@/components/Tour/Tour";

const API = `${baseurl}/${initURL}/dataflow/subject-types`;

const pretty = (x) => JSON.stringify(x, null, 2);
const copy = (t) => navigator.clipboard?.writeText(t);

const FormField = ({ label, required = false, children, className = "" }) => (
  <div className={`flex flex-col ${className}`}>
    <label className="text-xs font-semibold text-gray-700 mb-2">
      {label}
      {required && <span className="text-red-500 ml-1">*</span>}
    </label>
    {children}
  </div>
);

export default function CreateDataSubjectTypePage() {
  const router = useRouter();

  const [form, setForm] = useState({ name: "", description: "", tags: [] });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [subjectTypes, setSubjectTypes] = useState([]);
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [listLoading, setListLoading] = useState(true);
  // create modal
  const [modalOpen, setModalOpen] = useState(false);
  // view json modal
  const [viewOpen, setViewOpen] = useState(false);
  const [viewItem, setViewItem] = useState(null);
  // edit modal
  const [editOpen, setEditOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  // archive UX
  const [archivingId, setArchivingId] = useState(null);
  const [showArchived, setShowArchived] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [tourOpen, setTourOpen] = useState(false);

  // Permissions
  const canView = can("privacy.read");
  const canCreate = can("privacy.create");
  const canUpdate = can("privacy.update");
  const canDelete = can("privacy.delete");

  const fetchSubjectTypes = async () => {
    try {
      setListLoading(true);
      const res = await CustomAxios.get(API);
      setSubjectTypes(res.data || []);
      setCurrentPage(1);
    } catch (e) {
      console.error("Failed to load data subject types", e);
      setError(e?.response?.data?.message || e.message || "Failed to load.");
    } finally {
      setListLoading(false);
    }
  };

  useEffect(() => {
    fetchSubjectTypes();
  }, []);

  const resetForm = () => setForm({ name: "", description: "", tags: [] });

  const openCreate = () => {
    setError("");
    resetForm();
    setModalOpen(true);
  };

  const openView = (item) => {
    setViewItem(item);
    setViewOpen(true);
  };

  const openEdit = (item) => {
    setError("");
    setEditItem(item);
    setForm({
      name: item?.name || "",
      description: item?.description || "",
      tags: Array.isArray(item?.tags) ? item.tags : [],
    });
    setEditOpen(true);
  };

  const closeAllModals = () => {
    setModalOpen(false);
    setEditOpen(false);
    setViewOpen(false);
    setViewItem(null);
    setEditItem(null);
    resetForm();
    setError("");
  };

  // CREATE
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      await CustomAxios.post(API, {
        name: form.name,
        description: form.description,
        tags: form.tags,
      });

      toast.success("Data Subject Type created successfully!");
      resetForm();
      await fetchSubjectTypes();
      setModalOpen(false);
    } catch (e) {
      const msg = e?.response?.data?.message || e.message || "Create failed.";
      setError(msg);
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  // UPDATE (edit)
  const updateSubjectType = async (id, payload) => {
    // Try PATCH first, then PUT
    try {
      return await CustomAxios.patch(`${API}/${id}`, payload);
    } catch (e) {
      // fallback to PUT
      return await CustomAxios.patch(`${API}/${id}`, payload);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editItem?._id) {
      const msg = "Missing _id for edit.";
      setError(msg);
      toast.error(msg);
      return;
    }

    setSaving(true);
    setError("");

    try {
      await updateSubjectType(editItem._id, {
        name: form.name,
        description: form.description,
        tags: form.tags,
      });

      toast.success("Data Subject Type updated successfully!");
      await fetchSubjectTypes();
      setEditOpen(false);
      setEditItem(null);
      resetForm();
    } catch (e) {
      const msg = e?.response?.data?.message || e.message || "Update failed.";
      setError(msg);
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  // ARCHIVE
  const archiveSubjectType = async (id) => {
    // Try common patterns in order
    try {
      return await CustomAxios.patch(`${API}/${id}/archive`, {});
    } catch (e1) {
      try {
        return await CustomAxios.patch(`${API}/${id}`, { archived: true });
      } catch (e2) {
        // fallback hard delete if that's what backend supports
        return await CustomAxios.delete(`${API}/${id}`);
      }
    }
  };

  const handleArchive = async (item) => {
    const id = item?._id;
    if (!id) return;

    setArchivingId(id);
    setError("");
    try {
      await archiveSubjectType(id);
      toast.success("Archived successfully!");
      await fetchSubjectTypes();
    } catch (e) {
      const msg = e?.response?.data?.message || e.message || "Archive failed.";
      setError(msg);
      toast.error(msg);
    } finally {
      setArchivingId(null);
    }
  };

  const confirmArchive = async () => {
    if (!selectedItem) return;

    try {
      await handleArchive(selectedItem);
    } finally {
      setConfirmOpen(false);
      setSelectedItem(null);
    }
  };

  const visibleRows = useMemo(() => {
    if (showArchived) return subjectTypes;
    return subjectTypes.filter((x) => !x?.archived && x?.status !== "archived");
  }, [subjectTypes, showArchived]);

  useEffect(() => {
    setCurrentPage(1);
  }, [showArchived]);

  // Pagination calculations
  const totalPages = Math.ceil(visibleRows.length / rowsPerPage);

  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;

  const currentRows = visibleRows.slice(indexOfFirstRow, indexOfLastRow);

  const steps = [
    {
      target: '[data-tour="dst-header"]',
      title: "Data Subject Types",
      content:
        "This page helps you create and manage data subject types, including their name, description, and tags.",
      placement: "bottom",
    },
    {
      target: '[data-tour="dst-create"]',
      title: "Create New Data Subject Type",
      content: "Use this button to add a new data subject type to the list.",
      placement: "bottom",
    },
    {
      target: '[data-tour="dst-toolbar"]',
      title: "Toolbar",
      content:
        "Use this section to refresh the list, show archived records, and review the total number of available items.",
      placement: "bottom",
    },
    {
      target: '[data-tour="dst-table"]',
      title: "Data Subject Types Table",
      content:
        "This table shows each data subject type with its description and tags.",
      placement: "top",
    },
    {
      target: '[data-tour="dst-table"]',
      title: "Action Buttons",
      content:
        "Use View JSON to review the full record details. Use Edit to update an item. Use Archive to archive an item that is no longer active.",
      placement: "top",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <DataFlowNav />

      <div className="mx-5 min-h-screen bg-white rounded-lg p-5 my-3">
        {/* Header */}
        <div
          className="px-6 py-8 bg-[#2B245C] rounded-2xl shadow-lg hover:shadow-2xl transition-shadow duration-300"
          data-tour="dst-header"
        >
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-cyan-50">
                Data Subject Types
              </h1>
              <p className="mt-1 text-sm text-white">
                Create and manage data subject types with name, descriptions,
                and tags.
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
                type="button"
                data-tour="dst-create"
                onClick={() => guard(canCreate, router, openCreate)}
                className="rounded-lg bg-white text-[#2B245C] px-6 py-2.5 text-sm font-semibold shadow-md hover:shadow-lg hover:bg-gray-50 transition-all"
              >
                + New Data Subject Type
              </button>
            </div>
          </div>
        </div>

        <div className="py-5 space-y-5">
          {/* Toolbar */}
          <section
            className="rounded-2xl border border-[#2B245C] bg-white p-5 shadow-lg hover:shadow-2xl transition-shadow duration-300"
            data-tour="dst-toolbar"
          >
            <div className="flex flex-wrap justify-between items-center">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={fetchSubjectTypes}
                  className="rounded-lg border border-[#2B245C] bg-white px-3 py-1.5 text-sm font-medium text-[#2B245C] hover:bg-indigo-50 transition-all"
                >
                  {listLoading ? "Refreshing…" : "Refresh"}
                </button>

                {canView && (
                  <div className="text-xs text-gray-500">
                    {visibleRows.length} item
                    {visibleRows.length === 1 ? "" : "s"}
                  </div>
                )}

                {error && (
                  <div className="ml-auto rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                    {error}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-3">
                <label className="inline-flex items-center gap-2 text-sm text-gray-700">
                  <input
                    type="checkbox"
                    className="h-4 w-4"
                    checked={showArchived}
                    onChange={(e) => setShowArchived(e.target.checked)}
                  />
                  Show archived
                </label>

                {listLoading && (
                  <span className="text-xs text-gray-400">Loading…</span>
                )}
              </div>
            </div>
          </section>

          {/* Table */}
          <section
            className="rounded-2xl border border-[#2B245C] bg-white p-6 shadow-lg hover:shadow-2xl transition-shadow duration-300"
            data-tour="dst-table"
          >
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-2xl font-semibold text-[#2B245C]">
                Data Subject Types
              </h2>
              {canView && (
                <span className="text-sm text-gray-600">
                  Showing {visibleRows.length === 0 ? 0 : indexOfFirstRow + 1}–
                  {Math.min(indexOfLastRow, visibleRows.length)} of{" "}
                  {visibleRows.length}
                </span>
              )}
            </div>

            <div className="overflow-auto rounded-lg border border-gray-800">
              <table className="min-w-full text-sm">
                <thead className="bg-[#2B245C] text-left text-white border-b border-gray-800">
                  <tr>
                    <th className="px-4 py-2 font-medium">Name</th>
                    <th className="px-4 py-2 font-medium">Description</th>
                    <th className="px-4 py-2 font-medium">Tags</th>
                    <th className="px-4 py-2 font-medium w-[220px]">Actions</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">
                  {!canView ? (
                    <tr>
                      <td
                        colSpan={4}
                        className="px-4 py-4 text-center text-red-600 font-medium"
                      >
                        You don’t have permission to view data subject types.
                      </td>
                    </tr>
                  ) : listLoading ? (
                    [...Array(4)].map((_, i) => (
                      <tr key={i}>
                        {Array.from({ length: 4 }).map((__, j) => (
                          <td key={j} className="px-4 py-3">
                            <div className="h-4 w-28 animate-pulse rounded bg-gray-100" />
                          </td>
                        ))}
                      </tr>
                    ))
                  ) : visibleRows.length === 0 ? (
                    <tr>
                      <td
                        className="px-4 py-6 text-center text-gray-600"
                        colSpan={4}
                      >
                        No data subject types yet.
                      </td>
                    </tr>
                  ) : (
                    currentRows.map((subject) => {
                      const isArchived =
                        !!subject?.archived || subject?.status === "archived";
                      return (
                        <tr
                          key={subject._id || subject.name}
                          className={
                            isArchived ? "bg-gray-50/70" : "hover:bg-gray-50"
                          }
                        >
                          <td className="px-4 py-2">
                            <div className="flex items-center gap-2">
                              <span
                                className={isArchived ? "text-gray-500" : ""}
                              >
                                {subject.name}
                              </span>
                              {isArchived && (
                                <span className="text-[10px] rounded-full border border-gray-200 bg-white px-2 py-0.5 text-gray-600">
                                  archived
                                </span>
                              )}
                            </div>
                          </td>

                          <td className="px-4 py-2 max-w-sm">
                            <div
                              className="truncate"
                              title={subject.description || ""}
                            >
                              {subject.description || (
                                <span className="text-gray-400">—</span>
                              )}
                            </div>
                          </td>

                          <td className="px-4 py-2">
                            {subject.tags && subject.tags.length > 0 ? (
                              <div className="flex flex-wrap gap-1">
                                {subject.tags.map((t) => (
                                  <span
                                    key={t}
                                    className="inline-flex items-center rounded-full border border-gray-200 bg-gray-50 px-2 py-0.5 text-xs"
                                  >
                                    {t}
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <span className="text-gray-400">—</span>
                            )}
                          </td>

                          <td className="px-4 py-2">
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() =>
                                  guard(canView, router, () =>
                                    openView(subject),
                                  )
                                }
                                className="rounded-lg border border-blue-600 bg-white px-2.5 py-1 text-xs font-medium text-blue-600 hover:bg-gray-50 whitespace-nowrap"
                              >
                                View
                              </button>

                              <button
                                type="button"
                                onClick={() =>
                                  guard(canUpdate, router, () =>
                                    openEdit(subject),
                                  )
                                }
                                className="rounded-lg border border-[#2B245C] bg-white px-2.5 py-1 text-xs font-medium text-[#2B245C] hover:bg-indigo-50 transition-all"
                                disabled={isArchived}
                                title={
                                  isArchived
                                    ? "Cannot edit archived item"
                                    : "Edit"
                                }
                              >
                                Edit
                              </button>

                              <button
                                type="button"
                                onClick={() =>
                                  guard(canDelete, router, () => {
                                    setSelectedItem(subject);
                                    setConfirmOpen(true);
                                  })
                                }
                                className="rounded-lg border border-red-600 bg-white px-2.5 py-1 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-60"
                                disabled={archivingId === subject._id}
                              >
                                {archivingId === subject._id
                                  ? "Archiving…"
                                  : "Archive"}
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {canView && visibleRows.length > 0 && (
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

      {/* CREATE Modal */}
      {modalOpen && (
        <Modal onClose={closeAllModals}>
          <SubjectTypeForm
            title="Create New Data Subject Type"
            form={form}
            setForm={setForm}
            error={error}
            saving={saving}
            onSubmit={(e) => guard(canCreate, router, () => handleSubmit(e))}
            onCancel={closeAllModals}
            primaryLabel={saving ? "Creating…" : "Create"}
          />
        </Modal>
      )}

      {/* EDIT Modal */}
      {editOpen && (
        <Modal
          onClose={() => {
            setEditOpen(false);
            setEditItem(null);
            resetForm();
            setError("");
          }}
        >
          <SubjectTypeForm
            title={`Edit: ${editItem?.name || ""}`}
            form={form}
            setForm={setForm}
            error={error}
            saving={saving}
            onSubmit={(e) =>
              guard(canUpdate, router, () => handleEditSubmit(e))
            }
            onCancel={() => {
              setEditOpen(false);
              setEditItem(null);
              resetForm();
              setError("");
            }}
            primaryLabel={saving ? "Saving…" : "Save changes"}
          />
        </Modal>
      )}

      {/* VIEW JSON Modal */}
      {viewOpen && (
        <Modal
          onClose={() => {
            setViewOpen(false);
            setViewItem(null);
          }}
        >
          <div className="space-y-5">
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-xl font-semibold text-[#2B245C]">
                Data Subject Type Details
              </h3>

              <div className="flex items-center gap-2">
                {/* <button
                  type="button"
                  className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm hover:bg-gray-50"
                  onClick={() => copy(pretty(viewItem))}
                >
                  Copy
                </button> */}
                <button
                  type="button"
                  className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm hover:bg-gray-50"
                  onClick={() => {
                    setViewOpen(false);
                    setViewItem(null);
                  }}
                >
                  Close
                </button>
              </div>
            </div>

            {/* <pre className="max-h-[70vh] overflow-auto whitespace-pre-wrap break-words rounded-xl bg-[#0b1020] p-4 text-[12.5px] text-[#d7e1ff]">
              {pretty(viewItem)}
            </pre> */}

            <div className="space-y-5">
              <div>
                <label className="block text-xs font-medium text-gray-500">
                  Name
                </label>
                <div className="mt-1 rounded-lg border bg-gray-50 px-3 py-2">
                  {viewItem?.name || "-"}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500">
                  Description
                </label>
                <div className="mt-1 rounded-lg border bg-gray-50 px-3 py-2">
                  {viewItem?.description || "-"}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500">
                  Tags
                </label>

                <div className="mt-2 flex flex-wrap gap-2">
                  {viewItem?.tags?.length ? (
                    viewItem.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full border border-gray-200 bg-gray-100 px-3 py-1 text-xs"
                      >
                        {tag}
                      </span>
                    ))
                  ) : (
                    <span className="text-gray-400">No tags available</span>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500">
                  Status
                </label>

                <div className="mt-1">
                  {viewItem?.archived ? (
                    <span className="inline-flex rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-700">
                      Archived
                    </span>
                  ) : (
                    <span className="inline-flex rounded-full bg-green-100 px-3 py-1 text-xs text-green-700">
                      Active
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Archive Modal */}
      {confirmOpen && (
        <Modal
          onClose={() => {
            setConfirmOpen(false);
            setSelectedItem(null);
          }}
        >
          <div className="space-y-5">
            <h3 className="text-xl font-semibold text-[#2B245C]">
              Archive Data Subject Type
            </h3>

            <p className="text-gray-700">
              Are you sure you want to archive{" "}
              <span className="font-semibold">
                &ldquo;{selectedItem?.name}&rdquo;
              </span>
              ?
            </p>

            <p className="text-sm text-red-600">
              This action cannot be undone.
            </p>

            <div className="flex justify-end gap-3">
              <button
                className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium hover:bg-gray-50"
                onClick={() => {
                  setConfirmOpen(false);
                  setSelectedItem(null);
                }}
              >
                Cancel
              </button>

              <button
                className="rounded-lg bg-red-600 px-4 py-2 text-white text-sm font-medium hover:bg-red-700"
                onClick={confirmArchive}
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

/* ---- Reusable form (Create/Edit) ---- */
function SubjectTypeForm({
  title,
  form,
  setForm,
  error,
  saving,
  onSubmit,
  onCancel,
  primaryLabel,
}) {
  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold text-[#2B245C]">{title}</h3>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm hover:bg-gray-50"
        >
          Close
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        <FormField label="Name" required>
          <input
            type="text"
            required
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Enter a data subject type (e.g., Customer)"
          />
        </FormField>

        <FormField label="Description">
          <textarea
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
            rows={3}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="Describe who this data subject type represents and the personal data typically associated with it."
          />
        </FormField>

        <FormField label="Tags (CSV)">
          <input
            type="text"
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm mb-1"
            value={form.tags.join(", ")}
            onChange={(e) =>
              setForm({
                ...form,
                tags: e.target.value
                  .split(",")
                  .map((s) => s.trim())
                  .filter(Boolean),
              })
            }
            placeholder="Enter tags separated by commas (e.g.,  B2C, External, Internal)"
          />
          {/* <p className="text-xs text-gray-500">
            Comma-separated tags (e.g., B2C, internal, external).
          </p> */}
        </FormField>
      </div>

      {error && <p className="text-red-600 text-sm">{error}</p>}

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={saving}
          className="rounded-lg bg-[#2B245C] px-4 py-2 text-sm font-semibold text-white shadow-md hover:shadow-lg hover:bg-indigo-600 disabled:opacity-60 transition-all"
        >
          {primaryLabel}
        </button>

        <button
          type="button"
          className="rounded-lg border border-[#2B245C] bg-white px-4 py-2 text-sm font-medium text-[#2B245C] hover:bg-indigo-50 transition-all"
          onClick={onCancel}
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

/** Simple Tailwind modal */
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
