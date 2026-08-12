import { useState, useEffect, useRef } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { ClientDashboardMenu } from "@/routes/DashboardRoutes";
import { baseurl, initURL } from "../../../BaseUrl";
import CustomAxios from "../CustomAxios";
// Mock API function for creating a task (replace with your actual API call)
const createTask = async (taskData) => {
  const endpoint = `${baseurl}/${initURL}/tasks`;
  try {
    const response = await CustomAxios.post(endpoint, taskData);
    return response.data;
  } catch (error) {
    console.error("Error in createTask:", error);
    throw error;
  }
};

export default function TaskCreation() {
  const [summary, setSummary] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("low"); // low, medium, high
  const [status] = useState("TO DO"); // default status, non-editable
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [category, setCategory] = useState("");
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showModuleOptions, setShowModuleOptions] = useState(false);
  const [selectedModuleId, setSelectedModuleId] = useState("");
  const searchContainerRef = useRef(null);
  const [selectedModuleName, setSelectedModuleName] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Validate all required fields, including category
    if (
      !summary ||
      !description ||
      !startDate ||
      !endDate ||
      !category ||
      !selectedModuleName
    ) {
      toast.warn(
        "Please fill in all required fields, including module selection"
      );
      return;
    }

    setLoading(true);
    const taskData = {
      summary,
      description,
      priority,
      status,
      startDate,
      endDate,
      category, // add the category to the data
      moduleName: selectedModuleName, // now sending the module name
    };
    console.log(taskData, "taskData");
    try {
      const response = await createTask(taskData);
        toast.success("Task created successfully");
        // Clear form fields after successful creation
        setSummary("");
        setDescription("");
        setPriority("low");
        setCategory("");
        setStartDate("");
        setEndDate("");
      
    } catch (error) {
      toast.error("Error creating task");
    }
    setLoading(false);
  };
  useEffect(() => {
    function handleClickOutside(event) {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target)
      ) {
        setShowModuleOptions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [searchContainerRef]);


  // NEW: Flatten the nested modules into a single array
  function flattenModules(menuList) {
    let result = [];
    for (const item of menuList) {
      result.push(item);
      if (item.children && item.children.length > 0) {
        result = result.concat(flattenModules(item.children));
      }
    }
    return result;
  }

  // A simple recursive search in your ClientDashboardMenu
  function findModuleById(menuList, id) {
    for (const item of menuList) {
      if (item.id === id) return item;
      if (item.children && item.children.length > 0) {
        const found = findModuleById(item.children, id);
        if (found) return found;
      }
    }
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 ">
      <ToastContainer />
      <div className="w-full  bg-white shadow-2xl rounded-lg p-8">
        <div className=" p-8 rounded-lg shadow-lg text-center mb-8">
          <h1 className="text-4xl font-extrabold text-[#2C3E50]">
            Internal Task Creation
          </h1>
          <p className="text-lg text-[#2C3E50] mt-4">
            Please fill the form below to create a new task.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-flow-row grid-cols-2  gap-4">
            {/* New Category Dropdown */}
            <div className="relative w-full " ref={searchContainerRef}>
              <label className="block text-gray-700 font-medium mb-1">
                Select Module
              </label>
              <input
                type="text"
                placeholder="Search or select module..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowModuleOptions(true); // Show suggestions while typing
                }}
                onFocus={() => setShowModuleOptions(true)} // Show on focus
                className="border p-2 rounded w-full"
              />

              {/* Suggestions Dropdown */}
              {showModuleOptions && (
                <div className="absolute z-10 bg-white border w-full mt-1 rounded shadow max-h-48 overflow-auto">
                  {flattenModules(ClientDashboardMenu)
                    // Filter modules by search text
                    .filter((mod) =>
                      (mod.title || mod.name)
                        .toLowerCase()
                        .includes(searchQuery.toLowerCase())
                    )
                    .map((mod) => (
                      <div
                        key={mod.id}
                        onClick={() => {
                          setSelectedModuleName(mod.title || mod.name);
                          setSearchQuery(mod.title || mod.name);
                          setShowModuleOptions(false);
                        }}
                        className="p-2 hover:bg-gray-100 cursor-pointer"
                      >
                        {mod.title || mod.name}
                      </div>
                    ))}
                </div>
              )}
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full border border-gray-300 p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                <option value="">Select Category</option>
                <option value="bug">Bug</option>
                <option value="feature">Feature</option>
                <option value="improvement">Improvement</option>
                <option value="compliance">Compliance</option>
                <option value="security">Security Incident</option>
                <option value="risk">Risk Assessment</option>
                <option value="audit">Audit Finding</option>
                <option value="policy">Policy Violation</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-1">
              Summary
            </label>
            <input
              type="text"
              placeholder="Enter task summary"
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              className="w-full border border-gray-300 p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
          <div>
            <label className="block text-gray-700 font-medium mb-1">
              Description
            </label>
            <textarea
              placeholder="Enter task description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows="4"
              className="w-full border border-gray-300 p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-6">
            <div className="flex-1">
              <label className="block text-gray-700 font-medium mb-1">
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full border border-gray-300 p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            <div className="flex-1">
              <label className="block text-gray-700 font-medium mb-1">
                Status
              </label>
              <input
                type="text"
                value={status}
                disabled
                className="w-full border border-gray-300 p-3 rounded-md bg-gray-100 text-gray-600"
              />
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-6">
            <div className="flex-1">
              <label className="block text-gray-700 font-medium mb-1">
                Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full border border-gray-300 p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
            <div className="flex-1">
              <label className="block text-gray-700 font-medium mb-1">
                End Date
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full border border-gray-300 p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
          </div>
          <div className="flex justify-center">
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-3 rounded-md transition-colors duration-200"
            >
              {loading ? "Creating Task..." : "Create Task"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
