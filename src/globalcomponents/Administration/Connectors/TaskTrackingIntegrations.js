import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import CustomAxios from "@/globalcomponents/CustomAxios";
import { baseurl, initURL } from "../../../../BaseUrl";
import { FaTasks, FaSyncAlt, FaTrashAlt, FaPlusCircle } from "react-icons/fa";

const TaskTrackingIntegrations = () => {
  const [tools, setTools] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [newTool, setNewTool] = useState({
    tool: "",
    name: "",
    apiToken: "",
    baseUrl: "",
    email: "",
  });

  const availableTools = [
    { label: "Jira", value: "jira" },
    { label: "ServiceNow", value: "servicenow" },
    { label: "Asana", value: "asana" },
    { label: "Azure Boards", value: "azure_boards" },
    { label: "ClickUp", value: "clickup" },
  ];

  const fetchIntegrations = async () => {
    try {
      setLoading(true);

      const res = await CustomAxios.get(`${baseurl}/${initURL}/integrations`);
      const list = Array.isArray(res?.data?.docs)
        ? res.data.docs
        : Array.isArray(res?.data)
          ? res.data
          : [];

      setTools(list);
    } catch (error) {
      console.error("Error fetching integrations:", error);
      toast.error("Failed to load integrations");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIntegrations();
  }, []);

  const handleSubmitTool = async () => {
    if (
      !newTool.tool ||
      !newTool.name ||
      !newTool.baseUrl ||
      !newTool.email ||
      (!editingId && !newTool.apiToken)
    ) {
      toast.warning("Please fill in all fields");
      return;
    }

    try {
      setSubmitting(true);

      if (editingId) {
        const payload = {
          baseUrl: newTool.baseUrl,
          email: newTool.email,
        };

        if (newTool.apiToken) {
          payload.apiToken = newTool.apiToken;
        }

        await CustomAxios.patch(
          `${baseurl}/${initURL}/integrations/${editingId}`,
          payload,
        );

        toast.success("Integration updated successfully");
      } else {
        const payload = {
          tool: newTool.tool,
          name: newTool.name,
          baseUrl: newTool.baseUrl,
          email: newTool.email,
          apiToken: newTool.apiToken,
        };

        await CustomAxios.post(`${baseurl}/${initURL}/integrations`, payload);

        toast.success("Integration added successfully");
      }

      resetToolForm();
      await fetchIntegrations();
    } catch (error) {
      console.error("Error submitting integration:", error);
      toast.error(
        editingId
          ? "Failed to update integration"
          : "Failed to create integration",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditTool = (tool) => {
    const toolId = tool.id || tool._id;

    setEditingId(toolId);
    setNewTool({
      tool: tool.tool || "",
      name: tool.name || "",
      apiToken: "",
      baseUrl: tool.baseUrl || "",
      email: tool.email || "",
    });
  };

  const resetToolForm = () => {
    setEditingId(null);
    setNewTool({
      tool: "",
      name: "",
      apiToken: "",
      baseUrl: "",
      email: "",
    });
  };

  const handleDeleteTool = async (id) => {
    try {
      setActionLoadingId(id);

      await CustomAxios.delete(`${baseurl}/${initURL}/integrations/${id}`);

      toast.success("Integration removed successfully");
      await fetchIntegrations();
    } catch (error) {
      console.error("Error deleting integration:", error);
      toast.error("Failed to delete integration");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleSyncTool = async (id) => {
    try {
      setActionLoadingId(id);

      await CustomAxios.post(`${baseurl}/${initURL}/integrations/${id}/sync`);

      toast.success("Integration synced successfully");
      await fetchIntegrations();
    } catch (error) {
      console.error("Error syncing integration:", error);
      toast.error("Failed to sync integration");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleTestTool = async (id) => {
    try {
      setActionLoadingId(id);

      await CustomAxios.post(`${baseurl}/${initURL}/integrations/${id}/test`);

      toast.success("Connection successful");
      await fetchIntegrations();
    } catch (error) {
      console.error("Error testing integration:", error);
      toast.error("Connection failed");
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <div className="p-2 min-h-screen">
      <h2 className="text-2xl font-bold text-[#2B245C] mb-1">
        Task Tracking Integrations
      </h2>
      <p className="text-gray-600 text-sm mb-6">
        Manage and connect task tracking tools like Jira, ServiceNow, and Asana
        to streamline your operations.
      </p>

      <div className="mb-5 rounded-2xl border border-[#2B245C] bg-white p-6 shadow-lg hover:shadow-2xl transition-shadow duration-300">
        <h3 className="text-2xl font-bold text-[#2B245C] mb-1">
          {editingId ? "Edit Tool" : "Add New Tool"}
        </h3>
        <p className="text-gray-600 text-sm mb-4">
          {editingId
            ? "Update the selected task tracking tool details."
            : "Connect a new task tracking tool by providing its details."}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-2">
              Select Tool
            </label>
            <select
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-900 focus:border-indigo-500 focus:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-indigo-200 transition-all"
              value={newTool.tool}
              disabled={!!editingId}
              onChange={(e) => {
                const selected = availableTools.find(
                  (tool) => tool.value === e.target.value,
                );

                setNewTool({
                  ...newTool,
                  tool: selected?.value || "",
                  name: selected?.label || "",
                });
              }}
            >
              <option value="">-- Select a Tool --</option>
              {availableTools.map((tool) => (
                <option key={tool.value} value={tool.value}>
                  {tool.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-2">
              API Token
            </label>
            <input
              type="text"
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-indigo-200 transition-all"
              placeholder={
                editingId
                  ? "Leave blank to keep existing API token"
                  : "Enter API token"
              }
              value={newTool.apiToken}
              onChange={(e) =>
                setNewTool({ ...newTool, apiToken: e.target.value })
              }
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-2">
              Base URL
            </label>
            <input
              type="text"
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-indigo-200 transition-all"
              placeholder="Enter Base URL (e.g., https://jira.example.com)"
              value={newTool.baseUrl}
              onChange={(e) =>
                setNewTool({ ...newTool, baseUrl: e.target.value })
              }
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-indigo-200 transition-all"
              placeholder="Enter Email"
              value={newTool.email}
              onChange={(e) =>
                setNewTool({ ...newTool, email: e.target.value })
              }
            />
          </div>
        </div>

        <button
          onClick={handleSubmitTool}
          disabled={submitting}
          className="mt-5 inline-flex items-center gap-2 rounded-lg bg-[#2B245C] px-6 py-2.5 text-sm font-semibold text-white shadow-md hover:shadow-lg hover:bg-opacity-90 disabled:opacity-60 transition-all"
        >
          <FaPlusCircle />{" "}
          {submitting
            ? editingId
              ? "Updating..."
              : "Adding..."
            : editingId
              ? "Update Tool"
              : "Add Tool"}
        </button>

        {editingId && (
          <button
            onClick={resetToolForm}
            type="button"
            className="mt-5 ml-3 inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-6 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-all"
          >
            Cancel Edit
          </button>
        )}
      </div>

      <div>
        <h3 className="text-2xl font-bold text-[#2B245C] mb-3">All Tools</h3>

        {loading ? (
          <p className="text-sm text-gray-600">Loading integrations...</p>
        ) : tools.length === 0 ? (
          <p className="text-sm text-gray-600">No integrations found.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tools.map((tool) => (
              <div
                key={tool.id}
                className="rounded-2xl border border-[#2B245C] bg-white p-6 shadow-lg hover:shadow-2xl transition-shadow duration-300"
              >
                <div className="flex items-center justify-between mb-4">
                  <FaTasks className="text-[#52B0CA] text-3xl mr-4" />
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-[#2B245C]">
                      {tool.name}
                    </h3>
                    <p className="text-sm text-gray-600">
                      Last Sync: {tool.lastSync || tool.lastSyncedAt || "N/A"}
                    </p>
                  </div>
                  <span
                    className={`px-3 py-1 text-sm font-medium rounded-full ${
                      (tool.status || "").toLowerCase() === "connected"
                        ? "bg-green-100 text-green-600"
                        : "bg-red-100 text-red-600"
                    }`}
                  >
                    {tool.status || "Unknown"}
                  </span>
                </div>

                <div className="mb-4 space-y-1">
                  <p className="text-sm text-gray-600">
                    <strong>Tool:</strong> {tool.tool || "N/A"}
                  </p>
                  <p className="text-sm text-gray-600">
                    <strong>Base URL:</strong> {tool.baseUrl || "N/A"}
                  </p>
                  <p className="text-sm text-gray-600">
                    <strong>Email:</strong> {tool.email || "N/A"}
                  </p>
                  <p className="text-sm text-gray-600">
                    <strong>API Token:</strong> Configured
                  </p>
                </div>

                <div className="flex flex-wrap gap-2 items-center">
                  <button
                    onClick={() => handleTestTool(tool.id)}
                    disabled={actionLoadingId === tool.id}
                    className="bg-purple-50 border border-purple-700 text-purple-700 text-sm font-semibold px-3 py-1 rounded-lg hover:bg-purple-100 disabled:opacity-60"
                  >
                    Test
                  </button>

                  <button
                    onClick={() => handleEditTool(tool)}
                    disabled={actionLoadingId === (tool.id || tool._id)}
                    className="bg-blue-50 border border-blue-700 text-blue-700 text-sm font-semibold px-3 py-1 rounded-lg hover:bg-blue-100 disabled:opacity-60"
                  >
                    Edit
                  </button>

                  <button
                    onClick={() => handleSyncTool(tool.id)}
                    disabled={actionLoadingId === tool.id}
                    className="bg-green-50 border border-green-700 text-green-700 text-sm font-semibold px-3 py-1 rounded-lg hover:bg-green-100 disabled:opacity-60"
                  >
                    Sync
                  </button>

                  <button
                    onClick={() => handleDeleteTool(tool.id)}
                    disabled={actionLoadingId === tool.id}
                    className="bg-red-50 border border-red-700 text-red-700 text-sm font-semibold px-3 py-1 rounded-lg hover:bg-red-100 flex items-center disabled:opacity-60"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskTrackingIntegrations;
