"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import {
  getUtilitiesSummary,
  addProcessValue,
  removeProcessValue,
  deleteProcess,
} from "@/utils/utilitiesApi";

export default function Processes() {
  const [list, setList] = useState([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);

  // add inputs per type
  const [addValue, setAddValue] = useState({}); // { [processId+'|context'|'activity'|'subprocess']: value }

  const keyFor = (id, type) => `${id}|${type}`;

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await getUtilitiesSummary();
      setList(res?.data?.utilityData || []);
    } catch (e) {
      toast.error(e?.response?.data?.message || "Failed to load processes");
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
      ? list.filter((p) => p.processName?.toLowerCase().includes(s))
      : list;
  }, [list, q]);

  const onAdd = async (pid, type) => {
    const field = keyFor(pid, type);
    const val = (addValue[field] || "").trim();
    if (!val) return;
    try {
      await addProcessValue(pid, type, val);
      toast.success(`${type} added`);
      setAddValue((prev) => ({ ...prev, [field]: "" }));
      fetchData();
    } catch (e) {
      toast.error(e?.response?.data?.message || "Add failed");
    }
  };

  const onRemove = async (pid, type, value) => {
    if (!confirm(`Remove "${value}" from ${type}?`)) return;
    try {
      await removeProcessValue(pid, type, value);
      toast.success("Removed");
      fetchData();
    } catch (e) {
      toast.error(e?.response?.data?.message || "Remove failed");
    }
  };

  const onDeleteProcess = async (pid) => {
    if (!confirm("Delete this process?")) return;
    try {
      await deleteProcess(pid);
      toast.success("Process deleted");
      setList((prev) => prev.filter((p) => p._id !== pid));
    } catch (e) {
      toast.error(e?.response?.data?.message || "Delete failed");
    }
  };

  const renderChips = (pid, type, arr = []) => (
    <div className="flex flex-wrap gap-2">
      {arr.map((v, i) => (
        <span
          key={i}
          className="inline-flex items-center gap-2 bg-gray-100 px-2 py-1 rounded"
        >
          {v}
          <button
            onClick={() => onRemove(pid, type, v)}
            className="text-red-600 hover:underline"
            title="Remove"
          >
            ✕
          </button>
        </span>
      ))}
      <div className="flex items-center gap-2">
        <input
          className="border rounded px-2 py-1"
          placeholder={`Add ${type}`}
          value={addValue[keyFor(pid, type)] || ""}
          onChange={(e) =>
            setAddValue((prev) => ({
              ...prev,
              [keyFor(pid, type)]: e.target.value,
            }))
          }
        />
        <button
          onClick={() => onAdd(pid, type)}
          className="bg-[#2B245C] text-white px-3 py-1 rounded"
        >
          Add
        </button>
      </div>
    </div>
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold">Processes</h3>
        <input
          className="border rounded px-3 py-2"
          placeholder="Search processes"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </div>

      <div className="space-y-4">
        {loading ? (
          <div>Loading...</div>
        ) : filtered.length === 0 ? (
          <div className="text-gray-600">No processes found</div>
        ) : (
          filtered.map((p) => (
            <div key={p._id} className="border rounded p-4">
              <div className="flex justify-between items-center mb-3">
                <div className="font-semibold">{p.processName}</div>
                <button
                  onClick={() => onDeleteProcess(p._id)}
                  className="bg-red-600 text-white px-3 py-1 rounded"
                >
                  Delete Process
                </button>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <div className="font-medium mb-2">Context</div>
                  {renderChips(p._id, "context", p.context)}
                </div>
                <div>
                  <div className="font-medium mb-2">Activity</div>
                  {renderChips(p._id, "activity", p.activity)}
                </div>
                <div>
                  <div className="font-medium mb-2">Sub-Process</div>
                  {renderChips(p._id, "subProcess", p.subProcess)}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
