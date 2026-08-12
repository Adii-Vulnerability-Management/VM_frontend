import React, { useState } from 'react'
import { FaEdit, FaTrash, FaSave, FaTimes } from 'react-icons/fa'

export default function AuditProcessSection() {
    // Single field: Audit Process
    const [auditProcess, setAuditProcess] = useState('')

    // Process Owner
    const [processOwner, setProcessOwner] = useState('')
    const [owners, setOwners] = useState([])

    // Process Input
    const [processInput, setProcessInput] = useState('')
    const [inputs, setInputs] = useState([])

    // Process Output
    const [processOutput, setProcessOutput] = useState('')
    const [outputs, setOutputs] = useState([])

    // Process Outcomes
    const [processOutcomes, setProcessOutcomes] = useState('')
    const [outcomes, setOutcomes] = useState([])

    // Edit state for Process Owner
    const [editOwnerIndex, setEditOwnerIndex] = useState(null)
    const [editOwnerValue, setEditOwnerValue] = useState('')

    // Edit state for Process Input
    const [editInputIndex, setEditInputIndex] = useState(null)
    const [editInputValue, setEditInputValue] = useState('')

    // Edit state for Process Output
    const [editOutputIndex, setEditOutputIndex] = useState(null)
    const [editOutputValue, setEditOutputValue] = useState('')

    // Edit state for Process Outcomes
    const [editOutcomeIndex, setEditOutcomeIndex] = useState(null)
    const [editOutcomeValue, setEditOutcomeValue] = useState('')

    // Handlers to add items to each list
    const handleAddOwner = () => {
        if (processOwner.trim()) {
            setOwners(prev => [...prev, processOwner.trim()])
            setProcessOwner('')
        }
    }

    const handleAddInput = () => {
        if (processInput.trim()) {
            setInputs(prev => [...prev, processInput.trim()])
            setProcessInput('')
        }
    }

    const handleAddOutput = () => {
        if (processOutput.trim()) {
            setOutputs(prev => [...prev, processOutput.trim()])
            setProcessOutput('')
        }
    }

    const handleAddOutcome = () => {
        if (processOutcomes.trim()) {
            setOutcomes(prev => [...prev, processOutcomes.trim()])
            setProcessOutcomes('')
        }
    }

    // --- Process Owner Editing ---
    const handleEditOwner = (index) => {
        setEditOwnerIndex(index)
        setEditOwnerValue(owners[index])
    }

    const handleSaveOwner = (index) => {
        if (editOwnerValue.trim() !== '') {
            const updatedOwners = owners.map((item, idx) =>
                idx === index ? editOwnerValue.trim() : item
            )
            setOwners(updatedOwners)
            setEditOwnerIndex(null)
            setEditOwnerValue('')
        }
    }

    const handleCancelOwnerEdit = () => {
        setEditOwnerIndex(null)
        setEditOwnerValue('')
    }

    const handleDeleteOwner = (index) => {
        setOwners(owners.filter((_, idx) => idx !== index))
    }

    // --- Process Input Editing ---
    const handleEditInput = (index) => {
        setEditInputIndex(index)
        setEditInputValue(inputs[index])
    }

    const handleSaveInput = (index) => {
        if (editInputValue.trim() !== '') {
            const updatedInputs = inputs.map((item, idx) =>
                idx === index ? editInputValue.trim() : item
            )
            setInputs(updatedInputs)
            setEditInputIndex(null)
            setEditInputValue('')
        }
    }

    const handleCancelInputEdit = () => {
        setEditInputIndex(null)
        setEditInputValue('')
    }

    const handleDeleteInput = (index) => {
        setInputs(inputs.filter((_, idx) => idx !== index))
    }

    // --- Process Output Editing ---
    const handleEditOutput = (index) => {
        setEditOutputIndex(index)
        setEditOutputValue(outputs[index])
    }

    const handleSaveOutput = (index) => {
        if (editOutputValue.trim() !== '') {
            const updatedOutputs = outputs.map((item, idx) =>
                idx === index ? editOutputValue.trim() : item
            )
            setOutputs(updatedOutputs)
            setEditOutputIndex(null)
            setEditOutputValue('')
        }
    }

    const handleCancelOutputEdit = () => {
        setEditOutputIndex(null)
        setEditOutputValue('')
    }

    const handleDeleteOutput = (index) => {
        setOutputs(outputs.filter((_, idx) => idx !== index))
    }

    // --- Process Outcomes Editing ---
    const handleEditOutcome = (index) => {
        setEditOutcomeIndex(index)
        setEditOutcomeValue(outcomes[index])
    }

    const handleSaveOutcome = (index) => {
        if (editOutcomeValue.trim() !== '') {
            const updatedOutcomes = outcomes.map((item, idx) =>
                idx === index ? editOutcomeValue.trim() : item
            )
            setOutcomes(updatedOutcomes)
            setEditOutcomeIndex(null)
            setEditOutcomeValue('')
        }
    }

    const handleCancelOutcomeEdit = () => {
        setEditOutcomeIndex(null)
        setEditOutcomeValue('')
    }

    const handleDeleteOutcome = (index) => {
        setOutcomes(outcomes.filter((_, idx) => idx !== index))
    }

    return (
        <div className="space-y-6 bg-white p-6">
            {/* Audit Process - single field */}
            <div className="flex items-center space-x-4">
                <label className="w-1/4 text-sm font-medium text-gray-700">
                    Audit Process <span className="text-red-500">*</span>
                </label>
                <input
                    type="text"
                    value={auditProcess}
                    onChange={(e) => setAuditProcess(e.target.value)}
                    placeholder="e.g., Review of internal controls..."
                    className="w-3/4 p-2 border border-gray-300 rounded focus:outline-none focus:ring focus:ring-blue-200"
                />
            </div>

            {/* Process Owner */}
            <div className="flex items-center space-x-4">
                <label className="w-1/4 text-sm font-medium text-gray-700">
                    Process Owner <span className="text-red-500">*</span>
                </label>
                <div className="w-3/4 flex items-center space-x-2">
                    <input
                        type="text"
                        value={processOwner}
                        onChange={(e) => setProcessOwner(e.target.value)}
                        placeholder="e.g., Accounts Payable"
                        className="flex-1 p-2 border border-gray-300 rounded focus:outline-none focus:ring focus:ring-blue-200"
                    />
                    <button
                        type="button"
                        onClick={handleAddOwner}
                        className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700 focus:outline-none"
                    >
                        Add
                    </button>
                </div>
            </div>
            {owners.length > 0 && (
                <ul className="mt-2 space-y-1 list-disc list-inside">
                    {owners.map((owner, index) => (
                        <li key={index} className="flex items-center gap-3">
                            <span className="w-1/4 text-sm font-medium text-gray-700">Owner:</span>
                            <div className="w-3/4 flex items-center justify-between gap-3">
                                {editOwnerIndex === index ? (
                                    <input
                                        type="text"
                                        value={editOwnerValue}
                                        onChange={(e) => setEditOwnerValue(e.target.value)}
                                        className="flex-1 p-1 border border-gray-300 rounded"
                                    />
                                ) : (
                                    <span className="flex-1">{owner}</span>
                                )}
                                <div className="flex space-x-2 items-center">
                                    {editOwnerIndex === index ? (
                                        <>
                                            <button
                                                type="button"
                                                onClick={() => handleSaveOwner(index)}
                                                className="text-green-600 hover:text-green-800"
                                            >
                                                <FaSave />
                                            </button>
                                            <button
                                                type="button"
                                                onClick={handleCancelOwnerEdit}
                                                className="text-gray-600 hover:text-gray-800"
                                            >
                                                <FaTimes />
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            <button
                                                type="button"
                                                onClick={() => handleEditOwner(index)}
                                                className="text-blue-600 hover:text-blue-800"
                                            >
                                                <FaEdit />
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => handleDeleteOwner(index)}
                                                className="text-red-600 hover:text-red-800"
                                            >
                                                <FaTrash />
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        </li>
                    ))}
                </ul>
            )}

            {/* Process Input */}
            <div className="flex items-center space-x-4">
                <label className="w-1/4 text-sm font-medium text-gray-700">
                    Process Input <span className="text-red-500">*</span>
                </label>
                <div className="w-3/4 flex items-center space-x-2">
                    <input
                        type="text"
                        value={processInput}
                        onChange={(e) => setProcessInput(e.target.value)}
                        placeholder="e.g., Resources needed"
                        className="flex-1 p-2 border border-gray-300 rounded focus:outline-none focus:ring focus:ring-blue-200"
                    />
                    <button
                        type="button"
                        onClick={handleAddInput}
                        className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700 focus:outline-none"
                    >
                        Add
                    </button>
                </div>
            </div>
            {inputs.length > 0 && (
                <ul className="mt-2 space-y-1 list-disc list-inside">
                    {inputs.map((inp, index) => (
                        <li key={index} className="flex items-center gap-3">
                            <span className="w-1/4 text-sm font-medium text-gray-700">Input:</span>
                            <div className="w-3/4 flex items-center justify-between gap-3">
                                {editInputIndex === index ? (
                                    <input
                                        type="text"
                                        value={editInputValue}
                                        onChange={(e) => setEditInputValue(e.target.value)}
                                        className="flex-1 p-1 border border-gray-300 rounded"
                                    />
                                ) : (
                                    <span className="flex-1">{inp}</span>
                                )}
                                <div className="flex space-x-2 items-center">
                                    {editInputIndex === index ? (
                                        <>
                                            <button
                                                type="button"
                                                onClick={() => handleSaveInput(index)}
                                                className="text-green-600 hover:text-green-800"
                                            >
                                                <FaSave />
                                            </button>
                                            <button
                                                type="button"
                                                onClick={handleCancelInputEdit}
                                                className="text-gray-600 hover:text-gray-800"
                                            >
                                                <FaTimes />
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            <button
                                                type="button"
                                                onClick={() => handleEditInput(index)}
                                                className="text-blue-600 hover:text-blue-800"
                                            >
                                                <FaEdit />
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => handleDeleteInput(index)}
                                                className="text-red-600 hover:text-red-800"
                                            >
                                                <FaTrash />
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        </li>
                    ))}
                </ul>
            )}

            {/* Process Output */}
            <div className="flex items-center space-x-4">
                <label className="w-1/4 text-sm font-medium text-gray-700">
                    Process Output <span className="text-red-500">*</span>
                </label>
                <div className="w-3/4 flex items-center space-x-2">
                    <input
                        type="text"
                        value={processOutput}
                        onChange={(e) => setProcessOutput(e.target.value)}
                        placeholder="e.g., Activity metrics"
                        className="flex-1 p-2 border border-gray-300 rounded focus:outline-none focus:ring focus:ring-blue-200"
                    />
                    <button
                        type="button"
                        onClick={handleAddOutput}
                        className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700 focus:outline-none"
                    >
                        Add
                    </button>
                </div>
            </div>
            {outputs.length > 0 && (
                <ul className="mt-2 space-y-1 list-disc list-inside">
                    {outputs.map((out, index) => (
                        <li key={index} className="flex items-center gap-3">
                            <span className="w-1/4 text-sm font-medium text-gray-700">Output:</span>
                            <div className="w-3/4 flex items-center justify-between gap-3">
                                {editOutputIndex === index ? (
                                    <input
                                        type="text"
                                        value={editOutputValue}
                                        onChange={(e) => setEditOutputValue(e.target.value)}
                                        className="flex-1 p-1 border border-gray-300 rounded"
                                    />
                                ) : (
                                    <span className="flex-1">{out}</span>
                                )}
                                <div className="flex space-x-2 items-center">
                                    {editOutputIndex === index ? (
                                        <>
                                            <button
                                                type="button"
                                                onClick={() => handleSaveOutput(index)}
                                                className="text-green-600 hover:text-green-800"
                                            >
                                                <FaSave />
                                            </button>
                                            <button
                                                type="button"
                                                onClick={handleCancelOutputEdit}
                                                className="text-gray-600 hover:text-gray-800"
                                            >
                                                <FaTimes />
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            <button
                                                type="button"
                                                onClick={() => handleEditOutput(index)}
                                                className="text-blue-600 hover:text-blue-800"
                                            >
                                                <FaEdit />
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => handleDeleteOutput(index)}
                                                className="text-red-600 hover:text-red-800"
                                            >
                                                <FaTrash />
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        </li>
                    ))}
                </ul>
            )}

            {/* Process Outcomes */}
            <div className="flex items-center space-x-4">
                <label className="w-1/4 text-sm font-medium text-gray-700">
                    Process Outcomes <span className="text-red-500">*</span>
                </label>
                <div className="w-3/4 flex items-center space-x-2">
                    <input
                        type="text"
                        value={processOutcomes}
                        onChange={(e) => setProcessOutcomes(e.target.value)}
                        placeholder="e.g., End results metrics"
                        className="flex-1 p-2 border border-gray-300 rounded focus:outline-none focus:ring focus:ring-blue-200"
                    />
                    <button
                        type="button"
                        onClick={handleAddOutcome}
                        className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700 focus:outline-none"
                    >
                        Add
                    </button>
                </div>
            </div>
            {outcomes.length > 0 && (
                <ul className="mt-2 space-y-1 list-disc list-inside">
                    {outcomes.map((oc, index) => (
                        <li key={index} className="flex items-center gap-3">
                            <span className="w-1/4 text-sm font-medium text-gray-700">Outcome:</span>
                            <div className="w-3/4 flex items-center justify-between gap-3">
                                {editOutcomeIndex === index ? (
                                    <input
                                        type="text"
                                        value={editOutcomeValue}
                                        onChange={(e) => setEditOutcomeValue(e.target.value)}
                                        className="flex-1 p-1 border border-gray-300 rounded"
                                    />
                                ) : (
                                    <span className="flex-1">{oc}</span>
                                )}
                                <div className="flex space-x-2 items-center">
                                    {editOutcomeIndex === index ? (
                                        <>
                                            <button
                                                type="button"
                                                onClick={() => handleSaveOutcome(index)}
                                                className="text-green-600 hover:text-green-800"
                                            >
                                                <FaSave />
                                            </button>
                                            <button
                                                type="button"
                                                onClick={handleCancelOutcomeEdit}
                                                className="text-gray-600 hover:text-gray-800"
                                            >
                                                <FaTimes />
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            <button
                                                type="button"
                                                onClick={() => handleEditOutcome(index)}
                                                className="text-blue-600 hover:text-blue-800"
                                            >
                                                <FaEdit />
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => handleDeleteOutcome(index)}
                                                className="text-red-600 hover:text-red-800"
                                            >
                                                <FaTrash />
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    )
}
