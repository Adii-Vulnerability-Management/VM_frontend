import React, { useState, useEffect } from "react";
import CustomAxios from "@/config/CustomAxios";
import { baseurl, initURL } from "@/config/config";
import { toast } from "react-toastify";

// Modal to display detailed consent information
const ViewModal = ({ consent, closeModal }) => {
    return (
        <div className="fixed inset-0 bg-black backdrop-blur-sm bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-8 rounded-lg shadow-lg w-3/4 max-w-2xl space-y-5">
                {/* Modal Header */}
                <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-semibold text-[#2B245C]">{consent.title}</h2>
                    <button
                        onClick={closeModal}
                        title="Close"
                        className="text-gray-600 hover:text-gray-800 transition duration-200"
                    >
                        <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <hr className="border-t-2 border-gray-300" />

                {/* Modal Content */}
                <div className="text-sm space-y-5">
                    <div className="flex justify-between">
                        <p className="font-medium text-gray-700">Form ID:</p>
                        <p className="text-gray-600">{consent.formId}</p>
                    </div>
                    <div className="flex justify-between">
                        <p className="font-medium text-gray-700">Tenant ID:</p>
                        <p className="text-gray-600">{consent.tenantId}</p>
                    </div>
                    <div className="flex justify-between">
                        <p className="font-medium text-gray-700">Status:</p>
                        <span
                            className={`inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-full border ${consent.isActive ? "bg-green-100 text-green-800 border-green-300" : "bg-red-100 text-red-800 border-red-300"
                                }`}
                        >
                            {consent.isActive ? "Active" : "Inactive"}
                        </span>
                    </div>
                    <div className="flex justify-between">
                        <p className="font-medium text-gray-700">Policy Version:</p>
                        <p className="text-gray-600">{consent.policyVersion}</p>
                    </div>

                    {/* Branding Section */}
                    <div className="flex justify-between mt-6">
                        <p className="font-medium text-gray-700">Branding:</p>
                        {consent.branding && consent.branding.logoUrl ? (
                            <div className="flex items-center">
                                <img src={consent.branding.logoUrl} alt={consent.branding.logoAlt} className="w-8 h-8 mr-2 rounded-full" />
                                <span className="text-gray-600">{consent.branding.name}</span>
                            </div>
                        ) : (
                            <span>No Logo</span>
                        )}
                    </div>

                    {/* Consent Statements */}
                    <div className="space-y-4 mt-6">
                        <div>
                            <p className="font-medium text-gray-700">Intro Statement:</p>
                            <p className="text-gray-600">{consent.consentStatements.intro}</p>
                        </div>
                        <div>
                            <p className="font-medium text-gray-700">Identity Note:</p>
                            <p className="text-gray-600">{consent.consentStatements.identityNote}</p>
                        </div>
                        <div>
                            <p className="font-medium text-gray-700">Adult Consent:</p>
                            <p className="text-gray-600">{consent.consentStatements.adult}</p>
                        </div>
                        <div>
                            <p className="font-medium text-gray-700">Adult Checkbox Text:</p>
                            <p className="text-gray-600">{consent.consentStatements.adultCheckbox}</p>
                        </div>
                        <div>
                            <p className="font-medium text-gray-700">Minor Notice:</p>
                            <p className="text-gray-600">{consent.consentStatements.minorNotice}</p>
                        </div>
                        <div>
                            <p className="font-medium text-gray-700">Guardian Declaration:</p>
                            <p className="text-gray-600">{consent.consentStatements.guardianDeclaration}</p>
                        </div>
                        <div>
                            <p className="font-medium text-gray-700">Guardian Checkbox Text:</p>
                            <p className="text-gray-600">{consent.consentStatements.guardianCheckbox}</p>
                        </div>
                        <div>
                            <p className="font-medium text-gray-700">Footer Note:</p>
                            <p className="text-gray-600">{consent.consentStatements.footerNote}</p>
                        </div>
                    </div>

                    {/* Theme Colors */}
                    <div className="mt-6">
                        <p className="font-medium text-gray-700 mb-2">Theme Colors:</p>
                        <div className="space-x-4">
                            <span
                                className="text-white px-4 py-2 rounded-full"
                                style={{ backgroundColor: consent.theme.primaryColor }}
                            >
                                Primary Color
                            </span>
                            <span
                                className="text-white px-4 py-2 rounded-full"
                                style={{ backgroundColor: consent.theme.primaryHoverColor }}
                            >
                                Hover Color
                            </span>
                        </div>
                    </div>
                </div>

                <hr className="border-t-2 border-gray-300" />

                {/* Modal Footer */}
                <div className="flex justify-end mt-6">
                    <button
                        onClick={closeModal}
                        className="bg-[#2B245C] text-white py-2 px-6 rounded-lg transition duration-200 hover:bg-opacity-90"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

// Main Dashboard Table to Display Consents
const Dashboard = ({ wId }) => {
    const [consents, setConsents] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedConsent, setSelectedConsent] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    // Fetch consents from API
    const fetchConsents = async () => {
        try {
            const { data } = await CustomAxios.get(
                `${baseurl}/${initURL}/child-consent-configs${wId ? `?wId=${wId}` : ""}`
            );

            const normalized = Array.isArray(data)
                ? data
                : Array.isArray(data?.data)
                    ? data.data
                    : data && typeof data === "object"
                        ? [data]
                        : [];

            setConsents(normalized);
        } catch (err) {
            console.error(err);
            toast.error("Error fetching consents. Please try again later.");
        }
    };

    // Fetch data on mount
    useEffect(() => {
        fetchConsents();
    }, [wId]);

    // Handle View Modal
    const handleViewClick = (consent) => {
        setSelectedConsent(consent);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedConsent(null);
    };

    // Filter consents based on search term
    const filteredConsents = searchTerm.length >= 1 ? consents.filter(consent =>
        (consent.formId && consent.formId.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (consent.tenantId && consent.tenantId.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (consent.title && consent.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (consent.domain && consent.domain.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (consent.policyVersion && consent.policyVersion.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (consent.isActive ? "Active" : "Inactive").toLowerCase().includes(searchTerm.toLowerCase())
    ) : consents;

    // Calculate stats
    const totalForms = consents.length;
    const activeForms = consents.filter(consent => consent.isActive).length;
    const inactiveForms = totalForms - activeForms;

    // Pagination logic
    const totalPages = Math.ceil(filteredConsents.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedConsents = filteredConsents.slice(startIndex, startIndex + itemsPerPage);

    const handleItemsPerPageChange = (event) => {
        setItemsPerPage(Number(event.target.value));  // Update the number of items per page
        setCurrentPage(1);  // Reset to the first page
    };

    // Handle page change
    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    // Handle search
    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
        setCurrentPage(1); // Reset to first page on search
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
            <div className="mx-5 bg-white rounded-lg p-5 my-3">

                <div className="px-6 py-8 bg-[#2B245C] rounded-2xl shadow-lg hover:shadow-2xl transition-shadow duration-300">
                    <h1 className="text-3xl font-bold text-cyan-50">
                        Child Consent Dashboard
                    </h1>
                    <p className="mt-1 text-sm text-white">
                        Manage and review all child consent forms.
                    </p>
                </div>

                {/* Stats Cards */}
                <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-blue-50 p-4 rounded-xl shadow-md border border-blue-200">
                        <h3 className="text-lg font-semibold text-gray-700">Total Forms</h3>
                        <p className="text-2xl font-bold text-blue-700">{totalForms}</p>
                    </div>
                    <div className="bg-green-50 p-4 rounded-xl shadow-md border border-green-200">
                        <h3 className="text-lg font-semibold text-gray-700">Active Forms</h3>
                        <p className="text-2xl font-bold text-green-700">{activeForms}</p>
                    </div>
                    <div className="bg-red-50 p-4 rounded-xl shadow-md border border-red-200">
                        <h3 className="text-lg font-semibold text-gray-700">Inactive Forms</h3>
                        <p className="text-2xl font-bold text-red-700">{inactiveForms}</p>
                    </div>
                </div>

                {/* Table displaying consents */}
                <div className="space-y-5 mt-5 rounded-2xl border border-[#2B245C] bg-white p-6 shadow-lg hover:shadow-2xl transition-shadow duration-300">
                    {/* Search Bar */}
                    <div className="flex items-center w-full gap-2">
                        <label className="block text-sm font-medium text-gray-700">
                            Search:
                        </label>
                        <input
                            type="text"
                            placeholder="Search by Form ID, Tenant ID, Title, Domain, Version, or Status..."
                            value={searchTerm}
                            onChange={handleSearchChange}
                            className="w-1/3 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                        />
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto rounded-lg border border-gray-800">
                        <table className="min-w-full text-sm">
                            <thead className="bg-[#2B245C] text-left text-white border-b border-gray-800">
                                <tr>
                                    <th className="py-2 px-4">Form ID</th>
                                    <th className="py-2 px-4">Tenant ID</th>
                                    <th className="py-2 px-4">Title</th>
                                    <th className="py-2 px-4">Domain</th>
                                    <th className="py-2 px-4">Version</th>
                                    <th className="py-2 px-4 text-center">Status</th>
                                    <th className="py-2 px-4 text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {paginatedConsents.length > 0 ? (
                                    paginatedConsents.map((consent) => (
                                        <tr key={consent._id} className="border-b hover:bg-blue-50">
                                            <td className="py-2 px-4">{consent.formId}</td>
                                            <td className="py-2 px-4">{consent.tenantId}</td>
                                            <td className="py-2 px-4">{consent.title}</td>
                                            <td className="py-2 px-4">{consent.domain}</td>
                                            <td className="py-2 px-4">{consent.consentVersion}</td>
                                            <td className="px-4 py-2 text-center whitespace-nowrap">
                                                <span
                                                    className={`inline-flex items-center px-2.5 py-1 whitespace-nowrap text-xs font-medium rounded-full border ${consent.isActive ? "bg-green-100 text-green-800 border-green-300" : "bg-red-100 text-red-800 border-red-300"
                                                        }`}
                                                >
                                                    {consent.isActive ? "Active" : "Inactive"}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4">
                                                <div className="flex justify-center items-center">
                                                    <button
                                                        onClick={() => handleViewClick(consent)}
                                                        className="rounded-lg border border-[#2B245C] bg-[#2B245C] px-3 py-1 text-sm font-semibold text-white hover:bg-opacity-90"
                                                    >
                                                        View
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="7" className="text-center py-2 text-gray-500">No consents available</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    <div className="text-sm text-gray-700 flex justify-between items-center">
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
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={currentPage === 1}
                                className="rounded-lg bg-[#2B245C] text-white px-4 py-2 text-sm font-semibold shadow-md hover:shadow-lg hover:bg-opacity-90 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-200 ease-in-out"
                            >
                                Prev
                            </button>

                            <div>
                                Page {currentPage} of {totalPages}
                            </div>

                            <button
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={currentPage === totalPages}
                                className="rounded-lg bg-[#2B245C] text-white px-4 py-2 text-sm font-semibold shadow-md hover:shadow-lg hover:bg-opacity-90 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-200 ease-in-out"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal for viewing consent details */}
            {isModalOpen && <ViewModal consent={selectedConsent} closeModal={closeModal} />}

        </div>
    );
};

export default Dashboard;