// src/services/tprm/client/clientAuditReportApi.js
import CustomAxios from "@/globalcomponents/CustomAxios";
import { baseurl, initURL } from "../../../../BaseUrl";
import { toast } from "react-toastify";

const apiRoot =
  baseurl && initURL
    ? `${baseurl.replace(/\/$/, "")}/${initURL.replace(/^\/+/, "")}`
    : "";

// ✅ Client base endpoint
const CLIENT_AUDIT_REPORTS_BASE = `${apiRoot}/TPRM/client/audit-report`;

/**
 * POST /TPRM/client/audit-report/:clientId/upload
 */
export async function uploadClientAuditReport(clientId, payload) {
  const form = new FormData();
  form.append("file", payload.file);

  if (payload.docType) form.append("docType", payload.docType);
  if (payload.reportPeriodStart)
    form.append("reportPeriodStart", payload.reportPeriodStart);
  if (payload.reportPeriodEnd)
    form.append("reportPeriodEnd", payload.reportPeriodEnd);
  if (payload.issuedAt) form.append("issuedAt", payload.issuedAt);
  if (payload.expiresAt) form.append("expiresAt", payload.expiresAt);
  if (payload.notes) form.append("notes", payload.notes);

  const res = await CustomAxios.post(
    `${CLIENT_AUDIT_REPORTS_BASE}/${clientId}/upload`,
    form,
    { headers: { "Content-Type": "multipart/form-data" } }
  );
  return res.data;
}


/**
 * GET /TPRM/client/audit-report/:clientId
 */
export async function listClientAuditReports(clientId) {
  const res = await CustomAxios.get(`${CLIENT_AUDIT_REPORTS_BASE}/${clientId}`);
  return res.data;
}

export async function getClientAuditReports(clientId) {
  return listClientAuditReports(clientId);
}

const downloadPresignedFile = async ({ presignedUrlEndpoint, filenamein }) => {
  try {
    let presignedUrl = presignedUrlEndpoint;
    if (!presignedUrl) return toast.error("File does not exist");

    const responseurl = CustomAxios.get(presignedUrl);
    presignedUrl = (await responseurl).data;

    const response = await fetch(presignedUrl);
    if (!response) return toast.error("Something went wrong");

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);

    const anchor = document.createElement("a");
    anchor.href = url;

    const urlParams = new URLSearchParams(presignedUrl.split("?")[1]);
    const contentDisposition = response.headers.get("Content-Disposition");

    let filename = urlParams
      .get("response-content-disposition")
      ?.match(/filename=([^;]+)/)?.[1];

    filename =
      filename ||
      contentDisposition?.match(/filename="(.+)"/)?.[1] ||
      "download";

    anchor.download = filenamein ? filenamein : filename;
    anchor.click();
  } catch (error) {
    console.log(error);
    toast.error("Error fetching file");
  }
};

/**
 * GET /TPRM/client/audit-report/:clientId/:docId/download
 */
export async function getClientAuditReportDownloadUrl(clientId, docId, filenamein) {
  const requrl = `${CLIENT_AUDIT_REPORTS_BASE}/${clientId}/${docId}/download`;
  return downloadPresignedFile({
    presignedUrlEndpoint: requrl,
    filenamein,
  });
}

/**
 * DELETE /TPRM/client/audit-report/:clientId/:docId?hardDeleteFile=true
 */
export async function deleteClientAuditReport(clientId, docId, hardDeleteFile) {
  const url = `${CLIENT_AUDIT_REPORTS_BASE}/${clientId}/${docId}`;

  const res = await CustomAxios.delete(url, {
    params: hardDeleteFile ? { hardDeleteFile: "true" } : undefined,
  });

  return res.data;
}
/**
 * ✅ Background evidence processing (CLIENT)
 * If your client AI URLs differ, replace /clients/ accordingly.
 */
export async function checkS3NewClientFiles(clientId) {
  const url = `https://dev.grc3.io/ai/tprm_ai/clients/${clientId}/evidence/check-new`;
  const res = await CustomAxios.get(url);
  return res.data;
}

export async function syncClientEvidence(clientId) {
  const url = `https://dev.grc3.io/ai/tprm_ai/clients/${clientId}/evidence/sync`;
  const res = await CustomAxios.post(url);
  return res.data;
}

export async function checkS3DeletedClientFiles(clientId) {
  const url = `https://dev.grc3.io/ai/tprm_ai/clients/${clientId}/evidence/check-deleted`;
  const res = await CustomAxios.get(url);
  return res.data;
}

export async function cleanupOrphanedClientChunks(clientId) {
  const url = `https://dev.grc3.io/ai/tprm_ai/clients/${clientId}/evidence/cleanup`;
  const res = await CustomAxios.post(url);
  return res.data;
}

// src/services/tprm/vendor/clientAuditReportApi.js

//THIS CODE IS FOR LOCALL IP TESTING PURPOSES ONLY - REPLACE URLS WITH YOUR IP AND PORT



// import CustomAxios from "@/globalcomponents/CustomAxios";
// import { baseurl, initURL } from "../../../../BaseUrl";
// import { toast } from "react-toastify";

