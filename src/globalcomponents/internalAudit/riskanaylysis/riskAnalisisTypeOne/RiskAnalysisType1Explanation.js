import React from 'react';

export default function RiskAnalysisType1() {
    return (
        <div className="space-y-6 ">
            {/* Title */}
            <div className="flex items-center space-x-3">
                <span className="text-3xl" role="img" aria-label="clipboard">📋</span>
                <h2 className="text-2xl font-bold text-gray-800">Scoring Risk Factor</h2>
            </div>

            {/* Step 1: Example of Scoring Risk Factors */}
            <div className="p-4 border rounded-lg bg-gray-50 space-y-4">
                <div className="flex items-center space-x-2">
                    <span className="text-2xl" role="img" aria-label="memo">📝</span>
                    <h3 className="text-lg font-bold text-gray-700">Step 1: Example of Scoring Risk Factors</h3>
                </div>
                <p className="text-gray-600">
                    Having identified a number of risk factors, it is common practice to develop a set of criteria that can be used to score and therefore rank the relative need to audit each of the possible audit objects within the audit universe.
                    Developing criteria can be relatively simple or quite complex. Many factors will involve some degree of judgement,
                    so it may be easier to define only the lowest or highest score and leave the rest to judgement.
                    The example below provides possible criteria for four common risk factors — three of which are judgemental in nature
                    (<strong>Control Environment / Vulnerability, Sensitivity, and Management Concerns</strong>).
                </p>
                <p className="text-gray-600">
                    Below is an example table where each risk factor is awarded a points rating on a scale of 1–5, depending on the identified conditions:
                </p>
                <div className="overflow-x-auto border rounded-lg">
                    <table className="min-w-full text-sm divide-y divide-gray-200">
                        <thead className="bg-gray-200">
                            <tr>
                                <th className="px-4 py-2 font-medium text-gray-700 border-b text-left">Element</th>
                                <th className="px-4 py-2 font-medium text-gray-700 border-b text-left">Description / Scoring Risk Factors</th>
                                <th className="px-4 py-2 font-medium text-gray-700 border-b text-left">Score</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-100">
                            {/* A: Materiality */}
                            <tr>
                                <td className="px-4 py-2 border-b">A Materiality</td>
                                <td className="px-4 py-2 border-b">System accounts for less than 1% of the annual budget</td>
                                <td className="px-4 py-2 border-b">0</td>
                            </tr>
                            <tr>
                                <td className="px-4 py-2 border-b"></td>
                                <td className="px-4 py-2 border-b">System accounts for 5–10% of the annual budget</td>
                                <td className="px-4 py-2 border-b">2</td>
                            </tr>
                            <tr>
                                <td className="px-4 py-2 border-b"></td>
                                <td className="px-4 py-2 border-b">System accounts for 25–50% of the annual budget</td>
                                <td className="px-4 py-2 border-b">3</td>
                            </tr>
                            <tr>
                                <td className="px-4 py-2 border-b"></td>
                                <td className="px-4 py-2 border-b">System accounts for at least 75% of the annual budget</td>
                                <td className="px-4 py-2 border-b">5</td>
                            </tr>
                            {/* B: Control Environment / Vulnerability */}
                            <tr>
                                <td className="px-4 py-2 border-b">B Control Environment / Vulnerability</td>
                                <td className="px-4 py-2 border-b">Well-controlled system with little risk of fraud or error</td>
                                <td className="px-4 py-2 border-b">0</td>
                            </tr>
                            <tr>
                                <td className="px-4 py-2 border-b"></td>
                                <td className="px-4 py-2 border-b">Reasonably well-controlled with minor risk of fraud or error</td>
                                <td className="px-4 py-2 border-b">3</td>
                            </tr>
                            <tr>
                                <td className="px-4 py-2 border-b"></td>
                                <td className="px-4 py-2 border-b">System with a history of poor control and high risk of fraud or error</td>
                                <td className="px-4 py-2 border-b">5</td>
                            </tr>
                            {/* C: Sensitivity */}
                            <tr>
                                <td className="px-4 py-2 border-b">C Sensitivity</td>
                                <td className="px-4 py-2 border-b">Minimal external profile for the system</td>
                                <td className="px-4 py-2 border-b">0</td>
                            </tr>
                            <tr>
                                <td className="px-4 py-2 border-b"></td>
                                <td className="px-4 py-2 border-b">Potential for some external embarrassment if the system fails</td>
                                <td className="px-4 py-2 border-b">3</td>
                            </tr>
                            <tr>
                                <td className="px-4 py-2 border-b"></td>
                                <td className="px-4 py-2 border-b">Major public relations or legal issues if the system fails</td>
                                <td className="px-4 py-2 border-b">5</td>
                            </tr>
                            {/* D: Management Concerns */}
                            <tr>
                                <td className="px-4 py-2 border-b">D Management Concerns</td>
                                <td className="px-4 py-2 border-b">
                                    System with low profile across the organization; minimal impact on business objectives
                                </td>
                                <td className="px-4 py-2 border-b">0</td>
                            </tr>
                            <tr>
                                <td className="px-4 py-2 border-b"></td>
                                <td className="px-4 py-2 border-b">
                                    System with high profile or significant management concerns due to recent failures
                                </td>
                                <td className="px-4 py-2 border-b">5</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>


            {/* Step 2: Risk Index Calculation */}
            <div className="p-4 border rounded-lg bg-gray-50 space-y-4">
                <div className="flex items-center space-x-2">
                    <span className="text-2xl" role="img" aria-label="calculator">🧮</span>
                    <h3 className="text-lg font-bold text-gray-700">Step 2: Risk Index Calculation</h3>
                </div>
                <p className="text-gray-600">
                    Not all risk factors are equally important. Each of the risk factors is given a <strong>weighting</strong> using judgement of the relative importance of each of the risk factors — for example, factors like materiality or management concerns typically carry higher weight.
                    These weightings can be established collaboratively, such as through a workshop with management.
                    <strong> Weightings should typically be assigned on a scale of 1 to 5, where 1 indicates low importance and 5 indicates high importance.</strong>
                    Once the weighting is determined, the score for each risk factor is multiplied by its respective weighting to calculate the overall <strong>Risk Index</strong>.
                    This numeric index helps in categorizing audit objects by priority: <strong>Very High</strong>, <strong>High</strong>, <strong>Medium</strong>, or <strong>Low</strong>.
                </p>
                <p className="text-gray-600">
                    In this step, each element is assigned a <strong>weighting</strong> (A = 3, B = 2, C = 2, D = 4). The factor scores are combined in the formula:
                    <br />
                    <strong>Risk Index = (A × 3) + (B × 2) + (C × 2) + (D × 4)</strong>
                </p>
                <p className="text-gray-700 font-semibold">
                    Each of the risk factors is given a weighting using judgement of the relative importance of each of the risk factors.
                </p>
                <div className="overflow-x-auto border rounded-lg max-w-lg">
                    <table className="min-w-full text-sm divide-y divide-gray-200">
                        <thead className="bg-gray-200">
                            <tr>
                                <th className="px-4 py-2 border-b text-left font-medium text-gray-700">Element</th>
                                <th className="px-4 py-2 border-b text-left font-medium text-gray-700">Weighting (Scale 1-5)</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr className="divide-x divide-gray-200">
                                <td className="px-4 py-2 border-b">A Materiality</td>
                                <td className="px-4 py-2 border-b">3</td>
                            </tr>
                            <tr className="divide-x divide-gray-200">
                                <td className="px-4 py-2 border-b">B Control Environment / Vulnerability</td>
                                <td className="px-4 py-2 border-b">2</td>
                            </tr>
                            <tr className="divide-x divide-gray-200">
                                <td className="px-4 py-2 border-b">C Sensitivity</td>
                                <td className="px-4 py-2 border-b">2</td>
                            </tr>
                            <tr className="divide-x divide-gray-200">
                                <td className="px-4 py-2 border-b">D Management Concerns</td>
                                <td className="px-4 py-2 border-b">4</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <p className="text-gray-600 mt-2">
                    For example, if A = 5, B = 3, C = 2, and D = 5, then the Risk Index is:
                    <br />
                    5 × 3 + 3 × 2 + 2 × 2 + 5 × 4 = 15 + 6 + 4 + 20 = <strong>45</strong>
                </p>
            </div>


            {/* Step 3: Categorize Risk Index Score */}
            <div className="p-4 border rounded-lg bg-gray-50 space-y-4">
                <div className="flex items-center space-x-2">
                    <span className="text-2xl" role="img" aria-label="chart">📊</span>
                    <h3 className="text-lg font-bold text-gray-700">Step 3: Categorize Risk Index Score</h3>
                </div>
                <p className="text-gray-600">
                    Based on the calculated Risk Index, each audit object is categorized as <strong>Very High</strong>, <strong>High</strong>, <strong>Medium</strong>, or <strong>Low</strong> risk.
                </p>
                <div className="overflow-x-auto border rounded-lg max-w-md">
                    <table className="min-w-full text-sm divide-y divide-gray-200">
                        <thead className="bg-gray-200">
                            <tr>
                                <th className="px-4 py-2 border-b text-left font-medium text-gray-700">
                                    Risk Index Score
                                </th>
                                <th className="px-4 py-2 border-b text-left font-medium text-gray-700">
                                    Risk / Priority
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr className="divide-x divide-gray-200">
                                <td className="px-4 py-2 border-b">Over 45</td>
                                <td className="px-4 py-2 border-b">Very High</td>
                            </tr>
                            <tr className="divide-x divide-gray-200">
                                <td className="px-4 py-2 border-b">40–45</td>
                                <td className="px-4 py-2 border-b">High</td>
                            </tr>
                            <tr className="divide-x divide-gray-200">
                                <td className="px-4 py-2 border-b">30–40</td>
                                <td className="px-4 py-2 border-b">Medium</td>
                            </tr>
                            <tr className="divide-x divide-gray-200">
                                <td className="px-4 py-2 border-b">Below 30</td>
                                <td className="px-4 py-2 border-b">Low</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <p className="text-gray-600">
                    With minor adjustments, this system can account for a wide range of risk factors.
                </p>
            </div>

            <h2 className="text-2xl font-bold text-gray-800">
                🎯 Audit Objective
            </h2>
            <div className="p-4 border rounded-lg bg-gray-50 space-y-4">
                <h1 className="text-3xl font-bold mb-6">
                    🗂️ Categorising the Audit Universe for Risk-Based Planning
                </h1>
                {/* Section: What is the “audit universe”? */}
                <section className="mb-8">
                    <h2 className="text-2xl font-semibold mb-4">What is the “audit universe”?</h2>
                    <p className="mb-4">
                        The IA CoP’s Good Practice Internal Audit Manual template explains that the audit universe is the “starting point for the internal audit plan” and defines the audit universe as: “The overall scope of the internal audit function and the totality of auditable processes, functions and locations.”
                    </p>
                    <ul className="list-disc list-inside space-y-2">
                        <li>
                            The phrase “audit universe” is a simple way of referring to the totality of things that an internal auditor could separately examine.
                        </li>
                        <li>
                            The universe consists of the totality of “auditable objects” which identifies and describes discrete parts of the business, system, or process. Auditable objects must be large enough to justify an audit yet small enough to be manageable.
                        </li>
                    </ul>
                </section>

                {/* Section: The Elephant Approach */}
                <section className="mb-8">
                    <h2 className="text-2xl font-semibold mb-4">
                        The Elephant Approach – Cutting the Audit Universe Down into Small Chunks
                    </h2>
                    <ol className="list-decimal list-inside space-y-2">
                        <li>
                            The answer to the question “How to eat an elephant?” is “One bite at a time”. This is how we need to approach the audit universe by dividing it into specific systems, processes, programmes, or organisational units that can be audited – the auditable objects.
                        </li>
                        <li>
                            Traditionally, auditable objects were categorised by organisational structure using a top‐down, “vertical” analysis. Often, an auditable object equated with one or more organisational units. This remains a useful first cut.
                        </li>
                        <li>
                            A horizontal or cross‐functional perspective is also important for planning audits – examining entire business processes. For example, accounting or business management systems typically affect all organisational units and may pose critical risks.
                        </li>
                        <li>
                            Typically, the audit universe is a combination of top‐down (vertical) and cross‐functional (horizontal) slices. For example, procurement can be viewed as a cross‐functional activity, and it might be further subdivided by location or type of purchase.
                        </li>
                        <li>
                            There is a high degree of commonality in the way IA units in Government tend to categorise the audit universe.
                        </li>
                    </ol>
                </section>

                {/* Section: Good Practice Example */}
                <section className="mb-8">
                    <h2 className="text-2xl font-semibold mb-4">Good Practice Example on Categorisation of the Audit Universe</h2>
                    <p className="mb-4">(Based on IIA Government survey data)</p>
                    <ul className="list-disc list-inside space-y-2">
                        <li>Almost all IA units have a formally documented audit universe (97%)</li>
                        <li>
                            The most common categorisations used are:
                            <ul className="list-disc list-inside ml-6 mt-2 space-y-1">
                                <li>Departments – 97%</li>
                                <li>Processes – 97%</li>
                                <li>Organisational unit or location – 81%</li>
                                <li>Operational programmes – 75%</li>
                                <li>Service Lines – 58%</li>
                                <li>ERM risk portfolio – 28%</li>
                                <li>Other – 22%</li>
                            </ul>
                        </li>
                    </ul>
                </section>

                {/* Section: Minimum Categorizations */}
                <section className="mb-8">
                    <h2 className="text-2xl font-semibold mb-4">Minimum Categorizations for the Audit Universe</h2>
                    <p className="mb-4">
                        It is up to the Head of Internal Audit (HIA) to determine the method and number of slices used to categorise the audit universe. Most IA units should, at a minimum, consider:
                    </p>
                    <ul className="list-disc list-inside space-y-2">
                        <li>Organisational structure (e.g., Departments, Divisions, Units, Stand-alone Projects)</li>
                        <li>Common processes (e.g., Payments, Receipts, Asset Management, Procurement, Contracting, Inventory, Human Resource Management)</li>
                        <li>Location (e.g., Headquarters, Regional offices, Local offices)</li>
                        <li>Operational programmes (e.g., for a transport agency: construction of roads, maintenance, licensing, and collection of fines)</li>
                        <li>Service lines (e.g., for a social security department: services for the elderly, handicapped, or child care, often spanning multiple departments)</li>
                    </ul>
                </section>

                {/* Section: Example */}
                <section className="mb-8">
                    <h2 className="text-2xl font-semibold mb-4">Example – Internal Audit of the UN Food and Agriculture Organisation</h2>
                    <p>
                        In this example, the audit universe consists of around 100 auditable entities divided into 14 categories: Governance; Reforms; Strategic Management; Special Initiatives/Projects; Planning and Budgeting; Field Programme Cycle; Decentralized Offices; Information Systems and Technology; Knowledge and Communication; Safety and Security; Human Resources; Financial Management; Procurement, Property and Facilities Management; and Administrative and Other Services.
                    </p>
                </section>

                {/* Section: Information Sources */}
                <section className="mb-8">
                    <h2 className="text-2xl font-semibold mb-4">Possible Information Sources for Categorizing the Audit Universe</h2>
                    <ul className="list-disc list-inside space-y-2 mb-4">
                        <li>Management information detailing goals, objectives, and targets</li>
                        <li>Guides to the organisation’s services</li>
                        <li>Organisational charts or office directories</li>
                        <li>Annual reports and performance targets</li>
                        <li>Corporate and departmental plans, business plans</li>
                        <li>Development plans for IT, infrastructure, and buildings</li>
                        <li>Budgets</li>
                        <li>External audit, consultancy, inspection, and review reports</li>
                        <li>Existing operational and strategic audit plans</li>
                    </ul>
                    <p>
                        Keep in mind, the categorisation of the audit universe should evolve as the planning process unfolds and as individual risks and opportunities are identified.
                    </p>
                </section>

                {/* Section: Senior Managers’ Opinions */}
                <section>
                    <h2 className="text-2xl font-semibold mb-4">Seek Senior Managers’ Opinions</h2>
                    <p className="mb-4">
                        Senior managers should be consulted to obtain their views on the importance of the systems identified, the existing controls, and the overall control environment. Discussions should focus on:
                    </p>
                    <ul className="list-disc list-inside space-y-2">
                        <li>Clarifying the organisation’s main objectives and departmental roles</li>
                        <li>Identifying the key risks faced in achieving both organisational and departmental objectives</li>
                        <li>Reviewing the results of internal and external audit work conducted during the year</li>
                        <li>Addressing any concerns over internal controls, operational efficiency, or assurance priorities</li>
                    </ul>
                </section>
            </div>
        </div>
    );
}
