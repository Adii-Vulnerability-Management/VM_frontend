import React from 'react';

/**
 * Template 3: Basic Cookie Banner with buttons.
 */
const TemplateCookiebot = ({
    heading = "We respect your personal privacy",
    description = "We and our partners use cookies to improve your browsing experience. You consent to our use of all cookies by choosing 'I understand'.",
    headingColor = "#000000",
    descriptionColor = "#555555",
    acceptButtonBgColor = "#1D4ED8",
    acceptTextColor = "#ffffff",
    rejectButtonBgColor = "#ffffff",
    rejectTextColor = "#1E3A8A",
    customizeTextColor = "#1D4ED8",
    backgroundColor
}) => {
    return (
        <div
            className="cookie-banner"
            style={{ backgroundColor: backgroundColor, borderRadius: "8px", padding: "20px", textAlign: "center" }}
        >
            <h3 style={{ color: headingColor }}>{heading}</h3>
            <p style={{ color: descriptionColor }}>{description}</p>
            <div className="buttons">
                <button
                    style={{
                        backgroundColor: acceptButtonBgColor,
                        color: acceptTextColor,
                        border: "none",
                        padding: "10px 20px",
                        margin: "5px",
                        borderRadius: "5px",
                    }}
                >
                    Accept All
                </button>
                <button
                    style={{
                        backgroundColor: rejectButtonBgColor,
                        color: rejectTextColor,
                        border: "none",
                        padding: "10px 20px",
                        margin: "5px",
                        borderRadius: "5px",
                    }}
                >
                    Reject All
                </button>
            </div>
            <div className="show-details">
                <div
                    style={{
                        color: customizeTextColor,
                        textDecoration: "underline",
                        fontSize: "14px",
                    }}
                >
                    Customize
                </div>
            </div>
        </div>
    );
};

export default TemplateCookiebot;
