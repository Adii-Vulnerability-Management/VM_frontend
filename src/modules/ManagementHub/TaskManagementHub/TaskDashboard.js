// import React, { useState, useEffect } from "react";
// import { baseurl, initURL } from "../../../BaseUrl";
// import CustomAxios from "@/config/CustomAxios";
// import Loader from "../loader/Loader";
// import {
//   PieChart,
//   Pie,
//   Cell,
//   Tooltip,
//   Legend,
//   ResponsiveContainer,
//   BarChart,
//   Bar,
//   XAxis,
//   YAxis,
//   CartesianGrid,
//   LineChart,
//   Line,
// } from "recharts";

// export default function TaskDashboard() {
//   const [tasks, setTasks] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     const fetchTasks = async () => {
//       const endpoint = `${baseurl}/${initURL}/tasks`;

//       try {
//         const response = await CustomAxios.get(endpoint);
//         setTasks(response.data);
//         setLoading(false);
//       } catch (err) {
//         setError(err.message);
//         setLoading(false);
//       }
//     };

//     fetchTasks();
//   }, []);

//   if (loading) {
//     return (
//       <div className="flex items-center justify-center h-screen">
//         <Loader />
//       </div>
//     );
//   }

//   if (error) {
//     return <div className="text-center p-4 text-red-500">Error: {error}</div>;
//   }

//   // Task Summary Data
//   const totalTasks = tasks.length;
//   const completedTasks = tasks.filter(
//     (task) => task.status.toLowerCase() === "done"
//   ).length;
//   const pendingTasks = tasks.filter(
//     (task) => task.status.toLowerCase() === "to do"
//   ).length;
//   const inProgressTasks = tasks.filter(
//     (task) => task.status.toLowerCase() === "in progress"
//   ).length;
//   const highPriorityTasks = tasks.filter(
//     (task) => task.priority.toLowerCase() === "high"
//   ).length;

//   // Pie Chart Data
//   const pieChartData = [
//     { name: "Completed", value: completedTasks },
//     { name: "Pending", value: pendingTasks },
//     { name: "In Progress", value: inProgressTasks },
//   ];

//   const COLORS = ["#27AE60", "#E74C3C", "#F39C12"]; // Green, Red, Orange

//   // Bar Chart Data for Task Status Distribution
//   const barChartData = [
//     { name: "Completed", count: completedTasks },
//     { name: "Pending", count: pendingTasks },
//     { name: "In Progress", count: inProgressTasks },
//     { name: "High Priority", count: highPriorityTasks },
//   ];

//   // Line Chart Data for Task Trends (Example)
//   const lineChartData = [
//     { day: "Mon", completed: 5, pending: 8, inProgress: 3 },
//     { day: "Tue", completed: 7, pending: 6, inProgress: 4 },
//     { day: "Wed", completed: 9, pending: 4, inProgress: 5 },
//     { day: "Thu", completed: 12, pending: 3, inProgress: 7 },
//     { day: "Fri", completed: 15, pending: 2, inProgress: 6 },
//   ];

//   return (
//     <div className="min-h-screen bg-gray-100 p-8">
//       {/* Dashboard Title */}
//       <h1 className="text-4xl font-extrabold mb-8 text-center text-[#2C3E50]">
//         Task Tracking Dashboard
//       </h1>

//       {/* Summary Cards */}
//       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
//         <div className="bg-white p-6 shadow-md rounded-lg text-center">
//           <h2 className="text-lg font-semibold text-gray-700">Total Tasks</h2>
//           <p className="text-4xl font-bold text-blue-600">{totalTasks}</p>
//         </div>
//         <div className="bg-white p-6 shadow-md rounded-lg text-center">
//           <h2 className="text-lg font-semibold text-gray-700">Pending Tasks</h2>
//           <p className="text-4xl font-bold text-yellow-600">{pendingTasks}</p>
//         </div>
//         <div className="bg-white p-6 shadow-md rounded-lg text-center">
//           <h2 className="text-lg font-semibold text-gray-700">
//             Completed Tasks
//           </h2>
//           <p className="text-4xl font-bold text-green-600">{completedTasks}</p>
//         </div>
//         <div className="bg-white p-6 shadow-md rounded-lg text-center">
//           <h2 className="text-lg font-semibold text-gray-700">High Priority</h2>
//           <p className="text-4xl font-bold text-red-600">{highPriorityTasks}</p>
//         </div>
//       </div>

//       {/* Graphical Analytics Section */}
//       <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
//         {/* Task Distribution Pie Chart */}
//         <div className="bg-white p-6 shadow-md rounded-lg">
//           <h2 className="text-xl font-semibold text-gray-700 text-center mb-4">
//             Task Distribution
//           </h2>
//           <ResponsiveContainer width="100%" height={300}>
//             <PieChart>
//               <Pie
//                 data={pieChartData}
//                 cx="50%"
//                 cy="50%"
//                 label
//                 outerRadius={100}
//                 fill="#8884d8"
//                 dataKey="value"
//               >
//                 {pieChartData.map((entry, index) => (
//                   <Cell
//                     key={`cell-${index}`}
//                     fill={COLORS[index % COLORS.length]}
//                   />
//                 ))}
//               </Pie>
//               <Tooltip />
//               <Legend />
//             </PieChart>
//           </ResponsiveContainer>
//         </div>

//         {/* Task Status Bar Chart */}
//         <div className="bg-white p-6 shadow-md rounded-lg">
//           <h2 className="text-xl font-semibold text-gray-700 text-center mb-4">
//             Task Status Overview
//           </h2>
//           <ResponsiveContainer width="100%" height={300}>
//             <BarChart data={barChartData}>
//               <CartesianGrid strokeDasharray="3 3" />
//               <XAxis dataKey="name" />
//               <YAxis />
//               <Tooltip />
//               <Legend />
//               <Bar dataKey="count" fill="#3498DB" barSize={40} />
//             </BarChart>
//           </ResponsiveContainer>
//         </div>

//         {/* Task Trends Line Chart */}
//         <div className="col-span-1 lg:col-span-2 bg-white p-6 shadow-md rounded-lg">
//           <h2 className="text-xl font-semibold text-gray-700 text-center mb-4">
//             Task Completion Trends
//           </h2>
//           <ResponsiveContainer width="100%" height={300}>
//             <LineChart data={lineChartData}>
//               <CartesianGrid strokeDasharray="3 3" />
//               <XAxis dataKey="day" />
//               <YAxis />
//               <Tooltip />
//               <Legend />
//               <Line
//                 type="monotone"
//                 dataKey="completed"
//                 stroke="#2ECC71"
//                 strokeWidth={2}
//               />
//               <Line
//                 type="monotone"
//                 dataKey="pending"
//                 stroke="#F39C12"
//                 strokeWidth={2}
//               />
//               <Line
//                 type="monotone"
//                 dataKey="inProgress"
//                 stroke="#3498DB"
//                 strokeWidth={2}
//               />
//             </LineChart>
//           </ResponsiveContainer>
//         </div>
//       </div>
//     </div>
//   );
// }

import React from "react";

const TaskDashboard = () => {
  return (
    <div className="p-4">
      <div>
        <h2 className="text-2xl font-semibold text-[#2B245C]">Task Dashboard</h2>
      </div>
    </div>
  );
};

export default TaskDashboard;
