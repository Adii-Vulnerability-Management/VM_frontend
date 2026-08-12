import routesModulesData from "@/config/routes-modules.json";
import {
  expandSubmoduleAccess,
  normalizeModuleKey,
  normalizeSubmoduleLabel,
  resolveModuleKeysFromAccessEntry,
} from "./accessModules";

const PUBLIC_PATHS = [
  "/",
  "/dashboard",
  "/login",
  "/signup",
  "/errors/access-denied",
  "/contact",
  "/coming-soon",
];

const TPRM_VENDOR_MANAGEMENT_ROUTES = [
  "/vendor-trust/VendorLogin",
  "/vendor-trust/VendorPass",
  "/vendor-trust/auditreport",
  "/vendor-trust/VendorResponseInput",
  "/vendor-trust/dashboard",
  "/tprm/vendor-trust/VendorDashboard",
  "/tprm/vendor-trust/VendorLogin",
  "/tprm/vendor-trust/VendorPass",
  "/tprm/vendor-trust/VendorQuestionnaire",
  "/tprm/vendor-trust/VendorQuestionnairetable",
  "/tprm/vendor-trust/VendorResponseInput",
  "/tprm/vendor-trust/vendorSchedule",
  "/tprm/vendor-trust/vendorSchedule/indexes",
  "/tprm/vendor-trust/auditreport",
  "/tprm/vendor-trust/engagements",
  "/tprm/vendor-trust/contracts",
  "/tprm/vendor-trust/findings",
  "/tprm/vendor-trust/issues",
];

const THIRD_PARTY_RISK_MANAGEMENT_ROUTES = [
  "/third-parties-risk-management",
  "/third-parties-risk-management/dashboard",
  "/third-parties-risk-management/committee-members",
  "/third-parties-risk-management/ThirdPartyLogin",
  "/third-parties-risk-management/blacklisting",
  "/third-parties-risk-management/ThirdPartyPass",
  "/third-parties-risk-management/auditreport",
  "/third-parties-risk-management/ThirdPartyResponseInput",
  "/third-parties-risk-management/TPRMDetails",
  "/third-parties-risk-management/TPRMManagement",
  "/third-parties-risk-management/TPRMDataImportSheet",
  "/third-parties-risk-management/Meeting",
  "/third-parties-risk-management/tprmSchedule",
  "/third-parties-risk-management/tprmSchedule/indexes",
  "/third-parties-risk-management/TPRMQuestionnaire",
  "/third-parties-risk-management/TPRMQuestionnairetable",
  "/third-parties-risk-management/IncidentReporting",
  "/third-parties-risk-management/GovernanceApproval",
  "/third-parties-risk-management/PhysicalAudit",
  "/third-parties-risk-management/sla",
  "/third-parties-risk-management/FindingsCapa",
  "/third-parties-risk-management/Reporting",
  "/third-parties-risk-management/engagements",
  "/third-parties-risk-management/contracts",
  "/third-parties-risk-management/findings",
  "/third-parties-risk-management/issues",
];

const TPRM_CLIENT_MANAGEMENT_ROUTES = [
  "/customer-trust/ReviewerLogin",
  "/customer-trust/ReviewerPass",
  "/customer-trust/auditreport",
  "/customer-trust/CustomerResponseInput",
  "/customer-trust/dashboard",
  "/customer-trust/CustomerQuestionnaire",
  "/customer-trust/CustomerQuestionnairetable",
  "/tprm/customer-trust/CustomerDashboard",
  "/tprm/customer-trust/ReviewerLogin",
  "/tprm/customer-trust/ReviewerPass",
  "/tprm/customer-trust/CustomerQuestionnaire",
  "/tprm/customer-trust/CustomerQuestionnairetable",
  "/tprm/customer-trust/CustomerResponseInput",
  "/tprm/customer-trust/customerSchedule",
  "/tprm/customer-trust/customerSchedule/indexes",
  "/tprm/customer-trust/auditreport",
];

const TPRM_PERMISSION_ROUTE_MAP = {
  "tprm.vendor_login.access": TPRM_VENDOR_MANAGEMENT_ROUTES,
  "tprm.reviewer_login.access": TPRM_CLIENT_MANAGEMENT_ROUTES,
  "access.third_party_assessment.view": THIRD_PARTY_RISK_MANAGEMENT_ROUTES,
};

const SCANNER_ALLOWED_ROUTES = [
  "/admin/dataFlow/assets",
  "/admin/dataFlow/assets/[assetId]",
  "/admin/dataFlow/jobs",
  "/admin/dataFlow/jobs/[jobId]",
];

const SCANNER_PERMISSION_ROUTE_MAP = {
  "scanner.read": SCANNER_ALLOWED_ROUTES,
  "scanner.create": SCANNER_ALLOWED_ROUTES,
  "scanner.update": SCANNER_ALLOWED_ROUTES,
  "scanner.assign": SCANNER_ALLOWED_ROUTES,
  "scanner.delete": SCANNER_ALLOWED_ROUTES,
  "scanner.manage": SCANNER_ALLOWED_ROUTES,
  "scanner.export": SCANNER_ALLOWED_ROUTES,
};

