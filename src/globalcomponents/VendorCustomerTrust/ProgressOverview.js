// ProgressOverview.jsx
import React from "react";

const ProgressOverview = ({ total, answered, pending, reviewed, rejected }) => {
  // Build the statistics array with labels, values, colors, and icons.
  // (You can adjust the icon choices to match your brand or needs.)
  const stats = [
    {
      label: "Total",
      value: total,
      color: "#2B245C", // Tailwind 'gray-500'
    },
    {
      label: "Answered",
      value: answered,
      color: "#3B82F6", // Tailwind 'blue-500'
    },
    {
      label: "In Progress",
      value: pending,
      color: "#10B981", // Tailwind 'green-500'
    },
    {
      label: "Reviewed",
      value: reviewed,
      color: "#F59E0B", // Tailwind 'amber-500' or close to orange
    },
    {
      label: "Rejected",
      value: rejected,
      color: "#EF4444", // Tailwind 'red-500'
    },
  ];

  // Function to calculate the percentage for each stat.
  const getPercentage = (value) =>
    total > 0 ? Math.round((value / total) * 100) : 0;

  return (
    <div className="flex flex-col items-center bg-gray-50 p-6 rounded-lg shadow-lg">
      <h3 className="text-lg font-bold text-[#2B245C] mb-5 uppercase tracking-wide">
        Progress Overview
      </h3>
      <div className="flex flex-wrap justify-center gap-8">
        {stats.map((item, index) => (
          <div key={index} className="flex flex-col items-center">
            {/* Circle Container */}
            <div className="relative w-24 h-24">
              <svg className="w-full h-full">
                {/* Background Circle */}
                <circle
                  cx="50%"
                  cy="50%"
                  r="40"
                  stroke="#E5E7EB"
                  strokeWidth="8"
                  fill="none"
                />
                {/* Foreground Circle */}
                <circle
                  cx="50%"
                  cy="50%"
                  r="40"
                  stroke={item.color}
                  strokeWidth="8"
                  fill="none"
                  strokeDasharray="251.2"
                  strokeDashoffset={251.2 - (item.value / total) * 251.2}
                  strokeLinecap="round"
                  style={{
                    transform: "rotate(-90deg)",
                    transformOrigin: "50% 50%",
                    transition: "stroke-dashoffset 0.5s ease-out",
                  }}
                />
              </svg>
              {/* Center content: icon, value, and percentage */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-xl font-semibold text-gray-800">
                  {item.value}
                </span>
                <span className="text-sm text-gray-500">
                  {getPercentage(item.value)}%
                </span>
              </div>
            </div>
            {/* Label */}
            <p className="mt-4 text-sm font-medium text-gray-700">
              {item.label}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProgressOverview;
