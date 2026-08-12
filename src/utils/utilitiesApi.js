// src/utils/utilitiesApi.js
import CustomAxios from "@/globalcomponents/CustomAxios";
import { baseurl, initURL } from "../../BaseUrl";

const prefix = `${baseurl}/${initURL}/utilities`;

export const getUtilitiesSummary = () => CustomAxios.get(`${prefix}`);

// Vulnerabilities
export const createVulnerability = (name) =>
  CustomAxios.post(`${prefix}/vulnerabilities`, { name });
export const deleteVulnerability = (id) =>
  CustomAxios.delete(`${prefix}/vulnerabilities/${id}`);

// Threats
export const createThreat = (name) =>
  CustomAxios.post(`${prefix}/threats`, { name });
export const deleteThreat = (id) =>
  CustomAxios.delete(`${prefix}/threats/${id}`);

// Processes
export const createProcess = (
  processName,
  context = [],
  activity = [],
  subProcess = []
) =>
  CustomAxios.post(`${prefix}/processes`, {
    processName,
    context,
    activity,
    subProcess,
  });

export const addProcessValue = (id, type, value) =>
  CustomAxios.patch(`${prefix}/processes/${id}/${type}`, { value }); // type: context|activity|subprocess

export const removeProcessValue = (id, type, value) =>
  CustomAxios.delete(`${prefix}/processes/${id}/remove`, {
    params: { type, value },
  });

export const deleteProcess = (id) =>
  CustomAxios.delete(`${prefix}/processes/${id}`);

// Asset classes
export const createAssetClass = (assetClassName, assetName = []) =>
  CustomAxios.post(`${prefix}/asset-classes`, { assetClassName, assetName });

export const addAssetToClass = (id, assetName) =>
  CustomAxios.patch(`${prefix}/asset-classes/${id}/assets`, { assetName });

export const removeAssetFromClass = (id, assetName) =>
  CustomAxios.delete(`${prefix}/asset-classes/${id}/assets`, {
    params: { assetName },
  });

export const deleteAssetClass = (id) =>
  CustomAxios.delete(`${prefix}/asset-classes/${id}`);
