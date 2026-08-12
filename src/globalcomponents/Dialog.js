import React, { useEffect } from "react";

const Dialog = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 w-full h-full bg-black bg-opacity-40 backdrop-blur-sm z-50 overflow-y-auto"
      onClick={handleOverlayClick}
    >
      <div className="min-h-screen flex items-center justify-center p-6">
        <div
          className="bg-white rounded-lg shadow-xl w-full max-w-[1000px] mx-auto overflow-hidden border border-gray-300"
          onClick={(e) => e.stopPropagation()}
        >
          {children}
        </div>
      </div>
    </div>
  );
};

export default Dialog;