"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import {
  getUtilitiesSummary,
  createVulnerability,
  deleteVulnerability,
} from "@/utils/utilitiesApi";

export default function Vulnerabilities() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [q, setQ] = useState("");
  const [newName, setNewName] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editingName, setEditingName] = useState("");

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await getUtilitiesSummary();
      setItems(res?.data?.vulnerabilityData || []);
    } catch (e) {
      toast.error(
        e?.response?.data?.message || "Failed to load vulnerabilities"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    return s ? items.filter((i) => i.name?.toLowerCase().includes(s)) : items;
  }, [items, q]);

  const addItem = async (e) => {
    e.preventDefault();
    if (!newName.trim()) return;
    try {
      await createVulnerability(newName.trim());
      toast.success("Vulnerability added");
      setNewName("");
      fetchData();
    } catch (e) {
      toast.error(e?.response?.data?.message || "Add failed");
    }
  };

  // No direct rename endpoint; do create(new) -> delete(old)
  const startEdit = (it) => {
    setEditingId(it._id);
    setEditingName(it.name);
  };
  const cancelEdit = () => {
    setEditingId(null);
    setEditingName("");
  };
  const saveEdit = async (it) => {
    const next = editingName.trim();
    if (!next || next === it.name) return cancelEdit();
    try {
      await createVulnerability(next); // create replacement
      await deleteVulnerability(it._id); // remove old
      toast.success("Vulnerability renamed");
      cancelEdit();
      fetchData();
    } catch (e) {
      toast.error(e?.response?.data?.message || "Rename failed");
    }
  };

  const removeItem = async (id) => {
    if (!confirm("Delete this vulnerability?")) return;
    try {
      await deleteVulnerability(id);
      toast.success("Deleted");
      setItems((prev) => prev.filter((x) => x._id !== id));
    } catch (e) {
      toast.error(e?.response?.data?.message || "Delete failed");
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold">Vulnerabilities List</h3>
        <form onSubmit={addItem} className="flex gap-2">
          <input
            className="border rounded px-3 py-2"
            placeholder="Add vulnerability"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
          />
          <button className="bg-[#2B245C] text-white px-4 py-2 rounded">
            Add
          </button>
        </form>
      </div>

      <input
        className="w-full border rounded px-3 py-2 mb-3"
        placeholder="Search Vulnerabilities"
        value={q}
        onChange={(e) => setQ(e.target.value)}
      />

      <div className="border rounded overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-[#221b52] text-white">
            <tr>
              <th className="text-left px-4 py-2 w-24">Sr No.</th>
              <th className="text-left px-4 py-2">Name</th>
              <th className="text-right px-4 py-2 w-48">Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td className="px-4 py-3" colSpan={3}>
                  Loading...
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td className="px-4 py-6 text-center" colSpan={3}>
                  Vulnerability List is Empty
                </td>
              </tr>
            ) : (
              filtered.map((it, idx) => (
                <tr key={it._id} className="border-t">
                  <td className="px-4 py-2">{idx + 1}</td>
                  <td className="px-4 py-2">
                    {editingId === it._id ? (
                      <input
                        className="border rounded px-2 py-1 w-full"
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                      />
                    ) : (
                      it.name
                    )}
                  </td>
                  <td className="px-4 py-2 text-right">
                    {editingId === it._id ? (
                      <div className="flex gap-2 justify-end">
                        <button
                          type="button"
                          onClick={() => saveEdit(it)}
                          className="px-3 py-1 bg-green-600 text-white rounded"
                        >
                          Save
                        </button>
                        <button
                          type="button"
                          onClick={cancelEdit}
                          className="px-3 py-1 bg-gray-300 rounded"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <div className="flex gap-2 justify-end">
                        <button
                          type="button"
                          onClick={() => startEdit(it)}
                          className="px-3 py-1 bg-blue-600 text-white rounded"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => removeItem(it._id)}
                          className="px-3 py-1 bg-red-600 text-white rounded"
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
