import React, { useState, useEffect, useRef } from "react";
import { FiLifeBuoy } from "react-icons/fi";

export default function SupportDropdown({className = ""}) {
  const [open, setOpen] = useState(false);
  const ref = useRef();

  useEffect(() => {
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className={` hover:text-opacity-80 focus:outline-none ${className}`}
        aria-label="Support"
      >
        <FiLifeBuoy size={24} />
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg p-4 z-50">
          <h4 className="text-gray-800 font-semibold mb-2">Support</h4>
          <ul className="space-y-2 text-gray-700 text-sm">
            <li>
              <button
                onClick={() => {
                  /* open live chat logic */
                }}
                className="w-full text-left hover:text-blue-600"
              >
                💬 Live Chat
              </button>
            </li>
            <li>
              <a
                href="mailto:support@yourcompany.com"
                className="hover:text-blue-600"
              >
                ✉️ Email Support
              </a>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
}
