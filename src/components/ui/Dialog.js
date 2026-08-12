// components/ui/Dialog.js
import React, { useEffect } from "react";
import ReactDOM from "react-dom";
import { FiX } from "react-icons/fi";

export default function Dialog({ isOpen, onClose, title, children, footer }) {
  // ESC key close + body scroll lock
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  if (typeof document === "undefined" || !isOpen) return null;

  return ReactDOM.createPortal(
    <div
      className="
    fixed inset-0 z-50 flex items-center justify-center
    backdrop-blur-md backdrop-brightness-75 bg-white/10
    transition-opacity
  "
      onClick={onClose}
    >
      <div
        className="
          bg-white rounded-xl shadow-2xl
          w-full max-w-3xl mx-4 sm:mx-auto
          overflow-hidden
          transform transition-all duration-200
          
        "
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between bg-[#2B245C] text-white px-6 py-4">
          <h2 className="text-2xl font-semibold tracking-wide text-white">
            {title}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-[#050038] focus:outline-none focus:ring-2 focus:ring-white"
            aria-label="Close dialog"
          >
            <FiX size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 bg-[#F2F1FB] max-h-[70vh] overflow-y-auto text-sm text-gray-800">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="flex justify-end items-center bg-[#F2F1FB] px-6 py-4 space-x-3 border-t border-gray-200">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
}
