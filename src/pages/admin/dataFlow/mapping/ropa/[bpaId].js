import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import dynamic from "next/dynamic";
import CustomAxios from "@/globalcomponents/CustomAxios";
import { baseurl, initURL } from "@/config/config";

const DataFlowNav = dynamic(() => import("../../Nav"), {
  ssr: false,
});

const isObject = (v) => v && typeof v === "object" && !Array.isArray(v);

const formatLabel = (key = "") =>
  String(key)
    .replace(/_/g, " ")
    .replace(/-/g, " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/\b\w/g, (c) => c.toUpperCase());

const formatDate = (value) => {
  if (!value) return "-";

  try {
    return new Date(value).toLocaleString();
  } catch {
    return value;
  }
};

const safeArray = (value) => (Array.isArray(value) ? value : []);

const yesNo = (value) => (value ? "Yes" : "No");

const joinList = (value) => {
  if (!Array.isArray(value) || value.length === 0) return "-";
  return value.join(", ");
};

const getRiskTone = (riskScore) => {
  const score = Number(riskScore);

  if (Number.isNaN(score)) return "gray";
  if (score >= 70) return "red";
  if (score >= 40) return "yellow";
  return "green";
};

const getStatusTone = (value) => {
  const text = String(value ?? "").toLowerCase();

  if (
    text.includes("gap") ||
    text.includes("missing") ||
    text.includes("failed") ||
    text.includes("high") ||
    text.includes("critical") ||
    text.includes("no")
  ) {
    return "red";
  }

  if (
    text.includes("partial") ||
    text.includes("pending") ||
    text.includes("review") ||
    text.includes("medium")
  ) {
    return "yellow";
  }

  if (
    text.includes("ok") ||
    text.includes("yes") ||
    text.includes("complete") ||
    text.includes("approved") ||
    text.includes("low")
  ) {
    return "green";
  }

  return "gray";
};

const badgeClass = {
  red: "bg-red-50 text-red-700 border-red-200",
  yellow: "bg-yellow-50 text-yellow-700 border-yellow-200",
  green: "bg-green-50 text-green-700 border-green-200",
  gray: "bg-gray-50 text-gray-700 border-gray-200",
};

function Badge({ children, tone }) {
  const finalTone = tone || getStatusTone(children);

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-1 text-xs font-medium ${badgeClass[finalTone]}`}
    >
      {children ?? "-"}
    </span>
  );
}

function MetricCard({ title, value, hint, tone }) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-4 space-y-2 shadow-md hover:shadow-xl hover:border-gray-300">
      <div className="text-xs uppercase tracking-wide text-gray-500 font-medium">
        {title}
      </div>

      <div className="text-2xl font-semibold text-[#2B245C]">
        {tone ? <Badge tone={tone}>{value}</Badge> : (value ?? "-")}
      </div>

      {hint && <div className="text-xs text-gray-500">{hint}</div>}
    </div>
  );
}

function SectionCard({ title, subtitle, children }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-[#2B245C] bg-white shadow-lg hover:shadow-2xl transition-shadow duration-300">
      <div className="bg-[#F8F9FC] px-5 py-4 border-b">
        <h2 className="text-xl font-semibold text-[#2B245C]">{title}</h2>
        {subtitle && <p className="mt-1 text-xs text-gray-500">{subtitle}</p>}
      </div>

      <div className="p-5">{children}</div>
    </div>
  );
}

function EmptyState({ text = "No data available." }) {
  return (
    <div className="text-sm text-gray-500 bg-gray-50 border rounded-lg p-4">
      {text}
    </div>
  );
}

function InfoGrid({ rows }) {
  const visibleRows = rows.filter((row) => row.value !== undefined);

  if (!visibleRows.length) return <EmptyState />;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      {visibleRows.map((row) => (
        <div key={row.label} className="border rounded-lg p-3 bg-gray-50">
          <div className="text-xs text-gray-500 font-medium uppercase tracking-wide">
            {row.label}
          </div>

          <div className="mt-1 text-sm font-medium text-gray-900 break-words">
            {row.badge ? (
              <Badge tone={row.tone}>{row.value}</Badge>
            ) : (
              row.value || "-"
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

function SecurityMeasureGrid({ activities }) {
  if (!activities.length)
    return <EmptyState text="No system activities found." />;

  const measures = [
    {
      key: "encryptionAtRest",
      label: "Encryption At Rest",
    },
    {
      key: "encryptionInTransit",
      label: "Encryption In Transit",
    },
    {
      key: "accessControlEnforced",
      label: "Access Control",
    },
    {
      key: "auditLoggingEnabled",
      label: "Audit Logging",
    },
    {
      key: "backupDrEnabled",
      label: "Backup / DR",
    },
  ];

  const totals = measures.map((measure) => {
    const ok = activities.filter(
      (activity) => activity?.securityMeasures?.[measure.key] === true,
    ).length;

    const gap = activities.filter(
      (activity) => activity?.securityMeasures?.[measure.key] === false,
    ).length;

    return {
      ...measure,
      ok,
      gap,
      total: activities.length,
    };
  });

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
      {totals.map((item) => (
        <div key={item.key} className="border rounded-lg p-3">
          <div className="font-medium text-sm text-gray-800">{item.label}</div>

          <div className="mt-2 flex items-center gap-2">
            <Badge tone={item.gap > 0 ? "red" : "green"}>
              {item.gap > 0 ? "Gap" : "OK"}
            </Badge>

            <span className="text-xs text-gray-500">
              {item.ok} OK / {item.gap} Gap
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

function TopicTable({ topics }) {
  const statusByTopic = safeArray(topics?.statusByTopic);

  if (!statusByTopic.length) {
    return <EmptyState text="No topic classification data found." />;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="bg-gray-50 border-b">
            <th className="p-3 text-left font-semibold text-gray-700">Topic</th>
            <th className="p-3 text-left font-semibold text-gray-700">
              Declared
            </th>
            <th className="p-3 text-left font-semibold text-gray-700">
              Observed
            </th>
            <th className="p-3 text-left font-semibold text-gray-700">
              Status
            </th>
          </tr>
        </thead>

        <tbody>
          {statusByTopic.map((item) => (
            <tr key={item.topic} className="border-b last:border-b-0">
              <td className="p-3 font-medium text-gray-900">{item.topic}</td>
              <td className="p-3">{yesNo(item.declared)}</td>
              <td className="p-3">{yesNo(item.observed)}</td>
              <td className="p-3">
                <Badge>{item.status}</Badge>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function VendorTable({ activities }) {
  const vendors = activities.map((activity) => activity.vendor).filter(Boolean);

  if (!vendors.length) {
    return <EmptyState text="No vendors found for this processing activity." />;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="bg-gray-50 border-b">
            <th className="p-3 text-left font-semibold text-gray-700">
              Vendor
            </th>
            <th className="p-3 text-left font-semibold text-gray-700">Role</th>
            <th className="p-3 text-left font-semibold text-gray-700">
              Regions
            </th>
            <th className="p-3 text-left font-semibold text-gray-700">DPA</th>
            <th className="p-3 text-left font-semibold text-gray-700">BAA</th>
            <th className="p-3 text-left font-semibold text-gray-700">SCC</th>
            <th className="p-3 text-left font-semibold text-gray-700">Risk</th>
            <th className="p-3 text-left font-semibold text-gray-700">
              Last Review
            </th>
          </tr>
        </thead>

        <tbody>
          {vendors.map((vendor) => (
            <tr
              key={vendor._id || vendor.name}
              className="border-b last:border-b-0"
            >
              <td className="p-3">
                <div className="font-medium text-gray-900">
                  {vendor.name || "-"}
                </div>
                <div className="text-xs text-gray-500">
                  {vendor.legalEntity || "-"}
                </div>
                <div className="text-xs text-gray-500">
                  {vendor.contactEmail || "-"}
                </div>
              </td>

              <td className="p-3">{joinList(vendor.roles)}</td>
              <td className="p-3">{joinList(vendor.regions)}</td>

              <td className="p-3">
                {vendor.dpaRef ? (
                  <Badge tone="green">{vendor.dpaRef}</Badge>
                ) : (
                  <Badge tone="red">Missing</Badge>
                )}
              </td>

              <td className="p-3">
                {vendor.baaRef ? (
                  <Badge tone="green">{vendor.baaRef}</Badge>
                ) : (
                  <Badge tone="gray">Not available</Badge>
                )}
              </td>

              <td className="p-3">
                {safeArray(vendor.sccRefs).length ? (
                  <Badge tone="green">{vendor.sccRefs.length} ref</Badge>
                ) : (
                  <Badge tone="red">Missing</Badge>
                )}
              </td>

              <td className="p-3">
                <Badge tone={getRiskTone(vendor.riskScore)}>
                  {vendor.riskScore ?? "-"}
                </Badge>
              </td>

              <td className="p-3">{formatDate(vendor.lastReviewAt)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function SystemActivityTable({ activities }) {
  if (!activities.length) {
    return <EmptyState text="No system activities found." />;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="bg-gray-50 border-b">
            <th className="p-3 text-left font-semibold text-gray-700">Asset</th>
            <th className="p-3 text-left font-semibold text-gray-700">
              Vendor
            </th>
            <th className="p-3 text-left font-semibold text-gray-700">
              Interfaces
            </th>
            <th className="p-3 text-left font-semibold text-gray-700">
              Regions
            </th>
            <th className="p-3 text-left font-semibold text-gray-700">PCI</th>
            <th className="p-3 text-left font-semibold text-gray-700">PHI</th>
            <th className="p-3 text-left font-semibold text-gray-700">
              Observed Categories
            </th>
          </tr>
        </thead>

        <tbody>
          {activities.map((activity) => (
            <tr key={activity.id} className="border-b last:border-b-0">
              <td className="p-3">
                <div className="font-medium text-gray-900">
                  {activity.assetId || "-"}
                </div>
                <div className="text-xs text-gray-500">
                  Role: {activity.roleAtActivity || "-"}
                </div>
              </td>

              <td className="p-3">{activity.vendor?.name || "-"}</td>
              <td className="p-3">{joinList(activity.interfaces)}</td>
              <td className="p-3">{joinList(activity.regions)}</td>

              <td className="p-3">
                <Badge tone={activity.pciScope ? "yellow" : "gray"}>
                  {yesNo(activity.pciScope)}
                </Badge>
              </td>

              <td className="p-3">
                <Badge tone={activity.phiPresent ? "yellow" : "gray"}>
                  {yesNo(activity.phiPresent)}
                </Badge>
              </td>

              <td className="p-3">{joinList(activity.observedCategories)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function FlowTable({ flows }) {
  if (!flows.length) {
    return <EmptyState text="No data flows found for this BPA." />;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="bg-gray-50 border-b">
            {Object.keys(flows[0] || {}).map((key) => (
              <th
                key={key}
                className="p-3 text-left font-semibold text-gray-700"
              >
                {formatLabel(key)}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {flows.map((flow, index) => (
            <tr key={flow.id || index} className="border-b last:border-b-0">
              {Object.keys(flows[0] || {}).map((key) => (
                <td key={key} className="p-3">
                  {Array.isArray(flow[key])
                    ? joinList(flow[key])
                    : isObject(flow[key])
                      ? JSON.stringify(flow[key])
                      : String(flow[key] ?? "-")}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export default function RopaDetail() {
  const router = useRouter();
  const { bpaId } = router.query;

  const [mounted, setMounted] = useState(false);
  const [data, setData] = useState(null);
  const [showJson, setShowJson] = useState(false);
  const [error, setError] = useState("");

  const currentBpaId = Array.isArray(bpaId) ? bpaId[0] : bpaId;

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || !router.isReady || !currentBpaId) return;

    let cancelled = false;

    async function fetchRopa() {
      try {
        setError("");
        setData(null);

        const url = `${baseurl}/${initURL}/dataflow/ropa?bpaId=${encodeURIComponent(
          currentBpaId,
        )}`;

        const r = await CustomAxios.get(url);

        if (!cancelled) {
          setData(r.data);
        }
      } catch (err) {
        console.error("Failed to fetch ROPA report:", err);

        if (!cancelled) {
          setError("Failed to load ROPA report.");
          setData(null);
        }
      }
    }

    fetchRopa();

    return () => {
      cancelled = true;
    };
  }, [mounted, router.isReady, currentBpaId]);

  const computed = useMemo(() => {
    const summary = data?.summary || {};
    const counts = summary?.counts || {};
    const vendorContracts = summary?.vendorContracts || {};
    const crossBorder = summary?.crossBorder || {};
    const topics = summary?.topics || {};
    const bpa = data?.bpa || {};
    const systemActivities = safeArray(data?.systemActivities);
    const flows = safeArray(data?.flows);

    const securityGaps = systemActivities.reduce((total, activity) => {
      const measures = activity?.securityMeasures || {};

      return (
        total +
        [
          measures.encryptionAtRest,
          measures.encryptionInTransit,
          measures.accessControlEnforced,
          measures.auditLoggingEnabled,
          measures.backupDrEnabled,
        ].filter((value) => value === false).length
      );
    }, 0);

    const vendors = systemActivities.map((a) => a.vendor).filter(Boolean);

    const averageVendorRisk = vendors.length
      ? Math.round(
          vendors.reduce(
            (sum, vendor) => sum + Number(vendor.riskScore || 0),
            0,
          ) / vendors.length,
        )
      : "-";

    const declaredTopics = safeArray(topics.declared);
    const observedTopics = safeArray(topics.observed);

    return {
      summary,
      counts,
      vendorContracts,
      crossBorder,
      topics,
      bpa,
      systemActivities,
      flows,
      securityGaps,
      vendors,
      averageVendorRisk,
      declaredTopics,
      observedTopics,
    };
  }, [data]);

  function generateReportHtml(d) {
    const title = d?.bpa?.name || currentBpaId || "ROPA";
    const generated = d?.generatedAt || new Date().toISOString();
    const summary = d?.summary || {};
    const bpa = d?.bpa || {};
    const systemActivities = safeArray(d?.systemActivities);

    return `<!doctype html>
      <html>
      <head>
        <meta charset="utf-8" />
        <title>ROPA Report - ${escapeHtml(title)}</title>
        <style>
          body {
            font-family: Arial, Helvetica, sans-serif;
            padding: 24px;
            color: #222;
            background: #f7f7fb;
          }

          h1, h2 {
            color: #2B245C;
          }

          .muted {
            color: #666;
            margin-bottom: 20px;
          }

          .card {
            background: #fff;
            border: 1px solid #e5e7eb;
            border-radius: 12px;
            padding: 16px;
            margin-bottom: 16px;
          }

          table {
            border-collapse: collapse;
            width: 100%;
            background: #fff;
            margin-top: 8px;
          }

          td, th {
            border: 1px solid #e5e7eb;
            padding: 10px;
            text-align: left;
            vertical-align: top;
          }

          th {
            background: #f3f4f6;
          }

          pre {
            white-space: pre-wrap;
            background: #f3f4f6;
            padding: 12px;
            border-radius: 8px;
          }
        </style>
      </head>

      <body>
        <h1>ROPA Report: ${escapeHtml(title)}</h1>
        <div class="muted">Generated: ${escapeHtml(generated)}</div>

        <div class="card">
          <h2>Processing Activity</h2>
          <table>
            <tbody>
              <tr><td><strong>Name</strong></td><td>${escapeHtml(bpa.name)}</td></tr>
              <tr><td><strong>Role</strong></td><td>${escapeHtml(bpa.role)}</td></tr>
              <tr><td><strong>Purposes</strong></td><td>${escapeHtml(joinList(bpa.purposes))}</td></tr>
              <tr><td><strong>Data Subjects</strong></td><td>${escapeHtml(joinList(bpa.dataSubjects))}</td></tr>
              <tr><td><strong>Data Categories</strong></td><td>${escapeHtml(joinList(bpa.dataCategories))}</td></tr>
              <tr><td><strong>DPIA Status</strong></td><td>${escapeHtml(bpa.dpiaStatus)}</td></tr>
            </tbody>
          </table>
        </div>

        <div class="card">
          <h2>Summary</h2>
          <pre>${escapeHtml(JSON.stringify(summary, null, 2))}</pre>
        </div>

        <div class="card">
          <h2>System Activities</h2>
          <table>
            <thead>
              <tr>
                <th>Asset</th>
                <th>Vendor</th>
                <th>Interfaces</th>
                <th>Regions</th>
                <th>PCI</th>
                <th>PHI</th>
              </tr>
            </thead>
            <tbody>
              ${systemActivities
                .map(
                  (activity) => `
                    <tr>
                      <td>${escapeHtml(activity.assetId)}</td>
                      <td>${escapeHtml(activity.vendor?.name)}</td>
                      <td>${escapeHtml(joinList(activity.interfaces))}</td>
                      <td>${escapeHtml(joinList(activity.regions))}</td>
                      <td>${escapeHtml(yesNo(activity.pciScope))}</td>
                      <td>${escapeHtml(yesNo(activity.phiPresent))}</td>
                    </tr>
                  `,
                )
                .join("")}
            </tbody>
          </table>
        </div>

        <div class="card">
          <h2>Full JSON</h2>
          <pre>${escapeHtml(JSON.stringify(d, null, 2))}</pre>
        </div>
      </body>
      </html>`;
  }

  function downloadReport() {
    if (!data) return;

    const html = generateReportHtml(data);
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);

    const safeName = String(data?.bpa?.name || currentBpaId || "ropa")
      .replace(/[^a-z0-9]/gi, "-")
      .toLowerCase();

    const a = document.createElement("a");
    a.href = url;
    a.download = `ropa-${safeName}-report.html`;
    a.click();

    URL.revokeObjectURL(url);
  }

  if (!mounted || !router.isReady) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        <div className="bg-white border rounded-xl p-6 text-gray-600">
          Loading ROPA dashboard...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <DataFlowNav />
      <div className="bg-white min-h-screen rounded-lg p-5 my-3 mx-5">
        <div className="px-6 py-8 bg-[#2B245C] rounded-2xl shadow-lg hover:shadow-2xl transition-shadow duration-300 mb-5 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <h1 className="text-3xl font-bold text-cyan-50">
              ROPA: {computed.bpa?.name || ""}
            </h1>

            <div className="mt-1 text-sm text-white">
              Generated:{" "}
              {data?.generatedAt ? formatDate(data.generatedAt) : "-"}
            </div>
          </div>

          {data && (
            <div className="flex gap-2">
              <button
                type="button"
                title="Back"
                onClick={() => router.back()}
                className="flex items-center gap-2 bg-blue-50 text-[#2B245C] text-sm font-semibold px-4 py-2 rounded-lg hover:bg-blue-100"
              >
                ← Back
              </button>

              <button
                type="button"
                title="Download ROPA report"
                onClick={downloadReport}
                className="bg-white text-[#2B245C] text-sm font-semibold px-4 py-2 rounded-lg hover:bg-gray-50"
              >
                Download report
              </button>

              <button
                type="button"
                title="Hide or Preview JSON of ROPA details"
                onClick={() => setShowJson((s) => !s)}
                className="bg-blue-50 text-[#2B245C] text-sm font-semibold px-4 py-2 rounded-lg hover:bg-blue-100"
              >
                {showJson ? "Hide JSON" : "Preview JSON"}
              </button>
            </div>
          )}
        </div>

        {error ? (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-6">
            {error}
          </div>
        ) : !data ? (
          <div className="bg-white border rounded-xl p-6 text-gray-600">
            Loading ROPA dashboard...
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-5">
              <MetricCard
                title="System Activities"
                value={computed.counts.systemActivities ?? 0}
                hint="Systems linked to this BPA"
              />

              <MetricCard
                title="Data Flows"
                value={computed.counts.flows ?? 0}
                hint="Inbound/outbound flows"
              />

              <MetricCard
                title="Vendors"
                value={computed.counts.vendors ?? 0}
                hint="Third-party processors"
              />

              <MetricCard
                title="Security Gaps"
                value={computed.securityGaps}
                tone={computed.securityGaps > 0 ? "red" : "green"}
                hint="Derived from system activities"
              />

              <MetricCard
                title="DPA Coverage"
                value={`${computed.vendorContracts.withDpa ?? 0}/${
                  computed.vendorContracts.withVendor ?? 0
                }`}
                tone={computed.vendorContracts.missingDpa > 0 ? "red" : "green"}
                hint={`${computed.vendorContracts.missingDpa ?? 0} missing DPA`}
              />

              <MetricCard
                title="Cross Border Flows"
                value={computed.crossBorder.flows ?? 0}
                tone={
                  computed.crossBorder.missingSafeguards > 0 ? "red" : "green"
                }
                hint={`${computed.crossBorder.missingSafeguards ?? 0} missing safeguards`}
              />

              <MetricCard
                title="Declared Topics"
                value={computed.declaredTopics.length}
                hint={joinList(computed.declaredTopics)}
              />

              <MetricCard
                title="Avg Vendor Risk"
                value={computed.averageVendorRisk}
                tone={getRiskTone(computed.averageVendorRisk)}
                hint="Average risk score"
              />
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 mb-5">
              <SectionCard
                title="Processing Activity Overview"
                subtitle="Business process details from the BPA record."
              >
                <InfoGrid
                  rows={[
                    {
                      label: "Name",
                      value: computed.bpa.name,
                    },
                    {
                      label: "Role",
                      value: computed.bpa.role,
                      badge: true,
                      tone: "gray",
                    },
                    {
                      label: "Purposes",
                      value: joinList(computed.bpa.purposes),
                    },
                    {
                      label: "Data Subjects",
                      value: joinList(computed.bpa.dataSubjects),
                    },
                    {
                      label: "Data Categories",
                      value: joinList(computed.bpa.dataCategories),
                    },
                    {
                      label: "DPIA Status",
                      value: formatLabel(computed.bpa.dpiaStatus || "-"),
                      badge: true,
                      tone:
                        computed.bpa.dpiaStatus === "not_required"
                          ? "green"
                          : "yellow",
                    },
                  ]}
                />
              </SectionCard>

              <SectionCard
                title="Contract & Transfer Summary"
                subtitle="Vendor contract readiness and cross-border safeguards."
              >
                <InfoGrid
                  rows={[
                    {
                      label: "Vendors With Contract",
                      value: computed.vendorContracts.withVendor ?? 0,
                    },
                    {
                      label: "With DPA",
                      value: computed.vendorContracts.withDpa ?? 0,
                      badge: true,
                      tone:
                        computed.vendorContracts.missingDpa > 0
                          ? "red"
                          : "green",
                    },
                    {
                      label: "Missing DPA",
                      value: computed.vendorContracts.missingDpa ?? 0,
                      badge: true,
                      tone:
                        computed.vendorContracts.missingDpa > 0
                          ? "red"
                          : "green",
                    },
                    {
                      label: "With BAA",
                      value: computed.vendorContracts.withBaa ?? 0,
                    },
                    {
                      label: "Cross Border Flows",
                      value: computed.crossBorder.flows ?? 0,
                    },
                    {
                      label: "Missing Safeguards",
                      value: computed.crossBorder.missingSafeguards ?? 0,
                      badge: true,
                      tone:
                        computed.crossBorder.missingSafeguards > 0
                          ? "red"
                          : "green",
                    },
                  ]}
                />
              </SectionCard>

              <SectionCard
                title="Security Measures"
                subtitle="Derived from security measures on system activities."
              >
                <SecurityMeasureGrid activities={computed.systemActivities} />
              </SectionCard>

              <SectionCard
                title="Data Topic Coverage"
                subtitle="Declared versus observed topic classification."
              >
                <TopicTable topics={computed.topics} />
              </SectionCard>
            </div>

            <div className="space-y-4">
              <SectionCard
                title="Vendors"
                subtitle="Third-party vendors connected to this processing activity."
              >
                <VendorTable activities={computed.systemActivities} />
              </SectionCard>

              <SectionCard
                title="System Activities"
                subtitle="Systems, interfaces, regions, and sensitive data flags."
              >
                <SystemActivityTable activities={computed.systemActivities} />
              </SectionCard>

              <SectionCard
                title="Data Flows"
                subtitle="Flows touching this processing activity."
              >
                <FlowTable flows={computed.flows} />
              </SectionCard>

              {computed.summary?.meta?.notes && (
                <SectionCard title="Notes">
                  <p className="text-sm text-gray-700">
                    {computed.summary.meta.notes}
                  </p>
                </SectionCard>
              )}

              {data?.meta?.notes && (
                <SectionCard title="Report Metadata">
                  <InfoGrid
                    rows={[
                      {
                        label: "Version",
                        value: data.version,
                      },
                      {
                        label: "Lawful Basis Keys",
                        value: joinList(data.meta.lawfulBasisKeys),
                      },
                      {
                        label: "Notes",
                        value: data.meta.notes,
                      },
                    ]}
                  />
                </SectionCard>
              )}

              {showJson && (
                <SectionCard title="Raw JSON Preview">
                  <pre className="p-3 bg-gray-50 rounded border overflow-auto text-xs max-h-[500px]">
                    {JSON.stringify(data, null, 2)}
                  </pre>
                </SectionCard>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
