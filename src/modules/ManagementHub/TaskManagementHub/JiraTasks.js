import React, { useEffect, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { baseurl, initURL } from "@/config/config";
import Loader from "@/components/ui/Loader";
import { can, guard } from "@/auth/auth-permissions";
import { useRouter } from "next/router";

// ===== API =====
const getJiraTasks = async (projectKey) => {
  const res = await fetch(
    `${baseurl}/${initURL}/jira/tasks-deep?projectKey=${projectKey}`,
  );
  if (!res.ok) throw new Error("Failed to fetch tasks");
  return res.json();
};

// ===== Helpers =====
const IST = "Asia/Kolkata";
const formatDateTime = (s) =>
  s ? new Date(s).toLocaleString("en-IN", { timeZone: IST }) : "—";

const formatBytes = (bytes) => {
  if (bytes == null) return "—";
  if (bytes === 0) return "0 B";
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
};

// Very lightweight ADF → text
function adfToText(node) {
  if (!node) return "";
  if (Array.isArray(node)) return node.map(adfToText).join("");
  const { type, text, content } = node;
  if (type === "text") return text || "";
  if (type === "paragraph")
    return (content || []).map(adfToText).join("") + "\n";
  if (type === "hardBreak") return "\n";
  if (type === "mediaGroup") return "[file]";
  if (content) return (content || []).map(adfToText).join("");
  return "";
}
const extractADFPlain = (adf) => (adf?.content ? adfToText(adf).trim() : "");

// ===== Small UI parts =====
const StatusBadge = ({ name }) => {
  const s = (name || "N/A").toUpperCase();
  const color =
    s === "TO DO"
      ? "text-blue-600 bg-blue-100"
      : s === "IN PROGRESS"
        ? "text-yellow-600 bg-yellow-100"
        : s === "DONE"
          ? "text-green-600 bg-green-100"
          : "text-gray-600 bg-gray-100";
  return (
    <span
      className={`text-xs font-semibold py-2 px-3 rounded-full inline-block whitespace-nowrap ${color}`}
    >
      {name || "N/A"}
    </span>
  );
};

const PriorityBadge = ({ name }) => {
  const p = (name || "N/A").toUpperCase();

  const color =
    p === "HIGH"
      ? "text-red-600"
      : p === "MEDIUM"
        ? "text-yellow-600"
        : p === "LOW"
          ? "text-green-600"
          : "text-gray-600";

  return (
    <span className={`text-xs font-semibold ${color}`}>{name || "N/A"}</span>
  );
};

const AttachmentList = ({ attachments = [], renderedAttachments = [] }) => (
  <div className="space-y-2">
    {attachments.length === 0 ? (
      <div className="text-sm text-gray-500">No attachments</div>
    ) : (
      attachments.map((a) => {
        const rendered = renderedAttachments.find((ra) => ra.id === a.id);
        const sizeText = rendered?.size || formatBytes(a.size);
        // NOTE: Direct Jira links may require Jira auth/CORS. Best practice: proxy via your backend.
        return (
          <div
            key={a.id}
            className="flex items-center justify-between rounded bg-gray-50 px-3 py-2"
          >
            <div className="truncate">
              <div className="font-medium truncate">{a.filename}</div>
              <div className="text-xs text-gray-500">
                {a.mimeType} • {sizeText}
              </div>
            </div>
            <a
              className="text-sm text-indigo-600 hover:underline"
              href={a.content}
              target="_blank"
              rel="noreferrer"
              title="Open from Jira (requires Jira auth)"
            >
              Download
            </a>
          </div>
        );
      })
    )}
  </div>
);

const CommentList = ({ commentsObj }) => {
  const comments = commentsObj?.comments || [];
  if (!comments.length)
    return <div className="text-sm text-gray-500">No comments</div>;
  return (
    <div className="space-y-4">
      {comments.map((c) => (
        <div key={c.id} className="rounded border border-gray-200 p-3">
          <div className="text-xs text-gray-500 mb-1">
            <span className="font-medium">
              {c.author?.displayName || "Unknown"}
            </span>{" "}
            • {formatDateTime(c.created)}
          </div>
          <pre className="whitespace-pre-wrap text-sm text-gray-800">
            {extractADFPlain(c.body)}
          </pre>
        </div>
      ))}
    </div>
  );
};

const ChangelogList = ({ changelog }) => {
  const histories = changelog?.histories || [];
  if (!histories.length)
    return <div className="text-sm text-gray-500">No history</div>;
  return (
    <div className="space-y-3">
      {histories.map((h) => (
        <div key={h.id} className="rounded bg-gray-50 p-3">
          <div className="text-xs text-gray-500 mb-1">
            <span className="font-medium">
              {h.author?.displayName || "Unknown"}
            </span>{" "}
            • {formatDateTime(h.created)}
          </div>
          <ul className="list-disc ml-5 text-sm">
            {(h.items || []).map((it, idx) => (
              <li key={idx}>
                <span className="font-medium">{it.field}</span>:{" "}
                {it.fromString ?? "—"} → {it.toString ?? "—"}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
};

const WorklogList = ({ worklog }) => {
  const logs = worklog?.worklogs || [];
  if (!logs.length)
    return <div className="text-sm text-gray-500">No worklogs</div>;
  return (
    <div className="space-y-2">
      {logs.map((w) => (
        <div key={w.id} className="rounded border border-gray-200 p-3">
          <div className="text-xs text-gray-500 mb-1">
            {w.author?.displayName} • {formatDateTime(w.started)} •{" "}
            {w.timeSpent || `${(w.timeSpentSeconds / 3600).toFixed(2)}h`}
          </div>
          {w.comment && (
            <pre className="whitespace-pre-wrap text-sm">
              {extractADFPlain(w.comment)}
            </pre>
          )}
        </div>
      ))}
    </div>
  );
};

// ===== Main component =====
export default function JiraTasks() {
  const router = useRouter();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [openKey, setOpenKey] = useState(null);
  const projectKey = "KAN"; // <- your project key

  // Permissions
  const canView = can("management_hub.read");

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const data = await getJiraTasks(projectKey);
        setTasks(data || []);
      } catch (e) {
        toast.error("Failed to fetch Jira tasks");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // pagination
  const totalPages = Math.ceil(tasks.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const paginatedTasks = tasks.slice(startIndex, endIndex);

  const handleRowsPerPageChange = (e) => {
    setRowsPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  const goToPreviousPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const goToNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  return (
    <div className="mx-auto px-3 pt-6 bg-white min-h-screen shadow-lg rounded-lg">
      <ToastContainer />
      {loading ? (
        <div className="min-h-[40vh] flex items-center justify-center">
          <Loader />
        </div>
      ) : tasks.length === 0 ? (
        <div className="text-gray-500">No tasks found</div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-gray-800">
          <table className="min-w-full text-sm">
            <thead className="bg-[#2B245C] text-left text-white border-b border-gray-800">
              <tr>
                <th className="px-4 py-2 font-medium">Key</th>
                <th className="px-4 py-2 font-medium">Summary</th>
                <th className="px-4 py-2 font-medium">Description</th>
                <th className="px-4 py-2 font-medium text-center">Status</th>
                <th className="px-4 py-2 font-medium text-center">Priority</th>
                <th className="px-4 py-2 font-medium">Created</th>
                <th className="px-4 py-2 font-medium">Updated</th>
                <th className="px-4 py-2 font-medium text-center">Action</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {!canView ? (
                <tr>
                  <td
                    colSpan={8} // Adjust the colspan based on the number of columns in your table
                    className="px-6 py-10 text-center text-red-600 font-medium"
                  >
                    You don’t have permission to view tasks.
                  </td>
                </tr>
              ) : (
                paginatedTasks.map((task, idx) => {
                  const f = task.fields || {};
                  const rendered = task.renderedFields || {};
                  const descriptionHtml = rendered.description;
                  const descriptionText = extractADFPlain(f.description);
                  const isOpen = openKey === task.key;

                  return (
                    <React.Fragment key={task.key || `row-${idx}`}>
                      <tr className="hover:bg-gray-50">
                        <td className="px-4 py-2 font-medium">{task.key}</td>
                        <td className="px-4 py-2">{f.summary}</td>
                        <td className="px-4 py-2">
                          {descriptionHtml ? (
                            <div
                              dangerouslySetInnerHTML={{
                                __html: descriptionHtml,
                              }}
                            />
                          ) : (
                            <span className="line-clamp-2">
                              {descriptionText || "—"}
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-2 text-center">
                          <StatusBadge name={f.status?.name} />
                        </td>
                        <td className="px-4 py-2 text-center">
                          <PriorityBadge name={f.priority?.name} />
                        </td>
                        <td className="px-4 py-2">
                          {formatDateTime(f.created)}
                        </td>
                        <td className="px-4 py-2">
                          {formatDateTime(f.updated)}
                        </td>
                        <td className="px-4 py-2 text-sm text-center">
                          <button
                            className="whitespace-nowrap text-[#2B245C] border border-[#2B245C] px-2 py-1 font-medium rounded-lg bg-blue-50 hover:bg-blue-100 text-sm"
                            onClick={() => setOpenKey(isOpen ? null : task.key)}
                          >
                            {isOpen ? "Hide Details" : " View Details"}
                          </button>
                        </td>
                      </tr>

                      {isOpen && (
                        <tr>
                          <td colSpan={8} className="bg-gray-50 px-6 py-5">
                            <div className="grid md:grid-cols-2 gap-6">
                              <div>
                                <h3 className="text-sm font-semibold text-gray-800 mb-2">
                                  Attachments
                                </h3>
                                <AttachmentList
                                  attachments={f.attachment}
                                  renderedAttachments={
                                    rendered.attachment || []
                                  }
                                />
                              </div>

                              <div>
                                <h3 className="text-sm font-semibold text-gray-800 mb-2">
                                  Subtasks
                                </h3>
                                {Array.isArray(f.subtasks) &&
                                f.subtasks.length ? (
                                  <ul className="list-disc ml-5 text-sm">
                                    {f.subtasks.map((st) => (
                                      <li key={st.id || st.key}>
                                        <span className="font-medium">
                                          {st.key}
                                        </span>{" "}
                                        — {st.fields?.summary || ""}
                                      </li>
                                    ))}
                                  </ul>
                                ) : (
                                  <div className="text-sm text-gray-500">
                                    No subtasks
                                  </div>
                                )}
                              </div>

                              <div className="md:col-span-2">
                                <h3 className="text-sm font-semibold text-gray-800 mb-2">
                                  Comments
                                </h3>
                                <CommentList commentsObj={f.comment} />
                              </div>

                              <div>
                                <h3 className="text-sm font-semibold text-gray-800 mb-2">
                                  Worklogs
                                </h3>
                                <WorklogList worklog={f.worklog} />
                              </div>

                              <div>
                                <h3 className="text-sm font-semibold text-gray-800 mb-2">
                                  Changelog
                                </h3>
                                <ChangelogList changelog={task.changelog} />
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-4 py-3 border-t bg-white">
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-700 font-medium">
                Rows per page:
              </label>
              <select
                value={rowsPerPage}
                onChange={handleRowsPerPageChange}
                className="border border-gray-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-[#2B245C]"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>
            </div>

            <div className="text-sm text-gray-600">
              Showing {tasks.length === 0 ? 0 : startIndex + 1} to{" "}
              {Math.min(endIndex, tasks.length)} of {tasks.length} entries
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={goToPreviousPage}
                disabled={currentPage === 1}
                className="rounded-lg bg-[#2B245C] text-white px-4 py-2 text-sm font-semibold shadow-md hover:shadow-lg hover:bg-opacity-90 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-200 ease-in-out"
              >
                Prev
              </button>

              <span className="text-sm font-medium text-gray-700">
                Page {totalPages === 0 ? 0 : currentPage} of {totalPages || 0}
              </span>

              <button
                onClick={goToNextPage}
                disabled={currentPage === totalPages || totalPages === 0}
                className="rounded-lg bg-[#2B245C] text-white px-4 py-2 text-sm font-semibold shadow-md hover:shadow-lg hover:bg-opacity-90 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-200 ease-in-out"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
