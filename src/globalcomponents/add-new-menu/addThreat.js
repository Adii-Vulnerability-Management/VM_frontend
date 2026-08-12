"use client";
import { useState } from "react";
import CustomAxios from "@/globalcomponents/CustomAxios";
import { toast } from "react-toastify";
import { baseurl, initURL } from "../../../BaseUrl";

const ThreatsTab = ({ handleShow }) => {
  const [threatName, setThreatName] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await CustomAxios.post(
        `${baseurl}/${initURL}/risk-assessment/utility`,
        { threatName }
      );
      toast.success(response.data.message || "Threat added successfully!");
      setThreatName("");
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Error adding threat"
      );
    }
  };

  return (
    <form
      className="p-6 border rounded-lg bg-gray-50 shadow-md"
      onSubmit={handleSubmit}
    >
      <div className="mb-4">
        <h2 className="text-xl font-semibold mb-4">
          Threat Name
        </h2>
        <input
          type="text"
          name="threatName"
          className="w-full p-2 border border-gray-300 rounded-md focus:ring-purple-600 focus:border-purple-600"
          placeholder="Enter Threat Name"
          value={threatName}
          onChange={(e) => {
            const capitalized = e.target.value
              .split(" ")
              .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
              .join(" ");
            setThreatName(capitalized);
          }}
          required
        />
      </div>

      <div className="flex space-x-4">
        <button
          type="submit"
          className="bg-[#2B245C] text-white px-4 py-2 rounded hover:bg-[#1d193f]"
        >
          Add Threat
        </button>
        <button
          type="button"
          className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
          onClick={() => handleShow(true, "threats")}
        >
          Upload Existing List
        </button>
      </div>
    </form>
  );
};

export default ThreatsTab;
