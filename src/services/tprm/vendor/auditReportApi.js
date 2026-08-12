// src/services/tprm/vendor/auditReportApi.js
import CustomAxios from "@/globalcomponents/CustomAxios";
import axios from "axios";
import { baseurl, initURL } from "../../../../BaseUrl";
import { toast } from "react-toastify";
import { NEXT_PUBLIC_API_URL } from "@/config/config";

const aiApiHost = (NEXT_PUBLIC_API_URL || "").replace(/\/$/, "");


const NEXT_PUBLIC_API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "https://scanner.grc3.io";
const apiRoot =
  baseurl && initURL
    ? `${baseurl.replace(/\/$/, "")}/${initURL.replace(/^\/+/, "")}`
    : "";

// Align with other TPRM vendor-management endpoints (singular vendor)
const AUDIT_REPORTS_BASE = `${apiRoot}/TPRM/vendor/audit-report`;

/**
 * POST /TPRM/vendor-management/vendor/:vendorId/audit-report/upload
 */
export async function uploadAuditReport(vendorId, payload) {
  const form = new FormData();

  // required
  form.append("file", payload.file);

  // optional metadata
  if (payload.docType) form.append("docType", payload.docType);
  if (payload.reportPeriodStart)
    form.append("reportPeriodStart", payload.reportPeriodStart);
  if (payload.reportPeriodEnd)
    form.append("reportPeriodEnd", payload.reportPeriodEnd);
  if (payload.issuedAt) form.append("issuedAt", payload.issuedAt);
  if (payload.expiresAt) form.append("expiresAt", payload.expiresAt);
  if (payload.notes) form.append("notes", payload.notes);

  const res = await CustomAxios.post(
    `${AUDIT_REPORTS_BASE}/${vendorId}/upload`,
    form,
    { headers: { "Content-Type": "multipart/form-data" } },
  );
  return res.data;
}

/**
 * GET /TPRM/vendor-management/vendor/:vendorId/audit-report
 */
export async function listAuditReports(vendorId) {
  const res = await CustomAxios.get(`${AUDIT_REPORTS_BASE}/${vendorId}`);
  return res.data;
}
const downloadPresignedFile = async ({ presignedUrlEndpoint, filenamein }) => {
  try {
    // const response = presignedUrlEndpoint
    let presignedUrl = presignedUrlEndpoint; // Ensure your backend returns the presigned URL as `url`
    if (!presignedUrl) {
      return toast.error("File dose not exist");
    }

    const responseurl = CustomAxios.get(presignedUrl);

    presignedUrl = (await responseurl).data;
    const response = await fetch(presignedUrl);

    if (!response) {
      return toast.error("Something went wrong");
    }
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    if (presignedUrl) {
      // Trigger file download
      const anchor = document.createElement("a");
      anchor.href = url;
      // Extract the filename from URL or default to "download"
      const urlParams = new URLSearchParams(presignedUrl.split("?")[1]);
      const contentDisposition = response.headers.get("Content-Disposition");
      let filename = urlParams
        .get("response-content-disposition")
        ?.match(/filename=([^;]+)/)?.[1];
      filename =
        filename ||
        contentDisposition?.match(/filename="(.+)"/)?.[1] ||
        "download";

      anchor.download = filenamein ? filenamein : filename; // Change this to your desired file name
      anchor.click();
    } else {
      toast.error("Uploaded report not found.");
    }
  } catch (error) {
    console.log(error);
    toast.error("Error fetching file");
  }
};
/**
 * GET /TPRM/vendor-management/vendor/:vendorId/audit-report/:docId/download
 */
export async function getAuditReportDownloadUrl(vendorId, docId, filenamein) {
  // download file as blob
  const requrl = `${AUDIT_REPORTS_BASE}/${vendorId}/${docId}/download`;

  return downloadPresignedFile({
    presignedUrlEndpoint: requrl,
    filenamein,
  });
}

// Convenience wrapper to fetch list (naming aligned to component usage)
export async function getAuditReports(vendorId) {
  return listAuditReports(vendorId);
}

/**
 * DELETE /TPRM/vendor-management/vendor/:vendorId/audit-report/:docId
 */
export async function deleteAuditReport(vendorId, docId, hardDeleteFile) {
  const res = await CustomAxios.delete(
    `${AUDIT_REPORTS_BASE}/${vendorId}/${docId}`,
    { params: { hardDeleteFile } },
  );
  return res.data;
}

/**
 * GET [domain root]/vendors/:vendorId/evidence/check-new
 */
export async function checkS3NewFiles(vendorId) {
  // Try calling from the absolute root of the domain (ignoring apiv2 prefix if that's the issue)
  const url = `${NEXT_PUBLIC_API_BASE_URL}/ai/tprm_ai/vendors/${vendorId}/evidence/check-new`;
  console.log(`[auditReportApi] GET requesting: ${url}`);
  try {
    const res = await axios.get(url, { withCredentials: false });
    console.log(`[auditReportApi] GET success: ${url}`);
    return res.data;
  } catch (err) {
    console.error(`[auditReportApi] GET failed: ${url}`, err);
    throw err;
  }
}

/**
 * POST http://192.168.1.65:8080/vendors/:vendorId/evidence/sync
 */
export async function syncVendorEvidence(vendorId) {
  const url = `${NEXT_PUBLIC_API_BASE_URL}/ai/tprm_ai/vendors/${vendorId}/evidence/sync`;
  console.log(`[auditReportApi] POST requesting: ${url}`);
  try {
    const res = await axios.post(url, null, { withCredentials: false });
    console.log(`[auditReportApi] POST success: ${url}`);
    return res.data;
  } catch (err) {
    console.error(`[auditReportApi] POST failed: ${url}`, err);
    throw err;
  }
}

/**
 * GET http://192.168.1.65:8080/vendors/:vendorId/evidence/check-deleted
 */
export async function checkS3DeletedFiles(vendorId) {
  const url = `${NEXT_PUBLIC_API_BASE_URL}/ai/tprm_ai/vendors/${vendorId}/evidence/check-deleted`;
  console.log(`[auditReportApi] GET requesting: ${url}`);
  try {
    const res = await axios.get(url, { withCredentials: false });
    console.log(`[auditReportApi] GET success: ${url}`);
    return res.data;
  } catch (err) {
    console.error(`[auditReportApi] GET failed: ${url}`, err);
    throw err;
  }
}
/**
 * POST http://192.168.1.65:8080/vendors/:vendorId/evidence/cleanup
 */
export async function cleanupOrphanedChunks(vendorId) {
  const url = `${NEXT_PUBLIC_API_BASE_URL}/ai/tprm_ai/vendors/${vendorId}/evidence/cleanup`;
  console.log(`[auditReportApi] POST requesting: ${url}`);
  try {
    const res = await axios.post(url, null, { withCredentials: false });
    console.log(`[auditReportApi] POST success: ${url}`);
    return res.data;
  } catch (err) {
    console.error(`[auditReportApi] POST failed: ${url}`, err);
    throw err;
  }
}
