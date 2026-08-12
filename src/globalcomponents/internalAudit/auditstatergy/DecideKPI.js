import React from 'react'

function DecideKPI() {
    return (
        <div>
            <p className="mb-4 text-sm text-gray-700">
                Please fill in the formula and comment for each KPI below.
            </p>

            {/* ---------- Internal Audit Planning Phase KPIs ---------- */}
            <div className="text-2xl font-bold text-blue-800 mb-6 border-b-2 border-blue-300 pb-2">
                Internal Audit Planning Phase KPIs
            </div>

            {/* KPI Row: Audit Plan Completion Rate */}
            <div className="flex flex-col md:flex-row md:items-center gap-4 border p-4 rounded mb-4">
                <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-600">
                        Audit Plan Completion Rate
                    </label>
                    <p className="text-gray-800 font-semibold">
                        Audit Plan Completion Rate
                    </p>
                </div>
                <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-600">
                        Formula
                    </label>
                    <input
                        type="text"
                        placeholder="(# of audits completed ÷ # of planned audits) × 100"
                        defaultValue=""
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                </div>
                <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-600">
                        Comment
                    </label>
                    <input
                        type="text"
                        placeholder="Enter comment"
                        defaultValue=""
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                </div>
            </div>

            {/* KPI Row: Risk Coverage */}
            <div className="flex flex-col md:flex-row md:items-center gap-4 border p-4 rounded mb-4">
                <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-600">
                        Risk Coverage
                    </label>
                    <p className="text-gray-800 font-semibold">Risk Coverage</p>
                </div>
                <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-600">
                        Formula
                    </label>
                    <input
                        type="text"
                        placeholder="(# of high-risk areas covered ÷ # of total high-risk areas) × 100"
                        defaultValue=""
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                </div>
                <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-600">
                        Comment
                    </label>
                    <input
                        type="text"
                        placeholder="Enter comment"
                        defaultValue=""
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                </div>
            </div>

            {/* KPI Row: Audit Resource Utilization */}
            <div className="flex flex-col md:flex-row md:items-center gap-4 border p-4 rounded mb-4">
                <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-600">
                        Audit Resource Utilization
                    </label>
                    <p className="text-gray-800 font-semibold">
                        Audit Resource Utilization
                    </p>
                </div>
                <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-600">
                        Formula
                    </label>
                    <input
                        type="text"
                        placeholder="(Allocated audit resources ÷ Total available resources) × 100"
                        defaultValue=""
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                </div>
                <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-600">
                        Comment
                    </label>
                    <input
                        type="text"
                        placeholder="Enter comment"
                        defaultValue=""
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                </div>
            </div>

            {/* KPI Row: Stakeholder Engagement */}
            <div className="flex flex-col md:flex-row md:items-center gap-4 border p-4 rounded mb-4">
                <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-600">
                        Stakeholder Engagement
                    </label>
                    <p className="text-gray-800 font-semibold">
                        Stakeholder Engagement
                    </p>
                </div>
                <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-600">
                        Formula
                    </label>
                    <input
                        type="text"
                        placeholder="(# of stakeholder meetings held ÷ # of planned meetings) × 100"
                        defaultValue=""
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                </div>
                <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-600">
                        Comment
                    </label>
                    <input
                        type="text"
                        placeholder="Enter comment"
                        defaultValue=""
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                </div>
            </div>

            {/* KPI Row: Audit Scope Adjustments */}
            <div className="flex flex-col md:flex-row md:items-center gap-4 border p-4 rounded">
                <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-600">
                        Audit Scope Adjustments
                    </label>
                    <p className="text-gray-800 font-semibold">
                        Audit Scope Adjustments
                    </p>
                </div>
                <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-600">
                        Formula
                    </label>
                    <input
                        type="text"
                        placeholder="(# of scope changes after planning ÷ total scope changes) × 100"
                        defaultValue=""
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                </div>
                <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-600">
                        Comment
                    </label>
                    <input
                        type="text"
                        placeholder="Enter comment"
                        defaultValue=""
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                </div>
            </div>

            {/* ---------- Fieldwork Phase KPIs ---------- */}
            <div className="text-2xl font-bold text-blue-800 mb-6 border-b-2 border-blue-300 pb-2 my-6">Fieldwork Phase KPIs</div>

            {/* KPI Row: Fieldwork Completion Time */}
            <div className="flex flex-col md:flex-row md:items-center gap-4 border p-4 rounded mb-4">
                <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-600">
                        Fieldwork Completion Time
                    </label>
                    <p className="text-gray-800 font-semibold">
                        Fieldwork Completion Time
                    </p>
                </div>
                <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-600">
                        Formula
                    </label>
                    <input
                        type="text"
                        placeholder="(Actual fieldwork time ÷ Planned fieldwork time) × 100"
                        defaultValue=""
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                </div>
                <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-600">
                        Comment
                    </label>
                    <input
                        type="text"
                        placeholder="Enter comment"
                        defaultValue=""
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                </div>
            </div>

            {/* KPI Row: Findings per Audit */}
            <div className="flex flex-col md:flex-row md:items-center gap-4 border p-4 rounded mb-4">
                <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-600">
                        Findings per Audit
                    </label>
                    <p className="text-gray-800 font-semibold">Findings per Audit</p>
                </div>
                <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-600">
                        Formula
                    </label>
                    <input
                        type="text"
                        placeholder="(Total findings ÷ Total number of audits)"
                        defaultValue=""
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                </div>
                <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-600">
                        Comment
                    </label>
                    <input
                        type="text"
                        placeholder="Enter comment"
                        defaultValue=""
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                </div>
            </div>

            {/* KPI Row: Number of Issues Resolved During Fieldwork */}
            <div className="flex flex-col md:flex-row md:items-center gap-4 border p-4 rounded mb-4">
                <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-600">
                        Number of Issues Resolved During Fieldwork
                    </label>
                    <p className="text-gray-800 font-semibold">
                        Issues Resolved During Fieldwork
                    </p>
                </div>
                <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-600">
                        Formula
                    </label>
                    <input
                        type="text"
                        placeholder="(Issues resolved ÷ Issues identified) × 100"
                        defaultValue=""
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                </div>
                <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-600">
                        Comment
                    </label>
                    <input
                        type="text"
                        placeholder="Enter comment"
                        defaultValue=""
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                </div>
            </div>

            {/* KPI Row: Audit Efficiency */}
            <div className="flex flex-col md:flex-row md:items-center gap-4 border p-4 rounded mb-4">
                <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-600">
                        Audit Efficiency
                    </label>
                    <p className="text-gray-800 font-semibold">Audit Efficiency</p>
                </div>
                <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-600">
                        Formula
                    </label>
                    <input
                        type="text"
                        placeholder="(Audits completed on time & within budget ÷ total audits) × 100"
                        defaultValue=""
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                </div>
                <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-600">
                        Comment
                    </label>
                    <input
                        type="text"
                        placeholder="Enter comment"
                        defaultValue=""
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                </div>
            </div>

            {/* KPI Row: Team Productivity */}
            <div className="flex flex-col md:flex-row md:items-center gap-4 border p-4 rounded">
                <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-600">
                        Team Productivity
                    </label>
                    <p className="text-gray-800 font-semibold">Team Productivity</p>
                </div>
                <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-600">
                        Formula
                    </label>
                    <input
                        type="text"
                        placeholder="(Total fieldwork hours ÷ Number of auditors)"
                        defaultValue=""
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                </div>
                <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-600">
                        Comment
                    </label>
                    <input
                        type="text"
                        placeholder="Enter comment"
                        defaultValue=""
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                </div>
            </div>

            {/* ---------- Reporting Phase KPIs ---------- */}
            <div className="text-2xl font-bold text-blue-800 mb-6 border-b-2 border-blue-300 pb-2 my-6">Reporting Phase KPIs</div>

            {/* KPI Row: Report Delivery Time */}
            <div className="flex flex-col md:flex-row md:items-center gap-4 border p-4 rounded mb-4">
                <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-600">
                        Report Delivery Time
                    </label>
                    <p className="text-gray-800 font-semibold">Report Delivery Time</p>
                </div>
                <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-600">
                        Formula
                    </label>
                    <input
                        type="text"
                        placeholder="(Avg. time from completion of fieldwork to final delivery ÷ total # of audits)"
                        defaultValue=""
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                </div>
                <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-600">
                        Comment
                    </label>
                    <input
                        type="text"
                        placeholder="Enter comment"
                        defaultValue=""
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                </div>
            </div>

            {/* KPI Row: Audit Report Quality */}
            <div className="flex flex-col md:flex-row md:items-center gap-4 border p-4 rounded mb-4">
                <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-600">
                        Audit Report Quality
                    </label>
                    <p className="text-gray-800 font-semibold">Audit Report Quality</p>
                </div>
                <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-600">
                        Formula
                    </label>
                    <input
                        type="text"
                        placeholder="(# of reports requiring revisions ÷ total # of reports) × 100"
                        defaultValue=""
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                </div>
                <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-600">
                        Comment
                    </label>
                    <input
                        type="text"
                        placeholder="Enter comment"
                        defaultValue=""
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                </div>
            </div>

            {/* KPI Row: Management Response Time */}
            <div className="flex flex-col md:flex-row md:items-center gap-4 border p-4 rounded mb-4">
                <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-600">
                        Management Response Time
                    </label>
                    <p className="text-gray-800 font-semibold">
                        Management Response Time
                    </p>
                </div>
                <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-600">
                        Formula
                    </label>
                    <input
                        type="text"
                        placeholder="(Total time for mgmt to respond ÷ # of audits) × 100"
                        defaultValue=""
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                </div>
                <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-600">
                        Comment
                    </label>
                    <input
                        type="text"
                        placeholder="Enter comment"
                        defaultValue=""
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                </div>
            </div>

            {/* KPI Row: Action Plan Implementation Rate */}
            <div className="flex flex-col md:flex-row md:items-center gap-4 border p-4 rounded mb-4">
                <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-600">
                        Action Plan Implementation Rate
                    </label>
                    <p className="text-gray-800 font-semibold">
                        Action Plan Implementation Rate
                    </p>
                </div>
                <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-600">
                        Formula
                    </label>
                    <input
                        type="text"
                        placeholder="(# implemented recommendations ÷ total # of recommendations) × 100"
                        defaultValue=""
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                </div>
                <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-600">
                        Comment
                    </label>
                    <input
                        type="text"
                        placeholder="Enter comment"
                        defaultValue=""
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                </div>
            </div>

            {/* KPI Row: Audit Report Client Satisfaction */}
            <div className="flex flex-col md:flex-row md:items-center gap-4 border p-4 rounded mb-8">
                <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-600">
                        Audit Report Client Satisfaction
                    </label>
                    <p className="text-gray-800 font-semibold">
                        Audit Report Client Satisfaction
                    </p>
                </div>
                <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-600">
                        Formula
                    </label>
                    <input
                        type="text"
                        placeholder="(# satisfied responses ÷ total # of survey responses) × 100"
                        defaultValue=""
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                </div>
                <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-600">
                        Comment
                    </label>
                    <input
                        type="text"
                        placeholder="Enter comment"
                        defaultValue=""
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                </div>
            </div>

            {/* ---------- Issues Management KPIs ---------- */}
            <div className="text-2xl font-bold text-blue-800 mb-6 border-b-2 border-blue-300 pb-2 my-6">Issues Management KPIs</div>

            {/* KPI Row: Issue Resolution Rate */}
            <div className="flex flex-col md:flex-row md:items-center gap-4 border p-4 rounded mb-4">
                <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-600">
                        Issue Resolution Rate
                    </label>
                    <p className="text-gray-800 font-semibold">Issue Resolution Rate</p>
                </div>
                <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-600">
                        Formula
                    </label>
                    <input
                        type="text"
                        placeholder="(# issues resolved within timeline ÷ total # issues) × 100"
                        defaultValue=""
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                </div>
                <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-600">
                        Comment
                    </label>
                    <input
                        type="text"
                        placeholder="Enter comment"
                        defaultValue=""
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                </div>
            </div>

            {/* KPI Row: Repeat Issues */}
            <div className="flex flex-col md:flex-row md:items-center gap-4 border p-4 rounded mb-4">
                <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-600">
                        Repeat Issues
                    </label>
                    <p className="text-gray-800 font-semibold">Repeat Issues</p>
                </div>
                <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-600">
                        Formula
                    </label>
                    <input
                        type="text"
                        placeholder="(# of repeat issues ÷ total # of issues) × 100"
                        defaultValue=""
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                </div>
                <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-600">
                        Comment
                    </label>
                    <input
                        type="text"
                        placeholder="Enter comment"
                        defaultValue=""
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                </div>
            </div>

            {/* KPI Row: Severity of Issues */}
            <div className="flex flex-col md:flex-row md:items-center gap-4 border p-4 rounded mb-4">
                <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-600">
                        Severity of Issues
                    </label>
                    <p className="text-gray-800 font-semibold">Severity of Issues</p>
                </div>
                <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-600">
                        Formula
                    </label>
                    <input
                        type="text"
                        placeholder="(# high-severity issues ÷ total # issues) × 100"
                        defaultValue=""
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                </div>
                <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-600">
                        Comment
                    </label>
                    <input
                        type="text"
                        placeholder="Enter comment"
                        defaultValue=""
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                </div>
            </div>

            {/* KPI Row: Outstanding Issues */}
            <div className="flex flex-col md:flex-row md:items-center gap-4 border p-4 rounded mb-4">
                <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-600">
                        Outstanding Issues
                    </label>
                    <p className="text-gray-800 font-semibold">Outstanding Issues</p>
                </div>
                <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-600">
                        Formula
                    </label>
                    <input
                        type="text"
                        placeholder="(# of unresolved issues ÷ total # issues) × 100"
                        defaultValue=""
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                </div>
                <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-600">
                        Comment
                    </label>
                    <input
                        type="text"
                        placeholder="Enter comment"
                        defaultValue=""
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                </div>
            </div>

            {/* KPI Row: Root Cause Analysis Completion Rate */}
            <div className="flex flex-col md:flex-row md:items-center gap-4 border p-4 rounded mb-4">
                <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-600">
                        Root Cause Analysis Completion Rate
                    </label>
                    <p className="text-gray-800 font-semibold">
                        Root Cause Analysis Completion Rate
                    </p>
                </div>
                <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-600">
                        Formula
                    </label>
                    <input
                        type="text"
                        placeholder="(# issues with root cause analysis ÷ total # issues) × 100"
                        defaultValue=""
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                </div>
                <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-600">
                        Comment
                    </label>
                    <input
                        type="text"
                        placeholder="Enter comment"
                        defaultValue=""
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                </div>
            </div>

            {/* KPI Row: Follow-up Completion Rate */}
            <div className="flex flex-col md:flex-row md:items-center gap-4 border p-4 rounded mb-8">
                <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-600">
                        Follow-up Completion Rate
                    </label>
                    <p className="text-gray-800 font-semibold">
                        Follow-up Completion Rate
                    </p>
                </div>
                <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-600">
                        Formula
                    </label>
                    <input
                        type="text"
                        placeholder="(# follow-ups completed on time ÷ total follow-ups due) × 100"
                        defaultValue=""
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                </div>
                <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-600">
                        Comment
                    </label>
                    <input
                        type="text"
                        placeholder="Enter comment"
                        defaultValue=""
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                </div>
            </div>

            {/* ---------- Overall Internal Audit Effectiveness KPIs ---------- */}
            <div className="text-2xl font-bold text-blue-800 mb-6 border-b-2 border-blue-300 pb-2 my-6">
                Overall Internal Audit Effectiveness KPIs
            </div>

            {/* KPI Row: Audit Coverage */}
            <div className="flex flex-col md:flex-row md:items-center gap-4 border p-4 rounded mb-4">
                <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-600">
                        Audit Coverage
                    </label>
                    <p className="text-gray-800 font-semibold">Audit Coverage</p>
                </div>
                <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-600">
                        Formula
                    </label>
                    <input
                        type="text"
                        placeholder="(# total processes audited ÷ total processes in the org) × 100"
                        defaultValue=""
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                </div>
                <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-600">
                        Comment
                    </label>
                    <input
                        type="text"
                        placeholder="Enter comment"
                        defaultValue=""
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                </div>
            </div>

            {/* KPI Row: Cost per Audit */}
            <div className="flex flex-col md:flex-row md:items-center gap-4 border p-4 rounded mb-4">
                <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-600">
                        Cost per Audit
                    </label>
                    <p className="text-gray-800 font-semibold">Cost per Audit</p>
                </div>
                <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-600">
                        Formula
                    </label>
                    <input
                        type="text"
                        placeholder="(Total audit cost ÷ # audits completed)"
                        defaultValue=""
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                </div>
                <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-600">
                        Comment
                    </label>
                    <input
                        type="text"
                        placeholder="Enter comment"
                        defaultValue=""
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                </div>
            </div>

            {/* KPI Row: Audit Impact */}
            <div className="flex flex-col md:flex-row md:items-center gap-4 border p-4 rounded">
                <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-600">
                        Audit Impact
                    </label>
                    <p className="text-gray-800 font-semibold">Audit Impact</p>
                </div>
                <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-600">
                        Formula
                    </label>
                    <input
                        type="text"
                        placeholder="(Value of improvements ÷ total audit costs)"
                        defaultValue=""
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                </div>
                <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-600">
                        Comment
                    </label>
                    <input
                        type="text"
                        placeholder="Enter comment"
                        defaultValue=""
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                </div>
            </div>
        </div>
    )
}

export default DecideKPI
