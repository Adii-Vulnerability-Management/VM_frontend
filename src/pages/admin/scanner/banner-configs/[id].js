// pages/admin/scanner/banner-configs/[id].jsx
import React, { useState, useEffect, useMemo, useRef } from "react";
import { useRouter } from "next/router";
import CustomAxios from "@/config/CustomAxios";
import { baseurl, initURL } from "@/config/config";
import computeModifiedFields from "@/utils/computeModifiedFields";
import * as _ from "lodash"; // at the top of your file
import { toast } from "react-toastify";

// Helper function to safely create object URLs for images
function getImageSrc(value) {
  // If it's a string (URL or data URL), return it as is
  if (typeof value === "string") {
    return value;
  }
  // If it's a File or Blob, create an object URL
  if (value instanceof File || value instanceof Blob) {
    return URL.createObjectURL(value);
  }
  // For any other type, return empty string
  return "";
}

// Accordion wrapper with card‐style headers
function Section({ id, title, children }) {
  const [open, setOpen] = useState(false);
  const panelId = `section-panel-${id}`;
  return (
    <div className="mb-4 last:mb-0">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls={panelId}
        id={`section-${id}`}
        className="w-full flex justify-between items-center p-3 bg-white border border-gray-200 rounded-t-lg hover:bg-gray-50 focus:outline-none"
      >
        <span className="font-medium text-gray-900">{title}</span>
        <span aria-hidden="true">{open ? "−" : "+"}</span>
      </button>
      {open && (
        <div
          id={panelId}
          role="region"
          aria-labelledby={`section-${id}`}
          className="p-4 bg-white border-x border-b border-gray-200 rounded-b-lg"
        >
          {children}
        </div>
      )}
    </div>
  );
}

// Accessible toggle switch
function Toggle({ id, label, checked, onChange }) {
  return (
    <div className="flex items-center space-x-2">
      {label && (
        <label htmlFor={id} className="cursor-pointer">
          {label}
        </label>
      )}
      <input
        id={id}
        type="checkbox"
        role="switch"
        aria-checked={checked}
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="sr-only"
      />
      <span
        onClick={() => onChange(!checked)}
        className={`w-10 h-5 flex items-center rounded-full p-1 cursor-pointer ${
          checked ? "bg-green-500" : "bg-gray-300"
        }`}
      >
        <span
          className={`bg-white w-4 h-4 rounded-full shadow transform transition-transform ${
            checked ? "translate-x-5" : "translate-x-0"
          }`}
        />
      </span>
    </div>
  );
}

