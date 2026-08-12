import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import { toast } from "react-toastify";
import CustomAxios from "@/config/CustomAxios";
import { baseurl, initURL } from "../../../../BaseUrl";
import DpiaQuickNav from "./DpiaQuickNav";
import DpiaFlowGuide from "./DpiaFlowGuide";

const TEMPLATE_COMPANY_KEYS = [
  "companyName",
  "company",
  "companyInformation",
  "companyInfo",
  "legacy_companyInformation",
];

const extractTemplateQuestionAnswer = (
  templateQuestions,
  keys = [],
  labelParts = [],
) => {
  if (!Array.isArray(templateQuestions)) return "";

  const normalizedKeys = keys.map((key) => String(key).toLowerCase());
  const normalizedLabelParts = labelParts.map((part) =>
    String(part).toLowerCase(),
  );

  for (const section of templateQuestions) {
    for (const question of section?.questions || []) {
      const key = String(question?.key || "").toLowerCase();
      const label = String(question?.label || "").toLowerCase();
      const answer = question?.answer;

      if (!String(answer || "").trim()) continue;

      if (normalizedKeys.includes(key)) {
        return String(answer).trim();
      }

      if (normalizedLabelParts.some((part) => label.includes(part))) {
        return String(answer).trim();
      }
    }
  }

  return "";
};

const compactCompanyName = (value) => {
  const safeValue = String(value || "").trim();
  if (!safeValue) return "";

  const firstLine = safeValue.split(/\n/)[0]?.trim() || safeValue;
  const firstSentence = firstLine.split(".")[0]?.trim() || firstLine;
  const firstCommaPart = firstSentence.split(",")[0]?.trim() || firstSentence;

  return firstCommaPart || safeValue.slice(0, 80);
};

const getCompanyName = (dpia) => {
  const directCompany =
    dpia?.companyName ||
    dpia?.company ||
    dpia?.organizationName ||
    dpia?.businessProcessDetails?.companyName ||
    dpia?.businessProcessDetails?.company ||
    dpia?.businessProcessDetails?.organizationName ||
    dpia?.businessProcess?.companyName ||
    dpia?.businessProcess?.company ||
    dpia?.bpa?.companyName ||
    dpia?.bpa?.company;

  const templateCompany = extractTemplateQuestionAnswer(
    dpia?.templateQuestions,
    TEMPLATE_COMPANY_KEYS,
    ["company information", "company name"],
  );

  return compactCompanyName(directCompany || templateCompany) || "No company";
};

export const reviewStatuses = [
  "Submitted",
  "Privacy Review",
  "Security Review",
  "Legal Review",
  "Vendor Review",
  "Business Review",
  "DPO Review",
  "Remediation Required",
  "Query Raised",
];

export const approvalStatuses = ["Pending Approval"];

const statusColor = (status = "Draft") => {
  if (["Approved", "Closed"].includes(status))
    return "bg-green-50 text-green-700 border-green-300";
  if (["Rejected", "Remediation Required"].includes(status))
    return "bg-red-50 text-red-700 border-red-300";
  if (
    [
      "Submitted",
      "Privacy Review",
      "Security Review",
      "Legal Review",
      "Vendor Review",
      "Business Review",
      "DPO Review",
      "Pending Approval",
    ].includes(status)
  )
    return "bg-blue-50 text-blue-700 border-blue-300";
  return "bg-yellow-50 text-yellow-700 border-yellow-300";
};

const getStatus = (dpia) => dpia?.workflow?.status || dpia?.status || "Draft";

const formatDate = (date) => {
  if (!date) return "-";
  try {
    return new Date(date).toLocaleString();
  } catch {
    return "-";
  }
};

const isObjectIdLike = (value) =>
  /^[a-f0-9]{24}$/i.test(String(value || "").trim());

const cleanLabel = (value, fallback = "-") => {
  const text = String(value || "").trim();
  if (!text) return fallback;
  return isObjectIdLike(text) ? fallback : text;
};

