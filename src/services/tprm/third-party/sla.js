import CustomAxios from "@/globalcomponents/CustomAxios";
import { baseurl, initURL } from "../../../../BaseUrl";

const trimSlash = (value = "") => String(value).replace(/\/$/, "");
const trimLeadSlash = (value = "") => String(value).replace(/^\/+/, "");

export const SLA_BASE =
  baseurl && initURL
    ? `${trimSlash(baseurl)}/${trimLeadSlash(initURL)}/third-party-risk-management`
    : "/third-party-risk-management";

const unwrap = (response) => {
  const payload = response?.data;
  if (Array.isArray(payload?.docs)) return payload.docs;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.records)) return payload.records;
  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(payload?.results)) return payload.results;
  return payload;
};

const appendIfPresent = (form, key, value) => {
  if (value !== undefined && value !== null && value !== "") {
    form.append(key, value);
  }
};

export const SLA_FIELDS = [
  "slaName",
  "serviceCovered",
  "startDate",
  "endDate",
  "renewalDate",
  "status",
  "uptimeCommitment",
  "responseTime",
  "resolutionTime",
  "penaltyClause",
  "slaOwnerName",
  "slaOwnerEmail",
];

export async function uploadSlaDocument(thirdPartyId, payload) {
  const form = new FormData();
  form.append("file", payload.file);
  SLA_FIELDS.forEach((field) => appendIfPresent(form, field, payload[field]));

  const res = await CustomAxios.post(
    `${SLA_BASE}/third-parties/${encodeURIComponent(thirdPartyId)}/sla/upload`,
    form,
    { headers: { "Content-Type": "multipart/form-data" } },
  );
  return unwrap(res);
}

export async function getPresignedFileUrl(filePath, expiresIn = 300) {
  const res = await CustomAxios.get(
    `${trimSlash(baseurl)}/${trimLeadSlash(initURL)}/TPRM/vendor-management/file/presigned-url`,
    {
      params: {
        filePath,
        expiresIn,
      },
    },
  );
  return res?.data;
}

export async function getThirdPartySlas(thirdPartyId) {
  const res = await CustomAxios.get(
    `${SLA_BASE}/third-parties/${encodeURIComponent(thirdPartyId)}/sla`,
  );
  return unwrap(res);
}

export async function getSlaDetails(slaId) {
  const res = await CustomAxios.get(`${SLA_BASE}/sla/${encodeURIComponent(slaId)}`);
  return unwrap(res);
}

export async function updateSlaDetails(slaId, payload) {
  const cleanPayload = SLA_FIELDS.reduce((acc, field) => {
    if (payload[field] !== undefined) acc[field] = payload[field];
    return acc;
  }, {});
  const res = await CustomAxios.patch(
    `${SLA_BASE}/sla/${encodeURIComponent(slaId)}`,
    cleanPayload,
  );
  return unwrap(res);
}

export async function downloadSlaDocument(slaId, filename) {
  const res = await CustomAxios.get(
    `${SLA_BASE}/sla/${encodeURIComponent(slaId)}/download`,
    { responseType: "blob" },
  );

  const blob = new Blob([res.data], {
    type: res.headers?.["content-type"] || "application/octet-stream",
  });
  const url = window.URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename || "sla-document";
  anchor.click();
  window.URL.revokeObjectURL(url);
}

export async function deleteSla(slaId, hardDeleteFile = false) {
  const res = await CustomAxios.delete(`${SLA_BASE}/sla/${encodeURIComponent(slaId)}`, {
    params: hardDeleteFile ? { hardDeleteFile: true } : undefined,
  });
  return unwrap(res);
}

export async function reportSlaIssue(slaId, payload) {
  const res = await CustomAxios.post(
    `${SLA_BASE}/sla/${encodeURIComponent(slaId)}/issues`,
    payload,
  );
  return unwrap(res);
}

export async function getThirdPartySlaIssues(thirdPartyId) {
  const res = await CustomAxios.get(
    `${SLA_BASE}/third-parties/${encodeURIComponent(thirdPartyId)}/sla/issues`,
  );
  return unwrap(res);
}

export async function getSlaIssues(slaId) {
  const res = await CustomAxios.get(
    `${SLA_BASE}/sla/${encodeURIComponent(slaId)}/issues`,
  );
  return unwrap(res);
}

export async function updateSlaIssueStatus(issueId, payload) {
  const res = await CustomAxios.patch(
    `${SLA_BASE}/sla/issues/${encodeURIComponent(issueId)}/status`,
    payload,
  );
  return unwrap(res);
}
