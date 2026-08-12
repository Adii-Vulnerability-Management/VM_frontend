// src/services/breachService.js

import CustomAxios from "@/globalcomponents/CustomAxios";
import { baseurl, initURL } from "../../BaseUrl";

const BREACH_BASE = `${baseurl}/${initURL}/breach-management`;

export function createBreach() {
  return CustomAxios.post(BREACH_BASE, {});
}

export function getAllBreach() {
  return CustomAxios.get(BREACH_BASE);
}

export function getBreach(id) {
  return CustomAxios.get(`${BREACH_BASE}/${id}`);
}

export function updateBreach(id, payload) {
  return CustomAxios.put(`${BREACH_BASE}/${id}`, payload);
}

export function deleteBreach(id) {
  return CustomAxios.delete(`${BREACH_BASE}/${id}`);
}

// Knowledge Base

export function addKBEntry(id, dto) {
  return CustomAxios.post(
    `${BREACH_BASE}/${id}/knowledge-base`,
    dto,
  );
}

export function removeKBEntry(id, index) {
  return CustomAxios.delete(
    `${BREACH_BASE}/${id}/knowledge-base/${index}`,
  );
}

// Communication Plan

export function addCommPlanEntry(id, dto) {
  return CustomAxios.post(
    `${BREACH_BASE}/${id}/communication-plan`,
    dto,
  );
}

export function removeCommPlanEntry(id, index) {
  return CustomAxios.delete(
    `${BREACH_BASE}/${id}/communication-plan/${index}`,
  );
}

// Status Change

export function changeStatus(id, status, updatedBy) {
  return CustomAxios.patch(
    `${BREACH_BASE}/${id}/status/${encodeURIComponent(status)}`,
    {
      updatedBy,
    },
  );
}

// Threat Intelligence — CISA KEV CVE Version 0.1

/**
 * Checks a CVE against the locally synchronized CISA KEV collection
 * and links the result to the selected breach.
 *
 * The backend performs a local database lookup only.
 */
export function addThreatIndicator(breachId, cveId) {
  return CustomAxios.post(
    `${BREACH_BASE}/${breachId}/threat-indicators`,
    {
      cveId,
    },
  );
}

/**
 * Returns all CVE intelligence results linked to the breach.
 */
export function getThreatIndicators(breachId) {
  return CustomAxios.get(
    `${BREACH_BASE}/${breachId}/threat-indicators`,
  );
}

/**
 * Returns one saved CVE intelligence result.
 */
export function getThreatIndicator(breachId, indicatorId) {
  return CustomAxios.get(
    `${BREACH_BASE}/${breachId}/threat-indicators/${indicatorId}`,
  );
}

// Data Protection Board Report

export function previewBoardReport(id, payload) {
  return CustomAxios.post(
    `${BREACH_BASE}/${id}/board-report/preview`,
    payload,
  );
}

export function generateBoardReport(id, payload) {
  return CustomAxios.post(
    `${BREACH_BASE}/${id}/board-report/generate`,
    payload,
  );
}

export function getBoardReportHistory(id) {
  return CustomAxios.get(
    `${BREACH_BASE}/${id}/board-reports`,
  );
}

export function getBoardReportVersion(id, version) {
  return CustomAxios.get(
    `${BREACH_BASE}/${id}/board-reports/${version}`,
  );
}

export function downloadBoardReportPdf(id, version) {
  return CustomAxios.get(
    `${BREACH_BASE}/${id}/board-reports/${version}/pdf`,
    {
      responseType: "blob",
    },
  );
}

const breachService = {
  createBreach,
  getAllBreach,
  getBreach,
  updateBreach,
  deleteBreach,

  addKBEntry,
  removeKBEntry,

  addCommPlanEntry,
  removeCommPlanEntry,

  changeStatus,

  addThreatIndicator,
  getThreatIndicators,
  getThreatIndicator,

  previewBoardReport,
  generateBoardReport,
  getBoardReportHistory,
  getBoardReportVersion,
  downloadBoardReportPdf,
};

export default breachService;