// src/modules/Industry/BankingAndFinance/FFIECHub/DomainFourExternalDependencyManagement.jsx
import React from "react";
import DomainTable from "./DomainTable";
import Data from "../../../../data/FFIEC/DomainFourExternalDependencyManagement.json";

export default function DomainFourExternalDependencyManagement({ answers, onChange }) {
  const title = "Domain 4: External Dependency Management";
  const description = `
    External dependency management involves establishing and maintaining a
    comprehensive program to oversee and manage external connections and third-party
    relationships with access to the institution’s technology assets and information.
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
