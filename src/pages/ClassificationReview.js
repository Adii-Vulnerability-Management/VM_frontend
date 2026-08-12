
import React, { useState } from "react";

const classificationLevels = {
  Restricted: {
    weight: 10,
    description: "Highly sensitive. Legal or financial exposure.",
  },
  Confidential: {
    weight: 5,
    description: "Personal data, but less regulated.",
  },
  Internal: {
    weight: 2,
    description: "Mildly sensitive, for internal use only.",
  },
  Public: { weight: 0, description: "No risk. Safe to display publicly." },
};

const initialFields = [
  { field: "Aadhaar", classification: "Restricted" },
  { field: "Email", classification: "Confidential" },
  { field: "Gender", classification: "Internal" },
  { field: "IP Address", classification: "Internal" },
];

export default function FullRiskClassificationPanel() {
  const [fields, setFields] = useState(initialFields);

  const handleChange = (index, newLevel) => {
    const updated = [...fields];
    updated[index].classification = newLevel;
    setFields(updated);
  };

  const totalScore = fields.reduce((sum, f) => {
    return sum + (classificationLevels[f.classification]?.weight || 0);
  }, 0);

  const getRiskLevel = (score) => {
    if (score >= 16) return "High";
    if (score >= 6) return "Medium";
    return "Low";
  };

  const riskLevel = getRiskLevel(totalScore);

  const colorMap = {
    Low: "text-green-600",
    Medium: "text-yellow-600",
    High: "text-red-600",
  };

  return (
    <div className="max-w-4xl mx-auto mt-10 p-6 bg-white border rounded shadow space-y-6">
      <h1 className="text-2xl font-bold text-[#2B245C]">
        🔐 Risk Classification & Scoring Panel
      </h1>

      <p className="text-sm text-gray-600">
        Adjust sensitivity for each detected field below. The risk score and
        level update in real-time.
      </p>

      <table className="w-full text-sm border mt-4">
        <thead className="bg-gray-100">
          <tr className="text-left">
            <th className="p-2 border">Field</th>
            <th className="p-2 border">Classification</th>
            <th className="p-2 border">Weight</th>
            <th className="p-2 border">Description</th>
          </tr>
        </thead>
        <tbody>
          {fields.map((f, idx) => (
            <tr key={idx} className="border-t">
              <td className="p-2 border">{f.field}</td>
              <td className="p-2 border">
                <select
                  value={f.classification}
                  onChange={(e) => handleChange(idx, e.target.value)}
                  className="border rounded px-2 py-1 text-sm"
                >
                  {Object.keys(classificationLevels).map((level) => (
                    <option key={level} value={level}>
                      {level}
                    </option>
                  ))}
                </select>
              </td>
              <td className="p-2 border text-center">
                {classificationLevels[f.classification].weight}
              </td>
              <td className="p-2 border text-gray-600">
                {classificationLevels[f.classification].description}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-6 border-t pt-4 text-sm">
        <p className="text-gray-800 font-medium">
          📊 Total Risk Score: <span className="font-bold">{totalScore}</span>
        </p>
        <p className={`font-bold mt-1 ${colorMap[riskLevel]}`}>
          Risk Level: {riskLevel}
        </p>
        <p className="text-gray-600 mt-2">
          ➤ To reduce risk: downgrade classifications where appropriate, mask
          high-risk fields, or enforce access controls.
        </p>
      </div>
    </div>
  );
}
