"use client";
import { useMemo, useRef, useState } from "react";

/* ------------------- helpers ------------------- */

const SECRET_KEYS = new Set([
  "password",
  "client_secret",
  "aws_secret_access_key",
  "secret",
  "token",
  "key",
  "key_filename",
]);

const deepClone = (x) => JSON.parse(JSON.stringify(x));
const pretty = (x) => JSON.stringify(x, null, 2);
const copy = (t) => navigator.clipboard?.writeText(t);

/** redact obvious secrets (basic heuristic) */
function redactSecrets(obj) {
  const out = deepClone(obj);
  const walk = (v) => {
    if (Array.isArray(v)) return v.forEach(walk);
    if (v && typeof v === "object") {
      Object.keys(v).forEach((k) => {
        const lower = k.toLowerCase();
        if (SECRET_KEYS.has(lower)) {
          v[k] = "********";
        } else if (typeof v[k] === "object") {
          walk(v[k]);
        }
      });
    }
  };
  walk(out);
  return out;
}

const groupByType = (connectors = []) => {
  const map = new Map();
  connectors.forEach((c) => {
    const key = c?.type || "unknown";
    const arr = map.get(key) || [];
    arr.push(c);
    map.set(key, arr);
  });
  return map;
};

/* ------------------- baked-in INITIAL CONFIG (your JSON, with secrets redacted) ------------------- */

