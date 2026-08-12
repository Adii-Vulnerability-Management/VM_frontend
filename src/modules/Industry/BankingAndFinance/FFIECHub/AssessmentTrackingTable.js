// src/modules/Industry/BankingAndFinance/FFIECHub/AssessmentSelector.js
import React, { useState, useEffect } from "react";
import CustomAxios from "@/config/CustomAxios";
import { baseurl, initURL } from "@/config/config";
import { useRouter } from "next/router";
import { toast } from "react-toastify";
import Dialog from "@/components/ui/Dialog";
import Loader from "@/components/ui/Loader";

// Map part keys to tab IDs in URL
const tabIds = {
  partOne: "PartOneInherentRiskProfile",
  partTwo: "PartTwoCybersecurityMaturity",
};

export default function AssessmentSelector() {
  const router = useRouter();
  const [selectedPart, setSelectedPart] = useState("partOne");
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(false);

  // dialog state
  const [showDialog, setShowDialog] = useState(false);
  const [dialogData, setDialogData] = useState(null);

  // Fetch assessments for the selected part
  // useEffect(() => {
  //   async function load() {
  //     try {
  //       setAssessments([]);
  //       setLoading(true);
  //       let url;
  //       if (selectedPart === "partOne") {
  //         // your existing inward-risk API
  //         url = `${baseurl}/${initURL}/assessments?part=partOne`;
  //       } else {
  //         // PART TWO: hit the Cyber-Maturity endpoint instead
  //         url = `${baseurl}/${initURL}/cyber-maturity-assessments`;
  //       }

  //       const resp = await CustomAxios.get(url);

  //       // handle resp.data or resp.data.data
  //       const list = Array.isArray(resp.data)
  //         ? resp.data
  //         : resp.data.data || [];
  //       setAssessments(list);
  //     } catch (err) {
  //       console.error(err);
  //       toast.error("Failed to load assessments");
  //     } finally {
  //       setLoading(false);
  //     }
  //   }
  //   load();
  // }, [selectedPart]);
  // at top of component
  const loadAssessments = async () => {
    try {
      setAssessments([]);
      setLoading(true);
      const url =
        selectedPart === "partOne"
          ? `${baseurl}/${initURL}/assessments?part=partOne`
          : `${baseurl}/${initURL}/cyber-maturity-assessments`;
      const resp = await CustomAxios.get(url);
      const list = Array.isArray(resp.data) ? resp.data : resp.data.data || [];
      setAssessments(list);
    } catch {
      toast.error("Failed to load assessments");
    } finally {
      setLoading(false);
    }
  };

  // in your useEffect, replace inline load() with:
  useEffect(() => {
    loadAssessments();
  }, [selectedPart]);

  // Continue (edit) existing
  const handleContinue = (id) => {
    const tab = tabIds[selectedPart];
    router.push(`/industry/banking-and-finance/ffiec?tab=${tab}&id=${id}`);
  };
  // Start brand-new
  const handleNew = (partKey) => {
    const tab = tabIds[partKey];
    router.push(`/industry/banking-and-finance/ffiec?tab=${tab}`);
  };
  // Show roll-up details in modal
  const openDetails = (rollup) => {
    setDialogData(rollup);
    setShowDialog(true);
  };

  // Start editing (same as “Continue”)
  const handleEdit = (id) => {
    const tab = tabIds[selectedPart];
    router.push(`/industry/banking-and-finance/ffiec?tab=${tab}&id=${id}`);
  };

  // Delete with confirmation + refresh list
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this assessment?"))
      return;
    try {
      await CustomAxios.delete(`${baseurl}/${initURL}/assessments/${id}`);
      toast.success("Assessment deleted");
      // re-load the list
      loadAssessments();
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete assessment");
    }
  };

  return (
    <div className="p-2 bg-white rounded-lg shadow space-y-6">
      <div className="bg-[#2B245C] p-3 rounded-lg flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Left */}
        <div className="text-white font-bold text-xl">Assessments</div>

        {/* Center */}
        <div className="flex gap-2">
          {["partOne", "partTwo"].map((part) => (
            <button
              key={part}
              onClick={() => setSelectedPart(part)}
              className={`
          px-4 py-2 text-sm font-medium rounded-md transition
          ${
            selectedPart === part
              ? "bg-[#F2F1FB] text-[#2B245C] shadow"
              : "bg-[#050038] text-white hover:bg-[#F2F1FB] hover:text-[#2B245C]"
          }
        `}
            >
              {part === "partOne" ? "Part One" : "Part Two"}
            </button>
          ))}
        </div>

        {/* Right */}
        <div className="flex gap-2">
          <button
            onClick={() => handleNew("partOne")}
            className="px-4 py-2 text-sm font-medium rounded-md bg-[#F2F1FB] text-[#2B245C] border border-[#050038] hover:bg-[#050038] hover:text-white transition"
          >
            + New Inherent Risk
          </button>
          <button
            onClick={() => handleNew("partTwo")}
            className="px-4 py-2 text-sm font-medium rounded-md bg-[#F2F1FB] text-[#2B245C] border border-[#050038] hover:bg-[#050038] hover:text-white transition"
          >
            + New Cyber Maturity
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader />
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="mx-auto w-full max-w-4xl table-auto border-collapse text-sm">
            <thead className="bg-[#050038] text-white">
              <tr>
                <th className="border px-4 py-2 text-center">Name</th>
                <th className="border px-4 py-2 text-center">Completion %</th>
                <th className="border px-4 py-2 text-center">Start Date</th>
                <th className="border px-4 py-2 text-center">End Date</th>
                <th className="border px-4 py-2 text-center">Inherent Risk</th>
                <th className="border px-4 py-2 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {assessments.map((a, i) => {
                const pct = a.rollup?.percentAnswered ?? 0;
                return (
                  <tr
                    key={a._id}
                    className={i % 2 ? "bg-[#F2F1FB]" : "bg-white"}
                  >
                    <td className="border px-4 py-2 text-center">{a.name}</td>
                    <td className="border px-4 py-2 text-center">{pct}%</td>
                    <td className="border px-4 py-2 text-center">
                      {a.startDate?.slice(0, 10) ?? "—"}
                    </td>
                    <td className="border px-4 py-2 text-center">
                      {a.endDate?.slice(0, 10) ?? "—"}
                    </td>
                    <td className="border px-4 py-2 text-center">
                      {a.rollup?.inherentRisk ?? "—"}
                    </td>
                    <td className="border px-4 py-2 text-center space-x-2">
                      {/* 1) continue/edit */}
                      <button
                        onClick={() => handleEdit(a._id)}
                        className="px-3 py-1 bg-green-500 hover:bg-green-600 text-white rounded-md text-xs"
                      >
                        {pct === 100 ? "View" : "Continue"}
                      </button>

                      {/* 2) details */}
                      <button
                        onClick={() => openDetails(a.rollup)}
                        className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md text-xs"
                      >
                        Details
                      </button>

                      {/* 3) delete */}
                      <button
                        onClick={() => handleDelete(a._id)}
                        className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded-md text-xs"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                );
              })}
              {!assessments.length && !loading && (
                <tr>
                  <td className="border px-4 py-2 text-center" colSpan={6}>
                    No assessments found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Roll-up Details Modal */}
      <Dialog
        isOpen={showDialog}
        onClose={() => setShowDialog(false)}
        title="Risk Roll-Up Details"
      >
        {dialogData ? (
          <>
            <h3 className="font-semibold mb-2">Summary Metrics</h3>
            <ul className="list-disc ml-6 mb-4">
              <li>
                Inherent Risk: <strong>{dialogData.inherentRisk}</strong>
              </li>
              <li>
                Weighted Score: <strong>{dialogData.weightedScore}</strong>
              </li>
              <li>
                Average Score:{" "}
                <strong>{dialogData.averageScore.toFixed(2)}</strong>
              </li>
              <li>
                Percent Answered: <strong>{dialogData.percentAnswered}%</strong>
              </li>
            </ul>

            <h3 className="font-semibold mb-2">By Category</h3>
            <table className="w-full table-auto border-collapse text-sm">
              <thead className="bg-[#2B245C] text-white">
                <tr>
                  <th className="border px-2 py-1">Category</th>
                  <th className="border px-2 py-1">Answered</th>
                  <th className="border px-2 py-1">Least</th>
                  <th className="border px-2 py-1">Minimal</th>
                  <th className="border px-2 py-1">Moderate</th>
                  <th className="border px-2 py-1">Significant</th>
                  <th className="border px-2 py-1">Most</th>
                  <th className="border px-2 py-1">Avg Score</th>
                  <th className="border px-2 py-1">Risk Level</th>
                </tr>
              </thead>
              <tbody>
                {dialogData.categories.map((cat) => (
                  <tr key={cat.id} className="even:bg-gray-50">
                    <td className="border px-2 py-1">{cat.name}</td>
                    <td className="border px-2 py-1 text-center">
                      {cat.answered}
                    </td>
                    <td className="border px-2 py-1 text-center">
                      {cat.least}
                    </td>
                    <td className="border px-2 py-1 text-center">
                      {cat.minimal}
                    </td>
                    <td className="border px-2 py-1 text-center">
                      {cat.moderate}
                    </td>
                    <td className="border px-2 py-1 text-center">
                      {cat.significant}
                    </td>
                    <td className="border px-2 py-1 text-center">{cat.most}</td>
                    <td className="border px-2 py-1 text-center">
                      {cat.average.toFixed(2)}
                    </td>
                    <td className="border px-2 py-1 text-center">
                      {cat.inherentRiskLevel}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        ) : (
          <p>No data to display.</p>
        )}
      </Dialog>
    </div>
  );
}
