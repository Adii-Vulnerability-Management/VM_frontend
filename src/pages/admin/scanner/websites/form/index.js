// components/SelectorForm.js
"use client";
import React, { useState, useEffect, useCallback } from "react";
import CustomAxios from "@/config/CustomAxios";
import { baseurl, initURL } from "@/config/config";
import { toast } from "react-toastify";
import { FaPlus } from "react-icons/fa6";

// ⬇️ Your tour components
import Tour from "@/components/Tour/Tour";
import GuideButton from "@/components/Tour/GuideButton";

const AVAILABLE_TAGS = [
  "",
  "div",
  "span",
  "input",
  "button",
  "select",
  "textarea",
  "a",
  "img",
  "form",
  "label",
  "table",
  "tr",
  "td",
  "ul",
  "li",
  "custom",
  "radio",
  "checkbox",
];
const AVAILABLE_ATTRIBUTES = ["id", "class", "name", "tag", "data"];
const EVENT_TYPES = ["click"];

/* ===================== Helpers ===================== */
const buildFragment = ({ tag, customTag, attribute, value }) => {
  const v = (value || "").trim();
  if (!v) return "";
  let frag = "";
  if (tag === "checkbox") frag = 'input[type="checkbox"]';
  else if (tag === "radio") frag = 'input[type="radio"]';
  else if (tag === "custom") frag = (customTag || "").trim();
  else frag = tag || "";
  switch (attribute) {
    case "id":
      frag += `#${v}`;
      break;
    case "class":
      frag += `.${v.split(" ").join(".")}`;
      break;
    case "name":
      frag += `[name="${v}"]`;
      break;
    case "tag":
      frag = v;
      break;
    case "data":
      frag += `[data-${v}]`;
      break;
    default:
      break;
  }
  return frag;
};

