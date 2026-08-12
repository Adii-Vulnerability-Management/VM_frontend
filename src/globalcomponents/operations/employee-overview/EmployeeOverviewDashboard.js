import React, { useEffect, useState } from 'react';
import CustomAxios from '@/globalcomponents/CustomAxios';
import { baseurl, initURL } from '../../../../BaseUrl';
import Loader from '@/globalcomponents/loader/Loader';
import Dialog from '@/globalcomponents/rbiTracker/Dialog';
import { AiOutlineDelete } from 'react-icons/ai';
import { FaFilePdf } from 'react-icons/fa';
import { toast } from 'react-toastify';

function EmployeeOverviewDashboard() {
    const [saveLoading, setSaveLoading] = useState(false);
    const [assignments, setAssignments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [selectedPolicyDetail, setSelectedPolicyDetail] = useState('');
    const [selectedProcedureDetail, setSelectedProcedureDetail] = useState('');
    const [selectedAssignment, setSelectedAssignment] = useState({
        policies: [],
        procedures: [],
        trainings: [],
        allreadyAssignedpolicies: [],
        allreadyAssignedprocedures: [],
        allreadyAssignedtrainings: [],
    });
    const [isPolicyModalOpen, setIsPolicyModalOpen] = useState(false);
    const [isProcedureModalOpen, setIsProcedureModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [policies, setPolicies] = useState([]);
    const [procedures, setProcedures] = useState([]);
    const [trainings, setTrainings] = useState([]);
    const [selectedEmployee, setSelectedEmployee] = useState(""); // holds the employee ID

    // Fetch employee assignments
    const fetchAssignments = async () => {
        setLoading(true);
        try {
            const response = await CustomAxios.get(`${baseurl}/${initURL}/policy-training-assignment`);
            setAssignments(response.data);
        } catch (err) {
            console.error('Error fetching assignments:', err);
            setError('Failed to load employee assignments.');
        } finally {
            setLoading(false);
        }
    };

    const fetchData = async () => {
        try {
            const policyRes = await CustomAxios.get(`${baseurl}/${initURL}/policy/all`);
            setPolicies(policyRes.data);
        } catch (error) {
            console.error("Error fetching policies:", error);
        }

        try {
            const procedureRes = await CustomAxios.get(`${baseurl}/${initURL}/employee/procedure/all`);
            setProcedures(procedureRes.data);
        } catch (error) {
            console.error("Error fetching procedures:", error);
        }

        try {
            const trainingRes = await CustomAxios.get(`${baseurl}/${initURL}/training-campaign/all`);
            setTrainings(trainingRes.data);
        } catch (error) {
            console.error("Error fetching trainings:", error);
        }
    };

    useEffect(() => {
        fetchAssignments();
        fetchData();
    }, []);

    // Compute unique employees from assignments
    const uniqueEmployees = Array.from(
        new Map(
            assignments
                .filter(a => a.employeeId)
                .map(a => [a.employeeId._id, a.employeeId])
        ).values()
    );

    // Filter assignments based on selectedEmployee (if any)
    const filteredAssignments = selectedEmployee
        ? assignments.filter(a => a.employeeId && a.employeeId._id === selectedEmployee)
        : assignments;

    const handleViewProcedure = (procedureDetail) => {
        setSelectedProcedureDetail(procedureDetail);
        setIsProcedureModalOpen(true);
    };

    const handleViewPolicy = (policyDetail) => {
        setSelectedPolicyDetail(policyDetail);
        setIsPolicyModalOpen(true);
    };

    const handleEditClick = (assignment) => {
        setSelectedAssignment((prev) => ({
            ...prev,
            _id: assignment._id,
            allreadyAssignedpolicies: assignment.policies.map(p => p.policy._id),
            allreadyAssignedprocedures: assignment.procedures.map(pr => pr.procedure._id),
            allreadyAssignedtrainings: assignment.trainings.map(tr => tr.training._id),
        }));
        setIsEditModalOpen(true);
    };

    const handleSaveChanges = async () => {
        if (!selectedAssignment._id) {
            toast.error("No assignment selected.");
            return;
        }

        const newPolicies = selectedAssignment.policies
            .filter(policyId => !selectedAssignment.allreadyAssignedpolicies.includes(policyId))
            .map(policyId => ({
                policy: policyId,
                status: "Pending",
                acceptedDate: null,
            }));

        const newProcedures = selectedAssignment.procedures
            .filter(procedureId => !selectedAssignment.allreadyAssignedprocedures.includes(procedureId))
            .map(procedureId => ({
                procedure: procedureId,
                status: "Pending",
                acceptedDate: null,
            }));

        const newTrainings = Object.entries(selectedAssignment.trainings)
            .filter(([trainingId]) => !selectedAssignment.allreadyAssignedtrainings.includes(trainingId))
            .map(([trainingId, completionDate]) => ({
                training: trainingId,
                completionDate: completionDate ? new Date(completionDate).toISOString().split("T")[0] : null,
            }));

        const payload = {
            policies: newPolicies.length ? newPolicies : undefined,
            procedures: newProcedures.length ? newProcedures : undefined,
            trainings: newTrainings.length ? newTrainings : undefined,
        };
        setSaveLoading(true);
        try {
            const response = await CustomAxios.patch(
                `${baseurl}/${initURL}/policy-training-assignment?assignmentId=${selectedAssignment._id}`,
                payload
            );
            if (response.status === 200) {
                toast.success("Assignment updated successfully.");
                setIsEditModalOpen(false);
                fetchAssignments();
            }
        } catch (error) {
            console.error("Error updating assignment:", error);
            toast.error(error.response?.data?.message || "Failed to update assignment.");
        } finally {
            setSaveLoading(false);
        }
    };

    const handleCheckboxChange = (type, id) => {
        setSelectedAssignment((prev) => {
            if (type === "trainings") {
                const updatedTrainings = { ...prev.trainings };
                if (updatedTrainings.hasOwnProperty(id)) {
                    delete updatedTrainings[id];
                } else {
                    updatedTrainings[id] = "";
                }
                return { ...prev, trainings: updatedTrainings };
            } else {
                return {
                    ...prev,
                    [type]: prev[type].includes(id)
                        ? prev[type].filter((item) => item !== id)
                        : [...prev[type], id],
                };
            }
        });
    };

    const handleCompletionDateChange = (id, date) => {
        setSelectedAssignment((prev) => ({
            ...prev,
            trainings: {
                ...prev.trainings,
                [id]: date || "",
            },
        }));
    };

    const handleDeleteAssignment = async (type, assignmentId, itemId) => {
        try {
            const response = await CustomAxios.delete(
                `${baseurl}/${initURL}/policy-training-assignment?type=${type}&assignmentId=${assignmentId}&itemId=${itemId}`
            );
            if (response.status === 200) {
                toast.success(`${type} assignment deleted successfully.`);
                fetchAssignments();
            }
        } catch (error) {
            console.log("🚀 ~ handleDeleteAssignment ~ error:", error);
            toast.error(error.response?.data?.error || "Failed to delete assignment.");
        }
    };

    const getReturnFile = async (filePath) => {
        try {
            const { data } = await CustomAxios.post(
                `${baseurl}/${initURL}/policy-training-assignment/getReturnFile`,
                { filePath }
            );
            if (data.success && data.presignedUrl) {
                const link = document.createElement("a");
                link.href = data.presignedUrl;
                link.download = filePath.split("/").pop() || "downloaded_file";
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            } else {
                toast.error("Failed to get the pre-signed URL.");
            }
        } catch (error) {
            console.error("Error initiating file download:", error);
            toast.error("Error initiating file download. Please try again.");
        }
    };

    if (loading) {
        return (
            <div className="text-blue-600 hover:text-blue-800 flex justify-center items-center h-screen">
                <Loader />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="px-6 py-8 bg-[#2B245C] rounded-2xl shadow-lg hover:shadow-2xl transition-shadow duration-300">
                <div>
                    <h1 className="text-3xl font-bold text-cyan-50">Employee Overview Dashboard</h1>
                </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
                {/* Dropdown */}
                <div className="mb-4">
                    <select
                        value={selectedEmployee}
                        onChange={(e) => setSelectedEmployee(e.target.value)}
                        className="p-2 border border-gray-300 rounded-xl"
                    >
                        <option value="">All Employees</option>
                        {uniqueEmployees.map((emp) => (
                            <option key={emp._id} value={emp._id}>
                                {emp.first_name} {emp.last_name}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Dashboard Content */}
                {error && <p className="text-red-600">{error}</p>}
                {!loading && !error && filteredAssignments.length === 0 && (
                    <p className="text-gray-600 text-center">🚀 No assignments found.</p>
                )}
                {!error && filteredAssignments.length > 0 && (
                    <div className="space-y-6">
                        {filteredAssignments.map((assignment) => (
                            <div key={assignment._id} className='mb-8'>
                                <div className="flex flex-col md:flex-row items-center border-b pb-2 mb-4 space-y-4 md:space-y-0 md:space-x-4 pt-2 px-2">
                                    {/* Employee Info */}
                                    <div className="flex-1">
                                        <h3 className="text-lg font-semibold text-gray-900">
                                            {assignment.employeeId?.first_name} {assignment.employeeId?.last_name}
                                        </h3>
                                        <p className="text-sm text-gray-600">{assignment.employeeId?.email}</p>

                                    </div>

                                    <div className="flex-1">
                                        <p className="text-sm text-gray-700">
                                            <strong>Dept:</strong> {assignment.onboardingDetails?.department || "--"}
                                        </p>
                                        <p className="text-sm text-gray-700">
                                            <strong>Title:</strong> {assignment.onboardingDetails?.title || "--"}
                                        </p>
                                    </div>

                                    {/* Onboarding Details */}
                                    {assignment.onboardingDetails && (
                                        <div className="flex-1">
                                            <h4 className="text-lg font-semibold text-gray-800 mb-2">📝 Onboarding</h4>
                                            <p className="text-sm text-gray-700">
                                                <strong>Date:</strong> {assignment.onboardingDetails?.date || "--"}
                                            </p>
                                        </div>
                                    )}

                                    {/* Offboarding Details */}
                                    <div className="flex-1">
                                        <h4 className="text-lg font-semibold text-gray-800 mb-2">🔚 Offboarding</h4>
                                        <p className="text-sm text-gray-700">
                                            <strong>Date:</strong> {assignment.offboardingDetails?.date || '--'}
                                        </p>
                                    </div>

                                    {/* Edit Button */}
                                    <div className="w-auto">
                                        <button
                                            className="px-4 py-2 text-sm font-semibold text-white bg-blue-500 hover:bg-blue-600 rounded transition"
                                            onClick={() => handleEditClick(assignment)}
                                        >
                                            ✏️ Edit
                                        </button>
                                    </div>
                                </div>

                                {/* Assigned Policies */}
                                <div className="mt-4">
                                    <h4 className="text-lg font-semibold text-gray-800 mb-3">📜 Assigned Policies</h4>
                                    {assignment.policies.length > 0 ? (
                                        <div className="overflow-x-auto bg-white shadow rounded-lg">
                                            <table className="min-w-full divide-y divide-gray-200">
                                                <thead className="bg-[#2B245C]">
                                                    <tr className="text-center">
                                                        <th className="px-6 py-3 text-xs font-medium text-gray-100 uppercase tracking-wider">
                                                            Policy Name
                                                        </th>
                                                        <th className="px-6 py-3 text-xs font-medium text-gray-100 uppercase tracking-wider">
                                                            Version
                                                        </th>
                                                        <th className="px-6 py-3 text-xs font-medium text-gray-100 uppercase tracking-wider">
                                                            Acceptance Status
                                                        </th>
                                                        <th className="px-6 py-3 text-xs font-medium text-gray-100 uppercase tracking-wider">
                                                            Actions
                                                        </th>
                                                    </tr>
                                                </thead>
                                                <tbody className="bg-white divide-y divide-gray-200">
                                                    {assignment?.policies
                                                        ?.filter((policy) => policy?.policy)
                                                        .map((policy) => (
                                                            <tr key={policy?._id} className="hover:bg-gray-50 text-center">
                                                                <td className="px-6 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                                                                    {policy?.policy?.name || "Unknown policy"}
                                                                </td>
                                                                <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-500">
                                                                    {policy?.policy?.versionNumber || "--"}
                                                                </td>
                                                                <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-500">
                                                                    <span
                                                                        className={`px-2 py-1 rounded ${policy?.status === "Accepted"
                                                                            ? "bg-green-200 text-green-800"
                                                                            : policy?.status === "Pending"
                                                                                ? "bg-yellow-200 text-yellow-800"
                                                                                : "bg-red-200 text-red-800"
                                                                            }`}
                                                                    >
                                                                        {policy?.status || "--"}
                                                                    </span>
                                                                </td>
                                                                <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-500">
                                                                    <div className="flex justify-center space-x-2">
                                                                        <button
                                                                            className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 transition"
                                                                            onClick={() => handleViewPolicy(policy?.policy?.policyDetail)}
                                                                        >
                                                                            View
                                                                        </button>
                                                                        <AiOutlineDelete
                                                                            className="text-red-500 text-lg cursor-pointer hover:text-red-700"
                                                                            onClick={() =>
                                                                                handleDeleteAssignment("policy", assignment?._id, policy?._id)
                                                                            }
                                                                        />
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                </tbody>

                                            </table>
                                        </div>
                                    ) : (
                                        <p className="text-gray-500">No policies assigned</p>
                                    )}
                                </div>

                                {/* Assigned Procedures */}
                                <div className="mt-6">
                                    <h4 className="text-md font-semibold text-gray-800 mb-2">🛠️ Assigned Procedures</h4>
                                    {assignment.procedures.length > 0 ? (
                                        <div className="overflow-x-auto bg-white shadow rounded-lg">
                                            <table className="min-w-full divide-y divide-gray-200">
                                                <thead className="bg-[#2B245C]">
                                                    <tr className="text-center">
                                                        <th className="px-6 py-3 text-xs font-medium text-gray-100 uppercase tracking-wider">
                                                            Procedure Name
                                                        </th>
                                                        <th className="px-6 py-3 text-xs font-medium text-gray-100 uppercase tracking-wider">
                                                            Version
                                                        </th>
                                                        <th className="px-6 py-3 text-xs font-medium text-gray-100 uppercase tracking-wider">
                                                            Acceptance Status
                                                        </th>
                                                        <th className="px-6 py-3 text-xs font-medium text-gray-100 uppercase tracking-wider">
                                                            Actions
                                                        </th>
                                                    </tr>
                                                </thead>
                                                <tbody className="bg-white divide-y divide-gray-200">
                                                    {assignment?.procedures
                                                        ?.filter((procedure) => procedure?.procedure)
                                                        .map((procedure) => (
                                                            <tr key={procedure?._id} className="hover:bg-gray-50 text-center">
                                                                <td className="px-6 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                                                                    {procedure?.procedure?.name || "Unknown procedure"}
                                                                </td>
                                                                <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-500">
                                                                    {procedure?.procedure?.versionNumber || "--"}
                                                                </td>
                                                                <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-500">
                                                                    <span
                                                                        className={`px-2 py-1 rounded ${procedure?.status === "Accepted"
                                                                            ? "bg-green-200 text-green-800"
                                                                            : procedure?.status === "Pending"
                                                                                ? "bg-yellow-200 text-yellow-800"
                                                                                : "bg-red-200 text-red-800"
                                                                            }`}
                                                                    >
                                                                        {procedure?.status || "--"}
                                                                    </span>
                                                                </td>
                                                                <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-500">
                                                                    <div className="flex justify-center space-x-2">
                                                                        <button
                                                                            className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 transition"
                                                                            onClick={() =>
                                                                                handleViewProcedure(procedure?.procedure?.procedureDetail)
                                                                            }
                                                                        >
                                                                            View
                                                                        </button>
                                                                        <AiOutlineDelete
                                                                            className="text-red-500 text-lg cursor-pointer hover:text-red-700"
                                                                            onClick={() =>
                                                                                handleDeleteAssignment("procedure", assignment?._id, procedure?._id)
                                                                            }
                                                                        />
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                        ))}

                                                </tbody>
                                            </table>
                                        </div>
                                    ) : (
                                        <p className="text-gray-500">No procedures assigned</p>
                                    )}
                                </div>

                                {/* Assigned Trainings */}
                                <div className="mt-6">
                                    <h4 className="text-md font-semibold text-gray-800 mb-2">🎓 Assigned Trainings</h4>
                                    {assignment.trainings.length > 0 ? (
                                        <div className="overflow-x-auto bg-white shadow rounded-lg">
                                            <table className="min-w-full divide-y divide-gray-200">
                                                <thead className="bg-[#2B245C]">
                                                    <tr className="text-center">
                                                        {[
                                                            "Training Name",
                                                            "Completion Status",
                                                            "Training Deadline",
                                                            "Certificate Link",
                                                            "Completion Doc",
                                                            "Action",
                                                        ].map((header, index) => (
                                                            <th
                                                                key={index}
                                                                className="px-6 py-3 text-xs font-medium text-gray-100 uppercase tracking-wider"
                                                            >
                                                                {header}
                                                            </th>
                                                        ))}
                                                    </tr>
                                                </thead>
                                                <tbody className="bg-white divide-y divide-gray-200">
                                                    {assignment.trainings
                                                        .filter((training) => training?.training)
                                                        .map((training) => (
                                                            <tr key={training._id} className="hover:bg-gray-50 text-center">
                                                                <td className="px-6 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                                                                    {training?.training?.name || "Unknown training"}
                                                                </td>
                                                                <td className="px-6 py-2 whitespace-nowrap text-sm">
                                                                    <span
                                                                        className={`px-2 py-1 rounded ${training?.status === "Completed"
                                                                            ? "bg-green-200 text-green-800"
                                                                            : training?.status === "Pending"
                                                                                ? "bg-yellow-200 text-yellow-800"
                                                                                : "bg-red-200 text-red-800"
                                                                            }`}
                                                                    >
                                                                        {training?.status || "--"}
                                                                    </span>
                                                                </td>
                                                                <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-500">
                                                                    {training?.completionDate
                                                                        ? new Date(training.completionDate).toLocaleDateString()
                                                                        : "--"}
                                                                </td>
                                                                <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-500">
                                                                    {training?.certificationLink ? (
                                                                        <a
                                                                            href={training.certificationLink}
                                                                            target="_blank"
                                                                            rel="noopener noreferrer"
                                                                            className="text-blue-500 underline"
                                                                        >
                                                                            View
                                                                        </a>
                                                                    ) : (
                                                                        "--"
                                                                    )}
                                                                </td>
                                                                <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-500">
                                                                    {training?.completionDocument ? (
                                                                        <div
                                                                            onClick={() => getReturnFile(training.completionDocument)}
                                                                            className="flex items-center justify-center text-blue-500 cursor-pointer"
                                                                        >
                                                                            <FaFilePdf className="text-xl" />
                                                                        </div>
                                                                    ) : (
                                                                        "--"
                                                                    )}
                                                                </td>
                                                                <td className="px-6 py-2 whitespace-nowrap text-sm text-gray-500">
                                                                    <div className="flex justify-center">
                                                                        <AiOutlineDelete
                                                                            className="text-red-500 text-lg cursor-pointer hover:text-red-700"
                                                                            onClick={() =>
                                                                                handleDeleteAssignment("training", assignment._id, training._id)
                                                                            }
                                                                        />
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    ) : (
                                        <p className="text-gray-500">No trainings assigned</p>
                                    )}
                                </div>

                                <div className="mt-4">
                                    <h4 className="text-lg font-semibold text-gray-800 mb-2">🔒 Security Info</h4>
                                    <div className="overflow-x-auto bg-white shadow rounded-lg">
                                        <table className="min-w-full divide-y divide-gray-200">
                                            <thead className="bg-[#2B245C]">
                                                <tr className="text-center">
                                                    <th className="px-6 py-3 text-xs font-medium text-white uppercase tracking-wider">MFA</th>
                                                    <th className="px-6 py-3 text-xs font-medium text-white uppercase tracking-wider">BG Check</th>
                                                    <th className="px-6 py-3 text-xs font-medium text-white uppercase tracking-wider">Updates</th>
                                                    <th className="px-6 py-3 text-xs font-medium text-white uppercase tracking-wider">Encrypted</th>
                                                    <th className="px-6 py-3 text-xs font-medium text-white uppercase tracking-wider">Anti-virus</th>
                                                    <th className="px-6 py-3 text-xs font-medium text-white uppercase tracking-wider">Lock Screen</th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white divide-y divide-gray-200">
                                                <tr className="hover:bg-gray-50 text-center">
                                                    <td className="px-6 py-2 whitespace-nowrap text-sm font-medium text-gray-900">Enabled</td>
                                                    <td className="px-6 py-2 whitespace-nowrap text-sm text-black">Yes</td>
                                                    <td className="px-6 py-2 whitespace-nowrap text-sm text-black">Auto</td>
                                                    <td className="px-6 py-2 whitespace-nowrap text-sm text-black">Yes</td>
                                                    <td className="px-6 py-2 whitespace-nowrap text-sm text-black">Installed</td>
                                                    <td className="px-6 py-2 whitespace-nowrap text-sm text-black">10 min</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Policy Details Modal */}
            <Dialog isOpen={isPolicyModalOpen} onClose={() => setIsPolicyModalOpen(false)}>
                <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-2xl mx-auto">
                    <h3 className="text-xl font-semibold mb-4 text-center">📜 Policy Details</h3>
                    <div className="overflow-auto max-h-[500px] p-2 border rounded bg-gray-50">
                        <div dangerouslySetInnerHTML={{ __html: selectedPolicyDetail }} />
                    </div>
                    <div className="flex justify-end mt-4">
                        <button
                            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition"
                            onClick={() => setIsPolicyModalOpen(false)}
                        >
                            Close
                        </button>
                    </div>
                </div>
            </Dialog>

            {/* Procedure Details Modal */}
            <Dialog isOpen={isProcedureModalOpen} onClose={() => setIsProcedureModalOpen(false)}>
                <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-2xl mx-auto">
                    <h3 className="text-xl font-semibold mb-4 text-center">🛠️ Procedure Details</h3>
                    <div className="overflow-auto max-h-[500px] p-2 border rounded bg-gray-50">
                        <div dangerouslySetInnerHTML={{ __html: selectedProcedureDetail }} />
                    </div>
                    <div className="flex justify-end mt-4">
                        <button
                            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition"
                            onClick={() => setIsProcedureModalOpen(false)}
                        >
                            Close
                        </button>
                    </div>
                </div>
            </Dialog>

            {/* Edit Modal */}
            <Dialog isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)}>
                <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-lg mx-auto">
                    <h3 className="text-xl font-semibold mb-4 text-center">Edit Assignment</h3>

                    {/* Policies */}
                    <div className="mb-4">
                        <h4 className="font-semibold mb-2">📜 Assign New Policies</h4>
                        {policies
                            .filter((p) => p.policyStatus === "Active")
                            .filter(policy => !selectedAssignment.allreadyAssignedpolicies.includes(policy._id)).length === 0 ? (
                            <p className="text-gray-500 text-sm italic">⚠️ No active policies available for assignment.</p>
                        ) : (
                            policies
                                .filter((p) => p.policyStatus === "Active")
                                .filter(policy => !selectedAssignment.allreadyAssignedpolicies.includes(policy._id))
                                .map(policy => (
                                    <label key={policy._id} className="flex items-center space-x-2">
                                        <input
                                            type="checkbox"
                                            onChange={() => handleCheckboxChange("policies", policy._id)}
                                            className="form-checkbox h-4 w-4 text-blue-500"
                                        />
                                        <span>{policy.name}</span>
                                    </label>
                                ))
                        )}
                    </div>

                    {/* Procedures */}
                    <div className="mb-4">
                        <h4 className="font-semibold mb-2">🛠️ Assign New Procedures</h4>
                        {procedures.filter(procedure => !selectedAssignment.allreadyAssignedprocedures.includes(procedure._id)).length === 0 ? (
                            <p className="text-gray-500 text-sm italic">⚠️ No procedures available for assignment.</p>
                        ) : (
                            procedures
                                .filter(procedure => !selectedAssignment.allreadyAssignedprocedures.includes(procedure._id))
                                .map(procedure => (
                                    <label key={procedure._id} className="flex items-center space-x-2">
                                        <input
                                            type="checkbox"
                                            onChange={() => handleCheckboxChange("procedures", procedure._id)}
                                            className="form-checkbox h-4 w-4 text-blue-500"
                                        />
                                        <span>{procedure.name}</span>
                                    </label>
                                ))
                        )}
                    </div>

                    {/* Trainings */}
                    <div className="mb-4">
                        <h4 className="font-semibold mb-2">🎓 Assign New Trainings</h4>
                        {trainings.filter(training => !selectedAssignment.allreadyAssignedtrainings.includes(training._id)).length === 0 ? (
                            <p className="text-gray-500 text-sm italic">⚠️ No trainings available for assignment.</p>
                        ) : (
                            trainings
                                .filter(training => !selectedAssignment.allreadyAssignedtrainings.includes(training._id))
                                .map(training => (
                                    <div key={training._id} className="flex flex-col space-y-2 mb-3">
                                        <label className="flex items-center space-x-2">
                                            <input
                                                type="checkbox"
                                                onChange={() => handleCheckboxChange("trainings", training._id)}
                                                checked={selectedAssignment.trainings.hasOwnProperty(training._id)}
                                                className="form-checkbox h-4 w-4 text-blue-500"
                                            />
                                            <span>{training.name}</span>
                                        </label>
                                        {selectedAssignment.trainings.hasOwnProperty(training._id) && (
                                            <div className="flex items-center space-x-2">
                                                <label className="text-sm text-gray-600">Completion Date:</label>
                                                <input
                                                    type="date"
                                                    value={selectedAssignment.trainings[training._id] || ""}
                                                    onChange={(e) => handleCompletionDateChange(training._id, e.target.value)}
                                                    className="border border-gray-300 rounded px-2 py-1 text-sm"
                                                />
                                            </div>
                                        )}
                                    </div>
                                ))
                        )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-end space-x-2">
                        <button className="px-4 py-2 bg-gray-500 text-white rounded" onClick={() => setIsEditModalOpen(false)}>
                            Cancel
                        </button>
                        <button className="px-4 py-2 bg-blue-500 text-white rounded" onClick={handleSaveChanges}>
                            {saveLoading ? <Loader /> : "Save"}
                        </button>
                    </div>
                </div>
            </Dialog>
        </div>
    );
}

export default EmployeeOverviewDashboard;
