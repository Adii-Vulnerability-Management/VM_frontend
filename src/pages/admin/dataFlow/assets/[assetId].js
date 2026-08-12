/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import CustomAxios from "@/globalcomponents/CustomAxios";
import { can, guard } from "@/auth/auth-permissions";
import { toast } from "react-toastify";
import { baseurl, initURL, scanBaseUrl } from "@/config/config";
import DataFlowNav from "../Nav";
import GuideButton from "@/components/Tour/GuideButton";
import Tour from "@/components/Tour/Tour";

const WEEKDAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

export default function AssetDetailsPage() {
  const router = useRouter();
  const { assetId } = router.query;
  const apiBase = `${baseurl}/${initURL}/dataflow/assets`;

  const [asset, setAsset] = useState(null);
  const [loading, setLoading] = useState(false);
  const [savingSched, setSavingSched] = useState(false);
  const [error, setError] = useState("");
  const [actMsg, setActMsg] = useState("");

  const [tourOpen, setTourOpen] = useState(false);

  // Permissions
  const canUpdate =
    can(["privacy.update", "privacy.manage"]) ||
    can(["scanner.update", "scanner.manage"]);
  const canCreate =
    can(["privacy.manage", "privacy.create"]) ||
    can(["scanner.manage", "scanner.create"]);

  const steps = [
    {
      target: '[data-tour="header"]',
      title: "Asset Details Page",
      content:
        "This page shows the asset configuration, scan status, schedule controls, and connectors.",
      placement: "bottom",
    },
    {
      target: '[data-tour="asset-details"]',
      title: "Asset Details",
      content: "This are the details of current selected Asset.",
      placement: "bottom",
    },
    {
      target: '[data-tour="schedule"]',
      title: "Schedule",
      content:
        "Set how often the scanner runs, at what time, and for weekly runs select days. Then click Save Schedule.",
      placement: "top",
    },
    {
      target: '[data-tour="run-now"]',
      title: "Run Now",
      content:
        "Run a scan immediately for this asset. Then go to Jobs tab to view all the Findings for this Asset.",
      placement: "top",
    },
    {
      target: '[data-tour="connectors"]',
      title: "Connectors",
      content:
        "These are the configured connectors for this asset (read-only). Scans use these settings.",
      placement: "top",
    },
  ];

  const statusTone = (status = "") => {
    const s = (status || "").toLowerCase();
    if (s.includes("queued"))
      return "border-amber-200 bg-amber-50 text-amber-800";
    if (s.includes("running"))
      return "border-blue-200 bg-blue-50 text-blue-700";
    if (s.includes("success"))
      return "border-emerald-200 bg-emerald-50 text-emerald-700";
    if (s.includes("failed") || s.includes("error"))
      return "border-red-200 bg-red-50 text-red-700";
    return "border-gray-200 bg-gray-50 text-gray-700";
  };

  const loadAsset = async () => {
    if (!assetId) return;
    setError("");
    setActMsg("");
    try {
      setLoading(true);
      const res = await CustomAxios.get(`${apiBase}/${assetId}`);
      setAsset(res.data || null);
    } catch (e) {
      console.error("load asset", e?.response || e?.message || e);
      setError("Failed to load asset.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAsset();
  }, [assetId]);

  const toggleDay = (day) => {
    if (!asset) return;
    const set = new Set(asset.scanDays || []);
    if (set.has(day)) set.delete(day);
    else set.add(day);
    setAsset({ ...asset, scanDays: Array.from(set) });
  };

  const saveSchedule = async () => {
    if (!asset) return;
    setSavingSched(true);
    setError("");
    setActMsg("");

    try {
      const id = asset._id || asset.id;
      const patch = {
        scanFrequency: asset.scanFrequency || "daily",
        scanTime: asset.scanTime || "02:00",
        scanDays: Array.isArray(asset.scanDays) ? asset.scanDays : [],
        timezone: asset.timezone || "Asia/Kolkata",
      };
      const res = await CustomAxios.patch(`${apiBase}/${id}/schedule`, patch);
      await loadAsset();
      const next = res?.data?.nextScanAt || asset.nextScanAt;
      setActMsg(
        `Schedule saved${
          next ? ` (next run: ${new Date(next).toLocaleString()})` : ""
        }`,
      );
    } catch (e) {
      console.error("save schedule", e?.response || e?.message || e);
      setError("Failed to save schedule.");
    } finally {
      setSavingSched(false);
    }
  };

  const runNow = async () => {
    if (!asset) return;
    setError("");
    setActMsg("");

    const id = asset._id || asset.id;

    const oldUrl = `${apiBase}/${id}/run`;
    const omTriggerUrl = `${apiBase}/${id}/openmetadata/trigger`;

    let jobId = null;

    try {
      // Trigger OpenMetadata pipeline first (best-effort)
      try {
        console.debug("[OpenMetadata] trigger pipeline (Run Now)", {
          assetId: id,
          url: omTriggerUrl,
        });
        await CustomAxios.post(omTriggerUrl);
        await loadAsset(); // refresh to pull discovered tableIds/tables
      } catch (e) {
        console.error(
          "[OpenMetadata] trigger failed (continuing scan)",
          e?.response || e?.message || e,
        );
      }

      const oldRes = await CustomAxios.post(oldUrl);

      //  capture job id from old API response
      jobId = oldRes?.data?.id || oldRes?.data?.jobId || null;

      setActMsg("Scan started successfully.");
    } catch (e) {
      setActMsg("Scan failed.");
      toast.error("Scan failed.", { className: toastStyle.error });
      return;
    }

    const scan = buildScanRequest(asset);
    if (scan.error) {
      setActMsg("Scan failed.");
      toast.error("Scan failed.", { className: toastStyle.error });
      return;
    }

    const scanUrl = `${scanBaseUrl}${scan.endpoint}`;

    // send job id to scanner + keep asset_id too (optional but recommended)
    const scanPayload = {
      ...scan.payload,
      asset_id: id,
      job_id: jobId, // THIS IS JOB ID
    };

    const connector = pickPrimaryConnector(asset);
    const scanLabel = getScanLabel(connector?.type || asset?.type);

    const scanToastId = toast.loading(" DataBase  is scanning by AI", {
      className: toastStyle.pending,
    });

    try {
      const scanRes = await CustomAxios.post(scanUrl, scanPayload);

      toast.update(scanToastId, {
        render: `${scanLabel} scan completed successfully`,
        type: "success",
        isLoading: false,
        autoClose: 3000,
        className: toastStyle.success,
      });

      setActMsg("Scan completed successfully.");
      await loadAsset();
      router.push("/admin/dataFlow/jobs");

      console.log("SCANNER response:", scanRes?.data);
    } catch (e) {
      const errMsg =
        e?.response?.data?.message ||
        e?.response?.data?.error ||
        e?.message ||
        "Scanner failed";

      toast.update(scanToastId, {
        render: `${scanLabel} scan failed : ${errMsg}`,
        type: "error",
        isLoading: false,
        autoClose: 5000,
        className: toastStyle.error,
      });

      if (!errMsg) {
        setActMsg("Scan completed successfully.");
      } else {
        setActMsg(`Scan failed: ${errMsg}`);
      }
    }
  };

  const ScheduleControls = () =>
    !asset ? null : (
      <div className="space-y-4">
        <div className="grid gap-3 md:grid-cols-2">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Frequency
            </label>
            <select
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
              value={asset.scanFrequency || "daily"}
              onChange={(e) =>
                setAsset({ ...asset, scanFrequency: e.target.value })
              }
            >
              <option value="hourly">hourly</option>
              <option value="daily">daily</option>
              <option value="weekly">weekly</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Timezone
            </label>
            <input
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
              value={asset.timezone || "Asia/Kolkata"}
              onChange={(e) => setAsset({ ...asset, timezone: e.target.value })}
              placeholder="e.g., Asia/Kolkata"
            />
          </div>
        </div>

        {(asset.scanFrequency === "daily" ||
          asset.scanFrequency === "weekly") && (
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Time (HH:MM)
            </label>
            <input
              type="time"
              className="w-40 rounded-lg border border-gray-200 px-3 py-2 text-sm"
              value={asset.scanTime || "02:00"}
              onChange={(e) => setAsset({ ...asset, scanTime: e.target.value })}
            />
          </div>
        )}

        {asset.scanFrequency === "weekly" && (
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Days
            </label>
            <div className="flex flex-wrap gap-2">
              {WEEKDAYS.map((d) => {
                const active = (asset.scanDays || []).includes(d);
                return (
                  <button
                    key={d}
                    type="button"
                    onClick={() => toggleDay(d)}
                    className={`rounded-full border px-3 py-1 text-xs ${
                      active
                        ? "border-indigo-300 bg-indigo-50 text-indigo-700"
                        : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    {d}
                  </button>
                );
              })}
            </div>
            <p className="mt-1 text-xs text-gray-500">
              Choose days you want the scan to run; pick none for hourly.
            </p>
          </div>
        )}

        <div className="flex flex-wrap gap-2 pb-5">
          <button
            onClick={() => guard(canUpdate, router, saveSchedule)}
            disabled={savingSched}
            className="inline-flex items-center gap-2 rounded-lg bg-[#2B245C] px-4 py-2 text-sm font-semibold text-white shadow hover:bg-opacity-90 disabled:opacity-60"
          >
            {savingSched ? "Saving..." : "Save Schedule"}
          </button>
          <button
            onClick={() => guard(canCreate, router, runNow)}
            data-tour="run-now"
            className="inline-flex items-center gap-2 rounded-lg border border-[#2B245C] bg-white px-4 py-2 text-sm font-medium text-[#2B245C] hover:bg-[#f0f4ff]"
          >
            Run Now
          </button>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <DataFlowNav />
      <div className="mx-5 bg-white rounded-lg p-5 my-3">
        {/* Header */}
        <div
          className="px-6 py-8 bg-[#2B245C] rounded-2xl shadow-lg hover:shadow-2xl transition-shadow duration-300"
          data-tour="header"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-cyan-50">
                Asset Details —
                <span className="text-cyan-100">
                  {asset?.name ? ` ${asset.name}` : ""}
                </span>
              </h1>
              <p className="mt-1 text-sm text-white">
                Review the asset, adjust schedule, and inspect connectors.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <GuideButton
                onClick={() => setTourOpen(true)}
                variant="primary"
                size="md"
                className="!from-blue-500 !to-blue-600 hover:!from-blue-400 hover:!to-blue-500 !text-white !border-blue-400/70 !shadow-blue-600/30"
              >
                Help
              </GuideButton>

              <button
                onClick={() => router.push("/admin/dataFlow/assets")}
                className="inline-flex items-center rounded-lg bg-white text-[#2B245C] px-6 py-2.5 text-sm font-semibold shadow-md hover:shadow-lg hover:bg-gray-100 transition-all"
              >
                ← Back to Assets
              </button>
            </div>
          </div>
        </div>

        {(error || actMsg) && (
          <div className="flex flex-wrap gap-3">
            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
                {error}
              </div>
            )}
            {actMsg && (
              <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm text-emerald-700">
                {actMsg}
              </div>
            )}
          </div>
        )}

        <div className="py-8">
          <div className="rounded-2xl border border-[#2B245C] bg-white p-6 shadow-lg hover:shadow-2xl transition-shadow duration-300">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-2xl font-semibold text-[#2B245C]">
                Asset Details
              </h2>
              {asset && (
                <span
                  className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs ${statusTone(
                    asset.lastStatus,
                  )}`}
                >
                  {asset.lastStatus || ""}
                </span>
              )}
            </div>
            {loading ? (
              <div className="text-sm text-gray-600">Loading...</div>
            ) : !asset ? (
              <div className="text-sm text-gray-600">No asset loaded.</div>
            ) : (
              <div className="space-y-3">
                <div
                  className="text-sm text-gray-800 space-y-3 mb-8"
                  data-tour="asset-details"
                >
                  <div>
                    <strong className="text-gray-600">Name:</strong>{" "}
                    {asset.name}
                  </div>
                  <div>
                    <strong className="text-gray-600">Type:</strong>{" "}
                    {asset.type}
                  </div>
                  <div>
                    <strong className="text-gray-600">Timezone:</strong>{" "}
                    {asset.timezone || "Asia/Kolkata"}
                  </div>
                  <div>
                    <strong className="text-gray-600">Last run:</strong>{" "}
                    {asset.lastScanAt
                      ? new Date(asset.lastScanAt).toLocaleString()
                      : ""}
                  </div>
                  <div>
                    <strong className="text-gray-600">Next run:</strong>{" "}
                    {asset.nextScanAt
                      ? new Date(asset.nextScanAt).toLocaleString()
                      : ""}
                  </div>
                </div>

                <div
                  className="pt-2 border-t border-gray-100"
                  data-tour="schedule"
                >
                  <h3 className="my-3 text-2xl font-semibold text-[#2B245C]">
                    Schedule
                  </h3>
                  <ScheduleControls />
                </div>

                <div
                  className="my-8 pt-2 border-t border-gray-100"
                  data-tour="connectors"
                >
                  <h3 className="my-3 text-2xl font-semibold text-[#2B245C]">
                    Connectors (read-only)
                  </h3>
                  <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 text-xs text-gray-800 overflow-auto max-h-64">
                    <pre>{JSON.stringify(asset.connectors || [], null, 2)}</pre>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <Tour steps={steps} open={tourOpen} onClose={() => setTourOpen(false)} />
    </div>
  );
}

const pickPrimaryConnector = (asset) => {
  const list = Array.isArray(asset?.connectors) ? asset.connectors : [];
  return list.find((c) => c?.run === true) || list[0] || null;
};

const buildScanRequest = (asset) => {
  const connector = pickPrimaryConnector(asset);

  if (!connector) {
    return { error: "No connector found in this asset." };
  }

  const type = (connector?.type || asset?.type || "").toLowerCase();
  const resolveUri = () =>
    connector.uri ||
    connector.url ||
    connector.connectionString ||
    connector.mysqlUri ||
    connector.sqlserverUri ||
    connector.mssqlUri ||
    connector.sqliteUri;

  const uri = resolveUri();
  const scheme = (uri || "").split("://")[0].toLowerCase();

  if (scheme === "mysql") {
    if (!uri) return { error: "MySQL connector is missing `uri`." };
    return { endpoint: "/api/scan/mysql", payload: { uri } };
  }

  if (scheme === "mssql" || scheme === "sqlserver") {
    if (!uri) return { error: "SQL Server connector is missing `uri`." };
    return { endpoint: "/api/scan/sqlserver", payload: { uri } };
  }

  if (scheme === "sqlite") {
    if (!uri) return { error: "SQLite connector is missing `uri`." };
    return { endpoint: "/api/scan/sqlite", payload: { uri } };
  }

  const postgresSchemes = new Set(["postgresql", "postgres"]);
  if (
    postgresSchemes.has(scheme) ||
    type.includes("postgresql") ||
    type === "postgres"
  ) {
    if (!uri) return { error: "PostgreSQL connector is missing `uri`." };
    return { endpoint: "/api/scan/postgresql", payload: { uri } };
  }

  const genericSql = new Set(["db", "sql"]);
  if (genericSql.has(type)) {
    if (!uri) return { error: "DB connector is missing `uri`." };
    return {
      endpoint: "/api/scan/sql",
      payload: {
        uri,
        include_schemas: connector.include_schemas || [],
        exclude_schemas: connector.exclude_schemas || [
          "information_schema",
          "pg_catalog",
        ],
        exclude_tables: connector.exclude_tables || [],
        exclude_columns: connector.exclude_columns || [],
        max_rows_per_column: connector.max_rows_per_column ?? 1000,
        max_string_len: connector.max_string_len ?? 20000,
        connect_args: connector.connect_args || {},
      },
    };
  }

  if (type === "supabase") {
    if (!connector.uri)
      return { error: "Supabase connector is missing `uri`." };
    return { endpoint: "/api/scan/supabase", payload: { uri: connector.uri } };
  }

  if (type === "sharepoint") {
    const siteUrl =
      connector.site_url ||
      connector.siteUrl ||
      connector.site ||
      connector.siteURL;
    const tenantId =
      connector.tenant_id || connector.tenantId || connector.tenant;
    const clientId = connector.client_id || connector.clientId;
    const clientSecret = connector.client_secret || connector.clientSecret;
    const maxFiles =
      connector.max_files ||
      connector.maxFiles ||
      connector.max_items ||
      connector.maxItems ||
      100;

    if (!siteUrl || !tenantId || !clientId || !clientSecret) {
      return {
        error:
          "SharePoint connector must include site_url/site, tenant_id/tenant, client_id, client_secret.",
      };
    }

    return {
      endpoint: "/api/scan/sharepoint",
      payload: {
        site_url: siteUrl,
        tenant_id: tenantId,
        client_id: clientId,
        client_secret: clientSecret,
        max_files: maxFiles,
      },
    };
  }

  if (type === "s3") {
    const bucket =
      connector.bucket ||
      connector.buckets?.[0] ||
      connector.bucket_name ||
      connector.bucketName;
    const accessKey =
      connector.access_key ||
      connector.accessKey ||
      connector.aws_access_key_id ||
      connector.client_kwargs?.aws_access_key_id ||
      connector.client_kwargs?.accessKeyId;
    const secretKey =
      connector.secret_key ||
      connector.secretKey ||
      connector.aws_secret_access_key ||
      connector.client_kwargs?.aws_secret_access_key ||
      connector.client_kwargs?.secretAccessKey;
    const region = connector.region || connector.region_name || "us-east-1";
    const prefix = connector.prefix || connector.folder || connector.path || "";
    const scanAll =
      typeof connector.scan_all_types === "boolean"
        ? connector.scan_all_types
        : typeof connector.scanAllTypes === "boolean"
          ? connector.scanAllTypes
          : true;

    if (!bucket || !accessKey || !secretKey) {
      return {
        error:
          "S3 connector must include bucket and AWS credentials (access_key/secret_key).",
      };
    }

    return {
      endpoint: "/api/scan/s3",
      payload: {
        bucket,
        access_key: accessKey,
        secret_key: secretKey,
        region,
        prefix,
        scan_all_types: scanAll,
      },
    };
  }

  if (type === "mongo" || type === "mongodb") {
    const uriValue =
      connector.uri ||
      connector.mongoUri ||
      connector.mongodbUri ||
      connector.connectionString;
    const database =
      connector.database || connector.db || connector.dbName || null;
    if (!uriValue) return { error: "MongoDB connector is missing `uri`." };
    return {
      endpoint: "/api/scan/mongodb",
      payload: { uri: uriValue, database },
    };
  }

  return { error: `Unsupported connector type: ${type}` };
};

const getScanLabel = (type = "") => {
  const t = (type || "").toLowerCase();
  if (t.includes("mongo")) return "MongoDB";
  if (t.includes("sharepoint")) return "SharePoint";
  if (t.includes("s3")) return "S3";
  if (t.includes("sql") || t.includes("db") || t.includes("postgres"))
    return "Database";
  if (t.includes("supabase")) return "Supabase";
  return "Source";
};

const toastStyle = {
  pending:
    "bg-yellow-100 text-yellow-900 border border-yellow-300 font-semibold rounded-lg shadow-md",
  success:
    "bg-green-100 text-green-900 border border-green-300 font-semibold rounded-lg shadow-md",
  error:
    "bg-red-100 text-red-900 border border-red-300 font-semibold rounded-lg shadow-md",
};
