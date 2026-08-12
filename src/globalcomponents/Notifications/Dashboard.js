import React, { useEffect, useState } from "react";
import { ResponsiveLine } from "@nivo/line";
import { ResponsivePie } from "@nivo/pie";
import { ResponsiveBar } from "@nivo/bar";
import Loader from "@/components/ui/Loader";
import CustomAxios from "@/globalcomponents/CustomAxios";
import { baseurl, initURL } from "../../../BaseUrl";

export default function Dashboard() {
  const [totals, setTotals] = useState({
    totalSent: 0,
    totalFailed: 0,
    totalPending: 0,
    totalTemplates: 0,
    activeTemplates: 0,
    emailsToday: 0,
  });
  const [timeSeries, setTimeSeries] = useState([]);
  const [channelStats, setChannelStats] = useState([]);
  const [templateUsage, setTemplateUsage] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [totalsRes, tsRes, channelRes, usageRes] = await Promise.all([
          CustomAxios.get(`${baseurl}/${initURL}/notifications/dashboard/totals`),
          CustomAxios.get(
            `${baseurl}/${initURL}/notifications/dashboard/timeseries`,
            { params: { range: "7d" } },
          ),
          CustomAxios.get(
            `${baseurl}/${initURL}/notifications/dashboard/channel-summary`,
          ),
          CustomAxios.get(
            `${baseurl}/${initURL}/notifications/dashboard/template-usage`,
          ),
        ]);

        setTotals(totalsRes.data?.data || totals);
        setTimeSeries(Array.isArray(tsRes.data?.data) ? tsRes.data.data : []);
        setChannelStats(
          Array.isArray(channelRes.data?.data) ? channelRes.data.data : [],
        );
        setTemplateUsage(
          Array.isArray(usageRes.data?.data) ? usageRes.data.data : [],
        );
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  if (loading) {
    return <Loader fullScreen message="Loading" />;
  }

  const lineData = [
    {
      id: "Sent",
      color: "hsl(205, 70%, 50%)",
      data: timeSeries.map((d) => ({ x: d.date, y: d.sent || 0 })),
    },
    {
      id: "Failed",
      color: "hsl(10, 70%, 50%)",
      data: timeSeries.map((d) => ({ x: d.date, y: d.failed || 0 })),
    },
  ];

  const pieData = channelStats.map((item) => ({
    id: item.channel,
    label: item.channel,
    value: item.count,
  }));

  const usageData = templateUsage.map((item) => ({
    template: item.templateName,
    usage: item.usageCount,
  }));

  return (
    <div className="py-5 px-3 space-y-6" data-tour="nt-dashboard">
      <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {[
          {
            label: "Total Sent",
            value: totals.totalSent,
            className: "border-blue-200 bg-blue-50 text-blue-900",
          },
          {
            label: "Total Failed",
            value: totals.totalFailed,
            className: "border-rose-200 bg-rose-50 text-rose-900",
          },
          {
            label: "Total Pending",
            value: totals.totalPending,
            className: "border-amber-200 bg-amber-50 text-amber-900",
          },
          {
            label: "Total Templates",
            value: totals.totalTemplates,
            className: "border-purple-200 bg-purple-50 text-purple-900",
          },
          {
            label: "Active Templates",
            value: totals.activeTemplates,
            className: "border-emerald-200 bg-emerald-50 text-emerald-900",
          },
          {
            label: "Emails Today",
            value: totals.emailsToday,
            className: "border-indigo-200 bg-indigo-50 text-indigo-900",
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className={`rounded-xl border p-4 shadow-sm flex flex-col items-center ${stat.className}`}
          >
            <span className="text-3xl font-bold">{stat.value}</span>
            <span className="mt-1 text-sm font-medium opacity-80 text-center">
              {stat.label}
            </span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <section className="lg:col-span-2 rounded-2xl border border-[#2B245C] bg-white p-6 shadow-lg hover:shadow-2xl transition-shadow duration-300">
          <h2 className="text-xl font-bold text-[#2B245C] mb-3">
            Notifications Over Time
          </h2>
          <div style={{ height: 300 }}>
            <ResponsiveLine
              data={lineData}
              margin={{ top: 20, right: 40, bottom: 50, left: 60 }}
              xScale={{ type: "point" }}
              yScale={{ type: "linear", min: "auto", max: "auto" }}
              curve="monotoneX"
              axisBottom={{
                orient: "bottom",
                tickRotation: -45,
                legend: "Date",
                legendOffset: 40,
              }}
              axisLeft={{ orient: "left", legend: "Count", legendOffset: -50 }}
              enablePoints
              pointSize={6}
              useMesh
            />
          </div>
        </section>

        <section className="rounded-2xl border border-[#2B245C] bg-white p-6 shadow-lg hover:shadow-2xl transition-shadow duration-300">
          <h2 className="text-xl font-bold text-[#2B245C] mb-3">
            Notifications by Channel
          </h2>
          <div style={{ height: 300 }}>
            <ResponsivePie
              data={pieData}
              margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
              innerRadius={0.5}
              padAngle={0.7}
              cornerRadius={3}
              activeOuterRadiusOffset={8}
              colors={{ scheme: "paired" }}
              borderWidth={1}
              borderColor={{ from: "color", modifiers: [["darker", 0.2]] }}
              radialLabelsSkipAngle={10}
              radialLabelsTextColor="#333333"
              radialLabelsLinkColor="#333333"
              sliceLabelsSkipAngle={10}
              sliceLabelsTextColor="#333333"
            />
          </div>
        </section>

        <section className="lg:col-span-3 rounded-2xl border border-[#2B245C] bg-white p-6 shadow-lg hover:shadow-2xl transition-shadow duration-300">
          <h2 className="text-xl font-bold text-[#2B245C] mb-3">
            Template Usage
          </h2>
          <div style={{ height: 300 }}>
            <ResponsiveBar
              data={usageData}
              keys={["usage"]}
              indexBy="template"
              margin={{ top: 20, right: 20, bottom: 70, left: 60 }}
              padding={0.3}
              valueScale={{ type: "linear" }}
              indexScale={{ type: "band", round: true }}
              axisBottom={{
                tickRotation: -30,
                legend: "Template",
                legendPosition: "middle",
                legendOffset: 50,
              }}
              axisLeft={{
                legend: "Usage Count",
                legendPosition: "middle",
                legendOffset: -50,
              }}
              enableLabel={false}
              colors={{ scheme: "paired" }}
            />
          </div>
        </section>
      </div>
    </div>
  );
}
