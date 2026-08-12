// src/components/PreviewForm.js
import React, { useState, useEffect } from "react";

export default function PreviewForm({ metadata }) {
  // derive tabs
  const tabs = Array.from(new Set(metadata.steps.map((s) => s.tab)));
  const [activeTab, setActiveTab] = useState(tabs[0] || "");
  const [values, setValues] = useState({});

  // recompute calculated fields whenever any value changes
  useEffect(() => {
    metadata.steps
      .flatMap((s) => s.fields)
      .filter((f) => f.type === "calculated")
      .forEach((f) => {
        try {
          const args = f.dependsOn.map((k) => parseFloat(values[k] || 0));
          const fn = new Function(...f.dependsOn, `return ${f.formula}`);
          setValues((v) => ({ ...v, [f.name]: fn(...args) }));
        } catch {
          setValues((v) => ({ ...v, [f.name]: "" }));
        }
      });
  }, [values, metadata.steps]);

  const handleChange = (name, v) =>
    setValues((prev) => ({ ...prev, [name]: v }));

  const currentIndex = tabs.indexOf(activeTab);

  return (
    <div className="min-h-screen bg-[#F2F1FB]">
      {/* top bar */}
      <div className="bg-[#2B245C] text-white p-4 flex justify-between items-center">
        <div className="font-medium">
          {metadata.module} &gt; {metadata.subModule} &gt; {metadata.menu} (v
          {metadata.version})
        </div>
      </div>

      {/* tabs */}
      <div className="bg-[#F4F4F9]">
        <div className="flex space-x-4 border-b p-2 bg-[#050038]">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-t-lg font-medium ${
                activeTab === tab
                  ? "bg-[#F2F1FB] text-[#050038]"
                  : "text-white hover:text-gray-200"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* form content */}
        <div className="p-6 space-y-8 bg-[#F2F1FB]">
          {metadata.steps
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
                              <label className="block mb-1">{f.label}</label>
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
                              <label className="block mb-1">{f.label}</label>
                              <textarea
                                rows={3}
                                {...common}
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
                              <label className="block mb-1">{f.label}</label>
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
                              <label className="block mb-1">{f.label}</label>
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
                              <label className="block mb-1">{f.label}</label>
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

                        case "select": {
                          const opts = Array.isArray(f.options)
                            ? f.options.map((o) =>
                                typeof o === "string"
                                  ? { label: o, value: o }
                                  : o
                              )
                            : [];
                          return (
                            <div key={f.id}>
                              <label className="block mb-1">{f.label}</label>
                              <select
                                {...common}
                                value={val}
                                onChange={(e) =>
                                  handleChange(f.name, e.target.value)
                                }
                                className="mt-2 w-full border rounded px-3 py-2"
                              >
                                <option value="">
                                  {`— select ${f.label} —`}
                                </option>
                                {opts.map(({ label, value }) => (
                                  <option key={value} value={value}>
                                    {label}
                                  </option>
                                ))}
                              </select>
                            </div>
                          );
                        }

                        case "calculated":
                          return (
                            <div key={f.id}>
                              <label className="block mb-1">{f.label}</label>
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

          {/* Prev / Next buttons */}
          <div className="flex justify-between mt-6">
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
