import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import Image from "next/image";
import { v4 as uuid } from "uuid";
import Cookies from "js-cookie";
import { setPerms } from "@/auth/auth-permissions";
import { hasRouteAccess } from "@/auth/routeProtection";
import {
  getEffectivePermissionKeys,
  getUserAccessEntries,
  normalizeModuleKey,
  resolveModuleKeysFromAccessEntry,
} from "@/auth/accessModules";
import { toast } from "react-toastify";
import CustomAxios from "@/globalcomponents/CustomAxios";
import { baseurl, initURL } from "../../../BaseUrl";
import { useSidebar } from "@/context/SidebarContext";
import {
  FiChevronDown,
  FiChevronRight,
  FiMenu,
  FiCompass,
  FiList,
  FiHeart,
  FiShield,
  FiGrid,
  FiLayers,
  FiSettings,
  FiTool,
  FiClipboard,
  FiSearch,
  FiUser,
  FiBookOpen,
  FiRefreshCw,
  FiCalendar,
  FiAlertTriangle,
  FiCheckCircle,
  FiAlertCircle,
  FiFile,
  FiTrendingUp,
  FiBook,
  FiDollarSign,
  FiBriefcase,
  FiGlobe,
  FiSun,
  FiThumbsUp,
  FiCpu,
  FiPlus,
  FiUsers,
  FiUserCheck,
  FiLock,
  FiDownload,
  FiCoffee,
  FiFlag,
  FiAlertOctagon,
  FiMail,
  FiFileText,
  FiZap,
  FiBarChart,
  FiBarChart2,
  FiBell,
  FiEdit3,
  FiLayout,
  FiActivity,
  FiArchive,
  FiAward,
  FiBox,
  FiCheckSquare,
  FiClock,
  FiCode,
  FiDatabase,
  FiEye,
  FiFilePlus,
  FiGitBranch,
  FiHome,
  FiKey,
  FiLogIn,
  FiMap,
  FiMapPin,
  FiMonitor,
  FiPackage,
  FiPieChart,
  FiRepeat,
  FiSend,
  FiServer,
  FiSliders,
  FiTarget,
  FiTruck,
  FiUmbrella,
  FiUserPlus,
  GrIntegration,
} from "react-icons/fi";
import { BiCookie } from "react-icons/bi";
import { AiOutlineApi, AiOutlineAudit } from "react-icons/ai";

// Define your API endpoints
const USER_DB_URL = `/${initURL}/apiv1/users/db`;

