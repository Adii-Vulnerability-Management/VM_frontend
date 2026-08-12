import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import TisaxWebSocket from "./TisaxWebSocket";
import axios from "axios";
import Dialog from "@/components/ui/Dialog";
import Loader from "@/components/ui/Loader";
import Button from "@/components/ui/Button";
function ExcelReportModal() {
  const [messageHistory, setMessageHistory] = useState({});
  const [status, setStatus] = useState(false);
  const [showloader, setShowLoader] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const router = useRouter();
  const { id, vda_type, assessment_level } = router.query;
  const [showSpinner, setShowSpinner] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const handleShowModal = () => setShowModal(true);
  const handleCloseModal = () => {
    setShowModal(false);
    setMessageHistory({});
    setDownloadProgress(0);
    setStatus(true);
  };

  const downloadFile = async () => {
    try {
      const response = await axios({
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
        <Button
          className=" text-white font-semibold text-md py-2 px-4 rounded-lg text-md mr-4"
          onClick={handleShowModal}
        >
          Excel Report
        </Button>
      </div>

      {showModal && (
        <Dialog
          isOpen={showModal}
          onClose={handleCloseModal}
          title="Excel Report"
          footer={
            <TisaxWebSocket
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
          }
        >
          <div className="text-center">
            {showSpinner && (
              <div className="flex justify-center items-center">
                <Loader />
              </div>
            )}

            {messageHistory?.error && (
              <p className="text-red-500">{messageHistory.error}</p>
            )}
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
              <div className="flex flex-col items-center">
                <Loader />
                <p className="mt-2 text-sm text-gray-600">
                  Downloading... {downloadProgress}%
                </p>
              </div>
            )}
          </div>
        </Dialog>
      )}
    </div>
  );
}

export default ExcelReportModal;
