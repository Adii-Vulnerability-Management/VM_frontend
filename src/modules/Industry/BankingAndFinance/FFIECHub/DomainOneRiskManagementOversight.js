// src/modules/Industry/BankingAndFinance/FFIECHub/DomainOneRiskManagementOversight.jsx
import React from "react";
import DomainTable from "./DomainTable";
import Data from "../../../../data/FFIEC/DomainOneRiskManagementOversight.json";

export default function DomainOneRiskManagementOversight({ answers, onChange }) {
  const title = "Domain 1: Cyber Risk Management and Oversight";
  const description = `
    Cyber risk management and oversight addresses the board of directors’ oversight
    and management’s development and implementation of an effective
    enterprise-wide cybersecurity program with comprehensive policies and
    procedures for establishing appropriate accountability and oversight.
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
