/* pages/admin/dataFlow/vendors/index.js
   Admin UI: Vendors registry (CRUD - compact)
   Arrays are entered as CSV for simplicity. Adjust routes if your backend differs.
*/
import React, { useEffect, useState, useRef } from "react";
import CustomAxios from "@/globalcomponents/CustomAxios";
import { baseurl, initURL } from "@/config/config";
import DataFlowNav from "../../Nav";
import { toast } from "react-toastify";
import { useRouter } from "next/router";
import GuideButton from "@/components/Tour/GuideButton";
import Tour from "@/components/Tour/Tour";
import { can, guard } from "@/auth/auth-permissions";
import SelectRegion from "@/components/dataflow/SelectRegion";

const csvToArray = (s = "") =>
  s
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean);
const arrayToCsv = (arr = []) => (Array.isArray(arr) ? arr.join(", ") : "");

const FormField = ({ label, required = false, children, className = "" }) => (
  <div className={`flex flex-col ${className}`}>
    <label className="text-xs font-medium text-gray-700 mb-2">
      {label}
      {required && <span className="text-red-500 ml-1">*</span>}
    </label>
    {children}
  </div>
);

export default function VendorsPage() {
  const router = useRouter();

  const [items, setItems] = useState([]);
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [archiveModalOpen, setArchiveModalOpen] = useState(false);
  const [vendorToArchive, setVendorToArchive] = useState(null);
  const [tourOpen, setTourOpen] = useState(false);

  const [form, setForm] = useState({
    name: "",
    legalEntity: "",
    contactEmail: "",
    region: null,
    servicesCsv: "",
    rolesCsv: "",
    dpaRef: "",
    baaRef: "",
    sccRefsCsv: "",
    bcrRef: "",
    soc2Ref: "",
    iso27001Ref: "",
    pciAocRef: "",
    subProcessorsCsv: "",
    riskScore: "",
    lastReviewAt: "",
  });

  const apiBase = `${baseurl}/${initURL}/dataflow/vendors`;

  const canView = can("privacy.read");
  const canCreate = can("privacy.create");
  const canUpdate = can("privacy.update");
  const canDelete = can("privacy.delete");

  const fetchItems = async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await CustomAxios.get(apiBase);
      setItems(data || []);
      setCurrentPage(1);
    } catch (e) {
      setError(
        e?.response?.data?.message || e.message || "Failed to load vendors",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const resetForm = () => {
    setForm({
      name: "",
      legalEntity: "",
      contactEmail: "",
      region: null,
      servicesCsv: "",
      rolesCsv: "",
      dpaRef: "",
      baaRef: "",
      sccRefsCsv: "",
      bcrRef: "",
      soc2Ref: "",
      iso27001Ref: "",
      pciAocRef: "",
      subProcessorsCsv: "",
      riskScore: "",
      lastReviewAt: "",
    });
    setEditingId(null);
    setError("");
  };

  const openCreate = () => {
    resetForm();
    setModalOpen(true);
  };
  const openEdit = (it) => {
    onEdit(it);
    setModalOpen(true);
  };

  const confirmArchive = (vendor) => {
    setVendorToArchive(vendor);
    setArchiveModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const payload = {
      name: form.name.trim(),
      legalEntity: form.legalEntity || undefined,
      contactEmail: form.contactEmail || undefined,
      regions: form.region ? [form.region] : [],
      services: csvToArray(form.servicesCsv),
      roles: csvToArray(form.rolesCsv),
      dpaRef: form.dpaRef || undefined,
      baaRef: form.baaRef || undefined,
      sccRefs: csvToArray(form.sccRefsCsv),
      bcrRef: form.bcrRef || undefined,
      soc2Ref: form.soc2Ref || undefined,
      iso27001Ref: form.iso27001Ref || undefined,
      pciAocRef: form.pciAocRef || undefined,
      subProcessors: csvToArray(form.subProcessorsCsv),
      riskScore: form.riskScore ? Number(form.riskScore) : undefined,
      lastReviewAt: form.lastReviewAt || undefined,
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
      resetForm();
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
      legalEntity: it.legalEntity || "",
      contactEmail: it.contactEmail || "",
      region:
        Array.isArray(it.regions) && it.regions.length ? it.regions[0] : null,
      servicesCsv: arrayToCsv(it.services),
      rolesCsv: arrayToCsv(it.roles),
      dpaRef: it.dpaRef || "",
      baaRef: it.baaRef || "",
      sccRefsCsv: arrayToCsv(it.sccRefs),
      bcrRef: it.bcrRef || "",
      soc2Ref: it.soc2Ref || "",
      iso27001Ref: it.iso27001Ref || "",
      pciAocRef: it.pciAocRef || "",
      subProcessorsCsv: arrayToCsv(it.subProcessors),
      riskScore: it.riskScore ?? "",
      lastReviewAt: it.lastReviewAt ? String(it.lastReviewAt).slice(0, 10) : "",
    });
  };

  const onArchive = async (id) => {
    try {
      await CustomAxios.delete(`${apiBase}/${id}`);
      toast.success("Vendor archived successfully");
      await fetchItems();
    } catch (e) {
      toast.error(e?.response?.data?.message || e.message || "Archive failed");
    }
  };

  const handleArchiveConfirm = async () => {
    if (!vendorToArchive) return;

    await onArchive(vendorToArchive._id);

    setArchiveModalOpen(false);
    setVendorToArchive(null);
  };

  const closeArchiveModal = () => {
    setArchiveModalOpen(false);
    setVendorToArchive(null);
  };

  const steps = [
    {
      target: '[data-tour="vendors-header"]',
      title: "Vendors",
      content:
        "This page is used to manage the vendors registry, including processors, regions, contracts, and risk details.",
      placement: "bottom",
    },
    {
      target: '[data-tour="vendors-new-button"]',
      title: "New Vendor",
      content: "Click here to create a new vendor record.",
      placement: "left",
    },
    {
      target: '[data-tour="vendors-table-section"]',
      title: "All Vendors",
      content:
        "This section shows the full vendors list with roles, regions, DPA/BAA references, and risk score. Use Edit to update a vendor and Archive to remove it from the active registry.",
      placement: "top",
    },
    {
      target: '[data-tour="vendors-refresh-button"]',
      title: "Refresh",
      content: "Use this button to reload the vendors list from the server.",
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
          data-tour="vendors-header"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-cyan-50">Vendors</h1>
              <p className="mt-1 text-sm text-white">
                Registry of processors, regions, contracts, and risk.
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
                data-tour="vendors-new-button"
                onClick={() => guard(canCreate, router, openCreate)}
                className="rounded-lg bg-white text-[#2B245C] px-6 py-2.5 text-sm font-semibold shadow-md hover:shadow-lg hover:bg-gray-100 transition-all"
              >
                + New Vendor
              </button>
            </div>
          </div>
        </div>

        <div className="py-5 space-y-5">
          {/* Table */}
          <section
            className="rounded-2xl border border-[#2B245C] bg-white p-6 shadow-lg hover:shadow-2xl transition-shadow duration-300"
            data-tour="vendors-table-section"
          >
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-[#2B245C]">All Vendors</h2>
              <div className="flex items-center gap-3">
                {canView && (
                  <span className="text-sm text-gray-600">
                    Showing {items.length === 0 ? 0 : indexOfFirstRow + 1}–
                    {Math.min(indexOfLastRow, items.length)} of {items.length}
                  </span>
                )}
                <button
                  data-tour="vendors-refresh-button"
                  className="rounded-lg border border-[#2B245C] bg-white px-3 py-1.5 text-sm font-medium text-[#2B245C] hover:bg-indigo-50"
                  onClick={fetchItems}
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
                    <th className="px-4 py-2 font-medium">Roles</th>
                    <th className="px-4 py-2 font-medium">Regions</th>
                    <th className="px-4 py-2 font-medium">DPA/BAA</th>
                    <th className="px-4 py-2 font-medium">Risk</th>
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
                        You don’t have permission to view vendors.
                      </td>
                    </tr>
                  ) : loading ? (
                    [...Array(4)].map((_, i) => (
                      <tr key={i}>
                        <td className="px-4 py-3">
                          <div className="h-4 w-40 animate-nonerounded bg-gray-100" />
                        </td>
                        <td className="px-4 py-3">
                          <div className="h-4 w-48 animate-nonerounded bg-gray-100" />
                        </td>
                        <td className="px-4 py-3">
                          <div className="h-4 w-48 animate-nonerounded bg-gray-100" />
                        </td>
                        <td className="px-4 py-3">
                          <div className="h-4 w-24 animate-nonerounded bg-gray-100" />
                        </td>
                        <td className="px-4 py-3">
                          <div className="h-4 w-16 animate-nonerounded bg-gray-100" />
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
                        colSpan={6}
                      >
                        No vendors yet.
                      </td>
                    </tr>
                  ) : (
                    currentRows.map((it) => (
                      <tr key={it._id} className="hover:bg-gray-50">
                        <td className="px-4 py-2">
                          <div className="font-medium text-gray-900">
                            {it.name}
                          </div>
                          <div className="text-xs text-gray-500">
                            {it.contactEmail || "—"}
                          </div>
                        </td>
                        <td className="px-4 py-2">
                          {(it.roles || []).length ? (
                            <div className="flex flex-wrap gap-1">
                              {(it.roles || []).map((r, idx) => (
                                <span
                                  key={idx}
                                  className="rounded-full border border-gray-200 bg-gray-50 px-2 py-0.5 text-xs text-gray-700"
                                >
                                  {r}
                                </span>
                              ))}
                            </div>
                          ) : (
                            "—"
                          )}
                        </td>
                        <td className="px-4 py-2">
                          {(it.regions || []).length ? (
                            <div className="flex flex-wrap gap-1">
                              {(it.regions || []).map((rg, idx) => (
                                <span
                                  key={idx}
                                  className="rounded-full border border-gray-200 bg-gray-50 px-2 py-0.5 text-xs text-gray-700"
                                >
                                  {rg}
                                </span>
                              ))}
                            </div>
                          ) : (
                            "—"
                          )}
                        </td>
                        <td className="px-4 py-2">
                          {(it.dpaRef || "-") + " / " + (it.baaRef || "-")}
                        </td>
                        <td className="px-4 py-2">{it.riskScore ?? "—"}</td>
                        <td className="px-4 py-2">
                          <div className="flex gap-2">
                            <button
                              className="rounded-lg border border-[#2B245C] bg-white px-2.5 py-1.5 text-xs font-medium text-[#2B245C] hover:bg-blue-50 transition-all"
                              onClick={() =>
                                guard(canUpdate, router, () => openEdit(it))
                              }
                            >
                              Edit
                            </button>
                            <button
                              className="rounded-lg border border-red-200 bg-white px-2.5 py-1.5 text-xs font-medium text-red-700 hover:bg-red-50"
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
            {items.length > 0 && (
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
            resetForm();
          }}
        >
          <form className="space-y-5" onSubmit={handleSubmit}>
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold text-[#2B245C]">
                {editingId ? "Edit Vendor" : "Create New Vendor"}
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

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField label="Name" required>
                <input
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Enter vendor name"
                  required
                />
              </FormField>

              <FormField label="Legal Entity">
                <input
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                  value={form.legalEntity}
                  onChange={(e) =>
                    setForm({ ...form, legalEntity: e.target.value })
                  }
                  placeholder="Enter legal entity name"
                />
              </FormField>

              <FormField label="Contact Email">
                <input
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                  value={form.contactEmail}
                  onChange={(e) =>
                    setForm({ ...form, contactEmail: e.target.value })
                  }
                  type="email"
                  placeholder="Enter contact email address"
                />
              </FormField>

              <div className="md:col-span-3">
                <SelectRegion
                  value={form.region}
                  onChange={(code) =>
                    setForm((current) => ({ ...current, region: code }))
                  }
                  className="w-full"
                />
              </div>

              <div className="md:col-span-3">
                <FormField label="Services (CSV)">
                  <input
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                    value={form.servicesCsv}
                    onChange={(e) =>
                      setForm({ ...form, servicesCsv: e.target.value })
                    }
                    placeholder="e.g. Cloud Hosting, Email Delivery, Payment Processing"
                  />
                </FormField>
              </div>

              <div className="md:col-span-3">
                <FormField label="Roles (CSV)">
                  <input
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                    value={form.rolesCsv}
                    onChange={(e) =>
                      setForm({ ...form, rolesCsv: e.target.value })
                    }
                    placeholder="e.g. Processor, Sub-processor, Controller"
                  />
                </FormField>
              </div>

              <div className="md:col-span-3 border p-4 rounded-lg">
                <FormField label="Contracts & Safeguards">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-1">
                    <FormField label="DPA reference">
                      <input
                        className="rounded-lg border border-gray-200 px-3 py-2 text-sm"
                        placeholder="Enter Data Processing Agreement reference"
                        value={form.dpaRef}
                        onChange={(e) =>
                          setForm({ ...form, dpaRef: e.target.value })
                        }
                      />
                    </FormField>

                    <FormField label="BAA reference">
                      <input
                        className="rounded-lg border border-gray-200 px-3 py-2 text-sm"
                        placeholder="Enter Business Associate Agreement reference"
                        value={form.baaRef}
                        onChange={(e) =>
                          setForm({ ...form, baaRef: e.target.value })
                        }
                      />
                    </FormField>

                    <FormField label="SCC reference">
                      <input
                        className="rounded-lg border border-gray-200 px-3 py-2 text-sm"
                        placeholder="e.g. SCC-2021, SCC-Module-2"
                        value={form.sccRefsCsv}
                        onChange={(e) =>
                          setForm({ ...form, sccRefsCsv: e.target.value })
                        }
                      />
                    </FormField>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3">
                    <FormField label="BCR reference">
                      <input
                        className="rounded-lg border border-gray-200 px-3 py-2 text-sm"
                        placeholder="Enter Binding Corporate Rules reference"
                        value={form.bcrRef}
                        onChange={(e) =>
                          setForm({ ...form, bcrRef: e.target.value })
                        }
                      />
                    </FormField>

                    <FormField label="SOC 2 Reference">
                      <input
                        className="rounded-lg border border-gray-200 px-3 py-2 text-sm"
                        placeholder="Enter SOC 2 report reference"
                        value={form.soc2Ref}
                        onChange={(e) =>
                          setForm({ ...form, soc2Ref: e.target.value })
                        }
                      />
                    </FormField>

                    <FormField label="ISO 27001 Reference">
                      <input
                        className="rounded-lg border border-gray-200 px-3 py-2 text-sm"
                        placeholder="Enter ISO 27001 certificate reference"
                        value={form.iso27001Ref}
                        onChange={(e) =>
                          setForm({ ...form, iso27001Ref: e.target.value })
                        }
                      />
                    </FormField>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3">
                    <FormField label="PCI AOC Reference">
                      <input
                        className="rounded-lg border border-gray-200 px-3 py-2 text-sm"
                        placeholder="Enter PCI Attestation of Compliance reference"
                        value={form.pciAocRef}
                        onChange={(e) =>
                          setForm({ ...form, pciAocRef: e.target.value })
                        }
                      />
                    </FormField>

                    <FormField label="Sub-processors">
                      <input
                        className="rounded-lg border border-gray-200 px-3 py-2 text-sm"
                        placeholder="e.g. AWS, Stripe, Twilio"
                        value={form.subProcessorsCsv}
                        onChange={(e) =>
                          setForm({ ...form, subProcessorsCsv: e.target.value })
                        }
                      />
                    </FormField>

                    <FormField label="Risk Score">
                      <input
                        className="rounded-lg border border-gray-200 px-3 py-2 text-sm"
                        type="number"
                        min="0"
                        max="100"
                        placeholder="Enter a score between 0 and 100"
                        value={form.riskScore}
                        onChange={(e) =>
                          setForm({ ...form, riskScore: e.target.value })
                        }
                      />
                    </FormField>
                  </div>
                </FormField>
              </div>

              <div>
                <FormField label="Last Review">
                  <input
                    type="date"
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                    value={form.lastReviewAt}
                    onChange={(e) =>
                      setForm({ ...form, lastReviewAt: e.target.value })
                    }
                  />
                </FormField>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                disabled={saving}
                className="rounded-lg bg-[#2B245C] text-white px-4 py-2 text-sm font-semibold shadow-md hover:shadow-lg hover:bg-opacity-90 transition-all disabled:opacity-60"
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
        <Modal onClose={closeArchiveModal}>
          <div className="space-y-5">
            <h3 className="text-xl font-semibold text-[#2B245C]">
              Archive Vendor
            </h3>

            <p className="text-gray-600">
              Are you sure you want to archive{" "}
              <span className="font-semibold">{vendorToArchive?.name}</span>?
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

/** Simple Tailwind modal */
function Modal({ children, onClose }) {
  const panelRef = useRef(null);

  // keep the latest onClose in a ref so the keydown handler can be stable
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    // stable keydown handler
    const onKey = (e) => {
      if (e.key === "Escape") onCloseRef.current?.();
    };
    document.addEventListener("keydown", onKey);

    // focus the panel ONCE, when the modal mounts
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
          className="w-full max-w-4xl rounded-2xl border border-gray-200 bg-white p-5 shadow-xl outline-none"
          onClick={(e) => e.stopPropagation()}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
