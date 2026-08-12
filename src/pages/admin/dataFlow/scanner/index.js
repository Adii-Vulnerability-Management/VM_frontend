import React, {
  useEffect,
  useMemo,
  useState,
  useCallback,
  useRef,
} from "react";
import { useRouter } from "next/router";
import CustomAxios from "@/globalcomponents/CustomAxios";
import { baseurl, initURL } from "@/config/config";
import DataFlowNav from "../Nav";
import { can, guard } from "@/auth/auth-permissions";

/* ======================= HOISTED HELPERS & SUBCOMPONENTS ======================= */

// DEBUG: small debounce to reduce parent churn (stable; defined once)
function useDebouncedCallback(fn, delay = 200) {
  const t = useRef();
  return useCallback(
    (...args) => {
      clearTimeout(t.current);
      t.current = setTimeout(() => fn(...args), delay);
    },
    [fn, delay],
  );
}

// HOISTED, MEMOIZED ROW (stable identity)
const ConnectorRow = React.memo(function ConnectorRow({
  c,
  idx,
  detectorNames,
  detectors,
  updateConnector,
  removeConnector,
  toggleDetector,
  onExcludeDirsChange,
  textFromExcludeDirs,
  canUpdate,
  router,
}) {
  const rowRenderRef = useRef(0);
  rowRenderRef.current += 1;
  console.debug(`[Row ${c.id}] render #${rowRenderRef.current}`);

  useEffect(() => {
    console.log(`[Row ${c.id}] mounted`);
    return () => console.log(`[Row ${c.id}] unmounted`);
  }, [c.id]);

  // Local mirrors (harden focus against parent updates)
  const [name, setName] = useState(c.name);
  const [type, setType] = useState(c.type);
  const [uri, setUri] = useState(c.uri || "");
  const [extra, setExtra] = useState(c.extra || "");
  const [ocr, setOcr] = useState(!!c.ocr);
  const [run, setRun] = useState(!!c.run);

  // Keep local in sync if parent changes externally (e.g., load/reset)
  useEffect(() => {
    setName(c.name);
  }, [c.name]);
  useEffect(() => {
    setType(c.type);
  }, [c.type]);
  useEffect(() => {
    setUri(c.uri || "");
  }, [c.uri]);
  useEffect(() => {
    setExtra(c.extra || "");
  }, [c.extra]);
  useEffect(() => {
    setOcr(!!c.ocr);
  }, [c.ocr]);
  useEffect(() => {
    setRun(!!c.run);
  }, [c.run]);

  const debCommit = useDebouncedCallback((patch) => {
    console.log(`[Row ${c.id}] debounced commit`, patch);
    updateConnector(idx, patch);
  }, 200);

  return (
    <div className="rounded-xl border border-gray-200 p-3">
      <div className="flex flex-wrap items-center gap-3">
        <input
          className="w-40 rounded-lg border border-gray-200 px-3 py-2 text-sm"
          placeholder="name"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            debCommit({ name: e.target.value });
          }}
          onBlur={() => updateConnector(idx, { name })}
        />

        {/* connector type with suggestions but accepts any string */}
        <input
          className="w-44 rounded-lg border border-gray-200 px-3 py-2 text-sm"
          placeholder="type (fs, s3, db.sql, ...)"
          value={type}
          onChange={(e) => {
            setType(e.target.value);
            debCommit({ type: e.target.value });
          }}
          onBlur={() => updateConnector(idx, { type })}
          autoComplete="off"
        />

        <input
          className="min-w-[280px] flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm"
          placeholder="uri (e.g., file:///C:/path or s3://bucket/prefix)"
          value={uri}
          onChange={(e) => {
            setUri(e.target.value);
            debCommit({ uri: e.target.value });
          }}
          onBlur={() => updateConnector(idx, { uri })}
        />

        <label className="inline-flex items-center gap-2 text-sm text-gray-800">
          <input
            type="checkbox"
            checked={run}
            onChange={(e) =>
              guard(canUpdate, router, () => {
                setRun(e.target.checked);
                updateConnector(idx, { run: e.target.checked });
              })
            }
            className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
          />
          run
        </label>

        <label className="inline-flex items-center gap-2 text-sm text-gray-800">
          <input
            type="checkbox"
            checked={ocr}
            onChange={(e) => {
              guard(canUpdate, router, () => {
                setOcr(e.target.checked);
                updateConnector(idx, { ocr: e.target.checked });
              });
            }}
            className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
          />
          ocr
        </label>

        <button
          onClick={() => guard(canUpdate, router, () => removeConnector(idx))}
          className="ml-auto rounded-lg border border-red-200 bg-white px-3 py-2 text-sm text-red-700 hover:bg-red-50"
          type="button"
        >
          Remove
        </button>
      </div>

      <div className="mt-3 grid gap-3 md:grid-cols-2">
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-600">
            use_detectors (click to toggle)
          </label>
          <div className="flex flex-wrap gap-2">
            {detectorNames.length === 0 ? (
              <span className="text-xs text-gray-500">
                No detectors loaded.
              </span>
            ) : (
              detectorNames.map((d) => {
                const active = (c.use_detectors || []).includes(d);
                return (
                  <button
                    key={d}
                    type="button"
                    onClick={() =>
                      guard(canUpdate, router, () => toggleDetector(idx, d))
                    }
                    className={[
                      "rounded-full border px-3 py-1 text-xs",
                      active
                        ? "border-indigo-300 bg-indigo-50 text-indigo-700"
                        : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50",
                    ].join(" ")}
                    title={JSON.stringify(detectors[d] || {}, null, 0)}
                  >
                    {d}
                  </button>
                );
              })
            )}
          </div>
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-gray-600">
            exclude_dirs (comma separated)
          </label>
          <input
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
            placeholder="e.g., node_modules, dist, temp"
            value={textFromExcludeDirs(c.exclude_dirs)}
            onChange={(e) =>
              guard(canUpdate, router, () =>
                onExcludeDirsChange(idx, e.target.value),
              )
            }
          />
        </div>
      </div>

      {/* Advanced JSON overrides */}
      <div className="mt-3">
        <details className="rounded-lg border border-gray-200 bg-white">
          <summary className="cursor-pointer select-none px-3 py-2 text-sm text-gray-800">
            Advanced (JSON overrides)
          </summary>
          <div className="p-3">
            <textarea
              className="h-32 w-full rounded-lg border border-gray-200 px-3 py-2 text-xs font-mono"
              placeholder='Example: {"host":"192.168.1.10","port":445,"username_env":"SMB_USER","password_env":"SMB_PASS"}'
              value={extra}
              onChange={(e) => {
                setExtra(e.target.value);
                debCommit({ extra: e.target.value });
              }}
              onBlur={() => updateConnector(idx, { extra })}
            />
            <p className="mt-2 text-xs text-gray-500">
              Merged into the connector at render. Prefer *_env fields for
              secrets.
            </p>
          </div>
        </details>
      </div>
    </div>
  );
});

