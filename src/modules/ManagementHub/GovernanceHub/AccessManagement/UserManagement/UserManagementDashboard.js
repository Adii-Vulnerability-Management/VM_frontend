import React, { useEffect, useMemo, useState } from "react";
import Cookies from "js-cookie";
import CustomAxios from "@/config/CustomAxios";
// If your config path differs, adjust this import accordingly
import { baseurl, initURL } from "@/config/config";

const SUPER_EMP_URL = `/${initURL}/apiv1/users`;
const TENANT_EMP_URL = `/${initURL}/access/tenants/current/users`;

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

// ----------------- helpers -----------------
const str = (v) => (v == null ? "" : String(v));
const fullName = (u) =>
  u?.name ||
  u?.user_name ||
  [u?.first_name, u?.last_name].filter(Boolean).join(" ") ||
  u?.email ||
  "—";
const initials = (name) =>
  (name || "")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p?.[0]?.toUpperCase())
    .join("") || "?";
const fmtDT = (v) => {
  if (!v) return "—";
  const d = new Date(v);
  return isNaN(d) ? "—" : d.toLocaleString();
};
const isAdminLike = (u) => {
  const bucket = [
    u?.role,
    u?.user_role,
    u?.user_designation,
    u?.designation,
    u?.group,
  ]
    .map(str)
    .join(" ")
    .toLowerCase();
  return /\badmin|super\s*admin|sys\s*admin\b/.test(bucket);
};
const roleChipColor = (role) =>
  ({
    Admin: "bg-[#2B245C] text-white",
    Approver: "bg-sky-100 text-sky-700",
    Reviewer: "bg-amber-100 text-amber-700",
    Creator: "bg-indigo-100 text-indigo-700",
    Assigner: "bg-teal-100 text-teal-700",
    Supervisor: "bg-emerald-100 text-emerald-700",
    Employee: "bg-gray-100 text-gray-700",
  })[role] || "bg-gray-100 text-gray-700";

