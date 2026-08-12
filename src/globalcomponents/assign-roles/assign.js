import { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import CustomAxios from "@/globalcomponents/CustomAxios";
import { initURL } from "../../../BaseUrl";
import { getPermissionsFromAccessEntries } from "@/auth/accessModules";

const ACTION_OPTIONS = [
  "ASSIGN_ROLE",
  "UPDATE_ROLE",
  "REMOVE_ROLE",
  "ASSIGN_ACCESS",
  "REVOKE_ACCESS",
  "LOGIN",
  "PASSWORD_CHANGE",
  "TEMP_PASSWORD",
  "EMAIL_SENT",
];

const INITIAL_FILTERS = {
  email: "",
  user_id: "",
  action: "",
  from: "",
  to: "",
  page: 1,
  limit: 20,
};

const formatModuleEntry = (entry) => {
  if (!entry) return "";
  if (typeof entry === "string") return entry;

  const moduleKey =
    entry.moduleKey || entry.key || entry.module || entry.moduleName || "Module";
  const subModules = Array.isArray(entry.subModules)
    ? entry.subModules
    : Array.isArray(entry.submodules)
      ? entry.submodules
      : [];

  return subModules.length > 0
    ? `${moduleKey} (${subModules.join(", ")})`
    : moduleKey;
};

const formatModulesList = (modules) => {
  if (!Array.isArray(modules) || modules.length === 0) return "-";
  const labels = modules.map(formatModuleEntry).filter(Boolean);
  return labels.length ? labels.join(", ") : "-";
};

const formatDate = (date) => {
  if (!date) return "—";

  return new Date(date).toLocaleString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

const Roles = () => {
  const [filters, setFilters] = useState(INITIAL_FILTERS);
  const [logs, setLogs] = useState([]);
  const [serverTotal, setServerTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [lastUpdatedAt, setLastUpdatedAt] = useState(null);
  const [selectedLogs, setSelectedLogs] = useState([]);
  const [actionLoading, setActionLoading] = useState(false);
  const [summary, setSummary] = useState(null);
  const [summaryOpen, setSummaryOpen] = useState(false);
  const rowsPerPage = Number(filters.limit) || INITIAL_FILTERS.limit;
  const total = logs.length;

  const totalPages = useMemo(() => {
    if (!total || !rowsPerPage) return 1;
    return Math.max(1, Math.ceil(total / rowsPerPage));
  }, [total, rowsPerPage]);

  const paginatedLogs = useMemo(() => {
    const start = (filters.page - 1) * rowsPerPage;
    return logs.slice(start, start + rowsPerPage);
  }, [logs, filters.page, rowsPerPage]);

  const fetchLogs = async (activeFilters = filters) => {
    setLoading(true);
    setError("");
    try {
      const params = {};
      if (activeFilters.email) params.email = activeFilters.email;
      if (activeFilters.user_id) params.user_id = activeFilters.user_id;
      if (activeFilters.action) params.action = activeFilters.action;
      if (activeFilters.from) params.from = activeFilters.from;
      if (activeFilters.to) params.to = activeFilters.to;
      params.page = 1;
      params.limit = 1000;

      const res = await CustomAxios.get(`/${initURL}/access/logs`, { params });
      const payload = res.data || {};
      setLogs(Array.isArray(payload.data) ? payload.data : []);
      setServerTotal(Number(payload.total || 0));
      setLastUpdatedAt(new Date());
    } catch (err) {
      setError(
        err?.response?.data?.message || err?.message || "Failed to load logs",
      );
      setLogs([]);
      setServerTotal(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  useEffect(() => {
    setSelectedLogs([]);
  }, [logs, filters.page, rowsPerPage]);

  useEffect(() => {
    setFilters((prev) => ({
      ...prev,
      page: Math.min(prev.page, totalPages),
    }));
  }, [totalPages]);

  useEffect(() => {
    const handler = () => fetchLogs();
    window.addEventListener("accessLogsRefresh", handler);
    return () => window.removeEventListener("accessLogsRefresh", handler);
  }, []);

  const requireSelection = () => {
    if (!selectedLogs.length) {
      toast.error("Select a log row first");
      return false;
    }
    return true;
  };

  const isAllSelected = logs.length > 0 && selectedLogs.length === logs.length;

  const toggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedLogs([]);
    } else {
      setSelectedLogs(logs.slice());
    }
  };

  const revokeAccess = async () => {
    if (!requireSelection()) return;
    setActionLoading(true);
    try {
      const requests = selectedLogs
        .filter((log) => !!log.userEmail)
        .map((log) =>
          CustomAxios.post(`/${initURL}/access/revoke-access`, {
            email: log.userEmail,
          }),
        );
      await Promise.all(requests);
      toast.success("Access revoked successfully");
      fetchLogs();
    } catch (err) {
      const msg = err.response?.data?.message;
      toast.error(Array.isArray(msg) ? msg[0] : msg || "Revoke access failed");
    } finally {
      setActionLoading(false);
    }
  };

  const fetchAccessSummary = async () => {
    if (!requireSelection()) return;
    setActionLoading(true);
    try {
      const first = selectedLogs[0];
      const res = await CustomAxios.get(
        `/${initURL}/access/users/access-summary`,
        {
          params: { email: first.userEmail },
        },
      );
      setSummary(res.data || null);
      setSummaryOpen(true);
    } catch (err) {
      const msg = err.response?.data?.message;
      toast.error(Array.isArray(msg) ? msg[0] : msg || "Load summary failed");
      setSummary(null);
    } finally {
      setActionLoading(false);
    }
  };

  const deleteLogById = async (id) => {
    if (!id) return;
    const ok = window.confirm("Delete this log entry?");
    if (!ok) return;
    setActionLoading(true);
    try {
      await CustomAxios.delete(`/${initURL}/access/logs/${id}`);
      toast.success("Log deleted");
      fetchLogs();
      setSelectedLogs((prev) => prev.filter((l) => (l._id || l.id) !== id));
    } catch (err) {
      const msg = err.response?.data?.message;
      toast.error(Array.isArray(msg) ? msg[0] : msg || "Delete failed");
    } finally {
      setActionLoading(false);
    }
  };

  const deleteSelectedLogs = async () => {
    if (!selectedLogs.length) {
      toast.error("Select at least one log");
      return;
    }
    const ok = window.confirm(`Delete ${selectedLogs.length} log(s)?`);
    if (!ok) return;
    setActionLoading(true);
    try {
      const requests = selectedLogs
        .map((l) => l._id || l.id)
        .filter(Boolean)
        .map((id) => CustomAxios.delete(`/${initURL}/access/logs/${id}`));
      await Promise.all(requests);
      toast.success("Logs deleted");
      setSelectedLogs([]);
      fetchLogs();
    } catch (err) {
      const msg = err.response?.data?.message;
      toast.error(Array.isArray(msg) ? msg[0] : msg || "Delete failed");
    } finally {
      setActionLoading(false);
    }
  };

  const resetFilters = () => {
    setFilters(INITIAL_FILTERS);
    setSelectedLogs([]);
    fetchLogs(INITIAL_FILTERS);
  };

  const exportCsv = () => {
    if (!logs.length) return;
    const header = [
      "Date",
      "User",
      "Action",
      "Roles",
      "Modules",
      "By",
      "Login",
      "Updated",
      "Note",
    ];
    const rows = logs.map((l) => [
      l.createdAt || l.updatedAt || l.assignedAt || "",
      l.userEmail || "",
      l.action || "",
      Array.isArray(l.newRoles)
        ? l.newRoles.join(" | ")
        : Array.isArray(l.roles)
          ? l.roles.join(" | ")
          : "",
      Array.isArray(l.newModules)
        ? l.newModules.map(formatModuleEntry).filter(Boolean).join(" | ")
        : Array.isArray(l.modules)
          ? l.modules.map(formatModuleEntry).filter(Boolean).join(" | ")
          : "",
      l.performedBy || "",
      l.lastLoginAt || "",
      l.updatedAt || "",
      l.note || "",
    ]);
    const csv = [header, ...rows]
      .map((row) =>
        row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","),
      )
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "access-logs.csv");
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="py-5 px-2 space-y-5">
      <section className="rounded-2xl border border-[#2B245C] bg-white p-6 shadow-lg hover:shadow-2xl transition-shadow duration-300">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <div>
            <h2 className="text-2xl font-bold text-[#2B245C]">Access Logs</h2>
            <p className="text-sm text-gray-600">
              Track role changes, logins, and access activity.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={fetchLogs}
              className="rounded-lg border border-[#2B245C] px-4 py-2 text-sm font-semibold text-[#2B245C] hover:bg-[#2B245C] hover:text-white transition"
            >
              {loading ? "Refreshing..." : "Refresh"}
            </button>
            <button
              onClick={exportCsv}
              className="rounded-lg bg-[#2B245C] px-4 py-2 text-sm font-semibold text-white hover:bg-opacity-90 transition"
            >
              Export CSV
            </button>
          </div>
        </div>

        <div className="mb-6 flex flex-wrap items-center gap-2">
          <button
            onClick={revokeAccess}
            disabled={actionLoading || !selectedLogs.length}
            title={!selectedLogs.length ? "Please select at least one row" : ""}
            className="h-[38px] rounded-lg border border-blue-600 px-5 text-sm font-semibold text-blue-600 hover:bg-blue-50 transition-all disabled:opacity-50 disabled:hover:bg-transparent"
          >
            Revoke Access
          </button>
          <button
            onClick={fetchAccessSummary}
            disabled={actionLoading || !selectedLogs.length}
            title={!selectedLogs.length ? "Please select at least one row" : ""}
            className="h-[38px] rounded-lg border border-[#2B245C] px-5 text-sm font-semibold text-[#2B245C] hover:bg-blue-50 transition-all disabled:opacity-50 disabled:hover:bg-transparent"
          >
            Access Summary
          </button>
          <button
            onClick={deleteSelectedLogs}
            disabled={actionLoading || !selectedLogs.length}
            title={!selectedLogs.length ? "Please select at least one row" : ""}
            className="h-[38px] rounded-lg border border-rose-600 px-5 text-sm font-semibold text-rose-600 hover:bg-rose-50 transition-all disabled:opacity-50 disabled:hover:bg-transparent"
          >
            Delete Logs
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-3">
          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-gray-700 mb-2">
              User Email
            </label>
            <input
              type="email"
              value={filters.email}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, email: e.target.value }))
              }
              placeholder="user@mail.com"
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-900 focus:border-indigo-500 focus:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-indigo-200 transition-all"
            />
          </div>
          <div className="md:col-span-1">
            <label className="block text-xs font-semibold text-gray-700 mb-2">
              User ID
            </label>
            <input
              type="text"
              value={filters.user_id}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, user_id: e.target.value }))
              }
              placeholder="12"
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-900 focus:border-indigo-500 focus:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-indigo-200 transition-all"
            />
          </div>
          <div className="md:col-span-1">
            <label className="block text-xs font-semibold text-gray-700 mb-2">
              Action
            </label>
            <select
              value={filters.action}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, action: e.target.value }))
              }
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-900 focus:border-indigo-500 focus:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-indigo-200 transition-all"
            >
              <option value="">All</option>
              {ACTION_OPTIONS.map((action) => (
                <option key={action} value={action}>
                  {action}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-2">
              From
            </label>
            <input
              type="date"
              value={filters.from}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, from: e.target.value }))
              }
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-900 focus:border-indigo-500 focus:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-indigo-200 transition-all"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-2">
              To
            </label>
            <input
              type="date"
              value={filters.to}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, to: e.target.value }))
              }
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-900 focus:border-indigo-500 focus:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-indigo-200 transition-all"
            />
          </div>
        </div>

        <div className="w-full flex justify-end gap-2">
          <button
            onClick={() => {
              const nextFilters = { ...filters, page: 1 };
              setFilters(nextFilters);
              fetchLogs(nextFilters);
            }}
            className="rounded-lg bg-[#2B245C] border border-[#2B245C] px-4 py-2 text-sm font-semibold text-white hover:bg-opacity-50 transition"
          >
            Apply Filters
          </button>
          <button
            onClick={resetFilters}
            className="rounded-lg border border-[#2B245C] px-4 py-2 text-sm font-semibold text-[#2B245C] hover:bg-blue-50 transition"
          >
            Clear
          </button>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 mt-5 mb-4">
          <div className="text-sm text-gray-600">
            Total Logs:{" "}
            <span className="font-semibold text-gray-900">
              {Math.max(serverTotal, total)}
            </span>
            {lastUpdatedAt && (
              <span className="ml-3 text-xs text-gray-500">
                Updated {lastUpdatedAt.toLocaleString()}
              </span>
            )}
          </div>

          <div className="ml-auto text-sm text-gray-600">
            Selected Items:{" "}
            <span className="font-semibold text-[#2B245C]">
              {selectedLogs.length}
            </span>
          </div>
        </div>

        {error && (
          <div className="mb-4 rounded-lg border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-800">
            {error}
          </div>
        )}

        <div className="overflow-x-auto rounded-lg border border-gray-800">
          <table className="min-w-full text-sm">
            <thead className="bg-[#2B245C] text-left text-white border-b border-gray-800">
              <tr>
                <th className="px-4 py-3 text-left font-semibold">
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    onChange={toggleSelectAll}
                    className="h-4 w-4 rounded border-gray-300 text-[#2B245C] focus:ring-[#2B245C]"
                  />
                </th>
                <th className="px-4 py-3 text-left font-semibold">Date</th>
                <th className="px-4 py-3 text-left font-semibold">User</th>
                <th className="px-4 py-3 text-left font-semibold">Action</th>
                <th className="px-4 py-3 text-left font-semibold">Roles</th>
                <th className="px-4 py-3 text-left font-semibold">Modules</th>
                <th className="px-4 py-3 text-left font-semibold">Performed by</th>
                {/* <th className="px-4 py-3 text-left font-semibold">Login</th> */}
                <th className="px-4 py-3 text-left font-semibold">Updated</th>
                <th className="px-4 py-3 text-left font-semibold">Delete</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading && (
                <tr>
                  <td
                    colSpan={11}
                    className="px-4 py-10 text-center text-gray-500"
                  >
                    Loading logs...
                  </td>
                </tr>
              )}
              {!loading && logs.length === 0 && (
                <tr>
                  <td
                    colSpan={11}
                    className="px-4 py-10 text-center text-gray-500"
                  >
                    No logs found.
                  </td>
                </tr>
              )}
              {!loading &&
                paginatedLogs.map((log, idx) =>
                  (() => {
                    const isSelected = selectedLogs.includes(log);
                    return (
                      <tr
                        key={`${log.userEmail}-${log.action}-${idx}`}
                        onClick={() =>
                          setSelectedLogs((prev) =>
                            prev.includes(log)
                              ? prev.filter((l) => l !== log)
                              : [...prev, log],
                          )
                        }
                        className={`cursor-pointer ${isSelected ? "bg-blue-50" : ""}`}
                      >
                        <td className="px-4 py-3">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() =>
                              setSelectedLogs((prev) =>
                                prev.includes(log)
                                  ? prev.filter((l) => l !== log)
                                  : [...prev, log],
                              )
                            }
                            className="h-4 w-4 rounded border-gray-300 text-[#2B245C] focus:ring-[#2B245C]"
                            onClick={(e) => e.stopPropagation()}
                          />
                        </td>
                        <td className="px-4 py-3 text-gray-700">
                          {formatDate(log.createdAt || log.updatedAt || log.assignedAt)}
                        </td>
                        <td className="px-4 py-3 text-gray-700">
                          <div className="font-medium">
                            {log.userEmail || "—"}
                          </div>
                          {log.userId && (
                            <div className="text-xs text-gray-500">
                              ID: {log.userId}
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3 text-gray-700">
                          <div className="font-semibold">
                            {log.action || "—"}
                          </div>
                          {log.note && (
                            <div className="text-xs text-gray-500">
                              {log.note}
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3 text-gray-700">
                          {Array.isArray(log.newRoles) && log.newRoles.length
                            ? log.newRoles.join(", ")
                            : Array.isArray(log.roles) && log.roles.length
                              ? log.roles.join(", ")
                              : "—"}
                        </td>
                        <td className="px-4 py-3 text-gray-700">
                          {Array.isArray(log.newModules) &&
                            log.newModules.length
                            ? formatModulesList(log.newModules)
                            : Array.isArray(log.modules) && log.modules.length
                              ? formatModulesList(log.modules)
                              : "—"}
                        </td>
                        <td className="px-4 py-3 text-gray-700">
                          {log.performedBy || "—"}
                        </td>
                        {/* <td className="px-4 py-3 text-gray-700">
                          {formatDate(log.lastLoginAt)}
                        </td> */}
                        <td className="px-4 py-3 text-gray-700">
                          {formatDate(log.updatedAt)}
                        </td>
                        <td className="px-4 py-3 text-gray-700">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteLogById(log._id || log.id);
                            }}
                            className="rounded-md border border-rose-500 px-2.5 py-1 text-xs font-semibold text-rose-600 hover:bg-rose-50"
                            disabled={actionLoading}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    );
                  })(),
                )}
            </tbody>
          </table>
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
          <div className="text-sm text-gray-600">
            Page {filters.page} of {totalPages}
          </div>
          <div className="flex items-center gap-2">
            <div className="text-sm text-gray-600">
              Rows:
            </div>
            <select
              value={filters.limit}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  limit: Number(e.target.value),
                  page: 1,
                }))
              }
              className="rounded-lg border border-gray-300 px-2 py-1.5 text-sm text-gray-700"
            >
              {[10, 20, 50, 100].map((size) => (
                <option key={size} value={size}>
                  {size} / page
                </option>
              ))}
            </select>
            <button
              onClick={() =>
                setFilters((prev) => ({
                  ...prev,
                  page: Math.max(1, prev.page - 1),
                }))
              }
              disabled={filters.page <= 1}
              className="rounded-lg bg-[#2B245C] text-white px-4 py-2 text-sm font-semibold shadow-md hover:shadow-lg hover:bg-opacity-90 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-200 ease-in-out"
            >
              Prev
            </button>
            <button
              onClick={() =>
                setFilters((prev) => ({
                  ...prev,
                  page: Math.min(totalPages, prev.page + 1),
                }))
              }
              disabled={filters.page >= totalPages}
              className="rounded-lg bg-[#2B245C] text-white px-4 py-2 text-sm font-semibold shadow-md hover:shadow-lg hover:bg-opacity-90 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-200 ease-in-out"
            >
              Next
            </button>
          </div>
        </div>
      </section>

      {summaryOpen && summary && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4"
          onClick={() => setSummaryOpen(false)}
        >
          <div
            className="w-full max-w-2xl rounded-2xl bg-white shadow-xl border border-gray-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-5 border-b bg-[#2B245C] text-white rounded-tl-2xl rounded-tr-2xl">
              <div className="text-lg font-bold text-cyan-50">
                Access Summary
                <p className="text-sm text-white">
                  {summary?.user?.email || summary?.email || "-"}
                </p>
              </div>
              <button
                onClick={() => setSummaryOpen(false)}
                className="rounded-lg border px-3 py-1 text-sm font-semibold hover:bg-[#3e3481]"
              >
                ✕
              </button>
            </div>
            <div className="p-5 space-y-4 text-sm">
              {(() => {
                const user = summary?.user || {};
                const access = summary?.access || {};
                const latest = summary?.latestAssignment || {};
                const roles = latest?.roles?.length
                  ? latest.roles
                  : access.roles;
                const modules = latest?.modules?.length
                  ? latest.modules
                  : access.modules;
                const perms = latest?.permissions?.length
                  ? latest.permissions
                  : getPermissionsFromAccessEntries(access.modules);
                //   : access.permissionKeys;
                const assignedAt = latest.assignedAt || access.rolesAssignedAt;
                const updatedAt = latest.updatedAt || access.lastUpdatedAt;
                const updatedBy = latest.updatedBy || access.lastUpdatedBy;
                const assignedBy = latest.assignedBy || "-";
                const lastLoginAt = latest.lastLoginAt || access.lastLoginAt;
                return (
                  <>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <div className="text-xs text-gray-500">User ID</div>
                        <div className="font-semibold">
                          {user.user_id || user._id || "-"}
                        </div>
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 mb-1">Roles</div>
                      <div className="font-semibold">
                        {Array.isArray(roles) && roles.length
                          ? roles.join(", ")
                          : "-"}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 mb-1">Modules</div>
                      <div className="font-semibold">
                        {formatModulesList(modules)}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 mb-1">
                        Permissions
                      </div>
                      <div className="font-semibold">
                        {Array.isArray(perms) && perms.length
                          ? perms.join(", ")
                          : "-"}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <div className="text-xs text-gray-500">Assigned At</div>
                        <div className="font-semibold">{formatDate(assignedAt)}</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500">Updated At</div>
                        <div className="font-semibold">{formatDate(updatedAt)}</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500">Last Login</div>
                        <div className="font-semibold">
                          {formatDate(lastLoginAt)}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500">Updated By</div>
                        <div className="font-semibold">{updatedBy || "-"}</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500">Assigned By</div>
                        <div className="font-semibold">{assignedBy || "-"}</div>
                      </div>
                    </div>
                  </>
                );
              })()}
            </div>
            <div className="flex justify-end p-5 border-t">
              <button
                onClick={() => setSummaryOpen(false)}
                className="rounded-lg bg-[#2B245C] text-white px-4 py-2 text-sm font-semibold hover:bg-opacity-90"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Roles;
