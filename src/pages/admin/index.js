import { useState, useEffect } from "react";

const Dashboard = () => {
  const [roles, setRoles] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Dummy API simulation for fetching roles and users
  useEffect(() => {
    // Simulate an API delay
    setTimeout(() => {
      // Dummy data for roles and users
      setRoles([
        { id: "1", name: "Approver", permissions: ["read", "update"] },
        {
          id: "2",
          name: "Employee",
          permissions: ["create", "read", "update", "delete"],
        },
      ]);
      setUsers([
        {
          id: "1",
          name: "John Doe",
          moduleRoles: [
            { moduleName: "Security / Compliance", roleName: "Approver" },
          ],
        },
        {
          id: "2",
          name: "Jane Smith",
          moduleRoles: [{ moduleName: "Operations", roleName: "Employee" }],
        },
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  if (loading) {
    return <p>Loading Dashboard...</p>;
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Dashboard Overview</h2>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <div className="bg-white shadow rounded p-4">
          <h3 className="text-xl font-semibold">Total Roles</h3>
          <p className="text-3xl">{roles.length}</p>
        </div>
        <div className="bg-white shadow rounded p-4">
          <h3 className="text-xl font-semibold">Total Users</h3>
          <p className="text-3xl">{users.length}</p>
        </div>
      </div>

      {/* Roles List */}
      <div className="bg-white shadow rounded p-4 mb-8">
        <h3 className="text-xl font-semibold mb-2">Roles List</h3>
        {roles.length === 0 ? (
          <p>No roles available</p>
        ) : (
          <ul>
            {roles.map((role) => (
              <li key={role.id} className="border-b py-2">
                <strong>{role.name}</strong> — Permissions:{" "}
                {role.permissions.join(", ")}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Users List */}
      <div className="bg-white shadow rounded p-4">
        <h3 className="text-xl font-semibold mb-2">Users List</h3>
        {users.length === 0 ? (
          <p>No users available</p>
        ) : (
          <ul>
            {users.map((user) => (
              <li key={user.id} className="border-b py-2">
                <strong>{user.name}</strong>
                <div>
                  Module Roles:
                  {user.moduleRoles.map((mr, index) => (
                    <span key={index} className="ml-2">
                      [{mr.moduleName}: {mr.roleName}]
                    </span>
                  ))}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default Dashboard;