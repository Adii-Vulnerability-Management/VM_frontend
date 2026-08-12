// src/globalcomponents/cookies-banners/TemplateGRC3Banner.jsx
import React, { useState, useRef, useEffect } from "react";
import { FaChevronDown, FaChevronUp, FaTimes } from "react-icons/fa";

// === 1) Define your purposes/categories ===
const PURPOSES = [
  {
    key: "device",
    title: "Store and/or access information on a device",
    details: `Cookies, device or similar identifiers (login-based, randomly assigned,
network-based) together with other information (browser type, language,
screen size, supported technologies) can be stored or read on your device
to recognise it each time you connect.`,
  },
  {
    key: "analytics",
    title: "Analytics cookies",
    details: `Analytics cookies help us measure website traffic, understand user
behavior, improve site performance, and spot issues before you even notice them.`,
  },
  {
    key: "preferences",
    title: "Preferences cookies",
    details: `Remembering your choices (language, region, theme) so GRC³ offers you
a personalized experience every time you return.`,
  },
  {
    key: "marketing",
    title: "Marketing cookies",
    details: `Power targeted messages about GRC³’s features, services and promotions,
both on our site and across partner networks.`,
  },
];

// === 2) Small Toggle switch ===
const Toggle = ({ on, onChange }) => (
  <label className="relative inline-flex items-center cursor-pointer">
    <input
      type="checkbox"
      className="sr-only"
      checked={on}
      onChange={(e) => onChange(e.target.checked)}
    />
    <span
      className="block w-10 h-6 rounded-full transition-colors"
      style={{ backgroundColor: on ? "#F2F1FB" : "#55506A" }}
    />
    <span
      className="absolute left-0.5 top-0.5 w-5 h-5 rounded-full bg-[#050038] transition-transform"
      style={{ transform: on ? "translateX(1.5rem)" : "none" }}
    />
  </label>
);

export default function TemplateGRC3Banner({
  disableOverlay = false,
  onClose = () => {},
  onSave = () => {},
}) {
  const ref = useRef();
  const [expanded, setExpanded] = useState({});
  const [consent, setConsent] = useState(
    PURPOSES.reduce((acc, p) => ({ ...acc, [p.key]: false }), {})
  );

  // outside click closes
  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose]);

  const togglePanel = (key) =>
    setExpanded((prev) => ({ ...prev, [key]: !prev[key] }));

  const handleViewOptions = () => {
    const allOpen =
      Object.values(expanded).filter(Boolean).length === PURPOSES.length;
    if (allOpen) {
      setExpanded({});
    } else {
      const openAll = {};
      PURPOSES.forEach((p) => (openAll[p.key] = true));
      setExpanded(openAll);
    }
  };

  const toggleConsent = (key, val) =>
    setConsent((prev) => ({ ...prev, [key]: val }));

  // inner card
  const card = (
    <div
      ref={ref}
      className="bg-white w-11/12 max-w-5xl rounded-lg overflow-hidden shadow-lg relative"
    >
      {/* Close × */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"
      >
        <FaTimes size={20} />
      </button>

      {/* Header */}
      <div className="flex items-center justify-between bg-[#050038] text-white px-6 py-3">
        <div className="flex items-center space-x-2">
          <span className="font-bold text-xl">GRC³</span>
          <h1 className="text-lg">Privacy Preference Center</h1>
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-col lg:flex-row">
        <div className="lg:w-1/2 p-6 text-gray-700 space-y-4">
          <p>
            GRC³ and our partners use cookies and similar technologies to secure
            our platform, analyse usage, remember your preferences, and deliver
            personalized content.
          </p>
          <p>
            Choose “Essential only,” or expand each category on the right to
            toggle them on or off. You can revisit this panel at any time.
          </p>
        </div>

        <div className="lg:w-1/2 p-6 space-y-4 border-t lg:border-t-0 lg:border-l border-gray-200 overflow-y-auto max-h-[60vh]">
          {PURPOSES.map(({ key, title, details }) => (
            <div key={key} className="border rounded">
              <div className="flex justify-between items-center px-4 py-3 bg-gray-50">
                <button
                  onClick={() => togglePanel(key)}
                  className="font-medium text-gray-800 flex-1 text-left"
                >
                  {title}
                </button>
                <Toggle
                  on={consent[key]}
                  onChange={(v) => toggleConsent(key, v)}
                />
                <button
                  onClick={() => togglePanel(key)}
                  className="ml-2 text-gray-500 hover:text-gray-700"
                >
                  {expanded[key] ? <FaChevronUp /> : <FaChevronDown />}
                </button>
              </div>
              {expanded[key] && (
                <div className="px-4 py-3 text-gray-600">{details}</div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="flex flex-col sm:flex-row items-center justify-end space-y-2 sm:space-y-0 sm:space-x-4 bg-gray-50 px-6 py-4">
        <button
          onClick={() => onSave({ essentialOnly: true })}
          className="px-4 py-2 bg-[#2B245C] text-white rounded hover:bg-opacity-90"
        >
          Essential cookies only
        </button>
        <button
          onClick={handleViewOptions}
          className="px-4 py-2 border border-[#2B245C] text-[#2B245C] rounded hover:bg-[#F2F1FB]"
        >
          {Object.values(expanded).filter(Boolean).length === PURPOSES.length
            ? "Collapse all"
            : "View options"}
        </button>
        <button
          onClick={() => onSave({ acceptAll: true })}
          className="px-4 py-2 bg-[#2B245C] text-white rounded hover:bg-opacity-90"
        >
          Accept all
        </button>
      </div>
    </div>
  );

  // wrap in overlay unless disableOverlay=true
  if (disableOverlay) return card;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4"
      onClick={onClose}
    >
      <div onClick={(e) => e.stopPropagation()}>{card}</div>
    </div>
  );
}
