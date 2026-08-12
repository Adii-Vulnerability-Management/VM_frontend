import axios from "axios";
import Cookies from "js-cookie";
import React, { useEffect, useState } from "react";
import {
  FaClipboardList,
  FaClock,
  FaCheckCircle,
  FaExclamationCircle,
  FaSpinner,
  FaBoxOpen,
} from "react-icons/fa";
import { toast } from "react-toastify";
import dayjs from "dayjs";
import { baseurl, initURL } from "../../../../BaseUrl";
import CustomAxios from "@/globalcomponents/CustomAxios";
import Loader from "@/globalcomponents/loader/Loader";

function SummaryBoxes() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // State for fetched data
  const [data, setData] = useState({
    totalReturns: 0,
    totalSubmissions: 0,
    pendingSubmissions: 0,
    submittedSubmissions: 0,
    overdueSubmissions: 0,
  });

  // Fetch data from API
  const fetchData = async () => {
    const userData = JSON.parse(Cookies.get("user_data") || "{}");
    let url = "rbi-tracking/employee-return";
    try {
      setLoading(true);
      setError(null); // Reset error state
      if (userData.role == "Employee") {
        // Parse user_data to extract _id
        const userId = userData._id;
        url = `rbi-tracking/employees/employee-return-employeeId/${userId}`;
      } else if (userData.role === "Reviewer") {
        const reviewerId = userData._id;
        url = `rbi-tracking/employees/employee-return-reviewerId/${reviewerId}`;
      }

      const response = await CustomAxios.get(`${baseurl}/${initURL}/${url}`);
      const records = response?.data || [];

      // Calculate counts
      let totalSubmissions = 0;
      let pendingSubmissions = 0;
      let submittedSubmissions = 0;
      let overdueSubmissions = 0;

      records.forEach((record) => {
        totalSubmissions += record.scheduleDates.length;

        record.scheduleDates.forEach((schedule) => {
          if (schedule.submissionStatus === "Pending") {
            pendingSubmissions++;
            if (dayjs(schedule.submissionDate).isBefore(dayjs(), "day")) {
              overdueSubmissions++;
            }
          } else if (schedule.submissionStatus === "Submitted") {
            submittedSubmissions++;
          }
        });
      });

      setData({
        totalReturns: records.length, // Total number of records
        totalSubmissions,
        pendingSubmissions,
        submittedSubmissions,
        overdueSubmissions,
      });
    } catch (error) {
      setError(
        "An error occurred while fetching data. Please try again later."
      );
      toast.error(
        error.response?.data?.message ||
          "An error occurred while fetching data. Please try again later."
      );
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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 min-h-[160px]">
      {/* Total Returns */}
      <div className="bg-white p-6 rounded-xl shadow-lg flex items-center space-x-4">
        <div className="bg-purple-500 p-4 rounded-full">
          <FaBoxOpen className="text-3xl text-white" />
        </div>
        <div>
          <p className="text-sm font-medium text-gray-500">Total Returns</p>
          <p className="text-3xl font-bold text-gray-800">
            {data.totalReturns}
          </p>
        </div>
      </div>

      {/* Total Submissions */}
      <div className="bg-white p-6 rounded-xl shadow-lg flex items-center space-x-4">
        <div className="bg-blue-500 p-4 rounded-full">
          <FaClipboardList className="text-3xl text-white" />
        </div>
        <div>
          <p className="text-sm font-medium text-gray-500">Total Submissions</p>
          <p className="text-3xl font-bold text-gray-800">
            {data.totalSubmissions}
          </p>
        </div>
      </div>

      {/* Pending Submissions */}
      <div className="bg-white p-6 rounded-xl shadow-lg flex items-center space-x-4">
        <div className="bg-yellow-500 p-4 rounded-full">
          <FaClock className="text-3xl text-white" />
        </div>
        <div>
          <p className="text-sm font-medium text-gray-500">
            Pending Submissions
          </p>
          <p className="text-3xl font-bold text-gray-800">
            {data.pendingSubmissions}
          </p>
        </div>
      </div>

      {/* Submitted Submissions */}
      <div className="bg-white p-6 rounded-xl shadow-lg flex items-center space-x-4">
        <div className="bg-green-500 p-4 rounded-full">
          <FaCheckCircle className="text-3xl text-white" />
        </div>
        <div>
          <p className="text-sm font-medium text-gray-500">
            Submitted Submissions
          </p>
          <p className="text-3xl font-bold text-gray-800">
            {data.submittedSubmissions}
          </p>
        </div>
      </div>

      {/* Overdue Submissions */}
      <div className="bg-white p-6 rounded-xl shadow-lg flex items-center space-x-4">
        <div className="bg-red-500 p-4 rounded-full">
          <FaExclamationCircle className="text-3xl text-white" />
        </div>
        <div>
          <p className="text-sm font-medium text-gray-500">
            Overdue Submissions
          </p>
          <p className="text-3xl font-bold text-gray-800">
            {data.overdueSubmissions}
          </p>
        </div>
      </div>
    </div>
  );
}

export default SummaryBoxes;
