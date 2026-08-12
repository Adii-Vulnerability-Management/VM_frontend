import React, { useEffect, useState } from "react";
import { FaSyncAlt, FaTrashAlt, FaPlusCircle, FaServer } from "react-icons/fa";
import CustomAxios from "@/globalcomponents/CustomAxios";

const API_BASE = "/${initURL}/infrastructure-integrations";

const TOOL_NAME_MAP = {
  aws: "AWS",
  azure: "Azure",
  gcp: "GCP",
  digitalocean: "DigitalOcean",
  heroku: "Heroku",
};

const normalizeTool = (name) =>
  String(name || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "");

const displayNameForTool = (toolOrName) => {
  const key = normalizeTool(toolOrName);
  return TOOL_NAME_MAP[key] || toolOrName || "Unknown";
};

const maskApiKey = (apiKey) => {
  if (!apiKey) return "Not Configured";
  const value = String(apiKey);
  if (value.toLowerCase() === "not configured") return "Not Configured";
  if (value.length <= 4) return `******${value}`;
  return `******${value.slice(-4)}`;
};

const formatDate = (value) => {
  if (!value) return "N/A";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toISOString().split("T")[0];
};

const normalizePlatform = (platform, fallbackId) => ({
  id: platform.id ?? platform._id ?? platform.integrationId ?? fallbackId,
  name: displayNameForTool(platform.name || platform.tool),
  tool: normalizeTool(platform.tool || platform.name),
  status:
    platform.status ||
    (platform.isConnected || platform.connected ? "Connected" : "Disconnected"),
  lastSync: formatDate(platform.lastSync || platform.lastSyncedAt),
  apiKey: maskApiKey(platform.apiKey),
});

