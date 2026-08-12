// DSARMessages.js
import React, { useEffect, useRef, useState } from "react";
// import CustomAxios from "@/config/CustomAxios";
// import { baseurl, initURL } from "@/config/config";
// import { toast } from "react-toastify";
import { HiPlus } from "react-icons/hi";
import { IoSend } from "react-icons/io5";
import { MdDeleteForever } from "react-icons/md";

const DSARMessages = ({ dsarId, role }) => {
  const [messages, setMessages] = useState([]);
  const [newMsg, setNewMsg] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);

  const fileInputRef = useRef(null);
  const messagesEndRef = useRef(null); // Auto-scroll to latest message whenever messages change

  // -------------------
  // MOCK INITIAL LOAD
  // -------------------
  useEffect(() => {
    setLoading(true);

    const mockMessages = [
      {
        _id: "1",
        dsarId,
        senderType: "user",
        text: "Hi, I submitted this DPRM. When can I expect an update?",
        createdAt: new Date("2025-11-10T10:00:00Z"),
        files: [],
      },
      {
        _id: "2",
        dsarId,
        senderType: "assignee",
        text: "Hello! We received your request. Could you please upload your ID document?",
        createdAt: new Date("2025-11-27T10:00:00Z"),
        files: [],
      },
    ];

    setTimeout(() => {
      setMessages(mockMessages);
      setLoading(false);
    }, 600);

    // ---------------
    // BACKEND FETCH
    // ---------------
    /*
    const fetchMessages = async () => {
      try {
        setLoading(true);
        const res = await CustomAxios.get(
          `${baseurl}/${initURL}/dsar/${dsarId}/messages`
        );

        // Expecting: conversation object with messages array
        // { _id, userId, assigneeId, dsarId, messages: [...] }
        const serverMessages = Array.isArray(res.data?.messages)
          ? res.data.messages
          : [];
        setMessages(serverMessages);
      } catch (error) {
        console.error("Failed to fetch DSAR messages:", error);
        toast.error("Failed to load messages.");
      } finally {
        setLoading(false);
      }
    };

    // fetchMessages();
    */
  }, [dsarId]);

  // Auto-scroll to latest message whenever messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Date + 12-hour time: "12-01-2025, 3:19 pm"
  const formatDateTime = (value) => {
    const d = new Date(value);
    if (isNaN(d.getTime())) return "";

    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();

    let hours = d.getHours();
    const minutes = String(d.getMinutes()).padStart(2, "0");
    const ampm = hours >= 12 ? "pm" : "am";

    hours = hours % 12;
    if (hours === 0) hours = 12;

    return `${day}-${month}-${year}, ${hours}:${minutes} ${ampm}`;
  };

  // Delete message option (within last 24 hours AND sent by current role)
  const canDeleteMessage = (message) => {
    // must be my own message
    if (message.senderType !== role) return false;

    const created = new Date(message.createdAt);
    if (isNaN(created.getTime())) return false;

    const diffMs = Date.now() - created.getTime();
    const hours = diffMs / (1000 * 60 * 60);

    return hours <= 24;
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      setSelectedFiles((prev) => [...prev, ...files]);
    }
  };

  const clearFile = (indexToRemove = null) => {
    if (indexToRemove === null) {
      setSelectedFiles([]);
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    setSelectedFiles((prev) => prev.filter((_, i) => i !== indexToRemove));
  };

  const handleSend = () => {
    if (sending) return;

    const trimmed = newMsg.trim();
    const hasText = trimmed.length > 0;
    const hasFiles = selectedFiles.length > 0;

    if (!hasText && !hasFiles) return;

    setSending(true);

    // -------------------------------
    // MOCK SEND
    // -------------------------------
    setTimeout(() => {
      const files =
        selectedFiles.length > 0
          ? selectedFiles.map((file) => ({
              fileName: file.name,
              fileUrl: URL.createObjectURL(file), // demo only
            }))
          : [];

      const newMessage = {
        _id: String(Date.now()),
        dsarId,
        senderType: role,
        text: trimmed,
        files,
        createdAt: new Date(),
      };

      setMessages((prev) => [...prev, newMessage]);
      setNewMsg("");
      setSelectedFiles([]);
      if (fileInputRef.current) fileInputRef.current.value = "";
      setSending(false);
    }, 400);

    // ------------------------------------
    // REAL BACKEND SEND
    // ------------------------------------
    /*
    (async () => {
      try {
        const formData = new FormData();
        formData.append("text", trimmed);
        formData.append("senderType", role);
        formData.append("dsarId", dsarId);

        selectedFiles.forEach((file) => {
          formData.append("files", file); // backend expects "files"
        });

        const res = await CustomAxios.post(
          `${baseurl}/${initURL}/dsar/${dsarId}/messages`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );

        const savedMessage = res.data; // or res.data.message
        setMessages((prev) => [...prev, savedMessage]);
        setNewMsg("");
        setSelectedFiles([]);
        if (fileInputRef.current) fileInputRef.current.value = "";
      } catch (error) {
        console.error("Failed to send message:", error);
        toast.error("Failed to send message. Please try again.");
      } finally {
        setSending(false);
      }
    })();
    */
  };

  const handleDeleteMessage = (messageId) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this message?"
    );
    if (!confirmDelete) return;

    // -------------------------------
    // MOCK DELETE
    // -------------------------------
    setMessages((prev) => prev.filter((m) => m._id !== messageId));

    // ------------------------------------
    // REAL BACKEND DELETE
    // ------------------------------------
    /*
    (async () => {
      try {
        await CustomAxios.delete(
          `${baseurl}/${initURL}/dsar/${dsarId}/messages/${messageId}`
        );

        setMessages((prev) => prev.filter((m) => m._id !== messageId));
        toast.success("Message deleted.");
      } catch (error) {
        console.error("Failed to delete message:", error);
        toast.error("Failed to delete message. Please try again.");
      }
    })();
    */
  };

  return (
    <div className="h-full flex flex-col">
      <h3 className="text-sm font-semibold text-gray-800 mb-2">Messages</h3>

      {/* MESSAGES LIST */}
      <div className="flex-1 overflow-y-auto mb-3 space-y-2 text-sm pr-1">
        {loading && (
          <p className="text-gray-400 text-center">Loading messages...</p>
        )}

        {!loading && messages.length === 0 && (
          <p className="text-gray-400">No messages yet.</p>
        )}

        {!loading &&
          messages.map((m) => (
            <div
              key={m._id}
              className={`flex ${
                m.senderType === role ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`px-3 py-2 rounded-lg max-w-[75%] ${
                  m.senderType === "user"
                    ? "bg-blue-50 text-blue-800"
                    : "bg-gray-100 text-gray-800"
                }`}
              >
                {m.text && (
                  <p className="whitespace-pre-wrap text-[13px]">{m.text}</p>
                )}

                {/* Attachment preview / download (files array) */}
                {Array.isArray(m.files) && m.files.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {m.files.map((file, idx) => (
                      <a
                        key={idx}
                        href={file.fileUrl}
                        download={file.fileName}
                        title="Click to Download"
                        className="block"
                      >
                        📎
                        <span className="text-xs text-indigo-700 underline">
                          {file.fileName}
                        </span>
                      </a>
                    ))}
                  </div>
                )}

                <div className="mt-1 flex items-center justify-between gap-2">
                  <p className="text-[10px] text-gray-500">
                    {formatDateTime(m.createdAt)}
                  </p>

                  {canDeleteMessage(m) && (
                    <button
                      type="button"
                      onClick={() => handleDeleteMessage(m._id)}
                      className="text-red-500 hover:underline"
                      title="Delete message"
                    >
                      <MdDeleteForever size={15} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}

        {/* this keeps the view pinned to the last message */}
        <div ref={messagesEndRef} />
      </div>

      {/* INPUT + ATTACH FILE */}
      <div className="mt-0 space-y-2">
        {/* Selected file pills */}
        {selectedFiles.length > 0 && (
          <div className="flex flex-wrap gap-1 text-xs bg-gray-100 p-2 rounded">
            {selectedFiles.map((file, index) => (
              <div
                key={index}
                className="flex items-center gap-1 bg-white border border-gray-200 rounded px-2 py-1"
              >
                <span className="truncate max-w-[140px]">📎 {file.name}</span>
                <button
                  type="button"
                  onClick={() => clearFile(index)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
            ))}
            {selectedFiles.length > 1 && (
              <button
                type="button"
                onClick={() => clearFile(null)}
                className="ml-auto text-[11px] text-gray-500 hover:text-gray-700"
              >
                Clear all
              </button>
            )}
          </div>
        )}

        <div className="flex gap-2 items-center">
          {/* Hidden file input */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            multiple
          />

          {/* Attach a file button */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-2 text-xs text-gray-600 font-medium border border-gray-300 rounded-md hover:bg-gray-100"
            title="Attach file(s)"
          >
            <HiPlus size={20} />
          </button>

          {/* Type a new message box */}
          <textarea
            value={newMsg}
            onChange={(e) => setNewMsg(e.target.value)}
            placeholder="Type a message..."
            rows={1}
            className="
              flex-1
              text-sm
              border border-gray-300
              rounded-md
              px-3 py-2
              resize-none
              focus:outline-none focus:ring-indigo-500 focus:border-indigo-500
            "
          />

          {/* Send message button */}
          <button
            onClick={handleSend}
            disabled={sending || (!newMsg.trim() && selectedFiles.length === 0)}
            className="bg-indigo-600 text-white px-3 py-2.5 rounded-md text-sm hover:bg-indigo-700 disabled:opacity-60 cursor-pointer"
            title="Send"
          >
            {sending ? "..." : <IoSend size={18} />}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DSARMessages;
