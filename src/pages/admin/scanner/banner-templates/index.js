// src/pages/admin/scanner/banner-templates/index.jsx
import React, {
  useState,
  useEffect,
  useMemo,
  useEffect as ReactUseEffect,
} from "react";
import Link from "next/link";
import CustomAxios from "@/config/CustomAxios";
import { baseurl, initURL } from "@/config/config";
import GuideButton from "@/components/Tour/GuideButton";
import Tour from "@/components/Tour/Tour";

/* ------------------------------- Skeleton ------------------------------- */
function ListSkeleton() {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="h-6 w-52 rounded bg-gray-200 mb-4" />
      <div className="rounded-lg border border-gray-200 overflow-hidden">
        <div className="h-10 w-full bg-gray-50" />
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="h-12 w-full bg-gray-100 border-t border-gray-200"
          />
        ))}
      </div>
    </div>
  );
}

/* --------------------------- Confirm Delete Modal --------------------------- */
function ConfirmDeleteModal({ open, label, onCancel, onConfirm, loading }) {
  const [value, setValue] = useState("");
  const canDelete = value.trim() === label;

  // reset on open/close
  ReactUseEffect(() => {
    if (open) setValue("");
  }, [open]);

  // esc to close
  ReactUseEffect(() => {
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
          Delete template?
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
            onClick={() => onConfirm()}
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

/* --------------------------------- Page --------------------------------- */
export default function TemplateList() {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");

  // modal state
  const [showDelete, setShowDelete] = useState(false);
  const [target, setTarget] = useState(null); // { key, version }
  const [deleting, setDeleting] = useState(false);

  const [tourOpen, setTourOpen] = useState(false);

  const steps = [
    {
      target: '[data-tour="bt-header"]',
      title: "Banner Templates",
      content:
        "Banner templates are reusable layouts used to show consistent banners across your scanner/admin screens. Create versions so you can update designs without breaking older usage.",
      placement: "bottom",
    },
    {
      target: '[data-tour="bt-actions"]',
      title: "Quick Actions",
      content:
        "Use Refresh to reload the latest templates. Use New Template to create a new banner layout.",
      placement: "left",
    },
    {
      target: '[data-tour="bt-search"]',
      title: "Search",
      content:
        "Filter templates by key or version (example: default@1). This helps you quickly find the exact template you want to edit.",
      placement: "top",
    },
    {
      target: '[data-tour="bt-table"]',
      title: "Template List",
      content:
        "This table shows all templates and their versions. Use Edit to update a template, or Delete to permanently remove a specific version.",
      placement: "top",
    },
  ];

  useEffect(() => {
    fetchTemplates();
  }, []);

  async function fetchTemplates() {
    setLoading(true);
    try {
      const res = await CustomAxios.get(`${baseurl}/${initURL}/cmp/templates`);
      setTemplates(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  function openDelete(tpl) {
    setTarget({ key: tpl.key, version: tpl.version });
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
        `${baseurl}/${initURL}/cmp/templates/${target.key}/${target.version}`,
      );
      setTemplates((prev) =>
        prev.filter(
          (t) => !(t.key === target.key && t.version === target.version),
        ),
      );
      closeDelete();
    } catch (err) {
      console.error(err);
      alert("Failed to delete template. Please try again.");
      setDeleting(false);
    }
  }

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return templates;
    return templates.filter(
      (t) =>
        `${t.key}@${t.version}`.toLowerCase().includes(q) ||
        (t.key || "").toLowerCase().includes(q) ||
        String(t.version).toLowerCase().includes(q),
    );
  }, [templates, query]);

  const labelForTarget = target ? `${target.key}@${target.version}` : "";

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="mx-5 bg-white rounded-lg p-5 my-3">
        <div className="border-b bg-white/60 backdrop-blur supports-[backdrop-filter]:bg-white/60">
          {/* Header */}
          <div
            className="px-6 py-8 bg-[#2B245C] rounded-2xl shadow-lg hover:shadow-2xl transition-shadow duration-300 flex items-center justify-between"
            data-tour="bt-header"
          >
            <div>
              <h1 className="text-3xl font-bold text-cyan-50">
                Banner Templates
              </h1>
              <p className="mt-1 text-sm text-white">
                Manage reusable banner layouts and content.
              </p>
            </div>

            <div className="flex items-center gap-2" data-tour="bt-actions">
              <button
                onClick={fetchTemplates}
                disabled={loading}
                className="inline-flex items-center rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 disabled:opacity-60"
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
              <GuideButton
                onClick={() => setTourOpen(true)}
                variant="primary"
                size="md"
                className="!from-blue-500 !to-blue-600 hover:!from-blue-400 hover:!to-blue-500 !text-white !border-blue-400/70 !shadow-blue-600/30"
              >
                Help
              </GuideButton>
              <Link
                href="/admin/scanner/banner-templates/new"
                className="rounded-lg bg-blue-50 text-[#2B245C] px-6 py-2.5 text-sm font-semibold shadow-md hover:shadow-lg hover:bg-gray-50 transition-all"
              >
                + New Template
              </Link>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="py-5 space-y-6">
          {/* Search */}
          <section
            className="rounded-2xl border border-[#2B245C] bg-white p-5 shadow-lg hover:shadow-2xl transition-shadow duration-300"
            data-tour="bt-search"
          >
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="flex items-center w-full gap-2">
                <label className="block text-sm font-medium text-gray-700">
                  Search
                </label>
                <input
                  type="text"
                  placeholder="Filter by key or version (e.g., default@1)"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="mt-1 block w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-gray-900 placeholder:text-gray-400 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                />
              </div>
            </div>
          </section>

          {/* Loading */}
          {loading && <ListSkeleton />}

          {/* Empty state */}
          {!loading && filtered.length === 0 && (
            <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-10 text-center">
              <p className="text-gray-600">
                {templates.length === 0
                  ? "No templates yet."
                  : "No results match your search."}
              </p>
              <div className="mt-3 flex items-center justify-center gap-2">
                <button
                  onClick={() => setQuery("")}
                  className="rounded-lg border border-[#2B245C] bg-white px-3 py-1.5 text-sm text-[#2B245C] hover:bg-gray-50"
                >
                  Clear search
                </button>
                <Link
                  href="/admin/scanner/banner-templates/new"
                  className="rounded-lg bg-[#2B245C] border border-[#2B245C] px-3 py-1.5 text-sm font-medium text-white hover:bg-opacity-90"
                >
                  Create a template
                </Link>
              </div>
            </div>
          )}

          {/* Table */}
          {!loading && filtered.length > 0 && (
            <section
              className="mb-3 space-y-3 rounded-2xl border border-[#2B245C] bg-white p-6 shadow-lg hover:shadow-2xl transition-shadow duration-300"
              data-tour="bt-table"
            >
              <div className="overflow-x-auto rounded-lg border border-gray-800">
                <table className="min-w-full text-sm">
                  <thead className="bg-[#2B245C] text-left text-white border-b border-gray-800">
                    <tr>
                      {["Key", "Version", "Created", "Updated", "Actions"].map(
                        (col) => (
                          <th key={col} className="px-4 py-2 font-medium">
                            {col}
                          </th>
                        ),
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filtered.map((tpl) => {
                      const id = `${tpl.key}@${tpl.version}`;
                      return (
                        <tr key={id} className="hover:bg-gray-50">
                          <td className="px-4 py-2 font-medium text-gray-900">
                            {tpl.key}
                          </td>
                          <td className="px-4 py-2">{tpl.version}</td>
                          <td className="px-4 py-2 text-gray-700 whitespace-nowrap">
                            {tpl.createdAt
                              ? new Date(tpl.createdAt).toLocaleString()
                              : "—"}
                          </td>
                          <td className="px-4 py-2 text-gray-700 whitespace-nowrap">
                            {tpl.updatedAt
                              ? new Date(tpl.updatedAt).toLocaleString()
                              : "—"}
                          </td>
                          <td className="px-4 py-2">
                            <div className="flex flex-wrap items-center gap-2">
                              <Link
                                href={`/admin/scanner/banner-templates/${tpl.key}/${tpl.version}`}
                                className="rounded-lg border border-[#2B245C] bg-white px-2 py-1 text-sm font-medium text-[#2B245C] hover:bg-gray-50"
                              >
                                Edit
                              </Link>
                              <button
                                onClick={() => openDelete(tpl)}
                                className="inline-flex items-center rounded-lg bg-white border border-red-600 px-2 py-1 text-sm font-medium text-red-600 hover:bg-red-50"
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </section>
          )}
        </div>
      </div>

      {/* Delete confirmation modal */}
      <ConfirmDeleteModal
        open={showDelete}
        label={labelForTarget}
        onCancel={closeDelete}
        onConfirm={confirmDelete}
        loading={deleting}
      />

      <Tour steps={steps} open={tourOpen} onClose={() => setTourOpen(false)} />
    </div>
  );
}
