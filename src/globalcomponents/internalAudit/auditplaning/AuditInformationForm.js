// src/components/auditplaning/AuditInformationForm.jsx
import React, { useEffect } from "react";
import { useRouter } from "next/router";
import { FaBullseye, FaClipboardList, FaTools } from "react-icons/fa";
import CustomAxios from "@/globalcomponents/CustomAxios";
import { baseurl, initURL } from "../../../../BaseUrl";

export default function AuditInformationForm({ data, onChange }) {
    const router = useRouter();
    const { programId } = router.query;

    // Fetch program name and merge it into parent’s data
    useEffect(() => {
        if (!programId) return;
        CustomAxios
            .get(`${baseurl}/${initURL}/audit-charter/${programId}`)
            .then(({ data: charter }) => {
                onChange({ ...data, auditProgram: charter.auditProgramName || "" });
            })
            .catch(console.error);
    }, [programId]);

    // Generic change handler: build a new object merging in just the one key
    const handleChange = (key) => (e) => {
        onChange({ ...data, [key]: e.target.value });
    };

    const inputClass =
        "w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-600 transition";

    return (
        <div className="bg-white p-4 space-y-4">
            {/* General Info */}
            <section className="space-y-2">
                <header className="flex items-center space-x-2">
                    <FaClipboardList className="w-5 h-5 text-blue-600" />
                    <h2 className="text-xl font-semibold text-gray-800">General Info</h2>
                </header>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[
                        ["Period", "year", "2025-05"],
                        ["Audit ID", "auditID", "AUD-1234"],
                        ["Scope", "auditScope", "Scope…"],
                        ["Location", "location", "Location…"],
                        ["Criteria", "auditCriteria", "ISO…"],
                        ["Standard", "managementStandard", "ISO 9001"],
                    ].map(([label, key, placeholder]) => (
                        <div key={key} className="flex flex-col">
                            <label className="text-sm font-medium text-gray-700">{label}</label>
                            {key === "year" ? (
                                <input
                                    type="month"
                                    value={data.auditPeriod || ""}
                                    onChange={e => onChange({ ...data, auditPeriod: e.target.value })}
                                    className={inputClass}
                                />
                            ) : (
                                <input
                                    type="text"
                                    placeholder={placeholder}
                                    value={data[key] || ""}
                                    onChange={handleChange(key)}
                                    className={inputClass}
                                />
                            )}
                        </div>
                    ))}

                    {/* Program - always disabled */}
                    <div className="flex flex-col">
                        <label className="text-sm font-medium text-gray-700">Program</label>
                        <input
                            type="text"
                            value={data.auditProgram || ""}
                            disabled
                            className={`${inputClass} bg-gray-100 cursor-not-allowed`}
                        />
                    </div>
                </div>
            </section>

            {/* Tools & Plan */}
            <section className="space-y-4">
                <header className="flex items-center space-x-2">
                    <FaTools className="w-5 h-5 text-blue-600" />
                    <h2 className="text-xl font-semibold text-gray-800">Tools & Plan</h2>
                </header>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="text-sm font-medium text-gray-700">Remote Tools</label>
                        <input
                            type="text"
                            placeholder="Zoom, Teams…"
                            value={data.remoteTools || ""}
                            onChange={handleChange("remoteTools")}
                            className={inputClass}
                        />
                    </div>
                    <div>
                        <label className="text-sm font-medium text-gray-700">Review Plan</label>
                        <textarea
                            rows={3}
                            placeholder="Plan…"
                            value={data.reviewPlan || ""}
                            onChange={handleChange("reviewPlan")}
                            className={inputClass}
                        />
                    </div>
                </div>
            </section>

            {/* Objectives & Criteria */}
            <section className="space-y-4">
                <header className="flex items-center space-x-2">
                    <FaBullseye className="w-5 h-5 text-blue-600" />
                    <h2 className="text-xl font-semibold text-gray-800">Objectives & Criteria</h2>
                </header>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="text-sm font-medium text-gray-700">Objectives</label>
                        <textarea
                            rows={3}
                            placeholder="Objectives…"
                            value={data.auditObjectives || ""}
                            onChange={handleChange("auditObjectives")}
                            className={inputClass}
                        />
                    </div>
                    <div>
                        <label className="text-sm font-medium text-gray-700">Criteria Details</label>
                        <textarea
                            rows={3}
                            placeholder="Details…"
                            value={data.auditCriteriaDetails || ""}
                            onChange={handleChange("auditCriteriaDetails")}
                            className={inputClass}
                        />
                    </div>
                </div>
            </section>
        </div>
    );
}
