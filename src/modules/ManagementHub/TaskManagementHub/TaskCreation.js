import { useState, useEffect, useRef } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { ClientDashboardMenu } from "@/components/layout/SideNavBar";
import { baseurl, initURL } from "@/config/config";
import CustomAxios from "@/config/CustomAxios";
import { can, guard } from "@/auth/auth-permissions";
import { useRouter } from "next/router";

// Mock API function for creating a task (replace with your actual API call)
export const createTask = async (taskData) => {
  const endpoint = `${baseurl}/${initURL}/tasks`;
  try {
    const response = await CustomAxios.post(endpoint, taskData);
    return response.data;
  } catch (error) {
    console.error("Error in createTask:", error);
    throw error;
  }
};

export default function TaskCreation({
  moduleName: propModuleName = "",
  category: propCategory = "",
  summary: propSummary = "",
  description: propDescription = "",
  priority: propPriority = "low",
  startDate: propStartDate = "",
  endDate: propEndDate = "",
  // you could also accept a callback:
  onCreated = () => {},
}) {
  const [selectedModuleName, setSelectedModuleName] = useState(propModuleName);
  const [category, setCategory] = useState(propCategory);
  const [summary, setSummary] = useState(propSummary);
  const [description, setDescription] = useState(propDescription);
  const [priority, setPriority] = useState(propPriority);
  const [startDate, setStartDate] = useState(propStartDate);
  const [endDate, setEndDate] = useState(propEndDate);
  // status still hard-coded:
  const [status] = useState("TO DO");

  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showModuleOptions, setShowModuleOptions] = useState(false);
  const [selectedModuleId, setSelectedModuleId] = useState("");
  const searchContainerRef = useRef(null);

  const router = useRouter();

  // Permissions
  const canView = can("management_hub.read");
  const canCreate = can("management_hub.create");
  const canUpdate = can("management_hub.update");
  const canDelete = can("management_hub.delete");
  const canManage = can("management_hub.manage");

  useEffect(() => {
    if (propModuleName) setSelectedModuleName(propModuleName);
    if (propCategory) setCategory(propCategory);
    if (propSummary) setSummary(propSummary);
    if (propDescription) setDescription(propDescription);
    if (propPriority) setPriority(propPriority);
    if (propStartDate) setStartDate(propStartDate);
    if (propEndDate) setEndDate(propEndDate);
  }, [
    propModuleName,
    propCategory,
    propSummary,
    propDescription,
    propPriority,
    propStartDate,
    propEndDate,
  ]);

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
        "Please fill in all required fields, including module selection",
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
    <div className="pt-5 px-2">
      <ToastContainer />

      <div>
        <section className="rounded-2xl border border-[#2B245C] bg-white p-6 shadow-lg hover:shadow-2xl transition-shadow duration-300">
          {/* Header */}
          <div className="mb-5">
            <h2 className="text-2xl font-semibold text-[#2B245C]">
              Internal Task Creation
            </h2>
            <p className="mt-1 text-sm text-gray-700">
              Please fill the form below to create a new task.
            </p>
          </div>

          <form onSubmit={(e) => guard(canCreate, router, () => handleSubmit(e))} className="space-y-6">
            <div className="grid grid-flow-row grid-cols-2  gap-4">
              {/* New Category Dropdown */}
              <div className="relative w-full " ref={searchContainerRef}>
                <label className="block text-xs font-semibold text-gray-700 mb-2">
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
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-indigo-200 transition-all"
                />

                {/* Suggestions Dropdown */}
                {showModuleOptions && (
                  <div className="absolute z-10 bg-white border w-full mt-1 rounded shadow max-h-48 overflow-auto">
                    {flattenModules(ClientDashboardMenu)
                      // Filter modules by search text
                      .filter((mod) =>
                        (mod.title || mod.name)
                          .toLowerCase()
                          .includes(searchQuery.toLowerCase()),
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
                <label className="block text-xs font-semibold text-gray-700 mb-2">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 focus:border-indigo-500 focus:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-indigo-200 transition-all"
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
                  <option value="incident">Evidence Collection</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-2">
                Summary
              </label>
              <input
                type="text"
                placeholder="Enter task summary"
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-indigo-200 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-2">
                Description
              </label>
              <textarea
                placeholder="Enter task description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows="4"
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-indigo-200 transition-all"
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-6">
              <div className="flex-1">
                <label className="block text-xs font-semibold text-gray-700 mb-2">
                  Priority
                </label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 focus:border-indigo-500 focus:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-indigo-200 transition-all"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
              <div className="flex-1">
                <label className="block text-xs font-semibold text-gray-700 mb-2">
                  Status
                </label>
                <input
                  type="text"
                  value={status}
                  disabled
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-indigo-200 transition-all"
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-6">
              <div className="flex-1">
                <label className="block text-xs font-semibold text-gray-700 mb-2">
                  Start Date
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-indigo-200 transition-all"
                />
              </div>
              <div className="flex-1">
                <label className="block text-xs font-semibold text-gray-700 mb-2">
                  End Date
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-indigo-200 transition-all"
                />
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center gap-2 rounded-lg bg-[#2B245C] px-6 py-2.5 text-sm font-semibold text-white shadow-md hover:shadow-lg hover:bg-opacity-90 disabled:opacity-60 transition-all"
              >
                {loading ? "Creating Task..." : "Create Task"}
              </button>
            </div>
          </form>
        </section>
      </div>
    </div>
  );
}
