'use client';
import { useState } from 'react';
import CustomAxios from '@/globalcomponents/CustomAxios';
import { toast } from 'react-toastify';
import { baseurl, initURL } from '../../../BaseUrl';

export default function AddProcess() {
  const [processName, setProcessName] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await CustomAxios.post(
        `${baseurl}/${initURL}/risk-assessment/utility`,
        { processName }
      );
      toast.success(res.data.message || 'Process added successfully!');
      setProcessName('');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error adding process');
    }
  };

  return (
    <div className="p-6 border rounded-lg bg-gray-50 shadow-md">
      <h2 className="text-xl font-semibold mb-4">Add Process</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          className="w-full p-2 border rounded mb-4"
          placeholder="Enter process name"
          value={processName}
          onChange={(e) => setProcessName(e.target.value)}
          required
        />
        <button className="bg-[#2B245C] text-white px-4 py-2 rounded hover:bg-[#1d193f]">
          Add Process
        </button>
      </form>
    </div>
  );
}


// "use client";
// import React from "react";

// const ProcessTab = ({ handleShow }) => {
//   const [threatName, setThreatName] = useState("");

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     try {
//       const response = await CustomAxios.post(
//         `${baseurl}/${initURL}/risk-assessment/utility`,
//         { threatName }
//       );
//       toast.success(response.data.message || "Process added successfully!");
//       setThreatName("");
//     } catch (error) {
//       toast.error(
//         error.response?.data?.message || "Error adding process"
//       );
//     }
//   };

//   return (
//     <form
//       className="p-6 border rounded-lg bg-gray-50 shadow-md"
//       onSubmit={handleSubmit}
//     >
//       <div className="mb-4">
//         <label className="block text-sm font-medium text-gray-700 mb-2">
//           Process Name
//         </label>
//         <input
//           type="text"
//           name="processName"
//           className="w-full p-2 border border-gray-300 rounded-md focus:ring-purple-600 focus:border-purple-600"
//           placeholder="Enter Process Name"
//           value={formData.processName ?? ""}
//           onChange={functionOnChange}
//           required
//         />
//       </div>

//       <div className="flex space-x-4">
//         <button
//           type="submit"
//           className="btn-primary btn-primary:hover text-white px-4 py-2 rounded"
//         >
//           Add Process
//         </button>
//         <button
//           type="button"
//           className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300"
//           onClick={() => handleShow(true, "process")}
//         >
//           Upload Existing List
//         </button>
//       </div>
//     </form>
//   );
// };

// export default ProcessTab;
