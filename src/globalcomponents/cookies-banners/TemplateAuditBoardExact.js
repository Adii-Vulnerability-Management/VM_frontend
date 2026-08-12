import React from "react";
import { FaChevronDown } from "react-icons/fa";

/**
 * TemplateAuditBoardExact:
 * A bottom-left fixed modal styled like the AuditBoard screenshot, using the colors from the passed props.
 */
const TemplateAuditBoardExact = ({
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
      className="relative max-w-sm w-full p-5 rounded-lg shadow-lg fixed bottom-8 left-8"
      style={{ backgroundColor: backgroundColor }} // Using background color from props
    >
      {/* Heading */}
      <h3 className="text-xl font-bold mb-3" style={{ color: headingColor }}>
        {heading}
      </h3>

      {/* Description */}
      <p
        className="text-sm leading-relaxed mb-5"
        style={{ color: descriptionColor }}
      >
        {description}
      </p>

      {/* Two main buttons: Accept All & Decline All */}
      <div className="flex justify-center space-x-2">
        {/* Accept All */}
        <button
          className="px-4 py-2 rounded-md border font-semibold"
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
          Accept All
        </button>

        {/* Decline All */}
        <button
          className="px-4 py-2 rounded-md border font-semibold"
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
          Decline All
        </button>
      </div>

      {/* Customize Button */}
      <div className="flex justify-center mt-4">
        <button
          className="px-4 py-2 rounded-md border font-semibold"
          style={{
            backgroundColor: customizeButtonBgColor,
            color: customizeTextColor,
            borderColor: customizeBorderColor,
            borderWidth: "1px",
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
          Customize
        </button>
      </div>
    </div>
  );
};

export default TemplateAuditBoardExact;
