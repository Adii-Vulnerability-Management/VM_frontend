import React, { useState } from "react";
import { AiOutlineCheck } from "react-icons/ai";
import { FaTimes } from "react-icons/fa";

/**
 * CookieBot Component with customizable cookie settings
 */
const CookieBot = ({
  heading,
  description,
  headingColor,
  descriptionColor,
  acceptButtonBgColor,
  acceptTextColor,
  acceptHoverBgColor,
  acceptHoverTextColor,
  acceptBorderColor,
  rejectButtonBgColor,
  rejectTextColor,
  rejectHoverBgColor,
  rejectHoverTextColor,
  rejectBorderColor,
  customizeButtonBgColor,
  customizeTextColor,
  customizeHoverBgColor,
  customizeHoverTextColor,
  customizeBorderColor,
  backgroundColor,
}) => {
  const [showCustomize, setShowCustomize] = useState(false);

  // Function to toggle the visibility of the customize section
  const handleCustomizeClick = () => {
    setShowCustomize(!showCustomize);
  };


  return (
    <div
      className="flex flex-col items-center justify-center w-full p-4"
      style={{ backgroundColor: backgroundColor, borderTop: "1px solid #ddd" }}
    >
      <div className="flex-1">
        <h3 className="text-lg font-bold mb-2" style={{ color: headingColor }}>
          {heading}
        </h3>
        <p className="text-sm" style={{ color: descriptionColor }}>
          {description}
        </p>
      </div>

      {/* Buttons */}
      <div className="flex space-x-2 mt-6">
        {/* "Allow all" button */}
        <button
          className="px-4 py-2 rounded-md font-semibold inline-flex items-center space-x-2"
          style={{
            backgroundColor: acceptButtonBgColor,
            color: acceptTextColor,
            borderColor: acceptBorderColor,
            borderWidth: "1px",
          }}
          onMouseOver={(e) => {
            e.target.style.backgroundColor = acceptHoverBgColor;
            e.target.style.color = acceptHoverTextColor;
          }}
          onMouseOut={(e) => {
            e.target.style.backgroundColor = acceptButtonBgColor;
            e.target.style.color = acceptTextColor;
          }}
        >
          <AiOutlineCheck />
          <span>Accept all</span>
        </button>

        {/* "Customize settings" button */}
        <button
          className="px-4 py-2 rounded-md border"
          style={{
            backgroundColor: customizeButtonBgColor,
            color: customizeTextColor,
            borderColor: customizeBorderColor,
          }}
          onClick={handleCustomizeClick}
          onMouseOver={(e) => {
            e.target.style.backgroundColor = customizeHoverBgColor;
            e.target.style.color = customizeHoverTextColor;
          }}
          onMouseOut={(e) => {
            e.target.style.backgroundColor = customizeButtonBgColor;
            e.target.style.color = customizeTextColor;
          }}
        >
          Customize
        </button>

        {/* "Reject" button */}
        <button
          className="px-4 py-2 rounded-md border inline-flex items-center space-x-2"
          style={{
            backgroundColor: rejectButtonBgColor,
            color: rejectTextColor,
            borderColor: rejectBorderColor,
            borderWidth: "1px",
          }}
          onMouseOver={(e) => {
            e.target.style.backgroundColor = rejectHoverBgColor;
            e.target.style.color = rejectHoverTextColor;
          }}
          onMouseOut={(e) => {
            e.target.style.backgroundColor = rejectButtonBgColor;
            e.target.style.color = rejectTextColor;
          }}
        >
          <FaTimes />
          <span>Reject All</span>
        </button>
      </div>

      {/* Customize settings form */}
      {showCustomize && (
        <div className="mt-6 p-4 border-t-2">
          <h4 className="text-md font-bold mb-2">Manage Consent Preferences</h4>
          <div className="space-y-4">
            {["Performance", "Functional", "Targeting"].map((cat) => (
              <label key={cat} className="flex items-center space-x-2 text-sm">
                <input
                  type="checkbox"
                  className="rounded"
                  defaultChecked={cat === "Performance"}
                />
                <span>{cat} Cookies</span>
              </label>
            ))}
          </div>
          <div className="flex space-x-2 mt-4">
            <button
              className="px-4 py-2 rounded-md border bg-blue-500 text-white"
              onClick={() => setShowCustomize(false)}
            >
              Confirm my choices
            </button>
            <button
              className="px-4 py-2 rounded-md border bg-gray-500 text-white"
              onClick={() => setShowCustomize(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CookieBot;
