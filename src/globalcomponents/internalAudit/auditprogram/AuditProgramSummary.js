import React, { useState } from 'react'

function AuditProgramSummary() {
    // State to hold form data with a single purpose field.
    const [formData, setFormData] = useState({
        subject: '',
        process: '',
        scope: '',
        objectives: '',
        purpose: ''
    })

    // Generic change handler for inputs and textareas.
    const handleInputChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    return (
        <div className="space-y-4">
            <form className="space-y-4">
                {/* Subject */}
                <div className="flex items-center">
                    <label htmlFor="subject" className="w-1/4 font-medium">
                        Subject:
                    </label>
                    <input
                        id="subject"
                        name="subject"
                        type="text"
                        value={formData.subject}
                        onChange={handleInputChange}
                        placeholder="Enter subject"
                        className="w-3/4 p-2 border border-gray-300 rounded"
                    />
                </div>

                {/* Process */}
                <div className="flex items-center">
                    <label htmlFor="process" className="w-1/4 font-medium">
                        Process:
                    </label>
                    <input
                        id="process"
                        name="process"
                        type="text"
                        value={formData.process}
                        onChange={handleInputChange}
                        placeholder="Enter process"
                        className="w-3/4 p-2 border border-gray-300 rounded"
                    />
                </div>

                {/* Scope */}
                <div className="flex items-center">
                    <label htmlFor="scope" className="w-1/4 font-medium">
                        Scope:
                    </label>
                    <textarea
                        id="scope"
                        name="scope"
                        value={formData.scope}
                        onChange={handleInputChange}
                        placeholder="Enter scope"
                        className="w-3/4 p-2 border border-gray-300 rounded"
                        rows="3"
                    />
                </div>

                {/* Objectives */}
                <div className="flex items-center">
                    <label htmlFor="objectives" className="w-1/4 font-medium">
                        Objectives:
                    </label>
                    <textarea
                        id="objectives"
                        name="objectives"
                        value={formData.objectives}
                        onChange={handleInputChange}
                        placeholder="Enter objectives"
                        className="w-3/4 p-2 border border-gray-300 rounded"
                        rows="3"
                    />
                </div>

                {/* Purpose */}
                <div className="flex items-center">
                    <label htmlFor="purpose" className="w-1/4 font-medium">
                        Purpose:
                    </label>
                    <textarea
                        id="purpose"
                        name="purpose"
                        value={formData.purpose}
                        onChange={handleInputChange}
                        placeholder="Enter purpose"
                        className="w-3/4 p-2 border border-gray-300 rounded"
                        rows="3"
                    />
                </div>
            </form>
        </div>
    )
}

export default AuditProgramSummary
