import React, {
  useEffect,
  useMemo,
  useState,
  useCallback,
  useRef,
} from "react";
import CustomAxios from "@/globalcomponents/CustomAxios";
import { baseurl, initURL } from "@/config/config";
import DataFlowNav from "../Nav";
import { useRouter } from "next/router";
import { can, guard } from "@/auth/auth-permissions";

const SEVERITIES = ["Low", "Medium", "High", "Critical"];
const WEIGHTS = [1, 2, 3];
const ACTIONS = ["alert", "notify", "redact", "ticket"];

// NEW: stable id helper for UI rows (prevents remount/focus loss)
const newId = () =>
  typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : `id_${Math.random().toString(36).slice(2)}`;

/* ---------------- HOISTED, PURE SUBCOMPONENTS (stable identity) ---------------- */

const Header = React.memo(function Header() {
  return (
    <div
      className="px-6 py-8 bg-[#2B245C] rounded-2xl shadow-lg hover:shadow-2xl transition-shadow duration-300 relative"
      data-tour="rulebook-header"
    >
      {/* Header Content */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold text-cyan-50">
            Rulebook (Detectors & Policies)
          </h1>
          <p className="mt-1 text-sm text-white">
            Manage detectors, policies, and aliases that drive the scanner.
          </p>
        </div>
        {/* Floating Help Button */}
        <div data-tour="help-button">
          {/* <GuideButton
            onClick={onHelp} // Trigger the help tour
            variant="primary"
            size="md"
            className="
              !from-blue-500 !to-blue-600
              hover:!from-blue-400 hover:!to-blue-500
              !text-white
              !border-blue-400/70
              !shadow-blue-600/30
            "
          /> */}
        </div>
      </div>
    </div>
  );
});

const Toolbar = React.memo(function Toolbar({
  loading,
  validating,
  saving,
  error,
  message,
  fetchRulebook,
  validateRulebook,
  putRulebook,
  canUpdate,
  router,
}) {
  return (
    <div className="rounded-2xl border border-[#2B245C] bg-white p-6 shadow-lg hover:shadow-2xl transition-shadow duration-300 flex flex-wrap gap-3">
      <button
        onClick={fetchRulebook}
        className="rounded-lg border border-[#2B245C] bg-white px-4 py-2 text-sm font-medium text-[#2B245C] hover:bg-indigo-50 transition-all"
        disabled={loading}
        type="button" // NEW: avoid accidental form submits
      >
        {loading ? "Loading…" : "Reload"}
      </button>
      <button
        onClick={() => guard(canUpdate, router, validateRulebook)}
        className="rounded-lg border border-[#2B245C] bg-white px-4 py-2 text-sm font-medium text-[#2B245C] hover:bg-indigo-50 transition-all"
        disabled={validating}
        type="button"
      >
        {validating ? "Validating…" : "Validate"}
      </button>
      <button
        onClick={() => guard(canUpdate, router, putRulebook)}
        className="rounded-lg bg-[#2B245C] text-white px-4 py-2 text-sm font-semibold shadow-md hover:shadow-lg hover:bg-opacity-90 transition-all disabled:opacity-60"
        disabled={saving}
        type="button"
      >
        {saving ? "Saving…" : "Save"}
      </button>

      {error && (
        <div className="ml-auto rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      )}
      {message && (
        <div className="ml-auto rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
          {message}
        </div>
      )}
    </div>
  );
});

const ValidationPanel = React.memo(function ValidationPanel({ validation }) {
  if (!validation) return null;
  return (
    <div className="mx-auto max-w-6xl px-4">
      {validation.ok ? (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
          ✅ Looks good.{" "}
          {validation.warnings?.length ? "Some warnings below." : ""}
          {validation.warnings?.length > 0 && (
            <ul className="ml-5 mt-2 list-disc text-emerald-900/80">
              {validation.warnings.map((w, i) => (
                <li key={i}>{w}</li>
              ))}
            </ul>
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
            <>
              <div className="mt-2 font-medium">Warnings</div>
              <ul className="ml-5 list-disc text-red-900/80">
                {validation.warnings.map((w, i) => (
                  <li key={i}>{w}</li>
                ))}
              </ul>
            </>
          )}
        </div>
      )}
    </div>
  );
});

const DetectorsPanel = React.memo(function DetectorsPanel({
  detectors,
  setDetectorField,
  addDetector,
  removeDetector,
  toggleFramework,
  addFramework,
  canUpdate,
  router,
}) {
  return (
    <section
      className="rounded-2xl border border-[#2B245C] bg-white p-6 shadow-lg hover:shadow-2xl transition-shadow duration-300 space-y-3"
      data-tour="rulebook-detectors"
    >
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-[#2B245C]">Detectors</h2>
        <button
          onClick={() => guard(canUpdate, router, addDetector)}
          className="rounded-lg border border-[#2B245C] bg-white px-3 py-2 text-sm text-[#2B245C] hover:bg-gray-50"
          type="button"
        >
          + Add Detector
        </button>
      </div>
      {detectors.length === 0 ? (
        <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-6 text-sm text-gray-600">
          No detectors. Click “Add Detector”.
        </div>
      ) : (
        detectors.map((d, idx) => (
          <div
            key={d.id /* NEW: stable key */}
            className="rounded-xl border border-gray-200 bg-white p-4"
          >
            <div className="flex flex-wrap items-center gap-3">
              <input
                className="w-56 rounded-lg border border-gray-200 px-3 py-2 text-sm"
                placeholder="name (e.g., Email, SSN)"
                value={d.name}
                onChange={(e) => setDetectorField(idx, "name", e.target.value)}
              />
              <select
                className="w-40 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm"
                value={d.severity}
                onChange={(e) =>
                  setDetectorField(idx, "severity", e.target.value)
                }
              >
                {SEVERITIES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
              <select
                className="w-28 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm"
                value={d.weight}
                onChange={(e) =>
                  setDetectorField(idx, "weight", Number(e.target.value))
                }
              >
                {WEIGHTS.map((w) => (
                  <option key={w} value={w}>
                    {w}
                  </option>
                ))}
              </select>
              <button
                onClick={() =>
                  guard(canUpdate, router, () => removeDetector(idx))
                }
                className="ml-auto rounded-lg border border-red-200 bg-white px-3 py-2 text-sm text-red-700 hover:bg-red-50"
                type="button"
              >
                Remove
              </button>
            </div>

            <div className="mt-3">
              <label className="mb-1 block text-xs font-medium text-gray-600">
                Frameworks
              </label>
              <FrameworkChips
                values={d.frameworks || []}
                onToggle={(fw) => toggleFramework(idx, fw)}
                onAdd={(fw) => addFramework(idx, fw)}
                canUpdate={canUpdate}
              />
            </div>
          </div>
        ))
      )}
    </section>
  );
});

const PoliciesPanel = React.memo(function PoliciesPanel({
  policies,
  detectorNames,
  setPolicyField,
  addPolicy,
  removePolicy,
  togglePolicyDetector,
  addPolicyAction,
  setPolicyActionField,
  removePolicyAction,
  canUpdate,
  router,
}) {
  return (
    <section
      className="rounded-2xl border border-[#2B245C] bg-white p-6 shadow-lg hover:shadow-2xl transition-shadow duration-300 space-y-3"
      data-tour="rulebook-policies"
    >
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-[#2B245C]">Policies</h2>
        <button
          onClick={() => guard(canUpdate, router, addPolicy)}
          className="rounded-lg border border-[#2B245C] bg-white px-3 py-2 text-sm text-[#2B245C] hover:bg-gray-50"
          type="button"
        >
          + Add Policy
        </button>
      </div>

      {policies.length === 0 ? (
        <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-6 text-sm text-gray-600">
          No policies. Click “Add Policy”.
        </div>
      ) : (
        policies.map((p, idx) => (
          <div
            key={p.id /* NEW: stable key */}
            className="rounded-xl border border-gray-200 bg-white p-4 space-y-3"
          >
            <div className="flex flex-wrap items-center gap-3">
              <input
                className="w-56 rounded-lg border border-gray-200 px-3 py-2 text-sm"
                placeholder="name (e.g., HIPAA)"
                value={p.name}
                onChange={(e) => setPolicyField(idx, "name", e.target.value)}
              />
              <select
                className="w-40 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm"
                value={p.min_severity}
                onChange={(e) =>
                  setPolicyField(idx, "min_severity", e.target.value)
                }
              >
                {SEVERITIES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
              <input
                className="w-32 rounded-lg border border-gray-200 px-3 py-2 text-sm"
                type="number"
                placeholder="max_allowed"
                value={p.max_allowed}
                onChange={(e) =>
                  setPolicyField(idx, "max_allowed", Number(e.target.value))
                }
              />
              <button
                onClick={() =>
                  guard(canUpdate, router, () => removePolicy(idx))
                }
                className="ml-auto rounded-lg border border-red-200 bg-white px-3 py-2 text-sm text-red-700 hover:bg-red-50"
                type="button"
              >
                Remove
              </button>
            </div>

            {/* detectors selection */}
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600">
                Detectors in this policy (click to toggle)
              </label>
              <div className="flex flex-wrap gap-2">
                {detectorNames.length === 0 ? (
                  <span className="text-xs text-gray-500">
                    No detectors available.
                  </span>
                ) : (
                  detectorNames.map((name) => {
                    const active = (p.detectors || []).includes(name);
                    return (
                      <button
                        key={name}
                        type="button"
                        onClick={() => togglePolicyDetector(idx, name)}
                        className={[
                          "rounded-full border px-3 py-1 text-xs",
                          active
                            ? "border-indigo-300 bg-indigo-50 text-indigo-700"
                            : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50",
                        ].join(" ")}
                      >
                        {name}
                      </button>
                    );
                  })
                )}
              </div>
            </div>

            {/* actions */}
            <div>
              <div className="mb-2 flex items-center justify-between">
                <label className="block text-sm font-medium text-gray-800">
                  On violation actions
                </label>
                <button
                  onClick={() =>
                    guard(canUpdate, router, () => addPolicyAction(idx))
                  }
                  className="rounded-lg border border-[#2B245C] bg-white px-3 py-1.5 text-sm text-[#2B245C] hover:bg-gray-50"
                  type="button"
                >
                  + Add Action
                </button>
              </div>
              {(p.on_violation || []).length === 0 ? (
                <div className="rounded border border-dashed border-gray-300 p-3 text-xs text-gray-600">
                  No actions.
                </div>
              ) : (
                (p.on_violation || []).map((a, j) => (
                  <div
                    key={a.id /* NEW: stable key */}
                    className="mb-2 flex flex-wrap items-center gap-2 rounded-lg border border-gray-200 p-2"
                  >
                    <select
                      className="w-40 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm"
                      value={a.action}
                      onChange={(e) =>
                        setPolicyActionField(idx, j, "action", e.target.value)
                      }
                    >
                      {ACTIONS.map((x) => (
                        <option key={x} value={x}>
                          {x}
                        </option>
                      ))}
                    </select>
                    <input
                      className="min-w-[240px] flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm"
                      placeholder="channels (comma separated, e.g., email, slack)"
                      value={(a.channels || []).join(", ")}
                      onChange={(e) =>
                        setPolicyActionField(
                          idx,
                          j,
                          "channels",
                          e.target.value
                            .split(",")
                            .map((s) => s.trim())
                            .filter(Boolean),
                        )
                      }
                    />
                    <button
                      onClick={() =>
                        guard(canUpdate, router, () =>
                          removePolicyAction(idx, j),
                        )
                      }
                      className="rounded-lg border border-red-200 bg-white px-3 py-2 text-sm text-red-700 hover:bg-red-50"
                      type="button"
                    >
                      Remove
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        ))
      )}
    </section>
  );
});

const AliasesPanel = React.memo(function AliasesPanel({
  aliasRows,
  detectorNames,
  addAliasRow,
  setAliasKey,
  setAliasVal,
  removeAlias,
  canUpdate,
  router,
}) {
  return (
    <section
      className="rounded-2xl border border-[#2B245C] bg-white p-6 shadow-lg hover:shadow-2xl transition-shadow duration-300"
      data-tour="rulebook-aliases"
    >
      <h2 className="mb-3 text-2xl font-bold text-[#2B245C]">Aliases</h2>
      <div className="overflow-auto rounded-2xl border border-gray-500 bg-white p-3">
        <table className="min-w-full text-sm">
          <thead className="bg-[#2B245C] text-left text-white border-b border-gray-500">
            <tr>
              <th className="px-4 py-2 font-medium">Synonym</th>
              <th className="px-4 py-2 font-medium">Canonical detector</th>
              <th className="px-4 py-2"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {aliasRows.length === 0 ? (
              <tr>
                <td className="px-4 py-4 text-gray-600" colSpan={3}>
                  No aliases.
                </td>
              </tr>
            ) : (
              aliasRows.map((row) => (
                <tr key={row.id /* NEW: stable key */}>
                  <td className="px-4 py-2">
                    <input
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                      value={row.key}
                      onChange={(e) => setAliasKey(row.id, e.target.value)}
                    />
                  </td>
                  <td className="px-4 py-2">
                    <input
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                      list="detector-names"
                      value={row.value}
                      onChange={(e) => setAliasVal(row.id, e.target.value)}
                    />
                  </td>
                  <td className="px-4 py-2 text-right">
                    <button
                      onClick={() =>
                        guard(canUpdate, router, () => removeAlias(row.id))
                      }
                      className="rounded-lg border border-red-200 bg-white px-3 py-2 text-sm text-red-700 hover:bg-red-50"
                      type="button"
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        {/* NEW: stable datalist id; component identity is hoisted so it doesn't remount */}
        <datalist id="detector-names">
          {detectorNames.map((n) => (
            <option key={n} value={n} />
          ))}
        </datalist>
        <div className="mt-3">
          <button
            onClick={() => guard(canUpdate, router, addAliasRow)}
            className="rounded-lg border border-[#2B245C] bg-white px-3 py-2 text-sm text-[#2B245C] hover:bg-gray-50"
            type="button"
          >
            + Add Alias
          </button>
        </div>
      </div>
    </section>
  );
});

/* -------------------------------- PAGE -------------------------------- */

export default function RulebookPage() {
  const apiBase = `${baseurl}/${initURL}/dataflow/scanner-config`;

  const router = useRouter();

  // state
  const [detectors, setDetectors] = useState([]); // [{id, name, frameworks[], severity, weight}] // NEW: id
  const [policies, setPolicies] = useState([]); // [{id, name, detectors[], min_severity, max_allowed, on_violation:[{id, action, channels[]}]}] // NEW: ids
  const [aliases, setAliases] = useState({}); // { "Medical Record Number": "MRN" }
  const [aliasRows, setAliasRows] = useState([]); // NEW: UI rows with stable ids: [{id,key,value}]

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [validating, setValidating] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [validation, setValidation] = useState(null); // {ok, errors[], warnings[]}

  const canView = can("privacy.read");
  const canUpdate = can("privacy.update");

  // derived
  const detectorNames = useMemo(
    () => (detectors || []).map((d) => d.name).filter(Boolean),
    [detectors],
  );

  /* ---------------- API ---------------- */

  const fetchRulebook = async () => {
    setLoading(true);
    setError("");
    setMessage("");
    try {
      const res = await CustomAxios.get(`${apiBase}/rulebook`);
      const rb = res?.data || {};

      // NEW: attach stable ids to rows for rendering keys
      const nextDetectors = (rb.detectors || []).map((d) => ({
        id: newId(), // NEW
        name: d.name || "",
        frameworks: Array.isArray(d.frameworks) ? d.frameworks : [],
        severity: SEVERITIES.includes(d.severity) ? d.severity : "Medium",
        weight: WEIGHTS.includes(d.weight) ? d.weight : 2,
      }));

      const nextPolicies = (rb.policies || []).map((p) => ({
        id: newId(), // NEW
        name: p.name || "",
        detectors: Array.isArray(p.detectors) ? p.detectors : [],
        min_severity: SEVERITIES.includes(p.min_severity)
          ? p.min_severity
          : "Medium",
        max_allowed: typeof p.max_allowed === "number" ? p.max_allowed : 0,
        on_violation: Array.isArray(p.on_violation)
          ? p.on_violation.map((a) => ({
              id: newId(), // NEW
              action: ACTIONS.includes(a.action) ? a.action : "alert",
              channels: Array.isArray(a.channels) ? a.channels : [],
            }))
          : [],
      }));

      const nextAliases = rb.aliases?.map || {};
      const nextAliasRows = Object.entries(nextAliases).map(([k, v]) => ({
        id: newId(),
        key: k,
        value: v,
      })); // NEW

      setDetectors(nextDetectors);
      setPolicies(nextPolicies);
      setAliases(nextAliases);
      setAliasRows(nextAliasRows); // NEW
    } catch (err) {
      console.error(
        "rulebook get error:",
        err?.response || err?.message || err,
      );
      setError("Failed to load rulebook.");
    } finally {
      setLoading(false);
    }
  };

  // NEW: strip UI-only ids before sending to API
  const buildPayload = useCallback(() => {
    const cleanDetectors = detectors.map(({ id, ...d }) => d);
    const cleanPolicies = policies.map(({ id, on_violation = [], ...p }) => ({
      ...p,
      on_violation: on_violation.map(({ id: _id, ...a }) => a),
    }));
    const cleanAliases = Object.fromEntries(
      aliasRows.filter((r) => r.key && r.value).map((r) => [r.key, r.value]),
    );
    return {
      detectors: cleanDetectors,
      policies: cleanPolicies,
      aliases: { map: cleanAliases },
    };
  }, [detectors, policies, aliasRows]);

  const putRulebook = async () => {
    setSaving(true);
    setError("");
    setMessage("");
    setValidation(null);
    try {
      const payload = buildPayload(); // NEW
      await CustomAxios.put(`${apiBase}/rulebook`, payload);
      setMessage("Rulebook saved.");
      // also keep aliases object in sync for client validation previews
      setAliases(payload.aliases.map);
    } catch (err) {
      console.error(
        "rulebook put error:",
        err?.response || err?.message || err,
      );
      const msg =
        err?.response?.data?.message || err?.message || "Save failed.";
      setError(typeof msg === "string" ? msg : "Save failed.");
    } finally {
      setSaving(false);
    }
  };

  const validateRulebook = async () => {
    setValidating(true);
    setError("");
    setMessage("");
    setValidation(null);
    try {
      const payload = buildPayload(); // NEW
      // client-side quick checks before calling backend
      const client = clientValidate({
        detectors: payload.detectors,
        policies: payload.policies,
        aliases: payload.aliases.map,
      });
      if (client.errors.length) {
        setValidation({
          ok: false,
          errors: client.errors,
          warnings: client.warnings,
        });
        return;
      }
      const res = await CustomAxios.post(`${apiBase}/validate`, payload);
      setValidation(res?.data || { ok: true, errors: [], warnings: [] });
    } catch (err) {
      console.error("validate error:", err?.response || err?.message || err);
      setError("Validation failed.");
    } finally {
      setValidating(false);
    }
  };

  /* ------------- client-side validation ------------- */
  const clientValidate = ({ detectors, policies, aliases }) => {
    const errors = [];
    const warnings = [];
    const names = new Set();
    detectors.forEach((d, i) => {
      if (!d.name) errors.push(`detectors[${i}] missing name`);
      else if (names.has(d.name))
        errors.push(`Duplicate detector name: ${d.name}`);
      else names.add(d.name);
      if (!SEVERITIES.includes(d.severity))
        errors.push(`detectors[${i}] invalid severity`);
      if (!WEIGHTS.includes(d.weight))
        errors.push(`detectors[${i}] invalid weight`);
    });
    const aliasMap = aliases || {};
    const exists = (n) => names.has(n) || !!aliasMap[n];
    policies.forEach((p, i) => {
      if (!p.name) errors.push(`policies[${i}] missing name`);
      if (!SEVERITIES.includes(p.min_severity))
        errors.push(`policies[${i}] invalid min_severity`);
      (p.detectors || []).forEach((dn) => {
        if (!exists(dn))
          warnings.push(
            `policies[${i}] detector '${dn}' not found (consider alias)`,
          );
      });
      (p.on_violation || []).forEach((a, j) => {
        if (!ACTIONS.includes(a.action))
          errors.push(`policies[${i}].on_violation[${j}] invalid action`);
      });
    });
    return { errors, warnings };
  };

  /* ---------------- helpers ---------------- */

  const setDetectorField = (idx, field, value) => {
    setDetectors((prev) =>
      prev.map((d, i) => (i === idx ? { ...d, [field]: value } : d)),
    );
  };
  const addDetector = () =>
    setDetectors((prev) => [
      ...prev,
      { id: newId(), name: "", frameworks: [], severity: "Medium", weight: 2 },
    ]); // NEW: id
  const removeDetector = (idx) =>
    setDetectors((prev) => prev.filter((_, i) => i !== idx));

  const toggleFramework = (idx, fw) => {
    setDetectors((prev) =>
      prev.map((d, i) => {
        if (i !== idx) return d;
        const set = new Set(d.frameworks || []);
        set.has(fw) ? set.delete(fw) : set.add(fw);
        return { ...d, frameworks: Array.from(set) };
      }),
    );
  };
  const addFramework = (idx, fw) => {
    if (!fw) return;
    setDetectors((prev) =>
      prev.map((d, i) =>
        i === idx
          ? {
              ...d,
              frameworks: Array.from(new Set([...(d.frameworks || []), fw])),
            }
          : d,
      ),
    );
  };

  const setPolicyField = (idx, field, value) => {
    setPolicies((prev) =>
      prev.map((p, i) => (i === idx ? { ...p, [field]: value } : p)),
    );
  };
  const addPolicy = () =>
    setPolicies((prev) => [
      ...prev,
      {
        id: newId(),
        name: "",
        detectors: [],
        min_severity: "Medium",
        max_allowed: 0,
        on_violation: [],
      },
    ]); // NEW: id
  const removePolicy = (idx) =>
    setPolicies((prev) => prev.filter((_, i) => i !== idx));

  const togglePolicyDetector = (idx, detName) => {
    setPolicies((prev) =>
      prev.map((p, i) => {
        if (i !== idx) return p;
        const set = new Set(p.detectors || []);
        set.has(detName) ? set.delete(detName) : set.add(detName);
        return { ...p, detectors: Array.from(set) };
      }),
    );
  };
  const addPolicyAction = (idx) => {
    setPolicies((prev) =>
      prev.map((p, i) =>
        i === idx
          ? {
              ...p,
              on_violation: [
                ...(p.on_violation || []),
                { id: newId(), action: "alert", channels: [] },
              ], // NEW: id
            }
          : p,
      ),
    );
  };
  const setPolicyActionField = (pIdx, aIdx, field, value) => {
    setPolicies((prev) =>
      prev.map((p, i) => {
        if (i !== pIdx) return p;
        const arr = [...(p.on_violation || [])];
        arr[aIdx] = { ...arr[aIdx], [field]: value };
        return { ...p, on_violation: arr };
      }),
    );
  };
  const removePolicyAction = (pIdx, aIdx) => {
    setPolicies((prev) =>
      prev.map((p, i) => {
        if (i !== pIdx) return p;
        const arr = (p.on_violation || []).filter((_, j) => j !== aIdx);
        return { ...p, on_violation: arr };
      }),
    );
  };

  // aliases (NEW: row-based with stable ids; keep aliases object in sync)
  const rebuildAliasesFromRows = useCallback(
    (rows) =>
      Object.fromEntries(
        rows.filter((r) => r.key).map((r) => [r.key, r.value]),
      ),
    [],
  );

  const addAliasRow = () => {
    setAliasRows((prev) => {
      const next = [...prev, { id: newId(), key: "", value: "" }];
      setAliases(rebuildAliasesFromRows(next)); // keep map synced
      return next;
    });
  };

  const setAliasKey = (rowId, newKey) => {
    setAliasRows((prev) => {
      const next = prev.map((r) =>
        r.id === rowId ? { ...r, key: newKey } : r,
      );
      setAliases(rebuildAliasesFromRows(next));
      return next;
    });
  };

  const setAliasVal = (rowId, newVal) => {
    setAliasRows((prev) => {
      const next = prev.map((r) =>
        r.id === rowId ? { ...r, value: newVal } : r,
      );
      setAliases(rebuildAliasesFromRows(next));
      return next;
    });
  };

  const removeAlias = (rowId) => {
    setAliasRows((prev) => {
      const next = prev.filter((r) => r.id !== rowId);
      setAliases(rebuildAliasesFromRows(next));
      return next;
    });
  };

  /* ---------------- effects ---------------- */

  useEffect(() => {
    fetchRulebook();
  }, []);

  /* ---------------- UI ---------------- */

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <DataFlowNav />
      <div className="bg-white rounded-lg p-5 my-3 mx-5">
        <Header />
        {/* Pass the function to trigger the tour */}
        <div className="py-5 space-y-5">
          <Toolbar
            loading={loading}
            validating={validating}
            saving={saving}
            error={error}
            message={message}
            fetchRulebook={fetchRulebook}
            validateRulebook={validateRulebook}
            putRulebook={putRulebook}
            canUpdate={canUpdate}
            router={router}
          />
          <ValidationPanel validation={validation} />
          <DetectorsPanel
            detectors={detectors}
            setDetectorField={setDetectorField}
            addDetector={addDetector}
            removeDetector={removeDetector}
            toggleFramework={toggleFramework}
            addFramework={addFramework}
            canUpdate={canUpdate}
            router={router}
          />
          <PoliciesPanel
            policies={policies}
            detectorNames={detectorNames}
            setPolicyField={setPolicyField}
            addPolicy={addPolicy}
            removePolicy={removePolicy}
            togglePolicyDetector={togglePolicyDetector}
            addPolicyAction={addPolicyAction}
            setPolicyActionField={setPolicyActionField}
            removePolicyAction={removePolicyAction}
            canUpdate={canUpdate}
            router={router}
          />
          <AliasesPanel
            aliasRows={aliasRows}
            detectorNames={detectorNames}
            addAliasRow={addAliasRow}
            setAliasKey={setAliasKey}
            setAliasVal={setAliasVal}
            removeAlias={removeAlias}
            canUpdate={canUpdate}
            router={router}
          />
        </div>
      </div>
    </div>
  );
}

/* ------- tiny helper: frameworks tags UX ------- */
function FrameworkChips({ values = [], onToggle, onAdd }) {
  const [input, setInput] = useState("");
  const all = Array.from(
    new Set([...(values || []), "GDPR", "HIPAA", "PCI-DSS", "GLBA", "CCPA"]),
  );
  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {all.map((fw) => {
          const active = values.includes(fw);
          return (
            <button
              key={fw}
              type="button"
              onClick={() => onToggle(fw)}
              className={[
                "rounded-full border px-3 py-1 text-xs",
                active
                  ? "border-indigo-300 bg-indigo-50 text-indigo-700"
                  : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50",
              ].join(" ")}
            >
              {fw}
            </button>
          );
        })}
      </div>
      <div className="mt-2 flex gap-2">
        <input
          className="w-64 rounded-lg border border-gray-200 px-3 py-2 text-sm"
          placeholder="add custom (e.g., SOX)"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              onAdd(input.trim());
              setInput("");
            }
          }}
        />
        <button
          onClick={() => {
            onAdd(input.trim());
            setInput("");
          }}
          className="rounded-lg bg-[#2B245C] px-5 py-2 text-sm text-white hover:bg-opacity-90"
          type="button"
        >
          Add
        </button>
      </div>
    </div>
  );
}
