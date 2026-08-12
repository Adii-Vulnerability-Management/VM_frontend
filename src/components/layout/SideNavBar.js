import { use, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import Image from "next/image";
import { v4 as uuid } from "uuid";
import Cookies from "js-cookie";
import { baseurl, initURL } from "../../../BaseUrl";
import CustomAxios from "@/globalcomponents/CustomAxios";
import { FiChevronDown, FiChevronRight } from "react-icons/fi";
import { FiMenu, FiCompass, FiList, FiHeart } from "react-icons/fi";
import {
  FiShield,
  FiGrid,
  FiLayers,
  FiSettings,
  FiTool,
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
  FiClipboard,
} from "react-icons/fi";

import { AiOutlineAudit } from "react-icons/ai";
import { useSidebar } from "@/context/SidebarContext";
import { toast } from "react-toastify";

export const ClientDashboardMenu = [
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
        link: "/contact",
        name: "Controls",
        icon: "FiSettings",
      },
      {
        id: uuid(),
        link: "/compliance/assignments",
        name: "Evidence Task",
        icon: "FiGrid",
      },

      // {
      //   id: uuid(),
      //   // link: "/contact",
      //   name: "Evidence Collection Task",
      //   icon: "FiClipboard",
      //   children: [
      //     {
      //       id: uuid(),
      //       link: "/contact",
      //       name: "Test of Design",
      //       icon: "FiCheckCircle",
      //     },
      //     {
      //       id: uuid(),
      //       link: "/contact",
      //       name: "Test of Effectiveness",
      //       icon: "FiShield",
      //     },

      //   ],
      // },
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
        name: "Dashboard",
        icon: "FiUser",
      },
      {
        id: uuid(),
        link: "/operations/evidence-collection",
        name: "Evidence Collection",
        icon: "FiClipboard",
      },
      // {
      //   id: uuid(),
      //   link: "/operations/employee-dashboard",
      //   name: "Employee dashboard",
      //   icon: "FiUser",
      // },
      {
        id: uuid(),
        link: "/operations/people-dashboard",
        name: "People",
        icon: "FiUser",
      },
      {
        id: uuid(),
        link: "/operations/policy",
        name: "Policy",
        icon: "FiFileText",
      },
      // {
      //   id: uuid(),
      //   link: "/operations/approver-dashboard",
      //   name: "Approver Policy Dashboard",
      //   icon: "FiFileText",
      // },
      // {
      //   id: uuid(),
      //   link: "/operations/policy/reviewer-dashboard",
      //   name: "Reviewer Policy Dashboard",
      //   icon: "FiFileText",
      // },
      // {
      //   id: uuid(),
      //   link: "/operations/procedure/approver-dashboard",
      //   name: "Approver Procedure Dashboard",
      //   icon: "FiFileText",
      // },
      // {
      //   id: uuid(),
      //   link: "/operations/procedure/reviewer-dashboard",
      //   name: "Reviewer Procedure Dashboard",
      //   icon: "FiFileText",
      // },
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
        link: "/contact",
        name: "Change Management",
        icon: "FiRefreshCw",
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
            name: "NIS2 Self Assesment",
            link: "/NIS2-self-assesment",
            icon: "FiClipboardCheck",
          },
        ],
      },
      {
        id: uuid(),
        link: "/operations/breachmanagement",
        name: "Breach Management",
        icon: "FiCalendar",
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
        icon: "FiFileText",
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
            icon: "FiFileText",
          },
          {
            id: uuid(),
            link: "/vulnerability-management/evidence",
            name: "Evidence",
            icon: "FiFile",
          },
        ],
      },
      {
        id: uuid(),
        name: "Patch Management",
        icon: "FiRefreshCw",
        children: [
          {
            id: uuid(),
            link: "/patch-management/dashboard",
            name: "Dashboard",
            icon: "FiGrid",
          },
          {
            id: uuid(),
            link: "/patch-management/backlog",
            name: "Backlog",
            icon: "FiList",
          },
          {
            id: uuid(),
            link: "/patch-management/patch-plans",
            name: "Patch Plans",
            icon: "FiTool",
          },
          {
            id: uuid(),
            link: "/patch-management/policies",
            name: "Policies",
            icon: "FiSettings",
          },
        ],
      },
      {
        id: uuid(),
        link: "/risk-management/risk-assessment/strategic",
        name: "Strategic",
        icon: "FiTrendingUp",
      },
      {
        id: uuid(),
        link: "/risk-management/risk-assessment/legal",
        name: "Legal",
        icon: "FiBook",
      },
      {
        id: uuid(),
        link: "/risk-management/risk-assessment/financial",
        name: "Financial",
        icon: "FiDollarSign",
      },
      {
        id: uuid(),
        link: "/risk-management/risk-assessment/operation",
        name: "Operation",
        icon: "FiBriefcase",
      },
      {
        id: uuid(),
        link: "/risk-management/risk-assessment/personal",
        name: "Personal",
        icon: "FiUser",
      },
      {
        id: uuid(),
        link: "/risk-management/risk-assessment/geopolitical",
        name: "Geopolitical",
        icon: "FiGlobe",
      },
      {
        id: uuid(),
        link: "/risk-management/risk-assessment/environmental",
        name: "Environmental",
        icon: "FiSun",
      },
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

  {
    id: uuid(),
    title: "Vendor Trust",
    icon: "FiUsers",
    children: [
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
    ],
  },
  {
    id: uuid(),
    title: "Customer Trust",
    icon: "FiUserCheck",
    children: [
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
  {
    id: uuid(),
    title: "Third Party Risk Management",
    icon: "FiLayers",
    link: "/third-party-risk-management",
  },
  {
    id: uuid(),
    title: "TPRM dev",
    icon: "FiLayers",
    children: [
      {
        id: uuid(),
        link: "/third-party-risk-management",
        name: "TPRM Workflow",
        icon: "FiGrid",
      },
      {
        id: uuid(),
        link: "/third-party-risk-management/committee-members",
        name: "Committee Members",
        icon: "FiUsers",
      },
      {
        id: uuid(),
        link: "/third-parties-risk-management/TPRMDetails",
        name: "Third Party Details",
        icon: "FiUsers",
      },
      {
        id: uuid(),
        link: "/third-parties-risk-management/TPRMQuestionnaire",
        name: "Third Party Questionnaire",
        icon: "FiCpu",
      },
      {
        id: uuid(),
        link: "/third-parties-risk-management/ThirdPartyLogin",
        name: "Third Party Login",
        icon: "FiShield",
      },
      {
        id: uuid(),
        link: "/third-parties-risk-management/contracts",
        name: "Contracts",
        icon: "FiFileText",
      },
      {
        id: uuid(),
        link: "/third-party-risk-management/findings",
        name: "Findings",
        icon: "FiSearch",
      },
      {
        id: uuid(),
        link: "/third-party-risk-management/issues",
        name: "Issues",
        icon: "FiAlertTriangle",
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
        link: "/privacy/dashboard",
        name: "Dashboard",
        icon: "FiFileText",
      },
      {
        id: uuid(),
        link: "/privacy/PrivacyPolicyData",
        name: "Privacy Policy",
        icon: "FiFileText",
      },
      {
        id: uuid(),
        link: "/privacy/right_management/CookiesDetail",
        name: "Cookies Policy",
        icon: "FiCoffee",
      },
      {
        id: uuid(),
        link: "/privacy/ConsentBanner",
        name: "Consent Banner",
        icon: "FiFlag",
      },
      {
        id: uuid(),
        link: "/privacy/consentTracking",
        name: "Consent Tracking",
        icon: "FiShield",
      },
      {
        id: uuid(),
        link: "/privacy/right_management/RequestQueue",
        name: "Right Management",
        icon: "FiShield",
      },
      {
        id: uuid(),
        link: "/privacy/Scanner",
        name: "Scanner",
        icon: "FiSearch",
      },
      {
        id: uuid(),
        link: "/privacy/Install",
        name: "Install",
        icon: "FiDownload",
      },
      {
        id: uuid(),
        link: "/privacy/framework",
        name: "Frameworks",
        icon: "FiLayers",
      },

      {
        id: uuid(),
        link: "/privacy/dpia",
        name: "DPIA",
        icon: "FiDownload",
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
    link: "/contact",
    title: "Industry",
    icon: "FiDollarSign",
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
              // {
              //   id: uuid(),
              //   link: "/industry/automobile/tisax?vda_version=5.1",
              //   name: "5.1",
              //   icon: "FiLayers",
              // },
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
              // {
              //   id: uuid(),
              //   link: "/industry/automobile/tisax-audit?vda_version=5.1",
              //   name: "5.1",
              //   icon: "FiLayers",
              // },
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
            icon: "FiShield",
            link: "/industry/automobile/tisax/assigncontrols",
          },
          {
            id: uuid(),
            name: "Assign Team",
            icon: "FiShield",
            link: "/industry/automobile/tisax/assignteam",
          },
          // {
          //   id: uuid(),
          //   name: "Assigned TISAX",
          //   icon: "FiShield",
          //   link: "/tisax",
          //   children: [
          //     {
          //       id: uuid(),
          //       link: "/tisax-user-assign",
          //       name: "6.0.3",
          //       icon: "FiLayers",
          //     },
          //   ],
          // },
          // {
          //   id: uuid(),
          //   name: "Assigned TISAX Audit",
          //   icon: "FiShield",
          //   link: "/tisax",
          //   children: [
          //     {
          //       id: uuid(),
          //       link: "/tisax-assigner-audit",
          //       name: "6.0.3",
          //       icon: "FiLayers",
          //     },
          //   ],
          // }
        ],
      },
      {
        id: uuid(),
        name: "Banking and Finance",
        icon: "FiDollarSign",
        children: [
          {
            id: uuid(),
            link: "/industry/banking-and-finance/Cra",
            name: "CRA",
            icon: "FiFileText",
          },
          {
            id: uuid(),
            link: "/industry/banking-and-finance/rbi",
            name: "RBI",
            icon: "FiFileText",
          },
          {
            id: uuid(),
            link: "/industry/banking-and-finance/RbiTracker",
            name: "RBI Tracker",
            icon: "FiFileText",
          },
          {
            id: uuid(),
            link: "/industry/banking-and-finance/RbiTrackerUser",
            name: "RBI Tracker User Portal",
            icon: "FiFileText",
          },
        ],
      },
      {
        id: uuid(),
        link: "/contact",
        name: "Healthcare",
        icon: "FiHeart",
      },
    ],
  },

  {
    id: uuid(),
    title: "Malware/Ransomware",
    icon: "FiAlertOctagon",
    children: [],
  },
  {
    id: uuid(),
    title: "Assessment",
    icon: "FiClipboard",
    children: [],
  },
  {
    id: uuid(),
    title: "Audit",
    icon: "FiTool",
    children: [
      {
        id: uuid(),
        link: "/audit/internal-audit",
        name: "Internal Audit",
        icon: "MdSecurity",
      },
    ],
  },
  {
    id: uuid(),
    link: "/contact",
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
            link: "/governance/access-management",
            name: "Access Management",
            icon: "FiUsers",
            children: [
              {
                id: uuid(),
                link: "/management-hub/governance-hub/access-management/role-management",
                name: "Role Management",
                icon: "FiUser",
              },

              {
                id: uuid(),
                link: "/management-hub/governance-hub/access-management/user-management",
                name: "User Creation",
                icon: "FiUsers",
              },
              {
                id: uuid(),
                link: "/admin/roleassignment",
                name: "Assign Roles ",
                icon: "FiUserCheck",
              },
            ],
          },
          {
            id: uuid(),
            link: "/governance/team-management",
            name: "Team Management",
            icon: "FiBriefcase",
          },
          {
            id: uuid(),
            link: "/management-hub/governance-hub/access-management/department-management",
            name: "Department Management",
            icon: "FiBriefcase",
          },
          {
            id: uuid(),
            link: "/governance/license-management",
            name: "License Management",
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
        icon: "FiTool",
        children: [
          {
            id: uuid(),
            link: "/management-hub/task-management-hub/create-task",
            name: "Create Task ",
            icon: "FiRefreshCw",
          },
          {
            id: uuid(),
            link: "/management-hub/task-management-hub/task-summary",
            name: "Task Summary",
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
            link: "/integration/management",
            name: "Integration Management",
            icon: "FiRefreshCw",
          },
          {
            id: uuid(),
            link: "/management-hub/asset/management",
            name: "Asset Management",
            icon: "FiRefreshCw",
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
        icon: "FiUserCheck",
      },
      {
        id: uuid(),
        link: "/user/portal",
        name: "User Portal",
        icon: "FiUserCheck",
      },
    ],
  },

  {
    id: uuid(),
    title: "Contact Us",
    icon: "FiMail",
    link: "/contact",
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
  FiCoffee: <FiCoffee />,
  FiFlag: <FiFlag />,
  FiAlertOctagon: <FiAlertOctagon />,
  FiMail: <FiMail />,
  FiSettings: <FiSettings />,
  FiTool: <FiTool />,
  FiSearch: <FiSearch />,
  AiOutlineAudit: <AiOutlineAudit />,
};

