'use client';
import { useState, useEffect } from 'react';
import CustomAxios from '@/globalcomponents/CustomAxios';
import { toast } from 'react-toastify';
import { baseurl, initURL } from '../../../BaseUrl';

export default function AddContext() {
  const [processList, setProcessList] = useState([]);
  const [selectedProcess, setSelectedProcess] = useState('');
  const [contextName, setContextName] = useState('');

  useEffect(() => {
    const fetchProcesses = async () => {
      try {
        const response = await CustomAxios.get(
          `${baseurl}/${initURL}/risk-assessment/utility`
        );
        toast.success(res.data.message || 'Context added successfully!');
        setProcessList(response.data.utilityData || []);
      } catch (error) {
        toast.error('Error fetching process list');
      }
    };

    fetchProcesses();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const selected = processList.find(p => p.processName === selectedProcess);

      const res = await CustomAxios.patch(
        `${baseurl}/${initURL}/risk-assessment/utility/${selected._id}`,
        { contextName }
      );

      toast.success('Context added successfully!');
      setSelectedProcess('');
      setContextName('');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error adding context');
    }
  };

  return (
    <div className="p-6 border rounded-lg bg-gray-50 shadow-md">
      <h2 className="text-xl font-semibold mb-4">Add Context</h2>
      <form onSubmit={handleSubmit}>
        <label className="block mb-2 font-medium text-gray-700">Select Process</label>
        <select
          value={selectedProcess}
          onChange={(e) => setSelectedProcess(e.target.value)}
          className="w-full p-2 border rounded mb-4"
          required
        >
          <option value="">-- Select --</option>
          {processList.map((p, i) => (
            <option key={i} value={p.processName}>
              {p.processName}
            </option>
          ))}
        </select>

        <input
          type="text"
          className="w-full p-2 border rounded mb-4"
          placeholder="Enter context name"
          value={contextName}
          onChange={(e) => setContextName(e.target.value)}
          required
        />

        <button className="bg-[#2B245C] text-white px-4 py-2 rounded hover:bg-[#1d193f]">
          Add Context
        </button>
      </form>
    </div>
  );
}


// "use client";
// import React from "react";

// const ContextTab = ({
//   editFormData,
//   assessmentUtilitiesList,
//   handleInputChange,
//   UpdateUtilityHandler,
// }) => {
//   return (
//     <form
//       className="p-6 border rounded-lg bg-gray-50 shadow-md"
//       onSubmit={handleSubmit}
//     >
//       <div className="mb-4">
//         <label className="block text-sm font-medium text-gray-700 mb-2">
//           Select Process
//         </label>
//         <select
//           name="processName"
//           className="w-full p-2 border border-gray-300 rounded-md focus:ring-purple-600 focus:border-purple-600"
//           value={editFormData.processName ?? ""}
//           onChange={handleInputChange}
//           required
//         >
//           <option value="">Select Process</option>
//           {assessmentUtilitiesList?.map((utility, i) => (
//             <option key={i} value={utility.processName}>
//               {utility.processName}
//             </option>
//           ))}
//         </select>
//       </div>

//       <div className="mb-4">
//         <label className="block text-sm font-medium text-gray-700 mb-2">
//           Context Name
//         </label>
//         <input
//           type="text"
//           name="contextName"
//           className="w-full p-2 border border-gray-300 rounded-md focus:ring-purple-600 focus:border-purple-600"
//           placeholder="Enter Context Name"
//           value={editFormData.contextName ?? ""}
//           onChange={handleInputChange}
//           required
//         />
//       </div>

//       <button
//         type="submit"
//         className="btn-primary text-white btn-primary:hover px-4 py-2 rounded"
//       >
//         Add Context
//       </button>
//     </form>
//   );
// };

// export default ContextTab;
