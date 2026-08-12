import React from 'react';

function AuditCalculationExplanation() {
    return (
        <div className="p-6 bg-gray-50 rounded-lg shadow-md">

            <section className="mb-6">
                <h2 className="text-2xl font-semibold mb-2">
                    Overview <span role="img" aria-label="overview">ℹ️</span>
                </h2>                <p className="text-gray-800">
                    The audit calculation Section is designed to capture key audit and risk-related data from users.
                    Inputs such as business area, audit reference, process area, risk details, and assurance ratings
                    are collected. These inputs lay the foundation for calculating and assessing the overall audit risk.
                </p>
            </section>

            <section className="mb-6">
                <h2 className="text-2xl font-semibold mb-2">
                    Data Input & Collection <span role="img" aria-label="data">📝</span>
                </h2>
                <p className="text-gray-800">
                    The component gathers data using a grid-based form. Users select or enter values for:
                </p>
                <ul className="list-disc pl-6 text-gray-800">
                    <li>Business Area and Process Area</li>
                    <li>Audit Reference, Topic, and Type</li>
                    <li>Risk Reference, Category, and Description</li>
                    <li>Residual Risk and Overall Assurance Rating (on a scale from 1 to 10)</li>
                    <li>Additional parameters such as objective, scope, budget, days, and report outcome</li>
                    <li>Audit Team composition and key contracts</li>
                </ul>
                <p className="text-gray-800 mt-2">
                    These fields are used to capture the full context of the audit scenario.
                </p>
            </section>

            <section className="mb-6">
                <h2 className="text-2xl font-semibold mb-2">
                    Calculation Process <span role="img" aria-label="calculation">🔢</span>
                </h2>
                <p className="text-gray-800">
                    The calculation process builds on the data provided:
                </p>
                <ol className="list-decimal pl-6 text-gray-800">
                    <li>
                        <strong>Risk Weighting:</strong> Depending on the selected risk category (High, Medium, or Low), different weighting factors can be applied to assess the risk exposure.
                    </li>
                    <li>
                        <strong>Assurance Adjustment:</strong> The overall assurance rating is used to adjust the risk assessment. Higher ratings may lower the perceived risk, whereas lower ratings indicate greater risk vulnerability.
                    </li>
                    <li>
                        <strong>Residual Risk Evaluation:</strong> The residual risk, combined with other metrics, plays a role in finalizing an overall risk score. This step may involve normalizing or averaging several fields.
                    </li>
                    <li>
                        <strong>Aggregate Audit Score:</strong> All these inputs are aggregated using a predefined algorithm or formula to provide an audit score. Although the current component primarily captures data, the intention is to use these values for meaningful calculations to derive a final risk profile.
                    </li>
                </ol>
            </section>

            <section className="mb-6">
                <h2 className="text-2xl font-semibold mb-2">
                    Display & Data Review <span role="img" aria-label="display">📊</span>
                </h2>
                <p className="text-gray-800">
                    Once the inputs are processed and the calculation is complete, the results are displayed in a table:
                </p>
                <ul className="list-disc pl-6 text-gray-800">
                    <li>The table presents each entry with its input values, which can help in reviewing the overall risk scenario.</li>
                    <li>The design includes specific background colors for different sets of columns to help with visual differentiation and readability.</li>
                </ul>
            </section>

            <section className="mb-6">
                <h2 className="text-2xl font-semibold mb-2">
                    Implementation Considerations <span role="img" aria-label="implementation">⚙️</span>
                </h2>
                <p className="text-gray-800">
                    In a complete application, the next steps would be to implement the actual algorithms that compute risk scores,
                    integrating factors like the assurance rating and residual risk into a single comprehensive audit score.
                    This explanation lays the groundwork for understanding the data flow and potential calculation logic.
                </p>
            </section>

        </div>
    );
}

export default AuditCalculationExplanation;
