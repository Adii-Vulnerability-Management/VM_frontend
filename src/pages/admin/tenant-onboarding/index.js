import { useCallback, useEffect, useMemo, useState } from "react";
import CustomAxios from "@/globalcomponents/CustomAxios";
import { initURL } from "@/config/config";
import { toast } from "react-toastify";
import { FiLayers, FiUsers, FiPlusCircle, FiRefreshCw } from "react-icons/fi";
import { FaTachometerAlt, FaUserTie } from "react-icons/fa";
import ModuleAccessPicker from "@/globalcomponents/access-management/ModuleAccessPicker";
import {
  filterCatalogModules,
  flattenSubModulesByModule,
  mapSubModulesToModules,
  moduleLabelFromCatalog,
  addModuleToAccessState,
  removeModuleFromAccessState,
  syncPermissionsToModules,
  toggleListItem,
  toggleSubModuleInMap,
  templatePermissionKeysForModules,
} from "@/auth/accessCatalogUtils";

const API_PREFIX = initURL || "priv";
const API_BASE = `${API_PREFIX}/access/tenants`;
const ACCESS_CATALOG_URL = `${API_PREFIX}/access/catalog`;

export default function TenantOnboardingPortal() {
  const [loading, setLoading] = useState(true);
  const [isPlatform, setIsPlatform] = useState(false);
  const [moduleCatalog, setModuleCatalog] = useState([]);
  const [tenants, setTenants] = useState([]);
  const [currentTenant, setCurrentTenant] = useState(null);
  const [tenantUsers, setTenantUsers] = useState([]);
  const [roles, setRoles] = useState([]);

  const [form, setForm] = useState({
    tenantId: "",
    displayName: "",
    industry: "",
    status: "Active",
    contactNumber: "",
    emailId: "",
    country: "",
    region: "",
    notes: "",
    enabledModuleKeys: [],
    enabledPermissions: [],
    adminFirstName: "",
    adminLastName: "",
    adminEmail: "",
    adminContactNumber: "",
  });

  const [formSubModulesByModule, setFormSubModulesByModule] = useState({});
  const [formTemplateRole, setFormTemplateRole] = useState("");
  const [selectedTenantId, setSelectedTenantId] = useState("");
  const [modulesDraft, setModulesDraft] = useState([]);
  const [draftSubModulesByModule, setDraftSubModulesByModule] = useState({});
  const [draftTemplateRole, setDraftTemplateRole] = useState("");
  const [permissionsDraft, setPermissionsDraft] = useState([]);
  const [onboardModuleToAdd, setOnboardModuleToAdd] = useState("");
  const [draftModuleToAdd, setDraftModuleToAdd] = useState("");

  const [assignEmail, setAssignEmail] = useState("");
  const [assignUserId, setAssignUserId] = useState("");
  const [assignRoles, setAssignRoles] = useState([]);
  const [selectedTenantUsers, setSelectedTenantUsers] = useState([]);
  // Tabs
  const [activeTab, setActiveTab] = useState("dashboard");
  // Search
  const [searchTerm, setSearchTerm] = useState("");
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  // Modal
  const [showManageModal, setShowManageModal] = useState(false);
  const [manageTab, setManageTab] = useState("modules");

  const loadRoles = useCallback(async () => {
    try {
      const res = await CustomAxios.get(`${API_PREFIX}/access/roles`);
      const data = res.data?.data ?? res.data ?? [];
      setRoles(Array.isArray(data) ? data : []);
    } catch {
      setRoles([]);
    }
  }, []);

  const loadPlatform = useCallback(async () => {
    const [tenantResult, catalogResult] = await Promise.allSettled([
      CustomAxios.get(API_BASE),
      CustomAxios.get(ACCESS_CATALOG_URL),
    ]);

    if (catalogResult.status === "fulfilled") {
      const cRes = catalogResult.value;
      const modules = Array.isArray(cRes.data?.modules)
        ? cRes.data.modules
        : (cRes.data?.data?.modules ?? []);

      setModuleCatalog(filterCatalogModules(modules));
    } else {
      setModuleCatalog([]);
    }

    if (tenantResult.status === "fulfilled") {
      const tRes = tenantResult.value;
      setTenants(Array.isArray(tRes.data) ? tRes.data : []);
      setIsPlatform(true);
    } else {
      setIsPlatform(false);
      setTenants([]);
    }
  }, []);

  const loadTenantContext = useCallback(async () => {
    try {
      const cur = await CustomAxios.get(`${API_BASE}/current`);
      setCurrentTenant(cur.data);
      const uRes = await CustomAxios.get(`${API_BASE}/current/users`);
      setTenantUsers(Array.isArray(uRes.data) ? uRes.data : []);
    } catch {
      setCurrentTenant(null);
      setTenantUsers([]);
    }
  }, []);

  const refreshAll = useCallback(async () => {
    setLoading(true);
    await loadRoles();
    await loadPlatform();
    await loadTenantContext();
    setLoading(false);
  }, [loadPlatform, loadTenantContext, loadRoles]);

  useEffect(() => {
    refreshAll();
  }, [refreshAll]);

  useEffect(() => {
    if (!isPlatform || !selectedTenantId) {
      setSelectedTenantUsers([]);
      return;
    }
    (async () => {
      try {
        const u = await CustomAxios.get(
          `${API_BASE}/${encodeURIComponent(selectedTenantId)}/users`,
        );
        setSelectedTenantUsers(Array.isArray(u.data) ? u.data : []);
      } catch {
        setSelectedTenantUsers([]);
      }
    })();
  }, [isPlatform, selectedTenantId]);

  useEffect(() => {
    const applyTenantDraft = (tenant) => {
      const moduleKeys = tenant?.enabledModuleKeys || [];
      setModulesDraft(moduleKeys);
      setDraftSubModulesByModule(
        mapSubModulesToModules(
          moduleKeys,
          tenant?.enabledSubModules || [],
          moduleCatalog,
        ),
      );
      setPermissionsDraft(tenant?.enabledPermissions || []);
      setDraftTemplateRole("");
    };

    if (selectedTenantId && currentTenant?.tenantId === selectedTenantId) {
      applyTenantDraft(currentTenant);
    } else if (selectedTenantId) {
      const t = tenants.find(
        (x) =>
          x.tenantId === selectedTenantId || x.tenant_id === selectedTenantId,
      );
      applyTenantDraft(t);
    }
  }, [selectedTenantId, tenants, currentTenant, moduleCatalog]);

  const moduleLabel = (moduleKey) =>
    moduleLabelFromCatalog(moduleCatalog, moduleKey);

  const buildTenantAccessPayload = (
    moduleKeys,
    subModulesByModule,
    permissions,
  ) => ({
    enabledModuleKeys: moduleKeys,
    enabledSubModules: flattenSubModulesByModule(subModulesByModule),
    enabledPermissions: syncPermissionsToModules(
      moduleCatalog,
      moduleKeys,
      permissions,
    ),
  });

  const addOnboardModule = (moduleKey) => {
    if (!moduleKey || form.enabledModuleKeys.includes(moduleKey)) return;
    const next = addModuleToAccessState({
      moduleKey,
      moduleKeys: form.enabledModuleKeys,
      permissions: form.enabledPermissions,
      subModulesByModule: formSubModulesByModule,
      catalog: moduleCatalog,
    });
    setFormSubModulesByModule(next.subModulesByModule);
    setFormTemplateRole("");
    setForm((prev) => ({
      ...prev,
      enabledModuleKeys: next.moduleKeys,
      enabledPermissions: next.permissions,
    }));
    setOnboardModuleToAdd("");
  };

  const removeOnboardModule = (moduleKey) => {
    const next = removeModuleFromAccessState({
      moduleKey,
      moduleKeys: form.enabledModuleKeys,
      permissions: form.enabledPermissions,
      subModulesByModule: formSubModulesByModule,
      catalog: moduleCatalog,
    });
    setFormSubModulesByModule(next.subModulesByModule);
    setFormTemplateRole("");
    setForm((prev) => ({
      ...prev,
      enabledModuleKeys: next.moduleKeys,
      enabledPermissions: next.permissions,
    }));
  };

  const addDraftModule = (moduleKey) => {
    if (!moduleKey || modulesDraft.includes(moduleKey)) return;
    const next = addModuleToAccessState({
      moduleKey,
      moduleKeys: modulesDraft,
      permissions: permissionsDraft,
      subModulesByModule: draftSubModulesByModule,
      catalog: moduleCatalog,
    });
    setModulesDraft(next.moduleKeys);
    setPermissionsDraft(next.permissions);
    setDraftSubModulesByModule(next.subModulesByModule);
    setDraftTemplateRole("");
    setDraftModuleToAdd("");
  };

  const removeDraftModule = (moduleKey) => {
    const next = removeModuleFromAccessState({
      moduleKey,
      moduleKeys: modulesDraft,
      permissions: permissionsDraft,
      subModulesByModule: draftSubModulesByModule,
      catalog: moduleCatalog,
    });
    setModulesDraft(next.moduleKeys);
    setPermissionsDraft(next.permissions);
    setDraftSubModulesByModule(next.subModulesByModule);
    setDraftTemplateRole("");
  };

  const applyFormTemplate = (roleKey) => {
    setFormTemplateRole(roleKey);
    if (!roleKey) return;
    const fullPerms = templatePermissionKeysForModules(
      moduleCatalog,
      form.enabledModuleKeys,
      roleKey,
    );
    setForm((prev) => ({
      ...prev,
      enabledPermissions: fullPerms,
    }));
  };

  const applyDraftTemplate = (roleKey) => {
    setDraftTemplateRole(roleKey);
    if (!roleKey) return;
    setPermissionsDraft(
      templatePermissionKeysForModules(moduleCatalog, modulesDraft, roleKey),
    );
  };

  const submitOnboard = async (e) => {
    e.preventDefault();
    try {
      const res = await CustomAxios.post(API_BASE, {
        tenantId: form.tenantId.trim(),
        displayName: form.displayName.trim(),
        industry: form.industry.trim(),
        status: form.status,
        contactNumber: form.contactNumber.trim(),
        emailId: form.emailId.trim(),
        country: form.country.trim(),
        region: form.region.trim(),
        notes: form.notes.trim(),
        ...buildTenantAccessPayload(
          form.enabledModuleKeys,
          formSubModulesByModule,
          form.enabledPermissions,
        ),
        adminEmail: form.adminEmail.trim().toLowerCase(),
        adminFirstName: form.adminFirstName.trim(),
        adminLastName: form.adminLastName.trim(),
        adminContactNumber: form.adminContactNumber.trim(),
      });
      const provision = res?.data?.adminProvisioning;
      if (provision?.created) {
        toast.success(
          `Tenant onboarded. Admin created (${provision.email}) with temporary password.`,
        );
      } else {
        toast.success("Tenant onboarded");
      }
      setForm({
        tenantId: "",
        displayName: "",
        industry: "",
        status: "Active",
        contactNumber: "",
        emailId: "",
        country: "",
        region: "",
        notes: "",
        enabledModuleKeys: [],
        enabledPermissions: [],
        adminFirstName: "",
        adminLastName: "",
        adminEmail: "",
        adminContactNumber: "",
      });
      setFormSubModulesByModule({});
      setFormTemplateRole("");
      await loadPlatform();
    } catch (err) {
      toast.error(
        err?.response?.data?.message ||
          err?.response?.data ||
          err?.message ||
          "Onboard failed",
      );
    }
  };

  const saveModulesForSelected = async () => {
    if (!selectedTenantId) {
      toast.error("Select a tenant row first");
      return;
    }
    try {
      await CustomAxios.patch(
        `${API_BASE}/${encodeURIComponent(selectedTenantId)}/modules`,
        buildTenantAccessPayload(
          modulesDraft,
          draftSubModulesByModule,
          permissionsDraft,
        ),
      );
      toast.success("Tenant modules updated");
      await loadPlatform();
      await loadTenantContext();
    } catch (err) {
      toast.error(
        err?.response?.data?.message ||
          err?.response?.data ||
          err?.message ||
          "Update failed",
      );
    }
  };

  const submitAssign = async (e) => {
    e.preventDefault();
    const payload = {
      roles: assignRoles,
    };
    if (assignUserId.trim()) payload.user_id = Number(assignUserId);
    else if (assignEmail.trim()) payload.email = assignEmail.trim();
    else {
      toast.error("Enter user email or user id");
      return;
    }
    try {
      if (isPlatform) {
        if (!selectedTenantId) {
          toast.error("Select a tenant in the dashboard table first");
          return;
        }
        await CustomAxios.post(
          `${API_BASE}/${encodeURIComponent(selectedTenantId)}/assign-roles`,
          payload,
        );
      } else {
        await CustomAxios.post(`${API_BASE}/current/assign-roles`, payload);
      }
      toast.success("Roles assigned");
      setAssignEmail("");
      setAssignUserId("");
      setAssignRoles([]);
      await loadTenantContext();
      if (isPlatform && selectedTenantId) {
        const u = await CustomAxios.get(
          `${API_BASE}/${encodeURIComponent(selectedTenantId)}/users`,
        );
        setSelectedTenantUsers(Array.isArray(u.data) ? u.data : []);
      }
    } catch (err) {
      toast.error(
        err?.response?.data?.message ||
          err?.response?.data ||
          err?.message ||
          "Assign failed",
      );
    }
  };

  const roleOptions = useMemo(() => {
    const rows = roles.map((r) => ({
      value: r.name || r.roleKey,
      label: `${r.name || r.roleKey}${r.module ? ` (${r.module})` : ""}`,
      module: r.module,
    }));
    const t = isPlatform
      ? tenants.find((x) => x.tenantId === selectedTenantId)
      : currentTenant;
    const enabled = new Set(
      t?.enabledModuleKeys || currentTenant?.enabledModuleKeys || [],
    );
    if (enabled.size === 0) return rows;
    return rows.filter((r) => !r.module || enabled.has(r.module));
  }, [roles, currentTenant, tenants, selectedTenantId, isPlatform]);

  // Filter tenants
  const filteredTenants = tenants.filter((t) => {
    const search = searchTerm.toLowerCase();

    return (
      t.tenantId?.toLowerCase().includes(search) ||
      t.displayName?.toLowerCase().includes(search) ||
      t.status?.toLowerCase().includes(search)
    );
  });

  // Pagination calculations
  const totalPages = Math.ceil(filteredTenants.length / rowsPerPage);

  const paginatedTenants = filteredTenants.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage,
  );

  // Reset page when rows per page changes
  useEffect(() => {
    setCurrentPage(1);
  }, [rowsPerPage]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="mx-5 min-h-screen bg-white rounded-lg p-5 my-3">
        {/* Header */}
        <header className="px-6 py-8 bg-[#2B245C] rounded-2xl shadow-lg hover:shadow-2xl transition-shadow duration-300 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-cyan-50">
              Tenant Onboarding
            </h1>
            <p className="text-white mt-1 text-sm">
              Platform admins create tenants and enable modules. Users with the{" "}
              <code className="text-xs">TENANT_ADMIN</code> role (same tenant)
              can assign roles to colleagues — only within modules enabled for
              that tenant.
            </p>
          </div>
          <button
            type="button"
            onClick={refreshAll}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white border border-slate-200 text-sm text-[#2B245C] font-semibold hover:bg-blue-50"
          >
            <FiRefreshCw /> Refresh
          </button>
        </header>

        {/* Tabs */}
        <div className="border-b border-gray-200 bg-[#f1f5f9] rounded-t-xl overflow-hidden my-5">
          <div className="flex">
            <button
              type="button"
              onClick={() => setActiveTab("dashboard")}
              className={`relative flex items-center justify-center gap-2 px-6 py-4 text-sm font-medium
                transition-all duration-200 border-r border-gray-200
                ${
                  activeTab === "dashboard"
                    ? "text-[#2B245C] bg-white"
                    : "text-gray-600 hover:text-[#2B245C]"
                }
              `}
            >
              <FaTachometerAlt className="w-5 h-5" />
              Dashboard
              {activeTab === "dashboard" && (
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#2B245C]" />
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("onboard")}
              className={`relative flex items-center justify-center gap-2 px-6 py-4 text-sm font-medium
                transition-all duration-200 border-r border-gray-200
                ${
                  activeTab === "onboard"
                    ? "text-[#2B245C] bg-white"
                    : "text-gray-600 hover:text-[#2B245C]"
                }
              `}
            >
              <FaUserTie className="w-5 h-5" />
              Onboard Tenant
              {activeTab === "onboard" && (
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#2B245C]" />
              )}
            </button>
          </div>
        </div>

        {loading ? (
          <p className="text-slate-500">Loading…</p>
        ) : (
          <>
            {isPlatform && activeTab === "onboard" && (
              <section className="rounded-2xl border border-[#2B245C] bg-white p-6 shadow-lg hover:shadow-2xl transition-shadow duration-300">
                <h2 className="text-2xl font-bold text-[#2B245C] flex items-center gap-2 mb-3">
                  Onboard Tenant
                  {/* (platform) */}
                </h2>
                <form
                  onSubmit={submitOnboard}
                  className="grid gap-5 md:grid-cols-2"
                >
                  <div className="md:col-span-2">
                    <h3 className="text-sm font-bold text-[#2B245C] uppercase my-2">
                      Client Details
                    </h3>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-2">
                      Tenant ID
                    </label>
                    <input
                      className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-indigo-200 transition-all"
                      value={form.tenantId}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, tenantId: e.target.value }))
                      }
                      placeholder="e.g. acme-tenant"
                      // required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-2">
                      Display Name
                    </label>
                    <input
                      className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-indigo-200 transition-all"
                      value={form.displayName}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, displayName: e.target.value }))
                      }
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-2">
                      Industry
                    </label>

                    <input
                      className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm"
                      value={form.industry}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, industry: e.target.value }))
                      }
                      placeholder="Industry"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-2">
                      Status
                    </label>

                    <select
                      className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm"
                      value={form.status}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, status: e.target.value }))
                      }
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-2">
                      Contact Number
                    </label>

                    <input
                      className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm"
                      value={form.contactNumber}
                      onChange={(e) =>
                        setForm((p) => ({
                          ...p,
                          contactNumber: e.target.value,
                        }))
                      }
                      placeholder="Contact Number"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-2">
                      Email Id
                    </label>

                    <input
                      type="email"
                      className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm"
                      value={form.emailId}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, emailId: e.target.value }))
                      }
                      placeholder="Email"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-2">
                      Country
                    </label>

                    <input
                      className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm"
                      value={form.country}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, country: e.target.value }))
                      }
                      placeholder="Country"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-2">
                      Region
                    </label>

                    <input
                      className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm"
                      value={form.region}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, region: e.target.value }))
                      }
                      placeholder="Region"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold text-gray-700 mb-2">
                      Notes
                    </label>
                    <textarea
                      className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-indigo-200 transition-all"
                      rows={2}
                      value={form.notes}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, notes: e.target.value }))
                      }
                    />
                  </div>

                  <hr className="border-t border-gray-300 block md:col-span-2 my-5" />

                  <div className="md:col-span-2">
                    <h3 className="text-sm font-bold text-[#2B245C] uppercase mb-2">
                      Admin Details
                    </h3>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-2">
                      First Name
                    </label>
                    <input
                      className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-indigo-200 transition-all"
                      value={form.adminFirstName}
                      onChange={(e) =>
                        setForm((p) => ({
                          ...p,
                          adminFirstName: e.target.value,
                        }))
                      }
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-2">
                      Last Name
                    </label>
                    <input
                      className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-indigo-200 transition-all"
                      value={form.adminLastName}
                      onChange={(e) =>
                        setForm((p) => ({
                          ...p,
                          adminLastName: e.target.value,
                        }))
                      }
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-indigo-200 transition-all"
                      value={form.adminEmail}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, adminEmail: e.target.value }))
                      }
                      placeholder="tenant-admin@company.com"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-2">
                      Contact Number
                    </label>
                    <input
                      className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-indigo-200 transition-all"
                      value={form.adminContactNumber}
                      onChange={(e) =>
                        setForm((p) => ({
                          ...p,
                          adminContactNumber: e.target.value,
                        }))
                      }
                      placeholder="Optional"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <span className="text-xs font-semibold text-gray-700">
                      Enabled modules, submodules and permissions{" "}
                      <span className="text-xs text-gray-500">
                        (Select only one module for each role)
                      </span>
                    </span>
                    <div className="mt-2 flex gap-2">
                      <select
                        value={onboardModuleToAdd}
                        onChange={(e) => setOnboardModuleToAdd(e.target.value)}
                        className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 focus:border-indigo-500 focus:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-indigo-200 transition-all"
                      >
                        <option value="">-- Select Module --</option>
                        {moduleCatalog
                          .filter(
                            (m) => !form.enabledModuleKeys.includes(m.key),
                          )
                          .map((m) => (
                            <option key={m.key} value={m.key}>
                              {m.label || m.key}
                            </option>
                          ))}
                      </select>
                      <button
                        type="button"
                        onClick={() => addOnboardModule(onboardModuleToAdd)}
                        disabled={!onboardModuleToAdd}
                        className="px-4 py-2.5 bg-[#2B245C] text-white rounded-lg text-sm font-medium hover:bg-opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition"
                      >
                        Add
                      </button>
                    </div>

                    {moduleCatalog.length === 0 && (
                      <p className="mt-2 text-xs text-slate-500">
                        No modules found in access catalog.
                      </p>
                    )}

                    <ModuleAccessPicker
                      catalog={moduleCatalog}
                      moduleKeys={form.enabledModuleKeys}
                      subModulesByModule={formSubModulesByModule}
                      selectedPermissions={form.enabledPermissions}
                      templateRole={formTemplateRole}
                      onTemplateRoleChange={applyFormTemplate}
                      onTogglePermission={(p) =>
                        setForm((prev) => ({
                          ...prev,
                          enabledPermissions: toggleListItem(
                            p,
                            prev.enabledPermissions,
                          ),
                        }))
                      }
                      onToggleSubModule={(moduleKey, submodule) =>
                        setFormSubModulesByModule((prev) =>
                          toggleSubModuleInMap(prev, moduleKey, submodule),
                        )
                      }
                      onRemoveModule={removeOnboardModule}
                    />
                  </div>

                  <div className="md:col-span-2">
                    <button
                      type="submit"
                      className="inline-flex items-center gap-2 rounded-lg bg-[#2B245C] px-6 py-2.5 text-sm font-semibold text-white shadow-md hover:shadow-lg hover:bg-opacity-90 disabled:opacity-60 transition-all"
                    >
                      <FiPlusCircle />
                      Create Tenant
                    </button>
                  </div>
                </form>
              </section>
            )}

            {isPlatform && activeTab === "dashboard" && tenants.length > 0 && (
              <section className="rounded-2xl border border-[#2B245C] bg-white p-6 shadow-lg hover:shadow-2xl transition-shadow duration-300 lg:col-span-2 space-y-4">
                <h2 className="text-2xl font-bold text-[#2B245C]">
                  Tenants Dashboard
                </h2>

                {/* Search and Total count of Tenants */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-5">
                  {/* Search Box */}
                  <div className="w-full md:w-80">
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => {
                        setSearchTerm(e.target.value);
                        setCurrentPage(1);
                      }}
                      placeholder="Search by tenant ID, name, status..."
                      className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm shadow-sm focus:border-indigo-500 focus:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                    />
                  </div>

                  {/* Total Count */}
                  <div className="flex items-center gap-2">
                    <p className="text-xs uppercase opacity-80">
                      Total Tenants:
                    </p>
                    <p className="text-sm font-bold">
                      {filteredTenants.length}
                    </p>
                  </div>
                </div>

                {/* Table */}
                <div className="bg-white rounded-lg border border-gray-800 shadow overflow-auto">
                  <table className="w-full table-auto text-sm">
                    <thead className="bg-[#2B245C] text-white text-left border-b border-gray-800">
                      <tr>
                        <th className="px-4 py-3 font-medium">Tenant ID</th>
                        <th className="px-4 py-3 font-medium">Name</th>
                        <th className="px-4 py-3 font-medium">Status</th>
                        <th className="px-4 py-3 font-medium">
                          Modules
                        </th>
                        <th className="px-4 py-3 font-medium text-center">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {paginatedTenants.map((t, i) => (
                        <tr
                          key={t.tenantId}
                          className={`${
                            i % 2 === 0 ? "bg-white" : "bg-gray-50"
                          } hover:bg-gray-100 transition-colors`}
                        >
                          <td className="px-4 py-2 font-mono">{t.tenantId}</td>
                          <td className="px-4 py-2">{t.displayName}</td>
                          <td className="px-4 py-2">{t.status}</td>
                          <td className="px-4 py-2">
                            {(t.enabledModuleKeys || [])
                              .map(moduleLabel)
                              .join(", ") || "—"}
                            {Array.isArray(t.enabledSubModules) &&
                              t.enabledSubModules.length > 0 && (
                                <div className="text-xs text-slate-500">
                                  {t.enabledSubModules.length} submodule(s)
                                </div>
                              )}
                            {Array.isArray(t.enabledPermissions) &&
                              t.enabledPermissions.length > 0 && (
                                <div className="text-xs text-slate-500">
                                  {t.enabledPermissions.length} permission(s)
                                </div>
                              )}
                          </td>
                          <td className="px-4 py-2">
                            <div className="flex justify-center">
                              <button
                                type="button"
                                className="px-3 py-1 text-sm font-medium bg-white border border-[#2B245C] text-[#2B245C] rounded-lg hover:bg-blue-50 transition"
                                onClick={() => {
                                  setSelectedTenantId(t.tenantId);
                                  setManageTab("modules");
                                  setShowManageModal(true);
                                }}
                              >
                                Manage
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                <div className="flex flex-col md:flex-row items-center justify-between gap-4 mt-5">
                  {/* Rows Per Page */}
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">
                      Rows per page:
                    </span>

                    <select
                      value={rowsPerPage}
                      onChange={(e) => setRowsPerPage(Number(e.target.value))}
                      className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#2B245C]"
                    >
                      <option value={5}>5</option>
                      <option value={10}>10</option>
                      <option value={15}>15</option>
                      <option value={20}>20</option>
                    </select>
                  </div>

                  {/* Pagination Buttons */}
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage((prev) => prev - 1)}
                      className="rounded-lg bg-[#2B245C] text-white px-4 py-2 text-sm font-semibold shadow-md hover:shadow-lg hover:bg-opacity-90 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-200 ease-in-out"
                    >
                      Prev
                    </button>

                    {/* Page Info */}
                    <div className="text-sm text-gray-600">
                      Page {currentPage} of {totalPages || 1}
                    </div>

                    <button
                      type="button"
                      disabled={currentPage === totalPages || totalPages === 0}
                      onClick={() => setCurrentPage((prev) => prev + 1)}
                      className="rounded-lg bg-[#2B245C] text-white px-4 py-2 text-sm font-semibold shadow-md hover:shadow-lg hover:bg-opacity-90 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-200 ease-in-out"
                    >
                      Next
                    </button>
                  </div>
                </div>

                {/* {selectedTenantId && (
                  <div className="border-t pt-4 space-y-3">
                    <h3 className="font-medium">
                      Edit modules for{" "}
                      <span className="font-mono">{selectedTenantId}</span>
                    </h3>
                    <div className="flex gap-2">
                      <select
                        value={draftModuleToAdd}
                        onChange={(e) => setDraftModuleToAdd(e.target.value)}
                        className="flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
                      >
                        <option value="">-- Select Module --</option>
                        {moduleCatalog
                          .filter((m) => !modulesDraft.includes(m.key))
                          .map((m) => (
                            <option key={m.key} value={m.key}>
                              {m.label || m.key}
                            </option>
                          ))}
                      </select>
                      <button
                        type="button"
                        onClick={() => addDraftModule(draftModuleToAdd)}
                        disabled={!draftModuleToAdd}
                        className="px-4 py-2 rounded-lg bg-slate-800 text-white text-sm disabled:opacity-50"
                      >
                        Add
                      </button>
                    </div>

                    {modulesDraft.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {modulesDraft.map((k) => (
                          <span
                            key={k}
                            className="inline-flex items-center gap-2 rounded-full bg-slate-800 px-3 py-1 text-sm text-white"
                          >
                            {moduleLabel(k)}
                            <button
                              type="button"
                              onClick={() => removeDraftModule(k)}
                              className="hover:text-red-200"
                              title="Remove module"
                            >
                              x
                            </button>
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="space-y-3">
                      {modulesDraft.map((k) => {
                        const availableSubModules = subModulesForModule(k);
                        const availablePermissions = permissionKeysForModule(k);

                        return (
                          <div key={k} className="rounded-lg border p-3">
                            <div className="text-sm font-semibold text-slate-700">
                              {moduleLabel(k)}
                            </div>

                            {availableSubModules.length > 0 && (
                              <>
                                <div className="mt-3 mb-2 text-xs font-semibold text-slate-600">
                                  Submodules
                                </div>
                                <div className="flex flex-wrap gap-2">
                                  {availableSubModules.map((submodule) => (
                                    <button
                                      key={`${k}-${submodule}`}
                                      type="button"
                                      onClick={() =>
                                        setSubModulesDraft((d) =>
                                          toggleListItem(submodule, d),
                                        )
                                      }
                                      className={`rounded-full border px-3 py-1 text-xs ${subModulesDraft.includes(submodule)
                                        ? "bg-cyan-700 text-white border-cyan-700"
                                        : "bg-white text-slate-700 border-slate-300"
                                        }`}
                                    >
                                      {submodule}
                                    </button>
                                  ))}
                                </div>
                              </>
                            )}

                            <div className="mt-3 mb-2 text-xs font-semibold text-slate-600">
                              Permissions
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {availablePermissions.length === 0 ? (
                                <span className="text-xs text-slate-500">
                                  No permissions found
                                </span>
                              ) : (
                                availablePermissions.map((p) => (
                                  <button
                                    key={p}
                                    type="button"
                                    onClick={() =>
                                      setPermissionsDraft((d) =>
                                        toggleListItem(p, d),
                                      )
                                    }
                                    className={`rounded-full border px-3 py-1 text-xs ${permissionsDraft.includes(p)
                                      ? "bg-indigo-700 text-white border-indigo-700"
                                      : "bg-white text-slate-700 border-slate-300"
                                      }`}
                                  >
                                    {p}
                                  </button>
                                ))
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    <button
                      type="button"
                      onClick={saveModulesForSelected}
                      className="px-4 py-2 rounded-lg bg-slate-800 text-white hover:bg-slate-900"
                    >
                      Save modules
                    </button>
                    {selectedTenantUsers.length > 0 && (
                      <div className="mt-4">
                        <h4 className="font-medium mb-2 text-sm">
                          Users in selected tenant
                        </h4>
                        <div className="max-h-48 overflow-auto border rounded-lg text-sm">
                          <table className="min-w-full">
                            <thead className="bg-slate-50">
                              <tr>
                                <th className="p-2 text-left">ID</th>
                                <th className="p-2 text-left">Email</th>
                                <th className="p-2 text-left">Roles</th>
                              </tr>
                            </thead>
                            <tbody>
                              {selectedTenantUsers.map((u) => (
                                <tr key={u.user_id} className="border-t">
                                  <td className="p-2">{u.user_id}</td>
                                  <td className="p-2">
                                    {u.email || u.user_email || "—"}
                                  </td>
                                  <td className="p-2">
                                    {(u.roles || []).join(", ") || "—"}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </div>
                )} */}
              </section>
            )}

            {!isPlatform && (
              <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-4">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <FiUsers /> Your tenant
                </h2>
                {!currentTenant ? (
                  <p className="text-slate-500 text-sm">
                    No tenant context for your user (missing{" "}
                    <code className="text-xs">tenant_id</code>), or you lack{" "}
                    <code className="text-xs">access.roles.assign</code>.
                  </p>
                ) : (
                  <>
                    <div className="text-sm space-y-1">
                      <p>
                        <span className="font-medium">Tenant:</span>{" "}
                        <span className="font-mono">
                          {currentTenant.tenantId}
                        </span>{" "}
                        — {currentTenant.displayName}
                      </p>
                      <p>
                        <span className="font-medium">Enabled modules:</span>{" "}
                        {(currentTenant.enabledModuleKeys || [])
                          .map(moduleLabel)
                          .join(", ") || "—"}
                      </p>
                      <p>
                        <span className="font-medium">Enabled submodules:</span>{" "}
                        {(currentTenant.enabledSubModules || []).join(", ") ||
                          "—"}
                      </p>
                      <p>
                        <span className="font-medium">
                          Enabled permissions:
                        </span>{" "}
                        {(currentTenant.enabledPermissions || []).join(", ") ||
                          "—"}
                      </p>
                    </div>

                    <div>
                      <h3 className="font-medium mb-2">Users in tenant</h3>
                      <div className="overflow-x-auto max-h-64 overflow-y-auto border rounded-lg">
                        <table className="min-w-full text-sm">
                          <thead className="bg-slate-50 sticky top-0">
                            <tr className="text-left">
                              <th className="p-2">ID</th>
                              <th className="p-2">Email</th>
                              <th className="p-2">Roles</th>
                            </tr>
                          </thead>
                          <tbody>
                            {tenantUsers.map((u) => (
                              <tr key={u.user_id} className="border-t">
                                <td className="p-2">{u.user_id}</td>
                                <td className="p-2">
                                  {u.email || u.user_email || "—"}
                                </td>
                                <td className="p-2">
                                  {(u.roles || []).join(", ") || "—"}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    <form
                      onSubmit={submitAssign}
                      className="space-y-3 border-t pt-4"
                    >
                      <h3 className="font-medium">
                        Assign roles (tenant-scoped)
                      </h3>
                      <div className="grid gap-3 md:grid-cols-2">
                        <div>
                          <label className="text-xs text-slate-600">
                            Email
                          </label>
                          <input
                            className="w-full border rounded-lg px-3 py-2"
                            value={assignEmail}
                            onChange={(e) => setAssignEmail(e.target.value)}
                            placeholder="user@company.com"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-slate-600">
                            Or user_id
                          </label>
                          <input
                            className="w-full border rounded-lg px-3 py-2"
                            value={assignUserId}
                            onChange={(e) => setAssignUserId(e.target.value)}
                            placeholder="numeric id"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="text-xs text-slate-600">Roles</label>
                        <select
                          multiple
                          className="w-full border rounded-lg px-3 py-2 h-32"
                          value={assignRoles}
                          onChange={(e) => {
                            const v = Array.from(
                              e.target.selectedOptions,
                              (o) => o.value,
                            );
                            setAssignRoles(v);
                          }}
                        >
                          {roleOptions.map((r) => (
                            <option key={r.value} value={r.value}>
                              {r.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      <button
                        type="submit"
                        className="px-4 py-2 rounded-lg bg-indigo-600 text-white"
                      >
                        Assign roles
                      </button>
                    </form>
                  </>
                )}
              </section>
            )}

            {/* Edit Modal */}
            {showManageModal && selectedTenantId && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                <div className="relative flex flex-col w-full max-w-5xl h-[90vh] rounded-2xl bg-white shadow-2xl overflow-hidden">
                  {/* Header */}
                  <div className="flex items-center justify-between border-b bg-white px-6 py-4 rounded-t-2xl">
                    <div>
                      <h3 className="text-xl font-bold text-[#2B245C]">
                        Edit Modules
                      </h3>
                      <p className="text-sm text-slate-500">
                        Tenant:
                        <span className="ml-1 font-mono text-[#2B245C]">
                          {selectedTenantId}
                        </span>
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => setShowManageModal(false)}
                      className="rounded-lg border border-slate-300 px-3 py-1 text-sm hover:bg-slate-100"
                    >
                      Close
                    </button>
                  </div>

                  {/* Tabs */}
                  {/* <div className="flex-1 overflow-y-auto px-6 pt-20 pb-24 space-y-5 relative"> */}
                  <div className="sticky top-0 z-30 bg-white border-b shadow-sm">
                    <div className="flex bg-gray-100">
                      <button
                        type="button"
                        onClick={() => setManageTab("modules")}
                        className={`px-5 py-3 text-sm font-medium border-b-2 border-r transition ${
                          manageTab === "modules"
                            ? "border-b-[#2B245C] text-[#2B245C] bg-white"
                            : "border-transparent text-slate-500 hover:text-[#2B245C]"
                        }`}
                      >
                        Module Management
                      </button>

                      <button
                        type="button"
                        onClick={() => setManageTab("users")}
                        className={`px-5 py-3 text-sm font-medium border-b-2 border-r transition ${
                          manageTab === "users"
                            ? "border-b-[#2B245C] text-[#2B245C] bg-white"
                            : "border-b-transparent text-slate-500 hover:text-[#2B245C]"
                        }`}
                      >
                        Tenant Users
                      </button>
                    </div>
                  </div>

                  {/* Body */}
                  <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
                    {/* Module Management */}
                    {manageTab === "modules" && (
                      <>
                        <div className="flex gap-2 my-3">
                          <select
                            value={draftModuleToAdd}
                            onChange={(e) =>
                              setDraftModuleToAdd(e.target.value)
                            }
                            className="flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
                          >
                            <option value="">-- Select Module --</option>

                            {moduleCatalog
                              .filter((m) => !modulesDraft.includes(m.key))
                              .map((m) => (
                                <option key={m.key} value={m.key}>
                                  {m.label || m.key}
                                </option>
                              ))}
                          </select>

                          <button
                            type="button"
                            onClick={() => addDraftModule(draftModuleToAdd)}
                            disabled={!draftModuleToAdd}
                            className="px-4 py-2 rounded-lg bg-[#2B245C] text-white text-sm disabled:opacity-50"
                          >
                            Add
                          </button>
                        </div>

                        <ModuleAccessPicker
                          catalog={moduleCatalog}
                          moduleKeys={modulesDraft}
                          subModulesByModule={draftSubModulesByModule}
                          selectedPermissions={permissionsDraft}
                          templateRole={draftTemplateRole}
                          onTemplateRoleChange={applyDraftTemplate}
                          onTogglePermission={(p) =>
                            setPermissionsDraft((d) => toggleListItem(p, d))
                          }
                          onToggleSubModule={(moduleKey, submodule) =>
                            setDraftSubModulesByModule((prev) =>
                              toggleSubModuleInMap(prev, moduleKey, submodule),
                            )
                          }
                          onRemoveModule={removeDraftModule}
                          permissionChipActiveClass="bg-blue-800 text-white border-blue-800"
                        />
                      </>
                    )}

                    {/* Users */}
                    {/* {selectedTenantUsers.length > 0 && ( */}
                    {manageTab === "users" && (
                      <div className="mt-2">
                        <h4 className="font-medium mb-2 text-sm">
                          Users in selected tenant
                        </h4>

                        <div className="border rounded-lg text-sm">
                          <table className="min-w-full">
                            <thead className="bg-slate-50 sticky top-0">
                              <tr>
                                <th className="p-2 text-left">ID</th>
                                <th className="p-2 text-left">Email</th>
                                <th className="p-2 text-left">Roles</th>
                              </tr>
                            </thead>

                            <tbody>
                              {selectedTenantUsers.map((u) => (
                                <tr key={u.user_id} className="border-t">
                                  <td className="p-2">{u.user_id}</td>

                                  <td className="p-2">
                                    {u.email || u.user_email || "—"}
                                  </td>

                                  <td className="p-2">
                                    {(u.roles || []).join(", ") || "—"}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Footer */}
                  <div className="shrink-0 border-t bg-white px-6 py-4 flex justify-end gap-3 z-40">
                    <button
                      type="button"
                      onClick={() => setShowManageModal(false)}
                      className="rounded-lg border border-slate-300 px-4 py-2 text-sm hover:bg-slate-100"
                    >
                      Cancel
                    </button>

                    <button
                      type="button"
                      onClick={async () => {
                        await saveModulesForSelected();
                        setShowManageModal(false);
                      }}
                      className="rounded-lg bg-[#2B245C] px-5 py-2 text-sm font-medium text-white hover:bg-opacity-90"
                    >
                      Save Modules
                    </button>
                  </div>
                </div>
              </div>
            )}

            {isPlatform && selectedTenantId && (
              <section className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-900 mt-3">
                Platform mode: assignments for{" "}
                <span className="font-mono">{selectedTenantId}</span> use the
                selected tenant. Tenant admins use &quot;Your tenant&quot; only.
              </section>
            )}
          </>
        )}
      </div>
    </div>
  );
}
