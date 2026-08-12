// src/modules/Industry/BankingAndFinance/FFIECHub/DomainTwoThreatIntelligenceCollaboration.jsx
import React from "react";
import DomainTable from "./DomainTable";
import Data from "../../../../data/FFIEC/DomainTwoThreatIntelligenceAndCollaboration.json";

export default function DomainTwoThreatIntelligenceCollaboration({
  answers,
  onChange,
}) {
  const title = "Domain 2: Threat Intelligence and Collaboration";
  const description = `
    Threat intelligence and collaboration includes processes to effectively
    discover, analyze, and understand cyber threats, with the capability to
    share information internally and with appropriate third parties.
  `;

  return (
    <DomainTable
      data={Data}
      title={title}
      description={description}
      answers={answers}
      onChange={onChange}
    />
  );
}