const INITIAL_CONFIG = redactSecrets({
  include_ext: [
    ".txt",
    ".csv",
    ".log",
    ".pdf",
    ".docx",
    ".pptx",
    ".js",
    ".jpg",
    ".png",
    ".html",
    ".json",
  ],
  exclude_ext: [".exe"],
  exclude_dirs: [
    "node_modules",
    ".git",
    "scan_pii_phi.egg-info",
    ".next",
    "dist",
    "build",
  ],
  max_workers: 8,
  smtp: {
    host: "smtp.example.com",
    port: 587,
    user: "user@example.com",
    password: "password",
  },
  detectors: {
    SSN: { frameworks: ["HIPAA", "GLBA"], severity: "High", weight: 3 },
    "Credit Card": { frameworks: ["PCI-DSS"], severity: "High", weight: 3 },
    Email: { frameworks: ["GDPR"], severity: "Medium", weight: 2 },
  },
  policies: {
    HIPAA: {
      detectors: ["SSN", "MRN", "Patient ID"],
      min_severity: "High",
      max_allowed: 0,
      on_violation: [{ action: "alert", channels: ["email"] }],
    },
    "PCI-DSS": {
      detectors: ["Credit Card"],
      min_severity: "High",
      max_allowed: 0,
      on_violation: [
        { action: "redact" },
        { action: "notify", channels: ["slack"] },
      ],
    },
    GDPR: {
      detectors: ["Email", "Phone", "IBAN"],
      min_severity: "Medium",
      max_allowed: 10,
      on_violation: [{ action: "ticket" }],
    },
  },
  connectors: [
    {
      type: "os_mount",
      mount_point: "C:\\Users\\mange\\Documents\\nis\\privacy",
      exclude_dirs: ["temp", "backup"],
      max_depth: "full",
    },
    {
      type: "smb",
      username: "anmol",
      password: "7193",
      remote_name: "Pradyum",
      remote_host: "192.168.1.23",
      share_name: "Users",
      domain: "WORKGROUP",
      excluded_dirs: [
        "Archive",
        "Old",
        "dist",
        "build",
        "node_modules",
        "OneDrive",
        "AppData",
        "prady",
      ],
      port: 445,
      timeout: 30,
      max_depth: "full",
      mount: false,
      mount_point: "Z:",
      smb_pool_size: 4,
    },
    {
      type: "smb",
      username: "anmol",
      password: "7193",
      remote_name: "PRADYUM",
      remote_host: "192.168.1.23",
      share_name: "suraj",
      domain: "WORKGROUP",
      excluded_dirs: [
        "Archive",
        "Old",
        "dist",
        "build",
        "node_modules",
        "AppData",
      ],
      port: 445,
      timeout: 30,
      max_depth: "full",
      mount: true,
      mount_point: "Z:",
      smb_pool_size: 4,
    },
    {
      type: "rdp-drive",
      host: "192.168.1.100",
      username: "mange",
      password: "SuperSecret",
      domain: "CORP",
      timeout: 60,
      auto_detect_drives: false,
      common_exclude_dirs: ["node_modules", "temp"],
      drive_specs: [
        {
          drive: "C",
          subpath: "Users/mange/Documents",
          exclude_dirs: ["backup", "logs"],
          max_depth: "full",
        },
        {
          drive: "D",
          subpath: "Projects/Secret",
          exclude_dirs: ["old_versions"],
          max_depth: 5,
        },
      ],
    },
    {
      type: "rdp-drive",
      host: "192.168.1.100",
      username: "mange",
      password: "SuperSecret",
      domain: "CORP",
      timeout: 60,
      auto_detect_drives: true,
      common_exclude_dirs: ["node_modules", "temp"],
    },
    {
      type: "rdp-channel",
      host: "192.168.1.100",
      username: "mange",
      password: "SuperSecret",
      domain: "CORP",
      channel_name: "drive",
      share_path: "/C/Users/mange/Documents",
      exclude_dirs: ["temp", "backup"],
      max_depth: "full",
      timeout: 60,
      auto_detect_channel: false,
    },
    {
      type: "rdp-channel",
      host: "192.168.1.100",
      username: "mange",
      password: "SuperSecret",
      domain: "CORP",
      channel_name: "drive",
      exclude_dirs: ["temp", "backup"],
      max_depth: "full",
      timeout: 60,
      auto_detect_channel: true,
    },
    {
      type: "rdp-existing",
      common_exclude_dirs: ["node_modules", "temp"],
      drive_specs: [
        {
          drive: "C",
          subpath: "Users/mange/Documents",
          exclude_dirs: ["backup"],
          max_depth: "full",
        },
      ],
    },
    {
      type: "rdp-existing",
      common_exclude_dirs: ["node_modules", "temp"],
    },
    {
      type: "ssh",
      host: "23.22.92.199",
      port: 22,
      username: "ubuntu",
      password: "sshpass",
      key_filename: "C:\\Users\\mange\\Downloads\\Demo_Key.pem",
      use_agent: false,
      root_path: "/home/ubuntu/Dev_GRC/Backend-GRC3",
      exclude_dirs: [
        "old",
        "tmp",
        ".git",
        ".next",
        "build",
        "dist",
        "node_modules",
        "core",
        "logs",
      ],
      max_depth: "full",
      timeout: 20,
      open_mode: "download",
      pool_size: 4,
    },
    {
      type: "ftp",
      host: "ftp.example.com",
      username: "alice",
      password: "secret",
      root_path: "/uploads",
      exclude_dirs: ["temp", "backup"],
      max_depth: 3,
      timeout: 30,
      pool_size: 5,
      open_mode: "download",
    },
    {
      type: "s3",
      region_name: "us-east-1",
      buckets: ["kritikalhire-s3"],
      exclude_dirs: ["tmp", "cache"],
      max_depth: "full",
      client_kwargs: {
        aws_access_key_id: "AKIA******************",
        aws_secret_access_key: "*************************************",
      },
      pool_strategy: "auto",
      http_pool_connections: 8,
      transfer_threshold_mb: 8,
      transfer_max_concurrency: 4,
      custom_pool_size: 4,
      mount: false,
      mount_point: "Y:\\\\s3-mount",
      use_rclone: true,
      s3fs_options: "allow_other,use_cache=/tmp",
    },
    {
      type: "sharepoint",
      tenant: "yourtenant.onmicrosoft.com",
      site: "Marketing",
      drive: "Documents",
      client_id: "00000000-0000-0000-0000-000000000000",
      client_secret: "YOUR_SECRET_VALUE",
      scopes: ["https://graph.microsoft.com/.default"],
      exclude_dirs: ["Archive"],
      max_depth: 5,
      retry_total: 3,
      backoff_factor: 0.5,
      max_workers: 8,
      open_mode: "download",
      batch_enabled: false,
    },
    {
      type: "sql",
      url: "postgresql+psycopg://<DB_USERNAME>:<DB_PASSWORD>@<DB_HOST>:5432/<DB_NAME>",
      include_schemas: [],
      exclude_schemas: ["information_schema", "pg_catalog"],
      exclude_tables: ["audit_.*", "logs_.*"],
      exclude_columns: ["password", "token", "secret"],
      max_rows_per_column: 1000,
      max_string_len: 20000,
      connect_args: { sslmode: "require" },
    },
    {
      type: "mongo",
      uri: "mongodb+srv://<DB_USERNAME>:<DB_PASSWORD>@<CLUSTER_HOST>/?retryWrites=true&w=majority",
      database: "<DATABASE_NAME>",
      sample_docs_per_collection: 200,
      max_string_len: 20000,
    },
  ],
});

