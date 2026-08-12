// src/components/MatrixBuilder.js
import React, { useState, useEffect } from "react";

export default function MatrixBuilder() {
  // — builder state —
  const [matrices, setMatrices] = useState([]);
  const [selectedIdx, setSelectedIdx] = useState(null); // null=new
  const [name, setName] = useState("");
  const [rCount, setRCount] = useState(3);
  const [cCount, setCCount] = useState(3);
  const [rows, setRows] = useState(Array(3).fill(""));
  const [cols, setCols] = useState(Array(3).fill(""));
  const [cells, setCells] = useState(
    Array(3)
      .fill()
      .map(() => Array(3).fill("Low"))
  );

  const riskLevels = ["Low", "Medium", "High", "Critical", "Extreme"];
  const [colourMap, setColourMap] = useState({
    Low: { bg: "#bbf7d0", text: "#166534" },
    Medium: { bg: "#fef3c7", text: "#92400e" },
    High: { bg: "#fed7aa", text: "#9a3412" },
    Critical: { bg: "#fecaca", text: "#991b1b" },
    Extreme: { bg: "#f87171", text: "#7f1d1d" },
  });

  // clamp dims & reset labels+cells
  const updateCounts = (rc, cc) => {
    rc = Math.max(1, Math.min(10, rc));
    cc = Math.max(1, Math.min(10, cc));
    setRCount(rc);
    setCCount(cc);
    setRows(Array(rc).fill(""));
    setCols(Array(cc).fill(""));
    setCells(
      Array(rc)
        .fill()
        .map(() => Array(cc).fill("Low"))
    );
  };

  // when you pick an existing matrix to edit, load it
  useEffect(() => {
    if (selectedIdx != null) {
      const m = matrices[selectedIdx];
      setName(m.name);
      setRCount(m.rows.length);
      setCCount(m.cols.length);
      setRows([...m.rows]);
      setCols([...m.cols]);
      setCells(m.cells.map((r) => [...r]));
      setColourMap({ ...m.colourMap });
    } else {
      // new matrix, clear form
      setName("");
      updateCounts(3, 3);
      setColourMap({
        Low: { bg: "#bbf7d0", text: "#166534" },
        Medium: { bg: "#fef3c7", text: "#92400e" },
        High: { bg: "#fed7aa", text: "#9a3412" },
        Critical: { bg: "#fecaca", text: "#991b1b" },
        Extreme: { bg: "#f87171", text: "#7f1d1d" },
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedIdx]);

  // save or update
  const saveMatrix = () => {
    if (!name.trim()) return;
    const m = { name: name.trim(), rows, cols, cells, colourMap };
    setMatrices((ms) => {
      if (selectedIdx == null) return [...ms, m];
      const copy = [...ms];
      copy[selectedIdx] = m;
      return copy;
    });
    setSelectedIdx(null);
  };

  // inline preview component
  function RiskMatrix({ matrixObj }) {
    const { name, rows, cols, cells, colourMap } = matrixObj;
    const [impact, setImpact] = useState(1);
    const [likelihood, setLikelihood] = useState(1);
    const label = cells?.[impact - 1]?.[likelihood - 1] ?? "—";

    return (
      <div className="mb-8">
        <h3 className="text-2xl font-bold text-[#050038] mb-2">{name}</h3>
        <div className="flex space-x-4 mb-4">
          <div>
            <label className="block text-sm text-[#2B245C]">
              Impact (1–{rows.length})
            </label>
            <select
              value={impact}
              onChange={(e) => setImpact(+e.target.value)}
              className="border p-1 rounded"
            >
              {rows.map((_, i) => (
                <option key={i} value={i + 1}>
                  {i + 1}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm text-[#2B245C]">
              Likelihood (1–{cols.length})
            </label>
            <select
              value={likelihood}
              onChange={(e) => setLikelihood(+e.target.value)}
              className="border p-1 rounded"
            >
              {cols.map((_, j) => (
                <option key={j} value={j + 1}>
                  {j + 1}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="overflow-auto bg-white p-2 rounded shadow">
          <table className="min-w-full border-collapse">
            <thead>
              <tr>
                <th className="p-2 border"></th>
                {cols.map((c, j) => (
                  <th key={j} className="p-2 border text-center text-[#050038]">
                    {c}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={i}>
                  <td className="p-2 border font-semibold text-[#050038]">
                    {r}
                  </td>
                  {cols.map((_, j) => {
                    const lvl = cells[i][j];
                    const sel = i + 1 === impact && j + 1 === likelihood;
                    const { bg, text } = colourMap[lvl] || {};
                    return (
                      <td
                        key={j}
                        style={{
                          backgroundColor: bg,
                          color: text,
                          outline: sel ? "2px solid #3b82f6" : "none",
                        }}
                        className="p-2 border text-center"
                      >
                        {lvl}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-2 text-lg font-semibold text-[#050038]">
          Calculated Risk: <span className="text-[#2B245C]">{label}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F2F1FB]">
      {/* top bar */}
      <div className="bg-[#2B245C] text-white p-4">
        <h1 className="text-2xl text-white">Matrix Builder</h1>
      </div>

      <div className="p-6 bg-[#F4F4F9]">
        {/* select existing or new */}
        <div className="flex items-center space-x-4 mb-6">
          <select
            value={selectedIdx ?? ""}
            onChange={(e) =>
              setSelectedIdx(e.target.value === "" ? null : +e.target.value)
            }
            className="border p-2 rounded"
          >
            <option value="">➕ New Matrix</option>
            {matrices.map((m, i) => (
              <option key={i} value={i}>
                {m.name}
              </option>
            ))}
          </select>

          <input
            placeholder="Matrix Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="border p-2 rounded flex-1 min-w-[200px]"
          />
          <input
            type="number"
            min={1}
            max={10}
            value={rCount}
            onChange={(e) => updateCounts(+e.target.value, cCount)}
            className="border p-2 rounded w-20"
            placeholder="Rows"
          />
          <input
            type="number"
            min={1}
            max={10}
            value={cCount}
            onChange={(e) => updateCounts(rCount, +e.target.value)}
            className="border p-2 rounded w-20"
            placeholder="Cols"
          />
          <button
            onClick={saveMatrix}
            className="bg-[#050038] text-white px-4 py-2 rounded"
          >
            {selectedIdx == null ? "Save" : "Update"}
          </button>
        </div>

        {/* labels */}
        <div className="grid grid-cols-2 gap-6 mb-6">
          <div>
            <h4 className="font-semibold text-[#050038] mb-2">Row Labels</h4>
            {rows.map((r, i) => (
              <input
                key={i}
                placeholder={`Row ${i + 1}`}
                value={r}
                onChange={(e) => {
                  const nr = [...rows];
                  nr[i] = e.target.value;
                  setRows(nr);
                }}
                className="border p-1 rounded w-full mb-1"
              />
            ))}
          </div>
          <div>
            <h4 className="font-semibold text-[#050038] mb-2">Col Labels</h4>
            {cols.map((c, j) => (
              <input
                key={j}
                placeholder={`Col ${j + 1}`}
                value={c}
                onChange={(e) => {
                  const nc = [...cols];
                  nc[j] = e.target.value;
                  setCols(nc);
                }}
                className="border p-1 rounded w-full mb-1"
              />
            ))}
          </div>
        </div>

        {/* cell values & colour pickers side-by-side */}
        <div className="flex flex-col lg:flex-row gap-6 mb-6">
          {/* cell values */}
          <div className="overflow-auto flex-1">
            <table className="border-collapse mb-4 w-full">
              <thead>
                <tr>
                  <th></th>
                  {cols.map((c, j) => (
                    <th key={j} className="p-1 text-[#050038]">
                      {c}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((r, i) => (
                  <tr key={i}>
                    <td className="p-1 font-semibold text-[#050038]">{r}</td>
                    {cols.map((_, j) => (
                      <td key={j} className="p-1">
                        <select
                          value={cells[i][j]}
                          onChange={(e) => {
                            const nc = cells.map((rr) => [...rr]);
                            nc[i][j] = e.target.value;
                            setCells(nc);
                          }}
                          className="border p-1 rounded w-full"
                        >
                          {riskLevels.map((v) => (
                            <option key={v} value={v}>
                              {v}
                            </option>
                          ))}
                        </select>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* colour pickers */}
          <div className="flex-1">
            <h4 className="font-semibold text-[#050038] mb-2">
              Pick Colours Per Risk Level
            </h4>
            <div className="grid grid-cols-5 gap-4">
              {riskLevels.map((lvl) => (
                <div key={lvl} className="flex flex-col items-start">
                  <label className="font-medium text-[#050038]">{lvl}</label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="color"
                      value={colourMap[lvl]?.bg || "#ffffff"}
                      onChange={(e) =>
                        setColourMap((cm) => ({
                          ...cm,
                          [lvl]: { ...cm[lvl], bg: e.target.value },
                        }))
                      }
                    />
                    <input
                      type="color"
                      value={colourMap[lvl]?.text || "#000000"}
                      onChange={(e) =>
                        setColourMap((cm) => ({
                          ...cm,
                          [lvl]: { ...cm[lvl], text: e.target.value },
                        }))
                      }
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* previews */}
        {matrices.map((m, i) => (
          <RiskMatrix key={i} matrixObj={m} />
        ))}
      </div>
    </div>
  );
}
