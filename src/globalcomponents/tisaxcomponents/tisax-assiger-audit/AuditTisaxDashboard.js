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
  const { id, vda_type, assessment_level, vda_version, rootId } = router.query;
  const [sections, setSections] = useState([]);
  const [overallCompletionValue, setOverallCompletionValue] = useState(0);

  useEffect(() => {
    if (id && vda_type && assessment_level && vda_version) {
      Promise.all([
        CustomAxios.get(`${baseurl}/${initURL}/tisax/employee/prototypeProtection/${id}`)
          .catch(() => null), // Handle failures gracefully
        CustomAxios.get(`${baseurl}/${initURL}/tisax/employee/informationSecurity/${id}`)
          .catch(() => null),
        CustomAxios.get(`${baseurl}/${initURL}/tisax/employee/dataProtection/${id}`)
          .catch(() => null),
      ])
        .then(([prototypeProtectionData, informationSecurityData, dataProtectionData]) => {
          // Define valid categories based on available data
          const validCategories = [
            informationSecurityData?.data?.length ? { name: "Information Security", categories: [] } : null,
            dataProtectionData?.data?.length ? { name: "Data Protection", categories: [] } : null,
            prototypeProtectionData?.data?.length ? { name: "Prototype Protection", categories: [] } : null,
          ].filter(Boolean); // Remove null values

          if (validCategories.length === 0) return; // No categories found, exit

          // Helper function to process controls
          const processControls = (controls, categoryName) => {
            const categoryData = {};

            controls.forEach((control) => {
              const controlKey = control["Root Control question"] || control["Parent Control question"];
              const isaNewKey = control["Root ISA New"] || control["Parent ISA New"];

              if (!categoryData[controlKey]) {
                categoryData[controlKey] = {
                  isReadyCount: 0,
                  totalCount: 0,
                  rootControlQuestion: controlKey,
                  rootISANew: isaNewKey,
                };
              }

              // Count total and ready controls
              categoryData[controlKey].totalCount += 1;
              if (control.isReady) {
                categoryData[controlKey].isReadyCount += 1;
              }
            });

            // Push processed data into the respective category
            validCategories.find((cat) => cat.name === categoryName).categories =
              Object.values(categoryData);
          };

          // Process available categories
          if (informationSecurityData?.data?.length) {
            processControls(informationSecurityData.data, "Information Security");
          }
          if (dataProtectionData?.data?.length) {
            processControls(dataProtectionData.data, "Data Protection");
          }
          if (prototypeProtectionData?.data?.length) {
            processControls(prototypeProtectionData.data, "Prototype Protection");
          }

          // Calculate section-wise completion and filter out empty ones
          const newSections = validCategories
            .map((section) => {
              if (section.categories.length === 0) return null; // Remove empty categories

              const sortedCategories = [...section.categories].sort((a, b) => {
                const isaA = parseInt(a.rootISANew) || 0;
                const isaB = parseInt(b.rootISANew) || 0;
                return isaA - isaB;
              });

              const tasks = sortedCategories.map((category) => ({
                name: category.rootControlQuestion || "Unknown Task",
                completion:
                  category.totalCount > 0
                    ? Math.round((category.isReadyCount / category.totalCount) * 100)
                    : 0,
              }));

              // Calculate section completion safely
              const sectionCompletion =
                tasks.length > 0
                  ? Math.round(tasks.reduce((sum, task) => sum + task.completion, 0) / tasks.length)
                  : 0;

              return {
                name: section.name,
                tasks,
                completion: sectionCompletion,
              };
            })
            .filter(Boolean); // Remove null values

          setSections(newSections);

          // Calculate overall completion safely
          if (newSections.length > 0) {
            const overallCompletion = Math.round(
              newSections.reduce((sum, section) => sum + section.completion, 0) / newSections.length
            );
            setOverallCompletionValue(overallCompletion);
          } else {
            setOverallCompletionValue(0); // If no sections, set completion to 0
          }
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
