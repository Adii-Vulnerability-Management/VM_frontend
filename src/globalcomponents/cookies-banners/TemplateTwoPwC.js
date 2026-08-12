import React from "react";
import { AiOutlineSetting } from "react-icons/ai";

/**
 * TemplateTwoPwC:
 * A smaller bottom-left card with a bold red Accept button and
 * black text, reminiscent of PwC styling.
 */
const TemplateTwoPwC = ({
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
      className="w-[800px] p-6 rounded-md shadow-md flex"
      style={{
        backgroundColor: backgroundColor,
      }}
    >
      <div>
        <h3 className="text-xl font-bold mb-2" style={{ color: headingColor }}>
          {heading}
        </h3>
        <p className="mb-4 text-sm" style={{ color: descriptionColor }}>
          {description}
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <button
          className="px-4 py-2 rounded-md font-semibold border"
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
        <button
          className="px-4 py-2 text-nowrap rounded-md font-semibold border"
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
          Decline Cookies
        </button>
        <button
          className="px-4 py-2 rounded-md font-semibold border inline-flex items-center space-x-1"
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
          <AiOutlineSetting />
          <span>Customise</span>
        </button>
      </div>
    </div>
  );
};

export default TemplateTwoPwC;
