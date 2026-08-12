import React, { useState } from 'react'
import { Edit2, Trash2, Check, X } from 'lucide-react'

function ProcessObjectives() {
    // State for new objective input, list of objectives, and temporary edit values.
    const [newObjective, setNewObjective] = useState('')
    const [objectives, setObjectives] = useState([])
    const [editValues, setEditValues] = useState({})

    // Add a new objective to the list.
    const handleAddObjective = () => {
        if (newObjective.trim() !== '') {
            const newObj = {
                id: Date.now().toString(),
                text: newObjective.trim(),
                isEditing: false
            }
            setObjectives(prev => [...prev, newObj])
            setNewObjective('')
        }
    }

    // Start editing an objective.
    const handleStartEdit = (id) => {
        setObjectives(prev =>
            prev.map(obj =>
                obj.id === id ? { ...obj, isEditing: true } : obj
            )
        )
        // Initialize the edit value with the current text.
        const obj = objectives.find(item => item.id === id)
        if (obj) {
            setEditValues(prev => ({ ...prev, [id]: obj.text }))
        }
    }

    // Update the temporary edit value.
    const handleEditChange = (id, value) => {
        setEditValues(prev => ({ ...prev, [id]: value }))
    }

    // Save the edited objective.
    const handleSaveEdit = (id) => {
        setObjectives(prev =>
            prev.map(obj =>
                obj.id === id ? { ...obj, text: editValues[id] || obj.text, isEditing: false } : obj
            )
        )
        setEditValues(prev => {
            const updated = { ...prev }
            delete updated[id]
            return updated
        })
    }

    // Cancel editing for an objective.
    const handleCancelEdit = (id) => {
        setObjectives(prev =>
            prev.map(obj =>
                obj.id === id ? { ...obj, isEditing: false } : obj
            )
        )
        setEditValues(prev => {
            const updated = { ...prev }
            delete updated[id]
            return updated
        })
    }

    // Delete an objective from the list.
    const handleDeleteObjective = (id) => {
        setObjectives(prev => prev.filter(obj => obj.id !== id))
        setEditValues(prev => {
            const updated = { ...prev }
            delete updated[id]
            return updated
        })
    }

    return (
        <div className="space-y-4">
            {/* Input area to add a new objective */}
            <div className="flex items-center space-x-2">
                <label htmlFor="new-objective" className="font-semibold w-1/6">
                    Objective:
                </label>
                <input
                    id="new-objective"
                    type="text"
                    value={newObjective}
                    onChange={(e) => setNewObjective(e.target.value)}
                    placeholder="Enter objective"
                    className="w-3/4 p-2 border border-gray-300 rounded"
                />
                <button
                    type="button"
                    onClick={handleAddObjective}
                    className="ml-2 px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                    Add
                </button>
            </div>

            {/* List of objectives */}
            {objectives.length > 0 && (
                <ul className="list-disc list-inside">
                    {objectives.map((obj) => (
                        <li key={obj.id} className="flex items-center justify-between py-1">
                            {obj.isEditing ? (
                                // Editing mode: show input field with Save and Cancel options.
                                <>
                                    <input
                                        type="text"
                                        value={editValues[obj.id] || ''}
                                        onChange={(e) => handleEditChange(obj.id, e.target.value)}
                                        className="flex-grow p-2 border border-gray-300 rounded"
                                    />
                                    <div className="flex items-center space-x-2 ml-4">
                                        <button
                                            type="button"
                                            onClick={() => handleSaveEdit(obj.id)}
                                            title="Save"
                                            className="text-green-600 hover:text-green-800"
                                        >
                                            <Check size={18} />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => handleCancelEdit(obj.id)}
                                            title="Cancel"
                                            className="text-gray-600 hover:text-gray-800"
                                        >
                                            <X size={18} />
                                        </button>
                                    </div>
                                </>
                            ) : (
                                // Display mode: show objective text with Edit and Delete icons.
                                <>
                                    <span className="flex-grow">{obj.text}</span>
                                    <div className="flex items-center space-x-2 ml-4">
                                        <button
                                            type="button"
                                            onClick={() => handleStartEdit(obj.id)}
                                            title="Edit"
                                            className="text-blue-600 hover:text-blue-800"
                                        >
                                            <Edit2 size={18} />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => handleDeleteObjective(obj.id)}
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

export default ProcessObjectives
