import React, { useState } from 'react'

function IndernalAuditSection({ title, icon: Icon, children }) {

    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <div className="rounded-md mb-4 border">
            <div
                className="flex items-center justify-between p-4 bg-blue-50 border-b cursor-pointer hover:bg-blue-100 transition-all"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <div className="flex items-center">
                    {Icon && <Icon size={20} className="text-blue-600 mr-2" />}
                    <h3 className="text-lg font-semibold text-blue-900">{title}</h3>
                </div>
                <button className="text-blue-600">
                    {isExpanded ? "▲" : "▼"}
                </button>
            </div>
            {isExpanded && <div className="p-4">{children}</div>}
        </div>
    )
}

export default IndernalAuditSection
