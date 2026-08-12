// src/pages/admin/scanner/dsar/assignee/[dsarId]/subtasks.js
import React, { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/router";
import CustomAxios from "@/config/CustomAxios";
import { baseurl, initURL } from "@/config/config";
import { toast } from "react-toastify";
import { IoSpeedometer } from "react-icons/io5";
import { FaTableList } from "react-icons/fa6";
const apiPrefix = process.env.NEXT_PUBLIC_API_PREFIX || `${initURL}`;

// Status styles for subtasks
const subtaskStatusStyles = {
  Pending: "bg-yellow-100 text-yellow-800",
  "In Progress": "bg-blue-100 text-blue-800",
  Completed: "bg-green-100 text-green-800",
  Unknown: "bg-gray-100 text-gray-600",
};

// Status options (for filter dropdown)
const SUBTASK_STATUS_OPTIONS = ["Pending", "In Progress", "Completed"];

// Deadline (label + color)
function getSubtaskDueInfo(dueDateStr, status) {
  if (!dueDateStr) {
    return { label: "-", className: "text-gray-500" };
  }

  const dueDate = new Date(dueDateStr);
  if (isNaN(dueDate.getTime())) {
    return { label: "-", className: "text-gray-500" };
  }

  if (status === "Completed") {
    return {
      label: "Completed",
      className: "bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs",
    };
  }

  const today = new Date();
  dueDate.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);

  const diffDays = Math.round((dueDate - today) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return {
      label: "Due today",
      className:
        "bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-medium",
    };
  }

  if (diffDays > 0) {
    return {
      label: `Due in ${diffDays} days`,
      className:
        "bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium",
    };
  }

  return {
    label: `Overdue by ${Math.abs(diffDays)} days`,
    className:
      "bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-semibold",
  };
}

// Format "01/01/2025, 03:11 pm"
const formatDateTime = (value) => {
  if (!value) return "";
  const d = new Date(value);
  if (isNaN(d)) return "";

  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();

  const hours24 = d.getHours();
  const minutes = String(d.getMinutes()).padStart(2, "0");

  let hours12 = hours24 % 12;
  if (hours12 === 0) hours12 = 12;
  const hoursStr = String(hours12).padStart(2, "0");

  const ampm = hours24 >= 12 ? "pm" : "am";

  return `${dd}/${mm}/${yyyy}, ${hoursStr}:${minutes} ${ampm}`;
};

// Get assignee id from a log entry
const getLogAssigneeId = (log) => {
  if (!log) return "";
  const afterAssign = log.after?.assignTo;
  const beforeAssign = log.before?.assignTo;
  const raw = afterAssign || beforeAssign || log.assignTo;
  return raw ? String(raw) : "";
};

// Initial state for create/edit subtask form
const getInitialSubtaskState = () => ({
  title: "",
  note: "",
  assignTo: "",
  deadline: "",
  reminder: "",
  isSubtaskRequired: true,
  progress: "Pending",
});

