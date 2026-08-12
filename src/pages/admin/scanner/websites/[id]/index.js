// src/cmp/pages/WebsiteDetail.jsx
import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import CustomAxios from "@/config/CustomAxios";
import { baseurl, initURL } from "@/config/config";
import { FiGlobe, FiMonitor, FiClock, FiShield } from "react-icons/fi";

/* --------------------------------- helpers -------------------------------- */

const plural = (n, u) => `${n}${u}${n === 1 ? "" : "s"}`;
const timeAgo = (dateStr) => {
  if (!dateStr) return null;
  const diff = Date.now() - new Date(dateStr).getTime();
  const s = Math.max(0, Math.floor(diff / 1000));
  const m = Math.floor(s / 60);
  const h = Math.floor(m / 60);
  const d = Math.floor(h / 24);
  if (d > 0) return `${plural(d, "d")} ago`;
  if (h > 0) return `${plural(h, "h")} ago`;
  if (m > 0) return `${plural(m, "m")} ago`;
  return `${plural(s, "s")} ago`;
};

const toneMap = {
  slate: "border-slate-200 bg-slate-50 text-slate-700",
  blue: "border-blue-200 bg-blue-50 text-blue-700",
  violet: "border-violet-200 bg-violet-50 text-violet-700",
  amber: "border-amber-200 bg-amber-50 text-amber-800",
  emerald: "border-emerald-200 bg-emerald-50 text-emerald-700",
};

