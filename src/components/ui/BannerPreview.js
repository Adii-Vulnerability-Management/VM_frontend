import React, { useState, useEffect } from 'react'

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

export default function BannerPreview({ config = {} }) {
  const {
    logo,
    acceptColor = '#007bff',
    rejectColor = '#dc3545',
    backgroundColor: bannerBg = '#f0f0f0',
    textColor = '#000000',
    bannerStyles: {
      borderRadius = '0.75rem',
      boxShadow = '0 4px 12px rgba(0,0,0,0.1)',
      padding = '1rem',
      fontFamily = 'Arial, sans-serif',
      fontSize = '1rem',
      textAlign = 'left',
      orientation = 'horizontal',
    } = {},
    texts: {
      title = '',
      description = '',
      acceptAll = 'Accept All',
      rejectAll = 'Reject',
    } = {},
    showPolicyLink = false,
    policyText = 'Privacy Policy',
    policyUrl = '',
    showImprintLink = false,
    imprintText = 'Imprint',
    imprintUrl = '',
    layout: { position = 'bottom', showVendorList = false } = {},
    prefStyles: {
      bgColor: prefBg = '#ffffff',
      headerColor: prefHeader = '#333333',
      textColor: prefText = '#000000',
      buttonBg: prefBtnBg = '#007bff',
      buttonText: prefBtnText = '#ffffff',
    } = {},
    prefContent: {
      title: prefTitle = 'Manage your preferences',
      description: prefDesc = 'Choose which cookies you allow us to set.',
      saveAllText = 'Save Preferences',
      rejectAllText = 'Reject All',
    } = {},
    showPrefPolicyLink = false,
    prefPolicyText = 'Privacy Policy',
    prefPolicyUrl = '',
    showPrefImprintLink = false,
    prefImprintText = 'Imprint',
    prefImprintUrl = '',
    cookieCategories = [],
    buttonStyles: {
      borderRadius: btnBR = '0.375rem',
      padding: btnPad = '0.5rem 1.25rem',
      borderWidth: btnBW = '0px',
      borderColor: btnBC = 'transparent',
      hoverOpacity: btnHover = 0.9,
      transition: btnTrans = '0.3s ease',
    } = {},
    linkStyles: {
      decoration: linkDeco = 'underline',
      hoverColor: linkHover = '#0056b3',
    } = {},
    cookieListTitleColor = '#333333',
    cookieListBgColor = '#ffffff',
    customCss = '',
  } = config

  // Tabs setup
  const tabs = [
    { key: 'banner',      label: 'Banner' },
    { key: 'preferences', label: 'Preference Center' },
    { key: 'cookielist',  label: 'Cookie List' }
  ]
  const [activeTab, setActiveTab] = useState('banner')

  // Category toggles
  const [catStates, setCatStates] = useState({})
  useEffect(() => {
    const init = {}
    cookieCategories.forEach((c,i) => { init[i] = !!c.default })
    setCatStates(init)
  }, [cookieCategories])
  const toggleCat = i => setCatStates(s => ({ ...s, [i]: !s[i] }))

  const customStyleElem = customCss && (
    <style dangerouslySetInnerHTML={{ __html: customCss }} />
  )

  const bannerStyle = {
    backgroundColor: bannerBg,
    color: textColor,
    fontFamily,
    fontSize,
    textAlign,
    padding,
    borderRadius,
    boxShadow,
    display: orientation === 'horizontal' ? 'flex' : 'block',
    alignItems: orientation === 'horizontal' ? 'center' : undefined,
    gap: '1rem',
    position: 'relative',
    ...(position === 'top' ? { top: 0 } : { bottom: 0 }),
  }

  return (
    <div className="w-full">
      {customStyleElem}

      {/* Tabs */}
      <div
        role="tablist"
        aria-label="Banner preview sections"
        className="flex space-x-2 mb-4"
      >
        {tabs.map(({ key, label }, idx) => (
          <button
            key={key}
            role="tab"
            id={`tab-${key}`}
            aria-selected={activeTab === key}
            aria-controls={`tabpanel-${key}`}
            tabIndex={activeTab === key ? 0 : -1}
            onClick={() => setActiveTab(key)}
            onKeyDown={e => {
              if (e.key === 'ArrowRight') {
                const next = tabs[(idx + 1) % tabs.length].key
                setActiveTab(next)
                document.getElementById(`tab-${next}`)?.focus()
              }
              if (e.key === 'ArrowLeft') {
                const prev = tabs[(idx + tabs.length - 1) % tabs.length].key
                setActiveTab(prev)
                document.getElementById(`tab-${prev}`)?.focus()
              }
            }}
            className={`px-3 py-1 rounded focus:outline-none focus:ring ${
              activeTab === key
                ? 'bg-gray-800 text-white'
                : 'bg-gray-200 text-gray-800'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Panels */}
      {tabs.map(({ key }) => (
        <div
          key={key}
          role="tabpanel"
          id={`tabpanel-${key}`}
          aria-labelledby={`tab-${key}`}
          hidden={activeTab !== key}
        >
          {key === 'banner' && (
            <div style={bannerStyle}>
              {logo && (
                <img
                  src={getImageSrc(logo)}
                  alt="Logo"
                  style={{ maxHeight: '40px', objectFit: 'contain' }}
                />
              )}
              <div style={{ flex: orientation === 'horizontal' ? 1 : undefined, minWidth: 0 }}>
                <p style={{ margin: 0, fontWeight: 600 }}>{title}</p>
                <p style={{ margin: '0.25rem 0' }}>{description}</p>
                <div className="flex space-x-4 flex-wrap">
                  {showPolicyLink && (
                    <a
                      href={policyUrl}
                      style={{ color: acceptColor, textDecoration: linkDeco }}
                      className="hover:opacity-80 transition"
                    >
                      {policyText}
                    </a>
                  )}
                  {showImprintLink && (
                    <a
                      href={imprintUrl}
                      style={{ color: acceptColor, textDecoration: linkDeco }}
                      className="hover:opacity-80 transition"
                    >
                      {imprintText}
                    </a>
                  )}
                </div>
              </div>
              <div className="flex space-x-2 flex-shrink-0">
                {[{ text: acceptAll, bg: acceptColor }, { text: rejectAll, bg: rejectColor }].map(
                  ({ text, bg }, i) => (
                    <button
                      key={i}
                      style={{
                        backgroundColor: bg,
                        color: '#fff',
                        padding: btnPad,
                        border: `${btnBW} solid ${btnBC}`,
                        borderRadius: btnBR,
                        transition: btnTrans,
                        cursor: 'pointer',
                      }}
                      className="shadow hover:opacity-90"
                    >
                      {text}
                    </button>
                  )
                )}
              </div>
              {showVendorList && (
                <div className="w-full mt-2 text-sm text-gray-700">Vendor List Placeholder</div>
              )}
            </div>
          )}

          {key === 'preferences' && (
            <div
              className="rounded p-4 mb-4"
              style={{
                backgroundColor: prefBg,
                color: prefText,
                fontFamily,
                lineHeight: '1.5',
              }}
            >
              <h3 className="font-semibold mb-2" style={{ color: prefHeader }}>
                {prefTitle}
              </h3>
              <p className="mb-4">{prefDesc}</p>
              <div className="flex space-x-2 mb-4 flex-wrap">
                <button
                  style={{
                    backgroundColor: prefBtnBg,
                    color: prefBtnText,
                    padding: btnPad,
                    border: `${btnBW} solid ${btnBC}`,
                    borderRadius: btnBR,
                    transition: btnTrans,
                    cursor: 'pointer',
                  }}
                  className="hover:opacity-90"
                >
                  {saveAllText}
                </button>
                <button
                  style={{
                    backgroundColor: rejectColor,
                    color: '#fff',
                    padding: btnPad,
                    border: `${btnBW} solid ${btnBC}`,
                    borderRadius: btnBR,
                    transition: btnTrans,
                    cursor: 'pointer',
                  }}
                  className="hover:opacity-90"
                >
                  {rejectAllText}
                </button>
              </div>
              <div className="flex space-x-4 mb-4 flex-wrap">
                {showPrefPolicyLink && (
                  <a href={prefPolicyUrl} className="underline hover:opacity-80">
                    {prefPolicyText}
                  </a>
                )}
                {showPrefImprintLink && (
                  <a href={prefImprintUrl} className="underline hover:opacity-80">
                    {prefImprintText}
                  </a>
                )}
              </div>
              <h4 className="font-medium mb-2">Cookie Categories</h4>
              {cookieCategories.map((cat, i) => (
                <details key={i} className="mb-2 border rounded">
                  <summary className="px-2 py-1 flex justify-between cursor-pointer">
                    <span>{cat.name}</span>
                  </summary>
                  <div className="px-2 py-2 bg-white flex justify-between items-center">
                    <p>{cat.description}</p>
                    <label className="flex items-center space-x-2">
                      <span>{catStates[i] ? 'Enabled' : 'Disabled'}</span>
                      <input
                        type="checkbox"
                        checked={catStates[i]}
                        onChange={() => toggleCat(i)}
                      />
                    </label>
                  </div>
                </details>
              ))}
            </div>
          )}

          {key === 'cookielist' && (
            <div
              className="border rounded p-4"
              style={{ backgroundColor: cookieListBgColor, fontFamily, lineHeight: '1.5' }}
            >
              <h3 className="font-semibold mb-2" style={{ color: cookieListTitleColor }}>
                Cookie List (Preview)
              </h3>
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ backgroundColor: acceptColor, color: '#fff' }}>
                    <th className="p-2 text-left">Cookie Name</th>
                    <th className="p-2 text-left">Purpose</th>
                    <th className="p-2 text-left">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {['_ga', '_fbp', 'session_id'].map(ck => (
                    <tr key={ck}>
                      <td className="p-2">{ck}</td>
                      <td className="p-2">Analytics</td>
                      <td className="p-2">
                        <span className="px-2 py-1 bg-green-100 text-green-800 rounded">
                          Active
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}


// EditorWithAdvancedPreview.jsx

export function EditorWithPreview() {
  // --- 1) State --------------------------------
  const [tpl, setTpl] = useState({
    // banner content
    message: "We use cookies to improve your experience.",
    policyLink: "/privacy-policy",
    acceptText: "Accept All",
    rejectText: "Reject All",
    preferenceText: "Manage Preferences",

    // banner theming
    bgColor: "#ffffff",
    textColor: "#000000",
    buttonColor: "#22c55e",

    // layout & style
    bannerPosition: "bottom",    // "bottom" | "top"
    bannerStyle: "bar",          // "bar" | "toast" | "floating"

    // categories
    categories: { necessary: true, analytics: true, marketing: true },
  });
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState("idle");   // idle|saving|success|error
  const [showPrefs, setShowPrefs] = useState(false);

  // --- 2) Handlers -----------------------------
  const handleChange = (key, val) => {
    setTpl(t => ({ ...t, [key]: val }));
    setErrors(e => ({ ...e, [key]: undefined }));
  };
  const toggleCategory = cat => {
    if (cat === "necessary") return;
    setTpl(t => ({
      ...t,
      categories: { ...t.categories, [cat]: !t.categories[cat] }
    }));
  };
  const validate = () => {
    const e = {};
    if (tpl.message.trim().length < 10) e.message = "Min 10 chars";
    ["acceptText","rejectText","preferenceText"].forEach(k => {
      if (!tpl[k].trim()) e[k] = "Required";
    });
    try { new URL(tpl.policyLink, window.location.origin) }
    catch { e.policyLink = "Invalid URL" }

    const hex = /^#([0-9A-F]{3}){1,2}$/i;
    ["bgColor","textColor","buttonColor"].forEach(c => {
      if (!hex.test(tpl[c])) e[c] = "Bad hex";
    });
    setErrors(e);
    return !Object.keys(e).length;
  };
  const saveTemplate = async () => {
    if (!validate()) return;
    setStatus("saving");
    try {
      // stubbed
      await fetch("/api/cmp/template", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(tpl)
      });
      setStatus("success");
      setTimeout(() => setStatus("idle"), 2000);
    } catch {
      setStatus("error");
    }
  };

  // --- 3) Styles --------------------------------
  const styles = {
    container: {
      display: "flex", height: "100vh", fontFamily: "sans-serif"
    },
    left: {
      width: "40%", padding: 24, overflowY: "auto",
      borderRight: "1px solid #E5E7EB", boxSizing: "border-box"
    },
    right: {
      flex: 1, backgroundColor: "#F9FAFB",
      position: "relative", display: "flex", flexDirection: "column"
    },
    section: { margin: "16px 0 8px", fontSize: 18, fontWeight: 600 },
    label: { display: "flex", flexDirection: "column", marginBottom: 12, fontSize: 14 },
    input: err => ({
      padding: 8, border: `1px solid ${err ? "#EF4444" : "#D1D5DB"}`,
      borderRadius: 4, outline: "none", marginTop: 4
    }),
    textarea: err => ({
      padding: 8, border: `1px solid ${err ? "#EF4444" : "#D1D5DB"}`,
      borderRadius: 4, outline: "none", marginTop: 4,
      resize: "vertical", minHeight: 60
    }),
    colorInput: { marginTop: 4, cursor: "pointer" },
    select: { marginTop: 4, padding: 8, borderRadius: 4, border: "1px solid #D1D5DB" },
    errorText: { color: "#EF4444", fontSize: 12, marginTop: 4 },
    btn: (bg, fg, disabled) => ({
      backgroundColor: bg, color: fg, border: "none",
      borderRadius: 4, padding: "10px 16px",
      cursor: disabled ? "default" : "pointer",
      opacity: disabled ? 0.5 : 1, fontSize: 14, marginTop: 16
    }),
    status: (bg, c) => ({
      backgroundColor: bg, color: c, padding: 8,
      borderRadius: 4, marginBottom: 16, textAlign: "center"
    }),

    // Dummy site
    header: { backgroundColor: "#2563EB", color: "#FFF", padding: "12px 24px", fontSize: 20 },
    main: { flex: 1, padding: 24, overflowY: "auto", fontSize: 14, color: "#111827" },
    footer: { backgroundColor: "#E5E7EB", padding: "8px 24px", textAlign: "center", fontSize: 12 },

    // Banner (common)
    bannerCommon: {
      position: "absolute", left: 0, right: 0,
      display: "flex", justifyContent: "space-between",
      alignItems: "center", padding: 16, boxSizing: "border-box",
      borderTop: "1px solid #D1D5DB"
    },
    bannerMsg: { fontSize: 14, margin: 0 },
    bannerLink: color => ({ textDecoration: "underline", color }),
    bannerAct: { display: "flex", gap: 8 },
    bannerBtn: (bg, fg) => ({
      backgroundColor: bg, color: fg, border: "none",
      borderRadius: 4, padding: "8px 12px", cursor: "pointer", fontSize: 14
    }),

    // Toast / Floating
    toast: {
      width: 280, right: 20, padding: 16, boxSizing: "border-box",
      boxShadow: "0 2px 8px rgba(0,0,0,0.15)"
    },
    floating: {
      width: 320, left: "50%", transform: "translateX(-50%)",
      padding: 16, boxSizing: "border-box",
      boxShadow: "0 2px 8px rgba(0,0,0,0.15)"
    },

    // Pref modal
    overlay: {
      position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: "rgba(0,0,0,0.5)",
      display: showPrefs ? "flex" : "none",
      justifyContent: "center", alignItems: "center", zIndex: 10
    },
    modal: {
      backgroundColor: "#FFF", color: "#111827",
      borderRadius: 6, padding: 24,
      width: "90%", maxWidth: 360, boxSizing: "border-box"
    },
    modalTitle: { margin: 0, marginBottom: 16, fontSize: 18, fontWeight: 600 },
    modalRow: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
    modalBtn: (bg, fg) => ({
      backgroundColor: bg, color: fg, border: "none",
      borderRadius: 4, padding: "8px 12px", cursor: "pointer", fontSize: 14, marginLeft: 8
    }),
    modalActions: { textAlign: "right", marginTop: 16 }
  };

  // --- 4) Render -------------------------------
  // compute banner style
  let bannerStyle = { ...styles.bannerCommon,
    backgroundColor: tpl.bgColor,
    color: tpl.textColor
  };
  // position (bar)
  if (tpl.bannerStyle === "bar") {
    bannerStyle[tpl.bannerPosition] = 0;
  }
  // toast
  else if (tpl.bannerStyle === "toast") {
    bannerStyle = {
      ...bannerStyle,
      ...styles.toast,
      [tpl.bannerPosition]: 20,
      right: 20
    };
  }
  // floating
  else if (tpl.bannerStyle === "floating") {
    bannerStyle = {
      ...bannerStyle,
      ...styles.floating,
      [tpl.bannerPosition]: 40
    };
  }

  return (
    <div style={styles.container}>
      {/* LEFT: Editor */}
      <div style={styles.left}>
        <div style={styles.section}>Banner Editor</div>
        {status === "success" && (
          <div style={styles.status("#D1FAE5","#047857")}>Saved!</div>
        )}
        {status === "error" && (
          <div style={styles.status("#FEE2E2","#B91C1C")}>Save failed</div>
        )}

        {/* Message */}
        <label style={styles.label}>
          Message
          <textarea
            value={tpl.message}
            onChange={e => handleChange("message", e.target.value)}
            style={styles.textarea(errors.message)}
          />
          {errors.message && <div style={styles.errorText}>{errors.message}</div>}
        </label>

        {/* Policy Link */}
        <label style={styles.label}>
          Privacy Policy URL
          <input
            type="text"
            value={tpl.policyLink}
            onChange={e => handleChange("policyLink", e.target.value)}
            style={styles.input(errors.policyLink)}
          />
          {errors.policyLink && <div style={styles.errorText}>{errors.policyLink}</div>}
        </label>

        {/* Button labels */}
        {[
          ["acceptText","Accept Text"],
          ["rejectText","Reject Text"],
          ["preferenceText","Preferences Btn Text"]
        ].map(([k, lbl]) => (
          <label key={k} style={styles.label}>
            {lbl}
            <input
              type="text"
              value={tpl[k]}
              onChange={e => handleChange(k, e.target.value)}
              style={styles.input(errors[k])}
            />
            {errors[k] && <div style={styles.errorText}>{errors[k]}</div>}
          </label>
        ))}

        {/* Colors */}
        {[
          ["bgColor","Background"],
          ["textColor","Text Color"],
          ["buttonColor","Button Color"]
        ].map(([k, lbl]) => (
          <label key={k} style={styles.label}>
            {lbl}
            <input
              type="color"
              value={tpl[k]}
              onChange={e => handleChange(k, e.target.value)}
              style={styles.colorInput}
            />
          </label>
        ))}

        {/* Layout & Style */}
        <div style={styles.section}>Layout & Style</div>
        <label style={styles.label}>
          Position
          <select
            value={tpl.bannerPosition}
            onChange={e => handleChange("bannerPosition", e.target.value)}
            style={styles.select}
          >
            <option value="bottom">Bottom</option>
            <option value="top">Top</option>
          </select>
        </label>
        <label style={styles.label}>
          Style
          <select
            value={tpl.bannerStyle}
            onChange={e => handleChange("bannerStyle", e.target.value)}
            style={styles.select}
          >
            <option value="bar">Bar (full-width)</option>
            <option value="toast">Toast (corner)</option>
            <option value="floating">Floating (center pill)</option>
          </select>
        </label>

        {/* Save */}
        <button
          onClick={saveTemplate}
          disabled={status === "saving"}
          style={styles.btn("#2563EB","#FFF",status==="saving")}
        >
          {status==="saving" ? "Saving…" : "Save Template"}
        </button>
      </div>

      {/* RIGHT: Live Preview */}
      <div style={styles.right}>
        <div style={styles.header}>Dummy Site Header</div>
        <div style={styles.main}>
          <p>Your site content goes here… scroll to test.</p>
          <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
        </div>
        <div style={styles.footer}>© 2025 Acme Corp.</div>

        {/* Cookie Banner */}
        <div style={bannerStyle}>
          <p style={styles.bannerMsg}>
            {tpl.message}{" "}
            <a href={tpl.policyLink} style={styles.bannerLink(tpl.buttonColor)}>
              {tpl.preferenceText === "Manage Preferences" 
                ? "Privacy Policy" 
                : tpl.preferenceText /* or hard-code */}
            </a>
          </p>
          <div style={styles.bannerAct}>
            <button
              style={styles.bannerBtn(tpl.buttonColor,"#FFF")}
              onClick={() => setShowPrefs(false)}
            >
              {tpl.acceptText}
            </button>
            <button
              style={styles.bannerBtn("#D1D5DB","#000")}
            >
              {tpl.rejectText}
            </button>
            <button
              style={styles.bannerBtn("#E5E7EB","#000")}
              onClick={() => setShowPrefs(true)}
            >
              {tpl.preferenceText}
            </button>
          </div>
        </div>

        {/* Preferences Modal */}
        <div style={styles.overlay}>
          <div style={styles.modal}>
            <h3 style={styles.modalTitle}>{tpl.preferenceText}</h3>
            {Object.entries(tpl.categories).map(([key,val])=>(
              <div key={key} style={styles.modalRow}>
                <span style={{ opacity: key==="necessary"?0.5:1 }}>
                  {key.charAt(0).toUpperCase()+key.slice(1)}
                </span>
                <input
                  type="checkbox"
                  checked={val}
                  disabled={key==="necessary"}
                  onChange={()=>toggleCategory(key)}
                />
              </div>
            ))}
            <div style={styles.modalActions}>
              <button
                onClick={()=>setShowPrefs(false)}
                style={styles.modalBtn("#E5E7EB","#000")}
              >
                Cancel
              </button>
              <button
                onClick={()=>setShowPrefs(false)}
                style={styles.modalBtn(tpl.buttonColor,"#FFF")}
              >
                Save Preferences
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