//

const SideNavbar = () => {
  const { isOpen, toggle } = useSidebar();
  const router = useRouter();
  const [userData, setUserData] = useState(null);
  const [expandedMenu, setExpandedMenu] = useState(null);
  const [nestedExpandedMenu, setNestedExpandedMenu] = useState(null);
  const [thirdlevelexpand, setthirdlevelexpand] = useState(null);
  const stored = Cookies.get("user_data");
  const usersData = stored ? JSON.parse(stored) : {};
  const isAdmin = usersData.user_designation === "Admin";
  const role = usersData.user_designation;
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

  const currentMenu = ClientDashboardMenu; // Assume ClientDashboardMenu is imported
  const initials = userData?.user_designation?.charAt(0)?.toUpperCase() || "?";

  return (
    <div
      className={`
        bg-[#050038] text-white h-screen flex flex-col font-semibold
        transition-all duration-300
        ${isOpen ? "w-64" : "w-16"}
      `}
    >
      {/* Sidebar Header */}
      <div className="flex items-center justify-between h-20 px-4 border-b border-gray-700">
        {isOpen && (
          // <div className="flex items-center justify-center h-20 px-4 border-b border-gray-700">
          //   <Image
          //     src="/images/GRC3BGNoBG.png"
          //     alt="GRC³ Logo"
          //     width={100}
          //     height={30}
          //     priority
          //     className="object-contain"
          //   />
          // </div>
          <div className="flex items-center justify-center h-10 px-4 ">
            <img
              src="/images/GRC3BGNoBG.png"
              alt="GRC³ Logo"
              className="h-10 object-contain"
            />
          </div>
        )}{" "}
        <button onClick={toggle} className="text-white cursor-pointer">
          <FiMenu size={24} />
        </button>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-grow overflow-y-auto px-4 py-6 space-y-2">
        {/* Menu Item */}
        <div className="flex items-center justify-between p-2 hover:bg-[#1E335A] rounded-md cursor-pointer"></div>
        {currentMenu.map((menu) => (
          <div key={menu.id}>
            {["Management Hub"].includes(menu.title) && (
              <div className="border-t border-gray-700 my-4"></div>
            )}
            <div
              onClick={() => {
                toggleMenu(menu.id);
                menu.title == "Contact Us" && router.push(menu.link);
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
                                    href={nestedChild.link}
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
                                                  href={innerChild.link}
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
                                  // div end here
                                );
                              })}
                            </div>
                          )}
                        </>
                      ) : (
                        <Link href={child.link} passHref>
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
                  fill
                  sizes="40px"
                  className="rounded-full object-cover"
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
                  {userData.user_designation}
                </p>
              </div>
            )}
          </div>
        )}
        {isOpen && (
          <button
            onClick={handleSignOut}
            className="text-sm cursor-pointer border-2 text-white"
          >
            Sign Out
          </button>
        )}
      </div>
    </div>
  );
};

export default SideNavbar;
