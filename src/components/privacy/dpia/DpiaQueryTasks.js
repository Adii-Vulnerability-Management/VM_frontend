import { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import CustomAxios from "@/config/CustomAxios";
import { baseurl, initURL } from "../../../../BaseUrl";

const isObjectIdLike = (value) => /^[a-f0-9]{24}$/i.test(String(value || "").trim());

const cleanLabel = (value, fallback = "-") => {
  const text = String(value || "").trim();
  if (!text) return fallback;
  return isObjectIdLike(text) ? fallback : text;
};

const getBusinessProcessLabel = (task) => {
  const dpia = task?.dpia || {};
  const candidates = [
    dpia.businessProcessName,
    dpia.businessProcessTitle,
    typeof dpia.businessProcess === "object" ? dpia.businessProcess?.name : "",
    typeof dpia.businessProcess === "object" ? dpia.businessProcess?.processName : "",
    typeof dpia.businessProcess === "string" ? dpia.businessProcess : "",
  ];
  for (const candidate of candidates) {
    const label = cleanLabel(candidate, "");
    if (label) return label;
  }
  return "Business process name not available";
};

const formatDate = (date) => {
  if (!date) return "-";
  try {
    return new Date(date).toLocaleString();
  } catch {
    return "-";
  }
};

const statusColor = (status = "Open") => {
  if (["Answered"].includes(status)) return "bg-blue-50 text-blue-700 border-blue-300";
  if (["Closed", "Resolved"].includes(status)) return "bg-green-50 text-green-700 border-green-300";
  if (["Overdue", "Escalated"].includes(status)) return "bg-red-50 text-red-700 border-red-300";
  return "bg-yellow-50 text-yellow-700 border-yellow-300";
};

const flattenAnswers = (templateQuestions = []) => {
  if (!Array.isArray(templateQuestions)) return [];
  return templateQuestions.flatMap((section) =>
    (section.questions || []).map((question) => ({
      sectionTitle: section.title || "DPIA Questions",
      label: question.label || question.key || "Question",
      answer: question.answer || "-",
    })),
  );
};

const DpiaQueryTasks = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [answer, setAnswer] = useState("");
  const [evidenceReference, setEvidenceReference] = useState("");
  const [saving, setSaving] = useState(false);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const response = await CustomAxios.get(`${baseurl}/${initURL}/dpia/queries/assigned-to-me`);
      setTasks(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Failed to load DPIA query tasks:", error);
      setTasks([]);
      toast.error(error?.response?.data?.message || "Failed to load assigned DPIA query tasks.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const stats = useMemo(() => {
    return tasks.reduce((acc, task) => {
      const status = task?.query?.status || "Open";
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});
  }, [tasks]);

  const openTask = (task) => {
    setSelected(task);
    setAnswer(task?.query?.answer || task?.query?.response || "");
    setEvidenceReference(task?.query?.evidenceReference || "");
  };

  const submitAnswer = async () => {
    if (!selected?.dpiaId || !selected?.queryId) {
      toast.error("Query task id is missing.");
      return;
    }
    if (!String(answer || "").trim()) {
      toast.error("Please enter your query answer.");
      return;
    }

    try {
      setSaving(true);
      await CustomAxios.put(
        `${baseurl}/${initURL}/dpia/${selected.dpiaId}/queries/${selected.queryId}`,
        {
          status: "Answered",
          answer,
          response: answer,
          evidenceReference,
          comment: answer,
        },
      );
      toast.success("Query answer submitted. The current stage assignee can now review and close it.");
      setSelected(null);
      await fetchTasks();
    } catch (error) {
      console.error("Failed to answer DPIA query:", error);
      toast.error(error?.response?.data?.message || "Failed to submit query answer.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-6">
      <div className="rounded-2xl border border-[#2B245C] bg-white p-6 shadow-lg">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[#2B245C]">DPIA Query Tasks</h1>
            <p className="mt-1 text-sm text-gray-600">
              Queries assigned to you appear here. You answer the query here; the current stage assignee closes it from Review / Logs.
            </p>
          </div>
          <button
            type="button"
            onClick={fetchTasks}
            className="rounded-md bg-[#2B245C] px-4 py-2 text-sm text-white hover:bg-[#211b49]"
          >
            Refresh
          </button>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-4">
          <div className="rounded-lg border border-[#2B245C] bg-blue-50 p-4">
            <div className="text-xs uppercase text-gray-500">Total assigned queries</div>
            <div className="text-2xl font-bold text-[#2B245C]">{tasks.length}</div>
          </div>
          {Object.entries(stats).slice(0, 3).map(([status, count]) => (
            <div key={status} className="rounded-lg border bg-gray-50 p-4">
              <div className="text-xs uppercase text-gray-500">{status}</div>
              <div className="text-2xl font-bold text-[#2B245C]">{count}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border bg-white shadow-sm">
        {loading ? (
          <div className="p-8 text-center text-gray-600">Loading assigned query tasks...</div>
        ) : tasks.length === 0 ? (
          <div className="p-8 text-center text-gray-600">No open DPIA queries are assigned to you.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-[1100px] w-full table-fixed text-sm">
              <thead className="bg-[#2B245C] text-left text-white">
                <tr>
                  <th className="w-[40px] p-3">#</th>
                  <th className="w-[220px] p-3">Business Process</th>
                  <th className="w-[180px] p-3">Template</th>
                  <th className="w-[160px] p-3">Stage</th>
                  <th className="w-[220px] p-3">Query</th>
                  <th className="w-[100px] p-3">Due Date</th>
                  <th className="w-[110px] p-3">Status</th>
                  <th className="w-[120px] p-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {tasks.map((task, index) => {
                  const query = task.query || {};
                  const dpia = task.dpia || {};
                  return (
                    <tr key={`${task.dpiaId}-${task.queryId}`} className="border-t align-top hover:bg-gray-50">
                      <td className="p-3">{index + 1}</td>
                      <td className="p-3">
                        <div className="font-medium text-gray-900">{getBusinessProcessLabel(task)}</div>
                        <div className="text-xs text-gray-500">{dpia.companyName || "No company"}</div>
                      </td>
                      <td className="p-3">
                        <div>{dpia.templateName || "-"}</div>
                        <div className="text-xs text-gray-500">v{dpia.templateVersion || "-"}</div>
                      </td>
                      <td className="p-3">{query.stageName || query.stage || dpia.workflow?.currentStage || "-"}</td>
                      <td className="p-3">
                        <div className="font-medium text-gray-900">{query.title || "DPIA Query"}</div>
                        <div className="mt-1 line-clamp-2 text-xs text-gray-500">{query.description || "No details provided."}</div>
                      </td>
                      <td className="p-3">{query.dueDate || "-"}</td>
                      <td className="p-3">
                        <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${statusColor(query.status || "Open")}`}>
                          {query.status || "Open"}
                        </span>
                      </td>
                      <td className="p-3 text-center">
                        <button
                          type="button"
                          onClick={() => openTask(task)}
                          className="rounded-md border px-3 py-1.5 text-[#2B245C] hover:bg-blue-50"
                        >
                          Answer
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="max-h-[90vh] w-full max-w-5xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b bg-white p-5">
              <div>
                <h2 className="text-xl font-bold text-[#2B245C]">Answer DPIA Query</h2>
                <p className="text-sm text-gray-500">
                  {selected?.dpia?.templateName || "DPIA"} • {selected?.query?.stageName || selected?.query?.stage || "Stage query"}
                </p>
              </div>
              <button type="button" onClick={() => setSelected(null)} className="rounded-md border px-3 py-1 text-gray-600 hover:bg-gray-50">
                Close
              </button>
            </div>

            <div className="grid grid-cols-1 gap-5 p-5 lg:grid-cols-3">
              <div className="space-y-5 lg:col-span-2">
                <div className="rounded-lg border p-4">
                  <h3 className="font-semibold text-[#2B245C]">Query Details</h3>
                  <div className="mt-3 space-y-2 text-sm text-gray-700">
                    <div><span className="font-medium">Title:</span> {selected?.query?.title || "DPIA Query"}</div>
                    <div><span className="font-medium">Stage:</span> {selected?.query?.stageName || selected?.query?.stage || "-"}</div>
                    <div><span className="font-medium">Priority:</span> {selected?.query?.priority || "Medium"}</div>
                    <div><span className="font-medium">Due Date:</span> {selected?.query?.dueDate || "-"}</div>
                    <div><span className="font-medium">Status:</span> {selected?.query?.status || "Open"}</div>
                    <div className="whitespace-pre-wrap"><span className="font-medium">Question:</span> {selected?.query?.description || selected?.query?.query || "No details provided."}</div>
                  </div>
                </div>

                <div className="rounded-lg border p-4">
                  <h3 className="font-semibold text-[#2B245C]">Your Answer</h3>
                  <p className="mt-1 text-xs text-gray-500">Submit the clarification/evidence requested. The stage assignee will review and close the query.</p>
                  <textarea
                    rows={6}
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                    className="mt-3 w-full rounded-md border px-3 py-2"
                    placeholder="Write your answer or clarification here..."
                  />
                  <input
                    value={evidenceReference}
                    onChange={(e) => setEvidenceReference(e.target.value)}
                    className="mt-3 w-full rounded-md border px-3 py-2"
                    placeholder="Evidence reference, file name, URL, or note"
                  />
                  <button
                    type="button"
                    onClick={submitAnswer}
                    disabled={saving}
                    className="mt-3 rounded-md bg-[#2B245C] px-4 py-2 text-white disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {saving ? "Submitting..." : "Submit Answer"}
                  </button>
                </div>
              </div>

              <div className="space-y-5">
                <div className="rounded-lg border p-4">
                  <h3 className="font-semibold text-[#2B245C]">DPIA Summary</h3>
                  <div className="mt-3 space-y-2 text-sm text-gray-700">
                    <div><span className="font-medium">Business Process:</span> {getBusinessProcessLabel(selected)}</div>
                    <div><span className="font-medium">Company:</span> {selected?.dpia?.companyName || "-"}</div>
                    <div><span className="font-medium">Template:</span> {selected?.dpia?.templateName || "-"}</div>
                    <div><span className="font-medium">Current Status:</span> {selected?.dpia?.workflow?.status || selected?.dpia?.status || "-"}</div>
                    <div><span className="font-medium">Current Stage:</span> {selected?.dpia?.workflow?.currentStage || "-"}</div>
                    <div><span className="font-medium">Updated:</span> {formatDate(selected?.dpia?.updatedAt)}</div>
                  </div>
                </div>

                <div className="rounded-lg border p-4">
                  <h3 className="font-semibold text-[#2B245C]">Assessment Answers</h3>
                  <div className="mt-3 max-h-[420px] space-y-3 overflow-y-auto pr-2">
                    {flattenAnswers(selected?.dpia?.templateQuestions).length ? (
                      flattenAnswers(selected?.dpia?.templateQuestions).map((item, index) => (
                        <div key={`${item.label}-${index}`} className="rounded-md border bg-gray-50 p-2 text-xs">
                          <div className="font-semibold text-gray-700">{item.label}</div>
                          <div className="mt-1 whitespace-pre-wrap text-gray-600">{item.answer}</div>
                        </div>
                      ))
                    ) : (
                      <div className="text-sm text-gray-500">No assessment answers available.</div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DpiaQueryTasks;
