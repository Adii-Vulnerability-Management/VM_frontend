import React from "react";

const maturityLevels = [
  "Innovative",
  "Advanced",
  "Intermediate",
  "Evolving",
  "Baseline",
];

const riskLevels = ["Least", "Minimal", "Moderate", "Significant", "Most"];

// Example coloring logic; adjust mapping as needed
const cellColors = {
  Innovative: [
    "bg-green-200",
    "bg-green-200",
    "bg-green-200",
    "bg-blue-300",
    "bg-blue-300",
  ],
  Advanced: [
    "bg-green-200",
    "bg-green-200",
    "bg-blue-300",
    "bg-blue-300",
    "bg-blue-300",
  ],
  Intermediate: [
    "bg-green-200",
    "bg-blue-300",
    "bg-blue-300",
    "bg-blue-300",
    "bg-red-400",
  ],
  Evolving: [
    "bg-blue-300",
    "bg-blue-300",
    "bg-blue-300",
    "bg-red-400",
    "bg-red-400",
  ],
  Baseline: [
    "bg-blue-300",
    "bg-blue-300",
    "bg-red-400",
    "bg-red-400",
    "bg-red-400",
  ],
};

const domains = [
  {
    id: 1,
    name: "Cyber Risk Management and Oversight",
    maturity: "Below Baseline",
  },
  {
    id: 2,
    name: "Threat Intelligence and Collaboration",
    maturity: "Below Baseline",
  },
  { id: 3, name: "Cybersecurity Controls", maturity: "Below Baseline" },
  { id: 4, name: "External Dependency Management", maturity: "Below Baseline" },
  {
    id: 5,
    name: "Cyber Incident Management and Resilience",
    maturity: "Below Baseline",
  },
];

export default function RiskMaturityMatrix() {
  return (
    <div className="p-6 bg-white rounded-lg shadow">
      {/* Header */}
      <div className="bg-[#F2F1FB] p-4 rounded-md mb-6">
        <h2 className="text-2xl font-bold text-[#2B245C] mb-1">
          Risk/Maturity Relationship Matrix
        </h2>
        <p className="text-sm text-[#050038] italic">
          This matrix will be populated from the risk rollup and domain maturity
          analysis. No input is needed.
        </p>
      </div>

      {/* Matrix Grid */}
      <div className="relative overflow-auto mb-6 bg-[#F2F1FB] p-4 rounded-lg">
        {/* X-axis label */}
        <div className="text-center text-sm font-medium text-[#050038] mb-4">
          Inherent Risk Levels
        </div>
        <div className="flex">
          {/* Y-axis label */}
          <div className="flex items-center mr-4">
            <div className="transform -rotate-90 text-sm font-medium text-[#050038] origin-center">
              Cybersecurity Maturity Level For Each Domain
            </div>
          </div>
          <table className="w-full table-fixed border-collapse">
            <thead>
              <tr className="bg-[#2B245C]">
                <th className="w-1/6 border px-3 py-2"></th>
                {riskLevels.map((level) => (
                  <th
                    key={level}
                    className="border px-3 py-2 text-center text-sm font-medium text-white"
                  >
                    {level}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {maturityLevels.map((mat) => (
                <tr key={mat} className="even:bg-white odd:bg-[#F2F1FB]">
                  <td className="border px-3 py-2 font-medium text-sm text-[#050038]">
                    {mat}
                  </td>
                  {cellColors[mat].map((color, idx) => (
                    <td key={idx} className={`${color} border`}></td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Domain Maturity Table */}
      <div className="mb-6 p-4 bg-[#F2F1FB] rounded-lg">
        <h3 className="text-center text-lg font-semibold mb-4 text-[#050038]">
          Domain Maturity
        </h3>
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-[#2B245C]">
              <th className="border px-3 py-2 text-left text-xs font-medium text-white">
                #
              </th>
              <th className="border px-3 py-2 text-left text-xs font-medium text-white">
                Domain
              </th>
              <th className="border px-3 py-2 text-left text-xs font-medium text-white">
                Maturity
              </th>
            </tr>
          </thead>
          <tbody>
            {domains.map(({ id, name, maturity }) => (
              <tr key={id} className="even:bg-white odd:bg-[#F2F1FB]">
                <td className="border px-3 py-2 text-sm">{id}</td>
                <td className="border px-3 py-2 text-sm">{name}</td>
                <td className="border px-3 py-2">
                  <span className="inline-block px-2 py-1 text-xs font-semibold bg-[#050038] text-white rounded-full">
                    {maturity}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Maturity Definitions */}
      <div className="bg-[#F2F1FB] p-6 rounded-lg">
        <h3 className="text-xl font-semibold text-[#2B245C] mb-4">
          Maturity Levels Defined
        </h3>
        <dl className="space-y-6 text-sm text-[#050038]">
          <div>
            <dt className="font-semibold mb-1">Baseline</dt>
            <dd className="pl-4">
              Baseline maturity is characterized by minimum expectations
              required by law and regulations or recommended in supervisory
              guidance. Compliance-driven objectives are in place.
            </dd>
          </div>
          <div>
            <dt className="font-semibold mb-1">Evolving</dt>
            <dd className="pl-4">
              Evolving maturity is characterized by additional formality of
              documented procedures beyond compliance. Accountability for
              cybersecurity is formally assigned.
            </dd>
          </div>
          <div>
            <dt className="font-semibold mb-1">Intermediate</dt>
            <dd className="pl-4">
              Intermediate maturity has detailed, formal processes with
              consistent controls and integration of risk-management into
              business strategies.
            </dd>
          </div>
          <div>
            <dt className="font-semibold mb-1">Advanced</dt>
            <dd className="pl-4">
              Advanced maturity features integrated analytics, automation, and
              continuous improvement of cybersecurity processes across the
              institution.
            </dd>
          </div>
          <div>
            <dt className="font-semibold mb-1">Innovative</dt>
            <dd className="pl-4">
              Innovative maturity drives new controls and predictive analytics
              for real-time risk management and industry-leading cybersecurity
              practices.
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
