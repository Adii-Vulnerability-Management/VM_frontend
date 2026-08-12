import CustomAxios from "@/globalcomponents/CustomAxios";
import { baseurl, initURL } from "../../../BaseUrl";

export const TPRM_NEW_BASE = `${baseurl}/${initURL}/third-party-risk-management`;
export const TPRM_VENDOR_BASE = `${baseurl}/${initURL}/TPRM/vendor-management`;
export const TPRM_VENDOR_FINDINGS_BASE = `${baseurl}/${initURL}/TPRM/vendor/findings`;

const withScheduleYear = (scheduleYear, scheduleMonth) => ({
  params: {
    scheduleYear: scheduleYear || new Date().getFullYear(),
    ...(scheduleMonth ? { scheduleMonth } : {}),
  },
});

const unwrap = (response) => {
  const payload = response?.data;
  if (Array.isArray(payload?.docs)) return payload.docs;
  if (Array.isArray(payload?.body?.docs)) return payload.body.docs;
  if (Array.isArray(payload?.body?.data)) return payload.body.data;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.records)) return payload.records;
  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(payload?.results)) return payload.results;
  return payload;
};

const requestListWithFallback = async (requests) => {
  let lastError;
  let hadSuccessfulEmptyResponse = false;

  for (const request of requests) {
    try {
      const result = await request();
      const list = Array.isArray(result) ? result : [];
      if (list.length > 0) return list;
      hadSuccessfulEmptyResponse = true;
    } catch (error) {
      lastError = error;
    }
  }

  if (!hadSuccessfulEmptyResponse && lastError) throw lastError;
  return [];
};

export const TPRM_QNA_STATUS = {
  answered: "Answered",
  inProgress: "In Progress",
  reviewed: "Reviewed",
  rejected: "Rejected",
};

export const GOVERNANCE_COMMITTEE_DECISIONS = [
  "Approved for onboarding",
  "Approved with conditions",
  "Rejected",
  "Reassessment required",
  "Physical audit required",
  "Incident matrix required",
  "No decision",
];

const firstValue = (...values) =>
  values.find((value) => value !== undefined && value !== null && value !== "");

export const normalizeCommitteeDecision = (value) => {
  const normalized = String(value || "")
    .trim()
    .toLowerCase();

  if (!normalized) return "No decision";

  const directMatch = GOVERNANCE_COMMITTEE_DECISIONS.find(
    (decision) => decision.toLowerCase() === normalized,
  );
  if (directMatch) return directMatch;

  if (normalized === "approved" || normalized === "approve") {
    return "Approved for onboarding";
  }
  if (
    normalized === "approved with condition" ||
    normalized === "approved with conditions"
  ) {
    return "Approved with conditions";
  }
  if (normalized === "reject" || normalized === "rejected") {
    return "Rejected";
  }
  if (normalized.includes("reassessment")) {
    return "Reassessment required";
  }
  if (normalized.includes("physical audit")) {
    return "Physical audit required";
  }
  if (normalized.includes("incident matrix")) {
    return "Incident matrix required";
  }

  return "No decision";
};

const normalizeThirdParty = (party = {}) => ({
  ...party,
  _id: firstValue(party._id, party.id),
  id: firstValue(party.id, party._id),
  thirdPartyId: firstValue(
    party.thirdPartyId,
    party.vendorId,
    party._id,
    party.id,
  ),
  name: firstValue(
    party.name,
    party.thirdPartyName,
    party.vendorName,
    "Unnamed third party",
  ),
  thirdPartyType: firstValue(
    party.thirdPartyType,
    party.vendorType,
    party.scope,
    Array.isArray(party.assessmentTypes)
      ? party.assessmentTypes.join(", ")
      : "",
  ),
  riskCategory: firstValue(
    party.riskCategory,
    party.riskRating,
    party.riskLevel,
    "Unclassified",
  ),
});

const normalizeThirdPartyList = (items) =>
  (Array.isArray(items) ? items : []).map(normalizeThirdParty);

