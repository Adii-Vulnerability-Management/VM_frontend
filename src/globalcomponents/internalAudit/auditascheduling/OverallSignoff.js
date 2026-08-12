import React from "react";

const OverallSignoff = () => {
    return (
        <div className="space-y-6">

            {/* Lead Responder Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700" htmlFor="leadResponder">
                        * Lead Responder:
                    </label>
                    <input
                        id="leadResponder"
                        type="text"
                        placeholder="Enter Lead Responder"
                        className="w-full p-2 border border-dotted rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700" htmlFor="leadResponderEmail">
                        * Lead Responder Email ID:
                    </label>
                    <input
                        id="leadResponderEmail"
                        type="email"
                        placeholder="Enter Email"
                        className="w-full p-2 border border-dotted rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700" htmlFor="leadResponderPhone">
                        * Lead Responder Phone:
                    </label>
                    <input
                        id="leadResponderPhone"
                        type="tel"
                        placeholder="Enter Phone"
                        className="w-full p-2 border border-dotted rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
            </div>

            {/* Responder Manager Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700" htmlFor="responderManager">
                        * Responder Manager:
                    </label>
                    <input
                        id="responderManager"
                        type="text"
                        placeholder="Enter Responder Manager"
                        className="w-full p-2 border border-dotted rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700" htmlFor="responderManagerEmail">
                        * Responder Manager Email ID:
                    </label>
                    <input
                        id="responderManagerEmail"
                        type="email"
                        placeholder="Enter Email"
                        className="w-full p-2 border border-dotted rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700" htmlFor="responderManagerPhone">
                        * Responder Manager Phone:
                    </label>
                    <input
                        id="responderManagerPhone"
                        type="tel"
                        placeholder="Enter Phone"
                        className="w-full p-2 border border-dotted rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
            </div>

            {/* Director Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700" htmlFor="director">
                        * Director:
                    </label>
                    <input
                        id="director"
                        type="text"
                        placeholder="Enter Director"
                        className="w-full p-2 border border-dotted rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700" htmlFor="directorEmail">
                        * Director Email ID:
                    </label>
                    <input
                        id="directorEmail"
                        type="email"
                        placeholder="Enter Email"
                        className="w-full p-2 border border-dotted rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700" htmlFor="directorPhone">
                        * Director Phone:
                    </label>
                    <input
                        id="directorPhone"
                        type="tel"
                        placeholder="Enter Phone"
                        className="w-full p-2 border border-dotted rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
            </div>

            {/* Signoff Dates Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700" htmlFor="leadResponderSignoff">
                        Lead Responder Signoff Date:
                    </label>
                    <input
                        id="leadResponderSignoff"
                        type="date"
                        className="w-full p-2 border border-dotted rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700" htmlFor="directorReviewSignoff">
                        Director/Manager Review Signoff Date:
                    </label>
                    <input
                        id="directorReviewSignoff"
                        type="date"
                        className="w-full p-2 border border-dotted rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
            </div>
        </div>
    );
};

export default OverallSignoff;
