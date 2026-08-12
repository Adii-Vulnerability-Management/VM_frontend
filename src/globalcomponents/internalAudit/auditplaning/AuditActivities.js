import React, { useState } from "react";
import { FaTrash } from "react-icons/fa";

export default function AuditActivities({ selectedTopicObj }) {
    const [activities, setActivities] = useState([]);
    const [newActivity, setNewActivity] = useState({
        startDate: "",
        endDate: "",
        siteLocation: "",
        auditor: "",
        process: selectedTopicObj?.processArea?.name || "",
        coverage: "",
    });
    console.log("🚀 ~ AuditActivities ~ newActivity:", newActivity)

    // Example auditor list; swap in your real list or fetch it
    const AUDITORS = [
        { id: "aud1", name: "Alice Johnson" },
        { id: "aud2", name: "Bob Smith" },
        { id: "aud3", name: "Carol Lee" },
    ];

    // Handle input/select changes
    const handleChange = (e) => {
        const { name, value } = e.target;
        setNewActivity((prev) => ({ ...prev, [name]: value }));
    };

    // Add new activity
    const handleAddActivity = () => {
        if (!newActivity.startDate || !newActivity.endDate) {
            alert("Please enter both Start Date and End Date.");
            return;
        }
        setActivities((prev) => [...prev, { ...newActivity, process: selectedTopicObj?.processArea?.name || "" }]);
        setNewActivity({
            startDate: "",
            endDate: "",
            siteLocation: "",
            auditor: "",
            process: selectedTopicObj?.processArea?.name || "",
            coverage: "",
        });
    };

    // Remove an activity
    const handleRemoveActivity = (idx) =>
        setActivities((prev) => prev.filter((_, i) => i !== idx));

    return (
        <div className="space-y-8">
            {/* Activities Table */}
            <div className="overflow-x-auto rounded-2xl">
                <table className="w-full border-collapse text-left">
                    <thead>
                        <tr className="bg-gradient-to-r from-blue-100 to-blue-200 border-b">
                            {[
                                "Start Date",
                                "End Date",
                                "Site Location",
                                "Auditor",
                                "Process",
                                "Coverage of the Audit Program",
                                "Action",
                            ].map((hdr) => (
                                <th
                                    key={hdr}
                                    className="p-3 font-semibold text-blue-800 border-r"
                                >
                                    {hdr}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {activities.length === 0 ? (
                            <tr>
                                <td
                                    colSpan="7"
                                    className="p-4 text-center text-gray-500 italic"
                                >
                                    No activities added yet.
                                </td>
                            </tr>
                        ) : (
                            activities.map((act, i) => (
                                <tr key={i} className="border-b hover:bg-gray-50">
                                    <td className="p-3 border-r">{act.startDate}</td>
                                    <td className="p-3 border-r">{act.endDate}</td>
                                    <td className="p-3 border-r">{act.siteLocation}</td>
                                    <td className="p-3 border-r">{act.auditor}</td>
                                    <td className="p-3 border-r">{act.process}</td>
                                    <td className="p-3 border-r">{act.coverage}</td>
                                    <td className="p-3">
                                        <button
                                            onClick={() => handleRemoveActivity(i)}
                                            className="text-red-500 hover:text-red-700 focus:outline-none"
                                            title="Delete Activity"
                                        >
                                            <FaTrash />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Add New Activity Form */}
            <div className="bg-gray-50 p-6 rounded-xl border border-blue-200 space-y-4">
                <h3 className="text-xl font-semibold text-gray-700">
                    Add a New Activity
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    {/* Start Date */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Start Date
                        </label>
                        <input
                            type="date"
                            name="startDate"
                            value={newActivity.startDate}
                            onChange={handleChange}
                            className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                    {/* End Date */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            End Date
                        </label>
                        <input
                            type="date"
                            name="endDate"
                            value={newActivity.endDate}
                            onChange={handleChange}
                            className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                    {/* Site Location */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Site Location
                        </label>
                        <input
                            type="text"
                            name="siteLocation"
                            placeholder="e.g., Dallas, TX"
                            value={newActivity.siteLocation}
                            onChange={handleChange}
                            className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                    {/* Auditor */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Auditor
                        </label>
                        <select
                            name="auditor"
                            value={newActivity.auditor}
                            onChange={handleChange}
                            className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value="">Select an auditor…</option>
                            {AUDITORS.map((a) => (
                                <option key={a.id} value={a.name}>
                                    {a.name}
                                </option>
                            ))}
                        </select>
                    </div>
                    {/* Process */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Process
                        </label>
                        <input
                            type="text"
                            name="process"
                            placeholder="e.g., Management Interaction"
                            value={selectedTopicObj?.processArea?.name}
                            // onChange={handleChange}
                            disabled
                            className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                    {/* Coverage */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Coverage of the Audit Program
                        </label>
                        <input
                            type="text"
                            name="coverage"
                            placeholder="e.g., Business Understanding"
                            value={newActivity.coverage}
                            onChange={handleChange}
                            className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                </div>
                <div
                    onClick={handleAddActivity}
                    className="text-blue-600 cursor-pointer hover:underline mt-2"
                >
                    + Add Activity
                </div>
            </div>
        </div>
    );
}
