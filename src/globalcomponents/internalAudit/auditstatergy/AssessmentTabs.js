// src/components/auditstatergy/AssessmentTabs.jsx
import React from "react";
import * as XLSX from "xlsx";

export default function AssessmentTabs({ data, onChange }) {
    const { activeTab,
        selfQuestions, peerQuestions, benchQuestions,
        selfAnswers, peerAnswers, benchAnswers } = data;
    const tabs = ["Self Assessment", "Peer Review", "Benchmarking"];
    const sampleExcelUrl = "/excels/audit-statery.xlsx";

    // helpers to emit partial updates
    const update = upd => onChange({ ...data, ...upd });

    const handleFile = e => {
        const file = e.target.files[0]; if (!file) return;
        const reader = new FileReader();
        reader.onload = evt => {
            const wb = XLSX.read(evt.target.result, { type: "binary" });
            const rows = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { header: 1 })
                .map(r => r[0]).filter(Boolean);
            if (activeTab === 0) update({ selfQuestions: rows, selfAnswers: Array(rows.length).fill(0) });
            else if (activeTab === 1) update({ peerQuestions: rows, peerAnswers: Array(rows.length).fill(0) });
            else update({ benchQuestions: rows, benchAnswers: Array(rows.length).fill("") });
        };
        reader.readAsBinaryString(file);
    };

    const changeAnswer = (tab, i, v) => {
        const key = tab === 0 ? "selfAnswers" : tab === 1 ? "peerAnswers" : "benchAnswers";
        const copy = [...data[key]]; copy[i] = tab < 2 ? Number(v) : v;
        update({ [key]: copy });
    };

    const totals = {
        self: selfAnswers.reduce((a, b) => a + b, 0),
        peer: peerAnswers.reduce((a, b) => a + b, 0),
        yes: benchAnswers.filter(x => x === "Yes").length,
        no: benchAnswers.filter(x => x === "No").length
    };

    return (
        <div>
            <div className="flex justify-between mb-4">
                <input type="file" accept=".xls,.xlsx" onChange={handleFile} />
                <a href={sampleExcelUrl} download className="bg-blue-600 text-white px-4 py-2 rounded">
                    Download Sample Excel
                </a>
            </div>
            <div className="flex border-b mb-4">
                {tabs.map((t, i) => (
                    <button
                        key={i}
                        onClick={() => {
                            update({
                                activeTab: i,
                                selfAnswers: Array(selfQuestions.length).fill(0),
                                peerAnswers: Array(peerQuestions.length).fill(0),
                                benchAnswers: Array(benchQuestions.length).fill("")
                            });
                        }} className={`px-4 py-2 ${activeTab === i ? "border-b-2 text-blue-600" : "text-gray-600"}`}
                    >{t}</button>
                ))}
            </div>

            {activeTab === 0 && (
                <section>
                    <h3 className="font-bold mb-2">Self Assessment</h3>
                    {selfQuestions.map((q, i) => (
                        <div key={i} className="flex justify-between mb-2">
                            <span>{q}</span>
                            {[1, 2, 3, 4, 5].map(n => (
                                <label key={n} className="ml-2">
                                    <input
                                        type="radio"
                                        name={`self-${i}`}
                                        value={n}
                                        checked={selfAnswers[i] === n}
                                        onChange={e => changeAnswer(0, i, e.target.value)}
                                    />{n}
                                </label>
                            ))}
                        </div>
                    ))}
                    <div className="font-semibold text-right">Total: {totals.self}</div>
                </section>
            )}

            {activeTab === 1 && (
                <section>
                    <h3 className="font-bold mb-2">Peer Review</h3>
                    {peerQuestions.map((q, i) => (
                        <div key={i} className="flex justify-between mb-2">
                            <span>{q}</span>
                            {[1, 2, 3, 4, 5].map(n => (
                                <label key={n} className="ml-2">
                                    <input
                                        type="radio"
                                        name={`peer-${i}`}
                                        value={n}
                                        checked={peerAnswers[i] === n}
                                        onChange={e => changeAnswer(1, i, e.target.value)}
                                    />{n}
                                </label>
                            ))}
                        </div>
                    ))}
                    <div className="font-semibold text-right">Total: {totals.peer}</div>
                </section>
            )}

            {activeTab === 2 && (
                <section>
                    <h3 className="font-bold mb-2">Benchmarking</h3>
                    {benchQuestions.map((q, i) => (
                        <div key={i} className="flex justify-between mb-2">
                            <span>{q}</span>
                            {["Yes", "No"].map(opt => (
                                <label key={opt} className="ml-2">
                                    <input
                                        type="radio"
                                        name={`bench-${i}`}
                                        value={opt}
                                        checked={benchAnswers[i] === opt}
                                        onChange={e => changeAnswer(2, i, e.target.value)}
                                    />{opt}
                                </label>
                            ))}
                        </div>
                    ))}
                    <div className="font-semibold text-right">
                        Yes: {totals.yes} | No: {totals.no}
                    </div>
                </section>
            )}
        </div>
    );
}
