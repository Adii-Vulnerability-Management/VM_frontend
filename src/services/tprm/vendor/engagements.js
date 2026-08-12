// src/services/tprm/vendor/engagements.js
import CustomAxios from "@/globalcomponents/CustomAxios";
import { baseurl, initURL } from "../../../../BaseUrl";

const ENGAGEMENTS_BASE =
  baseurl && initURL
    ? `${baseurl.replace(/\/$/, "")}/${initURL.replace(
        /^\/+/,
        ""
      )}/TPRM/vendor/engagements`
    : "/engagements";

/**
 * CreateEngagementDto (backend)
 * --------------------------------
 * {
 *   vendorId: string;
 *   name: string;
 *   scope?: string;
 *   security?: string;
 *   data?: string;
 *   inherentRiskLevel?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
 *   inherentRiskScore?: number;
 * }
 *
 * UpdateEngagementDto (backend)
 * --------------------------------
 * {
 *   name?: string;
 *   scope?: string;
 *   security?: string;
 *   data?: string;
 *   inherentRiskLevel?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
 *   inherentRiskScore?: number;
 *   status?: 'ACTIVE' | 'INACTIVE';
 * }
 *
 * Engagement schema also has:
 *   vendorId (ObjectId)
 *   status: 'ACTIVE' | 'INACTIVE'
 *   createdAt, updatedAt (timestamps)
 */

/** GET /engagements */
export async function getEngagements() {
  try {
    const res = await CustomAxios.get(ENGAGEMENTS_BASE);
    return res.data; // → array of engagements
  } catch (error) {
    console.error("Error fetching engagements: ", error);
    throw new Error("Failed to fetch engagements");
  }
}

/** GET /engagements/:id */
export async function getEngagementById(id) {
  try {
    const res = await CustomAxios.get(`${ENGAGEMENTS_BASE}/${id}`);
    return res.data; // → single engagement
  } catch (error) {
    console.error(`Error fetching engagement with ID ${id}: `, error);
    throw new Error(`Failed to fetch engagement with ID ${id}`);
  }
}

/** POST /engagements */
export async function createEngagement(payload) {
  try {
    // payload should follow CreateEngagementDto
    const res = await CustomAxios.post(ENGAGEMENTS_BASE, payload);
    return res.data; // → created engagement
  } catch (error) {
    console.error("Error creating engagement: ", error);
    throw new Error("Failed to create engagement");
  }
}

/** PATCH /engagements/:id */
export async function updateEngagement(id, payload) {
  try {
    // payload can be any subset of UpdateEngagementDto
    const res = await CustomAxios.patch(`${ENGAGEMENTS_BASE}/${id}`, payload);
    return res.data; // → updated engagement
  } catch (error) {
    console.error(`Error updating engagement with ID ${id}: `, error);
    throw new Error(`Failed to update engagement with ID ${id}`);
  }
}

/** DELETE /engagements/:id */
export async function deleteEngagement(id) {
  try {
    await CustomAxios.delete(`${ENGAGEMENTS_BASE}/${id}`);
  } catch (error) {
    console.error(`Error deleting engagement with ID ${id}: `, error);
    throw new Error(`Failed to delete engagement with ID ${id}`);
  }
}

/**
 * (Optional) If your backend supports filtering by vendor:
 * e.g. GET /vendors/:vendorId/engagements
 * Uncomment & adjust route if you have it.
 */
// export async function getEngagementsByVendor(vendorId) {
//   try {
//     const res = await CustomAxios.get(
//       `${ENGAGEMENTS_BASE}?vendorId=${encodeURIComponent(vendorId)}`
//     );
//     return res.data;
//   } catch (error) {
//     console.error(
//       `Error fetching engagements for vendor with ID ${vendorId}: `,
//       error
//     );
//     throw new Error(`Failed to fetch engagements for vendor ID ${vendorId}`);
//   }
// }
