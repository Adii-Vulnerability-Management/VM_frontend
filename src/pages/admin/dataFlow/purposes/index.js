// pages/admin/dataFlow/purposes/create.js
// ✅ Updated UI to use `name` instead of `key` + `label`
// NOTE: Existing structure preserved; only minimal, necessary edits applied.

import { useEffect, useMemo, useRef, useState } from "react";
import CustomAxios from "@/globalcomponents/CustomAxios";
import { baseurl } from "@/config/config";
import DataFlowNav from "../Nav";
import { useRouter } from "next/router";
import { can, guard } from "@/auth/auth-permissions";
import { initURL } from "BaseUrl";
import { toast } from "react-toastify";
import GuideButton from "@/components/Tour/GuideButton";
import Tour from "@/components/Tour/Tour";

const API = `${baseurl}/${initURL}/dataflow/purposes`;
const RETENTION_POLICIES_API = `${baseurl}/${initURL}/dataflow/retention-policies`;

const LAWFUL_BASES = [
  "EMPLOYMENT_LEGITIMATE_USE",
  "CONSENT",
  "CONTRACT",
  "LEGAL_OBLIGATION",
  "VITAL_INTERESTS",
  "PUBLIC_TASK",
  "LEGITIMATE_INTERESTS",
];

const LEGAL_HOLDS = [
  "LEGAL_CLAIMS", // Art. 9.2.f: Necessary for defense or establishment of legal claims or court actions.
  "LEGAL_OBLIGATIONS", // Art. 9.2.b: Necessary for compliance with employment, social security, or social protection laws.
  "EXPLICIT_CONSENT", // Art. 9.2.a: The individual has given clear, documented permission to hold or process the data.
  "SUBSTANTIAL_PUBLIC_INTEREST", // Art. 9.2.g: Necessary for a significant public interest, such as fraud prevention or regulatory audits.
  "VITAL_INTERESTS", // Art. 9.2.c: Necessary to protect a person’s life when they are unable to give consent (e.g., medical emergency).
  "PUBLICLY_SHARED", // Art. 9.2.e: The data has been deliberately made public by the individual.
  "HEALTH_CARE", // Art. 9.2.h: Necessary for medical diagnosis, health treatment, or care management.
  "PUBLIC_HEALTH", // Art. 9.2.i: Necessary for public health purposes, such as addressing cross-border disease threats.
  "ARCHIVING_RESEARCH", // Art. 9.2.j: Necessary for archiving in the public interest or for scientific, historical, or research purposes.
  "NON_PROFIT_BODIES", // Art. 9.2.d: Data held by non-profit organizations or unions related to their own members.
];

const FormField = ({ label, required = false, children, className = "" }) => (
  <div className={`flex flex-col ${className}`}>
    <label className="text-xs font-semibold text-gray-700 mb-2">
      {label}
      {required && <span className="text-red-500 ml-1">*</span>}
    </label>
    {children}
  </div>
);

