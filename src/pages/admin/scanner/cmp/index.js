// src/pages/admin/scanner/cmp/index.jsx
import React, { useState, useEffect, useMemo, useCallback } from "react";
import CustomAxios from "@/config/CustomAxios";
import { useRouter } from "next/navigation";
import { can, guard } from "@/auth/auth-permissions";
import { baseurl, initURL } from "@/config/config";
import { FiEye, FiList, FiRefreshCw, FiX } from "react-icons/fi";
import { toast } from "react-toastify";

// ✅ add these
import Tour from "@/components/Tour/Tour";
import GuideButton from "@/components/Tour/GuideButton";

/* --------------------------------- helpers -------------------------------- */
const CATEGORIES = [
  "Essential",
  "Functional",
  "Analytics",
  "Marketing",
  "Advertising",
  "Social Media",
  "Uncategorized",
  "Other",
];

const formatDateTime = (ts) => {
  try {
    return new Date(ts).toLocaleString();
  } catch {
    return "-";
  }
};

/* ------------------------------- UI fragments ------------------------------ */
// Toggle for consent categories
function Toggle({ label, checked, onChange, disabled }) {
  return (
    <label className="flex items-center justify-between gap-4">
      <span className="font-medium text-gray-800">{label}</span>
      <button
        type="button"
        onClick={() => !disabled && onChange(!checked)}
        aria-pressed={checked}
        className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-300 ${checked ? "bg-emerald-600" : "bg-gray-300"} ${disabled ? "opacity-60 cursor-not-allowed" : ""}`}
        disabled={disabled}
      >
        <span
          className={`inline-block h-6 w-6 transform rounded-full bg-white shadow transition-transform ${checked ? "translate-x-6" : "translate-x-1"}`}
        />
      </button>
    </label>
  );
}

// Skeletons
function HeaderSkeleton() {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm animate-pulse">
      <div className="h-6 w-40 rounded bg-gray-200" />
      <div className="mt-2 h-4 w-64 rounded bg-gray-200" />
      <div className="mt-4 h-9 w-28 rounded bg-gray-200" />
    </div>
  );
}
function TableSkeleton() {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm animate-pulse">
      <div className="h-5 w-36 rounded bg-gray-200 mb-4" />
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-10 w-full rounded bg-gray-100" />
        ))}
      </div>
    </div>
  );
}

// Modal for logs
function LogsModal({ isOpen, logs, onClose }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 grid place-items-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-full max-w-4xl rounded-2xl border border-gray-200 bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-[#2B245C]">Consent Logs</h2>
          <button
            onClick={onClose}
            className="inline-flex items-center rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50"
          >
            <FiX className="mr-1" /> Close
          </button>
        </div>

        <div className="max-h-[60vh] overflow-auto rounded-lg border border-gray-500">
          <table className="min-w-full text-sm">
            <thead className="bg-[#2B245C] text-left text-white">
              <tr>
                <th className="px-4 py-2 font-medium">Timestamp</th>
                <th className="px-4 py-2 font-medium">Changes</th>
                <th className="px-4 py-2 font-medium">Meta</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {!logs || logs.length === 0 ? (
                <tr>
                  <td
                    className="px-4 py-3 text-center text-gray-500 italic"
                    colSpan={3}
                  >
                    No logs found.
                  </td>
                </tr>
              ) : (
                logs.map((log, idx) => (
                  <tr key={idx} className="align-top">
                    <td className="px-4 py-3 whitespace-nowrap">
                      {formatDateTime(log.createdAt)}
                    </td>
                    <td className="px-4 py-3">
                      {Array.isArray(log.changes) && log.changes.length > 0 ? (
                        log.changes.map((ch, i) => (
                          <div key={i}>
                            <code className="rounded bg-gray-100 px-1">
                              {ch.key}
                            </code>{" "}
                            from{" "}
                            <span className="font-medium">
                              {String(ch.from)}
                            </span>{" "}
                            to{" "}
                            <span className="font-medium">{String(ch.to)}</span>
                          </div>
                        ))
                      ) : (
                        <span className="text-gray-500">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="space-y-1">
                        <div className="truncate">
                          <span className="text-gray-500">IP:</span>{" "}
                          {log.ipAddress || "-"}
                        </div>
                        <div className="truncate">
                          <span className="text-gray-500">User Agent:</span>{" "}
                          {log.userAgent || "-"}
                        </div>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* --------------------------------- main ----------------------------------- */
export default function CMPAdminPage() {
  const router = useRouter();

  const [mode, setMode] = useState("all"); // 'lookup' | 'all'
  const [domain, setDomain] = useState("");
  const [userId, setUserId] = useState("");
  const [isDomainLocked, setIsDomainLocked] = useState(false);
  const [config, setConfig] = useState(null);
  const [consent, setConsent] = useState(null);
  const [allConsents, setAllConsents] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isLogsModalOpen, setIsLogsModalOpen] = useState(false);

  // ✅ tour state
  const [tourOpen, setTourOpen] = useState(false);

  // Permissions (only privacy.*)
  const canView = can(["privacy.read", "privacy.manage"], { mode: "all" });
  const canUpdate = can("privacy.update");

  useEffect(() => {
    if (mode === "all") setUserId("");
  }, [mode]);

  useEffect(() => {
    if (mode !== "lookup") return;
    const store = JSON.parse(localStorage.getItem("cmp_user") || "null");
    if (store?.userId) setUserId(store.userId);
  }, [mode]);

  useEffect(() => {
    setConfig(null);
    setConsent(null);
    setAllConsents([]);
  }, [mode]);

  useEffect(() => {
    // Parse query params
    const params = new URLSearchParams(window.location.search);
    const qDomain = params.get("domain");
    if (qDomain) {
      setDomain(qDomain);
      setIsDomainLocked(true);
    }
  }, []);

  // Load Data
  const loadData = useCallback(async () => {
    if (!domain || (mode !== "all" && !userId)) {
      return;
    }

    setLoading(true);

    try {
      if (mode === "all") {
        const res = await CustomAxios.get(
          `${baseurl}/${initURL}/cmp/consents`,
          {
            params: { domain },
          },
        );

        setAllConsents(res.data || []);
        setCurrentPage(1);
      } else {
        const [cfgRes, consentRes] = await Promise.all([
          CustomAxios.get(`${baseurl}/${initURL}/cmp/config`, {
            params: { domain },
          }),
          CustomAxios.get(`${baseurl}/${initURL}/cmp/consent`, {
            params: { domain, userId },
          }),
        ]);

        setConfig(cfgRes.data || []);
        setConsent(consentRes.data || null);
      }
    } catch (err) {
      console.error(err);
      toast.warn("Failed to load data");
    } finally {
      setLoading(false);
    }
  }, [domain, userId, mode]);

  // useEffect for Load Data function
  useEffect(() => {
    const d = domain.trim();

    if (!d) return;

    // Don't load until domain looks valid
    if (!d.includes(".")) return;

    if (mode === "lookup" && !userId.trim()) return;

    const timer = setTimeout(() => {
      loadData();
    }, 700);

    return () => clearTimeout(timer);
  }, [domain, userId, mode, loadData]);

  // async function loadData() {
  //   if (!domain || (mode !== "all" && !userId)) {
  //     return toast.warn(
  //       "Please enter Domain" + (mode !== "all" ? " and User ID" : ""),
  //     );
  //   }
  //   setLoading(true);
  //   try {
  //     if (mode === "all") {
  //       const res = await CustomAxios.get(
  //         `${baseurl}/${initURL}/cmp/consents`,
  //         { params: { domain } },
  //       );
  //       setAllConsents(res.data || []);
  //     } else {
  //       const [cfgRes, consentRes] = await Promise.all([
  //         CustomAxios.get(`${baseurl}/${initURL}/cmp/config`, {
  //           params: { domain },
  //         }),
  //         CustomAxios.get(`${baseurl}/${initURL}/cmp/consent`, {
  //           params: { domain, userId },
  //         }),
  //       ]);
  //       setConfig(cfgRes.data || []);
  //       setConsent(consentRes.data || null);
  //     }
  //   } catch (err) {
  //     console.error(err);
  //     toast.warn("Failed to load data");
  //   } finally {
  //     setLoading(false);
  //   }
  // }

  async function fetchLogs(d, u) {
    const dom = d ?? domain;
    const uid = u ?? userId;
    if (!dom || !uid)
      return toast.warn("Please provide domain and user ID to view logs");
    try {
      const res = await CustomAxios.get(`${baseurl}/${initURL}/cmp/logs`, {
        params: { domain: dom, userId: uid },
      });
      setLogs(res.data || []);
      setIsLogsModalOpen(true);
    } catch (err) {
      console.error(err);
      toast.warn("Failed to load logs");
    }
  }

  async function saveConsent() {
    if (!consent) return;
    setSaving(true);
    try {
      await CustomAxios.post(`${baseurl}/${initURL}/cmp/consent`, {
        domain,
        userId,
        choices: consent.choices,
      });
      toast.success("Consent saved");
    } catch (err) {
      console.error(err);
      toast.warn("Failed to save consent");
    } finally {
      setSaving(false);
    }
  }

  function toggleCategory(key) {
    setConsent((c) => ({
      ...c,
      choices: { ...(c?.choices || {}), [key]: !c?.choices?.[key] },
    }));
  }

  function handleAnyButtonClick(dom, uid) {
    setDomain(dom);
    setUserId(uid);
    setMode("lookup");
  }

  // ✅ simple 6-step tour (short, clear)
  const tourSteps = useMemo(
    () => [
      {
        target: "#modeToggle",
        title: "Modes",
        content:
          "“All Consents” lists all users. “Lookup Consent” inspects a single user.",
      },
      {
        target: "#domainInput",
        title: "Domain",
        content:
          "Enter the website domain you want to manage, e.g., example.com.",
      },
      {
        target: "#userIdInput",
        title: "User ID",
        content:
          "Only needed in “Lookup Consent” mode to view a specific user.",
      },
      {
        target: "#loadBtn",
        title: "Load data",
        content:
          "Click here to fetch configs, consent, or the full list depending on mode.",
        placement: "bottom",
      },
      {
        target: "#resultsHint",
        title: "Results",
        content:
          "See all consents in a table or edit a single user’s choices and view logs.",
      },
    ],
    [mode],
  );

  // Pagination Calculations
  const totalPages = Math.ceil(allConsents.length / rowsPerPage);

  const paginatedConsents = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return allConsents.slice(start, start + rowsPerPage);
  }, [allConsents, currentPage, rowsPerPage]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="mx-5 min-h-screen bg-white rounded-lg p-5 my-3">
        <div className="px-6 py-8 bg-[#2B245C] rounded-2xl shadow-lg hover:shadow-2xl transition-shadow duration-300">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-semibold text-cyan-50">CMP Admin</h1>
              <p className="mt-1 text-sm text-white">
                Lookup and manage end-user cookie consent.
              </p>
            </div>
            <GuideButton
              onClick={() => setTourOpen(true)}
              variant="primary"
              size="md"
              className="!from-blue-500 !to-blue-600 hover:!from-blue-400 hover:!to-blue-500 !text-white !border-blue-400/70 !shadow-blue-600/30"
            />
          </div>
        </div>

        <div className="py-6 space-y-6">
          {/* Controls */}
          <section className="rounded-2xl border border-[#2B245C] bg-white p-6 shadow-lg hover:shadow-2xl transition-shadow duration-300">
            <div className="flex flex-wrap items-center gap-3" id="modeToggle">
              <div className="inline-flex overflow-hidden rounded-xl border border-gray-200 bg-gray-50 p-1">
                {["lookup", "all"].map((m) => (
                  <button
                    key={m}
                    onClick={() => setMode(m)}
                    className={`px-4 py-2 text-sm font-medium capitalize transition ${mode === m ? "bg-white text-indigo-700 shadow-sm" : "text-gray-600 hover:text-gray-900"}`}
                  >
                    {m === "lookup" ? "Lookup Consent" : "All Consents"}
                  </button>
                ))}
              </div>

              <div className="flex-1" />

              <button
                id="loadBtn"
                onClick={() => guard(canView, router, loadData)}
                disabled={loading}
                className="inline-flex items-center rounded-lg bg-[#2B245C] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-opacity-90 disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <span className="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/60 border-t-white" />
                    Loading…
                  </>
                ) : (
                  <>
                    <FiRefreshCw className="mr-2" />
                    Load Data
                  </>
                )}
              </button>
            </div>

            {/* Inputs */}
            <div className="mt-4 grid gap-4 md:grid-cols-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700">
                  Domain
                </label>
                <input
                  id="domainInput"
                  type="text"
                  placeholder="example.com"
                  value={domain}
                  onChange={(e) => setDomain(e.target.value)}
                  readOnly={isDomainLocked}
                  className={`mt-1 block w-full rounded-xl border px-3 py-2 text-gray-900 placeholder:text-gray-400 focus:outline-none ${
                    isDomainLocked
                      ? "border-gray-200 bg-gray-100 text-gray-600 cursor-not-allowed"
                      : "border-gray-200 bg-white focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                  }`}
                />
              </div>

              <div>
                <label
                  className={`block text-sm font-medium ${mode === "all" ? "text-gray-400" : "text-gray-700"}`}
                >
                  User ID
                </label>
                <input
                  id="userIdInput"
                  type="text"
                  placeholder="user-123"
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  disabled={mode === "all"}
                  className={`mt-1 block w-full rounded-xl border px-3 py-2 text-gray-900 placeholder:text-gray-400 focus:outline-none ${
                    mode === "all"
                      ? "border-gray-200 bg-gray-100"
                      : "border-gray-200 bg-white focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                  }`}
                />
              </div>
            </div>
          </section>

          {/* Loading skeletons */}
          {loading && (
            <div className="space-y-4">
              <HeaderSkeleton />
              <TableSkeleton />
            </div>
          )}

          {/* All consents table */}
          {!loading && mode === "all" && (
            <section
              id="resultsHint"
              className="rounded-2xl border border-[#2B245C] bg-white p-6 shadow-lg hover:shadow-2xl transition-shadow duration-300"
            >
              <h2 className="mb-4 text-2xl font-semibold text-[#2B245C]">
                All Consents{" "}
                <span className="text-gray-600">
                  {domain ? ` — ${domain}` : ""}
                </span>
              </h2>

              {allConsents.length === 0 ? (
                <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-10 text-center text-gray-600">
                  No consents found. Enter a domain and click{" "}
                  <span className="font-medium">Load Data</span>.
                </div>
              ) : (
                <div>
                  <div className="overflow-auto rounded-lg border border-gray-500">
                    <table className="min-w-full text-sm">
                      <thead className="bg-[#2B245C] text-left text-white border-b border-gray-500">
                        <tr>
                          <th className="px-4 py-2 font-medium">User ID</th>
                          <th className="px-4 py-2 font-medium">Choices</th>
                          <th className="px-4 py-2 font-medium whitespace-nowrap">
                            Updated At
                          </th>
                          <th className="px-4 py-2 font-medium">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {paginatedConsents.map((c) => (
                          <tr key={c._id} className="hover:bg-gray-50">
                            <td className="px-4 py-2 font-medium text-gray-900">
                              {c.userId}
                            </td>
                            <td className="px-4 py-2 text-gray-800">
                              {c.choices
                                ? Object.entries(c.choices)
                                    .map(
                                      ([k, v]) =>
                                        `${k}: ${v ? "true" : "false"}`,
                                    )
                                    .join(", ")
                                : "—"}
                            </td>
                            <td className="px-4 py-2 whitespace-nowrap">
                              {formatDateTime(c.updatedAt)}
                            </td>
                            <td className="px-4 py-2">
                              <div className="flex flex-wrap gap-2">
                                <button
                                  className="inline-flex items-center rounded-lg bg-indigo-800 px-3 py-1.5 text-xs font-medium text-white hover:bg-indigo-700"
                                  onClick={() =>
                                    guard(canView, router, () =>
                                      handleAnyButtonClick(c.domain, c.userId),
                                    )
                                  }
                                >
                                  <FiEye className="mr-2" /> View Consent
                                </button>
                                <button
                                  className="inline-flex items-center rounded-lg bg-cyan-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-cyan-500"
                                  onClick={() =>
                                    guard(canView, router, () =>
                                      fetchLogs(c.domain, c.userId),
                                    )
                                  }
                                >
                                  <FiList className="mr-2" /> View Logs
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination */}
                  <div className="mt-4 flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">
                        Rows per page
                      </span>

                      <select
                        value={rowsPerPage}
                        onChange={(e) => {
                          setRowsPerPage(Number(e.target.value));
                          setCurrentPage(1);
                        }}
                        className="rounded-lg border border-gray-300 px-2 py-2"
                      >
                        <option value={5}>5</option>
                        <option value={10}>10</option>
                        <option value={20}>20</option>
                        <option value={50}>50</option>
                        <option value={100}>100</option>
                      </select>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      {/* First */}
                      <button
                        onClick={() => setCurrentPage(1)}
                        disabled={currentPage === 1}
                        className="rounded-lg bg-[#2B245C] text-white px-3 py-2 text-sm font-semibold shadow-md hover:shadow-lg hover:bg-opacity-90 disabled:opacity-50 transition-all"
                      >
                        First
                      </button>

                      {/* Previous */}
                      <button
                        onClick={() =>
                          setCurrentPage((p) => Math.max(p - 1, 1))
                        }
                        disabled={currentPage === 1}
                        className="rounded-lg bg-[#2B245C] text-white px-3 py-2 text-sm font-semibold shadow-md hover:shadow-lg hover:bg-opacity-90 disabled:opacity-50 transition-all"
                      >
                        Prev
                      </button>

                      <span className="px-3 text-sm font-medium">
                        Page {currentPage} of {totalPages || 1}
                      </span>

                      {/* Next */}
                      <button
                        onClick={() =>
                          setCurrentPage((p) => Math.min(p + 1, totalPages))
                        }
                        disabled={
                          currentPage === totalPages || totalPages === 0
                        }
                        className="rounded-lg bg-[#2B245C] text-white px-3 py-2 text-sm font-semibold shadow-md hover:shadow-lg hover:bg-opacity-90 disabled:opacity-50 transition-all"
                      >
                        Next
                      </button>

                      {/* Last */}
                      <button
                        onClick={() => setCurrentPage(totalPages)}
                        disabled={
                          currentPage === totalPages || totalPages === 0
                        }
                        className="rounded-lg bg-[#2B245C] text-white px-3 py-2 text-sm font-semibold shadow-md hover:shadow-lg hover:bg-opacity-90 disabled:opacity-50 transition-all"
                      >
                        Last
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </section>
          )}

          {/* Lookup view: banner config + toggles */}
          {!loading && mode !== "all" && config && consent && (
            <section
              id="resultsHint"
              className="rounded-2xl border border-[#2B245C] bg-white p-6 shadow-lg hover:shadow-2xl transition-shadow duration-300"
            >
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-[#2B245C]">
                  Banner Config
                  <span className="text-gray-600"> — {domain}</span>
                </h2>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => guard(canView, router, () => fetchLogs())}
                    className="inline-flex items-center rounded-lg border border-[#2B245C] bg-white px-3 py-1.5 text-sm font-medium text-[#2B245C] hover:bg-blue-50"
                  >
                    <FiList className="mr-2" /> View Logs
                  </button>
                  <button
                    onClick={() => guard(canUpdate, router, saveConsent)}
                    disabled={saving}
                    className="inline-flex items-center rounded-lg bg-[#2B245C] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-opacity-90 disabled:opacity-60"
                  >
                    {saving ? (
                      <>
                        <span className="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/60 border-t-white" />
                        Saving…
                      </>
                    ) : (
                      "Save Changes"
                    )}
                  </button>
                </div>
              </div>

              {/* Config list */}
              <div className="grid gap-4 md:grid-cols-2">
                {config.map((item, idx) => (
                  <div
                    key={idx}
                    className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="text-base font-semibold text-gray-900">
                          {item.name}
                        </h3>
                        {item.description && (
                          <p className="mt-1 text-sm text-gray-600">
                            {item.description}
                          </p>
                        )}
                      </div>
                      <Toggle
                        label="Enabled"
                        checked={!!consent?.choices?.[item.key]}
                        onChange={() => toggleCategory(item.key)}
                      />
                    </div>

                    {Array.isArray(item.vendors) && item.vendors.length > 0 && (
                      <details className="mt-3 rounded-lg border border-gray-200 bg-gray-50 p-3">
                        <summary className="cursor-pointer text-sm font-medium text-gray-800">
                          Vendors ({item.vendors.length})
                        </summary>
                        <ul className="mt-2 list-disc pl-6 text-sm text-gray-700">
                          {item.vendors.map((v, i) => (
                            <li key={i} className="truncate">
                              {v.key || String(v)}
                            </li>
                          ))}
                        </ul>
                      </details>
                    )}
                  </div>
                ))}
              </div>

              {/* Category quick-assign (optional helper) */}
              <div className="mt-6 rounded-xl border border-dashed border-gray-300 bg-gray-50 p-4">
                <div className="text-sm text-gray-700 mb-2">
                  Quick reclassify individual cookies:
                </div>
                <div className="flex flex-wrap gap-2 text-xs text-gray-600">
                  {CATEGORIES.map((c) => (
                    <span
                      key={c}
                      className="rounded-full border border-gray-200 bg-white px-2 py-1"
                    >
                      {c}
                    </span>
                  ))}
                </div>
                <p className="mt-2 text-xs text-gray-500">
                  Note: Category assignment here is informational. Use your
                  Cookies screen to classify specific cookies.
                </p>
              </div>
            </section>
          )}

          {/* Logs modal */}
          <LogsModal
            isOpen={isLogsModalOpen}
            logs={logs}
            onClose={() => setIsLogsModalOpen(false)}
          />
        </div>
      </div>

      <Tour
        steps={tourSteps}
        open={tourOpen}
        onClose={() => setTourOpen(false)}
      />
    </div>
  );
}
