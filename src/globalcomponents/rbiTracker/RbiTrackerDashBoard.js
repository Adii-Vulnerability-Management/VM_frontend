import BranchDetails from "@/globalcomponents/rbiTracker/BranchDetails";
import DepartmentDetails from "@/globalcomponents/rbiTracker/DepartmentDetails";
import React, { useState } from "react";


const Dashboard = () => {
  const [showBranchDetails, setShowBranchDetails] = useState(true);

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-[#2B245C]">
          {showBranchDetails ? "Branch Details" : "Department Details"}
        </h1>
        <button
          onClick={() => setShowBranchDetails((prev) => !prev)}
          className="bg-[#1e284e] text-white px-4 py-2 rounded-full"
        >
          {showBranchDetails ? "Show Department Details" : "Show Branch Details"}
        </button>
      </div>
      {showBranchDetails ? <BranchDetails /> : <DepartmentDetails />}
    </div>
  );
};

export default Dashboard;
