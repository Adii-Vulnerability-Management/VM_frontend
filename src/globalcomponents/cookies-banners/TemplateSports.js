import React from "react";

/**
 * TemplateSports:
 * A wide horizontal bar with a bold sports-style color scheme
 * and large "Accept All Cookies" text.
 */
const TemplateSports = ({
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
      className="flex items-center justify-between w-full p-4"
      style={{ backgroundColor: backgroundColor }}
    >
      <div className="flex-1 text-left">
        <h3 className="text-lg font-bold mb-2" style={{ color: headingColor }}>
          {heading}
        </h3>
        <p style={{ color: descriptionColor }}>{description}</p>
      </div>
      <div className="flex flex-col space-y-2 ml-4">
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
          Accept All Cookies
        </button>
        <button
          className="px-4 py-2 rounded-md border font-semibold"
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
          className="px-4 py-2 rounded-md border font-semibold"
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

export default TemplateSports;
