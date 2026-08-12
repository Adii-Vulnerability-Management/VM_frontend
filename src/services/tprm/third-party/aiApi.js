import CustomAxios from "@/globalcomponents/CustomAxios";

const NEXT_PUBLIC_API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "https://scanner.grc3.io";

// const THIRD_PARTIES_AI_BASE = "http://192.168.1.61:8082/third-parties";
// const THIRD_PARTY_AI_BASE = "http://192.168.1.61:8082/third-party";

const THIRD_PARTIES_AI_BASE = `${NEXT_PUBLIC_API_BASE_URL}/ai/tprm_ai/third-parties`;
const THIRD_PARTY_AI_BASE = `${NEXT_PUBLIC_API_BASE_URL}/ai/tprm_ai/third-party`;

const encodePart = (value) => encodeURIComponent(String(value));

const requireThirdPartyId = (thirdPartyId) => {
  const value = String(thirdPartyId || "").trim();
  if (!value) throw new Error("Third party ID missing.");
  return value;
};

const normalizeOptions = (options = {}) => ({
  headers: { "Content-Type": "application/json", ...(options.headers || {}) },
  timeout: options.timeout || 40000,
  ...options,
});

const getPluralThirdPartyPath = (thirdPartyId, suffix = "") =>
  `${THIRD_PARTIES_AI_BASE}/${encodePart(requireThirdPartyId(thirdPartyId))}${suffix}`;

const getSingularThirdPartyPath = (thirdPartyId, suffix = "") =>
  `${THIRD_PARTY_AI_BASE}/${encodePart(requireThirdPartyId(thirdPartyId))}${suffix}`;

const postJson = async (url, payload = {}, options) => {
  const res = await CustomAxios.post(url, payload, normalizeOptions(options));
  return res.data;
};

export async function getThirdPartyDualView(thirdPartyId) {
  const pluralUrl = getPluralThirdPartyPath(thirdPartyId, "/dual-view");
  try {
    const res = await CustomAxios.get(pluralUrl);
    return res.data;
  } catch (error) {
    if (![404, 405].includes(error?.response?.status)) throw error;
    const singularUrl = getSingularThirdPartyPath(thirdPartyId, "/dual-view");
    const res = await CustomAxios.get(singularUrl);
    return res.data;
  }
}

export function generateThirdPartyAnswers(payload, options) {
  return postJson(`${THIRD_PARTIES_AI_BASE}/generate/answers`, payload, options);
}

export async function revisePreviousAnswer(payload, options) {
  try {
    return await postJson(
      `${THIRD_PARTIES_AI_BASE}/generate/revise-previous`,
      payload,
      options,
    );
  } catch (error) {
    if (![404, 405].includes(error?.response?.status)) throw error;
    return postJson(
      `${THIRD_PARTIES_AI_BASE}/revise-previous`,
      payload,
      options,
    );
  }
}

export function revisePreviousAnswerDirect(payload, options) {
  return postJson(`${THIRD_PARTIES_AI_BASE}/revise-previous`, payload, options);
}

export function ingestThirdPartyEvidence(thirdPartyId, payload = {}, options) {
  return postJson(
    getPluralThirdPartyPath(thirdPartyId, "/evidence/ingest"),
    payload,
    options,
  );
}

export function retrieveThirdPartyEvidence(thirdPartyId, payload = {}, options) {
  return postJson(
    getPluralThirdPartyPath(thirdPartyId, "/evidence/retrieve"),
    payload,
    options,
  );
}

export async function getThirdPartyEvidenceStatus(thirdPartyId) {
  const res = await CustomAxios.get(
    getPluralThirdPartyPath(thirdPartyId, "/evidence/status"),
  );
  return res.data;
}

export async function getThirdPartyEvidenceSample(thirdPartyId) {
  const res = await CustomAxios.get(
    getPluralThirdPartyPath(thirdPartyId, "/evidence/sample"),
  );
  return res.data;
}

export async function checkThirdPartyEvidenceNew(thirdPartyId) {
  const res = await CustomAxios.get(
    getPluralThirdPartyPath(thirdPartyId, "/evidence/check-new"),
  );
  return res.data;
}

export function syncThirdPartyEvidenceIndex(thirdPartyId, payload = {}, options) {
  return postJson(
    getPluralThirdPartyPath(thirdPartyId, "/evidence/sync"),
    payload,
    options,
  );
}

export async function checkThirdPartyEvidenceDeleted(thirdPartyId) {
  const res = await CustomAxios.get(
    getPluralThirdPartyPath(thirdPartyId, "/evidence/check-deleted"),
  );
  return res.data;
}

export function cleanupThirdPartyEvidence(thirdPartyId, payload = {}, options) {
  return postJson(
    getPluralThirdPartyPath(thirdPartyId, "/evidence/cleanup"),
    payload,
    options,
  );
}

export async function listThirdPartyEvidenceFiles(thirdPartyId) {
  const res = await CustomAxios.get(
    getPluralThirdPartyPath(thirdPartyId, "/evidence/files-list"),
  );
  return res.data;
}

export async function deleteThirdPartyEvidenceFile(thirdPartyId, fileKey) {
  const res = await CustomAxios.delete(
    getPluralThirdPartyPath(
      thirdPartyId,
      `/evidence/files/${encodePart(fileKey)}`,
    ),
  );
  return res.data;
}

export function evaluateThirdPartyAnswer(
  thirdPartyId,
  questionId,
  payload = {},
  options,
) {
  return postJson(
    getPluralThirdPartyPath(
      thirdPartyId,
      `/answers/${encodePart(questionId)}/evaluate`,
    ),
    payload,
    options,
  );
}

export function evaluateThirdPartyAnswerFull(
  thirdPartyId,
  questionId,
  payload = {},
  options,
) {
  return postJson(
    getPluralThirdPartyPath(
      thirdPartyId,
      `/answers/${encodePart(questionId)}/evaluate-full`,
    ),
    payload,
    options,
  );
}

export function generateThirdPartyReportQuestions(
  thirdPartyId,
  payload = {},
  options,
) {
  return postJson(
    getPluralThirdPartyPath(thirdPartyId, "/reports/generate-questions"),
    payload,
    options,
  );
}

export function generateThirdPartyReportQuestionsCsv(
  thirdPartyId,
  payload = {},
  options,
) {
  return postJson(
    getPluralThirdPartyPath(thirdPartyId, "/reports/generate-questions/csv"),
    payload,
    options,
  );
}

export function compareThirdPartyMandate(thirdPartyId, payload = {}, options) {
  return postJson(
    getPluralThirdPartyPath(thirdPartyId, "/compare-mandate"),
    payload,
    options,
  );
}

export function compareThirdPartySoc2(thirdPartyId, payload = {}, options) {
  return postJson(
    getPluralThirdPartyPath(thirdPartyId, "/compare-soc2"),
    payload,
    options,
  );
}
