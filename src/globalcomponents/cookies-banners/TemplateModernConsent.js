import React from "react";
import { FaCookieBite } from "react-icons/fa";

/**
 * TemplateModernConsent:
 * A fullwidth top bar with a modern, bold CTA on the right
 * and a cookie icon on the left.
 */
const TemplateModernConsent = ({
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
      className="w-full p-4 flex justify-between items-center shadow"
      style={{ backgroundColor: backgroundColor, borderBottom: "1px solid #ccc" }}
    >
      <div className="flex items-center space-x-3">
        <FaCookieBite size={32} />
        <div>
          <h3 className="text-lg font-bold" style={{ color: headingColor }}>
            {heading}
          </h3>
          <p className="text-sm" style={{ color: descriptionColor }}>
            {description}
          </p>
        </div>
      </div>
      <div className="flex space-x-2">
        <button
          className="px-4 py-2 rounded-md border"
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
          Reject All
        </button>
        <button
          className="px-4 py-2 rounded-md border"
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
          Cookie Settings
        </button>
        <button
          className="px-4 py-2 rounded-md border font-semibold"
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
          Accept All
        </button>
      </div>
    </div>
  );
};

export default TemplateModernConsent;
