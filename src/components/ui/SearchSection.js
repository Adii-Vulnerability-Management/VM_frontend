// components/SearchSection.js
import React, { useState } from "react";
import { FaSearch } from "react-icons/fa";
import Button from "@/components/ui/Button";

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
    <div className={`flex w-64 items-center space-x-3 ${className}`}>
      <input
        type="text"
        value={term}
        onChange={(e) => setTerm(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleSearch()}
        placeholder={placeholder}
        className="flex-grow border rounded-lg p-1 m-1 mx-2 focus:outline-none focus:ring-2 focus:[#2B245C] focus:ring-opacity-50 transition duration-200 ease-in-out"
      />

      <Button onClick={handleSearch}>
        <div className="flex items-center justify-center">
          <FaSearch className=" mr-1" /> {searchButtonText}
        </div>
      </Button>

      {showClearButton && (
        <Button variant="outline" onClick={handleClear}>
          {clearButtonText}
        </Button>
      )}
    </div>
  );
}
