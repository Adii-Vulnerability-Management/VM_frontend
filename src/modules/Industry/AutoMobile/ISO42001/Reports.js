// src/modules/Industry/AutoMobile/ISO42001/Reports.js
import React from "react";

export default function ISO42001Reports({ data = [] }) {
    const hasReports = false;

    return (
        <div className="p-6 bg-white rounded-lg shadow space-y-4">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-[#2B245C]">Reports</h1>
                <span className="text-sm bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                    Coming Soon
                </span>
            </div>

            {!hasReports ? (
                <p className="text-center text-gray-500 py-8">
                    No reports available yet. More coming soon!
                </p>
            ) : (
                <ul className="space-y-3">
                    {data.map((report) => (
                        <li key={report.id} className="border-b pb-2">
                            <a
                                href={report.url}
                                className="text-indigo-600 hover:underline font-medium"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                {report.title}
                            </a>
                            <p className="text-sm text-gray-600">{report.description}</p>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
