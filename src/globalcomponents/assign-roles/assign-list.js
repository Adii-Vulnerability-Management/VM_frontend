import { useState, useEffect, useRef } from "react";
import Cookies from "js-cookie";
import { toast } from "react-toastify";
import { baseurl, initURL } from "../../../BaseUrl";
import { ClientDashboardMenu } from "@/routes/DashboardRoutes";
import CustomAxios from "@/globalcomponents/CustomAxios";
import { getPermissionsFromAccessEntries } from "@/auth/accessModules";

const SUPER_EMP_URL = `/${initURL}/apiv1/users`;
const TENANT_EMP_URL = `/${initURL}/access/tenants/current/users`;

function getCurrentUser() {
  try {
    const raw = Cookies.get("user_data");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function isPlatformSuper(u) {
  return !!(u?.is_superuser && u?.is_staff && u?.is_active !== false);
}

function pickEmpUrl() {
  return isPlatformSuper(getCurrentUser()) ? SUPER_EMP_URL : TENANT_EMP_URL;
}

const formatModuleEntry = (entry) => {
  if (!entry) return "";
  if (typeof entry === "string") return entry;

  const moduleKey =
    entry.moduleKey || entry.key || entry.module || entry.moduleName || "Module";
  const subModules = Array.isArray(entry.subModules)
    ? entry.subModules
    : Array.isArray(entry.submodules)
      ? entry.submodules
      : [];

  return subModules.length > 0
    ? `${moduleKey} (${subModules.join(", ")})`
    : moduleKey;
};

const formatModulesList = (modules) => {
  if (!Array.isArray(modules) || modules.length === 0) return "-";
  const labels = modules.map(formatModuleEntry).filter(Boolean);
  return labels.length ? labels.join(", ") : "-";
};

const AssignModulesPage = () => {
  //fetch employees and then their names from it
  const [employees, setEmployees] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [roles, setRoles] = useState([]);
  const [moduleRoleAssignments, setModuleRoleAssignments] = useState({});
  const [selectedModuleId, setSelectedModuleId] = useState("");
  const [selectedRoleId, setSelectedRoleId] = useState(""); // keep this
  const [selectedRoles, setSelectedRoles] = useState([]); // array of role NAMES
  const [sendEmail, setSendEmail] = useState(true); // send email notification
  const [searchQuery, setSearchQuery] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [note, setNote] = useState("");
  const [showModuleOptions, setShowModuleOptions] = useState(false);
  const [filteredModules, setFilteredModules] = useState([]);
  const searchContainerRef = useRef(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [summary, setSummary] = useState(null);
  const [summaryOpen, setSummaryOpen] = useState(false);

  // Load roles from API
  // const loadRoles = async () => {
  //   try {
  //     const response = await CustomAxios.get(`${baseurl}/${initURL}/roles`);
  //     setRoles(response.data);
  //   } catch (error) {
  //     toast.error("Error loading roles");
  //   }
  // };

  const fetchEmployees = async () => {
    try {
      const res = await CustomAxios.get(pickEmpUrl());
      const payload = res.data?.body || res.data;
      const list = Array.isArray(payload) ? payload : payload?.data || [];
      setEmployees(list);
    } catch (e) {
      toast.error(
        e?.response?.data?.message || e?.message || "Failed to fetch employees",
      );
      setEmployees([]);
    }
  };

  // new endpoint
  const loadRoles = async () => {
    try {
      const res = await CustomAxios.get(`${initURL}/access/roles`);
      const list = Array.isArray(res?.data?.data) ? res.data.data : [];
      setRoles(list); // list contains objects like { _id, name, ... }
    } catch (error) {
      toast.error("Error loading roles");
      setRoles([]);
    }
  };

  useEffect(() => {
    loadRoles();
    fetchEmployees();
  }, []);

  // Flatten nested modules into a single array
  const flattenModules = (menuList) => {
    return menuList.reduce((acc, item) => {
      acc.push({
        id: item.id,
        title: item.title || item.name,
        path: item.path,
      });
      if (item.children) {
        acc.push(...flattenModules(item.children));
      }
      return acc;
    }, []);
  };

  const allModules = flattenModules(ClientDashboardMenu);

  // Define filterModules inside the effect
  const filterModules = (query) => {
    if (!query) return allModules;
    return flattenModules(ClientDashboardMenu).filter((mod) =>
      // (mod.title || mod.name).toLowerCase().includes(query.toLowerCase())
      mod.title.toLowerCase().includes(query.toLowerCase()),
    );
  };
  useEffect(() => {
    // Update filtered modules when search query changes
    setFilteredModules(filterModules(searchQuery));
  }, [searchQuery]);

  useEffect(() => {
    // Handle click outside to close dropdown
    function handleClickOutside(event) {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target)
      ) {
        setShowModuleOptions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const assignRoles = async () => {
    if (
      !selectedUserId ||
      // !selectedModuleId ||
      selectedRoles.length === 0
    ) {
      toast.error("Please select a user and at least one role");
      return;
    }

    // get selected user
    const user = employees.find(
      (u) => String(u._id || u.id) === String(selectedUserId),
    );
    const userEmail = user?.email;

    if (!userEmail) {
      toast.error("Selected user email not found.");
      return;
    }

    // Optional validation
    if (startDate && endDate && startDate > endDate) {
      toast.error("End date cannot be before start date");
      return;
    }

    try {
      let res;
      if (startDate || endDate) {
        if (!isPlatformSuper(getCurrentUser())) {
          toast.error("Temporary access is available only to platform admins.");
          return;
        }
        const payload = {
          userEmail,
          roles: selectedRoles,
          startDate: startDate || null,
          endDate: endDate || null,
          note: note || null,
        };
        res = await CustomAxios.post(
          `${initURL}/access/users/assign-access`,
          payload,
        );
      } else {
        const payload = {
          email: userEmail,
          roles: selectedRoles,
          sendEmail,
          note: note || null,
        };
        const assignUrl = isPlatformSuper(getCurrentUser())
          ? `${initURL}/access/users/assign-roles`
          : `${initURL}/access/tenants/current/assign-roles`;
        res = await CustomAxios.post(assignUrl, payload);
      }

      toast.success(res.data?.message || "Roles assigned successfully");
      window.dispatchEvent(new Event("accessLogsRefresh"));

      // reset
      setStartDate("");
      setEndDate("");
      setSelectedUserId("");
      setSelectedRoles([]);
      setSendEmail(true);
      setSearchQuery("");
      setNote("");
    } catch (err) {
      const msg = err.response?.data?.message;
      toast.error(Array.isArray(msg) ? msg[0] : msg || "Assign roles failed");
    }
  };

  const getSelectedUserEmail = () => {
    const user = employees.find(
      (u) => String(u._id || u.id) === String(selectedUserId),
    );
    return user?.email || "";
  };

  const removeRoles = async () => {
    if (selectedRoles.length === 0) {
      toast.error("Select at least one role to remove");
      return;
    }
    const email = getSelectedUserEmail();
    if (!email) {
      toast.error("Select a user with a valid email");
      return;
    }
    setActionLoading(true);
    try {
      const res = await CustomAxios.post(`${initURL}/access/remove-roles`, {
        email,
        roles: selectedRoles,
      });
      toast.success(res.data?.message || "Roles removed successfully");
      window.dispatchEvent(new Event("accessLogsRefresh"));
      setSelectedRoles([]);
    } catch (err) {
      const msg = err.response?.data?.message;
      toast.error(Array.isArray(msg) ? msg[0] : msg || "Remove roles failed");
    } finally {
      setActionLoading(false);
    }
  };

  const revokeAccess = async () => {
    const email = getSelectedUserEmail();
    if (!email) {
      toast.error("Select a user with a valid email");
      return;
    }
    setActionLoading(true);
    try {
      const res = await CustomAxios.post(`${initURL}/access/revoke-access`, {
        email,
      });
      toast.success(res.data?.message || "Access revoked successfully");
      window.dispatchEvent(new Event("accessLogsRefresh"));
      setSelectedRoles([]);
    } catch (err) {
      const msg = err.response?.data?.message;
      toast.error(Array.isArray(msg) ? msg[0] : msg || "Revoke access failed");
    } finally {
      setActionLoading(false);
    }
  };

  const fetchAccessSummary = async () => {
    const email = getSelectedUserEmail();
    if (!email) {
      toast.error("Select a user with a valid email");
      return;
    }
    setActionLoading(true);
    try {
      const res = await CustomAxios.get(
        `${initURL}/access/users/access-summary`,
        {
          params: { email },
        },
      );
      setSummary(res.data || null);
      setSummaryOpen(true);
    } catch (err) {
      const msg = err.response?.data?.message;
      toast.error(Array.isArray(msg) ? msg[0] : msg || "Load summary failed");
      setSummary(null);
    } finally {
      setActionLoading(false);
    }
  };

  // Remove assignment

  // const removeAssignment = (modId) => {
  //   setModuleRoleAssignments((prev) => {
  //     const updated = { ...prev };
  //     delete updated[modId];
  //     return updated;
  //   });
  //   toast.success("Assignment removed");
  // };

  const removeAssignment = (userId, modId) => {
    setModuleRoleAssignments((prev) => {
      const updated = { ...prev };
      if (!updated[userId]) return updated;

      const userAssignments = { ...updated[userId] };
      delete userAssignments[modId];

      if (Object.keys(userAssignments).length === 0) {
        delete updated[userId];
      } else {
        updated[userId] = userAssignments;
      }

      return updated;
    });
    toast.success("Assignment removed");
  };

  return (
    <div className="py-5 px-2 space-y-5">
      <section className="rounded-2xl border border-[#2B245C] bg-white p-6 shadow-lg hover:shadow-2xl transition-shadow duration-300">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-[#2B245C]">
            Assign Roles to Users
          </h2>
          <span className="text-sm text-gray-500">Module Permissions</span>
        </div>

        <div className="mb-6 rounded-2xl border border-blue-100 bg-blue-50 p-4">
          <p className="text-sm text-blue-800">
            If the user does not exist yet, create the user first. If the role is not ready, add the roles from Manage Roles before assigning access.
          </p>
        </div>

        {/* Temporary Access Section */}
        <div className="mb-6">
          <h3 className="text-sm font-bold text-[#2B245C] mb-4 uppercase tracking-wide">
            Temporary Access (Optional)
          </h3>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-2">
                Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-indigo-200 transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-2">
                End Date
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-indigo-200 transition-all"
              />
            </div>
          </div>
        </div>

        {/* Module and Role Assignment Section */}
        {roles.length === 0 ? (
          <div className="flex items-center space-x-2 bg-red-50 border border-red-200 text-red-600 p-3 rounded">
            <p className="text-sm">
              No roles available. Please create roles first.
            </p>
          </div>
        ) : (
          <div>
            {/* Search and Select Module */}

            {/* <div className="grid grid-cols-1 md:grid-cols-[1fr_1fr_auto] gap-4 items-end"> */}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* User Dropdown */}
              <div className="w-full">
                <label className="block text-xs font-semibold text-gray-700 mb-2">
                  User
                </label>
                <select
                  value={selectedUserId}
                  onChange={(e) => setSelectedUserId(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 focus:border-indigo-500 focus:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-indigo-200 transition-all"
                >
                  <option value="">Select a user</option>
                  {employees.map((u) => (
                    <option key={u._id || u.id} value={String(u._id || u.id)}>
                      {`${u.first_name || ""} ${u.last_name || ""}`.trim() ||
                        u.name ||
                        u.email}{" "}
                      ({u.email})
                    </option>
                  ))}
                </select>
              </div>

              {/* 1) Searchable Module Field */}
              {/* <div className="relative w-full" ref={searchContainerRef}>
                <label className="block text-xs font-semibold text-gray-700 mb-2">
                  Module
                </label>
                <input
                  type="text"
                  placeholder="Search or select module..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setShowModuleOptions(true); // Show suggestions while typing
                  }}
                  onFocus={() => setShowModuleOptions(true)} // Show on focus
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-indigo-200 transition-all"
                /> */}

              {/* Suggestions Dropdown */}
              {/* {showModuleOptions && (
                  <div className="absolute z-10 bg-white border w-full mt-1 rounded shadow max-h-48 overflow-auto">
                    {flattenModules(ClientDashboardMenu)
                      // Filter modules by search text
                      .filter((mod) =>
                        (mod.title || mod.name)
                          .toLowerCase()
                          .includes(searchQuery.toLowerCase()),
                      )
                      .map((mod) => (
                        <div
                          key={mod.id}
                          onClick={() => {
                            setSelectedModuleId(mod.id);
                            setSearchQuery(mod.title || mod.name);
                            setShowModuleOptions(false); // Hide dropdown
                          }}
                          className="p-2 hover:bg-gray-100 cursor-pointer"
                        >
                          {mod.title || mod.name}
                        </div>
                      ))}
                  </div>
                )}
              </div> */}

              {/* Role Dropdown */}
              <div className="md:col-span-1">
                <label className="block text-xs font-semibold text-gray-700 mb-2">
                  Role (Select one or more)
                </label>

                <select
                  value={selectedRoleId}
                  onChange={(e) => {
                    const roleId = e.target.value;
                    setSelectedRoleId(""); // reset dropdown

                    if (!roleId) return;

                    // find role object
                    const selectedRole = roles.find((r) => r._id === roleId);
                    if (!selectedRole) return;

                    setSelectedRoles((prev) => {
                      if (prev.includes(selectedRole.name)) return prev; // prevent duplicate
                      return [...prev, selectedRole.name];
                    });
                  }}
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 focus:border-indigo-500 focus:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-indigo-200 transition-all"
                >
                  <option value="">Select a role</option>
                  {roles.map((r) => (
                    <option key={r._id} value={r._id}>
                      {r.name}
                    </option>
                  ))}
                </select>

                {/* Selected roles as capsules */}
                {selectedRoles.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {selectedRoles.map((role) => (
                      <span
                        key={role}
                        className="inline-flex items-center gap-2 rounded-full bg-indigo-50 border border-indigo-200 px-3 py-1 text-xs font-semibold text-indigo-700"
                      >
                        {role}
                        <button
                          type="button"
                          onClick={() =>
                            setSelectedRoles((prev) =>
                              prev.filter((r) => r !== role),
                            )
                          }
                          className="text-indigo-700 hover:text-red-600"
                        >
                          ✕
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Send Email Checkbox */}
              <div className="md:col-span-2 flex items-center mb-4">
                <input
                  type="checkbox"
                  id="sendEmail"
                  checked={sendEmail}
                  onChange={(e) => setSendEmail(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 text-[#2B245C] focus:ring-2 focus:ring-[#2B245C]"
                />
                <label
                  htmlFor="sendEmail"
                  className="ml-2 text-sm font-medium text-gray-700 cursor-pointer"
                >
                  Send email notification to user
                </label>
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-gray-700 mb-2">
                  Note (optional)
                </label>
                <input
                  type="text"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Assign from access page"
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-900 focus:border-indigo-500 focus:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-indigo-200 transition-all"
                />
              </div>

              {/* Buttons */}
              <div className="md:col-span-2 flex justify-end mt-2">
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={removeRoles}
                    className="h-[42px] rounded-lg border border-red-600 px-6 text-sm font-semibold text-red-600 hover:bg-red-50 transition-all disabled:opacity-60"
                    disabled={actionLoading}
                  >
                    Remove Roles
                  </button>
                  <button
                    onClick={revokeAccess}
                    className="h-[42px] rounded-lg border border-blue-600 px-6 text-sm font-semibold text-blue-600 hover:bg-blue-50 transition-all disabled:opacity-60"
                    disabled={actionLoading}
                  >
                    Revoke Access
                  </button>
                  <button
                    onClick={fetchAccessSummary}
                    className="h-[42px] rounded-lg border border-[#2B245C] px-6 text-sm font-semibold text-[#2B245C] hover:bg-blue-50 transition-all disabled:opacity-60"
                    disabled={actionLoading}
                  >
                    Access Summary
                  </button>
                  <button
                    onClick={assignRoles}
                    className="h-[42px] rounded-lg bg-[#2B245C] px-6 text-sm font-semibold text-white shadow-md hover:shadow-lg hover:bg-opacity-90 transition-all disabled:opacity-60"
                    disabled={actionLoading}
                  >
                    Assign
                  </button>
                </div>
              </div>
            </div>

            {/* Assigned Modules List */}
            {/* {Object.keys(moduleRoleAssignments).length > 0 && (
              <div className="mt-6">
                <h4 className="font-semibold text-[#2B245C] mb-3">
                  Assigned Modules
                </h4>
                <div className="space-y-3">
                  {Object.entries(moduleRoleAssignments).map(
                    ([modId, roleId]) => {
                      const mod = flattenModules(ClientDashboardMenu).find(
                        (m) => m.id === modId,
                      );
                      const role = roles.find((r) => r._id === roleId);
 
                      return (
                        <div
                          key={modId}
                          className="flex justify-between items-center bg-gray-50 p-3 rounded-lg mb-2"
                        >
                          <div>
                            <span className="text-gray-800">
                              {mod?.title}
                              <span className="mx-2 text-gray-400">→</span>
                              <span className="font-semibold text-cyan-700">
                                {role?.name}
                              </span>
                            </span>
                          </div>
                          <button
                            onClick={() => removeAssignment(modId)}
                            className="text-red-600 border border-red-600 px-2 py-1 rounded-lg hover:bg-red-50 text-sm"
                          >
                            Remove
                          </button>
                        </div>
                      );
                    },
                  )}
                </div>
              </div>
            )} */}
          </div>
        )}
      </section>

      {summaryOpen && summary && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4"
          onClick={() => setSummaryOpen(false)}
        >
          <div
            className="w-full max-w-2xl rounded-2xl bg-white shadow-xl border border-gray-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-5 border-b bg-[#2B245C] text-white rounded-tl-2xl rounded-tr-2xl">
              <div className="text-lg font-bold text-cyan-50">
                Access Summary
                <p className="text-sm text-white">
                  {summary?.user?.email || summary?.email || "-"}
                </p>
              </div>
              <button
                onClick={() => setSummaryOpen(false)}
                className="rounded-lg border px-3 py-1 text-sm font-semibold hover:bg-[#3e3481]"
              >
                ✕
              </button>
            </div>
            <div className="p-5 space-y-4 text-sm">
              {(() => {
                const user = summary?.user || {};
                const access = summary?.access || {};
                const latest = summary?.latestAssignment || {};
                const roles = latest?.roles?.length
                  ? latest.roles
                  : access.roles;
                const modules = latest?.modules?.length
                  ? latest.modules
                  : access.modules;
                const perms = latest?.permissions?.length
                  ? latest.permissions
                  : getPermissionsFromAccessEntries(access.modules);
                //   : access.permissionKeys;
                const assignedAt = latest.assignedAt || access.rolesAssignedAt;
                const updatedAt = latest.updatedAt || access.lastUpdatedAt;
                const updatedBy = latest.updatedBy || access.lastUpdatedBy;
                const assignedBy = latest.assignedBy || "-";
                const lastLoginAt = latest.lastLoginAt || access.lastLoginAt;
                const status = latest.status || "ACTIVE";
                return (
                  <>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <div className="text-xs text-gray-500">User ID</div>
                        <div className="font-semibold">
                          {user.user_id || user._id || "-"}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500">Status</div>
                        <div className="font-semibold">{status || "-"}</div>
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 mb-1">Roles</div>
                      <div className="font-semibold">
                        {Array.isArray(roles) && roles.length
                          ? roles.join(", ")
                          : "-"}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 mb-1">Modules</div>
                      <div className="font-semibold">
                        {formatModulesList(modules)}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 mb-1">
                        Permissions
                      </div>
                      <div className="font-semibold">
                        {Array.isArray(perms) && perms.length
                          ? perms.join(", ")
                          : "-"}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <div className="text-xs text-gray-500">Assigned At</div>
                        <div className="font-semibold">{assignedAt || "-"}</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500">Updated At</div>
                        <div className="font-semibold">{updatedAt || "-"}</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500">Last Login</div>
                        <div className="font-semibold">
                          {lastLoginAt || "-"}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500">Updated By</div>
                        <div className="font-semibold">{updatedBy || "-"}</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500">Assigned By</div>
                        <div className="font-semibold">{assignedBy || "-"}</div>
                      </div>
                    </div>
                  </>
                );
              })()}
            </div>
            <div className="flex justify-end p-5 border-t">
              <button
                onClick={() => setSummaryOpen(false)}
                className="rounded-lg bg-[#2B245C] text-white px-4 py-2 text-sm font-semibold hover:bg-opacity-90"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssignModulesPage;
