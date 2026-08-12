// src/components/AuditPlanning.jsx
import dayGridPlugin from '@fullcalendar/daygrid'
import interactionPlugin from '@fullcalendar/interaction'
import FullCalendar from '@fullcalendar/react'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import {
    FiAlertTriangle,
    FiArrowRight,
    FiBarChart2,
    FiBookOpen,
    FiBriefcase,
    FiCalendar,
    FiEdit3,
    FiEye,
    FiFlag,
    FiLayers,
    FiMapPin,
    FiSave,
    FiSettings,
    FiShield,
    FiTag,
    FiTrendingUp,
    FiUser,
    FiUsers,
    FiX
} from 'react-icons/fi'
import { toast } from 'react-toastify'
import { baseurl, initURL } from '../../../BaseUrl'
import CustomAxios from '../CustomAxios'
import Loader from '../loader/Loader'


export default function AuditPlanning() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const { programId, auditArea } = router.query || {}
    const [error, setError] = useState(null)
    const [processes, setProcesses] = useState([])
    const [dates, setDates] = useState({})
    const [showCalendar, setShowCalendar] = useState(false)
    const [selected, setSelected] = useState(null)

    // Load processes
    useEffect(() => {
        if (!programId) return
        setLoading(true)
        CustomAxios.get(`${baseurl}/${initURL}/audit-universe/program/${programId}`)
            .then(({ data }) => setProcesses(data))
            .catch(err => setError(err.message))
            .finally(() => setLoading(false))
    }, [programId])

    // Initialize date inputs from existing auditStartDate/auditEndDate
    useEffect(() => {
        const init = {}
        processes.forEach(p => {
            init[p._id] = {
                start: p.auditStartDate
                    ? p.auditStartDate.slice(0, 10)
                    : '',
                end: p.auditEndDate
                    ? p.auditEndDate.slice(0, 10)
                    : ''
            }
        })
        setDates(init)
    }, [processes])

    const handleDateChange = (id, field, val) =>
        setDates(d => ({ ...d, [id]: { ...d[id], [field]: val } }))

    const handleSave = async (process) => {
        const { start, end } = dates[process._id] || {}
        if (!start || !end) {
            return toast.error('Please select both audit start and end dates before saving.');
        }

        const payload = {}
        if (start) payload.auditStartDate = new Date(start).toISOString()
        if (end) payload.auditEndDate = new Date(end).toISOString()
        setLoading(true)
        try {
            // PATCH only the process entity
            await CustomAxios.patch(
                `${baseurl}/${initURL}/audit-universe/${process._id}/dates`,
                payload
            )
            toast.success('Audit dates updated.')
        } catch (err) {
            console.error(err)
            toast.error('Failed to update audit dates.')
        } finally {
            setLoading(false)
        }
    }

    const events = processes
        .filter(p => p.processArea.auditStartDate && p.processArea.auditEndDate)
        .map(p => ({
            id: p._id,
            title: p.processArea.name,
            start: p.processArea.auditStartDate.slice(0, 10), // "YYYY-MM-DD"
            end:   // FullCalendar’s “end” is exclusive, so add one day or leave it if back-to-back doesn’t matter
                new Date(new Date(p.processArea.auditEndDate).getTime() + 24 * 60 * 60 * 1000)
                    .toISOString()
                    .slice(0, 10)
        }))

    const fetchHierarchy = async () => {
        try {
            const res = await CustomAxios.get(
                `${baseurl}/${initURL}/audit-charter/fetch-all-data`
            )
            setData(res.data)
        } catch (err) {
            console.error(err)
        }
    }

    if (loading) {
        return (
            <div className="h-[75vh] flex items-center justify-center">
                <Loader />
            </div>
        )
    }

    return (
        <div className="flex flex-col lg:flex-row gap-8 p-3 bg-gray-100">

            {/* <button
                onClick={fetchHierarchy}
                className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50"
            >
                fetch data
            </button> */}
            <div className="flex-1 bg-white rounded-2xl shadow-xl p-6 flex flex-col">
                <div className="flex justify-end mb-6">
                    <button
                        onClick={() => setShowCalendar(true)}
                        className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2 rounded-lg hover:bg-indigo-700"
                    >
                        <FiCalendar /> View Calendar
                    </button>
                </div>

                <div className="overflow-x-auto flex-1 rounded-lg">
                    <table className="min-w-full divide-y divide-gray-200 text-sm">
                        <thead className="bg-[#2B245C] sticky top-0">
                            <tr>
                                {[
                                    'Unit/Division',
                                    'Audit Area',
                                    'Audit Period',
                                    'Priority',
                                    'Status',
                                    'Last Audit Date',
                                    'Audit Start Date',
                                    'Audit End Date',
                                    'Actions'
                                ].map(h => (
                                    <th
                                        key={h}
                                        className="px-6 py-2 text-center text-white uppercase"
                                    >
                                        {h}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-100">
                            {processes.length > 0 ? processes.map((p, idx) => (
                                <tr
                                    key={p._id}
                                    className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
                                >
                                    <td className="px-3 py-3 text-center">{p.unit.name}</td>
                                    <td className="px-3 py-3 text-center">{p.processArea.name}</td>
                                    <td className="px-3 py-3 text-center">{p.auditPeriod ?? '—'}</td>
                                    <td className="px-3 py-3 text-center">
                                        <span
                                            className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${p.finalPriority === 'High'
                                                ? 'bg-red-100 text-red-800'
                                                : p.finalPriority === 'Medium'
                                                    ? 'bg-yellow-100 text-yellow-800'
                                                    : 'bg-green-100 text-green-800'
                                                }`}
                                        >
                                            {p.finalPriority}
                                        </span>
                                    </td>
                                    <td className="px-3 py-3 text-center">
                                        {p.auditStatus || '—'}
                                    </td>
                                    <td className="px-3 py-3 text-center">
                                        {p.processArea.lastAuditDate
                                            ? new Date(p.processArea.lastAuditDate).toLocaleDateString()
                                            : '—'}
                                    </td>
                                    <td className="px-3 py-3">
                                        <input
                                            type="date"
                                            value={dates[p._id]?.start || ''}
                                            onChange={e =>
                                                handleDateChange(p._id, 'start', e.target.value)
                                            }
                                            className="w-full border rounded px-2 py-1 text-sm focus:ring-indigo-400"
                                        />
                                    </td>
                                    <td className="px-3 py-3">
                                        <input
                                            type="date"
                                            value={dates[p._id]?.end || ''}
                                            onChange={e =>
                                                handleDateChange(p._id, 'end', e.target.value)
                                            }
                                            className="w-full border rounded px-2 py-1 text-sm focus:ring-indigo-400"
                                        />
                                    </td>
                                    <td className="px-3 py-3 flex justify-center gap-2">
                                        <button
                                            onClick={() => handleSave(p)}
                                            className="flex items-center gap-1 bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
                                        >
                                            <FiSave size={16} /> Save
                                        </button>
                                        <button
                                            onClick={() =>
                                                router.push(
                                                    {
                                                        pathname: '/audit/internal-audit',
                                                        query: {
                                                            mainTab: 'performingAudit',
                                                            subTab: 'Scheduling',
                                                            programId,
                                                            auditArea: p?.processArea?._id,
                                                            uId: p?._id
                                                        }
                                                    },
                                                    undefined,
                                                    { shallow: true }
                                                )
                                            }
                                            className="flex items-center bg-indigo-500 text-white px-3 py-1 rounded hover:bg-indigo-600"
                                        >
                                            <FiArrowRight size={16} /> Perform Audit
                                        </button>
                                        <button
                                            onClick={() => setSelected(p)}
                                            className="text-gray-600 hover:text-gray-800"
                                            title="View Details"
                                        >
                                            <FiEye size={18} />
                                        </button>
                                    </td>
                                </tr>
                            )) : <tr>
                                <td
                                    colSpan={8}
                                    className="px-6 py-4 text-center text-gray-500"
                                >
                                    Data not present
                                </td>
                            </tr>}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Calendar Modal */}
            {showCalendar && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-full overflow-auto">
                        <div className="flex justify-between items-center border-b px-6 py-4">
                            <h3 className="text-2xl font-semibold text-gray-800">Audit Calendar</h3>
                            <button onClick={() => setShowCalendar(false)} className="text-gray-500 hover:text-gray-700">
                                <FiX size={28} />
                            </button>
                        </div>
                        <div className="p-6">
                            <FullCalendar
                                plugins={[dayGridPlugin, interactionPlugin]}
                                initialView="dayGridMonth"
                                headerToolbar={{
                                    left: 'prev,next today',
                                    center: 'title',
                                    right: 'dayGridMonth,dayGridWeek,dayGridDay,dayGridYear'  // add our custom year button
                                }}
                                events={events}
                                height={640}
                                eventColor="#6366F1"
                                eventTextColor="#ffffff"
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* Detail Modal */}
            {selected && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-full overflow-auto">
                        {/* Header */}
                        <div className="flex justify-between items-center border-b px-6 py-4 bg-[#2B245C] text-white">
                            <h3 className="text-2xl font-semibold flex items-center gap-2 text-white whitespace-nowrap">
                                Process Details
                            </h3>
                            <button
                                onClick={() => setSelected(null)}
                                className="text-white hover:text-gray-200 transition"
                                title="Close"
                            >
                                <FiX size={28} />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-3 text-gray-700">
                            <div className="flex items-center gap-2 whitespace-nowrap">
                                <FiTag className="text-indigo-500" />
                                <span className="font-semibold">Type:</span> {selected?.type}
                            </div>

                            <div className="flex items-center gap-2 whitespace-nowrap">
                                <FiMapPin className="text-indigo-500" />
                                <span className="font-semibold">Location:</span> {selected?.unit?.location}
                            </div>

                            <div className="flex items-center gap-2 whitespace-nowrap">
                                <FiUsers className="text-indigo-500" />
                                <span className="font-semibold">Unit:</span> {selected?.unit?.name}
                            </div>

                            <div className="flex items-center gap-2 whitespace-nowrap">
                                <FiUser className="text-indigo-500" />
                                <span className="font-semibold">Unit Head:</span> {selected?.unit?.head}
                            </div>

                            <div className="flex items-center gap-2 whitespace-nowrap">
                                <FiBriefcase className="text-indigo-500" />
                                <span className="font-semibold">Department:</span> {selected?.department?.departmentName}
                            </div>

                            <div className="flex items-center gap-2 whitespace-nowrap">
                                <FiShield className="text-indigo-500" />
                                <span className="font-semibold">Dept Head:</span> {selected?.department?.departmentHead}
                            </div>

                            <div className="flex items-center gap-2 whitespace-nowrap">
                                <FiBookOpen className="text-indigo-500" />
                                <span className="font-semibold">Audit Topic:</span> {selected?.processArea?.name}
                            </div>

                            <div className="flex items-center gap-2 whitespace-nowrap">
                                <FiSettings className="text-indigo-500" />
                                <span className="font-semibold">Audit Area:</span> {selected?.processArea?.name}
                            </div>

                            <div className="flex items-center gap-2 whitespace-nowrap">
                                <FiLayers className="text-indigo-500" />
                                <span className="font-semibold">Business Area:</span> {selected?.businessArea?.name}
                            </div>

                            <div className="flex items-center gap-2 whitespace-nowrap">
                                <FiBarChart2 className="text-indigo-500" />
                                <span className="font-semibold">Assurance Rating:</span> {selected?.overallAssuranceRating}
                            </div>

                            <div className="flex items-center gap-2 whitespace-nowrap">
                                <FiAlertTriangle className="text-indigo-500" />
                                <span className="font-semibold">Residual Risk:</span> {selected?.residualRisk}
                            </div>

                            <div className="flex items-center gap-2 whitespace-nowrap">
                                <FiFlag className="text-indigo-500" />
                                <span className="font-semibold">Final Priority:</span> {selected?.finalPriority}
                            </div>

                            <div className="flex items-center gap-2 whitespace-nowrap">
                                <FiTrendingUp className="text-indigo-500" />
                                <span className="font-semibold">Strategy Priority:</span> {selected?.strategyPriority}
                            </div>

                            <div className="sm:col-span-2 flex items-start gap-2">
                                <FiEdit3 className="text-indigo-500 mt-1" />
                                <span className="font-semibold whitespace-nowrap">Justification:</span>
                                <p className="ml-1 text-gray-600">{selected?.justification}</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
