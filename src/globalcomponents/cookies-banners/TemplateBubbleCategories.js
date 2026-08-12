import React from "react";
import { AiOutlineCheckSquare } from "react-icons/ai";

/**
 * TemplateBubbleCategories:
 * A bottom-center bubble shape with multiple checkboxes for categories
 * and icon-based buttons.
 */
const TemplateBubbleCategories = ({
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
  backgroundColor
}) => {
  return (
    <div
      className="w-[420px] p-6 rounded-full shadow-md text-center"
      style={{ backgroundColor: backgroundColor }}
    >
      <h3 className="text-lg font-bold mb-2" style={{ color: headingColor }}>
        {heading}
      </h3>
      <p className="mb-4 text-sm" style={{ color: descriptionColor }}>
        {description}
      </p>

      {/* Example: toggles or checkboxes for categories */}
      <div className="flex justify-center space-x-3 mb-4">
        {["Analytics", "Ads", "Preferences"].map((cat) => (
          <label key={cat} className="flex items-center space-x-1 text-sm">
            <input type="checkbox" defaultChecked={cat === "Analytics"} />
            <span>{cat}</span>
          </label>
        ))}
      </div>

      <div className="flex space-x-2 justify-center">
        <button
          className="px-4 py-2 rounded-full border inline-flex items-center space-x-1"
          style={{
            backgroundColor: acceptButtonBgColor,
            color: acceptTextColor,
            borderColor: acceptBorderColor,
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
          <AiOutlineCheckSquare />
          <span>Accept</span>
        </button>
        <button
          className="px-4 py-2 rounded-full border inline-flex items-center space-x-1"
          style={{
            backgroundColor: rejectButtonBgColor,
            color: rejectTextColor,
            borderColor: rejectBorderColor,
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
          <AiOutlineCheckSquare style={{ transform: "rotate(45deg)" }} />
          <span>Reject</span>
        </button>
        <button
          className="px-4 py-2 rounded-full border inline-flex items-center space-x-1"
          style={{
            backgroundColor: customizeButtonBgColor,
            color: customizeTextColor,
            borderColor: customizeBorderColor,
          }}
          onMouseOver={(e) => {
            e.target.style.backgroundColor = customizeHoverBgColor;
            e.target.style.color = customizeHoverTextColor;
          }}
          onMouseOut={(e) => {
            e.target.style.backgroundColor = customizeButtonBgColor;
            e.target.style.color = customizeTextColor;
          }}
        >
          <AiOutlineCheckSquare />
          <span>Customize</span>
        </button>
      </div>
    </div>
  );
};

export default TemplateBubbleCategories;
