/* pages/admin/dataFlow/vendors/index.js
   Admin UI: Vendors registry (CRUD - compact)
   Arrays are entered as CSV for simplicity. Adjust routes if your backend differs.
*/
import React, { useEffect, useState, useCallback, useRef } from "react";
import CustomAxios from "@/globalcomponents/CustomAxios";
import { baseurl, initURL } from "@/config/config";

const csvToArray = (s = "") =>
  s
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean);
const arrayToCsv = (arr = []) => (Array.isArray(arr) ? arr.join(", ") : "");

export default function VendorsPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  const [form, setForm] = useState({
    name: "",
    legalEntity: "",
    contactEmail: "",
    regionsCsv: "",
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

  const fetchItems = async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await CustomAxios.get(apiBase);
      setItems(data || []);
    } catch (e) {
      setError(
        e?.response?.data?.message || e.message || "Failed to load vendors"
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
      regionsCsv: "",
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const payload = {
      name: form.name.trim(),
      legalEntity: form.legalEntity || undefined,
      contactEmail: form.contactEmail || undefined,
      regions: csvToArray(form.regionsCsv),
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
      regionsCsv: arrayToCsv(it.regions),
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
    if (!confirm("Archive this vendor?")) return;
    try {
      await CustomAxios.delete(`${apiBase}/${id}`);
      await fetchItems();
    } catch (e) {
      alert(e?.response?.data?.message || e.message || "Archive failed");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header */}
      <div className="border-b bg-white/60 backdrop-blur supports-[backdrop-filter]:bg-white/60">
        <div className="mx-auto max-w-6xl px-4 py-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Vendors</h1>
            <p className="mt-1 text-sm text-gray-600">
              Registry of processors, regions, contracts, and risk.
            </p>
          </div>
          <button
            onClick={openCreate}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
          >
            New Vendor
          </button>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-6 space-y-6">
        {/* Table */}
        <section className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">All Vendors</h2>
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-600">
                {items.length} total
              </span>
              <button
                className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
                onClick={fetchItems}
              >
                {loading ? "Refreshing…" : "Refresh"}
              </button>
            </div>
          </div>

          <div className="overflow-auto rounded-lg border border-gray-200">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 text-left text-gray-700">
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
                {loading ? (
                  [...Array(4)].map((_, i) => (
                    <tr key={i}>
                      <td className="px-4 py-3">
                        <div className="h-4 w-40  rounded bg-gray-100" />
                      </td>
                      <td className="px-4 py-3">
                        <div className="h-4 w-48  rounded bg-gray-100" />
                      </td>
                      <td className="px-4 py-3">
                        <div className="h-4 w-48  rounded bg-gray-100" />
                      </td>
                      <td className="px-4 py-3">
                        <div className="h-4 w-24  rounded bg-gray-100" />
                      </td>
                      <td className="px-4 py-3">
                        <div className="h-4 w-16  rounded bg-gray-100" />
                      </td>
                      <td className="px-4 py-3">
                        <div className="h-7 w-24  rounded bg-gray-100" />
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
                  items.map((it) => (
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
                            className="rounded border border-gray-200 bg-white px-2 py-1 text-xs font-medium text-gray-700 hover:bg-gray-50"
                            onClick={() => openEdit(it)}
                          >
                            Edit
                          </button>
                          <button
                            className="rounded border border-gray-200 bg-white px-2 py-1 text-xs font-medium text-gray-700 hover:bg-gray-50"
                            onClick={() => onArchive(it._id)}
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

          {error && (
            <div className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </div>
          )}
        </section>
      </div>

      {/* Modal (Create / Edit) */}
      {modalOpen && (
        <Modal
          onClose={() => {
            setModalOpen(false);
            resetForm();
          }}
        >
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
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

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600">
                  Name *
                </label>
                <input
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600">
                  Legal Entity
                </label>
                <input
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                  value={form.legalEntity}
                  onChange={(e) =>
                    setForm({ ...form, legalEntity: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600">
                  Contact Email
                </label>
                <input
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                  value={form.contactEmail}
                  onChange={(e) =>
                    setForm({ ...form, contactEmail: e.target.value })
                  }
                  type="email"
                />
              </div>

              <div className="md:col-span-3">
                <label className="block text-xs font-medium text-gray-600">
                  Regions (CSV)
                </label>
                <input
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                  value={form.regionsCsv}
                  onChange={(e) =>
                    setForm({ ...form, regionsCsv: e.target.value })
                  }
                  placeholder="EU, IN, US"
                />
              </div>
              <div className="md:col-span-3">
                <label className="block text-xs font-medium text-gray-600">
                  Services (CSV)
                </label>
                <input
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                  value={form.servicesCsv}
                  onChange={(e) =>
                    setForm({ ...form, servicesCsv: e.target.value })
                  }
                  placeholder="hosting, email delivery"
                />
              </div>
              <div className="md:col-span-3">
                <label className="block text-xs font-medium text-gray-600">
                  Roles (CSV)
                </label>
                <input
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                  value={form.rolesCsv}
                  onChange={(e) =>
                    setForm({ ...form, rolesCsv: e.target.value })
                  }
                  placeholder="processor, sub_processor"
                />
              </div>

              <div className="md:col-span-3">
                <label className="block text-xs font-medium text-gray-600">
                  Contracts & Safeguards
                </label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-1">
                  <input
                    className="rounded-lg border border-gray-200 px-3 py-2 text-sm"
                    placeholder="DPA ref"
                    value={form.dpaRef}
                    onChange={(e) =>
                      setForm({ ...form, dpaRef: e.target.value })
                    }
                  />
                  <input
                    className="rounded-lg border border-gray-200 px-3 py-2 text-sm"
                    placeholder="BAA ref"
                    value={form.baaRef}
                    onChange={(e) =>
                      setForm({ ...form, baaRef: e.target.value })
                    }
                  />
                  <input
                    className="rounded-lg border border-gray-200 px-3 py-2 text-sm"
                    placeholder="SCC refs (CSV)"
                    value={form.sccRefsCsv}
                    onChange={(e) =>
                      setForm({ ...form, sccRefsCsv: e.target.value })
                    }
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-2">
                  <input
                    className="rounded-lg border border-gray-200 px-3 py-2 text-sm"
                    placeholder="BCR ref"
                    value={form.bcrRef}
                    onChange={(e) =>
                      setForm({ ...form, bcrRef: e.target.value })
                    }
                  />
                  <input
                    className="rounded-lg border border-gray-200 px-3 py-2 text-sm"
                    placeholder="SOC2 ref"
                    value={form.soc2Ref}
                    onChange={(e) =>
                      setForm({ ...form, soc2Ref: e.target.value })
                    }
                  />
                  <input
                    className="rounded-lg border border-gray-200 px-3 py-2 text-sm"
                    placeholder="ISO27001 ref"
                    value={form.iso27001Ref}
                    onChange={(e) =>
                      setForm({ ...form, iso27001Ref: e.target.value })
                    }
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-2">
                  <input
                    className="rounded-lg border border-gray-200 px-3 py-2 text-sm"
                    placeholder="PCI AOC ref"
                    value={form.pciAocRef}
                    onChange={(e) =>
                      setForm({ ...form, pciAocRef: e.target.value })
                    }
                  />
                  <input
                    className="rounded-lg border border-gray-200 px-3 py-2 text-sm"
                    placeholder="Sub-processors (CSV)"
                    value={form.subProcessorsCsv}
                    onChange={(e) =>
                      setForm({ ...form, subProcessorsCsv: e.target.value })
                    }
                  />
                  <input
                    className="rounded-lg border border-gray-200 px-3 py-2 text-sm"
                    type="number"
                    min="0"
                    max="100"
                    placeholder="Risk score 0-100"
                    value={form.riskScore}
                    onChange={(e) =>
                      setForm({ ...form, riskScore: e.target.value })
                    }
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600">
                  Last Review (YYYY-MM-DD)
                </label>
                <input
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                  value={form.lastReviewAt}
                  onChange={(e) =>
                    setForm({ ...form, lastReviewAt: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                disabled={saving}
                className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
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
                className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
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
    </div>
  );
}

/** Simple Tailwind modal */
function Modal({ children, onClose }) {
  const panelRef = useRef(null);
  const closeOnEsc = useCallback(
    (e) => {
      if (e.key === "Escape") onClose?.();
    },
    [onClose]
  );
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", closeOnEsc);
    panelRef.current?.focus();
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener("keydown", closeOnEsc);
    };
  }, [closeOnEsc]);
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
