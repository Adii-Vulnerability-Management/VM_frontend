// import React, { useState } from "react";
// import Pagination from "@/components/ui/Pagination";

// export default function DomainTable({ data, title, description }) {
//   const [linkType, setLinkType] = useState("PDF");
//   const [entries, setEntries] = useState(
//     data.map((row) => ({ id: row.id, response: "", notes: "" }))
//   );
//   const responseOptions = ["Y", "Y(C)", "N", "N/A"];

//   // pagination state
//   const [currentPage, setCurrentPage] = useState(1);
//   const rowsPerPage = 10;
//   const totalPages = Math.ceil(data.length / rowsPerPage);
//   const paged = data.slice(
//     (currentPage - 1) * rowsPerPage,
//     currentPage * rowsPerPage
//   );

//   const handleResponseChange = (id, resp) => {
//     setEntries((e) =>
//       e.map((x) => (x.id === id ? { ...x, response: resp } : x))
//     );
//   };
//   const handleNotesChange = (id, notes) => {
//     setEntries((e) => e.map((x) => (x.id === id ? { ...x, notes } : x)));
//   };

//   return (
//     <div className="p-2 bg-white rounded-lg shadow-lg">
//       <h2 className="text-2xl font-bold text-[#2B245C] mb-2">{title}</h2>
//       <p className="text-sm text-gray-700 mb-4">{description}</p>

//       <div className="mb-4 flex items-center space-x-2">
//         <label className="font-medium text-sm">Link type:</label>
//         <select
//           value={linkType}
//           onChange={(e) => setLinkType(e.target.value)}
//           className="text-sm p-1 border rounded"
//         >
//           <option value="PDF">PDF</option>
//           <option value="Web">Web page</option>
//         </select>
//       </div>

//       <table className="w-full table-auto border-collapse text-sm">
//         <thead className="bg-[#050038] text-white">
//           <tr>
//             <th className="border px-2 py-1 text-center">ID</th>
//             <th className="border px-2 py-1 text-center">Assessment Factor</th>
//             <th className="border px-2 py-1 text-center">Component</th>
//             <th className="border px-2 py-1 text-center">Maturity Level</th>
//             <th className="border px-2 py-1 text-center">Response</th>
//             <th className="border px-2 py-1 text-center">
//               Declarative Statement
//             </th>
//             <th className="border px-2 py-1 text-center">Useful Links</th>
//             <th className="border px-2 py-1 text-center">Notes</th>
//             <th className="border px-2 py-1 text-center">Appendix A</th>
//           </tr>
//         </thead>
//         <tbody>
//           {paged.map((row, i) => {
//             const entry = entries.find((e) => e.id === row.id) || {};
//             return (
//               <tr key={row.id} className={i % 2 === 0 ? "bg-[#F2F1FB]" : ""}>
//                 <td className="border px-2 py-2 text-center">{row.id}</td>
//                 <td className="border px-2 py-2 align-top">{row.factor}</td>
//                 <td className="border px-2 py-2 align-top">{row.component}</td>
//                 <td className="border px-2 py-2 text-center">{row.maturity}</td>
//                 <td className="border px-2 py-2">
//                   <select
//                     value={entry.response || ""}
//                     onChange={(e) =>
//                       handleResponseChange(row.id, e.target.value)
//                     }
//                     className="w-full p-2 text-sm border rounded"
//                   >
//                     <option value="">Select</option>
//                     {responseOptions.map((o) => (
//                       <option key={o} value={o}>
//                         {o}
//                       </option>
//                     ))}
//                   </select>
//                 </td>
//                 <td className="border px-2 py-2 align-top">{row.statement}</td>
//                 <td className="border px-2 py-2">
//                   <input
//                     type="text"
//                     value={row.reference || ""}
//                     readOnly
//                     className="w-full p-2 text-sm border rounded"
//                   />
//                 </td>
//                 <td className="border px-2 py-2">
//                   <input
//                     type="text"
//                     value={entry.notes || ""}
//                     onChange={(e) => handleNotesChange(row.id, e.target.value)}
//                     className="w-full p-2 text-sm border rounded"
//                   />
//                 </td>
//                 <td className="border px-2 py-2 text-center">
//                   <input
//                     type="text"
//                     value={row.appendix || ""}
//                     readOnly
//                     className="w-full p-2 text-sm border rounded text-center"
//                   />
//                 </td>
//               </tr>
//             );
//           })}
//         </tbody>
//       </table>

