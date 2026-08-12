// src/globalcomponents/cookies-banners/TemplateGRC3.jsx
import React, { useState } from "react";
import { FaTimes } from "react-icons/fa";

const DEFAULT_CATEGORIES = [
  {
    key: "privacy",
    label: "Your Privacy",
    description:
      "When you visit any website, it may store or retrieve information on your browser. This information might be about you or your device and is used to make the site work as you expect. Because we respect your privacy, you can choose not to allow some types of cookies.",
  },
  {
    key: "functional",
    label: "Functional Cookies",
    description:
      "Functional cookies enable enhanced functionality and personalization. Without them, some parts of the site may not work properly.",
  },
  {
    key: "necessary",
    label: "Strictly Necessary Cookies",
    description:
      "These cookies are essential for site functionality and cannot be disabled. They help you navigate the site and use its features.",
  },
  {
    key: "targeting",
    label: "Targeting Cookies",
    description:
      "Targeting cookies may be set through our site by our advertising partners to build a profile of your interests and show you relevant adverts on other sites.",
  },
  {
    key: "performance",
    label: "Performance Cookies",
    description:
      "Performance cookies allow us to count visits and traffic sources so we can measure and improve the performance of our site.",
  },
];

export default function TemplateGRC3({
  disableOverlay = false,
  categories = DEFAULT_CATEGORIES,
  onClose = () => {},
  onConfirm = () => {},
  onRejectAll = () => {},
  onAllowAll = () => {},
}) {
  const [selectedKey, setSelectedKey] = useState(categories[0].key);
  const [consents, setConsents] = useState(
    categories.reduce((acc, cat) => ({ ...acc, [cat.key]: false }), {})
  );
  const selected =
    categories.find((cat) => cat.key === selectedKey) || categories[0];

  const toggleConsent = (key) => {
    setConsents((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // The card UI:
  const card = (
    <div className="bg-[#F2F1FB] rounded-lg shadow-xl w-full max-w-4xl flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 bg-[#050038]">
        <div className="flex items-center space-x-2">
          <span className="text-xl font-bold text-white">GRC3</span>
          <h2 className="text-lg font-semibold text-white">
            Privacy Preference Center
          </h2>
        </div>
        <button onClick={onClose} className="text-white">
          <FaTimes size={20} />
        </button>
      </div>

      {/* Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <nav className="w-48 bg-[#F4F4F9] overflow-y-auto">
          <ul>
            {categories.map((cat) => (
              <li key={cat.key}>
                <button
                  className={`w-full flex justify-between items-center px-4 py-3 hover:bg-[#F2F1FB] transition-colors
                    ${
                      selectedKey === cat.key
                        ? "bg-[#FFFFFF] border-l-4 border-[#2B245C] text-[#2B245C]"
                        : "text-gray-700"
                    }`}
                  onClick={() => setSelectedKey(cat.key)}
                >
                  <span>{cat.label}</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only"
                      checked={consents[cat.key]}
                      onChange={() => toggleConsent(cat.key)}
                    />
                    <span
                      className="block w-8 h-5 rounded-full transition-colors"
                      style={{
                        backgroundColor: consents[cat.key] ? "#2B245C" : "#ccc",
                      }}
                    />
                    <span
                      className="absolute left-0.5 top-0.5 w-4 h-4 rounded-full bg-white transition-transform"
                      style={{
                        transform: consents[cat.key]
                          ? "translateX(1.5rem)"
                          : "none",
                      }}
                    />
                  </label>
                </button>
              </li>
            ))}
          </ul>
        </nav>

        {/* Main Panel */}
        <div className="flex-1 p-6 overflow-y-auto bg-white">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-[#2B245C]">
              {selected.label}
            </h3>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only"
                checked={consents[selected.key]}
                onChange={() => toggleConsent(selected.key)}
              />
              <span
                className="block w-10 h-6 rounded-full transition-colors"
                style={{
                  backgroundColor: consents[selected.key] ? "#2B245C" : "#ccc",
                }}
              />
              <span
                className="absolute left-0.5 top-0.5 w-5 h-5 rounded-full bg-white transition-transform"
                style={{
                  transform: consents[selected.key]
                    ? "translateX(1.5rem)"
                    : "none",
                }}
              />
            </label>
          </div>
          <p className="text-gray-700 mb-4">{selected.description}</p>
          <button className="text-[#2B245C] hover:underline">
            Cookies Details
          </button>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-end px-6 py-4 space-x-3 bg-[#F4F4F9]">
        <button
          onClick={onConfirm}
          className="px-4 py-2 bg-[#2B245C] text-white rounded-md hover:bg-opacity-90 transition"
        >
          Confirm My Choices
        </button>
        <button
          onClick={onRejectAll}
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition"
        >
          Reject All
        </button>
        <button
          onClick={onAllowAll}
          className="px-4 py-2 bg-[#F2F1FB] text-[#2B245C] rounded-md hover:bg-opacity-90 transition"
        >
          Allow All
        </button>
      </div>
    </div>
  );

  return disableOverlay ? (
    card
  ) : (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30 p-4"
      onClick={onClose}
    >
      <div onClick={(e) => e.stopPropagation()}>{card}</div>
    </div>
  );
}
