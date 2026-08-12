import React, { useState } from 'react'
import { FiCheck, FiX, FiEdit, FiTrash2 } from 'react-icons/fi'

function ControlsMitigatingRisk() {
    // State for adding a new control
    const [newControl, setNewControl] = useState({
        controlID: '',
        category: '',
        controlArea: '',
        controlType: 'Preventive',
        controlAttribute: '',
        controlObjective: '',
        controlDescription: '',
        todAssessment: '',
        toeAssessment: '',
        applicableDept: '',
    })

    // Array to store added controls
    const [controls, setControls] = useState([])

    // State for editing controls
    const [editingIndex, setEditingIndex] = useState(null)
    const [editedControl, setEditedControl] = useState({})

    // Handle changes for the new-control input fields
    const handleNewControlChange = (e) => {
        const { name, value } = e.target
        setNewControl((prev) => ({ ...prev, [name]: value }))
    }

    // Add a new control to the table
    const handleAddControl = () => {
        if (newControl.controlID.trim() === '') {
            alert('Please enter Control ID')
            return
        }

        setControls((prev) => [...prev, newControl])

        // Reset the form to default values
        setNewControl({
            controlID: '',
            category: '',
            controlArea: '',
            controlType: 'Preventive',
            controlAttribute: '',
            controlObjective: '',
            controlDescription: '',
            todAssessment: '',
            toeAssessment: '',
            applicableDept: '',
        })
    }

    // Switch a table row to edit mode
    const handleEditClick = (index) => {
        setEditingIndex(index)
        setEditedControl(controls[index])
    }

    // Update the editedControl values as the user types
    const handleEditedControlChange = (e) => {
        const { name, value } = e.target
        setEditedControl((prev) => ({ ...prev, [name]: value }))
    }

    // Save the edited control row
    const handleSaveEditedControl = () => {
        const updatedControls = [...controls]
        updatedControls[editingIndex] = editedControl
        setControls(updatedControls)
        setEditingIndex(null)
        setEditedControl({})
    }

    // Cancel edit mode
    const handleCancelEditControl = () => {
        setEditingIndex(null)
        setEditedControl({})
    }

    // Delete a control row
    const handleDeleteControl = (index) => {
        setControls((prev) => prev.filter((_, i) => i !== index))
        if (editingIndex === index) {
            setEditingIndex(null)
            setEditedControl({})
        }
    }

    // Table headers for all relevant columns
    const tableHeaders = [
        "Control ID",
        "Category",
        "Control Area",
        "Control Type",
        "Control Attribute",
        "Control Objective",
        "Control Description",
        "TOD Assessment",
        "TOE Assessment",
        "Applicable Dept",
        "Actions",
    ]

    return (
        <div className="space-y-6">
            {/* New Control Input Form */}
            <div className="p-4 border rounded bg-gray-50 space-y-4">
                <h2 className="text-lg font-bold">Add Control</h2>

                {/* Row 1: Control ID, Category, Control Area */}
                <div className="grid grid-cols-3 gap-4">
                    <div>
                        <label className="block font-medium" htmlFor="controlID">
                            Control ID:
                        </label>
                        <input
                            id="controlID"
                            name="controlID"
                            type="text"
                            value={newControl.controlID}
                            onChange={handleNewControlChange}
                            placeholder="Enter Control ID"
                            className="mt-1 block w-full p-2 border border-gray-300 rounded"
                        />
                    </div>
                    <div>
                        <label className="block font-medium" htmlFor="category">
                            Category:
                        </label>
                        <input
                            id="category"
                            name="category"
                            type="text"
                            value={newControl.category}
                            onChange={handleNewControlChange}
                            placeholder="Enter Category"
                            className="mt-1 block w-full p-2 border border-gray-300 rounded"
                        />
                    </div>
                    <div>
                        <label className="block font-medium" htmlFor="controlArea">
                            Control Area:
                        </label>
                        <input
                            id="controlArea"
                            name="controlArea"
                            type="text"
                            value={newControl.controlArea}
                            onChange={handleNewControlChange}
                            placeholder="Enter Control Area"
                            className="mt-1 block w-full p-2 border border-gray-300 rounded"
                        />
                    </div>
                </div>

                {/* Row 2: Control Type, Control Attribute, Control Objective */}
                <div className="grid grid-cols-3 gap-4">
                    <div>
                        <label className="block font-medium" htmlFor="controlType">
                            Control Type:
                        </label>
                        <select
                            id="controlType"
                            name="controlType"
                            value={newControl.controlType}
                            onChange={handleNewControlChange}
                            className="mt-1 block w-full p-2 border border-gray-300 rounded"
                        >
                            <option value="Preventive">Preventive</option>
                            <option value="Detective">Detective</option>
                            <option value="Corrective">Corrective</option>
                        </select>
                    </div>
                    <div>
                        <label className="block font-medium" htmlFor="controlAttribute">
                            Control Attribute:
                        </label>
                        <input
                            id="controlAttribute"
                            name="controlAttribute"
                            type="text"
                            value={newControl.controlAttribute}
                            onChange={handleNewControlChange}
                            placeholder="Enter Control Attribute"
                            className="mt-1 block w-full p-2 border border-gray-300 rounded"
                        />
                    </div>
                    <div>
                        <label className="block font-medium" htmlFor="controlObjective">
                            Control Objective:
                        </label>
                        <input
                            id="controlObjective"
                            name="controlObjective"
                            type="text"
                            value={newControl.controlObjective}
                            onChange={handleNewControlChange}
                            placeholder="Enter Control Objective"
                            className="mt-1 block w-full p-2 border border-gray-300 rounded"
                        />
                    </div>
                </div>

                {/* Row 3: Control Description, TOD Assessment, TOE Assessment */}
                <div className="grid grid-cols-3 gap-4">
                    <div>
                        <label className="block font-medium" htmlFor="controlDescription">
                            Control Description:
                        </label>
                        <textarea
                            id="controlDescription"
                            name="controlDescription"
                            value={newControl.controlDescription}
                            onChange={handleNewControlChange}
                            placeholder="Enter Control Description"
                            rows="2"
                            className="mt-1 block w-full p-2 border border-gray-300 rounded"
                        />
                    </div>
                    <div>
                        <label className="block font-medium" htmlFor="todAssessment">
                            TOD Assessment:
                        </label>
                        <input
                            id="todAssessment"
                            name="todAssessment"
                            type="text"
                            value={newControl.todAssessment}
                            onChange={handleNewControlChange}
                            placeholder="Enter TOD Assessment"
                            className="mt-1 block w-full p-2 border border-gray-300 rounded"
                        />
                    </div>
                    <div>
                        <label className="block font-medium" htmlFor="toeAssessment">
                            TOE Assessment:
                        </label>
                        <input
                            id="toeAssessment"
                            name="toeAssessment"
                            type="text"
                            value={newControl.toeAssessment}
                            onChange={handleNewControlChange}
                            placeholder="Enter TOE Assessment"
                            className="mt-1 block w-full p-2 border border-gray-300 rounded"
                        />
                    </div>
                </div>

                {/* Row 4: Applicable Dept spanning full row */}
                <div className="grid grid-cols-3 gap-4">
                    <div className="col-span-3">
                        <label className="block font-medium" htmlFor="applicableDept">
                            Applicable Dept:
                        </label>
                        <input
                            id="applicableDept"
                            name="applicableDept"
                            type="text"
                            value={newControl.applicableDept}
                            onChange={handleNewControlChange}
                            placeholder="Enter Applicable Department"
                            className="mt-1 block w-full p-2 border border-gray-300 rounded"
                        />
                    </div>
                </div>

                <button
                    type="button"
                    onClick={handleAddControl}
                    className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                    Add Control
                </button>
            </div>


            {/* Main Table with All Columns and Actions */}
            <div className="overflow-x-auto rounded-xl">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-[#1e284e]">
                        <tr className="text-center">
                            {tableHeaders.map((header) => (
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
                        {controls.length > 0 ? (
                            controls.map((ctrl, index) => (
                                <tr key={index} className="text-center hover:bg-gray-50">
                                    {editingIndex === index ? (
                                        <>
                                            {/* Edit Mode for each Column */}
                                            <td className="px-6 py-3">
                                                <input
                                                    type="text"
                                                    name="controlID"
                                                    value={editedControl.controlID}
                                                    onChange={handleEditedControlChange}
                                                    className="w-full border rounded-md px-2 py-1"
                                                />
                                            </td>
                                            <td className="px-6 py-3">
                                                <input
                                                    type="text"
                                                    name="category"
                                                    value={editedControl.category}
                                                    onChange={handleEditedControlChange}
                                                    className="w-full border rounded-md px-2 py-1"
                                                />
                                            </td>
                                            <td className="px-6 py-3">
                                                <input
                                                    type="text"
                                                    name="controlArea"
                                                    value={editedControl.controlArea}
                                                    onChange={handleEditedControlChange}
                                                    className="w-full border rounded-md px-2 py-1"
                                                />
                                            </td>
                                            <td className="px-6 py-3">
                                                <select
                                                    name="controlType"
                                                    value={editedControl.controlType}
                                                    onChange={handleEditedControlChange}
                                                    className="w-full border rounded-md px-2 py-1"
                                                >
                                                    <option value="Preventive">Preventive</option>
                                                    <option value="Detective">Detective</option>
                                                    <option value="Corrective">Corrective</option>
                                                </select>
                                            </td>
                                            <td className="px-6 py-3">
                                                <input
                                                    type="text"
                                                    name="controlAttribute"
                                                    value={editedControl.controlAttribute}
                                                    onChange={handleEditedControlChange}
                                                    className="w-full border rounded-md px-2 py-1"
                                                />
                                            </td>
                                            <td className="px-6 py-3">
                                                <input
                                                    type="text"
                                                    name="controlObjective"
                                                    value={editedControl.controlObjective}
                                                    onChange={handleEditedControlChange}
                                                    className="w-full border rounded-md px-2 py-1"
                                                />
                                            </td>
                                            <td className="px-6 py-3">
                                                <input
                                                    type="text"
                                                    name="controlDescription"
                                                    value={editedControl.controlDescription}
                                                    onChange={handleEditedControlChange}
                                                    className="w-full border rounded-md px-2 py-1"
                                                />
                                            </td>
                                            <td className="px-6 py-3">
                                                <input
                                                    type="text"
                                                    name="todAssessment"
                                                    value={editedControl.todAssessment}
                                                    onChange={handleEditedControlChange}
                                                    className="w-full border rounded-md px-2 py-1"
                                                />
                                            </td>
                                            <td className="px-6 py-3">
                                                <input
                                                    type="text"
                                                    name="toeAssessment"
                                                    value={editedControl.toeAssessment}
                                                    onChange={handleEditedControlChange}
                                                    className="w-full border rounded-md px-2 py-1"
                                                />
                                            </td>
                                            <td className="px-6 py-3">
                                                <input
                                                    type="text"
                                                    name="applicableDept"
                                                    value={editedControl.applicableDept}
                                                    onChange={handleEditedControlChange}
                                                    className="w-full border rounded-md px-2 py-1"
                                                />
                                            </td>
                                            <td className="px-6 py-3">
                                                <div className="flex gap-2 justify-center">
                                                    <button
                                                        onClick={handleSaveEditedControl}
                                                        className="flex items-center px-3 py-1 bg-blue-600 text-white rounded-md shadow hover:bg-blue-700 transition duration-200"
                                                    >
                                                        <FiCheck className="mr-1" size={18} />
                                                    </button>
                                                    <button
                                                        onClick={handleCancelEditControl}
                                                        className="flex items-center px-3 py-1 bg-gray-300 text-gray-700 rounded-md shadow hover:bg-gray-400 transition duration-200"
                                                    >
                                                        <FiX className="mr-1" size={18} />
                                                    </button>
                                                </div>
                                            </td>
                                        </>
                                    ) : (
                                        <>
                                            {/* Display Mode for each Column */}
                                            <td className="px-6 py-3">{ctrl.controlID}</td>
                                            <td className="px-6 py-3">{ctrl.category}</td>
                                            <td className="px-6 py-3">{ctrl.controlArea}</td>
                                            <td className="px-6 py-3">{ctrl.controlType}</td>
                                            <td className="px-6 py-3">{ctrl.controlAttribute}</td>
                                            <td className="px-6 py-3">{ctrl.controlObjective}</td>
                                            <td className="px-6 py-3">{ctrl.controlDescription}</td>
                                            <td className="px-6 py-3">{ctrl.todAssessment}</td>
                                            <td className="px-6 py-3">{ctrl.toeAssessment}</td>
                                            <td className="px-6 py-3">{ctrl.applicableDept}</td>
                                            <td className="px-6 py-3">
                                                <div className="flex gap-2 justify-center">
                                                    <button
                                                        onClick={() => handleEditClick(index)}
                                                        className="flex items-center px-3 py-1 bg-yellow-500 text-white rounded-md shadow hover:bg-yellow-600 transition duration-200"
                                                    >
                                                        <FiEdit size={18} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteControl(index)}
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
                                <td colSpan={tableHeaders.length} className="px-6 py-3 text-sm text-gray-500 text-center">
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

export default ControlsMitigatingRisk
