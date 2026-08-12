// src/components/AuditTopicSelect.js
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { baseurl, initURL } from "../../../BaseUrl";
import CustomAxios from "../CustomAxios";
import { HiChevronDown } from "react-icons/hi";

export default function AuditTopicSelect({
    value = "",
    onChange,
    placeholder = "Select audit topic",
    disabled = false,
    className = "",
    setSelectedTopicObj,
    selectedTopicObj
}) {
    const router = useRouter();
    const { programId } = router.query || {};
    const [topics, setTopics] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!programId) return;
        setLoading(true);
        setError(null);
        CustomAxios.get(`${baseurl}/${initURL}/audit-universe/program/${programId}`)
            .then((res) => setTopics(res.data))
            .catch((err) => setError(err.response?.statusText || err.message))
            .finally(() => setLoading(false));
    }, [programId]);

    const handleSelect = (e) => {
        const id = e.target.value;
        onChange?.(id);
        const obj = topics.find((t) => t._id === id) || null;
        setSelectedTopicObj(obj);

        // push `uid=<selectedId>` into the URL, preserving other query params
        router.push(
            {
                pathname: router.pathname,
                query: {
                    ...router.query,
                    uid: id || undefined,
                },
            },
            undefined,
            { shallow: true }
        );
    };

    return (
        <div className={`w-full ${className}`}>
            {error && <p className="text-red-500 mb-2 text-sm">{error}</p>}

            <div className="flex items-start justify-between mb-4">
                {/* Left placeholder/pills container */}
                <div className="flex-1 min-w-[200px] flex flex-wrap gap-2">
                    {selectedTopicObj && [
                        ['Unit', selectedTopicObj.unit?.name],
                        ['Dept.', selectedTopicObj.department?.departmentName],
                        ['Biz Area', selectedTopicObj.businessArea?.name],
                        ['Audit Area', selectedTopicObj.processArea?.name],
                        ['finalPriority', selectedTopicObj?.finalPriority],
                    ].map(([label, val]) => (
                        <div
                            key={label}
                            className="flex items-center bg-white border border-gray-200 rounded-full px-3 py-1 shadow-sm"
                        >
                            <span className="text-xs font-medium text-gray-500 uppercase mr-1">
                                {label}:
                            </span>
                            <span
                                className="text-sm text-gray-800 truncate max-w-[100px]"
                                style={{ maxWidth: '100px' }}
                            >
                                {val || '—'}
                            </span>
                        </div>
                    ))}
                </div>

                {/* Select Box always right-aligned */}
                <div className="relative w-64 flex-shrink-0">
                    <select
                        className="appearance-none
 block w-full bg-white border border-gray-300 rounded-lg px-3 py-2 pr-9 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
                        value={value}
                        onChange={handleSelect}
                        disabled={disabled || loading || !programId}
                    >
                        <option value="">
                            {!programId ? "No program" : loading ? "Loading…" : placeholder}
                        </option>
                        {topics.map((topic) => (
                            <option key={topic._id} value={topic._id}>
                                {topic.processArea?.name || "—"} (Period: {topic.auditPeriod || "—"})
                            </option>
                        ))}
                    </select>
                    <HiChevronDown className="pointer-events-none absolute top-1/2 right-3 transform -translate-y-1/2 text-gray-400" />
                </div>
            </div>
        </div>
    );
}


const PRIORITY_RATINGS = ['Low', 'Moderate', 'High', 'Extreme'];


function getBadgeClasses(rating) {
    switch (rating) {
        case 'Low': return 'bg-green-100 text-green-800';
        case 'Moderate': return 'bg-blue-100 text-blue-800';
        case 'High': return 'bg-yellow-100 text-yellow-800';
        case 'Extreme': return 'bg-red-100 text-red-800';
        default: return 'bg-gray-100 text-gray-800';
    }
}

export function PriorityAreaInput({
    heading = 'New Identified Priorities Based on Business Context',
    items = [],
    onAdd,
    className = '',
}) {
    const [area, setArea] = useState('');
    const [rating, setRating] = useState('');

    const handleAdd = () => {
        if (!area.trim() || !rating) return;
        onAdd && onAdd({ area: area.trim(), rating });
        setArea('');
        setRating('');
    };

    return (
        <div className={`bg-white shadow-md rounded-lg p-4 ${className} mb-4`}>
            <h3 className="text-xl font-bold text-indigo-700 mr-4 mb-3">
                {heading}
            </h3>

            {/* Input Row */}
            <div className="flex flex-col md:flex-row md:items-center gap-4 mb-6">
                <input
                    type="text"
                    value={area}
                    onChange={(e) => setArea(e.target.value)}
                    placeholder="Priority Area"
                    className="w-full md:w-60 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
                />

                <select
                    value={rating}
                    onChange={(e) => setRating(e.target.value)}
                    className="w-full md:w-40 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
                >
                    <option value="">Select Rating</option>
                    {PRIORITY_RATINGS.map((r) => (
                        <option key={r} value={r}>{r}</option>
                    ))}
                </select>

                <button
                    onClick={handleAdd}
                    disabled={!area.trim() || !rating}
                    className="w-full md:w-auto px-6 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition"
                >
                    Add
                </button>
            </div>

            {/* Items List */}
            {items.length > 0 && (
                <ul className="list-disc pl-5 space-y-2">
                    {items.map(({ area, rating }, idx) => (
                        <li key={idx} className="text-gray-800">
                            <strong>{area}:</strong> <span className={`font-semibold px-2 py-1 rounded-full ${getBadgeClasses(rating)}`}>{rating}</span>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

