import React, { useState } from "react";
import { FaSyncAlt, FaTrashAlt, FaPlusCircle, FaKey } from "react-icons/fa";

const SSOIntegrations = () => {
  const [connectors, setConnectors] = useState([
    {
      id: 1,
      name: "Okta",
      status: "Connected",
      lastSync: "2025-01-10",
      apiKey: "******1234",
    },
    {
      id: 2,
      name: "OneLogin",
      status: "Disconnected",
      lastSync: "N/A",
      apiKey: "Not Configured",
    },
  ]);

  const [newConnector, setNewConnector] = useState({ name: "", apiKey: "" });

  const handleAddConnector = () => {
    if (newConnector.name && newConnector.apiKey) {
      setConnectors([
        ...connectors,
        {
          id: connectors.length + 1,
          name: newConnector.name,
          status: "Connected",
          lastSync: "N/A",
          apiKey: newConnector.apiKey,
        },
      ]);
      setNewConnector({ name: "", apiKey: "" });
    }
  };

  const handleDeleteConnector = (id) => {
    setConnectors(connectors.filter((connector) => connector.id !== id));
  };

  const handleSyncConnector = (id) => {
    setConnectors(
      connectors.map((connector) =>
        connector.id === id
          ? { ...connector, lastSync: new Date().toISOString().split("T")[0] }
          : connector,
      ),
    );
  };

  return (
    <div className="p-2 min-h-screen">
      <h2 className="text-2xl font-bold text-[#2B245C] mb-1">
        SSO Integrations
      </h2>
      <p className="text-gray-600 text-sm mb-6">
        Manage SSO tools like Okta and OneLogin to ensure secure and centralized
        user access.
      </p>

      {/* Add New Connector */}
      <div className="mb-5 rounded-2xl border border-[#2B245C] bg-white p-6 shadow-lg hover:shadow-2xl transition-shadow duration-300">
        <h3 className="text-2xl font-bold text-[#2B245C] mb-1">
          Add New Connector
        </h3>
        <p className="text-gray-600 text-sm mb-4">
          Add a new SSO connector by providing its name and API key.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-2">
              Connector Name
            </label>
            <input
              type="text"
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-indigo-200 transition-all"
              placeholder="Enter connector name (e.g., Okta)"
              value={newConnector.name}
              onChange={(e) =>
                setNewConnector({ ...newConnector, name: e.target.value })
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
              value={newConnector.apiKey}
              onChange={(e) =>
                setNewConnector({ ...newConnector, apiKey: e.target.value })
              }
            />
          </div>
        </div>
        <button
          onClick={handleAddConnector}
          className="mt-5 inline-flex items-center gap-2 rounded-lg bg-[#2B245C] px-6 py-2.5 text-sm font-semibold text-white shadow-md hover:shadow-lg hover:bg-opacity-90 disabled:opacity-60 transition-all"
        >
          <FaPlusCircle /> Add Connector
        </button>
      </div>

      {/* Connector List */}
      <div>
        <h3 className="text-2xl font-bold text-[#2B245C] mb-3">All Connectors</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {connectors.map((connector) => (
            <div
              key={connector.id}
              className="rounded-2xl border border-[#2B245C] bg-white p-6 shadow-lg hover:shadow-2xl transition-shadow duration-300"
            >
              <div className="flex items-center justify-between mb-4">
                <FaKey className="text-[#52B0CA] text-3xl mr-4" />
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-[#2B245C]">
                    {connector.name}
                  </h3>
                  <p className="text-sm text-gray-600">
                    Last Sync: {connector.lastSync}
                  </p>
                </div>
                <span
                  className={`px-3 py-1 text-sm font-medium rounded-full ${
                    connector.status === "Connected"
                      ? "bg-green-100 text-green-600"
                      : "bg-red-100 text-red-600"
                  }`}
                >
                  {connector.status}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <p className="text-sm text-gray-600">
                  API Key: {connector.apiKey}
                </p>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleSyncConnector(connector.id)}
                    className="bg-[#2B245C] border border-[#2B245C] text-white text-sm font-semibold px-3 py-1 rounded-lg hover:bg-opacity-90 flex items-center"
                  >
                    <FaSyncAlt className="mr-2" /> Sync
                  </button>
                  <button
                    onClick={() => handleDeleteConnector(connector.id)}
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

export default SSOIntegrations;
