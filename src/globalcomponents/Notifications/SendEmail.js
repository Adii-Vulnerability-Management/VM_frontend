import React, { useState, useEffect } from "react";
import { toast, ToastContainer } from "react-toastify";
import Modal from "react-modal";
import CustomAxios from "@/globalcomponents/CustomAxios";
import { baseurl, initURL } from "../../../BaseUrl";
import { can, guard } from "@/auth/auth-permissions";
import { useRouter } from "next/router";
import "react-toastify/dist/ReactToastify.css";
import { FaPaperPlane, FaEye, FaTimes } from "react-icons/fa";

if (typeof window !== "undefined") Modal.setAppElement("#__next");

const extractVariables = (templateBody = "") => {
  const matches = [];
  const mustache = templateBody.match(/{{(.*?)}}/g) || [];
  const ejs = templateBody.match(/<%=\s*(.*?)\s*%>/g) || [];
  matches.push(...mustache, ...ejs);
  const keys = matches.map((m) => m.replace(/{{|}}|<%=\s*|\s*%>/g, "").trim());
  return [...new Set(keys)].filter(Boolean);
};

const templateIdOf = (t) => t?._id || t?.id;

const normalizeTemplate = (t) => ({
  ...t,
  id: templateIdOf(t),
  bodyHtml: t.bodyHtml || t.body || "",
});

export default function SendEmail() {
  const router = useRouter();
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [recipient, setRecipient] = useState("");
  const [placeholders, setPlaceholders] = useState({});
  const [previewHtml, setPreviewHtml] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [sending, setSending] = useState(false);

  // Permissions
  const canViewManage = can(["management_hub.read", "management_hub.manage"], { mode: "all" });
  const canCreate = can("management_hub.create");
  const canUpdate = can("management_hub.update");
  const canDelete = can("management_hub.delete");
  const canManage = can("management_hub.manage");

  useEffect(() => {
    const loadTemplates = async () => {
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
    loadTemplates();
  }, []);

  useEffect(() => {
    if (!selectedTemplate) return;
    const keys = extractVariables(selectedTemplate.bodyHtml);
    const emptyData = keys.reduce((acc, key) => ({ ...acc, [key]: "" }), {});
    setPlaceholders(emptyData);
    setPreviewHtml("");
  }, [selectedTemplate]);

  const onSelectTemplate = (e) => {
    const tpl =
      templates.find((t) => templateIdOf(t) === e.target.value) || null;
    setSelectedTemplate(tpl);
  };

  const onPlaceholderChange = (key, value) => {
    setPlaceholders((prev) => ({ ...prev, [key]: value }));
  };

  const buildPreview = () => {
    if (!selectedTemplate) return toast.error("No template selected");
    let html = selectedTemplate.bodyHtml || "";
    Object.entries(placeholders).forEach(([key, val]) => {
      const replacement = val || `<em style=\"color: #888\">${key}</em>`;
      html = html.replace(new RegExp(`{{${key}}}`, "g"), replacement);
      html = html.replace(new RegExp(`<%=\\s*${key}\\s*%>`, "g"), replacement);
    });
    setPreviewHtml(html);
    setModalOpen(true);
  };

  const sendEmail = async () => {
    if (!recipient || !selectedTemplate) {
      return toast.error("Please select a template and enter recipient");
    }
    setSending(true);
    try {
      const res = await CustomAxios.post(
        `${baseurl}/${initURL}/notifications`,
        {
          templateId: templateIdOf(selectedTemplate),
          recipientEmail: recipient,
          variables: placeholders,
        },
      );
      if (res.data?.success) {
        toast.success("Email sent!");
        setRecipient("");
        setSelectedTemplate(null);
        setPreviewHtml("");
      } else {
        toast.error(res.data?.message || "Failed to send");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to send");
    } finally {
      setSending(false);
      setModalOpen(false);
    }
  };

  return (
    <div className="py-5 px-3 space-y-5" data-tour="nt-sendemail">
      <section className="rounded-2xl border border-[#2B245C] bg-white p-6 shadow-lg hover:shadow-2xl transition-shadow duration-300">
        <ToastContainer position="top-right" />

        <h2 className="text-2xl font-bold text-[#2B245C] mb-3">
          Send Templated Email
        </h2>

        <div className="space-y-5">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-2">
              Recipient Email
            </label>
            <input
              type="email"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              placeholder="user@example.com"
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-indigo-200 transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-2">
              Select Template
            </label>
            <select
              value={selectedTemplate?.id || ""}
              onChange={onSelectTemplate}
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 focus:border-indigo-500 focus:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-indigo-200 transition-all"
            >
              <option value="">-- choose one --</option>
              {templates.map((t) => (
                <option key={templateIdOf(t)} value={templateIdOf(t)}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>

          {selectedTemplate && (
            <div className="bg-gray-50 p-5 rounded-lg">
              <h3 className="text-2xl font-bold text-[#2B245C] mb-1 tracking-wide">
                Subject
              </h3>
              <p className="text-xs">{selectedTemplate.subject}</p>
              {Object.keys(placeholders).length > 0 && (
                <>
                  <h3 className="text-[#2B245C] text-xl font-semibold mt-4 mb-2">
                    Fill Fields
                  </h3>
                  {Object.keys(placeholders).map((key) => (
                    <div key={key} className="mb-3">
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
                </>
              )}

              <div className="flex space-x-3 mt-5 mb-2">
                <button
                  onClick={() => guard(canViewManage, router, buildPreview)}
                  className="inline-flex items-center gap-2 rounded-lg border border-[#2B245C] bg-white px-6 py-2.5 text-sm font-medium text-[#2B245C] hover:bg-indigo-50 transition-all"
                >
                  <FaEye size={18} /> Preview
                </button>

                <button
                  onClick={() => guard(canManage, router, sendEmail)}
                  disabled={sending}
                  className={`flex items-center gap-2 px-6 py-2.5 text-sm font-semibold shadow-md hover:shadow-lg rounded-lg text-white ${
                    sending ? "bg-gray-400" : "bg-[#2B245C] hover:bg-opacity-90"
                  }`}
                >
                  <FaPaperPlane /> {sending ? "Sending..." : "Send Email"}
                </button>
              </div>
            </div>
          )}
        </div>

        <Modal
          isOpen={modalOpen}
          onRequestClose={() => setModalOpen(false)}
          overlayClassName="fixed inset-0 bg-black/50 backdrop-blur-sm bg-opacity-50 flex justify-center items-center"
          className="bg-white p-6 rounded-lg max-w-lg mx-auto"
        >
          <div className="flex justify-between items-center mb-4 border-b pb-3">
            <h3 className="text-xl text-[#2B245C] font-semibold">
              Email Preview
            </h3>
            <button
              className="hover:text-gray-600"
              onClick={() => setModalOpen(false)}
            >
              <FaTimes />
            </button>
          </div>

          <div
            className="prose max-w-none border-b pb-3"
            dangerouslySetInnerHTML={{
              __html: previewHtml || selectedTemplate?.body || "",
            }}
          />

          <div className="mt-5 text-right">
            <button
              onClick={() => guard(canViewManage, router, sendEmail)}
              className="bg-[#2B245C] text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-opacity-90"
            >
              Confirm & Send
            </button>
          </div>
        </Modal>
      </section>
    </div>
  );
}
