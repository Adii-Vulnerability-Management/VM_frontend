import React, { useState, useEffect } from "react";

const maturityLevels = [
  "Baseline",
  "Evolving",
  "Intermediate",
  "Advanced",
  "Innovative",
];
const levelWeights = {
  Baseline: 1,
  Evolving: 2,
  Intermediate: 3,
  Advanced: 4,
  Innovative: 5,
};

// Define the structured rows
const initialRows = [
  {
    domain: "Cyber Risk Management and Oversight",
    factor: "Governance",
    component: "Oversight",
  },
  { domain: "", factor: "", component: "Strategy/Policies" },
  { domain: "", factor: "", component: "IT Asset Management" },
  {
    domain: "",
    factor: "Risk Management",
    component: "Risk Management Program",
  },
  { domain: "", factor: "", component: "Risk Assessment" },
  { domain: "", factor: "", component: "Audit" },
  { domain: "", factor: "Resources", component: "Staffing" },
  { domain: "", factor: "Training and Culture", component: "Training" },
  { domain: "", factor: "", component: "Culture" },
  {
    domain: "Threat Intelligence and Collaboration",
    factor: "Threat Intelligence",
    component: "Threat Intelligence and Information",
  },
  {
    domain: "",
    factor: "Monitoring and Analyzing",
    component: "Monitoring and Analyzing",
  },
  {
    domain: "",
    factor: "Information Sharing",
    component: "Information Sharing",
  },
  {
    domain: "Cybersecurity Controls",
    factor: "Preventative Controls",
    component: "Infrastructure Management",
  },
  { domain: "", factor: "", component: "Access and Data Management" },
  { domain: "", factor: "", component: "Device/End-Point Security" },
  { domain: "", factor: "", component: "Secure Coding" },
  {
    domain: "",
    factor: "Detective Controls",
    component: "Threat and Vulnerability Detection",
  },
  { domain: "", factor: "", component: "Anomalous Activity Detection" },
  { domain: "", factor: "", component: "Event Detection" },
  { domain: "", factor: "Corrective Controls", component: "Patch Management" },
  { domain: "", factor: "", component: "Remediation" },
  {
    domain: "External Dependency Management",
    factor: "Connections",
    component: "Connections",
  },
  { domain: "", factor: "Relationship Management", component: "Due Diligence" },
  { domain: "", factor: "", component: "Contracts" },
  { domain: "", factor: "", component: "Ongoing Monitoring" },
  {
    domain: "Cyber Incident Management and Resilience",
    factor: "Incident Resilience Planning and Strategy",
    component: "Planning",
  },
  { domain: "", factor: "", component: "Testing" },
  {
    domain: "",
    factor: "Detection, Response, and Mitigation",
    component: "Detection",
  },
  { domain: "", factor: "", component: "Response and Mitigation" },
  {
    domain: "",
    factor: "Escalation and Reporting",
    component: "Escalation and Reporting",
  },
];

export default function MaturitySummary({ summary }) {

  const [rows, setRows] = useState(
    initialRows.map((r) => ({
      ...r,
      values: maturityLevels.reduce((acc, lvl) => ({ ...acc, [lvl]: 0 }), {}),
      calculated: "---",
    }))
  );

  // Recalculate calculated level on values change
  // useEffect(() => {
  //   setRows((prev) =>
  //     prev.map((row) => {
  //       const vals = row.values;
  //       const maxLevel = maturityLevels.reduce(
  //         (best, lvl) => (vals[lvl] > vals[best] ? lvl : best),
  //         maturityLevels[0]
  //       );
  //       // if all zero, show '---'
  //       const isAllZero = maturityLevels.every((lvl) => vals[lvl] === 0);
  //       return { ...row, calculated: isAllZero ? "---" : maxLevel };
  //     })
  //   );
  // }, [rows]);

  const handleChange = (index, lvl, val) => {
    const num = parseFloat(val) || 0;
    setRows((prev) =>
      prev.map((row, i) =>
        i === index ? { ...row, values: { ...row.values, [lvl]: num } } : row
      )
    );
  };
  if (!summary) return null;

  return (
    <div className="p-6 bg-white rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-4">Maturity Summary</h3>
      <table className="w-full text-sm table-auto">
        <thead>
          <tr>
            <th className="border px-2">Domain</th>
            <th className="border px-2 text-center">Maturity</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(summary).map(([domain, level]) => (
            <tr key={domain} className="odd:bg-gray-50">
              <td className="border px-2">{domain}</td>
              <td className="border px-2 text-center font-medium">{level}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
