"use client";

import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import Cookies from "js-cookie";
import CustomAxios from "@/config/CustomAxios";
import { baseurl, initURL } from "@/config/config";
import Loader from "@/components/ui/Loader";

const COLORS = ["#2B245C", "#F2F1FB"];

// dynamic imports to avoid SSR issues
const ResponsivePie = dynamic(
  () => import("@nivo/pie").then((mod) => mod.ResponsivePie),
  { ssr: false }
);
const ResponsiveBar = dynamic(
  () => import("@nivo/bar").then((mod) => mod.ResponsiveBar),
  { ssr: false }
);

export default function TisaxDashboard() {
  const router = useRouter();
  const { id, vda_type, assessment_level, vda_version, rootId } = router.query;

  const [sections, setSections] = useState([]);
  const [overallCompletion, setOverallCompletion] = useState(0);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);

  const stored = Cookies.get("user_data");
  const role = stored ? JSON.parse(stored).user_designation : "Admin";

  // build sections from raw arrays
  const buildSections = (raw) => {
    const buckets = [
      raw.informationSecurityControls?.length && "Information Security",
      raw.dataProtectionControls?.length && "Data Protection",
      raw.prototypeProtectionControls?.length && "Prototype Protection",
    ].filter(Boolean);

    return buckets.map((name) => {
      const arr =
        raw[
          name === "Information Security"
            ? "informationSecurityControls"
            : name === "Data Protection"
            ? "dataProtectionControls"
            : "prototypeProtectionControls"
        ] || [];

      const agg = {};
      arr.forEach((c) => {
        const q = c["Root Control question"] || c["Parent Control question"];
        const isa = c["Root ISA New"] || c["Parent ISA New"];
        if (!agg[q])
          agg[q] = { q, isa: parseFloat(isa) || 0, ready: 0, total: 0 };
        agg[q].total++;
        if (c.isReady) agg[q].ready++;
      });

      const tasks = Object.values(agg)
        .sort((a, b) => a.isa - b.isa)
        .map((x) => ({
          name: x.q,
          completion: x.total ? Math.round((x.ready / x.total) * 100) : 0,
        }));

      const comp =
        tasks.length > 0
          ? Math.round(
              tasks.reduce((s, t) => s + t.completion, 0) / tasks.length
            )
          : 0;

      return { name, tasks, completion: comp };
    });
  };

  // fetch & finalize
  useEffect(() => {
    if (!(id && vda_type && assessment_level && vda_version && role)) return;
    setLoading(true);

    const handle = (newSecs) => {
      setSections(newSecs);
      setOverallCompletion(
        newSecs.length
          ? Math.round(
              newSecs.reduce((s, sec) => s + sec.completion, 0) / newSecs.length
            )
          : 0
      );
      setSelected(newSecs[0] || null);
      setLoading(false);
    };

    const err = (e) => {
      console.error(e);
      setLoading(false);
    };

    if (role === "Admin") {
      CustomAxios.get(`${baseurl}/${initURL}/tisax/dashboard/${id}`, {
        params: { vda_type, assessment_level, vda_version },
      })
        .then(({ data }) => {
          // server returns [{ name, categories: [...] }, …]
          const secs = data.map((sec) => {
            const tasks = sec.categories
              .sort(
                (a, b) =>
                  parseFloat(a.rootISANew || a.parentISANew || 0) -
                  parseFloat(b.rootISANew || b.parentISANew || 0)
              )
              .map((c) => ({
                name: c.rootControlQuestion || c.parentControlQuestion || "—",
                completion: Math.round((c.isReadyCount / c.totalCount) * 100),
              }));
            const comp =
              tasks.length > 0
                ? Math.round(
                    tasks.reduce((s, t) => s + t.completion, 0) / tasks.length
                  )
                : 0;
            return { name: sec.name, tasks, completion: comp };
          });
          handle(secs);
        })
        .catch(err);
    } else {
      // for Employee/Reviewer/Assigner: fetch each raw array and buildSections(raw)…then handle()
      // copy your earlier logic here, then call handle(...)
      // …
    }
  }, [id, vda_type, assessment_level, vda_version, rootId, role]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader />
      </div>
    );
  }

  return (
    <div className="p-6 bg-[#F4F4F9] space-y-8">
      {/* ─── Top row of pies ─── */}
      <div className="flex gap-6">
        {/* Overall */}
        <div className="w-1/4 bg-white rounded-lg shadow p-6 flex flex-col">
          <h4 className="mb-4 text-lg font-semibold text-[#2B245C]">
            Overall Completion
          </h4>
          <div className="flex-1 h-48">
            <ResponsivePie
              data={[
                { id: "Completed", value: overallCompletion, color: COLORS[0] },
                {
                  id: "Remaining",
                  value: 100 - overallCompletion,
                  color: COLORS[1],
                },
              ]}
              margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
              innerRadius={0.6}
              padAngle={1}
              cornerRadius={3}
              colors={({ data }) => data.color}
              borderWidth={1}
              borderColor={{ from: "color", modifiers: [["darker", 0.2]] }}
              arcLabelsSkipAngle={0}
              arcLabelsTextColor={{ from: "color", modifiers: [["darker", 2]] }}
            />
          </div>
        </div>

        {/* Section pies */}
        {sections.map((sec) => (
          <div
            key={sec.name}
            className="w-1/4 bg-white rounded-lg shadow p-6 cursor-pointer"
            onClick={() => setSelected(sec)}
          >
            <h4 className="mb-4 text-lg font-semibold text-[#2B245C]">
              {sec.name}
            </h4>
            <div className="h-48">
              <ResponsivePie
                data={[
                  { id: "Completed", value: sec.completion, color: COLORS[0] },
                  {
                    id: "Remaining",
                    value: 100 - sec.completion,
                    color: COLORS[1],
                  },
                ]}
                margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
                innerRadius={0.6}
                padAngle={1}
                cornerRadius={3}
                colors={({ data }) => data.color}
                borderWidth={1}
                borderColor={{ from: "color", modifiers: [["darker", 0.2]] }}
                arcLabelsSkipAngle={0}
                arcLabelsTextColor={{
                  from: "color",
                  modifiers: [["darker", 2]],
                }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* ─── Bar for selected section ─── */}
      {selected && (
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-[#2B245C]">
          <h4 className="mb-4 text-xl font-semibold text-[#2B245C]">
            {selected.name} Details
          </h4>
          <div className="h-64">
            <ResponsiveBar
              data={selected.tasks}
              keys={["completion"]}
              indexBy="name"
              margin={{ top: 20, right: 20, bottom: 80, left: 60 }}
              padding={0.3}
              colors={[COLORS[0]]}
              axisBottom={{
                tickRotation: 0,
                legend: "Control Question",
                legendPosition: "middle",
                legendOffset: 50,
              }}
              axisLeft={{
                tickFormat: (v) => `${v}%`,
                legend: "Completion %",
                legendPosition: "middle",
                legendOffset: -50,
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
