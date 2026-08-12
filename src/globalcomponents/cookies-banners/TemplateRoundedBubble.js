import Image from "next/image";
import React from "react";
import { FaRegMoon } from "react-icons/fa"; // You can use this or a custom icon

/**
 * TemplateCookieConsent:
 * A cookie consent banner styled similar to the one in the image.
 */
const TemplateCookieConsents = ({
  heading = "By clicking “Accept all cookies”, you agree Stack Exchange can store cookies on your device and disclose information in accordance with our Cookie Policy.",
  headingColor = "#ffffff",
  buttonBgColor = "#1D4ED8", // Accept All Cookies button color
  buttonTextColor = "#ffffff", // Button text color
  rejectButtonBgColor = "#ffffff", // Necessary cookies only button color
  rejectButtonTextColor = "#1D4ED8", // Button text color for necessary cookies only
  cookieSettingsTextColor = "#1D4ED8", // Customize button text color
  cookiePolicyLinkColor = "#1D4ED8", // Cookie policy link color
  descriptionColor = "#555555",
  description = "We and our partners use cookies to improve your browsing experience. You consent to our use of all cookies by choosing 'I understand'.",
  backgroundColor
}) => {
  return (
    <div
      className="relative flex flex-col gap-2 w-full max-w-lg mx-auto  p-6 rounded-xl shadow-lg text-center"
      style={{ backgroundColor: backgroundColor }}
    >
      {/* Cookie Icon */}
      <div className="absolute top-4 left-4 text-blue-500">
        <img
          src="https://media.baamboozle.com/uploads/images/50301/f5e88638-96b7-49fa-816d-e6a1639368b2-thumbnail.png"
          alt=""
          width={60}
        />
      </div>
      <br />
      <br />
      <div>
        {/* Heading */}
        <p className="text-base" style={{ color: headingColor }}>
          {heading}{" "}
        </p>
        <p style={{ color: descriptionColor }}>{description}</p>
      </div>
      {/* Buttons */}
      <div className="mt-6 flex justify-center space-x-4">
        {/* Accept All Cookies */}
        <button
          className="px-6 py-2 rounded-lg font-semibold"
          style={{
            backgroundColor: buttonBgColor,
            color: buttonTextColor,
            border: "none",
          }}
        >
          Accept all cookies
        </button>

        {/* Necessary Cookies Only */}
        <button
          className="px-6 py-2 rounded-lg border font-semibold"
          style={{
            backgroundColor: rejectButtonBgColor,
            color: rejectButtonTextColor,
            borderColor: rejectButtonTextColor,
          }}
        >
          Reject All cookies
        </button>
      </div>

      {/* Customize Settings Link */}
      <div className="mt-6">
        <a
          href="#"
          style={{ color: cookieSettingsTextColor }}
          className="underline text-sm"
        >
          Customize
        </a>
      </div>
    </div>
  );
};

export default TemplateCookieConsents;

// import React from "react";

// /**
//  * TemplateRoundedBubble:
//  * A bubble-like bottom-center banner with large border-radius.
//  */
// const TemplateRoundedBubble = ({
//   heading,
//   description,
//   headingColor,
//   descriptionColor,
//   acceptButtonBgColor,
//   acceptTextColor,
//   acceptHoverBgColor,
//   acceptHoverTextColor,
//   acceptBorderColor,
//   rejectButtonBgColor,
//   rejectTextColor,
//   rejectHoverBgColor,
//   rejectHoverTextColor,
//   rejectBorderColor,
//   customizeButtonBgColor,
//   customizeTextColor,
//   customizeHoverBgColor,
//   customizeHoverTextColor,
//   customizeBorderColor,
// }) => {
//   return (
//     <div
//       className="w-[420px] p-6 rounded-full shadow-md text-center"
//       style={{ backgroundColor: "#fdf6eb" }}
//     >
//       <h3 className="text-lg font-bold mb-2" style={{ color: headingColor }}>
//         {heading}
//       </h3>
//       <p className="mb-4 text-sm" style={{ color: descriptionColor }}>
//         {description}
//       </p>
//       <div className="flex justify-center space-x-2">
//         <button
//           className="px-4 py-2 rounded-full border"
//           style={{
//             backgroundColor: acceptButtonBgColor,
//             color: acceptTextColor,
//             borderColor: acceptBorderColor,
//           }}
//           onMouseOver={(e) => {
//             e.target.style.backgroundColor = acceptHoverBgColor;
//             e.target.style.color = acceptHoverTextColor;
//           }}
//           onMouseOut={(e) => {
//             e.target.style.backgroundColor = acceptButtonBgColor;
//             e.target.style.color = acceptTextColor;
//           }}
//         >
//           Accept
//         </button>
//         <button
//           className="px-4 py-2 rounded-full border"
//           style={{
//             backgroundColor: rejectButtonBgColor,
//             color: rejectTextColor,
//             borderColor: rejectBorderColor,
//           }}
//           onMouseOver={(e) => {
//             e.target.style.backgroundColor = rejectHoverBgColor;
//             e.target.style.color = rejectHoverTextColor;
//           }}
//           onMouseOut={(e) => {
//             e.target.style.backgroundColor = rejectButtonBgColor;
//             e.target.style.color = rejectTextColor;
//           }}
//         >
//           Reject
//         </button>
//         <button
//           className="px-4 py-2 rounded-full border"
//           style={{
//             backgroundColor: customizeButtonBgColor,
//             color: customizeTextColor,
//             borderColor: customizeBorderColor,
//           }}
//           onMouseOver={(e) => {
//             e.target.style.backgroundColor = customizeHoverBgColor;
//             e.target.style.color = customizeHoverTextColor;
//           }}
//           onMouseOut={(e) => {
//             e.target.style.backgroundColor = customizeButtonBgColor;
//             e.target.style.color = customizeTextColor;
//           }}
//         >
//           Customize
//         </button>
//       </div>
//     </div>
//   );
// };

// export default TemplateRoundedBubble;
