import React, { useEffect, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { baseurl, initURL } from "../../../BaseUrl";

// Function to create a new task via the backend
const createJiraTask = async (projectKey, summary, description) => {
  const response = await fetch(`${baseurl}/${initURL}/jira/create-task`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ projectKey, summary, description }),
  });
  if (!response.ok) {
    throw new Error("Failed to create task");
  }
  return await response.json();
};

export default function JiraTasksCreation() {
  const [summary, setSummary] = useState("");
  const [description, setDescription] = useState("");
  const projectKey = "GRC"; // Change to your Jira project key

  const handleCreateTask = async () => {
    if (!summary || !description) {
      toast.warn("Please enter summary and description");
      return;
    }
    try {
      await createJiraTask(projectKey, summary, description);
      toast.success("Task created successfully");
      setSummary("");
      setDescription("");
    } catch (error) {
      toast.error("Failed to create Jira task");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-10">
      <div className="w-full max-w-2xl mx-auto p-8 bg-white shadow-2xl rounded-lg">
        <ToastContainer />
        <div className="text-center mb-8">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-800">
            Jira Task Manager
          </h1>
          <h2 className="text-2xl sm:text-3xl font-semibold text-gray-600 mt-2">
            Create New Task
          </h2>
        </div>
        {/* Create Task Section */}
        <section className="bg-gray-100 p-6 rounded-lg">
          <div className="flex flex-col gap-4">
            <input
              type="text"
              placeholder="Task Summary"
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              className="border border-gray-300 p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <textarea
              placeholder="Task Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows="4"
              className="border border-gray-300 p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
          <div className="mt-6 flex justify-center">
            <button
              onClick={handleCreateTask}
              className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-3 rounded-md transition-colors duration-200"
            >
              Create Task
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
