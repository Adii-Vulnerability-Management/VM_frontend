// src/components/ResponseTableByMeta.js
import React, { useEffect, useState, useMemo } from "react";
import CustomAxios from "@/globalcomponents/CustomAxios";
import { baseurl, initURL } from "../../../../BaseUrl";

export default function ResponseTableByMeta() {
  const modules = ["Risk Management", "Operations"];
  const subModulesByModule = {
    "Risk Management": ["Cybersecurity"],
    Operations: ["Finding Management"],
  };

  const [module, setModule] = useState("");
  const [subModule, setSubModule] = useState("");
  const [version, setVersion] = useState("");
  const [responses, setResponses] = useState([]);
  const [error, setError] = useState(null);

  const fetchResponses = () => {
    setError(null);
    CustomAxios.get(
      `${baseurl}/${initURL}/form-responses?module=${encodeURIComponent(
        module
      )}&subModule=${encodeURIComponent(subModule)}${
        version ? `&version=${encodeURIComponent(version)}` : ""
      }`
    )
      .then(({ data }) => {
        const list = Array.isArray(data) ? data : [data];
        setResponses(list);
      })
      .catch((err) => {
        setError(err.response?.data?.message || err.message);
        setResponses([]);
      });
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this response?")) return;
    try {
      await CustomAxios.delete(`${baseurl}/${initURL}/form-responses/${id}`);
      setResponses((rs) => rs.filter((r) => r._id !== id));
    } catch (err) {
      alert("Failed to delete: " + (err.message || ""));
    }
  };

  const handleEdit = async (resp) => {
    const raw = prompt(
      "Edit the JSON for values:",
      JSON.stringify(resp.values, null, 2)
    );
    if (!raw) return;
    try {
      const newValues = JSON.parse(raw);
      await CustomAxios.put(
        `${baseurl}/${initURL}/form-responses/${resp._id}`,
        { values: newValues }
      );
      setResponses((rs) =>
        rs.map((r) => (r._id === resp._id ? { ...r, values: newValues } : r))
      );
    } catch (err) {
      alert("Failed to save edits: " + (err.message || ""));
    }
  };

  const valueKeys = useMemo(() => {
    const setK = new Set();
    responses.forEach((r) =>
      Object.keys(r.values || {}).forEach((k) => setK.add(k))
    );
    return Array.from(setK);
  }, [responses]);

  return (
    <>
      {/* Top bar */}
      <div className="bg-[#F2F1FB] p-4 flex justify-between items-center shadow-sm">
        <h1 className="text-xl font-semibold text-[#2B245C]">Form Responses</h1>
      </div>

      {/* Main content area */}
      <div className="bg-[#F4F4F9] p-4 space-y-4 min-h-screen">
        {/* Filters */}
        <div className="flex flex-wrap gap-2">
          <select
            value={module}
            onChange={(e) => setModule(e.target.value)}
            className="border border-gray-300 rounded px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-[#2B245C]"
          >
            <option value="">— Module —</option>
            {modules.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>

          <select
            value={subModule}
            onChange={(e) => setSubModule(e.target.value)}
            disabled={!module}
            className="border border-gray-300 rounded px-3 py-2 bg-white disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-[#2B245C]"
          >
            <option value="">— Sub-Module —</option>
            {subModulesByModule[module]?.map((sm) => (
              <option key={sm} value={sm}>
                {sm}
              </option>
            ))}
          </select>

          <input
            type="text"
            placeholder="Version (optional)"
            value={version}
            onChange={(e) => setVersion(e.target.value)}
            className="border border-gray-300 rounded px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-[#2B245C]"
          />

          <button
            onClick={fetchResponses}
            disabled={!module || !subModule}
            className="px-4 py-2 bg-[#050038] hover:bg-[#2B245C] text-white rounded disabled:opacity-50 transition"
          >
            Fetch
          </button>
        </div>

        {/* Error */}
        {error && <div className="text-red-500">Error: {error}</div>}

        {/* Table */}
        {responses.length > 0 && (
          <div className="overflow-auto bg-white shadow rounded-lg">
            <table className="min-w-full table-auto border-collapse">
              <thead className="bg-[#2B245C] text-white">
                <tr>
                  <th className="px-3 py-2 text-left text-sm font-medium">
                    ID
                  </th>
                  <th className="px-3 py-2 text-left text-sm font-medium">
                    Version
                  </th>
                  {valueKeys.map((k) => (
                    <th
                      key={k}
                      className="px-3 py-2 text-left text-sm font-medium"
                    >
                      {k.charAt(0).toUpperCase() + k.slice(1)}{" "}
                      {/* Capitalizing first letter */}
                    </th>
                  ))}

                  <th className="px-3 py-2 text-left text-sm font-medium">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {responses.map((r, idx) => (
                  <tr
                    key={r._id}
                    className={idx % 2 === 0 ? "bg-[#F2F1FB]" : "bg-[#F4F4F9]"}
                  >
                    <td className="px-3 py-2 text-sm text-[#050038]">
                      {r._id}
                    </td>
                    <td className="px-3 py-2 text-sm text-[#050038]">
                      {r.version}
                    </td>
                    {valueKeys.map((k) => (
                      <td
                        key={k}
                        className="px-3 py-2 text-sm text-[#050038] whitespace-pre-wrap"
                      >
                        {String(r.values[k] ?? "")}
                      </td>
                    ))}
                    <td className="px-3 py-2 space-x-1">
                      <button
                        onClick={() => handleEdit(r)}
                        className="px-2 py-1 bg-[#050038] hover:bg-[#2B245C] text-white rounded text-xs transition"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(r._id)}
                        className="px-2 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-xs transition"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
