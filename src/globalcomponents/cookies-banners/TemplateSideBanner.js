import React, { useState } from "react";
import { FaTimes } from "react-icons/fa";

const DEFAULT_CATEGORIES = [
  {
    key: "essential",
    label: "Essential Cookies",
    description:
      "These cookies are critical to GRC³’s core functionality—security, session management, and ensuring our platform stays up and running.",
  },
  {
    key: "analytics",
    label: "Analytics Cookies",
    description:
      "Analytics cookies help us understand how you navigate GRC³: which pages you visit, how long you stay, and where you click, so we can continually improve your experience.",
  },
  {
    key: "preferences",
    label: "Preferences Cookies",
    description:
      "Preferences cookies remember your settings (language, region, theme) so GRC³ delivers a personalized experience every time you return.",
  },
  {
    key: "marketing",
    label: "Marketing Cookies",
    description:
      "Marketing cookies power targeted messages about GRC³’s latest features and services, shown on our site and across partner networks.",
  },
];

export default function TemplateGRC3Side({
  disableOverlay = false,
  categories = DEFAULT_CATEGORIES,
  onSave = () => {},
  onClose = () => {},
}) {
  const [consents, setConsents] = useState(
    categories.reduce((acc, c) => ({ ...acc, [c.key]: false }), {})
  );

  const toggle = (key) =>
    setConsents((prev) => ({ ...prev, [key]: !prev[key] }));

  // The side-panel card
  const panel = (
    <div className="flex flex-col w-full max-w-md h-full bg-[#2B245C] text-white overflow-auto rounded-r-lg">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 bg-[#050038]">
        <div>
          <h2 className="text-xl font-bold">GRC³ Cookie Settings</h2>
          <p className="mt-1 text-sm text-[#F2F1FB]">
            Manage your cookie preferences for the best GRC³ experience.
          </p>
        </div>
        <button onClick={onClose} className="text-[#F2F1FB]">
          <FaTimes size={20} />
        </button>
      </div>

      {/* Categories */}
      <div className="flex-1 px-6 py-4 space-y-6 bg-[#2B245C]">
        {categories.map((cat) => (
          <div key={cat.key} className="space-y-2">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold text-[#F2F1FB]">{cat.label}</h3>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only"
                  checked={consents[cat.key]}
                  onChange={() => toggle(cat.key)}
                />
                <span
                  className="block w-10 h-6 rounded-full transition-colors"
                  style={{
                    backgroundColor: consents[cat.key] ? "#F2F1FB" : "#55506A",
                  }}
                />
                <span
                  className="absolute left-0.5 top-0.5 w-5 h-5 rounded-full bg-[#050038] transition-transform"
                  style={{
                    transform: consents[cat.key]
                      ? "translateX(1.5rem)"
                      : "none",
                  }}
                />
              </label>
            </div>
            <p className="text-sm text-[#F2F1FB] leading-relaxed">
              {cat.description}
            </p>
            <div className="border-t border-[#55506A]" />
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="px-6 py-4 bg-[#050038]">
        <button
          onClick={() => onSave(consents)}
          className="w-full px-4 py-2 bg-[#F2F1FB] text-[#2B245C] font-medium rounded hover:bg-opacity-90 transition"
        >
          Save and Close
        </button>
      </div>
    </div>
  );

  // If disableOverlay, render just the panel:
  if (disableOverlay) return panel;

  // Otherwise wrap it in a click-outside backdrop:
  return (
    <div className="fixed inset-0 z-50 flex" onClick={onClose}>
      {/* empty left gutter */}
      <div className="flex-1" />
      {/* panel area */}
      <div className="relative h-full" onClick={(e) => e.stopPropagation()}>
        {panel}
      </div>
    </div>
  );
}
