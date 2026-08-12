// src/components/ScalableFormBuilder/ModuleSelector.js
import React from "react";
import { ClientDashboardMenu } from "@/routes/DashboardRoutes";

export default function ModuleSelector({
  selectedModule,
  selectedSubModule,
  selectedMenu,
  onModuleChange,
  onSubModuleChange,
  onMenuChange,
}) {
  // ← moved in here
  const allModules = ClientDashboardMenu.map((m) => m.name);
  const subModulesFor = (mod) =>
    ClientDashboardMenu.find((m) => m.name === mod)?.children.map(
      (c) => c.name
    ) || [];
  const menusFor = (mod, sub) => {
    const modObj = ClientDashboardMenu.find((m) => m.name === mod);
    return (
      modObj?.children
        .find((c) => c.name === sub)
        ?.children.map((c) => c.name) || []
    );
  };

  return (
    <div className="flex space-x-2">
      {/* Module */}
      <select
        value={selectedModule}
        onChange={(e) => onModuleChange(e.target.value)}
        className="p-2 border rounded"
      >
        <option value="">— choose module —</option>
        {allModules.map((mod) => (
          <option key={mod} value={mod}>
            {mod}
          </option>
        ))}
      </select>

      {/* Sub-module */}
      <select
        value={selectedSubModule}
        onChange={(e) => onSubModuleChange(e.target.value)}
        disabled={!selectedModule}
        className="p-2 border rounded"
      >
        <option value="">— choose sub-module —</option>
        {subModulesFor(selectedModule).map((sub) => (
          <option key={sub} value={sub}>
            {sub}
          </option>
        ))}
      </select>

      {/* Menu */}
      <select
        value={selectedMenu}
        onChange={(e) => onMenuChange(e.target.value)}
        disabled={!selectedSubModule}
        className="p-2 border rounded"
      >
        <option value="">— choose menu —</option>
        {menusFor(selectedModule, selectedSubModule).map((m) => (
          <option key={m} value={m}>
            {m}
          </option>
        ))}
      </select>
    </div>
  );
}
