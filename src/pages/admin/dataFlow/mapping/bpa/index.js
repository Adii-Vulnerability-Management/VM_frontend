import React, { useEffect, useState, useRef } from "react";
import CustomAxios from "@/globalcomponents/CustomAxios";
import { baseurl, initURL } from "@/config/config";
import DataFlowNav from "../../Nav";
import { useRouter } from "next/router";
import { can, guard } from "@/auth/auth-permissions";
import Select from "react-select";
import SelectRegion from "@/components/dataflow/SelectRegion";
import RemoteSelect from "@/components/dataflow/RemoteSelect";
import { toast } from "react-toastify";
import GuideButton from "@/components/Tour/GuideButton";
import Tour from "@/components/Tour/Tour";

/** Reference APIs (same pattern as Data Elements page) */
const DATA_PURPOSES_API = `${baseurl}/${initURL}/dataflow/purposes`;
const DATA_SUBJECTS_API = `${baseurl}/${initURL}/dataflow/subject-types`;
const DATA_CATEGORIES_API = `${baseurl}/${initURL}/dataflow/categories`;

const FormField = ({ label, required = false, children, className = "" }) => (
  <div className={`flex flex-col ${className}`}>
    <label className="text-xs font-semibold text-gray-700 mb-2">
      {label}
      {required && <span className="text-red-500 ml-1">*</span>}
    </label>
    {children}
  </div>
);

/** Simple Tailwind modal */
function Modal({ children, onClose }) {
  const panelRef = useRef(null);

  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKey = (e) => {
      if (e.key === "Escape") onCloseRef.current?.();
    };
    document.addEventListener("keydown", onKey);

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
          className="w-full max-w-3xl rounded-2xl border border-gray-200 bg-white p-5 shadow-xl outline-none"
          onClick={(e) => e.stopPropagation()}
        >
          {children}
        </div>
      </div>
    </div>
  );
}

