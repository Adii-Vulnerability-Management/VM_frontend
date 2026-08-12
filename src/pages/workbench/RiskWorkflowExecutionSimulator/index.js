"use client";
// RiskWorkflowExecutionSimulatorWithMetadata.jsx
import React, { useMemo, useState, useEffect } from "react";
import {
  FaArrowRight,
  FaListAlt,
  FaSearch,
  FaUserCheck,
  FaRocket,
  FaCheckCircle,
  FaTimesCircle,
  FaUndo,
} from "react-icons/fa";

const PRIMARY = "#2B245C";

const STEPS = [
  { id: "add_asset", label: "Add Asset", icon: <FaListAlt /> },
  { id: "asset_review", label: "Asset Review", icon: <FaSearch /> },
  { id: "asset_approval", label: "Asset Approval", icon: <FaUserCheck /> },
  { id: "activate_asset", label: "Activate Asset", icon: <FaRocket /> },
];

export default function RiskWorkflowExecutionSimulatorWithMetadata() {
  const [current, setCurrent] = useState(STEPS[0].id);

  // Form state (strings so inputs never flip controlled/uncontrolled)
  const [asset, setAsset] = useState({
    name: "",
    category: "",
    ownerEmail: "",
    location: "",
    businessValue: "",
  });

  const [errors, setErrors] = useState({});
  const [history, setHistory] = useState([]);

  // Assets metadata table
  const [assetsMeta, setAssetsMeta] = useState([]);
  const [activeAssetId, setActiveAssetId] = useState(null);

  const idx = useMemo(
    () => STEPS.findIndex((s) => s.id === current),
    [current]
  );

  // Simple history helper
  const log = (action, extra = {}) =>
    setHistory((h) => [
      ...h,
      { at: new Date().toISOString(), step: current, action, ...extra },
    ]);

  // --- Navigation helpers
  const go = (id) => setCurrent(id);

  // --- Metadata helpers
  const makeId = () => `A-${Date.now().toString(36).slice(-6)}`;

  const upsertActiveMeta = (patch, createIfMissing = false) => {
    setAssetsMeta((prev) => {
      let next = [...prev];
      const i = next.findIndex((a) => a.id === activeAssetId);
      if (i === -1) {
        if (!createIfMissing) return prev;
        const id = makeId();
        const meta = {
          id,
          ...asset,
          reviewed: false,
          approved: false,
          activated: false,
          status: "under_review",
          step: "asset_review",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          ...patch,
        };
        setActiveAssetId(id);
        return [meta, ...prev];
      }
      next[i] = {
        ...next[i],
        ...asset, // keep meta in sync with current form fields
        ...patch,
        updatedAt: new Date().toISOString(),
      };
      return next;
    });
  };

  const currentMeta = useMemo(
    () => assetsMeta.find((a) => a.id === activeAssetId) || null,
    [assetsMeta, activeAssetId]
  );

  // --- Validation for Add Asset (5 fields)
  const validate = () => {
    const e = {};
    if (!asset.name.trim()) e.name = "Asset name is required";
    if (!asset.category) e.category = "Pick a category";
    if (!asset.ownerEmail.trim() || !/^\S+@\S+\.\S+$/.test(asset.ownerEmail))
      e.ownerEmail = "Valid email required";
    if (!asset.location.trim()) e.location = "Location is required";
    if (!String(asset.businessValue).trim() || Number(asset.businessValue) <= 0)
      e.businessValue = "Enter a positive value";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // --- Handlers per step
  const handleSubmitAsset = (e) => {
    e.preventDefault();
    if (!validate()) return;

    // If no active asset row yet, create it; otherwise update & reset flags for a new review cycle
    upsertActiveMeta(
      {
        reviewed: false,
        approved: false,
        activated: false,
        status: "under_review",
        step: "asset_review",
      },
      true
    );

    log("submitted-asset", { asset });
    go("asset_review");
  };

  const sendToApprover = () => {
    upsertActiveMeta({
      reviewed: true,
      status: "pending_approval",
      step: "asset_approval",
    });
    log("review-completed");
    go("asset_approval");
  };

  const backToEdit = () => {
    upsertActiveMeta({
      status: "editing",
      step: "add_asset",
    });
    log("sent-back-to-edit");
    go("add_asset");
  };

  const approve = () => {
    upsertActiveMeta({
      approved: true,
      status: "activating",
      step: "activate_asset",
    });
    log("approved");
    go("activate_asset");
  };

  const reject = () => {
    upsertActiveMeta({
      reviewed: false,
      approved: false,
      status: "under_review",
      step: "asset_review",
    });
    log("rejected");
    go("asset_review");
  };

  // --- System step: auto-activate, then stop
  const [activating, setActivating] = useState(false);
  const [activated, setActivated] = useState(false);
  useEffect(() => {
    if (current === "activate_asset") {
      setActivating(true);
      setActivated(false);
      const t = setTimeout(() => {
        setActivating(false);
        setActivated(true);
        upsertActiveMeta({
          activated: true,
          status: "active",
          step: "activate_asset",
        });
        log("asset-activated");
      }, 800);
      return () => clearTimeout(t);
    }
  }, [current]); // eslint-disable-line react-hooks/exhaustive-deps

  const reset = () => {
    setCurrent("add_asset");
    setAsset({
      name: "",
      category: "",
      ownerEmail: "",
      location: "",
      businessValue: "",
    });
    setErrors({});
    setHistory([]);
    setActivating(false);
    setActivated(false);
    setActiveAssetId(null);
  };

  // --- UI bits
  // put this near the top, after STEPS / PRIMARY

  const Stepper = React.memo(function Stepper({ idx }) {
    return (
      <div className="w-full overflow-x-auto">
        <div className="inline-flex items-center gap-3 whitespace-nowrap">
          {STEPS.map((s, i) => {
            const state = i < idx ? "done" : i === idx ? "current" : "upcoming";
            const base =
              "px-4 py-2 rounded-xl border flex items-center gap-2 text-sm font-medium";
            return (
              <React.Fragment key={s.id}>
                <div
                  className={
                    state === "current"
                      ? `${base} text-white`
                      : state === "done"
                      ? `${base} bg-green-50 border-green-300 text-green-800`
                      : `${base} bg-white border-gray-200 text-gray-700`
                  }
                  style={
                    state === "current"
                      ? { background: PRIMARY, borderColor: PRIMARY }
                      : {}
                  }
                >
                  <span
                    className={`w-6 h-6 grid place-items-center rounded-full text-xs ${
                      state === "current"
                        ? "bg-white text-gray-900"
                        : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {i + 1}
                  </span>
                  <span className="text-lg">{s.icon}</span>
                  <span>{s.label}</span>
                </div>
                {i < STEPS.length - 1 && (
                  <FaArrowRight className="text-gray-400 w-6 h-6" />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    );
  });

  const Card = React.memo(function Card({ title, subtitle, children, footer }) {
    return (
      <div className="bg-white border rounded-2xl shadow-sm">
        <div className="px-5 py-4 border-b">
          <div className="text-lg font-semibold" style={{ color: PRIMARY }}>
            {title}
          </div>
          {subtitle && <div className="text-xs text-gray-500">{subtitle}</div>}
        </div>
        <div className="p-5">{children}</div>
        {footer && (
          <div className="px-5 py-3 border-t bg-gray-50">{footer}</div>
        )}
      </div>
    );
  });

  

  return (
    <div className="p-6 mx-auto max-w-6xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold" style={{ color: PRIMARY }}>
          Asset Onboarding Flow (Simulator)
        </h1>
        <button
          onClick={reset}
          className="inline-flex items-center gap-2 px-3 py-2 border rounded-lg text-gray-700 hover:bg-gray-50"
        >
          <FaUndo /> Reset
        </button>
      </div>

      <Stepper idx={idx} />

      {/* MAIN PANEL */}
      {current === "add_asset" && (
        <Card
          title="Add Asset"
          subtitle="Fill the 5 required fields and submit to move to review."
          footer={
            <div className="text-xs text-gray-500">
              All fields are mandatory for this demo.
            </div>
          }
        >
          <form
            onSubmit={handleSubmitAsset}
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            <div>
              <label className="block text-sm font-medium">Asset Name</label>
              <input
                className="mt-1 w-full border rounded px-3 py-2"
                value={asset.name}
                onChange={(e) =>
                  setAsset((prev) => ({ ...prev, name: e.target.value }))
                }
                placeholder="e.g., Core DB Server"
                autoComplete="off"
              />
              {errors.name && (
                <p className="text-xs text-red-600 mt-1">{errors.name}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium">Category</label>
              <select
                className="mt-1 w-full border rounded px-3 py-2"
                value={asset.category}
                onChange={(e) =>
                  setAsset((prev) => ({ ...prev, category: e.target.value }))
                }
              >
                <option value="">-- Select --</option>
                <option>Hardware</option>
                <option>Software</option>
                <option>Data</option>
                <option>Network</option>
                <option>Other</option>
              </select>
              {errors.category && (
                <p className="text-xs text-red-600 mt-1">{errors.category}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium">Owner Email</label>
              <input
                className="mt-1 w-full border rounded px-3 py-2"
                value={asset.ownerEmail}
                onChange={(e) =>
                  setAsset((prev) => ({ ...prev, ownerEmail: e.target.value }))
                }
                placeholder="owner@example.com"
                autoComplete="off"
              />
              {errors.ownerEmail && (
                <p className="text-xs text-red-600 mt-1">{errors.ownerEmail}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium">Location</label>
              <input
                className="mt-1 w-full border rounded px-3 py-2"
                value={asset.location}
                onChange={(e) =>
                  setAsset((prev) => ({ ...prev, location: e.target.value }))
                }
                placeholder="e.g., DC-1 / Rack 12"
                autoComplete="off"
              />
              {errors.location && (
                <p className="text-xs text-red-600 mt-1">{errors.location}</p>
              )}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium">
                Business Value (₹)
              </label>
              <input
                inputMode="numeric"
                className="mt-1 w-full border rounded px-3 py-2"
                value={asset.businessValue}
                onChange={(e) => {
                  const v = e.target.value.replace(/[^\d.]/g, "");
                  setAsset((prev) => ({ ...prev, businessValue: v }));
                }}
                placeholder="e.g., 500000"
                autoComplete="off"
              />
              {errors.businessValue && (
                <p className="text-xs text-red-600 mt-1">
                  {errors.businessValue}
                </p>
              )}
            </div>

            <div className="md:col-span-2 flex justify-end">
              <button
                type="submit"
                className="px-4 py-2 rounded-lg text-white"
                style={{ background: PRIMARY }}
              >
                Submit Asset
              </button>
            </div>
          </form>
        </Card>
      )}

      {current === "asset_review" && (
        <Card
          title="Asset Review"
          subtitle="Verify the submitted details. Send to approver or go back to edit."
          footer={
            <div className="flex justify-between items-center">
              <button
                onClick={backToEdit}
                className="px-3 py-2 border rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Edit Asset
              </button>
              <button
                onClick={sendToApprover}
                className="px-4 py-2 rounded-lg text-white"
                style={{ background: PRIMARY }}
              >
                Send to Approver
              </button>
            </div>
          }
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Asset Name" value={asset.name} />
            <Field label="Category" value={asset.category} />
            <Field label="Owner Email" value={asset.ownerEmail} />
            <Field label="Location" value={asset.location} />
            <Field label="Business Value (₹)" value={asset.businessValue} />
          </div>
        </Card>
      )}

      {current === "asset_approval" && (
        <Card
          title="Asset Approval"
          subtitle="Approve to activate the asset. Reject to send back for review."
          footer={
            <div className="flex justify-end gap-2">
              <button
                onClick={reject}
                className="inline-flex items-center gap-2 px-3 py-2 border rounded-lg text-red-600 hover:bg-red-50"
              >
                <FaTimesCircle /> Reject
              </button>
              <button
                onClick={approve}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-white bg-green-600"
              >
                <FaCheckCircle /> Approve
              </button>
            </div>
          }
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Asset Name" value={asset.name} />
            <Field label="Category" value={asset.category} />
            <Field label="Owner Email" value={asset.ownerEmail} />
            <Field label="Location" value={asset.location} />
            <Field label="Business Value (₹)" value={asset.businessValue} />
          </div>
        </Card>
      )}

      {current === "activate_asset" && (
        <Card title="Activate Asset" subtitle="System step">
          <div className="flex items-center gap-3">
            {activating && (
              <>
                <div className="w-3 h-3 rounded-full bg-indigo-500 animate-pulse" />
                <div className="w-3 h-3 rounded-full bg-indigo-500 animate-pulse [animation-delay:150ms]" />
                <div className="w-3 h-3 rounded-full bg-indigo-500 animate-pulse [animation-delay:300ms]" />
                <span className="text-gray-600">Activating asset…</span>
              </>
            )}
            {activated && (
              <div className="flex items-center gap-3">
                <FaCheckCircle className="text-green-600 w-6 h-6" />
                <div>
                  <div className="font-semibold">Asset is Active!</div>
                  <div className="text-sm text-gray-500">
                    You may reset to run the flow again.
                  </div>
                </div>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Timeline / History */}
      <div className="bg-gray-50 border rounded-2xl p-4">
        <div className="font-semibold mb-2" style={{ color: PRIMARY }}>
          Execution Timeline
        </div>
        {history.length === 0 ? (
          <div className="text-sm text-gray-600">No actions yet.</div>
        ) : (
          <ul className="space-y-2">
            {history.map((h, i) => (
              <li key={i} className="text-xs">
                <span className="font-medium">{labelFor(h.step)}</span> —{" "}
                {h.action}
                <span className="text-gray-500">
                  {" "}
                  at {new Date(h.at).toLocaleString()}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Assets Metadata Table */}
      <div className="bg-white border rounded-2xl p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="font-semibold" style={{ color: PRIMARY }}>
            Assets
          </div>
          <div className="text-xs text-gray-500">
            {activeAssetId
              ? `Active Asset ID: ${activeAssetId}`
              : "No active asset yet"}
          </div>
        </div>
        {assetsMeta.length === 0 ? (
          <div className="text-sm text-gray-600">
            No assets created yet. Submit the form to create one.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 border-b">
                  <th className="py-2 pr-4">ID</th>
                  <th className="py-2 pr-4">Name</th>
                  <th className="py-2 pr-4">Category</th>
                  <th className="py-2 pr-4">Owner</th>
                  <th className="py-2 pr-4">Step</th>
                  <th className="py-2 pr-4">Status</th>
                  <th className="py-2 pr-4">Flags</th>
                  <th className="py-2 pr-4">Updated</th>
                </tr>
              </thead>
              <tbody>
                {assetsMeta.map((a) => (
                  <tr key={a.id} className="border-b last:border-b-0">
                    <td className="py-2 pr-4 font-mono">{a.id}</td>
                    <td className="py-2 pr-4">{a.name}</td>
                    <td className="py-2 pr-4">{a.category}</td>
                    <td className="py-2 pr-4">{a.ownerEmail}</td>
                    <td className="py-2 pr-4">
                      <Badge>{labelFor(a.step)}</Badge>
                    </td>
                    <td className="py-2 pr-4">
                      <StatusBadge status={a.status} />
                    </td>
                    <td className="py-2 pr-4 space-x-1">
                      <Flag ok={a.reviewed} label="Reviewed" />
                      <Flag ok={a.approved} label="Approved" />
                      <Flag ok={a.activated} label="Active" />
                    </td>
                    <td className="py-2 pr-4 text-gray-500">
                      {new Date(a.updatedAt).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

/* ---------- Small helpers ---------- */
function Field({ label, value }) {
  return (
    <div className="bg-white border rounded-lg p-3">
      <div className="text-xs text-gray-500">{label}</div>
      <div className="font-medium text-gray-900">{String(value || "—")}</div>
    </div>
  );
}

function labelFor(stepId) {
  const m = {
    add_asset: "Add Asset",
    asset_review: "Asset Review",
    asset_approval: "Asset Approval",
    activate_asset: "Activate Asset",
  };
  return m[stepId] || stepId;
}

function Badge({ children }) {
  return (
    <span className="inline-block px-2 py-0.5 rounded bg-gray-100 text-gray-700 text-xs">
      {children}
    </span>
  );
}

function StatusBadge({ status }) {
  const map = {
    editing: "bg-gray-100 text-gray-700",
    under_review: "bg-yellow-100 text-yellow-800",
    pending_approval: "bg-blue-100 text-blue-800",
    activating: "bg-indigo-100 text-indigo-800",
    active: "bg-green-100 text-green-800",
  };
  const cls = map[status] || "bg-gray-100 text-gray-700";
  return (
    <span className={`inline-block px-2 py-0.5 rounded text-xs ${cls}`}>
      {status.replace("_", " ")}
    </span>
  );
}

function Flag({ ok, label }) {
  return ok ? (
    <span className="inline-block px-2 py-0.5 rounded bg-green-100 text-green-800 text-xs">
      {label}
    </span>
  ) : (
    <span className="inline-block px-2 py-0.5 rounded bg-gray-100 text-gray-600 text-xs">
      {label}
    </span>
  );
}
