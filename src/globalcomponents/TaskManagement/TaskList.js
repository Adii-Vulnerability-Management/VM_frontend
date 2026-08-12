import React, { useState, useEffect } from "react";
import { baseurl, initURL } from "../../../BaseUrl";
import CustomAxios from "../CustomAxios";
import Loader from "../loader/Loader";
import Dialog from "../rbiTracker/Dialog";
import { FaEdit } from "react-icons/fa";
import { MdDelete, MdOutlineAssignmentTurnedIn } from "react-icons/md";
import { toast } from "react-toastify";

export default function TaskList() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // For assignment modal
  const [selectedTask, setSelectedTask] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [approver, setApprover] = useState("");
  const [reviewer, setReviewer] = useState("");
  const [supervisor, setSupervisor] = useState("");
  const [employees, setEmployees] = useState([]);
  // For edit modal
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editTaskData, setEditTaskData] = useState(null);
  const fetchEmployees = async () => {
    try {
      const response = await CustomAxios.post(
        `${baseurl}/${initURL}/tisax-team-assignment/get-employees`,
        {
          user_designations: [
            "Employee",
            "Reviewer",
            "Assigner",
            "Approver",
            "Contributor",
            "Supervisor",
          ],
        }
      );
      setEmployees(response?.data?.data || []);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to fetch employees");
    }
  };
  useEffect(() => {
    const fetchTasks = async () => {
      const endpoint = `${baseurl}/${initURL}/tasks`;
      try {
        const response = await CustomAxios.get(endpoint);
        setTasks(response.data);
        setLoading(false);
      } catch (err) {
        setError(err.message);
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

  // Function to apply colors for priority
  const getPriorityColor = (priority) => {
    switch (priority.toLowerCase()) {
      case "low":
        return "text-green-600";
      case "medium":
        return "text-yellow-600";
      case "high":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  // Function to apply colors for status
  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case "to do":
        return "text-gray-600";
      case "in progress":
        return "text-blue-600";
      case "completed":
        return "text-green-600";
      case "on hold":
        return "text-orange-600";
      default:
        return "text-gray-600";
    }
  };

  // Assignment modal handlers
  const openModal = (task) => {
    setSelectedTask(task);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedTask(null);
    setApprover("");
    setReviewer("");
    setSupervisor("");
  };

  const handleAssignTask = () => {
    if (!approver || !reviewer || !supervisor) {
      alert("Please select Approver, Reviewer, and Supervisor.");
      return;
    }

    const assignmentData = {
      task_id: selectedTask._id,
      taskId: selectedTask.taskId,
      approver,
      reviewer,
      supervisor,
    };

    console.log("Task Assigned:", assignmentData);
    // Replace console.log with an API call if needed
    closeModal();
  };

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
          task._id === editTaskData._id ? response.data : task
        )
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
          prevTasks.filter((task) => task.taskId !== taskId)
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


  
  return (
    <div className="container mx-auto p-6">
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-300 shadow-md rounded-lg">
          <thead>
            <tr className="bg-[#2B245C] text-white font-semibold text-left">
              <th className="py-3 px-4 border-b">Task ID</th>
              <th className="py-3 px-4 border-b">Summary</th>
              <th className="py-3 px-4 border-b">Description</th>
              <th className="py-3 px-4 border-b">Priority</th>
              <th className="py-3 px-4 border-b">Status</th>
              <th className="py-3 px-4 border-b">Start Date</th>
              <th className="py-3 px-4 border-b">End Date</th>
              <th className="py-3 px-4 border-b">Category</th>
              <th className="py-3 px-4 border-b">Module Name</th>
              <th className="py-3 px-4 border-b">Edit</th>
              <th className="py-3 px-4 border-b">Delete</th>
              <th className="py-3 px-4 border-b">Assign</th>
            </tr>
          </thead>
          <tbody>
            {tasks.map((task) => (
              <tr
                key={task.taskId}
                className="text-left border-b hover:bg-gray-100 cursor-pointer"
              >
                <td className="py-3 px-4">{task.taskId}</td>
                <td className="py-3 px-4 font-semibold">{task.summary}</td>
                <td className="py-3 px-4">{task.description}</td>
                <td
                  className={`py-3 px-4 font-semibold ${getPriorityColor(
                    task.priority
                  )}`}
                >
                  {task.priority}
                </td>
                <td
                  className={`py-3 px-4 font-semibold ${getStatusColor(
                    task.status
                  )}`}
                >
                  {task.status}
                </td>
                <td className="py-3 px-4">
                  {new Date(task.startDate).toLocaleDateString()}
                </td>
                <td className="py-3 px-4">
                  {new Date(task.endDate).toLocaleDateString()}
                </td>
                <td className="py-3 px-4">{task.category}</td>
                <td className="py-3 px-4">{task.moduleName}</td>
                <td className="py-3 px-4">
                  <button
                    className="text-blue-600"
                    onClick={() => openEditModal(task)}
                  >
                    <FaEdit />
                  </button>
                </td>
                <td className="py-3 px-4">
                  <button
                    className="text-red-600"
                    onClick={() => handleDeleteTask(task._id)}
                  >
                    <MdDelete />
                  </button>
                </td>

                <td className="py-3 px-4">
                  <button
                    className="text-green-600"
                    onClick={() => openModal(task)}
                  >
                    <MdOutlineAssignmentTurnedIn />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Assignment Modal */}
      <Dialog isOpen={isModalOpen} onClose={closeModal}>
        {selectedTask && (
          <div className="p-6 w-[500px]">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Task Assignment
            </h2>
            <p className="text-gray-700 mb-4">
              <strong>Task Summary:</strong> {selectedTask.summary}
            </p>
            <div className="mb-4">
              <label className="block text-gray-700 font-medium mb-1">
                Approver
              </label>
              <select
                value={approver}
                onChange={(e) => setApprover(e.target.value)}
                className="w-full border border-gray-300 p-2 rounded-md"
              >
                <option value="">Select Approver</option>
                {employees
                  .filter(
                    (emp) => emp.user_designation.toLowerCase() === "approver"
                  )
                  .map((emp) => (
                    <option key={emp._id} value={emp._id}>
                      {emp.first_name} {emp.last_name}
                    </option>
                  ))}
              </select>
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 font-medium mb-1">
                Reviewer
              </label>
              <select
                value={reviewer}
                onChange={(e) => setReviewer(e.target.value)}
                className="w-full border border-gray-300 p-2 rounded-md"
              >
                <option value="">Select Reviewer</option>
                {employees
                  .filter(
                    (emp) => emp.user_designation.toLowerCase() === "reviewer"
                  )
                  .map((emp) => (
                    <option key={emp._id} value={emp._id}>
                      {emp.first_name} {emp.last_name}
                    </option>
                  ))}
              </select>
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 font-medium mb-1">
                Supervisor
              </label>
              <select
                value={supervisor}
                onChange={(e) => setSupervisor(e.target.value)}
                className="w-full border border-gray-300 p-2 rounded-md"
              >
                <option value="">Select Supervisor</option>
                {employees
                  .filter(
                    (emp) => emp.user_designation.toLowerCase() === "supervisor"
                  )
                  .map((emp) => (
                    <option key={emp._id} value={emp._id}>
                      {emp.first_name} {emp.last_name}
                    </option>
                  ))}
              </select>
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={closeModal}
                className="bg-gray-400 text-white px-4 py-2 rounded-md hover:bg-gray-500 transition"
              >
                Close
              </button>
              <button
                onClick={handleAssignTask}
                className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition"
              >
                Assign Task
              </button>
            </div>
          </div>
        )}
      </Dialog>

      {/* Edit Modal */}
      <Dialog isOpen={isEditModalOpen} onClose={closeEditModal}>
        {editTaskData && (
          <div className="p-6 w-[1000px]">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Edit Task</h2>
            <div className="mb-4">
              <label className="block text-gray-700 font-medium mb-1">
                Summary
              </label>
              <input
                type="text"
                name="summary"
                value={editTaskData.summary}
                onChange={handleEditTaskChange}
                className="w-full border border-gray-300 p-2 rounded-md"
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 font-medium mb-1">
                Description
              </label>
              <textarea
                name="description"
                value={editTaskData.description}
                onChange={handleEditTaskChange}
                className="w-full border border-gray-300 p-2 rounded-md"
              ></textarea>
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 font-medium mb-1">
                Priority
              </label>
              <select
                name="priority"
                value={editTaskData.priority}
                onChange={handleEditTaskChange}
                className="w-full border border-gray-300 p-2 rounded-md"
              >
                <option value="low">low</option>
                <option value="medium">medium</option>
                <option value="high">high</option>
              </select>
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 font-medium mb-1">
                Status
              </label>
              <select
                name="status"
                value={editTaskData.status}
                onChange={handleEditTaskChange}
                className="w-full border border-gray-300 p-2 rounded-md"
              >
                <option value="TO DO">TO DO</option>
                <option value="IN PROGRESS">IN PROGRESS</option>
                <option value="DONE">DONE</option>
              </select>
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 font-medium mb-1">
                End Date
              </label>
              <input
                type="date"
                name="endDate"
                value={new Date(editTaskData.endDate)
                  .toISOString()
                  .substr(0, 10)}
                onChange={handleEditTaskChange}
                className="w-full border border-gray-300 p-2 rounded-md"
              />
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={closeEditModal}
                className="bg-gray-400 text-white px-4 py-2 rounded-md hover:bg-gray-500 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleEditTask}
                className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition"
              >
                Save Changes
              </button>
            </div>
          </div>
        )}
      </Dialog>
    </div>
  );
}
