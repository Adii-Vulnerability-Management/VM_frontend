// src/components/ScalableFormBuilder/FieldInput.jsx
import React from "react";

export default function FieldInput({ field: f, value, onChange }) {
  const common = {
    name: f.name,
    required: f.required,
    className: "mt-2 w-full border rounded px-3 py-2",
    placeholder: f.placeholder || "",
  };

  switch (f.type) {
    case "text":
      return (
        <input
          type="text"
          {...common}
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value)}
        />
      );
    case "textarea":
      return (
        <textarea
          {...common}
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value)}
        />
      );
    case "number":
      return (
        <input
          type="number"
          {...common}
          value={value ?? ""}
          onChange={(e) => {
            const v = e.target.value;
            onChange(v === "" ? "" : Number(v));
          }}
        />
      );
    case "currency":
      return (
        <input
          type="number"
          step="0.01"
          {...common}
          value={value ?? ""}
          onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
        />
      );
    case "date":
    case "time":
    case "datetime-local":
    case "email":
    case "url":
    case "tel":
    case "color":
      return (
        <input
          type={f.type}
          {...common}
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value)}
        />
      );
    case "range":
      return (
        <input
          type="range"
          min="0"
          max="100"
          {...common}
          value={value ?? 0}
          onChange={(e) => onChange(e.target.value)}
        />
      );
    case "file":
      return (
        <input
          type="file"
          {...common}
          onChange={(e) => onChange(e.target.files)}
        />
      );
    case "select": {
      const opts =
        Array.isArray(f.options) && typeof f.options[0] === "string"
          ? f.options.map((v) => ({ label: v, value: v }))
          : f.options;
      return (
        <select
          {...common}
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value)}
          disabled={!opts}
        >
          <option value="">{f.placeholder || `Select ${f.label}`}</option>
          {opts?.map(({ label, value }) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      );
    }
    case "multiselect":
      return (
        <select
          {...common}
          multiple
          value={value || []}
          onChange={(e) => {
            const selected = Array.from(
              e.target.selectedOptions,
              (o) => o.value
            );
            onChange(selected);
          }}
        >
          {f.options?.map((o) => (
            <option key={o.value ?? o} value={o.value ?? o}>
              {o.label ?? o}
            </option>
          ))}
        </select>
      );
    case "checkbox":
      return (
        <input
          type="checkbox"
          checked={!!value}
          onChange={(e) => onChange(e.target.checked)}
        />
      );
    case "radio":
      return f.options?.map((o) => (
        <label key={o.value ?? o} className="inline-flex items-center mr-4">
          <input
            type="radio"
            name={f.name}
            value={o.value ?? o}
            checked={value === (o.value ?? o)}
            onChange={() => onChange(o.value ?? o)}
          />
          <span className="ml-1">{o.label ?? o}</span>
        </label>
      ));
    case "calculated":
      return (
        <input
          type="text"
          name={f.name}
          readOnly
          value={value ?? ""}
          className="mt-2 w-full border rounded px-3 py-2 bg-gray-100"
        />
      );
    default:
      return (
        <input
          type="text"
          {...common}
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value)}
        />
      );
  }
}
