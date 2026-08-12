import React, { useState, useEffect } from "react";
import { baseurl, initURL } from "@/config/config";
import CustomAxios from "@/config/CustomAxios";
import Loader from "@/components/ui/Loader";
import Dialog from "@/components/ui/Dialog";
import { FaEdit } from "react-icons/fa";
import { MdDelete, MdOutlineAssignmentTurnedIn } from "react-icons/md";
import { toast } from "react-toastify";
import TaskAssignmentModal from "./TaskAssignmentModal";
import Cookies from "js-cookie";
import sendNotification from "@/utils/Notifications/Notification";
import { can, guard } from "@/auth/auth-permissions";
import { useRouter } from "next/router";

// Small UI Components
const StatusBadge = ({ name }) => {
  const s = (name || "N/A").toUpperCase();

  const color =
    s === "TO DO"
      ? "text-blue-600 bg-blue-100"
      : s === "IN PROGRESS"
        ? "text-yellow-600 bg-yellow-100"
        : s === "DONE" || s === "COMPLETED"
          ? "text-green-600 bg-green-100"
          : s === "ON HOLD"
            ? "text-orange-600 bg-orange-100"
            : "text-gray-600 bg-gray-100";

  return (
    <span
      className={`text-xs text-center font-semibold py-2 px-3 rounded-full inline-block whitespace-nowrap ${color}`}
    >
      {name || "N/A"}
    </span>
  );
};

const PriorityBadge = ({ name }) => {
  const p = (name || "N/A").toUpperCase();

  const color =
    p === "HIGH"
      ? "text-red-600"
      : p === "MEDIUM"
        ? "text-yellow-600"
        : p === "LOW"
          ? "text-green-600"
          : "text-gray-600";

  return (
    <span className={`text-xs font-semibold ${color}`}>{name || "N/A"}</span>
  );
};

// Main Component

