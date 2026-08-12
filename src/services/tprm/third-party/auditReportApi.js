import { toast } from "react-toastify";
import { baseurl, initURL } from "../../../../BaseUrl";
import CustomAxios from "@/globalcomponents/CustomAxios";
import {
  checkThirdPartyEvidenceDeleted,
  checkThirdPartyEvidenceNew,
  cleanupThirdPartyEvidence,
  deleteThirdPartyEvidenceFile,
  getThirdPartyEvidenceSample,
  getThirdPartyEvidenceStatus,
  ingestThirdPartyEvidence,
  listThirdPartyEvidenceFiles,
  retrieveThirdPartyEvidence,
  syncThirdPartyEvidenceIndex,
} from "./aiApi";

const apiRoot =
  baseurl && initURL
    ? `${baseurl.replace(/\/$/, "")}/${initURL.replace(/^\/+/, "")}`
    : "";

const AUDIT_REPORTS_BASE = `${apiRoot}/thirdparty/vendor/audit-report`;

const downloadPresignedFile = async ({ presignedUrlEndpoint, filenamein }) => {
  try {
    let presignedUrl = presignedUrlEndpoint;
    if (!presignedUrl) {
      toast.error("File does not exist");
      return;
    }

    const responseurl = await CustomAxios.get(presignedUrl);
    presignedUrl = responseurl.data;

    const response = await fetch(presignedUrl);
    if (!response) {
      toast.error("Something went wrong");
      return;
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;

    const urlParams = new URLSearchParams(presignedUrl.split("?")[1]);
    const contentDisposition = response.headers.get("Content-Disposition");
    const filenameFromUrl = urlParams
      .get("response-content-disposition")
      ?.match(/filename=([^;]+)/)?.[1];
    const filenameFromHeader =
      contentDisposition?.match(/filename="(.+)"/)?.[1];

    anchor.download = filenamein || filenameFromUrl || filenameFromHeader || "download";
    anchor.click();
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error(error);
    toast.error("Error fetching file");
  }
};

export async function uploadAuditReport(thirdPartyId, payload) {
  const form = new FormData();
  form.append("file", payload.file);

  if (payload.docType) form.append("docType", payload.docType);
  if (payload.reportPeriodStart) {
    form.append("reportPeriodStart", payload.reportPeriodStart);
  }
  if (payload.reportPeriodEnd) {
    form.append("reportPeriodEnd", payload.reportPeriodEnd);
  }
  if (payload.issuedAt) form.append("issuedAt", payload.issuedAt);
  if (payload.expiresAt) form.append("expiresAt", payload.expiresAt);
  if (payload.notes) form.append("notes", payload.notes);

  const res = await CustomAxios.post(
    `${AUDIT_REPORTS_BASE}/${thirdPartyId}/upload`,
    form,
    { headers: { "Content-Type": "multipart/form-data" } },
  );
  return res.data;
}

export async function listAuditReports(thirdPartyId) {
  const res = await CustomAxios.get(`${AUDIT_REPORTS_BASE}/${thirdPartyId}`);
  return res.data;
}

export async function getAuditReports(thirdPartyId) {
  return listAuditReports(thirdPartyId);
}

export async function getAuditReportDownloadUrl(
  thirdPartyId,
  docId,
  filenamein,
) {
  return downloadPresignedFile({
    presignedUrlEndpoint: `${AUDIT_REPORTS_BASE}/${thirdPartyId}/${docId}/download`,
    filenamein,
  });
}

export async function deleteAuditReport(thirdPartyId, docId, hardDeleteFile) {
  const res = await CustomAxios.delete(
    `${AUDIT_REPORTS_BASE}/${thirdPartyId}/${docId}`,
    { params: { hardDeleteFile } },
  );
  return res.data;
}

export async function checkS3NewFiles(thirdPartyId) {
  return checkThirdPartyEvidenceNew(thirdPartyId);
}

export async function syncThirdPartyEvidence(thirdPartyId) {
  return syncThirdPartyEvidenceIndex(thirdPartyId);
}

export async function checkS3DeletedFiles(thirdPartyId) {
  return checkThirdPartyEvidenceDeleted(thirdPartyId);
}

export async function cleanupOrphanedChunks(thirdPartyId) {
  return cleanupThirdPartyEvidence(thirdPartyId);
}

export async function ingestAuditEvidence(thirdPartyId, payload) {
  return ingestThirdPartyEvidence(thirdPartyId, payload);
}

export async function retrieveAuditEvidence(thirdPartyId, payload) {
  return retrieveThirdPartyEvidence(thirdPartyId, payload);
}

export async function getAuditEvidenceStatus(thirdPartyId) {
  return getThirdPartyEvidenceStatus(thirdPartyId);
}

export async function getAuditEvidenceSample(thirdPartyId) {
  return getThirdPartyEvidenceSample(thirdPartyId);
}

export async function listAuditEvidenceFiles(thirdPartyId) {
  return listThirdPartyEvidenceFiles(thirdPartyId);
}

export async function deleteAuditEvidenceFile(thirdPartyId, fileKey) {
  return deleteThirdPartyEvidenceFile(thirdPartyId, fileKey);
}

export const syncVendorEvidence = syncThirdPartyEvidence;
