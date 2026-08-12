import CustomAxios from "@/globalcomponents/CustomAxios";
import { baseurl, initURL } from "../../../../BaseUrl";

const CONTRACTS_BASE =
  baseurl && initURL
    ? `${baseurl.replace(/\/$/, "")}/${initURL.replace(
        /^\/+/,
        "",
      )}/third-party-risk-management/contracts`
    : "/third-party-risk-management/contracts";

export const THIRD_PARTY_CONTRACTS_PRESIGN_API_PATH = `${CONTRACTS_BASE}/files`;

export async function getContracts(params = {}) {
  try {
    const res = await CustomAxios.get(CONTRACTS_BASE, { params });
    return res.data;
  } catch (error) {
    console.error("Error fetching third party contracts: ", error?.response?.data || error);
    throw error;
  }
}

export async function getContractById(id) {
  try {
    const res = await CustomAxios.get(`${CONTRACTS_BASE}/${id}`);
    return res.data;
  } catch (error) {
    console.error(
      `Error fetching third party contract with ID ${id}: `,
      error?.response?.data || error,
    );
    throw error;
  }
}

export async function createContract(payload) {
  try {
    const res = await CustomAxios.post(CONTRACTS_BASE, payload);
    return res.data;
  } catch (error) {
    console.error("Error creating third party contract: ", error?.response?.data || error);
    throw error;
  }
}

export async function updateContract(id, payload) {
  try {
    const res = await CustomAxios.patch(`${CONTRACTS_BASE}/${id}`, payload);
    return res.data;
  } catch (error) {
    console.error(
      `Error updating third party contract with ID ${id}: `,
      error?.response?.data || error,
    );
    throw error;
  }
}

export async function deleteContract(id) {
  try {
    await CustomAxios.delete(`${CONTRACTS_BASE}/${id}`);
  } catch (error) {
    console.error(
      `Error deleting third party contract with ID ${id}: `,
      error?.response?.data || error,
    );
    throw error;
  }
}

export async function uploadContractAttachments(id, files) {
  const arr = Array.from(files || []);
  if (arr.length === 0) return [];

  let lastResponse = null;

  for (const file of arr) {
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await CustomAxios.post(
        `${CONTRACTS_BASE}/${id}/attachments`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );

      lastResponse = res.data;
    } catch (error) {
      console.error(
        `Error uploading attachment for third party contract ID ${id}: `,
        error?.response?.data || error,
      );
      throw error;
    }
  }

  if (!lastResponse) return [];

  return Array.isArray(lastResponse)
    ? lastResponse
    : lastResponse.attachmentUrls || [];
}
