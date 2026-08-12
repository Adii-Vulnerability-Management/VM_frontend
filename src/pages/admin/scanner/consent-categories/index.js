// pages/admin/consent-categories/index.jsx
import React, { useState, useEffect, useMemo } from "react";
import CustomAxios from "@/config/CustomAxios";
import { baseurl, initURL } from "@/config/config";
import GuideButton from "@/components/Tour/GuideButton";
import Tour from "@/components/Tour/Tour";

/* ------------------------------ Skeletons ------------------------------ */
function HeaderSkeleton() {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm animate-pulse">
      <div className="h-6 w-56 rounded bg-gray-200" />
      <div className="mt-2 h-4 w-72 rounded bg-gray-200" />
    </div>
  );
}
function TableSkeleton() {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm animate-pulse">
      <div className="h-5 w-40 rounded bg-gray-200 mb-4" />
      <div className="rounded-lg border border-gray-200 overflow-hidden">
        <div className="h-10 bg-gray-50" />
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-12 bg-gray-100 border-t border-gray-200" />
        ))}
      </div>
    </div>
  );
}

/* ----------------------- Confirm Delete (typed) ----------------------- */
function ConfirmDeleteModal({ open, label, onCancel, onConfirm, loading }) {
  const [value, setValue] = useState("");
  const canDelete = value.trim() === label;

  useEffect(() => {
    if (open) setValue("");
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && !loading && onCancel();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, loading, onCancel]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 grid place-items-center p-4">
      <div
        className="absolute inset-0 bg-black/40"
        onClick={() => !loading && onCancel()}
      />
      <div className="relative w-full max-w-md rounded-2xl border border-gray-200 bg-white p-6 shadow-xl">
        <h3 className="text-lg font-semibold text-gray-900">
          Delete category?
        </h3>
        <p className="mt-2 text-sm text-gray-600">
          This action cannot be undone. Type <strong>{label}</strong> to
          confirm.
        </p>
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={label}
          disabled={loading}
          className="mt-4 block w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-gray-900 placeholder:text-gray-400 focus:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-100 disabled:opacity-60"
        />
        <div className="mt-4 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="inline-flex items-center rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={!canDelete || loading}
            className={`inline-flex items-center rounded-lg px-3 py-1.5 text-sm font-medium text-white ${canDelete && !loading ? "bg-red-600 hover:bg-red-700" : "bg-red-400 cursor-not-allowed"}`}
          >
            {loading ? (
              <>
                <span className="mr-2 inline-block h-3 w-3 animate-spin rounded-full border-2 border-white/60 border-t-white" />
                Deleting…
              </>
            ) : (
              "Delete"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ---------------------------------- Page ---------------------------------- */
export default function ConsentCategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    domain: "",
    key: "",
    name: "",
    description: "",
  });
  const [editingId, setEditingId] = useState(null);

  const [search, setSearch] = useState("");

  // delete modal state
  const [showDelete, setShowDelete] = useState(false);
  const [target, setTarget] = useState(null); // whole category row
  const [deleting, setDeleting] = useState(false);

  const [tourOpen, setTourOpen] = useState(false);

  const steps = [
    {
      target: '[data-tour="cc-header"]',
      title: "Consent Categories",
      content:
        "Consent categories are labels used to group consent purposes (like analytics, marketing, essential) under a domain. These categories help your consent banner and reporting stay consistent.",
      placement: "bottom",
    },
    {
      target: '[data-tour="cc-form"]',
      title: "Create / Update Category",
      content:
        "Fill Domain, Key, Name, and optional Description. If you click Edit in the table, this same form becomes an Update form.",
      placement: "top",
    },
    {
      target: '[data-tour="cc-fields"]',
      title: "Fields meaning",
      content:
        "Domain = website/app domain, Key = unique short code (ex: analytics), Name = display label users see, Description = extra internal note.",
      placement: "top",
    },
    {
      target: '[data-tour="cc-search"]',
      title: "Search",
      content:
        "Use search to quickly find categories by domain, key, name, or description.",
      placement: "top",
    },
    {
      target: '[data-tour="cc-table"]',
      title: "Category List",
      content:
        "View all categories here. Use Edit to update a category, or Delete to remove it (delete requires typing the label to confirm).",
      placement: "top",
    },
  ];

  useEffect(() => {
    loadCategories();
  }, []);

  async function loadCategories() {
    setLoading(true);
    try {
      const { data } = await CustomAxios.get(
        `${baseurl}/${initURL}/consent-categories`,
      );
      setCategories(data || []);
    } catch (err) {
      console.error(err);
      alert("Failed to load categories");
    } finally {
      setLoading(false);
    }
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  }

  function resetForm() {
    setForm({ domain: "", key: "", name: "", description: "" });
    setEditingId(null);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingId) {
        await CustomAxios.patch(
          `${baseurl}/${initURL}/consent-categories/${editingId}`,
          form,
        );
      } else {
        await CustomAxios.post(
          `${baseurl}/${initURL}/consent-categories`,
          form,
        );
      }
      resetForm();
      loadCategories();
    } catch (err) {
      console.error(err);
      alert("Failed to save category");
    } finally {
      setSaving(false);
    }
  }

  function handleEdit(cat) {
    setForm({
      domain: cat.domain,
      key: cat.key,
      name: cat.name,
      description: cat.description || "",
    });
    setEditingId(cat._id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function openDelete(cat) {
    setTarget(cat);
    setShowDelete(true);
  }
  function closeDelete() {
    if (deleting) return;
    setShowDelete(false);
    setTarget(null);
  }
  async function confirmDelete() {
    if (!target) return;
    setDeleting(true);
    try {
      await CustomAxios.delete(
        `${baseurl}/${initURL}/consent-categories/${target._id}`,
      );
      await loadCategories();
      closeDelete();
    } catch (err) {
      console.error(err);
      alert("Failed to delete category");
      setDeleting(false);
    }
  }

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return categories;
    return categories.filter(
      (c) =>
        (c.domain || "").toLowerCase().includes(q) ||
        (c.key || "").toLowerCase().includes(q) ||
        (c.name || "").toLowerCase().includes(q) ||
        (c.description || "").toLowerCase().includes(q),
    );
  }, [categories, search]);

  const deleteLabel = target ? `${target.domain}:${target.key}` : "";

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="mx-5 bg-white rounded-lg p-5 my-3">
        {/* Header */}
        <div
          className="px-6 py-8 bg-[#2B245C] rounded-2xl shadow-lg hover:shadow-2xl transition-shadow duration-300 flex items-center justify-between"
          data-tour="cc-header"
        >
          <div>
            <h1 className="text-3xl font-bold text-cyan-50">
              Consent Categories
            </h1>
            <p className="mt-1 text-sm text-white">
              Create and manage category definitions per domain.
            </p>
          </div>

          <GuideButton
            onClick={() => setTourOpen(true)}
            variant="primary"
            size="md"
            className="!from-blue-500 !to-blue-600 hover:!from-blue-400 hover:!to-blue-500 !text-white !border-blue-400/70 !shadow-blue-600/30"
          >
            Help
          </GuideButton>
        </div>

        <div className="py-5 space-y-6">
          {/* Form card */}
          <section
            className="rounded-2xl border border-[#2B245C] bg-white p-5 shadow-lg hover:shadow-2xl transition-shadow duration-300"
            data-tour="cc-form"
          >
            <h2 className="text-2xl font-semibold text-[#2B245C] mb-3">
              Create Consent Category
            </h2>

            <form onSubmit={handleSubmit}>
              <div
                data-tour="cc-fields"
                className="grid grid-cols-1 gap-4 md:grid-cols-4 md:items-end"
              >
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-2">
                    Domain
                  </label>
                  <input
                    name="domain"
                    value={form.domain}
                    onChange={handleChange}
                    placeholder="example.com"
                    required
                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-indigo-200 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-2">
                    Key
                  </label>
                  <input
                    name="key"
                    value={form.key}
                    onChange={handleChange}
                    placeholder="analytics"
                    required
                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-indigo-200 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-2">
                    Name
                  </label>
                  <input
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Analytics"
                    required
                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-indigo-200 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-2">
                    Description
                  </label>
                  <input
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    placeholder="Optional"
                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-indigo-200 transition-all"
                  />
                </div>

                <div className="md:col-span-4 flex items-center gap-2 pt-2">
                  <button
                    type="submit"
                    disabled={saving}
                    className={`inline-flex items-center rounded-lg px-4 py-2 text-sm font-semibold text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2 disabled:opacity-60 ${
                      editingId
                        ? "bg-cyan-700 border border-cyan-700 hover:bg-cyan-800"
                        : "bg-[#2B245C] border border-[#2B245C] hover:bg-opacity-90"
                    }`}
                  >
                    {saving ? (
                      <>
                        <span className="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/60 border-t-white" />
                        {editingId ? "Updating…" : "Creating…"}
                      </>
                    ) : editingId ? (
                      "Update Category"
                    ) : (
                      "Create Category"
                    )}
                  </button>

                  {editingId && (
                    <button
                      type="button"
                      onClick={resetForm}
                      className="inline-flex items-center rounded-lg border border-[#2B245C] bg-white px-4 py-2 text-sm font-medium text-[#2B245C] shadow-sm hover:bg-gray-50"
                    >
                      Cancel edit
                    </button>
                  )}

                  <div className="ml-auto flex items-center gap-2">
                    <button
                      type="button"
                      onClick={loadCategories}
                      disabled={loading}
                      className="inline-flex items-center rounded-lg border border-[#2B245C] bg-white px-4 py-2 text-sm font-medium text-[#2B245C] shadow-sm hover:bg-gray-50 disabled:opacity-60"
                    >
                      {loading ? (
                        <>
                          <span className="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-indigo-600" />
                          Refreshing…
                        </>
                      ) : (
                        "Refresh"
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </form>
          </section>

          {/* Search */}
          <section
            className="rounded-2xl border border-[#2B245C] bg-white p-6 shadow-lg hover:shadow-2xl transition-shadow duration-300"
            data-tour="cc-search"
          >
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="flex items-center w-full gap-2">
                <label className="block text-sm font-medium text-gray-700">
                  Search
                </label>
                <input
                  type="text"
                  placeholder="Filter by domain, key, name or description"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="mt-1 block w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-gray-900 placeholder:text-gray-400 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                />
              </div>
            </div>
          </section>

          {/* Loading */}
          {loading && (
            <>
              <HeaderSkeleton />
              <TableSkeleton />
            </>
          )}

          {/* Table / Empty */}
          {!loading &&
            (filtered.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-10 text-center text-gray-600">
                {categories.length === 0
                  ? "No categories yet."
                  : "No results match your search."}
              </div>
            ) : (
              <section
                className="mb-3 space-y-3 rounded-2xl border border-[#2B245C] bg-white p-6 shadow-lg hover:shadow-2xl transition-shadow duration-300"
                data-tour="cc-table"
              >
                <div className="overflow-x-auto rounded-lg border border-gray-800">
                  <table className="min-w-full text-sm">
                    <thead className="bg-[#2B245C] text-left text-white border-b border-gray-800">
                      <tr>
                        {[
                          "Domain",
                          "Key",
                          "Name",
                          "Description",
                          "Actions",
                        ].map((col) => (
                          <th key={col} className="px-4 py-2 font-medium">
                            {col}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {filtered.map((cat) => (
                        <tr key={cat._id} className="hover:bg-gray-50">
                          <td className="px-4 py-2 whitespace-nowrap">
                            {cat.domain}
                          </td>
                          <td className="px-4 py-2 whitespace-nowrap">
                            {cat.key}
                          </td>
                          <td className="px-4 py-2 whitespace-nowrap">
                            {cat.name}
                          </td>
                          <td className="px-4 py-2">
                            {cat.description || "—"}
                          </td>
                          <td className="px-4 py-2">
                            <div className="flex flex-wrap items-center gap-2">
                              <button
                                onClick={() => handleEdit(cat)}
                                className="rounded-lg border border-[#2B245C] bg-white px-3 py-1 text-sm text-[#2B245C] hover:bg-gray-50"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => openDelete(cat)}
                                className="rounded-lg bg-white border border-red-600 px-3 py-1 text-sm font-medium text-red-600 hover:bg-red-50"
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            ))}
        </div>
      </div>

      {/* Delete typed confirmation */}
      <ConfirmDeleteModal
        open={showDelete}
        label={deleteLabel}
        onCancel={closeDelete}
        onConfirm={confirmDelete}
        loading={deleting}
      />

      <Tour steps={steps} open={tourOpen} onClose={() => setTourOpen(false)} />
    </div>
  );
}
