import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { FaCloudUploadAlt, FaFilePdf } from "react-icons/fa";
import { baseurl, initURL } from "../../../BaseUrl";
import Dialog from "./Dialog";
import Loader from "../loader/Loader";
import CustomAxios from "../CustomAxios";

const validFileTypes = ["returnFormatFileDestination", "circularFileDestination"]; // Ensure only valid file types

const UploadReturnFiles = ({ userData }) => {
  const [trackerData, setTrackerData] = useState([]);
  const [submissionStatusDialog, setSubmissionStatusDialog] = useState(false);
  const [selectedFileType, setSelectedFileType] = useState(null);
  const [selectedTrackerId, setSelectedTrackerId] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [docLoading, setDocLoading] = useState({}); // Tracks loading for each file type separately
  const [tableLoading, setTableLoading] = useState(true); // Track loading state for table data

  // Fetch tracker data
const fetchTrackerData = async () => {
  setTableLoading(true); // Start loading before fetching data
  try {
    const response = await CustomAxios.get(
      `${baseurl}/${initURL}/rbi-tracking/fetch-submission-tracking`
    );
    setTrackerData(response.data);
  } catch (error) {
    toast.error("Error loading tracker data");
  } finally {
    setTableLoading(false); // Stop loading once data is retrieved
  }
};


  useEffect(() => {
    fetchTrackerData();
  }, []);

  // Open Dialog for file upload
  const openUploadDialog = (fileType, trackerId) => {
    if (!validFileTypes.includes(fileType)) {
      toast.error("Invalid file type selected.");
      return;
    }
    setSelectedFileType(fileType);
    setSelectedTrackerId(trackerId);
    setSelectedFile(null);
    setSubmissionStatusDialog(true);
  };

  // Handle file selection
  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  // Handle file upload
  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!selectedFile) {
      toast.error("Please select a file.");
      return;
    }

    if (!validFileTypes.includes(selectedFileType)) {
      toast.error("Invalid file type detected. Please refresh and try again.");
      return;
    }

    setUploadLoading(true);
    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("notifierId", selectedTrackerId);
    formData.append("fileType", selectedFileType);

    try {
      await CustomAxios.patch(
        `${baseurl}/${initURL}/rbi-tracking/update-return-files`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      toast.success("File uploaded successfully!");
      setSubmissionStatusDialog(false);
      fetchTrackerData(); // Refresh table data after upload
    } catch (error) {
      toast.error("Error uploading file.");
    } finally {
      setUploadLoading(false);
    }
  };

  // Handle file download (pre-signed URL) - Only loading for the specific document
  const getReturnFile = async (filePath, trackerId, fileType) => {
    let url = "rbi-tracking/getReturnFile";
    if (["Employee", "Reviewer"].includes(userData?.role)) {
      url = `rbi-tracking/employees/getReturnFile`;
    }

    try {
      setDocLoading((prev) => ({
        ...prev,
        [`${trackerId}-${fileType}`]: true,
      })); // Set loading for the specific file

      const { data } = await CustomAxios.post(`${baseurl}/${initURL}/${url}`, {
        filePath,
      });

      if (data.success && data.presignedUrl) {
        window.open(data.presignedUrl, "_blank");
      } else {
        toast.error("Failed to get the pre-signed URL.");
      }
    } catch (error) {
      toast.error("Error opening file. Please try again.");
    } finally {
      setDocLoading((prev) => ({
        ...prev,
        [`${trackerId}-${fileType}`]: false,
      })); // Reset loading
    }
  };

  return (
    <div className="p-6 min-h-screen">
      <h2 className="text-2xl font-bold text-gray-700 mb-6">
        Upload & Download Return Files
      </h2>

      <div className="overflow-x-auto bg-white shadow-md rounded-lg">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-[#1e284e] text-white text-center">
              {[
                "Report Code",
                "Return Name",
                "Return Format File",
                "Circular Copy",
              ].map((header, index) => (
                <th key={index} className="p-3 border">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {tableLoading ? (
              <tr>
                <td colSpan="4" className="flex items-center justify-center text-center p-6">
                  <Loader /> {/* Show Loader while fetching data */}
                </td>
              </tr>
            ) : (
              trackerData.map((item) => (
                <tr
                  key={item._id}
                  className="border hover:bg-gray-100 transition text-center"
                >
                  <td className="p-3 border">{item.reportCode}</td>
                  <td className="p-3 border">{item.returnName}</td>
                  <td className="p-3 border">
                    <div className="flex justify-center items-center">
                      {item.returnFormatFileDestination ? (
                        <span
                          onClick={() =>
                            getReturnFile(
                              item.returnFormatFileDestination,
                              item._id,
                              "returnFormatFile"
                            )
                          }
                          className={`text-[#1e284e] hover:text-blue-800 cursor-pointer ${
                            docLoading[`${item._id}-returnFormatFile`]
                              ? "pointer-events-none opacity-50"
                              : ""
                          }`}
                        >
                          {docLoading[`${item._id}-returnFormatFile`] ? (
                            <Loader />
                          ) : (
                            <FaFilePdf className="w-5 h-5" />
                          )}
                        </span>
                      ) : (
                        <button
                          onClick={() =>
                            openUploadDialog(
                              "returnFormatFileDestination",
                              item._id
                            )
                          }
                          className="flex items-center px-4 py-2 bg-[#1e284e] text-white rounded-lg hover:bg-blue-700 transition"
                        >
                          <FaCloudUploadAlt className="mr-2" /> Upload
                        </button>
                      )}
                    </div>
                  </td>
                  <td className="p-3 border">
                    <div className="flex justify-center items-center">
                      {item.circularFileDestination ? (
                        <span
                          onClick={() =>
                            getReturnFile(
                              item.circularFileDestination,
                              item._id,
                              "circularFile"
                            )
                          }
                          className={`text-[#1e284e] hover:text-blue-800 cursor-pointer ${
                            docLoading[`${item._id}-circularFile`]
                              ? "pointer-events-none opacity-50"
                              : ""
                          }`}
                        >
                          {docLoading[`${item._id}-circularFile`] ? (
                            <Loader />
                          ) : (
                            <FaFilePdf className="w-5 h-5" />
                          )}
                        </span>
                      ) : (
                        <button
                          onClick={() =>
                            openUploadDialog(
                              "circularFileDestination",
                              item._id
                            )
                          }
                          className="flex items-center px-4 py-2 bg-[#1e284e] text-white rounded-lg hover:bg-blue-700 transition"
                        >
                          <FaCloudUploadAlt className="mr-2" /> Upload
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Upload Dialog */}
      <Dialog
        isOpen={submissionStatusDialog}
        onClose={() => setSubmissionStatusDialog(false)}
      >
        <div className="rounded-lg p-6 min-w-[500px] bg-white shadow-lg">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Upload{" "}
            {selectedFileType === "returnFormatFileDestination"
              ? "Return Format File"
              : "Circular Copy"}
          </h2>
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label
                htmlFor="fileUpload"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Select File
              </label>
              <input
                type="file"
                id="fileUpload"
                accept=".pdf,.doc,.docx,.xls,.xlsx"
                onChange={handleFileChange}
                required
                className="block w-full border border-gray-300 rounded-lg p-2 text-gray-700 focus:ring focus:ring-blue-300 focus:outline-none"
              />
            </div>
            <div className="flex justify-end space-x-4">
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                disabled={uploadLoading}
              >
                {uploadLoading ? <Loader /> : "Upload File"}
              </button>
            </div>
          </form>
        </div>
      </Dialog>
    </div>
  );
};

export default UploadReturnFiles;
