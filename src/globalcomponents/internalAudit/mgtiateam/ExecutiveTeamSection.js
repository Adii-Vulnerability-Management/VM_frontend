import React from 'react'
import {
    Check,
    Edit2,
    Plus,
    ShieldCheck,
    Trash2,
    Users,
    X
} from "lucide-react"; // Import Lucide icons
import { useState } from "react";

// Component for each dynamic position row in table format with edit/save functionality
const DynamicPositionRow = ({ index, data, onSave, onRemove }) => {
    // Local state to manage editing mode and input values
    const [isEditing, setIsEditing] = useState(false);
    const [localData, setLocalData] = useState(data);

    const handleSave = () => {
        onSave(index, { ...localData });
        setIsEditing(false);
    };

    const handleCancel = () => {
        setLocalData(data);
        setIsEditing(false);
    };

    return (
        <tr className="text-center">
            {/* Position Title */}
            <td className="px-4 py-2 whitespace-nowrap">
                {isEditing ? (
                    <input
                        type="text"
                        placeholder="Enter Position Title"
                        value={localData.position}
                        onChange={(e) =>
                            setLocalData({ ...localData, position: e.target.value })
                        }
                        className="w-full border border-gray-300 rounded-md px-2 py-1"
                    />
                ) : (
                    <span>{localData.position}</span>
                )}
            </td>
            {/* First Name */}
            <td className="px-4 py-2 whitespace-nowrap">
                {isEditing ? (
                    <input
                        type="text"
                        placeholder={`Enter ${localData.position || ""} First Name`}
                        value={localData.firstName}
                        onChange={(e) =>
                            setLocalData({ ...localData, firstName: e.target.value })
                        }
                        className="w-full border border-gray-300 rounded-md px-2 py-1"
                    />
                ) : (
                    <span>{localData.firstName}</span>
                )}
            </td>
            {/* Last Name */}
            <td className="px-4 py-2 whitespace-nowrap">
                {isEditing ? (
                    <input
                        type="text"
                        placeholder={`Enter ${localData.position || ""} Last Name`}
                        value={localData.lastName}
                        onChange={(e) =>
                            setLocalData({ ...localData, lastName: e.target.value })
                        }
                        className="w-full border border-gray-300 rounded-md px-2 py-1"
                    />
                ) : (
                    <span>{localData.lastName}</span>
                )}
            </td>
            {/* Email ID */}
            <td className="px-4 py-2 whitespace-nowrap">
                {isEditing ? (
                    <input
                        type="email"
                        placeholder={`Enter ${localData.position || ""} Email ID`}
                        value={localData.email}
                        onChange={(e) =>
                            setLocalData({ ...localData, email: e.target.value })
                        }
                        className="w-full border border-gray-300 rounded-md px-2 py-1"
                    />
                ) : (
                    <span>{localData.email}</span>
                )}
            </td>
            {/* Action Buttons */}
            <td className="px-4 py-2 whitespace-nowrap ">
                <div className="flex items-center gap-2 justify-center">
                    {isEditing ? (
                        <>
                            <button onClick={handleSave} className="text-green-500">
                                <Check size={20} />
                            </button>
                            <button onClick={handleCancel} className="text-gray-500">
                                <X size={20} />
                            </button>
                        </>
                    ) : (
                        <>
                            <button onClick={() => setIsEditing(true)} className="text-blue-500">
                                <Edit2 size={20} />
                            </button>
                            <button onClick={() => onRemove(index)} className="text-red-500">
                                <Trash2 size={20} />
                            </button>
                        </>
                    )}
                </div>
            </td>
        </tr>
    );
};

