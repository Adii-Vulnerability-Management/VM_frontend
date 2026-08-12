import React, { useEffect, useState, useRef } from "react";
import CustomAxios from "@/globalcomponents/CustomAxios";
import { baseurl, initURL } from "@/config/config";
import DataFlowNav from "../../Nav";
import { useRouter } from "next/router";
import { can, guard } from "@/auth/auth-permissions";
import SelectBpa from "@/components/dataflow/SelectBpa";
import SelectAsset from "@/components/dataflow/SelectAsset";
import SelectVendor from "@/components/dataflow/SelectVendor";
import SelectRegion from "@/components/dataflow/SelectRegion";
import GuideButton from "@/components/Tour/GuideButton";
import Tour from "@/components/Tour/Tour";
import { toast } from "react-toastify";

const FormField = ({ label, required = false, children, className = "" }) => (
  <div className={`flex flex-col ${className}`}>
    <label className="text-sm font-medium text-gray-700 mb-2">
      {label}
      {required && <span className="text-red-500 ml-1">*</span>}
    </label>
    {children}
  </div>
);

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

export default function SystemActivitiesPage() {
  const router = useRouter();

  const apiBase = `${baseurl}/${initURL}/dataflow/system-activities`;
  const [items, setItems] = useState([]);
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [form, setForm] = useState({
    bpaId: "",
    assetId: "",
    roleAtActivity: "",
    vendorId: null,
    interfaces: "api",
    regions: "", // keep CSV (backend unchanged)
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [archiveModalOpen, setArchiveModalOpen] = useState(false);
  const [systemActivityToArchive, setSystemActivityToArchive] = useState(null);
  const [tourOpen, setTourOpen] = useState(false);

  // Permissions
  const canView = can("privacy.read");
  const canCreate = can("privacy.create");
  const canDelete = can("privacy.delete");

  const showName = (it, key) => {
    const obj = it?.[key] || it?.[key.replace("Id", "")] || null;

    if (obj && typeof obj === "object") {
      return obj.name || obj.title || obj.label || obj._id || "—";
    }

    const nameField = it?.[key.replace("Id", "Name")];
    return nameField || it?.[key] || "—";
  };

  async function load() {
    setError("");
    try {
      setLoading(true);
      const res = await CustomAxios.get(apiBase);

      const raw = Array.isArray(res?.data?.items)
        ? res.data.items
        : Array.isArray(res?.data)
          ? res.data
          : [];

      const toArray = (v) =>
        Array.isArray(v)
          ? v
          : typeof v === "string"
            ? v
                .split(",")
                .map((s) => s.trim())
                .filter(Boolean)
            : [];

      const normalized = raw.map((it) => ({
        ...it,
        interfaces: toArray(it.interfaces),
        regions: toArray(it.regions),
        safeguards: toArray(it.safeguards),
      }));

      setItems(normalized);
      setCurrentPage(1);
    } catch (e) {
      setError(
        e?.response?.data?.message ||
          e.message ||
          "Failed to load system activities",
      );
      setItems([]);
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
      const body = {
        bpaId: form.bpaId,
        assetId: form.assetId,
        roleAtActivity: form.roleAtActivity,
        vendorId: form.vendorId ?? undefined,
        interfaces: form.interfaces
          ? form.interfaces
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean)
          : undefined,
        regions: form.regions
          ? form.regions
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean)
          : undefined,
      };

      await CustomAxios.post(apiBase, body);

      setForm({
        bpaId: "",
        assetId: "",
        roleAtActivity: "inherited",
        vendorId: null,
        interfaces: "api",
        regions: "",
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
    setSystemActivityToArchive(activity);
    setArchiveModalOpen(true);
  };

  const handleArchiveConfirm = async () => {
    if (!systemActivityToArchive) return;

    await archive(systemActivityToArchive._id);

    setArchiveModalOpen(false);
    setSystemActivityToArchive(null);
  };

  const closeArchiveModal = () => {
    setArchiveModalOpen(false);
    setSystemActivityToArchive(null);
  };

  const steps = [
    {
      target: '[data-tour="sysact-header"]',
      title: "System Activities",
      content:
        "This page links activities to assets, vendors, interfaces, and regions.",
      placement: "bottom",
    },
    {
      target: '[data-tour="sysact-new-button"]',
      title: "New System Activity",
      content: "Click here to create a new system activity.",
      placement: "left",
    },
    {
      target: '[data-tour="sysact-table-section"]',
      title: "All System Activities",
      content:
        "This table shows all system activities with BPA, asset, vendor, interfaces, and regions. Archive removes the system activity from the list.",
      placement: "top",
    },
    {
      target: '[data-tour="sysact-refresh-button"]',
      title: "Refresh",
      content: "Reload the system activities list.",
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
          data-tour="sysact-header"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-cyan-50">
                System Activities
              </h1>
              <p className="mt-1 text-sm text-white">
                Link activities to assets/vendors, interfaces, and regions.
              </p>
            </div>

            <div className="flex items-center gap-3">
              {/* Help Button */}
              <GuideButton
                onClick={() => setTourOpen(true)}
                variant="primary"
                size="md"
                className="!from-blue-500 !to-blue-600 hover:!from-blue-400 hover:!to-blue-500 !text-white !border-blue-400/70 !shadow-blue-600/30"
              >
                Help
              </GuideButton>

              <button
                data-tour="sysact-new-button"
                onClick={() =>
                  guard(canCreate, router, () => {
                    setModalOpen(true);
                    setError("");
                  })
                }
                className="rounded-lg bg-white text-[#2B245C] px-6 py-2.5 text-sm font-semibold shadow-md hover:shadow-lg hover:bg-gray-100 transition-all"
              >
                + New System Activity
              </button>
            </div>
          </div>
        </div>

        <div className="py-5 space-y-5">
          {/* Table */}
          <section
            className="rounded-2xl border border-[#2B245C] bg-white p-6 shadow-lg hover:shadow-2xl transition-shadow duration-300"
            data-tour="sysact-table-section"
          >
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-[#2B245C]">
                All System Activities
              </h2>
              <div className="flex items-center gap-3">
                {canView && (
                  <span className="text-sm text-gray-600">
                    Showing {indexOfFirstRow + 1}–
                    {Math.min(indexOfLastRow, items.length)} of {items.length}
                  </span>
                )}
                <button
                  data-tour="sysact-refresh-button"
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
                    <th className="px-4 py-2 font-medium">BPA</th>
                    <th className="px-4 py-2 font-medium">Asset</th>
                    <th className="px-4 py-2 font-medium">Role</th>
                    <th className="px-4 py-2 font-medium">Vendor</th>
                    <th className="px-4 py-2 font-medium">Interfaces</th>
                    <th className="px-4 py-2 font-medium">Regions</th>
                    <th className="px-4 py-2 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {!canView ? (
                    <tr>
                      <td
                        className="px-4 py-6 text-center text-red-600 font-medium"
                        colSpan={7}
                      >
                        You don’t have permission to view system activities.
                      </td>
                    </tr>
                  ) : loading ? (
                    [...Array(4)].map((_, i) => (
                      <tr key={i}>
                        <td className="px-4 py-3">
                          <div className="h-4 w-36 animate-nonerounded bg-gray-100" />
                        </td>
                        <td className="px-4 py-3">
                          <div className="h-4 w-36 animate-nonerounded bg-gray-100" />
                        </td>
                        <td className="px-4 py-3">
                          <div className="h-4 w-20 animate-nonerounded bg-gray-100" />
                        </td>
                        <td className="px-4 py-3">
                          <div className="h-4 w-28 animate-nonerounded bg-gray-100" />
                        </td>
                        <td className="px-4 py-3">
                          <div className="h-4 w-56 animate-nonerounded bg-gray-100" />
                        </td>
                        <td className="px-4 py-3">
                          <div className="h-4 w-56 animate-nonerounded bg-gray-100" />
                        </td>
                        <td className="px-4 py-3">
                          <div className="h-7 w-20 animate-nonerounded bg-gray-100" />
                        </td>
                      </tr>
                    ))
                  ) : (items || []).length === 0 ? (
                    <tr>
                      <td
                        className="px-4 py-6 text-center text-gray-600"
                        colSpan={7}
                      >
                        No system activities yet.
                      </td>
                    </tr>
                  ) : (
                    currentRows.map((it) => (
                      <tr key={it._id} className="hover:bg-gray-50">
                        <td className="px-4 py-2">{showName(it, "bpaId")}</td>
                        <td className="px-4 py-2">{showName(it, "assetId")}</td>
                        <td className="px-4 py-2">
                          <span className="inline-flex items-center rounded-full border border-gray-200 bg-gray-50 px-2 py-0.5 text-xs text-gray-700">
                            {it.roleAtActivity}
                          </span>
                        </td>
                        <td className="px-4 py-2">
                          {showName(it, "vendorId")}
                        </td>
                        <td className="px-4 py-2 text-sm">
                          {Array.isArray(it.interfaces) &&
                          it.interfaces.length ? (
                            <div className="flex flex-wrap gap-1">
                              {it.interfaces.map((v, idx) => (
                                <span
                                  key={idx}
                                  className="rounded-full border border-gray-200 bg-gray-50 px-2 py-0.5 text-xs text-gray-700"
                                >
                                  {v}
                                </span>
                              ))}
                            </div>
                          ) : (
                            "—"
                          )}
                        </td>
                        <td className="px-4 py-2 text-sm">
                          {Array.isArray(it.regions) && it.regions.length ? (
                            <div className="flex flex-wrap gap-1">
                              {it.regions.map((r, idx) => (
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
                          <div className="flex justify-start">
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
              <div className="mt-4 flex items-center justify-between">
                {/* Rows per page */}
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">Rows per page:</span>

                  <select
                    className="rounded border px-2 py-1 text-sm"
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
                <div className="flex gap-2">
                  <button
                    className="rounded-lg bg-[#2B245C] text-white px-4 py-2 text-sm font-semibold shadow-md hover:shadow-lg hover:bg-opacity-90 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-200 ease-in-out"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((p) => p - 1)}
                  >
                    Prev
                  </button>

                  <span className="flex items-center px-2 text-sm">
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
        <Modal onClose={() => setModalOpen(false)}>
          <form onSubmit={create} className="space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold text-[#2B245C]">
                Create System Activity
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
              <SelectBpa
                value={form.bpaId || null}
                onChange={(id) =>
                  setForm((f) => ({
                    ...f,
                    bpaId: id ?? null,
                    assetId: null,
                  }))
                }
                className="w-full"
              />

              <SelectAsset
                value={form.assetId ?? null}
                onChange={(id) =>
                  setForm((f) => ({ ...f, assetId: id ?? null }))
                }
                className="w-full"
                bpaId={form.bpaId || undefined}
              />

              <SelectVendor
                value={form.vendorId ?? null}
                onChange={(id) =>
                  setForm((f) => ({ ...f, vendorId: id ?? null }))
                }
                className="w-full"
              />

              <FormField label="Role at Activity">
                <select
                  className="rounded-lg border border-gray-200 px-3 py-2 text-sm"
                  value={form.roleAtActivity}
                  onChange={(e) =>
                    setForm({ ...form, roleAtActivity: e.target.value })
                  }
                >
                  <option value="" disabled>
                    Select Role at Activity
                  </option>
                  <option value="inherited">Inherited</option>
                  <option value="controller">Controller</option>
                  <option value="processor">Processor</option>
                  <option value="joint">Joint</option>
                </select>
              </FormField>

              <FormField label="Interfaces">
                <input
                  className="rounded-lg border border-gray-200 px-3 py-2 text-sm"
                  placeholder="Enter interfaces (csv)"
                  value={form.interfaces}
                  onChange={(e) =>
                    setForm({ ...form, interfaces: e.target.value })
                  }
                />
              </FormField>

              {/* ✅ Regions multi-select UI (Region = 1 col like Vendor, chips row full width) */}
              {(() => {
                const selectedRegions = (form.regions || "")
                  .split(",")
                  .map((s) => s.trim())
                  .filter(Boolean);

                const addRegion = (code) => {
                  if (!code) return;
                  const next = Array.from(
                    new Set([...selectedRegions, String(code)]),
                  );
                  setForm((f) => ({ ...f, regions: next.join(", ") }));
                };

                const removeRegion = (code) => {
                  const next = selectedRegions.filter((r) => r !== code);
                  setForm((f) => ({ ...f, regions: next.join(", ") }));
                };

                return (
                  <>
                    {/* Region dropdown: same width as Vendor */}
                    <div className="space-y-2">
                      <SelectRegion
                        value={null}
                        onChange={addRegion}
                        className="w-full"
                      />
                    </div>

                    {/* Selected chips row */}
                    {selectedRegions.length > 0 && (
                      <div className="md:col-span-3 flex flex-wrap items-center gap-2 border p-3 rounded-lg">
                        <span className="text-sm text-gray-700 font-medium">
                          Selected region(s):
                        </span>
                        {selectedRegions.map((r) => (
                          <span
                            key={r}
                            className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-gray-50 px-2 py-0.5 text-xs text-gray-700"
                          >
                            {r}
                            <button
                              type="button"
                              className="text-gray-500 hover:text-gray-800"
                              onClick={() => removeRegion(r)}
                              aria-label={`Remove region ${r}`}
                            >
                              ×
                            </button>
                          </span>
                        ))}

                        <button
                          type="button"
                          className="ml-1 text-xs text-gray-600 hover:underline"
                          onClick={() =>
                            setForm((f) => ({ ...f, regions: "" }))
                          }
                        >
                          Clear
                        </button>
                      </div>
                    )}
                  </>
                );
              })()}
            </div>

            <div className="flex gap-2">
              <button
                className="rounded-lg bg-[#2B245C] text-white px-4 py-2 text-sm font-semibold shadow-md hover:shadow-lg hover:bg-opacity-90 transition-all disabled:opacity-60"
                disabled={saving || !canCreate}
              >
                {saving ? "Saving…" : "Add System Activity"}
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
              Archive System Activity
            </h3>

            <p className="text-gray-600">
              Are you sure you want to archive this system activity?
            </p>

            <div className="rounded-lg bg-gray-50 border border-gray-200 p-3 text-sm">
              <div>
                <strong>BPA:</strong>{" "}
                {systemActivityToArchive &&
                  showName(systemActivityToArchive, "bpaId")}
              </div>

              <div className="mt-1">
                <strong>Asset:</strong>{" "}
                {systemActivityToArchive &&
                  showName(systemActivityToArchive, "assetId")}
              </div>

              <div className="mt-1">
                <strong>Vendor:</strong>{" "}
                {systemActivityToArchive &&
                  showName(systemActivityToArchive, "vendorId")}
              </div>
            </div>

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
