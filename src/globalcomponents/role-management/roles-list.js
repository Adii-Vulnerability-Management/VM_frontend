import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import CustomAxios from '@/globalcomponents/CustomAxios';
import { baseurl, initURL } from '../../../BaseUrl';
import Link from 'next/link';

const RolesListPage = () => {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadRoles = async () => {
    try {
      const response = await CustomAxios.get(`${baseurl}/${initURL}/roles`);
      setRoles(response.data);
    } catch (error) {
      toast.error("Error loading roles");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRoles();
  }, []);

  const handleDelete = async (roleId) => {
    if(window.confirm("Are you sure you want to delete this role?")) {
      try {
        await CustomAxios.delete(`${baseurl}/${initURL}/roles/${roleId}`);
        setRoles(prev => prev.filter(role => role._id !== roleId));
        toast.success("Role deleted successfully");
      } catch (error) {
        toast.error("Failed to delete role");
      }
    }
  };

  return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">Roles List</h1>
          
          {loading ? (
            <p className="text-gray-500">Loading roles...</p>
          ) : roles.length === 0 ? (
            <p className="text-gray-500">No roles found</p>
          ) : (
            <div className="space-y-4">
              {roles.map((role) => (
                <div 
                  key={role._id}
                  className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-lg text-gray-800">{role.name}</h3>
                      <p className="text-sm text-gray-600 mt-1">
                        Permissions: {role.permissions.join(', ')}
                      </p>
                    </div>
                    
                    <div className="flex gap-2">
                      <Link
                        href={`/admin/rolemanagement/create?editId=${role._id}`}
                        className="px-3 py-1 bg-blue-100 text-blue-600 rounded-md text-sm hover:bg-blue-200 transition-colors"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDelete(role._id)}
                        className="px-3 py-1 bg-red-100 text-red-600 rounded-md text-sm hover:bg-red-200 transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
  );
};

export default RolesListPage;