'use client';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import CustomAxios from '@/globalcomponents/CustomAxios';
import { baseurl, initURL } from '../../../BaseUrl';

export default function AddAssetTab() {
  const [assetClasses, setAssetClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [assetName, setAssetName] = useState('');

  useEffect(() => {
    // Fetch available asset classes
    const fetchAssetClasses = async () => {
      try {
        const res = await CustomAxios.get(`${baseurl}/${initURL}/risk-assessment/utility`);
        setAssetClasses(res.data.assetClassData || []);
      } catch (error) {
        toast.error('Failed to load asset classes');
      }
    };

    fetchAssetClasses();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedClass || !assetName) {
      toast.error('Please select asset class and enter asset name');
      return;
    }

    try {
      const selected = assetClasses.find((cls) => cls.assetClassName === selectedClass);
      const functionID = selected?._id;

      if (!functionID) {
        toast.error('Asset class not found');
        return;
      }

      const res = await CustomAxios.patch(
        `${baseurl}/${initURL}/risk-assessment/utility/${functionID}`,
        { assetName }
      );

      toast.success(res.data.message || 'Asset added successfully!');
      setAssetName('');
      setSelectedClass('');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error adding asset');
    }
  };

  return (
    <div className="p-6 border rounded-lg bg-gray-50 shadow-md">
      <h2 className="text-xl font-semibold mb-4">Add Asset</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Select Asset Class</label>
          <select
            className="w-full p-2 border rounded"
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            required
          >
            <option value="">-- Select --</option>
            {assetClasses.map((item) => (
              <option key={item._id} value={item.assetClassName}>
                {item.assetClassName}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Asset Name</label>
          <input
            type="text"
            className="w-full p-2 border rounded"
            value={assetName}
            onChange={(e) => setAssetName(e.target.value)}
            placeholder="Enter asset name"
            required
          />
        </div>

        <button className="bg-[#2B245C] text-white px-4 py-2 rounded hover:bg-[#1d193f]">
          Add Asset
        </button>
      </form>
    </div>
  );
}


// "use client";
// import React from "react";

// const AssetTab = ({
//   editFormData,
//   assetClassList,
//   handleAssetClassInputChange,
//   AssetUpdateUtilityHandler,
// }) => {
//   return (
//     <form
//       className="p-6 border rounded-lg bg-gray-50 shadow-md"
//       onSubmit={handleSubmit}
//     >
//       <div className="mb-4">
//         <div className="mb-4">
//           <label className="block text-sm font-medium text-gray-700 mb-2">
//             Select Asset Class
//           </label>
//           <select
//             name="assetClassName"
//             className="w-full p-2 border border-gray-300 rounded-md"
//             value={editFormData.assetClassName ?? ""}
//             onChange={handleAssetClassInputChange}
//             required
//           >
//             <option value="">Select Asset Class</option>
//             {assetClassList?.map((utility, i) => (
//               <option key={i} value={utility.assetClassName}>
//                 {utility.assetClassName}
//               </option>
//             ))}
//           </select>
//         </div>

//         <label className="block text-sm font-medium text-gray-700 mb-2">
//           Asset Name
//         </label>
//         <input
//           type="text"
//           name="assetName"
//           className="w-full p-2 border border-gray-300 rounded-md"
//           placeholder="Enter Asset Name"
//           value={editFormData.assetName ?? ""}
//           onChange={handleAssetClassInputChange}
//           required
//         />
//       </div>

//       <button
//         type="submit"
//         className="btn-primary text-white px-4 py-2 rounded"
//       >
//         Add Asset
//       </button>
//     </form>
//   );
// };

// export default AssetTab;
