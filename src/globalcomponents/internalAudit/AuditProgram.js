// src/components/ReviewerApproverAssignment.jsx
import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import CustomAxios from '../CustomAxios'
import { baseurl, initURL } from '../../../BaseUrl'
import ProcessOverview from './ProcessOverview'
import Loader from '../loader/Loader'
import { FiClipboard } from 'react-icons/fi'

const formatParticipantLabel = (user) => {
    if (!user) return 'Unnamed user'
    const fullName = [user.first_name, user.last_name].filter(Boolean).join(' ').trim()
    if (fullName) return fullName
    if (user.user_name) return user.user_name
    if (user.email) return user.email
    return 'Unnamed user'
}

export default function ReviewerApproverAssignment() {
    const router = useRouter()
    const { programId, auditArea, uId } = router.query
    const [loading, setLoading] = useState(true)
    const [selectedProcess, setSelectedProcess] = useState(null)
    const [controls, setControls] = useState([])
    const [teamOptions, setTeamOptions] = useState([])


    useEffect(() => {
        if (!programId || !auditArea) return

        setLoading(true)
        Promise.all([
            CustomAxios.get(
                `${baseurl}/${initURL}/audit-controls`,
                { params: { programId, auditAreaId: auditArea } }
            ),
            CustomAxios.get(
                `${baseurl}/${initURL}/audit-area-planning/program/${programId}/topic/${auditArea}`
            )
        ])
            .then(([controlsRes, planningRes]) => {
                const normalized = (Array.isArray(controlsRes.data) ? controlsRes.data : [])
                    .map(c => ({
                        ...c,
                        assignedTo: c.assignedTo?._id || '',
                        reviewer: c.reviewer?._id || '',
                        approver: c.approver?._id || '',
                    }))
                setControls(normalized)

                const teamMembers = planningRes.data?.auditTeamMembers
                const opts = Array.isArray(teamMembers)
                    ? teamMembers.map(m => ({
                        _id: m.userId._id,
                        name: formatParticipantLabel(m.userId)
                    }))
                    : []

                setTeamOptions(opts)
            })
            .catch(err => {
                console.error(err)
                toast.error('Failed to load controls or audit-team data.')
            })
            .finally(() => {
                setLoading(false)
            })
    }, [programId, auditArea])

    // Local changes only
    const handleAssign = (ctrlId, field, userId) => {
        setControls(cs =>
            cs.map(c => (c._id === ctrlId ? { ...c, [field]: userId } : c))
        )
    }

    // Patch on demand
    const handleSave = async (ctrlId) => {
        const c = controls.find(x => x._id === ctrlId)
        if (!c) return toast.error('Control not found')

        // Validate required fields
        const missing = [];
        if (!c.assignedTo) missing.push("Assigned To");
        if (!c.reviewer) missing.push("Reviewer");
        if (!c.approver) missing.push("Approver");

        if (missing.length > 0) {
            toast.error(`Please select: ${missing.join(', ')}`);
            return;
        }
        const payload = {
            assignedTo: c.assignedTo || null,
            reviewer: c.reviewer || null,
            approver: c.approver || null,
            universeId: uId
        }
        setLoading(true)
        try {
            await CustomAxios.patch(
                `${baseurl}/${initURL}/audit-controls/${ctrlId}`,
                payload
            )
            toast.success('Assignments saved')
        } catch (err) {
            console.error(err)
            toast.error('Save failed')
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <div className="h-[75vh] flex items-center justify-center">
                <Loader />
            </div>
        )
    }

    if (controls.length === 0) {
        return (
            <div className="p-6 text-center text-gray-600">
                <FiClipboard className="mx-auto mb-4 text-4xl text-gray-300" />
                <h2 className="text-xl font-medium mb-2">No Controls to Assign</h2>
                <p className="text-sm">
                    There are currently no controls defined for this audit area.<br />
                    Please add controls first before assigning.
                </p>
            </div>
        )
    }

    return (
        <div className="space-y-6 p-6">
            <ProcessOverview
                setSelectedProcess={setSelectedProcess}
                selectedProcess={selectedProcess}
            />

            <div className="bg-white shadow rounded-lg p-4">
                <h3 className="text-lg font-medium mb-4">Controls & Assignment</h3>
                <div className="overflow-x-auto rounded-lg">
                    <table className="min-w-full divide-y divide-gray-200 text-sm">
                        <thead className="bg-[#2B245C] text-white">
                            <tr>
                                {[
                                    'Control ID', 'Name', 'Description', 'Status',
                                    'Priority', 'Category', 'Objective', 'Audit Area',
                                    'TOD Test Step', 'TOD Artefact',   // ← split columns
                                    'TOE TestStep', 'TOE Artefact',   // ← split columns
                                    'Assigned To', 'Reviewer', 'Approver', 'Action'
                                ].map(h => (
                                    <th key={h} className="px-3 py-2 text-center uppercase">
                                        {h}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {controls.map(c => (
                                <tr key={c._id} className="hover:bg-gray-50 text-center">
                                    <td className="px-3 py-2">{c.controlID}</td>
                                    <td className="px-3 py-2">{c.name}</td>
                                    <td className="px-3 py-2">{c.description}</td>
                                    <td className="px-3 py-2">{c.status}</td>
                                    <td className="px-3 py-2">{c.priority}</td>
                                    <td className="px-3 py-2">{c.category}</td>
                                    <td className="px-3 py-2">{c.objective}</td>
                                    <td className="px-3 py-2">{c.processArea}</td>

                                    {/* TOD Step */}
                                    <td className="px-3 py-2">
                                        {c.todTests.map((t, i) => (
                                            <div key={i}>{i + 1}. {t.step}</div>
                                        ))}
                                    </td>
                                    {/* TOD Artefact */}
                                    <td className="px-3 py-2">
                                        {c.todTests.map((t, i) => (
                                            <div key={i}>{i + 1}. {t.artefact}</div>
                                        ))}
                                    </td>

                                    {/* TOE Step */}
                                    <td className="px-3 py-2">
                                        {c.toeTests.map((t, i) => (
                                            <div key={i}>{i + 1}. {t.step}</div>
                                        ))}
                                    </td>
                                    {/* TOE Artefact */}
                                    <td className="px-3 py-2">
                                        {c.toeTests.map((t, i) => (
                                            <div key={i}>{i + 1}. {t.artefact}</div>
                                        ))}
                                    </td>

                                    <td className="px-3 py-2">
                                        <select
                                            value={c.assignedTo || ''}
                                            onChange={e => handleAssign(c._id, 'assignedTo', e.target.value)}
                                            className="border rounded p-1 w-full"
                                        >
                                            <option value="">— unassigned —</option>
                                            {teamOptions.map(u => (
                                                <option key={u._id} value={u._id}>{u.name}</option>
                                            ))}
                                        </select>
                                    </td>
                                    <td className="px-3 py-2">
                                        <select
                                            value={c.reviewer || ''}
                                            onChange={e => handleAssign(c._id, 'reviewer', e.target.value)}
                                            className="border rounded p-1 w-full"
                                        >
                                            <option value="">— none —</option>
                                            {teamOptions.map(u => (
                                                <option key={u._id} value={u._id}>{u.name}</option>
                                            ))}
                                        </select>
                                    </td>
                                    <td className="px-3 py-2">
                                        <select
                                            value={c.approver || ''}
                                            onChange={e => handleAssign(c._id, 'approver', e.target.value)}
                                            className="border rounded p-1 w-full"
                                        >
                                            <option value="">— none —</option>
                                            {teamOptions.map(u => (
                                                <option key={u._id} value={u._id}>{u.name}</option>
                                            ))}
                                        </select>
                                    </td>
                                    <td className="px-3 py-2">
                                        <button
                                            onClick={() => handleSave(c._id)}
                                            className="bg-green-500 hover:bg-green-600 text-white px-2 py-1 rounded"
                                        >
                                            Save
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
