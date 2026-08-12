import React from "react";
import { Line, Bar, Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";
import {
  FaCalendarCheck,
  FaClipboardCheck,
  FaExclamationTriangle,
  FaUserShield,
} from "react-icons/fa";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Tooltip,
  Legend
);

const lineData = {
  labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
  datasets: [
    {
      label: "Progress",
      data: [50, 55, 60, 70, 80, 90],
      borderColor: "#2563EB",
      backgroundColor: "rgba(37, 99, 235, 0.3)",
      fill: true,
    },
  ],
};

const barData = {
  labels: ["Critical", "High", "Medium", "Low"],
  datasets: [
    {
      label: "Severity",
      data: [3, 5, 10, 15],
      backgroundColor: ["#EF4444", "#F59E0B", "#EAB308", "#10B981"],
    },
  ],
};

const doughnutData = {
  labels: ["Compliant", "Non-Compliant"],
  datasets: [
    {
      label: "Compliance",
      data: [75, 25],
      backgroundColor: ["#34D399", "#EF4444"],
    },
  ],
};

const TisaxDashboard = () => {
  return (
    <div className="min-h-screen bg-gray-100 p-4 grid grid-cols-3 gap-4">
      <h1 className="col-span-3 text-center text-xl font-bold text-gray-800 mb-2">
        TISAX Dashboard
      </h1>

      {/* Compliance Progress */}
      <div className="bg-white shadow-lg rounded-lg flex flex-col items-center p-4 aspect-w-1 aspect-h-1">
        <FaClipboardCheck size={20} className="text-blue-500 mb-1" />
        <h3 className="text-md font-semibold mb-1">Compliance Progress</h3>
        <Line
          data={lineData}
          options={{ responsive: true, maintainAspectRatio: true }}
        />
      </div>
      {/* Vendor Compliance */}
      <div className="bg-white shadow-lg rounded-lg flex flex-col items-center p-4 aspect-w-1 aspect-h-1">
        <FaUserShield size={20} className="text-indigo-500 mb-1" />
        <h3 className="text-md font-semibold mb-1">Vendor Compliance</h3>
        <div className="w-auto h-au">
          {" "}
          {/* Adjust width and height as needed */}
          <Doughnut
            data={doughnutData}
            options={{ responsive: true, maintainAspectRatio: true }}
          />
        </div>
      </div>

      {/* Incidents by Severity */}
      <div className="bg-white shadow-lg rounded-lg flex flex-col items-center p-4 aspect-w-1 aspect-h-1">
        <FaExclamationTriangle size={20} className="text-red-500 mb-1" />
        <h3 className="text-md font-semibold mb-1">Incidents by Severity</h3>
        <Bar
          data={barData}
          options={{ responsive: true, maintainAspectRatio: true }}
        />
      </div>
      {/* Upcoming Audits */}
      <div className="bg-white shadow-lg rounded-lg flex flex-col items-center p-4 aspect-w-1 aspect-h-1">
        <FaCalendarCheck size={20} className="text-purple-500 mb-1" />
        <h3 className="text-md font-semibold mb-1">Upcoming Audits</h3>
        <ul className="text-gray-600 text-xs text-center flex-grow">
          <li>Prototype - Apr 15, 2024</li>
          <li>Data Protection - Jun 22, 2024</li>
          <li>Security - Oct 10, 2024</li>
        </ul>
      </div>

      {/* Checklist Progress */}
      <div className="bg-white shadow-lg rounded-lg flex flex-col items-center p-4 aspect-w-1 aspect-h-1">
        <FaClipboardCheck size={20} className="text-green-500 mb-1" />
        <h3 className="text-md font-semibold mb-1">Checklist Progress</h3>
        <ul className="text-gray-600 text-xs text-center flex-grow">
          <li>Policy Review - Done</li>
          <li>Training - In Progress</li>
          <li>Access Control - Pending</li>
        </ul>
      </div>

      {/* Maturity Levels */}
      <div className="bg-white shadow-lg rounded-lg flex flex-col items-center p-4 aspect-w-1 aspect-h-1">
        <FaUserShield size={20} className="text-yellow-500 mb-1" />
        <h3 className="text-md font-semibold mb-1">Maturity Levels</h3>
        <ul className="text-gray-600 text-xs text-center flex-grow">
          <li>Info Security - Level 3</li>
          <li>Prototype - Level 2</li>
          <li>Data Protection - Level 3</li>
        </ul>
      </div>

      {/* Top Risks */}
      <div className="bg-white shadow-lg rounded-lg flex flex-col items-center p-4 aspect-w-1 aspect-h-1">
        <FaExclamationTriangle size={20} className="text-orange-500 mb-1" />
        <h3 className="text-md font-semibold mb-1">Top Risks</h3>
        <ul className="text-gray-600 text-xs text-center flex-grow">
          <li>Prototype security</li>
          <li>Data compliance gaps</li>
          <li>Access inconsistencies</li>
        </ul>
      </div>

      {/* Document Status */}
      <div className="bg-white shadow-lg rounded-lg flex flex-col items-center p-4 aspect-w-1 aspect-h-1">
        <FaClipboardCheck size={20} className="text-blue-500 mb-1" />
        <h3 className="text-md font-semibold mb-1">Document Status</h3>
        <ul className="text-gray-600 text-xs text-center flex-grow">
          <li>Policy - Approved</li>
          <li>Security Plan - Pending</li>
          <li>Audit Log - Review</li>
        </ul>
      </div>

      {/* Deadlines */}
      <div className="bg-white shadow-lg rounded-lg flex flex-col items-center p-4 aspect-w-1 aspect-h-1">
        <FaCalendarCheck size={20} className="text-pink-500 mb-1" />
        <h3 className="text-md font-semibold mb-1">Deadlines</h3>
        <ul className="text-gray-600 text-xs text-center flex-grow">
          <li>Internal Review - Mar 1, 2024</li>
          <li>External Audit - May 1, 2024</li>
        </ul>
      </div>
    </div>
  );
};

export default TisaxDashboard;
