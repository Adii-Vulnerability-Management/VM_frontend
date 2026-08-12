import { useState } from "react";

const TimeReportingSection = () => {

    // Inputs
    const [budgetedTime, setBudgetedTime] = useState("");
    const [forecastedTime, setForecastedTime] = useState("");
    const [planningHours, setPlanningHours] = useState("");
    const [testingHours, setTestingHours] = useState("");
    const [reportingHours, setReportingHours] = useState("");

    // Convert string inputs to numeric (fall back to 0)
    const budget = parseFloat(budgetedTime) || 0;
    const forecast = parseFloat(forecastedTime) || 0;
    const plan = parseFloat(planningHours) || 0;
    const test = parseFloat(testingHours) || 0;
    const report = parseFloat(reportingHours) || 0;

    // Derived calculations
    // Over/Under Budget => ((Forecast - Budget) / Budget) * 100
    // Remaining Hours => Forecast - (Planning + Testing + Reporting)
    // Total Actual Hours => Planning + Testing + Reporting
    const totalActual = plan + test + report;
    const overUnderPercentage = budget
        ? ((forecast - budget) / budget) * 100
        : 0;
    const remainingHours = forecast - totalActual;

    return (
        <div className="p-4 space-y-4">
            {/* Row 1 */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                {/* Budgeted Time */}
                <label className="block font-medium text-gray-700">
                    Budgeted Time
                </label>
                <input
                    type="number"
                    value={budgetedTime}
                    onChange={(e) => setBudgetedTime(e.target.value)}
                    placeholder="Ex: 200"
                    className="border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-400"
                />

                {/* Planning Actual Hours Worked */}
                <label className="block font-medium text-gray-700">
                    Planning Actual Hours Worked
                </label>
                <input
                    type="number"
                    value={planningHours}
                    onChange={(e) => setPlanningHours(e.target.value)}
                    placeholder="Ex: 10"
                    className="border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
            </div>

            {/* Row 2 */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                {/* Forecasted Time */}
                <label className="block font-medium text-gray-700">
                    Forecasted Time
                </label>
                <input
                    type="number"
                    value={forecastedTime}
                    onChange={(e) => setForecastedTime(e.target.value)}
                    placeholder="Ex: 225"
                    className="border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-400"
                />

                {/* Testing Actual Hours Worked */}
                <label className="block font-medium text-gray-700">
                    Testing Actual Hours Worked
                </label>
                <input
                    type="number"
                    value={testingHours}
                    onChange={(e) => setTestingHours(e.target.value)}
                    placeholder="Ex: 10"
                    className="border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
            </div>

            {/* Row 3 */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                {/* Over/Under Budget */}
                <label className="block font-medium text-gray-700">
                    Over/Under Budget
                </label>
                <div className="text-gray-800">
                    {overUnderPercentage.toFixed(1)}%
                </div>

                {/* Reporting Actual Hours Worked */}
                <label className="block font-medium text-gray-700">
                    Reporting Actual Hours Worked
                </label>
                <input
                    type="number"
                    value={reportingHours}
                    onChange={(e) => setReportingHours(e.target.value)}
                    placeholder="Ex: 10"
                    className="border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
            </div>

            {/* Row 4 */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                {/* Remaining Hours */}
                <label className="block font-medium text-gray-700">
                    Remaining Hours
                </label>
                <div className="text-gray-800">
                    {isNaN(remainingHours) ? "" : remainingHours}
                </div>

                {/* Total Actual Hours Worked */}
                <label className="block font-medium text-gray-700">
                    Total Actual Hours Worked
                </label>
                <div className="text-gray-800">{totalActual}</div>
            </div>
        </div>
    );
};

export default TimeReportingSection;
