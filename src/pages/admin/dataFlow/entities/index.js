import { useEffect, useMemo, useState, useRef } from "react";
import CustomAxios from "@/globalcomponents/CustomAxios"; // Axios instance
import DataFlowNav from "../Nav"; // Assuming you have a navigation component
import { baseurl, initURL } from "@/config/config"; // Corrected base URL for API
import GuideButton from "@/components/Tour/GuideButton";
import Tour from "@/components/Tour/Tour";
import SelectRegion from "@/components/dataflow/SelectRegion";

const API = `${baseurl}/${initURL}/dataflow/entities`; // Adjusted API endpoint for Entities

export default function EntitiesPage() {
  const [isClient, setIsClient] = useState(false);

  const [items, setItems] = useState([]);
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [tourOpen, setTourOpen] = useState(false);

  // form state (create/edit)
  const emptyForm = useMemo(
    () => ({
      name: "",
      entityType: "Controller", // Default entity type
      dataProcessingActivities: [], // Initially set as empty array
      primaryOperatingLocation: "",
      dataProtectionOfficer: "",
      status: "Active",
    }),
    [],
  );
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);

  // modal state
  const [modalOpen, setModalOpen] = useState(false);

  // Fetch all entities from the API
  const fetchItems = async () => {
    setLoading(true);
    try {
      const res = await CustomAxios.get(API);
      const list = res.data || [];
      setItems(list);
      setCurrentPage(1);
    } catch (e) {
      setError(e?.response?.data?.message || e.message || "Failed to load.");
    } finally {
      setLoading(false);
    }
  };

  // Fetch a single entity (for edit purposes)
  const fetchOne = async (id) => {
    try {
      const res = await CustomAxios.get(`${API}/${id}`);
      setForm({
        name: res.data.name || "",
        entityType: res.data.entityType || "Controller",
        dataProcessingActivities: res.data.dataProcessingActivities || [], // Ensuring it's an array
        primaryOperatingLocation: res.data.primaryOperatingLocation || "",
        dataProtectionOfficer: res.data.dataProtectionOfficer || "",
        status: res.data.status || "Active",
      });
    } catch (e) {
      setError(
        e?.response?.data?.message || e.message || "Failed to load entity.",
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

  // Create a new entity
  const createItem = async () => {
    try {
      setSaving(true);
      await CustomAxios.post(API, { ...form });
      resetForm();
      setModalOpen(false);
      fetchItems();
    } catch (e) {
      setError(e?.response?.data?.message || e.message || "Create failed.");
    } finally {
      setSaving(false);
    }
  };

  // Edit an existing entity
  const startEdit = (entity) => {
    setEditingId(entity._id);
    setForm({
      name: entity.name,
      entityType: entity.entityType,
      dataProcessingActivities: entity.dataProcessingActivities,
      primaryOperatingLocation: entity.primaryOperatingLocation,
      dataProtectionOfficer: entity.dataProtectionOfficer,
      status: entity.status,
    });
    setModalOpen(true);
  };

  // Update an entity
  const updateItem = async () => {
    try {
      setSaving(true);
      await CustomAxios.patch(`${API}/${editingId}`, { ...form });
      resetForm();
      setModalOpen(false);
      fetchItems();
    } catch (e) {
      setError(e?.response?.data?.message || e.message || "Update failed.");
    } finally {
      setSaving(false);
    }
  };

  // Archive/unarchive an entity
  const patchArchived = async (id) => {
    try {
      await CustomAxios.patch(`${API}/${id}/archive`, { archived: true });
      fetchItems();
    } catch (e) {
      setError(
        e?.response?.data?.message || e.message || "Archive toggle failed.",
      );
    }
  };

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Fetch data on component mount (client only)
  useEffect(() => {
    if (isClient) fetchItems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isClient]);

  // Pagination calculations
  const rows = Array.isArray(items) ? items : [];

  const totalPages = Math.ceil(rows.length / rowsPerPage);

  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;

  const currentRows = rows.slice(indexOfFirstRow, indexOfLastRow);

  if (!isClient) return null;

  const steps = [
    {
      target: '[data-tour="ent-header"]',
      title: "Entities",
      content:
        "This page allows you to create and manage entities involved in data processing.",
      placement: "bottom",
    },
    {
      target: '[data-tour="ent-create"]',
      title: "Create Entity",
      content: "Use this button to add a new entity.",
      placement: "bottom",
    },
    {
      target: '[data-tour="ent-table"]',
      title: "Entities Table",
      content:
        "This table displays each entity with its processing activities, current status, and available actions.",
      placement: "top",
    },
    {
      target: '[data-tour="ent-table"]',
      title: "Action Buttons",
      content:
        "Use Edit to update entity details. Use Archive to archive an entity that is no longer active.",
      placement: "top",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <DataFlowNav />

      {/* Header */}
      <div className="bg-white rounded-lg p-5 my-3 mx-5">
        <div
          className="px-6 py-8 bg-[#2B245C] rounded-2xl shadow-lg hover:shadow-2xl transition-shadow duration-300"
          data-tour="ent-header"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-cyan-50">Entities</h1>
              <p className="mt-1 text-sm text-white">
                Manage your entities here.
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
                data-tour="ent-create"
                onClick={openCreate}
                className="rounded-lg bg-white text-[#2B245C] px-6 py-2.5 text-sm font-semibold shadow-md hover:shadow-lg hover:bg-gray-100 transition-all"
              >
                + New Entity
              </button>
            </div>
          </div>
        </div>

        <div className="py-5 space-y-5">
          {/* Table */}
          <section
            className="rounded-2xl border border-[#2B245C] bg-white p-6 shadow-lg hover:shadow-2xl transition-shadow duration-300"
            data-tour="ent-table"
          >
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-[#2B245C]">Entities</h2>
              <span className="text-sm text-gray-600">
                Showing {rows.length === 0 ? 0 : indexOfFirstRow + 1}–
                {Math.min(indexOfLastRow, rows.length)} of {rows.length}
              </span>
            </div>

            <div className="overflow-auto rounded-lg border border-gray-500">
              <table className="min-w-full text-sm">
                <thead className="bg-[#2B245C] text-left text-white border-b border-gray-500">
                  <tr>
                    <th className="px-4 py-2 font-medium">Name</th>
                    <th className="px-4 py-2 font-medium">
                      Data Processing Activities
                    </th>
                    <th className="px-4 py-2 font-medium">Status</th>
                    <th className="px-4 py-2 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {loading ? (
                    <tr>
                      <td className="px-4 py-6 text-center" colSpan={4}>
                        Loading...
                      </td>
                    </tr>
                  ) : rows.length === 0 ? (
                    <tr>
                      <td
                        className="px-4 py-6 text-center text-gray-600"
                        colSpan={4}
                      >
                        No entities yet.
                      </td>
                    </tr>
                  ) : (
                    currentRows.map((entity) => (
                      <tr key={entity._id} className="hover:bg-gray-50">
                        <td className="px-4 py-2">{entity.name}</td>
                        <td className="px-4 py-2">
                          {entity.dataProcessingActivities}
                        </td>
                        <td className="px-4 py-2">
                          <span
                            className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs ${
                              entity.status === "Active"
                                ? "bg-green-100 text-green-700"
                                : "bg-red-100 text-red-700"
                            }`}
                          >
                            {entity.status}
                          </span>
                        </td>
                        <td className="px-4 py-2">
                          <div className="flex flex-wrap gap-2">
                            <button
                              onClick={() => startEdit(entity)}
                              className="rounded-lg border border-[#2B245C] bg-white px-2.5 py-1.5 text-xs font-medium text-[#2B245C] hover:bg-blue-50 transition-all"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => patchArchived(entity._id)}
                              className="rounded-lg border border-red-200 bg-white px-2.5 py-1.5 text-xs font-medium text-red-700 hover:bg-red-50"
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
            {rows.length > 0 && (
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
        <Modal onClose={() => setModalOpen(false)}>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              editingId ? updateItem() : createItem();
            }}
            className="space-y-4"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold text-[#2B245C]">
                {editingId ? "Edit Entity" : "Create New Entity"}
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

            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
              <div>
                <label className="block text-xs font-medium text-gray-600">
                  Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                  placeholder="Entity Name"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600">
                  Entity Type *
                </label>
                <select
                  name="entityType"
                  value={form.entityType}
                  onChange={(e) =>
                    setForm({ ...form, entityType: e.target.value })
                  }
                  required
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                >
                  <option value="Controller">Controller</option>
                  <option value="Processor">Processor</option>
                  <option value="JointController">Joint Controller</option>
                </select>
              </div>

              <div className="md:col-span-3">
                <label className="block text-xs font-medium text-gray-600">
                  Data Processing Activities
                </label>
                <textarea
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                  rows={3}
                  value={form.dataProcessingActivities}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      dataProcessingActivities: e.target.value
                        .split(",")
                        .map((item) => item.trim()), // Convert to array
                    })
                  }
                  placeholder="Enter data processing activities (comma-separated)"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600"></label>
              <SelectRegion
                value={form.primaryOperatingLocation}
                onChange={(code) =>
                  setForm({ ...form, primaryOperatingLocation: code })
                }
                className="w-full"
                label="Primary Operating Location"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600">
                Data Protection Officer
              </label>
              <input
                type="text"
                name="dataProtectionOfficer"
                value={form.dataProtectionOfficer}
                onChange={(e) =>
                  setForm({ ...form, dataProtectionOfficer: e.target.value })
                }
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                placeholder="Name of Data Protection Officer"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600">
                Status
              </label>
              <select
                name="status"
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
              >
                <option value="Active">Active</option>
                <option value="Archived">Archived</option>
              </select>
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                disabled={saving}
                className="rounded-lg bg-[#2B245C] text-white px-4 py-2 text-sm font-semibold shadow-md hover:shadow-lg hover:bg-opacity-90 transition-all disabled:opacity-60"
              >
                {saving ? "Saving..." : editingId ? "Update" : "Create"}
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
      <Tour steps={steps} open={tourOpen} onClose={() => setTourOpen(false)} />
    </div>
  );
}

// Modal Component
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
