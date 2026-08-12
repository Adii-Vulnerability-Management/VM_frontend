import { useState, useEffect } from "react";
import { FaTachometerAlt, FaUserTie } from "react-icons/fa"; // Font Awesome
import { FiList, FiSettings } from "react-icons/fi"; // Feather Icons
import { useRouter } from "next/router";
import Dashboard from "@/globalcomponents/assign-roles/dashboard";
import EmployeeOnboarding from "@/globalcomponents/assign-roles/employee-onboarding";
import AssignRolesModule from "@/globalcomponents/assign-roles/assign-list";
import Assign from "@/globalcomponents/assign-roles/assign";
import GuideButton from "@/components/Tour/GuideButton";
import Tour from "@/components/Tour/Tour";

const AssignRoles = () => {
  const router = useRouter();
  // const [activeTab, setActiveTab] = useState("Dashboard");

  const { tab } = router.query;

  const [activeTab, setActiveTab] = useState(
    tab ? decodeURIComponent(tab) : "Dashboard",
  );

  const [tourOpen, setTourOpen] = useState(false);

  // keep tab in sync with URL
  useEffect(() => {
    if (tab) setActiveTab(decodeURIComponent(tab));
  }, [tab]);

  const handleTabChange = async (tabKey) => {
    if (activeTab === tabKey) return; // prevent repeat pushes

    router.push({
      query: {
        ...router.query,
        tab: encodeURIComponent(tabKey),
      },
    });
    setActiveTab(tabKey);

    // allow React to mount the new tab content before next tour step
    await new Promise((r) => requestAnimationFrame(r));
  };

  // Tour steps
  const steps = [
    {
      target: '[data-tour="ar-header"]',
      title: "Assign Roles",
      content:
        "Use this section to manage role access for users, schedule temporary access, and review the assignment log.",
      placement: "bottom",
    },
    {
      target: '[data-tour="ar-tabs"]',
      title: "Tabs Navigation",
      content:
        "Switch between Assigned Users Dashboard, Assign Roles to Users, and Log.",
      placement: "bottom",
    },

    // Dashboard
    {
      target: '[data-tour="ar-dashboard"]',
      title: "Dashboard",
      content:
        "Shows assigned users with their latest access window details (roles, modules, permissions, start/end dates, and status). Click any row to open the full details modal.",
      placement: "bottom",
      beforeStep: async () => {
        await handleTabChange("Dashboard");
      },
    },

    // Employee Onboarding
    // {
    //   target: '[data-tour="ar-onboarding"]',
    //   title: "Employee Onboarding",
    //   content: "Create new employee profiles and capture required details.",
    //   placement: "bottom",
    //   beforeStep: async () => {
    //     await handleTabChange("Employee Onboarding");
    //   },
    // },

    // Assign Roles
    {
      target: '[data-tour="ar-assignlist"]',
      title: "Assign Roles",
      content:
        "Select a user and assign one or more roles. You can optionally enable 'Send Email Notification' to notify the user and add a note.",
      placement: "bottom",
      beforeStep: async () => {
        await handleTabChange("Assign Roles");
      },
    },
    {
      target: '[data-tour="ar-assignlist"]',
      title: "Temporary Access",
      content:
        "Set Start Date and End Date to grant temporary access. If no dates are set, access is permanent.",
      placement: "bottom",
    },
    {
      target: '[data-tour="ar-assignlist"]',
      title: "Additional Actions",
      content:
        "You can also remove roles, revoke all access for a user, or view their access summary.",
      placement: "bottom",
    },

    // Log
    {
      target: '[data-tour="ar-log"]',
      title: "Access Logs",
      content:
        "View all user activity including role assignments, access changes, logins, and email notifications.",
      placement: "bottom",
      beforeStep: async () => {
        await handleTabChange("Assign");
      },
    },
    {
      target: '[data-tour="ar-log"]',
      title: "Filters & Search",
      content:
        "Filter logs by email, user ID, action type, or date range to quickly find specific records.",
      placement: "bottom",
    },
    {
      target: '[data-tour="ar-log"]',
      title: "Bulk Actions",
      content:
        "Select multiple rows to revoke access, view access summary, or delete logs in bulk.",
      placement: "bottom",
    },
    {
      target: '[data-tour="ar-log"]',
      title: "Export",
      content:
        "Download logs as a CSV file for reporting and auditing purposes.",
      placement: "bottom",
    },
  ];

  const tabs = [
    {
      id: "Dashboard",
      label: "Dashboard",
      icon: <FaTachometerAlt className="w-5 h-5" />, // Dashboard icon
      component: (
        <div data-tour="ar-dashboard">
          <Dashboard isActive={activeTab === "Dashboard"} />
        </div>
      ),
    },

    /////// Commented because we don't have the use of this page yet.

    // {
    //   id: "Employee Onboarding",
    //   label: "Employee Onboarding",
    //   icon: <FaUserTie className="w-5 h-5" />, // User tie icon for employees
    //   component: (
    //     <div data-tour="ar-onboarding">
    //       <EmployeeOnboarding />
    //     </div>
    //   ),
    // },

    {
      id: "Assign Roles",
      label: "Assign Roles",
      icon: <FiList className="w-5 h-5" />, // User tie icon for employees
      component: (
        <div data-tour="ar-assignlist">
          <AssignRolesModule />
        </div>
      ),
    },
    {
      id: "Assign",
      label: "Log",
      icon: <FiSettings className="w-5 h-5" />, // User tie icon for employees
      component: (
        <div data-tour="ar-log">
          <Assign />
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="bg-white min-h-screen rounded-lg p-5 my-3 mx-5">
        <div
          className="px-6 py-8 bg-[#2B245C] rounded-2xl shadow-lg hover:shadow-2xl transition-shadow duration-300 flex items-center justify-between"
          data-tour="ar-header"
        >
          <div>
            <h1 className="text-3xl font-bold text-cyan-50">Assign Roles</h1>
            <p className="mt-1 text-sm text-white">
              Select the user, choose the right role, and confirm access.
            </p>
          </div>
          <GuideButton
            onClick={() => setTourOpen(true)}
            variant="primary"
            size="md"
            className="!from-blue-500 !to-blue-600 hover:!from-blue-400 hover:!to-blue-500 !text-white !border-blue-400/70 !shadow-blue-600/30"
          >
            Help
          </GuideButton>
        </div>

        <div className="py-5 space-y-5 min-h-screen">
          <div className="rounded-lg shadow-sm overflow-hidden min-h-screen">
            <div
              className="border-b border-gray-200 bg-[#f1f5f9]"
              data-tour="ar-tabs"
            >
              <div className="flex">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => handleTabChange(tab.id)}
                    className={`relative flex items-center justify-center gap-2 px-6 py-4 text-sm font-medium
                      transition-all duration-200 border-r border-gray-200
                      ${activeTab === tab.id
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

      <Tour steps={steps} open={tourOpen} onClose={() => setTourOpen(false)} />
    </div>
  );
};

export default AssignRoles;

// import { useState, useEffect, useRef } from "react";
// import CustomAxios from "@/globalcomponents/CustomAxios";
// import { toast } from "react-toastify";
// import { baseurl, initURL } from "../../../../BaseUrl";
// // Example modules (sidebar). You can adapt to your actual data structure:
// import { ClientDashboardMenu } from "@/routes/DashboardRoutes";
// import { FaEyeSlash, FaEye } from "react-icons/fa";

// const AdminPortal = () => {
//   const [roles, setRoles] = useState([]);
//   const [users, setUsers] = useState([]);
//   const [firstName, setFirstName] = useState("");
//   const [lastName, setLastName] = useState("");
//   const [employeeId, setEmployeeId] = useState("");
//   const [userEmail, setUserEmail] = useState("");
//   const [contactNumber, setContactNumber] = useState("");
//   const [companyName, setCompanyName] = useState("");
//   const [companyAddress, setCompanyAddress] = useState("");
//   const [address, setAddress] = useState("");
//   const [password, setPassword] = useState("");
//   const [confirmPassword, setConfirmPassword] = useState("");
//   const [passwordVisible, setPasswordVisible] = useState(false);
//   const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
//   const [searchQuery, setSearchQuery] = useState("");
//   const [showModuleOptions, setShowModuleOptions] = useState(false);
//   const [selectedModuleId, setSelectedModuleId] = useState("");
//   const [selectedRoleId, setSelectedRoleId] = useState("");
//   const searchContainerRef = useRef(null);
//   const [moduleRoleAssignments, setModuleRoleAssignments] = useState({});
//   const loadRoles = async () => {
//     try {
//       const response = await CustomAxios.get(`${baseurl}/${initURL}/roles`);
//       setRoles(response.data);
//     } catch (error) {
//       toast.error("Error loading roles");
//     }
//   };

//   useEffect(() => {
//     loadRoles();
//   }, []);

//   useEffect(() => {
//     fetchUsers();
//   }, []);
//   useEffect(() => {
//     function handleClickOutside(event) {
//       if (
//         searchContainerRef.current &&
//         !searchContainerRef.current.contains(event.target)
//       ) {
//         setShowModuleOptions(false);
//       }
//     }
//     document.addEventListener("mousedown", handleClickOutside);
//     return () => {
//       document.removeEventListener("mousedown", handleClickOutside);
//     };
//   }, [searchContainerRef]);

//   const fetchUsers = async () => {
//     try {
//       const response = await axios.get("/api/users");
//       setUsers(response.data);
//     } catch (error) {
//       console.error("Error fetching users", error);
//     }
//   };

//   // ----------------------------
//   // 1) ROLE CREATION
//   // ----------------------------
//   // A simple recursive search in your ClientDashboardMenu
//   function findModuleById(menuList, id) {
//     for (const item of menuList) {
//       if (item.id === id) return item;
//       if (item.children && item.children.length > 0) {
//         const found = findModuleById(item.children, id);
//         if (found) return found;
//       }
//     }
//     return null;
//   }

//   // NEW: Flatten the nested modules into a single array
//   function flattenModules(menuList) {
//     let result = [];
//     for (const item of menuList) {
//       result.push(item);
//       if (item.children && item.children.length > 0) {
//         result = result.concat(flattenModules(item.children));
//       }
//     }
//     return result;
//   }

//   // A simple recursive search in your ClientDashboardMenu
//   function findModuleById(menuList, id) {
//     for (const item of menuList) {
//       if (item.id === id) return item;
//       if (item.children && item.children.length > 0) {
//         const found = findModuleById(item.children, id);
//         if (found) return found;
//       }
//     }
//     return null;
//   }
//   const assignModuleRole = () => {
//     if (!selectedModuleId || !selectedRoleId) {
//       toast.error("Please select both a module and a role");
//       return;
//     }
//     setModuleRoleAssignments((prev) => ({
//       ...prev,
//       [selectedModuleId]: selectedRoleId,
//     }));
//     toast.success("Role assigned to module successfully");
//     // Clear selections (optional)
//     setSelectedModuleId("");
//     setSelectedRoleId("");
//     setSearchQuery("");
//   };

//   // NEW: Remove an assignment
//   const removeAssignment = (modId) => {
//     setModuleRoleAssignments((prev) => {
//       const updated = { ...prev };
//       delete updated[modId];
//       return updated;
//     });
//     toast.success("Assignment removed");
//   };
//   // ----------------------------
//   // 2) USER CREATION
//   // ----------------------------
//   const handleCreateUser = async () => {
//     // Validate basic fields
//     if (
//       !firstName ||
//       !lastName ||
//       !employeeId ||
//       !userEmail ||
//       !password ||
//       !companyName ||
//       !contactNumber ||
//       !companyAddress ||
//       !address
//     ) {
//       toast.error("Please fill all required fields");
//       return;
//     }
//     if (password !== confirmPassword) {
//       toast.error("Passwords do not match");
//       return;
//     }
//     const passwordRegex =
//       /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{12,20}$/;
//     if (!passwordRegex.test(password)) {
//       toast.error(
//         "Password must be 12-20 characters and include at least one uppercase letter, one lowercase letter, one digit, and one special character"
//       );
//       return;
//     }
//     // Build array of { moduleId, roleId }
//     const userModuleRoles = Object.entries(moduleRoleAssignments).map(
//       ([moduleId, roleId]) => {
//         // Find the actual module object (by UUID) in your ClientDashboardMenu
//         const moduleObj = findModuleById(ClientDashboardMenu, moduleId);

//         // Find the actual role object (by UUID) in your roles array
//         const roleObj = roles.find((r) => r.id === roleId);

//         return {
//           // Instead of storing moduleId, store the module's name or title
//           moduleName: moduleObj
//             ? moduleObj.title || moduleObj.name
//             : "Unknown Module",

//           // Instead of storing roleId, store the role's name
//           roleName: roleObj ? roleObj.name : "Unknown Role",
//         };
//       }
//     );
//     const userData = {
//       user_name: `${firstName} ${lastName}`,
//       first_name: firstName,
//       last_name: lastName,
//       email: userEmail,
//       employeeId: employeeId,
//       contact_number: contactNumber,
//       company_name: companyName,
//       company_address: companyAddress,
//       address: address,
//       password: password,
//       date_joined: new Date().toISOString(),
//       profile_img_path: `profile_img/${userEmail}/default.png`,

//       // Assign the module-roles to the user
//       moduleRoles: userModuleRoles,
//     };
//     console.log(userData);
//     try {
//       await axios.post("/api/users", userData);
//       toast.success("Employee Created Successfully");

//       // Optionally, update local user list
//       setUsers([...users, userData]);

//       // Reset fields
//       setFirstName("");
//       setLastName("");
//       setEmployeeId("");
//       setUserEmail("");
//       setContactNumber("");
//       setCompanyName("");
//       setCompanyAddress("");
//       setAddress("");
//       setPassword("");
//       setConfirmPassword("");
//       setModuleRoleAssignments({});
//     } catch (error) {
//       console.error("Error creating user", error);
//       toast.error("Failed to create employee");
//     }
//   };

//   const renderModuleRoleAssignments = (menuList, level = 0) => {
//     return menuList.map((menu) => (
//       <div key={menu.id} style={{ marginLeft: level * 20 }} className="mb-2">
//         <span className="mr-2 font-medium">{menu.title || menu.name}</span>
//         <select
//           className="border p-1 rounded"
//           value={moduleRoleAssignments[menu.id] || ""}
//           onChange={(e) => {
//             setModuleRoleAssignments((prev) => ({
//               ...prev,
//               [menu.id]: e.target.value,
//             }));
//           }}
//         >
//           <option value="">-- Select Role --</option>
//           {roles.map((r) => (
//             <option key={r.id} value={r.id}>
//               {r.name}
//             </option>
//           ))}
//         </select>

//         {/* If there are children, recurse */}
//         {menu.children && menu.children.length > 0 && (
//           <div className="mt-2 ml-4 border-l-2 pl-2">
//             {renderModuleRoleAssignments(menu.children, level + 1)}
//           </div>
//         )}
//       </div>
//     ));
//   };

//   return (
//     <div className="p-6 bg-white shadow-lg rounded-lg w-full mx-auto space-y-8">
//       <h2 className="text-xl font-semibold mb-4 text-center text-gray-800">
//         Admin Panel - RBAC Management
//       </h2>
//       <div className="p-4 border rounded-lg">
//         <h3 className="text-lg font-semibold mb-3">Employee Onboarding</h3>
//         <div className="grid grid-cols-2 gap-4 mb-4">
//           <input
//             type="text"
//             placeholder="First Name"
//             value={firstName}
//             onChange={(e) => setFirstName(e.target.value)}
//             className="w-full p-3 border rounded focus:outline-blue-500"
//           />
//           <input
//             type="text"
//             placeholder="Last Name"
//             value={lastName}
//             onChange={(e) => setLastName(e.target.value)}
//             className="w-full p-3 border rounded focus:outline-blue-500"
//           />
//           <input
//             type="text"
//             placeholder="Employee ID"
//             value={employeeId}
//             onChange={(e) => setEmployeeId(e.target.value)}
//             className="w-full p-3 border rounded focus:outline-blue-500"
//           />
//           <input
//             type="email"
//             placeholder="Email"
//             value={userEmail}
//             onChange={(e) => setUserEmail(e.target.value)}
//             className="w-full p-3 border rounded focus:outline-blue-500"
//           />
//           <input
//             type="text"
//             placeholder="Contact Number"
//             value={contactNumber}
//             onChange={(e) => setContactNumber(e.target.value)}
//             className="w-full p-3 border rounded focus:outline-blue-500"
//           />
//           <input
//             type="text"
//             placeholder="Company Name"
//             value={companyName}
//             onChange={(e) => setCompanyName(e.target.value)}
//             className="w-full p-3 border rounded focus:outline-blue-500"
//           />
//           <input
//             type="text"
//             placeholder="Company Address"
//             value={companyAddress}
//             onChange={(e) => setCompanyAddress(e.target.value)}
//             className="w-full p-3 border rounded focus:outline-blue-500"
//           />
//           <input
//             type="text"
//             placeholder="Address"
//             value={address}
//             onChange={(e) => setAddress(e.target.value)}
//             className="w-full p-3 border rounded focus:outline-blue-500"
//           />
//           {/* Password Field with Eye Toggle */}
//           <div className="relative">
//             <input
//               type={passwordVisible ? "text" : "password"}
//               placeholder="Password"
//               value={password}
//               onChange={(e) => setPassword(e.target.value)}
//               className="w-full p-3 border rounded focus:outline-blue-500"
//             />
//             <button
//               type="button"
//               onClick={() => setPasswordVisible(!passwordVisible)}
//               className="absolute inset-y-0 right-0 pr-3 flex items-center"
//             >
//               {passwordVisible ? (
//                 // Eye Off Icon
//                 <FaEyeSlash />
//               ) : (
//                 // Eye Icon
//                 <FaEye />
//               )}
//             </button>
//           </div>

//           {/* Confirm Password Field with Eye Toggle */}
//           <div className="relative ">
//             <input
//               type={confirmPasswordVisible ? "text" : "password"}
//               placeholder="Confirm Password"
//               value={confirmPassword}
//               onChange={(e) => setConfirmPassword(e.target.value)}
//               className={`w-full p-3 border rounded ${
//                 confirmPassword && password !== confirmPassword
//                   ? "border-red-500"
//                   : "focus:outline-blue-500"
//               }`}
//             />
//             <button
//               type="button"
//               onClick={() => setConfirmPasswordVisible(!confirmPasswordVisible)}
//               className="absolute inset-y-0 right-0 pr-3 flex items-center"
//             >
//               {confirmPasswordVisible ? (
//                 // Eye Off Icon
//                 <FaEyeSlash />
//               ) : (
//                 // Eye Icon
//                 <FaEye />
//               )}
//             </button>
//           </div>
//         </div>

//         {/* Assign Roles per Module */}
//         <div className="bg-white shadow-md rounded-lg p-6 border border-gray-200">
//           <div className="flex items-center justify-between mb-4">
//             <h4 className="text-lg font-bold text-gray-800">
//               Assign Roles per Module
//             </h4>
//             <span className="text-sm text-gray-500">Module Permissions</span>
//           </div>
//           {/* Temporary Access */}
//           <h3 className="text-lg font-semibold text-gray-700 mb-2">
//             Temporary Access (Optional)
//           </h3>
//           <div className="grid grid-cols-2 gap-4 mb-4">
//             <div>
//               <label className="block font-medium text-gray-600 mb-2">
//                 Start Date
//               </label>
//               <input
//                 type="date"
//                 className="w-full border border-gray-300 rounded p-2"
//               />
//             </div>
//             <div>
//               <label className="block font-medium text-gray-600 mb-2">
//                 End Date
//               </label>
//               <input
//                 type="date"
//                 className="w-full border border-gray-300 rounded p-2"
//               />
//             </div>
//           </div>

//           {roles.length === 0 ? (
//             <div className="flex items-center space-x-2 bg-red-50 border border-red-200 text-red-600 p-3 rounded">
//               <p className="text-sm">
//                 No roles available. Please create roles first.
//               </p>
//             </div>
//           ) : (
//             <div>
//               {/* Combined Search + Module Field, plus Role Dropdown and Assign Button */}
//               <div className="flex flex-col md:flex-row md:items-center md:space-x-4 space-y-4 md:space-y-0">
//                 {/* 1) Searchable Module Field */}
//                 <div
//                   className="relative w-full md:w-1/3"
//                   ref={searchContainerRef}
//                 >
//                   <input
//                     type="text"
//                     placeholder="Search or select module..."
//                     value={searchQuery}
//                     onChange={(e) => {
//                       setSearchQuery(e.target.value);
//                       setShowModuleOptions(true); // Show suggestions while typing
//                     }}
//                     onFocus={() => setShowModuleOptions(true)} // Show on focus
//                     className="border p-2 rounded w-full"
//                   />

//                   {/* Suggestions Dropdown */}
//                   {showModuleOptions && (
//                     <div className="absolute z-10 bg-white border w-full mt-1 rounded shadow max-h-48 overflow-auto">
//                       {flattenModules(ClientDashboardMenu)
//                         // Filter modules by search text
//                         .filter((mod) =>
//                           (mod.title || mod.name)
//                             .toLowerCase()
//                             .includes(searchQuery.toLowerCase())
//                         )
//                         .map((mod) => (
//                           <div
//                             key={mod.id}
//                             onClick={() => {
//                               setSelectedModuleId(mod.id);
//                               setSearchQuery(mod.title || mod.name);
//                               setShowModuleOptions(false); // Hide dropdown
//                             }}
//                             className="p-2 hover:bg-gray-100 cursor-pointer"
//                           >
//                             {mod.title || mod.name}
//                           </div>
//                         ))}
//                     </div>
//                   )}
//                 </div>

//                 {/* 2) Role Dropdown (using _id) */}
//                 <select
//                   value={selectedRoleId}
//                   onChange={(e) => setSelectedRoleId(e.target.value)}
//                   className="border p-2 rounded w-full md:w-1/4"
//                 >
//                   <option value="">Select a role</option>
//                   {roles.map((r) => (
//                     <option key={r._id} value={r._id}>
//                       {r.name}
//                     </option>
//                   ))}
//                 </select>

//                 {/* 3) Assign Button */}
//                 <button
//                   onClick={assignModuleRole}
//                   className="bg-blue-600 text-white px-4 py-2 rounded w-full md:w-auto"
//                 >
//                   Assign
//                 </button>
//               </div>

//               {/* Assigned Modules */}
//               {Object.keys(moduleRoleAssignments).length > 0 && (
//                 <div className="mt-6">
//                   <h5 className="font-semibold mb-2 text-gray-700">
//                     Assigned Modules
//                   </h5>
//                   <div className="space-y-2">
//                     {Object.entries(moduleRoleAssignments).map(
//                       ([modId, roleId]) => {
//                         const flatModules = flattenModules(ClientDashboardMenu);
//                         const mod = flatModules.find((m) => m.id === modId);

//                         // IMPORTANT: match your role's _id
//                         const role = roles.find((r) => r._id === roleId);

//                         return (
//                           <div
//                             key={modId}
//                             className="flex items-center justify-between bg-gray-50 p-2 rounded"
//                           >
//                             <span className="text-gray-800">
//                               {mod?.title || mod?.name}{" "}
//                               <span className="text-gray-500">→</span>{" "}
//                               <span className="font-medium text-blue-600">
//                                 {role?.name}
//                               </span>
//                             </span>
//                             <button
//                               onClick={() => removeAssignment(modId)}
//                               className="text-red-600 hover:text-red-800 text-sm"
//                             >
//                               Remove
//                             </button>
//                           </div>
//                         );
//                       }
//                     )}
//                   </div>
//                 </div>
//               )}
//             </div>
//           )}
//         </div>

//         {/* Create User Button */}
//         <button
//           onClick={handleCreateUser}
//           className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 w-full"
//         >
//           Create Employee
//         </button>
//       </div>
//     </div>
//   );
// };

// export default AdminPortal;
