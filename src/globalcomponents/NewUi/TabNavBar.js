import React from "react";

export default function TabNavBar({ tabs, activeTab, onTabChange }) {
  return (
    <>
      {/* Tabs Header */}
      <nav
        className="flex bg-[#F2F1FB]
  border-b border-gray-200"
      >
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`
              relative flex items-center gap-2 px-6 py-4
              text-sm font-bold transition-all duration-200
              border-r border-gray-200
              ${
                activeTab === tab.id
                  ? "text-[#2B245C] border-b-2 border-[#2B245C]"
                  : "text-gray-600 hover:text-[#2B245C]"
              }
            `}
          >
            {tab.icon}
            <span>{tab.label}</span>
            {activeTab === tab.id && (
              <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#2B245C]" />
            )}
          </button>
        ))}
      </nav>
    </>
  );
}
