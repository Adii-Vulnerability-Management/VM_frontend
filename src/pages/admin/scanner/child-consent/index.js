import React from "react";
import ChildConsentConfigPage from "./childFormConfig";

const ChildConsent = () => {
  return (
    <div>
      <ChildConsentConfigPage />
      {/* this page is currently just a wrapper for the child consent form configuration, but we can add more tabs or sections here in the future if needed */}
    </div>
  );
};

export default ChildConsent;
