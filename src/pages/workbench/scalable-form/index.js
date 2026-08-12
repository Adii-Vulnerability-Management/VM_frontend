// src/components/ScalableFormBuilder.js
import React, { useState, useEffect } from "react";
import { useMemo, useRef } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { ClientDashboardMenu } from "@/routes/DashboardRoutes";
import AssetBasedSimplified from "@/metadata/RiskManagement/Cybersecurity/AssetBasedSimplified.json";
import "codemirror/lib/codemirror.css"; // ✨ install `codemirror`
import CustomAxios from "@/globalcomponents/CustomAxios";
import { baseurl, initURL } from "../../../../BaseUrl";
import FindingManagement from "@/metadata/Operations/FindingManagement.json";
import ModuleSelector from "@/components/ScalableFormBuilder/ModuleSelector";
import SelectionGuard from "@/components/ScalableFormBuilder/SelectionGuard";
import PreviewForm from "@/components/ScalableFormBuilder/PreviewForm";
import API from "@/metadata/Api.json";
import DPIA from "@/metadata/Privacy/DPIA.json";
import AppendixA3 from "@/metadata/Privacy/AppendixA3.json";
import AppendixA2 from "@/metadata/Privacy/AppendixA2.json";
import AppendixA1 from "@/metadata/Privacy/AppendixA1.json";
import { toast } from "react-toastify";

