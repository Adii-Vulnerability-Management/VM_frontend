import React from "react";
import { MaturityJson } from "@/routes/tisaxjsonfolder/MaturityJson";
import MaturityAccordion from "../tisaxcomponents/MaturityAccordian.js";
function Nis2Maturity() {
  return (
    <div className="bg-[#F4F4F9] min-h-screen">
      <div className="mx-auto p-6">
        <MaturityAccordion items={MaturityJson} title="Information Security Assessment" />
      </div>
    </div>
  );
}

export default Nis2Maturity;
