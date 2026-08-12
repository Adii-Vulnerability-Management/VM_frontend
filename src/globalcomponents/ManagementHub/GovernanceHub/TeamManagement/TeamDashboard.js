import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import CustomAxios from "@/globalcomponents/CustomAxios";
import Loader from "@/globalcomponents/loader/Loader";
import { baseurl, initURL } from "../../../../../BaseUrl";
import { Pie, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
} from "chart.js";

// Register Chart.js elements
ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement
);

const TeamDashboard = () => {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch teams from your API
  const fetchTeams = async () => {
    setLoading(true);
    try {
      const response = await CustomAxios.get(
        `${baseurl}/${initURL}/team-management/get-teams`
      );
      if (response.status === 200) {
        setTeams(response.data);
      } else {
        toast.error("Failed to fetch teams.");
      }
    } catch (error) {
      toast.error("Error fetching teams.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeams();
  }, []);

  // Calculate summary statistics
  const totalTeams = teams.length;
  const totalMembers = teams.reduce(
    (sum, team) => sum + Number(team.teamMembersCount || 0),
    0
  );
  const averageTeamSize =
    totalTeams > 0 ? (totalMembers / totalTeams).toFixed(1) : 0;

  // Prepare Pie Chart: Team Status Distribution
  const statusCounts = {
    Active: 0,
    Inactive: 0,
    Transitional: 0,
    "Not Specified": 0,
  };
  teams.forEach((team) => {
    const status = team.teamStatus ? team.teamStatus : "Not Specified";
    if (statusCounts.hasOwnProperty(status)) {
      statusCounts[status]++;
    } else {
      statusCounts["Not Specified"]++;
    }
  });
  const pieData = {
    labels: Object.keys(statusCounts),
    datasets: [
      {
        label: "Team Status Distribution",
        data: Object.values(statusCounts),
        backgroundColor: [
          "#4CAF50", // Active (green)
          "#F44336", // Inactive (red)
          "#FFC107", // Transitional (amber)
          "#9E9E9E", // Not Specified (gray)
        ],
        borderWidth: 1,
      },
    ],
  };

  // Prepare Bar Chart: Team Members Count per Team
  const barLabels = teams.map((team) => team.teamName);
  const barData = {
    labels: barLabels,
    datasets: [
      {
        label: "Team Members Count",
        data: teams.map((team) => Number(team.teamMembersCount || 0)),
        backgroundColor: "#2196F3",
      },
    ],
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="min-h-screen p-8 bg-gray-100">
      <h1 className="text-3xl font-bold text-center text-[#2B245C] mb-8">
        Team Dashboard
      </h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold">Total Teams</h2>
          <p className="text-3xl font-bold">{totalTeams}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold">Total Members</h2>
          <p className="text-3xl font-bold">{totalMembers}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold">Average Team Size</h2>
          <p className="text-3xl font-bold">{averageTeamSize}</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Pie Chart: Team Status Distribution */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4 text-[#2B245C]">
            Team Status Distribution
          </h2>
          <Pie data={pieData} />
        </div>

        {/* Bar Chart: Team Members Count per Team */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4 text-[#2B245C]">
            Team Members Count
          </h2>
          <Bar
            data={barData}
            options={{
              responsive: true,
              plugins: {
                legend: { position: "top" },
                title: { display: true, text: "Team Members per Team" },
              },
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default TeamDashboard;
