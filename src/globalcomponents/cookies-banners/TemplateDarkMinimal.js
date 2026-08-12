import React from "react";

/**
 * TemplateDarkMinimal:
 * A small, top-floating dark banner with minimal styling,
 * showing only heading, description, and three text buttons.
 */
const TemplateDarkMinimal = ({
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
      className="w-[400px] p-4 rounded-xl shadow-md text-center"
      style={{ backgroundColor: backgroundColor }}
    >
      <h3 className="text-lg font-bold mb-2" style={{ color: headingColor }}>
        {heading}
      </h3>
      <p className="mb-4 text-sm" style={{ color: descriptionColor }}>
        {description}
      </p>
      <div className="flex justify-center space-x-2">
        <button
          className="px-4 py-2 rounded-md border"
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
          Accept
        </button>
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
          Reject
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
          Customize
        </button>
      </div>
    </div>
  );
};

export default TemplateDarkMinimal;
