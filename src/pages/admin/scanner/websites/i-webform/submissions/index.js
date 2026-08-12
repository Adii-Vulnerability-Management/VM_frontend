// components/SubmissionsDashboard.jsx
import { baseurl, initURL } from "@/config/config";
import CustomAxios from "@/config/CustomAxios";
import { FileText, Loader2 } from "lucide-react"; // ⬅️ add Loader2
import React, { useEffect, useMemo, useState } from "react";

export default function SubmissionsDashboard() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  const [q, setQ] = useState("");
  const [open, setOpen] = useState(null); // submission currently opened in side panel
  const [domainFilter, setDomainFilter] = useState("");

  useEffect(() => {
    let alive = true;
    async function go() {
      setLoading(true);
      setErr(null);
      try {
        const res = await CustomAxios.get(
          `${baseurl}/${initURL}/internal-webform-submissions/overview`,
        );
        const data = res.data;
        const rows = Array.isArray(data) ? data : data.items || [];
        const enriched = rows.map(enrichRowWithLabels);
        if (alive) setItems(enriched);
      } catch (e) {
        if (alive) setErr(e.message || "Failed to load");
      } finally {
        if (alive) setLoading(false);
      }
    }
    go();
    return () => {
      alive = false;
    };
  }, []);

  const allDomains = useMemo(() => {
    const s = new Set(items.map((x) => x.domain).filter(Boolean));
    return Array.from(s).sort();
  }, [items]);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return items.filter((x) => {
      if (domainFilter && x.domain !== domainFilter) return false;
      if (!needle) return true;

      const hay = [
        x.domain || "",
        x.formId || "",
        ...(Array.isArray(x.values)
          ? x.values.flatMap((v) => [
              String(v.label ?? ""),
              String(v.value ?? ""),
            ])
          : []),
      ]
        .join(" ")
        .toLowerCase();

      return hay.includes(needle);
    });
  }, [items, q, domainFilter]);

  return (
    <div className="h-full bg-transparent text-gray-800">
      {/* Header */}
      <div className="px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-indigo-700 text-white grid place-items-center">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl text-[#2B245C] font-semibold leading-tight">
                New Webform Activity
              </h1>
              <p className="text-sm text-gray-500">
                All domains • All forms • Most recent first
              </p>
            </div>
          </div>

          {/* Controls: search + domain filter ONLY */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search domain, form, name, email…"
                className="w-64 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              {q && (
                <button
                  onClick={() => setQ("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-500"
                >
                  ✕
                </button>
              )}
            </div>

            <select
              className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={domainFilter}
              onChange={(e) => setDomainFilter(e.target.value)}
            >
              <option value="">All domains</option>
              {allDomains.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="px-4 sm:px-6 lg:px-8 pb-10">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="p-4 border-b border-gray-100">
            {loading ? (
              <div className="text-sm text-gray-500 flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading submissions…
              </div>
            ) : err ? (
              <div className="text-sm text-red-600">Error: {err}</div>
            ) : (
              <div className="text-sm text-gray-500">
                Showing <b>{filtered.length}</b> of {items.length} submissions
              </div>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-[#2B245C]">
                <tr className="text-left text-white">
                  {["When", "Domain", "Form", "Actions"].map((h) => (
                    <th key={h} className="py-2 px-3">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody aria-live="polite">
                {/* Loading state: single row spinner */}
                {loading && (
                  <tr>
                    <td
                      colSpan={4}
                      className="py-10 px-3 text-center text-gray-500"
                    >
                      <div className="inline-flex items-center gap-2">
                        <Loader2 className="h-5 w-5 animate-spin" />
                        <span>Loading submissions…</span>
                      </div>
                    </td>
                  </tr>
                )}

                {/* Error state in-table */}
                {!loading && err && (
                  <tr>
                    <td colSpan={4} className="py-10 px-3 text-center">
                      <div className="inline-block rounded-md bg-red-50 px-3 py-2 text-red-700 border border-red-200">
                        Error: {err}
                      </div>
                    </td>
                  </tr>
                )}

                {/* No data at all */}
                {!loading && !err && items.length === 0 && (
                  <tr>
                    <td
                      colSpan={4}
                      className="py-10 px-3 text-center text-gray-500"
                    >
                      No data found.
                    </td>
                  </tr>
                )}

                {/* No matches for filters */}
                {!loading &&
                  !err &&
                  items.length > 0 &&
                  filtered.length === 0 && (
                    <tr>
                      <td
                        colSpan={4}
                        className="py-10 px-3 text-center text-gray-500"
                      >
                        No submissions match your filters.
                      </td>
                    </tr>
                  )}

                {/* Data rows */}
                {!loading &&
                  !err &&
                  filtered.length > 0 &&
                  filtered.map((row) => (
                    <tr key={row._id} className="border-t">
                      <td className="py-2 px-3 whitespace-nowrap">
                        {row.createdAt
                          ? new Date(row.createdAt).toLocaleString()
                          : "—"}
                      </td>
                      <td className="py-2 px-3">
                        <div className="font-medium">{row.domain || "—"}</div>
                        <div className="text-xs text-gray-500">
                          {row.config?.fieldCount ??
                            row.config?.fields?.length ??
                            0}{" "}
                          fields
                        </div>
                      </td>
                      <td className="py-2 px-3">
                        <span className="inline-flex items-center rounded-md bg-indigo-50 px-2 py-0.5 text-xs font-medium text-indigo-700 border border-indigo-200">
                          {row.formId || "—"}
                        </span>
                      </td>
                      <td className="py-2 px-3">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setOpen(row)}
                            className="rounded-lg border border-[#2B245C] bg-white px-3 py-1.5 text-xs text-[#2B245C] hover:bg-gray-50"
                            title="View details"
                          >
                            View
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal (opens on View) */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 sm:px-6">
          <button
            aria-label="Close modal"
            className="absolute inset-0 bg-black/40"
            onClick={() => setOpen(null)}
          />
          <div className="relative z-10 w-full max-w-3xl max-h-[90vh] bg-white shadow-xl rounded-xl flex flex-col">
            <div className="p-4 bg-[#2B245C] border-b rounded-t-xl flex items-center justify-between">
              <div>
                <div className="text-sm text-white">Submission</div>
                <div className="text-base text-cyan-50 font-semibold">
                  {open.config?.formName || open.formId}
                </div>
              </div>
              <button
                className="rounded-lg text-[#2B245C] bg-white border border-[#2B245C] px-3 py-1.5 text-sm hover:bg-blue-50"
                onClick={() => setOpen(null)}
              >
                Close
              </button>
            </div>

            <div className="p-4 grow overflow-y-auto">
              <div className="grid grid-cols-2 gap-3 mb-4">
                <InfoTile label="Form ID" value={open.formId} />
                <InfoTile label="Form Name" value={open.config?.formName} />
                <InfoTile label="Domain" value={open.domain} />
                <InfoTile
                  label="Config fields"
                  value={String(
                    open.config?.fieldCount ?? open.config?.fields?.length ?? 0,
                  )}
                />
                <InfoTile
                  label="Created at"
                  value={formatDate(open.createdAt)}
                />
              </div>

              <div className="border border-[#2B245C] rounded-lg overflow-hidden">
                <div className="bg-blue-100 text-gray-800 px-3 py-2 text-sm font-medium">
                  Captured Fields
                </div>
                <div className="divide-y">
                  {(open.values || []).map((v, i) => (
                    <div
                      key={i}
                      className="px-3 py-2 text-xs flex items-start justify-between gap-3"
                    >
                      <div className="text-gray-600 w-40 shrink-0">
                        <div className="font-medium">{v.label || "—"}</div>
                      </div>
                      <div className="grow">{renderValue(v)}</div>
                    </div>
                  ))}
                  {(!open.values || open.values.length === 0) && (
                    <div className="px-3 py-6 text-sm text-gray-500">
                      No values.
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="p-4 border-t flex items-center justify-end gap-2">
              <button
                onClick={() => setOpen(null)}
                className="rounded-lg border border-[#2B245C] text-[#2B245C] px-3 py-2 text-sm hover:bg-blue-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------------- helpers ---------------- */

function formatDate(d) {
  try {
    return d ? new Date(d).toLocaleString() : "—";
  } catch {
    return "—";
  }
}

function enrichRowWithLabels(row) {
  const map = {};
  const fields = row?.config?.fields || [];
  for (const f of fields) {
    if (f?.id) map[f.id] = { label: f.label, type: f.type };
  }
  const values = (row.values || []).map((v) => {
    const meta = map[v.fieldId] || {};
    return {
      ...v,
      label: v.label ?? meta.label ?? v.fieldId,
      type: v.type ?? meta.type,
    };
  });
  return { ...row, values };
}

function pickValueByLabel(row, regex) {
  const hit = (row.values || []).find((v) => regex.test(String(v.label || "")));
  return hit ? String(hit.value ?? "") : "";
}

function renderValue(v) {
  if (typeof v.value === "boolean") {
    return (
      <span
        className={
          "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium " +
          (v.value
            ? "bg-green-50 text-green-700 border border-green-200"
            : "bg-gray-50 text-gray-600 border border-gray-200")
        }
      >
        {v.value ? "✓ Yes" : "No"}
      </span>
    );
  }
  if (Array.isArray(v.value)) {
    return (
      <div className="flex flex-wrap gap-1">
        {v.value.map((x, i) => (
          <span
            key={i}
            className="inline-block rounded bg-gray-100 px-2 py-0.5 text-xs"
          >
            {String(x)}
          </span>
        ))}
      </div>
    );
  }
  return (
    <span className="text-gray-900">
      {String(v.value ?? "") || <em className="text-gray-400">—</em>}
    </span>
  );
}

function InfoTile({ label, value }) {
  return (
    <div className="rounded-lg border border-gray-300 px-3 py-2">
      <div className="text-xs text-gray-500">{label}</div>
      <div className="text-sm font-medium break-all">{value || "—"}</div>
    </div>
  );
}
