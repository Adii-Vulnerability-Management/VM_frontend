// src/components/DynamicForm.js
import React, { useState } from "react";
import AssetBasedSimplified from "@/metadata/RiskManagement/Cybersecurity/AssetBasedSimplified.json";

export default function DynamicForm({ metadata = AssetBasedSimplified, onSave, onClose }) {
  // — clone metadata so we can bump version without mutating import
  const [config, setConfig] = useState(() => ({ ...metadata }));
  const [values, setValues] = useState({});

  // — tabs
  const [activeTab, setActiveTab] = useState(config.steps[0]?.tab || "");
  const tabs = Array.from(new Set(config.steps.map((s) => s.tab)));

  // — change + recalc all calculated fields
  const handleChange = (name, raw) => {
    setValues((prev) => {
      const updated = { ...prev, [name]: raw };

      // recompute every calculated
      config.steps.forEach((step) =>
        step.fields
          .filter((f) => f.type === "calculated")
          .forEach((f) => {
            try {
              const args = f.dependsOn.map((k) => parseFloat(updated[k] || 0));
              const fn = new Function(...f.dependsOn, `return ${f.formula}`);
              updated[f.name] = fn(...args);
            } catch {
              updated[f.name] = "";
            }
          })
      );

      return updated;
    });
  };

  // — save
  const handleSave = () => {
    const payload = { savedValues: values };
    console.log(JSON.stringify(payload, null, 2));
    if (onSave) onSave(payload);
    if (onClose) onClose();
  };
  const handleSaveAndContinue = () => {
      const payload = { savedValues: values };
      if (onSave) onSave(payload);
      // advance tab
      if (currentIndex < tabs.length - 1) {
        setActiveTab(tabs[currentIndex + 1]);
      }
    };
  // find index of the active tab
  const currentIndex = tabs.indexOf(activeTab);

  // move to previous tab (if any)
  const goToPrevious = () => {
    if (currentIndex > 0) {
      setActiveTab(tabs[currentIndex - 1]);
    }
  };

  // move to next tab (if any)
  const goToNext = () => {
    if (currentIndex < tabs.length - 1) {
      setActiveTab(tabs[currentIndex + 1]);
    }
  };

  return (
    <div className="min-h-screen bg-[#F2F1FB]">
      {/* top bar */}
      <div className="bg-[#2B245C] text-white p-4 flex justify-between items-center">
        <div className="font-medium">
          {config.module} &gt; {config.subModule} &gt; {config.menu} (v
          {config.version})
        </div>
      </div>

      {/* below top bar */}
      <div className="bg-[#F4F4F9]">
        {/* tabs */}
        <div className="flex space-x-4 border-b p-2 bg-[#050038]">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-t-lg ${
                activeTab === tab
                  ? "bg-[#F2F1FB] text-[#050038]"
                  : "text-white hover:text-gray-200"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* form */}
        <div className="p-6 space-y-8 bg-[#F2F1FB]">
          {config.steps
            .filter((step) => step.tab === activeTab)
            .map((step) => (
              <section key={step.id} className="bg-white p-6 rounded shadow">
                <h2 className="text-xl font-semibold mb-4">{step.heading}</h2>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {step.fields
                    .filter((f) => f.visible)
                    .map((f) => {
                      const val = values[f.name] ?? "";
                      const common = {
                        id: f.name,
                        name: f.name,
                        required: f.required,
                        className: "w-full border rounded px-3 py-2",
                        placeholder: f.placeholder || "",
                        disabled: !f.enabled,
                      };

                      switch (f.type) {
                        case "text":
                        case "email":
                        case "url":
                        case "tel":
                        case "color":
                          return (
                            <div key={f.id}>
                              <label htmlFor={f.name} className="block mb-1">
                                {f.label}
                              </label>
                              <input
                                type={f.type}
                                {...common}
                                value={val}
                                onChange={(e) =>
                                  handleChange(f.name, e.target.value)
                                }
                              />
                            </div>
                          );
                        case "textarea":
                          return (
                            <div key={f.id}>
                              <label htmlFor={f.name} className="block mb-1">
                                {f.label}
                              </label>
                              <textarea
                                {...common}
                                rows={3}
                                value={val}
                                onChange={(e) =>
                                  handleChange(f.name, e.target.value)
                                }
                              />
                            </div>
                          );
                        case "number":
                        case "currency":
                          return (
                            <div key={f.id}>
                              <label htmlFor={f.name} className="block mb-1">
                                {f.label}
                              </label>
                              <input
                                type="number"
                                step={f.type === "currency" ? "0.01" : "1"}
                                {...common}
                                value={val}
                                onChange={(e) =>
                                  handleChange(
                                    f.name,
                                    e.target.value === ""
                                      ? ""
                                      : Number(e.target.value)
                                  )
                                }
                              />
                            </div>
                          );
                        case "date":
                        case "time":
                        case "datetime-local":
                          return (
                            <div key={f.id}>
                              <label htmlFor={f.name} className="block mb-1">
                                {f.label}
                              </label>
                              <input
                                type={f.type}
                                {...common}
                                value={val}
                                onChange={(e) =>
                                  handleChange(f.name, e.target.value)
                                }
                              />
                            </div>
                          );
                        case "range":
                          return (
                            <div key={f.id}>
                              <label htmlFor={f.name} className="block mb-1">
                                {f.label}
                              </label>
                              <input
                                type="range"
                                min="0"
                                max="100"
                                {...common}
                                value={val}
                                onChange={(e) =>
                                  handleChange(f.name, e.target.value)
                                }
                              />
                            </div>
                          );
                        case "file":
                          return (
                            <div key={f.id}>
                              <label htmlFor={f.name} className="block mb-1">
                                {f.label}
                              </label>
                              <input
                                type="file"
                                {...common}
                                onChange={(e) =>
                                  handleChange(f.name, e.target.files[0])
                                }
                              />
                            </div>
                          );
                        case "select":
                          return (
                            <div key={f.id}>
                              <label htmlFor={f.name} className="block mb-1">
                                {f.label}
                              </label>
                              <select
                                {...common}
                                value={val}
                                onChange={(e) =>
                                  handleChange(f.name, e.target.value)
                                }
                                className="mt-2 w-full border rounded px-3 py-2"
                              >
                                <option value="">
                                  {f.placeholder || `Select ${f.label}`}
                                </option>
                                {(Array.isArray(f.options)
                                  ? f.options
                                  : []
                                ).map((o) => (
                                  <option key={o} value={o}>
                                    {o}
                                  </option>
                                ))}
                              </select>
                            </div>
                          );
                        case "multiselect":
                          return (
                            <div key={f.id}>
                              <label className="block mb-1">{f.label}</label>
                              <select
                                {...common}
                                multiple
                                value={val}
                                onChange={(e) =>
                                  handleChange(
                                    f.name,
                                    Array.from(
                                      e.target.selectedOptions,
                                      (o) => o.value
                                    )
                                  )
                                }
                              >
                                {(Array.isArray(f.options)
                                  ? f.options
                                  : []
                                ).map((o) => (
                                  <option key={o} value={o}>
                                    {o}
                                  </option>
                                ))}
                              </select>
                            </div>
                          );
                        case "checkbox":
                          return (
                            <div key={f.id} className="flex items-center">
                              <input
                                type="checkbox"
                                checked={!!val}
                                onChange={(e) =>
                                  handleChange(f.name, e.target.checked)
                                }
                                className="mr-2"
                              />
                              <label>{f.label}</label>
                            </div>
                          );
                        case "radio":
                          return (
                            <div key={f.id}>
                              <p className="mb-1">{f.label}</p>
                              {(Array.isArray(f.options) ? f.options : []).map(
                                (o) => (
                                  <label
                                    key={o}
                                    className="inline-flex items-center mr-4"
                                  >
                                    <input
                                      type="radio"
                                      name={f.name}
                                      value={o}
                                      checked={values[f.name] === o}
                                      onChange={() => handleChange(f.name, o)}
                                      className="mr-1"
                                    />
                                    {o}
                                  </label>
                                )
                              )}
                            </div>
                          );
                        case "calculated":
                          return (
                            <div key={f.id}>
                              <label htmlFor={f.name} className="block mb-1">
                                {f.label}
                              </label>
                              <input
                                type="text"
                                {...common}
                                value={val}
                                readOnly
                                className="bg-gray-100"
                              />
                            </div>
                          );
                        default:
                          return null;
                      }
                    })}
                </div>
              </section>
            ))}

          <div className="flex justify-between items-center mt-8">
            {/* Prev */}
            <button
              onClick={() =>
                currentIndex > 0 && setActiveTab(tabs[currentIndex - 1])
              }
              disabled={currentIndex === 0}
              className={`px-4 py-2 rounded ${
                currentIndex === 0
                  ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                  : "bg-[#2B245C] hover:bg-[#050038] text-white"
              }`}
            >
              ← Previous
            </button>

            {/* Save & Continue or Finish */}
            {currentIndex === tabs.length - 1 ? (
              <button
                onClick={handleSave}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded"
              >
                Create Assessment
              </button>
            ) : (
              <button
                onClick={handleSaveAndContinue}
                className="bg-[#2B245C] hover:bg-[#050038] text-white px-6 py-2 rounded"
              >
                Save & Continue
              </button>
            )}

            {/* Next */}
            <button
              onClick={() =>
                currentIndex < tabs.length - 1 &&
                setActiveTab(tabs[currentIndex + 1])
              }
              disabled={currentIndex === tabs.length - 1}
              className={`px-4 py-2 rounded ${
                currentIndex === tabs.length - 1
                  ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                  : "bg-[#2B245C] hover:bg-[#050038] text-white"
              }`}
            >
              Next →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
