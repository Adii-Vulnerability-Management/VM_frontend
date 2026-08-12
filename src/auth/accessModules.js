const MODULE_KEY_ALIASES = {
  management_hub: "management_hub",
  access_management: "access_management",
  user_hub: "user_hub",
  work_bench: "workbench",
  administration: "access_management",
  "administration_&_settings": "access_management",
  "vendor_&_customer_trust": "vendor",
  "vendor_&_customer": "vendor",
  vendor_and_customer_trust: "vendor",
  vendor_and_customer: "vendor",
  security_compliance: "security",
  risk_management: "risk",
  tprm: "third_party_risk_management",
  tprm_vendor_management: "tprm_vendor_management",
  tprm_client_management: "tprm_client_management",
  third_party_risk_management: "third_party_risk_management",
  grc_as_a_service: "grc",
  industry_specific_frameworks: "industry",
  privacy_consent_management: "privacy_consents",
  mandate_management: "mandate",
  mandates: "mandate",
  business_continuity: "business_continuity",
  business_continuity_management: "business_continuity",
  bcm: "business_continuity",
  mass_mailing: "mass_mailing",
  mass_mail: "mass_mailing",
  email_campaign: "mass_mailing",
  email_campaigns: "mass_mailing",
};

export const KNOWN_MODULE_KEYS = new Set([
  "security",
  "operations",
  "risk",
  "vendor",
  "tprm",
  "tprm_vendor_management",
  "tprm_client_management",
  "third_party_risk_management",
  "privacy",
  "privacy_consents",
  "scanner",
  "industry",
  "audit",
  "grc",
  "access_management",
  "management_hub",
  "user_hub",
  "workbench",
  "mandate",
  "business_continuity",
  "CONSENT_DASHBOARD",
  "mass_mailing",
  "consent_dashboard",
]);

export const SUBMODULE_CATALOG = {
  security: ["dashboard", "framework", "controls", "evidence task"],
  mandate: [
    "dashboard",
    "mandate dashboard",
    "mandate intake",
    "mandate review",
    "review",
    "sma review",
    "legal review",
    "controls repository",
    "control audit",
  ],
  business_continuity: [
    "dashboard",
    "vendors",
    "assets",
    "processes",
    "bia",
    "dr plans / dr auto",
    "dr plans",
    "dr auto",
    "risks",
    "resilience dashboard",
    "resilience",
  ],
  operations: [
    "people",
    "policy",
    "procedure",
    "training",
    "finding management",
    "change management",
    "event management",
    "breach management",
    "incident management",
    "nis2",
    "nis2 self assessment",
  ],
  risk: [
    "risk assessment",
    "cybersecurity",
    "project",
    "contract",
    "vulnerability management",
    "exception management",
    "menu",
    "add new menu",
    "all menu list",
  ],
  vendor: [
    "vendor trust",
    "vendor details",
    "vendor questionnaire",
    "vendor login",
    "engagements",
    "contracts",
    "findings",
    "issues",
    "customer trust",
    "client management",
    "reviewer login",
  ],
  third_party_risk_management: [
    "dashboard",
    "third party risk management",
    "tprm workflow",
    "committee members",
    "third party questionnaire",
    "third party assessment",
    "third party details",
    "meeting notes/minutes",
    "third party login",
    "blacklisting",
    "incident portal",
    "governance approval",
    "physical audit",
    "sla management",
    "findings/capa",
    "reporting",
    "engagements",
    "contracts",
    "findings",
    "issues",
    "audit",
  ],
  privacy: [
    "dashboard",
    "frameworks",
    "dpia / appendix",
    "data flow",
    "data mapping",
    "mapping dashboard",
    "bpa",
    "system activities",
    "data flows",
    "vendors",
    "coverage",
    "ropa",
    "purpose",
    "framework mapping",
    "framework topics",
    "framework map",
    "data dictionary",
    "data dashboard",
    "data categories",
    "data classifications",
    "data subject types",
    "data elements",
    "retention policies",
    "retention rules",
    "reports",
    "consent management",
    "webform consent",
    "child consent",
    "child consent dashboard",
    "rights management",
    "dsar dashboard",
    "assignee dashboard",
    "user dashboard",
    "dsar",
    "cookie consent",
    "cookie consent dashboard",
    "websites",
    "cookie consent management",
    "entities",
    "mass mailing",
    "campaigns",
    "recipients preview",
  ],
  scanner: ["data inventory", "jobs", "scanner config"],
  industry: [
    "assessment",
    "automobile",
    "tisax",
    "6.0.3",
    "tisax audit",
    "assign controls",
    "assign team",
    "iso 42001",
    "banking and finance",
    "ffiec",
    "cscrf",
    "irda",
    "cra",
    "rbi",
    "rbi tracker",
    "rbi tracker user portal",
    "healthcare",
  ],
  audit: [
    "internal audit",
    "internal audit - reviewer",
    "internal audit - approver",
    "internal audit - auditor",
  ],
  grc: ["dashboard", "average dashboard", "detailed dashboard"],
  access_management: [
    "governance hub",
    "overview",
    "dashboard",
    "role management",
    "user creation",
    "assign roles",
    "tenant onboarding",
  ],
  management_hub: [
    "governance hub",
    "overview",
    "team management",
    "division management",
    "department management",
    "business management",
    "process management",
    "organization management",
    "meeting management",
    "compliance hub",
    "compliance dashboard",
    "system monitoring",
    "audit logs",
    "notification hub",
    "notification management",
    "task management hub",
    "create task",
    "task summary",
    "integration hub",
    "integration management",
    "asset management",
    "privacy",
    "settings",
  ],
  privacy_consents: [
    "privacy consent management",
    "web form configuration",
    "cookies consent",
    "banner templates",
    "cookie consent category",
    "child consent",
    "config",
  ],
  // mass_mailing: ["campaigns", "recipients preview"],
  user_hub: ["user framework portal", "user portal"],
  workbench: ["custom workflow", "form builder", "cybersecurity", "response"],
};

