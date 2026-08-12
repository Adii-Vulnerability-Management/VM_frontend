import React, { useState } from "react";
import {
  FaChartLine,
  FaSyncAlt,
  FaTrashAlt,
  FaPlusCircle,
} from "react-icons/fa";

const ObservabilityIntegrations = () => {
  const [tools, setTools] = useState([
    {
      id: 1,
      name: "Datadog",
      status: "Connected",
      lastSync: "2025-01-10",
      apiKey: "******1234",
    },
    {
      id: 2,
      name: "New Relic",
      status: "Disconnected",
      lastSync: "N/A",
      apiKey: "Not Configured",
    },
    {
      id: 3,
      name: "Grafana",
      status: "Connected",
      lastSync: "2025-01-11",
      apiKey: "******5678",
    },
  ]);

  const [newTool, setNewTool] = useState({ name: "", apiKey: "" });

  const handleAddTool = () => {
    if (newTool.name && newTool.apiKey) {
      setTools([
        ...tools,
        {
          id: tools.length + 1,
          name: newTool.name,
          status: "Connected",
          lastSync: "N/A",
          apiKey: newTool.apiKey,
        },
      ]);
      setNewTool({ name: "", apiKey: "" });
    }
  };

  const handleDeleteTool = (id) => {
    setTools(tools.filter((tool) => tool.id !== id));
  };

  const handleSyncTool = (id) => {
    setTools(
      tools.map((tool) =>
        tool.id === id
          ? { ...tool, lastSync: new Date().toISOString().split("T")[0] }
          : tool,
      ),
    );
  };

  return (
    <div className="p-2 min-h-screen">
      <h2 className="text-2xl font-bold text-[#2B245C] mb-1">
        Observability Integrations
      </h2>
      <p className="text-gray-600 text-sm mb-6">
        Manage observability tools like Datadog, New Relic, and Grafana to
        monitor system performance and ensure compliance.
      </p>

      {/* Add New Tool */}
      <div className="mb-5 rounded-2xl border border-[#2B245C] bg-white p-6 shadow-lg hover:shadow-2xl transition-shadow duration-300">
        <h3 className="text-2xl font-bold text-[#2B245C] mb-1">Add New Tool</h3>
        <p className="text-gray-600 text-sm mb-4">
          Connect a new observability tool by providing its name and API key.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-2">
              Tool Name
            </label>
            <input
              type="text"
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-indigo-200 transition-all"
              placeholder="Enter tool name (e.g., Datadog)"
              value={newTool.name}
              onChange={(e) => setNewTool({ ...newTool, name: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-2">
              API Key
            </label>
            <input
              type="text"
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-indigo-200 transition-all"
              placeholder="Enter API key"
              value={newTool.apiKey}
              onChange={(e) =>
                setNewTool({ ...newTool, apiKey: e.target.value })
              }
            />
          </div>
        </div>
        <button
          onClick={handleAddTool}
          className="mt-5 inline-flex items-center gap-2 rounded-lg bg-[#2B245C] px-6 py-2.5 text-sm font-semibold text-white shadow-md hover:shadow-lg hover:bg-opacity-90 disabled:opacity-60 transition-all"
        >
          <FaPlusCircle /> Add Tool
        </button>
      </div>

      {/* Tools List */}
      <div>
        <h3 className="text-2xl font-bold text-[#2B245C] mb-3">All Tools</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tools.map((tool) => (
            <div
              key={tool.id}
              className="rounded-2xl border border-[#2B245C] bg-white p-6 shadow-lg hover:shadow-2xl transition-shadow duration-300"
            >
              <div className="flex items-center justify-between mb-4">
                <FaChartLine className="text-[#52B0CA] text-3xl mr-4" />
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-[#2B245C]">
                    {tool.name}
                  </h3>
                  <p className="text-sm text-gray-600">
                    Last Sync: {tool.lastSync}
                  </p>
                </div>
                <span
                  className={`px-3 py-1 text-sm font-medium rounded-full ${
                    tool.status === "Connected"
                      ? "bg-green-100 text-green-600"
                      : "bg-red-100 text-red-600"
                  }`}
                >
                  {tool.status}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <p className="text-sm text-gray-600">API Key: {tool.apiKey}</p>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleSyncTool(tool.id)}
                    className="bg-[#2B245C] border border-[#2B245C] text-white text-sm font-semibold px-3 py-1 rounded-lg hover:bg-opacity-90 flex items-center"
                  >
                    <FaSyncAlt className="mr-2" /> Sync
                  </button>
                  <button
                    onClick={() => handleDeleteTool(tool.id)}
                    className="bg-white border border-red-600 text-red-600 text-sm font-semibold px-3 py-1 rounded-lg hover:bg-red-50 flex items-center"
                  >
                    <FaTrashAlt className="mr-2" /> Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ObservabilityIntegrations;