/* ------------------- templates (by REAL type) ------------------- */

const TEMPLATES_BY_TYPE = {
  os_mount: {
    type: "os_mount",
    mount_point: "C:\\\\path\\\\to\\\\dir",
    exclude_dirs: ["temp", "backup"],
    max_depth: "full",
  },
  smb: {
    type: "smb",
    username: "<user>",
    password: "<password>",
    remote_name: "<SERVER>",
    remote_host: "<IP_OR_HOST>",
    share_name: "<Share>",
    domain: "WORKGROUP",
    excluded_dirs: ["node_modules", "dist"],
    port: 445,
    timeout: 30,
    max_depth: "full",
    mount: false,
    mount_point: "Z:",
    smb_pool_size: 4,
  },
  "rdp-drive": {
    type: "rdp-drive",
    host: "<host>",
    username: "<user>",
    password: "<password>",
    domain: "CORP",
    timeout: 60,
    auto_detect_drives: false,
    common_exclude_dirs: ["node_modules"],
    drive_specs: [
      {
        drive: "C",
        subpath: "Users/<you>/Documents",
        exclude_dirs: ["backup"],
        max_depth: "full",
      },
    ],
  },
  "rdp-channel": {
    type: "rdp-channel",
    host: "<host>",
    username: "<user>",
    password: "<password>",
    domain: "CORP",
    channel_name: "drive",
    share_path: "/C/Users/<you>/Documents",
    exclude_dirs: ["temp"],
    max_depth: "full",
    timeout: 60,
    auto_detect_channel: false,
  },
  "rdp-existing": {
    type: "rdp-existing",
    common_exclude_dirs: ["node_modules", "temp"],
    drive_specs: [
      { drive: "C", subpath: "Users/<you>/Documents", max_depth: "full" },
    ],
  },
  ssh: {
    type: "ssh",
    host: "<host>",
    port: 22,
    username: "<user>",
    password: "<password_or_omit>",
    key_filename: "<path_to_key>",
    use_agent: false,
    root_path: "/path",
    exclude_dirs: ["node_modules", "dist"],
    max_depth: "full",
    timeout: 20,
    open_mode: "download",
    pool_size: 4,
  },
  ftp: {
    type: "ftp",
    host: "<host>",
    username: "<user>",
    password: "<password>",
    root_path: "/uploads",
    exclude_dirs: ["temp"],
    max_depth: 3,
    timeout: 30,
    pool_size: 5,
    open_mode: "download",
  },
  s3: {
    type: "s3",
    region_name: "us-east-1",
    buckets: ["my-bucket"],
    exclude_dirs: ["tmp"],
    max_depth: "full",
    client_kwargs: {
      aws_access_key_id: "<AKIA...>",
      aws_secret_access_key: "<SECRET>",
    },
    pool_strategy: "auto",
    http_pool_connections: 8,
    transfer_threshold_mb: 8,
    transfer_max_concurrency: 4,
    custom_pool_size: 4,
    mount: false,
    mount_point: "Y:\\\\s3-mount",
    use_rclone: true,
    s3fs_options: "allow_other,use_cache=/tmp",
  },
  sharepoint: {
    type: "sharepoint",
    tenant: "<tenant>.onmicrosoft.com",
    site: "<SiteName>",
    drive: "Documents",
    client_id: "<GUID>",
    client_secret: "<SECRET>",
    scopes: ["https://graph.microsoft.com/.default"],
    exclude_dirs: ["Archive"],
    max_depth: 5,
    retry_total: 3,
    backoff_factor: 0.5,
    max_workers: 8,
    open_mode: "download",
    batch_enabled: false,
  },
  // ✅ FIX: your connector type is "sql" (Postgres URL inside)
  sql: {
    type: "sql",
    url: "postgresql+psycopg://<DB_USERNAME>:<DB_PASSWORD>@<DB_HOST>:5432/<DB_NAME>",
    include_schemas: [],
    exclude_schemas: ["information_schema", "pg_catalog"],
    exclude_tables: ["audit_.*", "logs_.*"],
    exclude_columns: ["password", "token", "secret"],
    max_rows_per_column: 1000,
    max_string_len: 20000,
    connect_args: { sslmode: "require" },
  },
  // ✅ FIX: your connector type is "mongo"
  mongo: {
    type: "mongo",
    uri: "mongodb+srv://<DB_USERNAME>:<DB_PASSWORD>@<CLUSTER_HOST>/?retryWrites=true&w=majority",
    database: "<DATABASE_NAME>",
    sample_docs_per_collection: 200,
    max_string_len: 20000,
  },
};

