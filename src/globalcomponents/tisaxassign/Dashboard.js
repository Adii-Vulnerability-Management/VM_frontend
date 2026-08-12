import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import CustomAxios from "../CustomAxios";
import Loader from "../loader/Loader";
import { baseurl, initURL } from "../../../BaseUrl";

function Dashboard() {
  const [showModal, setShowModal] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState(null); // Ensures null initial state
  const [assignedTasks, setAssignedTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [completionLoading, setCompletionLoading] = useState(false);
  const [overallCompletionValues, setOverallCompletionValues] = useState({});
  const [locationData, setLocationData] = useState([]);

  // Fetch Assigned Tasks from API
  const fetchAssignedTasks = async () => {
    setLoading(true);
    try {
      const response = await CustomAxios.get(
        `${baseurl}/${initURL}/tisax-team-assignment`
      );
      console.log("API Response:", response.data);

      const tasks = response.data?.data || [];

      const updatedLocationData = tasks.map((task) => ({
        id: task._id,
        locationId: task.locationId?._id || "N/A",
        vda_type: task.locationId?.vda_type || "",
        assessment_level: task.locationId?.assessment_level || "",
        vda_version: task.locationId?.vda_version || "",
      }));

      setLocationData(updatedLocationData);
      setAssignedTasks(tasks);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignedTasks();
  }, []);

  // Fetch overall completion % per location when `locationData` updates
  useEffect(() => {
    if (locationData.length > 0) {
      fetchOverallCompletion();
    }
  }, [locationData]);

  const fetchOverallCompletion = async () => {
    setCompletionLoading(true);
    try {
      const completionData = {};

      await Promise.all(
        locationData.map(async (location) => {
          if (
            location.locationId &&
            location.vda_type &&
            location.assessment_level &&
            location.vda_version
          ) {
            const response = await CustomAxios.get(
              `${baseurl}/${initURL}/tisax/dashboard/${location.locationId}`,
              {
                params: {
                  vda_type: location.vda_type,
                  assessment_level: location.assessment_level,
                  vda_version: location.vda_version,
                },
              }
            );

            const data = response.data;

            const newSections = data.map((section) => {
              const sortedCategories = [...section.categories].sort(
                (a, b) => parseInt(a.rootISANew) - parseInt(b.rootISANew)
              );

              const tasks = sortedCategories.map((category) => ({
                name:
                  category.rootControlQuestion ||
                  category.parentControlQuestion,
                completion: Math.round(
                  (category.isReadyCount / category.totalCount) * 100
                ),
              }));

              const sectionCompletion = Math.round(
                tasks.reduce((sum, task) => sum + task.completion, 0) /
                tasks.length
              );

              return {
                name: section.name,
                tasks,
                completion: sectionCompletion,
              };
            });

            const overallCompletion = Math.round(
              newSections.reduce(
                (sum, section) => sum + section.completion,
                0
              ) / newSections.length
            );

            completionData[location.locationId] = overallCompletion || 0;
          }
        })
      );

      setOverallCompletionValues(completionData);
    } catch (error) {
      console.error("Error fetching overall completion percentage:", error);
      toast.error("Failed to fetch completion data.");
    } finally {
      setCompletionLoading(false);
    }
  };

  const openModal = (task) => {
    console.log("Selected Task for Modal:", task); // Debugging log
    setSelectedTeam(task);
    setShowModal(true);
  };

  return (
    <div className="p-2 mx-auto bg-white rounded-lg">
      <h2 className="text-2xl font-bold text-center text-[#3F2073] mb-4">
        Assigned Team Dashboard
      </h2>

      {loading ? (
        <div className="flex justify-center items-center py-10">
          <Loader />
        </div>
      ) : (
        <div className="overflow-x-auto mt-4">
          <table className="min-w-full bg-white border border-gray-300 rounded-lg shadow-md">
            <thead className="bg-[#3F2073] text-white">
              <tr>
                <th className="py-3 px-6 text-center">Location ID</th>
                <th className="py-3 px-6 text-center">Assigned Date</th>
                <th className="py-3 px-6 text-center">Deadline</th>
                <th className="py-3 px-6 text-center">Assigner</th>
                <th className="py-3 px-6 text-center">Completion Status</th>
                <th className="py-3 px-6 text-center">Info</th>
              </tr>
            </thead>
            <tbody>
              {assignedTasks.length > 0 ? (
                assignedTasks.map((task) => {
                  const locationId = task.locationId?._id || "N/A";
                  const locationIdName = task.locationId?.location_id || "N/A";
                  const completionPercentage =
                    overallCompletionValues[locationId];

                  return (
                    <tr key={task._id} className="border-b text-center">
                      <td className="py-3 px-6">{locationIdName}</td>
                      <td className="py-3 px-6">
                        {task.assignDate
                          ? new Date(task.assignDate).toLocaleDateString()
                          : "N/A"}
                      </td>
                      <td className="py-3 px-6">
                        {task.deadline
                          ? new Date(task.deadline).toLocaleDateString()
                          : "N/A"}
                      </td>
                      <td className="py-3 px-6">
                        {task.assignerId?.first_name}{" "}
                        {task.assignerId?.last_name}
                      </td>
                      <td className="py-3 px-6 font-semibold text-[#3F2073]">
                        <div className="flex justify-center items-center">
                          {completionLoading ? (
                            <Loader />
                          ) : completionPercentage !== undefined ? (
                            `${completionPercentage}%`
                          ) : (
                            "Fetching..."
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-6 text-center">
                        <button
                          onClick={() => openModal(task)}
                          className="bg-[#3F2073] text-white px-4 py-2 rounded-md hover:bg-[#2a1250]"
                        >
                          Info
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="text-center py-4 text-gray-500">
                    No teams assigned yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal for Team Details */}
      {showModal && selectedTeam && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <h2 className="text-lg font-bold mb-4">Assigned Team</h2>
            <p>
              <strong>Employee(s):</strong>{" "}
              {selectedTeam?.empID
                ?.map((e) => `${e.first_name} ${e.last_name}`)
                .join(", ") || "N/A"}
            </p>
            <p>
              <strong>Reviewer(s):</strong>{" "}
              {selectedTeam?.reviewerID
                ?.map((r) => `${r.first_name} ${r.last_name}`)
                .join(", ") || "N/A"}
            </p>
            <div className="mt-4 flex justify-end">
              <button
                onClick={() => setShowModal(false)}
                className="bg-red-600 text-white px-4 py-2 rounded-md"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
