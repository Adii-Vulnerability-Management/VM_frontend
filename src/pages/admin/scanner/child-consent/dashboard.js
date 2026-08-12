import React, { useState, useEffect } from "react";
import CustomAxios from "@/config/CustomAxios";
import { baseurl, initURL } from "@/config/config";
import { toast } from "react-toastify";

const formatKeyLabel = (key) => {
    return key
        .replace(/[-_]/g, " ")
        .replace(/([a-z])([A-Z])/g, "$1 $2")
        .replace(/\b\w/g, (char) => char.toUpperCase());
};

const renderValue = (value) => {
    if (typeof value === "boolean") return value ? "True" : "False";
    if (value === null || value === undefined) return "N/A";
    if (typeof value === "object") return JSON.stringify(value, null, 2);
    return value;
};

const ViewModal = ({ submission, closeModal }) => {
    if (!submission) return null;

    const fields = [
        "domain",
        "formId",
        "flowType",
        "consentCategory",
        "status",
        "parentVerificationStatus",
        "values",
    ];

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 px-4 py-6">
            <div className="relative w-full max-w-5xl rounded-3xl bg-white shadow-2xl ring-1 ring-black/10 overflow-hidden">
                <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-[#2B245C] px-8 py-6 text-white">
                    <div className="flex items-center justify-between gap-4">
                        <div>
                            <p className="text-sm uppercase tracking-[0.24em] text-slate-300">Submission Details</p>
                            <h2 className="mt-2 text-3xl text-white font-semibold">{submission.formId || submission._id || "Child Consent"}</h2>
                        </div>
                        <button
                            onClick={closeModal}
                            title="Close"
                            className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
                        >
                            <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>

                <div className="max-h-[80vh] overflow-y-auto px-8 py-6">
                    <div className="grid gap-6 lg:grid-cols-[1fr_minmax(420px,1.4fr)]">
                        <div className="space-y-5">
                            {fields.filter((fieldKey) => fieldKey !== "values").map((fieldKey) => {
                                if (!(fieldKey in submission)) return null;
                                const fieldValue = submission[fieldKey];
                                const isObjectValue = typeof fieldValue === "object" && fieldValue !== null;

                                return (
                                    <div key={fieldKey} className="rounded-3xl border border-slate-200 bg-slate-50 p-5 shadow-sm">
                                        <p className="text-xs uppercase tracking-[0.24em] text-slate-500">{formatKeyLabel(fieldKey)}</p>
                                        {isObjectValue ? (
                                            <pre className="mt-3 max-h-40 overflow-y-auto whitespace-pre-wrap break-words rounded-2xl bg-white p-4 text-xs text-slate-700 shadow-inner">
                                                {renderValue(fieldValue)}
                                            </pre>
                                        ) : (
                                            <p className="mt-3 text-lg font-semibold text-slate-900">{renderValue(fieldValue)}</p>
                                        )}
                                    </div>
                                );
                            })}
                        </div>

                        <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5 shadow-sm">
                            <div className="flex items-center justify-between gap-4">
                                <div>
                                    <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Values Payload</p>
                                    <p className="mt-1 text-sm text-slate-600">Detailed consent values and answers.</p>
                                </div>
                            </div>

                            {submission.values && typeof submission.values === "object" ? (
                                <div className="mt-5 grid gap-4">
                                    {Object.entries(submission.values).map(([valueKey, value]) => (
                                        <div key={valueKey} className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
                                            <p className="text-[11px] uppercase tracking-[0.24em] text-slate-500">{formatKeyLabel(valueKey)}</p>
                                            <p className="mt-2 text-sm font-medium text-slate-900 break-words">{renderValue(value)}</p>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <pre className="mt-5 max-h-[52vh] overflow-y-auto rounded-3xl bg-white p-4 text-xs text-slate-700 shadow-inner whitespace-pre-wrap break-words">
                                    {renderValue(submission.values)}
                                </pre>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-end gap-3 border-t border-slate-200 bg-slate-50 px-8 py-4">
                    <button
                        onClick={closeModal}
                        className="rounded-full bg-[#2B245C] px-6 py-2 text-sm font-semibold text-white shadow-md transition hover:bg-[#1f1b48]"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

const getField = (item, keys) => {
    for (const key of keys) {
        if (item?.[key] !== undefined && item?.[key] !== null) {
            return item[key];
        }
    }
    return "N/A";
};

const formatDate = (value) => {
    if (!value) return "N/A";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleString();
};

const Dashboard = () => {
    const [submissions, setSubmissions] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedSubmission, setSelectedSubmission] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    const fetchSubmissions = async () => {
        try {
            const { data } = await CustomAxios.get(`${baseurl}/${initURL}/child-consent-submissions`);
            const normalized = Array.isArray(data)
                ? data
                : Array.isArray(data?.data)
                    ? data.data
                    : data && typeof data === "object"
                        ? [data]
                        : [];
            setSubmissions(normalized);
        } catch (err) {
            console.error(err);
            toast.error("Error fetching child consent submissions. Please try again later.");
        }
    };

    useEffect(() => {
        fetchSubmissions();
    }, []);

    const handleViewClick = (submission) => {
        setSelectedSubmission(submission);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedSubmission(null);
    };

    const filterText = searchTerm.trim().toLowerCase();
    const filteredSubmissions = filterText
        ? submissions.filter((submission) =>
            JSON.stringify(submission).toLowerCase().includes(filterText)
        )
        : submissions;

    const totalSubmissions = submissions.length;
    const uniqueForms = new Set(submissions.map((item) => getField(item, ["formId", "form_id", "formId"])).filter((value) => value !== "N/A")).size;
    const uniqueTenants = new Set(submissions.map((item) => getField(item, ["tenantId", "tenant_id", "tenant"])).filter((value) => value !== "N/A")).size;

    const totalPages = Math.max(1, Math.ceil(filteredSubmissions.length / itemsPerPage));
    const safeCurrentPage = Math.min(Math.max(currentPage, 1), totalPages);
    const startIndex = (safeCurrentPage - 1) * itemsPerPage;
    const paginatedSubmissions = filteredSubmissions.slice(startIndex, startIndex + itemsPerPage);

    const handleItemsPerPageChange = (event) => {
        setItemsPerPage(Number(event.target.value));
        setCurrentPage(1);
    };

    const handlePageChange = (page) => {
        const nextPage = Math.min(Math.max(page, 1), totalPages);
        setCurrentPage(nextPage);
    };

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
        setCurrentPage(1);
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
            <div className="mx-5 bg-white rounded-lg p-5 my-3">
                <div className="px-6 py-8 bg-[#2B245C] rounded-2xl shadow-lg hover:shadow-2xl transition-shadow duration-300">
                    <h1 className="text-3xl font-bold text-cyan-50">Child Consent Submissions</h1>
                    <p className="mt-1 text-sm text-white">Review child consent submission records using the new submissions API.</p>
                </div>

                <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-blue-50 p-4 rounded-xl shadow-md border border-blue-200">
                        <h3 className="text-lg font-semibold text-gray-700">Total Submissions</h3>
                        <p className="text-2xl font-bold text-blue-700">{totalSubmissions}</p>
                    </div>
                    <div className="bg-green-50 p-4 rounded-xl shadow-md border border-green-200">
                        <h3 className="text-lg font-semibold text-gray-700">Unique Forms</h3>
                        <p className="text-2xl font-bold text-green-700">{uniqueForms}</p>
                    </div>
                    <div className="bg-indigo-50 p-4 rounded-xl shadow-md border border-indigo-200">
                        <h3 className="text-lg font-semibold text-gray-700">Unique Tenants</h3>
                        <p className="text-2xl font-bold text-indigo-700">{uniqueTenants}</p>
                    </div>
                </div>

                <div className="space-y-5 mt-5 rounded-2xl border border-[#2B245C] bg-white p-6 shadow-lg hover:shadow-2xl transition-shadow duration-300">
                    <div className="flex items-center w-full gap-2">
                        <label className="block text-sm font-medium text-gray-700">Search:</label>
                        <input
                            type="text"
                            placeholder="Search by any submission field..."
                            value={searchTerm}
                            onChange={handleSearchChange}
                            className="w-1/3 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                        />
                    </div>

                    <div className="overflow-x-auto rounded-lg border border-gray-800">
                        <table className="min-w-full text-sm">
                            <thead className="bg-[#2B245C] text-left text-white border-b border-gray-800">
                                <tr>
                                    <th className="py-2 px-4">Submission ID</th>
                                    <th className="py-2 px-4">Form ID</th>
                                    <th className="py-2 px-4">Tenant ID</th>
                                    <th className="py-2 px-4">Status</th>
                                    <th className="py-2 px-4">Submitted At</th>
                                    <th className="py-2 px-4 text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {paginatedSubmissions.length > 0 ? (
                                    paginatedSubmissions.map((submission, index) => {
                                        const submissionId = getField(submission, ["submissionId", "id", "_id", "submission_id"]);
                                        const formId = getField(submission, ["formId", "form_id", "formId"]);
                                        const tenantId = getField(submission, ["tenantId", "tenant_id", "tenant"]);
                                        const status = getField(submission, ["status", "state"]);
                                        const submittedAt = formatDate(getField(submission, ["submittedAt", "createdAt", "created_at", "timestamp", "date"]));

                                        return (
                                            <tr key={`${submissionId}-${index}`} className="border-b hover:bg-blue-50">
                                                <td className="py-2 px-4">{submissionId}</td>
                                                <td className="py-2 px-4">{formId}</td>
                                                <td className="py-2 px-4">{tenantId}</td>
                                                <td className="py-2 px-4">{status}</td>
                                                <td className="py-2 px-4">{submittedAt}</td>
                                                <td className="py-3 px-4">
                                                    <div className="flex justify-center items-center">
                                                        <button
                                                            onClick={() => handleViewClick(submission)}
                                                            className="rounded-lg border border-[#2B245C] bg-[#2B245C] px-3 py-1 text-sm font-semibold text-white hover:bg-opacity-90"
                                                        >
                                                            View
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan="6" className="text-center py-2 text-gray-500">No submissions available</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div className="text-sm text-gray-700 flex flex-col gap-3 md:flex-row md:justify-between md:items-center">
                        <div className="flex items-center space-x-3">
                            <span>Rows per page:</span>
                            <select
                                value={itemsPerPage}
                                onChange={handleItemsPerPageChange}
                                className="border p-2 rounded-md"
                            >
                                <option value={10}>10</option>
                                <option value={20}>20</option>
                                <option value={30}>30</option>
                                <option value={50}>50</option>
                            </select>
                        </div>

                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => handlePageChange(safeCurrentPage - 1)}
                                disabled={safeCurrentPage === 1}
                                className="rounded-lg bg-[#2B245C] text-white px-4 py-2 text-sm font-semibold shadow-md hover:shadow-lg hover:bg-opacity-90 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-200 ease-in-out"
                            >
                                Prev
                            </button>

                            <div>Page {safeCurrentPage} of {totalPages}</div>

                            <button
                                onClick={() => handlePageChange(safeCurrentPage + 1)}
                                disabled={safeCurrentPage === totalPages}
                                className="rounded-lg bg-[#2B245C] text-white px-4 py-2 text-sm font-semibold shadow-md hover:shadow-lg hover:bg-opacity-90 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-200 ease-in-out"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Fixed action buttons - vertical stack above content */}
            <div className="fixed bottom-20 right-5 flex flex-col items-center gap-3 z-40">
                <button
                    id="news_letteropt_in"
                    type="button"
                    className="w-14 h-14 flex items-center justify-center rounded-full bg-green-600 text-white shadow-lg hover:bg-green-700 transition-all duration-200"
                    title="Newsletter Opt-in"
                    aria-label="Open Newsletter Opt-in"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="w-7 h-7"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
                        />
                    </svg>
                </button>
            </div>

            {isModalOpen && <ViewModal submission={selectedSubmission} closeModal={closeModal} />}
        </div>
    );
};

export default Dashboard;
