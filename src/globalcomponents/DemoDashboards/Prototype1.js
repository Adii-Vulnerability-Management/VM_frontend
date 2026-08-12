import React from 'react';
import { Line, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  ArcElement,
  Tooltip,
} from 'chart.js';
import { motion } from 'framer-motion';
import { FaCheck, FaShieldAlt, FaCalendarCheck } from 'react-icons/fa';

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, ArcElement, Tooltip);

const Prototype1 = () => {
  // Dummy Data for Metrics and Graphs
  const complianceTrends = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'],
    datasets: [
      {
        label: 'Compliance Rate',
        data: [75, 80, 85, 88, 90, 95, 96, 97, 99],
        fill: true,
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.2)',
        tension: 0.4,
      },
    ],
  };

  const maturityData = {
    labels: ['Completed', 'Pending'],
    datasets: [
      {
        data: [80, 20],
        backgroundColor: ['#10b981', '#e5e7eb'],
        hoverBackgroundColor: ['#059669', '#d1d5db'],
      },
    ],
  };

  const metrics = [
    { title: 'Total Audits', value: 32, icon: <FaCheck className="h-6 w-6 text-blue-500" /> },
    { title: 'Open Incidents', value: 12, icon: <FaShieldAlt className="h-6 w-6 text-red-500" /> },
    { title: 'Data Protection', value: 'Secure', icon: <FaShieldAlt className="h-6 w-6 text-green-500" /> },
    { title: 'Upcoming Audits', value: 4, icon: <FaCalendarCheck className="h-6 w-6 text-yellow-500" /> },
  ];

  const actionItems = [
    { title: 'Initiate Audit', icon: <FaCheck className="h-5 w-5 text-blue-500" /> },
    { title: 'View Incidents', icon: <FaShieldAlt className="h-5 w-5 text-red-500" /> },
    { title: 'Data Policies', icon: <FaShieldAlt className="h-5 w-5 text-green-500" /> },
    { title: 'Compliance Summary', icon: <FaCalendarCheck className="h-5 w-5 text-yellow-500" /> },
  ];

  return (
    <div className="container mx-auto p-6 grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 h-screen">
      {/* Overview Metrics */}
      {metrics.map((metric, index) => (
        <motion.div
          key={index}
          className="flex items-center bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: index * 0.1 }}
        >
          <div className="p-3 bg-blue-50 rounded-full mr-4">{metric.icon}</div>
          <div>
            <h3 className="text-2xl font-bold text-gray-800">{metric.value}</h3>
            <p className="text-gray-500 text-sm">{metric.title}</p>
          </div>
        </motion.div>
      ))}

      {/* Compliance Trends Line Graph */}
      <motion.div
        className="bg-white rounded-lg shadow-lg p-6 col-span-1 md:col-span-2"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-lg font-semibold mb-4">Compliance Trends</h2>
        <Line data={complianceTrends} />
      </motion.div>

      {/* Security Maturity Gauge */}
      <motion.div
        className="bg-white rounded-lg shadow-lg p-6 col-span-1"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-lg font-semibold mb-4">Security Maturity Level</h2>
        <Doughnut data={maturityData} options={{ cutout: '80%' }} />
        <div className="text-center mt-4">
          <p className="text-3xl font-bold text-green-500">80%</p>
          <p className="text-gray-500 text-sm">Current Maturity</p>
        </div>
      </motion.div>

      {/* Action Items */}
      <motion.div
        className="bg-white rounded-lg shadow-lg p-6 col-span-1 md:col-span-2"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 gap-4">
          {actionItems.map((item, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-blue-50 transition-colors cursor-pointer"
            >
              <div className="flex items-center">
                {item.icon}
                <span className="ml-2 text-gray-800 font-medium">{item.title}</span>
              </div>
              <FaCheck className="text-gray-300 h-5 w-5" />
            </div>
          ))}
        </div>
      </motion.div>

      {/* Interactive Calendar */}
      <motion.div
        className="bg-white rounded-lg shadow-lg p-6 col-span-1"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-lg font-semibold mb-4">Audit Calendar</h2>
        <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold">
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
            <span key={index} className="text-gray-400">{day}</span>
          ))}
          {/* Highlighted Dates */}
          {Array.from({ length: 30 }, (_, i) => (
            <motion.div
              key={i}
              className={`p-2 rounded-full ${
                [5, 12, 19].includes(i + 1) ? 'bg-yellow-200 text-yellow-800' : 'text-gray-700'
              } hover:bg-blue-100 transition-colors`}
              title={ [5, 12, 19].includes(i + 1) ? 'Audit Scheduled' : ''}
            >
              {i + 1}
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default Prototype1;