export default function CreateDataPurposePage() {
  const router = useRouter();

  const [items, setItems] = useState([]);
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [loading, setLoading] = useState(false);
  const [retentionPolicies, setRetentionPolicies] = useState([]);
  const [loadingRetentionPolicies, setLoadingRetentionPolicies] =
    useState(false);
  const [retentionPoliciesError, setRetentionPoliciesError] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // detail view (optional)
  const [selectedId, setSelectedId] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);

  // modal
  const [modalOpen, setModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [tourOpen, setTourOpen] = useState(false);

  // Permissions
  const canView = can("privacy.read");
  const canCreate = can("privacy.create");

  const emptyForm = useMemo(
    () => ({
      // ✅ NEW: `name` replaces old `key` + `label`
      name: "",
      description: "",
      category: "",
      lawfulBasis: "EMPLOYMENT_LEGITIMATE_USE",
      requiresConsent: false,
      isCorePurpose: true,
      retentionPolicyId: "", // optional
      appliesToSubjects: "", // optional (CSV)
      legalHold: "",
    }),
    [],
  );

  const [form, setForm] = useState(emptyForm);

  const csvToArr = (csv = "") =>
    csv
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

  const resetForm = () => {
    setForm(emptyForm);
    setError("");
    setSuccess("");
  };

  const openCreate = () => {
    resetForm();
    setModalOpen(true);
  };

  const fetchItems = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await CustomAxios.get(API);
      const list = Array.isArray(res.data) ? res.data : [];
      setItems(list);
      setCurrentPage(1);
    } catch (e) {
      setError(e?.response?.data?.message || e.message || "Failed to load.");
    } finally {
      setLoading(false);
    }
  };

  const fetchRetentionPolicies = async () => {
    try {
      setLoadingRetentionPolicies(true);
      setRetentionPoliciesError("");
      const res = await CustomAxios.get(RETENTION_POLICIES_API);
      const data = res?.data;
      const list = Array.isArray(data?.items)
        ? data.items
        : Array.isArray(data?.data)
          ? data.data
          : Array.isArray(data)
            ? data
            : [];

      setRetentionPolicies(list);
    } catch (e) {
      setRetentionPoliciesError(
        e?.response?.data?.message ||
          e?.response?.data?.error ||
          e.message ||
          "Failed to load retention policies.",
      );
    } finally {
      setLoadingRetentionPolicies(false);
    }
  };

  const fetchOne = async (id) => {
    try {
      setError("");
      const res = await CustomAxios.get(`${API}/${id}`);
      setSelectedItem(res.data || null);
    } catch (e) {
      setSelectedItem(null);
      setError(
        e?.response?.data?.message || e.message || "Failed to load item.",
      );
    }
  };

  useEffect(() => {
    fetchItems();
    fetchRetentionPolicies();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const payload = {
        // ✅ CHANGED: API now expects `name`
        name: form.name.trim(),

        // still required (as per your UI)
        description: form.description.trim(),
        category: form.category.trim(),
        lawfulBasis: form.lawfulBasis,
        requiresConsent: !!form.requiresConsent,
        isCorePurpose: !!form.isCorePurpose,
        legalHold: form.legalHold,
      };

      // optional: only include if present
      const retentionId = form.retentionPolicyId.trim();
      if (retentionId) payload.retentionPolicyId = retentionId;

      const subjectsArr = csvToArr(form.appliesToSubjects);
      if (subjectsArr.length > 0) payload.appliesToSubjects = subjectsArr;

      await CustomAxios.post(API, payload);

      toast.success("Purpose created successfully!");
      setModalOpen(false);
      resetForm();
      fetchItems();
    } catch (e2) {
      const msg =
        e2?.response?.data?.message ||
        e2.message ||
        "Create failed. Please try again.";

      setError(msg);
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const steps = [
    {
      target: '[data-tour="dp-header"]',
      title: "Data Processing Purposes",
      content:
        "This page defines why data is processed, including its lawful basis, consent requirements, and scope.",
      placement: "bottom",
    },
    {
      target: '[data-tour="dp-create"]',
      title: "Create Purpose",
      content: "Use this button to create a new purpose for processing data.",
      placement: "bottom",
    },
    {
      target: '[data-tour="dp-table"]',
      title: "Purposes Table",
      content:
        "This table displays all defined purposes along with their category, lawful basis, consent requirement, and description. Use the View button to review detailed information about a selected purpose.",
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
      <div className="bg-white min-h-screen rounded-lg p-5 my-3 mx-5">
        
        {/* Header */}
        <div
          className="px-6 py-8 bg-[#2B245C] rounded-2xl shadow-lg hover:shadow-2xl transition-shadow duration-300"
          data-tour="dp-header"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-cyan-50">Purposes</h1>
              <p className="mt-1 text-sm text-white">
                Define why data is processed (purpose), lawful basis, consent
                requirements, and scope.
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
                data-tour="dp-create"
                onClick={() => guard(canCreate, router, openCreate)}
                className="rounded-lg bg-white text-[#2B245C] px-6 py-2.5 text-sm font-semibold shadow-md hover:shadow-lg hover:bg-gray-100 transition-all"
              >
                + New Purpose
              </button>
            </div>
          </div>
        </div>

        <div className="py-5 space-y-5">
          {/* Table */}
          <section
            className="rounded-2xl border border-[#2B245C] bg-white p-6 shadow-lg hover:shadow-2xl transition-shadow duration-300"
            data-tour="dp-table"
          >
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-[#2B245C]">Purposes</h2>
              <div className="flex items-center gap-3">
                {canView && (
                  <span className="text-sm text-gray-600">
                    Showing {items.length === 0 ? 0 : indexOfFirstRow + 1}–
                    {Math.min(indexOfLastRow, items.length)} of {items.length}
                  </span>
                )}
                <button
                  onClick={fetchItems}
                  className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  {loading ? "Refreshing…" : "Refresh"}
                </button>
              </div>
            </div>

            <div className="overflow-auto rounded-lg border border-gray-500">
              <table className="min-w-full text-sm">
                <thead className="bg-[#2B245C] text-left text-white border-b border-gray-500">
                  <tr>
                    {/* ✅ CHANGED: `name` replaces key/label */}
                    <th className="px-4 py-2 font-medium">Name</th>
                    <th className="px-4 py-2 font-medium">Category</th>
                    <th className="px-4 py-2 font-medium">Lawful Basis</th>
                    <th className="px-4 py-2 font-medium">Legal Hold</th>
                    <th className="px-4 py-2 font-medium">Consent</th>
                    <th className="px-4 py-2 font-medium">Core</th>
                    <th className="px-4 py-2 font-medium">Description</th>
                    <th className="px-4 py-2 font-medium">Actions</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">
                  {!canView ? (
                    <tr>
                      <td
                        colSpan={8}
                        className="px-4 py-4 text-center text-red-600 font-medium"
                      >
                        You don’t have permission to view purposes.
                      </td>
                    </tr>
                  ) : loading ? (
                    [...Array(4)].map((_, i) => (
                      <tr key={i}>
                        {/* ✅ CHANGED: table now has 7 columns */}
                        {Array.from({ length: 7 }).map((__, j) => (
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
                        colSpan={7}
                      >
                        No purposes yet.
                      </td>
                    </tr>
                  ) : (
                    currentRows.map((it) => (
                      // ✅ CHANGED: fallback key now uses `name` instead of `key`
                      <tr key={it._id || it.name} className="hover:bg-gray-50">
                        {/* ✅ CHANGED: display `name` only */}
                        <td className="px-4 py-2">
                          {it.name || <span className="text-gray-400">—</span>}
                        </td>
                        <td className="px-4 py-2">
                          {it.category || (
                            <span className="text-gray-400">—</span>
                          )}
                        </td>
                        <td className="px-4 py-2">
                          {it.lawfulBasis || (
                            <span className="text-gray-400">—</span>
                          )}
                        </td>
                        <td className="px-4 py-2">
                          {it.legalHold || (
                            <span className="text-gray-400">—</span>
                          )}
                        </td>
                        <td className="px-4 py-2">
                          {it.requiresConsent ? "Yes" : "No"}
                        </td>
                        <td className="px-4 py-2">
                          {it.isCorePurpose ? "Yes" : "No"}
                        </td>
                        <td className="px-4 py-2 max-w-sm">
                          <div
                            className="truncate"
                            title={it.description || ""}
                          >
                            {it.description || (
                              <span className="text-gray-400">—</span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-2">
                          <div className="flex flex-wrap gap-2">
                            <button
                              onClick={() =>
                                guard(canView, router, () => {
                                  setSelectedId(it._id);
                                  setViewModalOpen(true);
                                  fetchOne(it._id);
                                })
                              }
                              className="rounded-lg border border-[#2B245C] bg-white px-2.5 py-1 text-xs font-medium text-[#2B245C] hover:bg-indigo-50 transition-all"
                            >
                              View
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

                  <span className="text-sm font-medium">
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

      {/* Modal (Create) */}
      {modalOpen && (
        <Modal
          onClose={() => {
            setModalOpen(false);
            resetForm();
          }}
          className="max-w-3xl"
        >
          <form onSubmit={handleSubmit} className="space-y-5 p-5">
            <div className="flex items-center justify-between border-b pb-4">
              <h3 className="text-2xl font-semibold text-[#2B245C]">
                Create New Purpose
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

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {/* ✅ CHANGED: single Name field replaces Key + Label */}
              <FormField label="Name" className="md:col-span-2" required>
                <input
                  type="text"
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                  placeholder="Enter purpose name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                  maxLength={200}
                />
              </FormField>

              <FormField label="Description" className="md:col-span-2">
                <textarea
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                  rows={3}
                  placeholder="Describe the purpose of processing personal data"
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                  required
                />
              </FormField>

              <FormField label="Category">
                <input
                  type="text"
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                  placeholder="Enter purpose category"
                  value={form.category}
                  onChange={(e) =>
                    setForm({ ...form, category: e.target.value })
                  }
                  required
                  maxLength={120}
                />
              </FormField>

              <FormField label="Lawful Basis">
                <select
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                  value={form.lawfulBasis}
                  onChange={(e) =>
                    setForm({ ...form, lawfulBasis: e.target.value })
                  }
                  required
                >
                  {LAWFUL_BASES.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
              </FormField>

              <FormField label="Legal Hold">
                <select
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                  value={form.legalHold}
                  onChange={(e) =>
                    setForm({ ...form, legalHold: e.target.value })
                  }
                  required
                >
                  <option value="" disabled>
                    Select Legal Hold
                  </option>

                  {LEGAL_HOLDS.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
              </FormField>

              <div className="flex items-center gap-5 border rounded-md p-3">
                <label className="inline-flex items-center gap-2 text-sm text-gray-700 font-medium">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-gray-300"
                    checked={form.requiresConsent}
                    onChange={(e) =>
                      setForm({ ...form, requiresConsent: e.target.checked })
                    }
                  />
                  Requires Consent
                </label>

                <label className="inline-flex items-center gap-2 text-sm text-gray-700 font-medium">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-gray-300"
                    checked={form.isCorePurpose}
                    onChange={(e) =>
                      setForm({ ...form, isCorePurpose: e.target.checked })
                    }
                  />
                  Core Purpose
                </label>
              </div>

              <FormField label="Retention Policy (optional)">
                <select
                  className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm"
                  value={form.retentionPolicyId}
                  onChange={(e) =>
                    setForm({ ...form, retentionPolicyId: e.target.value })
                  }
                  disabled={
                    loadingRetentionPolicies || !!retentionPoliciesError
                  }
                >
                  <option value="">
                    {loadingRetentionPolicies
                      ? "Loading policies..."
                      : retentionPoliciesError
                        ? "Failed to load policies"
                        : "Select retention policy"}
                  </option>
                  {!loadingRetentionPolicies &&
                    !retentionPoliciesError &&
                    retentionPolicies.map((policy) => {
                      const id = policy._id || policy.id;
                      const label = policy.name || policy.title || id;
                      if (!id) return null;
                      return (
                        <option key={id} value={id}>
                          {label} ({id})
                        </option>
                      );
                    })}
                </select>
                {retentionPoliciesError && (
                  <p className="mt-1 text-xs text-red-600">
                    {retentionPoliciesError}
                  </p>
                )}
              </FormField>

              <FormField label="Applies To Subject IDs (CSV, optional)">
                <input
                  type="text"
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                  // placeholder="691d927c90c9f89ffe16866d, 691d927c90c9f89ffe16866e"
                  placeholder="Enter subject IDs separated by commas (optional)"
                  value={form.appliesToSubjects}
                  onChange={(e) =>
                    setForm({ ...form, appliesToSubjects: e.target.value })
                  }
                />
              </FormField>
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                disabled={saving}
                className="rounded-lg bg-[#2B245C] text-white px-4 py-2 text-sm font-semibold shadow-md hover:shadow-lg hover:bg-opacity-90 transition-all disabled:opacity-60"
              >
                {saving ? "Creating…" : "Create"}
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

      {/* Details Modal */}
      {viewModalOpen && (
        <Modal
          onClose={() => {
            setViewModalOpen(false);
            setSelectedItem(null);
            setSelectedId(null);
          }}
          className="max-w-4xl h-[80vh]"
        >
          {selectedItem ? (
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="flex-shrink-0 bg-gradient-to-r from-[#2B245C] to-indigo-900 rounded-t-2xl px-6 py-5 text-white">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-2xl text-white font-bold">
                      {selectedItem.name}
                    </h2>
                    <p className="text-indigo-100 text-sm mt-1">
                      Purpose Details
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      setViewModalOpen(false);
                      setSelectedItem(null);
                      setSelectedId(null);
                    }}
                    className="rounded-lg text-sm bg-white/20 hover:bg-white/30 px-4 py-2 transition"
                  >
                    Close
                  </button>
                </div>
              </div>

              {/* Body */}
              <div className="flex-1 overflow-y-auto bg-gray-50 px-6 py-6">
                <div className="grid md:grid-cols-2 gap-5">
                  <InfoCard
                    title="Category"
                    value={selectedItem.category || "-"}
                  />

                  <InfoCard
                    title="Lawful Basis"
                    value={selectedItem.lawfulBasis || "-"}
                  />

                  <InfoCard
                    title="Legal Hold"
                    value={selectedItem.legalHold || "-"}
                  />

                  <InfoCard
                    title="Retention Policy"
                    value={
                      selectedItem.retentionPolicyId?.name ||
                      selectedItem.retentionPolicyId?._id ||
                      "Not Assigned"
                    }
                  />

                  {/* Consent */}
                  <div className="rounded-xl border bg-white shadow-sm p-5">
                    <p className="text-xs uppercase tracking-wide text-gray-500 mb-3">
                      Requires Consent
                    </p>

                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-sm font-semibold ${
                        selectedItem.requiresConsent
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {selectedItem.requiresConsent ? "Yes" : "No"}
                    </span>
                  </div>

                  {/* Core */}
                  <div className="rounded-xl border bg-white shadow-sm p-5">
                    <p className="text-xs uppercase tracking-wide text-gray-500 mb-3">
                      Core Purpose
                    </p>

                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-sm font-semibold ${
                        selectedItem.isCorePurpose
                          ? "bg-blue-100 text-blue-700"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {selectedItem.isCorePurpose ? "Yes" : "No"}
                    </span>
                  </div>
                </div>

                {/* Description */}
                <div className="mt-6 rounded-xl border bg-white shadow-sm p-5">
                  <h3 className="font-semibold mb-3 text-xl">Description</h3>

                  <p className="text-gray-600 leading-7">
                    {selectedItem.description || "No description available."}
                  </p>
                </div>

                {/* Metadata */}
                <div className="mt-6 rounded-xl border bg-white shadow-sm p-5">
                  <h3 className="font-semibold mb-4 text-xl">Metadata</h3>

                  <div className="grid md:grid-cols-2 gap-4">
                    <InfoCard
                      title="Created At"
                      value={
                        selectedItem.createdAt
                          ? new Date(selectedItem.createdAt).toLocaleString()
                          : "-"
                      }
                    />

                    <InfoCard
                      title="Updated At"
                      value={
                        selectedItem.updatedAt
                          ? new Date(selectedItem.updatedAt).toLocaleString()
                          : "-"
                      }
                    />

                    <InfoCard title="Purpose ID" value={selectedItem._id} />

                    <InfoCard title="Tenant" value={selectedItem.tenantId} />
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex justify-center items-center py-20">
              <div className="h-10 w-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}
        </Modal>
      )}

      <Tour steps={steps} open={tourOpen} onClose={() => setTourOpen(false)} />
    </div>
  );
}

/** Simple Tailwind modal (same pattern as your reference page) */
function Modal({ children, onClose, className = "" }) {
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
          className={`w-full rounded-2xl border border-gray-200 bg-white shadow-xl outline-none overflow-hidden flex flex-col ${className}`}
          onClick={(e) => e.stopPropagation()}
        >
          {children}
        </div>
      </div>
    </div>
  );
}

function InfoCard({ title, value }) {
  return (
    <div className="rounded-xl border bg-white shadow-sm hover:shadow-md transition-all p-5">
      <p className="text-xs uppercase tracking-wide text-gray-500 mb-2">
        {title}
      </p>

      <p className="text-base font-semibold text-gray-800 break-words">
        {value}
      </p>
    </div>
  );
}

// List of lawful bases for processing under Article 6 of GDPR
// const LAWFUL_BASES = [
//   {
//     id: "EMPLOYMENT_LEGITIMATE_USE",
//     title: "Employment Legitimate Use",
//     description: "Necessary for the performance of a contract or compliance with a legal obligation related to employment.",
//   },
//   {
//     id: "CONSENT",
//     title: "Consent",
//     description: "The individual has given explicit consent for processing their data.",
//   },
//   {
//     id: "CONTRACT",
//     title: "Contract",
//     description: "Processing is necessary for the performance of a contract to which the data subject is a party.",
//   },
//   {
//     id: "LEGAL_OBLIGATION",
//     title: "Legal Obligation",
//     description: "Processing is necessary for compliance with a legal obligation to which the controller is subject.",
//   },
//   {
//     id: "VITAL_INTERESTS",
//     title: "Vital Interests",
//     description: "Processing is necessary to protect someone's life (e.g., in an emergency).",
//   },
//   {
//     id: "PUBLIC_TASK",
//     title: "Public Task",
//     description: "Processing is necessary for performing a task in the public interest or in the exercise of official authority.",
//   },
//   {
//     id: "LEGITIMATE_INTERESTS",
//     title: "Legitimate Interests",
//     description: "Processing is necessary for legitimate interests pursued by the controller or a third party, except where such interests are overridden by the rights and freedoms of the data subject.",
//   },
// ];

// // List of legal holds for processing sensitive data under Article 9.2 of GDPR
// const LEGAL_HOLDS = [
//   {
//     id: "legalClaims",
//     title: "Legal Claims (Art. 9.2.f)",
//     description: "Necessary for the defense or establishment of legal claims or court actions.",
//   },
//   {
//     id: "legalObligations",
//     title: "Legal Obligations (Art. 9.2.b)",
//     description: "Necessary for compliance with employment, social security, or social protection laws.",
//   },
//   {
//     id: "explicitConsent",
//     title: "Explicit Consent (Art. 9.2.a)",
//     description: "The individual has given clear, documented permission to hold or process the data.",
//   },
//   {
//     id: "substantialPublicInterest",
//     title: "Substantial Public Interest (Art. 9.2.g)",
//     description: "Necessary for a significant public interest, such as fraud prevention or regulatory audits.",
//   },
//   {
//     id: "vitalInterests",
//     title: "Vital Interests (Art. 9.2.c)",
//     description: "Necessary to protect a person’s life when they are unable to give consent (e.g., medical emergency).",
//   },
//   {
//     id: "publiclyShared",
//     title: "Publicly Shared by Subject (Art. 9.2.e)",
//     description: "The data has been deliberately made public by the individual.",
//   },
//   {
//     id: "healthCare",
//     title: "Health & Social Care (Art. 9.2.h)",
//     description: "Necessary for medical diagnosis, health treatment, or care management.",
//   },
//   {
//     id: "publicHealth",
//     title: "Public Health (Art. 9.2.i)",
//     description: "Necessary for public health purposes, such as addressing cross-border disease threats.",
//   },
//   {
//     id: "archivingResearch",
//     title: "Archiving & Research (Art. 9.2.j)",
//     description: "Necessary for archiving in the public interest or for scientific, historical, or research purposes.",
//   },
//   {
//     id: "nonProfitBodies",
//     title: "Non-Profit Bodies (Art. 9.2.d)",
//     description: "Data held by non-profit organizations or unions related to their own members.",
//   },
// ];

// export default function LegalBasesAndHolds() {
//   return (
//     <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
//       <div className="mx-auto max-w-6xl px-4 py-6">
//         {/* Section for Lawful Bases */}
//         <h1 className="text-2xl font-semibold text-gray-900">Lawful Bases for Processing</h1>
//         <p className="mt-1 text-sm text-gray-600">
//           Below are the lawful bases for processing personal data under Article 6 of the GDPR.
//         </p>
//         <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mt-6">
//           {LAWFUL_BASES.map((base) => (
//             <div
//               key={base.id}
//               className="group block rounded-xl border border-gray-200 bg-white p-4 shadow-sm hover:border-indigo-300 hover:bg-indigo-50/40"
//             >
//               <div className="font-semibold text-gray-900">{base.title}</div>
//               <div className="mt-1 text-sm text-gray-600">{base.description}</div>
//             </div>
//           ))}
//         </div>

//         {/* Section for Legal Holds */}
//         <h1 className="text-2xl font-semibold text-gray-900 mt-12">Legal Holds for Processing Sensitive Data</h1>
//         <p className="mt-1 text-sm text-gray-600">
//           Below are the legal holds for processing sensitive data under Article 9 of the GDPR.
//         </p>
//         <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mt-6">
//           {LEGAL_HOLDS.map((hold) => (
//             <div
//               key={hold.id}
//               className="group block rounded-xl border border-gray-200 bg-white p-4 shadow-sm hover:border-indigo-300 hover:bg-indigo-50/40"
//             >
//               <div className="font-semibold text-gray-900">{hold.title}</div>
//               <div className="mt-1 text-sm text-gray-600">{hold.description}</div>
//             </div>
//           ))}
//         </div>
//       </div>
//     </div>
//   );
// }
