import React from "react";
import { ClientDashboardMenu } from "@/routes/DashboardRoutes";

export default function SelectionGuard({
  selectedModule,
  selectedSubModule,
  selectedMenu,
  isLoading,
  onModuleChange,
  onSubModuleChange,
  onMenuChange,
}) {
  // supported combinations
  const isFindingManagement =
    selectedModule === "Operations" &&
    selectedSubModule === "Finding Management";
  const isAssetBasedSimplified =
    selectedModule === "Risk Management" &&
    selectedSubModule === "Cybersecurity" &&
    selectedMenu === "Asset Based Simplified";
  const isDpiaV1 =
    selectedModule === "Privacy" &&
    selectedSubModule === "DPIA" &&
    selectedMenu === "DPIAV1";
  const isAppendixA3 =
    selectedModule === "Privacy" &&
    selectedSubModule === "Appendix" &&
    selectedMenu === "AppendixA3";
  const isAppendixA2 =
    selectedModule === "Privacy" &&
    selectedSubModule === "Appendix" &&
    selectedMenu === "AppendixA2";
  const isAppendixA1 =
    selectedModule === "Privacy" &&
    selectedSubModule === "Appendix" &&
    selectedMenu === "AppendixA1";
  const unsupported =
    selectedModule &&
    selectedSubModule &&
    selectedMenu &&
    !(isFindingManagement || isAssetBasedSimplified || isDpiaV1 || isAppendixA3 || isAppendixA2 || isAppendixA1);

  // find current module / submodule for the “nothing chosen yet” case
  const moduleObj = ClientDashboardMenu.find((m) => m.name === selectedModule);
  const subModules = moduleObj?.children || [];
  const subObj = subModules.find((s) => s.name === selectedSubModule);
  const menus = subObj?.children || [];

  // 1) nothing chosen yet
  if (!selectedModule || !selectedSubModule || !selectedMenu) {
    return (
      <div className="p-6 space-y-4">
        <p className="text-gray-600">
          Please select module, sub-module and menu to start customization.
        </p>
        <div className="flex space-x-2">
          <select
            value={selectedModule}
            onChange={(e) => {
              onModuleChange(e.target.value);
              onSubModuleChange("");
              onMenuChange("");
            }}
            className="p-2 border rounded"
          >
            <option value="">— choose module —</option>
            {ClientDashboardMenu.map((m) => (
              <option key={m.name} value={m.name}>
                {m.name}
              </option>
            ))}
          </select>

          <select
            value={selectedSubModule}
            onChange={(e) => {
              onSubModuleChange(e.target.value);
              onMenuChange("");
            }}
            disabled={!selectedModule}
            className="p-2 border rounded"
          >
            <option value="">— choose sub-module —</option>
            {subModules.map((c) => (
              <option key={c.name} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>

          <select
            value={selectedMenu}
            onChange={(e) => onMenuChange(e.target.value)}
            disabled={!selectedSubModule}
            className="p-2 border rounded"
          >
            <option value="">— choose menu —</option>
            {menus.map((c) => (
              <option key={c.name} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>
    );
  }

  // 2) loading
  if (isLoading) {
    return (
      <div className="p-6 text-center text-gray-600">
        Loading form configuration…
      </div>
    );
  }

  // 3) unsupported combination
  if (unsupported) {
    return (
      <div className="p-6 space-y-4">
        <p className="text-red-500">
          No Default Form is available for this module / sub-module / menu.
        </p>
        <p className="font-semibold">Pick one of the available combinations:</p>
        <div className="flex space-x-2">
          {/* Module */}
          <select
            value={selectedModule}
            onChange={(e) => {
              onModuleChange(e.target.value);
              onSubModuleChange("");
              onMenuChange("");
            }}
            className="p-2 border rounded"
          >
            <option value="">— choose module —</option>
            <option value="Operations">Operations</option>
            <option value="Risk Management">Risk Management</option>
            <option value="Privacy">Privacy</option>
          </select>

          {/* Sub-module */}
          <select
            value={selectedSubModule}
            onChange={(e) => {
              onSubModuleChange(e.target.value);
              onMenuChange("");
            }}
            disabled={!selectedModule}
            className="p-2 border rounded"
          >
            <option value="">— choose sub-module —</option>
            {selectedModule === "Operations" && (
              <option value="Finding Management">Finding Management</option>
            )}
            {selectedModule === "Risk Management" && (
              <option value="Cybersecurity">Cybersecurity</option>
            )}
            {selectedModule === "Privacy" && <option value="DPIA">DPIA</option>}
          </select>

          {/* Menu */}
          <select
            value={selectedMenu}
            onChange={(e) => onMenuChange(e.target.value)}
            disabled={!selectedSubModule}
            className="p-2 border rounded"
          >
            <option value="">— choose menu —</option>
            {selectedModule === "Risk Management" &&
              selectedSubModule === "Cybersecurity" && (
                <option value="Asset Based Simplified">
                  Asset Based Simplified
                </option>
              )}
            {selectedModule === "Privacy" && selectedSubModule === "DPIA" && (
              <option value="DPIAV1">DPIAV1</option>
            )}
            {/* For Operations -> Finding Management you may not have an extra menu */}
          </select>
        </div>
      </div>
    );
  }

  return null;
}
