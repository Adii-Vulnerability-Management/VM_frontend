import React, { useState } from "react";
import { createTask } from "@/modules/ManagementHub/TaskManagementHub/TaskCreation";
import TaskAssignmentModal from "@/modules/ManagementHub/TaskManagementHub/TaskAssignmentModal";
import sendNotification from "@/utils/Notifications/Notification";
import { toast } from "react-toastify";
import CustomAxios from "@/config/CustomAxios";
import { baseurl, initURL } from "@/config/config";
import Cookies from "js-cookie";

const CreateAndAssignTask = ({
  item,
  employees,
  moduleName = "Tisax",
  category = "Evidence Collection",
}) => {
  const [level, setLevel] = useState("");
  const [question, setQuestion] = useState("");
  const [summary, setSummary] = useState("");
  const [priority, setPriority] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [taskLoading, setTaskLoading] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [isAssignOpen, setIsAssignOpen] = useState(false);

  const stored = Cookies.get("user_data");
  const userData = stored ? JSON.parse(stored) : {};

  const mapLevelToKey = (level) => {
    switch (level) {
      case "Must":
        return "Must Requirements";
      case "Should":
        return "Should Requirements";
      case "High":
        return "Additional requirements for high protection needs";
      case "Very High":
        return "Additional requirements for very high protection needs";
      case "SGA":
        return "Additional requirements for Simplified Group Assessments";
      default:
        return "";
    }
  };

  const handleCreateTask = async () => {
    if (!summary || !priority || !startDate || !endDate) {
      return toast.warn("Fill summary, priority, start and end date.");
    }

    const description = [
      `Control code: ${item["ISA New"]}`,
      `Requirement Type: ${level}`,
      `Question: ${question}`,
    ].join("\n");

    const taskData = {
      moduleName,
      category,
      summary,
      description,
      priority,
      startDate,
      endDate,
      status: "TO DO",
    };

    try {
      setTaskLoading(true);
      const newTask = await createTask(taskData);
      toast.success("Task created");
      setSummary("");
      setPriority("");
      setStartDate("");
      setEndDate("");
      setLevel("");
      setQuestion("");

      setSelectedTask(newTask);
      setIsAssignOpen(true);
    } catch (error) {
      console.error(error);
      toast.error("Failed to create task");
    } finally {
      setTaskLoading(false);
    }
  };

  const handleAssign = async ({ assignTo, assignmentId = null }) => {
    if (!selectedTask) {
      return toast.error("No task selected to assign");
    }

    try {
      const body = { task: selectedTask._id, assignTo };

      if (assignmentId) {
        await CustomAxios.put(
          `${baseurl}/${initURL}/assignments/${assignmentId}`,
          { assignTo }
        );
      } else {
        await CustomAxios.post(`${baseurl}/${initURL}/assignments`, body);
      }

      const emp = employees.find((e) => e._id === assignTo);
      if (emp?.email) {
        await sendNotification({
          actionType: "assign",
          payload: {
            recipientEmail: emp.email,
            name: `${emp.first_name} ${emp.last_name}`,
            userId: userData.user_uuid,
            assignedBy: userData.user_name,
            task: selectedTask.summary,
            taskId: selectedTask.taskId,
            summary: selectedTask.summary,
            description: selectedTask.description,
            moduleName,
            category,
            priority: selectedTask.priority,
            status: selectedTask.status,
            startDate: selectedTask.startDate,
            endDate: selectedTask.endDate,
          },
        });
      }

      toast.success("Task assigned and notification sent!");
    } catch (err) {
      console.error("Assign/notify error:", err);
      toast.error(
        err.response?.data?.message || err.message || "Assignment failed"
      );
    } finally {
      setIsAssignOpen(false);
      setSelectedTask(null);
    }
  };

  return (
    <div className="border p-4 rounded-md mb-4">
      <h2 className="text-xl font-bold mb-4">Create Task</h2>
      <div className="mb-2">
        <label className="block mb-1">Requirement Level</label>
        <select
          value={level}
          onChange={(e) => {
            setLevel(e.target.value);
            setQuestion("");
          }}
          className="w-full p-2 border rounded"
        >
          <option value="">Select level…</option>
          {item["Must Requirements"]?.length > 0 && <option>Must</option>}
          {item["Should Requirements"]?.length > 0 && <option>Should</option>}
          {item["Additional requirements for high protection needs"]?.length >
            0 && <option>High</option>}
          {item["Additional requirements for very high protection needs"]
            ?.length > 0 && <option>Very High</option>}
          {item["Additional requirements for Simplified Group Assessments"]
            ?.length > 0 && <option>SGA</option>}
        </select>
      </div>

      {level && (
        <div className="mb-2">
          <label className="block mb-1">Requirement</label>
          <select
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            className="w-full p-2 border rounded"
          >
            <option value="">Select question…</option>
            {item[mapLevelToKey(level)]?.map((r) => (
              <option key={r._id} value={r.question}>
                {r.question}
              </option>
            ))}
          </select>
        </div>
      )}
      <label className="block mb-1">Task Summary</label>
      <input
        type="text"
        placeholder="Summary"
        value={summary}
        onChange={(e) => setSummary(e.target.value)}
        className="w-full p-2 border rounded mb-2"
      />

      <div className="flex space-x-2 mb-2">
        <div className="flex-1">
          <label className="block mb-1">Priority</label>
          <select
            className="flex-1 w-auto p-2 border rounded"
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
          >
            <option value="">Priority</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>
        <div className="flex-1">
          <label className="block mb-1">Start Date</label>
          <input
            type="date"
            className="w-auto p-2 border rounded"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>
        <div className="flex-1">
          <label className="block mb-1">End Date</label>
          <input
            type="date"
            className="w-auto p-2 border rounded"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>
      </div>

      <button
        disabled={taskLoading}
        onClick={handleCreateTask}
        className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
      >
        {taskLoading ? "Creating…" : "Create Task"}
      </button>

      <TaskAssignmentModal
        isOpen={isAssignOpen}
        onClose={() => {
          setIsAssignOpen(false);
          setSelectedTask(null);
        }}
        task={selectedTask}
        employees={employees}
        roles={[
          { key: "assignTo", label: "Assign To", designation: "Employee" },
        ]}
        onAssign={handleAssign}
      />
    </div>
  );
};

export default CreateAndAssignTask;
