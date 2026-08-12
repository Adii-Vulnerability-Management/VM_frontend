// src/components/BannerConfigList.jsx
import React, {
  useEffect,
  useMemo,
  useState,
  useEffect as ReactUseEffect,
} from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import CustomAxios from "@/config/CustomAxios";
import { baseurl, initURL } from "@/config/config";

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

  ReactUseEffect(() => {
    if (open) setValue("");
  }, [open]);

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
          Delete configuration?
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
export default function BannerConfigList() {
  const router = useRouter();
  const [configs, setConfigs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const configId = Array.isArray(router.query.configId)
    ? router.query.configId[0]
    : router.query.configId;

  // delete modal
  const [showDelete, setShowDelete] = useState(false);
  const [target, setTarget] = useState(null); // {_id, domain, bannerVersion}
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (router.isReady) fetchConfigs();
  }, [router.isReady, configId]);

  async function fetchConfigs() {
    setLoading(true);
    try {
      const endpoint = configId
        ? `${baseurl}/${initURL}/cmp/configs/${configId}`
        : `${baseurl}/${initURL}/cmp/configs`;
      const res = await CustomAxios.get(endpoint);
      setConfigs(
        configId ? (res.data ? [res.data] : []) : res.data || [],
      );
    } catch (err) {
      console.error(err);
      setConfigs([]);
    } finally {
      setLoading(false);
    }
  }

  async function toggleStatus(id, current) {
    const action = current === "active" ? "deactivate" : "activate";
    try {
      await CustomAxios.patch(
        `${baseurl}/${initURL}/cmp/configs/${id}/${action}`,
      );
      fetchConfigs();
    } catch (err) {
      console.error("Failed to toggle status", err);
      alert("Unable to update status. Please try again.");
    }
  }

  function openDelete(cfg) {
    setTarget({
      _id: cfg._id,
      domain: cfg.domain,
      bannerVersion: cfg.bannerVersion,
    });
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
        `${baseurl}/${initURL}/cmp/configs/${target._id}`,
      );
      setConfigs((prev) => prev.filter((c) => c._id !== target._id));
      closeDelete();
    } catch (err) {
      console.error("Failed to delete config", err);
      alert("Unable to delete. Please try again.");
      setDeleting(false);
    }
  }

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return configs;
    return configs.filter(
      (c) =>
        (c.domain || "").toLowerCase().includes(q) ||
        String(c.sdkVersion || "")
          .toLowerCase()
          .includes(q) ||
        String(c.bannerVersion || "")
          .toLowerCase()
          .includes(q) ||
        String(c.status || "")
          .toLowerCase()
          .includes(q),
    );
  }, [configs, query]);

  const labelForTarget = target
    ? `${target.domain}@${target.bannerVersion}`
    : "";

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="mx-5 min-h-screen bg-white rounded-lg p-5 my-3">
        {/* Header */}
        <div className="rounded-2xl bg-[#2B245C] px-6 py-8 shadow-lg hover:shadow-2xl transition-shadow duration-300">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-semibold text-cyan-50">
                Banner Configurations
              </h1>
              <p className="mt-1 text-sm text-white">
                Manage SDK/banner versions per domain.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={fetchConfigs}
                disabled={loading}
                className="rounded-lg bg-white text-[#2B245C] px-6 py-2.5 text-sm font-semibold shadow-md hover:shadow-lg hover:bg-gray-100 transition-all"
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
              <Link
                href="/admin/scanner/banner-configs/new"
                className="rounded-lg bg-blue-50 text-[#2B245C] px-6 py-2.5 text-sm font-semibold shadow-md hover:shadow-lg hover:bg-blue-100 transition-all"
              >
                + New Config
              </Link>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="py-5 space-y-6">
          {/* Search */}
          {/* <section className="rounded-2xl border border-[#2B245C] bg-white p-6 shadow-lg hover:shadow-2xl transition-shadow duration-300">
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-2">
                  Search
                </label>
                <input
                  type="text"
                  placeholder="Filter by domain, SDK, banner, or status"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="w-64 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-indigo-200 transition-all"
                />
              </div>
            </div>
          </section> */}

          {/* Loading */}
          {loading && <ListSkeleton />}

          {/* Empty state */}
          {!loading && filtered.length === 0 && (
            <div className="p-10 text-center rounded-2xl border border-dashed border-[#2B245C] bg-white shadow-lg hover:shadow-2xl transition-shadow duration-300">
              <p className="text-gray-600">
                {configs.length === 0
                  ? "No configurations yet."
                  : "No results match your search."}
              </p>
              <div className="mt-3 flex items-center justify-center gap-2">
                <button
                  onClick={() => setQuery("")}
                  className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50"
                >
                  Clear search
                </button>
                <Link
                  href="/admin/scanner/banner-configs/new"
                  className="rounded-lg bg-[#2B245C] px-3 py-1.5 text-sm font-medium text-white hover:bg-opacity-90"
                >
                  Create a config
                </Link>
              </div>
            </div>
          )}

          {/* Table */}
          {!loading && filtered.length > 0 && (
            <section className="rounded-2xl border border-[#2B245C] bg-white p-6 shadow-lg hover:shadow-2xl transition-shadow duration-300 overflow-hidden">
              <div className="overflow-auto rounded-lg border border-gray-500">
                <table className="min-w-full text-sm">
                  <thead className="bg-[#2B245C] text-left text-white border-b border-gray-500">
                    <tr>
                      {["Domain", "SDK", "Banner", "Status", "Actions"].map(
                        (col) => (
                          <th key={col} className="px-6 py-3 font-medium">
                            {col}
                          </th>
                        ),
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filtered.map((cfg) => (
                      <tr key={cfg._id} className="hover:bg-gray-50">
                        <td className="px-6 py-3 font-medium text-gray-900">
                          {cfg.domain}
                        </td>
                        <td className="px-6 py-3">{cfg.sdkVersion}</td>
                        <td className="px-6 py-3">{cfg.bannerVersion}</td>
                        <td className="px-6 py-3">
                          <span
                            className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              cfg.status === "active"
                                ? "bg-green-100 text-green-800"
                                : "bg-yellow-100 text-yellow-800"
                            }`}
                          >
                            {cfg.status}
                          </span>
                        </td>
                        <td className="px-6 py-3">
                          <div className="flex flex-wrap items-center gap-2">
                            <Link
                              href={`/admin/scanner/banner-configs/${cfg._id}`}
                              className="rounded-lg border border-[#2B245C] bg-white px-3 py-1.5 text-sm text-[#2B245C] hover:bg-blue-50"
                            >
                              Edit
                            </Link>
                            <button
                              className="rounded-lg border border-blue-200 bg-white px-3 py-1.5 text-sm text-blue-800 hover:bg-blue-50"
                              onClick={() => toggleStatus(cfg._id, cfg.status)}
                            >
                              {cfg.status === "active"
                                ? "Deactivate"
                                : "Activate"}
                            </button>
                            <button
                              className="inline-flex items-center rounded-lg bg-red-50 border border-red-200 px-3 py-1.5 text-sm text-red-700 hover:bg-red-100"
                              onClick={() => openDelete(cfg)}
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
          )}
        </div>

        {/* Delete confirmation modal */}
        <ConfirmDeleteModal
          open={showDelete}
          label={labelForTarget}
          onCancel={closeDelete}
          onConfirm={confirmDelete}
          loading={deleting}
        />
      </div>
    </div>
  );
}
