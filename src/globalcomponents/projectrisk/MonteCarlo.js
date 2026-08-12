import { useState } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Chart } from "react-chartjs-2";

// Register chart components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export default function MonteCarlo() {
  // Example simulation data
  const [simulationData, setSimulationData] = useState([
    { value: 100, occurrences: 10 },
    { value: 200, occurrences: 20 },
    { value: 300, occurrences: 15 },
    { value: 400, occurrences: 25 },
    { value: 500, occurrences: 30 },
  ]);

  // Calculate cumulative probabilities
  const totalOccurrences = simulationData.reduce(
    (sum, d) => sum + d.occurrences,
    0
  );
  const dataWithCumulativeProbability = simulationData.map((d, i) => {
    const cumulativeSum = simulationData
      .slice(0, i + 1)
      .reduce((sum, item) => sum + item.occurrences, 0);
    return {
      ...d,
      cumulativeProbability: cumulativeSum / totalOccurrences,
    };
  });

  // Histogram data for occurrences
  const histogramData = {
    labels: simulationData.map((d) => d.value),
    datasets: [
      {
        label: "Occurrences",
        data: simulationData.map((d) => d.occurrences),
        backgroundColor: "rgba(75, 192, 192, 0.6)",
        borderColor: "rgba(75, 192, 192, 1)",
        borderWidth: 1,
      },
    ],
  };

  // Line chart data for cumulative probability
  const cumulativeData = {
    labels: dataWithCumulativeProbability.map((d) => d.value),
    datasets: [
      {
        label: "Cumulative Probability (%)",
        data: dataWithCumulativeProbability.map(
          (d) => d.cumulativeProbability * 100
        ),
        borderColor: "rgba(153, 102, 255, 1)",
        borderWidth: 2,
        tension: 0.4, // Smooth the line
        fill: false,
      },
    ],
  };

  return (
    <div style={{ fontFamily: "Arial, sans-serif", lineHeight: "1.6" }}>
      <h2 style={{ fontSize: "2rem", color: "#333" }}>Monte Carlo Analysis</h2>
      <p>
        This analysis demonstrates simulated outcomes using a histogram of
        occurrences and a cumulative probability plot. These charts help
        identify risk and opportunity distributions in projects.
      </p>

      {/* Histogram */}
      <div style={{ marginTop: "20px" }}>
        <h3 style={{ color: "#0070f3" }}>Histogram of Occurrences</h3>
        <div style={{ width: "600px", margin: "0 auto" }}>
          <Chart type="bar" data={histogramData} />
        </div>
      </div>

      {/* Cumulative Probability Chart */}
      <div style={{ marginTop: "40px" }}>
        <h3 style={{ color: "#0070f3" }}>Cumulative Probability Plot</h3>
        <div style={{ width: "600px", margin: "0 auto" }}>
          <Chart type="line" data={cumulativeData} />
        </div>
      </div>
    </div>
  );
}
