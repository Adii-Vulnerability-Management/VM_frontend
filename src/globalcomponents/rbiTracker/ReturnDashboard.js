import Dialog from "@/globalcomponents/rbiTracker/Dialog";
import axios from "axios";
import dayjs from "dayjs";
import { useEffect, useState } from "react";
import { FaCalendarAlt, FaFilePdf, FaTimes, FaUser } from "react-icons/fa";
import { toast } from "react-toastify";
import { baseurl, initURL } from "../../../BaseUrl";
import Tooltip from "@/globalcomponents/rbiTracker/Tooltip";
import CustomAxios from "@/globalcomponents/CustomAxios";
import Loader from "@/globalcomponents/loader/Loader";
const ReturnDashboard = () => {
  // State to store API data
  const [data, setData] = useState([]);
  const [docLoading, setDocLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [notifyLoadingRow, setNotifyLoadingRow] = useState(null); // Track the loading state for a specific row
  const [employeeDialog, setEmployeeDialog] = useState(false);
  const [employeedata, setEmployeedata] = useState([]);
  const [scheduleDialog, setScheduleDialog] = useState(false);
  const [reviewerDialog, setReviewerDialog] = useState(false); // State to control the Reviewer Dialog
  const [reviewerData, setReviewerData] = useState([]);
  const [scheduledates, setScheduledates] = useState([]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await CustomAxios.get(
        `${baseurl}/${initURL}/rbi-tracking/employee-return`
      );
      setData(response?.data || []); // Store API response in state
    } catch (err) {
      toast.error(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };
  // Fetch data from the API
  useEffect(() => {
    fetchData();
  }, []);

  let NotifyToEmployee = async (returnDetails, rowIndex) => {
    let data = returnDetails.scheduleDates.find(
      (item) => item.submissionStatus === "Pending"
    );

    let obj = {
      returnDetails: returnDetails.returnId,
      employeeDetails: returnDetails.employeeIds,
      submissionDate: data.submissionDate,
      userDetails: returnDetails.user,
    };

    try {
      setNotifyLoadingRow(rowIndex); // Set the loading state for the specific row
      const response = await CustomAxios.post(
        `${baseurl}/${initURL}/rbi-tracking/send-email`,
        { emailDetails: obj }
      );
      toast.success("Notify successfully!");
    } catch (err) {
      toast.error(err.message || "Failed to notify!");
    } finally {
      setNotifyLoadingRow(null); // Reset the loading state
    }
  };

  const getReturnFile = async (filePath) => {
    try {
      setDocLoading(true); // Start loader
      // Fetch the pre-signed URL
      const { data } = await CustomAxios.post(
        `${baseurl}/${initURL}/rbi-tracking/getReturnFile`,
        { filePath }
      );

      if (data.success && data.presignedUrl) {
        // Open the file in a new tab
        window.open(data.presignedUrl, "_blank");
      } else {
        toast.error("Failed to get the pre-signed URL.");
      }
    } catch (error) {
      toast.error("Error initiating file download. Please try again.");
    } finally {
      setDocLoading(false); // Stop loader
    }
  };

  const calculateDueDays = (dueDate) => {
    const today = dayjs();
    const date = dayjs(dueDate);
    const diffDays = date.diff(today, "day");
    return diffDays > 0 ? `${diffDays} days remaining` : "Overdue";
  };

  console.log(scheduledates, 'scheduledates');

  return (
    <div className="min-h-screen">
      <div className="p-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className=" font-bold text-[#2B245C]">
            Return Submission Details
          </h2>
        </div>
        {loading ? (
          <div className="text-center text-blue-600 flex justify-center items-center">
            <Loader />
          </div>
        ) : (
          <div className="overflow-hidden bg-white rounded-xl shadow-lg border border-gray-100 mt-4">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-[#1e284e]">
                  <tr className="text-center ">
                    {[
                      "Return Name",
                      "Frequency",
                      "Assign Persons",
                      "Reviewers", // New Column for Reviewers
                      "Schedule Dates",
                      "Actions",
                    ].map((header) => (
                      <th
                        key={header}
                        className="px-6 py-5 text-sm font-semibold text-white tracking-wider border-b border-blue-700"
                      >
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {data.length > 0 ? (
                    data.map((submission, index) => {
                      const hasPendingStatus = submission.scheduleDates.some(
                        (schedule) => schedule.submissionStatus === "Pending"
                      );

                      return (
                        <tr
                          key={index}
                          className="hover:bg-blue-50 transition-colors duration-200 text-center"
                        >
                          <td className="px-6 py-3 text-sm text-gray-700">
                            {submission?.returnId?.returnName}
                          </td>
                          <td className="px-6 py-3 text-sm text-gray-700">
                            {submission?.returnId?.frequency}
                          </td>
                          <td className="px-6 py-3 text-sm text-gray-700">
                            <Tooltip
                              content={
                                submission?.employeeIds?.length > 0 ? (
                                  <div className="text-left">
                                    {submission.employeeIds.map((employee) => (
                                      <div
                                        key={employee._id}
                                        className="text-white"
                                      >
                                        {employee.firstName} {employee.lastName}
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <span className="text-gray-500">
                                    No employees assigned
                                  </span>
                                )
                              }
                              position="top"
                            >
                              <div
                                className="flex justify-center items-center cursor-pointer"
                                onClick={() => {
                                  setEmployeeDialog(true);
                                  setEmployeedata(
                                    submission?.employeeIds || []
                                  );
                                }}
                              >
                                <FaUser className="text-blue-600" size={20} />
                              </div>
                            </Tooltip>
                          </td>
                          <td className="px-6 py-3 text-sm text-gray-700">
                            <Tooltip content="Reviewers" position="top">
                              <div
                                className="flex justify-center items-center cursor-pointer"
                                onClick={() => {
                                  setReviewerDialog(true);
                                  setReviewerData(
                                    [submission?.reviewerId] || []
                                  );
                                }}
                              >
                                <FaUser className="text-green-600" size={20} />
                              </div>
                            </Tooltip>
                          </td>
                          <td className="px-6 py-3 text-sm text-gray-700">
                            <Tooltip content="Schedule Dates" position="top">
                              <div
                                className="flex justify-center items-center gap-2 cursor-pointer"
                                onClick={() => {
                                  setScheduleDialog(true);
                                  setScheduledates(
                                    submission?.scheduleDates || []
                                  );
                                }}
                              >
                                <FaCalendarAlt
                                  className="text-green-600"
                                  size={20}
                                />
                              </div>
                            </Tooltip>
                          </td>
                          <td className="px-6 py-3 text-sm text-gray-700">
                            <div className="flex justify-center items-center ">
                              <button
                                className={`px-4 py-2 min-w-20 flex justify-center items-center text-white rounded transition ${hasPendingStatus
                                  ? "bg-blue-600 hover:bg-blue-700"
                                  : "bg-gray-400 cursor-not-allowed"
                                  }`}
                                onClick={() =>
                                  hasPendingStatus &&
                                  NotifyToEmployee(submission, index)
                                }
                                disabled={!hasPendingStatus}
                              >
                                {notifyLoadingRow === index ? (
                                  <Loader />
                                ) : (
                                  "Notify"
                                )}
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td
                        colSpan={8}
                        className="px-6 py-3 text-sm text-gray-500 text-center"
                      >
                        No submissions available
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Reviewer Dialog */}
            <Dialog
              isOpen={reviewerDialog}
              onClose={() => setReviewerDialog(false)}
            >
              <div className="max-h-[500px] p-4 ">
                {/* Header Section */}
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-700">
                    Assigned Reviewers
                  </h2>
                  <button
                    className="text-gray-500 hover:text-gray-800"
                    onClick={() => setReviewerDialog(false)}
                  >
                    <FaTimes size={20} />
                  </button>
                </div>

                {/* Table Section */}
                <div className="overflow-x-auto flex-grow rounded-lg overflow-y-auto">
                  <table className="min-w-full">
                    <thead className="bg-gradient-to-r from-blue-900 to-indigo-900">
                      <tr>
                        {[
                          "Reviewer ID",
                          "First Name",
                          "Last Name",
                          "Designation",
                          "Email",
                          "Contact Number",
                        ].map((header) => (
                          <th
                            key={header}
                            className="px-6 py-3 text-sm font-semibold text-white tracking-wider border-b border-blue-700"
                          >
                            {header}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-100">
                      {reviewerData.length > 0 ? (
                        reviewerData.map((reviewer) => (
                          <tr
                            key={reviewer?._id}
                            className="hover:bg-blue-50 transition-colors duration-200 text-center"
                          >
                            <td className="px-6 py-4 text-sm text-gray-700">
                              {reviewer?.employeeId}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-700">
                              {reviewer?.firstName}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-700">
                              {reviewer?.lastName}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-700">
                              {reviewer?.designation}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-700">
                              {reviewer?.email}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-700">
                              {reviewer?.contactNumber}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td
                            colSpan={6}
                            className="px-6 py-4 text-center text-sm text-gray-500"
                          >
                            No reviewers assigned
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </Dialog>
          </div>
        )}
      </div>

      {/* Assignned Employees Dialog */}
      <Dialog isOpen={employeeDialog} onClose={() => setEmployeeDialog(false)}>
        <div className="max-h-[500px] p-4 ">
          {/* Header Section */}
          <div className="flex items-center justify-between mb-4">
            {/* Heading */}
            <h2 className="text-lg font-semibold text-gray-700">
              Assigned Employees
            </h2>
            {/* Close Icon */}
            <button
              className="text-gray-500 hover:text-gray-800"
              onClick={() => setEmployeeDialog(false)}
            >
              <FaTimes size={20} />
            </button>
          </div>

          {/* Table Section */}
          <div className="overflow-x-auto flex-grow rounded-lg overflow-y-auto">
            <table className="min-w-full">
              <thead className="bg-gradient-to-r from-blue-900 to-indigo-900">
                <tr>
                  {[
                    "Employee ID",
                    "First Name",
                    "Last Name",
                    "Designation",
                    "Email",
                    "Contact Number",
                  ].map((header) => (
                    <th
                      key={header}
                      className="px-6 py-3 text-sm font-semibold text-white tracking-wider border-b border-blue-700"
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {employeedata.length > 0 ? (
                  employeedata.map((employee) => (
                    <tr
                      key={employee?._id}
                      className="hover:bg-blue-50 transition-colors duration-200 text-center"
                    >
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {employee?.employeeId}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {employee?.firstName}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {employee?.lastName}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {employee?.designation}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {employee?.email}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {employee?.contactNumber}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-6 py-4 text-center text-sm text-gray-500"
                    >
                      No employees assigned
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </Dialog>

      {/* Schedule Dates Dialog */}
      <Dialog isOpen={scheduleDialog} onClose={() => setScheduleDialog(false)}>
        <div className="p-4 min-w-[500px] ">
          {/* Close Icon */}
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold ">Schedule Dates</h2>
            <button
              onClick={() => setScheduleDialog(false)}
              className=" text-gray-600 hover:text-gray-800"
              aria-label="Close"
            >
              <FaTimes size={20} />
            </button>
          </div>
          <div className="bg-white rounded-xl overflow-auto shadow-lg border border-gray-100">
            <table className="min-w-full divide-y divide-gray-200 overflow-auto">
              <thead className="bg-gradient-to-r from-blue-900 to-indigo-900">
                <tr>
                  {[
                    "Submission Date",
                    "Reminder Date",
                    "Submission Status",
                    "Submission Date (If Completed)",
                    "Due Days",
                    "File",
                    "Reviewer's Comment", // New "Comments" header
                  ].map((header) => (
                    <th
                      key={header}
                      className="px-6 py-4 text-sm font-semibold text-white text-center"
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {scheduledates.map((date) => (
                  <tr
                    key={date._id}
                    className="hover:bg-blue-50 transition-colors duration-200 text-center"
                  >
                    {/* Submission Date */}
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {dayjs(date.submissionDate).format("DD-MMM-YYYY")}
                    </td>

                    {/* Reminder Date */}
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {dayjs(date.reminderDate).format("DD-MMM-YYYY")}
                    </td>

                    {/* Submission Status */}
                    <td
                      className={`px-6 py-4 text-sm font-medium ${date.reviewerReturnFileStatus === "Pending"
                        ? "text-red-600"
                        : "text-green-600"
                        }`}
                    >
                      {date.reviewerReturnFileStatus}
                    </td>

                    {/* Submission Date (If Completed) */}
                    <td className="px-6 py-4 text-sm text-gray-800">
                      {date.reviewerReturnFileSubmittedDate
                        ? dayjs(date.reviewerReturnFileSubmittedDate).format("DD-MMM-YYYY")
                        : "Not Submitted"}
                    </td>

                    {/* Due Days */}
                    <td className="p-3 text-center text-gray-700">
                      {calculateDueDays(date.submissionDate)}
                    </td>

                    {/* File */}
                    <td className="px-6 py-4 text-sm text-gray-800">
                      <div className="flex justify-center items-center">
                        {date.reviewerReturnFileStatus === "Submitted" &&
                          date.reviewerReturnFileDestination ? (
                          <span
                            onClick={() =>
                              getReturnFile(date.reviewerReturnFileDestination)
                            }
                            className={`text-blue-600 hover:text-blue-800 cursor-pointer ${docLoading ? "pointer-events-none opacity-50" : ""
                              }`}
                          >
                            {docLoading ? (
                              <span>Loading...</span> // Replace with spinner if desired
                            ) : (
                              <FaFilePdf className="w-5 h-5" />
                            )}
                          </span>
                        ) : (
                          "NA"
                        )}
                      </div>
                    </td>

                    <td className="px-6 py-4 text-sm text-gray-800">
                      {date?.reviewerReturnFileComments ? (
                        <span>{date.reviewerReturnFileComments}</span>
                      ) : (
                        <span className="text-gray-400 italic">
                          No comments
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </Dialog>
    </div>
  );
};

export default ReturnDashboard;
