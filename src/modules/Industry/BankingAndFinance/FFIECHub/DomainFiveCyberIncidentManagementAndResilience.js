// src/modules/Industry/BankingAndFinance/FFIECHub/DomainFiveCyberIncidentManagementAndResilience.jsx
import React from "react";
import DomainTable from "./DomainTable";
import Data from "../../../../data/FFIEC/DomainFiveCyberIncidentManagementAndResilience.json";

export default function DomainFiveCyberIncidentManagementAndResilience({
  answers,
  onChange,
}) {
  const title = "Domain 5: Cyber Incident Management and Resilience";
  const description = `
    Cyber incident management includes establishing, identifying, and analyzing cyber events;
    prioritizing containment or mitigation; and escalating to appropriate stakeholders.
    Cyber resilience encompasses planning and testing to maintain and recover operations during
    and following an incident.
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
