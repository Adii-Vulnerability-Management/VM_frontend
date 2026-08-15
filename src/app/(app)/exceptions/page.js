"use client";

import { useEffect, useState } from "react";
import { RefreshCw, Check, X } from "lucide-react";
import Topbar from "@/components/Topbar";
import { Badge, Button, Card, EmptyState, ErrorBanner, Spinner } from "@/components/ui";
import { approveException, listExceptions, rejectException } from "@/lib/vm";
import { apiErrorMessage } from "@/lib/api";

const STATUS_BADGE = {
  pending: "bg-amber-100 text-amber-700 border-amber-200",
  approved: "bg-emerald-100 text-emerald-700 border-emerald-200",
  rejected: "bg-red-100 text-red-700 border-red-200",
  expired: "bg-slate-100 text-slate-500 border-slate-200",
};

export default function ExceptionsPage() {
  const [exceptions, setExceptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actingId, setActingId] = useState(null);

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await listExceptions();
      setExceptions(Array.isArray(data) ? data : data?.items || []);
    } catch (err) {
      setError(apiErrorMessage(err, "Failed to load exceptions."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleDecision = async (exception, action) => {
    setActingId(exception._id);
    setError("");
    try {
      if (action === "approve") await approveException(exception._id, {});
      else await rejectException(exception._id, {});
      await load();
    } catch (err) {
      setError(apiErrorMessage(err, `Could not ${action} exception.`));
    } finally {
      setActingId(null);
    }
  };

  return (
    <>
      <Topbar
        title="Exceptions"
        subtitle="Review and decide on risk-acceptance exception requests."
        actions={
          <Button variant="secondary" onClick={load} disabled={loading}>
            <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
            Refresh
          </Button>
        }
      />

      <div className="p-8">
        <ErrorBanner message={error} />

        <Card className="p-5">
          {loading ? (
            <div className="flex justify-center py-16">
              <Spinner className="h-6 w-6 text-slate-400" />
            </div>
          ) : exceptions.length === 0 ? (
            <EmptyState title="No exception requests" subtitle="Requests submitted from the Findings page will appear here." />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500">
                    <th className="py-2 pr-4">Reason</th>
                    <th className="py-2 pr-4">Expires</th>
                    <th className="py-2 pr-4">Status</th>
                    <th className="py-2 pr-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {exceptions.map((ex) => (
                    <tr key={ex._id} className="border-b border-slate-100 last:border-0">
                      <td className="max-w-md py-3 pr-4">
                        <p className="text-slate-900">{ex.reason}</p>
                        {ex.compensatingControl ? (
                          <p className="text-xs text-slate-500">Control: {ex.compensatingControl}</p>
                        ) : null}
                      </td>
                      <td className="py-3 pr-4 text-slate-700">
                        {ex.expiryDate ? new Date(ex.expiryDate).toLocaleDateString() : "—"}
                      </td>
                      <td className="py-3 pr-4">
                        <Badge className={STATUS_BADGE[ex.status] || STATUS_BADGE.pending}>{ex.status || "pending"}</Badge>
                      </td>
                      <td className="py-3 pr-4">
                        {ex.status === "pending" || !ex.status ? (
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleDecision(ex, "approve")}
                              disabled={actingId === ex._id}
                              className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700 hover:bg-emerald-100 disabled:opacity-50"
                            >
                              <Check size={13} />
                              Approve
                            </button>
                            <button
                              onClick={() => handleDecision(ex, "reject")}
                              disabled={actingId === ex._id}
                              className="inline-flex items-center gap-1 rounded-md bg-red-50 px-2 py-1 text-xs font-medium text-red-700 hover:bg-red-100 disabled:opacity-50"
                            >
                              <X size={13} />
                              Reject
                            </button>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400">Decided</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </>
  );
}