const ClientDashboardMenu = [
  // {
  //   id: uuid(),
  //   link: "/consent-dashboard",
  //   title: "Consent Dashboard",
  //   icon: "FiShield",
  // },

  {
    id: uuid(),
    title: "Security/Compliance",
    icon: "FiShield",
    children: [
      {
        id: uuid(),
        link: "/compliance/dashboard",
        name: "Dashboard",
        icon: "FiGrid",
      },
      {
        id: uuid(),
        link: "/compliance/frameworks",
        name: "Framework",
        icon: "FiLayers",
      },
      {
        id: uuid(),
        link: "/coming-soon",
        name: "Controls",
        icon: "FiSettings",
      },
      {
        id: uuid(),
        link: "/compliance/assignments",
        name: "Evidence Task",
        icon: "FiCheckSquare",
      },
    ],
  },
  {
    id: uuid(),
    title: "Operations",
    icon: "FiTool",
    children: [
      {
        id: uuid(),
        link: "/operations/employee-overview",
        name: "People",
        icon: "FiUsers",
      },
      {
        id: uuid(),
        link: "/operations/policy",
        name: "Policy",
        icon: "FiFileText",
      },
      {
        id: uuid(),
        link: "/operations/procedure",
        name: "Procedure",
        icon: "FiClipboard",
      },
      {
        id: uuid(),
        link: "/operations/trainings",
        name: "Training",
        icon: "FiBookOpen",
      },
      {
        id: uuid(),
        link: "/operations/finding-Management",
        name: "Finding Management",
        icon: "FiSearch",
      },
      {
        id: uuid(),
        link: "/operations/changeManagement",
        name: "Change Management",
        icon: "FiRepeat",
      },
      {
        id: uuid(),
        link: "/operations/event-Management",
        name: "Event Management",
        icon: "FiCalendar",
      },
      {
        id: uuid(),
        name: "Incident Management",
        icon: "FiAlertTriangle",
        children: [
          {
            id: uuid(),
            name: "Incident Management",
            link: "/operations/Incident-Management/",
            icon: "FiAlertOctagon",
          },
          {
            id: uuid(),
            name: "NIS2",
            link: "/operations/NIS2/Nis2",
            icon: "FiCheckCircle",
          },
          {
            id: uuid(),
            name: "NIS2 Self Assesment",
            link: "/NIS2-self-assesment",
            icon: "FiCheckCircle",
          },
        ],
      },
      {
        id: uuid(),
        link: "/operations/breachmanagement/BreachDashboard",
        name: "Breach Management",
        icon: "FiAlertCircle",
      },
    ],
  },

  {
    id: uuid(),
    title: "Risk Management",
    icon: "FiAlertCircle",
    children: [
      {
        id: uuid(),
        link: "/risk-management/risk-assessment",
        name: "Risk Assessment",
        icon: "FiLayers",
      },
      {
        id: uuid(),
        link: "/risk-management/risk-assessment/cybersecurity",
        name: "Cybersecurity",
        icon: "FiShield",
      },
      {
        id: uuid(),
        link: "/risk-management/project",
        name: "Project",
        icon: "FiFile",
      },
      {
        id: uuid(),
        link: "/risk-management/risk-assessment/contract",
        name: "Contract",
        icon: "FiFileText",
      },
      {
        id: uuid(),
        name: "Vulnerability Management",
        icon: "FiAlertTriangle",
        children: [
          {
            id: uuid(),
            link: "/vulnerability-management/dashboard",
            name: "Dashboard",
            icon: "FiGrid",
          },
          {
            id: uuid(),
            link: "/vulnerability-management/repositories",
            name: "Repositories",
            icon: "FiList",
          },
          {
            id: uuid(),
            link: "/vulnerability-management/scans",
            name: "Scans",
            icon: "FiSearch",
          },
          {
            id: uuid(),
            link: "/vulnerability-management/findings",
            name: "Findings",
            icon: "FiAlertTriangle",
          },
          {
            id: uuid(),
            link: "/vulnerability-management/exceptions",
            name: "Exceptions",
            icon: "FiArchive",
          },
          {
            id: uuid(),
            link: "/vulnerability-management/evidence",
            name: "Evidence",
            icon: "FiCheckSquare",
          },
        ],
      },
      {
        id: uuid(),
        link: "/exception-management",
        name: "Exception Management",
        icon: "FiAlertOctagon",
      },
      {
        id: uuid(),
        name: "Menu",
        icon: "FiPlus",
        children: [
          {
            id: uuid(),
            link: "/risk-management/add-new-menu",
            name: "Add New Menu",
            icon: "FiPlus",
          },
          {
            id: uuid(),
            link: "/risk-management/all-menu-list",
            name: "All Menu List",
            icon: "FiClipboard",
          },
        ],
      },
    ],
  },
  {
    id: uuid(),
    title: "Vendor & Customer Trust",
    icon: "FiUsers",
    children: [
      {
        id: uuid(),
        name: "Vendor Trust",
        icon: "FiUsers",
        children: [
          {
            id: uuid(),
            link: "/vendor-trust/dashboard",
            name: "Dashboard",
            icon: "FiBarChart2",
          },
          {
            id: uuid(),
            link: "/vendor-trust/VendorDashboard",
            name: "Vendor Details",
            icon: "FiUsers",
          },
          {
            id: uuid(),
            link: "/vendor-trust/VendorQuestionnaire",
            name: "Vendor Questionnaire",
            icon: "FiCpu",
          },
          {
            id: uuid(),
            link: "/vendor-trust/VendorLogin",
            name: "Vendor Login ",
            icon: "FiShield",
          },
          // New added sections under Vendor Trust
          {
            id: uuid(),
            link: "/vendor-trust/engagements",
            name: "Engagements",
            icon: "FiUserCheck",
          },
          {
            id: uuid(),
            link: "/vendor-trust/contracts",
            name: "Contracts",
            icon: "FiFileText",
          },
          {
            id: uuid(),
            link: "/vendor-trust/findings",
            name: "Findings",
            icon: "FiSearch",
          },
          {
            id: uuid(),
            link: "/vendor-trust/issues",
            name: "Issues",
            icon: "FiAlertTriangle",
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
            link: "/customer-trust/dashboard",
            name: "Dashboard",
            icon: "FiBarChart2",
          },
          {
            id: uuid(),
            link: "/customer-trust/CustomerDashboard",
            name: "Client Management",
            icon: "FiUsers",
          },
          {
            id: uuid(),
            link: "/customer-trust/ReviewerLogin",
            name: "Reviewer Login ",
            icon: "FiShield",
          },
        ],
      },
    ],
  },
  {
    id: uuid(),
    title: "Third Party Risk Management",
    icon: "FiTarget",
    children: [
      // {
      //   id: uuid(),
      //   link: "/third-parties-risk-management",
      //   name: "TPRM Workflow",
      //   icon: "FiGitBranch",
      // },
      {
        id: uuid(),
        link: "/third-parties-risk-management/dashboard",
        name: "Dashboard",
        icon: "FiGrid",
      },
      {
        id: uuid(),
        link: "/third-parties-risk-management/committee-members",
        name: "Committee Members",
        icon: "FiUserCheck",
      },
      {
        id: uuid(),
        link: "/third-parties-risk-management/TPRMQuestionnaire",
        name: "Third Party Questionnaire",
        icon: "FiClipboard",
      },
      {
        id: uuid(),
        link: "/third-parties-risk-management/TPRMDetails",
        name: "Third Party Assessment",
        icon: "FiBriefcase",
      },
      {
        id: uuid(),
        link: "/third-parties-risk-management/Meeting",
        name: "Meeting Notes/Minutes",
        icon: "FiUserCheck",
      },
      {
        id: uuid(),
        link: "/third-parties-risk-management/blacklisting",
        name: "Blacklisting",
        icon: "FiAlertOctagon",
      },
      {
        id: uuid(),
        link: "/third-parties-risk-management/IncidentReporting",
        name: "Incident Portal",
        icon: "FiAlertOctagon",
      },
      {
        id: uuid(),
        link: "/third-parties-risk-management/GovernanceApproval",
        name: "Governance Approval",
        icon: "FiCheckSquare",
      },
      {
        id: uuid(),
        link: "/third-parties-risk-management/PhysicalAudit",
        name: "Physical Audit",
        icon: "AiOutlineAudit",
      },
      {
        id: uuid(),
        link: "/third-parties-risk-management/sla",
        name: "SLA Management",
        icon: "FiFileText",
      },
      {
        id: uuid(),
        link: "/third-parties-risk-management/FindingsCapa",
        name: "Findings/CAPA",
        icon: "FiActivity",
      },
      {
        id: uuid(),
        link: "/third-parties-risk-management/Reporting",
        name: "Reporting",
        icon: "FiBarChart2",
      },
      {
        id: uuid(),
        link: "/third-parties-risk-management/ThirdPartyLogin",
        name: "Third Party Login",
        icon: "FiLogIn",
      },
    ],
  },
  {
    id: uuid(),
    title: "Privacy",
    icon: "FiLock",
    children: [
      {
        id: uuid(),
        link: "/admin/dataFlow/assets",
        name: "Assets",
        icon: "FiPackage",
      },
      {
        id: uuid(),
        link: "/admin/dataFlow/jobs",
        name: "Jobs",
        icon: "FiClock",
      },
      {
        id: uuid(),
        link: "/operations/policy-dashboard",
        name: "Dashboard",
        icon: "FiPieChart",
      },
      {
        id: uuid(),
        link: "/privacy/framework",
        name: "Frameworks",
        icon: "FiLayers",
      },
      {
        id: uuid(),
        link: "/consent-notice-management",
        name: "Consent Notice Management",
        icon: "FiLayers",
      },
      {
        id: uuid(),
        name: "DPIA and Appendix",
        icon: "FiFilePlus",
        children: [
          {
            id: uuid(),
            link: "/privacy/dpia/DpiaOverviewDashboard",
            name: "Dashboard",
            icon: "FiPieChart",
          },
          {
            id: uuid(),
            link: "/privacy/dpia/templates",
            name: "Templates",
            icon: "FiLayers",
          },
          {
            id: uuid(),
            link: "/privacy/dpia/view-dpia",
            name: "All Assessments",
            icon: "FiClipboard",
          },
          {
            id: uuid(),
            link: "/privacy/dpia/review",
            name: "Review Queue",
            icon: "FiEye",
          },
          {
            id: uuid(),
            link: "/privacy/dpia/approvals",
            name: "Approval Queue",
            icon: "FiCheckCircle",
          },

          {
            id: uuid(),
            link: "/privacy/appendix",
            name: "Appendix",
            icon: "FiBookOpen",
          },
        ],
      },

      {
        id: uuid(),
        name: "Data Flow ",
        icon: "FiClipboard",
        children: [
          // 🧭 Data Mapping group
          {
            id: uuid(),
            name: "Data Mapping",
            icon: "FiMap",
            children: [
              {
                id: uuid(),
                link: "/admin/dataFlow/mapping",
                name: "Mapping Dashboard",
                icon: "FiMapPin",
              },
              {
                id: uuid(),
                link: "/admin/dataFlow/mapping/bpa",
                name: "BPA",
                icon: "FiGitBranch",
              },
              {
                id: uuid(),
                link: "/admin/dataFlow/mapping/system-activities",
                name: "System Activities",
                icon: "FiCpu",
              },
              {
                id: uuid(),
                link: "/admin/dataFlow/mapping/flows",
                name: "Data Flows",
                icon: "FiRepeat",
              },
              {
                id: uuid(),
                link: "/admin/dataFlow/mapping/vendors",
                name: "Vendors",
                icon: "FiTruck",
              },
              {
                id: uuid(),
                link: "/admin/dataFlow/mapping/coverage",
                name: "Coverage",
                icon: "FiCheckCircle",
              },
              {
                id: uuid(),
                link: "/admin/dataFlow/mapping/ropa",
                name: "ROPA",
                icon: "FiArchive",
              },
              {
                id: uuid(),
                link: "/admin/dataFlow/purposes",
                name: "Purpose",
                icon: "FiTarget",
              },
            ],
          },

          {
            id: uuid(),
            name: "Framework Mapping",
            icon: "FiGitBranch",
            children: [
              {
                id: uuid(),
                link: "/admin/dataFlow/framework-topics",
                name: "Framework Topics",
                icon: "FiLayers",
              },
              {
                id: uuid(),
                link: "/admin/dataFlow/framework-map",
                name: "Framework Map",
                icon: "FiMap",
              },
            ],
          },

          {
            id: uuid(),
            name: "Data Dictionary",
            icon: "FiDatabase",
            children: [
              {
                id: uuid(),
                link: "/admin/dataFlow/dataDictionary",
                name: "Dashboard",
                icon: "FiBarChart2",
              },
              {
                id: uuid(),
                link: "/admin/dataFlow/dataCategories",
                name: "Data Categories",
                icon: "FiLayers",
              },
              {
                id: uuid(),
                link: "/admin/dataFlow/dataClassifications",
                name: "Data Classifications",
                icon: "FiSliders",
              },
              {
                id: uuid(),
                link: "/admin/dataFlow/dataSubjects",
                name: "Data Subject Types",
                icon: "FiUsers",
              },
              {
                id: uuid(),
                link: "/admin/dataFlow/dataElements",
                name: "Data Elements",
                icon: "FiBox",
              },
              {
                id: uuid(),
                link: "/admin/dataFlow/purposes",
                name: "Purpose",
                icon: "FiTarget",
              },
            ],
          },
          // {
          //   id: uuid(),
          //   name: "Data Dictionary",
          //   icon: "FiGrid",
          //   children: [
          //     {
          //       id: uuid(),
          //       link: "/admin/dataFlow/dataCategories",
          //       name: "Data Categories",
          //       icon: "FiLayers",
          //     },
          //     {
          //       id: uuid(),
          //       link: "/admin/dataFlow/dataClassifications",
          //       name: "Data Classifications",
          //       icon: "FiLayers",
          //     },
          //     {
          //       id: uuid(),
          //       link: "/admin/dataFlow/dataSubjects",
          //       name: "Data Subject Tpyes",
          //       icon: "FiUsers",
          //     },
          //     {
          //       id: uuid(),
          //       link: "/admin/dataFlow/dataElements",
          //       name: "Data Elements",
          //       icon: "FiFileText",
          //     },
          //     {
          //       id: uuid(),
          //       link: "/admin/dataFlow/purposes",
          //       name: "Purpose",
          //       icon: "FiFileText",
          //     },
          //   ],
          // },
          {
            id: uuid(),
            name: "Data Retention",
            icon: "FiArchive",
            children: [
              {
                id: uuid(),
                link: "/admin/dataFlow/retention/retentionPolicies",
                name: "Retention Policies",
                icon: "FiClock",
              },
              {
                id: uuid(),
                link: "/admin/dataFlow/retention/retentionRules",
                name: "Retention Rules",
                icon: "FiSettings",
              },
            ],
          },
          {
            id: uuid(),
            name: "Reports",
            icon: "FiBarChart",
            children: [
              {
                id: uuid(),
                link: "/admin/dataFlow/mapping/ropa",
                name: "ROPA",
                icon: "FiArchive",
              },
            ],
          },
        ],
      },

      // {
      //   id: uuid(),
      //   name: "Webform Consent",
      //   icon: "FiCheckCircle",
      //   link: "/admin/scanner/webform-consent",
      // },

      // {
      //   id: uuid(),
      //   name: "Child Consent",
      //   icon: "FiUsers",
      //   children: [
      //     {
      //       id: uuid(),
      //       link: "/admin/scanner/child-consent/dashboard",
      //       name: "Dashboard",
      //       icon: "FiGrid",
      //     },
      //   ],
      // },

      {
        id: uuid(),
        name: "Consent Management",
        icon: "FiShield",
        children: [
          {
            id: uuid(),
            name: "Webform Consent",
            icon: "FiFileText",
            link: "/admin/scanner/webform-consent",
          },
          {
            id: uuid(),
            name: "Child Consent Dashboard",
            icon: "FiUsers",
            link: "/admin/scanner/child-consent/dashboard",
          },
        ],
      },

      {
        id: uuid(),
        name: "Rights Management",
        icon: "FiUserCheck",
        children: [
          {
            id: uuid(),
            link: "/admin/scanner/dsar/dashboard",
            name: "DPRM Dashboard",
            icon: "FiPieChart",
          },
          {
            id: uuid(),
            link: "/admin/scanner/dsar/assignee",
            name: "Assignee Dashboard",
            icon: "FiUserCheck",
          },
          {
            id: uuid(),
            link: "/admin/scanner/dsar/user-dashboard",
            name: "User Dashboard",
            icon: "FiUser",
          },
          {
            id: uuid(),
            link: "/admin/scanner/dsar",
            name: "DPRM",
            icon: "FiFilePlus",
          },
        ],
      },
      {
        id: uuid(),
        name: "Cookie Consent",
        icon: "BiCookie",
        children: [
          {
            id: uuid(),
            link: "/admin/scanner/websites/",
            name: "Websites",
            icon: "FiGlobe",
          },
          {
            id: uuid(),
            link: "/admin/scanner/cmp/dashboard",
            name: "Dashboard",
            icon: "FiBarChart2",
          },
          {
            id: uuid(),
            link: "/admin/scanner/cmp",
            name: "Cookie Consent Management",
            icon: "FiSettings",
          },
          {
            id: uuid(),
            link: "/admin/integration-sync",
            name: "Integration Sync",
            icon: "GrIntegration",
          }
        ],
      },
      {
        id: uuid(),
        name: "Mass Mailing",
        icon: "FiMail",
        children: [
          {
            id: uuid(),
            link: "/mass-mailing",
            name: "Campaigns",
            icon: "FiSend",
          },
        ],
      },
    ],
  },

  {
    id: uuid(),
    title: "Industry",
    icon: "FiDollarSign",
    children: [
      {
        id: uuid(),
        name: "Assessment",
        icon: "FiCheckSquare",
        link: "/industry/freeassessment",
      },
      {
        id: uuid(),
        name: "Automobile",
        icon: "FiPackage",
        children: [
          {
            id: uuid(),
            name: "TISAX",
            icon: "FiShield",
            children: [
              {
                id: uuid(),
                link: "/industry/automobile/tisax?vda_version=6.0.3",
                name: "6.0.3",
                icon: "FiLayers",
              },
            ],
          },
          {
            id: uuid(),
            name: "TISAX AUDIT",
            icon: "AiOutlineAudit",
            children: [
              {
                id: uuid(),
                link: "/industry/automobile/tisax-audit?vda_version=6.0.3",
                name: "6.0.3",
                icon: "FiLayers",
              },
            ],
          },
          {
            id: uuid(),
            name: "Assign Controls",
            icon: "FiCheckCircle",
            link: "/industry/automobile/tisax/assigncontrols",
          },
          {
            id: uuid(),
            name: "Assign Team",
            icon: "FiUsers",
            link: "/industry/automobile/tisax/assignteam",
          },
          {
            id: uuid(),
            name: "ISO 42001",
            icon: "FiBookOpen",
            link: "/industry/automobile/ISO42001",
          },
        ],
      },
      {
        id: uuid(),
        name: "Banking and Finance",
        icon: "FiDollarSign",
        children: [
          {
            id: uuid(),
            link: "/industry/banking-and-finance/ffiec",
            name: "FFIEC",
            icon: "FiAward",
          },
          {
            id: uuid(),
            link: "/industry/banking-and-finance/cscrf",
            name: "CSCRF",
            icon: "FiShield",
          },
          {
            id: uuid(),
            link: "/industry/banking-and-finance/irda",
            name: "IRDA",
            icon: "FiUmbrella",
          },
          {
            id: uuid(),
            link: "/industry/banking-and-finance/Cra",
            name: "CRA",
            icon: "FiBarChart2",
          },
          {
            id: uuid(),
            link: "/industry/banking-and-finance/rbi",
            name: "RBI",
            icon: "FiHome",
          },
          {
            id: uuid(),
            link: "/industry/banking-and-finance/RbiTracker",
            name: "RBI Tracker",
            icon: "FiActivity",
          },
          {
            id: uuid(),
            link: "/industry/banking-and-finance/RbiTrackerUser",
            name: "RBI Tracker User Portal",
            icon: "FiUserCheck",
          },
          {
            id: uuid(),
            name: "Mandate Management",
            icon: "FiClipboard",
            children: [
              {
                id: uuid(),
                link: "/mandate-management/dashboard",
                name: "Dashboard",
                icon: "FiGrid",
              },
              {
                id: uuid(),
                link: "/mandates/new",
                name: "Mandate Form",
                icon: "FiFilePlus",
              },
              {
                id: uuid(),
                link: "/mandates/mandates-dashboard",
                name: "Mandates Dashboard",
                icon: "FiClipboard",
              },
              {
                id: uuid(),
                link: "/approve-mandates/sme-dashboard",
                name: "SME Dashboard",
                icon: "FiUsers",
              },
              {
                id: uuid(),
                link: "/approve-mandates/legal-dashboard",
                name: "Legal Dashboard",
                icon: "FiBook",
              },
              {
                id: uuid(),
                link: "/controls/controls-dashboard",
                name: "Extracted Controls",
                icon: "FiSliders",
              },
              {
                id: uuid(),
                link: "/compare_mandates",
                name: "Control List",
                icon: "FiList",
              },
            ],
          },
        ],
      },
      {
        id: uuid(),
        link: "/coming-soon",
        name: "Healthcare",
        icon: "FiHeart",
      },
    ],
  },

  {
    id: uuid(),
    title: "Audit",
    icon: "AiOutlineAudit",
    children: [
      {
        id: uuid(),
        link: "/audit/internal-audit",
        name: "Internal Audit",
        icon: "AiOutlineAudit",
      },
      {
        id: uuid(),
        link: "/audit/reviewer",
        name: "Internal Audit - Reviewer",
        icon: "FiEye",
      },
      {
        id: uuid(),
        link: "/audit/approver",
        name: "Internal Audit - Approver",
        icon: "FiCheckCircle",
      },
      {
        id: uuid(),
        link: "/audit/employer",
        name: "Internal Audit - Auditor",
        icon: "FiClipboard",
      },
    ],
  },
  {
    id: uuid(),
    title: "Business Continuity",
    icon: "FiActivity",
    children: [
      {
        id: uuid(),
        link: "/business-continuity",
        name: "Dashboard",
        icon: "FiPieChart",
      },
      {
        id: uuid(),
        link: "/business-continuity/vendors",
        name: "Vendors",
        icon: "FiTruck",
      },
      {
        id: uuid(),
        link: "/business-continuity/assets",
        name: "Assets",
        icon: "FiPackage",
      },
      {
        id: uuid(),
        link: "/business-continuity/processes",
        name: "Processes",
        icon: "FiGitBranch",
      },
      {
        id: uuid(),
        link: "/business-continuity/bia",
        name: "BIA",
        icon: "FiBarChart2",
      },
      {
        id: uuid(),
        name: "DR Plans / DR Auto",
        icon: "FiRepeat",
        children: [
          {
            id: uuid(),
            link: "/business-continuity/dr-plans",
            name: "DR Plans",
            icon: "FiMap",
          },
          {
            id: uuid(),
            link: "/business-continuity/dr-auto",
            name: "DR Auto",
            icon: "FiZap",
          },
        ],
      },
      {
        id: uuid(),
        link: "/business-continuity/risks",
        name: "Risks",
        icon: "FiAlertCircle",
      },
      {
        id: uuid(),
        link: "/business-continuity/resilience",
        name: "Resilience Dashboard",
        icon: "FiTrendingUp",
      },
    ],
  },
  {
    id: uuid(),
    title: "GRC as a Service",
    icon: "FiCheckCircle",
    children: [
      {
        id: uuid(),
        link: "/superadmindashboard/StatusGridDashboard",
        name: "Dashboard",
        icon: "FiGrid",
      },
      {
        id: uuid(),
        link: "/superadmindashboard",
        name: "Average Dashboard",
        icon: "FiBarChart",
      },
      {
        id: uuid(),
        link: "/superadmindashboard/AdminDetailDashboard",
        name: "Detailed Dashboard",
        icon: "FiFileText",
      },
    ],
  },
  {
    id: uuid(),
    title: "Access Management",
    icon: "FiUsers",
    children: [
      {
        id: uuid(),
        link: "/management-hub/governance-hub/access-management/dashboard",
        name: "Overview",
        icon: "FiPieChart",
      },
      {
        id: uuid(),
        link: "/management-hub/governance-hub/access-management/user-management",
        name: "Create Users",
        icon: "FiUserPlus",
      },
      {
        id: uuid(),
        link: "/management-hub/governance-hub/access-management/role-management",
        name: "Manage Roles",
        icon: "FiKey",
      },
      {
        id: uuid(),
        link: "/admin/roleassignment",
        name: "Assign Roles",
        icon: "FiUserCheck",
      },
      {
        id: uuid(),
        link: "/admin/tenant-onboarding",
        name: "Tenant Onboarding",
        icon: "FiHome",
      },
    ],
  },
  {
    id: uuid(),
    title: "Management Hub",
    icon: "FiUserCheck",
    children: [
      {
        id: uuid(),
        name: "Governance Hub",
        icon: "FiUserCheck",
        children: [
          {
            id: uuid(),
            link: "/governance/team-management",
            name: "Team Management",
            icon: "FiBriefcase",
          },
          {
            id: uuid(),
            link: "/governance/division-management",
            name: "Division Management",
            icon: "FiGitBranch",
          },
          {
            id: uuid(),
            link: "/governance/department-management",
            name: "Department Management",
            icon: "FiUsers",
          },
          {
            id: uuid(),
            link: "/governance/business-management",
            name: "Business Management",
            icon: "FiBarChart",
          },
          {
            id: uuid(),
            link: "/governance/process-management",
            name: "Process Management",
            icon: "FiRepeat",
          },
          // {
          //   id: uuid(),
          //   link: "/governance/license-management",
          //   name: "License Management",
          //   icon: "FiLayers",
          // },
          {
            id: uuid(),
            link: "/governance/organization-management",
            name: "Organization Management",
            icon: "FiHome",
          },
          {
            id: uuid(),
            link: "/governance/meeting-management",
            name: "Meeting Management",
            icon: "FiCalendar",
          },
        ],
      },
      {
        id: uuid(),
        name: "Compliance Hub",
        icon: "FiCheckCircle",
        children: [
          {
            id: uuid(),
            link: "/compliancehub/dashboard",
            name: "Compliance Dashboard",
            icon: "FiGrid",
          },
          {
            id: uuid(),
            link: "/compliancehub/system-monitoring",
            name: "System Monitoring",
            icon: "FiCpu",
          },
          {
            id: uuid(),
            link: "/compliancehub/audit-logs",
            name: "Audit Logs",
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
            link: "/notifications",
            name: "Notification Management",
            icon: "FiMail",
          },
        ],
      },
      {
        id: uuid(),
        name: "Task Management Hub",
        icon: "FiCheckSquare",
        children: [
          {
            id: uuid(),
            link: "/management-hub/task-management-hub/create-task",
            name: "Create Task ",
            icon: "FiFilePlus",
          },
          {
            id: uuid(),
            link: "/management-hub/task-management-hub/task-summary",
            name: "Task Summary",
            icon: "FiList",
          },
        ],
      },
      {
        id: uuid(),
        name: "Integration Hub",
        icon: "AiOutlineApi",
        children: [
          {
            id: uuid(),
            link: "/integration/management",
            name: "Integration Management",
            icon: "FiCode",
          },
          {
            id: uuid(),
            // link: "/management-hub/asset/management",
            link: "/managementhub/asset/management",
            name: "Asset Management",
            icon: "FiPackage",
          },
          {
            id: uuid(),
            name: "Privacy",
            icon: "FiLock",
            children: [
              {
                id: uuid(),
                link: "/privacy/TemplateSelector",
                name: "Cookies Templates",
                icon: "FiLayout",
              },
              {
                id: uuid(),
                link: "/privacy/ConsentBanner",
                name: "Consent Banner",
                icon: "FiFlag",
              },
              {
                id: uuid(),
                link: "/privacy/Install",
                name: "Install",
                icon: "FiDownload",
              },
              {
                id: uuid(),
                link: "/privacy/Scanner",
                name: "Scanner",
                icon: "FiSearch",
              },
            ],
          },
        ],
      },
      {
        id: uuid(),
        name: "Privacy Consent Management",
        icon: "FiCheckSquare",
        children: [
          {
            id: uuid(),
            link: "/dsar-dashboard",
            name: "DPRM Dashboard",
            icon: "FiPieChart",
          },
          {
            id: uuid(),
            link: "/admin/scanner/webform-configuration",
            name: "Web Form Configuration",
            icon: "FiEdit3",
          },
          {
            id: uuid(),
            name: "Cookies Consent",
            icon: "BiCookie",
            children: [
              {
                id: uuid(),
                link: "/admin/scanner/banner-templates",
                name: "Banner Templates",
                icon: "FiLayout",
              },
              {
                id: uuid(),
                link: "/admin/scanner/consent-categories",
                name: "Cookie Consent Category",
                icon: "FiSliders",
              },
            ],
          },
          {
            id: uuid(),
            name: "Child Consent",
            icon: "FiUsers",
            children: [
              {
                id: uuid(),
                link: "/admin/scanner/child-consent?id=new",
                name: "Config",
                icon: "FiSettings",
              },
              {
                id: uuid(),
                link: "/admin/scanner/child-consent/childConsentdashboard",
                name: "Dashboard",
                icon: "FiGrid",
              },
            ],
          },
        ],
      },
      {
        id: uuid(),
        link: "/management-hub/settings",
        name: "Settings",
        icon: "FiTool",
      },
    ],
  },

  {
    id: uuid(),
    title: "User Hub",
    icon: "FiUser",
    children: [
      {
        id: uuid(),
        link: "/user/framework",
        name: "User Framework Portal",
        icon: "FiBookOpen",
      },
      {
        id: uuid(),
        link: "/user/portal",
        name: "User Portal",
        icon: "FiUser",
      },
    ],
  },

  {
    id: uuid(),
    title: "Contact Us",
    icon: "FiMail",
    link: "/contact",
  },

  {
    id: uuid(),
    title: "Work Bench",
    icon: "FiCompass",
    children: [
      {
        id: uuid(),
        link: "/coming-soon",
        name: "Custom Workflow",
        icon: "FiEdit3",
      },
      {
        id: uuid(),
        link: "/workbench/scalable-form",
        name: "Form Builder",
        icon: "FiLayout",
      },
      {
        id: uuid(),
        link: "/workbench/FromApi",
        name: "Cybersecurity",
        icon: "AiOutlineAudit",
      },
      {
        id: uuid(),
        link: "/workbench/FetchResponseByMeta",
        name: "Response",
        icon: "AiOutlineApi",
      },
    ],
  },
];