// ----------------- component -----------------
export default function EmployeeDirectory({
  designations = [
    "Employee",
    "Reviewer",
    "Approver",
    "Assigner",
    "Supervisor",
    "Creator",
  ],
  pageSize = 10,
  view = "table", // 'table' | 'cards'
}) {
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState([]);
  const [error, setError] = useState("");

  // filters & sort
  const [q, setQ] = useState("");
  const [roleFilter, setRoleFilter] = useState("All Roles"); // All Roles | Admin | Approver | Reviewer | Creator | Assigner | Supervisor | Employee
  const [mfaFilter, setMfaFilter] = useState("All MFA Status"); // All MFA | Enabled | Disabled
  const [statusFilter, setStatusFilter] = useState("All Status"); // All Status | Active | Inactive | Deleted
  const [sortBy, setSortBy] = useState("name"); // name | role | joined | last_login
  const [sortDir, setSortDir] = useState("asc"); // asc | desc

  // pagination
  const [page, setPage] = useState(1);

  const fetchEmployees = async () => {
    setLoading(true);
    setError("");
    try {
      const url = pickEmpUrl();
      const res = await CustomAxios.get(url, {
        params:
          url === SUPER_EMP_URL ? { user_designations: designations } : {},
      });
      const payload = res.data?.body || res.data;
      const list = Array.isArray(payload) ? payload : payload?.data || [];
      setRows(list);
    } catch (e) {
      setError(
        e?.response?.data?.message || e?.message || "Failed to fetch employees",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const enriched = useMemo(
    () =>
      (rows || []).map((u) => ({
        ...u,
        primaryRole: isAdminLike(u)
          ? "Admin"
          : u?.user_designation || "Employee",
        nameDisplay: fullName(u),
      })),
    [rows],
  );

  const filtered = useMemo(() => {
    const text = q.trim().toLowerCase();
    return enriched.filter((u) => {
      const roleOk =
        roleFilter === "All Roles" ||
        (u.primaryRole || "").toLowerCase() === roleFilter.toLowerCase();
      const mfaOk =
        mfaFilter === "All MFA Status" ||
        (mfaFilter === "Enabled" ? !!u?.mfaEnabled : !u?.mfaEnabled);
      const statusOk =
        statusFilter === "All Status" ||
        (statusFilter === "Active" && u?.is_active && !u?.is_deleted) ||
        (statusFilter === "Inactive" && !u?.is_active && !u?.is_deleted) ||
        (statusFilter === "Deleted" && !!u?.is_deleted);
      const textOk =
        !text ||
        [
          u?.email,
          u?.contact_number,
          u?.employeeId,
          u?.user_uuid,
          u?.user_id,
          u?.admin_email,
          u?.admin_uuid,
          u?.nameDisplay,
        ]
          .map(str)
          .some((s) => s.toLowerCase().includes(text));
      return roleOk && mfaOk && statusOk && textOk;
    });
  }, [enriched, q, roleFilter, mfaFilter, statusFilter]);

  const sorted = useMemo(() => {
    const arr = [...filtered];
    const dir = sortDir === "asc" ? 1 : -1;
    arr.sort((a, b) => {
      switch (sortBy) {
        case "role":
          return str(a.primaryRole).localeCompare(str(b.primaryRole)) * dir;
        case "joined":
          return (new Date(a.date_joined) - new Date(b.date_joined)) * dir;
        case "last_login":
          return (new Date(a.last_login) - new Date(b.last_login)) * dir;
        case "name":
        default:
          return str(a.nameDisplay).localeCompare(str(b.nameDisplay)) * dir;
      }
    });
    return arr;
  }, [filtered, sortBy, sortDir]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const pageStart = (page - 1) * pageSize;
  const pageRows = sorted.slice(pageStart, pageStart + pageSize);

  useEffect(() => {
    // reset to page 1 if filters change to avoid empty pages
    setPage(1);
  }, [q, roleFilter, mfaFilter, statusFilter, sortBy, sortDir]);

  const exportCSV = () => {
    const heads = [
      "Name",
      "Email",
      // "Role",
      "MFA",
      "Active",
      "Deleted",
      "Phone",
      "EmployeeId",
      "User UUID",
      "Joined",
      "Last Login",
    ];
    const lines = [heads.join(",")];
    sorted.forEach((u) => {
      const row = [
        str(u.nameDisplay),
        str(u.email),
        // str(u.primaryRole),
        u?.mfaEnabled ? "Enabled" : "Disabled",
        u?.is_active ? "Yes" : "No",
        u?.is_deleted ? "Yes" : "No",
        str(u.contact_number),
        str(u.employeeId),
        str(u.user_uuid || u._id),
        fmtDT(u.date_joined),
        fmtDT(u.last_login),
      ].map((c) => `"${String(c).replaceAll('"', '""')}"`);
      lines.push(row.join(","));
    });
    const blob = new Blob([lines.join("\n")], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `employees_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const HeaderBar = (
    <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3 mb-4">
      <div>
        <h2 className="text-2xl font-bold text-[#2B245C] mb-1">
          Users Overview
        </h2>
        <div className="text-xs text-gray-500">
          Showing {sorted.length} result(s)
        </div>
      </div>
      <div className="flex flex-wrap gap-3 items-center">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search name, email, phone, id..."
          className="w-64 rounded-lg border border-gray-500 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-indigo-200 transition-all"
        />
        {/* <select
          className="rounded-lg border border-gray-500 bg-white px-4 py-2 text-sm text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 ease-in-out"
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
        >
          {[
            "All Roles",
            "Admin",
            "Approver",
            "Reviewer",
            "Creator",
            "Assigner",
            "Supervisor",
            "Employee",
          ].map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select> */}
        <select
          className="rounded-lg border border-gray-500 bg-white px-4 py-2 text-sm text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 ease-in-out"
          value={mfaFilter}
          onChange={(e) => setMfaFilter(e.target.value)}
        >
          {["All MFA Status", "Enabled", "Disabled"].map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
        <select
          className="rounded-lg border border-gray-500 bg-white px-4 py-2 text-sm text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 ease-in-out"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          {["All Status", "Active", "Inactive", "Deleted"].map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
        <select
          className="rounded-lg border border-gray-500 bg-white px-4 py-2 text-sm text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 ease-in-out"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
        >
          <option value="name">Sort: Name</option>
          {/* <option value="role">Sort: Role</option> */}
          <option value="joined">Sort: Joined</option>
          <option value="last_login">Sort: Last Login</option>
        </select>
        <button
          onClick={() => setSortDir((d) => (d === "asc" ? "desc" : "asc"))}
          className="border border-[#2B245C] bg-blue-50 hover:bg-blue-100 rounded-lg px-8 py-2 text-[#2B245C] font-semibold text-sm"
          title="Toggle sort direction"
        >
          {sortDir === "asc" ? "Asc" : "Desc"}
        </button>
        <button
          onClick={exportCSV}
          className="px-3 py-2 rounded-lg bg-[#2B245C] border border-[#2B245C] text-white font-semibold text-sm hover:bg-opacity-90"
        >
          Export CSV
        </button>
      </div>
    </div>
  );

  const Pagination = (
    <div className="flex items-center justify-between mt-4">
      <div className="text-sm text-gray-500">
        Page {page} of {totalPages}
      </div>
      <div className="flex gap-2">
        <button
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          className="rounded-lg bg-[#2B245C] text-white px-4 py-2 text-sm font-semibold shadow-md hover:shadow-lg hover:bg-opacity-90 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-200 ease-in-out"
          disabled={page === 1}
        >
          Prev
        </button>
        <button
          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          className="rounded-lg bg-[#2B245C] text-white px-4 py-2 text-sm font-semibold shadow-md hover:shadow-lg hover:bg-opacity-90 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-200 ease-in-out"
          disabled={page === totalPages}
        >
          Next
        </button>
      </div>
    </div>
  );

  // ---------- UI ----------
  if (error) {
    return (
      <div className="p-5">
        {HeaderBar}
        <div className="p-4 rounded bg-red-50 text-red-700 border border-red-200">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="py-5 px-2 space-y-5">
      <section className="rounded-2xl border border-[#2B245C] bg-white p-6 shadow-lg hover:shadow-2xl transition-shadow duration-300">
        {HeaderBar}

        <div className="bg-white rounded-lg shadow overflow-hidden">
          {loading ? (
            <div className="p-6 text-center text-gray-500">
              Loading employees…
            </div>
          ) : !pageRows.length ? (
            <div className="p-6 text-center text-gray-500">
              No employees found
            </div>
          ) : view === "cards" ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
              {pageRows.map((u) => (
                <div key={u._id} className="border rounded-xl p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#F2F1FB] flex items-center justify-center font-semibold text-[#2B245C]">
                      {initials(fullName(u))}
                    </div>
                    <div>
                      <div className="font-semibold">{fullName(u)}</div>
                      <div className="text-xs text-gray-500">
                        {u.email || "—"}
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <span
                      className={`px-2 py-0.5 rounded text-xs font-medium ${roleChipColor(
                        u.primaryRole,
                      )}`}
                    >
                      {u.primaryRole}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-xs ${
                        u.emailVerified
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {u.emailVerified
                        ? "Email Verified"
                        : "Email Not Verified"}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-xs ${
                        u.mfaEnabled
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {u.mfaEnabled ? "MFA Enabled" : "MFA Disabled"}
                    </span>
                    {u.is_deleted && (
                      <span className="px-2 py-0.5 rounded text-xs bg-red-100 text-red-700">
                        Deleted
                      </span>
                    )}
                    {!u.is_deleted &&
                      (u.is_active ? (
                        <span className="px-2 py-0.5 rounded text-xs bg-emerald-100 text-emerald-700">
                          Active
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-xs bg-gray-100 text-gray-600">
                          Inactive
                        </span>
                      ))}
                  </div>
                  <div className="mt-3 text-sm grid grid-cols-1 gap-1">
                    <div>
                      <span className="text-gray-500">Phone:</span>{" "}
                      {u.phone || u.contact_number || "—"}
                    </div>
                    <div>
                      <span className="text-gray-500">Employee ID:</span>{" "}
                      {u.employeeId || "—"}
                    </div>
                    <div>
                      <span className="text-gray-500">User UUID:</span>{" "}
                      {u.user_uuid || u._id || "—"}
                    </div>
                    <div>
                      <span className="text-gray-500">Joined:</span>{" "}
                      {fmtDT(u.date_joined)}
                    </div>
                    <div>
                      <span className="text-gray-500">Last Login:</span>{" "}
                      {fmtDT(u.last_login)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="overflow-auto rounded-lg border border-gray-800">
              <table className="min-w-full text-sm">
                <thead className="bg-[#2B245C] text-left text-white border-b border-gray-800">
                  <tr>
                    <th className="px-4 py-2 font-medium">Name</th>
                    <th className="px-4 py-2 font-medium">Email</th>
                    {/* <th className="px-4 py-2 font-medium">Role</th> */}
                    <th className="px-4 py-2 font-medium">MFA</th>
                    <th className="px-4 py-2 font-medium">Active</th>
                    <th className="px-4 py-2 font-medium">Deleted</th>
                    <th className="px-4 py-2 font-medium">Phone</th>
                    <th className="px-4 py-2 font-medium">Employee ID</th>
                    <th className="px-4 py-2 font-medium">Joined</th>
                    <th className="px-4 py-2 font-medium">Last Login</th>
                  </tr>
                </thead>
                <tbody>
                  {pageRows.map((u) => (
                    <tr key={u._id} className="border-b border-gray-100">
                      <td className="px-4 py-2">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-[#F2F1FB] flex items-center justify-center text-xs font-semibold text-[#2B245C]">
                            {initials(fullName(u))}
                          </div>
                          <div className="font-medium">{fullName(u)}</div>
                        </div>
                      </td>
                      <td className="px-4 py-2">{u.email || "—"}</td>
                      {/* <td className="px-4 py-2">
                        <span
                          className={`p-2 rounded-full text-xs font-medium ${roleChipColor(
                            u.primaryRole,
                          )}`}
                        >
                          {u.primaryRole}
                        </span>
                      </td> */}
                      <td className="px-4 py-2">
                        {u.mfaEnabled ? "Enabled" : "Disabled"}
                      </td>
                      <td className="px-4 py-2">
                        {u.is_deleted ? "—" : u.is_active ? "Yes" : "No"}
                      </td>
                      <td className="px-4 py-2">
                        {u.is_deleted ? "Yes" : "No"}
                      </td>
                      <td className="px-4 py-2">{u.phone || u.contact_number || "—"}</td>
                      <td className="px-4 py-2">{u.employeeId || "—"}</td>
                      <td className="px-4 py-2">{fmtDT(u.date_joined)}</td>
                      <td className="px-4 py-2">{fmtDT(u.last_login)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {totalPages > 1 && Pagination}
      </section>
    </div>
  );
}

// ----------------- usage example -----------------
// import EmployeeDirectory from "@/components/EmployeeDirectory";
// <EmployeeDirectory pageSize={12} view="cards" />
