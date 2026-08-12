// src/modules/Industry/BankingAndFinance/FFIECHub/AssessmentTable.js
import React, { useState, useEffect, useRef } from "react";

export default function AssessmentTable({
  questions = [], // [{ id, text, options }]
  riskLevels = [], // ["Least", "Minimal", …]
  answers = [], // parent-driven [{ id, selected, notes }]
  onChange = () => {},
}) {
  // Internal copy of answers
  // initialize only once from answers prop
  const [entries, setEntries] = useState(() =>
    answers.length
      ? answers
      : questions.map((q) => ({ id: q.id, selected: "", notes: "" }))
  );

  // skip the very first onChange (mount)
  const didMountRef = useRef(false);
  useEffect(() => {
    if (didMountRef.current) {
      onChange(entries);
    } else {
      didMountRef.current = true;
    }
  }, [entries]); // only re-run when entries change
  // Totals computation (unchanged)
  const totals = questions.reduce(
    (acc, q) => {
      const e = entries.find((x) => x.id === q.id) || {};
      if (e.selected) {
        acc.responses++;
        acc.byRisk[e.selected] = (acc.byRisk[e.selected] || 0) + 1;
      }
      return acc;
    },
    {
      questions: questions.length,
      responses: 0,
      byRisk: riskLevels.reduce((o, lvl) => ({ ...o, [lvl]: 0 }), {}),
    }
  );

  // Handlers
  const handleSelect = (id, val) =>
    setEntries((prev) =>
      prev.map((e) => (e.id === id ? { ...e, selected: val } : e))
    );
  const handleNotes = (id, val) =>
    setEntries((prev) =>
      prev.map((e) => (e.id === id ? { ...e, notes: val } : e))
    );

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg space-y-6">
      {/* Summary Row */}
      <div className="flex flex-row  gap-2 text-sm bg-[#2B245C] text-white py-2 px-4 items-center">
        <div className="flex-1 font-medium">
          Total Questions : {totals.questions}
        </div>
        <div className="flex-1 font-medium">
          Total Responses : {totals.responses}
        </div>
        <div className="flex-1 font-medium text-center">
          Responses by Risk Profile :
        </div>
        {riskLevels.map((lvl) => (
          <div key={lvl} className="text-center flex-1">
            <div className="text-xs font-semibold">{lvl}</div>
            <div>{totals.byRisk[lvl]}</div>
          </div>
        ))}
      </div>

      {/* Detailed Table */}
      <table className="w-full table-auto border-collapse mt-4">
        <thead className="bg-[#2B245C] text-white text-center">
          <tr>
            <th className="border px-2 py-2">#</th>
            <th className="border px-2 py-2">Risk</th>
            <th className="border px-2 py-2">Score</th>
            {riskLevels.map((lvl, i) => (
              <th key={lvl} className="border px-2 py-2">
                {lvl} ({i + 1})
              </th>
            ))}

            <th className="border px-2 py-2">Notes</th>
          </tr>
        </thead>
        <tbody>
          {questions.map((q, idx) => {
            const entry = entries.find((e) => e.id === q.id) || {
              selected: "",
              notes: "",
            };
            return (
              <tr
                key={q.id}
                className={`${
                  idx % 2 === 0 ? "bg-[#F2F1FB]" : "bg-white"
                } hover:bg-gray-100`}
              >
                <td className="border px-2 py-1 text-center">{idx + 1}</td>
                <td className="border px-2 py-1">{q.text}</td>
                <td className="border px-2 py-1">
                  <select
                    value={entry.selected}
                    onChange={(e) => handleSelect(q.id, e.target.value)}
                    className="w-full p-1 text-sm border rounded"
                  >
                    <option value="">Select</option>
                    {riskLevels.map((lvl) => (
                      <option key={lvl} value={lvl}>
                        {lvl}
                      </option>
                    ))}
                  </select>
                </td>
                {riskLevels.map((lvl) => (
                  <td
                    key={lvl}
                    className={`border px-2 py-2 whitespace-normal align-top text-xs ${
                      entry.selected === lvl ? "bg-blue-100 font-semibold" : ""
                    }`}
                  >
                    {q.options[lvl]}
                  </td>
                ))}
                <td className="border px-2 py-1">
                  <input
                    type="text"
                    value={entry.notes}
                    onChange={(e) => handleNotes(q.id, e.target.value)}
                    className="w-full p-1 text-sm border rounded"
                  />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// src/modules/Industry/BankingAndFinance/FFIECHub/AssessmentTable.js
// import React, { useState, useEffect, useRef } from "react";
// import Accordion from "@/components/ui/Accordion";

// export default function AssessmentTable({
//   questions = [],     // [{ id, text, options: { [level]: desc } }]
//   riskLevels = [],    // ["Least","Minimal",…]
//   answers = [],       // initial answers: [{ id, selected, notes }]
//   onChange = () => {},// callback(entries) when user updates
// }) {
//   // ─── State ──────────────────────────────────────────────────────
//   const [entries, setEntries] = useState(() =>
//     answers.length
//       ? answers
//       : questions.map((q) => ({ id: q.id, selected: "", notes: "" }))
//   );
//   const didMountRef = useRef(false);

//   // ─── Notify parent on entries change ────────────────────────────
//   useEffect(() => {
//     if (didMountRef.current) {
//       onChange(entries);
//     } else {
//       didMountRef.current = true;
//     }
//   }, [entries]);

//   // ─── Totals ─────────────────────────────────────────────────────
//   const totals = questions.reduce(
//     (acc, q) => {
//       const e = entries.find((x) => x.id === q.id) || {};
//       if (e.selected) {
//         acc.responses++;
//         acc.byRisk[e.selected] = (acc.byRisk[e.selected] || 0) + 1;
//       }
//       return acc;
//     },
//     {
//       questions: questions.length,
//       responses: 0,
//       byRisk: riskLevels.reduce((o, lvl) => ({ ...o, [lvl]: 0 }), {}),
//     }
//   );

//   // ─── Handlers ───────────────────────────────────────────────────
//   const handleSelect = (id, val) =>
//     setEntries((prev) =>
//       prev.map((e) => (e.id === id ? { ...e, selected: val } : e))
//     );
//   const handleNotes = (id, notes) =>
//     setEntries((prev) =>
//       prev.map((e) => (e.id === id ? { ...e, notes } : e))
//     );

//   // ─── Render ─────────────────────────────────────────────────────
//   return (
//     <div className="p-6 bg-white rounded-lg shadow-lg space-y-6">
//       {/* Summary */}
//       <div className="flex gap-4 text-sm bg-[#2B245C] text-white py-2 px-4 rounded">
//         <div className="flex-1 font-medium">Questions: {totals.questions}</div>
//         <div className="flex-1 font-medium">Answered: {totals.responses}</div>
//         {riskLevels.map((lvl) => (
//           <div key={lvl} className="flex-1 text-center">
//             <div className="text-xs font-semibold">{lvl}</div>
//             <div>{totals.byRisk[lvl]}</div>
//           </div>
//         ))}
//       </div>

//       {/* Accordion Cards */}
//       <div className="space-y-4">
//         {questions.map((q, idx) => {
//           const e = entries.find((x) => x.id === q.id) || {
//             selected: "",
//             notes: "",
//           };
//           return (
//             <Accordion key={q.id} title={`${idx + 1}. ${q.text}`}>
//               <div className="space-y-4">
//                 {/* Score Radios */}
//                 <div className="flex flex-wrap gap-6">
//                   {riskLevels.map((lvl) => (
//                     <label key={lvl} className="flex items-center space-x-2">
//                       <input
//                         type="radio"
//                         name={`score-${q.id}`}
//                         value={lvl}
//                         checked={e.selected === lvl}
//                         onChange={() => handleSelect(q.id, lvl)}
//                         className="form-radio h-4 w-4 text-indigo-600"
//                       />
//                       <span className="text-sm">{lvl}</span>
//                     </label>
//                   ))}
//                 </div>

//                 {/* Descriptions */}
//                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//                   {riskLevels.map((lvl) => (
//                     <div
//                       key={lvl}
//                       className={`p-2 border rounded text-xs ${
//                         e.selected === lvl
//                           ? "bg-blue-50 border-blue-200 font-semibold"
//                           : "bg-gray-50 border-gray-200"
//                       }`}
//                     >
//                       <div className="font-medium mb-1">{lvl}</div>
//                       <div>{q.options[lvl]}</div>
//                     </div>
//                   ))}
//                 </div>

//                 {/* Notes */}
//                 <div>
//                   <textarea
//                     rows={3}
//                     placeholder="Add notes..."
//                     value={e.notes}
//                     onChange={(ev) => handleNotes(q.id, ev.target.value)}
//                     className="w-full p-2 border rounded text-sm"
//                   />
//                 </div>
//               </div>
//             </Accordion>
//           );
//         })}
//       </div>
//     </div>
//   );
// }

// src/modules/Industry/BankingAndFinance/FFIECHub/AssessmentWizard.js
// import React, { useState, useEffect, useRef } from "react";

// export default function AssessmentWizard({
//   questions = [],      // [{ id, text, options }]
//   riskLevels = [],     // ["Least","Minimal",…]
//   answers = [],        // initial [{ id, selected, notes }]
//   onChange = () => {}, // callback(updatedEntries)
// }) {
//   // initialize entries only once
//   const [entries, setEntries] = useState(() =>
//     answers.length
//       ? answers
//       : questions.map(q => ({ id: q.id, selected: "", notes: "" }))
//   );
//   const [idx, setIdx] = useState(0);
//   const didMount = useRef(false);

//   // notify parent on entries change (skip mount)
//   useEffect(() => {
//     if (didMount.current) onChange(entries);
//     else didMount.current = true;
//   }, [entries]);

//   const current = questions[idx];
//   const entry = entries.find(e => e.id === current.id) || { selected: "", notes: "" };

//   const updateEntry = (field, value) => {
//     setEntries(prev =>
//       prev.map(e =>
//         e.id === current.id ? { ...e, [field]: value } : e
//       )
//     );
//   };

//   return (
//     <div className="max-w-xl mx-auto bg-white p-6 rounded-lg shadow">
//       {/* Progress */}
//       <div className="mb-4 text-sm text-gray-600">
//         Question {idx + 1} of {questions.length}
//         <div className="h-2 bg-gray-200 rounded-full overflow-hidden mt-1">
//           <div
//             className="h-full bg-indigo-600"
//             style={{
//               width: `${((idx + (entry.selected ? 1 : 0)) / questions.length) * 100}%`,
//             }}
//           />
//         </div>
//       </div>

//       {/* Question */}
//       <h2 className="text-lg font-semibold mb-4">{current.text}</h2>

//       {/* Score Radios */}
//       <div className="flex flex-wrap gap-4 mb-4">
//         {riskLevels.map(lvl => (
//           <label key={lvl} className="flex items-center space-x-2">
//             <input
//               type="radio"
//               name={`score-${current.id}`}
//               value={lvl}
//               checked={entry.selected === lvl}
//               onChange={() => updateEntry("selected", lvl)}
//               className="form-radio h-4 w-4 text-indigo-600"
//             />
//             <span>{lvl}</span>
//           </label>
//         ))}
//       </div>

//       {/* Descriptions */}
//       <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
//         {riskLevels.map(lvl => (
//           <div
//             key={lvl}
//             className={`p-2 border rounded text-xs ${
//               entry.selected === lvl
//                 ? "bg-indigo-50 border-indigo-200 font-medium"
//                 : "bg-gray-50 border-gray-200"
//             }`}
//           >
//             <div className="mb-1">{lvl}</div>
//             <div>{current.options[lvl]}</div>
//           </div>
//         ))}
//       </div>

//       {/* Notes */}
//       <textarea
//         rows={3}
//         placeholder="Add notes..."
//         value={entry.notes}
//         onChange={e => updateEntry("notes", e.target.value)}
//         className="w-full p-2 border rounded mb-6 text-sm"
//       />

//       {/* Navigation */}
//       <div className="flex justify-between">
//         <button
//           onClick={() => setIdx(i => Math.max(i - 1, 0))}
//           disabled={idx === 0}
//           className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
//         >
//           Back
//         </button>
//         <button
//           onClick={() =>
//             setIdx(i => Math.min(i + 1, questions.length - 1))
//           }
//           disabled={idx === questions.length - 1}
//           className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50"
//         >
//           Next
//         </button>
//       </div>
//     </div>
//   );
// }
