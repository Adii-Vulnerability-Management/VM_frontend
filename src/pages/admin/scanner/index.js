// pages/admin/scanner/jobs/index.jsx
import React, { useState, useEffect, useMemo } from "react";
import CustomAxios from "@/globalcomponents/CustomAxios";
import { baseurl, initURL } from "../../../../BaseUrl";
import { useRouter } from "next/router";
import { BiArrowBack } from "react-icons/bi";

export default function ScannerPage() {
  const router = useRouter();

  // --- State ---
  const [jobs, setJobs] = useState([]);
  const [domain, setDomain] = useState("");
  const [loadingJobs, setLoadingJobs] = useState(false);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState(""); // UI "Filter by domain" text box

  const [selectedJob, setSelectedJob] = useState(null);
  const [jobDetails, setJobDetails] = useState(null);
  const [results, setResults] = useState([]);
  const [aggregate, setAggregate] = useState([]);

  // granular loading for right pane
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [loadingResults, setLoadingResults] = useState(false);
  const [loadingAggregate, setLoadingAggregate] = useState(false);

  const [creating, setCreating] = useState(false);

  // URL query-derived filters
  const [urlDomain, setUrlDomain] = useState(""); // ?domain=...
  const [urlWid, setUrlWid] = useState(""); // ?wid=...

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1,
    hasNextPage: false,
    hasPreviousPage: false,
  });

  // Base path for all scanner APIs
  const scannerBase = `${baseurl}/${initURL}/scanner/jobs`;

  // helpers
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
    const s = status.toLowerCase();
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

  // --- API calls ---
  const fetchJobs = async () => {
    try {
      setLoadingJobs(true);

      const domainParam = urlDomain || filter;

      const res = await CustomAxios.get(scannerBase, {
        params: {
          page: currentPage,
          limit: rowsPerPage,
          ...(domainParam ? { domain: domainParam } : {}),
          ...(urlWid ? { website: urlWid } : {}),
        },
      });

      const payload = res.data?.jobs || res.data;
      const data = Array.isArray(payload) ? payload : payload?.data || [];
      const paginationData = Array.isArray(payload)
        ? res.data?.pagination
        : payload?.pagination || res.data?.pagination;

      setJobs(data);

      if (paginationData) {
        setPagination({
          total: paginationData.total || 0,
          page: paginationData.page || currentPage,
          limit: paginationData.limit || rowsPerPage,
          totalPages: Math.max(1, paginationData.totalPages || 1),
          hasNextPage: !!paginationData.hasNextPage,
          hasPreviousPage: !!paginationData.hasPreviousPage,
        });
      } else {
        setPagination({
          total: data.length,
          page: currentPage,
          limit: rowsPerPage,
          totalPages: Math.max(1, Math.ceil(data.length / rowsPerPage)),
          hasNextPage: false,
          hasPreviousPage: currentPage > 1,
        });
      }

      setError("");
    } catch (err) {
      console.error("Fetch jobs error:", err?.response || err?.message || err);
      setError("Failed to fetch jobs.");
    } finally {
      setLoadingJobs(false);
    }
  };

  const startScan = async () => {
    const domainToScan = (domain || urlDomain || "").trim();
    if (!domainToScan) return;
    setCreating(true);
    setError("");
    try {
      const payload = { domain: domainToScan };
      const res = await CustomAxios.post(scannerBase, payload);
      if (res.status < 200 || res.status >= 300) {
        throw new Error(`Server responded ${res.status}`);
      }
      setDomain("");
      await fetchJobs();
    } catch (err) {
      console.error("Start scan error:", err?.response || err?.message || err);
      setError("Failed to start scan.");
    } finally {
      setCreating(false);
    }
  };

  const fetchJobDetails = async (jobId) => {
    setLoadingDetails(true);
    try {
      const res = await CustomAxios.get(`${scannerBase}/${jobId}`);
      setJobDetails(res.data);
    } catch (err) {
      console.error("Fetch job details error:", err);
      setJobDetails(null);
    } finally {
      setLoadingDetails(false);
    }
  };

  const fetchResults = async (jobId) => {
    setLoadingResults(true);
    try {
      const res = await CustomAxios.get(`${scannerBase}/${jobId}/results`);
      setResults(res.data || []);
    } catch (err) {
      console.error("Fetch results error:", err);
      setResults([]);
    } finally {
      setLoadingResults(false);
    }
  };

  const fetchAggregate = async (jobId) => {
    setLoadingAggregate(true);
    try {
      const res = await CustomAxios.get(
        `${scannerBase}/${jobId}/aggregate/categories`,
      );
      setAggregate(res.data || []);
    } catch (err) {
      console.error("Fetch aggregate error:", err);
      setAggregate([]);
    } finally {
      setLoadingAggregate(false);
    }
  };

  const selectJob = (job) => {
    const id = job._id || job.id;
    setSelectedJob(job);
    setJobDetails(null);
    setResults([]);
    setAggregate([]);
    fetchJobDetails(id);
    fetchResults(id);
    fetchAggregate(id);
  };

  // Initial load + polling
  useEffect(() => {
    fetchJobs();
    const interval = setInterval(fetchJobs, 30000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, rowsPerPage, filter, urlDomain, urlWid]);

  // Read query params once the router is ready
  useEffect(() => {
    if (!router.isReady) return;
    const qDomain =
      typeof router.query.domain === "string" ? router.query.domain : "";
    const qWid = typeof router.query.wid === "string" ? router.query.wid : "";
    setUrlDomain(qDomain);
    setUrlWid(qWid);

    // Prefill the filter box with ?domain so users can see/edit it
    if (qDomain) setFilter(qDomain);
  }, [router.isReady, router.query.domain, router.query.wid]);

  // Derived filtering:
  // - If urlDomain exists, enforce domain contains urlDomain (case-insensitive)
  // - If urlWid exists, enforce job wid/websiteId match
  // - Also apply the user-entered filter box (filter by domain contains)
  const displayedJobs = useMemo(() => {
    return jobs.filter((j) => {
      const dom = (j.domain || "").toLowerCase();
      // Try to resolve possible id fields for "wid"
      const jobWid = (
        j.websiteId ||
        j.wid ||
        j.siteId ||
        j.projectId ||
        j.website ||
        j.site ||
        ""
      ).toString();

      const matchesUrlDomain = urlDomain
        ? dom.includes(urlDomain.toLowerCase())
        : true;
      const matchesUrlWid = urlWid
        ? jobWid.toString() === urlWid.toString()
        : true;
      const matchesFreeText = filter
        ? dom.includes(filter.toLowerCase())
        : true;

      return matchesUrlDomain && matchesUrlWid && matchesFreeText;
    });
  }, [jobs, urlDomain, urlWid, filter]);

  // Pagination

  useEffect(() => {
    setCurrentPage(1);
  }, [filter, urlDomain, urlWid]);

  const totalPages = Math.max(1, pagination.totalPages);

  const paginatedJobs = displayedJobs;

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  /* ------------------------------ Skeletons ------------------------------ */
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
      <div className="mx-5 bg-white rounded-lg p-5 my-3">
        {/* Header */}
        <div className="px-6 py-8 bg-[#2B245C] rounded-2xl shadow-lg hover:shadow-2xl transition-shadow duration-300 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-cyan-50">
              Cookie Scanner Dashboard
            </h1>
            <p className="mt-1 text-sm text-white">
              Create scan jobs, monitor status, and review results.
            </p>
          </div>

          <button
            onClick={() => router.back()}
            title="Back"
            className="inline-flex items-center gap-2 rounded-lg bg-white px-5 py-3 text-center text-sm font-semibold text-[#2B245C] transition hover:bg-gray-100"
          >
            <BiArrowBack size={18} />
            Back
          </button>
        </div>

        {/* Body */}
        <div className="py-5 space-y-5">
          {/* Controls */}
          <section className="rounded-2xl border border-[#2B245C] bg-white p-6 shadow-lg hover:shadow-2xl transition-shadow duration-300">
            <div className="flex flex-wrap items-center gap-3">
              {/* Start scan */}
              <div className="flex flex-1 items-stretch overflow-hidden rounded-xl border border-gray-200 bg-white focus-within:ring-2 focus-within:ring-indigo-100">
                <input
                  type="text"
                  placeholder={`Enter domain to scan${urlDomain ? ` (default: ${urlDomain})` : ""}`}
                  value={domain}
                  onChange={(e) => setDomain(e.target.value)}
                  className="flex-1 px-3 py-2 text-gray-900 placeholder:text-gray-400 focus:outline-none"
                />
                <button
                  onClick={startScan}
                  disabled={creating || !(domain.trim() || urlDomain.trim())}
                  className="rounded-none rounded-r-xl bg-[#2B245C] px-4 py-2 text-sm font-semibold text-white hover:bg-opacity-90 disabled:opacity-60"
                >
                  {creating ? (
                    <span className="inline-flex items-center">
                      <span className="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/60 border-t-white" />
                      Scanning…
                    </span>
                  ) : (
                    "Start Scan"
                  )}
                </button>
              </div>

              {/* Refresh */}
              <button
                onClick={fetchJobs}
                className="inline-flex items-center gap-2 rounded-lg border border-[#2B245C] bg-white px-4 py-2 text-sm font-medium text-[#2B245C] hover:bg-indigo-50 transition-all"
              >
                {loadingJobs ? (
                  <>
                    <span className="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-indigo-600" />
                    Refreshing…
                  </>
                ) : (
                  "Refresh List"
                )}
              </button>

              {/* Filter */}
              <div className="ml-auto">
                <input
                  type="text"
                  placeholder="Filter by domain"
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="w-56 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                />
              </div>
            </div>

            {/* Show active URL filters */}
            {(urlDomain || urlWid) && (
              <div className="mt-3 flex flex-wrap items-center gap-2">
                {urlDomain && (
                  <span className="inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs text-indigo-700">
                    URL filter: domain={urlDomain}
                  </span>
                )}
                {urlWid && (
                  <span className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs text-amber-700">
                    URL filter: wid={urlWid}
                  </span>
                )}
                <button
                  onClick={() => {
                    setUrlDomain("");
                    setUrlWid("");
                    setFilter("");
                  }}
                  className="ml-1 rounded-lg border border-[#2B245C] bg-white px-2 py-1 text-xs text-[#2B245C] hover:bg-blue-50"
                >
                  Clear filters
                </button>
              </div>
            )}

            {error && (
              <div className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {error}
              </div>
            )}
          </section>

          {/* Main grid */}
          <div className="grid items-start gap-6 lg:grid-cols-3">
            {/* Jobs list */}
            <section className="lg:col-span-2 space-y-3 rounded-2xl border border-[#2B245C] bg-white p-6 shadow-lg hover:shadow-2xl transition-shadow duration-300">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-2xl font-semibold text-[#2B245C]">Jobs</h2>
                <span className="text-sm text-gray-600">
                  {pagination.total} total
                </span>
              </div>

              {loadingJobs ? (
                <JobsSkeleton />
              ) : (
                <div className="overflow-x-auto rounded-lg border border-gray-800">
                  <table className="min-w-full text-sm">
                    <thead className="bg-[#2B245C] text-left text-white border-b border-gray-800">
                      <tr>
                        <th className="px-4 py-2 font-medium">Domain</th>
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
                      {displayedJobs.length === 0 ? (
                        <tr>
                          <td
                            colSpan={4}
                            className="px-4 py-6 text-center text-gray-600"
                          >
                            No jobs found.
                          </td>
                        </tr>
                      ) : (
                        paginatedJobs.map((job) => {
                          const key = job._id || job.id;
                          const statusLabel = (job.status || "").replace(
                            /_/g,
                            " ",
                          );
                          return (
                            <tr
                              key={key}
                              className={`cursor-pointer hover:bg-gray-50 ${selectedJob && (selectedJob._id || selectedJob.id) === key ? "bg-indigo-50/40" : ""}`}
                              onClick={() => selectJob(job)}
                            >
                              <td className="px-4 py-2">{job.domain}</td>
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

              {pagination.total > 0 && (
                <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-3">
                    <p className="text-sm text-gray-600">
                      Showing {(currentPage - 1) * rowsPerPage + 1} to{" "}
                      {Math.min(currentPage * rowsPerPage, pagination.total)} of{" "}
                      {pagination.total} jobs
                    </p>

                    <select
                      value={rowsPerPage}
                      onChange={(e) => {
                        setRowsPerPage(Number(e.target.value));
                        setCurrentPage(1);
                      }}
                      className="rounded-lg border border-gray-300 px-2 py-1 text-sm"
                    >
                      {[5, 10, 20, 50].map((size) => (
                        <option key={size} value={size}>
                          {size}/page
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() =>
                        setCurrentPage((prev) => Math.max(prev - 1, 1))
                      }
                      disabled={!pagination.hasPreviousPage}
                      className="rounded-lg bg-[#2B245C] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
                    >
                      Prev
                    </button>

                    <span className="text-sm text-gray-700">
                      Page {currentPage} of {totalPages}
                    </span>

                    <button
                      onClick={() =>
                        setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                      }
                      disabled={!pagination.hasNextPage}
                      className="rounded-lg bg-[#2B245C] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </section>

            {/* Right pane: details/results/aggregate */}
            <section className="space-y-4">
              {/* Job details */}
              <div className="rounded-2xl border border-[#2B245C] bg-white p-5 shadow-lg hover:shadow-2xl transition-shadow duration-300">
                <div className="mb-3 flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-[#2B245C]">
                    Job Details
                  </h2>
                  {selectedJob && (
                    <span
                      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs ${statusTone(selectedJob.status)}`}
                    >
                      {(selectedJob.status || "").replace(/_/g, " ")}
                    </span>
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
                  <div className="text-sm text-gray-600">
                    No details available.
                  </div>
                )}
              </div>

              {/* Results */}
              <div className="rounded-2xl border border-[#2B245C] bg-white p-5 shadow-lg hover:shadow-2xl transition-shadow duration-300">
                <h3 className="mb-3 text-xl font-semibold text-[#2B245C]">
                  Cookie Records
                </h3>
                {!selectedJob ? (
                  <div className="text-sm text-gray-600">
                    Select a job to see results.
                  </div>
                ) : loadingResults ? (
                  <div className="animate-pulse space-y-2">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div key={i} className="h-6 w-full rounded bg-gray-100" />
                    ))}
                  </div>
                ) : results.length > 0 ? (
                  <div className="overflow-auto max-h-64 rounded-lg border border-gray-200">
                    <table className="min-w-full text-xs">
                      <thead className="bg-gray-50 text-left text-gray-700 border-b border-gray-200">
                        <tr>
                          <th className="px-3 py-2 font-medium">Name</th>
                          <th className="px-3 py-2 font-medium">Domain</th>
                          <th className="px-3 py-2 font-medium">Vendor</th>
                          <th className="px-3 py-2 font-medium">Category</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {results.map((r) => (
                          <tr key={r._id || `${r.name}-${r.domain}`}>
                            <td className="px-3 py-1.5">{r.name}</td>
                            <td className="px-3 py-1.5">{r.domain}</td>
                            <td className="px-3 py-1.5">
                              {r.vendor?.name || "—"}
                            </td>
                            <td className="px-3 py-1.5 capitalize">
                              {r.category || "uncategorized"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-sm text-gray-600">
                    No cookie records found.
                  </div>
                )}
              </div>

              {/* Aggregate */}
              <div className="rounded-2xl border border-[#2B245C] bg-white p-5 shadow-lg hover:shadow-2xl transition-shadow duration-300">
                <h3 className="mb-3 text-xl font-semibold text-[#2B245C]">
                  Category Summary
                </h3>
                {!selectedJob ? (
                  <div className="text-sm text-gray-600">
                    Select a job to see aggregates.
                  </div>
                ) : loadingAggregate ? (
                  <div className="animate-pulse space-y-2">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <div key={i} className="h-5 w-2/3 rounded bg-gray-100" />
                    ))}
                  </div>
                ) : aggregate.length > 0 ? (
                  <ul className="list-disc pl-5 text-sm text-gray-800">
                    {aggregate.map((a) => (
                      <li key={a.category}>
                        <span className="font-medium">{a.category}:</span>{" "}
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
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