//       <Pagination
//         currentPage={currentPage}
//         totalPages={totalPages}
//         onPageChange={(p) => p >= 1 && p <= totalPages && setCurrentPage(p)}
//       />
//     </div>
//   );
// }
// components/DomainCardView.js
// components/DomainCardView.js
// components/DomainCardView.js
import React, { useState } from "react";
import Accordion from "@/components/ui/Accordion";
import Pagination from "@/components/ui/Pagination";
import {
  FaClipboard,
  FaFileUpload,
  FaLink,
  FaSave,
  FaPlus,
} from "react-icons/fa";
import PivotReport from "./PivotReport";
export default function DomainTable({
  data,
  title,
  description,
  answers = [],
  onChange,
}) {
  // no local state—build entries from the parent’s answers, or initialize if empty
  const entries = answers.length
    ? answers
    : data.map((row) => ({
        id: row.id,
        factor: row.factor,
        component: row.component,
        response: "",
        maturity: row.maturity || "",
        // response: "Y",
        // maturity: row.maturity || "Baseline",

        notes: "",
        refDocs: [{ name: "", file: null, link: "" }],
        appendix: "",
      }));

  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;
  const totalPages = Math.ceil(data.length / rowsPerPage);
  const paged = data.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  const responseOptions = ["Y", "Y(C)", "N", "N/A"];
  const maturityOptions = [
    "Innovative",
    "Advanced",
    "Intermediate",
    "Evolving",
    "Baseline",
  ];

  // Handlers
  const updateEntry = (id, field, value) => {
    const next = entries.map((x) =>
      x.id === id ? { ...x, [field]: value } : x
    );
    onChange(next);
  };
  const updateRefDoc = (id, idx, field, value) => {
    const next = entries.map((x) => {
      if (x.id !== id) return x;
      const docs = x.refDocs.map((d, i) =>
        i === idx ? { ...d, [field]: value } : d
      );
      return { ...x, refDocs: docs };
    });
    onChange(next);
  };

  const addRefDoc = (id) => {
    const next = entries.map((x) =>
      x.id === id
        ? { ...x, refDocs: [...x.refDocs, { name: "", file: null, link: "" }] }
        : x
    );
    onChange(next);
  };

   // now takes the full `row` object
  const handleSave = (row) => {
      const entry = entries.find((e) => e.id === row.id);
      if (!entry) return;
  
      const payload = {
        id:         row.id,
        factor:     row.factor,
        component:  row.component,
        statement:  row.statement,
  
        maturity:   entry.maturity,
        response:   entry.response,
        notes:      entry.notes,
  
        references: entry.refDocs.map((d) => ({
          name: d.name,
          link: d.link,
          file: d.file,
        })),
  
        appendix:   entry.appendix,
      };
  
      console.log("Saving entry payload:", payload);
      // TODO: actually post `payload` to your API here
    };

  return (
    <div className="p-4 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-[#2B245C] mb-2">{title}</h2>
      <p className="text-sm text-gray-700 mb-4">{description}</p>

      

      <div className="space-y-3">
        {paged.map((row) => {
          const entry = entries.find((e) => e.id === row.id) || {};
          return (
            <Accordion
              key={row.id}
              title={`${row.id}: ${row.factor} / ${row.component}`}
              icon={FaClipboard}
            >
              <div className="space-y-4">
                {/* Maturity Dropdown */}
                <div>
                  <strong>Maturity:</strong>
                  <select
                    value={entry.maturity}
                    onChange={(e) =>
                      updateEntry(row.id, "maturity", e.target.value)
                    }
                    disabled
                    className="ml-2 p-1 border rounded text-sm"
                  >
                    <option value="">Select</option>
                    {maturityOptions.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Response Dropdown */}
                <div>
                  <strong>Response:</strong>
                  <select
                    value={entry.response}
                    onChange={(e) =>
                      updateEntry(row.id, "response", e.target.value)
                    }
                    className="ml-2 p-1 border rounded text-sm"
                  >
                    <option value="">Select</option>
                    {responseOptions.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Declarative Statement */}
                <div>
                  <strong>Statement:</strong>
                  <p className="mt-1 text-sm text-gray-800">{row.statement}</p>
                </div>

                {/* Reference Documents / Links */}
                <div>
                  <strong>References:</strong>
                  <div className="space-y-2 mt-2">
                    {entry.refDocs.map((doc, idx) => (
                      <div key={idx} className="flex items-center space-x-2">
                        <input
                          type="text"
                          placeholder="Doc name"
                          value={doc.name}
                          onChange={(e) =>
                            updateRefDoc(row.id, idx, "name", e.target.value)
                          }
                          className="p-1 border rounded text-sm flex-1"
                        />
                        <input
                          type="file"
                          onChange={(e) =>
                            updateRefDoc(row.id, idx, "file", e.target.files[0])
                          }
                          className="text-sm"
                        />
                        <input
                          type="text"
                          placeholder="Enter URL"
                          value={doc.link}
                          onChange={(e) =>
                            updateRefDoc(row.id, idx, "link", e.target.value)
                          }
                          className="p-1 border rounded text-sm flex-1"
                        />
                      </div>
                    ))}
                    <button
                      onClick={() => addRefDoc(row.id)}
                      className="flex items-center mt-1 text-indigo-600 hover:underline text-sm"
                    >
                      <FaPlus className="mr-1" /> Add Reference
                    </button>
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <strong>Notes:</strong>
                  <textarea
                    rows={2}
                    value={entry.notes}
                    onChange={(e) =>
                      updateEntry(row.id, "notes", e.target.value)
                    }
                    className="w-full p-1 border rounded text-sm mt-1"
                  />
                </div>

                {/* Appendix A Input */}
                <div>
                  <strong>Appendix A:</strong>
                  <input
                    type="text"
                    value={entry.appendix}
                    onChange={(e) =>
                      updateEntry(row.id, "appendix", e.target.value)
                    }
                    className="ml-2 p-1 border rounded text-sm w-full"
                  />
                </div>

                {/* Save Button */}
                <div className="text-right">
                  <button
                    onClick={() => handleSave(row)}
                    className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
                  >
                    <FaSave className="mr-2" /> Save
                  </button>
                </div>
              </div>
            </Accordion>
          );
        })}
      </div>

      <div className="mt-4">
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={(p) => p >= 1 && p <= totalPages && setCurrentPage(p)}
        />
      </div>
    </div>
  );
}