const SCANNER_ONLY_ROUTES = [
  ...SCANNER_ALLOWED_ROUTES,
  "/admin/scanner",
  "/admin/dataFlow/scanner",
  "/admin/dataFlow/scanner/rulebook",
  "/privacy/scanner",
];

const MANDATE_ALLOWED_ROUTES = [
  "/mandate-management/dashboard",
  "/mandate-management",
  "/mandate-management/[id]",
  "/mandates/new",
  "/mandates/mandates-dashboard",
  "/mandates/mandates-dashboard/[id]",
  "/approve-mandates/sme-dashboard",
  "/approve-mandates/sme-dashboard/[id]",
  "/approve-mandates/legal-dashboard",
  "/approve-mandates/legal-dashboard/[id]",
  "/controls/controls-dashboard",
  "/controls/controls-dashboard/[id]",
  "/compare_mandates",
];

const MANDATE_PERMISSION_ROUTE_MAP = {
  "mandate.read": [],
  "mandate.create": ["/mandates/new", "/mandate-management/new"],
  "mandate.update": MANDATE_ALLOWED_ROUTES,
  "mandate.delete": MANDATE_ALLOWED_ROUTES,
  "mandate.manage": MANDATE_ALLOWED_ROUTES,
  "mandate.assign": [
    "/mandates/mandates-dashboard",
    "/mandates/mandates-dashboard/[id]",
  ],
  "mandate.audit": [
    "/controls/controls-dashboard",
    "/controls/controls-dashboard/[id]",
  ],
  "mandate.export": MANDATE_ALLOWED_ROUTES,
  "mandate.extract": [
    "/controls/controls-dashboard",
    "/controls/controls-dashboard/[id]",
    "/mandates/new",
  ],
  "mandate.notify": [
    "/mandates/mandates-dashboard",
    "/mandates/mandates-dashboard/[id]",
  ],
  "mandate.upload": ["/mandates/new"],
  "mandate.workflow": MANDATE_ALLOWED_ROUTES,
  "mandate.review.legal": [
    "/approve-mandates/legal-dashboard",
    "/approve-mandates/legal-dashboard/[id]",
  ],
  "mandate.review.sma": [
    "/approve-mandates/sme-dashboard",
    "/approve-mandates/sme-dashboard/[id]",
  ],
};

const PRIVACY_SCANNER_SHARED_SUBMODULES = new Set([
  "privacy",
  "data flow",
  "data mapping",
  "mapping dashboard",
]);

const TENANT_ADMIN_ACCESS_ROUTES = [
  "/management-hub/governance-hub/access-management/dashboard",
  "/management-hub/governance-hub/access-management/role-management",
  "/management-hub/governance-hub/access-management/user-management",
  "/admin/roleassignment",
];

const SUPER_ADMIN_ONLY_ROUTES = ["/admin/tenant-onboarding"];

function clean(p) {
  return ((p || "").split("?")[0].replace(/\/+$/, "") || "/").toLowerCase();
}

function normalizeKey(x) {
  return String(x || "")
    .trim()
    .toLowerCase();
}

function normalizeLabel(x) {
  return normalizeSubmoduleLabel(x);
}

function buildModuleRoutes() {
  const { modules } = routesModulesData;
  const moduleRoutes = {};

  for (const m of modules) {
    const routes = (m.routes || [])
      .map(clean)
      .filter((p) => !p.includes("/api") && p !== "/");

    routes.sort((a, b) => b.length - a.length);
    moduleRoutes[normalizeModuleKey(m.moduleKey)] = routes;
  }

  const accessRoutes = moduleRoutes.access || [];
  moduleRoutes.access_management = accessRoutes.filter(
    (route) =>
      route.includes("/access-management") || route === "/admin/roleassignment",
  );
  moduleRoutes.management_hub = accessRoutes.filter(
    (route) =>
      !route.includes("/access-management") &&
      route !== "/admin/roleassignment",
  );
  moduleRoutes.user_hub = [
    "/user/framework",
    "/user/framework/frameworks",
    "/user/framework/frameworks/[cardID]/details",
    "/user/framework/dashboard",
    "/user/framework/task",
    "/user/framework/notification",
    "/user/portal",
    "/user/portal/dashboard",
    "/user/portal/notifications",
    "/user/portal/profile-settings",
  ].map(clean);
  moduleRoutes.workbench = [
    "/workbench/scalable-form",
    "/workbench/fromapi",
    "/workbench/fetchresponsebymeta",
  ].map(clean);
  moduleRoutes.privacy_consents = [
    "/admin/scanner/webform-configuration",
    "/admin/scanner/banner-templates",
    "/admin/scanner/consent-categories",
    "/privacy/child-consent",
  ].map(clean);
  moduleRoutes.mandate = MANDATE_ALLOWED_ROUTES.map(clean);
  moduleRoutes.tprm_vendor_management =
    TPRM_VENDOR_MANAGEMENT_ROUTES.map(clean);
  moduleRoutes.tprm_client_management =
    TPRM_CLIENT_MANAGEMENT_ROUTES.map(clean);
  moduleRoutes.third_party_risk_management =
    THIRD_PARTY_RISK_MANAGEMENT_ROUTES.map(clean);
  moduleRoutes.business_continuity = [
    "/business-continuity",
    "/business-continuity/assets",
    "/business-continuity/vendors",
    "/business-continuity/processes",
    "/business-continuity/bia",
    "/business-continuity/dr-plans",
    "/business-continuity/dr-auto",
    "/business-continuity/risks",
    "/business-continuity/resilience",
  ].map(clean);
  moduleRoutes.mass_mailing = ["/mass-mailing"].map(clean);
  return moduleRoutes;
}

