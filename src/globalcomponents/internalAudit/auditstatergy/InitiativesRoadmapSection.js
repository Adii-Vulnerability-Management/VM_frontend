// InitiativesRoadmapSection.js
import React from "react";
import { Plus, ClipboardList, BadgeCheck, Trash2 } from "lucide-react";

export default function InitiativesRoadmapSection({ data, onChange }) {
    console.log("🚀 ~ InitiativesRoadmapSection ~ data:", data)
    const { rows, selectedValueDriver, selectedInitiative, selectedStatus } = data;

    const valueDriverOptions = [
        "Enhance the effectiveness, quality, and value received from Internal Audit",
        "Impactful reporting to management, with a focus on key risks and controls",
    ];
    const initiativeOptions = [
        "Formalize the Internal Audit Operating Manual...",
        "Establish an Internal Audit Quality Assurance Program...",
        "Enhance coordination with and support of the external review process...",
        "Commission an external Quality Assessment Review...",
    ];
    const statusOptions = ["Not Started", "In Progress", "Complete"];

    const updateField = (field, value) =>
        onChange({ ...data, [field]: value });

    const handleAdd = () => {
        if (!selectedValueDriver || !selectedInitiative || !selectedStatus) return;

        const newRows = [
            ...rows,
            { valueDriver: selectedValueDriver, initiative: selectedInitiative, status: selectedStatus },
        ];

        onChange({
            ...data,
            rows: newRows,
            selectedValueDriver: "",
            selectedInitiative: "",
            selectedStatus: "",
        });
    };


    const handleDelete = (i) =>
        updateField("rows", rows.filter((_, idx) => idx !== i));

    const getStatusBadge = (status) => {
        const classes = {
            "Not Started": "bg-gray-200 text-gray-700",
            "In Progress": "bg-yellow-100 text-yellow-700",
            Complete: "bg-green-100 text-green-700",
        }[status];
        return (
            <span className={`px-3 py-1 text-xs rounded-full ${classes}`}>
                {status}
            </span>
        );
    };

    return (
        <div className="p-6 bg-white rounded-xl shadow-md border border-gray-200">
            <div className="flex items-center gap-2 mb-6">
                <ClipboardList className="text-blue-600" />
                <h2 className="text-xl font-semibold text-blue-800">
                    Identify Initiatives & Develop Road-map
                </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6 items-end">
                {[
                    { label: "Value Driver", options: valueDriverOptions, field: "selectedValueDriver" },
                    { label: "Initiative", options: initiativeOptions, field: "selectedInitiative" },
                    { label: "Status", options: statusOptions, field: "selectedStatus" },
                ].map(({ label, options, field }) => (
                    <div key={field}>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">
                            {label}
                        </label>
                        <select
                            value={data[field]}
                            onChange={e => updateField(field, e.target.value)}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">Select</option>
                            {options.map(o => <option key={o} value={o}>{o}</option>)}
                        </select>
                    </div>
                ))}

                <button
                    onClick={handleAdd}
                    className="w-full bg-blue-600 text-white font-semibold rounded-lg px-4 py-2 hover:bg-blue-700 transition flex items-center justify-center gap-2"
                >
                    <Plus size={18} /> Add
                </button>
            </div>

            {rows.length > 0 && (
                <div className="mt-6">
                    <div className="flex items-center gap-2 mb-3">
                        <BadgeCheck className="text-green-600" />
                        <h3 className="text-lg font-semibold text-gray-800">Added Initiatives</h3>
                    </div>
                    <div className="overflow-x-auto rounded-lg border border-gray-200">
                        <table className="min-w-full table-auto border-collapse">
                            <thead className="bg-gray-100">
                                <tr>
                                    {["Value Driver", "Initiative", "Status", "Action"].map(h => (
                                        <th key={h} className="px-4 py-2 text-sm font-medium text-left text-gray-700 border">
                                            {h}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {rows.map((row, idx) => (
                                    <tr key={idx} className="bg-white">
                                        <td className="px-4 py-2 border text-gray-700">{row.valueDriver}</td>
                                        <td className="px-4 py-2 border text-gray-700">{row.initiative}</td>
                                        <td className="px-4 py-2 border text-gray-700">{getStatusBadge(row.status)}</td>
                                        <td className="px-4 py-2 border text-gray-700">
                                            <button
                                                onClick={() => handleDelete(idx)}
                                                className="text-red-600 hover:text-red-800 transition"
                                                title="Delete"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
