import React, { useEffect, useMemo, useState } from "react";
import CustomAxios from "@/config/CustomAxios";
import { baseurl, initURL } from "@/config/config";
import {
  FiPlus,
  FiRefreshCw,
  FiRotateCcw,
  FiSave,
  FiX,
} from "react-icons/fi";
import { toast } from "react-toastify";

const TABS = [
  { key: "systems", label: "Client Systems" },
  { key: "events", label: "Sync Events" },
  { key: "deliveries", label: "Deliveries" },
  { key: "logs", label: "Audit Logs" },
];

const SYSTEM_TYPES = [
  "CRM",
  "CDP",
  "DWH",
  "MARKETING_PLATFORM",
  "VENDOR",
  "INTERNAL_API",
  "OTHER",
];

const PROVIDERS = [
  "HIGHLEVEL",
  "GENERIC_WEBHOOK",
  "GENERIC_API",
];

const DELIVERY_METHODS = ["API", "WEBHOOK"];

const EVENT_TYPES = [
  "CONSENT_CONFIRMED",
  "CONSENT_UPDATED",
  "CONSENT_WITHDRAWN",
  "CONSENT_EXPIRED",
  "IDENTITY_LINKED",
];

const EMPTY_FORM = {
  name: "",
  systemType: "CRM",
  provider: "GENERIC_WEBHOOK",
  deliveryMethod: "WEBHOOK",
  enabled: true,
  subscribedEvents: ["CONSENT_CONFIRMED"],
  configuration: '{\n  "webhookUrl": ""\n}',
  secretReferences: "{}",
  metadata: "{}",
};

const formatDateTime = (value) => {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "—" : date.toLocaleString();
};

const statusClass = (status = "") => {
  const value = String(status).toUpperCase();

  if (["DELIVERED", "ENABLED"].includes(value)) {
    return "border-emerald-200 bg-emerald-50 text-emerald-700";
  }

  if (["FAILED", "DEAD_LETTER", "DISABLED"].includes(value)) {
    return "border-red-200 bg-red-50 text-red-700";
  }

  if (["PENDING", "PROCESSING", "DISPATCHED"].includes(value)) {
    return "border-amber-200 bg-amber-50 text-amber-700";
  }

  if (value === "PARTIALLY_DELIVERED") {
    return "border-blue-200 bg-blue-50 text-blue-700";
  }

  return "border-gray-200 bg-gray-50 text-gray-700";
};

