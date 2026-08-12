import React, { useState } from "react";

const TooltipCell = ({ text }) => {
  const [showTooltip, setShowTooltip] = useState(false);
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
      className="whitespace-nowrap overflow-hidden text-ellipsis max-w-[250px] text-left"
    >
      <div
        className="relative cursor-pointer"
        onMouseEnter={() => handleToggle(true)}
        onMouseLeave={() => handleToggle(false)}
      >
        {addEllipsis(text, 30, 3)}
        {showTooltip && (
          <div className="absolute left-0 bg-white text-black border border-gray-300 p-2 rounded shadow-lg z-10">
            {text}
          </div>
        )}
      </div>
    </td>
  );
};

export default TooltipCell;
