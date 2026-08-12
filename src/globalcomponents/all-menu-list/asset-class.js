"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import {
  getUtilitiesSummary,
  addAssetToClass,
  removeAssetFromClass,
  deleteAssetClass,
} from "@/utils/utilitiesApi";

export default function AssetClass() {
  const [classes, setClasses] = useState([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);
  const [addAsset, setAddAsset] = useState({}); // { [classId]: value }

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await getUtilitiesSummary();
      setClasses(res?.data?.assetClassData || []);
    } catch (e) {
      toast.error(e?.response?.data?.message || "Failed to load asset classes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    return s
      ? classes.filter((c) => c.assetClassName?.toLowerCase().includes(s))
      : classes;
  }, [classes, q]);

  const onAddAsset = async (cid) => {
    const name = (addAsset[cid] || "").trim();
    if (!name) return;
    try {
      await addAssetToClass(cid, name);
      toast.success("Asset added");
      setAddAsset((p) => ({ ...p, [cid]: "" }));
      fetchData();
    } catch (e) {
      toast.error(e?.response?.data?.message || "Add failed");
    }
  };

  const onRemoveAsset = async (cid, name) => {
    if (!confirm(`Remove asset "${name}"?`)) return;
    try {
      await removeAssetFromClass(cid, name);
      toast.success("Removed");
      fetchData();
    } catch (e) {
      toast.error(e?.response?.data?.message || "Remove failed");
    }
  };

  const onDeleteClass = async (cid) => {
    if (!confirm("Delete this asset class?")) return;
    try {
      await deleteAssetClass(cid);
      toast.success("Asset class deleted");
      setClasses((prev) => prev.filter((c) => c._id !== cid));
    } catch (e) {
      toast.error(e?.response?.data?.message || "Delete failed");
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold">Asset Classes</h3>
        <input
          className="border rounded px-3 py-2"
          placeholder="Search asset classes"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </div>

      <div className="space-y-4">
        {loading ? (
          <div>Loading...</div>
        ) : filtered.length === 0 ? (
          <div className="text-gray-600">No asset classes found</div>
        ) : (
          filtered.map((c) => (
            <div key={c._id} className="border rounded p-4">
              <div className="flex justify-between items-center mb-3">
                <div className="font-semibold">{c.assetClassName}</div>
                <button
                  onClick={() => onDeleteClass(c._id)}
                  className="bg-red-600 text-white px-3 py-1 rounded"
                >
                  Delete Class
                </button>
              </div>

              <div className="mb-2 font-medium">Assets</div>
              <div className="flex flex-wrap gap-2 mb-3">
                {(c.assetName || []).map((a, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-2 bg-gray-100 px-2 py-1 rounded"
                  >
                    {a}
                    <button
                      onClick={() => onRemoveAsset(c._id, a)}
                      className="text-red-600 hover:underline"
                      title="Remove"
                    >
                      ✕
                    </button>
                  </span>
                ))}
              </div>

              <div className="flex gap-2">
                <input
                  className="border rounded px-2 py-1"
                  placeholder="Add asset"
                  value={addAsset[c._id] || ""}
                  onChange={(e) =>
                    setAddAsset((p) => ({ ...p, [c._id]: e.target.value }))
                  }
                />
                <button
                  onClick={() => onAddAsset(c._id)}
                  className="bg-[#2B245C] text-white px-3 py-1 rounded"
                >
                  Add
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
