import React, { useState } from "react";
import RiskAnalysisType1 from "./riskAnalisisTypeOne/RiskAnalysisType1Explanation";
import RiskAnalysisTypeOneCalculator from "./riskAnalisisTypeOne/RiskAnalysisTypeOneCalculator";

export default function RiskAssessment() {
    const [activeTab, setActiveTab] = useState("calculator");

    return (
        <div className="p-3 space-y-6">
            <div className="flex justify-between">
                <h2 className="text-2xl font-bold mb-2">Risk Assessment Using Risk Factor to Produce Risk Index</h2>
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
            {activeTab === "calculator" && <RiskAnalysisTypeOneCalculator />}
            {activeTab === "explanation" && (
                <div>
                    <RiskAnalysisType1 />
                </div>
            )}
        </div>
    );
}
