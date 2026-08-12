import React, { useEffect, useState } from "react";
import CustomAxios from '@/globalcomponents/CustomAxios';
import { baseurl, initURL } from "../../../BaseUrl";
import { toast } from "react-toastify";
import { RiDeleteBin6Line } from "react-icons/ri";

const ControlsPage = () => {
  const [controls, setControls] = useState([]);
  const [search, setSearch] = useState("");

  const fetchControls = async () => {
    try {
      const res = await CustomAxios.get(`${baseurl}/${initURL}/risk-assessment/control`);
      setControls(res.data);
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleApprove = async (controlID) => {
    const confirmed = window.confirm("Are you sure you want to approve this control?");
    if (!confirmed) return toast.warning("Approval cancelled");

    try {
      const updatedData = { approvedBy: "admin@example.com" }; // Replace with actual user
      const res = await CustomAxios.patch(`${baseurl}/${initURL}/risk-assessment/control/${controlID}`, updatedData);
      if (res.status === 200) {
        toast.success("Control Approved");
        fetchControls();
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleDelete = async (controlID) => {
    const confirmed = window.confirm("Are you sure you want to delete this control?");
    if (!confirmed) return toast.warning("Delete cancelled");

    try {
      const res = await CustomAxios.delete(`${baseurl}/${initURL}/risk-assessment/control/${controlID}`);
      if (res.status === 200) {
        toast.success("Control Deleted");
        fetchControls();
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  useEffect(() => {
    fetchControls();
  }, []);

  const filtered = controls.filter((c) =>
    c.controlTitle.toLowerCase().includes(search.toLowerCase())
  );

  return (

    <div className="min-h-screen py-6 px-4">
      <div className="bg-[#2B245C] text-white text-3xl font-bold py-4 rounded-lg shadow-md text-center mb-6">
        Control Registry{" "}
        <span className="text-green-400 font-semibold">Details ⬇️</span>
      </div>

      <div className="mb-6">
        <input
          type="text"
          placeholder="Search Control"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full p-3 border-2 border-[#2B245C] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2B245C]"
        />
      </div>

      <div className="overflow-x-auto bg-white rounded-xl shadow-lg p-6">
        <table className="w-full border-collapse border rounded-lg border-[#2B245C]">
          <thead className="bg-[#2B245C] text-white text-sm font-semibold border border-[#2B245C]">
            <tr>
              {[
                "S.No.",
                "Creation Date",
                "Function",
                "Area",
                "Control ID",
                "Title",
                "Details",
                "Explanation",
                "Created By",
                "Approved By",
                "Effective Date",
                "Approve",
                "Delete"
              ].map((header, idx) => (
                <th
                  key={idx}
                  className="px-6 py-3 border-b border-gray-300 text-left"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="text-gray-800 text-sm border border-[#2B245C]">
            {filtered.length > 0 ? (
              filtered.map((control, index) => (
                <tr
                  key={control._id}
                  className={`${
                    index % 2 === 0 ? "bg-gray-100" : "bg-gray-50"
                  } hover:bg-gray-200 transition cursor-pointer`}
                >
                  <td className="px-6 py-3 border-b border-gray-300 text-left">
                    {index + 1}
                  </td>
                  <td className="px-6 py-3 border-b border-gray-300 text-left">
                    {new Date(control.createdAt).toLocaleDateString("en-US")}
                  </td>
                  <td className="px-6 py-3 border-b border-gray-300 text-left">
                    {control.controlFunction}
                  </td>
                  <td className="px-6 py-3 border-b border-gray-300 text-left">
                    {control.controlArea}
                  </td>
                  <td className="px-6 py-3 border-b border-gray-300 text-left">
                    {control.controlId}
                  </td>
                  <td className="px-6 py-3 border-b border-gray-300 text-left">
                    {control.controlTitle}
                  </td>
                  <td className="px-6 py-3 border-b border-gray-300 text-left">
                    {control.controlDetails}
                  </td>
                  <td className="px-6 py-3 border-b border-gray-300 text-left">
                    {control.controlExplanation}
                  </td>
                  <td className="px-6 py-3 border-b border-gray-300 text-left">
                    {control.createdBy}
                  </td>
                  <td className="px-6 py-3 border-b border-gray-300 text-left">
                    {control.approvedBy || "------"}
                  </td>
                  <td className="px-6 py-3 border-b border-gray-300 text-left">
                    {control.effectiveDate || "------"}
                  </td>
                  <td className="px-6 py-3 border-b border-gray-300 text-left">
                    {control.approvedBy && control.effectiveDate ? (
                      <span className="text-gray-500 font-medium">Approved</span>
                    ) : (
                      <button
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleApprove(control._id);
                        }}
                      >
                        Approve
                      </button>
                    )}
                  </td>
                  <td className="px-6 py-3 border-b border-gray-300 text-left">
                    <div className="flex items-center">
                      <RiDeleteBin6Line
                        className="text-red-500 hover:text-red-600 cursor-pointer text-2xl transition-colors"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(control._id);
                        }}
                      />
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="13"
                  className="px-6 py-3 text-center border-b border-gray-300 text-gray-500 font-medium"
                >
                  Control List is Empty
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ControlsPage;