// const apiRoot =
//   baseurl && initURL
//     ? `${baseurl.replace(/\/$/, "")}/${initURL.replace(/^\/+/, "")}`
//     : "";

// // ✅ Client base endpoint (main backend)
// const CLIENT_AUDIT_REPORTS_BASE = `${apiRoot}/TPRM/client/audit-report`;

// // ✅ Evidence backend (your IP)
// const CLIENT_EVIDENCE_BASE = `http://192.168.1.21:8082/clients`;

// export async function uploadClientAuditReport(clientId, payload) {
//   const form = new FormData();
//   form.append("file", payload.file);

//   if (payload.docType) form.append("docType", payload.docType);
//   if (payload.reportPeriodStart) form.append("reportPeriodStart", payload.reportPeriodStart);
//   if (payload.reportPeriodEnd) form.append("reportPeriodEnd", payload.reportPeriodEnd);
//   if (payload.issuedAt) form.append("issuedAt", payload.issuedAt);
//   if (payload.expiresAt) form.append("expiresAt", payload.expiresAt);
//   if (payload.notes) form.append("notes", payload.notes);

//   const res = await CustomAxios.post(
//     `${CLIENT_AUDIT_REPORTS_BASE}/${clientId}/upload`,
//     form,
//     { headers: { "Content-Type": "multipart/form-data" } }
//   );
//   return res.data;
// }

// export async function getClientAuditReports(clientId) {
//   const res = await CustomAxios.get(`${CLIENT_AUDIT_REPORTS_BASE}/${clientId}`);
//   return res.data;
// }

// const downloadPresignedFile = async ({ presignedUrlEndpoint, filenamein }) => {
//   try {
//     let presignedUrl = presignedUrlEndpoint;
//     if (!presignedUrl) return toast.error("File does not exist");

//     const responseurl = CustomAxios.get(presignedUrl);
//     presignedUrl = (await responseurl).data;

//     const response = await fetch(presignedUrl);
//     if (!response) return toast.error("Something went wrong");

//     const blob = await response.blob();
//     const url = window.URL.createObjectURL(blob);

//     const anchor = document.createElement("a");
//     anchor.href = url;

//     const urlParams = new URLSearchParams(presignedUrl.split("?")[1]);
//     const contentDisposition = response.headers.get("Content-Disposition");

//     let filename = urlParams
//       .get("response-content-disposition")
//       ?.match(/filename=([^;]+)/)?.[1];

//     filename =
//       filename ||
//       contentDisposition?.match(/filename="(.+)"/)?.[1] ||
//       "download";

//     anchor.download = filenamein ? filenamein : filename;
//     anchor.click();
//   } catch (error) {
//     console.log(error);
//     toast.error("Error fetching file");
//   }
// };

// export async function getClientAuditReportDownloadUrl(clientId, docId, filenamein) {
//   const requrl = `${CLIENT_AUDIT_REPORTS_BASE}/${clientId}/${docId}/download`;
//   return downloadPresignedFile({ presignedUrlEndpoint: requrl, filenamein });
// }

// export async function deleteClientAuditReport(clientId, docId, hardDeleteFile) {
//   const res = await CustomAxios.delete(
//     `${CLIENT_AUDIT_REPORTS_BASE}/${clientId}/${docId}`,
//     { params: { hardDeleteFile } }
//   );
//   return res.data;
// }

// // ✅ Background evidence processing (CLIENT) — NOW USING YOUR IP
// export async function checkS3NewClientFiles(clientId) {
//   const url = `${CLIENT_EVIDENCE_BASE}/${clientId}/evidence/check-new`;
//   console.log("[ClientEvidence] GET", url);
//   const res = await CustomAxios.get(url);
//   return res.data;
// }

// export async function syncClientEvidence(clientId) {
//   const url = `${CLIENT_EVIDENCE_BASE}/${clientId}/evidence/sync`;
//   console.log("[ClientEvidence] POST", url);
//   const res = await CustomAxios.post(url);
//   return res.data;
// }

// export async function checkS3DeletedClientFiles(clientId) {
//   const url = `${CLIENT_EVIDENCE_BASE}/${clientId}/evidence/check-deleted`;
//   console.log("[ClientEvidence] GET", url);
//   const res = await CustomAxios.get(url);
//   return res.data;
// }

// export async function cleanupOrphanedClientChunks(clientId) {
//   const url = `${CLIENT_EVIDENCE_BASE}/${clientId}/evidence/cleanup`;
//   console.log("[ClientEvidence] POST", url);
//   const res = await CustomAxios.post(url);
//   return res.data;
// }

// src/services/tprm/client/clientAuditReportApi.js

// import CustomAxios from "@/globalcomponents/CustomAxios";
// import { baseurl, initURL } from "../../../../BaseUrl";
// import { toast } from "react-toastify";

// const apiRoot =
//   baseurl && initURL
//     ? `${baseurl.replace(/\/$/, "")}/${initURL.replace(/^\/+/, "")}`
//     : "";

