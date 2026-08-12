import { useState } from "react";
import { FaTachometerAlt, FaUserTie } from 'react-icons/fa'; // Font Awesome
import { FiList, FiSettings } from 'react-icons/fi'; // Feather Icons
import { useRouter } from 'next/router';
import Dashboard from '@/globalcomponents/role-management/dashboard';
import CreateRole from '@/globalcomponents/role-management/create-role';
import RolesList from '@/globalcomponents/role-management/roles-list';
import Roles from '@/globalcomponents/role-management/role';

const RoleManagement = () => {
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
      component: <Dashboard isActive={activeTab === "Dashboard"} />,
    },
    {
      id: "Create Role",
      label: "Create Role",
      icon: <FaUserTie className="w-5 h-5" />, // User tie icon for employees
      component: (
        <CreateRole />
      ),
    },
    {
      id: "Roles List",
      label: "Roles List",
      icon: <FiList className="w-5 h-5" />, // User tie icon for employees
      component: (
        <RolesList />
      ),
    },
    {
      id: "role",
      label: "Log",
      icon: <FiSettings className="w-5 h-5" />, // User tie icon for employees
      component: (
        <Roles />
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

export default RoleManagement;


// import React, { useState, useEffect } from "react";
// import { toast } from "react-toastify";
// import CustomAxios from "@/globalcomponents/CustomAxios";
// import { baseurl, initURL } from "../../../../BaseUrl";
// const RoleManagement = () => {
//   const [roles, setRoles] = useState([]); // All roles
//   const [roleName, setRoleName] = useState("");
//   const [rolePermissions, setRolePermissions] = useState({
//     create: false,
//     read: false,
//     update: false,
//     delete: false,
//   });
//   const [editingRoleId, setEditingRoleId] = useState(null);

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

//   const handleSaveRole = async () => {
//     if (!roleName.trim()) {
//       toast.error("Please provide a role name");
//       return;
//     }

//     // Gather selected permissions
//     const perms = Object.entries(rolePermissions)
//       .filter(([_, isChecked]) => isChecked)
//       .map(([perm]) => perm);

//     if (perms.length === 0) {
//       toast.error("Select at least one permission (CRUD) for the role");
//       return;
//     }

//     if (editingRoleId) {
//       // Update role (DTO only requires name and permissions)
//       const updatedRole = {
//         name: roleName,
//         permissions: perms,
//       };

//       try {
//         const response = await CustomAxios.put(
//           `${baseurl}/${initURL}/roles/${editingRoleId}`,
//           updatedRole
//         );
//         setRoles((prevRoles) =>
//           prevRoles.map((role) =>
//             role._id === editingRoleId ? response.data : role
//           )
//         );
//         toast.success(`Role "${roleName}" updated successfully`);
//         resetForm();
//       } catch (error) {
//         toast.error("Failed to update role");
//       }
//     } else {
//       // Create new role (include current user id)
//       const newRole = {
//         name: roleName,
//         permissions: perms,
//       };

//       try {
//         const response = await CustomAxios.post(
//           `${baseurl}/${initURL}/roles`,
//           newRole
//         );
//         setRoles((prevRoles) => [...prevRoles, response.data]);
//         toast.success(`Role "${roleName}" created successfully`);
//         resetForm();
//       } catch (error) {
//         toast.error("Failed to create role");
//       }
//     }
//   };

//   const handleEditRole = (role) => {
//     setEditingRoleId(role._id);
//     setRoleName(role.name);
//     // Pre-fill checkboxes based on the existing role permissions
//     setRolePermissions({
//       create: role.permissions.includes("create"),
//       read: role.permissions.includes("read"),
//       update: role.permissions.includes("update"),
//       delete: role.permissions.includes("delete"),
//     });
//   };

//   const handleDeleteRole = async (roleId) => {
//     try {
//       await CustomAxios.delete(`${baseurl}/${initURL}/roles/${roleId}`);
//       setRoles((prevRoles) => prevRoles.filter((role) => role._id !== roleId));
//       toast.success("Role deleted successfully");
//       if (editingRoleId === roleId) resetForm();
//     } catch (error) {
//       toast.error("Failed to delete role");
//     }
//   };

//   const resetForm = () => {
//     setRoleName("");
//     setRolePermissions({
//       create: false,
//       read: false,
//       update: false,
//       delete: false,
//     });
//     setEditingRoleId(null);
//   };

//   // Render checkboxes for CRUD permissions
//   const renderRolePermissions = () => {
//     return (
//       <div className="flex gap-4">
//         {["create", "read", "update", "delete"].map((perm) => (
//           <label key={perm} className="flex items-center gap-1">
//             <input
//               type="checkbox"
//               checked={rolePermissions[perm]}
//               onChange={() =>
//                 setRolePermissions((prev) => ({
//                   ...prev,
//                   [perm]: !prev[perm],
//                 }))
//               }
//             />
//             {perm.toUpperCase()}
//           </label>
//         ))}
//       </div>
//     );
//   };

//   return (
//     <div className="p-6 bg-white shadow-lg rounded-lg w-full mx-auto space-y-8">
//       <h2 className="text-xl font-semibold mb-4 text-center text-gray-800">
//         Role Management
//       </h2>

//       {/* Role Form */}
//       <div className="p-4 border rounded-lg">
//         <h3 className="text-lg font-semibold mb-3">
//           {editingRoleId ? "Update Role" : "Create Role"}
//         </h3>
//         <input
//           type="text"
//           placeholder="Role Name (e.g. Approver, Employee)"
//           value={roleName}
//           onChange={(e) => setRoleName(e.target.value)}
//           className="w-full p-3 border rounded focus:outline-blue-500 mb-4"
//         />

//         <div>
//           <span className="font-medium">Permissions (CRUD):</span>
//           <div className="mt-2">{renderRolePermissions()}</div>
//         </div>

//         <div className="flex gap-4 mt-4">
//           <button
//             onClick={handleSaveRole}
//             className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
//           >
//             {editingRoleId ? "Update Role" : "Create Role"}
//           </button>
//           {editingRoleId && (
//             <button
//               onClick={resetForm}
//               className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
//             >
//               Cancel
//             </button>
//           )}
//         </div>
//       </div>

//       {/* Roles List */}
//       <div className="p-4 border rounded-lg">
//         <h3 className="text-lg font-semibold mb-3">Roles List</h3>
//         {roles.length === 0 ? (
//           <p>No roles found.</p>
//         ) : (
//           <ul className="space-y-4">
//             {roles.map((role) => (
//               <li
//                 key={role._id}
//                 className="border p-4 rounded flex justify-between items-center"
//               >
//                 <div>
//                   <strong>{role.name}</strong>
//                   <div className="text-sm text-gray-600">
//                     Permissions: {role.permissions.join(", ")}
//                   </div>
//                 </div>
//                 <div className="flex gap-2">
//                   <button
//                     onClick={() => handleEditRole(role)}
//                     className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
//                   >
//                     Edit
//                   </button>
//                   <button
//                     onClick={() => handleDeleteRole(role._id)}
//                     className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
//                   >
//                     Delete
//                   </button>
//                 </div>
//               </li>
//             ))}
//           </ul>
//         )}
//       </div>
//     </div>
//   );
// };

// export default RoleManagement;
