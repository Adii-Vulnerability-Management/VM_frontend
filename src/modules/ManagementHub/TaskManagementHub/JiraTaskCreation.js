import React, { useEffect, useRef, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { baseurl, initURL } from "@/config/config";
import { can, guard } from "@/auth/auth-permissions";
import { useRouter } from "next/router";

// Function to create a new task via the backend
async function createJiraTask({
  projectKey,
  summary,
  description,
  assigneeAccountId,
}) {
  const res = await fetch(`${baseurl}/${initURL}/jira/create-task`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      projectKey,
      summary,
      description,
      assigneeAccountId, // <-- preferred exact ID for assignment
      // issueTypeName: "Task" // optionally send a specific issue type name
    }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.message || "Failed to create task");
  }
  return res.json();
}

// --- Small helper to debounce input ---
function useDebouncedValue(value, delayMs = 300) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), delayMs);
    return () => clearTimeout(t);
  }, [value, delayMs]);
  return v;
}

export default function JiraTasksCreation() {
  const router = useRouter();
  const [summary, setSummary] = useState("");
  const [description, setDescription] = useState("");
  // Assignee search state
  const [assigneeQuery, setAssigneeQuery] = useState("");
  const debouncedAssigneeQuery = useDebouncedValue(assigneeQuery, 300);
  const [assignableUsers, setAssignableUsers] = useState([]);
  const [assigneeAccountId, setAssigneeAccountId] = useState("");
  const [assigneeDisplayName, setAssigneeDisplayName] = useState("");
  const [openDropdown, setOpenDropdown] = useState(false);

  const dropdownRef = useRef(null);

  const projectKey = "KAN"; // Change to your Jira project key

  // Permissions
  const canCreate = can("management_hub.create");

  // --- API calls ---
  async function fetchAssignableUsers(q) {
    const url = `${baseurl}/${initURL}/jira/assignable-users?projectKey=${encodeURIComponent(
      projectKey,
    )}&q=${encodeURIComponent(q || "")}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error("Failed to load assignable users");
    return res.json();
  }

  // Load options when typing
  useEffect(() => {
    if (!debouncedAssigneeQuery && !openDropdown) return;
    let cancelled = false;
    (async () => {
      try {
        const users = await fetchAssignableUsers(debouncedAssigneeQuery);
        if (!cancelled) setAssignableUsers(users);
      } catch (e) {
        if (!cancelled) {
          setAssignableUsers([]);
          // don't toast on every keystroke error
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [debouncedAssigneeQuery, openDropdown]);

  // Close dropdown if clicked outside
  useEffect(() => {
    function onDocClick(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpenDropdown(false);
      }
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  function handlePickAssignee(u) {
    setAssigneeAccountId(u.accountId);
    setAssigneeDisplayName(u.displayName || "");
    setAssigneeQuery(u.displayName || "");
    setOpenDropdown(false);
  }

  async function handleCreateTask() {
    if (!summary || !description) {
      toast.warn("Please enter summary and description");
      return;
    }
    try {
      await createJiraTask({
        projectKey,
        summary,
        description,
        assigneeAccountId: assigneeAccountId || undefined,
      });
      toast.success("Task created successfully");
      setSummary("");
      setDescription("");
      // keep assignee selection
    } catch (e) {
      toast.error(e.message || "Failed to create Jira task");
    }
  }
  return (
    <div className="p-4">
      <ToastContainer />

      {/* Header */}
      <h2 className="text-2xl font-semibold text-[#2B245C]">
        Jira Task Manager
      </h2>

      {/* Create Task Section */}
      <section className="mt-5 rounded-2xl border border-[#2B245C] bg-white p-6 shadow-lg hover:shadow-2xl transition-shadow duration-300">
        <h3 className="text-xl font-bold text-[#2B245C] mb-5">
          Create New Task
        </h3>

        <div className="flex flex-col gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-2">
              Asset Name
            </label>
            <input
              type="text"
              placeholder="Task Summary"
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-indigo-200 transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-2">
              Asset Name
            </label>
            <textarea
              placeholder="Task Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows="4"
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-indigo-200 transition-all"
            />
          </div>

          {/* Assignee search + dropdown */}
          <div className="relative" ref={dropdownRef}>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Assignee (optional)
            </label>
            <input
              type="text"
              placeholder="Search people to assign (type a name)"
              value={assigneeQuery}
              onChange={(e) => {
                setAssigneeQuery(e.target.value);
                setOpenDropdown(true);
                if (!e.target.value) {
                  setAssigneeAccountId("");
                  setAssigneeDisplayName("");
                }
              }}
              onFocus={() => setOpenDropdown(true)}
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-indigo-200 transition-all"
            />
            {openDropdown && (
              <div className="absolute z-20 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
                {assignableUsers.length === 0 ? (
                  <div className="px-3 py-2 text-sm text-gray-500">
                    {debouncedAssigneeQuery
                      ? "No matches"
                      : "Start typing to search"}
                  </div>
                ) : (
                  assignableUsers.map((u) => (
                    <button
                      type="button"
                      key={u.accountId}
                      className="w-full text-left px-3 py-2 hover:bg-gray-100 flex items-center gap-2"
                      onClick={() => handlePickAssignee(u)}
                    >
                      <img
                        src={u.avatarUrls?.["24x24"] || u.avatarUrls?.["32x32"]}
                        alt=""
                        className="w-6 h-6 rounded"
                      />
                      <span className="text-sm text-gray-800">
                        {u.displayName}
                      </span>
                      {assigneeAccountId === u.accountId && (
                        <span className="ml-auto text-xs text-green-600">
                          selected
                        </span>
                      )}
                    </button>
                  ))
                )}
              </div>
            )}
            {assigneeAccountId && (
              <div className="mt-2 text-xs text-gray-600">
                Selected:{" "}
                <span className="font-medium">{assigneeDisplayName}</span>
              </div>
            )}
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={() => guard(canCreate, router, () => handleCreateTask())}
            className="inline-flex items-center gap-2 rounded-lg bg-[#2B245C] px-6 py-2.5 text-sm font-semibold text-white shadow-md hover:shadow-lg hover:bg-opacity-90 disabled:opacity-60 transition-all"
          >
            Create Task
          </button>
        </div>
      </section>
    </div>
  );
}
