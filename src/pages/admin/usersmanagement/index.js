import EmployeeForm from "@/globalcomponents/rbiTracker/EmployeeForm";
import UserForm from "@/globalcomponents/users-management/UserForm";
import UserManagementDasboard from "@/globalcomponents/users-management/UserManagementDasboard";
import { useRouter } from "next/router";
import { useState } from "react";
import {
  FaBuilding,
  FaCheckSquare,
  FaCloudUploadAlt,
  FaInfoCircle,
  FaSitemap,
  FaTachometerAlt,
  FaUserTie,
} from "react-icons/fa";

const Home = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("Dashboard");

  const handleTabChange = (tabKey) => {
    router.push({
      query: {
        ...router.query,
        tab: encodeURIComponent(tabKey),
      },
    });
    setActiveTab(tabKey);
  };

  const tabs = [
    {
      id: "Dashboard",
      label: "Dashboard",
      icon: <FaTachometerAlt className="w-5 h-5" />, // Dashboard icon
      component: <UserManagementDasboard isActive={activeTab === "Dashboard"} />,
    },
    // {
    //   id: "Add Department Details",
    //   label: "Add Department Details",
    //   icon: <FaSitemap className="w-5 h-5" />, // Sitemap icon for departments
    //   // component: (
    //   //   <BankDetails
    //   //     isActive={activeTab === "Add Department Details"}
    //   //     branchShow={false}
    //   //   />
    //   // ),
    // },
    {
      id: "Add Employee Details",
      label: "Add Employee Details",
      icon: <FaUserTie className="w-5 h-5" />, // User tie icon for employees
      component: (
        <UserForm isActive={activeTab === "Add Employee Details"} />
      ),
    },
  ];

  return (
    <div className="w-full min-h-screen bg-[#f1f5f9]">
      <div className="mx-auto p-6">
        <div className="bg-[#f1f5f9] rounded-lg shadow-sm overflow-hidden">
          <div className="border-b border-gray-200">
            <div className="flex">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={`relative flex items-center justify-center gap-2 px-6 py-4 text-sm font-medium
                      transition-all duration-200 border-r border-gray-200
                      ${
                        activeTab === tab.id
                          ? "text-[#2B245C] bg-white border-b-2 border-[#2B245C]"
                          : "text-gray-600 hover:text-blue-600"
                      }
                    `}
                >
                  {tab.icon}
                  {tab.label}
                  {activeTab === tab.id && (
                    <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#2B245C] transform transition-transform duration-200" />
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-2">
            {tabs.map((tab) => (
              <div key={tab.id}>{tab.id == activeTab && tab.component}</div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;