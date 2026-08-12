// src/components/AuditScheduling.jsx
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import CustomAxios from '../CustomAxios'
import { baseurl, initURL } from '../../../BaseUrl'
import {
    FiBriefcase,
    FiFlag,
    FiLayers,
    FiMapPin,
    FiTag
} from 'react-icons/fi'

export default function AuditScheduling({ selectedProcess, setSelectedProcess }) {
    const router = useRouter()
    const { programId, auditArea } = router.query

    const [processes, setProcesses] = useState([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)

    // fetch all processes for this program
    useEffect(() => {
        if (!programId) return
        setLoading(true)
        setError(null)
        CustomAxios.get(`${baseurl}/${initURL}/audit-universe/program/${programId}`)
            .then(res => {
                const all = res.data
                setProcesses(all)
                if (auditArea) {
                    const sel = all.find(p => p.processArea._id === auditArea) || null
                    setSelectedProcess(sel)
                }
            })
            .catch(err => setError(err.response?.statusText || err.message))
            .finally(() => setLoading(false))
    }, [programId, auditArea])



    if (loading) return <p>Loading…</p>
    if (error) return <p className="text-red-600">Error: {error}</p>
    if (!selectedProcess) return <p>Select an audit area to view its overview.</p>

    const p = selectedProcess


    const badge = (icon, label) => {
        let bg, fg
        switch (label) {
            case 'Extreme':
                bg = 'bg-red-100'; fg = 'text-red-800'; break
            case 'High':
                bg = 'bg-yellow-100'; fg = 'text-yellow-800'; break
            case 'Moderate':
                bg = 'bg-blue-100'; fg = 'text-blue-800'; break
            case 'Low':
            default:
                bg = 'bg-green-100'; fg = 'text-green-800'; break
        }
        return (
            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${bg} ${fg}`}>
                {icon}
                <span className="ml-1">{label}</span>
            </span>
        )
    }

    return (
        <div className="bg-white rounded-lg shadow p-6">
            <h1 className="text-2xl font-bold flex items-center gap-2 mb-4">
                <FiLayers className="text-indigo-600" /> Audit Area Overview
            </h1>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-gray-700 text-sm">
                <div className="flex items-center gap-1">
                    <FiMapPin /> <strong>Unit:</strong> {p.unit.name}, {p.unit.location}
                </div>
                <div className="flex items-center gap-1">
                    <FiBriefcase /> <strong>Dept:</strong> {p.department.departmentName}
                </div>
                <div className="flex items-center gap-1">
                    <FiTag /> <strong>Business Area:</strong> {p.businessArea.name}
                </div>
                <div className="flex items-center gap-1">
                    <FiLayers /> <strong>Audit Area:</strong> {p.processArea.name}
                </div>
                <div className="flex items-center gap-1">
                    <strong>Audit Prioritization Priority:</strong>{' '}
                    {badge(<FiFlag />, p.finalPriority)}
                </div>
            </div>
        </div>
    )
}
