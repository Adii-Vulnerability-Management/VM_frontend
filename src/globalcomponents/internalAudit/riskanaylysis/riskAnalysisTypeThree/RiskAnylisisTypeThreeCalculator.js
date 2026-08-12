
import CustomAxios from "@/globalcomponents/CustomAxios";
import React, { useEffect, useState } from "react";
import { baseurl, initURL } from "../../../../../BaseUrl";
import { toast } from "react-toastify";
import { useRouter } from "next/router";
import Loader from "@/globalcomponents/loader/Loader";

// Risk Impact mappings
const riskImpacts = [
    {
        label: "Catastrophic",
        score: 5,
        description:
            "Complex, highly regulated environment with strict enforcement; consequences for noncompliance likely to cause legal liabilities and penalties that may result in partial or complete shutdown. Significant financial and reputational impacts.",
        regulatory:
            "Complex, highly regulated environment with strict enforcement; likely large legal liabilities and negative reputational impacts.",
        operational:
            "One or more business units or entire organization may be unable to operate. Noncompliance may lead to shutdown.",
        financial: "> $25 million",
    },
    {
        label: "Highly Significant",
        score: 4,
        description:
            "Complex regulatory environment; legal liabilities and penalties for noncompliance may receive public attention and have lasting impact financially and reputationally.",
        regulatory: "Multiple financial penalties and reputational damage may occur; legal notices probable.",
        operational:
            "Organization’s ability to operate or serve customers may be severely reduced. Impact on reputation.",
        financial: "$10–$25 million",
    },
    {
        label: "Significant",
        score: 3,
        description:
            "Laws and regulations are consistently enforced. Legal liabilities and penalties for noncompliance are material.",
        regulatory: "Lasting impacts and regulatory considerations. Enforcement actions are possible.",
        operational:
            "One or more business units may be affected; customers or key processes impacted.",
        financial: "$5–$10 million (material)",
    },
    {
        label: "Moderate",
        score: 2,
        description: "Active regulatory environment with small to moderate fines.",
        regulatory: "Active regulatory environment with small or moderate fines.",
        operational: "Operational effectiveness and efficiency are moderately damaged.",
        financial: "$1–$5 million",
    },
    {
        label: "Low",
        score: 1,
        description: "Regulatory environment is lax or penalty is minimal.",
        regulatory: "Regulatory environment is lax or penalty is minimal.",
        operational: "Operational processes are mostly uninterrupted. Some inefficiency.",
        financial: "< $1 million",
    },
];

// Likelihood mappings
const likelihoodRatings = [
    {
        label: "Very High",
        score: 5,
        description: "Likelihood of risk occurring is very high relatively.",
        criteria: "Operational processes are complex and controls are not effective.",
    },
    {
        label: "High",
        score: 4,
        description: "Likelihood of risk occurring is high relatively.",
        criteria:
            "Operational processes are complex, with some control weaknesses noted.",
    },
    {
        label: "Moderate",
        score: 3,
        description: "Likelihood of risk occurring is moderate relatively.",
        criteria:
            "Operational processes are moderately complex; minor control weaknesses exist.",
    },
    {
        label: "Low",
        score: 2,
        description: "Likelihood of risk occurring is low relatively.",
        criteria: "Operational processes are not complex; controls are effective.",
    },
    {
        label: "Very Low",
        score: 1,
        description: "Likelihood of risk occurring is very low relatively.",
        criteria: "Operational processes are not complex. Controls are highly effective.",
    },
];

