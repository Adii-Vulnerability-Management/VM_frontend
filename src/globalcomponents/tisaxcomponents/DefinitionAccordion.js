// components/globalComponents/DefinitionAccordion.js

import React, { useState } from "react";
import { AiOutlineDown, AiOutlineUp } from "react-icons/ai";

function DefinitionAccordion({ title, data, headers, charactersPerLine = 60 }) {
  const [isOpen, setIsOpen] = useState(false);

  const toggleSection = () => setIsOpen(!isOpen);

  const splitTextIntoLines = (text, charactersPerLine) => {
    const lines = [];
    let currentLine = "";

    text.split(" ").forEach((word) => {
      if ((currentLine + word).length <= charactersPerLine) {
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
    <div className="mb-4">
      <div
        className="flex items-center justify-between p-4 bg-[#F4F4F9] cursor-pointer"
        onClick={toggleSection}
      >
        <strong>{title}</strong>
        <span>{isOpen ? <AiOutlineUp /> : <AiOutlineDown />}</span>
      </div>
      {isOpen && (
        <div className="p-4 border border-[#E0E0E0]">
          <div className="overflow-x-auto max-h-80">
            <table className="min-w-full table-auto border border-[#E0E0E0]">
              <thead className="bg-[#F8F9FA] sticky top-0">
                <tr>
                  {headers.map((header, index) => (
                    <th key={index} className="border px-4 py-2 border-[#E0E0E0]">
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data && data.length > 0 ? (
                  data.map((row, rowIndex) => (
                    <tr key={rowIndex} className="hover:bg-[#F4F4F9]">
                      {Object.values(row).map((cell, cellIndex) => (
                        <td
                          key={cellIndex}
                          className="border px-4 py-2 text-sm text-gray-800 break-words"
                          dangerouslySetInnerHTML={{
                            __html: cell
                              ? splitTextIntoLines(cell, charactersPerLine)
                              : "",
                          }}
                        />
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
        </div>
      )}
    </div>
  );
}

export default DefinitionAccordion;
