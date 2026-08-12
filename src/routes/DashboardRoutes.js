import { v4 as uuid } from "uuid";

export const ClientDashboardMenu = [
  {
    id: uuid(),
    name: "Security / Compliance",
    icon: "FiShield",
    children: [
      {
        id: uuid(),
        name: "Dashboard",
        link: "/compliance/dashboard",
        icon: "FiGrid",
      },
      {
        id: uuid(),
        name: "Framework",
        link: "/compliance/frameworks",
        icon: "FiLayers",
      },
      { id: uuid(), name: "Controls", link: "/contact", icon: "FiSettings" },
      {
        id: uuid(),
        name: "Evidence Task",
        link: "/compliance/assignments",
        icon: "FiGrid",
      },
    ],
  },

  {
    id: uuid(),
    name: "Operations",
    icon: "FiTool",
    children: [
      {
        id: uuid(),
        name: "People",
        link: "/operations/employee-overview",
        icon: "FiUser",
      },
      {
        id: uuid(),
        name: "Policy",
        link: "/operations/policy",
        icon: "FiFileText",
      },
      {
        id: uuid(),
        name: "Procedure",
        link: "/operations/procedure",
        icon: "FiClipboard",
      },
      {
        id: uuid(),
        name: "Training",
        link: "/operations/trainings",
        icon: "FiBookOpen",
      },
      {
        id: uuid(),
        name: "Finding Management",
        link: "/operations/finding-Management",
        icon: "FiSearch",
      },
      {
        id: uuid(),
        name: "Change Management",
        link: "/operations/changeManagement",
        icon: "FiRefreshCw",
      },
      {
        id: uuid(),
        name: "Event Management",
        link: "/operations/event-Management",
        icon: "FiCalendar",
      },
      {
        id: uuid(),
        name: "Incident Management",
        icon: "FiAlertTriangle",
        children: [
          {
            id: uuid(),
            name: "Incident Mgmt",
            link: "/operations/Incident-Management/",
            icon: "FiClipboard",
          },
          {
            id: uuid(),
            name: "NIS2",
            link: "/operations/NIS2/Nis2",
            icon: "FiClipboardCheck",
          },
          {
            id: uuid(),
            name: "NIS2 Self-Assessment",
            link: "/NIS2-self-assesment",
            icon: "FiClipboardCheck",
          },
        ],
      },
      {
        id: uuid(),
        name: "Breach Management",
        link: "/operations/breachmanagement",
        icon: "FiCalendar",
      },
    ],
  },

  {
    id: uuid(),
    name: "Risk Management",
    icon: "FiAlertCircle",
    children: [
      {
        id: uuid(),
        name: "Risk Assessment",
        link: "/risk-management/risk-assessment",
        icon: "FiLayers",
      },
      {
        id: uuid(),
        name: "Cybersecurity",
        link: "/risk-management/risk-assessment/cybersecurity",
        icon: "FiShield",
        children: [
          {
            id: uuid(),
            name: "Asset Based Simplified",
            link: "/risk-management/risk-assessment/cybersecurity/asset-based-simplified",
            icon: "FiBox",
          },
          {
            id: uuid(),
            name: "Asset Based Risk Calculation With Exposure",
            link: "/risk-management/risk-assessment/cybersecurity/asset-based-risk-calculation-with-exposure",
            icon: "FiBarChart2",
          },
          {
            id: uuid(),
            name: "Process Based Simplified",
            link: "/risk-management/risk-assessment/cybersecurity/process-based-simplified",
            icon: "FiRepeat",
          },
          {
            id: uuid(),
            name: "Process Based Risk Calculation With Exposure",
            link: "/risk-management/risk-assessment/cybersecurity/process-based-risk-calculation-with-exposure",
            icon: "FiActivity",
          },
        ],
      },
      {
        id: uuid(),
        name: "Project",
        link: "/risk-management/project",
        icon: "FiFile",
      },
      {
        id: uuid(),
        name: "Contract",
        link: "/risk-management/risk-assessment/contract",
        icon: "FiFileText",
      },
      {
        id: uuid(),
        name: "Vulnerability Management",
        icon: "FiFileText",
        children: [
          {
            id: uuid(),
            name: "Dashboard",
            link: "/vulnerability-management/dashboard",
            icon: "FiGrid",
          },
          {
            id: uuid(),
            name: "Repositories",
            link: "/vulnerability-management/repositories",
            icon: "FiList",
          },
          {
            id: uuid(),
            name: "Scans",
            link: "/vulnerability-management/scans",
            icon: "FiSearch",
          },
          {
            id: uuid(),
            name: "Findings",
            link: "/vulnerability-management/findings",
            icon: "FiAlertTriangle",
          },
          {
            id: uuid(),
            name: "Exceptions",
            link: "/vulnerability-management/exceptions",
            icon: "FiFileText",
          },
          {
            id: uuid(),
            name: "Evidence",
            link: "/vulnerability-management/evidence",
            icon: "FiFile",
          },
        ],
      },
      {
        id: uuid(),
        name: "Strategic",
        link: "/risk-management/risk-assessment/strategic",
        icon: "FiTrendingUp",
      },
      {
        id: uuid(),
        name: "Legal",
        link: "/risk-management/risk-assessment/legal",
        icon: "FiBook",
      },
      {
        id: uuid(),
        name: "Financial",
        link: "/risk-management/risk-assessment/financial",
        icon: "FiDollarSign",
      },
      {
        id: uuid(),
        name: "Operation",
        link: "/risk-management/risk-assessment/operation",
        icon: "FiBriefcase",
      },
      {
        id: uuid(),
        name: "Personal",
        link: "/risk-management/risk-assessment/personal",
        icon: "FiUser",
      },
      {
        id: uuid(),
        name: "Geopolitical",
        link: "/risk-management/risk-assessment/geopolitical",
        icon: "FiGlobe",
      },
      {
        id: uuid(),
        name: "Environmental",
        link: "/risk-management/risk-assessment/environmental",
        icon: "FiSun",
      },
      {
        id: uuid(),
        name: "Add New Menu",
        link: "/risk-management/add-new-menu",
        icon: "FiPlus",
      },
      {
        id: uuid(),
        name: "All Menu List",
        link: "/risk-management/all-menu-list",
        icon: "FiClipboard",
      },
    ],
  },

  {
    id: uuid(),
    name: "Vendor Trust",
    icon: "FiUsers",
    children: [
      {
        id: uuid(),
        name: "Vendor Details",
        link: "/vendor-trust/VendorDashboard",
        icon: "FiUsers",
      },
      {
        id: uuid(),
        name: "Vendor Questionnaire",
        link: "/vendor-trust/VendorQuestionnaire",
        icon: "FiCpu",
      },
      {
        id: uuid(),
        name: "Vendor Login",
        link: "/vendor-trust/VendorLogin",
        icon: "FiShield",
      },
    ],
  },

  {
    id: uuid(),
    name: "Customer Trust",
    icon: "FiUserCheck",
    children: [
      {
        id: uuid(),
        name: "Client Management",
        link: "/customer-trust/CustomerDashboard",
        icon: "FiUsers",
      },
      {
        id: uuid(),
        name: "Reviewer Login",
        link: "/customer-trust/ReviewerLogin",
        icon: "FiShield",
      },
    ],
  },
  {
    id: uuid(),
    name: "Third Party Risk Management",
    icon: "FiLayers",
    link: "/third-party-risk-management",
  },
  {
    id: uuid(),
    name: "TPRM dev",
    icon: "FiLayers",
    children: [
      {
        id: uuid(),
        name: "TPRM Workflow",
        link: "/third-party-risk-management",
        icon: "FiGrid",
      },
      {
        id: uuid(),
        name: "Committee Members",
        link: "/third-party-risk-management/committee-members",
        icon: "FiUsers",
      },
      {
        id: uuid(),
        name: "Vendor Details",
        link: "/third-party-risk-management/VendorDashboard",
        icon: "FiUsers",
      },
      {
        id: uuid(),
        name: "Vendor Questionnaire",
        link: "/third-party-risk-management/VendorQuestionnaire",
        icon: "FiCpu",
      },
      {
        id: uuid(),
        name: "Vendor Login",
        link: "/third-party-risk-management/VendorLogin",
        icon: "FiShield",
      },
      {
        id: uuid(),
        name: "Engagements",
        link: "/third-party-risk-management/engagements",
        icon: "FiUserCheck",
      },
      {
        id: uuid(),
        name: "Contracts",
        link: "/third-party-risk-management/contracts",
        icon: "FiFileText",
      },
      {
        id: uuid(),
        name: "Findings",
        link: "/third-party-risk-management/findings",
        icon: "FiSearch",
      },
      {
        id: uuid(),
        name: "Issues",
        link: "/third-party-risk-management/issues",
        icon: "FiAlertTriangle",
      },
    ],
  },

  {
    id: uuid(),
    name: "Privacy",
    icon: "FiLock",
    children: [
      {
        id: uuid(),
        name: "Dashboard",
        link: "/privacy/dashboard",
        icon: "FiFileText",
      },
      {
        id: uuid(),
        name: "Privacy Policy",
        link: "/privacy/PrivacyPolicyData",
        icon: "FiFileText",
      },
      {
        id: uuid(),
        name: "Cookies Policy",
        link: "/privacy/right_management/CookiesDetail",
        icon: "FiCoffee",
      },
      {
        id: uuid(),
        name: "Consent Banner",
        link: "/privacy/ConsentBanner",
        icon: "FiFlag",
      },
      {
        id: uuid(),
        name: "Consent Tracking",
        link: "/privacy/consentTracking",
        icon: "FiShield",
      },
      {
        id: uuid(),
        name: "Right Management",
        link: "/privacy/right_management/RequestQueue",
        icon: "FiShield",
      },
      {
        id: uuid(),
        name: "Scanner",
        link: "/privacy/Scanner",
        icon: "FiSearch",
      },
      {
        id: uuid(),
        name: "Install",
        link: "/privacy/Install",
        icon: "FiDownload",
      },
      {
        id: uuid(),
        name: "Frameworks",
        link: "/privacy/framework",
        icon: "FiLayers",
      },

      {
        id: uuid(),
        name: "DPIA",
        link: "/privacy/dpia",
        icon: "FiDownload",
        children: [
          {
            id: uuid(),
            name: "DPIAV1",
            link: "/privacy/dpia/form",
            icon: "FiFileText",
          },
        ],
      },
      {
        id: uuid(),
        name: "Appendix",
        link: "/privacy/appendix",
        icon: "FiBookOpen",
        children: [
          {
            id: uuid(),
            name: "AppendixA1",
            link: "/privacy/appendix/a1",
            icon: "FiFileText",
          },
          {
            id: uuid(),
            name: "AppendixA2",
            link: "/privacy/appendix/a2",
            icon: "FiFileText",
          },
          {
            id: uuid(),
            name: "AppendixA3",
            link: "/privacy/appendix/a3",
            icon: "FiFileText",
          },
        ],
      },
    ],
  },

  {
    id: uuid(),
    name: "Industry",
    icon: "FiDollarSign",
    // if you want Industry itself to have a link, add: link: "/industry"
    children: [
      {
        id: uuid(),
        name: "Automobile",
        icon: "FiHeart",
        children: [
          {
            id: uuid(),
            name: "TISAX",
            icon: "FiShield",
            children: [
              {
                id: uuid(),
                name: "6.0.3",
                link: "/industry/automobile/tisax",
                icon: "FiLayers",
              },
            ],
          },
          {
            id: uuid(),
            name: "TISAX Audit",
            icon: "AiOutlineAudit",
            children: [
              {
                id: uuid(),
                name: "6.0.3",
                link: "/industry/automobile/tisax-audit",
                icon: "FiLayers",
              },
            ],
          },
          {
            id: uuid(),
            name: "Assign Controls",
            link: "/industry/automobile/tisax/assigncontrols",
            icon: "FiShield",
          },
          {
            id: uuid(),
            name: "Assign Team",
            link: "/industry/automobile/tisax/assignteam",
            icon: "FiShield",
          },
          {
            id: uuid(),
            name: "ISO 42001",
            link: "/industry/automobile/ISO42001",
            icon: "FiClipboardList",
          },
        ],
      },
      {
        id: uuid(),
        name: "Banking & Finance",
        icon: "FiDollarSign",
        children: [
          {
            id: uuid(),
            name: "FFIEC",
            link: "/industry/banking-and-finance/ffiec",
            icon: "FiFileText",
          },
          {
            id: uuid(),
            name: "CSCRF",
            link: "/industry/banking-and-finance/cscrf",
            icon: "FiFileText",
          },
          {
            id: uuid(),
            name: "IRDA",
            link: "/industry/banking-and-finance/irda",
            icon: "FiFileText",
          },
          {
            id: uuid(),
            name: "CRA",
            link: "/industry/banking-and-finance/Cra",
            icon: "FiFileText",
          },
          {
            id: uuid(),
            name: "RBI",
            link: "/industry/banking-and-finance/rbi",
            icon: "FiFileText",
          },
          {
            id: uuid(),
            name: "RBI Tracker",
            link: "/industry/banking-and-finance/RbiTracker",
            icon: "FiFileText",
          },
          {
            id: uuid(),
            name: "RBI Tracker User Portal",
            link: "/industry/banking-and-finance/RbiTrackerUser",
            icon: "FiFileText",
          },
        ],
      },
      { id: uuid(), name: "Healthcare", link: "/contact", icon: "FiHeart" },
    ],
  },

  {
    id: uuid(),
    name: "Malware / Ransomware",
    icon: "FiAlertOctagon",
    children: [],
  },
  { id: uuid(), name: "Assessment", icon: "FiClipboard", children: [] },

  {
    id: uuid(),
    name: "Audit",
    icon: "FiTool",
    children: [
      {
        id: uuid(),
        name: "Internal Audit",
        link: "/audit/internal-audit",
        icon: "MdSecurity",
      },
      {
        id: uuid(),
        name: "Internal Audit – Reviewer",
        link: "/audit/reviewer",
        icon: "MdSecurity",
      },
      {
        id: uuid(),
        name: "Internal Audit – Approver",
        link: "/audit/approver",
        icon: "MdSecurity",
      },
      {
        id: uuid(),
        name: "Internal Audit – Auditor",
        link: "/audit/employer",
        icon: "MdSecurity",
      },
    ],
  },

  {
    id: uuid(),
    name: "GRC as a Service",
    icon: "FiClipboardCheck",
    children: [
      {
        id: uuid(),
        name: "Dashboard",
        link: "/superadmindashboard/StatusGridDashboard",
        icon: "FiGrid",
      },
      {
        id: uuid(),
        name: "Average Dashboard",
        link: "/superadmindashboard",
        icon: "FiBarChart",
      },
      {
        id: uuid(),
        name: "Detailed Dashboard",
        link: "/superadmindashboard/AdminDetailDashboard",
        icon: "FiFileText",
      },
    ],
  },

  {
    id: uuid(),
    name: "Management Hub",
    icon: "FiUserCheck",
    children: [
      {
        id: uuid(),
        name: "Governance Hub",
        icon: "FiUserCheck",
        children: [
          {
            id: uuid(),
            name: "Access Management",
            icon: "FiUsers",
            children: [
              {
                id: uuid(),
                name: "Role Management",
                link: "/management-hub/governance-hub/access-management/role-management",
                icon: "FiUser",
              },
              {
                id: uuid(),
                name: "User Creation",
                link: "/management-hub/governance-hub/access-management/user-management",
                icon: "FiUsers",
              },
              {
                id: uuid(),
                name: "Assign Roles",
                link: "/admin/roleassignment",
                icon: "FiUserCheck",
              },
            ],
          },
          {
            id: uuid(),
            name: "Team Management",
            link: "/governance/team-management",
            icon: "FiBriefcase",
          },
          {
            id: uuid(),
            name: "Division Management",
            link: "/governance/division-management",
            icon: "FiBriefcase",
          },
          {
            id: uuid(),
            name: "Department Management",
            link: "/governance/department-management",
            icon: "FiBriefcase",
          },
          {
            id: uuid(),
            name: "Business Management",
            link: "/governance/business-management",
            icon: "FiBriefcase",
          },
          {
            id: uuid(),
            name: "Process Management",
            link: "/governance/process-management",
            icon: "FiBriefcase",
          },
          {
            id: uuid(),
            name: "License Management",
            link: "/governance/license-management",
            icon: "FiLayers",
          },
        ],
      },
      {
        id: uuid(),
        name: "Compliance Hub",
        icon: "FiClipboardCheck",
        children: [
          {
            id: uuid(),
            name: "Compliance Dashboard",
            link: "/compliancehub/dashboard",
            icon: "FiGrid",
          },
          {
            id: uuid(),
            name: "System Monitoring",
            link: "/compliancehub/system-monitoring",
            icon: "FiCpu",
          },
          {
            id: uuid(),
            name: "Audit Logs",
            link: "/compliancehub/audit-logs",
            icon: "AiOutlineAudit",
          },
        ],
      },
      {
        id: uuid(),
        name: "Notification Hub",
        icon: "FiBell",
        children: [
          {
            id: uuid(),
            name: "Notification Management",
            link: "/notifications",
            icon: "FiMail",
          },
        ],
      },
      {
        id: uuid(),
        name: "Task Management Hub",
        icon: "FiTool",
        children: [
          {
            id: uuid(),
            name: "Create Task",
            link: "/management-hub/task-management-hub/create-task",
            icon: "FiRefreshCw",
          },
          {
            id: uuid(),
            name: "Task Summary",
            link: "/management-hub/task-management-hub/task-summary",
            icon: "FiRefreshCw",
          },
        ],
      },
      {
        id: uuid(),
        name: "Integration Hub",
        icon: "FiTool",
        children: [
          {
            id: uuid(),
            name: "Integration Management",
            link: "/integration/management",
            icon: "FiRefreshCw",
          },
          {
            id: uuid(),
            name: "Asset Management",
            link: "/management-hub/asset/management",
            icon: "FiRefreshCw",
          },
        ],
      },
      {
        id: uuid(),
        name: "Settings",
        link: "/management-hub/settings",
        icon: "FiTool",
      },
    ],
  },

  {
    id: uuid(),
    name: "User Hub",
    icon: "FiUser",
    children: [
      {
        id: uuid(),
        name: "User Framework Portal",
        link: "/user/framework",
        icon: "FiUserCheck",
      },
      {
        id: uuid(),
        name: "User Portal",
        link: "/user/portal",
        icon: "FiUserCheck",
      },
    ],
  },

  {
    id: uuid(),
    name: "Contact Us",
    icon: "FiMail",
    link: "/contact",
    children: [],
  },
];

export const AdminDashboardMenu = [
  {
    id: uuid(),
    title: "Dashboard",
    icon: "  fe-save",
    link: "/admin/AdminDashboard",
  },

  {
    id: uuid(),
    title: "Framework",
    icon: "compass",
    link: "/admin/AdminFrameworks",
  },

  {
    id: uuid(),
    title: "Control",
    icon: "  fe-save",
    link: "/admin/AdminControl",
  },
];