const Badge = ({ children, tone = "slate" }) => (
  <span
    className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs ${toneMap[tone]}`}
  >
    {children}
  </span>
);

const LabelRow = ({ label, children }) => (
  <div className="flex items-start justify-between gap-4 py-2">
    <div className="text-sm text-gray-500">{label}</div>
    <div className="text-sm font-medium text-gray-900 text-right">
      {children}
    </div>
  </div>
);

const Skeleton = () => (
  <div className="animate-pulse">
    <div className="h-7 w-56 rounded bg-gray-200 mb-3" />
    <div className="h-4 w-32 rounded bg-gray-200 mb-6" />
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="lg:col-span-2 space-y-3">
        <div className="h-28 rounded-lg bg-gray-100" />
        <div className="h-28 rounded-lg bg-gray-100" />
      </div>
      <div className="space-y-3">
        <div className="h-52 rounded-lg bg-gray-100" />
        <div className="h-40 rounded-lg bg-gray-100" />
      </div>
    </div>
  </div>
);

/* ----------------------------- confirm widget ----------------------------- */

function ConfirmDelete({ label, onCancel, onConfirm, loading }) {
  const [value, setValue] = useState("");
  const canDelete = value.trim() === label;
  return (
    <div className="mt-4 space-y-4">
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={label}
        className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 placeholder:text-gray-400 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-200"
        disabled={loading}
      />
      <div className="flex items-center justify-end gap-2">
        <button
          onClick={onCancel}
          className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          disabled={loading}
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          disabled={!canDelete || loading}
          className={`rounded-lg px-4 py-2 text-sm font-medium text-white ${canDelete && !loading ? "bg-red-600 hover:bg-red-700" : "bg-red-400 cursor-not-allowed"}`}
        >
          {loading ? "Deleting…" : "Delete"}
        </button>
      </div>
    </div>
  );
}

/* -------------------------------- component -------------------------------- */

export default function WebsiteDetail() {
  const router = useRouter();
  const { id } = router.query;

  const [site, setSite] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showDelete, setShowDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [copied, setCopied] = useState(""); // key of last copied
  const [favBroken, setFavBroken] = useState(false);

  const fetchSite = () => {
    if (!id) return;
    setLoading(true);
    setError("");
    CustomAxios.get(`${baseurl}/${initURL}/cmp/websites/${id}`)
      .then((res) => setSite(res.data))
      .catch((err) => {
        console.error(err);
        setError("Failed to load website details.");
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchSite();
  }, [id]);

  const fullURL = useMemo(() => {
    if (!site?.domain) return "";
    const hasProtocol = /^https?:\/\//i.test(site.domain);
    return hasProtocol ? site.domain : `https://${site.domain}`;
  }, [site]);

  const hostname = useMemo(() => {
    try {
      return fullURL ? new URL(fullURL).hostname : "";
    } catch {
      return site?.domain || "";
    }
  }, [fullURL, site]);

  const protocol = useMemo(() => {
    if (!fullURL) return "";
    try {
      return new URL(fullURL).protocol.replace(":", "");
    } catch {
      return "";
    }
  }, [fullURL]);

  // Schedule summary (if API includes these fields)
  const scheduleSummary = useMemo(() => {
    if (!site) return "";
    const { scanFrequency, scanTime, scanDay, customCron } = site;
    if (customCron?.trim()) return `Custom cron: ${customCron}`;
    if (scanFrequency === "hourly") return "Every hour (IST)";
    if (scanFrequency === "daily" && scanTime)
      return `Daily at ${scanTime} (IST)`;
    if (scanFrequency === "weekly" && scanTime && scanDay)
      return `Every ${scanDay} at ${scanTime} (IST)`;
    return "-";
  }, [site]);

  const handleCopy = async (text, key) => {
    try {
      await navigator.clipboard.writeText(String(text));
      setCopied(key);
      setTimeout(() => setCopied(""), 1200);
    } catch (e) {
      console.error("Copy failed", e);
    }
  };

  const openDeleteModal = () => setShowDelete(true);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await CustomAxios.delete(`${baseurl}/${initURL}/cmp/websites/${id}`);
      router.push("/admin/scanner/websites");
    } catch (err) {
      console.error(err);
      setDeleting(false);
      setShowDelete(false);
      setError("Could not delete the site. Please try again.");
    }
  };

  useEffect(() => {
    if (!showDelete) return;
    const onKey = (e) =>
      e.key === "Escape" && !deleting && setShowDelete(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [showDelete, deleting]);

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl p-6">
        <Skeleton />
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-6xl p-6">
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-800">
          {error}
        </div>
        <div className="mt-4 flex items-center gap-2">
          <button
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-700 hover:bg-gray-100"
            onClick={() => router.back()}
          >
            Go back
          </button>
          <button
            className="rounded-lg bg-[#2B245C] px-4 py-2 text-sm font-medium text-white hover:bg-opacity-90"
            onClick={fetchSite}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!site) {
    return (
      <div className="mx-auto max-w-6xl p-6">
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-6 text-gray-700">
          No site found.
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="mx-5 bg-white rounded-lg p-5 my-3">
        {/* Header */}
        <div className="px-6 py-7 bg-[#2B245C] rounded-2xl shadow-lg hover:shadow-2xl transition-shadow duration-300">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-4">
                {/* Favicon with graceful fallback */}
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-white/10 backdrop-blur">
                  {!favBroken && hostname ? (
                    <img
                      src={`https://www.google.com/s2/favicons?domain=${hostname}&sz=64`}
                      alt="favicon"
                      className="h-10 w-10"
                      onError={() => setFavBroken(true)}
                    />
                  ) : (
                    <div className="h-10 w-10 rounded bg-white/20" />
                  )}
                </div>

                <div className="min-w-0">
                  <h1 className="truncate text-3xl font-bold text-cyan-50">
                    {hostname || site.domain}
                  </h1>

                  <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-indigo-100">
                    <a
                      href={fullURL}
                      target="_blank"
                      rel="noreferrer"
                      className="truncate underline underline-offset-4 hover:text-white"
                    >
                      {fullURL}
                    </a>

                    <button
                      onClick={() => handleCopy(fullURL, "url")}
                      className="rounded-md border border-white/20 px-2 py-1 text-xs hover:bg-white/10"
                    >
                      {copied === "url" ? "Copied!" : "Copy URL"}
                    </button>
                  </div>

                  <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-indigo-100">
                    {site.createdAt && (
                      <span>
                        Created <strong>{timeAgo(site.createdAt)}</strong>
                      </span>
                    )}

                    {site.updatedAt && (
                      <span>
                        Updated <strong>{timeAgo(site.updatedAt)}</strong>
                      </span>
                    )}
                  </div>

                  {/* <div className="mt-5 flex flex-wrap gap-2">
                    {protocol && (
                      <Badge tone="blue">{protocol.toUpperCase()}</Badge>
                    )}

                    {site.scanFrequency && (
                      <Badge tone="emerald">{site.scanFrequency}</Badge>
                    )}

                    {site.defaultLang && (
                      <Badge tone="violet">{site.defaultLang}</Badge>
                    )}
                  </div> */}
                </div>
              </div>

              {/* Meta row */}
              {/* <div className="flex items-center gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  {protocol && <Badge tone="blue">{protocol}</Badge>}

                  {site.scanFrequency && (
                    <Badge tone="emerald">{site.scanFrequency}</Badge>
                  )}

                  {site.ownerId && (
                    <button
                      onClick={() => handleCopy(site.ownerId, "owner")}
                      className="group inline-flex items-center gap-1 text-xs text-gray-600 hover:text-gray-900"
                      title="Copy Owner ID"
                    >
                      <Badge>Owner: {String(site.ownerId).slice(0, 8)}…</Badge>
                      <span className="opacity-60 group-hover:opacity-100">
                        {copied === "owner" ? "Copied" : "Copy"}
                      </span>
                    </button>
                  )}

                  {site.bannerConfigId && (
                    <button
                      onClick={() => handleCopy(site.bannerConfigId, "banner")}
                      className="group inline-flex items-center gap-1 text-xs text-gray-600 hover:text-gray-900"
                      title="Copy Banner Config ID"
                    >
                      <Badge tone="violet">
                        Banner: {String(site.bannerConfigId).slice(0, 8)}…
                      </Badge>
                      <span className="opacity-60 group-hover:opacity-100">
                        {copied === "banner" ? "Copied" : "Copy"}
                      </span>
                    </button>
                  )}

                  <div className="flex items-center gap-2">
                    {site.createdAt && (
                      <span
                        title={new Date(site.createdAt).toLocaleString()}
                        className="inline-flex items-center rounded-full border border-gray-200 bg-gray-50 px-2 py-0.5 text-xs text-gray-700"
                      >
                        Created {timeAgo(site.createdAt)}
                      </span>
                    )}
                    {site.updatedAt && (
                      <span
                        title={new Date(site.updatedAt).toLocaleString()}
                        className="inline-flex items-center rounded-full border border-gray-200 bg-gray-50 px-2 py-0.5 text-xs text-gray-700"
                      >
                        Updated {timeAgo(site.updatedAt)}
                      </span>
                    )}
                  </div>
                </div>

                <div className="mt-1 text-sm text-gray-500">
                  <button
                    onClick={() => handleCopy(fullURL, "url")}
                    className="underline underline-offset-2 hover:text-gray-700"
                  >
                    {copied === "url" ? "URL copied!" : "Copy URL"}
                  </button>
                </div>
              </div> */}
            </div>

            {/* Action bar */}
            {/* <div className="flex shrink-0 flex-wrap items-center gap-2"> */}
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
              <Link
                href={`/admin/scanner/websites/${id}/Dashboard`}
                className="rounded-lg bg-white px-4 py-2 text-center text-sm font-semibold text-[#2B245C] transition hover:bg-gray-100"
              >
                Dashboard
              </Link>

              <Link
                href={`/admin/scanner/websites/${id}/edit`}
                className="rounded-lg bg-white px-4 py-2 text-center text-sm font-semibold text-[#2B245C] transition hover:bg-gray-100"
              >
                Edit
              </Link>

              <Link
                href={`/admin/scanner?wid=${id}`}
                className="rounded-lg bg-white px-4 py-2 text-center text-sm font-semibold text-[#2B245C] transition hover:bg-gray-100"
              >
                Scans
              </Link>

              <Link
                href={`/admin/scanner/websites/${id}/cookies`}
                className="rounded-lg bg-white px-4 py-2 text-center text-sm font-semibold text-[#2B245C] transition hover:bg-gray-100"
              >
                Cookies
              </Link>

              <button
                onClick={fetchSite}
                className="rounded-lg bg-blue-50 px-4 py-2 text-center text-sm font-semibold text-[#2B245C] transition hover:bg-gray-100"
                title="Refresh"
              >
                Refresh
              </button>

              {/* <button
                onClick={openDeleteModal}
                className="inline-flex items-center rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
              >
                Delete
              </button> */}

              <button
                onClick={() => router.back()}
                title="Back to Websites"
                className="rounded-lg bg-blue-50 px-4 py-2 text-center text-sm font-semibold text-[#2B245C] transition hover:bg-gray-100"
              >
                Back
              </button>
            </div>
          </div>
        </div>

        {/* Website Summary */}
        <div className="mt-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {/* Domain */}
          <div className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">
                  Domain
                </p>

                <p
                  className="mt-2 truncate text-lg font-bold text-[#2B245C]"
                  title={site.domain}
                >
                  {site.domain}
                </p>
              </div>

              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-blue-600 shadow-sm">
                <FiGlobe size={22} />
              </div>
            </div>
          </div>

          {/* Language */}
          <div className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">
                  Default Language
                </p>

                <p className="mt-2 text-lg font-bold text-[#2B245C]">
                  {site.defaultLang || "-"}
                </p>
              </div>

              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-100 text-violet-600 shadow-sm">
                <FiMonitor size={22} />
              </div>
            </div>
          </div>

          {/* Schedule */}
          <div className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">
                  Scan Schedule
                </p>

                <p className="mt-2 text-lg font-bold capitalize text-[#2B245C]">
                  {site.scanFrequency || "-"}
                </p>

                <p className="mt-1 text-xs text-slate-500">{scheduleSummary}</p>
              </div>

              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600 shadow-sm">
                <FiClock size={22} />
              </div>
            </div>
          </div>

          {/* Protocol */}
          <div className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">
                  Protocol
                </p>

                <p className="mt-2 text-lg font-bold uppercase text-[#2B245C]">
                  {protocol || "-"}
                </p>
              </div>

              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-100 text-amber-600 shadow-sm">
                <FiShield size={22} />
              </div>
            </div>
          </div>
        </div>

        {/* Main layout */}
        <div className="py-6">
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Left column */}
            <div className="space-y-6 lg:col-span-2">
              {/* Overview */}
              <section className="rounded-2xl border border-[#2B245C] bg-white p-6 shadow-lg hover:shadow-2xl transition-shadow duration-300">
                <h2 className="mb-4 text-2xl font-bold text-[#2B245C]">
                  Overview
                </h2>
                <div className="divide-y divide-gray-100">
                  <LabelRow label="Domain">
                    <span className="break-all">{site.domain}</span>
                  </LabelRow>
                  <LabelRow label="Default Language">
                    <span className="rounded-md bg-gray-100 px-2 py-0.5">
                      {site.defaultLang || "-"}
                    </span>
                  </LabelRow>
                  <LabelRow label="Owner ID">
                    <code className="rounded bg-gray-100 px-2 py-0.5">
                      {site.ownerId || "-"}
                    </code>
                  </LabelRow>
                  <LabelRow label="Banner Config ID">
                    {site.bannerConfigId ? (
                      <Link
                        href={`/admin/scanner/banner-configs/${site.bannerConfigId}?wId=${id}`}
                        className="underline underline-offset-2 text-indigo-600 hover:text-indigo-800"
                      >
                        {site.bannerConfigId}
                      </Link>
                    ) : (
                      <span>-</span>
                    )}
                  </LabelRow>
                </div>
              </section>

              {/* Scan Schedule (new card) */}
              <section className="rounded-2xl border border-[#2B245C] bg-white p-6 shadow-lg hover:shadow-2xl transition-shadow duration-300">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-[#2B245C]">
                    Scan Schedule
                  </h2>
                  {site.scanFrequency && (
                    <Badge tone="emerald">{site.scanFrequency}</Badge>
                  )}
                </div>

                <div className="space-y-2">
                  <div className="text-sm text-gray-700">
                    <span className="font-medium text-gray-900">Summary:</span>{" "}
                    {scheduleSummary}
                  </div>

                  <div className="grid gap-3 sm:grid-cols-3">
                    <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 text-sm">
                      <div className="text-gray-500">Frequency</div>
                      <div className="font-medium text-gray-900">
                        {site.scanFrequency || "-"}
                      </div>
                    </div>
                    {site.scanFrequency !== "hourly" && (
                      <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 text-sm">
                        <div className="text-gray-500">Time</div>
                        <div className="font-medium text-gray-900">
                          {site.scanTime || "-"}
                        </div>
                      </div>
                    )}
                    {site.scanFrequency !== "hourly" && (
                      <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 text-sm">
                        <div className="text-gray-500">Day</div>
                        <div className="font-medium text-gray-900">
                          {site.scanDay || "-"}
                        </div>
                      </div>
                    )}
                  </div>

                  {site.customCron && (
                    <div className="mt-3 rounded-lg border border-indigo-100 bg-indigo-50/60 p-3 text-sm">
                      <div className="text-gray-700">
                        <span className="font-medium text-gray-900">
                          Custom cron:
                        </span>{" "}
                        <code>{site.customCron}</code>
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-4">
                  <Link
                    href={`/admin/scanner/websites/${id}/edit`}
                    className="inline-flex items-center gap-2 rounded-lg border border-[#2B245C] bg-white px-6 py-2.5 text-sm font-medium text-[#2B245C] hover:bg-indigo-50 transition-all"
                  >
                    Edit schedule
                  </Link>
                </div>
              </section>
            </div>

            {/* Right column */}
            <div className="space-y-6">
              {/* Quick actions */}
              <section className="rounded-2xl border border-[#2B245C] bg-white p-6 shadow-lg hover:shadow-2xl transition-shadow duration-300">
                <h2 className="mb-3 text-2xl font-bold text-[#2B245C]">
                  Quick actions
                </h2>
                <div className="space-y-2">
                  <a
                    href={fullURL || "#"}
                    target="_blank"
                    rel="noreferrer"
                    className={`block rounded-lg px-4 py-2 text-center text-sm font-medium text-white ${fullURL ? "bg-[#2B245C] hover:bg-opacity-90" : "pointer-events-none bg-gray-300"}`}
                  >
                    Open site
                  </a>
                  <button
                    onClick={() => handleCopy(hostname || "", "host")}
                    className="block w-full rounded-lg border border-[#2B245C] bg-white px-4 py-2 text-sm font-medium text-[#2B245C] hover:bg-blue-50"
                  >
                    {copied === "host" ? "Hostname copied!" : "Copy hostname"}
                  </button>
                </div>
              </section>

              {/* Danger zone */}
              <section className="rounded-2xl border border-red-200 bg-red-50 p-5 shadow-sm">
                <h3 className="mb-2 text-sm font-semibold text-red-800">
                  Danger zone
                </h3>
                <p className="mb-3 text-sm text-red-700">
                  Deleting this site removes its configuration and associated
                  scan settings. This cannot be undone.
                </p>
                <button
                  onClick={openDeleteModal}
                  className="w-full rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
                >
                  Delete site
                </button>
              </section>
            </div>
          </div>
        </div>
      </div>

      {/* Delete confirmation modal */}
      {showDelete && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-title"
        >
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => !deleting && setShowDelete(false)}
          />
          <div className="relative w-full max-w-md rounded-xl border border-gray-200 bg-white p-6 shadow-xl">
            <h3
              id="delete-title"
              className="text-lg font-semibold text-gray-900"
            >
              Delete this site?
            </h3>
            <p className="mt-2 text-sm text-gray-600">
              This action cannot be undone. Type{" "}
              <strong>{hostname || site.domain}</strong> to confirm.
            </p>
            <ConfirmDelete
              label={hostname || site.domain}
              onCancel={() => setShowDelete(false)}
              onConfirm={handleDelete}
              loading={deleting}
            />
          </div>
        </div>
      )}
    </div>
  );
}