export const SUBMODULE_INHERITANCE = {
  mandate: {
    "mandate dashboard": ["dashboard"],
    "controls repository": ["control audit"],
  },
  business_continuity: {
    "dr plans / dr auto": ["dr plans", "dr auto"],
  },
  privacy: {
    "data flow": [
      "data mapping",
      "mapping dashboard",
      "bpa",
      "system activities",
      "data flows",
      "vendors",
      "coverage",
      "ropa",
      "purpose",
      "framework mapping",
      "framework topics",
      "framework map",
      "data dictionary",
      "data categories",
      "data classifications",
      "data subject types",
      "data elements",
      "retention policies",
      "retention rules",
      "reports",
    ],
    "data mapping": [
      "mapping dashboard",
      "bpa",
      "system activities",
      "data flows",
      "vendors",
      "coverage",
      "ropa",
      "purpose",
    ],
    "framework mapping": ["framework topics", "framework map"],
    "data dictionary": [
      "data categories",
      "data classifications",
      "data subject types",
      "data elements",
      "purpose",
    ],
    "rights management": [
      "dsar dashboard",
      "assignee dashboard",
      "user dashboard",
      "dsar",
    ],
    "consent management": ["webform consent", "child consent dashboard", "child consent"],
    "cookie consent": ["cookie consent management"],
    "mass mailing": ["campaigns"],
  },
  management_hub: {
    "governance hub": [
      "overview",
      "role management",
      "user creation",
      "assign roles",
      "team management",
      "division management",
      "department management",
      "business management",
      "process management",
      "organization management",
      "meeting management",
    ],
    "compliance hub": [
      "compliance dashboard",
      "system monitoring",
      "audit logs",
    ],
    "notification hub": ["notification management"],
    "task management hub": ["create task", "task summary"],
    "integration hub": [
      "integration management",
      "asset management",
      "privacy",
    ],
    "privacy consent management": [
      "web form configuration",
      "cookies consent",
      "banner templates",
      "cookie consent category",
      "child consent",
      "config",
    ],
  },
  vendor: {
    "vendor trust": ["vendor details", "vendor questionnaire", "vendor login"],
    "customer trust": ["client management", "reviewer login"],
  },
  risk: {
    menu: ["add new menu", "all menu list"],
  },
  industry: {
    automobile: ["tisax", "tisax audit", "iso 42001"],
    "banking and finance": [
      "ffiec",
      "cscrf",
      "irda",
      "cra",
      "rbi",
      "rbi tracker",
      "rbi tracker user portal",
    ],
  },
};

export function normalizeModuleKey(raw) {
  const key = String(raw || "")
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, "_");

  if (!key) return "";
  return MODULE_KEY_ALIASES[key] || key;
}

export function normalizeSubmoduleLabel(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ");
}

function splitModuleCandidates(value) {
  return String(value || "")
    .split(",")
    .map((part) => normalizeModuleKey(part))
    .filter(Boolean);
}

export function getModuleKeysFromPermissions(permissionKeys = []) {
  return new Set(
    (permissionKeys || [])
      .map((permission) =>
        normalizeModuleKey(String(permission || "").split(".")[0]),
      )
      .filter(Boolean),
  );
}

