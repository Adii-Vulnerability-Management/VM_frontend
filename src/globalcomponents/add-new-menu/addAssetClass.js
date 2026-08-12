'use client';
import { useState } from 'react';
import { toast } from 'react-toastify';
import CustomAxios from '@/globalcomponents/CustomAxios';
import { baseurl, initURL } from '../../../BaseUrl';

export default function AddAssetClassTab() {
  const [assetClassName, setAssetClassName] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await CustomAxios.post(
        `${baseurl}/${initURL}/risk-assessment/utility`,
        { assetClassName }
      );
      toast.success(res.data.message || 'Asset Class added!');
      setAssetClassName('');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error adding asset class');
    }
  };

  return (
    <div className="p-6 border rounded-lg bg-gray-50 shadow-md">
      <h2 className="text-xl font-semibold mb-4">Add Asset Class</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          className="w-full p-2 border rounded mb-4"
          placeholder="Enter asset class name"
          value={assetClassName}
          onChange={(e) => setAssetClassName(e.target.value)}
          required
        />
        <button className="bg-[#2B245C] text-white px-4 py-2 rounded hover:bg-[#1d193f]">
          Add Asset Class
        </button>
      </form>
    </div>
  );
}


// "use client";
// import React from "react";

// const AssetClassTab = ({
//   formData,
//   functionOnChange,
//   submitHandler,
//   handleShow,
// }) => {
//   return (
//     <form
//       className="p-6 border rounded-lg bg-gray-50 shadow-md"
//       onSubmit={handleSubmit}
//     >
//       <div className="mb-4">
//         <label className="block text-sm font-medium text-gray-700 mb-2">
//           Asset Class Name
//         </label>
//         <input
//           type="text"
//           name="assetClassName"
//           className="w-full p-2 border border-gray-300 rounded-md"
//           placeholder="Enter Asset Class Name"
//           value={formData.assetClassName ?? ""}
//           onChange={functionOnChange}
//         />
//       </div>

//       <div className="flex space-x-4">
//         <button
//           type="submit"
//           className="btn-primary text-white px-4 py-2 rounded"
//         >
//           Add Asset Class
//         </button>
//         <button
//           type="button"
//           className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
//           onClick={() => handleShow(true, "assetClass")}
//         >
//           Upload Existing List
//         </button>
//       </div>
//     </form>
//   );
// };

// export default AssetClassTab;
