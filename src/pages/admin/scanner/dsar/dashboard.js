import React, { useEffect, useMemo, useState } from "react";
import CustomAxios from "@/config/CustomAxios";
import { baseurl, initURL } from "@/config/config";
import { useRouter } from "next/navigation";
import { can, guard } from "@/auth/auth-permissions";
import { toast } from "react-toastify";

const apiPrefix = process.env.NEXT_PUBLIC_API_PREFIX || `${initURL}`;

const statusStyles = {
  Pending: "bg-yellow-100 text-yellow-800",
  "In Progress": "bg-blue-100 text-blue-800",
  Completed: "bg-green-100 text-green-800",
  Rejected: "bg-red-100 text-red-800",
  Canceled: "bg-gray-200 text-gray-700",
  Unknown: "bg-gray-100 text-gray-600",
};

const DSAR_SLA_DAYS = 30; // or whatever your SLA is

function computeDueDate(req) {
  if (req.dueDate) return req.dueDate; // if backend adds dueDate, use it
  if (!req.createdAt) return null;

  const d = new Date(req.createdAt);
  if (isNaN(d.getTime())) return null;

  d.setDate(d.getDate() + DSAR_SLA_DAYS);
  return d.toISOString();
}

function getDueInfo(dueDateStr, status) {
  if (!dueDateStr) {
    return { label: "-", days: null, className: "text-gray-500" };
  }

  const dueDate = new Date(dueDateStr);
  if (isNaN(dueDate.getTime())) {
    return { label: "-", days: null, className: "text-gray-500" };
  }

  const closed = ["Completed", "Rejected", "Canceled"];
  if (closed.includes(status)) {
    return {
      label: "Closed",
      days: 99999,
      className: "bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs",
    };
  }

  const today = new Date();
  dueDate.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);

  const diffDays = Math.round((dueDate - today) / (1000 * 60 * 60 * 24));

  if (diffDays === 0)
    return {
      label: "Due today",
      days: 0,
      className:
        "bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-medium",
    };

  if (diffDays > 0)
    return {
      label: `Due in ${diffDays} days`,
      days: diffDays,
      className:
        "bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium",
    };

  return {
    label: `Overdue by ${Math.abs(diffDays)} days`,
    days: diffDays,
    className:
      "bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-semibold",
  };
}