function StatusBadge({ value }) {
  return (
    <span
      className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${statusClass(
        value,
      )}`}
    >
      {value || "UNKNOWN"}
    </span>
  );
}

function EmptyRow({ colSpan, message }) {
  return (
    <tr>
      <td
        colSpan={colSpan}
        className="px-4 py-10 text-center text-sm text-gray-500"
      >
        {message}
      </td>
    </tr>
  );
}

export default function IntegrationSyncPage() {
  const apiBase = `${baseurl}/${initURL}/cmp/integration-sync`;
  const auditApi = `${baseurl}/${initURL}/privacy-audit-logs`;

  const [activeTab, setActiveTab] = useState("systems");
  const [tenantId, setTenantId] = useState("acme-tenant");

  const [systems, setSystems] = useState([]);
  const [events, setEvents] = useState([]);
  const [deliveries, setDeliveries] = useState([]);
  const [logs, setLogs] = useState([]);
  const [selectedLog, setSelectedLog] = useState(null);

  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);

  const activeCount = useMemo(
    () => systems.filter((item) => item.enabled).length,
    [systems],
  );

  const loadData = async () => {
    if (!tenantId.trim()) {
      toast.error("Enter tenant ID.");
      return;
    }

    setLoading(true);
    try {
      const [systemsRes, eventsRes, deliveriesRes, logsRes] = await Promise.all([
        CustomAxios.get(`${apiBase}/client-systems`, {
          params: { tenantId: tenantId.trim() },
        }),
        CustomAxios.get(`${apiBase}/events`, {
          params: { tenantId: tenantId.trim(), limit: 50 },
        }),
        CustomAxios.get(`${apiBase}/deliveries`, {
          params: { tenantId: tenantId.trim(), limit: 50 },
        }),
        CustomAxios.get(auditApi, {
          params: {
            module: "INTEGRATION_SYNC",
            tenantId: tenantId.trim(),
            limit: 500,
          },
        }),
      ]);

      setSystems(Array.isArray(systemsRes.data) ? systemsRes.data : []);
      setEvents(Array.isArray(eventsRes.data) ? eventsRes.data : []);
      setDeliveries(
        Array.isArray(deliveriesRes.data)
          ? deliveriesRes.data
          : deliveriesRes.data?.items || [],
      );
      setLogs(
        Array.isArray(logsRes.data)
          ? logsRes.data
          : logsRes.data?.items || [],
      );
    } catch (error) {
      console.error(error);
      toast.error(
        error?.response?.data?.message ||
          "Unable to load Integration Sync data.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggleSubscribedEvent = (eventType) => {
    setForm((current) => {
      const exists = current.subscribedEvents.includes(eventType);

      return {
        ...current,
        subscribedEvents: exists
          ? current.subscribedEvents.filter((item) => item !== eventType)
          : [...current.subscribedEvents, eventType],
      };
    });
  };

  const parseJsonObject = (value, label) => {
    const parsed = JSON.parse(value || "{}");

    if (
      parsed === null ||
      Array.isArray(parsed) ||
      typeof parsed !== "object"
    ) {
      throw new Error(`${label} must be a JSON object.`);
    }

    return parsed;
  };

  const createClientSystem = async (event) => {
    event.preventDefault();

    if (!tenantId.trim()) {
      toast.error("Enter tenant ID.");
      return;
    }

    if (!form.name.trim()) {
      toast.error("Enter system name.");
      return;
    }

    if (form.subscribedEvents.length === 0) {
      toast.error("Select at least one subscribed event.");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        tenantId: tenantId.trim(),
        name: form.name.trim(),
        systemType: form.systemType,
        provider: form.provider,
        deliveryMethod: form.deliveryMethod,
        enabled: form.enabled,
        subscribedEvents: form.subscribedEvents,
        configuration: parseJsonObject(
          form.configuration,
          "Configuration",
        ),
        secretReferences: parseJsonObject(
          form.secretReferences,
          "Secret references",
        ),
        metadata: parseJsonObject(form.metadata, "Metadata"),
      };

      await CustomAxios.post(`${apiBase}/client-systems`, payload);

      toast.success("Client system created.");
      setForm(EMPTY_FORM);
      setShowForm(false);
      await loadData();
    } catch (error) {
      console.error(error);
      toast.error(
        error?.message ||
          error?.response?.data?.message ||
          "Unable to create client system.",
      );
    } finally {
      setSaving(false);
    }
  };

  const toggleClientSystem = async (item) => {
    try {
      await CustomAxios.patch(
        `${apiBase}/client-systems/${item._id}`,
        { enabled: !item.enabled },
        { params: { tenantId: tenantId.trim() } },
      );

      toast.success(
        `Client system ${item.enabled ? "disabled" : "enabled"}.`,
      );
      await loadData();
    } catch (error) {
      console.error(error);
      toast.error(
        error?.response?.data?.message ||
          "Unable to update client system.",
      );
    }
  };

  const retryDelivery = async (deliveryId) => {
    try {
      await CustomAxios.post(
        `${apiBase}/deliveries/${deliveryId}/retry`,
        {},
        { params: { tenantId: tenantId.trim() } },
      );

      toast.success("Delivery moved to pending.");
      await loadData();
    } catch (error) {
      console.error(error);
      toast.error(
        error?.response?.data?.message || "Unable to retry delivery.",
      );
    }
  };

  const processNow = async () => {
    setProcessing(true);
    try {
      const { data } = await CustomAxios.post(
        `${apiBase}/process-now`,
        {},
      );

      toast.success(`Processed ${data?.processed || 0} delivery record(s).`);
      await loadData();
    } catch (error) {
      console.error(error);
      toast.error(
        error?.response?.data?.message ||
          "Unable to process pending deliveries.",
      );
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-5">
      <div className="mx-auto max-w-[1600px] space-y-5">
        <header className="rounded-2xl bg-[#2B245C] px-6 py-7 text-white shadow-lg">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white">Integration Sync</h1>
              <p className="mt-1 text-sm text-white/80">
                Configure and monitor consent delivery to CRM, CDP, data
                warehouse, webhook, API, and other connected systems.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={processNow}
                disabled={processing}
                className="inline-flex items-center rounded-lg border border-white/30 bg-white/10 px-4 py-2 text-sm font-medium text-white hover:bg-white/20 disabled:opacity-60"
              >
                <FiRotateCcw
                  className={`mr-2 ${processing ? "animate-spin" : ""}`}
                />
                Process Pending
              </button>

              <button
                type="button"
                onClick={loadData}
                disabled={loading}
                className="inline-flex items-center rounded-lg bg-white px-4 py-2 text-sm font-semibold text-[#2B245C] hover:bg-gray-100 disabled:opacity-60"
              >
                <FiRefreshCw
                  className={`mr-2 ${loading ? "animate-spin" : ""}`}
                />
                Refresh
              </button>
            </div>
          </div>
        </header>

        <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div className="w-full max-w-md">
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Tenant ID
              </label>
              <input
                type="text"
                value={tenantId}
                onChange={(event) => setTenantId(event.target.value)}
                placeholder="Enter tenant ID"
                className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none focus:border-[#2B245C] focus:ring-2 focus:ring-[#2B245C]/10"
              />
            </div>

            <div className="flex flex-wrap gap-2 text-sm">
              <span className="rounded-full bg-gray-100 px-3 py-1.5 text-gray-700">
                Systems: {systems.length}
              </span>
              <span className="rounded-full bg-emerald-50 px-3 py-1.5 text-emerald-700">
                Enabled: {activeCount}
              </span>
              <span className="rounded-full bg-blue-50 px-3 py-1.5 text-blue-700">
                Events: {events.length}
              </span>
              <span className="rounded-full bg-amber-50 px-3 py-1.5 text-amber-700">
                Deliveries: {deliveries.length}
              </span>
              <span className="rounded-full bg-purple-50 px-3 py-1.5 text-purple-700">
                Audit Logs: {logs.length}
              </span>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-3 border-b border-gray-200 pb-4 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-wrap gap-2">
              {TABS.map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveTab(tab.key)}
                  className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                    activeTab === tab.key
                      ? "bg-[#2B245C] text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {activeTab === "systems" && (
              <button
                type="button"
                onClick={() => setShowForm((value) => !value)}
                className="inline-flex items-center rounded-lg bg-[#2B245C] px-4 py-2 text-sm font-medium text-white hover:bg-[#211b49]"
              >
                {showForm ? (
                  <FiX className="mr-2" />
                ) : (
                  <FiPlus className="mr-2" />
                )}
                {showForm ? "Close Form" : "Add Client System"}
              </button>
            )}
          </div>

          {activeTab === "systems" && (
            <div className="mt-5 space-y-5">
              {showForm && (
                <form
                  onSubmit={createClientSystem}
                  className="rounded-xl border border-gray-200 bg-gray-50 p-5"
                >
                  <h2 className="text-lg font-semibold text-gray-900">
                    New Client System
                  </h2>

                  <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    <label className="text-sm">
                      <span className="mb-1 block font-medium text-gray-700">
                        System Name
                      </span>
                      <input
                        type="text"
                        value={form.name}
                        onChange={(event) =>
                          setForm((current) => ({
                            ...current,
                            name: event.target.value,
                          }))
                        }
                        className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 outline-none focus:border-[#2B245C]"
                      />
                    </label>

                    <label className="text-sm">
                      <span className="mb-1 block font-medium text-gray-700">
                        System Type
                      </span>
                      <select
                        value={form.systemType}
                        onChange={(event) =>
                          setForm((current) => ({
                            ...current,
                            systemType: event.target.value,
                          }))
                        }
                        className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 outline-none"
                      >
                        {SYSTEM_TYPES.map((item) => (
                          <option key={item}>{item}</option>
                        ))}
                      </select>
                    </label>

                    <label className="text-sm">
                      <span className="mb-1 block font-medium text-gray-700">
                        Provider
                      </span>
                      <select
                        value={form.provider}
                        onChange={(event) =>
                          setForm((current) => ({
                            ...current,
                            provider: event.target.value,
                          }))
                        }
                        className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 outline-none"
                      >
                        {PROVIDERS.map((item) => (
                          <option key={item}>{item}</option>
                        ))}
                      </select>
                    </label>

                    <label className="text-sm">
                      <span className="mb-1 block font-medium text-gray-700">
                        Delivery Method
                      </span>
                      <select
                        value={form.deliveryMethod}
                        onChange={(event) =>
                          setForm((current) => ({
                            ...current,
                            deliveryMethod: event.target.value,
                          }))
                        }
                        className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 outline-none"
                      >
                        {DELIVERY_METHODS.map((item) => (
                          <option key={item}>{item}</option>
                        ))}
                      </select>
                    </label>
                  </div>

                  <div className="mt-4">
                    <p className="mb-2 text-sm font-medium text-gray-700">
                      Subscribed Events
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {EVENT_TYPES.map((eventType) => {
                        const checked =
                          form.subscribedEvents.includes(eventType);

                        return (
                          <label
                            key={eventType}
                            className={`cursor-pointer rounded-lg border px-3 py-2 text-xs font-medium ${
                              checked
                                ? "border-[#2B245C] bg-[#2B245C]/5 text-[#2B245C]"
                                : "border-gray-200 bg-white text-gray-600"
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() =>
                                toggleSubscribedEvent(eventType)
                              }
                              className="mr-2"
                            />
                            {eventType}
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  <div className="mt-4 grid gap-4 lg:grid-cols-3">
                    <label className="text-sm">
                      <span className="mb-1 block font-medium text-gray-700">
                        Configuration JSON
                      </span>
                      <textarea
                        rows={6}
                        value={form.configuration}
                        onChange={(event) =>
                          setForm((current) => ({
                            ...current,
                            configuration: event.target.value,
                          }))
                        }
                        className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 font-mono text-xs outline-none focus:border-[#2B245C]"
                      />
                    </label>

                    <label className="text-sm">
                      <span className="mb-1 block font-medium text-gray-700">
                        Secret References JSON
                      </span>
                      <textarea
                        rows={6}
                        value={form.secretReferences}
                        onChange={(event) =>
                          setForm((current) => ({
                            ...current,
                            secretReferences: event.target.value,
                          }))
                        }
                        className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 font-mono text-xs outline-none focus:border-[#2B245C]"
                      />
                    </label>

                    <label className="text-sm">
                      <span className="mb-1 block font-medium text-gray-700">
                        Metadata JSON
                      </span>
                      <textarea
                        rows={6}
                        value={form.metadata}
                        onChange={(event) =>
                          setForm((current) => ({
                            ...current,
                            metadata: event.target.value,
                          }))
                        }
                        className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 font-mono text-xs outline-none focus:border-[#2B245C]"
                      />
                    </label>
                  </div>

                  <div className="mt-4 flex items-center justify-between">
                    <label className="inline-flex items-center text-sm text-gray-700">
                      <input
                        type="checkbox"
                        checked={form.enabled}
                        onChange={(event) =>
                          setForm((current) => ({
                            ...current,
                            enabled: event.target.checked,
                          }))
                        }
                        className="mr-2"
                      />
                      Enable after creation
                    </label>

                    <button
                      type="submit"
                      disabled={saving}
                      className="inline-flex items-center rounded-lg bg-[#2B245C] px-4 py-2 text-sm font-medium text-white hover:bg-[#211b49] disabled:opacity-60"
                    >
                      <FiSave className="mr-2" />
                      {saving ? "Saving..." : "Save Client System"}
                    </button>
                  </div>
                </form>
              )}

              <div className="overflow-x-auto rounded-xl border border-gray-200">
                <table className="min-w-full text-sm">
                  <thead className="bg-[#2B245C] text-left text-white">
                    <tr>
                      <th className="px-4 py-3 font-medium">Name</th>
                      <th className="px-4 py-3 font-medium">Type</th>
                      <th className="px-4 py-3 font-medium">Provider</th>
                      <th className="px-4 py-3 font-medium">Method</th>
                      <th className="px-4 py-3 font-medium">Events</th>
                      <th className="px-4 py-3 font-medium">Status</th>
                      <th className="px-4 py-3 font-medium">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 bg-white">
                    {systems.length === 0 ? (
                      <EmptyRow
                        colSpan={7}
                        message={
                          loading
                            ? "Loading client systems..."
                            : "No client systems found."
                        }
                      />
                    ) : (
                      systems.map((item) => (
                        <tr key={item._id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 font-medium text-gray-900">
                            {item.name}
                          </td>
                          <td className="px-4 py-3 text-gray-700">
                            {item.systemType}
                          </td>
                          <td className="px-4 py-3 text-gray-700">
                            {item.provider}
                          </td>
                          <td className="px-4 py-3 text-gray-700">
                            {item.deliveryMethod}
                          </td>
                          <td className="max-w-sm px-4 py-3 text-gray-600">
                            {(item.subscribedEvents || []).join(", ") || "—"}
                          </td>
                          <td className="px-4 py-3">
                            <StatusBadge
                              value={item.enabled ? "ENABLED" : "DISABLED"}
                            />
                          </td>
                          <td className="px-4 py-3">
                            <button
                              type="button"
                              onClick={() => toggleClientSystem(item)}
                              className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-100"
                            >
                              {item.enabled ? "Disable" : "Enable"}
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === "events" && (
            <div className="mt-5 overflow-x-auto rounded-xl border border-gray-200">
              <table className="min-w-full text-sm">
                <thead className="bg-[#2B245C] text-left text-white">
                  <tr>
                    <th className="px-4 py-3 font-medium">Event ID</th>
                    <th className="px-4 py-3 font-medium">Event Type</th>
                    <th className="px-4 py-3 font-medium">Source</th>
                    <th className="px-4 py-3 font-medium">Consent Status</th>
                    <th className="px-4 py-3 font-medium">Deliveries</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium">Occurred At</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                  {events.length === 0 ? (
                    <EmptyRow
                      colSpan={7}
                      message={
                        loading
                          ? "Loading sync events..."
                          : "No sync events found."
                      }
                    />
                  ) : (
                    events.map((item) => (
                      <tr key={item.eventId} className="hover:bg-gray-50">
                        <td className="max-w-xs break-all px-4 py-3 font-mono text-xs text-gray-700">
                          {item.eventId}
                        </td>
                        <td className="px-4 py-3 text-gray-700">
                          {item.eventType}
                        </td>
                        <td className="px-4 py-3 text-gray-700">
                          {item.sourceType}
                        </td>
                        <td className="px-4 py-3 text-gray-700">
                          {item.consentStatus}
                        </td>
                        <td className="px-4 py-3 text-gray-700">
                          {item.deliveredCount || 0}/
                          {item.expectedDeliveryCount || 0}
                          {item.failedCount
                            ? ` (${item.failedCount} failed)`
                            : ""}
                        </td>
                        <td className="px-4 py-3">
                          <StatusBadge value={item.status} />
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-gray-600">
                          {formatDateTime(item.occurredAt)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === "deliveries" && (
            <div className="mt-5 overflow-x-auto rounded-xl border border-gray-200">
              <table className="min-w-full text-sm">
                <thead className="bg-[#2B245C] text-left text-white">
                  <tr>
                    <th className="px-4 py-3 font-medium">Delivery ID</th>
                    <th className="px-4 py-3 font-medium">Event ID</th>
                    <th className="px-4 py-3 font-medium">Provider</th>
                    <th className="px-4 py-3 font-medium">Method</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium">Retries</th>
                    <th className="px-4 py-3 font-medium">Response</th>
                    <th className="px-4 py-3 font-medium">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                  {deliveries.length === 0 ? (
                    <EmptyRow
                      colSpan={8}
                      message={
                        loading
                          ? "Loading deliveries..."
                          : "No delivery records found."
                      }
                    />
                  ) : (
                    deliveries.map((item) => {
                      const canRetry = [
                        "FAILED",
                        "DEAD_LETTER",
                      ].includes(item.status);

                      return (
                        <tr
                          key={item.deliveryId}
                          className="hover:bg-gray-50"
                        >
                          <td className="max-w-xs break-all px-4 py-3 font-mono text-xs text-gray-700">
                            {item.deliveryId}
                          </td>
                          <td className="max-w-xs break-all px-4 py-3 font-mono text-xs text-gray-700">
                            {item.eventId}
                          </td>
                          <td className="px-4 py-3 text-gray-700">
                            {item.provider}
                          </td>
                          <td className="px-4 py-3 text-gray-700">
                            {item.deliveryMethod}
                          </td>
                          <td className="px-4 py-3">
                            <StatusBadge value={item.status} />
                          </td>
                          <td className="px-4 py-3 text-gray-700">
                            {item.retryCount || 0}
                          </td>
                          <td className="px-4 py-3 text-gray-700">
                            {item.responseStatusCode || "—"}
                          </td>
                          <td className="px-4 py-3">
                            <button
                              type="button"
                              onClick={() =>
                                retryDelivery(item.deliveryId)
                              }
                              disabled={!canRetry}
                              className="inline-flex items-center rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
                            >
                              <FiRotateCcw className="mr-1" />
                              Retry
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === "logs" && (
            <div className="mt-5 overflow-x-auto rounded-xl border border-gray-200">
              <table className="min-w-full text-sm">
                <thead className="bg-[#2B245C] text-left text-white">
                  <tr>
                    <th className="px-4 py-3 font-medium">Date & Time</th>
                    <th className="px-4 py-3 font-medium">Action</th>
                    <th className="px-4 py-3 font-medium">Entity</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium">Actor</th>
                    <th className="px-4 py-3 font-medium">Source</th>
                    <th className="px-4 py-3 font-medium">CMP User / Email</th>
                    <th className="px-4 py-3 font-medium">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                  {logs.length === 0 ? (
                    <EmptyRow
                      colSpan={8}
                      message={
                        loading
                          ? "Loading integration audit logs..."
                          : "No Integration Sync audit logs found."
                      }
                    />
                  ) : (
                    logs.map((item) => (
                      <tr key={item._id} className="hover:bg-gray-50">
                        <td className="whitespace-nowrap px-4 py-3 text-gray-600">
                          {formatDateTime(item.createdAt)}
                        </td>
                        <td className="max-w-xs break-words px-4 py-3 font-medium text-gray-900">
                          {item.action || "—"}
                        </td>
                        <td className="px-4 py-3 text-gray-700">
                          <div>{item.entityType || "—"}</div>
                          <div className="max-w-[220px] break-all font-mono text-xs text-gray-500">
                            {item.entityId || "—"}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-gray-700">
                          {item.statusBefore || item.statusAfter ? (
                            <div className="space-y-1 text-xs">
                              <div>Before: {item.statusBefore || "—"}</div>
                              <div>After: {item.statusAfter || "—"}</div>
                            </div>
                          ) : (
                            "—"
                          )}
                        </td>
                        <td className="px-4 py-3 text-gray-700">
                          <div>{item.actorName || item.actorId || "—"}</div>
                          <div className="text-xs text-gray-500">
                            {item.actorType || "—"}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-gray-700">
                          {item.source || "—"}
                        </td>
                        <td className="px-4 py-3 text-gray-700">
                          <div>{item.cmpUserId || "—"}</div>
                          <div className="text-xs text-gray-500">
                            {item.cmpEmail || "—"}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <button
                            type="button"
                            onClick={() => setSelectedLog(item)}
                            className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-100"
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          <p className="mt-4 text-xs text-gray-500">
            Audit logs are immutable and loaded from the central Integration Sync audit collection.
          </p>
        </section>

        {selectedLog && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="max-h-[85vh] w-full max-w-4xl overflow-hidden rounded-2xl bg-white shadow-2xl">
              <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    Integration Audit Log
                  </h2>
                  <p className="mt-1 text-xs text-gray-500">
                    {selectedLog.action || "Audit details"}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedLog(null)}
                  className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
                >
                  <FiX />
                </button>
              </div>

              <div className="max-h-[70vh] overflow-auto p-5">
                <pre className="whitespace-pre-wrap break-words rounded-xl bg-gray-950 p-4 text-xs text-gray-100">
                  {JSON.stringify(selectedLog, null, 2)}
                </pre>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