export default function TaskList() {
  const router = useRouter();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // For assignment modal
  const [selectedTask, setSelectedTask] = useState(null);
  const [employees, setEmployees] = useState([]);
  // For edit modal
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editTaskData, setEditTaskData] = useState(null);
  // assignment modal state
  const [isAssignOpen, setIsAssignOpen] = useState(false);
  const [assignmentLoading, setAssignmentLoading] = useState(false);
  const [existingAssignment, setExistingAssignment] = useState(null);
  // pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Permissions
  const canView = can("management_hub.read");
  const canCreate = can("management_hub.create");
  const canDelete = can("management_hub.delete");
  const canEdit = can("management_hub.update");

  const stored = Cookies.get("user_data");
  const userData = stored ? JSON.parse(stored) : {};

  const userRoles = Array.isArray(userData.roles) ? userData.roles : [];
  const isAdmin =
    userRoles.includes("SUPER_ADMIN") || userRoles.includes("ADMIN");

  // keep role fallback for submit flow
  const role = userData.user_designation || userRoles[0] || "";

  // Determine which resource to hit
  const resource = isAdmin ? "tasks" : "assignments";

  // submission modal
  const [isSubmitOpen, setIsSubmitOpen] = useState(false);
  const [submitComment, setSubmitComment] = useState("");
  const [submitFile, setSubmitFile] = useState(null);
  // at the top, alongside your other useState calls
  const [isAssignmentsModalOpen, setIsAssignmentsModalOpen] = useState(false);
  const [assignmentsToShow, setAssignmentsToShow] = useState([]);

  // handlers
  const openAssignmentsModal = (task) => {
    setAssignmentsToShow(task.assignments || []);
    setIsAssignmentsModalOpen(true);
  };
  const closeAssignmentsModal = () => {
    setIsAssignmentsModalOpen(false);
    setAssignmentsToShow([]);
  };

  // Open submit modal:
  const openSubmit = (task) => {
    setSelectedTask(task);
    setSubmitComment("");
    setSubmitFile(null);
    setIsSubmitOpen(true);
  };

  const closeSubmit = () => {
    setIsSubmitOpen(false);
    setSelectedTask(null);
    setSubmitComment("");
    setSubmitFile(null);
  };

  // Submit handler:
  const handleSubmitAssignment = async () => {
    if (!selectedTask) return toast.error("No task selected");

    try {
      const id = selectedTask._id;
      let url, payload, config;

      switch (role) {
        case "Employee":
          if (!submitFile) {
            return toast.error("Please add a file before submitting");
          }
          url = `${baseurl}/${initURL}/assignments/${id}/assign/upload`;
          payload = new FormData();
          payload.append("file", submitFile);
          payload.append("comment", submitComment);
          config = { headers: { "Content-Type": "multipart/form-data" } };
          await CustomAxios.post(url, payload, config);
          break;

        case "Approver":
          url = `${baseurl}/${initURL}/assignments/${id}/approve`;
          await CustomAxios.post(url, { comment: submitComment });
          break;

        case "Reviewer":
          url = `${baseurl}/${initURL}/assignments/${id}/review`;
          await CustomAxios.post(url, { comment: submitComment });
          break;

        case "Supervisor":
          url = `${baseurl}/${initURL}/assignments/${id}/supervise`;
          await CustomAxios.post(url, { comment: submitComment });
          break;

        default:
          return toast.error("You cannot submit on this task");
      }

      toast.success("Submitted successfully!");
      closeSubmit();
    } catch (err) {
      toast.error(err.response?.data?.message || "Submission failed");
    }
  };

  /** fetch tasks & employees **/
  useEffect(() => {
    // const fetchEmployees = async () => {
    //   try {
    //     const { data } = await CustomAxios.post(
    //       `${baseurl}/${initURL}/tisax-team-assignment/get-employees`,
    //       {
    //         user_designations: [
    //           "Employee",
    //           "Reviewer",
    //           "Assigner",
    //           "Approver",
    //           "Contributor",
    //           "Supervisor",
    //           "Creator",
    //         ],
    //       },
    //     );
    //     setEmployees(data.data || []);
    //   } catch (err) {
    //     toast.error(err.response?.data?.message || "Failed to fetch employees");
    //   }
    // };

    const fetchEmployees = async () => {
      try {
        const res = await CustomAxios.get(
          `/${initURL}/apiv1/users/db?page=1&limit=1000`,
        );
        const allUsers = res.data?.data || [];
        setEmployees(allUsers);
      } catch (err) {
        toast.error(err.response?.data?.message || "Failed to fetch employees");
      }
    };

    const fetchTasks = async () => {
      try {
        const { data } = await CustomAxios.get(
          `${baseurl}/${initURL}/${resource}`,
        );
        if (isAdmin) {
          setTasks(data);
        } else {
          const userTasks = data.map((assignment) => assignment.task);
          setTasks(userTasks);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchEmployees();
    fetchTasks();
  }, []);

  if (loading) {
    return (
      <div className="text-center p-4 text-lg font-semibold">
        <Loader />
      </div>
    );
  }

  if (error) {
    return <div className="text-center p-4 text-red-500">Error: {error}</div>;
  }

  /** open/close handlers **/
  const openAssign = async (task) => {
    setSelectedTask(task);
    setAssignmentLoading(true);
    try {
      // NEW: try to load any existing assignment for this task
      const { data } = await CustomAxios.get(
        `${baseurl}/${initURL}/assignments/${task._id}`,
      );
      setExistingAssignment(data);
    } catch (err) {
      // no existing assignment is fine
      setExistingAssignment(null);
    } finally {
      setAssignmentLoading(false);
      setIsAssignOpen(true);
    }
  };
  const closeAssign = () => {
    setIsAssignOpen(false);
    setSelectedTask(null);
    setExistingAssignment(null);
  };

  const handleAssign = async ({ assignmentId, ...payload }) => {
    try {
      // 1️⃣ Create or update the assignment
      if (assignmentId) {
        await CustomAxios.put(
          `${baseurl}/${initURL}/assignments/${assignmentId}`,
          payload,
        );
      } else {
        await CustomAxios.post(`${baseurl}/${initURL}/assignments`, payload);
      }

      // 2️⃣ On success, find the assigned employee’s email
      // const assignedEmp = employees.find((e) => e._id === payload.assignTo);
      const assignedEmp = employees.find(
        (e) => String(e._id) === String(payload.assignTo),
      );
      if (assignedEmp && assignedEmp.email) {
        // 3️⃣ Fire the notification
        sendNotification({
          actionType: "assign",
          payload: {
            // Who to send to
            name: `${assignedEmp.first_name} ${assignedEmp.last_name}`,

            recipientEmail: assignedEmp.email,
            // Assigner info
            //  userId: userData.user_uuid,
            assignedBy: `${userData.user_name}`,
            // Assignment record (if updating)
            //  assignmentId: assignmentId || null,
            // Core task identifiers
            taskId: selectedTask.taskId,
            task: selectedTask.summary,
            description: selectedTask.description,
            moduleName: selectedTask.moduleName,
            category: selectedTask.category,

            // Who it’s for
            // Full task details
            priority: selectedTask.priority,
            status: selectedTask.status,
            startDate: selectedTask.startDate,
            endDate: selectedTask.endDate,
            // Timestamps
            // createdAt: selectedTask.createdAt, // if available
            // updatedAt: selectedTask.updatedAt, // if available
          },
          onSuccess: (data) => console.log("Notification sent:", data),
          onError: (err) => console.error("Notification failed:", err),
        });
      }

      toast.success("Task assigned!");
      closeAssign();
    } catch (err) {
      toast.error(err.response?.data?.message || "Assignment failed");
    }
  };

  if (loading) return <Loader />;
  if (error)
    return <div className="text-center p-4 text-red-500">Error: {error}</div>;

  // define which roles you want in this instance:
  const roles = [
    { key: "assignTo", label: "Assign To" },
    { key: "approver", label: "Approver", designation: "APPROVER" },
    { key: "reviewer", label: "Reviewer", designation: "REVIEWER" },
    { key: "supervisor", label: "Supervisor", designation: "SUPERVISOR" },
  ];

  // Edit modal handlers
  const openEditModal = (task) => {
    setEditTaskData(task);
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setEditTaskData(null);
  };

  const handleEditTaskChange = (e) => {
    const { name, value } = e.target;
    setEditTaskData({
      ...editTaskData,
      [name]: value,
    });
  };

  const handleEditTask = async () => {
    try {
      // Convert priority to lowercase so it matches backend expectations
      const updatedData = {
        ...editTaskData,
        priority: editTaskData.priority.toLowerCase(),
      };

      const endpoint = `${baseurl}/${initURL}/tasks/${editTaskData._id}`;
      const response = await CustomAxios.put(endpoint, { data: updatedData });

      // Update tasks list with updated task
      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task._id === editTaskData._id ? response.data : task,
        ),
      );

      toast.success("Task updated successfully!");
      closeEditModal();
    } catch (error) {
      console.error("Error updating task:", error);

      // Extract error details (assuming error response is structured)
      let errMsg = "Error updating task. Please try again.";
      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        // In case of validation errors, the error message might be an array of errors.
        if (Array.isArray(error.response.data.message)) {
          errMsg = error.response.data.message
            .map((err) => (err.priority ? err.priority : ""))
            .filter(Boolean)
            .join(", ");
        } else {
          errMsg = error.response.data.message;
        }
      }
      toast.error(errMsg);
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (window.confirm("Are you sure you want to delete this task?")) {
      try {
        // Call the API to delete the task
        await CustomAxios.delete(`${baseurl}/${initURL}/tasks/${taskId}`);

        // Remove the deleted task from state
        setTasks((prevTasks) =>
          prevTasks.filter((task) => task.taskId !== taskId),
        );

        // Show success toast notification
        toast.success("Task deleted successfully!");
      } catch (error) {
        console.error("Failed to delete task:", error);

        // Extract a meaningful error message if available
        let errMsg = "Failed to delete task. Please try again.";
        if (
          error.response &&
          error.response.data &&
          error.response.data.message
        ) {
          errMsg = Array.isArray(error.response.data.message)
            ? error.response.data.message.join(", ")
            : error.response.data.message;
        }

        // Show error toast notification
        toast.error(errMsg);
      }
    }
  };

  const handleDownloadFile = async (filePath) => {
    if (!filePath) {
      return toast.error("No file path provided");
    }

    try {
      // POST to match your controller
      const { data } = await CustomAxios.post(
        `${baseurl}/${initURL}/assignments/getsubmittedfile`,
        { filePath },
        { responseType: "blob" },
      );

      const blobUrl = window.URL.createObjectURL(new Blob([data]));
      const link = document.createElement("a");
      link.href = blobUrl;
      // derive a filename if you like:
      const filename = filePath.split("/").pop() || "download";
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      toast.error(err.response?.data?.message || "Download failed");
    }
  };

  // pagination
  const totalPages = Math.ceil(tasks.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const paginatedTasks = tasks.slice(startIndex, endIndex);

  const handleRowsPerPageChange = (e) => {
    setRowsPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  const goToPreviousPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const goToNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  return (
    <div className="px-3 pt-6">
      <div className="overflow-x-auto rounded-lg border border-gray-800">
        <table className="min-w-full text-sm">
          <thead className="bg-[#2B245C] text-left text-white border-b border-gray-800">
            <tr>
              {[
                "Task ID",
                "Summary",
                "Description",
                "Priority",
                "Status",
                "Start Date",
                "End Date",
                "Category",
                "Module Name",
              ].map((hdr) => (
                <th key={hdr} className="px-4 py-2 font-medium">
                  {hdr}
                </th>
              ))}

              {isAdmin && (
                <th className="px-4 py-2 font-medium text-center">Actions</th>
              )}

              {/* NEW: only non-admins see “Submit” */}
              {!isAdmin && <th className="px-4 py-2 font-medium">Action</th>}
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100">
            {!canView ? (
              <tr>
                <td
                  colSpan={10}
                  className="px-6 py-10 text-center text-red-600 font-medium"
                >
                  You don’t have permission to view tasks.
                </td>
              </tr>
            ) : loading ? (
              <tr>
                <td
                  colSpan={10}
                  className="px-4 py-6 text-center text-gray-600"
                >
                  Loading…
                </td>
              </tr>
            ) : paginatedTasks.length === 0 ? (
              <tr>
                <td
                  colSpan={10}
                  className="px-4 py-6 text-center text-gray-600"
                >
                  No tasks yet
                </td>
              </tr>
            ) : (
              paginatedTasks.map((task, idx) => (
                <tr
                  key={task.taskId}
                  className={`text-left ${
                    idx % 2 === 0 ? "bg-white" : "bg-gray-50"
                  } hover:bg-gray-100 transition`}
                >
                  <td className="px-4 py-2 font-medium">{task.taskId}</td>
                  <td className="px-4 py-2 font-semibold text-[#2B245C]">
                    {task.summary}
                  </td>
                  <td className="px-4 py-2">{task.description}</td>
                  <td className="px-4 py-2">
                    <PriorityBadge name={task.priority} />
                  </td>
                  <td className="px-4 py-2">
                    <StatusBadge name={task.status} />
                  </td>
                  <td className="px-4 py-2">
                    {new Date(task.startDate).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-2">
                    {new Date(task.endDate).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-2">{task.category}</td>
                  <td className="px-4 py-2">{task.moduleName}</td>

                  {/* only admin sees these action buttons */}
                  {isAdmin && (
                    <>
                      <td className="px-4 py-2">
                        <div className="flex gap-2 items-center">
                          <button
                            onClick={() => openAssignmentsModal(task)}
                            className="whitespace-nowrap bg-white text-[#2B245C] font-medium border border-[#2B245C] rounded-lg px-2 py-1 hover:bg-blue-50"
                          >
                            View Details
                          </button>

                          <button
                            onClick={() =>
                              guard(canEdit, router, () => openEditModal(task))
                            }
                            className="bg-white text-blue-600 font-medium border border-blue-600 rounded-lg px-2 py-1 hover:bg-blue-50"
                          >
                            Edit
                          </button>

                          <button
                            onClick={() =>
                              guard(canEdit, router, () => openAssign(task))
                            }
                            className="bg-white text-green-600 font-medium border border-green-600 rounded-lg px-2 py-1 hover:bg-green-50"
                          >
                            Assign
                          </button>

                          <button
                            onClick={() =>
                              guard(canDelete, router, () =>
                                handleDeleteTask(task._id),
                              )
                            }
                            className="bg-white text-red-600 font-medium border border-red-600 rounded-lg px-2 py-1 hover:bg-red-50"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </>
                  )}

                  {/* NEW: non-admin “Submit” button */}
                  {!isAdmin && (
                    <td className="px-4 py-2">
                      <button
                        onClick={() =>
                          guard(canEdit || canCreate, router, () =>
                            openSubmit(task),
                          )
                        }
                        className="text-white bg-[#2B245C] border border-[#2B245C] px-2 py-1 rounded-lg hover:bg-opacity-90"
                      >
                        {/* <MdOutlineAssignmentTurnedIn /> */}
                        Submit
                      </button>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Pagination */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-4 py-3 border-t bg-white">
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-700 font-medium">
              Rows per page:
            </label>
            <select
              value={rowsPerPage}
              onChange={handleRowsPerPageChange}
              className="border border-gray-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-[#2B245C]"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
          </div>

          <div className="text-sm text-gray-600">
            Showing {tasks.length === 0 ? 0 : startIndex + 1} to{" "}
            {Math.min(endIndex, tasks.length)} of {tasks.length} entries
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={goToPreviousPage}
              disabled={currentPage === 1}
              className="rounded-lg bg-[#2B245C] text-white px-4 py-2 text-sm font-semibold shadow-md hover:shadow-lg hover:bg-opacity-90 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-200 ease-in-out"
            >
              Prev
            </button>

            <span className="text-sm font-medium text-gray-700">
              Page {totalPages === 0 ? 0 : currentPage} of {totalPages || 0}
            </span>

            <button
              onClick={goToNextPage}
              disabled={currentPage === totalPages || totalPages === 0}
              className="rounded-lg bg-[#2B245C] text-white px-4 py-2 text-sm font-semibold shadow-md hover:shadow-lg hover:bg-opacity-90 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-200 ease-in-out"
            >
              Next
            </button>
          </div>
        </div>

        {/* our new, reusable modal: */}
        <TaskAssignmentModal
          isOpen={isAssignOpen}
          onClose={closeAssign}
          task={selectedTask}
          employees={employees}
          roles={roles}
          onAssign={handleAssign}
          existingAssignment={existingAssignment}
          loading={assignmentLoading}
        />
      </div>

      {/* Edit Modal */}
      <Dialog
        isOpen={isEditModalOpen}
        onClose={closeEditModal}
        title="Edit Task"
        footer={
          <>
            <button
              onClick={closeEditModal}
              className="bg-white border border-[#2B245C] text-[#2B245C] text-sm font-medium px-4 py-2 rounded-md hover:bg-blue-50 transition"
            >
              Cancel
            </button>
            <button
              onClick={handleEditTask}
              className="bg-[#2B245C] border border-[#2B245C] text-white text-sm font-medium px-4 py-2 rounded-md hover:bg-opacity-90 transition"
            >
              Save Changes
            </button>
          </>
        }
      >
        {editTaskData && (
          <div className="w-full max-w-4xl bg-[#F2F1FB] p-2 rounded-lg">
            {/* Summary */}
            <div className="mb-5">
              <label className="block text-[#2B245C] font-semibold mb-2">
                Summary
              </label>
              <input
                type="text"
                name="summary"
                value={editTaskData.summary}
                onChange={handleEditTaskChange}
                className="w-full border border-gray-300 p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2B245C]"
                placeholder="Enter summary"
              />
            </div>

            {/* Description */}
            <div className="mb-5">
              <label className="block text-[#2B245C] font-semibold mb-2">
                Description
              </label>
              <textarea
                name="description"
                value={editTaskData.description}
                onChange={handleEditTaskChange}
                className="w-full border border-gray-300 p-3 rounded-md h-24 resize-none focus:outline-none focus:ring-2 focus:ring-[#2B245C]"
                placeholder="Enter description"
              />
            </div>

            {/* Priority & Status (Side by Side) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
              <div>
                <label className="block text-[#2B245C] font-semibold mb-2">
                  Priority
                </label>
                <select
                  name="priority"
                  value={editTaskData.priority}
                  onChange={handleEditTaskChange}
                  className="w-full border border-gray-300 p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2B245C]"
                >
                  <option value="low">low</option>
                  <option value="medium">medium</option>
                  <option value="high">high</option>
                </select>
              </div>

              <div>
                <label className="block text-[#2B245C] font-semibold mb-2">
                  Status
                </label>
                <select
                  name="status"
                  value={editTaskData.status}
                  onChange={handleEditTaskChange}
                  className="w-full border border-gray-300 p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2B245C]"
                >
                  <option value="TO DO">TO DO</option>
                  <option value="IN PROGRESS">IN PROGRESS</option>
                  <option value="DONE">DONE</option>
                </select>
              </div>
            </div>

            {/* End Date */}
            <div className="mb-5">
              <label className="block text-[#2B245C] font-semibold mb-2">
                End Date
              </label>
              <input
                type="date"
                name="endDate"
                value={new Date(editTaskData.endDate)
                  .toISOString()
                  .substr(0, 10)}
                onChange={handleEditTaskChange}
                className="w-full border border-gray-300 p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2B245C]"
              />
            </div>
          </div>
        )}
      </Dialog>

      <Dialog
        isOpen={isSubmitOpen}
        onClose={closeSubmit}
        title="Submit Your Work"
        footer={
          <button
            onClick={handleSubmitAssignment}
            className="bg-[#2B245C] text-white px-4 py-2 rounded-md cursor-pointer hover:bg-[#2B245C]"
          >
            Submit
          </button>
        }
      >
        <div className="bg-white p-6 rounded-lg shadow-lg space-y-6">
          {/* File Upload */}
          {role === "Employee" && (
            <div className="flex flex-col">
              <label className="mb-2 font-semibold text-gray-700">
                Add File
              </label>
              <label
                htmlFor="file-upload"
                className="flex items-center justify-center h-32 border-2 border-dashed border-gray-300 rounded-md cursor-pointer hover:border-gray-400 transition-colors"
              >
                <input
                  id="file-upload"
                  type="file"
                  className="hidden"
                  onChange={(e) => setSubmitFile(e.target.files?.[0] || null)}
                />
                <div className="text-center text-gray-500">
                  <MdOutlineAssignmentTurnedIn
                    size={32}
                    className="mx-auto mb-1"
                  />
                  <p className="text-sm">Click to upload or drag & drop</p>
                  {submitFile && (
                    <p className="mt-1 text-xs text-green-600">
                      {submitFile.name}
                    </p>
                  )}
                </div>
              </label>
            </div>
          )}

          {/* Comment */}
          <div className="flex flex-col">
            <label className="mb-2 font-semibold text-gray-700">Comment</label>
            <textarea
              rows={4}
              value={submitComment}
              onChange={(e) => setSubmitComment(e.target.value)}
              className="w-full border border-gray-300 p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2B245C] resize-y"
              placeholder="Add any notes or context here..."
            />
          </div>
        </div>
      </Dialog>

      <Dialog
        isOpen={isAssignmentsModalOpen}
        onClose={closeAssignmentsModal}
        title="Assignment Details"
        footer={
          <button
            onClick={closeAssignmentsModal}
            className="bg-gray-500 text-white px-4 py-2 rounded-md"
          >
            Close
          </button>
        }
      >
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border">
            <thead className="bg-gray-100">
              <tr>
                <th className="py-2 px-4 border">Assign To</th>
                <th className="py-2 px-4 border">Submitted File</th>
                <th className="py-2 px-4 border">Submitted Date</th>
                <th className="py-2 px-4 border">Comment</th>

                <th className="py-2 px-4 border">Supervisor</th>
                <th className="py-2 px-4 border">Supervisor Comment</th>
                <th className="py-2 px-4 border">Supervisor Date</th>

                <th className="py-2 px-4 border">Reviewer</th>
                <th className="py-2 px-4 border">Reviewer Comment</th>
                <th className="py-2 px-4 border">Reviewer Date</th>

                <th className="py-2 px-4 border">Approver</th>
                <th className="py-2 px-4 border">Approver Comment</th>
                <th className="py-2 px-4 border">Approver Date</th>
              </tr>
            </thead>
            <tbody>
              {assignmentsToShow.map((a) => {
                const nameOf = (id) =>
                  // employees.find((e) => e._id === id)?.first_name || id || "—";
                  employees.find((e) => String(e._id) === String(id));

                const fmt = (date) =>
                  date ? new Date(date).toLocaleString() : "—";

                return (
                  <tr key={a._id}>
                    {/* Assign To */}
                    <td className="py-2 px-4 border">{nameOf(a.assignTo)}</td>
                    <td className="py-2 px-4 border">
                      <button
                        onClick={() =>
                          handleDownloadFile(a.assignToFileDestination)
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        Download
                      </button>
                    </td>
                    <td className="py-2 px-4 border">
                      {fmt(a.assignToSubmittedDate)}
                    </td>
                    <td className="py-2 px-4 border">
                      {a.assignToComment || "—"}
                    </td>

                    {/* Supervisor */}
                    <td className="py-2 px-4 border">{nameOf(a.supervisor)}</td>
                    <td className="py-2 px-4 border">
                      {a.supervisorComment || "—"}
                    </td>
                    <td className="py-2 px-4 border">
                      {fmt(a.supervisorCommentDate)}
                    </td>

                    {/* Reviewer */}
                    <td className="py-2 px-4 border">{nameOf(a.reviewer)}</td>
                    <td className="py-2 px-4 border">
                      {a.reviewerComment || "—"}
                    </td>
                    <td className="py-2 px-4 border">
                      {fmt(a.reviewerCommentDate)}
                    </td>

                    {/* Approver */}
                    <td className="py-2 px-4 border">{nameOf(a.approver)}</td>
                    <td className="py-2 px-4 border">
                      {a.approverComment || "—"}
                    </td>
                    <td className="py-2 px-4 border">
                      {fmt(a.approverCommentDate)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Dialog>
    </div>
  );
}
