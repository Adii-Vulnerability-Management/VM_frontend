"use client";

import { useEffect, useState } from "react";
import {
  Crosshair,
  ScanSearch,
  ShieldAlert,
  AlertOctagon,
  Clock,
  CheckCircle2,
  RefreshCw,
} from "lucide-react";
import Topbar from "@/components/Topbar";
import { Button, Card, ErrorBanner, Spinner } from "@/components/ui";
import { getDashboardSummary, listAssets } from "@/lib/vm";
import { apiErrorMessage } from "@/lib/api";

const STAT_CARDS = [
  { key: "assets", label: "Scan targets", sub: "Registered assets", icon: Crosshair, color: "bg-indigo-100 text-indigo-600" },
  { key: "totalScans", label: "Total scans", sub: "All time", icon: ScanSearch, color: "bg-cyan-100 text-cyan-600" },
  { key: "openFindings", label: "Open findings", sub: "Needs remediation", icon: ShieldAlert, color: "bg-orange-100 text-orange-600" },
  { key: "critical", label: "Critical findings", sub: "Highest priority", icon: AlertOctagon, color: "bg-red-100 text-red-600" },
  { key: "overdue", label: "Overdue", sub: "Past due date", icon: Clock, color: "bg-fuchsia-100 text-fuchsia-600" },
  { key: "fixedThisMonth", label: "Verified / fixed", sub: "Remediated", icon: CheckCircle2, color: "bg-emerald-100 text-emerald-600" },
];

const SEVERITY_ORDER = ["critical", "high", "medium", "low", "info"];
const SEVERITY_STYLE = {
  critical: "bg-red-50 text-red-700",
  high: "bg-orange-50 text-orange-700",
  medium: "bg-amber-50 text-amber-700",
  low: "bg-emerald-50 text-emerald-700",
  info: "bg-sky-50 text-sky-700",
};

export default function DashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const [summary, assets] = await Promise.all([
        getDashboardSummary(),
        listAssets({ isActive: true }).catch(() => []),
      ]);
      setData({ ...summary, assets: Array.isArray(assets) ? assets.length : assets?.total ?? 0 });
    } catch (err) {
      setError(apiErrorMessage(err, "Failed to load dashboard."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <>
      <Topbar
        title="Vulnerability Management Dashboard"
        subtitle="Scan execution, remediation workload, severity posture, and overdue findings."
        actions={
          <Button variant="secondary" onClick={load} disabled={loading}>
            <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
            Refresh
          </Button>
        }
      />

      <div className="p-8">
        <ErrorBanner message={error} />

        {loading && !data ? (
          <div className="flex justify-center py-24">
            <Spinner className="h-6 w-6 text-slate-400" />
          </div>
        ) : data ? (
          <>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {STAT_CARDS.map((c) => {
                const Icon = c.icon;
                const value = c.key === "assets" ? data.assets ?? 0 : data[c.key] ?? 0;
                const sub = typeof c.sub === "function" ? c.sub(data) : c.sub;
                return (
                  <Card key={c.key} className="p-5">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm text-slate-500">{c.label}</p>
                        <p className="mt-1 text-3xl font-bold text-slate-900">{value}</p>
                        <p className="mt-1 text-xs text-slate-400">{sub}</p>
                      </div>
                      <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${c.color}`}>
                        <Icon size={18} />
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>

            <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-2">
              <Card className="p-6">
                <h3 className="text-base font-semibold text-slate-900">Severity posture</h3>
                <p className="mb-4 text-sm text-slate-500">Current finding distribution by severity.</p>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {SEVERITY_ORDER.map((sev) => (
                    <div key={sev} className={`rounded-lg p-4 ${SEVERITY_STYLE[sev]}`}>
                      <p className="text-xs font-semibold uppercase tracking-wide">{sev}</p>
                      <p className="mt-1 text-2xl font-bold">{data[sev] ?? 0}</p>
                    </div>
                  ))}
                </div>
              </Card>

              <Card className="p-6">
                <h3 className="text-base font-semibold text-slate-900">Findings by scanner</h3>
                <p className="mb-4 text-sm text-slate-500">Volume of findings grouped by scan category.</p>
                {(data.findingsByScanCategory || []).filter((r) => r._id).length === 0 ? (
                  <p className="py-8 text-center text-sm text-slate-400">No categorized findings yet.</p>
                ) : (
                  <ul className="space-y-2">
                    {(data.findingsByScanCategory || [])
                      .filter((r) => r._id)
                      .map((row) => (
                        <li key={row._id} className="flex items-center justify-between text-sm">
                          <span className="capitalize text-slate-700">{row._id}</span>
                          <span className="font-semibold text-slate-900">{row.count}</span>
                        </li>
                      ))}
                  </ul>
                )}
              </Card>
            </div>
          </>
        ) : null}
      </div>
    </>
  );
}
