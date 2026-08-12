// components/SelectorRunSummaryDashboard.jsx
import { baseurl, initURL } from "@/config/config";
import axios from "axios";
import { FileText } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";

/* ---------------- UI helpers ---------------- */
function Spinner({ size = 24 }) {
  return (
    <div
      aria-label="loading"
      className="inline-block animate-spin"
      style={{
        width: size,
        height: size,
        border: "3px solid",
        borderRadius: "50%",
        borderColor: "currentColor transparent currentColor transparent",
      }}
    />
  );
}

function InfoTile({ label, value }) {
  return (
    <div className="rounded-lg border border-gray-300 px-3 py-2">
      <div className="text-xs text-gray-500">{label}</div>
      <div className="text-sm font-medium break-all">{value || "—"}</div>
    </div>
  );
}

/* ---------------- Utils ---------------- */
function formatDate(d) {
  if (!d) return "—";
  try {
    return new Date(d).toLocaleString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "—";
  }
}

async function copyToClipboard(value) {
  if (!value) throw new Error("Nothing to copy");
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(value);
    } else {
      const ta = document.createElement("textarea");
      ta.value = value;
      ta.setAttribute("readonly", "");
      ta.style.position = "absolute";
      ta.style.left = "-9999px";
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand("copy");
      document.body.removeChild(ta);
      if (!ok) throw new Error("execCommand copy failed");
    }
  } catch (err) {
    console.warn("copy failed:", err);
    throw err;
  }
}

/* ---------------- Domain helpers ---------------- */
function getSummaryDomain(summary) {
  const cfg =
    summary?.configId && typeof summary.configId === "object"
      ? summary.configId
      : null;
  return (cfg?.domain || "").trim();
}

function matchesDomain(summary, userInput) {
  const filterVal = (userInput || "").trim();
  if (!filterVal) return true;
  const cfgDomain = getSummaryDomain(summary);
  return cfgDomain === filterVal;
}

/* ---------------- Field helpers ---------------- */
function buildRuleMetaMap(configObj) {
  const map = new Map();
  if (configObj?.rules?.length) {
    configObj.rules.forEach((r) => {
      const key = r._id || r.id;
      if (key) {
        map.set(key, {
          fieldName: r.fieldName || "",
          description: r.description || "",
        });
      }
    });
  }
  return map;
}

function humanizeValue(v) {
  if (v === true || v === "true") return "Yes";
  if (v === false || v === "false") return "No";
  if (v === undefined || v === null) return "";
  if (typeof v === "object") {
    try {
      return JSON.stringify(v);
    } catch {
      return String(v);
    }
  }
  return String(v);
}

function extractDisplayFields(summary) {
  const cfg =
    summary.configId && typeof summary.configId === "object"
      ? summary.configId
      : null;
  const meta = buildRuleMetaMap(cfg);

  const fields = (summary.ruleResults || []).map((r) => {
    const m = meta.get(r.rule_id) || {};
    const label = m.fieldName || r.fragment || "Field";
    const desc = m.description || "";
    const values = Array.isArray(r.values)
      ? r.values.map(humanizeValue).filter(Boolean)
      : [humanizeValue(r.values)];
    const value = values.filter(Boolean).join(", ");
    return { label, value, description: desc };
  });

  return fields;
}

function extractHeader(summary) {
  const cfg =
    summary.configId && typeof summary.configId === "object"
      ? summary.configId
      : null;
  const formName = (cfg && (cfg.formName || cfg.name)) || "Form submission";
  const domain = (cfg?.domain || "").trim();
  const route = cfg?.route || "";
  const page = domain ? `${domain}${route || ""}` : route || "—";
  return { formName, page, domain };
}

