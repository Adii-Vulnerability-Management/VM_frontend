// src/components/AskGRC3AIFullscreen.js
import React, { useState, useRef } from "react";
import axios from "axios";
import { FaPaperPlane, FaFileUpload, FaRobot, FaUser } from "react-icons/fa";

export default function AskGRC3AIFullscreen() {
  const [fileContent, setFileContent] = useState("");
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState([]); // { sender: 'user'|'ai', text }
  const [loading, setLoading] = useState(false);
  const availableFiles = ["tisax.txt"];
  const handleFileSelect = async (e) => {
    const selected = e.target.value;
    if (!selected) return;

    try {
      const res = await fetch(`/AIFiles/${selected}`);
      const text = await res.text();
      setFileContent(text);
    } catch (err) {
      console.error("Failed to load file:", err);
      setFileContent("⚠️ Could not load selected file.");
    }
  };
 
  const handleSend = async () => {
    if (!question.trim()) return;
    setMessages((m) => [...m, { sender: "user", text: question }]);
    setLoading(true);

    try {
      const prompt = `
Use only the following context from the uploaded file:

${fileContent}

Answer the question below in six concise lines:

${question}
      `.trim();

      const response = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.NEXT_PUBLIC_GEMINI_API_KEY}`,
        { contents: [{ parts: [{ text: prompt }] }] },
        { headers: { "Content-Type": "application/json" } }
      );

      const aiText =
        response.data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ||
        "🤖 Sorry, I couldn't generate a response.";

      setMessages((m) => [...m, { sender: "ai", text: aiText }]);
    } catch (err) {
      console.error("AI error:", err);
      setMessages((m) => [
        ...m,
        { sender: "ai", text: "⚠️ Error generating AI response." },
      ]);
    } finally {
      setLoading(false);
      setQuestion("");
    }
  };

  return (
    <div className="h-screen  flex flex-col bg-gradient-to-br from-white to-gray-50">
      {/* Header */}
      <header className="flex items-center space-x-3 p-6">
        <FaRobot className="w-8 h-8 text-indigo-600 animate-pulse" />
        <h1 className="text-3xl font-extrabold text-gray-800">
          🔮 Ask GRC3 AI
        </h1>
      </header>

      {/* File Selector */}
      <div className="flex items-center space-x-3 px-6">
        <FaFileUpload className="w-6 h-6 text-gray-600" />
        <select
          onChange={handleFileSelect}
          defaultValue=""
          className="text-sm border border-gray-300 rounded px-3 py-2"
        >
          <option value="" disabled>
            Select a module file...
          </option>
          {availableFiles.map((file) => (
            <option key={file} value={file}>
              {file.replace(".txt", "").toUpperCase()}
            </option>
          ))}
        </select>
        {fileContent && (
          <span className="text-sm text-green-600">
            ✅ Loaded ({fileContent.length.toLocaleString()} chars)
          </span>
        )}
      </div>

      {/* Chat Window */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map((m, i) => (
          <div
            key={i}
            className={`flex items-start space-x-2 ${
              m.sender === "user" ? "justify-end" : "justify-start"
            }`}
          >
            {m.sender === "ai" && (
              <FaRobot className="w-5 h-5 text-indigo-500 mt-1" />
            )}
            <div
              className={`max-w-[75%] px-4 py-2 rounded-lg prose-sm ${
                m.sender === "user"
                  ? "bg-blue-100 text-blue-900 rounded-br-none"
                  : "bg-indigo-50 text-gray-800 rounded-bl-none"
              }`}
            >
              {m.text}
            </div>
            {m.sender === "user" && (
              <FaUser className="w-5 h-5 text-blue-600 mt-1" />
            )}
          </div>
        ))}
        {loading && (
          <p className="text-sm text-gray-500 animate-pulse">
            🤖 AI is thinking...
          </p>
        )}
      </div>

      {/* Input Area */}
      <div className="flex flex-col sm:flex-row items-center sm:space-x-3 p-6 border-t border-gray-200 bg-white">
        <textarea
          rows={2}
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSend();
              setQuestion(""); // 🔄 Clear the textarea after sending
            }
          }}
          placeholder="Type your question here... (Enter to send, Shift+Enter for newline)"
          className="flex-grow border border-gray-300 rounded-lg p-3 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-200"
        />

        <button
          onClick={handleSend}
          disabled={loading || !fileContent}
          className="mt-3 sm:mt-0 inline-flex items-center justify-center px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg shadow hover:bg-indigo-700 focus:outline-none disabled:opacity-50 transition"
        >
          <FaPaperPlane className="w-5 h-5 mr-2" />
          {loading ? "Sending..." : "Send"}
        </button>
      </div>
    </div>
  );
}
