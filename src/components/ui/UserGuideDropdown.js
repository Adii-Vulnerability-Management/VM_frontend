import React, { useState, useEffect, useRef } from "react";
import { FiBookOpen } from "react-icons/fi";

export default function UserGuideDropdown({className = ""}) {
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
        aria-label="User Guide"
      >
        <FiBookOpen size={24} />
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg p-4 z-50">
          <h4 className="text-gray-800 font-semibold mb-2">User Guide</h4>
          <ul className="space-y-2 text-blue-600 text-sm">
            <li>
              <a href="/docs/user-guide.pdf" target="_blank" rel="noreferrer">
                📄 Download PDF
              </a>
            </li>
            <li>
              <a href="/docs/module-wiki" target="_blank" rel="noreferrer">
                📚 Module Wiki
              </a>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
}
