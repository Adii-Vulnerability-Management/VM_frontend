// ISO42001AnnexAWithTabs.jsx
import Dialog from "@/components/ui/Dialog";
import Loader from "@/components/ui/Loader";
import CustomAxios from "@/config/CustomAxios";
import { baseurl, initURL } from "@/config/config";
import cx from "clsx";
import Cookies from "js-cookie";
import { useEffect, useMemo, useState } from "react";
import { AiOutlineFilePdf } from "react-icons/ai";
import { FiInfo, FiTrash2 } from "react-icons/fi";
import { toast } from "react-toastify";

function FilterBar({ searchTerm, setSearchTerm }) {
    return (
        <div className="p-4 rounded-md">
            <input
                type="search"
                placeholder="Search control code…"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full max-w-md px-4 py-2 border rounded-lg focus:ring focus:ring-[#2B245C]"
            />
        </div>
    );
}

function ControlCard({ appl, tab, fetchApplicabilities }) {

    const userData = JSON.parse(Cookies.get('user_data') || '{}');
    const role = userData.user_designation;

    const [reviewerStatus, setReviewerStatus] = useState("");
    const [assignStatus, setAssignStatus] = useState("");
    const [reviewerComments, setReviewerComments] = useState("");
    const [approverStatus, setApproverStatus] = useState("");
    const [approverComments, setApproverComments] = useState("");
    const [controlStatus, setControlStatus] = useState("");

    const [showAssignDialog, setShowAssignDialog] = useState(false);
    const [answers, setAnswers] = useState({});
    const [saving, setSaving] = useState(false);
    const [errors, setErrors] = useState({});
    const {
        controlId: ctrl,
        dueDate,
        assigneeUuid,
        reviewerUuid,
        approverUuid,
        _id: applicabilityId,
    } = appl;

    useEffect(() => {
        if (!appl) return;

        setReviewerStatus(appl.reviewerStatus ?? "pending");
        setAssignStatus(appl.assignStatus ?? "pending");
        setReviewerComments(appl.reviewerComments ?? "");
        setApproverStatus(appl.approverStatus ?? "pending");
        setApproverComments(appl.approverComments ?? "");
        setControlStatus(appl.controlStatus ?? "InEffective");
    }, [appl]);

    // initialize answers slot for each subsection
    useEffect(() => {
        const init = {};

        if (ctrl.subsections?.length) {
            // AI-controls: one entry per subsection
            ctrl.subsections.forEach(sub => {
                const ans = appl.answers.find(
                    a => String(a.subsectionId) === String(sub._id)
                );
                init[sub._id] = ans?.answer || "";
            });
        } else {
            // Governance: single answer tied to the control's own _id
            const ans = appl.answers.find(
                a => String(a.subsectionId) === String(ctrl._id)
            );
            init[ctrl._id] = ans?.answer || "";
        }

        setAnswers(init);
    }, [appl.answers, ctrl.subsections, ctrl._id]);

    // single-reference inputs + list
    const [newUrl, setNewUrl] = useState("");
    const [newFile, setNewFile] = useState(null);
    const [adding, setAdding] = useState(false);
    const [refs, setRefs] = useState([]);

    useEffect(() => {
        // ensure we have an array
        if (Array.isArray(appl.references)) {
            setRefs(appl.references.map(r => ({
                url: r.url,
                filePath: r.filePath,
                addedAt: r.addedAt,
                _id: r._id,
            })));
        }
    }, [appl.references]);
    const isGroup = /^A\.\d+$/.test(ctrl.controlId);
    if (isGroup && tab !== "Governance") return null;

    const handleAnswerChange = (subId, text) => {
        setAnswers(prev => ({ ...prev, [subId]: text }));
    };
    const handleSave = async () => {
        if (role === 'Reviewer' && assignStatus !== 'completed') {
            toast.warn('Assignee must complete their work before you can review.');
            return;
        }
        if (role === 'Approver' && reviewerStatus !== 'approved') {
            toast.warn('Reviewer must approve before you can approve.');
            return;
        }

        const newErrors = {};
        Object.entries(answers).forEach(([subId, ans]) => {
            if (!ans.trim()) newErrors[subId] = "This field is required";
        });
        if (Object.keys(newErrors).length) {
            setErrors(newErrors);
            return;
        }
        setErrors({});
        setSaving(true);
        try {
            const payload = {
                answers: Object.entries(answers).map(([subsectionId, answer]) => ({
                    subsectionId,
                    answer,
                })),
                controlStatus,
                assignStatus,       // employee’s own status
                reviewerStatus,     // reviewer’s status
                reviewerComments,   // reviewer’s comments
                approverStatus,     // approver’s status
                approverComments,   // approver’s comments
            };

            await CustomAxios.patch(
                `${baseurl}/${initURL}/iso42001/applicabilities/${appl._id}/answers`,
                payload
            );
            toast.success("Answers saved successfully!");
            fetchApplicabilities()
        } catch (err) {
            toast.error("Failed to save answers. Please try again.");
        } finally {
            setSaving(false);
        }
    };

    const addReference = async () => {
        if (!newUrl && !newFile) {
            toast.warn("Please provide a URL or upload a file before adding.");
            return;
        }
        setAdding(true);

        const form = new FormData();
        if (newUrl) form.append("url", newUrl);
        if (newFile) form.append("file", newFile);

        try {
            await CustomAxios.post(
                `${baseurl}/${initURL}/iso42001/applicabilities/${applicabilityId}/reference`,
                form,
                { headers: { "Content-Type": "multipart/form-data" } }
            );
            toast.success("Reference added successfully!");
            fetchApplicabilities()
            setNewUrl("");
            setNewFile(null);
        } catch (err) {
            toast.error("Oops! Could not add reference. Please try again.");
        } finally {
            setAdding(false);
        }
    };

    const getReturnFile = async (filePath) => {
        let url = "rbi-tracking/getReturnFile";
        try {
            const { data } = await CustomAxios.post(`${baseurl}/${initURL}/${url}`, {
                filePath,
            });

            if (data.success && data.presignedUrl) {
                window.open(data.presignedUrl, "_blank");
            } else {
                toast.error("Failed to get the pre-signed URL.");
            }
        } catch (error) {
            toast.error("Error opening file. Please try again.");
        }
    };

    const deleteReference = async refId => {
        try {
            await CustomAxios.delete(
                `${baseurl}/${initURL}/iso42001/applicabilities/${applicabilityId}/reference/${refId}`
            );
            fetchApplicabilities()
            toast.success("Reference deleted");
        } catch {
            toast.error("Failed to delete reference");
        }
    };

    return (
        <article className="bg-white rounded-2xl shadow-lg overflow-hidden mb-8" key={applicabilityId}>
            <header className="bg-[#2B245C] text-white px-6 py-4 flex justify-between items-center">
                <h3 className="text-lg font-semibold text-white">
                    {ctrl.controlId} — {ctrl.title || ctrl.subtitle}
                </h3>
                <button
                    onClick={() => setShowAssignDialog(true)}
                    title="View Assignment Details"
                    className="text-white hover:text-gray-200"
                >
                    <FiInfo size={20} />
                </button>
            </header>

            {/* Q&A */}
            <div className="p-6 space-y-6">
                {(role === 'Approver' || role === 'Reviewer') && (
                    <p className="text-sm text-gray-600 italic">
                        {role === 'Approver'
                            ? 'You cannot change answers or references.'
                            : 'You can only review answers.'}
                    </p>
                )}

                {tab === "Governance" ? (
                    <div className="space-y-2">
                        {ctrl.description && (
                            <p className="italic text-gray-700">{ctrl.description}</p>
                        )}
                        <label className="block font-medium text-gray-800 text-sm">
                            Response
                        </label>
                        <textarea
                            rows={3}
                            value={answers[ctrl._id] || ""}
                            onChange={e => handleAnswerChange(ctrl._id, e.target.value)}
                            disabled={!(role === 'Employee' || role === 'Admin')}
                            className="w-full p-3 border rounded-lg focus:ring focus:ring-[#2B245C] disabled:bg-gray-100"
                            placeholder="Enter your response…"
                        />
                        {errors[ctrl._id] && (
                            <p className="mt-1 text-red-500 text-sm">{errors[ctrl._id]}</p>
                        )}
                    </div>
                ) : (
                    ctrl.subsections.map(sub => (
                        <div key={sub._id}>
                            <h4 className="font-semibold text-[#2B245C]">{sub.heading}</h4>
                            {sub.content && <p className="text-gray-700 mb-2">{sub.content}</p>}
                            {sub.list?.length > 0 && (
                                <ul className="list-decimal ml-5 text-gray-700 mb-2">
                                    {sub.list.map((li, i) => <li key={i}>{li}</li>)}
                                </ul>
                            )}
                            <div className="space-y-2 my-6">
                                <label className="block font-medium text-gray-800 text-sm">
                                    Response for “{sub.heading}”
                                </label>
                                <textarea
                                    rows={3}
                                    value={answers[sub._id] || ""}
                                    onChange={e => handleAnswerChange(sub._id, e.target.value)}
                                    disabled={!(role === 'Employee' || role === 'Admin')}
                                    className="w-full p-3 border rounded-lg focus:ring focus:ring-[#2B245C] disabled:bg-gray-100"
                                    placeholder="Enter your response…"
                                />
                                {errors[sub._id] && (
                                    <p className="mt-0.5 text-red-500 text-sm">{errors[sub._id]}</p>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* After Q&A block */}
            <div className="px-6 space-y-4 mb-4">
                {/* All status selects on one line */}
                <div className="flex items-start space-x-6">
                    <div className="flex flex-col">
                        <label className="text-sm font-medium text-gray-700">Control Status</label>
                        <select
                            value={controlStatus}
                            onChange={e => setControlStatus(e.target.value)}
                            disabled={role !== 'Approver'}
                            className="mt-1 w-40 p-1 border rounded-lg disabled:bg-gray-100"
                        >
                            <option value="Effective">Effective</option>
                            <option value="InEffective">InEffective</option>
                        </select>
                    </div>
                    {/* Assignee Status (Employee only) */}
                    {(role === 'Employee' || role === 'Admin') && (
                        <div className="flex flex-col">
                            <label className="text-sm font-medium text-gray-700">Assignee Status</label>
                            <select
                                value={assignStatus}
                                onChange={e => setAssignStatus(e.target.value)}
                                className="mt-1 w-40 p-1 border rounded-lg"
                            >
                                <option value="pending">Pending</option>
                                <option value="in_progress">In Progress</option>
                                <option value="completed">Completed</option>
                            </select>
                        </div>
                    )}


                    {/* Reviewer Status */}
                    {role === 'Reviewer' && (
                        <div className="flex flex-col">
                            <label className="text-sm font-medium text-gray-700">Reviewer Status</label>
                            <select
                                value={reviewerStatus}
                                onChange={e => setReviewerStatus(e.target.value)}
                                className="mt-1 w-40 p-1 border rounded-lg"
                            >
                                <option value="pending">Pending</option>
                                <option value="in_progress">In Progress</option>
                                <option value="completed">Completed</option>
                            </select>
                        </div>
                    )}

                    {/* Approver Status */}
                    {role === 'Approver' && (
                        <div className="flex flex-col">
                            <label className="text-sm font-medium text-gray-700">Approver Status</label>
                            <select
                                value={approverStatus}
                                onChange={e => setApproverStatus(e.target.value)}
                                className="mt-1 w-40 p-1 border rounded-lg"
                            >
                                <option value="pending">Pending</option>
                                <option value="in_progress">In Progress</option>
                                <option value="completed">Completed</option>
                            </select>
                        </div>
                    )}
                </div>

                {role === 'Reviewer' && (
                    <div className="flex flex-col">
                        <label className="text-sm font-medium text-gray-700">Reviewer Comments</label>
                        <textarea
                            rows={2}
                            value={reviewerComments}
                            onChange={e => setReviewerComments(e.target.value)}
                            className="mt-1 w-full p-2 border rounded-lg focus:ring focus:ring-[#2B245C]"
                            placeholder="Enter your comments…"
                        />
                    </div>
                )}

                {role === 'Approver' && (
                    <div className="flex flex-col">
                        <label className="text-sm font-medium text-gray-700">Approver Comments</label>
                        <textarea
                            rows={2}
                            value={approverComments}
                            onChange={e => setApproverComments(e.target.value)}
                            className="mt-1 w-full p-2 border rounded-lg focus:ring focus:ring-[#2B245C]"
                            placeholder="Enter your comments…"
                        />
                    </div>
                )}
            </div>


            {/* References section */}
            <div className="px-6 space-y-4">
                <h4 className="font-semibold">References</h4>
                {/* only employee sees the add form */}
                {(role === 'Employee' || role === 'Admin') && (
                    <div className="pt-4 border-t space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
                            <div className="sm:col-span-2">
                                <label className="block text-sm">Reference URL</label>
                                <input
                                    type="url"
                                    value={newUrl}
                                    onChange={e => setNewUrl(e.target.value)}
                                    placeholder="https://example.com"
                                    className="w-full p-2 border rounded"
                                />
                            </div>
                            <div>
                                <label className="block text-sm">Upload Document</label>
                                <input
                                    type="file"
                                    onChange={e => setNewFile(e.target.files?.[0] || null)}
                                    className="w-full text-sm"
                                />
                            </div>
                        </div>
                        <button
                            onClick={addReference}
                            disabled={adding}
                            className="px-3 py-1 bg-green-100 text-green-700 rounded disabled:opacity-50"
                        >
                            {adding ? "Adding…" : "Add Reference"}
                        </button>
                    </div>
                )}
                {/* Always show the table */}
                <table className="min-w-full mt-2 text-left text-sm">
                    <thead>
                        <tr className="bg-gray-100">
                            <th className="px-3 py-2">URL</th>
                            <th className="px-3 py-2">Document</th>
                            <th className="px-3 py-2">Uploaded At</th>
                            {role === 'Employee' && <th className="px-3 py-2">Actions</th>}
                        </tr>
                    </thead>
                    <tbody>
                        {refs.length === 0 ? (
                            <tr>
                                <td
                                    colSpan={role === 'Employee' ? 4 : 3}
                                    className="px-3 py-4 text-center text-gray-500 italic"
                                >
                                    No reference documents available
                                </td>
                            </tr>
                        ) : (
                            refs.map((ref, i) => (
                                <tr key={ref._id || i} className={i % 2 ? "bg-gray-50" : ""}>
                                    <td className="px-3 py-2">
                                        {ref.url ? (
                                            <a
                                                href={ref.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-blue-600 hover:underline"
                                            >
                                                {ref.url}
                                            </a>
                                        ) : (
                                            "—"
                                        )}
                                    </td>
                                    <td className="px-3 py-2">
                                        {ref.filePath ? (
                                            <button
                                                onClick={() => getReturnFile(ref.filePath)}
                                                className="text-red-600 hover:text-red-800"
                                                title={ref.filePath.split('/').pop()}
                                            >
                                                <AiOutlineFilePdf size={20} />
                                            </button>
                                        ) : (
                                            "—"
                                        )}
                                    </td>
                                    <td className="px-3 py-2">
                                        {new Date(ref.addedAt).toLocaleString()}
                                    </td>
                                    {role === 'Employee' && (
                                        <td className="px-3 py-2">
                                            <button
                                                onClick={() => deleteReference(ref._id)}
                                                className="text-red-600 hover:text-red-800"
                                                title="Delete reference"
                                            >
                                                <FiTrash2 />
                                            </button>
                                        </td>
                                    )}
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>



            </div>

            {/* Save button */}
            <div className="px-6 py-4 flex justify-end">
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="px-5 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                >
                    {saving ? "Saving…" : "Save Answers"}
                </button>
            </div>

            {/* Assignment Details Dialog */}
            <Dialog
                isOpen={showAssignDialog}
                onClose={() => setShowAssignDialog(false)}
                title={`Assignment: ${ctrl.controlId}`}
            >
                <div className="p-4 space-y-6">
                    {/* Assignment & Roles */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <h5 className="text-sm font-semibold text-gray-600">Due Date</h5>
                            <p className="text-lg">{dueDate ? dueDate.slice(0, 10) : "—"}</p>
                        </div>
                        <div>
                            <h5 className="text-sm font-semibold text-gray-600">Assignee</h5>
                            <p className="text-lg">
                                {assigneeUuid
                                    ? `${assigneeUuid.first_name} ${assigneeUuid.last_name}`
                                    : "—"}
                            </p>
                        </div>
                        <div>
                            <h5 className="text-sm font-semibold text-gray-600">Reviewer</h5>
                            <p className="text-lg">
                                {reviewerUuid
                                    ? `${reviewerUuid.first_name} ${reviewerUuid.last_name}`
                                    : "—"}
                            </p>
                        </div>
                        <div>
                            <h5 className="text-sm font-semibold text-gray-600">Approver</h5>
                            <p className="text-lg">
                                {approverUuid
                                    ? `${approverUuid.first_name} ${approverUuid.last_name}`
                                    : "—"}
                            </p>
                        </div>
                    </div>

                    {/* Workflow Statuses */}
                    <div className="border-t pt-4 grid grid-cols-1 sm:grid-cols-3 gap-6">
                        {/* Assignee Status */}
                        <div>
                            <h5 className="text-sm font-semibold text-gray-600">Assignee Status</h5>
                            <span
                                className={cx(
                                    "inline-block px-2 py-1 rounded-full text-xs uppercase",
                                    {
                                        "bg-yellow-100 text-yellow-800": assignStatus === "pending",
                                        "bg-blue-100 text-blue-800": assignStatus === "in_progress",
                                        "bg-green-100 text-green-800": assignStatus === "completed",
                                    }
                                )}
                            >
                                {assignStatus?.replace("_", " ").toUpperCase() || "PENDING"}
                            </span>
                        </div>

                        {/* Reviewer Status */}
                        <div>
                            <h5 className="text-sm font-semibold text-gray-600">Reviewer Status</h5>
                            <span
                                className={cx(
                                    "inline-block px-2 py-1 rounded-full text-xs uppercase",
                                    {
                                        "bg-yellow-100 text-yellow-800":
                                            !reviewerStatus || reviewerStatus === "pending",
                                        "bg-blue-100 text-blue-800": reviewerStatus === "in_progress",
                                        "bg-green-100 text-green-800": reviewerStatus === "approved",
                                        "bg-red-100 text-red-800": reviewerStatus === "rejected",
                                    }
                                )}
                            >
                                {(reviewerStatus || "pending")
                                    .replace("_", " ")
                                    .toUpperCase()}
                            </span>
                            <h5 className="text-sm font-semibold text-gray-600 mt-4">
                                Comments
                            </h5>
                            <p className="mt-1 whitespace-pre-wrap">
                                {reviewerComments || "No comments"}
                            </p>
                        </div>

                        {/* Approver Status */}
                        <div>
                            <h5 className="text-sm font-semibold text-gray-600">Approver Status</h5>
                            <span
                                className={cx(
                                    "inline-block px-2 py-1 rounded-full text-xs uppercase",
                                    {
                                        "bg-yellow-100 text-yellow-800":
                                            !approverStatus || approverStatus === "pending",
                                        "bg-blue-100 text-blue-800": approverStatus === "in_progress",
                                        "bg-green-100 text-green-800": approverStatus === "approved",
                                        "bg-red-100 text-red-800": approverStatus === "rejected",
                                    }
                                )}
                            >
                                {(approverStatus || "pending")
                                    .replace("_", " ")
                                    .toUpperCase()}
                            </span>
                            <h5 className="text-sm font-semibold text-gray-600 mt-4">
                                Comments
                            </h5>
                            <p className="mt-1 whitespace-pre-wrap">
                                {approverComments || "No comments"}
                            </p>
                        </div>
                    </div>
                </div>
            </Dialog>

        </article>
    );
}

export default function ISO42001AnnexAWithTabs() {
    const [tab, setTab] = useState("Governance");
    const [searchTerm, setSearchTerm] = useState("");
    const [apps, setApps] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchApplicabilities = async () => {
        setLoading(true);
        try {
            const user = JSON.parse(Cookies.get("user_data") || "{}");
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
            const res = await CustomAxios.get(url);
            setApps(res.data);
            setError(null);
        } catch (err) {
            console.error(err);
            setError("Failed to load applicable controls.");
        } finally {
            setLoading(false);
        }
    };

    // 2) call it in useEffect
    useEffect(() => {
        fetchApplicabilities();
    }, []);

    const governanceApps = useMemo(
        () => apps.filter(a => a.controlId.controlType === "GOVERNANCE"),
        [apps]
    );
    const aiApps = useMemo(
        () => apps.filter(a => a.controlId.controlType === "AI"),
        [apps]
    );

    const displayed = useMemo(() => {
        const list = tab === "Governance" ? governanceApps : aiApps;
        return list.filter(a =>
            a.controlId.controlId.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [tab, governanceApps, aiApps, searchTerm]);

    if (loading) {
        return (
            <div className="h-[75vh] flex items-center justify-center">
                <Loader />
            </div>
        );
    }
    if (error) {
        return <p className="p-8 text-red-500 text-center">{error}</p>;
    }

    return (
        <main className="space-y-6">
            <div className="flex justify-between items-center mb-4">
                <div className="flex space-x-2">
                    {["Governance", "AI"].map(label => (
                        <button
                            key={label}
                            onClick={() => setTab(label)}
                            className={cx(
                                "px-4 py-2 rounded-md font-semibold",
                                tab === label
                                    ? "bg-[#2B245C] text-white"
                                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                            )}
                        >
                            {label}
                        </button>
                    ))}
                </div>
                <div className="w-1/3">
                    <FilterBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
                </div>
            </div>

            <div className="space-y-6">
                {displayed.length
                    ? displayed.map(a => (
                        <ControlCard
                            key={a._id}
                            appl={a}
                            tab={tab}
                            fetchApplicabilities={fetchApplicabilities}
                        />
                    ))
                    : <p className="text-gray-500">No applicable controls found.</p>
                }
            </div>

        </main>
    );
}