const iconMap = {
  FiCompass: <FiCompass />,
  FiGrid: <FiGrid />,
  FiLayers: <FiLayers />,
  FiList: <FiList />,
  FiHeart: <FiHeart />,
  FiUser: <FiUser />,
  FiFileText: <FiFileText />,
  FiBookOpen: <FiBookOpen />,
  FiRefreshCw: <FiRefreshCw />,
  FiCalendar: <FiCalendar />,
  FiAlertTriangle: <FiAlertTriangle />,
  FiCheckCircle: <FiCheckCircle />,
  FiShield: <FiShield />,
  FiClipboard: <FiClipboard />,
  FiAlertCircle: <FiAlertCircle />,
  FiFile: <FiFile />,
  FiTrendingUp: <FiTrendingUp />,
  FiBook: <FiBook />,
  FiDollarSign: <FiDollarSign />,
  FiBriefcase: <FiBriefcase />,
  FiGlobe: <FiGlobe />,
  FiSun: <FiSun />,
  FiThumbsUp: <FiThumbsUp />,
  FiCpu: <FiCpu />,
  FiPlus: <FiPlus />,
  FiUsers: <FiUsers />,
  FiUserCheck: <FiUserCheck />,
  FiLock: <FiLock />,
  FiDownload: <FiDownload />,
  FiFlag: <FiFlag />,
  FiAlertOctagon: <FiAlertOctagon />,
  FiMail: <FiMail />,
  FiSettings: <FiSettings />,
  FiTool: <FiTool />,
  FiSearch: <FiSearch />,
  FiZap: <FiZap />,
  FiBarChart: <FiBarChart />,
  FiBarChart2: <FiBarChart2 />,
  FiBell: <FiBell />,
  FiEdit3: <FiEdit3 />,
  FiLayout: <FiLayout />,
  FiActivity: <FiActivity />,
  FiArchive: <FiArchive />,
  FiAward: <FiAward />,
  FiBox: <FiBox />,
  FiCheckSquare: <FiCheckSquare />,
  FiClock: <FiClock />,
  FiCode: <FiCode />,
  FiDatabase: <FiDatabase />,
  FiEye: <FiEye />,
  FiFilePlus: <FiFilePlus />,
  FiGitBranch: <FiGitBranch />,
  FiHome: <FiHome />,
  FiKey: <FiKey />,
  FiLogIn: <FiLogIn />,
  FiMap: <FiMap />,
  FiMapPin: <FiMapPin />,
  FiMonitor: <FiMonitor />,
  FiPackage: <FiPackage />,
  FiPieChart: <FiPieChart />,
  FiRepeat: <FiRepeat />,
  FiSend: <FiSend />,
  FiServer: <FiServer />,
  FiSliders: <FiSliders />,
  FiTarget: <FiTarget />,
  FiTruck: <FiTruck />,
  FiUmbrella: <FiUmbrella />,
  FiUserPlus: <FiUserPlus />,
  AiOutlineApi: <AiOutlineApi />,
  AiOutlineAudit: <AiOutlineAudit />,
  BiCookie: <BiCookie />,
};

