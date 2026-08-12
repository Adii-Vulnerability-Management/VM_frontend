// privacy/Frontend/src/pages/admin/dataFlow/mapping/assets/index.js
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import { can, guard } from "@/auth/auth-permissions";
import CustomAxios from "@/globalcomponents/CustomAxios";
import { baseurl, initURL } from "@/config/config";
import DataFlowNav from "../Nav";
import ConnectorHelperModal from "@/components/dataflow/ConnectorHelperModal";
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

// reasonable asset types you already use across the app
const ASSET_TYPES = [
  "fs",
  "smb",
  "s3",
  "db",
  "sharepoint",
  "ssh",
  "ftp",
  "rdp",
  "app",
  "saas",
  "compute",
  "storage",
  "other",
];

export default function AssetsPage() {
  const apiBase = `${baseurl}/${initURL}/dataflow/assets`;

  const router = useRouter();

  // list + selection
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState(null);

  // filters + pagination (client-side)
  const [search, setSearch] = useState("");
  const [types, setTypes] = useState([]); // array of selected types (strings)
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  // create asset form
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [newType, setNewType] = useState("fs");
  const [newFreq, setNewFreq] = useState("daily");
  const [newTime, setNewTime] = useState("02:00");
  const [newDays, setNewDays] = useState([]);
  const [newTz, setNewTz] = useState("Asia/Kolkata");
  const [newConnText, setNewConnText] = useState(
    `[
  {
    "name": "os-privacy",
    "type": "fs",
    "uri": "file:///C:/Users/mange/Documents/nis/privacy",
    "run": true,
    "exclude_dirs": ["temp", "backup"]
  }
]`,
  );

  // schedule editor
  const [savingSched, setSavingSched] = useState(false);
  const [actMsg, setActMsg] = useState("");
  // add with other states
  const [dbMode, setDbMode] = useState("fetch"); // "fetch" | "various"
  const [tourOpen, setTourOpen] = useState(false);

  // Permissions
  const canViewTable = can("privacy.read") || can("scanner.read");
  const canViewManage =
    can(["privacy.read", "privacy.manage"], {
      mode: "all",
    }) || can(["scanner.read", "scanner.manage"], { mode: "all" });
  const canCreate =
    can(["privacy.create", "privacy.manage"]) ||
    can(["scanner.create", "scanner.manage"]);

  const steps = [
    {
      target: '[data-tour="header"]',
      title: "Data Inventory",
      content:
        "Welcome to Data Inventory. From here you create Assets (systems to scan), set scan schedules, and monitor scan status from the assets list.",
      placement: "bottom",
    },

    {
      target: '[data-tour="create-asset"]',
      title: "Create New Asset",
      content:
        "This entire section is used to register a new asset. You’ll fill in basic details, choose a scan schedule, configure connectors, then create the asset to make it available for scanning.",
      placement: "bottom",
    },

    {
      target: '[data-tour="basic-info"]',
      title: "Basic Information",
      content:
        "Provide the Asset Name and Asset Type. This identifies the system you want to scan and tells the platform what kind of connector configuration is expected.",
      placement: "bottom",
    },

    {
      target: '[data-tour="scan-schedule"]',
      title: "Scan Schedule",
      content:
        "Set how often the scanner should run (hourly/daily/weekly), the run time (if applicable), and the timezone. This controls when scans are triggered automatically.",
      placement: "bottom",
    },

    {
      target: '[data-tour="connectors-section"]',
      title: "Data Connectors",
      content:
        "Add the connector configuration (JSON array). Connectors define where to connect, what to scan, and what to exclude. This is the most important part for making the scan work correctly.",
      placement: "bottom",
    },

    {
      target: '[data-tour="connector-helper"]',
      title: "Connector Helper",
      content:
        "Use this helper to see examples and templates for connector JSON. It’s useful when you’re not sure about the correct format for a specific asset type.",
      placement: "left",
    },

    {
      target: '[data-tour="scan-all-dbs"]',
      title: "Scan All Databases",
      content: (
        <>
          Select this option to automatically discover and scan all databases
          available in the asset.
          <br />
          <strong>
            Here you need to keep the value of the &quot;database&quot; empty in
            the json (e.g. &quot;database&quot;: &quot;&quot;). Also you can
            adjust the length of the Findings you want in json (e.g.
            &quot;sample_docs_per_collection&quot;: 100).
          </strong>
        </>
      ),
      placement: "bottom",
    },

    {
      target: '[data-tour="scan-selected-dbs"]',
      title: "Scan Selected Databases",
      content: (
        <>
          Select this option to manually specify which databases to scan.
          <strong>
            <br />
            Here you need to mention the name of the specific database in the
            json (e.g. &quot;database&quot;: &quot;demo_db&quot;).
          </strong>
        </>
      ),
      placement: "bottom",
    },

    {
      target: '[data-tour="create-asset-btn"]',
      title: "Create Asset",
      content:
        "Click Create Asset Button to save everything you entered. Once created, the asset will appear in the Assets table below and can be scanned.",
      placement: "top",
    },

    {
      target: '[data-tour="refresh-btn"]',
      title: "Refresh",
      content:
        "Use Refresh Button to reload the asset list from the server. This is helpful right after creating an asset or if scan status has changed.",
      placement: "top",
    },

    {
      target: '[data-tour="filters"]',
      title: "Search & Pagination",
      content:
        "Use search and type filters to narrow down assets. Pagination controls let you change how many rows you see per page and navigate through the list.",
      placement: "bottom",
    },

    {
      target: '[data-tour="assets-section"]',
      title: "Assets",
      content:
        "This section lists all assets you’ve created, along with their type, scan schedule, last/next run times, and current status.",
      placement: "top",
    },

    {
      target: '[data-tour="assets-table"]',
      title: "Open Asset Details",
      content:
        "Click any row to open that asset’s detail page. You can review its configuration and Scan (Run) the assets.",
      placement: "top",
    },
  ];

  const normalizeAssets = (data) => {
    // backend returns:
    // - array (no query)
    // - { items, count } (when query params exist)
    if (Array.isArray(data)) return data;
    if (data && Array.isArray(data.items)) return data.items;
    return [];
  };

  const timeAgo = (ts) => {
    if (!ts) return "—";
    const diff = Date.now() - new Date(ts).getTime();
    const s = Math.floor(diff / 1000);
    const m = Math.floor(s / 60);
    const h = Math.floor(m / 60);
    const d = Math.floor(h / 24);
    if (d > 0) return `${d}d ago`;
    if (h > 0) return `${h}h ago`;
    if (m > 0) return `${m}m ago`;
    return `${s}s ago`;
  };

  const loadAssets = async () => {
    setError("");
    setActMsg("");
    try {
      setLoading(true);
      const params = new URLSearchParams();
      // when any query param exists, backend returns {items,count}; we normalize above.
      if (search.trim()) params.set("search", search.trim());
      if (types.length) params.set("type", types.join(",")); // service supports CSV for type
      // fetch a reasonably large limit; we paginate client-side
      params.set("limit", "1000");

      const url = params.toString()
        ? `${apiBase}?${params.toString()}`
        : apiBase;
      const res = await CustomAxios.get(url);
      const list = normalizeAssets(res.data);

      setAssets(list);

      // refresh selected from list (keep selection if still present)
      if (selected) {
        const found = list.find(
          (a) => (a._id || a.id) === (selected._id || selected.id),
        );
        setSelected(found || null);
      }

      // reset to page 1 if filters changed drastically (simple heuristic)
      setPage(1);
    } catch (e) {
      console.error("list assets", e?.response || e?.message || e);
      setError("Failed to load assets.");
    } finally {
      setLoading(false);
    }
  };

  const extractDbNamesFromConnectors = (connectors) => {
    const set = new Set();

    if (!Array.isArray(connectors)) return [];

    for (const c of connectors) {
      // your example uses: { type: "mongo", database: "sample_mflix", ... }
      const db = (c?.database || "").toString().trim();
      if (db) set.add(db);
    }

    return Array.from(set);
  };

  const createAsset = async () => {
    setError("");
    setActMsg("");
    if (!newName.trim()) {
      setError("Name is required");
      return;
    }
    let connectors = [];
    try {
      connectors = JSON.parse(newConnText);
      if (!Array.isArray(connectors))
        throw new Error("connectors must be an array");
    } catch {
      setError("Invalid connectors JSON");
      return;
    }

    setCreating(true);
    try {
      const payload = {
        name: newName.trim(),
        type: newType,
        connectors,
        scanFrequency: newFreq,
        scanTime: newTime,
        scanDays: newFreq === "weekly" ? newDays : [],
        timezone: newTz,
      };
      // await CustomAxios.post(apiBase, payload);
      const res = await CustomAxios.post(apiBase, payload);

      const assetId = res?.data?._id || res?.data?.id;
      const dbNames = extractDbNamesFromConnectors(connectors);

      if (assetId) {
        // ✅ always store mode
        localStorage.setItem(`df_asset_dbmode_${assetId}`, dbMode);

        // ✅ store db names only for "various"
        if (dbMode === "various") {
          localStorage.setItem(
            `df_asset_dbnames_${assetId}`,
            JSON.stringify(dbNames),
          );
        } else {
          localStorage.removeItem(`df_asset_dbnames_${assetId}`);
        }
      }

      setDbMode("fetch");

      setNewName("");
      setNewType("fs");
      setNewFreq("daily");
      setNewTime("02:00");
      setNewDays([]);
      setNewTz("Asia/Kolkata");
      await loadAssets();
      setActMsg("Asset created");
    } catch (e) {
      console.error("create asset", e?.response || e?.message || e);
      setError("Failed to create asset.");
    } finally {
      setCreating(false);
    }
  };

  const selectAsset = (a) => {
    setSelected(a);
    setActMsg("");
  };

  const saveSchedule = async () => {
    if (!selected) return;
    setSavingSched(true);
    setError("");
    setActMsg("");
    try {
      const id = selected._id || selected.id;
      const patch = {
        scanFrequency: selected.scanFrequency || "daily",
        scanTime: selected.scanTime || "02:00",
        scanDays: Array.isArray(selected.scanDays) ? selected.scanDays : [],
        timezone: selected.timezone || "Asia/Kolkata",
      };
      const res = await CustomAxios.patch(`${apiBase}/${id}/schedule`, patch);
      await loadAssets();
      const next = res?.data?.nextScanAt || selected.nextScanAt;
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
    if (!selected) return;
    setError("");
    setActMsg("");
    try {
      const id = selected._id || selected.id;
      await CustomAxios.post(`${apiBase}/${id}/run`);
      await loadAssets();
      setActMsg("Job queued from asset");
    } catch (e) {
      console.error("run now", e?.response || e?.message || e);
      setError("Failed to run now.");
    }
  };

  // initial load + refetch when filters change (debounced)
  useEffect(() => {
    loadAssets();
  }, []); // initial
  useEffect(() => {
    const t = setTimeout(loadAssets, 300);
    return () => clearTimeout(t);
  }, [search, types.join(",")]);

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

  const toggleDay = (day) => {
    if (!selected) return;
    const set = new Set(selected.scanDays || []);
    if (set.has(day)) set.delete(day);
    else set.add(day);
    setSelected({ ...selected, scanDays: Array.from(set) });
  };

  // client-side pagination
  const total = assets.length;
  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  const pageItems = useMemo(
    () => assets.slice(start, end),
    [assets, start, end],
  );
  const hasMore = end < total;

  const ScheduleControls = () =>
    !selected ? null : (
      <div className="space-y-3">
        <div className="grid gap-3 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600">
              Frequency
            </label>
            <select
              className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm"
              value={selected.scanFrequency || "daily"}
              onChange={(e) =>
                setSelected({ ...selected, scanFrequency: e.target.value })
              }
            >
              <option value="hourly">hourly</option>
              <option value="daily">daily</option>
              <option value="weekly">weekly</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600">
              Timezone
            </label>
            <input
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
              value={selected.timezone || "Asia/Kolkata"}
              onChange={(e) =>
                setSelected({ ...selected, timezone: e.target.value })
              }
              placeholder="e.g., Asia/Kolkata"
            />
          </div>
        </div>

        {(selected.scanFrequency === "daily" ||
          selected.scanFrequency === "weekly") && (
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600">
              Time (HH:MM)
            </label>
            <input
              type="time"
              className="w-40 rounded-lg border border-gray-200 px-3 py-2 text-sm"
              value={selected.scanTime || "02:00"}
              onChange={(e) =>
                setSelected({ ...selected, scanTime: e.target.value })
              }
            />
          </div>
        )}

        {selected.scanFrequency === "weekly" && (
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600">
              Days
            </label>
            <div className="flex flex-wrap gap-2">
              {WEEKDAYS.map((d) => {
                const active = (selected.scanDays || []).includes(d);
                return (
                  <button
                    key={d}
                    type="button"
                    onClick={() => toggleDay(d)}
                    className={[
                      "rounded-full border px-3 py-1 text-xs",
                      active
                        ? "border-indigo-300 bg-indigo-50 text-indigo-700"
                        : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50",
                    ].join(" ")}
                  >
                    {d}
                  </button>
                );
              })}
            </div>
            <div className="mt-1 text-xs text-gray-500">
              If you pick all 7 days, it’s equivalent to <b>daily</b>. If you
              pick none, it becomes <b>hourly</b>.
            </div>
          </div>
        )}

        <div className="flex gap-2">
          <button
            onClick={saveSchedule}
            disabled={savingSched}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
          >
            {savingSched ? "Saving…" : "Save Schedule"}
          </button>
          <button
            onClick={runNow}
            className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Run Now
          </button>
        </div>
      </div>
    );

  // type filter checkbox UI
  const TypeFilter = () => {
    const toggleType = (t) => {
      const set = new Set(types);
      if (set.has(t)) set.delete(t);
      else set.add(t);
      setTypes(Array.from(set));
      setPage(1);
    };
    return (
      <div className="flex flex-wrap gap-2">
        {ASSET_TYPES.map((t) => {
          const active = types.includes(t);
          return (
            <button
              key={t}
              type="button"
              onClick={() => toggleType(t)}
              className={[
                "rounded-full border px-3 py-1 text-xs",
                active
                  ? "border-indigo-300 bg-indigo-50 text-indigo-700"
                  : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50",
              ].join(" ")}
              title="Toggle filter"
            >
              {t}
            </button>
          );
        })}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <DataFlowNav />
      <div className="mx-5 min-h-screen bg-white rounded-lg p-5 my-3">
        {/* Header */}
        <div
          className="px-6 py-8 bg-[#2B245C] rounded-2xl shadow-lg hover:shadow-2xl transition-shadow duration-300 flex items-center justify-between"
          data-tour="header"
        >
          <div>
            <h1 className="text-3xl font-bold text-cyan-50">Data Inventory</h1>
            <p className="mt-1 text-sm text-white">
              Create assets (systems to scan), manage schedules, and run scans
              on demand.
            </p>
          </div>
          {/* Help Button */}
          <GuideButton
            onClick={() => setTourOpen(true)}
            variant="primary"
            size="md"
            className="!from-blue-500 !to-blue-600 hover:!from-blue-400 hover:!to-blue-500 !text-white !border-blue-400/70 !shadow-blue-600/30"
          >
            Help
          </GuideButton>
        </div>

        <div className="py-5 space-y-5">
          {/* Create asset */}
          <section
            className="rounded-2xl border border-[#2B245C] bg-white p-6 shadow-lg hover:shadow-2xl transition-shadow duration-300"
            data-tour="create-asset"
          >
            <div className="mb-3 pb-2">
              <h2 className="text-2xl font-bold text-[#2B245C]">
                Create New Asset
              </h2>
            </div>

            {/* Basic Information */}
            <div className="mb-5" data-tour="basic-info">
              <h3 className="text-sm font-bold text-[#2B245C] mb-4 uppercase tracking-wide">
                Basic Information
              </h3>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-2">
                    Asset Name *
                  </label>
                  <input
                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-indigo-200 transition-all"
                    placeholder="Asset name (e.g., S3: kritikalhire-s3)"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-2">
                    Asset Type *
                  </label>

                  <select
                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 focus:border-indigo-500 focus:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-indigo-200 transition-all"
                    value={newType}
                    onChange={(e) => setNewType(e.target.value)}
                  >
                    {ASSET_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Scan Schedule */}
            <div className="mb-5" data-tour="scan-schedule">
              <h3 className="text-sm font-bold text-[#2B245C] mb-4 uppercase tracking-wide">
                Scan Schedule
              </h3>
              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-2">
                    Frequency *
                  </label>
                  <select
                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 focus:border-indigo-500 focus:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-indigo-200 transition-all"
                    value={newFreq}
                    onChange={(e) => setNewFreq(e.target.value)}
                  >
                    <option value="hourly">hourly</option>
                    <option value="daily">daily</option>
                    <option value="weekly">weekly</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-2">
                    Scan Time *
                  </label>
                  <input
                    type="time"
                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-900 focus:border-indigo-500 focus:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-indigo-200 transition-all"
                    disabled={newFreq === "hourly"}
                    value={newTime}
                    onChange={(e) => setNewTime(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-2">
                    Timezone
                  </label>
                  <input
                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-indigo-200 transition-all"
                    placeholder="Timezone (e.g., Asia/Kolkata)"
                    value={newTz}
                    onChange={(e) => setNewTz(e.target.value)}
                  />
                </div>
              </div>

              {newFreq === "weekly" && (
                <div className="mt-4 p-4 bg-indigo-50 rounded-lg border border-indigo-200">
                  <label className="block text-xs font-semibold text-gray-700 mb-3">
                    Select Days
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {WEEKDAYS.map((d) => {
                      const active = newDays.includes(d);
                      return (
                        <button
                          key={d}
                          type="button"
                          onClick={() => {
                            const set = new Set(newDays);
                            if (set.has(d)) set.delete(d);
                            else set.add(d);
                            setNewDays(Array.from(set));
                          }}
                          className={[
                            "rounded-full border px-3 py-1 text-xs",
                            active
                              ? "border-indigo-400 bg-indigo-600 text-white shadow-md"
                              : "border-indigo-300 bg-white text-indigo-700 hover:bg-indigo-100",
                          ].join(" ")}
                        >
                          {d}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Connectors */}
            <div className="mb-5" data-tour="connectors-section">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-[#2B245C] uppercase tracking-wide">
                  Data Connectors
                </h3>
                <div data-tour="connector-helper">
                  <ConnectorHelperModal />
                </div>{" "}
              </div>
              <label className="block text-xs font-semibold text-gray-700 mb-2">
                Connection Configuration (JSON Array) *
              </label>
              <textarea
                className="h-40 w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-xs font-mono text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-indigo-200 transition-all"
                placeholder='[{"name": "example", "type": "fs", "uri": "..."}]'
                value={newConnText}
                onChange={(e) => setNewConnText(e.target.value)}
              />
              <div className="mb-3 mt-2 flex items-center gap-6">
                <label
                  data-tour="scan-all-dbs"
                  className="flex items-center gap-2 text-sm text-gray-800"
                >
                  <input
                    type="radio"
                    name="dbMode"
                    checked={dbMode === "fetch"}
                    onChange={() => setDbMode("fetch")}
                  />
                  Scan all available databases
                </label>

                <label
                  data-tour="scan-selected-dbs"
                  className="flex items-center gap-2 text-sm text-gray-800"
                >
                  <input
                    type="radio"
                    name="dbMode"
                    checked={dbMode === "various"}
                    onChange={() => setDbMode("various")}
                  />
                  Scan selected databases
                </label>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                data-tour="create-asset-btn"
                onClick={() => guard(canCreate, router, createAsset)}
                disabled={creating}
                className="inline-flex items-center gap-2 rounded-lg bg-[#2B245C] px-6 py-2.5 text-sm font-semibold text-white shadow-md hover:shadow-lg hover:bg-opacity-90 disabled:opacity-60 transition-all"
              >
                {creating ? "Creating…" : "Create Asset"}
              </button>
              <button
                data-tour="refresh-btn"
                onClick={loadAssets}
                className="inline-flex items-center gap-2 rounded-lg border border-[#2B245C] bg-white px-6 py-2.5 text-sm font-medium text-[#2B245C] hover:bg-indigo-50 transition-all"
              >
                {loading ? "Refreshing…" : "Refresh"}
              </button>

              {error && (
                <div className="ml-auto rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                  {error}
                </div>
              )}
              {actMsg && (
                <div className="ml-auto rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
                  {actMsg}
                </div>
              )}
            </div>
          </section>

          {/* Filters row */}
          <div
            className="flex flex-wrap items-center gap-2 rounded-2xl border border-[#2B245C] bg-white p-5 shadow-lg hover:shadow-2xl transition-shadow duration-300"
            data-tour="filters"
          >
            <input
              className="w-64 rounded-lg border border-gray-500 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-indigo-200 transition-all"
              placeholder="Search by name…"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
            <div className="text-sm text-gray-700">Type:</div>
            <TypeFilter />
            <div className="ml-auto flex items-center gap-4 text-sm text-gray-700">
              <select
                className="rounded-lg border border-gray-500 bg-white px-4 py-2 text-sm text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 ease-in-out"
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setPage(1);
                }}
              >
                {[10, 20, 50, 100].map((n) => (
                  <option key={n} value={n}>
                    {n}/page
                  </option>
                ))}
              </select>

              <span className="font-medium">{total} total</span>

              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="rounded-lg bg-[#2B245C] text-white px-4 py-2 text-sm font-semibold shadow-md hover:shadow-lg hover:bg-opacity-90 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-200 ease-in-out"
              >
                Prev
              </button>

              <span className="font-semibold text-[#2B245C]">Page {page}</span>

              <button
                onClick={() => setPage((p) => (hasMore ? p + 1 : p))}
                disabled={!hasMore}
                className="rounded-lg bg-[#2B245C] text-white px-4 py-2 text-sm font-semibold shadow-md hover:shadow-lg hover:bg-opacity-90 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-200 ease-in-out"
              >
                Next
              </button>
            </div>
          </div>

          {/* Main grid */}
          <div className="grid gap-6 lg:grid-cols-1">
            {/* Assets list */}
            <section
              className="mb-3 space-y-3 rounded-2xl border border-[#2B245C] bg-white p-6 shadow-lg hover:shadow-2xl transition-shadow duration-300"
              data-tour="assets-section"
            >
              <div className="mb-3 flex items-center justify-between">
                <div className="mb-3">
                  <h2 className="text-2xl font-semibold text-[#2B245C]">
                    Assets
                  </h2>
                  <p className="text-xs text-gray-500 mt-2">
                    Click any row for more details.
                  </p>
                </div>
                <span className="text-sm text-gray-600">
                  {pageItems.length} shown
                </span>
              </div>
              <div
                className="overflow-x-auto rounded-lg border border-gray-800"
                data-tour="assets-table"
              >
                <table className="min-w-full text-sm">
                  <thead className="bg-[#2B245C] text-left text-white border-b border-gray-800">
                    <tr>
                      <th className="px-4 py-2 font-medium">Name</th>
                      <th className="px-4 py-2 font-medium">Type</th>
                      <th className="px-4 py-2 font-medium">Schedule</th>
                      <th className="px-4 py-2 font-medium whitespace-nowrap">
                        Last / Next
                      </th>
                      <th className="px-4 py-2 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {!canViewTable ? (
                      <tr>
                        <td
                          colSpan={5}
                          className="px-6 py-10 text-center text-red-600 font-medium"
                        >
                          You don’t have permission to view assets.
                        </td>
                      </tr>
                    ) : loading ? (
                      <tr>
                        <td
                          colSpan={5}
                          className="px-4 py-6 text-center text-gray-600"
                        >
                          Loading…
                        </td>
                      </tr>
                    ) : pageItems.length === 0 ? (
                      <tr>
                        <td
                          colSpan={5}
                          className="px-4 py-6 text-center text-gray-600"
                        >
                          {assets.length === 0
                            ? "No assets yet. Create one above."
                            : "No assets match your filters."}
                        </td>
                      </tr>
                    ) : (
                      pageItems.map((a) => {
                        const key = a._id || a.id;
                        const sched =
                          a.scanFrequency === "hourly"
                            ? "hourly"
                            : a.scanFrequency === "daily"
                              ? `daily @ ${a.scanTime}`
                              : `weekly @ ${a.scanTime} (${
                                  (a.scanDays || []).join(", ") || "—"
                                })`;
                        return (
                          <tr
                            key={key}
                            className={`cursor-pointer hover:bg-gray-50 ${
                              selected && (selected._id || selected.id) === key
                                ? "bg-indigo-50/40"
                                : ""
                            }`}
                            onClick={() =>
                              guard(canViewManage, router, () => {
                                selectAsset(a);
                                if (key)
                                  router.push(`/admin/dataFlow/assets/${key}`);
                              })
                            }
                            title="Click any row for more details"
                          >
                            <td className="px-4 py-2">{a.name}</td>
                            <td className="px-4 py-2">{a.type}</td>
                            <td className="px-4 py-2">{sched}</td>
                            <td className="px-4 py-2 whitespace-nowrap">
                              <div className="text-xs text-gray-700">
                                Last:{" "}
                                {a.lastScanAt ? timeAgo(a.lastScanAt) : "—"}
                              </div>
                              <div className="text-xs text-gray-700">
                                Next:{" "}
                                {a.nextScanAt
                                  ? new Date(a.nextScanAt).toLocaleString()
                                  : "—"}
                              </div>
                            </td>
                            <td className="px-4 py-2">
                              <span
                                className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs ${statusTone(
                                  a.lastStatus,
                                )}`}
                              >
                                {a.lastStatus || "—"}
                              </span>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </section>

            {/* Right: details / schedule editor */}
            {/* <section className="space-y-4">
              <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
                <div className="mb-3 flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900">
                    Asset Details
                  </h2>
                  {selected && (
                    <span
                      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs ${statusTone(
                        selected.lastStatus,
                      )}`}
                    >
                      {selected.lastStatus || "—"}
                    </span>
                  )}
                </div>
                {!selected ? (
                  <div className="text-sm text-gray-600">
                    Select an asset to view/edit.
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="text-sm text-gray-800">
                      <div>
                        <span className="text-gray-600">Name:</span>{" "}
                        {selected.name}
                      </div>
                      <div>
                        <span className="text-gray-600">Type:</span>{" "}
                        {selected.type}
                      </div>
                      <div>
                        <span className="text-gray-600">Timezone:</span>{" "}
                        {selected.timezone || "Asia/Kolkata"}
                      </div>
                      <div>
                        <span className="text-gray-600">Last run:</span>{" "}
                        {selected.lastScanAt
                          ? new Date(selected.lastScanAt).toLocaleString()
                          : "—"}
                      </div>
                      <div>
                        <span className="text-gray-600">Next run:</span>{" "}
                        {selected.nextScanAt
                          ? new Date(selected.nextScanAt).toLocaleString()
                          : "—"}
                      </div>
                    </div>

                    <div className="pt-2 border-t border-gray-100">
                      <h3 className="text-base font-semibold text-gray-900 mb-2">
                        Schedule
                      </h3>
                      <ScheduleControls />
                    </div>

                    <div className="pt-2 border-t border-gray-100">
                      <h3 className="text-base font-semibold text-gray-900 mb-2">
                        Connectors (read-only)
                      </h3>
                      <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 text-xs text-gray-800 overflow-auto max-h-64">
                        <pre>
                          {JSON.stringify(selected.connectors || [], null, 2)}
                        </pre>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </section> */}
          </div>
        </div>
      </div>
      <Tour steps={steps} open={tourOpen} onClose={() => setTourOpen(false)} />
    </div>
  );
}
