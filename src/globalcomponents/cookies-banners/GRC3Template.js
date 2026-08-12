// src/globalcomponents/cookies-banners/GRC3Template.jsx
import React, { useState, useEffect, useRef } from "react";
import { FaChevronDown, FaChevronUp, FaTimes } from "react-icons/fa";
const DATA_RIGHTS = {
  "Data Access": {
    title: "Right of Access",
    description: `Individuals can obtain confirmation as to whether personal data concerning them is being processed, 
and, where that is the case, access to the personal data and information about how and why it’s being processed.`,
  },
  "Data Rectification": {
    title: "Right to Rectification",
    description: `Individuals can request the correction of inaccurate or incomplete personal data concerning them.`,
  },
  "Data Deletion": {
    title: 'Right to Erasure ("Right to be Forgotten")',
    description: `Individuals can request the deletion of their personal data when, for example, it’s no longer necessary, 
consent is withdrawn, or processing is unlawful.`,
  },
  "Restrict Processing": {
    title: "Right to Restrict Processing",
    description: `Individuals can request that the processing of their personal data be limited in specific circumstances 
(e.g., data accuracy is contested or processing is unlawful).`,
  },
  "Data Portability": {
    title: "Right to Data Portability",
    description: `Individuals can request to receive their personal data in a structured, commonly used and machine-readable format, 
and/or have it transmitted directly to another controller.`,
  },
  "Right to Object": {
    title: "Right to Object",
    description: `Individuals can object to the processing of their personal data on grounds relating to their particular situation, 
including for direct marketing purposes.`,
  },
};


const CATEGORIES = [
  {
    key: "advertising",
    label: "Advertising",
    count: 1,
    description:
      "We use plugins to measure and personalize content. These plugins may share data with third parties.",
    plugins: ["Plugin A"],
  },
  {
    key: "analytics",
    label: "Analytics",
    count: 5,
    description:
      "We use analytics cookies to understand site usage and improve performance.",
    plugins: ["UserMaven", "Hotjar", "GA"],
  },
  {
    key: "av",
    label: "Audio/Video Player",
    count: 1,
    description:
      "Video players may collect viewing data for analytics and ads.",
    plugins: ["YouTube Player"],
  },
  {
    key: "interaction",
    label: "Customer Interaction",
    count: 3,
    description: "Chat and survey widgets to improve your support experience.",
    plugins: ["Intercom", "SurveyMonkey"],
  },
  {
    key: "essential",
    label: "Essential",
    count: 7,
    description:
      "Required for core functionality—security, sessions, navigation.",
    plugins: [],
  },
];

