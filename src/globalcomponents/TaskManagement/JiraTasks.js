import React, { useEffect, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { baseurl, initURL } from "../../../BaseUrl";
import Loader from "../loader/Loader";
// Function to fetch tasks from the backend
const getJiraTasks = async (projectKey) => {
  const response = await fetch(
    `${baseurl}/${initURL}/jira/tasks?projectKey=${projectKey}`
  );
  if (!response.ok) {
    throw new Error("Failed to fetch tasks");
  }
  return await response.json();
};

// Function to create a new task via the backend

// Helper function to extract text from Atlassian Document Format (ADF)
function extractTextFromADF(adf) {
  if (!adf || !Array.isArray(adf.content)) return "";
  return adf.content
    .map((block) => {
      if (block.type === "paragraph" && Array.isArray(block.content)) {
        return block.content
          .map((inline) => (inline.type === "text" ? inline.text : ""))
          .join("");
      }
      return "";
    })
    .join("\n");
}

// Status Badge Component with color based on status
const StatusBadge = ({ status }) => {
  let badgeColor;
  const normalizedStatus = status.toUpperCase();
  if (normalizedStatus === "TO DO") {
    badgeColor = "text-blue-500";
  } else if (normalizedStatus === "IN PROGRESS") {
    badgeColor = "text-yellow-500";
  } else if (normalizedStatus === "DONE") {
    badgeColor = "text-green-500";
  } else {
    badgeColor = "text-gray-500";
  }
  return (
    <span className={`py-1 text-xs font-semibold  rounded ${badgeColor}`}>
      {status}
    </span>
  );
};

export default function JiraTasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const projectKey = "GRC"; // Change to your Jira project key

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const taskData = await getJiraTasks(projectKey);
      setTasks(taskData);
    } catch (error) {
      toast.error("Failed to fetch Jira tasks");
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="mx-auto p-8 bg-white shadow-lg rounded-lg">
      <ToastContainer />

      {/* Task List Section */}
      <section>
        {loading ? (
          <div className="min-h-screen flex items-center justify-center">
            <Loader />
          </div>
        ) : tasks.length === 0 ? (
          <div className="text-gray-500">No tasks found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full border divide-y rounded-xl divide-gray-200">
              <thead className="bg-[#2B245C] ">
                <tr>
                  <th className="px-4 py-2 text-left text-sm font-medium text-white">
                    Key
                  </th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-white">
                    Summary
                  </th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-white">
                    Description
                  </th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-white">
                    Status
                  </th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-white">
                    Priority
                  </th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-white">
                    Created
                  </th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-white">
                    Updated
                  </th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-white">
                    Resolution
                  </th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-white">
                    Creator
                  </th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-white">
                    Reporter
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {tasks.map((task) => {
                  const fields = task.fields;
                  return (
                    <tr key={task.id} className="hover:bg-gray-100">
                      <td className="px-4 py-2 text-sm text-gray-700">
                        {task.key}
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-700">
                        {fields.summary}
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-700">
                        {extractTextFromADF(fields.description)}
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-700">
                        <StatusBadge status={fields.status?.name || "N/A"} />
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-700">
                        {(() => {
                          const priority = fields.priority?.name || "N/A";
                          let badgeColor = "";
                          if (priority.toLowerCase() === "low") {
                            badgeColor = "text-green-500";
                          } else if (priority.toLowerCase() === "medium") {
                            badgeColor = "text-yellow-500";
                          } else if (priority.toLowerCase() === "high") {
                            badgeColor = "text-red-500";
                          } else {
                            badgeColor = "text-gray-500";
                          }
                          return (
                            <span
                              className={`px-2 py-1 text-xs font-semibold rounded ${badgeColor}`}
                            >
                              {priority}
                            </span>
                          );
                        })()}
                      </td>

                      <td className="px-4 py-2 text-sm text-gray-700">
                        {new Date(fields.created).toLocaleString()}
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-700">
                        {new Date(fields.updated).toLocaleString()}
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-700">
                        {fields.resolution?.name || "N/A"}
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-700">
                        {fields.creator?.displayName || "N/A"}
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-700">
                        {fields.reporter?.displayName || "N/A"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
