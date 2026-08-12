// src/components/auditstatergy/DocumentStrategySection.jsx
import React from "react";
import {
    AiOutlineAudit,
    AiOutlineCheck,
    AiOutlineCheckCircle,
    AiOutlineClose,
    AiOutlineDelete,
    AiOutlineEdit,
    AiOutlinePlus,
    AiOutlineSafety,
} from "react-icons/ai";

// Editable subsection component
function EditableSection({ icon: Icon, title, data, onChange }) {
    // safe defaults if data or its props are undefined
    const {
        points = [],
        newPoint = "",
        editingIndex = null,
        editingValue = ""
    } = data || {};
    const update = (upd) => onChange({ ...data, ...upd });

    const addPoint = () => {
        const trimmed = newPoint.trim();
        if (!trimmed) return;
        update({
            points: [...points, trimmed],
            newPoint: ""
        });
    };

    const deletePoint = (i) => {
        const next = points.filter((_, idx) => idx !== i);
        update({
            points: next,
            ...(editingIndex === i
                ? { editingIndex: null, editingValue: "" }
                : {})
        });
    };

    const startEditing = (i) => update({ editingIndex: i, editingValue: points[i] });
    const saveEdit = (i) => {
        const tv = editingValue.trim();
        if (!tv) return;
        const next = [...points];
        next[i] = tv;
        update({ points: next, editingIndex: null, editingValue: "" });
    };

    return (
        <div className="mb-6">
            <h3 className="text-lg font-semibold flex items-center text-blue-600 mb-4">
                {Icon && <Icon className="mr-2" />} {title}
            </h3>
            <ul className="list-disc pl-8 text-gray-700 space-y-2">
                {points.map((p, idx) => (
                    <li key={idx}>
                        <div className="flex items-center justify-between">
                            {editingIndex === idx ? (
                                <input
                                    value={editingValue}
                                    onChange={e => update({ editingValue: e.target.value })}
                                    className="flex-1 border rounded px-2 py-1 focus:ring-2 focus:ring-blue-400"
                                />
                            ) : (
                                <span>{p}</span>
                            )}
                            <div className="flex items-center gap-2">
                                {editingIndex === idx ? (
                                    <>
                                        <AiOutlineCheck
                                            onClick={() => saveEdit(idx)}
                                            className="text-green-500 cursor-pointer"
                                        />
                                        <AiOutlineClose
                                            onClick={() => update({ editingIndex: null, editingValue: "" })}
                                            className="text-gray-500 cursor-pointer"
                                        />
                                    </>
                                ) : (
                                    <>
                                        <AiOutlineEdit
                                            onClick={() => startEditing(idx)}
                                            className="text-blue-500 cursor-pointer"
                                        />
                                        <AiOutlineDelete
                                            onClick={() => deletePoint(idx)}
                                            className="text-red-500 cursor-pointer"
                                        />
                                    </>
                                )}
                            </div>
                        </div>
                    </li>
                ))}
            </ul>

            <div className="mt-4 flex gap-2">
                <input
                    value={newPoint}
                    onChange={e => update({ newPoint: e.target.value })}
                    placeholder={`Add a new point to "${title}"`}
                    className="flex-1 border rounded px-2 py-1 focus:ring-2 focus:ring-blue-400"
                />
                <button onClick={addPoint} className="bg-blue-600 text-white px-3 py-1 rounded">
                    <AiOutlinePlus />
                </button>
            </div>
        </div>
    );
}

