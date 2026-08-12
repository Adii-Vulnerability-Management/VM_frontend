"use client";
import React, { useEffect, useMemo, useRef, useState } from "react";

/*
  Archer-like Demo (Frontend Only)
  --------------------------------
  Single-file React component set to DEMO these capabilities without any backend:
  1) Record permissions + Audit Log
  2) Notification Rules + Job Engine (simulated)
  3) Data Feed Manager (scheduled import/export)
  4) Report Builder & Dashboards
  5) DDE Rules (UI logic separate from workflow)
  6) Relationship Graph View

  ⚠️ All data is in-memory. No external libs required. Tailwind classes used.
*/

export default function ArcherDemo() {
  const tabs = [
    "Permissions & Audit",
    "Notifications & Jobs",
    "Data Feeds",
    "Reports",
    "DDE Rules",
    "Relationships",
  ];
  const [active, setActive] = useState(tabs[0]);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <header className="sticky top-0 z-10 bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-[#2B245C] text-white grid place-items-center font-bold">
                A
              </div>
              <div>
                <h1 className="text-xl font-bold">Archer-like Demo</h1>
                <p className="text-xs text-gray-500">Frontend-only showcase</p>
              </div>
            </div>
            <span className="text-xs text-gray-500">
              No backend required • Demo safe
            </span>
          </div>
          <nav className="mt-4 flex flex-wrap gap-2">
            {tabs.map((t) => (
              <button
                key={t}
                onClick={() => setActive(t)}
                className={
                  "px-3 py-1.5 rounded-full text-sm border " +
                  (active === t
                    ? "bg-[#2B245C] text-white border-[#2B245C]"
                    : "bg-white text-gray-700 hover:bg-gray-100 border-gray-200")
                }
              >
                {t}
              </button>
            ))}
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-7xl p-4">
        {active === "Permissions & Audit" && <PermissionsAuditPanel />}
        {active === "Notifications & Jobs" && <NotificationsJobsPanel />}
        {active === "Data Feeds" && <DataFeedsPanel />}
        {active === "Reports" && <ReportsPanel />}
        {active === "DDE Rules" && <DDERulesPanel />}
        {active === "Relationships" && <RelationshipsPanel />}
      </main>
    </div>
  );
}

