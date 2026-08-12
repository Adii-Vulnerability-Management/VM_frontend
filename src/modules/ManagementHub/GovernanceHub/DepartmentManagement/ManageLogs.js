// ManageLogs.js
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import CustomAxios from "@/config/CustomAxios";
import Loader from "@/components/ui/Loader";
import { baseurl, initURL } from "@/config/config";

const ManageLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const response = await CustomAxios.get(
        `${baseurl}/${initURL}/rbi-tracking/get-logs`
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
    <div className="p-4">
      <h1 className="text-4xl font-extrabold text-center text-[#2B245C] mb-6">
        Logs
      </h1>
      {loading ? (
        <Loader />
      ) : (
        <div className="overflow-auto">
          <table className="min-w-full bg-white border">
            <thead>
              <tr className="bg-gray-200">
                <th className="px-4 py-2 border">Timestamp</th>
                <th className="px-4 py-2 border">Action Type</th>
                <th className="px-4 py-2 border">Details</th>
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
                  <tr key={index} className="border-t">
                    <td className="px-4 py-2 border">{log.timestamp}</td>
                    <td className="px-4 py-2 border">{log.actionType}</td>
                    <td className="px-4 py-2 border">
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
