// src/components/dataflow/SelectFrameworkSet.js
import React from "react";

const PRESETS = [
  "GDPR+DPDPA+CCPA+PCI_DSS+HIPAA",
  "GDPR+CCPA",
  "PCI_DSS",
  "HIPAA",
  "GDPR+LGPD+PDPA+POPIA",
];

export default function SelectFrameworkSet({ value, onChange, className = "w-[28rem]" }) {
  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      <label className="text-sm font-medium">Framework Set</label>
      <div className="flex gap-2">
        <input
          className="border rounded p-2 flex-1"
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          placeholder="GDPR+DPDPA+CCPA+PCI_DSS+HIPAA"
        />
        <select
          className="border rounded p-2"
          onChange={(e) => onChange?.(e.target.value)}
          value=""
        >
          <option value="" disabled>Presets…</option>
          {PRESETS.map(p => <option key={p} value={p}>{p}</option>)}
        </select>
      </div>
    </div>
  );
}