const MODULE_ROUTES = buildModuleRoutes();

function escapeRegex(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function routePatternToRegex(routePattern) {
  const cleaned = clean(routePattern);
  const re = escapeRegex(cleaned).replace(/\\\[.+?\\\]/g, "[^/]+");
  return new RegExp("^" + re + "$");
}

function isRouteInModule(pathname, moduleKey) {
  const path = clean(pathname);
  const routes = MODULE_ROUTES[normalizeModuleKey(moduleKey)] || [];

  if (routes.includes(path)) return true;

  for (const r of routes) {
    if (r.includes("[") && r.includes("]")) {
      const re = routePatternToRegex(r);
      if (re.test(path)) return true;
    }
  }

  return false;
}

const SUBMODULE_ROUTE_RULES = {
  security: {
    Dashboard: ["/compliance/dashboard"],
    Framework: [
      "/compliance/frameworks*",
      "/compliance/frameworks/[cardID]/details",
    ],
    Controls: [
      "/compliance/controls*",
      "/compliance/monitoring",
      "/compliance/reports",
    ],
    "Evidence Task": ["/compliance/assignments*"],
  },
  mandate: {
    Dashboard: ["/mandate-management/dashboard"],
    "Mandate Dashboard": [
      "/mandates/mandates-dashboard",
      "/mandates/mandates-dashboard/[id]",
      "/mandate-management",
      "/mandate-management/[id]",
    ],
    "Mandate Intake": ["/mandates/new"],
    "Mandate Review": [
      "/mandates/mandates-dashboard",
      "/mandates/mandates-dashboard/[id]",
      "/mandate-management",
      "/mandate-management/[id]",
    ],
    Review: [],
    "SMA Review": [
      "/approve-mandates/sme-dashboard",
      "/approve-mandates/sme-dashboard/[id]",
    ],
    "SME Review": [
      "/approve-mandates/sme-dashboard",
      "/approve-mandates/sme-dashboard/[id]",
    ],
    "Legal Review": [
      "/approve-mandates/legal-dashboard",
      "/approve-mandates/legal-dashboard/[id]",
    ],
    "Controls Repository": [
      "/controls/controls-dashboard",
      "/controls/controls-dashboard/[id]",
      "/compare_mandates",
    ],
    "Control Audit": ["/controls/controls-dashboard/[id]", "/compare_mandates"],
  },
  business_continuity: {
    Dashboard: ["/business-continuity"],
    Vendors: ["/business-continuity/vendors"],
    Assets: ["/business-continuity/assets"],
    Processes: ["/business-continuity/processes"],
    "BIA Calculation + Save": ["/business-continuity/bia"],
    BIA: ["/business-continuity/bia"],
    "DR Plans / DR Auto": [
      "/business-continuity/dr-plans",
      "/business-continuity/dr-auto",
    ],
    "DR Plans": ["/business-continuity/dr-plans"],
    "DR Auto": ["/business-continuity/dr-auto"],
    Risks: ["/business-continuity/risks"],
    "Resilience Dashboard": ["/business-continuity/resilience"],
    Resilience: ["/business-continuity/resilience"],
  },
  "Consent Management": [
    "/admin/scanner/webform-consent",
    "/admin/scanner/child-consent*",
  ],
  "Mass Mailing": ["/mass-mailing"],
  Campaigns: ["/mass-mailing"],
  mass_mailing: {
    Campaigns: ["/mass-mailing"],
    "Recipients Preview": ["/mass-mailing"],
  },
  operations: {
    People: ["/operations/people-dashboard*", "/operations/employee-overview"],
    Policy: ["/operations/policy*", "/operations/approver-dashboard"],
    Procedure: ["/operations/procedure*"],
    Training: ["/operations/trainings*"],
    "Finding Management": ["/operations/finding-management*"],
    "Change Management": [
      "/operations/changemanagement*",
      "/operations/changemanagement/approval",
      "/operations/changeManagement*",
    ],
    "Event Management": ["/operations/event-management*"],
    "Breach Management": ["/operations/breachmanagement*"],
    "Incident Management": ["/operations/incident-management*"],
    NIS2: ["/operations/nis2*"],
    "NIS2 Self Assessment": ["/nis2-self-assesment"],
  },
  risk: {
    "Risk Assessment": [
      "/risk-management/risk-assessment*",
      "/risk-management/assessments",
    ],
    Cybersecurity: ["/risk-management/risk-assessment/cybersecurity"],
    Project: [
      "/risk-management/project",
      "/projectrisk",
      "/projectrisk-simplified",
    ],
    Contract: ["/risk-management/risk-assessment/contract"],
    "Patch Management": [
      "/patch-management",
      "/patch-management/dashboard",
      "/patch-management/backlog",
      "/patch-management/patch-plans",
      "/patch-management/policies",
    ],
    "Vulnerability Management": [
      "/vulnerability-management",
      "/vulnerability-management/dashboard",
      "/vulnerability-management/repositories",
      "/vulnerability-management/scans",
      "/vulnerability-management/findings",
      "/vulnerability-management/exceptions",
      "/vulnerability-management/evidence",
    ],
    "Exception Management": [
      "/exception-management",
      "/exception-management/[id]",
    ],
    "Add New Menu": ["/risk-management/add-new-menu"],
    "All Menu List": ["/risk-management/all-menu-list"],
  },
  vendor: {
    "Vendor Trust": [
      "/vendor-trust",
      "/vendor-trust/dashboard",
      "/vendor-trust/vendordashboard",
    ],
    "Vendor Details": [
      "/vendor-trust/vendormanagement",
      "/vendor-trust/vendordataimportsheet",
      "/vendor-trust/vendorschedule*",
    ],
    "Vendor Questionnaire": [
      "/vendor-trust/vendorquestionnaire*",
      "/vendor-trust/VendorQuestionnairetable",
    ],
    "Vendor Login": [
      "/vendor-trust/vendorlogin",
      "/vendor-trust/vendorpass",
      "/vendor-trust/vendorresponseinput",
      "/vendor-trust/auditreport",
    ],
    Engagements: ["/vendor-trust/engagements"],
    Contracts: ["/vendor-trust/contracts"],
    Findings: ["/vendor-trust/findings"],
    Issues: ["/vendor-trust/issues"],
    "Customer Trust": [
      "/customer-trust",
      "/customer-trust/dashboard",
      "/customer-trust/customerquestionnaire*",
      "/customer-trust/CustomerQuestionnairetable",
    ],
    "Client Management": [
      "/customer-trust/customerdashboard",
      "/customer-trust/customermanagement",
      "/customer-trust/customerdataimportsheet",
      "/customer-trust/customerschedule*",
    ],
    "Reviewer Login": [
      "/customer-trust/reviewerlogin",
      "/customer-trust/reviewerpass",
      "/customer-trust/customerresponseinput",
      "/customer-trust/auditreport",
    ],
  },
  third_party_risk_management: {
    Dashboard: ["/third-parties-risk-management/dashboard"],
    "Third Party Risk Management": [
      "/third-parties-risk-management",
      "/third-parties-risk-management/dashboard",
      "/third-parties-risk-management/committee-members",
      "/third-parties-risk-management/TPRMDetails",
      "/third-parties-risk-management/tprmmanagement",
      "/third-parties-risk-management/tprmdataimportsheet",
      "/third-parties-risk-management/meeting",
      "/third-parties-risk-management/tprmschedule*",
      "/third-parties-risk-management/tprmquestionnaire*",
      "/third-parties-risk-management/TPRMQuestionnairetable",
      "/third-parties-risk-management/thirdpartylogin",
      "/third-parties-risk-management/blacklisting",
      "/third-parties-risk-management/thirdpartypass",
      "/third-parties-risk-management/thirdpartyresponseinput",
      "/third-parties-risk-management/auditreport",
      "/third-parties-risk-management/incidentreporting",
      "/third-parties-risk-management/governanceapproval",
      "/third-parties-risk-management/physicalaudit",
      "/third-parties-risk-management/sla",
      "/third-parties-risk-management/findingscapa",
      "/third-parties-risk-management/reporting",
      "/third-parties-risk-management/engagements",
      "/third-parties-risk-management/contracts",
      "/third-parties-risk-management/findings",
      "/third-parties-risk-management/issues",
    ],
    "Committee Members": ["/third-parties-risk-management/committee-members"],
    "Third Party Assessment": [
      "/third-parties-risk-management/TPRMDetails",
      "/third-parties-risk-management/tprmmanagement",
      "/third-parties-risk-management/tprmdataimportsheet",
      "/third-parties-risk-management/tprmschedule*",
    ],
    "Meeting Notes/Minutes": ["/third-parties-risk-management/meeting"],
    "Third Party Questionnaire": [
      "/third-parties-risk-management/tprmquestionnaire*",
      "/third-parties-risk-management/TPRMQuestionnairetable",
    ],
    "Third Party Login": [
      "/third-parties-risk-management/thirdpartylogin",
      "/third-parties-risk-management/thirdpartypass",
      "/third-parties-risk-management/thirdpartyresponseinput",
      "/third-parties-risk-management/auditreport",
      "/third-parties-risk-management/sla",
    ],
    Blacklisting: ["/third-parties-risk-management/blacklisting"],
    "Incident Portal": ["/third-parties-risk-management/incidentreporting"],
    "Governance Approval": [
      "/third-parties-risk-management/governanceapproval",
    ],
    "Physical Audit": ["/third-parties-risk-management/physicalaudit"],
    "SLA Management": ["/third-parties-risk-management/sla"],
    "Findings/CAPA": ["/third-parties-risk-management/findingscapa"],
    Reporting: ["/third-parties-risk-management/reporting"],
    Engagements: ["/third-parties-risk-management/engagements"],
    Contracts: ["/third-parties-risk-management/contracts"],
    Findings: ["/third-parties-risk-management/findings"],
    Issues: ["/third-parties-risk-management/issues"],
  },
  privacy: {
    Dashboard: ["/operations/policy-dashboard"],
    Frameworks: ["/privacy/framework*"],
    "DPIA / Appendix": [
      "/privacy/dpia*",
      "/privacy/appendix*",
      "/privacy/view-dpia",
    ],
    "Data Flow": ["/admin/dataflow"],
    "Data Mapping": ["/admin/dataflow/mapping"],
    "Mapping Dashboard": ["/admin/dataflow/mapping"],
    BPA: ["/admin/dataflow/mapping/bpa"],
    "System Activities": ["/admin/dataflow/mapping/system-activities"],
    "Data Flows": ["/admin/dataflow/mapping/flows"],
    Vendors: ["/admin/dataflow/mapping/vendors"],
    Coverage: ["/admin/dataflow/coverage", "/admin/dataflow/mapping/coverage"],
    ROPA: ["/admin/dataflow/mapping/ropa"],
    Purpose: ["/admin/dataflow/purposes"],
    "Framework Topics": ["/admin/dataflow/framework-topics"],
    "Framework Map": ["/admin/dataflow/framework-map"],
    "Data Dictionary": ["/admin/dataflow/datadictionary"],
    "Data Categories": ["/admin/dataflow/datacategories"],
    "Data Classifications": ["/admin/dataflow/dataclassifications"],
    "Data Subject Types": ["/admin/dataflow/datasubjects"],
    "Data Elements": ["/admin/dataflow/dataelements"],
    Entities: ["/admin/dataflow/entities"],
    "Retention Policies": ["/admin/dataflow/retention/retentionpolicies"],
    "Retention Rules": ["/admin/dataflow/retention/retentionrules"],
    "Webform Consent": [
      "/admin/scanner/webform-consent",
      "/admin/scanner/webform-configuration",
    ],
    "Rights Management": [
      "/admin/scanner/dsar",
      "/admin/scanner/dsar/dashboard",
    ],
    "DSAR Dashboard": ["/admin/scanner/dsar/dashboard"],
    "Assignee Dashboard": ["/admin/scanner/dsar/assignee*"],
    "User Dashboard": ["/admin/scanner/dsar/user-dashboard"],
    DSAR: ["/admin/scanner/dsar", "/admin/scanner/dsarmessages"],
    "Cookie Consent": [
      "/admin/scanner/cmp",
      "/admin/scanner/cmp/dashboard",
      "/admin/scanner/websites",
    ],
    "Cookie Consent Dashboard": ["/admin/scanner/cmp/dashboard"],
    Websites: [
      "/admin/scanner",
      "/admin/scanner/websites",
      "/admin/scanner/websites/[id]",
      "/admin/scanner/websites/[id]/edit",
      "/admin/scanner/banner-configs/[id]",
      "/admin/scanner/banner-configs/[id]/edit",
      "/admin/scanner/websites/[id]/Dashboard",
      "/admin/scanner/websites/[id]/cookies",
    ],
    "Cookie Consent Management": [
      "/admin/scanner/cmp",
      "/admin/scanner/cmp/dashboard",
    ],
    "Child Consent": [
      "/privacy/child-consent",
      "/admin/scanner/child-consent/dashboard",
      "/admin/scanner/child-consent/childconsentdashboard",
    ],
    "Child Consent Dashboard": [
      "/admin/scanner/child-consent/dashboard",
      "/admin/scanner/child-consent/childconsentdashboard",
    ],
  },
  industry: {
    Assessment: ["/industry/freeassessment*"],
    TISAX: ["/industry/automobile/tisax*", "/tisaxuser", "/tisax-user-assign"],
    "6.0.3": [
      "/industry/automobile/tisax*",
      "/industry/automobile/tisax-audit*",
      "/tisaxuser",
      "/tisax-user-assign",
      "/tisax-assigner-audit",
      "/tisaxaudituser",
    ],
    "TISAX AUDIT": [
      "/industry/automobile/tisax-audit*",
      "/tisax-assigner-audit",
      "/tisaxaudituser",
    ],
    "Assign Controls": ["/industry/automobile/tisax/assigncontrols*"],
    "Assign Team": ["/industry/automobile/tisax/assignteam*"],
    "ISO 42001": ["/industry/automobile/iso42001"],
    FFIEC: ["/industry/banking-and-finance/ffiec"],
    CSCRF: ["/industry/banking-and-finance/cscrf*"],
    IRDA: ["/industry/banking-and-finance/irda*"],
    CRA: ["/industry/banking-and-finance/cra*"],
    RBI: ["/industry/banking-and-finance/rbi*"],
    "RBI Tracker": ["/industry/banking-and-finance/rbitracker"],
    "RBI Tracker User Portal": ["/industry/banking-and-finance/rbitrackeruser"],
  },
  audit: {
    "Internal Audit": ["/audit/internal-audit"],
    "Internal Audit - Reviewer": ["/audit/reviewer*"],
    "Internal Audit - Approver": ["/audit/approver*"],
    "Internal Audit - Auditor": ["/audit/employer*"],
  },
  grc: {
    Dashboard: ["/superadmindashboard/statusgriddashboard"],
    "Average Dashboard": ["/superadmindashboard"],
    "Detailed Dashboard": ["/superadmindashboard/admindetaildashboard"],
  },
  access_management: {
    "Governance Hub": ["/management-hub/governance-hub"],
    "Access Management": ["/management-hub/governance-hub/access-management"],
    Dashboard: ["/management-hub/governance-hub/access-management/dashboard"],
    Overview: ["/management-hub/governance-hub/access-management/dashboard"],
    "Role Management": [
      "/management-hub/governance-hub/access-management/role-management",
    ],
    "User Creation": [
      "/management-hub/governance-hub/access-management/user-management",
    ],
    "Assign Roles": [
      "/admin/roleassignment",
      "/management-hub/governance-hub/access-management/dashboard",
    ],
  },
  management_hub: {
    "Governance Hub": ["/management-hub/governance-hub", "/governance"],
    Dashboard: ["/management-hub/governance-hub/access-management/dashboard"],
    Overview: ["/management-hub/governance-hub/access-management/dashboard"],
    "Role Management": [
      "/management-hub/governance-hub/access-management/role-management",
    ],
    "User Creation": [
      "/management-hub/governance-hub/access-management/user-management",
    ],
    "Assign Roles": [
      "/admin/roleassignment",
      "/management-hub/governance-hub/access-management/dashboard",
    ],
    "Team Management": ["/governance/team-management"],
    "Division Management": ["/governance/division-management"],
    "Department Management": [
      "/management-hub/governance-hub/access-management/department-management",
      "/governance/department-management",
    ],
    "Business Management": ["/governance/business-management"],
    "Process Management": ["/governance/process-management"],
    "Organization Management": ["/governance/organization-management"],
    "Meeting Management": ["/governance/meeting-management"],
    "Compliance Hub": ["/compliancehub"],
    "Compliance Dashboard": ["/compliancehub/dashboard"],
    "System Monitoring": ["/compliancehub/system-monitoring"],
    "Audit Logs": ["/compliancehub/audit-logs"],
    "Notification Hub": ["/notifications"],
    "Notification Management": ["/notifications"],
    "Task Management Hub": ["/management-hub/task-management-hub"],
    "Task Summary": ["/management-hub/task-management-hub/task-summary"],
    "Create Task": ["/management-hub/task-management-hub/create-task"],
    "Integration Hub": [
      "/integration/management",
      "/managementhub/asset/management",
      "/privacy/TemplateSelector",
      "/privacy/consentbanner",
      "/privacy/install",
      "/privacy/scanner",
    ],
    "Integration Management": ["/integration/management"],
    "Asset Management": ["/managementhub/asset/management"],
    "Privacy Consent Management": [
      "/admin/scanner/webform-configuration",
      "/admin/scanner/banner-templates",
      "/admin/scanner/banner-templates/new",
      "/admin/scanner/consent-categories",
      "/dsar-dashboard",
      "/admin/scanner/child-consent*",
    ],
    Settings: ["/management-hub/settings*"],
  },
  privacy_consents: {
    "Privacy Consent Management": ["/admin/scanner/webform-configuration"],
    "Web Form Configuration": ["/admin/scanner/webform-configuration"],
    "Cookies Consent": [
      "/admin/scanner/banner-templates",
      "/admin/scanner/banner-templates/new",
      "/admin/scanner/consent-categories",
    ],
    "Banner Templates": ["/admin/scanner/banner-templates", "/admin/scanner/banner-templates/new"],
    "Cookie Consent Category": ["/admin/scanner/consent-categories"],
    "Child Consent": [
      "/privacy/child-consent",
      "/admin/scanner/child-consent*",
    ],
    Config: ["/admin/scanner", "/admin/scanner/webform-configuration"],
  },
  user_hub: {
    "User Framework Portal": ["/user/framework*"],
    "User Portal": ["/user/portal*"],
  },
  workbench: {
    "Form Builder": ["/workbench/scalable-form"],
    Cybersecurity: ["/workbench/fromapi"],
    Response: ["/workbench/fetchresponsebymeta"],
  },
  scanner: {
    "Data Inventory": ["/admin/dataflow/assets*"],
    Jobs: ["/admin/dataflow/jobs*"],
    "Scanner Config": [
      "/admin/scanner",
      "/admin/dataflow/scanner*",
      "/privacy/scanner",
    ],
  },
};

function routeMatchesRule(pathname, rule) {
  const path = clean(pathname);
  const normalizedRule = clean(rule);

  if (normalizedRule.endsWith("*")) {
    const prefix = normalizedRule.slice(0, -1);
    return path === prefix || path.startsWith(prefix + "/");
  }

  if (normalizedRule.includes("[") && normalizedRule.includes("]")) {
    return routePatternToRegex(normalizedRule).test(path);
  }

  return path === normalizedRule;
}

function extractRestrictedSubmodules(userModules = []) {
  const restricted = {};

  if (!Array.isArray(userModules)) return restricted;

  for (const entry of userModules) {
    if (!entry || typeof entry === "string") continue;

    const rawSubs = Array.isArray(entry?.subModules)
      ? entry.subModules
      : Array.isArray(entry?.submodules)
        ? entry.submodules
        : [];

    if (rawSubs.length === 0) continue;

    const moduleKeys = resolveModuleKeysFromAccessEntry(entry);
    const normalizedSubmodules = Array.from(
      new Set(rawSubs.map(normalizeLabel).filter(Boolean)),
    );

    for (const moduleKey of moduleKeys) {
      const rulesForModule = SUBMODULE_ROUTE_RULES[moduleKey] || {};
      const matchedSubmodules = normalizedSubmodules.filter((submodule) =>
        Object.keys(rulesForModule).some(
          (ruleKey) => normalizeLabel(ruleKey) === submodule,
        ),
      );

      if (matchedSubmodules.length === 0 && moduleKeys.length !== 1) continue;

      const nextSubmodules =
        matchedSubmodules.length > 0 ? matchedSubmodules : normalizedSubmodules;

      restricted[moduleKey] = expandSubmoduleAccess(moduleKey, [
        ...(restricted[moduleKey] || []),
        ...nextSubmodules,
      ]);
    }
  }

  return restricted;
}

function hasAllowedSubmoduleRoute(pathname, moduleKey, allowedSubmodules = []) {
  const rulesForModule =
    SUBMODULE_ROUTE_RULES[normalizeModuleKey(moduleKey)] || {};
  if (!allowedSubmodules.length || Object.keys(rulesForModule).length === 0) {
    return true;
  }

  return allowedSubmodules.some((submodule) => {
    const matchedKey = Object.keys(rulesForModule).find(
      (ruleKey) => normalizeLabel(ruleKey) === normalizeLabel(submodule),
    );
    if (!matchedKey) return false;

    return (rulesForModule[matchedKey] || []).some((rule) =>
      routeMatchesRule(pathname, rule),
    );
  });
}

function matchesAllowedSubmoduleRule(
  pathname,
  moduleKey,
  allowedSubmodules = [],
) {
  const rulesForModule =
    SUBMODULE_ROUTE_RULES[normalizeModuleKey(moduleKey)] || {};
  if (!allowedSubmodules.length || Object.keys(rulesForModule).length === 0) {
    return false;
  }

  return allowedSubmodules.some((submodule) => {
    const matchedKey = Object.keys(rulesForModule).find(
      (ruleKey) => normalizeLabel(ruleKey) === normalizeLabel(submodule),
    );
    if (!matchedKey) return false;

    return (rulesForModule[matchedKey] || []).some((rule) =>
      routeMatchesRule(pathname, rule),
    );
  });
}

function hasFullAccessByRole(userRoles) {
  if (!Array.isArray(userRoles)) return false;

  const roles = userRoles.map((r) =>
    String(r || "")
      .trim()
      .toUpperCase()
      .replace(/[\s-]+/g, "_"),
  );

  return (
    roles.includes("SUPER_ADMIN") ||
    roles.includes("ADMIN") ||
    roles.includes("MODULE_ADMIN") ||
    roles.includes("MODULE_ADMINISTRATOR")
  );
}

function hasSuperAdminRole(userRoles) {
  if (!Array.isArray(userRoles)) return false;

  const roles = userRoles.map((r) =>
    String(r || "")
      .trim()
      .toUpperCase()
      .replace(/[\s-]+/g, "_"),
  );

  return roles.includes("SUPER_ADMIN");
}

function hasTenantAdminRole(userRoles) {
  if (!Array.isArray(userRoles)) return false;
  const roles = userRoles.map((r) =>
    String(r || "")
      .trim()
      .toUpperCase()
      .replace(/[\s-]+/g, "_"),
  );
  return roles.includes("TENANT_ADMIN") || roles.includes("TENANT_SUPER_ADMIN");
}

function hasMandateAdminRole(userRoles) {
  if (!Array.isArray(userRoles)) return false;
  const roles = userRoles.map((r) =>
    String(r || "")
      .trim()
      .toUpperCase()
      .replace(/[\s-]+/g, "_"),
  );
  return (
    roles.includes("MANDATE_ADMIN") || roles.includes("MANDATE_MODULE_ADMIN")
  );
}

function hasGenericModuleAdminRole(userRoles) {
  if (!Array.isArray(userRoles)) return false;
  const roles = userRoles.map((r) =>
    String(r || "")
      .trim()
      .toUpperCase()
      .replace(/[\s-]+/g, "_"),
  );
  return (
    roles.includes("MODULE_ADMIN") || roles.includes("MODULE_ADMINISTRATOR")
  );
}

function isPathAllowedByPermissionMap(
  pathname,
  userPermissionKeys = [],
  map = {},
) {
  const path = clean(pathname);
  const perms = (userPermissionKeys || []).map(normalizeKey);

  for (const perm of perms) {
    const allowedRoutes = map[perm] || [];

    for (const route of allowedRoutes) {
      const cleanedRoute = clean(route);

      if (cleanedRoute === path) return true;

      if (cleanedRoute.includes("[") && cleanedRoute.includes("]")) {
        const re = routePatternToRegex(cleanedRoute);
        if (re.test(path)) return true;
      }
    }
  }

  return false;
}

function hasScannerPermissionSpecificAccess(pathname, userPermissionKeys = []) {
  return isPathAllowedByPermissionMap(
    pathname,
    userPermissionKeys,
    SCANNER_PERMISSION_ROUTE_MAP,
  );
}

function hasTprmPermissionSpecificAccess(pathname, userPermissionKeys = []) {
  return isPathAllowedByPermissionMap(
    pathname,
    userPermissionKeys,
    TPRM_PERMISSION_ROUTE_MAP,
  );
}

function hasMandatePermissionSpecificAccess(pathname, userPermissionKeys = []) {
  return isPathAllowedByPermissionMap(
    pathname,
    userPermissionKeys,
    MANDATE_PERMISSION_ROUTE_MAP,
  );
}

function isScannerOnlyRoute(pathname) {
  return SCANNER_ONLY_ROUTES.some((route) => routeMatchesRule(pathname, route));
}

export function hasRouteAccess(
  pathname,
  userModules = [],
  userRoles = [],
  userPermissionKeys = [],
) {
  const path = clean(pathname);

  if (SUPER_ADMIN_ONLY_ROUTES.some((p) => clean(p) === path)) {
    return hasSuperAdminRole(userRoles);
  }

  if (hasFullAccessByRole(userRoles)) return true;

  // Tenant admins must always be able to access core access-management routes
  if (
    hasTenantAdminRole(userRoles) &&
    TENANT_ADMIN_ACCESS_ROUTES.some((p) => clean(p) === path)
  ) {
    return true;
  }

  if (PUBLIC_PATHS.some((p) => clean(p) === path)) return true;

  if (
    path.startsWith("/_next") ||
    path.startsWith("/favicon") ||
    path.startsWith("/api")
  ) {
    return true;
  }

  if (hasTprmPermissionSpecificAccess(path, userPermissionKeys)) {
    return true;
  }

  if (hasScannerPermissionSpecificAccess(path, userPermissionKeys)) {
    return true;
  }

  const normalizedModules = Array.isArray(userModules)
    ? userModules
        .flatMap((entry) => resolveModuleKeysFromAccessEntry(entry))
        .filter(Boolean)
    : [];

  const hasMandateModule = normalizedModules.some(
    (moduleKey) => normalizeModuleKey(moduleKey) === "mandate",
  );

  if (
    (hasMandateAdminRole(userRoles) ||
      (hasGenericModuleAdminRole(userRoles) && hasMandateModule)) &&
    MANDATE_ALLOWED_ROUTES.some((route) => routeMatchesRule(path, route))
  ) {
    return true;
  }

  if (hasMandatePermissionSpecificAccess(path, userPermissionKeys)) {
    return true;
  }

  if (!Array.isArray(userModules) || userModules.length === 0) return false;

  const restrictedSubmodules = extractRestrictedSubmodules(userModules);

  const hasPrivacySharedScannerAccess = userModules.some((entry) => {
    const moduleKeys = resolveModuleKeysFromAccessEntry(entry);
    if (
      !moduleKeys.some(
        (moduleKey) => normalizeModuleKey(moduleKey) === "privacy",
      )
    ) {
      return false;
    }

    const privacySubmodules = restrictedSubmodules.privacy || [];
    if (privacySubmodules.length === 0) return true;

    return privacySubmodules.some((submodule) =>
      PRIVACY_SCANNER_SHARED_SUBMODULES.has(normalizeLabel(submodule)),
    );
  });

  // prevent generic module-wide access for restricted modules
  const filteredModules = normalizedModules.filter((moduleKey) => {
    const key = normalizeModuleKey(moduleKey);
    return key !== "tprm" && key !== "scanner";
  });

  if (isScannerOnlyRoute(path)) {
    if (
      normalizedModules.some(
        (moduleKey) => normalizeModuleKey(moduleKey) === "scanner",
      ) ||
      hasPrivacySharedScannerAccess
    ) {
      return true;
    }
  }

  return filteredModules.some((moduleKey) => {
    const allowedSubmodules = restrictedSubmodules[moduleKey] || [];

    if (matchesAllowedSubmoduleRule(path, moduleKey, allowedSubmodules)) {
      return true;
    }

    if (!isRouteInModule(path, moduleKey)) return false;

    return hasAllowedSubmoduleRoute(path, moduleKey, allowedSubmodules);
  });
}
