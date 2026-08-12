// src/components/Dashboard.js
import React, { useEffect, useState, useMemo } from "react";
import CustomAxios from "@/globalcomponents/CustomAxios";
import { baseurl, initURL } from "../../../../BaseUrl";
import Loader from "@/globalcomponents/NewUi/Loader";
import { ResponsiveBar } from "@nivo/bar";
import { ResponsivePie } from "@nivo/pie";
import Dialog from "@/globalcomponents/NewUi/Dialog";
import dummy_data from "@/data/dummy_data.json"; // Dummy data for testing
import Pagination from "@/globalcomponents/NewUi/Pagination";
import SearchSection from "@/globalcomponents/NewUi/SearchSection";

export default function Dashboard() {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogTitle, setDialogTitle] = useState("");
  const [dialogItems, setDialogItems] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [dialogSearch, setDialogSearch] = useState("");

  // Fetch all assignments
  useEffect(() => {
    async function fetchData() {
      try {
        const res = await CustomAxios.get(
          `${baseurl}/${initURL}/policy-training-assignment`,
        );
        setAssignments(res?.data || []);
        // setAssignments(dummy_data); // Use dummy data for testing
      } catch (err) {
        console.error(err);
        setError("Unable to load dashboard data.");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // 1️⃣ Filter out any assignments without a valid employee
  const validAssignments = useMemo(
    () => assignments.filter((a) => a.employeeId && a.employeeId._id),
    [assignments],
  );

  // 2️⃣ Build per-employee stats
  const employeeStats = useMemo(() => {
    const map = {};
    validAssignments.forEach((a) => {
      const emp = a.employeeId;
      if (!map[emp._id]) {
        map[emp._id] = {
          id: emp._id,
          name: `${emp.first_name} ${emp.last_name}`,
          totalPolicies: 0,
          acceptedPolicies: 0,
          totalProcedures: 0,
          acceptedProcedures: 0,
          totalTrainings: 0,
          completedTrainings: 0,
        };
      }
      a.policies.forEach((p) => {
        map[emp._id].totalPolicies++;
        if (p.status === "Accepted") map[emp._id].acceptedPolicies++;
      });
      a.procedures.forEach((pr) => {
        map[emp._id].totalProcedures++;
        if (pr.status === "Accepted") map[emp._id].acceptedProcedures++;
      });
      a.trainings.forEach((t) => {
        map[emp._id].totalTrainings++;
        if (t.status === "Completed") map[emp._id].completedTrainings++;
      });
    });
    return Object.values(map).map((e) => {
      const assigned = e.totalPolicies + e.totalProcedures + e.totalTrainings;
      const done =
        e.acceptedPolicies + e.acceptedProcedures + e.completedTrainings;
      return {
        ...e,
        completionRate: assigned ? Math.round((done / assigned) * 100) : 0,
      };
    });
  }, [validAssignments]);

  // 3️⃣ Summary metrics
  const totalEmployees = employeeStats.length;
  const totalPolicies = employeeStats.reduce((s, e) => s + e.totalPolicies, 0);
  const totalProcedures = employeeStats.reduce(
    (s, e) => s + e.totalProcedures,
    0,
  );
  const totalTrainings = employeeStats.reduce(
    (s, e) => s + e.totalTrainings,
    0,
  );
  const employeesDoneAll = employeeStats.filter(
    (e) =>
      e.totalPolicies > 0 &&
      e.acceptedPolicies === e.totalPolicies &&
      e.totalProcedures === e.acceptedProcedures &&
      e.totalTrainings === e.completedTrainings,
  ).length;

  // 4️⃣ Chart distributions
  // src/components/Dashboard.js
  // …

  // 4️⃣ Chart distributions

  // ─────────────────────────────────────────────────────────────────────────
  // Policy Status (in the order: Accepted → Pending → Rejected)
  const policyDist = useMemo(() => {
    // 1️⃣ tally up
    const tally = {};
    validAssignments.forEach((a) =>
      a.policies.forEach((p) => {
        tally[p.status] = (tally[p.status] || 0) + 1;
      }),
    );

    // 2️⃣ define the exact order you want
    const statusOrder = ["Accepted", "Pending", "Rejected"];

    // 3️⃣ map over that order, pulling counts out of the tally
    return statusOrder
      .filter((status) => tally[status] > 0) // only include statuses you actually have
      .map((status) => ({
        status,
        count: tally[status] || 0,
      }));
  }, [validAssignments]);
  // ─────────────────────────────────────────────────────────────────────────

  // … then feed policyDist to ResponsiveBar as before

  const procedureDist = useMemo(() => {
    // 1️⃣ build raw counts
    const tally = {};
    validAssignments.forEach((a) =>
      a.procedures.forEach((p) => {
        tally[p.status] = (tally[p.status] || 0) + 1;
      }),
    );

    // 2️⃣ define the exact order you want
    const statusOrder = ["Accepted", "Pending", "Rejected"];

    // 3️⃣ map over that order, pulling counts out of the tally
    return statusOrder
      .filter((status) => tally[status] > 0) // if you only want ones with data
      .map((status) => ({
        status,
        count: tally[status] || 0,
      }));
  }, [validAssignments]);

  const trainingDist = useMemo(() => {
    const tally = {};
    validAssignments.forEach((a) =>
      a.trainings.forEach((t) => {
        tally[t.status] = (tally[t.status] || 0) + 1;
      }),
    );
    return Object.entries(tally).map(([id, value]) => ({
      id,
      label: id,
      value,
    }));
  }, [validAssignments]);
  // Prepare detailed lists:
  const policyDetails = useMemo(
    () =>
      validAssignments.flatMap((a) =>
        a.policies.map((p) => ({
          employee: `${a.employeeId.first_name} ${a.employeeId.last_name}`,
          name: p.policy.name,
          status: p.status,
        })),
      ),
    [validAssignments],
  );

  const procedureDetails = useMemo(
    () =>
      validAssignments.flatMap((a) =>
        a.procedures.map((pr) => ({
          employee: `${a.employeeId.first_name} ${a.employeeId.last_name}`,
          name: pr.procedure.name,
          status: pr.status,
        })),
      ),
    [validAssignments],
  );

  const trainingDetails = useMemo(
    () =>
      validAssignments.flatMap((a) =>
        a.trainings.map((t) => ({
          employee: `${a.employeeId.first_name} ${a.employeeId.last_name}`,
          name: t.training.name,
          status: t.status,
        })),
      ),
    [validAssignments],
  );
  // after computing employeeStats:
  const itemsPerPage = 5;
  const totalPages = Math.ceil(employeeStats.length / itemsPerPage);
  const paginatedStats = employeeStats.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );
  const filteredDialogItems = useMemo(
    () =>
      dialogItems.filter((item) =>
        item.employee.toLowerCase().includes(dialogSearch.toLowerCase()),
      ),
    [dialogItems, dialogSearch],
  );
  const maxCount = Math.max(...procedureDist.map((d) => d.count), 0);
  const allTicks = Array.from({ length: maxCount + 1 }, (_, i) => i);
  const maxCounts = Math.max(...policyDist.map((d) => d.count), 0);
  const allTick = Array.from({ length: maxCounts + 1 }, (_, i) => i);
  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#F2F1FB]">
        <Loader />
      </div>
    );
  }
  if (error) {
    return (
      <p className="text-red-600 text-center mt-10 bg-[#F2F1FB]">{error}</p>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="px-6 py-8 bg-[#2B245C] rounded-2xl shadow-lg hover:shadow-2xl transition-shadow duration-300">
        <div>
          <h1 className="text-3xl font-bold text-cyan-50">Dashboard</h1>
        </div>
      </div>

      {/* ─────────── Summary Cards ─────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
        {[
          { label: "Total Employees", value: totalEmployees, details: [] },
          {
            label: "Policies Assigned",
            value: totalPolicies,
            details: policyDetails,
          },
          {
            label: "Procedures Assigned",
            value: totalProcedures,
            details: procedureDetails,
          },
          {
            label: "Trainings Assigned",
            value: totalTrainings,
            details: trainingDetails,
          },
          {
            label: "Employees Completed All",
            value: employeesDoneAll,
            details: [],
          },
        ].map(({ label, value, details }) => (
          <div
            key={label}
            className="bg-blue-50 border-t-4 border-[#2B245C] shadow rounded-lg p-4 flex flex-col items-center cursor-pointer hover:shadow-lg transition"
            onClick={() => {
              if (details.length) {
                setDialogTitle(label);
                setDialogItems(details);
                setDialogOpen(true);
              }
            }}
          >
            <span className="text-sm text-[#050038] font-medium">{label}</span>
            <span className="text-2xl font-bold text-[#2B245C]">{value}</span>
          </div>
        ))}
      </div>

      {/* ────────────── Charts ────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Policy Status */}
        <div className="bg-white border-l-4 border-[#050038] p-4 rounded-lg shadow-lg hover:shadow-2xl transition-shadow duration-300 ">
          <h4 className="text-lg font-bold text-[#050038] mb-2">
            Policy Status
          </h4>
          <div style={{ height: 280 }}>
            <ResponsiveBar
              data={policyDist}
              keys={["count"]}
              indexBy="status"
              margin={{ top: 40, right: 20, bottom: 60, left: 50 }}
              padding={0.4}
              colors={{ scheme: "paired" }}
              axisBottom={{
                tickRotation: 0,
                tickSize: 5,
                tickPadding: 5,
                legend: "Policy Status",
                legendPosition: "middle",
                legendOffset: 40,
              }}
              axisLeft={{
                legend: "Count",
                tickSize: 5,
                tickPadding: 5,
                legendPosition: "middle",
                legendOffset: -40,
                format: (value) => value, // show raw numbers
              }}
              /* draw horizontal grid lines at each Y tick */
              enableGridY={true}
              enableGridX={false}
              // gridYValues={[0, "auto", "max"]}
              gridYValues={allTick}
              label={(d) => d.value} // display count on each bar
              labelSkipWidth={0}
              labelSkipHeight={0}
              labelTextColor={{ from: "color", modifiers: [["darker", 2]] }}
              tooltip={({ indexValue, value }) => (
                <strong>
                  {indexValue}: {value}
                </strong>
              )}
              theme={{
                labels: {
                  text: {
                    fontSize: 14, // make labels larger
                    fontWeight: "bold",
                    fill: "#050038", // match your dark text color
                  },
                },
                grid: {
                  line: {
                    stroke: "#e2e8f0",
                    strokeWidth: 1,
                    strokeDasharray: "4 4",
                  },
                },
              }}
            />
          </div>
        </div>

        {/* Training Completion */}
        <div className="bg-white border-l-4 border-[#050038] p-4 rounded-lg shadow-lg hover:shadow-2xl transition-shadow duration-300 ">
          <h4 className="text-lg font-bold text-[#2B245C] mb-2">
            Training Completion
          </h4>
          <div className="h-72">
            <ResponsivePie
              data={trainingDist}
              margin={{ top: 40, right: 80, bottom: 40, left: 80 }}
              innerRadius={0.5}
              padAngle={1}
              cornerRadius={3}
              activeOuterRadiusOffset={8}
              colors={{ scheme: "accent" }}
              borderWidth={1}
              borderColor={{ from: "color", modifiers: [["darker", 0.2]] }}
              arcLinkLabelsSkipAngle={10}
              arcLinkLabelsTextColor="#333"
              arcLinkLabelsThickness={2}
              arcLinkLabelsColor={{ from: "color" }}
              arcLabelsSkipAngle={10}
              arcLabelsTextColor={{ from: "color", modifiers: [["darker", 2]] }}
              legends={[
                {
                  anchor: "bottom",
                  direction: "row",
                  translateY: 56,
                  itemWidth: 80,
                  itemHeight: 18,
                  symbolSize: 12,
                },
              ]}
              tooltip={({ datum }) => (
                <strong>
                  {datum.id}: {datum.value}
                </strong>
              )}
            />
          </div>
        </div>

        {/* Procedure Status */}
        <div className="bg-white border-l-4 border-[#050038] p-4 rounded-lg shadow-lg hover:shadow-2xl transition-shadow duration-300 ">
          <h4 className="text-lg font-bold text-[#2B245C] mb-2">
            Procedure Status
          </h4>
          <div style={{ height: 280 }}>
            <ResponsiveBar
              data={procedureDist}
              keys={["count"]}
              indexBy="status"
              margin={{ top: 40, right: 20, bottom: 60, left: 50 }}
              padding={0.4}
              colors={{ scheme: "category10" }}
              /* bottom axis */
              axisBottom={{
                tickRotation: 0,
                tickSize: 5,
                tickPadding: 5,
                legend: "Procedure Status",
                legendPosition: "middle",
                legendOffset: 40,
              }}
              /* left axis: force ticks at every integer */
              axisLeft={{
                tickSize: 5,
                tickPadding: 5,
                legend: "Count",
                legendPosition: "middle",
                legendOffset: -40,
                tickValues: allTicks,
                format: (v) => v,
              }}
              /* draw horizontal grid lines at each Y tick */
              enableGridY={true}
              enableGridX={false}
              gridYValues={allTicks}
              /* labels on bars */
              label={(d) => d.value}
              labelSkipWidth={0}
              labelSkipHeight={0}
              labelTextColor={{ from: "color", modifiers: [["darker", 2]] }}
              /* optional: style grid lines to be dashed & lighter */
              theme={{
                labels: {
                  text: {
                    fontSize: 14, // make labels larger
                    fontWeight: "bold",
                    fill: "#050038", // match your dark text color
                  },
                },
                grid: {
                  line: {
                    stroke: "#e2e8f0",
                    strokeWidth: 1,
                    strokeDasharray: "4 4",
                  },
                },
              }}
              tooltip={({ indexValue, value }) => (
                <strong>
                  {indexValue}: {value}
                </strong>
              )}
            />
          </div>
        </div>
      </div>

      {/* ─────── Employee Completion Details ─────── */}
      <div className="bg-white p-6 rounded-lg shadow border-t-4 border-[#2B245C]">
        <h2 className="text-2xl font-bold text-[#2B245C] mb-3">
          Employee Completion Details
        </h2>

        <div className="overflow-x-auto rounded-lg border border-gray-800">
          <table className="min-w-full text-sm">
            <thead className="bg-[#2B245C] text-left text-white border-b border-gray-800">
              <tr>
                <th className="px-4 py-2 font-medium">
                  Employee
                </th>
                <th className="px-4 py-2 font-medium">
                  Policies ↴
                </th>
                <th className="px-4 py-2 font-medium">
                  Accepted ↴
                </th>
                <th className="px-4 py-2 font-medium">
                  Procedures ↴
                </th>
                <th className="px-4 py-2 font-medium">
                  Accepted ↴
                </th>
                <th className="px-4 py-2 font-medium">
                  Trainings ↴
                </th>
                <th className="px-4 py-2 font-medium">
                  Completed ↴
                </th>
                <th className="px-4 py-2 font-medium">
                  Completion %
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {paginatedStats.map((emp, idx) => (
                <tr
                  key={emp.id}
                  className={idx % 2 === 0 ? "bg-white" : "bg-[#F2F1FB]"}
                >
                  <td className="px-4 py-2">
                    {emp.name}
                  </td>
                  <td className="px-4 py-2">
                    {emp.totalPolicies}
                  </td>
                  <td className="px-4 py-2">
                    {emp.acceptedPolicies}
                  </td>
                  <td className="px-4 py-2">
                    {emp.totalProcedures}
                  </td>
                  <td className="px-4 py-2">
                    {emp.acceptedProcedures}
                  </td>
                  <td className="px-4 py-2">
                    {emp.totalTrainings}
                  </td>
                  <td className="px-4 py-2">
                    {emp.completedTrainings}
                  </td>
                  <td className="px-4 py-2">
                    {emp.completionRate}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination controls */}
        <div className="mt-4">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={(page) => setCurrentPage(page)}
          />
        </div>
      </div>

      <Dialog
        isOpen={dialogOpen}
        onClose={() => {
          setDialogOpen(false);
          setDialogSearch("");
        }}
        title={dialogTitle}
      >
        {/* Search bar */}
        <div className="mb-4">
          <SearchSection
            placeholder="Search by employee…"
            initialValue={dialogSearch}
            searchButtonText="Search"
            clearButtonText="Clear"
            onSearch={(term) => setDialogSearch(term)}
            onClear={() => setDialogSearch("")}
          />
        </div>

        {/* Filtered table */}
        <div className="max-h-[60vh] overflow-y-auto">
          <table className="min-w-full table-auto text-sm">
            <thead>
              <tr className="bg-[#2B245C] text-white">
                <th className="px-4 py-2 text-left">Employee</th>
                <th className="px-4 py-2 text-left">
                  {dialogTitle.split(" ")[0]}
                </th>
                <th className="px-4 py-2 text-left">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredDialogItems.map((item, idx) => (
                <tr key={idx} className={idx % 2 ? "bg-[#F2F1FB]" : "bg-white"}>
                  <td className="px-4 py-2">{item.employee}</td>
                  <td className="px-4 py-2">{item.name}</td>
                  <td className="px-4 py-2">{item.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Dialog>
    </div>
  );
}
