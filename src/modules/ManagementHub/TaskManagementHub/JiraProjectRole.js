import React, { useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { baseurl, initURL } from "@/config/config";

// Function to call the backend API to create a project role
async function createProjectRole(roleName, roleDescription, projectKey) {
  const response = await fetch(
    `${baseurl}/${initURL}/jira/create-project-role`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ roleName, roleDescription, projectKey }),
    }
  );
  if (!response.ok) {
    throw new Error("Failed to create project role");
  }
  return await response.json();
}

// Function to get project roles for a specific project
async function getProjectRoles(projectKey) {
  const response = await fetch(
    `${baseurl}/${initURL}/jira/project-roles?projectKey=${projectKey}`
  );
  if (!response.ok) {
    throw new Error("Failed to fetch project roles");
  }
  return await response.json();
}
// Function to call the backend API to get all roles
async function getAllRoles() {
  const response = await fetch(`${baseurl}/${initURL}/jira/all-roles`);
  if (!response.ok) {
    throw new Error("Failed to fetch roles");
  }
  return await response.json();
}
export default function JiraProjectRole() {
  const [roleName, setRoleName] = useState("");
  const [roleDescription, setRoleDescription] = useState("");
  const [roles, setRoles] = useState([]);
  const projectKey = "GRC"; // Fixed project key

  const handleCreateRole = async () => {
    if (!roleName || !roleDescription) {
      toast.warn("Please fill in both role name and description");
      return;
    }
    try {
      const result = await createProjectRole(
        roleName,
        roleDescription,
        projectKey
      );
      toast.success("Project role created successfully");
      setRoleName("");
      setRoleDescription("");
      fetchRoles(); // Refresh the role list
    } catch (error) {
      toast.error(error.message || "Error creating project role");
    }
  };

  const fetchRoles = async () => {
    try {
      const data = await getAllRoles();

      setRoles(data);
    } catch (error) {
      toast.error(error.message || "Error fetching roles");
    }
  };
  return (
    <div className="max-w-4xl mx-auto p-8 bg-white shadow-lg rounded-lg">
      <ToastContainer />
      <h1 className="text-3xl font-extrabold mb-6 text-gray-800">
        Project Role Management (Project: GRC)
      </h1>

      {/* Create New Project Role */}
      <div className="bg-gray-100 p-4 rounded-lg mb-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-700">
          Create New Project Role
        </h2>
        <div className="flex flex-col md:flex-row gap-4">
          <input
            type="text"
            placeholder="Role Name"
            value={roleName}
            onChange={(e) => setRoleName(e.target.value)}
            className="flex-1 border p-2 rounded-md"
          />
          <input
            type="text"
            placeholder="Role Description"
            value={roleDescription}
            onChange={(e) => setRoleDescription(e.target.value)}
            className="flex-1 border p-2 rounded-md"
          />
          <button
            onClick={handleCreateRole}
            className="bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600 transition-colors"
          >
            Create Role
          </button>
        </div>
      </div>

      {/* Display Project Roles */}
      <div>
        <h2 className="text-xl font-semibold mb-4 text-gray-700">
          Roles Configured for Project GRC
        </h2>
        <button
          onClick={fetchRoles}
          className="bg-green-500 text-white px-4 py-2 rounded-md mb-4"
        >
          Refresh Roles
        </button>
        {roles.length === 0 ? (
          <div className="text-gray-500">No roles found.</div>
        ) : (
          <ul className="space-y-2">
            {roles.map((role) => (
              <li key={role.id} className="border p-2 rounded-md bg-gray-50">
                <div>
                  <strong>Name:</strong> {role.name}
                </div>
                <div>
                  <strong>ID:</strong> {role.id}
                </div>
                <div>
                  <strong>Description:</strong> {role.description}
                </div>
                <div>
                  <strong>URL:</strong> {role.self}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
