import React, { useEffect, useMemo, useState } from "react";
import CustomAxios from "@/config/CustomAxios";
import { baseurl, initURL } from "@/config/config";
import { useRouter } from "next/navigation";
import { can, guard } from "@/auth/auth-permissions";
import Cookies from "js-cookie";
import { toast } from "react-toastify";
import DSARMessages from "./dsarMessages";
const apiPrefix = process.env.NEXT_PUBLIC_API_PREFIX || `${initURL}`;

// Status styles
const statusStyles = {
  Pending: "bg-yellow-100 text-yellow-800",
  "In Progress": "bg-blue-100 text-blue-800",
  Completed: "bg-green-100 text-green-800",
  Rejected: "bg-red-100 text-red-800",
  Canceled: "bg-gray-200 text-gray-700",
  Unknown: "bg-gray-100 text-gray-600",
};

const STATUS_OPTIONS = [
  "All",
  "Pending",
  "In Progress",
  "Completed",
  "Rejected",
];

const DSAR_SLA_DAYS = 30; // SLA days (Usually 1 month under GDPR)

// Compute due date from backend dueDate or createdAt + SLA
function computeDueDate(req) {
  if (req.dueDate) return req.dueDate; // if backend ever adds dueDate, use it
  if (!req.createdAt) return null;

  const d = new Date(req.createdAt);
  if (isNaN(d.getTime())) return null;

  d.setDate(d.getDate() + DSAR_SLA_DAYS);
  return d.toISOString();
}

// Helper: due info (label + styling)
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

