// src/components/RiskAnalysisTypeOneCalculator.jsx
import CustomAxios from '@/globalcomponents/CustomAxios';
import React, { useState, useRef, useEffect } from 'react';
import { baseurl, initURL } from '../../../../../BaseUrl';
import { useRouter } from 'next/router';
import { toast } from 'react-toastify';
import Loader from '@/globalcomponents/loader/Loader';

function RiskAnalysisTypeOneCalculator() {
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const { programId } = router.query;
    const riskCategoryOptions = [
        'Financial',
        'Operational',
        'Compliance',
        'Strategic'
    ];;
    const overallAssuranceRatingOptions = ["Low", "Moderate", "High", "Extreme"];

    const dummyTeamMembers = [
        { name: 'Alice', email: 'alice@example.com' },
        { name: 'Bob', email: 'bob@example.com' },
        { name: 'Charlie', email: 'charlie@example.com' },
        { name: 'David', email: 'david@example.com' },
        { name: 'Eva', email: 'eva@example.com' }
    ];

    const initialFormState = {
        division: null,
        department: null,
        businessArea: null,
        processArea: null,
        auditRef: "",
        auditTopic: "",
        auditType: "",
        riskRef: "",
        riskCategory: "",
        riskDescription: "",
        residualRisk: "",
        overallAssuranceRating: "",
        lastAudit: "",
        objective: "",
        scope: "",
        budget: "",
        days: "",
        reportOutcome: "",
        auditTeam: [],
        keyContracts: ""
    };
    const auditTypeOptions = [
        'Internal',
        'External',
        'SOX',
        'Regulatory',
        'Operational',
        'IT',
        'Forensic',
        'Performance',
        'Financial',
        'Environmental'
    ];

    const [formData, setFormData] = useState(initialFormState);
    const [entries, setEntries] = useState([]);
    const [auditTeamSearch, setAuditTeamSearch] = useState("");
    const auditTeamRef = useRef(null);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [divisions, setDivisions] = useState([]);

    // Handle regular input/select changes, with reset logic
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => {
            const updated = { ...prev, [name]: value };

            // reset dependent selects
            if (name === 'unit') {
                updated.department = '';
                updated.businessArea = '';
            }
            if (name === 'department') {
                updated.businessArea = '';
            }

            // auto-populate auditTopic from processArea
            if (name === 'processArea') {
                updated.auditTopic = value;
            }

            return updated;
        });
    };

    const handleAuditTeamInputChange = (e) => {
        setAuditTeamSearch(e.target.value);
        setShowSuggestions(true);
    };
    const handleAddTeamMember = member => {
        if (!formData.auditTeam.find(m => m.name === member.name)) {
            setFormData(prev => ({ ...prev, auditTeam: [...prev.auditTeam, member] }));
        }
        setAuditTeamSearch('');
        setShowSuggestions(false);
    };
    const handleRemoveTeamMember = member => {
        setFormData(prev => ({ ...prev, auditTeam: prev.auditTeam.filter(m => m.name !== member.name) }));
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

                console.log("🚀 ~ formattedDivisions ~ formattedDepartments:", formattedDivisions)
                setDivisions(formattedDivisions);
            } catch (error) {
                console.error("Error loading corporate details data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchAll();
    }, []);


    const handleSave = () => {
        // List of required fields to validate
        const requiredFields = [
            'auditRef',
            'auditTopic',
            'auditType',
            'riskRef',
            'riskCategory',
            'riskDescription',
            'residualRisk',
            'overallAssuranceRating',
        ];

        const missingFields = [];

        // Validate nested fields
        if (!formData.division?._id) missingFields.push("Division");
        if (!formData.department?._id) missingFields.push("Department");
        if (!formData.businessArea?._id) missingFields.push("Business Area");
        if (!formData.processArea?._id) missingFields.push("Process Area");

        // Validate direct fields
        requiredFields.forEach(field => {
            if (!formData[field] || formData[field].trim() === "") {
                const label = fields.find(f => f.name === field)?.label || field;
                missingFields.push(label);
            }
        });

        if (missingFields.length > 0) {
            toast.error(`Please fill in: ${missingFields.join(", ")}`);
            return;
        }

        setEntries(prev => [...prev, formData]); ``
        setFormData(initialFormState);
        setAuditTeamSearch("");
    };

    const handleSaveChanges = async () => {
        if (!programId) {
            toast.error("Missing programId");
            return;
        }
        if (entries.length === 0) {
            toast.info("No entries to save");
            return;
        }

        const payload = entries.map(e => ({
            programID: programId,
            type: "Type 1",
            unit: e.division._id,
            department: e.department._id,
            businessArea: e.businessArea._id,
            processArea: e.processArea._id,
            auditRef: e.auditRef,
            auditTopic: e.auditTopic,
            auditType: e.auditType,
            riskRef: e.riskRef,
            riskCategory: e.riskCategory,
            riskDescription: e.riskDescription,
            residualRisk: e.residualRisk,
            overallAssuranceRating: e.overallAssuranceRating,
        }));
        setLoading(true);
        try {
            await CustomAxios.post(
                `${baseurl}/${initURL}/audit-universe`,
                payload
            );
            toast.success("Saved successfully!");
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

    const renderAuditTeamField = () => {
        const suggestions = dummyTeamMembers.filter(
            m => m.name.toLowerCase().includes(auditTeamSearch.toLowerCase()) &&
                !formData.auditTeam.some(sel => sel.name === m.name)
        );
        return (
            <div className="relative" ref={auditTeamRef}>
                <div className="flex flex-wrap gap-2 mb-1">
                    {formData.auditTeam.map((m, i) => (
                        <span key={i} className="flex items-center bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-sm">
                            {m.name} ({m.email})
                            <button type="button" className="ml-1" onClick={() => handleRemoveTeamMember(m)}>✕</button>
                        </span>
                    ))}
                </div>
                <input
                    type="text"
                    value={auditTeamSearch}
                    onChange={handleAuditTeamInputChange}
                    onFocus={() => setShowSuggestions(true)}
                    placeholder="Type to search team members..."
                    className="w-full border border-gray-300 rounded-md px-4 py-2"
                />
                {showSuggestions && suggestions.length > 0 && (
                    <ul className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md max-h-40 overflow-auto">
                        {suggestions.map((m, i) => (
                            <li key={i} className="px-4 py-2 hover:bg-blue-100 cursor-pointer" onClick={() => handleAddTeamMember(m)}>
                                {m.name} – {m.email}
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        );
    };

    const fields = [
        { label: 'Audit Ref', name: 'auditRef', type: 'text' },
        { label: 'Audit Topic', name: 'auditTopic', type: 'text', disabled: true },
        {
            label: 'Audit Type',
            name: 'auditType',
            type: 'select',
            options: auditTypeOptions
        },
        { label: 'Risk Ref', name: 'riskRef', type: 'text' },
        { label: 'Risk Category', name: 'riskCategory', type: 'select', options: riskCategoryOptions },
        { label: 'Risk Description', name: 'riskDescription', type: 'text' },
        { label: 'Risk', name: 'residualRisk', type: 'select', options: overallAssuranceRatingOptions },
        { label: 'Overall Assurance Rating', name: 'overallAssuranceRating', type: 'select', options: overallAssuranceRatingOptions },
    ];

    const renderField = field => {
        if (field.type === 'select') {
            return (
                <select
                    name={field.name}
                    // value={formData[field.name]}
                    onChange={handleInputChange}
                    disabled={field.disabled}
                    className="w-full border border-gray-300 rounded-md px-4 py-2"
                >
                    <option value="">-- Select {field.label} --</option>
                    {field.options.map((opt, i) => (
                        <option key={i} value={opt}>{opt}</option>
                    ))}
                </select>
            );
        }
        if (field.type === 'custom' && field.name === 'auditTeam') {
            return renderAuditTeamField();
        }
        return (
            <input
                type="text"
                name={field.name}
                disabled={field.disabled}
                value={formData[field.name]}
                onChange={handleInputChange}
                placeholder={`Enter ${field.label}`}
                className="w-full border border-gray-300 rounded-md px-4 py-2"
            />
        );
    };

    // Determine column bg colors
    const getColumnBgColor = (index) => {
        if (index < 4) return '#4d93d9';
        else if (index < 9) return '#153d64';
        else return '#0b3040';
    };
    const handleHierarchyChange = (level, obj) => {
        setFormData(fd => {
            const updated = { ...fd, [level]: obj };

            // reset downstream
            if (level === 'division') {
                updated.department = null;
                updated.businessArea = null;
                updated.processArea = null;
            }
            if (level === 'department') {
                updated.businessArea = null;
                updated.processArea = null;
            }
            if (level === 'businessArea') {
                updated.processArea = null;
            }

            return updated;
        });
    };

    const divisionOpts = divisions;
    const departmentOpts = formData.division?.departments || [];
    const businessAreaOpts =
        formData.department?.businessAreas || [];
    const processAreaOpts =
        formData.businessArea?.processAreas || [];

    if (loading) {
        return (
            <div className="h-[75vh] flex items-center justify-center">
                <Loader />
            </div>
        );
    }
    return (
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <div className="mb-4">
                <p className={`text-sm ${programId ? 'text-gray-600' : 'text-red-600'}`}>
                    {programId
                        ? `Program ID: ${programId}`
                        : 'Program ID is missing. Please select a program from the Program Overview tab before saving.'}
                </p>
            </div>
            <div className="grid grid-cols-4 gap-4">
                <div>
                    <label>Division</label>
                    <select
                        value={formData.division?._id || ""}
                        onChange={e => {
                            const div = divisions.find(d => d._id === e.target.value);
                            handleHierarchyChange('division', div);
                        }}
                        className="w-full border rounded px-2 py-1"
                    >
                        <option value="">-- Select Division --</option>
                        {divisionOpts.map(d => (
                            <option key={d._id} value={d._id}>{d.name}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label>Department</label>
                    <select
                        value={formData.department?._id || ""}
                        onChange={e => {
                            const dep = departmentOpts.find(d => d._id === e.target.value);
                            handleHierarchyChange('department', dep);
                        }}
                        disabled={!formData.division}
                        className="w-full border rounded px-2 py-1"
                    >
                        <option value="">-- Select Department --</option>
                        {departmentOpts.map(d => (
                            <option key={d._id} value={d._id}>{d.departmentName}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label>Business Area</label>
                    <select
                        value={formData.businessArea?._id || ""}
                        onChange={e => {
                            const ba = businessAreaOpts.find(b => b._id === e.target.value);
                            handleHierarchyChange('businessArea', ba);
                        }}
                        disabled={!formData.department}
                        className="w-full border rounded px-2 py-1"
                    >
                        <option value="">-- Select Business Area --</option>
                        {businessAreaOpts.map(b => (
                            <option key={b._id} value={b._id}>{b.name}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label>Process Area</label>
                    <select
                        value={formData.processArea?._id || ""}
                        onChange={e => {
                            const p = processAreaOpts.find(p => p._id === e.target.value);
                            handleHierarchyChange('processArea', p);
                            setFormData(fd => ({ ...fd, auditTopic: p.name }));
                        }}
                        disabled={!formData.businessArea}
                        className="w-full border rounded px-2 py-1"
                    >
                        <option value="">-- Select Process --</option>
                        {processAreaOpts.map(p => (
                            <option key={p._id} value={p._id}>{p.name}</option>
                        ))}
                    </select>
                </div>
                {fields.map(f => (
                    <div key={f.name} className={f.name === 'auditTeam' ? 'col-span-2' : ''}>
                        <label className="block font-medium text-gray-600 mb-1">{f.label}:</label>
                        {renderField(f)}
                    </div>
                ))}
            </div>
            <div className="mt-4 flex justify-end">
                <button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md">Add</button>
            </div>
            {/* …inside your render… */}
            <div className="mt-6 overflow-x-auto rounded-lg">
                <table className="min-w-full border border-gray-300 text-sm text-center rounded-lg">
                    <thead>
                        <tr>
                            {/* ← manually add these four */}
                            <th className="border border-gray-300 p-2">Division</th>
                            <th className="border border-gray-300 p-2">Department</th>
                            <th className="border border-gray-300 p-2">Business Area</th>
                            <th className="border border-gray-300 p-2">Process Area</th>

                            {/* ← then your other field headers */}
                            {fields.map((f, i) => (
                                <th
                                    key={f.name}
                                    className="border border-gray-300 p-2 text-white"
                                    style={{ backgroundColor: getColumnBgColor(i) }}
                                >
                                    {f.label}
                                </th>
                            ))}
                        </tr>
                    </thead>

                    <tbody>
                        {entries.length > 0 ? (
                            entries.map((entry, idx) => (
                                <tr key={idx}>
                                    {/* ← manually render your four hierarchy columns */}
                                    <td className="border border-gray-300 p-2">
                                        {entry.division?.name || '-'}
                                    </td>
                                    <td className="border border-gray-300 p-2">
                                        {entry.department?.departmentName || '-'}
                                    </td>
                                    <td className="border border-gray-300 p-2">
                                        {entry.businessArea?.name || '-'}
                                    </td>
                                    <td className="border border-gray-300 p-2">
                                        {entry.processArea?.name || '-'}
                                    </td>

                                    {/* ← then render your other fields */}
                                    {fields.map(f => (
                                        <td key={f.name} className="border border-gray-300 p-2">
                                            {f.name === 'auditTeam'
                                                ? (entry.auditTeam.length
                                                    ? entry.auditTeam.map(m => `${m.name} (${m.email})`).join(', ')
                                                    : '-')
                                                : entry[f.name] || '-'}
                                        </td>
                                    ))}
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td
                                    colSpan={4 + fields.length}
                                    className="border border-gray-300 p-2"
                                >
                                    No Data Found
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Save Changes Button */}
            <div className="flex justify-end mt-6">
                <button onClick={handleSaveChanges} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md shadow-md transition">
                    Save Changes
                </button>
            </div>
        </div >
    );
}

export default RiskAnalysisTypeOneCalculator;
