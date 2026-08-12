// src/modules/Industry/BankingAndFinance/FFIECHub/MaturityRollup.jsx
import React, { useEffect, useState } from "react";

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
// component definitions
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

export default function MaturityRollup({ answers = {}, onComputed }) {
  // console.log("answers", answers);
  // console.log("onComputed", onComputed);
  const [rows, setRows] = useState([]);
  const [summary, setSummary] = useState({});

  useEffect(() => {
    const allEntries = Object.values(answers).flat();
    const computed = initialRows.map((r) => {
      const entries = allEntries.filter(
        (e) => e.factor === r.factor && e.component === r.component
      );
      const total = {},
        yes = {},
        perc = {};

      // compute counts and percentages for each maturity level
      maturityLevels.forEach((lvl) => {
        total[lvl] = entries.filter((e) => e.maturity === lvl).length;
        yes[lvl] = entries.filter(
          (e) =>
            e.maturity === lvl && (e.response === "Y" || e.response === "Y(C)")
        ).length;
        // always show percentage (0% if no yeses, 100% if no entries)
        if (total[lvl] === 0) perc[lvl] = entries.length ? "0%" : "";
        else perc[lvl] = `${Math.round((yes[lvl] / total[lvl]) * 100)}%`;
      });

      // determine calculated level (weakest-link nested if)
      let calc = "";
      for (let i = maturityLevels.length - 1; i >= 0; i--) {
        const upTo = maturityLevels.slice(0, i + 1);
        if (upTo.every((l) => perc[l] === "100%")) {
          calc = maturityLevels[i];
          break;
        }
      }

      return { ...r, perc, calculated: calc };
    });

    // domain rollup
    const byDom = computed.reduce((acc, row) => {
      acc[row.domain] = acc[row.domain] || [];
      acc[row.domain].push(row);
      return acc;
    }, {});

    const rollup = {};
    Object.entries(byDom).forEach(([dom, compRows]) => {
      const minW = Math.min(
        ...compRows.map((r) => levelWeights[r.calculated] || 0)
      );
      rollup[dom] = maturityLevels.find((l) => levelWeights[l] === minW) || "";
    });

    setRows(computed);
    setSummary(rollup);
    onComputed?.(rollup);
  }, [answers, onComputed]);

  let lastDomain = null;

  return (
    <div className="p-4 bg-white rounded-lg shadow overflow-auto text-sm">
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gray-100">
            <th className="border px-2 py-1">Domain</th>
            <th className="border px-2 py-1">Assessment Factor</th>
            <th className="border px-2 py-1">Component</th>
            {maturityLevels.map((lvl) => (
              <th key={lvl} className="border px-2 py-1 text-center">
                {lvl}
              </th>
            ))}
            <th className="border px-2 py-1 text-center">Calculated Level</th>
            <th className="border px-2 py-1 text-center">Overall</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => {
            const showOverall = r.domain !== lastDomain;
            lastDomain = r.domain;
            return (
              <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                <td className="border px-2 py-1 font-medium">{r.domain}</td>
                <td className="border px-2 py-1">{r.factor}</td>
                <td className="border px-2 py-1">{r.component}</td>
                {maturityLevels.map((lvl) => (
                  <td key={lvl} className="border px-2 py-1 text-center">
                    {r.perc[lvl]}
                  </td>
                ))}
                <td className="border px-2 py-1 text-center font-semibold">
                  {r.calculated}
                </td>
                <td className="border px-2 py-1 text-center font-semibold">
                  {showOverall ? summary[r.domain] : ""}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
