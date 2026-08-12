import React, { useState } from "react";
import { FaTrash } from "react-icons/fa";

export default function AuditProgramImplementation() {
    const [entries, setEntries] = useState([]);
    const [newEntry, setNewEntry] = useState({
        auditStep: "",
        controlObjective: "",
        controlAudit: "",
        docArtifact: "",
        artifactDescription: "",
        evidenceUpload: "",
        auditor: "",
        conclusion: "",
    });

    // Handle changes to form inputs
    const handleChange = (e) => {
        const { name, value } = e.target;
        setNewEntry((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    // Add a new entry to the table
    const handleAddEntry = () => {
        // Basic validation: require at least the Audit Step
        if (!newEntry.auditStep.trim()) {
            alert("Please enter at least the Audit Step.");
            return;
        }
        setEntries((prev) => [...prev, newEntry]);
        // Reset the form
        setNewEntry({
            auditStep: "",
            controlObjective: "",
            controlAudit: "",
            docArtifact: "",
            artifactDescription: "",
            evidenceUpload: "",
            auditor: "",
            conclusion: "",
        });
    };

    // Remove an entry from the table
    const handleRemoveEntry = (index) => {
        const updated = entries.filter((_, i) => i !== index);
        setEntries(updated);
    };

    return (
        <div className="space-y-8">
            {/* Table Display */}
            <div className="overflow-x-auto rounded-2xl">
                <table className="w-full border-collapse text-left ">
                    <thead>
                        <tr className="bg-gradient-to-r from-blue-100 to-blue-200 border-b">
                            {[
                                "Audit Step",
                                "Control Objective",
                                "Control(s)/Audit",
                                "Documentation Artifact",
                                "Artifact Description",
                                "Evidence Upload",
                                "Auditor",
                                "Auditor Conclusion",
                                "Action",
                            ].map((column, index) => (
                                <th
                                    key={index}
                                    className="p-3 font-semibold text-blue-800 border-r"
                                >
                                    {column}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {entries.length === 0 ? (
                            <tr>
                                <td colSpan="9" className="p-4 text-center text-gray-500 italic">
                                    No entries added yet.
                                </td>
                            </tr>
                        ) : (
                            entries.map((entry, index) => (
                                <tr key={index} className="border-b hover:bg-gray-50">
                                    <td className="p-3 border-r">{entry.auditStep}</td>
                                    <td className="p-3 border-r">{entry.controlObjective}</td>
                                    <td className="p-3 border-r">{entry.controlAudit}</td>
                                    <td className="p-3 border-r">{entry.docArtifact}</td>
                                    <td className="p-3 border-r">{entry.artifactDescription}</td>
                                    <td className="p-3 border-r">{entry.evidenceUpload}</td>
                                    <td className="p-3 border-r">{entry.auditor}</td>
                                    <td className="p-3 border-r">{entry.conclusion}</td>
                                    <td className="p-3">
                                        <button
                                            onClick={() => handleRemoveEntry(index)}
                                            className="text-red-500 hover:text-red-700 focus:outline-none"
                                            title="Delete Entry"
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

            {/* Add New Entry Form */}
            <div className="bg-gray-50 p-6 rounded-xl border border-green-200 space-y-4">
                <h3 className="text-xl font-semibold text-gray-700">
                    Add a New Program Entry
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {/* Audit Step */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Audit Step
                        </label>
                        <input
                            type="text"
                            name="auditStep"
                            placeholder="e.g., Review evidence"
                            value={newEntry.auditStep}
                            onChange={handleChange}
                            className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                    </div>

                    {/* Control Objective */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Control Objective
                        </label>
                        <input
                            type="text"
                            name="controlObjective"
                            placeholder="e.g., Validate control objective"
                            value={newEntry.controlObjective}
                            onChange={handleChange}
                            className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                    </div>

                    {/* Control(s)/Audit */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Control(s)/Audit
                        </label>
                        <input
                            type="text"
                            name="controlAudit"
                            placeholder="e.g., Perform the control"
                            value={newEntry.controlAudit}
                            onChange={handleChange}
                            className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                    </div>

                    {/* Documentation Artifact */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Documentation Artifact
                        </label>
                        <input
                            type="text"
                            name="docArtifact"
                            placeholder="e.g., Policy doc"
                            value={newEntry.docArtifact}
                            onChange={handleChange}
                            className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                    </div>

                    {/* Artifact Description */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Artifact Description
                        </label>
                        <input
                            type="text"
                            name="artifactDescription"
                            placeholder="Short description"
                            value={newEntry.artifactDescription}
                            onChange={handleChange}
                            className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                    </div>

                    {/* Evidence Upload */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Evidence Upload
                        </label>
                        <input
                            type="text"
                            name="evidenceUpload"
                            placeholder="Link or reference"
                            value={newEntry.evidenceUpload}
                            onChange={handleChange}
                            className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                        {/*
              Optionally, you can use type="file" if you want to allow file uploads,
              but that typically requires additional backend logic to handle the files.
            */}
                    </div>

                    {/* Auditor */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Auditor
                        </label>
                        <input
                            type="text"
                            name="auditor"
                            placeholder="Auditor's name/initials"
                            value={newEntry.auditor}
                            onChange={handleChange}
                            className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                    </div>

                    {/* Conclusion */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Auditor Conclusion
                        </label>
                        <select
                            name="conclusion"
                            value={newEntry.conclusion}
                            onChange={handleChange}
                            className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                        >
                            <option value="">Select Conclusion</option>
                            <option value="Conformity">Conformity</option>
                            <option value="Major Non-conformity">Major Non-conformity</option>
                            <option value="Minor Non-conformity">Minor Non-conformity</option>
                        </select>
                    </div>
                </div>
                <div
                    onClick={handleAddEntry}
                    className="text-blue-600 cursor-pointer hover:underline mt-2"
                >
                    + Add Program Entry
                </div>
            </div>
        </div>
    );
}
