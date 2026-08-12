import CustomAxios from "@/globalcomponents/CustomAxios";
import {baseurl, initURL} from "../../BaseUrl.js"
import { resolveTenantId } from "../utils/tenant";

/*
 * Common API base URL used throughout the project.
 *
 * Example:
 * http://localhost:8007/dev1
 */
const API_BASE = `${baseurl}/${initURL}`;

/**
 * Always use the tenant assigned to the logged-in user.
 * Do not use hardcoded tenants such as hutch-tenant or acme-tenant.
 */
function getCurrentTenantId() {
  const tenantId = resolveTenantId();

  if (!tenantId) {
    throw new Error(
      "Tenant ID could not be resolved for the logged-in user",
    );
  }

  return tenantId;
}

/**
 * Builds the base URL for all breach mass-email APIs.
 */
function getMassEmailBase(breachId) {
  if (!breachId) {
    throw new Error(
      "breachId is required for breach email APIs",
    );
  }

  return `${API_BASE}/breach-management/ben/${breachId}/mass-email`;
}

/**
 * Logs useful Axios request information and rethrows the error.
 */
function handleRequestError(error, operation) {
  console.error(`Breach email ${operation} failed:`, {
    method: error?.config?.method,
    baseURL: error?.config?.baseURL,
    url: error?.config?.url,
    status: error?.response?.status,
    response: error?.response?.data,
    message: error?.message,
  });

  throw error;
}