export default function GRC3Template() {
  // Banner state
  const [showBanner, setShowBanner] = useState(true);
  // Modal state
  const [showModal, setShowModal] = useState(false);
  // Tabs
  const [activeTab, setActiveTab] = useState("settings");
  // Accordion expansion
  const [expanded, setExpanded] = useState({});
  // Category toggles
  const [prefs, setPrefs] = useState(
    CATEGORIES.reduce((acc, c) => ({ ...acc, [c.key]: false }), {})
  );
  const [selectedRight, setSelectedRight] = useState(null);

  // Close modal on outside click
  const modalRef = useRef();
  useEffect(() => {
    const onClick = (e) => {
      if (
        showModal &&
        modalRef.current &&
        !modalRef.current.contains(e.target)
      ) {
        setShowModal(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [showModal]);

  const toggleCategory = (key) =>
    setExpanded((e) => ({ ...e, [key]: !e[key] }));
  const togglePref = (key) => setPrefs((p) => ({ ...p, [key]: !p[key] }));
  const viewAll = () => {
    const allOpen =
      Object.values(expanded).filter(Boolean).length === CATEGORIES.length;
    if (allOpen) setExpanded({});
    else
      setExpanded(CATEGORIES.reduce((a, c) => ({ ...a, [c.key]: true }), {}));
  };

  // Handlers
  const acceptAll = () => {
    console.log("Accepted all");
    setShowBanner(false);
    setShowModal(false);
  };
  const declineAll = () => {
    console.log("Declined all");
    setShowBanner(false);
    setShowModal(false);
  };
  const savePrefs = () => {
    console.log("Saved prefs:", prefs);
    setShowModal(false);
    setShowBanner(false);
  };

  return (
    <>
      {/* Bottom Banner */}
      {showBanner && (
        <div className="fixed bottom-0 inset-x-0 bg-[#2B245C] text-white flex flex-col md:flex-row items-center md:justify-between p-4 z-40">
          <div className="flex items-center space-x-3 mb-2 md:mb-0">
            <span className="font-bold text-xl">GRC³</span>
            <p>Your privacy matters. Manage your cookies.</p>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={declineAll}
              className="px-4 py-2 bg-[#F4F4F9] text-[#2B245C] rounded hover:bg-opacity-75 transition"
            >
              Decline all
            </button>
            <button
              onClick={() => setShowModal(true)}
              className="px-4 py-2 bg-transparent border border-white rounded hover:bg-white hover:text-[#2B245C] transition"
            >
              Customize
            </button>
            <button
              onClick={acceptAll}
              className="px-4 py-2 bg-white text-[#2B245C] rounded hover:bg-opacity-90 transition"
            >
              Accept all
            </button>
          </div>
        </div>
      )}

      {/* Centered Modal */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4"
          onClick={() => setShowModal(false)}
        >
          <div
            className="bg-white w-full max-w-4xl rounded-lg shadow-lg flex flex-col max-h-[90vh] overflow-hidden"
            ref={modalRef}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Tabs */}
            <div className="flex border-b relative">
              {[
                ["settings", "Settings"],
                ["policy", "Privacy policy"],
                ["declaration", "Cookie declaration"],
                ["data", "Rights Management"],
              ].map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => setActiveTab(key)}
                  className={`flex-1 px-4 py-3 text-center ${
                    activeTab === key
                      ? "bg-[#2B245C] text-white"
                      : "bg-white text-gray-700"
                  }`}
                >
                  {label}
                </button>
              ))}
              <button
                className="absolute top-2 right-2 text-gray-500 hover:text-gray-800"
                onClick={() => setShowModal(false)}
              >
                <FaTimes size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
              {activeTab === "settings" && (
                <>
                  <h2 className="text-xl font-semibold mb-2">
                    Privacy reminder from GRC³
                  </h2>
                  <p className="text-gray-700 mb-4">
                    To comply with data-protection laws, please select your
                    cookie preferences below and click “Save.” You can opt out
                    at any time.
                  </p>
                  {CATEGORIES.map((cat) => (
                    <div
                      key={cat.key}
                      className="bg-white rounded shadow-sm mb-4 overflow-hidden"
                    >
                      <div className="flex justify-between items-center px-4 py-3">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => toggleCategory(cat.key)}
                            className="text-gray-800 font-medium"
                          >
                            {cat.label}
                          </button>
                          <span className="text-sm text-gray-500">
                            {cat.count}
                          </span>
                        </div>
                        <div className="flex items-center space-x-3">
                          {/* Toggle */}
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              className="sr-only"
                              checked={prefs[cat.key]}
                              onChange={() => togglePref(cat.key)}
                            />
                            <span
                              className="block w-10 h-6 rounded-full transition-colors"
                              style={{
                                backgroundColor: prefs[cat.key]
                                  ? "#2B245C"
                                  : "#ccc",
                              }}
                            />
                            <span
                              className="absolute left-0.5 top-0.5 w-5 h-5 rounded-full bg-white transition-transform"
                              style={{
                                transform: prefs[cat.key]
                                  ? "translateX(1.5rem)"
                                  : "none",
                              }}
                            />
                          </label>
                          <button
                            onClick={() => toggleCategory(cat.key)}
                            className="text-gray-500 hover:text-gray-800"
                          >
                            {expanded[cat.key] ? (
                              <FaChevronUp />
                            ) : (
                              <FaChevronDown />
                            )}
                          </button>
                        </div>
                      </div>
                      {expanded[cat.key] && (
                        <div className="px-4 py-3 text-gray-600">
                          <p>{cat.description}</p>
                          {cat.plugins.length > 0 && (
                            <div className="mt-3 space-y-2">
                              {cat.plugins.map((plg) => (
                                <div
                                  key={plg}
                                  className="flex justify-between items-center bg-gray-100 rounded px-3 py-2"
                                >
                                  <span>{plg}</span>
                                  <button className="text-sm text-blue-600 hover:underline">
                                    Show cookies
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </>
              )}

              {activeTab === "policy" && (
                <>
                  <h2 className="text-xl font-semibold mb-4">Privacy policy</h2>
                  <p className="text-gray-700 leading-relaxed">
                    We value your privacy and are dedicated to safeguarding it.
                    This policy outlines how we process any personal data you
                    provide via our website. We recommend you read it
                    thoroughly.
                  </p>
                </>
              )}

              {activeTab === "declaration" && (
                <>
                  <h2 className="text-xl font-semibold mb-4">
                    Cookie declaration
                  </h2>
                  <ul className="list-disc list-inside text-gray-700 space-y-2">
                    <li>Measure site traffic</li>
                    <li>Provide essential functionality</li>
                    <li>Track browsing behavior</li>
                    <li>Collect social plugin engagement</li>
                    <li>Remember your preferences</li>
                  </ul>
                </>
              )}

              {activeTab === "data" && (
                <div>
                  <h2 className="text-2xl font-semibold mb-6">
                    Data Request Form
                  </h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <input
                      type="text"
                      placeholder="Your Name *"
                      className="border rounded px-4 py-2 w-full focus:outline-none focus:ring"
                    />
                    <input
                      type="email"
                      placeholder="Your Email *"
                      className="border rounded px-4 py-2 w-full focus:outline-none focus:ring"
                    />
                    <input
                      type="text"
                      placeholder="Address"
                      className="border rounded px-4 py-2 w-full focus:outline-none focus:ring"
                    />
                    <input
                      type="tel"
                      placeholder="Phone"
                      className="border rounded px-4 py-2 w-full focus:outline-none focus:ring"
                    />
                  </div>

                  <fieldset className="mb-6">
                    <legend className="font-medium mb-2">
                      Select your request:
                    </legend>
                    <div className="flex flex-col sm:flex-row sm:space-x-6">
                      {[
                        "Data Access",
                        "Data Rectification",
                        "Data Deletion",
                        "Restrict Processing",
                        "Data Portability",
                        "Right to Object",
                        "Other",
                      ].map((opt) => (
                        <label
                          key={opt}
                          className="inline-flex items-center py-1"
                        >
                          <input
                            type="radio"
                            name="dataRequestType"
                            value={opt}
                            checked={selectedRight === opt}
                            onChange={() => setSelectedRight(opt)}
                            className="form-radio h-5 w-5 text-indigo-600"
                          />
                          <span className="ml-2 text-gray-700">{opt}</span>
                        </label>
                      ))}
                    </div>
                  </fieldset>

                  {selectedRight && selectedRight !== "Other" && (
                    <div className="mt-4 p-4 bg-gray-50 border-l-4 border-indigo-500 rounded">
                      <h3 className="text-lg font-semibold mb-2">
                        {DATA_RIGHTS[selectedRight].title}
                      </h3>
                      <p className="text-gray-600 whitespace-pre-line">
                        {DATA_RIGHTS[selectedRight].description}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end bg-white px-6 py-4 space-x-4">
              {activeTab === "settings" ? (
                <>
                  <button
                    onClick={declineAll}
                    className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-100"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={viewAll}
                    className="px-4 py-2 border border-[#2B245C] text-[#2B245C] rounded hover:bg-[#F4F4F9]"
                  >
                    {Object.values(expanded).filter(Boolean).length ===
                    CATEGORIES.length
                      ? "Collapse all"
                      : "View options"}
                  </button>
                  <button
                    onClick={savePrefs}
                    className="px-4 py-2 bg-[#2B245C] text-white rounded hover:bg-opacity-90"
                  >
                    Save
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-[#2B245C] text-white rounded hover:bg-opacity-90"
                >
                  Close
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
