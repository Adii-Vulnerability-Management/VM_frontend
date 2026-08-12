import Dialog from "@/components/ui/Dialog";
import Loader from "@/components/ui/Loader";
import Pagination from "@/components/ui/Pagination";
import CustomAxios from "@/config/CustomAxios";
import { baseurl, initURL } from "@/config/config";
import { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";

const FILTER_OPTIONS = [
    { key: "all", label: "All" },
    { key: "applicable", label: "Applicable" },
    { key: "notApplicable", label: "Not Applicable" },
];

export default function StatementOfApplicability() {
    const [tab, setTab] = useState("Governance");
    const [controls, setControls] = useState([]);
    const [rows, setRows] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterMode, setFilterMode] = useState("all");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedControl, setSelectedControl] = useState(null);

    // pagination
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 7;

    // Fetch combined controls + applicability
    async function fetchControlsWithApplicability() {
        setLoading(true);
        try {
            const { data } = await CustomAxios.get(
                `${baseurl}/${initURL}/iso42001/applicabilities/with-controls`
            );
            setControls(data);
            setError(null);
        } catch {
            setError("Failed to load controls.");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchControlsWithApplicability();
    }, []);

    // split by GOVERNANCE / AI
    const governData = useMemo(
        () => controls.filter(c => c.controlType === "GOVERNANCE"),
        [controls]
    );
    const aiData = useMemo(
        () =>
            controls
                .filter(c => c.controlType === "AI")
                .filter(c => !/^A\.\d+$/.test(c.controlId)),
        [controls]
    );

    // rebuild rows from controls whenever tab or controls change
    useEffect(() => {
        const source = tab === "Governance" ? governData : aiData;
        setRows(
            source.map(c => ({
                controlId: c.controlId,
                title: c.title,
                subtitle: c.subtitle,
                applicable: c.applicable,       // use saved value
                justification: c.justification, // use saved value
                controlMongoId: c._id
            }))
        );
        setFilterMode("all");
        setSearchTerm("");
        setCurrentPage(1);
    }, [tab, governData, aiData]);

    // update a single field in rows
    function updateRow(id, field, value) {
        setRows(r =>
            r.map(row =>
                row.controlId === id ? { ...row, [field]: value } : row
            )
        );
    }

    // filter + search, but use `controls` (the server snapshot) for the actual
    // “Applicable” / “Not Applicable” decision
    const filtered = useMemo(() => {
        return rows
            .filter(r => {
                if (filterMode === "applicable") {
                    const orig = controls.find(c => c._id === r.controlMongoId);
                    return Boolean(orig?.applicable);
                }
                if (filterMode === "notApplicable") {
                    const orig = controls.find(c => c._id === r.controlMongoId);
                    return !orig?.applicable;
                }
                return true;
            })
            .filter(r => {
                const t = searchTerm.toLowerCase();
                return (
                    r.controlId.toLowerCase().includes(t) ||
                    (r.title && r.title.toLowerCase().includes(t)) ||
                    (r.subtitle && r.subtitle.toLowerCase().includes(t))
                );
            });
    }, [rows, controls, filterMode, searchTerm]);

    // whenever the filtered list changes, reset to page 1
    useEffect(() => {
        setCurrentPage(1);
    }, [filtered]);

    // paginate
    const totalPages = Math.ceil(filtered.length / pageSize);
    const paginated = useMemo(() => {
        const start = (currentPage - 1) * pageSize;
        return filtered.slice(start, start + pageSize);
    }, [filtered, currentPage]);

    // save a single row back to the server
    async function handleRowSave(row) {
        if (row.applicable && (!row.justification || !row.justification.trim())) {
            toast.error('Please provide a justification for applicable controls.');
            return;
        }
        try {
            await CustomAxios.post(
                `${baseurl}/${initURL}/iso42001/applicabilities`,
                {
                    controlId: row.controlMongoId,
                    applicable: row.applicable,
                    justification: row.justification,
                }
            );
            await fetchControlsWithApplicability(); // re-fetch so filters update correctly 
            toast.success(`Saved ${row.controlId}`);
        } catch (err) {
            console.error(err);
            toast.error(`Failed to save ${row.controlId}`);
        }
    }

    if (loading) {
        return (
            <div className="h-[75vh] flex items-center justify-center">
                <Loader />
            </div>
        );
    }
    if (error) {
        return <p className="p-8 text-center text-red-500">{error}</p>;
    }

    return (
        <div className="min-h-screen bg-gray-100 p-2">
            {/* Details Dialog */}
            <Dialog
                isOpen={!!selectedControl}
                onClose={() => setSelectedControl(null)}
                title={selectedControl?.title || selectedControl?.subtitle}
            >
                {selectedControl?.description && (
                    <p className="mb-4">{selectedControl.description}</p>
                )}
                {selectedControl?.subsections.map(ss => (
                    <div key={ss._id} className="mb-4">
                        <h4 className="font-semibold">{ss.heading}</h4>
                        {ss.content && <p className="mt-1">{ss.content}</p>}
                        {ss.list?.length > 0 && (
                            <ul className="list-disc ml-5 mt-2">
                                {ss.list.map((item, i) => (
                                    <li key={i}>{item}</li>
                                ))}
                            </ul>
                        )}
                    </div>
                ))}
            </Dialog>

            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                {/* Tabs */}
                <div className="flex border-b border-gray-200 bg-white">
                    {["Governance", "AI"].map(lbl => (
                        <button
                            key={lbl}
                            onClick={() => setTab(lbl)}
                            className={`flex-1 text-center py-3 font-semibold transition ${tab === lbl
                                ? "border-b-2 border-[#2B245C] text-[#2B245C]"
                                : "text-gray-600 hover:bg-gray-50"
                                }`}
                        >
                            {lbl}
                        </button>
                    ))}
                </div>

                <div className="p-6 space-y-6">
                    {/* Filters + Search */}
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                        <div className="flex flex-wrap gap-2">
                            {FILTER_OPTIONS.map(({ key, label }) => (
                                <button
                                    key={key}
                                    onClick={() => setFilterMode(key)}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition ${filterMode === key
                                        ? "bg-[#2B245C] text-white"
                                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                        }`}
                                >
                                    {label}
                                </button>
                            ))}
                        </div>
                        <input
                            type="search"
                            placeholder="Search by ID or title…"
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="w-full md:w-1/3 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2B245C]"
                        />
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto rounded-lg">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-[#2B245C] text-white">
                                <tr>
                                    {[
                                        "ID",
                                        "Title",
                                        "Details",
                                        "Applicable",
                                        "Justification",
                                        "Save",
                                    ].map(h => (
                                        <th
                                            key={h}
                                            className="px-6 py-3 text-center text-sm font-semibold uppercase"
                                        >
                                            {h}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-100">
                                {paginated.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan={6}
                                            className="py-8 text-center text-gray-500"
                                        >
                                            No controls found.
                                        </td>
                                    </tr>
                                ) : (
                                    paginated.map(r => (
                                        <tr key={r.controlId} className="hover:bg-gray-50">
                                            <td className="px-6 py-3 text-center text-sm">
                                                {r.controlId}
                                            </td>
                                            <td className="px-6 py-3 text-center text-sm">
                                                {r.title || r.subtitle}
                                            </td>
                                            <td className="px-6 py-3 text-center">
                                                <button
                                                    onClick={() =>
                                                        setSelectedControl(
                                                            controls.find(
                                                                c => c.controlId === r.controlId
                                                            )
                                                        )
                                                    }
                                                    className="text-[#2B245C] underline hover:text-[#1f1a4f]"
                                                >
                                                    View Details
                                                </button>
                                            </td>
                                            <td className="px-6 py-3 text-center">
                                                <input
                                                    type="checkbox"
                                                    checked={r.applicable}
                                                    onChange={e =>
                                                        updateRow(
                                                            r.controlId,
                                                            "applicable",
                                                            e.target.checked
                                                        )
                                                    }
                                                    className="h-5 w-5 text-[#2B245C] rounded focus:ring-2 focus:ring-[#2B245C]"
                                                />
                                            </td>
                                            <td className="px-6 py-3">
                                                <textarea
                                                    rows={1}
                                                    value={r.justification}
                                                    onChange={e =>
                                                        updateRow(
                                                            r.controlId,
                                                            "justification",
                                                            e.target.value
                                                        )
                                                    }
                                                    className="w-full px-3 py-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2B245C]"
                                                    placeholder="Provide justification…"
                                                />
                                            </td>
                                            <td className="px-6 py-3 text-center">
                                                <button
                                                    onClick={() => handleRowSave(r)}
                                                    className="px-3 py-1 bg-[#2B245C] text-white rounded-lg hover:bg-[#1f1a4f]"
                                                >
                                                    Save
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={p => p >= 1 && p <= totalPages && setCurrentPage(p)}
                    />
                </div>
            </div>
        </div>
    );
}
