import React, { useState } from "react";
import { FaSyncAlt, FaTrashAlt, FaPlusCircle } from "react-icons/fa";

const HRISIntegrations = () => {
  const [systems, setSystems] = useState([
    {
      id: 1,
      name: "Workday",
      status: "Connected",
      lastSync: "2025-01-10",
      apiKey: "******1234",
    },
    {
      id: 2,
      name: "BambooHR",
      status: "Disconnected",
      lastSync: "N/A",
      apiKey: "Not Configured",
    },
  ]);

  const [newSystem, setNewSystem] = useState({ name: "", apiKey: "" });

  const handleAddSystem = () => {
    if (newSystem.name && newSystem.apiKey) {
      setSystems([
        ...systems,
        {
          id: systems.length + 1,
          name: newSystem.name,
          status: "Connected",
          lastSync: "N/A",
          apiKey: newSystem.apiKey,
        },
      ]);
      setNewSystem({ name: "", apiKey: "" });
    }
  };

  const handleDeleteSystem = (id) => {
    setSystems(systems.filter((system) => system.id !== id));
  };

  const handleSyncSystem = (id) => {
    setSystems(
      systems.map((system) =>
        system.id === id
          ? { ...system, lastSync: new Date().toISOString().split("T")[0] }
          : system,
      ),
    );
  };

  return (
    <div className="p-2 min-h-screen">
      <h2 className="text-2xl font-bold text-[#2B245C] mb-1">
        HRIS Integrations
      </h2>
      <p className="text-gray-600 text-sm mb-6">
        Manage HRIS tools like Workday and BambooHR to track employee training,
        certifications, and automate HR compliance tasks.
      </p>

      {/* Add New System */}
      <div className="mb-5 rounded-2xl border border-[#2B245C] bg-white p-6 shadow-lg hover:shadow-2xl transition-shadow duration-300">
        <h3 className="text-2xl font-bold text-[#2B245C] mb-1">
          Add New System
        </h3>
        <p className="text-gray-600 text-sm mb-4">
          Connect a new HRIS system by providing its name and API key.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-2">
              System Name
            </label>
            <input
              type="text"
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-indigo-200 transition-all"
              placeholder="Enter system name (e.g., Workday)"
              value={newSystem.name}
              onChange={(e) =>
                setNewSystem({ ...newSystem, name: e.target.value })
              }
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
              value={newSystem.apiKey}
              onChange={(e) =>
                setNewSystem({ ...newSystem, apiKey: e.target.value })
              }
            />
          </div>
        </div>
        <button
          onClick={handleAddSystem}
          className="mt-5 inline-flex items-center gap-2 rounded-lg bg-[#2B245C] px-6 py-2.5 text-sm font-semibold text-white shadow-md hover:shadow-lg hover:bg-opacity-90 disabled:opacity-60 transition-all"
        >
          <FaPlusCircle /> Add System
        </button>
      </div>

      {/* Systems List */}
      <div>
        <h3 className="text-2xl font-bold text-[#2B245C] mb-3">All Systems</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {systems.map((system) => (
            <div
              key={system.id}
              className="rounded-2xl border border-[#2B245C] bg-white p-6 shadow-lg hover:shadow-2xl transition-shadow duration-300"
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold text-[#2B245C]">
                    {system.name}
                  </h3>
                  <p className="text-sm text-gray-600">
                    Last Sync: {system.lastSync}
                  </p>
                </div>
                <span
                  className={`px-3 py-1 text-sm font-medium rounded-full ${
                    system.status === "Connected"
                      ? "bg-green-100 text-green-600"
                      : "bg-red-100 text-red-600"
                  }`}
                >
                  {system.status}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <p className="text-sm text-gray-600">
                  API Key: {system.apiKey}
                </p>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleSyncSystem(system.id)}
                    className="bg-[#2B245C] border border-[#2B245C] text-white text-sm font-semibold px-3 py-1 rounded-lg hover:bg-opacity-90 flex items-center"
                  >
                    <FaSyncAlt className="mr-2" /> Sync
                  </button>
                  <button
                    onClick={() => handleDeleteSystem(system.id)}
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

export default HRISIntegrations;