const UserDSARDashboard = () => {
  const router = useRouter();

  const [requests, setRequests] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  // Search and filter
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const [selectedRequest, setSelectedRequest] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [showMessages, setShowMessages] = useState(false);

  // Cancel a request
  const [cancelingId, setCancelingId] = useState(null);

  const canView = can("privacy.read");
  const canUpdate = can("privacy.update");

  // Get current user from cookies
  const currentUser = useMemo(() => {
    const raw =
      Cookies.get("user_data") ||
      Cookies.get("user") ||
      Cookies.get("auth_user");
    try {
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }, []);

  const currentUserEmail =
    currentUser?.email ||
    currentUser?.user?.email ||
    currentUser?.username ||
    null;

  // Fetch DSARs and filter to this user's requests
  useEffect(() => {
    const fetchDSARs = async () => {
      if (!currentUserEmail) {
        setLoading(false);
        setError("No logged-in user found. Please sign in again.");
        return;
      }

      try {
        const response = await CustomAxios.get(`${baseurl}/${initURL}/dsar`);
        const all = Array.isArray(response.data) ? response.data : [];

        // Only keep requests submitted by this user's email
        const mine = all.filter(
          (req) =>
            req.email &&
            String(req.email).toLowerCase() ===
              String(currentUserEmail).toLowerCase(),
        );

        setRequests(mine);
      } catch (err) {
        console.error("Error fetching DSARs:", err);
        setError("Failed to fetch your DSAR requests.");
        toast.error("Failed to load your DSAR requests.");
      } finally {
        setLoading(false);
      }
    };

    fetchDSARs();
  }, [currentUserEmail]);

  // Fetch employees to resolve assignee names (optional, for display)
  useEffect(() => {
    CustomAxios.get(`/${initURL}/apiv1/users/db`)
      .then((res) => {
        const list = Array.isArray(res.data?.data) ? res.data.data : [];
        setEmployees(list);
      })
      .catch((err) => {
        console.error("Error fetching employees:", err);
        setEmployees([]);
      });
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, filterStatus]);

  const employeeById = useMemo(() => {
    const map = new Map();
    employees.forEach((e) => {
      map.set(String(e._id), e);
    });
    return map;
  }, [employees]);

  // Search + filter pipeline
  let filtered = useMemo(() => {
    let list = [...requests];

    // Search by ID / type / notes
    if (search.trim()) {
      const query = search.toLowerCase();
      list = list.filter((req) => {
        const text = `${req.requestID} ${req.fullName} ${req.email} ${
          req.notes || ""
        } ${
          Array.isArray(req.requestTypes) ? req.requestTypes.join(" ") : ""
        }`.toLowerCase();
        return text.includes(query);
      });
    }

    // Status filter
    if (filterStatus !== "All") {
      list = list.filter((req) => req.status === filterStatus);
    }

    // Sort by due date: overdue → due today → due later → closed
    list.sort((a, b) => {
      const aInfo = getDueInfo(computeDueDate(a), a.status || "Pending");
      const bInfo = getDueInfo(computeDueDate(b), b.status || "Pending");

      const aDays = typeof aInfo.days === "number" ? aInfo.days : 99999;
      const bDays = typeof bInfo.days === "number" ? bInfo.days : 99999;

      return aDays - bDays;
    });

    return list;
  }, [requests, search, filterStatus]);

  // pagination calculations
  const totalPages = Math.ceil(filtered.length / rowsPerPage);

  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;

  const currentRows = filtered.slice(indexOfFirstRow, indexOfLastRow);

  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const openModal = (req) => {
    setSelectedRequest(req);
    setModalOpen(true);
  };

  const closeModal = () => {
    setSelectedRequest(null);
    setModalOpen(false);
  };

  // Cancel a request handler
  const handleCancelRequest = async (req) => {
    // Optional confirmation
    const ok = window.confirm(
      "Are you sure you want to cancel this request? This action cannot be undone.",
    );
    if (!ok) return;

    try {
      setCancelingId(req._id);

      await CustomAxios.patch(`${baseurl}/${initURL}/dsar/${req._id}`, {
        status: "Canceled",
      });

      // Update UI state
      setRequests((prev) =>
        prev.map((r) => (r._id === req._id ? { ...r, status: "Canceled" } : r)),
      );

      toast.success("Your request has been canceled.");
    } catch (err) {
      console.error("Failed to cancel DSAR:", err);
      toast.error("Failed to cancel the request. Please try again.");
    } finally {
      setCancelingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="mx-5 min-h-screen bg-white rounded-lg p-5 my-3">
        {/* HEADER */}
        <div className="px-6 py-8 bg-[#2B245C] rounded-2xl shadow-lg hover:shadow-2xl transition-shadow duration-300">
          <h1 className="text-3xl font-bold text-cyan-50">My DPRM Requests</h1>
          <p className="text-sm text-white mt-1">
            View the status and handler of your Data Principals Rights
            Management.
          </p>
        </div>

        {/* SEARCH & FILTERS */}
        <div className="w-full my-5 p-5 border border-[#2B245C] rounded-lg">
          <div className="flex flex-wrap items-center justify-between gap-3 w-full">
            <div className="flex flex-wrap gap-3">
              <input
                type="text"
                placeholder="Search by request ID, type, or note..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-80 border border-gray-300 rounded-lg px-3 py-2 text-sm"
              />

              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
              >
                {STATUS_OPTIONS.map((st) => (
                  <option key={st} value={st}>
                    {st === "All" ? "All statuses" : st}
                  </option>
                ))}
              </select>
            </div>

            {/* Total Count */}
            <div className="text-sm font-medium text-gray-600 whitespace-nowrap">
              Total Requests:{" "}
              <span className="font-bold text-[#2B245C]">
                {requests.length}
              </span>
            </div>
          </div>
        </div>

        {/* TABLE */}
        <section className="rounded-2xl border border-[#2B245C] bg-white p-6 shadow-lg hover:shadow-2xl transition-shadow duration-300">
          <div className="overflow-auto rounded-lg border border-gray-800">
            <table className="min-w-full text-sm">
              <thead className="bg-[#2B245C] text-center text-white border-b border-gray-800">
                <tr>
                  <th className="px-4 py-2 font-medium"> Request ID</th>
                  <th className="px-4 py-2 font-medium"> Type(s)</th>
                  <th className="px-4 py-2 font-medium"> Status</th>
                  <th className="px-4 py-2 font-medium"> Submitted</th>
                  <th className="px-4 py-2 font-medium">Due</th>
                  <th className="px-4 py-2 font-medium"> Assignee</th>
                  <th className="px-4 py-2 font-medium"> Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100 text-center">
                {!canView ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-4 py-4 text-center text-red-600 font-medium"
                    >
                      You don’t have permission to view DSAR requests.
                    </td>
                  </tr>
                ) : loading ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-5">
                      <div className="flex items-center justify-center">
                        <div className="inline-block h-10 w-10 animate-spin rounded-full border-4 border-gray-300 border-t-transparent" />
                        <span className="ml-3 text-gray-600">Loading...</span>
                      </div>
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-6">
                      <div className="mx-auto max-w-lg rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                        {error}
                      </div>
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-5 text-gray-500">
                      You have not submitted any DSAR requests yet.
                    </td>
                  </tr>
                ) : (
                  currentRows.map((req) => {
                    const computedDue = computeDueDate(req);
                    const dueInfo = getDueInfo(computedDue, req.status);

                    const assignee =
                      req.assignTo &&
                      employeeById.get(String(req.assignTo || ""))?.user_name;

                    return (
                      <tr key={req._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 font-medium">
                          {req.requestID}
                        </td>

                        <td className="px-6 py-4">
                          {Array.isArray(req.requestTypes) &&
                          req.requestTypes.length > 0 ? (
                            req.requestTypes.map((t, i) => (
                              <span
                                key={`${req._id}-type-${i}`}
                                className="inline-block bg-indigo-50 text-indigo-700 px-2 py-1 text-xs rounded mr-1 mb-1"
                              >
                                {t}
                              </span>
                            ))
                          ) : (
                            <span className="text-gray-400 text-xs">-</span>
                          )}
                        </td>

                        <td className="px-6 py-4">
                          <span
                            className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                              statusStyles[req.status] ||
                              statusStyles["Unknown"]
                            }`}
                          >
                            {req.status || "Unknown"}
                          </span>
                        </td>

                        <td className="px-6 py-4">
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

                        <td className="px-6 py-4">
                          {assignee && (
                            <span className="font-medium text-gray-600 text-center max-w-xs mx-auto">
                              {assignee}
                            </span>
                          )}
                        </td>

                        <td className="px-6 py-4 flex gap-2 whitespace-nowrap">
                          <button
                            className="bg-[#2B245C] text-white p-2 text-xs font-medium rounded-lg hover:bg-opacity-90 w-full"
                            onClick={() => openModal(req)}
                          >
                            View details
                          </button>

                          {(req.status === "Pending" ||
                            req.status === "In Progress") && (
                            <button
                              className="bg-red-500 text-white p-2 text-xs font-medium rounded-lg hover:bg-red-600 w-full disabled:opacity-60 disabled:cursor-not-allowed"
                              onClick={() =>
                                guard(canUpdate, router, () =>
                                  handleCancelRequest(req),
                                )
                              }
                              disabled={!canUpdate || cancelingId === req._id}
                              title="Available for 24 hrs"
                            >
                              {cancelingId === req._id
                                ? "Canceling..."
                                : "Cancel request"}
                            </button>
                          )}
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
            {/* Rows per page */}
            <div className="flex items-center gap-2 text-sm">
              <span>Rows per page:</span>

              <select
                value={rowsPerPage}
                onChange={(e) => {
                  setRowsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="border border-gray-300 rounded-md px-2 py-1"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
            </div>

            {/* Showing count */}
            <div className="text-sm text-gray-600">
              Showing {filtered.length === 0 ? 0 : indexOfFirstRow + 1}-
              {Math.min(indexOfLastRow, filtered.length)} of {filtered.length}
            </div>

            {/* Pagination */}
            <div className="flex items-center gap-2">
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
      </div>

      {/* MODAL: Request details for the user */}
      {modalOpen && selectedRequest && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          aria-modal="true"
          role="dialog"
          aria-labelledby="user-dsar-detail-title"
          onKeyDown={(e) => e.key === "Escape" && closeModal()}
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={closeModal}
          />

          {/* Modal panel */}
          <div
            className="
                relative
                w-full
                max-w-xl
                h-[490px]            
                rounded-xl
                bg-white
                shadow-2xl
                ring-1 ring-black/5
                mx-4
                flex flex-col
              "
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="px-6 py-4 flex items-start justify-between border-b border-gray-100 bg-[#2B245C] rounded-t-xl">
              <div>
                <h2
                  id="user-dsar-detail-title"
                  className="text-xl font-semibold text-cyan-50"
                >
                  Request details
                </h2>
                <p className="text-sm text-white mt-1">
                  Request ID:{" "}
                  <span className="font-medium">
                    {selectedRequest.requestID || selectedRequest._id}
                  </span>
                </p>
              </div>
              <button
                onClick={closeModal}
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
            <div className="px-6 pt-4 pb-2 flex-1 overflow-y-auto space-y-4 text-sm">
              {/* Basic info */}
              {!showMessages ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-gray-500">Your name</p>
                      <p className="font-medium text-gray-800">
                        {selectedRequest.fullName || "-"}
                      </p>
                      <p className="text-xs text-gray-500">
                        {selectedRequest.email || "-"}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500">Request type(s)</p>
                      <div className="mt-1">
                        {Array.isArray(selectedRequest.requestTypes) &&
                        selectedRequest.requestTypes.length > 0 ? (
                          selectedRequest.requestTypes.map((type, i) => (
                            <span
                              key={`${selectedRequest._id}-detail-type-${i}`}
                              className="inline-block bg-indigo-50 text-indigo-700 px-2 py-1 text-xs font-medium rounded mr-1 mb-1"
                            >
                              {type}
                            </span>
                          ))
                        ) : (
                          <span className="text-gray-400 text-xs">-</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Dates & due info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-gray-500">Submitted on</p>
                      <p className="font-medium text-gray-800">
                        {selectedRequest.createdAt
                          ? new Date(
                              selectedRequest.createdAt,
                            ).toLocaleDateString()
                          : "-"}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500">Due by</p>
                      <p className="font-medium text-gray-800">
                        {(() => {
                          const computedDue = computeDueDate(selectedRequest);
                          return computedDue
                            ? new Date(computedDue).toLocaleDateString()
                            : "-";
                        })()}
                      </p>
                      <p className="mt-1">
                        {(() => {
                          const info = getDueInfo(
                            computeDueDate(selectedRequest),
                            selectedRequest.status,
                          );
                          return (
                            <span className={info.className}>{info.label}</span>
                          );
                        })()}
                      </p>
                    </div>
                  </div>

                  {/* Status & handler */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-gray-500">Current status</p>
                      <p className="mt-1">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            statusStyles[selectedRequest.status] ||
                            statusStyles["Unknown"]
                          }`}
                        >
                          {selectedRequest.status || "Unknown"}
                        </span>
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500">Assigned handler</p>
                      <p className="font-medium text-gray-800 mt-1">
                        {(() => {
                          if (!selectedRequest.assignTo)
                            return "Not yet assigned";
                          const emp = employeeById.get(
                            String(selectedRequest.assignTo),
                          );
                          return emp?.user_name || "Assigned internally";
                        })()}
                      </p>
                    </div>
                  </div>

                  {/* Your original note */}
                  <div>
                    <p className="text-gray-500 mb-1">Your request message</p>
                    <div className="rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-800 whitespace-pre-wrap">
                      {selectedRequest.notes ||
                        "No additional message provided."}
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <DSARMessages dsarId={selectedRequest._id} role="user" />
                </>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-3 border-t border-gray-100 flex justify-end items-center">
              {!showMessages ? (
                <>
                  {/* Left: switch to chat */}
                  {/* <button
                    className="p-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100"
                    onClick={() => setShowMessages(true)}
                  >
                    Send message to Assignee
                  </button> */}
                  <button
                    className="border border-[#2B245C] rounded-lg px-4 py-2 text-sm font-medium text-[#2B245C] hover:bg-blue-50"
                    onClick={closeModal}
                  >
                    Close
                  </button>
                </>
              ) : (
                <>
                  {/* In chat mode: Back + Close btns */}
                  <button
                    className="p-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-100"
                    onClick={() => setShowMessages(false)}
                  >
                    ⬅ Back to request
                  </button>
                  <button
                    className="p-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-100"
                    onClick={closeModal}
                  >
                    Close
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserDSARDashboard;
