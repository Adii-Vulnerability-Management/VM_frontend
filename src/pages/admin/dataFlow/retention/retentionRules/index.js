import React, { useState, useEffect, useMemo } from "react";
import CustomAxios from "@/globalcomponents/CustomAxios";
import { baseurl } from "@/config/config";
import DataFlowNav from "../../Nav";
import { initURL } from "../../../../../../BaseUrl";
import GuideButton from "@/components/Tour/GuideButton";
import Tour from "@/components/Tour/Tour";
import { useRouter } from "next/router";
import { can, guard } from "@/auth/auth-permissions";

const API = `${baseurl}/${initURL}/dataflow/retention-rules`;
const RETENTION_POLICIES_API = `${baseurl}/${initURL}/dataflow/retention-policies`;

// Match your calculationMethod enum
const CALCULATION_METHODS = [
  { value: "FIXED", label: "Fixed" },
  { value: "RELATIVE", label: "Relative" },
];

const ACTIONS = [
  { value: "DELETE", label: "Delete" },
  { value: "ANONYMIZE", label: "Anonymize" },
  { value: "ARCHIVE", label: "Archive" },
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

export default function RetentionRulesPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    name: "",
    categoryId: "",
    elementId: "",
    period: "",
    triggerEvent: "",
    duration: "",
    calculationMethod: "FIXED",
    action: "DELETE",
    legalReference: "",
    applicableCategories: [],
    archived: false,
  });

  const [editingRuleId, setEditingRuleId] = useState(null);
  const isEditing = !!editingRuleId;
  const [retentionRules, setRetentionRules] = useState([]);
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const [loadingRulesList, setLoadingRulesList] = useState(true);
  const [rulesListError, setRulesListError] = useState("");
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);

  const [retentionPolicies, setRetentionPolicies] = useState([]);
  const [selectedPolicyId, setSelectedPolicyId] = useState("");
  const [loadingPolicies, setLoadingPolicies] = useState(false);
  const [policiesError, setPoliciesError] = useState("");

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [tourOpen, setTourOpen] = useState(false);

  // Permissions
  const canView = can("privacy.read");
  const canCreate = can("privacy.create");
  const canUpdate = can("privacy.update");

  const policiesById = useMemo(() => {
    const map = {};
    (retentionPolicies || []).forEach((p) => {
      const id = p._id || p.id;
      if (!id) return;
      map[id] = p;
    });
    return map;
  }, [retentionPolicies]);

  const fetchRetentionPolicies = async () => {
    setLoadingPolicies(true);
    setPoliciesError("");

    try {
      const res = await CustomAxios.get(RETENTION_POLICIES_API);
      const data = res?.data;
      const list = Array.isArray(data) ? data : data?.items || [];
      setRetentionPolicies(list);
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        "Failed to load retention policies.";
      setPoliciesError(message);
    } finally {
      setLoadingPolicies(false);
    }
  };

  const fetchRetentionRules = async (searchValue = "") => {
    setLoadingRulesList(true);
    setRulesListError("");

    try {
      const params = {};
      if (searchValue.trim()) {
        params.search = searchValue.trim(); // backend may ignore if not supported
      }

      const res = await CustomAxios.get(API, { params });
      const data = res?.data;
      const list = Array.isArray(data) ? data : data?.items || [];
      setRetentionRules(list);
      setCurrentPage(1);
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        "Failed to load retention rules.";
      setRulesListError(message);
    } finally {
      setLoadingRulesList(false);
    }
  };

  useEffect(() => {
    fetchRetentionPolicies();
    fetchRetentionRules();
  }, []);

  const resetForm = () => {
    setForm({
      name: "",
      categoryId: "",
      elementId: "",
      period: "",
      triggerEvent: "",
      duration: "",
      calculationMethod: "FIXED",
      action: "DELETE",
      legalReference: "",
      applicableCategories: [],
      archived: false,
    });
    setSelectedPolicyId("");
    setEditingRuleId(null);
    setError("");
    setSuccess("");
  };

  const handleSubmit = async (e) => {
    const isMongoId = (v) => /^[a-f\d]{24}$/i.test(v);

    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      if (!form.name.trim()) {
        throw new Error("Name is required.");
      }
      if (!selectedPolicyId) {
        throw new Error("Retention Policy is required.");
      }
      // if (!form.period.trim()) {
      //   throw new Error("Retention Period is required.");
      // }

      const payload = {
        name: form.name.trim(),
        retentionPolicyId: selectedPolicyId,
        // period: form.period.trim(),
        triggerEvent: form.triggerEvent.trim(),
        duration: form.duration.trim(),
        calculationMethod: form.calculationMethod,
        action: form.action,
        legalReference: form.legalReference.trim(),
        applicableCategories: form.applicableCategories,
        archived: !!form.archived,
      };

      const catId = form.categoryId.trim();
      if (catId) payload.categoryId = catId;

      const elemId = form.elementId.trim();
      if (elemId) payload.elementId = elemId;

      if (editingRuleId) {
        await CustomAxios.patch(`${API}/${editingRuleId}`, payload);
        setSuccess("Retention rule updated successfully.");
      } else {
        await CustomAxios.post(API, payload);
        setSuccess("Retention rule created successfully.");
      }

      await fetchRetentionRules(search);
      resetForm();
      setShowForm(false);
    } catch (e2) {
      const message =
        e2?.response?.data?.message ||
        e2?.response?.data?.error ||
        e2?.message ||
        "Save failed. Please try again.";
      setError(message);
    } finally {
      setSaving(false);
    }
  };

  const handleEditClick = (rule) => {
    setEditingRuleId(rule._id || rule.id || null);

    setForm({
      name: rule.name || rule.title || "",
      categoryId: rule.categoryId || "",
      elementId: rule.elementId || "",
      period: rule.period || "",
      triggerEvent: rule.triggerEvent || "",
      duration: rule.duration || "",
      calculationMethod: rule.calculationMethod || "FIXED",
      action: rule.action || "DELETE",
      legalReference: rule.legalReference || "",
      applicableCategories: rule.applicableCategories || [],
      archived: !!rule.archived,
    });

    const policyId =
      rule.retentionPolicyId ||
      (Array.isArray(rule.retentionPolicyIds)
        ? rule.retentionPolicyIds[0]
        : "");
    setSelectedPolicyId(policyId);

    setError("");
    setSuccess("");
    setShowForm(true);
  };

  const handleNewClick = () => {
    resetForm();
    setShowForm(true);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchRetentionRules(search);
  };

  // Pagination calculations
  const rows = useMemo(
    () => (Array.isArray(retentionRules) ? retentionRules : []),
    [retentionRules],
  );

  const totalPages = Math.ceil(rows.length / rowsPerPage);

  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;

  const currentRows = rows.slice(indexOfFirstRow, indexOfLastRow);

  const steps = [
    {
      target: '[data-tour="rr-header"]',
      title: "Retention Rules",
      content:
        "This page allows you to configure retention rules and link them to retention policies, data categories, or specific data elements.",
      placement: "bottom",
    },
    {
      target: '[data-tour="rr-search"]',
      title: "Search",
      content:
        "Use this search box to find retention rules by name or identifier.",
      placement: "bottom",
    },
    {
      target: '[data-tour="rr-create"]',
      title: "Create Rule",
      content: "Use this button to add a new retention rule.",
      placement: "bottom",
    },
    {
      target: '[data-tour="rr-table"]',
      title: "Retention Rules Table",
      content:
        "This table displays each retention rule with its linked policy, trigger event, duration, action, calculation method, and archive status. Use Edit to update an existing retention rule.",
      placement: "top",
    },
  ];

  return (
    <div className="min-h-screen bg-[#f9fafb]">
      <DataFlowNav />

      <main className="mx-5 min-h-screen bg-white rounded-lg p-5 my-3">
        <div
          className="px-6 py-8 bg-[#2B245C] rounded-2xl shadow-lg hover:shadow-2xl transition-shadow duration-300"
          data-tour="rr-header"
        >
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-cyan-50">
                Retention Rules
              </h1>
              <p className="mt-1 text-sm text-white">
                Configure record-level retention rules and link them to
                retention policies, data categories, or specific data elements.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <form
                onSubmit={handleSearchSubmit}
                className="flex items-center"
                data-tour="rr-search"
              >
                <input
                  type="text"
                  className="rounded-l-lg border border-gray-300 px-3 py-1.5 text-xs md:text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Search by title / id"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                <button
                  type="submit"
                  className="rounded-r-lg border border-l-0 border-gray-300 bg-white px-3 py-1.5 text-xs md:text-sm text-gray-700 hover:bg-gray-50"
                >
                  Search
                </button>
              </form>

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
                data-tour="rr-create"
                onClick={() => guard(canCreate, router, handleNewClick)}
                className="rounded-lg bg-white text-[#2B245C] px-6 py-2.5 text-sm font-semibold shadow-md hover:shadow-lg hover:bg-gray-50 transition-all"
              >
                + New Rule
              </button>
            </div>
          </div>
        </div>

        <div className="py-5 space-y-5">
          {/* Table card – Existing Retention Rules */}
          <section
            className="rounded-2xl border border-[#2B245C] bg-white p-6 shadow-lg hover:shadow-2xl transition-shadow duration-300"
            data-tour="rr-table"
          >
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-2xl font-semibold text-[#2B245C]">
                Existing Retention Rules
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
                    <th className="px-4 py-2 font-medium">Name</th>
                    <th className="px-4 py-2 font-medium">ID</th>
                    <th className="px-4 py-2 font-medium">Policies</th>
                    <th className="px-4 py-2 font-medium">Period</th>
                    <th className="px-4 py-2 font-medium">Action</th>
                    <th className="px-4 py-2 font-medium">Trigger Event</th>
                    <th className="px-4 py-2 font-medium">Duration</th>
                    <th className="px-4 py-2 font-medium">
                      Calculation Method
                    </th>
                    <th className="px-4 py-2 font-medium">Archived</th>
                    <th className="px-4 py-2 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {!canView ? (
                    <tr>
                      <td
                        colSpan={10} // IMPORTANT: match your number of table columns
                        className="px-4 py-4 text-center text-red-600 font-medium"
                      >
                        You don’t have permission to view retention rules.
                      </td>
                    </tr>
                  ) : loadingRulesList ? (
                    <tr>
                      <td
                        colSpan={11}
                        className="px-4 py-4 text-center text-gray-400"
                      >
                        Loading retention rules…
                      </td>
                    </tr>
                  ) : rows.length ? (
                    currentRows.map((rule) => {
                      const policyId =
                        rule.retentionPolicyId ||
                        (Array.isArray(rule.retentionPolicyIds)
                          ? rule.retentionPolicyIds[0]
                          : null);

                      const policyNames = policyId
                        ? (() => {
                            const p = policiesById[policyId];
                            return p ? p.name || p.title || policyId : policyId;
                          })()
                        : "";

                      return (
                        <tr
                          key={rule._id || rule.id}
                          className="border-t border-gray-100 hover:bg-gray-50"
                        >
                          <td className="px-4 py-2 align-top text-xs">
                            {rule.name || rule.title ? (
                              rule.name || rule.title
                            ) : (
                              <span className="text-gray-400">—</span>
                            )}
                          </td>
                          <td className="px-4 py-2 align-top text-[11px] text-gray-500">
                            {rule._id || rule.id}
                          </td>
                          <td className="px-4 py-2 align-top text-xs">
                            {policyNames || (
                              <span className="text-gray-400">—</span>
                            )}
                          </td>
                          <td className="px-4 py-2 align-top text-xs">
                            {rule.period}
                          </td>

                          <td className="px-4 py-2 align-top text-xs">
                            {
                              (
                                ACTIONS.find(
                                  (a) => a.value === rule.action,
                                ) || {
                                  label: rule.action,
                                }
                              ).label
                            }
                          </td>
                          <td className="px-4 py-2 align-top text-xs">
                            {rule.triggerEvent || (
                              <span className="text-gray-400">—</span>
                            )}
                          </td>
                          <td className="px-4 py-2 align-top text-xs">
                            {rule.duration || (
                              <span className="text-gray-400">—</span>
                            )}
                          </td>
                          <td className="px-4 py-2 align-top text-xs">
                            {
                              (
                                CALCULATION_METHODS.find(
                                  (c) => c.value === rule.calculationMethod,
                                ) || { label: rule.calculationMethod }
                              ).label
                            }
                          </td>
                          <td className="px-4 py-2 align-top text-xs">
                            {rule.archived ? (
                              <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[11px]">
                                Yes
                              </span>
                            ) : (
                              <span className="text-gray-400">No</span>
                            )}
                          </td>
                          <td className="px-4 py-2 align-top text-xs">
                            <button
                              type="button"
                              className="rounded-lg border border-[#2B245C] bg-white px-2.5 py-1 text-xs font-medium text-[#2B245C] hover:bg-indigo-50 transition-all"
                              onClick={() =>
                                guard(canUpdate, router, () =>
                                  handleEditClick(rule),
                                )
                              }
                            >
                              Edit
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td
                        colSpan={11}
                        className="px-4 py-4 text-center text-gray-400"
                      >
                        No retention rules found.
                      </td>
                    </tr>
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
      </main>

      {/* Modal – Create / Edit Retention Rule */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="w-full max-w-3xl rounded-2xl border border-gray-200 bg-white shadow-xl">
            {/* Modal header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
              <h3 className="text-xl font-semibold text-[#2B245C]">
                {isEditing
                  ? "Edit Retention Rule"
                  : "Create New Retention Rule"}
              </h3>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  resetForm();
                }}
                className="text-gray-400 hover:text-gray-600 text-lg leading-none px-1"
                aria-label="Close"
              >
                ×
              </button>
            </div>

            {/* Modal body */}
            <div className="px-4 py-5">
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {/* Name */}
                  <FormField label="Name" required>
                    <input
                      type="text"
                      className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                      value={form.name}
                      onChange={(e) =>
                        setForm({ ...form, name: e.target.value })
                      }
                      placeholder="e.g., Customer Records Retention Rule"
                      required
                    />
                  </FormField>

                  {/* Retention Policy */}
                  <FormField label="Retention Policy" required>
                    <select
                      className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                      value={selectedPolicyId}
                      onChange={(e) => setSelectedPolicyId(e.target.value)}
                      disabled={loadingPolicies || !!policiesError}
                      required
                    >
                      <option value="" disabled>
                        {loadingPolicies
                          ? "Loading policies…"
                          : policiesError
                            ? "Failed to load policies"
                            : "Select a retention policy"}
                      </option>

                      {!loadingPolicies &&
                        !policiesError &&
                        retentionPolicies.map((p) => {
                          const id = p._id || p.id;
                          const label = p.name || p.title || id;
                          return (
                            <option key={id} value={id}>
                              {label} ({id})
                            </option>
                          );
                        })}
                    </select>

                    {policiesError && (
                      <p className="mt-1 text-xs text-red-600">
                        {policiesError}
                      </p>
                    )}
                  </FormField>

                  {/* Retention Period */}
                  {/* <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                      Retention Period *
                    </label>
                    <input
                      type="text"
                      className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                      value={form.period}
                      onChange={(e) => setForm({ ...form, period: e.target.value })}
                      placeholder="e.g., 3 Years"
                      required
                    />
                  </div> */}

                  {/* Trigger Event */}
                  <FormField label="Trigger Event" required>
                    <input
                      type="text"
                      className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                      value={form.triggerEvent}
                      onChange={(e) =>
                        setForm({ ...form, triggerEvent: e.target.value })
                      }
                      placeholder="e.g., Record creation, Account closure"
                      required
                    />
                  </FormField>

                  {/* Duration */}
                  <FormField label="Duration" required>
                    <input
                      type="text"
                      className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                      value={form.duration}
                      onChange={(e) =>
                        setForm({ ...form, duration: e.target.value })
                      }
                      placeholder="e.g., 7 years, 365 days, 24 months"
                      required
                    />
                  </FormField>

                  {/* Calculation Method */}
                  <FormField label="Calculation Method">
                    <select
                      className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                      value={form.calculationMethod}
                      onChange={(e) =>
                        setForm({ ...form, calculationMethod: e.target.value })
                      }
                    >
                      {CALCULATION_METHODS.map((method) => (
                        <option key={method.value} value={method.value}>
                          {method.label}
                        </option>
                      ))}
                    </select>
                  </FormField>

                  {/* Action */}
                  <FormField label="Action" required>
                    <select
                      className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                      value={form.action}
                      onChange={(e) =>
                        setForm({ ...form, action: e.target.value })
                      }
                      required
                    >
                      {ACTIONS.map((action) => (
                        <option key={action.value} value={action.value}>
                          {action.label}
                        </option>
                      ))}
                    </select>
                  </FormField>

                  {/* Legal Reference */}
                  <FormField label="Legal Reference">
                    <input
                      type="text"
                      className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                      value={form.legalReference}
                      onChange={(e) =>
                        setForm({ ...form, legalReference: e.target.value })
                      }
                      placeholder="e.g., GDPR Article 5(1)(e), HIPAA"
                    />
                  </FormField>

                  {/* Applicable Categories */}
                  {/* <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Applicable Categories
                  </label>
                  <input
                    type="text"
                    className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                    value={form.applicableCategories}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        applicableCategories: e.target.value.split(","),
                      })
                    }
                  />
                </div> */}

                  {/* Applicable Categories (expects MongoDB IDs) */}
                  <FormField label="Applicable Categories (comma-separated IDs)">
                    <input
                      type="text"
                      className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                      value={(form.applicableCategories || []).join(", ")}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          applicableCategories: e.target.value
                            .split(",")
                            .map((s) => s.trim())
                            .filter(Boolean),
                        })
                      }
                      placeholder="e.g., 65fabc..., 65fabd..."
                    />
                  </FormField>
                </div>

                {error && <p className="text-sm text-red-600">{error}</p>}
                {success && <p className="text-xs text-green-600">{success}</p>}

                {/* Actions */}
                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false);
                      resetForm();
                    }}
                    className="rounded-lg border border-[#2B245C] bg-white px-4 py-2 text-sm font-medium text-[#2B245C] hover:bg-indigo-50 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="rounded-lg bg-[#2B245C] px-4 py-2 text-sm font-semibold text-white shadow-md hover:shadow-lg hover:bg-opacity-90 disabled:opacity-60 transition-all"
                  >
                    {saving
                      ? isEditing
                        ? "Saving…"
                        : "Creating…"
                      : isEditing
                        ? "Save Changes"
                        : "Create Retention Rule"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      <Tour steps={steps} open={tourOpen} onClose={() => setTourOpen(false)} />
    </div>
  );
}
