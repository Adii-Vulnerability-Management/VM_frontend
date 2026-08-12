// import React from 'react';
// import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

// const SummaryGraphs = ({ data, level, tableType }) => {
//   const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

//   const PREDEFINED_RESPONSES = [
//     "Not Applicable",
//     "Not Implemented",
//     "Partially Implemented",
//     "Fully Implemented",
//     "Not Responded",
//     "Total",
//   ];

//   const levelsHierarchy = ["Basic", "Level1", "Level2", "Level3", "Level4"];

//   const calculateChartData = () => {
//     const counts = {};
//     const responseCounts = {};
//     const cumulativeCounts = {};

//     // Initialize counts and cumulativeCounts
//     PREDEFINED_RESPONSES.forEach((response) => {
//       counts[response] = { High: 0, Medium: 0, Low: 0, Total: 0 };
//       cumulativeCounts[response] = { High: 0, Medium: 0, Low: 0, Total: 0 };
//       responseCounts[response] = 0;
//     });

//     // Calculate regular counts
//     data.forEach((row) => {
//       if (row.Level === level && row["Control Category"]) {
//         let valueToCheck = null;

//         if (tableType === "Control Point Response Rate") {
//           valueToCheck = row["Control Point Response Rate"];
//         } else if (tableType === "Probability of Risk") {
//           valueToCheck = row["Probability of Risk"];
//         } else if (tableType === "Impact of Risk") {
//           valueToCheck = row["Impact of Risk"];
//         } else if (
//           tableType === "Policy and Procedures in Place" &&
//           row["Policy and Procedures in Place"] === "No"
//         ) {
//           valueToCheck = row["Risk Category"];
//         } else if (
//           tableType === "Tools / Configuration Implemented" &&
//           row["Tools / Configuration Implemented"] === "No"
//         ) {
//           valueToCheck = row["Risk Category"];
//         } else if (
//           tableType === "Reports and Records are Available" &&
//           row["Reports and Records are Available"] === "No"
//         ) {
//           valueToCheck = row["Risk Category"];
//         }

//         let responseType = row["Control Implemented?"];

//         if (responseType === "Select") {
//           responseType = "Not Implemented";
//         }

//         if (!PREDEFINED_RESPONSES.includes(responseType)) {
//           responseType = "Not Responded";
//         }

//         responseCounts[responseType] += 1;

//         if (valueToCheck) {
//           if (valueToCheck === "Low" || valueToCheck === 1 || valueToCheck === 2) {
//             counts[responseType].Low += 1;
//           } else if (valueToCheck === "Medium" || valueToCheck === 3 || valueToCheck === 4) {
//             counts[responseType].Medium += 1;
//           } else if (valueToCheck === "High" || valueToCheck === 5) {
//             counts[responseType].High += 1;
//           }
//         }
//       }
//     });

//     // Calculate totals
//     PREDEFINED_RESPONSES.forEach((response) => {
//       if (response !== "Total") {
//         counts.Total.High += counts[response].High;
//         counts.Total.Medium += counts[response].Medium;
//         counts.Total.Low += counts[response].Low;
//       }
//       counts[response].Total = counts[response].High + counts[response].Medium + counts[response].Low;
//     });

//     // Prepare data for charts
//     const riskDistributionData = [
//       { name: 'High', value: counts.Total.High },
//       { name: 'Medium', value: counts.Total.Medium },
//       { name: 'Low', value: counts.Total.Low }
//     ].filter(item => item.value > 0);

//     const implementationStatusData = PREDEFINED_RESPONSES
//       .filter(response => response !== 'Total')
//       .map(response => ({
//         name: response,
//         value: counts[response].Total,
//         High: counts[response].High,
//         Medium: counts[response].Medium,
//         Low: counts[response].Low
//       }))
//       .filter(item => item.value > 0);

//     return {
//       riskDistributionData,
//       implementationStatusData
//     };
//   };

//   const { riskDistributionData, implementationStatusData } = calculateChartData();