function ExecutiveTeamSection() {
    const [isAdding, setIsAdding] = useState(false);
    const [dynamicPositions, setDynamicPositions] = useState([]);
    // State for the new position form (shown above the table)
    const [newPosition, setNewPosition] = useState({
        position: "",
        firstName: "",
        lastName: "",
        email: ""
    });
    const handleAddNewPosition = () => {
        // Validate that all fields are filled (optional)
        if (
            newPosition.position &&
            newPosition.firstName &&
            newPosition.lastName &&
            newPosition.email
        ) {
            setDynamicPositions([...dynamicPositions, newPosition]);
            setNewPosition({ position: "", firstName: "", lastName: "", email: "" });
            setIsAdding(false);
        }
    };

    const updateNewPositionField = (field, value) => {
        setNewPosition({ ...newPosition, [field]: value });
    };

    const updateDynamicPosition = (index, newData) => {
        const newPositions = [...dynamicPositions];
        newPositions[index] = newData;
        setDynamicPositions(newPositions);
    };

    const removeDynamicPosition = (index) => {
        setDynamicPositions(dynamicPositions.filter((_, i) => i !== index));
    };


    return (
        <div>
            <div className="grid grid-cols-3 gap-4">
                {/* CEO Section */}
                <div>
                    <label className="block font-medium text-gray-600 mb-1">
                        CEO First Name:
                    </label>
                    <input
                        type="text"
                        placeholder="Enter CEO First Name"
                        className="w-full border border-gray-300 rounded-md px-4 py-2"
                    />
                </div>
                <div>
                    <label className="block font-medium text-gray-600 mb-1">
                        CEO Last Name:
                    </label>
                    <input
                        type="text"
                        placeholder="Enter CEO Last Name"
                        className="w-full border border-gray-300 rounded-md px-4 py-2"
                    />
                </div>
                <div>
                    <label className="block font-medium text-gray-600 mb-1">
                        CEO Contact Email ID:
                    </label>
                    <input
                        type="email"
                        placeholder="Enter Email ID"
                        className="w-full border border-gray-300 rounded-md px-4 py-2"
                    />
                </div>

                {/* CFO Section */}
                <div>
                    <label className="block font-medium text-gray-600 mb-1">
                        CFO First Name:
                    </label>
                    <input
                        type="text"
                        placeholder="Enter CFO First Name"
                        className="w-full border border-gray-300 rounded-md px-4 py-2"
                    />
                </div>
                <div>
                    <label className="block font-medium text-gray-600 mb-1">
                        CFO Last Name:
                    </label>
                    <input
                        type="text"
                        placeholder="Enter CFO Last Name"
                        className="w-full border border-gray-300 rounded-md px-4 py-2"
                    />
                </div>
                <div>
                    <label className="block font-medium text-gray-600 mb-1">
                        CFO Contact Email ID:
                    </label>
                    <input
                        type="email"
                        placeholder="Enter Email ID"
                        className="w-full border border-gray-300 rounded-md px-4 py-2"
                    />
                </div>

                {/* COO Section */}
                <div>
                    <label className="block font-medium text-gray-600 mb-1">
                        COO First Name:
                    </label>
                    <input
                        type="text"
                        placeholder="Enter COO First Name"
                        className="w-full border border-gray-300 rounded-md px-4 py-2"
                    />
                </div>
                <div>
                    <label className="block font-medium text-gray-600 mb-1">
                        COO Last Name:
                    </label>
                    <input
                        type="text"
                        placeholder="Enter COO Last Name"
                        className="w-full border border-gray-300 rounded-md px-4 py-2"
                    />
                </div>
                <div>
                    <label className="block font-medium text-gray-600 mb-1">
                        COO Contact Email ID:
                    </label>
                    <input
                        type="email"
                        placeholder="Enter Email ID"
                        className="w-full border border-gray-300 rounded-md px-4 py-2"
                    />
                </div>
            </div>
            {/* Other Positions Section */}
            <div className="mt-6">
                {/* Add New Position Form (displayed above the table) */}
                {!isAdding ? (
                    <button
                        onClick={() => setIsAdding(true)}
                        className="flex items-center text-blue-600 hover:underline mb-4"
                    >
                        <Plus size={20} />
                        <span className="ml-2">Add Position</span>
                    </button>
                ) : (
                    <div className="mb-4 border p-4 rounded-md">
                        <div className="grid grid-cols-4 gap-4">
                            <div>
                                <label className="block font-medium text-gray-600 mb-1">
                                    Position Title:
                                </label>
                                <input
                                    type="text"
                                    placeholder="Enter Position Title"
                                    value={newPosition.position}
                                    onChange={(e) =>
                                        updateNewPositionField("position", e.target.value)
                                    }
                                    className="w-full border border-gray-300 rounded-md px-4 py-2"
                                />
                            </div>
                            <div>
                                <label className="block font-medium text-gray-600 mb-1">
                                    {newPosition.position
                                        ? `${newPosition.position} First Name:`
                                        : "First Name:"}
                                </label>
                                <input
                                    type="text"
                                    placeholder="Enter First Name"
                                    value={newPosition.firstName}
                                    onChange={(e) =>
                                        updateNewPositionField("firstName", e.target.value)
                                    }
                                    className="w-full border border-gray-300 rounded-md px-4 py-2"
                                />
                            </div>
                            <div>
                                <label className="block font-medium text-gray-600 mb-1">
                                    {newPosition.position
                                        ? `${newPosition.position} Last Name:`
                                        : "Last Name:"}
                                </label>
                                <input
                                    type="text"
                                    placeholder="Enter Last Name"
                                    value={newPosition.lastName}
                                    onChange={(e) =>
                                        updateNewPositionField("lastName", e.target.value)
                                    }
                                    className="w-full border border-gray-300 rounded-md px-4 py-2"
                                />
                            </div>
                            <div>
                                <label className="block font-medium text-gray-600 mb-1">
                                    {newPosition.position
                                        ? `${newPosition.position} Email ID:`
                                        : "Email ID:"}
                                </label>
                                <input
                                    type="email"
                                    placeholder="Enter Email ID"
                                    value={newPosition.email}
                                    onChange={(e) =>
                                        updateNewPositionField("email", e.target.value)
                                    }
                                    className="w-full border border-gray-300 rounded-md px-4 py-2"
                                />
                            </div>
                        </div>
                        <div className="flex justify-end mt-4 gap-2">
                            <button
                                onClick={handleAddNewPosition}
                                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md"
                            >
                                <Check size={20} />
                            </button>
                            <button
                                onClick={() => {
                                    setIsAdding(false);
                                    setNewPosition({
                                        position: "",
                                        firstName: "",
                                        lastName: "",
                                        email: ""
                                    });
                                }}
                                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md"
                            >
                                <X size={20} />
                            </button>
                        </div>
                    </div>
                )}

                {/* Table of Dynamic Positions */}
                <div className="overflow-x-auto rounded-xl">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-[#1e284e]">
                            <tr className="text-center">
                                {[
                                    "Position",
                                    "First Name",
                                    "Last Name",
                                    "Email ID",
                                    "Actions"
                                ].map((header) => (
                                    <th
                                        key={header}
                                        className="px-6 py-2 text-sm font-semibold text-white tracking-wider border-b border-blue-700"
                                    >
                                        {header}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-100">
                            {dynamicPositions.length > 0 ? (
                                dynamicPositions.map((positionData, index) => (
                                    <DynamicPositionRow
                                        key={index}
                                        index={index}
                                        data={positionData}
                                        onSave={updateDynamicPosition}
                                        onRemove={removeDynamicPosition}
                                    />
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={5} className="px-6 py-3 text-sm text-gray-500 text-center">
                                        No positions available
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}

export default ExecutiveTeamSection
