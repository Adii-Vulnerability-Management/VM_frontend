import React, { useEffect, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import CustomAxios from "@/globalcomponents/CustomAxios";
import { baseurl, initURL } from "../../../BaseUrl";
import { can, guard } from "@/auth/auth-permissions";
import { useRouter } from "next/router";
import SearchSection from "@/globalcomponents/NewUi/SearchSection";
import Pagination from "@/globalcomponents/NewUi/Pagination";
import Loader from "@/globalcomponents/NewUi/Loader";
import Modal from "react-modal";
import { FaEye, FaTimes } from "react-icons/fa";
import "react-toastify/dist/ReactToastify.css";

if (typeof window !== "undefined") Modal.setAppElement("#__next");

const extractVariables = (templateBody = "") => {
  const matches = [];
  const mustache = templateBody.match(/{{(.*?)}}/g) || [];
  const ejs = templateBody.match(/<%=\s*(.*?)\s*%>/g) || [];
  matches.push(...mustache, ...ejs);
  const keys = matches.map((m) => m.replace(/{{|}}|<%=\s*|\s*%>/g, "").trim());
  return [...new Set(keys)].filter(Boolean);
};

export default function NotificationManagement() {
  const apiEndpoint = `${baseurl}/${initURL}/notifications/management`;

  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [templates, setTemplates] = useState([]);

  const [form, setForm] = useState({
    event: "",
    channel: "email",
    recipient: "",
    scheduledAt: "",
    status: "scheduled",
    templateId: "",
  });

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [channel, setChannel] = useState("");
  const [templateId, setTemplateId] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [previewHtml, setPreviewHtml] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [placeholders, setPlaceholders] = useState({});
  const [editingId, setEditingId] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 10;

  // Permissions
  const canView = can("management_hub.read");
  const canCreate = can("management_hub.create");
  const canUpdate = can("management_hub.update");
  const canDelete = can("management_hub.delete");
  const canManage = can("management_hub.manage");

  const normalizeTemplate = (t) => ({
    ...t,
    id: t?._id || t?.id,
    bodyHtml: t.bodyHtml || t.body || "",
  });

  const fetchTemplates = async () => {
    try {
      const fetchPage = async (p) => {
        const res = await CustomAxios.get(
          `${baseurl}/${initURL}/notifications/templates`,
          { params: { page: p } },
        );
        const list =
          res.data?.templates ||
          res.data?.data ||
          (Array.isArray(res.data) ? res.data : []);
        const pagination = res.data?.pagination;
        return { list, pagination };
      };

      const first = await fetchPage(1);
      let all = Array.isArray(first.list) ? [...first.list] : [];
      const pages = first.pagination?.totalPages;
      if (pages && pages > 1) {
        for (let p = 2; p <= pages; p += 1) {
          const next = await fetchPage(p);
          if (Array.isArray(next.list)) all = all.concat(next.list);
        }
      }
      setTemplates(all.map(normalizeTemplate));
    } catch (err) {
      console.error(err);
      setTemplates([]);
    }
  };

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const params = {
        page,
        limit,
        search: search || undefined,
        status: status || undefined,
        channel: channel || undefined,
        templateId: templateId || undefined,
        from: from || undefined,
        to: to || undefined,
      };

      const res = await CustomAxios.get(apiEndpoint, { params });
      const list =
        res.data?.data ||
        res.data?.notifications ||
        (Array.isArray(res.data) ? res.data : []);
      setNotifications(Array.isArray(list) ? list : []);
      setTotalPages(res.data?.pagination?.totalPages || 1);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load schedules");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [page, search, status, channel, templateId, from, to]);

  // modal after choosing template
  useEffect(() => {
    if (!form.templateId) {
      setPlaceholders({});
      return;
    }

    const selectedTemplate = templates.find((t) => t.id === form.templateId);
    if (!selectedTemplate) {
      setPlaceholders({});
      return;
    }

    const keys = extractVariables(
      selectedTemplate.bodyHtml || selectedTemplate.body || "",
    );
    const emptyData = keys.reduce((acc, key) => ({ ...acc, [key]: "" }), {});
    setPlaceholders(emptyData);
  }, [form.templateId, templates]);

  // Preview Template
  const handlePreviewTemplate = () => {
    if (!form.templateId) {
      toast.error("Please select a template first");
      return;
    }

    const selectedTemplate = templates.find((t) => t.id === form.templateId);

    if (!selectedTemplate) {
      toast.error("Template not found");
      return;
    }

    let html = selectedTemplate.bodyHtml || selectedTemplate.body || "";

    Object.entries(placeholders).forEach(([key, val]) => {
      const replacement = val || `<em style="color:#888">${key}</em>`;
      html = html.replace(new RegExp(`{{${key}}}`, "g"), replacement);
      html = html.replace(new RegExp(`<%=\\s*${key}\\s*%>`, "g"), replacement);
    });

    setPreviewHtml(html);
    setModalOpen(true);
  };

  const onPlaceholderChange = (key, value) => {
    setPlaceholders((prev) => ({ ...prev, [key]: value }));
  };

  // Create or Update the schedule
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const scheduledAtIso = form.scheduledAt
        ? new Date(form.scheduledAt).toISOString()
        : undefined;

      const payload = {
        event: form.event,
        channel: form.channel,
        recipient: form.recipient,
        scheduledAt: scheduledAtIso,
        status: form.status,
        templateId: form.templateId || undefined,
        // template modal data
        variables: placeholders,
      };

      if (editingId) {
        await CustomAxios.patch(`${apiEndpoint}/${editingId}`, {
          ...payload,
          updatedBy: "admin",
        });
        toast.success("Schedule updated");
      } else {
        await CustomAxios.post(apiEndpoint, payload);
        toast.success("Schedule created");
      }

      setForm({
        event: "",
        channel: "email",
        recipient: "",
        scheduledAt: "",
        status: "scheduled",
        templateId: "",
      });
      setEditingId(null);
      fetchNotifications();
    } catch (err) {
      console.error(err);
      toast.error(
        editingId ? "Failed to update schedule" : "Failed to create schedule",
      );
    }
  };

  // helper function to show correct time while updating
  const formatDateTimeLocal = (dateString) => {
    if (!dateString) return "";

    const date = new Date(dateString);
    const pad = (num) => String(num).padStart(2, "0");

    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
  };

  const handleEdit = (item) => {
    setEditingId(item._id || item.id);
    setForm({
      event: item.event || "",
      channel: item.channel || "email",
      recipient: item.recipient || item.recipientEmail || "",
      scheduledAt: formatDateTimeLocal(item.scheduledAt || item.scheduled_at),
      status: item.status || "scheduled",
      templateId: item.templateId || "",
    });
  };

  const handleDelete = async (item) => {
    if (!window.confirm("Delete this schedule?")) return;
    try {
      await CustomAxios.delete(`${apiEndpoint}/${item._id || item.id}`);
      toast.success("Schedule deleted");
      fetchNotifications();
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete schedule");
    }
  };

  const handleProcessDue = async () => {
    try {
      await CustomAxios.post(`${apiEndpoint}/process-due`);
      toast.success("Due schedules processed");
      fetchNotifications();
    } catch (err) {
      console.error(err);
      toast.error("Failed to process due schedules");
    }
  };

  const handleClearFilters = () => {
    setSearch("");
    setStatus("");
    setChannel("");
    setTemplateId("");
    setFrom("");
    setTo("");
    setPage(1);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader />
      </div>
    );
  }

  return (
    <div className="px-3 space-y-5" data-tour="nt-management">
      <ToastContainer />

      <section className="rounded-2xl border border-[#2B245C] bg-white p-6 shadow-lg hover:shadow-2xl transition-shadow duration-300">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-[#2B245C] mb-3">
            {editingId
              ? "Update Notification Schedule"
              : "Notification Scheduler"}
          </h2>
          <button
            onClick={() => guard(canManage, router, handleProcessDue)}
            className="inline-flex items-center rounded-lg border border-[#2B245C] px-4 py-2 text-sm font-semibold text-[#2B245C] hover:bg-indigo-50 transition-all"
          >
            Process Due
          </button>
        </div>

        <form
          onSubmit={(e) =>
            guard(canCreate || canUpdate, router, () => handleSubmit(e))
          }
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          <div className="flex flex-col">
            <label className="block text-xs font-semibold text-gray-700 mb-2">
              Event
            </label>
            <input
              value={form.event}
              onChange={(e) => setForm({ ...form, event: e.target.value })}
              placeholder="e.g. Overdue Task"
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-indigo-200 transition-all"
              required
            />
          </div>
          <div className="flex flex-col">
            <label className="block text-xs font-semibold text-gray-700 mb-2">
              Channel
            </label>
            <select
              value={form.channel}
              onChange={(e) => setForm({ ...form, channel: e.target.value })}
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 focus:border-indigo-500 focus:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-indigo-200 transition-all"
            >
              <option value="email">Email</option>
              <option value="slack">Slack</option>
              <option value="in-app">In-app</option>
            </select>
          </div>
          <div className="flex flex-col">
            <label className="block text-xs font-semibold text-gray-700 mb-2">
              Recipient
            </label>
            <input
              type="text"
              value={form.recipient}
              onChange={(e) => setForm({ ...form, recipient: e.target.value })}
              placeholder="email / #channel / username"
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-indigo-200 transition-all"
              required
            />
          </div>
          <div className="flex flex-col">
            <label className="block text-xs font-semibold text-gray-700 mb-2">
              Scheduled At
            </label>
            <input
              type="datetime-local"
              value={form.scheduledAt}
              onChange={(e) =>
                setForm({ ...form, scheduledAt: e.target.value })
              }
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-indigo-200 transition-all"
              required
            />
          </div>
          <div className="flex flex-col">
            <label className="block text-xs font-semibold text-gray-700 mb-2">
              Status
            </label>
            <select
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 focus:border-indigo-500 focus:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-indigo-200 transition-all"
            >
              <option value="scheduled">Scheduled</option>
              <option value="active">Active</option>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
            </select>
          </div>
          <div className="flex flex-col">
            <label className="block text-xs font-semibold text-gray-700 mb-2">
              Template
            </label>

            <select
              value={form.templateId}
              onChange={(e) => setForm({ ...form, templateId: e.target.value })}
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 focus:border-indigo-500 focus:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-indigo-200 transition-all"
            >
              <option value="">-- select template --</option>
              {templates.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>

          {form.templateId &&
            (() => {
              const selectedTemplate = templates.find(
                (t) => t.id === form.templateId,
              );
              if (!selectedTemplate) return null;

              return (
                <div className="md:col-span-2 bg-gray-50 p-5 rounded-lg border border-gray-200">
                  <h3 className="text-2xl font-bold text-[#2B245C] mb-1 tracking-wide">
                    Subject
                  </h3>
                  <p className="text-xs">{selectedTemplate.subject || "-"}</p>

                  {Object.keys(placeholders).length > 0 && (
                    <>
                      <h3 className="text-[#2B245C] text-xl font-semibold mt-4 mb-2">
                        Fill Fields
                      </h3>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {Object.keys(placeholders).map((key) => (
                          <div key={key}>
                            <label className="block text-xs font-semibold text-gray-700 mb-2">
                              {key}
                            </label>
                            <input
                              type="text"
                              value={placeholders[key]}
                              onChange={(e) =>
                                onPlaceholderChange(key, e.target.value)
                              }
                              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-indigo-200 transition-all"
                            />
                          </div>
                        ))}
                      </div>
                    </>
                  )}

                  <div className="flex space-x-3 mt-5">
                    <button
                      type="button"
                      onClick={handlePreviewTemplate}
                      className="inline-flex items-center gap-2 rounded-lg border border-[#2B245C] bg-white px-6 py-2.5 text-sm font-medium text-[#2B245C] hover:bg-indigo-50 transition-all"
                    >
                      <FaEye size={18} /> Preview
                    </button>
                  </div>
                </div>
              );
            })()}

          <div className="flex gap-2 mt-2">
            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-lg bg-[#2B245C] px-6 py-2.5 text-sm font-semibold text-white shadow-md hover:shadow-lg hover:bg-opacity-90 disabled:opacity-60 transition-all"
            >
              {editingId ? "Update Schedule" : "Create Schedule"}
            </button>

            {editingId && (
              <button
                type="button"
                onClick={() => {
                  setEditingId(null);
                  setForm({
                    event: "",
                    channel: "email",
                    recipient: "",
                    scheduledAt: "",
                    status: "scheduled",
                    templateId: "",
                  });
                }}
                className="inline-flex items-center gap-2 rounded-lg bg-white border border-[#2B245C] px-6 py-2.5 text-sm font-semibold text-[#2B245C] shadow-md hover:shadow-lg hover:bg-blue-50 disabled:opacity-60 transition-all"
              >
                Cancel Edit
              </button>
            )}
          </div>
        </form>
      </section>

      <section className="rounded-2xl border border-[#2B245C] bg-white p-6 shadow-lg hover:shadow-2xl transition-shadow duration-300">
        <SearchSection
          placeholder="Search schedules..."
          initialValue={search}
          searchButtonText="Search"
          clearButtonText="Clear"
          onSearch={(v) => {
            setPage(1);
            setSearch(v);
          }}
          onClear={handleClearFilters}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-3 mt-4">
          <select
            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 focus:border-indigo-500 focus:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-indigo-200 transition-all"
            value={status}
            onChange={(e) => {
              setPage(1);
              setStatus(e.target.value);
            }}
          >
            <option value="">All Status</option>
            <option value="scheduled">Scheduled</option>
            <option value="active">Active</option>
            <option value="pending">Pending</option>
          </select>

          <select
            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 focus:border-indigo-500 focus:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-indigo-200 transition-all"
            value={channel}
            onChange={(e) => {
              setPage(1);
              setChannel(e.target.value);
            }}
          >
            <option value="">All Channels</option>
            <option value="email">Email</option>
            <option value="slack">Slack</option>
            <option value="in-app">In-app</option>
          </select>

          <select
            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 focus:border-indigo-500 focus:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-indigo-200 transition-all"
            value={templateId}
            onChange={(e) => {
              setPage(1);
              setTemplateId(e.target.value);
            }}
          >
            <option value="">All Templates</option>
            {templates.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>

          <input
            type="date"
            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-indigo-200 transition-all"
            value={from}
            onChange={(e) => {
              setPage(1);
              setFrom(e.target.value);
            }}
          />

          <input
            type="date"
            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-indigo-200 transition-all"
            value={to}
            onChange={(e) => {
              setPage(1);
              setTo(e.target.value);
            }}
          />

          <button
            className="rounded-lg border border-[#2B245C] bg-white px-4 py-2 text-sm font-medium text-[#2B245C] hover:bg-indigo-50 transition-all"
            onClick={handleClearFilters}
          >
            Reset Filters
          </button>
        </div>

        <div className="overflow-x-auto rounded-lg border border-gray-800 mt-4">
          <table className="min-w-full text-sm">
            <thead className="bg-[#2B245C] text-left text-white border-b border-gray-800">
              <tr>
                <th className="px-4 py-2 font-medium">Event</th>
                <th className="px-4 py-2 font-medium">Channel</th>
                <th className="px-4 py-2 font-medium">Recipient</th>
                <th className="px-4 py-2 font-medium">Scheduled At</th>
                <th className="px-4 py-2 font-medium">Status</th>
                <th className="px-4 py-2 font-medium">Template</th>
                <th className="px-4 py-2 font-medium text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {!canView ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-5 text-center text-red-600 font-medium"
                  >
                    You do not have permission to view schedules.
                  </td>
                </tr>
              ) : (
                notifications.map((n, idx) => (
                  <tr
                    key={n._id || n.id || idx}
                    className={idx % 2 ? "bg-gray-50" : "bg-white"}
                  >
                    <td className="px-4 py-2">{n.event || "-"}</td>
                    <td className="px-4 py-2">{n.channel || "-"}</td>
                    <td className="px-4 py-2 break-all">
                      {n.recipient || n.recipientEmail || "-"}
                    </td>
                    <td className="px-4 py-2">
                      {n.scheduledAt
                        ? new Date(n.scheduledAt).toLocaleString("en-IN", {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                            hour12: true,
                          })
                        : "-"}
                    </td>
                    <td className="px-4 py-2">{n.status || "-"}</td>
                    <td className="px-4 py-2">
                      {n.templateName || n.templateId || "-"}
                    </td>
                    <td className="px-4 py-2 text-center space-x-2">
                      <button
                        className="inline-block border border-blue-600 rounded-lg px-2 py-1 text-blue-600 hover:bg-blue-50"
                        onClick={() => guard(canUpdate, router, () => handleEdit(n))}
                      >
                        Update
                      </button>
                      <button
                        className="inline-block border border-red-600 rounded-lg px-2 py-1 text-red-600 hover:bg-red-50"
                        onClick={() =>
                          guard(canDelete, router, () => handleDelete(n))
                        }
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
              {notifications.length === 0 && (
                <tr>
                  <td
                    className="px-4 py-6 text-center text-gray-500"
                    colSpan={7}
                  >
                    No schedules found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-4">
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        </div>
      </section>

      <Modal
        isOpen={modalOpen}
        onRequestClose={() => setModalOpen(false)}
        overlayClassName="fixed inset-0 bg-black/50 backdrop-blur-sm bg-opacity-50 flex justify-center items-center z-50"
        className="bg-white p-6 rounded-lg max-w-lg w-full mx-4"
      >
        <div className="flex justify-between items-center mb-4 border-b pb-3">
          <h3 className="text-xl text-[#2B245C] font-semibold">
            Template Preview
          </h3>
          <button
            className="hover:text-gray-600"
            onClick={() => setModalOpen(false)}
            type="button"
          >
            <FaTimes />
          </button>
        </div>

        <div
          className="prose max-w-none max-h-[400px] overflow-y-auto"
          dangerouslySetInnerHTML={{ __html: previewHtml }}
        />
      </Modal>
    </div>
  );
}
