// src/components/ConductAudit.jsx
import React, { useEffect, useState } from 'react'
import {
    FiUpload,
    FiTag,
    FiEye,
    FiShield,
    FiFlag,
    FiUsers,
    FiLayers,
    FiFileText
} from 'react-icons/fi'
import { toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { useRouter } from 'next/router'
import ProcessOverview from './ProcessOverview'
import CustomAxios from '../CustomAxios'
import { baseurl, initURL } from '../../../BaseUrl'
import Loader from '../loader/Loader'

export default function ConductAudit() {
    const router = useRouter()
    const { programId, auditArea, uId } = router.query
    const [loading, setLoading] = useState(false)
    const [selectedProcess, setSelectedProcess] = useState(null)
    const [controls, setControls] = useState([])
    const [modalComment, setModalComment] = useState('')
    const [proofs, setProofs] = useState({})

    // modal state
    const [modalOpen, setModalOpen] = useState(false)
    const [modalControl, setModalControl] = useState(null)   // control._id
    const [modalType, setModalType] = useState(null)
    const [modalStepId, setModalStepId] = useState(null)
    const [modalFile, setModalFile] = useState(null)

    // Docs modal
    const [docsOpen, setDocsOpen] = useState(false)
    const [docsList, setDocsList] = useState([])   // array of { fileDestination, comments, uploadedAt }
    const [docsStepLabel, setDocsStepLabel] = useState('')
    const fetchControls = async () => {
        if (!programId || !auditArea) return

        setLoading(true)
        try {
            const { data } = await CustomAxios.get(
                `${baseurl}/${initURL}/audit-controls`,
                { params: { programId, auditAreaId: auditArea, universeId: uId } }
            )
            setControls(data || [])

            // initialize proofs shape
            const init = {}
            data.forEach(c => {
                init[c._id] = {
                    tod: Array(c.todTests.length).fill(null),
                    toe: Array(c.toeTests.length).fill(null)
                }
            })
            setProofs(init)
        } catch (err) {
            console.error(err)
            toast.error('Failed to load controls')
        } finally {
            setLoading(false)
        }
    }
    // 1️⃣ fetch controls & init proofs
    useEffect(() => {
        fetchControls()
    }, [programId, auditArea, uId])

    // open dialog when user clicks "Upload"
    const openUpload = (ctrlId, type, idx, stepId) => {
        setModalControl(ctrlId)
        setModalType(type)
        setModalStepId(stepId)
        setModalFile(null)
        setModalComment('')
        setModalOpen(true)
    }

    // when user selects file in modal
    const onModalFileChange = (e) => {
        const f = e.target.files?.[0] ?? null
        setModalFile(f)
    }


    const handleModalUpload = async () => {
        if (!modalControl || !modalType || !modalStepId || !modalFile) return
        setLoading(true)
        const form = new FormData()
        form.append(`${modalType}file`, modalFile)
        form.append('comments', modalComment)     // ← append comment

        try {
            await CustomAxios.patch(
                `${baseurl}/${initURL}/audit-controls/${modalControl}/evidence`,
                form,
                {
                    params: {
                        type: modalType,
                        stepId: modalStepId,
                    },
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                }
            )
            fetchControls()
            toast.success('Evidence uploaded!')
            setModalOpen(false)
        } catch {
            toast.error('Upload failed')
        } finally {
            setLoading(false)
        }
    }

    // Open docs modal
    const openDocs = (control, type, idx, stepId) => {
        const step = type === 'tod' ? control.todTests[idx] : control.toeTests[idx]
        setDocsList(step.evidences)
        setDocsStepLabel(`${type.toUpperCase()} Step ${idx + 1}`)
        setDocsOpen(true)
        setModalType(type)
        setModalStepId(stepId)
        setModalControl(control._id)
    }


    const handleRowSave = async (evidence) => {
        const payload = {
            reviewerStatus: evidence.reviewerStatus,
            reviewerComments: evidence.reviewerComments,
            approverStatus: evidence.approverStatus,
            approverComments: evidence.approverComments,
        }
        setLoading(true)

        try {
            await CustomAxios.patch(
                `${baseurl}/${initURL}/audit-controls/${modalControl}/evidence/bulk-update`,
                payload,
                {
                    params: {
                        type: modalType,
                        stepId: modalStepId,
                        evidenceId: evidence._id,    // ← use the mongo _id here
                    },
                }
            )
            toast.success('Row saved!')
            fetchControls()
        } catch {
            toast.error('Save failed')
        } finally {
            setLoading(false)
        }
    }

    // before your return(...)
    const stepStatus = docsList.length === 0
        ? 'No evidence available'
        : docsList.every(doc =>
            doc.reviewerStatus === 'Approved' &&
            doc.approverStatus === 'Approved'
        )
            ? 'Approved'
            : 'Pending';

    const getUserDisplayName = (user) => {
        if (!user) return '—'

        const nameParts = [user.first_name, user.last_name].filter(Boolean)
        if (nameParts.length) return nameParts.join(' ')

        if (user.user_name) return user.user_name
        if (user.email) return user.email

        return '—'
    }

    const handleFileView = async (filePath) => {
        try {
            const response = await CustomAxios.post(`${baseurl}/${initURL}/audit-controls/getReturnFile`, {
                filePath: filePath  // Send the encoded file path as a query parameter
            });
            let data = response.data
            console.log(response.data); // Log the response data or handle accordingly
            if (data.success && data.presignedUrl) {
                // Open the file in a new tab
                window.open(data.presignedUrl, "_blank");
            } else {
                toast.error("Could not retrieve the document");
            }
        } catch (error) {
            toast.error("Could not retrieve the document");
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
        return <div className="my-12 text-center text-gray-500">
            <FiFlag className="mx-auto mb-2 text-3xl text-gray-300" />
            <p className="text-lg">No controls found for this audit area.</p>
            <p className="text-sm">Please add controls to proceed with the audit.</p>
        </div>
    }

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <ProcessOverview
                setSelectedProcess={setSelectedProcess}
                selectedProcess={selectedProcess}
            />

            {controls?.map(control => (
                <div key={control._id} className="bg-white rounded-lg shadow-lg p-6 mt-4">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-2xl font-semibold text-gray-900 flex items-center gap-2">
                            <FiTag className="text-indigo-600" /> {control.controlID}: {control.name}
                        </h2>

                        <div className="flex items-center gap-6 text-sm text-gray-600">
                            {/* Reviewer */}
                            <div className="flex items-center gap-1">
                                <FiUsers className="text-green-500" /> <strong>Reviewer:</strong>{' '}
                                {getUserDisplayName(control.reviewer)}
                            </div>

                            {/* Approver */}
                            <div className="flex items-center gap-1">
                                <FiUsers className="text-purple-500" /> <strong>Approver:</strong>{' '}
                                {getUserDisplayName(control.approver)}
                            </div>

                            {/* Control Status */}
                            <div className="flex items-center gap-1">
                                <FiShield className="text-yellow-500" /> <strong>Control Status:</strong> {control.status}
                            </div>

                            {/* Control Priority */}
                            <div className="flex items-center gap-1">
                                <FiFlag className="text-red-500" /> <strong>Control Priority:</strong> {control.priority}
                            </div>
                        </div>
                    </div>

                    {/* Metadata */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 text-gray-700 text-sm">
                        <div className="flex items-center gap-2">
                            <FiEye className="text-blue-500" />
                            <span><strong>Description:</strong> {control.description}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <FiTag className="text-indigo-500" />
                            <span><strong>Category:</strong> {control.category}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <FiUsers className="text-green-500" />
                            <span><strong>Objective:</strong> {control.objective}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <FiLayers className="text-purple-500" />
                            <span><strong>Audit Area:</strong> {control.processArea}</span>
                        </div>
                    </div>


                    {/* TOD Steps */}
                    <div className="mb-6 space-y-4">
                        {control.todTests.map((t, idx) => {
                            const sel = proofs[control._id]?.tod[idx]
                            return (
                                <div key={idx} className="flex items-center justify-between gap-4">
                                    <div className="flex-1 text-sm">
                                        <label className="font-medium">TOD Test Step {idx + 1}</label>
                                        <div className="pl-2">{t.step}</div>
                                    </div>
                                    <div className="flex-1 text-sm">
                                        <label className="font-medium">Artefact</label>
                                        <div className="pl-2">{t.artefact}</div>
                                    </div>
                                    <button
                                        onClick={() => openUpload(control._id, 'tod', idx, t._id)}
                                        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
                                    >
                                        Upload Evidence
                                    </button>
                                    <button
                                        onClick={() => openDocs(control, 'tod', idx, t._id)}
                                        className="flex items-center gap-1 bg-gray-200 hover:bg-gray-300 text-gray-800 px-3 py-1 rounded"
                                    >
                                        <FiFileText className="text-indigo-600" /> TOD Status
                                    </button>
                                </div>
                            )
                        })}
                    </div>

                    {/* TOE Steps */}
                    <div className="mb-6 space-y-4">
                        {control.toeTests.map((t, idx) => {
                            const sel = proofs[control._id]?.toe[idx]
                            return (
                                <div key={idx} className="flex items-center justify-between gap-4">
                                    <div className="flex-1 text-sm">
                                        <label className="font-medium">TOE Test Step {idx + 1}</label>
                                        <div className="pl-2">{t.step}</div>
                                    </div>
                                    <div className="flex-1 text-sm">
                                        <label className="font-medium">Artefact</label>
                                        <div className="pl-2">{t.artefact}</div>
                                    </div>
                                    <button
                                        onClick={() => openUpload(control._id, 'toe', idx, t._id)}
                                        className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
                                    >
                                        Upload Evidence
                                    </button>
                                    <button
                                        onClick={() => openDocs(control, 'toe', idx, t._id)}
                                        className="flex items-center gap-1 bg-gray-200 hover:bg-gray-300 text-gray-800 px-3 py-1 rounded"
                                    >
                                        <FiFileText className="text-indigo-600" /> TOE Status
                                    </button>
                                </div>
                            )
                        })}
                    </div>
                </div>
            ))}

            {modalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md space-y-4">
                        <h2 className="text-xl font-semibold">
                            Upload {modalType?.toUpperCase()} Evidence
                        </h2>

                        {/* Comments input */}
                        <textarea
                            value={modalComment}
                            onChange={(e) => setModalComment(e.target.value)}
                            placeholder="Add comments (optional)"
                            className="w-full p-2 border border-gray-300 rounded h-24 resize-none"
                        />

                        {/* File input */}
                        <input
                            type="file"
                            accept=".pdf,.docx,.xlsx"
                            onChange={onModalFileChange}
                            className="w-full"
                        />

                        {/* Actions */}
                        <div className="flex justify-end space-x-4">
                            <button
                                onClick={() => setModalOpen(false)}
                                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleModalUpload}
                                disabled={!modalFile}
                                className="px-6 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
                            >
                                Upload
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {docsOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-6xl overflow-auto ">
                        <div className="flex justify-between">
                            <div>
                                <h2 className="text-xl font-semibold mb-4">{docsStepLabel} — Documents</h2>
                            </div>

                            <div className="flex items-center gap-2 mb-4">
                                <FiShield className="text-yellow-600" />
                                <span className="font-medium">
                                    {modalType.toUpperCase()} Status: {stepStatus}
                                </span>
                            </div>
                        </div>
                        <table className="min-w-full divide-y divide-gray-200 text-sm rounded-xl">
                            <thead className="bg-[#2B245C] text-white">
                                <tr>
                                    {[
                                        'File',
                                        'Comments',
                                        'Uploaded',
                                        'Reviewer Status',
                                        'Reviewer Comments',
                                        'Approver Status',
                                        'Approver Comments',
                                        'Action',
                                    ].map((label, i) => (
                                        <th
                                            key={i}
                                            className={`px-4 py-2 font-medium  text-center`}
                                        >
                                            {label}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {docsList.map((doc, idx) => (
                                    <tr
                                        key={idx}
                                        className="odd:bg-white even:bg-gray-50 hover:bg-gray-100 transition-colors text-center"
                                    >
                                        <td className="px-4 py-3">
                                            <td className="px-4 py-3">
                                                <button
                                                    onClick={() => handleFileView(doc.fileDestination)} // Call the function with file path
                                                    className="inline-flex items-center gap-1 text-indigo-600 hover:underline"
                                                >
                                                    <FiFileText /> View
                                                </button>
                                            </td>

                                        </td>
                                        <td className="px-4 py-3">{doc.comments || '—'}</td>
                                        <td className="px-4 py-3">
                                            {new Date(doc.uploadedAt).toLocaleDateString('en-GB', {
                                                day: '2-digit', month: 'short', year: 'numeric'
                                            })}
                                        </td>
                                        <td className="px-4 py-3">
                                            <select
                                                value={doc.reviewerStatus || ''}
                                                onChange={e => {
                                                    const updated = [...docsList]
                                                    updated[idx] = { ...updated[idx], reviewerStatus: e.target.value }
                                                    setDocsList(updated)
                                                }}
                                                className="w-full border rounded px-2 py-1"
                                            >
                                                <option value="" disabled>Reviewer status…</option>
                                                <option>Pending</option>
                                                <option>Approved</option>
                                                <option>Rejected</option>
                                            </select>
                                        </td>
                                        <td className="px-4 py-3">
                                            <input
                                                type="text"
                                                placeholder="Reviewer comments"
                                                value={doc.reviewerComments || ''}
                                                onChange={e => {
                                                    const updated = [...docsList]
                                                    updated[idx] = { ...updated[idx], reviewerComments: e.target.value }
                                                    setDocsList(updated)
                                                }}
                                                className="w-full border rounded px-2 py-1"
                                            />
                                        </td>
                                        <td className="px-4 py-3">{doc.approverStatus || "—"}</td>
                                        <td className="px-4 py-3">{doc.approverComments || "—"}</td>
                                        <td className="px-4 py-3 text-center">
                                            <button
                                                onClick={() => handleRowSave(doc)}   // pass the doc object
                                                className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 transition"
                                            >
                                                Save
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {/* Close button */}
                        <div className="flex justify-end mt-6">
                            <button
                                onClick={() => setDocsOpen(false)}
                                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 transition"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    )
}
