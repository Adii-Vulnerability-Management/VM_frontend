import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import CustomAxios from "@/globalcomponents/CustomAxios";
import { baseurl, initURL } from "@/config/config";
import DataFlowNav from "../../Nav";

export default function CoverageMatrix() {
  const { query } = useRouter();
  const { bpaId } = query;

  const [data, setData] = useState(null);
  const [setStr, setSetStr] = useState("GDPR+DPDPA+CCPA+PCI_DSS+HIPAA");

  // UI state (non-breaking)
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!bpaId) return;
    (async () => {
      setError("");
      try {
        setLoading(true);
        const url = `${baseurl}/${initURL}/dataflow/coverage/bpa/${bpaId}?frameworkSet=${encodeURIComponent(
          setStr,
        )}`;
        const r = await CustomAxios.get(url);
        setData(r.data);
      } catch (e) {
        setError(
          e?.response?.data?.message || e.message || "Failed to load coverage",
        );
      } finally {
        setLoading(false);
      }
    })();
  }, [bpaId, setStr]);

  const statusTone = (s = "") => {
    const v = String(s).toLowerCase();
    if (/full|covered|complete|yes|pass|good/.test(v))
      return "border-emerald-200 bg-emerald-50 text-emerald-700";
    if (/partial|in-progress|some/.test(v))
      return "border-amber-200 bg-amber-50 text-amber-700";
    if (/gap|missing|no|fail|none|n\/a/.test(v))
      return "border-red-200 bg-red-50 text-red-700";
    return "border-gray-200 bg-gray-50 text-gray-700";
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <DataFlowNav />

      {/* Header */}
      <div className="bg-white min-h-screen rounded-lg p-5 my-3 mx-5">
        <div className="px-6 py-8 bg-[#2B245C] rounded-2xl shadow-lg hover:shadow-2xl transition-shadow duration-300">
          <h1 className="text-3xl font-bold text-cyan-50">
            Coverage —{" "}
            <span className="text-cyan-100">
              {data?.bpa?.name ? `${data.bpa.name}` : ""}
            </span>
          </h1>
          <p className="mt-2 text-sm text-cyan-50">
            Framework-topic coverage for the selected BPA across your chosen
            framework set.
          </p>
        </div>

        {/* Controls */}
        <div className="py-5 space-y-5">
          <section className="rounded-2xl border border-[#2B245C] bg-white p-6 shadow-lg hover:shadow-2xl transition-shadow duration-300">
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Framework Set (e.g., GDPR+DPDPA+CCPA+PCI_DSS+HIPAA)
            </label>
            <div className="flex gap-2 flex-col sm:flex-row">
              <input
                className="w-full sm:max-w-md rounded-lg border border-gray-200 px-3 py-2 text-sm"
                value={setStr}
                onChange={(e) => setSetStr(e.target.value)}
                placeholder="GDPR+DPDPA+CCPA+PCI_DSS+HIPAA"
              />
              <div className="text-xs text-gray-500 self-center">
                BPA ID: <span className="font-mono">{bpaId || "—"}</span>
              </div>
            </div>
            {error && (
              <div className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {error}
              </div>
            )}
          </section>

          {/* Content */}
          <section className="rounded-2xl border border-[#2B245C] bg-white p-6 shadow-lg hover:shadow-2xl transition-shadow duration-300">
            {loading ? (
              <div className="grid gap-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="bg-white shadow-sm">
                    <div className="h-5 w-56 animate-nonerounded bg-gray-100 mb-3" />
                    <div className="overflow-hidden rounded-lg border border-gray-200">
                      <div className="h-8 w-full bg-gray-50" />
                      {[...Array(3)].map((__, j) => (
                        <div key={j} className="h-10 border-t border-gray-100">
                          <div className="h-4 w-3/4 mx-4 my-3 animate-nonerounded bg-gray-100" />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : !data ? (
              <div className="text-sm text-gray-600">Loading…</div>
            ) : (data.rows || []).length === 0 ? (
              <div className="bg-white text-sm text-gray-600 shadow-sm">
                No coverage rows to display for this BPA and framework set.
              </div>
            ) : (
              (data.rows || []).map((row) => (
                <div key={row.saId} className="bg-white shadow-sm">
                  <div className="mb-2 flex items-center justify-between">
                    <div className="font-medium text-gray-900">
                      System Activity:{" "}
                      <span className="font-mono">{row.saId}</span>
                    </div>
                  </div>

                  <div className="overflow-x-auto rounded-lg border border-gray-800">
                    <table className="min-w-full text-sm">
                      <thead className="bg-[#2B245C] text-left text-white border-b border-gray-800">
                        <tr>
                          <th className="px-4 py-2 font-medium">Topic</th>
                          <th className="px-4 py-2 font-medium">Status</th>
                          <th className="px-4 py-2 font-medium">Citations</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {Object.entries(row.topicStatuses || {}).map(
                          ([topic, status]) => (
                            <tr key={topic} className="hover:bg-gray-50">
                              <td className="px-4 py-2">{topic}</td>
                              <td className="px-4 py-2">
                                <span
                                  className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs ${statusTone(
                                    status,
                                  )}`}
                                >
                                  {String(status || "—")}
                                </span>
                              </td>
                              <td className="px-4 py-2">
                                {(() => {
                                  const cites =
                                    (row.citations || {})[topic] || [];
                                  return cites.length ? (
                                    <div className="flex flex-wrap gap-1">
                                      {cites.map((c, i) => (
                                        <span
                                          key={i}
                                          className="rounded-full border border-gray-200 bg-gray-50 px-2 py-0.5 text-xs text-gray-700"
                                          title={`${c.framework} ${c.version}`}
                                        >
                                          {c.framework} {c.version} —{" "}
                                          {c.citation}
                                        </span>
                                      ))}
                                    </div>
                                  ) : (
                                    <span className="text-gray-500">—</span>
                                  );
                                })()}
                              </td>
                            </tr>
                          ),
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