const DSARDashboard = () => {
  const router = useRouter();

  const [dsarRequests, setDsarRequests] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [assigning, setAssigning] = useState(false);
  const [search, setSearch] = useState(""); // To store the search query
  const [filterStatus, setFilterStatus] = useState("All"); // To filter by status (All, Pending, In Progress, etc.)
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [selectedUser, setSelectedUser] = useState("");

  // Permissions
  const canView = can("privacy.read");
  const canCreate = can("privacy.create");
  const canAssign = can("privacy.assign");

  // userId -> userName map
  const userNameById = useMemo(() => {
    const map = new Map();
    users?.forEach((u) => map.set(u._id, u.user_name));
    return map;
  }, [users]);

  //  search and filter
  let filteredRequests = dsarRequests;

  if (search) {
    filteredRequests = filteredRequests.filter((req) => {
      const text =
        `${req.requestID} ${req.fullName} ${req.email}`.toLowerCase();
      return text.includes(search.toLowerCase()); // Search based on requestID, fullName, and email
    });
  }

  if (filterStatus !== "All") {
    filteredRequests = filteredRequests.filter(
      (req) => req.status === filterStatus,
    );
  }

  // sort: overdue first → then due today → then due later → then closed
  filteredRequests = filteredRequests.sort((a, b) => {
    const aInfo = getDueInfo(computeDueDate(a), a.status || "Pending");
    const bInfo = getDueInfo(computeDueDate(b), b.status || "Pending");

    const aDays = typeof aInfo.days === "number" ? aInfo.days : 99999;
    const bDays = typeof bInfo.days === "number" ? bInfo.days : 99999;

    return aDays - bDays; // more negative = more overdue
  });

  // pagination calculations
  const totalPages = Math.ceil(filteredRequests.length / rowsPerPage);

  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;

  const currentRows = filteredRequests.slice(indexOfFirstRow, indexOfLastRow);

  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const response = await CustomAxios.get(`${baseurl}/${initURL}/dsar`);
        console.log(response.data);
        setDsarRequests(Array.isArray(response.data) ? response.data : []);
      } catch (err) {
        console.error("Failed to fetch DSAR requests:", err);
        setError("Failed to fetch DSAR requests.");
      } finally {
        setLoading(false);
      }
    };
    fetchRequests();
  }, []);

  // Fetch user list
  useEffect(() => {
    CustomAxios.get(`/${initURL}/apiv1/users/db`)
      .then((res) =>
        setUsers(Array.isArray(res.data?.data) ? res.data.data : []),
      )
      .catch((err) => {
        console.error("Error fetching employees:", err);
      });
  }, []);

  // Reset page when searching/filtering
  useEffect(() => {
    setCurrentPage(1);
  }, [search, filterStatus]);

  const handleAssignTo = async () => {
    if (!selectedRequest || !selectedUser || assigning) return;
    try {
      setAssigning(true);
      await CustomAxios.patch(
        `${baseurl}/${initURL}/dsar/${selectedRequest._id}`,
        { assignTo: selectedUser },
      );

      setDsarRequests((prev) =>
        prev.map((req) =>
          req._id === selectedRequest._id
            ? { ...req, assignTo: selectedUser }
            : req,
        ),
      );

      toast.success("Request assigned successfully.");
      setModalOpen(false);
      setSelectedRequest(null);
      setSelectedUser("");
    } catch (err) {
      console.error("Assignment failed:", err);
      toast.error("Failed to assign request. Please try again.");
    } finally {
      setAssigning(false);
    }
  };

  const handleCreate = () => router.push("/admin/scanner/dsar/");

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="mx-5 min-h-screen bg-white rounded-lg p-5 my-3">
        {/* header */}
        <div className="px-6 py-8 bg-[#2B245C] rounded-2xl shadow-lg hover:shadow-2xl transition-shadow duration-300">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-semibold text-cyan-50">
                DPRM Dashboard
              </h1>
              <p className="text-sm text-white mt-1">
                View, track, and manage all Data Principal Rights Management.
              </p>
            </div>

            <button
              className="rounded-lg bg-white text-[#2B245C] px-6 py-2.5 text-sm font-semibold shadow-md hover:shadow-lg hover:bg-gray-50 transition-all"
              onClick={() => guard(canCreate, router, handleCreate)}
            >
              + New DPRM
            </button>
          </div>
        </div>

        <div className="w-full my-5 p-5 border border-[#2B245C] rounded-lg">
          <div className="flex flex-wrap items-center justify-between gap-3 w-full">
            <div className="flex flex-wrap items-center gap-3">
              {/* Search input */}
              <input
                type="text"
                placeholder="Search by name, email, request ID..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-80 border border-gray-300 rounded-lg px-3 py-2 text-sm"
              />

              {/* Status filter dropdown */}
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-full md:w-auto"
              >
                <option value="All">All Statuses</option>
                <option value="Pending">Pending</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>

            <div className="text-sm font-medium text-gray-600 whitespace-nowrap">
              Total Requests:{" "}
              <span className="font-bold text-[#2B245C]">
                {filteredRequests.length}
              </span>
            </div>
          </div>
        </div>

        <section className="rounded-2xl border border-[#2B245C] bg-white p-6 shadow-lg hover:shadow-2xl transition-shadow duration-300">
          <div className="overflow-auto rounded-lg border border-gray-800">
            <table className="min-w-full text-sm">
              <thead className="bg-[#2B245C] text-center text-white border-b border-gray-800">
                <tr>
                  <th className="px-4 py-2 font-medium">Request ID</th>
                  <th className="px-4 py-2 font-medium">User</th>
                  <th className="px-4 py-2 font-medium">Country</th>
                  <th className="px-4 py-2 font-medium">Request Type(s)</th>
                  <th className="px-4 py-2 font-medium">Status</th>
                  <th className="px-4 py-2 font-medium">Submitted</th>
                  <th className="px-4 py-2 font-medium">Due</th>
                  <th className="px-4 py-2 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-center">
                {!canView ? (
                  <tr>
                    <td
                      colSpan={8}
                      className="px-4 py-4 text-center text-red-600 font-medium"
                    >
                      You don’t have permission to view DPRM requests.
                    </td>
                  </tr>
                ) : loading ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-10">
                      <div className="flex items-center justify-center">
                        <div className="inline-block h-10 w-10 animate-spin rounded-full border-4 border-gray-300 border-t-transparent" />
                        <span className="ml-3 text-gray-600">Loading...</span>
                      </div>
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-6">
                      <div className="mx-auto max-w-lg rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                        {error}
                      </div>
                    </td>
                  </tr>
                ) : filteredRequests.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-10 text-gray-500">
                      No data found
                    </td>
                  </tr>
                ) : (
                  currentRows.map((req) => {
                    const computedDue = computeDueDate(req);
                    const dueInfo = getDueInfo(computedDue, req.status);

                    return (
                      <tr key={req._id} className="hover:bg-gray-50 transition">
                        <td className="px-6 py-4 font-medium text-gray-800">
                          {req.requestID || "-"}
                        </td>

                        <td className="px-6 py-4 text-gray-700">
                          <div className="font-medium">
                            {req.fullName || "-"}
                          </div>
                          <div className="text-xs text-gray-500">
                            {req.email || "-"}
                          </div>
                        </td>

                        <td className="px-6 py-4 text-gray-600">
                          {req.country || "-"}
                        </td>

                        <td className="px-6 py-4 text-gray-700 space-y-1">
                          {Array.isArray(req.requestTypes) &&
                          req.requestTypes.length > 0 ? (
                            req.requestTypes.map((type, i) => (
                              <span
                                key={`${req._id}-type-${i}`}
                                className="inline-block bg-indigo-50 text-indigo-700 px-2 py-1 text-xs font-medium rounded ml-1"
                              >
                                {type}
                              </span>
                            ))
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>

                        <td className="px-6 py-4">
                          <span
                            className={`inline-block text-xs font-semibold px-3 py-1 rounded-full ${
                              statusStyles[req.status] ||
                              statusStyles["Unknown"]
                            }`}
                          >
                            {req.status || "Unknown"}
                          </span>
                        </td>

                        <td className="px-6 py-4 text-gray-500">
                          {req.createdAt
                            ? new Date(req.createdAt).toLocaleDateString()
                            : "-"}
                        </td>

                        <td className="px-6 py-4">
                          <div className="flex flex-col items-center">
                            <span className="text-xs text-gray-500">
                              {computedDue
                                ? new Date(computedDue).toLocaleDateString()
                                : "-"}
                            </span>
                            <span className={dueInfo.className}>
                              {dueInfo.label}
                            </span>
                          </div>
                        </td>

                        {/* ACTIONS: Assign button */}
                        <td className="px-6 py-4 space-y-2 text-center">
                          {req.assignTo && (
                            <div className="text-xs text-gray-600 mb-2">
                              Assigned to:{" "}
                              <span className="font-medium">
                                {userNameById.get(req.assignTo) || req.assignTo}
                              </span>
                            </div>
                          )}

                          <div className="flex justify-center">
                            <button
                              className="bg-[#2B245C] text-white px-3 py-2 rounded-lg text-xs hover:bg-opacity-90 disabled:opacity-60"
                              onClick={() =>
                                guard(canAssign, router, () => {
                                  setSelectedRequest(req);
                                  setSelectedUser(req.assignTo || "");
                                  setModalOpen(true);
                                })
                              }
                              disabled={assigning}
                            >
                              Assign
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="mt-5 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-sm">
              <span>Rows per page:</span>

              <select
                value={rowsPerPage}
                onChange={(e) => {
                  setRowsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="border rounded-md px-2 py-1"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
            </div>

            <div className="text-sm text-gray-600">
              Showing {filteredRequests.length === 0 ? 0 : indexOfFirstRow + 1}-
              {Math.min(indexOfLastRow, filteredRequests.length)} of{" "}
              {filteredRequests.length}
            </div>

            <div className="flex justify-center items-center gap-2">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="rounded-lg bg-[#2B245C] text-white px-3 py-2 text-sm font-semibold shadow-md hover:shadow-lg hover:bg-opacity-90 disabled:opacity-50 transition-all"
              >
                Prev
              </button>

              <span className="text-sm">
                Page {currentPage} of {totalPages || 1}
              </span>

              <button
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                disabled={currentPage === totalPages || totalPages === 0}
                className="rounded-lg bg-[#2B245C] text-white px-3 py-2 text-sm font-semibold shadow-md hover:shadow-lg hover:bg-opacity-90 disabled:opacity-50 transition-all"
              >
                Next
              </button>
            </div>
          </div>
        </section>

        {/* Footer only when not loading */}
        {/* {!loading && !error && (
          <div className="mt-6 text-sm text-gray-500">
            Showing {dsarRequests.length} of {dsarRequests.length} requests.
          </div>
        )} */}
      </div>

      {/* Modal */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          aria-modal="true"
          role="dialog"
          aria-labelledby="assign-modal-title"
          onKeyDown={(e) => e.key === "Escape" && setModalOpen(false)}
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
            onClick={() => setModalOpen(false)}
          />

          {/* Panel */}
          <div
            className="relative w-full max-w-lg scale-100 opacity-100 rounded-xl bg-white shadow-2xl ring-1 ring-black/5 transition-all"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-start justify-between px-6 py-5 border-b bg-[#2B245C] rounded-t-xl">
              <div className="flex items-center">
                <div className="mr-3 flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100">
                  <svg
                    className="h-5 w-5 text-indigo-600"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 14c-4.418 0-8 2.239-8 5v1h16v-1c0-2.761-3.582-5-8-5z"
                    />
                  </svg>
                </div>
                <div>
                  <h3
                    id="assign-modal-title"
                    className="text-xl font-semibold text-cyan-50"
                  >
                    Assign Request
                  </h3>
                  <p className="mt-1 text-xs text-white">
                    Choose a team member to take ownership of this DPRM.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setModalOpen(false)}
                className="rounded-md p-1 text-gray-400 hover:text-white hover:bg-opacity-90"
                aria-label="Close"
              >
                <svg
                  className="h-5 w-5"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  fill="none"
                  strokeWidth="2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 6l12 12M18 6L6 18"
                  />
                </svg>
              </button>
            </div>

            {/* Body */}
            <div className="px-6 py-5">
              {/* Context */}
              {selectedRequest && (
                <div className="mb-5 rounded-lg border border-gray-100 bg-gray-50 px-4 py-3 text-sm">
                  <div className="flex flex-wrap gap-x-6">
                    <div>
                      <span className="text-gray-500">Request ID:</span>{" "}
                      <span className="font-medium text-gray-900">
                        {selectedRequest.requestID || selectedRequest._id}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500">Current assignee:</span>{" "}
                      <span className="font-medium text-gray-900">
                        {selectedRequest.assignTo
                          ? userNameById.get(selectedRequest.assignTo) || "—"
                          : "Unassigned"}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Select */}
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Assign to
              </label>
              <select
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                value={selectedUser}
                onChange={(e) => setSelectedUser(e.target.value)}
              >
                <option value="">Select a user…</option>
                {users.map((user) => (
                  <option key={user._id} value={user._id}>
                    {user.user_name} ({user.email})
                  </option>
                ))}
              </select>
              {!selectedUser && (
                <p className="mt-1 text-xs text-gray-500">
                  Tip: You can reassign later from the dashboard.
                </p>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-2 px-6 py-3 border-t bg-gray-50 rounded-b-xl">
              <button
                className="border border-[#2B245C] rounded-lg px-4 py-2 text-sm font-medium text-[#2B245C] hover:bg-blue-50"
                onClick={() => setModalOpen(false)}
              >
                Cancel
              </button>
              <button
                onClick={handleAssignTo}
                disabled={!selectedUser || assigning}
                className="rounded-lg bg-[#2B245C] border border-[#2B245C] px-4 py-2 text-sm font-semibold text-white shadow-md hover:shadow-lg hover:bg-opacity-90 disabled:opacity-60 transition-all"
              >
                {assigning ? (
                  <>
                    <span className="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Assigning…
                  </>
                ) : (
                  "Assign"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DSARDashboard;
