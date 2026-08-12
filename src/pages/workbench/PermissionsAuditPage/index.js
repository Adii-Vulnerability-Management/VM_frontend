// =============================================
// HOW TO USE (Next.js 13+ App Router)
// =============================================
// 1) Create these files exactly as listed below in your Next.js project.
// 2) Start your dev server: npm run dev
// 3) Visit /demo/permissions-audit
//
// This is a fully functional demo:
// - Field-level permissions come from metadata (/api/metadata/policy)
// - Record loads from /api/records/R-1001
// - On Save, a POST to /api/records/R-1001 validates permissions server-side,
//   computes a diff, and writes an immutable audit entry (/api/audit)
// ---------------------------------------------

// ──────────────────────────────────────────────
// File: app/demo/permissions-audit/page.jsx
// ──────────────────────────────────────────────
"use client";
import React, { useEffect, useMemo, useState } from "react";

export default function PermissionsAuditPage() {
  const [role, setRole] = useState("manager");
  const [record, setRecord] = useState(null);
  const [draft, setDraft] = useState(null);
  const [policy, setPolicy] = useState(null);
  const [audits, setAudits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const entity = "Risk";
  const id = "R-1001";

  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        setLoading(true);
        const [pRes, rRes, aRes] = await Promise.all([
          fetch(`/api/metadata/policy?entity=${entity}`),
          fetch(`/api/records/${id}`),
          fetch(`/api/audit?entity=${entity}&entityId=${id}`),
        ]);
        const p = await pRes.json();
        const r = await rRes.json();
        const a = await aRes.json();
        if (!isMounted) return;
        setPolicy(p);
        setRecord(r);
        setDraft(r);
        setAudits(a);
      } catch (e) {
        console.error(e);
        alert("Failed to load demo data");
      } finally {
        if (isMounted) setLoading(false);
      }
    })();
    return () => (isMounted = false);
  }, []);

  const can = (field, right) => {
    if (!policy?.fields) return false;
    if (role === "admin") return true;
    const f = policy.fields[field];
    if (!f) return false;
    return (f[right] || []).includes(role);
  };

  const roles = ["admin", "manager", "user", "external"];

  const changed = useMemo(() => {
    if (!record || !draft) return {};
    const o = {};
    for (const k of Object.keys(draft)) {
      if (JSON.stringify(draft[k]) !== JSON.stringify(record[k])) {
        o[k] = { before: record[k], after: draft[k] };
      }
    }
    return o;
  }, [record, draft]);

  async function save() {
    if (!draft) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/records/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data: draft, userRole: role }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ message: res.statusText }));
        throw new Error(err.message || "Save failed");
      }
      const updated = await res.json();
      setRecord(updated);
      setDraft(updated);
      // refresh audits
      const aRes = await fetch(`/api/audit?entity=${entity}&entityId=${id}`);
      setAudits(await aRes.json());
    } catch (e) {
      alert(e.message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen grid place-items-center text-gray-600">
        Loading demo…
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <div className="mx-auto max-w-6xl p-6">
        <header className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-[#2B245C] text-white grid place-items-center font-bold">
              A
            </div>
            <div>
              <h1 className="text-xl font-bold">Permissions & Audit (Demo)</h1>
              <p className="text-xs text-gray-500">
                Field policy from metadata • Back-end audit trail
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600">Impersonate role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="border rounded px-2 py-1"
            >
              {roles.map((r) => (
                <option key={r}>{r}</option>
              ))}
            </select>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 rounded-2xl border bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold text-[#2B245C] mb-4">
              Record
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Title */}
              {can("title", "read") && (
                <Labeled>
                  <span>Title</span>
                  <input
                    className={`mt-1 w-full rounded border px-3 py-2 ${
                      !can("title", "write") ? "bg-gray-100 text-gray-500" : ""
                    }`}
                    value={draft.title}
                    onChange={(e) =>
                      setDraft((d) => ({ ...d, title: e.target.value }))
                    }
                    readOnly={!can("title", "write")}
                  />
                </Labeled>
              )}
              {/* Owner */}
              {can("owner", "read") && (
                <Labeled>
                  <span>Owner</span>
                  <input
                    className={`mt-1 w-full rounded border px-3 py-2 ${
                      !can("owner", "write") ? "bg-gray-100 text-gray-500" : ""
                    }`}
                    value={draft.owner}
                    onChange={(e) =>
                      setDraft((d) => ({ ...d, owner: e.target.value }))
                    }
                    readOnly={!can("owner", "write")}
                  />
                </Labeled>
              )}
              {/* Status */}
              {can("status", "read") && (
                <Labeled>
                  <span>Status</span>
                  <select
                    className={`mt-1 w-full rounded border px-3 py-2 bg-white ${
                      !can("status", "write") ? "bg-gray-100 text-gray-500" : ""
                    }`}
                    value={draft.status}
                    onChange={(e) =>
                      setDraft((d) => ({ ...d, status: e.target.value }))
                    }
                    disabled={!can("status", "write")}
                  >
                    {["Open", "In Review", "Mitigated", "Closed"].map((s) => (
                      <option key={s}>{s}</option>
                    ))}
                  </select>
                </Labeled>
              )}
              {/* Risk Score */}
              {can("riskScore", "read") && (
                <Labeled>
                  <span>Risk Score</span>
                  <input
                    type="number"
                    className={`mt-1 w-full rounded border px-3 py-2 ${
                      !can("riskScore", "write")
                        ? "bg-gray-100 text-gray-500"
                        : ""
                    }`}
                    value={draft.riskScore}
                    onChange={(e) =>
                      setDraft((d) => ({
                        ...d,
                        riskScore: Number(e.target.value),
                      }))
                    }
                    readOnly={!can("riskScore", "write")}
                  />
                </Labeled>
              )}
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <button
                onClick={save}
                disabled={saving}
                className="rounded-lg bg-[#2B245C] px-4 py-2 text-white disabled:opacity-60"
              >
                {saving ? "Saving…" : "Save record"}
              </button>
              <button
                onClick={() => setDraft(record)}
                className="rounded-lg border px-4 py-2"
              >
                Reset
              </button>
              <span className="text-xs text-gray-500">
                Changed fields: {Object.keys(changed).length}
              </span>
            </div>
          </div>

          <div className="rounded-2xl border bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold text-[#2B245C] mb-2">
              Audit Log
            </h2>
            <div className="space-y-3 max-h-[28rem] overflow-auto pr-1">
              {audits.length === 0 && (
                <p className="text-sm text-gray-500">No audit entries yet.</p>
              )}
              {audits.map((a) => (
                <div key={a.id} className="rounded-lg border p-3 text-sm">
                  <div className="mb-1 flex items-center justify-between">
                    <span className="font-medium">{a.id}</span>
                    <span className="text-xs text-gray-500">
                      {new Date(a.at).toLocaleString()}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500">
                    by role: <b>{a.userRole}</b> • action: {a.action}
                  </div>
                  <pre className="mt-2 whitespace-pre-wrap text-xs bg-gray-50 p-2 rounded-md">
                    {JSON.stringify(a.delta, null, 2)}
                  </pre>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Labeled({ children }) {
  return <label className="text-sm text-gray-700 block">{children}</label>;
}

// ──────────────────────────────────────────────
// File: app/api/metadata/policy/route.js
// ──────────────────────────────────────────────
export const dynamic = "force-dynamic";

// In a real system, this would be generated from form metadata per entity/module
const FIELD_POLICY = {
  title: { read: ["admin", "manager", "user"], write: ["admin", "manager"] },
  owner: { read: ["admin", "manager"], write: ["admin"] },
  status: { read: ["admin", "manager", "user"], write: ["admin", "manager"] },
  riskScore: { read: ["admin", "manager"], write: ["admin"] },
};

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const entity = searchParams.get("entity") || "Risk";
  return Response.json({ entity, fields: FIELD_POLICY });
}

// ──────────────────────────────────────────────
// File: app/api/records/[id]/route.js
// ──────────────────────────────────────────────
export const dynamic2 = "force-dynamic";

// module-scoped in-memory stores for demo
let RECORDS = {
  "R-1001": {
    _id: "R-1001",
    entity: "Risk",
    title: "Payment Gateway Risk",
    owner: "alice",
    status: "Open",
    riskScore: 62,
  },
};
let AUDITS = [];

// reuse same policy as /metadata/policy for demo
const POLICY = {
  title: { read: ["admin", "manager", "user"], write: ["admin", "manager"] },
  owner: { read: ["admin", "manager"], write: ["admin"] },
  status: { read: ["admin", "manager", "user"], write: ["admin", "manager"] },
  riskScore: { read: ["admin", "manager"], write: ["admin"] },
};

export async function get(req, { params }) {
  const rec = RECORDS[params.id];
  if (!rec) return new Response("Not found", { status: 404 });
  return Response.json(rec);
}

export async function POST(req, { params }) {
  try {
    const id = params.id;
    const body = await req.json();
    const { data, userRole } = body || {};
    const current = RECORDS[id];
    if (!current) return new Response("Not found", { status: 404 });

    // Compute changes & enforce field-level write permissions
    const delta = {};
    for (const k of Object.keys(data || {})) {
      const before = current[k];
      const after = data[k];
      if (JSON.stringify(before) !== JSON.stringify(after)) {
        const canWrite =
          userRole === "admin" || (POLICY[k]?.write || []).includes(userRole);
        if (!canWrite) {
          return Response.json(
            {
              message: `Forbidden: role '${userRole}' cannot write field '${k}'`,
            },
            { status: 403 }
          );
        }
        delta[k] = { before, after };
      }
    }

    // Apply update
    const updated = {
      ...current,
      ...Object.fromEntries(
        Object.entries(delta).map(([k, v]) => [k, v.after])
      ),
    };
    RECORDS[id] = updated;

    // Write immutable audit entry (append-only)
    const entry = Object.freeze({
      id: `AUD-${Date.now()}`,
      entity: current.entity,
      entityId: id,
      action: "update",
      at: new Date().toISOString(),
      userRole,
      delta, // changed fields only
    });
    AUDITS = [entry, ...AUDITS];

    return Response.json(updated);
  } catch (e) {
    return Response.json(
      { message: e?.message || "Server error" },
      { status: 500 }
    );
  }
}

// ──────────────────────────────────────────────
// File: app/api/audit/route.js
// ──────────────────────────────────────────────
export const dynamic3 = "force-dynamic";

export async function set(req) {
  const { searchParams } = new URL(req.url);
  const entity = searchParams.get("entity");
  const entityId = searchParams.get("entityId");
  let out = AUDITS;
  if (entity) out = out.filter((a) => a.entity === entity);
  if (entityId) out = out.filter((a) => a.entityId === entityId);
  return Response.json(out);
}
