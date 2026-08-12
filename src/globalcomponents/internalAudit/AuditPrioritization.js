import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { baseurl, initURL } from "../../../BaseUrl";
import CustomAxios from "../CustomAxios";
import Loader from "../loader/Loader";

const SECTIONS = [
    { key: "businessContextPriorities", label: "Business Context" },
    { key: "swotAnalysisPriorities", label: "SWOT Analysis" },
    { key: "visionStakeholderPriorities", label: "Vision & Stakeholder" },
    { key: "initiativesRoadmapPriorities", label: "Initiatives & Roadmap" },
    { key: "documentStrategyPriorities", label: "Document Strategy" },
    { key: "assessmentSectionPriorities", label: "Audit Functions Ability" },
];
const PRIORITY_LEVELS = ['Low', 'Moderate', 'High', 'Extreme'];


const AuditPrioritization = () => {
    const [auditData, setAuditData] = useState([]);
    const [loading, setLoading] = useState(false);
    const router = useRouter()
    const { programId } = router.query

    const [priorityMap, setPriorityMap] = useState({});
    console.log("🚀 ~ AuditPrioritization ~ priorityMap:", priorityMap)

    useEffect(() => {
        setAuditData(ds =>
            ds.map(r => {
                if (r.mode === "auto" && r.strategyRating) {
                    return { ...r, finalPriority: calculateFinalPriority(r.riskPriority, r.strategyRating) };
                }
                return r;
            })
        );
    }, [auditData.map(r => r.riskPriority).join(), auditData.map(r => r.strategyRating).join(), auditData.map(r => r.mode).join()])

    useEffect(() => {
        if (!programId) return;
        setLoading(true);
        (async () => {
            try {
                // 1️⃣ fetch both APIs in parallel
                const [uniRes, stratRes] = await Promise.all([
                    CustomAxios.get(`${baseurl}/${initURL}/audit-universe/program/${programId}`),
                    CustomAxios.get(`${baseurl}/${initURL}/audit-strategy/program/${programId}`)
                ]);

                // 2️⃣ normalize universe rows, prefill saved fields if present
                const rows = uniRes.data.map((u) => {
                    const hasSaved = Boolean(u.finalPriority);  // did we save priorities before?
                    return {
                        id: u._id,
                        division: u.unit.name,
                        department: u.department.departmentName,
                        businessArea: u.businessArea.name,
                        process: u.processArea.name,
                        processId: u.processArea._id,
                        riskPriority: u.overallAssuranceRating,
                        lastAudit: u.processArea.lastAuditDate,
                        mode: hasSaved ? 'manual' : 'auto',
                        selectedCategory: u.area ?? '',
                        selectedArea: u.priorityArea ?? '',
                        strategyRating: u.strategyPriority ?? '',
                        finalPriority: u.finalPriority ?? '',
                        justification: u.justification ?? ''
                    };
                });

                // 3️⃣ build a lookup: universe‐ID → its priorities from strategy doc
                const pmap = {};
                stratRes.data.forEach((doc) => {
                    pmap[doc.auditTopic] = {
                        businessContextPriorities: doc.businessContextPriorities,
                        swotAnalysisPriorities: doc.swotAnalysisPriorities,
                        visionStakeholderPriorities: doc.visionStakeholderPriorities,
                        initiativesRoadmapPriorities: doc.initiativesRoadmapPriorities,
                        documentStrategyPriorities: doc.documentStrategyPriorities,
                        assessmentSectionPriorities: doc.assessmentSectionPriorities,
                    };
                });
                // 4️⃣ update state
                setPriorityMap(pmap);
                setAuditData(rows);
            } catch (err) {
                console.error(err);
                toast.error("Failed to load audit-universe or strategy data.");
            } finally {
                setLoading(false);
            }
        })();
    }, [programId]);

    // calculation rule
    const calculateFinalPriority = (risk, strategy) => {
        // treat “Moderate” like “Medium” in logic
        const isHigh = ['High', 'Extreme'];
        const isModerate = ['Moderate'];
        if (isHigh.includes(risk) || isHigh.includes(strategy)) return 'Extreme';
        if (isModerate.includes(risk) || isModerate.includes(strategy)) return 'High';
        return 'Low';
    };

    const handleModeChange = (rowId, mode) => {
        setAuditData(ds =>
            ds.map(r =>
                r.id === rowId
                    ? { ...r, mode, justification: mode === "auto" ? "" : r.justification }
                    : r
            )
        );
    };

    const handleManualPriorityChange = (rowId, value) => {
        setAuditData(ds =>
            ds.map(r => (r.id === rowId ? { ...r, finalPriority: value } : r))
        );
    };

    const handleJustificationChange = (rowId, text) => {
        setAuditData(ds =>
            ds.map(r => (r.id === rowId ? { ...r, justification: text } : r))
        );
    };

    const handleCategoryChange = (rowId, catKey) => {
        setAuditData(ds =>
            ds.map(r =>
                r.id === rowId
                    ? { ...r, selectedCategory: catKey, selectedArea: "", strategyRating: "" }
                    : r
            )
        );
    };

    const handleAreaChange = (rowId, area) => {
        setAuditData(ds =>
            ds.map(r => {
                if (r.id !== rowId) return r;
                const list = (priorityMap[r.processId]?.[r.selectedCategory] || []);
                const match = list.find(p => p.area === area);
                return {
                    ...r,
                    selectedArea: area,
                    strategyRating: match?.rating || ""
                };
            })
        );
    };

    const handleSave = async (row) => {
        if (!programId) {
            toast.error("Program ID is required");
            return;
        }

        const missingFields = [];

        if (!row.selectedCategory) missingFields.push("Area Type");
        if (!row.selectedArea) missingFields.push("Priority Area");
        if (!row.finalPriority) missingFields.push("Final Priority");

        // Justification is always required
        if (!row.justification || row.justification.trim() === "") {
            missingFields.push("Justification");
        }

        if (row.mode === "auto" && !row.strategyRating) {
            missingFields.push("Strategy Priority");
        }

        if (missingFields.length > 0) {
            toast.error(`Please complete: ${missingFields.join(", ")}`);
            return;
        }

        setLoading(true);

        try {
            // build the payload exactly matching your new AuditUniverse props
            const payload = {
                area: row.selectedCategory,
                priorityArea: row.selectedArea,
                strategyPriority: row.strategyRating,
                finalPriority: row.finalPriority,
                justification: row.justification,
            };

            await CustomAxios.patch(
                `${baseurl}/${initURL}/audit-universe/${row.id}`,
                payload
            );

            toast.success(`Saved prioritization for "${row.process}"`);
        } catch (err) {
            console.error(err);
            toast.error(`Failed to save "${row.process}"`);
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
        <div className="p-8 bg-gray-50 min-h-screen">
            <h1 className="text-3xl font-bold text-blue-800 mb-6">Audit Prioritization</h1>

            {/* Table */}
            <div className="bg-white shadow-lg rounded-lg overflow-auto">
                <table className="min-w-full table-auto text-sm text-center border-none divide-none">
                    <thead>
                        <tr className="bg-[#2B245C] text-white sticky top-0">
                            {[
                                "Division",
                                "Department",
                                "Business Area",
                                "Audit Topic",
                                "Universe Risk Priority",
                                "Last Audit",
                                "Area",
                                "Priority Area",
                                "Strategy Priority",
                                "Mode",
                                "Final Priority",
                                "Justification",
                                "Action"
                            ].map(col => (
                                <th
                                    key={col}
                                    className="px-3 py-3 uppercase tracking-wide"
                                >
                                    {col}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {auditData.map((r, idx) => (
                            <tr
                                key={r.id}
                                className={
                                    `transition-colors duration-150 
                 ${idx % 2 === 0 ? 'bg-gray-50' : 'bg-white'} 
                 hover:bg-gray-100`
                                }
                            >
                                <td className="px-4 py-2">{r.division}</td>
                                <td className="px-4 py-2">{r.department}</td>
                                <td className="px-4 py-2">{r.businessArea}</td>
                                <td className="px-4 py-2">{r.process}</td>
                                <td className="px-4 py-2">
                                    <span
                                        className={
                                            `inline-block px-3 py-1 rounded-full text-xs font-semibold 
                     ${getPriorityColor(r.riskPriority)}`
                                        }
                                    >
                                        {r.riskPriority}
                                    </span>
                                </td>
                                <td className="px-4 py-2">
                                    {r.lastAudit
                                        ? new Date(r.lastAudit).toLocaleDateString()
                                        : '—'}
                                </td>
                                <td className="px-4 py-2">
                                    <select
                                        className="w-full px-2 py-1 border rounded focus:ring-2 focus:ring-indigo-400"
                                        value={r.selectedCategory}
                                        onChange={e => handleCategoryChange(r.id, e.target.value)}
                                    >
                                        <option value="">Select type…</option>
                                        {SECTIONS.map(s => (
                                            <option key={s.key} value={s.key}>
                                                {s.label}
                                            </option>
                                        ))}
                                    </select>
                                </td>
                                <td className="px-4 py-2">
                                    <select
                                        className="w-full px-2 py-1 border rounded focus:ring-2 focus:ring-indigo-400"
                                        value={r.selectedArea}
                                        disabled={!r.selectedCategory}
                                        onChange={e => handleAreaChange(r.id, e.target.value)}
                                    >
                                        {console.log(priorityMap, 'priorityMap[r.process]?.[r.selectedCategory] ')}
                                        <option value="">Select area…</option>
                                        {(priorityMap[r.processId]?.[r.selectedCategory] || []).map(p => (
                                            <option key={p.area} value={p.area}>
                                                {p.area}
                                            </option>
                                        ))}

                                    </select>
                                </td>
                                <td className="px-4 py-2">
                                    {r.strategyRating ? (
                                        <span
                                            className={
                                                `inline-block px-3 py-1 rounded-full text-xs font-medium 
                       ${getPriorityColor(r.strategyRating)}`
                                            }
                                        >
                                            {r.strategyRating}
                                        </span>
                                    ) : (
                                        '—'
                                    )}
                                </td>
                                <td className="px-4 py-2">
                                    <select
                                        className="px-2 py-1 border rounded focus:ring-2 focus:ring-indigo-400"
                                        value={r.mode}
                                        disabled={!r.strategyRating}
                                        onChange={e => handleModeChange(r.id, e.target.value)}
                                    >
                                        <option value="auto">Auto</option>
                                        <option value="manual">Manual</option>
                                    </select>
                                </td>
                                <td className="px-4 py-2">
                                    {r.mode === 'manual' ? (
                                        <select
                                            className="px-2 py-1 border rounded focus:ring-2 focus:ring-indigo-400"
                                            value={r.finalPriority}
                                            onChange={e => handleManualPriorityChange(r.id, e.target.value)}
                                        >
                                            <option value="">Select</option>
                                            {PRIORITY_LEVELS.map(lvl => (
                                                <option key={lvl} value={lvl}>
                                                    {lvl}
                                                </option>
                                            ))}
                                        </select>
                                    ) : (
                                        <span
                                            className={
                                                `inline-block px-3 py-1 rounded-full text-xs font-semibold 
                       ${getPriorityColor(r.finalPriority)}`
                                            }
                                        >
                                            {r.finalPriority || '—'}
                                        </span>
                                    )}
                                </td>
                                <td className="px-4 py-2">
                                    <textarea
                                        className="w-full px-2 py-1 border rounded focus:ring-2 focus:ring-indigo-400 resize-none"
                                        rows={2}
                                        value={r.justification}
                                        onChange={e => handleJustificationChange(r.id, e.target.value)}
                                        placeholder="Provide justification"
                                    />
                                </td>
                                <td className="px-4 py-2">
                                    <button
                                        onClick={() => handleSave(r)}
                                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-1 rounded focus:ring-2 focus:ring-indigo-400 transition"
                                    >
                                        Save
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Explanation Section */}
            <div className="mt-10 bg-yellow-50 border border-yellow-200 p-6 rounded-lg">
                <h3 className="text-xl font-semibold text-yellow-800 mb-3">
                    Auto Mode Calculation Logic
                </h3>
                <p className="text-gray-700 mb-2">
                    The system determines the <strong>Final Audit Priority</strong> using the following rules:
                </p>
                <ul className="list-disc list-inside text-gray-700">
                    <li>
                        If <strong>Risk Priority</strong> OR <strong>Strategy Priority</strong> is{' '}
                        <span className="text-red-600 font-semibold">Extreme</span> ➔ Final Priority ={' '}
                        <span className="text-red-600 font-semibold">Extreme</span>
                    </li>
                    <li>
                        Else if either is <span className="text-yellow-600 font-semibold">High</span> ➔ Final Priority ={' '}
                        <span className="text-yellow-600 font-semibold">High</span>
                    </li>
                    <li>
                        Else if either is <span className="text-blue-600 font-semibold">Moderate</span> ➔ Final Priority ={' '}
                        <span className="text-blue-600 font-semibold">Moderate</span>
                    </li>
                    <li>
                        Else (both are <span className="text-green-600 font-semibold">Low</span>) ➔ Final Priority ={' '}
                        <span className="text-green-600 font-semibold">Low</span>
                    </li>
                </ul>
                <p className="mt-4 text-sm text-gray-600">
                    Use <strong>Manual Mode</strong> when specific business context or recent developments require deviation
                    from the automated calculation.
                </p>
            </div>

        </div>
    );
};

// Priority Color Helper
const getPriorityColor = (priority) => {
    switch (priority) {
        case 'Low': return 'bg-green-100 text-green-700';
        case 'Moderate': return 'bg-blue-100 text-blue-700';
        case 'High': return 'bg-yellow-100 text-yellow-700';
        case 'Extreme': return 'bg-red-100 text-red-700';
        default: return 'bg-gray-100 text-gray-600';
    }
};

export default AuditPrioritization;
