import React, { useState } from 'react'

// Default values for the table columns (No, Program ID, Program Name)
const DEFAULT_NO = 'AP-011'
const DEFAULT_PROGRAM_ID = 'AP-011-2025'
const DEFAULT_PROGRAM_NAME = 'Audit Program'

// Define table header labels
const tableHeaders = [
    'No',
    'Program ID',
    'Program Name',
    'First Name',
    'Last Name',
    'Email ID',
    'Review/Approve',
    'Review/Approve Date',
]

function ReviewerApproverAssignment() {
    // Form fields
    const [role, setRole] = useState('Reviewer')
    const [firstName, setFirstName] = useState('')
    const [lastName, setLastName] = useState('')
    const [email, setEmail] = useState('')

    // Table data
    const [assignments, setAssignments] = useState([])

    // Add a new entry to the table
    const handleAdd = (e) => {
        e.preventDefault()
        if (!firstName.trim() || !lastName.trim() || !email.trim()) {
            alert('Please fill in all fields.')
            return
        }

        // Determine "Review/Approve" text based on the selected role
        const reviewApproveText = role === 'Reviewer' ? 'Reviewed' : 'Approved'

        const newRow = {
            no: DEFAULT_NO,
            programID: DEFAULT_PROGRAM_ID,
            programName: DEFAULT_PROGRAM_NAME,
            firstName,
            lastName,
            email,
            reviewApprove: reviewApproveText,
            reviewApproveDate: '',
        }

        setAssignments((prev) => [...prev, newRow])

        // Reset form fields
        setRole('Reviewer')
        setFirstName('')
        setLastName('')
        setEmail('')
    }

    return (
        <section >
            <div className="bg-white  space-y-6">
                {/* Form Section */}
                <div className="p-6 border-b border-gray-200 bg-gray-50 rounded-t-lg">
                    <form onSubmit={handleAdd} className="space-y-5">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                            {/* Role */}
                            <div>
                                <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                                    Role
                                </label>
                                <select
                                    id="role"
                                    value={role}
                                    onChange={(e) => setRole(e.target.value)}
                                    className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-200"
                                >
                                    <option value="Reviewer">Reviewer</option>
                                    <option value="Approver">Approver</option>
                                </select>
                            </div>

                            {/* First Name */}
                            <div>
                                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                                    First Name
                                </label>
                                <input
                                    id="firstName"
                                    type="text"
                                    value={firstName}
                                    onChange={(e) => setFirstName(e.target.value)}
                                    placeholder="Enter first name"
                                    className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-200"
                                />
                            </div>

                            {/* Last Name */}
                            <div>
                                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                                    Last Name
                                </label>
                                <input
                                    id="lastName"
                                    type="text"
                                    value={lastName}
                                    onChange={(e) => setLastName(e.target.value)}
                                    placeholder="Enter last name"
                                    className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-200"
                                />
                            </div>

                            {/* Email ID */}
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                    Email ID
                                </label>
                                <input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="Enter email address"
                                    className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-200"
                                    required
                                />
                            </div>
                        </div>
                        <div className="text-right">
                            <button
                                type="submit"
                                className="inline-flex items-center px-5 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring focus:ring-blue-200 transition"
                            >
                                Add New
                            </button>
                        </div>
                    </form>
                </div>

                {/* Table Section */}
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 text-sm">
                        <thead className="bg-gray-100">
                            <tr>
                                {tableHeaders.map((header, index) => (
                                    <th
                                        key={index}
                                        className="px-4 py-3 text-center font-medium text-gray-600"
                                    >
                                        {header}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-100">
                            {assignments.length > 0 ? (
                                assignments.map((item, idx) => (
                                    <tr key={idx} className="text-center hover:bg-gray-50 transition">
                                        <td className="px-4 py-3 border-b">{item.no}</td>
                                        <td className="px-4 py-3 border-b">{item.programID}</td>
                                        <td className="px-4 py-3 border-b">{item.programName}</td>
                                        <td className="px-4 py-3 border-b">{item.firstName}</td>
                                        <td className="px-4 py-3 border-b">{item.lastName}</td>
                                        <td className="px-4 py-3 border-b">{item.email}</td>
                                        <td className="px-4 py-3 border-b">{item.reviewApprove}</td>
                                        <td className="px-4 py-3 border-b">{item.reviewApproveDate || '-'}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={tableHeaders.length} className="px-4 py-4 text-center text-gray-500">
                                        No records found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </section>
    )
}

export default ReviewerApproverAssignment