export default function ScalableFormBuilder() {
  // --- state setup ---
  const [config, setConfig] = useState({
    module: "",
    subModule: "",
    menu: "",
    version: "",
    steps: [],
  });
  const { module, subModule, menu, version } = config;
  const [searchTerm, setSearchTerm] = useState("");
  const [isConfigLoading, setIsConfigLoading] = useState(false);
  const BLOCKED_URLS = new Set([
    `${baseurl}/${initURL}/risk-assessment/utility`,
    'https://dev.grc3.io/${initURL}/risk-assessment/utility', // your dev entry in API.json
  ]);

  // --- Tab management ---
  const initialTabs = Array.from(
    new Set(AssetBasedSimplified.steps.map((s) => s.tab)),
  );
  const [tabs, setTabs] = useState(initialTabs);
  const [activeTab, setActiveTab] = useState(initialTabs[0] || "");
  const [newTabName, setNewTabName] = useState("");

  // --- Section management ---
  const [newSectionTitle, setNewSectionTitle] = useState("");
  const [isSectionModalOpen, setSectionModalOpen] = useState(false);
  const [editingSection, setEditingSection] = useState(false);
  const [sectionModalData, setSectionModalData] = useState({
    id: null,
    heading: "",
    description: "",
  });

  const [selectedModule, setSelectedModule] = useState("");
  const [selectedSubModule, setSelectedSubModule] = useState("");
  const [selectedMenu, setSelectedMenu] = useState("");
  const [values, setValues] = useState({});

  const [isFieldModalOpen, setFieldModalOpen] = useState(false);
  const [editingField, setEditingField] = useState(null);
  const [isPreviewModalOpen, setPreviewModalOpen] = useState(false);
  const [isSaveModalOpen, setSaveModalOpen] = useState(false);
  const [comment, setComment] = useState("");
  const [updateType, setUpdateType] = useState("minor"); // 'minor' | 'major'
  const [pathSuggestions, setPathSuggestions] = useState([]);

  const sections = config.steps;
  const [fieldModalData, setFieldModalData] = useState({
    sectionId: sections[0]?.id || "",
    id: null,
    label: "",
    name: "",
    type: "text",
    placeholder: "",
    required: false,
    // for static-select only:
    options: [],
    // choose between your two modes:
    optionsSourceType: "static", // or "dynamic"
    // for dynamic-select:
    optionsSource: {
      url: "",
      path: "",
      labelKey: "",
      valueKey: "",
      selected: [],
    },
    dependsOn: [],
    availableKeys: [], // initialize as an empty array
    enabled: true,
    visible: true,
  });
  const [previewItems, setPreviewItems] = useState([]);

  useEffect(() => {
    console.log("ue1");

    // 1) Don’t run until module + subModule are selected
    if (!selectedModule || !selectedSubModule) {
      setConfig({
        module: "",
        subModule: "",
        menu: "",
        version: "",
        steps: [],
      });
      setTabs([]);
      setActiveTab("");
      return;
    }

    setIsConfigLoading(true);
    const controller = new AbortController();

    const fetchMeta = async () => {
      try {
        // 2) Build the query (always including menu, even if empty)
        const query = new URLSearchParams({
          module: selectedModule,
          subModule: selectedSubModule,
          menu: selectedMenu,
        }).toString();

        const { data } = await CustomAxios.get(
          `${baseurl}/${initURL}/form-metadata?${query}`,
          { signal: controller.signal },
        );

        // determine which local fallback should apply
        const isAppendixA3 =
          selectedModule === "Privacy" &&
          selectedSubModule === "Appendix" &&
          selectedMenu === "AppendixA3";
        const isAppendixA2 =
          selectedModule === "Privacy" &&
          selectedSubModule === "Appendix" &&
          selectedMenu === "AppendixA2";
        const isAppendixA1 =
          selectedModule === "Privacy" &&
          selectedSubModule === "Appendix" &&
          selectedMenu === "AppendixA1";
        const isDpia =
          selectedModule === "Privacy" &&
          selectedSubModule === "DPIA" &&
          (selectedMenu === "DPIAV1" || selectedMenu === "");
        const isFindingManagement =
          selectedModule === "Operations" &&
          selectedSubModule === "Finding Management";
        const isAssetBasedSimplified =
          selectedModule === "Risk Management" &&
          selectedSubModule === "Cybersecurity" &&
          selectedMenu === "Asset Based Simplified";

        let meta;
        if (data && data._id) {
          meta = data;
        } else if (isDpia) {
          meta = DPIA;
        } else if (isFindingManagement) {
          meta = FindingManagement;
        } else if (isAssetBasedSimplified) {
          meta = AssetBasedSimplified;
        } else if (isAppendixA3) {
          meta = AppendixA3;
        } else if (isAppendixA2) {
          meta = AppendixA2;
        } else if (isAppendixA1) {
          meta = AppendixA1;
        } else {
          meta = { steps: [] };
        }

        if (controller.signal.aborted) return;

        setConfig(meta);
        const newTabs = Array.from(new Set(meta.steps.map((s) => s.tab)));
        setTabs(newTabs);
        setActiveTab(newTabs[0] || "");
      } catch (err) {
        if (controller.signal.aborted) return;
        console.error("Failed to load config:", err);

        // fallback selection (same logic)
        const isAppendixA3 =
          selectedModule === "Privacy" &&
          selectedSubModule === "Appendix" &&
          selectedMenu === "AppendixA3";
        const isAppendixA2 =
          selectedModule === "Privacy" &&
          selectedSubModule === "Appendix" &&
          selectedMenu === "AppendixA2";
        const isAppendixA1 =
          selectedModule === "Privacy" &&
          selectedSubModule === "Appendix" &&
          selectedMenu === "AppendixA1";
        const isDpia =
          selectedModule === "Privacy" &&
          selectedSubModule === "DPIA" &&
          (selectedMenu === "DPIAV1" || selectedMenu === "");
        const isFindingManagement =
          selectedModule === "Operations" &&
          selectedSubModule === "Finding Management";
        const isAssetBasedSimplified =
          selectedModule === "Risk Management" &&
          selectedSubModule === "Cybersecurity" &&
          selectedMenu === "Asset Based Simplified";

        let fallback;
        if (isDpia) {
          fallback = DPIA;
        } else if (isFindingManagement) {
          fallback = FindingManagement;
        } else if (isAssetBasedSimplified) {
          fallback = AssetBasedSimplified;
        } else if (isAppendixA3) {
          fallback = AppendixA3;
        } else if (isAppendixA2) {
          fallback = AppendixA2;
        } else if (isAppendixA1) {
          fallback = AppendixA1;
        } else {
          fallback = { steps: [] };
        }

        setConfig(fallback);
        const newTabs = Array.from(new Set(fallback.steps.map((s) => s.tab)));
        setTabs(newTabs);
        setActiveTab(newTabs[0] || "");
      } finally {
        if (!controller.signal.aborted) {
          setIsConfigLoading(false);
        }
      }
    };

    fetchMeta();

    return () => {
      controller.abort();
    };
  }, [selectedModule, selectedSubModule, selectedMenu]);

  // keep modal’s sectionId in sync
  useEffect(() => {
    console.log("ue2");

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
    new Set(calculatedFields.flatMap((f) => f.dependsOn)),
  );
  // now only rerun when one of those underlying values changes, or if you re-load the metadata
  useEffect(() => {
    console.log("ue3");

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
    // setValues((v) => ({ ...v, ...updates }));
    setValues((prev) => {
      let changed = false;
      const next = { ...prev };
      for (const [k, v] of Object.entries(updates)) {
        if (next[k] !== v && !(Number.isNaN(next[k]) && Number.isNaN(v))) {
          next[k] = v;
          changed = true;
        }
      }
      return changed ? next : prev;
    });

    // 🔑 tick only when one of the deps *or* your metadata changes:
  }, [...allDeps.map((dep) => values[dep] || 0), config.steps]);
  useEffect(() => {
    console.log("ue4");

    const fetchData = async () => {
      try {
        const response = await CustomAxios.get(
          fieldModalData.optionsSource.url,
        );
        const data = response.data;

        if (Array.isArray(data) && data.length > 0) {
          // Direct array case (unchanged)
          const keys = Object.keys(data[0]);
          setFieldModalData((fd) => ({
            ...fd,
            availableKeys: keys,
          }));
        } else if (typeof data === "object" && data !== null) {
          // Object with nested arrays
          const arrayPaths = Object.entries(data)
            .filter(([_, val]) => Array.isArray(val))
            .map(([key]) => key); // Suggest these keys

          setPathSuggestions(arrayPaths); // This will populate the path dropdown
          setFieldModalData((fd) => ({
            ...fd,
            availableKeys: [], // Clear keys until a path is selected
          }));
        } else {
          setFieldModalData((fd) => ({
            ...fd,
            availableKeys: [], // Fallback to empty if no data
          }));
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    if (fieldModalData.optionsSource.url) {
      fetchData();
    }
  }, [fieldModalData.optionsSource.url]); // This effect runs when the URL changes
  // update module/subModule/menu in config
  useEffect(() => {
    console.log("ue5");

    setConfig((c) => ({
      ...c,
      module: selectedModule,
      subModule: selectedSubModule,
      menu: selectedMenu,
    }));
  }, [selectedModule, selectedSubModule, selectedMenu]);
  // a simple safe‐getter for dot-paths
  function get(obj, path, defaultValue = undefined) {
    return path
      .split(".")
      .reduce(
        (acc, key) =>
          acc && typeof acc === "object" && key in acc
            ? acc[key]
            : defaultValue,
        obj,
      );
  }
  useEffect(() => {
    console.log("ue6");

    const dynamicFields = config.steps
      .flatMap((s) => s.fields)
      .filter((f) => f.optionsSourceType === "dynamic");

    const needsFetch = dynamicFields.some(
      (f) => !Array.isArray(f.options) || f.options.length === 0,
    );
    if (!needsFetch) return;

    const clone = {
      ...config,
      steps: config.steps.map((s) => ({ ...s, fields: [...s.fields] })),
    };

    (async () => {
      for (const sec of clone.steps) {
        for (const f of sec.fields) {
          const src = f.optionsSource;
          if (!src || f.options?.length) continue;
          // 🚫 hard stop this endpoint
          if (!src.url || BLOCKED_URLS.has(src.url)) continue;
          // Clear previous options to avoid stale data
          f.options = [];

          // Interpolate {field} in URL and path
          let url = src.url;
          let path = src.path || "";
          (f.dependsOn || []).forEach((dep) => {
            const val = encodeURIComponent(values[dep] || "");
            url = url.replace(`{${dep}}`, val);
            path = path.replace(`{${dep}}`, val);
          });

          try {
            let items = [];

            if (url.startsWith("local:")) {
              // Handle local data from config.utilityData
              const key = url.replace("local:", "");
              const localList = config.utilityData?.[key];

              if (Array.isArray(localList)) {
                const depVal = values[f.dependsOn?.[0]];
                const match = localList.find(
                  (item) => item.assetClassName === depVal,
                );
                const localItems = match?.[path] || [];

                items = localItems.map((val) => ({
                  label: val,
                  value: val,
                }));
              }
            } else {
              // Handle remote fetch
              const { data: raw } = await CustomAxios.get(url);
              const extracted = Array.isArray(raw) ? raw : get(raw, path, []);
              items = extracted.map((item) => ({
                label: item[src.labelKey] ?? String(item),
                value: item[src.valueKey] ?? String(item),
              }));

              // Update modal dropdown keys if applicable
              const keys = extracted.length ? Object.keys(extracted[0]) : [];
              if (isFieldModalOpen && editingField?.field?.id === f.id) {
                setFieldModalData((fd) => ({ ...fd, availableKeys: keys }));
              }
            }

            // Apply final options
            f.options = items;
          } catch (err) {
            console.error(`❌ Failed to load options for ${f.name}:`, err);
            f.options = [];
          }
        }
      }

      setConfig(clone); // ✅ Commit updated config
    })();
  }, [config._id, values, isFieldModalOpen, editingField]);

  // --- Handlers: Tab CRUD ---
  const handleAddTab = () => {
    const name = newTabName.trim();
    if (!name || tabs.includes(name)) return;
    setTabs([...tabs, name]);
    setActiveTab(name);
    setNewTabName("");
  };
  const handleRenameTab = (oldName) => {
    const name = prompt(`Rename tab '${oldName}' to:`)?.trim();
    if (!name || tabs.includes(name)) return;
    setTabs(tabs.map((t) => (t === oldName ? name : t)));
    setConfig((c) => ({
      ...c,
      steps: c.steps.map((s) => (s.tab === oldName ? { ...s, tab: name } : s)),
    }));
    if (activeTab === oldName) setActiveTab(name);
  };
  const handleDeleteTab = (name) => {
    if (!confirm(`Delete tab '${name}'? This will remove all its sections.`))
      return;
    const newTabs = tabs.filter((t) => t !== name);
    setTabs(newTabs);
    setConfig((c) => ({
      ...c,
      steps: c.steps.filter((s) => s.tab !== name),
    }));
    if (activeTab === name) setActiveTab(newTabs[0] || "");
  };
  // --- Handlers: Section CRUD ---
  const openSectionModal = (sec) => {
    setEditingSection(true);
    setSectionModalData({
      id: sec.id,
      heading: sec.heading,
      description: sec.description,
    });
    setSectionModalOpen(true);
  };
  const closeSectionModal = () => setSectionModalOpen(false);
  const handleSaveSection = () => {
    const { id, heading, description } = sectionModalData;
    setConfig((c) => ({
      ...c,
      steps: c.steps.map((s) =>
        s.id === id
          ? { ...s, heading: heading.trim(), description: description.trim() }
          : s,
      ),
    }));
    closeSectionModal();
  };
  const handleDeleteSection = (id) => {
    if (!confirm(`Delete this section?`)) return;
    setConfig((c) => ({
      ...c,
      steps: c.steps.filter((s) => s.id !== id),
    }));
  };
  // drag & drop fields
  const onDragEnd = (result) => {
    const { source, destination, type } = result;
    if (!destination) return;

    if (type === "TAB") {
      // grab the moved tab before we mutate
      const movedTab = tabs[source.index];

      // build the new order
      const newTabs = Array.from(tabs);
      newTabs.splice(source.index, 1);
      newTabs.splice(destination.index, 0, movedTab);

      // commit it
      setTabs(newTabs);

      // keep the moved tab active if it was active
      if (activeTab === movedTab) {
        setActiveTab(movedTab);
      }
      return;
    }
    if (type === "SECTION") {
      setConfig((c) => {
        // make a mutable copy
        const allSteps = [...c.steps];

        // 1) isolate the list of sections in the source tab
        const sourceSections = allSteps.filter(
          (s) => s.tab === source.droppableId,
        );

        // 2) pick out the moved section
        const moved = sourceSections[source.index];

        // 3) remove it from the overall list
        const filtered = allSteps.filter((s) => s.id !== moved.id);

        // 4) update its tab to the destination
        moved.tab = destination.droppableId;

        // 5) figure out where in `filtered` to re-insert
        const destSections = filtered.filter(
          (s) => s.tab === destination.droppableId,
        );
        let insertAt;
        if (destination.index >= destSections.length) {
          insertAt = filtered.length;
        } else {
          const before = destSections[destination.index];
          insertAt = filtered.findIndex((s) => s.id === before.id);
        }

        // 6) splice it back in
        filtered.splice(insertAt, 0, moved);

        return { ...c, steps: filtered };
      });
    } else {
      // moving individual fields (UNCHANGED)
      const { droppableId: srcId, index: srcIdx } = source;
      const { droppableId: destId, index: destIdx } = destination;
      setConfig((c) => {
        const steps = c.steps.map((s) => ({ ...s, fields: [...s.fields] }));
        const srcSec = steps.find((s) => s.id === srcId);
        const destSec = steps.find((s) => s.id === destId);
        const [moved] = srcSec.fields.splice(srcIdx, 1);
        destSec.fields.splice(destIdx, 0, moved);
        return { ...c, steps };
      });
    }
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
  // Inside your ScalableFormBuilder component:
  const openFieldModal = (secId, field = null) => {
    if (field) {
      // EDIT existing field: spread its data but ensure optionsSource keys exist
      setEditingField({ secId, field });
      setFieldModalData({
        ...field,
        sectionId: secId,
        optionsSourceType: field.optionsSourceType || "static",
        optionsSource: field.optionsSource || {
          url: "",
          path: "",
          labelKey: "name",
          valueKey: "code",
          selected: [],
        },
        dependsOn: Array.isArray(field.dependsOn) ? field.dependsOn : [],
      });
    } else {
      // NEW field: start from a clean slate, including dynamic‐options defaults
      setEditingField(null);
      setFieldModalData({
        sectionId: secId,
        id: null,
        label: "",
        name: "",
        type: "text",
        placeholder: "",
        required: false,
        // for static selects:
        options: [],
        // toggle between modes:
        optionsSourceType: "static",
        // for dynamic selects:
        optionsSource: {
          url: "",
          path: "",
          labelKey: "name",
          valueKey: "code",
          selected: [],
        },
        enabled: true,
        visible: true,
      });
    }

    // finally, open the modal
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
        const newField = {
          ...fieldModalData,
          // if dynamic, clear out `options`
          options:
            fieldModalData.optionsSourceType === "static"
              ? fieldModalData.options
              : undefined,
        };
        return {
          ...sec,
          fields: editingField
            ? sec.fields.map((f) => (f.id === newField.id ? newField : f))
            : [...sec.fields, { ...newField, id: Date.now() }],
        };
      }),
    }));
    setEditingField(null); // ← reset this too

    closeFieldModal();
  };
  // delete a field
  const handleDeleteField = (secId, fieldId) => {
    setConfig((c) => ({
      ...c,
      steps: c.steps.map((sec) =>
        sec.id === secId
          ? { ...sec, fields: sec.fields.filter((f) => f.id !== fieldId) }
          : sec,
      ),
    }));
  };
  function collectPaths(obj, prefix = "") {
    return Object.entries(obj).flatMap(([key, val]) => {
      const path = prefix ? `${prefix}.${key}` : key;
      // if it's a plain object, recurse
      if (val && typeof val === "object" && !Array.isArray(val)) {
        return [path, ...collectPaths(val, path)];
      }
      return [path];
    });
  }
  useEffect(() => {
    console.log("ue7");

    if (!previewItems.length) return;
    const allPaths = new Set();
    previewItems
      .slice(0, 5)
      .forEach((item) => collectPaths(item).forEach((p) => allPaths.add(p)));
    console.log("🔍 previewItems:", previewItems);
    console.log("💡 pathSuggestions:", Array.from(allPaths));
    setPathSuggestions(Array.from(allPaths));
  }, [previewItems]);
  const saveMetadata = async (updateType = "minor", comment = "") => {
    // 1) bump version
    const bump = updateType === "major" ? 1.0 : 0.1;
    const newVersion = (parseFloat(config.version) + bump).toFixed(1);
    setConfig((c) => ({ ...c, version: newVersion }));

    //const { module, subModule, menu, steps } = config;
    const { module, subModule, menu } = config;
    // 2) deep‐clone & clean out `options` on dynamic fields
    const steps = config.steps.map((sec) => ({
      ...sec,
      fields: sec.fields.map((f) => {
        if (f.optionsSourceType === "dynamic") {
          // remove any static `options` key
          const { options, ...keep } = f;
          return keep;
        }
        return f;
      }),
    }));
    const payload = {
      module,
      subModule,
      menu,
      version: newVersion,
      updateType,
      comment,
      steps,
    };
    // 3) send
    try {
      await CustomAxios.post(`${baseurl}/${initURL}/form-metadata`, payload);
      toast.success("✅ Metadata saved successfully!");
    } catch (err) {
      console.error(err);
      toast.error("❌ Failed to save metadata.");
    }
  };
  // Instead of const guard = <SelectionGuard …/>;
  const guard = SelectionGuard({
    selectedModule,
    selectedSubModule,
    selectedMenu,
    isLoading: isConfigLoading,
    onModuleChange: setSelectedModule,
    onSubModuleChange: setSelectedSubModule,
    onMenuChange: setSelectedMenu,
  });
  const availableKeys = Array.isArray(fieldModalData.availableKeys)
    ? fieldModalData.availableKeys
    : [];
  const forbiddenKeys = [
    "_id",
    "user",
    "__v",
    "createdAt",
    "updatedAt",
    "is_deleted",
  ];
  const filteredKeys = availableKeys.filter((k) => !forbiddenKeys.includes(k));

  if (guard) return guard;
  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="p-6 space-y-6 bg-gray-50">
        {/* Breadcrumb */}
        <div className="text-sm text-gray-600">
          {module} &gt; {subModule} &gt; {menu} (v{version})
        </div>
        <ModuleSelector
          selectedModule={selectedModule}
          selectedSubModule={selectedSubModule}
          selectedMenu={selectedMenu}
          onModuleChange={(mod) => {
            setSelectedModule(mod);
            setSelectedSubModule("");
            setSelectedMenu("");
          }}
          onSubModuleChange={(sub) => {
            setSelectedSubModule(sub);
            setSelectedMenu("");
          }}
          onMenuChange={setSelectedMenu}
        />

        <Droppable droppableId="TAB_ROW" type="TAB" direction="horizontal">
          {(dropProv) => (
            <div
              ref={dropProv.innerRef}
              {...dropProv.droppableProps}
              className="flex items-center space-x-2 border-b bg-white px-4 overflow-x-auto"
            >
              {tabs.map((tab, idx) => (
                <Draggable key={tab} draggableId={tab} index={idx} type="TAB">
                  {(dragProv) => (
                    <div
                      ref={dragProv.innerRef}
                      {...dragProv.draggableProps}
                      {...dragProv.dragHandleProps}
                      className="flex items-center space-x-1"
                    >
                      <button
                        onClick={() => setActiveTab(tab)}
                        className={`px-4 py-2 whitespace-nowrap border-b-2 rounded-t-lg ${
                          activeTab === tab
                            ? "border-indigo-600 text-indigo-600"
                            : "border-transparent text-gray-600 hover:text-gray-800"
                        }`}
                      >
                        {tab}
                      </button>
                      <button
                        onClick={() => handleRenameTab(tab)}
                        className="text-sm"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleDeleteTab(tab)}
                        className="text-sm"
                      >
                        🗑️
                      </button>
                    </div>
                  )}
                </Draggable>
              ))}
              {dropProv.placeholder}
              <input
                type="text"
                placeholder="New Tab"
                value={newTabName}
                onChange={(e) => setNewTabName(e.target.value)}
                className="border rounded px-2 py-1"
              />
              <button
                onClick={handleAddTab}
                className="bg-green-600 text-white px-3 py-1 rounded"
              >
                Add Tab
              </button>
            </div>
          )}
        </Droppable>
        {/* Controls: Add Section & Fields, Save */}
        <div className="flex justify-between items-center bg-white p-4 rounded-lg shadow">
          <div className="flex space-x-2">
            <input
              type="text"
              placeholder={`New Section (${activeTab})`}
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

            {/* ← New Show Preview button */}
            <button
              onClick={() => setPreviewModalOpen(true)}
              className="px-4 py-2 border border-indigo-600 text-indigo-600 rounded hover:bg-indigo-50"
            >
              Show Preview
            </button>

            <button
              onClick={() => setSaveModalOpen(true)}
              className="px-4 py-2 bg-[#2B245C] text-white rounded hover:bg-[#050038]"
            >
              Save Metadata
            </button>
          </div>
        </div>
        {/* Sections & Fields */}
        <div className="flex gap-4 overflow-x-auto pb-4">
          {tabs.map((tabName) => (
            <Droppable key={tabName} droppableId={tabName} type="SECTION">
              {(provided) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className="bg-white p-4 rounded shadow min-h-[200px] flex-shrink-0 w-100"
                >
                  <div className="bg-[#F4F4F9] px-4 py-3 rounded-t-md shadow-sm">
                    <div className="text-2xl font-semibold text-[#2B245C] border-b-2 border-[#D6D3F0] pb-1">
                      {tabName}
                    </div>
                  </div>

                  {config.steps.filter((s) => s.tab === tabName).length ===
                    0 && (
                    <div className="p-8 text-center text-gray-400">
                      Drag sections here
                    </div>
                  )}

                  {config.steps
                    .filter((s) => s.tab === tabName)
                    .map((sec, secIdx) => (
                      <Draggable
                        key={sec.id}
                        draggableId={sec.id}
                        index={secIdx}
                        type="SECTION"
                      >
                        {(prov, snap) => (
                          <div
                            ref={prov.innerRef}
                            {...prov.draggableProps}
                            className={`border rounded mb-4 bg-gray-50 transition ${
                              snap.isDragging ? "shadow-lg" : ""
                            }`}
                          >
                            {/* Section header */}
                            <div
                              {...prov.dragHandleProps}
                              className="bg-gray-100 p-2 cursor-move flex justify-between items-center"
                            >
                              <div>
                                <h4 className="text-lg font-semibold">
                                  {sec.heading}
                                </h4>
                                <p className="text-sm text-gray-500">
                                  {sec.description}
                                </p>
                              </div>
                              <div className="space-x-2">
                                <button
                                  onClick={() => openSectionModal(sec)}
                                  className="text-blue-500 text-sm hover:underline"
                                >
                                  ✏️
                                </button>
                                <button
                                  onClick={() => handleDeleteSection(sec.id)}
                                  className="text-red-500 text-sm hover:underline"
                                >
                                  🗑️
                                </button>
                              </div>
                            </div>

                            {/* + Field button */}
                            <div className="p-4">
                              <button
                                onClick={() => openFieldModal(sec.id)}
                                className="text-indigo-600"
                              >
                                + Field
                              </button>
                            </div>

                            {/* Fields grid */}
                            <Droppable droppableId={sec.id} type="FIELD">
                              {(prov2) => (
                                <div
                                  ref={prov2.innerRef}
                                  {...prov2.droppableProps}
                                  className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-1 gap-4 p-4"
                                >
                                  {sec.fields.map((f, idx) => (
                                    <Draggable
                                      key={f.id}
                                      draggableId={String(f.id)}
                                      index={idx}
                                      type="FIELD"
                                    >
                                      {(prov3, snap3) => (
                                        <div
                                          ref={prov3.innerRef}
                                          {...prov3.draggableProps}
                                          {...prov3.dragHandleProps}
                                          className={`p-4 border rounded transition ${
                                            snap3.isDragging
                                              ? "bg-blue-50 shadow-xl"
                                              : "hover:shadow-lg"
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
                                                onClick={() =>
                                                  openFieldModal(sec.id, f)
                                                }
                                                className="text-blue-500 hover:underline"
                                              >
                                                ✏️
                                              </button>
                                              <button
                                                onClick={() =>
                                                  handleDeleteField(
                                                    sec.id,
                                                    f.id,
                                                  )
                                                }
                                                className="text-red-500 hover:underline"
                                              >
                                                🗑️
                                              </button>
                                            </div>
                                          </div>

                                          {/* Field input */}
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
                                                        [f.name]:
                                                          e.target.value,
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
                                                            : Number(
                                                                e.target.value,
                                                              ),
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
                                                return (
                                                  <input
                                                    type="date"
                                                    {...common}
                                                  />
                                                );
                                              case "time":
                                                return (
                                                  <input
                                                    type="time"
                                                    {...common}
                                                  />
                                                );
                                              case "datetime-local":
                                                return (
                                                  <input
                                                    type="datetime-local"
                                                    {...common}
                                                  />
                                                );
                                              case "email":
                                                return (
                                                  <input
                                                    type="email"
                                                    {...common}
                                                  />
                                                );
                                              case "url":
                                                return (
                                                  <input
                                                    type="url"
                                                    {...common}
                                                  />
                                                );
                                              case "tel":
                                                return (
                                                  <input
                                                    type="tel"
                                                    {...common}
                                                  />
                                                );
                                              case "color":
                                                return (
                                                  <input
                                                    type="color"
                                                    {...common}
                                                  />
                                                );
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
                                                return (
                                                  <input
                                                    type="file"
                                                    {...common}
                                                  />
                                                );
                                              case "select": {
                                                const opts =
                                                  Array.isArray(f.options) &&
                                                  typeof f.options[0] ===
                                                    "string"
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
                                                        [f.name]:
                                                          e.target.value,
                                                      }))
                                                    }
                                                    className="mt-2 w-full border rounded px-3 py-2"
                                                    // disabled={!opts}
                                                  >
                                                    <option value="">
                                                      {f.placeholder ||
                                                        `Select ${f.label}`}
                                                    </option>
                                                    {opts?.map(
                                                      ({ label, value }) => (
                                                        <option
                                                          key={value}
                                                          value={value}
                                                        >
                                                          {label}
                                                        </option>
                                                      ),
                                                    )}
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
                                                    <span className="ml-1">
                                                      {o}
                                                    </span>
                                                  </label>
                                                ));

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
                                              default:
                                                return (
                                                  <input
                                                    type="text"
                                                    {...common}
                                                  />
                                                );
                                            }
                                          })()}
                                        </div>
                                      )}
                                    </Draggable>
                                  ))}
                                  {prov2.placeholder}
                                </div>
                              )}
                            </Droppable>
                          </div>
                        )}
                      </Draggable>
                    ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          ))}
        </div>
        {isSaveModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-2xl w-full max-w-md shadow-2xl">
              <h3 className="text-xl font-semibold mb-4">
                Save Metadata Details
              </h3>

              <label className="block mb-2">
                <span className="font-medium">Comment</span>
                <textarea
                  rows={3}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="mt-1 block w-full border rounded px-3 py-2"
                  placeholder="Enter your comment…"
                />
              </label>

              <div className="mb-4">
                <span className="font-medium">Update Type</span>
                <div className="flex items-center space-x-4 mt-2">
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      name="updateType"
                      value="minor"
                      checked={updateType === "minor"}
                      onChange={(e) => setUpdateType(e.target.value)}
                      className="form-radio"
                    />
                    <span className="ml-2">Minor</span>
                  </label>
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      name="updateType"
                      value="major"
                      checked={updateType === "major"}
                      onChange={(e) => setUpdateType(e.target.value)}
                      className="form-radio"
                    />
                    <span className="ml-2">Major</span>
                  </label>
                </div>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setSaveModalOpen(false)}
                  className="px-4 py-2 bg-gray-100 rounded hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  onClick={async () => {
                    // just hand off to our central logic
                    await saveMetadata(updateType, comment);
                    setSaveModalOpen(false);
                    setComment("");
                    setUpdateType("minor");
                  }}
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                >
                  Confirm & Publish Changes
                </button>
              </div>
            </div>
          </div>
        )}
        {/* Section Edit Modal */}
        {isSectionModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-2xl w-full max-w-md shadow-2xl">
              <h3 className="text-2xl font-semibold mb-4 border-b pb-2">
                Edit Section
              </h3>
              <label className="block text-sm font-medium text-gray-700">
                Heading
                <input
                  type="text"
                  value={sectionModalData.heading}
                  onChange={(e) =>
                    setSectionModalData({
                      ...sectionModalData,
                      heading: e.target.value,
                    })
                  }
                  className="mt-1 block w-full border rounded-lg px-3 py-2"
                />
              </label>
              <label className="block text-sm font-medium text-gray-700 mt-4">
                Description
                <textarea
                  rows={3}
                  value={sectionModalData.description}
                  onChange={(e) =>
                    setSectionModalData({
                      ...sectionModalData,
                      description: e.target.value,
                    })
                  }
                  className="mt-1 block w-full border rounded-lg px-3 py-2"
                />
              </label>
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={closeSectionModal}
                  className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveSection}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        )}
        {/* Field Modal */}
        {isFieldModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center overflow-y-auto p-4 z-50">
            {" "}
            <div className="bg-white p-6 rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl">
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

                <label className="block text-sm font-medium text-gray-700">
                  Name
                  <input
                    type="text"
                    value={fieldModalData.name}
                    onChange={(e) => {
                      // lowercase + strip all spaces
                      const clean = e.target.value
                        .toLowerCase()
                        .replace(/\s+/g, "");
                      setFieldModalData({
                        ...fieldModalData,
                        name: clean,
                      });
                    }}
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
                <div className="flex items-center space-x-4 mt-4">
                  <label className="inline-flex items-center">
                    <input
                      type="checkbox"
                      checked={fieldModalData.enabled}
                      onChange={(e) =>
                        setFieldModalData((fd) => ({
                          ...fd,
                          enabled: e.target.checked,
                        }))
                      }
                      className="form-checkbox"
                    />
                    <span className="ml-2 text-sm">Enabled</span>
                  </label>
                  <label className="inline-flex items-center">
                    <input
                      type="checkbox"
                      checked={fieldModalData.visible}
                      onChange={(e) =>
                        setFieldModalData((fd) => ({
                          ...fd,
                          visible: e.target.checked,
                        }))
                      }
                      className="form-checkbox"
                    />
                    <span className="ml-2 text-sm">Visible</span>
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
                      "calculated",
                    ].map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </label>

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
                            fld.name,
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
                                          (n) => n !== fld.name,
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

                {["select", "multiselect", "radio"].includes(
                  fieldModalData.type,
                ) && (
                  <div>
                    {/* 1) Choose Static vs. Dynamic */}
                    <label className="block text-sm font-medium text-gray-700">
                      Options Source
                      <select
                        value={fieldModalData.optionsSourceType}
                        onChange={(e) =>
                          setFieldModalData((fd) => ({
                            ...fd,
                            optionsSourceType: e.target.value,
                          }))
                        }
                        className="mt-1 block w-full border rounded-lg px-3 py-2"
                      >
                        <option value="static">Static</option>
                        <option value="dynamic">Dynamic (from API)</option>
                      </select>
                    </label>

                    {fieldModalData.optionsSourceType === "static" ? (
                      // ── your existing static-options UI ──
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Options
                        </label>
                        <div className="space-y-2 max-h-48 overflow-y-auto">
                          {(fieldModalData.options || []).map((opt, i) => (
                            <div
                              key={i}
                              className="flex items-center space-x-2"
                            >
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
                                    options: (fd.options || []).filter(
                                      (_, idx) => idx !== i,
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
                    ) : (
                      // ── new dynamic-options UI ──
                      <div className="space-y-3">
                        <label className="block text-sm font-medium text-gray-700">
                          Choose API
                          <select
                            value={fieldModalData.optionsSource.url}
                            onChange={(e) =>
                              setFieldModalData((fd) => ({
                                ...fd,
                                optionsSource: {
                                  ...fd.optionsSource,
                                  url: e.target.value,
                                },
                              }))
                            }
                            className="mt-1 block w-full border rounded px-3 py-2"
                          >
                            <option value="">— Select an endpoint —</option>
                            {API.map(({ label, value }) => (
                              <option key={value} value={value}>
                                {label}
                              </option>
                            ))}
                          </select>
                        </label>

                        <div className="grid grid-cols-2 gap-4">
                          {/* New Dynamic Select Fields: Label Key and Value Key */}
                          {fieldModalData.optionsSourceType === "dynamic" && (
                            <fieldset className="col-span-2 border border-gray-200 rounded-lg bg-gray-50 p-6 space-y-8">
                              <legend className="px-2 text-lg font-semibold text-gray-700">
                                Dynamic Options
                              </legend>
                              {/* ── Depends On ── */}
                              <div className="space-y-1">
                                <label className="block text-sm font-medium text-gray-700">
                                  Depends On
                                </label>
                                <div className="h-32 overflow-auto border border-gray-200 rounded-lg bg-white p-3">
                                  {sections
                                    .flatMap((s) => s.fields)
                                    .filter(
                                      (f) =>
                                        f.name !== fieldModalData.name &&
                                        f.type === "select",
                                    )
                                    .map((f) => (
                                      <label
                                        key={f.name}
                                        className="flex items-center space-x-2 mb-2"
                                      >
                                        <input
                                          type="checkbox"
                                          className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
                                          checked={fieldModalData.dependsOn?.includes(
                                            f.name,
                                          )}
                                          onChange={(e) => {
                                            const checked = e.target.checked;
                                            setFieldModalData((fd) => ({
                                              ...fd,
                                              dependsOn: checked
                                                ? [...fd.dependsOn, f.name]
                                                : fd.dependsOn.filter(
                                                    (n) => n !== f.name,
                                                  ),
                                            }));
                                          }}
                                        />
                                        <span className="text-sm text-gray-800">
                                          {f.label}{" "}
                                          <span className="text-xs text-gray-500">
                                            ({f.name})
                                          </span>
                                        </span>
                                      </label>
                                    ))}
                                  {sections
                                    .flatMap((s) => s.fields)
                                    .filter(
                                      (f) =>
                                        f.type === "select" &&
                                        f.name !== fieldModalData.name,
                                    ).length === 0 && (
                                    <div className="text-sm text-gray-500 italic">
                                      No other select fields to depend on yet.
                                    </div>
                                  )}
                                </div>
                              </div>
                              {/* ── JSON Path + Suggestions ── */}
                              <div className="space-y-1">
                                <label className="block text-sm font-medium text-gray-700">
                                  JSON Path
                                </label>
                                <div className="relative mb-20 overflow-visible">
                                  <input
                                    type="text"
                                    placeholder="e.g. assets.class"
                                    value={fieldModalData.optionsSource.path}
                                    onChange={(e) =>
                                      setFieldModalData((fd) => ({
                                        ...fd,
                                        optionsSource: {
                                          ...fd.optionsSource,
                                          path: e.target.value,
                                        },
                                      }))
                                    }
                                    className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-300"
                                  />
                                  {pathSuggestions.length > 0 && (
                                    <ul className="absolute z-50 w-full mt-1 max-h-40 overflow-auto bg-white border border-gray-300 rounded-lg shadow-lg">
                                      {pathSuggestions.map((p) => (
                                        <li
                                          key={p}
                                          onClick={() => {
                                            // 1) set path, labelKey & valueKey
                                            setFieldModalData((fd) => ({
                                              ...fd,
                                              optionsSource: {
                                                ...fd.optionsSource,
                                                path: p,
                                                labelKey: p,
                                                valueKey: p,
                                              },
                                            }));
                                            // 2) clear suggestions to close the dropdown
                                            setPathSuggestions([]);
                                          }}
                                          className="px-3 py-2 hover:bg-indigo-50 cursor-pointer"
                                        >
                                          {p}
                                        </li>
                                      ))}
                                    </ul>
                                  )}
                                </div>
                              </div>

                              {/* ── Label Key & Value Key ── */}
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div className="space-y-1">
                                  <label className="block text-sm font-medium text-gray-700">
                                    Label Key
                                  </label>
                                  <select
                                    value={
                                      fieldModalData.optionsSource.labelKey
                                    }
                                    onChange={(e) =>
                                      setFieldModalData((fd) => ({
                                        ...fd,
                                        optionsSource: {
                                          ...fd.optionsSource,
                                          labelKey: e.target.value,
                                        },
                                      }))
                                    }
                                    className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-300"
                                  >
                                    {filteredKeys.length > 0 ? (
                                      filteredKeys.map((key) => (
                                        <option key={key} value={key}>
                                          {key}
                                        </option>
                                      ))
                                    ) : (
                                      <option value="">
                                        No keys available
                                      </option>
                                    )}
                                  </select>
                                </div>

                                <div className="space-y-1">
                                  <label className="block text-sm font-medium text-gray-700">
                                    Value Key
                                  </label>
                                  <select
                                    value={
                                      fieldModalData.optionsSource.valueKey
                                    }
                                    onChange={(e) =>
                                      setFieldModalData((fd) => ({
                                        ...fd,
                                        optionsSource: {
                                          ...fd.optionsSource,
                                          valueKey: e.target.value,
                                        },
                                      }))
                                    }
                                    className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-300"
                                  >
                                    {filteredKeys.length > 0 ? (
                                      filteredKeys.map((key) => (
                                        <option key={key} value={key}>
                                          {key}
                                        </option>
                                      ))
                                    ) : (
                                      <option value="">
                                        No keys available
                                      </option>
                                    )}
                                  </select>
                                </div>
                              </div>
                            </fieldset>
                          )}

                          <label className="block text-sm">
                            Label Key
                            <input
                              type="text"
                              value={fieldModalData.optionsSource.labelKey}
                              onChange={(e) =>
                                setFieldModalData((fd) => ({
                                  ...fd,
                                  optionsSource: {
                                    ...fd.optionsSource,
                                    labelKey: e.target.value,
                                  },
                                }))
                              }
                              className="mt-1 block w-full border rounded px-3 py-2"
                            />
                          </label>
                          <label className="block text-sm">
                            Value Key
                            <input
                              type="text"
                              value={fieldModalData.optionsSource.valueKey}
                              onChange={(e) =>
                                setFieldModalData((fd) => ({
                                  ...fd,
                                  optionsSource: {
                                    ...fd.optionsSource,
                                    valueKey: e.target.value,
                                  },
                                }))
                              }
                              className="mt-1 block w-full border rounded px-3 py-2"
                            />
                          </label>
                        </div>

                        <button
                          type="button"
                          onClick={async () => {
                            try {
                              const resp = await CustomAxios.get(
                                fieldModalData.optionsSource.url,
                              );
                              // in your “Fetch Preview” handler
                              const raw = resp.data;
                              const items = fieldModalData.optionsSource.path
                                ? get(
                                    raw,
                                    fieldModalData.optionsSource.path,
                                    [],
                                  )
                                : Array.isArray(raw)
                                  ? raw
                                  : [];
                              setPreviewItems(items);
                            } catch (err) {
                              console.error(err);
                              toast.error(
                                "Failed to load preview: " + err.message,
                              );
                              setPreviewItems([]);
                            }
                          }}
                          className="text-indigo-600 text-sm hover:underline"
                        >
                          Fetch Preview
                        </button>

                        {/* Show checkboxes so user picks which entries to include */}
                        <div className="max-h-40 overflow-y-auto border rounded p-2">
                          {previewItems.map((item, idx) => {
                            const val =
                              item[fieldModalData.optionsSource.valueKey];
                            const lbl =
                              item[fieldModalData.optionsSource.labelKey];
                            const checked =
                              fieldModalData.optionsSource.selected.includes(
                                val,
                              );
                            return (
                              <label key={idx} className="block">
                                <input
                                  type="checkbox"
                                  checked={checked}
                                  onChange={(e) => {
                                    setFieldModalData((fd) => {
                                      const sel = new Set(
                                        fd.optionsSource.selected,
                                      );
                                      e.target.checked
                                        ? sel.add(val)
                                        : sel.delete(val);
                                      return {
                                        ...fd,
                                        optionsSource: {
                                          ...fd.optionsSource,
                                          selected: Array.from(sel),
                                        },
                                      };
                                    });
                                  }}
                                />
                                <span className="ml-2">
                                  {lbl} ({val})
                                </span>
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    )}
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
        {isPreviewModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center overflow-y-auto p-6 z-[100]">
            <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center p-4 border-b">
                <h2 className="text-xl font-bold text-[#2B245C]">
                  Form Preview
                </h2>
                <button
                  onClick={() => setPreviewModalOpen(false)}
                  className="text-gray-600 hover:text-red-600 text-lg"
                >
                  ✖
                </button>
              </div>
              <div className="p-4">
                <PreviewForm metadata={config} />
              </div>

              {/* ← Add this footer */}
              <div className="p-4 border-t flex justify-end">
                <button
                  onClick={() => {
                    // saveMetadata(updateType); // bump version & persist
                    setPreviewModalOpen(false); // close modal
                  }}
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded"
                >
                  Save Final Form
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DragDropContext>
  );
}
