// src/modules/FFIECHub/DashboardDetail.js
import React, { useState, useEffect, useMemo } from "react";
import Loader from "@/globalcomponents/NewUi/Loader";
import { ResponsiveBar } from "@nivo/bar";
import { ResponsivePie } from "@nivo/pie";
import { ResponsiveRadar } from "@nivo/radar";
import {
  FaChartPie,
  FaClipboardCheck,
  FaExclamationTriangle,
  FaUsers,
} from "react-icons/fa";

export default function DashboardDetail() {
  // ─── State & Data Loading (replace with real API fetch) ─────────────────────────
  const [pivotData, setPivotData] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  useEffect(() => {
    // TODO: replace with API fetch: fetch('/api/pivot-summary')...
    const dummy = {
      riskLevels: [
        { level: "Least Inherent Risk", count: 3 },
        { level: "Minimal Inherent Risk", count: 5 },
        { level: "Moderate Inherent Risk", count: 8 },
        { level: "Significant Inherent Risk", count: 4 },
        { level: "Most Inherent Risk", count: 2 },
      ],
      maturityLevels: [
        {
          domain: "Cyber Risk Management and Oversight",
          Baseline: 5,
          Evolving: 3,
          Intermediate: 2,
          Advanced: 1,
          Innovative: 0,
        },
        {
          domain: "Threat Intelligence and Collaboration",
          Baseline: 4,
          Evolving: 4,
          Intermediate: 3,
          Advanced: 2,
          Innovative: 1,
        },
        {
          domain: "Cybersecurity Controls",
          Baseline: 6,
          Evolving: 5,
          Intermediate: 4,
          Advanced: 3,
          Innovative: 2,
        },
        {
          domain: "External Dependency Management",
          Baseline: 3,
          Evolving: 2,
          Intermediate: 2,
          Advanced: 1,
          Innovative: 0,
        },
        {
          domain: "Cyber Incident Management and Resilience",
          Baseline: 4,
          Evolving: 3,
          Intermediate: 3,
          Advanced: 1,
          Innovative: 0,
        },
      ],
    };
    setPivotData(dummy);
    setLastUpdated(new Date());
  }, []);

  // ─── Hooks & Memoized Computations (always called) ───────────────────────────────
  const totalInherent = useMemo(() => {
    if (!pivotData) return 0;
    return pivotData.riskLevels.reduce((sum, r) => sum + r.count, 0);
  }, [pivotData]);

  const totalMaturityStatements = useMemo(() => {
    if (!pivotData) return 0;
    return pivotData.maturityLevels.reduce(
      (sum, row) =>
        sum +
        Object.values(row)
          .slice(1)
          .reduce((s, v) => s + v, 0),
      0
    );
  }, [pivotData]);

  const domainsCount = pivotData ? pivotData.maturityLevels.length : 0;

  const summaryCards = useMemo(
    () => [
      {
        label: "Total Inherent Statements",
        value: totalInherent,
        icon: <FaChartPie className="w-6 h-6 text-teal-600" />,
      },
      {
        label: "Total Maturity Statements",
        value: totalMaturityStatements,
        icon: <FaClipboardCheck className="w-6 h-6 text-blue-600" />,
      },
      {
        label: "Domains Assessed",
        value: domainsCount,
        icon: <FaUsers className="w-6 h-6 text-green-600" />,
      },
    ],
    [totalInherent, totalMaturityStatements, domainsCount]
  );

  const riskPieData = useMemo(() => {
    if (!pivotData) return [];
    return pivotData.riskLevels.map((r) => ({
      id: r.level,
      label: r.level,
      value: r.count,
    }));
  }, [pivotData]);

  const maturityBarData = useMemo(() => {
    if (!pivotData) return [];
    return pivotData.maturityLevels.map((row) => ({
      domain: row.domain,
      Baseline: row.Baseline,
      Evolving: row.Evolving,
      Intermediate: row.Intermediate,
      Advanced: row.Advanced,
      Innovative: row.Innovative,
    }));
  }, [pivotData]);

  const radarData = useMemo(() => {
    if (!pivotData) return [];
    return pivotData.maturityLevels.map((row) => ({
      domain: row.domain,
      Baseline: row.Baseline,
      Evolving: row.Evolving,
      Intermediate: row.Intermediate,
      Advanced: row.Advanced,
      Innovative: row.Innovative,
    }));
  }, [pivotData]);

  // ─── Early return for loader (after hooks) ───────────────────────────────────────
  if (!pivotData) {
    return <Loader />;
  }

  // ─── Render ────────────────────────────────────────────────────────────────────
  return (
    <div className="p-6 bg-gray-50 space-y-8">
      <header className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">
          FFIEC Assessment Dashboard
        </h1>
        <span className="text-sm text-gray-600">
          Last updated: {lastUpdated.toLocaleString()}
        </span>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {summaryCards.map((card) => (
          <div
            key={card.label}
            className="bg-white shadow rounded-lg p-4 flex items-center"
          >
            <div className="mr-4">{card.icon}</div>
            <div>
              <div className="text-sm text-gray-600">{card.label}</div>
              <div className="text-xl font-semibold text-gray-800">
                {card.value}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Inherent Risk Distribution */}
        <div className="bg-white p-4 rounded shadow">
          <h2 className="font-medium mb-2 text-gray-700">
            Inherent Risk Distribution
          </h2>
          <div className="h-64">
            <ResponsivePie
              data={riskPieData}
              margin={{ top: 40, right: 80, bottom: 40, left: 80 }}
              innerRadius={0.5}
              padAngle={1}
              cornerRadius={3}
              arcLabelsSkipAngle={10}
            />
          </div>
        </div>

        {/* Maturity Levels by Domain */}
        <div className="bg-white p-4 rounded shadow">
          <h2 className="font-medium mb-2 text-gray-700">
            Maturity Levels by Domain
          </h2>
          <div className="h-64">
            <ResponsiveBar
              data={maturityBarData}
              keys={[
                "Baseline",
                "Evolving",
                "Intermediate",
                "Advanced",
                "Innovative",
              ]}
              indexBy="domain"
              margin={{ top: 50, right: 130, bottom: 100, left: 60 }}
              padding={0.3}
              groupMode="stacked"
              axisBottom={{
                tickRotation: -45,
                legend: "Domain",
                legendPosition: "middle",
                legendOffset: 60,
              }}
              axisLeft={{
                legend: "Count",
                legendPosition: "middle",
                legendOffset: -50,
              }}
              labelSkipWidth={12}
              labelSkipHeight={12}
              legends={[
                {
                  dataFrom: "keys",
                  anchor: "top-right",
                  direction: "column",
                  translateX: 120,
                  itemWidth: 100,
                  itemHeight: 20,
                },
              ]}
            />
          </div>
        </div>
      </div>

      {/* Maturity Spread Radar */}
      <div className="bg-white p-4 rounded shadow">
        <h2 className="font-medium mb-2 text-gray-700">
          Maturity Spread Radar
        </h2>
        <div className="h-64">
          <ResponsiveRadar
            data={radarData}
            keys={[
              "Baseline",
              "Evolving",
              "Intermediate",
              "Advanced",
              "Innovative",
            ]}
            indexBy="domain"
            margin={{ top: 70, right: 80, bottom: 40, left: 80 }}
            gridLevels={5}
            dotSize={6}
            legends={[
              {
                anchor: "top-left",
                direction: "column",
                translateX: -50,
                itemWidth: 80,
                itemHeight: 20,
                symbolShape: "circle",
              },
            ]}
          />
        </div>
      </div>
    </div>
  );
}