// // ✅ Main backend base endpoint
// const CLIENT_AUDIT_REPORTS_BASE = `${apiRoot}/TPRM/client/audit-report`;

// // ✅ Evidence backend (YOUR IP)
// const CLIENT_EVIDENCE_BASE = `http://192.168.1.21:8082/clients`;

// /**
//  * POST /TPRM/client/audit-report/:clientId/upload
//  */
// export async function uploadClientAuditReport(clientId, payload) {
//   const form = new FormData();
//   form.append("file", payload.file);

//   if (payload.docType) form.append("docType", payload.docType);
//   if (payload.reportPeriodStart)
//     form.append("reportPeriodStart", payload.reportPeriodStart);
//   if (payload.reportPeriodEnd)
//     form.append("reportPeriodEnd", payload.reportPeriodEnd);
//   if (payload.issuedAt) form.append("issuedAt", payload.issuedAt);
//   if (payload.expiresAt) form.append("expiresAt", payload.expiresAt);
//   if (payload.notes) form.append("notes", payload.notes);

//   const res = await CustomAxios.post(
//     `${CLIENT_AUDIT_REPORTS_BASE}/${clientId}/upload`,
//     form,
//     { headers: { "Content-Type": "multipart/form-data" } }
//   );
//   return res.data;
// }

// /**
//  * GET /TPRM/client/audit-report/:clientId
//  */
// export async function getClientAuditReports(clientId) {
//   const res = await CustomAxios.get(`${CLIENT_AUDIT_REPORTS_BASE}/${clientId}`);
//   return res.data;
// }

// /**
//  * Download helper (presigned)
//  */
// const downloadPresignedFile = async ({ presignedUrlEndpoint, filenamein }) => {
//   try {
//     if (!presignedUrlEndpoint) return toast.error("File does not exist");

//     const presignedUrlRes = await CustomAxios.get(presignedUrlEndpoint);
//     const presignedUrl = presignedUrlRes.data;

//     const response = await fetch(presignedUrl);
//     if (!response) return toast.error("Something went wrong");

//     const blob = await response.blob();
//     const url = window.URL.createObjectURL(blob);

//     const anchor = document.createElement("a");
//     anchor.href = url;

//     const urlParams = new URLSearchParams(presignedUrl.split("?")[1]);
//     const contentDisposition = response.headers.get("Content-Disposition");

//     let filename = urlParams
//       .get("response-content-disposition")
//       ?.match(/filename=([^;]+)/)?.[1];

//     filename =
//       filename ||
//       contentDisposition?.match(/filename="(.+)"/)?.[1] ||
//       "download";

//     anchor.download = filenamein ? filenamein : filename;
//     anchor.click();
//   } catch (error) {
//     console.log(error);
//     toast.error("Error fetching file");
//   }
// };

// /**
//  * GET /TPRM/client/audit-report/:clientId/:docId/download
//  */
// export async function getClientAuditReportDownloadUrl(clientId, docId, filenamein) {
//   const requrl = `${CLIENT_AUDIT_REPORTS_BASE}/${clientId}/${docId}/download`;
//   return downloadPresignedFile({ presignedUrlEndpoint: requrl, filenamein });
// }

// /**
//  * DELETE /TPRM/client/audit-report/:clientId/:docId?hardDeleteFile=true
//  */
// export async function deleteClientAuditReport(clientId, docId, hardDeleteFile) {
//   const res = await CustomAxios.delete(
//     `${CLIENT_AUDIT_REPORTS_BASE}/${clientId}/${docId}`,
//     { params: { hardDeleteFile } }
//   );
//   return res.data;
// }

// /**
//  * ✅ Background evidence processing (CLIENT) — USING YOUR IP SERVER
//  * Base: http://192.168.1.21:8082
//  */

// // GET /clients/:clientId/evidence/check-new
// export async function checkS3NewClientFiles(clientId) {
//   const url = `${CLIENT_EVIDENCE_BASE}/${clientId}/evidence/check-new`;
//   console.log("[ClientEvidence] GET", url);
//   const res = await CustomAxios.get(url);
//   return res.data;
// }

// // POST /clients/:clientId/evidence/sync
// export async function syncClientEvidence(clientId) {
//   const url = `${CLIENT_EVIDENCE_BASE}/${clientId}/evidence/sync`;
//   console.log("[ClientEvidence] POST", url);
//   const res = await CustomAxios.post(url);
//   return res.data;
// }

// // GET /clients/:clientId/evidence/check-deleted
// export async function checkS3DeletedClientFiles(clientId) {
//   const url = `${CLIENT_EVIDENCE_BASE}/${clientId}/evidence/check-deleted`;
//   console.log("[ClientEvidence] GET", url);
//   const res = await CustomAxios.get(url);
//   return res.data;
// }

// // POST /clients/:clientId/evidence/cleanup
// export async function cleanupOrphanedClientChunks(clientId) {
//   const url = `${CLIENT_EVIDENCE_BASE}/${clientId}/evidence/cleanup`;
//   console.log("[ClientEvidence] POST", url);
//   const res = await CustomAxios.post(url);
//   return res.data;
// }
