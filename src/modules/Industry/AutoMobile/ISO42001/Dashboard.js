// src/components/ISO42001Dashboard.js
import Dialog from "@/components/ui/Dialog";
import CustomAxios from "@/config/CustomAxios";
import { baseurl, initURL } from "@/config/config";
import Loader from "@/globalcomponents/NewUi/Loader";
import Pagination from "@/globalcomponents/NewUi/Pagination";
import { ResponsivePie } from "@nivo/pie";
import Cookies from "js-cookie";
import { useEffect, useMemo, useState } from "react";
import { FiAlertCircle, FiCalendar, FiCheckCircle, FiFlag, FiLayers, FiRefreshCw, FiUser } from "react-icons/fi";

const CATEGORIES = {
    TOTAL: "Total Controls",
    EFFECTIVE: "Effective Controls",
    INEFFECTIVE: "Ineffective Controls",
    OVERDUE: "Overdue Controls",
    UNASSIGNED: "Unassigned Controls",
};

const STATUS_LABELS = {
    pending: "Pending",
    in_progress: "In Progress",
    completed: "Completed",
    approved: "Approved",
    rejected: "Rejected",
    Effective: "Effective",
    InEffective: "Ineffective",
};

const STATUS_CLASSES = {
    pending: "bg-yellow-100 text-yellow-800",
    in_progress: "bg-blue-100 text-blue-800",
    completed: "bg-green-100 text-green-800",
    approved: "bg-green-100 text-green-800",
    rejected: "bg-red-100 text-red-800",
    Effective: "bg-green-100 text-green-800",
    InEffective: "bg-red-100 text-red-800",
};

