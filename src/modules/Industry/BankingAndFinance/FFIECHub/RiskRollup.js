// src/modules/Industry/BankingAndFinance/FFIECHub/RiskRollup.js
import React, { useState, useEffect } from "react";

const initialCategories = [
  {
    id: 1,
    key: "TechnologyAndConnectionTypes",
    name: "Technologies and Connection Types",
    risks: 0,
    answered: 0,
    least: 0,
    minimal: 0,
    moderate: 0,
    significant: 0,
    most: 0,
  },
  {
    id: 2,
    key: "DeliveryChannels",
    name: "Delivery Channels",
    risks: 0,
    answered: 0,
    least: 0,
    minimal: 0,
    moderate: 0,
    significant: 0,
    most: 0,
  },
  {
    id: 3,
    key: "OnlineMobileAndServices",
    name: "Online/Mobile Products and Technology Services",
    risks: 0,
    answered: 0,
    least: 0,
    minimal: 0,
    moderate: 0,
    significant: 0,
    most: 0,
  },
  {
    id: 4,
    key: "OrganizationalCharacteristics",
    name: "Organizational Characteristics",
    risks: 0,
    answered: 0,
    least: 0,
    minimal: 0,
    moderate: 0,
    significant: 0,
    most: 0,
  },
  {
    id: 5,
    key: "ExternalThreats",
    name: "External Threats",
    risks: 0,
    answered: 0,
    least: 0,
    minimal: 0,
    moderate: 0,
    significant: 0,
    most: 0,
  },
];

const weights = { least: 1, minimal: 2, moderate: 3, significant: 4, most: 5 };

