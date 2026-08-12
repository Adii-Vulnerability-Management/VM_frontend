import React, { useState } from "react";

const TooltipCell = ({ text }) => {
  const [showTooltip, setShowTooltip] = useState(false);

  // Function to toggle tooltip visibility
  const handleToggle = (state) => setShowTooltip(state);

  // Function to add ellipsis if text exceeds a certain length
  const addEllipsis = (text, maxLength, wordsToDisplay) => {
    if (text && text.length > maxLength) {
      const words = text.split(" ");
      const truncatedText = words.slice(0, wordsToDisplay).join(" ");
      return truncatedText + (words.length > wordsToDisplay ? "..." : "");
    }
    return text;
  };

  return (
    <td
      className="whitespace-nowrap overflow-hidden text-ellipsis max-w-xs text-left relative"
      onMouseEnter={() => handleToggle(true)}
      onMouseLeave={() => handleToggle(false)}
      style={{ cursor: "pointer" }}
    >
      <div>{addEllipsis(text, 30, 3)}</div>
      
      {showTooltip && (
        <div className="absolute bg-white text-black border border-gray-400 rounded p-2 shadow-md z-10">
          {text}
        </div>
      )}
    </td>
  );
};

export default TooltipCell;