export default function RiskAnalysis() {
    const router = useRouter();
    const { programId } = router.query;
    const [loading, setLoading] = useState(false);

    const [selectedUnit, setSelectedUnit] = useState(null);
    const [divisions, setDivisions] = useState([]);
    const [auditObjectData, setAuditObjectData] = useState([]);
    const [selectedDepartment, setSelectedDepartment] = useState(null);
    const [selectedBusinessArea, setSelectedBusinessArea] = useState(null);
    const [selectedProcess, setSelectedProcess] = useState(null);
    const [selectedImpact, setSelectedImpact] = useState("");
    const [selectedLikelihood, setSelectedLikelihood] = useState("");
    const [filteredData, setFilteredData] = useState([]); // Full data storage


    // Handle impact or likelihood change
    const handleRiskChange = (type, value) => {
        if (type === "impact") setSelectedImpact(value);
        if (type === "likelihood") setSelectedLikelihood(value);
    };

    // Add a new risk to the chosen Audit Object
    const addRisk = () => {
        const missingFields = [];

        if (!selectedUnit?.name) missingFields.push("Unit");
        if (!selectedDepartment?.departmentName) missingFields.push("Department");
        if (!selectedBusinessArea?.name) missingFields.push("Business Area");
        if (!selectedProcess?.name) missingFields.push("Process");
        if (!selectedImpact) missingFields.push("Impact");
        if (!selectedLikelihood) missingFields.push("Likelihood");

        if (missingFields.length > 0) {
            toast.error(`Please select: ${missingFields.join(", ")}`);
            return;
        }

        const newRisk = {
            impact: +selectedImpact,
            likelihood: +selectedLikelihood,
            score: +selectedImpact + +selectedLikelihood,
            division: selectedUnit,
            department: selectedDepartment,
            buisnessArea: selectedBusinessArea,
            process: selectedProcess,
        };

        setAuditObjectData((prev) =>
            prev.map((obj) =>
                obj.name === selectedProcess.name
                    ? { ...obj, risks: [...obj.risks, newRisk] }
                    : obj
            )
        );
        setSelectedImpact("");
        setSelectedLikelihood("");
    };


    // Calculate total score for an audit object
    const calculateTotalScore = (obj) =>
        obj.risks.reduce((sum, r) => sum + r.score, 0);

    // Filter only those with at least one risk
    const filtered = auditObjectData.filter((o) => o.risks.length > 0);

    // Determine table sizing
    const maxRisks = filtered.length
        ? Math.max(...filtered.map((o) => o.risks.length))
        : 0;
    const totalCols = 1 + maxRisks + 1 + 1; // name + risks + totalScore + level

    // Map total score to level
    const getLevel = (score) => {
        if (score >= 60) return "Extreme";
        if (score >= 46) return "High";
        if (score >= 33) return "Moderate";
        return "Low";
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

                // Format the data dynamically and store the full hierarchy in filteredData
                const formattedDivisions = divRes.data.map((division) => {
                    const divisionDepartments = deptRes.data.filter((dept) =>
                        division.departments.includes(dept._id)
                    );

                    const formattedDepartments = divisionDepartments.map((department) => {
                        const departmentBusinessAreas = baRes.data.filter((ba) =>
                            department.businessAreas.includes(ba._id)
                        );

                        const formattedBusinessAreas = departmentBusinessAreas.map((businessArea) => {
                            const businessAreaProcessAreas = businessArea.processAreas || [];

                            return {
                                ...businessArea,
                                processAreas: businessAreaProcessAreas,
                                auditObjectData: businessAreaProcessAreas.map(proc => ({
                                    name: proc.name,
                                    risks: [] // Initialize with empty risks
                                }))
                            };
                        });

                        return { ...department, businessAreas: formattedBusinessAreas };
                    });

                    return { ...division, departments: formattedDepartments };
                });

                // Store the full hierarchy data in filteredData
                setFilteredData(formattedDivisions);
                setDivisions(formattedDivisions);

                // Optionally, initialize auditObjectData with the first available data
                if (formattedDivisions.length > 0) {
                    const firstDivision = formattedDivisions[0];
                    const firstDept = firstDivision.departments[0];
                    const firstBA = firstDept.businessAreas[0];
                    setAuditObjectData(firstBA.auditObjectData || []);
                }

            } catch (error) {
                console.error("Error loading corporate details data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchAll();
    }, []);


    // inside RiskAnalysis component, above your return:

    const handleSaveChanges = async () => {
        if (filtered.length === 0) {
            toast.info('No risks to save.');
            return;
        }

        if (!programId) {
            toast.error('programId is Required.');
            return;
        }

        // One payload entry per process (filtered item)
        const payload = filtered.map(item => {
            // compute total score & priority for this process
            const totalScore = item.risks.reduce((sum, r) => sum + r.score, 0);
            const priority = getLevel(totalScore); // 'L','M','H' or 'E'

            // pull the corporate refs off the first risk
            const firstRisk = item.risks[0];
            return {
                unit: firstRisk.division._id,
                department: firstRisk.department._id,
                businessArea: firstRisk.buisnessArea._id,
                processArea: firstRisk.process._id,
                auditTopic: firstRisk.process._id,
                auditTopic: firstRisk.process.name,
                overallAssuranceRating: priority,
                residualRisk: priority,
                type: 'Type 3',
                programID: programId
            };
        });

        setLoading(true);

        try {
            await CustomAxios.post(
                `${baseurl}/${initURL}/audit-universe`,
                payload
            );
            toast.success('Data saved successfully!');
        } catch (err) {
            console.error('Error saving:', err);
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
        <div>
            {/* Form */}
            <div className="bg-white shadow-lg rounded-lg p-6 mb-6">
                <h1 className="text-3xl font-semibold text-gray-800 mb-4">
                    Risk Analysis
                </h1>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-4 mb-6">
                    {/* Unit */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Unit</label>
                        <select
                            className="mt-1 w-full p-2 border rounded-md"
                            value={selectedUnit ? selectedUnit.name : ""}
                            onChange={(e) => {
                                const unit = divisions.find((d) => d.name === e.target.value);
                                setSelectedUnit(unit);
                                setSelectedDepartment(null);
                                setSelectedBusinessArea(null);
                                setSelectedProcess(null);
                            }}
                        >
                            <option value="">Select Unit</option>
                            {divisions.map((d) => (
                                <option key={d._id} value={d.name}>
                                    {d.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Department */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Department</label>
                        <select
                            className="mt-1 w-full p-2 border rounded-md"
                            value={selectedDepartment ? selectedDepartment.departmentName : ""}
                            onChange={(e) => {
                                const department = selectedUnit.departments.find(
                                    (dept) => dept.departmentName === e.target.value
                                );
                                setSelectedDepartment(department);
                                setSelectedBusinessArea(null);
                                setSelectedProcess(null);
                            }}
                            disabled={!selectedUnit}
                        >
                            <option value="">Select Department</option>
                            {selectedUnit &&
                                selectedUnit.departments.map((dept) => (
                                    <option key={dept._id} value={dept.departmentName}>
                                        {dept.departmentName}
                                    </option>
                                ))}
                        </select>
                    </div>

                    {/* Business Area */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Business Area</label>
                        <select
                            className="mt-1 w-full p-2 border rounded-md"
                            value={selectedBusinessArea ? selectedBusinessArea.name : ""}
                            onChange={(e) => {
                                const businessArea = selectedDepartment.businessAreas.find(
                                    (ba) => ba.name === e.target.value
                                );
                                setSelectedBusinessArea(businessArea);
                                setSelectedProcess(null);
                            }}
                            disabled={!selectedDepartment}
                        >
                            <option value="">Select Business Area</option>
                            {selectedDepartment &&
                                selectedDepartment.businessAreas.map((ba) => (
                                    <option key={ba._id} value={ba.name}>
                                        {ba.name}
                                    </option>
                                ))}
                        </select>
                    </div>

                    {/* Process (Audit Object) */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Audit Object (Process)</label>
                        <select
                            className="mt-1 w-full p-2 border rounded-md"
                            value={selectedProcess ? selectedProcess.name : ""}
                            onChange={(e) => {
                                const process = selectedBusinessArea.processAreas.find(
                                    (p) => p.name === e.target.value
                                );
                                setSelectedProcess(process);
                            }}
                            disabled={!selectedBusinessArea}
                        >
                            <option value="">Select Process</option>
                            {selectedBusinessArea &&
                                selectedBusinessArea.processAreas.map((proc) => (
                                    <option key={proc._id} value={proc.name}>
                                        {proc.name}
                                    </option>
                                ))}
                        </select>
                    </div>

                    {/* Likelihood */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Likelihood
                        </label>
                        <select
                            className="mt-1 w-full p-2 border rounded-md"
                            value={selectedLikelihood}
                            onChange={(e) => handleRiskChange("likelihood", e.target.value)}
                        >
                            <option value="">Select Likelihood</option>
                            {likelihoodRatings.map(({ label, score }) => (
                                <option key={score} value={score}>
                                    {label} ({score})
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Impact */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Impact
                        </label>
                        <select
                            className="mt-1 w-full p-2 border rounded-md"
                            value={selectedImpact}
                            onChange={(e) => handleRiskChange("impact", e.target.value)}
                        >
                            <option value="">Select Impact</option>
                            {riskImpacts.map(({ label, score }) => (
                                <option key={score} value={score}>
                                    {label} ({score})
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Add Risk */}
                    <div className="col-span-1 sm:col-span-2 lg:col-span-1 flex items-end">
                        <button
                            onClick={() => addRisk()}
                            className="w-full px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                        >
                            Add Risk
                        </button>
                    </div>
                </div>

                {/* Likelihood Details */}
                {selectedLikelihood && (() => {
                    const info = likelihoodRatings.find(
                        (r) => r.score === +selectedLikelihood
                    );
                    return (
                        <div className="mt-4 p-4 bg-blue-50 border-l-4 border-blue-400 rounded-md">
                            <p className="font-semibold text-blue-800">
                                {info.label} (Score: {info.score})
                            </p>
                            <p className="mt-1 text-sm text-gray-800">{info.description}</p>
                            <p className="mt-2 italic text-gray-600">
                                <span className="font-medium">Criteria:</span> {info.criteria}
                            </p>
                        </div>
                    );
                })()}

                {/* Impact Details */}
                {selectedImpact && (() => {
                    const info = riskImpacts.find((i) => i.score === +selectedImpact);
                    return (
                        <div className="mt-4 p-4 bg-green-50 border-l-4 border-green-400 rounded-md">
                            <p className="font-semibold text-green-800">
                                {info.label} (Score: {info.score})
                            </p>
                            <p className="mt-1 text-sm text-gray-800">{info.description}</p>
                            <div className="mt-2 text-sm space-y-1">
                                <p>
                                    <span className="font-medium">Regulatory:</span> {info.regulatory}
                                </p>
                                <p>
                                    <span className="font-medium">Operational:</span> {info.operational}
                                </p>
                                <p>
                                    <span className="font-medium">Financial:</span> {info.financial}
                                </p>
                            </div>
                        </div>
                    );
                })()}
            </div>

            {/* Results Table */}
            <div className="bg-white shadow-lg p-6">
                <table className="min-w-full rounded-lg">
                    <thead className="bg-[#2B245C]">
                        <tr>
                            <th className="px-4 py-2  text-left text-sm font-medium text-white">
                                Audit Object
                            </th>
                            {Array.from({ length: maxRisks }).map((_, i) => (
                                <th
                                    key={i}
                                    className="px-4 py-2  text-left text-white text-sm font-medium "
                                >
                                    Risk {i + 1}
                                </th>
                            ))}
                            <th className="px-4 py-2  text-left text-white text-sm font-medium ">
                                Total Score
                            </th>
                            <th className="px-4 py-2  text-left text-white text-sm font-medium ">
                                Level
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.length === 0 ? (
                            <tr>
                                <td
                                    colSpan={totalCols}
                                    className="px-4 py-6 text-center text-gray-500"
                                >
                                    No data present
                                </td>
                            </tr>
                        ) : (
                            filtered.map((obj) => {
                                const totalScore = calculateTotalScore(obj);
                                return (
                                    <tr key={obj.name} className="border-b hover:bg-gray-50">
                                        <td className="px-4 py-2">{obj.name}</td>
                                        {obj.risks.map((risk, idx) => (
                                            <td key={idx} className="px-4 py-2 text-sm text-gray-600">
                                                {`Impact: ${risk.impact}, Likelihood: ${risk.likelihood}`}
                                            </td>
                                        ))}
                                        {Array.from({ length: maxRisks - obj.risks.length }).map(
                                            (_, idx) => (
                                                <td key={idx} className="px-4 py-2" />
                                            )
                                        )}
                                        <td className="px-4 py-2 text-sm font-semibold text-gray-600">
                                            {totalScore}
                                        </td>
                                        <td className="px-4 py-2 text-sm font-semibold text-gray-600">
                                            {getLevel(totalScore)}
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>

                {/* Rating Legend */}
                <div className="mt-6 pt-4 border-t border-gray-200 text-sm text-gray-700">
                    <div className="flex gap-4">
                        <div>
                            <span className="font-medium">Low (L)</span> = 0–32
                        </div>
                        <div>
                            <span className="font-medium">Moderate (M)</span> = 33–45
                        </div>
                        <div>
                            <span className="font-medium">High (H)</span> = 46–59
                        </div>
                        <div>
                            <span className="font-medium">Extreme (E)</span> = 60+
                        </div>
                    </div>
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
