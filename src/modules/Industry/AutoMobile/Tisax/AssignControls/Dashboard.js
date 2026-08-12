import CustomAxios from "@/config/CustomAxios";
import Dialog from "@/components/ui/Dialog";
import Loader from "@/components/ui/Loader";
import { useEffect, useState } from "react";
import { FaEye } from "react-icons/fa"; // Eye icon for viewing controls
import { baseurl, initURL } from "@/config/config";
const TisaxDashboardTable = () => {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedControls, setSelectedControls] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchAssignments = async () => {
    try {
      const response = await CustomAxios.get(
        `${baseurl}/${initURL}/assign-tisax-task/assigned-tasks`
      );
      setAssignments(response?.data || []);
    } catch (error) {
      console.error("Error fetching assignments:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignments();
  }, []);

  // Function to handle opening modal and setting controls
  const handleViewControls = (controls) => {
    setSelectedControls(controls);
    setIsModalOpen(true);
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h2 className="text-2xl font-bold text-[#2B245C] mb-4">
        TISAX Compliance Dashboard
      </h2>

      {loading ? (
        <Loader />
      ) : (
        <div className="overflow-x-auto bg-white rounded-lg shadow-md">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#2B245C] text-white">
                {[
                  "Category",
                  "Subcategory",
                  "Assigned Controls",
                  "Assigned Person",
                  "Reviewer",
                  "Assigned Date",
                  "Deadline",
                  "Actions",
                ].map((header, index) => (
                  <th key={index} className="px-4 py-2">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {assignments.length === 0 ? (
                <tr>
                  <td
                    colSpan="8"
                    className="px-4 py-4 text-center text-gray-500"
                  >
                    No assignments found.
                  </td>
                </tr>
              ) : (
                assignments.map((assignment, index) => {
                  const allControls = [
                    ...(assignment.informationSecurityControls || []),
                    ...(assignment.dataProtectionControls || []),
                    ...(assignment.prototypeProtectionControls || []),
                  ];

                  return (
                    <tr
                      key={index}
                      className="hover:bg-gray-100 transition-all border-b cursor-pointer"
                    >
                      <td className="px-4 py-2">{assignment.category}</td>
                      <td className="px-4 py-2">
                        {allControls.length > 0
                          ? allControls[0]["Root Control question"] ||
                            allControls[0]["Parent Control question"] ||
                            "N/A"
                          : "N/A"}
                      </td>
                      <td className="px-4 py-2 text-center">
                        {allControls.length}
                      </td>
                      <td className="px-4 py-2">
                        {assignment?.employeeId?.user_name || "N/A"}
                      </td>
                      <td className="px-4 py-2">
                        {assignment?.reviewerId?.user_name || "N/A"}
                      </td>
                      <td className="px-4 py-2">
                        {new Date(assignment.assignDate).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-2">
                        {new Date(assignment.deadline).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-2 text-center">
                        {allControls.length > 0 && (
                          <button
                            className="text-blue-600 hover:text-blue-800 transition"
                            onClick={() => handleViewControls(allControls)}
                          >
                            <FaEye size={18} />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Controls Modal */}
      <Dialog onClose={() => setIsModalOpen(false)} isOpen={isModalOpen}>
        <div className="p-4 max-h-[400px] overflow-y-auto">
          {selectedControls.length > 0 ? (
            <ul className="space-y-2">
              {selectedControls.map((control, index) => (
                <li key={index} className="p-3 bg-gray-100 rounded-lg">
                  <strong>{control["ISA New"]}:</strong>{" "}
                  {control["Control question"]}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500 text-center">No controls assigned.</p>
          )}
        </div>
      </Dialog>
    </div>
  );
};

export default TisaxDashboardTable;
