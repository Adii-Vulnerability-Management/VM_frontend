import { useState } from "react";
import { FaEdit, FaTrashAlt } from "react-icons/fa";
import * as XLSX from "xlsx";

export default function RiskTreatmentPlan() {
  const [risks, setRisks] = useState([]);
  const [formData, setFormData] = useState({
    riskNumber: "",
    title: "",
    type: "T", // T for Threat, O for Opportunity
    riskCause: "",
    impact: {
      quality: "",
      cost: "",
      time: "",
      hse: "",
      infoSecurity: "",
      prototypeProtection: "",
    },
    qualitativeAssessment: { likelihood: "", impact: "", rating: "" }, // Step 2
    step3Assessment: { likelihood: "", impact: "", rating: "" }, // Step 3
    responseStrategy: "",
    response: "",
    owner: "",
    dueDate: "",
    progressTracking: { p: "", d: "", c: "", a: "" },
    status: "",
    comments: "",
  });
  const [editIndex, setEditIndex] = useState(null); // Track the index being edited

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith("impact.")) {
      const field = name.split(".")[1];
      setFormData((prev) => ({
        ...prev,
        impact: { ...prev.impact, [field]: value },
      }));
    } else if (name.startsWith("qualitativeAssessment.")) {
      const field = name.split(".")[1];
      setFormData((prev) => ({
        ...prev,
        qualitativeAssessment: {
          ...prev.qualitativeAssessment,
          [field]: value,
        },
      }));
    } else if (name.startsWith("step3Assessment.")) {
      const field = name.split(".")[1];
      setFormData((prev) => ({
        ...prev,
        step3Assessment: { ...prev.step3Assessment, [field]: value },
      }));
    } else if (name.startsWith("progressTracking.")) {
      const field = name.split(".")[1];
      setFormData((prev) => ({
        ...prev,
        progressTracking: { ...prev.progressTracking, [field]: value },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleAddOrUpdateRisk = () => {
    const step2Rating =
      formData.qualitativeAssessment.likelihood *
        formData.qualitativeAssessment.impact || 0;

    const step3Rating =
      formData.step3Assessment.likelihood * formData.step3Assessment.impact ||
      0;

    const updatedRisk = {
      ...formData,
      qualitativeAssessment: {
        ...formData.qualitativeAssessment,
        rating: step2Rating,
      },
      step3Assessment: {
        ...formData.step3Assessment,
        rating: step3Rating,
      },
    };

    if (editIndex !== null) {
      // Update existing risk
      setRisks((prev) =>
        prev.map((risk, index) => (index === editIndex ? updatedRisk : risk))
      );
      setEditIndex(null); // Reset edit mode
    } else {
      // Add new risk
      setRisks((prev) => [...prev, updatedRisk]);
    }

    // Reset form
    resetForm();
  };
  // Handle file upload and parse Excel data
 const handleFileUpload = (e) => {
   const file = e.target.files[0];
   if (file) {
     const reader = new FileReader();
     reader.onload = (event) => {
       const data = new Uint8Array(event.target.result);
       const workbook = XLSX.read(data, { type: "array" });
       const sheetName = workbook.SheetNames[0];
       const worksheet = workbook.Sheets[sheetName];
       const parsedData = XLSX.utils.sheet_to_json(worksheet);
       const formattedRisks = parsedData.map((row) => ({
         riskNumber: row["Risk Number"] || "",
         title: row["Title"] || "",
         type: row["Type"] || "T",
         riskCause: row["Risk Cause"] || "",
         impact: {
           quality: row["Quality"] || "",
           cost: row["Cost"] || "",
           time: row["Time"] || "",
           hse: row["HSE"] || "",
           infoSecurity: row["Information Security"] || "",
           prototypeProtection: row["Prototype Protection"] || "",
         },
         qualitativeAssessment: {
           likelihood: row["Likelihood (Step 2)"] || "",
           impact: row["Impact (Step 2)"] || "",
           rating:
             (row["Likelihood (Step 2)"] || 0) * (row["Impact (Step 2)"] || 0),
         },
         step3Assessment: {
           likelihood: row["Likelihood (Step 3)"] || "",
           impact: row["Impact (Step 3)"] || "",
           rating:
             (row["Likelihood (Step 3)"] || 0) * (row["Impact (Step 3)"] || 0),
         },
         responseStrategy: row["Response Strategy"] || "",
         response: row["Response"] || "",
         owner: row["Owner"] || "",
         dueDate: row["Due Date"] || "",
         progressTracking: {
           p: row["P"] || "",
           d: row["D"] || "",
           c: row["C"] || "",
           a: row["A"] || "",
         },
         status: row["Status"] || "",
         comments: row["Comments"] || "",
       }));
       setRisks((prevRisks) => [...prevRisks, ...formattedRisks]);
     };
     reader.readAsArrayBuffer(file);
   }
 };

  const resetForm = () => {
    setFormData({
      riskNumber: "",
      title: "",
      type: "T",
      riskCause: "",
      impact: {
        quality: "",
        cost: "",
        time: "",
        hse: "",
        infoSecurity: "",
        prototypeProtection: "",
      },
      qualitativeAssessment: { likelihood: "", impact: "", rating: "" },
      step3Assessment: { likelihood: "", impact: "", rating: "" },
      responseStrategy: "",
      response: "",
      owner: "",
      dueDate: "",
      progressTracking: { p: "", d: "", c: "", a: "" },
      status: "",
      comments: "",
    });
  };

  const handleEdit = (index) => {
    const riskToEdit = risks[index];
    setFormData(riskToEdit); // Populate the form with the selected risk
    setEditIndex(index); // Set edit index
  };

  const handleDelete = (index) => {
    setRisks((prevRisks) => prevRisks.filter((_, i) => i !== index)); // Remove the risk at the specified index
  };

  return (
    <div className="p-6 font-sans">
      {/* Header Section */}
      <h2 className="text-2xl font-bold text-gray-800 mb-4">
        Project Qualitative Risks Treatment Plan
      </h2>
      <p className="text-gray-600 mb-6">
        Step-by-step process to identify risks, assess them qualitatively, and
        define risk treatment strategies.
      </p>
      <p className="text-gray-600 mb-6">
        Import risks via an Excel file or add them manually.
      </p>

      {/* File Import Button */}
      <div className="mb-6">
        <input
          type="file"
          accept=".xlsx, .xls"
          onChange={handleFileUpload}
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
        />
      </div>
      {/* Step 1: Identified Risks */}
      <div className="mb-6">
        <h3 className="text-lg font-bold text-gray-700 mb-4">
          Step 1: Identified Risks
        </h3>
        <div className="grid grid-cols-4 gap-4">
          <div className="flex flex-col">
            <label
              htmlFor="riskNumber"
              className="text-sm font-bold text-gray-600 mb-1"
            >
              Risk Number:
            </label>
            <input
              type="text"
              id="riskNumber"
              name="riskNumber"
              placeholder="Enter Risk Number"
              value={formData.riskNumber}
              onChange={handleInputChange}
              className="border border-gray-300 rounded-md p-2 w-full focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div className="flex flex-col">
            <label
              htmlFor="title"
              className="text-sm font-bold text-gray-600 mb-1"
            >
              Title and Description:
            </label>
            <input
              type="text"
              id="title"
              name="title"
              placeholder="Enter Title and Description"
              value={formData.title}
              onChange={handleInputChange}
              className="border border-gray-300 rounded-md p-2 w-full focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div className="flex flex-col">
            <label
              htmlFor="type"
              className="text-sm font-bold text-gray-600 mb-1"
            >
              Type:
            </label>
            <select
              id="type"
              name="type"
              value={formData.type}
              onChange={handleInputChange}
              className="border border-gray-300 rounded-md p-2 w-full focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              <option value="T">Threat</option>
              <option value="O">Opportunity</option>
            </select>
          </div>

          <div className="flex flex-col">
            <label
              htmlFor="riskCause"
              className="text-sm font-bold text-gray-600 mb-1"
            >
              Risk Cause:
            </label>
            <input
              type="text"
              id="riskCause"
              name="riskCause"
              placeholder="Enter Risk Cause"
              value={formData.riskCause}
              onChange={handleInputChange}
              className="border border-gray-300 rounded-md p-2 w-full focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Impact Section */}
        <div className="mt-6">
          <h4 className="text-lg font-semibold text-gray-700 mb-4">Impact</h4>
          {/* Main Impact Grid */}
          <div className="grid grid-cols-4 gap-4 items-center">
            <div className="flex flex-col">
              <label
                htmlFor="impact.quality"
                className="text-sm font-bold text-gray-600 mb-1"
              >
                Quality (Q):
              </label>
              <input
                type="text"
                id="impact.quality"
                name="impact.quality"
                placeholder="Enter Quality Impact"
                value={formData.impact.quality}
                onChange={handleInputChange}
                className="border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
            <div className="flex flex-col">
              <label
                htmlFor="impact.cost"
                className="text-sm font-bold text-gray-600 mb-1"
              >
                Cost (C):
              </label>
              <input
                type="text"
                id="impact.cost"
                name="impact.cost"
                placeholder="Enter Cost Impact"
                value={formData.impact.cost}
                onChange={handleInputChange}
                className="border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
            <div className="flex flex-col">
              <label
                htmlFor="impact.time"
                className="text-sm font-bold text-gray-600 mb-1"
              >
                Time (T):
              </label>
              <input
                type="text"
                id="impact.time"
                name="impact.time"
                placeholder="Enter Time Impact"
                value={formData.impact.time}
                onChange={handleInputChange}
                className="border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
            <div className="flex flex-col">
              <label
                htmlFor="impact.hse"
                className="text-sm font-bold text-gray-600 mb-1"
              >
                HSE:
              </label>
              <input
                type="text"
                id="impact.hse"
                name="impact.hse"
                placeholder="Enter HSE Impact"
                value={formData.impact.hse}
                onChange={handleInputChange}
                className="border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Additional Impact Details */}
          <div className="mt-6 grid grid-cols-2 gap-6">
            <div className="flex flex-col">
              <label
                htmlFor="impact.infoSecurity"
                className="text-sm font-bold text-gray-600 mb-1"
              >
                Information Security:
              </label>
              <input
                type="text"
                id="impact.infoSecurity"
                name="impact.infoSecurity"
                placeholder="Enter Info Security Impact"
                value={formData.impact.infoSecurity}
                onChange={handleInputChange}
                className="border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
            <div className="flex flex-col">
              <label
                htmlFor="impact.prototypeProtection"
                className="text-sm font-bold text-gray-600 mb-1"
              >
                Prototype Protection:
              </label>
              <input
                type="text"
                id="impact.prototypeProtection"
                name="impact.prototypeProtection"
                placeholder="Enter Prototype Protection Impact"
                value={formData.impact.prototypeProtection}
                onChange={handleInputChange}
                className="border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Step 2: Qualitative Assessment */}
      <div className="mb-6">
        <h3 className="text-lg font-bold text-gray-700 mb-4">
          Step 2: Qualitative Assessment
        </h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="flex flex-col">
            <label
              htmlFor="qualitativeAssessment.likelihood"
              className="text-sm font-bold text-gray-600 mb-1"
            >
              Likelihood (I):
            </label>
            <input
              type="number"
              id="qualitativeAssessment.likelihood"
              name="qualitativeAssessment.likelihood"
              placeholder="Enter Likelihood"
              value={formData.qualitativeAssessment.likelihood}
              onChange={handleInputChange}
              className="border border-gray-300 rounded-md p-2 w-full focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div className="flex flex-col">
            <label
              htmlFor="qualitativeAssessment.impact"
              className="text-sm font-bold text-gray-600 mb-1"
            >
              Impact (P):
            </label>
            <input
              type="number"
              id="qualitativeAssessment.impact"
              name="qualitativeAssessment.impact"
              placeholder="Enter Impact"
              value={formData.qualitativeAssessment.impact}
              onChange={handleInputChange}
              className="border border-gray-300 rounded-md p-2 w-full focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div className="flex flex-col">
            <label
              htmlFor="qualitativeAssessment.rating"
              className="text-sm font-bold text-gray-600 mb-1"
            >
              Rating (R = I x P):
            </label>
            <input
              type="text"
              id="qualitativeAssessment.rating"
              name="qualitativeAssessment.rating"
              placeholder="Auto-Calculated Rating"
              value={
                formData.qualitativeAssessment.likelihood *
                  formData.qualitativeAssessment.impact || ""
              }
              readOnly
              className="border border-gray-300 rounded-md p-2 w-full bg-gray-100 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Step 3: Risk Treatment */}
      <div className="mb-6">
        <h3 className="text-lg font-bold text-gray-700 mb-4">
          Step 3: Risk Treatment
        </h3>
        {/* Grid for Inputs */}
        <div className="grid grid-cols-3 gap-4">
          <div className="flex flex-col">
            <label
              htmlFor="responseStrategy"
              className="text-sm font-bold text-gray-600 mb-1"
            >
              Response Strategy:
            </label>
            <input
              type="text"
              id="responseStrategy"
              name="responseStrategy"
              placeholder="Enter Response Strategy"
              value={formData.responseStrategy}
              onChange={handleInputChange}
              className="border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div className="flex flex-col">
            <label
              htmlFor="response"
              className="text-sm font-bold text-gray-600 mb-1"
            >
              Response:
            </label>
            <input
              type="text"
              id="response"
              name="response"
              placeholder="Enter Response"
              value={formData.response}
              onChange={handleInputChange}
              className="border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div className="flex flex-col">
            <label
              htmlFor="owner"
              className="text-sm font-bold text-gray-600 mb-1"
            >
              Owner:
            </label>
            <input
              type="text"
              id="owner"
              name="owner"
              placeholder="Enter Owner Name"
              value={formData.owner}
              onChange={handleInputChange}
              className="border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Likelihood, Impact, Rating, and Due Date */}
        <div className="grid grid-cols-3 gap-4 mt-4">
          <div className="flex flex-col">
            <label
              htmlFor="step3Assessment.likelihood"
              className="text-sm font-bold text-gray-600 mb-1"
            >
              Likelihood (I):
            </label>
            <input
              type="number"
              id="step3Assessment.likelihood"
              name="step3Assessment.likelihood"
              placeholder="Enter Likelihood"
              value={formData.step3Assessment.likelihood}
              onChange={handleInputChange}
              className="border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div className="flex flex-col">
            <label
              htmlFor="step3Assessment.impact"
              className="text-sm font-bold text-gray-600 mb-1"
            >
              Impact (P):
            </label>
            <input
              type="number"
              id="step3Assessment.impact"
              name="step3Assessment.impact"
              placeholder="Enter Impact"
              value={formData.step3Assessment.impact}
              onChange={handleInputChange}
              className="border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div className="flex flex-col">
            <label
              htmlFor="step3Assessment.rating"
              className="text-sm font-bold text-gray-600 mb-1"
            >
              Rating (R = I x P):
            </label>
            <input
              type="text"
              id="step3Assessment.rating"
              name="step3Assessment.rating"
              placeholder="Auto-Calculated Rating"
              value={
                (parseFloat(formData.step3Assessment.likelihood) || 0) *
                (parseFloat(formData.step3Assessment.impact) || 0)
              }
              readOnly
              className="border border-gray-300 rounded-md p-2 w-full bg-gray-100 focus:outline-none"
            />
          </div>
        </div>

        {/* Due Date */}
        <div className="flex flex-col mt-4">
          <label
            htmlFor="dueDate"
            className="text-sm font-bold text-gray-600 mb-1"
          >
            Due Date (dd-mm-yyyy):
          </label>
          <input
            type="date"
            id="dueDate"
            name="dueDate"
            value={formData.dueDate}
            onChange={handleInputChange}
            className="border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Step 4: Progress Tracking */}

      <div className="mb-6">
        <h3 className="text-lg font-bold text-gray-700 mb-4">
          Step 4: Progress Tracking
        </h3>
        {/* Grid for Progress Tracking */}
        <div className="grid grid-cols-4 gap-4">
          <div className="flex flex-col">
            <div className="grid grid-cols-4 gap-4">
              <div className="flex flex-col">
                <label
                  htmlFor="progressTracking.p"
                  className="text-sm font-bold text-gray-600 mb-1"
                >
                  Plan (P):
                </label>
                <select
                  id="progressTracking.p"
                  name="progressTracking.p"
                  value={formData.progressTracking.p}
                  onChange={handleInputChange}
                  className="border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="">Select Plan</option>
                  <option value="Plan">Plan</option>
                </select>
              </div>
              <div className="flex flex-col">
                <label
                  htmlFor="progressTracking.d"
                  className="text-sm font-bold text-gray-600 mb-1"
                >
                  Do (D):
                </label>
                <select
                  id="progressTracking.d"
                  name="progressTracking.d"
                  value={formData.progressTracking.d}
                  onChange={handleInputChange}
                  className="border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="">Select Do</option>
                  <option value="Do">Do</option>
                </select>
              </div>
              <div className="flex flex-col">
                <label
                  htmlFor="progressTracking.c"
                  className="text-sm font-bold text-gray-600 mb-1"
                >
                  Check (C):
                </label>
                <select
                  id="progressTracking.c"
                  name="progressTracking.c"
                  value={formData.progressTracking.c}
                  onChange={handleInputChange}
                  className="border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="">Select Check</option>
                  <option value="Check">Check</option>
                </select>
              </div>
              <div className="flex flex-col">
                <label
                  htmlFor="progressTracking.a"
                  className="text-sm font-bold text-gray-600 mb-1"
                >
                  Act (A):
                </label>
                <select
                  id="progressTracking.a"
                  name="progressTracking.a"
                  value={formData.progressTracking.a}
                  onChange={handleInputChange}
                  className="border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="">Select Act</option>
                  <option value="Act">Act</option>
                </select>
              </div>
            </div>
          </div>

          <div className="flex flex-col">
            <label
              htmlFor="status"
              className="text-sm font-bold text-gray-600 mb-1"
            >
              Status:
            </label>
            <input
              type="text"
              id="status"
              name="status"
              placeholder="Enter Status"
              value={formData.status}
              onChange={handleInputChange}
              className="border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div className="col-span-2 flex flex-col">
            <label
              htmlFor="comments"
              className="text-sm font-bold text-gray-600 mb-1"
            >
              Comments:
            </label>
            <textarea
              id="comments"
              name="comments"
              placeholder="Enter Comments"
              value={formData.comments}
              onChange={handleInputChange}
              className="border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none"
              rows="3"
            ></textarea>
          </div>
        </div>
      </div>

      {/* Add Button */}
      <button
        onClick={handleAddOrUpdateRisk}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
      >
        {editIndex !== null ? "Update Risk" : "Add Risk"}
      </button>

      {/* Risks Table */}
      <div className="mt-8">
        <h3 className="text-lg font-bold text-gray-800 mb-4">
          Identified Risks and Impact Analysis Table{" "}
        </h3>
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse bg-white border border-gray-300 rounded-lg shadow-lg">
            <thead className="bg-blue-800 text-white text-sm">
              <tr>
                <th
                  colSpan="4"
                  className="py-2 px-4 border border-gray-300 text-center bg-blue-700 font-semibold"
                >
                  Step 1 - Identified Risks
                </th>
                <th
                  colSpan="6"
                  className="py-2 px-4 border border-gray-300 text-center bg-blue-700 font-semibold text-white"
                >
                  Impact
                </th>
                <th
                  colSpan="3"
                  className="py-2 px-4 border border-gray-300 text-center bg-purple-500 font-semibold text-white"
                >
                  Step 2 - Qualitative Assessment
                </th>
                <th
                  colSpan="7"
                  className="py-2 px-4 border border-gray-300 text-center bg-blue-700 font-semibold"
                >
                  Step 3 - Risk Treatment
                </th>
                <th
                  colSpan="6"
                  className="py-2 px-4 border border-gray-300 text-center bg-purple-300 font-semibold text-black"
                >
                  Step 4 - Progress Tracking
                </th>
                <th
                  colSpan="1"
                  className="py-2 px-4 border border-gray-300 text-center bg-purple-300 font-semibold text-black"
                ></th>
              </tr>
              <tr className="bg-blue-600">
                <th className="py-3 px-4 border border-gray-300 text-left">
                  Risk #
                </th>
                <th className="py-3 px-4 border border-gray-300 text-left">
                  Title and Description
                </th>
                <th className="py-3 px-4 border border-gray-300 text-left">
                  Type
                </th>
                <th className="py-3 px-4 border border-gray-300 text-left">
                  Risk Cause
                </th>
                <th className="py-3 px-4 border border-gray-300 text-left">
                  Q
                </th>
                <th className="py-3 px-4 border border-gray-300 text-left">
                  C
                </th>
                <th className="py-3 px-4 border border-gray-300 text-left">
                  T
                </th>
                <th className="py-3 px-4 border border-gray-300 text-left">
                  HSE
                </th>
                <th className="py-3 px-4 border bg-red-600 border-gray-300 text-left">
                  Information Security
                </th>
                <th className="py-3 px-4 border bg-red-600 border-gray-300 text-left">
                  Prototype Protection
                </th>
                <th className="py-3 px-4 border border-gray-300 text-left">
                  I
                </th>
                <th className="py-3 px-4 border border-gray-300 text-left">
                  P
                </th>
                <th className="py-3 px-4 border border-gray-300 text-left">
                  R = I x P
                </th>
                <th className="py-3 px-4 border border-gray-300 text-left">
                  Response Strategy
                </th>
                <th className="py-3 px-4 border border-gray-300 text-left">
                  Response
                </th>
                <th className="py-3 px-4 border border-gray-300 text-left">
                  Owner
                </th>
                <th className="py-3 px-4 border border-gray-300 text-left">
                  Due Date
                </th>
                <th className="py-3 px-4 border border-gray-300 text-left">
                  I
                </th>
                <th className="py-3 px-4 border border-gray-300 text-left">
                  P
                </th>
                <th className="py-3 px-4 border border-gray-300 text-left">
                  R = I x P
                </th>
                <th className="py-3 px-4 border border-gray-300 text-left">
                  P
                </th>
                <th className="py-3 px-4 border border-gray-300 text-left">
                  D
                </th>
                <th className="py-3 px-4 border border-gray-300 text-left">
                  C
                </th>
                <th className="py-3 px-4 border border-gray-300 text-left">
                  A
                </th>
                <th className="py-3 px-4 border border-gray-300 text-left">
                  Status
                </th>
                <th className="py-3 px-4 border border-gray-300 text-left">
                  Comments
                </th>
                <th className="py-3 px-4 border border-gray-300 text-left">
                  Edit/Delete
                </th>
              </tr>
            </thead>

            <tbody>
              {risks.map((risk, index) => (
                <tr
                  key={index}
                  className={`${
                    index % 2 === 0 ? "bg-gray-50" : "bg-white"
                  } hover:bg-gray-100`}
                >
                  <td className="py-3 px-4 border border-gray-300">
                    {risk.riskNumber || "-"}
                  </td>
                  <td className="py-3 px-4 border border-gray-300">
                    {risk.title || "-"}
                  </td>
                  <td className="py-3 px-4 border border-gray-300">
                    {risk.type || "-"}
                  </td>
                  <td className="py-3 px-4 border border-gray-300">
                    {risk.riskCause || "-"}
                  </td>
                  <td className="py-3 px-4 border border-gray-300">
                    {risk.impact.quality || "-"}
                  </td>
                  <td className="py-3 px-4 border border-gray-300">
                    {risk.impact.cost || "-"}
                  </td>
                  <td className="py-3 px-4 border border-gray-300">
                    {risk.impact.time || "-"}
                  </td>
                  <td className="py-3 px-4 border border-gray-300">
                    {risk.impact.hse || "-"}
                  </td>
                  <td className="py-3 px-4 border border-gray-300">
                    {risk.impact.infoSecurity || "-"}
                  </td>
                  <td className="py-3 px-4 border border-gray-300">
                    {risk.impact.prototypeProtection || "-"}
                  </td>
                  <td className="py-3 px-4 border border-gray-300">
                    {risk.qualitativeAssessment.likelihood || "-"}
                  </td>
                  <td className="py-3 px-4 border border-gray-300">
                    {risk.qualitativeAssessment.impact || "-"}
                  </td>
                  <td className="py-3 px-4 border border-gray-300">
                    {risk.qualitativeAssessment.rating || "-"}
                  </td>

                  <td className="py-3 px-4 border border-gray-300">
                    {risk.responseStrategy || "-"}
                  </td>
                  <td className="py-3 px-4 border border-gray-300">
                    {risk.response || "-"}
                  </td>
                  <td className="py-3 px-4 border border-gray-300">
                    {risk.owner || "-"}
                  </td>
                  <td className="py-3 px-4 border border-gray-300">
                    {risk.dueDate || "-"}
                  </td>
                  <td className="py-3 px-4 border border-gray-300">
                    {risk.step3Assessment.likelihood || "-"}
                  </td>
                  <td className="py-3 px-4 border border-gray-300">
                    {risk.step3Assessment.impact || "-"}
                  </td>
                  <td className="py-3 px-4 border border-gray-300">
                    {risk.step3Assessment.rating || "-"}
                  </td>
                  <td className="py-3 px-4 border border-gray-300">
                    {risk.progressTracking?.p || "-"}
                  </td>
                  <td className="py-3 px-4 border border-gray-300">
                    {risk.progressTracking?.d || "-"}
                  </td>
                  <td className="py-3 px-4 border border-gray-300">
                    {risk.progressTracking?.c || "-"}
                  </td>
                  <td className="py-3 px-4 border border-gray-300">
                    {risk.progressTracking?.a || "-"}
                  </td>

                  <td className="py-3 px-4 border border-gray-300">
                    {risk.status || "-"}
                  </td>
                  <td className="py-3 px-4 border border-gray-300">
                    {risk.comments || "-"}
                  </td>
                  {/* Buttons for Edit and Delete */}
                  <td className="py-3 px-4 border border-gray-300 flex space-x-2">
                    <button
                      onClick={() => handleEdit(index)}
                      className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 flex items-center"
                    >
                      <FaEdit className="mr-1" />
                    </button>
                    <button
                      onClick={() => handleDelete(index)}
                      className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 flex items-center"
                    >
                      <FaTrashAlt className="mr-1" />
                    </button>
                  </td>
                </tr>
              ))}
              {risks.length === 0 && (
                <tr>
                  <td
                    className="py-4 px-4 border border-gray-300 text-center text-gray-500"
                    colSpan="24"
                  >
                    No risks added yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
