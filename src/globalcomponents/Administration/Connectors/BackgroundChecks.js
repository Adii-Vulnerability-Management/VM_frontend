import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import CustomAxios from "@/globalcomponents/CustomAxios";
import { baseurl, initURL } from "../../../../BaseUrl";
import { FaSyncAlt, FaTrashAlt, FaPlusCircle } from "react-icons/fa";

const BackgroundChecks = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [editingId, setEditingId] = useState(null);

  const [newService, setNewService] = useState({
    tool: "",
    name: "",
    apiKey: "",
  });

  const availableServices = [
    { label: "Certn", value: "certn" },
    { label: "Checkr", value: "checkr" },
    { label: "KarmaCheck", value: "karmacheck" },
  ];

  const fetchServices = async () => {
    try {
      setLoading(true);

      const res = await CustomAxios.get(
        `${baseurl}/${initURL}/background-checks`,
      );

      const list = Array.isArray(res?.data?.docs)
        ? res.data.docs
        : Array.isArray(res?.data)
          ? res.data
          : [];

      setServices(list);
    } catch (error) {
      console.error("Error fetching background check integrations:", error);
      toast.error("Failed to load services");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const resetServiceForm = () => {
    setEditingId(null);
    setNewService({
      tool: "",
      name: "",
      apiKey: "",
    });
  };

  const handleEditService = (service) => {
    const serviceId = service.id || service._id;

    setEditingId(serviceId);
    setNewService({
      tool: service.tool || "",
      name: service.name || "",
      apiKey: "",
    });

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmitService = async () => {
    if (!newService.tool || !newService.name || !newService.apiKey) {
      toast.warning("Please fill in all fields");
      return;
    }

    try {
      setSubmitting(true);

      if (editingId) {
        await CustomAxios.patch(
          `${baseurl}/${initURL}/background-checks/${editingId}`,
          {
            apiKey: newService.apiKey,
          },
        );

        toast.success("Service updated successfully");
      } else {
        await CustomAxios.post(`${baseurl}/${initURL}/background-checks`, {
          tool: newService.tool,
          name: newService.name,
          apiKey: newService.apiKey,
        });

        toast.success("Service added successfully");
      }

      resetServiceForm();
      await fetchServices();
    } catch (error) {
      console.error("Error submitting background check integration:", error);
      toast.error(
        editingId ? "Failed to update service" : "Failed to create service",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteService = async (id) => {
    try {
      setActionLoadingId(id);

      await CustomAxios.delete(`${baseurl}/${initURL}/background-checks/${id}`);

      toast.success("Service removed successfully");
      await fetchServices();
    } catch (error) {
      console.error("Error deleting background check integration:", error);
      toast.error("Failed to delete service");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleSyncService = async (id) => {
    try {
      setActionLoadingId(id);

      await CustomAxios.post(
        `${baseurl}/${initURL}/background-checks/${id}/sync`,
      );

      toast.success("Service synced successfully");
      await fetchServices();
    } catch (error) {
      console.error("Error syncing background check integration:", error);
      toast.error("Failed to sync service");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleTestService = async (id) => {
    try {
      setActionLoadingId(id);

      await CustomAxios.post(
        `${baseurl}/${initURL}/background-checks/${id}/test`,
      );

      toast.success("Connection successful");
      await fetchServices();
    } catch (error) {
      console.error("Error testing background check integration:", error);
      toast.error("Connection failed");
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <div className="p-2 min-h-screen">
      <h2 className="text-2xl font-bold text-[#2B245C] mb-1">
        Background Checks Integration
      </h2>
      <p className="text-gray-600 text-sm mb-6">
        Manage integrations with background check tools like Certn, Checkr, and
        KarmaCheck for employee credential verification.
      </p>

      <div className="mb-5 rounded-2xl border border-[#2B245C] bg-white p-6 shadow-lg hover:shadow-2xl transition-shadow duration-300">
        <h3 className="text-2xl font-bold text-[#2B245C] mb-1">
          {editingId ? "Edit Service" : "Add New Service"}
        </h3>
        <p className="text-gray-600 text-sm mb-4">
          {editingId
            ? "Update the selected background check service."
            : "Connect a new background check tool by selecting its name and providing its API key."}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-2">
              Select Service
            </label>
            <select
              disabled={!!editingId}
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-900 focus:border-indigo-500 focus:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-indigo-200 transition-all disabled:opacity-60"
              value={newService.tool}
              onChange={(e) => {
                const selected = availableServices.find(
                  (service) => service.value === e.target.value,
                );

                setNewService({
                  ...newService,
                  tool: selected?.value || "",
                  name: selected?.label || "",
                });
              }}
            >
              <option value="">-- Select a Service --</option>
              {availableServices.map((service) => (
                <option key={service.value} value={service.value}>
                  {service.label}
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
              value={newService.apiKey}
              onChange={(e) =>
                setNewService({ ...newService, apiKey: e.target.value })
              }
            />
          </div>
        </div>

        <button
          onClick={handleSubmitService}
          disabled={submitting}
          className="mt-5 inline-flex items-center gap-2 rounded-lg bg-[#2B245C] px-6 py-2.5 text-sm font-semibold text-white shadow-md hover:shadow-lg hover:bg-opacity-90 disabled:opacity-60 transition-all"
        >
          <FaPlusCircle />{" "}
          {submitting
            ? editingId
              ? "Updating..."
              : "Adding..."
            : editingId
              ? "Update Service"
              : "Add Service"}
        </button>

        {editingId && (
          <button
            onClick={resetServiceForm}
            type="button"
            className="mt-5 ml-3 inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-6 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-all"
          >
            Cancel Edit
          </button>
        )}
      </div>

      <div>
        <h3 className="text-2xl font-bold text-[#2B245C] mb-3">All Services</h3>

        {loading ? (
          <p className="text-sm text-gray-600">Loading services...</p>
        ) : services.length === 0 ? (
          <p className="text-sm text-gray-600">No services found.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service) => {
              const serviceId = service.id || service._id;

              return (
                <div
                  key={serviceId}
                  className="rounded-2xl border border-[#2B245C] bg-white p-6 shadow-lg hover:shadow-2xl transition-shadow duration-300"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-[#2B245C]">
                        {service.name}
                      </h3>
                      <p className="text-sm text-gray-600">
                        Last Check:{" "}
                        {service.lastCheck || service.lastSyncedAt || "N/A"}
                      </p>
                    </div>
                    <span
                      className={`px-3 py-1 text-sm font-medium rounded-full ${
                        (service.status || "").toLowerCase() === "connected"
                          ? "bg-green-100 text-green-600"
                          : "bg-red-100 text-red-600"
                      }`}
                    >
                      {service.status || "Unknown"}
                    </span>
                  </div>

                  <div className="mb-4">
                    <p className="text-sm text-gray-600">
                      <strong>Tool:</strong> {service.tool || "N/A"}
                    </p>
                    <p className="text-sm text-gray-600">
                      <strong>API Key:</strong> Configured
                    </p>
                  </div>

                <div className="flex flex-wrap gap-2 items-center">
                    <button
                      onClick={() => handleTestService(serviceId)}
                      disabled={actionLoadingId === serviceId}
                      className="bg-purple-50 border border-purple-700 text-purple-700 text-sm font-semibold px-3 py-1 rounded-lg hover:bg-purple-100 disabled:opacity-60"
                    >
                      Test
                    </button>

                    <button
                      onClick={() => handleEditService(service)}
                      disabled={actionLoadingId === serviceId}
                      className="bg-blue-50 border border-blue-700 text-blue-700 text-sm font-semibold px-3 py-1 rounded-lg hover:bg-blue-100 disabled:opacity-60"
                    >
                      Edit
                    </button>

                    <button
                      onClick={() => handleSyncService(serviceId)}
                      disabled={actionLoadingId === serviceId}
                      className="bg-green-50 border border-green-700 text-green-700 text-sm font-semibold px-3 py-1 rounded-lg hover:bg-green-100 disabled:opacity-60"
                    >
                      Sync
                    </button>

                    <button
                      onClick={() => handleDeleteService(serviceId)}
                      disabled={actionLoadingId === serviceId}
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

export default BackgroundChecks;