// Main section component
export default function DocumentStrategySection({ data = {}, onChange }) {
    // Define your groupings with headings, optional descriptions, then their subsections
    const groups = [
        {
            heading: "Objectives of Internal Audit",
            description:
                "The main objectives of the internal audit function include:",
            items: [
                { key: "riskManagement", icon: AiOutlineSafety, title: "Risk Management" },
                { key: "controlEffectiveness", icon: AiOutlineCheckCircle, title: "Control Effectiveness" },
                { key: "compliance", icon: AiOutlineAudit, title: "Compliance" },
                { key: "operationalEfficiency", icon: AiOutlineSafety, title: "Operational Efficiency" },
                { key: "governance", icon: AiOutlineAudit, title: "Governance" },
            ]
        },
        {
            heading: "Scope of the Internal Audit Function",
            description:
                "The scope of the internal audit activities includes:",
            items: [
                { key: "financialAudits", icon: AiOutlineAudit, title: "Financial Audits" },
                { key: "operationalAudits", icon: AiOutlineAudit, title: "Operational Audits" },
                { key: "complianceAudits", icon: AiOutlineAudit, title: "Compliance Audits" },
                { key: "itAudits", icon: AiOutlineAudit, title: "IT Audits" },
                { key: "riskBasedAudits", icon: AiOutlineAudit, title: "Risk-Based Audits" },
                { key: "followUpAudits", icon: AiOutlineAudit, title: "Follow-Up Audits" },
            ]
        },
        {
            heading: "Audit Approach",
            description:
                "The internal audit approach will be based on a risk-based methodology, focusing on areas of highest risk.",
            items: [
                { key: "riskAssessment", icon: AiOutlineAudit, title: "Risk Assessment" },
                { key: "auditPlanning", icon: AiOutlineAudit, title: "Audit Planning" },
                { key: "auditExecution", icon: AiOutlineAudit, title: "Audit Execution" },
                { key: "reporting", icon: AiOutlineAudit, title: "Reporting" },
                { key: "followUpAndMonitoring", icon: AiOutlineAudit, title: "Follow-Up and Monitoring" },
            ]
        },
        {
            heading: "Key Stakeholders and Communication",
            description:
                "The internal audit function will communicate with a wide range of stakeholders, including:",
            items: [
                { key: "boardOfDirectors", icon: AiOutlineAudit, title: "Board of Directors (Audit Committee)" },
                { key: "seniorManagement", icon: AiOutlineAudit, title: "Senior Management" },
                { key: "externalAuditors", icon: AiOutlineAudit, title: "External Auditors" },
                { key: "riskManagementCommittee", icon: AiOutlineAudit, title: "Risk Management Committee" },
            ]
        },
        {
            heading: "Resource Requirements",
            description:
                "The internal audit function will require adequate resources in terms of personnel, tools, and technologies.",
            items: [
                { key: "trainingAndDevelopment", icon: AiOutlineAudit, title: "Training and Development" },
                { key: "technologyTools", icon: AiOutlineAudit, title: "Technology Tools" },
            ]
        },
        {
            heading: "Performance Evaluation and Continuous Improvement",
            description:
                "Key performance indicators (KPIs) for evaluating internal audit effectiveness will include:",
            items: [
                { key: "completionOfAuditPlan", icon: AiOutlineAudit, title: "Completion of Audit Plan" },
                { key: "timelinessOfReporting", icon: AiOutlineAudit, title: "Timeliness of Reporting" },
                { key: "implementationOfRecommendations", icon: AiOutlineAudit, title: "Implementation of Recommendations" },
                { key: "stakeholderSatisfaction", icon: AiOutlineAudit, title: "Stakeholder Satisfaction" },
            ]
        }
    ];

    return (
        <div>
            {groups.map(({ heading, description, items }) => (
                <section key={heading} className="mb-10">
                    <h2 className="font-bold text-2xl text-blue-800">{heading}</h2>
                    {description && <p className="text-gray-700 mt-2 mb-6">{description}</p>}

                    {items.map(({ key, icon, title }) => (
                        <EditableSection
                            key={key}
                            icon={icon}
                            title={title}
                            data={data[key]}
                            onChange={(upd) => onChange({ ...data, [key]: upd })}
                        />
                    ))}
                </section>
            ))}
        </div>
    );
}
