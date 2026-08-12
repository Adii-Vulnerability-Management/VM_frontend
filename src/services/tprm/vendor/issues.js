// src/services/tprm/vendor/issues.js
import CustomAxios from "@/globalcomponents/CustomAxios";
import { baseurl, initURL } from "../../../../BaseUrl";

// Root path for the NestJS IssuesController (without the trailing `/issues`)
const ISSUES_ROOT =
  baseurl && initURL
    ? `${baseurl.replace(/\/$/, "")}/${initURL.replace(
        /^\/+/,
        ""
      )}/TPRM/vendor/issues`
    : "/TPRM/vendor/issues";

// For reference (backend):
// GET    /TPRM/vendor/issues/issues          -> findAll (with query params: status, vendorId, engagementId)
// POST   /TPRM/vendor/issues/issues          -> create
// PATCH  /TPRM/vendor/issues/issues/:id      -> update
// PATCH  /TPRM/vendor/issues/issues/:id/status -> updateStatus

/**
 * filters: { status?: 'OPEN' | 'IN_PROGRESS' | 'CLOSED', vendorId?: string, engagementId?: string }
 */
export async function getIssues(filters = {}) {
  try {
    const res = await CustomAxios.get(`${ISSUES_ROOT}/issues`, {
      params: {
        status: filters.status || undefined,
        vendorId: filters.vendorId || undefined,
        engagementId: filters.engagementId || undefined,
      },
    });
    return res.data; // array of issues
  } catch (error) {
    console.error("Error fetching issues: ", error?.response?.data || error);
    throw error;
  }
}

/**
 * payload:
 * {
 *   title: string;
 *   description?: string;
 *   severity?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
 *   vendorId?: string;
 *   engagementId?: string;
 *   assessmentId?: string;
 *   owner?: string;
 *   category?: string;
 *   dueDate?: string;  // ISO date e.g. "2025-12-31"
 * }
 */
export async function createIssue(payload) {
  try {
    const res = await CustomAxios.post(`${ISSUES_ROOT}/issues`, payload);
    return res.data; // created issue
  } catch (error) {
    console.error("Error creating issue: ", error?.response?.data || error);
    throw error;
  }
}

/**
 * Update any issue fields.
 * payload: partial of the create payload, plus optional `status`.
 */
export async function updateIssue(id, payload) {
  try {
    const res = await CustomAxios.patch(`${ISSUES_ROOT}/issues/${id}`, payload);
    return res.data; // updated issue
  } catch (error) {
    console.error(
      `Error updating issue with ID ${id}: `,
      error?.response?.data || error
    );
    throw error;
  }
}

/**
 * Convenience wrapper for status-only updates.
 * status: 'OPEN' | 'IN_PROGRESS' | 'CLOSED'
 */
export async function updateIssueStatus(id, status) {
  try {
    const res = await CustomAxios.patch(`${ISSUES_ROOT}/issues/${id}/status`, {
      status,
    });
    return res.data; // updated issue
  } catch (error) {
    console.error(
      `Error updating status for issue ID ${id}: `,
      error?.response?.data || error
    );
    throw error;
  }
}
