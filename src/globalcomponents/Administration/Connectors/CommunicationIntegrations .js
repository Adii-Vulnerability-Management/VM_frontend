import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import CustomAxios from "@/globalcomponents/CustomAxios";
import { baseurl, initURL } from "../../../../BaseUrl";
import {
  FaSlack,
  FaMicrosoft,
  FaSyncAlt,
  FaTrashAlt,
  FaPlusCircle,
} from "react-icons/fa";

const CommunicationIntegrations = () => {
  const [platforms, setPlatforms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState(null);

  const [newPlatform, setNewPlatform] = useState({
    tool: "",
    name: "",
    webhookUrl: "",
  });

  const [editingId, setEditingId] = useState(null);

  const availablePlatforms = [
    { label: "Slack", value: "slack" },
    { label: "Microsoft Teams", value: "microsoft_teams" },
  ];

  const fetchPlatforms = async () => {
    try {
      setLoading(true);

      const res = await CustomAxios.get(
        `${baseurl}/${initURL}/communication-integrations`,
      );

      const list = Array.isArray(res?.data?.docs)
        ? res.data.docs
        : Array.isArray(res?.data)
          ? res.data
          : [];

      setPlatforms(list);
    } catch (error) {
      console.error("Error fetching communication integrations:", error);
      toast.error("Failed to load platforms");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlatforms();
  }, []);

  const handleSubmitPlatform = async () => {
    if (!newPlatform.tool || !newPlatform.name || !newPlatform.webhookUrl) {
      toast.warning("Please fill in all fields");
      return;
    }

    try {
      setSubmitting(true);

      if (editingId) {
        await CustomAxios.patch(
          `${baseurl}/${initURL}/communication-integrations/${editingId}`,
          {
            webhookUrl: newPlatform.webhookUrl,
          },
        );

        toast.success("Platform updated successfully");
      } else {
        await CustomAxios.post(
          `${baseurl}/${initURL}/communication-integrations`,
          {
            tool: newPlatform.tool,
            name: newPlatform.name,
            webhookUrl: newPlatform.webhookUrl,
          },
        );

        toast.success("Platform added successfully");
      }

      resetPlatformForm();
      await fetchPlatforms();
    } catch (error) {
      console.error("Error submitting platform:", error);
      toast.error(
        editingId ? "Failed to update platform" : "Failed to create platform",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditPlatform = (platform) => {
    const platformId = platform.id || platform._id;

    setEditingId(platformId);
    setNewPlatform({
      tool: platform.tool || "",
      name: platform.name || "",
      webhookUrl: platform.webhookUrl || "",
    });
  };

  const resetPlatformForm = () => {
    setEditingId(null);
    setNewPlatform({
      tool: "",
      name: "",
      webhookUrl: "",
    });
  };

  const handleDeletePlatform = async (id) => {
    try {
      setActionLoadingId(id);

      await CustomAxios.delete(
        `${baseurl}/${initURL}/communication-integrations/${id}`,
      );

      toast.success("Platform removed successfully");
      await fetchPlatforms();
    } catch (error) {
      console.error("Error deleting communication integration:", error);
      toast.error("Failed to delete platform");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleSyncPlatform = async (id) => {
    try {
      setActionLoadingId(id);

      await CustomAxios.post(
        `${baseurl}/${initURL}/communication-integrations/${id}/sync`,
      );

      toast.success("Platform synced successfully");
      await fetchPlatforms();
    } catch (error) {
      console.error("Error syncing communication integration:", error);
      toast.error("Failed to sync platform");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleTestPlatform = async (id) => {
    try {
      setActionLoadingId(id);

      await CustomAxios.post(
        `${baseurl}/${initURL}/communication-integrations/${id}/test`,
      );

      toast.success("Connection successful");
      await fetchPlatforms();
    } catch (error) {
      console.error("Error testing communication integration:", error);
      toast.error("Connection failed");
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <div className="p-2 min-h-screen">
      <h2 className="text-2xl font-bold text-[#2B245C] mb-1">
        Communication Integrations
      </h2>
      <p className="text-gray-600 text-sm mb-6">
        Manage communication tools like Microsoft Teams and Slack for sending
        notifications and collaborating on GRC tasks.
      </p>

      {/* Add New Platform */}
      <div className="mb-5 rounded-2xl border border-[#2B245C] bg-white p-6 shadow-lg hover:shadow-2xl transition-shadow duration-300">
        <h3 className="text-2xl font-bold text-[#2B245C] mb-1">
          {editingId ? "Edit Platform" : "Add New Platform"}
        </h3>
        <p className="text-gray-600 text-sm mb-4">
          {editingId
            ? "Update the selected communication platform details."
            : "Connect a new communication tool by selecting a platform and providing its webhook URL."}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-2">
              Select Platform
            </label>
            <select
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-900 focus:border-indigo-500 focus:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-indigo-200 transition-all"
              value={newPlatform.tool}
              disabled={!!editingId}
              onChange={(e) => {
                const selected = availablePlatforms.find(
                  (platform) => platform.value === e.target.value,
                );

                setNewPlatform({
                  ...newPlatform,
                  tool: selected?.value || "",
                  name: selected?.label || "",
                });
              }}
            >
              <option value="">-- Select a Platform --</option>
              {availablePlatforms.map((platform) => (
                <option key={platform.value} value={platform.value}>
                  {platform.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-2">
              Webhook URL
            </label>
            <input
              type="text"
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-indigo-200 transition-all"
              placeholder="Enter webhook URL"
              value={newPlatform.webhookUrl}
              onChange={(e) =>
                setNewPlatform({ ...newPlatform, webhookUrl: e.target.value })
              }
            />
          </div>
        </div>

        <button
          onClick={handleSubmitPlatform}
          disabled={submitting}
          className="mt-5 inline-flex items-center gap-2 rounded-lg bg-[#2B245C] px-6 py-2.5 text-sm font-semibold text-white shadow-md hover:shadow-lg hover:bg-opacity-90 disabled:opacity-60 transition-all"
        >
          <FaPlusCircle />{" "}
          {submitting
            ? editingId
              ? "Updating..."
              : "Adding..."
            : editingId
              ? "Update Platform"
              : "Add Platform"}
        </button>

        {editingId && (
          <button
            onClick={resetPlatformForm}
            type="button"
            className="mt-5 ml-3 inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-6 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-all"
          >
            Cancel Edit
          </button>
        )}
      </div>

      {/* Platforms List */}
      <div>
        <h3 className="text-2xl font-bold text-[#2B245C] mb-3">
          All Platforms
        </h3>

        {loading ? (
          <p className="text-sm text-gray-600">Loading platforms...</p>
        ) : platforms.length === 0 ? (
          <p className="text-sm text-gray-600">No platforms found.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {platforms.map((platform) => {
              const platformId = platform.id || platform._id;

              return (
                <div
                  key={platformId}
                  className="rounded-2xl border border-[#2B245C] bg-white p-6 shadow-lg hover:shadow-2xl transition-shadow duration-300"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      {(platform.name === "Slack" ||
                        platform.tool === "slack") && (
                        <FaSlack className="text-blue-500 text-3xl mr-4" />
                      )}
                      {(platform.name === "Microsoft Teams" ||
                        platform.tool === "microsoft_teams") && (
                        <FaMicrosoft className="text-purple-500 text-3xl mr-4" />
                      )}
                      <div>
                        <h3 className="text-xl font-bold text-[#2B245C]">
                          {platform.name}
                        </h3>
                        <p className="text-sm text-gray-600">
                          Last Sync:{" "}
                          {platform.lastSync || platform.lastSyncedAt || "N/A"}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`px-3 py-1 text-sm font-medium rounded-full ${
                        (platform.status || "").toLowerCase() === "connected"
                          ? "bg-green-100 text-green-600"
                          : "bg-red-100 text-red-600"
                      }`}
                    >
                      {platform.status || "Unknown"}
                    </span>
                  </div>

                  <div className="mb-4">
                    <p className="text-sm text-gray-600 break-all">
                      <strong>Webhook URL:</strong>{" "}
                      {platform.webhookUrl || "N/A"}
                    </p>
                  </div>

                <div className="flex flex-wrap gap-2 items-center">
                    <button
                      onClick={() => handleTestPlatform(platformId)}
                      disabled={actionLoadingId === platformId}
                      className="bg-purple-50 border border-purple-700 text-purple-700 text-sm font-semibold px-3 py-1 rounded-lg hover:bg-purple-100 disabled:opacity-60"
                    >
                      Test
                    </button>

                    <button
                      onClick={() => handleEditPlatform(platform)}
                      disabled={actionLoadingId === platformId}
                      className="bg-blue-50 border border-blue-700 text-blue-700 text-sm font-semibold px-3 py-1 rounded-lg hover:bg-blue-100 disabled:opacity-60"
                    >
                      Edit
                    </button>

                    <button
                      onClick={() => handleSyncPlatform(platformId)}
                      disabled={actionLoadingId === platformId}
                      className="bg-green-50 border border-green-700 text-green-700 text-sm font-semibold px-3 py-1 rounded-lg hover:bg-green-100 disabled:opacity-60"
                    >
                      Sync
                    </button>

                    <button
                      onClick={() => handleDeletePlatform(platformId)}
                      disabled={actionLoadingId === platformId}
                      className="bg-red-50 border border-red-700 text-red-700 text-sm font-semibold px-3 py-1 rounded-lg hover:bg-red-100 flex items-center disabled:opacity-60"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default CommunicationIntegrations;
