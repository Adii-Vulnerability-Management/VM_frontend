import { useEffect, useState } from "react";
import {
  FaSearch,
  FaEdit,
  FaTrash,
  FaTimes,
  FaPlus,
  FaTrashAlt,
} from "react-icons/fa";
import Dialog from "../Dialog";
import AssignEmployeeSearch from "./AssignEmployeeSearch";
import useGlobalLoading from "@/globalcomponents/loader/useGlobalLoading";
import CustomAxios from "@/globalcomponents/CustomAxios";
import { baseurl, initURL } from "../../../BaseUrl";
import dayjs from "dayjs";
import { toast } from "react-toastify";

const Assign = () => {
  const [selectLocationDialog, setSelectLocationDialog] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [assignDate, setAssignDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [locationId, setLocationId] = useState("");
  const [locations, setLocations] = useState([]);
  const [addedLocations, setAddedLocations] = useState([]);
  const { showLoader, hideLoader } = useGlobalLoading();
  const [allreadyAssignedLocationIds, setallreadyAssignedLocationIds] = useState([])
  const fetchAssignedTasks = async () => {
    // setLoading(true);
    try {
      const response = await CustomAxios.get(
        `${baseurl}/${initURL}/tisax-team-assignment`
      );
      console.log("API Response:", response.data);

      const locations = response.data?.data || [];
      let IDs = locations.map((l) => l.locationId._id)
      setallreadyAssignedLocationIds(IDs)

    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch data.");
    }
  };

  const fetchLocations = async () => {
    if (!locationId.trim()) return;
    showLoader();
    try {
      const response = await CustomAxios.get(
        `${baseurl}/${initURL}/tisax?location_id=${locationId}&page=1&limit=10`
      );
      setLocations(response.data.docs);
    } catch (error) {
      console.error("Error fetching locations:", error);
    } finally {
      hideLoader();
    }
  };

  const handleSearch = () => {
    fetchLocations();
  };

  const handleSelectLocation = (location) => {
    setSelectedLocation(location);
    setAssignDate(dayjs().format("YYYY-MM-DD"));
    setEndDate("");
    setLocations([]);
  };

  const handleSubmit = () => {
    if (!selectedLocation || !assignDate || !endDate) {
      toast.warning("Please select a location and fill in both dates.")
      return;
    }
   

    setAddedLocations([
      ...addedLocations,
      {
        ...selectedLocation,
        assignDate,
        endDate,
      },
    ]);


    setSelectLocationDialog(false);
  };

  const handleRemoveLocation = (index) => {
    setAddedLocations(addedLocations.filter((_, i) => i !== index));
  };

  const handleEditLocation = (location, index) => {
    setSelectedLocation(location);
    setAssignDate(location.assignDate);
    setEndDate(location.endDate);
    setAddedLocations(addedLocations.filter((_, i) => i !== index));
    setSelectLocationDialog(true);
  };

  useEffect(() => {
    fetchAssignedTasks()
  }, [])

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[#2B245C]">Select Location</h1>
        <button
          className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 flex items-center space-x-2 transition"
          onClick={() => setSelectLocationDialog(true)}
        >
          <FaPlus /> <span>Add Location</span>
        </button>
      </div>

      {/* Dialog for Selecting Location & Assigning Dates */}
      <Dialog
        isOpen={selectLocationDialog}
        onClose={() => setSelectLocationDialog(false)}
      >
        <div className="p-8 bg-white rounded-2xl shadow-2xl w-full max-w-3xl mx-auto relative">
          <h2 className="text-2xl font-bold text-[#2B245C] mb-6 text-center">
            {selectedLocation ? "Selected Location" : "Search Location"}
          </h2>

          {!selectedLocation ? (
            <div>
              {/* Search Bar */}
              <div className="flex items-center space-x-3 w-full">
                <input
                  type="text"
                  value={locationId}
                  onChange={(e) => setLocationId(e.target.value)}
                  placeholder="Enter Location ID"
                  className="border border-gray-300 rounded-xl p-3 w-full focus:ring-2 focus:ring-[#3F2073] text-lg"
                />
                <button
                  onClick={handleSearch}
                  className="bg-[#3F2073] hover:bg-[#2B245C] text-white px-5 py-3 rounded-xl flex items-center text-lg transition"
                >
                  <FaSearch className="mr-2" /> Search
                </button>
              </div>

              {/* Location Results */}
              <div className="mt-6 space-y-4 max-h-60 overflow-y-auto">
                {locations.length > 0 ? (
                  locations
                    .filter(
                      (l) =>
                        l.vda_version == "6.0.3" &&
                        !allreadyAssignedLocationIds.includes(l._id)
                    )
                    .map((loc) => (
                      <div
                        key={loc._id}
                        onClick={() => handleSelectLocation(loc)}
                        className="p-4 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-100 transition shadow-sm"
                      >
                        <p className="font-semibold text-gray-800 text-lg">
                          {loc.location_id} - {loc.locationtype}
                        </p>
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Address:</span>{" "}
                          {loc.company_address}
                        </p>
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Version:</span>{" "}
                          {loc.vda_version}
                        </p>
                      </div>
                    ))
                ) : (
                  <p className="text-gray-500 text-md mt-4 text-center">
                    No results found.
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div>
              {/* Selected Location */}
              <div className="bg-gray-100 p-5 rounded-xl shadow-md">
                <p className="font-semibold text-gray-800 text-lg">
                  {selectedLocation.location_id}
                </p>
                <p className="text-md text-gray-600">
                  <span className="font-medium">Address:</span>{" "}
                  {selectedLocation.company_address}
                </p>
              </div>

              {/* Date Inputs */}
              <div className="mt-6 grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-md font-semibold text-gray-700 mb-1">
                    Assign Date
                  </label>
                  <input
                    type="date"
                    value={assignDate}
                    onChange={(e) => setAssignDate(e.target.value)}
                    className="border border-gray-300 rounded-xl p-3 w-full focus:ring-2 focus:ring-[#3F2073] text-lg"
                  />
                </div>

                <div>
                  <label className="block text-md font-semibold text-gray-700 mb-1">
                    Deadline
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="border border-gray-300 rounded-xl p-3 w-full focus:ring-2 focus:ring-[#3F2073] text-lg"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-8 flex justify-end space-x-4">
                <button
                  onClick={() => setSelectLocationDialog(false)}
                  className="px-5 py-3 bg-gray-300 text-gray-700 rounded-xl hover:bg-gray-400 transition text-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  className="px-5 py-3 bg-[#3F2073] text-white rounded-xl hover:bg-[#2B245C] transition text-lg"
                >
                  Submit
                </button>
              </div>
            </div>
          )}
        </div>
      </Dialog>

      {/* Selected Locations Table */}
      <div className="overflow-x-auto mt-4 rounded-xl shadow-lg mb-4">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-[#3F2073]">
            <tr className="text-center">
              {["Location", "Assign Date", "Deadline", "Actions"].map(
                (header) => (
                  <th
                    key={header}
                    className="px-6 py-3 text-sm font-semibold text-white tracking-wider border-b border-blue-700"
                  >
                    {header}
                  </th>
                )
              )}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {addedLocations.length > 0 ? (
              addedLocations.map((loc, index) => (
                <tr
                  key={index}
                  className="hover:bg-blue-50 transition-colors duration-200 text-center"
                >
                  <td className="px-6 py-5 text-sm text-gray-700">
                    {loc.location_id}
                  </td>
                  <td className="px-6 py-5 text-sm text-gray-700">
                    {loc.assignDate}
                  </td>
                  <td className="px-6 py-5 text-sm text-gray-700">
                    {loc.endDate}
                  </td>
                  <td className="px-6 py-5 text-sm text-gray-700 flex justify-center space-x-4">
                    <button
                      onClick={() => handleEditLocation(loc, index)}
                      className="text-yellow-500 hover:text-yellow-600"
                      title="Edit"
                    >
                      <FaEdit fontSize={20} />
                    </button>
                    <button
                      onClick={() => handleRemoveLocation(index)}
                      className="text-red-600 hover:text-red-800"
                      title="Remove"
                    >
                      <FaTrashAlt fontSize={20} />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={4}
                  className="px-6 py-5 text-sm text-gray-500 text-center"
                >
                  No locations selected
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Assign Employee Search Component */}
      <AssignEmployeeSearch
        selectedLocation={selectedLocation}
        assignDate={assignDate}
        endDate={endDate}
        setAddedLocations={setAddedLocations}
        setLocations={setLocations}
        setAssignDate={setAssignDate}
        setEndDate={setEndDate}
      />
    </div>
  );
};

export default Assign;
