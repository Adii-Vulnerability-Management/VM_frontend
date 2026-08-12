import { useState } from 'react'
import RiskAssessmentTypeOne from './riskanaylysis/RiskAssessmentTypeTwo'
import RiskAssessment from './riskanaylysis/RiskAssesssmentTypeOne'
import RiskAssessmentTypeThree from './riskanaylysis/RiskAssessmentTypeThree'

export default function RiskAnalysis() {
    const [selectedType, setSelectedType] = useState('1')

    const handleTypeChange = (e) => {
        setSelectedType(e.target.value)
    }

    return (
        <div className="p-4 bg-white rounded-md shadow-md space-y-3">

            {/* Dropdown for selecting Risk Analysis Type */}
            <div className="flex items-center justify-end space-x-4">
                <label className="block text-sm font-medium text-gray-700" htmlFor="riskType">
                    Select Risk Analysis Type
                </label>
                <select
                    id="riskType"
                    value={selectedType}
                    onChange={handleTypeChange}
                    className="p-2 border border-gray-300 rounded focus:outline-none focus:ring focus:ring-blue-200"
                >
                    <option value="">-- select --</option>
                    <option value="1">Risk Analysis Type 1</option>
                    <option value="2">Risk Analysis Type 2</option>
                    <option value="3">Risk Analysis Type 3</option>
                </select>
            </div>

            {/* Conditionally Render the Steps for Type 1 */}
            {selectedType === '1' && (
                <RiskAssessment />
            )}

            {/* Display minimal placeholders for Type 2 and Type 3 */}
            {selectedType === '2' && (
                <RiskAssessmentTypeOne />
            )}
            {selectedType === '3' && (
                <RiskAssessmentTypeThree />
            )}
        </div>
    )
}
