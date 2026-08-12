import React, { useState } from 'react'

function AuditTemplateSelector() {
    const [selectedTemplate, setSelectedTemplate] = useState('Internal Audit Template 1')

    const handleTemplateChange = (e) => {
        setSelectedTemplate(e.target.value)
    }

    return (
        <div>
            <h2 className="text-xl font-bold text-gray-800 mb-4">Select Audit Template</h2>
            <select
                value={selectedTemplate}
                onChange={handleTemplateChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:ring-blue-200"
            >
                <option value="Internal Audit Template 1">Internal Audit Template 1</option>
                <option value="Internal Audit Template 2">Internal Audit Template 2</option>
                <option value="Internal Audit Template 3">Internal Audit Template 3</option>
            </select>
        </div>
    )
}

export default AuditTemplateSelector
