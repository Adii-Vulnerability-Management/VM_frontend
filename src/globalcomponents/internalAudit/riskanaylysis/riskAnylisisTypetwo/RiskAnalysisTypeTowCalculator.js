import React, { useEffect, useState } from "react";
import PriorityThresholds from "./PriorityThresholds";
import CustomAxios from "@/globalcomponents/CustomAxios";
import { baseurl, initURL } from "../../../../../BaseUrl";
import { useRouter } from "next/router";
import { toast } from "react-toastify";
import Loader from "@/globalcomponents/loader/Loader";

// Structured mapping for each Element, including recommended weight per element.
const elementData = {
    materiality: {
        label: "Materiality",
        recommendedWeight: 3,
        descriptions: [
            { label: "System accounts for <1% of the annual budget", score: 0 },
            { label: "System accounts for 5–10% of the annual budget", score: 2 },
            { label: "System accounts for 25–50% of the annual budget", score: 3 },
            { label: "System accounts for at least 75% of the annual budget", score: 5 },
        ],
    },
    control: {
        label: "Control Environment / Vulnerability",
        recommendedWeight: 2,
        descriptions: [
            { label: "Well-controlled system with little risk of fraud or error", score: 0 },
            { label: "Reasonably well-controlled with minor risk of fraud or error", score: 3 },
            { label: "System with a history of poor control and high risk of fraud or error", score: 5 },
        ],
    },
    sensitivity: {
        label: "Sensitivity",
        recommendedWeight: 2,
        descriptions: [
            { label: "Minimal external profile for the system", score: 0 },
            { label: "Some external profile or embarrassment if the system fails", score: 3 },
            { label: "Major public or legal issues if the system fails", score: 5 },
        ],
    },
    management: {
        label: "Management Concerns",
        recommendedWeight: 4,
        descriptions: [
            { label: "Low management profile, no great issues if the system fails", score: 0 },
            { label: "System with high profile or significant management concerns due to recent failures", score: 5 },
        ],
    },
};

// DEFAULT threshold values
const defaultThresholds = {
    veryHigh: 45, // Over this => Very High
    high: 40,     // From this up to veryHigh => High
    medium: 30,   // From this up to high => Medium
    // Below medium => Low
};

