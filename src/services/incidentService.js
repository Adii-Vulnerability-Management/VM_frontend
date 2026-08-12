// src/services/incidentService.js
import CustomAxios from "@/globalcomponents/CustomAxios";
import { baseurl, initURL } from "../../BaseUrl";

const INCIDENT_BASE = `${baseurl}/${initURL}/incident-management`;

/**
 * Fetch all incidents.
 * GET /incident-management
 */
export function getAllIncidents() {
  return CustomAxios.get(INCIDENT_BASE);
}

/**
 * Fetch a single incident by ID.
 * GET /incident-management/:id
 */
export function getIncidentById(id) {
  return CustomAxios.get(`${INCIDENT_BASE}/${id}`);
}

const incidentService = {
  getAllIncidents,
  getIncidentById,
};

export default incidentService;
