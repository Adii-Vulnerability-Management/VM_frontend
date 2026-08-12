import React from "react";

/**
 * TemplateCookieConsent:
 * A cookie consent banner with buttons and a cookie policy link styled with Tailwind CSS.
 */
const TemplateCookieConsent = ({
    heading = "We respect your personal privacy",
    description = "We and our partners use cookies to improve your browsing experience. You consent to our use of all cookies by choosing 'I understand'.",
    headingColor = "#555555",
    buttonBgColor = "#1D4ED8",
    buttonTextColor = "#ffffff",
    rejectButtonBgColor = "#ffffff",
    rejectButtonTextColor = "#1D4ED8",
    cookieSettingsTextColor = "#1D4ED8",
    descriptionColor = "#ffffff",
    backgroundColor,

}) => {
    return (
        <div
            className="relative w-full max-w-lg mx-auto p-6 rounded-xl shadow-lg text-center"
            style={{ backgroundColor: backgroundColor }}
        >
            {/* Heading */}
            <p className="text-base" style={{ color: headingColor }}>
                {heading}
            </p>
            <p className="text-sm" style={{ color: descriptionColor }}>
                {description}
            </p>

            {/* Buttons */}
            <div className="mt-6 flex justify-center space-x-4">
                {/* Reject All */}
                <button
                    className="px-6 py-2 rounded-lg border font-semibold"
                    style={{
                        backgroundColor: rejectButtonBgColor,
                        color: rejectButtonTextColor,
                        borderColor: "#1D4ED8",
                    }}
                >
                    Reject All
                </button>

                {/* Accept All Cookies */}
                <button
                    className="px-6 py-2 rounded-lg font-semibold"
                    style={{
                        backgroundColor: buttonBgColor,
                        color: buttonTextColor,
                        border: "none",
                    }}
                >
                    Accept All Cookies
                </button>
            </div>

            {/* Cookie Settings Link */}
            <div className="mt-6">
                <div
                    style={{ color: cookieSettingsTextColor }}
                    className="underline text-sm"
                >
                    Customize
                </div>
            </div>
        </div>
    );
};

export default TemplateCookieConsent;
