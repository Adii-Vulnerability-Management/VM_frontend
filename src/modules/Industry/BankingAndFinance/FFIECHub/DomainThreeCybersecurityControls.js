// src/modules/Industry/BankingAndFinance/FFIECHub/DomainThreeCybersecurityControls.jsx
import React from "react";
import DomainTable from "./DomainTable";
import Data from "../../../../data/FFIEC/DomainThreeCybersecurityControls.json";

export default function DomainThreeCybersecurityControls({ answers, onChange }) {
  const title = "Domain 3: Cybersecurity Controls";
  const description = `
    Cybersecurity controls are the practices and processes used to protect
    assets—including networks, devices, applications and data—through continuous,
    automated protection and monitoring.
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