export default function RiskAnalysisTypeTwoCalculator() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const { programId } = router.query;
    const [divisions, setDivisions] = useState([]);

    // ---- RISK THRESHOLDS STATE ----
    const [thresholds, setThresholds] = useState({ ...defaultThresholds });

    // ---- FORM SELECTION STATE ----
    const [selectedElement, setSelectedElement] = useState("");
    const [selectedDescription, setSelectedDescription] = useState("");
    const [weight, setWeight] = useState("");

    // NEW: Audit Object selection cascade
    const [selectedDivision, setSelectedDivision] = useState("");
    const [selectedDepartment, setSelectedDepartment] = useState("");
    const [selectedBusinessArea, setSelectedBusinessArea] = useState("");
    const [selectedProcess, setSelectedProcess] = useState("");

    // List to hold each risk entry
    const [entries, setEntries] = useState([]);

    // ---- PRIORITY CALCULATION ----
    const getPriority = (riskIndex) => {
        if (riskIndex > thresholds.veryHigh) return "Extreme";
        if (riskIndex >= thresholds.high) return "High";
        if (riskIndex >= thresholds.medium) return "Moderate";
        return "Low";
    };

    // overall totals
    const calculateOverallRisk = (list) => {
        const total = list.reduce((sum, e) => sum + e.calculatedScore, 0);
        return { totalRisk: total, overallPriority: getPriority(total) };
    };

    // group by auditObject (the selected process)
    const calculateAuditObjectRisks = () => {
        const groups = entries.reduce((acc, e) => {
            if (!acc[e.auditObject?.name]) {
                acc[e.auditObject?.name] = {
                    totalRisk: 0,
                    division: e.division,
                    department: e.department,
                    businessArea: e.businessArea,  // Store full businessArea object
                    auditObject: e.auditObject,    // Store full auditObject
                };
            }
            acc[e.auditObject?.name].totalRisk += e.calculatedScore;
            return acc;
        }, {});

        return Object.entries(groups).map(([auditObjectName, data]) => ({
            division: data.division,
            department: data.department,
            businessArea: data.businessArea,  // Full businessArea object
            auditObject: data.auditObject,    // Full auditObject
            totalRisk: data.totalRisk,
            overallPriority: getPriority(data.totalRisk),
        }));
    };

    const handleAddEntry = () => {
        // Check if all the required fields are selected
        if (
            !selectedDivision ||
            !selectedDepartment ||
            !selectedBusinessArea ||
            !selectedProcess ||
            !selectedElement ||
            !selectedDescription ||
            !weight
        ) {
            toast.warn("Please complete all selections before adding an entry.");
            return;
        }

        // Find the selected element and description details
        const elem = elementData[selectedElement];
        const descObj = elem.descriptions.find((d) => d.label === selectedDescription);
        const score = descObj?.score ?? 0;  // Default to 0 if no score found
        const calc = score * Number(weight);  // Calculate the score with weight

        // Find the relevant full objects for division, department, business area, and process
        const selectedDivisionObj = divisions.find((div) => div.name === selectedDivision);
        const selectedDepartmentObj = selectedDivisionObj?.departments.find(
            (dept) => dept.departmentName === selectedDepartment
        );
        const selectedBusinessAreaObj = selectedDepartmentObj?.businessAreas.find(
            (ba) => ba.name === selectedBusinessArea
        );
        const selectedProcessObj = selectedBusinessAreaObj?.processAreas.find(
            (proc) => proc.name === selectedProcess
        );

        // Create the new entry and add it to the entries state
        const newEntry = {
            division: selectedDivisionObj,   // Store full division object
            department: selectedDepartmentObj, // Store full department object
            businessArea: selectedBusinessAreaObj, // Store full business area object
            auditObject: selectedProcessObj,   // Store full process (audit object) 
            element: elem.label,
            description: selectedDescription,
            score,
            weight: Number(weight),
            calculatedScore: calc,
        };

        // Update the entries list
        setEntries([...entries, newEntry]);

        // Reset form selections
        setSelectedDivision("");
        setSelectedDepartment("");
        setSelectedBusinessArea("");
        setSelectedProcess("");
        setSelectedElement("");
        setSelectedDescription("");
        setWeight("");
    };
    const deleteEntry = (idx) => setEntries(entries.filter((_, i) => i !== idx));

    const { totalRisk, overallPriority } = calculateOverallRisk(entries);
    const auditSummary = calculateAuditObjectRisks();

    const headers = [
        "Division",
        "Department",
        "Buisness Area",
        "Process ",
        "Element",
        "Description",
        "Risk Factor Score",
        "Weight",
        "Risk Index",
        "Priority",
        "Action",
    ];
    const summaryHeaders = [
        "Division",
        "Department",
        "Process ( Audit Object )",
        "Business Brief",
        "Risk Index",
        "Priority",
    ];

    const handleThresholdChange = (e) => {
        const { name, value } = e.target;
        setThresholds((prev) => ({
            ...prev,
            [name]: Number(value) || 0,
        }));
    };

    useEffect(() => {
        const fetchAll = async () => {
            setLoading(true);
            try {
                const [divRes, deptRes, baRes, procRes] = await Promise.all([
                    CustomAxios.get(`${baseurl}/${initURL}/ghub-division`),
                    CustomAxios.get(`${baseurl}/${initURL}/ghub-department`),
                    CustomAxios.get(`${baseurl}/${initURL}/ghub-business-area`),
                    CustomAxios.get(`${baseurl}/${initURL}/ghub-process`),
                ]);

                // Map data dynamically
                const formattedDivisions = divRes.data.map((division) => {
                    const divisionDepartments = deptRes.data.filter((dept) =>
                        division.departments.includes(dept._id)
                    );

                    const formattedDepartments = divisionDepartments.map((department) => {
                        const departmentBusinessAreas = baRes.data.filter((ba) =>
                            department.businessAreas.includes(ba._id)
                        );

                        const formattedBusinessAreas = departmentBusinessAreas.map((businessArea) => {
                            const businessAreaProcessAreas = businessArea.processAreas

                            return { ...businessArea, processAreas: businessAreaProcessAreas };
                        });

                        return { ...department, businessAreas: formattedBusinessAreas };
                    });

                    return { ...division, departments: formattedDepartments };
                });
                console.log("🚀 ~ formattedDivisions ~ formattedDivisions:", formattedDivisions)

                // Update state with fetched data
                setDivisions(formattedDivisions);

            } catch (error) {
                console.error("Error loading corporate details data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchAll();
    }, []);

    const handleSaveChanges = async () => {
        if (!programId) {
            toast.error("Missing programId");
            return;
        }
        if (auditSummary.length === 0) {
            toast.info("No audit‐summary data to save.");
            return;
        }

        const payload = auditSummary.map(row => ({
            unit: row.division._id,
            department: row.department._id,
            businessArea: row.businessArea._id,
            processArea: row.auditObject._id,
            auditTopic: row.auditObject.name,
            programID: programId,
            type: "Type 2",
            overallAssuranceRating: row.overallPriority,
            residualRisk: row.overallPriority,
        }));
        setLoading(true);
        try {
            await CustomAxios.post(
                `${baseurl}/${initURL}/audit-universe`,
                payload
            );
            toast.success("Data saved successfully!");
        } catch (err) {
            console.error("Save failed:", err);
            if (err.response?.status === 409 && err.response.data?.message) {
                toast.error(err.response.data.message);
            } else {
                toast.error('Failed to update audit dates.');
            }
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="h-[75vh] flex items-center justify-center">
                <Loader />
            </div>
        );
    }

    return (
        <div className="px-1">
            <PriorityThresholds
                thresholds={thresholds}
                onThresholdChange={handleThresholdChange}
            />

            {/* Risk Index Calculator */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                <h3 className="text-2xl font-semibold text-gray-700 mb-4">Risk Index Calculator</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-6">
                    {/* Division */}
                    <div className="flex flex-col">
                        <label className="text-sm font-medium mb-1">Division</label>
                        <select
                            value={selectedDivision}
                            onChange={(e) => {
                                setSelectedDivision(e.target.value);
                                setSelectedDepartment("");
                                setSelectedBusinessArea("");
                                setSelectedProcess("");
                            }}
                            className="border border-gray-300 rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                        >
                            <option value="">-- Select Division --</option>
                            {divisions.map((d) => (
                                <option key={d._id} value={d.name}>
                                    {d.name} ({d.status})
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Department */}
                    <div className="flex flex-col">
                        <label className="text-sm font-medium mb-1">Department</label>
                        <select
                            value={selectedDepartment}
                            onChange={(e) => {
                                setSelectedDepartment(e.target.value);
                                setSelectedBusinessArea("");
                                setSelectedProcess("");
                            }}
                            disabled={!selectedDivision}
                            className="border border-gray-300 rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                        >
                            <option value="">-- Select Department --</option>
                            {selectedDivision &&
                                divisions
                                    .find((div) => div.name === selectedDivision)
                                    .departments.map((dept) => (
                                        <option key={dept._id} value={dept.departmentName}>
                                            {dept?.departmentName} ({dept?.departmentStatus})
                                        </option>
                                    ))}
                        </select>
                    </div>

                    {/* Business Area */}
                    <div className="flex flex-col">
                        <label className="text-sm font-medium mb-1">Business Area</label>
                        <select
                            value={selectedBusinessArea}
                            onChange={(e) => {
                                setSelectedBusinessArea(e.target.value);
                                setSelectedProcess("");
                            }}
                            disabled={!selectedDepartment}
                            className="border border-gray-300 rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                        >
                            <option value="">-- Select Business Area --</option>
                            {selectedDepartment &&
                                divisions
                                    .find((div) => div.name === selectedDivision)
                                    .departments.find((dept) => dept.departmentName === selectedDepartment)
                                    .businessAreas.map((ba) => (
                                        <option key={ba._id} value={ba.name}>
                                            {ba.name} ({ba.status})
                                        </option>
                                    ))}
                        </select>
                    </div>

                    {/* Process / Audit Object */}
                    <div className="flex flex-col">
                        <label className="text-sm font-medium mb-1">Audit Object (Process)</label>
                        <select
                            value={selectedProcess}
                            onChange={(e) => setSelectedProcess(e.target.value)}
                            disabled={!selectedBusinessArea}
                            className="border border-gray-300 rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                        >
                            <option value="">-- Select Audit Object --</option>
                            {selectedBusinessArea &&
                                divisions
                                    .find((div) => div.name === selectedDivision)
                                    .departments.find((dept) => dept.departmentName === selectedDepartment)
                                    .businessAreas.find((ba) => ba.name === selectedBusinessArea)
                                    .processAreas.map((process) => (
                                        <option key={process._id} value={process.name}>
                                            {process.name} ({process.status})
                                        </option>
                                    ))}
                        </select>
                    </div>

                    {/* Element */}
                    <div className="flex flex-col">
                        <label className="text-sm font-medium mb-1">Select Element</label>
                        <select
                            value={selectedElement}
                            onChange={(e) => {
                                setSelectedElement(e.target.value);
                                setSelectedDescription("");
                                setWeight("");
                            }}
                            className="border border-gray-300 rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                        >
                            <option value="">-- Choose an Element --</option>
                            {Object.keys(elementData).map((key) => (
                                <option key={key} value={key}>
                                    {elementData[key].label}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Risk Factor */}
                    <div className="flex flex-col">
                        <label className="text-sm font-medium mb-1">Scoring Risk Factor</label>
                        <select
                            value={selectedDescription}
                            onChange={(e) => setSelectedDescription(e.target.value)}
                            disabled={!selectedElement}
                            className="border border-gray-300 rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                        >
                            <option value="">-- Choose a Scoring Risk Factor --</option>
                            {selectedElement &&
                                elementData[selectedElement].descriptions.map((d, i) => (
                                    <option key={i} value={d.label}>
                                        {d.label} ({d.score})
                                    </option>
                                ))}
                        </select>
                    </div>

                    {/* Weight */}
                    <div className="flex flex-col">
                        <label className="text-sm font-medium mb-1">Weight (1–5)</label>
                        <select
                            value={weight}
                            onChange={(e) => setWeight(e.target.value)}
                            disabled={!selectedElement || !selectedDescription}
                            className="border border-gray-300 rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                        >
                            <option value="">Select Weight</option>
                            {[1, 2, 3, 4, 5].map((v) => (
                                <option key={v} value={v}>
                                    {v}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="flex justify-end mt-4">
                    <button
                        onClick={handleAddEntry}
                        className="bg-[#2B245C] text-white py-2 px-4 rounded hover:bg-[#222146] focus:outline-none focus:ring-2 focus:ring-blue-400"
                    >
                        ➕ Add Entry
                    </button>
                </div>
            </div>

            {/* Detailed Entries */}

            <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
                <h3 className="text-2xl font-bold text-gray-800 mb-6">
                    Risk Prioritization
                </h3>
                <div className="overflow-x-auto rounded-xl">
                    <table className="min-w-full divide-y divide-gray-200 text-sm">
                        <thead className="bg-[#2B245C]">
                            <tr>
                                {headers?.map((h, i) => (
                                    <th
                                        key={i}
                                        className="px-6 py-3 text-center text-xs font-semibold text-white uppercase tracking-wider"
                                    >
                                        {h}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-100">
                            {entries?.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan={headers?.length}
                                        className="px-6 py-4 text-center text-lg text-gray-500 font-medium"
                                    >
                                        No data found
                                    </td>
                                </tr>
                            ) : (
                                entries?.map((item, idx) => (
                                    <tr key={idx} className="hover:bg-gray-50">
                                        {/* Accessing full division object */}
                                        <td className="px-6 py-3 text-center">{item?.division?.name}</td>
                                        {/* Accessing full department object */}
                                        <td className="px-6 py-3 text-center">{item?.department?.departmentName}</td>
                                        {/* Accessing full business area object */}
                                        <td className="px-6 py-3 text-center">{item?.businessArea?.name}</td>
                                        {/* Accessing full audit object (process) */}
                                        <td className="px-6 py-3 text-center">{item?.auditObject?.name}</td>
                                        <td className="px-6 py-3 text-center">{item?.element}</td>
                                        <td className="px-6 py-3 text-left">{item?.description}</td>
                                        <td className="px-6 py-3 text-center">{item?.score}</td>
                                        <td className="px-6 py-3 text-center">{item?.weight}</td>
                                        <td className="px-6 py-3 text-center font-semibold">
                                            {item?.calculatedScore}
                                        </td>
                                        <td className="px-6 py-3 text-center font-semibold">
                                            {getPriority(item?.calculatedScore)}
                                        </td>
                                        <td className="px-6 py-3 text-center">
                                            <button
                                                onClick={() => deleteEntry(idx)}
                                                className="bg-red-500 hover:bg-red-600 text-white py-1 px-3 rounded focus:outline-none focus:ring-2 focus:ring-red-400"
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                        {entries?.length > 0 && (
                            <tfoot className="bg-gray-50">
                                <tr>
                                    <td colSpan="8" className="px-6 py-4 text-center font-bold">
                                        Overall
                                    </td>
                                    <td className="px-6 py-4 text-center font-bold">{totalRisk}</td>
                                    <td className="px-6 py-4 text-center font-bold">
                                        {overallPriority}
                                    </td>
                                    <td className="px-6 py-4"></td>
                                </tr>
                            </tfoot>
                        )}
                    </table>
                </div>
            </div>

            {/* Audit Object Summary */}
            {/* <div className="bg-white rounded-lg shadow-lg p-6">
                <h3 className="text-2xl font-bold text-gray-800 mb-6">
                    Audit Object Risk Priority
                </h3>
                <div className="overflow-x-auto rounded-xl">
                    <table className="min-w-full divide-y divide-gray-200 text-sm">
                        <thead className="bg-[#2B245C]">
                            <tr>
                                {summaryHeaders.map((h, i) => (
                                    <th
                                        key={i}
                                        className="px-6 py-3 text-center text-xs font-semibold text-white uppercase tracking-wider"
                                    >
                                        {h}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {auditSummary.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan={summaryHeaders.length}
                                        className="px-6 py-4 text-center text-lg text-gray-500 font-medium"
                                    >
                                        No audit objects found
                                    </td>
                                </tr>
                            ) : (
                                auditSummary.map((row, idx) => (
                                    <tr key={idx} className="hover:bg-gray-50">
                                        <td className="px-6 py-3 text-center">{row.division}</td>
                                        <td className="px-6 py-3 text-center">{row.department}</td>
                                        <td className="px-6 py-3 text-center">{row.businessBrief}</td>
                                        <td className="px-6 py-3 text-center">{row.auditObject}</td>
                                        <td className="px-6 py-3 text-center font-semibold">
                                            {row.totalRisk}
                                        </td>
                                        <td className="px-6 py-3 text-center font-semibold">
                                            {row.overallPriority}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div> */}

            <div className="bg-white rounded-lg shadow-lg p-6">
                <h3 className="text-2xl font-bold text-gray-800 mb-6">
                    Audit Object Risk Priority
                </h3>
                <div className="overflow-x-auto rounded-xl">
                    <table className="min-w-full divide-y divide-gray-200 text-sm">
                        <thead className="bg-[#2B245C]">
                            <tr>
                                {summaryHeaders.map((h, i) => (
                                    <th
                                        key={i}
                                        className="px-6 py-3 text-center text-xs font-semibold text-white uppercase tracking-wider"
                                    >
                                        {h}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {auditSummary.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan={summaryHeaders.length}
                                        className="px-6 py-4 text-center text-lg text-gray-500 font-medium"
                                    >
                                        No audit objects found
                                    </td>
                                </tr>
                            ) : (
                                auditSummary.map((row, idx) => (
                                    <tr key={idx} className="hover:bg-gray-50">
                                        {/* Accessing full division object */}
                                        <td className="px-6 py-3 text-center">{row?.division?.name}</td>
                                        {/* Accessing full department object */}
                                        <td className="px-6 py-3 text-center">{row?.department?.departmentName}</td>
                                        {/* Accessing full business area object */}
                                        <td className="px-6 py-3 text-center">{row?.auditObject?.name}</td>
                                        <td className="px-6 py-3 text-center">{row?.businessArea?.name}</td>
                                        {/* Accessing full audit object (process) */}
                                        <td className="px-6 py-3 text-center font-semibold">
                                            {row?.totalRisk}
                                        </td>
                                        <td className="px-6 py-3 text-center font-semibold">
                                            {row?.overallPriority}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Save Changes Button */}
            <div className="flex justify-end mt-6">
                <button onClick={handleSaveChanges} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md shadow-md transition">
                    Save Changes
                </button>
            </div>
        </div>
    );
}
