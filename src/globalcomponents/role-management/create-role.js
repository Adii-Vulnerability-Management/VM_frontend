import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import CustomAxios from '@/globalcomponents/CustomAxios';
import { baseurl, initURL } from '../../../BaseUrl';

const CreateRolePage = () => {
  const [roleName, setRoleName] = useState("");
  const [rolePermissions, setRolePermissions] = useState({
    create: false,
    read: false,
    update: false,
    delete: false,
  });
  const [editingRoleId, setEditingRoleId] = useState(null);

  const handleSaveRole = async () => {
    if (!roleName.trim()) {
      toast.error("Please provide a role name");
      return;
    }

    const perms = Object.entries(rolePermissions)
      .filter(([_, isChecked]) => isChecked)
      .map(([perm]) => perm);

    if (perms.length === 0) {
      toast.error("Select at least one permission (CRUD) for the role");
      return;
    }

    const roleData = {
      name: roleName,
      permissions: perms,
    };

    try {
      if (editingRoleId) {
        const response = await CustomAxios.put(
          `${baseurl}/${initURL}/roles/${editingRoleId}`,
          roleData
        );
        toast.success(`Role "${roleName}" updated successfully`);
      } else {
        const response = await CustomAxios.post(
          `${baseurl}/${initURL}/roles`,
          roleData
        );
        toast.success(`Role "${roleName}" created successfully`);
      }
      resetForm();
    } catch (error) {
      toast.error(`Failed to ${editingRoleId ? 'update' : 'create'} role`);
    }
  };

  const resetForm = () => {
    setRoleName("");
    setRolePermissions({
      create: false,
      read: false,
      update: false,
      delete: false,
    });
    setEditingRoleId(null);
  };

  // Render checkboxes for CRUD permissions
  const renderRolePermissions = () => {
    return (
      <div className="flex gap-4">
        {["create", "read", "update", "delete"].map((perm) => (
          <label key={perm} className="flex items-center gap-1">
            <input
              type="checkbox"
              checked={rolePermissions[perm]}
              onChange={() =>
                setRolePermissions((prev) => ({
                  ...prev,
                  [perm]: !prev[perm],
                }))
              }
            />
            {perm.toUpperCase()}
          </label>
        ))}
      </div>
    );
  };

  return (
      <div className="p-4 border rounded-lg">
        <h3 className="text-lg font-semibold mb-3">
          {editingRoleId ? "Update Role" : "Create Role"}
        </h3>
        <input
          type="text"
          placeholder="Role Name (e.g. Approver, Employee)"
          value={roleName}
          onChange={(e) => setRoleName(e.target.value)}
          className="w-full p-3 border rounded focus:outline-blue-500 mb-4"
        />

        <div>
          <span className="font-medium">Permissions (CRUD):</span>
          <div className="mt-2">{renderRolePermissions()}</div>
        </div>

        <div className="flex gap-4 mt-4">
          <button
            onClick={handleSaveRole}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          >
            {editingRoleId ? "Update Role" : "Create Role"}
          </button>
          {editingRoleId && (
            <button
              onClick={resetForm}
              className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
            >
              Cancel
            </button>
          )}
        </div>
      </div>
  );
};

export default CreateRolePage;