// PivotReport.jsx
import React, { useMemo } from "react";

const maturityLevels = [
  "Baseline",
  "Evolving",
  "Intermediate",
  "Advanced",
  "Innovative",
];

export default function PivotReport({ entries }) {
  const pivotRows = useMemo(() => {
    // group by domain|factor|component
    const map = {};
    entries?.forEach(({ domain, factor, component, maturity, response }) => {
      const key = `${domain}||${factor}||${component}`;
      if (!map[key]) {
        map[key] = {
          domain,
          factor,
          component,
          counts: maturityLevels.reduce(
            (acc, lvl) => ({ ...acc, [lvl]: 0 }),
            {}
          ),
          totals: maturityLevels.reduce(
            (acc, lvl) => ({ ...acc, [lvl]: 0 }),
            {}
          ),
        };
      }
      if (!maturity) return;
      map[key].totals[maturity]++;
      if (response === "Y" || response === "Y(C)") {
        map[key].counts[maturity]++;
      }
    });
    return Object.values(map);
  }, [entries]);

  return (
    <div className="overflow-auto">
      <h3 className="text-lg font-semibold mb-2">Pivot Report</h3>
      <table className="min-w-full border-collapse text-sm">
        <thead>
          <tr className="bg-gray-100">
            <th className="border px-2 py-1">Domain</th>
            <th className="border px-2 py-1">Factor</th>
            <th className="border px-2 py-1">Component</th>
            {maturityLevels.map((lvl) => (
              <th key={lvl} className="border px-2 py-1 text-center">
                {lvl}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {pivotRows.map((row, i) => (
            <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
              <td className="border px-2 py-1">{row.domain}</td>
              <td className="border px-2 py-1">{row.factor}</td>
              <td className="border px-2 py-1">{row.component}</td>
              {maturityLevels.map((lvl) => (
                <td
                  key={lvl}
                  className="border px-2 py-1 text-center"
                  title={`${row.counts[lvl]} of ${row.totals[lvl]}`}
                >
                  {row.counts[lvl]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
