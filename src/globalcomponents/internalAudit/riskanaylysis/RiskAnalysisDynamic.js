// src/components/RiskAnalysisDynamic.js
import React, { useState } from 'react';

const inherentOptions = ['Low', 'Moderate', 'High'];
const controlOptions = ['Adequate', 'Need improvement', 'Inadequate'];

// Decision matrix function for calculating residual risk:
function getResidualRisk(inherent, control) {
    // Define our decision matrix:
    const matrix = {
        Low: {
            Adequate: 'Low',
            'Need improvement': 'Low',
            Inadequate: 'Moderate',
        },
        Moderate: {
            Adequate: 'Low',
            'Need improvement': 'Moderate',
            Inadequate: 'High',
        },
        High: {
            Adequate: 'Moderate',
            'Need improvement': 'Moderate', // adjusted per your sample table
            Inadequate: 'High',
        },
    };

    return matrix[inherent][control] || 'N/A';
}

export default function RiskAnalysisDynamic() {
    // Create state for a list of 5 auditable units; each unit holds an inherent risk and control effectiveness.
    const initialUnits = [
        { id: 1, inherent: '', control: '' },
        { id: 2, inherent: '', control: '' },
        { id: 3, inherent: '', control: '' },
        { id: 4, inherent: '', control: '' },
        { id: 5, inherent: '', control: '' },
    ];
    const [units, setUnits] = useState(initialUnits);
    // Flag to determine if results (Step 5) should be shown
    const [showResults, setShowResults] = useState(false);

    // Handler updates the state for a specific auditable unit
    const updateUnit = (id, field, value) => {
        const updatedUnits = units.map((unit) =>
            unit.id === id ? { ...unit, [field]: value } : unit
        );
        setUnits(updatedUnits);
    };

    // Handle form submission
    const handleSubmit = (event) => {
        event.preventDefault();
        // Verify each unit has both values selected
        const incomplete = units.some(
            (unit) => unit.inherent === '' || unit.control === ''
        );
        if (incomplete) {
            alert('Please select both Inherent Risk and Control Effectiveness for every Auditable Unit.');
            return;
        }
        // Show the Step 5 result
        setShowResults(true);
    };

    return (
        <div className="max-w-4xl mx-auto p-4 space-y-6">
            <h1 className="text-2xl font-bold text-gray-800">Risk Analysis Input</h1>
            <p className="text-gray-700">
                Enter your risk data by selecting an <strong>Inherent Risk</strong> and
                a <strong>Control Effectiveness</strong> rating for each Auditable Unit.
            </p>

            {/* Input Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
                {units.map((unit) => (
                    <div key={unit.id} className="p-4 border rounded-lg bg-gray-50">
                        <h2 className="text-lg font-bold mb-2">Auditable Unit {unit.id}</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Inherent Risk */}
                            <div>
                                <label className="block text-gray-600 mb-1">
                                    Inherent Risk:
                                </label>
                                <select
                                    value={unit.inherent}
                                    onChange={(e) =>
                                        updateUnit(unit.id, 'inherent', e.target.value)
                                    }
                                    className="border border-gray-300 rounded p-2 w-full"
                                >
                                    <option value="">Select Inherent Risk</option>
                                    {inherentOptions.map((opt) => (
                                        <option key={opt} value={opt}>
                                            {opt}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            {/* Control Effectiveness */}
                            <div>
                                <label className="block text-gray-600 mb-1">
                                    Control Effectiveness:
                                </label>
                                <select
                                    value={unit.control}
                                    onChange={(e) =>
                                        updateUnit(unit.id, 'control', e.target.value)
                                    }
                                    className="border border-gray-300 rounded p-2 w-full"
                                >
                                    <option value="">Select Control Effectiveness</option>
                                    {controlOptions.map((opt) => (
                                        <option key={opt} value={opt}>
                                            {opt}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>
                ))}

                <button
                    type="submit"
                    className="bg-blue-500 text-white px-4 py-2 rounded shadow"
                >
                    Show Residual Risk Results (Step 5)
                </button>
            </form>

            {/* Step 5 Output: Residual Risk Table */}
            {showResults && (
                <div className="mt-8">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">
                        Step 5: Determination of Residual Risk
                    </h2>
                    <div className="overflow-x-auto border rounded-lg">
                        <table className="min-w-full text-sm divide-y divide-gray-200">
                            <thead className="bg-gray-200">
                                <tr>
                                    <th className="px-4 py-2 border-b text-left font-medium text-gray-700">
                                        Auditable Unit
                                    </th>
                                    <th className="px-4 py-2 border-b text-left font-medium text-gray-700">
                                        Inherent Risk
                                    </th>
                                    <th className="px-4 py-2 border-b text-left font-medium text-gray-700">
                                        Control Effectiveness
                                    </th>
                                    <th className="px-4 py-2 border-b text-left font-medium text-gray-700">
                                        Residual Risk
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-100">
                                {units.map((unit) => (
                                    <tr key={unit.id}>
                                        <td className="px-4 py-2 border-b">
                                            Auditable Unit {unit.id}
                                        </td>
                                        <td className="px-4 py-2 border-b">{unit.inherent}</td>
                                        <td className="px-4 py-2 border-b">{unit.control}</td>
                                        <td className="px-4 py-2 border-b">
                                            {getResidualRisk(unit.inherent, unit.control)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <p className="text-gray-600 mt-2">
                        <em>
                            Note: Residual Risk is calculated by comparing the Inherent Risk with the
                            effectiveness of the controls in place.
                        </em>
                    </p>
                </div>
            )}
        </div>
    );
}
