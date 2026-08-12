import React from 'react';
import { Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { motion } from 'framer-motion';
import { FaBell, FaExclamationTriangle, FaClipboardCheck, FaChartLine } from 'react-icons/fa';

ChartJS.register(ArcElement, Tooltip, Legend);

const Prototype2 = () => {
  // Data for Donut Chart
  const incidentData = {
    labels: ['Resolved', 'Ongoing', 'Critical'],
    datasets: [
      {
        data: [60, 25, 15],
        backgroundColor: ['#10b981', '#f59e0b', '#ef4444'],
        hoverBackgroundColor: ['#059669', '#d97706', '#dc2626'],
      },
    ],
  };

  const summaryCards = [
    { title: 'Total Audits', value: 42, icon: <FaClipboardCheck className="text-blue-600" /> },
    { title: 'Open Incidents', value: 7, icon: <FaExclamationTriangle className="text-red-600" /> },
    { title: 'Compliance Health', value: 'Good', icon: <FaChartLine className="text-green-600" /> },
    { title: 'Notifications', value: 3, icon: <FaBell className="text-yellow-600" /> },
  ];

  const auditHistory = [
    { date: '2024-02-10', description: 'Annual Audit - Passed', status: 'Passed' },
    { date: '2024-01-05', description: 'Quarterly Compliance Check - Minor Issues', status: 'Minor Issues' },
    { date: '2023-10-15', description: 'Data Security Audit - Passed', status: 'Passed' },
  ];

  const notifications = [
    { message: 'Incident response required for Data Privacy', time: '2 hours ago' },
    { message: 'Audit report submitted successfully', time: '1 day ago' },
    { message: 'Vendor compliance check scheduled', time: '2 days ago' },
  ];

  return (
    <div className="container mx-auto p-8 grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {/* Summary Cards */}
      {summaryCards.map((card, index) => (
        <motion.div
          key={index}
          className="flex items-center bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: index * 0.1 }}
        >
          <div className="p-3 bg-gray-100 rounded-full mr-4">{card.icon}</div>
          <div>
            <h3 className="text-2xl font-semibold text-gray-800">{card.value}</h3>
            <p className="text-gray-500 text-sm">{card.title}</p>
          </div>
        </motion.div>
      ))}

      {/* Incident Status Donut Chart */}
      <motion.div
        className="bg-white rounded-lg shadow-sm p-6 col-span-1 lg:col-span-2 xl:col-span-1"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h2 className="text-lg font-semibold mb-4 text-gray-800">Incident Status</h2>
        <Doughnut data={incidentData} options={{ cutout: '70%' }} />
      </motion.div>

      {/* Audit History Timeline */}
      <motion.div
        className="bg-white rounded-lg shadow-sm p-6 col-span-1 lg:col-span-2 xl:col-span-1"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h2 className="text-lg font-semibold mb-4 text-gray-800">Audit History</h2>
        <ul className="space-y-4 text-gray-700">
          {auditHistory.map((audit, index) => (
            <li key={index} className="flex flex-col space-y-1">
              <span className="text-sm font-medium">{audit.description}</span>
              <span className="text-xs text-gray-500">{audit.date} - {audit.status}</span>
            </li>
          ))}
        </ul>
      </motion.div>

      {/* Compliance Health Progress Bar */}
      <motion.div
        className="bg-white rounded-lg shadow-sm p-6 col-span-1"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h2 className="text-lg font-semibold mb-4 text-gray-800">Compliance Health</h2>
        <div className="bg-gray-200 rounded-full h-4 mb-2 overflow-hidden">
          <div
            className="bg-green-500 h-4 rounded-full"
            style={{ width: '85%' }}
          ></div>
        </div>
        <p className="text-sm text-gray-500">85% Health - Compliance looks good</p>
      </motion.div>

      {/* Notifications Panel */}
      <motion.div
        className="bg-white rounded-lg shadow-sm p-6 col-span-1 lg:col-span-2 xl:col-span-1"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h2 className="text-lg font-semibold mb-4 text-gray-800">Notifications</h2>
        <ul className="space-y-3">
          {notifications.map((notification, index) => (
            <li
              key={index}
              className="flex justify-between items-center bg-gray-50 rounded-lg p-3 hover:bg-blue-50 transition-colors"
            >
              <p className="text-gray-700">{notification.message}</p>
              <span className="text-gray-500 text-xs">{notification.time}</span>
            </li>
          ))}
        </ul>
      </motion.div>

      {/* Quick Filters Section */}
      <motion.div
        className="bg-white rounded-lg shadow-sm p-6 col-span-1"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h2 className="text-lg font-semibold mb-4 text-gray-800">Quick Filters</h2>
        <select className="w-full p-2 rounded-lg border border-gray-300 text-sm text-gray-600">
          <option value="">Select Filter</option>
          <option value="compliance">Compliance Health</option>
          <option value="incident">Open Incidents</option>
          <option value="audit">Audit Status</option>
          <option value="notification">New Notifications</option>
        </select>
      </motion.div>
    </div>
  );
};

export default Prototype2;
