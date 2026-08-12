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
import { FaFileAlt, FaExclamationCircle, FaCalendarAlt, FaCheckCircle, FaFileDownload } from 'react-icons/fa';

ChartJS.register(ArcElement, CategoryScale, LinearScale, BarElement, Tooltip, Legend);

const Dashboard = () => {
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

  return (
    <div className="container mx-auto p-6 grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3 text-gray-800">
      <h1 className="col-span-full text-3xl font-bold text-center mb-6 text-blue-600">TISAX Compliance Dashboard</h1>

      {/* Compliance Overview */}
      <div className="bg-white rounded-lg shadow-lg p-5 text-center border-l-4 border-blue-500">
        <h2 className="text-lg font-semibold mb-4">Compliance Overview</h2>
        {complianceStatus.map((status, index) => (
          <div key={index} className="mb-2">
            <h5 className="font-medium text-gray-600">{status.category}</h5>
            <div className="w-full bg-gray-200 rounded-full h-4 mb-1">
              <div
                className="bg-blue-500 h-4 rounded-full text-center text-white text-xs leading-none"
                style={{ width: `${status.progress}%` }}
              >
                {status.progress}%
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Incident Severity */}
      <div className="bg-white rounded-lg shadow-lg p-5 text-center h-auto border-l-4 border-red-500">
        <h2 className="text-lg font-semibold mb-4">Incident Severity</h2>
        <Pie data={incidentSeverityData} />
      </div>

      {/* Upcoming Audits */}
      <div className="bg-white rounded-lg shadow-lg p-5 text-center border-l-4 border-green-500">
        <h2 className="text-lg font-semibold mb-4">Upcoming Audits</h2>
        <ul className="space-y-3">
          {upcomingAudits.map((audit, index) => (
            <li key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded-md shadow-sm">
              <FaCalendarAlt className="text-blue-500" />
              <div>{audit.description}</div>
              <span className="text-blue-500 font-medium text-sm">{audit.date}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Maturity Level Progress */}
      <div className="bg-white rounded-lg shadow-lg p-5 text-center border-l-4 border-yellow-500">
        <h2 className="text-lg font-semibold mb-4">Maturity Level Progress</h2>
        <Bar data={maturityProgressData} />
      </div>

      {/* Incident Reporting */}
      <div className="bg-white rounded-lg shadow-lg p-5 text-center border-l-4 border-purple-500">
        <h2 className="text-lg font-semibold mb-4">Incident Reporting</h2>
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b">
              <th className="py-2">Incident</th>
              <th className="py-2">Severity</th>
              <th className="py-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {incidents.map((incident, index) => (
              <tr key={index} className="border-b">
                <td className="py-2">{incident.name}</td>
                <td className="py-2">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                      incident.severity === 'Critical' ? 'bg-red-200 text-red-800' :
                      incident.severity === 'High' ? 'bg-yellow-200 text-yellow-800' :
                      'bg-green-200 text-green-800'
                    }`}>
                    {incident.severity}
                  </span>
                </td>
                <td className="py-2">{incident.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Vendor Compliance */}
      <div className="bg-white rounded-lg shadow-lg p-5 text-center border-l-4 border-teal-500">
        <h2 className="text-lg font-semibold mb-4">Vendor Compliance</h2>
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b">
              <th className="py-2">Vendor</th>
              <th className="py-2">Status</th>
              <th className="py-2">Risk</th>
            </tr>
          </thead>
          <tbody>
            {vendorCompliance.map((vendor, index) => (
              <tr key={index} className="border-b">
                <td className="py-2">{vendor.name}</td>
                <td className="py-2">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                      vendor.status === 'Compliant' ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'
                    }`}>
                    {vendor.status}
                  </span>
                </td>
                <td className="py-2">{vendor.riskLevel}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Document Management */}
      <div className="bg-white rounded-lg shadow-lg p-5 text-center border-l-4 border-indigo-500">
        <h2 className="text-lg font-semibold mb-4">Document Management</h2>
        <ul className="space-y-3">
          {documents.map((document, index) => (
            <li key={index} className="flex justify-between items-center bg-gray-50 p-3 rounded-md shadow-sm">
              <FaFileAlt className="text-indigo-500" />
              <span>{document.name}</span>
              <a href={document.link} className="text-indigo-600 hover:underline">
                <FaFileDownload className="inline mr-1" />Download
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Dashboard;
