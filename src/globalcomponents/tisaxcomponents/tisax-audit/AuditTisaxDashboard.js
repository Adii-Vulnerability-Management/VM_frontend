import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import CustomAxios from "@/globalcomponents/CustomAxios";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { baseurl, initURL } from "../../../../BaseUrl";

function AuditTisaxDashboard() {
  const router = useRouter();
  const { id, vda_type, assessment_level, vda_version } = router.query;
  const [sections, setSections] = useState([]);
  const [overallCompletionValue, setOverallCompletionValue] = useState(0);

  useEffect(() => {
    if (id && vda_type && assessment_level && vda_version) {
      CustomAxios
        .get(`${baseurl}/${initURL}/tisax/dashboard/${id}`, {
          params: {
            vda_type,
            assessment_level,
            vda_version,
          },
        })
        .then((response) => {
          const data = response.data;

          // Dynamically map and sort sections by `rootISANew`
          const newSections = data.map((section) => {
            const sortedCategories = [...section.categories].sort(
              (a, b) => parseInt(a.rootISANew) - parseInt(b.rootISANew)
            );

            const tasks = sortedCategories.map((category) => ({
              name:
                category.rootControlQuestion || category.parentControlQuestion,
              completion: Math.round(
                (category.isReadyCount / category.totalCount) * 100
              ),
            }));

            // Calculate section completion
            const sectionCompletion = Math.round(
              tasks.reduce((sum, task) => sum + task.completion, 0) /
              tasks.length
            );

            return {
              name: section.name,
              tasks,
              completion: sectionCompletion,
            };
          });

          setSections(newSections);

          // Calculate overall completion as the average of section completions
          const overallCompletion = Math.round(
            newSections.reduce((sum, section) => sum + section.completion, 0) /
            newSections.length
          );
          setOverallCompletionValue(overallCompletion);
        })
        .catch((error) => {
          console.error("Error fetching data:", error);
        });
    }
  }, [id, vda_type, assessment_level, vda_version]);

  // Function to dynamically format X-axis labels for better readability
  const formatLabel = (label) => {
    if (label.length > 20) {
      return label.slice(0, 20) + "..."; // Truncate long labels
    } else {
      return label.split(" ").join("\n"); // Wrap shorter labels
    }
  };
  // const COLORS = ["#6E6AAE", "#B3B1D7"]; // Use lighter shades to match the theme


  const COLORS = ["#154360", "#5DADE2"];

  return (
    <div
      style={{
        padding: "20px",
        fontFamily: "Arial, sans-serif",
        display: "flex",
        justifyContent: "space-between",
      }}
    >
      {/* Overall Completion */}
      <div style={{ textAlign: "center" }}>
        <h2>Overall Completion</h2>
        <PieChart width={300} height={300}>
          <Pie
            data={[
              { name: "Completed", value: overallCompletionValue },
              { name: "Remaining", value: 100 - overallCompletionValue },
            ]}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
            dataKey="value"
          >
            <Cell fill={COLORS[0]} />
            <Cell fill={COLORS[1]} />
          </Pie>
          <Tooltip />
        </PieChart>
        <p>{overallCompletionValue}% Completed</p>
      </div>

      {/* Individual Section Completion */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "20px",
          textAlign: "center",
          flex: 1,
        }}
      >
        {sections.map((section, index) => (
          <div
            key={index}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "20px",
            }}
          >
            <div style={{ width: "150px" }}>
              <h3>{section.name}</h3>
              <PieChart width={150} height={150}>
                <Pie
                  data={[
                    { name: "Completed", value: section.completion },
                    { name: "Remaining", value: 100 - section.completion },
                  ]}
                  cx="50%"
                  cy="50%"
                  innerRadius={30}
                  outerRadius={50}
                  dataKey="value"
                >
                  <Cell fill={COLORS[0]} />
                  <Cell fill={COLORS[1]} />
                </Pie>
                <Tooltip />
              </PieChart>
              <p>{section.completion}% Completed</p>
            </div>

            {/* Section Task Completion Bar Chart */}
            <div style={{ flex: 1, height: "250px" }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={section.tasks}
                  margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 12, whiteSpace: "pre-line" }}
                    tickFormatter={formatLabel}
                  />
                  <YAxis
                    domain={[0, 100]}
                    tickFormatter={(value) => `${value}%`}
                  />
                  <Tooltip formatter={(value) => `${value}%`} />
                  <Legend />
                  <Bar dataKey="completion" fill={COLORS[0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default AuditTisaxDashboard;
