import React, { useState, useEffect, useRef } from "react";
import AssessmentTable from "./AssessmentTable";


// Organizational Characteristics questions
const initialQuestions = [
  {
    id: 1,
    text: "Mergers and acquisitions (including divestitures and joint ventures)",
    options: {
      Least: "None planned",
      Minimal:
        "Open to initiating discussions or actively seeking a merger or acquisition",
      Moderate: "In discussions with at least 1 party",
      Significant:
        "A sale or acquisition has been publicly announced within the past year, in negotiations with 1 or more parties",
      Most: "Multiple ongoing integrations of acquisitions are in process",
    },
  },
  {
    id: 2,
    text: "Direct employees (including IT and cybersecurity contractors)",
    options: {
      Least: "Number of employees totals <50",
      Minimal: "Number of employees totals 50–2,000",
      Moderate: "Number of employees totals 2,001–10,000",
      Significant: "Number of employees totals 10,001–50,000",
      Most: "Number of employees is >50,000",
    },
  },
  {
    id: 3,
    text: "Changes in IT and information security staffing",
    options: {
      Least: "Key positions filled; low or no turnover of personnel",
      Minimal: "Staff vacancies exist for non-critical roles",
      Moderate: "Some turnover in key or senior positions",
      Significant: "Frequent turnover in key staff or senior positions",
      Most: "Vacancies in senior or key positions for long periods; high level of employee turnover",
    },
  },
  {
    id: 4,
    text: "Privileged access (admins: network, database, applications, systems)",
    options: {
      Least:
        "Limited number of administrators; limited or no external administrators",
      Minimal:
        "Turnover in administrators does not affect operations; may utilize some external administrators",
      Moderate:
        "Turnover affects operations; number of administrators exceeds what is necessary",
      Significant:
        "High reliance on external administrators; insufficient support for pace of change",
      Most: "High turnover; many or most admins are external; limited experience in network administration",
    },
  },
  {
    id: 5,
    text: "Changes in IT environment (network, infrastructure, critical apps)",
    options: {
      Least: "Stable IT environment",
      Minimal: "Infrequent or minimal changes in the IT environment",
      Moderate: "Frequent adoption of new technologies",
      Significant: "High volume of significant changes",
      Most: "Substantial changes to outsourced providers; large and complex changes occur frequently",
    },
  },
  {
    id: 6,
    text: "Locations of branches/business presence",
    options: {
      Least: "1 state",
      Minimal: "1 region",
      Moderate: "1 country",
      Significant: "1–20 countries",
      Most: ">20 countries",
    },
  },
  {
    id: 7,
    text: "Locations of operations/data centers",
    options: {
      Least: "1 state",
      Minimal: "1 region",
      Moderate: "1 country",
      Significant: "1–10 countries",
      Most: ">10 countries",
    },
  },
];

export default function OrganizationalCharacteristics({ answers, onChange }) {
  return (
    <AssessmentTable
      questions={initialQuestions}
      riskLevels={["Least", "Minimal", "Moderate", "Significant", "Most"]}
      answers={answers}
      onChange={onChange}
    />
  );
}
  
 