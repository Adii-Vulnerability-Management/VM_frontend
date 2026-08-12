import React from "react";

const ReviewerFeedback = () => {
    return (
        <div className="space-y-6 p-6 bg-white rounded-lg shadow-md">

            {/* Responder Comment Section */}
            <div className="flex items-start space-x-4">
                <label
                    className="text-sm font-medium  w-1/4"
                    htmlFor="responderComment"
                >
                    * Responder Comment:
                </label>
                <textarea
                    id="responderComment"
                    placeholder="Enter your comment here..."
                    className="w-3/4 p-3 border border-dotted rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows="4"
                />
            </div>

            {/* Manager Review Comment Section */}
            <div className="flex items-start space-x-4">
                <label
                    className="text-sm font-medium  w-1/4"
                    htmlFor="managerReviewComment"
                >
                    * Manager Review Comment:
                </label>
                <textarea
                    id="managerReviewComment"
                    placeholder="Enter the manager's review here..."
                    className="w-3/4 p-3 border border-dotted rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows="4"
                />
            </div>
        </div>
    );
};

export default ReviewerFeedback;