// Function to generate initials from the user's full name
const generateInitials = (userName) => {
  if (!userName) return "?";
  const nameParts = userName.split(" ");
  return nameParts.map((part) => part.charAt(0).toUpperCase()).join("") || "?";
};

const SideNavbar = () => {
  const { isOpen, toggleSidebar } = useSidebar();
  const router = useRouter();
  const [expandedMenu, setExpandedMenu] = useState(null);
  const [nestedExpandedMenu, setNestedExpandedMenu] = useState(null);
  const [userData, setUserData] = useState(null);
  const [thirdlevelexpand, setthirdlevelexpand] = useState(null);

  useEffect(() => {
    const storedUserData = Cookies.get("user_data");
    if (storedUserData) {
      try {
        setUserData(JSON.parse(storedUserData));
      } catch (error) {
        console.error("Error parsing user data:", error);
      }
    }
  }, []);

  // ////////////////////////////////////////////////

  // FETCH USER ROLES + PERMISSIONS FROM /${initURL}/apiv1/users/db AND DERIVE ALLOWED MODULES

  useEffect(() => {
    const run = async () => {
      const cookieEmail = String(userData?.email || "")
        .trim()
        .toLowerCase();
      if (!cookieEmail) return;

      try {
        const res = await CustomAxios.get(USER_DB_URL, {
          params: { page: 1, limit: 1000 }, // increase limit so user is included
        });

        const body = res.data?.body;

        const list =
          (Array.isArray(body?.data) && body.data) ||
          (Array.isArray(res.data?.data) && res.data.data) ||
          [];

        const matched = list.find(
          (u) =>
            String(u?.email || "")
              .trim()
              .toLowerCase() === cookieEmail,
        );

        if (!matched) {
          console.warn("No user matched in database for:", cookieEmail);
          return;
        }

        // roles + permissions only from DB
        const roles = Array.isArray(matched?.roles) ? matched.roles : [];

        const perms = getEffectivePermissionKeys(matched);

        // ✅ set both permissions + roles for canLocal() logic
        setPerms(perms, roles);

        // (optional) If your setPerms already writes cookies, remove these.
        // If not, you can keep them:
        // Legacy cookie kept commented for reference while we fully rely on modules[].permissions.
        // Cookies.set("permission_keys", JSON.stringify(perms));
        Cookies.set("permissions", JSON.stringify(perms));
        Cookies.set("roles", JSON.stringify(roles));
        const moduleEntries = getUserAccessEntries(matched);

        Cookies.set(
          "user_data",
          JSON.stringify({
            ...(userData || {}),
            ...matched,
            roles,
            // permissionKeys: perms,
            permissions: perms,
            modules: moduleEntries,
          }),
        );
      } catch (e) {
        console.error("Failed to fetch /${initURL}/apiv1/users/db:", e);
      }
    };

    run();
  }, [userData?.email]);

  const handleSignOut = async () => {
    try {
      await CustomAxios.get(`${baseurl}/${initURL}/apiv1/logout`, {
        withCredentials: true,
      });
      Cookies.remove("user_data");
      setUserData(null);
      router.push("/login");
      toast.success("Signed out successfully.");
    } catch (error) {
      console.error("Sign out failed:", error);
      toast.error("Failed to sign out. Please try again.");
    }
  };

  const toggleMenu = (menuId) => {
    setExpandedMenu((prev) => (prev === menuId ? null : menuId));
  };

  const toggleNestedMenu = (nestedId) => {
    setNestedExpandedMenu((prev) => (prev === nestedId ? null : nestedId));
  };

  const togglethirdlevelnestedMenu = (nestedId) => {
    setthirdlevelexpand((prev) => (prev === nestedId ? null : nestedId));
  };

  const profileImg = userData?.profile_img;

  const accessContext = useMemo(() => {
    const moduleEntries = getUserAccessEntries(userData || {});
    const permissionKeys = getEffectivePermissionKeys(userData || {});
    const roles = Array.isArray(userData?.roles) ? userData.roles : [];

    return { moduleEntries, permissionKeys, roles };
  }, [userData]);

  const hasScannerModuleAccess = useMemo(
    () =>
      accessContext.moduleEntries.some((entry) =>
        resolveModuleKeysFromAccessEntry(entry).some(
          (moduleKey) => normalizeModuleKey(moduleKey) === "scanner",
        ),
      ),
    [accessContext.moduleEntries],
  );

  const isSuperAdmin = useMemo(
    () =>
      accessContext.roles.some(
        (role) =>
          String(role || "")
            .trim()
            .toUpperCase()
            .replace(/[\s-]+/g, "_") === "SUPER_ADMIN",
      ),
    [accessContext.roles],
  );

  const currentMenu = useMemo(
    () =>
      ClientDashboardMenu.map((menu) => {
        if (!Array.isArray(menu.children)) {
          return menu;
        }

        if (menu.title === "Access Management") {
          return {
            ...menu,
            children: menu.children.filter((child) =>
              child.name === "Tenant Onboarding" ? isSuperAdmin : true,
            ),
          };
        }

        if (menu.title !== "Privacy") {
          return menu;
        }

        return {
          ...menu,
          children: menu.children.filter((child) => {
            if (child.name === "Assets" || child.name === "Jobs") {
              return hasScannerModuleAccess;
            }

            return true;
          }),
        };
      }),
    [hasScannerModuleAccess, isSuperAdmin],
  );

  const getNavLinkHref = (link) => {
    if (!link) return link;

    return hasRouteAccess(
      link,
      accessContext.moduleEntries,
      accessContext.roles,
      accessContext.permissionKeys,
    )
      ? link
      : "/contact";
  };

  // //

  // Get the initials from the user's full name
  const initials = generateInitials(userData?.user_name);

  // Extract roles and truncate the rest
  const roles = userData?.roles || [];
  const firstRole = roles[0] || "?";
  const truncatedRoles = roles.slice(1).join(", ") || ""; // Truncate the rest of the roles

  return (
    <div
      className={`bg-[#050038] text-white h-screen ${
        isOpen ? "w-1/5" : "w-16"
      } flex flex-col font-semibold transition-all duration-300`}
    >
      {/* Sidebar Header */}
      <div className="flex items-center justify-between h-20 px-4 border-b border-gray-700">
        {isOpen && (
          <div className="flex items-center bg-transparent">
            <Image
              src="/images/GRC3BGNoBG.png"
              alt="Logo"
              width={100}
              height={30}
              objectFit="contain"
              className="h-auto max-h-12"
            />
          </div>
        )}
        <button onClick={toggleSidebar} className="text-white">
          <FiMenu size={24} />
        </button>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-grow overflow-y-auto px-4 py-6 space-y-2 scrollbar-none">
        {/* <div className="flex items-center justify-between p-2 hover:bg-[#1E335A] rounded-md cursor-pointer"></div> */}
        {currentMenu.map((menu) => (
          <div key={menu.id}>
            {["Access Management"].includes(menu.title) && (
              <div className="border-t border-gray-700 my-4"></div>
            )}
            <div
              // onClick={() => {
              //   toggleMenu(menu.id);
              //   menu.title == "Contact Us" ||
              //     (menu.title == "Consent Dashboard" &&
              //       router.push(getNavLinkHref(menu.link)));
              // }}
              onClick={() => {
                if (menu.link) {
                  router.push(getNavLinkHref(menu.link));
                } else {
                  toggleMenu(menu.id);
                }
              }}
              className="flex items-center justify-between p-2 hover:bg-[#1E335A] rounded-md cursor-pointer"
            >
              <div className="flex items-center">
                {iconMap[menu.icon] || <FiGrid />}
                {isOpen && <span className="ml-3">{menu.title}</span>}
              </div>
              {menu.children && isOpen && (
                <span>
                  {expandedMenu === menu.id ? (
                    <FiChevronDown />
                  ) : (
                    <FiChevronRight />
                  )}
                </span>
              )}
            </div>

            {menu.children && expandedMenu === menu.id && (
              <div className={`pl-6 space-y-1 ${isOpen ? "" : "hidden"}`}>
                {menu.children.map((child) => {
                  return (
                    <div key={child.id}>
                      {child.children ? (
                        <>
                          <div
                            onClick={() => toggleNestedMenu(child.id)}
                            className="flex items-center justify-between p-2 hover:bg-[#1E335A] rounded-md cursor-pointer"
                          >
                            <div className="flex items-center">
                              {iconMap[child.icon] || <FiGrid />}
                              {isOpen && (
                                <span className="ml-3">{child.name}</span>
                              )}
                            </div>
                            <span>
                              {nestedExpandedMenu === child.id ? (
                                <FiChevronDown />
                              ) : (
                                <FiChevronRight />
                              )}
                            </span>
                          </div>
                          {nestedExpandedMenu === child.id && (
                            <div className="pl-6">
                              {child.children.map((nestedChild) => {
                                return !nestedChild.children ? (
                                  <Link
                                    href={getNavLinkHref(nestedChild.link)}
                                    key={nestedChild.id}
                                    passHref
                                  >
                                    <div className="flex items-center p-2 hover:bg-[#1E335A] rounded-md cursor-pointer">
                                      {iconMap[nestedChild.icon] || <FiGrid />}
                                      {isOpen && (
                                        <span className="ml-3">
                                          {nestedChild.name}
                                        </span>
                                      )}
                                    </div>
                                  </Link>
                                ) : (
                                  <div className="flex flex-col justify-between">
                                    <div
                                      className="flex items-center justify-between p-2 hover:bg-[#1E335A] rounded-md cursor-pointer"
                                      onClick={() =>
                                        togglethirdlevelnestedMenu(
                                          nestedChild.id,
                                        )
                                      }
                                    >
                                      <span className="flex items-center">
                                        {iconMap[nestedChild.icon] || (
                                          <FiGrid />
                                        )}
                                        {isOpen && (
                                          <span className="ml-3">
                                            {nestedChild.name}
                                          </span>
                                        )}
                                      </span>
                                      <span>
                                        {thirdlevelexpand === nestedChild.id ? (
                                          <FiChevronDown />
                                        ) : (
                                          <FiChevronRight />
                                        )}
                                      </span>
                                    </div>
                                    <span>
                                      {thirdlevelexpand === nestedChild.id && (
                                        <div className="pl-6">
                                          {nestedChild.children.map(
                                            (innerChild) => {
                                              return (
                                                <Link
                                                  href={getNavLinkHref(
                                                    innerChild.link,
                                                  )}
                                                  key={innerChild.id}
                                                  passHref
                                                >
                                                  <div className="flex items-center p-2 hover:bg-[#1E335A] rounded-md cursor-pointer">
                                                    {iconMap[
                                                      innerChild.icon
                                                    ] || <FiGrid />}
                                                    {isOpen && (
                                                      <span className="ml-3">
                                                        {innerChild.name}
                                                      </span>
                                                    )}
                                                  </div>
                                                </Link>
                                              );
                                            },
                                          )}
                                        </div>
                                      )}
                                    </span>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </>
                      ) : (
                        <Link href={getNavLinkHref(child.link)} passHref>
                          <div className="flex items-center p-2 hover:bg-[#1E335A] rounded-md cursor-pointer">
                            {iconMap[child.icon] || <FiGrid />}
                            {isOpen && (
                              <span className="ml-3">{child.name}</span>
                            )}
                          </div>
                        </Link>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </nav>

      {/* User Profile Section */}
      <div className="flex items-center justify-between p-4 border-t border-gray-800">
        {userData && (
          <div className="flex items-center space-x-3">
            {profileImg ? (
              <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-500 overflow-hidden border border-gray-600 relative">
                <Image
                  src={profileImg}
                  alt="User Profile"
                  // layout="fill"
                  // objectFit="cover"
                  // className="rounded-full"
                  fill
                  className="object-contain rounded-full"
                />
              </div>
            ) : (
              <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-500 flex items-center justify-center text-lg font-bold text-white">
                {initials}
              </div>
            )}
            {isOpen && (
              <div>
                <p className="text-sm font-medium">Hi, {userData.user_name}</p>
                <p className="text-xs text-gray-400">
                  {firstRole}
                  {truncatedRoles && (
                    <span
                      className="text-gray-500 text-xs ml-2"
                      title={truncatedRoles}
                    >
                      ... (hover to see full roles)
                    </span>
                  )}
                </p>
              </div>
            )}
          </div>
        )}
        {isOpen && (
          <button onClick={handleSignOut} className="text-sm text-gray-400">
            Sign Out
          </button>
        )}
      </div>
    </div>
  );
};

export default SideNavbar;
