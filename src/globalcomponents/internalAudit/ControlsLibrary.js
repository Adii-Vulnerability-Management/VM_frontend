// src/components/ControlsMitigatingRisk.js
import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import {
    FiEdit,
    FiPlus,
    FiTrash2
} from 'react-icons/fi'
import { toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import CustomAxios from '../CustomAxios'
import { baseurl, initURL } from '../../../BaseUrl'
import ProcessOverview from './ProcessOverview'
import Loader from '../loader/Loader'

const STATUS_OPTIONS = ['Effective', 'Ineffective']
const PRIORITY_OPTIONS = ['Low', 'Medium', 'High']

export default function ControlsMitigatingRisk() {
    const router = useRouter()
    const { programId, auditArea, uId } = router.query
    const [loading, setLoading] = useState(false)
    const [selectedProcess, setSelectedProcess] = useState(null)
    const blank = {
        controlID: '',
        name: '',
        description: '',
        status: 'Ineffective',
        priority: 'Medium',
        category: '',
        objective: '',
        processArea: selectedProcess?.processArea?.name || '',
        todTests: [{ step: '', artefact: '' }],
        toeTests: [{ step: '', artefact: '' }],
    }

    const [controls, setControls] = useState([])
    const [form, setForm] = useState(blank)
    const [editingIndex, setEditingIndex] = useState(null)

    const fetchControls = async () => {
        if (!programId || !auditArea) return
        setLoading(true)
        try {
            const { data } = await CustomAxios.get(
                `${baseurl}/${initURL}/audit-controls`,
                { params: { programId, auditAreaId: auditArea } }
            )
            setControls(data)
        } catch (err) {
            toast.error(err.message)
        } finally {
            setLoading(false)
        }
    }
    // Fetch controls when programId & auditArea are ready
    useEffect(() => {
        fetchControls()
    }, [programId, auditArea])

    // Keep processArea in the form updated
    useEffect(() => {
        if (!selectedProcess) return
        setForm(f => ({
            ...f,
            processArea: selectedProcess.processArea?.name || ''
        }))
    }, [selectedProcess])

    const handleChange = e => {
        const { name, value } = e.target
        setForm(f => ({ ...f, [name]: value }))
    }

    function addArrayItem(arrayName) {
        setForm(f => ({
            ...f,
            [arrayName]: [...f[arrayName], { step: '', artefact: '' }]
        }))
    }

    function removeArrayItem(arrayName, idx) {
        setForm(f => ({
            ...f,
            [arrayName]: f[arrayName].filter((_, i) => i !== idx)
        }))
    }

    function updateArrayField(arrayName, idx, field, value) {
        setForm(f => ({
            ...f,
            [arrayName]: f[arrayName].map((item, i) =>
                i === idx ? { ...item, [field]: value } : item
            )
        }))
    }

    const saveControl = async () => {
        const missingFields = [];

        if (!form.controlID.trim()) missingFields.push("Control ID");
        if (!form.name.trim()) missingFields.push("Name");
        if (!form.category.trim()) missingFields.push("Category");
        if (!form.objective.trim()) missingFields.push("Objective");
        if (!form.description.trim()) missingFields.push("Description");
        if (!form.processArea.trim()) missingFields.push("Process Area");

        // Validate TOD tests
        form.todTests.forEach((t, idx) => {
            if (!t.step.trim() || !t.artefact.trim()) {
                missingFields.push(`TOD Test ${idx + 1}`);
            }
        });

        // Validate TOE tests
        form.toeTests.forEach((t, idx) => {
            if (!t.step.trim() || !t.artefact.trim()) {
                missingFields.push(`TOE Test ${idx + 1}`);
            }
        });

        if (missingFields.length > 0) {
            toast.error(`Please complete: ${missingFields.join(', ')}`);
            return;
        }
        // Build payload without any nested _id fields
        const cleanPayload = {
            ...form,
            programId,
            auditAreaId: auditArea,
            todTests: form.todTests.map(({ step, artefact }) => ({ step, artefact })),
            toeTests: form.toeTests.map(({ step, artefact }) => ({ step, artefact }))
        }
        setLoading(true)
        try {
            if (editingIndex === null) {
                await CustomAxios.post(`${baseurl}/${initURL}/audit-controls`, cleanPayload)
                toast.success('Control created!')
            } else {
                const ctrl = controls[editingIndex]
                await CustomAxios.patch(
                    `${baseurl}/${initURL}/audit-controls/${ctrl._id}`,
                    cleanPayload
                )
                toast.success('Control updated!')
                setEditingIndex(null)
            }
            setForm(blank)
            await fetchControls()
        } catch (err) {
            toast.error(err.message)
        } finally {
            setLoading(false)
        }
    }

    const startEdit = idx => {
        const c = controls[idx]
        setForm({
            controlID: c.controlID,
            name: c.name,
            description: c.description,
            status: c.status,
            priority: c.priority,
            category: c.category,
            objective: c.objective,
            processArea: c.processArea,
            todTests: c.todTests,
            toeTests: c.toeTests,
        })
        setEditingIndex(idx)
    }

    const deleteControl = idx => {
        const c = controls[idx]
        CustomAxios.delete(`${baseurl}/${initURL}/audit-controls/${c._id}`)
            .then(() => {
                setControls(cs => cs.filter((_, i) => i !== idx))
                toast.success('Control deleted')
            })
            .catch(err => toast.error(err.message))
    }

    const cancelEdit = () => {
        setForm(blank)
        setEditingIndex(null)
    }

    if (loading) {
        return (
            <div className="h-[75vh] flex items-center justify-center">
                <Loader />
            </div>
        )
    }

    return (
        <div className="space-y-8 p-6">
            {/* Process selector */}
            <ProcessOverview
                setSelectedProcess={setSelectedProcess}
                selectedProcess={selectedProcess}
            />

            {/* Controls Form */}
            <div className="bg-white shadow-md rounded-lg p-6">
                <h2 className="text-2xl font-semibold mb-4">
                    {editingIndex === null ? 'Add New Control' : 'Edit Control'}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[
                        ['Control ID', 'controlID', 'CTRL001'],
                        ['Name', 'name', 'Enter name'],
                        ['Category', 'category', 'e.g. IT'],
                        ['Objective', 'objective', 'Describe objective'],
                    ].map(([label, name, placeholder]) => (
                        <div key={name}>
                            <label className="block text-sm font-medium text-gray-700">{label}</label>
                            <input
                                name={name}
                                value={form[name]}
                                onChange={handleChange}
                                placeholder={placeholder}
                                className="mt-1 w-full border border-gray-300 rounded-md p-2"
                            />
                        </div>
                    ))}

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Status</label>
                        <select
                            name="status"
                            value={form.status}
                            onChange={handleChange}
                            className="mt-1 w-full border border-gray-300 rounded-md p-2"
                        >
                            {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Priority</label>
                        <select
                            name="priority"
                            value={form.priority}
                            onChange={handleChange}
                            className="mt-1 w-full border border-gray-300 rounded-md p-2"
                        >
                            {PRIORITY_OPTIONS.map(p => <option key={p} value={p}>{p}</option>)}
                        </select>
                    </div>

                    <div className="md:col-span-2 lg:col-span-3">
                        <label className="block text-sm font-medium text-gray-700">Description</label>
                        <textarea
                            name="description"
                            rows={2}
                            value={form.description}
                            onChange={handleChange}
                            placeholder="Brief description"
                            className="mt-1 w-full border border-gray-300 rounded-md p-2"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Process Area</label>
                        <input
                            name="processArea"
                            value={form.processArea}
                            disabled
                            className="mt-1 w-full bg-gray-100 border border-gray-300 rounded-md p-2"
                        />
                    </div>
                </div>

                {/* TOD Tests */}
                <div className="mt-6">
                    {form.todTests.map((t, idx) => (
                        <div key={idx} className="flex gap-2 mb-2">
                            <div className="flex-1">
                                <label className="block text-sm font-medium text-gray-700 mb-1">TOD Test Step</label>
                                <input
                                    placeholder="e.g. Review policy"
                                    value={t.step}
                                    onChange={e => updateArrayField('todTests', idx, 'step', e.target.value)}
                                    className="w-full border border-gray-300 rounded-md p-2"
                                />
                            </div>
                            <div className="flex-1">
                                <label className="block text-sm font-medium text-gray-700 mb-1">TOD Artifact</label>
                                <input
                                    placeholder="e.g. PolicyExcerpt.pdf"
                                    value={t.artefact}
                                    onChange={e => updateArrayField('todTests', idx, 'artefact', e.target.value)}
                                    className="w-full border border-gray-300 rounded-md p-2"
                                />
                            </div>
                            <button
                                type="button"
                                onClick={() => removeArrayItem('todTests', idx)}
                                className="p-2 text-red-600"
                            >
                                <FiTrash2 />
                            </button>
                        </div>
                    ))}
                    <button
                        type="button"
                        onClick={() => addArrayItem('todTests')}
                        className="flex items-center gap-1 text-indigo-600"
                    >
                        <FiPlus /> Add TOD
                    </button>
                </div>

                {/* TOE Tests */}
                <div className="mt-6">
                    {form.toeTests.map((t, idx) => (
                        <div key={idx} className="flex gap-2 mb-2">
                            <div className="flex-1">
                                <label className="block text-sm font-medium text-gray-700 mb-1">TOE Test Step</label>
                                <input
                                    placeholder="e.g. Test user accounts"
                                    value={t.step}
                                    onChange={e => updateArrayField('toeTests', idx, 'step', e.target.value)}
                                    className="w-full border border-gray-300 rounded-md p-2"
                                />
                            </div>
                            <div className="flex-1">
                                <label className="block text-sm font-medium text-gray-700 mb-1">TOE Artifact</label>
                                <input
                                    placeholder="e.g. Results.xlsx"
                                    value={t.artefact}
                                    onChange={e => updateArrayField('toeTests', idx, 'artefact', e.target.value)}
                                    className="w-full border border-gray-300 rounded-md p-2"
                                />
                            </div>
                            <button
                                type="button"
                                onClick={() => removeArrayItem('toeTests', idx)}
                                className="p-2 text-red-600"
                            >
                                <FiTrash2 />
                            </button>
                        </div>
                    ))}
                    <button
                        type="button"
                        onClick={() => addArrayItem('toeTests')}
                        className="flex items-center gap-1 text-indigo-600"
                    >
                        <FiPlus /> Add TOE
                    </button>
                </div>

                {/* Form Actions */}
                <div className="mt-6 flex space-x-2">
                    <button
                        onClick={saveControl}
                        className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                    >
                        {editingIndex === null ? 'Add Control' : 'Save Changes'}
                    </button>
                    {editingIndex !== null && (
                        <button
                            onClick={cancelEdit}
                            className="px-6 py-2 bg-gray-300 rounded-md"
                        >
                            Cancel
                        </button>
                    )}
                </div>
            </div>

            {/* Controls Table */}


            {/* Controls Table */}
            <div className="bg-white shadow-md rounded-lg overflow-x-auto mt-8">
                <table className="min-w-full divide-y divide-gray-200 text-sm">
                    <thead className="bg-[#2B245C] text-white sticky top-0">
                        <tr>
                            {[
                                'ID', 'Name', 'Status', 'Priority',
                                'Category', 'Objective', 'Process',
                                'TOD Test Step', 'TOD Artefact',    // ← new
                                'TOE Test Step', 'TOE Artefact',    // ← new
                                'Actions'
                            ].map(h =>
                                <th
                                    key={h}
                                    className="px-4 py-3 text-center font-medium uppercase tracking-wider"
                                >
                                    {h}
                                </th>
                            )}
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-100">
                        {controls.map((c, i) => (
                            <tr key={c._id} className="hover:bg-gray-50 text-center">
                                <td className="px-4 py-2">{c.controlID}</td>
                                <td className="px-4 py-2">{c.name}</td>
                                <td className="px-4 py-2">{c.status}</td>
                                <td className="px-4 py-2">{c.priority}</td>
                                <td className="px-4 py-2">{c.category}</td>
                                <td className="px-4 py-2">{c.objective}</td>
                                <td className="px-4 py-2">{c.processArea}</td>

                                {/* TOD Step */}
                                <td className="px-4 py-2">
                                    {c.todTests.map((t, j) => (
                                        <div key={j}>{j + 1}. {t.step}</div>
                                    ))}
                                </td>
                                {/* TOD Artefact */}
                                <td className="px-4 py-2">
                                    {c.todTests.map((t, j) => (
                                        <div key={j}>{j + 1}. {t.artefact}</div>
                                    ))}
                                </td>

                                {/* TOE Step */}
                                <td className="px-4 py-2">
                                    {c.toeTests.map((t, j) => (
                                        <div key={j}>{j + 1}. {t.step}</div>
                                    ))}
                                </td>
                                {/* TOE Artefact */}
                                <td className="px-4 py-2">
                                    {c.toeTests.map((t, j) => (
                                        <div key={j}>{j + 1}. {t.artefact}</div>
                                    ))}
                                </td>

                                {/* Actions */}
                                <td className="px-4 py-2 space-x-2">
                                    <button
                                        onClick={() => startEdit(i)}
                                        className="p-1 bg-yellow-500 text-white rounded-md"
                                    >
                                        <FiEdit />
                                    </button>
                                    <button
                                        onClick={() => deleteControl(i)}
                                        className="p-1 bg-red-500 text-white rounded-md"
                                    >
                                        <FiTrash2 />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

        </div>
    )
}
