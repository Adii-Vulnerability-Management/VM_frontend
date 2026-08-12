import React from 'react'

export default function HistoryInfo() {
    // In a real application, you might retrieve these values from props, context, or an API.
    const firstPublished = '1/1/2019 12:00 AM'
    const lastUpdated = '1/1/2019 12:00 AM'

    const handleViewHistoryLog = () => {
        alert('History log clicked. You might open a modal or navigate to a new page here.')
    }

    return (
        <div className="p-2 space-y-2">
            <div className="flex justify-between items-center">
                <div className="text-sm text-gray-700">
                    <span className="font-medium">First Published: </span>
                    {firstPublished}
                </div>
                <div className="text-sm text-gray-700">
                    <span className="font-medium">Last Updated: </span>
                    {lastUpdated}
                </div>
            </div>

            <div className="text-right">
                <button
                    onClick={handleViewHistoryLog}
                    className="text-blue-600 hover:text-blue-800 underline focus:outline-none"
                >
                    View History Log
                </button>
            </div>
        </div>
    )
}
