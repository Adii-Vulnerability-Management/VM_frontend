// components/TisaxDefinition.js

import React from "react";
import DefinitionAccordion from "../tisaxcomponents/DefinitionAccordion";
import { Definition1Json } from "@/routes/tisaxjsonfolder/Definition1Json";
import { Definition2Json } from "@/routes/tisaxjsonfolder/Definition2Json";
import { Definition3Json } from "@/routes/tisaxjsonfolder/Definition3Json";

function Nis2Definition() {
  return (
    <div className="pb-4 p-4">
      <div className="p-4">
        <div className="bg-[#F4F4F9] shadow-lg rounded-lg p-6">
          <h2 className="mb-4 text-xl font-semibold text-[#050038]">
            Information Security Assessment - Definitions
          </h2>
          <div className="accordion">
            <DefinitionAccordion
              title="Tabs"
              data={Definition1Json}
              headers={["Tab", "Description", "Intended use of tab"]}
              charactersPerLine={60}
            />
            <DefinitionAccordion
              title="Key Terms"
              data={Definition2Json}
              headers={["Term", "Explanation", "Example"]}
              charactersPerLine={40}
            />
            <DefinitionAccordion
              title="Glossary"
              data={Definition3Json}
              headers={["Term", "Explanation", "Example"]}
              charactersPerLine={40}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Nis2Definition;
