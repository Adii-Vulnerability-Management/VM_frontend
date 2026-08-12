import React from "react";
import { MaturityJson } from "@/routes/tisaxjsonfolder/MaturityJson";
import MaturityAccordion from "../../MaturityAccordian.js";
function AuditTisaxMaturity() {
  return (
    <div className="bg-[#F4F4F9] min-h-screen">
      <div className="mx-auto p-6">
        <MaturityAccordion items={MaturityJson} title="Information Security Assessment" />
      </div>
    </div>
  );
}

export default AuditTisaxMaturity;
