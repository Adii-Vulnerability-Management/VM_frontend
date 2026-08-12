'use client';
import { useState } from 'react';
import { toast } from 'react-toastify';
import CustomAxios from '@/globalcomponents/CustomAxios';
import { baseurl, initURL } from '../../../BaseUrl';
import { saveAs } from "file-saver";
import * as XLSX from "xlsx";

export default function AddControlTab() {
  const [form, setForm] = useState({
    controlFunction: '',
    controlArea: '',
    controlId: '',
    controlTitle: '',
    controlDetails: '',
    controlExplanation: '',
  });

  const [showUploadModal, setShowUploadModal] = useState(false);
  const [excelData, setExcelData] = useState(null);
  const [bulkField, setBulkField] = useState('controls');

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await CustomAxios.post(
        `${baseurl}/${initURL}/risk-assessment/control`,
        form
      );
      toast.success('Control added successfully!');
      setForm({
        controlFunction: '',
        controlArea: '',
        controlId: '',
        controlTitle: '',
        controlDetails: '',
        controlExplanation: '',
      });
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to add control');
    }
  };

  const handleFileUpload = async (e) => {
    e.preventDefault();
    try {
      const response = await CustomAxios.post(
        `${baseurl}/${initURL}/risk-assessment/control/bulk`,
        excelData
      );
      toast.success('Controls uploaded successfully!');
      setShowUploadModal(false);
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to upload controls');
    }
  };

  const generateDemoExcel = () => {
    const demoData = [{
      "Control Function": "Sample Function",
      "Control Area": "Sample Area",
      "Control ID": "CTRL-001",
      "Control Title": "Sample Title",
      "Control Details": "Sample Details",
      "Control Explanation": "Sample Explanation"
    }];

    const ws = XLSX.utils.json_to_sheet(demoData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Controls");
    const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'binary' });
    const blob = new Blob([s2ab(wbout)], { type: 'application/octet-stream' });
    saveAs(blob, 'controls_template.xlsx');
  };

  const s2ab = (s) => {
    const buf = new ArrayBuffer(s.length);
    const view = new Uint8Array(buf);
    for (let i = 0; i < s.length; i++) view[i] = s.charCodeAt(i) & 0xFF;
    return buf;
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: 'array' });
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);
      
      const transformed = jsonData.map(item => ({
        controlFunction: item['Control Function'],
        controlArea: item['Control Area'],
        controlId: item['Control ID'],
        controlTitle: item['Control Title'],
        controlDetails: item['Control Details'],
        controlExplanation: item['Control Explanation']
      }));
      
      setExcelData(transformed);
    };
    
    reader.readAsArrayBuffer(file);
  };

  return (
    <div className="p-6 border rounded-lg bg-gray-50 shadow-md">
      <h2 className="text-xl font-semibold mb-4">Add Control</h2>
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <input
            type="text"
            name="controlFunction"
            className="w-full p-2 border rounded"
            placeholder="Control Function"
            value={form.controlFunction}
            onChange={handleChange}
            required
          />
          <input
            type="text"
            name="controlArea"
            className="w-full p-2 border rounded"
            placeholder="Control Area"
            value={form.controlArea}
            onChange={handleChange}
            required
          />
          <input
            type="text"
            name="controlId"
            className="w-full p-2 border rounded"
            placeholder="Control ID"
            value={form.controlId}
            onChange={handleChange}
            required
          />
          <input
            type="text"
            name="controlTitle"
            className="w-full p-2 border rounded"
            placeholder="Control Title"
            value={form.controlTitle}
            onChange={handleChange}
            required
          />
        </div>

        <textarea
          name="controlDetails"
          className="w-full p-2 border rounded mb-4"
          placeholder="Control Details"
          value={form.controlDetails}
          onChange={handleChange}
          required
        />
        <textarea
          name="controlExplanation"
          className="w-full p-2 border rounded mb-4"
          placeholder="Control Explanation"
          value={form.controlExplanation}
          onChange={handleChange}
          required
        />

        <div className="flex gap-4">
          <button
            type="submit"
            className="bg-[#2B245C] hover:bg-[#1d193f] text-white px-4 py-2 rounded"
          >
            Add Control
          </button>
          
          <button
            type="button"
            className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded"
            onClick={() => setShowUploadModal(true)}
          >
            Upload Existing List
          </button>
        </div>
      </form>

      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-96">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Upload Controls</h3>
              <button 
                onClick={() => setShowUploadModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4">
              <button
                type="button"
                onClick={generateDemoExcel}
                className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
              >
                Download Template
              </button>
              
              <label className="block w-full text-center cursor-pointer border-2 border-dashed border-gray-300 p-4 rounded">
                <input
                  type="file"
                  onChange={handleFileChange}
                  className="hidden"
                  accept=".xlsx, .xls"
                />
                📁 Upload Excel File
                {excelData && <span className="block mt-2 text-sm text-gray-500">{excelData.length} records found</span>}
              </label>
              
              {excelData && (
                <button
                  type="button"
                  onClick={handleFileUpload}
                  className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700"
                >
                  Upload {excelData.length} Controls
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// "use client";
// import React from "react";

// const ControlTab = ({
//   controlFormData,
//   handleControlInputChange,
//   controlSubmitHandler,
//   handleShow,
// }) => {
//   return (
//     <form
//       className="p-6 border rounded-lg bg-gray-50 shadow-md max-w-4xl mx-auto"
//       onSubmit={handleSubmit}
//     >
//       <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
//         <div>
//           <label className="block text-sm font-medium text-gray-700 mb-2">
//             Control Function
//           </label>
//           <input
//             type="text"
//             name="controlFunction"
//             className="w-full p-2 border border-gray-300 rounded-md"
//             placeholder="Enter Control Function"
//             value={controlFormData.controlFunction ?? ""}
//             onChange={handleControlInputChange}
//             required
//           />
//         </div>

//         <div>
//           <label className="block text-sm font-medium text-gray-700 mb-2">
//             Control Area
//           </label>
//           <input
//             type="text"
//             name="controlArea"
//             className="w-full p-2 border border-gray-300 rounded-md"
//             placeholder="Enter Control Area"
//             value={controlFormData.controlArea ?? ""}
//             onChange={handleControlInputChange}
//             required
//           />
//         </div>

//         <div>
//           <label className="block text-sm font-medium text-gray-700 mb-2">
//             Control ID
//           </label>
//           <input
//             type="text"
//             name="controlId"
//             className="w-full p-2 border border-gray-300 rounded-md"
//             placeholder="Control ID"
//             value={controlFormData.controlId ?? ""}
//             onChange={handleControlInputChange}
//             required
//           />
//         </div>

//         <div>
//           <label className="block text-sm font-medium text-gray-700 mb-2">
//             Control Title
//           </label>
//           <input
//             type="text"
//             name="controlTitle"
//             className="w-full p-2 border border-gray-300 rounded-md"
//             placeholder="Enter Control Title"
//             value={controlFormData.controlTitle ?? ""}
//             onChange={handleControlInputChange}
//             required
//           />
//         </div>
//       </div>

//       <div className="mb-6">
//         <label className="block text-sm font-medium text-gray-700 mb-2">
//           Control Details
//         </label>
//         <textarea
//           name="controlDetails"
//           className="w-full p-2 border border-gray-300 rounded-md"
//           placeholder="Enter Control Details"
//           value={controlFormData.controlDetails ?? ""}
//           onChange={handleControlInputChange}
//           required
//         />
//       </div>

//       <div className="mb-6">
//         <label className="block text-sm font-medium text-gray-700 mb-2">
//           Control Explanation
//         </label>
//         <textarea
//           name="controlExplanation"
//           className="w-full p-2 border border-gray-300 rounded-md"
//           placeholder="Enter Control Explanation"
//           value={controlFormData.controlExplanation ?? ""}
//           onChange={handleControlInputChange}
//           required
//         />
//       </div>

//       <div className="flex flex-col md:flex-row justify-start md:space-x-4">
//         <button
//           type="submit"
//           className="btn-primary text-white px-4 py-2 rounded w-full md:w-auto mb-4 md:mb-0"
//         >
//           Add Control
//         </button>
//         <button
//           type="button"
//           className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300 w-full md:w-auto"
//           onClick={() => handleShow(true, "controls")}
//         >
//           Upload Existing List
//         </button>
//       </div>
//     </form>
//   );
// };

// export default ControlTab;
