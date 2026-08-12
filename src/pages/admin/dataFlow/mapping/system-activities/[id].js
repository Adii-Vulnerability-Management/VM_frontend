import React, {
  useEffect,
  useState,
  useMemo,
  useCallback,
  useRef,
} from "react";
import CustomAxios from "@/globalcomponents/CustomAxios";
import { baseurl, initURL } from "@/config/config";
import SelectFlowFilters from "@/components/dataflow/SelectFlowFilters";

// App Router helpers for URL + query
import {
  useParams,
  useSearchParams,
  useRouter,
  usePathname,
} from "next/navigation";

const SA_BASE = `${baseurl}/${initURL}/dataflow/system-activities`;
const FLOWS_BASE = `${baseurl}/${initURL}/dataflow/mapping/flows`;

export default function SystemActivityDetail({ params }) {
  const navParams = useParams?.();
  const searchParams = useSearchParams?.();
  const router = useRouter?.();
  const pathname = usePathname?.();

  // normalize an id value that might be string|string[]
  const normalizeId = (v) =>
    Array.isArray(v) ? v[0] ?? "" : typeof v === "string" ? v : "";

  // prefer URL params, fallback to prop
  const saId = useMemo(() => {
    const urlId = normalizeId(navParams?.id ?? navParams?.saId);
    if (urlId) return urlId;
    return normalizeId(params?.id);
  }, [navParams, params]);

  // ---- Initialize filters from URL query ----
  const qInit = useMemo(() => {
    const q = new URLSearchParams(searchParams ? searchParams.toString() : "");
    return {
      methodCSV: q.get("method") || "",
      crossBorder: q.get("crossBorder") || "",
    };
  }, [searchParams]);

  const [sa, setSa] = useState(null);
  const [flowsFrom, setFlowsFrom] = useState([]);
  const [flowsTo, setFlowsTo] = useState([]);

  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // local filter state
  const [methodCSV, setMethodCSV] = useState(qInit.methodCSV);
  const [crossBorder, setCrossBorder] = useState(qInit.crossBorder);

  // ---- Debounced filters ----
  const DEBOUNCE_MS = 400;
  const [debounced, setDebounced] = useState({
    methodCSV: qInit.methodCSV,
    crossBorder: qInit.crossBorder,
  });

  // sync when URL query changes
  useEffect(() => {
    setMethodCSV(qInit.methodCSV);
    setCrossBorder(qInit.crossBorder);
  }, [qInit.methodCSV, qInit.crossBorder]);

  // debounce timer
  useEffect(() => {
    const t = setTimeout(
      () => setDebounced({ methodCSV, crossBorder }),
      DEBOUNCE_MS
    );
    return () => clearTimeout(t);
  }, [methodCSV, crossBorder]);

  // push filters back to URL
  useEffect(() => {
    if (!router || !pathname) return;
    const q = new URLSearchParams(searchParams ? searchParams.toString() : "");
    if (debounced.methodCSV) q.set("method", debounced.methodCSV);
    else q.delete("method");
    if (debounced.crossBorder) q.set("crossBorder", debounced.crossBorder);
    else q.delete("crossBorder");
    const qs = q.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname);
  }, [
    debounced.methodCSV,
    debounced.crossBorder,
    pathname,
    router,
    searchParams,
  ]);

  async function load(current = debounced) {
    if (!saId) return;
    setError("");
    try {
      setLoading(true);
      const s = await CustomAxios.get(`${SA_BASE}/${encodeURIComponent(saId)}`);
      setSa(s.data);

      const qBase = new URLSearchParams();
      if (current.methodCSV) qBase.set("method", current.methodCSV);
      if (current.crossBorder) qBase.set("crossBorder", current.crossBorder);

      const baseQS = qBase.toString();
      const fromUrl = `${FLOWS_BASE}?sourceSaId=${encodeURIComponent(saId)}${
        baseQS ? `&${baseQS}` : ""
      }`;
      const toUrl = `${FLOWS_BASE}?targetSaId=${encodeURIComponent(saId)}${
        baseQS ? `&${baseQS}` : ""
      }`;

      const [from, to] = await Promise.all([
        CustomAxios.get(fromUrl),
        CustomAxios.get(toUrl),
      ]);

      setFlowsFrom(from.data || []);
      setFlowsTo(to.data || []);
    } catch (e) {
      setError(
        e?.response?.data?.message ||
          e.message ||
          "Failed to load system activity or flows"
      );
    } finally {
      setLoading(false);
    }
  }

  // load whenever saId or debounced filters change
  useEffect(() => {
    if (saId) load();
  }, [saId, debounced.methodCSV, debounced.crossBorder]);

  const sec = useMemo(
    () => ({
      atRest: !!sa?.encryptionAtRest,
      inTransit: !!sa?.encryptionInTransit,
      access: !!sa?.accessControlEnforced,
      audit: !!sa?.auditLoggingEnabled,
    }),
    [sa]
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header */}
      <div className="border-b bg-white/60 backdrop-blur supports-[backdrop-filter]:bg-white/60">
        <div className="mx-auto max-w-6xl px-4 py-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">
              System Activity
            </h1>
            <p className="mt-1 text-sm text-gray-600">
              Details, posture, and flows touching this system activity.
            </p>
          </div>
          {saId && (
            <div className="text-xs text-gray-500">
              SA ID: <span className="font-mono">{saId}</span>
            </div>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="mx-auto max-w-6xl px-4 py-6 space-y-6">
        {/* SA Summary */}
        <section className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
          {loading && !sa ? (
            <div className="space-y-2">
              <div className="h-5 w-40 animate-nonerounded bg-gray-100" />
              <div className="h-4 w-64 animate-nonerounded bg-gray-100" />
              <div className="h-4 w-80 animate-nonerounded bg-gray-100" />
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 pt-2">
                {[...Array(4)].map((_, i) => (
                  <div
                    key={i}
                    className="h-6 animate-nonerounded bg-gray-100"
                  />
                ))}
              </div>
            </div>
          ) : !sa ? (
            <p className="text-sm text-gray-600">Loading…</p>
          ) : (
            <>
              <div className="text-sm space-y-1">
                <div>
                  <span className="text-gray-600">ID:</span>{" "}
                  <span className="font-mono">{sa._id}</span>
                </div>
                <div>
                  <span className="text-gray-600">BPA:</span>{" "}
                  <span className="font-mono">{sa.bpaId}</span>
                </div>
                <div>
                  <span className="text-gray-600">Asset:</span>{" "}
                  <span className="font-mono">{sa.assetId}</span>
                </div>
                <div>
                  <span className="text-gray-600">Role@Activity:</span>{" "}
                  {sa.roleAtActivity}
                </div>
                <div>
                  <span className="text-gray-600">Vendor:</span>{" "}
                  {sa.vendorId || "—"}
                </div>
                <div>
                  <span className="text-gray-600">Interfaces:</span>{" "}
                  {(sa.interfaces || []).join(", ") || "—"}
                </div>
                <div>
                  <span className="text-gray-600">Regions:</span>{" "}
                  {(sa.regions || []).join(", ") || "—"}
                </div>
                <div>
                  <span className="text-gray-600">Observed Categories:</span>{" "}
                  {(sa.observedCategories || []).join(", ") || "—"}
                </div>
              </div>

              <div className="pt-3 grid grid-cols-2 md:grid-cols-4 gap-2">
                <Badge ok={sec.atRest} label="Encrypt@Rest" />
                <Badge ok={sec.inTransit} label="Encrypt@Transit" />
                <Badge ok={sec.access} label="Access Control" />
                <Badge ok={sec.audit} label="Audit Logging" />
              </div>
            </>
          )}

          {error && (
            <div className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </div>
          )}
        </section>

        {/* Flows */}
        <section className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm space-y-3">
          <div className="flex flex-wrap items-end gap-3">
            <h2 className="font-semibold text-lg text-gray-900">
              Flows touching this SA
            </h2>
            <SelectFlowFilters
              methodCSV={methodCSV}
              setMethodCSV={setMethodCSV}
              crossBorder={crossBorder}
              setCrossBorder={setCrossBorder}
            />
          </div>

          <div>
            <div className="mb-2 font-medium">Outgoing</div>
            {loading && sa ? (
              <TableSkeleton />
            ) : (
              <FlowTable items={flowsFrom} />
            )}
          </div>

          <div className="pt-2 border-t border-gray-100">
            <div className="mb-2 font-medium">Incoming</div>
            {loading && sa ? <TableSkeleton /> : <FlowTable items={flowsTo} />}
          </div>
        </section>
      </div>
    </div>
  );
}

