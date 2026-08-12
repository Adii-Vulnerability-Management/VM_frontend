import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useRouter } from "next/router";
import CustomAxios from "@/globalcomponents/CustomAxios";
import { baseurl, initURL } from "@/config/config";
import DataFlowNav from "../Nav";
import { FaEye, FaEyeSlash, FaExpandArrowsAlt } from "react-icons/fa";
import GuideButton from "@/components/Tour/GuideButton";
import Tour from "@/components/Tour/Tour";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from "recharts";
import {
  BarChart3,
  PieChart as PieIcon,
  Fingerprint,
  HeartPulse,
  FileText,
  ShieldCheck,
  Database,
  Tags,
  ChevronDown,
  ChevronRight,
} from "lucide-react";

export default function JobDetailsPage() {
  const router = useRouter();
  const { jobId } = router.query;

  // -----------------------
  // API bases
  // -----------------------
  // Left (current system)
  const apiBase = `${baseurl}/${initURL}/dataflowjobs`;
  const assetsApiBase = `${baseurl}/${initURL}/dataflow/assets`;

  // Right (AI Python Service) - same style as the reference code
  const aiApiBase = useMemo(() => `${baseurl}`, []);

  const aiFindingsUrl = useMemo(() => {
    // const base = (aiApiBase || "").replace(/\/$/, "");
    return `${baseurl}/${initURL}/finding-ai`;
  }, [aiApiBase]);

  // -----------------------
  // Left states (current)
  // -----------------------
  const [selectedJob, setSelectedJob] = useState(null);
  const [jobDetails, setJobDetails] = useState(null);
  const [results, setResults] = useState([]);
  const [aggregate, setAggregate] = useState([]);
  const [configObj, setConfigObj] = useState(null);

  const [loadingDetails, setLoadingDetails] = useState(false);
  const [loadingResults, setLoadingResults] = useState(false);
  const [loadingAggregate, setLoadingAggregate] = useState(false);
  const [loadingConfig, setLoadingConfig] = useState(false);

  const [ingesting, setIngesting] = useState(false);
  const [acting, setActing] = useState(false);
  const [error, setError] = useState("");

  // -----------------------
  // OpenMetadata (schema versions + diff)
  // -----------------------
  const OM_DEBUG = true;
  const [assetMeta, setAssetMeta] = useState(null);
  const [omServiceTables, setOmServiceTables] = useState([]);
  const [loadingOmServiceTables, setLoadingOmServiceTables] = useState(false);
  const [omTableId, setOmTableId] = useState("");
  const [omSelectedTable, setOmSelectedTable] = useState(null);
  const [omVersionsResp, setOmVersionsResp] = useState(null);
  const [loadingOmVersions, setLoadingOmVersions] = useState(false);
  const [omCompareMode, setOmCompareMode] = useState("auto"); // "auto" | "manual"
  const [omVersionA, setOmVersionA] = useState("");
  const [omVersionB, setOmVersionB] = useState("");
  const [loadingOmSchemaA, setLoadingOmSchemaA] = useState(false);
  const [loadingOmSchemaB, setLoadingOmSchemaB] = useState(false);
  const [omSchemaA, setOmSchemaA] = useState(null);
  const [omSchemaB, setOmSchemaB] = useState(null);
  const [omError, setOmError] = useState("");

  const [csvText, setCsvText] = useState("");
  const [aiDbMode, setAiDbMode] = useState("fetch"); // "fetch" | "various"
  const [assetDbNames, setAssetDbNames] = useState([]); // saved db names
  const [noDbFound, setNoDbFound] = useState(false);

  // -----------------------
  // Right states (AI)
  // -----------------------
  const [scanId, setScanId] = useState("");
  const [aiResults, setAiResults] = useState([]);
  const [aiAggregate, setAiAggregate] = useState([]);

  const [loadingAiResults, setLoadingAiResults] = useState(false);
  const [loadingAiAggregate, setLoadingAiAggregate] = useState(false); // computed from findings, but still "loading" while findings load

  // hide/show button
  const [showJobDetails, setShowJobDetails] = useState(false);

  // finding detail modal
  const [openTableModal, setOpenTableModal] = useState(false);
  const [modalTitle, setModalTitle] = useState("Findings");
  const [modalRows, setModalRows] = useState([]);

  //  COMPARE MODAL
  const [isCompareOpen, setIsCompareOpen] = useState(false);

  // Tabs
  const [activeTab, setActiveTab] = useState("findings");

  // any modal open to giev blur effect in bg
  const isAnyModalOpen = openTableModal || isCompareOpen;

  // DELTA or COMBINED step
  const [compareStep, setCompareStep] = useState(null); // null | "menu" | "delta" | "combined"
  // ✅ PROFESSIONAL LABELS (no Left/Right, no Manual/AI)
  const BASELINE_LABEL = "Baseline Scan";
  const ENHANCED_LABEL = "Enhanced Scan";

  const [tourOpen, setTourOpen] = useState(false);

  // Refs for scroll-to-section when clicking summary cards in graphs
  const baselineTableSectionRef = useRef(null);
  const enhancedTableSectionRef = useRef(null);
  const fieldLevelSectionRef = useRef(null);

  // Expanded tables in field-level metadata (set of table names)
  const [expandedMetadataTables, setExpandedMetadataTables] = useState(
    new Set(),
  );

  // const toggleMetadataTable = (name) => {
  //   setExpandedMetadataTables((prev) => {
  //     const next = new Set(prev);
  //     if (next.has(name)) next.delete(name);
  //     else next.add(name);
  //     return next;
  //   });
  // };

  const toggleMetadataTable = (name) => {
    setExpandedMetadataTables((prev) => {
      if (prev.has(name)) return new Set();
      return new Set([name]);
  const toggleMetadataTable = (name) => {
    setExpandedMetadataTables((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  };

  // Expand first table when field-level metadata loads
  const scrollToSection = useCallback((ref) => {
    ref?.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  // Chart colors (same as dashboard)
  const COLORS = ["#7c3aed", "#06b6d4", "#ef4444", "#22c55e", "#f97316"];

  // PHI vs PII: health/medical types count as PHI
  const isPHIType = (type) => {
    if (!type || typeof type !== "string") return false;
    const t = String(type).toLowerCase();
    return t.includes("health") || t.includes("medical");
  };

  // tabs change for Help Info
  const handleTabChange = async (tabKey) => {
    if (activeTab === tabKey) return;
    setActiveTab(tabKey);

    // wait for DOM to render before tour step runs
    await new Promise((resolve) => requestAnimationFrame(resolve));
  };

  const steps = [
    {
      target: '[data-tour="header"]',
      title: "Discovery & Findings",
      content:
        "This page lets you review and compare Baseline Scan results with Enhanced AI Scan results for the selected job.",
      placement: "bottom",
    },
    {
      target: '[data-tour="jd-tabs"]',
      title: "Tabs Navigation",
      content:
        "Use these tabs to switch between Findings, Schema, Metadata, and Job Details.",
      placement: "bottom",
    },

    // Findings tab
    {
      target: '[data-tour="jd-tab-findings"]',
      title: "Findings Tab",
      content:
        "This tab shows the Baseline and Enhanced findings side by side for comparison.",
      placement: "bottom",
      beforeStep: async () => {
        await handleTabChange("findings");
      },
    },
    {
      target: '[data-tour="baseline"]',
      title: "Baseline Scan",
      content:
        "This section shows findings and type summary from the baseline scan.",
      placement: "top",
      beforeStep: async () => {
        await handleTabChange("findings");
      },
    },
    {
      target: '[data-tour="enhanced"]',
      title: "Enhanced Scan",
      content:
        "This section shows findings and type summary from the enhanced AI scan.",
      placement: "top",
      beforeStep: async () => {
        await handleTabChange("findings");
      },
    },
    {
      target: '[data-tour="compare-btn"]',
      title: "Compare Both Findings",
      content:
        "Use this button to compare Baseline and Enhanced findings in Delta or Combined view.",
      placement: "top",
      beforeStep: async () => {
        await handleTabChange("findings");
      },
    },

    // Schema tab
    {
      target: '[data-tour="jd-tab-schema"]',
      title: "Schema Tab",
      content:
        "Open this tab to review schema versions and compare schema changes.",
      placement: "bottom",
      beforeStep: async () => {
        await handleTabChange("schema");
      },
    },
    {
      target: '[data-tour="schema-section"]',
      title: "Schema Comparison",
      content:
        "This section shows OpenMetadata table versions and highlights column-level schema changes.",
      placement: "top",
      beforeStep: async () => {
        await handleTabChange("schema");
      },
    },

    // Metadata tab
    {
      target: '[data-tour="jd-tab-metadata"]',
      title: "Metadata Tab",
      content:
        "Open this tab to view field-level metadata and data catalog details.",
      placement: "bottom",
      beforeStep: async () => {
        await handleTabChange("metadata");
      },
    },
    {
      target: '[data-tour="metadata-section"]',
      title: "Field-level Metadata",
      content:
        "This section groups findings by table and column for governance and catalog review.",
      placement: "top",
      beforeStep: async () => {
        await handleTabChange("metadata");
      },
    },

    // Job details tab
    {
      target: '[data-tour="jd-tab-job-details"]',
      title: "Job Details Tab",
      content:
        "Open this tab to review the selected job details, configuration, and actions.",
      placement: "bottom",
      beforeStep: async () => {
        await handleTabChange("job-details");
      },
    },
    {
      target: '[data-tour="job-details-section"]',
      title: "Job Details",
      content:
        "This section shows the selected job information, status, config, and related job actions.",
      placement: "top",
      beforeStep: async () => {
        await handleTabChange("job-details");
      },
    },
  ];

  // -----------------------
  // UI tones
  // -----------------------
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

  const severityTone = (severity = "") => {
    const s = (severity || "").toLowerCase();
    if (s.includes("high"))
      return "border-red-300 bg-red-50 text-red-800 font-semibold";
    if (s.includes("medium"))
      return "border-yellow-300 bg-yellow-50 text-yellow-800 font-semibold";
    if (s.includes("low"))
      return "border-green-300 bg-green-50 text-green-800 font-semibold";
    return "border-gray-200 bg-gray-50 text-gray-700";
  };

  // -----------------------
  // Helpers
  // -----------------------
  const normalizeListResponse = useCallback((resData) => {
    let data = resData || [];
    if (data && typeof data === "object" && !Array.isArray(data)) {
      data = data.items || data.results || data.data || data.scans || [];
    }
    return Array.isArray(data) ? data : [];
  }, []);

  const normalizeAssetId = useCallback((value) => {
    if (value === null || value === undefined) return "";
    return String(value).trim();
  }, []);
  const extractDbNamesFromConfig = (cfg) => {
    const connectors = cfg?.connectors;
    const set = new Set();
    if (!Array.isArray(connectors)) return [];

    for (const c of connectors) {
      const db = (c?.database || "").toString().trim();
      if (db) set.add(db);
    }
    return Array.from(set);
  };

  const parseOmVersionJson = (s) => {
    if (!s) return null;
    try {
      return typeof s === "string" ? JSON.parse(s) : s;
    } catch {
      return null;
    }
  };

  const flattenColumns = (cols = [], prefix = "") => {
    const out = [];
    const list = Array.isArray(cols) ? cols : [];
    for (const c of list) {
      const name = c?.name ?? "";
      const key = prefix ? `${prefix}.${name}` : name;
      out.push({
        key,
        name,
        dataType: c?.dataType ?? "",
        dataTypeDisplay: c?.dataTypeDisplay ?? "",
        description: c?.description ?? "",
        constraint: c?.constraint ?? "",
        fullyQualifiedName: c?.fullyQualifiedName ?? "",
      });
      const children = Array.isArray(c?.children) ? c.children : [];
      if (children.length) out.push(...flattenColumns(children, key));
    }
    return out;
  };

  const computeSchemaDiff = (prev, next) => {
    const prevCols = flattenColumns(prev?.columns || []);
    const nextCols = flattenColumns(next?.columns || []);

    const index = (arr) => {
      const m = new Map();
      for (const c of arr) {
        const id = c.fullyQualifiedName || c.key;
        m.set(id, c);
      }
      return m;
    };

    const p = index(prevCols);
    const n = index(nextCols);

    const added = [];
    const removed = [];
    const changed = [];
    const modified = [];

    for (const [id, col] of n.entries()) {
      if (!p.has(id)) added.push(col);
      else {
        const old = p.get(id);
        const dtypeChanged =
          String(old?.dataType || "") !== String(col?.dataType || "") ||
          String(old?.dataTypeDisplay || "") !==
            String(col?.dataTypeDisplay || "");
        const descChanged =
          String(old?.description || "") !== String(col?.description || "");
        const constraintChanged =
          String(old?.constraint || "") !== String(col?.constraint || "");

        if (dtypeChanged) changed.push({ before: old, after: col });
        if (dtypeChanged || descChanged || constraintChanged) {
          modified.push({
            before: old,
            after: col,
            dtypeChanged,
            descChanged,
            constraintChanged,
          });
        }
      }
    }
    for (const [id, col] of p.entries()) {
      if (!n.has(id)) removed.push(col);
    }

    return { added, removed, changed, modified };
  };

  const fetchOmServiceTables = async (assetId) => {
    if (!assetId) return;
    setLoadingOmServiceTables(true);
    setOmError("");
    try {
      const url = `${assetsApiBase}/${encodeURIComponent(
        String(assetId),
      )}/openmetadata/service/tables`;
      if (OM_DEBUG)
        console.debug("[OpenMetadata] fetchOmServiceTables", { assetId, url });
      const res = await CustomAxios.get(url);
      const tables = Array.isArray(res?.data)
        ? res.data
        : res?.data?.data || [];
      setOmServiceTables(Array.isArray(tables) ? tables : []);
      if (
        !String(omTableId || "").trim() &&
        Array.isArray(tables) &&
        tables[0]?.id
      ) {
        setOmTableId(String(tables[0].id));
      }
    } catch (e) {
      console.error(
        "[OpenMetadata] fetch service tables error",
        e?.response || e?.message || e,
      );
      setOmServiceTables([]);
      setOmError("Failed to load OpenMetadata tables for service.");
    } finally {
      setLoadingOmServiceTables(false);
    }
  };

  const fetchOmTableVersionSnapshot = async (
    assetId,
    tableId,
    version,
    which,
  ) => {
    if (!assetId || !tableId || !version) return;
    if (which === "A") setLoadingOmSchemaA(true);
    else setLoadingOmSchemaB(true);
    setOmError("");
    try {
      const url = `${assetsApiBase}/${encodeURIComponent(
        String(assetId),
      )}/openmetadata/tables/${encodeURIComponent(
        String(tableId),
      )}/versions/${encodeURIComponent(String(version))}`;
      if (OM_DEBUG)
        console.debug("[OpenMetadata] fetchOmTableVersionSnapshot", {
          assetId,
          tableId,
          version,
          url,
          which,
        });
      const res = await CustomAxios.get(url);
      if (which === "A") setOmSchemaA(res.data || null);
      else setOmSchemaB(res.data || null);
    } catch (e) {
      console.error(
        "[OpenMetadata] fetch schema snapshot error",
        e?.response || e?.message || e,
      );
      if (which === "A") setOmSchemaA(null);
      else setOmSchemaB(null);
      setOmError("Failed to load OpenMetadata table schema snapshot.");
    } finally {
      if (which === "A") setLoadingOmSchemaA(false);
      else setLoadingOmSchemaB(false);
    }
  };

  const fetchAssetMeta = async (assetId) => {
    if (!assetId) return;
    try {
      const url = `${assetsApiBase}/${encodeURIComponent(String(assetId))}`;
      if (OM_DEBUG)
        console.debug("[OpenMetadata] fetchAssetMeta", { assetId, url });
      const res = await CustomAxios.get(url);
      setAssetMeta(res.data || null);
      const tables = Array.isArray(res?.data?.openMetadata?.tables)
        ? res.data.openMetadata.tables
        : [];
      if (tables.length && !omSelectedTable) setOmSelectedTable(tables[0]);
      const firstTableId =
        tables[0]?.id ||
        (res?.data?.openMetadata?.tableIds && res.data.openMetadata.tableIds[0])
          ? tables[0]?.id || res.data.openMetadata.tableIds[0]
          : "";
      if (firstTableId) setOmTableId(String(firstTableId));
    } catch (e) {
      console.error(
        "[OpenMetadata] fetch asset meta error",
        e?.response || e?.message || e,
      );
      setAssetMeta(null);
      setOmError("Failed to load asset OpenMetadata metadata.");
    }
  };

  const fetchOmTableVersions = async (assetId, tableId) => {
    if (!assetId || !tableId) return;
    setLoadingOmVersions(true);
    setOmError("");
    try {
      const url = `${assetsApiBase}/${encodeURIComponent(
        String(assetId),
      )}/openmetadata/tables/${encodeURIComponent(String(tableId))}/versions`;
      if (OM_DEBUG)
        console.debug("[OpenMetadata] fetchOmTableVersions", {
          assetId,
          tableId,
          url,
        });
      const res = await CustomAxios.get(url);
      setOmVersionsResp(res.data || null);
    } catch (e) {
      console.error(
        "[OpenMetadata] fetch OM versions error",
        e?.response || e?.message || e,
      );
      setOmVersionsResp(null);
      setOmError("Failed to load OpenMetadata table versions.");
    } finally {
      setLoadingOmVersions(false);
    }
  };

  // THIS IS COMBINED MODAL LOGIC
  // ✅ COMBINED MODAL LOGIC (ONLY: Type + Matched Text)
  const combinedSummary = useMemo(() => {
    const left = Array.isArray(results) ? results : [];
    const right = Array.isArray(aiResults) ? aiResults : [];

    // normalize text so "577) 493-3871" == "577 493-3871" etc.
    const normalizeMatch = (val) => {
      const s = String(val ?? "")
        .trim()
        .toLowerCase();

      // keep emails readable, but still normalize spaces
      if (s.includes("@")) return s.replace(/\s+/g, "");

      // phones / ids: remove all non-alphanumerics
      return s.replace(/[^a-z0-9]/g, "");
    };

    const normalizeType = (val) =>
      String(val ?? "")
        .trim()
        .toLowerCase();

    // ✅ KEY = type + matchedText ONLY
    const makeKey = (r) => {
      const type = normalizeType(r?.dtype || r?.type);
      const match = normalizeMatch(r?.matchedText || r?.matched);
      if (!type || !match) return "";
      return `${type}||${match}`;
    };

    const map = new Map();

    // add baseline
    for (const r of left) {
      const k = makeKey(r);
      if (!k) continue;

      map.set(k, {
        key: k,
        // keep display fields from baseline by default
        path: r.path || "—",
        dtype: r.dtype || r.type || "—",
        matchedText: r.matchedText || r.matched || "—",
        frameworks: Array.isArray(r.frameworks) ? r.frameworks : [],
        severity: r.severity || "—",
        baseline: true,
        enhanced: false,
      });
    }

    // add enhanced (merge if common)
    for (const r of right) {
      const k = makeKey(r);
      if (!k) continue;

      if (map.has(k)) {
        const cur = map.get(k);
        map.set(k, {
          ...cur,
          enhanced: true,
          // if baseline missing something, fill from enhanced
          path: cur.path && cur.path !== "—" ? cur.path : r.path || "—",
          dtype:
            cur.dtype && cur.dtype !== "—"
              ? cur.dtype
              : r.dtype || r.type || "—",
          matchedText:
            cur.matchedText && cur.matchedText !== "—"
              ? cur.matchedText
              : r.matchedText || r.matched || "—",
          frameworks: cur.frameworks?.length
            ? cur.frameworks
            : Array.isArray(r.frameworks)
              ? r.frameworks
              : [],
          severity:
            cur.severity && cur.severity !== "—"
              ? cur.severity
              : r.severity || "—",
        });
      } else {
        map.set(k, {
          key: k,
          path: r.path || "—",
          dtype: r.dtype || r.type || "—",
          matchedText: r.matchedText || r.matched || "—",
          frameworks: Array.isArray(r.frameworks) ? r.frameworks : [],
          severity: r.severity || "—",
          baseline: false,
          enhanced: true,
        });
      }
    }

    const rows = Array.from(map.values());

    return {
      rows,
      both: rows.filter((x) => x.baseline && x.enhanced),
      baselineOnly: rows.filter((x) => x.baseline && !x.enhanced),
      enhancedOnly: rows.filter((x) => !x.baseline && x.enhanced),
      total: rows.length,
    };
  }, [results, aiResults]);

  // THIS IS DELTA MODAL LOGIC
  // DELTA summary between baseline and enhanced

  const deltaSummary = useMemo(() => {
    const baselineMap = new Map(
      (aggregate || []).map((x) => [
        String(x.category || "Unknown"),
        Number(x.count || 0),
      ]),
    );

    const enhancedMap = new Map(
      (aiAggregate || []).map((x) => [
        String(x.category || "Unknown"),
        Number(x.count || 0),
      ]),
    );

    const allCats = Array.from(
      new Set([...baselineMap.keys(), ...enhancedMap.keys()]),
    ).filter(Boolean);

    const rows = allCats
      .map((cat) => {
        const baseline = baselineMap.get(cat) || 0;
        const enhanced = enhancedMap.get(cat) || 0;

        return {
          category: cat,
          baseline,
          enhanced,
          diff: enhanced - baseline,
          status:
            baseline > 0 && enhanced === 0
              ? "BaselineOnly"
              : enhanced > 0 && baseline === 0
                ? "EnhancedOnly"
                : baseline === enhanced
                  ? "Same"
                  : "Changed",
        };
      })
      .sort((a, b) => Math.abs(b.diff) - Math.abs(a.diff));

    return {
      rows,
      baselineOnly: rows.filter((r) => r.status === "BaselineOnly"),
      enhancedOnly: rows.filter((r) => r.status === "EnhancedOnly"),
      changed: rows.filter((r) => r.status === "Changed"),
      same: rows.filter((r) => r.status === "Same"),
    };
  }, [aggregate, aiAggregate]);

  // Stats for Baseline (from results) — PII/PHI + by-type + severity for graphs
  const baselineStats = useMemo(() => {
    const rows = Array.isArray(results) ? results : [];
    if (!rows.length) return null;

    let totalPII = 0;
    let totalPHI = 0;
    const severityMap = {};
    const dtypeMap = {};

    rows.forEach((row) => {
      const type = row?.dtype || row?.type || "Unknown";
      const severity = row?.severity || "Unknown";
      severityMap[severity] = (severityMap[severity] || 0) + 1;
      dtypeMap[type] = (dtypeMap[type] || 0) + 1;
      if (isPHIType(type)) totalPHI += 1;
      else totalPII += 1;
    });

    const totalFindings = rows.length;
    const totalSensitive = totalPII + totalPHI;
    const piiPhiBars = [
      { name: "PII", count: totalPII },
      { name: "PHI", count: totalPHI },
    ];
    const dtypes = Object.entries(dtypeMap)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
    const severity = Object.entries(severityMap).map(([name, value]) => ({
      name,
      value,
    }));

    return {
      totalFindings,
      totalPII,
      totalPHI,
      totalSensitive,
      piiPhiBars,
      dtypes,
      severity,
    };
  }, [results]);

  // Stats for Enhanced/AI (from aiResults) — same shape for graphs
  const enhancedStats = useMemo(() => {
    const rows = Array.isArray(aiResults) ? aiResults : [];
    if (!rows.length) return null;

    let totalPII = 0;
    let totalPHI = 0;
    const severityMap = {};
    const dtypeMap = {};

    rows.forEach((row) => {
      const type = row?.dtype || row?.type || "Unknown";
      const severity = row?.severity || "Unknown";
      severityMap[severity] = (severityMap[severity] || 0) + 1;
      dtypeMap[type] = (dtypeMap[type] || 0) + 1;
      if (isPHIType(type)) totalPHI += 1;
      else totalPII += 1;
    });

    const totalFindings = rows.length;
    const totalSensitive = totalPII + totalPHI;
    const piiPhiBars = [
      { name: "PII", count: totalPII },
      { name: "PHI", count: totalPHI },
    ];
    const dtypes = Object.entries(dtypeMap)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
    const severity = Object.entries(severityMap).map(([name, value]) => ({
      name,
      value,
    }));

    return {
      totalFindings,
      totalPII,
      totalPHI,
      totalSensitive,
      piiPhiBars,
      dtypes,
      severity,
    };
  }, [aiResults]);

  // Field-level metadata: group findings by table and field for catalog view
  const fieldLevelMetadata = useMemo(() => {
    const allFindings = [
      ...(Array.isArray(results) ? results : []).map((r) => ({
        ...r,
        origin: "Baseline",
      })),
      ...(Array.isArray(aiResults) ? aiResults : []).map((r) => ({
        ...r,
        origin: "Enhanced",
      })),
    ];
    if (!allFindings.length)
      return { tables: [], totalFields: 0, totalFindings: 0 };

    const deriveTableKey = (f) => {
      const path = (f.path || "").toString().trim();
      if (path.includes(".") && !path.includes("\\") && !path.includes("/")) {
        const parts = path.split(".");
        return parts.length >= 2
          ? parts[parts.length - 2]
          : parts[0] || "default";
      }
      if (path) {
        const base = path.replace(/\\/g, "/").split("/").pop() || path;
        return (base.split(".")[0] || "file_findings").slice(0, 64);
      }
      return (f.source || "default").slice(0, 64);
    };

    const tableMap = new Map();
    for (const f of allFindings) {
      const tableKey = deriveTableKey(f);
      if (!tableMap.has(tableKey)) {
        tableMap.set(tableKey, new Map());
      }
      const fieldKey =
        (f.tag || f.path || "value")
          .replace(/[^a-zA-Z0-9_.-]/g, "_")
          .slice(0, 128) || "value";
      const fieldMap = tableMap.get(tableKey);
      if (!fieldMap.has(fieldKey)) {
        fieldMap.set(fieldKey, {
          fieldName: fieldKey,
          path: f.path || "—",
          dtypes: new Set(),
          frameworks: new Set(),
          severities: new Set(),
          samples: [],
          meta: {},
          count: 0,
          origins: new Set(),
        });
      }
      const row = fieldMap.get(fieldKey);
      if (f.dtype || f.type) row.dtypes.add(f.dtype || f.type);
      (f.frameworks || []).forEach((fw) => row.frameworks.add(fw));
      if (f.severity) row.severities.add(f.severity);
      if (f.matchedText || f.matched)
        row.samples.push(f.matchedText || f.matched);
      if (f.meta && typeof f.meta === "object") Object.assign(row.meta, f.meta);
      row.count += 1;
      if (f.origin) row.origins.add(f.origin);
    }

    const tables = [];
    let totalFields = 0;
    for (const [tableName, fieldMap] of tableMap) {
      const fields = Array.from(fieldMap.values()).map((row) => ({
        fieldName: row.fieldName,
        path: row.path,
        dtypes: [...row.dtypes],
        frameworks: [...row.frameworks],
        severities: [...row.severities],
        samples: row.samples.slice(0, 5),
        meta: row.meta,
        count: row.count,
        origins: [...row.origins],
      }));
      totalFields += fields.length;
      tables.push({
        tableName,
        fields,
        totalFindings: fields.reduce((s, f) => s + f.count, 0),
      });
    }
    tables.sort((a, b) => b.totalFindings - a.totalFindings);

    return {
      tables,
      totalFields,
      totalFindings: allFindings.length,
    };
  }, [results, aiResults]);

  // Expand first table when field-level metadata loads
  useEffect(() => {
    const tables = fieldLevelMetadata?.tables || [];
    if (tables.length > 0) {
      setExpandedMetadataTables((prev) => {
        if (prev.size > 0) return prev;
        return new Set([tables[0].tableName]);
      });
    }
  }, [fieldLevelMetadata?.tables?.length]);

  const getDbFromFilePath = (filePath) => {
    const s = (filePath || "").toString();
    const idx = s.indexOf(".");
    return idx > 0 ? s.slice(0, idx) : "";
  };

  // const getAssetIdFrom = useCallback(
  //   (obj) => normalizeAssetId(obj?.assetId || obj?.asset_id),
  //   [normalizeAssetId],
  // );

  const getJobIdFrom = useCallback(
    (obj) => normalizeAssetId(obj?.job_id || obj?.jobId),
    [normalizeAssetId],
  );

  // const selectedAssetId = useMemo(
  //   () =>
  //     getAssetIdFrom(jobDetails) ||
  //     getAssetIdFrom(selectedJob) ||
  //     getAssetIdFrom(configObj),
  //   [getAssetIdFrom, jobDetails, selectedJob, configObj],
  // );

  const selectedAssetId = useMemo(() => {
    // most common shapes
    return (
      normalizeAssetId(jobDetails?.asset_id) ||
      normalizeAssetId(jobDetails?.assetId) ||
      normalizeAssetId(selectedJob?.asset_id) ||
      normalizeAssetId(selectedJob?.assetId) ||
      normalizeAssetId(configObj?.asset_id) ||
      normalizeAssetId(configObj?.assetId) ||
      ""
    );
  }, [jobDetails, selectedJob, configObj, normalizeAssetId]);

  // Auto-load OpenMetadata versions when we have asset + table (e.g. on page load after asset meta loads)
  useEffect(() => {
    if (!selectedAssetId || !String(omTableId || "").trim()) return;
    fetchOmTableVersions(selectedAssetId, omTableId);
  }, [selectedAssetId, omTableId]);

  // Load tables for the OpenMetadata service linked to this asset
  useEffect(() => {
    if (!selectedAssetId) return;
    fetchOmServiceTables(selectedAssetId);
  }, [selectedAssetId]);

  // Default version selection + load schema snapshots
  useEffect(() => {
    const versions = Array.isArray(omVersionsResp?.versions)
      ? omVersionsResp.versions
      : [];
    const parsed = versions
      .map(parseOmVersionJson)
      .filter(Boolean)
      .sort((a, b) => (a?.version ?? 0) - (b?.version ?? 0));

    const latest = parsed[parsed.length - 1] || null;
    const prev = parsed[parsed.length - 2] || null;

    // Initialize Version A to latest if empty
    if (!String(omVersionA || "").trim() && latest?.version !== undefined) {
      setOmVersionA(String(latest.version));
    }

    // Auto-mode: keep Version B as previous of A (when possible)
    if (omCompareMode === "auto") {
      const aVer = String(omVersionA || latest?.version || "").trim();
      if (aVer) {
        const idx = parsed.findIndex((x) => String(x?.version) === aVer);
        const prevOfA = idx > 0 ? parsed[idx - 1] : prev;
        const bVer =
          prevOfA?.version !== undefined ? String(prevOfA.version) : "";
        if (String(omVersionB || "") !== bVer) setOmVersionB(bVer);
      } else if (prev?.version !== undefined) {
        setOmVersionB(String(prev.version));
      }
    } else {
      // Manual mode: prefill B if empty
      if (!String(omVersionB || "").trim() && prev?.version !== undefined) {
        setOmVersionB(String(prev.version));
      }
    }
  }, [omVersionsResp, omCompareMode, omVersionA, omVersionB]);

  useEffect(() => {
    if (
      !selectedAssetId ||
      !String(omTableId || "").trim() ||
      !String(omVersionA || "").trim()
    )
      return;
    fetchOmTableVersionSnapshot(selectedAssetId, omTableId, omVersionA, "A");
  }, [selectedAssetId, omTableId, omVersionA]);

  useEffect(() => {
    if (
      !selectedAssetId ||
      !String(omTableId || "").trim() ||
      !String(omVersionB || "").trim()
    )
      return;
    fetchOmTableVersionSnapshot(selectedAssetId, omTableId, omVersionB, "B");
  }, [selectedAssetId, omTableId, omVersionB]);

  const selectedJobId = useMemo(() => {
    if (!jobId) return "";
    return String(jobId).trim();
  }, [jobId]);

  const downloadJson = (obj, filename = "config.json") => {
    const url = URL.createObjectURL(
      new Blob([JSON.stringify(obj, null, 2)], { type: "application/json" }),
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const copyJson = async (obj) => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(obj, null, 2));
    } catch {}
  };

  const onCsvFile = (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setCsvText(String(reader.result || ""));
    reader.readAsText(file);
  };

  // -----------------------
  // Pagination helpers (same vibe as reference)
  // -----------------------
  const clamp = (n, min, max) => Math.max(min, Math.min(max, n));

  const paginate = (data, page, pageSize) => {
    const total = Array.isArray(data) ? data.length : 0;
    const safePageSize = Math.max(1, Number(pageSize) || 10);
    const totalPages = Math.max(1, Math.ceil(total / safePageSize));
    const safePage = clamp(Number(page) || 1, 1, totalPages);

    const startIdx = (safePage - 1) * safePageSize;
    const endIdx = Math.min(startIdx + safePageSize, total);

    return {
      pageData: (data || []).slice(startIdx, endIdx),
      total,
      totalPages,
      page: safePage,
      startIdx,
      endIdx,
      pageSize: safePageSize,
    };
  };

  const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

  // Left table pagination
  const [leftPage, setLeftPage] = useState(1);
  const [leftPageSize, setLeftPageSize] = useState(10);

  // Right table pagination
  const [rightPage, setRightPage] = useState(1);
  const [rightPageSize, setRightPageSize] = useState(10);

  // if data shrinks, keep page valid
  useEffect(() => {
    const totalPages = Math.max(
      1,
      Math.ceil((results?.length || 0) / leftPageSize),
    );
    if (leftPage > totalPages) setLeftPage(1);
  }, [results?.length, leftPageSize, leftPage]);

  useEffect(() => {
    const totalPages = Math.max(
      1,
      Math.ceil((aiResults?.length || 0) / rightPageSize),
    );
    if (rightPage > totalPages) setRightPage(1);
  }, [aiResults?.length, rightPageSize, rightPage]);

  // -----------------------
  // Left fetchers (current)
  // -----------------------
  const fetchDetails = async (id) => {
    setLoadingDetails(true);
    setError("");
    try {
      const res = await CustomAxios.get(`${apiBase}/${id}`);
      setSelectedJob(res.data || null);
      setJobDetails(res.data || null);
      const assetId = normalizeAssetId(
        res?.data?.assetId || res?.data?.asset_id,
      );
      if (OM_DEBUG)
        console.debug("[OpenMetadata] job details loaded", {
          jobId: id,
          assetId,
        });
      if (assetId) {
        fetchAssetMeta(assetId);
        fetchOmServiceTables(assetId);
      }
    } catch (err) {
      console.error("Fetch details error:", err);
      setSelectedJob(null);
      setJobDetails(null);
      setError("Failed to load job details.");
    } finally {
      setLoadingDetails(false);
    }
  };

  const fetchResults = async (id) => {
    setLoadingResults(true);
    try {
      const res = await CustomAxios.get(`${apiBase}/${id}/results?limit=300`);
      setResults(normalizeListResponse(res.data));
      setLeftPage(1);
    } catch (err) {
      console.error("Fetch results error:", err);
      setResults([]);
    } finally {
      setLoadingResults(false);
    }
  };

  const fetchAggregate = async (id) => {
    setLoadingAggregate(true);
    try {
      const res = await CustomAxios.get(
        `${apiBase}/${id}/aggregate/categories`,
      );
      setAggregate(res.data || []);
    } catch (err) {
      console.error("Fetch aggregate error:", err);
      setAggregate([]);
    } finally {
      setLoadingAggregate(false);
    }
  };

  const fetchConfig = async (id) => {
    setLoadingConfig(true);
    try {
      const res = await CustomAxios.get(`${apiBase}/${id}/config`);
      setConfigObj(res.data || {});
    } catch (err) {
      console.error("Fetch config error:", err);
      setConfigObj(null);
    } finally {
      setLoadingConfig(false);
    }
  };

  // -----------------------
  // Left actions (current)
  // -----------------------
  const rerunJob = async () => {
    if (!selectedJob) return;
    setActing(true);
    try {
      const id = selectedJob._id || selectedJob.id;
      const assetId = selectedAssetId;

      // Trigger OpenMetadata metadata pipeline (if job is linked to an asset)
      if (assetId) {
        try {
          const url = `${assetsApiBase}/${encodeURIComponent(
            String(assetId),
          )}/openmetadata/trigger`;
          console.debug("[OpenMetadata] trigger pipeline from UI", {
            assetId,
            url,
          });
          await CustomAxios.post(url);
        } catch (err) {
          console.error(
            "OpenMetadata trigger error:",
            err?.response || err?.message || err,
          );
          // keep existing rerun behavior even if OpenMetadata trigger fails
          setError(
            "OpenMetadata pipeline trigger failed (scan re-run will continue).",
          );
        }
      }

      await CustomAxios.post(`${apiBase}/${id}/rerun`, {
        name: `${selectedJob.name || "scan"} (rerun)`,
      });
      await fetchDetails(id);
    } catch (e) {
      console.error("rerun error", e);
      setError("Failed to rerun job.");
    } finally {
      setActing(false);
    }
  };

  const cancelJob = async () => {
    if (!selectedJob) return;
    const st = (selectedJob.status || "").toLowerCase();
    if (st !== "queued") return;
    setActing(true);
    try {
      const id = selectedJob._id || selectedJob.id;
      await CustomAxios.post(`${apiBase}/${id}/cancel`);
      await fetchDetails(id);
    } catch (e) {
      console.error("cancel error", e);
      setError("Failed to cancel job.");
    } finally {
      setActing(false);
    }
  };

  const ingestCsv = async () => {
    if (!selectedJob) return;
    const id = selectedJob._id || selectedJob.id;
    if (!csvText.trim()) return;
    setIngesting(true);
    try {
      await CustomAxios.post(`${apiBase}/${id}/ingest`, { csv: csvText });
      await Promise.all([
        fetchDetails(id),
        fetchResults(id),
        fetchAggregate(id),
      ]);
    } catch (err) {
      console.error("Ingest CSV error:", err?.response || err?.message || err);
      setError("Failed to ingest CSV.");
    } finally {
      setIngesting(false);
    }
  };

  // -----------------------
  // AI adapters (same idea as reference)
  // -----------------------

  const adaptAiFindings = useCallback((scan) => {
    const findings = Array.isArray(scan?.findings) ? scan.findings : [];
    return findings.map((f, idx) => ({
      _id: `${scan?.scan_id || scan?.scanId || scan?.scanID || "scan"}-${idx}`,
      path: f.file_path || "—",
      source: scan?.source_name || scan?.source_type || "AI Service",
      tag: "—",
      line: "—",
      dtype: f.pii_type || "—",
      matchedText: f.matched_text || "—",
      frameworks:
        typeof f.frameworks === "string"
          ? f.frameworks
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean)
          : Array.isArray(f.frameworks)
            ? f.frameworks
            : [],
      severity: String(f?.severity ?? "").trim() || "—",
      weight: "—",
    }));
  }, []);

  // IMPORTANT: You said AI Type Summary isn't fetched yet, we compute it from AI findings
  const aggregateFromAiFindings = useCallback((scan) => {
    const findings = Array.isArray(scan?.findings) ? scan.findings : [];
    const map = new Map();
    for (const f of findings) {
      const k = f.pii_type || "Unknown";
      map.set(k, (map.get(k) || 0) + 1);
    }
    return Array.from(map.entries())
      .map(([category, count]) => ({ category, count }))
      .sort((a, b) => b.count - a.count);
  }, []);

  // -----------------------
  // Fetcher (right/AI)
  // -----------------------
  const fetchAiScan = useCallback(
    async (sid) => {
      //   if (!sid) return;
      if (!selectedJobId) return;

      if (!aiFindingsUrl) return;

      setLoadingAiResults(true);
      setLoadingAiAggregate(true);

      try {
        // If your AI endpoint later becomes /${initURL}/finding-ai/:scanId,
        // change this to CustomAxios.get(`${aiFindingsUrl}/${sid}`)
        // For now, we keep it identical to the reference: GET /${initURL}/finding-ai
        const res = await CustomAxios.get(aiFindingsUrl);
        const data = res.data || null;
        console.log("AI scan fetch", { data });
        let scan = null;

        const scans = normalizeListResponse(data);

        // Pick the ONE scan with matching asset_id
        // scan = scans.find((s) => getAssetIdFrom(s) === selectedAssetId) || null;
        scan = scans.find((s) => getJobIdFrom(s) === selectedJobId) || null;

        console.log("AI match check", {
          selectedJobId,
          scanJobIds: scans.slice(0, 10).map((s) => s?.job_id),
        });

        // Only show AI findings when we can match by asset id
        // if (selectedAssetId && scans.length > 0) {
        //   scan =
        //     scans.find((s) => getAssetIdFrom(s) === selectedAssetId) || null;
        // } else if (
        //   selectedAssetId &&
        //   data &&
        //   typeof data === "object" &&
        //   !Array.isArray(data)
        // ) {
        //   // If backend ever returns a single scan object instead of a list
        //   scan = getAssetIdFrom(data) === selectedAssetId ? data : null;
        // } else {
        //   scan = null;
        // }

        // if (
        //   selectedAssetId &&
        //   scan &&
        //   getAssetIdFrom(scan) &&
        //   getAssetIdFrom(scan) !== selectedAssetId
        // ) {
        //   scan = null;
        // }

        const aiFindings = adaptAiFindings(scan);

        let filtered = aiFindings;

        if (aiDbMode === "various") {
          const allowed = new Set(
            (assetDbNames || [])
              .map((d) => String(d).trim().toLowerCase())
              .filter(Boolean),
          );

          if (allowed.size === 0) {
            // nothing selected => treat as show all
            filtered = aiFindings;
            setNoDbFound(false);
          } else {
            filtered = aiFindings.filter((row) => {
              const db = getDbFromFilePath(row.path).trim().toLowerCase();
              return db && allowed.has(db);
            });
            setNoDbFound(filtered.length === 0);
          }
        } else {
          setNoDbFound(false);
        }

        setAiResults(filtered);

        // recompute aggregate from filtered findings
        const aggMap = new Map();
        for (const r of filtered) {
          const k = r.dtype || "Unknown";
          aggMap.set(k, (aggMap.get(k) || 0) + 1);
        }
        setAiAggregate(
          Array.from(aggMap.entries())
            .map(([category, count]) => ({ category, count }))
            .sort((a, b) => b.count - a.count),
        );

        setRightPage(1);

        setRightPage(1);
      } catch (err) {
        console.error("Fetch AI scan error:", err?.response || err);
        setAiResults([]);
        setAiAggregate([]);
      } finally {
        setLoadingAiResults(false);
        setLoadingAiAggregate(false);
      }
    },
    [
      aiFindingsUrl,
      adaptAiFindings,
      normalizeListResponse,
      aiDbMode,
      assetDbNames,
      selectedJobId,
      getJobIdFrom,
      getDbFromFilePath,
    ],
  );

  // -----------------------
  // derive scanId from selectedJob/jobDetails/configObj (like reference)
  // -----------------------
  useEffect(() => {
    const sid =
      selectedJob?.scan_id ||
      selectedJob?.scanId ||
      jobDetails?.scan_id ||
      jobDetails?.scanId ||
      configObj?.scan_id ||
      configObj?.scanId ||
      "";
    setScanId(sid);
  }, [selectedJob, jobDetails, configObj]);
  // useEffect(() => {
  //   if (!selectedAssetId) return;

  //   // defaults
  //   let mode = "fetch";
  //   let dbs = [];

  //   try {
  //     // ✅ read mode from Assets page selection
  //     const rawMode = localStorage.getItem(`df_asset_dbmode_${selectedAssetId}`);
  //     if (rawMode === "fetch" || rawMode === "various") mode = rawMode;

  //     // ✅ read db names if saved
  //     const raw = localStorage.getItem(`df_asset_dbnames_${selectedAssetId}`);
  //     if (raw) dbs = JSON.parse(raw) || [];
  //   } catch {}

  //   // fallback: from job config connectors if no dbs saved
  //   if (!dbs.length) {
  //     dbs = extractDbNamesFromConfig(configObj);
  //   }

  //   setAiDbMode(mode);
  //   setAssetDbNames(Array.isArray(dbs) ? dbs : []);
  // }, [selectedAssetId, configObj]);
  useEffect(() => {
    if (!selectedAssetId) return;

    let mode = "fetch";
    let dbs = [];

    try {
      const rawMode = localStorage.getItem(
        `df_asset_dbmode_${selectedAssetId}`,
      );
      if (rawMode === "fetch" || rawMode === "various") mode = rawMode;

      const raw = localStorage.getItem(`df_asset_dbnames_${selectedAssetId}`);
      if (raw) dbs = JSON.parse(raw) || [];
    } catch {}

    // fallback only if nothing saved
    if (!dbs.length) {
      dbs = extractDbNamesFromConfig(configObj);
    }

    setAiDbMode(mode);
    setAssetDbNames(Array.isArray(dbs) ? dbs : []);
  }, [selectedAssetId, configObj]);

  // whenever scanId changes, load AI scan (silent)
  useEffect(() => {
    if (!selectedJobId) return;
    fetchAiScan("job-match");
  }, [selectedJobId, aiDbMode, assetDbNames, selectedAssetId]);

  // -----------------------
  // initial load (left side)
  // -----------------------
  useEffect(() => {
    if (!jobId) return;
    fetchDetails(jobId);
    fetchResults(jobId);
    fetchAggregate(jobId);
    fetchConfig(jobId);
  }, [jobId]);

  // -----------------------
  // UI blocks (similar to reference)
  // -----------------------
  const JobSummaryCard = ({ title, value, icon, onClick }) => {
    const isClickable = typeof onClick === "function";
    const Wrapper = isClickable ? "button" : "div";
    return (
      <Wrapper
        type={isClickable ? "button" : undefined}
        onClick={onClick}
        className={`rounded-xl border border-[#2B245C]/20 bg-white p-3 shadow-sm transition text-left w-full ${
          isClickable
            ? "cursor-pointer hover:shadow-md hover:border-[#2B245C]/40 hover:ring-2 hover:ring-[#2B245C]/20 focus:outline-none focus:ring-2 focus:ring-[#2B245C]/40"
            : "hover:shadow"
        }`}
        title={isClickable ? `Scroll to ${title} table` : undefined}
      >
        <div className="flex items-center justify-between gap-2">
          <div>
            <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">
              {title}
            </div>
            <div className="text-lg font-bold text-[#2B245C]">{value ?? 0}</div>
          </div>
          {icon && (
            <div className="h-9 w-9 rounded-lg bg-[#2B245C]/10 text-[#2B245C] flex items-center justify-center shrink-0">
              {icon}
            </div>
          )}
        </div>
      </Wrapper>
    );
  };

  const DetailsSkeleton = () => (
    <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm animate-pulse">
      <div className="h-6 w-32 rounded bg-gray-200 mb-3" />
      <div className="h-24 w-full rounded bg-gray-100" />
    </div>
  );

  const PaginationBar = ({
    total,
    page,
    totalPages,
    pageSize,
    onPageChange,
    onPageSizeChange,
  }) => {
    const start = total === 0 ? 0 : (page - 1) * pageSize + 1;
    const end = total === 0 ? 0 : Math.min(page * pageSize, total);

    return (
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mb-3">
        <div className="text-sm text-gray-600">
          Showing <span className="font-semibold">{start}</span>–{" "}
          <span className="font-semibold">{end}</span> of{" "}
          <span className="font-semibold">{total}</span>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-600">Rows:</label>
          <select
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            className="rounded-lg border border-gray-300 bg-white px-2 py-1 text-sm"
          >
            {PAGE_SIZE_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>

          <button
            onClick={() => onPageChange(1)}
            disabled={page <= 1}
            className="rounded-lg border border-blue-500 bg-blue-100 px-2 py-1 text-sm hover:bg-blue-200 disabled:opacity-50"
          >
            « First
          </button>
          <button
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1}
            className="rounded-lg border border-blue-500 bg-blue-50 px-2 py-1 text-sm hover:bg-blue-100 disabled:opacity-50"
          >
            ‹ Prev
          </button>

          <div className="text-sm text-gray-700">
            Page <span className="font-semibold">{page}</span> /{" "}
            <span className="font-semibold">{totalPages}</span>
          </div>

          <button
            onClick={() => onPageChange(page + 1)}
            disabled={page >= totalPages}
            className="rounded-lg border border-blue-500 bg-blue-50 px-2 py-1 text-sm hover:bg-blue-100 disabled:opacity-50"
          >
            Next ›
          </button>
          <button
            onClick={() => onPageChange(totalPages)}
            disabled={page >= totalPages}
            className="rounded-lg border border-blue-500 bg-blue-100 px-2 py-1 text-sm hover:bg-blue-200 disabled:opacity-50"
          >
            Last »
          </button>
        </div>
      </div>
    );
  };

  const CompareModal = ({ open, onClose }) => {
    if (!open) return null;

    const chipClass = (status) => {
      if (status === "BaselineOnly")
        return "border-amber-200 bg-amber-50 text-amber-800";
      if (status === "EnhancedOnly")
        return "border-indigo-200 bg-indigo-50 text-indigo-800";
      if (status === "Changed")
        return "border-blue-200 bg-blue-50 text-blue-800";
      return "border-gray-200 bg-gray-50 text-gray-700";
    };

    const closeAll = () => {
      setCompareStep(null);
      onClose();
    };

    return (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center px-4">
        {/* backdrop */}
        <div className="absolute inset-0 bg-black/50" onClick={closeAll} />

        {/* modal */}
        <div className="relative w-full max-w-3xl overflow-hidden rounded-2xl bg-white shadow-2xl border border-[#2B245C]">
          {/* HEADER BAR */}
          <div className="flex items-start justify-between gap-3 bg-[#2B245C] px-6 py-4">
            <div>
              <h3 className="text-lg sm:text-xl font-semibold text-white">
                {compareStep === "delta" ? "Delta Comparison" : "Combine Scan"}
              </h3>
              <p className="text-xs sm:text-sm text-white/80 mt-1">
                {BASELINE_LABEL} <span className="mx-1">vs</span>{" "}
                {ENHANCED_LABEL}
              </p>
            </div>

            <div className="flex items-center gap-2">
              {/* {compareStep === "combined" && (
                <button
                  onClick={() => setCompareStep("menu")}
                  className="rounded-lg bg-white/10 px-3 py-1.5 text-sm text-white hover:bg-white/20"
                >
                  ← Back
                </button>
              )} */}

              {/* Back button should appear for BOTH delta & combined */}
              {compareStep !== "menu" && (
                <button
                  onClick={() => setCompareStep("menu")}
                  className="rounded-lg bg-white/10 px-3 py-1.5 text-sm text-white hover:bg-white/20"
                >
                  ← Back
                </button>
              )}

              <button
                onClick={closeAll}
                className="rounded-lg bg-white px-3 py-1.5 text-sm font-semibold text-[#2B245C] hover:bg-gray-100"
              >
                ✕
              </button>
            </div>
          </div>

          {/* BODY */}
          <div className="p-6 max-h-[70vh] overflow-y-auto">
            {/* MENU */}
            {compareStep === "menu" && (
              <>
                <div className="mb-4 text-sm text-gray-600">
                  Choose how you want to compare results.
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <button
                    onClick={() => setCompareStep("delta")}
                    className="group rounded-2xl border border-[#2B245C] bg-white p-5 text-left shadow-sm hover:shadow-md transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <div className="text-base font-semibold text-[#2B245C]">
                        Delta
                      </div>
                      <span className="rounded-full bg-[#2B245C] px-3 py-1 text-xs font-semibold text-white">
                        Recommended
                      </span>
                    </div>
                    <div className="mt-2 text-sm text-gray-600">
                      See what changed between Baseline and Enhanced type
                      summary.
                    </div>
                  </button>

                  <button
                    onClick={() => setCompareStep("combined")}
                    className="group rounded-2xl border border-gray-200 bg-gray-50 p-5 text-left shadow-sm hover:shadow-md hover:bg-white transition-all"
                  >
                    <div className="text-base font-semibold text-gray-900">
                      Combined
                    </div>
                    <div className="mt-2 text-sm text-gray-600">
                      View a merged report with duplicates removed.
                    </div>
                  </button>
                </div>
              </>
            )}
            {/* DELTA */}
            {compareStep === "delta" && (
              <div className="space-y-4">
                {/* delta counters */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="rounded-xl border border-amber-200 bg-amber-50 p-3">
                    <div className="text-xs font-semibold text-amber-800">
                      Only in {BASELINE_LABEL}
                    </div>
                    <div className="text-xl font-bold text-amber-900">
                      {deltaSummary.baselineOnly.length}
                    </div>
                  </div>

                  <div className="rounded-xl border border-indigo-200 bg-indigo-50 p-3">
                    <div className="text-xs font-semibold text-indigo-800">
                      Only in {ENHANCED_LABEL}
                    </div>
                    <div className="text-xl font-bold text-indigo-900">
                      {deltaSummary.enhancedOnly.length}
                    </div>
                  </div>

                  <div className="rounded-xl border border-blue-200 bg-blue-50 p-3">
                    <div className="text-xs font-semibold text-blue-800">
                      Count differs
                    </div>
                    <div className="text-xl font-bold text-blue-900">
                      {deltaSummary.changed.length}
                    </div>
                  </div>

                  <div className="rounded-xl border border-gray-200 bg-gray-50 p-3">
                    <div className="text-xs font-semibold text-gray-700">
                      Same
                    </div>
                    <div className="text-xl font-bold text-gray-900">
                      {deltaSummary.same.length}
                    </div>
                  </div>
                </div>

                {/* delta table */}
                <div className="overflow-x-auto rounded-xl border border-gray-200">
                  <table className="min-w-full text-sm">
                    <thead className="bg-[#2B245C] text-white">
                      <tr>
                        <th className="px-4 py-2 text-left">Type</th>
                        <th className="px-4 py-2 text-center">
                          {BASELINE_LABEL}
                        </th>
                        <th className="px-4 py-2 text-center">
                          {ENHANCED_LABEL}
                        </th>
                        <th className="px-4 py-2 text-center">Δ</th>
                        <th className="px-4 py-2 text-center">Status</th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-gray-100">
                      {deltaSummary.rows.map((r) => (
                        <tr key={r.category} className="hover:bg-gray-50">
                          <td className="px-4 py-2 font-medium text-gray-900">
                            {r.category}
                          </td>
                          <td className="px-4 py-2 text-center">
                            {r.baseline}
                          </td>
                          <td className="px-4 py-2 text-center">
                            {r.enhanced}
                          </td>
                          <td className="px-4 py-2 text-center font-semibold">
                            {r.diff > 0 ? `+${r.diff}` : r.diff}
                          </td>
                          <td className="px-4 py-2 text-center">
                            <span
                              className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs ${
                                r.status === "BaselineOnly"
                                  ? "border-amber-200 bg-amber-50 text-amber-800"
                                  : r.status === "EnhancedOnly"
                                    ? "border-indigo-200 bg-indigo-50 text-indigo-800"
                                    : r.status === "Changed"
                                      ? "border-blue-200 bg-blue-50 text-blue-800"
                                      : "border-gray-200 bg-gray-50 text-gray-700"
                              }`}
                            >
                              {r.status === "BaselineOnly"
                                ? `Only in ${BASELINE_LABEL}`
                                : r.status === "EnhancedOnly"
                                  ? `Only in ${ENHANCED_LABEL}`
                                  : r.status === "Changed"
                                    ? "Count differs"
                                    : "Same"}
                            </span>
                          </td>
                        </tr>
                      ))}

                      {!deltaSummary.rows.length && (
                        <tr>
                          <td
                            colSpan={5}
                            className="px-4 py-6 text-center text-gray-600"
                          >
                            No delta to show.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* COMBINED */}
            {/* ✅ COMBINED (FULL UPDATED) */}

            {compareStep === "combined" && (
              <div className="space-y-4">
                {/* ✅ counters */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3">
                    <div className="text-xs font-semibold text-emerald-800">
                      Common in both
                    </div>
                    <div className="text-xl font-bold text-emerald-900">
                      {combinedSummary.both.length}
                    </div>
                  </div>

                  <div className="rounded-xl border border-amber-200 bg-amber-50 p-3">
                    <div className="text-xs font-semibold text-amber-800">
                      Only in {BASELINE_LABEL}
                    </div>
                    <div className="text-xl font-bold text-amber-900">
                      {combinedSummary.baselineOnly.length}
                    </div>
                  </div>

                  <div className="rounded-xl border border-indigo-200 bg-indigo-50 p-3">
                    <div className="text-xs font-semibold text-indigo-800">
                      Only in {ENHANCED_LABEL}
                    </div>
                    <div className="text-xl font-bold text-indigo-900">
                      {combinedSummary.enhancedOnly.length}
                    </div>
                  </div>
                </div>

                {/* ✅ merged combined table */}
                <div className="overflow-x-auto rounded-xl border border-gray-200">
                  <table className="min-w-full text-sm">
                    <thead className="bg-[#2B245C] text-white">
                      <tr>
                        {/* ✅ FIRST COLUMN: Belongs To */}
                        <th className="px-4 py-2 text-center whitespace-nowrap">
                          Belongs To
                        </th>

                        <th className="px-4 py-2 text-left whitespace-nowrap">
                          Path
                        </th>
                        <th className="px-4 py-2 text-left whitespace-nowrap">
                          Type
                        </th>
                        <th className="px-4 py-2 text-left whitespace-nowrap">
                          Matched Text
                        </th>

                        {/* optional, keep if you want */}
                        <th className="px-4 py-2 text-center whitespace-nowrap">
                          Origin
                        </th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-gray-100">
                      {combinedSummary.rows.map((r) => {
                        // ✅ origin (for chip)
                        const origin =
                          r.baseline && r.enhanced
                            ? "Both"
                            : r.baseline
                              ? BASELINE_LABEL
                              : ENHANCED_LABEL;

                        const originClass =
                          r.baseline && r.enhanced
                            ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                            : r.baseline
                              ? "border-amber-200 bg-amber-50 text-amber-800"
                              : "border-indigo-200 bg-indigo-50 text-indigo-800";

                        // ✅ belongs-to badge (same colors)
                        const belongsText =
                          r.baseline && r.enhanced
                            ? "Baseline + Enhanced"
                            : r.baseline
                              ? "Baseline"
                              : "Enhanced";

                        const belongsClass = originClass;

                        const belongs =
                          r.baseline && r.enhanced
                            ? "Both"
                            : r.baseline
                              ? "Baseline"
                              : "Enhanced";

                        return (
                          <tr key={r.key} className="hover:bg-gray-50">
                            {/* ✅ FIRST CELL */}
                            <td className="px-4 py-2 text-center">
                              <span
                                className={[
                                  "inline-flex items-center justify-center",
                                  "rounded-full border",
                                  "px-3 py-1 text-xs font-semibold",
                                  "whitespace-nowrap", // ✅ no wrapping
                                  "min-w-[92px]", // ✅ consistent width so it looks aligned
                                  belongsClass,
                                ].join(" ")}
                                title={
                                  belongs === "Both"
                                    ? "Baseline + Enhanced"
                                    : belongs
                                }
                              >
                                {belongs}
                              </span>
                            </td>

                            <td className="px-4 py-2">{r.path}</td>
                            <td className="px-4 py-2">{r.dtype}</td>
                            <td className="px-4 py-2">{r.matchedText}</td>

                            <td className="px-4 py-2 text-center">
                              <span
                                className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs ${originClass}`}
                              >
                                {origin}
                              </span>
                            </td>
                          </tr>
                        );
                      })}

                      {!combinedSummary.rows.length && (
                        <tr>
                          {/* ✅ FIXED colSpan = 5 (BelongsTo + 4 cols) */}
                          <td
}
)
