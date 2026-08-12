// components/ui/Accordian.js
import React, { useState } from "react";
import { FiChevronDown, FiChevronUp } from "react-icons/fi";

export default function Accordion({ title, icon: Icon, children }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className=" rounded-lg overflow-hidden mb-4 shadow-sm">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="
    w-full flex items-center justify-between 
    bg-[#2B245C] hover:bg-opacity-90 text-white 
    px-4 py-3 outline-none focus:outline-none focus:ring-2 
    focus:ring-offset-2 focus:ring-[#050038] transition
    border-0
  "
      >
        <div className="flex items-center space-x-2">
          {Icon && <Icon size={18} className="text-white" />}
          <span className="font-semibold text-lg">{title}</span>
        </div>
        {isOpen ? <FiChevronUp size={20} /> : <FiChevronDown size={20} />}
      </button>

      <div
        className={`transition-[max-height] duration-300 ease-in-out bg-white ${isOpen ? "max-h-screen py-4 overflow-y-auto" : "max-h-0 border-t"
          }`}
      >
        <div className="px-4 pb-4 bg-white">{children}</div>
      </div>
    </div>
  );
}
