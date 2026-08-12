import { useEffect, useMemo, useState } from "react";
import Cookies from "js-cookie";
import { toast } from "react-toastify";
import CustomAxios from "@/globalcomponents/CustomAxios";
import { initURL } from "../../../BaseUrl";
import { getPermissionsFromAccessEntries } from "@/auth/accessModules";

const SUPER_EMP_URL = `${initURL}/apiv1/users/db`;
const TENANT_EMP_URL = `${initURL}/access/tenants/current/users`;

function getCurrentUser() {
  try {
    const raw = Cookies.get("user_data");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function isPlatformSuper(u) {
  return !!(u?.is_superuser && u?.is_staff && u?.is_active !== false);
}

function pickEmpUrl() {
  return isPlatformSuper(getCurrentUser()) ? SUPER_EMP_URL : TENANT_EMP_URL;
}

const Badge = ({ children, tone = "gray" }) => {
  const tones = {
    green: "bg-green-50 text-green-700 border-green-200",
    red: "bg-red-50 text-red-700 border-red-200",
    yellow: "bg-yellow-50 text-yellow-800 border-yellow-200",
    blue: "bg-blue-50 text-blue-700 border-blue-200",
    gray: "bg-gray-50 text-gray-700 border-gray-200",
    indigo: "bg-indigo-50 text-indigo-700 border-indigo-200",
  };
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${
        tones[tone] || tones.gray
      }`}
    >
      {children}
    </span>
  );
};

const getLatestModuleAssignment = (u) => {
  const modules = Array.isArray(u?.modules) ? u.modules : [];
  if (!modules.length) return null;

  return modules.slice().sort((a, b) => {
    const ad = new Date(
      a?.updatedAt || a?.createdAt || a?.startDate || 0,
    ).getTime();
    const bd = new Date(
      b?.updatedAt || b?.createdAt || b?.startDate || 0,
    ).getTime();
    return bd - ad;
  })[0];
};

const formatDate = (iso) => {
  if (!iso) return "-";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "-";
  return d.toLocaleDateString();
};

const getDisplayName = (u) => {
  // 1) Newer backend shape (your earlier Mongo doc)
  if (u?.user_name) return u.user_name;

  const full = `${u?.first_name || ""} ${u?.last_name || ""}`.trim();
  if (full) return full;

  // 2) Current /${initURL}/apiv1/users shape (your latest response)
  if (u?.name) return u.name;

  return "-";
};

const getStartDate = (u) => getLatestModuleAssignment(u)?.startDate || "-";
const getEndDate = (u) => getLatestModuleAssignment(u)?.endDate || "-";
const getRoles = (u) => (Array.isArray(u?.roles) ? u.roles : []);
const getPermissions = (u) => getPermissionsFromAccessEntries(u?.modules);
// const getPermissions = (u) =>
//   Array.isArray(u?.permissionKeys) ? u.permissionKeys : [];
const getModules = (u) => (Array.isArray(u?.modules) ? u.modules : []);
const getStatus = (u) => {
  const latest = getLatestModuleAssignment(u);
  const start = latest?.startDate ? new Date(latest.startDate) : null;
  const end = latest?.endDate ? new Date(latest.endDate) : null;
  const now = new Date();

  if (start && start.getTime() > now.getTime()) return "PENDING";
  if (end && end.getTime() < now.getTime()) return "EXPIRED";
  return Array.isArray(u?.roles) && u.roles.length > 0 ? "ACTIVE" : "-";
};

const formatModuleEntry = (entry) => {
  if (!entry) return "";
  if (typeof entry === "string") return entry;

  const moduleKey =
    entry.moduleKey ||
    entry.key ||
    entry.module ||
    entry.moduleName ||
    "Module";
  const subModules = Array.isArray(entry.subModules)
    ? entry.subModules
    : Array.isArray(entry.submodules)
      ? entry.submodules
      : [];

  return subModules.length > 0
    ? `${moduleKey} (${subModules.join(", ")})`
    : moduleKey;
};

export default function AssignedUsersDashboardPage() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);

  // Filters
  const [query, setQuery] = useState("");

  // Pagination
  const [page, setPage] = useState(1); // 1-based
  const [pageSize, setPageSize] = useState(10); // rows per page

  // Modal state
  const [selectedUser, setSelectedUser] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = (u) => {
    setSelectedUser(u);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedUser(null);
  };

  // Truncate helper
  const TRUNCATE_PERMS_TO = 3;
  // Will add this limit for module in future
  const TRUNCATE_MODULES_TO = 3;
  const TRUNCATE_ROLES_TO = 2;

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const res = await CustomAxios.get(pickEmpUrl());
      const body = res.data?.body;
      const list =
        (Array.isArray(body?.data) && body.data) ||
        (Array.isArray(res.data?.data) && res.data.data) ||
        (Array.isArray(res.data) && res.data) ||
        [];
      setEmployees(list);
    } catch (e) {
      toast.error(
        e?.response?.data?.message || e?.message || "Failed to fetch users",
      );
      setEmployees([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  // ✅ Only users with roles assigned
  const assignedUsers = useMemo(() => {
    return employees.filter(
      (u) => Array.isArray(u.roles) && u.roles.length > 0,
    );
  }, [employees]);

  // Filters apply on assigned users only
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();

    return assignedUsers.filter((u) => {
      if (!q) return true;

      const name = String(getDisplayName(u) || "").toLowerCase();
      const email = String(u.email || "").toLowerCase();
      const phone = String(u.phone || u.contact_number || "").toLowerCase();

      const roles = getRoles(u)
        .map((r) => String(r).toLowerCase())
        .join(" ");

      const modules = getModules(u)
        .map((m) =>
          String(
            m?.moduleKey || m?.moduleName || m?.key || m?.module || m || "",
          ).toLowerCase(),
        )
        .join(" ");

      return (
        name.includes(q) ||
        email.includes(q) ||
        phone.includes(q) ||
        roles.includes(q) ||
        modules.includes(q)
      );
    });
  }, [assignedUsers, query]);

  // Pagination
  const totalRows = filtered.length;

  const totalPages = useMemo(() => {
    return Math.max(1, Math.ceil(totalRows / pageSize));
  }, [totalRows, pageSize]);

  const paginatedRows = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page, pageSize]);

  useEffect(() => {
    setPage(1);
  }, [query, pageSize]);

  return (
    <div className="py-5 px-2 space-y-5">
      <section className="rounded-2xl border border-[#2B245C] bg-white p-6 shadow-lg">
        <div>
          <h2 className="text-2xl font-bold text-[#2B245C] mb-1">
            Access Overview
          </h2>
          <p className="text-xs text-gray-500">
            Click any row to view its details
          </p>
        </div>

        <div className="pt-5 space-y-6">
          {/* Search and Refresh */}
          <div className="flex justify-between">
            <div className="w-1/3 flex gap-2 items-center">
              <label className="text-xs font-semibold text-gray-700">
                Search
              </label>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by name, email, phone, role, module..."
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
              />
            </div>
            <button
              onClick={fetchEmployees}
              disabled={loading}
              className="rounded-lg bg-blue-50 px-4 py-2 text-sm font-semibold text-[#2B245C] border border-[#2B245C] shadow hover:bg-blue-100 disabled:opacity-60"
            >
              {loading ? "Refreshing..." : "Refresh"}
            </button>
          </div>

          {/* Table */}
          <div className="overflow-auto rounded-lg border border-gray-800">
            <table className="min-w-full text-sm">
              <thead className="bg-[#2B245C] text-left text-white font-medium border-b border-gray-800">
                <tr>
                  <th className="px-4 py-2">User</th>
                  <th className="px-4 py-2 text-center">Role(s)</th>
                  <th className="px-4 py-2 text-center">Module(s)</th>
                  <th className="px-4 py-2 text-center">Permissions</th>
                  <th className="px-4 py-2 text-center">Start Date</th>
                  <th className="px-4 py-2 text-center">End Date</th>
                  <th className="px-4 py-2 text-center">Status</th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td className="px-4 py-4 text-sm text-gray-500" colSpan={5}>
                      Loading assigned users...
                    </td>
                  </tr>
                ) : totalRows === 0 ? (
                  <tr>
                    <td className="px-4 py-4 text-sm text-gray-500" colSpan={5}>
                      No assigned users found.
                    </td>
                  </tr>
                ) : (
                  paginatedRows.map((u) => {
                    const id = u?._id?.$oid || u._id || u.id;

                    const roles = getRoles(u);
                    const finalPermissions = getPermissions(u);
                    const modules = getModules(u);
                    const startDate = getStartDate(u);
                    const endDate = getEndDate(u);
                    const status = getStatus(u);

                    return (
                      <tr
                        key={id}
                        title="Click to view details"
                        onClick={() => openModal(u)}
                        className="border-t text-sm hover:bg-gray-100 odd:bg-gray-50 even:bg-white cursor-pointer"
                      >
                        {/* User */}
                        <td className="px-4 py-2">
                          <div className="font-semibold text-gray-900 mb-1">
                            {getDisplayName(u)}
                          </div>
                          <div className="text-xs text-gray-800">
                            {u.email || "-"}
                          </div>
                        </td>

                        {/* Roles */}
                        <td className="px-4 py-2 text-center">
                          {roles.length ? (
                            <div className="flex flex-wrap justify-center gap-1">
                              {roles.slice(0, TRUNCATE_ROLES_TO).map((r) => (
                                <Badge key={r} tone="blue">
                                  {r}
                                </Badge>
                              ))}

                              {roles.length > TRUNCATE_ROLES_TO && (
                                <Badge tone="gray">
                                  +{roles.length - TRUNCATE_ROLES_TO} more
                                </Badge>
                              )}
                            </div>
                          ) : (
                            "-"
                          )}
                        </td>

                        {/* Modules */}
                        <td className="px-4 py-2 text-center">
                          {modules.length ? (
                            <div className="flex flex-wrap justify-center gap-1">
                              {modules.map((m) => (
                                // <Badge key={formatModuleEntry(m)} tone="green">
                                //   {formatModuleEntry(m)}
                                // </Badge>
                                <Badge
                                  key={m.moduleKey || m.key || m}
                                  tone="green"
                                >
                                  {m.moduleKey || m || m.key || "Module"}
                                </Badge>
                              ))}
                            </div>
                          ) : (
                            "-"
                          )}
                        </td>

                        {/* Permissions */}
                        <td className="px-4 py-2 text-center">
                          {finalPermissions.length ? (
                            <div className="flex flex-wrap justify-center gap-1">
                              {finalPermissions
                                .slice(0, TRUNCATE_PERMS_TO)
                                .map((p) => (
                                  <Badge key={p} tone="indigo">
                                    {p}
                                  </Badge>
                                ))}

                              {finalPermissions.length > TRUNCATE_PERMS_TO && (
                                <Badge tone="gray">
                                  +{finalPermissions.length - TRUNCATE_PERMS_TO}{" "}
                                  more
                                </Badge>
                              )}
                            </div>
                          ) : (
                            "-"
                          )}
                        </td>

                        {/* Start Date */}
                        <td className="px-4 py-2 text-center">
                          {formatDate(startDate)}
                        </td>

                        {/* End Date */}
                        <td className="px-4 py-2 text-center">
                          {formatDate(endDate)}
                        </td>

                        {/* ✅ Status */}
                        <td className="px-4 py-2 text-center">
                          <Badge
                            tone={
                              String(status).toUpperCase() === "APPROVED"
                                ? "green"
                                : String(status).toUpperCase() === "REJECTED"
                                  ? "red"
                                  : String(status).toUpperCase() === "PENDING"
                                    ? "yellow"
                                    : "gray"
                            }
                          >
                            {status || "-"}
                          </Badge>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-xs text-gray-600">
              Page <b>{page}</b> of <b>{totalPages}</b> — Showing{" "}
              <b>{totalRows === 0 ? 0 : (page - 1) * pageSize + 1}</b> to{" "}
              <b>{Math.min(page * pageSize, totalRows)}</b> of{" "}
              <b>{totalRows}</b> users
            </div>

            <div className="flex items-center gap-2">
              <select
                value={pageSize}
                onChange={(e) => setPageSize(Number(e.target.value))}
                className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm"
              >
                {[5, 10, 20, 50, 100].map((n) => (
                  <option key={n} value={n}>
                    {n} / page
                  </option>
                ))}
              </select>

              <button
                onClick={() => setPage(1)}
                disabled={page === 1}
                className="rounded-lg bg-[#2B245C] text-white px-4 py-2 text-sm font-semibold shadow-md hover:shadow-lg hover:bg-opacity-90 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-200 ease-in-out"
              >
                First
              </button>

              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="rounded-lg bg-[#2B245C] text-white px-4 py-2 text-sm font-semibold shadow-md hover:shadow-lg hover:bg-opacity-90 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-200 ease-in-out"
              >
                Prev
              </button>

              <span className="px-2 py-1 bg-gray-100 border border-[#2B245C] rounded-md text-sm font-medium">
                {page}
              </span>

              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="rounded-lg bg-[#2B245C] text-white px-4 py-2 text-sm font-semibold shadow-md hover:shadow-lg hover:bg-opacity-90 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-200 ease-in-out"
              >
                Next
              </button>

              <button
                onClick={() => setPage(totalPages)}
                disabled={page === totalPages}
                className="rounded-lg bg-[#2B245C] text-white px-4 py-2 text-sm font-semibold shadow-md hover:shadow-lg hover:bg-opacity-90 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-200 ease-in-out"
              >
                Last
              </button>
            </div>
          </div>
        </div>

        {isModalOpen && selectedUser && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-black/30 px-4"
            onClick={closeModal}
          >
            <div
              className="w-full max-w-3xl rounded-2xl bg-white shadow-xl border border-gray-200"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-5 border-b bg-[#2B245C] text-white rounded-tl-2xl rounded-tr-2xl">
                <div className="text-lg font-bold text-cyan-50">
                  User Details
                  <p className="text-sm text-white">
                    ID: {selectedUser.employeeId || "-"}
                  </p>
                </div>

                <button
                  onClick={closeModal}
                  className="rounded-lg border px-3 py-1 text-sm font-semibold hover:bg-[#3e3481]"
                >
                  ✕
                </button>
              </div>

              {/* Body */}
              <div className="p-5 space-y-5">
                {(() => {
                  // ✅ Always use latest access window data (fallback to root fields)
                  const roles = getRoles(selectedUser);
                  const permissions = getPermissions(selectedUser);
                  const modules = getModules(selectedUser);

                  const startDate = getStartDate(selectedUser);
                  const endDate = getEndDate(selectedUser);
                  const status = getStatus(selectedUser);

                  return (
                    <>
                      {/* Basic Info */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <div className="text-xs font-semibold text-gray-600 mb-1">
                            Name
                          </div>
                          <div className="text-sm font-bold">
                            {getDisplayName(selectedUser)}
                          </div>
                        </div>

                        <div>
                          <div className="text-xs font-semibold text-gray-600 mb-1">
                            Email
                          </div>
                          <div className="text-sm font-bold">
                            {selectedUser.email || "-"}
                          </div>
                        </div>
                      </div>

                      {/* Status */}
                      <div>
                        <div className="text-xs font-semibold text-gray-600 mb-2">
                          Access Status
                        </div>
                        <div>
                          <Badge
                            tone={
                              String(status).toUpperCase() === "APPROVED"
                                ? "green"
                                : String(status).toUpperCase() === "REJECTED"
                                  ? "red"
                                  : String(status).toUpperCase() === "PENDING"
                                    ? "yellow"
                                    : "gray"
                            }
                          >
                            {status || "-"}
                          </Badge>
                        </div>
                      </div>

                      {/* Roles */}
                      <div>
                        <div className="text-xs font-semibold text-gray-600 mb-2">
                          Roles
                        </div>
                        {Array.isArray(roles) && roles.length ? (
                          <div className="flex flex-wrap gap-1">
                            {roles.map((r) => (
                              <Badge key={r} tone="blue">
                                {r}
                              </Badge>
                            ))}
                          </div>
                        ) : (
                          <div className="text-sm text-gray-500">-</div>
                        )}
                      </div>

                      {/* Modules */}
                      <div>
                        <div className="text-xs font-semibold text-gray-600 mb-2">
                          Modules
                        </div>
                        {Array.isArray(modules) && modules.length ? (
                          <div className="flex flex-wrap gap-1">
                            {modules.map((m) => (
                              <Badge key={formatModuleEntry(m)} tone="green">
                                {formatModuleEntry(m)}
                              </Badge>
                            ))}
                          </div>
                        ) : (
                          <div className="text-sm text-gray-500">-</div>
                        )}
                      </div>

                      {/* Permissions */}
                      <div>
                        <div className="text-xs font-semibold text-gray-600 mb-2">
                          Permissions
                        </div>
                        {Array.isArray(permissions) && permissions.length ? (
                          <div className="flex flex-wrap gap-1 max-h-56 overflow-auto rounded-lg border p-3">
                            {permissions.map((p) => (
                              <Badge key={p} tone="indigo">
                                {p}
                              </Badge>
                            ))}
                          </div>
                        ) : (
                          <div className="text-sm text-gray-500">-</div>
                        )}
                      </div>

                      {/* Dates */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="rounded-lg border p-3">
                          <div className="text-xs font-semibold text-gray-600">
                            Start Date
                          </div>
                          <div className="text-sm">{formatDate(startDate)}</div>
                        </div>
                        <div className="rounded-lg border p-3">
                          <div className="text-xs font-semibold text-gray-600">
                            End Date
                          </div>
                          <div className="text-sm">{formatDate(endDate)}</div>
                        </div>
                      </div>
                    </>
                  );
                })()}
              </div>

              {/* Footer */}
              <div className="flex justify-end gap-2 p-5 border-t">
                <button
                  onClick={closeModal}
                  className="rounded-lg bg-[#2B245C] text-white px-4 py-2 text-sm font-semibold hover:bg-opacity-90"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
