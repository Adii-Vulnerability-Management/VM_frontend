// ManageLogs.js
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import CustomAxios from "@/globalcomponents/CustomAxios";
import Loader from "@/globalcomponents/loader/Loader";
import { baseurl, initURL } from "../../../../../BaseUrl";

const ManageLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const response = await CustomAxios.get(
        `${baseurl}/${initURL}/rbi-tracking/get-logs`,
      );
      if (response.status === 200) {
        setLogs(response.data); // Assumes response.data is an array of log objects.
      } else {
        toast.error("Failed to fetch logs.");
      }
    } catch (error) {
      toast.error("Error fetching logs.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  return (
    <div data-tour="dept-logs-table">
      <h2 className="text-2xl font-bold text-[#2B245C] mb-3">Logs</h2>
      {loading ? (
        <Loader />
      ) : (
        <div className="overflow-x-auto rounded-lg border border-gray-800">
          <table className="min-w-full text-sm">
            <thead className="bg-[#2B245C] text-left text-white border-b border-gray-800">
              <tr>
                <th className="px-4 py-2">Timestamp</th>
                <th className="px-4 py-2">Action Type</th>
                <th className="px-4 py-2">Details</th>
              </tr>
            </thead>
            <tbody>
              {logs.length === 0 ? (
                <tr>
                  <td colSpan="3" className="text-center p-4">
                    No logs found.
                  </td>
                </tr>
              ) : (
                logs.map((log, index) => (
                  <tr key={index}>
                    <td className="px-4 py-2">{log.timestamp}</td>
                    <td className="px-4 py-2">{log.actionType}</td>
                    <td className="px-4 py-2">
                      {typeof log.details === "object"
                        ? JSON.stringify(log.details)
                        : log.details}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ManageLogs;