// Font Family helper
function makeFontCSS(sel, fam) {
  if (!fam) return "";
  const S = (Array.isArray(sel) ? sel : [sel]).filter(Boolean);
  if (!S.length) return "";
  const stack = String(fam)
    .split(",")
    .map((f) => {
      f = f.trim();
      if (!f) return null;
      if (/^(['"]).*\1$/.test(f) || /^[a-z-]+$/.test(f)) return f; // quoted or generic/system
      return `"${f.replace(/"/g, '\\"')}"`; // quote names with spaces/specials
    })
    .filter(Boolean)
    .join(", ");
  return `${S.join(", ")}, ${S.map((s) => `${s} *`).join(
    ", "
  )} { font-family: ${stack} !important; }`;
}

// Button styles form for Banner and Preference (on left panel)
function ButtonStyleEditor({ title, path, styles, onChange }) {
  const enabled = styles?.enabled ?? true; // default to visible for older data

  return (
    <>
      {/* Visibility toggle */}
      <div className="my-1 flex items-center justify-between">
        <Toggle
          id={`toggle-${path}-enabled`}
          label={`Show ${title} button`}
          checked={enabled}
          onChange={(v) =>
            onChange({
              target: {
                name: "enabled",
                type: "checkbox",
                checked: v,
                dataset: { group: path },
              },
            })
          }
        />

        {/* Decide position/sequence of buttons */}
        <div className="flex items-center gap-1">
          <label className="text-sm text-gray-600 mb-0">Position</label>
          <select
            name="order"
            data-group={path}
            value={styles.order ?? 1}
            onChange={onChange}
            className="border rounded-lg p-1 text-sm w-20"
          >
            <option value={1}>1</option>
            <option value={2}>2</option>
            <option value={3}>3</option>
          </select>
        </div>
      </div>

      {/* Render style controls only when enabled */}
      {enabled && (
        <fieldset className="border rounded-xl bg-white p-2">
          <legend className="px-2 text-base md:text-[15px] font-semibold text-gray-800">
            {title}
          </legend>

          <div className="grid grid-cols-3 sm:grid-cols-3 gap-1.5">
            <div className="flex items-center gap-1">
              <label className="text-sm text-gray-700">BG color</label>
              <input
                type="color"
                name="bg"
                data-group={path}
                value={styles.bg}
                onChange={onChange}
                className="h-8 w-10"
                aria-label={`${title} background color`}
              />
            </div>

            <div className="flex items-center gap-1">
              <label className="text-sm text-gray-700">Text color</label>
              <input
                type="color"
                name="text"
                data-group={path}
                value={styles.text}
                onChange={onChange}
                className="h-8 w-10"
                aria-label={`${title} text color`}
              />
            </div>

            <div className="flex items-center">
              <label className="text-sm text-gray-700">Border Color</label>
              <input
                type="color"
                name="borderColor"
                data-group={path}
                value={styles.borderColor}
                onChange={onChange}
                className="h-8 w-10"
                aria-label={`${title} border color`}
              />
            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-1">
                Border Width
              </label>
              <input
                name="borderWidth"
                data-group={path}
                value={styles.borderWidth}
                onChange={onChange}
                placeholder="1px"
                className="w-full border rounded-lg px-3 py-2 text-base"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-1">
                Border Radius
              </label>
              <input
                name="borderRadius"
                data-group={path}
                value={styles.borderRadius}
                onChange={onChange}
                placeholder="8px"
                className="w-full border rounded-lg px-3 py-2 text-base"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-1">
                Padding
              </label>
              <input
                name="padding"
                data-group={path}
                value={styles.padding}
                onChange={onChange}
                placeholder="12px 16px"
                className="w-full border rounded-lg px-3 py-2 text-base"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-1">
                Font Weight
              </label>
              <input
                name="fontWeight"
                data-group={path}
                value={styles.fontWeight}
                onChange={onChange}
                placeholder="600"
                className="w-full border rounded-lg px-3 py-2 text-base"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-1">
                Transition
              </label>
              <input
                name="transition"
                data-group={path}
                value={styles.transition}
                onChange={onChange}
                placeholder="0.25s ease"
                className="w-full border rounded-lg px-3 py-2 text-base"
              />
            </div>

            <div className="mt-8">
              <Toggle
                id={`toggle-${path}-underline`}
                label="Underline"
                checked={!!styles.underline}
                onChange={(v) =>
                  onChange({
                    target: {
                      name: "underline",
                      type: "checkbox",
                      checked: v,
                      dataset: { group: path },
                    },
                  })
                }
              />
            </div>
          </div>
        </fieldset>
      )}
    </>
  );
}

function PrefAccordion({
  title,
  icon,
  checked,
  onToggle,
  children,
  headerBg,
  headerText,
  borderColor,
  borderRadius,
  bodyBg,
  headerPadding,
  bodyPadding,
  iconTitleGap,
  titleFontSize,
  titleFontWeight,
  descFontSize,
  descFontWeight,
  descLineHeight,
}) {
  const [open, setOpen] = useState(false);
  const headerId = `acc-${title}-header`;
  const panelId = `acc-${title}-panel`;

  return (
    <div
      className="mb-2 overflow-hidden"
      style={{
        border: `1px solid ${borderColor || "#e5e7eb"}`,
        borderRadius: borderRadius || "0.375rem",
      }}
    >
      <button
        id={headerId}
        type="button"
        className="w-full flex items-center justify-between"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((o) => !o)}
        style={{
          backgroundColor: headerBg,
          color: headerText,
          padding: headerPadding,
        }}
      >
        {/* optional icon on left side of title */}
        <div
          className="flex items-center min-w-0"
          style={{ gap: iconTitleGap || "0.5rem" }}
        >
          {icon ? (
            <img
              src={getImageSrc(icon)}
              alt=""
              className="w-5 h-5 object-contain shrink-0"
            />
          ) : null}
          <span
            className="truncate"
            style={{
              fontSize: titleFontSize || "0.9rem",
              fontWeight: titleFontWeight ?? 500,
            }}
          >
            {title}
          </span>
        </div>

        {/* Toggle */}
        <span onClick={(e) => e.stopPropagation()} className="shrink-0">
          <Toggle
            id={`${headerId}-toggle`}
            checked={checked}
            onChange={onToggle}
          />
        </span>
      </button>

      {open && (
        <div
          id={panelId}
          role="region"
          aria-labelledby={headerId}
          style={{
            background: bodyBg,
            borderTop: `1px solid ${borderColor || "#e5e7eb"}`,
            lineHeight: descLineHeight,
          }}
        >
          <div
            style={{
              padding: bodyPadding,
              fontSize: descFontSize,
              fontWeight: descFontWeight,
            }}
          >
            {children}
          </div>
        </div>
      )}
    </div>
  );
}

// Vendor/Cookie list Form (on left panel)
function ListEditor({
  listKey, // "vendors" | "cookies"
  titlePlaceholder,
  markDirty,
  setForm,
  listsContent,
}) {
  const items = listsContent[listKey] || [];

  return (
    <div className="mt-3 mb-5">
      {/* List name/list link name */}
      <label className="text-md">List name</label>
      <input
        name={listKey === "vendors" ? "vendorListTitle" : "cookieListTitle"}
        value={
          listKey === "vendors"
            ? listsContent.vendorListTitle || ""
            : listsContent.cookieListTitle || ""
        }
        onChange={(e) => {
          const { value } = e.target;
          const key =
            listKey === "vendors" ? "vendorListTitle" : "cookieListTitle";

          markDirty();
          setForm((f) => ({
            ...f,
            listsContent: {
              ...f.listsContent,
              [key]: value,
            },
          }));
        }}
        placeholder={titlePlaceholder}
        className="w-full border px-2 py-1 rounded mb-3"
      />

      {items.map((item, ii) => {
        // For cookies: normalize description to an array of rows
        const descRows =
          listKey === "cookies"
            ? Array.isArray(item.description)
              ? item.description
              : item.description
              ? [item.description]
              : [
                  {
                    name: "",
                    host: "",
                    duration: "",
                    description: "",
                  },
                ]
            : null;

        return (
          <div key={ii} className="mb-3 border rounded p-3 relative">
            {/* Remove item */}
            <button
              type="button"
              onClick={() => {
                markDirty();
                setForm((f) => ({
                  ...f,
                  listsContent: {
                    ...f.listsContent,
                    [listKey]: (f.listsContent[listKey] || []).filter(
                      (_, k) => k !== ii
                    ),
                  },
                }));
              }}
              className="absolute top-0 right-1 text-red-500"
              aria-label="Remove item"
            >
              ×
            </button>

            {/* ===================== VENDORS ===================== */}
            {listKey === "vendors" && (
              <>
                <label className="block text-sm mb-1">Title</label>
                <input
                  name="title"
                  value={item.title || ""}
                  onChange={(e) => {
                    const { value } = e.target;
                    markDirty();
                    setForm((f) => ({
                      ...f,
                      listsContent: {
                        ...f.listsContent,
                        [listKey]: (f.listsContent[listKey] || []).map(
                          (it, k) => (k === ii ? { ...it, title: value } : it)
                        ),
                      },
                    }));
                  }}
                  placeholder="Vendor name"
                  className="w-full border px-2 py-1 rounded mb-2"
                />

                <label className="block text-sm mb-1">Description</label>
                <textarea
                  name="description"
                  value={item.description || ""}
                  onChange={(e) => {
                    const { value } = e.target;
                    markDirty();
                    setForm((f) => ({
                      ...f,
                      listsContent: {
                        ...f.listsContent,
                        [listKey]: (f.listsContent[listKey] || []).map(
                          (it, k) =>
                            k === ii ? { ...it, description: value } : it
                        ),
                      },
                    }));
                  }}
                  placeholder="Description"
                  className="w-full border px-2 py-1 rounded mb-2"
                />
              </>
            )}

            {/* ===================== COOKIES ===================== */}
            {listKey === "cookies" && (
              <>
                {/* Cookie Title */}
                <label className="block text-sm font-medium mb-1">Title</label>
                <input
                  value={item.title || ""}
                  onChange={(e) => {
                    const { value } = e.target;
                    markDirty();
                    setForm((f) => ({
                      ...f,
                      listsContent: {
                        ...f.listsContent,
                        [listKey]: (f.listsContent[listKey] || []).map(
                          (it, k) =>
                            k === ii
                              ? {
                                  ...it,
                                  title: value,
                                }
                              : it
                        ),
                      },
                    }));
                  }}
                  placeholder="Cookie name"
                  className="w-full border px-2 py-1 rounded mb-3"
                />

                {/* Description block – multiple cookie data rows */}
                <div className="mb-2">
                  <label className="block text-sm font-medium mb-2">
                    Description
                  </label>

                  {descRows.map((row, di) => (
                    <div
                      key={di}
                      className="mb-3 border border-dashed border-gray-300 rounded p-2"
                    >
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs font-semibold">
                          Cookie Data #{di + 1}
                        </span>
                        {descRows.length > 1 && (
                          <button
                            type="button"
                            className="text-xs text-red-500"
                            onClick={() => {
                              markDirty();
                              setForm((f) => ({
                                ...f,
                                listsContent: {
                                  ...f.listsContent,
                                  [listKey]: (
                                    f.listsContent[listKey] || []
                                  ).map((it, k) => {
                                    if (k !== ii) return it;
                                    const currentRows = Array.isArray(
                                      it.description
                                    )
                                      ? it.description
                                      : it.description
                                      ? [it.description]
                                      : [];
                                    return {
                                      ...it,
                                      description: currentRows.filter(
                                        (_, idx) => idx !== di
                                      ),
                                    };
                                  }),
                                },
                              }));
                            }}
                          >
                            Remove
                          </button>
                        )}
                      </div>

                      {/* Name */}
                      <label className="block text-xs mb-1">Name</label>
                      <input
                        value={row.name || ""}
                        onChange={(e) => {
                          const { value } = e.target;
                          markDirty();
                          setForm((f) => ({
                            ...f,
                            listsContent: {
                              ...f.listsContent,
                              [listKey]: (f.listsContent[listKey] || []).map(
                                (it, k) => {
                                  if (k !== ii) return it;
                                  const currentRows = Array.isArray(
                                    it.description
                                  )
                                    ? it.description
                                    : it.description
                                    ? [it.description]
                                    : [];
                                  const newRows = currentRows.map((r, idx) =>
                                    idx === di ? { ...r, name: value } : r
                                  );
                                  return { ...it, description: newRows };
                                }
                              ),
                            },
                          }));
                        }}
                        placeholder="Cookie name"
                        className="w-full border px-2 py-1 rounded mb-2"
                      />

                      {/* Host */}
                      <label className="block text-xs mb-1">Host</label>
                      <input
                        value={row.host || ""}
                        onChange={(e) => {
                          const { value } = e.target;
                          markDirty();
                          setForm((f) => ({
                            ...f,
                            listsContent: {
                              ...f.listsContent,
                              [listKey]: (f.listsContent[listKey] || []).map(
                                (it, k) => {
                                  if (k !== ii) return it;
                                  const currentRows = Array.isArray(
                                    it.description
                                  )
                                    ? it.description
                                    : it.description
                                    ? [it.description]
                                    : [];
                                  const newRows = currentRows.map((r, idx) =>
                                    idx === di ? { ...r, host: value } : r
                                  );
                                  return { ...it, description: newRows };
                                }
                              ),
                            },
                          }));
                        }}
                        placeholder="Host"
                        className="w-full border px-2 py-1 rounded mb-2"
                      />

                      {/* Duration */}
                      <label className="block text-xs mb-1">Duration</label>
                      <input
                        value={row.duration || ""}
                        onChange={(e) => {
                          const { value } = e.target;
                          markDirty();
                          setForm((f) => ({
                            ...f,
                            listsContent: {
                              ...f.listsContent,
                              [listKey]: (f.listsContent[listKey] || []).map(
                                (it, k) => {
                                  if (k !== ii) return it;
                                  const currentRows = Array.isArray(
                                    it.description
                                  )
                                    ? it.description
                                    : it.description
                                    ? [it.description]
                                    : [];
                                  const newRows = currentRows.map((r, idx) =>
                                    idx === di ? { ...r, duration: value } : r
                                  );
                                  return { ...it, description: newRows };
                                }
                              ),
                            },
                          }));
                        }}
                        placeholder="Duration"
                        className="w-full border px-2 py-1 rounded mb-2"
                      />

                      {/* Description */}
                      <label className="block text-xs mb-1">Description</label>
                      <textarea
                        value={row.description || ""}
                        onChange={(e) => {
                          const { value } = e.target;
                          markDirty();
                          setForm((f) => ({
                            ...f,
                            listsContent: {
                              ...f.listsContent,
                              [listKey]: (f.listsContent[listKey] || []).map(
                                (it, k) => {
                                  if (k !== ii) return it;
                                  const currentRows = Array.isArray(
                                    it.description
                                  )
                                    ? it.description
                                    : it.description
                                    ? [it.description]
                                    : [];
                                  const newRows = currentRows.map((r, idx) =>
                                    idx === di
                                      ? { ...r, description: value }
                                      : r
                                  );
                                  return { ...it, description: newRows };
                                }
                              ),
                            },
                          }));
                        }}
                        placeholder="Description"
                        className="w-full border px-2 py-1 rounded mb-1"
                      />
                    </div>
                  ))}

                  {/* Add Cookie Data button (inside description) */}
                  <button
                    type="button"
                    className="px-2.5 py-1.5 bg-blue-800 text-sm text-white rounded"
                    onClick={() => {
                      markDirty();
                      setForm((f) => ({
                        ...f,
                        listsContent: {
                          ...f.listsContent,
                          [listKey]: (f.listsContent[listKey] || []).map(
                            (it, k) => {
                              if (k !== ii) return it;
                              const currentRows = Array.isArray(it.description)
                                ? it.description
                                : it.description
                                ? [it.description]
                                : [];
                              return {
                                ...it,
                                description: [
                                  ...currentRows,
                                  {
                                    name: "",
                                    host: "",
                                    duration: "",
                                    description: "",
                                  },
                                ],
                              };
                            }
                          ),
                        },
                      }));
                    }}
                  >
                    Add Cookie Data
                  </button>
                </div>
              </>
            )}

            {/* Default Enabled toggle */}
            <Toggle
              id={`toggle-${listKey}-default-${ii}`}
              label="Default Enabled"
              checked={!!item.default}
              onChange={(v) => {
                markDirty();
                setForm((f) => ({
                  ...f,
                  listsContent: {
                    ...f.listsContent,
                    [listKey]: (f.listsContent[listKey] || []).map((it, k) =>
                      k === ii ? { ...it, default: v } : it
                    ),
                  },
                }));
              }}
            />
          </div>
        );
      })}

      {/* Add Vendor / Cookie (new item) */}
      <button
        type="button"
        onClick={() => {
          markDirty();
          setForm((f) => ({
            ...f,
            listsContent: {
              ...f.listsContent,
              [listKey]: [
                ...(f.listsContent[listKey] || []),
                listKey === "vendors"
                  ? {
                      title: "Vendor name",
                      description: "Add Description of vendor.",
                      default: false,
                    }
                  : {
                      title: "Cookie name",
                      description: [
                        {
                          name: "grc3",
                          host: ".example.com",
                          duration: "2 years",
                          description: "Used to distinguish users.",
                        },
                      ],
                      default: false,
                    },
              ],
            },
          }));
        }}
        className="px-3 py-1.5 bg-blue-700 text-white rounded"
      >
        {listKey === "vendors" ? "Add Vendor" : "Add Cookie"}
      </button>
    </div>
  );
}

// Manage Preferences center (main view) in Pref modal
// Manage Preferences center (main view) in Pref modal
function ManagePreferencesCenter({
  form,
  prefSectionStyles,
  prefSubHeader,
  prefText,
  prefTitle,
  prefDescription,
  prefCatStates,
  togglePrefCat,
  openList,
}) {
  const shouldShowVendorList = !!form.showVendorList;
  const shouldShowCookieList = !!form.showCookieList;

  return (
    <div className="px-4 py-3">
      {/* title */}
      <h2
        id="pref-modal-title"
        className="text-xl font-semibold mb-4"
        style={{ color: prefSubHeader }}
      >
        {prefTitle}
      </h2>

      {/* optional "More information" link (inline/separate) */}
      <p className="mb-4" style={{ color: prefText }}>
        {prefDescription}{" "}
        {form.showPrefPolicyLink &&
          form.prefPolicyLinkPosition === "inline" && (
            <a
              href={form.prefPolicyUrl}
              style={{
                color: form.prefPolicyLinkStyles.textColor,
                textDecoration: form.prefPolicyLinkStyles.decoration,
              }}
            >
              {form.prefPolicyText}
            </a>
          )}
      </p>

      {form.showPrefPolicyLink &&
        form.prefPolicyLinkPosition === "separate" && (
          <div className="mb-4">
            <a
              href={form.prefPolicyUrl}
              style={{
                color: form.prefPolicyLinkStyles.textColor,
                textDecoration: form.prefPolicyLinkStyles.decoration,
              }}
            >
              {form.prefPolicyText}
            </a>
          </div>
        )}

      {/* Vendor/Cookie list links are common for the whole preference center */}
      {(shouldShowVendorList || shouldShowCookieList) && (
        <div className="mb-4 flex flex-wrap gap-4">
          {/* Vendor List link */}
          {shouldShowVendorList && (
            <button
              type="button"
              onClick={() => openList("vendors")}
              style={{
                fontSize: "15px",
                background: "transparent",
                border: "none",
                padding: 0,
                cursor: "pointer",
                color: form.prefPolicyLinkStyles.textColor,
                textDecoration: form.prefPolicyLinkStyles.decoration,
              }}
              aria-label={
                form.listsContent.vendorListTitle?.trim() || "Vendor List"
              }
            >
              {form.listsContent.vendorListTitle?.trim() || "Vendor List"}
            </button>
          )}

          {/* Cookie List link */}
          {shouldShowCookieList && (
            <button
              type="button"
              onClick={() => openList("cookies")}
              style={{
                fontSize: "15px",
                background: "transparent",
                border: "none",
                padding: 0,
                cursor: "pointer",
                color: form.prefPolicyLinkStyles.textColor,
                textDecoration: form.prefPolicyLinkStyles.decoration,
              }}
              aria-label={
                form.listsContent.cookieListTitle?.trim() || "Cookie List"
              }
            >
              {form.listsContent.cookieListTitle?.trim() || "Cookie List"}
            </button>
          )}
        </div>
      )}

      {/* Cookie Category Accordion */}
      {form.cookieCategories.map((cat, i) => (
        <PrefAccordion
          key={i}
          title={cat.name || `Category ${i + 1}`}
          icon={cat.icon}
          checked={!!prefCatStates[i]}
          onToggle={() => togglePrefCat(i)}
          headerBg={prefSectionStyles.categoryTitleBg}
          headerText={prefSectionStyles.categoryTitleText}
          borderColor={prefSectionStyles.borderColor}
          borderRadius={prefSectionStyles.borderRadius}
          bodyBg={prefSectionStyles.categoryDescBg}
          headerPadding={prefSectionStyles.titlePadding}
          bodyPadding={prefSectionStyles.descPadding}
          iconTitleGap={prefSectionStyles.iconTitleGap}
          titleFontSize={prefSectionStyles.titleFontSize}
          titleFontWeight={prefSectionStyles.titleFontWeight}
        >
          <p
            className="text-sm"
            style={{
              margin: 0,
              color: form.prefSectionStyles.categoryDescText,
              fontSize: prefSectionStyles.descFontSize,
              fontWeight: prefSectionStyles.descFontWeight,
              lineHeight: prefSectionStyles.descLineHeight,
            }}
          >
            {cat.description}
          </p>
        </PrefAccordion>
      ))}
    </div>
  );
}

// Vendors/Cookies List center in Pref modal
// Vendors/Cookies List center in Pref modal
function ListCenter({
  form,
  listKey, // "vendors" | "cookies"
  backToManagePreferences,
  prefItemStates,
  togglePrefItem,
}) {
  const items =
    listKey === "vendors"
      ? form.listsContent.vendors || []
      : form.listsContent.cookies || [];

  const title =
    listKey === "vendors"
      ? form.listsContent.vendorListTitle || "Vendor List"
      : form.listsContent.cookieListTitle || "Cookie List";

  return (
    <div
      className="px-4 py-3"
      style={{
        backgroundColor: form.listsStyles.bgColor,
        boxSizing: "border-box",
      }}
    >
      <div className="flex items-center gap-3 mb-4">
        {/* Back icon */}
        <button
          type="button"
          aria-label="Back to Manage Preferences"
          onClick={backToManagePreferences}
          style={{
            background: "transparent",
            border: "none",
            cursor: "pointer",
            padding: 0,
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {form.prefBackIcon ? (
            <img
              src={getImageSrc(form.prefBackIcon)}
              alt="Back"
              title="Back"
              style={{
                width: 20,
                height: 20,
                objectFit: "contain",
                display: "block",
              }}
            />
          ) : (
            // Fallback: simple unicode arrow if no image set
            <span
              aria-hidden="true"
              style={{ fontSize: 18, lineHeight: 1, display: "block" }}
            >
              ←
            </span>
          )}
        </button>

        {/* Vendor/Cookie List name */}
        <h3
          className="mt-1 text-[17px] font-semibold"
          style={{ color: form.listsStyles.headerColor }}
        >
          {title}
        </h3>
      </div>

      {/* Cookie/Vendor list accordion */}
      {items.length > 0 && (
        <div>
          {items.map((item, ii) => (
            <PrefAccordion
              key={ii}
              title={item.title || `Item ${ii + 1}`}
              icon={null}
              checked={!!prefItemStates?.[listKey]?.[ii]}
              onToggle={() => togglePrefItem(listKey, ii)}
              headerBg={form.listsStyles.listTitleBg}
              headerText={form.listsStyles.listTitleText}
              borderColor={form.listsStyles.borderColor}
              borderRadius={form.listsStyles.borderRadius}
              bodyBg={form.listsStyles.listDescBg}
              headerPadding={form.listsStyles.titlePadding}
              bodyPadding={form.listsStyles.descPadding}
              descFontWeight={form.listsStyles.descFontWeight}
              descLineHeight={form.listsStyles.descLineHeight}
            >
              {listKey === "vendors" ? (
                // Vendors: simple text
                <p
                  className="text-sm"
                  style={{
                    margin: 0,
                    color: form.listsStyles.listDescText,
                    fontSize: form.listsStyles.descFontSize,
                    fontWeight: form.listsStyles.descFontWeight,
                    lineHeight: form.listsStyles.descLineHeight,
                  }}
                >
                  {item.description || "—"}
                </p>
              ) : (
                // Cookies: render each cookie-data row
                <div>
                  {Array.isArray(item.description) &&
                    item.description.map((row, ri) => (
                      <div
                        key={ri}
                        style={{
                          marginBottom: "0.75rem",
                          backgroundColor:
                            form.listsStyles.dataBgColor || "#f3f4f6",
                          fontSize: form.listsStyles.descFontSize,
                          color: form.listsStyles.dataTextColor,
                          padding: form.listsStyles.dataPadding || "0.5rem",
                        }}
                        className="text-[13px] grid grid-cols-3 gap-x-4 gap-y-2"
                      >
                        <div className="col-span-1">
                          <strong>Name</strong>
                        </div>
                        <div className="col-span-2">{row.name || "—"}</div>

                        <div className="col-span-1">
                          <strong>Host</strong>
                        </div>
                        <div className="col-span-2">{row.host || "—"}</div>

                        <div className="col-span-1">
                          <strong>Duration</strong>
                        </div>
                        <div className="col-span-2">{row.duration || "—"}</div>

                        <div className="col-span-1">
                          <strong>Description</strong>
                        </div>
                        <div className="col-span-2">
                          {row.description || "—"}
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </PrefAccordion>
          ))}
        </div>
      )}
    </div>
  );
}

//// Main Component
export default function BannerConfigForm({
  isNew: isNewProp, // ← new!
  overrideId,
}) {
  const router = useRouter();
  const { query, isReady } = router;

  // 1) Determine the “id” we should use:
  const id = overrideId != null ? overrideId : query.id;

  // 2) Determine new/edit mode:
  //   • If caller passed isNewProp, use that.
  //   • Otherwise, wait until router.isReady and check query.id==='new'.
  const isNew = isNewProp != null ? isNewProp : isReady && id === "new";

  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [isDirty, setIsDirty] = useState(false);
  const isDirtyRef = useRef(false);
  const [loading, setLoading] = useState(!isNew);
  const [showPrefCenter, setShowPrefCenter] = useState(false);

  // Track ON/OFF per category and per item toggles
  const [prefCatStates, setPrefCatStates] = useState({});
  const [prefItemStates, setPrefItemStates] = useState({
    vendors: {},
    cookies: {},
  });

  // Simple view state for preference modal
  const [prefCenterView, setPrefCenterView] = useState("main");
  const [activeListKey, setActiveListKey] = useState("vendors");

  const initialFormRef = useRef(null);

  // raw baseline for diff
  const [baselineStyleConfig, setBaselineStyleConfig] = useState({});

  const [form, setForm] = useState({
    domain: "",
    sdkVersion: "",
    bannerVersion: "1",
    status: "draft",
    templateKey: "",
    templateVersion: "",

    logo: null,
    backgroundColor: "#f9fafb",
    textColor: "#111827",

    bannerStyles: {
      borderRadius: "0.5rem",
      boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
      padding: "1rem",
      fontFamily: "Arial, sans-serif",
      fontSize: "1rem",
      textAlign: "left",
      buttonAlign: "left",
      linkAlign: "left",
      orientation: "horizontal",
      alignItems: "center",
      gap: "1rem",
    },

    texts: {
      title: "This website uses cookies",
      description: "We use cookies to improve your experience.",
      acceptAll: "Accept All",
      rejectAll: "Reject",
      managePrefs: "Manage Preferences",
    },

    bannerClose: {
      enabled: false,
      color: "#374151",
      bg: "#f9fbfa",
      borderColor: "#f9fbfa",
      borderWidth: "0px",
      bold: false,
      size: "18px",
      padding: "0.25rem",
      borderRadius: "9999px",
      offset: "0.5rem",
    },

    showPolicyLink: true,
    policyText: "Privacy Policy",
    policyUrl: "/privacy-policy",
    showImprintLink: false,
    imprintText: "Imprint",
    imprintUrl: "",
    policyLinkPosition: "separate",

    linkStyles: {
      decoration: "underline",
      textColor: "#22c55e",
    },

    bannerButtonStyles: {
      accept: {
        enabled: true,
        order: 1,
        bg: "#22c55e",
        text: "#ffffff",
        padding: "0.5rem 1rem",
        borderRadius: "0.375rem",
        borderWidth: "0px",
        borderColor: "transparent",
        transition: "0.2s ease",
        fontWeight: 500,
        underline: false,
      },
      reject: {
        enabled: true,
        order: 2,
        bg: "#ef4444",
        text: "#ffffff",
        padding: "0.5rem 1rem",
        borderRadius: "0.375rem",
        borderWidth: "0px",
        borderColor: "transparent",
        transition: "0.2s ease",
        fontWeight: 500,
        underline: false,
      },
      manage: {
        enabled: true,
        order: 3,
        bg: "#2563eb",
        text: "#ffffff",
        padding: "0.5rem 1rem",
        borderRadius: "0.375rem",
        borderWidth: "0px",
        borderColor: "transparent",
        transition: "0.2s ease",
        fontWeight: 500,
        underline: false,
      },
      splitManageButton: false,
      stackButtons: false,
    },

    layout: {
      type: "bar",
      position: "bottom",
    },

    showInlinePrefOnBanner: false,

    // Common list toggles. Actual vendor/cookie data comes from runtime APIs;
    // listsContent below is placeholder/reference data for styling and preview.
    showVendorList: false,
    showCookieList: false,

    prefHeaderText: "Preferences",
    prefHeaderLogo: null,

    prefContent: {
      title: "Manage Preferences",
      description: "Customize your cookie settings.",
      acceptAllText: "Accept All",
      saveAllText: "Save Preferences",
      rejectAllText: "Reject All",
    },

    showPrefPolicyLink: false,
    prefPolicyText: "More information",
    prefPolicyUrl: "/more-information",
    prefPolicyLinkPosition: "separate",

    prefPolicyLinkStyles: {
      textColor: "#22c55e",
      decoration: "underline",
    },

    prefBackIcon: null,

    prefStyles: {
      prefHeaderBg: "#f3f4f6",
      prefHeaderTextColor: "#111827",
      bgColor: "#ffffff",
      headerColor: "#333333",
      textColor: "#000000",
      buttonBarBg: "#f9fafb",
      footerBg: "#f3f4f6",
      footerTextColor: "#111827",
      borderColor: "#e2e2e2",
    },

    prefButtonStyles: {
      acceptAll: {
        enabled: true,
        order: 1,
        bg: "#22c55e",
        text: "#ffffff",
        padding: "0.5rem 1rem",
        borderRadius: "0.375rem",
        borderWidth: "0px",
        borderColor: "transparent",
        transition: "0.2s ease",
        fontWeight: 500,
      },
      saveAll: {
        enabled: true,
        order: 2,
        bg: "#2563eb",
        text: "#ffffff",
        padding: "0.5rem 1rem",
        borderRadius: "0.375rem",
        borderWidth: "0px",
        borderColor: "transparent",
        transition: "0.2s ease",
        fontWeight: 500,
      },
      rejectAll: {
        enabled: true,
        order: 3,
        bg: "#ef4444",
        text: "#ffffff",
        padding: "0.5rem 1rem",
        borderRadius: "0.375rem",
        borderWidth: "0px",
        borderColor: "transparent",
        transition: "0.2s ease",
        fontWeight: 500,
      },
    },

    cookieCategories: [
      {
        name: "Necessary",
        description: "Always active",
        default: true,
        icon: null,
      },
      {
        name: "Analytics",
        description: "Usage tracking",
        default: false,
        icon: null,
      },
    ],

    prefSectionStyles: {
      categoryTitleBg: "#f9fafb",
      categoryTitleText: "#111827",
      categoryDescBg: "#ffffff",
      categoryDescText: "#111827",
      titlePadding: "0.75rem",
      descPadding: "0.75rem",
      borderColor: "#e2e2e2",
      borderRadius: "0.375rem",
      iconTitleGap: "0.5rem",
      titleFontSize: "0.9rem",
      titleFontWeight: 500,
      descFontSize: "0.85rem",
      descFontWeight: 400,
      descLineHeight: 1.5,
    },

    listsContent: {
      vendorListTitle: "Vendor List",
      vendors: [
        {
          title: "Marketo",
          description: "Add description here of Vendor.",
          default: false,
        },
      ],
      cookieListTitle: "Cookie List",
      cookies: [
        {
          title: "First Party Cookies",
          description: [
            {
              name: "testcookie",
              host: "grc3.com",
              duration: "365 days",
              description: "Used to distinguish users.",
            },
          ],
          default: false,
        },
      ],
    },

    listsStyles: {
      bgColor: "#ffffff",
      headerColor: "#333333",
      textColor: "#000000",
      listTitleBg: "#f3f4f6",
      listTitleText: "#111827",
      listDescBg: "#ffffff",
      listDescText: "#111827",
      titlePadding: "0.75rem",
      descPadding: "0.75rem",
      borderColor: "#e2e2e2",
      borderRadius: "0.375rem",
      titleFontSize: "0.9rem",
      titleFontWeight: 500,
      descFontSize: "0.75rem",
      descFontWeight: 400,
      descLineHeight: 1.5,
      dataBgColor: "#f7f7f7",
      dataTextColor: "#111827",
      dataPadding: "0.5rem",
    },

    prefFooterText: "Company",
    prefFooterLogo: null,

    cookieListTitleColor: "#1f2937",
    cookieListBgColor: "#f3f4f6",

    customCss: "",
  });

  const [webData, setWebData] = useState({});

  // mark form dirty
  function markDirty() {
    if (!isDirtyRef.current) {
      isDirtyRef.current = true;
      setIsDirty(true);
    }
  }

  // generic onChange handler
  // function onChange(e) {
  //   markDirty()
  //   const { name, value, type, checked, files, dataset } = e.target

  //   if (type === 'file') {
  //     setForm(f => ({ ...f, logo: files[0] }))
  //     return
  //   }

  //   if (dataset.group === 'cookieCategories') {
  //     const idx = +dataset.index
  //     setForm(f => ({
  //       ...f,
  //       cookieCategories: f.cookieCategories.map((c, i) =>
  //         i === idx
  //           ? { ...c, [name]: type === 'checkbox' ? checked : value }
  //           : c
  //       )
  //     }))
  //     return
  //   }

  //   if (name.includes('.')) {
  //     const [group, key] = name.split('.')
  //     setForm(f => ({
  //       ...f,
  //       [group]: {
  //         ...f[group],
  //         [key]: type === 'checkbox' ? checked : value
  //       }
  //     }))
  //     return
  //   }

  //   if (type === 'checkbox') {
  //     setForm(f => ({ ...f, [name]: checked }))
  //   } else {
  //     setForm(f => ({ ...f, [name]: value }))
  //   }
  // }

  // Go to the list view (vendors or cookies)
  function openList(listKey) {
    setActiveListKey(listKey);
    setPrefCenterView("list");
  }

  // Go back from list view to the main manage preferences view
  function backToManagePreferences() {
    setPrefCenterView("main");
  }

  function onChange(e) {
    markDirty();
    const { name, value, type, checked, files, dataset } = e.target;

    // 1) files
    if (type === "file") {
      if (dataset.group === "cookieCategories") {
        const idx = +dataset.index;
        return setForm((f) => ({
          ...f,
          cookieCategories: f.cookieCategories.map((c, i) =>
            i === idx ? { ...c, [name]: files[0] } : c,
          ),
        }));
      }
      return setForm((f) => ({ ...f, [name]: files[0] }));
    }

    // 2) deep group path e.g. "bannerButtonStyles.accept"
    if (dataset.group?.includes(".")) {
      const path = dataset.group.split(".");
      setForm((prev) => {
        const next = { ...prev };
        let cur = next;
        for (let i = 0; i < path.length - 1; i++)
          cur = cur[path[i]] = { ...cur[path[i]] };
        cur[path.at(-1)] = {
          ...cur[path.at(-1)],
          [name]: type === "checkbox" ? checked : value,
        };
        return next;
      });
      return;
    }

    // 3) grouped shallow
    if (dataset.group) {
      if (dataset.group === "cookieCategories") {
        const idx = +dataset.index;
        return setForm((f) => ({
          ...f,
          cookieCategories: f.cookieCategories.map((c, i) =>
            i === idx
              ? {
                  ...c,
                  [name]: type === "checkbox" ? checked : value,
                }
              : c,
          ),
        }));
      }

      return setForm((f) => ({
        ...f,
        [dataset.group]: {
          ...f[dataset.group],
          [name]: type === "checkbox" ? checked : value,
        },
      }));
    }

    // 4) top-level
    setForm((f) => ({ ...f, [name]: type === "checkbox" ? checked : value }));
  }

  function addCategory() {
    markDirty();
    setForm((f) => ({
      ...f,
      cookieCategories: [
        ...f.cookieCategories,
        { name: "", description: "", default: false },
      ],
    }));
  }

  function removeCategory(idx) {
    markDirty();
    setForm((f) => ({
      ...f,
      cookieCategories: f.cookieCategories.filter((_, i) => i !== idx),
    }));
  }

  function togglePrefCat(i) {
    markDirty();
    setPrefCatStates((s) => ({ ...s, [i]: !s[i] }));
  }

  function togglePrefItem(listKey, ii) {
    markDirty();
    setPrefItemStates((s) => ({
      ...s,
      [listKey]: {
        ...(s[listKey] || {}),
        [ii]: !(s[listKey] || {})[ii],
      },
    }));
  }

  // fetch template list
  useEffect(() => {
    (async () => {
      try {
        const { data } = await CustomAxios.get(
          `${baseurl}/${initURL}/cmp/templates`,
        );
        setTemplates(data);
      } catch (err) {
        console.error(err);
      }
    })();
  }, []);

  // when template is selected → load its defaults
  useEffect(() => {
    if (!selectedTemplate) return;
    const [tk, tv] = selectedTemplate.split("@");
    setForm((f) => ({ ...f, templateKey: tk, templateVersion: tv }));
    (async () => {
      try {
        const res = await CustomAxios.get(
          `${baseurl}/${initURL}/cmp/templates/${tk}/${tv}`,
        );
        const defaults = res.data.defaults;
        setBaselineStyleConfig(defaults);
        setForm((f) => ({ ...f, ...defaults }));
      } catch (err) {
        console.error(err);
      }
    })();
  }, [selectedTemplate]);

  // load existing config
  useEffect(() => {
    if (!router.isReady) return;
    console.log(router.query?.wId);
    if (router.query?.wId) {
      (async () => {
        setLoading(true);
        try {
          const { data } = await CustomAxios.get(
            `${baseurl}/${initURL}/cmp/websites/${router.query?.wId}`,
          );
          setWebData(data);
          setForm((F) => ({ ...F, domain: data.domain }));
        } catch (err) {
          console.error(err);
        } finally {
          setLoading(false);
        }
      })();
    } else {
      setLoading(false);
    }

    if (!isNew && id) {
      (async () => {
        setLoading(true);
        try {
          const { data } = await CustomAxios.get(
            `${baseurl}/${initURL}/cmp/configs/${id}`,
          );

          // 1️⃣ stash the full config for later (onSubmit)
          initialFormRef.current = data;

          // 2️⃣ extract & stash the raw baseline (template defaults)
          const baseline = data.styleConfig || {};
          setBaselineStyleConfig(baseline);

          // 3️⃣ deep-clone baseline and apply each dot-path override
          const mergedStyle = _.cloneDeep(baseline);
          if (data.overrideEnabled && data.modifiedFields) {
            Object.entries(data.modifiedFields).forEach(([path, val]) => {
              _.set(mergedStyle, path, val);
            });
          }

          // 4️⃣ initialize your entire form state in one go:
          setForm((f) => ({
            ...f, // keep any fields your initial state already had
            domain: data.domain,
            sdkVersion: data.sdkVersion,
            bannerVersion: data.bannerVersion,
            status: data.status,
            templateKey: data.templateKey,
            templateVersion: data.templateVersion,
            ...mergedStyle, // now every style prop (nested) is in place
          }));
        } catch (err) {
          console.error(err);
        } finally {
          setLoading(false);
        }
      })();
    } else {
      setLoading(false);
    }
  }, [router.isReady, id, isNew]);

  // init pref toggles
  // useEffect(() => {
  //   const init = {};
  //   form.cookieCategories.forEach((c, i) => {
  //     init[i] = !!c.default;
  //   });
  //   setPrefCatStates(init);
  // }, [form.cookieCategories]);

  useEffect(() => {
    const catStates = {};
    const itemStates = {
      vendors: {},
      cookies: {},
    };

    const vendors = form.listsContent?.vendors || [];
    const cookies = form.listsContent?.cookies || [];

    form.cookieCategories.forEach((c, ci) => {
      catStates[ci] = !!c.default;
    });

    vendors.forEach((it, ii) => {
      itemStates.vendors[ii] = !!it.default;
    });

    cookies.forEach((it, ii) => {
      itemStates.cookies[ii] = !!it.default;
    });

    setPrefCatStates(catStates);
    setPrefItemStates(itemStates);
  }, [form.cookieCategories, form.listsContent]);

  // navigation guards
  useEffect(() => {
    const handler = (e) => {
      if (!isDirtyRef.current) return;
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [isDirty]);

  useEffect(() => {
    const start = (url) => {
      if (
        isDirtyRef.current &&
        !confirm("You have unsaved changes. Leave anyway?")
      ) {
        router.events.emit("routeChangeError");
        throw "Abort route change.";
      }
    };
    router.events.on("routeChangeStart", start);
    return () => router.events.off("routeChangeStart", start);
  }, [isDirty]);

  // submit handler
  async function onSubmit(e) {
    e.preventDefault();
    setLoading(true);

    // 1) Build only the style slice you diff against
    // const updatedStyleConfig = {
    //   logo: form.logo,
    //   acceptColor: form.acceptColor,
    //   rejectColor: form.rejectColor,
    //   backgroundColor: form.backgroundColor,
    //   textColor: form.textColor,
    //   bannerStyles: form.bannerStyles,
    //   texts: form.texts,
    //   showPolicyLink: form.showPolicyLink,
    //   policyText: form.policyText,
    //   policyUrl: form.policyUrl,
    //   showImprintLink: form.showImprintLink,
    //   imprintText: form.imprintText,
    //   imprintUrl: form.imprintUrl,
    //   layout: form.layout,
    //   prefStyles: form.prefStyles,
    //   prefContent: form.prefContent,
    //   prefSectionStyles: form.prefSectionStyles,
    //   cookieCategories: form.cookieCategories,
    //   cookieListTitleColor: form.cookieListTitleColor,
    //   cookieListBgColor: form.cookieListBgColor,
    //   customCss: form.customCss,
    // }

    // 1) Build only the style slice you diff against
    const updatedStyleConfig = {
      logo: form.logo,
      backgroundColor: form.backgroundColor,
      textColor: form.textColor,
      bannerStyles: form.bannerStyles,
      texts: form.texts,
      bannerClose: form.bannerClose,
      showPolicyLink: form.showPolicyLink,
      policyText: form.policyText,
      policyUrl: form.policyUrl,
      showImprintLink: form.showImprintLink,
      imprintText: form.imprintText,
      imprintUrl: form.imprintUrl,
      policyLinkPosition: form.policyLinkPosition,
      linkStyles: form.linkStyles,
      bannerButtonStyles: form.bannerButtonStyles,
      layout: form.layout,
      showInlinePrefOnBanner: form.showInlinePrefOnBanner,
      showVendorList: form.showVendorList,
      showCookieList: form.showCookieList,
      prefHeaderText: form.prefHeaderText,
      prefHeaderLogo: form.prefHeaderLogo,
      prefContent: form.prefContent,
      showPrefPolicyLink: form.showPrefPolicyLink,
      prefPolicyText: form.prefPolicyText,
      prefPolicyUrl: form.prefPolicyUrl,
      prefPolicyLinkPosition: form.prefPolicyLinkPosition,
      prefPolicyLinkStyles: form.prefPolicyLinkStyles,
      prefBackIcon: form.prefBackIcon,
      prefStyles: form.prefStyles,
      prefButtonStyles: form.prefButtonStyles,
      cookieCategories: form.cookieCategories,
      prefSectionStyles: form.prefSectionStyles,
      listsContent: form.listsContent,
      listsStyles: form.listsStyles,
      prefFooterText: form.prefFooterText,
      prefFooterLogo: form.prefFooterLogo,
      customCss: form.customCss,
    };

    // 2) Compute the diff vs. the original baseline
    const newDiff = computeModifiedFields(
      baselineStyleConfig,
      updatedStyleConfig,
    );

    // 3) Pull in whatever overrides were already saved
    const oldOverrides = initialFormRef.current?.modifiedFields ?? {};

    // 4) Merge them (old + new), so unchanged keys stay around
    const mergedOverrides = { ...oldOverrides, ...newDiff };

    // 5) Prune any keys the user has reverted back to baseline
    Object.keys(mergedOverrides).forEach((path) => {
      const updatedVal = _.get(updatedStyleConfig, path);
      const baseVal = _.get(baselineStyleConfig, path);
      if (_.isEqual(updatedVal, baseVal)) {
        delete mergedOverrides[path];
      }
    });

    // 6) Decide whether overrides remain
    const overrideEnabledToSend = Object.keys(mergedOverrides).length > 0;

    // 7) Build your payload
    const payload = {
      domain: form.domain,
      sdkVersion: form.sdkVersion,
      bannerVersion: form.bannerVersion,
      status: form.status,
      templateKey: form.templateKey,
      templateVersion: form.templateVersion,
      overrideEnabled: overrideEnabledToSend,
      modifiedFields: mergedOverrides,
    };

    try {
      let savedConfigId = id;

      if (isNew) {
        const response = await CustomAxios.post(
          `${baseurl}/${initURL}/cmp/configs?wId=${router.query.wId}`,
          payload,
        );
        savedConfigId = response.data?._id;
        // seed the ref for any in‐place edits after creation
        initialFormRef.current = { modifiedFields: mergedOverrides };
      } else {
        await CustomAxios.patch(
          `${baseurl}/${initURL}/cmp/configs/${id}?wId=${router.query.wId}`,
          payload,
        );
        // overwrite the oldOverrides so future diffs start here
        initialFormRef.current.modifiedFields = mergedOverrides;
      }

      isDirtyRef.current = false;
      setIsDirty(false);
      toast.success("Changes saved successfully!");
      router.push({
        pathname: "/admin/scanner/banner-configs",
        query: savedConfigId ? { configId: savedConfigId } : {},
      });
    } catch (err) {
      console.error("Save error", err);
      toast.error("Unable to save config – please try again.");
    } finally {
      setLoading(false);
    }
  }

  console.log("form", form);

  // preview styling
  const {
    backgroundColor: bannerBg,
    textColor,
    bannerStyles: {
      borderRadius,
      boxShadow,
      padding,
      fontFamily,
      fontSize,
      textAlign,
      buttonAlign,
      linkAlign,
      orientation,
      alignItems,
      gap,
    },
    texts: { title, description, acceptAll, rejectAll, managePrefs },
    showPolicyLink,
    policyText,
    policyUrl,
    showImprintLink,
    imprintText,
    imprintUrl,
    layout: { type: layoutType, position },
    prefStyles: {
      prefHeaderBg,
      prefHeaderTextColor,
      bgColor: prefBg,
      headerColor: prefSubHeader,
      textColor: prefText,
      buttonBarBg,
      footerBg,
      footerTextColor,
      borderColor,
    },
    prefContent: {
      title: prefTitle,
      description: prefDescription,
      acceptAllText,
      saveAllText,
      rejectAllText,
    },
    prefSectionStyles,
    linkStyles: { decoration: linkDeco },
    customCss,
  } = form;

  //Show pref modal on banner (on bar layout, position left/right)
  const inlinePrefOnBanner =
    layoutType === "bar" &&
    (position === "left" || position === "right") &&
    form.showInlinePrefOnBanner;

  useEffect(() => {
    // When inlinePrefOnBanner is true: disable manage button.
    // When it's false: allow it to be enabled again.
    setForm((prev) => {
      const currentEnabled = prev.bannerButtonStyles.manage.enabled;
      const desiredEnabled = !inlinePrefOnBanner;

      if (currentEnabled === desiredEnabled) return prev; // no change

      return {
        ...prev,
        bannerButtonStyles: {
          ...prev.bannerButtonStyles,
          manage: {
            ...prev.bannerButtonStyles.manage,
            enabled: desiredEnabled,
          },
        },
      };
    });
  }, [inlinePrefOnBanner]);

  const bannerStyle = useMemo(() => {
    const base = {
      backgroundColor: bannerBg,
      color: textColor,
      fontFamily,
      fontSize,
      textAlign,
      buttonAlign,
      linkAlign,
      padding,
      borderRadius,
      boxShadow,
      display: orientation === "horizontal" ? "flex" : "block",
      alignItems: alignItems || "center",
      gap: gap || "1rem",
      flexWrap: "wrap",
      position: "absolute",
      zIndex: 10,
    };

    if (layoutType === "bar") {
      if (position === "top" || position === "bottom") {
        base.left = 0;
        base.right = 0;
        base[position] = 0;
      } else if (position === "left" || position === "right") {
        base.top = 0;
        base.bottom = 0;
        base[position] = 0;
        base.width = "320px";
        base.maxWidth = "90vw";
        base.display = "block";
        base.overflow = "hidden";
      }
    } else if (layoutType === "toast") {
      const [vert, hor] = (position || "bottom-right").split("-");
      base[vert] = "1rem";
      base[hor] = "1rem";
      base.width = "260px";
    } else if (layoutType === "floating") {
      const pos = position || "bottom-center";
      if (pos === "center") {
        base.top = "50%";
        base.left = "50%";
        base.transform = "translate(-50%, -50%)";
        base.width = "80%";
        base.maxWidth = "480px";
      } else if (pos === "top-center") {
        base.top = "1rem";
        base.left = "50%";
        base.transform = "translateX(-50%)";
        base.width = "80%";
        base.maxWidth = "480px";
      } else if (pos === "bottom-center") {
        base.bottom = "1rem";
        base.left = "50%";
        base.transform = "translateX(-50%)";
        base.width = "80%";
        base.maxWidth = "480px";
      } else {
        const [vert, hor] = pos.split("-");
        base[vert] = "1rem";
        base[hor] = "1rem";
        base.width = "80%";
        base.maxWidth = "480px";
      }
    } else if (layoutType === "center") {
      base.top = "50%";
      base.left = "50%";
      base.transform = "translate(-50%, -50%)";
    }

    return base;
  }, [
    bannerBg,
    textColor,
    fontFamily,
    fontSize,
    textAlign,
    buttonAlign,
    linkAlign,
    padding,
    borderRadius,
    boxShadow,
    orientation,
    layoutType,
    position,
    alignItems,
    gap,
  ]);

  const layoutPositionOptions = useMemo(() => {
    switch (form.layout.type) {
      case "bar":
        return [
          { value: "top", label: "Top (full width)" },
          { value: "bottom", label: "Bottom (full width)" },
          { value: "left", label: "Left (full height)" },
          { value: "right", label: "Right (full height)" },
        ];
      case "toast":
        return [
          { value: "top-left", label: "Top Left" },
          { value: "top-right", label: "Top Right" },
          { value: "bottom-left", label: "Bottom Left" },
          { value: "bottom-right", label: "Bottom Right" },
        ];
      case "floating":
        return [
          { value: "center", label: "Center" },
          { value: "top-center", label: "Top Center" },
          { value: "bottom-center", label: "Bottom Center" },
          { value: "top-left", label: "Top Left" },
          { value: "top-right", label: "Top Right" },
          { value: "bottom-left", label: "Bottom Left" },
          { value: "bottom-right", label: "Bottom Right" },
        ];
      case "center":
        return [{ value: "center", label: "Center (both axes)" }];
      default:
        return [];
    }
  }, [form.layout.type]);

  // ←— ADD THIS EFFECT:
  useEffect(() => {
    const valid = layoutPositionOptions.find(
      (o) => o.value === form.layout.position,
    );
    if (!valid && layoutPositionOptions.length > 0) {
      markDirty();
      setForm((f) => ({
        ...f,
        layout: {
          ...f.layout,
          position: layoutPositionOptions[0].value,
        },
      }));
    }
  }, [layoutPositionOptions]); // runs whenever type (hence options) changes

  // after const { form, setForm, markDirty } and after you derive layoutType:
  // useEffect(() => {
  //   if (
  //     form.layout.type === "toast" ||
  //     form.layout.type === "floating" ||
  //     form.layout.type === "center"
  //   ) {
  //     // only flip if not already vertical
  //     if (form.bannerStyles.orientation !== "vertical") {
  //       markDirty();
  //       setForm((f) => ({
  //         ...f,
  //         bannerStyles: {
  //           ...f.bannerStyles,
  //           orientation: "vertical",
  //         },
  //       }));
  //     }
  //   }
  // }, [form.layout.type]);

  const isCompactLayout =
    layoutType === "toast" ||
    layoutType === "floating" ||
    (layoutType === "bar" && (position === "left" || position === "right"));

  const growButtonsRow =
    isCompactLayout && !form.bannerButtonStyles.stackButtons;

  const toJustify = (a) =>
    a === "center" ? "center" : a === "right" ? "flex-end" : "flex-start";

  const btnForm = (s, grow = false) => {
    let flexGrow = 0;
    let flexShrink = 0;
    let flexBasis = "auto";

    if (grow) {
      if (layoutType === "floating" && orientation === "horizontal") {
        flexGrow = 1;
        flexShrink = 0;
        flexBasis = "45%";
      } else {
        flexGrow = 1;
        flexShrink = 0;
        flexBasis = "0";
      }
    }

    return {
      backgroundColor: s.bg,
      color: s.text,
      padding: s.padding,
      borderRadius: s.borderRadius,
      border: `${s.borderWidth} solid ${s.borderColor}`,
      transition: s.transition,
      cursor: "pointer",
      fontWeight: s.fontWeight ?? 500,
      flexGrow,
      flexShrink,
      flexBasis,
      width: "auto",
      textAlign: "center",
      textDecoration: s.underline ? "underline" : "none",
    };
  };

  const buttonContainerStyle = (
    { stackButtons, buttonAlign },
    isCompactLayout,
  ) => {
    if (stackButtons) {
      // Stacked in ALL layouts
      const base = {
        flexDirection: "column",
        paddingTop: "5px",
      };

      if (isCompactLayout) {
        // stacked buttons should fill the full width of the banner
        return {
          ...base,
          width: "100%",
          alignItems: "stretch",
        };
      }

      // bar top/bottom: stacked but NOT full-width
      return {
        ...base,
        alignItems:
          buttonAlign === "center"
            ? "center"
            : buttonAlign === "right"
              ? "flex-end"
              : "flex-start",
      };
    }

    // Not stacked:
    if (isCompactLayout) {
      const compactBase = {
        flexDirection: "row",
        paddingTop: "5px",
        width: "100%",
        justifyContent:
          buttonAlign === "right"
            ? "flex-end"
            : buttonAlign === "center"
              ? "center"
              : "flex-start",
      };

      return compactBase;
    }

    // Normal bar (top / bottom), non-stacked
    return {
      justifyContent:
        buttonAlign === "right"
          ? "flex-end"
          : buttonAlign === "center"
            ? "center"
            : "flex-start",
      marginLeft: buttonAlign === "right" ? "auto" : undefined,
    };
  };

  if (loading) return <p>Loading…</p>;

  return (
    <div className="p-8">
      <div className="grid lg:grid-cols-3 gap-8">
        {/* LEFT PANEL: FORM */}
        <aside className="lg:col-span-1 max-h-[calc(100vh-4rem)] overflow-auto bg-gray-50 rounded-lg shadow-lg">
          <form onSubmit={onSubmit} className="space-y-6 mb-8 p-6">
            <h1 className="text-2xl font-bold">
              {isNew
                ? "New Banner Config"
                : `Edit Config: ${form.domain} (${form.bannerVersion})`}
            </h1>

            {/* Config fields */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium">Domain</label>
                <input
                  name="domain"
                  value={form.domain}
                  onChange={onChange}
                  placeholder="Domain"
                  // required
                  readOnly
                  disabled
                  className="w-full border px-3 py-2 rounded"
                />
              </div>

              <div>
                <label className="block text-sm font-medium">SDK Version</label>
                <input
                  name="sdkVersion"
                  value={form.sdkVersion}
                  onChange={onChange}
                  placeholder="SDK Version"
                  required
                  className="w-full border px-3 py-2 rounded"
                />
              </div>

              <div>
                <label className="block text-sm font-medium">
                  Banner Version
                </label>
                {!isNew && (
                  <input
                    name="bannerVersion"
                    value={form.bannerVersion}
                    readOnly
                    disabled
                    className="w-full bg-gray-100 border px-3 py-2 rounded"
                  />
                )}
              </div>

              <div>
                <label className="block text-sm font-medium">Status</label>
                <select
                  name="status"
                  value={form.status}
                  onChange={onChange}
                  className="w-full border px-3 py-2 rounded"
                >
                  <option value="draft">Draft</option>
                  <option value="active">Active</option>
                </select>
              </div>

              {/* Template picker */}
              <div>
                <label className="block text-sm font-medium">
                  Base Template
                </label>
                <select
                  value={selectedTemplate}
                  onChange={(e) => setSelectedTemplate(e.target.value)}
                  className="mt-1 block w-full border rounded px-3 py-2"
                >
                  <option value="">— Select base template —</option>
                  {templates.map((t) => (
                    <option
                      key={`${t.key}@${t.version}`}
                      value={`${t.key}@${t.version}`}
                    >
                      {t.key}@{t.version}
                    </option>
                  ))}
                </select>

                <div className="grid gap-4 md:grid-cols-2 mt-3">
                  <div>
                    <label className="block text-sm font-medium">
                      Template Key
                    </label>
                    <input
                      type="text"
                      value={form.templateKey}
                      disabled
                      className="mt-1 block w-full bg-gray-100 border rounded px-3 py-2 cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium">
                      Template Version
                    </label>
                    <input
                      type="text"
                      value={form.templateVersion}
                      disabled
                      className="mt-1 block w-full bg-gray-100 border rounded px-3 py-2 cursor-not-allowed"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* ==== BANNER CONFIGURATION ==== */}

            <div className="mt-2">
              <label className="text-xl font-semibold">Banner Section</label>
            </div>

            <Section id="banner-basics" title="Banner Basics">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm">Logo</label>
                  <input type="file" name="logo" onChange={onChange} />
                  {form.logo && (
                    <img
                      src={getImageSrc(form.logo)}
                      alt="Logo preview"
                      className="h-16 mt-2"
                    />
                  )}
                </div>
                {[
                  { name: "backgroundColor", label: "Background color" },
                  { name: "textColor", label: "Text color" },
                ].map(({ name, label }) => (
                  <div key={name}>
                    <label className="block text-sm">{label}</label>
                    <input
                      type="color"
                      name={name}
                      value={form[name]}
                      onChange={onChange}
                      className="h-10 w-16 p-0 border-0"
                    />
                  </div>
                ))}
              </div>
            </Section>

            {/* Banner Style Overrides */}
            <Section id="banner-style" title="Banner Style Overrides">
              {[
                {
                  name: "borderRadius",
                  label: "Border Radius",
                  placeholder: "0.5rem",
                },
                {
                  name: "boxShadow",
                  label: "Box Shadow",
                  placeholder: "0 2px 8px rgba(0, 0, 0, 0.1)",
                },
                { name: "padding", label: "Padding", placeholder: "1rem" },
                {
                  name: "fontFamily",
                  label: "Font Family",
                  placeholder: "Arial",
                },
                { name: "fontSize", label: "Font Size", placeholder: "1rem" },
                {
                  name: "textAlign",
                  label: "Text Align",
                  type: "select",
                  options: ["left", "center", "right"],
                },
                {
                  name: "gap",
                  label: "Banner Gap",
                  placeholder: "1rem",
                },
                {
                  name: "alignItems",
                  label: "Banner Align",
                  type: "select",
                  options: ["start", "center", "end"],
                },
                {
                  name: "buttonAlign",
                  label: "Button Align",
                  type: "select",
                  options: ["left", "center", "right"],
                },
                {
                  name: "linkAlign",
                  label: "Link Align",
                  type: "select",
                  options: ["left", "center", "right"],
                },
                {
                  name: "orientation",
                  label: "Orientation",
                  type: "select",
                  options: ["horizontal", "vertical"],
                },
              ].map((fld) => (
                <div key={fld.name} className="mb-3">
                  <label className="block text-sm">{fld.label}</label>
                  {fld.type === "select" ? (
                    <select
                      name={fld.name}
                      data-group="bannerStyles"
                      value={form.bannerStyles[fld.name]}
                      onChange={onChange}
                      className="border px-2 py-1 rounded w-full"
                    >
                      {fld.options.map((o) => (
                        <option key={o} value={o}>
                          {o}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      name={fld.name}
                      data-group="bannerStyles"
                      value={form.bannerStyles[fld.name]}
                      onChange={onChange}
                      placeholder={fld.placeholder}
                      className="w-full border px-2 py-1 rounded"
                    />
                  )}
                </div>
              ))}
            </Section>

            {/* Banner Content */}
            <Section id="banner-content" title="Banner Content">
              {[
                { name: "title", label: "Title" },
                { name: "description", label: "Description" },
                { name: "acceptAll", label: "Accept Button text" },
                { name: "rejectAll", label: "Reject Button Text" },
                { name: "managePrefs", label: "Manage Button Text" },
              ].map(({ name, label }) => (
                <div key={name}>
                  <label className="block text-sm">{label}</label>
                  {name === "description" ? (
                    <textarea
                      name="description"
                      data-group="texts"
                      value={form.texts.description}
                      onChange={onChange}
                      placeholder="Description"
                      rows={3}
                      className="w-full border px-2 py-1 rounded mb-2"
                    />
                  ) : (
                    <input
                      key={name}
                      name={name}
                      data-group="texts"
                      value={form.texts[name]}
                      onChange={onChange}
                      placeholder={name.charAt(0).toUpperCase() + name.slice(1)}
                      className="w-full border px-2 py-1 rounded mb-2"
                    />
                  )}
                </div>
              ))}
            </Section>

            <Section id="banner-buttons" title="Banner Buttons">
              <div className="flex flex-col gap-1 mb-3">
                <ButtonStyleEditor
                  title="Accept"
                  path="bannerButtonStyles.accept"
                  styles={form.bannerButtonStyles.accept}
                  onChange={onChange}
                />
                <ButtonStyleEditor
                  title="Reject"
                  path="bannerButtonStyles.reject"
                  styles={form.bannerButtonStyles.reject}
                  onChange={onChange}
                />
                <ButtonStyleEditor
                  title="Preference"
                  path="bannerButtonStyles.manage"
                  styles={form.bannerButtonStyles.manage}
                  onChange={onChange}
                />
              </div>
              <div>
                <Toggle
                  id="toggle-split-manage-button"
                  label="Separate Manage button"
                  checked={!!form.bannerButtonStyles.splitManageButton}
                  onChange={(v) => {
                    markDirty();
                    setForm((f) => ({
                      ...f,
                      bannerButtonStyles: {
                        ...f.bannerButtonStyles,
                        splitManageButton: v,
                      },
                    }));
                  }}
                />
              </div>
              <div className="mt-2">
                <Toggle
                  id="toggle-stack-buttons"
                  label="Stack buttons"
                  checked={form.bannerButtonStyles.stackButtons}
                  onChange={(v) => {
                    markDirty();
                    setForm((f) => ({
                      ...f,
                      bannerButtonStyles: {
                        ...f.bannerButtonStyles,
                        stackButtons: v,
                      },
                    }));
                  }}
                />
              </div>
            </Section>

            {/* Banner Links */}
            <Section id="banner-links" title="Banner Links">
              <Toggle
                id="toggle-policy"
                label="Show Cookie Policy"
                checked={form.showPolicyLink}
                onChange={(v) => {
                  markDirty();
                  setForm((f) => ({ ...f, showPolicyLink: v }));
                }}
              />
              {form.showPolicyLink && (
                <>
                  <div>
                    <label className="block text-sm">Text</label>
                    <input
                      name="policyText"
                      value={form.policyText}
                      onChange={onChange}
                      placeholder="Link text"
                      className="w-full border px-2 py-1 rounded mb-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm">URL</label>
                    <input
                      name="policyUrl"
                      value={form.policyUrl}
                      onChange={onChange}
                      placeholder="URL"
                      className="w-full border px-2 py-1 rounded mb-2"
                    />
                  </div>
                  <div className="mb-3">
                    <label className="block text-sm">Link Position</label>
                    <select
                      name="policyLinkPosition"
                      value={form.policyLinkPosition}
                      onChange={onChange}
                      className="border px-2 py-1 rounded w-full"
                    >
                      <option value="separate">separate</option>
                      <option value="inline">inline</option>
                    </select>
                  </div>
                </>
              )}

              {/* Imprint link */}
              <Toggle
                id="toggle-imprint"
                label="Show Imprint"
                checked={form.showImprintLink}
                onChange={(v) => {
                  markDirty();
                  setForm((f) => ({ ...f, showImprintLink: v }));
                }}
              />
              {form.showImprintLink && (
                <>
                  <div>
                    <label className="block text-sm">Text</label>
                    <input
                      name="imprintText"
                      value={form.imprintText}
                      onChange={onChange}
                      placeholder="Text"
                      className="w-full border px-2 py-1 rounded mb-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm">URL</label>
                    <input
                      name="imprintUrl"
                      value={form.imprintUrl}
                      onChange={onChange}
                      placeholder="URL"
                      className="w-full border px-2 py-1 rounded"
                    />
                  </div>
                </>
              )}

              {/* Link styles */}
              <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm">Link Color</label>
                  <input
                    type="color"
                    name="textColor"
                    data-group="linkStyles"
                    value={form.linkStyles.textColor}
                    onChange={onChange}
                    className="h-10 w-16 p-0 border-0"
                  />
                </div>
                <div className="flex items-center">
                  <Toggle
                    id="toggle-link-underline"
                    label="Underline Links"
                    checked={form.linkStyles.decoration === "underline"}
                    onChange={(v) => {
                      markDirty();
                      setForm((f) => ({
                        ...f,
                        linkStyles: {
                          ...f.linkStyles,
                          decoration: v ? "underline" : "none",
                        },
                      }));
                    }}
                  />
                </div>
              </div>
            </Section>

            <Section id="banner-close" title="Banner Close (x)">
              <Toggle
                id="toggle-banner-close"
                label="Show Close (×) on Banner"
                checked={form.bannerClose.enabled}
                onChange={(v) => {
                  markDirty();
                  setForm((f) => ({
                    ...f,
                    bannerClose: { ...f.bannerClose, enabled: v },
                  }));
                }}
              />

              {form.bannerClose.enabled && (
                <div className="mt-3 grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-sm">Color</label>
                    <input
                      type="color"
                      name="color"
                      data-group="bannerClose"
                      value={form.bannerClose.color}
                      onChange={onChange}
                      className="h-10 w-16 p-0 border-0"
                    />
                  </div>

                  <div>
                    <label className="block text-sm">Background color</label>
                    <input
                      type="color"
                      name="bg"
                      data-group="bannerClose"
                      value={form.bannerClose.bg}
                      onChange={onChange}
                      className="h-10 w-16 p-0 border-0"
                    />
                  </div>

                  <div>
                    <label className="block text-sm">Border Color</label>
                    <input
                      type="color"
                      name="borderColor"
                      data-group="bannerClose"
                      value={form.bannerClose.borderColor}
                      onChange={onChange}
                      className="h-10 w-16 p-0 border-0"
                    />
                  </div>

                  <div>
                    <label className="block text-sm">Border Width</label>
                    <input
                      name="borderWidth"
                      data-group="bannerClose"
                      value={form.bannerClose.borderWidth}
                      onChange={onChange}
                      placeholder="1px"
                      className="w-full border rounded px-2 py-1"
                    />
                  </div>

                  <div>
                    <label className="block text-sm">Font Size</label>
                    <input
                      name="size"
                      data-group="bannerClose"
                      value={form.bannerClose.size}
                      onChange={onChange}
                      placeholder="18px"
                      className="w-full border rounded px-2 py-1"
                    />
                  </div>

                  <div>
                    <label className="block text-sm">Padding</label>
                    <input
                      name="padding"
                      data-group="bannerClose"
                      value={form.bannerClose.padding}
                      onChange={onChange}
                      placeholder="0.25rem"
                      className="w-full border rounded px-2 py-1"
                    />
                  </div>

                  <div>
                    <label className="block text-sm">Border Radius</label>
                    <input
                      name="borderRadius"
                      data-group="bannerClose"
                      value={form.bannerClose.borderRadius}
                      onChange={onChange}
                      placeholder="9999px"
                      className="w-full border rounded px-2 py-1"
                    />
                  </div>

                  <div>
                    <label className="block text-sm">Top/Right Offset</label>
                    <input
                      name="offset"
                      data-group="bannerClose"
                      value={form.bannerClose.offset}
                      onChange={onChange}
                      placeholder="0.5rem"
                      className="w-full border rounded px-2 py-1"
                    />
                  </div>

                  <div className="flex items-center pt-5">
                    <Toggle
                      id="toggle-banner-close-bold"
                      label="Bold"
                      checked={form.bannerClose.bold}
                      onChange={(v) => {
                        markDirty();
                        setForm((f) => ({
                          ...f,
                          bannerClose: { ...f.bannerClose, bold: v },
                        }));
                      }}
                    />
                  </div>
                </div>
              )}
            </Section>

            {/* Banner Layout */}
            <Section id="banner-layout" title="Banner Layout">
              <label className="block text-sm">Layout Type</label>
              <select
                name="type"
                data-group="layout"
                value={form.layout.type}
                onChange={onChange}
                className="border px-2 py-1 rounded w-full mb-2"
              >
                {["bar", "toast", "floating", "center"].map((t) => (
                  <option key={t} value={t}>
                    {t.charAt(0).toUpperCase() + t.slice(1)}
                  </option>
                ))}
              </select>
              <label className="block text-sm mb-2">Position</label>
              <select
                name="position"
                data-group="layout"
                value={form.layout.position}
                onChange={onChange}
                className="border px-2 py-1 rounded w-full mb-2"
              >
                {layoutPositionOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>

              {/* Option to show/hide Preference modal below banner content */}
              {form.layout.type === "bar" &&
                (form.layout.position === "left" ||
                  form.layout.position === "right") && (
                  <Toggle
                    id="toggle-inline-pref-on-banner"
                    label="Show preference center"
                    checked={!!form.showInlinePrefOnBanner}
                    onChange={(v) => {
                      markDirty();
                      setForm((f) => ({ ...f, showInlinePrefOnBanner: v }));
                    }}
                  />
                )}
            </Section>

            {/* ==== PREFERENCE CENTER CONFIGURATION ==== */}
            <div className="mt-2">
              <label className="text-xl font-semibold">
                Preference Section
              </label>
            </div>

            <Section id="pref-header" title="Preference Modal Header">
              <div className="grid grid-cols-1 gap-3">
                <div>
                  <label className="block text-sm">Header Logo</label>
                  <input
                    type="file"
                    name="prefHeaderLogo"
                    onChange={onChange}
                  />
                  {form.prefHeaderLogo && (
                    <img
                      src={getImageSrc(form.prefHeaderLogo)}
                      alt="Header logo preview"
                      className="h-8 mt-2"
                    />
                  )}
                </div>

                <div>
                  <label className="block text-sm">Header Text</label>
                  <input
                    name="prefHeaderText"
                    value={form.prefHeaderText}
                    onChange={onChange}
                    placeholder="e.g., Company name"
                    className="w-full border rounded px-2 py-1"
                  />
                </div>
              </div>
            </Section>

            <Section id="pref-content" title="Preference Center Content">
              {[
                { name: "title", label: "Title" },
                { name: "description", label: "Description" },
                { name: "acceptAllText", label: "Accept Button text" },
                { name: "saveAllText", label: "Save Button text" },
                { name: "rejectAllText", label: "Reject Button Text" },
              ].map(({ name, label }) => (
                <div key={name}>
                  <label className="block text-sm">{label}</label>

                  {name === "description" ? (
                    <textarea
                      name="description"
                      data-group="prefContent"
                      value={form.prefContent.description}
                      onChange={onChange}
                      placeholder="Description"
                      rows={3}
                      className="w-full border px-2 py-1 rounded mb-2"
                    />
                  ) : (
                    <input
                      name={name}
                      data-group="prefContent"
                      value={form.prefContent[name]}
                      onChange={onChange}
                      placeholder={name.charAt(0).toUpperCase() + name.slice(1)}
                      className="w-full border px-2 py-1 rounded mb-2"
                    />
                  )}
                </div>
              ))}
            </Section>

            <Section id="pref-link" title="Preference Center Link">
              <Toggle
                id="toggle-moreinfo"
                label="Add more links"
                checked={form.showPrefPolicyLink}
                onChange={(v) => {
                  markDirty();
                  setForm((f) => ({ ...f, showPrefPolicyLink: v }));
                }}
              />

              {form.showPrefPolicyLink && (
                <>
                  <div>
                    <label className="block text-sm">Text</label>
                    <input
                      name="prefPolicyText"
                      value={form.prefPolicyText}
                      onChange={onChange}
                      placeholder="Link text"
                      className="w-full border px-2 py-1 rounded mb-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm">URL</label>
                    <input
                      name="prefPolicyUrl"
                      value={form.prefPolicyUrl}
                      onChange={onChange}
                      placeholder="URL"
                      className="w-full border px-2 py-1 rounded mb-3"
                    />
                  </div>

                  <div className="mb-3">
                    <label className="block text-sm">Link Position</label>
                    <select
                      name="prefPolicyLinkPosition"
                      value={form.prefPolicyLinkPosition}
                      onChange={onChange}
                      className="border px-2 py-1 rounded w-full"
                    >
                      <option value="separate">separate</option>
                      <option value="inline">inline</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm">Link Color</label>
                      <input
                        type="color"
                        name="textColor"
                        data-group="prefPolicyLinkStyles"
                        value={form.prefPolicyLinkStyles.textColor}
                        onChange={onChange}
                        className="h-10 w-16 p-0 border-0"
                      />
                    </div>
                    <div className="flex items-center pt-5">
                      <Toggle
                        id="toggle-moreinfo-underline"
                        label="Underline"
                        checked={
                          form.prefPolicyLinkStyles.decoration === "underline"
                        }
                        onChange={(v) => {
                          markDirty();
                          setForm((f) => ({
                            ...f,
                            prefPolicyLinkStyles: {
                              ...f.prefPolicyLinkStyles,
                              decoration: v ? "underline" : "none",
                            },
                          }));
                        }}
                      />
                    </div>
                  </div>
                </>
              )}
            </Section>

            <Section id="pref-styles" title="Preference Center Styles">
              <div className="grid grid-cols-3 gap-2">
                {[
                  { name: "prefHeaderBg", label: "Header BG" },
                  { name: "prefHeaderTextColor", label: "Header text" },
                  { name: "bgColor", label: "Center BG" },
                  { name: "headerColor", label: "Center Header" },
                  { name: "textColor", label: "Center Body Text" },
                  { name: "buttonBarBg", label: "Buttons Bar BG" },
                  { name: "footerBg", label: "Footer BG" },
                  { name: "footerTextColor", label: "Footer text" },
                  { name: "borderColor", label: "Border" },
                ].map(({ name, label }) => (
                  <div key={name} className="mb-2">
                    <label className="block text-sm">{label}</label>
                    <input
                      type="color"
                      name={name}
                      data-group="prefStyles"
                      value={form.prefStyles[name]}
                      onChange={onChange}
                      className="h-10 w-16 p-0 border-0"
                    />
                  </div>
                ))}
              </div>
            </Section>

            <Section id="pref-section-styles" title="Preference Section Styles">
              <div className="grid grid-cols-3 gap-2">
                {[
                  { name: "categoryTitleBg", label: "Category Title BG" },
                  { name: "categoryTitleText", label: "Category Title text" },
                  { name: "categoryDescBg", label: "Category Desc BG" },
                  { name: "categoryDescText", label: "Category Desc text" },
                  { name: "borderColor", label: "Border color" },
                ].map(({ name, label }) => (
                  <div key={name} className="mb-2">
                    <label className="block text-sm">{label}</label>
                    <input
                      type="color"
                      name={name}
                      data-group="prefSectionStyles"
                      value={form.prefSectionStyles[name]}
                      onChange={onChange}
                      className="h-10 w-16 p-0 border-0"
                    />
                  </div>
                ))}

                <div className="mb-2">
                  <label className="block text-sm">Border Radius</label>
                  <input
                    name="borderRadius"
                    data-group="prefSectionStyles"
                    value={form.prefSectionStyles.borderRadius}
                    onChange={onChange}
                    placeholder="0.375rem"
                    className="w-full border px-2 py-1 rounded"
                  />
                </div>

                <div className="mb-2">
                  <label className="block text-sm">Title Padding</label>
                  <input
                    name="titlePadding"
                    data-group="prefSectionStyles"
                    value={form.prefSectionStyles.titlePadding}
                    onChange={onChange}
                    placeholder="0.75rem"
                    className="w-full border px-2 py-1 rounded"
                  />
                </div>

                <div className="mb-2">
                  <label className="block text-sm">Desc Padding</label>
                  <input
                    name="descPadding"
                    data-group="prefSectionStyles"
                    value={form.prefSectionStyles.descPadding}
                    onChange={onChange}
                    placeholder="0.75rem"
                    className="w-full border px-2 py-1 rounded"
                  />
                </div>

                <div className="mb-2">
                  <label className="block text-sm">Icon &amp; Title Gap</label>
                  <input
                    name="iconTitleGap"
                    data-group="prefSectionStyles"
                    value={form.prefSectionStyles.iconTitleGap}
                    onChange={onChange}
                    className="w-full border px-2 py-1 rounded"
                    placeholder="0.5rem"
                  />
                </div>

                <div className="mb-2">
                  <label className="block text-sm">Title Font Size</label>
                  <input
                    name="titleFontSize"
                    data-group="prefSectionStyles"
                    value={form.prefSectionStyles.titleFontSize}
                    onChange={onChange}
                    className="w-full border px-2 py-1 rounded"
                    placeholder="0.9rem"
                  />
                </div>

                <div className="mb-2">
                  <label className="block text-sm">Title Font Weight</label>
                  <input
                    name="titleFontWeight"
                    data-group="prefSectionStyles"
                    value={form.prefSectionStyles.titleFontWeight}
                    onChange={onChange}
                    className="w-full border px-2 py-1 rounded"
                    placeholder="500"
                  />
                </div>

                <div className="mb-2">
                  <label className="block text-sm">Desc Font Size</label>
                  <input
                    name="descFontSize"
                    data-group="prefSectionStyles"
                    value={form.prefSectionStyles.descFontSize}
                    onChange={onChange}
                    className="w-full border px-2 py-1 rounded"
                    placeholder="0.85rem"
                  />
                </div>

                <div className="mb-2">
                  <label className="block text-sm">Desc Font Weight</label>
                  <input
                    name="descFontWeight"
                    data-group="prefSectionStyles"
                    value={form.prefSectionStyles.descFontWeight}
                    onChange={onChange}
                    className="w-full border px-2 py-1 rounded"
                    placeholder="400"
                  />
                </div>

                <div className="mb-2">
                  <label className="block text-sm">Desc Line Height</label>
                  <input
                    name="descLineHeight"
                    data-group="prefSectionStyles"
                    value={form.prefSectionStyles.descLineHeight}
                    onChange={onChange}
                    className="w-full border px-2 py-1 rounded"
                    placeholder="1.5"
                  />
                </div>
              </div>
            </Section>

            <Section id="pref-buttons" title="Preference Modal Buttons">
              <div className="flex flex-col gap-1 mb-3">
                <ButtonStyleEditor
                  title="Accept"
                  path="prefButtonStyles.acceptAll"
                  styles={form.prefButtonStyles.acceptAll}
                  onChange={onChange}
                />
                <ButtonStyleEditor
                  title="Save"
                  path="prefButtonStyles.saveAll"
                  styles={form.prefButtonStyles.saveAll}
                  onChange={onChange}
                />
                <ButtonStyleEditor
                  title="Reject"
                  path="prefButtonStyles.rejectAll"
                  styles={form.prefButtonStyles.rejectAll}
                  onChange={onChange}
                />
              </div>
            </Section>

            <Section id="pref-footer" title="Preference Modal Footer">
              <div className="grid grid-cols-1 gap-3">
                <div>
                  <label className="block text-sm">Logo</label>
                  <input
                    type="file"
                    name="prefFooterLogo"
                    onChange={onChange}
                  />
                  {form.prefFooterLogo && (
                    <img
                      src={getImageSrc(form.prefFooterLogo)}
                      alt="Footer logo preview"
                      className="h-6 mt-2"
                    />
                  )}
                </div>
                <div>
                  <label className="block text-sm">Text</label>
                  <input
                    name="prefFooterText"
                    value={form.prefFooterText}
                    onChange={onChange}
                    placeholder="Company name"
                    className="w-full border rounded px-2 py-1"
                  />
                </div>
              </div>
            </Section>

            {/* Cookie Categories */}
            <Section id="cookie-categories" title="Cookie Categories">
              {form.cookieCategories.map((cat, i) => (
                <div
                  key={i}
                  className="mb-4 bg-white border border-gray-200 rounded p-4 relative"
                >
                  <button
                    type="button"
                    onClick={() => removeCategory(i)}
                    className="absolute top-2 right-2 text-red-500"
                    aria-label={`Remove ${cat.name}`}
                  >
                    ×
                  </button>
                  <div className="mb-2">
                    <label className="block text-sm">Icon</label>
                    <input
                      type="file"
                      name="icon"
                      data-group="cookieCategories"
                      data-index={i}
                      onChange={onChange}
                    />
                    {cat.icon && (
                      <img
                        src={getImageSrc(cat.icon)}
                        alt="Icon preview"
                        className="h-6 mt-2"
                      />
                    )}
                  </div>
                  <div>
                    <label className="block text-sm">Title</label>
                    <input
                      name="name"
                      data-group="cookieCategories"
                      data-index={i}
                      value={cat.name}
                      onChange={onChange}
                      placeholder="Category Name"
                      className="w-full border px-2 py-1 rounded mb-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm">Description</label>
                    <textarea
                      name="description"
                      data-group="cookieCategories"
                      data-index={i}
                      value={cat.description}
                      onChange={onChange}
                      placeholder="Description"
                      className="w-full border px-2 py-1 rounded mb-2"
                    />
                  </div>
                  <Toggle
                    id={`toggle-cookie-editor-${i}`}
                    label="Default Enabled"
                    checked={cat.default}
                    onChange={(v) => {
                      markDirty();
                      setForm((f) => ({
                        ...f,
                        cookieCategories: f.cookieCategories.map((c, j) =>
                          j === i ? { ...c, default: v } : c,
                        ),
                      }));
                    }}
                  />
                </div>
              ))}
              <button
                type="button"
                onClick={addCategory}
                className="px-4 py-2 bg-blue-600 text-white rounded"
              >
                Add Category
              </button>
            </Section>

            {/* Preference Lists */}
            <Section id="preference-lists" title="Preference Lists">
              <div className="space-y-4">
                {/* Vendor list */}
                <Toggle
                  id="toggle-global-vendor-list"
                  label="Show Vendor List"
                  checked={!!form.showVendorList}
                  onChange={(v) => {
                    markDirty();
                    setForm((f) => ({ ...f, showVendorList: v }));
                  }}
                />
                {form.showVendorList && (
                  <ListEditor
                    listKey="vendors"
                    titlePlaceholder="e.g., Vendors list"
                    markDirty={markDirty}
                    setForm={setForm}
                    listsContent={form.listsContent}
                  />
                )}

                {/* Cookie list */}
                <Toggle
                  id="toggle-global-cookie-list"
                  label="Show Cookie List"
                  checked={!!form.showCookieList}
                  onChange={(v) => {
                    markDirty();
                    setForm((f) => ({ ...f, showCookieList: v }));
                  }}
                />
                {form.showCookieList && (
                  <ListEditor
                    listKey="cookies"
                    titlePlaceholder="e.g., Cookies list"
                    markDirty={markDirty}
                    setForm={setForm}
                    listsContent={form.listsContent}
                  />
                )}
              </div>
            </Section>

            {/* Cookie List Styles */}
            <Section id="cookie-list-styles" title="Cookie List Styles">
              <div className="grid grid-cols-3 gap-2">
                {[
                  { name: "bgColor", label: "Body BG" },
                  { name: "headerColor", label: "Header Text" },
                  { name: "textColor", label: "Body Text" },
                  { name: "listTitleBg", label: "List Title BG" },
                  { name: "listTitleText", label: "List Title Text" },
                  { name: "listDescBg", label: "List Desc BG" },
                  { name: "listDescText", label: "List Desc text" },
                  { name: "dataBgColor", label: "Cookie Data BG" },
                  { name: "dataTextColor", label: "Cookie Data Text" },
                  { name: "borderColor", label: "Border Color" },
                ].map(({ name, label }) => (
                  <div key={name} className="mb-2">
                    <label className="block text-sm">{label}</label>
                    <input
                      type="color"
                      name={name}
                      data-group="listsStyles"
                      value={form.listsStyles[name]}
                      onChange={onChange}
                      className="h-10 w-16 p-0 border-0"
                    />
                  </div>
                ))}

                <div className="mb-2">
                  <label className="block text-sm">Border Radius</label>
                  <input
                    name="borderRadius"
                    data-group="listsStyles"
                    value={form.listsStyles.borderRadius}
                    onChange={onChange}
                    className="w-full border px-2 py-1 rounded"
                    placeholder="0.9rem"
                  />
                </div>

                <div className="mb-2">
                  <label className="block text-sm">Title Padding</label>
                  <input
                    name="titlePadding"
                    data-group="listsStyles"
                    value={form.listsStyles.titlePadding ?? ""}
                    onChange={onChange}
                    className="w-full border px-2 py-1 rounded"
                    placeholder="0.75rem"
                  />
                </div>

                <div className="mb-2">
                  <label className="block text-sm">Desc Padding</label>
                  <input
                    name="descPadding"
                    data-group="listsStyles"
                    value={form.listsStyles.descPadding ?? ""}
                    onChange={onChange}
                    className="w-full border px-2 py-1 rounded"
                    placeholder="0.75rem"
                  />
                </div>

                <div className="mb-2">
                  <label className="block text-sm">Cookie Data Pad</label>
                  <input
                    name="dataPadding"
                    data-group="listsStyles"
                    value={form.listsStyles.dataPadding}
                    onChange={onChange}
                    className="w-full border px-2 py-1 rounded"
                    placeholder="0.5rem"
                  />
                </div>

                <div className="mb-2">
                  <label className="block text-sm">Title Font Size</label>
                  <input
                    name="titleFontSize"
                    data-group="listsStyles"
                    value={form.listsStyles.titleFontSize}
                    onChange={onChange}
                    className="w-full border px-2 py-1 rounded"
                    placeholder="0.9rem"
                  />
                </div>

                <div className="mb-2">
                  <label className="block text-sm">Title Font Weight</label>
                  <input
                    name="titleFontWeight"
                    data-group="listsStyles"
                    value={form.listsStyles.titleFontWeight}
                    onChange={onChange}
                    className="w-full border px-2 py-1 rounded"
                    placeholder="500"
                  />
                </div>

                <div className="mb-2">
                  <label className="block text-sm">Desc Font Size</label>
                  <input
                    name="descFontSize"
                    data-group="listsStyles"
                    value={form.listsStyles.descFontSize}
                    onChange={onChange}
                    className="w-full border px-2 py-1 rounded"
                    placeholder="0.85rem"
                  />
                </div>

                <div className="mb-2">
                  <label className="block text-sm">Desc Font Weight</label>
                  <input
                    name="descFontWeight"
                    data-group="listsStyles"
                    value={form.listsStyles.descFontWeight}
                    onChange={onChange}
                    className="w-full border px-2 py-1 rounded"
                    placeholder="400"
                  />
                </div>

                <div className="mb-2">
                  <label className="block text-sm">Desc Line Height</label>
                  <input
                    name="descLineHeight"
                    data-group="listsStyles"
                    value={form.listsStyles.descLineHeight}
                    onChange={onChange}
                    className="w-full border px-2 py-1 rounded"
                    placeholder="1.5"
                  />
                </div>
              </div>
            </Section>

            {/* Custom CSS */}
            <Section id="custom-css" title="Custom CSS">
              <textarea
                name="customCss"
                value={form.customCss}
                onChange={onChange}
                rows={4}
                className="w-full border px-2 py-1 rounded font-mono text-xs"
                placeholder="Any extra CSS"
              />
            </Section>

            {/* Actions */}
            <div className="flex space-x-4">
              <button
                type="submit"
                className="px-6 py-2 bg-[#2B245C] text-white text-sm font-medium rounded-lg hover:bg-opacity-90"
              >
                {isNew ? "Create Config" : "Save Config"}
              </button>
              <button
                type="button"
                onClick={() => router.back()}
                className="px-6 py-2 bg-blue-50 border border-[#2B245C] text-[#2B245C] text-sm font-medium rounded-lg hover:bg-blue-100"
              >
                Cancel
              </button>
            </div>
          </form>
        </aside>

        {/* RIGHT PANEL: Live Preview */}
        <div className="lg:col-span-2 relative h-vh border rounded shadow bg-white overflow-hidden">
          <iframe
            src="https://dev.grc3.io"
            className="w-full h-full"
            // frameBorder="0"    //deprecated
            style={{ border: 0 }}
            title="Live preview"
          />

          <style
            dangerouslySetInnerHTML={{
              __html: makeFontCSS(
                ["#cmp-banner-preview", "#cmp-pref-preview"],
                form.bannerStyles.fontFamily,
              ),
            }}
          />

          {/* Responsiveness of buttons in mobile & tablet view */}
          <style
            dangerouslySetInnerHTML={{
              __html: `
                /* Mobile: stack full-width */

                @media (max-width: 640px) {
                  /* Banner buttons on mobile */
                  #cmp-banner-preview .cmp-banner-btn-row {
                    flex-direction: column !important;
                    width: 100% !important;
                    align-items: stretch !important;
                  }

                  #cmp-banner-preview .cmp-banner-btn {
                    width: 100% !important;
                    flex: 1 0 auto !important;
                  }

                  /* Preference buttons on mobile */
                  #cmp-pref-preview .cmp-pref-btn-row {
                    flex-direction: column !important;
                    width: 100% !important;
                    align-items: stretch !important;
                  }

                  #cmp-pref-preview .cmp-pref-btn {
                    width: 100% !important;
                    flex: 1 0 auto !important;
                  }
                }

                /* Tablet: let them wrap and take ~half width */
                @media (min-width: 640px) and (max-width: 1024px) {
                  #cmp-banner-preview .cmp-banner-btn {
                    flex: 0 0 48% !important;
                  }

                  /* 3rd button centered on its row */
                  #cmp-banner-preview .cmp-banner-btn:nth-child(3) {
                    margin-left: auto !important;
                    margin-right: auto !important;
                  }
                }
              `,
            }}
          />

          {/* COOKIE BANNER PREVIEW */}

          <div id="cmp-banner-preview" style={bannerStyle}>
            {/* close (x) btn */}
            {form.bannerClose.enabled && (
              <button
                type="button"
                aria-label="Close banner"
                // below commented code: to close the banner
                // onClick={() => {
                //   if (bannerRef.current) bannerRef.current.style.display = "none";
                // }}
                style={{
                  position: "absolute",
                  top: form.bannerClose.offset,
                  right: form.bannerClose.offset,
                  lineHeight: 1,
                  fontSize: form.bannerClose.size,
                  fontWeight: form.bannerClose.bold ? "700" : "500",
                  color: form.bannerClose.color,
                  background: form.bannerClose.bg,
                  padding: form.bannerClose.padding,
                  border: `${form.bannerClose.borderWidth} solid ${form.bannerClose.borderColor}`,
                  borderRadius: form.bannerClose.borderRadius,
                  cursor: "pointer",
                }}
              >
                ×
              </button>
            )}

            {form.logo && (
              <img
                src={getImageSrc(form.logo)}
                alt="Logo"
                style={{ maxHeight: "40px", objectFit: "contain" }}
              />
            )}
            <div
              style={{
                flex: orientation === "horizontal" ? 1 : "auto",
                minWidth: 0,
              }}
            >
              <p style={{ margin: 0, fontWeight: 600, fontSize: "1.1rem" }}>
                {title}
              </p>
              <p style={{ margin: "0.25rem 0", opacity: 0.85 }}>
                {description}{" "}
                {showPolicyLink && form.policyLinkPosition === "inline" && (
                  <a
                    href={policyUrl}
                    style={{
                      color: form.linkStyles.textColor,
                      textDecoration: linkDeco,
                    }}
                  >
                    {policyText}
                  </a>
                )}
              </p>

              {(showPolicyLink && form.policyLinkPosition === "separate") ||
              showImprintLink ? (
                <div
                  style={{
                    display: "flex",
                    gap: "1rem",
                    flexWrap: "wrap",
                    justifyContent: toJustify(form.bannerStyles.linkAlign),
                    width: "100%",
                  }}
                >
                  {showPolicyLink && form.policyLinkPosition === "separate" && (
                    <a
                      href={policyUrl}
                      style={{
                        color: form.linkStyles.textColor,
                        textDecoration: linkDeco,
                      }}
                    >
                      {policyText}
                    </a>
                  )}
                  {showImprintLink && (
                    <a
                      href={imprintUrl}
                      style={{
                        color: form.linkStyles.textColor,
                        textDecoration: linkDeco,
                      }}
                    >
                      {imprintText}
                    </a>
                  )}
                </div>
              ) : null}
            </div>

            {/* Banner Buttons */}
            <div
              className={`flex flex-wrap gap-[0.5rem] cmp-banner-btn-row
              ${!form.bannerButtonStyles.stackButtons ? "tablet-split" : ""}
            `}
              style={{
                ...buttonContainerStyle(
                  {
                    stackButtons: form.bannerButtonStyles.stackButtons,
                    buttonAlign: form.bannerStyles.buttonAlign,
                  },
                  isCompactLayout,
                ),
              }}
            >
              {(() => {
                // 1. Build the ordered list of buttons
                const buttons = [
                  {
                    key: "accept",
                    cfg: form.bannerButtonStyles.accept,
                    label: acceptAll,
                  },
                  {
                    key: "reject",
                    cfg: form.bannerButtonStyles.reject,
                    label: rejectAll,
                  },
                  ...(!inlinePrefOnBanner
                    ? [
                        {
                          key: "manage",
                          cfg: form.bannerButtonStyles.manage,
                          label: managePrefs,
                        },
                      ]
                    : []),
                ]
                  .filter((b) => b.cfg?.enabled ?? true)
                  .sort(
                    (a, b) =>
                      Number(a.cfg.order ?? 0) - Number(b.cfg.order ?? 0),
                  );

                // 2. Figure out where Manage is and whether split mode is active
                const manageIndex = buttons.findIndex(
                  (b) => b.key === "manage",
                );
                const splitActive =
                  form.bannerButtonStyles.splitManageButton &&
                  !form.bannerButtonStyles.stackButtons &&
                  !growButtonsRow &&
                  manageIndex !== -1 &&
                  buttons.length > 1;

                return buttons.map((btn, index) => {
                  const extra = {};

                  if (splitActive) {
                    const lastIdx = buttons.length - 1;

                    if (manageIndex === lastIdx && btn.key === "manage") {
                      // Manage is last: Accept/Reject group on the left, Manage alone on the right
                      extra.marginLeft = "auto";
                    } else if (manageIndex === 0 && index === 1) {
                      // Manage is first: Manage alone on the left, other buttons as a group on the right
                      extra.marginLeft = "auto";
                    }
                  }

                  return (
                    <button
                      key={btn.key}
                      className="cmp-banner-btn"
                      style={{
                        ...btnForm(btn.cfg, growButtonsRow),
                        ...extra,
                      }}
                      onClick={
                        btn.key === "manage"
                          ? () => setShowPrefCenter(true)
                          : undefined
                      }
                    >
                      {btn.label}
                    </button>
                  );
                });
              })()}
            </div>

            {/* Optional Preference modal below banner (when layout-bar, position-left/right) */}
            {inlinePrefOnBanner && (
              <div>
                <div
                  style={{
                    backgroundColor: prefBg,
                    border: `1px solid ${borderColor}`,
                    width: "100%",
                    height: "auto",
                    maxHeight: "70vh",
                    display: "flex",
                    flexDirection: "column",
                    overflow: "hidden",
                    // leave some space above the global footer
                    marginTop: "0.5rem",
                  }}
                >
                  {/* Central content (scrollable) */}
                  <div className="flex-1 min-h-0 overflow-y-auto">
                    {prefCenterView === "main" ? (
                      <ManagePreferencesCenter
                        form={form}
                        prefSectionStyles={prefSectionStyles}
                        prefSubHeader={prefSubHeader}
                        prefText={prefText}
                        prefTitle={prefTitle}
                        prefDescription={prefDescription}
                        prefCatStates={prefCatStates}
                        togglePrefCat={togglePrefCat}
                        openList={openList}
                      />
                    ) : (
                      <ListCenter
                        form={form}
                        prefSectionStyles={prefSectionStyles}
                        prefText={prefText}
                        listKey={activeListKey}
                        backToManagePreferences={backToManagePreferences}
                        prefItemStates={prefItemStates}
                        togglePrefItem={togglePrefItem}
                      />
                    )}
                  </div>

                  {/* Button bar */}
                  <div
                    style={{
                      backgroundColor: buttonBarBg,
                      padding: "0.7rem",
                      borderTop: `1px solid ${borderColor}`,
                      flexShrink: 0,
                    }}
                  >
                    <div className="flex flex-wrap gap-2">
                      {[
                        {
                          key: "acceptAll",
                          cfg: form.prefButtonStyles.acceptAll,
                          label: acceptAllText,
                        },
                        {
                          key: "saveAll",
                          cfg: form.prefButtonStyles.saveAll,
                          label: saveAllText,
                        },
                        {
                          key: "rejectAll",
                          cfg: form.prefButtonStyles.rejectAll,
                          label: rejectAllText,
                        },
                      ]
                        .filter((b) => b.cfg?.enabled ?? true)
                        .sort(
                          (a, b) =>
                            Number(a.cfg.order ?? 0) - Number(b.cfg.order ?? 0),
                        )
                        .map((btn) => (
                          <button
                            key={btn.key}
                            onClick={() => {}}
                            style={{
                              ...btnForm(btn.cfg),
                              width: "100%",
                              flex: "1",
                            }}
                          >
                            {btn.label}
                          </button>
                        ))}
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div
                  className="rounded-t-none rounded-b-lg"
                  style={{
                    position: "absolute",
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: footerBg,
                    color: footerTextColor,
                    padding: "0.5rem 0.8rem",
                    borderTop: `1px solid ${borderColor}`,
                    display: "flex",
                    alignItems: "center",
                    gap: "0.3rem",
                    justifyContent: "right",
                  }}
                >
                  <span style={{ opacity: 0.8, fontSize: "0.7rem" }}>
                    Powered by
                  </span>
                  {form.prefFooterLogo && (
                    <img
                      src={getImageSrc(form.prefFooterLogo)}
                      alt="Footer logo"
                      style={{ height: 20, objectFit: "contain" }}
                    />
                  )}
                  {form.prefFooterText && (
                    <strong style={{ opacity: 0.9, fontSize: "0.8rem" }}>
                      {form.prefFooterText}
                    </strong>
                  )}
                </div>
              </div>
            )}

            {/* Preference modal inside banner end here */}
          </div>

          {customCss && (
            <style dangerouslySetInnerHTML={{ __html: customCss }} />
          )}
        </div>
      </div>

      {/* PREFERENCE CENTER MODAL PREVIEW */}

      {showPrefCenter && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div
            id="cmp-pref-preview"
            role="dialog"
            aria-modal="true"
            aria-labelledby="pref-modal-title"
            className="rounded-lg w-11/12 max-w-lg flex flex-col overflow-hidden"
            style={{
              height: "45vh",
              maxHeight: "45vh",
              backgroundColor: prefBg,
              border: `1px solid ${borderColor}`,
            }}
          >
            {/* Header Bar */}
            <div
              className="shrink-0 flex items-center justify-between px-4 py-3"
              style={{
                backgroundColor: prefHeaderBg,
                borderBottom: `1px solid ${borderColor}`,
              }}
            >
              <div className="flex items-center gap-2 min-w-0">
                {form.prefHeaderLogo && (
                  <img
                    src={getImageSrc(form.prefHeaderLogo)}
                    alt="Preferences logo"
                    style={{ height: 28, objectFit: "contain" }}
                  />
                )}
                {!!form.prefHeaderText && (
                  <span
                    className="font-semibold truncate"
                    style={{ color: prefHeaderTextColor }}
                  >
                    {form.prefHeaderText}
                  </span>
                )}
              </div>

              <button
                onClick={() => setShowPrefCenter(false)}
                aria-label="Close preferences"
                className="text-gray-500"
                style={{ lineHeight: 1, fontSize: "18px", fontWeight: 600 }}
              >
                ×
              </button>
            </div>

            {/* Central Sec: manage pref content (main or list view) */}
            <div
              className="flex-1 min-h-0 overflow-y-auto"
              style={{
                backgroundColor:
                  prefCenterView === "list" ? form.listsStyles.bgColor : prefBg,
              }}
            >
              {prefCenterView === "main" ? (
                <ManagePreferencesCenter
                  form={form}
                  prefSectionStyles={prefSectionStyles}
                  prefSubHeader={prefSubHeader}
                  prefText={prefText}
                  prefTitle={prefTitle}
                  prefDescription={prefDescription}
                  prefCatStates={prefCatStates}
                  togglePrefCat={togglePrefCat}
                  openList={openList}
                />
              ) : (
                <ListCenter
                  form={form}
                  prefSectionStyles={prefSectionStyles}
                  prefText={prefText}
                  listKey={activeListKey}
                  backToManagePreferences={backToManagePreferences}
                  prefItemStates={prefItemStates}
                  togglePrefItem={togglePrefItem}
                />
              )}
            </div>

            {/* Preference modal Buttons bar */}
            <div
              style={{
                backgroundColor: buttonBarBg,
                padding: "0.7rem",
                borderTop: `1px solid ${borderColor}`,
              }}
            >
              <div className="flex flex-wrap gap-2 justify-end cmp-pref-btn-row">
                {[
                  {
                    key: "acceptAll",
                    cfg: form.prefButtonStyles.acceptAll,
                    label: acceptAll,
                  },
                  {
                    key: "saveAll",
                    cfg: form.prefButtonStyles.saveAll,
                    label: saveAllText,
                  },
                  {
                    key: "rejectAll",
                    cfg: form.prefButtonStyles.rejectAll,
                    label: rejectAllText,
                  },
                ]
                  .filter((b) => b.cfg?.enabled ?? true)
                  .sort(
                    (a, b) =>
                      Number(a.cfg.order ?? 0) - Number(b.cfg.order ?? 0),
                  )
                  .map((btn) => (
                    <button
                      key={btn.key}
                      className="cmp-pref-btn"
                      onClick={() => setShowPrefCenter(false)}
                      style={btnForm(btn.cfg)}
                    >
                      {btn.label}
                    </button>
                  ))}
              </div>
            </div>

            {/* Footer bar */}
            <div
              className="rounded-t-none rounded-b-lg"
              style={{
                backgroundColor: footerBg,
                color: footerTextColor,
                padding: "0.5rem 0.8rem",
                borderTop: `1px solid ${borderColor}`,
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                justifyContent: "right",
              }}
            >
              <span style={{ opacity: 0.8, fontSize: "0.7rem" }}>
                Powered by
              </span>
              {form.prefFooterLogo && (
                <img
                  src={getImageSrc(form.prefFooterLogo)}
                  alt="Footer logo"
                  style={{ height: 20, objectFit: "contain" }}
                />
              )}
              {form.prefFooterText && (
                <strong style={{ opacity: 0.9, fontSize: "0.8rem" }}>
                  {form.prefFooterText}
                </strong>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