export function getPermissionsFromAccessEntries(entries = []) {
  const actionPermissions = (Array.isArray(entries) ? entries : []).flatMap(
    (entry) => {
      if (!entry || typeof entry === "string") return [];

      const moduleKeys = resolveModuleKeysFromAccessEntry(entry);
      const primaryModule = moduleKeys[0] || normalizeModuleKey(entry?.module);
      if (!primaryModule) return [];

      const actions = Array.isArray(entry?.actions)
        ? entry.actions
        : typeof entry?.actions === "string"
          ? entry.actions.split(",")
          : [];

      const reviews = Array.isArray(entry?.review)
        ? entry.review
        : typeof entry?.review === "string"
          ? entry.review.split(",")
          : [];

      return [
        ...actions.map((action) => `${primaryModule}.${action}`),
        ...reviews.map((review) => `${primaryModule}.review.${review}`),
      ];
    },
  );

  return Array.from(
    new Set(
      [
        ...(Array.isArray(entries) ? entries : []).flatMap((entry) =>
          Array.isArray(entry?.permissions) ? entry.permissions : [],
        ),
        ...actionPermissions,
      ]
        .map((permission) =>
          String(permission || "")
            .trim()
            .toLowerCase(),
        )
        .filter(Boolean),
    ),
  );
}

export function getEffectivePermissionKeys(user) {
  const modulePermissions = getPermissionsFromAccessEntries(user?.modules);
  const directPermissions = Array.isArray(user?.permissions)
    ? user.permissions
        .map((permission) =>
          String(permission || "")
            .trim()
            .toLowerCase(),
        )
        .filter(Boolean)
    : [];

  const legacyPermissionKeys = Array.isArray(user?.permissionKeys)
    ? user.permissionKeys
        .map((permission) =>
          String(permission || "")
            .trim()
            .toLowerCase(),
        )
        .filter(Boolean)
    : [];

  return Array.from(
    new Set([
      ...modulePermissions,
      ...directPermissions,
      ...legacyPermissionKeys,
    ]),
  );
}

export function resolveModuleKeysFromAccessEntry(entry) {
  if (!entry) return [];
  if (typeof entry === "string") return splitModuleCandidates(entry);

  const directKeys = [
    entry?.moduleKey,
    entry?.key,
    entry?.module,
    entry?.moduleName,
    entry?.label,
  ]
    .flatMap(splitModuleCandidates)
    .filter(Boolean);

  const permissionPrefixes = Array.isArray(entry?.permissions)
    ? entry.permissions
        .map((perm) => normalizeModuleKey(String(perm || "").split(".")[0]))
        .filter(Boolean)
    : [];

  return Array.from(
    new Set(
      [...directKeys, ...permissionPrefixes].filter(
        (key) => key && KNOWN_MODULE_KEYS.has(key),
      ),
    ),
  );
}

export function getUserAccessEntries(user) {
  return Array.isArray(user?.modules) ? user.modules : [];
}

export function buildRestrictedSubmodulesByModule(entries = []) {
  const out = {};

  for (const entry of Array.isArray(entries) ? entries : []) {
    if (!entry || typeof entry === "string") continue;

    const rawSubmodules = Array.isArray(entry?.subModules)
      ? entry.subModules
      : Array.isArray(entry?.submodules)
        ? entry.submodules
        : [];

    const normalizedSubmodules = Array.from(
      new Set(rawSubmodules.map(normalizeSubmoduleLabel).filter(Boolean)),
    );

    if (normalizedSubmodules.length === 0) continue;

    const moduleKeys = resolveModuleKeysFromAccessEntry(entry);

    for (const moduleKey of moduleKeys) {
      const allowedLabels = new Set(SUBMODULE_CATALOG[moduleKey] || []);
      const matchedSubmodules = normalizedSubmodules.filter((submodule) =>
        allowedLabels.has(submodule),
      );

      if (matchedSubmodules.length === 0 && moduleKeys.length !== 1) continue;

      if (!out[moduleKey]) {
        out[moduleKey] = new Set();
      }

      for (const submodule of matchedSubmodules.length > 0
        ? matchedSubmodules
        : normalizedSubmodules) {
        out[moduleKey].add(submodule);
      }
    }
  }

  return out;
}

export function expandSubmoduleAccess(moduleKey, submodules = []) {
  const normalizedModuleKey = normalizeModuleKey(moduleKey);
  const inheritance = SUBMODULE_INHERITANCE[normalizedModuleKey] || {};
  const expanded = new Set(
    (submodules || []).map(normalizeSubmoduleLabel).filter(Boolean),
  );

  let changed = true;
  while (changed) {
    changed = false;

    for (const label of Array.from(expanded)) {
      const inherited = inheritance[label] || [];

      for (const child of inherited) {
        const normalizedChild = normalizeSubmoduleLabel(child);
        if (!expanded.has(normalizedChild)) {
          expanded.add(normalizedChild);
          changed = true;
        }
      }
    }
  }

  return Array.from(expanded);
}
