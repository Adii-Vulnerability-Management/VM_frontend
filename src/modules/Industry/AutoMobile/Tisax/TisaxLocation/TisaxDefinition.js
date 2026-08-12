// components/TisaxDefinition.js
import React from "react";
import Accordion from "@/components/ui/Accordion";
import {
  Definition1Json,
  Definition2Json,
  Definition3Json,
} from "@/config/config";

function renderTable(headers, data, charactersPerLine = 60) {
  const splitTextIntoLines = (text, limit) => {
    const lines = [];
    let currentLine = "";

    text.split(" ").forEach((word) => {
      if ((currentLine + word).length <= limit) {
        currentLine += word + " ";
      } else {
        lines.push(currentLine.trim());
        currentLine = word + " ";
      }
    });

    if (currentLine.trim() !== "") {
      lines.push(currentLine.trim());
    }

    return lines.join("<br>");
  };

  return (
    <div className="overflow-x-auto max-h-96">
      <table className="min-w-full table-auto border border-[#000000]">
        <thead className="bg-[#F8F9FA]   sticky top-0">
          <tr>
            {headers.map((header, index) => (
              <th
                key={index}
                className="border px-4 py-2 border-[#000000] text-sm text-left"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length > 0 ? (
            data.map((row, rowIndex) => (
              <tr key={rowIndex} className="hover:bg-[#F4F4F9]">
                {Object.values(row).map((cell, cellIndex) => (
                  <td
                    key={cellIndex}
                    className="border px-4 py-2 text-sm text-gray-800 align-top"
                    dangerouslySetInnerHTML={{
                      __html: cell
                        ? splitTextIntoLines(cell, charactersPerLine)
                        : "",
                    }}
                  ></td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={headers.length} className="text-center py-4">
                No data available
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

function TisaxDefinition() {
  return (
    <div className="pb-4 p-4 bg-[#F4F4F9] min-h-screen">
      <h1 className="text-3xl font-bold text-[#2B245C] mb-6">
        Information Security Assessment - Definitions
      </h1>
      <Accordion title="Tabs">
        {renderTable(
          ["Tab", "Description", "Intended use of tab"],
          Definition1Json,
          60
        )}
      </Accordion>
      <Accordion title="Key Terms">
        {renderTable(["Term", "Explanation", "Example"], Definition2Json, 40)}
      </Accordion>
      <Accordion title="Glossary">
        {renderTable(["Term", "Explanation", "Example"], Definition3Json, 40)}
      </Accordion>
    </div>
  );
}

export default TisaxDefinition;
