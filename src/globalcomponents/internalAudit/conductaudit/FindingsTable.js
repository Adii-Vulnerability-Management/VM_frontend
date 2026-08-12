import React, { useState } from 'react'

export default function FindingsTable() {
    // Sample findings data; replace this with your dynamic data as required.
    const [findings, setFindings] = useState([
        {
            findingNo: 'F-001',
            findingID: 'ID-001',
            findingName: 'Missing Invoice',
            description: 'Invoice missing for the month of May.',
            status: 'Open',
        },
        {
            findingNo: 'F-002',
            findingID: 'ID-002',
            findingName: 'Late Submission',
            description: 'Quarterly report was submitted late.',
            status: 'Closed',
        },
        {
            findingNo: 'F-003',
            findingID: 'ID-003',
            findingName: 'Data Inaccuracy',
            description: 'Discrepancies found in ledger entries.',
            status: 'Open',
        },
    ])

    const headers = [
        'Finding No',
        'Finding ID',
        'Finding Name',
        'Description',
        'Status',
        'Action',
    ]

    return (
        <div className="overflow-x-auto rounded-xl">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-[#1e284e]">
                    <tr className="text-center">
                        {headers.map((header) => (
                            <th
                                key={header}
                                className="px-6 py-3 text-sm font-semibold text-white tracking-wider border-b border-blue-700"
                            >
                                {header}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                    {findings.length > 0 ? (
                        findings.map((finding, index) => (
                            <tr key={index} className="text-center hover:bg-gray-50">
                                <td className="px-6 py-3 border text-sm text-gray-700">
                                    {finding.findingNo}
                                </td>
                                <td className="px-6 py-3 border text-sm text-gray-700">
                                    {finding.findingID}
                                </td>
                                <td className="px-6 py-3 border text-sm text-gray-700">
                                    {finding.findingName}
                                </td>
                                <td className="px-6 py-3 border text-sm text-gray-700">
                                    {finding.description}
                                </td>
                                <td className="px-6 py-3 border text-sm text-gray-700">
                                    {finding.status}
                                </td>
                                <td className="px-6 py-3 border text-sm text-gray-700">
                                    {/* Change the href or swap with a Link component if using a router */}
                                    <div
                                        className="text-blue-600 hover:text-blue-800"
                                    >
                                        link
                                    </div>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td
                                colSpan={headers.length}
                                className="px-6 py-3 text-sm text-gray-500 text-center"
                            >
                                No findings available.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    )
}
