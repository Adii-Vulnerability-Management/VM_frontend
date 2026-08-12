import React from "react";

export default function PriorityThresholds({ thresholds, onThresholdChange }) {
    return (
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h3 className="text-xl font-semibold text-gray-700 mb-3">Priority Thresholds</h3>
            <p className="text-gray-600 text-sm mb-4">
                By default:{" "}
                <code className="bg-gray-100 px-1 py-0.5 rounded">
                    Over 45 = Extreme, 40–45 = High, 30–39 = Moderate, below 30 = Low
                </code>{" "}
                Adjust below to change how priorities are assigned:
            </p>
            <div className="flex flex-wrap gap-8">
                <div className="flex flex-col">
                    <label className="text-sm font-medium mb-1">Extreme if Over:</label>
                    <input
                        type="number"
                        name="veryHigh"
                        value={thresholds.veryHigh}
                        onChange={onThresholdChange}
                        className="border border-gray-300 rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-400 w-32"
                    />
                </div>
                <div className="flex flex-col">
                    <label className="text-sm font-medium mb-1">
                        High if between (≥) and (≤) Extreme:
                    </label>
                    <input
                        type="number"
                        name="high"
                        value={thresholds.high}
                        onChange={onThresholdChange}
                        className="border border-gray-300 rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-400 w-32"
                    />
                </div>
                <div className="flex flex-col">
                    <label className="text-sm font-medium mb-1">
                        Moderate if between (≥) and &lt; High:
                    </label>
                    <input
                        type="number"
                        name="medium"
                        value={thresholds.medium}
                        onChange={onThresholdChange}
                        className="border border-gray-300 rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-400 w-32"
                    />
                </div>
            </div>

            {/* Display current thresholds mapping in a table */}
            <div className="mt-6">
                <h4 className="font-semibold text-lg text-gray-800 mb-4">Current Priority Ranges</h4>
                <div className="overflow-hidden rounded-lg shadow-sm">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-[#2B245C]">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">
                                    Risk Index Score
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">
                                    Risk / Priority
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            <tr>
                                <td className="px-6 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                                    Over {thresholds.veryHigh}
                                </td>
                                <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-700">Extreme</td>
                            </tr>
                            <tr>
                                <td className="px-6 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                                    {thresholds.high} &ndash; {thresholds.veryHigh}
                                </td>
                                <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-700">High</td>
                            </tr>
                            <tr>
                                <td className="px-6 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                                    {thresholds.medium} &ndash; {thresholds.high - 1}
                                </td>
                                <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-700">Moderate</td>
                            </tr>
                            <tr>
                                <td className="px-6 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                                    Below {thresholds.medium}
                                </td>
                                <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-700">Low</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
