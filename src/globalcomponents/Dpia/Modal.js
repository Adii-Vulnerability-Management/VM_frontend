import React from "react";
import Dialog from "@/globalcomponents/Dialog";

const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <Dialog isOpen={isOpen} onClose={onClose}>
      <div className="p-6">
        {title ? (
          <div className="mb-4 border-b border-slate-200 pb-3">
            <h3 className="text-lg font-semibold text-slate-800">{title}</h3>
          </div>
        ) : null}
        <div>{children}</div>
      </div>
    </Dialog>
  );
};

export default Modal;
