import { useEffect, useState } from "react";
import { FaChevronDown } from "react-icons/fa";

const SelectDropdown = ({
  name,
  options = [],
  value,
  onChange,
  isMulti = false,
  placeholder = "Select...",
  className = "",
  isDisabled = false,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredOptions, setFilteredOptions] = useState(options);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    if (searchTerm) {
      setFilteredOptions(
        options.filter((option) =>
          option.label.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    } else {
      setFilteredOptions(options);
    }
  }, [searchTerm, options]);
  useEffect(() => {
    setSearchTerm("");
    setDropdownOpen(false);
  }, [value, options]);

  const handleSelect = (option) => {
    if (isMulti) {
      const alreadySelected = value?.some((v) => v.value === option.value);
      const newValue = alreadySelected
        ? value.filter((v) => v.value !== option.value)
        : [...(value || []), option];
      onChange(newValue);
    } else {
      onChange(option);
      setDropdownOpen(false);
    }
  };

  const isSelected = (option) => {
    if (isMulti) return value?.some((v) => v.value === option.value);
    return value?.value === option.value;
  };

  return (
    <div className={`relative w-full ${className}`}>
      <div
        className={`border p-2 rounded-sm text-sm bg-white cursor-pointer flex justify-between items-center ${
          isDisabled ? "bg-gray-100 pointer-events-none" : ""
        }`}
        onClick={() => !isDisabled && setDropdownOpen(!dropdownOpen)}
      >
        <span className="truncate">
          {isMulti
            ? value?.map((v) => v.label).join(", ") || placeholder
            : value?.label || placeholder}
        </span>
        <FaChevronDown
          className={`text-gray-400 ml-2 transition-transform duration-200 ${
            dropdownOpen ? "rotate-180" : "rotate-0"
          }`}
          size={14}
        />
      </div>

      {dropdownOpen && (
        <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-sm max-h-60 overflow-y-auto shadow">
          {options.length > 7 && (
            <input
              type="text"
              className="w-full px-2 py-1 border-b border-gray-200 text-sm"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          )}
          {filteredOptions.length === 0 && (
            <div className="p-2 text-sm text-gray-500">No options found</div>
          )}
          {filteredOptions.map((option) => (
            <div
              key={option.value}
              className={`p-2 text-sm cursor-pointer hover:bg-gray-100 ${
                isSelected(option) ? "bg-blue-100 font-medium" : ""
              }`}
              onClick={() => handleSelect(option)}
            >
              {option.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SelectDropdown;
