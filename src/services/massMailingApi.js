import CustomAxios from "@/config/CustomAxios";
import { baseurl, initURL } from "@/config/config";

const buildUrl = (path) => {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${baseurl}/${initURL}${normalizedPath}`;
};

const unwrap = (payload) => {
  if (payload && typeof payload === "object" && "data" in payload) {
    return payload.data;
  }
  return payload;
};

const normalizeList = (data) => {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.campaigns)) return data.campaigns;
  if (Array.isArray(data?.recipients)) return data.recipients;
  return [];
};

const errorMessage = (error) => {
  const message =
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.message ||
    "Something went wrong";

  return Array.isArray(message) ? message.join(", ") : message;
};

const request = async (method, path, data) => {
  try {
    const response = await CustomAxios({
      method,
      url: buildUrl(path),
      data,
    });

    return unwrap(response?.data);
  } catch (error) {
    throw new Error(errorMessage(error));
  }
};

export const massMailingApi = {
  listCampaigns: async () => {
    const data = await request("get", "/mass-mailing");
    return normalizeList(data);
  },

  previewRecipients: async () => {
    const data = await request("get", "/mass-mailing/recipients/preview");
    return normalizeList(data);
  },

  getCampaign: async (id) => {
    return request("get", `/mass-mailing/${id}`);
  },

  createCampaign: async (payload) => {
    return request("post", "/mass-mailing", payload);
  },

  sendTestEmail: async (payload) => {
    return request("post", "/mass-mailing/test-email", payload);
  },

  deleteCampaign: async (id) => {
    return request("delete", `/mass-mailing/${id}`);
  },
};