function Badge({ ok, label }) {
  return (
    <span
      className={[
        "inline-block text-xs px-2 py-1 rounded-full border",
        ok
          ? "border-emerald-200 bg-emerald-50 text-emerald-700"
          : "border-gray-200 bg-gray-50 text-gray-700",
      ].join(" ")}
    >
      {label}
    </span>
  );
}

function TableSkeleton() {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-sm">
        <thead className="bg-gray-50 text-left text-gray-700">
          <tr>
            {[
              "Source SA",
              "Target SA",
              "Method",
              "Freq",
              "Cross-Border",
              "Safeguards",
              "Status",
            ].map((h) => (
              <th key={h} className="px-4 py-2 font-medium">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {[...Array(3)].map((_, i) => (
            <tr key={i}>
              {Array.from({ length: 7 }).map((__, j) => (
                <td key={j} className="px-4 py-3">
                  <div className="h-4 w-32 animate-nonerounded bg-gray-100" />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function FlowTable({ items }) {
  if (!items?.length) return <p className="text-sm text-gray-600">No flows.</p>;
  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200">
      <table className="min-w-full text-sm">
        <thead className="bg-gray-50 text-left text-gray-700">
          <tr>
            <th className="px-4 py-2 font-medium">Source SA</th>
            <th className="px-4 py-2 font-medium">Target SA</th>
            <th className="px-4 py-2 font-medium">Method</th>
            <th className="px-4 py-2 font-medium">Freq</th>
            <th className="px-4 py-2 font-medium">Cross-Border</th>
            <th className="px-4 py-2 font-medium">Safeguards</th>
            <th className="px-4 py-2 font-medium">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {items.map((f) => (
            <tr key={f._id} className="hover:bg-gray-50">
              <td className="px-4 py-2 font-mono">{f.sourceSaId}</td>
              <td className="px-4 py-2 font-mono">{f.targetSaId}</td>
              <td className="px-4 py-2">{f.method}</td>
              <td className="px-4 py-2">{f.frequency || "—"}</td>
              <td className="px-4 py-2">
                <span
                  className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs ${
                    f.crossBorder
                      ? "border-amber-200 bg-amber-50 text-amber-700"
                      : "border-gray-200 bg-gray-50 text-gray-700"
                  }`}
                >
                  {String(!!f.crossBorder)}
                </span>
              </td>
              <td className="px-4 py-2">
                {(f.safeguards || []).length ? (
                  <div className="flex flex-wrap gap-1">
                    {(f.safeguards || []).map((s, idx) => (
                      <span
                        key={idx}
                        className="rounded-full border border-gray-200 bg-gray-50 px-2 py-0.5 text-xs text-gray-700"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                ) : (
                  "—"
                )}
              </td>
              <td className="px-4 py-2">
                <span
                  className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs ${
                    /success|ok|completed/i.test(f.status || "")
                      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                      : /fail|error/i.test(f.status || "")
                      ? "border-red-200 bg-red-50 text-red-700"
                      : "border-gray-200 bg-gray-50 text-gray-700"
                  }`}
                >
                  {f.status || "—"}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
