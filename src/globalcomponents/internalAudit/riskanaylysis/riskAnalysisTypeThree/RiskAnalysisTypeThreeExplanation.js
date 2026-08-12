import React from 'react'

function RiskAnalysisTypeThreeExplanation() {
    return (
        <div className="space-y-8 p-6 bg-white rounded-xl shadow-lg ">
            {/* Main Title */}
            <div className="flex items-center space-x-3">
                <span role="img" aria-label="target" className="text-3xl">🎯</span>
                <h2 className="text-2xl font-bold text-gray-800">Risk Analysis Type 2</h2>
            </div>
            {/* Step 1 */}
            <div className="p-4 border rounded-lg bg-gray-50 space-y-4">
                <div className="flex items-center space-x-2">
                    <span role="img" aria-label="step-1" className="text-2xl">1️⃣</span>
                    <h3 className="text-lg font-bold text-gray-700">Step 1: Define Risk Measurement Scale and Criteria</h3>
                </div>
                <p className="text-gray-600">
                    In this example of the specific-risk approach, the first step is to define the criteria by which to rate
                    each risk in terms of impact and likelihood. The three criteria chosen for this example are regulatory,
                    operational, and financial.
                </p>
                <p className="text-gray-600">
                    Impact is scored on a scale from 5 representing catastrophic to 1 representing low.
                    Likelihood is rated on a scale ranging from 5 representing very high to 1 representing very low.
                </p>

                {/* Table with Impact Scores and Criteria */}
                <div className="overflow-x-auto border rounded-lg">
                    <table className="min-w-full text-sm divide-y divide-gray-200">
                        <thead className="bg-gray-200">
                            <tr>
                                <th className="px-4 py-2 font-medium text-gray-700 border-b text-left">Impact Description</th>
                                <th className="px-4 py-2 font-medium text-gray-700 border-b text-left">Impact Score</th>
                                <th className="px-4 py-2 font-medium text-gray-700 border-b text-left">Regulatory Criteria</th>
                                <th className="px-4 py-2 font-medium text-gray-700 border-b text-left">Operational Criteria</th>
                                <th className="px-4 py-2 font-medium text-gray-700 border-b text-left">Financial Criteria</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-100">
                            {/* Catastrophic */}
                            <tr>
                                <td className="px-4 py-2 border-b">Catastrophic</td>
                                <td className="px-4 py-2 border-b">5</td>
                                <td className="px-4 py-2 border-b">
                                    Complex regulatory environment with strict enforcement; likely
                                    large legal liabilities and negative reputational impacts.
                                </td>
                                <td className="px-4 py-2 border-b">
                                    One or more business units or entire organization may be unable to operate.
                                    Noncompliance may lead to shutdown.
                                </td>
                                <td className="px-4 py-2 border-b">Greater than $25 million</td>
                            </tr>

                            {/* Highly Significant */}
                            <tr>
                                <td className="px-4 py-2 border-b">Highly Significant</td>
                                <td className="px-4 py-2 border-b">4</td>
                                <td className="px-4 py-2 border-b">
                                    Multiple financial penalties and reputational damage may occur; legal notices probable.
                                </td>
                                <td className="px-4 py-2 border-b">
                                    Organization&apos;s ability to operate or serve customers may be severely reduced.
                                    Impact on reputation.
                                </td>
                                <td className="px-4 py-2 border-b">$10–$25 million</td>
                            </tr>


                            {/* Significant */}
                            <tr>
                                <td className="px-4 py-2 border-b">Significant</td>
                                <td className="px-4 py-2 border-b">3</td>
                                <td className="px-4 py-2 border-b">
                                    Lasting impacts and regulatory considerations. Enforcement actions are possible.
                                </td>
                                <td className="px-4 py-2 border-b">
                                    One or more business units may be affected; customers or key processes impacted.
                                </td>
                                <td className="px-4 py-2 border-b">$5–$10 million (material)</td>
                            </tr>

                            {/* Moderate */}
                            <tr>
                                <td className="px-4 py-2 border-b">Moderate</td>
                                <td className="px-4 py-2 border-b">2</td>
                                <td className="px-4 py-2 border-b">
                                    Active regulatory environment with small or moderate fines.
                                </td>
                                <td className="px-4 py-2 border-b">
                                    Operational effectiveness may be partially compromised or slightly damaged.
                                </td>
                                <td className="px-4 py-2 border-b">$1–$5 million</td>
                            </tr>

                            {/* Low */}
                            <tr>
                                <td className="px-4 py-2 border-b">Low</td>
                                <td className="px-4 py-2 border-b">1</td>
                                <td className="px-4 py-2 border-b">
                                    Regulatory environment is lax or penalty is minimal.
                                </td>
                                <td className="px-4 py-2 border-b">
                                    Operational processes are mostly uninterrupted. Some inefficiency.
                                </td>
                                <td className="px-4 py-2 border-b">Less than $1 million</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Step 2 */}
            <div className="p-4 border rounded-lg bg-gray-50 space-y-4">
                <div className="flex items-center space-x-2">
                    <span role="img" aria-label="step-4" className="text-2xl">2️⃣</span>
                    <h3 className="text-lg font-bold text-gray-700">Step 2: Likelihood Ratings</h3>
                </div>
                <p className="text-gray-600">
                    In this step, each risk is assigned a likelihood rating, from Very High (5) to Very Low (1). The table below outlines
                    how each rating is defined, a brief description, and the general criteria for controls and processes.
                </p>

                <div className="overflow-x-auto border rounded-lg">
                    <table className="min-w-full text-sm divide-y divide-gray-200">
                        <thead className="bg-gray-200">
                            <tr>
                                <th className="px-4 py-2 border-b text-left font-medium text-gray-700">Rating</th>
                                <th className="px-4 py-2 border-b text-left font-medium text-gray-700">Score</th>
                                <th className="px-4 py-2 border-b text-left font-medium text-gray-700">Description</th>
                                <th className="px-4 py-2 border-b text-left font-medium text-gray-700">Criteria</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-100">
                            <tr>
                                <td className="px-4 py-2 border-b">Very High</td>
                                <td className="px-4 py-2 border-b">5</td>
                                <td className="px-4 py-2 border-b">
                                    Likelihood of risk occurring is very high relatively.
                                </td>
                                <td className="px-4 py-2 border-b">
                                    Operational processes are complex, and controls are not effective.
                                </td>
                            </tr>
                            <tr>
                                <td className="px-4 py-2 border-b">High</td>
                                <td className="px-4 py-2 border-b">4</td>
                                <td className="px-4 py-2 border-b">
                                    Likelihood of risk occurring is high relatively.
                                </td>
                                <td className="px-4 py-2 border-b">
                                    Operational processes are complex, with some control weaknesses noted.
                                </td>
                            </tr>
                            <tr>
                                <td className="px-4 py-2 border-b">Moderate</td>
                                <td className="px-4 py-2 border-b">3</td>
                                <td className="px-4 py-2 border-b">
                                    Likelihood of risk occurring is moderate relatively.
                                </td>
                                <td className="px-4 py-2 border-b">
                                    Operational processes are moderately complex; minor control weaknesses exist.
                                </td>
                            </tr>
                            <tr>
                                <td className="px-4 py-2 border-b">Low</td>
                                <td className="px-4 py-2 border-b">2</td>
                                <td className="px-4 py-2 border-b">
                                    Likelihood of risk occurring is low relatively.
                                </td>
                                <td className="px-4 py-2 border-b">
                                    Operational processes are not complex; controls are effective.
                                </td>
                            </tr>
                            <tr>
                                <td className="px-4 py-2 border-b">Very Low</td>
                                <td className="px-4 py-2 border-b">1</td>
                                <td className="px-4 py-2 border-b">
                                    Likelihood of risk occurring is very low relatively.
                                </td>
                                <td className="px-4 py-2 border-b">
                                    Operational processes are not complex; controls are highly effective.
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
            {/* Step 3 */}
            <div className="p-4 border rounded-lg bg-gray-50 space-y-4">
                <div className="flex items-center space-x-2">
                    <span role="img" aria-label="step-3" className="text-2xl">3️⃣</span>
                    <h3 className="text-lg font-bold text-gray-700">Step 3: Specific-Risk Approach with Total Risk Score</h3>
                </div>

                <p className="text-gray-600">
                    Figure D.3 illustrates a customized example where each auditable unit is listed in a row and each risk
                    in a column. Impact (I) and likelihood (L) ratings for each risk are combined to yield a total risk score
                    for each unit. In this simplified demonstration, the ratings are not weighted—impact and likelihood are
                    just summed for each risk. In practice, formal weighting or more complex scoring may be employed.
                </p>

                {/* Sample Table Showing the Risk Scores */}
                <div className="overflow-x-auto border rounded-lg">
                    <table className="min-w-full text-sm divide-y divide-gray-200">
                        <thead className="bg-gray-200">
                            <tr>
                                <th className="px-4 py-2 border-b text-left font-medium text-gray-700">Auditable Unit</th>
                                <th className="px-4 py-2 border-b text-left font-medium text-gray-700">Risk 1 (I+L)</th>
                                <th className="px-4 py-2 border-b text-left font-medium text-gray-700">Risk 2 (I+L)</th>
                                <th className="px-4 py-2 border-b text-left font-medium text-gray-700">Risk 3 (I+L)</th>
                                <th className="px-4 py-2 border-b text-left font-medium text-gray-700">Risk 4 (I+L)</th>
                                <th className="px-4 py-2 border-b text-left font-medium text-gray-700">Risk 5 (I+L)</th>
                                <th className="px-4 py-2 border-b text-left font-medium text-gray-700">Total Score</th>
                                <th className="px-4 py-2 border-b text-left font-medium text-gray-700">Level</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-100">
                            <tr>
                                <td className="px-4 py-2 border-b">Auditable Unit 1</td>
                                <td className="px-4 py-2 border-b">7</td>
                                <td className="px-4 py-2 border-b">6</td>
                                <td className="px-4 py-2 border-b">8</td>
                                <td className="px-4 py-2 border-b">5</td>
                                <td className="px-4 py-2 border-b">6</td>
                                <td className="px-4 py-2 border-b">32</td>
                                <td className="px-4 py-2 border-b">L</td>
                            </tr>
                            <tr>
                                <td className="px-4 py-2 border-b">Auditable Unit 2</td>
                                <td className="px-4 py-2 border-b">8</td>
                                <td className="px-4 py-2 border-b">7</td>
                                <td className="px-4 py-2 border-b">5</td>
                                <td className="px-4 py-2 border-b">6</td>
                                <td className="px-4 py-2 border-b">5</td>
                                <td className="px-4 py-2 border-b">31</td>
                                <td className="px-4 py-2 border-b">L</td>
                            </tr>
                            <tr>
                                <td className="px-4 py-2 border-b">Auditable Unit 3</td>
                                <td className="px-4 py-2 border-b">9</td>
                                <td className="px-4 py-2 border-b">6</td>
                                <td className="px-4 py-2 border-b">7</td>
                                <td className="px-4 py-2 border-b">8</td>
                                <td className="px-4 py-2 border-b">6</td>
                                <td className="px-4 py-2 border-b">36</td>
                                <td className="px-4 py-2 border-b">M</td>
                            </tr>
                            <tr>
                                <td className="px-4 py-2 border-b">Auditable Unit 4</td>
                                <td className="px-4 py-2 border-b">8</td>
                                <td className="px-4 py-2 border-b">8</td>
                                <td className="px-4 py-2 border-b">9</td>
                                <td className="px-4 py-2 border-b">6</td>
                                <td className="px-4 py-2 border-b">8</td>
                                <td className="px-4 py-2 border-b">39</td>
                                <td className="px-4 py-2 border-b">M</td>
                            </tr>
                            <tr>
                                <td className="px-4 py-2 border-b">Auditable Unit 5</td>
                                <td className="px-4 py-2 border-b">9</td>
                                <td className="px-4 py-2 border-b">7</td>
                                <td className="px-4 py-2 border-b">8</td>
                                <td className="px-4 py-2 border-b">7</td>
                                <td className="px-4 py-2 border-b">6</td>
                                <td className="px-4 py-2 border-b">37</td>
                                <td className="px-4 py-2 border-b">M</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <p className="text-gray-600">
                    <strong>Rating for Score Ranges:</strong> Low (L) = 0–32, Moderate (M) = 33–45, High (H) = 46–59, Extreme (E) = 60+.
                    These ranges or thresholds can be adjusted based on organizational risk tolerance.
                </p>
            </div>

            {/* Step 5 */}
            {/* <div className="p-4 border rounded-lg bg-gray-50 space-y-4">
                <div className="flex items-center space-x-2">
                    <span role="img" aria-label="step-5" className="text-2xl">5️⃣</span>
                    <h3 className="text-lg font-bold text-gray-700">Step 5: Determination of Residual Risk</h3>
                </div>
                <p className="text-gray-600">
                    In this step, the assessment of <strong>inherent risk</strong>, <strong>control effectiveness</strong>, and
                    <strong> residual risk</strong> may be shown in a matrix or chart form. For each auditable unit, we note
                    the risk in its inherent form, how effective the relevant controls are, and finally the resulting
                    residual risk after controls and mitigations have been applied.
                </p>

                <div className="overflow-x-auto border rounded-lg">
                    <table className="min-w-full text-sm divide-y divide-gray-200">
                        <thead className="bg-gray-200">
                            <tr>
                                <th className="px-4 py-2 border-b text-left font-medium text-gray-700">Auditable Unit</th>
                                <th className="px-4 py-2 border-b text-left font-medium text-gray-700">Inherent Level of Risk</th>
                                <th className="px-4 py-2 border-b text-left font-medium text-gray-700">Control Effectiveness</th>
                                <th className="px-4 py-2 border-b text-left font-medium text-gray-700">Residual Level of Risk</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-100">
                            <tr>
                                <td className="px-4 py-2 border-b">Auditable Unit 1</td>
                                <td className="px-4 py-2 border-b">Moderate</td>
                                <td className="px-4 py-2 border-b">Need improvement</td>
                                <td className="px-4 py-2 border-b">Moderate</td>
                            </tr>
                            <tr>
                                <td className="px-4 py-2 border-b">Auditable Unit 2</td>
                                <td className="px-4 py-2 border-b">Low</td>
                                <td className="px-4 py-2 border-b">Adequate</td>
                                <td className="px-4 py-2 border-b">Low</td>
                            </tr>
                            <tr>
                                <td className="px-4 py-2 border-b">Auditable Unit 3</td>
                                <td className="px-4 py-2 border-b">High</td>
                                <td className="px-4 py-2 border-b">Inadequate</td>
                                <td className="px-4 py-2 border-b">High</td>
                            </tr>
                            <tr>
                                <td className="px-4 py-2 border-b">Auditable Unit 4</td>
                                <td className="px-4 py-2 border-b">Moderate</td>
                                <td className="px-4 py-2 border-b">Adequate</td>
                                <td className="px-4 py-2 border-b">Low</td>
                            </tr>
                            <tr>
                                <td className="px-4 py-2 border-b">Auditable Unit 5</td>
                                <td className="px-4 py-2 border-b">High</td>
                                <td className="px-4 py-2 border-b">Need improvement</td>
                                <td className="px-4 py-2 border-b">Moderate</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <p className="text-gray-600">
                    <em>Note:</em> By comparing Inherent Risk and Control Effectiveness, management can determine a more accurate
                    <strong>Residual Risk</strong> for each auditable unit. This matrix offers a clear, visual way to identify
                    priorities and allocate resources effectively.
                </p>
            </div> */}

        </div>
    )
}

export default RiskAnalysisTypeThreeExplanation
