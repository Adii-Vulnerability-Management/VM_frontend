// src/services/tprm/vendor/contracts.js
import CustomAxios from "@/globalcomponents/CustomAxios";
import { baseurl, initURL } from "../../../../BaseUrl";

const CONTRACTS_BASE =
  baseurl && initURL
    ? `${baseurl.replace(/\/$/, "")}/${initURL.replace(
        /^\/+/,
        ""
      )}/TPRM/vendor/contracts`
    : "/contracts";

/**
 * Contract DTO shapes (just for reference in comments)
 *
 * CreateContractDto:
 * {
 *   name: string;
 *   contractType: 'MSA' | 'DPA' | 'NDA' | 'SLA' | 'ORDER_FORM' | 'OTHER';
 *   vendorId: string;        // Mongo ObjectId string
 *   engagementId: string;    // Mongo ObjectId string
 *   status?: 'DRAFT' | 'ACTIVE' | 'EXPIRED' | 'TERMINATED';
 *   agreementSummary?: string;
 *   expiryDate?: string;     // ISO date string "2025-12-31"
 *   contractUrl?: string;
 *   attachmentUrls?: string[];
 * }
 *
 * UpdateContractDto: same fields as CreateContractDto but all optional.
 */

/** GET /TPRM/vendor/contracts */
export async function getContracts() {
  try {
    const res = await CustomAxios.get(CONTRACTS_BASE);
    return res.data; // → array of contracts
  } catch (error) {
    console.error("Error fetching contracts: ", error?.response?.data || error);
    throw error;
  }
}

/** GET /TPRM/vendor/contracts/:id */
export async function getContractById(id) {
  try {
    const res = await CustomAxios.get(`${CONTRACTS_BASE}/${id}`);
    return res.data; // → single contract object
  } catch (error) {
    console.error(
      `Error fetching contract with ID ${id}: `,
      error?.response?.data || error
    );
    throw error;
  }
}

/** POST /TPRM/vendor/contracts */
export async function createContract(payload) {
  try {
    const res = await CustomAxios.post(CONTRACTS_BASE, payload);
    return res.data; // → created contract
  } catch (error) {
    console.error("Error creating contract: ", error?.response?.data || error);
    throw error;
  }
}

/** PATCH /TPRM/vendor/contracts/:id */
export async function updateContract(id, payload) {
  try {
    const res = await CustomAxios.patch(`${CONTRACTS_BASE}/${id}`, payload);
    return res.data; // → updated contract
  } catch (error) {
    console.error(
      `Error updating contract with ID ${id}: `,
      error?.response?.data || error
    );
    throw error;
  }
}

/** DELETE /TPRM/vendor/contracts/:id */
export async function deleteContract(id) {
  try {
    await CustomAxios.delete(`${CONTRACTS_BASE}/${id}`);
  } catch (error) {
    console.error(
      `Error deleting contract with ID ${id}: `,
      error?.response?.data || error
    );
    throw error;
  }
}

/**
 * POST /TPRM/vendor/contracts/:id/attachments
 *
 * Backend:
 *   @Post(':id/attachments')
 *   @UseInterceptors(FileInterceptor('file', ...))
 *   uploadAttachment(@UploadedFile() file)
 *
 * So:
 *   - field name must be "file"
 *   - only one file per request
 *   - we support multiple files by sending multiple requests in a loop
 *
 * Returns:
 *   array of attachment URLs (latest full list from backend)
 */
export async function uploadContractAttachments(id, files) {
  const arr = Array.from(files || []);
  if (arr.length === 0) return [];

  let lastResponse = null;

  // send each file in a separate request
  for (const file of arr) {
    const formData = new FormData();
    formData.append("file", file); // MUST match FileInterceptor('file', ...)

    try {
      const res = await CustomAxios.post(
        `${CONTRACTS_BASE}/${id}/attachments`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      // backend returns updated contract (or something similar)
      lastResponse = res.data;
    } catch (error) {
      console.error(
        `Error uploading attachment for contract ID ${id}: `,
        error?.response?.data || error
      );
      throw error;
    }
  }

  // normalize to just an array of URLs for the UI
  if (!lastResponse) return [];

  const urls = Array.isArray(lastResponse)
    ? lastResponse
    : lastResponse.attachmentUrls || [];

  return urls;

  
}
