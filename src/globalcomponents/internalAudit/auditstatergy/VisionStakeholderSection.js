// VisionStakeholderSection.js
import React from 'react';

export default function VisionStakeholderSection({ data, onChange }) {
    const {
        customers, employees, investors, suppliers, community,
        vision, mission
    } = data;

    const LIBRARIES = {
        customers: [
            "Reliable product quality",
            "Excellent customer service",
            "Competitive pricing",
            "Personalized experiences",
        ],
        employees: [
            "Fair wages and benefits",
            "Opportunities for growth",
            "Positive work environment",
            "Work-life balance",
        ],
        investors: ["High ROI", "Financial transparency", "Strategic decisions"],
        suppliers: ["Timely payments", "Clear communication", "Fair contract terms"],
        community: ["Environmental sustainability", "Positive local impact", "CSR initiatives"],
    };

    const addItem = (key, value) => {
        if (value && !data[key].includes(value)) {
            onChange(key, [...data[key], value]);
        }
    };

    const removeItem = (key, value) => {
        onChange(key, data[key].filter((i) => i !== value));
    };

    const renderBlock = (label, key) => (
        <div className="mb-6" key={key}>
            <div className="grid grid-cols-2 items-center gap-4">
                <label className="text-sm font-medium text-gray-700">{label}</label>
                <select
                    className="border border-gray-300 rounded-md px-2 py-1 w-full"
                    defaultValue=""
                    onChange={(e) => addItem(key, e.target.value)}
                >
                    <option value="" disabled>Select an option</option>
                    {LIBRARIES[key].map((item) => (
                        <option key={item} value={item}>{item}</option>
                    ))}
                </select>
            </div>
            <ul className="mt-2 space-y-1">
                {data[key].map((item) => (
                    <li
                        key={item}
                        className="flex justify-between items-center bg-gray-100 px-2 py-1 rounded"
                    >
                        <span className="text-sm text-gray-700">{item}</span>
                        <button
                            className="text-red-500 text-xs"
                            onClick={() => removeItem(key, item)}
                        >
                            Remove
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    );

    return (
        <div>
            <h3 className="text-xl font-bold mb-4">Understand Stakeholder Expectations</h3>
            {renderBlock("Customers", "customers")}
            {renderBlock("Employees", "employees")}
            {renderBlock("Investors", "investors")}
            {renderBlock("Suppliers", "suppliers")}
            {renderBlock("Community Members", "community")}

            <h3 className="text-xl font-bold my-2">Internal Audit Vision & Mission</h3>
            {["vision", "mission"].map((key) => (
                <div className="grid grid-cols-2 gap-4 mb-4" key={key}>
                    <label htmlFor={key} className="text-sm font-medium text-gray-700 self-center">
                        {key.charAt(0).toUpperCase() + key.slice(1)}
                    </label>
                    <textarea
                        id={key}
                        rows={3}
                        placeholder={`Enter your ${key}`}
                        className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                        value={data[key]}
                        onChange={(e) => onChange(key, e.target.value)}
                    />
                </div>
            ))}
        </div>
    );
}