export default function SelectorForm() {
  /* ===================== Remote Lists ===================== */
  const [websites, setWebsites] = useState([]);
  const [loadingWebsites, setLoadingWebsites] = useState(false);

  /* ===================== Context ===================== */
  const [domain, setDomain] = useState("");
  const [route, setRoute] = useState("");
  const [formName, setFormName] = useState("");

  /* ===================== Rule Builder ===================== */
  const [tag, setTag] = useState("");
  const [customTag, setCustomTag] = useState("");
  const [attribute, setAttribute] = useState("id");
  const [value, setValue] = useState("");
  const [ruleDesc, setRuleDesc] = useState("");
  const [fieldName, setFieldName] = useState("");
  const [rules, setRules] = useState([]);

  /* ===================== Trigger Builder ===================== */
  const [triggerEvent, setTriggerEvent] = useState("click");
  const [triggerTag, setTriggerTag] = useState("");
  const [triggerCustomTag, setTriggerCustomTag] = useState("");
  const [triggerAttribute, setTriggerAttribute] = useState("id");
  const [triggerValue, setTriggerValue] = useState("");

  /* ===================== Preview & Configs ===================== */
  const [preview, setPreview] = useState("");
  const [configs, setConfigs] = useState([]);
  const [saving, setSaving] = useState(false);
  const [loadingConfigs, setLoadingConfigs] = useState(false);

  /* ===================== Tour state ===================== */
  const [tourOpen, setTourOpen] = useState(false);

  // Clean, minimal steps. Feel free to tweak titles/placements.
  const tourSteps = [
    {
      target: '[data-tour="domain"]',
      title: "Domain",
      content:
        "Pick the site this configuration applies to. The embed script must match this domain.",
    },
    {
      target: '[data-tour="route"]',
      title: "Route",
      content:
        "Path where the form lives (supports dynamic segments, e.g., /products/:id).",
    },
    {
      target: '[data-tour="formName"]',
      title: "Form Name",
      content: "A friendly name so you recognize this mapping later.",
    },
    {
      target: '[data-tour="rule-builder"]',
      title: "Rule Builder",
      content:
        "Add one rule per field you want to capture. Choose Tag/Attribute/Value and give it a Field Name.",
    },
    {
      target: '[data-tour="trigger-section"]',
      title: "Trigger",
      content:
        "When this event fires on the chosen element, we capture the fields shown above.",
    },
    {
      target: '[data-tour="save-btn"]',
      title: "Save",
      content:
        "Save the configuration. Then copy the script tag from the table below and embed it on your site.",
      placement: "top",
    },
    {
      target: '[data-tour="save-configuration-table"]',
      title: "Saved Configurations",
      content:
        "Copy the script tag and manage (load/delete) previously saved mappings.",
      placement: "top",
    },
  ];

  /* ===================== Fetchers ===================== */
  useEffect(() => {
    async function fetchWebsites() {
      setLoadingWebsites(true);
      try {
        const res = await CustomAxios.get(`${baseurl}/${initURL}/cmp/websites`);
        setWebsites(res.data || []);
      } catch (err) {
        console.error("Failed to load websites:", err);
        toast.warn("Failed to fetch websites.");
      } finally {
        setLoadingWebsites(false);
      }
    }
    fetchWebsites();
  }, []);

  const fetchConfigsFromServer = useCallback(async () => {
    setLoadingConfigs(true);
    try {
      const res = await CustomAxios.get(
        `${baseurl}/${initURL}/cmp/selector-configs`,
      );
      const serverConfigs = res.data?.data || [];
      setConfigs(serverConfigs);
    } catch (err) {
      console.error("Failed to fetch selector configs:", err);
      toast.error("Failed to load existing configurations.");
    } finally {
      setLoadingConfigs(false);
    }
  }, []);

  useEffect(() => {
    fetchConfigsFromServer();
  }, [fetchConfigsFromServer]);

  useEffect(() => {
    if (domain && route && configs.length) {
      const existing = configs.find(
        (c) => c.domain === domain.trim() && c.route === route.trim(),
      );
      if (existing) loadConfigIntoForm(existing);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [domain, route, configs]);

  useEffect(() => {
    setPreview(rules.map(buildFragment).filter(Boolean).join(", "));
  }, [rules]);

  /* ===================== UI Helpers ===================== */
  const getPlaceholder = (attr) => {
    switch (attr) {
      case "id":
        return "e.g. mainForm";
      case "class":
        return "e.g. form-group";
      case "name":
        return "e.g. email";
      case "tag":
        return "e.g. input";
      case "data":
        return "e.g. user-id";
      default:
        return "";
    }
  };

  /* ===================== Rule Actions ===================== */
  const handleAddRule = () => {
    if (!value.trim()) return toast.warn("Rule value required.");
    if (!ruleDesc.trim()) return toast.warn("Description required.");
    if (!fieldName.trim()) return toast.warn("Field name required.");

    const newRule = {
      id: Date.now().toString(),
      tag,
      customTag,
      attribute,
      value: value.trim(),
      description: ruleDesc.trim(),
      fieldName: fieldName.trim(),
    };
    const frag = buildFragment(newRule);
    if (!frag) return toast.warn("Invalid rule.");

    setRules((r) => [...r, newRule]);

    setValue("");
    setRuleDesc("");
    setCustomTag("");
    setFieldName("");
  };

  const handleRemoveRule = (id) => {
    setRules((r) => r.filter((x) => x.id !== id));
  };

  /* ===================== Load/Delete/Reset ===================== */
  const loadConfigIntoForm = (cfg) => {
    setDomain(cfg.domain || "");
    setRoute(cfg.route || "");
    setFormName(cfg.formName || cfg.form?.name || "");
    setRules(cfg.rules || []);

    setTriggerEvent(cfg.trigger?.event || "click");
    const tr = cfg.trigger?.rule || {};
    setTriggerTag(tr.tag || "");
    setTriggerCustomTag(tr.customTag || "");
    setTriggerAttribute(tr.attribute || "id");
    setTriggerValue(tr.value || "");

    toast.success("Configuration loaded.");
  };

  const handleLoadConfig = (cfg) => loadConfigIntoForm(cfg);
  const handleCopyConfig = (cfg) => {
    if (!cfg) return;

    setDomain(cfg.domain || "");

    // Keep route blank so copied config does not overwrite same route.
    setRoute("");

    setFormName(`${cfg.formName || cfg.form?.name || "Configuration"} Copy`);

    setRules(
      Array.isArray(cfg.rules)
        ? cfg.rules.map((rule, index) => ({
            ...rule,
            id: `${Date.now()}-${index}`,
          }))
        : [],
    );

    setTriggerEvent(cfg.trigger?.event || "click");

    const tr = cfg.trigger?.rule || {};
    setTriggerTag(tr.tag || "");
    setTriggerCustomTag(tr.customTag || "");
    setTriggerAttribute(tr.attribute || "id");
    setTriggerValue(tr.value || "");

    setTag("");
    setCustomTag("");
    setAttribute("id");
    setValue("");
    setRuleDesc("");
    setFieldName("");

    toast.info(
      "Configuration copied. Enter a new route if needed, then click Save Configuration.",
    );

    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };
  const resetForm = () => {
    setDomain("");
    setRoute("");
    setFormName("");
    setRules([]);
    setTriggerEvent("click");
    setTriggerTag("");
    setTriggerCustomTag("");
    setTriggerAttribute("id");
    setTriggerValue("");
    setPreview("");
    setTag("");
    setCustomTag("");
    setAttribute("id");
    setValue("");
    setRuleDesc("");
    setFieldName("");
  };

  const handleDeleteConfig = async (cfg) => {
    if (!cfg?.domain) return;
    try {
      await CustomAxios.delete(`${baseurl}/${initURL}/cmp/selector-configs`, {
        params: { domain: cfg.domain, route: cfg.route },
      });
      await fetchConfigsFromServer();
      toast.success("Configuration deleted.");
      if (domain === cfg.domain && route === cfg.route) resetForm();
    } catch (err) {
      console.error("Failed to delete config:", err);
      toast.error("Delete failed.");
    }
  };

  /* ===================== Save (Upsert) ===================== */
  const handleSave = async (e) => {
    e.preventDefault();

    if (!domain) return toast.warn("Please select a domain.");
    if (!route.trim()) return toast.warn("Please enter a route.");
    if (!formName.trim()) return toast.warn("Please enter a form name.");
    if (!rules.length) return toast.warn("Add at least one rule.");
    if (!triggerValue.trim()) return toast.warn("Trigger value required.");

    const triggerRule = {
      id: Date.now().toString(),
      tag: triggerTag,
      customTag: triggerCustomTag,
      attribute: triggerAttribute,
      value: triggerValue.trim(),
      description: "",
    };
    const triggerSelector = buildFragment(triggerRule);
    if (!triggerSelector) return toast.warn("Invalid trigger selector.");

    const payload = {
      domain: domain.trim(),
      route: route.trim(),
      formName: formName.trim(),
      rules: rules.map((r) => ({
        id: String(r.id),
        tag: r.tag,
        customTag: r.customTag || "",
        attribute: r.attribute,
        value: r.value,
        description: r.description || "",
        fieldName: r.fieldName || "",
      })),
      selector: preview,
      trigger: {
        event: triggerEvent,
        rule: {
          id: String(triggerRule.id),
          tag: triggerRule.tag,
          customTag: triggerRule.customTag || "",
          attribute: triggerRule.attribute,
          value: triggerRule.value,
          description: triggerRule.description || "",
        },
        selector: triggerSelector,
      },
      savedAt: new Date().toISOString(),
    };

    setSaving(true);
    try {
      await CustomAxios.post(
        `${baseurl}/${initURL}/cmp/selector-configs`,
        payload,
      );
      await fetchConfigsFromServer();
      toast.success("Configuration saved and synced to server.");
      resetForm();
    } catch (err) {
      console.error("Sync to backend failed:", err);
      const msg =
        err?.response?.data?.message || err.message || "Unknown error";
      toast.error(`Save failed: ${msg}`);
    } finally {
      setSaving(false);
    }
  };

  async function copyToClipboard(text) {
    if (typeof window === "undefined") return false;
    try {
      if (navigator?.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
        return true;
      }
    } catch (_e) {}
    try {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.setAttribute("readonly", "");
      ta.style.position = "fixed";
      ta.style.left = "-9999px";
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand("copy");
      document.body.removeChild(ta);
      return ok;
    } catch {
      return false;
    }
  }

  /* ===================== Render ===================== */
  return (
    <div className="bg-gray-50 rounded-2xl p-6">
      <div className="flex items-start justify-between">
        <div className="flex items-center justify-between gap-4">
          <div data-tour="heading">
            <h2 className="text-2xl text-[#2B245C] font-bold leading-tight">
              Existing Web Form Configurations
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Configure and map your <strong>existing</strong> web forms
              directly on your site.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <GuideButton
            onClick={() => setTourOpen(true)}
            variant="primary"
            size="md"
            className="!from-blue-500 !to-blue-600 hover:!from-blue-400 hover:!to-blue-500 !text-white !border-blue-400/70 !shadow-blue-600/30"
            title="Start user guide"
          >
            Guide
          </GuideButton>
          {loadingConfigs && (
            <span className="inline-flex items-center gap-2 text-sm text-gray-500">
              <span className="h-1.5 w-1.5 rounded-full bg-gray-300 animate-pulse" />
              Syncing…
            </span>
          )}
        </div>
      </div>

      <div className="py-5 space-y-7">
        {/* === FORM CARD === */}
        <section className="rounded-2xl border border-[#2B245C] bg-white p-6 shadow-lg hover:shadow-2xl transition-shadow duration-300">
          <form onSubmit={handleSave} className="space-y-6">
            {/* Domain & Route */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div data-tour="domain">
                <label
                  htmlFor="domain"
                  className="block text-xs font-semibold text-gray-700 mb-2"
                >
                  Domain
                </label>
                <select
                  id="domain"
                  value={domain}
                  onChange={(e) => setDomain(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 focus:border-indigo-500 focus:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-indigo-200 transition-all"
                >
                  <option value="">
                    {loadingWebsites ? "Loading…" : "Select a website…"}
                  </option>
                  {websites.map((w) => (
                    <option key={w.id || w.domain} value={w.domain}>
                      {w.domain}
                    </option>
                  ))}
                </select>
                <p className="mt-1.5 text-xs text-gray-500">
                  Choose the site this configuration applies to.
                </p>
              </div>

              <div data-tour="route">
                <label
                  htmlFor="route"
                  className="block text-xs font-semibold text-gray-700 mb-2"
                >
                  Route
                </label>
                <input
                  id="route"
                  value={route}
                  onChange={(e) => setRoute(e.target.value)}
                  placeholder="e.g. /checkout or /products/:id"
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-indigo-200 transition-all"
                />
                <p className="mt-1.5 text-xs text-gray-500">
                  Supports dynamic segments.
                </p>
              </div>
            </div>

            {/* Form Name */}
            <div data-tour="formName">
              <label
                htmlFor="formName"
                className="block text-xs font-semibold text-gray-700 mb-2"
              >
                Form Name
              </label>
              <input
                id="formName"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="e.g. checkoutForm"
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-indigo-200 transition-all"
              />
              <p className="mt-1.5 text-xs text-gray-500">
                Used as an identifier for this form.
              </p>
            </div>

            {/* Rule Builder */}
            <div data-tour="rule-builder">
              <h3 className="text-sm font-bold text-[#2B245C] mb-4 uppercase tracking-wide">
                Rule Builder
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                {/* Tag */}
                <div data-tour="rule-tag">
                  <label className="block text-xs font-semibold text-gray-700 mb-2">
                    Tag
                  </label>
                  <select
                    value={tag}
                    onChange={(e) => setTag(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 focus:border-indigo-500 focus:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-indigo-200 transition-all"
                  >
                    {AVAILABLE_TAGS.map((t) => (
                      <option key={t} value={t}>
                        {!t ? "Any" : t === "custom" ? "Custom" : t}
                      </option>
                    ))}
                  </select>
                  {tag === "custom" && (
                    <input
                      value={customTag}
                      onChange={(e) => setCustomTag(e.target.value)}
                      placeholder="Custom tag, e.g. my-element"
                      className="mt-2 w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-indigo-200 transition-all"
                    />
                  )}
                </div>

                {/* Attribute */}
                <div data-tour="rule-attribute">
                  <label className="block text-xs font-semibold text-gray-700 mb-2">
                    Attribute
                  </label>
                  <select
                    value={attribute}
                    onChange={(e) => setAttribute(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 focus:border-indigo-500 focus:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-indigo-200 transition-all"
                  >
                    {AVAILABLE_ATTRIBUTES.map((a) => (
                      <option key={a} value={a}>
                        {a.toUpperCase()}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Value */}
                <div data-tour="rule-value">
                  <label className="block text-xs font-semibold text-gray-700 mb-2">
                    Value
                  </label>
                  <input
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    placeholder={getPlaceholder(attribute)}
                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-indigo-200 transition-all"
                  />
                </div>

                {/* Description */}
                <div data-tour="rule-desc">
                  <label className="block text-xs font-semibold text-gray-700 mb-2">
                    Description
                  </label>
                  <input
                    value={ruleDesc}
                    onChange={(e) => setRuleDesc(e.target.value)}
                    placeholder="Description"
                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-indigo-200 transition-all"
                  />
                </div>

                {/* Field Name */}
                <div data-tour="rule-fieldname">
                  <label className="block text-xs font-semibold text-gray-700 mb-2">
                    Field Name
                  </label>
                  <input
                    value={fieldName}
                    onChange={(e) => setFieldName(e.target.value)}
                    placeholder="e.g. email"
                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-indigo-200 transition-all"
                  />
                </div>
              </div>

              {/* Add Rule */}
              <div className="flex justify-end mt-4">
                <button
                  type="button"
                  onClick={handleAddRule}
                  className="inline-flex items-center gap-1 rounded-lg border border-[#2B245C] bg-blue-50 px-4 py-2.5 text-sm font-medium text-[#2B245C] hover:bg-indigo-50 transition-all"
                  data-tour="add-rule"
                >
                  <FaPlus />
                  Add Rule
                </button>
              </div>
            </div>

            {/* Rules Table */}
            {rules.length > 0 && (
              <div
                className="overflow-x-auto rounded-lg border border-gray-500"
                data-tour="rules-table"
              >
                <table className="min-w-full text-sm">
                  <thead className="bg-[#2B245C] text-left text-white border-b border-gray-500">
                    <tr>
                      {[
                        "#",
                        "Tag",
                        "Attr",
                        "Value",
                        "Desc",
                        "Field Name",
                        "Fragment",
                        "Action",
                      ].map((h) => (
                        <th
                          key={h}
                          className="px-4 py-2 font-medium text-xs uppercase tracking-wide "
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {rules.map((r, i) => (
                      <tr key={r.id}>
                        <td className="px-4 py-2 text-gray-700">{i + 1}</td>
                        <td className="px-4 py-2 text-gray-700">
                          {r.tag === "custom" ? r.customTag : r.tag || "Any"}
                        </td>
                        <td className="px-4 py-2 text-gray-700">
                          {r.attribute}
                        </td>
                        <td className="px-4 py-2 text-gray-700">{r.value}</td>
                        <td className="px-4 py-2 text-gray-700">
                          {r.description || "-"}
                        </td>
                        <td className="px-4 py-2 text-gray-700">
                          {r.fieldName || "-"}
                        </td>
                        <td className="px-4 py-2">
                          <code className="rounded-full bg-gray-100 p-2 text-[11px] text-gray-800">
                            {buildFragment(r)}
                          </code>
                        </td>
                        <td className="px-4 py-2">
                          <button
                            onClick={() => handleRemoveRule(r.id)}
                            className="text-red-600 text-sm border border-red-600 rounded-lg px-2 py-1 hover:bg-red-50 transition"
                            title="Remove this rule"
                          >
                            Remove
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Preview */}
            {preview && (
              <div
                className="p-4 bg-gray-50 border border-gray-200 rounded-lg mt-4"
                data-tour="selector-preview"
              >
                <strong className="text-gray-800">Selector:</strong>
                {"  "}
                <code className="font-mono text-sm rounded-md bg-white px-1.5 py-0.5 border border-gray-200">
                  {preview}
                </code>
              </div>
            )}

            {/* Trigger Builder */}
            <div data-tour="trigger-section">
              <h3 className="text-sm font-bold text-[#2B245C] mb-4 uppercase tracking-wide">
                Trigger Configuration
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Event */}
                <div data-tour="trigger-event">
                  <label
                    htmlFor="trigger-event"
                    className="block text-xs font-semibold text-gray-700 mb-2"
                  >
                    Event
                  </label>
                  <select
                    id="trigger-event"
                    value={triggerEvent}
                    onChange={(e) => setTriggerEvent(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 focus:border-indigo-500 focus:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-indigo-200 transition-all"
                  >
                    {EVENT_TYPES.map((evt) => (
                      <option key={evt} value={evt}>
                        {evt}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Tag */}
                <div>
                  <label
                    htmlFor="trigger-tag"
                    className="block text-xs font-semibold text-gray-700 mb-2"
                  >
                    Tag (opt.)
                  </label>
                  <select
                    id="trigger-tag"
                    value={triggerTag}
                    onChange={(e) => setTriggerTag(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 focus:border-indigo-500 focus:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-indigo-200 transition-all"
                  >
                    {AVAILABLE_TAGS.map((t) => (
                      <option key={t} value={t}>
                        {!t ? "Any" : t === "custom" ? "Custom" : t}
                      </option>
                    ))}
                  </select>
                  {triggerTag === "custom" && (
                    <input
                      id="trigger-custom-tag"
                      value={triggerCustomTag}
                      onChange={(e) => setTriggerCustomTag(e.target.value)}
                      placeholder="Custom tag, e.g. my-trigger"
                      className="mt-2 w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-indigo-200 transition-all"
                    />
                  )}
                </div>

                {/* Attribute */}
                <div data-tour="trigger-attribute">
                  <label
                    htmlFor="trigger-attribute"
                    className="block text-xs font-semibold text-gray-700 mb-2"
                  >
                    Attribute
                  </label>
                  <select
                    id="trigger-attribute"
                    value={triggerAttribute}
                    onChange={(e) => setTriggerAttribute(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 focus:border-indigo-500 focus:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-indigo-200 transition-all"
                  >
                    {AVAILABLE_ATTRIBUTES.map((a) => (
                      <option key={a} value={a}>
                        {a.toUpperCase()}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Value */}
                <div>
                  <label
                    htmlFor="trigger-value"
                    className="block text-xs font-semibold text-gray-700 mb-2"
                  >
                    Value
                  </label>
                  <input
                    id="trigger-value"
                    value={triggerValue}
                    onChange={(e) => setTriggerValue(e.target.value)}
                    placeholder={getPlaceholder(triggerAttribute)}
                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-indigo-200 transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Save */}
            <button
              type="submit"
              disabled={saving}
              className="w-full bg-[#2B245C] hover:bg-opacity-90 disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm py-2.5 rounded-lg font-semibold shadow-sm transition mt-2"
              aria-busy={saving ? "true" : "false"}
              data-tour="save-btn"
            >
              {saving ? "Saving..." : "Save Configuration"}
            </button>
          </form>
        </section>

        {/* === SAVED CONFIGURATIONS CARD === */}
        <section
          className="mb-3 space-y-3 rounded-2xl border border-[#2B245C] bg-white p-6 shadow-lg hover:shadow-2xl transition-shadow duration-300"
          data-tour="save-configuration-table"
        >
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-2xl font-semibold text-[#2B245C]">
              Saved Configurations
            </h3>
            {loadingConfigs && (
              <span className="text-sm text-gray-500">Refreshing…</span>
            )}
          </div>

          <div className="overflow-x-auto rounded-lg border border-gray-800">
            <table className="min-w-full text-sm">
              <thead className="bg-[#2B245C] text-left text-white border-b border-gray-800">
                <tr>
                  {[
                    "#",
                    "Domain",
                    "Route",
                    "Form",
                    "Rules",
                    "Trigger",
                    "Saved At",
                    "Actions",
                  ].map((h) => (
                    <th
                      key={h}
                      className="px-4 py-2 font-medium text-xs uppercase tracking-wide"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {configs.length > 0 ? (
                  configs.map((c, i) => {
                    const scriptTag = `<script src="${baseurl}/${initURL}/selectorWatcher.js" data-domain="${c.domain || ""}"></script>`;
                    return (
                      <tr
                        key={`${c.domain}-${c.route}-${i}`}
                        className="border-t border-gray-200"
                      >
                        <td className="px-4 py-2">{i + 1}</td>
                        <td className="px-4 py-2">{c.domain}</td>
                        <td className="px-4 py-2">{c.route}</td>
                        <td className="px-4 py-2">
                          {c.formName || c.form?.name || "-"}
                        </td>
                        <td className="px-4 py-2">{(c.rules || []).length}</td>
                        <td className="px-4 py-2">
                          <code className="rounded-full bg-gray-100 px-2 py-1 text-[12px] text-gray-800">
                            {c.trigger?.selector}
                          </code>
                        </td>

                        <td className="px-4 py-2">
                          {new Date(
                            c.savedAt || c.createdAt || Date.now(),
                          ).toLocaleString()}
                        </td>
                        <td className="px-4 py-2 flex gap-2">
                          <button
                            onClick={() => handleLoadConfig(c)}
                            className="rounded-lg border border-gray-600 bg-white px-2 py-1 text-sm text-gray-600 hover:bg-gray-50 active:bg-gray-100 transition"
                            title="Load this configuration"
                          >
                            Load
                          </button>
                          <button
                            type="button"
                            className="rounded-lg border border-indigo-600 bg-white px-3 py-1 text-sm text-indigo-600 hover:bg-indigo-50 active:bg-indigo-100 transition"
                            onClick={() => handleCopyConfig(c)}
                            title="Copy this configuration to a new form"
                          >
                            Copy
                          </button>
                          <button
                            onClick={() => handleDeleteConfig(c)}
                            className="rounded-lg bg-white px-2 py-1 text-sm text-red-600 border border-red-600 hover:bg-red-50 active:bg-red-200 transition"
                            title="Delete this configuration"
                          >
                            Delete
                          </button>
                          <button
                            onClick={async () => {
                              const ok = await copyToClipboard(scriptTag);
                              if (ok)
                                toast.success("Script copied to clipboard!");
                              else toast.warn("⚠️ Failed to copy script.");
                            }}
                            className="rounded-lg bg-white px-2 py-1 text-sm text-green-600 border border-green-600 hover:bg-green-50 active:bg-green-200 transition"
                            title="Copy script tag"
                          >
                            Copy Script
                          </button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td className="p-6 text-center text-gray-500" colSpan={9}>
                      No configurations found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
            {/* <p className="mt-2 text-xs text-gray-500 px-2">
              The full embed <code>&lt;script&gt;</code> tag is shown in the{" "}
              <b>Script</b> column for every configuration, so you can copy it
              even if the copy button is hidden.
            </p> */}
          </div>
          <p className="mt-2 text-xs text-gray-500 px-2">
            The full embed <code>&lt;script&gt;</code> tag is shown in the{" "}
            <b>Script</b> column for every configuration, so you can copy it
            even if the copy button is hidden.
          </p>
        </section>
      </div>

      {/* Tour instance */}
      <Tour
        steps={tourSteps}
        open={tourOpen}
        onClose={() => setTourOpen(false)}
      />
    </div>
  );
}
