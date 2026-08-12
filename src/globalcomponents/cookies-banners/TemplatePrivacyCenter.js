// src/globalcomponents/cookies-banners/TemplatePrivacyCenter.jsx
import React, { useState } from "react";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";

// Built-in sample cookie data for standalone rendering
const SAMPLE_COOKIES = {
  "Technical Cookies": [
    {
      cookie_id: "1",
      cookie_name: "session_id",
      duration: "Session",
      type: "First Party",
      description: "Used to keep you logged in.",
      policyUrl: "#",
    },
  ],
  "Analytics Cookies": [
    {
      cookie_id: "2",
      cookie_name: "_ga",
      duration: "2 years",
      type: "Third Party",
      description: "Google Analytics tracking cookie.",
      policyUrl: "#",
    },
  ],
  "Profiling Cookies": [
    {
      cookie_id: "3",
      cookie_name: "_gcl_au",
      duration: "90 days",
      type: "Third Party",
      description: "AdSense cookie for ad performance.",
      policyUrl: "#",
    },
  ],
};

export default function TemplatePrivacyCenter({
  disableOverlay = false,
  heading = "We value your privacy",
  continueText = "Continue without accepting",
  backText = "← Back",
  acceptSelectionText = "Accept selection",
  acceptAllText = "Accept all cookies",
  cookiesData = SAMPLE_COOKIES,
  descriptions = {
    "Technical Cookies":
      "For the website to function properly, technical cookies are required.",
    "Analytics Cookies":
      "Analytics cookies are used to collect aggregated data on user interactions with our website, helping us analyze traffic, understand user behavior, and improve site performance and usability.",
    "Profiling Cookies":
      "Profiling cookies are used to provide you with customized services and send you targeted advertising messages in line with the preferences you expressed when browsing our website.",
  },
  headingColor = "#FFFFFF",
  headerBg = "#000000",
  modalBg = "#FFFFFF",
  textColor = "#374151",
  toggleOffBg = "#E5E7EB",
  toggleOnBg = "#111827",
  toggleHandleBg = "#FFFFFF",
  borderColor = "#D1D5DB",
  buttonBackBg = "#000000",
  buttonBackText = "#FFFFFF",
  buttonSelectBg = "#FFFFFF",
  buttonSelectText = "#374151",
  buttonAllBg = "#10B981",
  buttonAllText = "#FFFFFF",
}) {
  const [expanded, setExpanded] = useState(
    Object.keys(cookiesData).reduce(
      (acc, key) => ({ ...acc, [key]: false }),
      {}
    )
  );
  const [consent, setConsent] = useState(
    Object.keys(cookiesData).reduce(
      (acc, key) => ({ ...acc, [key]: false }),
      {}
    )
  );

  const toggleSection = (key) =>
    setExpanded((prev) => ({ ...prev, [key]: !prev[key] }));
  const toggleConsent = (key) =>
    setConsent((prev) => ({ ...prev, [key]: !prev[key] }));

  // The banner card itself:
  const card = (
    <div className="w-full max-w-3xl bg-white rounded-lg overflow-hidden flex flex-col">
      {/* Header */}
      <div
        className="flex justify-between items-center px-6 py-4"
        style={{ backgroundColor: headerBg }}
      >
        <h2 className="text-lg font-semibold" style={{ color: headingColor }}>
          {heading}
        </h2>
        <button className="text-sm font-medium" style={{ color: headingColor }}>
          {continueText}
        </button>
      </div>

      {/* Body */}
      <div className="overflow-y-auto" style={{ maxHeight: "60vh" }}>
        {Object.keys(cookiesData).map((key) => (
          <div key={key} className="border-b" style={{ borderColor }}>
            {/* Section header */}
            <div
              className="flex justify-between items-center px-6 py-4 cursor-pointer"
              onClick={() => toggleSection(key)}
              style={{ backgroundColor: modalBg }}
            >
              <div className="flex items-center space-x-2">
                {expanded[key] ? <FaChevronUp /> : <FaChevronDown />}
                <span className="font-medium" style={{ color: textColor }}>
                  {key}
                </span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only"
                  checked={consent[key]}
                  onChange={() => toggleConsent(key)}
                />
                <span
                  className="block w-10 h-6 rounded-full transition-colors"
                  style={{
                    backgroundColor: consent[key] ? toggleOnBg : toggleOffBg,
                  }}
                />
                <span
                  className="absolute left-0.5 top-0.5 w-5 h-5 rounded-full bg-white transition-transform"
                  style={{
                    transform: consent[key] ? "translateX(1.25rem)" : "none",
                    backgroundColor: toggleHandleBg,
                  }}
                />
              </label>
            </div>

            {/* Section content */}
            {expanded[key] && (
              <div className="px-6 pb-6" style={{ backgroundColor: modalBg }}>
                <p className="text-sm mb-2" style={{ color: textColor }}>
                  {descriptions[key]}
                </p>
                <button className="text-sm font-medium mb-4">
                  Hide cookies
                </button>
                <div className="bg-gray-50 rounded-md p-4">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr>
                        <th className="pb-2">Name</th>
                        <th className="pb-2">Duration</th>
                        <th className="pb-2">Type</th>
                        <th className="pb-2">Purpose</th>
                        <th className="pb-2" />
                      </tr>
                    </thead>
                    <tbody>
                      {cookiesData[key].map((cookie) => (
                        <tr
                          key={cookie.cookie_id}
                          className="border-t"
                          style={{ borderColor }}
                        >
                          <td className="py-2">{cookie.cookie_name}</td>
                          <td className="py-2">{cookie.duration}</td>
                          <td className="py-2">{cookie.type}</td>
                          <td className="py-2">{cookie.description}</td>
                          <td className="py-2 text-right">
                            <a
                              href={cookie.policyUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-3 py-1 rounded-full text-xs font-medium"
                              style={{
                                backgroundColor: borderColor,
                                color: textColor,
                              }}
                            >
                              privacy policy
                            </a>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Footer */}
      <div
        className="flex items-center justify-between px-6 py-4"
        style={{ backgroundColor: "#F9FAFB" }}
      >
        <button
          className="px-4 py-2 rounded-md font-medium"
          style={{ backgroundColor: buttonBackBg, color: buttonBackText }}
        >
          {backText}
        </button>
        <div className="flex space-x-4">
          <button
            className="px-4 py-2 rounded-md font-medium border"
            style={{
              backgroundColor: buttonSelectBg,
              color: buttonSelectText,
              borderColor,
            }}
          >
            {acceptSelectionText}
          </button>
          <button
            className="px-4 py-2 rounded-md font-medium"
            style={{ backgroundColor: buttonAllBg, color: buttonAllText }}
          >
            {acceptAllText}
          </button>
        </div>
      </div>
    </div>
  );

  // If disableOverlay is set, render just the card.
  return disableOverlay ? (
    card
  ) : (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4"
      onClick={() => {}}
    >
      <div onClick={(e) => e.stopPropagation()}>{card}</div>
    </div>
  );
}
