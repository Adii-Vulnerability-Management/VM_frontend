"use client";
import CustomAxios from "@/globalcomponents/CustomAxios";
import Loader from "@/globalcomponents/loader/Loader";
import Tooltip from "@/globalcomponents/rbiTracker/Tooltip";
import dayjs from "dayjs";
import Cookies from "js-cookie";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import {
  FaCalendarAlt,
  FaEnvelope,
  FaEye,
  FaEyeSlash,
  FaFilePdf,
  FaPhone,
  FaUpload,
  FaUserTie,
} from "react-icons/fa";
import { toast } from "react-toastify";
import { baseurl, initURL } from "../../../../BaseUrl";
import Dialog from "../Dialog";

const ReturnDetailSection = () => {
  const router = useRouter();
  const { id, employeeId } = router.query; // Extract `id` from the URL
  const [returnData, setReturnData] = useState(null); // State to hold API data
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitreturnLoading, setsubmitreturnLoading] = useState(false);
  const [scheduleId, setScheduleId] = useState(null);
  const [file, setFile] = useState(null);
  const [docLoading, setDocLoading] = useState(false);
  const [comment, setComment] = useState("");
  const userData = JSON.parse(Cookies.get("user_data") || "{}");
  const [showReviewDialog, setShowReviewDialog] = useState(false);
  const [reviewedStatus, setReviewedStatus] = useState(null);
  const [reviewedComment, setReviewedComment] = useState("");
  const [reviewerUserId, setreviewerUserId] = useState("");
  const [reviewedLoading, setreviewedLoading] = useState(false);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState(employeeId || null);

  const [submissionId, setsubmissionId] = useState(null)
  const [reviewerComment, setReviewerComment] = useState(""); // NEW: Reviewer comment state
  const [showReviewerUploadDialog, setShowReviewerUploadDialog] = useState(false);
  const [reviewerFile, setReviewerFile] = useState(null);
  const [reviewerUploadLoading, setReviewerUploadLoading] = useState(false);

  const [showReviewerTable, setShowReviewerTable] = useState(false);

  const updateUrl = (newEmployeeId) => {
    router.push(
      {
        pathname: router.pathname,
        query: { id, employeeId: newEmployeeId },
      },
      undefined,
      { shallow: true }
    );
  };

  const handleReviewerFileChange = (e) => setReviewerFile(e.target.files[0]);
  useEffect(() => {
    if (userData.role === "Employee") {
      setSelectedEmployeeId(userData._id);
      updateUrl(userData._id);
    }
  }, [userData]);

  const fetchData = async () => {
    if (!id) return;
    const userData = JSON.parse(Cookies.get("user_data") || "{}");
    let url = `rbi-tracking/employee-return/${id}`;
    setLoading(true);
    try {
      if (["Employee", "Reviewer"].includes(userData.role)) {
        // Parse user_data to extract _id
        url = `rbi-tracking/employees/employee-return/${id}`;
      }
      const response = await CustomAxios.get(`${baseurl}/${initURL}/${url}`);
      setReturnData(response.data); // Set the fetched data
      if (response.data?.employeeIds?.length > 0) {
        setSelectedEmployeeId(employeeId || response.data.employeeIds[0]._id);
      }
    } catch (error) {
      toast.error("Failed to fetch data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  if (loading) {
    return (
      <div className="text-blue-600 hover:text-blue-800 flex justify-center items-center min-h-[80vh]">
        <Loader />
      </div>
    );
  }

  if (!returnData) {
    return <div className="text-center mt-10">No data found.</div>;
  }

  const openModal = (scheduleid) => {
    setScheduleId(scheduleid);
    setShowModal(true);
  };

  const handleFileChange = (e) => setFile(e.target.files[0]);

  const handleCommentChange = (e) => setComment(e.target.value);

  const handleSubmit = async () => {
    if (!file) {
      toast.error("Please select a file to upload.");
      return;
    }

    if (!comment || comment.trim().length === 0) {
      toast.error("Please enter a valid comment.");
      return;
    }

    if (!scheduleId || scheduleId.trim().length === 0) {
      toast.error("Invalid schedule ID. Please try again.");
      return;
    }

    // Create FormData object
    const formData = new FormData();
    formData.append("file", file);
    formData.append("comment", comment);
    formData.append("returnScheduleId", scheduleId);
    formData.append("returnSubmissionId", submissionId);

    let url = `rbi-tracking/uploadreturnfile`;
    setsubmitreturnLoading(true);

    try {
      if (["Employee", "Reviewer"].includes(userData.role)) {
        url = `rbi-tracking/employees/uploadreturnfile`;
      }

      const response = await CustomAxios.post(
        `${baseurl}/${initURL}/${url}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.status === 201) {
        toast.success("File uploaded successfully!");
        setShowModal(false);
        setFile(null);
        setComment("");
        fetchData();
      } else {
        toast.error("Failed to upload the file. Please try again.");
      }
    } catch (error) {
      toast.error(
        "Error uploading file. Please check your network connection."
      );
    } finally {
      setsubmitreturnLoading(false);
    }
  };

  const getReturnFile = async (filePath) => {
    let url = "rbi-tracking/getReturnFile";
    if (["Employee", "Reviewer"].includes(userData.role)) {
      url = `rbi-tracking/employees/getReturnFile`;
    }
    try {
      setDocLoading(true); // Start loader
      // Fetch the pre-signed URL
      const { data } = await CustomAxios.post(`${baseurl}/${initURL}/${url}`, {
        filePath,
      });

      if (data.success && data.presignedUrl) {
        // Open the file in a new tab
        window.open(data.presignedUrl, "_blank");
      } else {
        toast.error("Failed to get the pre-signed URL.");
      }
    } catch (error) {
      toast.error("Error opening file. Please try again.");
    } finally {
      setDocLoading(false); // Stop loader
    }
  };

  const handleReviewSubmit = async () => {
    if (
      !reviewedComment ||
      reviewedStatus === null ||
      reviewedStatus === undefined
    ) {
      toast.error("Please add a comment and select a status.");
      return;
    }

    // Convert `reviewedStatus` to a boolean if it is a string
    const booleanReviewedStatus =
      reviewedStatus == "true"
        ? true
        : reviewedStatus == "false"
          ? false
          : null;



    let body = {
      scheduleId,
      comment: reviewedComment,
      reviewedStatus: booleanReviewedStatus, // Explicitly store as a boolean
      reviewerUserId,
      submissionId
    };

    let url = "rbi-tracking/add-review-comment";
    if (["Employee", "Reviewer"].includes(userData.role)) {
      url = `rbi-tracking/employees/add-review-comment`;
    }

    setreviewedLoading(true);
    try {
      const response = await CustomAxios.post(
        `${baseurl}/${initURL}/${url}`,
        body
      );

      if (response.status === 201) {
        toast.success("Review added successfully!");
        setReviewedStatus(null);
        setReviewedComment("");
        setShowReviewDialog(false);
        fetchData(); // Refresh data
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        "Failed to submit review. Please try again.";
      toast.error(errorMessage);
    } finally {
      setreviewedLoading(false);
    }
  };

  const handleReviewerFileUpload = async (e) => {
    e.preventDefault();

    if (!reviewerFile) {
      toast.error("Please select a file to upload.");
      return;
    }

    if (!scheduleId) {
      toast.error("Invalid schedule ID. Please try again.");
      return;
    }

    // Find the correct scheduleDateId based on the selected scheduleId
    const scheduleDateId = returnData?.scheduleDates?.find(
      (schedule) => schedule._id === scheduleId
    )?._id;

    if (!scheduleDateId) {
      toast.error("No matching schedule date ID found.");
      return;
    }

    const formData = new FormData();
    formData.append("file", reviewerFile);
    formData.append("returnScheduleId", scheduleId);
    formData.append("scheduleDateId", scheduleDateId); // Ensure we send scheduleDateId
    formData.append("reviewerReturnFileStatus", "Submitted"); // Ensure we send scheduleDateId
    formData.append("reviewerReturnFileComments", reviewerComment); // Ensure we send scheduleDateId

    setReviewerUploadLoading(true);

    try {
      let url = `rbi-tracking/reviewer-uploadfile`;
      if (["Reviewer", "Admin"].includes(userData.role)) {
        url = `rbi-tracking/employees/reviewer-uploadfile`;
      }

      const response = await CustomAxios.post(
        `${baseurl}/${initURL}/${url}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.status === 201) {
        toast.success("File uploaded successfully!");
        setShowReviewerUploadDialog(false);
        setReviewerFile(null);
        fetchData(); // Refresh data after upload
      } else {
        toast.error("Failed to upload the file. Please try again.");
      }
    } catch (error) {
      toast.error("Error uploading file. Please check your network connection.");
    } finally {
      setReviewerUploadLoading(false);
    }
  };


  const { employeeIds, returnId, scheduleDates } = returnData;

  // Filter schedule dates to show only submissions related to the selected employee
  const filteredScheduleDates = scheduleDates?.map((schedule) => ({
    ...schedule,
    employeeSubmissions: schedule.employeeSubmissions.filter(
      (submission) =>
        submission.employeeId ===
        (userData.role === "Employee" ? userData._id : selectedEmployeeId)
    ),
  }));

  const handleEmployeeChange = (e) => {
    const newEmployeeId = e.target.value;
    setSelectedEmployeeId(newEmployeeId);
    updateUrl(newEmployeeId);
  };

  return (
    <div className="py-6 px-4">
      {/* Main Heading */}
      <h2 className="font-bold text-[#2B245C] mb-4">Return Detail Overview</h2>

      {userData.role !== "Employee" && !showReviewerTable && (
        <div className="mb-6">
          <label className="text-lg font-bold text-blue-600">
            Select Employee:
          </label>
          <select
            className="w-full border border-gray-300 rounded-md p-2 mt-2"
            value={selectedEmployeeId || ""}
            onChange={handleEmployeeChange}
          >
            {employeeIds?.map((employee) => (
              <option key={employee._id} value={employee._id}>
                {employee.firstName} {employee.lastName} ({employee.employeeId})
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="bg-white shadow-lg rounded-lg p-6">
        {/* Employee Details */}
        {!showReviewerTable && (
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-blue-600 mb-4 flex items-center gap-2">
              <FaUserTie className="text-blue-600" />
              Employee Details
            </h2>
            {employeeIds
              ?.filter((emp) => emp._id === selectedEmployeeId)
              .map((employee) => (
                <div
                  key={employee._id}
                  className="grid grid-cols-2 gap-4 text-gray-800"
                >
                  <p>
                    <span className="font-medium">Name:</span>{" "}
                    {employee?.user_name} {employee?.firstName}{" "}
                    {employee?.lastName}
                  </p>
                  <p>
                    <span className="font-medium">Employee ID:</span>{" "}
                    {employee?.employeeId}
                  </p>
                  <p>
                    <span className="font-medium">Designation:</span>{" "}
                    {employee?.designation}
                  </p>
                  <p>
                    <span className="font-medium flex items-center gap-1">
                      <FaEnvelope className="text-blue-600" /> Email:
                    </span>{" "}
                    {employee?.email}
                  </p>
                  <p>
                    <span className="font-medium flex items-center gap-1">
                      <FaPhone className="text-blue-600" /> Contact:
                    </span>{" "}
                    {employee?.contactNumber}
                  </p>
                </div>
              ))}
          </div>
        )}{" "}
        {/* Return Details */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-blue-600 mb-4 flex items-center gap-2">
            <FaCalendarAlt className="text-blue-600" />
            Return Details
          </h2>
          <div className="grid grid-cols-2 gap-4 text-gray-800">
            <p>
              <span className="font-medium">Return Name:</span>{" "}
              {returnId?.returnName}
            </p>
            <p>
              <span className="font-medium">Frequency:</span>{" "}
              {returnId?.frequency}
            </p>
            <p>
              <span className="font-medium">Department:</span>{" "}
              {returnId?.departmentConcerned}
            </p>
            <p>
              <span className="font-medium">Reporting Entity:</span>{" "}
              {returnId?.reportingEntity}
            </p>
            <p className="col-span-2">
              <span className="font-medium">Description:</span>{" "}
              {returnId?.returnDescription}
            </p>
            <p className="col-span-2">
              <span className="font-medium">Circular Details:</span>{" "}
              {returnId?.detailsOfRelatedCirculars}
            </p>
          </div>
        </div>
        {/* Toggle Button */}
        {userData.role !== "Employee" && (
          <div className="flex justify-end mb-4">
            <button
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
              onClick={() => setShowReviewerTable(!showReviewerTable)}
            >
              {showReviewerTable ? <FaEyeSlash /> : <FaEye />}
              {showReviewerTable
                ? "Hide Reviewer Table"
                : "Show Reviewer Table"}
            </button>
          </div>
        )}
        {/* Schedule Dates */}
        {!showReviewerTable && (
          <div>
            <h2 className="text-2xl font-bold text-blue-600 mb-4 flex items-center gap-2">
              <FaCalendarAlt className="text-blue-600" />
              Schedule Dates
            </h2>
            <div className="bg-gray-100 rounded-lg shadow-sm overflow-auto border border-gray-200">
              <table className="min-w-full divide-y divide-gray-200 overflow-auto">
                <thead className="bg-blue-600 text-white">
                  <tr>
                    {[
                      "Submission Date",
                      "Reminder Date",
                      "Employee Name",
                      "Submission Status",
                      "Submission Date (If Completed)",
                      "File",
                      "Submitter's Comment",
                      "Reviewer Status",
                      "Reviewer Comment",
                      "Reviewed Date",
                      "Action",
                    ].map((label, index) => (
                      <th
                        key={index}
                        className="px-6 py-3 text-center text-sm font-medium"
                      >
                        {label}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredScheduleDates?.map((schedule) =>
                    schedule?.employeeSubmissions?.map((submission, idx) => {
                      const daysDifference = dayjs(
                        schedule?.submissionDate
                      ).diff(dayjs(), "day");
                      const employee = employeeIds.find(
                        (emp) => emp._id === submission.employeeId
                      );

                      return (
                        <tr key={submission?._id} className="text-center">
                          {/* Submission Date */}
                          <td className="px-6 py-4 text-sm text-gray-800">
                            {dayjs(schedule?.submissionDate).format(
                              "YYYY-MM-DD"
                            )}
                          </td>

                          {/* Reminder Date */}
                          <td className="px-6 py-4 text-sm text-gray-800">
                            {dayjs(schedule?.reminderDate).format("YYYY-MM-DD")}
                          </td>

                          {/* Employee Name */}
                          <td className="px-6 py-4 text-sm text-gray-800">
                            {employee?.firstName} {employee?.lastName} (
                            {employee?.employeeId})
                          </td>

                          {/* Submission Status */}
                          <td
                            className={`px-6 py-4 text-sm font-medium ${submission?.submissionStatus === "Pending"
                              ? "text-yellow-600"
                              : "text-green-600"
                              }`}
                          >
                            {submission?.submissionStatus}
                          </td>

                          {/* Submission Date (If Completed) */}
                          <td className="px-6 py-4 text-sm text-gray-800">
                            {submission?.returnSubmissionDate
                              ? dayjs(submission.returnSubmissionDate).format(
                                "YYYY-MM-DD"
                              )
                              : "Not Submitted"}
                          </td>

                          {/* File */}
                          <td className="px-6 py-4 text-sm text-gray-800">
                            <div className="flex justify-center items-center">
                              {submission?.returnFileDestination ? (
                                <span
                                  onClick={() =>
                                    getReturnFile(
                                      submission.returnFileDestination
                                    )
                                  }
                                  className="text-blue-600 hover:text-blue-800 cursor-pointer"
                                >
                                  <FaFilePdf className="w-5 h-5" />
                                </span>
                              ) : (
                                "NA"
                              )}
                            </div>
                          </td>

                          {/* Comments */}
                          <td className="px-6 py-4 text-sm text-gray-800">
                            {submission?.comments || (
                              <span className="text-gray-400 italic">
                                No comments
                              </span>
                            )}
                          </td>

                          {/* Reviewed Status */}
                          <td
                            className={`px-6 py-4 text-sm font-medium ${submission?.isReviewed === true
                              ? "text-green-600"
                              : submission?.isReviewed === false
                                ? "text-red-600"
                                : "text-yellow-600"
                              }`}
                          >
                            {submission?.isReviewed === true
                              ? "Approved"
                              : submission?.isReviewed === false
                                ? "Rejected"
                                : "Pending"}
                          </td>

                          {/* Reviewer Comments */}
                          <td className="px-6 py-4 text-sm text-gray-800">
                            {submission?.reviewerComments || (
                              <span className="text-gray-400 italic">
                                No comments
                              </span>
                            )}
                          </td>

                          {/* Reviewed Date */}
                          <td className="px-6 py-4 text-sm text-gray-800">
                            {submission?.reviewedDate
                              ? dayjs(submission.reviewedDate).format(
                                "YYYY-MM-DD"
                              )
                              : "Not Reviewed"}
                          </td>

                          {/* Actions */}
                          <td className="px-6 py-4 text-sm text-gray-800">
                            <div className="flex justify-center items-center gap-2">
                              {userData?.role !== "Reviewer" &&
                                (schedule?.submissionStatus === "Submitted" &&
                                  schedule?.isReviewed ? (
                                  <FaUpload className="w-5 h-5 text-gray-400 cursor-not-allowed" />
                                ) : daysDifference < 0 ||
                                  daysDifference <= 3 ? (
                                  <FaUpload
                                    className="w-5 h-5 text-blue-600 cursor-pointer hover:text-blue-800"
                                    onClick={() => {
                                      openModal(submission?._id),
                                        setsubmissionId(schedule?._id);
                                    }}
                                  />
                                ) : (
                                  <FaUpload className="w-5 h-5 text-gray-400 cursor-not-allowed" />
                                ))}

                              {(userData?.role === "Reviewer" ||
                                userData?.user_designation === "Admin") && (
                                  <FaUserTie
                                    className={`w-5 h-5 ${submission?.submissionStatus ===
                                      "Submitted" && !submission.isReviewed
                                      ? "text-blue-600 cursor-pointer hover:text-blue-800"
                                      : "text-gray-400 cursor-not-allowed"
                                      }`}
                                    onClick={() => {
                                      if (
                                        submission?.submissionStatus ===
                                        "Submitted" &&
                                        !submission.isReviewed
                                      ) {
                                        setScheduleId(submission?._id);
                                        setShowReviewDialog(true);
                                        setreviewerUserId(
                                          returnData.reviewerId._id
                                        );
                                        setsubmissionId(schedule?._id);
                                      }
                                    }}
                                  />
                                )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
        {/* Reviewer Table */}
        {showReviewerTable && (
          <div className="bg-gray-100 rounded-lg shadow-sm overflow-auto border border-gray-200 mb-6">
            <h2 className="text-xl font-bold text-blue-600 p-4">
              Reviewer Submissions
            </h2>
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-blue-600 text-white">
                <tr>
                  {[
                    "Submission Date",
                    "Reminder Date",
                    "Status",
                    "Comments",
                    "File",
                    "Action",
                  ].map((label, index) => (
                    <th
                      key={index}
                      className="px-6 py-3 text-center text-sm font-medium"
                    >
                      {label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {returnData?.scheduleDates?.map((schedule) => {
                  const isSubmitted =
                    schedule?.reviewerReturnFileStatus === "Submitted";
                  const fileUrl = schedule?.reviewerReturnFileDestination; // File URL

                  return (
                    <tr key={schedule._id} className="text-center">
                      {/* Submission Date */}
                      <td className="px-6 py-4 text-sm text-gray-800">
                        {dayjs(schedule?.submissionDate).format("YYYY-MM-DD")}
                      </td>

                      {/* Reminder Date */}
                      <td className="px-6 py-4 text-sm text-gray-800">
                        {dayjs(schedule?.reminderDate).format("YYYY-MM-DD")}
                      </td>

                      {/* Status with Color Indication */}
                      <td
                        className={`px-6 py-4 text-sm font-medium ${isSubmitted ? "text-green-600" : "text-red-600"
                          }`}
                      >
                        {schedule?.reviewerReturnFileStatus || "Pending"}
                      </td>

                      {/* Comments */}
                      <td className="px-6 py-4 text-sm text-gray-800">
                        {schedule?.reviewerReturnFileComments || "No Comments"}
                      </td>

                      {/* File Icon (Opens in new tab) */}
                      <td className="px-6 py-4 text-sm text-gray-800">
                        <div className="flex justify-center items-center">
                          {isSubmitted && fileUrl ? (
                            <Tooltip
                              content="View Submitted File"
                              position="top"
                            >
                              <FaFilePdf
                                className="w-5 h-5 text-blue-600 cursor-pointer hover:text-blue-800"
                                onClick={() => getReturnFile(fileUrl)}
                              />
                            </Tooltip>
                          ) : (
                            <span className="text-gray-400 italic">
                              No File
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Upload File Action */}
                      <td className="px-6 py-4 text-sm text-gray-800">
                        <div className="flex justify-center items-center">
                          {userData?.role === "Reviewer" ||
                            userData?.user_designation !== "Employee" ? (
                            isSubmitted ? (
                              <Tooltip
                                content="File already submitted"
                                position="top"
                              >
                                <FaUpload className="w-5 h-5 text-gray-400 cursor-not-allowed" />
                              </Tooltip>
                            ) : (
                              <Tooltip
                                content="Upload File for Review"
                                position="top"
                              >
                                <FaUpload
                                  className="w-5 h-5 text-green-600 cursor-pointer hover:text-green-800"
                                  onClick={() => {
                                    setScheduleId(schedule?._id);
                                    setShowReviewerUploadDialog(true);
                                  }}
                                />
                              </Tooltip>
                            )
                          ) : null}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Reviewer File Upload Dialog */}
      <Dialog
        isOpen={showReviewerUploadDialog}
        onClose={() => setShowReviewerUploadDialog(false)}
      >
        <div className="rounded-lg p-6 min-w-[500px]">
          <h2 className="text-xl font-bold mb-4 text-[#2B245C]">
            Upload Final File
          </h2>
          <form onSubmit={handleReviewerFileUpload}>
            <div className="mb-4">
              <label
                htmlFor="reviewerFile"
                className="block text-sm font-medium text-[#2B245C] mb-2"
              >
                Upload File
              </label>
              <input
                type="file"
                id="reviewerFile"
                accept=".pdf,.doc,.docx,.xlsx,.xls"
                onChange={handleReviewerFileChange}
                required
                className="block w-full border border-gray-300 rounded-md p-2 text-[#2B245C] focus:ring focus:ring-blue-300 focus:outline-none"
              />
            </div>
            {/* Reviewer Comment Input */}
            <div className="mb-4">
              <label
                htmlFor="reviewerComment"
                className="block text-sm font-medium text-[#2B245C] mb-2"
              >
                Reviewer Comments
              </label>
              <textarea
                id="reviewerComment"
                value={reviewerComment}
                onChange={(e) => setReviewerComment(e.target.value)}
                required
                className="block w-full border border-gray-300 rounded-md p-2 text-[#2B245C] focus:ring focus:ring-blue-300 focus:outline-none"
                placeholder="Enter your review comments..."
              />
            </div>
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => setShowReviewerUploadDialog(false)}
                className="flex items-center px-4 py-2 bg-gray-200 text-[#2B245C] rounded-md hover:bg-gray-300 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex items-center justify-center min-w-20 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
              >
                {reviewerUploadLoading ? <Loader /> : "Upload File"}
              </button>
            </div>
          </form>
        </div>
      </Dialog>
      {/* Modal for File Upload and Comments */}
      <Dialog isOpen={showModal} onClose={() => setShowModal(false)}>
        <div className="rounded-lg shadow-lg w-96 p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">
            Submit Return
          </h3>
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2">
              Upload File
            </label>
            <input
              type="file"
              onChange={handleFileChange}
              className="w-full border border-gray-300 rounded-md p-2"
              accept="*"
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2">
              Add Comments
            </label>
            <textarea
              value={comment}
              onChange={handleCommentChange}
              className="w-full border border-gray-300 rounded-md p-2"
              placeholder="Enter comments..."
            />
          </div>
          <div className="flex justify-end gap-4">
            <button
              className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition"
              onClick={() => setShowModal(false)}
            >
              Cancel
            </button>
            <button
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition min-w-20 flex items-center justify-center"
              onClick={handleSubmit}
            >
              {submitreturnLoading ? <Loader /> : "Submit"}
            </button>
          </div>
        </div>
      </Dialog>

      {/* Review Dialog */}
      <Dialog
        isOpen={showReviewDialog}
        onClose={() => setShowReviewDialog(false)}
      >
        <div className="rounded-lg shadow-lg w-96 p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">
            Review Details
          </h3>
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2">
              Reviewed Status
            </label>
            <select
              value={reviewedStatus}
              onChange={(e) => setReviewedStatus(e.target.value)}
              className="w-full border border-gray-300 rounded-md p-2"
            >
              <option value="">Select Status</option>
              <option value={true}>Approved</option>
              <option value={false}>Rejected</option>
            </select>
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2">
              Comments
            </label>
            <textarea
              value={reviewedComment}
              onChange={(e) => setReviewedComment(e.target.value)}
              className="w-full border border-gray-300 rounded-md p-2"
              placeholder="Enter comments..."
            />
          </div>
          <div className="flex justify-end gap-4">
            <button
              className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition"
              onClick={() => setShowReviewDialog(false)}
            >
              Cancel
            </button>
            <button
              className="bg-blue-600 min-w-20 flex justify-center items-center  text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
              onClick={handleReviewSubmit}
            >
              {reviewedLoading ? <Loader /> : "Submit"}
            </button>
          </div>
        </div>
      </Dialog>
    </div>
  );
};

export default ReturnDetailSection;