/* ---------------- Component ---------------- */
export default function SelectorRunSummaryDashboard() {
  const [domainFilter, setDomainFilter] = useState("");
  const [summaries, setSummaries] = useState([]);
  const [selected, setSelected] = useState(null); // drawer data (null = closed)
  const [detailCache, setDetailCache] = useState({}); // {_id: fullSummary}
  const [loading, setLoading] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [error, setError] = useState(null);

  const endpointBase = `${baseurl}/${initURL}/cmp/selector-config-run-summaries`;

  const fetchSummaries = useCallback(
    async (domainValue) => {
      setError(null);
      setLoading(true);
      try {
        const params = domainValue ? { domain: domainValue.trim() } : {};
        const res = await axios.get(endpointBase, { params });
        const data = Array.isArray(res.data?.data) ? res.data.data : [];
        setSummaries(data);
      } catch (e) {
        console.error(e);
        setError(
          e.response?.data?.message ||
            e.message ||
            "Unknown error while fetching activity."
        );
      } finally {
        setLoading(false);
      }
    },
    [endpointBase]
  );

  const fetchOne = useCallback(
    async (id) => {
      setLoadingDetail(true);
      try {
        const res = await axios.get(
          `${endpointBase}/${encodeURIComponent(id)}`
        );
        const data = res.data?.data;
        setDetailCache((prev) => ({ ...prev, [id]: data }));
        setSelected(data); // ensure drawer shows the full data once loaded
      } catch (e) {
        console.error(e);
        toast.error(
          e.response?.data?.message || e.message || "Failed to load details."
        );
      } finally {
        setLoadingDetail(false);
      }
    },
    [endpointBase]
  );

  const handleCopy = useCallback(async (value, label = "Value") => {
    if (!value) return;
    try {
      await copyToClipboard(value);
      toast.success(`Copied ${label}!`);
    } catch {
      toast.error(`Failed to copy ${label}`);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchSummaries("");
  }, [fetchSummaries]);

  // Close drawer on ESC & lock body scroll while open
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") setSelected(null);
    };
    if (selected) {
      document.addEventListener("keydown", onKey);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [selected]);

  const handleSearch = (e) => {
    e.preventDefault();
    setSelected(null); // keep drawer closed on new search
    fetchSummaries(domainFilter);
  };

  const handleView = (row) => {
    const id = row._id || "";
    if (!id) return;
    // open immediately with whatever we have, then hydrate if needed
    const cached = detailCache[id];
    if (row.ruleResults) {
      setDetailCache((p) => ({ ...p, [id]: row }));
      setSelected(row);
    } else if (cached) {
      setSelected(cached);
    } else {
      // show a lightweight shell while loading
      setSelected({
        _id: id,
        createdAt: row.createdAt,
        configId: row.configId,
      });
      fetchOne(id);
    }
  };

  const closeDrawer = () => setSelected(null);

  const reset = () => {
    setDomainFilter("");
    setSelected(null);
    setError(null);
    fetchSummaries("");
  };

  const filteredSummaries = useMemo(
    () => (summaries || []).filter((s) => matchesDomain(s, domainFilter)),
    [summaries, domainFilter]
  );

  const metrics = useMemo(() => {
    const totalRuns = filteredSummaries.length;
    const uniqueConfigs = Array.from(
      new Set(
        filteredSummaries.map((s) => {
          if (s.configId && typeof s.configId === "object")
            return s.configId._id;
          return s.configId;
        })
      )
    ).filter(Boolean).length;
    const totalRulesCaptured = filteredSummaries.reduce(
      (acc, s) => acc + ((s.ruleResults || []).length || 0),
      0
    );
    return { totalRuns, uniqueConfigs, totalRulesCaptured };
  }, [filteredSummaries]);

  return (
    <div className="h-full bg-transparent text-gray-800">
      {/* Header */}
      <div className="px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-indigo-700 text-white grid place-items-center">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl text-[#2B245C] font-semibold leading-tight">
                Existing Webform Activity
              </h1>
              <p className="text-sm text-gray-500">
                Exact domain filter • Most recent first
              </p>
            </div>
          </div>

          {/* Controls */}
          <form
            onSubmit={handleSearch}
            className="flex flex-wrap items-center gap-2"
          >
            <div className="relative">
              <input
                type="text"
                value={domainFilter}
                onChange={(e) => setDomainFilter(e.target.value)}
                placeholder="Exact domain (e.g. https://dev.grc3.io)"
                className="w-72 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              {domainFilter && (
                <button
                  type="button"
                  aria-label="clear"
                  onClick={() => setDomainFilter("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-500"
                >
                  ✕
                </button>
              )}
            </div>

            <button
              type="submit"
              className="rounded-lg bg-[#2B245C] text-white px-3 py-2 text-sm font-medium hover:bg-indigo-700 flex items-center gap-2"
            >
              {loading ? <Spinner size={14} /> : null}
              Search
            </button>
            <button
              type="button"
              onClick={reset}
              className="rounded-lg border border-[#2B245C] bg-white px-3 py-2 text-sm text-[#2B245C] hover:bg-gray-50"
            >
              Reset
            </button>
          </form>
        </div>
      </div>

      {/* Body */}
      <div className="px-4 sm:px-6 lg:px-8 pb-10">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="p-4 border-b border-gray-100 flex items-center justify-between">
            <div className="text-sm text-gray-500">
              {error ? (
                <span className="text-red-600">Error: {error}</span>
              ) : loading ? (
                <span className="inline-flex items-center gap-2">
                  <Spinner size={14} /> Loading activity…
                </span>
              ) : (
                <>
                  Showing <b>{filteredSummaries.length}</b> runs •{" "}
                  <b>{metrics.uniqueConfigs}</b> forms •{" "}
                  <b>{metrics.totalRulesCaptured}</b> fields captured
                </>
              )}
            </div>
          </div>

          <div className="overflow-x-auto">
            {!loading && !error && filteredSummaries.length === 0 ? (
              <div className="py-12 text-center text-gray-500">
                No activity for this exact domain.
              </div>
            ) : (
              <table className="min-w-full text-sm">
                <thead className="bg-[#2B245C] text-center text-white border-b border-gray-800">
                  <tr className="text-left text-white">
                    {["#", "Form", "Domain", "When", "Actions"].map((h) => (
                      <th key={h} className="py-2 px-3">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredSummaries.map((s, i) => {
                    const { formName, page, domain } = extractHeader(s);
                    return (
                      <tr
                        key={s._id || i}
                        className="border-t hover:bg-gray-50"
                      >
                        <td className="py-2 px-3 whitespace-nowrap">{i + 1}</td>
                        <td className="py-2 px-3">
                          <div className="inline-flex items-center rounded-md bg-indigo-50 px-2 py-0.5 text-xs font-medium text-indigo-700 border border-indigo-200">
                            {formName}
                          </div>
                        </td>
                        <td className="py-2 px-3">
                          {domain ? (
                            <div className="flex items-center gap-2">
                              <span
                                className="truncate max-w-[200px]"
                                title={domain}
                              >
                                {domain}
                              </span>
                              <button
                                onClick={() => handleCopy(domain, "domain")}
                                className="text-gray-400 hover:text-gray-600"
                                title="Copy domain"
                              >
                                📋
                              </button>
                            </div>
                          ) : (
                            "—"
                          )}
                        </td>
                        <td className="py-2 px-3 whitespace-nowrap">
                          {formatDate(s.createdAt)}
                        </td>
                        <td className="py-2 px-3">
                          <button
                            onClick={() => handleView(s)}
                            className="rounded-lg border border-[#2B245C] bg-white px-3 py-1.5 text-xs text-[#2B245C] hover:bg-gray-50"
                            title="View details"
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                  {loading && (
                    <tr>
                      <td
                        colSpan={6}
                        className="py-6 text-center text-gray-500"
                      >
                        <div className="inline-flex items-center gap-2">
                          <Spinner /> Loading…
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {/* Modal (opens only on View) */}
      {!!selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 sm:px-6">
          {/* overlay */}
          <button
            aria-label="Close drawer"
            className="absolute inset-0 bg-black/40"
            onClick={closeDrawer}
          />
          {/* panel */}
          <div
            className="relative z-10 w-full max-w-3xl max-h-[90vh] bg-white shadow-xl rounded-xl flex flex-col"
            role="dialog"
            aria-modal="true"
          >
            <div className="p-4 bg-[#2B245C] border-b rounded-t-xl flex items-center justify-between">
              <div>
                <div className="text-sm text-white">Submission</div>
                {(() => {
                  const { formName, domain } = extractHeader(selected);
                  return (
                    <div className="text-base text-cyan-50 font-semibold">
                      {formName} {domain ? <>• {domain}</> : null}
                    </div>
                  );
                })()}
              </div>
              <button
                className="rounded-lg text-[#2B245C] bg-white border border-[#2B245C] px-3 py-1.5 text-sm hover:bg-blue-50"
                onClick={closeDrawer}
              >
                Close
              </button>
            </div>

            <div className="p-4 grow overflow-y-auto">
              {(() => {
                const { formName, page, domain } = extractHeader(selected);
                return (
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <InfoTile label="Form" value={formName} />
                    <InfoTile
                      label="When"
                      value={formatDate(selected.createdAt)}
                    />
                    <InfoTile label="Domain" value={domain} />
                  </div>
                );
              })()}

              <div className="border border-[#2B245C] rounded-lg overflow-hidden">
                <div className="bg-blue-100 text-gray-800 px-3 py-2 text-sm font-medium">
                  Captured Fields
                </div>
                <div className="divide-y">
                  {loadingDetail ? (
                    <div className="px-3 py-6 text-sm text-gray-600 flex items-center gap-2">
                      <Spinner /> Loading details…
                    </div>
                  ) : (
                    <>
                      {extractDisplayFields(selected).map((f, idx) => (
                        <div
                          key={idx}
                          className="px-3 py-2 text-xs flex items-start justify-between gap-3"
                        >
                          <div className="text-gray-600 w-40 shrink-0 text-xs">
                            <div className="font-medium">{f.label || "—"}</div>
                            {f.description ? (
                              <div className="text-gray-500 mt-0.5">
                                {f.description}
                              </div>
                            ) : null}
                          </div>
                          <div className="grow">
                            {f.value ? (
                              <span className="text-gray-900 break-words">
                                {f.value}
                              </span>
                            ) : (
                              <em className="text-gray-400">—</em>
                            )}
                          </div>
                        </div>
                      ))}
                      {extractDisplayFields(selected).length === 0 && (
                        <div className="px-3 py-6 text-sm text-gray-500">
                          No fields captured.
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="p-4 border-t flex items-center justify-end gap-2">
              {(() => {
                const { domain } = extractHeader(selected);
                return domain ? (
                  <button
                    onClick={() => handleCopy(domain, "domain")}
                    className="rounded-lg bg-[#2B245C] border border-[#2B245C] px-3 py-2 text-white text-sm hover:bg-opacity-90"
                  >
                    Copy domain
                  </button>
                ) : null;
              })()}
              <button
                onClick={closeDrawer}
                className="rounded-lg bg-white text-[#2B245C] border border-[#2B245C] px-3 py-2 text-sm hover:bg-blue-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