export default function ISO42001Dashboard() {
    const [items, setItems] = useState([]);      // full list
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [dialogList, setDialogList] = useState(null);
    const [selected, setSelected] = useState(null);
    const perPage = 5;
    const [userRole, setUserRole] = useState("");   // ← add

    async function load() {
        try {
            const user = JSON.parse(Cookies.get("user_data") || "{}");
            setUserRole(user?.user_designation);
            let url = "";
            // choose endpoint based on designation
            switch (user.user_designation) {
                case "Reviewer":
                    url = `${baseurl}/${initURL}/iso42001/applicabilities/reviewing`;
                    break;
                case "Approver":
                    url = `${baseurl}/${initURL}/iso42001/applicabilities/approving`;
                    break;
                case "Employee":
                    url = `${baseurl}/${initURL}/iso42001/applicabilities/assigned`;
                    break;
                default:
                    url = `${baseurl}/${initURL}/iso42001/applicabilities`;
            }
            const { data } = await CustomAxios.get(url);
            setItems(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        load();
    }, []);

    // --- SUMMARY (now on full items) ---
    const total = items.length;
    const effective = items.filter(i => i.controlStatus === "Effective").length;
    const ineffective = items.filter(i => i.controlStatus === "InEffective").length;
    const overdueCount = items.filter(
        i => i.dueDate && new Date(i.dueDate) < new Date() && i.assignStatus !== "completed"
    ).length;
    const unassignedCount = items.filter(i => !i.assigneeUuid).length;

    const summaryCards = [
        { label: CATEGORIES.TOTAL, value: total },
        { label: CATEGORIES.EFFECTIVE, value: effective },
        { label: CATEGORIES.INEFFECTIVE, value: ineffective },
        { label: CATEGORIES.OVERDUE, value: overdueCount },
        { label: CATEGORIES.UNASSIGNED, value: unassignedCount },
    ];

    // helper to filter **full items** by category
    function getByCategory(cat) {
        switch (cat) {
            case CATEGORIES.EFFECTIVE:
                return items.filter(i => i.controlStatus === "Effective");
            case CATEGORIES.INEFFECTIVE:
                return items.filter(i => i.controlStatus === "InEffective");
            case CATEGORIES.OVERDUE:
                return items.filter(
                    i => i.dueDate && new Date(i.dueDate) < new Date() && i.assignStatus !== "completed"
                );
            case CATEGORIES.UNASSIGNED:
                return items.filter(i => !i.assigneeUuid);
            default:
                return items;
        }
    }

    // --- UPCOMING for the table only ---
    const upcoming = useMemo(() => {
        return items
            .filter(i => i.dueDate && new Date(i.dueDate) >= new Date())
            .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
    }, [items]);

    const totalPages = Math.ceil(upcoming.length / perPage);
    const pageData = upcoming.slice((page - 1) * perPage, page * perPage);

    // --- CHARTS on full items ---
    const priorityData = useMemo(() => {
        const m = { low: 0, medium: 0, high: 0 };
        items.forEach(i => m[i.priority]++);
        return Object.entries(m)
            .map(([k, v]) => ({ id: k, label: k, value: v }))
            .filter(d => d.value > 0);
    }, [items]);

    const assignCounts = useMemo(() => {
        const m = { pending: 0, in_progress: 0, completed: 0 };
        items.forEach(i => m[i.assignStatus]++);
        return m;
    }, [items]);
    const assignData = useMemo(() =>
        Object.entries(assignCounts)
            .map(([k, v]) => ({ id: STATUS_LABELS[k], label: STATUS_LABELS[k], value: v }))
            .filter(d => d.value > 0)
        , [assignCounts]);

    // Reviewer status
    const reviewerCounts = useMemo(() => {
        const m = { pending: 0, in_progress: 0, approved: 0, rejected: 0 };
        items.forEach(i => m[i.reviewerStatus]++);  // <-- increment!
        return m;
    }, [items]);
    const reviewerData = useMemo(() =>
        Object.entries(reviewerCounts)
            .map(([k, v]) => ({ id: STATUS_LABELS[k], label: STATUS_LABELS[k], value: v }))
            .filter(d => d.value > 0)
        , [reviewerCounts]);

    // Approver status
    const approverCounts = useMemo(() => {
        const m = { pending: 0, in_progress: 0, approved: 0, rejected: 0 };
        items.forEach(i => m[i.approverStatus]++);
        return m;
    }, [items]);
    const approverData = useMemo(() => {
        return Object.entries(approverCounts)
            .map(([k, v]) => ({ id: STATUS_LABELS[k], label: STATUS_LABELS[k], value: v }))
            .filter(d => d.value > 0);              // <-- drop zeros
    }, [approverCounts]);

    const visibleSummaryCards = summaryCards.filter(
        (c) => c.label !== CATEGORIES.UNASSIGNED || userRole === "Admin"
    );
    const lgCols = visibleSummaryCards.length > 5
        ? 5
        : visibleSummaryCards.length;
    if (loading) {
        return (
            <div className="h-[75vh] flex items-center justify-center">
                <Loader />
            </div>
        );
    }

    return (
        <>
            {/* Dialog showing a list filtered by category (on full items) */}
            <Dialog
                isOpen={!!dialogList}
                title={dialogList ? `${dialogList.length} Controls` : ""}
                onClose={() => setDialogList(null)}
            >
                {dialogList?.length ? (
                    <table className="min-w-full text-sm">
                        <thead>
                            <tr className="bg-gray-200">
                                <th className="px-2 py-1">ID</th>
                                <th className="px-2 py-1">Title</th>
                                <th className="px-2 py-1">Due Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {dialogList.map(i => (
                                <tr
                                    key={i._id}
                                    className="cursor-pointer hover:bg-gray-100"
                                    onClick={() => {
                                        setSelected(i);
                                        setDialogList(null);
                                    }}
                                >
                                    <td className="px-2 py-1">{i.controlId.controlId}</td>
                                    <td className="px-2 py-1">{i.controlId.title}</td>
                                    <td className="px-2 py-1">{i.dueDate?.slice(0, 10) || "—"}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <p className="text-center text-gray-500">No controls in this category.</p>
                )}
            </Dialog>

            {/* Dialog showing a single control’s details */}
            <Dialog
                isOpen={!!selected}
                title={
                    <div className="flex items-center space-x-2">
                        <FiLayers className="text-2xl text-[#2B245C]" />
                        <span>{selected?.controlId?.controlId}</span>
                    </div>
                }
                onClose={() => setSelected(null)}
            >
                {selected && (
                    <div className="space-y-6 text-sm text-gray-800">
                        {/* Title */}
                        <div>
                            <h3 className="text-xl font-bold text-[#2B245C]">
                                {selected.controlId.title}
                            </h3>
                            {selected.controlId.subtitle && (
                                <p className="italic text-gray-600">{selected.controlId.subtitle}</p>
                            )}
                        </div>

                        {/* Metadata Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="flex items-center space-x-2">
                                <FiCalendar className="text-gray-500" />
                                <span>
                                    <strong>Due Date:</strong>{" "}
                                    {selected.dueDate?.slice(0, 10) || "—"}
                                </span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <FiFlag className="text-gray-500" />
                                <span>
                                    <strong>Priority:</strong>{" "}
                                    {selected.priority.charAt(0).toUpperCase() + selected.priority.slice(1)}
                                </span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <FiUser className="text-gray-500" />
                                <span>
                                    <strong>Assignee:</strong>{" "}
                                    {selected.assigneeUuid?.first_name || "Unassigned"}
                                </span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <FiUser className="text-gray-500" />
                                <span>
                                    <strong>Reviewer:</strong>{" "}
                                    {selected.reviewerUuid?.first_name || "—"}
                                </span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <FiUser className="text-gray-500" />
                                <span>
                                    <strong>Approver:</strong>{" "}
                                    {selected.approverUuid?.first_name || "—"}
                                </span>
                            </div>
                        </div>

                        {/* Status Badges */}
                        <div className="flex flex-wrap gap-4">
                            <div className="flex items-center space-x-1 bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full">
                                <FiRefreshCw /> <span>Assign: {selected.assignStatus}</span>
                            </div>
                            <div className="flex items-center space-x-1 bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
                                <FiRefreshCw /> <span>Review: {selected.reviewerStatus}</span>
                            </div>
                            <div className="flex items-center space-x-1 bg-purple-100 text-purple-800 px-3 py-1 rounded-full">
                                <FiRefreshCw /> <span>Approve: {selected.approverStatus}</span>
                            </div>
                            <div className={`flex items-center space-x-1 px-3 py-1 rounded-full ${selected.controlStatus === "Effective"
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                                }`}>
                                {selected.controlStatus === "Effective" ? <FiCheckCircle /> : <FiAlertCircle />}
                                <span>{selected.controlStatus}</span>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="border-t pt-4 space-y-4">
                            {selected.controlId.controlType === "AI" ? (
                                <div>
                                    <div className="space-y-4">
                                        {selected.controlId.subsections.map((ss) => (
                                            <div key={ss._id}>
                                                <h5 className="font-semibold">{ss.heading}</h5>
                                                {ss.content && <p className="pl-4">{ss.content}</p>}
                                                {ss.list?.length > 0 && (
                                                    <ul className="list-disc ml-6 mt-1 space-y-1">
                                                        {ss.list.map((item, idx) => (
                                                            <li key={idx}>{item}</li>
                                                        ))}
                                                    </ul>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <div>
                                    <p className="pl-4">
                                        {selected.controlId.description || "No description available."}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </Dialog>

            <div className="p-6 bg-[#F2F1FB] space-y-8">
                {/* SUMMARY CARDS */}
                <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-${lgCols} gap-6 `}>
                    {visibleSummaryCards.map(c => (
                        <div
                            key={c.label}
                            className="cursor-pointer bg-white border-t-4 border-[#2B245C] shadow rounded-lg p-4 flex flex-col items-center hover:shadow-lg transition"
                            onClick={() => setDialogList(getByCategory(c.label))}
                        >
                            <span className="text-sm text-[#050038]">{c.label}</span>
                            <span className="text-2xl font-bold text-[#2B245C]">{c.value}</span>
                        </div>
                    ))}
                </div>

                {/* CHARTS */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-white p-4 rounded-lg shadow border-l-4 border-[#050038]">
                        <h4 className="text-lg font-medium text-[#050038] mb-2">
                            Priority Distribution
                        </h4>
                        <div className="h-64">
                            <ResponsivePie
                                data={priorityData}
                                margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
                                innerRadius={0.5}
                                padAngle={1}
                                colors={{ scheme: "nivo" }}
                                borderColor={{ from: "color", modifiers: [["darker", 0.2]] }}
                            />
                        </div>
                    </div>
                    {(userRole === "Employee" || userRole === "Admin") && <div className="bg-white p-4 rounded-lg shadow border-l-4 border-[#050038">
                        <h4 className="text-lg font-medium text-[#050038] mb-2">
                            Assignee Status
                        </h4>
                        <div className="h-64">
                            <ResponsivePie
                                data={assignData}
                                margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
                                innerRadius={0.5}
                                padAngle={1}
                                colors={{ scheme: "set2" }}
                                borderColor={{ from: "color", modifiers: [["darker", 0.2]] }}
                            />
                        </div>
                    </div>}
                    {/* Reviewer Status */}
                    {(userRole === "Reviewer" || userRole === "Admin") && <div className="bg-white p-4 rounded-lg shadow border-l-4 border-[#050038">
                        <h4 className="text-lg font-medium text-[#050038] mb-2">
                            Reviewer Status
                        </h4>
                        <div className="h-64">
                            <ResponsivePie
                                data={reviewerData}
                                margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
                                innerRadius={0.5}
                                padAngle={1}
                                colors={{ scheme: "paired" }}
                                borderColor={{ from: "color", modifiers: [["darker", 0.2]] }}
                            />
                        </div>
                    </div>}

                    {/* Approver Status */}
                    {(userRole === "Approver" || userRole === "Admin") && <div className="bg-white p-4 rounded-lg shadow border-l-4 border-[#050038">
                        <h4 className="text-lg font-medium text-[#050038] mb-2">
                            Approver Status
                        </h4>
                        <div className="h-64">
                            <ResponsivePie
                                data={approverData}
                                margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
                                innerRadius={0.5}
                                padAngle={1}
                                colors={{ scheme: "pastel1" }}
                                borderColor={{ from: "color", modifiers: [["darker", 0.2]] }}
                            />
                        </div>
                    </div>}
                </div>

                {/* UPCOMING CONTROLS TABLE */}
                <div className="bg-white p-6 rounded-lg shadow border-t-4 border-[#2B245C]">
                    <h3 className="text-lg font-semibold mb-4 text-[#050038]">
                        Controls with Upcoming Deadlines
                    </h3>
                    <div className="overflow-x-auto border border-gray-200 rounded-lg">
                        <table className="min-w-full text-sm">
                            <thead>
                                <tr className="bg-[#2B245C] text-white">
                                    {[
                                        "Control ID",
                                        "Due Date",
                                        "Priority",
                                        "Assignee",
                                        "Reviewer",
                                        "Approver",
                                        "Assignee Status",
                                        "Reviewer Status",
                                        "Approver Status",
                                        "Control Status",
                                    ].map(h => (
                                        <th key={h} className="px-2 py-3 text-center">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {pageData.length === 0 ? (
                                    <tr>
                                        <td colSpan={10} className="py-6 text-center text-gray-500 italic">
                                            No upcoming controls available.
                                        </td>
                                    </tr>
                                ) : (
                                    pageData.map((i, idx) => (
                                        <tr
                                            key={i._id}
                                            className={`cursor-pointer ${idx % 2 ? "bg-gray-50" : ""} hover:bg-gray-100`}
                                            onClick={() => setSelected(i)}
                                        >
                                            <td className="px-2 py-2 text-center">{i.controlId.controlId}</td>
                                            <td className="px-2 py-2 text-center">{i.dueDate?.slice(0, 10) || "—"}</td>
                                            <td className="px-2 py-2 text-center">{i.priority}</td>
                                            <td className="px-2 py-2 text-center">{i.assigneeUuid?.first_name || "Unassigned"}</td>
                                            <td className="px-2 py-2 text-center">{i.reviewerUuid?.first_name || "—"}</td>
                                            <td className="px-2 py-2 text-center">{i.approverUuid?.first_name || "—"}</td>
                                            <td className="px-2 py-2 text-center">
                                                <span
                                                    className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${STATUS_CLASSES[i.assignStatus] || ""}`}
                                                >
                                                    {STATUS_LABELS[i.assignStatus]}
                                                </span>
                                            </td>

                                            <td className="px-2 py-2 text-center">
                                                <span
                                                    className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${STATUS_CLASSES[i.reviewerStatus] || ""}`}
                                                >
                                                    {STATUS_LABELS[i.reviewerStatus]}
                                                </span>
                                            </td>

                                            <td className="px-2 py-2 text-center">
                                                <span
                                                    className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${STATUS_CLASSES[i.approverStatus] || ""}`}>
                                                    {STATUS_LABELS[i.approverStatus]}
                                                </span>
                                            </td>

                                            <td className="px-2 py-2 text-center">
                                                <span
                                                    className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${STATUS_CLASSES[i.controlStatus] || ""}`}
                                                >
                                                    {STATUS_LABELS[i.controlStatus]}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                    <div className="mt-4">
                        <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
                    </div>
                </div>
            </div>
        </>
    );
}
