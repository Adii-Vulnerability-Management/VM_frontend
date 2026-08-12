import React, { useState } from "react";

const ScheduleAttachments = () => {
    const [comment, setComment] = useState("");
    const [file, setFile] = useState(null);

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleCommentChange = (e) => {
        setComment(e.target.value);
    };

    const handleSubmit = () => {
        if (!comment || !file) {
            alert("Please provide a comment and upload a file.");
            return;
        }
        // Handle the form submission (you can handle the file upload here)
        alert("Attachment and comment submitted successfully!");
    };

    return (
        <div className="space-y-6 p-6 bg-white rounded-lg shadow-md">
            {/* Comment Section */}
            <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700" htmlFor="comment">
                    * Comment:
                </label>
                <textarea
                    id="comment"
                    placeholder="Enter your comment here..."
                    value={comment}
                    onChange={handleCommentChange}
                    className="w-full p-3 border border-dotted rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows="4"
                />
            </div>

            {/* File Upload Section */}
            <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700" htmlFor="fileUpload">
                    * Upload File:
                </label>
                <input
                    id="fileUpload"
                    type="file"
                    onChange={handleFileChange}
                    className="w-full p-3 border border-dotted rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
            </div>

            {/* Submit Button */}
            <div className="flex justify-end mt-6">
                <button
                    onClick={handleSubmit}
                    className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    Submit
                </button>
            </div>
        </div>
    );
};

export default ScheduleAttachments;