const InfrastructureIntegrations = () => {
  // Dummy data (for UI only); API fetch will replace this list.
  // const [platforms, setPlatforms] = useState([
  //   {
  //     id: 1,
  //     name: "AWS",
  //     status: "Connected",
  //     lastSync: "2025-01-10",
  //     apiKey: "******1234",
  //   },
  //   {
  //     id: 2,
  //     name: "Azure",
  //     status: "Disconnected",
  //     lastSync: "N/A",
  //     apiKey: "Not Configured",
  //   },
  //   {
  //     id: 3,
  //     name: "GCP",
  //     status: "Connected",
  //     lastSync: "2025-01-11",
  //     apiKey: "******5678",
  //   },
  // ]);
  const [platforms, setPlatforms] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const [newPlatform, setNewPlatform] = useState({ name: "", apiKey: "" });

  const platformOptions = Object.values(TOOL_NAME_MAP);

  useEffect(() => {
    const loadPlatforms = async () => {
      setIsLoading(true);
      setErrorMsg("");
      try {
        const { data } = await CustomAxios.get(API_BASE);
        const list = Array.isArray(data)
          ? data
          : data?.items || data?.data || [];
        if (Array.isArray(list) && list.length > 0) {
          setPlatforms(
            list.map((item, index) => normalizePlatform(item, index + 1)),
          );
        }
      } catch (error) {
        setErrorMsg("Unable to load infrastructure integrations.");
      } finally {
        setIsLoading(false);
      }
    };

    loadPlatforms();
  }, []);

  const handleAddPlatform = async () => {
    if (!newPlatform.name || !newPlatform.apiKey) return;

    const tool = normalizeTool(newPlatform.name);
    const payload = {
      tool,
      name: displayNameForTool(newPlatform.name),
      apiKey: newPlatform.apiKey,
    };

    try {
      const { data } = await CustomAxios.post(API_BASE, payload);
      const created = data?.data || data || payload;
      setPlatforms((prev) => [
        ...prev,
        normalizePlatform(
          { status: "Connected", lastSync: "N/A", ...created },
          prev.length + 1,
        ),
      ]);
      setNewPlatform({ name: "", apiKey: "" });
    } catch (error) {
      setErrorMsg("Unable to add platform. Please try again.");
    }
  };

  const handleDeletePlatform = async (id) => {
    try {
      await CustomAxios.delete(`${API_BASE}/${id}`);
      setPlatforms((prev) => prev.filter((platform) => platform.id !== id));
    } catch (error) {
      setErrorMsg("Unable to remove platform. Please try again.");
    }
  };

  const handleSyncPlatform = async (id) => {
    try {
      const { data } = await CustomAxios.post(`${API_BASE}/${id}/sync`);
      const nextSync = formatDate(data?.lastSync || data?.lastSyncedAt);
      setPlatforms((prev) =>
        prev.map((platform) =>
          platform.id === id
            ? {
                ...platform,
                lastSync: nextSync !== "N/A" ? nextSync : platform.lastSync,
                status: "Connected",
              }
            : platform,
        ),
      );
    } catch (error) {
      setErrorMsg("Unable to sync platform. Please try again.");
    }
  };

  return (
    <div className="p-2 min-h-screen">
      <h2 className="text-2xl font-bold text-[#2B245C] mb-1">
        Infrastructure Integrations
      </h2>
      <p className="text-gray-600 text-sm mb-6">
        Manage infrastructure tools like AWS, Azure, GCP, DigitalOcean, and
        Heroku to monitor and ensure compliance with security policies.
      </p>
      {errorMsg ? (
        <p className="mb-4 text-sm font-semibold text-red-600">{errorMsg}</p>
      ) : null}

      {/* Add New Platform */}
      <div className="mb-5 rounded-2xl border border-[#2B245C] bg-white p-6 shadow-lg hover:shadow-2xl transition-shadow duration-300">
        <h3 className="text-2xl font-bold text-[#2B245C] mb-1">
          Add New Platform
        </h3>
        <p className="text-gray-600 text-sm mb-4">
          Connect a new infrastructure platform by providing its name and API
          key.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-2">
              Platform Name
            </label>
            <select
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 focus:border-indigo-500 focus:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-indigo-200 transition-all"
              value={newPlatform.name}
              onChange={(e) =>
                setNewPlatform({ ...newPlatform, name: e.target.value })
              }
            >
              <option value="">-- Select a Platform --</option>
              {platformOptions.map((platform) => (
                <option key={platform} value={platform}>
                  {platform}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-2">
              API Key
            </label>
            <input
              type="text"
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-indigo-200 transition-all"
              placeholder="Enter API key"
              value={newPlatform.apiKey}
              onChange={(e) =>
                setNewPlatform({ ...newPlatform, apiKey: e.target.value })
              }
            />
          </div>
        </div>
        <button
          onClick={handleAddPlatform}
          disabled={isLoading}
          className="mt-5 inline-flex items-center gap-2 rounded-lg bg-[#2B245C] px-6 py-2.5 text-sm font-semibold text-white shadow-md hover:shadow-lg hover:bg-opacity-90 disabled:opacity-60 transition-all"
        >
          <FaPlusCircle /> Add Platform
        </button>
      </div>

      {/* Platforms List */}
      <div>
        <h3 className="text-2xl font-bold text-[#2B245C] mb-3">
          All Platforms
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {platforms.map((platform) => (
            <div
              key={platform.id}
              className="rounded-2xl border border-[#2B245C] bg-white p-6 shadow-lg hover:shadow-2xl transition-shadow duration-300"
            >
              <div className="flex items-center justify-between mb-4">
                <FaServer className="text-[#52B0CA] text-3xl mr-4" />
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-[#2B245C]">
                    {platform.name}
                  </h3>
                  <p className="text-sm text-gray-600">
                    Last Sync: {platform.lastSync}
                  </p>
                </div>
                <span
                  className={`px-3 py-1 text-sm font-medium rounded-full ${
                    platform.status === "Connected"
                      ? "bg-green-100 text-green-600"
                      : "bg-red-100 text-red-600"
                  }`}
                >
                  {platform.status}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <p className="text-sm text-gray-600">
                  API Key: {platform.apiKey}
                </p>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleSyncPlatform(platform.id)}
                    className="bg-[#2B245C] border border-[#2B245C] text-white text-sm font-semibold px-3 py-1 rounded-lg hover:bg-opacity-90 flex items-center"
                  >
                    <FaSyncAlt className="mr-2" /> Sync
                  </button>
                  <button
                    onClick={() => handleDeletePlatform(platform.id)}
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

export default InfrastructureIntegrations;
