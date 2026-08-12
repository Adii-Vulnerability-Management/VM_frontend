// src/globalcomponents/tisaxcomponents/DynamicTabsWithRouter.js
import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";

function DynamicTabsWithRouter({
  tabItems,
  reportModalComponent,
  showSave = true,
  renderActions,
}) {
  const router = useRouter();
  const { vda_type = "", assessment_level = "" } = router.query;

  const filteredTabs =
    assessment_level === "AL2"
      ? tabItems.filter((tab) => tab.label !== "Prototype Protection")
      : tabItems;

  const [activeIdx, setActiveIdx] = useState(0);

  useEffect(() => {
    if (activeIdx >= filteredTabs.length) setActiveIdx(0);
  }, [filteredTabs.length, activeIdx]);

  const ActiveComponent = filteredTabs[activeIdx]?.component;

  return (
    <div className="pt-0 px-6 pb-6 bg-[#F4F4F9] min-h-screen">
      <div className="overflow-hidden">
        <div className="py-1 px-2 bg-[#F4F4F9]">
          <div className="flex items-center gap-2">
            {/* Tabs (left, wrap if needed) */}
            <div className="flex flex-wrap items-stretch">
              {filteredTabs.map((tab, idx) => {
                const Icon = tab.icon;
                const isActive = idx === activeIdx;

                return (
                  <React.Fragment key={tab.label}>
                    <button
                      onClick={() => setActiveIdx(idx)}
                      className={[
                        "relative px-4 py-2 inline-flex items-center gap-2 text-sm font-semibold transition",
                        isActive ? "text-[#050038]" : "text-gray-600 hover:text-[#050038]",
                        "bg-transparent",
                      ].join(" ")}
                      role="tab"
                      aria-selected={isActive}
                      aria-controls={`tab-panel-${idx}`}
                    >
                      {Icon ? <Icon size={18} aria-hidden="true" /> : null}
                      <span>{tab.label}</span>
                      {isActive && (
                        <span className="absolute left-0 right-0 -bottom-[1px] h-[2px] bg-[#050038]" />
                      )}
                    </button>

                    {/* divider between buttons */}
                    {idx < filteredTabs.length - 1 && (
                      <span aria-hidden="true" className="mx-3 h-6 w-px bg-gray-300" />
                    )}
                  </React.Fragment>
                );
              })}
            </div>

            {/* Actions (right) */}
            <div className="ml-auto flex items-center">
              {typeof renderActions === "function" ? (
                renderActions({ vda_type, assessment_level })
              ) : vda_type ? (
                reportModalComponent || <p />
              ) : showSave ? (
                <button className="bg-blue-600 text-white px-6 py-2 rounded shadow-md text-sm hover:bg-blue-700 transition duration-300">
                  Save all
                </button>
              ) : null}
            </div>
          </div>
        </div>

        {/* Content wrapper directly under tabs: WHITE background */}
        <div className="bg-white rounded-md border border-gray-200 shadow-sm">
          <div id={`tab-panel-${activeIdx}`} role="tabpanel" className="p-4">
            {ActiveComponent ? <ActiveComponent /> : <p>No component selected</p>}
          </div>
        </div>
      </div>
    </div>
  );
}

export default DynamicTabsWithRouter;
