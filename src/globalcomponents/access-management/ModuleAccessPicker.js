import {
  allPermissionKeysForModules,
  moduleLabelFromCatalog,
  subModulesForModule,
  templatePermissionKeysForModules,
  toggleListItem,
  toggleSubModuleInMap,
  uniqueTemplateRoleKeys,
} from "@/auth/accessCatalogUtils";

/**
 * Shared module / submodule / permission picker used by role management
 * and tenant onboarding.
 */
export default function ModuleAccessPicker({
  catalog = [],
  moduleKeys = [],
  subModulesByModule = {},
  selectedPermissions = [],
  templateRole = "",
  onTemplateRoleChange,
  onTogglePermission,
  onToggleSubModule,
  onRemoveModule,
  showRemoveModule = true,
  showModuleTags = true,
  permissionChipActiveClass = "bg-[#2B245C] text-white border-[#2B245C]",
  permissionChipInactiveClass = "bg-white text-gray-700 border-gray-300 hover:bg-gray-100",
  submoduleChipActiveClass = "bg-cyan-700 text-white border-cyan-700",
  submoduleChipInactiveClass = "bg-white text-gray-700 border-gray-300 hover:bg-gray-100",
}) {
  const selectedModuleObjects = catalog.filter((m) => moduleKeys.includes(m.key));

  const displayPermissions = Array.from(
    new Set([
      ...(templateRole
        ? templatePermissionKeysForModules(catalog, moduleKeys, templateRole)
        : allPermissionKeysForModules(catalog, moduleKeys)),
      ...selectedPermissions,
    ]),
  );

  const templateRoleKeys = uniqueTemplateRoleKeys(catalog, moduleKeys);

  if (moduleKeys.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      {showModuleTags && moduleKeys.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {moduleKeys.map((moduleKey) => (
            <span
              key={moduleKey}
              className="inline-flex items-center gap-2 bg-[#2B245C] text-white px-3 py-1 rounded-full text-sm"
            >
              {moduleLabelFromCatalog(catalog, moduleKey)}
              {showRemoveModule && onRemoveModule && (
                <button
                  type="button"
                  onClick={() => onRemoveModule(moduleKey)}
                  className="text-white hover:text-red-200 transition"
                  title="Remove module"
                >
                  ×
                </button>
              )}
            </span>
          ))}
        </div>
      )}

      {moduleKeys.map((moduleKey) => {
        const availableSubModules = subModulesForModule(catalog, moduleKey);
        const selectedSubModules = subModulesByModule[moduleKey] || [];

        if (availableSubModules.length === 0) return null;

        return (
          <div
            key={`${moduleKey}-submodules`}
            className="rounded-xl border border-slate-200 bg-slate-50 p-4"
          >
            <div className="text-sm font-semibold text-[#2B245C]">
              {moduleLabelFromCatalog(catalog, moduleKey)}
            </div>
            <div className="mt-1 text-xs text-gray-600">
              Choose submodules to restrict access. Leave all unselected for full
              module access.
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {availableSubModules.map((submodule) => (
                <button
                  key={`${moduleKey}-${submodule}`}
                  type="button"
                  onClick={() => onToggleSubModule?.(moduleKey, submodule)}
                  className={`px-3 py-1 rounded-full text-sm transition border ${
                    selectedSubModules.includes(submodule)
                      ? submoduleChipActiveClass
                      : submoduleChipInactiveClass
                  }`}
                >
                  {submodule}
                </button>
              ))}
            </div>
          </div>
        );
      })}

      {moduleKeys.length > 0 && (
        <>
          {onTemplateRoleChange && templateRoleKeys.length > 0 && (
            <>
              <label className="block text-xs font-semibold text-gray-700">
                Permission Template (optional)
              </label>
              <select
                value={templateRole}
                onChange={(e) => onTemplateRoleChange(e.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 focus:border-indigo-500 focus:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-indigo-200 transition-all"
              >
                <option value="">Custom (no template)</option>
                {templateRoleKeys.map((rk) => (
                  <option key={rk} value={rk}>
                    {rk.charAt(0).toUpperCase() + rk.slice(1)}
                  </option>
                ))}
              </select>
              <p className="text-xs text-slate-500">
                If no permissions are selected, the tenant receives all
                permissions for enabled modules.
              </p>
            </>
          )}

          <label className="block text-xs font-semibold text-gray-700 mt-2">
            Permissions
          </label>
          <div className="text-xs text-gray-600 mb-2">
            Select one or more permission keys.
          </div>
          <div className="max-h-56 overflow-auto rounded-lg border border-gray-300 p-3 flex flex-wrap gap-2">
            {displayPermissions.length === 0 ? (
              <div className="text-sm text-gray-500">No permissions found</div>
            ) : (
              displayPermissions.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => onTogglePermission?.(p)}
                  className={`px-3 py-1 rounded-full text-sm transition border ${
                    selectedPermissions.includes(p)
                      ? permissionChipActiveClass
                      : permissionChipInactiveClass
                  }`}
                >
                  {p}
                </button>
              ))
            )}
          </div>
          <div className="text-xs text-gray-600 mt-2">
            Selected: <b>{selectedPermissions.length}</b> /{" "}
            {displayPermissions.length}
          </div>
        </>
      )}
    </div>
  );
}

export { toggleListItem, toggleSubModuleInMap };
