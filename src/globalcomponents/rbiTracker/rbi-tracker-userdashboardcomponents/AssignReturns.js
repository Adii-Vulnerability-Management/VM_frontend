import CustomAxios from "@/globalcomponents/CustomAxios";
import Tooltip from "@/globalcomponents/rbiTracker/Tooltip";
import dayjs from "dayjs";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { FaClipboardList, FaFileAlt } from "react-icons/fa";
import { toast } from "react-toastify";
import { baseurl, initURL } from "../../../../BaseUrl";
import Loader from "@/globalcomponents/loader/Loader";

const AssignReturn = () => {
  const router = useRouter();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const userData = JSON.parse(Cookies.get("user_data") || "{}");

  // Fetch data from API
  const fetchData = async () => {
    const userData = JSON.parse(Cookies.get("user_data") || "{}");
    let url = "rbi-tracking/employee-return";
    try {
      if (userData.role == "Employee") {
        // Parse user_data to extract _id
        const userId = userData._id;
        url = `rbi-tracking/employees/employee-return-employeeId/${userId}`;
      } else if (userData.role === "Reviewer") {
        const reviewerId = userData._id;
        url = `rbi-tracking/employees/employee-return-reviewerId/${reviewerId}`;
      }

      // Make API request with userId as a path variable
      const response = await CustomAxios.get(`${baseurl}/${initURL}/${url}`);

      setData(response.data);
    } catch (error) {
      // Check if the error response has a message
      const errorMessage =
        error.response && error.response.data && error.response.data.message
          ? error.response.data.message
          : "An error occurred while fetching data. Please try again later.";

      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const calculateDueDays = (dueDate) => {
    const today = dayjs();
    const date = dayjs(dueDate);
    const diffDays = date.diff(today, "day");
    return diffDays > 0 ? `${diffDays} days remaining` : "Overdue";
  };

  const getPendingSchedule = (scheduleDates) => {
    const pendingSchedule = scheduleDates.find(
      (schedule) => schedule.submissionStatus === "Pending"
    );
    return pendingSchedule || scheduleDates[scheduleDates.length - 1];
  };

  const handleViewReport = (returnData) => {
    router.push({
      pathname: router.pathname,
      query: {
        ...router.query,
        tab: encodeURIComponent("Return Detail"),
        id: returnData._id,
      },
    });
  };

  if (loading) {
    return (
      <div className="text-blue-600 hover:text-blue-800 flex justify-center items-center min-h-[80vh]">
        <Loader />
      </div>
    );
  }

  return (
    <div className="w-full bg-gray-100 min-h-[85vh] py-6 px-4">
      <h2 className="font-bold text-[#2B245C] mb-4">
        Assigned Returns Overview
      </h2>
      <div className="mx-auto bg-white shadow-lg rounded-lg p-6">
        {/* Main Heading */}
        {data.length == 0 ? (
          <div className="text-center text-gray-500 py-10">
            <FaClipboardList className="text-gray-400 w-10 h-10 mx-auto mb-4" />
            <p className="text-lg font-semibold">No assigned returns found.</p>
            <p>Please check back later.</p>
          </div>
        ) : (
          <>
            {/* User Details */}
            <div className="mb-6 border-b pb-4">
              <h2 className="text-2xl font-bold text-blue-600">
                Hi,{" "}
                {userData?.user_name
                  ? userData.user_name
                  : `${userData?.firstName || ""} ${
                      userData?.lastName || ""
                    }`.trim() || "N/A"}
                !
              </h2>
              <p className="text-gray-600 mt-2">
                Below are your assigned returns and notifications.
              </p>
              <div className="mt-4 text-gray-800">
                <p>
                  Email:{" "}
                  <span className="font-medium">
                    {userData?.email || "N/A"}
                  </span>
                </p>
                <p>
                  Contact:{" "}
                  <span className="font-medium">
                    {userData?.contactNumber
                      ? userData?.contactNumber
                      : userData?.contact_number || "N/A"}
                  </span>
                </p>
              </div>
            </div>

            {/* Notifications Section */}
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-800">
                Assigned Returns
              </h2>
            </div>

            {/* Returns Table */}
            <div className="bg-gray-100 rounded-lg shadow-sm overflow-auto border border-gray-200">
              <table className="min-w-full divide-y divide-gray-200 overflow-auto">
                <thead className="bg-blue-600 text-white">
                  <tr>
                    {[
                      "Return Name",
                      "Frequency",
                      "Description",
                      // "Submission Date",
                      // "Days Remaining",
                      "Reviewer",
                      // "Submission Status",
                      "Actions",
                    ].map((label, index) => (
                      <th key={index} className={`p-3 text-center`}>
                        {label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.map((returnData, index) => {
                    const pendingSchedule = getPendingSchedule(
                      returnData.scheduleDates
                    );
                    return (
                      <tr
                        key={`${returnData._id}-${index}`}
                        className="border-b border-gray-300 text-center"
                      >
                        <td className="p-3 text-gray-700">
                          {returnData.returnId?.returnName}
                        </td>
                        <td className="p-3 text-gray-700">
                          {returnData.returnId?.frequency}
                        </td>
                        <td className="p-3 text-gray-700">
                          {returnData.returnId?.returnDescription}
                        </td>
                        {/* <td className="p-3 text-center text-gray-700">
                        {dayjs(pendingSchedule.submissionDate).format(
                          "YYYY-MM-DD"
                        )}
                      </td>
                      <td className="p-3 text-center text-gray-700">
                        {calculateDueDays(pendingSchedule.submissionDate)}
                      </td> */}
                        <td className="p-3 text-center text-gray-700">
                          {`${returnData?.reviewerId?.firstName} ${returnData?.reviewerId?.lastName}`}
                        </td>
                        {/* <td className="p-3 text-center font-medium text-red-600">
                          {pendingSchedule.submissionStatus}
                        </td> */}
                        <td className="p-3">
                          <div className="flex justify-center items-center gap-4">
                            <Tooltip content="View Report" position="top">
                              <FaFileAlt
                                className="text-green-600 w-5 h-5 cursor-pointer hover:text-green-800"
                                onClick={() => handleViewReport(returnData)}
                              />
                            </Tooltip>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AssignReturn;