/* ------------------- display / search metadata ------------------- */

const TYPE_META = {
  os_mount: {
    label: "OS Mount",
    icon: "🗂️",
    aliases: ["local", "disk", "folder", "mount"],
  },
  smb: { label: "SMB Share", icon: "🖧", aliases: ["windows share", "cifs"] },
  "rdp-drive": {
    label: "RDP Drive",
    icon: "🖥️",
    aliases: ["remote desktop drive", "rdp"],
  },
  "rdp-channel": {
    label: "RDP Channel",
    icon: "🔌",
    aliases: ["remote desktop channel", "rdp"],
  },
  "rdp-existing": {
    label: "RDP Existing",
    icon: "♻️",
    aliases: ["reuse rdp", "existing session"],
  },
  ssh: { label: "SSH", icon: "🔐", aliases: ["sftp", "scp"] },
  ftp: { label: "FTP", icon: "📤", aliases: ["ftps"] },
  s3: { label: "Amazon S3", icon: "🪣", aliases: ["aws s3", "bucket"] },
  sharepoint: {
    label: "SharePoint",
    icon: "🏢",
    aliases: ["m365", "office", "onedrive"],
  },
  sql: {
    label: "PostgreSQL (SQL)",
    icon: "🗄️",
    aliases: ["postgres", "postgresql", "db", "database"],
  },
  mongo: {
    label: "MongoDB",
    icon: "🍃",
    aliases: ["mongodb", "atlas", "nosql"],
  },
  unknown: { label: "Unknown", icon: "❓", aliases: [] },
};

const getMeta = (type) =>
  TYPE_META[type] || { label: type, icon: "🔧", aliases: [] };

const matchesTypeQuery = (type, query) => {
  if (!query) return true;
  const q = query.toLowerCase().trim();
  const meta = getMeta(type);
  const hay = [type, meta.label, ...(meta.aliases || [])]
    .join(" ")
    .toLowerCase();
  return hay.includes(q);
};

