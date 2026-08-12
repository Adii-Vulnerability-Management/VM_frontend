import React, { useState, useEffect, useMemo } from "react";
import CustomAxios from "@/globalcomponents/CustomAxios";
import { baseurl, initURL } from "@/config/config";
import DataFlowNav from "../../Nav";
import { toast } from "react-toastify";
import GuideButton from "@/components/Tour/GuideButton";
import Tour from "@/components/Tour/Tour";
import { useRouter } from "next/router";
import { can, guard } from "@/auth/auth-permissions";

const MethodChip = ({ method }) => {
  const m = method || "delete";
  const map = {
    delete: "bg-red-600",
    anonymize: "bg-blue-600",
    archive_then_delete: "bg-purple-600",
    aggregate: "bg-green-600",
  };
  const labelMap = {
    delete: "Delete",
    anonymize: "Anonymize",
    archive_then_delete: "Archive then delete",
    aggregate: "Aggregate",
  };
  const color = map[m] || "bg-gray-500";
  const label = labelMap[m] || m;
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 text-xs font-medium text-white rounded ${color}`}
    >
      {label}
    </span>
  );
};

const RetentionPolicyForm = ({
  initialValue,
  onCancel,
  onSave,
  saving,
  retentionRules,
  loadingRules,
  rulesError,
  canSave,
  router,
}) => {
  const [name, setName] = useState(
    initialValue?.name || initialValue?.title || "",
  );
  const [description, setDescription] = useState(
    initialValue?.description || "",
  );
  const [documentRef, setDocumentRef] = useState(
    initialValue?.documentRef || "",
  );
  const [tagsInput, setTagsInput] = useState(
    (initialValue?.tags || []).join(", "),
  );
  const [selectedRuleIds, setSelectedRuleIds] = useState(
    initialValue?.retentionRuleIds || [],
  );
  const [defaultRule, setDefaultRule] = useState(
    initialValue?.defaultRule || "",
  );
  const [errors, setErrors] = useState([]);

  const handleAddRule = (e) => {
    const id = e.target.value;
    if (!id) return;
    setSelectedRuleIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
    setDefaultRule(id); // Automatically set the first added rule as default
  };

  const handleRemoveRule = (idToRemove) => {
    setSelectedRuleIds((prev) => prev.filter((id) => id !== idToRemove));
    if (defaultRule === idToRemove) {
      setDefaultRule(""); // Reset default rule if it's removed
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = [];

    if (!name.trim()) {
      newErrors.push("Title is required.");
    }
    if (name.length > 200) {
      newErrors.push("Title must be at most 200 characters.");
    }

    if (newErrors.length > 0) {
      setErrors(newErrors);
      return;
    }

    const tags = tagsInput
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    const payload = {
      name: name.trim(),
      description: description.trim() || undefined,
      documentRef: documentRef.trim() || undefined,
      tags: tags.length ? tags : undefined,
      retentionRuleIds: selectedRuleIds.length ? selectedRuleIds : undefined,
      defaultRule: defaultRule || undefined, // Send the default rule ID
    };

    setErrors([]);
    guard(canSave, router, () => onSave(payload));
  };

  const rulesById = useMemo(() => {
    const map = {};
    (retentionRules || []).forEach((r) => {
      const id = r._id || r.id;
      if (!id) return;
      map[id] = r;
    });
    return map;
  }, [retentionRules]);

  return (
    <div className="fixed inset-0 bg-black/30 flex z-40 backdrop-blur-sm">
      <div className="ml-auto w-full max-w-md bg-white h-full shadow-xl flex flex-col">
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
          <h3 className="text-xl font-semibold text-[#2B245C]">
            {initialValue?._id ? "Edit policy" : "New policy"}
          </h3>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 text-lg leading-none px-1"
          >
            ✕
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex-1 overflow-y-auto px-5 py-4 space-y-4 text-sm"
        >
          {errors.length > 0 && (
            <div className="border border-red-200 bg-red-50 text-red-700 text-xs px-3 py-2 rounded-md">
              <ul className="list-disc list-inside space-y-1">
                {errors.map((e, i) => (
                  <li key={i}>{e}</li>
                ))}
              </ul>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold mb-1 text-gray-700">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              className="border border-gray-300 rounded-md w-full px-3 py-2 text-sm"
              // placeholder="Finance Records – 7 Years"
              placeholder="e.g., Employee Records Retention Policy"
              maxLength={200}
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <div className="mt-1 text-[11px] text-gray-500">
              Max 200 characters.
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1 text-gray-700">
              Description
            </label>
            <textarea
              className="border border-gray-300 rounded-md w-full px-3 py-2 text-sm"
              rows={3}
              placeholder="Describe the purpose and scope of this retention policy"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1 text-gray-700">
              Reference document
            </label>
            <input
              className="border border-gray-300 rounded-md w-full px-3 py-2 text-sm"
              placeholder="Policy document URL or identifier"
              value={documentRef}
              onChange={(e) => setDocumentRef(e.target.value)}
            />
          </div>

          {/* Retention rule picker */}
          <div>
            <label className="block text-xs font-semibold mb-1 text-gray-700">
              Add retention rule
            </label>
            <select
              className="border border-gray-300 rounded-md w-full px-3 py-2 text-sm"
              onChange={handleAddRule}
              disabled={loadingRules || !!rulesError}
            >
              <option value="">
                {loadingRules
                  ? "Loading retention rules…"
                  : rulesError
                    ? "Failed to load retention rules"
                    : "Select a retention rule"}
              </option>

              {!loadingRules &&
                !rulesError &&
                retentionRules
                  .filter((r) => {
                    const id = r._id || r.id;
                    return id && !selectedRuleIds.includes(id);
                  })
                  .map((r) => {
                    const id = r._id || r.id;
                    const label = r.title || r.name || id;
                    return (
                      <option key={id} value={id}>
                        {label} ({id})
                      </option>
                    );
                  })}
            </select>
            <div className="mt-1 text-[11px] text-gray-500">
              Select a rule to add it to this policy.
            </div>

            {/* Selected rules list */}
            <div className="mt-2">
              {selectedRuleIds.length ? (
                <div className="space-y-1">
                  {selectedRuleIds.map((id) => {
                    const r = rulesById[id];
                    const label = r ? r.title || r.name || id : id;
                    return (
                      <div
                        key={id}
                        className="flex items-center justify-between rounded border border-gray-200 px-2 py-1 text-xs bg-gray-50"
                      >
                        <span>{label}</span>
                        <button
                          type="button"
                          className="text-red-500 text-[11px]"
                          onClick={() => handleRemoveRule(id)}
                        >
                          Remove
                        </button>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-[11px] text-gray-400">
                  No retention rules selected.
                </div>
              )}
            </div>
          </div>

          {/* Default Rule Picker */}
          {selectedRuleIds.length > 0 && (
            <div>
              <label className="block text-xs font-semibold mb-1 text-gray-700">
                Default Retention Rule
              </label>
              <select
                className="border border-gray-300 rounded-md w-full px-3 py-2 text-sm"
                value={defaultRule}
                onChange={(e) => setDefaultRule(e.target.value)}
              >
                {selectedRuleIds.map((id) => {
                  const rule = rulesById[id];
                  const label = rule ? rule.title || rule.name || id : id;
                  return (
                    <option key={id} value={id}>
                      {label}
                    </option>
                  );
                })}
              </select>
            </div>
          )}
        </form>

        <div className="px-5 py-3 border-t border-gray-100 flex justify-end gap-2">
          <button
            type="button"
            className="rounded-lg border border-[#2B245C] bg-white px-4 py-2 text-sm font-medium text-[#2B245C] hover:bg-indigo-50 transition-all"
            onClick={onCancel}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="rounded-lg bg-[#2B245C] px-4 py-2 text-sm font-semibold text-white shadow-md hover:shadow-lg hover:bg-indigo-600 disabled:opacity-60 transition-all"
            onClick={(e) => guard(canSave, router, () => handleSubmit(e))}
            disabled={saving}
          >
            {saving ? "Saving…" : "Save policy"}
          </button>
        </div>
      </div>
    </div>
  );
};

const RETENTION_POLICIES_BASE = `${baseurl}/${initURL}/dataflow/retention-policies`;
const RETENTION_RULES_BASE = `${baseurl}/${initURL}/dataflow/retention-rules`;

const RetentionPoliciesPage = () => {
  const router = useRouter();

  const [policies, setPolicies] = useState([]);
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [loading, setLoading] = useState(false);
  const [loadingList, setLoadingList] = useState(false);
  const [error, setError] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [retentionRules, setRetentionRules] = useState([]);
  const [loadingRules, setLoadingRules] = useState(false);
  const [rulesError, setRulesError] = useState("");
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedPolicy, setSelectedPolicy] = useState(null);
  const [tourOpen, setTourOpen] = useState(false);

  // Permissions
  const canView = can("privacy.read");
  const canCreate = can("privacy.create");
  const canUpdate = can("privacy.update");
  const canDelete = can("privacy.delete");

  const fetchPolicies = async () => {
    setError("");
    setLoadingList(true);
    try {
      const res = await CustomAxios.get(RETENTION_POLICIES_BASE);
      setPolicies(res.data || []);
      setCurrentPage(1);
    } catch (e) {
      setError(
        e?.response?.data?.message ||
          e.message ||
          "Failed to load retention policies",
      );
    } finally {
      setLoadingList(false);
    }
  };

  const fetchRetentionRules = async () => {
    setRulesError("");
    setLoadingRules(true);
    try {
      const res = await CustomAxios.get(RETENTION_RULES_BASE);
      const data = res?.data;
      const list = Array.isArray(data) ? data : data?.items || [];
      setRetentionRules(list);
    } catch (e) {
      setRulesError(
        e?.response?.data?.message ||
          e?.response?.data?.error ||
          e.message ||
          "Failed to load retention rules",
      );
    } finally {
      setLoadingRules(false);
    }
  };

  useEffect(() => {
    fetchPolicies();
    fetchRetentionRules();
  }, []);

  const openNew = () => {
    setEditing(null);
    setDrawerOpen(true);
  };

  const openEdit = (policy) => {
    setEditing(policy);
    setDrawerOpen(true);
  };

  const deletePolicy = async (policy) => {
    if (!policy?._id) return;
    const label = policy.name || policy.title || "";
    setLoading(true);
    setError("");
    try {
      await CustomAxios.delete(`${RETENTION_POLICIES_BASE}/${policy._id}`);
      await fetchPolicies();
      toast.success("Policy deleted successfully");
    } catch (e) {
      setError(
        e?.response?.data?.message || e.message || "Failed to delete policy",
      );
      toast.error(
        e?.response?.data?.message || e.message || "Failed to delete policy",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (payload) => {
    setSaving(true);
    setError("");
    try {
      if (editing?._id) {
        await CustomAxios.patch(
          `${RETENTION_POLICIES_BASE}/${editing._id}`,
          payload,
        );
      } else {
        await CustomAxios.post(RETENTION_POLICIES_BASE, payload);
      }
      setDrawerOpen(false);
      setEditing(null);
      await fetchPolicies();
    } catch (e) {
      setError(
        e?.response?.data?.message || e.message || "Failed to save policy",
      );
    } finally {
      setSaving(false);
    }
  };

  const rows = useMemo(
    () => (Array.isArray(policies) ? policies : []),
    [policies],
  );

  // Pagination calculations
  const totalPages = Math.ceil(rows.length / rowsPerPage);

  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;

  const currentRows = rows.slice(indexOfFirstRow, indexOfLastRow);

  const steps = [
    {
      target: '[data-tour="rp-header"]',
      title: "Retention Policies",
      content:
        "This page allows you to define how long data should be retained and what actions apply when the retention period ends.",
      placement: "bottom",
    },
    {
      target: '[data-tour="rp-create"]',
      title: "Create Policy",
      content: "Use this button to add a new retention policy.",
      placement: "bottom",
    },
    {
      target: '[data-tour="rp-toolbar"]',
      title: "Toolbar",
      content:
        "Use this section to refresh the policy list and review the total number of available policies.",
      placement: "bottom",
    },
    {
      target: '[data-tour="rp-table"]',
      title: "Policies Table",
      content:
        "This table displays all retention policies with their name and description. Use Edit to update a policy. Use Delete to remove a policy that is no longer needed.",
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
          data-tour="rp-header"
        >
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-cyan-50">
                Retention Policies
              </h1>
              <p className="mt-1 text-sm text-white">
                Define how long to retain data and what should happen when the
                retention period expires.
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
                data-tour="rp-create"
                className="rounded-lg bg-white text-[#2B245C] px-6 py-2.5 text-sm font-semibold shadow-md hover:shadow-lg hover:bg-gray-50 transition-all"
                onClick={() => guard(canCreate, router, openNew)}
              >
                + New Policy
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div className="text-sm text-red-600 border border-red-200 bg-red-50 px-3 py-2 rounded-md">
            {error}
          </div>
        )}

        {loading && <div className="text-xs text-gray-500">Working…</div>}

        {/* Policy Table */}
        <div className="py-5 space-y-5">
          <div
            className="rounded-2xl border border-[#2B245C] bg-white p-5 shadow-lg hover:shadow-2xl transition-shadow duration-300"
            data-tour="rp-toolbar"
          >
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => fetchPolicies()}
                disabled={loadingList}
                className="rounded-lg border border-[#2B245C] bg-white px-3 py-1.5 text-sm font-medium text-[#2B245C] hover:bg-indigo-50 transition-all"
              >
                {loadingList ? "Refreshing…" : "Refresh"}
              </button>
              {canView && (
                <div className="text-xs text-gray-500">
                  {rows.length} policies
                </div>
              )}
              {loadingList && (
                <span className="text-xs text-gray-400">Loading…</span>
              )}
            </div>
          </div>

          {/* List of existing policies */}
          <div
            className="rounded-2xl border border-[#2B245C] bg-white p-6 shadow-lg hover:shadow-2xl transition-shadow duration-300"
            data-tour="rp-table"
          >
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-2xl font-semibold text-[#2B245C]">
                Policies
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
                    <th className="px-4 py-2 font-medium">Description</th>
                    <th className="px-4 py-2 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {!canView ? (
                    <tr>
                      <td
                        colSpan={3}
                        className="px-4 py-4 text-center text-red-600 font-medium"
                      >
                        You don’t have permission to view retention policies.
                      </td>
                    </tr>
                  ) : rows.length === 0 ? (
                    <tr>
                      <td
                        colSpan={3}
                        className="px-4 py-4 text-center text-gray-600"
                      >
                        No retention policies yet.
                      </td>
                    </tr>
                  ) : (
                    currentRows.map((policy) => (
                      <tr key={policy._id}>
                        <td className="px-4 py-2">{policy.name}</td>
                        <td className="px-4 py-2">{policy.description}</td>

                        <td className="px-4 py-2 text-xs">
                          <div className="flex items-center gap-2">
                            <button
                              className="rounded-lg border border-[#2B245C] bg-white px-2.5 py-1 text-xs font-medium text-[#2B245C] hover:bg-indigo-50 transition-all"
                              onClick={() =>
                                guard(canUpdate, router, () => openEdit(policy))
                              }
                            >
                              Edit
                            </button>
                            <button
                              className="rounded-lg border border-red-200 bg-white px-2.5 py-1 text-xs font-medium text-red-700 hover:bg-red-50 transition-all"
                              onClick={() =>
                                guard(canDelete, router, () => {
                                  setSelectedPolicy(policy);
                                  setDeleteModalOpen(true);
                                })
                              }
                            >
                              Delete
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
          </div>
        </div>
      </div>

      {/* Drawer for create/edit */}
      {drawerOpen && (
        <RetentionPolicyForm
          initialValue={editing}
          onCancel={() => setDrawerOpen(false)}
          onSave={handleSave}
          saving={saving}
          retentionRules={retentionRules}
          loadingRules={loadingRules}
          rulesError={rulesError}
          canSave={editing?._id ? canUpdate : canCreate}
          router={router}
        />
      )}

      {/* Delete Modal */}
      {deleteModalOpen && (
        <div className="fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-black/30 backdrop-blur-sm"
            onClick={() => {
              setDeleteModalOpen(false);
              setSelectedPolicy(null);
            }}
          />

          <div className="absolute inset-0 flex items-center justify-center p-4">
            <div
              className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-6 space-y-5 shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-xl font-semibold text-[#2B245C]">
                Delete Retention Policy
              </h3>

              <p className="mt-3 text-sm text-gray-600">
                Are you sure you want to delete{" "}
                <span className="font-semibold text-gray-900">
                  {selectedPolicy?.name}
                </span>
                ?
              </p>

              <p className="text-sm text-red-600">
                This action cannot be undone.
              </p>

              <div className="mt-6 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setDeleteModalOpen(false);
                    setSelectedPolicy(null);
                  }}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium hover:bg-gray-50"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={async () => {
                    await deletePolicy(selectedPolicy);
                    setDeleteModalOpen(false);
                    setSelectedPolicy(null);
                  }}
                  className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <Tour steps={steps} open={tourOpen} onClose={() => setTourOpen(false)} />
    </div>
  );
};

export default RetentionPoliciesPage;
