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
      className="fixed inset-0 bg-black bg-opacity-50 z-50"
      onClick={handleOverlayClick}
    >
      <div
        className="fixed inset-0  flex items-center justify-center max-h-[90vh] overflow-y-auto"
        onClick={handleOverlayClick}
      >
        <div
          className="bg-white rounded-lg shadow-lg opacity-100 w-fit m-auto h-fit overflow-y-auto max-h-[80vh] overflow-hidden border border-gray-400"
          onClick={(e) => e.stopPropagation()}
        >
          {children}
        </div>
      </div>
    </div>
  );
};

export default Dialog;