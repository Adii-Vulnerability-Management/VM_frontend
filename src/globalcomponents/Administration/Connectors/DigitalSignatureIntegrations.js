import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import CustomAxios from "@/globalcomponents/CustomAxios";
import { baseurl, initURL } from "../../../../BaseUrl";
import { FaSyncAlt, FaTrashAlt, FaPlusCircle } from "react-icons/fa";

const DigitalSignatureIntegrations = () => {
  const [tools, setTools] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [editingId, setEditingId] = useState(null);

  const [newTool, setNewTool] = useState({
    tool: "",
    name: "",
    apiKey: "",
  });

  const availableTools = [
    { label: "DocuSign", value: "docusign" },
    { label: "Adobe Sign", value: "adobe_sign" },
    { label: "HelloSign", value: "hellosign" },
  ];

  const fetchTools = async () => {
    try {
      setLoading(true);

      const res = await CustomAxios.get(
        `${baseurl}/${initURL}/digital-signature-integrations`,
      );

      const list = Array.isArray(res?.data?.docs)
        ? res.data.docs
        : Array.isArray(res?.data)
          ? res.data
          : [];

      setTools(list);
    } catch (error) {
      console.error("Error fetching digital signature integrations:", error);
      toast.error("Failed to load tools");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTools();
  }, []);

  const resetToolForm = () => {
    setEditingId(null);
    setNewTool({
      tool: "",
      name: "",
      apiKey: "",
    });
  };

  const handleEditTool = (tool) => {
    const toolId = tool.id || tool._id;

    setEditingId(toolId);

    setNewTool({
      tool: tool.tool || "",
      name: tool.name || "",
      apiKey: "",
    });

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmitTool = async () => {
    if (!newTool.tool || !newTool.name || !newTool.apiKey) {
      toast.warning("Please fill in all fields");
      return;
    }

    try {
      setSubmitting(true);

      if (editingId) {
        await CustomAxios.patch(
          `${baseurl}/${initURL}/digital-signature-integrations/${editingId}`,
          {
            apiKey: newTool.apiKey,
          },
        );

        toast.success("Tool updated successfully");
      } else {
        await CustomAxios.post(
          `${baseurl}/${initURL}/digital-signature-integrations`,
          {
            tool: newTool.tool,
            name: newTool.name,
            apiKey: newTool.apiKey,
          },
        );

        toast.success("Tool added successfully");
      }

      resetToolForm();
      await fetchTools();
    } catch (error) {
      console.error("Error submitting digital signature integration:", error);
      toast.error(
        editingId ? "Failed to update tool" : "Failed to create tool",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteTool = async (id) => {
    try {
      setActionLoadingId(id);

      await CustomAxios.delete(
        `${baseurl}/${initURL}/digital-signature-integrations/${id}`,
      );

      toast.success("Tool removed successfully");
      await fetchTools();
    } catch (error) {
      console.error("Error deleting tool:", error);
      toast.error("Failed to delete tool");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleSyncTool = async (id) => {
    try {
      setActionLoadingId(id);

      await CustomAxios.post(
        `${baseurl}/${initURL}/digital-signature-integrations/${id}/sync`,
      );

      toast.success("Tool synced successfully");
      await fetchTools();
    } catch (error) {
      console.error("Error syncing tool:", error);
      toast.error("Failed to sync tool");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleTestTool = async (id) => {
    try {
      setActionLoadingId(id);

      await CustomAxios.post(
        `${baseurl}/${initURL}/digital-signature-integrations/${id}/test`,
      );

      toast.success("Connection successful");
      await fetchTools();
    } catch (error) {
      console.error("Error testing tool:", error);
      toast.error("Connection failed");
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <div className="p-2 min-h-screen">
      <h2 className="text-2xl font-bold text-[#2B245C] mb-1">
        Digital Signature Integrations
      </h2>

      <p className="text-gray-600 text-sm mb-6">
        Manage digital signature tools like DocuSign, Adobe Sign, and HelloSign.
      </p>

      {/* FORM */}

      <div className="mb-5 rounded-2xl border border-[#2B245C] bg-white p-6 shadow-lg hover:shadow-2xl transition-shadow duration-300">
        <h3 className="text-2xl font-bold text-[#2B245C] mb-1">
          {editingId ? "Edit Tool" : "Add New Tool"}
        </h3>

        <p className="text-gray-600 text-sm mb-4">
          {editingId
            ? "Update the selected digital signature tool."
            : "Connect a new digital signature tool by selecting name and API key."}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-semibold mb-2">
              Select Tool
            </label>
            <select
              disabled={!!editingId}
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-900 focus:border-indigo-500 focus:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-indigo-200 transition-all"
              value={newTool.tool}
              onChange={(e) => {
                const selected = availableTools.find(
                  (t) => t.value === e.target.value,
                );

                setNewTool({
                  ...newTool,
                  tool: selected?.value || "",
                  name: selected?.label || "",
                });
              }}
            >
              <option value="">-- Select Tool --</option>

              {availableTools.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold mb-2">API Key</label>
            <input
              type="text"
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-indigo-200 transition-all"
              placeholder={editingId ? "Enter new API key" : "Enter API key"}
              value={newTool.apiKey}
              onChange={(e) =>
                setNewTool({ ...newTool, apiKey: e.target.value })
              }
            />
          </div>
        </div>

        <button
          onClick={handleSubmitTool}
          disabled={submitting}
          className="mt-5 inline-flex items-center gap-2 rounded-lg bg-[#2B245C] px-6 py-2.5 text-sm font-semibold text-white shadow-md hover:shadow-lg hover:bg-opacity-90 disabled:opacity-60 transition-all"
        >
          <FaPlusCircle />
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
            className="mt-5 ml-3 inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-6 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-all"
          >
            Cancel Edit
          </button>
        )}
      </div>

      {/* LIST */}

      <h3 className="text-2xl font-bold text-[#2B245C] mb-3">All Tools</h3>

      {loading ? (
        <p className="text-sm text-gray-600">Loading...</p>
      ) : tools.length === 0 ? (
        <p className="text-sm text-gray-600">
          No tools found
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tools.map((tool) => {
            const toolId = tool.id || tool._id;

            return (
              <div
                key={toolId}
                className="rounded-2xl border border-[#2B245C] bg-white p-6 shadow-lg hover:shadow-2xl transition-shadow duration-300"
              >
                <div className="flex justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-[#2B245C]">
                      {tool.name}
                    </h3>

                    <p className="text-sm text-gray-600">
                      Last Sync: {tool.lastSync || tool.lastSyncedAt || "N/A"}
                    </p>
                  </div>

                  <span
                    className={`px-3 py-1 rounded-full text-sm ${
                      (tool.status || "").toLowerCase() === "connected"
                        ? "bg-green-100 text-green-600"
                        : "bg-red-100 text-red-600"
                    }`}
                  >
                    {tool.status || "Unknown"}
                  </span>
                </div>

                <div className="mb-4">
                  <p className="text-sm text-gray-600">
                    <strong>Tool:</strong> {tool.tool}
                  </p>
                  <p className="text-sm text-gray-600">
                    <strong>API Key:</strong> Configured
                  </p>
                </div>

                <div className="flex flex-wrap gap-2 items-center">
                  <button
                    onClick={() => handleTestTool(toolId)}
                    disabled={actionLoadingId === toolId}
                    className="bg-purple-50 border border-purple-700 text-purple-700 text-sm font-semibold px-3 py-1 rounded-lg hover:bg-purple-100 disabled:opacity-60"
                  >
                    Test
                  </button>

                  <button
                    onClick={() => handleEditTool(tool)}
                    disabled={actionLoadingId === toolId}
                    className="bg-blue-50 border border-blue-700 text-blue-700 text-sm font-semibold px-3 py-1 rounded-lg hover:bg-blue-100 disabled:opacity-60"
                  >
                    Edit
                  </button>

                  <button
                    onClick={() => handleSyncTool(toolId)}
                    disabled={actionLoadingId === toolId}
                    className="bg-green-50 border border-green-700 text-green-700 text-sm font-semibold px-3 py-1 rounded-lg hover:bg-green-100 disabled:opacity-60"
                  >
                    Sync
                  </button>

                  <button
                    onClick={() => handleDeleteTool(toolId)}
                    disabled={actionLoadingId === toolId}
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
  );
};

export default DigitalSignatureIntegrations;
