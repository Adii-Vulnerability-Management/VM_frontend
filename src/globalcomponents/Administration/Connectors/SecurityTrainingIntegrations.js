import React, { useState } from "react";
import { FaBook, FaSyncAlt, FaTrashAlt, FaPlusCircle } from "react-icons/fa";

const SecurityTrainingIntegrations = () => {
  const [trainings, setTrainings] = useState([
    {
      id: 1,
      name: "Curricula",
      status: "Connected",
      lastSync: "2025-01-10",
      apiKey: "******1234",
    },
    {
      id: 2,
      name: "KnowBe4",
      status: "Disconnected",
      lastSync: "N/A",
      apiKey: "Not Configured",
    },
  ]);

  const [newTraining, setNewTraining] = useState({ name: "", apiKey: "" });

  const handleAddTraining = () => {
    if (newTraining.name && newTraining.apiKey) {
      setTrainings([
        ...trainings,
        {
          id: trainings.length + 1,
          name: newTraining.name,
          status: "Connected",
          lastSync: "N/A",
          apiKey: newTraining.apiKey,
        },
      ]);
      setNewTraining({ name: "", apiKey: "" });
    }
  };

  const handleDeleteTraining = (id) => {
    setTrainings(trainings.filter((training) => training.id !== id));
  };

  const handleSyncTraining = (id) => {
    setTrainings(
      trainings.map((training) =>
        training.id === id
          ? { ...training, lastSync: new Date().toISOString().split("T")[0] }
          : training,
      ),
    );
  };

  return (
    <div className="p-2 min-h-screen">
      <h2 className="text-2xl font-bold text-[#2B245C] mb-1">
        Security Training Integrations
      </h2>
      <p className="text-gray-600 text-sm mb-6">
        Manage security training tools like Curricula and KnowBe4 to track
        employee training completion and ensure compliance.
      </p>

      {/* Add New Training */}
      <div className="mb-5 rounded-2xl border border-[#2B245C] bg-white p-6 shadow-lg hover:shadow-2xl transition-shadow duration-300">
        <h3 className="text-2xl font-bold text-[#2B245C] mb-1">
          {" "}
          Add New Training
        </h3>
        <p className="text-gray-600 text-sm mb-4">
          Connect a new training tool by providing its name and API key.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-2">
              Training Tool Name
            </label>
            <input
              type="text"
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-indigo-200 transition-all"
              placeholder="Enter tool name (e.g., Curricula)"
              value={newTraining.name}
              onChange={(e) =>
                setNewTraining({ ...newTraining, name: e.target.value })
              }
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-2">
              API Key
            </label>
            <input
              type="text"
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-indigo-200 transition-all"
              placeholder="Enter API key"
              value={newTraining.apiKey}
              onChange={(e) =>
                setNewTraining({ ...newTraining, apiKey: e.target.value })
              }
            />
          </div>
        </div>
        <button
          onClick={handleAddTraining}
          className="mt-5 inline-flex items-center gap-2 rounded-lg bg-[#2B245C] px-6 py-2.5 text-sm font-semibold text-white shadow-md hover:shadow-lg hover:bg-opacity-90 disabled:opacity-60 transition-all"
        >
          <FaPlusCircle /> Add Training
        </button>
      </div>

      {/* Trainings List */}
      <div>
        <h3 className="text-2xl font-bold text-[#2B245C] mb-3">All Trainings</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {trainings.map((training) => (
            <div
              key={training.id}
              className="rounded-2xl border border-[#2B245C] bg-white p-6 shadow-lg hover:shadow-2xl transition-shadow duration-300"
            >
              <div className="flex items-center justify-between mb-4">
                <FaBook className="text-[#52B0CA] text-3xl mr-4" />
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-[#2B245C]">
                    {training.name}
                  </h3>
                  <p className="text-sm text-gray-600">
                    Last Sync: {training.lastSync}
                  </p>
                </div>
                <span
                  className={`px-3 py-1 text-sm font-medium rounded-full ${
                    training.status === "Connected"
                      ? "bg-green-100 text-green-600"
                      : "bg-red-100 text-red-600"
                  }`}
                >
                  {training.status}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <p className="text-sm text-gray-600">
                  API Key: {training.apiKey}
                </p>

                <div className="flex space-x-2">
                  <button
                    onClick={() => handleSyncTraining(training.id)}
                    className="bg-[#2B245C] border border-[#2B245C] text-white text-sm font-semibold px-3 py-1 rounded-lg hover:bg-opacity-90 flex items-center"
                  >
                    <FaSyncAlt className="mr-2" /> Sync
                  </button>
                  <button
                    onClick={() => handleDeleteTraining(training.id)}
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

export default SecurityTrainingIntegrations;