const SubtaskDashboard = () => {
  const router = useRouter();
  const { dsarId, requestID } = router.query;

  const [subtasks, setSubtasks] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSubtask, setEditingSubtask] = useState(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Tabs: "dashboard" | "activities"
  const [activeTab, setActiveTab] = useState("dashboard");
  // Activities state (for Activities tab)
  const [activities, setActivities] = useState([]);
  const [activitiesLoading, setActivitiesLoading] = useState(false);
  const [activitiesError, setActivitiesError] = useState("");
  // Search & filter state for subtasks
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  // Employee list for "Assign To"
  const [employees, setEmployees] = useState([]);
  // Form state for create/edit subtask
  const [newSubtask, setNewSubtask] = useState(getInitialSubtaskState);

  const requestLabel = requestID || "DSAR Task";

  // Helper – get linked user id from employee
  const getUserIdFromEmployee = (emp) => emp?.user?._id || emp?._id || null;

  // Map userId -> display name
  const employeeNameById = useMemo(() => {
    const map = new Map();
    employees.forEach((e) => {
      const userId = getUserIdFromEmployee(e);
      if (!userId) return;

      const displayName =
        e.user_name || e.name || e.fullName || e.email || "Unknown";
      map.set(String(userId), displayName);
    });
    return map;
  }, [employees]);

  // Get employee name by id
  const getEmployeeName = (assignTo) => {
    const id =
      typeof assignTo === "string" ? assignTo : assignTo?._id || assignTo?.id;
    if (!id) return "Unknown";
    return employeeNameById.get(String(id)) || "Unknown";
  };

  // Filtered & searched subtasks
  const filteredSubtasks = useMemo(() => {
    let list = Array.isArray(subtasks) ? [...subtasks] : [];

    // Search by title + note
    if (search) {
      const q = search.toLowerCase();
      list = list.filter((st) =>
        `${st.title || ""} ${st.note || ""}`.toLowerCase().includes(q),
      );
    }

    // Status filter (Pending / In Progress / Completed)
    if (filterStatus !== "All" && filterStatus !== "Overdue") {
      list = list.filter((st) => st.progress === filterStatus);
    }

    // Overdue filter
    if (filterStatus === "Overdue") {
      list = list.filter((st) => {
        const info = getSubtaskDueInfo(st.deadline, st.progress);
        return typeof info.days === "number" && info.days < 0;
      });
    }

    // sort by due date (overdue → due today → later → completed)
    return list.sort((a, b) => {
      const aInfo = getSubtaskDueInfo(a.deadline, a.progress);
      const bInfo = getSubtaskDueInfo(b.deadline, b.progress);
      const aDays = typeof aInfo.days === "number" ? aInfo.days : 99999;
      const bDays = typeof bInfo.days === "number" ? bInfo.days : 99999;
      return aDays - bDays;
    });
  }, [subtasks, search, filterStatus]);

  // Fetch employees
  useEffect(() => {
    CustomAxios.get(`/${initURL}/apiv1/users`)
      .then((res) => {
        setEmployees(Array.isArray(res.data) ? res.data : []);
      })
      .catch((err) => {
        console.error("Error fetching employees:", err);
      });
  }, []);

  // Fetch DSAR subtasks
  useEffect(() => {
    if (!dsarId) return;

    const fetchSubtasks = async () => {
      setLoading(true);
      setError("");

      try {
        const subRes = await CustomAxios.get(
          `${baseurl}/${initURL}/dsar/${dsarId}/subtasks`,
        );

        const list = Array.isArray(subRes.data) ? subRes.data : [];
        setSubtasks(list);
      } catch (err) {
        console.error("Failed to fetch DSAR subtasks:", err);
        setError("Failed to load subtasks.");
        toast.error("Failed to load subtasks.");
      } finally {
        setLoading(false);
      }
    };

    fetchSubtasks();
  }, [dsarId]);

  // Fetch ALL activities (logs) when Activities tab is opened
  useEffect(() => {
    if (
      activeTab !== "activities" ||
      !dsarId ||
      subtasks.length === 0 ||
      activities.length > 0 || // already loaded once
      activitiesLoading
    ) {
      return;
    }

    const fetchAllActivities = async () => {
      try {
        setActivitiesLoading(true);
        setActivitiesError("");

        const allLogsArrays = await Promise.all(
          subtasks.map(async (st) => {
            try {
              const res = await CustomAxios.get(
                `${baseurl}/${initURL}/dsar/${dsarId}/subtasks/${st._id}/logs`,
              );
              const logs = Array.isArray(res.data) ? res.data : [];

              // Map logs to UI activities
              return logs.map((log) => {
                const logAssigneeId = getLogAssigneeId(log);
                const assigneeName =
                  (logAssigneeId &&
                    (employeeNameById.get(String(logAssigneeId)) ||
                      logAssigneeId)) ||
                  "Unassigned";

                const changes = [];

                if (log.before && log.after) {
                  if (log.before.title !== log.after.title) {
                    const beforeTitle = log.before.title || "-";
                    const afterTitle = log.after.title || "-";
                    changes.push(`Title: "${beforeTitle}" → "${afterTitle}"`);
                  }

                  if (log.before.note !== log.after.note) {
                    changes.push("Description / Note updated");
                  }

                  if (log.before.progress !== log.after.progress) {
                    const beforeStatus = log.before.progress || "-";
                    const afterStatus = log.after.progress || "-";
                    changes.push(`Status: ${beforeStatus} → ${afterStatus}`);
                  }

                  if (log.before.deadline !== log.after.deadline) {
                    const beforeD = log.before.deadline
                      ? new Date(log.before.deadline).toLocaleDateString()
                      : "-";
                    const afterD = log.after.deadline
                      ? new Date(log.after.deadline).toLocaleDateString()
                      : "-";
                    changes.push(`Deadline: ${beforeD} → ${afterD}`);
                  }

                  if (log.before.reminder !== log.after.reminder) {
                    const beforeR = log.before.reminder
                      ? new Date(log.before.reminder).toLocaleDateString()
                      : "-";
                    const afterR = log.after.reminder
                      ? new Date(log.after.reminder).toLocaleDateString()
                      : "-";
                    changes.push(`Reminder: ${beforeR} → ${afterR}`);
                  }

                  if (log.before.assignTo !== log.after.assignTo) {
                    changes.push("Assignee changed");
                  }
                }

                const message =
                  changes.length > 0
                    ? changes.join(" | ")
                    : log.description || "No additional details.";

                return {
                  _id: log._id || `${st._id}-${log.createdAt}`,
                  subtaskTitle: st.title,
                  assigneeName: assigneeName,
                  action: log.action || "",
                  message,
                  createdAt: log.createdAt,
                };
              });
            } catch (err) {
              console.error("Failed to fetch logs for subtask:", st._id, err);
              return [];
            }
          }),
        );

        const merged = allLogsArrays.flat();

        // Sort newest first
        merged.sort((a, b) => {
          const da = new Date(a.createdAt || 0).getTime();
          const db = new Date(b.createdAt || 0).getTime();
          return db - da;
        });

        setActivities(merged);
      } catch (err) {
        console.error("Failed to fetch activities:", err);
        setActivitiesError("Failed to load activities.");
        toast.error("Failed to load activities.");
      } finally {
        setActivitiesLoading(false);
      }
    };

    fetchAllActivities();
  }, [
    activeTab,
    dsarId,
    subtasks,
    activities.length,
    activitiesLoading,
    employeeNameById,
  ]);

  // Open modal in CREATE mode
  const handleOpenModal = () => {
    setEditingSubtask(null);
    setNewSubtask(getInitialSubtaskState());
    setIsModalOpen(true);
  };

  // Open modal in EDIT mode
  const handleOpenEditModal = (subtask) => {
    const assigneeId =
      typeof subtask.assignTo === "string"
        ? subtask.assignTo
        : subtask.assignTo?._id || subtask.assignTo?.id || "";

    setEditingSubtask(subtask);

    setNewSubtask({
      title: subtask.title || "",
      note: subtask.note || "",
      assignTo: assigneeId,
      deadline: subtask.deadline
        ? new Date(subtask.deadline).toISOString().slice(0, 10)
        : "",
      reminder: subtask.reminder
        ? new Date(subtask.reminder).toISOString().slice(0, 10)
        : "",
      isSubtaskRequired:
        typeof subtask.isSubtaskRequired === "boolean"
          ? subtask.isSubtaskRequired
          : true,
      progress: subtask.progress || "Pending",
    });

    setIsModalOpen(true);
  };

  // Close modal
  const handleCloseModal = () => {
    if (saving) return;
    setIsModalOpen(false);
    setEditingSubtask(null);
  };

  // Handle form input changes
  const handleNewSubtaskChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewSubtask((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // CREATE or UPDATE subtask
  const handleSaveSubtask = async () => {
    if (!newSubtask.title.trim()) {
      toast.error("Please enter a subtask title.");
      return;
    }
    if (!newSubtask.assignTo) {
      toast.error("Please select an assignee.");
      return;
    }
    if (!newSubtask.deadline) {
      toast.error("Please select a deadline.");
      return;
    }

    const basePayload = {
      title: newSubtask.title.trim(),
      assignTo: newSubtask.assignTo,
      isSubtaskRequired: newSubtask.isSubtaskRequired,
      note: newSubtask.note.trim(),
      deadline: new Date(newSubtask.deadline).toISOString(),
      reminder: newSubtask.reminder
        ? new Date(newSubtask.reminder).toISOString()
        : null,
      progress: newSubtask.progress || "Pending",
    };

    try {
      setSaving(true);

      if (editingSubtask) {
        // UPDATE
        const subtaskId = editingSubtask._id;
        await CustomAxios.patch(
          `${baseurl}/${initURL}/dsar/${dsarId}/subtasks/${subtaskId}`,
          basePayload,
        );

        setSubtasks((prev) =>
          prev.map((st) =>
            st._id === subtaskId ? { ...st, ...basePayload } : st,
          ),
        );
        toast.success("Subtask updated.");
      } else {
        // CREATE
        const res = await CustomAxios.post(
          `${baseurl}/${initURL}/dsar/${dsarId}/subtasks`,
          basePayload,
        );

        const created = res.data || basePayload;
        setSubtasks((prev) => [...prev, created]);
        toast.success("Subtask created.");
      }

      setIsModalOpen(false);
      setEditingSubtask(null);
      setActivities([]); // clear so Activities tab reloads
    } catch (err) {
      console.error("Failed to save subtask:", err);
      toast.error("Failed to save subtask. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  // Delete subtask
  const handleDeleteSubtask = async (subtaskId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this subtask?",
    );
    if (!confirmed) return;

    try {
      // Call API to delete
      await CustomAxios.delete(
        `${baseurl}/${initURL}/dsar/${dsarId}/subtasks/${subtaskId}`,
      );
      // Remove from local state
      setSubtasks((prev) => prev.filter((st) => st._id !== subtaskId));
      // Optional: clear activities so Activities tab reloads fresh next time
      setActivities([]);
      toast.success("Subtask deleted.");
    } catch (err) {
      console.error("Failed to delete subtask:", err);
      toast.error("Failed to delete subtask. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 px-4 py-10">
        <div className="flex items-center justify-center">
          <div className="inline-block h-10 w-10 animate-spin rounded-full border-4 border-gray-300 border-t-transparent" />
          <span className="ml-3 text-gray-600 text-sm">
            Loading subtasks...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 px-4 py-5">
      <div className="mx-2 min-h-screen bg-white rounded-lg p-5">
        <div className="px-6 py-8 bg-[#2B245C] rounded-2xl shadow-lg hover:shadow-2xl transition-shadow duration-300">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-semibold text-cyan-50">Subtasks</h1>
              <p className="text-sm text-white mt-1">
                Manage subtasks for Request ID:{" "}
                <span className="font-semibold text-cyan-100">
                  {requestLabel}
                </span>
              </p>
            </div>

            <button
              onClick={handleOpenModal}
              className="rounded-lg bg-white text-[#2B245C] px-6 py-2.5 text-sm font-semibold shadow-md hover:shadow-lg hover:bg-gray-50 transition-all"
            >
              + Create Subtask
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="my-4 border-b border-gray-200">
          <div className="inline-flex font-medium bg-[#f5f7fb] rounded-t-lg border border-gray-200 overflow-hidden">
            {/* Dashboard tab */}
            <button
              onClick={() => setActiveTab("dashboard")}
              className={`flex items-center gap-1 px-5 py-2 text-sm border-b-2 transition-all
              ${
                activeTab === "dashboard"
                  ? "bg-white text-blue-600 border-blue-500 shadow-sm"
                  : "bg-[#f5f7fb] text-gray-600 border-transparent hover:bg-gray-100"
              }
            `}
            >
              {/* icon */}
              <span
                className={`inline-flex h-7 w-7 items-center justify-center rounded-sm text-base
                ${activeTab === "dashboard" ? "text-blue-600" : "text-gray-500"}
              `}
              >
                <IoSpeedometer size={18} />
              </span>
              <span>Dashboard</span>
            </button>

            {/* Activities tab */}
            <button
              onClick={() => setActiveTab("activities")}
              className={`flex items-center gap-1 px-5 py-2 text-sm border-b-2 transition-all
              ${
                activeTab === "activities"
                  ? "bg-white text-blue-600 border-blue-500 shadow-sm"
                  : "bg-[#f5f7fb] text-gray-600 border-transparent hover:bg-gray-100"
              }
            `}
            >
              {/* icon */}
              <span
                className={`inline-flex h-5 w-5 items-center justify-center rounded-sm text-base
                ${
                  activeTab === "activities" ? "text-blue-600" : "text-gray-500"
                }
              `}
              >
                <FaTableList size={15} />
              </span>
              <span>Activities</span>
            </button>
          </div>
        </div>

        {/* Error banner */}
        {error && activeTab === "dashboard" && (
          <div className="mb-4 mx-auto max-w-2xl rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* DASHBOARD TAB */}
        {activeTab === "dashboard" && (
          <>
            {/* Search & Filters for Subtasks */}
            {activeTab === "dashboard" && (
              <div className="w-full my-5 px-5 py-3 border border-[#2B245C] rounded-lg">
                <div className="flex flex-wrap gap-3 w-full">
                  <input
                    type="text"
                    placeholder="Search by title, description..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="border border-gray-300 rounded-md px-3 py-2 text-sm"
                  />

                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="border border-gray-300 rounded-md px-3 py-2 text-sm"
                  >
                    <option value="All">All</option>
                    <option value="Overdue">Only Overdue</option>
                    {SUBTASK_STATUS_OPTIONS.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            <section className="rounded-2xl border border-[#2B245C] bg-white p-6 shadow-lg hover:shadow-2xl transition-shadow duration-300">
              <div className="overflow-auto rounded-lg border border-gray-800">
                <table className="min-w-full text-sm">
                  <thead className="bg-[#2B245C] text-center text-white border-b border-gray-800">
                    <tr>
                      <th className="px-4 py-2 font-medium"> Title</th>
                      <th className="px-4 py-2 font-medium"> Description</th>
                      <th className="px-4 py-2 font-medium"> Assignee</th>
                      <th className="px-4 py-2 font-medium"> Deadline</th>
                      <th className="px-4 py-2 font-medium"> Status</th>
                      <th className="px-4 py-2 font-medium"> Actions</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-gray-100 text-center">
                    {subtasks.length === 0 && !error && (
                      <tr>
                        <td
                          colSpan={6}
                          className="px-6 py-10 text-gray-500 text-sm"
                        >
                          No subtasks found. Click{" "}
                          <span className="font-medium">Create Subtask</span> to
                          add one.
                        </td>
                      </tr>
                    )}

                    {/* Some subtasks exist but filters/search remove all */}
                    {subtasks.length > 0 &&
                      filteredSubtasks.length === 0 &&
                      !error && (
                        <tr>
                          <td
                            colSpan={6}
                            className="px-6 py-10 text-gray-500 text-sm"
                          >
                            No subtasks match your search or filters.
                          </td>
                        </tr>
                      )}

                    {/* Render filtered subtasks */}
                    {filteredSubtasks.length > 0 &&
                      filteredSubtasks.map((st) => {
                        const dueInfo = getSubtaskDueInfo(
                          st.deadline,
                          st.progress,
                        );

                        return (
                          <tr
                            key={st._id}
                            className="hover:bg-gray-50 transition"
                          >
                            <td className="px-6 py-4 font-medium text-gray-800">
                              {st.title}
                            </td>
                            <td className="px-6 py-4 text-gray-600 text-xs max-w-xs">
                              {st.note || "-"}
                            </td>
                            <td className="px-6 py-4 text-gray-700 text-sm">
                              {getEmployeeName(st.assignTo)}
                            </td>

                            {/* Deadline */}
                            <td className="px-6 py-4">
                              <div className="flex flex-col items-center">
                                <span className="text-xs text-gray-500">
                                  {st.deadline
                                    ? new Date(st.deadline).toLocaleDateString()
                                    : "-"}
                                </span>
                                <span className={dueInfo.className}>
                                  {dueInfo.label}
                                </span>
                              </div>
                            </td>

                            {/* Status */}
                            <td className="px-6 py-4 text-gray-700">
                              <span
                                className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                                  subtaskStatusStyles[st.progress] ||
                                  subtaskStatusStyles["Unknown"]
                                }`}
                              >
                                {st.progress || "Unknown"}
                              </span>
                            </td>

                            {/* Actions */}
                            <td className="px-6 py-4">
                              <div className="flex items-center justify-center gap-2">
                                <button
                                  onClick={() => handleOpenEditModal(st)}
                                  className="border border-[#2B245C] bg-blue-100 rounded-lg text-[#2B245C] px-4 py-2 text-xs hover:bg-blue-200"
                                >
                                  Edit
                                </button>

                                <button
                                  onClick={() => handleDeleteSubtask(st._id)}
                                  className="border border-red-500 bg-white rounded-lg text-red-500 px-4 py-2 text-xs hover:bg-red-50"
                                >
                                  Delete
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            </section>
          </>
        )}

        {/* ACTIVITIES TAB */}
        {activeTab === "activities" && (
          <section className="mt-5 rounded-2xl border border-[#2B245C] bg-white p-6 shadow-lg hover:shadow-2xl transition-shadow duration-300">
            {activitiesLoading && (
              <div className="flex items-center justify-center py-10">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-transparent" />
                <span className="ml-3 text-gray-600 text-xs">
                  Loading activities...
                </span>
              </div>
            )}

            {!activitiesLoading && activitiesError && (
              <div className="rounded-md border border-red-200 bg-red-50 p-3 text-xs text-red-700">
                {activitiesError}
              </div>
            )}

            {!activitiesLoading &&
              !activitiesError &&
              activities.length === 0 && (
                <p className="text-xs text-gray-500 p-5">
                  No activities found for this DSAR yet.
                </p>
              )}

            {!activitiesLoading &&
              !activitiesError &&
              activities.length > 0 && (
                <div className="overflow-auto rounded-lg border border-gray-800">
                  <table className="min-w-full text-sm">
                    <thead className="bg-[#2B245C] text-left text-white border-b border-gray-800">
                      <tr>
                        <th className="px-4 py-2 font-medium"> Subtask</th>
                        <th className="px-4 py-2 font-medium"> Assignee</th>
                        <th className="px-4 py-2 font-medium"> Action</th>
                        <th className="px-4 py-2 font-medium"> Details</th>
                        <th className="px-4 py-2 font-medium">
                          {" "}
                          Date &amp; Time
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {activities.map((act) => (
                        <tr key={act._id} className="hover:bg-gray-50">
                          <td className="px-5 py-3">{act.subtaskTitle}</td>
                          <td className="px-5 py-3">{act.assigneeName}</td>
                          <td className="px-5 py-3">{act.action}</td>
                          <td className="px-5 py-3">
                            <span className="text-gray-700">{act.message}</span>
                          </td>
                          <td className="px-5 py-3 whitespace-nowrap">
                            {formatDateTime(act.createdAt)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
          </section>
        )}
      </div>

      {/* Modal: Create / Edit Subtask */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          aria-modal="true"
          role="dialog"
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50"
            onClick={handleCloseModal}
          />

          {/* Modal panel */}
          <div
            className="relative bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 p-6"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header with cross button */}
            <div className="flex items-start justify-between mb-4 border-b border-gray-300 pb-3">
              <div>
                <h2 className="text-xl font-semibold text-[#2B245C]">
                  {editingSubtask ? "Edit Subtask" : "Add Subtask"}
                </h2>
                <p className="text-xs text-gray-500 mt-1">
                  For: <span className="font-medium">{requestLabel}</span>
                </p>
              </div>

              <button
                onClick={handleCloseModal}
                className="rounded-md p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100"
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

            {/* Form */}
            <div className="space-y-3 text-sm">
              <div>
                <label className="block text-gray-700 mb-1">
                  Subtask Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  value={newSubtask.title}
                  onChange={handleNewSubtaskChange}
                  placeholder="e.g. Verify identity documents"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-1">
                  Description / Note{" "}
                  <span className="text-gray-400">(Optional)</span>
                </label>
                <textarea
                  name="note"
                  value={newSubtask.note}
                  onChange={handleNewSubtaskChange}
                  rows={3}
                  placeholder="Add more details for this subtask..."
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-1">
                  Assign To <span className="text-red-500">*</span>
                </label>
                <select
                  name="assignTo"
                  value={newSubtask.assignTo}
                  onChange={handleNewSubtaskChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Select user...</option>
                  {employees.map((emp) => {
                    const userId = getUserIdFromEmployee(emp);
                    if (!userId) return null;

                    return (
                      <option key={userId} value={userId}>
                        {emp.user_name}
                      </option>
                    );
                  })}
                </select>
              </div>

              <div>
                <label className="block text-gray-700 mb-1">
                  Status <span className="text-red-500">*</span>
                </label>
                <select
                  name="progress"
                  value={newSubtask.progress}
                  onChange={handleNewSubtaskChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="Pending">Pending</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-700 mb-1">
                    Deadline <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    name="deadline"
                    value={newSubtask.deadline}
                    onChange={handleNewSubtaskChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 mb-1">
                    Reminder <span className="text-gray-400">(Optional)</span>
                  </label>
                  <input
                    type="date"
                    name="reminder"
                    value={newSubtask.reminder}
                    onChange={handleNewSubtaskChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="flex items-center mt-1">
                <input
                  type="checkbox"
                  name="isSubtaskRequired"
                  checked={newSubtask.isSubtaskRequired}
                  onChange={handleNewSubtaskChange}
                  className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
                />
                <span className="ml-2 text-xs text-gray-700">
                  This subtask is required to complete the DSAR.
                </span>
              </div>
            </div>

            {/* Footer buttons */}
            <div className="mt-5 flex justify-end gap-2 text-sm">
              <button
                onClick={handleCloseModal}
                disabled={saving}
                className="border border-[#2B245C] rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveSubtask}
                disabled={saving}
                className="rounded-lg bg-[#2B245C] border border-[#2B245C] px-4 py-2 text-sm font-semibold text-white shadow-md hover:shadow-lg hover:bg-opacity-90 disabled:opacity-60 transition-all"
              >
                {saving
                  ? "Saving..."
                  : editingSubtask
                    ? "Save Changes"
                    : "Add Subtask"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubtaskDashboard;
