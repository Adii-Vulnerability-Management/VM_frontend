// src/services/tprm/vendor/findings.js
import CustomAxios from "@/globalcomponents/CustomAxios";
import { baseurl, initURL } from "../../../../BaseUrl";

const FINDINGS_ROOT =
  baseurl && initURL
    ? `${baseurl.replace(/\/$/, "")}/${initURL.replace(
        /^\/+/,
        ""
      )}/TPRM/vendor/findings`
    : "/TPRM/vendor/findings";

// BACKEND ROUTES:
//
// GET    /TPRM/vendor/findings/findings
// GET    /TPRM/vendor/findings/action-items
// POST   /TPRM/vendor/findings/findings
// POST   /TPRM/vendor/findings/action-items
// PATCH  /TPRM/vendor/findings/findings/:id/status
// PATCH  /TPRM/vendor/findings/action-items/:id/status

/** GET /TPRM/vendor/findings/findings */
export async function getFindings() {
  try {
    const res = await CustomAxios.get(`${FINDINGS_ROOT}/findings`);
    return res.data; // array of findings
  } catch (error) {
    console.error("Error fetching findings: ", error?.response?.data || error);
    throw error;
  }
}

/** GET /TPRM/vendor/findings/action-items */
export async function getActionItems() {
  try {
    const res = await CustomAxios.get(`${FINDINGS_ROOT}/action-items`);
    return res.data; // array of action items
  } catch (error) {
    console.error(
      "Error fetching action items: ",
      error?.response?.data || error
    );
    throw error;
  }
}

/**
 * POST /TPRM/vendor/findings/findings
 *
 * payload:
 * {
 *   assessmentId: string;
 *   title: string;
 *   description?: string;
 *   severity?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
 * }
 */
export async function createFinding(payload) {
  try {
    const res = await CustomAxios.post(`${FINDINGS_ROOT}/findings`, payload);
    return res.data; // created finding
  } catch (error) {
    console.error("Error creating finding: ", error?.response?.data || error);
    throw error;
  }
}

/**
 * POST /TPRM/vendor/findings/action-items
 *
 * payload:
 * {
 *   findingId: string;
 *   title: string;
 *   description?: string;
 *   ownerUserId: string;
 *   dueDate?: string; // ISO date
 * }
 */
export async function createActionItem(payload) {
  try {
    const res = await CustomAxios.post(
      `${FINDINGS_ROOT}/action-items`,
      payload
    );
    return res.data; // created action item
  } catch (error) {
    console.error(
      "Error creating action item: ",
      error?.response?.data || error
    );
    throw error;
  }
}

/** PATCH /TPRM/vendor/findings/findings/:id/status */
export async function updateFindingStatus(id, status) {
  try {
    const res = await CustomAxios.patch(
      `${FINDINGS_ROOT}/findings/${id}/status`,
      { status }
    );
    return res.data; // updated finding
  } catch (error) {
    console.error(
      `Error updating finding status for ID ${id}: `,
      error?.response?.data || error
    );
    throw error;
  }
}

/** PATCH /TPRM/vendor/findings/action-items/:id/status */
export async function updateActionItemStatus(id, status) {
  try {
    const res = await CustomAxios.patch(
      `${FINDINGS_ROOT}/action-items/${id}/status`,
      { status }
    );
    return res.data; // updated action item
  } catch (error) {
    console.error(
      `Error updating action item status for ID ${id}: `,
      error?.response?.data || error
    );
    throw error;
  }
}
