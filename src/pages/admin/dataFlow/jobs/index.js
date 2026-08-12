import React, { useEffect, useMemo, useState } from "react";
import CustomAxios from "@/globalcomponents/CustomAxios";
import { useRouter } from "next/router";
import { can, guard } from "@/auth/auth-permissions";
import { baseurl, initURL } from "@/config/config";
import DataFlowNav from "../Nav";
import ConnectorHelperModal from "@/components/dataflow/ConnectorHelperModal";
import GuideButton from "@/components/Tour/GuideButton";
import Tour from "@/components/Tour/Tour";

export default function DataFlowJobsPage() {
  const apiBase = `${baseurl}/${initURL}/dataflowjobs`;

  const router = useRouter();

  // jobs state
  const [status, setStatus] = useState(""); // '', queued, running, success, failed, canceled
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [pageMeta, setPageMeta] = useState({ total: 0, hasMore: false });

  const [jobs, setJobs] = useState([]);
  const [loadingJobs, setLoadingJobs] = useState(false);
  const [error, setError] = useState("");

  // create job
  const [name, setName] = useState("");
  const [connectorsText, setConnectorsText] = useState(
    `[
  {
    "name": "os-privacy",
    "type": "fs",
    "uri": "file:///C:/Users/mange/Documents/nis/privacy",
    "exclude_dirs": ["temp","backup"],
    "run": true
  }
]`,
  );
  const [creating, setCreating] = useState(false);
  const [acting, setActing] = useState(false);

  // selection + panes
  const [selectedJob, setSelectedJob] = useState(null);
  const [jobDetails, setJobDetails] = useState(null);
  const [results, setResults] = useState([]);
  const [aggregate, setAggregate] = useState([]);
  const [configObj, setConfigObj] = useState(null);

  const [loadingDetails, setLoadingDetails] = useState(false);
  const [loadingResults, setLoadingResults] = useState(false);
  const [loadingAggregate, setLoadingAggregate] = useState(false);
  const [loadingConfig, setLoadingConfig] = useState(false);

  // ingest CSV
  const [csvText, setCsvText] = useState("");
  const [ingesting, setIngesting] = useState(false);

  // Help tour

  const [tourOpen, setTourOpen] = useState(false);

  // Permissions
  const canView = can("privacy.read") || can("scanner.read");

  const steps = [
    {
      target: '[data-tour="jobs-header"]',
      title: "DataFlow Jobs",
      content:
        "This page lists scanner jobs (runs). You can filter by status, paginate through jobs, and open a job to view more details.",
      placement: "bottom",
    },
    {
      target: '[data-tour="jobs-filters"]',
      title: "Filters & Pagination",
      content:
        "Use the status filter to narrow results (Queued/Running/Success/Failed). Change page size and use Prev/Next to navigate through jobs.",
      placement: "bottom",
    },
    {
      target: '[data-tour="jobs-table-section"]',
      title: "Jobs Table",
      content:
        "This table shows each job’s name, status, and start/finish time. Jobs automatically refresh while running.",
      placement: "top",
    },
    {
      target: '[data-tour="jobs-table"]',
      title: "Open Job Details",
      content:
        "Click any row to open the job details page, where you can review the scan configuration and results.",
      placement: "top",
    },
  ];

  const timeAgo = (ts) => {
    if (!ts) return "—";
    const diff = Date.now() - new Date(ts).getTime();
    const s = Math.floor(diff / 1000);
    const m = Math.floor(s / 60);
    const h = Math.floor(m / 60);
    const d = Math.floor(h / 24);
    if (d > 0) return `${d}d ago`;
    if (h > 0) return `${h}h ago`;
    if (m > 0) return `${m}m ago`;
    return `${s}s ago`;
  };

  const statusTone = (status = "") => {
    const s = (status || "").toLowerCase();
    if (s.includes("queued"))
      return "border-amber-200 bg-amber-50 text-amber-800";
    if (s.includes("running"))
      return "border-blue-200 bg-blue-50 text-blue-700";
    if (s.includes("success"))
      return "border-emerald-200 bg-emerald-50 text-emerald-700";
    if (s.includes("failed") || s.includes("error"))
      return "border-red-200 bg-red-50 text-red-700";
    return "border-gray-200 bg-gray-50 text-gray-700";
  };

  const fetchJobs = async () => {
    try {
      setLoadingJobs(true);
      const params = new URLSearchParams();
      if (status) params.set("status", status);
      params.set("page", String(page));
      params.set("pageSize", String(pageSize));
      const res = await CustomAxios.get(`${apiBase}?${params.toString()}`);
      const data = res.data || {};
      setJobs(data.jobs || []);
      setPageMeta({ total: data.total || 0, hasMore: !!data.hasMore });
      setError("");
    } catch (err) {
      console.error("Fetch jobs error:", err?.response || err?.message || err);
      setError("Failed to fetch jobs.");
    } finally {
      setLoadingJobs(false);
    }
  };

  const startJob = async () => {
    try {
      setCreating(true);
      setError("");
      let connectors = [];
      try {
        connectors = JSON.parse(connectorsText);
        if (!Array.isArray(connectors))
          throw new Error("connectors must be an array");
      } catch (e) {
        setError("Invalid JSON in connectors.");
        setCreating(false);
        return;
      }
      const res = await CustomAxios.post(apiBase, { name, connectors });
      if (res.status < 200 || res.status >= 300)
        throw new Error(`Server ${res.status}`);
      setName("");
      await fetchJobs();
    } catch (err) {
      console.error("Create job error:", err?.response || err?.message || err);
      setError("Failed to create job.");
    } finally {
      setCreating(false);
    }
  };

  const rerunJob = async () => {
    if (!selectedJob) return;
    setActing(true);
    try {
      const id = selectedJob._id || selectedJob.id;
      await CustomAxios.post(`${apiBase}/${id}/rerun`, {
        name: `${selectedJob.name || "scan"} (rerun)`,
      });
      await fetchJobs();
    } catch (e) {
      console.error("rerun error", e);
      setError("Failed to rerun job.");
    } finally {
      setActing(false);
    }
  };

  const cancelJob = async () => {
    if (!selectedJob) return;
    const st = (selectedJob.status || "").toLowerCase();
    if (st !== "queued") return;
    setActing(true);
    try {
      const id = selectedJob._id || selectedJob.id;
      await CustomAxios.post(`${apiBase}/${id}/cancel`);
      await Promise.all([fetchJobs(), fetchDetails(id)]);
    } catch (e) {
      console.error("cancel error", e);
      setError("Failed to cancel job.");
    } finally {
      setActing(false);
    }
  };

  const selectJob = (job) => {
    const id = job._id || job.id;
    setSelectedJob(job);
    setJobDetails(null);
    setResults([]);
    setAggregate([]);
    setConfigObj(null);
    fetchDetails(id);
    fetchResults(id);
    fetchAggregate(id);
    fetchConfig(id);
    router.push(`/admin/dataFlow/jobs/${id}`);
  };

  const fetchDetails = async (id) => {
    setLoadingDetails(true);
    try {
      const res = await CustomAxios.get(`${apiBase}/${id}`);
      setJobDetails(res.data);
    } catch (err) {
      console.error("Fetch details error:", err);
      setJobDetails(null);
    } finally {
      setLoadingDetails(false);
    }
  };

  const fetchResults = async (id) => {
    setLoadingResults(true);
    try {
      const res = await CustomAxios.get(`${apiBase}/${id}/results?limit=300`);
      setResults(res.data || []);
    } catch (err) {
      console.error("Fetch results error:", err);
      setResults([]);
    } finally {
      setLoadingResults(false);
    }
  };

  const fetchAggregate = async (id) => {
    setLoadingAggregate(true);
    try {
      const res = await CustomAxios.get(
        `${apiBase}/${id}/aggregate/categories`,
      );
      setAggregate(res.data || []);
    } catch (err) {
      console.error("Fetch aggregate error:", err);
      setAggregate([]);
    } finally {
      setLoadingAggregate(false);
    }
  };

  const fetchConfig = async (id) => {
    setLoadingConfig(true);
    try {
      const res = await CustomAxios.get(`${apiBase}/${id}/config`);
      setConfigObj(res.data || {});
    } catch (err) {
      console.error("Fetch config error:", err);
      setConfigObj(null);
    } finally {
      setLoadingConfig(false);
    }
  };

  const downloadJson = (obj, filename = "config.json") => {
    const url = URL.createObjectURL(
      new Blob([JSON.stringify(obj, null, 2)], { type: "application/json" }),
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const copyJson = async (obj) => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(obj, null, 2));
    } catch {}
  };

  const onCsvFile = (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setCsvText(String(reader.result || ""));
    reader.readAsText(file);
  };

  const ingestCsv = async () => {
    if (!selectedJob) return;
    const id = selectedJob._id || selectedJob.id;
    if (!csvText.trim()) return;
    setIngesting(true);
    try {
      await CustomAxios.post(`${apiBase}/${id}/ingest`, { csv: csvText });
      // refresh results/summary + details (status flips to success)
      await Promise.all([
        fetchDetails(id),
        fetchResults(id),
        fetchAggregate(id),
      ]);
    } catch (err) {
      console.error("Ingest CSV error:", err?.response || err?.message || err);
      setError("Failed to ingest CSV.");
    } finally {
      setIngesting(false);
    }
  };

  // re-run fetchJobs when status/page/pageSize change
  useEffect(() => {
    fetchJobs(); /* eslint-disable-next-line */
  }, [status, page, pageSize]);

  // poll jobs + refresh current job panes if running
  useEffect(() => {
    fetchJobs();
    const int = setInterval(async () => {
      await fetchJobs();
      if (selectedJob) {
        const id = selectedJob._id || selectedJob.id;
        // re-pull details and results while running
        const st = (selectedJob.status || "").toLowerCase();
        if (st === "queued" || st === "running") {
          fetchDetails(id);
          fetchResults(id);
          fetchAggregate(id);
        }
      }
    }, 15000);
    return () => clearInterval(int);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedJob?._id]);

  const JobsSkeleton = () => (
    <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm animate-pulse">
      <div className="h-6 w-40 rounded bg-gray-200 mb-3" />
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="h-12 w-full rounded bg-gray-100 mb-2" />
      ))}
    </div>
  );
  const DetailsSkeleton = () => (
    <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm animate-pulse">
      <div className="h-6 w-32 rounded bg-gray-200 mb-3" />
      <div className="h-24 w-full rounded bg-gray-100" />
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <DataFlowNav />

      <div className="mx-5 bg-white rounded-lg p-5 my-3">
        {/* Header */}
        <div
          className="px-6 py-8 bg-[#2B245C] rounded-2xl shadow-lg hover:shadow-2xl transition-shadow duration-300 flex items-center justify-between"
          data-tour="jobs-header"
        >
          <div>
            <h1 className="text-3xl font-bold text-cyan-50">DataFlow Jobs</h1>
            <p className="mt-1 text-sm text-white">
              Launch scans, download the exact config used, ingest CSV outputs,
              and review findings.
            </p>
          </div>

          <div>
            <GuideButton
              onClick={() => setTourOpen(true)}
              variant="primary"
              size="md"
              className="!from-blue-500 !to-blue-600 hover:!from-blue-400 hover:!to-blue-500 !text-white !border-blue-400/70 !shadow-blue-600/30"
            >
              Help
            </GuideButton>
          </div>
        </div>

        <div className="py-5 space-y-5">
          {/* Create job */}
          {/* <section className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
          <div className="mb-2 text-sm font-medium text-gray-800">Create new job</div>
          <div className="grid gap-3 md:grid-cols-3">
            <input
              type="text"
              placeholder="Job name (optional)"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100"
            />
            <div className="md:col-span-2">
              <textarea
                className="h-32 w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-mono"
                value={connectorsText}
                onChange={(e) => setConnectorsText(e.target.value)}
              />
              <div className="mt-1 text-xs text-gray-500">
                Paste connectors JSON array. Each connector can keep custom fields; set <code>run</code> true/false.
              </div>
            </div>
          </div>
          <div className="mt-3 flex items-center gap-3">
            <button
              onClick={startJob}
              disabled={creating}
              className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
            >
              {creating ? (
                <span className="inline-flex items-center">
                  <span className="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/60 border-t-white" />
                  Creating…
                </span>
              ) : 'Start Job'}
            </button>

            <button
              onClick={fetchJobs}
              className="inline-flex items-center rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
            >
              {loadingJobs ? (
                <>
                  <span className="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-indigo-600" />
                  Refreshing…
                </>
              ) : 'Refresh List'}
            </button>

            <ConnectorHelperModal/>

            {error && (
              <div className="ml-auto rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {error}
              </div>
            )}
          </div>
        </section> */}

          {/* Filters row */}
          <div
            className="flex flex-wrap items-center gap-2 rounded-2xl border border-[#2B245C] bg-white p-5 shadow-lg hover:shadow-2xl transition-shadow duration-300"
            data-tour="jobs-filters"
          >
            <select
              className="rounded-lg border border-gray-500 bg-white px-4 py-2 text-sm text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 ease-in-out"
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setPage(1);
              }}
            >
              <option value="">All statuses</option>
              <option value="queued">Queued</option>
              <option value="running">Running</option>
              <option value="success">Success</option>
              <option value="failed">Failed</option>
              <option value="canceled">Canceled</option>
            </select>

            <select
              className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm"
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setPage(1);
              }}
            >
              {[10, 20, 50, 100].map((n) => (
                <option key={n} value={n}>
                  {n}/page
                </option>
              ))}
            </select>

            <div className="ml-auto flex items-center gap-2 text-sm text-gray-700">
              <span>{pageMeta.total} total</span>
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="rounded-lg bg-[#2B245C] text-white px-4 py-2 text-sm font-semibold shadow-md hover:shadow-lg hover:bg-opacity-90 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-200 ease-in-out"
              >
                Prev
              </button>
              <span className="font-semibold text-[#2B245C]">Page {page}</span>
              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={!pageMeta.hasMore}
                className="rounded-lg bg-[#2B245C] text-white px-4 py-2 text-sm font-semibold shadow-md hover:shadow-lg hover:bg-opacity-90 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-200 ease-in-out"
              >
                Next
              </button>
            </div>
          </div>

          {/* Main grid */}
          <div className="grid gap-6 lg:grid-cols-1">
            {/* Jobs list */}
            <section
              className="space-y-3 rounded-2xl border border-[#2B245C] bg-white p-6 shadow-lg hover:shadow-2xl transition-shadow duration-300"
              data-tour="jobs-table-section"
            >
              <div className="mb-3 flex items-center justify-between">
                <div className="mb-3">
                  <h2 className="text-2xl font-semibold text-[#2B245C]">
                    Jobs
                  </h2>
                  <p className="text-xs text-gray-500 mt-2">
                    Click any row for more details.
                  </p>
                </div>
                <span className="text-sm text-gray-600">
                  {jobs.length} total
                </span>
              </div>

              {loadingJobs ? (
                <JobsSkeleton />
              ) : (
                <div
                  className="overflow-x-auto rounded-lg border border-gray-800"
                  data-tour="jobs-table"
                >
                  <table className="min-w-full text-sm">
                    <thead className="bg-[#2B245C] text-left text-white border-b border-gray-800">
                      <tr>
                        <th className="px-4 py-2 font-medium">Name</th>
                        <th className="px-4 py-2 font-medium">Status</th>
                        <th className="px-4 py-2 font-medium whitespace-nowrap">
                          Started
                        </th>
                        <th className="px-4 py-2 font-medium whitespace-nowrap">
                          Finished
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {!canView ? (
                        <tr>
                          <td
                            colSpan={4}
                            className="px-6 py-10 text-center text-red-600 font-medium"
                          >
                            You don’t have permission to view jobs.
                          </td>
                        </tr>
                      ) : jobs.length === 0 ? (
                        <tr>
                          <td
                            colSpan={4}
                            className="px-4 py-6 text-center text-gray-600"
                          >
                            No jobs found.
                          </td>
                        </tr>
                      ) : (
                        jobs.map((job) => {
                          const key = job._id || job.id;
                          const statusLabel = (job.status || "").replace(
                            /_/g,
                            " ",
                          );
                          return (
                            <tr
                              key={key}
                              className={`cursor-pointer hover:bg-gray-50 ${selectedJob && (selectedJob._id || selectedJob.id) === key ? "bg-indigo-50/40" : ""}`}
                              onClick={() =>
                                guard(canView, router, () => {
                                  if (key) {
                                    router.push(`/admin/dataFlow/jobs/${key}`);
                                  } else {
                                    selectJob(job);
                                  }
                                })
                              }
                              title="Click any row for more details"
                            >
                              <td className="px-4 py-2">{job.name || "—"}</td>
                              <td className="px-4 py-2">
                                <span
                                  className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs ${statusTone(job.status)}`}
                                >
                                  {statusLabel}
                                </span>
                              </td>
                              <td
                                className="px-4 py-2 whitespace-nowrap"
                                title={
                                  job.startedAt
                                    ? new Date(job.startedAt).toLocaleString()
                                    : ""
                                }
                              >
                                {job.startedAt ? timeAgo(job.startedAt) : "—"}
                              </td>
                              <td
                                className="px-4 py-2 whitespace-nowrap"
                                title={
                                  job.finishedAt
                                    ? new Date(job.finishedAt).toLocaleString()
                                    : ""
                                }
                              >
                                {job.finishedAt ? timeAgo(job.finishedAt) : "—"}
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </div>

          {/* Right column */}
          {/* <section className="space-y-4"> */}
          {/* Details */}
          {/* <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
                <div className="mb-3 flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900">
                    Job Details
                  </h2>
                  {selectedJob && (
                    <span
                      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs ${statusTone(selectedJob.status)}`}
                    >
                      {(selectedJob.status || "").replace(/_/g, " ")}
                    </span>
                  )}
                  {selectedJob && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={rerunJob}
                        disabled={acting}
                        className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        {acting ? "Working…" : "Re-run"}
                      </button>
                      <button
                        onClick={cancelJob}
                        disabled={
                          acting ||
                          (selectedJob.status || "").toLowerCase() !== "queued"
                        }
                        className="rounded-lg border border-red-200 bg-white px-3 py-1.5 text-sm text-red-700 hover:bg-red-50 disabled:opacity-60"
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </div>
                {!selectedJob ? (
                  <div className="text-sm text-gray-600">
                    Select a job to view details.
                  </div>
                ) : loadingDetails ? (
                  <DetailsSkeleton />
                ) : jobDetails ? (
                  <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 text-xs text-gray-800 overflow-auto max-h-72">
                    <pre>{JSON.stringify(jobDetails, null, 2)}</pre>
                  </div>
                ) : (
                  <div className="text-sm text-gray-600">No details.</div>
                )}
              </div> */}

          {/* Config */}
          {/* <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-base font-semibold text-gray-900">
                    Job Config
                  </h3>
                  <div className="flex gap-2">
                    <button
                      onClick={() =>
                        selectedJob &&
                        fetchConfig(selectedJob._id || selectedJob.id)
                      }
                      className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      {loadingConfig ? "Loading…" : "Reload"}
                    </button>
                    {configObj && (
                      <>
                        <button
                          onClick={() => downloadJson(configObj, "config.json")}
                          className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50"
                        >
                          Download
                        </button>
                        <button
                          onClick={() => copyJson(configObj)}
                          className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50"
                        >
                          Copy
                        </button>
                      </>
                    )}
                  </div>
                </div>
                {!selectedJob ? (
                  <div className="text-sm text-gray-600">
                    Select a job to view config.
                  </div>
                ) : configObj ? (
                  <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 text-xs text-gray-800 overflow-auto max-h-72">
                    <pre>{JSON.stringify(configObj, null, 2)}</pre>
                  </div>
                ) : (
                  <div className="text-sm text-gray-600">No config loaded.</div>
                )}
              </div> */}

          {/* Ingest CSV */}
          {/* <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
                <h3 className="mb-2 text-base font-semibold text-gray-900">
                  Ingest CSV
                </h3>
                {!selectedJob ? (
                  <div className="text-sm text-gray-600">
                    Select a job first.
                  </div>
                ) : (
                  <>
                    <div className="mb-2 text-xs text-gray-600">
                      Paste your scanner CSV output or upload a .csv file.
                      Expected headers (case-insensitive):
                      <code>
                        {" "}
                        File Path, Source, Tag/Line, Type, Matched Text,
                        Frameworks, Severity, Weight
                      </code>
                    </div>
                    <div className="flex items-center gap-3 mb-2">
                      <input
                        type="file"
                        accept=".csv,text/csv"
                        onChange={(e) => onCsvFile(e.target.files?.[0])}
                        className="text-sm"
                      />
                      <button
                        onClick={ingestCsv}
                        disabled={ingesting || !csvText.trim()}
                        className="rounded-lg bg-emerald-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
                      >
                        {ingesting ? "Ingesting…" : "Ingest CSV"}
                      </button>
                    </div>
                    <textarea
                      className="h-32 w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-mono"
                      value={csvText}
                      onChange={(e) => setCsvText(e.target.value)}
                      placeholder={`File Path,Source,Tag/Line,Type,Matched Text,Frameworks,Severity,Weight
C:\\\\file.txt,CONTENT,12,Email,user@example.com,GDPR,Medium,2`}
                    />
                  </>
                )}
              </div> */}

          {/* Results */}
          {/* <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
                <h3 className="mb-3 text-base font-semibold text-gray-900">
                  Findings
                </h3>
                {!selectedJob ? (
                  <div className="text-sm text-gray-600">
                    Select a job to see results.
                  </div>
                ) : loadingResults ? (
                  <div className="animate-nonespace-y-2">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div key={i} className="h-6 w-full rounded bg-gray-100" />
                    ))}
                  </div>
                ) : results.length > 0 ? (
                  <div className="overflow-auto max-h-64 rounded-lg border border-gray-200">
                    <table className="min-w-full text-xs">
                      <thead className="bg-gray-50 text-left text-gray-700">
                        <tr>
                          <th className="px-3 py-2 font-medium">Path</th>
                          <th className="px-3 py-2 font-medium">Source</th>
                          <th className="px-3 py-2 font-medium">Tag</th>
                          <th className="px-3 py-2 font-medium">Type</th>
                          <th className="px-3 py-2 font-medium">Matched</th>
                          <th className="px-3 py-2 font-medium">Frameworks</th>
                          <th className="px-3 py-2 font-medium">Severity</th>
                          <th className="px-3 py-2 font-medium">Weight</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {results.map((r, i) => (
                          <tr key={r._id || i}>
                            <td className="px-3 py-1.5">{r.path}</td>
                            <td className="px-3 py-1.5">{r.source}</td>
                            <td className="px-3 py-1.5">{r.tag}</td>
                            <td className="px-3 py-1.5">{r.dtype}</td>
                            <td className="px-3 py-1.5">{r.matchedText}</td>
                            <td className="px-3 py-1.5">
                              {(r.frameworks || []).join("; ")}
                            </td>
                            <td className="px-3 py-1.5">{r.severity}</td>
                            <td className="px-3 py-1.5">{r.weight}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-sm text-gray-600">No findings.</div>
                )}
              </div> */}

          {/* Aggregate */}
          {/* <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
                <h3 className="mb-3 text-base font-semibold text-gray-900">
                  Type Summary
                </h3>
                {!selectedJob ? (
                  <div className="text-sm text-gray-600">
                    Select a job to see aggregates.
                  </div>
                ) : loadingAggregate ? (
                  <div className="animate-nonespace-y-2">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <div key={i} className="h-5 w-2/3 rounded bg-gray-100" />
                    ))}
                  </div>
                ) : aggregate.length > 0 ? (
                  <ul className="list-disc pl-5 text-sm text-gray-800">
                    {aggregate.map((a) => (
                      <li key={a.category}>
                        <span className="font-medium">
                          {a.category || "Unknown"}:
                        </span>{" "}
                        {a.count}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="text-sm text-gray-600">
                    No aggregate data.
                  </div>
                )}
              </div>
            </section> */}
          {/* </div> */}
        </div>
      </div>
      <Tour steps={steps} open={tourOpen} onClose={() => setTourOpen(false)} />
    </div>
  );
}
