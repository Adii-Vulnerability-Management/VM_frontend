// src/services/assetService.js
import CustomAxios from "@/globalcomponents/CustomAxios";
import { baseurl, initURL } from "../../BaseUrl";

const ASSET_MGMT_BASE = `${baseurl}/${initURL}/asset-management`;

/**
 * GET /asset-management
 */
export function getAllAssets() {
  return CustomAxios.get(ASSET_MGMT_BASE);
}

/**
 * GET /asset-management/:id
 */
export function getAssetById(id) {
  return CustomAxios.get(`${ASSET_MGMT_BASE}/${id}`);
}

/**
 * POST /asset-management
 */
export function createAsset(dto) {
  return CustomAxios.post(ASSET_MGMT_BASE, dto);
}

/**
 * POST /asset-management/bulk
 */
export function createMultipleAssets(arrayDto) {
  return CustomAxios.post(`${ASSET_MGMT_BASE}/bulk`, arrayDto);
}

/**
 * PATCH /asset-management/:id
 */
export function updateAsset(id, payload) {
  return CustomAxios.patch(`${ASSET_MGMT_BASE}/${id}`, payload);
}

/**
 * DELETE /asset-management/:id
 */
export function deleteAsset(id) {
  return CustomAxios.delete(`${ASSET_MGMT_BASE}/${id}`);
}

export default {
  getAllAssets,
  getAssetById,
  createAsset,
  createMultipleAssets,
  updateAsset,
  deleteAsset,
};
