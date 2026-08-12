// src/pages/example/index.js
import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import Dialog from "@/components/ui/Dialog";
import Pagination from "@/components/ui/Pagination";
import "react-quill/dist/quill.snow.css";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import CustomAxios from "@/globalcomponents/CustomAxios";
import { baseurl, initURL } from "../../../BaseUrl";
import { useRouter } from "next/router";
import { can, guard } from "@/auth/auth-permissions";

const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });

const extractVariables = (templateBody = "") => {
  const matches = [];
  const mustache = templateBody.match(/{{(.*?)}}/g) || [];
  const ejs = templateBody.match(/<%=\s*(.*?)\s*%>/g) || [];
  matches.push(...mustache, ...ejs);
  const keys = matches.map((m) => m.replace(/{{|}}|<%=\s*|\s*%>/g, "").trim());
  return [...new Set(keys)].filter(Boolean);
};

const stripHtml = (html = "") =>
  html
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const templateIdOf = (t) => t?._id || t?.id;

const normalizeTemplate = (t) => ({
  ...t,
  id: templateIdOf(t),
  bodyHtml: t.bodyHtml || t.body || "",
});

export default function TemplateManager() {
  const router = useRouter();
  const [templates, setTemplates] = useState([]);
  const [name, setName] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [previewTemplate, setPreviewTemplate] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  // Permissions
  const canView = can("management_hub.read");
  const canCreate = can("management_hub.create");
  const canUpdate = can("management_hub.update");
  const canDelete = can("management_hub.delete");
  const canManage = can("management_hub.manage");

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const fetchPage = async (page) => {
        const res = await CustomAxios.get(
          `${baseurl}/${initURL}/notifications/templates`,
          { params: { page } },
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

      const totalPages = first.pagination?.totalPages;
      if (totalPages && totalPages > 1) {
        for (let page = 2; page <= totalPages; page += 1) {
          const next = await fetchPage(page);
          if (Array.isArray(next.list)) {
            all = all.concat(next.list);
          }
        }
      }

      setTemplates(all.map(normalizeTemplate));
    } catch (err) {
      console.error(err);
      setTemplates([]);
    }
  };

  const buildPayload = (base = {}) => {
    const variables = extractVariables(body);
    const bodyText = stripHtml(body);
    return {
      name,
      subject,
      bodyHtml: body,
      bodyText,
      channel: base.channel ?? "email",
      module: base.module ?? "notifications",
      isActive: base.isActive ?? true,
      tags: base.tags ?? [],
      variables,
    };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (selectedTemplate) {
        const id = templateIdOf(selectedTemplate);
        await CustomAxios.patch(
          `${baseurl}/${initURL}/notifications/templates/${id}`,
          buildPayload(selectedTemplate),
        );
        toast.success("Template updated");
      } else {
        await CustomAxios.post(
          `${baseurl}/${initURL}/notifications/templates`,
          buildPayload(),
        );
        toast.success("Template created");
      }
      setName("");
      setSubject("");
      setBody("");
      setSelectedTemplate(null);
      fetchTemplates();
    } catch (err) {
      console.error(err);
      toast.error("Failed to save template");
    }
  };

  const handleEdit = (t) => {
    setSelectedTemplate(t);
    setName(t.name);
    setSubject(t.subject);
    setBody(t.bodyHtml || t.body || "");
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this template?")) return;
    try {
      await CustomAxios.delete(
        `${baseurl}/${initURL}/notifications/templates/${id}`,
      );
      setTemplates((ts) => ts.filter((t) => templateIdOf(t) !== id));
      toast.success("Template deleted");
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete template");
    }
  };

  const handleSeed = async () => {
    try {
      await CustomAxios.post(
        `${baseurl}/${initURL}/notifications/seed-templates`,
      );
      toast.success("Templates seeded");
      fetchTemplates();
    } catch (err) {
      console.error(err);
      toast.error("Failed to seed templates");
    }
  };

  // filter + paginate
  const filtered = templates.filter((t) =>
    t.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const current = filtered.slice(startIndex, endIndex);

  const handleRowsChange = (e) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  return (
    <div className="px-3 space-y-5 bg-white" data-tour="nt-templates">
      <ToastContainer position="top-right" />
      {/* Form */}
      <section className="rounded-2xl border border-[#2B245C] bg-white p-6 shadow-lg hover:shadow-2xl transition-shadow duration-300">
        <h2 className="text-2xl font-bold text-[#2B245C] mb-3">
          {selectedTemplate ? "Edit Template" : "Create Template"}
        </h2>

        <form
          onSubmit={(e) =>
            guard(canCreate || canUpdate, router, () => handleSubmit(e))
          }
          className="space-y-5"
        >
          {/* Template Name */}
          <div className="space-y-1">
            <label
              htmlFor="templateName"
              className="block text-xs font-semibold text-gray-700 mb-2"
            >
              Template Name
            </label>
            <input
              id="templateName"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter template name"
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-indigo-200 transition-all"
              required
            />
          </div>

          {/* Email Subject */}
          <div className="space-y-1">
            <label
              htmlFor="emailSubject"
              className="block text-xs font-semibold text-gray-700 mb-2"
            >
              Email Subject
            </label>
            <input
              id="emailSubject"
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Enter email subject"
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-indigo-200 transition-all"
              required
            />
          </div>

          {/* Email Body */}
          <div className="space-y-1">
            <label
              htmlFor="emailBody"
              className="block text-xs font-semibold text-gray-700 mb-2"
            >
              Email Body
            </label>

            <div
              className="bg-white border border-gray-300 rounded-xl overflow-hidden"
              ref={(el) => {
                if (!el) return;

                const toolbar = el.querySelector(".ql-toolbar");
                const container = el.querySelector(".ql-container");
                const editor = el.querySelector(".ql-editor");

                if (toolbar) {
                  toolbar.style.border = "none";
                  toolbar.style.borderBottom = "1px solid #e5e7eb";
                  toolbar.style.background = "#fff";
                }

                if (container) {
                  container.style.border = "none";
                  container.style.height = "150px";
                }

                if (editor) {
                  editor.style.height = "150px";
                  editor.style.overflowY = "auto";
                }
              }}
            >
              <ReactQuill
                theme="snow"
                value={body}
                onChange={setBody}
                placeholder="Compose your email..."
                className="w-full"
              />
            </div>
          </div>

          {/* Submit */}
          <div className="flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => guard(canCreate, router, handleSeed)}
              className="inline-flex items-center rounded-lg border border-[#2B245C] px-4 py-2 text-sm font-semibold text-[#2B245C] hover:bg-indigo-50 transition-all"
            >
              Seed Templates
            </button>
            <button
              type="submit"
              className="inline-flex items-center rounded-lg bg-[#2B245C] px-6 py-2.5 text-sm font-semibold text-white shadow-md hover:shadow-lg hover:bg-opacity-90 disabled:opacity-60 transition-all"
            >
              {selectedTemplate ? "Update Template" : "Create Template"}
            </button>
          </div>
        </form>
      </section>

      <section className="mb-3 space-y-3 rounded-2xl border border-[#2B245C] bg-white p-6 shadow-lg hover:shadow-2xl transition-shadow duration-300">
        {/* Search */}
        <input
          className="w-1/3 rounded-lg border border-gray-500 bg-white px-3 py-2 mb-2 text-sm text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-indigo-200 transition-all"
          placeholder="Search templates..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          }}
        />

        {/* Table */}
        <div className="overflow-x-auto rounded-lg border border-gray-800">
          <table className="min-w-full text-sm">
            <thead className="bg-[#2B245C] text-left text-white border-b border-gray-800">
              <tr>
                <th className="px-4 py-2 font-medium">Name</th>
                <th className="px-4 py-2 font-medium">Subject</th>
                <th className="px-4 py-2 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {!canView ? (
                <tr>
                  <td
                    colSpan={3}
                    className="px-4 py-5 text-center text-red-600 font-medium"
                  >
                    You don’t have permission to view templates.
                  </td>
                </tr>
              ) : current.length === 0 ? (
                <tr>
                  <td
                    colSpan={3}
                    className="px-4 py-5 text-center text-gray-600"
                  >
                    No templates found.
                  </td>
                </tr>
              ) : (
                current.map((t, i) => (
                  <tr
                    key={templateIdOf(t)}
                    className={i % 2 === 0 ? "bg-gray-50" : "bg-white"}
                  >
                    <td className="px-4 py-2">{t.name}</td>
                    <td className="px-4 py-2">{t.subject}</td>
                    <td className="px-4 py-2 space-x-2">
                      <button
                        onClick={() =>
                          guard(canView, router, () => setPreviewTemplate(t))
                        }
                        className="px-2 py-1 bg-white border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50"
                      >
                        View
                      </button>
                      <button
                        onClick={() =>
                          guard(canUpdate, router, () => handleEdit(t))
                        }
                        className="px-2 py-1 bg-white border border-yellow-600 text-yellow-600 rounded-lg hover:bg-yellow-50"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() =>
                          guard(canDelete, router, () =>
                            handleDelete(templateIdOf(t)),
                          )
                        }
                        className="px-2 py-1 bg-white border border-red-500 text-red-500 rounded-lg hover:bg-red-50"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between mt-4 flex-wrap gap-3">
          {/* LEFT SIDE */}
          <div className="flex items-center gap-4 text-sm">
            {/* Rows per page */}
            <div className="flex items-center gap-2">
              <span>Rows per page:</span>

              <select
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="border rounded px-2 py-1"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
            </div>

            {/* Showing text */}
            <span>
              Showing {filtered.length === 0 ? 0 : startIndex + 1} to{" "}
              {Math.min(endIndex, filtered.length)} of {filtered.length}
            </span>
          </div>

          {/* RIGHT SIDE PAGINATION */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="rounded-lg bg-[#2B245C] text-white px-4 py-2 text-sm font-semibold shadow-md hover:shadow-lg hover:bg-opacity-90 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-200 ease-in-out"
            >
              Prev
            </button>

            <span className="text-sm font-medium">
              Page {currentPage} of {totalPages || 1}
            </span>

            <button
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages || 1))
              }
              disabled={currentPage === totalPages || totalPages === 0}
              className="rounded-lg bg-[#2B245C] text-white px-4 py-2 text-sm font-semibold shadow-md hover:shadow-lg hover:bg-opacity-90 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-200 ease-in-out"
            >
              Next
            </button>
          </div>
        </div>
      </section>

      {/* Preview Dialog */}
      <Dialog
        isOpen={!!previewTemplate}
        onClose={() => setPreviewTemplate(null)}
        title={`Preview: ${previewTemplate?.name}`}
        footer={
          <button
            onClick={() => setPreviewTemplate(null)}
            className="px-4 py-2 bg-[#2B245C] text-white rounded hover:bg-[#050038]"
          >
            Close
          </button>
        }
      >
        <h3 className="mb-2 font-semibold">{previewTemplate?.subject}</h3>
        <div
          className="prose max-w-none"
          dangerouslySetInnerHTML={{
            __html: previewTemplate?.bodyHtml || previewTemplate?.body || "",
          }}
        />
      </Dialog>
    </div>
  );
}
