import React, { useState, useEffect, useRef } from "react";
import AssessmentTable from "./AssessmentTable";


// External Threats questions
const initialQuestions = [
  {
    id: 1,
    text: "Attempted cyber attacks",
    options: {
      Least: "No attempted attacks or reconnaissance",
      Minimal:
        "Few attempts monthly (<100); may have had generic phishing campaigns received by employees and customers",
      Moderate:
        "Several attempts monthly (100–500); phishing campaigns targeting employees or customers at the institution or third parties supporting critical activities; may have experienced an attempted DDoS attack within the last year",
      Significant:
        "Significant number of attempts monthly (501–100,000); spear phishing campaigns targeting high net worth customers and employees at the institution or third parties supporting critical activities; institution specifically is named in threat reports; may have experienced multiple attempted DDoS attacks within the last year",
      Most: "Substantial number of attempts monthly (>100,000); persistent attempts to attack senior management and/or network administrators; frequently targeted for DDoS attacks",
    },
  },
];

export default function ExternalThreats({ answers, onChange }) {
  return (
    <AssessmentTable
      questions={initialQuestions}
      riskLevels={["Least", "Minimal", "Moderate", "Significant", "Most"]}
      answers={answers}
      onChange={onChange}
    />
  );
}
  
 