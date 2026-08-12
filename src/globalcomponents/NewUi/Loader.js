import React from "react";

const SIZE_MAP = {
  sm: "w-6 h-6",
  md: "w-12 h-12",
  lg: "w-16 h-16",
};

export default function Loader({
  variant = "md",
  fullScreen = false,
  message = "Loading",
  className = "",
}) {
  const spinner = (
    <div
      className={`
        animate-spin rounded-full border-4
        border-[#2B245C] border-t-[#050038]
        ${SIZE_MAP[variant] || SIZE_MAP.md}
        ${className}
      `}
    />
  );

  const label = (
    <div className="mt-2 text-sm text-[#050038] font-medium">{message}...</div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black bg-opacity-50">
        {spinner}
        {label}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center">
      {spinner}
      {label}
    </div>
  );
}
