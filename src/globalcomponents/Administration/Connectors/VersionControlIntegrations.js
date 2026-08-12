import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import CustomAxios from "@/globalcomponents/CustomAxios";
import { baseurl, initURL } from "../../../../BaseUrl";
import {
  FaCodeBranch,
  FaSyncAlt,
  FaTrashAlt,
  FaPlusCircle,
} from "react-icons/fa";

const VersionControlIntegrations = () => {
  const [repositories, setRepositories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState(null);

  const [newRepo, setNewRepo] = useState({
    tool: "",
    name: "",
    apiKey: "",
  });

  const [editingId, setEditingId] = useState(null);

  const availableRepos = [
    { label: "GitHub", value: "github" },
    { label: "GitLab", value: "gitlab" },
    { label: "Bitbucket", value: "bitbucket" },
  ];

  const fetchRepositories = async () => {
    try {
      setLoading(true);

      const res = await CustomAxios.get(
        `${baseurl}/${initURL}/version-control-integrations`,
      );

      const list = Array.isArray(res?.data?.docs)
        ? res.data.docs
        : Array.isArray(res?.data)
          ? res.data
          : [];

      setRepositories(list);
    } catch (error) {
      console.error("Error fetching version control integrations:", error);
      toast.error("Failed to load repositories");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRepositories();
  }, []);

  const handleSubmitRepo = async () => {
    if (!newRepo.tool || !newRepo.name || !newRepo.apiKey) {
      toast.warning("Please fill in all fields");
      return;
    }

    try {
      setSubmitting(true);

      if (editingId) {
        await CustomAxios.patch(
          `${baseurl}/${initURL}/version-control-integrations/${editingId}`,
          {
            apiKey: newRepo.apiKey,
          },
        );

        toast.success("Repository updated successfully");
      } else {
        await CustomAxios.post(
          `${baseurl}/${initURL}/version-control-integrations`,
          {
            tool: newRepo.tool,
            name: newRepo.name,
            apiKey: newRepo.apiKey,
          },
        );

        toast.success("Repository added successfully");
      }

      resetRepoForm();
      await fetchRepositories();
    } catch (error) {
      console.error("Error submitting repository:", error);
      toast.error(
        editingId
          ? "Failed to update repository"
          : "Failed to create repository",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditRepo = (repo) => {
    const repoId = repo.id || repo._id;

    setEditingId(repoId);
    setNewRepo({
      tool: repo.tool || "",
      name: repo.name || "",
      apiKey: "",
    });
  };

  const resetRepoForm = () => {
    setEditingId(null);
    setNewRepo({
      tool: "",
      name: "",
      apiKey: "",
    });
  };

  const handleDeleteRepo = async (id) => {
    try {
      setActionLoadingId(id);

      await CustomAxios.delete(
        `${baseurl}/${initURL}/version-control-integrations/${id}`,
      );

      toast.success("Repository removed successfully");
      await fetchRepositories();
    } catch (error) {
      console.error("Error deleting version control integration:", error);
      toast.error("Failed to delete repository");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleSyncRepo = async (id) => {
    try {
      setActionLoadingId(id);

      await CustomAxios.post(
        `${baseurl}/${initURL}/version-control-integrations/${id}/sync`,
      );

      toast.success("Repository synced successfully");
      await fetchRepositories();
    } catch (error) {
      console.error("Error syncing version control integration:", error);
      toast.error("Failed to sync repository");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleTestRepo = async (id) => {
    try {
      setActionLoadingId(id);

      await CustomAxios.post(
        `${baseurl}/${initURL}/version-control-integrations/${id}/test`,
      );

      toast.success("Connection successful");
      await fetchRepositories();
    } catch (error) {
      console.error("Error testing version control integration:", error);
      toast.error("Connection failed");
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <div className="p-2 min-h-screen">
      <h2 className="text-2xl font-bold text-[#2B245C] mb-1">
        Version Control Integrations
      </h2>
      <p className="text-gray-600 text-sm mb-6">
        Manage version control tools like GitHub, GitLab, and Bitbucket to track
        code changes, ensure compliance, and automate testing.
      </p>

      {/* Add New Repository */}
      <div className="mb-5 rounded-2xl border border-[#2B245C] bg-white p-6 shadow-lg hover:shadow-2xl transition-shadow duration-300">
        <h3 className="text-2xl font-bold text-[#2B245C] mb-1">
          {editingId ? "Edit Repository" : "Add New Repository"}
        </h3>
        <p className="text-gray-600 text-sm mb-4">
          {editingId
            ? "Update the selected version control tool details."
            : "Connect a new version control tool by selecting its name and providing its API key."}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-2">
              Select Tool
            </label>
            <select
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-900 focus:border-indigo-500 focus:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-indigo-200 transition-all"
              value={newRepo.tool}
              disabled={!!editingId}
              onChange={(e) => {
                const selected = availableRepos.find(
                  (repo) => repo.value === e.target.value,
                );

                setNewRepo({
                  ...newRepo,
                  tool: selected?.value || "",
                  name: selected?.label || "",
                });
              }}
            >
              <option value="">-- Select a Tool --</option>
              {availableRepos.map((repo) => (
                <option key={repo.value} value={repo.value}>
                  {repo.label}
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
              placeholder={editingId ? "Enter new API key" : "Enter API key"}
              value={newRepo.apiKey}
              onChange={(e) =>
                setNewRepo({ ...newRepo, apiKey: e.target.value })
              }
            />
          </div>
        </div>

        <button
          onClick={handleSubmitRepo}
          disabled={submitting}
          className="mt-5 inline-flex items-center gap-2 rounded-lg bg-[#2B245C] px-6 py-2.5 text-sm font-semibold text-white shadow-md hover:shadow-lg hover:bg-opacity-90 disabled:opacity-60 transition-all"
        >
          <FaPlusCircle />
          {submitting
            ? editingId
              ? "Updating..."
              : "Adding..."
            : editingId
              ? "Update Repository"
              : "Add Repository"}
        </button>

        {editingId && (
          <button
            onClick={resetRepoForm}
            type="button"
            className="mt-5 ml-3 inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-6 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-all"
          >
            Cancel Edit
          </button>
        )}
      </div>

      {/* Repositories List */}
      <div>
        <h3 className="text-2xl font-bold text-[#2B245C] mb-3">
          All Repositories
        </h3>

        {loading ? (
          <p className="text-sm text-gray-600">Loading repositories...</p>
        ) : repositories.length === 0 ? (
          <p className="text-sm text-gray-600">No repositories found.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {repositories.map((repo) => {
              const repoId = repo.id || repo._id;

              return (
                <div
                  key={repoId}
                  className="rounded-2xl border border-[#2B245C] bg-white p-6 shadow-lg hover:shadow-2xl transition-shadow duration-300"
                >
                  <div className="flex items-center justify-between mb-4">
                    <FaCodeBranch className="text-[#52B0CA] text-3xl mr-4" />
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-[#2B245C]">
                        {repo.name}
                      </h3>
                      <p className="text-sm text-gray-600">
                        Last Sync: {repo.lastSync || repo.lastSyncedAt || "N/A"}
                      </p>
                    </div>
                    <span
                      className={`px-3 py-1 text-sm font-medium rounded-full ${
                        (repo.status || "").toLowerCase() === "connected"
                          ? "bg-green-100 text-green-600"
                          : "bg-red-100 text-red-600"
                      }`}
                    >
                      {repo.status || "Unknown"}
                    </span>
                  </div>

                  <div className="mb-4">
                    <p className="text-sm text-gray-600">
                      <strong>Tool:</strong> {repo.tool || "N/A"}
                    </p>
                    <p className="text-sm text-gray-600">
                      <strong>API Key:</strong> Configured
                    </p>
                  </div>

                <div className="flex flex-wrap gap-2 items-center">
                    <button
                      onClick={() => handleTestRepo(repoId)}
                      disabled={actionLoadingId === repoId}
                      className="bg-purple-50 border border-purple-700 text-purple-700 text-sm font-semibold px-3 py-1 rounded-lg hover:bg-purple-100 disabled:opacity-60"
                    >
                      Test
                    </button>

                    <button
                      onClick={() => handleEditRepo(repo)}
                      disabled={actionLoadingId === repoId}
                      className="bg-blue-50 border border-blue-700 text-blue-700 text-sm font-semibold px-3 py-1 rounded-lg hover:bg-blue-100 disabled:opacity-60"
                    >
                      Edit
                    </button>

                    <button
                      onClick={() => handleSyncRepo(repoId)}
                      disabled={actionLoadingId === repoId}
                      className="bg-green-50 border border-green-700 text-green-700 text-sm font-semibold px-3 py-1 rounded-lg hover:bg-green-100 disabled:opacity-60"
                    >
                      Sync
                    </button>

                    <button
                      onClick={() => handleDeleteRepo(repoId)}
                      disabled={actionLoadingId === repoId}
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

export default VersionControlIntegrations;