const summarizeConnector = (c) => {
  // Keep it safe & compact, best-effort summary depending on type
  switch (c?.type) {
    case "sql":
      return `url=${String(c.url || "").slice(0, 40)}…`;
    case "mongo":
      return `db=${c.database || "<db>"} • uri=[…]`;
    case "s3":
      return `buckets=${(c.buckets || []).join(", ") || "—"} • region=${
        c.region_name || "—"
      }`;
    case "ssh":
      return `host=${c.host || "—"} • root=${c.root_path || "—"}`;
    case "smb":
      return `host=${c.remote_host || "—"} • share=${c.share_name || "—"}`;
    case "sharepoint":
      return `tenant=${c.tenant || "—"} • site=${c.site || "—"}`;
    default: {
      const bits =
        Object.entries(c || {})
          .filter(([k]) => k !== "type")
          .slice(0, 3)
          .map(
            ([k, v]) => `${k}=${typeof v === "object" ? "[…]" : String(v)}`
          ) || [];
      return bits.join(" • ");
    }
  }
};

/* ------------------- UI ------------------- */

export default function ConnectorHelperModal() {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [picked, setPicked] = useState(null); // { type, index }
  const cfgRef = useRef(INITIAL_CONFIG);

  const grouped = useMemo(
    () => groupByType(cfgRef.current.connectors || []),
    // NOTE: cfgRef won't change in this component; this is fine for current functionality
    [cfgRef.current.connectors]
  );

  const types = useMemo(() => Array.from(grouped.keys()).sort(), [grouped]);

  const filteredTypes = useMemo(() => {
    if (!q) return types;
    return types.filter((t) => matchesTypeQuery(t, q));
  }, [q, types]);

  const current =
    picked && grouped.get(picked.type)
      ? {
          type: picked.type,
          index: picked.index,
          value: grouped.get(picked.type)[picked.index],
        }
      : null;

  const handleCopySelected = () => current && copy(pretty(current.value));
  const handleCopyTemplate = () =>
    current &&
    copy(pretty(TEMPLATES_BY_TYPE[current.type] || { type: current.type }));
  const handleExportAll = () => copy(pretty(cfgRef.current));

  return (
    <>
      {/* trigger button */}
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 rounded-xl border border-[#2B245C] bg-white px-4 py-2 text-sm text-[#2B245C] font-semibold shadow-sm hover:bg-slate-50 active:scale-[0.99]"
      >
        <span className="text-base">🧩</span>
        Open Connector Helper
      </button>

      {!open ? null : (
        <>
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[9998]"
            onClick={() => setOpen(false)}
          />
          <div
            className="fixed inset-0 grid place-items-center z-[9999] p-3"
            role="dialog"
            aria-modal="true"
          >
            <div className="w-[96vw] max-w-[1120px] h-[88vh] max-h-[920px] overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-black/5">
              {/* header */}
              <div className="h-[64px] px-4 flex items-center justify-between border-b border-slate-200 bg-gradient-to-b from-white to-slate-50">
                <div className="flex items-center gap-3">
                  <div className="grid place-items-center h-10 w-10 rounded-xl bg-indigo-600 text-white shadow-sm">
                    🧩
                  </div>
                  <div>
                    <div className="font-semibold leading-tight">
                      Connector Helper
                    </div>
                    <div className="text-xs text-slate-500">
                      Browse, preview, and copy connector JSON safely (secrets
                      redacted).
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="relative">
                    <input
                      className="w-[360px] max-w-[56vw] rounded-xl border border-slate-300 bg-white px-3 py-2 pl-9 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder='Search types: "smb", "s3", "postgres", "mongodb"...'
                      value={q}
                      onChange={(e) => setQ(e.target.value)}
                    />
                    <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                      🔎
                    </span>
                  </div>

                  <button
                    className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm hover:bg-slate-50"
                    onClick={handleExportAll}
                    title="Copy the entire config JSON"
                  >
                    Export full JSON
                  </button>

                  <button
                    className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm hover:bg-slate-50"
                    onClick={() => setOpen(false)}
                  >
                    Close
                  </button>
                </div>
              </div>

              {/* content */}
              <div className="grid grid-cols-[360px_1fr] h-[calc(88vh-64px)] max-h-[calc(920px-64px)]">
                {/* left */}
                <div className="border-r border-slate-200 bg-white overflow-hidden">
                  <div className="h-full overflow-auto p-4">
                    {/* scan filters */}
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                      <div className="flex items-center justify-between">
                        <div className="text-[13px] font-semibold text-slate-700">
                          Scan filters
                        </div>
                        <div className="text-[11px] text-slate-500">
                          workers: {cfgRef.current.max_workers ?? "—"}
                        </div>
                      </div>

                      <div className="mt-2 flex flex-wrap gap-2">
                        {(cfgRef.current.include_ext || []).map((e) => (
                          <span
                            key={`inc-${e}`}
                            className="text-[11px] rounded-lg bg-indigo-50 text-indigo-700 px-2 py-0.5 border border-indigo-100"
                          >
                            include {e}
                          </span>
                        ))}
                        {(cfgRef.current.exclude_ext || []).map((e) => (
                          <span
                            key={`exc-${e}`}
                            className="text-[11px] rounded-lg bg-rose-50 text-rose-700 px-2 py-0.5 border border-rose-100"
                          >
                            exclude {e}
                          </span>
                        ))}
                      </div>

                      <div className="mt-2 flex flex-wrap gap-2">
                        {(cfgRef.current.exclude_dirs || []).map((d) => (
                          <span
                            key={`dir-${d}`}
                            className="text-[11px] rounded-lg bg-cyan-50 text-cyan-700 px-2 py-0.5 border border-cyan-100"
                          >
                            exclude_dir {d}
                          </span>
                        ))}
                      </div>

                      {cfgRef.current.smtp ? (
                        <div className="mt-3 text-[11px] text-slate-600">
                          <span className="font-semibold">SMTP:</span>{" "}
                          {cfgRef.current.smtp.host}:{cfgRef.current.smtp.port}{" "}
                          as {cfgRef.current.smtp.user}
                        </div>
                      ) : null}
                    </div>

                    <div className="mt-4 flex items-center justify-between">
                      <div className="text-[13px] font-semibold text-slate-700">
                        Connectors
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {cfgRef.current.connectors?.length ?? 0} total
                      </div>
                    </div>

                    <div className="mt-2 space-y-3">
                      {filteredTypes.map((t) => {
                        const meta = getMeta(t);
                        const list = grouped.get(t) || [];
                        return (
                          <div
                            key={t}
                            className="rounded-2xl border border-slate-200 overflow-hidden"
                          >
                            <div className="px-3 py-2 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className="text-sm">{meta.icon}</span>
                                <div className="leading-tight">
                                  <div className="text-[13px] font-semibold text-slate-800">
                                    {meta.label}
                                  </div>
                                  <div className="text-[11px] text-slate-500">
                                    type: <span className="font-mono">{t}</span>
                                  </div>
                                </div>
                              </div>
                              <span className="text-[11px] rounded-full bg-white border border-slate-200 px-2 py-0.5 text-slate-600">
                                {list.length}
                              </span>
                            </div>

                            <div className="p-2 space-y-2">
                              {list.map((c, i) => {
                                const active =
                                  picked?.type === t && picked?.index === i;
                                return (
                                  <button
                                    key={`${t}-${i}`}
                                    onClick={() =>
                                      setPicked({ type: t, index: i })
                                    }
                                    className={[
                                      "w-full text-left rounded-xl border px-3 py-2 transition",
                                      active
                                        ? "border-indigo-300 bg-indigo-50"
                                        : "border-slate-200 bg-white hover:bg-slate-50",
                                    ].join(" ")}
                                    title="View & copy JSON"
                                  >
                                    <div className="flex items-center justify-between gap-2">
                                      <div className="font-semibold text-sm text-slate-800">
                                        {meta.label} #{i + 1}
                                      </div>
                                      {active ? (
                                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-600 text-white">
                                          selected
                                        </span>
                                      ) : null}
                                    </div>
                                    <div className="mt-1 text-xs text-slate-500 truncate">
                                      {summarizeConnector(c) || "—"}
                                    </div>
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}

                      {!filteredTypes.length && (
                        <div className="text-slate-500 text-sm rounded-xl border border-slate-200 p-3 bg-slate-50">
                          No connector types match “{q}”.
                          <div className="text-xs mt-1">
                            Tip: try <span className="font-mono">postgres</span>{" "}
                            (matches type <span className="font-mono">sql</span>
                            ) or <span className="font-mono">mongodb</span>{" "}
                            (matches type{" "}
                            <span className="font-mono">mongo</span>).
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* right */}
                <div className="bg-slate-50 overflow-hidden">
                  <div className="h-full overflow-auto p-4">
                    {!current ? (
                      <div className="rounded-2xl border border-slate-200 bg-white p-5">
                        <div className="text-sm font-semibold text-slate-800">
                          Select a connector on the left
                        </div>
                        <div className="text-sm text-slate-600 mt-1">
                          You can preview the connector JSON (secrets redacted),
                          copy it, or copy a starter template for the same type.
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div>
                            <div className="text-sm font-semibold text-slate-800">
                              {getMeta(current.type).icon}{" "}
                              {getMeta(current.type).label}{" "}
                              <span className="text-slate-500 font-normal">
                                (type:{" "}
                                <span className="font-mono">
                                  {current.type}
                                </span>
                                )
                              </span>
                            </div>
                            <div className="text-xs text-slate-500">
                              Instance #{current.index + 1}
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm hover:bg-slate-100"
                              onClick={handleCopySelected}
                            >
                              Copy selected JSON
                            </button>
                            <button
                              className="rounded-xl border border-indigo-600 bg-indigo-600 px-3 py-2 text-sm text-white hover:bg-indigo-700"
                              onClick={handleCopyTemplate}
                            >
                              Copy template
                            </button>
                          </div>
                        </div>

                        <div className="grid gap-4 lg:grid-cols-2">
                          <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
                            <div className="px-3 py-2 border-b border-slate-200 bg-slate-50 text-[13px] font-semibold text-slate-700">
                              Selected connector (redacted)
                            </div>
                            <pre className="whitespace-pre-wrap break-words bg-[#0b1020] text-[#d7e1ff] text-[12.5px] p-3 overflow-auto">
                              {pretty(current.value)}
                            </pre>
                          </div>

                          <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
                            <div className="px-3 py-2 border-b border-slate-200 bg-slate-50 text-[13px] font-semibold text-slate-700">
                              Template for type:{" "}
                              <span className="font-mono">{current.type}</span>
                            </div>
                            <pre className="whitespace-pre-wrap break-words bg-[#0b1020] text-[#d7e1ff] text-[12.5px] p-3 overflow-auto">
                              {pretty(
                                TEMPLATES_BY_TYPE[current.type] || {
                                  type: current.type,
                                }
                              )}
                            </pre>
                          </div>
                        </div>

                        <div className="text-xs text-slate-500">
                          Tip: Replace placeholders like{" "}
                          <span className="font-mono">&lt;host&gt;</span> /{" "}
                          <span className="font-mono">&lt;SECRET&gt;</span>{" "}
                          before saving.
                        </div>
                      </div>
                    )}
                  </div>

                  {/* footer */}
                  <div className="h-[56px] border-t border-slate-200 bg-white px-4 flex items-center justify-between">
                    <span className="text-xs text-slate-500">
                      Secrets are redacted in previews. Export/copy still
                      returns redacted values.
                    </span>
                    <button
                      className="rounded-xl border border-indigo-600 bg-indigo-600 px-3 py-2 text-sm text-white hover:bg-indigo-700"
                      onClick={() => setOpen(false)}
                    >
                      Done
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
