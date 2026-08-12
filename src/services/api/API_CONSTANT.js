// Centralized API endpoint constants for mandate management + controls flows

import { initURL } from "BaseUrl";

export const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "";

export const API = {
  // Mandate APIs
  MANDATE_LIST: `/${initURL}/mandate-management`,
  MANDATE_FORM: `/${initURL}/mandate-management`,
  MANDATE_DETAIL: (id) => `/${initURL}/mandate-management/${id}`,
  MANDATE_UPDATE: (id) => `/${initURL}/mandate-management/${id}`,
  MANDATE_UPLOAD: `/${initURL}/mandate-management/upload`,
  MANDATE_EXTRACT: `https://dev.grc3.io/mandate-ai/api/metadata/extract`,
  EXTRACT_FORM: `https://dev.grc3.io/mandate-ai/api/metadata/extract`,
  EXTRACT: `https://dev.grc3.io/mandate-ai/api/metadata/extract`,
  MANDATE_DOCUMENT_URL: (id) => `/${initURL}/mandate-management/${id}/document-url`,
  MANDATE_ASSIGN: (id) => `/${initURL}/mandate-management/${id}/assign`,
  MANDATE_NOTIFY_SMA: (id) => `/${initURL}/mandate-management/${id}/notify/sma`,
  MANDATE_NOTIFY_LEGAL: (id) => `/${initURL}/mandate-management/${id}/notify/legal`,
  MY_SMA_MANDATES: `/${initURL}/mandate-management/my-sma-mandates`,
  MY_LEGAL_MANDATES: `/${initURL}/mandate-management/my-legal-mandates`,
  SMA_DECISION: (id) => `/${initURL}/mandate-management/${id}/sma-decision`,
  LEGAL_DECISION: (id) => `/${initURL}/mandate-management/${id}/legal-decision`,
  MANDATE_WORKFLOW: (id, step) => `/${initURL}/mandate-management/${id}/workflow/${step}`,
  MANDATE_CONTROLS: `/${initURL}/mandate-management/controls`,
  MANDATE_CONTROLS_ALL: `/${initURL}/mandate-management/controls/all`,
  MANDATE_CONTROL_AUDIT: (id) => `/${initURL}/mandate-management/controls/${id}/audit`,
  USER_LIST: `/${initURL}/apiv1/users/db?page=1&limit=1000`,

  // Controls APIs
  CONTROL_EXTRACT: `https://dev.grc3.io/mandate-ai/api/controls/extract`,
  CONTROL_DASHBOARD: `https://dev.grc3.io/mandate-ai/api/controls`,
  CONTROL_EXTRACTIONS: `https://dev.grc3.io/mandate-ai/api/controls/extractions`,
  COMPARE_CONTROL_ONE: `https://dev.grc3.io/mandate-ai/api/controls/compare-one`,
  COMPARE_CONTROL_ALL: `https://dev.grc3.io/mandate-ai/api/controls/compare`,
  CONTROL_ADD: `https://dev.grc3.io/mandate-ai/api/controls/add`,
  CONTROL_UPDATE: `https://dev.grc3.io/mandate-ai/api/controls/update`,
  CONTROL_SYNC: `https://dev.grc3.io/mandate-ai/api/controls/sync`,
  CONTROL_EXTRACT_AND_SYNC: `https://dev.grc3.io/mandate-ai/api/controls/extract-and-sync`,
};
