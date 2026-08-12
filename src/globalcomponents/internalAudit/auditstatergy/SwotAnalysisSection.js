import React from 'react';

export default function SwotAnalysisSection({ data, onChange }) {
    const {
        mode,
        manual: { strengths, weaknesses, opportunities, threats },
        selected
    } = data;

    const LIBRARIES = {
        strengths: [
            'Highly skilled internal audit team',
            'Strong management support',
            'Robust internal control framework'
        ],
        weaknesses: [
            'Lack of defined and repeatable Internal Audit methodology',
            'Limited communication with key stakeholders',
            'Outdated or incomplete data analytics'
        ],
        opportunities: [
            'Evaluate organization structure to better meet mgmt needs',
            'Develop consistent tools for data mining',
            'Collaboration among cross-functional areas'
        ],
        threats: [
            'Limited credibility of Internal Audit function',
            'Time-consuming risk assessment process',
            'Cancelled or delayed audit projects'
        ]
    };

    const handleModeChange = (e) => onChange('mode', e.target.value);

    const handleManualChange = (key) => (e) =>
        onChange(`manual.${key}`, e.target.value);

    const handleSelectAdd = (key) => (e) => {
        const val = e.target.value;
        if (!val) return;
        const updated = Array.from(new Set([...selected[key], val]));
        onChange(`selected.${key}`, updated);
    };

    const handleRemove = (key, item) => () => {
        onChange(
            `selected.${key}`,
            selected[key].filter((i) => i !== item)
        );
    };

    const renderCategory = (label, key) => (
        <div>
            <label className="block font-medium text-gray-600 mb-2">{label}</label>
            {mode === 'manual' ? (
                <textarea
                    rows={5}
                    className="w-full border border-gray-300 rounded-md px-4 py-2"
                    value={data.manual[key]}
                    onChange={handleManualChange(key)}
                />
            ) : (
                <>
                    <select
                        className="border border-gray-300 rounded-md px-2 py-1 mb-2 w-full"
                        value=""
                        onChange={handleSelectAdd(key)}
                    >
                        <option value="" disabled>
                            Select an option
                        </option>
                        {LIBRARIES[key].map((item) => (
                            <option key={item} value={item}>
                                {item}
                            </option>
                        ))}
                    </select>
                    <div className="flex flex-wrap gap-2">
                        {selected[key].map((item) => (
                            <div
                                key={item}
                                className="flex items-center bg-gray-100 px-2 py-1 rounded"
                            >
                                <span className="text-sm text-gray-700 mr-2">{item}</span>
                                <button
                                    className="text-red-500 text-xs"
                                    onClick={handleRemove(key, item)}
                                >
                                    Remove
                                </button>
                            </div>
                        ))}
                    </div>
                </>
            )}
        </div>
    );

    return (
        <div>
            <div className="mb-4">
                <h4 className="text-xl font-bold mb-2">
                    SWOT Analysis (Initial Assessment)
                </h4>
                <div className="flex gap-6">
                    <label className="flex items-center gap-2">
                        <input
                            type="radio"
                            name="swotMode"
                            value="manual"
                            checked={mode === 'manual'}
                            onChange={handleModeChange}
                        />
                        <span className="text-sm text-gray-700">Manual Input</span>
                    </label>
                    <label className="flex items-center gap-2">
                        <input
                            type="radio"
                            name="swotMode"
                            value="select"
                            checked={mode === 'select'}
                            onChange={handleModeChange}
                        />
                        <span className="text-sm text-gray-700">
                            Select from Library
                        </span>
                    </label>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
                {renderCategory('Strengths', 'strengths')}
                {renderCategory('Weaknesses', 'weaknesses')}
                {renderCategory('Opportunities', 'opportunities')}
                {renderCategory('Threats', 'threats')}
            </div>
        </div>
    );
}
