import React, { useState } from 'react'
import { FiEdit, FiTrash2, FiCheck, FiX } from 'react-icons/fi'

export default function ControlAssessmentEditableTable() {
    // Sample records; in production these can be fetched or passed as props.
    const [records, setRecords] = useState([
        {
            controlID: 'CID001',
            category: 'Finance',
            controlArea: 'Payments',
            controlType: 'Manual',
            controlAttribute: 'Effective',
            controlObjective: 'Ensure correct processing',
            controlDescription: 'Review all payment records monthly',
            applicableDivDept: 'Accounts',
            inherentRisk: 'High',
            testProcedures: 'Sample records',
            todAssessment: 'Pass',
            toeAssessment: 'Pass',
            gapsFindings: 'None',
            residualRisk: 'Low',
            gapsFindingsTicketNumber: 'GTN1001',
            remediationPlan: 'None required',
        },
    ])

    // Initial state for a new record (all 16 fields)
    const initialNewRecord = {
        controlID: '',
        category: '',
        controlArea: '',
        controlType: '',
        controlAttribute: '',
        controlObjective: '',
        controlDescription: '',
        applicableDivDept: '',
        inherentRisk: '',
        testProcedures: '',
        todAssessment: '',
        toeAssessment: '',
        gapsFindings: '',
        residualRisk: '',
        gapsFindingsTicketNumber: '',
        remediationPlan: '',
    }
    const [newRecord, setNewRecord] = useState(initialNewRecord)

    // States for inline editing of an existing record
    const [editingIndex, setEditingIndex] = useState(null)
    const [editedRecord, setEditedRecord] = useState({})

    // Table header titles (last title is for Actions)
    const headers = [
        'Control ID',
        'Category',
        'Control Area',
        'Control Type',
        'Control Attribute',
        'Control Objective',
        'Control Description',
        'Applicable Div/Dept',
        'Inherent Risk',
        'Test Procedures',
        'TOD Assessment',
        'TOE Assessment',
        'Gaps/Findings',
        'Residual Risk',
        'Gaps/Findings Ticket Number',
        'Remediation Plan',
        'Actions',
    ]

    // Handler for changes in the new record form (above the table)
    const handleNewRecordChange = (e) => {
        const { name, value } = e.target
        setNewRecord((prev) => ({ ...prev, [name]: value }))
    }

    // Handler to add new record from the form above the table
    const handleAddNewRecord = () => {
        if (!newRecord.controlID.trim()) {
            alert('Control ID is required.')
            return
        }
        setRecords((prev) => [...prev, newRecord])
        setNewRecord(initialNewRecord)
    }

    // Handlers for inline editing of existing records
    const handleEditClick = (index) => {
        setEditingIndex(index)
        setEditedRecord({ ...records[index] })
    }

    const handleEditedRecordChange = (e) => {
        const { name, value } = e.target
        setEditedRecord((prev) => ({ ...prev, [name]: value }))
    }

    const handleSaveEditedRecord = (index) => {
        if (editedRecord.controlID.trim() === '') {
            alert('Control ID is required.')
            return
        }
        setRecords((prevRecords) =>
            prevRecords.map((rec, idx) => (idx === index ? editedRecord : rec))
        )
        setEditingIndex(null)
        setEditedRecord({})
    }

    const handleCancelEdit = () => {
        setEditingIndex(null)
        setEditedRecord({})
    }

    const handleDeleteRecord = (index) => {
        setRecords((prevRecords) => prevRecords.filter((_, idx) => idx !== index))
    }

    return (
        <div className=" space-y-6">

            {/* Input Form for Adding New Record (above the table) */}
            <div className="p-4 bg-gray-50 rounded-md border">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-700">Control ID</label>
                        <input
                            type="text"
                            name="controlID"
                            value={newRecord.controlID}
                            onChange={handleNewRecordChange}
                            placeholder="Enter Control ID"
                            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring focus:ring-blue-200"
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-700">Category</label>
                        <input
                            type="text"
                            name="category"
                            value={newRecord.category}
                            onChange={handleNewRecordChange}
                            placeholder="Enter Category"
                            className="w-full p-2 border border-gray-300 rounded"
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-700">Control Area</label>
                        <input
                            type="text"
                            name="controlArea"
                            value={newRecord.controlArea}
                            onChange={handleNewRecordChange}
                            placeholder="Enter Control Area"
                            className="w-full p-2 border border-gray-300 rounded"
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-700">Control Type</label>
                        <input
                            type="text"
                            name="controlType"
                            value={newRecord.controlType}
                            onChange={handleNewRecordChange}
                            placeholder="Enter Control Type"
                            className="w-full p-2 border border-gray-300 rounded"
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-700">Control Attribute</label>
                        <input
                            type="text"
                            name="controlAttribute"
                            value={newRecord.controlAttribute}
                            onChange={handleNewRecordChange}
                            placeholder="Enter Control Attribute"
                            className="w-full p-2 border border-gray-300 rounded"
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-700">Control Objective</label>
                        <input
                            type="text"
                            name="controlObjective"
                            value={newRecord.controlObjective}
                            onChange={handleNewRecordChange}
                            placeholder="Enter Control Objective"
                            className="w-full p-2 border border-gray-300 rounded"
                        />
                    </div>
                    <div className="space-y-1 lg:col-span-2">
                        <label className="text-sm font-medium text-gray-700">Control Description</label>
                        <input
                            type="text"
                            name="controlDescription"
                            value={newRecord.controlDescription}
                            onChange={handleNewRecordChange}
                            placeholder="Enter Control Description"
                            className="w-full p-2 border border-gray-300 rounded"
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-700">Applicable Div/Dept</label>
                        <input
                            type="text"
                            name="applicableDivDept"
                            value={newRecord.applicableDivDept}
                            onChange={handleNewRecordChange}
                            placeholder="Enter Applicable Div/Dept"
                            className="w-full p-2 border border-gray-300 rounded"
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-700">Inherent Risk</label>
                        <input
                            type="text"
                            name="inherentRisk"
                            value={newRecord.inherentRisk}
                            onChange={handleNewRecordChange}
                            placeholder="Enter Inherent Risk"
                            className="w-full p-2 border border-gray-300 rounded"
                        />
                    </div>
                    <div className="space-y-1 lg:col-span-2">
                        <label className="text-sm font-medium text-gray-700">Test Procedures</label>
                        <input
                            type="text"
                            name="testProcedures"
                            value={newRecord.testProcedures}
                            onChange={handleNewRecordChange}
                            placeholder="Enter Test Procedures"
                            className="w-full p-2 border border-gray-300 rounded"
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-700">TOD Assessment</label>
                        <input
                            type="text"
                            name="todAssessment"
                            value={newRecord.todAssessment}
                            onChange={handleNewRecordChange}
                            placeholder="Enter TOD Assessment"
                            className="w-full p-2 border border-gray-300 rounded"
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-700">TOE Assessment</label>
                        <input
                            type="text"
                            name="toeAssessment"
                            value={newRecord.toeAssessment}
                            onChange={handleNewRecordChange}
                            placeholder="Enter TOE Assessment"
                            className="w-full p-2 border border-gray-300 rounded"
                        />
                    </div>
                    <div className="space-y-1 lg:col-span-2">
                        <label className="text-sm font-medium text-gray-700">Gaps/Findings</label>
                        <input
                            type="text"
                            name="gapsFindings"
                            value={newRecord.gapsFindings}
                            onChange={handleNewRecordChange}
                            placeholder="Enter Gaps/Findings"
                            className="w-full p-2 border border-gray-300 rounded"
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-700">Residual Risk</label>
                        <input
                            type="text"
                            name="residualRisk"
                            value={newRecord.residualRisk}
                            onChange={handleNewRecordChange}
                            placeholder="Enter Residual Risk"
                            className="w-full p-2 border border-gray-300 rounded"
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-700">Gaps/Findings Ticket Number</label>
                        <input
                            type="text"
                            name="gapsFindingsTicketNumber"
                            value={newRecord.gapsFindingsTicketNumber}
                            onChange={handleNewRecordChange}
                            placeholder="Enter Ticket Number"
                            className="w-full p-2 border border-gray-300 rounded"
                        />
                    </div>
                    <div className="space-y-1 lg:col-span-2">
                        <label className="text-sm font-medium text-gray-700">Remediation Plan</label>
                        <input
                            type="text"
                            name="remediationPlan"
                            value={newRecord.remediationPlan}
                            onChange={handleNewRecordChange}
                            placeholder="Enter Remediation Plan"
                            className="w-full p-2 border border-gray-300 rounded"
                        />
                    </div>
                </div>
                <div className="text-right mt-4">
                    <button
                        onClick={handleAddNewRecord}
                        className="bg-green-600 text-white px-4 py-2 rounded shadow hover:bg-green-700 transition"
                    >
                        Add New Record
                    </button>
                </div>
            </div>

            {/* Display Table */}
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
                        {records.length > 0 ? (
                            records.map((record, index) => (
                                <tr key={index} className="text-center hover:bg-gray-50 transition">
                                    {editingIndex === index ? (
                                        <>
                                            <td className="px-6 py-3 border">
                                                <input
                                                    type="text"
                                                    name="controlID"
                                                    value={editedRecord.controlID}
                                                    onChange={handleEditedRecordChange}
                                                    className="w-full border rounded-md px-2 py-1"
                                                />
                                            </td>
                                            <td className="px-6 py-3 border">
                                                <input
                                                    type="text"
                                                    name="category"
                                                    value={editedRecord.category}
                                                    onChange={handleEditedRecordChange}
                                                    className="w-full border rounded-md px-2 py-1"
                                                />
                                            </td>
                                            <td className="px-6 py-3 border">
                                                <input
                                                    type="text"
                                                    name="controlArea"
                                                    value={editedRecord.controlArea}
                                                    onChange={handleEditedRecordChange}
                                                    className="w-full border rounded-md px-2 py-1"
                                                />
                                            </td>
                                            <td className="px-6 py-3 border">
                                                <input
                                                    type="text"
                                                    name="controlType"
                                                    value={editedRecord.controlType}
                                                    onChange={handleEditedRecordChange}
                                                    className="w-full border rounded-md px-2 py-1"
                                                />
                                            </td>
                                            <td className="px-6 py-3 border">
                                                <input
                                                    type="text"
                                                    name="controlAttribute"
                                                    value={editedRecord.controlAttribute}
                                                    onChange={handleEditedRecordChange}
                                                    className="w-full border rounded-md px-2 py-1"
                                                />
                                            </td>
                                            <td className="px-6 py-3 border">
                                                <input
                                                    type="text"
                                                    name="controlObjective"
                                                    value={editedRecord.controlObjective}
                                                    onChange={handleEditedRecordChange}
                                                    className="w-full border rounded-md px-2 py-1"
                                                />
                                            </td>
                                            <td className="px-6 py-3 border">
                                                <input
                                                    type="text"
                                                    name="controlDescription"
                                                    value={editedRecord.controlDescription}
                                                    onChange={handleEditedRecordChange}
                                                    className="w-full border rounded-md px-2 py-1"
                                                />
                                            </td>
                                            <td className="px-6 py-3 border">
                                                <input
                                                    type="text"
                                                    name="applicableDivDept"
                                                    value={editedRecord.applicableDivDept}
                                                    onChange={handleEditedRecordChange}
                                                    className="w-full border rounded-md px-2 py-1"
                                                />
                                            </td>
                                            <td className="px-6 py-3 border">
                                                <input
                                                    type="text"
                                                    name="inherentRisk"
                                                    value={editedRecord.inherentRisk}
                                                    onChange={handleEditedRecordChange}
                                                    className="w-full border rounded-md px-2 py-1"
                                                />
                                            </td>
                                            <td className="px-6 py-3 border">
                                                <input
                                                    type="text"
                                                    name="testProcedures"
                                                    value={editedRecord.testProcedures}
                                                    onChange={handleEditedRecordChange}
                                                    className="w-full border rounded-md px-2 py-1"
                                                />
                                            </td>
                                            <td className="px-6 py-3 border">
                                                <input
                                                    type="text"
                                                    name="todAssessment"
                                                    value={editedRecord.todAssessment}
                                                    onChange={handleEditedRecordChange}
                                                    className="w-full border rounded-md px-2 py-1"
                                                />
                                            </td>
                                            <td className="px-6 py-3 border">
                                                <input
                                                    type="text"
                                                    name="toeAssessment"
                                                    value={editedRecord.toeAssessment}
                                                    onChange={handleEditedRecordChange}
                                                    className="w-full border rounded-md px-2 py-1"
                                                />
                                            </td>
                                            <td className="px-6 py-3 border">
                                                <input
                                                    type="text"
                                                    name="gapsFindings"
                                                    value={editedRecord.gapsFindings}
                                                    onChange={handleEditedRecordChange}
                                                    className="w-full border rounded-md px-2 py-1"
                                                />
                                            </td>
                                            <td className="px-6 py-3 border">
                                                <input
                                                    type="text"
                                                    name="residualRisk"
                                                    value={editedRecord.residualRisk}
                                                    onChange={handleEditedRecordChange}
                                                    className="w-full border rounded-md px-2 py-1"
                                                />
                                            </td>
                                            <td className="px-6 py-3 border">
                                                <input
                                                    type="text"
                                                    name="gapsFindingsTicketNumber"
                                                    value={editedRecord.gapsFindingsTicketNumber}
                                                    onChange={handleEditedRecordChange}
                                                    className="w-full border rounded-md px-2 py-1"
                                                />
                                            </td>
                                            <td className="px-6 py-3 border">
                                                <input
                                                    type="text"
                                                    name="remediationPlan"
                                                    value={editedRecord.remediationPlan}
                                                    onChange={handleEditedRecordChange}
                                                    className="w-full border rounded-md px-2 py-1"
                                                />
                                            </td>
                                            <td className="px-6 py-3 border">
                                                <div className="flex gap-2 justify-center">
                                                    <button
                                                        onClick={() => handleSaveEditedRecord(index)}
                                                        className="flex items-center px-3 py-1 bg-blue-600 text-white rounded-md shadow hover:bg-blue-700 transition duration-200"
                                                    >
                                                        <FiCheck size={18} />
                                                    </button>
                                                    <button
                                                        onClick={handleCancelEdit}
                                                        className="flex items-center px-3 py-1 bg-gray-300 text-gray-700 rounded-md shadow hover:bg-gray-400 transition duration-200"
                                                    >
                                                        <FiX size={18} />
                                                    </button>
                                                </div>
                                            </td>
                                        </>
                                    ) : (
                                        <>
                                            <td className="px-6 py-3 border">{record.controlID}</td>
                                            <td className="px-6 py-3 border">{record.category}</td>
                                            <td className="px-6 py-3 border">{record.controlArea}</td>
                                            <td className="px-6 py-3 border">{record.controlType}</td>
                                            <td className="px-6 py-3 border">{record.controlAttribute}</td>
                                            <td className="px-6 py-3 border">{record.controlObjective}</td>
                                            <td className="px-6 py-3 border">{record.controlDescription}</td>
                                            <td className="px-6 py-3 border">{record.applicableDivDept}</td>
                                            <td className="px-6 py-3 border">{record.inherentRisk}</td>
                                            <td className="px-6 py-3 border">{record.testProcedures}</td>
                                            <td className="px-6 py-3 border">{record.todAssessment}</td>
                                            <td className="px-6 py-3 border">{record.toeAssessment}</td>
                                            <td className="px-6 py-3 border">{record.gapsFindings}</td>
                                            <td className="px-6 py-3 border">{record.residualRisk}</td>
                                            <td className="px-6 py-3 border">{record.gapsFindingsTicketNumber}</td>
                                            <td className="px-6 py-3 border">{record.remediationPlan}</td>
                                            <td className="px-6 py-3 border">
                                                <div className="flex gap-2 justify-center">
                                                    <button
                                                        onClick={() => handleEditClick(index)}
                                                        className="flex items-center px-3 py-1 bg-yellow-500 text-white rounded-md shadow hover:bg-yellow-600 transition duration-200"
                                                    >
                                                        <FiEdit size={18} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteRecord(index)}
                                                        className="flex items-center px-3 py-1 bg-red-600 text-white rounded-md shadow hover:bg-red-700 transition duration-200"
                                                    >
                                                        <FiTrash2 size={18} />
                                                    </button>
                                                </div>
                                            </td>
                                        </>
                                    )}
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={headers.length} className="px-6 py-3 text-sm text-gray-500 text-center">
                                    No Records Found
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
