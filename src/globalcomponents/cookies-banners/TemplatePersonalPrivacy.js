import React from "react";

/**
 * TemplatePersonalPrivacy:
 * A minimal white center card referencing "personal privacy",
 * with 3 horizontal buttons (like "Do not allow cookies", "I understand", "Cookie settings").
 */
const TemplatePersonalPrivacy = ({
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
    <div className="w-[500px] p-5 rounded-md shadow-md  text-center">
      <h3 className="text-lg font-bold mb-2" style={{ color: headingColor, backgroundColor: backgroundColor }}>
        {heading}
      </h3>
      <p
        className="mb-4 text-sm leading-relaxed"
        style={{ color: descriptionColor }}
      >
        {description}
      </p>
      <div className="flex justify-center space-x-3">
        <button
          className="px-3 py-2 rounded-md border text-sm"
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
          Do not allow cookies
        </button>
        <button
          className="px-3 py-2 rounded-md border text-sm"
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
          I understand
        </button>
        <button
          className="px-3 py-2 rounded-md border text-sm"
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
          Cookie settings
        </button>
      </div>
    </div>
  );
};

export default TemplatePersonalPrivacy;
