// pages/admin/dataElements/create.js
import { useEffect, useMemo, useState, useRef } from "react";
import CustomAxios from "@/globalcomponents/CustomAxios";
import { baseurl } from "@/config/config";
import Select from "react-select";
import DataFlowNav from "../Nav";
import { useRouter } from "next/router";
import { can, guard } from "@/auth/auth-permissions";
import { initURL } from "BaseUrl";
import { toast } from "react-toastify";
import GuideButton from "@/components/Tour/GuideButton";
import Tour from "@/components/Tour/Tour";

// API Endpoints for fetching data
const DATA_CATEGORIES_API = `${baseurl}/${initURL}/dataflow/categories`;
const DATA_CLASSIFICATIONS_API = `${baseurl}/${initURL}/dataflow/classifications`;
const DATA_SUBJECTS_API = `${baseurl}/${initURL}/dataflow/subject-types`;
const DATA_ELEMENTS_API = `${baseurl}/${initURL}/dataflow/elements`;

const FormField = ({ label, required = false, children, className = "" }) => (
  <div className={`flex flex-col ${className}`}>
    <label className="text-xs font-semibold text-gray-700 mb-2">
      {label}
      {required && <span className="text-red-500 ml-1">*</span>}
    </label>
    {children}
  </div>
);

export default function CreateDataElementPage() {
  const router = useRouter();

  const emptyForm = useMemo(
    () => ({
      name: "",
      dataCategory: [], // react-select options array (categories)
      dataClassification: [], // react-select options array (classifications)
      dataSubjectTypes: [], // react-select options array (subjects)
      description: "",
    }),
    [],
  );

  const [form, setForm] = useState(emptyForm);
  const [dataCategories, setDataCategories] = useState([]);
  const [dataClassifications, setDataClassifications] = useState([]);
  const [dataSubjects, setDataSubjects] = useState([]);
  const [elements, setElements] = useState([]);
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [loading, setLoading] = useState(true); // for reference data
  const [listLoading, setListLoading] = useState(true); // for elements list
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  // modal
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedDelete, setSelectedDelete] = useState(null);
  // edit state
  const [editingId, setEditingId] = useState(null);
  const [tourOpen, setTourOpen] = useState(false);

  // Permissions
  const canView = can("privacy.read");
  const canCreate = can("privacy.create");
  const canUpdate = can("privacy.update");
  const canDelete = can("privacy.delete");

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
  };

  const openCreate = () => {
    setError("");
    resetForm();
    setModalOpen(true);
  };

  // Fetch reference data (categories/classifications/subjects)
  useEffect(() => {
    const fetchReferenceData = async () => {
      try {
        const [categories, classifications, subjects] = await Promise.all([
          CustomAxios.get(DATA_CATEGORIES_API),
          CustomAxios.get(DATA_CLASSIFICATIONS_API),
          CustomAxios.get(DATA_SUBJECTS_API),
        ]);

        setDataCategories(categories.data || []);
        setDataClassifications(classifications.data || []);
        setDataSubjects(subjects.data || []);
      } catch (e) {
        setError(
          e?.response?.data?.message || e.message || "Failed to load data.",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchReferenceData();
  }, []);

  // Fetch existing data elements for the dashboard table
  const fetchElements = async () => {
    try {
      setListLoading(true);
      const res = await CustomAxios.get(DATA_ELEMENTS_API);
      setElements(res.data || []);
      setCurrentPage(1);
    } catch (e) {
      setError(
        e?.response?.data?.message || e.message || "Failed to load elements.",
      );
    } finally {
      setListLoading(false);
    }
  };

  useEffect(() => {
    fetchElements();
  }, []);

  // Pagination calculations
  const totalPages = Math.ceil(elements.length / rowsPerPage);

  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;

  const currentElements = elements.slice(indexOfFirstRow, indexOfLastRow);

  // chips
  const ChipList = ({ arr }) => {
    const list = Array.isArray(arr) ? arr : [];
    if (!list.length) return <span className="text-gray-400">—</span>;
    return (
      <div className="flex flex-wrap gap-1">
        {list.map((x, i) => (
          <span
            key={`${x}-${i}`}
            className="inline-flex items-center rounded-full border border-gray-200 bg-gray-50 px-2 py-0.5 text-[11px]"
          >
            {x}
          </span>
        ))}
      </div>
    );
  };

  const toOptions = (arr, type) => {
    // Convert API populated docs to react-select {value,label}
    const list = Array.isArray(arr) ? arr : [];
    return list
      .map((o) => {
        const id = o?._id || o?.id;
        const name =
          type === "category"
            ? o?.label || o?.name || o?.key
            : o?.name || o?.label;
        if (!id || !name) return null;
        return { value: id, label: name };
      })
      .filter(Boolean);
  };

  const startEdit = (el) => {
    setError("");
    setEditingId(el._id);

    setForm({
      name: el?.name || "",
      description: el?.description || "",
      dataCategory: toOptions(el?.categories, "category"),
      dataClassification: toOptions(el?.classifications, "classification"),
      dataSubjectTypes: toOptions(el?.subjects, "subject"),
    });

    setModalOpen(true);
  };

  const createItem = async () => {
    setSaving(true);
    setError("");

    try {
      const trimmedName = form.name.trim();
      const trimmedDescription = form.description.trim();

      const payload = {
        subjects: form.dataSubjectTypes.map((opt) => opt.value),
        categories: form.dataCategory.map((opt) => opt.value),
        classifications: form.dataClassification.map((opt) => opt.value),
        name: trimmedName,
        description: trimmedDescription,
        dataType: "string",
      };

      await CustomAxios.post(DATA_ELEMENTS_API, payload);

      toast.success("Data Element created successfully!");
      await fetchElements();
      resetForm();
      setModalOpen(false);
    } catch (e) {
      const msg = e?.response?.data?.message || e.message || "Create failed.";
      setError(msg);
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const updateItem = async () => {
    if (!editingId) return;

    setSaving(true);
    setError("");

    try {
      const trimmedName = form.name.trim();
      const trimmedDescription = form.description.trim();

      const payload = {
        subjects: form.dataSubjectTypes.map((opt) => opt.value),
        categories: form.dataCategory.map((opt) => opt.value),
        classifications: form.dataClassification.map((opt) => opt.value),
        name: trimmedName,
        description: trimmedDescription,
        dataType: "string",
      };

      await CustomAxios.patch(`${DATA_ELEMENTS_API}/${editingId}`, payload);

      toast.success("Data Element updated successfully!");
      await fetchElements();
      resetForm();
      setModalOpen(false);
    } catch (e) {
      const msg = e?.response?.data?.message || e.message || "Update failed.";
      setError(msg);
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };
  const deleteItem = async (id) => {
    try {
      setError("");
      await CustomAxios.delete(`${DATA_ELEMENTS_API}/${id}`);
      toast.success("Data Element deleted successfully!");
      await fetchElements();
      setCurrentPage(1);
    } catch (e) {
      const msg = e?.response?.data?.message || e.message || "Delete failed.";
      setError(msg);
      toast.error(msg);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    editingId ? updateItem() : createItem();
  };

  const steps = [
    {
      target: '[data-tour="de-header"]',
      title: "Data Elements",
      content:
        "This page allows you to create and manage data elements and link them to categories, classifications, and subject types.",
      placement: "bottom",
    },
    {
      target: '[data-tour="de-create"]',
      title: "Create Data Element",
      content: "Use this button to add a new data element to the list.",
      placement: "bottom",
    },
    {
      target: '[data-tour="de-toolbar"]',
      title: "Toolbar",
      content:
        "Use this section to refresh the list and review the total number of available data elements.",
      placement: "bottom",
    },
    {
      target: '[data-tour="de-table"]',
      title: "Elements Table",
      content:
        "This table displays each data element along with its category, classification, subject type, and description. Use Edit to update an existing data element. Use Delete to remove a data element that is no longer needed.",
      placement: "top",
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-sm">
        Loading…
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <DataFlowNav />

      <div className="mx-5 min-h-screen bg-white rounded-lg p-5 my-3">
        {/* Header */}
        <div
          className="px-6 py-8 bg-[#2B245C] rounded-2xl shadow-lg hover:shadow-2xl transition-shadow duration-300"
          data-tour="de-header"
        >
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-cyan-50">Data Elements</h1>
              <p className="mt-1 text-sm text-white">
                Define specific fields and map them to categories,
                classifications, and subject types.
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
                data-tour="de-create"
                onClick={() => guard(canCreate, router, openCreate)}
                className="rounded-lg bg-white text-[#2B245C] px-6 py-2.5 text-sm font-semibold shadow-md hover:shadow-lg hover:bg-gray-50 transition-all"
              >
                + New Data Element
              </button>
            </div>
          </div>
        </div>

        <div className="py-5 space-y-5">
          {/* Toolbar */}
          <section
            className="rounded-2xl border border-[#2B245C] bg-white p-5 shadow-lg hover:shadow-2xl transition-shadow duration-300"
            data-tour="de-toolbar"
          >
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={fetchElements}
                className="rounded-lg border border-[#2B245C] bg-white px-3 py-1.5 text-sm font-medium text-[#2B245C] hover:bg-indigo-50 transition-all"
              >
                {listLoading ? "Refreshing…" : "Refresh"}
              </button>

              {canView && (
                <span className="text-xs text-gray-500">
                  {elements.length} item{elements.length === 1 ? "" : "s"}
                </span>
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
            data-tour="de-table"
          >
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-2xl font-semibold text-[#2B245C]">
                Elements
              </h2>
              {canView && (
                <span className="text-sm text-gray-600">
                  Showing {elements.length === 0 ? 0 : indexOfFirstRow + 1}–
                  {Math.min(indexOfLastRow, elements.length)} of{" "}
                  {elements.length}
                </span>
              )}
            </div>

            <div className="overflow-auto rounded-lg border border-gray-800">
              <table className="min-w-full text-sm">
                <thead className="bg-[#2B245C] text-left text-white border-b border-gray-800">
                  <tr>
                    <th className="px-4 py-2 font-medium">Name</th>
                    <th className="px-4 py-2 font-medium">Categories</th>
                    <th className="px-4 py-2 font-medium">Classifications</th>
                    <th className="px-4 py-2 font-medium">Subject Types</th>
                    <th className="px-4 py-2 font-medium">Description</th>
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
                        You don’t have permission to view data elements.
                      </td>
                    </tr>
                  ) : listLoading ? (
                    [...Array(4)].map((_, i) => (
                      <tr key={i}>
                        {Array.from({ length: 6 }).map((__, j) => (
                          <td key={j} className="px-4 py-3">
                            <div className="h-4 w-28 animate-pulse rounded bg-gray-100" />
                          </td>
                        ))}
                      </tr>
                    ))
                  ) : elements.length === 0 ? (
                    <tr>
                      <td
                        className="px-4 py-6 text-center text-gray-600"
                        colSpan={6}
                      >
                        No data elements yet.
                      </td>
                    </tr>
                  ) : (
                    currentElements.map((el) => {
                      const categories =
                        el.categories?.map((o) => o?.name).filter(Boolean) ||
                        [];
                      const classifications =
                        el.classifications
                          ?.map((o) => o?.name)
                          .filter(Boolean) || [];
                      const subjects =
                        el.subjects?.map((o) => o?.name).filter(Boolean) || [];

                      return (
                        <tr key={el._id} className="hover:bg-gray-50">
                          <td className="px-4 py-2">
                            {el.name || (
                              <span className="text-gray-400">—</span>
                            )}
                          </td>
                          <td className="px-4 py-2">
                            <ChipList arr={categories} />
                          </td>
                          <td className="px-4 py-2">
                            <ChipList arr={classifications} />
                          </td>
                          <td className="px-4 py-2">
                            <ChipList arr={subjects} />
                          </td>
                          <td className="px-4 py-2 max-w-sm">
                            <div
                              className="truncate"
                              title={el.description || ""}
                            >
                              {el.description || (
                                <span className="text-gray-400">—</span>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-2">
                            <div className="flex flex-wrap gap-2">
                              <button
                                type="button"
                                onClick={() =>
                                  guard(canUpdate, router, () => startEdit(el))
                                }
                                className="rounded-lg border border-[#2B245C] bg-white px-2.5 py-1 text-xs font-medium text-[#2B245C] hover:bg-indigo-50 transition-all"
                              >
                                Edit
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  guard(canDelete, router, () => {
                                    setSelectedDelete(el);
                                    setDeleteModalOpen(true);
                                  })
                                }
                                className="rounded-lg border border-red-200 bg-white px-2.5 py-1 text-xs font-medium text-red-700 hover:bg-red-50 transition-all"
                              >
                                Delete
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
            {canView && elements.length > 0 && (
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
                    className="rounded-lg bg-[#2B245C] text-white px-4 py-2 text-sm font-semibold shadow-md hover:shadow-lg hover:bg-opacity-90 disabled:opacity-50"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((page) => page - 1)}
                  >
                    Prev
                  </button>

                  <span className="text-sm">
                    Page {currentPage} of {totalPages || 1}
                  </span>

                  <button
                    className="rounded-lg bg-[#2B245C] text-white px-4 py-2 text-sm font-semibold shadow-md hover:shadow-lg hover:bg-opacity-90 disabled:opacity-50"
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
            setError("");
          }}
        >
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold text-[#2B245C]">
                {editingId ? "Edit Data Element" : "Create New Data Element"}
              </h3>
              <button
                type="button"
                onClick={() => {
                  setModalOpen(false);
                  resetForm();
                  setError("");
                }}
                className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm hover:bg-gray-50"
              >
                Close
              </button>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormField label="Name" required>
                <input
                  type="text"
                  required
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Enter a data element name (e.g., Email Address)"
                />
              </FormField>

              <FormField label="Data Category" required>
                <Select
                  isMulti
                  options={dataCategories.map((c) => ({
                    value: c._id,
                    label: c.label || c.name || c.key,
                  }))}
                  value={form.dataCategory}
                  onChange={(selected) =>
                    setForm({ ...form, dataCategory: selected || [] })
                  }
                  classNames={{
                    singleValue: () => "text-sm text-gray-900",
                    placeholder: () => "text-sm text-gray-100",
                    input: () => "text-sm text-gray-900",
                    menu: () =>
                      "mt-1 rounded-xl border border-gray-300 shadow-lg",
                  }}
                  placeholder="Select Data Categories"
                />
              </FormField>

              <FormField label="Data Classification" required>
                <Select
                  isMulti
                  options={dataClassifications.map((c) => ({
                    value: c._id,
                    label: c.name,
                  }))}
                  value={form.dataClassification}
                  onChange={(selected) =>
                    setForm({ ...form, dataClassification: selected || [] })
                  }
                  classNames={{
                    singleValue: () => "text-sm text-gray-900",
                    placeholder: () => "text-sm text-gray-100",
                    input: () => "text-sm text-gray-900",
                    menu: () =>
                      "mt-1 rounded-xl border border-gray-300 shadow-lg",
                  }}
                  placeholder="Select Data Classifications"
                />
              </FormField>

              <FormField label="Data Subject Types" required>
                <Select
                  isMulti
                  options={dataSubjects.map((s) => ({
                    value: s._id,
                    label: s.name,
                  }))}
                  value={form.dataSubjectTypes}
                  onChange={(selected) =>
                    setForm({ ...form, dataSubjectTypes: selected || [] })
                  }
                  classNames={{
                    singleValue: () => "text-sm text-gray-900",
                    placeholder: () => "text-sm text-gray-100",
                    input: () => "text-sm text-gray-900",
                    menu: () =>
                      "mt-1 rounded-xl border border-gray-300 shadow-lg",
                  }}
                  placeholder="Select Data Subject Types"
                />
              </FormField>

              <FormField label="Description" required className="md:col-span-2">
                <textarea
                  required
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                  rows={3}
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                  placeholder="Describe the purpose and contents of this data element."
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
                  resetForm();
                  setError("");
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

      {/* Delete Modal */}
      {deleteModalOpen && (
        <Modal
          onClose={() => {
            setDeleteModalOpen(false);
            setSelectedDelete(null);
          }}
        >
          <div className="space-y-5">
            <h3 className="text-xl font-semibold text-[#2B245C]">
              Delete Data Element
            </h3>

            <p className="mt-2 text-sm text-gray-600">
              Are you sure you want to delete{" "}
              <span className="font-semibold text-gray-900">
                {selectedDelete?.name}
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
                  setDeleteModalOpen(false);
                  setSelectedDelete(null);
                }}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium hover:bg-gray-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={async () => {
                  await deleteItem(selectedDelete._id);
                  setDeleteModalOpen(false);
                  setSelectedDelete(null);
                }}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </Modal>
      )}

      <Tour steps={steps} open={tourOpen} onClose={() => setTourOpen(false)} />
    </div>
  );
}

/** Simple Tailwind modal (same pattern as your reference page) */
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
