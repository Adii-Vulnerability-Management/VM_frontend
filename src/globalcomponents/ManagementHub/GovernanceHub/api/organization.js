// src/globalcomponents/ManagementHub/GovernanceHub/api/organization.ts
import CustomAxios from "@/globalcomponents/CustomAxios";
import { baseurl, initURL } from "../../../../../BaseUrl";

const ROOT = `${baseurl}/${initURL}/governance-hub/organizations`;

export const orgApi = {
  // GET /governance-hub/organizations?is_archived=false
  list: (params) =>
    CustomAxios.get(ROOT, { params }),

  // GET /governance-hub/organizations/tree
  tree: () =>
    CustomAxios.get(`${ROOT}/tree`),

  // POST /governance-hub/organizations
  create: (payload) =>
    CustomAxios.post(ROOT, payload),

  // PATCH /governance-hub/organizations/:id
  patch: (id, payload) =>
    CustomAxios.patch(`${ROOT}/${id}`, payload),

  // PATCH /governance-hub/organizations/:id/archive
  // Pass true to archive, false to unarchive (backend handles the toggle via body)
  archive: (id, is_archived) =>
    CustomAxios.patch(`${ROOT}/${id}/archive`, { is_archived }),

  // DELETE /governance-hub/organizations/:id
  remove: (id) =>
    CustomAxios.delete(`${ROOT}/${id}`),
};