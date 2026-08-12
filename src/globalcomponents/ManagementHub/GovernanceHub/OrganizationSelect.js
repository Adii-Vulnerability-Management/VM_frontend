import React from "react";

const OrganizationSelect = ({
  orgs = [],
  value,
  onChange,
  required = true,
  label = "Organization",
}) => (
  <div className="mb-4">
    <label className="block text-xs font-semibold text-gray-700 mb-2">
      {label}
      {required && <span className="text-red-500">{" "}*</span>}
    </label>
    <select
      value={value || ""}
      onChange={(e) => onChange(e.target.value)}
      className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 focus:border-indigo-500 focus:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-indigo-200 transition-all"
      required={required}
    >
      <option value="" disabled>
        Select {label}
      </option>
      {orgs.map((o) => (
        <option key={o._id} value={o._id}>
          {o.name}
        </option>
      ))}
    </select>
  </div>
);

export default OrganizationSelect;
