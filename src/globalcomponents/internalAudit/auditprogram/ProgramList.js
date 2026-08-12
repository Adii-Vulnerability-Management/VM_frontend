import { useState } from "react";
import { FiEdit, FiTrash2, FiCheck, FiX, FiDownload } from "react-icons/fi";

const ProgramList = () => {
    // List of audit programs (imported or manually added)
    const [programs, setPrograms] = useState([]);
    // Toggle "Add Program" form
    const [showAddForm, setShowAddForm] = useState(false);

    // State for new program input values
    const [newProgram, setNewProgram] = useState({
        programID: "",
        category: "",
        area: "",
        programName: "",
        applicableDept: "",
    });

    // File input state (for future Excel/CSV parsing)
    const [file, setFile] = useState(null);

    // Inline editing states
    const [editingIndex, setEditingIndex] = useState(null);
    const [editedProgram, setEditedProgram] = useState({
        programID: "",
        category: "",
        area: "",
        programName: "",
        applicableDept: "",
    });

    // Handle file selection
    const handleFileChange = (e) => {
        if (e.target.files.length > 0) {
            setFile(e.target.files[0]);
        }
    };

    // Simulate importing programs (dummy data)
    const handleImportPrograms = () => {
        const dummyPrograms = [
            {
                programID: "AP-001",
                category: "Finance",
                area: "Reconciliation",
                programName: "Monthly Reconciliation Audit",
                applicableDept: "Finance",
            },
            {
                programID: "AP-002",
                category: "IT",
                area: "Security",
                programName: "Network Security Audit",
                applicableDept: "IT",
            },
        ];
        setPrograms((prev) => [...prev, ...dummyPrograms]);
    };

    // Handle input changes in the "Add Program" form
    const handleNewProgramChange = (e) => {
        const { name, value } = e.target;
        setNewProgram((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    // Save the new program
    const handleSaveNewProgram = () => {
        setPrograms((prev) => [...prev, newProgram]);
        // Reset the form
        setNewProgram({
            programID: "",
            category: "",
            area: "",
            programName: "",
            applicableDept: "",
        });
        setShowAddForm(false);
    };

    // Begin editing a row
    const handleEditClick = (index) => {
        setEditingIndex(index);
        setEditedProgram(programs[index]);
    };

    // Handle changes in the inline edit form
    const handleEditedProgramChange = (e) => {
        const { name, value } = e.target;
        setEditedProgram((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    // Save the edited program
    const handleSaveEditedProgram = () => {
        setPrograms((prev) =>
            prev.map((prog, idx) => (idx === editingIndex ? editedProgram : prog))
        );
        setEditingIndex(null);
        // Reset edited state
        setEditedProgram({
            programID: "",
            category: "",
            area: "",
            programName: "",
            applicableDept: "",
        });
    };

    // Cancel editing
    const handleCancelEditProgram = () => {
        setEditingIndex(null);
        setEditedProgram({
            programID: "",
            category: "",
            area: "",
            programName: "",
            applicableDept: "",
        });
    };

    // Delete a program
    const handleDeleteProgram = (index) => {
        setPrograms((prev) => prev.filter((_, idx) => idx !== index));
    };

    // Download a sample CSV (Excel-friendly) for the audit program
    const downloadSampleExcel = () => {
        // CSV header + sample rows
        const csvContent = [
            ["Program ID", "Category", "Area", "Program Name", "Applicable Dept"].join(","),
            ["AP-001", "Finance", "Reconciliation", "Monthly Reconciliation Audit", "Finance"].join(","),
            ["AP-002", "IT", "Security", "Network Security Audit", "IT"].join(","),
            ["Operations", "Process", "Process Compliance", "Operations Review", "Operations"].join(","),
        ].join("\n");

        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = "audit_program_template.csv";
        link.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className="space-y-8">

            {/* Download Sample Excel Button */}
            <div className="flex justify-end">
                <button
                    onClick={downloadSampleExcel}
                    className="flex items-center px-5 py-2 bg-indigo-600 text-white rounded-md shadow hover:bg-indigo-700 transition duration-200"
                >
                    <FiDownload className="mr-2" size={18} /> Download Sample Excel
                </button>
            </div>

            {/* Audit Program Data Entry Section */}
            <div className="border rounded-lg shadow bg-white p-6">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-gray-700">
                        Audit Program Data
                    </h2>
                    <button
                        onClick={() => setShowAddForm(true)}
                        className="px-5 py-2 bg-green-600 text-white rounded-md shadow hover:bg-green-700 transition duration-200"
                    >
                        Add Program
                    </button>
                </div>

                {/* Inline Form for Adding a New Program */}
                {showAddForm && (
                    <div className="mb-6 p-4 border rounded-lg bg-gray-50">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {/* Program ID */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Program ID
                                </label>
                                <input
                                    type="text"
                                    name="programID"
                                    value={newProgram.programID}
                                    onChange={handleNewProgramChange}
                                    placeholder="Program ID"
                                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring focus:border-blue-500"
                                />
                            </div>

                            {/* Category */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Category
                                </label>
                                <input
                                    type="text"
                                    name="category"
                                    value={newProgram.category}
                                    onChange={handleNewProgramChange}
                                    placeholder="Category"
                                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring focus:border-blue-500"
                                />
                            </div>

                            {/* Area */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Area
                                </label>
                                <input
                                    type="text"
                                    name="area"
                                    value={newProgram.area}
                                    onChange={handleNewProgramChange}
                                    placeholder="Area"
                                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring focus:border-blue-500"
                                />
                            </div>

                            {/* Program Name */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Program Name
                                </label>
                                <input
                                    type="text"
                                    name="programName"
                                    value={newProgram.programName}
                                    onChange={handleNewProgramChange}
                                    placeholder="Program Name"
                                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring focus:border-blue-500"
                                />
                            </div>

                            {/* Applicable Dept */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700">
                                    Applicable Dept
                                </label>
                                <input
                                    type="text"
                                    name="applicableDept"
                                    value={newProgram.applicableDept}
                                    onChange={handleNewProgramChange}
                                    placeholder="Applicable Dept"
                                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring focus:border-blue-500"
                                />
                            </div>
                        </div>

                        {/* Form Buttons */}
                        <div className="mt-4 flex justify-end space-x-2">
                            <button
                                onClick={handleSaveNewProgram}
                                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md shadow hover:bg-blue-700 transition duration-200"
                            >
                                <FiCheck className="mr-1" size={18} /> Save
                            </button>
                            <button
                                onClick={() => setShowAddForm(false)}
                                className="flex items-center px-4 py-2 bg-gray-300 text-gray-700 rounded-md shadow hover:bg-gray-400 transition duration-200"
                            >
                                <FiX className="mr-1" size={18} /> Cancel
                            </button>
                        </div>
                    </div>
                )}

                {/* Main Table (Single Table with All Columns and Actions) */}
                <div className="overflow-x-auto rounded-xl">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-[#1e284e]">
                            <tr className="text-center">
                                {[
                                    "Program ID",
                                    "Category",
                                    "Area",
                                    "Program Name",
                                    "Applicable Dept",
                                    "Actions",
                                ].map((header) => (
                                    <th
                                        key={header}
                                        className="px-6 py-3 text-sm font-semibold text-white tracking-wider border-b border-blue-700"
                                    >
                                        {header}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-100">
                            {programs.length > 0 ? (
                                programs.map((prog, index) => (
                                    <tr key={index} className="text-center hover:bg-gray-50">
                                        {editingIndex === index ? (
                                            <>
                                                {/* Program ID */}
                                                <td className="px-6 py-3">
                                                    <input
                                                        type="text"
                                                        name="programID"
                                                        value={editedProgram.programID}
                                                        onChange={handleEditedProgramChange}
                                                        className="w-full border rounded-md px-2 py-1"
                                                    />
                                                </td>
                                                {/* Category */}
                                                <td className="px-6 py-3">
                                                    <input
                                                        type="text"
                                                        name="category"
                                                        value={editedProgram.category}
                                                        onChange={handleEditedProgramChange}
                                                        className="w-full border rounded-md px-2 py-1"
                                                    />
                                                </td>
                                                {/* Area */}
                                                <td className="px-6 py-3">
                                                    <input
                                                        type="text"
                                                        name="area"
                                                        value={editedProgram.area}
                                                        onChange={handleEditedProgramChange}
                                                        className="w-full border rounded-md px-2 py-1"
                                                    />
                                                </td>
                                                {/* Program Name */}
                                                <td className="px-6 py-3">
                                                    <input
                                                        type="text"
                                                        name="programName"
                                                        value={editedProgram.programName}
                                                        onChange={handleEditedProgramChange}
                                                        className="w-full border rounded-md px-2 py-1"
                                                    />
                                                </td>
                                                {/* Applicable Dept */}
                                                <td className="px-6 py-3">
                                                    <input
                                                        type="text"
                                                        name="applicableDept"
                                                        value={editedProgram.applicableDept}
                                                        onChange={handleEditedProgramChange}
                                                        className="w-full border rounded-md px-2 py-1"
                                                    />
                                                </td>
                                                {/* Actions */}
                                                <td className="px-6 py-3">
                                                    <div className="flex gap-2 justify-center">
                                                        <button
                                                            onClick={handleSaveEditedProgram}
                                                            className="flex items-center px-3 py-1 bg-blue-600 text-white rounded-md shadow hover:bg-blue-700 transition duration-200"
                                                        >
                                                            <FiCheck size={18} />
                                                        </button>
                                                        <button
                                                            onClick={handleCancelEditProgram}
                                                            className="flex items-center px-3 py-1 bg-gray-300 text-gray-700 rounded-md shadow hover:bg-gray-400 transition duration-200"
                                                        >
                                                            <FiX size={18} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </>
                                        ) : (
                                            <>
                                                {/* Program ID */}
                                                <td className="px-6 py-3">{prog.programID}</td>
                                                {/* Category */}
                                                <td className="px-6 py-3">{prog.category}</td>
                                                {/* Area */}
                                                <td className="px-6 py-3">{prog.area}</td>
                                                {/* Program Name */}
                                                <td className="px-6 py-3">{prog.programName}</td>
                                                {/* Applicable Dept */}
                                                <td className="px-6 py-3">{prog.applicableDept}</td>
                                                {/* Actions */}
                                                <td className="px-6 py-3">
                                                    <div className="flex gap-2 justify-center">
                                                        <button
                                                            onClick={() => handleEditClick(index)}
                                                            className="flex items-center px-3 py-1 bg-yellow-500 text-white rounded-md shadow hover:bg-yellow-600 transition duration-200"
                                                        >
                                                            <FiEdit size={18} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteProgram(index)}
                                                            className="flex items-center px-3 py-1 bg-red-600 text-white rounded-md shadow hover:bg-red-700 transition duration-200"
                                                        >
                                                            <FiTrash2 size={18} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </>
                                        )}
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td
                                        colSpan={7}
                                        className="px-6 py-3 text-sm text-gray-500 text-center"
                                    >
                                        No Records Found
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Import Programs Section */}
            <div className="border rounded-lg shadow bg-white p-6">
                <h2 className="text-xl font-bold text-gray-700 mb-4">Import Programs</h2>
                <div className="flex items-center space-x-4">
                    <input
                        type="file"
                        accept=".xlsx, .xls, .csv"
                        onChange={handleFileChange}
                        className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring focus:border-blue-500"
                    />
                    <button
                        onClick={handleImportPrograms}
                        className="px-5 py-2 bg-blue-600 text-white rounded-md shadow hover:bg-blue-700 transition duration-200"
                    >
                        Import
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProgramList;
