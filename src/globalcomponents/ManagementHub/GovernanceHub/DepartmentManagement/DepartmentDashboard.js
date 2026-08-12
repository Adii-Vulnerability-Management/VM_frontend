import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import CustomAxios from "@/globalcomponents/CustomAxios";
import Loader from "@/globalcomponents/loader/Loader";
import { baseurl, initURL } from "../../../../../BaseUrl";
import { Pie, Bar, Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
} from "chart.js";

// Register Chart.js components
ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
);

const DepartmentDashboard = () => {
  const [departments, setDepartments] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch departments and logs concurrently
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [deptRes, logsRes] = await Promise.all([
          CustomAxios.get(
            `${baseurl}/${initURL}/ghub-department`,
          ),
          CustomAxios.get(
            `${baseurl}/${initURL}/rbi-tracking/fetch-submission-tracking`,
          ),
        ]);
        if (deptRes.status === 200) {
          // Handle both array and object responses
          const deptData = Array.isArray(deptRes.data) ? deptRes.data : deptRes.data?.data || [];
          setDepartments(deptData);
        } else {
          toast.error("Failed to fetch departments");
        }
        if (logsRes.status === 200) {
          // Handle both array and object responses
          const logsData = Array.isArray(logsRes.data) ? logsRes.data : logsRes.data?.data || [];
          console.log("Logs Response:", logsRes.data); // DEBUG
          console.log("Processed Logs:", logsData); // DEBUG
          setLogs(logsData);
        } else {
          console.log("Logs Response Status:", logsRes.status); // DEBUG
          setLogs([]); // Set empty array to prevent errors
        }
      } catch (error) {
        toast.error("Error fetching dashboard data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Calculate Risk Distribution for the Pie Chart
  const riskCounts = { Low: 0, Medium: 0, High: 0, "Not Specified": 0 };
  if (Array.isArray(departments)) {
    departments.forEach((dept) => {
      const risk = dept.departmentRiskLevel
        ? dept.departmentRiskLevel
        : "Not Specified";
      if (riskCounts[risk] !== undefined) {
        riskCounts[risk]++;
      } else {
        riskCounts["Not Specified"]++;
      }
    });
  }
  const pieData = {
    labels: Object.keys(riskCounts),
    datasets: [
      {
        label: "Department Risk Distribution",
        data: Object.values(riskCounts),
        backgroundColor: [
          "#4CAF50", // Green: Low
          "#FFC107", // Amber: Medium
          "#F44336", // Red: High
          "#9E9E9E", // Grey: Not Specified
        ],
        borderWidth: 1,
      },
    ],
  };

  // Prepare Data for the Bar Chart: Number of Employees per Department
  const barLabels = departments.map((dept) => dept.departmentName);
  const barDataValues = departments.map(
    (dept) => parseInt(dept.departmentEmployees, 10) || 0,
  );
  const barData = {
    labels: barLabels,
    datasets: [
      {
        label: "Number of Employees",
        data: barDataValues,
        backgroundColor: "#2196F3",
      },
    ],
  };

  // Prepare Data for the Line Chart: Logs Trend (Last 7 Days)
  // Generate last 7 days (formatted as yyyy-mm-dd)
  const today = new Date();
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(today.getDate() - (6 - i));
    return d.toISOString().split("T")[0];
  });
  // Count logs on each day (assuming log.timestamp exists)
  const logsCount = {};
  last7Days.forEach((dateStr) => {
    logsCount[dateStr] = 0;
  });
  if (Array.isArray(logs)) {
    logs.forEach((log) => {
      const logDate = new Date(log.timestamp).toISOString().split("T")[0];
      if (logsCount.hasOwnProperty(logDate)) {
        logsCount[logDate]++;
      }
    });
  }
  const lineData = {
    labels: last7Days,
    datasets: [
      {
        label: "Logs Count (Last 7 Days)",
        data: last7Days.map((day) => logsCount[day]),
        fill: false,
        borderColor: "#FF5722",
        tension: 0.1,
      },
    ],
  };

  if (loading) {
    return (
      <div data-tour="dept-dashboard">
        <Loader />
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-semibold text-[#2B245C] mb-3">Dashboard</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Pie Chart: Risk Distribution */}
        <div
          className="bg-white p-6 rounded-lg shadow"
          data-tour="dept-dashboard-risk"
        >
          <h2 className="text-xl font-semibold mb-4 text-[#2B245C]">
            Risk Distribution
          </h2>
          <Pie data={pieData} />
        </div>

        {/* Bar Chart: Employees per Department */}
        <div
          className="bg-white p-6 rounded-lg shadow"
          data-tour="dept-dashboard-employees"
        >
          <h2 className="text-xl font-semibold mb-4 text-[#2B245C]">
            Employees per Department
          </h2>
          <Bar
            data={barData}
            options={{
              responsive: true,
              plugins: {
                legend: { position: "top" },
                title: { display: true, text: "Employees per Department" },
              },
            }}
          />
        </div>
      </div>

      {/* <div className="mt-8"> */}
        {/* Line Chart: Logs Trend */}
        {/* <div
          className="bg-white p-6 rounded-lg shadow"
          data-tour="dept-dashboard-logs-trend"
        >
          <h2 className="text-xl font-semibold mb-4 text-[#2B245C]">
            Logs Trend (Last 7 Days)
          </h2>
          <Line
            data={lineData}
            options={{
              responsive: true,
              plugins: {
                legend: { position: "top" },
                title: { display: true, text: "Daily Log Count" },
              },
            }}
          />
        </div>
      </div> */}
    </div>
  );
};

export default DepartmentDashboard;
