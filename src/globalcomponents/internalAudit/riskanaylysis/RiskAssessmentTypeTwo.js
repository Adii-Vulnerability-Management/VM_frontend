import React, { useState } from 'react'
import RiskAnalysisTypeTowCalculator from './riskAnylisisTypetwo/RiskAnalysisTypeTowCalculator';
import AuditCalculationExplanation from './riskAnylisisTypetwo/RiskAnalysisType2Explanation';

function RiskAssessmentTypeTwo() {
    const [activeTab, setActiveTab] = useState("calculator");

    return (
        <div className="p-3 space-y-6">
            <div className="flex justify-between">
                <h2 className="text-2xl font-bold mb-4">Risk Analysis Matrix Calculator</h2>
            </div>

            {/* Tabs */}
            <div className="flex space-x-4 border-b mb-6">
                <button
                    onClick={() => setActiveTab("calculator")}
                    className={`py-2 px-4 border-b-2 font-medium ${activeTab === "calculator"
                        ? "border-blue-600 text-blue-600"
                        : "border-transparent text-gray-600 hover:text-blue-600"
                        }`}
                >
                    Risk Calculator
                </button>
                <button
                    onClick={() => setActiveTab("explanation")}
                    className={`py-2 px-4 border-b-2 font-medium ${activeTab === "explanation"
                        ? "border-blue-600 text-blue-600"
                        : "border-transparent text-gray-600 hover:text-blue-600"
                        }`}
                >
                    Knowledge Base
                </button>
            </div>

            {/* Tab Content */}
            {activeTab === "calculator" && (
                <RiskAnalysisTypeTowCalculator />
            )}

            {activeTab === "explanation" && (
                <div>
                    <AuditCalculationExplanation />
                </div>
            )}
        </div>
    )
}

export default RiskAssessmentTypeTwo
