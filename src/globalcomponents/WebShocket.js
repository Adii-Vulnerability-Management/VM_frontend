import React, { useCallback, useEffect, useState } from "react";
import { WebShocket_baseurl } from "../../BaseUrl";

function WebShocket({
  onSave,
  showModal,
  selectedHeadquarter,
  setShowModal,
  setIsModalOpen,
  isModalOpen,
  setSelectedHeadquarter,
  setSelectedSubheadquarters,
  setShowLoader,
  showloader,
  setMessageData,
  messagedata,
}) {
  const myid = selectedHeadquarter?.myid;
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    if (!showModal) {
      socket?.close();
    }
    setSelectedHeadquarter(null);
    setSelectedSubheadquarters([]);
  }, [showModal]);

  const handleClickSendMessage = useCallback(() => {
    if (myid) {
      const socketUrl = `${WebShocket_baseurl}/ws/tisax_word_report/${myid}/`;

      const ws = new WebSocket(socketUrl);
      ws.onopen = () => {
        const saveData = onSave();

        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify(saveData));
          setShowLoader(true);
        }
      };

      ws.onmessage = (event) => {
        if (event.data) {
          const parsedData = JSON.parse(event.data);
          setMessageData(parsedData); // Update message state
          setShowLoader(false);
        }
      };

      setSocket(ws);
    }
  }, [myid, onSave]);

  const handleCloseConnection = () => {
    setShowModal(false);
    setShowLoader(false);
    setMessageData(null);
  };

  return (
    <div className="flex space-x-3">
      {(showloader || !messagedata) && (
        <button
          className={`bg-blue-500 hover:bg-blue-600 text-white font-bold py-1 px-3 rounded ${!myid ? "opacity-50 cursor-not-allowed" : ""}`}
          onClick={handleClickSendMessage}
          disabled={!myid}
        >
          Generate Report
        </button>
      )}

      {!showloader && (
        <button
          className="bg-red-500 hover:bg-red-600 text-white font-bold py-1 px-3 rounded"
          onClick={handleCloseConnection}
        >
          Close
        </button>
      )}
    </div>
  );
}

export default WebShocket;
