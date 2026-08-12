// components/ui/Accordian.js
import React, { useState } from "react";
import { FiChevronDown, FiChevronUp } from "react-icons/fi";

// Added optional props: actions (node in header), isOpen (controlled), onToggle (controlled)
export default function Accordion({
  title,
  icon: Icon,
  children,
  bgcolor,
  actions,
  isOpen: controlledOpen,
  onToggle,
  defaultOpen, // kept for compatibility if someone passes it
  type,
  error,
}) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(!!defaultOpen);
  const isControlled = typeof controlledOpen === "boolean";
  const isOpen = isControlled ? controlledOpen : uncontrolledOpen;

  const toggle = () => {
    if (isControlled) {
      onToggle && onToggle(!controlledOpen);
    } else {
      setUncontrolledOpen(!uncontrolledOpen);
    }
  };

  return (
    <div className=" rounded-lg overflow-hidden mb-4 shadow-sm">
      <div
        role="button"
        tabIndex={0}
        onClick={toggle}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            toggle();
          }
        }}
        className={`w-full flex items-center justify-between 
    ${bgcolor ? bgcolor : "bg-[#2B245C]"} hover:bg-opacity-90 text-white 
    px-4 py-3 outline-none focus:outline-none focus:ring-2 
    focus:ring-offset-2 focus:ring-[#050038] transition
    border-0`}
      >
        <div className="flex items-center space-x-2">
          {Icon && <Icon size={18} className="text-white" />}
          <span className="font-semibold text-lg">{title}</span>
        </div>
        <div className="flex items-center gap-2">
          {actions && (
            <div
              onClick={(e) => e.stopPropagation()}
              onKeyDown={(e) => e.stopPropagation()}
              className="flex items-center"
            >
              {actions}
            </div>
          )}
          {isOpen ? <FiChevronUp size={20} /> : <FiChevronDown size={20} />}
        </div>
      </div>

      <div
        className={`transition-[max-height] duration-300 ease-in-out bg-white ${isOpen ? "max-h-screen py-4 overflow-y-auto" : "max-h-0 border-t"
          }`}
      >
        <div className="px-4 pb-4 bg-white">{children}</div>
      </div>
    </div>
  );
}