const getBusinessProcessLabel = (dpia) => {
  const businessProcess = dpia?.businessProcess;
  const candidates = [
    dpia?.businessProcessName,
    dpia?.businessProcessTitle,
    dpia?.businessProcessDetails?.name,
    dpia?.businessProcessDetails?.processName,
    dpia?.businessProcessDetails?.title,
    dpia?.bpa?.name,
    dpia?.bpa?.processName,
    dpia?.bpa?.title,
    typeof businessProcess === "object" ? businessProcess?.name : "",
    typeof businessProcess === "object" ? businessProcess?.processName : "",
    typeof businessProcess === "object" ? businessProcess?.title : "",
    typeof businessProcess === "string" ? businessProcess : "",
  ];

  for (const candidate of candidates) {
    const label = cleanLabel(candidate, "");
    if (label) return label;
  }

  return "Business process name not available";
};

const getUserDisplayLabel = (...values) => {
  for (const value of values) {
    const label = cleanLabel(value, "");
    if (label) return label;
  }
  return "User name not available";
};

const assigneeForMode = (dpia, mode) => {
  const workflow = dpia?.workflow || {};
  if (
    workflow.currentAssigneeName ||
    workflow.currentAssigneeEmail ||
    workflow.currentAssigneeUserId
  ) {
    return getUserDisplayLabel(
      workflow.currentAssigneeName,
      workflow.currentAssigneeEmail,
      workflow.currentAssigneeUserId,
    );
  }
  if (mode === "approval") {
    return getUserDisplayLabel(
      workflow.approverName,
      workflow.approverEmail,
      workflow.approverUserId,
      workflow.currentReviewer,
    );
  }
  return getUserDisplayLabel(
    workflow.reviewerName,
    workflow.reviewerEmail,
    workflow.reviewerUserId,
    workflow.currentReviewer,
  );
};

const normalizeId = (value) => String(value || "").trim();

const getAssignedUserId = (dpia, mode) => {
  const workflow = dpia?.workflow || {};
  if (workflow.currentAssigneeUserId)
    return normalizeId(workflow.currentAssigneeUserId);
  if (mode === "approval") {
    return normalizeId(
      workflow.approverUserId ||
        workflow.approverId ||
        workflow.approver_id ||
        "",
    );
  }
  return normalizeId(
    workflow.reviewerUserId ||
      workflow.reviewerId ||
      workflow.reviewer_id ||
      workflow.currentReviewer ||
      "",
  );
};

const getStageOwner = (dpia, nextStatus, mode) => {
  const workflow = dpia?.workflow || {};
  const isApprovalOwner =
    mode === "approval" ||
    ["Pending Approval", "Approved", "Rejected", "Closed"].includes(nextStatus);

  if (isApprovalOwner) {
    return {
      id: normalizeId(
        workflow.approverUserId ||
          workflow.approverId ||
          workflow.approver_id ||
          "",
      ),
      label: getUserDisplayLabel(
        workflow.approverName,
        workflow.approverEmail,
        workflow.approverUserId,
        "Assigned approver",
      ),
    };
  }

  return {
    id: normalizeId(
      workflow.reviewerUserId ||
        workflow.reviewerId ||
        workflow.reviewer_id ||
        "",
    ),
    label: getUserDisplayLabel(
      workflow.reviewerName,
      workflow.reviewerEmail,
      workflow.reviewerUserId,
      "Assigned reviewer",
    ),
  };
};

const getCurrentUserIdFromStorage = () => {
  if (typeof window === "undefined") return "";
  const keys = [
    "user",
    "userData",
    "user_data",
    "currentUser",
    "authUser",
    "loginUser",
  ];

  for (const key of keys) {
    const raw =
      window.localStorage.getItem(key) || window.sessionStorage.getItem(key);
    if (!raw) continue;
    try {
      const parsed = JSON.parse(raw);
      const id =
        parsed?._id ||
        parsed?.id ||
        parsed?.userId ||
        parsed?.user_id ||
        parsed?.user_uuid ||
        parsed?.value;
      if (id) return normalizeId(id);
    } catch {
      if (/^[a-f0-9]{24}$/i.test(raw)) return raw;
    }
  }

  return normalizeId(
    window.localStorage.getItem("userId") ||
      window.localStorage.getItem("user_id") ||
      window.localStorage.getItem("user_uuid") ||
      window.sessionStorage.getItem("userId") ||
      window.sessionStorage.getItem("user_id") ||
      window.sessionStorage.getItem("user_uuid") ||
      "",
  );
};

