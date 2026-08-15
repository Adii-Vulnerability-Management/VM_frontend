"use client";

import api from "./api";

const VM = "/vulnerability-management";

export const ASSET_TYPES = [
  { value: "git_repository", label: "Git Repository" },
  { value: "docker_image", label: "Docker Image" },
  { value: "container_registry", label: "Container Registry" },
  { value: "kubernetes_cluster", label: "Kubernetes Cluster" },
  { value: "website", label: "Website" },
  { value: "api", label: "API" },
  { value: "host", label: "Host" },
  { value: "ip_address", label: "IP Address" },
  { value: "ip_range", label: "IP Range" },
  { value: "local_path", label: "Local Path" },
  { value: "cloud_account", label: "Cloud Account" },
];

// The field(s) required per asset type, enforced by the backend's
// validateTargetRequirements(). Kept in sync with assets.service.ts.
export const ASSET_TYPE_REQUIRED_FIELDS = {
  git_repository: [{ name: "repoUrl", label: "Repository URL", placeholder: "https://github.com/org/repo" }],
  docker_image: [{ name: "imageReference", label: "Image reference", placeholder: "org/image:tag" }],
  container_registry: [{ name: "registryUrl", label: "Registry URL", placeholder: "registry.example.com" }],
  kubernetes_cluster: [{ name: "clusterName", label: "Cluster name", placeholder: "prod-cluster" }],
  website: [{ name: "targetUrl", label: "Target URL", placeholder: "https://example.com" }],
  api: [{ name: "targetUrl", label: "Target URL", placeholder: "https://api.example.com" }],
  host: [{ name: "targetHost", label: "Target host", placeholder: "host.example.com" }],
  ip_address: [{ name: "targetIp", label: "Target IP", placeholder: "10.0.0.5" }],
  ip_range: [{ name: "targetRange", label: "Target range (CIDR)", placeholder: "10.0.0.0/24" }],
  local_path: [{ name: "targetPath", label: "Absolute path on server", placeholder: "/var/app/repo" }],
  cloud_account: [
    { name: "cloudProvider", label: "Cloud provider", placeholder: "aws" },
    { name: "cloudAccountId", label: "Cloud account ID", placeholder: "123456789012" },
  ],
};

export const CRITICALITY_LEVELS = ["low", "medium", "high", "critical"];
export const ENVIRONMENTS = ["production", "staging", "development", "test", "other"];

export const FINDING_SEVERITIES = ["critical", "high", "medium", "low", "info"];
export const FINDING_STATUSES = [
  "open",
  "assigned",
  "in_progress",
  "fixed",
  "verified",
  "false_positive",
  "risk_accepted",
  "closed",
];
export const FINDING_TYPES = [
  "dependency",
  "secret",
  "sast",
  "iac",
  "license",
  "configuration",
  "infrastructure",
  "container",
  "web",
  "api",
  "network",
  "ssl_tls",
  "headers",
  "cloud_config",
  "kubernetes",
  "exposure",
  "authentication",
];

export const SEVERITY_COLORS = {
  critical: "bg-red-100 text-red-700 border-red-200",
  high: "bg-orange-100 text-orange-700 border-orange-200",
  medium: "bg-amber-100 text-amber-700 border-amber-200",
  low: "bg-emerald-100 text-emerald-700 border-emerald-200",
  info: "bg-sky-100 text-sky-700 border-sky-200",
};

export const STATUS_COLORS = {
  open: "bg-red-50 text-red-700",
  assigned: "bg-amber-50 text-amber-700",
  in_progress: "bg-blue-50 text-blue-700",
  fixed: "bg-emerald-50 text-emerald-700",
  verified: "bg-emerald-100 text-emerald-800",
  false_positive: "bg-slate-100 text-slate-600",
  risk_accepted: "bg-purple-50 text-purple-700",
  closed: "bg-slate-100 text-slate-500",
};

// ---- Dashboard ----
export const getDashboardSummary = () => api.get(`${VM}/dashboard/summary`).then((r) => r.data);

// ---- Assets (scan targets) ----
export const listAssets = (params = {}) => api.get(`${VM}/assets`, { params }).then((r) => r.data);
export const getAssetScanners = (id) => api.get(`${VM}/assets/${id}/scanners`).then((r) => r.data);
export const createAsset = (body) => api.post(`${VM}/assets`, body).then((r) => r.data);
export const updateAsset = (id, body) => api.patch(`${VM}/assets/${id}`, body).then((r) => r.data);
export const archiveAsset = (id) => api.patch(`${VM}/assets/${id}/archive`).then((r) => r.data);
export const restoreAsset = (id) => api.patch(`${VM}/assets/${id}/restore`).then((r) => r.data);

// ---- Scans ----
export const getScanOptions = () => api.get(`${VM}/scans/options`).then((r) => r.data);
export const runScan = (body) => api.post(`${VM}/scans/run`, body).then((r) => r.data);
export const uploadScanReport = (formData) =>
  api
    .post(`${VM}/scans/upload`, formData, { headers: { "Content-Type": "multipart/form-data" } })
    .then((r) => r.data);
export const listScans = (params = {}) => api.get(`${VM}/scans`, { params }).then((r) => r.data);
export const getScan = (id) => api.get(`${VM}/scans/${id}`).then((r) => r.data);
export const getScanStatus = (id) => api.get(`${VM}/scans/${id}/status`).then((r) => r.data);

// ---- Findings ----
export const listFindings = (params = {}) => api.get(`${VM}/findings`, { params }).then((r) => r.data);
export const getFinding = (id) => api.get(`${VM}/findings/${id}`).then((r) => r.data);
export const createManualFinding = (body) => api.post(`${VM}/findings/manual`, body).then((r) => r.data);
export const updateFindingStatus = (id, body) =>
  api.patch(`${VM}/findings/${id}/status`, body).then((r) => r.data);
export const assignFinding = (id, body) => api.post(`${VM}/findings/${id}/assign`, body).then((r) => r.data);
export const verifyFinding = (id, body) => api.post(`${VM}/findings/${id}/verify`, body).then((r) => r.data);

// ---- Exceptions ----
export const requestException = (findingId, body) =>
  api.post(`${VM}/findings/${findingId}/exception`, body).then((r) => r.data);
export const listExceptions = (params = {}) => api.get(`${VM}/exceptions`, { params }).then((r) => r.data);
export const approveException = (id, body) =>
  api.patch(`${VM}/exceptions/${id}/approve`, body).then((r) => r.data);
export const rejectException = (id, body) =>
  api.patch(`${VM}/exceptions/${id}/reject`, body).then((r) => r.data);

// ---- Evidence ----
export const listEvidence = (findingId) =>
  api.get(`${VM}/findings/${findingId}/evidence`).then((r) => r.data);
export const uploadEvidence = (findingId, formData) =>
  api
    .post(`${VM}/findings/${findingId}/evidence`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    })
    .then((r) => r.data);
