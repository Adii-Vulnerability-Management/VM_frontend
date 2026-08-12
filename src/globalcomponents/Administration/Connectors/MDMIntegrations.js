import React, { useState } from "react";
import {
  FaMobileAlt,
  FaSyncAlt,
  FaTrashAlt,
  FaPlusCircle,
} from "react-icons/fa";

const MDMIntegrations = () => {
  const [devices, setDevices] = useState([
    {
      id: 1,
      name: "iPhone 13",
      owner: "John Doe",
      status: "Compliant",
      lastCheck: "2025-01-10",
    },
    {
      id: 2,
      name: "Samsung Galaxy S21",
      owner: "Jane Smith",
      status: "Non-Compliant",
      lastCheck: "2025-01-09",
    },
    {
      id: 3,
      name: "iPad Pro",
      owner: "Alice Johnson",
      status: "Compliant",
      lastCheck: "2025-01-11",
    },
  ]);

  const [newDevice, setNewDevice] = useState({ name: "", owner: "" });

  const handleAddDevice = () => {
    if (newDevice.name && newDevice.owner) {
      setDevices([
        ...devices,
        {
          id: devices.length + 1,
          name: newDevice.name,
          owner: newDevice.owner,
          status: "Pending",
          lastCheck: "N/A",
        },
      ]);
      setNewDevice({ name: "", owner: "" });
    }
  };

  const handleDeleteDevice = (id) => {
    setDevices(devices.filter((device) => device.id !== id));
  };

  const handleCheckCompliance = (id) => {
    setDevices(
      devices.map((device) =>
        device.id === id
          ? {
              ...device,
              status: "Compliant",
              lastCheck: new Date().toISOString().split("T")[0],
            }
          : device,
      ),
    );
  };

  return (
    <div className="p-2 min-h-screen">
      <h2 className="text-2xl font-bold text-[#2B245C] mb-1">
        MDM Integrations
      </h2>
      <p className="text-gray-600 text-sm mb-6">
        Manage mobile device compliance by tracking devices, enforcing policies,
        and preventing unauthorized access.
      </p>

      {/* Add New Device */}
      <div className="mb-5 rounded-2xl border border-[#2B245C] bg-white p-6 shadow-lg hover:shadow-2xl transition-shadow duration-300">
        <h3 className="text-2xl font-bold text-[#2B245C] mb-1">
          Add New Device
        </h3>
        <p className="text-gray-600 text-sm mb-4">
          Add a new mobile device to track compliance and enforce security
          policies.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-2">
              Device Name
            </label>
            <input
              type="text"
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-indigo-200 transition-all"
              placeholder="Enter device name (e.g., iPhone 13)"
              value={newDevice.name}
              onChange={(e) =>
                setNewDevice({ ...newDevice, name: e.target.value })
              }
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-2">
              Owner Name
            </label>
            <input
              type="text"
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-indigo-200 transition-all"
              placeholder="Enter owner name"
              value={newDevice.owner}
              onChange={(e) =>
                setNewDevice({ ...newDevice, owner: e.target.value })
              }
            />
          </div>
        </div>
        <button
          onClick={handleAddDevice}
          className="mt-5 inline-flex items-center gap-2 rounded-lg bg-[#2B245C] px-6 py-2.5 text-sm font-semibold text-white shadow-md hover:shadow-lg hover:bg-opacity-90 disabled:opacity-60 transition-all"
        >
          <FaPlusCircle /> Add Device
        </button>
      </div>

      {/* Device List */}
      <div>
        <h3 className="text-2xl font-bold text-[#2B245C] mb-3">All Devices</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {devices.map((device) => (
            <div
              key={device.id}
              className="rounded-2xl border border-[#2B245C] bg-white p-6 shadow-lg hover:shadow-2xl transition-shadow duration-300"
            >
              <div className="flex items-center justify-between mb-4">
                <FaMobileAlt className="text-[#52B0CA] text-3xl mr-4" />
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-[#2B245C]">
                    {device.name}
                  </h3>
                  <p className="text-sm text-gray-600">Owner: {device.owner}</p>
                  <p className="text-sm text-gray-600">
                    Last Check: {device.lastCheck}
                  </p>
                </div>
                <span
                  className={`px-3 py-1 text-sm font-medium rounded-full ${
                    device.status === "Compliant"
                      ? "bg-green-100 text-green-600"
                      : device.status === "Non-Compliant"
                        ? "bg-red-100 text-red-600"
                        : "bg-yellow-100 text-yellow-600"
                  }`}
                >
                  {device.status}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleCheckCompliance(device.id)}
                    className="bg-[#2B245C] border border-[#2B245C] text-white text-sm font-semibold px-3 py-1 rounded-lg hover:bg-opacity-90 flex items-center"
                  >
                    <FaSyncAlt className="mr-2" /> Check Compliance
                  </button>
                  <button
                    onClick={() => handleDeleteDevice(device.id)}
                    className="bg-white border border-red-600 text-red-600 text-sm font-semibold px-3 py-1 rounded-lg hover:bg-red-50 flex items-center"
                  >
                    <FaTrashAlt className="mr-2" /> Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MDMIntegrations;