export default function RiskRollup({ data, onComputed }) {
  const [categories, setCategories] = useState(initialCategories);
  const [inherentRisk, setInherentRisk] = useState("");
  const [totals, setTotals] = useState({
    risks: 0,
    answered: 0,
    least: 0,
    minimal: 0,
    moderate: 0,
    significant: 0,
    most: 0,
  });
  const [weightedScore, setWeightedScore] = useState(0);
  const [averageScore, setAverageScore] = useState(0);
  const [percentAnswered, setPercentAnswered] = useState(0);
  const [categoryAverages, setCategoryAverages] = useState({});

  // whenever data.sections changes, rebuild category counts
  useEffect(() => {
    if (!data?.sections) return;

    const rebuilt = initialCategories.map((cat) => {
      const arr = data.sections[cat.key] || [];
      const counts = {
        risks: arr.length,
        answered: 0,
        least: 0,
        minimal: 0,
        moderate: 0,
        significant: 0,
        most: 0,
      };

      arr.forEach((a) => {
        if (a.selected) {
          counts.answered += 1;
          counts[a.selected.toLowerCase()] += 1;
        }
      });

      // —— NEW: total riskScore & average
      const totalScore =
        counts.least * weights.least +
        counts.minimal * weights.minimal +
        counts.moderate * weights.moderate +
        counts.significant * weights.significant +
        counts.most * weights.most;

      const avgScore = counts.answered > 0 ? totalScore / counts.answered : 0;
      const roundedAvg = parseFloat(avgScore.toFixed(2));

      // —— NEW: per‐category inherentRiskLevel by threshold
      let catLevel = "";
      if (roundedAvg >= 4.5) catLevel = "Most";
      else if (roundedAvg >= 3.5) catLevel = "Significant";
      else if (roundedAvg >= 2.5) catLevel = "Moderate";
      else if (roundedAvg >= 1.5) catLevel = "Minimal";
      else if (roundedAvg >= 0.5) catLevel = "Least";

      return {
        ...cat,
        ...counts,
        riskScore: totalScore,
        average: roundedAvg,
        inherentRiskLevel: catLevel,
      };
    });

    setCategories(rebuilt);
  }, [data]);

  useEffect(() => {
    const avgs = {};
    categories.forEach((cat) => {
      if (cat.answered > 0) {
        const totalScore =
          cat.least * weights.least +
          cat.minimal * weights.minimal +
          cat.moderate * weights.moderate +
          cat.significant * weights.significant +
          cat.most * weights.most;
        avgs[cat.key] = parseFloat((totalScore / cat.answered).toFixed(2));
      } else {
        avgs[cat.key] = 0;
      }
    });
    setCategoryAverages(avgs);
  }, [categories]);

  // compute totals & metrics whenever categories update
  useEffect(() => {
    const sums = categories.reduce(
      (acc, c) => {
        acc.risks += c.risks;
        acc.answered += c.answered;
        acc.least += c.least;
        acc.minimal += c.minimal;
        acc.moderate += c.moderate;
        acc.significant += c.significant;
        acc.most += c.most;
        return acc;
      },
      {
        risks: 0,
        answered: 0,
        least: 0,
        minimal: 0,
        moderate: 0,
        significant: 0,
        most: 0,
      }
    );
    setTotals(sums);

    const wScore =
      sums.least * weights.least +
      sums.minimal * weights.minimal +
      sums.moderate * weights.moderate +
      sums.significant * weights.significant +
      sums.most * weights.most;
    setWeightedScore(wScore);

    const avg = sums.answered > 0 ? wScore / sums.answered : 0;
    setAverageScore(parseFloat(avg.toFixed(2)));

    const pct = sums.risks > 0 ? (sums.answered / sums.risks) * 100 : 0;
    setPercentAnswered(parseFloat(pct.toFixed(0)));
  }, [categories]);
  // ← ADD this instead:
  useEffect(() => {
    if (!onComputed) return;
    onComputed({
      categories,
      totals,
      inherentRisk,
      weightedScore,
      averageScore,
      percentAnswered,
    });
    // only re-run when these four values actually change
  }, [inherentRisk, weightedScore, averageScore, percentAnswered, onComputed]);

  useEffect(() => {
    let auto = "";
    if (averageScore >= 4.5) auto = "Most";
    else if (averageScore >= 3.5) auto = "Significant";
    else if (averageScore >= 2.5) auto = "Moderate";
    else if (averageScore >= 1.5) auto = "Minimal";
    else if (averageScore >= 0.5) auto = "Least";
    setInherentRisk(auto);
  }, [averageScore]);

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg space-y-6">
      <h2 className="text-xl font-bold text-[#2B245C]">
        Inherent Risk Profile
      </h2>

      {/* Categories Table */}
      <table className="w-full table-auto border-collapse mb-4">
        <thead className="bg-[#050038] text-white">
          <tr>
            <th className="border px-2 py-1 text-sm text-center">Category</th>
            <th className="border px-2 py-1 text-sm text-center">Questions</th>
            <th className="border px-2 py-1 text-sm text-center">Answered</th>
            <th className="border px-2 py-1 text-sm text-center">Least</th>
            <th className="border px-2 py-1 text-sm text-center">Minimal</th>
            <th className="border px-2 py-1 text-sm text-center">Moderate</th>
            <th className="border px-2 py-1 text-sm text-center">
              Significant
            </th>
            <th className="border px-2 py-1 text-sm text-center">Most</th>
          </tr>
        </thead>
        <tbody>
          {categories.map((cat, idx) => (
            <tr key={cat.id} className={idx % 2 === 0 ? "bg-[#F2F1FB]" : ""}>
              <td className="border px-2 py-1 text-sm">{cat.name}</td>
              {[
                "risks",
                "answered",
                "least",
                "minimal",
                "moderate",
                "significant",
                "most",
              ].map((field) => (
                <td
                  key={field}
                  className="border px-2 py-1 text-center text-sm"
                >
                  {cat[field]}
                </td>
              ))}
            </tr>
          ))}
          {/* Total Row */}
          <tr className="font-semibold bg-[#2B245C] text-white">
            <td className="border px-2 py-1 text-sm">Total</td>
            {[
              "risks",
              "answered",
              "least",
              "minimal",
              "moderate",
              "significant",
              "most",
            ].map((field) => (
              <td key={field} className="border px-2 py-1 text-center text-sm">
                {totals[field]}
              </td>
            ))}
          </tr>
        </tbody>
      </table>
      {/* —— Inherent Risk Profile (by Category) —— */}
      <table className="w-full table-auto border-collapse mb-6 text-sm">
        <thead className="bg-[#050038] text-white">
          <tr>
            <th className="px-4 py-2 text-left">
              Inherent Risk Profile (by Category)
            </th>
            <th className="px-4 py-2 text-center">Inherent Risk Level</th>
            <th className="px-4 py-2 text-center">Risk Score</th>
            <th className="px-4 py-2 text-center">Number of Questions</th>
            <th className="px-4 py-2 text-center">Average Risk Score</th>
          </tr>
        </thead>
        <tbody>
          {categories.map((cat, i) => (
            <tr
              key={cat.id}
              className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}
            >
              <td className="italic px-4 py-2">
                <span className="font-semibold mr-1">{i + 1}.</span> {cat.name}
              </td>
              <td className="px-4 py-2 text-center">
                <em>{cat.inherentRiskLevel || "—"}</em>
              </td>

              <td className="px-4 py-2 text-center">{cat.riskScore}</td>
              <td className="px-4 py-2 text-center">{cat.risks}</td>
              <td className="px-4 py-2 text-center">
                {cat?.average?.toFixed(2)}
              </td>
            </tr>
          ))}

          {/* Composite Row */}
          <tr className="bg-[#2B245C] text-white font-bold">
            <td className="px-4 py-2">Composite – Inherent Risk Results</td>
            <td className="px-4 py-2 text-center">{inherentRisk || "—"}</td>
            <td className="px-4 py-2 text-center">{weightedScore}</td>

            <td className="px-4 py-2 text-center">{totals.risks}</td>
            <td className="px-4 py-2 text-center">{averageScore.toFixed(2)}</td>
          </tr>
        </tbody>
      </table>

      {/* Inherent Risk Selector & Metrics */}
      <div className="p-4 bg-[#F2F1FB] rounded-lg space-y-4">
        <div className="flex items-center space-x-3 bg-[#050038] text-white px-4 py-2 rounded">
          <div>Select an Inherent Risk Based on Individual Risk Levels </div>
          <label className="text-sm font-medium">Inherent Risk : </label>

          <select
            value={inherentRisk}
            onChange={(e) => setInherentRisk(e.target.value)}
            className="text-sm p-1 border rounded bg-white text-black"
          >
            <option value="">Select...</option>
            {["Least", "Minimal", "Moderate", "Significant", "Most"].map(
              (opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              )
            )}
          </select>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white p-3 border rounded shadow">
            <label className="block font-medium text-sm">Weighted Score</label>
            <input
              type="text"
              readOnly
              value={weightedScore}
              className="w-full mt-1 p-1 border rounded bg-gray-100 text-sm"
            />
          </div>
          <div className="bg-white p-3 border rounded shadow">
            <label className="block font-medium text-sm">Average Score</label>
            <input
              type="text"
              readOnly
              value={averageScore}
              className="w-full mt-1 p-1 border rounded bg-gray-100 text-sm"
            />
          </div>
          <div className="bg-white p-3 border rounded shadow">
            <label className="block font-medium text-sm">
              Percent Answered
            </label>
            <input
              type="text"
              readOnly
              value={`${percentAnswered}%`}
              className="w-full mt-1 p-1 border rounded bg-gray-100 text-sm"
            />
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="mt-2 p-3 text-[#F2F1FB] text-xs italic rounded">
        <strong>Instructions:</strong>
        <ol className="list-decimal list-inside ml-4 mt-1 space-y-1">
          <li>Rate each risk for each category (separate worksheets).</li>
          <li>Scoring will be calculated on this roll up worksheet.</li>
          <li>
            Manually select risk level in the dropdown above; see page 4 of the
            FFIEC CAT user guide for guidance.
          </li>
        </ol>
      </div>
    </div>
  );
}
