/** Shared catalog helpers for role management and tenant onboarding. */

export const HIDDEN_CATALOG_MODULE_KEYS = new Set([
  "EMPLOYEE",
  "REVIEWER",
  "ASSIGNER",
]);

export function filterCatalogModules(modules = []) {
  return (Array.isArray(modules) ? modules : []).filter(
    (moduleItem) =>
      !HIDDEN_CATALOG_MODULE_KEYS.has(
        String(moduleItem?.key || "")
          .trim()
          .toUpperCase(),
      ),
  );
}

export function moduleLabelFromCatalog(catalog, moduleKey) {
  return catalog.find((m) => m.key === moduleKey)?.label || moduleKey;
}

export function subModulesForModule(catalog, moduleKey) {
  const mod = catalog.find((m) => m.key === moduleKey);
  return Array.isArray(mod?.submodules) ? mod.submodules : [];
}

/** All permission keys for a module (role templates + resource permissions). */
export function permissionKeysForModule(catalog, moduleKey) {
  const mod = catalog.find((m) => m.key === moduleKey);
  if (!mod) return [];

  const actions = new Set();

  Object.values(mod.roles || {}).forEach((items) => {
    (Array.isArray(items) ? items : []).forEach((a) => actions.add(a));
  });

  Object.entries(mod.permissions || {}).forEach(([resource, items]) => {
    (Array.isArray(items) ? items : []).forEach((action) => {
      actions.add(`${resource}.${action}`);
    });
  });

  return Array.from(actions).map((a) =>
    String(a).includes(".") ? String(a) : `${moduleKey}.${a}`,
  );
}

/** Permission keys from role templates only (viewer, editor, admin, …). */
export function roleTemplatePermissionKeys(catalog, moduleKeys = []) {
  const keys = Array.isArray(moduleKeys) ? moduleKeys : [];
  return Array.from(
    new Set(
      keys.flatMap((moduleKey) => {
        const mod = catalog.find((m) => m.key === moduleKey);
        if (!mod) return [];
        return Object.values(mod.roles || {})
          .flat()
          .map((p) => `${moduleKey}.${p}`);
      }),
    ),
  );
}

export function allPermissionKeysForModules(catalog, moduleKeys = []) {
  const keys = Array.isArray(moduleKeys) ? moduleKeys : [];
  return Array.from(
    new Set(keys.flatMap((k) => permissionKeysForModule(catalog, k))),
  );
}

export function templatePermissionKeysForModules(
  catalog,
  moduleKeys = [],
  templateRoleKey,
) {
  if (!templateRoleKey) return [];
  return (Array.isArray(moduleKeys) ? moduleKeys : []).flatMap((moduleKey) => {
    const mod = catalog.find((m) => m.key === moduleKey);
    const permsForRole = mod?.roles?.[templateRoleKey] || [];
    return permsForRole.map((p) => `${moduleKey}.${p}`);
  });
}

export function uniqueTemplateRoleKeys(catalog, moduleKeys = []) {
  return Array.from(
    new Set(
      (Array.isArray(moduleKeys) ? moduleKeys : []).flatMap((moduleKey) => {
        const mod = catalog.find((m) => m.key === moduleKey);
        return Object.keys(mod?.roles || {});
      }),
    ),
  );
}

export function toggleListItem(key, list) {
  return list.includes(key) ? list.filter((p) => p !== key) : [...list, key];
}

export function syncPermissionsToModules(catalog, moduleList, permissionList) {
  const allowed = new Set(allPermissionKeysForModules(catalog, moduleList));
  return (permissionList || []).filter((p) => allowed.has(p));
}

/** Flat submodule list filtered to selected modules. */
export function flattenSubModulesByModule(subModulesByModule = {}) {
  return Array.from(
    new Set(
      Object.values(subModulesByModule)
        .flat()
        .filter(Boolean),
    ),
  );
}

export function syncSubModulesByModule(catalog, moduleList, subModulesByModule) {
  const next = { ...(subModulesByModule || {}) };
  const allowedKeys = new Set(moduleList || []);

  Object.keys(next).forEach((moduleKey) => {
    if (!allowedKeys.has(moduleKey)) {
      delete next[moduleKey];
      return;
    }
    const allowed = new Set(subModulesForModule(catalog, moduleKey));
    next[moduleKey] = (next[moduleKey] || []).filter((s) => allowed.has(s));
  });

  return next;
}

/** Map flat backend submodules to per-module map. */
export function mapSubModulesToModules(
  selectedModules = [],
  rawSubModules = [],
  catalog = [],
) {
  const next = {};

  (Array.isArray(selectedModules) ? selectedModules : []).forEach(
    (moduleKey) => {
      const available = subModulesForModule(catalog, moduleKey);
      const matched = (Array.isArray(rawSubModules) ? rawSubModules : []).filter(
        (submodule) => available.includes(submodule),
      );
      if (matched.length > 0) {
        next[moduleKey] = matched;
      }
    },
  );

  return next;
}

export function toggleSubModuleInMap(subModulesByModule, moduleKey, submodule) {
  const current = subModulesByModule[moduleKey] || [];
  const nextForModule = current.includes(submodule)
    ? current.filter((item) => item !== submodule)
    : [...current, submodule];

  return {
    ...subModulesByModule,
    [moduleKey]: nextForModule,
  };
}

export function removeModuleFromAccessState({
  moduleKey,
  moduleKeys,
  permissions,
  subModulesByModule,
  catalog,
}) {
  const nextModules = moduleKeys.filter((m) => m !== moduleKey);
  const nextPerms = permissions.filter((p) => !p.startsWith(`${moduleKey}.`));
  const nextSubMap = { ...subModulesByModule };
  delete nextSubMap[moduleKey];

  return {
    moduleKeys: nextModules,
    permissions: syncPermissionsToModules(catalog, nextModules, nextPerms),
    subModulesByModule: syncSubModulesByModule(
      catalog,
      nextModules,
      nextSubMap,
    ),
  };
}

export function addModuleToAccessState({
  moduleKey,
  moduleKeys,
  permissions,
  subModulesByModule,
  catalog,
}) {
  if (!moduleKey || moduleKeys.includes(moduleKey)) {
    return { moduleKeys, permissions, subModulesByModule };
  }

  const nextModules = [...moduleKeys, moduleKey];
  return {
    moduleKeys: nextModules,
    permissions: syncPermissionsToModules(catalog, nextModules, permissions),
    subModulesByModule: syncSubModulesByModule(
      catalog,
      nextModules,
      subModulesByModule,
    ),
  };
}
