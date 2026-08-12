import React, { useEffect, useMemo, useState } from "react";
import CustomAxios from "@/config/CustomAxios";
import { baseurl, initURL } from "@/config/config";
import { can, guard } from "@/auth/auth-permissions";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import Cookies from "js-cookie";
import Link from "next/link";
import DSARMessages from "../dsarMessages";

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

const STATUS_OPTIONS = ["Pending", "In Progress", "Completed", "Rejected"];
const CLOSED_STATUSES = ["Completed", "Rejected", "Canceled"];

const DSAR_SLA_DAYS = 30; // SLA days (Usually 1 month under GDPR)

// Calculate due date from createdAt or use backend dueDate
function computeDueDate(req) {
  if (req.dueDate) return req.dueDate; // backend-provided wins
  if (!req.createdAt) return null;

  const d = new Date(req.createdAt);
  if (isNaN(d.getTime())) return null;

  d.setDate(d.getDate() + DSAR_SLA_DAYS);
  return d.toISOString();
}

// Return label + style for SLA (due/overdue/closed)
function getDueInfo(dueDateStr, status) {
  if (!dueDateStr) {
    return { label: "-", days: null, className: "text-gray-500" };
  }

  const dueDate = new Date(dueDateStr);
  if (isNaN(dueDate.getTime())) {
    return { label: "-", days: null, className: "text-gray-500" };
  }

  if (CLOSED_STATUSES.includes(status)) {
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

const AssigneeDSARDashbaord = () => {
  const router = useRouter();

  const [allRequests, setAllRequests] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  // Modal states
  const [editingRequest, setEditingRequest] = useState(null);
  // Show Message view in modal
  const [showMessages, setShowMessages] = useState(false);
  const [updateForm, setUpdateForm] = useState({
    status: "",
    notes: "",
  });

  // Permissions
  const canView = can("privacy.read");
  const canUpdate = can("privacy.update");

  // Read logged-in user from cookies
  const rawUser =
    Cookies.get("user_data") || Cookies.get("user") || Cookies.get("auth_user");

  // Parse current user (memoized)
  const currentUser = useMemo(() => {
    if (!rawUser) return null;
    try {
      return JSON.parse(rawUser);
    } catch {
      return null;
    }
  }, [rawUser]);

  // Try different possible id fields (memoized)
  const currentUserId = useMemo(() => {
    if (!currentUser) return null;
    return (
      currentUser?.user?._id ||
      currentUser?._id ||
      currentUser?.id ||
      currentUser?.user_id ||
      null
    );
  }, [currentUser]);

  // Fetch requests from the backend
  useEffect(() => {
    const fetchDSARs = async () => {
      if (!currentUserId) {
        setLoading(false);
        return;
      }

      try {
        const response = await CustomAxios.get(`${baseurl}/${initURL}/dsar`);
        setAllRequests(Array.isArray(response.data) ? response.data : []);
      } catch (err) {
        setError("Failed to fetch DSAR requests.");
        toast.error("Failed to load DSAR requests.");
      } finally {
        setLoading(false);
      }
    };

    fetchDSARs();
  }, [currentUserId]);

  // Fetch employee list (to map current user → employee record)
  useEffect(() => {
    CustomAxios.get(`/${initURL}/apiv1/users/db`)
      .then((res) => {
        const list = Array.isArray(res.data?.data) ? res.data.data : [];
        setEmployees(list);
      })
      .catch((err) => {
        console.error("Error fetching employees:", err);
      });
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, filterStatus]);

  // Find employee record for current user (by email or id)
  const myEmployee = useMemo(() => {
    if (!currentUser) return null;
    const email = currentUser.email;

    if (email) {
      const matchByEmail = employees.find((e) => e.email === email);
      if (matchByEmail) return matchByEmail;
    }

    if (currentUserId) {
      const matchById = employees.find(
        (e) => String(e._id) === String(currentUserId),
      );
      if (matchById) return matchById;
    }

    return null;
  }, [employees, currentUser, currentUserId]);

  // employee id used in assignTo
  const myAssigneeId = myEmployee?._id || null;

  // Build list of requests assigned to this user (with filters + sort) – memoized
  const myRequests = useMemo(() => {
    if (!myAssigneeId) return [];

    let list = allRequests.filter(
      (req) => String(req.assignTo) === String(myAssigneeId),
    );

    // Search filter
    if (search) {
      const q = search.toLowerCase();
      list = list.filter((req) =>
        `${req.fullName} ${req.email} ${req.requestID}`
          .toLowerCase()
          .includes(q),
      );
    }

    // Status filter
    if (filterStatus !== "All" && filterStatus !== "Overdue") {
      list = list.filter((req) => req.status === filterStatus);
    }

    // Overdue filter
    if (filterStatus === "Overdue") {
      list = list.filter((req) => {
        const info = getDueInfo(computeDueDate(req), req.status);
        return typeof info.days === "number" && info.days < 0;
      });
    }

    // Sort: overdue first → then due today → then due later → then closed
    return [...list].sort((a, b) => {
      const aInfo = getDueInfo(computeDueDate(a), a.status);
      const bInfo = getDueInfo(computeDueDate(b), b.status);
      const aDays = typeof aInfo.days === "number" ? aInfo.days : 99999;
      const bDays = typeof bInfo.days === "number" ? bInfo.days : 99999;
      return aDays - bDays;
    });
  }, [allRequests, myAssigneeId, search, filterStatus]);

  // pagination calculations
  const totalPages = Math.ceil(myRequests.length / rowsPerPage);

  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;

  const currentRows = myRequests.slice(indexOfFirstRow, indexOfLastRow);

  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  // Modal handlers
  const handleStartEdit = (req) => {
    setEditingRequest(req);
    setUpdateForm({
      status: req.status || STATUS_OPTIONS[0],
      notes: req.notes || "",
    });
  };

  const closeModal = () => {
    setEditingRequest(null);
    setShowMessages(false);
  };

  // Update form field values
  const handleUpdateChange = (e) => {
    const { name, value } = e.target;
    setUpdateForm((prev) => ({ ...prev, [name]: value }));
  };

  // Save status/notes changes to backend and update UI
  const handleSave = async () => {
    if (!editingRequest) return;
    try {
      const payload = {
        status: updateForm.status || editingRequest.status,
        notes: updateForm.notes ?? editingRequest.notes ?? "",
      };

      await CustomAxios.patch(
        `${baseurl}/${initURL}/dsar/${editingRequest._id}`,
        payload,
      );

      setAllRequests((prev) =>
        prev.map((req) =>
          req._id === editingRequest._id ? { ...req, ...payload } : req,
        ),
      );

      setEditingRequest(null);
      toast.success("DSAR request updated successfully!");
    } catch (error) {
      console.error(
        "Error saving DSAR:",
        error.response?.data || error.message,
      );
      toast.error("Failed to save DSAR request.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="mx-5 min-h-screen bg-white rounded-lg p-5 my-3">
        {/* HEADER */}
        <div className="px-6 py-8 bg-[#2B245C] rounded-2xl shadow-lg hover:shadow-2xl transition-shadow duration-300">
          <h1 className="text-3xl font-bold text-cyan-50">My DSAR Tasks</h1>

          <p className="text-sm text-white mt-1">
            View and update the DPRMs assigned to you.
          </p>
        </div>

        {/* SEARCH & FILTERS */}
        <div className="w-full my-5 p-5 border border-[#2B245C] rounded-lg">
          <div className="flex flex-wrap items-center justify-between gap-3 w-full">
            <div className="flex flex-wrap gap-3">
              <input
                type="text"
                placeholder="Search by name, email, request ID..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-80 border border-gray-300 rounded-lg px-3 py-2 text-sm"
              />

              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
              >
                <option value="All">All</option>
                <option value="Overdue">Only Overdue</option>
                {STATUS_OPTIONS.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
            </div>

            <div className="text-sm font-medium text-gray-600 whitespace-nowrap">
              Total Requests:{" "}
              <span className="font-bold text-[#2B245C]">
                {myRequests.length}
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
                  <th className="px-4 py-2 font-medium">Request ID</th>
                  <th className="px-4 py-2 font-medium"> User</th>
                  <th className="px-4 py-2 font-medium">Type(s)</th>
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
                      colSpan={7}
                      className="px-4 py-5 text-center text-red-600 font-medium"
                    >
                      You don’t have permission to view DPRM requests.
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
                    <td colSpan={7} className="px-6 py-5">
                      <div className="mx-auto max-w-lg rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                        {error}
                      </div>
                    </td>
                  </tr>
                ) : myRequests.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-5">
                      <p className="text-sm text-gray-500">
                        No DPRM requests assigned to you.
                      </p>
                    </td>
                  </tr>
                ) : (
                  currentRows.map((req) => {
                    const computedDue = computeDueDate(req);
                    const dueInfo = getDueInfo(computedDue, req.status);
                    const createdDate = req.createdAt
                      ? new Date(req.createdAt).toLocaleDateString()
                      : "-";
                    const dueDateLabel = computedDue
                      ? new Date(computedDue).toLocaleDateString()
                      : "-";

                    return (
                      <tr key={req._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 font-medium">
                          <Link
                            href={{
                              pathname: `/admin/scanner/dsar/assignee/${req._id}/subtasks`,
                              query: { requestID: req.requestID || "" },
                            }}
                          >
                            <span className="text-blue-700 hover:underline">
                              {req.requestID || "-"}
                            </span>
                          </Link>
                        </td>

                        <td className="px-6 py-4">
                          <div>{req.fullName}</div>
                          <div className="text-xs text-gray-500">
                            {req.email}
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          {Array.isArray(req.requestTypes) &&
                          req.requestTypes.length > 0 ? (
                            req.requestTypes.map((t, i) => (
                              <span
                                key={`${req._id}-type-${i}`}
                                className="inline-block bg-indigo-50 text-indigo-700 px-2 py-1 text-xs rounded mr-1"
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

                        <td className="px-6 py-4">{createdDate}</td>

                        <td className="px-6 py-4">
                          <div className="flex flex-col items-center">
                            <span className="text-xs text-gray-500">
                              {dueDateLabel}
                            </span>
                            <span className={dueInfo.className}>
                              {dueInfo.label}
                            </span>
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          <button
                            className="bg-[#2B245C] text-white px-4 py-2 text-xs rounded-lg hover:bg-opacity-90"
                            onClick={() =>
                              guard(canUpdate, router, () =>
                                handleStartEdit(req),
                              )
                            }
                          >
                            View / Update
                          </button>
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
                className="border rounded-md px-2 py-1"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
            </div>

            {/* Showing */}
            <div className="text-sm text-gray-600">
              Showing {myRequests.length === 0 ? 0 : indexOfFirstRow + 1}-
              {Math.min(indexOfLastRow, myRequests.length)} of{" "}
              {myRequests.length}
            </div>

            {/* Prev / Next */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="rounded-lg bg-[#2B245C] text-white px-3 py-2 text-sm disabled:opacity-50"
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
                className="rounded-lg bg-[#2B245C] text-white px-3 py-2 text-sm disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        </section>
      </div>

      {/* MODAL: View / Update */}
      {editingRequest && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          aria-modal="true"
          role="dialog"
          aria-labelledby="dsar-edit-modal-title"
          tabIndex={-1}
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
              h-[495px]            
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
            <div className="p-6 pb-3 flex items-start justify-between border-b border-gray-100 bg-[#2B245C] rounded-t-xl">
              <div>
                <h2
                  id="dsar-edit-modal-title"
                  className="text-xl font-semibold text-cyan-50"
                >
                  Update DPRM Request
                </h2>
                <p className="text-sm text-white mt-1">
                  Request ID:{" "}
                  <span className="font-medium">
                    {editingRequest.requestID || editingRequest._id}
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

            {/* Precomputed due info for modal */}
            {(() => {
              const computedDue = computeDueDate(editingRequest);
              const dueDateLabel = computedDue
                ? new Date(computedDue).toLocaleDateString()
                : "-";
              const info = getDueInfo(
                computedDue,
                updateForm.status || editingRequest.status,
              );

              return (
                <>
                  {/* Body */}
                  <div className="px-6 pt-4 pb-2 flex-1 overflow-y-auto space-y-4 text-sm">
                    {!showMessages ? (
                      <>
                        {/* 🔹 NORMAL DSAR UPDATE VIEW (your existing content) */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <p className="text-gray-500">User</p>
                            <p className="font-medium text-gray-800">
                              {editingRequest.fullName || "-"}
                            </p>
                            <p className="text-xs text-gray-500">
                              {editingRequest.email || "-"}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-500">Request Types</p>
                            <div className="mt-1">
                              {Array.isArray(editingRequest.requestTypes) &&
                              editingRequest.requestTypes.length > 0 ? (
                                editingRequest.requestTypes.map((type, i) => (
                                  <span
                                    key={`${editingRequest._id}-detail-type-${i}`}
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

                        {/* Due info */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <p className="text-gray-500">Due date</p>
                            <p className="font-medium text-gray-800">
                              {(() => {
                                const computedDue =
                                  computeDueDate(editingRequest);
                                return computedDue
                                  ? new Date(computedDue).toLocaleDateString()
                                  : "-";
                              })()}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-500">Due status</p>
                            <p className="mt-1">
                              {(() => {
                                const computedDue =
                                  computeDueDate(editingRequest);
                                const info = getDueInfo(
                                  computedDue,
                                  updateForm.status || editingRequest.status,
                                );
                                return (
                                  <span className={info.className}>
                                    {info.label}
                                  </span>
                                );
                              })()}
                            </p>
                          </div>
                        </div>

                        {/* Status */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Status
                          </label>
                          <select
                            name="status"
                            value={updateForm.status}
                            onChange={handleUpdateChange}
                            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                          >
                            {STATUS_OPTIONS.map((st) => (
                              <option key={st} value={st}>
                                {st}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Notes */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Internal Notes / Resolution
                          </label>
                          <textarea
                            name="notes"
                            value={updateForm.notes}
                            onChange={handleUpdateChange}
                            rows={3}
                            placeholder="Add details about how you handled this request..."
                            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                          />
                        </div>
                      </>
                    ) : (
                      <>
                        {/* 🔹 MESSAGE VIEW */}
                        <DSARMessages
                          dsarId={editingRequest._id}
                          role="assignee"
                        />
                      </>
                    )}
                  </div>
                </>
              );
            })()}

            {/* Footer */}
            <div className="px-6 py-3 border-t border-gray-100 flex justify-end items-center">
              {!showMessages ? (
                <>
                  {/* Left: switch to chat */}
                  {/* <button
                    className="p-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100"
                    onClick={() => setShowMessages(true)}
                  >
                    Send message to User
                  </button> */}

                  {/* Right: normal actions */}
                  <div className="flex gap-2">
                    <button
                      className="border border-[#2B245C] rounded-lg px-4 py-2 text-sm font-medium text-[#2B245C] hover:bg-blue-50"
                      onClick={closeModal}
                    >
                      Cancel
                    </button>
                    <button
                      className="rounded-lg bg-[#2B245C] border border-[#2B245C] px-4 py-2 text-sm font-semibold text-white shadow-md hover:shadow-lg hover:bg-opacity-90 disabled:opacity-60 transition-all"
                      onClick={() => guard(canUpdate, router, handleSave)}
                    >
                      Save changes
                    </button>
                  </div>
                </>
              ) : (
                <>
                  {/* In chat mode: Back + Close */}
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

export default AssigneeDSARDashbaord;