//   return (
//     <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
//       <div className="bg-white p-6 rounded-lg shadow">
//         <h4 className="text-lg font-semibold mb-4">Risk Distribution</h4>
//         <div className="flex justify-center">
//           <PieChart width={400} height={300}>
//             <Pie
//               data={riskDistributionData}
//               cx={200}
//               cy={150}
//               labelLine={false}
//               label={({ name, value }) => `${name}: ${value}`}
//               outerRadius={100}
//               fill="#8884d8"
//               dataKey="value"
//             >
//               {riskDistributionData.map((entry, index) => (
//                 <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
//               ))}
//             </Pie>
//             <Tooltip />
//             <Legend />
//           </PieChart>
//         </div>
//       </div>

//       <div className="bg-white p-6 rounded-lg shadow">
//         <h4 className="text-lg font-semibold mb-4">Implementation Status</h4>
//         <BarChart
//           width={500}
//           height={300}
//           data={implementationStatusData}
//           margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
//         >
//           <CartesianGrid strokeDasharray="3 3" />
//           <YAxis />
//           <Tooltip />
//           <Legend />
//           <Bar dataKey="High" stackId="a" fill={COLORS[0]} name="High Risk" />
//           <Bar dataKey="Medium" stackId="a" fill={COLORS[1]} name="Medium Risk" />
//           <Bar dataKey="Low" stackId="a" fill={COLORS[2]} name="Low Risk" />
//         </BarChart>
//       </div>
//     </div>
//   );
// };

// export default SummaryGraphs;

import React from "react";
import PropTypes from "prop-types";
import {
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Sector,
} from "recharts";

