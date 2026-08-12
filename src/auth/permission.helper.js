export function normalizePermissions(perms) {
  if (!perms) return [];
  if (Array.isArray(perms)) return perms.filter(Boolean).map(String);
  return [];
}

export function hasPermission(userPerms, required) {
  const perms = new Set(normalizePermissions(userPerms));
  return perms.has(required);
}

export function hasAnyPermission(userPerms, requiredList) {
  const perms = new Set(normalizePermissions(userPerms));
  return (requiredList || []).some((p) => perms.has(p));
}

export function hasAllPermissions(userPerms, requiredList) {
  const perms = new Set(normalizePermissions(userPerms));
  return (requiredList || []).every((p) => perms.has(p));
}