export default function BpaPage() {
  const router = useRouter();

  const apiBase = `${baseurl}/${initURL}/dataflow/bpas`;
  const [items, setItems] = useState([]);
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // ✅ single-select: store ONE option (or null)
  const [form, setForm] = useState({
    name: "",
    description: "",
    role: "controller",
    purpose: [], // Updated for multi-select (array instead of null)
    dataSubject: null,
    dataCategory: null,
    region: null,
  });

  // dropdown options
  const [purposeOptions, setPurposeOptions] = useState([]);
  const [subjectOptions, setSubjectOptions] = useState([]);
  const [categoryOptions, setCategoryOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [archiveModalOpen, setArchiveModalOpen] = useState(false);
  const [activityToArchive, setActivityToArchive] = useState(null);
  const [tourOpen, setTourOpen] = useState(false);

  // Permissions
  const canView = can("privacy.read");
  const canCreate = can("privacy.create");
  const canDelete = can("privacy.delete");

  // Fetch dropdown reference data
  useEffect(() => {
    const fetchRefs = async () => {
      try {
        const [purposesRes, subjectsRes, categoriesRes] = await Promise.all([
          CustomAxios.get(DATA_PURPOSES_API),
          CustomAxios.get(DATA_SUBJECTS_API),
          CustomAxios.get(DATA_CATEGORIES_API),
        ]);

        const purposes = purposesRes.data || [];
        const subjects = subjectsRes.data || [];
        const categories = categoriesRes.data || [];

        setPurposeOptions(
          purposes
            .map((p) => ({
              value: p._id || p.id || p.key || p.name,
              label: p.name || p.label || p.key,
            }))
            .filter((x) => x.value && x.label),
        );

        setSubjectOptions(
          subjects
            .map((s) => ({
              value: s._id || s.id || s.key || s.name,
              label: s.name || s.label || s.key,
            }))
            .filter((x) => x.value && x.label),
        );

        setCategoryOptions(
          categories
            .map((c) => ({
              value: c._id || c.id || c.key || c.name,
              label: c.label || c.name || c.key,
            }))
            .filter((x) => x.value && x.label),
        );
      } catch (e) {
        setError(
          e?.response?.data?.message ||
            e.message ||
            "Failed to load reference data",
        );
      }
    };

    fetchRefs();
  }, []);

  async function load() {
    setError("");
    try {
      setLoading(true);
      const res = await CustomAxios.get(apiBase);
      setItems(res.data || []);
      setCurrentPage(1);
    } catch (e) {
      setError(
        e?.response?.data?.message || e.message || "Failed to load activities",
      );
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    load();
  }, []);

  async function create(e) {
    e.preventDefault();
    setError("");
    try {
      setSaving(true);

      // ✅ single-select payload (send label strings so chips show nicely)
      const body = {
        name: form.name,
        description: form.description || undefined,
        role: form.role,
        purposes: form.purpose.length
          ? form.purpose.map((p) => p.label)
          : undefined, // Handling multi-select
        dataSubjects: form.dataSubject ? [form.dataSubject.label] : undefined,
        dataCategories: form.dataCategory
          ? [form.dataCategory.label]
          : undefined,

        // ✅ NEW: region
        regionCode: form.region || undefined,
        // optional friendly list for chips/UI (only if your backend stores it)
        regions: form.region ? [form.region] : undefined,
      };

      await CustomAxios.post(apiBase, body);

      setForm({
        name: "",
        description: "",
        role: "controller",
        purpose: [], // Reset to empty array for multi-select
        dataSubject: null,
        dataCategory: null,
        region: null,
      });

      setModalOpen(false);
      load();
    } catch (e) {
      setError(e?.response?.data?.message || e.message || "Save failed");
    } finally {
      setSaving(false);
    }
  }

  async function archive(id) {
    try {
      await CustomAxios.delete(`${apiBase}/${id}`);
      toast.success("Activity archived successfully");
      load();
    } catch (e) {
      toast.error(e?.response?.data?.message || e.message || "Archive failed");
    }
  }

  const confirmArchive = (activity) => {
    setActivityToArchive(activity);
    setArchiveModalOpen(true);
  };

  const handleArchiveConfirm = async () => {
    if (!activityToArchive) return;

    await archive(activityToArchive._id);

    setArchiveModalOpen(false);
    setActivityToArchive(null);
  };

  const closeArchiveModal = () => {
    setArchiveModalOpen(false);
    setActivityToArchive(null);
  };

  const steps = [
    {
      target: '[data-tour="bpa-header"]',
      title: "Activities (BPA)",
      content:
        "This page is used to register business processing activities with roles, purposes, subjects, categories, and region.",
      placement: "bottom",
    },
    {
      target: '[data-tour="bpa-new-button"]',
      title: "New Activity",
      content: "Click here to create a new business processing activity.",
      placement: "left",
    },
    {
      target: '[data-tour="bpa-table-section"]',
      title: "All Activities",
      content:
        "This table shows all saved activities with their role, purposes, subjects, categories, and region. Use Archive to remove an activity from the active list.",
      placement: "top",
    },
    {
      target: '[data-tour="bpa-refresh-button"]',
      title: "Refresh",
      content: "Use this button to reload the activities list from the server.",
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
      <div className="bg-white min-h-screen rounded-lg p-5 my-3 mx-5">
        {/* Header */}
        <div
          className="px-6 py-8 bg-[#2B245C] rounded-2xl shadow-lg hover:shadow-2xl transition-shadow duration-300"
          data-tour="bpa-header"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-cyan-50">
                Activities (BPA)
              </h1>
              <p className="mt-1 text-sm text-white">
                Register Business Processing Activities with roles, purposes,
                subjects, and categories.
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
                data-tour="bpa-new-button"
                onClick={() =>
                  guard(canCreate, router, () => {
                    setModalOpen(true);
                    setError("");
                  })
                }
                className="rounded-lg bg-white text-[#2B245C] px-6 py-2.5 text-sm font-semibold shadow-md hover:shadow-lg hover:bg-gray-100 transition-all"
              >
                + New Activity
              </button>
            </div>
          </div>
        </div>

        <div className="py-5 space-y-5">
          {/* List */}
          <section
            className="rounded-2xl border border-[#2B245C] bg-white p-6 shadow-lg hover:shadow-2xl transition-shadow duration-300"
            data-tour="bpa-table-section"
          >
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-[#2B245C]">
                All Activities
              </h2>
              <div className="flex items-center gap-3">
                {canView && (
                  <span className="text-sm text-gray-600">
                    Showing {indexOfFirstRow + 1}–
                    {Math.min(indexOfLastRow, items.length)} of {items.length}
                  </span>
                )}
                <button
                  data-tour="bpa-refresh-button"
                  className="rounded-lg border border-[#2B245C] bg-white px-3 py-1.5 text-sm font-medium text-[#2B245C] hover:bg-indigo-50 transition-all"
                  onClick={load}
                >
                  {loading ? "Refreshing…" : "Refresh"}
                </button>
              </div>
            </div>

            <div className="overflow-auto rounded-lg border border-gray-500">
              <table className="min-w-full text-sm">
                <thead className="bg-[#2B245C] text-left text-white border-b border-gray-500">
                  <tr>
                    <th className="px-4 py-2 font-medium">Name</th>
                    <th className="px-4 py-2 font-medium">Role</th>
                    <th className="px-4 py-2 font-medium">Purposes</th>
                    <th className="px-4 py-2 font-medium">Subjects</th>
                    <th className="px-4 py-2 font-medium">Categories</th>
                    <th className="px-4 py-2 font-medium">Region</th>
                    <th className="px-4 py-2 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {!canView ? (
                    <tr>
                      <td
                        colSpan="7"
                        className="px-4 py-4 text-center text-red-600 font-medium"
                      >
                        You don’t have permission to view activities.
                      </td>
                    </tr>
                  ) : items.length === 0 ? (
                    <tr>
                      <td
                        colSpan="7"
                        className="px-4 py-4 text-center text-gray-500"
                      >
                        No activities found.
                      </td>
                    </tr>
                  ) : (
                    currentRows.map((it) => (
                      <tr key={it._id} className="hover:bg-gray-50">
                        <td className="px-4 py-2">{it.name}</td>
                        <td className="px-4 py-2">
                          <span className="inline-flex items-center rounded-full border border-gray-200 bg-gray-50 px-2 py-0.5 text-xs text-gray-700">
                            {it.role}
                          </span>
                        </td>
                        <td className="px-4 py-2 text-sm">
                          {(it.purposes || []).length ? (
                            <div className="flex flex-wrap gap-1">
                              {(it.purposes || []).map((p, idx) => (
                                <span
                                  key={idx}
                                  className="rounded-full border border-gray-200 bg-gray-50 px-2 py-0.5 text-xs text-gray-700"
                                >
                                  {p}
                                </span>
                              ))}
                            </div>
                          ) : (
                            "—"
                          )}
                        </td>
                        <td className="px-4 py-2 text-sm">
                          {(it.dataSubjects || []).length ? (
                            <div className="flex flex-wrap gap-1">
                              {(it.dataSubjects || []).map((s, idx) => (
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
                        <td className="px-4 py-2 text-sm">
                          {(it.dataCategories || []).length ? (
                            <div className="flex flex-wrap gap-1">
                              {(it.dataCategories || []).map((c, idx) => (
                                <span
                                  key={idx}
                                  className="rounded-full border border-gray-200 bg-gray-50 px-2 py-0.5 text-xs text-gray-700"
                                >
                                  {c}
                                </span>
                              ))}
                            </div>
                          ) : (
                            "—"
                          )}
                        </td>
                        <td className="px-4 py-2 text-sm">
                          {it.regionCode || (it.regions || [])[0] || "—"}
                        </td>

                        <td className="px-4 py-2">
                          <div className="flex justify-center">
                            <button
                              onClick={() =>
                                guard(canDelete, router, () =>
                                  confirmArchive(it),
                                )
                              }
                              className="rounded-lg border border-red-200 bg-white px-2 py-1 text-xs font-medium text-red-700 hover:bg-red-50"
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
            {items.length > 0 && (
              <div className="flex items-center justify-between mt-4">
                {/* Rows Per Page */}
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">Rows per page:</span>

                  <select
                    className="border rounded px-2 py-1 text-sm"
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

                {/* Navigation Buttons */}
                <div className="flex items-center gap-2">
                  <button
                    className="rounded-lg bg-[#2B245C] text-white px-4 py-2 text-sm font-semibold shadow-md hover:shadow-lg hover:bg-opacity-90 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-200 ease-in-out"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((p) => p - 1)}
                  >
                    Prev
                  </button>

                  {/* Page Info */}
                  <span className="text-sm text-gray-600">
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

            {error && (
              <div className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {error}
              </div>
            )}
          </section>
        </div>
      </div>

      {/* Modal (Create) */}
      {modalOpen && (
        <Modal
          onClose={() => {
            setModalOpen(false);
          }}
        >
          <form onSubmit={create} className="space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold text-[#2B245C]">
                Create New Activity
              </h3>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm hover:bg-gray-50"
              >
                Close
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField label="Activity Name" required>
                <input
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-indigo-200 transition-all"
                  placeholder="Enter activity name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
              </FormField>

              <FormField label="Role">
                <select
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 focus:border-indigo-500 focus:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-indigo-200 transition-all"
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                >
                  <option value="controller">Controller</option>
                  <option value="processor">Processor</option>
                  <option value="joint">Joint</option>
                </select>
              </FormField>

              {/* ✅ multi select dropdown for purpose */}
              <FormField label="Purpose">
                <Select
                  isMulti={true}
                  options={purposeOptions}
                  value={form.purpose}
                  onChange={
                    (selected) => setForm({ ...form, purpose: selected || [] }) // Handling multi-select
                  }
                  classNames={{
                    singleValue: () => "text-sm text-gray-900",
                    placeholder: () => "text-sm text-gray-100",
                    input: () => "text-sm text-gray-900",
                    menu: () =>
                      "mt-1 rounded-xl border border-gray-300 shadow-lg",
                  }}
                  placeholder="Select purpose(s)"
                />
              </FormField>

              <FormField label="Data Subject">
                <Select
                  isMulti={false}
                  options={subjectOptions}
                  value={form.dataSubject}
                  onChange={(selected) =>
                    setForm({ ...form, dataSubject: selected || null })
                  }
                  classNames={{
                    singleValue: () => "text-sm text-gray-900",
                    placeholder: () => "text-sm text-gray-100",
                    input: () => "text-sm text-gray-900",
                    menu: () =>
                      "mt-1 rounded-xl border border-gray-300 shadow-lg",
                  }}
                  placeholder="Select data subject"
                />
              </FormField>

              <div className="flex flex-col">
                <label className="text-xs font-semibold text-gray-700 mb-2">
                  Data Category
                </label>
                <Select
                  isMulti={false}
                  options={categoryOptions}
                  value={form.dataCategory}
                  onChange={(selected) =>
                    setForm({ ...form, dataCategory: selected || null })
                  }
                  classNames={{
                    singleValue: () => "text-sm text-gray-900",
                    placeholder: () => "text-sm text-gray-100",
                    input: () => "text-sm text-gray-900",
                    menu: () =>
                      "mt-1 rounded-xl border border-gray-300 shadow-lg",
                  }}
                  placeholder="Select data category"
                />
              </div>

              {/* ✅ NEW: Region via RemoteSelect */}
              <FormField label="Region">
                <SelectRegion
                  value={form.region}
                  onChange={(code) => setForm((f) => ({ ...f, region: code }))}
                  className="w-full"
                  label=""
                />
              </FormField>

              <FormField label="Description" className="md:col-span-3">
                <input
                  className="rounded-lg border border-gray-200 px-3 py-2 text-sm md:col-span-3"
                  placeholder="Enter description (optional)"
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                />
              </FormField>
            </div>

            <div className="flex gap-2">
              <button
                className="rounded-lg bg-[#2B245C] text-white px-4 py-2 text-sm font-semibold shadow-md hover:shadow-lg hover:bg-opacity-90 transition-all disabled:opacity-60"
                disabled={saving}
              >
                {saving ? "Saving…" : "Add Activity"}
              </button>
              <button
                type="button"
                className="rounded-lg border border-[#2B245C] bg-white px-4 py-2 text-sm font-medium text-[#2B245C] hover:bg-indigo-50 transition-all"
                onClick={() => setModalOpen(false)}
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
        <Modal onClose={closeArchiveModal}>
          <div className="space-y-5">
            <h3 className="text-xl font-semibold text-[#2B245C]">
              Archive Activity
            </h3>

            <p className="text-gray-600">
              Are you sure you want to archive{" "}
              <span className="font-semibold">{activityToArchive?.name}</span>?
            </p>

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
