// src/modules/Industry/AutoMobile/ISO42001/MyAssignments.js
import React, { useMemo, useState, useEffect } from "react";
import { FaFilePdf } from "react-icons/fa";
import CustomAxios from "@/config/CustomAxios";
import { baseurl, initURL } from "@/config/config";
import Loader from "@/components/ui/Loader";

export default function ISO42001MyAssignments() {
    const [filter, setFilter] = useState("All");
    const [assignments, setAssignments] = useState([]);
    const [loading, setLoading] = useState(true);
    const today = new Date();
    const oneWeek = new Date();
    oneWeek.setDate(today.getDate() + 7);

    useEffect(() => {
        async function fetchAssignments() {
            setLoading(true);
            try {
                const res = await CustomAxios.get(
                    `${baseurl}/${initURL}/iso42001/applicabilities`
                );
                // normalize to our table shape
                const normalized = res.data.map((doc) => ({
                    id: doc.controlId.controlId,
                    title: doc.controlId.title,
                    section: doc.controlId.controlType,
                    due: doc.dueDate ? doc.dueDate.slice(0, 10) : null,
                    priority: doc.controlId.priority || "Medium", // or derive if you have it
                    assignee: `${doc.assigneeUuid.first_name} ${doc.assigneeUuid.last_name}`,
                    evidenceFileName:
                        doc.references[0]?.filePath?.split("/").pop() || null,
                    myComment: doc.answers.map((a) => a.answer).join("; "),
                    reviewer: doc.reviewerUuid
                        ? `${doc.reviewerUuid.first_name} ${doc.reviewerUuid.last_name}`
                        : "—",
                    reviewerComment: doc.reviewerComments || "",
                    reviewerStatus: doc.reviewerStatus || "pending",
                    approver: doc.approverUuid
                        ? `${doc.approverUuid.first_name} ${doc.approverUuid.last_name}`
                        : "—",
                    approverComment: doc.approverComments || "",
                    approverStatus: doc.approverStatus || "pending",
                }));
                setAssignments(normalized);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        }
        fetchAssignments();
    }, []);

    const filtered = useMemo(() => {
        return assignments
            .filter((a) => {
                if (!a.due) return filter === "All";
                const dueDate = new Date(a.due);
                switch (filter) {
                    case "Overdue":
                        return dueDate < today;
                    case "DueThisWeek":
                        return dueDate >= today && dueDate <= oneWeek;
                    case "Completed":
                        return (
                            a.reviewerStatus.toLowerCase() === "approved" &&
                            a.approverStatus.toLowerCase() === "approved"
                        );
                    case "PendingReview":
                        return (
                            ["pending", "in review"].includes(a.reviewerStatus.toLowerCase())
                        );
                    default:
                        return true;
                }
            })
            .sort((a, b) => new Date(a.due || 0) - new Date(b.due || 0));
    }, [assignments, filter]);

    if (loading) {
        return (
            <div className="h-[75vh] flex items-center justify-center">
                <Loader />
            </div>
        );
    }

    return (
        <div className="p-6 bg-gray-50 rounded-lg shadow space-y-4">
            {/* Tabs/Filters */}
            <div className="flex space-x-4">
                {[
                    "All",
                    "Overdue",
                    "DueThisWeek",
                    "Completed",
                    "PendingReview",
                ].map((f) => (
                    <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className={`px-4 py-2 rounded-full font-medium transition ${filter === f
                            ? "bg-[#2B245C] text-white"
                            : "bg-white text-gray-700 border"
                            }`}
                    >
                        {f.replace(/([A-Z])/g, " $1").trim()}
                    </button>
                ))}
            </div>

            <div className="overflow-x-auto bg-white rounded-lg shadow-md">
                <table className="min-w-full table-auto text-sm border-collapse">
                    <thead>
                        <tr className="bg-[#2B245C] text-white">
                            {[
                                "Control",
                                "Due Date",
                                "Priority",
                                "Assigned To",
                                "Evidence File",
                                "Assignee Comment",
                                "Reviewer",
                                "Reviewer Status",
                                "Approver",
                                "Approver Status",
                                "Notify Employee",
                            ].map((col) => (
                                <th
                                    key={col}
                                    className="px-3 py-2 text-center whitespace-nowrap"
                                >
                                    {col}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.length === 0 ? (
                            <tr>
                                <td
                                    colSpan={11}
                                    className="py-4 text-center text-gray-500 italic"
                                >
                                    No assigned controls.
                                </td>
                            </tr>
                        ) : (
                            filtered.map((a, i) => {
                                const dueDate = new Date(a.due);
                                let rowClass =
                                    i % 2 === 0 ? "bg-white" : "bg-gray-50";
                                if (a.due) {
                                    if (dueDate < today) rowClass += " border-l-4 border-red-500";
                                    else if (dueDate <= oneWeek)
                                        rowClass += " border-l-4 border-yellow-400";
                                }
                                return (
                                    <tr
                                        key={a.id}
                                        className={`${rowClass} hover:bg-gray-100 transition`}
                                    >
                                        <td className="border px-3 py-2 text-center font-medium">
                                            {a.id}
                                        </td>
                                        <td className="border px-3 py-2 text-center">
                                            {a.due || "—"}
                                        </td>
                                        <td className="border px-3 py-2 text-center">
                                            {a.priority}
                                        </td>
                                        <td className="border px-3 py-2 text-center">
                                            {a.assignee}
                                        </td>
                                        <td className="border px-3 py-2 text-center">
                                            {a.evidenceFileName ? (
                                                <FaFilePdf className="text-red-600 mx-auto text-xl" />
                                            ) : (
                                                "—"
                                            )}
                                        </td>
                                        <td className="border px-3 py-2 text-center">
                                            {a.myComment || "—"}
                                        </td>
                                        <td className="border px-3 py-2 text-center">
                                            {a.reviewer}
                                        </td>
                                        <td className="border px-3 py-2 text-center">
                                            <span
                                                className={`px-2 py-1 rounded ${a.reviewerStatus.toLowerCase() === "approved"
                                                    ? "bg-green-100 text-green-800"
                                                    : a.reviewerStatus.toLowerCase().includes("in review")
                                                        ? "bg-yellow-100 text-yellow-800"
                                                        : "bg-gray-100 text-gray-800"
                                                    }`}
                                            >
                                                {a.reviewerStatus}
                                            </span>
                                        </td>
                                        <td className="border px-3 py-2 text-center">
                                            {a.approver}
                                        </td>
                                        <td className="border px-3 py-2 text-center">
                                            <span
                                                className={`px-2 py-1 rounded ${a.approverStatus.toLowerCase() === "approved"
                                                    ? "bg-green-100 text-green-800"
                                                    : a.approverStatus.toLowerCase() === "pending"
                                                        ? "bg-yellow-100 text-yellow-800"
                                                        : "bg-gray-100 text-gray-800"
                                                    }`}
                                            >
                                                {a.approverStatus}
                                            </span>
                                        </td>
                                        <td className="border px-3 py-2 text-center">
                                            <button
                                                onClick={() =>
                                                    alert(`Notified ${a.assignee} about ${a.id}`)
                                                }
                                                className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                                            >
                                                Notify
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
