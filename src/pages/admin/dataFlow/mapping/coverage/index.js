import React, { useEffect, useState } from "react";
import CustomAxios from "@/globalcomponents/CustomAxios";
import { baseurl, initURL } from "@/config/config";
import Link from "next/link";
import DataFlowNav from "../../Nav";

export default function CoverageHome() {
  const bpaBase = `${baseurl}/${initURL}/dataflow/bpas`;
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      setError("");
      try {
        setLoading(true);
        const r = await CustomAxios.get(bpaBase);
        setItems(r.data || []);
      } catch (e) {
        setError(
          e?.response?.data?.message ||
            e.message ||
            "Failed to load activities",
        );
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <DataFlowNav />

      {/* Header */}
      <div className="bg-white min-h-screen rounded-lg p-5 my-3 mx-5">
        <div className="px-6 py-8 bg-[#2B245C] rounded-2xl shadow-lg hover:shadow-2xl transition-shadow duration-300">
          <h1 className="text-3xl font-bold text-cyan-50">Coverage Matrix</h1>
          <p className="mt-2 text-sm text-white">
            Pick an Activity (BPA) to view framework coverage.
          </p>
        </div>

        {/* Body */}
        <div className="py-5 space-y-5">
          {loading ? (
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="rounded-xl border border-[#2B245C] bg-white p-4 shadow-sm"
                >
                  <div className="h-5 w-32 animate-nonerounded bg-gray-100 mb-2"></div>
                  <div className="h-4 w-24 animate-nonerounded bg-gray-100"></div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </div>
          ) : items.length === 0 ? (
            <p className="text-gray-600">
              No activities available. Create a BPA first.
            </p>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {items.map((it) => (
                <Link
                  key={it._id}
                  href={`./coverage/${it._id}`}
                  className="block rounded-xl border border-[#2B245C] bg-gray-50 p-4 shadow-sm hover:shadow-lg hover:bg-gray-100 hover:border-gray-600"
                >
                  <h3 className="text-base font-semibold text-[#2B245C]">
                    {it.name}
                  </h3>
                  <p className="mt-1 text-sm text-gray-600 line-clamp-2">
                    {it.description || "No description"}
                  </p>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
