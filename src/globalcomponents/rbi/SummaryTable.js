import React from "react";
import PropTypes from "prop-types";

const SummaryTable = ({ data, level, tableType }) => {
  const PREDEFINED_RESPONSES = [
    "Not Applicable",
    "Not Implemented",
    "Partially Implemented",
    "Fully Implemented",
    "Not Responded",
    "Total",
  ];

  const levelsHierarchy = ["Basic", "Level1", "Level2", "Level3", "Level4"];

  const calculateCounts = (currentLevel) => {
    const counts = {};
    const responseCounts = {};
    const cumulativeCounts = {};

    // Initialize counts and cumulativeCounts
    PREDEFINED_RESPONSES.forEach((response) => {
      counts[response] = { High: 0, Medium: 0, Low: 0, Total: 0 };
      cumulativeCounts[response] = { High: 0, Medium: 0, Low: 0, Total: 0 };
      responseCounts[response] = 0;
    });

    // Calculate regular counts first
    data.forEach((row) => {
      if (row.Level === currentLevel && row["Control Category"]) {
        let valueToCheck = null;

        if (tableType === "Control Point Response Rate") {
          valueToCheck = row["Control Point Response Rate"];
        } else if (tableType === "Probability of Risk") {
          valueToCheck = row["Probability of Risk"];
        } else if (tableType === "Impact of Risk") {
          valueToCheck = row["Impact of Risk"];
        } else if (
          tableType === "Policy and Procedures in Place" &&
          row["Policy and Procedures in Place"] === "No"
        ) {
          valueToCheck = row["Risk Category"];
        } else if (
          tableType === "Tools / Configuration Implemented" &&
          row["Tools / Configuration Implemented"] === "No"
        ) {
          valueToCheck = row["Risk Category"];
        } else if (
          tableType === "Reports and Records are Available" &&
          row["Reports and Records are Available"] === "No"
        ) {
          valueToCheck = row["Risk Category"];
        }

        let responseType = row["Control Implemented?"];

        // Treat "Select" as "Not Implemented"
        if (responseType === "Select") {
          responseType = "Not Implemented";
        }

        if (!PREDEFINED_RESPONSES.includes(responseType)) {
          responseType = "Not Responded";
        }

        responseCounts[responseType] += 1;

        if (valueToCheck) {
          if (
            valueToCheck === "Low" ||
            valueToCheck === 1 ||
            valueToCheck === 2
          ) {
            counts[responseType].Low += 1;
          } else if (
            valueToCheck === "Medium" ||
            valueToCheck === 3 ||
            valueToCheck === 4
          ) {
            counts[responseType].Medium += 1;
          } else if (valueToCheck === "High" || valueToCheck === 5) {
            counts[responseType].High += 1;
          }
        }
      }
    });

    // Calculate totals for regular counts
    PREDEFINED_RESPONSES.forEach((response) => {
      if (response !== "Total") {
        counts.Total.High += counts[response].High;
        counts.Total.Medium += counts[response].Medium;
        counts.Total.Low += counts[response].Low;
      }
    });

    // Calculate cumulative counts
    const currentLevelIndex = levelsHierarchy.indexOf(currentLevel);
    const cumulativeResponseCounts = { ...responseCounts };

    levelsHierarchy.slice(0, currentLevelIndex + 1).forEach((lvl) => {
      data.forEach((row) => {
        if (
          row.Level === lvl &&
          row["Control Category"] &&
          lvl !== currentLevel
        ) {
          // Skip current level as it's already counted
          let valueToCheck = null;

          if (tableType === "Control Point Response Rate") {
            valueToCheck = row["Control Point Response Rate"];
          } else if (tableType === "Probability of Risk") {
            valueToCheck = row["Probability of Risk"];
          } else if (tableType === "Impact of Risk") {
            valueToCheck = row["Impact of Risk"];
          } else if (
            tableType === "Policy and Procedures in Place" &&
            row["Policy and Procedures in Place"] === "No"
          ) {
            valueToCheck = row["Risk Category"];
          } else if (
            tableType === "Tools / Configuration Implemented" &&
            row["Tools / Configuration Implemented"] === "No"
          ) {
            valueToCheck = row["Risk Category"];
          } else if (
            tableType === "Reports and Records are Available" &&
            row["Reports and Records are Available"] === "No"
          ) {
            valueToCheck = row["Risk Category"];
          }

          let responseType = row["Control Implemented?"] || "Not Responded";
          if (!PREDEFINED_RESPONSES.includes(responseType)) {
            responseType = "Not Responded";
          }

          cumulativeResponseCounts[responseType] += 1;

          if (valueToCheck) {
            if (
              valueToCheck === "Low" ||
              valueToCheck === 1 ||
              valueToCheck === 2
            ) {
              cumulativeCounts[responseType].Low += 1;
            } else if (
              valueToCheck === "Medium" ||
              valueToCheck === 3 ||
              valueToCheck === 4
            ) {
              cumulativeCounts[responseType].Medium += 1;
            } else if (valueToCheck === "High" || valueToCheck === 5) {
              cumulativeCounts[responseType].High += 1;
            }
          }
        }
      });
    });

    // Add current level counts to cumulative counts
    PREDEFINED_RESPONSES.forEach((response) => {
      if (response !== "Total") {
        cumulativeCounts[response].High += counts[response].High;
        cumulativeCounts[response].Medium += counts[response].Medium;
        cumulativeCounts[response].Low += counts[response].Low;
      }
    });

    // Calculate totals for cumulative counts
    PREDEFINED_RESPONSES.forEach((response) => {
      if (response !== "Total") {
        cumulativeCounts.Total.High += cumulativeCounts[response].High;
        cumulativeCounts.Total.Medium += cumulativeCounts[response].Medium;
        cumulativeCounts.Total.Low += cumulativeCounts[response].Low;
      }
    });

    return {
      counts,
      cumulativeCounts,
      responseCounts,
      cumulativeResponseCounts,
    };
  };

  const { counts, cumulativeCounts, responseCounts, cumulativeResponseCounts } =
    calculateCounts(level);

  const tableHeadings = {
    "Control Point Response Rate": {
      upToLevel:
        "Count Based on Response wrt Control Point Response Rate UpTo The Level",
      cumulative:
        "Count Based on Response wrt Control Point Response Rate Cumulative Upto The Level",
    },
    "Probability of Risk": {
      upToLevel:
        "Count Based on Response wrt Probability of Risk UpTo The Level",
      cumulative:
        "Count Based on Response wrt Probability of Risk Cumulative Upto The Level",
    },
    "Impact of Risk": {
      upToLevel: "Count Based on Response wrt Impact of Risk UpTo The Level",
      cumulative:
        "Count Based on Response wrt Impact of Risk Cumulative Upto The Level",
    },
    "Policy and Procedures in Place": {
      upToLevel:
        "Count Based on Response wrt Policy and Procedures Not in Place UpTo The Level",
      cumulative:
        "Count Based on Response wrt Policy and Procedures Not in Place Cumulative Upto The Level",
    },
    "Tools / Configuration Implemented": {
      upToLevel:
        "Count Based on Response wrt Tools / Configuration Implemented Not in Place UpTo The Level",
      cumulative:
        "Count Based on Response wrt Tools / Configuration Implemented Cumulative Not in Place Upto The Level",
    },
    "Reports and Records are Available": {
      upToLevel:
        "Count Based on Response wrt Reports and Records are Available Not in Place UpTo The Level",
      cumulative:
        "Count Based on Response wrt Reports and Records are Available Cumulative Not in Place Upto The Level",
    },
  };

  return (
    <div className="overflow-x-auto overflow-y-auto">
      <table className="w-full border-collapse border border-black">
        <thead>
          <tr>
            <th
              className="text-lg border border-black px-4 py-2 bg-blue-500 text-center"
              rowSpan="2"
            >
              Responses
            </th>
            <th
              className="border border-black px-4 py-2 bg-gray-200"
              rowSpan="2"
            >
              Count
            </th>
            <th className="border border-black px-4 py-2 " colSpan="4">
              {tableHeadings[tableType]?.upToLevel || "Count UpTo The Level"}
            </th>
            <th className="border border-black px-4 py-2 " colSpan="5">
              {tableHeadings[tableType]?.cumulative ||
                "Cumulative Count Upto The Level"}
            </th>
          </tr>
          <tr>
            {["High", "Medium", "Low", "Total"].map((item) => (
              <th
                key={`level-${item}`}
                className={`border border-black px-4 py-2  ${
                  item === "High"
                    ? "bg-red-500"
                    : item === "Medium"
                    ? "bg-yellow-500"
                    : item === "Low"
                    ? "bg-green-500"
                    : "bg-blue-500"
                }`}
              >
                {item}
              </th>
            ))}
            <th className="border border-black px-4 py-2 bg-gray-200 ">
              Count
            </th>
            {["High", "Medium", "Low", "Total"].map((item) => (
              <th
                key={`cumulative-${item}`}
                className={`border border-black px-4 py-2  ${
                  item === "High"
                    ? "bg-red-500"
                    : item === "Medium"
                    ? "bg-yellow-500"
                    : item === "Low"
                    ? "bg-green-500"
                    : "bg-blue-500"
                }`}
              >
                {item}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {PREDEFINED_RESPONSES.map((response, index) => {
            const currentCount =
              response === "Total"
                ? PREDEFINED_RESPONSES.reduce(
                    (sum, res) =>
                      res !== "Total" ? sum + responseCounts[res] : sum,
                    0
                  )
                : responseCounts[response];

            const cumulativeCount =
              response === "Total"
                ? PREDEFINED_RESPONSES.reduce(
                    (sum, res) =>
                      res !== "Total"
                        ? sum + cumulativeResponseCounts[res]
                        : sum,
                    0
                  )
                : cumulativeResponseCounts[response];

            const responseBgColor =
              {
                "Not Applicable": "bg-white font-bold",
                "Not Implemented": "bg-red-500 font-bold",
                "Partially Implemented": "bg-yellow-300 font-bold",
                "Fully Implemented": "bg-green-400 font-bold",
                "Not Responded": "bg-gray-300 font-bold",
                Total: "bg-white font-bold font-bold",
              }[response] || "";

            return (
              <tr
                key={response}
                className={`text-center ${
                  response === "Total"
                    ? "bg-gray-200 font-bold"
                    : index % 2 === 0
                    ? "bg-white"
                    : "bg-gray-100"
                }`}
              >
                <td
                  className={`border border-black px-4 py-2 ${responseBgColor}`}
                >
                  {response === "Total" ? "Total Controls" : response}
                </td>
                <td className="border border-black px-4 py-2">
                  {currentCount}
                </td>
                <td className="border border-black px-4 py-2">
                  {counts[response].High}
                </td>
                <td className="border border-black px-4 py-2">
                  {counts[response].Medium}
                </td>
                <td className="border border-black px-4 py-2">
                  {counts[response].Low}
                </td>
                <td className="border border-black px-4 py-2">
                  {currentCount}
                </td>
                <td className="border border-black px-4 py-2">
                  {cumulativeCount}
                </td>
                <td className="border border-black px-4 py-2">
                  {cumulativeCounts[response].High}
                </td>
                <td className="border border-black px-4 py-2">
                  {cumulativeCounts[response].Medium}
                </td>
                <td className="border border-black px-4 py-2">
                  {cumulativeCounts[response].Low}
                </td>
                <td className="border border-black px-4 py-2">
                  {cumulativeCount}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

SummaryTable.propTypes = {
  data: PropTypes.arrayOf(PropTypes.object).isRequired,
  level: PropTypes.string.isRequired,
  tableType: PropTypes.string.isRequired,
};

SummaryTable.defaultProps = {
  data: [],
  level: "Basic",
  tableType: "Control Point Response Rate",
};

export default SummaryTable;
