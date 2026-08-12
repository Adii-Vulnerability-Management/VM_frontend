// components/SearchSection.js
import React, { useState } from "react";
import { FaSearch } from "react-icons/fa";
import Button from "./Button"; // Adjust the import path as necessary

export default function SearchSection({
  placeholder = "Search…",
  initialValue = "",
  searchButtonText = "Search",
  clearButtonText = "Clear",
  showClearButton = true,
  onSearch = () => {},
  onClear = () => {},
  className = "",
}) {
  const [term, setTerm] = useState(initialValue);

  const handleSearch = () => {
    onSearch(term);
  };

  const handleClear = () => {
    setTerm("");
    onClear();
  };

  return (
    <div className={`flex items-center space-x-3 mb-5 ${className}`}>
      <input
        type="text"
        value={term}
        onChange={(e) => setTerm(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleSearch()}
        placeholder={placeholder}
        className="w-1/3 rounded-lg border border-gray-500 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-indigo-200 transition-all"
      />

      <Button onClick={handleSearch}>
        <div className="flex items-center gap-2 rounded-lg p-0.5 text-sm font-semibold">
          <FaSearch /> {searchButtonText}
        </div>
      </Button>

      {showClearButton && (
        <Button variant="outline" onClick={handleClear}>
          <div className="text-sm font-semibold rounded-lg">
            {clearButtonText}
          </div>
        </Button>
      )}
    </div>
  );
}
