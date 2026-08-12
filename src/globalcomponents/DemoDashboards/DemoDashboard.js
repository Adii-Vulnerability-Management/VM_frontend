import React from 'react';
import { Pie, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { motion } from 'framer-motion';

ChartJS.register(ArcElement, CategoryScale, LinearScale, BarElement, Tooltip, Legend);

const DemoDashboard = () => {
  // Dummy Data
  const complianceStatus = [
    { category: 'Information Security', progress: 85 },
    { category: 'Prototype Protection', progress: 70 },
    { category: 'Data Protection', progress: 65 },
  ];

  const upcomingAudits = [
    { date: '2024-12-01', description: 'Annual TISAX Audit' },
    { date: '2025-01-15', description: 'Internal Compliance Review' },
  ];

  const incidents = [
    { name: 'Unauthorized Access', severity: 'High', status: 'Resolved' },
    { name: 'Data Breach', severity: 'Critical', status: 'Ongoing' },
    { name: 'Policy Violation', severity: 'Medium', status: 'Resolved' },
  ];

  const vendorCompliance = [
    { name: 'Vendor A', status: 'Compliant', riskLevel: 'Low' },
    { name: 'Vendor B', status: 'Non-Compliant', riskLevel: 'High' },
    { name: 'Vendor C', status: 'Compliant', riskLevel: 'Medium' },
  ];

  const documents = [
    { name: 'Security Policy Document', status: 'Validated', link: '#' },
    { name: 'Data Protection Agreement', status: 'Pending Review', link: '#' },
    { name: 'Audit Report 2024', status: 'Validated', link: '#' },
  ];

  const userActivityLog = [
    { action: 'Uploaded Audit Report 2024', time: '2 hours ago' },
    { action: 'Reviewed Data Protection Agreement', time: '1 day ago' },
    { action: 'Resolved Unauthorized Access incident', time: '3 days ago' },
  ];

  // Chart Data
  const incidentSeverityData = {
    labels: ['High', 'Critical', 'Medium', 'Low'],
    datasets: [
      {
        label: 'Incidents by Severity',
        data: [3, 5, 2, 1],
        backgroundColor: ['#f59e0b', '#ef4444', '#3b82f6', '#10b981'],
      },
    ],
  };

  const maturityProgressData = {
    labels: complianceStatus.map((status) => status.category),
    datasets: [
      {
        label: 'Maturity Progress',
        data: complianceStatus.map((status) => status.progress),
        backgroundColor: ['#3b82f6', '#10b981', '#ef4444'],
      },
    ],
  };

  const fadeIn = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.8 } },
  };

  return (
    <div className="container mx-auto p-4 grid gap-4 grid-cols-1 md:grid-cols-2 xl:grid-cols-3 h-screen">
      <motion.h1
        className="col-span-full text-3xl font-bold text-center mb-4"
        initial="hidden"
        animate="visible"
        variants={fadeIn}
      >
        TISAX Compliance Dashboard
      </motion.h1>

      {/* Compliance Overview */}
      <motion.div
        className="bg-white rounded-lg shadow-lg p-4"
        initial={{ x: -50, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.7 }}
      >
        <h2 className="text-lg font-semibold mb-2">Compliance Overview</h2>
        {complianceStatus.map((status, index) => (
          <div key={index} className="mb-2">
            <h5 className="font-medium text-sm">{status.category}</h5>
            <div className="w-full bg-gray-200 rounded-full h-4 mb-1">
              <motion.div
                className="bg-blue-600 h-4 rounded-full text-center text-white text-xs"
                style={{ width: `${status.progress}%` }}
                initial={{ width: 0 }}
                animate={{ width: `${status.progress}%` }}
                transition={{ duration: 0.8 }}
              >
                {status.progress}%
              </motion.div>
            </div>
          </div>
        ))}
      </motion.div>

      {/* Upcoming Audits */}
      <motion.div
        className="bg-white rounded-lg shadow-lg p-4"
        initial="hidden"
        animate="visible"
        variants={fadeIn}
      >
        <h2 className="text-lg font-semibold mb-2">Upcoming Audits</h2>
        <ul className="space-y-1 text-sm">
          {upcomingAudits.map((audit, index) => (
            <li key={index} className="flex justify-between items-center bg-gray-50 rounded-lg p-2">
              <span>{audit.description}</span>
              <span className="bg-blue-200 text-blue-800 text-xs font-medium px-2 py-0.5 rounded-full">
                {audit.date}
              </span>
            </li>
          ))}
        </ul>
      </motion.div>

      {/* Incident Severity (Pie Chart) */}
      <motion.div
        className="bg-white rounded-lg h-[300px] shadow-lg p-4"
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <h2 className="text-lg font-semibold mb-2">Incident Severity</h2>
        <Pie data={incidentSeverityData} />
      </motion.div>

      {/* Incident Reporting */}
      <motion.div
        className="bg-white rounded-lg shadow-lg p-4"
        initial="hidden"
        animate="visible"
        variants={fadeIn}
      >
        <h2 className="text-lg font-semibold mb-2">Incident Reporting</h2>
        <ul className="space-y-1 text-sm">
          {incidents.map((incident, index) => (
            <li key={index} className="flex justify-between items-center bg-gray-50 rounded-lg p-2">
              <span>{incident.name}</span>
              <span
                className={`text-xs px-2 py-0.5 rounded-full ${
                  incident.severity === 'Critical'
                    ? 'bg-red-200 text-red-800'
                    : incident.severity === 'High'
                    ? 'bg-yellow-200 text-yellow-800'
                    : 'bg-green-200 text-green-800'
                }`}
              >
                {incident.severity}
              </span>
            </li>
          ))}
        </ul>
      </motion.div>

      {/* Maturity Level Progress (Bar Chart) */}
      <motion.div
        className="bg-white rounded-lg shadow-lg p-4"
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <h2 className="text-lg font-semibold mb-2">Maturity Level Progress</h2>
        <Bar data={maturityProgressData} />
      </motion.div>

      {/* Vendor Compliance */}
      <motion.div
        className="bg-white rounded-lg shadow-lg p-4"
        initial="hidden"
        animate="visible"
        variants={fadeIn}
      >
        <h2 className="text-lg font-semibold mb-2">Vendor Compliance</h2>
        <ul className="space-y-1 text-sm">
          {vendorCompliance.map((vendor, index) => (
            <li key={index} className="flex justify-between items-center bg-gray-50 rounded-lg p-2">
              <span>{vendor.name}</span>
              <span
                className={`text-xs px-2 py-0.5 rounded-full ${
                  vendor.status === 'Compliant'
                    ? 'bg-green-200 text-green-800'
                    : 'bg-red-200 text-red-800'
                }`}
              >
                {vendor.status}
              </span>
            </li>
          ))}
        </ul>
      </motion.div>

      {/* Document & Evidence Management */}
      <motion.div
        className="bg-white rounded-lg shadow-lg p-4"
        initial={{ x: 50, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <h2 className="text-lg font-semibold mb-2">Document & Evidence Management</h2>
        <ul className="space-y-1 text-sm">
          {documents.map((document, index) => (
            <li
              key={index}
              className="flex justify-between items-center bg-gray-50 rounded-lg p-2"
            >
              <span>{document.name}</span>
              <a href={document.link} className="text-blue-600 hover:underline">
                Download
              </a>
            </li>
          ))}
        </ul>
      </motion.div>

      {/* User Activity Log */}
      <motion.div
        className="bg-white rounded-lg shadow-lg p-4"
        initial="hidden"
        animate="visible"
        variants={fadeIn}
      >
        <h2 className="text-lg font-semibold mb-2">User Activity Log</h2>
        <ul className="space-y-1 text-sm">
          {userActivityLog.map((activity, index) => (
            <li
              key={index}
              className="flex justify-between items-center bg-gray-50 rounded-lg p-2"
            >
              <span>{activity.action}</span>
              <span className="text-gray-500 text-xs">{activity.time}</span>
            </li>
          ))}
        </ul>
      </motion.div>
    </div>
  );
};

export default DemoDashboard;
