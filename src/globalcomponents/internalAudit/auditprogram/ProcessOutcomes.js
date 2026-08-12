import React, { useState } from 'react'
import { Edit2, Trash2, Check, X } from 'lucide-react'

function ProcessOutcomes() {
    // State for new outcome input, list of outcomes, and temporary edit values.
    const [newOutcome, setNewOutcome] = useState('')
    const [outcomes, setOutcomes] = useState([])
    const [editValues, setEditValues] = useState({})

    // Adds a new process outcome to the list.
    const handleAddOutcome = () => {
        if (newOutcome.trim() !== '') {
            const newObj = {
                id: Date.now().toString(),
                text: newOutcome.trim(),
                isEditing: false
            }
            setOutcomes(prev => [...prev, newObj])
            setNewOutcome('')
        }
    }

    // Enable edit mode for a specific outcome.
    const handleStartEdit = (id) => {
        setOutcomes(prev =>
            prev.map(outcome =>
                outcome.id === id ? { ...outcome, isEditing: true } : outcome
            )
        )
        // Initialize the edit value with the current text.
        const currentOutcome = outcomes.find(item => item.id === id)
        if (currentOutcome) {
            setEditValues(prev => ({ ...prev, [id]: currentOutcome.text }))
        }
    }

    // Update temporary edit value while editing.
    const handleEditChange = (id, value) => {
        setEditValues(prev => ({ ...prev, [id]: value }))
    }

    // Save the edited process outcome.
    const handleSaveEdit = (id) => {
        setOutcomes(prev =>
            prev.map(outcome =>
                outcome.id === id ? { ...outcome, text: editValues[id] || outcome.text, isEditing: false } : outcome
            )
        )
        setEditValues(prev => {
            const updated = { ...prev }
            delete updated[id]
            return updated
        })
    }

    // Cancel editing.
    const handleCancelEdit = (id) => {
        setOutcomes(prev =>
            prev.map(outcome =>
                outcome.id === id ? { ...outcome, isEditing: false } : outcome
            )
        )
        setEditValues(prev => {
            const updated = { ...prev }
            delete updated[id]
            return updated
        })
    }

    // Remove an outcome from the list.
    const handleDeleteOutcome = (id) => {
        setOutcomes(prev => prev.filter(outcome => outcome.id !== id))
        setEditValues(prev => {
            const updated = { ...prev }
            delete updated[id]
            return updated
        })
    }

    return (
        <div className="space-y-4">
            {/* Input area to add a new process outcome */}
            <div className="flex items-center space-x-2">
                <label htmlFor="new-outcome" className="font-semibold w-1/6">
                    Process Outcome:
                </label>
                <input
                    id="new-outcome"
                    type="text"
                    value={newOutcome}
                    onChange={(e) => setNewOutcome(e.target.value)}
                    placeholder="Enter process outcome"
                    className="w-3/4 p-2 border border-gray-300 rounded"
                />
                <button
                    type="button"
                    onClick={handleAddOutcome}
                    className="ml-2 px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                    Add
                </button>
            </div>

            {/* Display list of process outcomes */}
            {outcomes.length > 0 && (
                <ul className="list-disc list-inside">
                    {outcomes.map((outcome) => (
                        <li key={outcome.id} className="flex items-center justify-between py-1">
                            {outcome.isEditing ? (
                                // Editing mode: show an input field with Save and Cancel options.
                                <>
                                    <input
                                        type="text"
                                        value={editValues[outcome.id] || ''}
                                        onChange={(e) => handleEditChange(outcome.id, e.target.value)}
                                        className="flex-grow p-2 border border-gray-300 rounded"
                                    />
                                    <div className="flex items-center space-x-2 ml-4">
                                        <button
                                            type="button"
                                            onClick={() => handleSaveEdit(outcome.id)}
                                            title="Save"
                                            className="text-green-600 hover:text-green-800"
                                        >
                                            <Check size={18} />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => handleCancelEdit(outcome.id)}
                                            title="Cancel"
                                            className="text-gray-600 hover:text-gray-800"
                                        >
                                            <X size={18} />
                                        </button>
                                    </div>
                                </>
                            ) : (
                                // Display mode: show outcome text with Edit and Delete icons.
                                <>
                                    <span className="flex-grow">{outcome.text}</span>
                                    <div className="flex items-center space-x-2 ml-4">
                                        <button
                                            type="button"
                                            onClick={() => handleStartEdit(outcome.id)}
                                            title="Edit"
                                            className="text-blue-600 hover:text-blue-800"
                                        >
                                            <Edit2 size={18} />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => handleDeleteOutcome(outcome.id)}
                                            title="Delete"
                                            className="text-red-600 hover:text-red-800"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </>
                            )}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    )
}

export default ProcessOutcomes
