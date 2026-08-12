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
                            colSpan={5}
                            className="px-4 py-6 text-center text-gray-600"
                          >
                            No combined data available.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* ✅ legend */}
                <div className="flex flex-wrap gap-2 text-xs">
                  <span className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-emerald-800">
                    Common in both
                  </span>
                  <span className="inline-flex items-center rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-amber-800">
                    Only in {BASELINE_LABEL}
                  </span>
                  <span className="inline-flex items-center rounded-full border border-indigo-200 bg-indigo-50 px-2 py-0.5 text-indigo-800">
                    Only in {ENHANCED_LABEL}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Findings Table Modal
  const TableModal = ({ open, onClose, title, rows }) => {
    if (!open) return null;

    return (
      <div className="fixed inset-0 z-[10000] flex items-center justify-center px-4">
        {/* backdrop: dark + blur */}
        <div
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          onClick={onClose}
        />

        {/* modal */}
        <div className="relative w-full max-w-6xl rounded-2xl bg-white shadow-2xl border border-[#2B245C] overflow-hidden">
          {/* header */}
          <div className="flex items-center justify-between gap-3 bg-white border-b px-6 py-3">
            <div className="text-[#2B245C] text-2xl font-semibold">{title}</div>

            <button
              onClick={onClose}
              className="rounded-lg bg-white px-3 py-1.5 text-sm font-bold text-[#2B245C] hover:bg-gray-100"
              aria-label="Close"
            >
              ✕
            </button>
          </div>

          {/* body: scrollable up to screen */}
          <div className="p-4">
            <div className="max-h-[75vh] overflow-auto rounded-xl border border-gray-200">
              <FindingsTable data={Array.isArray(rows) ? rows : []} />
            </div>
          </div>
        </div>
      </div>
    );
  };

  const FindingsTable = ({ data }) => (
    <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm">
      <table className="min-w-full text-sm">
        <thead className="bg-[#2B245C] text-white">
          <tr>
            <th className="px-4 py-3 text-left font-semibold whitespace-nowrap rounded-tl-xl">
              Path
            </th>
            <th className="px-4 py-3 text-left font-semibold whitespace-nowrap">
              Source
            </th>
            <th className="px-4 py-3 text-center font-semibold whitespace-nowrap">
              Tag/Line
            </th>
            <th className="px-4 py-3 text-left font-semibold whitespace-nowrap">
              Type
            </th>
            <th className="px-4 py-3 text-left font-semibold whitespace-nowrap min-w-[120px]">
              Matched Text
            </th>
            <th className="px-4 py-3 text-left font-semibold whitespace-nowrap">
              Frameworks
            </th>
            <th className="px-4 py-3 text-center font-semibold whitespace-nowrap">
              Severity
            </th>
            <th className="px-4 py-3 text-center font-semibold whitespace-nowrap rounded-tr-xl">
              Weight
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 bg-white">
          {data.map((r, i) => (
            <tr
              key={r._id || i}
              className="hover:bg-[#2B245C]/5 transition-colors"
            >
              <td
                className="px-4 py-3 text-gray-800 align-top max-w-[200px] truncate whitespace-nowrap"
                title={r.path || "—"}
              >
                {r.path || "—"}
              </td>
              <td className="px-4 py-3 text-gray-700 whitespace-nowrap">
                {r.source || "—"}
              </td>
              <td className="px-4 py-3 text-center text-gray-700 whitespace-nowrap">
                {r.tag || r.line || "—"}
              </td>
              <td className="px-4 py-3 text-gray-800 font-medium whitespace-nowrap">
                {r.dtype || r.type || "—"}
              </td>
              <td
                className="px-4 py-3 text-gray-700 max-w-[180px] truncate whitespace-nowrap"
                title={r.matchedText || r.matched || "—"}
              >
                {r.matchedText || r.matched || "—"}
              </td>
              <td className="px-4 py-3 text-gray-600 text-xs whitespace-nowrap">
                {(r.frameworks || []).join(", ") || "—"}
              </td>
              <td className="px-4 py-3 text-center align-middle whitespace-nowrap">
                <span
                  className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium ${severityTone(
                    r.severity,
                  )}`}
                >
                  {r.severity || "—"}
                </span>
              </td>
              <td className="px-4 py-3 text-center text-gray-700 whitespace-nowrap">
                {r.weight ?? "—"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const TypeSummaryGrid = ({ data }) => (
    <div className="grid gap-4 sm:grid-cols-5 lg:grid-cols-7">
      {data.map((a) => (
        <div
          key={a.category || `${a.category}-${a.count}`}
          className="group relative rounded-lg border border-[#2B245C] bg-gray-50 p-2 mt-5 text-center hover:bg-gray-100 transition-colors duration-300"
        >
          <div className="text-xs font-medium text-[#2B245C] uppercase tracking-wide">
            {a.category || "Unknown"}
          </div>
          <div className="mt-1 text-xl font-bold text-[#2B245C]">
            {a.count || 0}
          </div>
          <div className="absolute inset-0 bg-gradient-to-r from-gray-200 to-gray-100 opacity-0 group-hover:opacity-50 transition-opacity duration-300" />
        </div>
      ))}
    </div>
  );

  const ColumnBlock = ({
    badge,
    findings,
    findingsLoading,
    aggregateData,
    aggregateLoading,
    page,
    setPage,
    pageSize,
    setPageSize,
    noFindingsText = "No findings found.",
  }) => {
    const { pageData, total, totalPages } = useMemo(() => {
      return paginate(findings || [], page, pageSize);
    }, [findings, page, pageSize]);

    const onPageSizeChange = (size) => {
      setPageSize(size);
      setPage(1);
    };

    return (
      <div className="space-y-8 h-full flex flex-col">
        <div className="text-sm font-semibold flex items-center justify-between gap-3 flex-wrap">
          <div>{badge}</div>
        </div>

        {/* Type Summary — above the table */}
        <section className="rounded-2xl border border-[#2B245C] bg-white p-6 shadow-lg">
          <h2 className="text-xl font-semibold text-[#2B245C] mb-4">
            Type Summary
          </h2>

          {aggregateLoading ? (
            <div className="animate-pulse space-y-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-5 w-full rounded bg-gray-100" />
              ))}
            </div>
          ) : aggregateData?.length ? (
            <TypeSummaryGrid data={aggregateData} />
          ) : (
            <div className="text-sm text-gray-600 mt-2">
              No aggregate data available.
            </div>
          )}
        </section>

        {/* Findings table — below Type Summary */}
        <section className="rounded-2xl border border-[#2B245C] bg-white p-6 shadow-lg flex flex-col flex-1">
          <div className="mb-4 flex items-center justify-between gap-3 flex-wrap">
            <h2 className="text-xl font-semibold text-[#2B245C]">Findings</h2>

            <div className="flex items-center gap-3">
              {!findingsLoading && (
                <span className="text-sm text-gray-600">
                  {total > 0 ? `${total} findings` : "No findings"}
                </span>
              )}

              <button
                type="button"
                onClick={() => {
                  setModalTitle("Findings");
                  setModalRows(findings || []);
                  setOpenTableModal(true);
                }}
                disabled={findingsLoading || !(findings && findings.length)}
                className="rounded-lg border border-[#2B245C] bg-white px-2.5 py-1.5 text-[#2B245C] hover:bg-indigo-50 disabled:opacity-50 text-sm font-medium"
                title="View full table"
                aria-label="View full table"
                data-tour="zoom-btn"
              >
                <FaExpandArrowsAlt size={13} className="inline mr-1" />
                Expand
              </button>
            </div>
          </div>

          {findingsLoading ? (
            <div className="animate-pulse space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-6 w-full rounded bg-gray-100" />
              ))}
            </div>
          ) : findings?.length ? (
            <>
              <PaginationBar
                total={total}
                page={page}
                totalPages={totalPages}
                pageSize={pageSize}
                onPageChange={setPage}
                onPageSizeChange={onPageSizeChange}
              />
              <FindingsTable data={pageData} />
            </>
          ) : (
            <div className="text-sm text-gray-600 py-4">{noFindingsText}</div>
          )}
        </section>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* ✅ BLUR THIS WHEN MODAL IS OPEN */}
      <div
        className={[
          isAnyModalOpen ? "blur-sm brightness-75" : "",
          isAnyModalOpen ? "pointer-events-none select-none" : "",
          "transition-all duration-200",
        ].join(" ")}
      >
        <DataFlowNav />

        <div className="mx-5 bg-white rounded-lg p-5 my-3">
          {/* Header */}
          <div
            className="px-6 py-8 bg-[#2B245C] rounded-2xl shadow-lg hover:shadow-2xl transition-shadow duration-300"
            data-tour="header"
          >
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-cyan-50 mb-4">
                  Discovery and Findings —
                  <span className="text-cyan-100">
                    {selectedJob?.name ? ` ${selectedJob.name}` : ""}
                  </span>
                </h1>
                <p className="mt-1 text-sm text-white">
                  Compare Current vs AI (Python Service) findings and type
                  summaries.
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
                  onClick={() => router.push("/admin/dataFlow/jobs")}
                  className="inline-flex items-center rounded-lg bg-white text-[#2B245C] px-6 py-2.5 text-sm font-semibold shadow-md hover:shadow-lg hover:bg-gray-100 transition-all"
                >
                  ← Back
                </button>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="mt-6 border-b border-gray-200" data-tour="jd-tabs">
            <div className="flex flex-wrap gap-2">
              {[
                { key: "findings", label: "Findings", tour: "jd-tab-findings" },
                { key: "schema", label: "Schema", tour: "jd-tab-schema" },
                { key: "metadata", label: "Metadata", tour: "jd-tab-metadata" },
                {
                  key: "job-details",
                  label: "Job Details",
                  tour: "jd-tab-job-details",
                },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => handleTabChange(tab.key)}
                  data-tour={tab.tour}
                  className={`rounded-t-lg px-4 py-2 text-sm font-semibold transition ${
                    activeTab === tab.key
                      ? "bg-[#2B245C] text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </div>
          )}

          {/* <div>
            <span className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-sm font-semibold text-emerald-700">
              Baseline
            </span>
            <span className="inline-flex items-center rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-sm font-semibold text-amber-800">
              Enhanced Scan
            </span>
          </div> */}

          <div className="py-8 space-y-8">
            {/* Job-level analytics: Baseline vs Enhanced graphs (no tabs) */}
            {activeTab === "findings" && (
              <>
                <section className="mb-10 rounded-2xl border border-[#2B245C] bg-white/95 p-6 shadow-lg">
                  <h2 className="text-xl font-semibold text-[#2B245C] mb-6">
                    Findings overview — Baseline vs Enhanced Scan
                  </h2>
                  <div className="grid grid-cols-1 gap-8 xl:grid-cols-2">
                    {/* Baseline column */}
                    <div data-tour="baseline" className="space-y-6">
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-sm font-semibold text-emerald-700">
                          Baseline
                        </span>
                      </div>
                      {loadingResults ? (
                        <div className="h-48 rounded-xl bg-gray-100 animate-pulse" />
                      ) : baselineStats ? (
                        <>
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            <JobSummaryCard
                              title="Total Findings"
                              value={baselineStats.totalFindings}
                              icon={<FileText size={18} />}
                              onClick={() =>
                                scrollToSection(baselineTableSectionRef)
                              }
                            />
                            <JobSummaryCard
                              title="PII"
                              value={baselineStats.totalPII}
                              icon={<Fingerprint size={18} />}
                              onClick={() =>
                                scrollToSection(baselineTableSectionRef)
                              }
                            />
                            <JobSummaryCard
                              title="PHI"
                              value={baselineStats.totalPHI}
                              icon={<HeartPulse size={18} />}
                              onClick={() =>
                                scrollToSection(baselineTableSectionRef)
                              }
                            />
                            <JobSummaryCard
                              title="Sensitive"
                              value={baselineStats.totalSensitive}
                              icon={<ShieldCheck size={18} />}
                              onClick={() =>
                                scrollToSection(baselineTableSectionRef)
                              }
                            />
                          </div>
                          {/* <div className="bg-gray-50 rounded-xl p-4">
                        <div className="flex items-center gap-2 mb-3">
                          <BarChart3 size={18} className="text-[#2B245C]" />
                          <h3 className="text-sm font-semibold text-[#2B245C]">
                            PII vs PHI
                          </h3>
                        </div>
                        <ResponsiveContainer width="100%" height={220}>
                          <BarChart
                            data={baselineStats.piiPhiBars}
                            barCategoryGap="30%"
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Bar
                              dataKey="count"
                              fill="#22c55e"
                              radius={[6, 6, 0, 0]}
                              barSize={50}
                            />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="bg-gray-50 rounded-xl p-4">
                        <div className="flex items-center gap-2 mb-3">
                          <BarChart3 size={18} className="text-[#2B245C]" />
                          <h3 className="text-sm font-semibold text-[#2B245C]">
                            By data type (PII / PHI)
                          </h3>
                        </div>
                        <ResponsiveContainer width="100%" height={260}>
                          <BarChart
                            data={baselineStats.dtypes.slice(0, 10)}
                            margin={{ top: 5, right: 5, left: 0, bottom: 60 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis
                              dataKey="name"
                              angle={-35}
                              textAnchor="end"
                              height={60}
                            />
                            <YAxis />
                            <Tooltip />
                            <Bar
                              dataKey="count"
                              fill="#7c3aed"
                              radius={[6, 6, 0, 0]}
                            />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                      {baselineStats.severity?.length > 0 && (
                        <div className="bg-gray-50 rounded-xl p-4">
                          <div className="flex items-center gap-2 mb-3">
                            <PieIcon size={18} className="text-[#2B245C]" />
                            <h3 className="text-sm font-semibold text-[#2B245C]">
                              Severity
                            </h3>
                          </div>
                          <ResponsiveContainer width="100%" height={220}>
                            <PieChart>
                              <Pie
                                data={baselineStats.severity}
                                dataKey="value"
                                nameKey="name"
                                outerRadius={80}
                                label
                              >
                                {baselineStats.severity.map((_, index) => (
                                  <Cell
                                    key={`cell-${index}`}
                                    fill={COLORS[index % COLORS.length]}
                                  />
                                ))}
                              </Pie>
                              <Tooltip />
                              <Legend
                                layout="vertical"
                                align="right"
                                verticalAlign="middle"
                                iconType="circle"
                              />
                            </PieChart>
                          </ResponsiveContainer>
                        </div>
                      )} */}
                        </>
                      ) : (
                        <div className="text-sm text-gray-500 py-6">
                          No baseline findings for this job yet.
                        </div>
                      )}
                    </div>

                    {/* Enhanced / AI column */}
                    <div data-tour="enhanced" className="space-y-6">
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-sm font-semibold text-amber-800">
                          {ENHANCED_LABEL}
                        </span>
                      </div>
                      {loadingAiResults ? (
                        <div className="h-48 rounded-xl bg-gray-100 animate-pulse" />
                      ) : enhancedStats ? (
                        <>
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            <JobSummaryCard
                              title="Total Findings"
                              value={enhancedStats.totalFindings}
                              icon={<FileText size={18} />}
                              onClick={() =>
                                scrollToSection(enhancedTableSectionRef)
                              }
                            />
                            <JobSummaryCard
                              title="PII"
                              value={enhancedStats.totalPII}
                              icon={<Fingerprint size={18} />}
                              onClick={() =>
                                scrollToSection(enhancedTableSectionRef)
                              }
                            />
                            <JobSummaryCard
                              title="PHI"
                              value={enhancedStats.totalPHI}
                              icon={<HeartPulse size={18} />}
                              onClick={() =>
                                scrollToSection(enhancedTableSectionRef)
                              }
                            />
                            <JobSummaryCard
                              title="Sensitive"
                              value={enhancedStats.totalSensitive}
                              icon={<ShieldCheck size={18} />}
                              onClick={() =>
                                scrollToSection(enhancedTableSectionRef)
                              }
                            />
                          </div>
                          {/* <div className="bg-gray-50 rounded-xl p-4">
                        <div className="flex items-center gap-2 mb-3">
                          <BarChart3 size={18} className="text-[#2B245C]" />
                          <h3 className="text-sm font-semibold text-[#2B245C]">
                            PII vs PHI
                          </h3>
                        </div>
                        <ResponsiveContainer width="100%" height={220}>
                          <BarChart
                            data={enhancedStats.piiPhiBars}
                            barCategoryGap="30%"
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Bar
                              dataKey="count"
                              fill="#f59e0b"
                              radius={[6, 6, 0, 0]}
                              barSize={50}
                            />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="bg-gray-50 rounded-xl p-4">
                        <div className="flex items-center gap-2 mb-3">
                          <BarChart3 size={18} className="text-[#2B245C]" />
                          <h3 className="text-sm font-semibold text-[#2B245C]">
                            By data type (PII / PHI)
                          </h3>
                        </div>
                        <ResponsiveContainer width="100%" height={260}>
                          <BarChart
                            data={enhancedStats.dtypes.slice(0, 10)}
                            margin={{ top: 5, right: 5, left: 0, bottom: 60 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis
                              dataKey="name"
                              angle={-35}
                              textAnchor="end"
                              height={60}
                            />
                            <YAxis />
                            <Tooltip />
                            <Bar
                              dataKey="count"
                              fill="#7c3aed"
                              radius={[6, 6, 0, 0]}
                            />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                      {enhancedStats.severity?.length > 0 && (
                        <div className="bg-gray-50 rounded-xl p-4">
                          <div className="flex items-center gap-2 mb-3">
                            <PieIcon size={18} className="text-[#2B245C]" />
                            <h3 className="text-sm font-semibold text-[#2B245C]">
                              Severity
                            </h3>
                          </div>
                          <ResponsiveContainer width="100%" height={220}>
                            <PieChart>
                              <Pie
                                data={enhancedStats.severity}
                                dataKey="value"
                                nameKey="name"
                                outerRadius={80}
                                label
                              >
                                {enhancedStats.severity.map((_, index) => (
                                  <Cell
                                    key={`cell-${index}`}
                                    fill={COLORS[index % COLORS.length]}
                                  />
                                ))}
                              </Pie>
                              <Tooltip />
                              <Legend
                                layout="vertical"
                                align="right"
                                verticalAlign="middle"
                                iconType="circle"
                              />
                            </PieChart>
                          </ResponsiveContainer>
                        </div>
                      )} */}
                        </>
                      ) : (
                        <div className="text-sm text-gray-500 py-6">
                          No enhanced (AI) findings for this job yet.
                        </div>
                      )}
                    </div>
                  </div>
                </section>

                <div className="border-t border-gray-200"></div>
              </>
            )}

            {/* OpenMetadata Schema (Diff) — Service → Tables → Versions → Schema → Diff */}
            {activeTab === "schema" && (
              <section
                className="rounded-2xl border border-[#2B245C] bg-white/95 p-6 shadow-lg"
                data-tour="schema-section"
              >
                {(() => {
                  const serviceTables =
                    Array.isArray(omServiceTables) && omServiceTables.length > 0
                      ? omServiceTables
                      : Array.isArray(assetMeta?.openMetadata?.tables)
                        ? assetMeta.openMetadata.tables
                        : [];

                  const versionsRaw = Array.isArray(omVersionsResp?.versions)
                    ? omVersionsResp.versions
                    : [];
                  const versionsParsed = versionsRaw
                    .map(parseOmVersionJson)
                    .filter(Boolean)
                    .sort((a, b) => (a?.version ?? 0) - (b?.version ?? 0));

                  const diff =
                    omSchemaA && omSchemaB
                      ? computeSchemaDiff(omSchemaB, omSchemaA)
                      : null;

                  const schemaACols = flattenColumns(omSchemaA?.columns || []);

                  const addedIds = new Set(
                    (diff?.added || []).map(
                      (c) => c.fullyQualifiedName || c.key,
                    ),
                  );
                  const modifiedIds = new Set(
                    (diff?.modified || []).map(
                      (x) => x.after?.fullyQualifiedName || x.after?.key,
                    ),
                  );

                  const tableFqn =
                    omSelectedTable?.fullyQualifiedName ||
                    serviceTables.find(
                      (t) => String(t?.id) === String(omTableId),
                    )?.fullyQualifiedName ||
                    "—";

                  return (
                    <div className="space-y-7">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="flex items-start gap-3">
                          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#2B245C]/10 border border-[#2B245C]/15">
                            <Database size={20} className="text-[#2B245C]" />
                          </div>

                          <div>
                            <h2 className="text-xl font-semibold text-[#2B245C]">
                              OpenMetadata Schema Diff
                            </h2>
                            <p className="mt-1 text-xs text-gray-600">
                              Compare table schema versions and review added,
                              removed, and modified columns.
                            </p>

                            <div className="mt-3 flex flex-wrap items-center gap-2">
                              <span className="rounded-full border border-[#2B245C]/15 bg-[#2B245C]/5 px-3 py-1 text-xs font-medium text-[#2B245C]">
                                Service → Tables → Versions → Schema → Diff
                              </span>

                              {tableFqn !== "—" && (
                                <span className="rounded-full border border-gray-200 bg-white px-3 py-1 text-xs text-gray-700">
                                  {tableFqn}
                                </span>
                              )}

                              {omVersionB && omVersionA && (
                                <span className="rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700">
                                  v{omVersionB} → v{omVersionA}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {selectedAssetId && (
                          <div className="flex flex-wrap items-center gap-2">
                            <button
                              onClick={() =>
                                fetchOmServiceTables(selectedAssetId)
                              }
                              disabled={loadingOmServiceTables}
                              className="rounded-lg border border-[#2B245C] bg-white px-3 py-2 text-sm font-medium text-[#2B245C] hover:bg-indigo-50 disabled:opacity-60"
                            >
                              {loadingOmServiceTables
                                ? "Loading…"
                                : "Reload tables"}
                            </button>
                            <button
                              onClick={() =>
                                fetchOmTableVersions(selectedAssetId, omTableId)
                              }
                              disabled={
                                loadingOmVersions ||
                                !String(omTableId || "").trim()
                              }
                              className="rounded-lg border border-blue-700 bg-white px-3 py-2 text-sm font-medium text-blue-700 hover:bg-blue-50 disabled:opacity-60"
                            >
                              {loadingOmVersions
                                ? "Loading…"
                                : "Reload versions"}
                            </button>
                            <select
                              className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm"
                              value={omCompareMode}
                              onChange={(e) => setOmCompareMode(e.target.value)}
                            >
                              <option value="auto">Compare vs previous</option>
                              <option value="manual">Compare any two</option>
                            </select>
                          </div>
                        )}
                      </div>

                      {!selectedAssetId ? (
                        <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-600">
                          This job is not linked to an asset. OpenMetadata
                          schema diff is available when the job has an asset
                          with OpenMetadata tables.
                        </div>
                      ) : omError ? (
                        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                          {omError}
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                          <div className="lg:col-span-3 rounded-xl border border-gray-200 bg-white overflow-hidden">
                            <div className="px-4 py-3 border-b bg-gray-50 text-sm font-semibold text-[#2B245C]">
                              Tables in Service
                            </div>
                            <div className="max-h-[500px] overflow-auto">
                              {loadingOmServiceTables ? (
                                <div className="p-4 text-sm text-gray-500">
                                  Loading tables…
                                </div>
                              ) : serviceTables.length === 0 ? (
                                <div className="p-4 text-sm text-gray-500">
                                  No tables found. Trigger the OpenMetadata
                                  pipeline and try again.
                                </div>
                              ) : (
                                <div className="divide-y">
                                  {serviceTables.map((t) => {
                                    const label =
                                      t?.name ||
                                      t?.fullyQualifiedName?.split(".").pop() ||
                                      t?.id;
                                    const isActive =
                                      String(t?.id) === String(omTableId);
                                    return (
                                      <button
                                        key={t.id}
                                        onClick={() => {
                                          const id = String(t.id || "");
                                          setOmTableId(id);
                                          setOmSelectedTable(t || null);
                                          setOmVersionsResp(null);
                                          setOmVersionA("");
                                          setOmVersionB("");
                                          setOmSchemaA(null);
                                          setOmSchemaB(null);
                                        }}
                                        className={`w-full text-left px-4 py-2.5 text-sm hover:bg-indigo-50 ${
                                          isActive ? "bg-indigo-50" : "bg-white"
                                        }`}
                                        title={t?.fullyQualifiedName || label}
                                      >
                                        <div className="font-medium text-gray-800 truncate">
                                          {label}
                                        </div>
                                        <div className="text-xs text-gray-500 font-mono truncate">
                                          {t?.fullyQualifiedName || t?.id}
                                        </div>
                                      </button>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="lg:col-span-3 rounded-xl border border-gray-200 bg-white overflow-hidden">
                            <div className="px-4 py-3 border-b bg-gray-50 text-sm font-semibold text-[#2B245C]">
                              Versions
                            </div>
                            <div className="p-4 space-y-3">
                              {!String(omTableId || "").trim() ? (
                                <div className="text-sm text-gray-500">
                                  Select a table first.
                                </div>
                              ) : !omVersionsResp ? (
                                <div className="text-sm text-gray-500">
                                  Click “Reload versions” to load table
                                  versions.
                                </div>
                              ) : versionsParsed.length === 0 ? (
                                <div className="text-sm text-gray-500">
                                  No versions returned.
                                </div>
                              ) : (
                                <>
                                  <div className="grid grid-cols-1 gap-2">
                                    <label className="text-xs font-medium text-gray-600">
                                      Selected Version
                                    </label>
                                    <select
                                      className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm"
                                      value={omVersionA}
                                      onChange={(e) =>
                                        setOmVersionA(e.target.value)
                                      }
                                    >
                                      {versionsParsed
                                        .slice()
                                        .reverse()
                                        .map((v) => (
                                          <option
                                            key={String(v.version)}
                                            value={String(v.version)}
                                          >
                                            v{v.version}{" "}
                                            {v.updatedAt
                                              ? `• ${new Date(v.updatedAt).toLocaleString()}`
                                              : ""}
                                          </option>
                                        ))}
                                    </select>
                                  </div>

                                  <div className="grid grid-cols-1 gap-2">
                                    <label className="text-xs font-medium text-gray-600">
                                      Compare Against
                                    </label>
                                    <select
                                      className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm"
                                      value={omVersionB}
                                      onChange={(e) =>
                                        setOmVersionB(e.target.value)
                                      }
                                      disabled={omCompareMode === "auto"}
                                    >
                                      <option value="">—</option>
                                      {versionsParsed
                                        .slice()
                                        .reverse()
                                        .map((v) => (
                                          <option
                                            key={String(v.version)}
                                            value={String(v.version)}
                                          >
                                            v{v.version}{" "}
                                            {v.updatedAt
                                              ? `• ${new Date(v.updatedAt).toLocaleString()}`
                                              : ""}
                                          </option>
                                        ))}
                                    </select>
                                    {omCompareMode === "auto" && (
                                      <div className="text-xs text-gray-500">
                                        Automatically uses the previous version
                                        of the selected version.
                                      </div>
                                    )}
                                  </div>

                                  <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 text-xs text-gray-700">
                                    <div className="font-mono break-all">
                                      {tableFqn}
                                    </div>
                                  </div>
                                </>
                              )}
                            </div>
                          </div>

                          <div className="lg:col-span-6 rounded-xl border border-gray-200 bg-white overflow-hidden">
                            <div className="px-4 py-3 border-b bg-gray-50 text-sm font-semibold text-[#2B245C]">
                              Schema Viewer & Diff
                            </div>

                            <div className="p-4 space-y-4">
                              <div className="flex flex-wrap items-center gap-2 text-xs text-gray-600">
                                <span className="rounded-full border border-gray-200 bg-white px-2 py-1 font-mono">
                                  A: v{omVersionA || "—"}
                                </span>
                                <span className="text-gray-400">vs</span>
                                <span className="rounded-full border border-gray-200 bg-white px-2 py-1 font-mono">
                                  B: v{omVersionB || "—"}
                                </span>
                                {(loadingOmSchemaA || loadingOmSchemaB) && (
                                  <span className="text-gray-500">
                                    Loading schema…
                                  </span>
                                )}
                              </div>

                              {diff ? (
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                  <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3">
                                    <div className="text-xs font-medium text-emerald-700 uppercase tracking-wide">
                                      Added
                                    </div>
                                    <div className="text-2xl font-bold text-emerald-800">
                                      {(diff.added || []).length}
                                    </div>
                                  </div>
                                  <div className="rounded-xl border border-red-200 bg-red-50 p-3">
                                    <div className="text-xs font-medium text-red-700 uppercase tracking-wide">
                                      Removed
                                    </div>
                                    <div className="text-2xl font-bold text-red-800">
                                      {(diff.removed || []).length}
                                    </div>
                                  </div>
                                  <div className="rounded-xl border border-amber-200 bg-amber-50 p-3">
                                    <div className="text-xs font-medium text-amber-700 uppercase tracking-wide">
                                      Modified
                                    </div>
                                    <div className="text-2xl font-bold text-amber-800">
                                      {(diff.modified || []).length}
                                    </div>
                                  </div>
                                  <div className="rounded-xl border border-gray-200 bg-gray-50 p-3">
                                    <div className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                                      Columns (A)
                                    </div>
                                    <div className="text-2xl font-bold text-gray-800">
                                      {schemaACols.length}
                                    </div>
                                  </div>
                                </div>
                              ) : (
                                <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-600">
                                  Load versions and pick Version A (and Version
                                  B) to view schema and diffs.
                                </div>
                              )}

                              <div className="rounded-xl border border-gray-200 overflow-hidden">
                                <div className="px-4 py-2.5 border-b bg-white text-sm font-semibold text-gray-800">
                                  Schema (v{omVersionA || "—"})
                                </div>
                                <div className="overflow-auto max-h-[340px]">
                                  <table className="min-w-full text-sm">
                                    <thead className="bg-gray-50 sticky top-0">
                                      <tr className="text-left text-gray-600">
                                        <th className="px-4 py-2">Column</th>
                                        <th className="px-4 py-2">Type</th>
                                        <th className="px-4 py-2">
                                          Description
                                        </th>
                                        <th className="px-4 py-2">
                                          Constraints
                                        </th>
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y">
                                      {schemaACols.length === 0 ? (
                                        <tr>
                                          <td
                                            colSpan={4}
                                            className="px-4 py-6 text-center text-gray-500"
                                          >
                                            {loadingOmSchemaA
                                              ? "Loading…"
                                              : "No columns to display."}
                                          </td>
                                        </tr>
                                      ) : (
                                        schemaACols.map((c) => {
                                          const id =
                                            c.fullyQualifiedName || c.key;
                                          const rowTone = addedIds.has(id)
                                            ? "bg-emerald-50"
                                            : modifiedIds.has(id)
                                              ? "bg-amber-50"
                                              : "bg-white";
                                          return (
                                            <tr key={id} className={rowTone}>
                                              <td className="px-4 py-2 font-mono text-xs text-gray-800">
                                                {c.key}
                                              </td>
                                              <td className="px-4 py-2 font-mono text-xs text-gray-700">
                                                {c.dataTypeDisplay ||
                                                  c.dataType ||
                                                  "—"}
                                              </td>
                                              <td className="px-4 py-2 text-gray-700">
                                                {c.description ? (
                                                  <span title={c.description}>
                                                    {String(
                                                      c.description,
                                                    ).slice(0, 120)}
                                                  </span>
                                                ) : (
                                                  <span className="text-gray-400">
                                                    —
                                                  </span>
                                                )}
                                              </td>
                                              <td className="px-4 py-2 text-gray-700">
                                                {c.constraint ? (
                                                  <span className="font-mono text-xs">
                                                    {c.constraint}
                                                  </span>
                                                ) : (
                                                  <span className="text-gray-400">
                                                    —
                                                  </span>
                                                )}
                                              </td>
                                            </tr>
                                          );
                                        })
                                      )}
                                    </tbody>
                                  </table>
                                </div>
                              </div>

                              {diff && (diff.removed || []).length > 0 && (
                                <div className="rounded-xl border border-red-200 overflow-hidden">
                                  <div className="px-4 py-2.5 border-b bg-red-50 text-sm font-semibold text-red-800">
                                    Removed Columns (in v{omVersionB || "—"}{" "}
                                    only)
                                  </div>
                                  <div className="overflow-auto max-h-[220px] bg-white">
                                    <table className="min-w-full text-sm">
                                      <thead className="bg-white sticky top-0">
                                        <tr className="text-left text-gray-600">
                                          <th className="px-4 py-2">Column</th>
                                          <th className="px-4 py-2">Type</th>
                                        </tr>
                                      </thead>
                                      <tbody className="divide-y">
                                        {(diff.removed || []).map((c) => (
                                          <tr
                                            key={c.fullyQualifiedName || c.key}
                                            className="bg-red-50/40"
                                          >
                                            <td className="px-4 py-2 font-mono text-xs">
                                              {c.key}
                                            </td>
                                            <td className="px-4 py-2 font-mono text-xs">
                                              {c.dataTypeDisplay ||
                                                c.dataType ||
                                                "—"}
                                            </td>
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })()}
              </section>
            )}

            {/* OpenMetadata Schema (Diff) — directly below Findings overview */}
            {/* (Legacy) kept for reference; replaced by section above */}
            {false && (
              <section
                className="rounded-2xl border border-[#2B245C] bg-white/95 p-6 shadow-lg"
                data-tour="openmetadata-schema"
              >
                <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                  <h2 className="text-xl font-semibold text-[#2B245C]">
                    OpenMetadata Schema (Diff)
                  </h2>
                  <div className="flex items-center gap-2">
                    {selectedAssetId && (
                      <>
                        {Array.isArray(assetMeta?.openMetadata?.tables) &&
                        assetMeta.openMetadata.tables.length > 0 ? (
                          <select
                            className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm min-w-[200px]"
                            value={omTableId}
                            onChange={(e) => {
                              const id = e.target.value;
                              setOmTableId(id);
                              const t = assetMeta.openMetadata.tables.find(
                                (x) => String(x.id) === String(id),
                              );
                              setOmSelectedTable(t || null);
                            }}
                          >
                            {assetMeta.openMetadata.tables.map((t) => (
                              <option key={t.id} value={t.id}>
                                {t.name ||
                                  t.fullyQualifiedName?.split(".").pop() ||
                                  t.id}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <input
                            value={omTableId}
                            onChange={(e) => setOmTableId(e.target.value)}
                            placeholder="OpenMetadata table ID"
                            className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm w-64 font-mono"
                          />
                        )}
                        <button
                          onClick={() =>
                            fetchOmTableVersions(selectedAssetId, omTableId)
                          }
                          disabled={
                            loadingOmVersions || !String(omTableId || "").trim()
                          }
                          className="rounded-lg border border-[#2B245C] bg-white px-4 py-2 text-sm font-medium text-[#2B245C] hover:bg-indigo-50 disabled:opacity-60"
                        >
                          {loadingOmVersions ? "Loading…" : "Load versions"}
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {!selectedAssetId ? (
                  <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-600">
                    This job is not linked to an asset. OpenMetadata schema diff
                    is available when the job has an asset with OpenMetadata
                    tables.
                  </div>
                ) : omError ? (
                  <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                    {omError}
                  </div>
                ) : loadingOmVersions && !omVersionsResp ? (
                  <div className="rounded-xl border border-gray-200 bg-gray-50 p-8 text-center text-gray-500">
                    Loading schema versions…
                  </div>
                ) : !omVersionsResp ? (
                  <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-600">
                    Select a table and load versions to see schema changes
                    (added/removed/changed columns). If no tables appear, run
                    Run Now on the Asset page first to discover tables.
                  </div>
                ) : (
                  (() => {
                    const versions = Array.isArray(omVersionsResp?.versions)
                      ? omVersionsResp.versions
                      : [];
                    const parsed = versions
                      .map(parseOmVersionJson)
                      .filter(Boolean)
                      .sort((a, b) => (a?.version ?? 0) - (b?.version ?? 0));
                    const latest = parsed[parsed.length - 1] || null;
                    const prev = parsed[parsed.length - 2] || null;
                    const diff =
                      prev && latest ? computeSchemaDiff(prev, latest) : null;
                    const changeDesc =
                      latest?.changeDescription ||
                      latest?.incrementalChangeDescription ||
                      null;
                    const tableName =
                      latest?.name ||
                      latest?.fullyQualifiedName?.split(".").pop() ||
                      "Table";

                    const added = diff?.added || [];
                    const removed = diff?.removed || [];
                    const changed = diff?.changed || [];
                    const addedCount = added.length;
                    const removedCount = removed.length;
                    const changedCount = changed.length;
                    const totalColumns = latest
                      ? flattenColumns(latest?.columns || []).length
                      : 0;

                    const statsData = [
                      { name: "Added", count: addedCount, fill: "#22c55e" },
                      { name: "Removed", count: removedCount, fill: "#ef4444" },
                      {
                        name: "Type changed",
                        count: changedCount,
                        fill: "#f59e0b",
                      },
                    ].filter((d) => d.count > 0);

                    const allChanges = [
                      ...added.map((c) => ({
                        path: c.key,
                        location: tableName,
                        changeType: "Added",
                        dataType: c.dataTypeDisplay || c.dataType || "—",
                        before: null,
                        after: c,
                      })),
                      ...removed.map((c) => ({
                        path: c.key,
                        location: tableName,
                        changeType: "Removed",
                        dataType: c.dataTypeDisplay || c.dataType || "—",
                        before: c,
                        after: null,
                      })),
                      ...changed.map((x) => ({
                        path: x.after?.key,
                        location: tableName,
                        changeType: "Type changed",
                        dataType: `${x.before?.dataTypeDisplay || x.before?.dataType || "—"} → ${x.after?.dataTypeDisplay || x.after?.dataType || "—"}`,
                        before: x.before,
                        after: x.after,
                      })),
                    ];

                    return (
                      <div className="space-y-6">
                        <div className="flex flex-wrap items-center gap-2 text-sm text-gray-600">
                          <span className="font-mono">
                            {latest?.fullyQualifiedName || "—"}
                          </span>
                          <span className="text-gray-400">
                            v{prev?.version ?? "—"} → v{latest?.version ?? "—"}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3">
                            <div className="text-xs font-medium text-emerald-700 uppercase tracking-wide">
                              Added
                            </div>
                            <div className="text-2xl font-bold text-emerald-800">
                              {addedCount}
                            </div>
                          </div>
                          <div className="rounded-xl border border-red-200 bg-red-50 p-3">
                            <div className="text-xs font-medium text-red-700 uppercase tracking-wide">
                              Removed
                            </div>
                            <div className="text-2xl font-bold text-red-800">
                              {removedCount}
                            </div>
                          </div>
                          <div className="rounded-xl border border-amber-200 bg-amber-50 p-3">
                            <div className="text-xs font-medium text-amber-700 uppercase tracking-wide">
                              Type changed
                            </div>
                            <div className="text-2xl font-bold text-amber-800">
                              {changedCount}
                            </div>
                          </div>
                          <div className="rounded-xl border border-gray-200 bg-gray-50 p-3">
                            <div className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                              Total columns
                            </div>
                            <div className="text-2xl font-bold text-gray-800">
                              {totalColumns}
                            </div>
                          </div>
                        </div>

                        {statsData.length > 0 && (
                          <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                            <h3 className="text-sm font-semibold text-[#2B245C] mb-3">
                              Schema change summary
                            </h3>
                            <ResponsiveContainer width="100%" height={180}>
                              <BarChart
                                data={statsData}
                                margin={{
                                  top: 8,
                                  right: 8,
                                  left: 8,
                                  bottom: 24,
                                }}
                              >
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip />
                                <Bar
                                  dataKey="count"
                                  fill="#2B245C"
                                  radius={[4, 4, 0, 0]}
                                />
                              </BarChart>
                            </ResponsiveContainer>
                          </div>
                        )}

                        {allChanges.length > 0 ? (
                          <div className="rounded-xl border border-gray-200 overflow-hidden">
                            <h3 className="text-sm font-semibold text-[#2B245C] px-4 py-3 bg-gray-50 border-b">
                              Column-level changes (location: {tableName})
                            </h3>
                            <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
                              <table className="w-full text-sm">
                                <thead className="bg-gray-100 sticky top-0">
                                  <tr>
                                    <th className="text-left px-4 py-2 font-medium text-gray-700">
                                      Field path
                                    </th>
                                    <th className="text-left px-4 py-2 font-medium text-gray-700">
                                      Change
                                    </th>
                                    <th className="text-left px-4 py-2 font-medium text-gray-700">
                                      Data type
                                    </th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {allChanges.map((row, idx) => (
                                    <tr
                                      key={`${row.path}-${idx}`}
                                      className="border-t border-gray-100 hover:bg-gray-50"
                                    >
                                      <td className="px-4 py-2 font-mono text-gray-800">
                                        {row.path}
                                      </td>
                                      <td className="px-4 py-2">
                                        <span
                                          className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                                            row.changeType === "Added"
                                              ? "bg-emerald-100 text-emerald-800"
                                              : row.changeType === "Removed"
                                                ? "bg-red-100 text-red-800"
                                                : "bg-amber-100 text-amber-800"
                                          }`}
                                        >
                                          {row.changeType}
                                        </span>
                                      </td>
                                      <td className="px-4 py-2 text-gray-600">
                                        {row.dataType}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        ) : (
                          prev &&
                          latest && (
                            <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-600">
                              No column-level changes between these versions.
                            </div>
                          )
                        )}

                        {(!prev || !latest) && parsed.length > 0 && (
                          <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-600">
                            Only one version available. Run the pipeline again
                            after schema changes to see a diff.
                          </div>
                        )}
                      </div>
                    );
                  })()
                )}
              </section>
            )}

            {/* Two-column: Type Summary first, then Findings table */}
            {activeTab === "findings" && (
              <div className="grid grid-cols-1 gap-8 xl:grid-cols-2 items-stretch">
                {/* Left: Baseline — click cards above to scroll here */}
                <div
                  ref={baselineTableSectionRef}
                  data-tour="baseline"
                  className="scroll-mt-6 h-full"
                >
                  <ColumnBlock
                    badge={
                      <span className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-md text-emerald-700">
                        Baseline
                      </span>
                    }
                    findings={results}
                    findingsLoading={loadingResults}
                    aggregateData={aggregate}
                    aggregateLoading={loadingAggregate}
                    page={leftPage}
                    setPage={setLeftPage}
                    pageSize={leftPageSize}
                    setPageSize={setLeftPageSize}
                    noFindingsText={
                      !selectedJobId
                        ? "Job ID not available yet."
                        : noDbFound
                          ? "No DB Found"
                          : "No findings found."
                    }
                  />
                </div>

                {/* Right: Enhanced — click cards above to scroll here */}
                <div
                  ref={enhancedTableSectionRef}
                  data-tour="enhanced"
                  className="scroll-mt-6 h-full"
                >
                  <ColumnBlock
                    badge={
                      <span className="inline-flex items-center rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-md text-amber-800">
                        {ENHANCED_LABEL}
                      </span>
                    }
                    findings={aiResults}
                    findingsLoading={loadingAiResults}
                    aggregateData={aiAggregate}
                    aggregateLoading={loadingAiAggregate}
                    page={rightPage}
                    setPage={setRightPage}
                    pageSize={rightPageSize}
                    setPageSize={setRightPageSize}
                    noFindingsText={
                      !selectedJobId
                        ? "Job ID not available yet."
                        : noDbFound
                          ? "No DB Found"
                          : "No AI findings found for this job."
                    }
                  />
                </div>
              </div>
            )}

            {/* Field-level metadata & data catalog */}
            {activeTab === "metadata" && (
              <section
                ref={fieldLevelSectionRef}
                data-tour="metadata-section"
                className="scroll-mt-6 rounded-2xl border border-[#2B245C] bg-white p-6 shadow-lg"
              >
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#2B245C]/10 border border-[#2B245C]/15">
                    <Database size={20} className="text-[#2B245C]" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-[#2B245C]">
                      Field-level metadata & data catalog
                    </h2>
                    <p className="text-xs text-gray-600 mt-1">
                      Findings grouped by table and field (column). Use this
                      view for governance and catalog.
                    </p>
                  </div>
                </div>

                {fieldLevelMetadata.tables.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 py-10 text-center text-sm text-gray-600">
                    No field-level data yet. Run a scan and ensure findings are
                    loaded above.
                  </div>
                ) : (
                  <div className="space-y-5">
                    <div className="mb-7 flex flex-wrap items-center gap-2 text-sm text-gray-600">
                      <span className="inline-flex items-center gap-1 rounded-full border border-blue-300 text-blue-700 bg-blue-100 font-medium px-2.5 py-1">
                        <Tags size={14} />
                        {fieldLevelMetadata.tables.length} table(s)
                      </span>
                      <span className="rounded-full border border-purple-300 text-purple-700 bg-purple-100 font-medium px-2.5 py-1">
                        {fieldLevelMetadata.totalFields} field(s)
                      </span>
                      <span className="rounded-full border border-green-300 text-green-700 bg-green-100 font-medium px-2.5 py-1">
                        {fieldLevelMetadata.totalFindings} finding(s)
                      </span>
                    </div>

                    {fieldLevelMetadata.tables.map(
                      ({ tableName, fields, totalFindings }) => {
                        const isExpanded =
                          expandedMetadataTables.has(tableName);
                        return (
                          <div
                            key={tableName}
                            className="rounded-xl border border-[#2B245C]/20 bg-gray-100 overflow-hidden"
                          >
                            <button
                              type="button"
                              onClick={() => toggleMetadataTable(tableName)}
                              className="w-full flex items-center justify-between gap-3 px-4 py-3 text-left hover:bg-[#2B245C]/5 transition-colors"
                            >
                              <div className="flex items-center gap-2">
                                {isExpanded ? (
                                  <ChevronDown
                                    size={18}
                                    className="text-[#2B245C] shrink-0"
                                  />
                                ) : (
                                  <ChevronRight
                                    size={18}
                                    className="text-[#2B245C] shrink-0"
                                  />
                                )}
                                <span className="font-semibold text-[#2B245C]">
                                  {tableName}
                                </span>
                                <span className="text-xs text-gray-500">
                                  {fields.length} field(s) · {totalFindings}{" "}
                                  finding(s)
                                </span>
                              </div>
                            </button>

                            {isExpanded && (
                              <div className="border-t border-[#2B245C]/10 bg-white">
                                <div className="overflow-x-auto overflow-y-auto max-h-[400px]">
                                  <table className="min-w-full text-sm">
                                    <thead className="sticky top-0 z-10 bg-[#2B245C] text-white">
                                      <tr>
                                        <th className="px-4 py-2.5 text-left font-semibold whitespace-nowrap">
                                          Field / Column
                                        </th>
                                        <th className="px-4 py-2.5 text-left font-semibold whitespace-nowrap">
                                          Path
                                        </th>
                                        <th className="px-4 py-2.5 text-left font-semibold whitespace-nowrap">
                                          PII type(s)
                                        </th>
                                        <th className="px-4 py-2.5 text-left font-semibold whitespace-nowrap">
                                          Frameworks
                                        </th>
                                        <th className="px-4 py-2.5 text-center font-semibold whitespace-nowrap">
                                          Severity
                                        </th>
                                        <th className="px-4 py-2.5 text-center font-semibold whitespace-nowrap">
                                          Count
                                        </th>
                                        <th className="px-4 py-2.5 text-left font-semibold whitespace-nowrap min-w-[140px]">
                                          Sample
                                        </th>
                                        <th className="px-4 py-2.5 text-left font-semibold whitespace-nowrap">
                                          Meta
                                        </th>
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                      {fields.map((field) => (
                                        <tr
                                          key={field.fieldName}
                                          className="hover:bg-[#2B245C]/5"
                                        >
                                          <td className="px-4 py-2.5 font-medium text-gray-900 align-top">
                                            {field.fieldName}
                                          </td>
                                          <td
                                            className="px-4 py-2.5 text-gray-700 max-w-[180px] truncate align-top"
                                            title={field.path}
                                          >
                                            {field.path}
                                          </td>
                                          <td className="px-4 py-2.5 align-top">
                                            <div className="flex flex-wrap gap-1">
                                              {(field.dtypes || []).map((d) => (
                                                <span
                                                  key={d}
                                                  className="inline-flex rounded border border-violet-200 bg-violet-50 px-2 py-0.5 text-xs font-medium text-violet-800"
                                                >
                                                  {d}
                                                </span>
                                              ))}
                                              {(!field.dtypes ||
                                                !field.dtypes.length) && (
                                                <span className="text-gray-400 text-xs">
                                                  —
                                                </span>
                                              )}
                                            </div>
                                          </td>
                                          <td className="px-4 py-2.5 align-top">
                                            <div className="flex flex-wrap gap-1">
                                              {(field.frameworks || []).map(
                                                (fw) => (
                                                  <span
                                                    key={fw}
                                                    className="inline-flex rounded border border-sky-200 bg-sky-50 px-2 py-0.5 text-xs text-sky-800"
                                                  >
                                                    {fw}
                                                  </span>
                                                ),
                                              )}
                                              {(!field.frameworks ||
                                                !field.frameworks.length) && (
                                                <span className="text-gray-400 text-xs">
                                                  —
                                                </span>
                                              )}
                                            </div>
                                          </td>
                                          <td className="px-4 py-2.5 text-center align-top">
                                            <div className="flex flex-wrap gap-1 justify-center">
                                              {(field.severities || []).map(
                                                (s) => (
                                                  <span
                                                    key={s}
                                                    className={`inline-flex rounded-full border px-2 py-0.5 text-xs font-medium ${severityTone(s)}`}
                                                  >
                                                    {s}
                                                  </span>
                                                ),
                                              )}
                                              {(!field.severities ||
                                                !field.severities.length) && (
                                                <span className="text-gray-400 text-xs">
                                                  —
                                                </span>
                                              )}
                                            </div>
                                          </td>
                                          <td className="px-4 py-2.5 text-center text-gray-700 align-top">
                                            {field.count}
                                          </td>
                                          <td
                                            className="px-4 py-2.5 text-gray-600 max-w-[160px] truncate align-top"
                                            title={(field.samples || []).join(
                                              ", ",
                                            )}
                                          >
                                            {field.samples && field.samples[0]
                                              ? field.samples[0]
                                              : "—"}
                                          </td>
                                          <td className="px-4 py-2.5 align-top">
                                            {field.meta &&
                                            Object.keys(field.meta).length >
                                              0 ? (
                                              <div className="flex flex-wrap gap-1">
                                                {Object.entries(field.meta)
                                                  .slice(0, 3)
                                                  .map(([k, v]) => (
                                                    <span
                                                      key={k}
                                                      className="inline-flex rounded border border-gray-200 bg-gray-100 px-1.5 py-0.5 text-xs text-gray-700"
                                                      title={
                                                        typeof v === "object"
                                                          ? JSON.stringify(v)
                                                          : String(v)
                                                      }
                                                    >
                                                      {k}:{" "}
                                                      {typeof v === "boolean"
                                                        ? v
                                                          ? "✓"
                                                          : "—"
                                                        : String(v).slice(
                                                            0,
                                                            12,
                                                          )}
                                                    </span>
                                                  ))}
                                              </div>
                                            ) : (
                                              <span className="text-gray-400 text-xs">
                                                —
                                              </span>
                                            )}
                                          </td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      },
                    )}
                  </div>
                )}
              </section>
            )}

            {/* <div className="mt-4 border-t pt-8 flex items-center">
              <button
                onClick={() => setShowJobDetails(!showJobDetails)}
                className={`inline-flex items-center justify-center gap-2 rounded-lg h-11 min-w-[180px] text-sm font-semibold shadow-md transition-all border
                ${
                  showJobDetails
                    ? "bg-[#2B245C] border-[#2B245C] text-white hover:bg-opacity-90"
                    : "bg-white border-[#2B245C] text-[#2B245C] hover:bg-gray-100"
                }
              `}
                data-tour="job-details"
              >
                {showJobDetails ? (
                  <FaEyeSlash size={15} />
                ) : (
                  <FaEye size={15} />
                )}
                {showJobDetails ? "Hide Job Details " : "Show Job Details"}
              </button> */}

            {activeTab === "findings" && (
              <button
                onClick={() => {
                  setCompareStep("menu");
                  setIsCompareOpen(true);
                }}
                className="rounded-lg bg-[#2B245C] h-11 min-w-[180px] justify-center ml-4 text-sm font-semibold text-white shadow-md hover:bg-opacity-90"
                data-tour="compare-btn"
              >
                Compare Both Findings
              </button>
            )}
            {/* </div> */}

            {activeTab === "job-details" && (
              <div className="space-y-8" data-tour="job-details-section">
                {/* Job Details (kept, but styled closer to reference) */}
                <section className="rounded-2xl border border-[#2B245C] bg-white p-6 shadow-lg hover:shadow-2xl transition-shadow duration-300">
                  <div className="mb-3 flex items-center justify-between">
                    <h2 className="text-2xl font-semibold text-[#2B245C]">
                      Job Details
                    </h2>

                    <div className="flex items-center gap-2">
                      {selectedJob?.status && (
                        <span
                          className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs ${statusTone(
                            selectedJob.status,
                          )}`}
                        >
                          {(selectedJob.status || "").replace(/_/g, " ")}
                        </span>
                      )}

                      {selectedJob && (
                        <>
                          <button
                            onClick={rerunJob}
                            disabled={acting}
                            className="rounded-lg border border-[#2B245C] bg-white px-3 py-1.5 text-sm text-[#2B245C] hover:bg-indigo-50 transition-all disabled:opacity-60"
                          >
                            {acting ? "Working…" : "Re-run"}
                          </button>
                          <button
                            onClick={cancelJob}
                            disabled={
                              acting ||
                              (selectedJob.status || "").toLowerCase() !==
                                "queued"
                            }
                            className="rounded-lg border border-red-500 bg-white px-3 py-1.5 text-sm text-red-700 hover:bg-red-50 transition-all disabled:opacity-60"
                          >
                            Cancel
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  {!selectedJob ? (
                    <div className="text-sm text-gray-600">
                      Select a job to view details.
                    </div>
                  ) : loadingDetails ? (
                    <DetailsSkeleton />
                  ) : jobDetails ? (
                    <div className="rounded-lg border border-gray-300 bg-gray-50 p-3 text-xs text-gray-800 overflow-auto max-h-72">
                      <pre>{JSON.stringify(jobDetails, null, 2)}</pre>
                    </div>
                  ) : (
                    <div className="text-sm text-gray-600">No details.</div>
                  )}
                </section>

                {/* Job Config (kept, but styled closer to reference) */}
                <section className="rounded-2xl border border-[#2B245C] bg-white p-6 shadow-lg hover:shadow-2xl transition-shadow duration-300">
                  <div className="mb-3 flex items-center justify-between">
                    <h2 className="text-2xl font-semibold text-[#2B245C]">
                      Job Config
                    </h2>
                    <div className="flex gap-2">
                      <button
                        onClick={() =>
                          selectedJob &&
                          fetchConfig(selectedJob._id || selectedJob.id)
                        }
                        className="rounded-lg border border-[#2B245C] bg-white px-3 py-1.5 text-sm text-[#2B245C] hover:bg-indigo-50 transition-all disabled:opacity-60"
                      >
                        {loadingConfig ? "Loading…" : "Reload"}
                      </button>
                      {configObj && (
                        <>
                          <button
                            onClick={() =>
                              downloadJson(configObj, "config.json")
                            }
                            className="rounded-lg border border-[#2B245C] bg-white px-3 py-1.5 text-sm text-[#2B245C] hover:bg-indigo-50 transition-all"
                          >
                            Download
                          </button>
                          <button
                            onClick={() => copyJson(configObj)}
                            className="rounded-lg border border-[#2B245C] bg-white px-3 py-1.5 text-sm text-[#2B245C] hover:bg-indigo-50 transition-all"
                          >
                            Copy
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  {!selectedJob ? (
                    <div className="text-sm text-gray-600">
                      Select a job to view config.
                    </div>
                  ) : loadingConfig ? (
                    <DetailsSkeleton />
                  ) : configObj ? (
                    <div className="rounded-lg border border-gray-300 bg-gray-50 p-3 text-xs text-gray-800 overflow-auto max-h-72">
                      <pre>{JSON.stringify(configObj, null, 2)}</pre>
                    </div>
                  ) : (
                    <div className="text-sm text-gray-600">
                      No config loaded.
                    </div>
                  )}
                </section>

                {/* Ingest CSV (kept exactly functionally; styling slightly aligned) */}
                <section className="rounded-2xl border border-[#2B245C] bg-white p-6 shadow-lg hover:shadow-2xl transition-shadow duration-300">
                  <h2 className="text-2xl font-semibold text-[#2B245C] mb-2">
                    Ingest CSV
                  </h2>

                  {!selectedJob ? (
                    <div className="text-sm text-gray-600">
                      Select a job first.
                    </div>
                  ) : (
                    <>
                      <div className="mb-2 text-xs text-gray-600">
                        Paste your scanner CSV output or upload a .csv file.
                        Expected headers (case-insensitive):{" "}
                        <code>
                          File Path, Source, Tag/Line, Type, Matched Text,
                          Frameworks, Severity, Weight
                        </code>
                      </div>

                      <div className="flex items-center gap-3 mb-2">
                        <input
                          type="file"
                          accept=".csv,text/csv"
                          onChange={(e) => onCsvFile(e.target.files?.[0])}
                          className="text-sm"
                        />
                        <button
                          onClick={ingestCsv}
                          disabled={ingesting || !csvText.trim()}
                          className="rounded-lg bg-[#2B245C] px-3 py-1.5 text-sm font-semibold text-white hover:bg-opacity-90 disabled:opacity-60"
                        >
                          {ingesting ? "Ingesting..." : "Ingest CSV"}
                        </button>
                      </div>

                      <textarea
                        className="h-32 w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-mono"
                        value={csvText}
                        onChange={(e) => setCsvText(e.target.value)}
                        placeholder={`File Path,Source,Tag/Line,Type,Matched Text,Frameworks,Severity,Weight
                                      C:\\\\file.txt,CONTENT,12,Email,user@example.com,GDPR,Medium,2`}
                      />
                    </>
                  )}
                </section>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Findings Table Modal */}
      <TableModal
        open={openTableModal}
        onClose={() => setOpenTableModal(false)}
        title={modalTitle}
        rows={modalRows}
      />

      {/* ✅ Popup */}
      <CompareModal
        open={isCompareOpen}
        onClose={() => setIsCompareOpen(false)}
      />

      <Tour steps={steps} open={tourOpen} onClose={() => setTourOpen(false)} />
    </div>
  );
}