export const normalizeThirdPartyQnaStatus = (status) => {
  const value = String(status || "")
    .toLowerCase()
    .replace(/[-_]/g, " ")
    .trim();

  if (value.includes("reject")) return TPRM_QNA_STATUS.rejected;
  if (value.includes("review")) return TPRM_QNA_STATUS.reviewed;
  if (value.includes("answer") || value.includes("submit")) {
    return TPRM_QNA_STATUS.answered;
  }
  return TPRM_QNA_STATUS.inProgress;
};

export const extractThirdPartyQnaList = (payload) => {
  const candidates = [
    payload,
    payload?.data,
    payload?.docs,
    payload?.records,
    payload?.items,
    payload?.results,
    payload?.qnas,
    payload?.questions,
    payload?.assessmentQnAs,
    payload?.assessmentQnas,
    payload?.response?.qnas,
    payload?.response?.questions,
    payload?.response?.assessmentQnAs,
    payload?.response?.assessmentQnas,
    payload?.response?.data,
  ];

  for (const candidate of candidates) {
    if (!Array.isArray(candidate)) continue;
    const rows = candidate.filter((item) => item && typeof item === "object");
    if (rows.length) return rows;
  }

  const groupedContainers = [
    payload,
    payload?.data,
    payload?.response,
    payload?.qnasByCategory,
    payload?.qnasByStatus,
  ].filter((container) => container && typeof container === "object");

  for (const container of groupedContainers) {
    const rows = Object.values(container)
      .filter(Array.isArray)
      .flat()
      .filter((item) => item && typeof item === "object");
    if (rows.length) return rows;
  }

  return [];
};

const normalizeApplicable = (value) => {
  if (typeof value === "boolean") return value ? "Yes" : "No";
  const normalized = String(firstValue(value, "NA")).toUpperCase();
  if (normalized === "N/A" || normalized === "NA") return "NA";
  if (normalized === "YES") return "Yes";
  if (normalized === "NO") return "No";
  return "NA";
};

const normalizeEvidences = (value) => {
  if (Array.isArray(value)) return value;
  if (!value) return [];
  return [value];
};

export const normalizeThirdPartyQnaItem = (item = {}, context = {}) => {
  const questionId = firstValue(
    item.questionId,
    item.questionCode,
    item.controlId,
    item._id,
    item.id,
  );

  return {
    ...item,
    _id: firstValue(item._id, item.id, questionId),
    questionId,
    questionnaireId: firstValue(item.questionnaireId, context.questionnaireId),
    question: firstValue(
      item.question,
      item.questionDetails?.question,
      item.questionDetails?.questionText,
      item.questionText,
      item.questionName,
      item.questionTitle,
      item.controlQuestion,
      item.prompt,
      item.title,
      "Question text not available",
    ),
    category: firstValue(
      item.category,
      item.questionCategory,
      item.categoryName,
      item.questionDetails?.category,
      context.category,
      "",
    ),
    domain: firstValue(
      item.domain,
      item.questionDomain,
      item.questionDetails?.domain,
      item.category,
      context.category,
      "-",
    ),
    applicable: normalizeApplicable(
      firstValue(item.applicable, item.isApplicable),
    ),
    finalResponse: firstValue(
      item.finalResponse,
      item.finalAnswer,
      item.responseAnswer,
      item.vendorResponse,
      item.thirdPartyResponse,
      item.thirdPartyAnswer,
      item.responseText,
      item.answerText,
      item.answer,
      item.response,
      "",
    ),
    evidences: normalizeEvidences(
      firstValue(item.evidences, item.evidence, item.attachments, []),
    ),
    status: normalizeThirdPartyQnaStatus(
      item.status || item.qnaStatus || item.responseStatus || item.reviewStatus,
    ),
  };
};

export const normalizeThirdPartyQnas = (payload, context = {}) =>
  extractThirdPartyQnaList(payload).map((item) =>
    normalizeThirdPartyQnaItem(item, {
      ...context,
      questionnaireId:
        context.questionnaireId ||
        payload?.questionnaireId ||
        payload?.response?.questionnaireId,
    }),
  );

export const getThirdPartyQnaBuckets = (qnas = []) => {
  const normalized = qnas.map((item) => normalizeThirdPartyQnaItem(item));
  return {
    all: normalized,
    answered: normalized.filter(
      (item) => item.status === TPRM_QNA_STATUS.answered,
    ),
    inProgress: normalized.filter(
      (item) => item.status === TPRM_QNA_STATUS.inProgress,
    ),
    reviewed: normalized.filter(
      (item) => item.status === TPRM_QNA_STATUS.reviewed,
    ),
    rejected: normalized.filter(
      (item) => item.status === TPRM_QNA_STATUS.rejected,
    ),
  };
};

