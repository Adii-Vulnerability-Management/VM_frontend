import React, { useCallback, useEffect, useRef, useState } from "react";
import useWebSocket, { ReadyState } from "react-use-websocket";
import { WebShocket_baseurl } from "../../../../BaseUrl";

function WebShocket({
  _id,
  vda_type,
  showModal,
  setShowModal,
  messageHistory,
  setMessageHistory,
  setStatus,
  showloader,
  setShowLoader,
  status,
  showSpinner,
}) {
  const [socketUrl, setSocketUrl] = useState(
    `${WebShocket_baseurl}/ws/tisax_excel_report/${_id}/`
  );
  const { sendMessage, readyState, lastMessage, websocket } = useWebSocket(
    socketUrl
  );

  useEffect(() => {
    setStatus(readyState);
    if (readyState === ReadyState.CONNECTING && ReadyState.OPEN) {
      setShowLoader(true);
    } else {
      setShowLoader(false);
    }
  }, [readyState]);

  useEffect(() => {
    if (lastMessage !== null) {
      setMessageHistory(JSON.parse(lastMessage?.data));
      setShowLoader(false);
    }
  }, [lastMessage]);

  const connectionStatus = {
    [ReadyState.CONNECTING]: "Connecting",
    [ReadyState.OPEN]: "Open",
    [ReadyState.CLOSING]: "Closing",
    [ReadyState.CLOSED]: "Closed",
    [ReadyState.UNINSTANTIATED]: "Uninstantiated",
  }[readyState];

  const prevIdRef = useRef(_id);
  const prevVdaTypeRef = useRef(vda_type);
  const prevShowModalRef = useRef(false);

  const sendMessageCallback = useCallback(() => {
    let data = { _id: _id, vda_type: vda_type };
    sendMessage(JSON.stringify(data));
  }, [_id, vda_type, sendMessage]);

  useEffect(() => {
    if (showModal && !prevShowModalRef.current) {
      sendMessageCallback();
      prevIdRef.current = _id;
      prevVdaTypeRef.current = vda_type;
    }
    prevShowModalRef.current = showModal;
  }, [showModal, sendMessageCallback]);

  const handleClickCloseConnection = () => {
    setShowModal(false);
    setMessageHistory({});
    if (readyState === ReadyState.OPEN) {
      setSocketUrl(null);
    }
  };

  return (
    <div>
      {!showSpinner && (
        <button
          className={`bg-red-500 text-white px-4 py-2 rounded text-sm ${
            readyState === ReadyState.CLOSED || readyState === ReadyState.CLOSING
              ? "opacity-50 cursor-not-allowed"
              : ""
          }`}
          onClick={handleClickCloseConnection}
          disabled={readyState === ReadyState.CLOSED || readyState === ReadyState.CLOSING}
        >
          Close
        </button>
      )}
    </div>
  );
}

export default WebShocket;
