import axios from "axios";
import Cookies from "js-cookie";
import React, { useEffect, useState } from "react";
import {
  FaCalendarAlt,
  FaCheck,
  FaExclamationTriangle,
  FaSpinner,
} from "react-icons/fa";
import { baseurl, initURL } from "../../../../BaseUrl";
import { toast } from "react-toastify";
import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
import CustomAxios from "@/globalcomponents/CustomAxios";
import Loader from "@/globalcomponents/loader/Loader";
dayjs.extend(isBetween);

function SubmissionInsights() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState({
    upcomingSubmissions: [],
    recentSubmissions: [],
    missedReminders: [],
  });

 const fetchData = async () => {
   const userData = JSON.parse(Cookies.get("user_data") || "{}");
   let url = "rbi-tracking/employee-return";

   try {
     setError(null); // Reset error state
     if (userData.role === "Employee") {
       const userId = userData._id;
       url = `rbi-tracking/employees/employee-return-employeeId/${userId}`;
     } else if (userData.role === "Reviewer") {
       const reviewerId = userData._id;
       url = `rbi-tracking/employees/employee-return-reviewerId/${reviewerId}`;
     }

     const response = await CustomAxios.get(`${baseurl}/${initURL}/${url}`);
     const records = response?.data || [];
     console.log("records", records);

     const recentSubmissions = [];
     const upcomingSubmissions = [];
     const missedReminders = [];

     const currentDate = dayjs();
     const past7Days = currentDate.subtract(7, "day");

     // Filter data properly
     records.forEach((record) => {
       record.scheduleDates.forEach((schedule) => {
         const submissionDate = dayjs(schedule.submissionDate);
         const reminderDate = dayjs(schedule.reminderDate);

         // Loop through employee submissions inside scheduleDates
         schedule.employeeSubmissions.forEach((submission) => {
           // Recent submissions (submitted in the last 7 days)
           if (
             submission.submissionStatus === "Submitted" &&
             dayjs(submission.returnSubmissionDate).isBetween(
               past7Days,
               currentDate,
               null,
               "[]"
             )
           ) {
             recentSubmissions.push({
               returnName: record.returnId.returnName,
               submissionDate: submission.returnSubmissionDate
                 ? dayjs(submission.returnSubmissionDate).format("YYYY-MM-DD")
                 : "Not Available",
             });
           }

           // Upcoming Submissions (Pending and Future Date)
           if (
             submission.submissionStatus === "Pending" &&
             submissionDate.isAfter(currentDate, "day")
           ) {
             upcomingSubmissions.push({
               returnName: record.returnId.returnName,
               submissionDate: submissionDate.format("YYYY-MM-DD"),
             });
           }

           // Missed Reminders (Pending and Past Date)
           if (
             submission.submissionStatus === "Pending" &&
             reminderDate.isBefore(currentDate, "day")
           ) {
             missedReminders.push({
               returnName: record.returnId.returnName,
               submissionDate: submissionDate.format("YYYY-MM-DD"),
             });
           }
         });
       });
     });

     // Update state
     setData({
       upcomingSubmissions,
       recentSubmissions,
       missedReminders,
     });
   } catch (error) {
     const errorMessage =
       error.response?.data?.message ||
       "An error occurred while fetching data. Please try again later.";
     setError(errorMessage);
     toast.error(errorMessage);
   } finally {
     setLoading(false);
   }
 };


  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-lg text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10">
      {/* Upcoming Submissions */}
      <div className="bg-gradient-to-br from-blue-100 to-blue-50 p-6 rounded-xl shadow-lg h-64 overflow-y-auto">
        <h3 className="text-lg font-bold text-blue-800 mb-4 flex items-center">
          <FaCalendarAlt className="mr-2 text-blue-500" /> Upcoming Submissions
        </h3>
        {data.upcomingSubmissions.length > 0 ? (
          data.upcomingSubmissions.map((submission, index) => (
            <div
              key={index}
              className="mb-4 p-3 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
            >
              <p className="text-sm font-medium text-blue-800">
                <strong>Return Name:</strong> {submission.returnName}
              </p>
              <p className="text-sm text-gray-600">
                <strong>Submission Date:</strong> {submission.submissionDate}
              </p>
            </div>
          ))
        ) : (
          <p className="text-sm text-gray-600">No upcoming submissions.</p>
        )}
      </div>

      {/* Recent Submissions */}
      <div className="bg-gradient-to-br from-green-100 to-green-50 p-6 rounded-xl shadow-lg h-64 overflow-y-auto">
        <h3 className="text-lg font-bold text-green-800 mb-4 flex items-center">
          <FaCheck className="mr-2 text-green-500" /> Recent Submissions
        </h3>
        {data.recentSubmissions.length > 0 ? (
          data.recentSubmissions.map((submission, index) => (
            <div
              key={index}
              className="mb-4 p-3 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
            >
              <p className="text-sm font-medium text-green-800">
                <strong>Return Name:</strong> {submission.returnName}
              </p>
              <p className="text-sm text-gray-600">
                <strong>Submission Date:</strong> {submission.submissionDate}
              </p>
            </div>
          ))
        ) : (
          <p className="text-sm text-gray-600">No recent submissions.</p>
        )}
      </div>

      {/* Missed Reminders */}
      <div className="bg-gradient-to-br from-red-100 to-red-50 p-6 rounded-xl shadow-lg h-64 overflow-y-auto">
        <h3 className="text-lg font-bold text-red-800 mb-4 flex items-center">
          <FaExclamationTriangle className="mr-2 text-red-500" /> Missed
          Reminders
        </h3>
        {data.missedReminders.length > 0 ? (
          data.missedReminders.map((reminder, index) => (
            <div
              key={index}
              className="mb-4 p-3 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
            >
              <p className="text-sm font-medium text-red-800">
                <strong>Return Name:</strong> {reminder.returnName}
              </p>
              <p className="text-sm text-gray-600">
                <strong>Submission Date:</strong> {reminder.submissionDate}
              </p>
            </div>
          ))
        ) : (
          <p className="text-sm text-gray-600">No missed reminders.</p>
        )}
      </div>
    </div>
  );
}

export default SubmissionInsights;