// HOISTED header (static)
const Header = React.memo(function Header() {
  return (
    <div className="px-6 py-8 bg-[#2B245C] rounded-2xl shadow-lg hover:shadow-2xl transition-shadow duration-300">
      {/* Left side: title + description */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold text-cyan-50">
            Scanner Config Builder
          </h1>
          <p className="mt-1 text-sm text-white">
            Compose connectors with global detectors & policies. Validate then
            render scanner <code>config.json</code>.
          </p>
        </div>
        {/* Right side: help button */}
        <div data-tour="help-button" className="flex items-center">
          {/* <GuideButton
              onClick={onHelp}
              variant="primary"
              size="md"
              className="
              !from-blue-500 !to-blue-600
              hover:!from-blue-400 hover:!to-blue-500
              !text-white
              !border-blue-400/70
              !shadow-blue-600/30
            "
            >
              Help
            </GuideButton> */}
        </div>
      </div>
    </div>
  );
});

// HOISTED globals panel
const GlobalsPanel = React.memo(function GlobalsPanel({
  loadingGlobals,
  error,
  defaults,
  detectors,
  policies,
  notifications,
  aliases,
  fetchGlobals,
}) {
  return (
    <section
      className="rounded-2xl border border-[#2B245C] bg-white p-6 shadow-lg hover:shadow-2xl transition-shadow duration-300"
      data-tour="globals-panel"
    >
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-[#2B245C]">Global Settings</h2>
        <button
          onClick={fetchGlobals}
          className="inline-flex items-center rounded-xl border border-[#2B245C] bg-white px-3 py-1.5 text-sm text-[#2B245C] hover:bg-gray-50"
        >
          {loadingGlobals ? (
            <>
              <span className="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/60 border-t-white" />
              Reload
            </>
          ) : (
            "Reload"
          )}
        </button>
      </div>

      {error && (
        <div className="mb-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      )}

      {!defaults ? (
        <div className="animate-pulse">
          <div className="h-5 w-40 rounded bg-gray-200 mb-2" />
          <div className="h-20 w-full rounded bg-gray-100" />
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 text-xs text-gray-800 overflow-auto max-h-64">
            <div className="text-gray-700 font-semibold mb-2">Defaults</div>
            <pre>{JSON.stringify(defaults, null, 2)}</pre>
          </div>
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 text-xs text-gray-800 overflow-auto max-h-64">
            <div className="text-gray-700 font-semibold mb-2">Detectors</div>
            <pre>{JSON.stringify(detectors, null, 2)}</pre>
          </div>
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 text-xs text-gray-800 overflow-auto max-h-64">
            <div className="text-gray-700 font-semibold mb-2">Policies</div>
            <pre>{JSON.stringify(policies, null, 2)}</pre>
          </div>
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 text-xs text-gray-800 overflow-auto max-h-64">
            <div className="text-gray-700 font-semibold mb-2">
              Notifications & Aliases
            </div>
            <pre>{JSON.stringify({ notifications, aliases }, null, 2)}</pre>
          </div>
        </div>
      )}
    </section>
  );
});

// HOISTED connectors panel (uses hoisted ConnectorRow)
const ConnectorsPanel = React.memo(function ConnectorsPanel({
  connectors,
  addConnector,
  detectorNames,
  detectors,
  updateConnector,
  removeConnector,
  toggleDetector,
  onExcludeDirsChange,
  textFromExcludeDirs,
  canUpdate,
  router,
}) {
  return (
    <section
      className="rounded-2xl border border-[#2B245C] bg-white p-6 shadow-lg hover:shadow-2xl transition-shadow duration-300"
      data-tour="connectors-panel"
    >
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-[#2B245C]">Connectors</h2>
        <button
          onClick={() => guard(canUpdate, router, addConnector)}
          className="inline-flex items-center rounded-xl border border-[#2B245C] bg-white px-3 py-2 text-sm text-[#2B245C] hover:bg-gray-50"
          type="button"
        >
          + Add Connector
        </button>
      </div>

      <div className="space-y-3">
        {connectors.length === 0 ? (
          <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-6 text-sm text-gray-600">
            No connectors. Click “Add Connector” to start.
          </div>
        ) : (
          connectors.map((c, idx) => (
            <ConnectorRow
              key={c.id} // stable key keeps row instance (no remount)
              c={c}
              idx={idx}
              detectorNames={detectorNames}
              detectors={detectors}
              updateConnector={updateConnector}
              removeConnector={removeConnector}
              toggleDetector={toggleDetector}
              onExcludeDirsChange={onExcludeDirsChange}
              textFromExcludeDirs={textFromExcludeDirs}
              canUpdate={canUpdate}
              router={router}
            />
          ))
        )}
      </div>
    </section>
  );
});

// HOISTED validation panel
const ValidationPanel = React.memo(function ValidationPanel({
  validating,
  validation,
  validateConfig,
  canUpdate,
  router,
}) {
  return (
    <section
      className="rounded-2xl border border-[#2B245C] bg-white p-6 shadow-lg hover:shadow-2xl transition-shadow duration-300"
      data-tour="validate-panel"
    >
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-[#2B245C]">Validate</h2>
        <button
          onClick={() => guard(canUpdate, router, validateConfig)}
          className="rounded-xl border border-[#2B245C] bg-white px-4 py-2 text-sm text-[#2B245C] hover:bg-gray-50"
          disabled={validating}
          type="button"
        >
          {validating ? (
            <>
              <span className="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-indigo-600" />
              Validating…
            </>
          ) : (
            "Run Validation"
          )}
        </button>
      </div>

      {!validation ? (
        <div className="text-sm text-gray-600">
          Run validation to see errors/warnings.
        </div>
      ) : validation.ok ? (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
          ✅ Looks good. No blocking errors.
          {validation.warnings?.length > 0 && (
            <div className="mt-2 text-emerald-900/80">
              <div className="font-medium">Warnings:</div>
              <ul className="ml-5 list-disc">
                {validation.warnings.map((w, i) => (
                  <li key={i}>{w}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      ) : (
        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
          ❌ Validation failed.
          <ul className="ml-5 mt-2 list-disc">
            {validation.errors?.map((e, i) => (
              <li key={i}>{e}</li>
            ))}
          </ul>
          {validation.warnings?.length > 0 && (
            <div className="mt-2 text-red-900/80">
              <div className="font-medium">Warnings:</div>
              <ul className="ml-5 list-disc">
                {validation.warnings.map((w, i) => (
                  <li key={i}>{w}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </section>
  );
});

// HOISTED render panel
const RenderPanel = React.memo(function RenderPanel({
  rendering,
  renderedConfig,
  renderConfig,
  downloadJson,
  copyJson,
  canUpdate,
  canExport,
  router,
}) {
  return (
    <section
      className="rounded-2xl border border-[#2B245C] bg-white p-6 shadow-lg hover:shadow-2xl transition-shadow duration-300"
      data-tour="render-panel"
    >
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-[#2B245C]">Render & Export</h2>
        <div className="flex items-center gap-2">
          <button
            onClick={() => guard(canUpdate, router, renderConfig)}
            className="rounded-xl bg-[#2B245C] px-4 py-2 text-sm font-semibold text-white hover:bg-opacity-90 disabled:opacity-60"
            disabled={rendering}
            type="button"
          >
            {rendering ? (
              <span className="inline-flex items-center">
                <span className="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/60 border-t-white" />
                Rendering…
              </span>
            ) : (
              "Render config.json"
            )}
          </button>
          {renderedConfig && (
            <>
              <button
                onClick={() =>
                  guard(canExport, router, () => downloadJson(renderedConfig))
                }
                className="rounded-xl border border-[#2B245C] bg-white px-4 py-2 text-sm text-[#2B245C] hover:bg-gray-50"
                type="button"
              >
                Download
              </button>
              <button
                onClick={() =>
                  guard(canExport, router, () => copyJson(renderedConfig))
                }
                className="rounded-xl border border-[#2B245C] bg-white px-4 py-2 text-sm text-[#2B245C] hover:bg-gray-50"
                type="button"
              >
                Copy
              </button>
            </>
          )}
        </div>
      </div>

      {renderedConfig ? (
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 text-xs text-gray-800 overflow-auto max-h-[480px]">
          <pre>{JSON.stringify(renderedConfig, null, 2)}</pre>
        </div>
      ) : (
        <div className="text-sm text-gray-600">
          Click <span className="font-medium">Render config.json</span> to
          preview the final scanner config (flat).
        </div>
      )}
    </section>
  );
});

/* ========================= PAGE (top-level) ========================= */

export default function ScannerConfigPage() {
  const router = useRouter();

  const apiBase = `${baseurl}/${initURL}/dataflow/scanner-config`;

  const canUpdate = can("privacy.update");
  const canExport = can("privacy.export");

  // DEBUG: render counter & mount logs
  const renderCountRef = useRef(0);
  renderCountRef.current += 1;
  console.debug("[Page] render count =", renderCountRef.current);

  useEffect(() => {
    console.log("[Page] mounted");
    return () => console.log("[Page] unmounted");
  }, []);

  // DEBUG: focus tracker
  const describeEl = (el) => {
    if (!el) return "(none)";
    const tag = el.tagName?.toLowerCase?.() || "";
    const id = el.id ? `#${el.id}` : "";
    const name = el.getAttribute?.("name")
      ? `[name="${el.getAttribute("name")}"]`
      : "";
    const cls =
      el.className && typeof el.className === "string"
        ? `.${el.className.split(" ").join(".")}`
        : "";
    return `${tag}${id}${name}${cls}`;
  };

  useEffect(() => {
    const onFocus = (e) => {
      console.log(
        "[Focus] focusin ->",
        describeEl(e.target),
        "active:",
        describeEl(document.activeElement),
      );
    };
    const onBlur = (e) => {
      console.log(
        "[Focus] focusout ->",
        describeEl(e.target),
        "active:",
        describeEl(document.activeElement),
      );
    };
    window.addEventListener("focusin", onFocus);
    window.addEventListener("focusout", onBlur);
    return () => {
      window.removeEventListener("focusin", onFocus);
      window.removeEventListener("focusout", onBlur);
    };
  }, []);

  // DEBUG: click guard — logs anchors and blocks same-page/hash navs that cause jumps
  useEffect(() => {
    const stop = (e) => {
      const a = e.target.closest?.("a[href]");
      if (!a) return;
      const href = a.getAttribute("href");
      console.log("[Click] anchor", { href });
      if (href === "#" || href === "" || href === window.location.pathname) {
        e.preventDefault();
        console.warn("[Click] blocked same-page/hash navigation from", a);
      }
    };
    document.addEventListener("click", stop, true);
    return () => document.removeEventListener("click", stop, true);
  }, []);

  // globals from backend
  const [defaults, setDefaults] = useState(null);
  const [detectors, setDetectors] = useState({}); // map by name -> {name, severity, ...}
  const [policies, setPolicies] = useState({}); // map by name -> {name, ...}
  const [notifications, setNotifications] = useState({});
  const [aliases, setAliases] = useState({});
  const [loadingGlobals, setLoadingGlobals] = useState(false);
  const [error, setError] = useState("");

  // helper: stable id per connector
  const newConnector = () => ({
    id:
      typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : `c_${Math.random().toString(36).slice(2)}`,
    name: "",
    type: "fs",
    uri: "",
    run: false,
    ocr: false,
    exclude_dirs: [],
    use_detectors: [],
    extra: "", // Advanced JSON overrides merged at render
  });

  // connectors builder
  const [connectors, setConnectors] = useState([
    {
      id:
        typeof crypto !== "undefined" && crypto.randomUUID
          ? crypto.randomUUID()
          : `c_${Math.random().toString(36).slice(2)}`,
      name: "os-privacy",
      type: "fs",
      uri: "file:///C:/Users/mange/Documents/nis/privacy",
      run: true,
      ocr: true,
      exclude_dirs: ["temp", "backup"],
      use_detectors: ["SSN", "Email", "MRN", "Credit Card"],
      extra: "", // Advanced JSON overrides merged at render
    },
  ]);

  // validate & render
  const [validating, setValidating] = useState(false);
  const [validation, setValidation] = useState(null); // {ok, errors[], warnings[]}
  const [rendering, setRendering] = useState(false);
  const [renderedConfig, setRenderedConfig] = useState(null);

  /* ------------------------------ helpers ------------------------------ */

  const detectorNames = useMemo(
    () => Object.keys(detectors || {}),
    [detectors],
  );

  const addConnector = useCallback(() => {
    console.log("[Action] addConnector");
    setConnectors((prev) => [...prev, newConnector()]);
  }, []);

  const removeConnector = useCallback((idx) => {
    console.log("[Action] removeConnector", { idx });
    setConnectors((prev) => prev.filter((_, i) => i !== idx));
  }, []);

  const updateConnector = useCallback((idx, patch) => {
    console.log("[Action] updateConnector", { idx, patch });
    setConnectors((prev) =>
      prev.map((c, i) => (i === idx ? { ...c, ...patch } : c)),
    );
  }, []);

  const toggleDetector = useCallback((idx, label) => {
    console.log("[Action] toggleDetector", { idx, label });
    setConnectors((prev) =>
      prev.map((c, i) => {
        if (i !== idx) return c;
        const set = new Set(c.use_detectors || []);
        if (set.has(label)) set.delete(label);
        else set.add(label);
        return { ...c, use_detectors: Array.from(set) };
      }),
    );
  }, []);

  const onExcludeDirsChange = useCallback(
    (idx, val) => {
      console.log("[Action] onExcludeDirsChange", { idx, val });
      const arr = (val || "")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      updateConnector(idx, { exclude_dirs: arr });
    },
    [updateConnector],
  );

  const textFromExcludeDirs = (arr) => (arr || []).join(", ");

  const downloadJson = (obj, filename = "config.json") => {
    console.log("[Action] downloadJson", { filename });
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
      console.log("[Action] copyJson");
      await navigator.clipboard.writeText(JSON.stringify(obj, null, 2));
    } catch (e) {
      console.warn("[Action] copyJson failed", e);
    }
  };

  // helpers to convert arrays->maps for UI convenience
  const toMapByName = (arr = []) =>
    Object.fromEntries((arr || []).filter(Boolean).map((x) => [x.name, x]));

  /* ------------------------------ API calls ------------------------------ */

  // Load globals via dedicated endpoints
  const fetchGlobals = async () => {
    setLoadingGlobals(true);
    setError("");
    console.log("[API] fetchGlobals start");
    try {
      const [settingsRes, rulebookRes] = await Promise.all([
        CustomAxios.get(`${apiBase}/settings`),
        CustomAxios.get(`${apiBase}/rulebook`),
      ]);

      const s = settingsRes?.data || {};
      const rb = rulebookRes?.data || {};

      setDefaults(s.defaults || {});
      setNotifications(s.notifications || {});

      setDetectors(toMapByName(rb.detectors || []));
      setPolicies(toMapByName(rb.policies || []));
      setAliases(rb.aliases?.map || {});
      console.log("[API] fetchGlobals success", {
        defaults: !!s.defaults,
        detectors: (rb.detectors || []).length,
      });
    } catch (err) {
      console.error(
        "fetch globals error:",
        err?.response || err?.message || err,
      );
      setError("Failed to load global settings/rulebook.");
    } finally {
      setLoadingGlobals(false);
      console.log("[API] fetchGlobals done");
    }
  };

  // Build connectors payload (merge Advanced JSON)
  const buildMergedConnectors = () => {
    console.log("[Build] buildMergedConnectors");
    return connectors.map((c, i) => {
      let extra = {};
      if (c.extra && c.extra.trim().length > 0) {
        try {
          extra = JSON.parse(c.extra);
        } catch (e) {
          console.error(
            "[Build] invalid JSON in Advanced overrides at",
            c.name || i + 1,
            e,
          );
          throw new Error(
            `Connector ${c.name || i + 1}: invalid JSON in Advanced overrides.`,
          );
        }
      }
      // strip UI-only id
      const { id, extra: _extraText, ...rest } = c;
      return { ...rest, ...extra, run: !!c.run };
    });
  };

  const validateConfig = async () => {
    setValidating(true);
    setError("");
    setValidation(null);
    console.log("[API] validateConfig start");
    try {
      // quick client check
      const invalid = connectors.find(
        (c) =>
          c.run &&
          (!c.name || !c.type || (!c.uri && !(c.extra && c.extra.trim()))),
      );
      if (invalid)
        throw new Error(
          "Connector with run:true needs name, type, and either uri or Advanced JSON.",
        );

      const payload = {
        detectors: Object.values(detectors),
        policies: Object.values(policies),
        aliases: { map: aliases },
        connectors: buildMergedConnectors(),
      };

      const res = await CustomAxios.post(`${apiBase}/validate`, payload);
      setValidation(res?.data || { ok: true, errors: [], warnings: [] });
      console.log("[API] validateConfig success", res?.data);
    } catch (err) {
      console.error("validate error:", err?.response || err?.message || err);
      setError(err?.message || "Validation failed.");
      setValidation(null);
    } finally {
      setValidating(false);
      console.log("[API] validateConfig done");
    }
  };

  const renderConfig = async () => {
    setRendering(true);
    setError("");
    setRenderedConfig(null);
    console.log("[API] renderConfig start");
    try {
      const mergedConnectors = buildMergedConnectors();

      const res = await CustomAxios.post(
        `${apiBase}/render?format=flat`, // scanner-ready (flat)
        { connectors: mergedConnectors },
      );
      setRenderedConfig(res?.data || null);
      console.log("[API] renderConfig success");
    } catch (err) {
      console.error("render error:", err?.response || err?.message || err);
      setError(err?.message || "Failed to render config.");
    } finally {
      setRendering(false);
      console.log("[API] renderConfig done");
    }
  };

  /* ------------------------------ effects ------------------------------ */

  useEffect(() => {
    fetchGlobals();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ------------------------------ UI ------------------------------ */

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <DataFlowNav />
      <div className="bg-white rounded-lg p-5 my-3 mx-5">
        <Header />

        <div className="py-5 space-y-5">
          <GlobalsPanel
            loadingGlobals={loadingGlobals}
            error={error}
            defaults={defaults}
            detectors={detectors}
            policies={policies}
            notifications={notifications}
            aliases={aliases}
            fetchGlobals={fetchGlobals}
          />
          <ConnectorsPanel
            connectors={connectors}
            addConnector={addConnector}
            detectorNames={detectorNames}
            detectors={detectors}
            updateConnector={updateConnector}
            removeConnector={removeConnector}
            toggleDetector={toggleDetector}
            onExcludeDirsChange={onExcludeDirsChange}
            textFromExcludeDirs={textFromExcludeDirs}
            canUpdate={canUpdate}
            router={router}
          />
          <ValidationPanel
            validating={validating}
            validation={validation}
            validateConfig={validateConfig}
            canUpdate={canUpdate}
            router={router}
          />
          <RenderPanel
            rendering={rendering}
            renderedConfig={renderedConfig}
            renderConfig={renderConfig}
            downloadJson={downloadJson}
            copyJson={copyJson}
            canUpdate={canUpdate}
            canExport={canExport}
            router={router}
          />
        </div>
      </div>
    </div>
  );
}