const breachEmailNotificationService = {
  // ---------------------------------------------------------------------------
  // Campaign
  // ---------------------------------------------------------------------------

  createCampaign: async (breachId) => {
    try {
      const tenantId = getCurrentTenantId();

      return await CustomAxios.post(
        `${getMassEmailBase(breachId)}/campaign`,
        {
          tenantId,
        },
      );
    } catch (error) {
      return handleRequestError(
        error,
        "campaign creation",
      );
    }
  },

  getCampaign: async (breachId) => {
    try {
      const tenantId = getCurrentTenantId();

      return await CustomAxios.get(
        `${getMassEmailBase(breachId)}/campaign`,
        {
          params: {
            tenantId,
          },
        },
      );
    } catch (error) {
      return handleRequestError(
        error,
        "campaign retrieval",
      );
    }
  },

  deleteCampaign: async (breachId) => {
    try {
      const tenantId = getCurrentTenantId();

      return await CustomAxios.delete(
        `${getMassEmailBase(breachId)}/campaign`,
        {
          params: {
            tenantId,
          },
        },
      );
    } catch (error) {
      return handleRequestError(
        error,
        "campaign deletion",
      );
    }
  },

  getCampaignHistory: async (breachId) => {
    try {
      const tenantId = getCurrentTenantId();

      return await CustomAxios.get(
        `${getMassEmailBase(breachId)}/history`,
        {
          params: {
            tenantId,
          },
        },
      );
    } catch (error) {
      return handleRequestError(
        error,
        "campaign history retrieval",
      );
    }
  },

  // ---------------------------------------------------------------------------
  // Recipients
  // ---------------------------------------------------------------------------

  /**
   * Supported usages:
   *
   * uploadCSV(breachId, file)
   * uploadCSV(breachId, ignoredTenantId, file)
   *
   * The tenant is always resolved from the logged-in user.
   */
  uploadCSV: async (
    breachId,
    tenantIdOrFile,
    selectedFile,
  ) => {
    try {
      const isBrowserFileAvailable =
        typeof File !== "undefined";

      const file =
        isBrowserFileAvailable &&
        selectedFile instanceof File
          ? selectedFile
          : isBrowserFileAvailable &&
              tenantIdOrFile instanceof File
            ? tenantIdOrFile
            : null;

      if (!file) {
        throw new Error(
          "Please select a valid CSV file before uploading",
        );
      }

      const tenantId = getCurrentTenantId();
      const formData = new FormData();

      /*
       * This field name must match:
       * FileInterceptor("file")
       */
      formData.append("file", file, file.name);

      return await CustomAxios.post(
        `${getMassEmailBase(
          breachId,
        )}/recipients/upload`,
        formData,
        {
          params: {
            tenantId,
          },

          /*
           * Do not manually set multipart/form-data.
           * The browser will automatically add the boundary.
           */
          headers: {
            "x-tenant-id": tenantId,
          },
        },
      );
    } catch (error) {
      return handleRequestError(
        error,
        "recipient CSV upload",
      );
    }
  },

  /**
   * The ignoredTenantId parameter is retained for compatibility
   * with existing frontend component calls.
   */
  getRecipients: async (
    breachId,
    ignoredTenantId,
    page = 1,
    limit = 50,
    status,
    search,
  ) => {
    try {
      const tenantId = getCurrentTenantId();

      return await CustomAxios.get(
        `${getMassEmailBase(breachId)}/recipients`,
        {
          params: {
            tenantId,
            page,
            limit,
            ...(status ? { status } : {}),
            ...(search ? { search } : {}),
          },
        },
      );
    } catch (error) {
      return handleRequestError(
        error,
        "recipient retrieval",
      );
    }
  },

  // ---------------------------------------------------------------------------
  // Template
  // ---------------------------------------------------------------------------

  updateTemplate: async (breachId, payload) => {
    try {
      const tenantId = getCurrentTenantId();

      return await CustomAxios.patch(
        `${getMassEmailBase(breachId)}/template`,
        {
          emailSubject: payload?.emailSubject,
          emailBodyHtml: payload?.emailBodyHtml,
          emailBodyText: payload?.emailBodyText,
        },
        {
          params: {
            tenantId,
          },
        },
      );
    } catch (error) {
      return handleRequestError(
        error,
        "template update",
      );
    }
  },

  // ---------------------------------------------------------------------------
  // Remedies
  // ---------------------------------------------------------------------------

  /**
   * The ignoredTenantId parameter is retained for compatibility
   * with existing frontend component calls.
   */
  updateRemedies: async (
    breachId,
    ignoredTenantId,
    recommendedRemedies,
  ) => {
    try {
      const tenantId = getCurrentTenantId();

      if (
        !Array.isArray(recommendedRemedies) ||
        recommendedRemedies.length === 0
      ) {
        throw new Error(
          "At least one recommended remedy is required",
        );
      }

      return await CustomAxios.patch(
        `${getMassEmailBase(breachId)}/remedies`,
        {
          recommendedRemedies,
        },
        {
          params: {
            tenantId,
          },
        },
      );
    } catch (error) {
      return handleRequestError(
        error,
        "remedies update",
      );
    }
  },

  // ---------------------------------------------------------------------------
  // Preview
  // ---------------------------------------------------------------------------

  previewEmail: async (
    breachId,
    recipientEmail,
  ) => {
    try {
      const tenantId = getCurrentTenantId();

      return await CustomAxios.get(
        `${getMassEmailBase(breachId)}/preview`,
        {
          params: {
            tenantId,
            recipientEmail,
          },
        },
      );
    } catch (error) {
      return handleRequestError(
        error,
        "email preview",
      );
    }
  },

  // ---------------------------------------------------------------------------
  // Send
  // ---------------------------------------------------------------------------

  sendMassEmail: async (
    breachId,
    confirmationNote,
  ) => {
    try {
      const tenantId = getCurrentTenantId();

      return await CustomAxios.post(
        `${getMassEmailBase(breachId)}/send`,
        {
          confirmationNote: String(
            confirmationNote || "",
          ).trim(),
        },
        {
          params: {
            tenantId,
          },
        },
      );
    } catch (error) {
      return handleRequestError(
        error,
        "mass email sending",
      );
    }
  },

  // ---------------------------------------------------------------------------
  // Delivery status
  // ---------------------------------------------------------------------------

  getDeliveryStatus: async (breachId) => {
    try {
      const tenantId = getCurrentTenantId();

      return await CustomAxios.get(
        `${getMassEmailBase(
          breachId,
        )}/delivery-status`,
        {
          params: {
            tenantId,
          },
        },
      );
    } catch (error) {
      return handleRequestError(
        error,
        "delivery status retrieval",
      );
    }
  },

  // ---------------------------------------------------------------------------
  // Audit logs
  // ---------------------------------------------------------------------------

  getAuditLogs: async (
    breachId,
    page = 1,
    limit = 50,
    action,
  ) => {
    try {
      const tenantId = getCurrentTenantId();

      return await CustomAxios.get(
        `${getMassEmailBase(breachId)}/audit-logs`,
        {
          params: {
            tenantId,
            page,
            limit,
            ...(action ? { action } : {}),
          },
        },
      );
    } catch (error) {
      return handleRequestError(
        error,
        "audit log retrieval",
      );
    }
  },

  // ---------------------------------------------------------------------------
  // Settings
  // ---------------------------------------------------------------------------

  getSettings: async () => {
    try {
      return await CustomAxios.get(
        `${API_BASE}/breach-management/ben/mass-email/settings`,
      );
    } catch (error) {
      return handleRequestError(
        error,
        "settings retrieval",
      );
    }
  },

  updateSettings: async (payload) => {
    try {
      return await CustomAxios.patch(
        `${API_BASE}/breach-management/ben/mass-email/settings`,
        payload,
      );
    } catch (error) {
      return handleRequestError(
        error,
        "settings update",
      );
    }
  },
};

export default breachEmailNotificationService;