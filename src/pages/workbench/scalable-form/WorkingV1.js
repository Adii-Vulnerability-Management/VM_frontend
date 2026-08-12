// src/components/ScalableFormBuilder.js
import React, { useState, useEffect } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { ClientDashboardMenu } from "@/routes/DashboardRoutes";
import AssetBasedSimplified from "@/metadata/RiskManagement/Cybersecurity/AssetBasedSimplified.json";
import { Controlled as CodeMirror } from "react-codemirror2";  
import "codemirror/lib/codemirror.css";      // ✨ install `codemirror`
export default function ScalableFormBuilder() {
  // --- state setup ---
  const [config, setConfig] = useState(AssetBasedSimplified);
  const { module, subModule, menu, version, steps: sections } = config;
  const [searchTerm, setSearchTerm] = useState("");

  const [selectedModule, setSelectedModule] = useState(module);
  const [selectedSubModule, setSelectedSubModule] = useState(subModule);
  const [selectedMenu, setSelectedMenu] = useState(menu);
  const [values, setValues] = useState({});

  const [activeTab, setActiveTab] = useState(sections[0].tab);
  const [newSectionTitle, setNewSectionTitle] = useState("");
  const [isFieldModalOpen, setFieldModalOpen] = useState(false);
  const [editingField, setEditingField] = useState(null);
  const [fieldModalData, setFieldModalData] = useState({
    sectionId: sections[0].id,
    id: null,
    label: "",
    name: "",
    type: "text",
    placeholder: "",
    required: false,
    options: [],
  });

  // keep modal’s sectionId in sync
  useEffect(() => {
    setFieldModalData((fd) => ({
      ...fd,
      sectionId: sections.find((s) => s.tab === activeTab)?.id,
    }));
  }, [activeTab, sections]);

  // collect all the field-names that feed into your formulas:
  const calculatedFields = config.steps
    .flatMap((s) => s.fields)
    .filter((f) => f.type === "calculated");

  // build a flat list of all the dependsOn keys
  const allDeps = Array.from(
    new Set(calculatedFields.flatMap((f) => f.dependsOn))
  );

  // now only rerun when one of those underlying values changes, or if you re-load the metadata
  useEffect(() => {
    const updates = {};

    calculatedFields.forEach((f) => {
      try {
        const args = f.dependsOn.map((k) => parseFloat(values[k] || 0));
        const fn = new Function(...f.dependsOn, `return ${f.formula}`);
        updates[f.name] = fn(...args);
      } catch {
        updates[f.name] = NaN;
      }
    });

    // batch them all at once:
    setValues((v) => ({ ...v, ...updates }));
    // 🔑 tick only when one of the deps *or* your metadata changes:
  }, [...allDeps.map((dep) => values[dep] || 0), config.steps]);

  // update module/subModule/menu in config
  useEffect(() => {
    setConfig((c) => ({
      ...c,
      module: selectedModule,
      subModule: selectedSubModule,
      menu: selectedMenu,
    }));
  }, [selectedModule, selectedSubModule, selectedMenu]);

  // inside component
  // a simple safe‐getter for dot-paths
  function get(obj, path, defaultValue = undefined) {
    return path
      .split(".")
      .reduce(
        (acc, key) =>
          acc && typeof acc === "object" && key in acc
            ? acc[key]
            : defaultValue,
        obj
      );
  }

  useEffect(function loadAllOptions() {
    const clone = {
      ...config,
      steps: config.steps.map((s) => ({ ...s, fields: [...s.fields] })),
    };

    async function loadOptions() {
      for (const sec of clone.steps) {
        for (const f of sec.fields) {
          const src = f.optionsSource;
          if (!src) continue;

          try {
            const resp = await fetch(src.url);
            const json = await resp.json();

            // grab your array from whatever path the metadata said
            const items = Array.isArray(get(json, src.path, []))
              ? get(json, src.path)
              : [];

            // map into options[label,value]
            f.options = items.map((item) => ({
              label: src.labelKey ? item[src.labelKey] : String(item),
              value: src.valueKey ? item[src.valueKey] : String(item),
            }));
            // if you had static f.options as strings, normalize here:
            if (Array.isArray(f.options) && typeof f.options[0] === "string") {
              f.options = f.options.map((v) => ({ label: v, value: v }));
            }
          } catch (err) {
            console.error(`Failed to load options for ${f.name}:`, err);
            f.options = [];
          }
        }
      }
      setConfig(clone);
    }

    loadOptions();
  }, []);

  // helpers for dropdowns
  const allModules = ClientDashboardMenu.map((m) => m.name);
  const subModulesFor = (name) => {
    const m = ClientDashboardMenu.find((m) => m.name === name);
    return m?.children?.map((c) => c.name) || [];
  };
  const menusFor = (modName, subName) => {
    const m = ClientDashboardMenu.find((m) => m.name === modName);
    const sm = m?.children?.find((c) => c.name === subName);
    return sm?.children?.map((c) => c.name) || [];
  };

  // drag & drop fields
  const onDragEnd = ({ source, destination }) => {
    if (!destination) return;
    const { droppableId: srcId, index: srcIdx } = source;
    const { droppableId: destId, index: destIdx } = destination;
    if (srcId === destId && srcIdx === destIdx) return;

    setConfig((c) => {
      const newSteps = c.steps.map((s) => ({ ...s, fields: [...s.fields] }));
      const srcSec = newSteps.find((s) => s.id === srcId);
      const destSec = newSteps.find((s) => s.id === destId);
      const [moved] = srcSec.fields.splice(srcIdx, 1);
      destSec.fields.splice(destIdx, 0, moved);
      return { ...c, steps: newSteps };
    });
  };

  // add a new empty section
  const handleAddSection = () => {
    const title = newSectionTitle.trim();
    if (!title) return;
    const id = `${title.toLowerCase().replace(/\s+/g, "_")}_${Date.now()}`;
    const newSection = {
      id,
      tab: activeTab,
      heading: title,
      subheading: title,
      description: "",
      fields: [],
    };
    setConfig((c) => ({ ...c, steps: [...c.steps, newSection] }));
    setNewSectionTitle("");
  };

  // open & close the field modal
  const openFieldModal = (secId, field = null) => {
    if (field) {
      setEditingField({ secId, field });
      setFieldModalData({ ...field, sectionId: secId });
    } else {
      setEditingField(null);
      setFieldModalData({
        sectionId: secId,
        id: null,
        label: "",
        name: "",
        type: "text",
        placeholder: "",
        required: false,
        options: [],
        dependsOn: [],
        operator: "+",
        formula: "",
      });
    }
    setFieldModalOpen(true);
  };
  const closeFieldModal = () => setFieldModalOpen(false);

  // save (add or edit) a field
  const handleSaveField = () => {
    // ensure the user has given us a name & label
    if (!fieldModalData.name.trim() || !fieldModalData.label.trim()) return;

    setConfig((c) => ({
      ...c,
      steps: c.steps.map((sec) => {
        if (sec.id !== fieldModalData.sectionId) return sec;

        const updatedFields = editingField
          ? sec.fields.map((f) =>
              f.id === fieldModalData.id
                ? { ...fieldModalData } // spread _everything_ including dependsOn & formula
                : f
            )
          : [
              ...sec.fields,
              { ...fieldModalData, id: Date.now() }, // again, spread everything
            ];

        return { ...sec, fields: updatedFields };
      }),
    }));

    closeFieldModal();
  };

  // delete a field
  const handleDeleteField = (secId, fieldId) => {
    setConfig((c) => ({
      ...c,
      steps: c.steps.map((sec) =>
        sec.id === secId
          ? { ...sec, fields: sec.fields.filter((f) => f.id !== fieldId) }
          : sec
      ),
    }));
  };

  // save metadata and bump version
  const saveMetadata = () => {
    console.log("Saving metadata:", JSON.stringify(config, null, 2));
    // TODO: POST config to your API...
    setConfig((c) => ({
      ...c,
      version: (parseFloat(c.version) + 0.1).toFixed(1),
    }));
  };

  // allMatrices stub for matrixType rendering
  const allMatrices = [{ name: "Default 3×3" }];

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="p-6 space-y-6 bg-gray-50">
        {/* Breadcrumb */}
        <div className="text-sm text-gray-600">
          {module} &gt; {subModule} &gt; {menu} (v{version})
        </div>

        {/* module / subModule / menu dropdowns */}
        <div className="flex items-center space-x-4 mb-4">
          <select
            value={selectedModule}
            onChange={(e) => {
              setSelectedModule(e.target.value);
              const subs = subModulesFor(e.target.value);
              setSelectedSubModule(subs[0] || "");
              setSelectedMenu("");
            }}
            className="p-2 border rounded"
          >
            {allModules.map((mod) => (
              <option key={mod} value={mod}>
                {mod}
              </option>
            ))}
          </select>
          <select
            value={selectedSubModule}
            onChange={(e) => {
              setSelectedSubModule(e.target.value);
              setSelectedMenu("");
            }}
            className="p-2 border rounded"
          >
            {subModulesFor(selectedModule).map((sub) => (
              <option key={sub} value={sub}>
                {sub}
              </option>
            ))}
          </select>
          <select
            value={selectedMenu}
            onChange={(e) => setSelectedMenu(e.target.value)}
            className="p-2 border rounded"
          >
            <option value="">— choose menu —</option>
            {menusFor(selectedModule, selectedSubModule).map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
          <span className="ml-auto text-sm text-gray-500">v{version}</span>
        </div>

        {/* Tabs */}
        <div className="flex space-x-4 border-b bg-white p-2">
          {Array.from(new Set(sections.map((s) => s.tab))).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-t-lg ${
                activeTab === tab
                  ? "bg-white border-t border-l border-r"
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Header Controls */}
        <div className="flex justify-between items-center bg-white p-4 rounded-lg shadow">
          <div className="flex space-x-2">
            <input
              type="text"
              placeholder="New Section"
              value={newSectionTitle}
              onChange={(e) => setNewSectionTitle(e.target.value)}
              className="border rounded px-3 py-2 w-64"
            />
            <button
              onClick={handleAddSection}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              Add Section
            </button>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() =>
                openFieldModal(sections.find((s) => s.tab === activeTab).id)
              }
              className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
            >
              Add Field
            </button>
            <button
              onClick={saveMetadata}
              className="px-4 py-2 bg-[#2B245C] text-white rounded hover:bg-[#050038]"
            >
              Save Metadata
            </button>
          </div>
        </div>

        {/* Sections & Fields */}
        {sections
          .filter((s) => s.tab === activeTab)
          .map((sec) => (
            <Droppable droppableId={sec.id} key={sec.id}>
              {(provided) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className="bg-white p-6 rounded-b-lg shadow space-y-4"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h2 className="text-2xl font-semibold">{sec.heading}</h2>
                      <p className="text-sm text-gray-500">{sec.description}</p>
                    </div>
                    <button
                      onClick={() => openFieldModal(sec.id)}
                      className="text-indigo-600"
                    >
                      + Field
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {sec.fields.map((f, idx) => (
                      <Draggable
                        key={f.id}
                        draggableId={String(f.id)}
                        index={idx}
                      >
                        {(prov, snap) => (
                          <div
                            ref={prov.innerRef}
                            {...prov.draggableProps}
                            {...prov.dragHandleProps}
                            className={`p-4 border rounded hover:shadow-lg transition ${
                              snap.isDragging ? "bg-blue-50 shadow-xl" : ""
                            }`}
                          >
                            {/* Field header */}
                            <div className="flex justify-between mb-2">
                              <span className="font-medium text-gray-800">
                                {f.label}
                                {f.required && "*"}
                              </span>
                              <div className="space-x-2 text-sm">
                                <button
                                  onClick={() => openFieldModal(sec.id, f)}
                                  className="text-blue-500 hover:underline"
                                >
                                  Edit
                                </button>
                                <button
                                  onClick={() =>
                                    handleDeleteField(sec.id, f.id)
                                  }
                                  className="text-red-500 hover:underline"
                                >
                                  Delete
                                </button>
                              </div>
                            </div>

                            {/* Field input switch */}
                            {(() => {
                              const common = {
                                name: f.name,
                                required: f.required,
                                className:
                                  "mt-2 w-full border rounded px-3 py-2",
                                placeholder: f.placeholder || "",
                              };
                              switch (f.type) {
                                case "text":
                                  return (
                                    <input
                                      type="text"
                                      {...common}
                                      value={values[f.name] ?? ""}
                                      onChange={(e) =>
                                        setValues((vs) => ({
                                          ...vs,
                                          [f.name]: e.target.value,
                                        }))
                                      }
                                    />
                                  );
                                case "textarea":
                                  return <textarea {...common} />;
                                case "number":
                                  return (
                                    <input
                                      type="number"
                                      {...common}
                                      value={values[f.name] ?? ""}
                                      onChange={(e) =>
                                        setValues((vs) => ({
                                          ...vs,
                                          [f.name]:
                                            e.target.value === ""
                                              ? ""
                                              : Number(e.target.value),
                                        }))
                                      }
                                    />
                                  );

                                case "currency":
                                  return (
                                    <input
                                      type="number"
                                      step="0.01"
                                      {...common}
                                    />
                                  );
                                case "date":
                                  return <input type="date" {...common} />;
                                case "time":
                                  return <input type="time" {...common} />;
                                case "datetime-local":
                                  return (
                                    <input type="datetime-local" {...common} />
                                  );
                                case "email":
                                  return <input type="email" {...common} />;
                                case "url":
                                  return <input type="url" {...common} />;
                                case "tel":
                                  return <input type="tel" {...common} />;
                                case "color":
                                  return <input type="color" {...common} />;
                                case "range":
                                  return (
                                    <input
                                      type="range"
                                      min="0"
                                      max="100"
                                      {...common}
                                    />
                                  );
                                case "file":
                                  return <input type="file" {...common} />;
                                case "select": {
                                  // ensure options are objects:
                                  const opts =
                                    Array.isArray(f.options) &&
                                    typeof f.options[0] === "string"
                                      ? f.options.map((v) => ({
                                          label: v,
                                          value: v,
                                        }))
                                      : f.options;

                                  return (
                                    <select
                                      name={f.name}
                                      value={values[f.name] ?? ""}
                                      onChange={(e) =>
                                        setValues((vs) => ({
                                          ...vs,
                                          [f.name]: e.target.value,
                                        }))
                                      }
                                      className="mt-2 w-full border rounded px-3 py-2"
                                      disabled={!opts}
                                    >
                                      <option value="">
                                        {f.placeholder || `Select ${f.label}`}
                                      </option>
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
                                    <select {...common} multiple>
                                      {f.options?.map((o) => (
                                        <option key={o} value={o}>
                                          {o}
                                        </option>
                                      ))}
                                    </select>
                                  );
                                case "checkbox":
                                  return (
                                    <input
                                      type="checkbox"
                                      checked={!!f.value}
                                      onChange={() => {}}
                                    />
                                  );
                                case "radio":
                                  return f.options?.map((o) => (
                                    <label
                                      key={o}
                                      className="inline-flex items-center mr-4"
                                    >
                                      <input
                                        type="radio"
                                        name={f.name}
                                        value={o}
                                        checked={f.value === o}
                                        onChange={() => {}}
                                      />
                                      <span className="ml-1">{o}</span>
                                    </label>
                                  ));
                                case "matrixType":
                                  return (
                                    <div className="space-y-2">
                                      <label className="block text-sm">
                                        Select Matrix:
                                      </label>
                                      <select {...common}>
                                        <option value="">— select —</option>
                                        {allMatrices.map((m) => (
                                          <option key={m.name} value={m.name}>
                                            {m.name}
                                          </option>
                                        ))}
                                      </select>
                                      {/* You can render calculated cell here */}
                                    </div>
                                  );
                                case "calculated":
                                  return (
                                    <input
                                      type="text"
                                      name={f.name}
                                      readOnly
                                      value={values[f.name] ?? ""}
                                      className="mt-2 w-full border rounded px-3 py-2 bg-gray-100"
                                    />
                                  );
                                case "text":
                                  return (
                                    <input
                                      type="text"
                                      {...common}
                                      value={values[f.name] ?? ""}
                                      onChange={(e) =>
                                        setValues((vs) => ({
                                          ...vs,
                                          [f.name]: e.target.value,
                                        }))
                                      }
                                    />
                                  );

                                default:
                                  return <input type="text" {...common} />;
                              }
                            })()}
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                </div>
              )}
            </Droppable>
          ))}

        {/* Field Modal */}
        {isFieldModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-2xl w-full max-w-md shadow-2xl">
              <h3 className="text-2xl font-semibold mb-4 border-b pb-2">
                {editingField ? "Edit Field" : "New Field"}
              </h3>
              <div className="space-y-4">
                {/* Section selector */}
                <label className="block text-sm font-medium text-gray-700">
                  Section
                  <select
                    value={fieldModalData.sectionId}
                    onChange={(e) =>
                      setFieldModalData({
                        ...fieldModalData,
                        sectionId: e.target.value,
                      })
                    }
                    className="mt-1 block w-full border rounded-lg px-3 py-2"
                  >
                    {sections.map((sec) => (
                      <option key={sec.id} value={sec.id}>
                        {sec.heading}
                      </option>
                    ))}
                  </select>
                </label>

                {/* Label */}
                <label className="block text-sm font-medium text-gray-700">
                  Label
                  <input
                    type="text"
                    value={fieldModalData.label}
                    onChange={(e) =>
                      setFieldModalData({
                        ...fieldModalData,
                        label: e.target.value,
                      })
                    }
                    className="mt-1 block w-full border rounded-lg px-3 py-2"
                  />
                </label>

                {/* Name */}
                <label className="block text-sm font-medium text-gray-700">
                  Name
                  <input
                    type="text"
                    value={fieldModalData.name}
                    onChange={(e) =>
                      setFieldModalData({
                        ...fieldModalData,
                        name: e.target.value,
                      })
                    }
                    className="mt-1 block w-full border rounded-lg px-3 py-2"
                  />
                </label>

                {/* Placeholder */}
                <label className="block text-sm font-medium text-gray-700">
                  Placeholder
                  <input
                    type="text"
                    value={fieldModalData.placeholder}
                    onChange={(e) =>
                      setFieldModalData({
                        ...fieldModalData,
                        placeholder: e.target.value,
                      })
                    }
                    className="mt-1 block w-full border rounded-lg px-3 py-2"
                  />
                </label>

                {/* Required */}
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={fieldModalData.required}
                    onChange={(e) =>
                      setFieldModalData({
                        ...fieldModalData,
                        required: e.target.checked,
                      })
                    }
                    className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
                  />
                  <label className="text-sm font-medium text-gray-700">
                    Required
                  </label>
                </div>

                {/* Type */}
                <label className="block text-sm font-medium text-gray-700">
                  Type
                  <select
                    value={fieldModalData.type}
                    onChange={(e) =>
                      setFieldModalData({
                        ...fieldModalData,
                        type: e.target.value,
                      })
                    }
                    className="mt-1 block w-full border rounded-lg px-3 py-2"
                  >
                    {[
                      "text",
                      "textarea",
                      "number",
                      "currency",
                      "date",
                      "time",
                      "datetime-local",
                      "email",
                      "url",
                      "tel",
                      "color",
                      "range",
                      "file",
                      "select",
                      "multiselect",
                      "checkbox",
                      "radio",
                      "matrixType",
                      "calculated",
                    ].map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </label>
                {/* only when editing/adding a calculated field */}
                {fieldModalData.type === "calculated" && (
                  <>
                    <label className="block mb-1 text-sm font-medium text-gray-700">
                      Search fields
                    </label>
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Type to filter…"
                      className="mb-2 w-full border rounded px-2 py-1"
                    />
                    {/* 1) Depends On as a checkbox list */}
                    <label className="block mb-2 text-sm font-medium text-gray-700">
                      Depends On
                    </label>
                    <div className="grid grid-cols-1 gap-2 max-h-20 overflow-auto border rounded p-2">
                      {sections
                        .flatMap((s) => s.fields)
                        .filter((f) => f.type !== "calculated")
                        .filter((f) => {
                          const q = searchTerm.toLowerCase();
                          return (
                            f.label.toLowerCase().includes(q) ||
                            f.name.toLowerCase().includes(q)
                          );
                        })
                        .map((fld) => {
                          const isChecked = fieldModalData.dependsOn?.includes(
                            fld.name
                          );
                          return (
                            <label
                              key={fld.name}
                              className="inline-flex items-center"
                            >
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={(e) => {
                                  const checked = e.target.checked;
                                  setFieldModalData((fd) => ({
                                    ...fd,
                                    dependsOn: checked
                                      ? [...fd.dependsOn, fld.name]
                                      : fd.dependsOn.filter(
                                          (n) => n !== fld.name
                                        ),
                                  }));
                                }}
                                className="mr-2"
                              />
                              <span>
                                {fld.label} <code>({fld.name})</code>
                              </span>
                            </label>
                          );
                        })}
                    </div>

                    {/* 2) Formula editor (textarea or CodeMirror) */}
                    <label className="block mt-4 mb-2 text-sm font-medium text-gray-700">
                      Formula
                    </label>
                    <textarea
                      rows={3}
                      className="mt-1 block w-full border rounded px-3 py-2 font-mono"
                      placeholder="e.g. impactValue * likelihoodValue + 2"
                      value={fieldModalData.formula || ""}
                      onChange={(e) =>
                        setFieldModalData((fd) => ({
                          ...fd,
                          formula: e.target.value,
                        }))
                      }
                    />
                  </>
                )}

                {/* Options (for select / multiselect / radio) */}
                {["select", "multiselect", "radio"].includes(
                  fieldModalData.type
                ) && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Options
                    </label>
                    <div className="space-y-2">
                      {fieldModalData.options.map((opt, i) => (
                        <div key={i} className="flex items-center space-x-2">
                          <input
                            type="text"
                            value={opt}
                            onChange={(e) =>
                              setFieldModalData((fd) => {
                                const newOpts = [...fd.options];
                                newOpts[i] = e.target.value;
                                return { ...fd, options: newOpts };
                              })
                            }
                            className="flex-1 border rounded px-2 py-1"
                          />
                          <button
                            type="button"
                            onClick={() =>
                              setFieldModalData((fd) => ({
                                ...fd,
                                options: fd.options.filter(
                                  (_, idx) => idx !== i
                                ),
                              }))
                            }
                            className="text-red-500 text-sm"
                          >
                            Delete
                          </button>
                        </div>
                      ))}

                      <button
                        type="button"
                        onClick={() =>
                          setFieldModalData((fd) => ({
                            ...fd,
                            options: [...(fd.options || []), ""],
                          }))
                        }
                        className="mt-2 text-indigo-600 text-sm"
                      >
                        + Add option
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={closeFieldModal}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveField}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DragDropContext>
  );
}
