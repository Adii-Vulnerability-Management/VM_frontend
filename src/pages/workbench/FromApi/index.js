// src/components/DynamicForm.js
import React, { useEffect, useState } from "react";
import CustomAxios from "@/globalcomponents/CustomAxios";
import { baseurl, initURL } from "../../../../BaseUrl";

export default function DynamicForm({ onSave, onClose }) {
  // — which subModule to load (will return the latest version)
  const targetSubModule = "Cybersecurity";

  // — config & loading state
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dynamicOptions, setDynamicOptions] = useState({});
  // — form values
  const [values, setValues] = useState({});

  // — fetch the latest config for our subModule on mount
  useEffect(() => {
    CustomAxios.get(
      `${baseurl}/${initURL}/form-metadata?subModule=${encodeURIComponent(
        targetSubModule
      )}`
    )
      .then((resp) => {
        setConfig(resp.data);
      })
      .catch((err) => {
        console.error("Failed to load form config:", err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (!config) return;

    const clone = { ...dynamicOptions };

    config.steps.forEach((step) => {
      step.fields
        .filter(
          (f) =>
            f.type === "select" &&
            f.optionsSourceType === "dynamic" &&
            f.optionsSource?.url
        )
        .forEach((f) => {
          const {
            url,
            path = "",
            labelKey,
            valueKey,
            selected = [],
          } = f.optionsSource;

          const depVal = f.dependsOn?.[0] ? values[f.dependsOn[0]] : null;

          // Skip unless: no cache or depVal changed
          if (
            f.dependsOn?.length &&
            (!depVal || (clone[f.name] && clone[f.name].__dep === depVal))
          ) {
            return;
          }

          // Handle local: source (like assetClassData)
          if (url.startsWith("local:")) {
            const key = url.replace("local:", "");
            const localData = config.utilityData?.[key] || [];

            const match = localData.find(
              (item) => item.assetClassName === depVal
            );

            const localList = match?.[path] ?? [];

            clone[f.name] = {
              __dep: depVal,
              data: localList.map((v) => ({ label: v, value: v })),
            };
          } else {
            // Handle remote fetch
            // Handle remote fetch
            CustomAxios.get(url)
              .then(({ data: json }) => {
                // 1) Build an array to work with
                let arr;
                if (Array.isArray(json)) {
                  // API returned an array (your case) → ignore `path`, use the array as-is
                  arr = json;
                } else if (path) {
                  // API returned an object → drill into it via `path`
                  arr = path.split(".").reduce((obj, key) => obj?.[key], json);
                } else {
                  arr = json;
                }

                // Ensure we have an array
                if (!Array.isArray(arr)) arr = [];

                // 2) Optional dependency filter (only relevant if items have assetClassName)
                const depVal = f.dependsOn?.[0] ? values[f.dependsOn[0]] : null;
                if (depVal) {
                  arr = arr.filter((item) => item?.assetClassName === depVal);
                }

                // 3) Optional selection filter
                const hasSelection =
                  Array.isArray(selected) &&
                  selected.some((v) => v && v.trim());
                const list = hasSelection
                  ? arr.filter((item) => selected.includes(item?.[valueKey]))
                  : arr;

                // 4) Normalize into [{label, value}]
                let data;
                if (list.length > 0 && typeof list[0] !== "object") {
                  // primitives (e.g., ["a@x.com", "b@y.com"])
                  data = list.map((v) => ({
                    label: String(v),
                    value: String(v),
                  }));
                } else if (Array.isArray(list[0])) {
                  // array-of-arrays
                  data = list
                    .flat()
                    .map((v) => ({ label: String(v), value: String(v) }));
                } else {
                  // objects (your case)
                  data = list.flatMap((item) => {
                    const rawLabel = item?.[labelKey];
                    const rawValue = item?.[valueKey];

                    if (Array.isArray(rawLabel)) {
                      return rawLabel.map((lbl, i) => ({
                        label: String(lbl ?? ""),
                        value: Array.isArray(rawValue)
                          ? String(rawValue[i] ?? "")
                          : String(lbl ?? ""),
                      }));
                    }

                    return {
                      label: String(rawLabel ?? ""),
                      value: String(rawValue ?? ""),
                    };
                  });
                }

                // 5) Stash it
                clone[f.name] = { __dep: depVal, data };
                setDynamicOptions((prev) => ({ ...prev, ...clone }));
              })
              .catch((err) =>
                console.error(`❌ Failed to load options for ${f.name}`, err)
              );
          }
        });
    });

    setDynamicOptions(clone);
  }, [config, values]);

  // — derive tabs once config is loaded
  const tabs = config
    ? Array.from(new Set(config.steps.map((s) => s.tab)))
    : [];
  const [activeTab, setActiveTab] = useState("");
  useEffect(() => {
    if (config) {
      setActiveTab(config.steps[0]?.tab || "");
    }
  }, [config]);

  // — handle field changes + recalc any calculated fields
  const handleChange = (name, raw) => {
    setValues((prev) => {
      const updated = { ...prev, [name]: raw };
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

  // — save handlers
  const handleSave = () => {
    const payload = {
      formMetadata: config._id,
      module: config.module,
      subModule: config.subModule,
      menu: config.menu,
      version: config.version,
      values,
    };
    CustomAxios.post(`${baseurl}/${initURL}/form-responses`, payload)
      .then(() => {
        console.log("✅ Response saved:", payload);
        onSave?.(payload);
        onClose?.();
      })
      .catch((err) => {
        console.error("❌ Failed to save response:", err);
        alert("Error saving your responses. Please try again.");
      });
  };

  // — navigation helpers
  const currentIndex = tabs.indexOf(activeTab);
  const goToPrevious = () => {
    if (currentIndex > 0) setActiveTab(tabs[currentIndex - 1]);
  };
  const goToNext = () => {
    if (currentIndex < tabs.length - 1) setActiveTab(tabs[currentIndex + 1]);
  };

  // — loading / error guards
  if (loading) return <div>Loading form…</div>;
  if (!config) return <div>Error loading form configuration.</div>;
  return (
    <div className="min-h-screen bg-[#F2F1FB]">
      {/* top bar */}
      <div className="bg-[#2B245C] text-white p-4 flex justify-between items-center">
        <div className="font-medium">
          * {config.module} &gt; {config.subModule} &gt; {config.menu} (v
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
                        case "select": {
                          // decide where to pull our list from
                          // 🙋‍♂️ Here’s the missing const:
                          //  const rawOpts =
                          //    f.optionsSourceType === "dynamic"
                          //      ? dynamicOptions[f.name] || []
                          //      : Array.isArray(f.options)
                          //      ? f.options.map(o =>
                          //          typeof o === "string" ? { label: o, value: o } : o
                          //        )
                          //      : [];
                          const rawOpts =
                            f.optionsSourceType === "dynamic"
                              ? dynamicOptions[f.name]?.data || []
                              : Array.isArray(f.options)
                              ? f.options.map((o) =>
                                  typeof o === "string"
                                    ? { label: o, value: o }
                                    : o
                                )
                              : [];

                          const opts = rawOpts.map((o) =>
                            // if any strings slipped through, normalize
                            typeof o === "string" ? { label: o, value: o } : o
                          );

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
                                {opts.map(({ value, label }) => (
                                  <option key={value} value={value}>
                                    {label}
                                  </option>
                                ))}
                              </select>
                            </div>
                          );
                        }

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

            {currentIndex === tabs.length - 1 && (
              <button
                onClick={handleSave}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded"
              >
                Create Assessment
              </button>
            )}

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