const SummaryGraphs = ({ data, level, tableType }) => {
  const PREDEFINED_RESPONSES = [
    "Not Applicable",
    "Not Implemented",
    "Partially Implemented",
    "Fully Implemented",
    "Not Responded",
  ];

  const COLORS = {
    High: "#EF4444",
    Medium: "#F59E0B",
    Low: "#10B981",
    "Not Applicable": "#94A3B8",
    "Not Implemented": "#EF4444",
    "Partially Implemented": "#F59E0B",
    "Fully Implemented": "#10B981",
    "Not Responded": "#6B7280",
  };

  // Reuse your existing calculation logic
  const calculateCounts = (currentLevel) => {
    // ... [Keep your existing calculateCounts function here] ...
    const counts = {};
    const responseCounts = {};
    const cumulativeCounts = {};
    const cumulativeResponseCounts = {};

    // Initialize counts
    PREDEFINED_RESPONSES.forEach((response) => {
      counts[response] = { High: 0, Medium: 0, Low: 0 };
      cumulativeCounts[response] = { High: 0, Medium: 0, Low: 0 };
      responseCounts[response] = 0;
      cumulativeResponseCounts[response] = 0;
    });

    // Calculate regular counts
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

    // Calculate cumulative counts
    const levelsHierarchy = ["Basic", "Level1", "Level2", "Level3", "Level4"];
    const currentLevelIndex = levelsHierarchy.indexOf(currentLevel);

    for (let i = 0; i <= currentLevelIndex; i++) {
      const lvl = levelsHierarchy[i];
      data.forEach((row) => {
        if (row.Level === lvl && row["Control Category"]) {
          let valueToCheck = null;
          // ... [Same value checking logic as above] ...
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
          if (responseType === "Select") {
            responseType = "Not Implemented";
          }
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
    }

    return {
      counts,
      cumulativeCounts,
      responseCounts,
      cumulativeResponseCounts,
    };
  };

  const { counts, cumulativeCounts, responseCounts, cumulativeResponseCounts } =
    calculateCounts(level);

  // Prepare data for line chart
  const lineChartData = PREDEFINED_RESPONSES.map((response) => ({
    name: response,
    Current: responseCounts[response],
    Cumulative: cumulativeResponseCounts[response],
  }));

  // Prepare data for pie charts
  const prepareRiskData = (countData) => {
    return PREDEFINED_RESPONSES.map((response) => ({
      name: response,
      value: countData[response],
    })).filter((item) => item.value > 0);
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 border border-gray-200 rounded shadow">
          <p className="font-bold">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color }}>
              {`${entry.name}: ${entry.value}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const renderActiveShape = (props) => {
    const {
      cx,
      cy,
      innerRadius,
      outerRadius,
      startAngle,
      endAngle,
      fill,
      payload,
      value,
    } = props;

    return (
      <g>
        <Sector
          cx={cx}
          cy={cy}
          innerRadius={innerRadius}
          outerRadius={outerRadius}
          startAngle={startAngle}
          endAngle={endAngle}
          fill={fill}
        />
        <Sector
          cx={cx}
          cy={cy}
          innerRadius={outerRadius + 6}
          outerRadius={outerRadius + 10}
          startAngle={startAngle}
          endAngle={endAngle}
          fill={fill}
        />
        <text x={cx} y={cy} dy={-20} textAnchor="middle" fill={fill}>
          {payload.name}
        </text>
        <text x={cx} y={cy} dy={20} textAnchor="middle" fill="#666">
          {`Count: ${value}`}
        </text>
      </g>
    );
  };
  // Custom Legend Style
  const renderLegend = (props) => {
    const { payload } = props;
    
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'flex-end',
        alignItems: 'center',
        padding: '10px 20px'
      }}>
        {payload.map((entry, index) => (
          <div 
            key={`item-${index}`}
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              marginLeft: '20px',
              cursor: 'pointer'
            }}
          >
            <div style={{
              width: '12px',
              height: '12px',
              backgroundColor: entry.color,
              marginRight: '5px',
              borderRadius: '2px'
            }} />
            <span style={{ color: '#666' }}>{entry.value}</span>
          </div>
        ))}
      </div>
    );
  };
  return (
    <div className="w-full space-y-8">
      {/* Trend Line Chart */}
      <div className="w-full h-96 p-4 border rounded-lg shadow-sm bg-white">
        <h3 className="text-lg font-semibold mb-4">
          Implementation Status Trends
        </h3>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={lineChartData}
            margin={{ top: 30, right: 30, left: 20, bottom: 30 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="name"
              angle={-32}
              textAnchor="end"
              height={60}
              tick={{ fontSize: 12 }}
            />
            <YAxis />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              content={renderLegend}
              verticalAlign="top"
              align="right"
              height={36}
            />
            <Line
              type="monotone"
              dataKey="Current"
              name="Current Level"
              stroke="#3B82F6"  
              strokeWidth={2}
              dot={{ r: 6 }}
              activeDot={{ r: 8 }}
            />
            <Line
              type="monotone"
              dataKey="Cumulative"
              name="Cumulative"
              stroke="#10B981"
              strokeWidth={2}
              dot={{ r: 6 }}
              activeDot={{ r: 8 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Risk Distribution Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Current Level Pie Chart */}
        <div className="h-96 p-4 border rounded-lg shadow-sm bg-white">
          <h3 className="text-lg font-semibold mb-4">
            Current Level Distribution
          </h3>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={prepareRiskData(responseCounts)}
                cx="50%"
                cy="50%"
                activeShape={renderActiveShape}
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {prepareRiskData(responseCounts).map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[entry.name]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Cumulative Pie Chart */}
        <div className="h-96 p-4 border rounded-lg shadow-sm bg-white">
          <h3 className="text-lg font-semibold mb-4">
            Cumulative Distribution
          </h3>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={prepareRiskData(cumulativeResponseCounts)}
                cx="50%"
                cy="50%"
                activeShape={renderActiveShape}
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {prepareRiskData(cumulativeResponseCounts).map(
                  (entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[entry.name]} />
                  )
                )}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

SummaryGraphs.propTypes = {
  data: PropTypes.arrayOf(PropTypes.object).isRequired,
  level: PropTypes.string.isRequired,
  tableType: PropTypes.string.isRequired,
};

SummaryGraphs.defaultProps = {
  data: [],
  level: "Basic",
  tableType: "Control Point Response Rate",
};

export default SummaryGraphs;
