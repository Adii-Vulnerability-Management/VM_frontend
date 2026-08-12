// src/components/dataflow/SelectFlowFilters.js
import React from "react";

export default function SelectFlowFilters({
  methodCSV, setMethodCSV,
  crossBorder, setCrossBorder,
}) {
  return (
    <>
      <div>
        <label className="block text-sm font-medium">Flow Methods (CSV)</label>
        <input
          className="border rounded p-2 w-48"
          placeholder="api,sftp"
          value={methodCSV}
          onChange={(e)=>setMethodCSV(e.target.value)}
        />
      </div>
      <div>
        <label className="block text-sm font-medium">Cross-Border</label>
        <select className="border rounded p-2 w-32" value={crossBorder} onChange={e=>setCrossBorder(e.target.value)}>
          <option value="">(any)</option>
          <option value="true">true</option>
          <option value="false">false</option>
        </select>
      </div>
    </>
  );
}
