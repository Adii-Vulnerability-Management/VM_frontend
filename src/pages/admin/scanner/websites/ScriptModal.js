// src/components/ScriptModal.jsx
import { useState } from "react";
import { FiCopy, FiCheck, FiX } from "react-icons/fi";
import { baseurl, initURL } from "@/config/config";

// src/components/CodeSnippet.jsx
function CodeSnippet({ siteId }) {
  const [copied, setCopied] = useState(false);

  // Build the script tag dynamically
  const script = `<script async src="${baseurl}/${initURL}/banner-loader3.js" data-website-id="${siteId}"></script>`;

  const handleCopy = () => {
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard
        .writeText(script)
        .then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        })
        .catch(console.error);
    } else {
      const textarea = document.createElement("textarea");
      textarea.value = script;
      textarea.setAttribute("readonly", "");
      textarea.style.position = "fixed";
      textarea.style.top = 0;
      textarea.style.left = 0;
      textarea.style.opacity = 0;
      document.body.appendChild(textarea);
      textarea.select();
      try {
        document.execCommand("copy");
        setCopied(true);
      } catch (err) {
        console.error(err);
      }
      document.body.removeChild(textarea);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="relative bg-gray-900 text-green-400 p-4 rounded-md font-mono text-sm overflow-x-auto">
      <code>{script}</code>
      <button
        onClick={handleCopy}
        className="absolute top-2 right-2 p-2 rounded bg-gray-800 text-white hover:bg-gray-700 focus:outline-none"
        aria-label="Copy code"
      >
        {copied ? <FiCheck className="text-green-400" /> : <FiCopy />}
      </button>
    </div>
  );
}

export default function ScriptModal({ siteId, onClose }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg mx-4 overflow-hidden">
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-[#2B245C]">
            Script Implementation
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-md hover:bg-gray-100 focus:outline-none"
            aria-label="Close modal"
          >
            <FiX className="w-5 h-5 text-gray-600" />
          </button>
        </div>
        <div className="p-6">
          <CodeSnippet siteId={siteId} />
        </div>
      </div>
    </div>
  );
}
