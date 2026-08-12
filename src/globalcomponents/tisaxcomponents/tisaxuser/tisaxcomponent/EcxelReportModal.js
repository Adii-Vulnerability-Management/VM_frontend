import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import CustomAxios from "@/globalcomponents/CustomAxios";
import Tisaxwebshocket from "../Tisaxwebshocket";

function EcxelReportModal() {
  const [messageHistory, setMessageHistory] = useState({});
  const [status, setStatus] = useState(false);
  const [showloader, setShowLoader] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const router = useRouter();
  const { id, vda_type, assessment_level } = router.query;
  const [maturityType, setMaturityType] = useState("");
  const [showSpinner, setShowSpinner] = useState(false);
  const handleMaturityTypeChange = (event) => {
    setMaturityType(event.target.value);
  };
  const [showModal, setShowModal] = useState(false);
  const handleShowModal = () => setShowModal(true);
  const handleCloseModal = () => {
    setShowModal(false);
    setMessageHistory({});
    setDownloadProgress(0);
    setStatus(true);
  };
  const hidePrototypeProtection = assessment_level === "AL2";

  const downloadFile = async () => {
    try {
      const response = await CustomAxios({
        url: messageHistory.file_url,
        method: "GET",
        responseType: "blob",
        onDownloadProgress: (progressEvent) => {
          const progress = Math.round(
            (progressEvent.loaded / progressEvent.total) * 100
          );
          setDownloadProgress(progress);
        },
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "report.xlsx");
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("Error downloading file:", error);
    }
  };

  useEffect(() => {
    setShowSpinner(true);
  }, [showModal]);

  useEffect(() => {
    if (messageHistory.file_url) {
      setShowSpinner(false);
    }
  }, [messageHistory]);

  return (
    <div>
      <div className="flex justify-center">
        <button
          className="bg-[#007ACC] hover:bg-[#005A99] active:bg-[#004F8A] text-white font-semibold text-md py-2 px-4 rounded-lg text-md mb-3"
          onClick={handleShowModal}
        >
          Excel Report
        </button>
      </div>

      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 z-50">
          <div className="bg-white rounded-lg shadow-lg max-w-sm w-full mx-auto">
            <div className="flex justify-between items-center px-4 py-2 border-b">
              <h2 className="text-lg font-bold">Excel Report</h2>
              <button
                className="text-gray-500 hover:text-gray-700 font-bold"
                onClick={handleCloseModal}
              >
                &#x2715; {/* Unicode for the "X" character */}
              </button>
            </div>

            <div className="p-4 text-center">
              {showSpinner && (
                <div className="flex justify-center items-center">
                  <div className="spinner-border animate-spin inline-block w-8 h-8 border-4 rounded-full" />
                </div>
              )}
              {messageHistory?.error && <p>{messageHistory.error}</p>}
              {messageHistory?.message && (
                <div>
                  <p>{messageHistory.message}</p>
                  <button
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                    disabled={downloadProgress > 1 && downloadProgress < 100}
                    onClick={downloadFile}
                  >
                    Download File
                  </button>
                </div>
              )}
              {downloadProgress > 1 && downloadProgress < 100 && (
                <div>
                  <p>Downloading...</p>
                  <div className="relative pt-1">
                    <div className="overflow-hidden h-2 text-xs flex rounded bg-blue-200">
                      <div
                        style={{ width: `${downloadProgress}%` }}
                        className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-500"
                      ></div>
                    </div>
                    <span>{downloadProgress}%</span>
                  </div>
                </div>
              )}
            </div>

            <div className="px-4 py-2 border-t">
              <Tisaxwebshocket
                _id={id}
                vda_type={vda_type}
                showModal={showModal}
                setShowModal={setShowModal}
                messageHistory={messageHistory}
                setMessageHistory={setMessageHistory}
                setStatus={setStatus}
                status={status}
                showloader={showloader}
                showSpinner={showSpinner}
                setShowLoader={setShowLoader}
              />
              {/* <button
                className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded mt-2"
                onClick={handleCloseModal}
              >
                Close
              </button> */}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default EcxelReportModal;