export const getThirdPartyQnaCounts = (qnas = []) => {
  const buckets = getThirdPartyQnaBuckets(qnas);
  return {
    totalQuestions: buckets.all.length,
    answered: buckets.answered.length,
    inProgress: buckets.inProgress.length,
    reviewed: buckets.reviewed.length,
    rejected: buckets.rejected.length,
  };
};

const sanitizeAssessmentQnaPayload = (payload) => {
  if (!payload || typeof payload !== "object" || payload instanceof FormData) {
    return payload;
  }

  if (!Object.prototype.hasOwnProperty.call(payload, "applicable")) {
    return payload;
  }

  return {
    ...payload,
    applicable: normalizeApplicable(payload.applicable),
  };
};

export const thirdPartyRiskApi = {
  dashboard: () => CustomAxios.get(`${TPRM_NEW_BASE}/dashboard`).then(unwrap),

  listThirdParties: () =>
    requestListWithFallback([
      () => CustomAxios.get(`${TPRM_NEW_BASE}/third-parties`).then(unwrap),
      () =>
        CustomAxios.get(`${TPRM_VENDOR_BASE}/vendor/list`, {
          params: { page: 1, limit: 50 },
        }).then(unwrap),
    ]).then(normalizeThirdPartyList),

  listThirdPartyInventory: () =>
    CustomAxios.get(`${TPRM_NEW_BASE}/third-parties`, {
      params: { page: 1, limit: 1000 },
    })
      .then(unwrap)
      .then(normalizeThirdPartyList),

  getThirdPartyById: (id) =>
    CustomAxios.get(`${TPRM_NEW_BASE}/third-parties/${id}`).then(unwrap),

  createThirdParty: (payload) =>
    CustomAxios.post(`${TPRM_NEW_BASE}/third-parties`, payload).then(unwrap),
  updateThirdParty: (id, payload) =>
    CustomAxios.patch(`${TPRM_NEW_BASE}/third-parties/${id}`, payload).then(
      unwrap,
    ),
  bulkUploadThirdParties: (formData) =>
    CustomAxios.post(
      `${TPRM_NEW_BASE}/third-parties/bulk-upload`,
      formData,
    ).then(unwrap),

  listCommitteeMembers: () =>
    CustomAxios.get(`${TPRM_NEW_BASE}/governance-committee/members`).then(
      unwrap,
    ),
  createCommitteeMember: (payload) =>
    CustomAxios.post(
      `${TPRM_NEW_BASE}/governance-committee/members`,
      payload,
    ).then(unwrap),
  updateCommitteeMember: (id, payload) =>
    CustomAxios.patch(
      `${TPRM_NEW_BASE}/governance-committee/members/${id}`,
      payload,
    ).then(unwrap),
  deleteCommitteeMember: (id) =>
    CustomAxios.delete(
      `${TPRM_NEW_BASE}/governance-committee/members/${id}`,
    ).then(unwrap),
  createMeetingMinutes: (payload) =>
    CustomAxios.post(
      `${TPRM_NEW_BASE}/governance-committee/meetings`,
      payload,
    ).then(unwrap),
  updateMeetingMinutes: (id, payload) =>
    CustomAxios.patch(
      `${TPRM_NEW_BASE}/governance-committee/meetings/${id}`,
      payload,
    ).then(unwrap),
  listMeetingMinutes: () =>
    CustomAxios.get(`${TPRM_NEW_BASE}/governance-committee/meetings`).then(
      unwrap,
    ),

  evaluateThreshold: (payload) =>
    CustomAxios.post(
      `${TPRM_NEW_BASE}/threshold-assessment/evaluate`,
      payload,
    ).then(unwrap),
  saveThreshold: (thirdPartyId, payload) =>
    CustomAxios.post(
      `${TPRM_NEW_BASE}/threshold-assessment/${thirdPartyId}`,
      payload,
    ).then(unwrap),
  listThresholdAssessments: () =>
    CustomAxios.get(`${TPRM_NEW_BASE}/threshold-assessment`).then(unwrap),

  listQuestionnaires: () =>
    CustomAxios.get(`${TPRM_NEW_BASE}/questionnaires`).then(unwrap),
  createQuestionnaire: (payload) =>
    CustomAxios.post(`${TPRM_NEW_BASE}/questionnaires`, payload).then(unwrap),
  updateQuestionnaire: (id, payload) =>
    CustomAxios.patch(`${TPRM_NEW_BASE}/questionnaires/${id}`, payload).then(
      unwrap,
    ),

  listAssessments: () =>
    CustomAxios.get(`${TPRM_NEW_BASE}/assessments`).then(unwrap),
  listAssessmentsByThirdParty: (thirdPartyId) =>
    CustomAxios.get(
      `${TPRM_NEW_BASE}/assessments/third-party/${thirdPartyId}`,
    ).then(unwrap),
  checkAssessmentSchedule: (thirdPartyId) =>
    CustomAxios.get(
      `${TPRM_NEW_BASE}/assessments/third-party/${encodeURIComponent(
        thirdPartyId,
      )}/schedule-check`,
    ).then(unwrap),
  createAssessment: (payload) =>
    CustomAxios.post(`${TPRM_NEW_BASE}/assessments`, payload).then(unwrap),
  sendAssessment: (assessmentId) =>
    CustomAxios.post(`${TPRM_NEW_BASE}/assessments/${assessmentId}/send`).then(
      unwrap,
    ),
  getAssessmentResponse: (assessmentId) =>
    CustomAxios.get(
      `${TPRM_NEW_BASE}/assessments/${assessmentId}/response`,
    ).then(unwrap),
  getAssessmentQnas: (assessmentId) =>
    CustomAxios.get(`${TPRM_NEW_BASE}/assessments/${assessmentId}/qnas`).then(
      unwrap,
    ),
  updateAssessmentQnaFinalResponse: (assessmentId, questionId, payload) =>
    CustomAxios.patch(
      `${TPRM_NEW_BASE}/assessments/${assessmentId}/qnas/${questionId}/final-response`,
      sanitizeAssessmentQnaPayload(payload),
    ).then(unwrap),

  getThirdPartyAssessmentProgress: (
    thirdPartyId,
    scheduleYear,
    scheduleMonth,
  ) =>
    CustomAxios.get(
      `${TPRM_NEW_BASE}/thirdPartyAssessmentProgress/${thirdPartyId}`,
      withScheduleYear(scheduleYear, scheduleMonth),
    ).then(unwrap),
  getThirdPartyAssessmentResponse: (
    thirdPartyId,
    scheduleYear,
    scheduleMonth,
  ) =>
    CustomAxios.get(
      `${TPRM_NEW_BASE}/thirdPartyAssessmentResponse/${thirdPartyId}`,
      withScheduleYear(scheduleYear, scheduleMonth),
    ).then(unwrap),
  getThirdPartyAssessmentQnas: (
    thirdPartyId,
    scheduleYear,
    category,
    scheduleMonth,
  ) =>
    CustomAxios.get(
      `${TPRM_NEW_BASE}/thirdPartyAssessmentQnAs/${thirdPartyId}`,
      {
        params: {
          scheduleYear: scheduleYear || new Date().getFullYear(),
          ...(scheduleMonth ? { scheduleMonth } : {}),
          category,
        },
      },
    ).then(unwrap),
  getThirdPartyRisk: (thirdPartyId, scheduleYear, scheduleMonth) =>
    CustomAxios.get(
      `${TPRM_NEW_BASE}/thirdPartyRisk/${thirdPartyId}`,
      withScheduleYear(scheduleYear, scheduleMonth),
    ).then(unwrap),
  getThirdPartyReport: (thirdPartyId, scheduleYear, scheduleMonth) =>
    CustomAxios.get(
      `${TPRM_NEW_BASE}/thirdPartyReport/${thirdPartyId}`,
      withScheduleYear(scheduleYear, scheduleMonth),
    ).then(unwrap),

  listQuestionnaireRecords: (createdYear, page = 1, limit = 50) =>
    CustomAxios.get(`${TPRM_NEW_BASE}/questionnaire/list`, {
      params: { page, limit, createdYear },
    }).then(unwrap),
  listQuestionnaireSelectOptions: (createdYear) =>
    CustomAxios.get(`${TPRM_NEW_BASE}/questionnaire/select-list`, {
      params: { createdYear },
    }).then(unwrap),
  getQuestionnaireRecord: (id) =>
    CustomAxios.get(`${TPRM_NEW_BASE}/questionnaire/${id}`).then(unwrap),

  listIncidents: () =>
    CustomAxios.get(`${TPRM_NEW_BASE}/incidents`).then(unwrap),
  createIncident: (payload) =>
    CustomAxios.post(`${TPRM_NEW_BASE}/incidents`, payload).then(unwrap),
  updateIncident: (id, payload) =>
    CustomAxios.patch(`${TPRM_NEW_BASE}/incidents/${id}`, payload).then(unwrap),
  updateIncidentStatus: (id, payload) =>
    CustomAxios.patch(`${TPRM_NEW_BASE}/incidents/${id}/status`, payload).then(
      unwrap,
    ),

  listBlacklisting: (status) =>
    CustomAxios.get(`${TPRM_NEW_BASE}/blacklisting`, {
      params: status ? { status } : undefined,
    }).then(unwrap),
  getBlacklistingByThirdParty: (thirdPartyId) =>
    CustomAxios.get(`${TPRM_NEW_BASE}/blacklisting/${thirdPartyId}`).then(
      unwrap,
    ),
  createBlacklisting: (payload) =>
    CustomAxios.post(`${TPRM_NEW_BASE}/blacklisting`, payload).then(unwrap),
  removeBlacklisting: (thirdPartyId, payload) =>
    CustomAxios.patch(
      `${TPRM_NEW_BASE}/blacklisting/${thirdPartyId}/remove`,
      payload,
    ).then(unwrap),
  updateAssessmentResponseDueDate: (thirdPartyId, scheduleYear, payload) =>
    CustomAxios.patch(
      `${TPRM_NEW_BASE}/thirdPartyAssessmentResponse/${thirdPartyId}`,
      payload,
      { params: { scheduleYear: scheduleYear || new Date().getFullYear() } },
    ).then(unwrap),

  listApprovals: () =>
    CustomAxios.get(`${TPRM_NEW_BASE}/governance-approvals`).then(unwrap),
  createApproval: (payload) =>
    CustomAxios.post(`${TPRM_NEW_BASE}/governance-approvals`, payload).then(
      unwrap,
    ),
  decideApproval: (id, payload) =>
    CustomAxios.patch(
      `${TPRM_NEW_BASE}/governance-approvals/${id}/decision`,
      payload,
    ).then(unwrap),

  listPhysicalAudits: () =>
    CustomAxios.get(`${TPRM_NEW_BASE}/physical-audits`).then(unwrap),
  createPhysicalAudit: (payload) =>
    CustomAxios.post(`${TPRM_NEW_BASE}/physical-audits`, payload).then(unwrap),

  listIncidentPerformanceMatrix: () =>
    CustomAxios.get(`${TPRM_NEW_BASE}/incident-performance-matrix`).then(
      unwrap,
    ),
  createIncidentPerformanceMatrix: (payload) =>
    CustomAxios.post(
      `${TPRM_NEW_BASE}/incident-performance-matrix`,
      payload,
    ).then(unwrap),

  listFindings: () =>
    requestListWithFallback([
      () => CustomAxios.get(`${TPRM_NEW_BASE}/findings`).then(unwrap),
      () =>
        CustomAxios.get(`${TPRM_VENDOR_FINDINGS_BASE}/findings`).then(unwrap),
    ]),
  createFinding: (payload) =>
    CustomAxios.post(`${TPRM_NEW_BASE}/findings`, payload).then(unwrap),
  updateFindingStatus: (id, payload) =>
    CustomAxios.patch(`${TPRM_NEW_BASE}/findings/${id}/status`, payload).then(
      unwrap,
    ),

  getReport: (type) =>
    CustomAxios.get(`${TPRM_NEW_BASE}/reports/${type}`).then(unwrap),
  createBusinessReport: (payload) =>
    CustomAxios.post(`${TPRM_NEW_BASE}/reports/business`, payload).then(unwrap),
};
