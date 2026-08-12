import React, { useState, useEffect } from "react";

function DynamicNis2Tabs({ tabItems }) {
  // Default to the first tab if available
  const [activeTab, setActiveTab] = useState(() => tabItems?.[0]?.component || null);

  // Update the default tab when `tabItems` change
  useEffect(() => {
    if (tabItems.length > 0 && !activeTab) {
      setActiveTab(tabItems[0].component);
    }
  }, [tabItems, activeTab]);

  const handleNavSelect = (component) => {
    setActiveTab(() => component);
  };

  const ActiveComponent = activeTab;

  return (
    <div className="p-6 bg-[#F4F4F9] min-h-screen">
      <div className="border rounded-lg shadow-md bg-white">
        {/* Tab Navigation */}
        <div className="border-b p-2 bg-gray-100">
          <div className="flex justify-center md:justify-start space-x-4">
            {tabItems.map((tab) => (
              <button
                key={tab.label}
                onClick={() => handleNavSelect(tab.component)}
                className={`relative py-2 px-4 text-md font-semibold transition duration-300 ${
                  activeTab === tab.component
                    ? "text-blue-600 font-bold"
                    : "text-gray-600 hover:text-blue-600"
                }`}
              >
                {tab.label}
                {activeTab === tab.component && (
                  <span className="absolute left-0 right-0 bottom-0 h-[2px] bg-blue-600" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div>
          {ActiveComponent ? <ActiveComponent key={ActiveComponent.name} /> : <p>No component selected</p>}
        </div>
      </div>
    </div>
  );
}

export default DynamicNis2Tabs;
