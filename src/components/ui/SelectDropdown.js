import CustomAxios from "@/globalcomponents/CustomAxios";
import { useEffect, useState } from "react";
import { FaChevronDown } from "react-icons/fa";
import { FiArrowDown } from "react-icons/fi";
import { baseurl, initURL } from "../../../BaseUrl";
const apiPrefix = process.env.NEXT_PUBLIC_API_PREFIX || "${initURL}";

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
          option.label.toLowerCase().includes(searchTerm.toLowerCase()),
        ),
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

// export const CustomUserDropdown = ({
//   value,
//   onChange,
//   name,
//   label = "label",
//   placeholder = "Select a user…",
//   getOptionLabel = (user) =>
//     user.user_name || `${user.first_name} ${user.last_name}`, // default
//   Disabled = false, // default: no option is disabled
// }) => {
//   const [users, setUsers] = useState([]);

//   useEffect(() => {
//     CustomAxios.get(
//       `/${initURL}/apiv1/users`
//     )
//       .then((res) => setUsers(res.data))
//       .catch((err) => {
//         console.error("Error fetching employees:", err);
//       });
//   }, []);

//   const handleSelectChange = (e) => {
//     const newValue = e || null;
//     if (name) {
//       onChange(newValue); // Pass name and value like handleChange(name, value)
//     } else {
//       onChange(newValue); // Fallback in case `name` is not provided
//     }
//   };

//   return (
//     <div className="mb-4 relative">
//       <label className="block text-sm font-semibold text-gray-700 mb-1">
//         {label}
//       </label>
//       <select
//         value={value ?? ""}
//         name={name ?? ""}
//         onChange={handleSelectChange}
//         className="
//         w-full border border-gray-300 bg-white pl-3 pr-10 py-2
//         rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#2B245C] focus:border-transparent transition"
//         disabled={Disabled}
//       >
//         <option value="">{placeholder}</option>
//         {users.map((u) => (
//           <option key={u._id} value={u._id} disabled={Disabled}>
//             {getOptionLabel(u)}
//           </option>
//         ))}
//       </select>
//       {/* <FiArrowDown
//         className="absolute right-3 top-1/2 transform  text-gray-400 pointer-events-none"
//         size={16}
//       /> */}
//     </div>
//   );
// };

export const CustomUserDropdown = ({
  value,
  onChange,
  name,
  label = "label",
  placeholder = "Select a user…",
  // getOptionLabel = (user) => user.name || user.email || "",
  getOptionLabel = (user) => user.user_name || "",

  disabled = false,
}) => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    CustomAxios.get(`/${initURL}/apiv1/users/db`)
      .then((res) => {
        const userList = Array.isArray(res.data)
          ? res.data
          : Array.isArray(res.data?.data)
            ? res.data.data
            : Array.isArray(res.data?.users)
              ? res.data.users
              : [];

        setUsers(userList);
      })
      .catch((err) => {
        console.error("Error fetching employees:", err);
        setUsers([]);
      });
  }, []);

  const handleSelectChange = (e) => {
    onChange?.(e);
  };

  return (
    <div className="mb-4 relative">
      <label className="block text-sm font-semibold text-gray-700 mb-1">
        {label}
      </label>
      <select
        value={value ?? ""}
        name={name ?? ""}
        onChange={handleSelectChange}
        className="
          w-full border border-gray-300 bg-white pl-3 pr-10 py-2
          rounded-md shadow-sm focus:outline-none focus:ring-2
          focus:ring-[#2B245C] focus:border-transparent transition
        "
        disabled={disabled}
      >
        <option value="">{placeholder}</option>
        {Array.isArray(users) &&
          users.map((u) => (
            <option key={u._id} value={u._id}>
              {getOptionLabel(u)}
            </option>
          ))}
      </select>
    </div>
  );
};

export const CustomTeamDropdown = ({
  value = [], // array of selected IDs
  onChange, // (name, newValue)
  name,
  label = "Team",
  placeholder = "Select team…",
  multiple = false, // <-- new
}) => {
  const [teams, setTeams] = useState([]);

  useEffect(() => {
    CustomAxios.get(`${baseurl}/${initURL}/teams`)
      .then((res) => setTeams(res.data))
      .catch((err) => console.error("Error fetching teams:", err));
  }, []);

  const handleSelectChange = (e) => {
    let newValue;
    if (multiple) {
      // collect all selected options
      newValue = Array.from(e.target.selectedOptions, (opt) => opt.value);
    } else {
      newValue = e.target.value || null;
    }
    onChange(name, newValue);
  };

  return (
    <div className="mb-4 relative">
      <label className="block text-sm font-semibold text-gray-700 mb-1">
        {label}
      </label>
      <select
        multiple={multiple}
        value={multiple ? value : (value ?? "")}
        onChange={handleSelectChange}
        className="
        appearance-none w-full border border-gray-300 bg-white
        pl-3 pr-10 py-2 rounded-md shadow-sm
        focus:outline-none focus:ring-2 focus:ring-[#2B245C]
        focus:border-transparent transition
      "
      >
        {!multiple && <option value="">{placeholder}</option>}
        {teams.map((t) => (
          <option key={t._id} value={t._id}>
            {t.name}
          </option>
        ))}
      </select>
      <FiArrowDown
        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none"
        size={16}
      />
    </div>
  );
};