/* ----------------------------- 1) PERMISSIONS + AUDIT ----------------------------- */
function PermissionsAuditPanel() {
  const roles = ["admin", "manager", "user", "external"];
  const [role, setRole] = useState("manager");
  const [record, setRecord] = useState({
    _id: "R-1001",
    title: "Payment Gateway Risk",
    owner: "alice",
    status: "Open",
    riskScore: 62,
    acl: {
      entries: [
        {
          principalType: "role",
          principalId: "admin",
          rights: ["read", "write", "delete"],
        },
        {
          principalType: "role",
          principalId: "manager",
          rights: ["read", "write"],
        },
        { principalType: "role", principalId: "user", rights: ["read"] },
      ],
    },
  });

  // Field-level policy demo
  const fieldPolicy = {
    title: { read: ["admin", "manager", "user"], write: ["admin", "manager"] },
    owner: { read: ["admin", "manager"], write: ["admin"] },
    status: { read: ["admin", "manager", "user"], write: ["admin", "manager"] },
    riskScore: { read: ["admin", "manager"], write: ["admin"] },
  };

  const [draft, setDraft] = useState(record);
  const [audits, setAudits] = useState([]);

  useEffect(() => setDraft(record), [record]);

  const can = (field, right) => fieldPolicy[field]?.[right]?.includes(role);

  const save = () => {
    const before = record;
    const after = draft;
    setRecord(after);
    setAudits((a) => [
      {
        id: "AUD-" + (a.length + 1),
        at: new Date().toISOString(),
        userRole: role,
        changes: diff(before, after),
      },
      ...a,
    ]);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 rounded-2xl border bg-white p-5 shadow-sm">
        <SectionTitle
          title="Record"
          subtitle="Role-based field access & editing"
        />

        <div className="mb-4 flex items-center gap-3">
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field
            label="Title"
            value={draft.title}
            onChange={(v) => setDraft((d) => ({ ...d, title: v }))}
            readOnly={!can("title", "write")}
            hidden={!can("title", "read")}
          />
          <Field
            label="Owner"
            value={draft.owner}
            onChange={(v) => setDraft((d) => ({ ...d, owner: v }))}
            readOnly={!can("owner", "write")}
            hidden={!can("owner", "read")}
          />
          <SelectField
            label="Status"
            value={draft.status}
            options={["Open", "In Review", "Mitigated", "Closed"]}
            onChange={(v) => setDraft((d) => ({ ...d, status: v }))}
            disabled={!can("status", "write")}
            hidden={!can("status", "read")}
          />
          <NumberField
            label="Risk Score"
            value={draft.riskScore}
            onChange={(v) => setDraft((d) => ({ ...d, riskScore: Number(v) }))}
            readOnly={!can("riskScore", "write")}
            hidden={!can("riskScore", "read")}
          />
        </div>

        <div className="mt-6 flex gap-2">
          <button
            onClick={save}
            className="rounded-lg bg-[#2B245C] px-4 py-2 text-white"
          >
            Save record
          </button>
          <button
            onClick={() => setDraft(record)}
            className="rounded-lg border px-4 py-2"
          >
            Reset
          </button>
        </div>
      </div>

      <div className="rounded-2xl border bg-white p-5 shadow-sm">
        <SectionTitle title="Audit Log" subtitle="Immutable history (demo)" />
        <div className="space-y-3 max-h-[28rem] overflow-auto pr-1">
          {audits.length === 0 && (
            <p className="text-sm text-gray-500">
              No changes yet. Save to create audit events.
            </p>
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
                by role: <b>{a.userRole}</b>
              </div>
              <pre className="mt-2 whitespace-pre-wrap text-xs bg-gray-50 p-2 rounded-md">
                {JSON.stringify(a.changes, null, 2)}
              </pre>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ----------------------------- 2) NOTIFICATIONS + JOBS ----------------------------- */
function NotificationsJobsPanel() {
  const [rules, setRules] = useState([]);
  const [jobs, setJobs] = useState([]);

  const [draft, setDraft] = useState({
    event: "Status Changed",
    condition: { field: "riskScore", op: ">=", value: 70 },
    actions: { email: "risk-team@example.com", webhook: "" },
  });

  const addRule = () => {
    setRules((r) => [{ id: "R-" + (r.length + 1), ...draft }, ...r]);
  };

  const testFire = () => {
    alert(
      "Simulated: email sent to " +
        (draft.actions.email || "(none)") +
        (draft.actions.webhook
          ? "; webhook POST → " + draft.actions.webhook
          : "")
    );
  };

  const [jobDraft, setJobDraft] = useState({
    name: "Daily Digest",
    schedule: "0 9 * * *",
    action: "Send Report",
  });
  const addJob = () =>
    setJobs((j) => [
      { id: "J-" + (j.length + 1), ...jobDraft, lastRun: null },
      ...j,
    ]);
  const runNow = (id) =>
    setJobs((j) =>
      j.map((x) =>
        x.id === id ? { ...x, lastRun: new Date().toISOString() } : x
      )
    );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="rounded-2xl border bg-white p-5 shadow-sm">
        <SectionTitle
          title="Notification Rules"
          subtitle="If this happens → do that"
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Select
            label="Event"
            value={draft.event}
            set={(v) => setDraft((d) => ({ ...d, event: v }))}
            options={[
              "Record Created",
              "Status Changed",
              "Score Above Threshold",
            ]}
          />
          <div>
            <label className="text-sm text-gray-600">Condition</label>
            <div className="mt-1 flex gap-2">
              <select
                value={draft.condition.field}
                onChange={(e) =>
                  setDraft((d) => ({
                    ...d,
                    condition: { ...d.condition, field: e.target.value },
                  }))
                }
                className="border rounded px-2 py-1"
              >
                <option>riskScore</option>
                <option>status</option>
              </select>
              <select
                value={draft.condition.op}
                onChange={(e) =>
                  setDraft((d) => ({
                    ...d,
                    condition: { ...d.condition, op: e.target.value },
                  }))
                }
                className="border rounded px-2 py-1"
              >
                <option>&gt;=</option>
                <option>&lt;=</option>
                <option>==</option>
                <option>!=</option>
              </select>
              <input
                className="border rounded px-2 py-1 w-24"
                value={draft.condition.value}
                onChange={(e) =>
                  setDraft((d) => ({
                    ...d,
                    condition: { ...d.condition, value: e.target.value },
                  }))
                }
              />
            </div>
          </div>
          <Input
            label="Email"
            value={draft.actions.email}
            set={(v) =>
              setDraft((d) => ({ ...d, actions: { ...d.actions, email: v } }))
            }
          />
          <Input
            label="Webhook URL"
            value={draft.actions.webhook}
            set={(v) =>
              setDraft((d) => ({ ...d, actions: { ...d.actions, webhook: v } }))
            }
          />
        </div>
        <div className="mt-4 flex gap-2">
          <button
            onClick={addRule}
            className="rounded-lg bg-[#2B245C] px-4 py-2 text-white"
          >
            Add Rule
          </button>
          <button onClick={testFire} className="rounded-lg border px-4 py-2">
            Test Fire
          </button>
        </div>
        <div className="mt-4 space-y-2">
          {rules.map((r) => (
            <div key={r.id} className="rounded border p-3 text-sm">
              <div className="flex justify-between">
                <b>{r.id}</b>
                <span className="text-xs text-gray-500">{r.event}</span>
              </div>
              <div className="text-xs text-gray-600">
                if {r.condition.field} {r.condition.op}{" "}
                {String(r.condition.value)} → email: {r.actions.email || "-"},
                webhook: {r.actions.webhook || "-"}
              </div>
            </div>
          ))}
          {rules.length === 0 && (
            <p className="text-sm text-gray-500">No rules yet.</p>
          )}
        </div>
      </div>

      <div className="rounded-2xl border bg-white p-5 shadow-sm">
        <SectionTitle
          title="Job Engine"
          subtitle="Schedule background tasks (demo)"
        />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <Input
            label="Name"
            value={jobDraft.name}
            set={(v) => setJobDraft((d) => ({ ...d, name: v }))}
          />
          <Input
            label="CRON"
            value={jobDraft.schedule}
            set={(v) => setJobDraft((d) => ({ ...d, schedule: v }))}
            hint="e.g., 0 9 * * *"
          />
          <Select
            label="Action"
            value={jobDraft.action}
            set={(v) => setJobDraft((d) => ({ ...d, action: v }))}
            options={["Send Report", "Recalculate Scores", "Push Export"]}
          />
        </div>
        <div className="mt-4">
          <button
            onClick={addJob}
            className="rounded-lg bg-[#2B245C] px-4 py-2 text-white"
          >
            Add Job
          </button>
        </div>
        <div className="mt-4 divide-y">
          {jobs.map((j) => (
            <div key={j.id} className="py-3 flex items-center justify-between">
              <div>
                <div className="font-medium">{j.name}</div>
                <div className="text-xs text-gray-500">
                  {j.schedule} • {j.action}{" "}
                  {j.lastRun &&
                    `• last: ${new Date(j.lastRun).toLocaleString()}`}
                </div>
              </div>
              <button
                onClick={() => runNow(j.id)}
                className="rounded border px-3 py-1.5 text-sm"
              >
                Run now
              </button>
            </div>
          ))}
          {jobs.length === 0 && (
            <p className="text-sm text-gray-500">No jobs yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}

/* ----------------------------- 3) DATA FEEDS ----------------------------- */
function DataFeedsPanel() {
  const [imports, setImports] = useState([]);
  const [exports, setExports] = useState([]);

  const [imp, setImp] = useState({
    name: "Vendors CSV",
    source: "CSV Upload",
    schedule: "Daily 07:00",
    mappings: {
      Name: "vendorName",
      Email: "contactEmail",
      Rating: "riskRating",
    },
  });
  const [exp, setExp] = useState({
    name: "Open Issues",
    destination: "S3",
    schedule: "Hourly",
    fields: ["id", "title", "status", "owner"],
  });

  const sampleRows = [
    { Name: "Acme Ltd", Email: "a@acme.com", Rating: "High" },
    { Name: "Globex", Email: "ops@globex.com", Rating: "Medium" },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="rounded-2xl border bg-white p-5 shadow-sm">
        <SectionTitle
          title="Create Import"
          subtitle="Scheduled ingest with mapping"
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Input
            label="Name"
            value={imp.name}
            set={(v) => setImp((d) => ({ ...d, name: v }))}
          />
          <Select
            label="Source"
            value={imp.source}
            set={(v) => setImp((d) => ({ ...d, source: v }))}
            options={["CSV Upload", "Public URL", "Email Attachment"]}
          />
          <Input
            label="Schedule"
            value={imp.schedule}
            set={(v) => setImp((d) => ({ ...d, schedule: v }))}
          />
        </div>
        <div className="mt-4">
          <div className="text-sm font-medium mb-2">Field Mapping</div>
          <div className="grid grid-cols-3 gap-2 text-xs">
            {Object.entries(imp.mappings).map(([src, dst]) => (
              <div key={src} className="flex items-center gap-2">
                <span className="px-2 py-1 rounded bg-gray-100">{src}</span>
                <span className="text-gray-400">→</span>
                <input
                  className="border rounded px-2 py-1 w-full"
                  value={dst}
                  onChange={(e) =>
                    setImp((d) => ({
                      ...d,
                      mappings: { ...d.mappings, [src]: e.target.value },
                    }))
                  }
                />
              </div>
            ))}
          </div>
        </div>
        <div className="mt-4">
          <div className="text-sm font-medium mb-2">Preview</div>
          <div className="overflow-auto rounded border">
            <table className="min-w-full text-xs">
              <thead className="bg-gray-50">
                <tr>
                  {Object.keys(sampleRows[0]).map((h) => (
                    <th key={h} className="px-2 py-1 text-left font-medium">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sampleRows.map((r, i) => (
                  <tr key={i} className="odd:bg-white even:bg-gray-50">
                    {Object.values(r).map((v, idx) => (
                      <td key={idx} className="px-2 py-1">
                        {v}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="mt-4">
          <button
            onClick={() =>
              setImports((x) => [{ id: "IMP-" + (x.length + 1), ...imp }, ...x])
            }
            className="rounded-lg bg-[#2B245C] px-4 py-2 text-white"
          >
            Save Import
          </button>
        </div>
        <List
          title="Saved Imports"
          items={imports}
          render={(i) => (
            <span className="text-xs text-gray-600">
              {i.id} • {i.name} • {i.source} • {i.schedule}
            </span>
          )}
        />
      </div>

      <div className="rounded-2xl border bg-white p-5 shadow-sm">
        <SectionTitle
          title="Create Export"
          subtitle="Push data out on a schedule"
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Input
            label="Name"
            value={exp.name}
            set={(v) => setExp((d) => ({ ...d, name: v }))}
          />
          <Select
            label="Destination"
            value={exp.destination}
            set={(v) => setExp((d) => ({ ...d, destination: v }))}
            options={["S3", "Email", "SFTP"]}
          />
          <Select
            label="Schedule"
            value={exp.schedule}
            set={(v) => setExp((d) => ({ ...d, schedule: v }))}
            options={["Hourly", "Daily", "Weekly"]}
          />
        </div>
        <div className="mt-4">
          <div className="text-sm font-medium mb-1">Fields</div>
          <div className="flex flex-wrap gap-2">
            {exp.fields.map((f, idx) => (
              <span key={idx} className="px-2 py-1 rounded bg-gray-100 text-xs">
                {f}
              </span>
            ))}
          </div>
        </div>
        <div className="mt-4 flex gap-2">
          <button
            onClick={() =>
              setExports((x) => [{ id: "EXP-" + (x.length + 1), ...exp }, ...x])
            }
            className="rounded-lg bg-[#2B245C] px-4 py-2 text-white"
          >
            Save Export
          </button>
          <button
            onClick={() =>
              alert(
                "Simulated: file generated & delivered to " + exp.destination
              )
            }
            className="rounded-lg border px-4 py-2"
          >
            Run once
          </button>
        </div>
        <List
          title="Saved Exports"
          items={exports}
          render={(e) => (
            <span className="text-xs text-gray-600">
              {e.id} • {e.name} • {e.destination} • {e.schedule}
            </span>
          )}
        />
      </div>
    </div>
  );
}

/* ----------------------------- 4) REPORTS & DASHBOARDS ----------------------------- */
function ReportsPanel() {
  const dataset = useMemo(
    () => [
      {
        id: "I-100",
        title: "Leak",
        owner: "alice",
        status: "Open",
        severity: "High",
        category: "Privacy",
        loss: 12000,
      },
      {
        id: "I-101",
        title: "Outage",
        owner: "bob",
        status: "In Review",
        severity: "Medium",
        category: "Availability",
        loss: 6000,
      },
      {
        id: "I-102",
        title: "Phishing",
        owner: "alice",
        status: "Closed",
        severity: "High",
        category: "Security",
        loss: 2000,
      },
      {
        id: "I-103",
        title: "Vendor",
        owner: "carol",
        status: "Open",
        severity: "Low",
        category: "Third-Party",
        loss: 1000,
      },
    ],
    []
  );

  const [metric, setMetric] = useState("Count");
  const [dimension, setDimension] = useState("severity");
  const [series, setSeries] = useState([]);
  const [widgets, setWidgets] = useState([]);

  const generate = () => {
    const group = {};
    for (const row of dataset) {
      const key = row[dimension];
      if (!group[key]) group[key] = { key, value: 0 };
      group[key].value += metric === "Count" ? 1 : Number(row.loss || 0);
    }
    const out = Object.values(group).sort((a, b) => b.value - a.value);
    setSeries(out);
  };

  const saveWidget = () =>
    setWidgets((w) => [
      { id: "W-" + (w.length + 1), metric, dimension, data: series },
      ...w,
    ]);

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border bg-white p-5 shadow-sm">
        <SectionTitle title="Report Builder" subtitle="Create ad-hoc charts" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <Select
            label="Metric"
            value={metric}
            set={setMetric}
            options={["Count", "Sum: loss"]}
          />
          <Select
            label="Dimension"
            value={dimension}
            set={setDimension}
            options={["severity", "status", "owner", "category"]}
          />
          <div className="flex items-end">
            <button
              onClick={generate}
              className="w-full rounded-lg bg-[#2B245C] px-4 py-2 text-white"
            >
              Generate
            </button>
          </div>
        </div>
        {series.length > 0 && (
          <>
            <BarChart
              data={series}
              max={Math.max(...series.map((s) => s.value))}
            />
            <div className="mt-3 flex gap-2">
              <button
                onClick={saveWidget}
                className="rounded-lg border px-3 py-1.5"
              >
                Save as widget
              </button>
              <button
                onClick={() => setSeries([])}
                className="rounded-lg border px-3 py-1.5"
              >
                Clear
              </button>
            </div>
          </>
        )}
      </div>

      <div className="rounded-2xl border bg-white p-5 shadow-sm">
        <SectionTitle title="Dashboard" subtitle="Saved widgets" />
        {widgets.length === 0 && (
          <p className="text-sm text-gray-500">No widgets saved yet.</p>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {widgets.map((w) => (
            <div key={w.id} className="rounded-xl border p-3">
              <div className="mb-2 text-sm text-gray-600">
                {w.id} • {w.metric} by {w.dimension}
              </div>
              <BarChart
                data={w.data}
                max={Math.max(...w.data.map((s) => s.value))}
                small
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function BarChart({ data, max, small }) {
  return (
    <div className="mt-4">
      <div className="space-y-2">
        {data.map((d) => (
          <div key={d.key} className="flex items-center gap-2">
            <div className="w-28 text-xs text-gray-600">{d.key}</div>
            <div className="h-3 flex-1 rounded bg-gray-100">
              <div
                className="h-3 rounded bg-[#2B245C]"
                style={{ width: `${(d.value / max) * 100}%` }}
              />
            </div>
            <div className="w-16 text-right text-xs">{d.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ----------------------------- 5) DDE RULES (UI LOGIC) ----------------------------- */
function DDERulesPanel() {
  // Simple dynamic form
  const [form, setForm] = useState({
    assetType: "Application",
    subType: "",
    sensitivity: "",
    region: "US",
  });
  const [rules, setRules] = useState([
    {
      id: "D1",
      when: { field: "assetType", op: "==", value: "Data" },
      then: { action: "show", field: "sensitivity" },
    },
    {
      id: "D2",
      when: { field: "assetType", op: "==", value: "Application" },
      then: { action: "hide", field: "sensitivity" },
    },
    {
      id: "D3",
      when: { field: "region", op: "==", value: "EU" },
      then: { action: "require", field: "subType" },
    },
  ]);

  const evaluateRules = (f) => {
    const visibility = { sensitivity: true, subType: true };
    const required = { sensitivity: false, subType: false };
    for (const r of rules) {
      const ok = compare(f[r.when.field], r.when.op, r.when.value);
      if (!ok) continue;
      if (r.then.action === "show") visibility[r.then.field] = true;
      if (r.then.action === "hide") visibility[r.then.field] = false;
      if (r.then.action === "require") required[r.then.field] = true;
      if (r.then.action === "set") f[r.then.field] = r.then.value;
    }
    return { visibility, required, value: f };
  };

  const state = evaluateRules({ ...form });

  const addRule = () =>
    setRules((rs) => [
      {
        id: "D" + (rs.length + 1),
        when: { field: "assetType", op: "==", value: "Data" },
        then: { action: "show", field: "sensitivity" },
      },
      ...rs,
    ]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="rounded-2xl border bg-white p-5 shadow-sm">
        <SectionTitle title="Dynamic Form" subtitle="Rules drive the UI" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Select
            label="Asset Type"
            value={form.assetType}
            set={(v) => setForm((f) => ({ ...f, assetType: v }))}
            options={["Application", "Data", "Device"]}
          />
          <Select
            label="Region"
            value={form.region}
            set={(v) => setForm((f) => ({ ...f, region: v }))}
            options={["US", "EU", "IN"]}
          />

          {state.visibility.subType && (
            <Input
              label={`Sub-Type${state.required.subType ? " *" : ""}`}
              value={form.subType}
              set={(v) => setForm((f) => ({ ...f, subType: v }))}
            />
          )}
          {state.visibility.sensitivity && (
            <Select
              label="Data Sensitivity"
              value={form.sensitivity}
              set={(v) => setForm((f) => ({ ...f, sensitivity: v }))}
              options={["Public", "Internal", "Confidential", "Restricted"]}
            />
          )}
        </div>
        <div className="mt-4 rounded border bg-gray-50 p-3 text-xs">
          <div className="mb-1 font-medium">Computed</div>
          <pre className="whitespace-pre-wrap">
            {JSON.stringify(state, null, 2)}
          </pre>
        </div>
      </div>

      <div className="rounded-2xl border bg-white p-5 shadow-sm">
        <SectionTitle title="DDE Rules" subtitle="No workflow edits needed" />
        <div className="mb-3">
          <button
            onClick={addRule}
            className="rounded-lg bg-[#2B245C] px-3 py-1.5 text-white text-sm"
          >
            Add Example Rule
          </button>
        </div>
        <div className="space-y-2 max-h-[22rem] overflow-auto pr-1">
          {rules.map((r) => (
            <div key={r.id} className="rounded border p-3 text-xs">
              <div className="flex items-center justify-between mb-1">
                <b>{r.id}</b>
                <span className="text-gray-500">when</span>
              </div>
              <div className="text-gray-700">
                {r.when.field} {r.when.op} {String(r.when.value)} →{" "}
                <b>{r.then.action}</b> {r.then.field}
                {r.then.value ? " = " + String(r.then.value) : ""}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ----------------------------- 6) RELATIONSHIP GRAPH VIEW ----------------------------- */
function RelationshipsPanel() {
  // simple static layout in columns by type
  const nodes = [
    { id: "R1", type: "Risk", label: "Payment Risk", col: 1 },
    { id: "R2", type: "Risk", label: "Vendor Risk", col: 1 },
    { id: "C1", type: "Control", label: "Firewall", col: 2 },
    { id: "C2", type: "Control", label: "Vendor SLA", col: 2 },
    { id: "I1", type: "Issue", label: "Patch Delay", col: 3 },
    { id: "I2", type: "Issue", label: "SLA Breach", col: 3 },
  ];
  const links = [
    { from: "R1", to: "C1" },
    { from: "R2", to: "C2" },
    { from: "C1", to: "I1" },
    { from: "C2", to: "I2" },
    { from: "R1", to: "I1" },
  ];

  const [hover, setHover] = useState(null);
  const width = 900,
    height = 420,
    colWidth = width / 3;
  const pos = nodes.map((n, idx) => ({
    ...n,
    x: (n.col - 0.5) * colWidth,
    y: 80 + (idx % 3) * 120 + (n.col % 2 ? 0 : 40),
  }));

  const colorByType = (t) =>
    t === "Risk" ? "#ef4444" : t === "Control" ? "#10b981" : "#3b82f6";

  const selectedIds = new Set([hover?.id]);
  if (hover) {
    for (const l of links) {
      if (l.from === hover.id) selectedIds.add(l.to);
      if (l.to === hover.id) selectedIds.add(l.from);
    }
  }

  return (
    <div className="rounded-2xl border bg-white p-5 shadow-sm">
      <SectionTitle
        title="Relationship Graph"
        subtitle="See context at a glance"
      />
      <div className="overflow-auto">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full">
          {/* edges */}
          {links.map((l, i) => {
            const a = pos.find((p) => p.id === l.from);
            const b = pos.find((p) => p.id === l.to);
            if (!a || !b) return null;
            const active = hover && (hover.id === a.id || hover.id === b.id);
            return (
              <g key={i} opacity={active ? 1 : 0.35}>
                <line
                  x1={a.x}
                  y1={a.y}
                  x2={b.x}
                  y2={b.y}
                  stroke="#cbd5e1"
                  strokeWidth={2}
                />
              </g>
            );
          })}
          {/* nodes */}
          {pos.map((n) => (
            <g
              key={n.id}
              onMouseEnter={() => setHover(n)}
              onMouseLeave={() => setHover(null)}
            >
              <circle
                cx={n.x}
                cy={n.y}
                r={22}
                fill={colorByType(n.type)}
                opacity={hover ? (selectedIds.has(n.id) ? 1 : 0.35) : 1}
              />
              <text
                x={n.x}
                y={n.y + 40}
                textAnchor="middle"
                fontSize="12"
                fill="#4b5563"
              >
                {n.label}
              </text>
              <text
                x={n.x}
                y={n.y + 56}
                textAnchor="middle"
                fontSize="10"
                fill="#9ca3af"
              >
                {n.type} • {n.id}
              </text>
            </g>
          ))}
        </svg>
      </div>
      {hover && (
        <div className="mt-3 rounded border bg-gray-50 p-3 text-sm">
          <div className="font-medium">Selected: {hover.label}</div>
          <div className="text-xs text-gray-600">
            Type: {hover.type} • ID: {hover.id}
          </div>
          <div className="mt-2 text-xs text-gray-600">
            Related:
            {links
              .filter((l) => l.from === hover.id || l.to === hover.id)
              .map((l, i) => {
                const other = l.from === hover.id ? l.to : l.from;
                const node = pos.find((p) => p.id === other);
                return (
                  <span
                    key={i}
                    className="ml-2 inline-block rounded bg-white px-2 py-0.5 border"
                  >
                    {node?.label}
                  </span>
                );
              })}
          </div>
        </div>
      )}
    </div>
  );
}

/* ----------------------------- UI PRIMITIVES ----------------------------- */
function SectionTitle({ title, subtitle }) {
  return (
    <div className="mb-4">
      <div className="text-lg font-semibold text-[#2B245C]">{title}</div>
      <div className="text-xs text-gray-500">{subtitle}</div>
    </div>
  );
}
function Input({ label, value, set, hint }) {
  return (
    <label className="text-sm text-gray-700 block">
      {label}
      <input
        value={value}
        onChange={(e) => set(e.target.value)}
        className="mt-1 w-full rounded border px-3 py-2"
      />
      {hint && <div className="text-xs text-gray-400 mt-1">{hint}</div>}
    </label>
  );
}
function Select({ label, value, set, options }) {
  return (
    <label className="text-sm text-gray-700 block">
      {label}
      <select
        value={value}
        onChange={(e) => set(e.target.value)}
        className="mt-1 w-full rounded border px-3 py-2 bg-white"
      >
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </label>
  );
}
function Field({ label, value, onChange, readOnly, hidden }) {
  if (hidden) return null;
  return (
    <label className="text-sm text-gray-700 block">
      {label}
      <input
        value={value}
        readOnly={readOnly}
        onChange={(e) => onChange(e.target.value)}
        className={`mt-1 w-full rounded border px-3 py-2 ${
          readOnly ? "bg-gray-100 text-gray-500" : ""
        }`}
      />
    </label>
  );
}
function NumberField({ label, value, onChange, readOnly, hidden }) {
  if (hidden) return null;
  return (
    <label className="text-sm text-gray-700 block">
      {label}
      <input
        type="number"
        value={value}
        readOnly={readOnly}
        onChange={(e) => onChange(e.target.value)}
        className={`mt-1 w-full rounded border px-3 py-2 ${
          readOnly ? "bg-gray-100 text-gray-500" : ""
        }`}
      />
    </label>
  );
}
function SelectField({ label, value, onChange, options, disabled, hidden }) {
  if (hidden) return null;
  return (
    <label className="text-sm text-gray-700 block">
      {label}
      <select
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        className={`mt-1 w-full rounded border px-3 py-2 bg-white ${
          disabled ? "bg-gray-100 text-gray-500" : ""
        }`}
      >
        {options.map((o) => (
          <option key={o}>{o}</option>
        ))}
      </select>
    </label>
  );
}
function List({ title, items, render }) {
  return (
    <div className="mt-4">
      <div className="text-sm font-medium mb-2">{title}</div>
      <div className="space-y-2 max-h-56 overflow-auto pr-1">
        {items.length === 0 && (
          <p className="text-sm text-gray-500">Nothing yet.</p>
        )}
        {items.map((it) => (
          <div key={it.id} className="rounded border p-2 bg-white">
            {render(it)}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ----------------------------- helpers ----------------------------- */
function diff(a, b) {
  const out = {};
  const keys = new Set([...Object.keys(a || {}), ...Object.keys(b || {})]);
  for (const k of keys) {
    if (k === "acl") continue; // skip for brevity
    const av = a?.[k];
    const bv = b?.[k];
    if (JSON.stringify(av) !== JSON.stringify(bv))
      out[k] = { before: av, after: bv };
  }
  return out;
}
function compare(a, op, v) {
  if (op === "==") return String(a) === String(v);
  if (op === "!=") return String(a) !== String(v);
  const na = Number(a),
    nv = Number(v);
  if (op === ">=") return na >= nv;
  if (op === "<=") return na <= nv;
  return false;
}
