import React, { useState, useEffect, useRef } from "react";
import { FiBell } from "react-icons/fi";

export default function NotificationsDropdown({className = ""}) {
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
        aria-label="Notifications"
      >
        <FiBell size={24} />
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg p-4 z-50">
          <h4 className="text-gray-800 font-semibold mb-2">Notifications</h4>
          <ul className="space-y-2 text-gray-600 text-sm">
            <li>✅ User “Shyam” submitted a report</li>
            <li>⚠️ Server response delayed</li>
            <li>🔔 New policy added</li>
          </ul>
        </div>
      )}
    </div>
  );
}
