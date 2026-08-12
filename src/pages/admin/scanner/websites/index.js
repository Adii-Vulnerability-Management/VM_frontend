// src/components/WebsiteList.jsx
import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import CustomAxios from "@/config/CustomAxios";
import { useRouter } from "next/navigation";
import { can, guard } from "@/auth/auth-permissions";
import { baseurl, initURL } from "@/config/config";
import ScriptModal from "./ScriptModal";

/* ------------------------------- Skeleton ------------------------------- */
function ListSkeleton() {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm animate-pulse"
        >
          <div className="mb-4 flex items-center gap-3">
            <div className="h-6 w-6 rounded bg-gray-200" />
            <div className="h-6 w-40 rounded bg-gray-200" />
          </div>
          <div className="mb-2 h-4 w-28 rounded bg-gray-200" />
          <div className="mb-2 h-4 w-40 rounded bg-gray-200" />
          <div className="mt-4 h-8 w-full rounded bg-gray-200" />
        </div>
      ))}
    </div>
  );
}

/* --------------------------- Confirm Delete Modal --------------------------- */
function ConfirmDeleteModal({ open, label, onCancel, onConfirm, loading }) {
  const [value, setValue] = useState("");
  const canDelete = value.trim() === label;

  // reset input when opening
  useEffect(() => {
    if (open) setValue("");
  }, [open]);

  // esc to close
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
          Delete this website?
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

/* --------------------------------- List --------------------------------- */
export default function WebsiteList() {
  const router = useRouter();

  const [sites, setSites] = useState([]);
  const [modalSiteId, setModalSiteId] = useState(null);
  const [loading, setLoading] = useState(true);

  // delete modal state
  const [showDelete, setShowDelete] = useState(false);
  const [target, setTarget] = useState(null); // { _id, domain }
  const [deleting, setDeleting] = useState(false);

  // Permissions
  const canView = can("privacy.read");
  const canCreate = can("privacy.create");
  const canEdit = can("privacy.update");
  const canDelete = can("privacy.delete");
  const canManage = can("privacy.manage");

  useEffect(() => {
    (async () => {
      try {
        const { data } = await CustomAxios.get(
          `${baseurl}/${initURL}/cmp/websites`,
        );
        setSites(data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const openDelete = (site) => {
    setTarget(site);
    setShowDelete(true);
  };
  const closeDelete = () => {
    if (deleting) return;
    setShowDelete(false);
    setTarget(null);
  };

  const confirmDelete = async () => {
    if (!target?._id) return;
    setDeleting(true);
    try {
      await CustomAxios.delete(
        `${baseurl}/${initURL}/cmp/websites/${target._id}`,
      );
      setSites((s) => s.filter((w) => w._id !== target._id));
      closeDelete();
    } catch (err) {
      console.error(err);
      alert("Failed to delete site. Please try again.");
      setDeleting(false);
    }
  };

  const labelForTarget = useMemo(() => {
    if (!target) return "";
    try {
      const host = (target.domain || "").replace(/^https?:\/\//, "");
      return host || target.domain || "";
    } catch {
      return target.domain || "";
    }
  }, [target]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="mx-5 min-h-screen bg-white rounded-lg p-5 my-3">
        {/* header */}
        <div className="mb-5 px-6 py-8 bg-[#2B245C] rounded-2xl shadow-lg hover:shadow-2xl transition-shadow duration-300">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-semibold text-cyan-50">Websites</h1>
              <p className="text-sm text-white">
                Manage all scanned websites and their settings
              </p>
            </div>
            <Link
              href="/admin/scanner/websites/new"
              onClick={(e) => {
                if (!canCreate) {
                  e.preventDefault();
                  guard(canCreate, router);
                }
              }}
              className="rounded-lg bg-white text-[#2B245C] px-6 py-2.5 text-sm font-semibold shadow-md hover:shadow-lg hover:bg-gray-50 transition-all"
            >
              + New
            </Link>
          </div>
        </div>

        {loading && <ListSkeleton />}

        {!loading && sites.length === 0 && (
          <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-10 text-center">
            <p className="text-gray-600">No websites added yet.</p>
            <Link
              href="/admin/scanner/websites/new"
              className="mt-3 inline-block rounded-lg bg-[#2B245C] px-4 py-2 text-white hover:bg-opacity-90"
            >
              + Add your first website
            </Link>
          </div>
        )}

        {!loading && sites.length > 0 && (
          <div className="grid gap-6 md:grid-cols-2">
            {sites.map((site) => {
              const hostname = site.domain?.replace(/^https?:\/\//, "");
              const domainParam = encodeURIComponent(site.domain || "");
              return (
                <div
                  key={site._id}
                  className="rounded-2xl border border-[#2B245C] bg-white p-5 shadow-lg hover:shadow-2xl transition-shadow duration-300"
                >
                  <div className="flex items-center gap-3">
                    {hostname ? (
                      <img
                        src={`https://www.google.com/s2/favicons?domain=${hostname}&sz=32`}
                        alt=""
                        className="h-6 w-6 rounded"
                      />
                    ) : (
                      <div className="h-6 w-6 rounded bg-gray-200" />
                    )}
                    <h2 className="truncate text-lg font-semibold text-gray-900">
                      {site.domain}
                    </h2>
                  </div>

                  <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                    <div className="text-gray-500">Language</div>
                    <div className="font-medium text-gray-800">
                      {site.defaultLang || "-"}
                    </div>
                    <div className="text-gray-500">Config ID</div>
                    <div className="truncate font-mono text-gray-800">
                      {site.bannerConfigId || "-"}
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <Link
                      href={`/admin/scanner/websites/${site._id}`}
                      onClick={(e) => {
                        if (!canView) {
                          e.preventDefault();
                          guard(canView, router);
                        }
                      }}
                      className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      View
                    </Link>
                    <Link
                      href={`/admin/scanner/websites/${site._id}/edit`}
                      onClick={(e) => {
                        if (!canEdit) {
                          e.preventDefault();
                          guard(canEdit, router);
                        }
                      }}
                      className="rounded-lg bg-emerald-600 px-3 py-1.5 text-sm text-white hover:bg-emerald-700"
                    >
                      Edit
                    </Link>
                    <Link
                      href={`/admin/scanner/websites/${site._id}/Dashboard`}
                      onClick={(e) => {
                        if (!canManage) {
                          e.preventDefault();
                          guard(canManage, router);
                        }
                      }}
                      className="rounded-lg bg-indigo-600 px-3 py-1.5 text-sm text-white hover:bg-indigo-700"
                    >
                      Dashboard
                    </Link>
                    <Link
                      href={`/admin/scanner/cmp?domain=${domainParam}`}
                      onClick={(e) => {
                        if (!canManage) {
                          e.preventDefault();
                          guard(canManage, router);
                        }
                      }}
                      className="rounded-lg bg-sky-600 px-3 py-1.5 text-sm text-white hover:bg-sky-700"
                      title="View consent for this domain"
                    >
                      View Consent
                    </Link>
                    <button
                      onClick={() => guard(canDelete, router, () => openDelete(site))}
                      className="rounded-lg bg-red-600 px-3 py-1.5 text-sm text-white hover:bg-red-700"
                    >
                      Delete
                    </button>
                    <button
                      onClick={() => guard(canManage, router, () => setModalSiteId(site._id))}
                      className="rounded-lg bg-violet-600 px-3 py-1.5 text-sm text-white hover:bg-violet-700"
                    >
                      Script
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {modalSiteId && (
          <ScriptModal
            siteId={modalSiteId}
            onClose={() => setModalSiteId(null)}
          />
        )}

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
