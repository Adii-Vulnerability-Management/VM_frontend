import React from "react";
import { useRouter } from "next/router";

export default function TableOfContents() {
  const router = useRouter();
  const navigate = (sheet) => {
    router.push(
      { query: { ...router.query, tab: encodeURIComponent(sheet) } },
      undefined,
      { shallow: true }
    );
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg space-y-4">
      {/* Header */}
      <h2 className="text-2xl font-bold text-[#2B245C]">Links to Worksheets</h2>

      <ul className="space-y-3 text-sm text-gray-700">
        {/* Summary */}
        <li>
          <button
            onClick={() => navigate("Summary")}
            className="font-medium text-blue-600 hover:underline"
          >
            Summary
          </button>
          <span className="ml-2">
            The overall comparison of inherent risk and cybersecurity maturity
          </span>
        </li>

        {/* Inherent Risks Group */}
        <li>
          <span className="font-semibold">Inherent Risks</span>
          <span className="ml-2">Inherent risk summary</span>
          <ul className="ml-4 mt-1 space-y-1">
            <li>
              <button
                onClick={() => navigate("InherentRiskDomain1")}
                className="text-blue-600 hover:underline"
              >
                Domain 1
              </button>
            </li>
            <li>
              <button
                onClick={() => navigate("InherentRiskDomain2")}
                className="text-blue-600 hover:underline"
              >
                Domain 2
              </button>
            </li>
            <li>
              <button
                onClick={() => navigate("InherentRiskDomain3")}
                className="text-blue-600 hover:underline"
              >
                Domain 3
              </button>
            </li>
            <li>
              <button
                onClick={() => navigate("InherentRiskDomain4")}
                className="text-blue-600 hover:underline"
              >
                Domain 4
              </button>
            </li>
            <li>
              <button
                onClick={() => navigate("InherentRiskDomain5")}
                className="text-blue-600 hover:underline"
              >
                Domain 5
              </button>
            </li>
          </ul>
        </li>

        {/* Cybersecurity Maturity Group */}
        <li>
          <span className="font-semibold">Cybersecurity Maturity</span>
          <span className="ml-2">Cybersecurity maturity heat map</span>
          <ul className="ml-4 mt-1 space-y-1">
            <li>
              <button
                onClick={() => navigate("MaturityHeatMap")}
                className="text-blue-600 hover:underline"
              >
                Heat Map
              </button>
            </li>
            <li>
              <button
                onClick={() => navigate("MaturitySummary")}
                className="text-blue-600 hover:underline"
              >
                Detailed Summary
              </button>
            </li>
            <li>
              <button
                onClick={() => navigate("MaturityDomain1")}
                className="text-blue-600 hover:underline"
              >
                Domain 1 Details
              </button>
            </li>
            <li>
              <button
                onClick={() => navigate("MaturityDomain2")}
                className="text-blue-600 hover:underline"
              >
                Domain 2 Details
              </button>
            </li>
            <li>
              <button
                onClick={() => navigate("MaturityDomain3")}
                className="text-blue-600 hover:underline"
              >
                Domain 3 Details
              </button>
            </li>
            <li>
              <button
                onClick={() => navigate("MaturityDomain4")}
                className="text-blue-600 hover:underline"
              >
                Domain 4 Details
              </button>
            </li>
            <li>
              <button
                onClick={() => navigate("MaturityDomain5")}
                className="text-blue-600 hover:underline"
              >
                Domain 5 Details
              </button>
            </li>
          </ul>
        </li>

        {/* Organizational Group */}
        <li>
          <span className="font-semibold">Organizational</span>
          <span className="ml-2">Information about this workbook</span>
          <ul className="ml-4 mt-1 space-y-1">
            <li>
              <button
                onClick={() => navigate("Log")}
                className="text-blue-600 hover:underline"
              >
                Change Log
              </button>
            </li>
            <li>
              <button
                onClick={() => navigate("TOC")}
                className="text-blue-600 hover:underline"
              >
                This Worksheet (TOC)
              </button>
            </li>
          </ul>
        </li>

        {/* Reference */}
        <li>
          <button
            onClick={() => navigate("AppendixA")}
            className="font-medium text-blue-600 hover:underline"
          >
            Appendix A
          </button>
          <span className="ml-2">
            Mapping Baseline Statements to FFIEC IT Examination Handbook
          </span>
        </li>

        {/* User Work Area */}
        <li>
          <span className="font-semibold">User Work Area</span>
          <ul className="ml-4 mt-1 space-y-1">
            <li>
              <button
                onClick={() => navigate("CustomReports")}
                className="text-blue-600 hover:underline"
              >
                Custom Calculations & Charts
              </button>
            </li>
            <li>
              <button
                onClick={() => navigate("CombinedPivot")}
                className="text-blue-600 hover:underline"
              >
                Combined Pivot Table
              </button>
            </li>
          </ul>
        </li>
      </ul>
    </div>
  );
}
