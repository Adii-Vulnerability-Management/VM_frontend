import React from "react";

const Tooltip = ({ children, content, position = "top" }) => {
  const positionClasses = {
    top: "bottom-full left-1/2 transform -translate-x-1/2 mb-2",
    bottom: "top-full left-1/2 transform -translate-x-1/2 mt-2",
    left: "right-full top-1/2 transform -translate-y-1/2 mr-2",
    right: "left-full top-1/2 transform -translate-y-1/2 ml-2",
  };

  return (
    <div className="relative group">
      {children}
      <div
        className={`absolute ${positionClasses[position]} hidden group-hover:flex items-center bg-gray-800 text-white text-sm rounded px-2 py-1 shadow-lg whitespace-nowrap z-50`}
      >
        {content}
      </div>
    </div>
  );
};

export default Tooltip;