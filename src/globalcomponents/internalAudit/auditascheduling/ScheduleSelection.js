import React from "react";

const ScheduleSelection = () => {
    return (
        <div className="space-y-4">
            {/* Schedule Type Radio Buttons */}
            <div className="flex flex-col">
                <span className="font-semibold text-gray-700 mb-2">Schedule Type:</span>
                <div className="flex items-center space-x-6">
                    <div className="flex items-center">
                        <input
                            type="radio"
                            id="approvalRequired"
                            name="scheduleType"
                            value="Approval Required"
                            className="mr-2"
                        />
                        <label htmlFor="approvalRequired" className="text-gray-700">
                            Approval Required
                        </label>
                    </div>
                    <div className="flex items-center">
                        <input
                            type="radio"
                            id="adHoc"
                            name="scheduleType"
                            value="Ad-Hoc"
                            className="mr-2"
                        />
                        <label htmlFor="adHoc" className="text-gray-700">
                            Ad-Hoc
                        </label>
                    </div>
                </div>
            </div>

            {/* Schedule Status Radio Buttons */}
            <div className="flex flex-col mt-6">
                <span className="font-semibold text-gray-700 mb-2">Schedule Status:</span>
                <div className="flex items-center space-x-6">
                    <div className="flex items-center">
                        <input
                            type="radio"
                            id="start"
                            name="scheduleStatus"
                            value="Start"
                            className="mr-2"
                        />
                        <label htmlFor="start" className="text-gray-700">
                            Start
                        </label>
                    </div>
                    <div className="flex items-center">
                        <input
                            type="radio"
                            id="inProcess"
                            name="scheduleStatus"
                            value="In-Process"
                            className="mr-2"
                        />
                        <label htmlFor="inProcess" className="text-gray-700">
                            In-Process
                        </label>
                    </div>
                    <div className="flex items-center">
                        <input
                            type="radio"
                            id="underReview"
                            name="scheduleStatus"
                            value="Under Review"
                            className="mr-2"
                        />
                        <label htmlFor="underReview" className="text-gray-700">
                            Under Review
                        </label>
                    </div>
                    <div className="flex items-center">
                        <input
                            type="radio"
                            id="approved"
                            name="scheduleStatus"
                            value="Approved"
                            className="mr-2"
                        />
                        <label htmlFor="approved" className="text-gray-700">
                            Approved
                        </label>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ScheduleSelection;