const canCurrentUserAct = (dpia, mode, currentUserId) => {
  const assignedId = getAssignedUserId(dpia, mode);
  // If current user or assignment id is not available, do not block the UI in dev/local testing.
  if (!currentUserId || !assignedId) return true;
  return normalizeId(currentUserId) === normalizeId(assignedId);
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

const WorkflowHistory = ({ history = [], createdAt, updatedAt }) => {
  const safeHistory = Array.isArray(history) ? history : [];

  if (!safeHistory.length) {
    return (
      <div className="space-y-2 text-sm text-gray-600">
        <p>No status-change log has been recorded yet.</p>
        <div className="rounded-lg border bg-gray-50 p-3">
          <div>
            <span className="font-semibold">Created:</span>{" "}
            {formatDate(createdAt)}
          </div>
          <div>
            <span className="font-semibold">Last Updated:</span>{" "}
            {formatDate(updatedAt)}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {safeHistory
        .slice()
        .reverse()
        .map((item, index) => (
          <div
            key={`${item.changedAt || index}-${index}`}
            className="rounded-lg border bg-gray-50 p-3"
          >
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <span className="font-semibold text-gray-700">
                {item.fromStatus || "-"}
              </span>
              <span className="text-gray-400">→</span>
              <span className="font-semibold text-[#2B245C]">
                {item.toStatus || item.status || "-"}
              </span>
              <span className="text-xs text-gray-500">
                {formatDate(item.changedAt || item.createdAt)}
              </span>
            </div>
            {(item.changedBy || item.actor || item.user) && (
              <p className="mt-1 text-xs text-gray-500">
                By: {item.changedBy || item.actor || item.user}
              </p>
            )}
            {item.comment && (
              <p className="mt-1 whitespace-pre-wrap text-sm text-gray-700">
                {item.comment}
              </p>
            )}
          </div>
        ))}
    </div>
  );
};

const DpiaAnswers = ({ dpia }) => {
  const answers = flattenAnswers(dpia?.templateQuestions);
  if (!answers.length) {
    return (
      <p className="text-sm text-gray-500">No DPIA assessment answers found.</p>
    );
  }

  let currentSection = "";
  return (
    <div className="max-h-[420px] space-y-3 overflow-y-auto pr-2">
      {answers.map((item, index) => {
        const showSection = item.sectionTitle !== currentSection;
        currentSection = item.sectionTitle;
        return (
          <div key={`${item.label}-${index}`}>
            {showSection && (
              <h4 className="mb-2 mt-4 text-sm font-bold uppercase tracking-wide text-[#2B245C]">
                {item.sectionTitle}
              </h4>
            )}
            <div className="rounded-lg border bg-white p-3">
              <div className="text-sm font-medium text-gray-800">
                {item.label}
              </div>
              <div className="mt-1 whitespace-pre-wrap text-sm text-gray-700">
                {String(item.answer || "-")}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

const nextStepCopy = (status, mode) => {
  if (["NEXT_STAGE", "COMPLETE_STAGE"].includes(status))
    return "This completes the active stage. Backend will block this action if open queries exist, then automatically starts the next configured stage or moves to final approval.";
  if (status === "Pending Approval")
    return "This will move the DPIA from Review Queue to Approval Queue for final decision.";
  if (status === "Remediation Required")
    return "This sends the assessment back for correction. The comment should clearly mention what needs to be fixed.";
  if (status === "Approved")
    return "This marks the DPIA as approved and records the approval decision in workflow history.";
  if (status === "Rejected")
    return "This rejects the DPIA and records the rejection reason in workflow history.";
  if (status === "Closed")
    return "This closes the DPIA workflow after final handling.";
  if (mode === "review")
    return "This keeps the DPIA in review and records reviewer action in workflow history.";
  return "This records the approver decision in workflow history.";
};

const DpiaWorkflowQueue = ({
  title,
  description,
  endpoint,
  mode = "review",
  fallbackStatuses = reviewStatuses,
  actionOptions = [],
}) => {
  const router = useRouter();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [dismissedQueryDpiaId, setDismissedQueryDpiaId] = useState(null);
  const [actionStatus, setActionStatus] = useState("");
  const [comment, setComment] = useState("");
  const [currentReviewer, setCurrentReviewer] = useState("");
  const [saving, setSaving] = useState(false);
  const [statusFilter, setStatusFilter] = useState("All");
  const currentUserId = useMemo(() => getCurrentUserIdFromStorage(), []);

  const fetchQueue = async () => {
    try {
      setLoading(true);
      const response = await CustomAxios.get(
        `${baseurl}/${initURL}/dpia/${endpoint}`,
      );
      setItems(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error(`Failed to load ${endpoint}:`, error);
      setItems([]);
      toast.error(
        "Failed to fetch assigned DPIA queue. Please refresh after login.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue();
  }, [endpoint]);

  const stats = useMemo(() => {
    return items.reduce((acc, item) => {
      const status = getStatus(item);
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});
  }, [items]);

  const visibleItems = useMemo(() => {
    if (statusFilter === "All") return items;
    return items.filter((item) => getStatus(item) === statusFilter);
  }, [items, statusFilter]);

  const openView = (dpia) => {
    setSelected(dpia);
    setActionStatus("");
    setComment("");
    setCurrentReviewer(
      assigneeForMode(dpia, mode) === "-" ? "" : assigneeForMode(dpia, mode),
    );
  };

  const openAction = (dpia, nextStatus) => {
    const canAct = canCurrentUserAct(dpia, mode, currentUserId);
    if (!canAct) {
      toast.error(
        `Only the assigned ${mode === "approval" ? "approver" : "reviewer"} can act on this DPIA.`,
      );
      return;
    }

    setSelected(dpia);
    setActionStatus(nextStatus || actionOptions[0]?.value || "");
    setComment("");
    const owner = getStageOwner(dpia, nextStatus, mode);
    setCurrentReviewer(owner.id || owner.label || "");
  };

  const closeWorkflowModal = () => {
    const query = { ...(router.query || {}) };
    const currentDpiaId = query.dpiaId;

    if (currentDpiaId) {
      setDismissedQueryDpiaId(String(currentDpiaId));
      delete query.dpiaId;
      router.replace({ pathname: router.pathname, query }, undefined, {
        shallow: true,
      });
    }

    setSelected(null);
    setActionStatus("");
    setComment("");
  };

  useEffect(() => {
    const requestedId = router.query?.dpiaId;
    if (!requestedId || !items.length || selected) return;
    if (dismissedQueryDpiaId && String(requestedId) === dismissedQueryDpiaId)
      return;

    const matched = items.find(
      (item) => String(item._id) === String(requestedId),
    );
    if (matched) {
      openView(matched);
    }
  }, [router.query?.dpiaId, items, selected, dismissedQueryDpiaId]);

  const submitAction = async () => {
    if (!selected?._id || !actionStatus) return;
    try {
      setSaving(true);
      await CustomAxios.put(
        `${baseurl}/${initURL}/dpia/workflow-status/${selected._id}`,
        {
          status: actionStatus,
          comment,
          currentReviewer,
          stageOwnerUserId: currentReviewer,
        },
      );
      toast.success(
        "DPIA workflow updated. Logs are available in the Workflow History section.",
      );
      setSelected(null);
      await fetchQueue();
    } catch (error) {
      console.error("Failed to update workflow:", error);
      toast.error(
        error?.response?.data?.message || "Failed to update DPIA workflow.",
      );
    } finally {
      setSaving(false);
    }
  };

  const updateQueryStatus = async (query, status) => {
    if (!selected?._id || !(query?.id || query?._id)) {
      toast.error(
        "Query id is missing. Please save the DPIA again or raise a new query.",
      );
      return;
    }

    try {
      const response = await CustomAxios.put(
        `${baseurl}/${initURL}/dpia/${selected._id}/queries/${query.id || query._id}`,
        {
          status,
          comment:
            status === "Closed"
              ? "Query resolved and closed from Review / Logs."
              : "Query marked as answered from Review / Logs.",
        },
      );
      const updated = response.data || selected;
      setSelected(updated);
      setItems((prev) =>
        prev.map((item) => (item._id === updated._id ? updated : item)),
      );
      toast.success(
        status === "Closed" ? "Query closed." : "Query marked as answered.",
      );
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to update query.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="mx-5 min-h-screen bg-white rounded-lg p-5 my-3 space-y-5">
        <DpiaQuickNav title={title} description={description} />

        {/* <DpiaFlowGuide active={mode === "approval" ? "approval" : "review"} /> */}

        <div className="p-6 bg-[#2B245C] rounded-2xl shadow-lg hover:shadow-2xl transition-shadow duration-300">
          <div className="flex flex-col gap-4 md:flex-row items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-cyan-50">{title}</h1>
              <p className="mt-1 max-w-2xl text-sm leading-6 text-white">
                {description}
              </p>
              {/* <p className="mt-2 text-xs text-gray-500">
                Click <b>Review / Logs</b> to view answers and workflow history.
                Use the Next Action dropdown to move the DPIA to the next stage
                without crowding the table.
              </p> */}
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={fetchQueue}
                className="rounded-lg bg-white text-[#2B245C] px-6 py-2.5 text-sm font-semibold shadow-md hover:shadow-lg hover:bg-blue-50 transition-all"
              >
                Refresh
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
          <button
            type="button"
            onClick={() => setStatusFilter("All")}
            className={`rounded-lg border p-4 text-left ${statusFilter === "All" ? "border-[#2B245C] bg-blue-50" : "bg-gray-50"}`}
          >
            <div className="text-xs uppercase text-gray-500">Total</div>
            <div className="text-2xl font-bold text-[#2B245C]">
              {items.length}
            </div>
          </button>
          {Object.entries(stats)
            .slice(0, 3)
            .map(([status, count]) => (
              <button
                type="button"
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`rounded-lg border p-4 text-left ${statusFilter === status ? "border-[#2B245C] bg-blue-50" : "bg-gray-50"}`}
              >
                <div className="text-xs uppercase text-gray-500">{status}</div>
                <div className="text-2xl font-bold text-[#2B245C]">{count}</div>
              </button>
            ))}
        </div>

        <div className="rounded-2xl border border-[#2B245C] bg-white p-6 shadow-lg hover:shadow-2xl transition-shadow duration-300">
          <div className="overflow-hidden rounded-lg border bg-white shadow-sm">
            {loading ? (
              <div className="p-8 text-center text-gray-600">
                Loading queue...
              </div>
            ) : visibleItems.length === 0 ? (
              <div className="p-8 text-center text-gray-600">
                No DPIA records assigned to you in this queue.
              </div>
            ) : (
              <div className="overflow-x-auto rounded-lg border border-gray-800">
                <table className="min-w-full text-sm">
                  <thead className="bg-[#2B245C] text-left text-white border-b border-gray-800">
                    <tr>
                      <th className="w-[40px] p-3">#</th>
                      <th className="w-[220px] p-3">Business Process</th>
                      <th className="w-[160px] p-3">Template</th>
                      <th className="w-[180px] p-3">Status</th>
                      <th className="w-[110px] p-3">Assigned To</th>
                      <th className="w-[90px] p-3">Due Date</th>
                      <th className="w-[135px] p-3">Updated</th>
                      <th className="w-[360px] p-3 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {visibleItems.map((dpia, index) => {
                      const status = getStatus(dpia);
                      const workflow = dpia.workflow || {};
                      const dueDate =
                        workflow.currentDueDate ||
                        (mode === "approval"
                          ? workflow.approvalDueDate
                          : workflow.reviewDueDate);
                      const canAct = canCurrentUserAct(
                        dpia,
                        mode,
                        currentUserId,
                      );
                      return (
                        <tr
                          key={dpia._id}
                          className="border-t align-top hover:bg-gray-50"
                        >
                          <td className="p-3">{index + 1}</td>
                          <td className="p-3">
                            <div className="font-medium text-gray-900">
                              {getBusinessProcessLabel(dpia)}
                            </div>
                            <div className="text-xs text-gray-500">
                              {getCompanyName(dpia)}
                            </div>
                          </td>
                          <td className="p-3">
                            <div>{dpia.templateName || "-"}</div>
                            <div className="text-xs text-gray-500">
                              v{dpia.templateVersion || "-"}
                            </div>
                          </td>
                          <td className="p-3">
                            <span
                              className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${statusColor(status)}`}
                            >
                              {status}
                            </span>
                            {workflow.latestComment && (
                              <div
                                className="mt-1 max-w-[220px] truncate text-xs text-gray-500"
                                title={workflow.latestComment}
                              >
                                {workflow.latestComment}
                              </div>
                            )}
                          </td>
                          <td className="p-3">{assigneeForMode(dpia, mode)}</td>
                          <td className="p-3">{dueDate || "-"}</td>
                          <td className="p-3">{formatDate(dpia.updatedAt)}</td>
                          <td className="p-3">
                            <div className="flex w-full items-center justify-center gap-2 whitespace-nowrap">
                              <button
                                type="button"
                                onClick={() => openView(dpia)}
                                className="rounded-md border border-blue-200 px-3 py-1.5 text-[#2B245C] hover:bg-blue-50 hover:border-blue-300"
                              >
                                Review / Logs
                              </button>
                              <button
                                type="button"
                                onClick={() => openView(dpia)}
                                className="rounded-md border border-purple-200 px-3 py-1.5 text-purple-700 hover:bg-purple-50 hover:border-purple-300"
                                title="Open the submitted assessment with saved template answers, queries, reminders and logs."
                              >
                                View Assessment
                              </button>
                            </div>

                            <div className="mx-auto mt-2 w-full max-w-[300px] rounded-lg border bg-gray-50 p-2">
                              <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                                Next Action
                              </label>
                              {canAct ? (
                                <select
                                  defaultValue=""
                                  onChange={(e) => {
                                    const nextStatus = e.target.value;
                                    if (nextStatus) {
                                      openAction(dpia, nextStatus);
                                      e.target.value = "";
                                    }
                                  }}
                                  className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-[#2B245C] focus:border-[#2B245C] focus:outline-none focus:ring-1 focus:ring-[#2B245C]"
                                >
                                  <option value="">
                                    Choose workflow action...
                                  </option>
                                  {actionOptions.map((action) => (
                                    <option
                                      key={action.value}
                                      value={action.value}
                                    >
                                      {action.label}
                                    </option>
                                  ))}
                                </select>
                              ) : (
                                <div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700">
                                  Only the assigned{" "}
                                  {mode === "approval"
                                    ? "approver"
                                    : "reviewer"}{" "}
                                  can act.
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {selected && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="max-h-[90vh] w-full max-w-6xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
              <div className="sticky top-0 z-10 flex items-center justify-between border-b bg-white p-5">
                <div>
                  <h2 className="text-xl font-bold text-[#2B245C]">
                    {getBusinessProcessLabel(selected) || "DPIA Assessment"}
                  </h2>
                  <p className="text-sm text-gray-500">
                    {selected.templateName || "No template"} • v
                    {selected.templateVersion || "-"} • Current status:{" "}
                    {getStatus(selected)}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={closeWorkflowModal}
                  className="rounded-md border px-3 py-1 text-gray-600 hover:bg-gray-50"
                >
                  Close
                </button>
              </div>

              <div className="grid grid-cols-1 gap-5 p-5 lg:grid-cols-3">
                <div className="space-y-5 lg:col-span-2">
                  <div className="rounded-lg border p-4">
                    <h3 className="text-lg font-semibold text-[#2B245C]">
                      DPIA Assessment Answers
                    </h3>
                    <p className="mb-3 text-sm text-gray-500">
                      These are the answers submitted by the assessment owner
                      using the selected DPIA template.
                    </p>
                    <DpiaAnswers dpia={selected} />
                  </div>
                </div>
                <div className="space-y-5">
                  <div className="rounded-lg border p-4">
                    <h3 className="font-semibold text-[#2B245C]">
                      Reviewer / Approver Assignment
                    </h3>
                    <div className="mt-3 space-y-2 text-sm text-gray-700">
                      <div>
                        <span className="font-medium">Current Stage:</span>{" "}
                        {selected.workflow?.currentStage ||
                          selected.workflow?.status ||
                          "-"}
                      </div>
                      <div>
                        <span className="font-medium">Current Assignee:</span>{" "}
                        {getUserDisplayLabel(
                          selected.workflow?.currentAssigneeName,
                          selected.workflow?.currentAssigneeEmail,
                          selected.workflow?.currentAssigneeUserId,
                          "Not assigned",
                        )}
                      </div>
                      <div>
                        <span className="font-medium">Current Due:</span>{" "}
                        {selected.workflow?.currentDueDate || "-"}
                      </div>
                      <div>
                        <span className="font-medium">Reviewer:</span>{" "}
                        {selected.workflow?.reviewerName ||
                          selected.workflow?.reviewerEmail ||
                          "Not assigned"}
                      </div>
                      <div>
                        <span className="font-medium">Approver:</span>{" "}
                        {selected.workflow?.approverName ||
                          selected.workflow?.approverEmail ||
                          "Not assigned"}
                      </div>
                      <div>
                        <span className="font-medium">Review Due:</span>{" "}
                        {selected.workflow?.reviewDueDate || "-"}
                      </div>
                      <div>
                        <span className="font-medium">Approval Due:</span>{" "}
                        {selected.workflow?.approvalDueDate || "-"}
                      </div>
                    </div>
                  </div>

                  <div className="rounded-lg border p-4">
                    <h3 className="font-semibold text-[#2B245C]">
                      Queries, Reminders & Collaboration
                    </h3>
                    <div className="mt-3 space-y-2 text-sm text-gray-700">
                      <div>
                        <span className="font-medium">Open Queries:</span>{" "}
                        {
                          (selected.queryEscalations || []).filter(
                            (q) =>
                              !["Closed", "Resolved", "Cancelled"].includes(
                                q.status,
                              ),
                          ).length
                        }
                      </div>
                      <div>
                        <span className="font-medium">Reminders:</span>{" "}
                        {(selected.reminders || []).length}
                      </div>
                      <div>
                        <span className="font-medium">Custom Roles:</span>{" "}
                        {(selected.customRoles || []).length}
                      </div>
                      <div>
                        <span className="font-medium">Artefacts:</span>{" "}
                        {
                          (selected.artefacts || selected.documents || [])
                            .length
                        }
                      </div>
                      <div>
                        <span className="font-medium">
                          Next Periodic Review:
                        </span>{" "}
                        {selected.periodicReview?.nextReviewDate || "-"}
                      </div>
                    </div>

                    <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-3">
                      <h4 className="text-sm font-semibold text-amber-800">
                        Query Resolution
                      </h4>
                      <p className="mt-1 text-xs text-amber-700">
                        Open queries block next-stage movement. Mark the query
                        Answered or Closed here after response/evidence is
                        received.
                      </p>
                      <div className="mt-3 space-y-2">
                        {(selected.queryEscalations || []).length ? (
                          (selected.queryEscalations || []).map(
                            (query, index) => (
                              <div
                                key={query.id || query._id || index}
                                className="rounded-md border bg-white p-2 text-xs text-gray-700"
                              >
                                <div className="font-semibold text-gray-900">
                                  {query.title || `Query ${index + 1}`}
                                </div>
                                <div className="mt-1 whitespace-pre-wrap">
                                  {query.description ||
                                    query.query ||
                                    "No details provided."}
                                </div>
                                <div className="mt-1 text-gray-500">
                                  Status: {query.status || "Open"} • Due:{" "}
                                  {query.dueDate || "-"}
                                </div>
                                <div className="mt-2 flex flex-wrap gap-2">
                                  {!["Answered", "Closed", "Resolved"].includes(
                                    query.status,
                                  ) && (
                                    <button
                                      type="button"
                                      onClick={() =>
                                        updateQueryStatus(query, "Answered")
                                      }
                                      className="rounded-md border border-blue-300 px-2 py-1 text-blue-700 hover:bg-blue-50"
                                    >
                                      Mark Answered
                                    </button>
                                  )}
                                  {!["Closed", "Resolved"].includes(
                                    query.status,
                                  ) && (
                                    <button
                                      type="button"
                                      onClick={() =>
                                        updateQueryStatus(query, "Closed")
                                      }
                                      className="rounded-md border border-green-300 px-2 py-1 text-green-700 hover:bg-green-50"
                                    >
                                      Close Query
                                    </button>
                                  )}
                                </div>
                              </div>
                            ),
                          )
                        ) : (
                          <div className="rounded-md border bg-white p-2 text-xs text-gray-500">
                            No query raised for this DPIA.
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="rounded-lg border p-4">
                    <h3 className="font-semibold text-[#2B245C]">
                      Workflow Action
                    </h3>
                    <p className="mt-1 text-xs text-gray-500">
                      Select a decision, assign the owner if needed, add a
                      comment, and submit. The action is saved in workflow logs.
                    </p>
                    <div className="mt-3 space-y-3">
                      <div>
                        <label className="mb-1 block text-sm font-medium">
                          Change Status
                        </label>
                        <select
                          value={actionStatus}
                          onChange={(e) => setActionStatus(e.target.value)}
                          className="w-full rounded-md border px-3 py-2"
                        >
                          <option value="">Only view answers/logs</option>
                          {actionOptions.map((action) => (
                            <option key={action.value} value={action.value}>
                              {action.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      {actionStatus && (
                        <div className="rounded-md border border-blue-200 bg-blue-50 p-3 text-xs text-gray-700">
                          {nextStepCopy(actionStatus, mode)}
                        </div>
                      )}
                      <div className="rounded-md border bg-gray-50 p-3">
                        <div className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                          {mode === "approval"
                            ? "Assigned Approver"
                            : actionStatus === "Pending Approval"
                              ? "Assigned Approver"
                              : "Assigned Reviewer"}
                        </div>
                        <div className="mt-1 text-sm font-semibold text-[#2B245C]">
                          {getStageOwner(selected, actionStatus, mode).label}
                        </div>
                        <p className="mt-1 text-xs text-gray-500">
                          Owner is selected in the assessment assignment section
                          and cannot be changed here.
                        </p>
                      </div>
                      <div>
                        <label className="mb-1 block text-sm font-medium">
                          Comment / Decision Note
                        </label>
                        <textarea
                          rows={4}
                          value={comment}
                          onChange={(e) => setComment(e.target.value)}
                          className="w-full rounded-md border px-3 py-2"
                          placeholder="Mention what was reviewed, what changed, or why this decision was taken."
                        />
                      </div>
                      <button
                        type="button"
                        onClick={submitAction}
                        disabled={
                          saving ||
                          !actionStatus ||
                          !canCurrentUserAct(selected, mode, currentUserId)
                        }
                        className="w-full rounded-md bg-[#2B245C] px-4 py-2 text-white disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {saving
                          ? "Saving..."
                          : mode === "approval"
                            ? "Submit Approval Decision"
                            : "Submit Review Decision"}
                      </button>
                    </div>
                  </div>

                  <div className="rounded-lg border p-4">
                    <h3 className="font-semibold text-[#2B245C]">
                      Workflow History / Logs
                    </h3>
                    <p className="mt-1 text-xs text-gray-500">
                      All review and approval movements are visible here.
                    </p>
                    <div className="mt-3">
                      <WorkflowHistory
                        history={selected.workflow?.approvalHistory || []}
                        createdAt={selected.createdAt}
                        updatedAt={selected.updatedAt}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DpiaWorkflowQueue;
